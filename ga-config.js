// Norte Financial — Google Analytics 4 configuration
// ====================================================
//
// TO ACTIVATE GA4:
//   1. Create a GA4 property at https://analytics.google.com/
//   2. Copy your measurement ID (format: G-XXXXXXXXXX)
//   3. Replace the placeholder below with your real measurement ID
//   4. Deploy — norte-track.js picks it up automatically on all pages
//
// The measurement ID is public (safe to commit to git). It's designed to
// be visible in the client-side HTML.
//
// Until you replace the placeholder, GA4 stays dormant and nothing is
// sent to Google. No errors, no noise.

window.NORTE_GA_ID = null; // ← Replace with 'G-XXXXXXXXXX' when ready

// Optional: site-wide tracking preferences. These defaults are privacy-friendly
// (IP anonymization, disabled ad personalization). Keep as-is unless you have
// a specific reason to change.
window.NORTE_GA_CONFIG = {
  anonymize_ip: true,
  allow_google_signals: false,
  send_page_view: true
};
