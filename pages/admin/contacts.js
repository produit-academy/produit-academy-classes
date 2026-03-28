import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function AdminContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadContacts = () => {
        setLoading(true);
        apiGet('/api/admin/contacts/?platform=classes')
            .then(setContacts)
            .catch((e) => setError('Failed to load inquiries.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadContacts(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            const res = await apiDelete(`/api/admin/contacts/${id}/`);
            if (res.ok) {
                setSuccess('Inquiry deleted.');
                loadContacts();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to delete inquiry.');
            }
        } catch {
            setError('Failed to delete inquiry.');
        }
    };

    return (
        <DashboardLayout title="Contact Enquiries">
            <Head>
                <title>Enquiries | Produit Classes Admin</title>
            </Head>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="glass-card data-table-wrapper" style={{ marginTop: '20px' }}>
                {loading ? (
                    <div className="loading-container"><div className="loading-spinner" /></div>
                ) : contacts.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Email/Phone</th>
                                <th>Course</th>
                                <th>Message</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td><strong>{c.name}</strong></td>
                                    <td>
                                        <a href={`mailto:${c.email}`}>{c.email}</a>
                                        {c.phone && <><br/><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.phone}</span></>}
                                    </td>
                                    <td>{c.course || '-'}</td>
                                    <td>
                                        <div style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                                            {c.message}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="glass-btn danger" onClick={() => handleDelete(c.id)} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <h3>No Enquiries</h3>
                        <p>You have not received any contact enquiries yet.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(AdminContacts, ['admin']);
