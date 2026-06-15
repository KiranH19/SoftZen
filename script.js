/* ═══════════════════════════════════════════════
   SOFTZEN — script.js  v2
   Obsidian Editorial Theme
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const html = document.documentElement;

  /* ── THEME ─────────────────────────────────── */
  const saved = localStorage.getItem('sz-theme-v2') || 'dark';
  html.setAttribute('data-theme', saved);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('sz-theme-v2', next);
    // re-draw canvas with right colour
    drawHeroCanvas();
  });


  /* ── STICKY NAV ────────────────────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ── MOBILE MENU ───────────────────────────── */
  const burger   = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );


  /* ── SCROLL REVEAL ─────────────────────────── */
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = Number(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      revObs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => revObs.observe(el));


  /* ── COUNTERS ──────────────────────────────── */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      runCounter(e.target);
      countObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.vstat__n').forEach(el => countObs.observe(el));

  function runCounter(el) {
    const target   = Number(el.dataset.target);
    const duration = 2000;
    const start    = performance.now();
    const step     = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4); // ease-out quart
      el.textContent = Math.floor(e * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }


  /* ── HERO CANVAS ───────────────────────────── */
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  let nodes    = [];
  let animId;

  function isDark() { return html.getAttribute('data-theme') === 'dark'; }

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    spawnNodes();
  }

  function spawnNodes() {
    const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 6000));
    nodes = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      r:  Math.random() * 2 + .8,
    }));
  }

  function drawHeroCanvas() {
    if (!canvas) return;
    const dark       = isDark();
    const nodeColor  = dark ? 'rgba(245,166,35,' : 'rgba(180,100,0,';
    const lineColor  = dark ? 'rgba(245,166,35,' : 'rgba(200,120,0,';
    const bgColor    = dark ? '#0d1117' : '#f0f2f5';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)';
    ctx.lineWidth   = 1;
    const gs        = 40;
    for (let x = 0; x < canvas.width; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // connections
    const maxDist = 100;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * (dark ? .45 : .25);
          ctx.beginPath();
          ctx.strokeStyle = lineColor + a + ')';
          ctx.lineWidth   = .8;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor + (dark ? '.8' : '.6') + ')';
      ctx.fill();

      // glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3);
      g.addColorStop(0, nodeColor + (dark ? '.12' : '.08') + ')');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  function tickNodes() {
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });
  }

  function loop() {
    tickNodes();
    drawHeroCanvas();
    animId = requestAnimationFrame(loop);
  }

  const roObs = new ResizeObserver(() => { resizeCanvas(); });
  if (canvas) {
    roObs.observe(canvas);
    resizeCanvas();
    loop();
  }


  /* ── CONTACT FORM ──────────────────────────── */
  const form   = document.getElementById('contactForm');
  const formOk = document.getElementById('formOk');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn  = form.querySelector('button[type=submit]');
      const orig = btn.textContent;
      btn.textContent = 'SENDING...';
      btn.disabled    = true;

      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled    = false;
        form.reset();
        formOk.style.display = 'block';
        setTimeout(() => { formOk.style.display = 'none'; }, 5000);
      }, 1400);
    });
  }


  /* ── ACTIVE NAV ────────────────────────────── */
  const sections   = document.querySelectorAll('section[id]');
  const anchors    = document.querySelectorAll('.nav__links a[href^="#"]');

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


  /* ── WHY ITEM CURSOR LINE ──────────────────── */
  document.querySelectorAll('.why-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      item.style.backgroundImage =
        `linear-gradient(90deg, var(--white-faint) ${x}%, transparent ${x}%)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.backgroundImage = '';
    });
  });


  /* ── SERVICE CARD SCAN LINE ────────────────── */
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      let y = -100;
      const scan = setInterval(() => {
        y += 8;
        card.style.backgroundImage =
          `linear-gradient(to bottom, transparent ${y}%, rgba(245,166,35,.04) ${y + 4}%, transparent ${y + 8}%)`;
        if (y > 200) {
          clearInterval(scan);
          card.style.backgroundImage = '';
        }
      }, 14);
    });
  });


  /* ── STAGGER CHILDREN ON SCROLL ───────────── */
  // process steps and test cards also stagger via data-delay


  /* ── KEYBOARD NAVIGATION ───────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') navLinks.classList.remove('open');
  });


  /* ── SMOOTH ANCHOR SCROLL (fallback) ───────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();