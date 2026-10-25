// pages/student/bookings.js - Student Bookings Dossier (70% Minimalist + 20% Futuristic + 10% Playful, Zero Emojis)
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Calendar, Video, Clock, CheckCircle2, AlertCircle,
    X, ArrowRight, UserCheck, CreditCard, HelpCircle, ShieldAlert
} from 'lucide-react';

function StudentBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Entire Booking Cancellation & Refund Modal state
    const [cancelBookingModal, setCancelBookingModal] = useState(null);
    const [cancelBookingReason, setCancelBookingReason] = useState('');
    const [cancellingBooking, setCancellingBooking] = useState(false);
    const [supportModal, setSupportModal] = useState(null);
    const [bannerMessage, setBannerMessage] = useState(null);

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

    const handleCancelEntireBooking = async () => {
        if (!cancelBookingModal) return;
        setCancellingBooking(true);
        setBannerMessage(null);
        try {
            const res = await apiPost(`/api/classes/student/bookings/${cancelBookingModal.id}/cancel/`, {
                reason: cancelBookingReason.trim() || 'Cancelled by student'
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.error || 'Failed to cancel booking.');
            } else {
                setBannerMessage({
                    type: 'success',
                    text: data.message || `Booking #${cancelBookingModal.id} cancelled successfully. Refund of ₹${data.refund_amount} initiated.`
                });
                setCancelBookingModal(null);
                setCancelBookingReason('');
                loadBookings();
            }
        } catch {
            alert('Failed to cancel booking due to network or server issue.');
        } finally {
            setCancellingBooking(false);
        }
    };

    const statusBadge = (status, paymentStatus) => {
        const s = (status || '').toLowerCase();
        const p = (paymentStatus || '').toLowerCase();
        return (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                {s === 'confirmed' ? (
                    <span className="telemetry-chip live" style={{ fontSize: '0.68rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>[CONFIRMED]</span>
                ) : s === 'completed' ? (
                    <span className="telemetry-chip cyan" style={{ fontSize: '0.68rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>[COMPLETED]</span>
                ) : s === 'cancelled' ? (
                    <span className="telemetry-chip" style={{ fontSize: '0.68rem', padding: '3px 10px', color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>[CANCELLED]</span>
                ) : (
                    <span className="telemetry-chip" style={{ fontSize: '0.68rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>[{s.toUpperCase()}]</span>
                )}
                {p === 'refunded' && (
                    <span className="telemetry-chip" style={{ fontSize: '0.68rem', padding: '3px 10px', color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>[REFUNDED]</span>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout title="My Bookings">
            <Head><title>My Bookings | Produit Academy</title></Head>

            {bannerMessage && (
                <div style={{
                    padding: '14px 18px',
                    marginBottom: '20px',
                    borderRadius: '14px',
                    border: bannerMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                    background: bannerMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: bannerMessage.type === 'success' ? '#065f46' : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={18} />
                        <span>{bannerMessage.text}</span>
                    </div>
                    <button onClick={() => setBannerMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading-container" style={{ minHeight: '320px' }}>
                    <div className="loading-spinner" />
                </div>
            ) : bookings.length === 0 ? (
                <div style={{
                    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
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
                            padding: '10px 20px', borderRadius: '14px', fontSize: '0.9rem',
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
                                borderRadius: '14px',
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    {statusBadge(b.booking_status, b.payment_status)}
                                    {b.can_cancel_booking ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                            <button
                                                onClick={() => setCancelBookingModal(b)}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #fca5a5',
                                                    color: '#dc2626',
                                                    padding: '5px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    transition: 'all 0.15s'
                                                }}
                                                className="hover-danger-btn"
                                            >
                                                <X size={13} />
                                                <span>Cancel &amp; Refund</span>
                                            </button>
                                            <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                                                100% refund eligible
                                            </span>
                                        </div>
                                    ) : (b.booking_status === 'confirmed' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                            <button
                                                onClick={() => setSupportModal(b)}
                                                style={{
                                                    background: '#f8fafc',
                                                    border: '1px solid #cbd5e1',
                                                    color: '#475569',
                                                    padding: '5px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                title="View refund policy details"
                                            >
                                                <HelpCircle size={13} color="#64748b" />
                                                <span>Refund Policy</span>
                                            </button>
                                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                                Class commenced
                                            </span>
                                        </div>
                                    ) : (b.booking_status === 'pending' && (
                                        <button
                                            onClick={() => setCancelBookingModal(b)}
                                            style={{
                                                background: '#fff',
                                                border: '1px solid #cbd5e1',
                                                color: '#64748b',
                                                padding: '5px 12px',
                                                borderRadius: '12px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel Hold
                                        </button>
                                    )))}
                                </div>
                            </div>

                            {/* Telemetry Metric Columns */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '12px', background: '#f8fafc', padding: '12px 16px',
                                border: '1px solid #e2e8f0', borderRadius: '14px', marginBottom: '16px'
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
                                            color: '#047857', padding: '7px 14px', borderRadius: '14px',
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
                                                    padding: '10px 14px', borderRadius: '14px',
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {s.is_within_12_hours && (
                                                            <span style={{
                                                                fontSize: '0.68rem', fontWeight: 700,
                                                                background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a',
                                                                padding: '3px 8px', borderRadius: '8px'
                                                            }}>
                                                                &lt; 12 hrs to class
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCancelModal({
                                                                    scheduleId: s.id,
                                                                    date: new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
                                                                    time: s.start_time?.slice(0, 5),
                                                                    isWithin12Hours: s.is_within_12_hours,
                                                                    canCancelSchedule: s.can_cancel_schedule !== false,
                                                                });
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: s.is_within_12_hours ? '1px solid #cbd5e1' : '1px solid #fca5a5',
                                                                color: s.is_within_12_hours ? '#64748b' : '#dc2626',
                                                                padding: '6px 12px', borderRadius: '14px', fontSize: '0.78rem',
                                                                fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            Cancel Session
                                                        </button>
                                                    </div>
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

            {/* Cancel Session Modal */}
            {cancelModal && (
                <div className="modal-overlay" onClick={() => setCancelModal(null)}>
                    <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-sheet-handle" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>
                            Cancel Class Session
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
                            You are requesting to cancel the class on <strong>{cancelModal.date}</strong> at <strong>{cancelModal.time}</strong>.
                        </p>

                        {cancelModal.isWithin12Hours && (
                            <div style={{
                                background: '#fffbeb', border: '1px solid #fde68a',
                                padding: '12px 14px', borderRadius: '12px', marginBottom: '16px',
                                fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5
                            }}>
                                <strong>Advance Notice Requirement:</strong> In accordance with Produit Academy Refund Policy (Section 3), individual sessions must be cancelled with at least <strong>12 hours advance notice</strong>. Self-service cancellation within 12 hours is restricted. Please contact your teacher or student support for emergency rescheduling.
                            </div>
                        )}

                        <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                            Reason for cancellation *
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="e.g., Schedule conflict, academic exam, personal reason..."
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 12px', borderRadius: '14px',
                                border: '1px solid #cbd5e1', fontSize: '16px',
                                resize: 'vertical', marginBottom: '20px', fontFamily: 'inherit',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setCancelModal(null); setCancelReason(''); }}
                                className="glass-btn"
                                style={{ padding: '9px 18px', minHeight: '44px', borderRadius: '12px' }}
                            >
                                Keep Class
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling || !cancelReason.trim() || cancelModal.isWithin12Hours}
                                style={{
                                    padding: '10px 20px', minHeight: '44px', borderRadius: '12px', fontWeight: 700,
                                    background: '#dc2626', color: '#fff', border: 'none', cursor: cancelModal.isWithin12Hours ? 'not-allowed' : 'pointer',
                                    opacity: (cancelling || !cancelReason.trim() || cancelModal.isWithin12Hours) ? 0.5 : 1,
                                }}
                            >
                                {cancelling ? 'Cancelling...' : cancelModal.isWithin12Hours ? 'Notice < 12 Hours' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Entire Booking & Refund Modal */}
            {cancelBookingModal && (
                <div className="modal-overlay" onClick={() => setCancelBookingModal(null)}>
                    <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-sheet-handle" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', borderRadius: '10px' }}>
                                <AlertCircle size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                    Cancel Booking &amp; Issue Refund
                                </h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Booking #{cancelBookingModal.id} &middot; {cancelBookingModal.subject_name}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px',
                            borderRadius: '14px', marginBottom: '18px', fontSize: '0.86rem', color: '#334155'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: '#64748b' }}>Faculty:</span>
                                <strong>{cancelBookingModal.teacher_name}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: '#64748b' }}>Number of Sessions:</span>
                                <strong>{cancelBookingModal.num_classes} Classes</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                                <span style={{ color: '#64748b' }}>Refund Amount:</span>
                                <strong style={{ color: '#059669', fontSize: '1rem' }}>₹{cancelBookingModal.total_amount}</strong>
                            </div>
                        </div>

                        <div style={{
                            background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 14px',
                            borderRadius: '14px', marginBottom: '18px', fontSize: '0.82rem', color: '#065f46', lineHeight: 1.5
                        }}>
                            <strong>Refund Policy Compliance:</strong> Under Section 1 of Produit Academy Cancellation &amp; Refund Policy, cancelling prior to the commencement of your first scheduled class session qualifies for a <strong>100% full refund</strong>. The amount (₹{cancelBookingModal.total_amount}) will be automatically credited to your original payment method via Razorpay within 5-7 business days. All future timetable reservations will be cancelled.
                        </div>

                        <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                            Reason for cancellation (optional)
                        </label>
                        <textarea
                            value={cancelBookingReason}
                            onChange={e => setCancelBookingReason(e.target.value)}
                            placeholder="e.g., Schedule conflict, requested change of tutor, personal emergency..."
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 12px', borderRadius: '14px',
                                border: '1px solid #cbd5e1', fontSize: '16px',
                                resize: 'vertical', marginBottom: '22px', fontFamily: 'inherit',
                            }}
                        />

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setCancelBookingModal(null); setCancelBookingReason(''); }}
                                style={{
                                    padding: '9px 18px', minHeight: '44px', borderRadius: '12px', border: '1px solid #cbd5e1',
                                    background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelEntireBooking}
                                disabled={cancellingBooking}
                                style={{
                                    padding: '10px 22px', minHeight: '44px', borderRadius: '12px', fontWeight: 700,
                                    background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer',
                                    opacity: cancellingBooking ? 0.6 : 1,
                                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                {cancellingBooking ? 'Processing Refund...' : 'Confirm & Issue Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Support / Past Refund Window Policy Modal */}
            {supportModal && (
                <div className="modal-overlay" onClick={() => setSupportModal(null)}>
                    <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-sheet-handle" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ padding: '8px', background: '#eff6ff', color: '#2563eb', borderRadius: '10px' }}>
                                <ShieldAlert size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                    Cancellation &amp; Refund Policy
                                </h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Booking #{supportModal.id} &middot; {supportModal.subject_name}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 14px',
                            borderRadius: '12px', marginBottom: '16px', fontSize: '0.84rem', color: '#991b1b', lineHeight: 1.5
                        }}>
                            <strong>Automated Full Refund Window Closed:</strong> Under the Produit Academy Refund Policy, automated 100% refunds are strictly available <strong>prior to the start of the first scheduled class session</strong>. Because your course sessions have already commenced, automated refunds cannot be processed self-service online.
                        </div>

                        <div style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px',
                            borderRadius: '12px', marginBottom: '18px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6
                        }}>
                            <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#0f172a' }}>Emergency &amp; Pro-Rata Inquiries</h4>
                            <p style={{ margin: '0 0 10px' }}>
                                If you have attended classes and wish to cancel unattended sessions due to an instructor mismatch, academic timetable emergency, or technical impediment, requests are evaluated on a pro-rata basis by our academic administration team.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#475569' }}>
                                <div>&bull; <strong>Email:</strong> <a href="mailto:produitacademy@gmail.com" style={{ color: '#2563eb' }}>produitacademy@gmail.com</a></div>
                                <div>&bull; <strong>WhatsApp / Phone:</strong> <a href="tel:+918139805996" style={{ color: '#2563eb' }}>+91 8139 805 996</a></div>
                                <div>&bull; <strong>Support Hours:</strong> Mon&ndash;Sat, 9:00 AM &ndash; 7:00 PM IST</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <Link
                                href="/refund-policy"
                                target="_blank"
                                style={{
                                    padding: '9px 16px', minHeight: '42px', borderRadius: '12px',
                                    border: '1px solid #cbd5e1', background: '#fff', color: '#475569',
                                    fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center'
                                }}
                            >
                                Read Full Policy
                            </Link>
                            <a
                                href="https://wa.me/918139805996?text=Hello%20Produit%20Academy%20Support,%20I%20have%20an%20inquiry%20regarding%20my%20booking"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '9px 18px', minHeight: '42px', borderRadius: '12px',
                                    background: '#059669', color: '#fff', textDecoration: 'none',
                                    fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center'
                                }}
                            >
                                WhatsApp Support
                            </a>
                            <button
                                onClick={() => setSupportModal(null)}
                                style={{
                                    padding: '9px 16px', minHeight: '42px', borderRadius: '12px',
                                    border: 'none', background: '#e2e8f0', color: '#334155',
                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(StudentBookings, ['student']);
