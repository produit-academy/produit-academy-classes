// pages/courses/index.js - Professional Education Platform Design
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { apiGet } from '../../lib/api';
import {
    GraduationCap, Search, BookOpen,
    Users, ChevronRight, X, ArrowRight,
    CheckCircle2, Sparkles, Award, ShieldCheck,
    Compass, Video
} from 'lucide-react';

const BOARD_CONFIG = {
    'CBSE': {
        name: 'CBSE',
        label: 'Central Board (CBSE)',
        badgeBg: '#eff6ff',
        badgeColor: '#1d4ed8',
        badgeBorder: '#bfdbfe',
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        accentColor: '#2563eb',
        tag: 'CBSE National'
    },
    'ICSE': {
        name: 'ICSE',
        label: 'ICSE Board',
        badgeBg: '#f5f3ff',
        badgeColor: '#6d28d9',
        badgeBorder: '#ddd6fe',
        gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
        accentColor: '#7c3aed',
        tag: 'ICSE Council'
    },
    'State': {
        name: 'State',
        label: 'State Board',
        badgeBg: '#ecfdf5',
        badgeColor: '#047857',
        badgeBorder: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
        accentColor: '#059669',
        tag: 'State Board'
    }
};

function getBoardMeta(name = '') {
    if (name.includes('CBSE')) return BOARD_CONFIG.CBSE;
    if (name.includes('ICSE')) return BOARD_CONFIG.ICSE;
    if (name.includes('State')) return BOARD_CONFIG.State;
    return {
        name: 'General',
        label: 'Academic Board',
        badgeBg: '#f1f5f9',
        badgeColor: '#334155',
        badgeBorder: '#cbd5e1',
        gradient: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
        accentColor: '#475569',
        tag: 'Accredited Curriculum'
    };
}

function extractGradeNumber(name = '') {
    const match = name.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 99;
}

function getGradeStage(gradeNum) {
    if (gradeNum >= 6 && gradeNum <= 8) {
        return { label: 'Middle School', subtext: 'Foundational Syllabus & Core Concepts' };
    }
    if (gradeNum >= 9 && gradeNum <= 10) {
        return { label: 'Secondary School', subtext: 'Board Examination & Rigorous Practice' };
    }
    if (gradeNum >= 11 && gradeNum <= 12) {
        return { label: 'Senior Secondary', subtext: 'Higher Secondary Specialized Streams' };
    }
    return { label: 'Academic Program', subtext: 'Comprehensive Subject Curriculum' };
}

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBoard, setSelectedBoard] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const router = useRouter();

    useEffect(() => {
        apiGet('/api/classes/courses/?page_size=200')
            .then((data) => {
                const list = data?.results || (Array.isArray(data) ? data : []);
                const sorted = [...list].sort((a, b) => {
                    const gradeA = extractGradeNumber(a.name);
                    const gradeB = extractGradeNumber(b.name);
                    if (gradeA !== gradeB) return gradeA - gradeB;
                    return a.name.localeCompare(b.name);
                });
                setCourses(sorted);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const nameLower = course.name.toLowerCase();
            const queryLower = searchQuery.toLowerCase().trim();

            if (queryLower && !nameLower.includes(queryLower)) {
                return false;
            }

            if (selectedBoard !== 'ALL') {
                if (!course.name.includes(selectedBoard)) return false;
            }

            const grade = extractGradeNumber(course.name);
            if (selectedCategory === 'MIDDLE') {
                if (grade < 6 || grade > 8) return false;
            } else if (selectedCategory === 'SECONDARY') {
                if (grade < 9 || grade > 10) return false;
            } else if (selectedCategory === 'SENIOR') {
                if (grade < 11 || grade > 12) return false;
            }

            return true;
        });
    }, [courses, searchQuery, selectedBoard, selectedCategory]);

    const boardCounts = useMemo(() => {
        const counts = { ALL: courses.length, CBSE: 0, ICSE: 0, State: 0 };
        courses.forEach((c) => {
            if (c.name.includes('CBSE')) counts.CBSE++;
            else if (c.name.includes('ICSE')) counts.ICSE++;
            else if (c.name.includes('State')) counts.State++;
        });
        return counts;
    }, [courses]);

    const stageCounts = useMemo(() => {
        const counts = { ALL: courses.length, MIDDLE: 0, SECONDARY: 0, SENIOR: 0 };
        courses.forEach((c) => {
            const g = extractGradeNumber(c.name);
            if (g >= 6 && g <= 8) counts.MIDDLE++;
            else if (g >= 9 && g <= 10) counts.SECONDARY++;
            else if (g >= 11 && g <= 12) counts.SENIOR++;
        });
        return counts;
    }, [courses]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <Head>
                <title>Classes & Academic Curriculum | Produit Academy</title>
                <meta
                    name="description"
                    content="Explore accredited Classes 6 to 12 across CBSE, ICSE, and State Boards. Structured syllabi, verified educators, and 1-on-1 live mentoring."
                />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '86px', paddingBottom: '60px' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    
                    {/* Clean Minimal Academic Header */}
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '700px',
                        margin: '0 auto 24px',
                        padding: '0 16px'
                    }}>
                        <h1 style={{
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
                            fontWeight: 800,
                            color: '#0f172a',
                            lineHeight: 1.2,
                            marginBottom: '8px',
                            letterSpacing: '-0.02em'
                        }}>
                            Select Your Class
                        </h1>
                        <p style={{
                            color: '#64748b',
                            fontSize: '0.96rem',
                            lineHeight: 1.5,
                            margin: 0
                        }}>
                            Grades 6 through 12 across CBSE, ICSE, and State Boards.
                        </p>
                    </div>

                    {/* Filter & Search Console */}
                    <div className="courses-filter-console" style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                        marginBottom: '28px',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    }}>
                        {/* Search Input Row */}
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search
                                size={19}
                                color="#94a3b8"
                                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by grade, stream, or board (e.g. 10th CBSE, 11th Science, ICSE)..."
                                style={{
                                    width: '100%',
                                    padding: '13px 44px 13px 48px',
                                    fontSize: '0.96rem',
                                    borderRadius: '12px',
                                    border: '1px solid #cbd5e1',
                                    background: '#f8fafc',
                                    color: '#0f172a',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#059669';
                                    e.target.style.background = '#ffffff';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.12)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#cbd5e1';
                                    e.target.style.background = '#f8fafc';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        padding: '4px',
                                        display: 'flex'
                                    }}
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Clean Filter Chips Row */}
                        <div className="mobile-scroll-strip" style={{
                            alignItems: 'center',
                            gap: '8px',
                            paddingTop: '14px',
                            borderTop: '1px solid #f1f5f9'
                        }}>
                            {[
                                { id: 'ALL', label: 'All Boards', count: boardCounts.ALL },
                                { id: 'CBSE', label: 'CBSE', count: boardCounts.CBSE },
                                { id: 'ICSE', label: 'ICSE', count: boardCounts.ICSE },
                                { id: 'State', label: 'State Board', count: boardCounts.State },
                            ].map((tab) => {
                                const active = selectedBoard === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedBoard(tab.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '0.86rem',
                                            fontWeight: active ? 700 : 500,
                                            cursor: 'pointer',
                                            border: active ? '1.5px solid #059669' : '1px solid #cbd5e1',
                                            background: active ? '#ecfdf5' : '#ffffff',
                                            color: active ? '#047857' : '#475569',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <span>{tab.label}</span>
                                        <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>({tab.count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results Counter Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '22px',
                        padding: '0 4px'
                    }}>
                        <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0 }}>
                            Showing <strong style={{ color: '#0f172a', fontWeight: 700 }}>{filteredCourses.length}</strong> academic programs
                        </p>
                        {(searchQuery || selectedBoard !== 'ALL' || selectedCategory !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedBoard('ALL');
                                    setSelectedCategory('ALL');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#059669',
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                Reset all filters
                            </button>
                        )}
                    </div>

                    {/* Main Content Grid */}
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '340px' }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '64px 24px',
                            textAlign: 'center',
                            boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                color: '#94a3b8'
                            }}>
                                <Search size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                No classes match your criteria
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                                We couldn&apos;t find any classes matching your search or filters. Please reset your filters to explore available programs.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedBoard('ALL');
                                    setSelectedCategory('ALL');
                                }}
                                className="glass-btn primary"
                                style={{ padding: '11px 26px', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 700 }}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {filteredCourses.map((course) => {
                                const boardMeta = getBoardMeta(course.name);
                                const gradeNum = extractGradeNumber(course.name);
                                const stageInfo = getGradeStage(gradeNum);
                                const isSenior = gradeNum >= 11;
                                const isCommerce = course.name.toLowerCase().includes('commerce');
                                const isScience = course.name.toLowerCase().includes('science');

                                // Refined academic stream subtitle
                                let streamTitle = stageInfo.subtext;
                                if (isSenior) {
                                    if (isScience) streamTitle = 'Science Stream • Physics, Chemistry & Maths/Bio';
                                    else if (isCommerce) streamTitle = 'Commerce Stream • Accountancy, Economics & Maths';
                                    else streamTitle = 'Senior Secondary Specialized Stream';
                                }

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => router.push(`/courses/${course.id}`)}
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            padding: '24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 14px 28px -4px rgba(15, 23, 42, 0.08)';
                                            e.currentTarget.style.borderColor = boardMeta.accentColor;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.03)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        {/* Card Header: Grade Shield & Board Badge */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '18px'
                                        }}>
                                            {/* Grade Emblem */}
                                            <div style={{
                                                width: '58px',
                                                height: '58px',
                                                borderRadius: '14px',
                                                background: boardMeta.gradient,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                                boxShadow: `0 4px 14px -2px ${boardMeta.accentColor}40`,
                                                flexShrink: 0
                                            }}>
                                                <span style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1 }}>
                                                    {gradeNum !== 99 ? gradeNum : '•'}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.62rem',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.6px',
                                                    textTransform: 'uppercase',
                                                    opacity: 0.95,
                                                    marginTop: '2px'
                                                }}>
                                                    Grade
                                                </span>
                                            </div>

                                            {/* Board & Stage Pills */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    background: boardMeta.badgeBg,
                                                    color: boardMeta.badgeColor,
                                                    border: `1px solid ${boardMeta.badgeBorder}`,
                                                }}>
                                                    {boardMeta.tag}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.74rem',
                                                    color: '#64748b',
                                                    fontWeight: 600,
                                                }}>
                                                    {stageInfo.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Program Title */}
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            marginBottom: '6px',
                                            lineHeight: 1.35
                                        }}>
                                            {course.name}
                                        </h3>

                                        {/* Stream / Scope Description */}
                                        <p style={{
                                            fontSize: '0.88rem',
                                            color: '#64748b',
                                            marginBottom: '18px',
                                            lineHeight: 1.5,
                                            flex: 1
                                        }}>
                                            {streamTitle}
                                        </p>


                                        {/* Meta Stats Row */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingTop: '14px',
                                            borderTop: '1px solid #f1f5f9',
                                            marginBottom: '16px',
                                            fontSize: '0.85rem',
                                            color: '#475569',
                                            fontWeight: 600
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <BookOpen size={16} color="#059669" />
                                                <span>{course.subject_count || 4} Core Subjects</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Users size={16} color="#2563eb" />
                                                <span>Live 1-on-1</span>
                                            </div>
                                        </div>

                                        {/* Explore Button */}
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
                                            <span>Explore Curriculum & Teachers</span>
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
