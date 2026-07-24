// pages/courses/index.js - Select Your Class (6th CBSE, 7th ICSE, etc.)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { apiGet } from '../../lib/api';
import { GraduationCap } from 'lucide-react';

// Board-specific accent colors
const BOARD_COLORS = {
    'CBSE': { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', text: '#fff' },
    'ICSE': { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', text: '#fff' },
    'State': { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#fff' },
};

function getBoardColor(name) {
    for (const [board, colors] of Object.entries(BOARD_COLORS)) {
        if (name.includes(board)) return colors;
    }
    return { bg: 'linear-gradient(135deg, #64748b, #475569)', text: '#fff' };
}

function getBoardLabel(name) {
    if (name.includes('CBSE')) return 'CBSE';
    if (name.includes('ICSE')) return 'ICSE';
    if (name.includes('State')) return 'State Board';
    return '';
}

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        apiGet('/api/classes/courses/?page_size=200')
            .then((data) => {
                const list = data?.results || (Array.isArray(data) ? data : []);
                setCourses(list);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head><title>Select Your Class | Produit Classes</title></Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <GraduationCap size={36} color="var(--accent-blue)" strokeWidth={1.5} />
                        </div>
                        <h1 style={{ fontFamily: "'Lora', serif", fontSize: '2.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                            Select Your Class
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Choose your class and board to explore subjects and find expert teachers.
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-container"><div className="loading-spinner" /></div>
                    ) : courses.length === 0 ? (
                        <div className="glass-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <h3>No classes available yet</h3>
                            <p>Check back soon!</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '24px',
                            maxWidth: '1000px',
                            margin: '0 auto',
                        }}>
                            {courses.map(course => {
                                const boardColors = getBoardColor(course.name);
                                const boardLabel = getBoardLabel(course.name);
                                const match = course.name.match(/^(\d+)/);
                                const gradeNumber = match ? match[1] : 'C';

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => router.push(`/courses/${course.id}`)}
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
                                            background: boardColors.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '20px',
                                            color: boardColors.text,
                                            fontWeight: 800, fontSize: '1.5rem',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                        }}>
                                            {gradeNumber}
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                                            {course.name}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                                            Class {gradeNumber} - {boardLabel} Board
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span>{course.subject_count || 4} Subjects</span>
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
