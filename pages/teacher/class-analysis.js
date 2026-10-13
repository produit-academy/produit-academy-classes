import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
    BookOpen, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle,
    Search, Filter, Video, TrendingUp, RefreshCw, X, ArrowUpRight
} from 'lucide-react';

function ClassAnalysis() {
    const { user } = useAuth();
    const router = useRouter();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Outcome Modal State
    const [outcomeSession, setOutcomeSession] = useState(null);
    const [outcomeStatus, setOutcomeStatus] = useState('Completed');
    const [outcomeRemarks, setOutcomeRemarks] = useState('');
    const [outcomeSaving, setOutcomeSaving] = useState(false);

    const fetchAnalysis = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
            if (courseFilter) params.append('course_id', courseFilter);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            const res = await apiGet(`/api/classes/teacher/class-analysis/?${params.toString()}`);
            setData(res);
        } catch (err) {
            console.error('Failed to load class analysis:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAnalysis();
        }
    }, [user, statusFilter, courseFilter]);

    // Handle Search on enter or debounce
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchAnalysis();
    };

    // Mark outcome handler
    const handleMarkOutcome = async () => {
        if (!outcomeSession) return;
        setOutcomeSaving(true);
        try {
            const res = await apiPost(`/api/classes/sessions/${outcomeSession.id}/outcome/`, {
                status: outcomeStatus,
                outcome_remarks: outcomeRemarks
            });
            if (res.ok) {
                setOutcomeSession(null);
                setOutcomeRemarks('');
                fetchAnalysis(true);
            } else {
                alert('Failed to update class outcome.');
            }
        } catch (e) {
            alert('Error updating class outcome.');
        } finally {
            setOutcomeSaving(false);
        }
    };

    const summary = data?.summary || {
        total_classes: 0,
        completed_classes: 0,
        upcoming_classes: 0,
        needs_review_classes: 0,
        not_conducted_classes: 0,
        cancelled_classes: 0,
        completion_rate: 100,
        total_hours: 0,
        attendance_rate: 100,
    };

    const courseBreakdown = data?.course_breakdown || [];
    const sessions = data?.sessions || [];

    const formatDateTime = (dateStr) => {
        if (!dateStr) return { date: '-', time: '-' };
        try {
            const d = new Date(dateStr);
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
        } catch {
            return { date: dateStr, time: '' };
        }
    };

    return (
        <DashboardLayout title="Class Analysis">
            <Head>
                <title>Class Analysis | Produit Classes</title>
            </Head>

            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
                
                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                            Class Analysis & Performance
                        </h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.88rem' }}>
                            Comprehensive performance metrics for conducted sessions, completion rates, and classroom delivery.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            onClick={() => fetchAnalysis(true)}
                            disabled={refreshing}
                            className="glass-btn secondary"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                fontSize: '0.84rem'
                            }}
                        >
                            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
                            <span>{refreshing ? 'Updating...' : 'Refresh Data'}</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Summary Grid */}
                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    {/* Total Classes */}
                    <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                                Total Classes
                            </span>
                            <BookOpen size={18} color="#3b82f6" />
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                            {summary.total_classes}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {summary.total_hours}h total teaching delivered
                        </span>
                    </div>

                    {/* Completed Classes */}
                    <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                                Completed
                            </span>
                            <CheckCircle2 size={18} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', margin: '0 0 4px' }}>
                            {summary.completed_classes}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>
                            {summary.completion_rate}% completion rate
                        </span>
                    </div>

                    {/* Upcoming Scheduled Classes */}
                    <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #0284c7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                                Upcoming Classes
                            </span>
                            <Calendar size={18} color="#0284c7" />
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0369a1', margin: '0 0 4px' }}>
                            {summary.upcoming_classes}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Scheduled & upcoming
                        </span>
                    </div>

                    {/* Needs Review */}
                    <div className="glass-card" style={{ padding: '20px', borderLeft: summary.needs_review_classes > 0 ? '4px solid #f59e0b' : '4px solid #cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                                Needs Outcome
                            </span>
                            <AlertTriangle size={18} color={summary.needs_review_classes > 0 ? '#d97706' : '#94a3b8'} />
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: summary.needs_review_classes > 0 ? '#d97706' : '#64748b', margin: '0 0 4px' }}>
                            {summary.needs_review_classes}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: summary.needs_review_classes > 0 ? '#b45309' : '#64748b' }}>
                            {summary.needs_review_classes > 0 ? 'Pending outcome confirmation' : 'All outcomes marked'}
                        </span>
                    </div>

                    {/* Student Attendance Rate */}
                    <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                                Attendance Rate
                            </span>
                            <TrendingUp size={18} color="#8b5cf6" />
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', margin: '0 0 4px' }}>
                            {summary.attendance_rate}%
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Average student presence
                        </span>
                    </div>
                </div>

                {/* Course Breakdown Section */}
                {courseBreakdown.length > 0 && (
                    <div className="glass-card" style={{ padding: '22px', marginBottom: '28px' }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                            Course & Subject Delivery Breakdown
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                            {courseBreakdown.map((cb) => {
                                const pct = summary.total_classes > 0 ? Math.round((cb.total_classes / summary.total_classes) * 100) : 0;
                                return (
                                    <div key={cb.course_id} style={{
                                        background: 'var(--bg-secondary, #f8fafc)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '14px 16px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{cb.course_name}</strong>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{pct}% of classes</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', marginBottom: '8px' }}>
                                            <span>{cb.completed_classes} / {cb.total_classes} Completed</span>
                                            <span>{cb.hours_taught} hrs</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                background: '#059669',
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                        
                        {/* Status Filter Tabs */}
                        <div className="mobile-scroll-strip" style={{ gap: '6px' }}>
                            {['All', 'Completed', 'Upcoming', 'Needs Review', 'Not Conducted', 'Cancelled'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        border: statusFilter === st ? '1px solid #059669' : '1px solid #cbd5e1',
                                        background: statusFilter === st ? '#ecfdf5' : '#ffffff',
                                        color: statusFilter === st ? '#065f46' : '#475569',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0
                                    }}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>

                        {/* Course & Search Controls */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Course Dropdown */}
                            {data?.courses?.length > 0 && (
                                <select
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                    style={{
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.84rem',
                                        background: '#ffffff',
                                        color: '#0f172a'
                                    }}
                                >
                                    <option value="">All Courses</option>
                                    {data.courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            )}

                            {/* Search Form */}
                            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search class or student..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '7px 12px 7px 32px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.84rem',
                                        width: '210px',
                                        background: '#ffffff'
                                    }}
                                />
                                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
                            </form>
                        </div>
                    </div>
                </div>

                {/* Class Sessions Table */}
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : sessions.length > 0 ? (
                        <div className="data-table-wrapper" style={{ margin: 0 }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Class Session</th>
                                        <th>Student</th>
                                        <th>Date & Schedule</th>
                                        <th>Status</th>
                                        <th>Meet Link</th>
                                        <th>Attendance</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((sess) => {
                                        const dt = formatDateTime(sess.scheduled_time);
                                        const status = sess.effective_status || sess.status;

                                        const statusBadgeStyles = {
                                            Completed: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
                                            Live: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
                                            Scheduled: { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
                                            'Needs Review': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
                                            'Not Conducted': { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
                                            Cancelled: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
                                        }[status] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };

                                        const attBadgeStyles = {
                                            Present: { bg: '#ecfdf5', color: '#059669' },
                                            Absent: { bg: '#fef2f2', color: '#dc2626' },
                                            Pending: { bg: '#f8fafc', color: '#64748b' },
                                            'Not Marked': { bg: '#fffbeb', color: '#d97706' },
                                        }[sess.student_attendance] || { bg: '#f8fafc', color: '#64748b' };

                                        return (
                                            <tr key={sess.id}>
                                                <td>
                                                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                                                        {sess.title}
                                                    </strong>
                                                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                        {sess.course_name}
                                                    </span>
                                                    {sess.is_demo && (
                                                        <span className="badge" style={{ marginLeft: '6px', fontSize: '0.7rem', background: '#eff6ff', color: '#2563eb' }}>
                                                            Demo
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>
                                                        {sess.student_name || 'Unassigned'}
                                                    </span>
                                                    {sess.outcome_remarks && (
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', display: 'block', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                            &ldquo;{sess.outcome_remarks}&rdquo;
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                                        {dt.date}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                        {dt.time} ({sess.duration_minutes} min)
                                                    </div>
                                                </td>

                                                <td>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        background: statusBadgeStyles.bg,
                                                        color: statusBadgeStyles.color,
                                                        border: `1px solid ${statusBadgeStyles.border}`,
                                                        display: 'inline-block'
                                                    }}>
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>
                                                    {sess.meeting_link ? (
                                                        <a
                                                            href={sess.meeting_link.startsWith('http') ? sess.meeting_link : `https://${sess.meeting_link}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                color: '#059669',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 700,
                                                                textDecoration: 'none'
                                                            }}
                                                        >
                                                            <Video size={13} />
                                                            <span>Join Meet</span>
                                                        </a>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 500 }}>
                                                            No Meet Link
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.74rem',
                                                        fontWeight: 600,
                                                        background: attBadgeStyles.bg,
                                                        color: attBadgeStyles.color,
                                                    }}>
                                                        {sess.student_attendance}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        {status === 'Needs Review' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setOutcomeSession(sess);
                                                                    setOutcomeStatus('Completed');
                                                                    setOutcomeRemarks('');
                                                                }}
                                                                className="glass-btn primary"
                                                                style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#d97706' }}
                                                            >
                                                                Mark Outcome
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => router.push('/teacher/dashboard')}
                                                                className="glass-btn secondary"
                                                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                                            >
                                                                Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                            <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
                            <h4 style={{ margin: '0 0 6px', color: '#334155', fontSize: '1rem' }}>No Class Sessions Found</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                                Try adjusting your filter or search query to see other classes.
                            </p>
                        </div>
                    )}
                </div>

                {/* Class Outcome Modal */}
                {outcomeSession && (
                    <div className="modal-overlay" onClick={() => setOutcomeSession(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '24px' }}>
                            <div className="mobile-sheet-handle" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                                    Confirm Class Outcome
                                </h3>
                                <button onClick={() => setOutcomeSession(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                                Confirm session completion for <strong>{outcomeSession.title}</strong> with student <strong>{outcomeSession.student_name}</strong>.
                            </p>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                    Class Status *
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => outcomeStatus === 'Completed' ? null : setOutcomeStatus('Completed')}
                                        style={{
                                            padding: '10px',
                                            border: outcomeStatus === 'Completed' ? '2px solid #059669' : '1px solid #cbd5e1',
                                            background: outcomeStatus === 'Completed' ? '#ecfdf5' : '#ffffff',
                                            color: outcomeStatus === 'Completed' ? '#065f46' : '#334155',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        Completed
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => outcomeStatus === 'Not Conducted' ? null : setOutcomeStatus('Not Conducted')}
                                        style={{
                                            padding: '10px',
                                            border: outcomeStatus === 'Not Conducted' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                                            background: outcomeStatus === 'Not Conducted' ? '#fef2f2' : '#ffffff',
                                            color: outcomeStatus === 'Not Conducted' ? '#991b1b' : '#334155',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        Not Conducted
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                    Remarks / Topics Covered:
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={outcomeStatus === 'Completed' ? 'Summary of syllabus covered, student engagement...' : 'Reason class was not conducted (student absent, postponed...)'}
                                    value={outcomeRemarks}
                                    onChange={(e) => setOutcomeRemarks(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setOutcomeSession(null)}
                                    className="glass-btn secondary"
                                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleMarkOutcome}
                                    disabled={outcomeSaving}
                                    className="glass-btn primary"
                                    style={{ padding: '8px 18px', fontSize: '0.85rem', background: '#059669' }}
                                >
                                    {outcomeSaving ? 'Saving...' : 'Save Outcome'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(ClassAnalysis, ['teacher', 'admin']);
