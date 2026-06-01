import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../lib/auth';
import { apiGet } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';

function Analysis() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                let data;
                if (user?.role === 'mentor') {
                    data = await apiGet('/api/classes/mentor/dashboard/');
                    setStudents(data.all_students || []);
                } else if (user?.role === 'teacher') {
                    data = await apiGet('/api/classes/teacher/dashboard/');
                    setStudents(data.assigned_students || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAnalysis();
    }, [user]);

    const filteredStudents = students.filter(s => 
        (s.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <Head><title>Student Analysis | Produit Classes</title></Head>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Student Analysis</h2>
                    
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Search students..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                        <div style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '0' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
                    ) : filteredStudents.length > 0 ? (
                        <div className="data-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Enrolled Courses</th>
                                        <th>Attendance</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => {
                                        const attendance = parseFloat(student.attendance_percentage || 0);
                                        const isAtRisk = attendance < 75;
                                        const courseList = user?.role === 'mentor' 
                                            ? (student.enrolled_courses || []).map(c => c.name).join(', ')
                                            : (student.courses || []).join(', ');

                                        return (
                                            <tr key={student.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{student.first_name} {student.last_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                    {courseList || 'No courses'}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ 
                                                            width: '60px', height: '6px', background: 'var(--card-border)', borderRadius: '4px', overflow: 'hidden'
                                                        }}>
                                                            <div style={{ 
                                                                width: `${attendance}%`, height: '100%', 
                                                                background: attendance >= 75 ? 'var(--accent-green)' : 'var(--accent-red)',
                                                                transition: 'width 0.3s'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: attendance >= 75 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                            {attendance.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                                                        background: isAtRisk ? 'rgba(231, 76, 60, 0.15)' : 'rgba(51, 174, 120, 0.15)',
                                                        color: isAtRisk ? 'var(--accent-red)' : 'var(--accent-green)',
                                                    }}>
                                                        {isAtRisk ? 'At Risk' : 'On Track'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="glass-btn" style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                                        onClick={() => alert('Detailed view coming soon!')}>
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No students found.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(Analysis, ['teacher', 'mentor']);
