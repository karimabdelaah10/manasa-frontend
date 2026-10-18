/* =========================================================
   Logo frequency bars.
   The bars were removed from the logo image (…-nowave.webp)
   and are redrawn here at the exact same spots, then kept
   moving like a live recitation equalizer.
   Coordinates are in the logo image's 1024×1024 space.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var BARS = [
    [324, 296, 333, 305], [340, 294, 351, 306], [357, 290, 369, 310], [375, 283, 387, 316],
    [392, 275, 404, 324], [410, 264, 422, 334], [428, 280, 440, 319], [446, 277, 458, 322],
    [464, 261, 477, 337], [484, 241, 497, 356], [504, 221, 518, 377], [524, 247, 538, 351],
    [544, 263, 557, 335], [563, 277, 576, 322], [582, 280, 594, 318], [600, 264, 612, 334],
    [618, 276, 630, 324], [636, 283, 648, 316], [653, 290, 665, 310], [672, 294, 683, 306],
    [690, 296, 699, 305]
  ];
  var NS = 'http://www.w3.org/2000/svg';

  function draw(svg) {
    svg.innerHTML = '';
    return BARS.map(function (b) {
      var r = document.createElementNS(NS, 'rect');
      var w = b[2] - b[0];
      r.setAttribute('x', b[0]);
      r.setAttribute('y', b[1]);
      r.setAttribute('width', w);
      r.setAttribute('height', b[3] - b[1]);
      r.setAttribute('rx', w / 2);
      r.style.fill = 'var(--c-wave)';
      r.style.transition = 'fill .6s ease';
      svg.appendChild(r);
      return r;
    });
  }

  function animate(rects) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !window.gsap) return;
    var mid = (rects.length - 1) / 2;
    return rects.map(function (r, i) {
      /* bars near the middle move more, like a voice */
      var spread = 1 - Math.abs(i - mid) / (mid + 1) * 0.45;
      return gsap.fromTo(r,
        { scaleY: gsap.utils.random(0.3, 1), transformOrigin: '50% 50%' },
        {
          scaleY: function () { return gsap.utils.random(0.22, spread); },
          duration: function () { return gsap.utils.random(0.28, 0.7); },
          ease: 'sine.inOut',
          repeat: -1,
          repeatRefresh: true
        });
    });
  }

  function init() {
    /* bars only move while their logo is on screen */
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        (e.target._tweens || []).forEach(function (t) { e.isIntersecting ? t.resume() : t.pause(); });
      });
    }) : null;
    document.querySelectorAll('[data-waves]').forEach(function (svg) {
      svg._tweens = animate(draw(svg)) || [];
      if (io) io.observe(svg);
    });
  }

  M.Waves = { init: init };
})(window.Manasa);
