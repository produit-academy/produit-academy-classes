import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background-light)' }}>
            <Head>
                <title>Privacy Policy - Produit Classes</title>
                <meta name="description" content="Privacy Policy of Produit Classes." />
            </Head>
            <Header />
            <main style={{ flex: 1, paddingTop: '100px' }}>
                <div className="container">
                    <section style={{ padding: '60px 0', minHeight: '60vh' }}>
                        <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', color: 'var(--accent-green)' }}>Privacy Policy</h1>
                        <div className="glass-card" style={{ padding: '40px', background: 'var(--background-white)', textAlign: 'left' }}>
                            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Last updated: March 2026</p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>1. Introduction</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'justify' }}>
                                Produit Academy respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                            </p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>2. Data We Collect</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'justify' }}>
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows: Identity Data, Contact Data, Technical Data, and Usage Data including automatic attendance tracking.
                            </p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>3. How We Use Your Data</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'justify' }}>
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                                <li>To register you as a new student.</li>
                                <li>To manage your enrollment in active courses and track attendance.</li>
                                <li>To provide mentor oversight capabilities on your academic progress.</li>
                            </ul>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>4. Data Security</h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'justify' }}>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                            </p>

                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>5. Contact Us</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'justify' }}>
                                If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:produitacademy@gmail.com" style={{ color: 'var(--accent-blue)' }}>produitacademy@gmail.com</a>
                            </p>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
