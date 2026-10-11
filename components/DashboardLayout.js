// components/DashboardLayout.js - Professional Learning Platform Shell
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    LayoutGrid, BookOpen, Calendar, Wallet, User,
    LifeBuoy, LogOut, Menu, X, Activity, Users, ShieldCheck,
    FileText, CreditCard, GraduationCap, ChevronRight
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
        { label: 'Class Analysis', href: '/teacher/class-analysis', icon: Activity },
    ],
    admin: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
        { label: 'Payment Audit', href: '/admin/payments', icon: CreditCard },
        { label: 'Students', href: '/admin/students', icon: Users },
        { label: 'Courses', href: '/admin/courses', icon: BookOpen },
        { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
        { label: 'Teachers', href: '/admin/staff', icon: Users },
        { label: 'Enquiries', href: '/admin/contacts', icon: LifeBuoy },
    ],
};

const PORTAL_LABELS = {
    student: { title: 'Student Portal', badge: 'Student' },
    teacher: { title: 'Faculty Portal', badge: 'Faculty' },
    admin: { title: 'Admin Console', badge: 'Administrator' },
};

export default function DashboardLayout({ children, title, subtitle }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const role = user?.role || 'student';
    const navItems = NAV_ITEMS[role] || NAV_ITEMS.student;
    const portalInfo = PORTAL_LABELS[role] || PORTAL_LABELS.student;

    // Close sidebar on route change
    useEffect(() => {
        const handleRouteChange = () => setSidebarOpen(false);
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => router.events.off('routeChangeComplete', handleRouteChange);
    }, [router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const userInitial = (user?.first_name || user?.username || 'U')[0].toUpperCase();
    const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username?.split('@')[0] || 'User');

    return (
        <div className="dashboard-wrapper">
            {/* Mobile Top Navigation Bar (< 768px) */}
            <header className="mobile-topbar">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <div className="mobile-brand">
                    <img src="/logo.png" alt="Produit Academy Logo" width={26} height={26} style={{ borderRadius: '6px', objectFit: 'contain' }} />
                    <span className="brand-title">Produit Academy</span>
                </div>

                <div className="mobile-user-avatar">
                    {userInitial}
                </div>
            </header>

            {/* Sidebar backdrop overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Main Application Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Brand Logo & Title */}
                <div className="sidebar-brand-wrapper">
                    <Link href="/" className="sidebar-brand-link">
                        <img src="/logo.png" alt="Produit Academy Logo" width={34} height={34} style={{ borderRadius: '8px', objectFit: 'contain', flexShrink: 0 }} />
                        <div className="sidebar-brand-text">
                            <span className="brand-name">Produit Academy</span>
                            <span className="brand-sub">Live Learning Platform</span>
                        </div>
                    </Link>

                    {/* Mobile close button inside drawer */}
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Portal Mode Tag */}
                <div className="sidebar-portal-tag">
                    <span className="portal-badge-pill">
                        {portalInfo.title}
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = router.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <IconComponent size={19} className="nav-icon" />
                                <span className="nav-label">{item.label}</span>
                                {isActive && <ChevronRight size={14} className="nav-active-arrow" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar User Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-card">
                        <div className="sidebar-user-avatar">
                            {userInitial}
                        </div>
                        <div className="sidebar-user-details">
                            <span className="sidebar-user-name" title={displayName}>
                                {displayName}
                            </span>
                            <span className="sidebar-user-role">
                                {portalInfo.badge}
                            </span>
                        </div>
                    </div>

                    <button
                        className="sidebar-logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="dashboard-header-left">
                        <h1 className="dashboard-title">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="dashboard-subtitle">{subtitle}</p>
                        )}
                    </div>
                </header>

                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
