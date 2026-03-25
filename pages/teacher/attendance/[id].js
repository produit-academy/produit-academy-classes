import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../../lib/auth';
import { apiGet, apiPost } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';

function TakeAttendance() {
    const router = useRouter();
    const { id } = router.query;
    const [roster, setRoster] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!id) return;
        apiGet(`/api/classes/sessions/${id}/roster/`)
            .then((data) => {
                setRoster(data);
                // Pre-fill existing attendance
                const initial = {};
                data.forEach((s) => {
                    initial[s.id] = s.existing_status || 'Present';
                });
                setAttendance(initial);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const updateStatus = (studentId, status) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status) => {
        const updated = {};
        roster.forEach((s) => { updated[s.id] = status; });
        setAttendance(updated);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        const records = Object.entries(attendance).map(([studentId, status]) => ({
            student_id: parseInt(studentId),
            status,
        }));

        try {
            const res = await apiPost(`/api/classes/sessions/${id}/attendance/`, { records });
            if (res.ok) {
                setSuccess('Attendance saved successfully!');
                setTimeout(() => router.push('/teacher/dashboard'), 1500);
            } else {
                const data = await res.json();
                setError(data.detail || 'Failed to save attendance.');
            }
        } catch {
            setError('Failed to connect to the server.');
        } finally {
            setSubmitting(false);
        }
    };

    const statuses = ['Present', 'Absent', 'Late'];

    return (
        <DashboardLayout title="Take Attendance">
            <Head>
                <title>Take Attendance | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : (
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    {error && <div className="alert alert-error" style={{ margin: '16px 16px 0' }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ margin: '16px 16px 0' }}>{success}</div>}

                    {/* Bulk actions */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {roster.length} students enrolled
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="glass-btn" onClick={() => markAll('Present')} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                                Mark All Present
                            </button>
                            <button className="glass-btn" onClick={() => markAll('Absent')} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                                Mark All Absent
                            </button>
                        </div>
                    </div>

                    {/* Student rows */}
                    <div className="attendance-grid">
                        {roster.map((student) => (
                            <div key={student.id} className="attendance-row">
                                <div className="attendance-student-name">
                                    {student.username}
                                    <div className="attendance-student-email">{student.email}</div>
                                </div>
                                <div className="attendance-toggle-group">
                                    {statuses.map((s) => (
                                        <button
                                            key={s}
                                            className={`attendance-toggle ${attendance[student.id] === s ? `selected-${s.toLowerCase()}` : ''}`}
                                            onClick={() => updateStatus(student.id, s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {roster.length === 0 && (
                        <div className="empty-state">
                            <h3>No students enrolled</h3>
                            <p>There are no students enrolled in this course yet.</p>
                        </div>
                    )}

                    {/* Submit */}
                    {roster.length > 0 && (
                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="glass-btn secondary" onClick={() => router.push('/teacher/dashboard')}>
                                Cancel
                            </button>
                            <button className="glass-btn primary" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(TakeAttendance, ['teacher', 'admin']);
