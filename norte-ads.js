// Norte Financial — Display ad loader (dormant)
// ==============================================
//
// This module is SCAFFOLDING. It does nothing until explicitly activated
// by setting window.NORTE_ADS in /ga-config.js (or any page-level inline
// script BEFORE this file loads).
//
// Design constraint: ads visually change the page. We don't want to alter
// design before the ad network is chosen and approved. So this file stays
// dormant and ad slots aren't injected anywhere until activated.
//
// HOW TO ACTIVATE (once Ezoic or AdSense is approved):
//
// Option A — Ezoic (recommended for small sites, lower threshold):
//   1. Apply at https://ezoic.com (needs ~10K monthly visitors to start)
//   2. Add Ezoic's site verification tag (they'll give you one)
//   3. In /ga-config.js add:
//        window.NORTE_ADS = {
//          network: 'ezoic',
//          siteId: 'YOUR_EZOIC_SITE_ID'
//        };
//   4. Deploy. Ezoic then takes over ad placement site-wide via their
//      Site Speed Accelerator + EzAI.
//
// Option B — AdSense (after ~3 months of content + decent traffic):
//   1. Apply at https://adsense.google.com
//   2. Once approved, in /ga-config.js add:
//        window.NORTE_ADS = {
//          network: 'adsense',
//          publisherId: 'ca-pub-XXXXXXXXXXXXXXXX'
//        };
//   3. This file auto-injects the AdSense script + placeholder slots
//      wherever <div class="norte-ad-slot" data-slot="content-in"></div>
//      appears in the HTML (none are added yet by default).
//
// Option C — Mediavine (best RPMs, requires 50K monthly sessions):
//   Same pattern. Contact them directly.
//
// When inactive (no window.NORTE_ADS), this script exits quietly.

(function () {
  if (window.__NORTE_ADS_LOADED__) return;
  window.__NORTE_ADS_LOADED__ = true;

  const cfg = window.NORTE_ADS;
  if (!cfg || typeof cfg !== 'object' || !cfg.network) return;

  function injectEzoic(siteId) {
    if (!siteId) return;
    // Ezoic uses their own script that auto-replaces ad placeholders. All
    // we do here is load their JS — they handle the rest via a WordPress-
    // style takeover.
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.ezojs.com/ezoic/sa.min.js';
    document.head.appendChild(s);
    window.ezstandalone = window.ezstandalone || {};
    window.ezstandalone.cmd = window.ezstandalone.cmd || [];
    window.ezstandalone.cmd.push(function () {
      window.ezstandalone.define('norte-ads', siteId);
      window.ezstandalone.enable();
      window.ezstandalone.display();
    });
  }

  function injectAdSense(publisherId) {
    if (!publisherId) return;
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(publisherId);
    document.head.appendChild(s);
    // Auto-populate any <div class="norte-ad-slot" data-slot="..."> placeholders
    // when they exist.
    function fillSlots() {
      document.querySelectorAll('.norte-ad-slot[data-slot]').forEach(el => {
        if (el.__filled) return;
        el.__filled = true;
        const slot = el.dataset.slot || 'auto';
        el.innerHTML = '<ins class="adsbygoogle" style="display:block" '
          + 'data-ad-client="' + publisherId + '" '
          + 'data-ad-slot="' + slot + '" '
          + 'data-ad-format="auto" data-full-width-responsive="true"></ins>';
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fillSlots);
    } else {
      fillSlots();
    }
  }

  if (cfg.network === 'ezoic')         injectEzoic(cfg.siteId);
  else if (cfg.network === 'adsense')  injectAdSense(cfg.publisherId);
  // Mediavine / Raptive use tag-manager-style inserts — they'll provide a
  // snippet to add to <head> directly; no action needed here.
})();
