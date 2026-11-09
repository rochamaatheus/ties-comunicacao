'use strict';
// Motion da Ties: scroll suave (Lenis) + cenas que recebem o progresso da rolagem em --p.
// Tudo é desligado com prefers-reduced-motion; sem este script, o CSS mostra o estado final.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  window.ties = window.ties || {};
  if (reduce.matches) return;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let vh = innerHeight;

  // ---- Scroll suave: só roda/trackpad; o toque segue nativo para não brigar com o celular.
  let lenis = null;
  if (typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false, anchors: { offset: -80 }, autoRaf: true });
    window.ties.lenis = lenis;
    // menu do celular e campos roláveis não devem ser sequestrados
    document.getElementById('mobileMenu')?.setAttribute('data-lenis-prevent', '');
  }

  // ---- Teleprompter: separa as palavras do parágrafo preservando o negrito.
  document.querySelectorAll('.leitura').forEach(p => {
    const words = [];
    const walk = node => [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          words.push(span);
          frag.append(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
    walk(p);
    words.forEach((w, i) => w.style.setProperty('--i', i));
    p.style.setProperty('--n', words.length);
  });

  // ---- Cenas: cada uma devolve um progresso 0..1 a partir do retângulo na tela.
  const between = (rect, start, end) => clamp((start - rect.top) / (start - end));
  const scenes = [];
  const add = (el, calc, target = el, prop = '--p') => el && scenes.push({ el, calc, target, prop, on: false, last: -1 });

  add(document.getElementById('topo'), r => clamp(-r.top / r.height));
  document.querySelectorAll('.leitura').forEach(el => add(el, r => between(r, vh * 0.88, vh * 0.42 - r.height * 0.5)));
  add(document.querySelector('.trab-cinetica'), r => clamp((vh - r.top) / (vh + r.height)));
  add(document.querySelector('.sobre-foto'), r => clamp((vh - r.top) / (vh + r.height)));
  add(document.querySelector('#sobre'), r => clamp((vh - r.top) / (vh + r.height)), document.querySelector('.sobre-faixa'), '--sp');
  add(document.querySelector('.linha-tempo'), r => between(r, vh * 0.92, vh * 0.42));
  const pin = document.querySelector('.metodo-pin');
  add(pin, r => r.height > vh * 1.5 ? clamp(-r.top / (r.height - vh)) : between(r, vh * 0.7, vh * 0.7 - r.height * 0.75), document.getElementById('metodo'));

  // diferenciais: o item mais perto do meio da tela fica em foco
  const difList = document.querySelector('.dif-lista');
  const difItems = difList ? [...difList.children] : [];
  let difOn = false, difActive = null;
  const updateDif = () => {
    if (!difOn) return;
    let best = null, bestDist = Infinity;
    for (const li of difItems) {
      const r = li.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - vh * 0.5);
      if (d < bestDist) { bestDist = d; best = li; }
    }
    if (best !== difActive) { difActive?.classList.remove('ativo'); best?.classList.add('ativo'); difActive = best; }
  };

  // só calcula cenas perto da tela
  const near = new IntersectionObserver(entries => entries.forEach(entry => {
    const scene = scenes.find(s => s.el === entry.target);
    if (scene) scene.on = entry.isIntersecting;
    if (entry.target === difList) { difOn = entry.isIntersecting; difList.classList.toggle('focando', difOn); if (!difOn) { difActive?.classList.remove('ativo'); difActive = null; } }
  }) || request(), { rootMargin: '25% 0px 25% 0px' });
  scenes.forEach(s => near.observe(s.el));
  if (difList) near.observe(difList);

  const bar = document.querySelector('.progresso');
  let ticking = false;
  function update() {
    ticking = false;
    const max = root.scrollHeight - vh;
    const y = lenis ? lenis.scroll : scrollY;
    bar?.style.setProperty('--pg', (max > 0 ? clamp(y / max) : 0).toFixed(4));
    for (const s of scenes) {
      if (!s.on) continue;
      const p = Math.round(s.calc(s.el.getBoundingClientRect()) * 1000) / 1000;
      if (p !== s.last) { s.last = p; s.target.style.setProperty(s.prop, p); }
    }
    updateDif();
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  if (lenis) lenis.on('scroll', request);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { vh = innerHeight; request(); }, { passive: true });
  // primeira medição depois que o observer marcar as cenas visíveis
  requestAnimationFrame(() => requestAnimationFrame(update));

  // ---- Foto da Fernanda: revelada quando o bloco entra (o clip-path zera a área do próprio elemento)
  const photo = document.querySelector('.sobre-foto');
  if (photo) {
    photo.classList.add('rv');
    const photoObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      photo.classList.add('in');
      photoObserver.disconnect();
    }, { rootMargin: '0px 0px -15% 0px' });
    photoObserver.observe(photo.parentElement);
  }

  // ---- Contadores da linha do tempo
  const counters = document.querySelectorAll('[data-contar]');
  counters.forEach(c => { if (c.getBoundingClientRect().top > vh) c.textContent = c.dataset.de || '0'; });
  const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    countObserver.unobserve(entry.target);
    const el = entry.target, to = Number(el.dataset.contar), from = Number(el.dataset.de || 0);
    const t0 = performance.now(), dur = 1600;
    const step = now => {
      const k = clamp((now - t0) / dur);
      el.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 4))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  counters.forEach(c => countObserver.observe(c));

  // ---- Botões magnéticos (só mouse)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.pill').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.classList.add('ima');
        btn.style.translate = `${(x * 10).toFixed(1)}px ${(y * 8).toFixed(1)}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.classList.remove('ima'); btn.style.translate = ''; });
    });
  }
})();
