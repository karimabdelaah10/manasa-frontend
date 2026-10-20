/* =========================================================
   Entry point for the login + application pages.
   Adds the name/colours switcher, starts the shared modules,
   plays the page intro, then the page's own module.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  M.haptic = M.haptic || function (ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} }
  };

  var SWITCHER =
    '<div class="brand-switcher" data-switcher>' +
      '<button class="switcher-toggle" type="button" aria-expanded="false" aria-controls="switcher-panel" data-switcher-toggle>' +
        '<svg width="22" height="22"><use href="#i-palette"/></svg><span class="label">الاسم والألوان</span>' +
        '<span class="chip-dots" aria-hidden="true"><i></i><i></i></span>' +
      '</button>' +
      '<div class="switcher-panel" id="switcher-panel" role="dialog" aria-label="اختيار الاسم والألوان" data-switcher-panel>' +
        '<span class="sheet-grab" aria-hidden="true"></span><h2>الاسم والألوان</h2><div data-brand-controls></div>' +
      '</div>' +
    '</div><div class="switcher-scrim" data-switcher-scrim></div>';

  function ripples() {
    if (reduce) return;
    document.addEventListener('pointerdown', function (e) {
      var el = e.target.closest('.btn, .palette-option, .seg button, .add-btn');
      if (!el) return;
      var r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
      var dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - r.left - size / 2) + 'px';
      dot.style.top = (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    });
  }

  function intro() {
    if (reduce || !window.gsap) return;
    var phone = window.matchMedia('(max-width: 900px)').matches;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.auth-brand .brand, .auth-mtop', { y: -16, opacity: 0, duration: .6 }, 0)
      .from('.auth-logo, .auth-emblem', { scale: .5, rotate: -25, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' }, .1)
      .from('.auth-brand h1, .auth-brand .lead, .auth-quote', { y: 18, opacity: 0, duration: .7, stagger: .08 }, .3)
      .from('.wiz-rail li', { x: 24, opacity: 0, duration: .5, stagger: .06 }, .45);
    if (phone) tl.from('.auth-main', { y: 120, duration: .9, ease: 'expo.out' }, .15);
    tl.from('.auth-top, .auth-card > header, .wiz-progress, .login-switch, .draft-note', { y: 20, opacity: 0, duration: .6, stagger: .06 }, .3)
      .from('.wiz-step.is-active .wiz-in, [data-login] > *', { y: 22, opacity: 0, duration: .6, stagger: .05, clearProps: 'transform,opacity' }, .45)
      .from('.wiz-actions, .login-foot, .demo-box', { y: 16, opacity: 0, duration: .5 }, .7);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (!document.querySelector('[data-switcher]')) document.body.insertAdjacentHTML('beforeend', SWITCHER);
    M.Brand && M.Brand.init();
    M.Waves && M.Waves.init();
    /* النقش المتحرك behind the form too, not only on the deep panel */
    var main = document.querySelector('.auth-main');
    if (main && !main.querySelector(':scope > .symbols-layer')) {
      main.classList.add('has-symbols');
      main.insertAdjacentHTML('afterbegin', '<div class="symbols-layer symbols-layer--light" data-symbols="form" data-density=".45" aria-hidden="true"></div>');
    }
    M.Symbols && M.Symbols.init();
    M.Forms && M.Forms.enhance(document);
    ripples();
    var page = document.body.dataset.page;
    if (page && M.Pages && M.Pages[page]) M.Pages[page]();
    intro();
  });
})(window.Manasa);
