// pages/teacher/[teacherId].js - Elevated Public Teacher Profile (Crisp Square Architectural Aesthetic)
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BookingModal from '../../components/BookingModal';
import { useAuth } from '../../lib/auth';
import {
    GraduationCap, Award, Globe, Video, Calendar,
    CheckCircle2, Clock, Sparkles, ArrowLeft, ShieldCheck,
    BookOpen, UserCheck, PlayCircle, ExternalLink, AlertCircle
} from 'lucide-react';

export default function TeacherProfilePage() {
    const router = useRouter();
    const { teacherId, subject, course } = router.query;
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        if (!teacherId) return;
        fetch(`${API_URL}/api/classes/teacher-profile/${teacherId}/`)
            .then(r => {
                if (!r.ok) throw new Error('Teacher not found');
                return r.json();
            })
            .then(data => {
                setProfile(data);
                if (subject) {
                    setSelectedSubjectId(subject);
                } else if (data.taught_subject_names?.length > 0) {
                    setSelectedSubjectId(data.taught_subject_names[0].id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [teacherId, API_URL, subject]);

    const initials = (profile?.name || 'T')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        return null;
    };

    const groupedSlots = useMemo(() => {
        if (!profile?.availability_slots?.length) return [];
        const groups = {};
        profile.availability_slots.forEach(slot => {
            if (!groups[slot.date]) groups[slot.date] = [];
            groups[slot.date].push(slot);
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [profile]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const formatTime = (timeStr) => {
        const [h, m] = (timeStr || '').split(':');
        if (!h) return '';
        const d = new Date();
        d.setHours(parseInt(h, 10), parseInt(m, 10));
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    };

    const photoSrc = profile?.profile_picture_base64 || profile?.profile_picture_url;
    const hasSlots = (profile?.availability_slots?.length || 0) > 0;

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <Header />
            <main className="main-content" style={{ paddingTop: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="loading-spinner" />
            </main>
            <Footer />
        </div>
    );

    if (!profile) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <Header />
            <main className="main-content" style={{ paddingTop: '140px', textAlign: 'center' }}>
                <div style={{
                    maxWidth: '480px', margin: '0 auto', padding: '48px 24px',
                    background: '#ffffff', borderRadius: '0px', border: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                        Teacher Profile Not Found
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        The educator profile you are looking for may have been removed or is temporarily unavailable.
                    </p>
                    <button
                        onClick={() => router.push('/courses')}
                        className="glass-btn primary"
                        style={{ padding: '10px 24px', borderRadius: '0px' }}
                    >
                        Browse All Classes
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Head>
                <title>{profile.name} - Faculty Profile | Produit Academy</title>
                <meta name="description" content={`Book 1-on-1 classes with ${profile.name}. Review academic credentials, teaching style, demo classes, and schedule live sessions.`} />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '108px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>
                    
                    {/* Back Navigation Bar */}
                    <div style={{ marginBottom: '24px' }}>
                        <button
                            onClick={() => router.back()}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                color: '#334155',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <ArrowLeft size={16} />
                            <span>Back</span>
                        </button>
                    </div>

                    {/* Hero Profile Banner Card */}
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '0px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
                        padding: '36px',
                        marginBottom: '32px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '36px',
                        alignItems: 'center',
                    }}>
                        {/* Left Side: Crisp Square Photo & Personal Details */}
                        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Crisp Square Avatar */}
                            <div style={{
                                width: '130px',
                                height: '130px',
                                borderRadius: '0px',
                                flexShrink: 0,
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.8rem',
                                fontWeight: 800,
                                overflow: 'hidden',
                                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                                border: '3px solid #ffffff',
                                outline: '1px solid #e2e8f0'
                            }}>
                                {photoSrc ? (
                                    <img
                                        src={photoSrc}
                                        alt={profile.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    initials
                                )}
                            </div>

                            {/* Details & Credentials */}
                            <div style={{ flex: 1, minWidth: '240px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        background: '#ecfdf5', color: '#047857',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '0px', padding: '4px 10px',
                                        fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase'
                                    }}>
                                        <CheckCircle2 size={14} />
                                        <span>Verified Faculty</span>
                                    </span>

                                    {hasSlots ? (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            background: '#f0fdf4', color: '#15803d',
                                            border: '1px solid #bbf7d0',
                                            borderRadius: '0px', padding: '4px 10px',
                                            fontSize: '0.78rem', fontWeight: 700
                                        }}>
                                            <span className="live-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '0px' }} />
                                            <span>Active Slots Available</span>
                                        </span>
                                    ) : (
                                        <span style={{
                                            background: '#f8fafc', color: '#64748b',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0px', padding: '4px 10px',
                                            fontSize: '0.78rem', fontWeight: 600
                                        }}>
                                            Schedule on Request
                                        </span>
                                    )}
                                </div>

                                <h1 style={{
                                    fontFamily: "'Lora', serif",
                                    fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    marginBottom: '14px',
                                    lineHeight: 1.2
                                }}>
                                    {profile.name}
                                </h1>

                                {/* Taught Subjects Square Badges */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                    {profile.taught_subject_names?.map((s) => (
                                        <span
                                            key={s.id}
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                background: '#f1f5f9',
                                                color: '#334155',
                                                padding: '5px 10px',
                                                borderRadius: '0px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        >
                                            {s.name} <span style={{ color: '#64748b', fontWeight: 500 }}>({s.course__name})</span>
                                        </span>
                                    ))}
                                </div>

                                {/* Key Highlights Grid */}
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '16px',
                                    fontSize: '0.9rem',
                                    color: '#475569'
                                }}>
                                    {profile.qualification && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <GraduationCap size={18} color="#0284c7" />
                                            <span style={{ fontWeight: 600 }}>{profile.qualification}</span>
                                        </div>
                                    )}
                                    {profile.experience && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Award size={18} color="#d97706" />
                                            <span style={{ fontWeight: 600 }}>{profile.experience} experience</span>
                                        </div>
                                    )}
                                    {profile.languages && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Globe size={18} color="#059669" />
                                            <span style={{ fontWeight: 600 }}>{profile.languages}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Square Booking Quick Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0px',
                            padding: '28px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '18px',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'
                        }}>
                            {/* Fee Banner */}
                            <div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Tuition Fee
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>
                                        ₹{profile.hourly_rate || 0}
                                    </span>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                                        / 1-Hour Class
                                    </span>
                                </div>
                            </div>

                            {/* Subject selector if multiple taught subjects */}
                            {profile.taught_subject_names?.length > 1 && (
                                <div>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                                        Select Subject to Book:
                                    </label>
                                    <select
                                        value={selectedSubjectId || ''}
                                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '0px',
                                            border: '1px solid #cbd5e1',
                                            background: '#ffffff',
                                            fontSize: '0.88rem',
                                            fontWeight: 600,
                                            color: '#0f172a',
                                            outline: 'none'
                                        }}
                                    >
                                        {profile.taught_subject_names.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.course__name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Square Booking Action Button */}
                            {user?.role === 'student' ? (
                                hasSlots ? (
                                    <button
                                        onClick={() => setShowBooking(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '16px 24px',
                                            borderRadius: '0px',
                                            fontSize: '1.05rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <Calendar size={18} />
                                        <span>Book 1-on-1 Class</span>
                                    </button>
                                ) : (
                                    <div style={{
                                        padding: '14px 20px',
                                        background: '#e2e8f0',
                                        color: '#64748b',
                                        borderRadius: '0px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        textAlign: 'center'
                                    }}>
                                        No Open Slots This Week
                                    </div>
                                )
                            ) : (
                                <Link
                                    href={`/login?redirect=/teacher/${teacherId}`}
                                    style={{
                                        background: 'var(--accent-green)',
                                        color: '#ffffff',
                                        padding: '14px 20px',
                                        borderRadius: '0px',
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        textAlign: 'center',
                                        display: 'block',
                                        boxShadow: '0 4px 12px rgba(51, 174, 120, 0.25)'
                                    }}
                                >
                                    Sign In as Student to Book
                                </Link>
                            )}

                            {/* Trust Checklist */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#475569', paddingTop: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                    <ShieldCheck size={16} color="#059669" />
                                    <span>Live 1-on-1 Interactive Session</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                    <Video size={16} color="#2563eb" />
                                    <span>High-Def Google Meet Link Provided</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                    <Clock size={16} color="#d97706" />
                                    <span>60 Minutes Full Dedicated Guidance</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content Grid: Two Column Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '28px',
                        marginBottom: '32px'
                    }}>
                        {/* About Section */}
                        {profile.bio && (
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '0px',
                                border: '1px solid #e2e8f0',
                                padding: '32px',
                                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '0px',
                                        background: '#ecfdf5', color: '#047857',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <BookOpen size={20} />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                        About the Educator
                                    </h2>
                                </div>
                                <p style={{ fontSize: '0.98rem', lineHeight: 1.75, color: '#334155', margin: 0, whiteSpace: 'pre-line' }}>
                                    {profile.bio}
                                </p>
                            </div>
                        )}

                        {/* Teaching Style & Methodology */}
                        {profile.teaching_style && (
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '0px',
                                border: '1px solid #e2e8f0',
                                padding: '32px',
                                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '0px',
                                        background: '#eff6ff', color: '#2563eb',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Sparkles size={20} />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                        Teaching Methodology
                                    </h2>
                                </div>
                                <p style={{ fontSize: '0.98rem', lineHeight: 1.75, color: '#334155', margin: 0, whiteSpace: 'pre-line' }}>
                                    {profile.teaching_style}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Academic & Professional Background Card */}
                    {(profile.skills || profile.certifications) && (
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '0px',
                            border: '1px solid #e2e8f0',
                            padding: '32px',
                            marginBottom: '32px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '0px',
                                    background: '#fef3c7', color: '#d97706',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Award size={20} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                    Academic & Professional Background
                                </h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
                                {profile.skills && (
                                    <div>
                                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                                            Subject Expertise & Skills
                                        </h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {profile.skills.split(',').map((skill, idx) => {
                                                const s = skill.trim();
                                                if (!s) return null;
                                                return (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            background: '#f8fafc',
                                                            border: '1px solid #e2e8f0',
                                                            padding: '6px 12px',
                                                            borderRadius: '0px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            color: '#334155'
                                                        }}
                                                    >
                                                        {s}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {profile.certifications && (
                                    <div>
                                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                                            Certifications & Honors
                                        </h3>
                                        <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                                            {profile.certifications}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Available Schedule Preview */}
                    {hasSlots && (
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '0px',
                            border: '1px solid #e2e8f0',
                            padding: '32px',
                            marginBottom: '32px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '0px',
                                        background: '#ecfdf5', color: '#047857',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                            Upcoming Available Slots
                                        </h2>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
                                            Choose an available session and book directly.
                                        </p>
                                    </div>
                                </div>

                                {user?.role === 'student' && (
                                    <button
                                        onClick={() => setShowBooking(true)}
                                        style={{
                                            background: '#f0fdf4',
                                            color: '#047857',
                                            border: '1px solid #a7f3d0',
                                            padding: '8px 16px',
                                            borderRadius: '0px',
                                            fontSize: '0.88rem',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Select Slot & Book →
                                    </button>
                                )}
                            </div>

                            {/* Schedule Days Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: '16px'
                            }}>
                                {groupedSlots.map(([dateStr, slots]) => (
                                    <div
                                        key={dateStr}
                                        style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0px',
                                            padding: '16px',
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '0.88rem', fontWeight: 700, color: '#0f172a',
                                            marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <Calendar size={15} color="#059669" />
                                            <span>{formatDate(dateStr)}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {slots.map(slot => (
                                                <span
                                                    key={slot.id}
                                                    style={{
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        background: '#ffffff',
                                                        border: '1px solid #cbd5e1',
                                                        borderRadius: '0px',
                                                        padding: '4px 8px',
                                                        color: '#334155',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Clock size={12} color="#64748b" />
                                                    <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Demo Classes Section */}
                    {profile.demo_videos?.length > 0 && (
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '0px',
                            border: '1px solid #e2e8f0',
                            padding: '32px',
                            marginBottom: '32px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '0px',
                                    background: '#eff6ff', color: '#2563eb',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Video size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                        Interactive Demo Classes
                                    </h2>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
                                        Preview teaching clarity, pace, and interactive explanations.
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '24px',
                            }}>
                                {profile.demo_videos.map((video) => {
                                    const embedUrl = getEmbedUrl(video.video_url);

                                    return (
                                        <div
                                            key={video.id}
                                            style={{
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '0px',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {embedUrl ? (
                                                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000000' }}>
                                                    <iframe
                                                        src={embedUrl}
                                                        style={{
                                                            position: 'absolute', top: 0, left: 0,
                                                            width: '100%', height: '100%', border: 'none'
                                                        }}
                                                        allowFullScreen
                                                        title={video.title}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: '100%', aspectRatio: '16/9', background: '#0f172a',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                    justifyContent: 'center', color: '#ffffff', gap: '8px'
                                                }}>
                                                    <PlayCircle size={44} color="var(--accent-green)" />
                                                    <a
                                                        href={video.video_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: '#ffffff', fontWeight: 600, fontSize: '0.9rem',
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                        }}
                                                    >
                                                        <span>Watch Sample Video</span>
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                            )}

                                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px', lineHeight: 1.3 }}>
                                                    {video.title}
                                                </h3>
                                                {video.description && (
                                                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                                                        {video.description}
                                                    </p>
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

            {/* Booking Modal */}
            {showBooking && (
                <BookingModal
                    teacher={profile}
                    subjectId={selectedSubjectId || subject}
                    courseId={course}
                    onClose={() => setShowBooking(false)}
                />
            )}
        </div>
    );
}
