// pages/courses/[courseId]/index.js - Subjects within a class (Crisp Square Architectural Aesthetic)
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { apiGet } from '../../../lib/api';
import {
    Calculator, FlaskConical, Globe, BookOpen,
    ArrowLeft, ChevronRight, Users, Sparkles, Search,
    CheckCircle2, Video
} from 'lucide-react';

const SUBJECT_THEMES = {
    'math': {
        icon: Calculator,
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    },
    'science': {
        icon: FlaskConical,
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    },
    'physics': {
        icon: FlaskConical,
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    },
    'chemistry': {
        icon: FlaskConical,
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    },
    'biology': {
        icon: FlaskConical,
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    'social': {
        icon: Globe,
        color: '#0d9488',
        bg: '#f0fdfa',
        border: '#99f6e4',
        gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    },
    'history': {
        icon: Globe,
        color: '#9333ea',
        bg: '#faf5ff',
        border: '#e9d5ff',
        gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
    },
    'language': {
        icon: BookOpen,
        color: '#e11d48',
        bg: '#fff1f2',
        border: '#fecdd3',
        gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    },
    'english': {
        icon: BookOpen,
        color: '#c026d3',
        bg: '#fdf4ff',
        border: '#f5d0fe',
        gradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)',
    },
    'commerce': {
        icon: Calculator,
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    'economics': {
        icon: Globe,
        color: '#ea580c',
        bg: '#fff7ed',
        border: '#fed7aa',
        gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    },
};

function getSubjectTheme(name = '') {
    const lower = name.toLowerCase();
    for (const [key, theme] of Object.entries(SUBJECT_THEMES)) {
        if (lower.includes(key)) return theme;
    }
    return {
        icon: BookOpen,
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    };
}

export default function SubjectsPage() {
    const router = useRouter();
    const { courseId } = router.query;
    const [subjects, setSubjects] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredSubjects = useMemo(() => {
        if (!searchQuery.trim()) return subjects;
        return subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    }, [subjects, searchQuery]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Head>
                <title>{courseName} Subjects | Produit Academy Classes</title>
                <meta name="description" content={`Explore expert tutors and comprehensive syllabi for ${courseName}.`} />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '108px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>
                    
                    {/* Breadcrumbs Navigation */}
                    <nav style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.88rem', color: '#64748b', marginBottom: '28px'
                    }}>
                        <Link href="/courses" style={{
                            color: 'var(--accent-green-dark)', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                            <ArrowLeft size={16} /> All Classes
                        </Link>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{courseName}</span>
                    </nav>

                    {/* Class Banner Header */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0px',
                        padding: '36px 32px',
                        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                        marginBottom: '36px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '24px'
                    }}>
                        <div style={{ maxWidth: '640px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: '#eaf7f0', color: 'var(--accent-green-dark)',
                                padding: '5px 12px', borderRadius: '0px',
                                borderLeft: '3px solid var(--accent-green-dark)',
                                fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.5px', marginBottom: '12px'
                            }}>
                                <Sparkles size={14} />
                                <span>Academic Curriculum</span>
                            </div>

                            <h1 style={{
                                fontFamily: "'Lora', serif",
                                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                                fontWeight: 700,
                                color: '#0f172a',
                                lineHeight: 1.25,
                                marginBottom: '10px'
                            }}>
                                {courseName} Subjects
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
                                Select a subject to browse verified faculty, watch sample demo lectures, and schedule 1-on-1 personalized sessions.
                            </p>
                        </div>

                        {/* Search subject quickly if multiple */}
                        {subjects.length > 4 && (
                            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                <Search size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                                <input
                                    type="text"
                                    placeholder="Filter subject..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '11px 16px 11px 40px',
                                        fontSize: '0.92rem',
                                        borderRadius: '0px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Subjects Grid */}
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '300px' }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0px',
                            padding: '60px 24px',
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                No subjects available yet
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                                Subjects for {courseName} are being updated by academic administrators. Please check back soon!
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '24px',
                        }}>
                            {filteredSubjects.map((subject) => {
                                const theme = getSubjectTheme(subject.name);
                                const IconComp = theme.icon;
                                const teacherCount = subject.teacher_count || 0;

                                return (
                                    <div
                                        key={subject.id}
                                        onClick={() => router.push(`/courses/${courseId}/${subject.id}/teachers`)}
                                        className="pro-card-hover"
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '0px',
                                            border: '1px solid #e2e8f0',
                                            padding: '28px 24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Square Icon & Teacher Badge */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '20px'
                                        }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '0px',
                                                background: theme.bg,
                                                border: `1px solid ${theme.border}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: theme.color,
                                                boxShadow: `0 4px 10px -2px ${theme.color}25`
                                            }}>
                                                <IconComp size={28} strokeWidth={1.8} />
                                            </div>

                                            <div style={{
                                                padding: '5px 10px',
                                                borderRadius: '0px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                background: teacherCount > 0 ? '#ecfdf5' : '#f8fafc',
                                                color: teacherCount > 0 ? '#047857' : '#64748b',
                                                border: `1px solid ${teacherCount > 0 ? '#a7f3d0' : '#e2e8f0'}`,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {teacherCount > 0 && <span className="live-pulse-dot" style={{ width: '6px', height: '6px' }} />}
                                                <span>{teacherCount} {teacherCount === 1 ? 'Teacher' : 'Teachers'}</span>
                                            </div>
                                        </div>

                                        {/* Subject Title */}
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 800,
                                            color: '#0f172a',
                                            marginBottom: '8px',
                                            lineHeight: 1.3
                                        }}>
                                            {subject.name}
                                        </h3>

                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#64748b',
                                            marginBottom: '24px',
                                            lineHeight: 1.5,
                                            flex: 1
                                        }}>
                                            {subject.description || `Comprehensive concepts, practice problem-solving & exam mastery for ${subject.name}.`}
                                        </p>

                                        {/* Perks Row */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            fontSize: '0.82rem',
                                            color: '#475569',
                                            fontWeight: 600,
                                            marginBottom: '20px',
                                            paddingTop: '16px',
                                            borderTop: '1px dashed #e2e8f0'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle2 size={15} color="#059669" />
                                                <span>Live Classes</span>
                                            </div>
                                            <span>•</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Video size={15} color="#2563eb" />
                                                <span>Demo Videos</span>
                                            </div>
                                        </div>

                                        {/* Square Action Button */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '11px 16px',
                                            borderRadius: '0px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            color: 'var(--accent-green-dark)',
                                        }}>
                                            <span>Browse Teachers</span>
                                            <ChevronRight size={17} />
                                        </div>
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
