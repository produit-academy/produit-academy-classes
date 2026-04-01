import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';

function MentorDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/api/classes/mentor/dashboard/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout title={`Welcome, ${user?.first_name || user?.username || 'Mentor'}`}>
            <Head>
                <title>Mentor Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    <div className="stats-grid">
                        <StatCard label="Assigned Students" value={data.total_students} color="var(--accent-blue)" />
                        <StatCard label="At-Risk Students" value={data.at_risk_students?.length || 0} color={data.at_risk_students?.length > 0 ? 'var(--accent-red)' : 'var(--accent-green)'} />
                    </div>

                    {/* At-Risk Students Alert */}
                    {data.at_risk_students?.length > 0 && (
                        <>
                            <h3 className="section-heading">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                At-Risk Students (&lt; 75% Attendance)
                            </h3>
                            <div className="glass-card data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Email</th>
                                            <th>Attendance</th>
                                            <th>Classes</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.at_risk_students.map((s) => (
                                            <tr key={s.id}>
                                                <td><strong>{s.first_name} {s.last_name}</strong></td>
                                                <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                                                <td style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{s.attendance_percentage}%</td>
                                                <td>{s.attended}/{s.total_classes}</td>
                                                <td>
                                                    <a href={`mailto:${s.email}`} className="glass-btn" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>Contact</a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* All Students */}
                    <h3 className="section-heading" style={{ marginTop: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        All Assigned Students
                    </h3>
                    {data.all_students?.length > 0 ? (
                        <div className="glass-card data-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.all_students.map((s) => (
                                        <tr key={s.id}>
                                            <td><strong>{s.first_name} {s.last_name}</strong></td>
                                            <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                                            <td style={{ fontSize: '0.88rem' }}>{s.phone_number || '--'}</td>
                                            <td>
                                                <span style={{ color: s.attendance_percentage >= 75 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                                                    {s.attendance_percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="glass-card empty-state">
                            <h3>No students assigned</h3>
                            <p>Ask your admin to assign students to you.</p>
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
