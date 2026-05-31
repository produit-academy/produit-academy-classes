import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import SearchableCourseSelect from '../../components/SearchableCourseSelect';

function MentorDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Schedule Demo state
    const [teachers, setTeachers] = useState([]);
    const [demoForm, setDemoForm] = useState({ studentId: '', teacherId: '', courseId: '', scheduledTime: '' });
    const [demoSubmitting, setDemoSubmitting] = useState(false);
    const [demoMsg, setDemoMsg] = useState(null);
    const [demoErr, setDemoErr] = useState(null);
    const [showDemoForm, setShowDemoForm] = useState(false);

    useEffect(() => {
        apiGet('/api/classes/mentor/dashboard/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));

        apiGet('/api/classes/admin/staff/').then(list => {
            setTeachers((Array.isArray(list) ? list : []).filter(s => s.role === 'teacher'));
        }).catch(() => {});
    }, []);

    const handleScheduleDemo = async (e) => {
        e.preventDefault();
        const { studentId, teacherId, courseId, scheduledTime } = demoForm;
        if (!studentId || !teacherId || !courseId || !scheduledTime) {
            setDemoErr('All fields are required.');
            return;
        }
        setDemoSubmitting(true);
        setDemoMsg(null);
        setDemoErr(null);
        try {
            const res = await apiPost('/api/classes/schedule-demo/', {
                student_id: parseInt(studentId),
                teacher_id: parseInt(teacherId),
                course_id: parseInt(courseId),
                scheduled_time: new Date(scheduledTime).toISOString(),
            });
            const d = await res.json();
            if (res.ok) {
                setDemoMsg('Demo scheduled! The teacher will be notified.');
                setDemoForm({ studentId: '', teacherId: '', courseId: '', scheduledTime: '' });
            } else {
                setDemoErr(d.error || 'Failed to schedule.');
            }
        } catch {
            setDemoErr('Network error.');
        } finally {
            setDemoSubmitting(false);
        }
    };

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

                    {/* Schedule Demo Toggle */}
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            className="glass-btn primary"
                            onClick={() => setShowDemoForm(!showDemoForm)}
                            style={{ padding: '10px 20px' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {showDemoForm ? 'Hide Demo Form' : 'Schedule a Demo Class'}
                        </button>
                    </div>

                    {showDemoForm && (
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '640px' }}>
                            <h3 className="section-heading" style={{ marginBottom: '16px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Schedule 1-to-1 Demo
                            </h3>
                            {demoMsg && <div className="alert alert-success">{demoMsg}</div>}
                            {demoErr && <div className="alert alert-error">{demoErr}</div>}
                            <form onSubmit={handleScheduleDemo}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>Student</label>
                                        <select className="input-field" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.92rem' }}
                                            value={demoForm.studentId} onChange={(e) => setDemoForm({ ...demoForm, studentId: e.target.value })} required>
                                            <option value="">Select student...</option>
                                            {data.all_students?.map(s => (
                                                <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>Teacher</label>
                                        <select className="input-field" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.92rem' }}
                                            value={demoForm.teacherId} onChange={(e) => setDemoForm({ ...demoForm, teacherId: e.target.value })} required>
                                            <option value="">Select teacher...</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>Course</label>
                                        <SearchableCourseSelect
                                            value={demoForm.courseId}
                                            onChange={(id) => setDemoForm({ ...demoForm, courseId: id ? String(id) : '' })}
                                            placeholder="Search or select course..."
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>Date & Time</label>
                                        <input className="input-field" type="datetime-local" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.92rem' }}
                                            value={demoForm.scheduledTime} onChange={(e) => setDemoForm({ ...demoForm, scheduledTime: e.target.value })} required />
                                    </div>
                                </div>
                                <button type="submit" className="glass-btn primary" disabled={demoSubmitting} style={{ padding: '10px 20px', marginTop: '12px' }}>
                                    {demoSubmitting ? 'Scheduling...' : 'Schedule Demo'}
                                </button>
                            </form>
                        </div>
                    )}

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

                    {/* Cancelled Sessions */}
                    {data.cancelled_sessions?.length > 0 && (
                        <>
                            <h3 className="section-heading" style={{ marginTop: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                Recently Cancelled Classes
                            </h3>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {data.cancelled_sessions.map((s) => (
                                    <div key={s.id} className="glass-card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-red)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                            <div>
                                                <h4 style={{ marginBottom: '4px' }}>{s.title}</h4>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                    {s.course_name} &middot; Student: {s.student_name}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    Scheduled: {new Date(s.scheduled_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                background: 'rgba(231,76,60,0.1)',
                                                color: 'var(--accent-red)',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                Cancelled by {s.cancelled_by_role}
                                            </span>
                                        </div>
                                        <div style={{
                                            marginTop: '10px',
                                            padding: '10px 14px',
                                            background: 'rgba(231,76,60,0.05)',
                                            borderRadius: '8px',
                                            fontSize: '0.88rem',
                                            color: 'var(--text-primary)'
                                        }}>
                                            <strong>Reason:</strong> {s.cancel_reason || 'No reason provided'}
                                        </div>
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

export default withAuth(MentorDashboard, ['mentor', 'admin']);
