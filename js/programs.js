/* =========================================================
   البرامج
   - tabs لطفلي / لنفسي; on phones the panels also follow the finger
     (swipe), with the tab pill sliding along
   - kids journey: when it comes into view the surahs pop in one after
     another and the path draws itself up to the current surah
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var sec, tabs, panels, seg, box, dots, mq, current = 0, journeyST = [], scrollIdle;

  function isSwipe() { return mq.matches; }
  function reduce() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap; }

  function setActive(i, fromScroll) {
    current = i;
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    if (!fromScroll) seg.style.setProperty('--p', i);
  }

  /* RTL: panel 0 sits at the right (scrollLeft 0), panel 1 to its left (negative) */
  function scrollToPanel(i) {
    var delta = panels[0].offsetLeft - panels[i].offsetLeft;
    box.scrollTo({ left: -delta, behavior: reduce() ? 'auto' : 'smooth' });
  }

  function select(i) {
    if (isSwipe()) { scrollToPanel(i); setActive(i); return; }
    if (i === current) return;
    var next = panels[i];
    setActive(i);
    if (!reduce()) {
      gsap.fromTo(next.querySelectorAll('.prog-copy > *, .prog-visual'),
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.05, clearProps: 'transform,opacity' });
      if (i === 1) playWeek();
      if (i === 0) popJourney();
    }
  }

  function onSwipeScroll() {
    if (!isSwipe()) return;
    var max = box.scrollWidth - box.clientWidth;
    if (max <= 0) return;
    var p = Math.min(1, Math.abs(box.scrollLeft) / max);
    seg.style.setProperty('--p', p.toFixed(3));
    seg.classList.add('is-dragging');
    clearTimeout(scrollIdle);
    scrollIdle = setTimeout(function () { seg.classList.remove('is-dragging'); }, 120);
    var i = Math.round(p);
    if (i !== current) {
      setActive(i, true);
      M.haptic && M.haptic(6);
      if (i === 1) playWeek();
    }
  }

  /* ---------- kids journey ---------- */
  var J = {};
  function prepJourney() {
    var root = sec.querySelector('[data-journey]');
    J.path = root.querySelector('[data-journey-progress]');
    J.nodes = Array.prototype.slice.call(root.querySelectorAll('.jn'));
    J.lit = J.nodes.filter(function (n) { return n.classList.contains('is-done') || n.classList.contains('is-now'); });
    J.len = J.path.getTotalLength();
    /* where along the path each reached surah sits (0..1) */
    var samples = [];
    for (var k = 0; k <= 300; k++) { var pt = J.path.getPointAtLength(J.len * k / 300); samples.push([pt.x, pt.y, k / 300]); }
    J.frac = J.lit.map(function (n) {
      var x = +getComputedStyle(n).getPropertyValue('--x'), y = +getComputedStyle(n).getPropertyValue('--y');
      var best = 1, bd = Infinity;
      samples.forEach(function (s) { var d = (s[0] - x) * (s[0] - x) + (s[1] - y) * (s[1] - y); if (d < bd) { bd = d; best = s[2]; } });
      return best;
    });
    J.path.style.strokeDasharray = J.len + ' ' + J.len;
  }
  function setJourney(p) {
    J.path.style.strokeDashoffset = J.len * (1 - p);
    J.lit.forEach(function (n, i) { n.classList.toggle('is-lit', p >= J.frac[i] - 0.015); });
  }
  function resetJourney() {
    journeyST.forEach(function (t) { t.kill(); });
    journeyST = [];
    if (window.gsap) gsap.killTweensOf(J.nodes.map(function (n) { return n.querySelector('.jn-dot'); }));
    J.nodes.forEach(function (n) { var d = n.querySelector('.jn-dot'); d.style.transform = ''; d.style.opacity = ''; });
  }
  function popJourney() {
    var dots = J.nodes.map(function (n) { return n.querySelector('.jn-dot'); });
    setJourney(0);
    var st = { p: 0 };
    gsap.to(st, { p: 1, duration: 1.4, ease: 'power2.inOut', onUpdate: function () { J.path.style.strokeDashoffset = J.len * (1 - st.p); } });
    gsap.fromTo(dots, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2.4)', stagger: 0.09 });
    J.lit.forEach(function (n, i) { setTimeout(function () { n.classList.add('is-lit'); }, 120 + i * 90); });
  }
  function initJourney() {
    resetJourney();
    if (reduce()) { setJourney(1); return; }
    var root = sec.querySelector('[data-journey]');
    setJourney(0);
    gsap.set(J.nodes.map(function (n) { return n.querySelector('.jn-dot'); }), { scale: 0, opacity: 0 });
    journeyST.push(ScrollTrigger.create({ trigger: root, start: 'top 80%', once: true, onEnter: popJourney }));
  }

  /* ---------- adults week ---------- */
  var weekPlayed = false;
  function playWeek() {
    if (weekPlayed || reduce()) return;
    weekPlayed = true;
    var w = sec.querySelector('[data-week]');
    var tl = gsap.timeline();
    tl.from(w.querySelectorAll('.wk'), { x: -30, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.12, clearProps: 'transform,opacity' })
      .from(w.querySelector('.wk-time s'), { opacity: 0, duration: 0.3 }, '-=0.1')
      .from(w.querySelector('.wk-new'), { opacity: 0, y: -10, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  function applyMode() {
    box.scrollLeft = 0;
    setActive(0);
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function init() {
    sec = document.querySelector('[data-programs]');
    if (!sec) return;
    tabs = Array.prototype.slice.call(sec.querySelectorAll('[data-prog-tab]'));
    panels = Array.prototype.slice.call(sec.querySelectorAll('[data-prog-panel]'));
    seg = sec.querySelector('.prog-seg');
    box = sec.querySelector('[data-prog-panels]');
    dots = Array.prototype.slice.call(sec.querySelectorAll('.prog-dots i'));
    mq = window.matchMedia('(max-width: 960px)');

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); M.haptic && M.haptic(); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        var n = (i + 1) % tabs.length; tabs[n].focus(); select(n);
      });
    });
    box.addEventListener('scroll', onSwipeScroll, { passive: true });
    mq.addEventListener ? mq.addEventListener('change', applyMode) : mq.addListener(applyMode);

    setActive(0);
    prepJourney();
    initJourney();

    if (window.ScrollTrigger && !reduce()) {
      /* the week animates when it's first seen (desktop shows it after the tab switch) */
      ScrollTrigger.create({
        trigger: sec.querySelector('[data-week]'), start: 'top 80%', once: true,
        onEnter: function () { if (panels[1].classList.contains('is-active')) playWeek(); }
      });
    }
  }

  M.Programs = { init: init };
})(window.Manasa);
