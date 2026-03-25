import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HelpCenter() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background-light)' }}>
            <Head>
                <title>Help Center - Produit Classes</title>
                <meta name="description" content="Get help and support for Produit Classes." />
            </Head>
            <Header />
            <main style={{ flex: 1, paddingTop: '100px' }}>
                <div className="container">
                    <section style={{ padding: '60px 0', minHeight: '60vh' }}>
                        <h1 style={{ marginBottom: '20px', fontSize: '2.5rem', color: 'var(--accent-green)' }}>Help Center</h1>
                        <p style={{ marginBottom: '30px', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                            Welcome to the Produit Classes Help Center. How can we assist you today?
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Account & Login</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Issues with signing up, logging in, or resetting your password.</p>
                            </div>
                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Live Classes</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Questions about joining live sessions, attendance tracking, and schedules.</p>
                            </div>
                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Technical Support</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Report bugs, performance issues, or feature requests.</p>
                            </div>
                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Contact Support</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Still need help? Reach out to us at <a href="mailto:produitacademy@gmail.com" style={{ color: 'var(--accent-blue)' }}>produitacademy@gmail.com</a></p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
