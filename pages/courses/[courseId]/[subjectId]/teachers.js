// pages/courses/[courseId]/[subjectId]/teachers.js - Teacher listing for a subject
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import ProfileCard from '../../../../components/ProfileCard';
import { apiGet } from '../../../../lib/api';

export default function TeachersPage() {
    const router = useRouter();
    const { courseId, subjectId } = router.query;
    const [teachers, setTeachers] = useState([]);
    const [subjectName, setSubjectName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subjectId) return;
        apiGet(`/api/classes/teachers/?subject_id=${subjectId}`)
            .then(setTeachers)
            .catch(console.error)
            .finally(() => setLoading(false));

        apiGet(`/api/classes/subjects/?course_id=${courseId}`)
            .then(subs => {
                const s = subs.find(s => String(s.id) === String(subjectId));
                setSubjectName(s?.name || 'Subject');
            }).catch(() => {});
    }, [subjectId, courseId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head><title>{subjectName} Teachers | Produit Classes</title></Head>
            <Header />

            <main className="main-content" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
                <div className="container">
                    <button
                        onClick={() => router.push(`/courses/${courseId}`)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.95rem',
                            marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                        ← Back to Subjects
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h1 style={{ fontFamily: "'Lora', serif", fontSize: '2.2rem', fontWeight: 700, marginBottom: '12px' }}>
                            {subjectName} Teachers
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                            Choose a teacher to view their profile, demo videos, and book a session.
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-container"><div className="loading-spinner" /></div>
                    ) : teachers.length === 0 ? (
                        <div className="glass-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <h3>No teachers available yet</h3>
                            <p>Teachers for this subject will be added soon.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '24px', maxWidth: '1000px', margin: '0 auto',
                        }}>
                            {teachers.map((teacher) => (
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
