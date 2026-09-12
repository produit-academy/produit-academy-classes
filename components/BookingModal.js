// components/BookingModal.js - Booking flow with fee calculation + Razorpay Payment
import { useState } from 'react';
import { apiPost } from '../lib/api';
import { useRouter } from 'next/router';
import { loadRazorpayScript } from '../lib/razorpay';
import { useAuth } from '../lib/auth';

const PLATFORM_FEE = 50;

export default function BookingModal({ teacher, subjectId, courseId, onClose }) {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1=form, 2=review, 3=success
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const teacherFee = parseFloat(teacher.hourly_rate || 0);
    const totalTeacherFee = teacherFee * selectedSlots.length;
    const totalAmount = totalTeacherFee + PLATFORM_FEE;

    const availableSlots = teacher.availability_slots || [];

    const toggleSlot = (slot) => {
        if (slot.is_booked) return;
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
        const [h, m] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(h), parseInt(m));
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
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
            } else {
                setError(data.error || 'Failed to create booking.');
            }
        } catch {
            setError('Network error.');
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
                        } else {
                            setError(verifyData.error || 'Payment signature verification failed.');
                        }
                    } catch {
                        setError('Server error during payment verification. If money was debited, your booking will be confirmed automatically.');
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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: '0px', padding: '32px',
                maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #cbd5e1'
            }} onClick={(e) => e.stopPropagation()}>

                {step === 1 && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px', fontFamily: "'Lora', serif" }}>
                            Book {teacher.name}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            ₹{teacherFee}/class + ₹{PLATFORM_FEE} platform fee
                        </p>

                        {error && <div className="alert alert-error" style={{ marginBottom: '16px', borderRadius: '0px' }}>{error}</div>}

                        <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '8px', marginBottom: '16px' }}>
                            {availableSlots.length > 0 ? (
                                groupByDate(availableSlots).map(([date, slots]) => (
                                    <div key={date} style={{ marginBottom: '16px' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>
                                            {formatDate(date)}
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {slots.map(slot => {
                                                const isBooked = !!slot.is_booked;
                                                const isSelected = selectedSlots.find(s => s.id === slot.id);
                                                return (
                                                    <div 
                                                        key={slot.id} 
                                                        onClick={() => !isBooked && toggleSlot(slot)}
                                                        title={isBooked ? "This slot has already been reserved" : "Click to select slot"}
                                                        style={{
                                                            padding: '9px 14px', borderRadius: '0px',
                                                            background: isBooked ? '#f1f5f9' : isSelected ? '#f0f9ff' : '#fff',
                                                            border: isBooked 
                                                                ? '1px dashed #cbd5e1' 
                                                                : isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                            fontSize: '0.85rem', fontWeight: 600, 
                                                            color: isBooked ? '#94a3b8' : isSelected ? '#0284c7' : '#475569',
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            cursor: isBooked ? 'not-allowed' : 'pointer', 
                                                            transition: 'all 0.15s',
                                                            userSelect: 'none',
                                                            opacity: isBooked ? 0.75 : 1,
                                                        }}
                                                    >
                                                        {isBooked ? (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                            </svg>
                                                        ) : (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="10"/>
                                                                <polyline points="12 6 12 12 16 14"/>
                                                            </svg>
                                                        )}
                                                        <span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                                                        {isBooked && (
                                                            <span style={{
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                background: '#e2e8f0',
                                                                color: '#64748b',
                                                                padding: '1px 5px',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                BOOKED
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748b' }}>No available slots found for this teacher.</p>
                            )}
                        </div>

                        {/* Fee Preview */}
                        <div style={{
                            padding: '16px', borderRadius: '0px',
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span>Teacher Fee ({selectedSlots.length} × ₹{teacherFee})</span>
                                <span style={{ fontWeight: 600 }}>₹{totalTeacherFee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span>Platform Fee</span>
                                <span style={{ fontWeight: 600 }}>₹{PLATFORM_FEE}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '1rem' }}>
                                <span style={{ fontWeight: 700 }}>Total</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>₹{selectedSlots.length > 0 ? totalAmount : 0}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={onClose} className="glass-btn" style={{ flex: 1, padding: '12px', borderRadius: '0px' }}>Cancel</button>
                            <button onClick={handleCreateBooking} className="glass-btn primary" disabled={loading || selectedSlots.length === 0}
                                style={{ flex: 1, padding: '12px', borderRadius: '0px', opacity: selectedSlots.length === 0 ? 0.5 : 1 }}>
                                {loading ? 'Creating...' : `Review Booking (${selectedSlots.length})`}
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && booking && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', fontFamily: "'Lora', serif" }}>
                            Confirm & Pay
                        </h2>

                        {error && <div className="alert alert-error" style={{ marginBottom: '16px', borderRadius: '0px' }}>{error}</div>}

                        <div style={{ padding: '20px', borderRadius: '0px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>Teacher:</strong> {booking.teacher_name}</p>
                            <p style={{ marginBottom: '8px' }}><strong>Subject:</strong> {booking.subject}</p>
                            <p style={{ marginBottom: '8px' }}><strong>Classes:</strong> {booking.num_classes}</p>
                            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '12px' }}>
                                <p style={{ marginBottom: '4px' }}>Teacher Fee: ₹{booking.teacher_fee_per_class}/class × {booking.num_classes} = ₹{booking.teacher_fee_per_class * booking.num_classes}</p>
                                <p style={{ marginBottom: '4px' }}>Platform Fee: ₹{booking.platform_fee}</p>
                                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '8px', color: 'var(--accent-blue)' }}>
                                    Total: ₹{booking.total_amount}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setStep(1)} className="glass-btn" style={{ flex: 1, padding: '12px', borderRadius: '0px' }}>Back</button>
                            <button onClick={handlePayment} className="glass-btn primary" disabled={loading}
                                style={{ flex: 1, padding: '12px', borderRadius: '0px', fontWeight: 700 }}>
                                {loading ? 'Processing...' : `Pay ₹${booking.total_amount}`}
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', fontFamily: "'Lora', serif" }}>
                            Booking Confirmed!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Your classes have been scheduled and confirmation emails have been sent.
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Check your email for the Google Meet link and schedule details.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => router.push('/student/bookings')} className="glass-btn primary" style={{ padding: '12px 24px', borderRadius: '0px' }}>
                                View Bookings
                            </button>
                            <button onClick={onClose} className="glass-btn" style={{ padding: '12px 24px', borderRadius: '0px' }}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
