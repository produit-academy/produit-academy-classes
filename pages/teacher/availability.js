import Head from 'next/head';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Calendar as CalendarIcon, Clock, Plus, Trash2, AlertCircle,
    CheckCircle2, Info, ArrowRight, ShieldCheck, Sparkles, Pause
} from 'lucide-react';

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
    return (h || 0) * 60 + (m || 0);
}

function minutesToTimeStr(totalMinutes) {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
    const d = new Date();
    d.setHours(h, m, 0);
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function TeacherAvailability() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    // Form inputs for manual slot entry
    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('11:00');
    const [durationMinutes, setDurationMinutes] = useState(60);

    const loadData = useCallback(() => {
        setLoading(true);
        apiGet('/api/classes/teacher/availability/')
            .then(res => {
                setData(res);
                // Set default date to today or tomorrow
                if (res?.today && !selectedDate) {
                    setSelectedDate(res.today);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // When start time or duration changes, update end time automatically
    const handleStartTimeChange = (newStart) => {
        setStartTime(newStart);
        const startMin = timeToMinutes(newStart);
        const endMin = Math.min(startMin + durationMinutes, 23 * 60 + 59);
        setEndTime(minutesToTimeStr(endMin));
    };

    const handleDurationChange = (duration) => {
        setDurationMinutes(duration);
        const startMin = timeToMinutes(startTime);
        const endMin = Math.min(startMin + duration, 23 * 60 + 59);
        setEndTime(minutesToTimeStr(endMin));
    };

    const handleEndTimeChange = (newEnd) => {
        setEndTime(newEnd);
        const sMin = timeToMinutes(startTime);
        const eMin = timeToMinutes(newEnd);
        if (eMin > sMin) {
            setDurationMinutes(eMin - sMin);
        }
    };

    // Existing slots for currently selected date
    const dayExistingSlots = useMemo(() => {
        if (!data?.slots || !selectedDate) return [];
        return data.slots
            .filter(s => s.date === selectedDate)
            .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
    }, [data, selectedDate]);

    // Live validation against the 1-hour gap rule for the entered time
    const validationResult = useMemo(() => {
        if (!selectedDate || !startTime || !endTime) {
            return { valid: false, message: 'Please specify date and start/end times.' };
        }

        const newStartMin = timeToMinutes(startTime);
        const newEndMin = timeToMinutes(endTime);

        if (newEndMin <= newStartMin) {
            return { valid: false, message: 'End time must be after start time.' };
        }

        const duration = newEndMin - newStartMin;
        if (duration < 30) {
            return { valid: false, message: 'Class slot must be at least 30 minutes.' };
        }
        if (duration > 240) {
            return { valid: false, message: 'Slot cannot exceed 4 hours.' };
        }

        for (const ex of dayExistingSlots) {
            const exStartMin = timeToMinutes(ex.start_time);
            const exEndMin = timeToMinutes(ex.end_time);

            // Overlap check
            if (newStartMin < exEndMin && newEndMin > exStartMin) {
                return {
                    valid: false,
                    message: `Overlaps with your existing slot (${formatTime(ex.start_time)} - ${formatTime(ex.end_time)}).`,
                    type: 'overlap'
                };
            }

            // Gap after existing slot
            if (newStartMin >= exEndMin) {
                const gap = newStartMin - exEndMin;
                if (gap < 60) {
                    const earliestMin = exEndMin + 60;
                    return {
                        valid: false,
                        message: `Must have at least a 1-hour gap after slot ending at ${formatTime(ex.end_time)}. Earliest start: ${formatTime(minutesToTimeStr(earliestMin))}.`,
                        type: 'gap_after'
                    };
                }
            }

            // Gap before existing slot
            if (newEndMin <= exStartMin) {
                const gap = exStartMin - newEndMin;
                if (gap < 60) {
                    const latestMin = exStartMin - 60;
                    return {
                        valid: false,
                        message: `Must have at least a 1-hour gap before slot starting at ${formatTime(ex.start_time)}. Latest end: ${formatTime(minutesToTimeStr(latestMin))}.`,
                        type: 'gap_before'
                    };
                }
            }
        }

        return { valid: true, message: 'Slot satisfies the 1-hour buffer requirement!' };
    }, [selectedDate, startTime, endTime, dayExistingSlots]);

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setMsg(null);
        setErr(null);

        if (!validationResult.valid) {
            setErr(validationResult.message);
            return;
        }

        setSaving(true);
        try {
            const res = await apiPost('/api/classes/teacher/availability/', {
                date: selectedDate,
                start_time: startTime,
                end_time: endTime,
            });
            const d = await res.json();
            if (res.ok) {
                setMsg(d.message || 'Slot saved successfully with 1-hour buffer!');
                loadData();
                // Propose next logical start time: end time + 60 min
                const nextStartMin = Math.min(timeToMinutes(endTime) + 60, 22 * 60);
                const nextEndMin = Math.min(nextStartMin + 60, 23 * 60);
                setStartTime(minutesToTimeStr(nextStartMin));
                setEndTime(minutesToTimeStr(nextEndMin));
            } else {
                setErr(d.error || (d.errors ? d.errors.join(', ') : 'Failed to save slot.'));
            }
        } catch {
            setErr('Network error while communicating with server.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!confirm('Are you sure you want to remove this availability slot?')) return;
        setMsg(null);
        setErr(null);
        try {
            const res = await apiDelete('/api/classes/teacher/availability/', { slot_id: slotId });
            const d = await res.json();
            if (res.ok) {
                setMsg('Slot removed.');
                loadData();
            } else {
                setErr(d.error || 'Failed to remove slot.');
            }
        } catch {
            setErr('Failed to delete slot.');
        }
    };

    // Quick upcoming 7 days
    const upcomingDays = useMemo(() => {
        const list = [];
        const base = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(base);
            d.setDate(d.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const val = `${yyyy}-${mm}-${dd}`;
            list.push({
                value: val,
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
                dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            });
        }
        return list;
    }, []);

    // Group all slots by date
    const groupedAllSlots = useMemo(() => {
        if (!data?.slots) return [];
        const map = {};
        data.slots.forEach(s => {
            if (!map[s.date]) map[s.date] = [];
            map[s.date].push(s);
        });
        return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    }, [data]);

    return (
        <DashboardLayout title="Faculty Availability & Schedule">
            <Head>
                <title>Teacher Availability | Produit Classes</title>
            </Head>

            {loading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
            ) : data ? (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                    {/* Policy Banner */}
                    <div style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
                        display: 'flex', alignItems: 'flex-start', gap: '14px'
                    }}>
                        <div style={{ background: '#dcfce7', color: '#166534', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#14532d' }}>
                                Manual Slot Entry & 1-Hour Buffer Standard
                            </h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#166534', lineHeight: 1.5 }}>
                                You can enter custom class start and end times for any upcoming day. To maintain high teaching quality and prevent fatigue, the system automatically enforces a <strong>mandatory 1-hour gap</strong> before and after every class slot you schedule.
                            </p>
                        </div>
                    </div>

                    {msg && (
                        <div className="alert alert-success" style={{ marginBottom: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={18} />
                            <span>{msg}</span>
                        </div>
                    )}
                    {err && (
                        <div className="alert alert-error" style={{ marginBottom: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} />
                            <span>{err}</span>
                        </div>
                    )}

                    {/* Manual Slot Creator Card */}
                    <div className="glass-card" style={{ padding: '28px', marginBottom: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: '#e0f2fe', color: '#0284c7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                                    Add New Teaching Slot
                                </h3>
                                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0' }}>
                                    Enter custom slot timing for the selected day
                                </p>
                            </div>
                        </div>

                        {/* Step 1: Select Date */}
                        <div style={{ marginBottom: '22px' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: '#1e293b' }}>
                                1. Select Date
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                {upcomingDays.map(d => {
                                    const isSelected = selectedDate === d.value;
                                    return (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => setSelectedDate(d.value)}
                                            style={{
                                                padding: '10px 16px', borderRadius: '10px',
                                                border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                background: isSelected ? '#f0f9ff' : '#ffffff',
                                                color: isSelected ? '#0369a1' : '#334155',
                                                cursor: 'pointer', transition: 'all 0.15s ease',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '84px',
                                                boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{d.label}</span>
                                            <span style={{ fontSize: '0.74rem', color: isSelected ? '#0284c7' : '#64748b', marginTop: '2px' }}>{d.dateLabel}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Or pick any calendar date */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                                <span>Or pick custom date:</span>
                                <input
                                    type="date"
                                    min={data.today || ''}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '8px',
                                        border: '1px solid #cbd5e1', fontSize: '0.88rem',
                                        color: '#0f172a', fontWeight: 600, background: '#fff'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Step 2: Time and Duration Inputs */}
                        <div style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                            padding: '20px', marginBottom: '20px'
                        }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px', color: '#1e293b' }}>
                                2. Manual Time Entry & Duration
                            </label>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'center' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => handleStartTimeChange(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '8px',
                                            border: '1px solid #cbd5e1', fontSize: '1rem',
                                            fontWeight: 700, color: '#0f172a', background: '#fff'
                                        }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => handleEndTimeChange(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '8px',
                                            border: '1px solid #cbd5e1', fontSize: '1rem',
                                            fontWeight: 700, color: '#0f172a', background: '#fff'
                                        }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                                        Quick Duration
                                    </label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[45, 60, 90].map(dur => (
                                            <button
                                                key={dur}
                                                type="button"
                                                onClick={() => handleDurationChange(dur)}
                                                style={{
                                                    flex: 1, padding: '8px 4px', borderRadius: '6px',
                                                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                                                    border: durationMinutes === dur ? '1px solid #0284c7' : '1px solid #cbd5e1',
                                                    background: durationMinutes === dur ? '#0284c7' : '#ffffff',
                                                    color: durationMinutes === dur ? '#ffffff' : '#475569',
                                                }}
                                            >
                                                {dur}m
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Live Gap & Conflict Status Alert */}
                            <div style={{
                                marginTop: '16px', padding: '12px 16px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: validationResult.valid ? '#ecfdf5' : '#fef2f2',
                                border: validationResult.valid ? '1px solid #a7f3d0' : '1px solid #fecaca',
                                color: validationResult.valid ? '#047857' : '#b91c1c',
                                fontSize: '0.88rem', fontWeight: 600
                            }}>
                                {validationResult.valid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span>{validationResult.message}</span>
                            </div>
                        </div>

                        {/* Existing Slots on this date preview */}
                        {dayExistingSlots.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                                    Already scheduled on {formatDate(selectedDate)}:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {dayExistingSlots.map(s => (
                                        <span key={s.id} style={{
                                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem',
                                            fontWeight: 600, background: s.is_booked ? '#fef3c7' : '#f1f5f9',
                                            border: s.is_booked ? '1px solid #fde68a' : '1px solid #cbd5e1',
                                            color: s.is_booked ? '#92400e' : '#334155',
                                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <Clock size={12} />
                                            <span>{formatTime(s.start_time)} - {formatTime(s.end_time)}</span>
                                            {s.is_booked && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309' }}>[BOOKED]</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleAddSlot}
                            disabled={saving || !validationResult.valid}
                            className="glass-btn primary"
                            style={{
                                padding: '12px 28px', borderRadius: '10px', fontWeight: 700,
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                opacity: (!validationResult.valid || saving) ? 0.6 : 1,
                                cursor: (!validationResult.valid || saving) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <Plus size={18} />
                            <span>{saving ? 'Validating & Saving...' : 'Add Slot with 1-Hour Buffer'}</span>
                        </button>
                    </div>

                    {/* All Scheduled Slots grouped by Date */}
                    <div>
                        <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                            <CalendarIcon size={20} color="#0284c7" />
                            <span>All Configured Availability Slots ({data.slots?.length || 0})</span>
                        </h3>

                        {groupedAllSlots.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {groupedAllSlots.map(([dateStr, slots]) => {
                                    // Sort by time
                                    const sortedSlots = [...slots].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
                                    return (
                                        <div key={dateStr} className="glass-card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                                                    {formatDate(dateStr)}
                                                </h4>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                                                    {sortedSlots.length} class slot{sortedSlots.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                                                {sortedSlots.map((slot, idx) => {
                                                    // Compute gap to next slot
                                                    let nextGapStr = null;
                                                    if (idx < sortedSlots.length - 1) {
                                                        const curEnd = timeToMinutes(slot.end_time);
                                                        const nextStart = timeToMinutes(sortedSlots[idx + 1].start_time);
                                                        const gapMin = nextStart - curEnd;
                                                        const gh = Math.floor(gapMin / 60);
                                                        const gm = gapMin % 60;
                                                        nextGapStr = `${gh > 0 ? `${gh}h ` : ''}${gm > 0 ? `${gm}m` : ''} break`;
                                                    }

                                                    return (
                                                        <div key={slot.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                padding: '10px 14px', borderRadius: '10px',
                                                                border: slot.is_booked ? '1px solid #fde68a' : '1px solid #bae6fd',
                                                                background: slot.is_booked ? '#fef3c7' : '#f0f9ff',
                                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                                            }}>
                                                                <Clock size={15} color={slot.is_booked ? '#b45309' : '#0284c7'} />
                                                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: slot.is_booked ? '#92400e' : '#0369a1' }}>
                                                                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                                                                </span>

                                                                {slot.is_booked ? (
                                                                    <span style={{
                                                                        fontSize: '0.72rem', fontWeight: 800,
                                                                        background: '#fef08a', color: '#854d0e',
                                                                        padding: '2px 8px', borderRadius: '4px',
                                                                        letterSpacing: '0.4px'
                                                                    }}>
                                                                        BOOKED
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                                        title="Remove this slot"
                                                                        style={{
                                                                            background: 'none', border: 'none',
                                                                            color: '#ef4444', cursor: 'pointer',
                                                                            display: 'flex', alignItems: 'center', padding: '2px',
                                                                            transition: 'transform 0.15s'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {nextGapStr && (
                                                                <div style={{
                                                                    fontSize: '0.72rem', fontWeight: 700, color: '#16a34a',
                                                                    background: '#f0fdf4', border: '1px dashed #bbf7d0',
                                                                    padding: '4px 8px', borderRadius: '6px',
                                                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                                }}>
                                                                    <Pause size={10} />
                                                                    <span>{nextGapStr}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="glass-card empty-state" style={{ padding: '36px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                                <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>No availability slots set</h4>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                                    Use the manual entry form above to enter your available teaching hours.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div className="alert alert-error">Failed to load teacher availability.</div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(TeacherAvailability, ['teacher', 'admin']);
