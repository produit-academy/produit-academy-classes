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
    const [mode, setMode] = useState('otp'); // 'password' or 'otp'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

                const user = decodeToken(data.access);
                if (user.platform !== 'classes' && user.role !== 'admin') {
                    setError("Access denied. Please use the correct portal.");
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
                setError(data.detail || 'Invalid email or password.');
            }
        } catch (err) {
            setError('Failed to connect to the server. Please try again.');
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
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`);
            } else {
                setError(data.error || 'Failed to send OTP.');
            }
        } catch (err) {
            setError('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head>
                <title>Login | Produit Classes</title>
            </Head>

            <Header />

            <main className={`main-content ${styles.authPage}`}>
                <div className={styles.authContainer}>
                    <h1 className={styles.authTitle}>Welcome Back</h1>
                    <p className={styles.authSubtitle}>Sign in to access your live classes.</p>

                    {/* Mode Tabs */}
                    <div style={{
                        display: 'flex', gap: '0', marginBottom: '2rem',
                        borderRadius: '12px', overflow: 'hidden',
                        border: '1px solid var(--card-border)'
                    }}>
                        <button
                            type="button"
                            onClick={() => { setMode('otp'); setError(''); }}
                            style={{
                                flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.3s ease',
                                background: mode === 'otp' ? 'var(--accent-blue)' : 'transparent',
                                color: mode === 'otp' ? '#fff' : 'var(--text-secondary)',
                            }}
                        >
                            Student (OTP)
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('password'); setError(''); }}
                            style={{
                                flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.3s ease',
                                background: mode === 'password' ? 'var(--accent-blue)' : 'transparent',
                                color: mode === 'password' ? '#fff' : 'var(--text-secondary)',
                            }}
                        >
                            Teacher / Admin
                        </button>
                    </div>

                    {error && <p className={styles.authError}>{error}</p>}
                    {success && <p style={{ color: '#16a34a', background: '#dcfce7', padding: '1rem', borderRadius: '5px', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}

                    {mode === 'password' ? (
                        <form className={styles.authForm} onSubmit={handlePasswordLogin}>
                            <input
                                type="email" placeholder="Email Address" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password" placeholder="Password" required
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
                                <Link href="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Forgot Password?
                                </Link>
                            </div>
                            <button type="submit" className={`glass-btn primary ${styles.ctaBtn}`} disabled={loading}>
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form className={styles.authForm} onSubmit={handleOTPLogin}>
                            <input
                                type="email" placeholder="Your registered email" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="submit" className={`glass-btn primary ${styles.ctaBtn}`} disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                            <p className={styles.authSwitch}>
                                Don&apos;t have an account? <Link href="/register">Register here</Link>
                            </p>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}