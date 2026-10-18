/* =========================================================
   Hero motion
   - intro: words of the title rise one by one, the logo
     springs in, the family emblems and cards fly to place
   - desktop: the logo tilts in 3D toward the pointer and the
     floating pieces move at different depths
   - phones: the logo sways on its own (no pointer to follow)
   - scroll: copy and visual drift apart with parallax
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  /* wrap each word in a span, keeping the highlighted phrase */
  function splitWords(el) {
    function wrapText(text) {
      var frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span');
        s.className = 'word';
        s.textContent = part;
        frag.appendChild(s);
      });
      return frag;
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        el.replaceChild(wrapText(node.textContent), node);
      } else if (node.nodeType === 1) {
        var inner = wrapText(node.textContent);
        node.textContent = '';
        node.appendChild(inner);
      }
    });
  }

  function intro() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.site-header', { y: -30, opacity: 0, duration: .8 }, 0)
      .from('[data-anim="ayah"]', { opacity: 0, y: 18, filter: 'blur(8px)', duration: 1 }, .15)
      .from('.hero-title .word', { opacity: 0, y: 46, rotateX: -70, transformOrigin: '50% 100%', duration: .9, stagger: .055 }, .3)
      .from('[data-anim="fade"]', { opacity: 0, y: 24, duration: .8, stagger: .12 }, .75)
      .from('[data-anim="points"] li', { opacity: 0, x: 20, duration: .6, stagger: .08 }, 1)
      .from('.hero-glow, .hero-ring', { opacity: 0, duration: 1.4, ease: 'power1.out' }, .1)
      .from('.hero-logo', { scale: .45, opacity: 0, rotate: -30, duration: 1.4, ease: 'back.out(1.5)' }, .25)
      .from('.hero-family', { scale: 0, opacity: 0, duration: .8, stagger: .15, ease: 'back.out(2)' }, .95)
      .from('.report-card', { x: -70, opacity: 0, duration: .9 }, 1.15)
      .from('.next-chip', { x: 70, opacity: 0, duration: .9 }, 1.3)
      .from('.rc-progress i', { scaleX: 0, duration: 1.3, ease: 'power2.out' }, 1.5);
    return tl;
  }

  /* gentle idle float; uses yPercent so it composes with pointer x/y */
  function idle() {
    gsap.utils.toArray('[data-depth]').forEach(function (el, i) {
      gsap.to(el, { yPercent: i % 2 ? 7 : -7, duration: 3 + i * .6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
    });
  }

  function pointerTilt(section) {
    var logo = section.querySelector('[data-logo-tilt]');
    var layers = gsap.utils.toArray('[data-depth]');
    var rx = gsap.quickTo(logo, 'rotateX', { duration: .8, ease: 'power3.out' });
    var ry = gsap.quickTo(logo, 'rotateY', { duration: .8, ease: 'power3.out' });
    var movers = layers.map(function (el) {
      return { d: parseFloat(el.dataset.depth) || 1, x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }) };
    });
    section.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - .5;
      var ny = e.clientY / window.innerHeight - .5;
      ry(nx * 22);
      rx(-ny * 16);
      movers.forEach(function (m) { m.x(-nx * 26 * m.d); m.y(-ny * 22 * m.d); });
    });
    section.addEventListener('pointerleave', function () {
      rx(0); ry(0);
      movers.forEach(function (m) { m.x(0); m.y(0); });
    });
  }

  function autoSway(section) {
    var logo = section.querySelector('[data-logo-tilt]');
    gsap.to(logo, { rotateY: 12, rotateX: 5, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
  }

  function scrollParallax() {
    if (!window.ScrollTrigger) return;
    var st = { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-ornament', { y: 160, ease: 'none', scrollTrigger: st });
    /* desktop only: on phones the title and buttons sit below the logo, so
       fading / shifting them while you scroll down to read them is wrong */
    gsap.matchMedia().add('(min-width: 961px)', function () {
      gsap.to('.hero-copy', { y: -70, opacity: .25, ease: 'none', scrollTrigger: st });
      gsap.to('[data-visual]', { y: 90, ease: 'none', scrollTrigger: st });
    });
  }

  function magnetic() {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var x = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3.out' });
      var y = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3.out' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .25);
        y((e.clientY - r.top - r.height / 2) * .35);
      });
      btn.addEventListener('pointerleave', function () { x(0); y(0); });
    });
  }

  function init() {
    var section = document.querySelector('[data-hero]');
    if (!section) return;
    var title = section.querySelector('[data-split]');
    if (title) splitWords(title);

    /* phones + tablets: the two cards come after the title and buttons;
       desktop: they float around the logo */
    var cards = section.querySelector('[data-hero-cards]');
    if (cards) {
      var visual = cards.parentElement, copy = section.querySelector('.hero-copy');
      var narrow = window.matchMedia('(max-width: 960px)');
      var place = function () { (narrow.matches ? copy : visual).appendChild(cards); };
      place();
      narrow.addEventListener ? narrow.addEventListener('change', place) : narrow.addListener(place);
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !window.gsap) return;

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    intro();
    idle();
    if (finePointer) { pointerTilt(section); magnetic(); }
    else autoSway(section);
    scrollParallax();
  }

  M.Hero = { init: init };
})(window.Manasa);
