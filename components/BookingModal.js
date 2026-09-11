// components/BookingModal.js - Booking flow with fee calculation + dummy payment (Crisp Square Aesthetic)
import { useState } from 'react';
import { apiPost } from '../lib/api';
import { useRouter } from 'next/router';

const PLATFORM_FEE = 50;

export default function BookingModal({ teacher, subjectId, courseId, onClose }) {
    const router = useRouter();
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
            const res = await apiPost('/api/classes/student/pay/', {
                booking_id: booking.booking_id,
            });
            const data = await res.json();
            if (res.ok) {
                setStep(3);
            } else {
                setError(data.error || 'Payment failed.');
            }
        } catch {
            setError('Network error.');
        } finally {
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
                                                const isSelected = selectedSlots.find(s => s.id === slot.id);
                                                return (
                                                    <div 
                                                        key={slot.id} 
                                                        onClick={() => toggleSlot(slot)}
                                                        style={{
                                                            padding: '9px 14px', borderRadius: '0px',
                                                            background: isSelected ? '#f0f9ff' : '#fff',
                                                            border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                            fontSize: '0.85rem', fontWeight: 600, 
                                                            color: isSelected ? '#0284c7' : '#475569',
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            cursor: 'pointer', transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
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
