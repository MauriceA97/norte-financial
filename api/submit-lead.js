// Norte Financial — Lead submission edge function
// =================================================
//
// Forms POST their payload here instead of directly to Supabase. This
// function captures the client IP from request headers (which the browser
// cannot do reliably) and adds a server-side tcpa_timestamp before writing
// to the `leads` table.
//
// IP + timestamp are REQUIRED by most affiliate/lead-buyer networks
// (EverQuote, MediaAlpha, QuinStreet, etc.) as TCPA compliance evidence.
// Without them, leads are rejected or discounted.
//
// Usage from the front-end (replaces direct Supabase POST):
//   fetch('/api/submit-lead', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//   })
//
// The endpoint returns 200 on success, 4xx on validation errors. Forms
// show the success screen on 200 OR on network error (fall-through is OK
// because localStorage backup catches failures).

const SUPABASE_URL = 'https://agodvsflcfhfcxtlykpf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2R2c2ZsY2ZoZmN4dGx5a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU2NTMsImV4cCI6MjA5MTMzMTY1M30.KDg8lPRPfyMXYQ6SQK3LcoIhSFqNZBAELlJIUWRC9mw';

// Whitelist of column names we accept from the form body. Anything else is
// dropped. This protects the database from arbitrary writes via the anon key.
const ALLOWED_FIELDS = new Set([
  'insurance_type', 'status', 'zip', 'state',
  'vehicle_year', 'vehicle_make', 'vehicle_model', 'vehicle_trim', 'vehicle_vin',
  'vehicle_ownership', 'vehicle_use', 'annual_miles', 'garaging_zip', 'garaging_state',
  'num_vehicles', 'has_license', 'current_insurance', 'first_name', 'last_name',
  'email', 'phone', 'best_time', 'preferred_language', 'tcpa_consent',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
  'page_url', 'source', 'dob', 'gender', 'marital_status', 'education', 'occupation',
  'homeowner', 'license_status', 'license_state', 'license_years', 'license_number',
  'has_additional_drivers', 'accidents_3yr', 'violations_3yr', 'dui', 'sr22',
  'current_carrier', 'current_coverage_level', 'years_insured', 'coverage_type',
  'liability_limits', 'deductible', 'effective_date', 'addons_requested',
  'discounts_applicable', 'address', 'city', 'preferred_contact', 'notes',
  'home_type', 'home_year_built', 'home_sqft', 'home_construction',
  'home_roof_year', 'home_alarm', 'home_pool', 'home_claims_5yr',
  'home_coverage_type', 'home_dwelling_coverage', 'home_personal_property',
  'home_liability', 'home_deductible', 'home_flood', 'home_effective_date',
  'age', 'smoker', 'tobacco', 'height', 'weight', 'health_conditions',
  'coverage_amount', 'term_length', 'beneficiary', 'beneficiary_relationship',
  'household_size', 'household_income', 'dependents', 'currently_covered',
  'business_name', 'business_type', 'industry', 'annual_revenue', 'num_employees',
  'years_in_business', 'business_address', 'business_state', 'business_zip',
  'coverage_types_needed'
]);

function sanitize(val, maxLen) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return String(val).slice(0, maxLen || 128);
  if (typeof val === 'string') return val.slice(0, maxLen || 512);
  return null;
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

function buildPayload(body, req) {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) {
    if (ALLOWED_FIELDS.has(k)) {
      const lim = (k === 'notes' || k === 'address' || k === 'page_url') ? 2000 : 512;
      out[k] = sanitize(v, lim);
    }
  }
  // Server-side fields — authoritative, ignore anything client sent for these
  out.ip_address     = getClientIp(req);
  out.tcpa_timestamp = new Date().toISOString();
  out.user_agent     = typeof req.headers['user-agent'] === 'string'
    ? req.headers['user-agent'].slice(0, 512) : null;
  // Default status for new leads
  if (!out.status) out.status = 'new';
  return out;
}

export default async function handler(req, res) {
  // Only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  // Vercel parses JSON automatically when Content-Type is application/json,
  // but be defensive in case it's a string.
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing body' });
  }

  // Basic required-field validation. Block completely empty submits only.
  if (!body.email && !body.phone) {
    return res.status(400).json({ error: 'Missing email or phone' });
  }

  const payload = buildPayload(body, req);

  // Forward to Supabase
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const text = await r.text();
      // Log the Supabase error server-side but don't leak it to the client
      console.error('submit-lead supabase error', r.status, text);
      return res.status(502).json({ error: 'Upstream write failed' });
    }
  } catch (e) {
    console.error('submit-lead fetch error', e);
    return res.status(502).json({ error: 'Upstream unavailable' });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true });
}
