import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPatch, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import {
    Video, Calendar, Clock, AlertTriangle, CheckCircle2, XCircle,
    FileText, Mic, Link as LinkIcon, ExternalLink, RefreshCw, X
} from 'lucide-react';

function TeacherDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Outcome Modal State
    const [outcomeSession, setOutcomeSession] = useState(null);
    const [outcomeStatus, setOutcomeStatus] = useState('Completed');
    const [outcomeRemarks, setOutcomeRemarks] = useState('');
    const [outcomeLoading, setOutcomeLoading] = useState(false);

    // Meet Link Modal State
    const [meetSession, setMeetSession] = useState(null);
    const [meetUrl, setMeetUrl] = useState('');
    const [meetLoading, setMeetLoading] = useState(false);

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

    const handleMarkOutcome = async () => {
        if (!outcomeSession) return;
        setOutcomeLoading(true);
        try {
            const res = await apiPost(`/api/classes/session/${outcomeSession.id}/outcome/`, {
                status: outcomeStatus,
                remarks: outcomeRemarks
            });
            const d = await res.json();
            if (res.ok) {
                setOutcomeSession(null);
                setOutcomeRemarks('');
                loadData();
            } else {
                alert(d.error || 'Failed to update class outcome.');
            }
        } catch {
            alert('Network error updating class outcome.');
        } finally {
            setOutcomeLoading(false);
        }
    };

    const handleUpdateMeetLink = async () => {
        if (!meetSession) return;
        if (!meetUrl.trim()) {
            alert('Please enter a Google Meet link.');
            return;
        }
        setMeetLoading(true);
        try {
            const res = await apiPost(`/api/classes/session/${meetSession.id}/meet-link/`, {
                meeting_link: meetUrl.trim()
            });
            const d = await res.json();
            if (res.ok) {
                setMeetSession(null);
                setMeetUrl('');
                loadData();
            } else {
                alert(d.error || 'Failed to update Google Meet link.');
            }
        } catch {
            alert('Network error updating Meet link.');
        } finally {
            setMeetLoading(false);
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
        <DashboardLayout title={`Faculty Dashboard // ${user?.first_name ? user.first_name : (user?.username?.split('@')[0] || 'Teacher')}`}>
            <Head>
                <title>Teacher Dashboard | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    {/* Live Session Alert Banner */}
                    {data.live_sessions?.length > 0 && (
                        <div style={{
                            background: '#ecfdf5',
                            border: '1px solid #10b981',
                            borderLeft: '6px solid #059669',
                            padding: '18px 24px',
                            marginBottom: '24px',
                            boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '16px'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span className="status-badge badge-live">LIVE IN PROGRESS</span>
                                    <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 700 }}>Scheduled Class is Active Now</span>
                                </div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
                                    {data.live_sessions[0].title} &middot; {data.live_sessions[0].course_name}
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: '#047857', margin: '4px 0 0' }}>
                                    Student: <strong>{data.live_sessions[0].student_name}</strong> &middot; Time: {formatTime(data.live_sessions[0].scheduled_time)}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {data.live_sessions[0].meeting_link && (
                                    <a
                                        href={data.live_sessions[0].meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            background: '#059669',
                                            color: '#ffffff',
                                            padding: '10px 20px',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            borderRadius: '0px',
                                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                                        }}
                                    >
                                        <Video size={16} />
                                        <span>Join Google Meet</span>
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        setOutcomeSession(data.live_sessions[0]);
                                        setOutcomeStatus('Completed');
                                    }}
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #10b981',
                                        color: '#065f46',
                                        padding: '10px 16px',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        borderRadius: '0px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    End & Mark Outcome
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Needs Outcome Review Banner (Elapsed classes) */}
                    {data.needs_review_classes?.length > 0 && (
                        <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderLeft: '5px solid #d97706',
                            padding: '18px 22px',
                            marginBottom: '24px',
                            borderRadius: '0px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertTriangle size={20} color="#d97706" />
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#92400e' }}>
                                        Classes Awaiting Outcome Confirmation ({data.needs_review_classes.length})
                                    </h4>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
                                    Scheduled class time has passed. Please confirm if class was conducted or missed.
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.needs_review_classes.map(sess => (
                                    <div key={sess.id} style={{
                                        background: '#ffffff',
                                        border: '1px solid #fef3c7',
                                        padding: '12px 18px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                                                {sess.title} &middot; {sess.course_name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                Student: <strong>{sess.student_name}</strong> &middot; Scheduled: {formatDate(sess.scheduled_time)} at {formatTime(sess.scheduled_time)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setOutcomeSession(sess);
                                                setOutcomeStatus('Completed');
                                            }}
                                            className="glass-btn primary"
                                            style={{ borderRadius: '0px', padding: '6px 14px', fontSize: '0.82rem', background: '#d97706' }}
                                        >
                                            Confirm Outcome
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stat Metrics Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '28px'
                    }}>
                        <div className="glass-card" style={{ padding: '20px', borderRadius: '0px', borderLeft: '4px solid #10b981' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Classes Conducted</span>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{data.classes_conducted || 0}</h3>
                            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Completed successfully</span>
                        </div>

                        <div className="glass-card" style={{ padding: '20px', borderRadius: '0px', borderLeft: '4px solid #f59e0b' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Needs Review</span>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', margin: '4px 0 0' }}>{data.needs_review_count || 0}</h3>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Outcome not marked</span>
                        </div>

                        <div className="glass-card" style={{ padding: '20px', borderRadius: '0px', borderLeft: '4px solid #ef4444' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Not Conducted</span>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', margin: '4px 0 0' }}>{data.not_conducted || 0}</h3>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Missed / Cancelled</span>
                        </div>

                        <div className="glass-card" style={{ padding: '20px', borderRadius: '0px', borderLeft: '4px solid #3b82f6' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Confirmed Earnings</span>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', margin: '4px 0 0' }}>₹{parseFloat(data.total_earnings || 0).toLocaleString('en-IN')}</h3>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Completed classes only</span>
                        </div>
                    </div>

                    {/* Quick Faculty Actions */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '28px'
                    }}>
                        <div
                            onClick={() => router.push('/teacher/reports')}
                            className="glass-card pro-card-hover"
                            style={{
                                padding: '18px 22px',
                                borderRadius: '0px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}
                        >
                            <div style={{ background: '#f0fdf4', padding: '12px', color: '#16a34a' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                                    Submit Student Class Report
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                    Rate performance, add observations, and upload PDF assessment.
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={() => router.push('/teacher/reports')}
                            className="glass-card pro-card-hover"
                            style={{
                                padding: '18px 22px',
                                borderRadius: '0px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}
                        >
                            <div style={{ background: '#fef2f2', padding: '12px', color: '#dc2626' }}>
                                <Mic size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                                    Record Daily Voice Note
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                    Record audio recap for today's classes and student progress.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Sessions */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} color="var(--accent-green-dark)" />
                                Upcoming Scheduled Classes
                            </h3>
                        </div>

                        {data.upcoming_classes?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.upcoming_classes.map(cls => (
                                    <div key={cls.id} className="glass-card" style={{
                                        padding: '18px 22px',
                                        borderRadius: '0px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '16px'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                                    {cls.title}
                                                </h4>
                                                {cls.has_meet_link ? (
                                                    <span className="badge-meet-ready">Meet Link Ready</span>
                                                ) : (
                                                    <span className="badge-meet-missing">Meet Link Pending</span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                                                {cls.course_name} &middot; Student: <strong style={{ color: '#1e293b' }}>{cls.student_name}</strong>
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <div style={{
                                                fontSize: '0.82rem', color: '#334155', fontWeight: 600,
                                                background: '#f8fafc', padding: '6px 12px', border: '1px solid #e2e8f0'
                                            }}>
                                                <Clock size={13} style={{ display: 'inline', marginRight: '5px' }} />
                                                {formatDate(cls.scheduled_time)} &middot; {formatTime(cls.scheduled_time)}
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {cls.meeting_link ? (
                                                    <a
                                                        href={cls.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            background: '#047857',
                                                            color: '#ffffff',
                                                            padding: '6px 14px',
                                                            borderRadius: '0px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <Video size={13} />
                                                        <span>Join Class</span>
                                                    </a>
                                                ) : null}

                                                <button
                                                    onClick={() => {
                                                        setMeetSession(cls);
                                                        setMeetUrl(cls.meeting_link || '');
                                                    }}
                                                    style={{
                                                        background: '#ffffff',
                                                        border: '1px solid #cbd5e1',
                                                        color: '#0f172a',
                                                        padding: '6px 12px',
                                                        borderRadius: '0px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <LinkIcon size={12} />
                                                    <span>{cls.meeting_link ? 'Edit Link' : 'Add Meet Link'}</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setOutcomeSession(cls);
                                                        setOutcomeStatus('Completed');
                                                    }}
                                                    style={{
                                                        background: '#ffffff',
                                                        border: '1px solid #cbd5e1',
                                                        color: '#334155',
                                                        padding: '6px 12px',
                                                        borderRadius: '0px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Mark Outcome
                                                </button>

                                                <button
                                                    onClick={() => setCancelId(cls.id)}
                                                    style={{
                                                        background: '#ffffff',
                                                        border: '1px solid #fecaca',
                                                        color: '#dc2626',
                                                        padding: '6px 10px',
                                                        borderRadius: '0px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card empty-state" style={{ borderRadius: '0px', padding: '36px', textAlign: 'center' }}>
                                <p style={{ color: '#64748b', margin: 0 }}>No upcoming classes scheduled.</p>
                            </div>
                        )}
                    </div>

                    {/* Outcome Modal */}
                    {outcomeSession && (
                        <div className="modal-overlay" onClick={() => setOutcomeSession(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', borderRadius: '0px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                                        Confirm Class Outcome
                                    </h3>
                                    <button onClick={() => setOutcomeSession(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                                </div>

                                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
                                    Update final status for <strong>{outcomeSession.title}</strong> with student <strong>{outcomeSession.student_name}</strong>.
                                </p>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Class Outcome *
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setOutcomeStatus('Completed')}
                                            style={{
                                                padding: '12px',
                                                border: outcomeStatus === 'Completed' ? '2px solid #059669' : '1px solid #cbd5e1',
                                                background: outcomeStatus === 'Completed' ? '#ecfdf5' : '#ffffff',
                                                color: outcomeStatus === 'Completed' ? '#065f46' : '#334155',
                                                fontWeight: 700,
                                                fontSize: '0.88rem',
                                                cursor: 'pointer',
                                                borderRadius: '0px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <CheckCircle2 size={16} />
                                            <span>Completed</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setOutcomeStatus('Not Conducted')}
                                            style={{
                                                padding: '12px',
                                                border: outcomeStatus === 'Not Conducted' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                                                background: outcomeStatus === 'Not Conducted' ? '#fef2f2' : '#ffffff',
                                                color: outcomeStatus === 'Not Conducted' ? '#991b1b' : '#334155',
                                                fontWeight: 700,
                                                fontSize: '0.88rem',
                                                cursor: 'pointer',
                                                borderRadius: '0px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <XCircle size={16} />
                                            <span>Not Conducted</span>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Remarks / Notes:
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder={outcomeStatus === 'Completed' ? 'Summary of topics covered, attendance notes...' : 'Reason class was not conducted (student absent, emergency...)'}
                                        value={outcomeRemarks}
                                        onChange={(e) => setOutcomeRemarks(e.target.value)}
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="glass-btn outline"
                                        onClick={() => setOutcomeSession(null)}
                                        style={{ borderRadius: '0px' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleMarkOutcome}
                                        disabled={outcomeLoading}
                                        className="glass-btn primary"
                                        style={{ borderRadius: '0px' }}
                                    >
                                        {outcomeLoading ? 'Saving...' : 'Confirm Outcome'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Google Meet Link Modal */}
                    {meetSession && (
                        <div className="modal-overlay" onClick={() => setMeetSession(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', borderRadius: '0px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Video size={20} color="#059669" />
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                                            Set Google Meet Link
                                        </h3>
                                    </div>
                                    <button onClick={() => setMeetSession(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                                </div>

                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                                    Adding or updating the link will automatically email the student with joining instructions.
                                </p>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Google Meet URL:
                                    </label>
                                    <input
                                        type="url"
                                        className="input-field"
                                        placeholder="https://meet.google.com/abc-defg-hij"
                                        value={meetUrl}
                                        onChange={(e) => setMeetUrl(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="glass-btn outline"
                                        onClick={() => setMeetSession(null)}
                                        style={{ borderRadius: '0px' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUpdateMeetLink}
                                        disabled={meetLoading || !meetUrl.trim()}
                                        className="glass-btn primary"
                                        style={{ borderRadius: '0px' }}
                                    >
                                        {meetLoading ? 'Updating...' : 'Save & Email Student'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancel Session Modal */}
                    {cancelId && (
                        <div className="modal-overlay" onClick={() => setCancelId(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', borderRadius: '0px' }}>
                                <h3 style={{ color: '#dc2626', margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 800 }}>
                                    Cancel Class Session
                                </h3>
                                <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.88rem' }}>
                                    Please provide a reason for cancellation. The student will be notified.
                                </p>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Cancellation Reason *
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="e.g. Schedule emergency, power outage..."
                                        value={cancelReason}
                                        onChange={e => setCancelReason(e.target.value)}
                                        style={{ width: '100%', resize: 'vertical' }}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="glass-btn outline" style={{ borderRadius: '0px' }} onClick={() => { setCancelId(null); setCancelReason(''); }}>Go Back</button>
                                    <button
                                        type="button"
                                        className="glass-btn danger"
                                        style={{ borderRadius: '0px' }}
                                        disabled={cancelling || !cancelReason.trim()}
                                        onClick={handleCancelSession}
                                    >
                                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="alert alert-error">Failed to load faculty dashboard.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(TeacherDashboard, ['teacher', 'admin']);
