// lib/api.js - High-performance API client with auto-refresh, SWR caching, request deduplication, and instant cross-platform sync
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Client-side cache for instant renders
const apiCache = new Map();
// In-flight request map to prevent duplicate concurrent network calls
const inFlightMap = new Map();

// Refresh token concurrency lock
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
}

export function clearApiCache(prefix = null) {
    if (!prefix) {
        apiCache.clear();
    } else {
        for (const key of apiCache.keys()) {
            if (key.startsWith(prefix)) {
                apiCache.delete(key);
            }
        }
    }
}

// Broadcast cross-component / cross-tab sync event
export function broadcastSync(detail = {}) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('produit:sync', { detail }));
    }
}

// Subscribe to platform-wide sync events
export function onPlatformSync(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (e) => callback(e.detail);
    window.addEventListener('produit:sync', handler);
    return () => window.removeEventListener('produit:sync', handler);
}

async function attemptTokenRefresh() {
    if (typeof window === 'undefined') return null;
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
        const res = await fetch(`${API_BASE}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.access) {
                localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
                return data.access;
            }
        }
    } catch (e) {
        console.error('Failed to refresh token', e);
    }
    return null;
}

export async function apiFetch(endpoint, options = {}, isRetry = false) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401 && !isRetry) {
        // Attempt transparent token refresh
        if (typeof window !== 'undefined') {
            if (!isRefreshing) {
                isRefreshing = true;
                const newToken = await attemptTokenRefresh();
                isRefreshing = false;

                if (newToken) {
                    onRefreshed(newToken);
                    return apiFetch(endpoint, options, true);
                } else {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
            } else {
                // Wait for the in-flight refresh to finish
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((newToken) => {
                        if (newToken) {
                            resolve(apiFetch(endpoint, options, true));
                        } else {
                            reject(new Error('Session expired'));
                        }
                    });
                });
            }
        }
    }

    return res;
}

/**
 * apiGet: Supports in-flight deduplication and Stale-While-Revalidate caching.
 * @param {string} endpoint - API endpoint
 * @param {object} opts - { useCache, ttl, forceRefresh }
 */
export async function apiGet(endpoint, { useCache = false, ttl = 60000, forceRefresh = false } = {}) {
    const isCatalog = endpoint.startsWith('/api/classes/courses') || endpoint.startsWith('/api/classes/subjects');
    const shouldCache = (useCache || isCatalog) && !forceRefresh;
    const now = Date.now();

    // 1. Check local cache
    if (shouldCache && apiCache.has(endpoint)) {
        const cached = apiCache.get(endpoint);
        if (now < cached.expiresAt) {
            return cached.data;
        }
        apiCache.delete(endpoint);
    }

    // 2. In-flight request deduplication
    if (inFlightMap.has(endpoint)) {
        return inFlightMap.get(endpoint);
    }

    const requestPromise = (async () => {
        try {
            const res = await apiFetch(endpoint);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();

            if (shouldCache) {
                apiCache.set(endpoint, { data, expiresAt: Date.now() + ttl });
            }

            return data;
        } finally {
            inFlightMap.delete(endpoint);
        }
    })();

    inFlightMap.set(endpoint, requestPromise);
    return requestPromise;
}

export async function apiPost(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
    });

    if (res.ok) {
        clearApiCache();
        broadcastSync({ type: 'POST', endpoint });
    }
    return res;
}

export async function apiPut(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (res.ok) {
        clearApiCache();
        broadcastSync({ type: 'PUT', endpoint });
    }
    return res;
}

export async function apiPatch(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

    if (res.ok) {
        clearApiCache();
        broadcastSync({ type: 'PATCH', endpoint });
    }
    return res;
}

export async function apiDelete(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'DELETE',
        ...(data ? { body: JSON.stringify(data) } : {}),
    });

    if (res.ok) {
        clearApiCache();
        broadcastSync({ type: 'DELETE', endpoint });
    }
    return res;
}
