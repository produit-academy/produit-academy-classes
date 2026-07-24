// pages/teacher/[teacherId].js - Public teacher profile + booking
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BookingModal from '../../components/BookingModal';
import { useAuth } from '../../lib/auth';

export default function TeacherProfilePage() {
    const router = useRouter();
    const { teacherId, subject, course } = router.query;
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (!teacherId) return;
        fetch(`${API_URL}/api/classes/teacher-profile/${teacherId}/`)
            .then(r => r.json())
            .then(setProfile)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [teacherId, API_URL]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main className="main-content" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <div className="loading-spinner" />
            </main>
        </div>
    );

    if (!profile) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main className="main-content" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <h2>Teacher not found</h2>
            </main>
        </div>
    );

    const initials = (profile.name || 'T').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head><title>{profile.name} | Produit Classes</title></Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <button onClick={() => router.back()} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.95rem',
                        marginBottom: '24px',
                    }}>← Back</button>

                    {/* Professional Profile Header */}
                    <div className="glass-card" style={{ padding: '40px', marginBottom: '32px', borderRadius: '24px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
                        
                        {/* Square Avatar */}
                        <div style={{
                            width: '200px', height: '200px', borderRadius: '24px', flexShrink: 0,
                            background: 'var(--accent-blue)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '4rem', fontWeight: 800, overflow: 'hidden',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                        }}>
                            {profile.profile_picture_base64 || profile.profile_picture_url ? (
                                <img src={profile.profile_picture_base64 || profile.profile_picture_url} alt={profile.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : initials}
                        </div>

                        {/* Profile Info Details */}
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {profile.taught_subject_names?.map(s => (
                                    <span key={s.id} style={{
                                        fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
                                        background: '#f1f5f9', color: '#475569',
                                        padding: '8px 14px', borderRadius: '8px'
                                    }}>{s.name} ({s.course__name})</span>
                                ))}
                                <span style={{
                                    fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
                                    background: '#dcfce7', color: '#166534',
                                    padding: '8px 14px', borderRadius: '8px'
                                }}>₹{profile.hourly_rate} / CLASS (1 HR)</span>
                            </div>

                            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', lineHeight: 1.2 }}>
                                {profile.name}
                            </h1>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                                {profile.qualification && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{profile.qualification}</span>
                                    </div>
                                )}
                                {profile.experience && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{profile.experience} experience</span>
                                    </div>
                                )}
                                {profile.languages && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{profile.languages}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Action */}
                        <div style={{ alignSelf: 'center', marginLeft: 'auto' }}>
                            {user && user.role === 'student' && (
                                profile.availability_slots?.length > 0 ? (
                                    <button
                                        className="glass-btn primary"
                                        onClick={() => setShowBooking(true)}
                                        style={{ padding: '16px 40px', fontWeight: 800, fontSize: '1.1rem', borderRadius: '12px', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
                                    >
                                        Book Teacher
                                    </button>
                                ) : (
                                    <div style={{
                                        padding: '16px 32px', background: '#f1f5f9', color: '#64748b',
                                        borderRadius: '12px', fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap'
                                    }}>
                                        No Available Slots
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>About</h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{profile.bio}</p>
                        </div>
                    )}

                    {/* Professional Details */}
                    {(profile.skills || profile.certifications || profile.teaching_style) && (
                        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Professional Background</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {profile.skills && (
                                    <div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {profile.skills.split(',').map((s, i) => (
                                                <span key={i} style={{
                                                    background: 'var(--background-light)', padding: '6px 14px',
                                                    borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-primary)',
                                                    border: '1px solid var(--card-border)',
                                                }}>{s.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.certifications && (
                                    <div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certifications</span>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{profile.certifications}</p>
                                    </div>
                                )}
                                {profile.teaching_style && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teaching Style</span>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{profile.teaching_style}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Demo Classes */}
                    {profile.demo_videos?.length > 0 && (
                        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                </div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Demo Classes</h2>
                            </div>
                            
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '24px',
                            }}>
                                {profile.demo_videos.map(video => {
                                    const embedUrl = getEmbedUrl(video.video_url);
                                    return (
                                        <div key={video.id} style={{ 
                                            borderRadius: '16px', overflow: 'hidden', 
                                            background: '#fff', border: '1px solid var(--border)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                                        }}>
                                            {embedUrl ? (
                                                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                    <iframe
                                                        src={embedUrl}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                                        allowFullScreen
                                                        title={video.title}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%', aspectRatio: '16/9', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <a href={video.video_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Watch Video</a>
                                                </div>
                                            )}
                                            <div style={{ padding: '20px' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a', lineHeight: 1.4 }}>{video.title}</h3>
                                                {video.description && (
                                                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{video.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <Footer />

            {showBooking && (
                <BookingModal
                    teacher={profile}
                    subjectId={subject}
                    courseId={course}
                    onClose={() => setShowBooking(false)}
                />
            )}
        </div>
    );
}
