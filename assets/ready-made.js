(function () {
  const BAG_KEY = 'pgorne-bag';
  const money = (n) => '$' + n.toLocaleString('en-US');

  function reveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  function trapReturn(el) { return document.activeElement instanceof HTMLElement ? document.activeElement : el; }

  function initViewer() {
    const triggers = document.querySelectorAll('[data-zoom]');
    if (!triggers.length) return;
    const viewer = document.createElement('div');
    viewer.className = 'viewer';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Zoomed image');
    viewer.inert = true;
    viewer.innerHTML = '<button class="viewer-close label" type="button">Close</button>' +
      '<div class="viewer-stage"><img alt=""></div><p class="viewer-caption label"></p>';
    document.body.appendChild(viewer);
    const stage = viewer.querySelector('.viewer-stage');
    const img = stage.querySelector('img');
    const caption = viewer.querySelector('.viewer-caption');
    const closeBtn = viewer.querySelector('.viewer-close');
    const SCALE = 3;
    let scale = 1, ox = 0, oy = 0, base = null, last = null, drag = null, opener = null;

    const apply = () => {
      img.style.transformOrigin = `${ox}px ${oy}px`;
      img.style.transform = `scale(${scale})`;
      viewer.classList.toggle('zoomed', scale > 1);
    };
    const clamp = () => {
      ox = Math.max(0, Math.min(base.width, ox));
      oy = Math.max(0, Math.min(base.height, oy));
    };
    const reset = () => { scale = 1; ox = oy = 0; img.style.transform = ''; viewer.classList.remove('zoomed'); };

    function open(trigger) {
      opener = trapReturn(trigger);
      reset();
      img.src = trigger.dataset.zoom;
      img.alt = trigger.dataset.caption || '';
      caption.textContent = trigger.dataset.caption || '';
      viewer.inert = false;
      viewer.classList.add('open');
      document.documentElement.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      viewer.classList.remove('open');
      viewer.inert = true;
      document.documentElement.style.overflow = '';
      if (opener) opener.focus();
    }
    function zoomAt(x, y) {
      base = img.getBoundingClientRect();
      ox = x - base.left; oy = y - base.top; clamp();
      scale = SCALE; apply();
    }

    triggers.forEach((t) => t.addEventListener('click', () => open(t)));
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && viewer.classList.contains('open')) close(); });

    stage.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, moved: false, type: e.pointerType };
      last = { x: e.clientX, y: e.clientY };
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', (e) => {
      if (scale === 1) return;
      if (e.pointerType === 'mouse') {
        ox = e.clientX - base.left; oy = e.clientY - base.top; clamp(); apply();
        return;
      }
      if (!drag) return;
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6) { drag.moved = true; viewer.classList.add('dragging'); }
      ox -= dx / (scale - 1); oy -= dy / (scale - 1); clamp(); apply();
      last = { x: e.clientX, y: e.clientY };
    });
    stage.addEventListener('pointerup', (e) => {
      const wasDrag = drag && drag.moved;
      drag = null; viewer.classList.remove('dragging');
      if (wasDrag) return;
      if (scale === 1) {
        const r = img.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (inside) zoomAt(e.clientX, e.clientY); else close();
      } else { reset(); }
    });
    stage.addEventListener('pointercancel', () => { drag = null; viewer.classList.remove('dragging'); });
  }

  function readBag() { try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch (e) { return []; } }
  function writeBag(items) { try { localStorage.setItem(BAG_KEY, JSON.stringify(items)); } catch (e) { /* storage unavailable */ } }

  function initBag() {
    const toggle = document.querySelector('.bag-toggle');
    if (!toggle) return null;
    const bag = document.createElement('div');
    bag.className = 'bag';
    bag.inert = true;
    bag.innerHTML = '<div class="bag-shade"></div>' +
      '<aside class="bag-panel" role="dialog" aria-modal="true" aria-label="Bag">' +
      '<div class="bag-top"><span class="label">Bag</span><button class="label bag-close" type="button">Close</button></div>' +
      '<ul class="bag-items"></ul>' +
      '<div class="bag-foot"><div class="bag-total"><span>Subtotal</span><span class="bag-sum"></span></div>' +
      '<button class="add" type="button" disabled><span>Checkout</span><span>→</span></button>' +
      '<p class="bag-note label">Preview — secure checkout by Square at launch</p></div></aside>';
    document.body.appendChild(bag);
    const list = bag.querySelector('.bag-items');
    let opener = null;

    function render() {
      const items = readBag();
      toggle.textContent = `Bag (${items.length})`;
      list.innerHTML = items.length ? '' : '<li class="bag-empty" style="display:block;border:0;text-transform:none">Your bag is empty.</li>';
      items.forEach((item, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${item.img}" alt=""><div><a href="${item.url}">${item.name}</a><br>Size ${item.size}<br>${money(item.price)}</div><button type="button">Remove</button>`;
        li.querySelector('button').addEventListener('click', () => { const next = readBag(); next.splice(i, 1); writeBag(next); render(); });
        list.appendChild(li);
      });
      bag.querySelector('.bag-sum').textContent = money(items.reduce((s, it) => s + it.price, 0));
    }
    function open() {
      opener = trapReturn(toggle);
      render(); bag.inert = false; bag.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      bag.querySelector('.bag-close').focus();
    }
    function close() {
      bag.classList.remove('open'); bag.inert = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (opener) opener.focus();
    }
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', open);
    bag.querySelector('.bag-close').addEventListener('click', close);
    bag.querySelector('.bag-shade').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && bag.classList.contains('open')) close(); });
    render();
    return { open, add(item) { writeBag(readBag().concat(item)); open(); } };
  }

  function initProduct(bag) {
    const form = document.querySelector('[data-product]');
    if (!form) return;
    const sizes = form.querySelectorAll('.sizes button');
    const msg = form.querySelector('.size-msg');
    let chosen = null;
    sizes.forEach((b) => b.addEventListener('click', () => {
      sizes.forEach((o) => o.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true'); chosen = b.textContent.trim(); msg.textContent = '';
    }));
    form.querySelector('.add').addEventListener('click', () => {
      if (!chosen) { msg.textContent = 'Select a size'; return; }
      const d = form.dataset;
      bag && bag.add({ name: d.name, price: Number(d.price), img: d.img, url: location.pathname, size: chosen });
    });

    const tabs = form.querySelectorAll('[role=tab]');
    const select = (tab) => tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t) => t.addEventListener('click', () => select(t)));
    const fitLink = form.querySelector('[data-open-fit]');
    if (fitLink) fitLink.addEventListener('click', () => {
      const fit = form.querySelector('#tab-fit'); select(fit); fit.focus();
      fit.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function init() { reveal(); initViewer(); initProduct(initBag()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
