// pages/courses/[courseId]/[subjectId]/teachers.js - Professional Education Platform Faculty View
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import ProfileCard from '../../../../components/ProfileCard';
import { apiGet } from '../../../../lib/api';
import {
    ArrowLeft, Search, CheckCircle2,
    Users, X, GraduationCap, Video, Sparkles
} from 'lucide-react';

export default function TeachersPage() {
    const router = useRouter();
    const { courseId, subjectId } = router.query;
    const [teachers, setTeachers] = useState([]);
    const [subjectName, setSubjectName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(true);

    // Filters and search state
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [sortBy, setSortBy] = useState('recommended');

    useEffect(() => {
        if (!subjectId) return;
        apiGet(`/api/classes/teachers/?subject_id=${subjectId}`)
            .then(setTeachers)
            .catch(console.error)
            .finally(() => setLoading(false));

        if (courseId) {
            apiGet(`/api/classes/subjects/?course_id=${courseId}`)
                .then(subs => {
                    const list = Array.isArray(subs) ? subs : (subs?.results || []);
                    const s = list.find(s => String(s.id) === String(subjectId));
                    if (s) {
                        setSubjectName(s.name || 'Subject');
                        if (s.course_name) setCourseName(s.course_name);
                    }
                    if (!s || !s.course_name) {
                        apiGet(`/api/classes/courses/${courseId}/`)
                            .then(c => setCourseName(c?.name || 'Class'))
                            .catch(() => {});
                    }
                }).catch(() => {});
        }
    }, [subjectId, courseId]);

    // Filter and Sort logic
    const filteredTeachers = useMemo(() => {
        let result = teachers.filter((t) => {
            const matchesQuery = !searchQuery.trim() ||
                (t.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                (t.qualification || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                (t.bio || '').toLowerCase().includes(searchQuery.toLowerCase().trim());

            if (!matchesQuery) return false;

            if (onlyAvailable && t.availability_status !== 'Available') {
                return false;
            }

            return true;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'rate-low') {
                return (parseFloat(a.hourly_rate) || 0) - (parseFloat(b.hourly_rate) || 0);
            }
            if (sortBy === 'rate-high') {
                return (parseFloat(b.hourly_rate) || 0) - (parseFloat(a.hourly_rate) || 0);
            }
            if (sortBy === 'experience') {
                const getExpNum = (str) => parseInt((str || '').match(/\d+/)?.[0] || '0', 10);
                return getExpNum(b.experience) - getExpNum(a.experience);
            }
            if (a.availability_status === 'Available' && b.availability_status !== 'Available') return -1;
            if (b.availability_status === 'Available' && a.availability_status !== 'Available') return 1;
            return 0;
        });

        return result;
    }, [teachers, searchQuery, onlyAvailable, sortBy]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <Head>
                <title>{subjectName} Teachers ({courseName}) | Produit Academy</title>
                <meta name="description" content={`Connect with expert ${subjectName} educators for ${courseName}. Schedule 1-on-1 personalized sessions.`} />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '100px', paddingBottom: '90px' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    
                    {/* Breadcrumbs Navigation */}
                    <nav style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.88rem',
                        color: '#64748b',
                        marginBottom: '24px',
                        flexWrap: 'wrap'
                    }}>
                        <Link href="/courses" style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowLeft size={16} /> All Classes
                        </Link>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <Link href={`/courses/${courseId}`} style={{ color: '#059669', fontWeight: 600 }}>
                            {courseName || 'Class'}
                        </Link>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>
                            {subjectName || 'Subject'} Faculty
                        </span>
                    </nav>

                    {/* Hero Header Banner */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '36px 32px',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                        marginBottom: '32px',
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#047857',
                            padding: '5px 14px',
                            borderRadius: '9999px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                            marginBottom: '14px'
                        }}>
                            <GraduationCap size={15} />
                            <span>1-ON-1 FACULTY MENTORSHIP</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(1.9rem, 3.6vw, 2.6rem)',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.25,
                            marginBottom: '10px'
                        }}>
                            {subjectName} Teachers for {courseName}
                        </h1>
                        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '780px', margin: 0 }}>
                            Review verified teacher profiles, inspect qualifications, watch demo classes, and schedule personalized 1-on-1 interactive sessions.
                        </p>
                    </div>

                    {/* Filter & Search Bar */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '18px 24px',
                        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                        marginBottom: '28px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '440px' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search teacher by name or qualification..."
                                style={{
                                    width: '100%',
                                    padding: '11px 40px 11px 42px',
                                    fontSize: '0.92rem',
                                    borderRadius: '10px',
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
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        padding: '4px'
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggles & Sorter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            {/* Available Only Toggle */}
                            <button
                                onClick={() => setOnlyAvailable(!onlyAvailable)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '9px 16px',
                                    borderRadius: '10px',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: onlyAvailable ? '1.5px solid #059669' : '1px solid #cbd5e1',
                                    background: onlyAvailable ? '#ecfdf5' : '#ffffff',
                                    color: onlyAvailable ? '#047857' : '#475569',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: onlyAvailable ? '#16a34a' : '#cbd5e1'
                                }} />
                                <span>Available This Week</span>
                            </button>

                            {/* Sort Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        padding: '9px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        color: '#0f172a',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="recommended">Recommended</option>
                                    <option value="rate-low">Fee: Low to High</option>
                                    <option value="rate-high">Fee: High to Low</option>
                                    <option value="experience">Experience</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        padding: '0 4px'
                    }}>
                        <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                            Showing <strong style={{ color: '#0f172a' }}>{filteredTeachers.length}</strong> verified educators
                        </p>
                        {(searchQuery || onlyAvailable || sortBy !== 'recommended') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setOnlyAvailable(false);
                                    setSortBy('recommended');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#059669',
                                    fontSize: '0.86rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Reset filters
                            </button>
                        )}
                    </div>

                    {/* Teacher Cards Grid */}
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '320px' }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : filteredTeachers.length === 0 ? (
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '60px 24px',
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
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
                                <Users size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                No educators found
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                                {teachers.length === 0
                                    ? `Teachers for ${subjectName} are currently being onboarded. Please check back shortly.`
                                    : "No teachers match your search or filter criteria. Try resetting filters."}
                            </p>
                            {teachers.length > 0 && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setOnlyAvailable(false);
                                        setSortBy('recommended');
                                    }}
                                    className="glass-btn primary"
                                    style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 700 }}
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '24px',
                        }}>
                            {filteredTeachers.map((teacher) => (
                                <ProfileCard
                                    key={teacher.id}
                                    teacher={teacher}
                                    subjectId={subjectId}
                                    courseId={courseId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
