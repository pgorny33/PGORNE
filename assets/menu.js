(function () {
  function initializeMenu() {
    const toggles = document.querySelectorAll('.menu-toggle');
    if (!toggles.length) return;

    const style = document.createElement('style');
    style.textContent = `
      .site-menu {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(243,239,232,.985);
        display: grid;
        place-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 650ms ease;
        font-family: Arial, Helvetica, sans-serif;
        color: #141414;
      }
      .site-menu.open {
        opacity: 1;
        pointer-events: auto;
      }
      .site-menu nav {
        display: flex;
        flex-direction: column;
        gap: clamp(18px,3vh,30px);
        text-align: center;
      }
      .site-menu nav a {
        text-decoration: none;
        color: #141414;
        font-size: clamp(24px,5vw,64px);
        letter-spacing: .08em;
        text-transform: uppercase;
        font-weight: 300;
      }
      .site-menu nav a:hover,
      .site-menu nav a[aria-current="page"] {
        color: #6B3529;
      }
      .site-menu .site-menu-close {
        position: fixed;
        top: 28px;
        right: 32px;
        appearance: none;
        border: 0;
        background: transparent;
        letter-spacing: .18em;
        color: #141414;
        cursor: pointer;
        font-size: 12px;
        text-transform: uppercase;
      }
      @media (prefers-reduced-motion: reduce) {
        .site-menu {
          transition: none;
        }
      }
    `;
    document.body.appendChild(style);

    const overlay = document.createElement('section');
    overlay.className = 'site-menu';
    overlay.id = 'siteMenu';
    overlay.setAttribute('aria-label', 'Site navigation');
    overlay.inert = true;
    overlay.innerHTML = '<button class="site-menu-close" type="button">Close</button><nav><a href="/ethos">Ethos</a><a href="/atelier">Atelier</a><a href="/galerie">Galerie</a><a href="/ready-made">Ready Made</a><a href="/book">Book</a></nav>';
    document.body.appendChild(overlay);

    const currentPath = normalizePath(location.pathname);
    overlay.querySelectorAll('nav a').forEach(link => {
      if (normalizePath(new URL(link.href, location.href).pathname) === currentPath) {
        link.setAttribute('aria-current', 'page');
      }
    });

    let openedBy = null;
    let previousOverflow = '';

    function open(toggle) {
      openedBy = toggle;
      previousOverflow = document.documentElement.style.overflow;
      overlay.classList.add('open');
      overlay.inert = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      overlay.querySelector('nav a').focus();
    }

    function close() {
      if (!overlay.classList.contains('open')) return;
      overlay.classList.remove('open');
      overlay.inert = true;
      if (openedBy) {
        openedBy.setAttribute('aria-expanded', 'false');
        openedBy.focus();
      }
      document.documentElement.style.overflow = previousOverflow;
      openedBy = null;
    }

    toggles.forEach(toggle => {
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('aria-controls', 'siteMenu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', event => {
        event.preventDefault();
        open(toggle);
      });
      toggle.addEventListener('keydown', event => {
        if (event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          open(toggle);
        }
      });
    });

    overlay.querySelector('.site-menu-close').addEventListener('click', close);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  function normalizePath(path) {
    return path.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMenu, { once: true });
  } else {
    initializeMenu();
  }
}());
