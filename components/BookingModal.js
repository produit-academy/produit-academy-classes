// components/BookingModal.js - Booking flow with fee calculation, instant real-time sync, and Razorpay
import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiPost } from '../lib/api';
import { useRouter } from 'next/router';
import { loadRazorpayScript } from '../lib/razorpay';
import { useAuth } from '../lib/auth';
import { useLiveSlots } from '../lib/useLiveSlots';
import { Clock, ShieldAlert, Sparkles, Lock, Hourglass, CheckCircle2 } from 'lucide-react';


export default function BookingModal({ teacher, subjectId, courseId, onClose }) {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1=form, 2=review, 3=success
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null); // in seconds

    // Callback when another student books/reserves a slot in real time
    const handleSlotTaken = useCallback((takenSlotIds) => {
        setSelectedSlots(prevSelected => {
            const conflicting = prevSelected.filter(s => takenSlotIds.includes(s.id));
            if (conflicting.length > 0) {
                setError('Notice: A slot you selected was just booked or reserved by another student. Please select an available slot.');
                setStep(1);
                return prevSelected.filter(s => !takenSlotIds.includes(s.id));
            }
            return prevSelected;
        });
    }, []);

    // Live slot synchronization ("like firebase instant update")
    const { slots: liveSlots, broadcastSlotUpdate } = useLiveSlots(
        teacher?.user_id,
        teacher?.availability_slots || [],
        handleSlotTaken
    );

    const teacherFee = parseFloat(teacher.hourly_rate || 0);
    const totalAmount = teacherFee * selectedSlots.length;

    const toggleSlot = (slot) => {
        if (slot.is_booked || slot.is_held) return;
        setError('');
        if (selectedSlots.find(s => s.id === slot.id)) {
            setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const groupByDate = (slots) => {
        const groups = {};
        slots.forEach(s => {
            if (!groups[s.date]) groups[s.date] = [];
            groups[s.date].push(s);
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        const [h, m] = (timeStr || '').split(':');
        if (!h) return '';
        const date = new Date();
        date.setHours(parseInt(h, 10), parseInt(m, 10));
        return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    };

    // 5-minute countdown timer on Step 2
    useEffect(() => {
        if (step !== 2 || !booking?.expires_at) return;

        const expiresTime = new Date(booking.expires_at).getTime();

        const updateTimer = () => {
            const diff = Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
            setTimeRemaining(diff);
            if (diff === 0) {
                setError('Your 5-minute slot reservation has expired. Please select your slot again.');
                setStep(1);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [step, booking]);

    const formatCountdown = (seconds) => {
        if (seconds == null) return '';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleCreateBooking = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiPost('/api/classes/student/book-teacher/', {
                teacher_id: teacher.user_id,
                subject_id: parseInt(subjectId),
                slot_ids: selectedSlots.map(s => s.id),
            });
            const data = await res.json();
            if (res.ok) {
                setBooking(data);
                setStep(2);
                // Notify other tabs that slots are now held
                broadcastSlotUpdate(selectedSlots.map(s => s.id));
            } else {
                setError(data.error || 'Failed to reserve slots. Another student may have selected them.');
                if (res.status === 409) {
                    // Remove conflicting slot from selection
                    if (data.slot_id) {
                        setSelectedSlots(prev => prev.filter(s => s.id !== data.slot_id));
                    }
                }
            }
        } catch {
            setError('Network error creating booking.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Ensure Razorpay SDK is loaded
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setError('Payment gateway SDK could not be loaded. Please check your internet connection.');
                setLoading(false);
                return;
            }

            // 2. Create Razorpay order on backend
            const orderRes = await apiPost('/api/classes/student/razorpay/create-order/', {
                booking_id: booking.booking_id,
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setError(orderData.error || 'Failed to initialize payment.');
                setLoading(false);
                if (orderRes.status === 409 || orderRes.status === 400) {
                    setStep(1);
                }
                return;
            }

            // 3. Launch Razorpay Checkout Modal
            const options = {
                key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'Produit Academy',
                description: `${booking.subject} with ${booking.teacher_name}`,
                order_id: orderData.order_id,
                prefill: {
                    name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '',
                    email: user?.email || '',
                    contact: user?.phone || user?.phone_number || '',
                },
                notes: {
                    booking_id: String(booking.booking_id),
                },
                theme: {
                    color: '#0284c7',
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
                handler: async function (response) {
                    setLoading(true);
                    try {
                        const verifyRes = await apiPost('/api/classes/student/razorpay/verify/', {
                            booking_id: booking.booking_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            setStep(3);
                            // Broadcast instant slot update to all other open tabs/users
                            broadcastSlotUpdate(selectedSlots.map(s => s.id));
                        } else {
                            if (verifyData.status === 'conflict_refunded') {
                                setError('Slot conflict detected: Another student confirmed this slot moments before. A full refund has been automatically initiated to your original payment method.');
                                setStep(1);
                            } else {
                                setError(verifyData.error || 'Payment signature verification failed.');
                            }
                        }
                    } catch {
                        setError('Server error during payment verification. If money was debited, your booking will be confirmed automatically via webhook.');
                    } finally {
                        setLoading(false);
                    }
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (resp) {
                setError(resp?.error?.description || 'Payment failed or cancelled.');
                setLoading(false);
            });

            rzp.open();

        } catch {
            setError('Network error initiating payment.');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
                {/* Mobile Drag Indicator */}
                <div className="mobile-sheet-handle" />

                {/* Header with Live Sync Indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                            Book Class with {teacher.name}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0' }}>
                            ₹{teacherFee} per 1-hour class
                        </p>
                    </div>

                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem',
                        fontWeight: 700, color: '#15803d', flexShrink: 0
                    }}>
                        <span>Live Sync</span>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '16px', borderRadius: '8px', fontSize: '0.88rem', lineHeight: 1.4 }}>
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <>
                        <div style={{ maxHeight: '42vh', overflowY: 'auto', paddingRight: '8px', marginBottom: '16px' }}>
                            {liveSlots.length > 0 ? (
                                groupByDate(liveSlots).map(([date, slots]) => (
                                    <div key={date} style={{ marginBottom: '16px' }}>
                                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
                                            {formatDate(date)}
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {slots.map(slot => {
                                                const isBooked = !!slot.is_booked;
                                                const isHeld = !!slot.is_held && !isBooked;
                                                const isSelected = selectedSlots.some(s => s.id === slot.id);
                                                const isUnavailable = isBooked || isHeld;

                                                let bg = '#fff';
                                                let border = '1px solid #cbd5e1';
                                                let color = '#334155';

                                                if (isBooked) {
                                                    bg = '#f1f5f9';
                                                    border = '1px dashed #cbd5e1';
                                                    color = '#94a3b8';
                                                } else if (isHeld) {
                                                    bg = '#fffbeb';
                                                    border = '1px dashed #fde68a';
                                                    color = '#b45309';
                                                } else if (isSelected) {
                                                    bg = '#f0f9ff';
                                                    border = '2px solid #0284c7';
                                                    color = '#0284c7';
                                                }

                                                return (
                                                    <div
                                                        key={slot.id}
                                                        onClick={() => !isUnavailable && toggleSlot(slot)}
                                                        title={isBooked ? "Slot confirmed by another student" : isHeld ? "Slot currently in checkout by another student" : "Click to select slot"}
                                                        style={{
                                                            padding: '9px 12px', borderRadius: '8px',
                                                            background: bg, border: border,
                                                            fontSize: '0.84rem', fontWeight: 600,
                                                            color: color, display: 'flex', alignItems: 'center', gap: '6px',
                                                            cursor: isUnavailable ? 'not-allowed' : 'pointer',
                                                            transition: 'all 0.15s ease',
                                                            userSelect: 'none',
                                                            opacity: isUnavailable ? 0.75 : 1,
                                                        }}
                                                    >
                                                        {isBooked ? (
                                                            <Lock size={13} />
                                                        ) : isHeld ? (
                                                            <Hourglass size={13} color="#d97706" />
                                                        ) : (
                                                            <Clock size={13} />
                                                        )}
                                                        <span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                                                        {isBooked && (
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#e2e8f0', color: '#64748b', padding: '1px 5px', borderRadius: '4px' }}>
                                                                BOOKED
                                                            </span>
                                                        )}
                                                        {isHeld && (
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px' }}>
                                                                HELD
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No availability slots found for this faculty.</p>
                            )}
                        </div>

                        {/* Fee Preview */}
                        <div style={{
                            padding: '16px', borderRadius: '10px',
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.98rem' }}>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>
                                    Total Amount ({selectedSlots.length} {selectedSlots.length === 1 ? 'class' : 'classes'} × ₹{teacherFee})
                                </span>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0284c7' }}>
                                    ₹{selectedSlots.length > 0 ? totalAmount : 0}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={onClose} className="glass-btn" style={{ flex: 1, padding: '12px', minHeight: '44px', borderRadius: '12px' }}>Cancel</button>
                            <button
                                onClick={handleCreateBooking}
                                className="glass-btn primary"
                                disabled={loading || selectedSlots.length === 0}
                                style={{ flex: 1, padding: '12px', minHeight: '44px', borderRadius: '12px', opacity: selectedSlots.length === 0 ? 0.5 : 1 }}
                            >
                                {loading ? 'Locking Slots...' : `Review & Book (${selectedSlots.length})`}
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && booking && (
                    <>
                        {/* 15-Minute Reservation Countdown */}
                        {timeRemaining !== null && (
                            <div style={{
                                background: '#eff6ff', border: '1px solid #bfdbfe',
                                borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontSize: '0.86rem', fontWeight: 600 }}>
                                    <Clock size={16} />
                                    <span>Slots Held for Checkout</span>
                                </div>
                                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1d4ed8' }}>
                                    {formatCountdown(timeRemaining)}
                                </span>
                            </div>
                        )}

                        <div style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong>Faculty:</strong> {booking.teacher_name}</p>
                            <p style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong>Subject:</strong> {booking.subject}</p>
                            <p style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong>Class Sessions:</strong> {booking.num_classes}</p>
                            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '12px' }}>
                                <p style={{ marginBottom: '4px', fontSize: '0.88rem' }}>Fee: ₹{booking.teacher_fee_per_class}/class × {booking.num_classes} {booking.num_classes === 1 ? 'class' : 'classes'}</p>
                                <p style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '8px', color: '#0284c7' }}>
                                    Total Amount: ₹{booking.total_amount}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setStep(1)} className="glass-btn" style={{ flex: 1, padding: '12px', minHeight: '44px', borderRadius: '12px' }}>Back</button>
                            <button
                                onClick={handlePayment}
                                className="glass-btn primary"
                                disabled={loading}
                                style={{ flex: 1, padding: '12px', minHeight: '44px', borderRadius: '12px', fontWeight: 700 }}
                            >
                                {loading ? 'Processing...' : `Pay ₹${booking.total_amount}`}
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <CheckCircle2 size={60} color="#22c55e" style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
                            Booking Confirmed!
                        </h2>
                        <p style={{ color: '#475569', marginBottom: '8px', fontSize: '0.92rem' }}>
                            Your classes have been scheduled and live calendar invitations have been sent.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
                            Check your email for the Google Meet link and class timings.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => router.push('/student/bookings')} className="glass-btn primary" style={{ padding: '12px 24px', minHeight: '44px', borderRadius: '12px' }}>
                                View Bookings
                            </button>
                            <button onClick={onClose} className="glass-btn" style={{ padding: '12px 24px', minHeight: '44px', borderRadius: '12px' }}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
