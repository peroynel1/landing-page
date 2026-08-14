import './style.css';
import { PLAY_STORE_URL } from './config.ts';

const playHref = PLAY_STORE_URL && PLAY_STORE_URL !== '#' ? PLAY_STORE_URL : '#';

for (const el of document.querySelectorAll<HTMLAnchorElement>('[data-play]')) {
  el.href = playHref;
  if (playHref === '#') {
    el.setAttribute('aria-disabled', 'true');
    el.addEventListener('click', (event) => {
      event.preventDefault();
    });
  }
}

const toggle = document.querySelector<HTMLButtonElement>('#nav-toggle');
const panel = document.querySelector<HTMLElement>('#nav-panel');
toggle?.addEventListener('click', () => {
  const open = panel?.classList.toggle('hidden') === false;
  toggle.setAttribute('aria-expanded', String(open));
});
panel?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    panel.classList.add('hidden');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});
