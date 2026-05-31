import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function TeacherAvailability() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    // Form state for adding a new slot
    const [newSlot, setNewSlot] = useState({ date: '', start_time: '', end_time: '' });

    const loadData = useCallback(() => {
        setLoading(true);
        apiGet('/api/classes/teacher/availability/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setMsg(null);
        setErr(null);

        if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
            setErr('Please fill all fields.');
            return;
        }
        if (newSlot.start_time >= newSlot.end_time) {
            setErr('End time must be after start time.');
            return;
        }

        setSaving(true);
        try {
            const res = await apiPost('/api/classes/teacher/availability/', {
                slots: [newSlot],
            });
            const d = await res.json();
            if (res.ok) {
                setMsg(d.message || 'Slot saved!');
                setNewSlot({ date: '', start_time: '', end_time: '' });
                loadData();
            } else {
                setErr(d.error || 'Failed to save slot.');
            }
        } catch {
            setErr('Network error.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!confirm('Remove this availability slot?')) return;
        try {
            const res = await apiDelete('/api/classes/teacher/availability/', { slot_id: slotId });
            if (res.ok) {
                loadData();
            }
        } catch {
            alert('Failed to delete slot.');
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        const [h, m] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(h), parseInt(m));
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    // Group slots by week
    const groupSlotsByWeek = (slots) => {
        if (!data) return {};
        const groups = { current: [], next: [] };
        const nextStart = data.next_week?.start;
        slots.forEach(s => {
            if (s.date >= nextStart) {
                groups.next.push(s);
            } else {
                groups.current.push(s);
            }
        });
        return groups;
    };

    const grouped = data ? groupSlotsByWeek(data.slots || []) : { current: [], next: [] };

    // Generate date options for next week only
    const getNextWeekDates = () => {
        if (!data?.next_week) return [];
        const dates = [];
        const start = new Date(data.next_week.start + 'T00:00:00');
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            dates.push({
                value: d.toISOString().split('T')[0],
                label: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
            });
        }
        return dates;
    };

    return (
        <DashboardLayout title="My Availability">
            <Head>
                <title>My Availability | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <>
                    {/* Deadline Warning */}
                    {data.deadline_passed && (
                        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                            <strong>Deadline Passed:</strong> The submission window for next week has closed (Sunday 6:00 PM). You can view your existing slots but cannot add new ones until the next cycle.
                        </div>
                    )}

                    {/* Add Slot Form */}
                    {!data.deadline_passed && (
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '640px' }}>
                            <h3 className="section-heading" style={{ marginBottom: '16px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Add Availability for Next Week
                            </h3>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Next week: <strong>{data.next_week?.start}</strong> to <strong>{data.next_week?.end}</strong>
                            </p>

                            {msg && <div className="alert alert-success" style={{ marginBottom: '12px' }}>{msg}</div>}
                            {err && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{err}</div>}

                            <form onSubmit={handleAddSlot}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>Date</label>
                                        <select
                                            className="input-field"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.92rem' }}
                                            value={newSlot.date}
                                            onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                                            required
                                        >
                                            <option value="">Select day...</option>
                                            {getNextWeekDates().map(d => (
                                                <option key={d.value} value={d.value}>{d.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>Start Time</label>
                                        <input
                                            type="time"
                                            className="input-field"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.92rem' }}
                                            value={newSlot.start_time}
                                            onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>End Time</label>
                                        <input
                                            type="time"
                                            className="input-field"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.92rem' }}
                                            value={newSlot.end_time}
                                            onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="glass-btn primary" disabled={saving} style={{ padding: '10px 20px' }}>
                                    {saving ? 'Saving...' : 'Add Slot'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Current Week Slots */}
                    <h3 className="section-heading">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        This Week's Schedule
                    </h3>
                    {grouped.current.length > 0 ? (
                        <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                            {grouped.current.map(slot => (
                                <div key={slot.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{formatDate(slot.date)}</div>
                                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                            {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', background: 'rgba(46,204,113,0.12)', color: '#27ae60', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>Active</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card empty-state" style={{ marginBottom: '24px' }}>
                            <h3>No availability set</h3>
                            <p>You haven't set any slots for this week.</p>
                        </div>
                    )}

                    {/* Next Week Slots */}
                    <h3 className="section-heading">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Next Week's Schedule
                    </h3>
                    {grouped.next.length > 0 ? (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {grouped.next.map(slot => (
                                <div key={slot.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{formatDate(slot.date)}</div>
                                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                            {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        className="glass-btn"
                                        style={{ fontSize: '0.8rem', padding: '4px 12px', color: 'var(--accent-red)', borderColor: 'rgba(231,76,60,0.3)' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card empty-state">
                            <h3>No slots yet</h3>
                            <p>Add your available times for next week using the form above.</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="alert alert-error">Failed to load availability data.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(TeacherAvailability, ['teacher', 'admin']);
