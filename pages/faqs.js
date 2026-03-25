import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FAQs() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background-light)' }}>
            <Head>
                <title>FAQs - Produit Classes</title>
                <meta name="description" content="Frequently Asked Questions about Produit Classes." />
            </Head>
            <Header />
            <main style={{ flex: 1, paddingTop: '100px' }}>
                <div className="container">
                    <section style={{ padding: '60px 0', minHeight: '60vh' }}>
                        <h1 style={{ marginBottom: '40px', fontSize: '2.5rem', color: 'var(--accent-green)' }}>Frequently Asked Questions</h1>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>How do I join my live classes?</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>You can join live classes directly from your student dashboard by clicking the "Join Session" button next to any scheduled or active class.</p>
                            </div>

                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>How is attendance tracked?</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Attendance is automatically logged by teachers during live sessions. You can monitor your overall attendance percentage and history on your dashboard.</p>
                            </div>

                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>What if I miss a live class?</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>If you miss a live class, your attendance status will be marked as "Absent". Discuss with your mentor or teacher to catch up on the missed syllabus subject.</p>
                            </div>

                            <div className="glass-card" style={{ padding: '30px', background: 'var(--background-white)', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>How do I contact my mentor?</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Your assigned mentor monitors your progress automatically. For specific queries, reach out to them via the "Contact to Enroll" channels or via the internal dashboard messaging if enabled.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
