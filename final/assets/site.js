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

const services = JSON.parse(document.getElementById('servicesData').textContent);
const dialog = document.getElementById('serviceDialog');
let selectedService = 0;
let previousOverflow = '';
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  selectedService = Number(button.dataset.service);
  const [name, title, description, items] = services[selectedService];
  document.getElementById('serviceName').textContent = name;
  document.getElementById('serviceTitle').textContent = title;
  document.getElementById('serviceDescription').textContent = description;
  document.getElementById('serviceItems').replaceChildren(...items.map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.showModal();
}));
dialog.querySelector('button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
document.getElementById('serviceContact').addEventListener('click', () => {
  document.getElementById('assunto').value = services[selectedService][0];
  dialog.close();
  document.getElementById('nome').focus({ preventScroll: true });
});

document.querySelectorAll('#faq details').forEach(detail => detail.addEventListener('toggle', () => {
  if (detail.open) document.querySelectorAll('#faq details').forEach(other => { if (other !== detail) other.open = false; });
}));

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  for (const field of ['nome', 'empresa']) {
    const input = form.elements[field];
    input.value = input.value.trim();
  }
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const lines = [
    `Olá, Fernanda! Sou ${data.get('nome')}, da ${data.get('empresa')}.`,
    `Gostaria de conversar sobre: ${data.get('assunto')}.`,
    data.get('email') ? `Meu e-mail: ${data.get('email')}` : '',
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
