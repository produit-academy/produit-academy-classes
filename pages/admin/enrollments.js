import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function AdminEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        Promise.all([
            apiGet('/api/classes/admin/enrollments/list/'),
            apiGet('/api/classes/admin/courses/'),
        ])
            .then(([enr, crs]) => {
                setEnrollments(enr);
                setCourses(crs);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleCSVUpload = async () => {
        const file = fileRef.current?.files[0];
        if (!file || !selectedCourse) {
            setError('Please select a course and a CSV file.');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('course_id', selectedCourse);

        try {
            const res = await apiPost('/api/classes/admin/enrollments/', formData);
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.detail || 'Students enrolled successfully!');
                if (data.errors?.length > 0) {
                    setError(`Some errors: ${data.errors.join(', ')}`);
                }
                // Reload enrollments
                const enr = await apiGet('/api/classes/admin/enrollments/list/');
                setEnrollments(enr);
                fileRef.current.value = '';
            } else {
                setError(data.detail || 'Upload failed.');
            }
        } catch {
            setError('Failed to connect to server.');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <DashboardLayout title="Manage Enrollments">
            <Head>
                <title>Enrollments | Produit Classes Admin</title>
            </Head>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {/* CSV Upload Card */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Bulk Enroll via CSV
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Upload a CSV file with one email per row. Students must already have accounts.
                </p>

                <div className="form-group">
                    <label className="form-label">Course</label>
                    <select
                        className="input-field"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="">Select a course</option>
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">CSV File</label>
                    <input
                        type="file"
                        ref={fileRef}
                        accept=".csv"
                        className="input-field"
                        style={{ padding: '10px' }}
                    />
                </div>

                <button
                    className="glass-btn primary"
                    onClick={handleCSVUpload}
                    disabled={uploading}
                    style={{ padding: '12px 24px' }}
                >
                    {uploading ? 'Enrolling...' : 'Upload & Enroll'}
                </button>
            </div>

            {/* Enrollments Table */}
            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : enrollments.length > 0 ? (
                <>
                    <h3 className="section-heading">
                        Current Enrollments ({enrollments.length})
                    </h3>
                    <div className="glass-card data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Enrolled</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((e) => (
                                    <tr key={e.id}>
                                        <td><strong>{e.student_name}</strong></td>
                                        <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{e.student_email}</td>
                                        <td>{e.course_name}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{formatDate(e.enrolled_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="glass-card empty-state">
                    <h3>No enrollments yet</h3>
                    <p>Upload a CSV or add students to courses to see them here.</p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminEnrollments, ['admin']);
