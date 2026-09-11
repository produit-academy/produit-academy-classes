// pages/login.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { decodeToken } from '../lib/auth';
import styles from '../styles/Auth.module.css';

export default function Login() {
    const [mode, setMode] = useState('otp'); // 'otp' for students, 'password' for teachers/admin
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

                const user = decodeToken(data.access);
                if (user.platform !== 'classes' && user.role !== 'admin') {
                    setError("Access denied. This portal is exclusively for Produit Classes.");
                    localStorage.removeItem('access_token');
                    setLoading(false);
                    return;
                }

                switch (user?.role) {
                    case 'admin':
                        window.location.href = '/admin/dashboard';
                        break;
                    case 'teacher':
                        window.location.href = '/teacher/dashboard';
                        break;
                    default:
                        window.location.href = '/student/dashboard';
                        break;
                }
            } else {
                setError(data.detail || data.error || 'Invalid credentials. Please verify your email and password.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to connect to authentication server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/api/student/otp-login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}&mode=login`);
            } else {
                setError(data.error || 'Unable to send OTP. Please ensure this email is registered.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to connect to authentication server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head>
                <title>Sign In | Produit Classes</title>
                <meta name="description" content="Sign in to your Produit Classes account for live 1-on-1 tutoring, scheduled classes, and course materials." />
            </Head>

            <Header />

            <main className={styles.proAuthWrapper}>
                <div className={styles.proAuthCard}>

                    {/* Left Showcase Panel */}
                    <div className={styles.proShowcasePanel}>
                        <div>

                            <h2 className={styles.showcaseTitle}>
                                Personalized Learning, Built for Real Success.
                            </h2>
                            <p className={styles.showcaseDesc}>
                                Join interactive live classrooms, learn from verified expert mentors, and accelerate your academic journey.
                            </p>

                            <div className={styles.showcaseFeatures}>
                                <div className={styles.showcaseFeatureItem}>
                                    <div className={styles.featureIconBox}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                                        </svg>
                                    </div>
                                    <div className={styles.featureText}>
                                        <h4>Verified Expert Faculty</h4>
                                        <p>Dedicated teachers matched to your exact curriculum and syllabus.</p>
                                    </div>
                                </div>

                                <div className={styles.showcaseFeatureItem}>
                                    <div className={styles.featureIconBox}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                        </svg>
                                    </div>
                                    <div className={styles.featureText}>
                                        <h4>Live Google Meet Sessions</h4>
                                        <p>Seamless 1-click classroom links and timely schedule notifications.</p>
                                    </div>
                                </div>

                                <div className={styles.showcaseFeatureItem}>
                                    <div className={styles.featureIconBox}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="20" x2="18" y2="10"></line>
                                            <line x1="12" y1="20" x2="12" y2="4"></line>
                                            <line x1="6" y1="20" x2="6" y2="14"></line>
                                        </svg>
                                    </div>
                                    <div className={styles.featureText}>
                                        <h4>Continuous Progress Tracking</h4>
                                        <p>Real-time attendance logs, subject breakdown, and learning feedback.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.showcaseFooter}>
                            <div className={styles.ratingBadge}>
                                <span>★ 4.9/5</span> Student Rating
                            </div>
                        </div>
                    </div>

                    {/* Right Form Panel */}
                    <div className={styles.proFormPanel}>
                        <div className={styles.formHeader}>
                            <h1 className={styles.formTitle}>Welcome Back</h1>
                            <p className={styles.formSubtitle}>Sign in to access your dashboard and scheduled sessions.</p>
                        </div>

                        {/* Mode Segmented Selector */}
                        <div className={styles.roleTabs}>
                            <button
                                type="button"
                                onClick={() => { setMode('otp'); setError(''); setSuccess(''); }}
                                className={`${styles.roleTab} ${mode === 'otp' ? styles.roleTabActive : ''}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Student (OTP)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('password'); setError(''); setSuccess(''); }}
                                className={`${styles.roleTab} ${mode === 'password' ? styles.roleTabActive : ''}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Teacher / Staff
                            </button>
                        </div>

                        {/* Error Alert */}
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

                        {/* Success Alert */}
                        {success && (
                            <div className={`${styles.authAlert} ${styles.authAlertSuccess}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Student OTP Login */}
                        {mode === 'otp' ? (
                            <form className={styles.proForm} onSubmit={handleOTPLogin}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        Registered Email
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
                                        A secure 6-digit verification code will be dispatched to this email.
                                    </span>
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className={styles.buttonSpinner}></div>
                                            <span>Sending Secure Code...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Login Code</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* Teacher / Staff Password Login */
                            <form className={styles.proForm} onSubmit={handlePasswordLogin}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        Staff Email Address
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
                                            placeholder="faculty@produitacademy.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={styles.inputLabel}>
                                        <span>Password</span>
                                        <Link href="/forgot-password" className={styles.forgotLink}>
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <span className={styles.inputIcon}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className={styles.inputField}
                                            placeholder="Enter your password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="current-password"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeToggleBtn}
                                            onClick={() => setShowPassword(!showPassword)}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className={styles.buttonSpinner}></div>
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to Portal</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className={styles.authFooterBox}>
                            <p className={styles.registerText}>
                                {mode === 'otp' ? (
                                    <>
                                        New student?{' '}
                                        <Link href="/register" className={styles.registerLink}>
                                            Create an account
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        Need credentials or assistance?{' '}
                                        <Link href="/help-center" className={styles.registerLink}>
                                            Contact Administrator
                                        </Link>
                                    </>
                                )}
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
