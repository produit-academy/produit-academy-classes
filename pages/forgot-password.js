import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Auth.module.css';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/password-reset-otp/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                router.push(`/reset-password?email=${email}`);
            } else {
                setError('No account found with that email address.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head><title>Forgot Password - Produit Classes</title></Head>
            <Header />
            <main className={`main-content ${styles.authPage}`}>
                <div className={styles.authContainer}>
                    <h1 className={styles.authTitle}>Forgot Password</h1>
                    <p className={styles.authSubtitle}>Enter your email to receive a password reset OTP.</p>
                    <form className={styles.authForm} onSubmit={handleSubmit}>
                        <input type="email" placeholder="Your Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button type="submit" className={`glass-btn primary ${styles.ctaBtn}`}>Send Reset OTP</button>
                        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
                        {error && <p className={styles.authError}>{error}</p>}
                    </form>
                    <p className={styles.authSwitch}>
                        Remember your password? <Link href="/login">Login</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
