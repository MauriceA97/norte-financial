// Norte Financial — Newsletter subscribe edge function
// =====================================================
//
// Replaces direct client-side Supabase write. Does three things:
//   1. Validates + sanitizes the payload
//   2. Writes to `newsletter_subscribers` table
//   3. Fires a welcome email via Resend (only if RESEND_API_KEY is set)
//
// When RESEND_API_KEY env var is absent, the endpoint still writes the
// subscriber to Supabase (current behavior preserved) and returns success.
// This means the form works TODAY even before Maurice sets up Resend; adding
// the key later activates emails retroactively for new subscribers.
//
// Env vars (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY       — from resend.com/api-keys
//   RESEND_FROM_EMAIL    — e.g., "Norte Financial <hola@nortefinancial.com>"
//                           Domain must be verified in Resend first.
//   RESEND_REPLY_TO      — (optional) reply-to address
//
// Usage from front-end:
//   fetch('/api/newsletter-subscribe', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, preferred_language, ...attribution })
//   })

const SUPABASE_URL = 'https://agodvsflcfhfcxtlykpf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2R2c2ZsY2ZoZmN4dGx5a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU2NTMsImV4cCI6MjA5MTMzMTY1M30.KDg8lPRPfyMXYQ6SQK3LcoIhSFqNZBAELlJIUWRC9mw';

// ---------- Welcome email templates (inline — no external files) ----------
// Keyed by (lead_magnet + language). Lead magnets map to topic-specific
// sequences; first email in each sequence is the "welcome." Subsequent
// emails in the drip are stored in /emails/ and queued via cron or
// Supabase triggers (see /api/send-email.js).
const WELCOME_EMAILS = {
  // Generic (default) welcome for bottom bar + exit-intent
  'weekly-newsletter_es': {
    subject: '¡Bienvenido a Norte Financial! Tu norte financiero empieza aquí 🧭',
    html: `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F7F5F1;font-family:'DM Sans',-apple-system,Helvetica,sans-serif;color:#1A1A1A">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
  <div style="background:#0B3D2E;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <div style="color:#fff;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:500">Norte</div>
    <div style="color:rgba(232,245,240,0.6);font-size:10px;letter-spacing:0.18em;text-transform:uppercase">Financial</div>
  </div>
  <div style="background:#fff;padding:40px 32px;border-radius:0 0 12px 12px;border:1px solid rgba(11,61,46,0.08);border-top:0">
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:500;margin:0 0 16px;color:#0B3D2E;line-height:1.2">¡Bienvenido a Norte Financial!</h1>
    <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 20px">Gracias por confiar en nosotros. Desde ahora recibirás <strong style="color:#1A1A1A">una guía bilingüe por semana</strong> con lo esencial que toda familia hispana en EE.UU. necesita saber sobre:</p>
    <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:20px;margin:0 0 24px">
      <li><strong>Crédito</strong> — cómo construirlo sin historial, sin SSN</li>
      <li><strong>Banca</strong> — cuentas que aceptan ITIN, sin cargos ocultos</li>
      <li><strong>Remesas</strong> — cómo ahorrar $500+ al año enviando dinero</li>
      <li><strong>Impuestos</strong> — ITIN, EITC, Child Tax Credit</li>
      <li><strong>Hipotecas</strong> — cómo comprar casa con ITIN (sí, se puede)</li>
      <li><strong>Préstamos</strong> — opciones para quien apenas empieza</li>
    </ul>
    <div style="background:#E8F5F0;border-left:4px solid #1D9E75;padding:18px 22px;border-radius:8px;margin:0 0 24px">
      <p style="margin:0;font-size:14px;line-height:1.7;color:#0B3D2E"><strong>Empieza por aquí:</strong> nuestra calculadora de remesas te muestra en segundos cuánto dinero estás perdiendo con Western Union. En promedio, $300 al año.</p>
    </div>
    <div style="text-align:center;margin:32px 0">
      <a href="https://nortefinancial.com/calculadora-remesas.html?utm_source=welcome_email&utm_medium=email&utm_campaign=welcome_es" style="display:inline-block;padding:14px 28px;background:#D4700A;color:#fff;text-decoration:none;border-radius:100px;font-weight:500;font-size:15px">Ver cuánto puedo ahorrar →</a>
    </div>
    <p style="font-size:14px;line-height:1.7;color:#7A7A7A;margin:24px 0 0;border-top:1px solid rgba(11,61,46,0.08);padding-top:20px">— Equipo Editorial Norte Financial<br>Miami, FL · <a href="https://nortefinancial.com" style="color:#1D9E75">nortefinancial.com</a></p>
  </div>
  <p style="font-size:11px;color:#9A9A9A;text-align:center;padding:16px 0 0;line-height:1.6">Recibes este correo porque te suscribiste en nortefinancial.com. <a href="{{unsubscribe_url}}" style="color:#9A9A9A;text-decoration:underline">Darse de baja</a></p>
</div>
</body></html>
    `.trim()
  },
  'weekly-newsletter_en': {
    subject: 'Welcome to Norte Financial! Your financial compass starts here 🧭',
    html: `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F7F5F1;font-family:'DM Sans',-apple-system,Helvetica,sans-serif;color:#1A1A1A">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
  <div style="background:#0B3D2E;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <div style="color:#fff;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:500">Norte</div>
    <div style="color:rgba(232,245,240,0.6);font-size:10px;letter-spacing:0.18em;text-transform:uppercase">Financial</div>
  </div>
  <div style="background:#fff;padding:40px 32px;border-radius:0 0 12px 12px;border:1px solid rgba(11,61,46,0.08);border-top:0">
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:500;margin:0 0 16px;color:#0B3D2E;line-height:1.2">Welcome to Norte Financial!</h1>
    <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 20px">Thanks for trusting us. From now on you'll receive <strong style="color:#1A1A1A">one bilingual guide per week</strong> on what every Hispanic family in the US needs to know about:</p>
    <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:20px;margin:0 0 24px">
      <li><strong>Credit</strong> — building it without history, without SSN</li>
      <li><strong>Banking</strong> — ITIN-friendly accounts, no hidden fees</li>
      <li><strong>Remittances</strong> — how to save $500+/year sending money</li>
      <li><strong>Taxes</strong> — ITIN, EITC, Child Tax Credit</li>
      <li><strong>Mortgages</strong> — yes, you can buy a house with ITIN</li>
      <li><strong>Loans</strong> — options for those just starting out</li>
    </ul>
    <div style="background:#E8F5F0;border-left:4px solid #1D9E75;padding:18px 22px;border-radius:8px;margin:0 0 24px">
      <p style="margin:0;font-size:14px;line-height:1.7;color:#0B3D2E"><strong>Start here:</strong> our remittance calculator shows you in seconds how much money you're losing with Western Union. On average, $300 per year.</p>
    </div>
    <div style="text-align:center;margin:32px 0">
      <a href="https://nortefinancial.com/calculadora-remesas.html?utm_source=welcome_email&utm_medium=email&utm_campaign=welcome_en" style="display:inline-block;padding:14px 28px;background:#D4700A;color:#fff;text-decoration:none;border-radius:100px;font-weight:500;font-size:15px">See how much I can save →</a>
    </div>
    <p style="font-size:14px;line-height:1.7;color:#7A7A7A;margin:24px 0 0;border-top:1px solid rgba(11,61,46,0.08);padding-top:20px">— Norte Financial Editorial Team<br>Miami, FL · <a href="https://nortefinancial.com" style="color:#1D9E75">nortefinancial.com</a></p>
  </div>
  <p style="font-size:11px;color:#9A9A9A;text-align:center;padding:16px 0 0;line-height:1.6">You're receiving this because you signed up at nortefinancial.com. <a href="{{unsubscribe_url}}" style="color:#9A9A9A;text-decoration:underline">Unsubscribe</a></p>
</div>
</body></html>
    `.trim()
  }
};

function sanitizeEmail(e) {
  if (typeof e !== 'string') return null;
  const t = e.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return null;
  if (t.length > 254) return null;
  return t;
}

function sanitizeStr(v, max) {
  if (typeof v !== 'string') return null;
  return v.slice(0, max || 512);
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

async function writeSubscriber(payload) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
  // 409 = duplicate email (unique index). We treat as soft-success: they're
  // already subscribed — don't resend welcome, but return OK.
  return { ok: r.ok, duplicate: r.status === 409, status: r.status };
}

async function sendWelcomeEmail({ email, language, leadMagnet, subscriberId }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: 'no-api-key' };

  const from = process.env.RESEND_FROM_EMAIL || 'Norte Financial <hola@nortefinancial.com>';
  const replyTo = process.env.RESEND_REPLY_TO || 'hola@nortefinancial.com';

  const key = (leadMagnet || 'weekly-newsletter') + '_' + (language === 'en' ? 'en' : 'es');
  const tpl = WELCOME_EMAILS[key] || WELCOME_EMAILS['weekly-newsletter_' + (language === 'en' ? 'en' : 'es')];
  if (!tpl) return { skipped: 'no-template' };

  const unsubscribe = `https://nortefinancial.com/api/unsubscribe?e=${encodeURIComponent(email)}`;
  const html = tpl.html.replace(/\{\{unsubscribe_url\}\}/g, unsubscribe);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: replyTo,
        subject: tpl.subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribe}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        tags: [
          { name: 'type', value: 'welcome' },
          { name: 'magnet', value: leadMagnet || 'weekly-newsletter' },
          { name: 'lang', value: language === 'en' ? 'en' : 'es' }
        ]
      })
    });
    if (!r.ok) {
      const body = await r.text();
      console.error('resend error', r.status, body);
      return { sent: false, error: 'resend-' + r.status };
    }
    return { sent: true };
  } catch (e) {
    console.error('resend exception', e);
    return { sent: false, error: 'exception' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing body' });
  }

  const email = sanitizeEmail(body.email);
  if (!email) return res.status(400).json({ error: 'Invalid email' });

  const language = body.preferred_language === 'en' ? 'en' : 'es';
  const leadMagnet = sanitizeStr(body.lead_magnet, 64) || 'weekly-newsletter';

  const payload = {
    email,
    preferred_language: language,
    source_page:    sanitizeStr(body.source_page, 512),
    capture_type:   sanitizeStr(body.capture_type, 64),
    lead_magnet:    leadMagnet,
    visitor_id:     sanitizeStr(body.visitor_id, 64),
    session_id:     sanitizeStr(body.session_id, 64),
    user_agent:     sanitizeStr(body.user_agent, 512) || (typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 512) : null),
    referrer:       sanitizeStr(body.referrer, 2000),
    utm_source:     sanitizeStr(body.utm_source, 128),
    utm_medium:     sanitizeStr(body.utm_medium, 128),
    utm_campaign:   sanitizeStr(body.utm_campaign, 128),
    utm_content:    sanitizeStr(body.utm_content, 128),
    utm_term:       sanitizeStr(body.utm_term, 128),
    ip_address:     getClientIp(req),
    subscribed_at:  new Date().toISOString()
  };

  // 1. Write to Supabase
  const write = await writeSubscriber(payload);
  if (!write.ok && !write.duplicate) {
    console.error('newsletter-subscribe supabase error', write.status);
    return res.status(502).json({ error: 'Upstream write failed' });
  }

  // 2. Fire welcome email (only if not a duplicate and RESEND_API_KEY is set)
  let emailResult = { skipped: 'duplicate' };
  if (!write.duplicate) {
    emailResult = await sendWelcomeEmail({ email, language, leadMagnet });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    duplicate: write.duplicate,
    email_sent: !!emailResult.sent,
    email_status: emailResult.sent ? 'sent' : (emailResult.skipped || emailResult.error || 'unknown')
  });
}
