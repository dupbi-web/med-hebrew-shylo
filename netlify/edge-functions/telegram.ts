// netlify/edge-functions/telegram.ts
export default async (request: Request) => {
  // Basic CORS support for browser calls
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const token = Netlify.env.get('TELEGRAM_TOKEN');
    const chatId = Netlify.env.get('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      return new Response(JSON.stringify({ error: 'Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Telegram Bot API sendMessage
    const tgResp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        // Optional: parse_mode: 'MarkdownV2' | 'HTML'
      })
    });

    const result = await tgResp.json();

    return new Response(JSON.stringify(result), {
      status: tgResp.ok ? 200 : tgResp.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad request', details: String(e) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

// Inline path declaration for this endpoint
export const config = {
  path: ['/api/telegram']
};
