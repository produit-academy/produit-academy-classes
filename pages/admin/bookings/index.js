// pages/admin/bookings/index.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../../lib/auth';
import { apiGet } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        apiGet('/api/classes/admin/bookings/')
            .then(setBookings)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusColors = {
        confirmed: 'var(--accent-green, #22c55e)',
        pending: 'var(--accent-gold, #d4a017)',
        completed: 'var(--accent-blue)',
        cancelled: 'var(--accent-red)',
    };

    return (
        <DashboardLayout title="Manage Bookings">
            <Head>
                <title>Bookings | Produit Classes Admin</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : bookings.length > 0 ? (
                <div className="glass-card data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Booking Info</th>
                                <th>Student</th>
                                <th>Teacher</th>
                                <th>Amount Paid</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={b.id}>
                                    <td>
                                        <strong>{b.subject_name}</strong>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.course_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.num_classes} classes</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.95rem' }}>{b.student_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.student_email}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.student_phone || '-'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.95rem' }}>{b.teacher_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.teacher_email}</div>
                                        {b.google_meet_link ? (
                                            <a
                                                href={b.google_meet_link.startsWith('http') ? b.google_meet_link : `https://${b.google_meet_link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.78rem',
                                                    color: '#059669',
                                                    fontWeight: 600,
                                                    marginTop: '4px',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Enter Class &rarr;
                                            </a>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: '#d97706', display: 'block', marginTop: '4px' }}>
                                                No Meet Link
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>₹{b.total_amount}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fee: ₹{b.teacher_fee_per_class}/class</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Platform: ₹{b.platform_fee}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                            <span style={{
                                                fontSize: '0.74rem', fontWeight: 600, padding: '4px 10px', borderRadius: '9999px',
                                                background: `${statusColors[b.booking_status] || '#cbd5e1'}18`,
                                                color: statusColors[b.booking_status] || '#475569',
                                                border: `1px solid ${statusColors[b.booking_status] || '#cbd5e1'}40`,
                                                textTransform: 'capitalize',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.2
                                            }}>
                                                {b.booking_status}
                                            </span>
                                            <span style={{
                                                fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                                                background: b.payment_status === 'advance_paid' ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.05)',
                                                color: b.payment_status === 'advance_paid' ? 'var(--accent-green, #22c55e)' : 'var(--text-secondary)',
                                                textTransform: 'capitalize',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.2
                                            }}>
                                                Pay: {b.payment_status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-card empty-state">
                    <h3>No bookings found</h3>
                    <p>Bookings will appear here once students book teachers.</p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminBookings, ['admin']);
