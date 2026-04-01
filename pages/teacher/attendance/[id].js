import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';
import { apiFetch } from '../../../lib/api';

export default function TakeAttendance() {
  const router = useRouter();
  const { id } = router.query;
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchRoster = async () => {
      try {
        const res = await apiFetch(`/classes/teacher/class/${id}/roster/`);
        if (res && res.ok) {
          const data = await res.json();
          setStudents(data);
          // Default everyone to 'Present'
          const initialAttendance = {};
          data.forEach(s => { initialAttendance[s.id] = 'Present'; });
          setAttendance(initialAttendance);
        } else {
          setError("Failed to load class roster.");
        }
      } catch (err) {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [id]);

  const handleToggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit this attendance? This cannot be undone.")) return;
    setSubmitting(true);
    
    const payload = {
      attendance: Object.keys(attendance).map(studentId => ({
        student_id: parseInt(studentId),
        status: attendance[studentId]
      }))
    };

    try {
      const res = await apiFetch(`/classes/teacher/class/${id}/attendance/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.ok) {
        alert("Attendance saved successfully!");
        router.push('/teacher/dashboard');
      } else {
        setError("Failed to save attendance.");
        setSubmitting(false);
      }
    } catch (err) {
      setError("Network error during submission.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head><title>Take Attendance | Produit Classes</title></Head>
      <Header />
      <main className="main-content" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--accent-green-dark)' }}>Take Attendance</h2>
            <button onClick={() => router.back()} className="glass-btn">Back</button>
          </div>

          {error && <div style={{ color: 'var(--accent-red)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <div className="glass-card" style={{ padding: '2rem', overflowX: 'auto' }}>
            {loading ? <p style={{ textAlign: 'center' }}>Loading roster...</p> : students.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No students enrolled in this course.</p>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px' }}>Student Name</th>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{student.first_name} {student.last_name}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{student.email}</td>
                        <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleToggle(student.id, 'Present')}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', background: attendance[student.id] === 'Present' ? 'var(--accent-green)' : 'transparent', color: attendance[student.id] === 'Present' ? 'white' : 'inherit', cursor: 'pointer' }}>
                            Present
                          </button>
                          <button 
                            onClick={() => handleToggle(student.id, 'Late')}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', background: attendance[student.id] === 'Late' ? 'var(--accent-yellow)' : 'transparent', color: attendance[student.id] === 'Late' ? 'black' : 'inherit', cursor: 'pointer' }}>
                            Late
                          </button>
                          <button 
                            onClick={() => handleToggle(student.id, 'Absent')}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', background: attendance[student.id] === 'Absent' ? 'var(--accent-red)' : 'transparent', color: attendance[student.id] === 'Absent' ? 'white' : 'inherit', cursor: 'pointer' }}>
                            Absent
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={handleSubmit} className="glass-btn primary" disabled={submitting} style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}>
                  {submitting ? 'Saving...' : 'Submit Final Attendance'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
