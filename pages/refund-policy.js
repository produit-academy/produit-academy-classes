import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RefundPolicy() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background-light)' }}>
            <Head>
                <title>Cancellation and Refund Policy - Produit Classes</title>
                <meta name="description" content="Cancellation and Refund Policy for course bookings and live sessions on Produit Academy Classes." />
            </Head>
            <Header />
            <main style={{ flex: 1, paddingTop: '100px' }}>
                <div className="container">
                    <section style={{ padding: '60px 0', minHeight: '60vh' }}>
                        <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', color: 'var(--accent-green)' }}>
                            Cancellation &amp; Refund Policy
                        </h1>
                        <div className="glass-card" style={{ padding: '40px', background: 'var(--background-white)', textAlign: 'left' }}>
                            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                                <strong>Effective Date:</strong> March 2026 &middot; <strong>Last Updated:</strong> March 2026
                            </p>

                            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)', lineHeight: '1.7', textAlign: 'justify' }}>
                                At <strong>Produit Academy</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), we strive to deliver world-class 1-on-1 and cohort-based academic instruction through our digital platform. We understand that academic schedules, personal emergencies, or educational priorities may change. This Cancellation and Refund Policy outlines your rights and our obligations concerning booking cancellations, session rescheduling, and monetary refunds.
                            </p>

                            <h3 style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                1. Course Booking Cancellation
                            </h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', textAlign: 'justify' }}>
                                Students and registered parents may cancel a confirmed course booking directly from their <strong>Student Dashboard &rarr; My Bookings</strong> page by clicking the &quot;Cancel &amp; Refund&quot; button before the commencement of scheduled class sessions.
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.7', paddingLeft: '20px', marginBottom: '15px' }}>
                                <li><strong>Full Cancellation Before First Session:</strong> If a booking is cancelled prior to the start of the first scheduled class session, a <strong>100% refund</strong> of the booking amount will be issued.</li>
                                <li><strong>Partial Course Cancellations:</strong> If a student has attended one or more classes and wishes to cancel the remainder of the booking due to an instructor mismatch or emergency, refund requests will be evaluated on a pro-rata basis for unattended sessions.</li>
                            </ul>

                            <h3 style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                2. Refund Processing &amp; Mode of Payment
                            </h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', textAlign: 'justify' }}>
                                All refunds are processed electronically through our authorized payment gateway partner, <strong>Razorpay</strong>.
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.7', paddingLeft: '20px', marginBottom: '15px' }}>
                                <li><strong>Original Payment Method:</strong> Refunds are strictly credited back to the original payment source utilized at the time of transaction (Credit Card, Debit Card, UPI, or Net Banking). We do not provide cash or paper cheque refunds.</li>
                                <li><strong>Turnaround Timeline:</strong> Once initiated by our system, refunds typically take between <strong>5 to 7 business days</strong> to reflect in your bank account or card statement, depending on your card issuer or banking institution.</li>
                            </ul>

                            <h3 style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                3. Session Rescheduling &amp; Faculty Changes
                            </h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', textAlign: 'justify' }}>
                                Rather than cancelling an entire booking, students are encouraged to reschedule individual class sessions:
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.7', paddingLeft: '20px', marginBottom: '15px' }}>
                                <li>Individual class sessions can be rescheduled or cancelled with at least <strong>12 hours advance notice</strong> prior to the session start time without incurring any penalty.</li>
                                <li>If an assigned faculty member is unavailable or unable to conduct a scheduled session, Produit Academy will either arrange an immediate replacement mentor or issue a full credit/refund for the impacted session.</li>
                            </ul>

                            <h3 style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                4. Non-Refundable Situations
                            </h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', textAlign: 'justify' }}>
                                Refunds will not be granted in the following circumstances:
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.7', paddingLeft: '20px', marginBottom: '15px' }}>
                                <li>Classes that have already been conducted and attended by the student.</li>
                                <li>No-show situations where the student fails to attend the scheduled live Google Meet session without giving at least 2 hours prior written notice.</li>
                                <li>Expulsion or account suspension resulting from code-of-conduct violations, academic dishonesty, or abusive behavior toward educators or fellow students.</li>
                            </ul>

                            <h3 style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                5. How to Request Assistance
                            </h3>
                            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', textAlign: 'justify' }}>
                                For automated cancellations, use the <strong>Cancel &amp; Refund</strong> option on your dashboard. If you encounter any technical difficulty or require manual resolution for a billing query, please contact our student support team:
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.7', paddingLeft: '20px', marginBottom: '15px' }}>
                                <li><strong>Email:</strong> <a href="mailto:produitacademy@gmail.com" style={{ color: 'var(--accent-blue)' }}>produitacademy@gmail.com</a></li>
                                <li><strong>Phone / WhatsApp:</strong> <a href="tel:+918139805996" style={{ color: 'var(--accent-blue)' }}>+91 8139 805 996</a></li>
                                <li><strong>Support Hours:</strong> Monday to Saturday, 9:00 AM &ndash; 7:00 PM IST</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
