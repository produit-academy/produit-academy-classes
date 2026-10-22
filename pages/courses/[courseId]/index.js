// pages/courses/[courseId]/index.js - Professional Education Platform Design
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { apiGet } from '../../../lib/api';
import {
    Calculator, FlaskConical, Globe, BookOpen,
    ArrowLeft, ChevronRight, Users, Search,
    CheckCircle2, Video, Atom, Compass, Languages,
    TrendingUp, Cpu, GraduationCap, Award
} from 'lucide-react';

const SUBJECT_THEMES = {
    'math': {
        icon: Calculator,
        color: '#1d4ed8',
        bg: '#eff6ff',
        border: '#bfdbfe',
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        category: 'Mathematics & Analytics',
    },
    'science': {
        icon: Atom,
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
        category: 'General Science',
    },
    'physics': {
        icon: Atom,
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        category: 'Physical Sciences',
    },
    'chemistry': {
        icon: FlaskConical,
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        category: 'Chemical Sciences',
    },
    'biology': {
        icon: Compass,
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        category: 'Biological Sciences',
    },
    'social': {
        icon: Globe,
        color: '#0d9488',
        bg: '#f0fdfa',
        border: '#99f6e4',
        gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        category: 'Social Sciences',
    },
    'history': {
        icon: Compass,
        color: '#9333ea',
        bg: '#faf5ff',
        border: '#e9d5ff',
        gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
        category: 'Historical Studies',
    },
    'language': {
        icon: Languages,
        color: '#e11d48',
        bg: '#fff1f2',
        border: '#fecdd3',
        gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
        category: 'Language & Grammar',
    },
    'english': {
        icon: BookOpen,
        color: '#c026d3',
        bg: '#fdf4ff',
        border: '#f5d0fe',
        gradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)',
        category: 'English Literature & Language',
    },
    'commerce': {
        icon: TrendingUp,
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        category: 'Commerce & Economics',
    },
    'computer': {
        icon: Cpu,
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        category: 'Computer Science & Coding',
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
        category: 'Core Academic Discipline',
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
        setLoading(true);

        apiGet(`/api/classes/subjects/?course_id=${courseId}`)
            .then(subs => {
                const subList = Array.isArray(subs) ? subs : (subs?.results || []);
                setSubjects(subList);
                if (subList.length > 0 && subList[0].course_name) {
                    setCourseName(subList[0].course_name);
                } else {
                    apiGet(`/api/classes/courses/${courseId}/`)
                        .then(c => setCourseName(c?.name || 'Class'))
                        .catch(() => setCourseName('Class'));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [courseId]);

    const filteredSubjects = useMemo(() => {
        if (!searchQuery.trim()) return subjects;
        return subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    }, [subjects, searchQuery]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <Head>
                <title>{courseName ? `${courseName} Subjects` : 'Class Subjects'} | Produit Academy</title>
                <meta name="description" content={`Explore curriculum subjects and certified faculty for ${courseName}.`} />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '86px', paddingBottom: '60px' }}>
                <div className="container" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 16px' }}>
                    
                    {/* Professional Academic Breadcrumbs */}
                    <nav style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.86rem',
                        color: '#64748b',
                        marginBottom: '18px'
                    }}>
                        <Link href="/courses" style={{
                            color: '#059669',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <ArrowLeft size={16} /> All Classes
                        </Link>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{courseName || 'Class'}</span>
                    </nav>

                    {/* Class Header Banner */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '24px 22px',
                        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03)',
                        marginBottom: '28px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div style={{ maxWidth: '680px' }}>
                            <h1 style={{
                                fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)',
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.25,
                                marginBottom: '6px'
                            }}>
                                {courseName} Subjects
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.96rem', lineHeight: 1.5, margin: 0 }}>
                                Choose a subject below to review certified educators and book 1-on-1 sessions.
                            </p>
                        </div>

                        {/* Search Filter */}
                        {subjects.length > 3 && (
                            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                <Search size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Filter subjects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '11px 16px 11px 40px',
                                        fontSize: '0.92rem',
                                        borderRadius: '10px',
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
                        <div className="loading-container" style={{ minHeight: '320px' }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '60px 24px',
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                No subjects registered yet
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.96rem', margin: 0 }}>
                                Curriculum modules for {courseName} are being compiled. Please return shortly.
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            padding: '26px 24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                                            position: 'relative',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 14px 28px -4px rgba(15, 23, 42, 0.08)';
                                            e.currentTarget.style.borderColor = theme.color;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.03)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        {/* Card Top Row: Discipline Category & Faculty Status */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '18px'
                                        }}>
                                            <span style={{
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.3px',
                                                color: theme.color,
                                                background: theme.bg,
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                border: `1px solid ${theme.border}`
                                            }}>
                                                {theme.category}
                                            </span>

                                            <div style={{
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.76rem',
                                                fontWeight: 700,
                                                background: teacherCount > 0 ? '#ecfdf5' : '#f8fafc',
                                                color: teacherCount > 0 ? '#047857' : '#64748b',
                                                border: `1px solid ${teacherCount > 0 ? '#a7f3d0' : '#e2e8f0'}`,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <Users size={13} />
                                                <span>{teacherCount} {teacherCount === 1 ? 'Faculty' : 'Faculty'}</span>
                                            </div>
                                        </div>

                                        {/* Rounded Icon Capsule */}
                                        <div style={{
                                            width: '54px',
                                            height: '54px',
                                            borderRadius: '14px',
                                            background: theme.bg,
                                            border: `1px solid ${theme.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: theme.color,
                                            marginBottom: '16px',
                                            boxShadow: `0 4px 12px -2px ${theme.color}25`
                                        }}>
                                            <IconComp size={26} strokeWidth={1.9} />
                                        </div>

                                        {/* Subject Title */}
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            marginBottom: '8px',
                                            lineHeight: 1.3
                                        }}>
                                            {subject.name}
                                        </h3>

                                        <p style={{
                                            fontSize: '0.86rem',
                                            color: '#64748b',
                                            marginBottom: '14px',
                                            lineHeight: 1.45,
                                            flex: 1
                                        }}>
                                            {subject.description || 'Board-aligned curriculum & 1-on-1 mentoring.'}
                                        </p>


                                        {/* Action Button */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '11px 16px',
                                            borderRadius: '10px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.88rem',
                                            fontWeight: 700,
                                            color: '#047857',
                                            transition: 'all 0.2s ease',
                                        }}>
                                            <span>Browse Faculty</span>
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
