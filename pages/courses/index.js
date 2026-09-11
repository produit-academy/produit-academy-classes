// pages/courses/index.js - Select Your Class (Crisp Square Architectural Aesthetic)
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { apiGet } from '../../lib/api';
import {
    GraduationCap, Search, Sparkles, BookOpen,
    Users, ChevronRight, X, ArrowRight, Layers
} from 'lucide-react';

const BOARD_CONFIG = {
    'CBSE': {
        name: 'CBSE',
        label: 'Central Board (CBSE)',
        badgeBg: '#eff6ff',
        badgeColor: '#1d4ed8',
        badgeBorder: '#bfdbfe',
        gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        accentColor: '#2563eb'
    },
    'ICSE': {
        name: 'ICSE',
        label: 'ICSE Board',
        badgeBg: '#f5f3ff',
        badgeColor: '#6d28d9',
        badgeBorder: '#ddd6fe',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        accentColor: '#7c3aed'
    },
    'State': {
        name: 'State',
        label: 'State Board',
        badgeBg: '#ecfdf5',
        badgeColor: '#047857',
        badgeBorder: '#a7f3d0',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        accentColor: '#059669'
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
        gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
        accentColor: '#475569'
    };
}

function extractGradeNumber(name = '') {
    const match = name.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 99;
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Head>
                <title>Select Your Class | Produit Academy Classes</title>
                <meta name="description" content="Choose your academic class and board to connect with expert faculty and explore comprehensive syllabus modules." />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '108px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px' }}>
                    
                    {/* Hero Header */}
                    <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 40px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: '#e0f2fe', color: '#0369a1',
                            padding: '6px 14px', borderRadius: '0px',
                            borderLeft: '3px solid #0284c7',
                            fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.5px',
                            marginBottom: '16px'
                        }}>
                            <Sparkles size={15} />
                            <span>CURRICULUM ALIGNED • GRADES 6TH TO 12TH</span>
                        </div>

                        <h1 style={{
                            fontFamily: "'Lora', serif",
                            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.25,
                            marginBottom: '16px'
                        }}>
                            Select Your Class
                        </h1>
                        <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                            Choose your grade and education board to explore dedicated subject syllabi, view demo videos, and book live 1-on-1 sessions with expert teachers.
                        </p>
                    </div>

                    {/* Filter & Search Controls Bar */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0px',
                        padding: '20px 24px',
                        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                        marginBottom: '36px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                    }}>
                        {/* Search Input Row */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
                            <div style={{
                                position: 'relative', flex: 1, display: 'flex', alignItems: 'center'
                            }}>
                                <Search size={19} color="#94a3b8" style={{ position: 'absolute', left: '16px' }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by class, grade, or board (e.g., 10th CBSE, 11th Science)..."
                                    style={{
                                        width: '100%',
                                        padding: '13px 44px 13px 46px',
                                        fontSize: '0.98rem',
                                        borderRadius: '0px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-green)';
                                        e.target.style.background = '#ffffff';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(51, 174, 120, 0.2)';
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
                                            position: 'absolute', right: '14px', background: 'none', border: 'none',
                                            cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex'
                                        }}
                                        title="Clear search"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs Row */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            flexWrap: 'wrap', gap: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9'
                        }}>
                            {/* Board Filter Tabs */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginRight: '6px' }}>
                                    Board:
                                </span>
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
                                                padding: '8px 14px',
                                                borderRadius: '0px',
                                                fontSize: '0.88rem',
                                                fontWeight: active ? 700 : 500,
                                                cursor: 'pointer',
                                                border: active ? '1px solid var(--accent-green-dark)' : '1px solid #e2e8f0',
                                                background: active ? 'var(--accent-green-light)' : '#ffffff',
                                                color: active ? 'var(--accent-green-dark)' : '#475569',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <span>{tab.label}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 5px',
                                                borderRadius: '0px',
                                                background: active ? 'rgba(34, 139, 34, 0.18)' : '#f1f5f9',
                                                color: active ? 'var(--accent-green-dark)' : '#64748b',
                                                fontWeight: 700
                                            }}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Grade Category Pills */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginRight: '6px' }}>
                                    Level:
                                </span>
                                {[
                                    { id: 'ALL', label: 'All Classes' },
                                    { id: 'MIDDLE', label: 'Middle (6 - 8)' },
                                    { id: 'SECONDARY', label: 'Secondary (9 - 10)' },
                                    { id: 'SENIOR', label: 'Senior (11 - 12)' },
                                ].map((cat) => {
                                    const active = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            style={{
                                                padding: '7px 12px',
                                                borderRadius: '0px',
                                                fontSize: '0.82rem',
                                                fontWeight: active ? 700 : 500,
                                                cursor: 'pointer',
                                                border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                                                background: active ? '#0f172a' : '#ffffff',
                                                color: active ? '#ffffff' : '#64748b',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '20px', padding: '0 4px'
                    }}>
                        <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                            Showing <strong style={{ color: '#0f172a' }}>{filteredCourses.length}</strong> available classes
                        </p>
                        {(searchQuery || selectedBoard !== 'ALL' || selectedCategory !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedBoard('ALL');
                                    setSelectedCategory('ALL');
                                }}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--accent-green-dark)',
                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                Reset filters
                            </button>
                        )}
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '300px' }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0px',
                            padding: '60px 24px',
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
                        }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '0px',
                                background: '#f1f5f9', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8'
                            }}>
                                <Search size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                No matching classes found
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                                We couldn&apos;t find any classes matching &quot;{searchQuery}&quot;. Try adjusting your search query or filters.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedBoard('ALL');
                                    setSelectedCategory('ALL');
                                }}
                                className="glass-btn primary"
                                style={{ padding: '10px 24px', borderRadius: '0px', fontSize: '0.92rem' }}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '24px',
                        }}>
                            {filteredCourses.map((course) => {
                                const boardMeta = getBoardMeta(course.name);
                                const gradeNum = extractGradeNumber(course.name);
                                const isSenior = gradeNum >= 11;
                                const isCommerce = course.name.toLowerCase().includes('commerce');
                                const isScience = course.name.toLowerCase().includes('science');

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => router.push(`/courses/${course.id}`)}
                                        className="pro-card-hover"
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '0px',
                                            border: '1px solid #e2e8f0',
                                            padding: '24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                                        }}
                                    >
                                        {/* Card Top Row: Grade Square Emblem & Board Square Badge */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '20px'
                                        }}>
                                            {/* Grade Square Emblem */}
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '0px',
                                                background: boardMeta.gradient,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                                boxShadow: `0 4px 12px -2px ${boardMeta.accentColor}35`,
                                                position: 'relative'
                                            }}>
                                                <span style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1 }}>
                                                    {gradeNum !== 99 ? gradeNum : '•'}
                                                </span>
                                                <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9 }}>
                                                    Grade
                                                </span>
                                            </div>

                                            {/* Board Square Badge */}
                                            <div style={{
                                                padding: '5px 10px',
                                                borderRadius: '0px',
                                                fontSize: '0.78rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase',
                                                background: boardMeta.badgeBg,
                                                color: boardMeta.badgeColor,
                                                border: `1px solid ${boardMeta.badgeBorder}`,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <span>{boardMeta.name}</span>
                                            </div>
                                        </div>

                                        {/* Course Title & Stream */}
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 800,
                                            color: '#0f172a',
                                            marginBottom: '6px',
                                            lineHeight: 1.3
                                        }}>
                                            {course.name}
                                        </h3>

                                        {/* Secondary description/stream */}
                                        <p style={{
                                            fontSize: '0.88rem',
                                            color: '#64748b',
                                            marginBottom: '20px',
                                            lineHeight: 1.5
                                        }}>
                                            {isSenior ? (
                                                isScience ? 'Senior Secondary • Science Stream' :
                                                isCommerce ? 'Senior Secondary • Commerce Stream' :
                                                'Senior Secondary Stream'
                                            ) : (
                                                `Comprehensive Curriculum for Class ${gradeNum}`
                                            )}
                                        </p>

                                        {/* Stats Row */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            paddingTop: '16px',
                                            borderTop: '1px dashed #e2e8f0',
                                            marginTop: 'auto',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.85rem', color: '#475569', fontWeight: 600
                                            }}>
                                                <BookOpen size={16} color="#059669" />
                                                <span>{course.subject_count || 4} Subjects</span>
                                            </div>
                                            <span style={{ color: '#cbd5e1' }}>•</span>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.85rem', color: '#475569', fontWeight: 600
                                            }}>
                                                <Users size={16} color="#2563eb" />
                                                <span>Live 1-on-1</span>
                                            </div>
                                        </div>

                                        {/* Action Link Button */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '11px 14px',
                                            borderRadius: '0px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.88rem',
                                            fontWeight: 700,
                                            color: 'var(--accent-green-dark)',
                                            transition: 'all 0.2s ease',
                                        }}>
                                            <span>Explore Subjects</span>
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
