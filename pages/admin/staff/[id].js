import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { withAuth } from '../../../lib/auth';
import { apiGet } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';

function StaffProfile() {
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
            <DashboardLayout title="Staff Profile">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner" /></div>
            </DashboardLayout>
        );
    }

    if (!data || !data.analytics) {
        return (
            <DashboardLayout title="Staff Profile">
                <div className="alert alert-error">Failed to load staff profile.</div>
            </DashboardLayout>
        );
    }

    const { user, analytics } = data;

    return (
        <DashboardLayout title={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}: ${user.name}`}>
            <Head><title>{user.name} Profile | Produit Classes</title></Head>

            <button className="glass-btn secondary" onClick={() => router.push('/admin/staff')} style={{ marginBottom: '20px' }}>
                &larr; Back to Staff List
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Profile Card */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
                            {user.name.charAt(0)}
                        </div>
                        <h2 style={{ margin: 0 }}>{user.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>{user.email}</p>
                        <span className="badge" style={{ marginTop: '12px', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                            {user.role.toUpperCase()}
                        </span>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</span>
                            <div style={{ fontWeight: '500' }}>{user.phone || 'N/A'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Joined Date</span>
                            <div style={{ fontWeight: '500' }}>{new Date(user.joined).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {user.role === 'teacher' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2rem', color: 'var(--accent)', margin: 0 }}>{analytics.total_teaching_hours}h</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Total Teaching Hours</p>
                            </div>
                            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2rem', color: 'var(--green)', margin: 0 }}>{analytics.classes_taught}</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Classes Completed</p>
                            </div>
                            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2rem', color: 'var(--text)', margin: 0 }}>{analytics.avg_student_attendance_rate}%</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Avg. Student Attendance</p>
                            </div>
                        </div>
                    )}

                    {user.role === 'mentor' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2.5rem', color: 'var(--accent)', margin: 0 }}>{analytics.assigned_students}</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '1rem' }}>Total Assigned Students</p>
                            </div>
                            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: analytics.at_risk_students > 0 ? 'var(--red-light)' : 'var(--card-bg)' }}>
                                <h3 style={{ fontSize: '2.5rem', color: analytics.at_risk_students > 0 ? 'var(--red)' : 'var(--green)', margin: 0 }}>
                                    {analytics.at_risk_students}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '1rem' }}>At-Risk Students (&lt; 75% Attendance)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(StaffProfile, ['admin']);
