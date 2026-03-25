import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsAndConditions() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background-light)' }}>
            <Head>
                <title>Terms & Conditions - Produit Classes</title>
                <meta name="description" content="Terms and Conditions for using Produit Classes." />
            </Head>
            <Header />
            <main style={{ flex: 1, paddingTop: '100px' }}>
                <div className="container">
                    <section style={{ padding: '60px 0', minHeight: '60vh' }}>
                        <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', color: 'var(--accent-green)' }}>Terms & Conditions</h1>
                        <div className="glass-card" style={{ padding: '40px', background: 'var(--background-white)', textAlign: 'left' }}>
                            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Last updated: Jan 2024</p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>1. Agreement to Terms</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                By accessing or using our platform, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of the terms, then you may not access the live learning service.
                            </p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>2. Intellectual Property</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                The Service and its original content, live streaming technology, features, and functionality are and will remain the exclusive property of Produit Academy and its licensors.
                            </p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>3. Student Accounts</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                When you access your enrolled dashboard, you must maintain the confidentiality of your credentials. Sharing login information constitutes a breach of terms which may result in immediate expulsion from active courses.
                            </p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>4. Termination</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms or violate code-of-conduct policies during live sessions.
                            </p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>5. Changes</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
