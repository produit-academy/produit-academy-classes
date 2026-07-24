import React from "react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Custom404() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>404 - Page Not Found | Produit Classes</title>
      </Head>
      <Header />
      <main className="main-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px', width: '100%', padding: '40px 20px', margin: '20px' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem', color: 'var(--accent-green)', fontWeight: 700 }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Page Not Found</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            We couldn't find the page you're looking for. It might be under construction or have been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="glass-btn primary"
            style={{ padding: '12px 30px' }}
          >
            Go to Homepage
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
