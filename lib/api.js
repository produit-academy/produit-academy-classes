const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Client-side cache for high-frequency static/catalog endpoints
const apiCache = new Map();

export function clearApiCache() {
    apiCache.clear();
}

export async function apiFetch(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // If body is FormData, remove Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    return res;
}

export async function apiGet(endpoint, { useCache = false, ttl = 30000 } = {}) {
    const shouldCache = useCache || endpoint.startsWith('/api/classes/courses') || endpoint.startsWith('/api/classes/subjects');
    const now = Date.now();

    if (shouldCache && apiCache.has(endpoint)) {
        const cached = apiCache.get(endpoint);
        if (now < cached.expiresAt) {
            return cached.data;
        }
        apiCache.delete(endpoint);
    }

    const res = await apiFetch(endpoint);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();

    if (shouldCache) {
        apiCache.set(endpoint, { data, expiresAt: now + ttl });
    }

    return data;
}

export async function apiPost(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return res;
}

export async function apiPut(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res;
}

export async function apiDelete(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'DELETE',
        ...(data ? { body: JSON.stringify(data) } : {}),
    });
    return res;
}

export async function apiPatch(endpoint, data) {
    const res = await apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return res;
}
