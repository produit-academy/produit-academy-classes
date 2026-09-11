// pages/courses/[courseId]/[subjectId]/teachers.js - Teacher listing for a subject (Crisp Square Aesthetic)
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import ProfileCard from '../../../../components/ProfileCard';
import { apiGet } from '../../../../lib/api';
import {
    ArrowLeft, Search, Filter, Sparkles, CheckCircle2,
    Users, SlidersHorizontal, X
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
                    const s = subs.find(s => String(s.id) === String(subjectId));
                    setSubjectName(s?.name || 'Subject');
                }).catch(() => {});

            apiGet('/api/classes/courses/?page_size=200')
                .then(data => {
                    const list = data?.results || (Array.isArray(data) ? data : []);
                    const c = list.find(c => String(c.id) === String(courseId));
                    setCourseName(c?.name || 'Class');
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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Head>
                <title>{subjectName} Teachers ({courseName}) | Produit Academy Classes</title>
                <meta name="description" content={`Connect with expert ${subjectName} tutors for ${courseName}. Schedule 1-on-1 personalized sessions.`} />
            </Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '108px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px' }}>
                    
                    {/* Breadcrumbs Navigation */}
                    <nav style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.88rem', color: '#64748b', marginBottom: '28px',
                        flexWrap: 'wrap'
                    }}>
                        <Link href="/courses" style={{ color: 'var(--accent-green-dark)', fontWeight: 600 }}>
                            Classes
                        </Link>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <Link href={`/courses/${courseId}`} style={{ color: 'var(--accent-green-dark)', fontWeight: 600 }}>
                            {courseName || 'Class'}
                        </Link>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>
                            {subjectName || 'Subject'} Faculty
                        </span>
                    </nav>

                    {/* Hero Header */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0px',
                        padding: '36px 32px',
                        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                        marginBottom: '32px',
                    }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: '#eaf7f0', color: 'var(--accent-green-dark)',
                            padding: '5px 12px', borderRadius: '0px',
                            borderLeft: '3px solid var(--accent-green-dark)',
                            fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase',
                            letterSpacing: '0.5px', marginBottom: '12px'
                        }}>
                            <Sparkles size={14} />
                            <span>1-on-1 Faculty Mentorship</span>
                        </div>

                        <h1 style={{
                            fontFamily: "'Lora', serif",
                            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.25,
                            marginBottom: '10px'
                        }}>
                            {subjectName} Teachers for {courseName}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '780px', margin: 0 }}>
                            Choose an educator to review their qualifications, watch demo classes, check weekly availability, and book 1-on-1 sessions.
                        </p>
                    </div>

                    {/* Filter & Search Bar */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0px',
                        padding: '18px 24px',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                        marginBottom: '28px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '420px' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by teacher name or qualification..."
                                style={{
                                    width: '100%',
                                    padding: '11px 40px 11px 40px',
                                    fontSize: '0.92rem',
                                    borderRadius: '0px',
                                    border: '1px solid #cbd5e1',
                                    background: '#f8fafc',
                                    color: '#0f172a',
                                    outline: 'none',
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute', right: '12px', top: '12px',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
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
                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                                    padding: '9px 14px', borderRadius: '0px',
                                    fontSize: '0.88rem', fontWeight: 600,
                                    cursor: 'pointer',
                                    border: onlyAvailable ? '1px solid var(--accent-green-dark)' : '1px solid #cbd5e1',
                                    background: onlyAvailable ? 'var(--accent-green-light)' : '#ffffff',
                                    color: onlyAvailable ? 'var(--accent-green-dark)' : '#475569',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span className={onlyAvailable ? "live-pulse-dot" : ""} style={{
                                    width: '8px', height: '8px', borderRadius: '0px',
                                    background: onlyAvailable ? '#16a34a' : '#cbd5e1'
                                }} />
                                <span>Available This Week</span>
                            </button>

                            {/* Sort Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        padding: '9px 14px', borderRadius: '0px',
                                        border: '1px solid #cbd5e1', background: '#f8fafc',
                                        fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
                                        cursor: 'pointer', outline: 'none'
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
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '20px', padding: '0 4px'
                    }}>
                        <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                            Showing <strong style={{ color: '#0f172a' }}>{filteredTeachers.length}</strong> verified teachers
                        </p>
                        {(searchQuery || onlyAvailable || sortBy !== 'recommended') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setOnlyAvailable(false);
                                    setSortBy('recommended');
                                }}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--accent-green-dark)',
                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Reset filters
                            </button>
                        )}
                    </div>

                    {/* Teacher Cards Grid */}
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '300px' }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : filteredTeachers.length === 0 ? (
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
                                <Users size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                No teachers found
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 20px' }}>
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
                                    style={{ padding: '10px 24px', borderRadius: '0px', fontSize: '0.92rem' }}
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
