// Comportamenti del sito: menu mobile, lightbox della galleria, titoli delle card su una riga.

// Menu mobile
const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#primary-nav');

if (menuButton && nav) {
  const setOpen = (open: boolean) => {
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  menuButton.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', (e) => {
    const target = e.target as Node;
    if (nav.classList.contains('is-open') && !nav.contains(target) && !menuButton.contains(target)) {
      setOpen(false);
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) setOpen(false);
  });
}

// Lightbox galleria percorso
const galleryItems = document.querySelectorAll<HTMLAnchorElement>('.gallery-item');

if (galleryItems.length > 0) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  const image = document.createElement('img');
  overlay.appendChild(image);
  document.body.appendChild(overlay);

  const close = () => {
    overlay.classList.remove('is-open');
    image.removeAttribute('src');
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      image.src = item.dataset.full || item.href;
      image.alt = item.querySelector('img')?.alt ?? '';
      overlay.classList.add('is-open');
    });
  });
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

// Titoli delle card percorso: una sola riga, font ridotto se troppo lungo
function fitTitles() {
  document.querySelectorAll<HTMLElement>('.route-title').forEach((title) => {
    title.style.fontSize = '';
    const max = parseFloat(getComputedStyle(title).fontSize);
    const min = parseFloat(getComputedStyle(title).getPropertyValue('--route-card-title-min-size')) || 15;
    let size = max;
    while (title.scrollWidth > title.clientWidth && size > min) {
      size -= 0.5;
      title.style.fontSize = `${size}px`;
    }
  });
}

fitTitles();
window.addEventListener('load', fitTitles);
window.addEventListener('resize', fitTitles);
document.fonts?.ready.then(fitTitles);
