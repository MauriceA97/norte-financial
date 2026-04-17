// Norte Financial — email HTML template renderer
// ================================================
//
// One shared HTML frame for every drip email so brand + layout stay
// consistent. Call renderEmail({...}) and it returns a string of HTML
// ready to POST to Resend.

const BRAND_HEADER = `
<div style="background:#0B3D2E;padding:24px;border-radius:12px 12px 0 0;text-align:center">
  <div style="color:#fff;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:500">Norte</div>
  <div style="color:rgba(232,245,240,0.6);font-size:10px;letter-spacing:0.18em;text-transform:uppercase">Financial</div>
</div>
`.trim();

function renderFooter(lang, unsubscribeUrl) {
  const es = `Recibes este correo porque te suscribiste en nortefinancial.com. <a href="${unsubscribeUrl}" style="color:#9A9A9A;text-decoration:underline">Darse de baja</a>`;
  const en = `You're receiving this because you signed up at nortefinancial.com. <a href="${unsubscribeUrl}" style="color:#9A9A9A;text-decoration:underline">Unsubscribe</a>`;
  const signatureEs = '— Equipo Editorial Norte Financial<br>Miami, FL · <a href="https://nortefinancial.com" style="color:#1D9E75">nortefinancial.com</a>';
  const signatureEn = '— Norte Financial Editorial Team<br>Miami, FL · <a href="https://nortefinancial.com" style="color:#1D9E75">nortefinancial.com</a>';
  return {
    signature: lang === 'en' ? signatureEn : signatureEs,
    unsub: lang === 'en' ? en : es
  };
}

export function renderEmail({ subject, headline, preview, bodyHtml, ctaLabel, ctaUrl, lang, unsubscribeUrl }) {
  const { signature, unsub } = renderFooter(lang, unsubscribeUrl);
  const cta = ctaUrl && ctaLabel
    ? `<div style="text-align:center;margin:32px 0">
         <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;background:#D4700A;color:#fff;text-decoration:none;border-radius:100px;font-weight:500;font-size:15px">${ctaLabel}</a>
       </div>`
    : '';
  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>${subject}</title>
${preview ? `<meta name="description" content="${preview}">` : ''}
</head>
<body style="margin:0;padding:0;background:#F7F5F1;font-family:'DM Sans',-apple-system,Helvetica,sans-serif;color:#1A1A1A">
${preview ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent">${preview}</div>` : ''}
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
  ${BRAND_HEADER}
  <div style="background:#fff;padding:40px 32px;border-radius:0 0 12px 12px;border:1px solid rgba(11,61,46,0.08);border-top:0">
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:500;margin:0 0 20px;color:#0B3D2E;line-height:1.2">${headline}</h1>
    ${bodyHtml}
    ${cta}
    <p style="font-size:14px;line-height:1.7;color:#7A7A7A;margin:24px 0 0;border-top:1px solid rgba(11,61,46,0.08);padding-top:20px">${signature}</p>
  </div>
  <p style="font-size:11px;color:#9A9A9A;text-align:center;padding:16px 0 0;line-height:1.6">${unsub}</p>
</div>
</body></html>`;
}
