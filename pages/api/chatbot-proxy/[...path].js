// pages/api/chatbot-proxy/[...path].js
// Server-side proxy for Produit Academy chatbot to eliminate cross-origin (CORS) blocks
// and provide reliable communication between the client widget and the Render chatbot backend.

export const config = {
  api: {
    bodyParser: false, // Handle raw streaming chunks directly
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  // Always permit same-origin and safe cross-origin preflight requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;
  const subPath = Array.isArray(path) ? path.join('/') : (path || '');
  const CHATBOT_BASE = (process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://produit-academy-chatbot.onrender.com').replace(/\/+$/, '');

  // Retain query parameters if any were passed
  const queryIdx = req.url.indexOf('?');
  const qs = queryIdx !== -1 ? req.url.slice(queryIdx) : '';

  // Ensure trailing slash for Django/Python endpoints
  const formattedPath = subPath ? (subPath.endsWith('/') ? subPath : `${subPath}/`) : '';
  const targetUrl = `${CHATBOT_BASE}/api/${formattedPath}${qs}`;

  try {
    const headers = {};
    if (req.headers.authorization) headers['authorization'] = req.headers.authorization;
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
    if (req.headers.accept) headers['accept'] = req.headers.accept;

    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const body = hasBody ? await getRawBody(req) : undefined;

    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const contentType = proxyRes.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const resBuffer = await proxyRes.arrayBuffer();
    return res.status(proxyRes.status).send(Buffer.from(resBuffer));
  } catch (error) {
    console.error('[Chatbot Proxy Error]:', error);
    return res.status(502).json({
      error: 'Chatbot service temporarily unavailable',
      detail: error.message,
    });
  }
}
