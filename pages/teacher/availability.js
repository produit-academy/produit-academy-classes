import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

// Generate hour slots from 9 AM to 9 PM
const HOUR_SLOTS = [];
for (let h = 9; h < 21; h++) {
    const startH = h.toString().padStart(2, '0');
    const endH = (h + 1).toString().padStart(2, '0');
    const label = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
    HOUR_SLOTS.push({
        start_time: `${startH}:00`,
        end_time: `${endH}:00`,
        label,
        labelShort: `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`,
    });
}

function TeacherAvailability() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    // Form state
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedHours, setSelectedHours] = useState([]); // array of { start_time, end_time }

    const loadData = useCallback(() => {
        setLoading(true);
        apiGet('/api/classes/teacher/availability/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const toggleHour = (slot) => {
        const exists = selectedHours.find(h => h.start_time === slot.start_time);
        if (exists) {
            setSelectedHours(selectedHours.filter(h => h.start_time !== slot.start_time));
        } else {
            setSelectedHours([...selectedHours, { start_time: slot.start_time, end_time: slot.end_time }]);
        }
    };

    const isHourSelected = (slot) => selectedHours.some(h => h.start_time === slot.start_time);

    // Check if a slot already exists for this date+hour
    const isHourAlreadySaved = (slot) => {
        if (!data || !selectedDate) return false;
        return (data.slots || []).some(s => s.date === selectedDate && s.start_time === slot.start_time);
    };

    const handleAddSlots = async (e) => {
        e.preventDefault();
        setMsg(null);
        setErr(null);

        if (!selectedDate) {
            setErr('Please select a day.');
            return;
        }
        if (selectedHours.length === 0) {
            setErr('Please select at least one time slot.');
            return;
        }

        setSaving(true);
        try {
            const slotsPayload = selectedHours.map(h => ({
                date: selectedDate,
                start_time: h.start_time,
                end_time: h.end_time,
            }));

            const res = await apiPost('/api/classes/teacher/availability/', {
                slots: slotsPayload,
            });
            const d = await res.json();
            if (res.ok) {
                if (d.errors && d.errors.length > 0) {
                    setErr(d.errors.join(', '));
                    setMsg(d.message);
                } else {
                    setMsg(d.message || `${slotsPayload.length} slot(s) saved successfully!`);
                    setSelectedHours([]);
                }
                loadData();
            } else {
                setErr(d.error || 'Failed to save slots.');
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
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            
            dates.push({
                value: `${yyyy}-${mm}-${dd}`,
                label: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
                labelShort: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
            });
        }
        return dates;
    };

    // Group existing slots by date for nicer display
    const groupByDate = (slots) => {
        const map = {};
        slots.forEach(s => {
            if (!map[s.date]) map[s.date] = [];
            map[s.date].push(s);
        });
        return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
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
                        <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-green, #22c55e)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Add Availability for Next Week</h3>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', marginLeft: '46px' }}>
                                Next week: <strong>{data.next_week?.start}</strong> to <strong>{data.next_week?.end}</strong>
                            </p>

                            {msg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{msg}</div>}
                            {err && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{err}</div>}

                            {/* Step 1: Select Day */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem', color: '#0f172a' }}>
                                    1. Select a Day
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {getNextWeekDates().map(d => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => { setSelectedDate(d.value); setSelectedHours([]); }}
                                            style={{
                                                padding: '10px 18px', borderRadius: '12px', fontSize: '0.88rem',
                                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                border: selectedDate === d.value ? '2px solid var(--accent-blue)' : '1px solid var(--border)',
                                                background: selectedDate === d.value ? 'var(--accent-blue)' : '#fff',
                                                color: selectedDate === d.value ? '#fff' : '#334155',
                                                boxShadow: selectedDate === d.value ? '0 4px 12px rgba(59,130,246,0.25)' : 'none',
                                            }}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Select Hours */}
                            {selectedDate && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem', color: '#0f172a' }}>
                                        2. Select Available Hours (9 AM – 9 PM)
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                        {HOUR_SLOTS.map(slot => {
                                            const alreadySaved = isHourAlreadySaved(slot);
                                            const selected = isHourSelected(slot);
                                            return (
                                                <button
                                                    key={slot.start_time}
                                                    type="button"
                                                    onClick={() => !alreadySaved && toggleHour(slot)}
                                                    disabled={alreadySaved}
                                                    style={{
                                                        padding: '14px 8px', borderRadius: '12px', fontSize: '0.9rem',
                                                        fontWeight: 700, cursor: alreadySaved ? 'default' : 'pointer',
                                                        transition: 'all 0.2s', textAlign: 'center',
                                                        border: selected ? '2px solid var(--accent-green, #22c55e)' : alreadySaved ? '1px solid #bbf7d0' : '1px solid var(--border)',
                                                        background: selected ? '#dcfce7' : alreadySaved ? '#f0fdf4' : '#fff',
                                                        color: selected ? '#166534' : alreadySaved ? '#86efac' : '#334155',
                                                        opacity: alreadySaved ? 0.6 : 1,
                                                    }}
                                                >
                                                    {slot.labelShort}
                                                    {alreadySaved && (
                                                        <div style={{ fontSize: '0.65rem', color: '#86efac', marginTop: '2px' }}>Saved</div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedHours.length > 0 && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--accent-green, #22c55e)', fontWeight: 600, marginTop: '12px' }}>
                                            {selectedHours.length} hour(s) selected
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleAddSlots}
                                className="glass-btn primary"
                                disabled={saving || !selectedDate || selectedHours.length === 0}
                                style={{
                                    padding: '12px 28px', borderRadius: '12px', fontWeight: 700,
                                    opacity: (!selectedDate || selectedHours.length === 0) ? 0.5 : 1,
                                }}
                            >
                                {saving ? 'Saving...' : `Add ${selectedHours.length || ''} Slot${selectedHours.length !== 1 ? 's' : ''}`}
                            </button>
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
                        <div style={{ marginBottom: '28px' }}>
                            {groupByDate(grouped.current).map(([date, slots]) => (
                                <div key={date} style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                                        {formatDate(date)}
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {slots.map(slot => (
                                            <div key={slot.id} style={{
                                                padding: '10px 16px', borderRadius: '8px',
                                                background: '#f0f9ff', border: '1px solid #bae6fd',
                                                fontSize: '0.9rem', fontWeight: 600, color: '#0ea5e9',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                {formatTime(slot.start_time).toLowerCase()} – {formatTime(slot.end_time).toLowerCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card empty-state" style={{ marginBottom: '28px' }}>
                            <h3>No availability set</h3>
                            <p>You haven't set any slots for this week.</p>
                        </div>
                    )}

                    {/* Next Week Slots */}
                    <h3 className="section-heading">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple, #8b5cf6)" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Next Week's Schedule
                    </h3>
                    {grouped.next.length > 0 ? (
                        <div>
                            {groupByDate(grouped.next).map(([date, slots]) => (
                                <div key={date} style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                                        {formatDate(date)}
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {slots.map(slot => (
                                            <div key={slot.id} style={{
                                                padding: '10px 16px', borderRadius: '8px',
                                                background: '#fdf4ff', border: '1px solid #f0abfc',
                                                fontSize: '0.9rem', fontWeight: 600, color: '#a855f7',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                {formatTime(slot.start_time).toLowerCase()} – {formatTime(slot.end_time).toLowerCase()}
                                                <button
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                    title="Remove slot"
                                                    style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        color: '#ef4444', padding: '2px', display: 'flex',
                                                        alignItems: 'center', marginLeft: '8px', transition: 'transform 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
