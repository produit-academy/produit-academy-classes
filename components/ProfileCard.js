// components/ProfileCard.js - Clean, Modern Teacher Profile Card
import { useRouter } from 'next/router';
import { GraduationCap, Award, ArrowRight, CheckCircle2, User } from 'lucide-react';

export default function ProfileCard({ teacher, subjectId, courseId }) {
    const router = useRouter();

    const initials = (teacher.name || 'T')
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'T';

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
            onClick={handleCardClick}
            style={{
                cursor: 'pointer',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(15, 23, 42, 0.1)';
                e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(15, 23, 42, 0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
            }}
        >
            {/* Top Card Header with Avatar & Details */}
            <div style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                padding: '22px 20px 18px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
            }}>
                {/* Clean Modern Rounded Avatar */}
                <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '14px',
                    flexShrink: 0,
                    background: photoSrc ? '#f1f5f9' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                    border: '2px solid #ffffff',
                }}>
                    {photoSrc ? (
                        <img
                            src={photoSrc}
                            alt={teacher.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>

                {/* Identity & Badges */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Modern Availability Pill */}
                    <div style={{ marginBottom: '6px' }}>
                        <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.4px',
                            textTransform: 'uppercase',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: isAvailable ? '#ecfdf5' : '#f1f5f9',
                            color: isAvailable ? '#047857' : '#64748b',
                            border: `1px solid ${isAvailable ? '#a7f3d0' : '#e2e8f0'}`,
                        }}>
                            {isAvailable && (
                                <span
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        display: 'inline-block',
                                    }}
                                />
                            )}
                            <span>{isAvailable ? 'Available This Week' : 'No Open Slots'}</span>
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: 0,
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {teacher.name}
                        </h3>
                        <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} title="Verified Educator" />
                    </div>

                    {teacher.subject_name && (
                        <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#059669',
                            display: 'block',
                            marginTop: '2px',
                        }}>
                            {teacher.subject_name} Faculty
                        </span>
                    )}
                </div>
            </div>

            {/* Body Section */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Academic Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {teacher.qualification && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            padding: '4px 9px',
                            fontSize: '0.78rem',
                            color: '#0369a1',
                            fontWeight: 600,
                        }}>
                            <GraduationCap size={13} color="#0284c7" />
                            <span>{teacher.qualification}</span>
                        </span>
                    )}
                    {teacher.experience && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '6px',
                            padding: '4px 9px',
                            fontSize: '0.78rem',
                            color: '#b45309',
                            fontWeight: 600,
                        }}>
                            <Award size={13} color="#d97706" />
                            <span>{teacher.experience} exp</span>
                        </span>
                    )}
                </div>

                {/* Bio Snippet */}
                <div style={{ flex: 1, marginBottom: '18px' }}>
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
                        {teacher.bio || "Dedicated faculty committed to high-yield concept delivery, personalized mentoring, and exam success."}
                    </p>
                </div>

                {/* Bottom Row: Pricing & View Profile Action */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                    marginTop: 'auto',
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.72rem',
                            color: '#64748b',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            Per 1-Hour Class
                        </div>
                        <div style={{
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            lineHeight: 1.2,
                            marginTop: '2px',
                        }}>
                            ₹{teacher.hourly_rate || 0}
                        </div>
                    </div>

                    <button
                        type="button"
                        style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '9px 16px',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                            transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#047857'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#059669'; }}
                    >
                        <span>View Profile</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}
