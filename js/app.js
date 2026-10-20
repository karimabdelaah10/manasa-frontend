/* =========================================================
   App shell for the signed-in pages (teacher + student).
   - builds the sidebar (desktop), top bar + tab bar (phones)
   - helpers: progress rings, counting numbers, toast,
     sheets (dialog on desktop, draggable bottom sheet on phones)
   - page modules live in M.Pages[<body data-page>]
   ========================================================= */
window.Manasa = window.Manasa || {};
window.Manasa.Pages = window.Manasa.Pages || {};

(function (M) {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  M.reduce = function () { return reduce || !window.gsap; };
  M.haptic = M.haptic || function (ms) { if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} } };
  M.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* who is signed in (set by the login page); the demo falls back to a sample user */
  M.user = function (fallbackRole) {
    var u = null;
    try { u = JSON.parse(sessionStorage.getItem('manasa:user') || 'null'); } catch (e) {}
    if (!u || (fallbackRole && u.role !== fallbackRole)) u = fallbackRole === 'teacher' ? { id: '20117', role: 'teacher' } : { id: '10234', role: 'student' };
    return u;
  };

  var BRAND =
    '<a class="brand" href="index.html" aria-label="الموقع">' +
      '<span class="brand-mark"><img data-logo="academy-nowave" src="images/logo/academy-navy-nowave.webp" alt="" width="58" height="58"></span>' +
      '<span class="brand-text">' +
        '<span class="wordmark wordmark--rattil" data-brand-only="rattil"><span class="wm-accent">رتّل</span><span class="wm-plain" aria-hidden="true">رتل</span></span>' +
        '<span class="wordmark wordmark--uns" data-brand-only="uns" aria-label="أُنس"><svg viewBox="0 0 247 201.4"><use href="#uns-wordmark"/></svg></span>' +
        '<span class="brand-tagline" data-brand-only="rattil">اقرأ، وارتقِ، ورتّل</span>' +
        '<span class="brand-tagline" data-brand-only="uns">في صُحبة القرآن… أُنس</span>' +
      '</span></a>';

  var SWITCHER =
    '<div class="brand-switcher" data-switcher>' +
      '<button class="switcher-toggle" type="button" aria-expanded="false" aria-controls="switcher-panel" data-switcher-toggle>' +
        '<svg width="22" height="22"><use href="#i-palette"/></svg><span class="label">الاسم والألوان</span><span class="chip-dots" aria-hidden="true"><i></i><i></i></span></button>' +
      '<div class="switcher-panel" id="switcher-panel" role="dialog" aria-label="اختيار الاسم والألوان" data-switcher-panel data-lenis-prevent>' +
        '<span class="sheet-grab" aria-hidden="true"></span><h2>الاسم والألوان</h2><div data-brand-controls></div></div>' +
    '</div><div class="switcher-scrim" data-switcher-scrim></div>';

  /* ---------- shell ---------- */
  function shell(o) {
    /* o: { role, name, initial, color, sub, current, nav: [[href, icon, label, count]], tabs: [...] } */
    var side = document.querySelector('[data-side]'), top = document.querySelector('[data-top]'), tabs = document.querySelector('[data-tabs]');
    var link = function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === o.current ? ' aria-current="page"' : '') + '><svg><use href="#' + n[1] + '"/></svg>' + n[2] +
        (n[3] ? '<span class="count">' + M.Data.fmt.ar(n[3]) + '</span>' : '') + '</a>';
    };
    if (side) side.innerHTML = BRAND + '<nav class="app-nav" aria-label="القائمة">' + o.nav.map(link).join('') + '</nav>' +
      '<div class="app-user"><span class="av" data-c="' + o.color + '">' + o.initial + '</span><div><b>' + M.esc(o.name) + '</b><small>' + o.sub + '</small></div>' +
      '<button type="button" class="icon-btn" data-logout aria-label="تسجيل الخروج"><svg><use href="#i-logout"/></svg></button></div>';
    if (top) top.innerHTML = BRAND + '<span class="grow"></span>' +
      (o.bell ? '<a class="icon-btn" href="' + o.bell + '" aria-label="التنبيهات"><svg><use href="#i-bell"/></svg><span class="dot"></span></a>' : '') +
      '<button type="button" class="icon-btn" data-logout aria-label="تسجيل الخروج"><svg><use href="#i-logout"/></svg></button>' +
      '<span class="av" data-c="' + o.color + '">' + o.initial + '</span>';
    if (tabs) {
      tabs.className = 'tabbar';
      tabs.setAttribute('aria-label', 'التنقل');
      tabs.style.gridTemplateColumns = 'repeat(' + o.tabs.length + ', minmax(0, 1fr))';
      tabs.innerHTML = o.tabs.map(function (t) {
        return '<a class="tab" href="' + t[0] + '"' + (t[0] === o.current ? ' aria-current="page"' : '') + '><svg><use href="#' + t[1] + '"/></svg>' + t[2] + '</a>';
      }).join('');
      /* in-page tabs (#anchors) light up as you tap them */
      tabs.addEventListener('click', function (e) {
        var a = e.target.closest('a.tab'); if (!a) return;
        tabs.querySelectorAll('a.tab').forEach(function (x) { x.removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'page'); M.haptic();
      });
    }
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-logout]')) return;
      try { sessionStorage.removeItem('manasa:user'); } catch (x) {}
      M.leave ? M.leave('login.html') : (location.href = 'login.html');
    });
  }

  /* ---------- progress ring ---------- */
  var C = 2 * Math.PI * 26;
  M.ring = function (pct, label, small, cls) {
    return '<div class="ring ' + (cls || '') + '" data-ring="' + Math.max(0, Math.min(1, pct)) + '">' +
      '<svg viewBox="0 0 64 64" aria-hidden="true"><circle class="track" cx="32" cy="32" r="26"/>' +
      '<circle class="val" cx="32" cy="32" r="26" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/></svg>' +
      '<span class="lbl"><span>' + label + (small ? '<small>' + small + '</small>' : '') + '</span></span></div>';
  };
  function fillRings(root) {
    (root || document).querySelectorAll('[data-ring]').forEach(function (r) {
      if (r._done) return; r._done = true;
      var v = r.querySelector('.val'), pct = +r.dataset.ring;
      var go = function () { v.style.strokeDashoffset = C * (1 - pct); };
      if (M.reduce() || !('IntersectionObserver' in window)) return go();
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setTimeout(go, 150); io.disconnect(); } });
      io.observe(r);
    });
  }
  M.fillRings = fillRings;

  /* ---------- counting numbers: <b data-count="48.5" data-dec="1"> ---------- */
  function counters(root) {
    (root || document).querySelectorAll('[data-count]').forEach(function (el) {
      if (el._done) return; el._done = true;
      var to = +el.dataset.count, dec = +(el.dataset.dec || 0), fmt = el.dataset.money ? M.Data.fmt.money : function (n) { return M.Data.fmt.num(n, dec); };
      var suffix = el.innerHTML.indexOf('<em') !== -1 ? el.innerHTML.slice(el.innerHTML.indexOf('<em')) : '';
      var paint = function (n) { el.innerHTML = fmt(n) + suffix; };
      if (M.reduce()) return paint(to);
      paint(0);
      var o = { n: 0 };
      gsap.to(o, { n: to, duration: 1.4, ease: 'power3.out', delay: .25, onUpdate: function () { paint(o.n); } });
    });
  }
  M.counters = counters;

  /* ---------- toast ---------- */
  var toastT;
  M.toast = function (msg, icon) {
    var t = document.querySelector('.toast');
    if (!t) { document.body.insertAdjacentHTML('beforeend', '<div class="toast" role="status"></div>'); t = document.querySelector('.toast'); }
    t.innerHTML = '<svg><use href="#' + (icon || 'i-check-circle') + '"/></svg><span></span>';
    t.querySelector('span').textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('is-on'); }, 3200);
  };

  /* ---------- sheets ---------- */
  var scrim, openSheet = null, phone = window.matchMedia('(max-width: 1080px)');
  M.sheet = function (opts) {
    /* opts: { title, sub, body (html), foot (html), onOpen(el), onClose() } → returns the sheet element */
    if (!scrim) {
      document.body.insertAdjacentHTML('beforeend', '<div class="sheet-scrim"></div>');
      scrim = document.querySelector('.sheet-scrim');
      scrim.addEventListener('click', function () { M.closeSheet(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') M.closeSheet(); });
    }
    var el = document.createElement('section');
    el.className = 'sheet';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<span class="sheet-grab" aria-hidden="true"></span>' +
      '<div class="sheet-head"><h2>' + opts.title + (opts.sub ? '<small>' + opts.sub + '</small>' : '') + '</h2>' +
      '<button type="button" class="icon-btn" data-sheet-close aria-label="إغلاق"><svg><use href="#i-close"/></svg></button></div>' +
      '<div class="sheet-body">' + opts.body + '</div>' + (opts.foot ? '<div class="sheet-foot">' + opts.foot + '</div>' : '');
    document.body.appendChild(el);
    el._onClose = opts.onClose;
    el.querySelector('[data-sheet-close]').addEventListener('click', function () { M.closeSheet(); });
    M.Forms && M.Forms.enhance(el);
    /* drag the sheet down to close it (phones) */
    var head = el.querySelector('.sheet-head'), grab = el.querySelector('.sheet-grab'), y0 = null, dy = 0;
    [head, grab].forEach(function (h) {
      h.addEventListener('pointerdown', function (e) { if (!phone.matches || e.target.closest('button')) return; y0 = e.clientY; dy = 0; el.classList.add('is-dragging'); h.setPointerCapture(e.pointerId); });
      h.addEventListener('pointermove', function (e) { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); el.style.setProperty('--drag', dy + 'px'); });
      var end = function () { if (y0 === null) return; y0 = null; el.classList.remove('is-dragging'); if (dy > 90) M.closeSheet(); else el.style.removeProperty('--drag'); };
      h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
    });
    requestAnimationFrame(function () {
      el.classList.add('is-open'); scrim.classList.add('is-on');
      document.documentElement.style.overflow = 'hidden';
      if (!M.reduce()) gsap.from(el.querySelectorAll('.sheet-body > *'), { y: 18, opacity: 0, duration: .5, ease: 'power3.out', stagger: .05, delay: .12, clearProps: 'transform,opacity' });
    });
    openSheet = el;
    if (opts.onOpen) opts.onOpen(el);
    M.haptic(10);
    return el;
  };
  M.closeSheet = function () {
    var el = openSheet; if (!el) return;
    openSheet = null;
    el.classList.remove('is-open'); el.style.removeProperty('--drag'); scrim.classList.remove('is-on');
    document.documentElement.style.overflow = '';
    if (el._onClose) el._onClose();
    setTimeout(function () { el.remove(); }, 500);
  };

  /* ---------- entrance ---------- */
  function intro() {
    if (M.reduce()) return;
    var items = document.querySelectorAll('[data-in]');
    gsap.from('.app-side .brand, .app-nav a, .app-user', { x: 30, opacity: 0, duration: .6, ease: 'power3.out', stagger: .05 });
    gsap.from(items, { y: 26, opacity: 0, duration: .75, ease: 'power3.out', stagger: .07, delay: .1, clearProps: 'transform,opacity' });
    if (window.ScrollTrigger) {
      gsap.utils.toArray('[data-in-scroll]').forEach(function (el) {
        gsap.from(el.children, { y: 26, opacity: 0, duration: .6, ease: 'power3.out', stagger: .06, clearProps: 'transform,opacity',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });
    }
  }

  function ripples() {
    if (reduce) return;
    document.addEventListener('pointerdown', function (e) {
      var el = e.target.closest('.btn, .tab, .council-card, .palette-option, .seg button');
      if (!el) return;
      var r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2;
      var dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - r.left - size / 2) + 'px';
      dot.style.top = (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    });
  }

  /* النقش المتحرك on the app pages: a calm layer behind the whole page,
     and the gold one inside every deep panel (sidebar, top bar, heroes). */
  function addSymbols() {
    if (!document.querySelector('[data-symbols="page"]')) {
      document.body.insertAdjacentHTML('afterbegin', '<div class="symbols-layer symbols-layer--light page-symbols" data-symbols="page" data-density=".4" aria-hidden="true"></div>');
    }
    document.querySelectorAll('.app-side, .app-top, .c-hero, .p-hero, .stat--deep').forEach(function (el) {
      if (el.querySelector(':scope > .symbols-layer')) return;
      el.classList.add('has-symbols');
      var dens = el.matches('.stat--deep, .app-top') ? '.5' : '.7';
      el.insertAdjacentHTML('afterbegin', '<div class="symbols-layer" data-symbols="deep" data-density="' + dens + '" aria-hidden="true"></div>');
    });
  }

  M.App = { shell: shell, BRAND: BRAND };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (!document.querySelector('[data-switcher]')) document.body.insertAdjacentHTML('beforeend', SWITCHER);
    var page = document.body.dataset.page;
    if (page && M.Pages[page]) M.Pages[page]();
    M.Brand && M.Brand.init();
    addSymbols();
    M.Symbols && M.Symbols.init();
    M.Forms && M.Forms.enhance(document);
    counters(); fillRings();
    ripples();
    intro();
  });
})(window.Manasa);
