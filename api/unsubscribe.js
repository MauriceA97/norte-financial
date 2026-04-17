// Norte Financial — Unsubscribe endpoint
// =======================================
//
// Handles both:
//   - GET  /api/unsubscribe?e=user@example.com   (click from email footer)
//   - POST /api/unsubscribe  (RFC 8058 one-click, required by Gmail/Yahoo)
//
// Marks the subscriber as unsubscribed in Supabase. We don't delete — keeps
// the record for analytics but sets unsubscribed_at timestamp so the email
// sender stops including them.
//
// Returns a plain HTML confirmation page on GET (bilingual).

const SUPABASE_URL = 'https://agodvsflcfhfcxtlykpf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2R2c2ZsY2ZoZmN4dGx5a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU2NTMsImV4cCI6MjA5MTMzMTY1M30.KDg8lPRPfyMXYQ6SQK3LcoIhSFqNZBAELlJIUWRC9mw';

function sanitizeEmail(e) {
  if (typeof e !== 'string') return null;
  const t = e.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return null;
  if (t.length > 254) return null;
  return t;
}

async function markUnsubscribed(email) {
  const now = new Date().toISOString();
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ unsubscribed_at: now, status: 'unsubscribed' })
      }
    );
    return r.ok;
  } catch (e) {
    console.error('unsubscribe error', e);
    return false;
  }
}

function confirmationPage(email, success) {
  const status = success ? 'ok' : 'error';
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Unsubscribe — Norte Financial</title>
<link rel="stylesheet" href="/shared.css">
<style>
  body{margin:0;background:#F7F5F1;font-family:'DM Sans',-apple-system,sans-serif;color:#1A1A1A;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  .card{background:#fff;max-width:480px;width:100%;padding:48px 40px;border-radius:16px;border:1px solid rgba(11,61,46,0.08);text-align:center}
  .icon{width:56px;height:56px;margin:0 auto 20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px}
  .icon.ok{background:rgba(29,158,117,0.12);color:#1D9E75}
  .icon.error{background:rgba(212,112,10,0.12);color:#D4700A}
  h1{font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:500;color:#0B3D2E;margin:0 0 12px}
  p{font-size:15px;line-height:1.65;color:#4A4A4A;margin:0 0 8px}
  .email{font-family:monospace;background:#F7F5F1;padding:4px 10px;border-radius:6px;font-size:13px;color:#1A1A1A;display:inline-block;margin:4px 0}
  a{display:inline-block;margin-top:24px;padding:12px 24px;background:#0B3D2E;color:#fff;text-decoration:none;border-radius:100px;font-size:14px;font-weight:500}
  a:hover{background:#1D9E75}
</style>
</head>
<body>
<div class="card">
  ${success
    ? `<div class="icon ok">✓</div>
       <h1>Te diste de baja</h1>
       <p>No recibirás más correos de Norte Financial en:</p>
       <p><span class="email">${email.replace(/[<>"&']/g, c => ({ '<':'&lt;', '>':'&gt;', '"':'&quot;', '&':'&amp;', "'":'&#39;' }[c]))}</span></p>
       <p style="margin-top:16px;font-size:13px;color:#7A7A7A">¿Te diste de baja por error? Escríbenos a <a href="mailto:hola@nortefinancial.com" style="display:inline;padding:0;background:none;color:#1D9E75;font-size:13px;font-weight:400">hola@nortefinancial.com</a> y te reactivamos.</p>
       <a href="https://nortefinancial.com">Volver a Norte Financial</a>`
    : `<div class="icon error">!</div>
       <h1>Algo falló</h1>
       <p>No pudimos procesar tu solicitud. Por favor escríbenos a <a href="mailto:hola@nortefinancial.com" style="display:inline;padding:0;background:none;color:#1D9E75;font-size:13px;font-weight:400">hola@nortefinancial.com</a> y te damos de baja manualmente.</p>
       <a href="https://nortefinancial.com">Volver a Norte Financial</a>`
  }
</div>
</body>
</html>`;
}

export default async function handler(req, res) {
  // RFC 8058 one-click: Gmail/Yahoo POST to this URL from their UI
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {
        // one-click uses application/x-www-form-urlencoded sometimes
        const params = new URLSearchParams(body);
        body = Object.fromEntries(params.entries());
      }
    }
    const email = sanitizeEmail((body && body.e) || (body && body.email));
    if (!email) return res.status(400).json({ error: 'Invalid email' });
    const ok = await markUnsubscribed(email);
    return res.status(ok ? 200 : 502).json({ ok });
  }

  // GET: user clicked the unsubscribe link in an email
  if (req.method === 'GET') {
    const email = sanitizeEmail((req.query && req.query.e) || '');
    if (!email) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(confirmationPage('', false));
    }
    const ok = await markUnsubscribed(email);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(ok ? 200 : 502).send(confirmationPage(email, ok));
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
