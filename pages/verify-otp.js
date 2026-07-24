// pages/verify-otp.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../styles/Auth.module.css';

export default function VerifyOTP() {
    const router = useRouter();
    const { email, mode } = router.query; // mode: 'register' or 'login'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < text.length; i++) {
            newOtp[i] = text[i];
        }
        setOtp(newOtp);
        const focusIndex = Math.min(text.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }

        setLoading(true);
        setError('');

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${API_URL}/api/student/verify-otp-login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
                if (data.user) localStorage.setItem('user_data', JSON.stringify(data.user));
                window.location.href = '/student/dashboard';
            } else {
                setError(data.error || 'Verification failed.');
            }
        } catch (err) {
            setError('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        try {
            await fetch(`${API_URL}/api/student/otp-login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            setResendCooldown(60);
            setError('');
        } catch (err) {
            setError('Failed to resend OTP.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head>
                <title>Verify OTP | Produit Classes</title>
            </Head>

            <Header />

            <main className={`main-content ${styles.authPage}`}>
                <div className={styles.authContainer}>
                    <h1 className={styles.authTitle} style={{ fontSize: '2rem' }}>Verify Your Email</h1>
                    <p className={styles.authSubtitle} style={{ fontSize: '0.95rem' }}>
                        We&apos;ve sent a 6-digit code to <strong>{email}</strong>
                    </p>

                    {error && <p className={styles.authError}>{error}</p>}

                    <form onSubmit={handleVerify}>
                        <div style={{
                            display: 'flex', gap: '10px', justifyContent: 'center',
                            marginBottom: '2rem'
                        }}>
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (inputRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    onPaste={idx === 0 ? handlePaste : undefined}
                                    className={styles.otpInput}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className={`glass-btn primary ${styles.ctaBtn}`}
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {resendCooldown > 0 ? (
                            <p>Resend OTP in <strong>{resendCooldown}s</strong></p>
                        ) : (
                            <button
                                onClick={handleResend}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem',
                                }}
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
