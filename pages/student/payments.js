// pages/student/payments.js - Student Payment History
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function StudentPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/api/classes/student/payments/')
            .then(setPayments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusColors = {
        advance_paid: '#22c55e',
        fully_paid: '#3b82f6',
        pending: '#f59e0b',
    };

    const statusLabels = {
        advance_paid: 'Paid',
        fully_paid: 'Fully Paid',
        pending: 'Pending',
    };

    const totalPaid = payments.reduce((sum, p) => sum + (p.advance_paid || 0), 0);
    const totalRemaining = payments.reduce((sum, p) => sum + (p.remaining || 0), 0);

    return (
        <DashboardLayout title="Payment History">
            <Head><title>Payment History | Produit Classes</title></Head>

            {/* Summary Cards */}
            {!loading && payments.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Total Transactions</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{payments.length}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Total Paid</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>₹{totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Remaining</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: totalRemaining > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>₹{totalRemaining.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : payments.length === 0 ? (
                <div className="glass-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h3>No payment history</h3>
                    <p>Your payment records will appear here after you book a teacher.</p>
                    <a href="/courses" className="glass-btn primary" style={{ marginTop: '16px', display: 'inline-block' }}>Browse Courses</a>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {payments.map(p => {
                        const color = statusColors[p.payment_status] || '#64748b';
                        const label = statusLabels[p.payment_status] || p.payment_status;

                        return (
                            <div key={p.id} className="glass-card" style={{
                                padding: '24px', borderRadius: '16px',
                                borderLeft: `4px solid ${color}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                                            {p.subject}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Teacher: <strong>{p.teacher}</strong>
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        <span style={{
                                            fontSize: '0.8rem', fontWeight: 600, padding: '4px 14px', borderRadius: '20px',
                                            background: `${color}15`, color: color, textTransform: 'capitalize',
                                        }}>
                                            {label}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                    gap: '12px', padding: '16px', borderRadius: '12px',
                                    background: 'var(--background-light)',
                                    marginBottom: '12px'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '4px 0 0 0' }}>₹{p.total_amount}</p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Advance Paid</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '4px 0 0 0', color: '#22c55e' }}>₹{p.advance_paid}</p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '4px 0 0 0', color: p.remaining > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>₹{p.remaining}</p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '4px 0 0 0', textTransform: 'capitalize' }}>{p.booking_status}</p>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
                                    gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)',
                                    paddingTop: '8px', borderTop: '1px dashed var(--card-border)'
                                }}>
                                    <div>
                                        <span>Gateway Order ID: </span>
                                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>
                                            {p.razorpay_order_id || p.order_id || 'N/A'}
                                        </code>
                                    </div>
                                    {p.razorpay_payment_id && (
                                        <div>
                                            <span>Payment Ref: </span>
                                            <code style={{ background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', color: '#047857' }}>
                                                {p.razorpay_payment_id}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(StudentPayments, ['student']);
