// components/ProfileCard.js - Elevated Teacher Profile Card (Crisp Square Architectural Aesthetic)
import { useRouter } from 'next/router';
import {
    GraduationCap, Award, Globe, ArrowRight,
    CheckCircle2, Star, Clock
} from 'lucide-react';

export default function ProfileCard({ teacher, subjectId, courseId }) {
    const router = useRouter();

    const initials = (teacher.name || 'T')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const isAvailable = teacher.availability_status === 'Available';
    const photoSrc = teacher.profile_picture_base64 || teacher.profile_picture_url;

    const handleCardClick = () => {
        if (!teacher.user_id) {
            window.location.reload();
            return;
        }
        const queryParams = new URLSearchParams();
        if (subjectId) queryParams.set('subject', subjectId);
        if (courseId) queryParams.set('course', courseId);
        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
        router.push(`/teacher/${teacher.user_id}${queryStr}`);
    };

    return (
        <div
            className="pro-card-hover"
            onClick={handleCardClick}
            style={{
                cursor: 'pointer',
                borderRadius: '0px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Top Card Header with Square Avatar & Status */}
            <div style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                padding: '22px 20px 16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                position: 'relative'
            }}>
                {/* Crisp Square Avatar */}
                <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '0px',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px -2px rgba(5, 150, 105, 0.2)',
                    border: '2px solid #ffffff',
                    outline: '1px solid #e2e8f0'
                }}>
                    {photoSrc ? (
                        <img
                            src={photoSrc}
                            alt={teacher.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        initials
                    )}
                </div>

                {/* Identity & Badges */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Square Availability Tag */}
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '0px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: isAvailable ? '#ecfdf5' : '#f1f5f9',
                            color: isAvailable ? '#047857' : '#64748b',
                            border: `1px solid ${isAvailable ? '#a7f3d0' : '#e2e8f0'}`,
                        }}>
                            {isAvailable && <span className="live-pulse-dot" style={{ width: '6px', height: '6px' }} />}
                            <span>{isAvailable ? 'Available This Week' : 'No Open Slots'}</span>
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: 0,
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {teacher.name}
                        </h3>
                        <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} title="Verified Educator" />
                    </div>

                    {teacher.subject_name && (
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--accent-green-dark)',
                            display: 'block',
                            marginTop: '2px'
                        }}>
                            {teacher.subject_name} Faculty
                        </span>
                    )}
                </div>
            </div>

            {/* Details Section */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Academic Qualifications & Experience Square Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {teacher.qualification && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: '0px', padding: '4px 8px',
                            fontSize: '0.78rem', color: '#334155', fontWeight: 600
                        }}>
                            <GraduationCap size={13} color="#0284c7" />
                            <span>{teacher.qualification}</span>
                        </span>
                    )}
                    {teacher.experience && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: '0px', padding: '4px 8px',
                            fontSize: '0.78rem', color: '#334155', fontWeight: 600
                        }}>
                            <Award size={13} color="#d97706" />
                            <span>{teacher.experience} exp</span>
                        </span>
                    )}
                </div>

                {/* Bio Snippet */}
                <div style={{ flex: 1, marginBottom: '20px' }}>
                    <p style={{
                        fontSize: '0.88rem',
                        color: '#64748b',
                        lineHeight: 1.6,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {teacher.bio || "Dedicated educator focused on conceptual clarity, active student engagement, and systematic problem solving."}
                    </p>
                </div>

                {/* Bottom Row: Pricing & Square Action Button */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                    marginTop: 'auto',
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Per 1-Hour Class
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                            ₹{teacher.hourly_rate || 0}
                        </div>
                    </div>

                    <button
                        style={{
                            background: 'var(--accent-green)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '0px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(51, 174, 120, 0.2)',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <span>View Profile</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}
