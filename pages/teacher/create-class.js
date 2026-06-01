import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function CreateClass() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        student_id: '',
        course: '',
        title: '',
        meeting_link: '',
        scheduled_time: '',
        duration_minutes: 60,
    });

    useEffect(() => {
        apiGet('/api/classes/teacher/dashboard/')
            .then((data) => {
                setCourses(data.courses || []);
                setAssignedStudents(data.assigned_students || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Filter courses: show only courses eligible for the selected student
    const selectedStudent = assignedStudents.find(s => String(s.id) === form.student_id);
    const filteredCourses = form.student_id && selectedStudent?.course_ids
        ? courses.filter(c => selectedStudent.course_ids.includes(c.id))
        : courses;

    const handleStudentChange = (studentId) => {
        setForm({ ...form, student_id: studentId, course: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const res = await apiPost('/api/classes/sessions/create/', {
                student_id: parseInt(form.student_id),
                course: parseInt(form.course),
                title: form.title,
                meeting_link: form.meeting_link,
                scheduled_time: new Date(form.scheduled_time).toISOString(),
                duration_minutes: parseInt(form.duration_minutes),
            });

            if (res.ok) {
                setSuccess('Class created successfully!');
                setForm({ student_id: '', course: '', title: '', meeting_link: '', scheduled_time: '', duration_minutes: 60 });
                setTimeout(() => router.push('/teacher/dashboard'), 1500);
            } else {
                const data = await res.json();
                setError(data.detail || 'Failed to create class. Check your inputs.');
            }
        } catch {
            setError('Failed to connect to the server.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Create a Class">
            <Head>
                <title>Create Class | Produit Classes</title>
            </Head>

            <div className="glass-card" style={{ maxWidth: '600px', padding: '2rem' }}>
                {loading ? (
                    <div className="loading-container"><div className="loading-spinner" /></div>
                ) : (
                    <>
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Student</label>
                                <select
                                    className="input-field"
                                    value={form.student_id}
                                    onChange={(e) => handleStudentChange(e.target.value)}
                                    required
                                >
                                    <option value="">Select a student</option>
                                    {assignedStudents.map((s) => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Course</label>
                                <select
                                    className="input-field"
                                    value={form.course}
                                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                                    required
                                >
                                    <option value="">{form.student_id ? 'Select a course' : 'Select a student first'}</option>
                                    {filteredCourses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {form.student_id && filteredCourses.length === 0 && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', marginTop: '4px' }}>
                                        No eligible courses for this student.
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Class Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Physics Chapter 3"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Meeting Link</label>
                                <input
                                    type="url"
                                    className="input-field"
                                    placeholder="https://meet.google.com/..."
                                    value={form.meeting_link}
                                    onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Scheduled Time</label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={form.scheduled_time}
                                    onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="15"
                                    max="300"
                                    value={form.duration_minutes}
                                    onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="submit" className="glass-btn primary" disabled={submitting} style={{ flex: 1, padding: '14px' }}>
                                    {submitting ? 'Creating...' : 'Create Class'}
                                </button>
                                <button type="button" className="glass-btn secondary" onClick={() => router.push('/teacher/dashboard')} style={{ padding: '14px' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(CreateClass, ['teacher', 'admin']);
