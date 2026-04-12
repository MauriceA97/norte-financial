// Norte Financial — lightweight email capture
// Renders two UI affordances:
//   1. Bottom bar — fixed strip at bottom of viewport, 10s delay, dismissible
//   2. Exit-intent modal — one-shot per session, triggers on mouse leaving
//      toward top of viewport (desktop) or after 60s idle on mobile
//
// Both submit the same email to the public.newsletter_subscribers Supabase
// table via anon REST. Integrates with norte-track.js for visitor_id, session_id,
// and UTM attribution when available.
//
// Include in <head> on every page with:
//   <script src="/norte-email.js" defer></script>
//
// Respects localStorage:
//   norte_email_dismissed_bar (30-day dismissal of bottom bar)
//   norte_email_dismissed_exit (30-day dismissal of exit-intent)
//   norte_email_submitted (permanent — never show again after signup)
//
// Excluded pages: admin.html, cotizar-*.html (quote forms have their own flow).

(function () {
  if (window.__NORTE_EMAIL_LOADED__) return;
  window.__NORTE_EMAIL_LOADED__ = true;

  // ---------- Config ----------
  const SUPABASE_URL = 'https://agodvsflcfhfcxtlykpf.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2R2c2ZsY2ZoZmN4dGx5a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU2NTMsImV4cCI6MjA5MTMzMTY1M30.KDg8lPRPfyMXYQ6SQK3LcoIhSFqNZBAELlJIUWRC9mw';
  const DISMISS_DAYS = 30;

  // Skip on admin, quote forms, and the opt-in's own confirmation pages
  const path = window.location.pathname;
  if (
    path === '/admin.html' ||
    path.startsWith('/cotizar') ||
    path === '/privacidad.html' ||
    path === '/terminos.html'
  ) {
    return;
  }

  // ---------- Helpers ----------
  function get(key) { try { return window.localStorage.getItem(key); } catch { return null; } }
  function set(key, val) { try { window.localStorage.setItem(key, val); } catch {} }

  function isDismissed(key) {
    const v = get(key);
    if (!v) return false;
    const ts = parseInt(v, 10);
    if (isNaN(ts)) return false;
    const daysPassed = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return daysPassed < DISMISS_DAYS;
  }
  function markDismissed(key) { set(key, Date.now().toString()); }

  const alreadySubmitted = get('norte_email_submitted') === '1';

  // Detect current language from <html lang> or localStorage
  function getLang() {
    const l = get('norte_lang');
    if (l === 'en' || l === 'es') return l;
    return document.documentElement.lang || 'es';
  }

  // ---------- Submission ----------
  async function submitEmail(email, captureType, leadMagnet) {
    const track = window.NORTE_TRACK || {};
    const utms = (track.getActiveUtms && track.getActiveUtms()) || {};

    const payload = {
      email: email.trim().toLowerCase(),
      preferred_language: getLang(),
      source_page: path,
      capture_type: captureType,
      lead_magnet: leadMagnet || null,
      visitor_id: track.visitorId || null,
      session_id: track.sessionId || null,
      user_agent: navigator.userAgent.slice(0, 500),
      referrer: document.referrer || null,
      utm_source: utms.utm_source || null,
      utm_medium: utms.utm_medium || null,
      utm_campaign: utms.utm_campaign || null,
      utm_content: utms.utm_content || null,
      utm_term: utms.utm_term || null
    };

    try {
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
      if (r.ok || r.status === 409) {
        // 409 = duplicate email (unique constraint). Still a success from UX POV.
        set('norte_email_submitted', '1');
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // ---------- i18n ----------
  const i18n = {
    es: {
      barHeadline: 'Recibe consejos bilingües de finanzas personales',
      barSub: 'Gratis, sin spam. Darse de baja en 1 click.',
      barPlaceholder: 'tu@correo.com',
      barButton: 'Suscribirme',
      barDismiss: 'Cerrar',
      modalEyebrow: 'Antes de que te vayas',
      modalHeadline: 'Tu familia merece<br>estar mejor informada',
      modalSub: 'Recibe una guía semanal en español sobre crédito, banca, seguros, remesas e impuestos. 100% gratis, 100% bilingüe.',
      modalPlaceholder: 'tu@correo.com',
      modalButton: 'Recibir consejos gratis',
      modalDisclaimer: 'Sin spam. Cancela cuando quieras.',
      modalDismiss: 'No, gracias',
      successTitle: '¡Estás dentro!',
      successBody: 'Revisa tu correo en los próximos minutos para confirmar. Gracias por confiar en Norte Financial.',
      errorBody: 'Algo falló. Revisa tu correo e intenta de nuevo, o escríbenos a hola@nortefinancial.com.'
    },
    en: {
      barHeadline: 'Get bilingual personal finance tips',
      barSub: 'Free, no spam. 1-click unsubscribe.',
      barPlaceholder: 'your@email.com',
      barButton: 'Subscribe',
      barDismiss: 'Close',
      modalEyebrow: 'Before you go',
      modalHeadline: 'Your family deserves<br>to be better informed',
      modalSub: 'Get one Spanish-first guide per week on credit, banking, insurance, remittances, and taxes. 100% free, 100% bilingual.',
      modalPlaceholder: 'your@email.com',
      modalButton: 'Get free tips',
      modalDisclaimer: 'No spam. Unsubscribe anytime.',
      modalDismiss: 'No thanks',
      successTitle: "You're in!",
      successBody: 'Check your email in the next few minutes to confirm. Thanks for trusting Norte Financial.',
      errorBody: 'Something went wrong. Check your email and try again, or write us at hola@nortefinancial.com.'
    }
  };

  function t(key) {
    const lang = getLang();
    return (i18n[lang] && i18n[lang][key]) || i18n.es[key];
  }

  // ---------- Styles (injected once) ----------
  function injectStyles() {
    if (document.getElementById('norte-email-css')) return;
    const css = `
.ne-bar{position:fixed;left:0;right:0;bottom:0;z-index:998;background:#0B3D2E;color:#fff;padding:14px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;box-shadow:0 -4px 20px rgba(0,0,0,0.15);transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);font-family:'DM Sans',-apple-system,sans-serif}
.ne-bar.ne-show{transform:translateY(0)}
.ne-bar__text{flex:1 1 280px;min-width:0}
.ne-bar__headline{font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:500;line-height:1.3;margin:0 0 2px;color:#fff}
.ne-bar__sub{font-size:12px;color:rgba(232,245,240,0.65);margin:0}
.ne-bar__form{display:flex;align-items:center;gap:8px;flex:1 1 320px;max-width:480px}
.ne-bar__form input[type="email"]{flex:1;padding:10px 14px;border:1px solid rgba(255,255,255,0.2);border-radius:100px;background:rgba(255,255,255,0.1);color:#fff;font-size:14px;outline:none;font-family:inherit}
.ne-bar__form input[type="email"]::placeholder{color:rgba(232,245,240,0.5)}
.ne-bar__form input[type="email"]:focus{border-color:#7EC4A8;background:rgba(255,255,255,0.15)}
.ne-bar__btn{padding:10px 20px;background:#D4700A;color:#fff;border:none;border-radius:100px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background 0.18s}
.ne-bar__btn:hover{background:#BA6208}
.ne-bar__btn:disabled{opacity:0.6;cursor:not-allowed}
.ne-bar__close{background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;padding:8px;font-size:20px;line-height:1;font-family:inherit}
.ne-bar__close:hover{color:#fff}
.ne-bar__msg{width:100%;font-size:13px;color:#7EC4A8;padding:6px 0 0;display:none}
.ne-bar__msg.ne-err{color:#F59E0B}
.ne-bar.ne-submitted .ne-bar__text,.ne-bar.ne-submitted .ne-bar__form{display:none}
.ne-bar.ne-submitted .ne-bar__msg{display:block;flex:1;padding:0}
@media(max-width:640px){
  .ne-bar{padding:12px 14px;gap:10px}
  .ne-bar__headline{font-size:14px}
  .ne-bar__sub{display:none}
}

.ne-overlay{position:fixed;inset:0;background:rgba(10,30,22,0.78);z-index:999;display:none;align-items:center;justify-content:center;padding:20px;animation:neFade 0.3s ease}
.ne-overlay.ne-show{display:flex}
@keyframes neFade{from{opacity:0}to{opacity:1}}
.ne-modal{background:#fff;border-radius:24px;max-width:440px;width:100%;padding:40px 36px;position:relative;box-shadow:0 24px 60px rgba(0,0,0,0.35);animation:neUp 0.35s cubic-bezier(0.22,1,0.36,1);font-family:'DM Sans',-apple-system,sans-serif}
@keyframes neUp{from{opacity:0;transform:translateY(20px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.ne-modal__close{position:absolute;top:14px;right:14px;background:none;border:none;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#7A7A7A;font-size:22px;line-height:1;font-family:inherit}
.ne-modal__close:hover{background:#F7F5F1;color:#0B3D2E}
.ne-modal__eyebrow{font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#1D9E75;margin-bottom:12px}
.ne-modal__headline{font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:500;color:#1A1A1A;line-height:1.15;letter-spacing:-0.01em;margin:0 0 14px}
.ne-modal__sub{font-size:15px;color:#4A4A4A;line-height:1.65;margin:0 0 24px}
.ne-modal__form{display:flex;flex-direction:column;gap:10px}
.ne-modal__form input[type="email"]{width:100%;padding:14px 18px;border:1.5px solid rgba(11,61,46,0.15);border-radius:12px;font-size:15px;font-family:inherit;background:#F7F5F1;color:#1A1A1A;outline:none;transition:border-color 0.18s}
.ne-modal__form input[type="email"]:focus{border-color:#1D9E75;background:#fff;box-shadow:0 0 0 3px rgba(29,158,117,0.12)}
.ne-modal__btn{width:100%;padding:14px 20px;background:#D4700A;color:#fff;border:none;border-radius:100px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s}
.ne-modal__btn:hover{background:#BA6208;transform:translateY(-1px);box-shadow:0 8px 20px rgba(212,112,10,0.25)}
.ne-modal__btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none}
.ne-modal__disclaimer{font-size:12px;color:#7A7A7A;text-align:center;margin:12px 0 0}
.ne-modal__dismiss{width:100%;padding:10px;background:none;border:none;color:#7A7A7A;font-size:13px;cursor:pointer;font-family:inherit;margin-top:4px}
.ne-modal__dismiss:hover{color:#1A1A1A}
.ne-modal__msg{margin:12px 0 0;padding:12px 16px;border-radius:10px;font-size:14px;display:none;line-height:1.5}
.ne-modal__msg.ne-ok{display:block;background:rgba(29,158,117,0.1);color:#1D9E75;border-left:3px solid #1D9E75}
.ne-modal__msg.ne-err{display:block;background:rgba(212,112,10,0.1);color:#D4700A;border-left:3px solid #D4700A}
.ne-modal.ne-submitted .ne-modal__form,.ne-modal.ne-submitted .ne-modal__disclaimer,.ne-modal.ne-submitted .ne-modal__dismiss{display:none}
.ne-modal.ne-submitted .ne-modal__headline{font-size:22px}
@media(max-width:480px){
  .ne-modal{padding:32px 24px}
  .ne-modal__headline{font-size:24px}
  .ne-modal__sub{font-size:14px}
}
`;
    const style = document.createElement('style');
    style.id = 'norte-email-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---------- Bottom bar ----------
  function renderBar() {
    if (alreadySubmitted) return;
    if (isDismissed('norte_email_dismissed_bar')) return;

    const bar = document.createElement('div');
    bar.className = 'ne-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Newsletter signup');
    bar.innerHTML = `
      <div class="ne-bar__text">
        <p class="ne-bar__headline">${t('barHeadline')}</p>
        <p class="ne-bar__sub">${t('barSub')}</p>
      </div>
      <form class="ne-bar__form" novalidate>
        <input type="email" required placeholder="${t('barPlaceholder')}" aria-label="${t('barPlaceholder')}" />
        <button type="submit" class="ne-bar__btn">${t('barButton')}</button>
      </form>
      <button type="button" class="ne-bar__close" aria-label="${t('barDismiss')}">×</button>
      <div class="ne-bar__msg" role="status"></div>
    `;
    document.body.appendChild(bar);

    // Show after 10s so it doesn't interrupt first impression
    setTimeout(() => { bar.classList.add('ne-show'); }, 10000);

    const form = bar.querySelector('form');
    const input = bar.querySelector('input[type="email"]');
    const btn = bar.querySelector('.ne-bar__btn');
    const msg = bar.querySelector('.ne-bar__msg');
    const closeBtn = bar.querySelector('.ne-bar__close');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.focus();
        return;
      }
      btn.disabled = true;
      btn.textContent = '...';
      const ok = await submitEmail(email, 'bottom-bar', 'weekly-newsletter');
      if (ok) {
        bar.classList.add('ne-submitted');
        msg.classList.remove('ne-err');
        msg.textContent = t('successTitle') + ' ' + t('successBody');
        setTimeout(() => { bar.classList.remove('ne-show'); }, 6000);
      } else {
        btn.disabled = false;
        btn.textContent = t('barButton');
        msg.classList.add('ne-err');
        msg.textContent = t('errorBody');
        msg.style.display = 'block';
      }
    });

    closeBtn.addEventListener('click', () => {
      bar.classList.remove('ne-show');
      markDismissed('norte_email_dismissed_bar');
      setTimeout(() => bar.remove(), 500);
    });
  }

  // ---------- Exit-intent modal ----------
  let modalShown = false;
  function renderModal() {
    if (modalShown) return;
    if (alreadySubmitted) return;
    if (isDismissed('norte_email_dismissed_exit')) return;
    modalShown = true;

    const overlay = document.createElement('div');
    overlay.className = 'ne-overlay';
    overlay.innerHTML = `
      <div class="ne-modal" role="dialog" aria-modal="true" aria-labelledby="ne-modal-h">
        <button class="ne-modal__close" aria-label="Close">×</button>
        <p class="ne-modal__eyebrow">${t('modalEyebrow')}</p>
        <h2 class="ne-modal__headline" id="ne-modal-h">${t('modalHeadline')}</h2>
        <p class="ne-modal__sub">${t('modalSub')}</p>
        <form class="ne-modal__form" novalidate>
          <input type="email" required placeholder="${t('modalPlaceholder')}" aria-label="${t('modalPlaceholder')}" />
          <button type="submit" class="ne-modal__btn">${t('modalButton')}</button>
        </form>
        <p class="ne-modal__disclaimer">${t('modalDisclaimer')}</p>
        <button type="button" class="ne-modal__dismiss">${t('modalDismiss')}</button>
        <div class="ne-modal__msg" role="status"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('ne-show'));

    const modal = overlay.querySelector('.ne-modal');
    const form = overlay.querySelector('form');
    const input = overlay.querySelector('input[type="email"]');
    const btn = overlay.querySelector('.ne-modal__btn');
    const msg = overlay.querySelector('.ne-modal__msg');
    const closeBtn = overlay.querySelector('.ne-modal__close');
    const dismissBtn = overlay.querySelector('.ne-modal__dismiss');

    function close() {
      overlay.classList.remove('ne-show');
      markDismissed('norte_email_dismissed_exit');
      setTimeout(() => overlay.remove(), 400);
    }

    closeBtn.addEventListener('click', close);
    dismissBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape' && overlay.isConnected) {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.focus();
        return;
      }
      btn.disabled = true;
      btn.textContent = '...';
      const ok = await submitEmail(email, 'exit-intent', 'weekly-newsletter');
      if (ok) {
        modal.classList.add('ne-submitted');
        msg.classList.remove('ne-err');
        msg.classList.add('ne-ok');
        msg.innerHTML = '<strong>' + t('successTitle') + '</strong> ' + t('successBody');
        // Replace headline with a thank-you
        overlay.querySelector('.ne-modal__eyebrow').textContent = '✓';
        overlay.querySelector('.ne-modal__headline').innerHTML = t('successTitle');
        overlay.querySelector('.ne-modal__sub').textContent = t('successBody');
        setTimeout(close, 5000);
      } else {
        btn.disabled = false;
        btn.textContent = t('modalButton');
        msg.classList.remove('ne-ok');
        msg.classList.add('ne-err');
        msg.textContent = t('errorBody');
      }
    });
  }

  // ---------- Triggers ----------
  function setupTriggers() {
    // Desktop: mouse leaves toward top of viewport
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !e.relatedTarget && !e.toElement) {
        renderModal();
      }
    });

    // Mobile: 60 seconds of idle OR scroll past 70% of page
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      let lastActivity = Date.now();
      ['scroll', 'touchstart', 'click'].forEach(ev => {
        window.addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true });
      });
      const idleCheck = setInterval(() => {
        if (Date.now() - lastActivity > 60000 && !modalShown) {
          renderModal();
          clearInterval(idleCheck);
        }
      }, 5000);

      // Also trigger at 70% scroll depth
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        if (total > 0 && scrolled / total > 0.7 && !modalShown) {
          renderModal();
        }
      }, { passive: true });
    }
  }

  // ---------- Init ----------
  function init() {
    injectStyles();
    renderBar();
    setupTriggers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---------- Public API ----------
  window.NORTE_EMAIL = {
    submit: submitEmail,
    showModal: renderModal,
    showBar: renderBar
  };
})();
