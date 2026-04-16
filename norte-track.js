// Norte Financial — lightweight tracking + affiliate link helper
// Standalone, non-invasive. Safe to include on any page — it does not
// touch existing nav/footer/setLang code.
//
// Responsibilities:
//   1. Generate + persist a stable anonymous visitor_id in localStorage.
//   2. Generate + persist a session_id per browser session.
//   3. Capture UTM parameters on landing and stash them in localStorage.
//   4. Expose NORTE_TRACK.buildClickUrl(carrier, product, placement, dest)
//      to construct a wrapped /api/click URL with subids attached.
//   5. Auto-wrap any <a data-carrier="..." data-dest="..."> links on the page.
//   6. Load Google Analytics 4 if window.NORTE_GA_ID is set.
//
// Include in <head> with: <script src="/norte-track.js" defer></script>
// The script is idempotent — safe if loaded more than once.

(function () {
  if (window.__NORTE_TRACK_LOADED__) return;
  window.__NORTE_TRACK_LOADED__ = true;

  // ---------- Utilities ----------
  function uuid() {
    // RFC4122 v4 using crypto if available
    if (window.crypto && crypto.getRandomValues) {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b, x => x.toString(16).padStart(2, '0'));
      return `${h.slice(0,4).join('')}-${h.slice(4,6).join('')}-${h.slice(6,8).join('')}-${h.slice(8,10).join('')}-${h.slice(10,16).join('')}`;
    }
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }
  function safeSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch { /* quota/private mode */ }
  }
  function safeSessGet(key) {
    try { return window.sessionStorage.getItem(key); } catch { return null; }
  }
  function safeSessSet(key, val) {
    try { window.sessionStorage.setItem(key, val); } catch { /* quota */ }
  }

  // ---------- Visitor + session IDs ----------
  let visitorId = safeGet('norte_visitor_id');
  if (!visitorId) {
    visitorId = uuid();
    safeSet('norte_visitor_id', visitorId);
    safeSet('norte_visitor_first_seen', new Date().toISOString());
  }

  let sessionId = safeSessGet('norte_session_id');
  if (!sessionId) {
    sessionId = uuid();
    safeSessSet('norte_session_id', sessionId);
  }

  // ---------- UTM capture ----------
  const UTM_KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const currentQS = new URLSearchParams(window.location.search);
  const incoming = {};
  let hasUtm = false;
  UTM_KEYS.forEach(k => {
    const v = currentQS.get(k);
    if (v) { incoming[k] = v; hasUtm = true; }
  });

  // Persist UTMs if we have any on this landing — first-touch stays in localStorage,
  // last-touch overwrites sessionStorage.
  if (hasUtm) {
    // First-touch (only if not yet set)
    if (!safeGet('norte_utm_first')) {
      safeSet('norte_utm_first', JSON.stringify({ ...incoming, _ts: new Date().toISOString(), _lp: window.location.pathname }));
    }
    // Last-touch (overwrite)
    safeSessSet('norte_utm_last', JSON.stringify({ ...incoming, _ts: new Date().toISOString(), _lp: window.location.pathname }));
  }

  function getActiveUtms() {
    // Prefer session (last-touch), fall back to first-touch, then nothing.
    const s = safeSessGet('norte_utm_last');
    if (s) { try { return JSON.parse(s); } catch {} }
    const f = safeGet('norte_utm_first');
    if (f) { try { return JSON.parse(f); } catch {} }
    return {};
  }

  // ---------- Click URL builder ----------
  function buildClickUrl(carrier, product, placement, dest) {
    if (!dest) return '#';
    const u = new URL('/api/click', window.location.origin);
    if (carrier)   u.searchParams.set('c', carrier);
    if (product)   u.searchParams.set('p', product);
    if (placement) u.searchParams.set('pl', placement);
    u.searchParams.set('dest', dest);
    u.searchParams.set('vid', visitorId);
    u.searchParams.set('sid', sessionId);
    u.searchParams.set('src', window.location.pathname);
    const utms = getActiveUtms();
    UTM_KEYS.forEach(k => { if (utms[k]) u.searchParams.set(k, utms[k]); });
    return u.toString();
  }

  // ---------- Auto-wrap affiliate links ----------
  // Any <a data-carrier="geico" data-product="auto" data-placement="review-hero"
  //         data-dest="https://www.geico.com/partners/norte">...</a>
  // gets its href rewritten to the /api/click wrapper. Idempotent.
  function wrapLinks(root) {
    const scope = root || document;
    const links = scope.querySelectorAll('a[data-carrier][data-dest]');
    links.forEach(a => {
      if (a.__norteWrapped) return;
      const carrier   = a.getAttribute('data-carrier');
      const product   = a.getAttribute('data-product')   || '';
      const placement = a.getAttribute('data-placement') || '';
      const dest      = a.getAttribute('data-dest')      || '';
      if (!dest) return;
      a.href = buildClickUrl(carrier, product, placement, dest);
      a.setAttribute('rel', 'sponsored nofollow noopener');
      if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
      a.__norteWrapped = true;
    });
  }

  function init() {
    wrapLinks();
    // Also observe DOM for dynamically injected links
    if (window.MutationObserver) {
      const mo = new MutationObserver(muts => {
        for (const m of muts) {
          m.addedNodes && m.addedNodes.forEach(n => {
            if (n.nodeType === 1) wrapLinks(n);
          });
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---------- GA4 loader ----------
  // Set window.NORTE_GA_ID = 'G-XXXXXXXXXX' in a page's head (or globally via
  // a small inline script) to enable Google Analytics 4. The loader is
  // idempotent and safe to call multiple times.
  function loadGA4() {
    const id = window.NORTE_GA_ID;
    if (!id || typeof id !== 'string' || !id.startsWith('G-')) return;
    if (window.__NORTE_GA_LOADED__) return;
    window.__NORTE_GA_LOADED__ = true;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // Merge user-provided config with privacy-friendly defaults
    const cfg = Object.assign({
      send_page_view: true,
      allow_google_signals: false,
      anonymize_ip: true
    }, window.NORTE_GA_CONFIG || {});
    window.gtag('config', id, cfg);
    window.gtag('set', 'user_properties', { norte_visitor: visitorId });
  }
  // Run GA4 loader now AND after DOMContentLoaded (in case NORTE_GA_ID is set later)
  loadGA4();
  document.addEventListener('DOMContentLoaded', loadGA4);

  // ---------- Public API ----------
  window.NORTE_TRACK = {
    visitorId: visitorId,
    sessionId: sessionId,
    buildClickUrl: buildClickUrl,
    getActiveUtms: getActiveUtms,
    wrapLinks: wrapLinks,
    // Helper for form submissions: return an object to merge into Supabase lead payload
    leadAttribution: function () {
      const utms = getActiveUtms();
      return {
        utm_source:   utms.utm_source   || null,
        utm_medium:   utms.utm_medium   || null,
        utm_campaign: utms.utm_campaign || null,
        utm_content:  utms.utm_content  || null
      };
    }
  };
})();
