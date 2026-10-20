/* =========================================================
   Loader + page-to-page transition, shared by every page.
   Leaving: the loader (.loader, in each page's markup) rises over
   the page while its count starts climbing, then the next page loads
   and carries the count on (sessionStorage 'manasa:nav').
   Arriving: the loader is already up (html.is-entering, set before
   the first paint by the inline script in <head>); the count follows
   what has really loaded (images, fonts, the load event), reaches
   ١٠٠٪ and the loader lifts away.
   M.leave(url) does the same from script (e.g. after login).
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DIG = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/\d/g, function (d) { return DIG[d]; }); }

  function loader() {
    var l = document.querySelector('.loader');
    if (l) return l;
    document.body.insertAdjacentHTML('afterbegin',
      '<div class="loader" aria-hidden="true"><div class="loader-logo"><i class="loader-frame"></i><i class="loader-art"></i></div>' +
      '<p class="loader-count"><b data-loader-num>٠</b>٪</p></div>');
    return document.querySelector('.loader');
  }

  /* the shown count chases a target; it never goes back and never jumps past it */
  var shown = 0, target = 0, raf = 0, onFull = null;
  function paint() {
    var num = document.querySelector('[data-loader-num]');
    if (num) num.textContent = ar(Math.floor(shown));
  }
  function step() {
    raf = 0;
    if (shown < target) {
      shown = Math.min(target, shown + Math.max(0.6, (target - shown) * 0.14));
      paint();
    }
    if (shown >= 100 && onFull) { var f = onFull; onFull = null; f(); return; }
    if (shown < target || onFull) raf = requestAnimationFrame(step);
  }
  function aim(t) { target = Math.max(target, Math.min(100, t)); if (!raf) raf = requestAnimationFrame(step); }

  /* ---------- leaving ---------- */
  function leave(url) {
    if (reduce) { window.location.href = url; return; }
    var l = loader();
    l.style.transition = 'none'; l.classList.remove('is-out'); void l.offsetWidth; l.style.transition = '';
    shown = 0; target = 0; paint();
    l.classList.add('is-in');
    aim(38);
    setTimeout(function () {
      try { sessionStorage.setItem('manasa:nav', String(Math.max(1, Math.floor(shown)))); } catch (e) {}
      window.location.href = url;
    }, 560);
  }
  M.leave = leave;

  /* internal links to another page of the site */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href)) return;
    var url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return;
    e.preventDefault();
    M.haptic && M.haptic();
    leave(url.href);
  });

  /* ---------- arriving ---------- */
  function arrive() {
    var l = loader();
    l.classList.add('is-in');                      /* keep it up once is-entering goes */
    root.classList.remove('is-entering');
    shown = Math.min(60, parseInt(root.dataset.navFrom, 10) || 0); paint();

    var imgs = Array.prototype.filter.call(document.images, function (i) { return i.loading !== 'lazy'; });
    var fontsReady = !document.fonts, loaded = document.readyState === 'complete';
    function measure() {
      if (loaded && fontsReady) { aim(100); return; }
      var n = imgs.length, k = imgs.filter(function (i) { return i.complete; }).length;
      aim(55 + 35 * (n ? k / n : 1) + (fontsReady ? 5 : 0));
    }
    imgs.forEach(function (i) { if (!i.complete) { i.addEventListener('load', measure); i.addEventListener('error', measure); } });
    if (document.fonts) document.fonts.ready.then(function () { fontsReady = true; measure(); });
    window.addEventListener('load', function () { loaded = true; measure(); });
    measure();

    var gone = false;
    function lift() {
      if (gone) return; gone = true;
      setTimeout(function () { l.classList.remove('is-in'); l.classList.add('is-out'); }, 160);
    }
    onFull = lift;
    if (!raf) raf = requestAnimationFrame(step);
    setTimeout(function () { aim(100); }, 4000);   /* a slow image never holds the page hostage */
    setTimeout(lift, 6000);
  }
  if (root.classList.contains('is-entering')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrive); else arrive();
  }

  /* coming back with the browser's back button: no loader left behind */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    var l = document.querySelector('.loader');
    if (l) { l.style.transition = 'none'; l.classList.remove('is-in'); l.classList.add('is-out'); void l.offsetWidth; l.style.transition = ''; }
    root.classList.remove('is-entering');
  });
})(window.Manasa);
