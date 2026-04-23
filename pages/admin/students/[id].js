import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { withAuth } from '../../../lib/auth';
import { apiGet } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';

function StudentProfile() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        apiGet(`/api/classes/admin/analytics/user/${id}/`)
            .then(res => setData(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout title="Student Profile">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner" /></div>
            </DashboardLayout>
        );
    }

    if (!data || !data.analytics) {
        return (
            <DashboardLayout title="Student Profile">
                <div className="alert alert-error">Failed to load student profile.</div>
            </DashboardLayout>
        );
    }

    const { user, analytics } = data;

    return (
        <DashboardLayout title={`Student: ${user.name}`}>
            <Head><title>{user.name} Profile | Produit Classes</title></Head>

            <button className="glass-btn secondary" onClick={() => router.push('/admin/enrollments')} style={{ marginBottom: '20px' }}>
                &larr; Back to Enrollments
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Profile Card */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
                            {user.name.charAt(0)}
                        </div>
                        <h2 style={{ margin: 0 }}>{user.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>{user.email}</p>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</span>
                            <div style={{ fontWeight: '500' }}>{user.phone || 'N/A'}</div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assigned Mentor</span>
                            <div style={{ fontWeight: '500' }}>{user.mentor || 'Unassigned'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assigned Teacher</span>
                            <div style={{ fontWeight: '500' }}>{user.teacher || 'Unassigned'}</div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', color: 'var(--accent)', margin: 0 }}>{analytics.attendance_rate}%</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Overall Attendance</p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{analytics.attended_classes} of {analytics.total_classes_recorded} classes</div>
                        </div>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', color: 'var(--green)', margin: 0 }}>{analytics.completed_courses}</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Completed Courses</p>
                        </div>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', color: 'var(--text)', margin: 0 }}>{analytics.total_courses}</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Total Enrolled Courses</p>
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Recent Class Attendance</h3>
                        {analytics.recent_sessions?.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Course</th>
                                        <th>Session</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.recent_sessions.map((sess, i) => (
                                        <tr key={i}>
                                            <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                {new Date(sess.date).toLocaleDateString()}
                                            </td>
                                            <td>{sess.course}</td>
                                            <td><strong>{sess.session_title}</strong></td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: sess.status === 'Present' ? 'var(--green-bg)' : sess.status === 'Late' ? 'var(--yellow-bg)' : 'var(--red-bg)',
                                                    color: sess.status === 'Present' ? 'var(--green)' : sess.status === 'Late' ? 'var(--yellow)' : 'var(--red)'
                                                }}>
                                                    {sess.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No attendance records found.</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(StudentProfile, ['admin']);
