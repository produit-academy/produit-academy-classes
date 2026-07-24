// pages/admin/subjects.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function AdminSubjects() {
    const router = useRouter();
    const { course_id } = router.query;
    const [subjects, setSubjects] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', icon: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!course_id) return;
        Promise.all([
            apiGet(`/api/classes/admin/subjects/?course_id=${course_id}`),
            apiGet('/api/classes/admin/courses/')
        ]).then(([subs, coursesData]) => {
            setSubjects(subs);
            const courses = coursesData.results || coursesData;
            const c = courses.find(c => String(c.id) === String(course_id));
            setCourseName(c?.name || 'Course');
        }).catch(console.error).finally(() => setLoading(false));
    }, [course_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await apiPost('/api/classes/admin/subjects/', {
                ...form,
                course: parseInt(course_id)
            });
            if (res.ok) {
                const newSub = await res.json();
                setSuccess('Subject created!');
                setSubjects([...subjects, newSub]);
                setShowForm(false);
                setForm({ name: '', description: '', icon: '' });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(JSON.stringify(data));
            }
        } catch {
            setError('Failed to create subject.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        try {
            const res = await apiDelete('/api/classes/admin/subjects/', { subject_id: id });
            if (res.ok) {
                setSuccess('Subject deleted.');
                setSubjects(subjects.filter(s => s.id !== id));
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to delete.');
            }
        } catch {
            setError('Failed to delete subject.');
        }
    };

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '0.92rem', background: 'var(--background-light)' };

    return (
        <DashboardLayout title={`Subjects for ${courseName}`}>
            <Head>
                <title>Subjects | Produit Classes Admin</title>
            </Head>

            <button
                onClick={() => router.push('/admin/courses')}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.95rem',
                    marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px',
                }}
            >
                ← Back to Courses
            </button>

            {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}
            {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

            <div style={{ marginBottom: '20px' }}>
                <button className="glass-btn primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Subject'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>New Subject</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>Subject Name</label>
                            <input
                                type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                style={inputStyle} required placeholder="e.g., Mathematics"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>Icon (Max 2 chars)</label>
                            <input
                                type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                style={inputStyle} placeholder="e.g., Ma" maxLength="2"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>Description</label>
                            <textarea
                                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                            />
                        </div>
                        <button type="submit" className="glass-btn primary" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Subject'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : subjects.length > 0 ? (
                <div className="glass-card data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Teachers</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((s) => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-blue)', background: 'rgba(52,152,219,0.1)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                                {s.icon || s.name.substring(0, 2).toUpperCase()}
                                            </span>
                                            <div>
                                                <strong>{s.name}</strong>
                                                {s.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.description}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{s.teacher_count || 0}</td>
                                    <td>
                                        <span className={`badge ${s.is_active ? 'badge-active' : 'badge-cancelled'}`}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="glass-btn danger" onClick={() => handleDelete(s.id)} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-card empty-state">
                    <h3>No subjects added yet</h3>
                    <p>Click "Add Subject" to create one.</p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminSubjects, ['admin']);
