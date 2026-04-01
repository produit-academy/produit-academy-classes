import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';

function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/api/classes/student/dashboard/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout title={`Welcome, ${user?.first_name || user?.username || 'Student'}`}>
            <Head>
                <title>Student Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    {/* Stats */}
                    <div className="stats-grid">
                        <StatCard label="Attendance" value={`${data.attendance_percentage}%`} color={data.attendance_percentage >= 75 ? 'var(--accent-green)' : 'var(--accent-red)'} />
                        <StatCard label="Classes Attended" value={data.present_count + data.late_count} color="var(--accent-blue)" />
                        <StatCard label="Classes Absent" value={data.absent_count} color="var(--accent-red)" />
                        <StatCard label="Enrolled Courses" value={data.courses?.length || 0} color="var(--accent-purple)" />
                    </div>

                    {/* Assigned Staff */}
                    {(data.assigned_mentor || data.assigned_teacher) && (
                        <div className="stats-grid" style={{ marginBottom: '4px' }}>
                            {data.assigned_mentor && (
                                <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(155,89,182,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e44ad', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                                        {data.assigned_mentor.name[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Mentor</div>
                                        <div style={{ fontWeight: 600 }}>{data.assigned_mentor.name}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{data.assigned_mentor.email}</div>
                                    </div>
                                </div>
                            )}
                            {data.assigned_teacher && (
                                <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(52,152,219,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2980b9', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                                        {data.assigned_teacher.name[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Teacher</div>
                                        <div style={{ fontWeight: 600 }}>{data.assigned_teacher.name}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{data.assigned_teacher.email}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upcoming Classes */}
                    <h3 className="section-heading">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Upcoming Classes
                    </h3>
                    {data.upcoming_classes?.length > 0 ? (
                        data.upcoming_classes.map((cls) => (
                            <div key={cls.id} className="class-card glass-card">
                                <div className="class-card-info">
                                    <h4>{cls.title}</h4>
                                    <p>{cls.course_name}</p>
                                </div>
                                <div className="class-card-meta">
                                    <span className="class-time">
                                        {formatDate(cls.scheduled_time)} &middot; {formatTime(cls.scheduled_time)}
                                    </span>
                                    {cls.meeting_link && (
                                        <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="glass-btn primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                            Join Class
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card empty-state">
                            <h3>No upcoming classes</h3>
                            <p>Check back later for your schedule.</p>
                        </div>
                    )}

                    {/* Enrolled Courses */}
                    {data.courses?.length > 0 && (
                        <>
                            <h3 className="section-heading" style={{ marginTop: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                My Courses
                            </h3>
                            <div className="stats-grid">
                                {data.courses.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: '16px' }}>
                                        <h4 style={{ marginBottom: '4px' }}>{c.name}</h4>
                                        {c.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.description.substring(0, 80)}</p>}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className="alert alert-error">Failed to load dashboard data.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(StudentDashboard, ['student']);
