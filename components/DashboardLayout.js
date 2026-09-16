// components/DashboardLayout.js - 70% Minimalist + 20% Futuristic + 10% Playful
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
    LayoutGrid, BookOpen, Calendar, Wallet, User,
    LifeBuoy, LogOut, Menu, X, Activity, Users, Plus, ShieldCheck,
    FileText, CreditCard
} from 'lucide-react';

const NAV_ITEMS = {
    student: [
        { label: 'Dashboard', href: '/student/dashboard', icon: LayoutGrid },
        { label: 'Browse Classes', href: '/courses', icon: BookOpen },
        { label: 'My Bookings', href: '/student/bookings', icon: Calendar },
        { label: 'Payments', href: '/student/payments', icon: Wallet },
        { label: 'My Profile', href: '/student/profile', icon: User },
        { label: 'Help Center', href: '/help-center', icon: LifeBuoy },
    ],
    teacher: [
        { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutGrid },
        { label: 'Reports & Notes', href: '/teacher/reports', icon: FileText },
        { label: 'Manage Profile', href: '/teacher/manage-profile', icon: User },
        { label: 'My Availability', href: '/teacher/availability', icon: Calendar },
        { label: 'My Bookings', href: '/teacher/bookings', icon: BookOpen },
        { label: 'Student Analysis', href: '/analysis', icon: Activity },
        { label: 'My Wallet', href: '/wallet', icon: Wallet },
    ],
    admin: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
        { label: 'Payment Audit', href: '/admin/payments', icon: CreditCard },
        { label: 'Students', href: '/admin/students', icon: Users },
        { label: 'Courses', href: '/admin/courses', icon: BookOpen },
        { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
        { label: 'Teachers', href: '/admin/staff', icon: Users },
        { label: 'Enrollments', href: '/admin/enrollments', icon: Users },
        { label: 'Enquiries', href: '/admin/contacts', icon: LifeBuoy },
    ],
};

const ROLE_LABELS = {
    student: 'Student // Portal',
    teacher: 'Faculty // Portal',
    admin: 'Admin // Control',
};

export default function DashboardLayout({ children, title }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const role = user?.role || 'student';
    const navItems = NAV_ITEMS[role] || NAV_ITEMS.student;

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="dashboard-wrapper">
            {/* Mobile menu toggle */}
            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                style={{ borderRadius: '0px' }}
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ borderRadius: '0px' }}>
                <div className="sidebar-brand">
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '0px',
                        background: 'var(--accent-green)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: '#ffffff',
                        fontWeight: 800, fontSize: '1rem'
                    }}>
                        P
                    </div>
                    <span style={{ fontWeight: 800, letterSpacing: '-0.3px' }}>Produit Classes</span>
                </div>

                {/* Futuristic HUD Role Badge */}
                <div style={{
                    margin: '16px 20px 8px',
                    padding: '6px 12px',
                    background: '#f1f5f9',
                    color: '#334155',
                    borderRadius: '0px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderLeft: '3px solid var(--accent-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span>{ROLE_LABELS[role]}</span>
                    <span className="live-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '0px' }} />
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = router.pathname === item.href;
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                style={{
                                    borderRadius: '0px',
                                    borderLeft: isActive ? '3px solid var(--accent-green-dark)' : '3px solid transparent',
                                    transition: 'all 0.15s ease'
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSidebarOpen(false);
                                    router.push(item.href);
                                }}
                            >
                                <IconComponent size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>

                <div className="sidebar-footer" style={{ borderTop: '1px solid #e2e8f0', borderRadius: '0px' }}>
                    <div className="sidebar-user">
                        <div className="sidebar-avatar" style={{ borderRadius: '0px', background: '#0f172a', color: '#ffffff' }}>
                            {(user?.first_name || user?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-username">
                                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username?.split('@')[0])}
                            </span>
                        </div>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout} style={{ borderRadius: '0px' }}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-header" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid #e2e8f0', paddingBottom: '18px', marginBottom: '24px'
                }}>
                    <h1 className="dashboard-title" style={{ fontFamily: "'Lora', serif", fontWeight: 700, margin: 0 }}>
                        {title}
                    </h1>
                    <div className="telemetry-chip live" style={{ display: 'none' }}>
                        <span>Academic Network Connected</span>
                    </div>
                </div>
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
