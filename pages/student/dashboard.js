import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import AttendanceChart from '../../components/AttendanceChart';

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
        <DashboardLayout title={`Welcome, ${user?.username || 'Student'}`}>
            <Head>
                <title>Student Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    {/* Stats Row */}
                    <div className="stats-grid">
                        <StatCard
                            label="Attendance Rate"
                            value={`${data.attendance_percentage}%`}
                            color="var(--accent-green)"
                        />
                        <StatCard
                            label="Classes Attended"
                            value={data.present_count + data.late_count}
                            sublabel={`of ${data.total_classes} total`}
                            color="var(--accent-blue)"
                        />
                        <StatCard
                            label="Classes Missed"
                            value={data.absent_count}
                            color="var(--accent-red)"
                        />
                        <StatCard
                            label="Enrolled Courses"
                            value={data.courses?.length || 0}
                            color="var(--accent-purple)"
                        />
                    </div>

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
                                            <a
                                                href={cls.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="glass-btn primary"
                                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                            >
                                                Join Live Class
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card empty-state">
                                    <h3>No upcoming classes</h3>
                                    <p>Your scheduled classes will appear here.</p>
                                </div>
                            )}
                        </div>

                        {/* Attendance Chart */}
                        <div>
                            <AttendanceChart
                                present={data.present_count}
                                absent={data.absent_count}
                                late={data.late_count}
                            />

                            {/* Enrolled Courses */}
                            <div style={{ marginTop: '20px' }}>
                                <h3 className="section-heading">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                    My Courses
                                </h3>
                                {data.courses?.map((course) => (
                                    <div key={course.id} className="glass-card" style={{ padding: '14px 18px', marginBottom: '10px' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{course.name}</h4>
                                        {course.description && (
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{course.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="alert alert-error">Failed to load dashboard data.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(StudentDashboard, ['student']);
