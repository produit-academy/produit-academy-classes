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

    const handleSave = async () => {
        setSaving(true); setMsg('');
        const res = await apiPatch('/api/classes/teacher/manage-profile/', form);
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Google Meet Link (permanent)</label><input value={form.google_meet_link} onChange={e => setForm({ ...form, google_meet_link: e.target.value })} style={inputStyle} placeholder="https://meet.google.com/abc-defg-hij" /></div>
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
