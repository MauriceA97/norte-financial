// Norte Financial — Affiliate URL central config (single source of truth)
// =======================================================================
//
// Replace the URL for any carrier here and it propagates to every review
// page, calculator, and CTA button automatically — no HTML edits needed.
//
// HOW IT WORKS:
//   - Every review page has <a data-carrier="wise" data-dest="https://wise.com/">
//   - norte-track.js reads this map at load time
//   - If NORTE_AFFILIATE_URLS['wise'] is set, it overrides the data-dest
//   - The /api/click redirector validates the hostname against its allowlist
//
// HOW TO USE:
//   1. Apply to an affiliate program (e.g., Wise Partner, Chime Affiliate)
//   2. When approved, copy your tracking URL (format varies by network)
//   3. Paste it below, replacing `null` for that carrier slug
//   4. Deploy via norte-deploy.html — change goes live in ~60 seconds
//
// FALLBACK: while `null`, the original homepage URL in the HTML is used.
// This means the site still works (clicks redirect to provider homepage)
// even before affiliate programs are approved. No broken links.
//
// COMPLIANCE: all URLs are passed through /api/click which adds UTM +
// subid params and logs to affiliate_clicks table for attribution.

window.NORTE_AFFILIATE_URLS = {
  // ========= REMITTANCE =========
  // Priority 1 — no MoneyLion conflict, highest-volume vertical
  // Apply: wise.com/partners, remitly.com/us/en/partnerships,
  //        xoom.com (via PayPal Partner), westernunion.com (via Impact)
  'wise':           null,  // e.g., 'https://wise.com/invite/iea/norte1'
  'remitly':        null,
  'xoom':           null,
  'western-union':  null,
  'moneygram':      null,
  'ria':            null,
  'xe':             null,

  // ========= CREDIT CARDS (ITIN-friendly + credit builders) =========
  // Priority 1 — highest payout affiliate ($50-200/approval)
  // Apply: direct (Petal, Tomo, Self, Mission Lane) or via CardRatings,
  //        BankRate Partner Network, Impact, CJ Affiliate
  'petal':               null,  // petalcard.com via direct or CardRatings
  'tomo':                null,  // tomocredit.com direct
  'capital-one-secured': null,  // Capital One via Impact
  'self':                null,  // self.inc direct or Impact
  'mission-lane':        null,  // missionlane.com direct
  'credit-one':          null,  // creditone.com

  // ========= DIGITAL BANKING =========
  // Priority 2 — MoneyLion overlap caution; focus on ITIN angle
  // Apply: Chime Partner, SoFi Affiliate, Current, Varo, BofA
  'chime':         null,  // $25-100/funded account
  'sofi-money':    null,
  'current':       null,
  'varo':          null,
  'bofa-safebalance': null,

  // ========= MORTGAGES (ITIN-friendly) =========
  // Priority 1 — HIGHEST payout ($50-300/lead), zero MoneyLion overlap
  // Apply: direct with each lender's partner program
  'alterra-hipoteca':      null,  // alterrahomeloans.com
  'new-american-funding':  null,
  'guild-mortgage':        null,
  'homexpress':            null,

  // ========= PERSONAL + BUSINESS LOANS =========
  // Priority 2 — some MoneyLion Instacash overlap; ITIN focus
  'oportun':         null,  // $30-100/funded loan
  'camino-financial': null,
  'sofi-prestamos':  null,
  'lightstream':     null,
  'lendingpoint':    null,
  'upgrade':         null,
  'upstart':         null,

  // ========= TAX PREP =========
  // Priority 1 — seasonal Jan-Apr peak, zero MoneyLion overlap
  // Apply: Intuit Partner Program, H&R Block, FreeTaxUSA, TaxSlayer
  'turbotax':    null,  // $10-25/filer
  'hr-block':    null,
  'freetaxusa':  null,
  'taxslayer':   null,

  // ========= INSURANCE (secondary — Trellis conflict) =========
  // Keep links live but don't promote heavily until Trellis situation resolved
  // Apply: EverQuote, MediaAlpha, QuinStreet, SmartFinancial, Insurify
  'everquote':       null,  // $8-80/lead
  'mediaalpha':      null,
  'quinstreet':      null,
  'smartfinancial':  null,
  'insurify':        null,
  'thezebra':        null,
  'policygenius':    null,
  'geico':           null,
  'progressive':     null,
  'state-farm':      null,
  'allstate':        null,
  'liberty-mutual':  null,
  'farmers':         null,
  'usaa':            null,
  'nationwide':      null,
  'travelers':       null,
  'root':            null,
  'lemonade':        null,

  // ========= (add new carriers below as programs are joined) =========
};

// Metadata for each carrier — payout expectation, application status,
// notes. This is displayed in the admin affiliate URL manager page
// (/admin-afiliados.html) so Maurice can see which to prioritize.
window.NORTE_AFFILIATE_META = {
  // vertical, estimated_payout_usd, application_url, status, notes
  'wise':                 { vertical: 'remesas',   payout: '5-25',   apply: 'https://wise.com/partners',                status: 'not-applied' },
  'remitly':              { vertical: 'remesas',   payout: '20-25',  apply: 'https://www.remitly.com/us/en/affiliate',  status: 'not-applied' },
  'xoom':                 { vertical: 'remesas',   payout: '10-40',  apply: 'https://www.paypal.com/partnerprogram',    status: 'not-applied' },
  'western-union':        { vertical: 'remesas',   payout: '5-20',   apply: 'https://impact.com (search Western Union)',status: 'not-applied' },
  'moneygram':            { vertical: 'remesas',   payout: '5-15',   apply: 'https://impact.com (search MoneyGram)',    status: 'not-applied' },
  'ria':                  { vertical: 'remesas',   payout: '5-15',   apply: 'https://www.riamoneytransfer.com/partner', status: 'not-applied' },
  'xe':                   { vertical: 'remesas',   payout: '10-30',  apply: 'https://www.xe.com/affiliates',            status: 'not-applied' },
  'petal':                { vertical: 'credito',   payout: '50-150', apply: 'https://cardratings.com (Petal listing)',  status: 'not-applied' },
  'tomo':                 { vertical: 'credito',   payout: '50-100', apply: 'https://tomocredit.com (direct)',          status: 'not-applied' },
  'capital-one-secured':  { vertical: 'credito',   payout: '40-100', apply: 'https://impact.com (Capital One)',         status: 'not-applied' },
  'self':                 { vertical: 'credito',   payout: '30-75',  apply: 'https://www.self.inc/affiliates',          status: 'not-applied' },
  'mission-lane':         { vertical: 'credito',   payout: '40-80',  apply: 'https://missionlane.com (direct)',         status: 'not-applied' },
  'credit-one':           { vertical: 'credito',   payout: '50-90',  apply: 'https://cardratings.com',                  status: 'not-applied' },
  'chime':                { vertical: 'banca',     payout: '25-100', apply: 'https://www.chime.com/partners',           status: 'not-applied' },
  'sofi-money':           { vertical: 'banca',     payout: '75-200', apply: 'https://www.sofi.com/affiliates',          status: 'not-applied' },
  'current':              { vertical: 'banca',     payout: '20-50',  apply: 'https://current.com (direct)',             status: 'not-applied' },
  'varo':                 { vertical: 'banca',     payout: '20-60',  apply: 'https://www.varomoney.com/partners',       status: 'not-applied' },
  'bofa-safebalance':     { vertical: 'banca',     payout: '50-150', apply: 'https://impact.com (Bank of America)',     status: 'not-applied' },
  'alterra-hipoteca':     { vertical: 'hipotecas', payout: '50-300', apply: 'https://alterrahomeloans.com (direct)',    status: 'not-applied' },
  'new-american-funding': { vertical: 'hipotecas', payout: '75-300', apply: 'https://newamericanfunding.com',           status: 'not-applied' },
  'guild-mortgage':       { vertical: 'hipotecas', payout: '50-250', apply: 'https://guildmortgage.com',                status: 'not-applied' },
  'homexpress':           { vertical: 'hipotecas', payout: '50-250', apply: 'https://homexpress.com',                   status: 'not-applied' },
  'oportun':              { vertical: 'prestamos', payout: '30-100', apply: 'https://oportun.com/affiliate',            status: 'not-applied' },
  'camino-financial':     { vertical: 'prestamos', payout: '30-150', apply: 'https://caminofinancial.com',              status: 'not-applied' },
  'sofi-prestamos':       { vertical: 'prestamos', payout: '50-300', apply: 'https://www.sofi.com/affiliates',          status: 'not-applied' },
  'lightstream':          { vertical: 'prestamos', payout: '50-200', apply: 'https://impact.com (LightStream)',         status: 'not-applied' },
  'lendingpoint':         { vertical: 'prestamos', payout: '25-100', apply: 'https://impact.com (LendingPoint)',        status: 'not-applied' },
  'upgrade':              { vertical: 'prestamos', payout: '50-200', apply: 'https://impact.com (Upgrade)',             status: 'not-applied' },
  'upstart':              { vertical: 'prestamos', payout: '50-200', apply: 'https://impact.com (Upstart)',             status: 'not-applied' },
  'turbotax':             { vertical: 'impuestos', payout: '10-25',  apply: 'https://quickbooks.intuit.com/partners',   status: 'not-applied' },
  'hr-block':             { vertical: 'impuestos', payout: '10-20',  apply: 'https://www.hrblock.com/affiliates',       status: 'not-applied' },
  'freetaxusa':           { vertical: 'impuestos', payout: '3-8',    apply: 'https://www.freetaxusa.com/affiliates',    status: 'not-applied' },
  'taxslayer':            { vertical: 'impuestos', payout: '8-15',   apply: 'https://impact.com (TaxSlayer)',           status: 'not-applied' },
  'everquote':            { vertical: 'seguros',   payout: '8-80',   apply: 'https://www.everquote.com/affiliates',     status: 'not-applied' },
  'mediaalpha':           { vertical: 'seguros',   payout: '5-60',   apply: 'https://www.mediaalpha.com/publishers',    status: 'not-applied' },
  'quinstreet':           { vertical: 'seguros',   payout: '8-50',   apply: 'https://www.quinstreet.com/publishers',    status: 'not-applied' },
  'smartfinancial':       { vertical: 'seguros',   payout: '5-40',   apply: 'https://smartfinancial.com/partners',      status: 'not-applied' }
};
