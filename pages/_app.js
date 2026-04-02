// pages/_app.js
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Produit Academy Classes | Live Academic Portal</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <ul className="floating-elements">
        <li>📚</li>
        <li>✨</li>
        <li>🎓</li>
        <li>💻</li>
        <li>✏️</li>
        <li>🧠</li>
        <li>🎯</li>
        <li>🚀</li>
        <li>💡</li>
        <li>🌍</li>
      </ul>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;