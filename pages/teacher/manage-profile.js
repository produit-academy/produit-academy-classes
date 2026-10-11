// pages/teacher/manage-profile.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPatch, apiPost, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function ManageProfile() {
    const [profile, setProfile] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', password: '',
        bio: '', qualification: '', experience: '', skills: '',
        certifications: '', languages: '', teaching_style: '', google_meet_link: '',
        profile_picture_base64: ''
    });
    const [copiedMeet, setCopiedMeet] = useState(false);
    const [videoForm, setVideoForm] = useState({ title: '', video_url: '', video_type: 'youtube', description: '' });

    useEffect(() => {
        Promise.all([
            apiGet('/api/classes/teacher/manage-profile/'),
            apiGet('/api/classes/teacher/demo-videos/'),
        ]).then(([p, v]) => {
            setProfile(p);
            setVideos(v);
            setForm({
                first_name: p.first_name || '', last_name: p.last_name || '',
                email: p.email || '', password: '',
                bio: p.bio || '', qualification: p.qualification || '',
                experience: p.experience || '', skills: p.skills || '',
                certifications: p.certifications || '', languages: p.languages || '',
                teaching_style: p.teaching_style || '', google_meet_link: p.google_meet_link || '',
                profile_picture_base64: p.profile_picture_base64 || '',
            });
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleCopyMeet = () => {
        if (!form.google_meet_link) return;
        const url = form.google_meet_link.startsWith('http') ? form.google_meet_link : `https://${form.google_meet_link}`;
        navigator.clipboard.writeText(url);
        setCopiedMeet(true);
        setTimeout(() => setCopiedMeet(false), 2000);
    };

    const handleSave = async () => {
        setSaving(true); setMsg('');
        // Google Meet link is controlled by Classes Admin and not sent from teacher profile
        const { google_meet_link, ...savePayload } = form;
        const res = await apiPatch('/api/classes/teacher/manage-profile/', savePayload);
        if (res.ok) setMsg('Profile updated successfully!');
        else setMsg('Failed to update profile.');
        setSaving(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxSize = 400;

                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round(height *= maxSize / width);
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round(width *= maxSize / height);
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/webp', 0.7);
                setForm(prev => ({ ...prev, profile_picture_base64: dataUrl }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        if (!videoForm.title || !videoForm.video_url) return;
        const res = await apiPost('/api/classes/teacher/demo-videos/', videoForm);
        if (res.ok) {
            const data = await res.json();
            setVideos([...videos, data]);
            setVideoForm({ title: '', video_url: '', video_type: 'youtube', description: '' });
        }
    };

    const handleDeleteVideo = async (id) => {
        const res = await apiDelete('/api/classes/teacher/demo-videos/', { video_id: id });
        if (res.ok) setVideos(videos.filter(v => v.id !== id));
    };

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '0.92rem', background: 'var(--background-light)' };
    const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' };

    return (
        <DashboardLayout title="Manage Profile">
            <Head><title>Manage Profile | Produit Classes</title></Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : (
                <>
                    {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>{msg}</div>}

                    <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                        <h3 className="section-heading">Profile Information</h3>
                        <div className="responsive-grid-2" style={{ gap: '16px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Profile Picture</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    {form.profile_picture_base64 ? (
                                        <img src={form.profile_picture_base64} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                            {profile?.name ? profile.name.charAt(0) : 'T'}
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{...inputStyle, flex: 1}} />
                                    {form.profile_picture_base64 && (
                                        <button type="button" onClick={() => setForm({...form, profile_picture_base64: ''})} className="glass-btn danger">Remove</button>
                                    )}
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}><hr style={{ border: 'none', borderTop: '1px solid var(--card-border, #e0e0e0)', margin: '8px 0' }} /></div>
                            
                            {/* Personal Details */}
                            <div><label style={labelStyle}>First Name</label><input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Last Name</label><input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Email</label><input value={form.email} style={{ ...inputStyle, background: '#f5f5f5', cursor: 'not-allowed', color: '#888' }} disabled /></div>
                            <div><label style={labelStyle}>New Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} placeholder="Leave blank to keep current" /></div>
                            <div style={{ gridColumn: '1 / -1' }}><hr style={{ border: 'none', borderTop: '1px solid var(--card-border, #e0e0e0)', margin: '8px 0' }} /></div>
                            
                            <div><label style={labelStyle}>Bio</label><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} /></div>
                            <div><label style={labelStyle}>Qualification</label><input value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Experience</label><input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={inputStyle} placeholder="e.g., 5+ years" /></div>
                            <div><label style={labelStyle}>Skills (comma-separated)</label><input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Certifications</label><textarea value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} /></div>
                            <div><label style={labelStyle}>Languages</label><input value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} style={inputStyle} placeholder="English, Hindi" /></div>
                            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Teaching Style</label><textarea value={form.teaching_style} onChange={e => setForm({ ...form, teaching_style: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} /></div>
                            <div style={{ gridColumn: '1 / -1' }}><hr style={{ border: 'none', borderTop: '1px solid var(--card-border, #e0e0e0)', margin: '8px 0' }} /></div>

                            {/* Official Google Meet Classroom (Managed by Admin) */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Google Meet Classroom Link</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        Assigned & Managed by Classes Admin
                                    </span>
                                </label>

                                {form.google_meet_link ? (
                                    <div style={{
                                        background: 'rgba(5, 150, 105, 0.05)',
                                        border: '1px solid rgba(5, 150, 105, 0.25)',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '34px', height: '34px', borderRadius: '8px',
                                                    background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#ffffff', flexShrink: 0
                                                }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '0.92rem', color: '#065f46', display: 'block' }}>Official Classroom Link Active</strong>
                                                    <span style={{ fontSize: '0.78rem', color: '#047857' }}>Shared with all your booked students and administration</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyMeet}
                                                    className="glass-btn secondary"
                                                    style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#ffffff' }}
                                                >
                                                    {copiedMeet ? 'Copied!' : 'Copy Link'}
                                                </button>
                                                <a
                                                    href={form.google_meet_link.startsWith('http') ? form.google_meet_link : `https://${form.google_meet_link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="glass-btn primary"
                                                    style={{
                                                        padding: '6px 14px',
                                                        fontSize: '0.82rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        textDecoration: 'none',
                                                        background: '#059669'
                                                    }}
                                                >
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                                    Open Classroom
                                                </a>
                                            </div>
                                        </div>
                                        <div style={{
                                            background: '#ffffff',
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(5, 150, 105, 0.2)',
                                            fontSize: '0.88rem',
                                            color: '#064e3b',
                                            wordBreak: 'break-all',
                                            fontFamily: 'monospace'
                                        }}>
                                            {form.google_meet_link}
                                        </div>
                                        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#047857' }}>
                                            * Note: To modify or replace this link, please reach out to your Classes Administrator.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.08)',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#ffffff', flexShrink: 0, marginTop: '2px'
                                            }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                            </div>
                                            <div>
                                                <strong style={{ fontSize: '0.92rem', color: '#92400e', display: 'block', marginBottom: '3px' }}>
                                                    No Google Meet Link Assigned Yet
                                                </strong>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', lineHeight: 1.5 }}>
                                                    Your official classroom Google Meet link is configured by Classes Administration.
                                                    Once the admin assigns your link, it will appear here and sync automatically with your student bookings.
                                                    If you have a class scheduled soon and need a link, please notify the Classes Admin.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={handleSave} className="glass-btn primary" disabled={saving} style={{ marginTop: '16px', padding: '10px 24px' }}>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                    {/* Demo Videos */}
                    <div className="glass-card" style={{ padding: '28px' }}>
                        <h3 className="section-heading">Demo Videos</h3>
                        {videos.length > 0 && (
                            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                                {videos.map(v => (
                                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', background: 'var(--background-light)', border: '1px solid var(--card-border, #e0e0e0)' }}>
                                        <div>
                                            <strong>{v.title}</strong>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{v.video_url}</p>
                                        </div>
                                        <button onClick={() => handleDeleteVideo(v.id)} className="glass-btn danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <form onSubmit={handleAddVideo} className="responsive-grid-2">
                            <div><label style={labelStyle}>Title</label><input value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} style={inputStyle} required /></div>
                            <div><label style={labelStyle}>Video URL</label><input value={videoForm.video_url} onChange={e => setVideoForm({ ...videoForm, video_url: e.target.value })} style={inputStyle} required placeholder="YouTube/Vimeo URL" /></div>
                            <div><label style={labelStyle}>Type</label>
                                <select value={videoForm.video_type} onChange={e => setVideoForm({ ...videoForm, video_type: e.target.value })} style={inputStyle}>
                                    <option value="youtube">YouTube</option><option value="vimeo">Vimeo</option>
                                </select>
                            </div>
                            <div><label style={labelStyle}>Description</label><input value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })} style={inputStyle} /></div>
                            <button type="submit" className="glass-btn primary" style={{ gridColumn: '1 / -1', padding: '10px' }}>Add Video</button>
                        </form>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}

export default withAuth(ManageProfile, ['teacher', 'admin']);
