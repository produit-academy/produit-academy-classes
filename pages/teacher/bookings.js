// pages/teacher/bookings.js - Teacher's received bookings with cancel capability
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function TeacherBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState(null); // { scheduleId, date, time }
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const loadBookings = () => {
        apiGet('/api/classes/teacher/bookings/')
            .then(setBookings)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadBookings(); }, []);

    const handleCancel = async () => {
        if (!cancelReason.trim()) return alert('Please provide a reason.');
        setCancelling(true);
        try {
            const res = await apiPost(`/api/classes/schedule/${cancelModal.scheduleId}/cancel/`, { reason: cancelReason });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || data.detail || 'Failed to cancel.');
            } else {
                setCancelModal(null);
                setCancelReason('');
                loadBookings();
            }
        } catch (e) {
            alert('Failed to cancel.');
        }
        setCancelling(false);
    };

    const statusColors = {
        confirmed: '#22c55e',
        pending: '#d4a017',
        completed: 'var(--accent-blue)',
        cancelled: '#ef4444',
    };

    return (
        <DashboardLayout title="My Bookings">
            <Head><title>My Bookings | Produit Classes</title></Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : bookings.length === 0 ? (
                <div className="glass-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h3>No bookings yet</h3>
                    <p>Students will book you once your profile is set up and approved.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {bookings.map(b => (
                        <div key={b.id} className="glass-card" style={{ padding: '24px', borderRadius: '16px', borderLeft: `4px solid ${statusColors[b.booking_status] || '#ccc'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{b.student_name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {b.student_email} · {b.student_phone || 'No phone'}
                                    </p>
                                </div>
                                <span style={{
                                    fontSize: '0.78rem', fontWeight: 600, padding: '4px 14px', borderRadius: '20px',
                                    background: `${statusColors[b.booking_status]}15`,
                                    color: statusColors[b.booking_status],
                                    textTransform: 'capitalize',
                                }}>{b.booking_status}</span>
                            </div>

                            <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                                <strong>{b.subject_name}</strong> - {b.course_name} · {b.num_classes} classes
                            </p>

                            {b.schedules?.length > 0 && (
                                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--card-border, #e0e0e0)' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Class Schedule</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {b.schedules.map(s => (
                                            <div key={s.id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                gap: '12px', flexWrap: 'wrap',
                                                padding: '10px 14px', borderRadius: '10px',
                                                background: s.status === 'cancelled' ? '#fef2f2' : s.status === 'completed' ? '#f0fdf4' : 'var(--background-light)',
                                                border: `1px solid ${s.status === 'cancelled' ? '#fecaca' : s.status === 'completed' ? '#bbf7d0' : 'var(--card-border, #e0e0e0)'}`,
                                                opacity: s.status === 'cancelled' ? 0.7 : 1,
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        fontSize: '0.85rem', fontWeight: 600,
                                                        textDecoration: s.status === 'cancelled' ? 'line-through' : 'none',
                                                        color: s.status === 'cancelled' ? '#9ca3af' : 'var(--text-primary)',
                                                    }}>
                                                        {new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        {' '}{s.start_time?.slice(0, 5)}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                                        background: s.status === 'cancelled' ? '#fee2e2' : s.status === 'completed' ? '#dcfce7' : '#f1f5f9',
                                                        color: s.status === 'cancelled' ? '#991b1b' : s.status === 'completed' ? '#166534' : '#475569',
                                                    }}>{s.status}</span>
                                                    {s.status === 'cancelled' && s.cancel_reason && (
                                                        <span style={{ fontSize: '0.8rem', color: '#991b1b', fontStyle: 'italic' }}>
                                                            Reason: {s.cancel_reason}
                                                        </span>
                                                    )}
                                                </div>
                                                {s.status === 'scheduled' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCancelModal({
                                                                scheduleId: s.id,
                                                                date: new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
                                                                time: s.start_time?.slice(0, 5),
                                                            });
                                                        }}
                                                        style={{
                                                            background: 'none', border: '1px solid #fecaca', color: '#dc2626',
                                                            padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem',
                                                            fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={e => { e.target.style.background = '#fef2f2'; }}
                                                        onMouseLeave={e => { e.target.style.background = 'none'; }}
                                                    >
                                                        Cancel Class
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '20px',
                }}>
                    <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '32px', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Cancel Class</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            You are cancelling the class on <strong>{cancelModal.date}</strong> at <strong>{cancelModal.time}</strong>.
                            The student will be notified via email.
                        </p>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                            Reason for cancellation *
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="e.g., Personal emergency, health issue, scheduling conflict..."
                            rows={3}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                border: '1px solid var(--border)', fontSize: '0.9rem',
                                resize: 'vertical', marginBottom: '20px', fontFamily: 'inherit',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setCancelModal(null); setCancelReason(''); }}
                                className="glass-btn"
                                style={{ padding: '10px 24px', borderRadius: '10px' }}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling || !cancelReason.trim()}
                                style={{
                                    padding: '10px 24px', borderRadius: '10px', fontWeight: 700,
                                    background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer',
                                    opacity: (cancelling || !cancelReason.trim()) ? 0.5 : 1,
                                }}
                            >
                                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(TeacherBookings, ['teacher', 'admin']);
