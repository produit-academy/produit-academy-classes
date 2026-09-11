import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 20) {
          headerRef.current.classList.add(styles.scrolled);
        } else {
          headerRef.current.classList.remove(styles.scrolled);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    return `/${user.role}/dashboard`;
  };
  
  const dashboardUrl = getDashboardUrl();

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <Link href="/" className={styles.logo}>
            <img src="/logo.png" alt="Produit Academy Logo" width={26} height={26} style={{ borderRadius: '0px' }} />
            <span className={styles.logoText}>Produit Academy Classes</span>
          </Link>

          <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
            <span className={isMenuOpen ? styles.open : ''}></span>
            <span className={isMenuOpen ? styles.open : ''}></span>
            <span className={isMenuOpen ? styles.open : ''}></span>
          </button>

          <nav className={styles.desktopNav}>
            {/* Navigation links removed per user request */}
          </nav>

          <div className={styles.authButtons}>
            {user ? (
              <div className={styles.dropdown}>
                <button className={styles.dropdownBtn} style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  <div className={styles.avatar}>
                    {(user.first_name || user.username || 'U')[0].toUpperCase()}
                  </div>
                  <span>{user.first_name || user.username}</span>
                  <span style={{ fontSize: '0.75rem' }}>&#9662;</span>
                </button>
                <div className={styles.dropdownContent} style={{ borderRadius: '0px' }}>
                  <Link href={dashboardUrl} style={{ borderRadius: '0px' }}>Dashboard</Link>
                  <a href="#" onClick={handleLogout} style={{ borderRadius: '0px' }}>Logout</a>
                </div>
              </div>
            ) : (
              <Link href="/login" passHref>
                <button className="glass-btn primary" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '0px' }}>
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className={`${styles.overlay} ${isMenuOpen ? styles.open : ''}`} onClick={closeMenu}></div>
      )}

      <div className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <img src="/logo.png" alt="Produit Academy Logo" width={32} height={32} style={{ borderRadius: '0px' }} />
            <button className={styles.closeBtn} onClick={closeMenu}>&times;</button>
          </div>

          <nav className={styles.sidebarNav}>
            {/* Navigation links removed per user request */}
          </nav>

          <div className={styles.sidebarButtons}>
            {user ? (
              <>
                <Link href={dashboardUrl} passHref><button className={styles.sidebarBtnPrimary} onClick={closeMenu}>Dashboard</button></Link>
                <button onClick={(e) => { closeMenu(); handleLogout(e); }} className={styles.sidebarBtnDanger}>Logout</button>
              </>
            ) : (
              <Link href="/login" passHref><button className={styles.sidebarBtnPrimary} onClick={closeMenu}>Login</button></Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}