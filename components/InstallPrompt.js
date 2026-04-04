import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed it before (respect for 7 days)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isApple);

    if (isApple) {
      // iOS doesn't fire beforeinstallprompt, show manual instructions after 2s
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome - listen for the install prompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show our custom prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={handleDismiss} />

      {/* Prompt Card */}
      <div style={styles.container}>
        {/* Close button */}
        <button style={styles.closeBtn} onClick={handleDismiss} aria-label="Dismiss">
          ×
        </button>

        {/* App icon + info */}
        <div style={styles.header}>
          <img src="/logo.png" alt="Produit Classes" width={56} height={56} style={styles.icon} />
          <div>
            <h3 style={styles.title}>Install Produit Classes</h3>
            <p style={styles.subtitle}>Get quick access from your home screen</p>
          </div>
        </div>

        {isIOS ? (
          /* iOS Instructions */
          <div style={styles.iosInstructions}>
            <p style={styles.iosStep}>
              <span style={styles.stepIcon}>1</span>
              Tap the <strong>Share</strong> button
              <span style={styles.shareIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#33ae78" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>
            </p>
            <p style={styles.iosStep}>
              <span style={styles.stepIcon}>2</span>
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </p>
          </div>
        ) : (
          /* Android / Chrome Install Button */
          <button style={styles.installBtn} onClick={handleInstall}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install App
          </button>
        )}

        {/* Benefits */}
        <div style={styles.benefits}>
          <span style={styles.benefit}>⚡ Instant access</span>
          <span style={styles.benefit}>📱 Works offline</span>
          <span style={styles.benefit}>🔔 Full screen</span>
        </div>
      </div>
    </>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    zIndex: 9998,
    backdropFilter: 'blur(2px)',
  },
  container: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '400px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.8) inset',
    zIndex: 9999,
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '14px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#999',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '4px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '18px',
  },
  icon: {
    borderRadius: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#212121',
    margin: 0,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#777',
    margin: '2px 0 0',
  },
  installBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #33ae78, #228B22)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 16px rgba(51,174,120,0.3)',
  },
  iosInstructions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '4px',
  },
  iosStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.92rem',
    color: '#444',
    margin: 0,
  },
  stepIcon: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #33ae78, #228B22)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  shareIcon: {
    display: 'inline-flex',
    marginLeft: '4px',
    verticalAlign: 'middle',
  },
  benefits: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  benefit: {
    fontSize: '0.75rem',
    color: '#888',
    background: 'rgba(51,174,120,0.06)',
    padding: '4px 10px',
    borderRadius: '20px',
  },
};
