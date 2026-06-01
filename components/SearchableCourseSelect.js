import { useState, useEffect, useRef, useCallback } from 'react';
import { apiGet } from '../lib/api';

/**
 * A searchable course dropdown that lazily loads courses in pages.
 * Works as a single-select dropdown replacement for <select>.
 *
 * Props:
 *   value        - selected course ID (number or string)
 *   onChange      - callback(courseId) when a course is selected
 *   placeholder   - placeholder text for search input
 *   required      - whether this is a required field
 *   label         - optional label text
 *   apiEndpoint   - optional override for courses API (default: /api/classes/courses/)
 *   style         - optional style for outer wrapper
 */
export default function SearchableCourseSelect({
    value,
    onChange,
    placeholder = 'Search or select a course...',
    required = false,
    label,
    apiEndpoint = '/api/classes/courses/',
    style = {},
}) {
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const searchTimer = useRef(null);
    const wrapperRef = useRef(null);

    const loadCourses = useCallback(async (pg = 1, q = '', append = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pg, page_size: 20 });
            if (q) params.set('search', q);
            const data = await apiGet(`${apiEndpoint}?${params}`);
            const results = data.results || data || [];
            setCourses(prev => append ? [...prev, ...results] : results);
            setPage(data.page || pg);
            setHasNext(data.has_next || false);
        } catch {
            if (!append) setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint]);

    // Initial load
    useEffect(() => { loadCourses(1, ''); }, [loadCourses]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Resolve selected name
    useEffect(() => {
        if (value) {
            const found = courses.find(c => c.id === parseInt(value));
            if (found) {
                setSelectedName(found.name);
            }
        } else {
            setSelectedName('');
        }
    }, [value, courses]);

    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            loadCourses(1, val, false);
        }, 350);
    };

    const handleScroll = (e) => {
        const el = e.target;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 40 && hasNext && !loading) {
            loadCourses(page + 1, search, true);
        }
    };

    const handleSelect = (course) => {
        onChange(course.id);
        setSelectedName(course.name);
        setOpen(false);
        setSearch('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSelectedName('');
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', ...style }}>
            {label && <label className="form-label">{label}</label>}

            {/* Hidden input for form validation */}
            {required && (
                <input
                    tabIndex={-1}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    value={value || ''}
                    required
                    onChange={() => {}}
                />
            )}

            {/* Trigger button */}
            <div
                onClick={() => setOpen(!open)}
                className="input-field"
                style={{
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: open ? '0' : undefined,
                    borderBottomLeftRadius: open ? 0 : undefined,
                    borderBottomRightRadius: open ? 0 : undefined,
                    userSelect: 'none',
                }}
            >
                <span style={{ color: selectedName ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    {selectedName || placeholder}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {value && (
                        <span onClick={handleClear} style={{
                            cursor: 'pointer', color: 'var(--text-secondary)',
                            fontSize: '1.1rem', lineHeight: 1, padding: '0 2px',
                        }}>×</span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)"
                        strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </div>

            {/* Dropdown panel */}
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'white', border: '1px solid var(--card-border, #e0e0e0)',
                    borderTop: 'none', borderRadius: '0 0 10px 10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                }}>
                    {/* Search */}
                    <div style={{ padding: '8px' }}>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%', padding: '8px 12px', border: '1px solid var(--card-border, #e0e0e0)',
                                borderRadius: '6px', fontSize: '0.88rem', outline: 'none',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    {/* Course list */}
                    <div onScroll={handleScroll} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {courses.length === 0 && !loading && (
                            <div style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {search ? 'No courses found.' : 'No courses available.'}
                            </div>
                        )}
                        {courses.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => handleSelect(c)}
                                style={{
                                    padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem',
                                    background: parseInt(value) === c.id ? 'rgba(51,174,120,0.08)' : 'transparent',
                                    fontWeight: parseInt(value) === c.id ? 600 : 400,
                                    color: parseInt(value) === c.id ? 'var(--accent-green-dark, #228B22)' : 'var(--text-primary)',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { if (parseInt(value) !== c.id) e.target.style.background = 'rgba(0,0,0,0.03)'; }}
                                onMouseLeave={(e) => { if (parseInt(value) !== c.id) e.target.style.background = 'transparent'; }}
                            >
                                {parseInt(value) === c.id ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{verticalAlign:'middle',marginRight:'4px'}}><polyline points="20 6 9 17 4 12"/></svg></> : ''}{c.name}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ padding: '8px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                Loading...
                            </div>
                        )}
                        {hasNext && !loading && (
                            <div
                                onClick={() => loadCourses(page + 1, search, true)}
                                style={{
                                    padding: '6px 16px', textAlign: 'center',
                                    color: 'var(--accent-green, #33ae78)', cursor: 'pointer',
                                    fontSize: '0.82rem', fontWeight: 500,
                                }}
                            >
                                Load more...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
