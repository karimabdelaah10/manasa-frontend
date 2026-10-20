/* =========================================================
   Page-to-page transition shared by every page.
   Leaving: a deep curtain with the octagram rises over the page,
   then the next page loads. Arriving: the same curtain lifts away
   (the "is-entering" class is set before first paint by the
   inline script in each page's <head>).
   M.leave(url) does the same from script (e.g. after login).
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function curtain() {
    var c = document.querySelector('.page-curtain');
    if (c) return c;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="page-curtain" aria-hidden="true"><svg viewBox="0 0 120 120"><use href="#octagram"/></svg></div>');
    return document.querySelector('.page-curtain');
  }

  function leave(url) {
    if (reduce) { window.location.href = url; return; }
    try { sessionStorage.setItem('manasa:nav', '1'); } catch (e) {}
    var c = curtain();
    c.classList.add('is-in');
    setTimeout(function () { window.location.href = url; }, 480);
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

  /* coming back with the browser's back button: no curtain left behind */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var c = document.querySelector('.page-curtain');
      if (c) c.classList.remove('is-in');
      document.documentElement.classList.remove('is-entering');
    }
  });
  /* the arrival curtain only needs to play once */
  setTimeout(function () { document.documentElement.classList.remove('is-entering'); }, 1200);
})(window.Manasa);
