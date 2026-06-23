/* ═══════════════════════════════════════════════
   SOFTZEN TECHNOLOGIES — script.js  (v6)
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const html = document.documentElement;

  /* ── THEME ─────────────────────────────────── */
  const saved = localStorage.getItem('sz-theme-v2') || 'dark';
  html.setAttribute('data-theme', saved);

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('sz-theme-v2', next);
    });
  }

  /* ── STICKY NAV ────────────────────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── MOBILE MENU ───────────────────────────── */
  const burger   = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  function closeMenu() {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
    burger.classList.remove('is-open');
  }

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.classList.toggle('is-open', open);
      const spans = burger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(3.3px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-3.3px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        closeMenu();
        const spans = burger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      })
    );
  }

  /* ── KEYBOARD NAV ──────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
      closeMenu();
      if (burger) {
        const spans = burger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    }
  });

  /* ── SMOOTH SCROLL ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── SCROLL REVEAL ─────────────────────────── */
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = Number(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      revObs.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

  /* ── COUNTERS ──────────────────────────────── */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      runCounter(e.target);
      countObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.num').forEach(el => countObs.observe(el));

  function runCounter(el) {
    const target   = Number(el.dataset.target);
    const duration = 1500;
    const start    = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(e * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  /* ── ACTIVE NAV HIGHLIGHT ──────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const anchors  = document.querySelectorAll('.nav__links a[href^="#"]');

  const secObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      anchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--gold)' : '';
      });
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => secObs.observe(s));

  /* ── CONTACT FORM ──────────────────────────── */
  const form   = document.getElementById('contactForm');
  const formOk = document.getElementById('formOk');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--red)';
          field.style.boxShadow   = '0 0 0 3px rgba(255,107,129,.15)';
          valid = false;
          setTimeout(() => {
            field.style.borderColor = '';
            field.style.boxShadow   = '';
          }, 2800);
        }
      });
      if (!valid) return;

      const btn  = form.querySelector('button[type=submit]');
      const orig = btn.innerHTML;
      btn.textContent = 'OPENING WHATSAPP…';
      btn.disabled    = true;

      const name    = (form.querySelector('[name=name]')?.value    || '').trim();
      const email   = (form.querySelector('[name=email]')?.value   || '').trim();
      const company = (form.querySelector('[name=company]')?.value || '').trim();
      const phone   = (form.querySelector('[name=phone]')?.value   || '').trim();
      const service = (form.querySelector('[name=service]')?.value || '').trim();
      const budget  = (form.querySelector('[name=budget]')?.value  || '').trim();
      const message = (form.querySelector('[name=message]')?.value || '').trim();

      const waText = [
        `👋 *New Enquiry — SoftZen Technologies*`,
        ``,
        `*Name:* ${name}`,
        email   ? `*Email:* ${email}`     : null,
        company ? `*Company:* ${company}` : null,
        phone   ? `*Phone:* ${phone}`     : null,
        service ? `*Service:* ${service}` : null,
        budget  ? `*Budget:* ${budget}`   : null,
        ``,
        `*Message:*`,
        message,
      ].filter(l => l !== null).join('\n');

      const waURL = `https://wa.me/918073588621?text=${encodeURIComponent(waText)}`;

      setTimeout(() => {
        window.open(waURL, '_blank');
        btn.innerHTML = orig;
        btn.disabled  = false;
        form.reset();
        if (formOk) {
          formOk.style.display = 'block';
          setTimeout(() => { formOk.style.display = 'none'; }, 5000);
        }
      }, 500);
    });
  }

})();
