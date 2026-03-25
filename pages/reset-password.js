import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import styles from '../styles/Auth.module.css';

export default function ResetPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (router.query.email) {
            setEmail(router.query.email);
        }
    }, [router.query.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/password-reset-confirm/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.detail || 'Failed to reset password.');
            }
        } catch (err) { setError('An error occurred.'); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head><title>Reset Password - Produit Classes</title></Head>
            <Header />
            <main className={`main-content ${styles.authPage}`}>
                <div className={styles.authContainer}>
                    <h1 className={styles.authTitle}>Reset Your Password</h1>
                    <p className={styles.authSubtitle}>An OTP has been sent to {email}. Enter it below with your new password.</p>
                    <form className={styles.authForm} onSubmit={handleSubmit}>
                        <input type="text" placeholder="Enter OTP" maxLength="6" required value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <input type="password" placeholder="Enter New Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit" className="glass-btn primary">Reset Password</button>
                        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
                        {error && <p className={styles.authError}>{error}</p>}
                    </form>
                </div>
            </main>
        </div>
    );
}
