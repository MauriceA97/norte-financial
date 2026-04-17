#!/usr/bin/env python3
"""Generate 12 country-corridor landing pages for remittances.

Each page targets "remesas a [country]" / "enviar dinero a [country]" queries.
Pages are ~1200 words Spanish (primary search language for this audience)
with country-specific data, provider comparison, FAQ schema, and calculator link.

Run from repo root:
    python3 scripts/gen-remesas-pages.py
"""

import os
import json
import sys

SITE = 'https://nortefinancial.com'
OUT_DIR = '.'

# Country data. Remittance volumes per year (USD billions) from World Bank
# Migration and Development Brief + KNOMAD 2024/2025 estimates. These figures
# are used in copy but presented as "estimates" so they remain broadly
# accurate without misrepresenting exact values.
COUNTRIES = [
    {
        'slug': 'mexico', 'name_es': 'México', 'currency': 'MXN', 'currency_name_es': 'peso mexicano', 'rate_mid': 20.40,
        'remit_billion_usd': 63, 'rank': 1, 'source_states': ['California', 'Texas', 'Illinois', 'Nueva York', 'Florida'],
        'popular_providers_note': 'Mexico tiene la red de pagadores más desarrollada del mundo — todos los grandes proveedores (Wise, Remitly, Western Union, Xoom, MoneyGram, Remit2, Ria, Servicios Azteca) compiten aquí, lo cual mantiene las comisiones bajas.',
        'key_corridor_fact': 'Es el corredor de remesas más grande del mundo. En un mes típico ingresan casi $5 mil millones de dólares a México desde EE.UU.',
        'banks_common': 'BBVA, Banorte, Santander, HSBC, Banco Azteca, Citibanamex',
        'cash_network': 'OXXO, Elektra, Banco Azteca, Telecomm',
        'best_for_scenarios': [
            {'scenario': 'Envío recurrente a cuenta bancaria', 'winner': 'Wise', 'why': 'Tipo de cambio mid-market real y comisión visible de ~0.65%'},
            {'scenario': 'Envío urgente a recoger en OXXO', 'winner': 'Remitly Express', 'why': 'Minutos a OXXO/Elektra, $3.99 comisión'},
            {'scenario': 'Primera vez, receptor sin cuenta', 'winner': 'Remitly Economy', 'why': 'Recogida en efectivo en 40K+ ubicaciones, 1-3 días'},
            {'scenario': 'Envío grande ($2K+)', 'winner': 'Wise', 'why': 'El % es fijo — ahorro máximo en montos altos'}
        ]
    },
    {
        'slug': 'guatemala', 'name_es': 'Guatemala', 'currency': 'GTQ', 'currency_name_es': 'quetzal', 'rate_mid': 7.85,
        'remit_billion_usd': 19, 'rank': 9, 'source_states': ['California', 'Florida', 'Texas', 'Nueva York', 'New Jersey'],
        'popular_providers_note': 'Guatemala depende mucho del efectivo y de los bancos locales. Western Union históricamente ha dominado pero Wise y Remitly han ganado terreno rápidamente entre guatemaltecos más jóvenes.',
        'key_corridor_fact': 'Las remesas representan cerca del 20% del PIB guatemalteco — uno de los porcentajes más altos de América Latina.',
        'banks_common': 'Banrural, Banco Industrial, G&T Continental, BAM',
        'cash_network': 'Banrural (más de 1500 agencias), Western Union, MoneyGram, Elektra',
        'best_for_scenarios': [
            {'scenario': 'Envío a cuenta Banrural (muy común)', 'winner': 'Wise o Remitly', 'why': 'Ambos depositan directo; Wise gana en monto, Remitly en velocidad'},
            {'scenario': 'Recogida en efectivo rural', 'winner': 'Western Union', 'why': 'Red rural más densa del país'},
            {'scenario': 'Envíos mensuales a familia', 'winner': 'Wise', 'why': 'Ahorro del 4-6% vs Western Union se acumula rápido'},
            {'scenario': 'Envío urgente', 'winner': 'Remitly Express', 'why': 'Minutos a Banrural, $3.99'}
        ]
    },
    {
        'slug': 'honduras', 'name_es': 'Honduras', 'currency': 'HNL', 'currency_name_es': 'lempira', 'rate_mid': 24.70,
        'remit_billion_usd': 9.7, 'rank': 13, 'source_states': ['Texas', 'Florida', 'California', 'Nueva York', 'Luisiana'],
        'popular_providers_note': 'Honduras depende históricamente de Western Union y agencias locales. Wise y Remitly son opciones crecientes para quienes tienen familia con cuenta bancaria.',
        'key_corridor_fact': 'Las remesas son cerca del 27% del PIB hondureño — uno de los más altos del continente.',
        'banks_common': 'Banco Atlántida, Banco Occidente, BAC Credomatic, Ficohsa',
        'cash_network': 'Western Union, MoneyGram, Banco Atlántida, Elektra',
        'best_for_scenarios': [
            {'scenario': 'Envío recurrente a cuenta BAC o Atlántida', 'winner': 'Wise', 'why': 'Comisión visible, mejor tipo de cambio'},
            {'scenario': 'Recogida en efectivo en pueblos', 'winner': 'Western Union', 'why': 'Red más amplia en zonas rurales'},
            {'scenario': 'Envío rápido', 'winner': 'Remitly Express', 'why': 'Minutos, $3.99'},
            {'scenario': 'Montos grandes', 'winner': 'Wise', 'why': '0.65% fijo, mejor para $1K+'}
        ]
    },
    {
        'slug': 'el-salvador', 'name_es': 'El Salvador', 'currency': 'USD', 'currency_name_es': 'dólar (USD)', 'rate_mid': 1.00,
        'remit_billion_usd': 8.5, 'rank': 14, 'source_states': ['California', 'Texas', 'Nueva York', 'Virginia', 'Maryland'],
        'popular_providers_note': 'El Salvador usa dólar estadounidense como moneda oficial, así que no hay conversión de divisa — solo pagas comisión. Esto simplifica mucho la comparación entre proveedores.',
        'key_corridor_fact': 'Al usar dólar como moneda oficial, El Salvador es uno de los corredores más eficientes. No pierdes nada en tipo de cambio — solo pagas la comisión del proveedor. Cuidado: algunos proveedores cobran comisión más alta sabiendo esto.',
        'banks_common': 'Banco Agrícola, Banco Cuscatlán, Banco de América Central, Banco Davivienda',
        'cash_network': 'Western Union, MoneyGram, Banco Agrícola, Punto Xpress',
        'best_for_scenarios': [
            {'scenario': 'Envío recurrente (cuenta bancaria)', 'winner': 'Wise', 'why': 'Comisión más baja entre digitales ($3-5 típico)'},
            {'scenario': 'Recogida en efectivo', 'winner': 'Remitly o Western Union', 'why': 'Red amplia en pueblos'},
            {'scenario': 'Envío rápido', 'winner': 'Remitly Express', 'why': 'Minutos, sin márgen FX porque es USD→USD'},
            {'scenario': 'Transferencias grandes', 'winner': 'Wise', 'why': 'Porcentaje pequeño, sin FX hidden'}
        ]
    },
    {
        'slug': 'nicaragua', 'name_es': 'Nicaragua', 'currency': 'NIO', 'currency_name_es': 'córdoba', 'rate_mid': 36.70,
        'remit_billion_usd': 5.3, 'rank': 22, 'source_states': ['Florida', 'California', 'Texas', 'Nueva Jersey'],
        'popular_providers_note': 'Nicaragua tiene una red bancaria más limitada. Western Union, MoneyGram y los bancos locales BAC y Banpro son los canales principales. Wise y Remitly son relativamente nuevos pero creciendo.',
        'key_corridor_fact': 'Las remesas a Nicaragua aumentaron fuertemente después de 2018 cuando miles migraron a EE.UU. El corredor desde Miami y Houston es especialmente activo.',
        'banks_common': 'BAC Nicaragua, Banpro, LAFISE Bancentro, Avanz',
        'cash_network': 'Western Union, MoneyGram, BAC, Airpak',
        'best_for_scenarios': [
            {'scenario': 'Cuenta BAC o Banpro', 'winner': 'Wise', 'why': 'Mejor combinación comisión + tipo de cambio'},
            {'scenario': 'Efectivo en zonas rurales', 'winner': 'Western Union', 'why': 'Red agente más densa'},
            {'scenario': 'Envío rápido', 'winner': 'Remitly Express', 'why': 'Minutos a BAC'},
            {'scenario': 'Envío pequeño (&lt; $100)', 'winner': 'Remitly', 'why': 'Sin comisión mínima alta'}
        ]
    },
    {
        'slug': 'republica-dominicana', 'name_es': 'República Dominicana', 'currency': 'DOP', 'currency_name_es': 'peso dominicano', 'rate_mid': 59.20,
        'remit_billion_usd': 10.2, 'rank': 12, 'source_states': ['Nueva York', 'New Jersey', 'Florida', 'Pensilvania', 'Massachusetts'],
        'popular_providers_note': 'República Dominicana tiene una infraestructura bancaria sólida (Popular Dominicano, BHD León, Banreservas). Muchos proveedores digitales depositan directo a cuentas; también hay red fuerte de agentes para efectivo.',
        'key_corridor_fact': 'República Dominicana recibe más de $10 mil millones al año en remesas, con el 80% proveniente de EE.UU. — principalmente del área de Nueva York.',
        'banks_common': 'Banco Popular Dominicano, BHD León, Banreservas, Scotiabank',
        'cash_network': 'Western Union, Quisqueyana Financial, Remesas Vimenca, Caribe Express',
        'best_for_scenarios': [
            {'scenario': 'Cuenta Popular Dominicano o BHD León', 'winner': 'Wise', 'why': 'Depósito directo, comisión baja'},
            {'scenario': 'Efectivo via Quisqueyana', 'winner': 'Remitly', 'why': 'Integración directa con red'},
            {'scenario': 'Envíos desde NYC', 'winner': 'Wise o Remitly', 'why': 'Ambos muy competitivos en este corredor'},
            {'scenario': 'Pago móvil (Tpago, Azul)', 'winner': 'Remitly', 'why': 'Soporte a estos rails'}
        ]
    },
    {
        'slug': 'colombia', 'name_es': 'Colombia', 'currency': 'COP', 'currency_name_es': 'peso colombiano', 'rate_mid': 4150,
        'remit_billion_usd': 11.6, 'rank': 10, 'source_states': ['Florida', 'Nueva York', 'California', 'Nueva Jersey', 'Texas'],
        'popular_providers_note': 'Colombia tiene banca digital avanzada. Nequi, Daviplata y Bancolombia son receptores muy populares. Wise y Remitly integran directo con estos — un punto a su favor sobre Western Union.',
        'key_corridor_fact': 'Colombia recibe cerca de $11 mil millones al año y es uno de los corredores más digitalizados. Nequi (Bancolombia) y Daviplata procesan la mayoría de remesas a cuentas digitales.',
        'banks_common': 'Bancolombia, Davivienda, Banco de Bogotá, Colpatria, BBVA Colombia',
        'cash_network': 'Western Union, Giros & Finanzas, Efecty',
        'best_for_scenarios': [
            {'scenario': 'Nequi o Daviplata (cuenta móvil)', 'winner': 'Remitly o Wise', 'why': 'Ambos integran directo'},
            {'scenario': 'Cuenta Bancolombia/Davivienda', 'winner': 'Wise', 'why': 'Menor comisión total'},
            {'scenario': 'Efectivo via Efecty', 'winner': 'Western Union', 'why': 'Mejor red'},
            {'scenario': 'Montos grandes ($5K+)', 'winner': 'Wise', 'why': '0.65% vs 2-4% de competencia'}
        ]
    },
    {
        'slug': 'peru', 'name_es': 'Perú', 'currency': 'PEN', 'currency_name_es': 'sol', 'rate_mid': 3.72,
        'remit_billion_usd': 4.0, 'rank': 27, 'source_states': ['Nueva Jersey', 'Florida', 'Nueva York', 'California', 'Virginia'],
        'popular_providers_note': 'Perú tiene buena integración con Wise y Remitly a bancos BCP, BBVA, Scotiabank e Interbank. La red de Yape (app móvil) está creciendo y algunos proveedores la soportan.',
        'key_corridor_fact': 'Perú recibe aproximadamente $4 mil millones al año en remesas. Los corredores más activos son desde el noreste de EE.UU. (Nueva Jersey, Nueva York) y Florida.',
        'banks_common': 'BCP (Banco de Crédito), BBVA Perú, Interbank, Scotiabank',
        'cash_network': 'Western Union, Servicios Perú, Kasnet',
        'best_for_scenarios': [
            {'scenario': 'BCP o Interbank', 'winner': 'Wise', 'why': 'Mejor combinación'},
            {'scenario': 'Yape (app móvil)', 'winner': 'Remitly', 'why': 'Soporte nativo'},
            {'scenario': 'Efectivo en provincias', 'winner': 'Western Union', 'why': 'Red más amplia'},
            {'scenario': 'Envío rápido', 'winner': 'Remitly Express', 'why': 'Minutos'}
        ]
    },
    {
        'slug': 'ecuador', 'name_es': 'Ecuador', 'currency': 'USD', 'currency_name_es': 'dólar (USD)', 'rate_mid': 1.00,
        'remit_billion_usd': 5.2, 'rank': 23, 'source_states': ['Nueva York', 'Nueva Jersey', 'Florida', 'Illinois', 'Connecticut'],
        'popular_providers_note': 'Ecuador usa el dólar como moneda oficial. Igual que El Salvador, no hay conversión de divisa — solo pagas la comisión. Este es uno de los corredores donde Wise ahorra más porque otros proveedores inflan la comisión sabiendo que no pueden ganar en tipo de cambio.',
        'key_corridor_fact': 'Ecuador dolarizado es uno de los corredores más eficientes. Evita proveedores que cobran alta comisión — con USD→USD no debería pasar de $3-5 por envío de $500.',
        'banks_common': 'Banco Pichincha, Banco del Pacífico, Produbanco, Banco Guayaquil',
        'cash_network': 'Western Union, MoneyGram, Banco Pichincha, Delgado Travel',
        'best_for_scenarios': [
            {'scenario': 'Cuenta bancaria', 'winner': 'Wise', 'why': 'Comisión más baja, USD→USD sin FX'},
            {'scenario': 'Efectivo', 'winner': 'Remitly Express', 'why': 'Rápido y confiable'},
            {'scenario': 'Envío rápido', 'winner': 'Remitly', 'why': 'Minutos a Pichincha'},
            {'scenario': 'Receptor sin internet', 'winner': 'Western Union', 'why': 'Cobro en oficina física'}
        ]
    },
    {
        'slug': 'cuba', 'name_es': 'Cuba', 'currency': 'USD', 'currency_name_es': 'dólar o MLC (según proveedor)', 'rate_mid': 24.00,
        'remit_billion_usd': 4.0, 'rank': 28, 'source_states': ['Florida', 'Nueva Jersey', 'Nueva York', 'California'],
        'popular_providers_note': 'Cuba es un caso especial. Las remesas oficiales se procesan principalmente vía VaCuba, Fincimex y plataformas autorizadas. Western Union opera en el corredor desde EE.UU. → Cuba con restricciones. Las reglas cambian con frecuencia — verifica siempre antes de enviar.',
        'key_corridor_fact': 'Miami es el punto de origen para la mayoría de remesas a Cuba. Las opciones cambian según regulaciones de EE.UU. y Cuba; muchos cubanos reciben en MLC (moneda libremente convertible) u otros mecanismos oficiales.',
        'banks_common': 'BPA (Banco Popular de Ahorro), BANDEC, Banco Metropolitano',
        'cash_network': 'VaCuba, Fincimex, Western Union (según regulaciones vigentes)',
        'best_for_scenarios': [
            {'scenario': 'Envío oficial a Cuba', 'winner': 'VaCuba, Fincimex', 'why': 'Plataformas autorizadas'},
            {'scenario': 'Efectivo CUP/MLC', 'winner': 'Western Union', 'why': 'Cuando opera en el corredor'},
            {'scenario': 'Envío desde Miami', 'winner': 'VaCuba', 'why': 'Especialista en este corredor'}
        ]
    },
    {
        'slug': 'argentina', 'name_es': 'Argentina', 'currency': 'ARS', 'currency_name_es': 'peso argentino', 'rate_mid': 1020,
        'remit_billion_usd': 1.2, 'rank': 44, 'source_states': ['Florida', 'California', 'Nueva York', 'Nueva Jersey', 'Texas'],
        'popular_providers_note': 'Argentina tiene control de cambio desde hace años. El tipo de cambio oficial es muy diferente al "dólar blue" del mercado informal. Wise opera legalmente a la cotización oficial. Algunos argentinos prefieren recibir en USD (transferencia a cuenta CCL/MEP) o en criptomonedas para evitar pérdida cambiaria.',
        'key_corridor_fact': 'Argentina es un caso complejo por el cepo cambiario. El "dólar MEP" o pagos en criptomonedas son comunes entre quienes quieren mantener valor en dólares. Cuidado al usar servicios tradicionales: la tasa oficial argentina puede perder 30-50% vs dólar paralelo.',
        'banks_common': 'Banco Nación, Banco Galicia, Santander, BBVA Argentina, Macro',
        'cash_network': 'Western Union, MoneyGram, Pago Fácil, Rapipago',
        'best_for_scenarios': [
            {'scenario': 'Cuenta bancaria argentina (ARS)', 'winner': 'Wise o Remitly', 'why': 'Tasa oficial visible'},
            {'scenario': 'Recibir en USD (cuenta CCL/MEP)', 'winner': 'Wise (USD→USD)', 'why': 'Mantiene valor'},
            {'scenario': 'Envío en cripto (USDC/USDT)', 'winner': 'Binance, Lemon Cash', 'why': 'Evita cepo'},
            {'scenario': 'Efectivo tradicional', 'winner': 'Western Union', 'why': 'Red local amplia'}
        ]
    },
    {
        'slug': 'venezuela', 'name_es': 'Venezuela', 'currency': 'VES', 'currency_name_es': 'bolívar', 'rate_mid': 48.50,
        'remit_billion_usd': 3.5, 'rank': 29, 'source_states': ['Florida', 'Texas', 'Nueva York', 'California'],
        'popular_providers_note': 'Venezuela tiene alta inflación y múltiples tipos de cambio. Muchos venezolanos prefieren recibir remesas en USD (cuenta en dólares) o en Zelle/PayPal. Las remesas en bolívares pierden valor rápidamente. Zinli, Reserve y plataformas cripto son muy usadas.',
        'key_corridor_fact': 'Venezuela tiene hiperinflación — recibir en bolívares puede perder 5-15% de valor en días. La mayoría de venezolanos prefiere recibir en USD a cuenta digital o en USDT/USDC.',
        'banks_common': 'Banesco, Mercantil, BOD, Provincial, Bancaribe (muchos con cuentas en USD)',
        'cash_network': 'Western Union (limitado), Zelle (P2P), Zinli, Reserve',
        'best_for_scenarios': [
            {'scenario': 'Cuenta en USD (Banesco, Mercantil)', 'winner': 'Wise (USD)', 'why': 'Mantiene valor'},
            {'scenario': 'Zelle o PayPal (muy común)', 'winner': 'Transferencia directa', 'why': 'Rápido, sin conversión'},
            {'scenario': 'USDT/USDC (cripto)', 'winner': 'Binance, Reserve', 'why': 'Protección vs inflación'},
            {'scenario': 'Efectivo Bs', 'winner': 'Western Union', 'why': 'Operación limitada pero funcional'}
        ]
    }
]

NAV_FOOTER = """
<nav class="nav" id="nav">
  <div class="container">
    <div class="nav__inner">
      <a href="/" class="nav__logo" aria-label="Norte Financial">
        <div class="nav__logomark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="2" x2="12" y2="22" stroke="#E8F5F0" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12 2 L16 7 M12 2 L8 7" stroke="#7EC4A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="2" r="2" fill="#7EC4A8"/>
          </svg>
        </div>
        <div class="nav__wordmark">
          <span class="nav__wordmark-name">Norte</span>
          <span class="nav__wordmark-sub">Financial</span>
        </div>
      </a>
      <ul class="nav__links" id="navLinks">
        <li><a href="/seguros.html" data-es="Seguros" data-en="Insurance">Seguros</a></li>
        <li><a href="/finanzas.html" data-es="Finanzas" data-en="Finance">Finanzas</a></li>
        <li><a href="/guias.html" data-es="Guías" data-en="Guides">Guías</a></li>
        <li><a href="/herramientas.html" data-es="Herramientas" data-en="Tools">Herramientas</a></li>
      </ul>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="nav__lang">
          <button class="nav__lang-btn active" id="btnEs" onclick="setLang('es')">ES</button>
          <button class="nav__lang-btn" id="btnEn" onclick="setLang('en')">EN</button>
        </div>
        <button class="nav__mobile-toggle" id="mobileToggle" aria-label="Menu" onclick="toggleMobileMenu()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="nav__drawer" id="mobileDrawer">
      <ul class="nav__drawer-links">
        <li><a href="/seguros.html" onclick="closeMobileMenu()" data-es="Seguros" data-en="Insurance">Seguros</a></li>
        <li><a href="/finanzas.html" onclick="closeMobileMenu()" data-es="Finanzas" data-en="Finance">Finanzas</a></li>
        <li><a href="/guias.html" onclick="closeMobileMenu()" data-es="Guías" data-en="Guides">Guías</a></li>
        <li><a href="/herramientas.html" onclick="closeMobileMenu()" data-es="Herramientas" data-en="Tools">Herramientas</a></li>
        <li><a href="/estados.html" onclick="closeMobileMenu()" data-es="Estados" data-en="States">Estados</a></li>
      </ul>
    </div>
  </div>
</nav>
"""

FOOTER = """
<footer class="footer">
  <div class="container">
    <div class="footer__grid" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:40px">
      <div class="footer__brand">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="12" y1="2" x2="12" y2="22" stroke="#E8F5F0" stroke-width="1.5" stroke-linecap="round"/><path d="M12 2 L16 7 M12 2 L8 7" stroke="#7EC4A8" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="2" r="2" fill="#7EC4A8"/></svg>
          </div>
          <div style="display:flex;flex-direction:column;">
            <span style="font-family:var(--font-display);font-size:20px;font-weight:500;color:white;letter-spacing:-0.01em;">Norte</span>
            <span style="font-size:9px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Financial</span>
          </div>
        </div>
        <p class="footer__tagline">Tu norte financiero.</p>
        <p class="footer__desc">La guía de seguros y finanzas para hispanos en EE.UU.</p>
      </div>
      <div>
        <div class="footer__col-title">Finanzas</div>
        <ul class="footer__links">
          <li><a href="/credito.html">Crédito</a></li>
          <li><a href="/banca.html">Banca</a></li>
          <li><a href="/remesas.html">Remesas</a></li>
          <li><a href="/impuestos.html">Impuestos</a></li>
          <li><a href="/hipotecas.html">Hipotecas</a></li>
          <li><a href="/prestamos.html">Préstamos</a></li>
        </ul>
      </div>
      <div>
        <div class="footer__col-title">Seguros</div>
        <ul class="footer__links">
          <li><a href="/seguro-auto.html">Seguro de Auto</a></li>
          <li><a href="/seguro-hogar.html">Seguro de Hogar</a></li>
          <li><a href="/seguro-vida.html">Seguro de Vida</a></li>
          <li><a href="/seguro-medico.html">Seguro Médico</a></li>
          <li><a href="/seguro-negocio.html">Seguro de Negocio</a></li>
        </ul>
      </div>
      <div>
        <div class="footer__col-title">Recursos</div>
        <ul class="footer__links">
          <li><a href="/guias.html">Guías</a></li>
          <li><a href="/aseguradoras.html">Aseguradoras</a></li>
          <li><a href="/calculadora-remesas.html">Calculadora remesas</a></li>
          <li><a href="/estados.html">Por Estado</a></li>
          <li><a href="/prensa.html">Prensa</a></li>
        </ul>
      </div>
      <div>
        <div class="footer__col-title">Compañía</div>
        <ul class="footer__links">
          <li><a href="/nosotros.html">Nosotros</a></li>
          <li><a href="/como-ganamos.html">Cómo ganamos</a></li>
          <li><a href="/metodologia.html">Metodología</a></li>
          <li><a href="/contacto.html">Contacto</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__copy">© 2026 Norte Financial. Información educativa, no asesoría legal.</p>
      <div class="footer__legal">
        <a href="/privacidad.html">Privacidad</a>
        <a href="/terminos.html">Términos</a>
        <a href="/divulgacion.html">Divulgación de afiliados</a>
      </div>
    </div>
  </div>
</footer>
<script>
function toggleMobileMenu(){var d=document.getElementById('mobileDrawer'),t=document.getElementById('mobileToggle'),o=d.classList.contains('open');if(o){d.classList.remove('open');t.classList.remove('open')}else{d.classList.add('open');t.classList.add('open')}}
function closeMobileMenu(){document.getElementById('mobileDrawer').classList.remove('open');document.getElementById('mobileToggle').classList.remove('open')}
let currentLang=localStorage.getItem('norte_lang')||'es';
function setLang(lang){currentLang=lang;localStorage.setItem('norte_lang',lang);document.documentElement.lang=lang;document.querySelectorAll('[data-es]').forEach(el=>{const t=el.getAttribute('data-'+lang);if(t){if(el.tagName==='INPUT')el.placeholder=t;else el.innerHTML=t}});var e=document.getElementById('btnEs'),n=document.getElementById('btnEn');if(e)e.classList.toggle('active',lang==='es');if(n)n.classList.toggle('active',lang==='en')}
function applyLang(){if(currentLang&&currentLang!=='es')setLang(currentLang);else{var e=document.getElementById('btnEs'),n=document.getElementById('btnEn');if(e)e.classList.add('active');if(n)n.classList.remove('active')}}
applyLang();window.addEventListener('load',applyLang);
window.addEventListener('scroll',()=>{document.getElementById('nav').classList.toggle('scrolled',window.scrollY>20)});
</script>
"""

def build_page(country):
    slug = country['slug']
    name_es = country['name_es']
    currency = country['currency']
    rate_mid = country['rate_mid']
    remit = country['remit_billion_usd']
    url = f"{SITE}/remesas-a-{slug}.html"
    title = f"Remesas a {name_es} desde EE.UU. — Guía 2026"
    desc = f"Guía completa para enviar dinero a {name_es}. Comparación Wise, Remitly, Xoom, Western Union, MoneyGram. Ahorra hasta $500/año."

    # Example calculation: $500 at mid-rate vs 5% margin
    example_received_fair = f"{int(500 * rate_mid):,}".replace(',', ',')
    example_received_bad = f"{int(500 * rate_mid * 0.93):,}".replace(',', ',')
    if currency == 'USD':
        example_received_fair = '497'
        example_received_bad = '470'
    loss_mxn = int(500 * rate_mid * 0.07)

    # FAQ (5 questions) with schema
    faqs = [
        {
            'q': f'¿Cuál es la forma más barata de enviar dinero a {name_es}?',
            'a': f'Para la mayoría de envíos a {name_es}, Wise ofrece el mejor balance de comisión visible (~0.65%) y tipo de cambio mid-market real. Si tu familia recibe en efectivo en zonas rurales, Remitly Express o Western Union son mejores opciones. La calculadora de Norte Financial te muestra en segundos cuál gana para tu monto específico.'
        },
        {
            'q': f'¿Cuánto se demora una remesa a {name_es}?',
            'a': f'Depende del proveedor: Remitly Express y Wise llegan en minutos a 1 hora para cuenta bancaria. Remitly Economy toma 1-3 días hábiles. Western Union y MoneyGram son instantáneos para recogida en efectivo. A cuenta bancaria pueden tomar 1-3 días hábiles por el procesamiento del banco receptor en {name_es}.'
        },
        {
            'q': f'¿Es legal usar Wise o Remitly para enviar dinero a {name_es}?',
            'a': f'Sí, ambos están regulados por FinCEN en EE.UU. y por autoridades financieras locales. Wise está autorizado para operar internacionalmente y cumple con todas las regulaciones de "anti money laundering" (AML) y "know your customer" (KYC). Remitly, Xoom (PayPal), Western Union y MoneyGram también están regulados.'
        },
        {
            'q': f'¿Necesito reportar impuestos por el dinero que envío a {name_es}?',
            'a': f'En EE.UU., enviar remesas a tu familia no es un evento imponible para ti como remitente. Sin embargo, si el monto anual a una sola persona supera $18,000 (2026), puede aplicar el "gift tax" — aunque típicamente no se paga, sí se reporta (Form 709). Para la mayoría de remesas familiares mensuales normales ($100-2,000), no hay impuesto.'
        },
        {
            'q': f'¿Qué pasa si el receptor en {name_es} no tiene cuenta bancaria?',
            'a': f'Tienes opciones. Remitly, Western Union, MoneyGram y Xoom permiten recogida en efectivo en una red de agentes. En {name_es}, puntos comunes incluyen {country["cash_network"]}. El receptor necesita ID oficial y el código de referencia que le des.'
        }
    ]
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q['q'], "acceptedAnswer": {"@type": "Answer", "text": q['a']}}
            for q in faqs
        ]
    }
    article_schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "author": {"@type": "Organization", "name": "Norte Financial Editorial Team"},
        "publisher": {"@type": "Organization", "name": "Norte Financial", "logo": {"@type": "ImageObject", "url": f"{SITE}/logo/norte-full-color.svg"}},
        "datePublished": "2026-04-16",
        "dateModified": "2026-04-16",
        "description": desc,
        "mainEntityOfPage": url,
        "inLanguage": "es"
    }
    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Norte Financial", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": "Remesas", "item": f"{SITE}/remesas.html"},
            {"@type": "ListItem", "position": 3, "name": f"Remesas a {name_es}", "item": url}
        ]
    }

    scenarios_html = ''
    for s in country['best_for_scenarios']:
        scenarios_html += f'''
        <tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
          <td style="padding:12px 10px;color:#4A4A4A;font-size:14px">{s['scenario']}</td>
          <td style="padding:12px 10px;color:#0B3D2E;font-weight:500;font-size:14px">{s['winner']}</td>
          <td style="padding:12px 10px;color:#7A7A7A;font-size:13px">{s['why']}</td>
        </tr>'''

    faqs_html = ''
    for f in faqs:
        faqs_html += f'''
        <details style="border-bottom:1px solid rgba(11,61,46,0.08);padding:18px 0">
          <summary style="font-weight:500;color:#0B3D2E;cursor:pointer;font-size:16px;list-style:none">{f['q']}</summary>
          <p style="margin:12px 0 0;color:#4A4A4A;line-height:1.7;font-size:15px">{f['a']}</p>
        </details>'''

    source_states = ', '.join(country['source_states'])

    return f'''<!DOCTYPE html>
<html lang="es">
<head>
<script>(function(){{var l=localStorage.getItem('norte_lang');if(l&&l!=='es')document.documentElement.setAttribute('data-lang-init',l);}})()</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow">
<title>{title} — Norte Financial</title>
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="es" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<link rel="stylesheet" href="/shared.css">
<link rel="stylesheet" href="/mobile-fix.css">
<script src="/ga-config.js"></script>
<script src="/affiliate-urls.js" defer></script>
<script src="/norte-track.js" defer></script>
<script src="/norte-email.js" defer></script>
<script type="application/ld+json">{json.dumps(article_schema, separators=(',',':'), ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(faq_schema, separators=(',',':'), ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(breadcrumb_schema, separators=(',',':'), ensure_ascii=False)}</script>
<style>
.corridor-wrap{{padding:60px 0 100px;background:var(--parchment)}}
.corridor{{max-width:880px;margin:0 auto;padding:0 24px}}
.corridor h2{{font-family:var(--font-display);font-size:28px;font-weight:500;color:var(--ink);margin:40px 0 16px;letter-spacing:-0.01em}}
.corridor h3{{font-family:var(--font-display);font-size:20px;font-weight:500;color:var(--ink);margin:28px 0 12px}}
.corridor p{{font-size:16px;line-height:1.75;color:var(--ink-muted);margin-bottom:16px}}
.corridor ul,.corridor ol{{margin:12px 0 20px 24px;color:var(--ink-muted);line-height:1.75}}
.corridor li{{margin-bottom:8px}}
.fact-card{{background:var(--frost);border-left:4px solid var(--verde);border-radius:var(--r-md);padding:20px 24px;margin:24px 0;font-size:15px;color:var(--ink-muted);line-height:1.7}}
.fact-card strong{{color:var(--forest);font-weight:500}}
.stat-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0 32px}}
.stat-card{{padding:18px;background:var(--white);border:1px solid var(--border-light);border-radius:var(--r-md);text-align:center}}
.stat-card .label{{font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-light);margin-bottom:6px}}
.stat-card .value{{font-family:var(--font-display);font-size:22px;font-weight:500;color:var(--forest);line-height:1.2}}
.compare-table{{width:100%;border-collapse:collapse;margin:20px 0 30px;background:var(--white);border:1px solid var(--border-light);border-radius:var(--r-md);overflow:hidden}}
.compare-table th{{padding:14px 10px;background:var(--forest);color:var(--white);text-align:left;font-size:13px;font-weight:500;letter-spacing:0.03em}}
.cta-band{{background:var(--forest);color:var(--white);padding:40px 30px;border-radius:var(--r-xl);margin:40px 0;text-align:center}}
.cta-band h3{{font-family:var(--font-display);color:var(--white);font-size:24px;margin:0 0 10px}}
.cta-band p{{color:rgba(255,255,255,0.78);margin:0 0 20px;font-size:15px}}
.cta-band a{{display:inline-block;padding:14px 28px;background:var(--amber);color:var(--white);text-decoration:none;border-radius:var(--r-full);font-weight:500;font-size:15px}}
.cta-band a:hover{{background:#BA6208}}
@media(max-width:640px){{.stat-grid{{grid-template-columns:1fr}}}}
</style>
</head>
<body>
{NAV_FOOTER}
<section class="page-hero">
  <div class="container">
    <p class="page-hero__eyebrow">Guía · Actualizada abril 2026</p>
    <h1 class="page-hero__title">Remesas a <em>{name_es}</em> desde Estados Unidos</h1>
    <p class="page-hero__desc">Guía completa 2026: comparación de Wise, Remitly, Xoom, Western Union y MoneyGram para enviar dinero a {name_es}. Datos reales, sin confusión.</p>
  </div>
</section>
<section class="corridor-wrap">
<div class="corridor">

<div class="fact-card">
  <strong>Dato del corredor EE.UU. → {name_es}:</strong> {country['key_corridor_fact']}
</div>

<div class="stat-grid">
  <div class="stat-card">
    <div class="label">Remesas recibidas/año</div>
    <div class="value">~${remit}B USD</div>
  </div>
  <div class="stat-card">
    <div class="label">Moneda local</div>
    <div class="value">{currency}</div>
  </div>
  <div class="stat-card">
    <div class="label">Estados de origen</div>
    <div class="value" style="font-size:14px">{source_states}</div>
  </div>
</div>

<h2>Cuál proveedor conviene según tu situación</h2>
<p>No hay un solo "mejor proveedor" — depende de cuánto envías, qué tan rápido lo necesitas, y cómo lo recibe tu familia. Esta tabla resume los ganadores por escenario para el corredor EE.UU. → {name_es}:</p>

<table class="compare-table">
<thead>
<tr>
  <th style="width:38%">Escenario</th>
  <th style="width:22%">Ganador</th>
  <th style="width:40%">Por qué</th>
</tr>
</thead>
<tbody>
{scenarios_html}
</tbody>
</table>

<h2>Ejemplo real: $500 USD a {name_es}</h2>
<p>Para que veas la diferencia de forma concreta, comparamos enviar $500 USD a {name_es} con los proveedores más usados. Las cifras son estimaciones basadas en comisiones y márgenes típicos de 2026 — verifica la tasa final en el sitio del proveedor antes de enviar:</p>

<table class="compare-table">
<thead>
<tr>
  <th>Proveedor</th>
  <th>Comisión visible</th>
  <th>Margen en tipo de cambio</th>
  <th>Recibe tu familia</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid rgba(11,61,46,0.08);background:rgba(29,158,117,0.04)">
  <td style="padding:12px 10px;font-weight:500;color:#0B3D2E">Wise</td>
  <td style="padding:12px 10px">~$3.30 (0.65%)</td>
  <td style="padding:12px 10px">Mid-market real (0%)</td>
  <td style="padding:12px 10px;font-weight:500">≈ {example_received_fair} {currency}</td>
</tr>
<tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
  <td style="padding:12px 10px">Remitly Economy</td>
  <td style="padding:12px 10px">$0-3.99</td>
  <td style="padding:12px 10px">~1.8%</td>
  <td style="padding:12px 10px">≈ {int(500 * rate_mid * 0.982) if currency != 'USD' else 491} {currency}</td>
</tr>
<tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
  <td style="padding:12px 10px">Xoom (PayPal)</td>
  <td style="padding:12px 10px">$4.99</td>
  <td style="padding:12px 10px">~2.8%</td>
  <td style="padding:12px 10px">≈ {int(500 * rate_mid * 0.972) if currency != 'USD' else 485} {currency}</td>
</tr>
<tr style="border-bottom:1px solid rgba(11,61,46,0.08)">
  <td style="padding:12px 10px">MoneyGram</td>
  <td style="padding:12px 10px">$5.99</td>
  <td style="padding:12px 10px">~4.2%</td>
  <td style="padding:12px 10px">≈ {int(500 * rate_mid * 0.958) if currency != 'USD' else 478} {currency}</td>
</tr>
<tr>
  <td style="padding:12px 10px">Western Union</td>
  <td style="padding:12px 10px">$4.99</td>
  <td style="padding:12px 10px">~5.5%</td>
  <td style="padding:12px 10px">≈ {example_received_bad} {currency}</td>
</tr>
</tbody>
</table>

<p>La diferencia entre Wise y Western Union en un envío típico: <strong>{loss_mxn} {currency}</strong> por envío. Si envías $500 cada mes, son <strong>{loss_mxn * 12} {currency} al año</strong> que pierde tu familia sin necesidad.</p>

<div class="cta-band">
  <h3>Calcula tu caso exacto</h3>
  <p>Cambia el monto, cambia el país. Los resultados se actualizan en vivo.</p>
  <a href="/calculadora-remesas.html">Abrir calculadora →</a>
</div>

<h2>Redes de pago locales en {name_es}</h2>
<p><strong>Bancos principales:</strong> {country['banks_common']}</p>
<p><strong>Red de efectivo / agentes:</strong> {country['cash_network']}</p>
<p>{country['popular_providers_note']}</p>

<h2>Cómo evitar las comisiones escondidas</h2>
<p>La comisión visible (lo que ves como "fee" antes de confirmar) es solo parte del costo real. El <strong>margen en el tipo de cambio</strong> es donde proveedores como Western Union y MoneyGram realmente ganan dinero.</p>
<p>Ejemplo: si el tipo de cambio real (mid-market) es 1 USD = {rate_mid} {currency}, pero Western Union te da 1 USD = {round(rate_mid * 0.945, 2)} {currency}, ese <strong>~5.5% de diferencia</strong> es margen escondido que sale de tu bolsillo.</p>
<p>Wise, en cambio, muestra el tipo de cambio exacto de Google (mid-market) y cobra solo la comisión visible (~0.65%). Sin sorpresas.</p>
<p><strong>Regla simple:</strong> antes de enviar, busca "{currency} to USD" en Google. Compara ese número con el tipo de cambio que te ofrece cada proveedor. La diferencia × tu monto = lo que realmente cuesta.</p>

<h2>Preguntas frecuentes</h2>
{faqs_html}

<div class="cta-band" style="margin-top:40px">
  <h3>¿Listo para enviar?</h3>
  <p>Nuestra calculadora te muestra el ganador real para tu envío específico a {name_es}.</p>
  <a href="/calculadora-remesas.html">Ver comparación en vivo →</a>
</div>

<p style="font-size:12px;color:var(--ink-light);margin-top:30px;line-height:1.6">Última actualización: 16 abril 2026. Los datos de remesas se basan en estimaciones del Banco Mundial y KNOMAD. Los márgenes y comisiones de proveedores son estimaciones típicas; las cifras reales varían diariamente según el mercado, el método de pago, y promociones vigentes. Siempre verifica la tasa final en el sitio oficial del proveedor antes de enviar.</p>
</div>
</section>
{FOOTER}
</body></html>'''

count = 0
for country in COUNTRIES:
    fn = f"remesas-a-{country['slug']}.html"
    with open(fn, 'w') as fh:
        fh.write(build_page(country))
    count += 1
    print(f'created: {fn}')
print(f'\nTotal created: {count}')
