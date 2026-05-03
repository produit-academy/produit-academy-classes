import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import SearchableCourseSelect from '../../components/SearchableCourseSelect';

function AdminEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const router = useRouter();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Manual enroll state
    const [manualCourse, setManualCourse] = useState('');
    const [manualEmail, setManualEmail] = useState('');
    const [manualFirstName, setManualFirstName] = useState('');
    const [manualLastName, setManualLastName] = useState('');
    const [manualPhone, setManualPhone] = useState('');
    const [manualAddress, setManualAddress] = useState('');
    const [manualCurrentClass, setManualCurrentClass] = useState('');
    const [manualSchool, setManualSchool] = useState('');
    const [manualMentor, setManualMentor] = useState('');
    const [manualTeacher, setManualTeacher] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    // Edit Student state
    const [editingStudent, setEditingStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [savingStudent, setSavingStudent] = useState(false);

    useEffect(() => {
        Promise.all([
            apiGet('/api/classes/admin/enrollments/list/'),
            apiGet('/api/classes/admin/staff/'),
        ])
            .then(([enr, stf]) => {
                setEnrollments(enr);
                setStaff(stf);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const mentors = staff.filter(s => s.role === 'mentor');
    const teachers = staff.filter(s => s.role === 'teacher');

    const filteredManualTeachers = manualCourse ? teachers.filter(t => t.subjects && t.subjects.includes(parseInt(manualCourse))) : teachers;

    const reloadEnrollments = async () => {
        const enr = await apiGet('/api/classes/admin/enrollments/list/');
        setEnrollments(enr);
    };

    const resetManualForm = () => {
        setManualEmail('');
        setManualFirstName('');
        setManualLastName('');
        setManualPhone('');
        setManualAddress('');
        setManualCurrentClass('');
        setManualSchool('');
    };

    const handleManualEnroll = async (e) => {
        e.preventDefault();
        if (!manualCourse || !manualEmail) {
            setError('Please select a course and enter a student email.');
            return;
        }
        setEnrolling(true);
        setError('');
        setSuccess('');

        try {
            const res = await apiPost('/api/classes/admin/enrollments/', {
                course_id: parseInt(manualCourse),
                email: manualEmail,
                first_name: manualFirstName || undefined,
                last_name: manualLastName || undefined,
                phone_number: manualPhone || undefined,
                address: manualAddress || undefined,
                current_class: manualCurrentClass || undefined,
                school_name: manualSchool || undefined,
                mentor_id: manualMentor || undefined,
                teacher_id: manualTeacher || undefined,
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.detail || 'Student enrolled!');
                if (data.errors?.length > 0) setError(`Errors: ${data.errors.join(', ')}`);
                resetManualForm();
                reloadEnrollments();
            } else {
                setError(data.detail || 'Enrollment failed.');
            }
        } catch {
            setError('Failed to connect to server.');
        } finally {
            setEnrolling(false);
        }
    };

    const handleToggleCompletion = async (enrollmentId) => {
        try {
            const res = await apiPost(`/api/classes/admin/enrollments/${enrollmentId}/toggle-completion/`);
            if (res.ok) {
                reloadEnrollments();
            } else {
                setError('Failed to toggle completion status.');
            }
        } catch {
            setError('Network error updating completion.');
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!confirm(`WARNING: Are you sure you want to completely delete the account for ${studentName}? This deletes their account, all enrollments, and attendance history.`)) {
            return;
        }
        setError('');
        setSuccess('');
        try {
            const res = await apiDelete(`/api/classes/admin/students/${studentId}/`);
            if (res.ok) {
                setSuccess(`Deleted student account ${studentName}.`);
                reloadEnrollments();
            } else {
                setError('Failed to delete student.');
            }
        } catch {
            setError('Network error deleting student.');
        }
    };

    const openEditModal = async (studentId) => {
        try {
            const res = await apiGet(`/api/classes/admin/students/${studentId}/`);
            setEditFormData(res);
            setEditingStudent(studentId);
        } catch {
            setError('Failed to load student details.');
        }
    };

    const handleEditStudentSubmit = async (e) => {
        e.preventDefault();
        setSavingStudent(true);
        try {
            const res = await apiPut(`/api/classes/admin/students/${editingStudent}/`, editFormData);
            if (res.ok) {
                setSuccess('Student profile updated.');
                setEditingStudent(null);
                reloadEnrollments();
            } else {
                const data = await res.json();
                setError(data.detail || 'Failed to update student profile.');
            }
        } catch {
            setError('Network error updating student profile.');
        } finally {
            setSavingStudent(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const tabStyle = (isActive) => ({
        padding: '10px 20px',
        border: 'none',
        background: isActive ? 'var(--accent-green)' : 'transparent',
        color: isActive ? '#fff' : 'var(--text-secondary)',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.92rem',
        transition: 'all 0.2s',
    });

    return (
        <DashboardLayout title="Manage Enrollments">
            <Head>
                <title>Enrollments | Produit Classes Admin</title>
            </Head>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {/* Edit Student Modal */}
            {editingStudent && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Edit Student Profile</h3>
                            <button onClick={() => setEditingStudent(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)' }}>&times;</button>
                        </div>
                        <form onSubmit={handleEditStudentSubmit}>
                            <div className="responsive-grid-2">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input className="input-field" type="text" name="first_name" value={editFormData.first_name || ''} onChange={handleEditChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input className="input-field" type="text" name="last_name" value={editFormData.last_name || ''} onChange={handleEditChange} required />
                                </div>
                            </div>

                            <div className="responsive-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input className="input-field" type="email" name="email" value={editFormData.email || ''} onChange={handleEditChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mobile Number</label>
                                    <input className="input-field" type="text" name="phone_number" value={editFormData.phone_number || ''} onChange={handleEditChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input className="input-field" type="text" name="address" value={editFormData.address || ''} onChange={handleEditChange} />
                            </div>

                            <div className="responsive-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Current Class / Grade</label>
                                    <input className="input-field" type="text" name="current_class" value={editFormData.current_class || ''} onChange={handleEditChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">School Name</label>
                                    <input className="input-field" type="text" name="school_name" value={editFormData.school_name || ''} onChange={handleEditChange} />
                                </div>
                            </div>

                            <div className="form-group" style={{ background: 'rgba(255,0,0,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,0,0,0.2)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    <input type="checkbox" name="is_active" checked={editFormData.is_active || false} onChange={handleEditChange} style={{ transform: 'scale(1.2)' }} />
                                    Account is Active (Uncheck to ban student/block login)
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button type="button" className="glass-btn" onClick={() => setEditingStudent(null)} style={{ flex: 1, padding: '12px' }}>Cancel</button>
                                <button type="submit" className="glass-btn primary" disabled={savingStudent} style={{ flex: 1, padding: '12px' }}>{savingStudent ? 'Saving...' : 'Save Profile'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Enroll Form */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '4px', fontSize: '1.05rem' }}>Add Individual Student</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Fill in the student details and assign to a course. If the student doesn't have an account, one will be created automatically. Their temporary password will be their Mobile Number (or "ProduitStudent123!" if left blank).
                    </p>

                    <form onSubmit={handleManualEnroll}>
                        <div className="responsive-grid-2">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input className="input-field" type="text" placeholder="First name" value={manualFirstName} onChange={e => setManualFirstName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input className="input-field" type="text" placeholder="Last name" value={manualLastName} onChange={e => setManualLastName(e.target.value)} />
                            </div>
                        </div>

                        <div className="responsive-grid-2">
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input className="input-field" type="email" placeholder="student@example.com" value={manualEmail} onChange={e => setManualEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input className="input-field" type="tel" placeholder="9876543210" value={manualPhone} onChange={e => setManualPhone(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input className="input-field" type="text" placeholder="Full address" value={manualAddress} onChange={e => setManualAddress(e.target.value)} />
                        </div>

                        <div className="responsive-grid-2">
                            <div className="form-group">
                                <label className="form-label">Current Class / Grade</label>
                                <input className="input-field" type="text" placeholder="e.g., 10th Grade" value={manualCurrentClass} onChange={e => setManualCurrentClass(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">School Name</label>
                                <input className="input-field" type="text" placeholder="e.g., St. Mary's School" value={manualSchool} onChange={e => setManualSchool(e.target.value)} />
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', margin: '16px 0' }} />

                        <div className="form-group">
                            <SearchableCourseSelect
                                value={manualCourse}
                                onChange={(id) => setManualCourse(id ? String(id) : '')}
                                label="Enroll in Course *"
                                required
                                placeholder="Search or select a course..."
                                apiEndpoint="/api/classes/admin/courses/"
                            />
                        </div>

                        <div className="responsive-grid-2">
                            <div className="form-group">
                                <label className="form-label">Assign Mentor</label>
                                <select className="input-field" value={manualMentor} onChange={e => setManualMentor(e.target.value)}>
                                    <option value="">None</option>
                                    {mentors.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assign Teacher</label>
                                <select className="input-field" value={manualTeacher} onChange={e => setManualTeacher(e.target.value)}>
                                    <option value="">None</option>
                                    {filteredManualTeachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="glass-btn primary" disabled={enrolling} style={{ width: '100%', padding: '12px' }}>
                            {enrolling ? 'Enrolling...' : 'Enroll Student'}
                        </button>
                    </form>
                </div>

            {/* Enrollments Table */}
            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : enrollments.length > 0 ? (
                <>
                    <h3 className="section-heading">
                        All Student Enrollments ({enrollments.length})
                    </h3>
                    <div className="glass-card data-table-wrapper" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Status</th>
                                    <th>Course</th>
                                    <th>Mentor</th>
                                    <th>Teacher</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((e) => (
                                    <tr key={e.id}>
                                        <td>
                                            <strong>{e.student_name}</strong>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.student_email}</div>
                                            {!e.student_active && (
                                                <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(231, 76, 60, 0.15)', color: '#c0392b', borderRadius: '4px', fontWeight: 'bold' }}>
                                                    BANNED
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ display: 'inline-block', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px', background: e.is_completed ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)', color: e.is_completed ? '#27ae60' : '#d35400', fontWeight: 'bold' }}>
                                                {e.is_completed ? 'Completed' : 'In Progress'}
                                            </span>
                                        </td>
                                        <td>{e.course_name}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{e.mentor_name || '--'}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{e.teacher_name || '--'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <button className="glass-btn primary" onClick={() => handleToggleCompletion(e.id)} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                                    {e.is_completed ? 'Mark Ongoing' : 'Mark Completed'}
                                                </button>
                                                <button className="glass-btn" onClick={() => openEditModal(e.student)} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                                    Edit Profile
                                                </button>
                                                <button className="glass-btn" onClick={() => router.push(`/admin/students/${e.student}`)} style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                                    View Analytics
                                                </button>
                                                <button className="glass-btn danger" onClick={() => handleDeleteStudent(e.student, e.student_name)} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                                    Delete Student
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="glass-card empty-state">
                    <h3>No enrollments yet</h3>
                    <p>Enroll students manually or upload a CSV to see them here.</p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(AdminEnrollments, ['admin']);
