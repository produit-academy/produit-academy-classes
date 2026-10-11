import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
    CreditCard, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
    Search, Filter, ExternalLink, ShieldCheck, ArrowRight, Clock
} from 'lucide-react';

function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [reconcileModal, setReconcileModal] = useState(null);
    const [reconcileNotes, setReconcileNotes] = useState('');
    const [message, setMessage] = useState(null);

    const loadPayments = () => {
        setLoading(true);
        apiGet('/api/classes/admin/payments/')
            .then(data => {
                setPayments(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'error', text: 'Failed to load payment transactions.' });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const handleRecheckGateway = async (paymentId) => {
        setActionLoading(paymentId);
        setMessage(null);
        try {
            const res = await apiPost(`/api/classes/admin/payments/${paymentId}/recheck/`);
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Gateway checked: ${data.message}` });
                loadPayments();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to re-check payment on Razorpay.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error while contacting gateway.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReconcile = async () => {
        if (!reconcileModal) return;
        setActionLoading(reconcileModal.id);
        setMessage(null);
        try {
            const res = await apiPost(`/api/classes/admin/payments/${reconcileModal.id}/reconcile/`, {
                action: 'mark_paid',
                notes: reconcileNotes || 'Manual administrative reconciliation'
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Payment reconciled: ${data.message}` });
                setReconcileModal(null);
                setReconcileNotes('');
                loadPayments();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to reconcile payment.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error while reconciling payment.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearExpired = async () => {
        setActionLoading('clear_expired');
        setMessage(null);
        try {
            const res = await apiPost('/api/classes/admin/payments/clear-expired/');
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Cleared expired holds.' });
                loadPayments();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to clear expired holds.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error.' });
        } finally {
            setActionLoading(null);
        }
    };

    const filteredPayments = payments.filter(p => {
        const isPaid = ['advance_paid', 'fully_paid', 'paid'].includes(p.payment_status);
        const isPending = p.payment_status === 'pending' && p.booking_status === 'pending' && !p.is_expired;
        const isFailed = p.payment_status === 'failed' || p.booking_status === 'cancelled' || p.is_expired;

        let matchesStatus = true;
        if (statusFilter === 'pending') matchesStatus = isPending;
        else if (statusFilter === 'advance_paid' || statusFilter === 'fully_paid') matchesStatus = p.payment_status === statusFilter;
        else if (statusFilter === 'paid') matchesStatus = isPaid;
        else if (statusFilter === 'failed' || statusFilter === 'expired') matchesStatus = isFailed;

        const q = search.toLowerCase();
        const matchesSearch = !q ||
            (p.student_name && p.student_name.toLowerCase().includes(q)) ||
            (p.student_email && p.student_email.toLowerCase().includes(q)) ||
            (p.course_name && p.course_name.toLowerCase().includes(q)) ||
            (p.subject && p.subject.toLowerCase().includes(q)) ||
            (p.teacher_name && p.teacher_name.toLowerCase().includes(q)) ||
            (p.razorpay_order_id && p.razorpay_order_id.toLowerCase().includes(q)) ||
            (p.razorpay_payment_id && p.razorpay_payment_id.toLowerCase().includes(q));
        return matchesStatus && matchesSearch;
    });

    const totalRevenue = payments
        .filter(p => ['advance_paid', 'fully_paid', 'paid'].includes(p.payment_status))
        .reduce((sum, p) => sum + (parseFloat(p.advance_amount) || parseFloat(p.amount) || 0), 0);

    const awaitingCount = payments.filter(p => p.payment_status === 'pending' && p.booking_status === 'pending' && !p.is_expired).length;
    const expiredCount = payments.filter(p => p.payment_status === 'failed' || p.booking_status === 'cancelled' || p.is_expired).length;
    const completedCount = payments.filter(p => ['advance_paid', 'fully_paid', 'paid'].includes(p.payment_status)).length;

    return (
        <DashboardLayout title="Payment Investigation & Gateway Audit">
            <Head>
                <title>Payment Reconciliation | Produit Admin</title>
            </Head>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Notification toast */}
                {message && (
                    <div style={{
                        padding: '12px 20px',
                        marginBottom: '20px',
                        borderRadius: '50%',
                        background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
                    </div>
                )}

                {/* Summary Metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '28px'
                }}>
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #10b981' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Confirmed Revenue</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>₹{totalRevenue.toLocaleString('en-IN')}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Excludes unpaid/expired</span>
                    </div>

                    <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #f59e0b' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Awaiting Checkout</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', margin: '6px 0 0' }}>{awaitingCount}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Within 5-min payment window</span>
                    </div>

                    <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #ef4444' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Expired / Abandoned</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', margin: '6px 0 0' }}>{expiredCount}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Unpaid checkouts (slots freed)</span>
                    </div>

                    <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #3b82f6' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Completed Bookings</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', margin: '6px 0 0' }}>{completedCount}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified paid enrollments</span>
                    </div>
                </div>

                {/* Filters & Search */}
                <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search by student, teacher, course, Razorpay Order ID or Payment ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.9rem',
                                color: '#0f172a'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {[
                            { key: 'all', label: 'ALL' },
                            { key: 'pending', label: 'AWAITING' },
                            { key: 'advance_paid', label: 'ADVANCE PAID' },
                            { key: 'fully_paid', label: 'FULLY PAID' },
                            { key: 'expired', label: 'EXPIRED / FAILED' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '14px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    border: statusFilter === key ? '1px solid #0f172a' : '1px solid #e2e8f0',
                                    background: statusFilter === key ? '#0f172a' : '#ffffff',
                                    color: statusFilter === key ? '#ffffff' : '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                {label}
                            </button>
                        ))}
                        <button
                            onClick={handleClearExpired}
                            disabled={actionLoading === 'clear_expired'}
                            title="Sweep and release any stale pending checkout holds older than 5 minutes"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '14px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#b91c1c',
                                cursor: 'pointer'
                            }}
                        >
                            <XCircle size={14} />
                            <span>{actionLoading === 'clear_expired' ? 'Clearing...' : 'Clear Expired Holds'}</span>
                        </button>
                        <button
                            onClick={loadPayments}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#334155',
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={14} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="glass-card" style={{ padding: '0', borderRadius: '14px', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Auditing payment transactions against Razorpay gateway...</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                            <CreditCard size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                            <h4 style={{ color: '#0f172a', fontWeight: 700 }}>No payments match filter</h4>
                            <p style={{ fontSize: '0.88rem' }}>Try adjusting your search criteria or status filter.</p>
                        </div>
                    ) : (
                        <div className="data-table-wrapper" style={{ margin: 0 }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID / Date</th>
                                        <th>Student</th>
                                        <th>Course / Teacher</th>
                                        <th>Amount</th>
                                        <th>Razorpay Details</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map(p => {
                                        const isPaid = ['advance_paid', 'fully_paid', 'paid'].includes(p.payment_status);
                                        const isExpiredOrFailed = p.payment_status === 'failed' || p.booking_status === 'cancelled' || p.is_expired;
                                        const isPending = p.payment_status === 'pending' && p.booking_status === 'pending' && !p.is_expired;
                                        const orderAmount = parseFloat(p.amount) || parseFloat(p.total_amount) || 0;
                                        const advanceAmount = parseFloat(p.advance_amount) || 0;

                                        return (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>#{p.id}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.student_name}</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.student_email}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.course_name || p.course || '—'}</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.subject ? `${p.subject} · ` : ''}Faculty: {p.teacher_name}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>₹{orderAmount.toLocaleString('en-IN')}</div>
                                                    {isPaid ? (
                                                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                                            {advanceAmount >= orderAmount ? 'Paid in Full' : `Advance: ₹${advanceAmount}`}
                                                        </div>
                                                    ) : isExpiredOrFailed ? (
                                                        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                                                            Unpaid / Expired
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
                                                            Awaiting Payment
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#334155' }}>
                                                        {p.razorpay_order_id ? (
                                                            <span style={{ background: '#f1f5f9', padding: '2px 6px' }}>{p.razorpay_order_id}</span>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8' }}>No Order ID</span>
                                                        )}
                                                    </div>
                                                    {p.razorpay_payment_id && (
                                                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
                                                            {p.razorpay_payment_id}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {isPaid ? (
                                                        <span className="status-badge badge-completed">
                                                            <CheckCircle2 size={12} />
                                                            {p.payment_status.replace('_', ' ')}
                                                        </span>
                                                    ) : isPending ? (
                                                        <span className="status-badge badge-needs-review">
                                                            <Clock size={12} />
                                                            Awaiting
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge badge-not-conducted">
                                                            <XCircle size={12} />
                                                            {p.payment_status === 'failed' ? 'Expired / Failed' : (p.booking_status || 'Expired')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleRecheckGateway(p.id)}
                                                            disabled={actionLoading === p.id}
                                                            title="Directly ping Razorpay API to verify transaction state"
                                                            style={{
                                                                background: '#ffffff',
                                                                border: '1px solid #cbd5e1',
                                                                padding: '6px 10px',
                                                                borderRadius: '14px',
                                                                fontSize: '0.78rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                color: '#0f172a'
                                                            }}
                                                        >
                                                            <RefreshCw size={12} className={actionLoading === p.id ? 'spin' : ''} />
                                                            <span>{actionLoading === p.id ? 'Checking...' : 'Re-check'}</span>
                                                        </button>

                                                        {(isPending || isExpiredOrFailed) && (
                                                            <button
                                                                onClick={() => setReconcileModal(p)}
                                                                style={{
                                                                    background: '#047857',
                                                                    color: '#ffffff',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '14px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <ShieldCheck size={12} />
                                                                <span>Reconcile</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Manual Reconcile Modal */}
                {reconcileModal && (
                    <div className="modal-overlay" onClick={() => setReconcileModal(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <ShieldCheck size={24} color="#047857" />
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                                    Manual Payment Reconciliation
                                </h3>
                            </div>

                            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                                You are about to manually confirm payment for <strong>{reconcileModal.student_name}</strong> for course <strong>{reconcileModal.course_name}</strong> (Amount: ₹{reconcileModal.advance_amount}).
                            </p>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.82rem' }}>
                                <div><strong>Booking ID:</strong> #{reconcileModal.id}</div>
                                <div><strong>Razorpay Order ID:</strong> {reconcileModal.razorpay_order_id || 'Not generated'}</div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                    Audit Reason / Gateway Reference Notes:
                                </label>
                                <textarea
                                    className="input-field"
                                    rows={3}
                                    placeholder="e.g., Verified via Razorpay Merchant Dashboard, UTR: 123456789, bank credit confirmed..."
                                    value={reconcileNotes}
                                    onChange={(e) => setReconcileNotes(e.target.value)}
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    className="glass-btn outline"
                                    onClick={() => setReconcileModal(null)}
                                    style={{ borderRadius: '10px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReconcile}
                                    disabled={actionLoading === reconcileModal.id}
                                    className="glass-btn primary"
                                    style={{ borderRadius: '10px', background: '#047857' }}
                                >
                                    {actionLoading === reconcileModal.id ? 'Reconciling...' : 'Confirm & Mark Paid'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(AdminPayments, ['admin']);
