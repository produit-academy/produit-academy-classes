// pages/register.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import styles from '../styles/Auth.module.css';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!fullName.trim() || !phone.trim() || !email.trim()) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        try {
            const res = await fetch(`${API_URL}/api/student/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    phone_number: phone.trim(),
                    email: email.trim().toLowerCase(),
                })
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}&mode=register`);
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to connect to the server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head>
                <title>Create Student Account | Produit Classes</title>
                <meta name="description" content="Register as a student on Produit Classes for live 1-on-1 tutoring, personalized lesson plans, and top educators." />
            </Head>

            <Header />

            <main className={styles.proAuthWrapper}>
                <div className={styles.proAuthCard}>

                    {/* Left Showcase Panel */}
                    <div className={styles.proShowcasePanel}>
                        <div>

                            <h2 className={styles.showcaseTitle}>
                                Step into the Future of 1-on-1 Education.
                            </h2>
                            <p className={styles.showcaseDesc}>
                                Connect directly with hand-picked subject teachers, schedule flexible classes, and master your syllabus at your own pace.
                            </p>

                            <div className={styles.showcaseFeatures}>
                                <div className={styles.showcaseFeatureItem}>
                                    <div className={styles.featureIconBox}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 14 14"></polyline>
                                        </svg>
                                    </div>
                                    <div className={styles.featureText}>
                                        <h4>Flexible Schedules</h4>
                                        <p>Book classes at times that suit you best, with zero commuting.</p>
                                    </div>
                                </div>

                                <div className={styles.showcaseFeatureItem}>
                                    <div className={styles.featureIconBox}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    </div>
                                    <div className={styles.featureText}>
                                        <h4>Top 5% Verified Mentors</h4>
                                        <p>Every instructor is thoroughly vetted for pedagogy and expertise.</p>
                                    </div>
                                </div>

                                <div className={styles.showcaseFeatureItem}>
                                    <div className={styles.featureIconBox}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                    </div>
                                    <div className={styles.featureText}>
                                        <h4>Tailored Study Materials</h4>
                                        <p>Curated notes, practice sets, and mock tests included.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.showcaseFooter}>

                            <div className={styles.ratingBadge}>
                                <span>★ 4.9/5</span> Rating
                            </div>
                        </div>
                    </div>

                    {/* Right Form Panel */}
                    <div className={styles.proFormPanel}>
                        <div className={styles.formHeader}>
                            <h1 className={styles.formTitle}>Create Account</h1>
                            <p className={styles.formSubtitle}>Join Produit Classes as a student in under a minute.</p>
                        </div>

                        {error && (
                            <div className={`${styles.authAlert} ${styles.authAlertError}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form className={styles.proForm} onSubmit={handleRegister}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    Full Name
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="Enter your student name"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        autoComplete="name"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    Phone Number
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                    </span>
                                    <input
                                        type="tel"
                                        className={styles.inputField}
                                        placeholder="10-digit mobile number"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        autoComplete="tel"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    Email Address
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </span>
                                    <input
                                        type="email"
                                        className={styles.inputField}
                                        placeholder="you@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        disabled={loading}
                                    />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                    We will email you a 6-digit OTP code to verify your account.
                                </span>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className={styles.buttonSpinner}></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Register & Verify Email</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={styles.authFooterBox}>
                            <p className={styles.registerText}>
                                Already have an account?{' '}
                                <Link href="/login" className={styles.registerLink}>
                                    Sign in here
                                </Link>
                            </p>

                            <div className={styles.securityNote}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                                <span>256-Bit SSL Encrypted &bull; Official Produit Classes Portal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
