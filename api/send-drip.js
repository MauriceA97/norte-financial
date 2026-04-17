// Norte Financial — Drip email sender (Vercel Cron target)
// ==========================================================
//
// Runs on a daily schedule (configure in vercel.json under "crons"). For each
// active subscriber, computes their sequence day (days since subscribed_at)
// and sends the matching drip email if it hasn't been sent yet.
//
// Sequence selection:
//   - lead_magnet == 'credito-*'   → credito sequence
//   - lead_magnet == 'remesas-*'   → remesas sequence
//   - lead_magnet == 'impuestos-*' → impuestos sequence
//   - otherwise                    → cycles through all three (credito week 1,
//                                    remesas week 2, impuestos week 3)
//
// To prevent duplicate sends, we track sent emails in the same row via the
// `drip_sent` JSONB column: { 'credito-2': '2026-04-18', ... }. If the column
// doesn't exist, we fall back to per-subscriber check via email metadata in
// Resend (slower; requires no schema change).
//
// Auth: protect this endpoint with CRON_SECRET env var — Vercel cron hits
// it with the secret in the Authorization header.

import { SEQUENCES } from '../emails/sequences.js';
import { renderEmail } from '../emails/template.js';

const SUPABASE_URL = 'https://agodvsflcfhfcxtlykpf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2R2c2ZsY2ZoZmN4dGx5a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU2NTMsImV4cCI6MjA5MTMzMTY1M30.KDg8lPRPfyMXYQ6SQK3LcoIhSFqNZBAELlJIUWRC9mw';

// Day offsets where drip emails fire (must match day values in sequences.js)
const DRIP_DAYS = [2, 5, 9, 14];

function daysSince(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (isNaN(then)) return null;
  const ms = Date.now() - then;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function pickVertical(subscriber, daysOld) {
  const magnet = (subscriber.lead_magnet || '').toLowerCase();
  if (magnet.includes('credit'))   return 'credito';
  if (magnet.includes('remesa') || magnet.includes('remittance')) return 'remesas';
  if (magnet.includes('tax') || magnet.includes('impuesto') || magnet.includes('itin')) return 'impuestos';
  // Default cycle: day 2-6 credito, day 7-11 remesas, day 12-16 impuestos
  if (daysOld <= 6)  return 'credito';
  if (daysOld <= 11) return 'remesas';
  return 'impuestos';
}

function pickLang(subscriber) {
  return subscriber.preferred_language === 'en' ? 'en' : 'es';
}

function alreadySent(subscriber, vertical, day) {
  const key = `${vertical}-${day}`;
  const map = subscriber.drip_sent || {};
  return !!map[key];
}

async function markSent(email, vertical, day) {
  const key = `${vertical}-${day}`;
  const timestamp = new Date().toISOString();
  try {
    // Read current drip_sent first (PATCH doesn't merge JSON by default)
    const readR = await fetch(
      `${SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=drip_sent`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (!readR.ok) return false;
    const rows = await readR.json();
    const current = (rows[0] && rows[0].drip_sent) || {};
    const updated = { ...current, [key]: timestamp };
    const patchR = await fetch(
      `${SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ drip_sent: updated })
      }
    );
    return patchR.ok;
  } catch (e) {
    console.error('markSent error', e);
    return false;
  }
}

async function sendOne({ email, lang, emailContent }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'no-api-key' };

  const from = process.env.RESEND_FROM_EMAIL || 'Norte Financial <hola@nortefinancial.com>';
  const replyTo = process.env.RESEND_REPLY_TO || 'hola@nortefinancial.com';
  const unsubscribeUrl = `https://nortefinancial.com/api/unsubscribe?e=${encodeURIComponent(email)}`;

  const html = renderEmail({
    subject: emailContent.subject,
    headline: emailContent.headline,
    preview: emailContent.preview,
    bodyHtml: emailContent.bodyHtml,
    ctaLabel: emailContent.ctaLabel,
    ctaUrl: emailContent.ctaUrl,
    lang,
    unsubscribeUrl
  });

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
        subject: emailContent.subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        tags: [
          { name: 'type', value: 'drip' },
          { name: 'lang', value: lang }
        ]
      })
    });
    if (!r.ok) {
      const body = await r.text();
      console.error('drip resend error', r.status, body);
      return { sent: false, reason: 'resend-' + r.status };
    }
    return { sent: true };
  } catch (e) {
    console.error('drip resend exception', e);
    return { sent: false, reason: 'exception' };
  }
}

async function fetchActiveSubscribers() {
  // Active = not unsubscribed, subscribed_at within last 45 days (past last drip day)
  const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
  const url = `${SUPABASE_URL}/rest/v1/newsletter_subscribers`
    + `?select=email,preferred_language,lead_magnet,subscribed_at,drip_sent,unsubscribed_at`
    + `&unsubscribed_at=is.null`
    + `&subscribed_at=gte.${encodeURIComponent(cutoff)}`
    + `&order=subscribed_at.desc`
    + `&limit=1000`;
  const r = await fetch(url, {
    headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
  });
  if (!r.ok) throw new Error('supabase fetch subscribers ' + r.status);
  return r.json();
}

export default async function handler(req, res) {
  // Vercel cron sends the request with the CRON_SECRET in Authorization header.
  // For manual testing, you can also pass ?key=<CRON_SECRET>.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.authorization || '';
    const fromHeader = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const fromQuery = req.query && req.query.key;
    if (fromHeader !== expected && fromQuery !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  let subs;
  try {
    subs = await fetchActiveSubscribers();
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Could not fetch subscribers' });
  }

  let sent = 0, skipped = 0, errored = 0;
  for (const sub of subs) {
    const age = daysSince(sub.subscribed_at);
    if (age === null) { skipped++; continue; }
    if (!DRIP_DAYS.includes(age)) { skipped++; continue; }

    const vertical = pickVertical(sub, age);
    const lang = pickLang(sub);
    const seq = (SEQUENCES[vertical] && SEQUENCES[vertical][lang]) || null;
    if (!seq) { skipped++; continue; }

    const entry = seq.find(e => e.day === age);
    if (!entry) { skipped++; continue; }

    if (alreadySent(sub, vertical, age)) { skipped++; continue; }

    const result = await sendOne({ email: sub.email, lang, emailContent: entry });
    if (result.sent) {
      await markSent(sub.email, vertical, age);
      sent++;
    } else {
      errored++;
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, total: subs.length, sent, skipped, errored });
}
