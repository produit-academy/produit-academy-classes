import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadCourses = () => {
        setLoading(true);
        apiGet('/api/classes/admin/courses/')
            .then(setCourses)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadCourses(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let res;
            if (editId) {
                res = await apiPut(`/api/classes/admin/courses/${editId}/`, form);
            } else {
                res = await apiPost('/api/classes/admin/courses/', form);
            }
            if (res.ok) {
                setSuccess(editId ? 'Course updated!' : 'Course created!');
                setShowForm(false);
                setEditId(null);
                setForm({ name: '', description: '' });
                loadCourses();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(JSON.stringify(data));
            }
        } catch {
            setError('Failed to save course.');
        }
    };

    const handleEdit = (course) => {
        setEditId(course.id);
        setForm({ name: course.name, description: course.description || '' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            const res = await apiDelete(`/api/classes/admin/courses/${id}/`);
            if (res.ok) {
                setSuccess('Course deleted.');
                loadCourses();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch {
            setError('Failed to delete course.');
        }
    };

    return (
        <DashboardLayout title="Manage Courses">
            <Head>
                <title>Courses | Produit Classes Admin</title>
            </Head>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ marginBottom: '20px' }}>
                <button
                    className="glass-btn primary"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditId(null);
                        setForm({ name: '', description: '' });
                    }}
                >
                    {showForm ? 'Cancel' : 'Create Course'}
                </button>
            </div>

            {/* Create / Edit Form */}
            {showForm && (
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>
                        {editId ? 'Edit Course' : 'New Course'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Course Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g., 10th Grade Mathematics"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="input-field"
                                rows={3}
                                placeholder="Optional description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <button type="submit" className="glass-btn primary" style={{ width: '100%', padding: '12px' }}>
                            {editId ? 'Update Course' : 'Create Course'}
                        </button>
                    </form>
                </div>
            )}

            {/* Courses Table */}
            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : courses.length > 0 ? (
                <div className="glass-card data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Students</th>
                                <th>Teachers</th>
                                <th>Mentor</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <strong>{c.name}</strong>
                                        {c.description && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.description.substring(0, 60)}</div>
                                        )}
                                    </td>
                                    <td>{c.student_count}</td>
                                    <td>
                                        {c.teacher_list?.map((t) => t.username).join(', ') || 'None'}
                                    </td>
                                    <td>{c.mentor_name || 'None'}</td>
                                    <td>
                                        <span className={`badge ${c.is_active ? 'badge-active' : 'badge-cancelled'}`}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="glass-btn" onClick={() => handleEdit(c)} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                                Edit
                                            </button>
                                            <button className="glass-btn danger" onClick={() => handleDelete(c.id)} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-card empty-state">
                    <h3>No courses yet</h3>
                    <p>Create your first course to get started.</p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminCourses, ['admin']);
