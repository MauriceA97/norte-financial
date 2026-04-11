# Norte Financial — Claude Code Project Context

## What This Is
Norte Financial (`nortefinancial.com`) is a NerdWallet-style insurance lead generation platform targeting 62M US Hispanics. Spanish-first, bilingual (ES/EN toggle on every page). Revenue model: EverQuote affiliate, Google AdSense, agency sponsorships, direct lead sales.

## Stack
- **Frontend:** Pure HTML/CSS/JS — no framework. 33 files.
- **Backend:** Vercel serverless function (`api/chat.js`) — Claude Haiku proxy
- **Database:** Supabase (`agodvsflcfhfcxtlykpf`) — `leads` table
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

## File Map
```
index.html              — Homepage with Norte AI chat widget
cotizar.html            — Quote hub (routes to dedicated forms)
cotizar-auto.html       — Auto insurance quote (5 steps, 45 fields)
cotizar-hogar.html      — Home insurance quote (4 steps, 38 fields)
cotizar-vida.html       — Life insurance quote (single page, 35 fields)
cotizar-salud.html      — Health insurance quote (single page, 30 fields)
cotizar-negocio.html    — Business insurance quote (single page, 32 fields)
seguro-auto.html        — Auto insurance info page
seguro-hogar.html       — Home insurance info page
seguro-vida.html        — Life insurance info page
seguro-medico.html      — Health insurance info page
seguro-negocio.html     — Business insurance info page
seguros.html            — Insurance hub page
guias.html              — Guides index page
guia-deducible.html           — What is a deductible (full content)
guia-seguro-sin-licencia.html — Insurance without US license in FL
guia-seguro-barato-florida.html — Cheap car insurance FL 2025
guia-sr22-florida.html        — SR-22/FR-44 complete guide
guia-seguro-huracan-florida.html — Hurricane insurance FL
guia-seguro-vida-hispanos.html  — Life insurance for Hispanics
guia-aca-medicaid-espanol.html  — ACA/Medicaid/CHIP 2025
guia-seguro-negocio-hispanos.html — Business insurance for Hispanics
guia-comparar-seguros.html     — How to compare quotes (5 mistakes)
guia-reclamacion-seguro.html   — How to file a claim
herramientas.html       — Tools page + Norte AI chat widget
estados.html            — States page
florida.html            — Florida-specific page
nosotros.html           — About page
admin.html              — Lead dashboard (pw: Norte2025!)
shared.css              — Shared styles
shared.js               — Shared JS
api/chat.js             — Vercel serverless function (Claude Haiku proxy)
vercel.json             — Vercel config (maxDuration: 10)
```

## Language System
Every page has ES/EN toggle. Pattern on every page:
```javascript
let currentLang = localStorage.getItem('norte_lang') || 'es';
function setLang(lang) { /* updates all data-es/data-en attributes */ }
```
HTML uses `data-es="..."` and `data-en="..."` attributes on every text element.
Head script prevents flash: `(function(){var l=localStorage.getItem('norte_lang');if(l&&l!=='es')document.documentElement.setAttribute('data-lang-init',l);})()`

## Supabase — Leads Table
**Project ID:** `agodvsflcfhfcxtlykpf`
**URL:** `https://agodvsflcfhfcxtlykpf.supabase.co`
**Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2R2c2ZsY2ZoZmN4dGx5a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU2NTMsImV4cCI6MjA5MTMzMTY1M30.KDg8lPRPfyMXYQ6SQK3LcoIhSFqNZBAELlJIUWRC9mw`

**Leads table columns (all TEXT unless noted):**
id (uuid), created_at (timestamp), insurance_type, status, zip, state,
vehicle_year, vehicle_make, vehicle_model, vehicle_trim, vehicle_vin,
vehicle_ownership, vehicle_use, annual_miles, garaging_zip, garaging_state,
num_vehicles, has_license, current_insurance, first_name, last_name,
email, phone, best_time, preferred_language, tcpa_consent (bool),
tcpa_timestamp, ip_address, utm_source, utm_medium, utm_campaign,
page_url, source, dob, gender, marital_status, education, occupation,
homeowner, license_status, license_state, license_years, license_number,
has_additional_drivers, accidents_3yr, violations_3yr, dui, sr22,
current_carrier, current_coverage_level, years_insured, coverage_type,
liability_limits, deductible, effective_date, addons_requested,
discounts_applicable, address, city, preferred_contact, notes,
contacted_at, sold_at, deleted (bool), deleted_at, deleted_reason,
revenue, sold_to, lead_package

**RLS Policies:** anon INSERT ✓, anon SELECT ✓, anon UPDATE ✓

## Norte AI Chat (api/chat.js)
- Endpoint: `/api/chat` (POST)
- Body: `{ message: string, language: 'es'|'en' }`
- Response: `{ reply: string }`
- Model: `claude-haiku-4-5-20251001`
- API key: stored as `ANTHROPIC_API_KEY` in Vercel env vars
- System prompt: bilingual insurance assistant, max 3 paragraphs, CTA to cotizar.html
- Used on: `herramientas.html` and `index.html`

## Admin Dashboard (admin.html)
- Password: `Norte2025!` (changeable in dashboard)
- Features: Active/Sold/Deleted tabs, stats, soft delete, sell modal with revenue, send package, export CSV, bulk actions
- Reads from Supabase leads table

## Quote Forms → Supabase Flow
All 5 quote forms submit directly to Supabase `/rest/v1/leads` via fetch POST.
Forms show success screen regardless — errors fall back to localStorage backup.
All forms link back to `cotizar.html` type tiles which redirect to dedicated forms.

## Deploy Process
Use the deploy tool (`norte-deploy.html`) — single GitHub Tree API commit → one Vercel build → auto-promotes to production.
- Requires fresh GitHub token (ghp_...) each session from github.com/settings/tokens
- One commit = one Vercel deployment = no stuck/stale deployments
- After deploying, verify at: vercel.com/mauriceagbag-7030s-projects/norte-financial/deployments

## Key URLs
- Live site: https://nortefinancial.com
- Admin: https://nortefinancial.com/admin.html
- Vercel dashboard: vercel.com/mauriceagbag-7030s-projects/norte-financial
- Vercel env vars: vercel.com/mauriceagbag-7030s-projects/norte-financial/settings/environment-variables
- Supabase: supabase.com/dashboard/project/agodvsflcfhfcxtlykpf
- GitHub repo: github.com/MauriceA97/norte-financial
- Anthropic console: console.anthropic.com

## Current State (as of April 2026)
✅ Full site live with 33 pages
✅ 5 dedicated quote forms (auto/home/life/health/business) — all fields save to Supabase
✅ Norte AI chat widget on index.html and herramientas.html — powered by Claude Haiku
✅ 10 full-content bilingual guides (no more stubs)
✅ Admin dashboard with lead management, revenue tracking, soft delete
✅ Single-commit deploy tool — no more stuck Vercel deployments
✅ Language system (ES/EN) on all pages

## Pending / Next Steps
- Affiliate partnership submissions (EverQuote, GEICO, Progressive, etc.)
- Language toggle "twitch" on herramientas/estados pages (on hold per client)
- Additional states pages beyond Florida
- Blog/content section for SEO
- Google Analytics integration
- Google AdSense setup

## Client Profile
Maurice Aguilar — bilingual insurance sales professional, Miami FL.
Works toward Florida 2-20 commercial license.
Direct competitor: NerdWallet (nerdwallet.com/insurance)
Platform targets dealership-embedded insurance + direct Hispanic market.
Style preference: clean/minimal, no decorative elements.
Working style: direct, action-oriented, wants complete executable deliverables.
