import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPatch, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';

function TeacherDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [demoLink, setDemoLink] = useState('');
    const [submittingLinkId, setSubmittingLinkId] = useState(null);

    // Cancel modal
    const [cancelId, setCancelId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const loadData = () => {
        setLoading(true);
        apiGet('/api/classes/teacher/dashboard/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitMeetingLink = async (classId) => {
        if (!demoLink) return;
        setSubmittingLinkId(classId);
        try {
            await apiPatch(`/api/classes/teacher/demo/${classId}/link/`, { meeting_link: demoLink });
            setDemoLink('');
            loadData();
        } catch (error) {
            console.error('Failed to submit link', error);
        } finally {
            setSubmittingLinkId(null);
        }
    };

    const handleCancelSession = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation.');
            return;
        }
        setCancelling(true);
        try {
            const res = await apiPost(`/api/classes/session/${cancelId}/cancel/`, { reason: cancelReason });
            const d = await res.json();
            if (res.ok) {
                setCancelId(null);
                setCancelReason('');
                loadData();
            } else {
                alert(d.error || 'Failed to cancel session.');
            }
        } catch {
            alert('Network error.');
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout title={`Welcome, ${user?.first_name ? user.first_name : (user?.username?.split('@')[0] || 'Teacher')}`}>
            <Head>
                <title>Teacher Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    <div className="stats-grid">
                        <StatCard label="Total Classes Held" value={data.total_classes_held} color="var(--accent-green)" />
                        <StatCard label="Total Hours Taught" value={data.total_hours_worked} color="var(--accent-blue)" />
                    </div>

                    {/* Assigned Subjects */}
                    <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', borderLeft: '4px solid var(--accent-green)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                                Assigned Subjects
                            </h3>
                            <span style={{ fontSize: '0.82rem', background: 'rgba(51, 174, 120, 0.1)', color: 'var(--accent-green)', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                                {(data.assigned_subjects?.length || data.courses?.length || 0)} Subject{( (data.assigned_subjects?.length || data.courses?.length || 0) === 1 ? '' : 's')}
                            </span>
                        </div>

                        {data.assigned_subjects?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {data.assigned_subjects.map((sub) => (
                                    <div 
                                        key={sub.id} 
                                        style={{ 
                                            background: '#f8fafc', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '10px', 
                                            padding: '10px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'rgba(51, 174, 120, 0.12)',
                                            color: 'var(--accent-green)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            fontWeight: 700
                                        }}>
                                            {sub.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{sub.name}</div>
                                            {sub.course_name && (
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                    {sub.course_name} {sub.grade_level ? `• ${sub.grade_level}` : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : data.courses?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {data.courses.map((crs) => (
                                    <div 
                                        key={crs.id} 
                                        style={{ 
                                            background: '#f8fafc', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '10px', 
                                            padding: '10px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'rgba(51, 174, 120, 0.12)',
                                            color: 'var(--accent-green)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            fontWeight: 700
                                        }}>
                                            {crs.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{crs.name}</div>
                                            {crs.grade_level && (
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                    {crs.grade_level}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', padding: '6px 0' }}>
                                No subjects have been assigned to your profile yet. Please contact an administrator to assign your teaching subjects.
                            </div>
                        )}
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
                                            <p>{cls.course_name} • {cls.student_name}</p>
                                        </div>
                                        <div className="class-card-meta">
                                            <span className="class-time">
                                                {formatDate(cls.scheduled_time)} &middot; {formatTime(cls.scheduled_time)}
                                            </span>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {cls.meeting_link ? (
                                                    <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="glass-btn primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                                        Start Class
                                                    </a>
                                                ) : cls.is_demo ? (
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Paste Google Meet Link" 
                                                            value={submittingLinkId === cls.id ? '' : demoLink}
                                                            onChange={(e) => setDemoLink(e.target.value)}
                                                            className="glass-input"
                                                            style={{ padding: '6px 12px', fontSize: '0.85rem', width: '200px' }}
                                                        />
                                                        <button 
                                                            onClick={() => submitMeetingLink(cls.id)}
                                                            disabled={submittingLinkId === cls.id}
                                                            className="glass-btn primary" 
                                                            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                                        >
                                                            {submittingLinkId === cls.id ? 'Saving...' : 'Save Link'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No link provided</span>
                                                )}
                                                <button
                                                    onClick={() => setCancelId(cls.id)}
                                                    className="glass-btn"
                                                    style={{ fontSize: '0.8rem', padding: '6px 12px', color: 'var(--accent-red)', borderColor: 'rgba(231,76,60,0.3)' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card empty-state">
                                    <h3>No upcoming classes</h3>
                                    <p>You have no scheduled sessions.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Students */}
                    {data.assigned_students?.length > 0 && (
                        <>
                            <h3 className="section-heading" style={{ marginTop: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                My Students ({data.assigned_students.length})
                            </h3>
                            <div className="glass-card data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Email</th>
                                            <th>Courses</th>
                                            <th>Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.assigned_students.map(s => (
                                            <tr key={s.id}>
                                                <td><strong>{s.first_name} {s.last_name}</strong></td>
                                                <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                                                <td style={{ fontSize: '0.85rem' }}>
                                                    {s.courses?.length > 0 ? s.courses.join(', ') : '-'}
                                                </td>
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
                        </>
                    )}

                    {/* Cancel Session Modal */}
                    {cancelId && (
                        <div className="modal-overlay" onClick={() => setCancelId(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
                                <h3 style={{ color: 'var(--accent-red)' }}>Cancel Class</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    Please provide a reason for cancellation. The student will be notified.
                                </p>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label>Reason</label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="e.g. Personal emergency, schedule conflict, illness..."
                                        value={cancelReason}
                                        onChange={e => setCancelReason(e.target.value)}
                                        style={{ resize: 'vertical' }}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="glass-btn outline" onClick={() => { setCancelId(null); setCancelReason(''); }}>Go Back</button>
                                    <button
                                        type="button"
                                        className="glass-btn primary"
                                        disabled={cancelling || !cancelReason.trim()}
                                        onClick={handleCancelSession}
                                        style={{ background: 'var(--accent-red)' }}
                                    >
                                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                                    </button>
                                </div>
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

export default withAuth(TeacherDashboard, ['teacher', 'admin']);

