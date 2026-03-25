import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/api/classes/admin/stats/')
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout title="Admin Dashboard">
            <Head>
                <title>Admin Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : stats ? (
                <>
                    <div className="stats-grid">
                        <StatCard label="Total Students" value={stats.total_students} color="var(--accent-green)" />
                        <StatCard label="Total Teachers" value={stats.total_teachers} color="var(--accent-blue)" />
                        <StatCard label="Total Mentors" value={stats.total_mentors} color="var(--accent-purple)" />
                        <StatCard label="Active Courses" value={stats.total_courses} color="var(--accent-yellow)" />
                    </div>

                    <div className="stats-grid">
                        <StatCard label="Classes This Month" value={stats.total_classes_this_month} color="var(--accent-blue)" />
                        <StatCard label="Active Students Today" value={stats.active_students_today} color="var(--accent-green)" />
                        <StatCard label="Overall Attendance" value={`${stats.overall_attendance_rate}%`} color={stats.overall_attendance_rate >= 75 ? 'var(--accent-green)' : 'var(--accent-red)'} />
                    </div>

                    {/* Quick Actions */}
                    <h3 className="section-heading" style={{ marginTop: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        Quick Actions
                    </h3>
                    <div className="stats-grid">
                        <a href="/admin/courses" style={{ textDecoration: 'none' }}>
                            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" style={{ marginBottom: '10px' }}>
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                                <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Manage Courses</h4>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Create, edit, or assign courses</p>
                            </div>
                        </a>
                        <a href="/admin/enrollments" style={{ textDecoration: 'none' }}>
                            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" style={{ marginBottom: '10px' }}>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Manage Enrollments</h4>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Enroll students via CSV or manual</p>
                            </div>
                        </a>
                    </div>
                </>
            ) : (
                <div className="alert alert-error">Failed to load dashboard data.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminDashboard, ['admin']);
