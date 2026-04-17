// Norte Financial — Drip email sequences
// ========================================
//
// Three verticals: credito, remesas, impuestos.
// Each has 4 follow-up emails (day 2, 5, 9, 14 after signup).
// Day 0 welcome lives in /api/newsletter-subscribe.js.
//
// Sequence selection: subscribers are assigned a sequence based on
// `lead_magnet` at signup. The generic "weekly-newsletter" bucket cycles
// through all three verticals.
//
// Each email is bilingual (es/en) with the same shape:
//   { subject, headline, preview, bodyHtml, ctaLabel, ctaUrl }
// ctaUrl uses a hash carrier slug like "#petal" which /api/send-drip.js
// resolves via NORTE_AFFILIATE_URLS at send time, so URL changes in
// affiliate-urls.js propagate automatically.

export const SEQUENCES = {
  // ==================== CRÉDITO ====================
  credito: {
    es: [
      {
        day: 2,
        subject: 'Los 3 errores que destruyen tu crédito (y cómo evitarlos)',
        preview: 'El error #2 es el más común entre hispanos — y cuesta hasta 100 puntos de score.',
        headline: '3 errores que destruyen tu crédito',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Muchos hispanos llegan a EE.UU. sin historial crediticio. Eso <strong style="color:#1A1A1A">no</strong> es el problema. El problema es cometer uno de estos tres errores cuando ya tienen su primera tarjeta:</p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong style="color:#1A1A1A">Usar más del 30% del límite.</strong> Si tu tarjeta es de $500, nunca pases de $150 de saldo. Los bureaus interpretan uso alto como desesperación financiera.</li>
            <li><strong style="color:#1A1A1A">Cerrar tu primera tarjeta.</strong> Tu historial promedio cuenta. Cerrar una tarjeta vieja borra años de historial de un solo golpe — hasta 100 puntos de caída.</li>
            <li><strong style="color:#1A1A1A">Aplicar a muchas tarjetas al mismo tiempo.</strong> Cada "hard inquiry" baja tu score 5-10 puntos. Espera 3 meses entre aplicaciones.</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Si ya cometiste alguno de estos errores, no te preocupes — el crédito se arregla. La clave es empezar con una <strong style="color:#1A1A1A">tarjeta que reporte a los 3 bureaus</strong> (Equifax, Experian, TransUnion) y usarla correctamente por 6 meses.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Nuestra recomendación para empezar: <strong style="color:#0B3D2E">Petal 2</strong>. Acepta ITIN, no requiere historial, no cobra anual, y reporta a los 3 bureaus.</p>
        `,
        ctaLabel: 'Ver reseña completa de Petal 2 →',
        ctaUrl: 'https://nortefinancial.com/resena-petal-2.html'
      },
      {
        day: 5,
        subject: 'La primera tarjeta para quien no tiene historial (ITIN aceptado)',
        preview: 'Sin SSN, sin historial, sin problema. Esta es la opción con mejor reputación en 2026.',
        headline: 'Tu primera tarjeta de crédito',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Hay dos rutas para construir crédito sin historial en EE.UU.:</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Ruta 1: Tarjeta asegurada.</strong> Depositas $200-500, ese es tu límite. Capital One Secured es la más conocida. Reporta a los 3 bureaus. Después de 6-12 meses de pagos a tiempo, te devuelven el depósito y te dan una tarjeta no-asegurada.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Ruta 2: Tarjeta sin depósito (ITIN aceptado).</strong> Petal 2 y Tomo Credit evalúan tu flujo bancario, no tu score. Si puedes mostrar ingresos constantes por 2-3 meses en una cuenta bancaria, te aprueban sin historial previo.</p>
          <div style="background:#E8F5F0;border-left:4px solid #1D9E75;padding:18px 22px;border-radius:8px;margin:0 0 16px">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#0B3D2E"><strong>Nuestro análisis:</strong> si tienes $200 disponibles para depósito, Capital One Secured es más rápido. Si prefieres no amarrar dinero, Petal 2 es mejor.</p>
          </div>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Cualquiera que elijas, las reglas son las mismas: <strong style="color:#1A1A1A">no pases del 30% del límite</strong> y <strong style="color:#1A1A1A">paga el saldo completo cada mes</strong>. 6 meses después tendrás un score inicial.</p>
        `,
        ctaLabel: 'Comparar Capital One vs Petal 2 →',
        ctaUrl: 'https://nortefinancial.com/credito.html'
      },
      {
        day: 9,
        subject: 'Cómo aumentar tu score 50 puntos en 90 días',
        preview: 'Método probado con datos de los 3 bureaus. Requiere disciplina — no trucos.',
        headline: '+50 puntos en 90 días',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Tu score de crédito se calcula con 5 factores. Dos de ellos valen el <strong style="color:#1A1A1A">65% del total</strong>. Si dominas estos dos, subes rápido:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong style="color:#1A1A1A">Historial de pagos (35%):</strong> nunca pagues tarde. Ni un día. Automatiza el pago mínimo para asegurarte.</li>
            <li><strong style="color:#1A1A1A">Utilización (30%):</strong> mantén el saldo reportado bajo el 10% — idealmente 1-3%. Si tu tarjeta es de $500, reporta $5-15, no $150.</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Técnica avanzada:</strong> paga tu tarjeta DOS veces al mes — una vez antes del cierre del ciclo (así reporta saldo bajo) y otra al recibir el estado de cuenta (para no cargar intereses).</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Si quieres acelerar aún más: <strong style="color:#0B3D2E">Self</strong> ofrece un "credit builder loan" — tú depositas $25-150/mes durante 12-24 meses, ellos lo reportan a los 3 bureaus como si fuera un préstamo pagado puntualmente. Al final recibes el dinero de vuelta + historial positivo. Para quien no puede calificar a nada tradicional, es el atajo.</p>
        `,
        ctaLabel: 'Ver reseña de Self →',
        ctaUrl: 'https://nortefinancial.com/resena-self.html'
      },
      {
        day: 14,
        subject: 'De tarjeta básica a premium: el camino',
        preview: 'Cuándo subir de Capital One Secured a una Chase Sapphire. Timing importa.',
        headline: 'Tu siguiente paso después de la primera tarjeta',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Llevas 6-12 meses con tu primera tarjeta, score ya está en 650-700. ¿Qué sigue?</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">No saltes directo a premium.</strong> El error más común es aplicar a una Chase Sapphire o Amex Gold con score de 680 — te van a negar porque esas tarjetas requieren 720+ y historial de 2-3 años.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">La escalera correcta:</p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong>Mes 0-12:</strong> Tarjeta inicial (Capital One Secured, Petal 2, Mission Lane)</li>
            <li><strong>Mes 12-18:</strong> Pide upgrade con tu mismo banco — sin hard inquiry</li>
            <li><strong>Mes 18-24:</strong> Agrega una segunda tarjeta sin anual (Discover it, Capital One Quicksilver)</li>
            <li><strong>Mes 24+:</strong> Ahora sí — tarjetas con beneficios premium</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Ir paso a paso te da 3 ventajas: <strong style="color:#1A1A1A">historial promedio más largo</strong>, <strong style="color:#1A1A1A">diversidad de crédito</strong>, y <strong style="color:#1A1A1A">menos rechazos</strong> (cada rechazo deja huella 2 años).</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Gracias por leer hasta aquí. La próxima semana te mandamos algo sobre remesas — si mandas dinero a Latinoamérica, probablemente estás perdiendo $200-500 al año sin saberlo.</p>
        `,
        ctaLabel: 'Explorar todas las guías de crédito →',
        ctaUrl: 'https://nortefinancial.com/credito.html'
      }
    ],
    en: [
      {
        day: 2,
        subject: '3 mistakes that destroy your credit (and how to avoid them)',
        preview: 'Mistake #2 is the most common among Hispanics — and costs up to 100 points.',
        headline: '3 mistakes that destroy your credit',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Many Hispanics arrive in the US without credit history. That is <strong style="color:#1A1A1A">not</strong> the problem. The problem is making one of these three mistakes after getting the first card:</p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong style="color:#1A1A1A">Using more than 30% of the limit.</strong> If your card is $500, never carry more than $150. Bureaus read high usage as financial stress.</li>
            <li><strong style="color:#1A1A1A">Closing your first card.</strong> Average age of accounts matters. Closing an old card wipes years of history — up to 100 point drop.</li>
            <li><strong style="color:#1A1A1A">Applying for many cards at once.</strong> Each hard inquiry drops your score 5-10 points. Wait 3 months between applications.</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">If you already made one of these mistakes, don't worry — credit is fixable. The key is starting with a <strong style="color:#1A1A1A">card that reports to all 3 bureaus</strong> (Equifax, Experian, TransUnion) and using it correctly for 6 months.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Our starter recommendation: <strong style="color:#0B3D2E">Petal 2</strong>. Accepts ITIN, no history required, no annual fee, reports to all 3 bureaus.</p>
        `,
        ctaLabel: 'Read full Petal 2 review →',
        ctaUrl: 'https://nortefinancial.com/resena-petal-2.html'
      },
      {
        day: 5,
        subject: 'Your first credit card with no history (ITIN accepted)',
        preview: 'No SSN, no history, no problem. The most reputable option in 2026.',
        headline: 'Your first credit card',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">There are two routes to build credit with no history:</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Route 1: Secured card.</strong> Deposit $200-500, that becomes your limit. Capital One Secured is the best known. Reports to all 3 bureaus. After 6-12 months of on-time payments, they return your deposit and upgrade you to unsecured.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Route 2: No-deposit card (ITIN accepted).</strong> Petal 2 and Tomo Credit evaluate your bank flow, not your score. If you can show steady income for 2-3 months, you can get approved with no prior history.</p>
          <div style="background:#E8F5F0;border-left:4px solid #1D9E75;padding:18px 22px;border-radius:8px;margin:0 0 16px">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#0B3D2E"><strong>Our take:</strong> if you have $200 free for a deposit, Capital One Secured is faster. If you prefer not to lock up money, Petal 2 wins.</p>
          </div>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Whichever you choose, rules are the same: <strong style="color:#1A1A1A">stay under 30% of limit</strong> and <strong style="color:#1A1A1A">pay the full balance monthly</strong>. 6 months later you'll have an initial score.</p>
        `,
        ctaLabel: 'Compare Capital One vs Petal 2 →',
        ctaUrl: 'https://nortefinancial.com/credito.html'
      },
      {
        day: 9,
        subject: '+50 score points in 90 days',
        preview: 'Proven method with 3-bureau data. Requires discipline — no tricks.',
        headline: '+50 points in 90 days',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Your credit score is calculated from 5 factors. Two of them are worth <strong style="color:#1A1A1A">65% of the total</strong>. Master these two and you climb fast:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong style="color:#1A1A1A">Payment history (35%):</strong> never pay late. Not even a day. Automate the minimum payment to be safe.</li>
            <li><strong style="color:#1A1A1A">Utilization (30%):</strong> keep reported balance under 10% — ideally 1-3%. If your card is $500, report $5-15, not $150.</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Pro technique:</strong> pay your card TWICE a month — once before statement close (so it reports a low balance) and again when the statement posts (to avoid any interest).</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">To accelerate further: <strong style="color:#0B3D2E">Self</strong> offers a credit builder loan — you deposit $25-150/month for 12-24 months, they report it to all 3 bureaus as a punctually-paid loan. At the end you get the money back + positive history. For anyone who can't qualify for anything traditional, this is the shortcut.</p>
        `,
        ctaLabel: 'Read Self review →',
        ctaUrl: 'https://nortefinancial.com/resena-self.html'
      },
      {
        day: 14,
        subject: 'From basic to premium card: the path',
        preview: 'When to move from Capital One Secured to Chase Sapphire. Timing matters.',
        headline: 'Your next step after the first card',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">You've had your first card for 6-12 months, score is 650-700. What's next?</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Don't jump straight to premium.</strong> The most common mistake is applying for a Chase Sapphire or Amex Gold with a 680 score — they'll deny because those cards require 720+ and 2-3 years of history.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">The correct ladder:</p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong>Month 0-12:</strong> Starter card (Capital One Secured, Petal 2, Mission Lane)</li>
            <li><strong>Month 12-18:</strong> Request upgrade with same bank — no hard inquiry</li>
            <li><strong>Month 18-24:</strong> Add a second no-annual card (Discover it, Capital One Quicksilver)</li>
            <li><strong>Month 24+:</strong> Now — premium rewards cards</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Step-by-step gives 3 advantages: <strong style="color:#1A1A1A">longer account history</strong>, <strong style="color:#1A1A1A">credit mix</strong>, and <strong style="color:#1A1A1A">fewer denials</strong> (each denial leaves a mark for 2 years).</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Thanks for reading this far. Next week we'll cover remittances — if you send money to Latin America, you're probably losing $200-500/year without knowing it.</p>
        `,
        ctaLabel: 'Explore all credit guides →',
        ctaUrl: 'https://nortefinancial.com/credito.html'
      }
    ]
  },

  // ==================== REMESAS ====================
  remesas: {
    es: [
      {
        day: 2,
        subject: 'El error de $500/año que cometes cada vez que envías dinero',
        preview: 'Western Union y MoneyGram ganan el 8% de cada envío. Hay formas de pagar 1%.',
        headline: 'Estás perdiendo $500/año sin saberlo',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Enviar $500/mes a México con Western Union te cuesta ~$40 entre comisión ($5-8) y margen escondido de tipo de cambio (~6-8%). Son <strong style="color:#1A1A1A">$480 al año</strong> que nunca ves porque están "dentro" del tipo de cambio.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Wise cobra comisión visible de <strong style="color:#1A1A1A">~0.65%</strong> y usa el tipo de cambio real (el que ves en Google). Mismos $500 a México: ~$3.30 de comisión total. <strong style="color:#0B3D2E">Ahorro: $440/año</strong>.</p>
          <div style="background:#E8F5F0;border-left:4px solid #1D9E75;padding:18px 22px;border-radius:8px;margin:0 0 16px">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#0B3D2E"><strong>Cuenta rápida:</strong> envía a nuestra calculadora el monto y país que tú envías. Te mostramos exactamente cuánto pierdes y cuánto puedes ahorrar al cambiar.</p>
          </div>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">La excepción:</strong> si tu familia solo puede recibir en efectivo (sin cuenta bancaria), Wise no aplica — necesitas Remitly Express o Western Union agent network. Pero si tienen cuenta bancaria, Wise es casi siempre la opción más barata.</p>
        `,
        ctaLabel: 'Ver mi ahorro en la calculadora →',
        ctaUrl: 'https://nortefinancial.com/calculadora-remesas.html'
      },
      {
        day: 5,
        subject: 'Wise vs Remitly vs Xoom: cuál te conviene',
        preview: 'Depende del país, el monto, y cómo recibe tu familia. Guía de 2 minutos.',
        headline: 'Wise vs Remitly vs Xoom',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Cada proveedor gana en un escenario distinto. Esta es la tabla rápida:</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
            <tr style="border-bottom:2px solid #0B3D2E">
              <td style="padding:10px 8px;font-weight:500;color:#0B3D2E">Escenario</td>
              <td style="padding:10px 8px;font-weight:500;color:#0B3D2E">Ganador</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">Monto &gt; $200, receptor con cuenta bancaria</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Wise</strong></td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">Primera transferencia (necesitas rápido)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Remitly Express</strong> ($3.99, minutos)</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">Receptor en efectivo (sin cuenta)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Remitly</strong> o <strong>Western Union</strong></td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">Ya tienes PayPal (conveniencia)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Xoom</strong> (pero más caro)</td>
            </tr>
            <tr>
              <td style="padding:10px 8px;color:#4A4A4A">Envíos grandes ($5K+, inversión/compra)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Wise</strong> (% fijo sin importar monto)</td>
            </tr>
          </table>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:16px 0">Para envíos recurrentes, Wise casi siempre gana. Ahorros del 2-6% por envío se acumulan rápido.</p>
        `,
        ctaLabel: 'Ver reseña completa de Wise →',
        ctaUrl: 'https://nortefinancial.com/resena-wise.html'
      },
      {
        day: 9,
        subject: 'Por qué Western Union te cobra 8% (y tú ni te das cuenta)',
        preview: 'El margen escondido del tipo de cambio es el verdadero costo. Te explicamos.',
        headline: 'El margen escondido de Western Union',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Si envías $500 a México con Western Union, la comisión visible es $5-8. Parece barato. Pero el tipo de cambio que te dan NO es el real.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Ejemplo real:</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Tipo de cambio real (Google, el "mid-market"): 1 USD = 20.40 MXN</li>
            <li>Western Union te da: 1 USD = 19.20 MXN</li>
            <li>Diferencia: 1.20 MXN por dólar = <strong style="color:#D4700A">5.9% margen escondido</strong></li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">En $500 USD, ese margen son $29.50 que pierdes en tipo de cambio, MÁS los $6 de comisión visible. Total real: <strong style="color:#D4700A">$35.50 (7.1% del envío)</strong>.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Wise, en cambio, <strong style="color:#1A1A1A">usa el tipo de cambio real de Google</strong> y te cobra ~0.65% visible. Mismos $500 = ~$3.30 total. Ahorro: $32/envío. Al año (12 envíos): <strong style="color:#0B3D2E">$384 extra para tu familia</strong>.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Por eso construimos nuestra calculadora — para que veas la diferencia real con los montos y países que tú envías.</p>
        `,
        ctaLabel: 'Calcular cuánto pierdo →',
        ctaUrl: 'https://nortefinancial.com/calculadora-remesas.html'
      },
      {
        day: 14,
        subject: 'La estrategia combo: remesas + crédito',
        preview: 'Envía por Wise y construye crédito con Chime. Dos pájaros de un tiro.',
        headline: 'Remesas + crédito: la estrategia combo',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Si ya mandas dinero a Latinoamérica cada mes, estás moviendo efectivo. Ese flujo puedes usarlo también para <strong style="color:#1A1A1A">construir historial crediticio</strong>.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Combo óptimo:</strong></p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Abre una cuenta Chime o SoFi (acepta ITIN, gratis, sin historial).</li>
            <li>Transfiere tu nómina ahí (o dinero para remesas).</li>
            <li>Desde esa cuenta, usa Wise para enviar a México/Centroamérica. Ahorras el 5-7% vs Western Union.</li>
            <li>Activa la tarjeta de débito Chime → pide gratis su "Credit Builder" que usa tu cuenta como garantía. Cada compra construye historial.</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Resultado después de 12 meses:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>~$400 ahorrados en remesas (vs WU/MoneyGram)</li>
            <li>Score de crédito inicial de 650-680</li>
            <li>Cuenta bancaria establecida en EE.UU. — requisito para aplicar a hipoteca después</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Esta es la razón por la que construimos Norte Financial — para que hispanos en EE.UU. usen las mismas estrategias que usan los nacidos aquí, ajustadas para ITIN y realidades de inmigrante.</p>
        `,
        ctaLabel: 'Ver guía completa de Chime →',
        ctaUrl: 'https://nortefinancial.com/resena-chime.html'
      }
    ],
    en: [
      {
        day: 2,
        subject: 'The $500/year mistake you make every time you send money',
        preview: 'Western Union and MoneyGram earn 8% on every transfer. Ways to pay 1%.',
        headline: "You're losing $500/year without knowing it",
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Sending $500/month to Mexico via Western Union costs ~$40 between visible fee ($5-8) and hidden exchange-rate margin (~6-8%). That's <strong style="color:#1A1A1A">$480/year</strong> you never see because it's baked into the rate.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Wise charges a visible fee of <strong style="color:#1A1A1A">~0.65%</strong> and uses the real mid-market rate (the one you see on Google). Same $500 to Mexico: ~$3.30 total cost. <strong style="color:#0B3D2E">Savings: $440/year</strong>.</p>
          <div style="background:#E8F5F0;border-left:4px solid #1D9E75;padding:18px 22px;border-radius:8px;margin:0 0 16px">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#0B3D2E"><strong>Quick math:</strong> enter your amount and country in our calculator. We show you exactly how much you're losing and saving.</p>
          </div>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Exception:</strong> if your family can only receive cash (no bank account), Wise doesn't apply — you need Remitly Express or Western Union's agent network. But if they have a bank account, Wise is almost always cheapest.</p>
        `,
        ctaLabel: 'See my savings in the calculator →',
        ctaUrl: 'https://nortefinancial.com/calculadora-remesas.html'
      },
      {
        day: 5,
        subject: 'Wise vs Remitly vs Xoom: which one for you',
        preview: 'Depends on country, amount, and how your family receives. 2-min guide.',
        headline: 'Wise vs Remitly vs Xoom',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Each wins in a different scenario. Quick table:</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
            <tr style="border-bottom:2px solid #0B3D2E">
              <td style="padding:10px 8px;font-weight:500;color:#0B3D2E">Scenario</td>
              <td style="padding:10px 8px;font-weight:500;color:#0B3D2E">Winner</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">Amount &gt; $200, recipient has bank account</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Wise</strong></td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">First transfer (needs fast)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Remitly Express</strong> ($3.99, minutes)</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">Cash pickup (no account)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Remitly</strong> or <strong>Western Union</strong></td>
            </tr>
            <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
              <td style="padding:10px 8px;color:#4A4A4A">Already use PayPal (convenience)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Xoom</strong> (but pricier)</td>
            </tr>
            <tr>
              <td style="padding:10px 8px;color:#4A4A4A">Large transfers ($5K+)</td>
              <td style="padding:10px 8px;color:#1A1A1A"><strong>Wise</strong> (flat % regardless of amount)</td>
            </tr>
          </table>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:16px 0">For recurring sends, Wise almost always wins. 2-6% savings per transfer add up fast.</p>
        `,
        ctaLabel: 'Read full Wise review →',
        ctaUrl: 'https://nortefinancial.com/resena-wise.html'
      },
      {
        day: 9,
        subject: "Why Western Union charges 8% (and you don't notice)",
        preview: 'The hidden exchange-rate margin is the real cost. We explain.',
        headline: "Western Union's hidden margin",
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">If you send $500 to Mexico via Western Union, the visible fee is $5-8. Seems cheap. But the exchange rate they give you is NOT the real one.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Real example:</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Real rate (Google, "mid-market"): 1 USD = 20.40 MXN</li>
            <li>Western Union gives you: 1 USD = 19.20 MXN</li>
            <li>Difference: 1.20 MXN per dollar = <strong style="color:#D4700A">5.9% hidden margin</strong></li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">On $500 USD, that margin is $29.50 lost in exchange rate, PLUS $6 visible fee. Real total: <strong style="color:#D4700A">$35.50 (7.1% of transfer)</strong>.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Wise instead <strong style="color:#1A1A1A">uses Google's real rate</strong> and charges ~0.65% visible. Same $500 = ~$3.30 total. Savings: $32/transfer. Over a year (12 transfers): <strong style="color:#0B3D2E">$384 extra for your family</strong>.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">That's why we built our calculator — so you see the real difference with your amounts and countries.</p>
        `,
        ctaLabel: 'Calculate what I lose →',
        ctaUrl: 'https://nortefinancial.com/calculadora-remesas.html'
      },
      {
        day: 14,
        subject: 'The combo strategy: remittances + credit',
        preview: 'Send via Wise and build credit with Chime. Two birds one stone.',
        headline: 'Remittances + credit: the combo',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">If you send money to Latin America each month, you're already moving cash. That flow can also <strong style="color:#1A1A1A">build credit history</strong>.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Optimal combo:</strong></p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Open a Chime or SoFi account (accepts ITIN, free, no history needed).</li>
            <li>Move your paycheck there (or money earmarked for remittances).</li>
            <li>From that account, use Wise to send to Mexico/Central America. Save 5-7% vs Western Union.</li>
            <li>Activate Chime's debit card → enable free Credit Builder which uses your own money as collateral. Every purchase builds history.</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Result after 12 months:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>~$400 saved on remittances (vs WU/MoneyGram)</li>
            <li>Starter credit score of 650-680</li>
            <li>Established US bank account — required for mortgage later</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">This is why we built Norte Financial — so Hispanics in the US can use the same strategies US-born people use, adjusted for ITIN and immigrant realities.</p>
        `,
        ctaLabel: 'Read full Chime guide →',
        ctaUrl: 'https://nortefinancial.com/resena-chime.html'
      }
    ]
  },

  // ==================== IMPUESTOS ====================
  impuestos: {
    es: [
      {
        day: 2,
        subject: 'Cómo obtener tu ITIN en 60 días o menos',
        preview: 'El IRS dice 7 semanas. En la práctica se puede hacer más rápido si evitas 3 errores.',
        headline: 'ITIN en 60 días: la guía práctica',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">El ITIN (Individual Taxpayer Identification Number) es el número que te da el IRS para declarar impuestos sin SSN. Es gratis, se pide con el formulario W-7, y con él puedes:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Declarar impuestos y calificar para créditos (EITC limitado, CTC sí)</li>
            <li>Abrir cuenta bancaria</li>
            <li>Pedir tarjetas de crédito ITIN-friendly (Petal 2, Capital One)</li>
            <li>Pedir préstamos / hipoteca ITIN</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Los 3 errores que atrasan tu ITIN:</strong></p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong>Mandar pasaporte original por correo.</strong> El IRS te lo devuelve pero tarda 2-3 meses. Usa un Certifying Acceptance Agent (CAA) — revisan tu pasaporte en persona y no lo mandan.</li>
            <li><strong>Aplicar sin declaración de impuestos adjunta.</strong> Necesitas presentar el W-7 JUNTO con una 1040. Si aplicas solo, te lo rechazan.</li>
            <li><strong>Usar un documento de identidad incorrecto.</strong> Sin pasaporte, necesitas DOS documentos de los 13 permitidos. La mayoría no los conoce.</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">H&R Block y la mayoría de oficinas de impuestos grandes tienen CAAs certificados. Costo: $100-200. Evita los "gestores" no certificados — pueden tardar meses más.</p>
        `,
        ctaLabel: 'Ver guía completa de ITIN →',
        ctaUrl: 'https://nortefinancial.com/guia-itin-paso-a-paso.html'
      },
      {
        day: 5,
        subject: 'EITC + CTC: el dinero que el gobierno te debe',
        preview: 'Muchos hispanos dejan $3K-$8K al año sobre la mesa sin saberlo. Qué calificas.',
        headline: 'El dinero que no sabías que te tocaba',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Hay dos créditos federales que le pueden dar <strong style="color:#1A1A1A">miles de dólares</strong> a familias de ingresos bajos/medios que declaran impuestos:</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#0B3D2E">CTC (Child Tax Credit) — 2026:</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Hasta <strong>$2,000 por hijo menor de 17 años</strong></li>
            <li>Los hijos necesitan SSN (nacidos en EE.UU.); padres pueden tener ITIN</li>
            <li>Aplica incluso si declaras con ITIN — no pierdes este crédito</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#0B3D2E">EITC (Earned Income Tax Credit):</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Hasta <strong>$7,830 para familias con 3+ hijos</strong> (2026)</li>
            <li><strong>REQUIERE SSN</strong> — tanto padres como hijos. Declarantes con ITIN no califican para EITC federal</li>
            <li>Algunos estados (CA, NY, WA) tienen EITC estatal que SÍ acepta ITIN</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Escenario real:</strong> familia de 4 con ingresos de $35K, 2 hijos con SSN, padres con ITIN:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>CTC: $4,000 ($2K × 2 hijos)</li>
            <li>EITC federal: $0 (padres no tienen SSN)</li>
            <li>EITC estatal si viven en CA: ~$1,200</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Total: ~$5,200 que podrían perder si no declaran correctamente.</p>
        `,
        ctaLabel: 'Leer guía EITC + CTC →',
        ctaUrl: 'https://nortefinancial.com/guia-eitc-child-tax-credit.html'
      },
      {
        day: 9,
        subject: 'FreeTaxUSA vs TurboTax: quién gana con ITIN',
        preview: 'TurboTax cobra $130+. FreeTaxUSA cobra $15. Diferencia real: hay matices.',
        headline: 'FreeTaxUSA vs TurboTax para ITIN',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Si tu declaración es simple (W-2 + algún 1099, sin negocio, sin inversiones), <strong style="color:#0B3D2E">FreeTaxUSA</strong> gana por completo: federal gratis, estatal $14.99. Soporta ITIN desde la primera pantalla.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">TurboTax cobra $60-130 por el federal y $59 por estatal. Su ventaja es interfaz más pulida y soporte en vivo — pero para 80% de declarantes, FreeTaxUSA hace exactamente el mismo cálculo al 10% del precio.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Cuándo SÍ pagar por TurboTax o H&R Block:</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Necesitas aplicar al ITIN por primera vez — H&R Block tiene CAAs</li>
            <li>Tienes negocio propio con 1099s complejos</li>
            <li>Declaras ingresos de varios estados</li>
            <li>Vendiste propiedades o tienes ganancias de capital</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Regla simple:</strong> si tu formulario se llena en menos de 30 minutos en cualquier plataforma, usa FreeTaxUSA. Si te tarda más de una hora o te confunde algo, vale la pena pagar por TurboTax Live o ir a H&R Block.</p>
        `,
        ctaLabel: 'Ver reseña de FreeTaxUSA →',
        ctaUrl: 'https://nortefinancial.com/resena-freetaxusa.html'
      },
      {
        day: 14,
        subject: 'Prepárate HOY para taxes 2027',
        preview: 'Lo que haces en abril-diciembre decide cuánto debes o recibes en febrero.',
        headline: 'Taxes 2027: empieza hoy',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">La mayoría piensa en impuestos en enero-abril. Gran error. Las decisiones que realmente mueven la aguja suceden el resto del año:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong style="color:#1A1A1A">Abril-Junio:</strong> Si tuviste balance grande este año, ajusta tu W-4 o paga impuestos estimados para evitar multa el próximo.</li>
            <li><strong style="color:#1A1A1A">Julio-Septiembre:</strong> Abre una IRA tradicional ($7K deducibles). Incluso con ITIN puedes contribuir si tienes ingresos.</li>
            <li><strong style="color:#1A1A1A">Octubre-Diciembre:</strong> Si tienes negocio, compra equipo/software antes del 31 dic para deducir este año.</li>
            <li><strong style="color:#1A1A1A">Todo el año:</strong> Guarda recibos de gastos médicos, donaciones, millas de trabajo. Apps como Expensify los capturan automáticamente.</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Tip específico para ITIN:</strong> si aún no tienes ITIN pero declaras este año, pide uno YA. La renovación/nueva toma 2-7 semanas y sin él no puedes presentar electrónicamente, lo que atrasa tu reembolso 2-4 meses.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Eso es todo de impuestos por ahora. La próxima semana te mandamos información sobre hipotecas con ITIN — el 95% de hispanos no sabe que puede comprar casa sin SSN, y muchos lenders nativos ni siquiera saben decir que sí es posible.</p>
        `,
        ctaLabel: 'Ver todas las guías de impuestos →',
        ctaUrl: 'https://nortefinancial.com/impuestos.html'
      }
    ],
    en: [
      {
        day: 2,
        subject: 'How to get your ITIN in 60 days or less',
        preview: 'IRS says 7 weeks. In practice it can go faster if you avoid 3 mistakes.',
        headline: 'ITIN in 60 days: practical guide',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">The ITIN is the IRS-issued number for filing taxes without an SSN. It's free, requested via form W-7, and enables you to:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>File taxes and claim credits (CTC yes, EITC limited)</li>
            <li>Open a bank account</li>
            <li>Apply for ITIN-friendly credit cards (Petal 2, Capital One)</li>
            <li>Apply for loans / ITIN mortgage</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">3 mistakes that delay your ITIN:</strong></p>
          <ol style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong>Mailing the original passport.</strong> IRS returns it but takes 2-3 months. Use a Certifying Acceptance Agent (CAA) — they verify your passport in person and don't mail it.</li>
            <li><strong>Applying without an attached tax return.</strong> You need to submit the W-7 WITH a 1040. Solo applications get rejected.</li>
            <li><strong>Using wrong supporting ID.</strong> Without a passport, you need TWO of the 13 accepted documents. Most people don't know which.</li>
          </ol>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">H&R Block and most major tax offices have certified CAAs. Cost: $100-200. Avoid uncertified "gestores" — they often delay months.</p>
        `,
        ctaLabel: 'Read full ITIN guide →',
        ctaUrl: 'https://nortefinancial.com/guia-itin-paso-a-paso.html'
      },
      {
        day: 5,
        subject: 'EITC + CTC: the money the government owes you',
        preview: 'Many Hispanics leave $3K-$8K/year on the table. What you qualify for.',
        headline: 'The money you didn\'t know was yours',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Two federal credits can give <strong style="color:#1A1A1A">thousands of dollars</strong> to low/middle-income families who file taxes:</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#0B3D2E">CTC (Child Tax Credit) — 2026:</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Up to <strong>$2,000 per child under 17</strong></li>
            <li>Kids need SSN (US-born); parents can have ITIN</li>
            <li>Applies even if you file with ITIN</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#0B3D2E">EITC (Earned Income Tax Credit):</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>Up to <strong>$7,830 for families with 3+ kids</strong> (2026)</li>
            <li><strong>REQUIRES SSN</strong> for parents and children. ITIN filers don't qualify for federal EITC</li>
            <li>Some states (CA, NY, WA) have state EITC that ACCEPTS ITIN</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Real scenario:</strong> family of 4, $35K income, 2 kids with SSN, parents with ITIN:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>CTC: $4,000 ($2K × 2 kids)</li>
            <li>Federal EITC: $0 (parents don't have SSN)</li>
            <li>California state EITC: ~$1,200</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Total: ~$5,200 potentially lost if they don't file correctly.</p>
        `,
        ctaLabel: 'Read EITC + CTC guide →',
        ctaUrl: 'https://nortefinancial.com/guia-eitc-child-tax-credit.html'
      },
      {
        day: 9,
        subject: 'FreeTaxUSA vs TurboTax: who wins with ITIN',
        preview: 'TurboTax charges $130+. FreeTaxUSA charges $15. Real difference: nuances.',
        headline: 'FreeTaxUSA vs TurboTax for ITIN',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">If your return is simple (W-2 + some 1099, no business, no investments), <strong style="color:#0B3D2E">FreeTaxUSA</strong> wins: federal free, state $14.99. Supports ITIN from screen one.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">TurboTax charges $60-130 for federal and $59 for state. Its edge is polished UI and live support — but for 80% of filers, FreeTaxUSA does the exact same math at 10% of the price.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">When to pay for TurboTax or H&R Block:</strong></p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li>First-time ITIN application — H&R Block has CAAs</li>
            <li>Self-employment with complex 1099s</li>
            <li>Multi-state income</li>
            <li>Sold property or have capital gains</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Rule of thumb:</strong> if your return fills in under 30 minutes on any platform, use FreeTaxUSA. If it takes over an hour or confuses you, TurboTax Live or H&R Block are worth the cost.</p>
        `,
        ctaLabel: 'Read FreeTaxUSA review →',
        ctaUrl: 'https://nortefinancial.com/resena-freetaxusa.html'
      },
      {
        day: 14,
        subject: 'Prepare TODAY for 2027 taxes',
        preview: 'What you do April-December decides what you owe or receive in February.',
        headline: '2027 taxes: start today',
        bodyHtml: `
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">Most people think about taxes Jan-Apr. Big mistake. The decisions that really move the needle happen the rest of the year:</p>
          <ul style="font-size:15px;line-height:1.9;color:#4A4A4A;padding-left:22px;margin:0 0 16px">
            <li><strong style="color:#1A1A1A">Apr-Jun:</strong> If you had a big balance due, adjust your W-4 or pay estimated taxes to avoid penalty next year.</li>
            <li><strong style="color:#1A1A1A">Jul-Sep:</strong> Open a traditional IRA ($7K deductible). Even with ITIN you can contribute if you have earned income.</li>
            <li><strong style="color:#1A1A1A">Oct-Dec:</strong> If you have a business, buy equipment/software before Dec 31 to deduct this year.</li>
            <li><strong style="color:#1A1A1A">All year:</strong> Save receipts for medical expenses, donations, work mileage. Apps like Expensify capture automatically.</li>
          </ul>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px"><strong style="color:#1A1A1A">Specific tip for ITIN:</strong> if you don't have an ITIN yet but are filing this year, request one NOW. Renewal/new takes 2-7 weeks and without it you can't e-file, which delays your refund 2-4 months.</p>
          <p style="font-size:16px;line-height:1.7;color:#4A4A4A;margin:0 0 16px">That's it for taxes. Next week we'll cover ITIN mortgages — 95% of Hispanics don't know they can buy a house without SSN, and many US-native lenders don't even know to say yes.</p>
        `,
        ctaLabel: 'See all tax guides →',
        ctaUrl: 'https://nortefinancial.com/impuestos.html'
      }
    ]
  }
};
