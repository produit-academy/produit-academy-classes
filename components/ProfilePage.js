import Head from 'next/head';
import { useState, useEffect } from 'react';
import { apiGet, apiPatch, apiPost } from '../lib/api';
import DashboardLayout from './DashboardLayout';

export default function ProfilePage({ pageTitle, allowedRole }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Change password state
    const [showPwModal, setShowPwModal] = useState(false);
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);
    const [pwErr, setPwErr] = useState(null);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await apiGet('/api/classes/profile/');
            setProfile(data);
        } catch (err) {
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    const startEditing = () => {
        setEditForm({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone_number: profile.phone_number || '',
            college: profile.college || '',
            address: profile.address || '',
            current_class: profile.current_class || '',
            school_name: profile.school_name || '',
        });
        setEditing(true);
        setMessage(null);
        setError(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        setError(null);
        try {
            const res = await apiPatch('/api/classes/profile/', editForm);
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message || 'Profile updated!');
                setEditing(false);
                loadProfile();
            } else {
                setError(data.error || 'Failed to update.');
            }
        } catch {
            setError('Network error.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg(null);
        setPwErr(null);

        if (pwForm.new_password !== pwForm.confirm_password) {
            setPwErr('New passwords do not match.');
            return;
        }

        setPwSaving(true);
        try {
            const res = await apiPost('/api/classes/change-password/', {
                current_password: pwForm.current_password,
                new_password: pwForm.new_password,
            });
            const data = await res.json();
            if (res.ok) {
                setPwMsg(data.message || 'Password changed!');
                setPwForm({ current_password: '', new_password: '', confirm_password: '' });
                setTimeout(() => setShowPwModal(false), 1500);
            } else {
                setPwErr(data.error || 'Failed to change password.');
            }
        } catch {
            setPwErr('Network error.');
        } finally {
            setPwSaving(false);
        }
    };

    const roleLabel = profile?.role === 'teacher' ? 'Teacher' : profile?.role === 'mentor' ? 'Mentor' : profile?.role === 'admin' ? 'Admin' : 'Student';

    return (
        <DashboardLayout title={pageTitle}>
            <Head><title>{pageTitle} | Produit Classes</title></Head>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : profile ? (
                <div style={{ maxWidth: '740px' }}>
                    {/* Profile Header */}
                    <div className="glass-card" style={{ padding: '32px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '1.8rem', fontWeight: 700, flexShrink: 0,
                            }}>
                                {(profile.first_name || profile.email || 'U')[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                                    {profile.first_name} {profile.last_name}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{profile.email}</p>
                                <span className="badge" style={{
                                    background: 'var(--accent-green-light)', color: 'var(--accent-green-dark)',
                                    marginTop: '8px', display: 'inline-block', padding: '4px 14px',
                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                }}>
                                    {roleLabel}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {!editing && (
                                    <button className="glass-btn primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                                        onClick={startEditing}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px'}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Edit Profile
                                    </button>
                                )}
                                <button className="glass-btn" style={{ padding: '10px 20px', fontSize: '0.88rem', borderColor: 'var(--card-border)' }}
                                    onClick={() => { setPwMsg(null); setPwErr(null); setShowPwModal(true); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Change Password
                                </button>
                            </div>
                        </div>

                        {/* Profile Details / Edit Form */}
                        {editing ? (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input className="input-field" value={editForm.first_name}
                                            onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input className="input-field" value={editForm.last_name}
                                            onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input className="input-field" type="tel" value={editForm.phone_number}
                                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} />
                                    </div>
                                    {profile.role === 'student' && (
                                        <>
                                            <div className="form-group">
                                                <label className="form-label">College</label>
                                                <input className="input-field" value={editForm.college}
                                                    onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">School</label>
                                                <input className="input-field" value={editForm.school_name}
                                                    onChange={(e) => setEditForm({ ...editForm, school_name: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Class / Year</label>
                                                <input className="input-field" value={editForm.current_class}
                                                    onChange={(e) => setEditForm({ ...editForm, current_class: e.target.value })} />
                                            </div>
                                        </>
                                    )}
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Address</label>
                                        <input className="input-field" value={editForm.address}
                                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button className="glass-btn primary" onClick={handleSave} disabled={saving}
                                        style={{ padding: '10px 24px' }}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button className="glass-btn secondary" onClick={() => setEditing(false)}
                                        style={{ padding: '10px 20px' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                                <DetailRow label="Email" value={profile.email} />
                                <DetailRow label="Phone" value={profile.phone_number || '—'} />
                                <DetailRow label="Member Since" value={new Date(profile.date_joined).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
                                {profile.role === 'student' && (
                                    <>
                                        <DetailRow label="College" value={profile.college || '—'} />
                                        <DetailRow label="School" value={profile.school_name || '—'} />
                                        <DetailRow label="Class / Year" value={profile.current_class || '—'} />
                                    </>
                                )}
                                {profile.address && <DetailRow label="Address" value={profile.address} />}
                            </div>
                        )}
                    </div>

                    {/* Assigned Staff (Students only) */}
                    {profile.role === 'student' && (profile.teacher || profile.mentor) && (
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                            <h3 className="section-heading" style={{ marginBottom: '16px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                Assigned Staff
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                {profile.teacher && (
                                    <StaffCard label="Teacher" name={profile.teacher.name} email={profile.teacher.email} color="var(--accent-blue)" />
                                )}
                                {profile.mentor && (
                                    <StaffCard label="Mentor" name={profile.mentor.name} email={profile.mentor.email} color="var(--accent-purple)" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Courses / Subjects */}
                    {profile.role === 'teacher' && profile.subjects?.length > 0 && (
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                            <h3 className="section-heading" style={{ marginBottom: '16px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                My Subjects
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {profile.subjects.map(sub => (
                                    <span key={sub.id} className="badge" style={{
                                        background: 'rgba(52,152,219,0.1)', color: '#2980b9',
                                        padding: '8px 18px', fontSize: '0.88rem', borderRadius: '10px',
                                    }}>
                                        {sub.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.role === 'student' && profile.courses?.length > 0 && (
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <h3 className="section-heading" style={{ marginBottom: '16px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                Enrolled Courses
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {profile.courses.map(c => (
                                    <div key={c.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px', borderRadius: '10px',
                                        background: c.is_completed ? 'rgba(51,174,120,0.06)' : 'rgba(52,152,219,0.06)',
                                        border: `1px solid ${c.is_completed ? 'rgba(51,174,120,0.15)' : 'rgba(52,152,219,0.15)'}`,
                                    }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{c.name}</span>
                                        <span className="badge" style={{
                                            background: c.is_completed ? 'rgba(51,174,120,0.12)' : 'rgba(52,152,219,0.12)',
                                            color: c.is_completed ? '#228B22' : '#2980b9',
                                        }}>
                                            {c.is_completed ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{verticalAlign:'middle',marginRight:'3px'}}><polyline points="20 6 9 17 4 12"/></svg>Completed</> : 'Active'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="alert alert-error">Failed to load profile data.</div>
            )}

            {/* Change Password Modal */}
            {showPwModal && (
                <div className="modal-overlay" onClick={() => setShowPwModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <h3 style={{ marginBottom: '4px' }}>Change Password</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                            Enter your current password and choose a new one.
                        </p>

                        {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
                        {pwErr && <div className="alert alert-error">{pwErr}</div>}

                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input className="input-field" type="password" required
                                    value={pwForm.current_password}
                                    onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                                    placeholder="Enter current password" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input className="input-field" type="password" required minLength={8}
                                    value={pwForm.new_password}
                                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                                    placeholder="Minimum 8 characters" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input className="input-field" type="password" required
                                    value={pwForm.confirm_password}
                                    onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                                    placeholder="Re-enter new password" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="glass-btn secondary" onClick={() => setShowPwModal(false)}
                                    style={{ padding: '10px 20px' }}>Cancel</button>
                                <button type="submit" className="glass-btn primary" disabled={pwSaving}
                                    style={{ padding: '10px 24px' }}>
                                    {pwSaving ? 'Changing...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{value}</div>
        </div>
    );
}

function StaffCard({ label, name, email, color }) {
    return (
        <div style={{
            padding: '14px 16px', borderRadius: '12px',
            background: `${color}10`, border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', gap: '12px',
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
            }}>
                {name[0]}
            </div>
            <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{email}</div>
            </div>
        </div>
    );
}
