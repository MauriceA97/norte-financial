// Norte Financial — Affiliate click redirector
// Logs the click to Supabase affiliate_clicks and 302-redirects
// the visitor to the final carrier URL with our subid appended.
//
// Usage from HTML:
//   <a href="/api/click?c=geico&p=auto&pl=review-page&dest=https%3A%2F%2Fwww.geico.com%2Fpartners%2Fnorte"
//      rel="sponsored nofollow noopener" target="_blank">Cotizar con GEICO</a>
//
// Query params:
//   c     = carrier slug (e.g. "geico", "progressive", "everquote")
//   p     = product    (e.g. "auto", "home", "life", "health", "business")
//   pl    = placement  (e.g. "review-hero", "comparison-table", "cta-band")
//   dest  = destination URL, URL-encoded (REQUIRED)
//   vid   = visitor_id (from norte-track.js; optional)
//   sid   = session_id (optional)
//   src   = source_page (pathname clicked from; optional)
//
// UTM params utm_source/medium/campaign/content/term are read from the query
// string AND forwarded to the carrier URL as subid pass-through.
//
// The endpoint ALWAYS 302-redirects — even if logging fails — so the user
// experience is never blocked by database issues.

const SUPABASE_URL = 'https://agodvsflcfhfcxtlykpf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2R2c2ZsY2ZoZmN4dGx5a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU2NTMsImV4cCI6MjA5MTMzMTY1M30.KDg8lPRPfyMXYQ6SQK3LcoIhSFqNZBAELlJIUWRC9mw';

// Allowlist of carrier slugs we'll accept. Prevents open-redirect abuse —
// destination hosts MUST match an entry here or the request is rejected.
const ALLOWED_HOSTS = [
  // Insurance affiliate networks
  'everquote.com', 'www.everquote.com',
  'mediaalpha.com', 'www.mediaalpha.com',
  'quinstreet.com', 'www.quinstreet.com',
  'smartfinancial.com', 'www.smartfinancial.com',
  'insurify.com', 'www.insurify.com',
  'thezebra.com', 'www.thezebra.com',
  'policygenius.com', 'www.policygenius.com',
  // Direct insurance carriers
  'geico.com', 'www.geico.com',
  'progressive.com', 'www.progressive.com',
  'statefarm.com', 'www.statefarm.com',
  'allstate.com', 'www.allstate.com',
  'libertymutual.com', 'www.libertymutual.com',
  'farmers.com', 'www.farmers.com',
  'usaa.com', 'www.usaa.com',
  'nationwide.com', 'www.nationwide.com',
  'travelers.com', 'www.travelers.com',
  'americanfamily.com', 'www.americanfamily.com',
  'esurance.com', 'www.esurance.com',
  'thehartford.com', 'www.thehartford.com',
  'metlife.com', 'www.metlife.com',
  'root.com', 'www.root.com',
  'lemonade.com', 'www.lemonade.com',
  // Florida-specific insurance carriers
  'citizensfla.com', 'www.citizensfla.com',
  'universalproperty.com', 'www.universalproperty.com',
  'heritagepci.com', 'www.heritagepci.com',
  // Credit cards (ITIN-friendly / no-history)
  'petalcard.com', 'www.petalcard.com',
  'tomocredit.com', 'www.tomocredit.com',
  'capitalone.com', 'www.capitalone.com',
  'self.inc', 'www.self.inc', 'self.com', 'www.self.com',
  'missionlane.com', 'www.missionlane.com',
  'creditone.com', 'www.creditone.com',
  // Digital + traditional banks
  'chime.com', 'www.chime.com',
  'sofi.com', 'www.sofi.com',
  'current.com', 'www.current.com',
  'varomoney.com', 'www.varomoney.com',
  'bankofamerica.com', 'www.bankofamerica.com',
  'wellsfargo.com', 'www.wellsfargo.com',
  'chase.com', 'www.chase.com',
  // Remittance services
  'wise.com', 'www.wise.com', 'transferwise.com', 'www.transferwise.com',
  'remitly.com', 'www.remitly.com',
  'xoom.com', 'www.xoom.com',
  'westernunion.com', 'www.westernunion.com',
  'moneygram.com', 'www.moneygram.com',
  'riamoneytransfer.com', 'www.riamoneytransfer.com',
  'xe.com', 'www.xe.com',
  // Tax preparation
  'turbotax.intuit.com',
  'intuit.com', 'www.intuit.com',
  'hrblock.com', 'www.hrblock.com',
  'freetaxusa.com', 'www.freetaxusa.com',
  'taxslayer.com', 'www.taxslayer.com',
  'cash.app',
  // ITIN / immigrant-friendly mortgage lenders
  'alterrahomeloans.com', 'www.alterrahomeloans.com',
  'newamericanfunding.com', 'www.newamericanfunding.com',
  'guildmortgage.com', 'www.guildmortgage.com',
  'homexpress.com', 'www.homexpress.com',
  // Personal + business loans (ITIN-friendly + prime)
  'oportun.com', 'www.oportun.com',
  'caminofinancial.com', 'www.caminofinancial.com',
  'lightstream.com', 'www.lightstream.com',
  'lendingpoint.com', 'www.lendingpoint.com',
  'upgrade.com', 'www.upgrade.com',
  'upstart.com', 'www.upstart.com',

  // === Affiliate network tracking domains ===
  // When Norte is approved into these networks, they assign URLs on these hosts
  // that redirect to the final carrier. Allowlisting them lets affiliate URLs
  // from NORTE_AFFILIATE_URLS pass through the click redirector cleanly.
  // Impact.com (Norton/LifeLock, many banks/lenders)
  'impact.com', 'www.impact.com',
  'impactradius.com', 'www.impactradius.com',
  'impactradius-go.com',
  'go.impactradius.com',
  'trk.impact.com',
  // CJ Affiliate (Commission Junction) — they rotate tracking domains
  'cj.com', 'www.cj.com',
  'anrdoezrs.net',
  'jdoqocy.com',
  'dpbolvw.net',
  'kqzyfj.com',
  'tkqlhce.com',
  'qksrv.net',
  'ftjcfx.com',
  'lduhtrp.net',
  'emjcd.com',
  'awltovhc.com',
  // Rakuten Advertising (LinkSynergy)
  'linksynergy.com', 'www.linksynergy.com',
  'click.linksynergy.com',
  // Awin
  'awin1.com', 'www.awin1.com',
  'awin.com', 'www.awin.com',
  // ShareASale
  'shareasale.com', 'www.shareasale.com',
  // FlexOffers
  'flexoffers.com', 'www.flexoffers.com',
  'track.flexlinkspro.com',
  // LinkConnector
  'linkconnector.com', 'www.linkconnector.com',
  // PartnerStack
  'partnerstack.com', 'www.partnerstack.com',
  'grsm.io',
  // BankRate / CardRatings (credit card affiliate hubs)
  'bankrate.com', 'www.bankrate.com',
  'cardratings.com', 'www.cardratings.com',
  'creditcards.com', 'www.creditcards.com',
  'lendingtree.com', 'www.lendingtree.com',
  // Pepperjam / Ascend
  'pepperjamnetwork.com',
  'gopjn.com',

  // Test/internal
  'nortefinancial.com', 'www.nortefinancial.com'
];

function isAllowedDestination(urlStr) {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return ALLOWED_HOSTS.includes(u.hostname.toLowerCase());
  } catch (e) {
    return false;
  }
}

// Append our subid params to the destination URL so affiliate networks
// can postback conversions. We never overwrite existing query params.
function appendSubids(destUrl, subids) {
  try {
    const u = new URL(destUrl);
    for (const [k, v] of Object.entries(subids)) {
      if (v && !u.searchParams.has(k)) {
        u.searchParams.set(k, v);
      }
    }
    return u.toString();
  } catch {
    return destUrl;
  }
}

function getClientIp(req) {
  // Vercel sets x-forwarded-for; take the first entry
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  // Only GET is meaningful here — redirectors use GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = req.query || {};

  // Validate destination
  const dest = typeof q.dest === 'string' ? q.dest : '';
  if (!dest) {
    return res.status(400).json({ error: 'Missing dest parameter' });
  }
  if (!isAllowedDestination(dest)) {
    return res.status(400).json({ error: 'Destination not allowed' });
  }

  // Collect fields for logging
  const payload = {
    carrier:       typeof q.c  === 'string' ? q.c.slice(0, 64)  : null,
    product:       typeof q.p  === 'string' ? q.p.slice(0, 32)  : null,
    placement:     typeof q.pl === 'string' ? q.pl.slice(0, 64) : null,
    destination_url: dest.slice(0, 2000),
    visitor_id:    typeof q.vid === 'string' ? q.vid.slice(0, 64) : null,
    session_id:    typeof q.sid === 'string' ? q.sid.slice(0, 64) : null,
    source_page:   typeof q.src === 'string' ? q.src.slice(0, 512) : null,
    referrer:      typeof req.headers.referer === 'string' ? req.headers.referer.slice(0, 2000) : null,
    user_agent:    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 512) : null,
    ip_address:    getClientIp(req),
    utm_source:    typeof q.utm_source   === 'string' ? q.utm_source.slice(0, 128)   : null,
    utm_medium:    typeof q.utm_medium   === 'string' ? q.utm_medium.slice(0, 128)   : null,
    utm_campaign:  typeof q.utm_campaign === 'string' ? q.utm_campaign.slice(0, 128) : null,
    utm_content:   typeof q.utm_content  === 'string' ? q.utm_content.slice(0, 128)  : null,
    utm_term:      typeof q.utm_term     === 'string' ? q.utm_term.slice(0, 128)     : null
  };

  // Build final redirect URL with subid pass-through
  const finalUrl = appendSubids(dest, {
    subid:        payload.visitor_id || undefined,
    s1:           'nortefinancial',
    s2:           payload.source_page || undefined,
    s3:           payload.placement || undefined,
    utm_source:   payload.utm_source || undefined,
    utm_medium:   payload.utm_medium || undefined,
    utm_campaign: payload.utm_campaign || undefined,
    utm_content:  payload.utm_content || undefined
  });

  // Fire-and-forget log to Supabase. We do NOT await the full response so a
  // slow/failed database never blocks the redirect. We still wrap in try/catch.
  try {
    fetch(`${SUPABASE_URL}/rest/v1/affiliate_clicks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(() => { /* silent — never block redirect */ });
  } catch (e) {
    // silent — never block redirect
  }

  // No-store so the browser doesn't cache the redirect
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  return res.redirect(302, finalUrl);
}
