// pages/_app.js
import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import InstallPrompt from '../components/InstallPrompt';
import ChatbotWidget from '../components/ChatbotWidget';
import CookieConsent from '../components/CookieConsent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

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
        <title>Produit Academy Classes | 1:1 Live Tuition & Academic Portal</title>
        <meta
          name="description"
          content="Student learning portal for 1:1 live interactive classes, dedicated teacher mentorship, attendance tracking, and syllabus progress."
        />
        <link rel="icon" href="/favicon.ico" />
        {/* Animation for install prompt */}
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, 30px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}</style>
      </Head>

      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-classes" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      <Component {...pageProps} />
      <InstallPrompt />
      <ChatbotWidget />
      <CookieConsent />
    </AuthProvider>
  );
}

export default MyApp;