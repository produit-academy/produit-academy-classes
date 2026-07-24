// components/ProfileCard.js - Teacher profile card for listings
import { useRouter } from 'next/router';

export default function ProfileCard({ teacher, subjectId, courseId }) {
    const router = useRouter();

    const initials = (teacher.name || 'T').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div
            className="glass-card"
            onClick={() => {
                if (!teacher.user_id) {
                    window.location.reload();
                    return;
                }
                router.push(`/teacher/${teacher.user_id}?subject=${subjectId}&course=${courseId}`);
            }}
            style={{
                padding: '0', cursor: 'pointer',
                borderRadius: '24px', transition: 'all 0.3s ease',
                display: 'flex', flexDirection: 'column',
                height: '100%',
                background: '#ffffff',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                overflow: 'hidden' // So the square image top fits the border radius
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'var(--accent-blue)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = 'var(--border)';
            }}
        >
            {/* Top Square Photo */}
            <div style={{
                width: '100%', background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '32px 24px 16px', position: 'relative'
            }}>
                <div style={{
                    width: '180px', height: '180px', borderRadius: '24px', flexShrink: 0,
                    background: 'var(--accent-blue)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', fontWeight: 800, overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }}>
                    {teacher.profile_picture_base64 || teacher.profile_picture_url ? (
                        <img src={teacher.profile_picture_base64 || teacher.profile_picture_url} alt={teacher.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                </div>
                
                {/* Availability Badge floating over image container */}
                <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    fontSize: '0.7rem', fontWeight: 800, padding: '6px 12px',
                    borderRadius: '8px', letterSpacing: '0.5px', textTransform: 'uppercase',
                    background: teacher.availability_status === 'Available' ? '#dcfce7' : '#f1f5f9',
                    color: teacher.availability_status === 'Available' ? '#166534' : '#64748b',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    {teacher.availability_status === 'Available' ? 'AVAILABLE' : 'NO SLOTS'}
                </div>
            </div>

            {/* Details Section */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {teacher.subject_name && (
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
                            background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
                            padding: '4px 10px', borderRadius: '6px'
                        }}>
                            {teacher.subject_name}
                        </span>
                    )}
                </div>

                <h3 style={{ 
                    fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a', lineHeight: 1.3
                }}>
                    {teacher.name}
                </h3>
                
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    {teacher.qualification && <span style={{ fontWeight: 500 }}>{teacher.qualification}</span>}
                    {teacher.qualification && teacher.experience && <span>•</span>}
                    {teacher.experience && <span style={{ fontWeight: 500 }}>{teacher.experience} experience</span>}
                </div>

                {/* Bio excerpt */}
                <div style={{ flex: 1 }}>
                    {teacher.bio && (
                        <p style={{
                            fontSize: '0.95rem', color: '#475569',
                            lineHeight: 1.6, margin: '0 0 24px 0',
                            display: '-webkit-box', WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {teacher.bio}
                        </p>
                    )}
                </div>

                {/* Bottom Row: Price */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '20px', borderTop: '1px dashed var(--border)',
                    marginTop: 'auto'
                }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Per Class (1 Hour)</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                        ₹{teacher.hourly_rate || 0}
                    </span>
                </div>
            </div>
        </div>
    );
}
