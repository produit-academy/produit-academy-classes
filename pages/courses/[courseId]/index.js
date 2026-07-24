// pages/courses/[courseId]/index.js - Subjects within a class (e.g., 6th CBSE → Maths, Science, ...)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { apiGet } from '../../../lib/api';
import {
    Calculator, FlaskConical, Globe, BookOpen,
    ArrowLeft, ChevronRight
} from 'lucide-react';

const SUBJECT_ICON_MAP = {
    'maths': { icon: Calculator, color: '#3b82f6' },
    'math': { icon: Calculator, color: '#3b82f6' },
    'science': { icon: FlaskConical, color: '#8b5cf6' },
    'social': { icon: Globe, color: '#10b981' },
    'languages': { icon: BookOpen, color: '#f59e0b' },
};

function getSubjectMeta(name) {
    const lower = (name || '').toLowerCase();
    for (const [key, meta] of Object.entries(SUBJECT_ICON_MAP)) {
        if (lower.includes(key)) return meta;
    }
    return { icon: BookOpen, color: '#64748b' };
}

export default function SubjectsPage() {
    const router = useRouter();
    const { courseId } = router.query;
    const [subjects, setSubjects] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId) return;
        Promise.all([
            apiGet(`/api/classes/subjects/?course_id=${courseId}`),
            apiGet('/api/classes/courses/?page_size=200'),
        ]).then(([subs, coursesData]) => {
            setSubjects(Array.isArray(subs) ? subs : (subs?.results || []));
            const coursesList = coursesData?.results || (Array.isArray(coursesData) ? coursesData : []);
            const c = coursesList.find(c => String(c.id) === String(courseId));
            setCourseName(c?.name || 'Class');
        }).catch(console.error).finally(() => setLoading(false));
    }, [courseId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head><title>{courseName} - Choose Subject | Produit Classes</title></Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/courses')}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.95rem',
                            marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px',
                            padding: 0,
                        }}
                    >
                        <ArrowLeft size={18} /> Back to Classes
                    </button>

                    {/* Page Header */}
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <p style={{
                            fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-blue)',
                            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
                        }}>
                            {courseName}
                        </p>
                        <h1 style={{
                            fontFamily: "'Lora', serif", fontSize: '2.2rem', fontWeight: 700,
                            marginBottom: '12px', color: 'var(--text-primary)',
                        }}>
                            Choose a Subject
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
                            Pick a subject to browse available expert teachers.
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-container"><div className="loading-spinner" /></div>
                    ) : subjects.length === 0 ? (
                        <div className="glass-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <h3>No subjects available yet</h3>
                            <p>Subjects will be added by the admin shortly.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '24px', maxWidth: '900px', margin: '0 auto',
                        }}>
                            {subjects.map((subject) => {
                                const meta = getSubjectMeta(subject.name);
                                const IconComponent = meta.icon;

                                return (
                                    <div
                                        key={subject.id}
                                        onClick={() => router.push(`/courses/${courseId}/${subject.id}/teachers`)}
                                        className="glass-card"
                                        style={{
                                            padding: '32px 24px', cursor: 'pointer',
                                            textAlign: 'center', transition: 'all 0.3s ease',
                                            borderRadius: '16px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    >
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '16px',
                                            background: `${meta.color}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '20px',
                                            color: meta.color,
                                        }}>
                                            <IconComponent size={32} color={meta.color} strokeWidth={1.5} />
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                                            {subject.name}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                                            {subject.teacher_count || 0} Teacher{(subject.teacher_count || 0) !== 1 ? 's' : ''} available
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
