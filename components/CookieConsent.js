import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('produit_classes_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleConsent = (choice) => {
    try {
      localStorage.setItem('produit_classes_cookie_consent', choice);
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      role="region"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '560px',
        margin: '0 auto',
        zIndex: 9999,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderRadius: '14px',
        boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#eaf7f0',
            color: '#33ae78',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
            Privacy & Cookie Preferences
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            We use essential cookies to keep you signed in, sync class schedules, and protect student attendance. Read our{' '}
            <Link href="/privacy-policy" style={{ color: '#33ae78', textDecoration: 'underline', fontWeight: 500 }}>
              Privacy Policy
            </Link>.
          </p>
        </div>
        <button
          onClick={() => handleConsent('dismissed')}
          aria-label="Dismiss cookie notice"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleConsent('essential')}
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => handleConsent('all')}
          style={{
            padding: '8px 18px',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#33ae78',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Accept All
        </button>
      </div>
    </aside>
  );
}
