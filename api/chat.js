export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, language } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim().length === 0)
    return res.status(400).json({ error: 'Message is required' });
  if (message.length > 1000)
    return res.status(400).json({ error: 'Message too long' });

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Debug: return key info without exposing it
  if (!apiKey) return res.status(500).json({ error: 'NO_API_KEY' });
  if (!apiKey.startsWith('sk-ant')) return res.status(500).json({ error: 'BAD_KEY_PREFIX:' + apiKey.substring(0,10) });

  const lang = language === 'en' ? 'en' : 'es';

  const systemPrompt = lang === 'es'
    ? `Eres Norte AI, el asistente de seguros bilingüe de Norte Financial. Ayuda a hispanos a entender seguros en español claro, sin presión. Responde en máximo 3 párrafos cortos. Termina siempre con: "¿Te gustaría comparar cotizaciones gratis? → cotizar.html"`
    : `You are Norte AI, bilingual insurance assistant of Norte Financial. Help users understand insurance clearly, no pressure. Max 3 short paragraphs. Always end with: "Want to compare free quotes? → cotizar.html"`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: message.trim() }]
      })
    });

    const rawText = await response.text();

    if (!response.ok) {
      return res.status(502).json({ error: 'ANTHROPIC_ERROR', status: response.status, detail: rawText.substring(0, 200) });
    }

    const data = JSON.parse(rawText);
    const reply = data?.content?.[0]?.text || '';
    if (!reply) return res.status(502).json({ error: 'EMPTY_REPLY', raw: rawText.substring(0,200) });

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'EXCEPTION', message: err.message, stack: err.stack?.substring(0,300) });
  }
}
