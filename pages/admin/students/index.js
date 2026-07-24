// pages/admin/students/index.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../../lib/auth';
import { apiGet } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';

function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        apiGet(`/api/classes/admin/students/?search=${search}`)
            .then(setStudents)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search]);

    return (
        <DashboardLayout title="Manage Students">
            <Head>
                <title>Students | Produit Classes Admin</title>
            </Head>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search students by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : students.length > 0 ? (
                <div className="glass-card data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th>Registered</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id}>
                                    <td><strong>{s.name}</strong></td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{s.email}</div>
                                        {s.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.phone}</div>}
                                    </td>
                                    <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {new Date(s.registered).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td>
                                        <span className={`badge ${s.is_active ? 'badge-active' : 'badge-cancelled'}`}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-card empty-state">
                    <h3>No students found</h3>
                    <p>{search ? 'Try a different search term.' : 'Students will appear here once they register.'}</p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminStudents, ['admin']);
