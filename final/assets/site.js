'use strict';
const menuButton = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');
function closeMenu(returnFocus = false) {
  menu.classList.add('hidden');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('hidden', !open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const target = document.querySelector(link.hash);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });
matchMedia('(min-width:1024px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

document.querySelectorAll('[data-servico]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('assunto').value = link.dataset.servico;
  if (window.ties?.lenis) window.ties.lenis.scrollTo('#contato', { offset: -80 });
  else document.getElementById('contato').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  document.getElementById('nome').focus({ preventScroll: true });
}));

const serviceItems = document.querySelectorAll('#servicos details');
serviceItems.forEach(detail => detail.addEventListener('toggle', () => {
  if (detail.open) serviceItems.forEach(other => { if (other !== detail) other.open = false; });
}));

document.querySelectorAll('#faq details').forEach(detail => detail.addEventListener('toggle', () => {
  if (detail.open) document.querySelectorAll('#faq details').forEach(other => { if (other !== detail) other.open = false; });
}));

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  for (const field of ['nome', 'empresa', 'email']) {
    const input = form.elements[field];
    input.value = input.value.trim();
  }
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const lines = [
    `Olá, Fernanda! Sou ${data.get('nome')} (${data.get('empresa')}).`,
    `Serviço que procuro: ${data.get('assunto')}.`,
    `Meu e-mail: ${data.get('email')}`,
    String(data.get('mensagem')).trim()
  ].filter(Boolean);
  const url = 'https://wa.me/5547988038218?text=' + encodeURIComponent(lines.join('\n\n'));
  const link = document.getElementById('messageLink');
  link.href = url;
  link.hidden = false;
  const status = document.getElementById('formStatus');
  status.textContent = 'Sua mensagem está preparada. Confira e envie no WhatsApp. Se a nova aba não abrir, use o link abaixo.';
  window.open(url, '_blank', 'noopener,noreferrer');
});

// ===== Motion e navegação =====
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Letreiro: pausa pelo botão (WCAG 2.2.2) e pela preferência do sistema.
const ticker = document.querySelector('.letreiro');
const tickerButton = ticker?.querySelector('.letreiro-pausa');
tickerButton?.addEventListener('click', () => {
  const paused = ticker.classList.toggle('pausado');
  tickerButton.setAttribute('aria-pressed', String(paused));
  tickerButton.setAttribute('aria-label', paused ? 'Retomar letreiro de serviços' : 'Pausar letreiro de serviços');
});

// Revelações ao rolar. Sem IntersectionObserver ou com movimento reduzido, tudo fica visível.
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const groups = [
    '#conteudo > section:not(#topo) .section-note',
    '#conteudo > section:not(#topo) .h-sec',
    '#imprensa .p-ref:not(.leitura)', '.imprensa-extra',
    ['.servicos-lista details'], '.servicos-fim',
    '.dif-lede', '.dif-intro .pill', ['.dif-lista li'],
    '.trab-lede', '.trab-head .p-ref', '.trab-cta',
    '#sobre .space-y-5 .p-ref',
    '#metodo .pill',
    '#blog .blog-layout .p-ref', ['.blog-cards li'],
    ['#faq details'],
    '#contato .grid > div:first-child > *', '#contactForm'
  ];
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    observer.unobserve(entry.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  for (const group of groups) {
    const staggered = Array.isArray(group);
    document.querySelectorAll(staggered ? group[0] : group).forEach((el, i) => {
      if (el.classList.contains('rv')) return;
      el.classList.add('rv');
      if (staggered) el.style.setProperty('--rv-i', String(i % 8));
      observer.observe(el);
    });
  }
  root.classList.add('motion');
}

// Seção atual no menu, sombra do cabeçalho e botão flutuante.
const header = document.querySelector('header');
const navLinks = [...document.querySelectorAll('header a[href^="#"]:not([href="#topo"])')];
const fab = document.querySelector('.fab');
const visibleWithWhatsApp = new Set();
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  const id = entry.target.id;
  if (entry.isIntersecting) {
    navLinks.forEach(link => link.hash === '#' + id ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current'));
  }
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('#conteudo > section').forEach(section => sectionObserver.observe(section));
// o botão flutuante usa uma área própria: some enquanto qualquer parte do topo ou do contato estiver na tela
const fabObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  entry.isIntersecting ? visibleWithWhatsApp.add(entry.target.id) : visibleWithWhatsApp.delete(entry.target.id);
  fab?.classList.toggle('oculto', visibleWithWhatsApp.size > 0);
}), { threshold: 0.15 });
['topo', 'contato'].forEach(id => fabObserver.observe(document.getElementById(id)));
const onScroll = () => header.classList.toggle('rolou', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true });
requestAnimationFrame(onScroll);
