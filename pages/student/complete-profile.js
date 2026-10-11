// pages/student/complete-profile.js - Onboarding page for newly registered students
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GraduationCap, Building2, MapPin, ArrowRight, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

export default function CompleteProfile() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [address, setAddress] = useState('');
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch active classes/courses
        apiGet('/api/classes/courses/?page_size=200')
            .then(data => {
                const list = Array.isArray(data) ? data : (data.results || []);
                setCourses(list);
                if (list.length > 0) {
                    setSelectedCourseId(list[0].id.toString());
                }
            })
            .catch(err => {
                console.error('Failed to load classes', err);
            })
            .finally(() => setLoadingCourses(false));

        // Pre-fill if user already has data
        if (user) {
            if (user.school_name) setSchoolName(user.school_name);
            if (user.address) setAddress(user.address);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!schoolName.trim()) {
            setError('Please enter your School or Institution name.');
            return;
        }

        if (!selectedCourseId) {
            setError('Please select your preferred class or curriculum.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiPost('/api/classes/student/change-class/', {
                course_id: parseInt(selectedCourseId, 10),
                school_name: schoolName.trim(),
                address: address.trim()
            });

            const data = await res.json();
            if (res.ok) {
                // Update local storage user data
                const storedUser = localStorage.getItem('user_data');
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        parsed.school_name = schoolName.trim();
                        parsed.current_class = data.current_class || (courses.find(c => c.id.toString() === selectedCourseId.toString())?.name);
                        parsed.address = address.trim();
                        localStorage.setItem('user_data', JSON.stringify(parsed));
                        if (setUser) setUser(parsed);
                    } catch (e) {
                        console.error(e);
                    }
                }
                router.push('/student/dashboard');
            } else {
                setError(data.error || 'Failed to update academic profile. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please verify your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <Head>
                <title>Complete Your Profile | Produit Academy</title>
                <meta name="description" content="Select your school and preferred academic class to personalize your learning experience." />
            </Head>

            <Header />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
                <div style={{
                    maxWidth: '560px',
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
                    position: 'relative'
                }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                        <Sparkles size={14} />
                        <span>Step 2 &bull; Academic Details</span>
                    </div>

                    <h1 style={{  fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                        Complete Your Profile
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 28px' }}>
                        Welcome to Produit Academy! Tell us about your school and preferred class to personalize your dashboard and mentorship schedule.
                    </p>

                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            color: '#991b1b',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* School Name */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                School / Institution Name <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }}>
                                    <Building2 size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    placeholder="e.g. Kendriya Vidyalaya, Delhi Public School..."
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 42px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        color: '#0f172a',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Preferred Class / Grade */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Preferred Class / Curriculum <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }}>
                                    <GraduationCap size={18} />
                                </div>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    disabled={loadingCourses}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 42px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        color: '#0f172a',
                                        outline: 'none',
                                        background: '#ffffff',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {loadingCourses ? (
                                        <option value="">Loading available classes...</option>
                                    ) : (
                                        courses.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.category ? `(${c.category})` : ''}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                You can switch your class at any time later directly from your dashboard.
                            </span>
                        </div>

                        {/* City / Address */}
                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                City / Address (Optional)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }}>
                                    <MapPin size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="e.g. Kochi, Kerala or Bangalore"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 42px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        color: '#0f172a',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.15s ease'
                            }}
                        >
                            <span>{submitting ? 'Setting Up Dashboard...' : 'Continue to Dashboard'}</span>
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button
                            onClick={() => router.push('/student/dashboard')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '0.82rem',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}
                        >
                            Skip for now, I'll complete this later
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
