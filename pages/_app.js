// pages/_app.js
import { useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import InstallPrompt from '../components/InstallPrompt';

function MyApp({ Component, pageProps }) {
  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Produit Academy Classes | Live Academic Portal</title>
        <link rel="icon" href="/logo.png" />
        {/* Animation for install prompt */}
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, 30px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}</style>
      </Head>
      <ul className="floating-elements">
        <li>📚</li>
        <li>✨</li>
        <li>🎓</li>
        <li>💻</li>
        <li>🧠</li>
        <li>✏️</li>
        <li>🎯</li>
        <li>🚀</li>
        <li>💡</li>
        <li>🌍</li>
      </ul>
      <Component {...pageProps} />
      <InstallPrompt />
    </AuthProvider>
  );
}

export default MyApp;