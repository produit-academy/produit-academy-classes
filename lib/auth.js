import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('access_token');
        if (stored) {
            const decoded = decodeToken(stored);
            if (decoded) {
                setUser(decoded);
                setToken(stored);
            }
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function withAuth(Component, allowedRoles = []) {
    return function ProtectedPage(props) {
        const { user, isLoading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading) {
                if (!user) {
                    router.replace('/login');
                } else if (user.platform !== 'classes' && user.role !== 'admin') {
                    // Ensure gate users don't bypass by having a token in local storage
                    router.replace('/login');
                } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                    // Redirect to the correct dashboard based on their actual role
                    const rolePath = user.role === 'admin' ? '/admin' : `/${user.role}`;
                    router.replace(`${rolePath}/dashboard`);
                }
            }
        }, [user, isLoading, router]);

        if (isLoading) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    <div className="loading-spinner" />
                </div>
            );
        }

        if (!user) return null;
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return null;

        return <Component {...props} />;
    };
}
