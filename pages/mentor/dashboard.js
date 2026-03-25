import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';

function MentorDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/api/classes/mentor/dashboard/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout title="Mentor Dashboard">
            <Head>
                <title>Mentor Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    <div className="stats-grid">
                        <StatCard label="Courses Assigned" value={data.courses?.length || 0} color="var(--accent-green)" />
                        <StatCard label="Total Students" value={data.total_students} color="var(--accent-blue)" />
                        <StatCard label="Classes This Week" value={data.total_classes_this_week} color="var(--accent-purple)" />
                        <StatCard
                            label="At-Risk Students"
                            value={data.at_risk_students?.length || 0}
                            color={data.at_risk_students?.length > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}
                        />
                    </div>

                    {/* At-Risk Students Table */}
                    {data.at_risk_students?.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <h3 className="section-heading">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                At-Risk Students (Below 75% Attendance)
                            </h3>
                            <div className="glass-card data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Attendance</th>
                                            <th>Classes</th>
                                            <th>Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.at_risk_students.map((s, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <strong>{s.username}</strong>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.email}</div>
                                                </td>
                                                <td>{s.course_name}</td>
                                                <td>
                                                    <span className={`badge ${s.attendance_percentage < 50 ? 'badge-absent' : 'badge-late'}`}>
                                                        {s.attendance_percentage}%
                                                    </span>
                                                </td>
                                                <td>{s.attended} / {s.total_classes}</td>
                                                <td>
                                                    {s.phone_number ? (
                                                        <a href={`tel:${s.phone_number}`} style={{ fontSize: '0.85rem' }}>
                                                            {s.phone_number}
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Teacher Compliance */}
                    {data.teacher_compliance?.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <h3 className="section-heading">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                                Teacher Compliance
                            </h3>
                            <div className="glass-card data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Teacher</th>
                                            <th>Course</th>
                                            <th>Total Sessions</th>
                                            <th>Attendance Marked</th>
                                            <th>Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.teacher_compliance.map((t, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <strong>{t.username}</strong>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.email}</div>
                                                </td>
                                                <td>{t.course_name}</td>
                                                <td>{t.total_sessions}</td>
                                                <td>
                                                    <span className="badge badge-completed">{t.attendance_marked}</span>
                                                </td>
                                                <td>
                                                    {t.attendance_pending > 0 ? (
                                                        <span className="badge badge-absent">{t.attendance_pending}</span>
                                                    ) : (
                                                        <span className="badge badge-completed">0</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Courses Overview */}
                    {data.courses?.length > 0 && (
                        <div>
                            <h3 className="section-heading">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                My Courses
                            </h3>
                            <div className="stats-grid">
                                {data.courses.map((course) => (
                                    <div key={course.id} className="glass-card" style={{ padding: '18px 20px' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>{course.name}</h4>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            {course.student_count} students &middot; {course.teacher_list?.length || 0} teachers
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="alert alert-error">Failed to load dashboard data.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(MentorDashboard, ['mentor', 'admin']);
