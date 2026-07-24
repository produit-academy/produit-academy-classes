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
            setError('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Head>
                <title>Register | Produit Classes</title>
            </Head>

            <Header />

            <main className={`main-content ${styles.authPage}`}>
                <div className={styles.authContainer}>
                    <h1 className={styles.authTitle}>Get Started</h1>
                    <p className={styles.authSubtitle}>Create your student account in seconds.</p>

                    {error && <p className={styles.authError}>{error}</p>}

                    <form className={styles.authForm} onSubmit={handleRegister}>
                        <input
                            type="text" placeholder="Full Name" required
                            value={fullName} onChange={(e) => setFullName(e.target.value)}
                        />
                        <input
                            type="tel" placeholder="Phone Number" required
                            value={phone} onChange={(e) => setPhone(e.target.value)}
                        />
                        <input
                            type="email" placeholder="Email Address" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />

                        <button type="submit" className={`glass-btn primary ${styles.ctaBtn}`} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register & Verify Email'}
                        </button>
                    </form>

                    <p className={styles.authSwitch}>
                        Already have an account? <Link href="/login">Sign in</Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
