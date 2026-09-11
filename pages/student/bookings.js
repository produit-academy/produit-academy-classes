// pages/student/bookings.js - Student Bookings Dossier (70% Minimalist + 20% Futuristic + 10% Playful, Zero Emojis)
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Calendar, Video, Clock, CheckCircle2, AlertCircle,
    X, ArrowRight, UserCheck, CreditCard
} from 'lucide-react';

function StudentBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const loadBookings = () => {
        apiGet('/api/classes/student/bookings/')
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
        } catch {
            alert('Failed to cancel.');
        }
        setCancelling(false);
    };

    const statusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'confirmed') {
            return <span className="telemetry-chip live" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>[CONFIRMED]</span>;
        }
        if (s === 'completed') {
            return <span className="telemetry-chip cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>[COMPLETED]</span>;
        }
        if (s === 'cancelled') {
            return <span className="telemetry-chip" style={{ fontSize: '0.68rem', padding: '2px 8px', color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}>[CANCELLED]</span>;
        }
        return <span className="telemetry-chip" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>[{s.toUpperCase()}]</span>;
    };

    return (
        <DashboardLayout title="My Bookings">
            <Head><title>My Bookings | Produit Academy</title></Head>

            {loading ? (
                <div className="loading-container" style={{ minHeight: '320px' }}>
                    <div className="loading-spinner" />
                </div>
            ) : bookings.length === 0 ? (
                <div style={{
                    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px',
                    textAlign: 'center', padding: '60px 24px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                }}>
                    <Calendar size={32} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        No bookings on record
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
                        Explore academic curriculums and schedule 1-on-1 sessions with verified teachers.
                    </p>
                    <Link
                        href="/courses"
                        style={{
                            background: 'var(--accent-green)', color: '#ffffff',
                            padding: '10px 20px', borderRadius: '0px', fontSize: '0.9rem',
                            fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <span>Browse Courses</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {bookings.map((b) => (
                        <div
                            key={b.id}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0px',
                                padding: '24px',
                                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                                borderLeft: b.booking_status === 'confirmed' ? '4px solid var(--accent-green)' : '4px solid #cbd5e1'
                            }}
                            className="pro-card-hover"
                        >
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                                        {b.subject_name} &middot; {b.course_name}
                                    </h3>
                                    <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                                        Assigned Faculty: <strong style={{ color: '#334155' }}>{b.teacher_name}</strong>
                                    </p>
                                </div>
                                <div>
                                    {statusBadge(b.booking_status)}
                                </div>
                            </div>

                            {/* Telemetry Metric Columns */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '12px', background: '#f8fafc', padding: '12px 16px',
                                border: '1px solid #e2e8f0', borderRadius: '0px', marginBottom: '16px'
                            }}>
                                <div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Classes</span>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{b.num_classes}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Amount</span>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>₹{b.total_amount}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Advance Paid</span>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>₹{b.advance_amount}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Balance Due</span>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d97706' }}>₹{b.remaining_amount}</div>
                                </div>
                            </div>

                            {b.google_meet_link && (
                                <div style={{ marginBottom: '16px' }}>
                                    <a
                                        href={b.google_meet_link?.startsWith('http') ? b.google_meet_link : `https://${b.google_meet_link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            background: '#f0fdf4', border: '1px solid #a7f3d0',
                                            color: '#047857', padding: '7px 14px', borderRadius: '0px',
                                            fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex',
                                            alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <Video size={14} />
                                        <span>Permanent Meet Room</span>
                                    </a>
                                </div>
                            )}

                            {/* Class Schedule Matrix */}
                            {b.schedules?.length > 0 && (
                                <div style={{ paddingTop: '14px', borderTop: '1px dashed #e2e8f0' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                                        Session Timetable
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {b.schedules.map((s) => (
                                            <div
                                                key={s.id}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    gap: '12px', flexWrap: 'wrap',
                                                    padding: '10px 14px', borderRadius: '0px',
                                                    background: s.status === 'cancelled' ? '#fef2f2' : s.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                                                    border: `1px solid ${s.status === 'cancelled' ? '#fecaca' : s.status === 'completed' ? '#bbf7d0' : '#e2e8f0'}`,
                                                    opacity: s.status === 'cancelled' ? 0.75 : 1,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        fontSize: '0.88rem', fontWeight: 700,
                                                        textDecoration: s.status === 'cancelled' ? 'line-through' : 'none',
                                                        color: s.status === 'cancelled' ? '#94a3b8' : '#0f172a',
                                                    }}>
                                                        {new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        {' '}&middot; {s.start_time?.slice(0, 5)}
                                                    </span>

                                                    <span className="telemetry-chip" style={{
                                                        fontSize: '0.68rem', padding: '2px 6px',
                                                        background: s.status === 'cancelled' ? '#fee2e2' : s.status === 'completed' ? '#dcfce7' : '#f1f5f9',
                                                        color: s.status === 'cancelled' ? '#991b1b' : s.status === 'completed' ? '#166534' : '#475569',
                                                    }}>
                                                        [{s.status.toUpperCase()}]
                                                    </span>

                                                    {s.status === 'cancelled' && s.cancel_reason && (
                                                        <span style={{ fontSize: '0.78rem', color: '#991b1b', fontStyle: 'italic' }}>
                                                            {s.cancelled_by_name ? `By ${s.cancelled_by_name}: ` : 'Reason: '}{s.cancel_reason}
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
                                                            background: 'none', border: '1px solid #fca5a5', color: '#dc2626',
                                                            padding: '6px 12px', borderRadius: '0px', fontSize: '0.78rem',
                                                            fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        Cancel Session
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
                    <div style={{ maxWidth: '460px', width: '100%', padding: '32px', background: '#ffffff', borderRadius: '0px', border: '1px solid #cbd5e1' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>
                            Cancel Class Session
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
                            You are cancelling the class on <strong>{cancelModal.date}</strong> at <strong>{cancelModal.time}</strong>.
                            Your teacher will receive this notice.
                        </p>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                            Reason for cancellation *
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="e.g., Schedule conflict, academic exam, personal reason..."
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 12px', borderRadius: '0px',
                                border: '1px solid #cbd5e1', fontSize: '0.9rem',
                                resize: 'vertical', marginBottom: '20px', fontFamily: 'inherit',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setCancelModal(null); setCancelReason(''); }}
                                className="glass-btn"
                                style={{ padding: '9px 18px', borderRadius: '0px' }}
                            >
                                Keep Class
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling || !cancelReason.trim()}
                                style={{
                                    padding: '9px 18px', borderRadius: '0px', fontWeight: 700,
                                    background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer',
                                    opacity: (cancelling || !cancelReason.trim()) ? 0.5 : 1,
                                }}
                            >
                                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(StudentBookings, ['student']);
