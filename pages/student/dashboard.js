// pages/student/dashboard.js - 70% Minimalist + 20% Futuristic + 10% Playful (Zero Emojis, Pure SVG)
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Activity, Calendar, Clock, Video, BookOpen,
    CheckCircle2, AlertCircle, Plus,
    Zap, ArrowRight, UserCheck, ShieldCheck, X,
    Star, FileText, Download, Mic
} from 'lucide-react';

function StudentDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);

    // Cancel modal state
    const [cancelId, setCancelId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const loadData = () => {
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
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    };

    const studentName = user?.first_name ? user.first_name : (user?.username?.split('@')[0] || 'Student');

    return (
        <DashboardLayout title={`Student Dashboard`}>
            <Head>
                <title>Dashboard | Produit Academy</title>
                <meta name="description" content="Student academic overview, upcoming live classes, and faculty assignments." />
            </Head>

            {loading ? (
                <div className="loading-container" style={{ minHeight: '320px' }}>
                    <div className="loading-spinner" />
                </div>
            ) : data ? (
                <>
                    {/* Minimal Welcome & Telemetry Banner */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0px',
                        padding: '24px 28px',
                        marginBottom: '28px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span className="telemetry-chip live">
                                    <span className="live-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '0px' }} />
                                    <span>Academic Session 2026 // Active</span>
                                </span>
                            </div>
                            <h2 style={{
                                fontFamily: "'Lora', serif",
                                fontSize: '1.65rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                margin: 0
                            }}>
                                Welcome back, {studentName}
                            </h2>
                        </div>
                    </div>

                    {/* Upcoming Class High-Priority Reminder Banner */}
                    {data.upcoming_classes?.length > 0 && (() => {
                        const nextClass = data.upcoming_classes[0];
                        return (
                            <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderLeft: '5px solid #16a34a',
                                padding: '18px 24px',
                                marginBottom: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '16px',
                                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        background: '#16a34a', color: '#fff', padding: '10px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Video size={22} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Upcoming Class Reminder
                                            </span>
                                            <span className="telemetry-chip live" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                                                Next Session
                                            </span>
                                        </div>
                                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                                            {nextClass.title} &middot; {nextClass.course_name}
                                        </h4>
                                        <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span>Faculty: <strong style={{ color: '#1e293b' }}>{nextClass.teacher_name}</strong></span>
                                            <span>&bull;</span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', fontWeight: 700 }}>
                                                <Clock size={13} />
                                                {formatDate(nextClass.scheduled_time)} at {formatTime(nextClass.scheduled_time)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {nextClass.meeting_link && (
                                    <a
                                        href={nextClass.meeting_link.startsWith('http') ? nextClass.meeting_link : `https://${nextClass.meeting_link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            background: '#16a34a',
                                            color: '#fff',
                                            padding: '10px 22px',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                                        }}
                                    >
                                        <Video size={16} />
                                        <span>Join Google Meet</span>
                                    </a>
                                )}
                            </div>
                        );
                    })()}

                    {/* Futuristic HUD Telemetry Stat Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                        {/* Attendance Card */}
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                            position: 'relative'
                        }} className="pro-card-hover pop-accent-border">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Attendance Rate
                                </span>
                                <span className="telemetry-chip" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                                    75% Target
                                </span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: data.attendance_percentage >= 75 ? 'var(--accent-green-dark)' : '#dc2626', marginBottom: '10px' }}>
                                {data.attendance_percentage}%
                            </div>
                            <div className="futuristic-meter">
                                <div className="futuristic-meter-fill" style={{ width: `${Math.min(data.attendance_percentage, 100)}%` }} />
                            </div>
                        </div>

                        {/* Classes Attended Card */}
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                        }} className="pro-card-hover pop-accent-border-blue">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Completed Classes
                                </span>
                                <CheckCircle2 size={16} color="#2563eb" />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                                {data.present_count + data.late_count}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Verified attendance records
                            </span>
                        </div>

                        {/* Classes Absent Card */}
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                        }} className="pro-card-hover pop-accent-border-amber">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Absences / Missed
                                </span>
                                <AlertCircle size={16} color="#d97706" />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                                {data.absent_count}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {data.absent_count === 0 ? 'Flawless attendance record' : 'Review recorded notes'}
                            </span>
                        </div>

                        {/* Enrolled Courses Card */}
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                        }} className="pro-card-hover pop-accent-border-purple">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Active Courses
                                </span>
                                <BookOpen size={16} color="#7c3aed" />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                                {data.courses?.length || 0}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Curriculum enrolled
                            </span>
                        </div>
                    </div>

                    {/* Assigned Faculty Section */}
                    {data.assigned_teachers?.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <UserCheck size={18} color="var(--accent-green-dark)" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                    Assigned Mentors
                                </h3>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '16px'
                            }}>
                                {data.assigned_teachers.map((t, i) => (
                                    <div key={i} style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0px',
                                        padding: '16px 18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)'
                                    }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '0px',
                                            background: '#0f172a', color: '#ffffff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '1.1rem', flexShrink: 0
                                        }}>
                                            {t.name?.[0] || 'T'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-green-dark)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {t.course_name}
                                            </div>
                                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {t.name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {t.email}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Demos - Accept/Reject Section */}
                    {data.completed_demos?.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <Zap size={18} color="#7c3aed" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                    Demo Class Decisions
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.completed_demos.map((demo) => (
                                    <div key={demo.id} style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderLeft: '4px solid #7c3aed',
                                        borderRadius: '0px',
                                        padding: '18px 24px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '16px',
                                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                                    {demo.title}
                                                </h4>
                                                <span className="telemetry-chip purple" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                                                    DEMO EVALUATION
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                                                {demo.course_name} &middot; Conducted {formatDate(demo.scheduled_time)}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleAcceptDemo(demo.id)}
                                                disabled={acceptingId === demo.id}
                                                className="glass-btn primary"
                                                style={{ fontSize: '0.85rem', padding: '8px 18px', borderRadius: '0px' }}
                                            >
                                                {acceptingId === demo.id ? 'Processing...' : 'Accept Teacher'}
                                            </button>
                                            <button
                                                onClick={() => handleRejectDemo(demo.id)}
                                                disabled={acceptingId === demo.id}
                                                style={{
                                                    background: '#ffffff',
                                                    border: '1px solid #fca5a5',
                                                    color: '#dc2626',
                                                    padding: '8px 14px',
                                                    borderRadius: '0px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Request Alternate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Class In Progress Alert Banner */}
                    {data.live_sessions?.length > 0 && (
                        <div style={{
                            background: '#ecfdf5',
                            border: '1px solid #10b981',
                            borderLeft: '5px solid #059669',
                            padding: '18px 24px',
                            marginBottom: '28px',
                            borderRadius: '0px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '16px',
                            boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span className="status-badge badge-live">LIVE IN PROGRESS</span>
                                    <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 700 }}>Your scheduled class is active now</span>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
                                    {data.live_sessions[0].title} &middot; {data.live_sessions[0].course_name}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#047857', margin: '4px 0 0' }}>
                                    Instructor: <strong>{data.live_sessions[0].teacher_name}</strong> &middot; Time: {formatTime(data.live_sessions[0].scheduled_time)}
                                </p>
                            </div>

                            {data.live_sessions[0].meeting_link ? (
                                <a
                                    href={data.live_sessions[0].meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        background: '#059669',
                                        color: '#ffffff',
                                        padding: '10px 22px',
                                        fontWeight: 800,
                                        fontSize: '0.92rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        borderRadius: '0px',
                                        boxShadow: '0 2px 10px rgba(5, 150, 105, 0.35)'
                                    }}
                                >
                                    <Video size={16} />
                                    <span>Join Live Class Now</span>
                                </a>
                            ) : (
                                <span className="badge-meet-missing">Teacher will provide link shortly</span>
                            )}
                        </div>
                    )}

                    {/* Upcoming Classes Section */}
                    <div style={{ marginBottom: '36px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} color="var(--accent-green-dark)" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                    Upcoming Live Sessions
                                </h3>
                            </div>
                            <button
                                onClick={() => router.push('/courses')}
                                style={{
                                    background: 'var(--accent-green)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '0px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Plus size={15} />
                                <span>Book a Class</span>
                            </button>
                        </div>

                        {data.upcoming_classes?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {data.upcoming_classes.map((cls) => (
                                    <div key={cls.id} style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0px',
                                        padding: '20px 24px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '16px',
                                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                                    }} className="pro-card-hover">
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                                    {cls.title}
                                                </h4>
                                                {cls.effective_status === 'Live' ? (
                                                    <span className="status-badge badge-live">LIVE NOW</span>
                                                ) : cls.is_demo ? (
                                                    <span className="telemetry-chip cyan" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                                                        DEMO SESSION
                                                    </span>
                                                ) : (
                                                    <span className="status-badge badge-scheduled">
                                                        SCHEDULED
                                                    </span>
                                                )}
                                                {cls.has_meet_link ? (
                                                    <span className="badge-meet-ready">Link Ready</span>
                                                ) : (
                                                    <span className="badge-meet-missing">Link Pending</span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                                                {cls.course_name} &middot; Instructor: <strong style={{ color: '#334155' }}>{cls.teacher_name}</strong>
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                            <div style={{
                                                fontSize: '0.85rem', color: '#334155', fontWeight: 600,
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                background: '#f8fafc', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '0px'
                                            }}>
                                                <Clock size={14} color="#64748b" />
                                                <span>{formatDate(cls.scheduled_time)} &middot; {formatTime(cls.scheduled_time)}</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {cls.meeting_link && (
                                                    <a
                                                        href={cls.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                            color: '#ffffff',
                                                            padding: '8px 16px',
                                                            borderRadius: '0px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 700,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                                                        }}
                                                    >
                                                        <Video size={14} />
                                                        <span>Join Live Class</span>
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setCancelId(cls.id)}
                                                    style={{
                                                        background: '#ffffff',
                                                        border: '1px solid #fecaca',
                                                        color: '#dc2626',
                                                        padding: '8px 12px',
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
                            <div style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0px',
                                padding: '40px 24px',
                                textAlign: 'center',
                                color: '#64748b'
                            }}>
                                <Clock size={28} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                                    No scheduled classes ahead
                                </h4>
                                <p style={{ fontSize: '0.88rem', margin: '0 auto 16px', maxWidth: '380px' }}>
                                    Schedule a 1-on-1 session with your assigned teachers or browse new subjects.
                                </p>
                                <button
                                    onClick={() => router.push('/courses')}
                                    className="glass-btn primary"
                                    style={{ borderRadius: '0px', padding: '9px 18px', fontSize: '0.88rem' }}
                                >
                                    Browse Classes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Recent Classes & Outcomes Section */}
                    {data.recent_sessions?.length > 0 && (
                        <div style={{ marginBottom: '36px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <CheckCircle2 size={18} color="var(--accent-green-dark)" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                    Recent Classes & Conducted Outcomes
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.recent_sessions.map(s => (
                                    <div key={s.id} style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0px',
                                        padding: '16px 20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                                    {s.title} &middot; {s.course_name}
                                                </h4>
                                                {s.status === 'Completed' ? (
                                                    <span className="status-badge badge-completed">Completed</span>
                                                ) : s.status === 'Not Conducted' ? (
                                                    <span className="status-badge badge-not-conducted">Not Conducted</span>
                                                ) : s.status === 'Needs Review' ? (
                                                    <span className="status-badge badge-needs-review">Needs Review</span>
                                                ) : (
                                                    <span className="status-badge badge-scheduled">{s.status}</span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                                                Instructor: {s.teacher_name} &middot; Date: {formatDate(s.scheduled_time)}
                                            </p>
                                            {s.outcome_remarks && (
                                                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '6px 0 0', fontStyle: 'italic', background: '#f8fafc', padding: '4px 8px', borderLeft: '2px solid #cbd5e1' }}>
                                                    Faculty note: "{s.outcome_remarks}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Academic Progress & Faculty Reports Section */}
                    {data.student_reports?.length > 0 && (
                        <div style={{ marginBottom: '36px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <FileText size={18} color="#2563eb" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                    Faculty Academic Evaluations & Reports
                                </h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                                {data.student_reports.map(rep => (
                                    <div key={rep.id} style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderTop: '3px solid #2563eb',
                                        borderRadius: '0px',
                                        padding: '18px 20px',
                                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                                                    {rep.session_title || 'Class Evaluation'}
                                                </span>
                                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                    Faculty: <strong>{rep.teacher_name}</strong>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b' }}>
                                                <Star size={14} fill="#f59e0b" />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{rep.performance_rating}/5</span>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '0.85rem', color: '#1e293b', margin: '0 0 12px', lineHeight: 1.5 }}>
                                            {rep.observations}
                                        </p>

                                        {rep.strengths && (
                                            <div style={{ fontSize: '0.78rem', color: '#047857', marginBottom: '6px' }}>
                                                <strong>Strengths:</strong> {rep.strengths}
                                            </div>
                                        )}
                                        {rep.areas_for_improvement && (
                                            <div style={{ fontSize: '0.78rem', color: '#b45309', marginBottom: '12px' }}>
                                                <strong>Areas to Focus:</strong> {rep.areas_for_improvement}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                                            {rep.report_file && (
                                                <a
                                                    href={rep.report_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        color: '#2563eb',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Download size={13} />
                                                    <span>Download PDF Assessment</span>
                                                </a>
                                            )}
                                            {rep.voice_note && (
                                                <div style={{ width: '100%', marginTop: '6px' }}>
                                                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                                        <Mic size={11} /> Faculty Voice Feedback:
                                                    </span>
                                                    <audio controls src={rep.voice_note} style={{ width: '100%', height: '28px' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Enrolled Courses Grid */}
                    {data.courses?.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <BookOpen size={18} color="var(--accent-green-dark)" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                    My Enrolled Curriculums
                                </h3>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '18px'
                            }}>
                                {data.courses.map((c) => (
                                    <div
                                        key={c.id}
                                        onClick={() => router.push(`/courses/${c.id}`)}
                                        style={{
                                            background: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0px',
                                            padding: '20px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                                        }}
                                        className="pro-card-hover"
                                    >
                                        <span className="telemetry-chip" style={{ marginBottom: '10px', fontSize: '0.68rem' }}>
                                            ACTIVE ENROLLMENT
                                        </span>
                                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                                            {c.name}
                                        </h4>
                                        {c.description && (
                                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
                                                {c.description.substring(0, 90)}...
                                            </p>
                                        )}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-green-dark)',
                                            paddingTop: '12px', borderTop: '1px dashed #e2e8f0'
                                        }}>
                                            <span>Enter Course Syllabus</span>
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cancel Session Modal */}
                    {cancelId && (
                        <div className="modal-overlay" onClick={() => setCancelId(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', borderRadius: '0px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <h3 style={{ color: '#dc2626', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                                        Cancel Scheduled Class
                                    </h3>
                                    <button onClick={() => setCancelId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <p style={{ color: '#64748b', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                                    Please state a brief reason for canceling this session. Your instructor will receive this update.
                                </p>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                                        Reason
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="e.g. Schedule conflict, academic exam, personal reason..."
                                        value={cancelReason}
                                        onChange={e => setCancelReason(e.target.value)}
                                        style={{ resize: 'vertical', borderRadius: '0px' }}
                                        required
                                    />
                                </div>
                                <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" className="glass-btn" style={{ flex: 1, borderRadius: '0px' }} onClick={() => { setCancelId(null); setCancelReason(''); }}>
                                        Keep Class
                                    </button>
                                    <button
                                        type="button"
                                        className="glass-btn"
                                        disabled={cancelling || !cancelReason.trim()}
                                        onClick={handleCancelSession}
                                        style={{ flex: 1, background: '#dc2626', color: '#ffffff', borderRadius: '0px', border: 'none' }}
                                    >
                                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="alert alert-error" style={{ borderRadius: '0px' }}>Failed to load student dashboard telemetry.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(StudentDashboard, ['student']);
