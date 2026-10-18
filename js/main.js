/* =========================================================
   Entry point: smooth scrolling, touch feedback, then each
   section's module in order.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* a tiny vibration on Android when tapping app-like controls */
  M.haptic = function (ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} }
  };

  function initSmoothScroll() {
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (reduce || !window.Lenis) return;
    var lenis = new Lenis({ lerp: .1, smoothWheel: true });
    M.lenis = lenis;
    if (window.gsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }

  /* in-page links glide to their section, below the fixed header */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      var target = id === '#top' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = -(document.querySelector('[data-header]').offsetHeight || 0);
      if (M.lenis) M.lenis.scrollTo(target, { offset: offset, duration: 1.2 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ripple from the touch point on buttons and tabs */
  function initRipples() {
    if (reduce) return;
    document.addEventListener('pointerdown', function (e) {
      var el = e.target.closest('.btn, .tab-main, .tab, .palette-option, .seg button');
      if (!el) return;
      var r = el.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 1.6;
      var dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - r.left - size / 2) + 'px';
      dot.style.top = (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    M.Brand && M.Brand.init();
    M.Waves && M.Waves.init();
    M.Symbols && M.Symbols.init();
    M.Header && M.Header.init();
    M.Hero && M.Hero.init();
    M.Slogan && M.Slogan.init();
    M.Reveal && M.Reveal.init();
    M.Programs && M.Programs.init();
    M.Sections && M.Sections.init();
    initAnchors();
    initRipples();
  });
})(window.Manasa);
