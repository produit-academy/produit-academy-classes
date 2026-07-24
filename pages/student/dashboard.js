import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';

function StudentDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);

    // Cancel modal
    const [cancelId, setCancelId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const loadData = () => {
        setLoading(true);
        apiGet('/api/classes/student/dashboard/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleAcceptDemo = async (demoId) => {
        setAcceptingId(demoId);
        try {
            const res = await apiPost(`/api/classes/student/demo/${demoId}/accept/`);
            if (res.ok) {
                loadData();
            } else {
                const d = await res.json();
                alert(d.error || 'Failed to accept demo');
            }
        } catch (err) {
            console.error('Failed to accept demo', err);
        } finally {
            setAcceptingId(null);
        }
    };

    const handleRejectDemo = async (demoId) => {
        if (!confirm('Are you sure you want to request a new teacher? This will notify the admin.')) return;
        setAcceptingId(demoId);
        try {
            const res = await apiPost(`/api/classes/student/demo/${demoId}/reject/`);
            if (res.ok) {
                loadData();
            } else {
                const d = await res.json();
                alert(d.error || 'Failed to reject demo');
            }
        } catch (err) {
            console.error('Failed to reject demo', err);
        } finally {
            setAcceptingId(null);
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
        <DashboardLayout title={`Welcome, ${user?.first_name ? user.first_name : (user?.username?.split('@')[0] || 'Student')}`}>
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
                    {(data.assigned_teachers?.length > 0) && (
                        <div style={{ marginBottom: '4px' }}>
                            <div className="stats-grid">
                                {data.assigned_teachers.map((t, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(52,152,219,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2980b9', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                                            {t.name?.[0] || 'T'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Teacher · {t.course_name}
                                            </div>
                                            <div style={{ fontWeight: 600 }}>{t.name}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Demos - Accept Section */}
                    {data.completed_demos?.length > 0 && (
                        <>
                            <h3 className="section-heading">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                Demo Results - Ready to Accept
                            </h3>
                            {data.completed_demos.map((demo) => (
                                <div key={demo.id} className="class-card glass-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
                                    <div className="class-card-info">
                                        <h4>
                                            {demo.title}
                                            <span style={{ marginLeft: '8px', fontSize: '0.72rem', background: 'rgba(155,89,182,0.12)', color: '#8e44ad', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>DEMO</span>
                                        </h4>
                                        <p>{demo.course_name}</p>
                                    </div>
                                    <div className="class-card-meta">
                                        <span className="class-time">
                                            {formatDate(demo.scheduled_time)}
                                        </span>
                                        <button
                                            onClick={() => handleAcceptDemo(demo.id)}
                                            disabled={acceptingId === demo.id}
                                            className="glass-btn primary"
                                            style={{ fontSize: '0.85rem', padding: '8px 20px', marginRight: '8px' }}
                                        >
                                            {acceptingId === demo.id ? 'Processing...' : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{verticalAlign:'middle',marginRight:'4px'}}><polyline points="20 6 9 17 4 12"/></svg>Accept Teacher</>}
                                        </button>
                                        <button
                                            onClick={() => handleRejectDemo(demo.id)}
                                            disabled={acceptingId === demo.id}
                                            className="glass-btn outline"
                                            style={{ fontSize: '0.85rem', padding: '8px 16px', color: 'var(--accent-red)', borderColor: 'rgba(231,76,60,0.3)' }}
                                        >
                                            Request New
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Upcoming Classes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '16px' }}>
                        <h3 className="section-heading" style={{ margin: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Upcoming Classes
                        </h3>
                        <button onClick={() => router.push('/courses')} className="glass-btn primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            + Book a Class
                        </button>
                    </div>
                    {data.upcoming_classes?.length > 0 ? (
                        data.upcoming_classes.map((cls) => (
                            <div key={cls.id} className="class-card glass-card">
                                <div className="class-card-info">
                                    <h4>
                                        {cls.title}
                                        {cls.is_demo && (
                                            <span style={{ marginLeft: '8px', fontSize: '0.72rem', background: 'rgba(241,196,15,0.15)', color: '#d4a017', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>DEMO</span>
                                        )}
                                    </h4>
                                    <p>{cls.course_name}</p>
                                </div>
                                <div className="class-card-meta">
                                    <span className="class-time">
                                        {formatDate(cls.scheduled_time)} &middot; {formatTime(cls.scheduled_time)}
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            Teacher: {cls.teacher_name}
                                        </div>
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {cls.meeting_link && (
                                            <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="glass-btn primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                                Join Class
                                            </a>
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

                    {/* Cancel Session Modal */}
                    {cancelId && (
                        <div className="modal-overlay" onClick={() => setCancelId(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
                                <h3 style={{ color: 'var(--accent-red)' }}>Cancel Class</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    Please provide a reason for cancellation. Your teacher will be notified.
                                </p>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label>Reason</label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="e.g. Family function, health issue, exam preparation..."
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

export default withAuth(StudentDashboard, ['student']);
