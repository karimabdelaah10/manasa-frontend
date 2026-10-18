/* =========================================================
   Scroll reveals shared by every section:
   [data-reveal]          the element rises in once
   [data-reveal-stagger]  its children rise in one after another
   [data-type-card]       cards slide in from their own side
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  function watchSections() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
    }, { rootMargin: '80px 0px' });
    document.querySelectorAll('.section, .hero').forEach(function (s) { io.observe(s); });
  }

  function init() {
    watchSections();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !window.gsap || !window.ScrollTrigger) return;

    var singles = gsap.utils.toArray('[data-reveal]');
    gsap.set(singles, { opacity: 0, y: 28 });
    ScrollTrigger.batch(singles, {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08, overwrite: true, clearProps: 'transform' });
      }
    });

    gsap.utils.toArray('[data-reveal-stagger]').forEach(function (group) {
      var kids = group.children;
      gsap.set(kids, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: group, start: 'top 85%', once: true,
        onEnter: function () { gsap.to(kids, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, clearProps: 'transform' }); }
      });
    });

    gsap.utils.toArray('[data-type-card]').forEach(function (card, i) {
      gsap.from(card, {
        x: i === 0 ? 70 : -70, opacity: 0, rotate: i === 0 ? 2 : -2,
        duration: 1, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true }
      });
    });
    var or = document.querySelector('.types-or');
    if (or) gsap.from(or, { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: or, start: 'top 85%', once: true } });
  }

  M.Reveal = { init: init };
})(window.Manasa);
