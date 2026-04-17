#!/usr/bin/env python3
"""Generate city-level ITIN credit card landing pages.

Target keywords: "tarjeta de crédito con ITIN en [ciudad]", "crédito para
inmigrantes en [ciudad]", "construir crédito sin SSN en [ciudad]".

Pages have city-specific context (Hispanic population %, top origin
countries, local credit unions/banks) to avoid duplicate-content flags.
"""

import json
import os
import sys

SITE = 'https://nortefinancial.com'

# Top US cities/metros by Hispanic population. Percentages are from US Census
# 2020 + ACS 2022 estimates. "Top origin" is the largest Hispanic-origin group.
CITIES = [
    {'slug': 'miami-fl',         'name': 'Miami',            'state': 'Florida',       'hisp_pct': 72, 'top_origin': 'cubana y venezolana', 'local_banks': 'Bank of America, Wells Fargo, Chase, BankUnited, Banesco USA'},
    {'slug': 'houston-tx',       'name': 'Houston',          'state': 'Texas',         'hisp_pct': 45, 'top_origin': 'mexicana y salvadoreña', 'local_banks': 'Wells Fargo, Chase, Bank of America, Frost Bank, Prosperity Bank'},
    {'slug': 'los-angeles-ca',   'name': 'Los Ángeles',      'state': 'California',    'hisp_pct': 49, 'top_origin': 'mexicana y salvadoreña', 'local_banks': 'Wells Fargo, Chase, Bank of America, US Bank, Banc of California'},
    {'slug': 'san-antonio-tx',   'name': 'San Antonio',      'state': 'Texas',         'hisp_pct': 64, 'top_origin': 'mexicana', 'local_banks': 'Frost Bank, USAA, Wells Fargo, Chase, Bank of America'},
    {'slug': 'nueva-york-ny',    'name': 'Nueva York',       'state': 'Nueva York',    'hisp_pct': 29, 'top_origin': 'dominicana, puertorriqueña y mexicana', 'local_banks': 'Chase, Citibank, Wells Fargo, Bank of America, Santander'},
    {'slug': 'phoenix-az',       'name': 'Phoenix',          'state': 'Arizona',       'hisp_pct': 43, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, National Bank of Arizona'},
    {'slug': 'dallas-tx',        'name': 'Dallas',           'state': 'Texas',         'hisp_pct': 42, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Frost Bank, Comerica'},
    {'slug': 'chicago-il',       'name': 'Chicago',          'state': 'Illinois',      'hisp_pct': 29, 'top_origin': 'mexicana y puertorriqueña', 'local_banks': 'Chase, Citibank, BMO Harris, Wintrust, Fifth Third'},
    {'slug': 'el-paso-tx',       'name': 'El Paso',          'state': 'Texas',         'hisp_pct': 82, 'top_origin': 'mexicana', 'local_banks': 'Chase, Wells Fargo, WestStar Bank, GECU, Border Federal Credit Union'},
    {'slug': 'san-diego-ca',     'name': 'San Diego',        'state': 'California',    'hisp_pct': 31, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, USE Credit Union, Mission Federal'},
    {'slug': 'tucson-az',        'name': 'Tucson',           'state': 'Arizona',       'hisp_pct': 43, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, National Bank of Arizona, Vantage West, Pima Federal CU'},
    {'slug': 'orlando-fl',       'name': 'Orlando',          'state': 'Florida',       'hisp_pct': 34, 'top_origin': 'puertorriqueña', 'local_banks': 'Bank of America, Wells Fargo, Chase, SunTrust/Truist, FAIRWINDS'},
    {'slug': 'tampa-fl',         'name': 'Tampa',            'state': 'Florida',       'hisp_pct': 27, 'top_origin': 'cubana, puertorriqueña y mexicana', 'local_banks': 'Bank of America, Wells Fargo, Chase, BankUnited, Suncoast Credit Union'},
    {'slug': 'jacksonville-fl',  'name': 'Jacksonville',     'state': 'Florida',       'hisp_pct': 11, 'top_origin': 'puertorriqueña y cubana', 'local_banks': 'Bank of America, Wells Fargo, Chase, VyStar Credit Union, 121 Financial'},
    {'slug': 'fort-worth-tx',    'name': 'Fort Worth',       'state': 'Texas',         'hisp_pct': 35, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Frost Bank, Texas Capital'},
    {'slug': 'austin-tx',        'name': 'Austin',           'state': 'Texas',         'hisp_pct': 33, 'top_origin': 'mexicana', 'local_banks': 'Frost Bank, Wells Fargo, Chase, Bank of America, Amplify Credit Union'},
    {'slug': 'denver-co',        'name': 'Denver',           'state': 'Colorado',      'hisp_pct': 29, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, US Bank, FirstBank, Bellco Credit Union'},
    {'slug': 'albuquerque-nm',   'name': 'Albuquerque',      'state': 'Nuevo México',  'hisp_pct': 49, 'top_origin': 'mexicana y chicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Nusenda Credit Union, Kirtland FCU'},
    {'slug': 'fresno-ca',        'name': 'Fresno',           'state': 'California',    'hisp_pct': 51, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Educational Employees CU, Valley 1st CU'},
    {'slug': 'san-jose-ca',      'name': 'San José',         'state': 'California',    'hisp_pct': 31, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Technology CU, Meriwest CU'},
    {'slug': 'santa-ana-ca',     'name': 'Santa Ana',        'state': 'California',    'hisp_pct': 77, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Orange County CU, SchoolsFirst FCU'},
    {'slug': 'bakersfield-ca',   'name': 'Bakersfield',      'state': 'California',    'hisp_pct': 54, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Kern Schools FCU, Mission Bank'},
    {'slug': 'riverside-ca',     'name': 'Riverside',        'state': 'California',    'hisp_pct': 53, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Altura Credit Union, Arrowhead CU'},
    {'slug': 'hialeah-fl',       'name': 'Hialeah',          'state': 'Florida',       'hisp_pct': 95, 'top_origin': 'cubana', 'local_banks': 'BankUnited, Banesco USA, City National of Florida, Chase, Bank of America'},
    {'slug': 'las-vegas-nv',     'name': 'Las Vegas',        'state': 'Nevada',        'hisp_pct': 33, 'top_origin': 'mexicana, salvadoreña y cubana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Nevada State Bank, Clark County CU'},
    {'slug': 'filadelfia-pa',    'name': 'Filadelfia',       'state': 'Pensilvania',   'hisp_pct': 15, 'top_origin': 'puertorriqueña y dominicana', 'local_banks': 'Chase, Wells Fargo, Citizens Bank, PNC, Santander'},
    {'slug': 'newark-nj',        'name': 'Newark',           'state': 'Nueva Jersey',  'hisp_pct': 37, 'top_origin': 'portuguesa y latina mixta', 'local_banks': 'Chase, Wells Fargo, Bank of America, TD Bank, Investors Bank'},
    {'slug': 'boston-ma',        'name': 'Boston',           'state': 'Massachusetts', 'hisp_pct': 20, 'top_origin': 'dominicana, puertorriqueña y salvadoreña', 'local_banks': 'Chase, Bank of America, Citizens, Santander, East Boston Savings'},
    {'slug': 'atlanta-ga',       'name': 'Atlanta',          'state': 'Georgia',       'hisp_pct': 10, 'top_origin': 'mexicana y centroamericana', 'local_banks': 'Chase, Wells Fargo, Bank of America, SunTrust/Truist, Delta Community CU'},
    {'slug': 'charlotte-nc',     'name': 'Charlotte',        'state': 'Carolina del Norte', 'hisp_pct': 15, 'top_origin': 'mexicana y hondureña', 'local_banks': 'Wells Fargo, Bank of America, Truist, Self-Help Credit Union, First Citizens'},
    {'slug': 'nashville-tn',     'name': 'Nashville',        'state': 'Tennessee',     'hisp_pct': 11, 'top_origin': 'mexicana y salvadoreña', 'local_banks': 'Regions, Truist, Wells Fargo, Pinnacle Financial, First Horizon'},
    {'slug': 'indianapolis-in',  'name': 'Indianápolis',     'state': 'Indiana',       'hisp_pct': 11, 'top_origin': 'mexicana', 'local_banks': 'Chase, PNC, Fifth Third, Huntington, Indiana Members CU'},
    {'slug': 'san-francisco-ca', 'name': 'San Francisco',    'state': 'California',    'hisp_pct': 15, 'top_origin': 'mexicana y salvadoreña', 'local_banks': 'Wells Fargo, Chase, Bank of America, SF Federal CU, Patelco CU'},
    {'slug': 'seattle-wa',       'name': 'Seattle',          'state': 'Washington',    'hisp_pct': 7, 'top_origin': 'mexicana', 'local_banks': 'Chase, Bank of America, Wells Fargo, BECU, Salal Credit Union'},
    {'slug': 'washington-dc',    'name': 'Washington',       'state': 'D.C.',          'hisp_pct': 11, 'top_origin': 'salvadoreña y mexicana', 'local_banks': 'Chase, Bank of America, Wells Fargo, PNC, Congressional FCU'},
    {'slug': 'minneapolis-mn',   'name': 'Minneapolis',      'state': 'Minnesota',     'hisp_pct': 9, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, US Bank, Chase, BMO Harris, Spire Credit Union'},
    {'slug': 'oklahoma-city-ok', 'name': 'Oklahoma City',    'state': 'Oklahoma',      'hisp_pct': 19, 'top_origin': 'mexicana', 'local_banks': 'Chase, Bank of America, Wells Fargo, BancFirst, Tinker FCU'},
    {'slug': 'detroit-mi',       'name': 'Detroit',          'state': 'Michigan',      'hisp_pct': 8, 'top_origin': 'mexicana y puertorriqueña', 'local_banks': 'Chase, Wells Fargo, Comerica, Bank of America, DFCU Financial'},
    {'slug': 'milwaukee-wi',     'name': 'Milwaukee',        'state': 'Wisconsin',     'hisp_pct': 20, 'top_origin': 'mexicana y puertorriqueña', 'local_banks': 'Chase, US Bank, Wells Fargo, Landmark CU, Educators CU'},
    {'slug': 'kansas-city-mo',   'name': 'Kansas City',      'state': 'Misuri',        'hisp_pct': 11, 'top_origin': 'mexicana', 'local_banks': 'Chase, US Bank, Wells Fargo, Commerce Bank, CommunityAmerica CU'},
    {'slug': 'portland-or',      'name': 'Portland',         'state': 'Oregón',        'hisp_pct': 10, 'top_origin': 'mexicana', 'local_banks': 'Chase, Wells Fargo, US Bank, OnPoint Community CU, Advantis CU'},
    {'slug': 'salt-lake-city-ut','name': 'Salt Lake City',   'state': 'Utah',          'hisp_pct': 22, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Zions Bank, Mountain America CU, America First CU'},
    {'slug': 'oakland-ca',       'name': 'Oakland',          'state': 'California',    'hisp_pct': 27, 'top_origin': 'mexicana y salvadoreña', 'local_banks': 'Wells Fargo, Chase, Bank of America, Patelco CU, Golden 1 CU'},
    {'slug': 'memphis-tn',       'name': 'Memphis',          'state': 'Tennessee',     'hisp_pct': 7, 'top_origin': 'mexicana', 'local_banks': 'Regions, First Horizon, Truist, Wells Fargo, Orion FCU'},
    {'slug': 'raleigh-nc',       'name': 'Raleigh',          'state': 'Carolina del Norte', 'hisp_pct': 11, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Bank of America, Truist, State Employees CU, First Citizens'},
    {'slug': 'anaheim-ca',       'name': 'Anaheim',          'state': 'California',    'hisp_pct': 54, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Bank of America, Orange County CU, SchoolsFirst FCU'},
    {'slug': 'long-beach-ca',    'name': 'Long Beach',       'state': 'California',    'hisp_pct': 43, 'top_origin': 'mexicana y salvadoreña', 'local_banks': 'Wells Fargo, Chase, Bank of America, SchoolsFirst FCU, Farmers & Merchants'},
    {'slug': 'corpus-christi-tx','name': 'Corpus Christi',   'state': 'Texas',         'hisp_pct': 63, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, Frost Bank, PlainsCapital, Navy Army CCU'},
    {'slug': 'providence-ri',    'name': 'Providence',       'state': 'Rhode Island',  'hisp_pct': 43, 'top_origin': 'dominicana, guatemalteca y puertorriqueña', 'local_banks': 'Chase, Citizens, Bank of America, Santander, Navigant CU'},
    {'slug': 'aurora-co',        'name': 'Aurora',           'state': 'Colorado',      'hisp_pct': 30, 'top_origin': 'mexicana', 'local_banks': 'Wells Fargo, Chase, US Bank, Bellco CU, Canvas CU'}
]

NAV = '''<nav class="nav" id="nav">
  <div class="container">
    <div class="nav__inner">
      <a href="/" class="nav__logo" aria-label="Norte Financial">
        <div class="nav__logomark"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><line x1="12" y1="2" x2="12" y2="22" stroke="#E8F5F0" stroke-width="1.5" stroke-linecap="round"/><path d="M12 2 L16 7 M12 2 L8 7" stroke="#7EC4A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="2" r="2" fill="#7EC4A8"/></svg></div>
        <div class="nav__wordmark"><span class="nav__wordmark-name">Norte</span><span class="nav__wordmark-sub">Financial</span></div>
      </a>
      <ul class="nav__links"><li><a href="/seguros.html">Seguros</a></li><li><a href="/finanzas.html">Finanzas</a></li><li><a href="/guias.html">Guías</a></li><li><a href="/herramientas.html">Herramientas</a></li></ul>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="nav__lang"><button class="nav__lang-btn active" id="btnEs" onclick="setLang('es')">ES</button><button class="nav__lang-btn" id="btnEn" onclick="setLang('en')">EN</button></div>
        <button class="nav__mobile-toggle" id="mobileToggle" aria-label="Menu" onclick="toggleMobileMenu()"><span></span><span></span><span></span></button>
      </div>
    </div>
    <div class="nav__drawer" id="mobileDrawer"><ul class="nav__drawer-links"><li><a href="/seguros.html">Seguros</a></li><li><a href="/finanzas.html">Finanzas</a></li><li><a href="/guias.html">Guías</a></li><li><a href="/herramientas.html">Herramientas</a></li><li><a href="/estados.html">Estados</a></li></ul></div>
  </div>
</nav>'''

FOOTER = '''<footer class="footer">
  <div class="container">
    <div class="footer__grid" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:40px">
      <div class="footer__brand">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="12" y1="2" x2="12" y2="22" stroke="#E8F5F0" stroke-width="1.5" stroke-linecap="round"/><path d="M12 2 L16 7 M12 2 L8 7" stroke="#7EC4A8" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="2" r="2" fill="#7EC4A8"/></svg></div>
          <div style="display:flex;flex-direction:column;"><span style="font-family:var(--font-display);font-size:20px;font-weight:500;color:white;letter-spacing:-0.01em;">Norte</span><span style="font-size:9px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Financial</span></div>
        </div>
        <p class="footer__tagline">Tu norte financiero.</p>
        <p class="footer__desc">La guía de seguros y finanzas para hispanos en EE.UU.</p>
      </div>
      <div><div class="footer__col-title">Finanzas</div><ul class="footer__links"><li><a href="/credito.html">Crédito</a></li><li><a href="/banca.html">Banca</a></li><li><a href="/remesas.html">Remesas</a></li><li><a href="/impuestos.html">Impuestos</a></li><li><a href="/hipotecas.html">Hipotecas</a></li><li><a href="/prestamos.html">Préstamos</a></li></ul></div>
      <div><div class="footer__col-title">Seguros</div><ul class="footer__links"><li><a href="/seguro-auto.html">Seguro de Auto</a></li><li><a href="/seguro-hogar.html">Seguro de Hogar</a></li><li><a href="/seguro-vida.html">Seguro de Vida</a></li><li><a href="/seguro-medico.html">Seguro Médico</a></li><li><a href="/seguro-negocio.html">Seguro de Negocio</a></li></ul></div>
      <div><div class="footer__col-title">Recursos</div><ul class="footer__links"><li><a href="/guias.html">Guías</a></li><li><a href="/aseguradoras.html">Aseguradoras</a></li><li><a href="/calculadora-remesas.html">Calculadora</a></li><li><a href="/estados.html">Por Estado</a></li><li><a href="/prensa.html">Prensa</a></li></ul></div>
      <div><div class="footer__col-title">Compañía</div><ul class="footer__links"><li><a href="/nosotros.html">Nosotros</a></li><li><a href="/como-ganamos.html">Cómo ganamos</a></li><li><a href="/metodologia.html">Metodología</a></li><li><a href="/contacto.html">Contacto</a></li></ul></div>
    </div>
    <div class="footer__bottom"><p class="footer__copy">© 2026 Norte Financial. Información educativa, no asesoría legal.</p><div class="footer__legal"><a href="/privacidad.html">Privacidad</a><a href="/terminos.html">Términos</a><a href="/divulgacion.html">Divulgación de afiliados</a></div></div>
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
</script>'''

def build_page(city):
    slug = city['slug']
    name = city['name']
    state = city['state']
    hisp_pct = city['hisp_pct']
    top_origin = city['top_origin']
    banks = city['local_banks']
    url = f"{SITE}/tarjeta-credito-itin-{slug}.html"
    title = f"Tarjeta de Crédito con ITIN en {name}, {state} (2026)"
    desc = f"Guía 2026: las mejores tarjetas de crédito para hispanos en {name} sin SSN. Petal, Capital One, Self y más. Requisitos ITIN, bancos locales."
    faqs = [
        {'q': f'¿Puedo obtener una tarjeta de crédito con ITIN en {name}?', 'a': f'Sí. Varios emisores aceptan ITIN en lugar de SSN — notablemente Petal 2, Tomo Credit, Capital One (secured), Self y Mission Lane. En {name}, {state}, los requisitos son los mismos que en cualquier parte del país: tener ITIN válido, dirección de EE.UU. verificable, e ingresos demostrables. Los bancos locales como {banks.split(",")[0].strip()} pueden aprobar cuentas bancarias con ITIN que luego sirven para tu aplicación de tarjeta.'},
        {'q': f'¿Cuál es la tarjeta más fácil de aprobar con ITIN si soy nuevo en {name}?', 'a': f'Para recién llegados a {name} sin historial crediticio, Petal 2 y Tomo Credit son las más accesibles. Ambas evalúan tu flujo bancario en lugar de historial crediticio. Si tienes $200-500 disponibles para depósito, Capital One Secured también es buena opción — el depósito se convierte en tu límite de crédito y después de 6-12 meses te devuelven el dinero.'},
        {'q': f'¿Qué bancos en {name} aceptan ITIN para abrir cuenta?', 'a': f'En {name}, los bancos que típicamente aceptan ITIN para abrir cuenta bancaria incluyen {banks}. Chime y SoFi Money (bancos digitales) también aceptan ITIN en todo el país. Abrir una cuenta bancaria es el primer paso antes de aplicar a tarjeta de crédito porque los emisores quieren ver flujo de ingresos.'},
        {'q': f'¿Cuánto tiempo toma construir crédito con ITIN en {name}?', 'a': f'Si pagas a tiempo y mantienes saldo bajo (menos del 10% del límite), puedes tener un score FICO inicial de 600-650 en 6 meses. Para llegar a 700+ toma 12-24 meses. Esto aplica igual en {name} que en cualquier otra ciudad — los bureaus (Equifax, Experian, TransUnion) son federales.'},
        {'q': f'¿Las tarjetas que aceptan ITIN cobran anuales altos?', 'a': f'Depende. Petal 2 ($0 anual), Capital One Secured ($0), Tomo Credit ($0) y Mission Lane ($0-59) son las mejores opciones sin anual. Evita tarjetas "subprime" como First Premier ($75-125 anuales) que se aprovechan de quienes están construyendo crédito.'}
    ]
    faq_schema = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q['q'],"acceptedAnswer":{"@type":"Answer","text":q['a']}} for q in faqs]}
    article_schema = {"@context":"https://schema.org","@type":"Article","headline":title,"author":{"@type":"Organization","name":"Norte Financial Editorial Team"},"publisher":{"@type":"Organization","name":"Norte Financial","logo":{"@type":"ImageObject","url":f"{SITE}/logo/norte-full-color.svg"}},"datePublished":"2026-04-16","dateModified":"2026-04-16","description":desc,"mainEntityOfPage":url,"inLanguage":"es"}
    breadcrumb_schema = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Norte Financial","item":SITE},
        {"@type":"ListItem","position":2,"name":"Crédito","item":f"{SITE}/credito.html"},
        {"@type":"ListItem","position":3,"name":f"ITIN en {name}","item":url}
    ]}
    faqs_html = ''.join(f'''<details style="border-bottom:1px solid rgba(11,61,46,0.08);padding:18px 0"><summary style="font-weight:500;color:#0B3D2E;cursor:pointer;font-size:16px;list-style:none">{f["q"]}</summary><p style="margin:12px 0 0;color:#4A4A4A;line-height:1.7;font-size:15px">{f["a"]}</p></details>''' for f in faqs)
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
.city-wrap{{padding:60px 0 100px;background:var(--parchment)}}
.city{{max-width:880px;margin:0 auto;padding:0 24px}}
.city h2{{font-family:var(--font-display);font-size:28px;font-weight:500;color:var(--ink);margin:40px 0 16px}}
.city h3{{font-family:var(--font-display);font-size:20px;font-weight:500;color:var(--ink);margin:28px 0 12px}}
.city p{{font-size:16px;line-height:1.75;color:var(--ink-muted);margin-bottom:16px}}
.city ul,.city ol{{margin:12px 0 20px 24px;color:var(--ink-muted);line-height:1.75}}
.city li{{margin-bottom:8px}}
.stat-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0 32px}}
.stat-card{{padding:18px;background:var(--white);border:1px solid var(--border-light);border-radius:var(--r-md);text-align:center}}
.stat-card .label{{font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-light);margin-bottom:6px}}
.stat-card .value{{font-family:var(--font-display);font-size:22px;font-weight:500;color:var(--forest)}}
.card-pick{{background:var(--white);border:1px solid var(--border-light);border-radius:var(--r-lg);padding:22px 24px;margin:14px 0}}
.card-pick h4{{font-family:var(--font-display);font-size:20px;font-weight:500;color:var(--forest);margin:0 0 6px}}
.card-pick .why{{font-size:14px;color:var(--ink-muted);margin:0 0 12px}}
.card-pick .specs{{display:flex;gap:20px;flex-wrap:wrap;font-size:13px;color:var(--ink-light);margin-bottom:14px}}
.card-pick .btn{{display:inline-block;padding:10px 22px;background:var(--amber);color:var(--white);text-decoration:none;border-radius:var(--r-full);font-size:13px;font-weight:500}}
.card-pick .btn:hover{{background:#BA6208}}
.card-pick .review-link{{display:inline-block;margin-left:10px;padding:10px 18px;color:var(--ink-muted);text-decoration:none;border:1px solid var(--border);border-radius:var(--r-full);font-size:13px}}
.disclosure{{background:var(--frost);border:1px solid var(--border-light);border-radius:var(--r-md);padding:14px 18px;font-size:12px;color:var(--ink-muted);margin-bottom:32px;line-height:1.6}}
.disclosure strong{{color:var(--forest)}}
.disclosure a{{color:var(--verde);text-decoration:underline}}
@media(max-width:640px){{.stat-grid{{grid-template-columns:1fr}}}}
</style>
</head>
<body>
{NAV}
<section class="page-hero">
  <div class="container">
    <p class="page-hero__eyebrow">Guía local · Actualizada abril 2026</p>
    <h1 class="page-hero__title">Tarjeta de crédito con ITIN en <em>{name}</em></h1>
    <p class="page-hero__desc">Las mejores tarjetas para hispanos en {name}, {state}, sin SSN. Petal 2, Capital One Secured, Self, Tomo — comparación independiente + bancos locales que aceptan ITIN.</p>
  </div>
</section>
<section class="city-wrap">
<div class="city">

<div class="disclosure"><strong>Aviso de afiliados:</strong> Norte Financial puede recibir compensación cuando haces clic en enlaces o abres cuentas con productos aquí mostrados. Esto no afecta nuestras calificaciones independientes. <a href="/divulgacion.html">Ver divulgación completa</a>.</div>

<div class="stat-grid">
  <div class="stat-card"><div class="label">Población hispana</div><div class="value">{hisp_pct}%</div></div>
  <div class="stat-card"><div class="label">Origen principal</div><div class="value" style="font-size:14px">{top_origin}</div></div>
  <div class="stat-card"><div class="label">Ciudad</div><div class="value" style="font-size:18px">{name}, {state}</div></div>
</div>

<p>{name}, {state} tiene una de las comunidades hispanas más grandes del país — cerca del {hisp_pct}% de la población es latina, con origen principalmente {top_origin}. Para muchos inmigrantes aquí, construir crédito sin historial ni SSN es el primer obstáculo para alcanzar estabilidad financiera: alquilar apartamento requiere verificación de crédito, comprar auto requiere préstamo, comprar casa con ITIN requiere score demostrable.</p>
<p>La buena noticia: <strong>hay tarjetas de crédito específicamente diseñadas para personas con ITIN o sin historial crediticio</strong>. En esta guía revisamos las mejores opciones disponibles para hispanos en {name}, junto con los bancos locales que aceptan ITIN para abrir cuenta (primer paso antes de aplicar a una tarjeta).</p>

<h2>Las 5 mejores tarjetas de crédito con ITIN para hispanos en {name}</h2>

<div class="card-pick">
  <h4>1. Petal 2 "Cash Back, No Fees" Visa</h4>
  <p class="why"><strong>Mejor para:</strong> recién llegados a {name} sin historial, con ingresos estables verificables por cuenta bancaria.</p>
  <div class="specs"><span>✓ ITIN aceptado</span><span>✓ $0 anual</span><span>✓ Reporta a 3 bureaus</span><span>✓ 1-1.5% cashback</span></div>
  <p style="font-size:14px;color:#4A4A4A;margin:0 0 14px">Petal 2 usa el "cash flow underwriting" — evalúan tu actividad bancaria, no tu score. Si depositas tu nómina regularmente, muy probablemente apruebas. Reporta a los 3 bureaus (Equifax, Experian, TransUnion) desde el primer mes.</p>
  <a href="#" class="btn" data-carrier="petal" data-product="credit-card" data-placement="city-{slug}" data-dest="https://www.petalcard.com/">Aplicar con Petal →</a>
  <a href="/resena-petal-2.html" class="review-link">Leer reseña completa</a>
</div>

<div class="card-pick">
  <h4>2. Capital One Platinum Secured</h4>
  <p class="why"><strong>Mejor para:</strong> hispanos en {name} con $200-500 para depósito inicial, que quieren marca grande y upgrade rápido.</p>
  <div class="specs"><span>✓ ITIN aceptado</span><span>✓ $0 anual</span><span>✓ Depósito = límite inicial</span><span>✓ Upgrade gratis en 6 meses</span></div>
  <p style="font-size:14px;color:#4A4A4A;margin:0 0 14px">Depositas $200, $300 o $500 y ese es tu límite inicial. Capital One reporta a los 3 bureaus y automáticamente evalúa tu cuenta cada 6 meses para aumentar límite o convertir a tarjeta no-asegurada (te devuelven el depósito). Es la opción más rápida si tienes el cash disponible.</p>
  <a href="#" class="btn" data-carrier="capital-one-secured" data-product="credit-card" data-placement="city-{slug}" data-dest="https://www.capitalone.com/credit-cards/platinum-secured/">Aplicar con Capital One →</a>
  <a href="/resena-capital-one-secured.html" class="review-link">Leer reseña completa</a>
</div>

<div class="card-pick">
  <h4>3. Self Credit Builder + Secured Visa</h4>
  <p class="why"><strong>Mejor para:</strong> quien NO puede aprobar a ninguna tarjeta aún — el combo Self-loan + tarjeta asegurada funciona como "arranque" forzado del crédito.</p>
  <div class="specs"><span>✓ ITIN aceptado</span><span>✓ $25-150/mes</span><span>✓ Reporta 3 bureaus</span><span>✓ Combo loan + card</span></div>
  <p style="font-size:14px;color:#4A4A4A;margin:0 0 14px">Self es diferente: tú depositas $25-150/mes durante 12-24 meses, ellos lo reportan como préstamo puntualmente pagado. Al final recibes el dinero de vuelta + historial positivo. Una vez que construyes algo, abres la tarjeta Self Visa asegurada con parte de ese dinero. Dos tradelines, cero aprobación requerida inicialmente.</p>
  <a href="#" class="btn" data-carrier="self" data-product="credit-builder" data-placement="city-{slug}" data-dest="https://www.self.inc/">Aplicar con Self →</a>
  <a href="/resena-self.html" class="review-link">Leer reseña completa</a>
</div>

<div class="card-pick">
  <h4>4. Tomo Credit Card</h4>
  <p class="why"><strong>Mejor para:</strong> hispanos jóvenes en {name} con buena educación financiera y flujo bancario, que quieren evitar depósito.</p>
  <div class="specs"><span>✓ ITIN aceptado</span><span>✓ $0 anual</span><span>✓ Sin hard inquiry</span><span>✓ Límites hasta $10K</span></div>
  <p style="font-size:14px;color:#4A4A4A;margin:0 0 14px">Tomo evalúa tu cuenta bancaria (via Plaid) para determinar aprobación — sin consultar tu crédito. Si tienes $2-5K en cuenta o depósitos regulares, puedes aprobar con límites de $2-10K inmediatamente. Reporta a los 3 bureaus.</p>
  <a href="#" class="btn" data-carrier="tomo" data-product="credit-card" data-placement="city-{slug}" data-dest="https://tomocredit.com/">Aplicar con Tomo →</a>
  <a href="/resena-tomo.html" class="review-link">Leer reseña completa</a>
</div>

<div class="card-pick">
  <h4>5. Mission Lane Visa</h4>
  <p class="why"><strong>Mejor para:</strong> hispanos en {name} con crédito "subprime" (580-640) que necesitan una tarjeta no-asegurada para reconstruir.</p>
  <div class="specs"><span>✓ ITIN aceptado</span><span>✓ No asegurada</span><span>✓ Reporta 3 bureaus</span><span>✓ Pre-aprobación sin hard inquiry</span></div>
  <p style="font-size:14px;color:#4A4A4A;margin:0 0 14px">Mission Lane atiende específicamente a quienes están reconstruyendo crédito. Pre-aprobación con soft pull, límites inicial de $300-1,500. La anualidad varía $0-59 según el perfil.</p>
  <a href="#" class="btn" data-carrier="mission-lane" data-product="credit-card" data-placement="city-{slug}" data-dest="https://www.missionlane.com/">Aplicar con Mission Lane →</a>
  <a href="/resena-mission-lane.html" class="review-link">Leer reseña completa</a>
</div>

<h2>Bancos en {name}, {state} que aceptan ITIN</h2>
<p>Para aplicar a tarjetas de crédito ITIN, primero necesitas cuenta bancaria (los emisores lo verifican para validar flujo de ingresos). En {name} y área metropolitana, los bancos que típicamente aceptan ITIN para abrir cuenta incluyen:</p>
<p><strong>{banks}</strong></p>
<p>Adicionalmente, los bancos digitales <strong>Chime</strong>, <strong>SoFi Money</strong>, <strong>Varo</strong> y <strong>Current</strong> aceptan ITIN en todo el país — ideales si prefieres no ir a sucursal física. Todos son gratis, sin cargos mensuales, y dan tarjeta de débito con activación inmediata.</p>

<h3>Documentos para abrir cuenta con ITIN en {name}</h3>
<ol>
  <li>ITIN (obligatorio)</li>
  <li>Pasaporte vigente o Matrícula Consular mexicana (la mayoría de bancos acepta)</li>
  <li>Comprobante de dirección en {name} (licencia, recibo de luz/agua, carta del landlord)</li>
  <li>Número de teléfono válido de EE.UU.</li>
  <li>Depósito inicial (varía según banco: $0-100)</li>
</ol>

<h2>Cómo construir crédito en {name} — ruta recomendada</h2>
<ol>
  <li><strong>Mes 0:</strong> Abre cuenta bancaria (Chime o Capital One — ambos ITIN-friendly).</li>
  <li><strong>Mes 1-2:</strong> Deposita tu ingreso regularmente. Espera a que haya 2-3 meses de actividad.</li>
  <li><strong>Mes 3:</strong> Aplica a Petal 2 o Tomo. Si tienes $200, puedes abrir Capital One Secured inmediatamente en paralelo.</li>
  <li><strong>Mes 3-9:</strong> Usa la tarjeta, mantén saldo bajo 10% del límite, paga a tiempo SIEMPRE. Evita aplicar a otras tarjetas durante estos 6 meses.</li>
  <li><strong>Mes 9-12:</strong> Revisa tu score en Credit Karma (gratis). Si llegaste a 650+, pide upgrade con Capital One (sin hard inquiry).</li>
  <li><strong>Mes 12-18:</strong> Agrega una segunda tarjeta (Discover it o Capital One Quicksilver) para diversificar.</li>
  <li><strong>Mes 18-24:</strong> Con 2 años de historial limpio y utilización &lt;10%, ya calificas para tarjetas premium con buenas recompensas.</li>
</ol>

<h2>Preguntas frecuentes sobre crédito con ITIN en {name}</h2>
{faqs_html}

<div style="background:var(--frost);border-left:4px solid var(--verde);border-radius:var(--r-md);padding:20px 24px;margin:40px 0;font-size:15px;color:var(--ink-muted);line-height:1.7">
  <p style="margin:0"><strong style="color:var(--forest)">Siguiente paso:</strong> antes de aplicar a cualquier tarjeta, abre una cuenta bancaria gratis que acepte ITIN. <a href="/banca.html" style="color:var(--verde)">Compara las mejores cuentas ITIN-friendly aquí</a>.</p>
</div>

<p style="font-size:12px;color:var(--ink-light);margin-top:30px;line-height:1.6">Última actualización: 16 abril 2026. Datos demográficos basados en estimaciones del US Census Bureau (ACS). Los productos financieros cambian sus requisitos con frecuencia; verifica la información más actualizada en los sitios oficiales de cada emisor antes de aplicar. Norte Financial recibe compensación cuando los usuarios son aprobados a través de nuestros enlaces — ver <a href="/divulgacion.html">divulgación completa</a>.</p>

</div>
</section>
{FOOTER}
</body></html>'''

count = 0
for city in CITIES:
    fn = f"tarjeta-credito-itin-{city['slug']}.html"
    with open(fn, 'w') as fh:
        fh.write(build_page(city))
    count += 1
print(f'Created {count} city pages')
