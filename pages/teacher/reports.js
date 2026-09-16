import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
    FileText, Mic, Star, Upload, CheckCircle2, Clock, Calendar,
    User, BookOpen, AlertCircle, Play, Pause, Download, Plus, Filter
} from 'lucide-react';

function TeacherReports() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('create_report'); // 'create_report' | 'reports_history' | 'voice_notes' | 'monthly_report'
    const [dashboardData, setDashboardData] = useState(null);
    const [reports, setReports] = useState([]);
    const [voiceNotes, setVoiceNotes] = useState([]);
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Form state: Create Student Report
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState('present');
    const [rating, setRating] = useState(5);
    const [observations, setObservations] = useState('');
    const [strengths, setStrengths] = useState('');
    const [improvements, setImprovements] = useState('');
    const [reportStatus, setReportStatus] = useState('submitted');
    const [pdfFile, setPdfFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);

    // Form state: Daily Voice Note
    const [vnSession, setVnSession] = useState('');
    const [vnStudent, setVnStudent] = useState('');
    const [vnSummary, setVnSummary] = useState('');
    const [vnAudioFile, setVnAudioFile] = useState(null);

    // Form state: Monthly Report
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [monthlySummary, setMonthlySummary] = useState('');
    const [monthlyPdfFile, setMonthlyPdfFile] = useState(null);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dash, reps, vns, mReps] = await Promise.all([
                apiGet('/api/classes/teacher/dashboard/'),
                apiGet('/api/classes/reports/'),
                apiGet('/api/classes/voice-notes/'),
                apiGet('/api/classes/monthly-reports/')
            ]);
            setDashboardData(dash);
            setReports(Array.isArray(reps) ? reps : []);
            setVoiceNotes(Array.isArray(vns) ? vns : []);
            setMonthlyReports(Array.isArray(mReps) ? mReps : []);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load reporting data.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Start/Stop in-browser voice recorder
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setRecordedBlob(audioBlob);
                const file = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
                setAudioFile(file);
                setVnAudioFile(file);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone error:', err);
            alert('Could not access microphone. Please ensure microphone permissions are granted.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    // Submit Class Report
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent) {
            alert('Please select a student.');
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('student', selectedStudent);
        if (selectedSession) formData.append('session', selectedSession);
        formData.append('attendance_status', attendanceStatus);
        formData.append('performance_rating', rating);
        formData.append('observations', observations);
        formData.append('strengths', strengths);
        formData.append('areas_for_improvement', improvements);
        formData.append('status', reportStatus);
        if (pdfFile) formData.append('report_file', pdfFile);
        if (audioFile) formData.append('voice_note', audioFile);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/classes/reports/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Student evaluation report submitted successfully.' });
                // Reset form
                setObservations('');
                setStrengths('');
                setImprovements('');
                setPdfFile(null);
                setAudioFile(null);
                setRecordedBlob(null);
                loadData();
                setActiveTab('reports_history');
            } else {
                const errData = await res.json();
                setMessage({ type: 'error', text: errData.detail || 'Failed to submit report.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error submitting report.' });
        } finally {
            setSubmitting(false);
        }
    };

    // Submit Daily Voice Note
    const handleVoiceNoteSubmit = async (e) => {
        e.preventDefault();
        if (!vnAudioFile) {
            alert('Please record or upload an audio voice note.');
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('audio_file', vnAudioFile);
        formData.append('summary', vnSummary);
        if (vnSession) formData.append('session', vnSession);
        if (vnStudent) formData.append('student', vnStudent);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/classes/voice-notes/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Daily voice note recorded and saved.' });
                setVnSummary('');
                setVnAudioFile(null);
                setRecordedBlob(null);
                loadData();
            } else {
                setMessage({ type: 'error', text: 'Failed to upload voice note.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error uploading audio.' });
        } finally {
            setSubmitting(false);
        }
    };

    // Submit Monthly Report
    const handleMonthlyReportSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('month', reportMonth);
        formData.append('year', reportYear);
        formData.append('summary_notes', monthlySummary);
        if (monthlyPdfFile) formData.append('report_document', monthlyPdfFile);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/classes/monthly-reports/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Monthly final report compiled and submitted.' });
                setMonthlySummary('');
                setMonthlyPdfFile(null);
                loadData();
            } else {
                const errData = await res.json();
                setMessage({ type: 'error', text: errData.error || errData.detail || 'Failed to submit monthly report.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error generating monthly report.' });
        } finally {
            setSubmitting(false);
        }
    };

    const studentList = dashboardData?.assigned_students || [];
    const pastSessions = dashboardData?.recent_sessions || [];

    return (
        <DashboardLayout title="Student Analysis & Faculty Reporting">
            <Head>
                <title>Reports & Voice Notes | Produit Faculty</title>
            </Head>

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {message && (
                    <div style={{
                        padding: '12px 20px',
                        marginBottom: '20px',
                        borderRadius: '0px',
                        background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #e2e8f0',
                    marginBottom: '24px',
                    gap: '4px',
                    flexWrap: 'wrap'
                }}>
                    {[
                        { id: 'create_report', label: 'Submit Class Report', icon: FileText },
                        { id: 'reports_history', label: `Student Reports (${reports.length})`, icon: Star },
                        { id: 'voice_notes', label: `Daily Voice Notes (${voiceNotes.length})`, icon: Mic },
                        { id: 'monthly_report', label: `Monthly Final Reports (${monthlyReports.length})`, icon: Calendar },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '10px 18px',
                                    border: 'none',
                                    borderBottom: active ? '3px solid var(--accent-green-dark)' : '3px solid transparent',
                                    background: active ? '#ffffff' : 'transparent',
                                    color: active ? '#0f172a' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Icon size={16} color={active ? 'var(--accent-green-dark)' : '#94a3b8'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: SUBMIT STUDENT REPORT */}
                {activeTab === 'create_report' && (
                    <div className="glass-card" style={{ padding: '28px', borderRadius: '0px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                            Submit Academic Observation & Evaluation
                        </h3>
                        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '24px' }}>
                            Provide comprehensive evaluation, attendance metrics, score ratings, and upload PDF proof or voice feedback for the student and admin.
                        </p>

                        <form onSubmit={handleReportSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Select Student *
                                    </label>
                                    <select
                                        className="input-field"
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">-- Choose Student --</option>
                                        {studentList.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.first_name} {s.last_name} ({s.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Link to Class Session (Optional)
                                    </label>
                                    <select
                                        className="input-field"
                                        value={selectedSession}
                                        onChange={(e) => setSelectedSession(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">-- Standalone Evaluation --</option>
                                        {pastSessions.map(sess => (
                                            <option key={sess.id} value={sess.id}>
                                                {sess.title} &middot; {sess.course_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Attendance Status
                                    </label>
                                    <select
                                        className="input-field"
                                        value={attendanceStatus}
                                        onChange={(e) => setAttendanceStatus(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="present">Present (On Time)</option>
                                        <option value="late">Late Arrival</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Performance Rating (1 - 5 Stars)
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setRating(star)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    color: star <= rating ? '#f59e0b' : '#cbd5e1'
                                                }}
                                            >
                                                <Star size={24} fill={star <= rating ? '#f59e0b' : 'none'} />
                                            </button>
                                        ))}
                                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginLeft: '6px' }}>
                                            {rating} / 5
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                    Comprehensive Observations & Lesson Summary *
                                </label>
                                <textarea
                                    className="input-field"
                                    rows={4}
                                    placeholder="Detail what topics were covered, student comprehension, engagement level, questions asked..."
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    required
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Key Strengths
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows={2}
                                        placeholder="e.g. Quick problem-solving, strong conceptual grasp..."
                                        value={strengths}
                                        onChange={(e) => setStrengths(e.target.value)}
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Areas for Improvement
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows={2}
                                        placeholder="e.g. Needs revision on integration formulae, practice speed..."
                                        value={improvements}
                                        onChange={(e) => setImprovements(e.target.value)}
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            {/* Media Uploads: PDF and Voice Note */}
                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '20px',
                                marginBottom: '24px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '20px'
                            }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        <Upload size={14} />
                                        <span>Attach Assessment / PDF Report</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => setPdfFile(e.target.files[0] || null)}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    {pdfFile && <p style={{ fontSize: '0.78rem', color: '#047857', marginTop: '4px' }}>Selected: {pdfFile.name}</p>}
                                </div>

                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        <Mic size={14} />
                                        <span>Audio Voice Note / Feedback</span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                        {!isRecording ? (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                style={{
                                                    background: '#ffffff',
                                                    border: '1px solid #cbd5e1',
                                                    padding: '6px 12px',
                                                    borderRadius: '0px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: '#dc2626'
                                                }}
                                            >
                                                <Mic size={14} />
                                                <span>Record Audio</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                style={{
                                                    background: '#dc2626',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '0px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    color: '#ffffff',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Pause size={14} />
                                                <span>Stop Recording</span>
                                            </button>
                                        )}
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>or upload:</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setAudioFile(e.target.files[0] || null)}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    {recordedBlob && (
                                        <div style={{ marginTop: '8px' }}>
                                            <audio controls src={URL.createObjectURL(recordedBlob)} style={{ height: '32px', width: '100%' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setReportStatus('draft'); }}
                                    disabled={submitting}
                                    className="glass-btn outline"
                                    style={{ borderRadius: '0px' }}
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="glass-btn primary"
                                    style={{ borderRadius: '0px' }}
                                >
                                    {submitting ? 'Submitting Report...' : 'Submit Evaluation Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 2: REPORTS HISTORY */}
                {activeTab === 'reports_history' && (
                    <div className="glass-card" style={{ padding: '0', borderRadius: '0px', overflow: 'hidden' }}>
                        {reports.length === 0 ? (
                            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
                                <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                                <h4 style={{ color: '#0f172a', fontWeight: 700 }}>No reports submitted yet</h4>
                                <p style={{ fontSize: '0.88rem' }}>Create student evaluation reports to track academic progress.</p>
                            </div>
                        ) : (
                            <div className="data-table-wrapper" style={{ margin: 0 }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Student</th>
                                            <th>Rating</th>
                                            <th>Attendance</th>
                                            <th>Observations</th>
                                            <th>Deliverables</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map(r => (
                                            <tr key={r.id}>
                                                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </td>
                                                <td>
                                                    <strong>{r.student_name}</strong>
                                                    {r.session_title && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.session_title}</div>}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                                                        <Star size={14} fill="#f59e0b" />
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.performance_rating}/5</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="telemetry-chip" style={{ textTransform: 'capitalize' }}>
                                                        {r.attendance_status}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: '#334155' }}>
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {r.observations}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {r.report_file && (
                                                            <a href={r.report_file} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
                                                                <Download size={12} /> PDF Report
                                                            </a>
                                                        )}
                                                        {r.voice_note && (
                                                            <audio controls src={r.voice_note} style={{ height: '24px', width: '120px' }} />
                                                        )}
                                                        {!r.report_file && !r.voice_note && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${r.status === 'approved' ? 'badge-completed' : r.status === 'submitted' ? 'badge-live' : 'badge-scheduled'}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: DAILY VOICE NOTES */}
                {activeTab === 'voice_notes' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {/* New Voice Note Card */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '0px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Mic size={20} color="#dc2626" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                    Record Daily Class Voice Note
                                </h3>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
                                Fast daily audio brief capturing key points, student engagement, and takeaways.
                            </p>

                            <form onSubmit={handleVoiceNoteSubmit}>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Associated Class Session (Optional)
                                    </label>
                                    <select
                                        className="input-field"
                                        value={vnSession}
                                        onChange={(e) => setVnSession(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">-- General Daily Audio --</option>
                                        {pastSessions.map(s => (
                                            <option key={s.id} value={s.id}>{s.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Key Topics / Summary Note
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="Quick notes on what was discussed..."
                                        value={vnSummary}
                                        onChange={(e) => setVnSummary(e.target.value)}
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ background: '#f8fafc', padding: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                        {!isRecording ? (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                style={{
                                                    background: '#dc2626',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '0px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Mic size={15} />
                                                <span>Start Recording</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                style={{
                                                    background: '#0f172a',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '0px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Pause size={15} />
                                                <span>Stop Recording</span>
                                            </button>
                                        )}
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>or upload file</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setVnAudioFile(e.target.files[0] || null)}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    {recordedBlob && (
                                        <div style={{ marginTop: '10px' }}>
                                            <audio controls src={URL.createObjectURL(recordedBlob)} style={{ width: '100%', height: '36px' }} />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="glass-btn primary"
                                    style={{ width: '100%', borderRadius: '0px' }}
                                >
                                    {submitting ? 'Saving...' : 'Save Voice Note'}
                                </button>
                            </form>
                        </div>

                        {/* Voice Notes List */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '0px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                                Audio Recordings Archive
                            </h4>
                            {voiceNotes.length === 0 ? (
                                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>No voice notes recorded yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {voiceNotes.map(vn => (
                                        <div key={vn.id} style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            padding: '12px 16px',
                                            borderRadius: '0px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                                                    {new Date(vn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {vn.student_name && (
                                                    <span className="telemetry-chip cyan" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                                        {vn.student_name}
                                                    </span>
                                                )}
                                            </div>
                                            {vn.summary && (
                                                <p style={{ fontSize: '0.85rem', color: '#1e293b', margin: '0 0 8px', fontStyle: 'italic' }}>
                                                    "{vn.summary}"
                                                </p>
                                            )}
                                            {vn.audio_file && (
                                                <audio controls src={vn.audio_file} style={{ width: '100%', height: '32px' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 4: MONTHLY FINAL REPORTS */}
                {activeTab === 'monthly_report' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {/* Generate Monthly Report Form */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '0px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Calendar size={20} color="#2563eb" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                    Generate Monthly Final Report
                                </h3>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
                                Compiles conducted/not conducted counts, teaching hours, and observations into an official monthly summary.
                            </p>

                            <form onSubmit={handleMonthlyReportSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                            Month
                                        </label>
                                        <select
                                            className="input-field"
                                            value={reportMonth}
                                            onChange={(e) => setReportMonth(parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                        >
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                                                <option key={idx + 1} value={idx + 1}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                            Year
                                        </label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={reportYear}
                                            onChange={(e) => setReportYear(parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Monthly Summary & Pedagogical Highlights
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows={4}
                                        placeholder="Overall syllabus progress, student feedback, special notes for admin..."
                                        value={monthlySummary}
                                        onChange={(e) => setMonthlySummary(e.target.value)}
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '18px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        <Upload size={14} />
                                        <span>Monthly Dossier / Signed PDF (Optional)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => setMonthlyPdfFile(e.target.files[0] || null)}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="glass-btn primary"
                                    style={{ width: '100%', borderRadius: '0px', background: '#2563eb' }}
                                >
                                    {submitting ? 'Compiling Report...' : 'Compile & Submit Monthly Report'}
                                </button>
                            </form>
                        </div>

                        {/* Historical Monthly Reports */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '0px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                                Past Monthly Submissions
                            </h4>
                            {monthlyReports.length === 0 ? (
                                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>No monthly reports generated yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {monthlyReports.map(mr => (
                                        <div key={mr.id} style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderLeft: '4px solid #2563eb',
                                            padding: '16px',
                                            borderRadius: '0px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                                                    {mr.month}/{mr.year}
                                                </span>
                                                <span className={`status-badge ${mr.status === 'approved' ? 'badge-completed' : 'badge-live'}`}>
                                                    {mr.status}
                                                </span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px', fontSize: '0.78rem' }}>
                                                <div>
                                                    <span style={{ color: '#64748b' }}>Conducted:</span>
                                                    <strong style={{ display: 'block', color: '#166534', fontSize: '1rem' }}>{mr.total_classes_conducted}</strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#64748b' }}>Not Conducted:</span>
                                                    <strong style={{ display: 'block', color: '#991b1b', fontSize: '1rem' }}>{mr.total_classes_not_conducted}</strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#64748b' }}>Teaching Hours:</span>
                                                    <strong style={{ display: 'block', color: '#1e293b', fontSize: '1rem' }}>{mr.total_teaching_hours}h</strong>
                                                </div>
                                            </div>

                                            {mr.summary_notes && (
                                                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 10px', lineHeight: 1.4 }}>
                                                    {mr.summary_notes}
                                                </p>
                                            )}

                                            {mr.report_document && (
                                                <a href={mr.report_document} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 600 }}>
                                                    <Download size={13} /> View Attached PDF Report
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(TeacherReports, ['teacher', 'admin']);
