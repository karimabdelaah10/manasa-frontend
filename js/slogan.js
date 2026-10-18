/* =========================================================
   Slogan band: as you scroll in, the ornaments draw themselves
   (same pen idea as «النقش المتحرك») and the words rise one by one.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  /* the word that carries the accent color in each slogan */
  var KEY_WORDS = ['ورتّل', 'أُنس'];

  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w) {
      var s = document.createElement('span');
      s.className = 'sw-word';
      if (KEY_WORDS.indexOf(w.replace(/[،…]/g, '')) !== -1) s.classList.add('is-key');
      s.textContent = w;
      el.appendChild(s);
    });
  }

  function prepOrnament(svg) {
    svg.querySelectorAll('path').forEach(function (p) {
      var len = Math.ceil(p.getTotalLength()) + 1;
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = len;
    });
  }

  function init() {
    var band = document.querySelector('[data-slogan-band]');
    if (!band) return;
    band.querySelectorAll('[data-slogan-words]').forEach(splitWords);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !window.gsap || !window.ScrollTrigger) return;

    /* hero slogan fades in once the logo has landed */
    gsap.from('[data-hero-slogan] span', { opacity: 0, y: 12, duration: 0.8, delay: 1.5, ease: 'power2.out' });

    var orns = band.querySelectorAll('[data-slogan-orn]');
    orns.forEach(prepOrnament);

    var tl = gsap.timeline({
      scrollTrigger: { trigger: band, start: 'top 85%', end: 'center 55%', scrub: 0.8 }
    });
    tl.to(band.querySelectorAll('[data-slogan-orn] path'), { strokeDashoffset: 0, ease: 'none', duration: 1, stagger: 0.04 }, 0);
    /* only the visible brand's words animate; the hidden one is display:none */
    tl.fromTo(band.querySelectorAll('.sw-word'),
      { yPercent: 70, opacity: 0, rotateX: -60, filter: 'blur(6px)' },
      { yPercent: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.6, stagger: 0.18 }, 0.15);
    tl.fromTo(band.querySelectorAll('.slogan-src'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7);

    /* gentle drift on the way out */
    gsap.to(band.querySelector('.slogan-inner'), {
      yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: band, start: 'center center', end: 'bottom top', scrub: true }
    });
  }

  M.Slogan = { init: init };
})(window.Manasa);
