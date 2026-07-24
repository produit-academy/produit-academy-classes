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
                        {user.profile_picture_base64 ? (
                            <img src={user.profile_picture_base64} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
                                {user.name.charAt(0)}
                            </div>
                        )}
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
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Joined Date</span>
                            <div style={{ fontWeight: '500' }}>{new Date(user.joined).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {user.role === 'teacher' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--accent)', margin: 0 }}>{analytics.total_teaching_hours}h</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Total Teaching Hours</p>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--green)', margin: 0 }}>{analytics.classes_taught}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Classes Completed</p>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--accent-purple)', margin: 0 }}>₹{analytics.this_month_earnings}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Earnings This Month</p>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--accent-gold)', margin: 0 }}>₹{analytics.total_earnings}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Total Earnings (₹{analytics.hourly_rate}/hr)</p>
                                </div>
                            </div>
                            
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px 0' }}>Profile Details</h3>
                                
                                {user.bio && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bio</span>
                                        <div style={{ fontWeight: '500', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{user.bio}</div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                    {user.qualification && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qualifications</span>
                                            <div style={{ fontWeight: '500' }}>{user.qualification}</div>
                                        </div>
                                    )}
                                    {user.experience && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Experience</span>
                                            <div style={{ fontWeight: '500' }}>{user.experience}</div>
                                        </div>
                                    )}
                                    {user.languages && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Languages</span>
                                            <div style={{ fontWeight: '500' }}>{user.languages}</div>
                                        </div>
                                    )}
                                    {user.skills && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Skills</span>
                                            <div style={{ fontWeight: '500' }}>{user.skills}</div>
                                        </div>
                                    )}
                                    {user.certifications && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Certifications</span>
                                            <div style={{ fontWeight: '500' }}>{user.certifications}</div>
                                        </div>
                                    )}
                                    {user.google_meet_link && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Google Meet</span>
                                            <div style={{ fontWeight: '500' }}>
                                                <a href={user.google_meet_link?.startsWith('http') ? user.google_meet_link : `https://${user.google_meet_link}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Join Link</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {(user.courses?.length > 0 || user.taught_subjects?.length > 0) && (
                                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                        {user.courses?.length > 0 && (
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Courses</span>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {user.courses.map((c, i) => (
                                                        <span key={i} className="badge" style={{ background: 'var(--bg-secondary)', padding: '6px 12px' }}>{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {user.taught_subjects?.length > 0 && (
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Subjects</span>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {user.taught_subjects.map((s, i) => (
                                                        <span key={i} className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '6px 12px' }}>{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {analytics.student_breakdown?.length > 0 && (
                                <div className="glass-card" style={{ marginTop: '24px' }}>
                                    <h3 style={{ padding: '20px 20px 0', margin: 0 }}>Student Breakdown</h3>
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Course</th>
                                                    <th>Hours Taught</th>
                                                    <th>Earnings Generated</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.student_breakdown.map((s, idx) => (
                                                    <tr key={idx}>
                                                        <td><strong>{s.student_name}</strong></td>
                                                        <td>{s.course_name}</td>
                                                        <td>{s.hours}h</td>
                                                        <td>₹{s.earned}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}


                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(StaffProfile, ['admin']);
