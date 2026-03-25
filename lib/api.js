const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

export async function apiGet(endpoint) {
    const res = await apiFetch(endpoint);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
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

export async function apiDelete(endpoint) {
    const res = await apiFetch(endpoint, { method: 'DELETE' });
    return res;
}
