// pages/courses/[courseId]/index.js - Subjects within a class (70% Minimalist + 20% Futuristic + 10% Playful, Zero Emojis)
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
    CheckCircle2, Video, Atom, Binary, Compass, Languages,
    TrendingUp, Cpu
} from 'lucide-react';

const SUBJECT_THEMES = {
    'math': {
        icon: Calculator,
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        cardClass: 'math-geometric-card',
        genre: 'GEOMETRIC & ANALYTICAL',
    },
    'science': {
        icon: Atom,
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        cardClass: 'science-futuristic-card',
        genre: 'FUTURISTIC & EXPERIMENTAL',
    },
    'physics': {
        icon: Atom,
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        cardClass: 'science-futuristic-card',
        genre: 'QUANTUM & KINETIC',
    },
    'chemistry': {
        icon: FlaskConical,
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        cardClass: 'science-futuristic-card',
        genre: 'MOLECULAR & LAB',
    },
    'biology': {
        icon: Compass,
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        cardClass: 'science-futuristic-card',
        genre: 'BIOLOGICAL SCIENCES',
    },
    'social': {
        icon: Globe,
        color: '#0d9488',
        bg: '#f0fdfa',
        border: '#99f6e4',
        gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        cardClass: '',
        genre: 'GLOBAL EXPLORATION',
    },
    'history': {
        icon: Compass,
        color: '#9333ea',
        bg: '#faf5ff',
        border: '#e9d5ff',
        gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
        cardClass: '',
        genre: 'CHRONICLES & CIVILIZATION',
    },
    'language': {
        icon: Languages,
        color: '#e11d48',
        bg: '#fff1f2',
        border: '#fecdd3',
        gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
        cardClass: '',
        genre: 'LINGUISTIC LITERACY',
    },
    'english': {
        icon: BookOpen,
        color: '#c026d3',
        bg: '#fdf4ff',
        border: '#f5d0fe',
        gradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)',
        cardClass: '',
        genre: 'LITERATURE & RHETORIC',
    },
    'commerce': {
        icon: TrendingUp,
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        cardClass: 'math-geometric-card',
        genre: 'FINANCIAL DYNAMICS',
    },
    'computer': {
        icon: Cpu,
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        cardClass: 'science-futuristic-card',
        genre: 'COMPUTATION & CODE',
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
        cardClass: '',
        genre: 'ACADEMIC SYLLABUS',
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
                    // Fallback to single course detail endpoint
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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Head>
                <title>{courseName} Subjects | Produit Academy</title>
                <meta name="description" content={`Explore expert tutors and comprehensive syllabi for ${courseName}.`} />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '108px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>
                    
                    {/* Minimal Breadcrumb Trail */}
                    <nav style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.85rem', color: '#64748b', marginBottom: '24px'
                    }}>
                        <Link href="/courses" style={{
                            color: 'var(--accent-green-dark)', fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                            <ArrowLeft size={15} /> All Classes
                        </Link>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <span style={{ color: '#0f172a', fontWeight: 800 }}>{courseName}</span>
                    </nav>

                    {/* Class Curriculum Banner */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0px',
                        padding: '32px',
                        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                        marginBottom: '32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}>
                        <div style={{ maxWidth: '640px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span className="telemetry-chip live">
                                    <span className="live-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '0px' }} />
                                    <span>CURRICULUM ARCHITECTURE // {courseName.toUpperCase()}</span>
                                </span>
                            </div>

                            <h1 style={{
                                fontFamily: "'Lora', serif",
                                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                                fontWeight: 700,
                                color: '#0f172a',
                                lineHeight: 1.25,
                                marginBottom: '8px'
                            }}>
                                {courseName} Subjects
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '1.02rem', lineHeight: 1.6, margin: 0 }}>
                                Select a discipline to connect with faculty specialists, inspect lesson schedules, and book 1-on-1 sessions.
                            </p>
                        </div>

                        {/* Search subject if multiple */}
                        {subjects.length > 4 && (
                            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                                <input
                                    type="text"
                                    placeholder="Filter discipline..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px 10px 38px',
                                        fontSize: '0.9rem',
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

                    {/* Subjects Grid with Custom Subject Personalities */}
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
                            textAlign: 'center'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                No subjects registered yet
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                                Disciplines for {courseName} are being compiled. Please return shortly.
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
                                        className={`pro-card-hover ${theme.cardClass}`}
                                        style={{
                                            borderRadius: '0px',
                                            border: '1px solid #e2e8f0',
                                            padding: '26px 22px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Genre Tag + Teacher Count */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        }}>
                                            <span style={{
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.06em',
                                                fontFamily: 'ui-monospace, monospace',
                                                color: theme.color
                                            }}>
                                                {`// ${theme.genre}`}
                                            </span>

                                            <div style={{
                                                padding: '3px 8px',
                                                borderRadius: '0px',
                                                fontSize: '0.74rem',
                                                fontWeight: 700,
                                                background: teacherCount > 0 ? '#ecfdf5' : '#f8fafc',
                                                color: teacherCount > 0 ? '#047857' : '#64748b',
                                                border: `1px solid ${teacherCount > 0 ? '#a7f3d0' : '#e2e8f0'}`,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {teacherCount > 0 && <span className="live-pulse-dot" style={{ width: '5px', height: '5px', borderRadius: '0px' }} />}
                                                <span>{teacherCount} {teacherCount === 1 ? 'Faculty' : 'Faculty'}</span>
                                            </div>
                                        </div>

                                        {/* Square Icon Capsule */}
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '0px',
                                            background: theme.bg,
                                            border: `1px solid ${theme.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: theme.color,
                                            marginBottom: '16px',
                                            boxShadow: `0 4px 10px -2px ${theme.color}25`
                                        }}>
                                            <IconComp size={26} strokeWidth={1.8} />
                                        </div>

                                        {/* Subject Title */}
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 800,
                                            color: '#0f172a',
                                            marginBottom: '6px',
                                            lineHeight: 1.3
                                        }}>
                                            {subject.name}
                                        </h3>

                                        <p style={{
                                            fontSize: '0.88rem',
                                            color: '#64748b',
                                            marginBottom: '20px',
                                            lineHeight: 1.5,
                                            flex: 1
                                        }}>
                                            {subject.description || `Structured curriculum mastery, targeted problem solving, and personalized doubt sessions in ${subject.name}.`}
                                        </p>

                                        {/* Highlights Row */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            fontSize: '0.78rem',
                                            color: '#475569',
                                            fontWeight: 600,
                                            marginBottom: '18px',
                                            paddingTop: '14px',
                                            borderTop: '1px dashed #e2e8f0'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle2 size={13} color="#059669" />
                                                <span>1-on-1 Sessions</span>
                                            </div>
                                            <span>&middot;</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Video size={13} color="#2563eb" />
                                                <span>Demo Lectures</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 14px',
                                            borderRadius: '0px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: 'var(--accent-green-dark)',
                                        }}>
                                            <span>Browse Faculty</span>
                                            <ChevronRight size={16} />
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
