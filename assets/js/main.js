/* =========================================================
   RANDRIANARIVO H. L. ARSON — main.js
   Vanilla JS, zéro dépendance.
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE    = window.matchMedia('(pointer: fine)').matches;

  /* ------------------------------------------------------
     1. THÈME (clair / sombre, mémorisé)
  ------------------------------------------------------ */
  const root = document.documentElement;
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === 'dark' ? '#100F0E' : '#EDE9E3';
  };
  let stored = null;
  try { stored = localStorage.getItem('rha-theme'); } catch (e) {}
  applyTheme(stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('rha-theme', next); } catch (e) {}
  });

  /* ------------------------------------------------------
     2. PRELOADER
  ------------------------------------------------------ */
  const loader = $('#loader'), lBar = $('#loaderBar'), lPct = $('#loaderPct');
  let pct = 0, loaderDone = false;

  const finishLoader = () => {
    if (loaderDone) return;
    loaderDone = true;
    lBar.style.width = '100%';
    lPct.textContent = '100';
    setTimeout(() => {
      loader.classList.add('is-done');
      document.body.classList.add('is-ready');
      startHero();
    }, 320);
  };

  if (REDUCED) {
    finishLoader();
  } else {
    const tick = setInterval(() => {
      pct += Math.random() * 22 + 10;
      if (pct >= 100) { pct = 100; clearInterval(tick); setTimeout(finishLoader, 140); }
      lBar.style.width = pct + '%';
      lPct.textContent = String(Math.floor(pct)).padStart(2, '0');
    }, 70);
    setTimeout(finishLoader, 1600); // filet de sécurité
  }

  /* ------------------------------------------------------
     3. SPLIT TEXT (lettres + mots)
  ------------------------------------------------------ */
  const splitChars = (el) => {
    const text = el.textContent;
    el.textContent = '';
    let i = 0;
    for (const node of text.split('')) {
      if (node === ' ') { el.append(' '); continue; }
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = node;
      s.style.animationDelay = (i++ * 22) + 'ms';
      el.append(s);
    }
  };

  $$('[data-split]').forEach((line) => {
    // conserve le <em> rouge en le traitant à part
    [...line.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createElement('span');
        frag.textContent = n.textContent;
        n.replaceWith(frag);
        splitChars(frag);
        frag.replaceWith(...frag.childNodes);
      } else if (n.nodeType === 1) {
        splitChars(n);
      }
    });
    // ré-échelonne les délais sur toute la ligne
    $$('.char', line).forEach((c, i) => { c.style.animationDelay = (i * 24) + 'ms'; });
  });

  $$('[data-split-words]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.style.setProperty('--i', i);
      s.textContent = w;
      el.append(s, ' ');
    });
  });

  /* ------------------------------------------------------
     4. SCRAMBLE (rôle du hero)
  ------------------------------------------------------ */
  const scrambleEl = $('#scramble');
  const scramble = (el, target, dur = 1100) => {
    const glyphs = '!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const start  = performance.now();
    const from   = el.textContent;
    const frame  = (now) => {
      const p = Math.min(1, (now - start) / dur);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        const th = i / target.length * .72;
        if (p > th + .28) out += target[i];
        else if (p > th)  out += glyphs[(Math.random() * glyphs.length) | 0];
        else              out += from[i] || ' ';
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = target;
    };
    requestAnimationFrame(frame);
  };

  const startHero = () => {
    if (!scrambleEl || REDUCED) return;
    const target = scrambleEl.textContent;
    setTimeout(() => scramble(scrambleEl, target), 520);
  };

  /* ------------------------------------------------------
     5. REVEAL AU SCROLL
  ------------------------------------------------------ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });

  $$('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--d', (i % 6) * 70 + 'ms');
    io.observe(el);
  });
  $$('.section__title, .contact__title, .panel, .tl').forEach((el) => io.observe(el));

  /* ------------------------------------------------------
     6. COMPTEURS
  ------------------------------------------------------ */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1500;
      const run = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = String(Math.round(to * eased)).padStart(2, '0');
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
      countIO.unobserve(el);
    });
  }, { threshold: .6 });
  $$('.num').forEach((el) => countIO.observe(el));

  /* ------------------------------------------------------
     7. SCROLL : progression, nav collante, rail timeline
  ------------------------------------------------------ */
  const nav = $('#nav'), prog = $('#scrollProgress');
  const tlFill = $('#timelineFill'), timeline = $('#timeline');
  const navLinks = $$('[data-navlink]');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('is-stuck', y > 40);

    if (timeline && tlFill) {
      const r = timeline.getBoundingClientRect();
      const p = (window.innerHeight * .55 - r.top) / r.height;
      tlFill.style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
    }

    let active = -1;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= window.innerHeight * .34) active = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === active));
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------
     8. MENU MOBILE
  ------------------------------------------------------ */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = (open) => {
    burger.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
  };
  burger?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('.menu__link').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ------------------------------------------------------
     9. CURSEUR PERSONNALISÉ
  ------------------------------------------------------ */
  if (FINE && !REDUCED) {
    const cur = $('#cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.body.classList.add('has-cursor');

    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hot = 'a,button,[data-tilt],.chips li,.facts li';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hot)) document.body.classList.add('cursor-hot');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hot)) document.body.classList.remove('cursor-hot');
    });
  }

  /* ------------------------------------------------------
     10. BOUTONS MAGNÉTIQUES + TILT
  ------------------------------------------------------ */
  if (FINE && !REDUCED) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .28;
        const y = (e.clientY - r.top - r.height / 2) * .34;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------
     11. CANVAS : grille de points réactive
  ------------------------------------------------------ */
  const cvs = $('#heroCanvas');
  if (cvs && !REDUCED) {
    const ctx = cvs.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2), pts = [], mouse = { x: -1e4, y: -1e4 }, t = 0, raf;

    const build = () => {
      const r = cvs.getBoundingClientRect();
      w = r.width; h = r.height;
      cvs.width = w * dpr; cvs.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = w < 640 ? 42 : 34;
      pts = [];
      for (let y = gap / 2; y < h; y += gap)
        for (let x = gap / 2; x < w; x += gap)
          pts.push({ x, y, ox: x, oy: y });
    };

    const draw = () => {
      t += .012;
      ctx.clearRect(0, 0, w, h);
      const dark = root.getAttribute('data-theme') === 'dark';
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        let push = 0;
        if (d2 < 20000) push = (1 - d2 / 20000) * 22;
        const nd = Math.sqrt(d2) || 1;
        const wave = Math.sin(t + p.ox * .012 + p.oy * .016);
        p.x = p.ox + (dx / nd) * push + wave * 2.2;
        p.y = p.oy + (dy / nd) * push + Math.cos(t + p.ox * .01) * 2.2;

        const near = d2 < 20000;
        const a = near ? .55 : .16 + wave * .07;
        ctx.beginPath();
        ctx.arc(p.x, p.y, near ? 1.9 : 1.05, 0, 6.283);
        ctx.fillStyle = near
          ? `rgba(216,64,47,${a})`
          : (dark ? `rgba(237,233,227,${a})` : `rgba(20,18,16,${a})`);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    build(); draw();
    addEventListener('resize', () => { cancelAnimationFrame(raf); build(); draw(); });
    addEventListener('mousemove', (e) => {
      const r = cvs.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    addEventListener('mouseleave', () => { mouse.x = mouse.y = -1e4; });
  }

  /* ------------------------------------------------------
     12. PORTRAIT : repli si l'image est absente
  ------------------------------------------------------ */
  const portrait = $('#portrait'), fallback = $('#portraitFallback');
  const showFallback = () => {
    if (!fallback) return;
    portrait.style.display = 'none';
    fallback.hidden = false;
    const cvImg = $('#cvPortrait');
    if (cvImg) {
      cvImg.closest('.cv-photo')?.classList.add('is-empty');
      cvImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  };
  if (portrait) {
    portrait.addEventListener('error', showFallback);
    if (portrait.complete && portrait.naturalWidth === 0) showFallback();
  }

  /* ------------------------------------------------------
     13. TOAST
  ------------------------------------------------------ */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg, ms = 4200) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };

  /* ------------------------------------------------------
     14. CV : aperçu A4 + export PDF
  ------------------------------------------------------ */
  const cvDoc = $('#cvDoc');

  const bar = document.createElement('div');
  bar.className = 'cvbar';
  bar.innerHTML = `
    <div class="cvbar__t"><i></i><span>CV — Randrianarivo H. L. Arson · A4 · 2 pages</span></div>
    <div class="cvbar__a">
      <button type="button" id="cvClose">Fermer</button>
      <button type="button" class="is-primary" id="cvPrint">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v3h16v-3"/></svg>
        Enregistrer en PDF
      </button>
    </div>
    <p class="cvbar__hint">Dans la fenêtre d'impression, choisissez « Destination : Enregistrer au format PDF », marges « Aucune » et cochez « Graphiques d'arrière-plan ».</p>`;
  document.body.appendChild(bar);

  const fitCV = () => {
    const A4 = 794; // 210mm ≈ 794px @96dpi
    const avail = Math.min(window.innerWidth - 24, 900);
    const z = Math.min(1, avail / A4);
    $$('.cv-page', cvDoc).forEach((p) => { p.style.zoom = z < 1 ? z : ''; });
  };

  const openCV = () => {
    document.body.classList.add('cv-open');
    cvDoc.setAttribute('aria-hidden', 'false');
    fitCV();
    cvDoc.scrollTop = 0;
  };
  const closeCV = () => {
    document.body.classList.remove('cv-open');
    cvDoc.setAttribute('aria-hidden', 'true');
  };

  const printCV = () => {
    $$('.cv-page', cvDoc).forEach((p) => { p.style.zoom = ''; });
    toast('Ouverture de la fenêtre d’impression — choisissez « Enregistrer au format PDF ».');
    setTimeout(() => window.print(), 220);
  };

  $('#cvClose').addEventListener('click', closeCV);
  $('#cvPrint').addEventListener('click', printCV);
  window.addEventListener('afterprint', () => { if (document.body.classList.contains('cv-open')) fitCV(); });
  window.addEventListener('resize', () => { if (document.body.classList.contains('cv-open')) fitCV(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCV(); setMenu(false); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); openCV(); }
  });

  ['#pdfBtnNav', '#pdfBtnHero', '#pdfBtnFoot'].forEach((sel) => {
    $(sel)?.addEventListener('click', () => { setMenu(false); openCV(); });
  });

  /* ------------------------------------------------------
     14 bis. AJUSTEMENT DES GRANDS TITRES
     Les lignes sont en nowrap : on réduit la taille jusqu'à
     ce que la plus longue tienne dans la colonne, quelle que
     soit la police réellement disponible.
  ------------------------------------------------------ */
  const fitTitles = () => {
    $$('.hero__title, .contact__title').forEach((t) => {
      t.style.fontSize = '';
      const avail = t.clientWidth;
      if (!avail) return;
      let widest = 0;
      $$('.line', t).forEach((l) => { widest = Math.max(widest, l.scrollWidth); });
      if (widest > avail) {
        const base = parseFloat(getComputedStyle(t).fontSize);
        t.style.fontSize = (base * (avail / widest) * 0.995) + 'px';
      }
    });
  };
  fitTitles();
  addEventListener('resize', fitTitles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitles);
  setTimeout(fitTitles, 600);

  /* ------------------------------------------------------
     15. ANCRES : décalage sous la nav
  ------------------------------------------------------ */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ------------------------------------------------------
     16. Petit clin d'œil console
  ------------------------------------------------------ */
  console.log(
    '%c RANDRIANARIVO H. L. ARSON %c Lead Developer Full-stack JS ',
    'background:#141210;color:#EDE9E3;font-weight:700;padding:4px 8px',
    'background:#D8402F;color:#fff;padding:4px 8px'
  );
})();
