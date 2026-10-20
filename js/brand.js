/* =========================================================
   Brand state: name (رتّل / أُنس) + palette.
   - Saved in localStorage so it survives reloads.
   - Controls are rendered into every [data-brand-controls]
     (the switcher sheet and the mobile menu) and kept in sync.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var STORE_KEY = 'manasa:brand';
  var root = document.documentElement;

  var PALETTES = {
    navy:    { name: 'كحلي وذهبي',   deep: '#0F2A44', accent: '#C9A24A', note: 'الافتراضي' },
    green:   { name: 'أخضر وبرتقالي', deep: '#075B1C', accent: '#E05614', note: 'دليل الهوية' },
    'green-dark':   { name: 'أخضر غامق وبرتقالي', deep: '#054014', accent: '#E05614', note: '#054014', logo: 'green' },
    'green-deeper': { name: 'أخضر داكن وبرتقالي', deep: '#043410', accent: '#E05614', note: '#043410', logo: 'green' },
    emerald: { name: 'ذهبي وزمردي',  deep: '#0E5A47', accent: '#C9A24A', note: '' }
  };
  var BRANDS = {
    rattil: { name: 'رتّل', title: 'رتّل — أكاديمية تحفيظ القرآن الكريم' },
    uns:    { name: 'أُنس', title: 'أُنس — أكاديمية تحفيظ القرآن الكريم' }
  };

  function read() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ palette: root.dataset.palette, brand: root.dataset.brand })); } catch (e) {}
  }

  /* image file for a logo role in the current palette */
  function logoSrc(role, palette) {
    palette = (PALETTES[palette] && PALETTES[palette].logo) || palette; /* darker greens reuse the green logos */
    if (role === 'academy-nowave') return 'images/logo/academy-' + palette + '-nowave.webp';
    return 'images/logo/' + role + '-' + palette + '.webp';
  }

  function swapLogos(palette) {
    document.querySelectorAll('img[data-logo]').forEach(function (img) {
      var next = logoSrc(img.dataset.logo, palette);
      if (img.getAttribute('src') === next) return;
      var pre = new Image();
      pre.onload = function () {
        img.style.opacity = '0';
        setTimeout(function () { img.src = next; img.style.opacity = ''; }, 220);
      };
      pre.src = next;
    });
  }

  function syncControls() {
    document.querySelectorAll('[data-set-palette]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setPalette === root.dataset.palette));
    });
    document.querySelectorAll('[data-set-brand]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setBrand === root.dataset.brand));
    });
  }

  function setPalette(id) {
    if (!PALETTES[id]) return;
    root.dataset.palette = id;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', PALETTES[id].deep);
    swapLogos(id);
    syncControls();
    save();
    document.dispatchEvent(new CustomEvent('manasa:palette', { detail: id }));
  }

  function setBrand(id) {
    if (!BRANDS[id]) return;
    root.dataset.brand = id;
    var pageTitle = document.body && document.body.dataset.title;   /* inner pages keep their own title */
    document.title = pageTitle ? pageTitle + ' — ' + BRANDS[id].name : BRANDS[id].title;
    syncControls();
    save();
    document.dispatchEvent(new CustomEvent('manasa:brand', { detail: id }));
  }

  function controlsMarkup() {
    var names =
      '<div class="switcher-group">' +
        '<span class="switcher-label">الاسم</span>' +
        '<div class="seg" role="group" aria-label="الاسم">' +
          '<button type="button" data-set-brand="rattil" aria-pressed="false">' +
            '<span class="wordmark wordmark--rattil"><span class="wm-accent">رتّل</span><span class="wm-plain" aria-hidden="true">رتل</span></span>' +
          '</button>' +
          '<button type="button" data-set-brand="uns" aria-pressed="false" aria-label="أُنس">' +
            '<span class="wordmark wordmark--uns"><svg viewBox="0 0 247 201.4"><use href="#uns-wordmark"/></svg></span>' +
          '</button>' +
        '</div>' +
      '</div>';

    var pals = Object.keys(PALETTES).map(function (id) {
      var p = PALETTES[id];
      return '<button type="button" class="palette-option" data-set-palette="' + id + '" aria-pressed="false">' +
        '<span class="sw" aria-hidden="true"><i style="background:' + p.deep + '"></i><i style="background:' + p.accent + '"></i></span>' +
        '<span>' + p.name + '</span>' + (p.note ? '<small>' + p.note + '</small>' : '') +
      '</button>';
    }).join('');

    return names +
      '<div class="switcher-group">' +
        '<span class="switcher-label">الألوان</span>' +
        '<div class="palette-list" role="group" aria-label="الألوان">' + pals + '</div>' +
      '</div>';
  }

  /* ---------- the floating switcher: popover on desktop, bottom sheet on mobile ---------- */
  function initSwitcher() {
    var wrap = document.querySelector('[data-switcher]');
    if (!wrap) return;
    var toggle = wrap.querySelector('[data-switcher-toggle]');
    var panel = wrap.querySelector('[data-switcher-panel]');
    var scrim = document.querySelector('[data-switcher-scrim]');
    var mobile = window.matchMedia('(max-width: 1080px)');

    function open() {
      wrap.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      if (mobile.matches && M.lenis) M.lenis.stop();
    }
    function close() {
      wrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      panel.style.removeProperty('--drag');
      if (M.lenis) M.lenis.start();
    }
    M.closeSwitcher = close;

    toggle.addEventListener('click', function () {
      wrap.classList.contains('is-open') ? close() : open();
    });
    if (scrim) scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) {
      if (!mobile.matches && wrap.classList.contains('is-open') && !wrap.contains(e.target)) close();
    });

    /* drag the sheet down to close it */
    var startY = null, dy = 0;
    panel.addEventListener('pointerdown', function (e) {
      if (!mobile.matches || e.target.closest('button')) return;
      startY = e.clientY; dy = 0;
      wrap.classList.add('is-dragging');
      panel.setPointerCapture(e.pointerId);
    });
    panel.addEventListener('pointermove', function (e) {
      if (startY === null) return;
      dy = Math.max(0, e.clientY - startY);
      panel.style.setProperty('--drag', dy + 'px');
    });
    function end() {
      if (startY === null) return;
      startY = null;
      wrap.classList.remove('is-dragging');
      if (dy > 80) close(); else panel.style.removeProperty('--drag');
    }
    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }

  function init() {
    document.querySelectorAll('[data-brand-controls]').forEach(function (el) { el.innerHTML = controlsMarkup(); });

    document.addEventListener('click', function (e) {
      var p = e.target.closest('[data-set-palette]');
      if (p) { setPalette(p.dataset.setPalette); M.haptic && M.haptic(); return; }
      var b = e.target.closest('[data-set-brand]');
      if (b) { setBrand(b.dataset.setBrand); M.haptic && M.haptic(); }
    });

    var saved = read();
    setPalette(saved.palette && PALETTES[saved.palette] ? saved.palette : (root.dataset.palette || 'navy'));
    setBrand(saved.brand && BRANDS[saved.brand] ? saved.brand : (root.dataset.brand || 'rattil'));
    initSwitcher();
  }

  M.Brand = { init: init, setPalette: setPalette, setBrand: setBrand, PALETTES: PALETTES };
})(window.Manasa);
