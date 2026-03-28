// pages/login.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import styles from '../styles/Auth.module.css';

// Helper function to decode the JWT token without needing an external library
const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // NOTE: Update this URL to your production Django backend when deploying
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${API_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // 1. Save the token
                localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

                // 2. Decode the token to find out who this user is
                const user = decodeToken(data.access);

                // 3. Security Check - Ensure they belong to the 'classes' platform
                if (user.platform !== 'classes' && user.role !== 'admin') {
                    setError("Access denied. Please use the correct portal.");
                    localStorage.removeItem('access_token');
                    setLoading(false);
                    return;
                }

                // 4. Route them to their specific dashboard with a full reload to reset auth state
                switch (user?.role) {
                    case 'admin':
                        window.location.href = '/admin/dashboard';
                        break;
                    case 'mentor':
                        window.location.href = '/mentor/dashboard';
                        break;
                    case 'teacher':
                        window.location.href = '/teacher/dashboard';
                        break;
                    default: // 'student' or undefined falls back to student dashboard
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

                    {error && <p className={styles.authError}>{error}</p>}

                    <form className={styles.authForm} onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
                            <Link href="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className={`glass-btn primary ${styles.ctaBtn}`}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}