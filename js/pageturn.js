/* =========================================================
   قلبة الصفحة: the open mushaf in the academy logo turns a page now
   and then, wherever that logo is shown (header, hero, footer, the
   sign-in panel, the app sidebar, the loader).
   A page drawn over the logo's left page lifts, stands up over the
   spine and lies down on the right page, as a mushaf is turned. It
   fades in over the page it leaves and out onto the one it lands on,
   so the logo itself never changes.
   One light loop drives every logo, only while a page is turning;
   logos off screen or in a hidden tab wait for their next turn.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { M.PageTurn = { scan: function () {} }; return; }

  var NS = 'http://www.w3.org/2000/svg';
  /* the open book in the logo, in the image's 1024 units */
  var S0 = [514, 430], S1 = [512, 588];             /* spine: top, bottom */
  var L0 = [318, 362], L1 = [298, 500];             /* left page: outer top, outer bottom */
  var R0 = [697, 360], R1 = [762, 492];             /* right page: outer top, outer bottom */
  var DUR = 1150;

  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  /* the outer corners swing over the spine in an arc */
  function outer(a, b, lift, t) {
    var top = [(a[0] + b[0]) / 2 + (S0[0] - (a[0] + b[0]) / 2) * 0.95, Math.min(a[1], b[1]) - lift], u = 1 - t;
    return [u * u * a[0] + 2 * u * t * top[0] + t * t * b[0], u * u * a[1] + 2 * u * t * top[1] + t * t * b[1]];
  }
  function frameAt(t) {
    var O0 = outer(L0, R0, 250, t), O1 = outer(L1, R1, 180, t), bend = Math.sin(Math.PI * t) * 38;
    return function (u, v) {                         /* u: 0 at the spine, 1 at the outer edge; v: 0 top, 1 bottom */
      var p = lerp(lerp(S0, O0, u), lerp(S1, O1, u), v), k = Math.sin(Math.PI * u) * bend * (t < 0.5 ? 1 : -1) * 0.5;
      return [p[0] + k * 0.6, p[1] - Math.abs(k)];
    };
  }
  function pathOf(F, pts) { return 'M' + pts.map(function (q) { var p = F(q[0], q[1]); return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L'); }
  function outline(F, i) {
    var o = [], n = 14, k, s = 1 - 2 * i;
    for (k = 0; k <= n; k++) o.push([i + k / n * s, i]);
    for (k = 0; k <= n; k++) o.push([1 - i, i + k / n * s]);
    for (k = n; k >= 0; k--) o.push([i + k / n * s, 1 - i]);
    for (k = n; k >= 0; k--) o.push([i, i + k / n * s]);
    return pathOf(F, o) + 'Z';
  }

  var items = [], turning = [], raf = 0;

  function make(host, box) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'pt-layer');
    var g = document.createElementNS(NS, 'g'); g.setAttribute('opacity', '0'); svg.appendChild(g);
    function el(cls) { var e = document.createElementNS(NS, 'path'); e.setAttribute('class', cls); g.appendChild(e); return e; }
    var it = { host: host, box: box, svg: svg, g: g, shadow: el('pt-shadow'), page: el('pt-page'), frame: el('pt-frame'), lines: el('pt-lines'), seen: true, start: 0 };
    return it;
  }

  function draw(it, t) {
    var F = frameAt(t), d = '';
    it.page.setAttribute('d', outline(F, 0));
    it.page.classList.toggle('is-back', t > 0.5);
    it.frame.setAttribute('d', outline(F, 0.09));
    for (var r = 0; r < 7; r++) {
      var v = 0.24 + r * 0.085, s = [];
      for (var k = 0; k <= 10; k++) s.push([0.2 + k * 0.065, v + Math.sin(k * 1.7 + r) * 0.008]);
      d += pathOf(F, s);
    }
    it.lines.setAttribute('d', d);
    it.lines.style.strokeOpacity = (0.55 * Math.abs(Math.cos(Math.PI * t))).toFixed(2);   /* edge-on in the middle */
    var vis = t < 0.06 ? t / 0.06 : t > 0.94 ? (1 - t) / 0.06 : 1;
    it.g.setAttribute('opacity', vis.toFixed(2));
    it.shadow.setAttribute('d', outline(frameAt(1), 0));
    it.shadow.style.fillOpacity = (Math.max(0, t - 0.45) * 0.35 * (1 - t) * 2).toFixed(3);
  }

  function loop(now) {
    raf = 0;
    for (var i = turning.length - 1; i >= 0; i--) {
      var it = turning[i], e = (now - it.start) / DUR;
      if (e >= 1) { it.g.setAttribute('opacity', '0'); turning.splice(i, 1); schedule(it); continue; }
      draw(it, ease(Math.max(0, e)));
    }
    if (turning.length) raf = requestAnimationFrame(loop);
  }
  function turn(it) {
    if (!it.svg.isConnected) return;
    if (document.hidden || !it.seen || !it.box.offsetWidth) { schedule(it); return; }
    it.start = performance.now();
    turning.push(it);
    if (!raf) raf = requestAnimationFrame(loop);
  }
  /* every logo keeps its own rhythm, so the pages on one screen never turn together */
  function schedule(it, first) { setTimeout(function () { turn(it); }, (first ? 500 : 900) + Math.random() * 1100); }

  /* keep the drawing over the picture: the layer sits in the picture's parent, at the picture's box */
  function fitTo(it) {
    var b = it.box;
    if (b.tagName !== 'IMG') return;
    var s = it.svg.style;
    s.left = b.offsetLeft + 'px'; s.top = b.offsetTop + 'px';
    s.width = b.offsetWidth + 'px'; s.height = b.offsetHeight + 'px';
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var it = e.target._pt; if (it) it.seen = e.isIntersecting; });
  }) : null;
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) { es.forEach(function (e) { if (e.target._pt) fitTo(e.target._pt); }); }) : null;

  function scan(root) {
    root = root || document;
    var found = Array.prototype.slice.call(root.querySelectorAll('img[data-logo="academy"], img[data-logo="academy-nowave"], .loader-logo'));
    found.forEach(function (box) {
      if (box._pt) return;
      var host = box.tagName === 'IMG' ? box.parentElement : box;
      if (!host) return;
      if (box.tagName === 'IMG' && getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var it = make(host, box);
      box._pt = it;
      if (box.tagName === 'IMG') box.after(it.svg); else host.appendChild(it.svg);
      fitTo(it);
      if (box.tagName === 'IMG') { box.addEventListener('load', function () { fitTo(it); }); if (ro) ro.observe(box); }
      if (io) io.observe(box);
      items.push(it);
      schedule(it, true);
    });
  }

  M.PageTurn = { scan: scan };
  document.addEventListener('DOMContentLoaded', function () {
    scan(document);
    /* the app pages build their sidebar and top bar after load */
    setTimeout(function () { scan(document); }, 400);
  });
})(window.Manasa);
