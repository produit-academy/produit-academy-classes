import Script from 'next/script';

// Learning-assistant chatbot (separate service). Renders nothing unless
// NEXT_PUBLIC_CHATBOT_URL is set, e.g. https://produit-chatbot.onrender.com
const CHATBOT_URL = (process.env.NEXT_PUBLIC_CHATBOT_URL || '').replace(/\/+$/, '');
const SITE_API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');

export default function ChatbotWidget() {
  if (!CHATBOT_URL || !SITE_API) return null;
  return (
    <Script
      id="produit-chatbot"
      src={`${CHATBOT_URL}/static/widget.js`}
      strategy="lazyOnload"
      data-api={`${CHATBOT_URL}/api`}
      data-token-url={`${SITE_API}/api/chatbot/token/`}
      data-auth-key="access_token"
    />
  );
}
