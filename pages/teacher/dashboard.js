import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';

function TeacherDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/api/classes/teacher/dashboard/')
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
        <DashboardLayout title={`Welcome, ${user?.username || 'Teacher'}`}>
            <Head>
                <title>Teacher Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    <div className="stats-grid">
                        <StatCard label="Total Classes Held" value={data.total_classes_held} color="var(--accent-green)" />
                        <StatCard label="Total Students" value={data.total_students} color="var(--accent-blue)" />
                        <StatCard label="Assigned Courses" value={data.courses?.length || 0} color="var(--accent-purple)" />
                        <StatCard
                            label="Pending Attendance"
                            value={data.pending_attendance?.length || 0}
                            color={data.pending_attendance?.length > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}
                        />
                    </div>

                    {/* Pending Attendance Alert */}
                    {data.pending_attendance?.length > 0 && (
                        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                            <strong>Action Required:</strong> You have {data.pending_attendance.length} class(es) with pending attendance.
                        </div>
                    )}

                    <div className="dashboard-grid">
                        {/* Upcoming Classes */}
                        <div>
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
                                            <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="glass-btn primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                                Start Class
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card empty-state">
                                    <h3>No upcoming classes</h3>
                                    <p>Create a new class to get started.</p>
                                    <a href="/teacher/create-class" className="glass-btn primary" style={{ marginTop: '12px' }}>Create Class</a>
                                </div>
                            )}
                        </div>

                        {/* Pending Attendance */}
                        <div>
                            <h3 className="section-heading">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
                                Attendance Pending
                            </h3>
                            {data.pending_attendance?.length > 0 ? (
                                data.pending_attendance.map((cls) => (
                                    <div key={cls.id} className="class-card glass-card">
                                        <div className="class-card-info">
                                            <h4>{cls.title}</h4>
                                            <p>{cls.course_name}</p>
                                        </div>
                                        <div className="class-card-meta">
                                            <span className="class-time">
                                                {formatDate(cls.scheduled_time)}
                                            </span>
                                            <a href={`/teacher/attendance/${cls.id}`} className="glass-btn" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                                Take Attendance
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card empty-state">
                                    <h3>All caught up</h3>
                                    <p>No pending attendance to submit.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="alert alert-error">Failed to load dashboard data.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(TeacherDashboard, ['teacher', 'admin']);
