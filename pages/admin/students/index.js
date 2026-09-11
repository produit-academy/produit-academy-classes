// pages/admin/students/index.js
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { withAuth } from '../../../lib/auth';
import { apiGet, apiPost } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';

function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Action Modal State
    const [actionModal, setActionModal] = useState(null); // { student, action }
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [alert, setAlert] = useState(null);

    const loadStudents = useCallback(() => {
        setLoading(true);
        apiGet(`/api/classes/admin/students/?search=${encodeURIComponent(search)}`)
            .then(setStudents)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search]);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    const openActionModal = (student, action) => {
        setActionModal({ student, action });
        setReason('');
    };

    const closeActionModal = () => {
        if (processing) return;
        setActionModal(null);
        setReason('');
    };

    const handleConfirmAction = async () => {
        if (!actionModal) return;
        setProcessing(true);
        setAlert(null);

        try {
            const res = await apiPost(`/api/classes/admin/students/${actionModal.student.id}/action/`, {
                action: actionModal.action,
                reason: reason.trim(),
            });
            const data = await res.json();
            if (res.ok) {
                setAlert({ type: 'success', text: data.message || 'Action executed successfully.' });
                setActionModal(null);
                setReason('');
                loadStudents();
            } else {
                setAlert({ type: 'error', text: data.error || 'Failed to perform action.' });
            }
        } catch (err) {
            console.error(err);
            setAlert({ type: 'error', text: 'Network error or server unavailable.' });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (student) => {
        const status = student.account_status || (student.is_active ? 'active' : 'hold');
        if (status === 'banned') {
            return <span className="badge badge-banned">Banned</span>;
        }
        if (status === 'hold' || !student.is_active) {
            return <span className="badge badge-hold">On Hold</span>;
        }
        return <span className="badge badge-active">Active</span>;
    };

    const getModalConfig = () => {
        if (!actionModal) return {};
        const { action, student } = actionModal;
        switch (action) {
            case 'delete':
                return {
                    title: 'Delete Student Account',
                    color: 'var(--accent-red, #e74c3c)',
                    confirmText: 'Confirm Permanent Deletion',
                    description: `Are you sure you want to delete ${student.name}'s account? This action cannot be undone.`,
                    warning: 'A confirmation notice will be automatically emailed to ' + student.email + ' before the account and its records are deleted.',
                };
            case 'hold':
                return {
                    title: 'Place Student on Hold',
                    color: '#d97706',
                    confirmText: 'Place on Hold',
                    description: `Temporarily suspend access for ${student.name}. The student will not be able to log in or join sessions while on hold.`,
                    warning: 'A notification email with your reason will be sent to ' + student.email + '.',
                };
            case 'ban':
                return {
                    title: 'Ban Student Account',
                    color: '#dc2626',
                    confirmText: 'Ban Account',
                    description: `Block all access for ${student.name}. Active sessions will be terminated immediately.`,
                    warning: 'An account suspension notice will be emailed to ' + student.email + '.',
                };
            case 'activate':
                return {
                    title: 'Reactivate Student Account',
                    color: '#16a34a',
                    confirmText: 'Reactivate Account',
                    description: `Restore platform and class access for ${student.name}.`,
                    warning: 'A reactivation confirmation email will be sent to ' + student.email + '.',
                };
            default:
                return {};
        }
    };

    const modalConfig = getModalConfig();

    return (
        <DashboardLayout title="Manage Students">
            <Head>
                <title>Students | Produit Classes Admin</title>
            </Head>

            {alert && (
                <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{alert.text}</span>
                    <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}>&times;</button>
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search students by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : students.length > 0 ? (
                <div className="glass-card data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th>Registered</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => {
                                const currentStatus = s.account_status || (s.is_active ? 'active' : 'hold');
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <strong>{s.name}</strong>
                                            {s.status_reason && currentStatus !== 'active' && (
                                                <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '2px', fontStyle: 'italic' }}>
                                                    Note: {s.status_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>{s.email}</div>
                                            {s.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.phone}</div>}
                                        </td>
                                        <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {new Date(s.registered).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            {getStatusBadge(s)}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                                {currentStatus === 'active' && (
                                                    <>
                                                        <button
                                                            className="action-btn-sm action-btn-hold"
                                                            title="Put on hold"
                                                            onClick={() => openActionModal(s, 'hold')}
                                                        >
                                                            Hold
                                                        </button>
                                                        <button
                                                            className="action-btn-sm action-btn-ban"
                                                            title="Ban account"
                                                            onClick={() => openActionModal(s, 'ban')}
                                                        >
                                                            Ban
                                                        </button>
                                                    </>
                                                )}

                                                {currentStatus === 'hold' && (
                                                    <>
                                                        <button
                                                            className="action-btn-sm action-btn-activate"
                                                            title="Reactivate student"
                                                            onClick={() => openActionModal(s, 'activate')}
                                                        >
                                                            Reactivate
                                                        </button>
                                                        <button
                                                            className="action-btn-sm action-btn-ban"
                                                            title="Ban account"
                                                            onClick={() => openActionModal(s, 'ban')}
                                                        >
                                                            Ban
                                                        </button>
                                                    </>
                                                )}

                                                {currentStatus === 'banned' && (
                                                    <>
                                                        <button
                                                            className="action-btn-sm action-btn-activate"
                                                            title="Unban student"
                                                            onClick={() => openActionModal(s, 'activate')}
                                                        >
                                                            Unban
                                                        </button>
                                                        <button
                                                            className="action-btn-sm action-btn-hold"
                                                            title="Place on hold"
                                                            onClick={() => openActionModal(s, 'hold')}
                                                        >
                                                            Hold
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    className="action-btn-sm action-btn-delete"
                                                    title="Permanently remove student"
                                                    onClick={() => openActionModal(s, 'delete')}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-card empty-state">
                    <h3>No students found</h3>
                    <p>{search ? 'Try a different search term.' : 'Students will appear here once they register.'}</p>
                </div>
            )}

            {/* Confirmation & Action Modal */}
            {actionModal && (
                <div className="modal-overlay" onClick={closeActionModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: `${modalConfig.color}15`,
                                color: modalConfig.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold'
                            }}>
                                {actionModal.action === 'delete' ? '✕' : actionModal.action === 'activate' ? '✓' : '!'}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: modalConfig.color, fontSize: '1.2rem' }}>
                                    {modalConfig.title}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    {actionModal.student.name} ({actionModal.student.email})
                                </p>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '12px' }}>
                            {modalConfig.description}
                        </p>

                        <div style={{
                            background: '#f8fafc',
                            border: `1px solid ${modalConfig.color}30`,
                            borderLeft: `4px solid ${modalConfig.color}`,
                            borderRadius: '8px',
                            padding: '12px 14px',
                            marginBottom: '18px',
                            fontSize: '0.86rem',
                            color: '#334155'
                        }}>
                            <strong>Email Notice:</strong> {modalConfig.warning}
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                                Reason / Note to Student {actionModal.action === 'delete' ? '(Optional)' : '(Recommended)'}
                            </label>
                            <textarea
                                className="input-field"
                                rows={3}
                                placeholder="e.g. Non-payment, violation of terms, user request, routine cleanup..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                style={{ width: '100%', resize: 'vertical' }}
                                disabled={processing}
                            />
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                type="button"
                                className="glass-btn outline"
                                onClick={closeActionModal}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="glass-btn primary"
                                onClick={handleConfirmAction}
                                disabled={processing}
                                style={{
                                    background: modalConfig.color,
                                    borderColor: modalConfig.color,
                                    color: '#ffffff',
                                    fontWeight: 600,
                                }}
                            >
                                {processing ? 'Processing...' : modalConfig.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminStudents, ['admin']);
