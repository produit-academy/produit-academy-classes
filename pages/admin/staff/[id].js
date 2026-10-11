import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { withAuth } from '../../../lib/auth';
import { apiGet, apiPatch } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';

function StaffProfile() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Google Meet Link Management State
    const [isEditingMeet, setIsEditingMeet] = useState(false);
    const [meetInput, setMeetInput] = useState('');
    const [syncSessions, setSyncSessions] = useState(true);
    const [meetSaving, setMeetSaving] = useState(false);
    const [meetMsg, setMeetMsg] = useState(null);
    const [copiedMeet, setCopiedMeet] = useState(false);

    useEffect(() => {
        if (!id) return;
        apiGet(`/api/classes/admin/analytics/user/${id}/`)
            .then(res => {
                setData(res);
                if (res?.user?.google_meet_link) {
                    setMeetInput(res.user.google_meet_link);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleSaveMeetLink = async (e) => {
        e?.preventDefault();
        setMeetSaving(true);
        setMeetMsg(null);
        try {
            const res = await apiPatch(`/api/classes/admin/teacher/${id}/meet-link/`, {
                google_meet_link: meetInput.trim(),
                sync_sessions: syncSessions,
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setData(prev => ({
                    ...prev,
                    user: { ...prev.user, google_meet_link: json.google_meet_link }
                }));
                setMeetMsg({ type: 'success', text: json.message || 'Google Meet link saved successfully!' });
                setIsEditingMeet(false);
            } else {
                setMeetMsg({ type: 'error', text: json.error || 'Failed to update Google Meet link.' });
            }
        } catch (err) {
            setMeetMsg({ type: 'error', text: 'Network error updating Meet link.' });
        } finally {
            setMeetSaving(false);
        }
    };

    const handleRemoveMeetLink = async () => {
        if (!confirm('Are you sure you want to remove the Google Meet link for this teacher?')) return;
        setMeetSaving(true);
        setMeetMsg(null);
        try {
            const res = await apiPatch(`/api/classes/admin/teacher/${id}/meet-link/`, {
                google_meet_link: '',
                sync_sessions: false,
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setData(prev => ({
                    ...prev,
                    user: { ...prev.user, google_meet_link: '' }
                }));
                setMeetInput('');
                setMeetMsg({ type: 'success', text: 'Google Meet link removed successfully.' });
                setIsEditingMeet(false);
            } else {
                setMeetMsg({ type: 'error', text: json.error || 'Failed to remove link.' });
            }
        } catch (err) {
            setMeetMsg({ type: 'error', text: 'Network error removing link.' });
        } finally {
            setMeetSaving(false);
        }
    };

    const handleCopyMeet = (link) => {
        if (!link) return;
        const url = link.startsWith('http') ? link : `https://${link}`;
        navigator.clipboard.writeText(url);
        setCopiedMeet(true);
        setTimeout(() => setCopiedMeet(false), 2000);
    };

    if (loading) {
        return (
            <DashboardLayout title="Staff Profile">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner" /></div>
            </DashboardLayout>
        );
    }

    if (!data || !data.analytics) {
        return (
            <DashboardLayout title="Staff Profile">
                <div className="alert alert-error">Failed to load staff profile.</div>
            </DashboardLayout>
        );
    }

    const { user, analytics } = data;

    return (
        <DashboardLayout title={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}: ${user.name}`}>
            <Head><title>{user.name} Profile | Produit Classes</title></Head>

            <button className="glass-btn secondary" onClick={() => router.push('/admin/staff')} style={{ marginBottom: '20px' }}>
                &larr; Back to Staff List
            </button>

            <div className="responsive-profile-layout">
                
                {/* Profile Card */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {user.profile_picture_base64 ? (
                            <img src={user.profile_picture_base64} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <h2 style={{ margin: 0 }}>{user.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>{user.email}</p>
                        <span className="badge" style={{ marginTop: '12px', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                            {user.role.toUpperCase()}
                        </span>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</span>
                            <div style={{ fontWeight: '500' }}>{user.phone || 'N/A'}</div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Joined Date</span>
                            <div style={{ fontWeight: '500' }}>{new Date(user.joined).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {user.role === 'teacher' && (
                        <>
                            <div className="responsive-stats-row">
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--accent)', margin: 0 }}>{analytics.total_teaching_hours}h</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Total Teaching Hours</p>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--green)', margin: 0 }}>{analytics.classes_taught}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Classes Completed</p>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--accent-purple)', margin: 0 }}>₹{analytics.this_month_earnings}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Earnings This Month</p>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--accent-gold)', margin: 0 }}>₹{analytics.total_earnings}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>Total Earnings (₹{analytics.hourly_rate}/hr)</p>
                                </div>
                            </div>
                            
                            {/* Official Google Meet Classroom Card (Admin Managed) */}
                            <div className="glass-card" style={{
                                padding: '24px',
                                borderLeft: user.google_meet_link ? '4px solid #10b981' : '4px solid #f59e0b'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '10px',
                                            background: user.google_meet_link ? '#059669' : '#d97706',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#ffffff', flexShrink: 0
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Permanent Google Meet Classroom</h3>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                Admin-managed classroom link &middot; Join sessions to observe and inspect classes
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="badge" style={{
                                            background: user.google_meet_link ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
                                            color: user.google_meet_link ? '#059669' : '#d97706',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            padding: '6px 12px'
                                        }}>
                                            {user.google_meet_link ? 'Active Classroom Link' : 'No Link Assigned'}
                                        </span>

                                        {!isEditingMeet && (
                                            <button
                                                onClick={() => {
                                                    setMeetInput(user.google_meet_link || '');
                                                    setIsEditingMeet(true);
                                                }}
                                                className="glass-btn secondary"
                                                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                            >
                                                {user.google_meet_link ? 'Change Meet Link' : '+ Assign Meet Link'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {meetMsg && (
                                    <div className={`alert ${meetMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '16px', padding: '10px 14px', fontSize: '0.88rem' }}>
                                        {meetMsg.text}
                                    </div>
                                )}

                                {isEditingMeet ? (
                                    <form onSubmit={handleSaveMeetLink} style={{ background: 'var(--bg-secondary, #f8fafc)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px' }}>
                                            Google Meet URL
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                            <input
                                                type="url"
                                                placeholder="https://meet.google.com/abc-defg-hij"
                                                value={meetInput}
                                                onChange={(e) => setMeetInput(e.target.value)}
                                                required
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1',
                                                    fontSize: '0.92rem',
                                                    background: '#ffffff'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <input
                                                type="checkbox"
                                                id="syncSessions"
                                                checked={syncSessions}
                                                onChange={(e) => setSyncSessions(e.target.checked)}
                                            />
                                            <label htmlFor="syncSessions" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                Synchronize this link with active bookings and upcoming sessions for this teacher
                                            </label>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <button
                                                type="submit"
                                                disabled={meetSaving || !meetInput.trim()}
                                                className="glass-btn primary"
                                                style={{ padding: '8px 18px', fontSize: '0.88rem', background: '#059669' }}
                                            >
                                                {meetSaving ? 'Saving Link...' : 'Save Google Meet Link'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingMeet(false);
                                                    setMeetInput(user.google_meet_link || '');
                                                }}
                                                className="glass-btn secondary"
                                                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                                            >
                                                Cancel
                                            </button>
                                            {user.google_meet_link && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveMeetLink}
                                                    disabled={meetSaving}
                                                    className="glass-btn danger"
                                                    style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
                                                >
                                                    Remove Link
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                ) : user.google_meet_link ? (
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            background: '#ffffff',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: '#0f172a', wordBreak: 'break-all' }}>
                                                {user.google_meet_link}
                                            </span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleCopyMeet(user.google_meet_link)}
                                                    className="glass-btn secondary"
                                                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                                                >
                                                    {copiedMeet ? 'Copied!' : 'Copy Link'}
                                                </button>
                                                <a
                                                    href={user.google_meet_link?.startsWith('http') ? user.google_meet_link : `https://${user.google_meet_link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="glass-btn primary"
                                                    style={{
                                                        padding: '6px 16px',
                                                        fontSize: '0.85rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        textDecoration: 'none',
                                                        background: '#059669'
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                                    Enter Class as Admin
                                                </a>
                                            </div>
                                        </div>
                                        <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Administrators can click <strong>Enter Class as Admin</strong> anytime to join the classroom, observe teaching, and monitor live student sessions.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.08)',
                                        border: '1px solid rgba(245, 158, 11, 0.25)',
                                        borderRadius: '10px',
                                        padding: '16px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '16px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                            <div>
                                                <strong style={{ fontSize: '0.95rem', color: '#92400e', display: 'block' }}>No Google Meet link assigned</strong>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#b45309' }}>
                                                    This teacher cannot conduct live sessions until an administrator assigns an official Google Meet classroom link.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setMeetInput('');
                                                setIsEditingMeet(true);
                                            }}
                                            className="glass-btn primary"
                                            style={{ padding: '8px 18px', fontSize: '0.85rem', background: '#d97706' }}
                                        >
                                            Assign Meet Link Now
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px 0' }}>Profile Details</h3>
                                
                                {user.bio && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bio</span>
                                        <div style={{ fontWeight: '500', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{user.bio}</div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                    {user.qualification && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qualifications</span>
                                            <div style={{ fontWeight: '500' }}>{user.qualification}</div>
                                        </div>
                                    )}
                                    {user.experience && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Experience</span>
                                            <div style={{ fontWeight: '500' }}>{user.experience}</div>
                                        </div>
                                    )}
                                    {user.languages && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Languages</span>
                                            <div style={{ fontWeight: '500' }}>{user.languages}</div>
                                        </div>
                                    )}
                                    {user.skills && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Skills</span>
                                            <div style={{ fontWeight: '500' }}>{user.skills}</div>
                                        </div>
                                    )}
                                    {user.certifications && (
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Certifications</span>
                                            <div style={{ fontWeight: '500' }}>{user.certifications}</div>
                                        </div>
                                    )}
                                    <div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Google Meet</span>
                                        <div style={{ fontWeight: '500' }}>
                                            {user.google_meet_link ? (
                                                <a href={user.google_meet_link?.startsWith('http') ? user.google_meet_link : `https://${user.google_meet_link}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Join Link</a>
                                            ) : (
                                                <span style={{ color: '#d97706', fontSize: '0.9rem' }}>Not Assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {(user.courses?.length > 0 || user.taught_subjects?.length > 0) && (
                                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                        {user.courses?.length > 0 && (
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Courses</span>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {user.courses.map((c, i) => (
                                                        <span key={i} className="badge" style={{ background: 'var(--bg-secondary)', padding: '6px 12px' }}>{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {user.taught_subjects?.length > 0 && (
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Subjects</span>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {user.taught_subjects.map((s, i) => (
                                                        <span key={i} className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '6px 12px' }}>{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {analytics.student_breakdown?.length > 0 && (
                                <div className="glass-card" style={{ marginTop: '24px' }}>
                                    <h3 style={{ padding: '20px 20px 0', margin: 0 }}>Student Breakdown</h3>
                                    <div className="data-table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Course</th>
                                                    <th>Hours Taught</th>
                                                    <th>Earnings Generated</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.student_breakdown.map((s, idx) => (
                                                    <tr key={idx}>
                                                        <td><strong>{s.student_name}</strong></td>
                                                        <td>{s.course_name}</td>
                                                        <td>{s.hours}h</td>
                                                        <td>₹{s.earned}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}


                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(StaffProfile, ['admin']);
