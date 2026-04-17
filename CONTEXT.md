# Norte Financial — Claude Code Project Context

## What This Is
Norte Financial (`nortefinancial.com`) is a **finance-first** bilingual (ES/EN) lead-gen + affiliate platform targeting the 62M US Hispanic market. Positioning: "NerdWallet for Hispanics" with an ITIN-first angle no mega-competitor can easily copy. Insurance is now a **secondary** vertical (see `Trellis/Gen Digital employment context` in `/memory/`).

Revenue model, in priority order:
1. **Affiliate commissions** — credit cards, banking, remittances, ITIN mortgages, tax prep (primary)
2. **Display ads** — Ezoic → Mediavine as traffic scales
3. **Lead sales** — EverQuote, MediaAlpha, QuinStreet (insurance, secondary)
4. **Direct agency listings** — sponsored local agent directory (future)

## Stack
- **Frontend:** Pure HTML/CSS/JS — no framework. 150+ HTML files.
- **Backend:** Vercel serverless functions (`api/*.js`)
- **Database:** Supabase (`agodvsflcfhfcxtlykpf`) — `leads`, `affiliate_clicks`, `newsletter_subscribers` tables
- **Email:** Resend (activated when `RESEND_API_KEY` env var is set)
- **Hosting:** Vercel — project `norte-financial` under `mauriceagbag-7030s-projects`
- **Domain:** nortefinancial.com (Namecheap → Vercel)
- **Repo:** github.com/MauriceA97/norte-financial (branch: main)

## Design System
```css
--forest: #0B3D2E   /* primary dark green */
--verde: #1D9E75    /* accent green */
--mist: #7EC4A8     /* light green */
--amber: #D4700A    /* CTA orange */
--frost: #E8F5F0    /* light green bg */
--parchment: #F7F5F1 /* page background */
--ink: #1A1A1A      /* body text */
Fonts: Playfair Display (display/headers) + DM Sans (body)
```
**DO NOT change design** — client wants zero design changes.

## Page Inventory (150+ pages)

### Core hubs (finance-first peer verticals)
```
index.html            — Homepage with Norte AI chat widget
finanzas.html         — Master finance hub
credito.html          — Credit building (ITIN-friendly)
banca.html            — ITIN-friendly banking
remesas.html          — Remittances to LatAm
impuestos.html        — Tax prep
hipotecas.html        — ITIN mortgages
prestamos.html        — Personal/business loans
seguros.html          — Insurance hub (secondary)
guias.html            — Guide index
herramientas.html     — Tools index (+ Norte AI chat)
aseguradoras.html     — Insurer directory
estados.html          — State index
florida.html          — Florida state page
```

### Quote forms (insurance — all POST to /api/submit-lead for TCPA ip+timestamp)
```
cotizar.html, cotizar-auto.html, cotizar-hogar.html,
cotizar-vida.html, cotizar-salud.html, cotizar-negocio.html
```

### Cornerstone guides (22 total, all bilingual)
```
guia-construir-credito-sin-ssn.html
guia-tarjeta-credito-con-itin.html
guia-abrir-cuenta-banco-con-itin.html
guia-enviar-dinero-mexico-barato.html
guia-itin-paso-a-paso.html
guia-eitc-child-tax-credit.html
guia-comprar-casa-con-itin.html
guia-requisitos-hipoteca-sin-ssn.html
guia-prestamos-personales-sin-ssn.html
guia-credit-score-explicado.html
guia-bancos-digitales-vs-tradicionales.html
guia-remesas-centroamerica.html
guia-aca-medicaid-espanol.html
guia-deducible.html
guia-seguro-sin-licencia.html
guia-seguro-barato-florida.html
guia-sr22-florida.html
guia-seguro-huracan-florida.html
guia-seguro-vida-hispanos.html
guia-seguro-negocio-hispanos.html
guia-comparar-seguros.html
guia-reclamacion-seguro.html
```

### Product reviews (36 total, all with Review schema + affiliate CTAs)
```
resena-wise, resena-remitly, resena-xoom, resena-western-union, resena-moneygram   (remesas)
resena-petal-2, resena-tomo, resena-capital-one-secured, resena-self, resena-mission-lane  (credito)
resena-chime, resena-sofi-money, resena-current, resena-varo, resena-bofa-safebalance       (banca)
resena-turbotax, resena-hr-block, resena-freetaxusa                                          (impuestos)
resena-alterra-hipoteca, resena-new-american-funding, resena-guild-mortgage                  (hipotecas)
resena-sofi-prestamos, resena-oportun, resena-camino-financial                               (prestamos)
resena-geico, resena-progressive, resena-state-farm, resena-allstate, resena-liberty-mutual,
resena-farmers, resena-usaa                                                                  (seguros)
```

### Editorial roundups
```
mejor-seguro-auto-barato-2026.html
mejor-seguro-hogar-florida.html
mejor-seguro-vida-hispanos.html
mejor-sr22-florida.html
mejores-aseguradoras-mal-credito.html
```

### Programmatic SEO (new — 62 pages)
```
remesas-a-{mexico,guatemala,honduras,el-salvador,nicaragua,
           republica-dominicana,colombia,peru,ecuador,cuba,
           argentina,venezuela}.html                            (12 country corridors)

tarjeta-credito-itin-{miami-fl,houston-tx,los-angeles-ca,...}.html  (50 Hispanic-metro cities)
```
Each programmatic page: ~1500 words, Spanish-first, with city/country-specific data, FAQPage + Article + BreadcrumbList schema, affiliate CTAs, internal links to hubs + reviews.

### Tools
```
calculadora-remesas.html   — 5 providers × 12 LatAm countries, live recalc
```

### Trust/legal/about
```
nosotros.html, prensa.html, contacto.html,
como-ganamos.html, metodologia.html,
privacidad.html, terminos.html, divulgacion.html
```

### Admin (noindex)
```
admin.html            — Lead dashboard (pw: Norte2025!)
admin-contenido.html  — Content Studio (52 YouTube scripts + 10 press pitches)
admin-afiliados.html  — Affiliate URL manager (new)
```

## Shared assets
```
shared.css, shared.js, mobile-fix.css
/logo/norte-*.svg (7 SVG variants for merch + press)
```

### Client-side JS modules
```
ga-config.js              — GA4 measurement ID holder (set NORTE_GA_ID to activate)
affiliate-urls.js         — Central config mapping carrier slug → real affiliate URL
norte-track.js            — Visitor ID, session, UTM capture, affiliate link wrapping, GA4 loader
norte-email.js            — Email capture (bottom bar + exit-intent modal)
norte-ads.js              — Display ads loader (dormant until NORTE_ADS is configured)
```

## Language System
Every page has ES/EN toggle. Spanish-first. Pattern:
```javascript
let currentLang = localStorage.getItem('norte_lang') || 'es';
function setLang(lang) { /* updates all data-es/data-en attributes */ }
```
Every page head includes the flash-prevention script:
```javascript
(function(){var l=localStorage.getItem('norte_lang');if(l&&l!=='es')document.documentElement.setAttribute('data-lang-init',l);})()
```
Programmatic pages (remesas corridors, city ITIN pages) are Spanish-only — too granular to translate.

## SEO infrastructure
- All pages have `<link rel="canonical">` + self-referential hreflang (es + x-default)
- Schema.org JSON-LD on all pages:
  - Homepage: `Organization` + `WebSite` + `SearchAction`
  - Hubs: `FinancialService` + `BreadcrumbList`
  - Guides: `Article` + `FAQPage` + `BreadcrumbList`
  - Reviews: `Review` + `FinancialProduct`
  - Tools: `WebApplication`
  - Programmatic pages: `Article` + `FAQPage` + `BreadcrumbList`
- `sitemap.xml` — 154 URLs, auto-generated from file inventory
- `robots.txt` — allows all, sitemap declared

## Supabase Tables

### `leads` (insurance quote form submissions)
Columns: id, created_at, insurance_type, status, zip, state, vehicle_*, garaging_*, first_name, last_name, email, phone, best_time, preferred_language, tcpa_consent, **tcpa_timestamp (server-set)**, **ip_address (server-set)**, **user_agent (server-set)**, utm_*, page_url, source, + 40+ insurance-specific fields. See `/api/submit-lead.js` for full whitelist.

### `affiliate_clicks` (outbound affiliate redirects)
Columns: id, created_at, carrier, product, placement, destination_url, visitor_id, session_id, source_page, referrer, user_agent, ip_address, utm_*.

### `newsletter_subscribers` (email list)
Columns: id, email (unique), preferred_language, source_page, capture_type, lead_magnet, visitor_id, session_id, user_agent, referrer, utm_*, ip_address, subscribed_at, unsubscribed_at, status, **drip_sent (JSONB)**.

**RLS:** anon INSERT ✓ all three tables. Anon SELECT/UPDATE ✓ on leads (admin dashboard).

## API Endpoints (Vercel serverless)

### `/api/submit-lead` (POST)
Replaces direct client-side Supabase writes from cotizar forms. Captures `ip_address`, `tcpa_timestamp`, `user_agent` server-side (required by lead buyers). All 5 cotizar-*.html forms POST here.

### `/api/click` (GET)
Affiliate click redirector. Validates destination against allowlist (60+ carriers + affiliate network tracking domains), appends subid params, logs to `affiliate_clicks`, 302-redirects. Extended allowlist now covers Impact, CJ, Rakuten, Awin, ShareASale, FlexOffers, LinkConnector, PartnerStack, BankRate, CardRatings, LendingTree, Pepperjam.

### `/api/newsletter-subscribe` (POST)
Replaces direct `newsletter_subscribers` writes from `norte-email.js`. Writes + fires welcome email via Resend if `RESEND_API_KEY` is set. Falls back to direct Supabase write if edge fn fails.

### `/api/unsubscribe` (GET + POST)
Handles email-footer clicks (GET, returns HTML confirmation page) + RFC 8058 one-click (POST, required by Gmail/Yahoo). Sets `unsubscribed_at` and `status='unsubscribed'`.

### `/api/send-drip` (GET, Vercel Cron)
Runs daily at 14:00 UTC. Computes each active subscriber's sequence day (days since `subscribed_at`), picks vertical from `lead_magnet` (credito / remesas / impuestos cycle), sends the matching drip email via Resend if not already sent. Marks `drip_sent[vertical-day] = timestamp` in JSONB to prevent duplicates.

Drip content lives in `/emails/sequences.js` + `/emails/template.js`. Currently 3 verticals × 4 follow-up emails (day 2, 5, 9, 14) × 2 languages = 24 unique drip emails.

### `/api/chat` (POST)
Claude Haiku 4.5 proxy for Norte AI chat widget. Used on index.html and herramientas.html. API key: `ANTHROPIC_API_KEY` Vercel env var.

## Affiliate URL System

`/affiliate-urls.js` is the single source of truth for every affiliate URL on the site. When an affiliate program approves Norte and gives a tracking URL:

1. Open `/admin-afiliados.html` (pw: `Norte2025!`)
2. Paste the URL for that carrier
3. Click **Export affiliate-urls.js** → copy the generated code
4. Replace `/affiliate-urls.js` entirely, deploy via `/norte-deploy.html`
5. All review pages, CTA buttons, and calculator links for that carrier update site-wide in ~60 seconds

Until a real URL is set, links fall back to the provider's public homepage (the `data-dest` attribute in HTML). The site works fine without any affiliates active.

`NORTE_AFFILIATE_META` (also in `affiliate-urls.js`) maps each carrier to its vertical, estimated payout range, application URL, and status — used by the admin manager to show priorities.

## Email system (Resend)

**Status:** infrastructure live, awaiting API key.

**To activate:**
1. Sign up at resend.com
2. Verify `nortefinancial.com` domain (add DKIM/SPF DNS records)
3. Set Vercel env vars:
   - `RESEND_API_KEY` — from resend.com/api-keys
   - `RESEND_FROM_EMAIL` — e.g., `Norte Financial <hola@nortefinancial.com>`
   - `RESEND_REPLY_TO` — e.g., `hola@nortefinancial.com` (optional)
   - `CRON_SECRET` — random string; Vercel cron uses this to auth /api/send-drip (optional but recommended)
4. Deploy

Once activated:
- New subscribers get welcome email instantly (from `/api/newsletter-subscribe.js`)
- Existing subscribers enter the drip cycle (day 2, 5, 9, 14)
- Cron fires daily at 14:00 UTC via `/api/send-drip`

## Display ads (Ezoic scaffolding)

**Status:** dormant. `/norte-ads.js` is loaded on all pages but exits quietly until `window.NORTE_ADS` is set.

**To activate:**
1. Apply to Ezoic (https://ezoic.com, ~10K monthly sessions requirement)
2. After approval, edit `/ga-config.js` to add:
   ```javascript
   window.NORTE_ADS = { network: 'ezoic', siteId: 'YOUR_SITE_ID' };
   ```
3. Deploy. Ezoic handles placement via their Site Accelerator.

Alternatives: AdSense (`network: 'adsense', publisherId: 'ca-pub-XXX'`) or Mediavine (manual snippet install).

Ad slot `<div>` markers are not added anywhere yet — intentional, to respect the "no design change" rule. When ready, add `<div class="norte-ad-slot" data-slot="..."></div>` at desired placements.

## Admin Dashboards

### `/admin.html` — Lead dashboard (pw: `Norte2025!`)
Active/Sold/Deleted tabs, stats, soft delete, sell modal with revenue capture, bulk actions, CSV export, email subscribers tab, affiliate clicks tab.

### `/admin-contenido.html` — Content Studio (pw: `Norte2025!`)
52 YouTube scripts (one per week) + 10 press pitch templates. Not yet published.

### `/admin-afiliados.html` — Affiliate URL Manager (pw: `Norte2025!`)
Single-page interface for 40+ affiliate programs. URL paste, export, deploy loop.

## Deploy Process
Use `/norte-deploy.html` — single GitHub Tree API commit → one Vercel build → auto-promotes to production. Requires a fresh GitHub token (`ghp_...`) each session.

## Key URLs
- Live site: https://nortefinancial.com
- Lead dashboard: https://nortefinancial.com/admin.html
- Content studio: https://nortefinancial.com/admin-contenido.html
- Affiliate manager: https://nortefinancial.com/admin-afiliados.html
- Vercel: vercel.com/mauriceagbag-7030s-projects/norte-financial
- Supabase: supabase.com/dashboard/project/agodvsflcfhfcxtlykpf
- GitHub: github.com/MauriceA97/norte-financial

## Revenue Readiness — Wired vs Pending

### ✅ Wired and ready
- Lead capture (TCPA-compliant with server-side IP/timestamp)
- Affiliate click tracking + subid pass-through
- Affiliate URL central config + admin manager
- Email capture → Supabase write
- Email sender infrastructure (Resend, awaiting API key)
- Drip sequence infrastructure (awaiting Vercel cron activation)
- 24 welcome/drip emails written (3 verticals × 4 follow-ups × 2 languages)
- 62 programmatic SEO pages (12 remesas corridors + 50 ITIN-credit cities)
- Schema.org JSON-LD on every page
- Sitemap with 154 URLs
- Ezoic/AdSense scaffolding (dormant)
- Norte AI chat (Claude Haiku, live)

### ⏳ Requires Maurice action
1. **Form FL LLC** + EIN + Mercury business account
2. **Virtual mailbox** (iPostal1, ~$10/mo)
3. **Google Workspace** for `@nortefinancial.com` aliases
4. **Employment lawyer** consult to read Trellis agreement
5. **Create GA4 property** → paste `G-XXXXXXXXXX` into `ga-config.js`
6. **Resend account** + domain verification + paste `RESEND_API_KEY` as Vercel env var
7. **Apply to affiliate programs** under LLC — list in `admin-afiliados.html`
8. **Paste real affiliate URLs** into admin manager as approvals land
9. **Apply to Ezoic** once site hits ~10K monthly sessions
10. **Apply to Impact / CJ / Rakuten / Awin** (gateway networks to 1000+ brands)

## Pending / Next Steps
- Additional states pages beyond Florida (TX, CA, NY, IL programmatic)
- YouTube channel launch (post-May-1 Trellis/Gen Digital close)
- Press outreach (post-disclosure)
- Lead magnet PDFs behind email gate
- Community partnerships (Hispanic Facebook groups, consulates, churches)
- Meta/Google paid ads to Hispanic interest audiences

## Client Profile
Maurice Aguilar — bilingual insurance sales professional, Miami FL. Works at Trellis/Savvy (being acquired by Gen Digital, owner of MoneyLion, May 1 2026). Playing for Gen Digital acquihire in Year 2-3 as "MoneyLion Latinx." Keep Norte passive/stealth until post-close.

Working style: direct, action-oriented, ship complete deliverables.
Style preference: clean/minimal, no decorative elements.
