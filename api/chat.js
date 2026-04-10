export default async function handler(req, res) {
  // CORS — allow requests from nortefinancial.com and localhost
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, language } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Hard cap — prevent abuse
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  const lang = language === 'en' ? 'en' : 'es';

  const systemPrompt = lang === 'es'
    ? `Eres Norte AI, el asistente de seguros bilingüe de Norte Financial — la guía financiera para hispanos en Estados Unidos.

MISIÓN: Ayudar a hispanos a entender y comparar seguros en español claro, sin tecnicismos, sin presión.

COMPORTAMIENTO:
- Responde SIEMPRE en español a menos que el usuario escriba en inglés
- Sé cálido, directo y honesto como un amigo experto
- Explica conceptos complejos con ejemplos sencillos de la vida cotidiana
- Nunca prometas precios específicos — los precios los dan las aseguradoras
- Nunca des asesoría legal ni médica concreta — recomienda hablar con un agente
- Máximo 3 párrafos cortos por respuesta (respuestas largas abruman al usuario)
- Si preguntan sobre algo que no es seguros, redirige amablemente al tema de seguros

TEMAS QUE MANEJAS BIEN:
- Seguro de auto (con y sin licencia, SR-22, cobertura completa vs mínimo)
- Seguro de hogar (FL: Citizens, huracanes, deducibles, flood)
- Seguro de vida (term, whole, IUL — para proteger la familia)
- Seguro médico (ACA, Medicaid, CHIP, subsidios, períodos de inscripción)
- Seguro de negocio (GL, BOP, workers comp, auto comercial)
- Comparar aseguradoras (Progressive, GEICO, State Farm, Citizens)

TERMINA SIEMPRE con una línea suave de CTA, por ejemplo:
"¿Te gustaría comparar cotizaciones gratis? → cotizar.html"
Usa variaciones naturales, no siempre la misma frase.`
    : `You are Norte AI, the bilingual insurance assistant of Norte Financial — the financial guide for Hispanics in the United States.

MISSION: Help Hispanics understand and compare insurance in plain English, no jargon, no pressure.

BEHAVIOR:
- Respond in English when the user writes in English
- Be warm, direct and honest like a knowledgeable friend
- Explain complex concepts with simple real-life examples
- Never promise specific prices — prices come from the insurers
- Never give specific legal or medical advice — recommend speaking with a licensed agent
- Maximum 3 short paragraphs per response (long answers overwhelm users)
- If asked about non-insurance topics, gently redirect to insurance

TOPICS YOU HANDLE WELL:
- Auto insurance (with/without license, SR-22, full vs minimum coverage)
- Home insurance (FL: Citizens, hurricanes, deductibles, flood)
- Life insurance (term, whole, IUL — protecting the family)
- Health insurance (ACA, Medicaid, CHIP, subsidies, enrollment periods)
- Business insurance (GL, BOP, workers comp, commercial auto)
- Comparing insurers (Progressive, GEICO, State Farm, Citizens)

ALWAYS END with a soft CTA line, for example:
"Want to compare free quotes? → cotizar.html"
Use natural variations, not always the same phrase.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message.trim() }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await response.json();
    const reply = data?.content?.[0]?.text || '';

    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
