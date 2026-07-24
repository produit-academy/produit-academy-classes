import Head from 'next/head';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { apiPost } from '../lib/api';

export default function HelpCenter() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ subject: 'Technical Issue', description: '' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [complaints, setComplaints] = useState([]);
    
    // We import apiGet inside useEffect to avoid import loop issues if any, or we can just use fetch
    useEffect(() => {
        if (user) {
            import('../lib/api').then(({ apiGet }) => {
                apiGet('/api/student/complaints/')
                    .then(data => setComplaints(data))
                    .catch(() => console.error("Could not load complaints"));
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setStatus({ type: 'error', message: 'You must be logged in to submit a complaint.' });
            return;
        }

        if (!formData.description.trim()) {
            setStatus({ type: 'error', message: 'Please provide a description of the issue.' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const res = await apiPost('/api/student/complaints/', formData);
            if (res.ok) {
                setStatus({ type: 'success', message: 'Your complaint has been submitted successfully. We will get back to you soon.' });
                setFormData({ ...formData, description: '' });
                // Reload complaints
                import('../lib/api').then(({ apiGet }) => {
                    apiGet('/api/student/complaints/').then(data => setComplaints(data));
                });
            } else {
                const errorData = await res.json();
                setStatus({ type: 'error', message: errorData.error || 'Failed to submit complaint.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'A network error occurred. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background-light)' }}>
            <Head>
                <title>Help Center & Complaints - Produit Classes</title>
                <meta name="description" content="Get help, report issues, and submit complaints for Produit Classes." />
            </Head>
            <Header />
            <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '60px' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-green)', marginBottom: '16px' }}>Help Center</h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                            Experiencing an issue? Submit a complaint below regarding technical problems, classes, or any other related issues, and our support team will assist you.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '32px', marginBottom: '40px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Submit a New Issue</h3>
                        
                        {status && (
                            <div className={`alert alert-${status.type}`} style={{ marginBottom: '20px' }}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Issue Category</label>
                                <select 
                                    className="input-field"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="Technical Issue">Technical Issue (App/Website problems)</option>
                                    <option value="Class Issue">Class Issue (Teacher, scheduling, etc.)</option>
                                    <option value="Payment Issue">Payment & Billing Issue</option>
                                    <option value="Other">Other / General Inquiry</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="input-field" 
                                    rows="5" 
                                    placeholder="Please describe the issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                <button 
                                    type="submit" 
                                    className="glass-btn primary" 
                                    disabled={loading || !user}
                                    style={{ padding: '12px 28px' }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Complaint'}
                                </button>
                                {!user && (
                                    <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginTop: '10px' }}>
                                        * You must be logged in to submit a complaint.
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    {user && complaints.length > 0 && (
                        <div>
                            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Your Previous Issues</h3>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {complaints.map(complaint => (
                                    <div key={complaint.id} className="glass-card" style={{ padding: '20px', borderLeft: `4px solid ${complaint.status === 'Resolved' ? 'var(--accent-green)' : 'var(--accent-gold)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <h4 style={{ margin: 0 }}>{complaint.subject}</h4>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                padding: '4px 10px', 
                                                borderRadius: '20px',
                                                backgroundColor: complaint.status === 'Resolved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(212, 160, 23, 0.1)',
                                                color: complaint.status === 'Resolved' ? 'var(--accent-green)' : 'var(--accent-gold)',
                                                fontWeight: 'bold'
                                            }}>
                                                {complaint.status || 'Pending'}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                                            {complaint.description}
                                        </p>
                                        
                                        {complaint.resolution_comment && (
                                            <div style={{ 
                                                backgroundColor: 'rgba(52, 152, 219, 0.05)', 
                                                padding: '12px', 
                                                borderRadius: '8px',
                                                border: '1px solid rgba(52, 152, 219, 0.2)'
                                            }}>
                                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '4px' }}>Admin Response:</span>
                                                <p style={{ margin: 0, fontSize: '0.9rem' }}>{complaint.resolution_comment}</p>
                                            </div>
                                        )}
                                        
                                        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Submitted on: {new Date(complaint.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
