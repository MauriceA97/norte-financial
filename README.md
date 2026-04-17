# Norte Financial

**Tu norte financiero.** Bilingual (ES/EN) personal finance and insurance platform for the 62M US Hispanic market. Finance-first, with an ITIN-first angle: credit cards, banking, remittances, mortgages, loans, tax prep — explained for people who don't have an SSN or don't have US credit history.

Live: [nortefinancial.com](https://nortefinancial.com)

---

## Why this exists

Mega-competitors like NerdWallet, Credit Karma, and MoneyLion are English-first and culturally generic. Their Spanish content is machine-translated from English and doesn't address the reality of immigrant and first-generation financial life: ITIN instead of SSN, sending money to family every month, filing taxes with dependents in another country, building credit from zero.

Norte Financial is the guide the author wishes had existed when he arrived in the US. Five moats it leans into:

1. **ITIN-first obsession.** Every vertical answers "what if you don't have an SSN."
2. **Spanish-native, not translated.** Regional idioms, corridor-specific remittance content.
3. **Remittance calculator moat.** Live comparison across 5 providers × 12 LatAm countries.
4. **Programmatic SEO white space.** City × vertical pages covering searches nobody answers in Spanish.
5. **Community distribution.** Relational channels (Facebook groups, consulates, churches) that algorithmic competitors can't replicate.

---

## Stack

| Layer        | Tech |
|--------------|------|
| Front-end    | Pure HTML/CSS/JS — no framework, no build step |
| Back-end     | Vercel serverless functions (Node) |
| Database     | Supabase (Postgres + RLS) |
| Email        | Resend (when `RESEND_API_KEY` is set) |
| AI chat      | Claude Haiku 4.5 via Anthropic API |
| Hosting      | Vercel (`mauriceagbag-7030s-projects/norte-financial`) |
| DNS          | Namecheap → Vercel |

**Design system:** Playfair Display + DM Sans, forest-green palette. See `shared.css` — colors and fonts are locked; do not change visual design.

---

## Repo structure

```
.
├── CONTEXT.md                        # Source of truth for Claude sessions (read first)
├── README.md                         # You are here
├── shared.css                        # Global styles + design tokens
├── shared.js                         # Currently minimal
├── mobile-fix.css                    # Mobile-specific overrides
│
├── ga-config.js                      # GA4 measurement ID holder (currently null)
├── norte-track.js                    # Visitor/session ID, UTM capture, affiliate link wrap, GA4 loader
├── affiliate-urls.js                 # Central config: carrier slug → real affiliate URL
├── norte-email.js                    # Email capture (bottom bar + exit-intent modal)
├── norte-ads.js                      # Display ads loader (dormant until NORTE_ADS is set)
│
├── index.html                        # Homepage (finance-first)
│
├── finanzas.html                     # Master finance hub
├── credito.html                      # Credit building (ITIN-friendly)
├── banca.html                        # ITIN-friendly banking
├── remesas.html                      # Remittances to Latin America
├── impuestos.html                    # Tax prep (ITIN, EITC, CTC)
├── hipotecas.html                    # ITIN mortgages
├── prestamos.html                    # Personal + business loans
├── seguros.html                      # Insurance hub (secondary vertical)
│
├── guias.html                        # Guide index
├── guia-*.html                       # 22 cornerstone guides (2K–5K words each)
│
├── resena-*.html                     # 36 product reviews (Review schema + affiliate CTAs)
├── mejor-*.html, mejores-*.html      # Editorial roundups
│
├── remesas-a-{country}.html          # 12 programmatic corridor pages
├── tarjeta-credito-itin-{city}.html  # 50 programmatic city × ITIN-credit pages
│
├── calculadora-remesas.html          # Live remittance comparison tool
├── cotizar*.html                     # 6 insurance quote forms (POST to /api/submit-lead)
├── seguro-*.html                     # 5 insurance product hub pages
├── estados.html, florida.html        # State pages
│
├── nosotros.html, prensa.html,       # Trust + brand pages
├── contacto.html, como-ganamos.html,
├── metodologia.html, privacidad.html,
├── terminos.html, divulgacion.html
│
├── admin.html                        # Lead dashboard (pw: Norte2025!)
├── admin-contenido.html              # Content Studio: 52 YouTube scripts + 10 press pitches
├── admin-afiliados.html              # Affiliate URL manager (paste + export workflow)
│
├── api/
│   ├── chat.js                       # Claude Haiku proxy for Norte AI chat
│   ├── click.js                      # Affiliate click redirector (302 + log + subid append)
│   ├── submit-lead.js                # TCPA-compliant lead intake (server-side IP + timestamp)
│   ├── newsletter-subscribe.js       # Email capture → Supabase + Resend welcome
│   ├── unsubscribe.js                # GET (HTML confirmation) + POST (RFC 8058 one-click)
│   └── send-drip.js                  # Vercel Cron target, daily drip sequencer
│
├── emails/
│   ├── template.js                   # Shared HTML frame for all transactional emails
│   └── sequences.js                  # 24 drip emails (crédito / remesas / impuestos × 4 × ES/EN)
│
├── scripts/
│   ├── gen-remesas-pages.py          # Regenerates the 12 corridor pages from country data
│   └── gen-city-credit-pages.py      # Regenerates the 50 city pages from CITIES array
│
├── logo/
│   └── norte-*.svg                   # 7 SVG logo variants (for merch, press kit)
│
├── sitemap.xml                       # 154 URLs, auto-regenerated
├── robots.txt                        # Allow all, declares sitemap
└── vercel.json                       # Function timeouts + daily cron registration
```

---

## Supabase schema

**Project:** `agodvsflcfhfcxtlykpf` (URL + anon key documented in `CONTEXT.md`; anon key is designed for client-side exposure).

### `leads`
Insurance quote submissions from `cotizar-*.html` forms. Written server-side by `/api/submit-lead.js` which captures `ip_address`, `tcpa_timestamp`, `user_agent` — required by lead buyers (EverQuote, MediaAlpha, QuinStreet) as TCPA evidence.

### `affiliate_clicks`
Outbound affiliate clicks logged by `/api/click.js`. Tracks visitor_id, session_id, carrier, product, placement, source page, full UTM, referrer, IP, destination URL.

### `newsletter_subscribers`
Email captures from `norte-email.js`. Includes `preferred_language`, `capture_type` (bottom-bar vs exit-intent), `lead_magnet`, full attribution, plus `drip_sent` (JSONB) used by the drip sequencer to prevent duplicate sends.

**RLS:** anon INSERT permitted on all three; SELECT/UPDATE permitted on `leads` for the admin dashboard.

---

## Revenue architecture

### 1. Affiliate commissions (primary)

The `/affiliate-urls.js` file is the single source of truth mapping carrier slug → real affiliate URL. Every review page, CTA button, and the remittance calculator read from this file. Until a real URL is set for a carrier, links fall back to the provider's public homepage.

**Workflow to activate a new affiliate:**
1. Apply to the program (list of 40+ in `admin-afiliados.html` with payout estimates + apply links).
2. When approved, open `/admin-afiliados.html` (pw: `Norte2025!`).
3. Paste the tracking URL for that carrier.
4. Click **Export affiliate-urls.js** → copy generated code.
5. Replace `/affiliate-urls.js` entirely → commit → push → Vercel rebuilds.
6. All 36 review pages + calculator + CTAs for that carrier update site-wide.

**Click flow:** user clicks `<a data-carrier="wise" data-dest="...">` → `norte-track.js` wraps to `/api/click?c=wise&...` → `/api/click.js` validates hostname against allowlist, appends subid params, logs to `affiliate_clicks`, 302-redirects.

Allowlist includes direct carriers (Wise, Remitly, Chime, Petal, etc.) + affiliate network tracking domains (Impact, CJ, Rakuten, Awin, ShareASale, FlexOffers, BankRate, CardRatings, LendingTree, Pepperjam).

### 2. Display ads (secondary)

`norte-ads.js` is dormant scaffolding. When `window.NORTE_ADS` is set (e.g. in `ga-config.js`), it injects the chosen ad network's loader script.

**To activate Ezoic** (recommended starter — ~10K monthly session threshold):
```js
// In ga-config.js
window.NORTE_ADS = { network: 'ezoic', siteId: 'YOUR_EZOIC_SITE_ID' };
```

Alternatives: `{ network: 'adsense', publisherId: 'ca-pub-XXX' }` or Mediavine (they install their own snippet).

Ad slot `<div>` placements are intentionally not added anywhere yet — respects the "no design change" rule. When ready, insert `<div class="norte-ad-slot" data-slot="auto"></div>` at desired locations.

### 3. Lead sales (secondary)

Insurance quote forms (cotizar-*.html) capture full lead data with TCPA consent, IP, timestamp, user agent. Leads live in Supabase `leads` and are managed via `/admin.html`. Selling is currently manual (CSV export → email buyer). Future: API integration to EverQuote / MediaAlpha postback.

### 4. Email monetization

`newsletter_subscribers` receive a welcome email on signup (from `/api/newsletter-subscribe.js`) and drip emails on days 2, 5, 9, 14 (via `/api/send-drip.js` daily cron). Drips are bilingual, vertical-specific (crédito / remesas / impuestos), and each contains affiliate-linked CTAs. See `emails/sequences.js`.

---

## Local development

No build step. Serve the directory with any static server + Vercel CLI for API routes:

```bash
# Install Vercel CLI once
npm i -g vercel

# Run locally (including /api/* serverless functions)
vercel dev

# Or just serve static files (API routes won't work)
python3 -m http.server 3000
```

The site uses inline styles + per-page `<script>` blocks for simplicity. Files are edited directly — there is no transpilation.

---

## Environment variables (Vercel)

| Var                    | Used by                        | Required? |
|------------------------|--------------------------------|-----------|
| `ANTHROPIC_API_KEY`    | `/api/chat.js` (Norte AI chat) | Yes (already set) |
| `RESEND_API_KEY`       | `/api/newsletter-subscribe.js`, `/api/send-drip.js` | Optional — email sender is dormant without it |
| `RESEND_FROM_EMAIL`    | Both email endpoints           | Defaults to `Norte Financial <hola@nortefinancial.com>` |
| `RESEND_REPLY_TO`      | Both email endpoints           | Optional |
| `CRON_SECRET`          | `/api/send-drip.js`            | Optional — recommended for cron auth |

GA4 measurement ID lives in `ga-config.js` (client-side, public — it's designed to be visible in HTML). Set `window.NORTE_GA_ID = 'G-XXXXXXXXXX'` when the GA4 property exists.

---

## Deploy

**Two options:**

**Option A — Git push (current workflow):**
```bash
git add -u && git add <new-files>
git commit -m "..."
git push origin main
```
Vercel detects the push and auto-builds → auto-promotes to production in ~60 seconds.

**Option B — Deploy tool:**
Open `/norte-deploy.html` in a browser, paste a fresh GitHub token (from github.com/settings/tokens), submit. It bundles all dirty files into a single GitHub Tree API commit → triggers one Vercel build. Useful when committing from a machine without git configured, or when avoiding multi-commit churn.

Both paths produce the same result. The tool was built originally to avoid stuck Vercel deployments from rapid multi-commit sequences, but the Vercel integration handles normal pushes fine.

Production: [vercel.com/mauriceagbag-7030s-projects/norte-financial/deployments](https://vercel.com/mauriceagbag-7030s-projects/norte-financial/deployments)

---

## SEO

- Every page has `<link rel="canonical">` + self-referential `hreflang="es"` + `hreflang="x-default"`.
- Schema.org JSON-LD on every page:
  - Homepage: `Organization` + `WebSite` + `SearchAction`
  - Hubs: `FinancialService` + `BreadcrumbList`
  - Guides: `Article` + `FAQPage` + `BreadcrumbList`
  - Reviews: `Review` + `FinancialProduct`
  - Tools: `WebApplication`
  - Programmatic pages: `Article` + `FAQPage` + `BreadcrumbList`
- `sitemap.xml` includes 154 URLs with priority + changefreq tuned per page type. Excludes admin pages.
- `robots.txt` allows all, declares sitemap.

### Programmatic pages

**Remittance corridors** (`remesas-a-{country}.html`, 12 pages) — each targets "remesas a [country] desde Estados Unidos" queries with country-specific data: annual remittance volume, top US origin states, local bank list, cash network, scenario-based provider recommendations, $500 example calculation, 5 FAQ questions. Generated by `scripts/gen-remesas-pages.py`.

**City × ITIN credit** (`tarjeta-credito-itin-{city}-{state}.html`, 50 pages) — each targets "tarjeta de crédito con ITIN en [ciudad]" queries with local Hispanic population stats, top origin country group, 5 ITIN-friendly card recommendations with affiliate CTAs (Petal 2, Capital One Secured, Self, Tomo, Mission Lane), local bank list, 5 FAQ questions. Generated by `scripts/gen-city-credit-pages.py`.

Both generators are idempotent — rerun them after editing the data array to regenerate pages.

---

## Language system

Every text element uses `data-es="..." data-en="..."` attributes. JavaScript toggle in the footer swaps content based on `localStorage['norte_lang']`. A head-level inline script prevents flash of untranslated content:

```js
(function(){var l=localStorage.getItem('norte_lang');if(l&&l!=='es')document.documentElement.setAttribute('data-lang-init',l);})()
```

Default: Spanish (`<html lang="es">`). Programmatic corridor and city pages are Spanish-only — too granular to translate manually.

---

## Admin access

Three admin pages, all password-protected client-side (simple password check, not role-based):

| Page | Purpose | Password |
|------|---------|----------|
| `/admin.html` | Lead dashboard: active/sold/deleted tabs, sell modal with revenue, CSV export, affiliate click funnel, newsletter subscriber list | `Norte2025!` |
| `/admin-contenido.html` | Content Studio: 52 pre-written YouTube scripts (~200 words each), 10 press pitch templates for La Opinión, El Diario, Axios Latino, Univision, Telemundo, etc. | `Norte2025!` |
| `/admin-afiliados.html` | Affiliate URL manager: paste affiliate tracking URLs for 40+ carriers, export as `affiliate-urls.js` replacement | `Norte2025!` |

These pages include `<meta name="robots" content="noindex, nofollow">` and are excluded from `sitemap.xml`.

---

## Roadmap — what's wired vs what's pending

### ✅ Wired
- Lead capture with server-side TCPA fields
- Affiliate click tracking + central URL config
- Email capture + Resend send infrastructure + drip sequencer
- 24 drip emails (crédito / remesas / impuestos × 4 days × ES/EN)
- 62 programmatic SEO pages
- Schema.org + hreflang on every page
- Ezoic/AdSense loader (dormant)
- Claude-powered Norte AI chat
- Admin dashboards for leads, content, affiliates

### ⏳ Pending operational setup
1. Form FL LLC, get EIN, open Mercury business account
2. Virtual mailbox (iPostal1, ~$10/mo)
3. Google Workspace for `@nortefinancial.com` email aliases
4. Create GA4 property, paste ID into `ga-config.js`
5. Sign up for Resend, verify domain, set `RESEND_API_KEY` env var
6. Apply to affiliate programs (list in `admin-afiliados.html`)
7. Apply to Ezoic or AdSense when traffic supports it
8. Apply to umbrella networks: Impact, CJ, Rakuten, Awin, ShareASale, FlexOffers

### 📋 Content/distribution pending
- Additional state pages beyond Florida (TX, CA, NY, IL)
- YouTube channel launch (52 scripts already written in Content Studio)
- Press outreach to 10 pre-drafted pitches
- Lead magnet PDFs gated behind email capture
- Community partnerships (Hispanic Facebook groups, consulates, churches)
- Paid acquisition tests (Meta, Google) to Hispanic interest audiences

---

## Editorial & legal

- **Editorial independence:** Norte Financial receives compensation from some affiliate partners. Rankings, reviews, and comparisons are not influenced by compensation. Full disclosure at `/divulgacion.html`.
- **Byline:** "Equipo Editorial Norte Financial." All content is reviewed by the editorial team; no personal bylines currently.
- **Not advice:** content is educational only, not legal, tax, or financial advice. Users should consult licensed professionals for their specific situation.
- **Privacy:** See `/privacidad.html` for TCPA, CCPA, CPRA disclosures.
- **Terms:** See `/terminos.html`.

---

## License & ownership

All rights reserved. This repository is private and not licensed for redistribution. Content is copyright © 2026 Norte Financial. Logo and brand marks are proprietary.

---

## Contact

- Editorial / press: `prensa@nortefinancial.com`
- Partnerships: `socios@nortefinancial.com`
- General: `hola@nortefinancial.com`
- Privacy: `privacidad@nortefinancial.com`

Based in Miami, FL.

---

## Session handoff — resuming work on another machine

### Setup on a fresh machine (Windows, Mac, or Linux)

**1. Install tooling (one-time):**
- **Git**: https://git-scm.com/download (Windows: includes Git Bash + Git GUI)
- **Node.js LTS**: https://nodejs.org — needed for `vercel dev` and Claude Code
- **VS Code**: https://code.visualstudio.com (optional but recommended)
- **Claude Code**: `npm install -g @anthropic-ai/claude-code`
- **GitHub Desktop** (optional but convenient on Windows for credential management): https://desktop.github.com

**2. Clone the repo:**
```bash
# Windows PowerShell:
cd $env:USERPROFILE
git clone https://github.com/MauriceA97/norte-financial.git
cd norte-financial

# Mac/Linux:
cd ~
git clone https://github.com/MauriceA97/norte-financial.git
cd norte-financial
```

**3. Start Claude Code and continue:**
```bash
claude
```

Tell Claude:
> *"Read CONTEXT.md and README.md. I'm resuming work on Norte Financial. Show me the pending task list and let's continue where we left off."*

Claude will read the architecture, then check the pending build-sprint list below and pick up.

---

### Build-sprint status (as of last commit `cf10b7b`)

#### ✅ Shipped in this sprint
- [x] Affiliate URL central config (`affiliate-urls.js` + `/admin-afiliados.html`)
- [x] Extended affiliate click allowlist (Impact, CJ, Rakuten, Awin, etc.)
- [x] TCPA-compliant lead intake (`/api/submit-lead.js`)
- [x] Email sender via Resend (`/api/newsletter-subscribe.js`, `/api/unsubscribe.js`, `/api/send-drip.js`)
- [x] 24 drip emails (crédito / remesas / impuestos × 4 days × ES/EN)
- [x] 12 programmatic remesas corridor pages (`remesas-a-{country}.html`)
- [x] 50 programmatic city ITIN-credit pages (`tarjeta-credito-itin-{city}-{state}.html`)
- [x] Schema.org + hreflang added to every page
- [x] Sitemap regenerated (154 URLs)
- [x] Display ad loader scaffolding (`norte-ads.js`, dormant)
- [x] Como-ganamos.html refreshed for finance-first
- [x] Metodologia.html expanded with 6-pillar framework for financial products (insurance kept)

#### ⏳ Pending in this sprint (pick up from here)
1. **Refresh `nosotros.html`** content for finance-first positioning
2. **State pages**: `texas.html`, `california.html`, `nueva-york.html` — follow `florida.html` pattern but finance-first (ITIN banking, remesas corridors from state, bilingual financial resources)
3. **8 head-term comparison pages**: Wise vs Remitly, Wise vs Western Union, Remitly vs Xoom, Petal vs Tomo, Capital One Secured vs Petal, TurboTax vs FreeTaxUSA, TurboTax vs H&R Block, Chime vs SoFi
4. **Cross-linking blocks** on all reviews + programmatic pages — script-inject "Related reviews" (3) + "Related guides" (2) per page
5. **Visible breadcrumbs** on deep pages (schema is there; visible nav isn't)
6. **Dynamic OG image generator** — `/api/og.js` using `@vercel/og` + package.json, wire `og:image` + `twitter:card` meta tags site-wide
7. **robots.txt + favicon audit** — `Disallow: /admin*`, ensure favicon set is complete
8. **Credit score estimator** — `/calculadora-credito.html` (interactive, similar UX to remittance calc)
9. **ITIN mortgage affordability calculator** — `/calculadora-hipoteca-itin.html`
10. **Tax refund estimator (ITIN-aware)** — `/calculadora-impuestos.html` with EITC/CTC logic
11. **Weekly newsletter sender** — `/api/send-weekly.js` Vercel cron
12. **Double opt-in** for email signups
13. **Internal site search** — `/buscar.html` with client-side JSON index
14. **Hub page internal linking audit** — verify all 7 finance hubs link to all related reviews + guides
15. **Error tracking scaffold** — `norte-errors.js` dormant Sentry loader

Each item is independently shippable and safe to tackle in any order.

---

### Operational prerequisites still on the human (Maurice)

These can't be done by Claude — they require real-world action:

1. Form **FL LLC** (sunbiz.org, ~$125, ~5 days)
2. **EIN** from IRS (free, irs.gov, instant)
3. **Virtual mailbox** (iPostal1 Miami, ~$10/mo)
4. **Mercury** business bank account
5. **Google Workspace** for `@nortefinancial.com` email aliases (~$6/user)
6. **Employment lawyer** consult ($300-500) to review employer agreement for IP/non-compete
7. **Create GA4 property** → paste `G-XXXXXXXXXX` into `ga-config.js`
8. **Resend** account + verify `nortefinancial.com` domain (DKIM/SPF DNS) + set `RESEND_API_KEY` as Vercel env var
9. **Apply to affiliate programs** under the LLC — `admin-afiliados.html` lists 40 with application URLs + payout estimates

---

### Environment variables summary

Set these in Vercel (vercel.com → project → Settings → Environment Variables):

| Var | Purpose | Status |
|-----|---------|--------|
| `ANTHROPIC_API_KEY` | Norte AI chat widget | ✅ set |
| `RESEND_API_KEY` | Email welcome + drip sends | ⏳ pending |
| `RESEND_FROM_EMAIL` | `Norte Financial <hola@nortefinancial.com>` | ⏳ pending |
| `RESEND_REPLY_TO` | Reply-to for emails | ⏳ optional |
| `CRON_SECRET` | Auth for `/api/send-drip` Vercel Cron | ⏳ optional |

---

### Commit conventions

Use imperative present-tense subject under 70 chars. Include summary of what + why. Co-authorship tag for Claude-assisted commits:

```
Short subject under 70 chars

Longer explanation of what changed and why. Include impact
on revenue, SEO, or compliance if relevant.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Deploy: push to `main` — Vercel auto-builds and promotes to production in ~60s. Or open `/norte-deploy.html` in a browser and use the single-commit workflow there.

---

### Key files to know when resuming

| File | Read for |
|------|----------|
| `CONTEXT.md` | Source of truth — architecture, tables, endpoints, revenue model |
| `README.md` | This file — setup, handoff, build sprint status |
| `affiliate-urls.js` | Central config for every affiliate URL on the site |
| `emails/sequences.js` | The 24 drip emails (3 verticals × 4 × ES/EN) |
| `scripts/gen-remesas-pages.py` | Regenerates the 12 corridor pages |
| `scripts/gen-city-credit-pages.py` | Regenerates the 50 city pages |
| `api/send-drip.js` | How the drip sequencer works + how to add new sequences |
| `norte-track.js` | Visitor/session tracking + affiliate link wrapping |
| `ga-config.js` | GA4 and ads loader config holder (currently null) |
