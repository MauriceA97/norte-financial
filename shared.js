// Norte Financial — Shared Nav, Footer, Lang System
// Injected into every page

window.NORTE = window.NORTE || {};

NORTE.currentLang = localStorage.getItem('norte_lang') || 'es';

NORTE.navHTML = `
<nav class="nav" id="nav">
  <div class="container">
    <div class="nav__inner">
      <a href="/index.html" class="nav__logo" aria-label="Norte Financial">
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
        <li><a href="/guias.html" data-es="Guías" data-en="Guides">Guías</a></li>
        <li><a href="/herramientas.html" data-es="Herramientas" data-en="Tools">Herramientas</a></li>
        <li><a href="/estados.html" data-es="Estados" data-en="States">Estados</a></li>
      </ul>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="nav__lang">
          <button class="nav__lang-btn" id="btnEs" onclick="NORTE.setLang('es')">ES</button>
          <button class="nav__lang-btn" id="btnEn" onclick="NORTE.setLang('en')">EN</button>
        </div>
        <a href="/cotizar.html" class="nav__cta" data-es="Cotizar gratis" data-en="Get free quote">
          Cotizar gratis
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <button class="nav__mobile-toggle" id="mobileToggle" aria-label="Menu" onclick="NORTE.toggleMenu()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="nav__drawer" id="mobileDrawer">
      <ul class="nav__drawer-links">
        <li><a href="/seguros.html" onclick="NORTE.closeMenu()" data-es="Seguros" data-en="Insurance">Seguros</a></li>
        <li><a href="/guias.html" onclick="NORTE.closeMenu()" data-es="Guías" data-en="Guides">Guías</a></li>
        <li><a href="/herramientas.html" onclick="NORTE.closeMenu()" data-es="Herramientas" data-en="Tools">Herramientas</a></li>
        <li><a href="/estados.html" onclick="NORTE.closeMenu()" data-es="Estados" data-en="States">Estados</a></li>
      </ul>
      <a href="/cotizar.html" class="nav__drawer-cta" onclick="NORTE.closeMenu()" data-es="Cotizar gratis →" data-en="Get free quote →">Cotizar gratis →</a>
    </div>
  </div>
</nav>`;

NORTE.footerHTML = `
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__brand">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="12" y1="2" x2="12" y2="22" stroke="#E8F5F0" stroke-width="1.5" stroke-linecap="round"/><path d="M12 2 L16 7 M12 2 L8 7" stroke="#7EC4A8" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="2" r="2" fill="#7EC4A8"/></svg>
          </div>
          <div style="display:flex;flex-direction:column;">
            <span style="font-family:var(--font-display);font-size:20px;font-weight:500;color:white;">Norte</span>
            <span style="font-size:9px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Financial</span>
          </div>
        </div>
        <p class="footer__tagline">Tu norte financiero.</p>
        <p class="footer__desc" data-es="La guía de seguros y finanzas personales para hispanos en Estados Unidos. Bilingüe, gratuita, y diseñada para tu familia." data-en="The insurance and personal finance guide for Hispanics in the United States. Bilingual, free, and designed for your family.">La guía de seguros y finanzas personales para hispanos en Estados Unidos.</p>
      </div>
      <div>
        <div class="footer__col-title" data-es="Seguros" data-en="Insurance">Seguros</div>
        <ul class="footer__links">
          <li><a href="/seguro-auto.html" data-es="Seguro de Auto" data-en="Auto Insurance">Seguro de Auto</a></li>
          <li><a href="/seguro-hogar.html" data-es="Seguro de Hogar" data-en="Home Insurance">Seguro de Hogar</a></li>
          <li><a href="/seguro-vida.html" data-es="Seguro de Vida" data-en="Life Insurance">Seguro de Vida</a></li>
          <li><a href="/seguro-medico.html" data-es="Seguro Médico" data-en="Health Insurance">Seguro Médico</a></li>
          <li><a href="/seguro-negocio.html" data-es="Seguro de Negocio" data-en="Business Insurance">Seguro de Negocio</a></li>
        </ul>
      </div>
      <div>
        <div class="footer__col-title" data-es="Recursos" data-en="Resources">Recursos</div>
        <ul class="footer__links">
          <li><a href="/guias.html" data-es="Guías en Español" data-en="Guides in Spanish">Guías en Español</a></li>
          <li><a href="/herramientas.html" data-es="Calculadoras" data-en="Calculators">Calculadoras</a></li>
          <li><a href="/estados.html" data-es="Por Estado" data-en="By State">Por Estado</a></li>
          <li><a href="/cotizar.html" data-es="Cotizar Gratis" data-en="Free Quote">Cotizar Gratis</a></li>
        </ul>
      </div>
      <div>
        <div class="footer__col-title" data-es="Compañía" data-en="Company">Compañía</div>
        <ul class="footer__links">
          <li><a href="/nosotros.html" data-es="Nosotros" data-en="About Us">Nosotros</a></li>
          <li><a href="/cotizar.html" data-es="Para agencias" data-en="For agencies">Para agencias</a></li>
          <li><a href="#" data-es="Contacto" data-en="Contact">Contacto</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__copy" data-es="© 2025 Norte Financial. Información educativa, no asesoría legal. · Todos los derechos reservados." data-en="© 2025 Norte Financial. Educational information, not legal advice. · All rights reserved.">© 2025 Norte Financial. Información educativa, no asesoría legal.</p>
      <div class="footer__legal">
        <a href="#" data-es="Privacidad" data-en="Privacy">Privacidad</a>
        <a href="#" data-es="Términos" data-en="Terms">Términos</a>
        <a href="#" data-es="Divulgación" data-en="Disclosure">Divulgación</a>
      </div>
    </div>
  </div>
</footer>`;

NORTE.setLang = function(lang) {
  NORTE.currentLang = lang;
  localStorage.setItem('norte_lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-es]').forEach(el => {
    const text = el.getAttribute('data-' + lang);
    if (text) {
      if (el.tagName === 'INPUT') el.placeholder = text;
      else el.innerHTML = text;
    }
  });
  const btnEs = document.getElementById('btnEs');
  const btnEn = document.getElementById('btnEn');
  if (btnEs) { btnEs.classList.toggle('active', lang === 'es'); btnEn.classList.toggle('active', lang === 'en'); }
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.placeholder = lang === 'es' ? 'Escribe tu pregunta...' : 'Type your question...';
};

NORTE.toggleMenu = function() {
  const d = document.getElementById('mobileDrawer');
  const t = document.getElementById('mobileToggle');
  const open = d.classList.contains('open');
  d.classList.toggle('open', !open);
  t.classList.toggle('open', !open);
};

NORTE.closeMenu = function() {
  document.getElementById('mobileDrawer')?.classList.remove('open');
  document.getElementById('mobileToggle')?.classList.remove('open');
};

NORTE.init = function() {
  // Inject nav
  const navPlaceholder = document.getElementById('norte-nav');
  if (navPlaceholder) navPlaceholder.outerHTML = NORTE.navHTML;
  // Inject footer
  const footerPlaceholder = document.getElementById('norte-footer');
  if (footerPlaceholder) footerPlaceholder.outerHTML = NORTE.footerHTML;
  // Nav scroll
  window.addEventListener('scroll', () => {
    document.getElementById('nav')?.classList.toggle('scrolled', window.scrollY > 20);
  });
  // Apply saved language
  NORTE.setLang(NORTE.currentLang);
  // Highlight active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav__links a, .nav__drawer-links a').forEach(a => {
    if (a.getAttribute('href') === path || a.getAttribute('href') === path.replace('/','')) {
      a.style.color = 'var(--forest)';
      a.style.background = 'var(--frost)';
    }
  });
};

document.addEventListener('DOMContentLoaded', NORTE.init);
