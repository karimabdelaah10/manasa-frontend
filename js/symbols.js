/* =========================================================
   Background symbols: Islamic line icons scattered at random
   in any [data-symbols] layer. Each one draws itself slowly,
   rests, then erases (CSS in css/symbols.css).
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  /* 64×64 line icons */
  var ICONS = [
    /* crescent + star */ '<path d="M44 14 A20 20 0 1 0 50 44 A16 16 0 0 1 44 14 Z"/><path d="M56 22 L57.5 26 L61.7 26.1 L58.4 28.8 L59.5 32.9 L56 30.5 L52.5 32.9 L53.6 28.8 L50.3 26.1 L54.5 26 Z"/>',
    /* dome */ '<path d="M10 56 H54"/><path d="M16 56 V38 H48 V56"/><path d="M16 38 C16 26 25 22 32 14 C39 22 48 26 48 38"/><path d="M32 14 V9"/><path d="M30 7 A2 2 0 1 0 34 7 A2 2 0 1 0 30 7"/><path d="M27 56 V47 A5 5 0 0 1 37 47 V56"/>',
    /* minaret */ '<path d="M22 58 H42"/><path d="M26 58 V30 H38 V58"/><path d="M23 30 H41"/><path d="M26 30 V24 H38 V30"/><path d="M26 24 C26 18 29 15 32 10 C35 15 38 18 38 24"/><path d="M32 10 V5"/><path d="M30 38 H34 M30 46 H34"/>',
    /* lantern */ '<path d="M32 3 V8"/><path d="M27 8 H37 L41 14 H23 Z"/><path d="M23 14 L19 22 H45 L41 14"/><path d="M19 22 L23 48 H41 L45 22"/><path d="M32 22 V48 M26 22 L28 48 M38 22 L36 48"/><path d="M25 48 L28 54 H36 L39 48"/><path d="M30 58 H34"/>',
    /* mihrab */ '<path d="M10 58 H54"/><path d="M14 58 V30 C14 18 22 10 32 6 C42 10 50 18 50 30 V58"/><path d="M21 58 V32 C21 23 26 17 32 14 C38 17 43 23 43 32 V58"/><path d="M32 14 V24"/><path d="M28 24 H36 L34 30 H30 Z"/>',
    /* eight-point star */ '<path d="M32 6 L39.6 13.6 L50.4 13.6 L50.4 24.4 L58 32 L50.4 39.6 L50.4 50.4 L39.6 50.4 L32 58 L24.4 50.4 L13.6 50.4 L13.6 39.6 L6 32 L13.6 24.4 L13.6 13.6 L24.4 13.6 Z"/><path d="M24 32 A8 8 0 1 0 40 32 A8 8 0 1 0 24 32"/>',
    /* mushaf on rahl */ '<path d="M32 37 C28 34 23 33 17 35 V24 C23 22 28 23 32 27 Z"/><path d="M32 37 C36 34 41 33 47 35 V24 C41 22 36 23 32 27 Z"/><path d="M22 54 L40 39 M42 54 L24 39"/><path d="M26 18 Q32 14 38 18 M22 12 Q32 5 42 12"/>',
    /* prayer beads */ '<path d="M16 28 A16 20 0 1 0 48 28 A16 20 0 1 0 16 28"/><path d="M45 28 A3 3 0 1 0 51 28 A3 3 0 1 0 45 28 M40.3 42.1 A3 3 0 1 0 46.3 42.1 A3 3 0 1 0 40.3 42.1 M17.7 42.1 A3 3 0 1 0 23.7 42.1 A3 3 0 1 0 17.7 42.1 M13 28 A3 3 0 1 0 19 28 A3 3 0 1 0 13 28 M17.7 13.9 A3 3 0 1 0 23.7 13.9 A3 3 0 1 0 17.7 13.9 M29 8 A3 3 0 1 0 35 8 A3 3 0 1 0 29 8 M40.3 13.9 A3 3 0 1 0 46.3 13.9 A3 3 0 1 0 40.3 13.9"/><path d="M32 48 V54 M32 54 L27 61 M32 54 V62 M32 54 L37 61"/>',
    /* palm */ '<path d="M22 58 H42"/><path d="M32 58 C34 46 30 34 32 24"/><path d="M32 24 C26 17 18 17 11 23 M32 24 C28 15 22 11 15 11 M32 24 C36 15 42 11 49 11 M32 24 C38 17 46 17 53 23 M32 24 C31 17 33 11 32 6"/>',
    /* mashrabiya */ '<path d="M12 12 H52 V52 H12 Z"/><path d="M12 32 L32 12 L52 32 L32 52 Z"/><path d="M12 22 L22 12 M42 12 L52 22 M52 42 L42 52 M22 52 L12 42"/><path d="M26 32 A6 6 0 1 0 38 32 A6 6 0 1 0 26 32"/>',
    /* prayer rug */ '<path d="M16 8 H48 V56 H16 Z"/><path d="M21 14 H43 V50 H21 Z"/><path d="M25 50 V31 C25 25 28 21 32 18 C36 21 39 25 39 31 V50"/><path d="M19 56 V61 M25 56 V61 M32 56 V61 M39 56 V61 M45 56 V61 M19 3 V8 M25 3 V8 M32 3 V8 M39 3 V8 M45 3 V8"/>',
    /* qalam + inkwell */ '<path d="M18 58 H46 V47 C46 43 42 41 38 41 H26 C22 41 18 43 18 47 Z"/><path d="M27 41 V36 H37 V41"/><path d="M31 36 L47 6 L52 9 L36 38"/><path d="M47 6 L49 3"/>',
    /* kaaba */ '<path d="M12 22 L32 12 L52 22 V46 L32 56 L12 46 Z"/><path d="M12 22 L32 32 L52 22 M32 32 V56"/><path d="M12 28 L32 38 L52 28"/><path d="M38 51 V42 L44 39 V48 Z"/>',
    /* rosette */ '<path d="M26 32 A6 6 0 1 0 38 32 A6 6 0 1 0 26 32"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<path d="M32 26 C27 20 28 13 32 8 C36 13 37 20 32 26 Z" transform="rotate(' + a + ' 32 32)"/>'; }).join(''),
    /* ewer */ '<path d="M22 58 H42"/><path d="M25 58 C20 50 21 40 28 34 V26 H36 V34 C43 40 44 50 39 58"/><path d="M28 26 C28 21 30 19 32 19 C34 19 36 21 36 26"/><path d="M41 42 C47 39 51 33 55 28"/><path d="M25 38 C18 38 16 46 22 50"/>',
    /* crescent */ '<path d="M40 10 A22 22 0 1 0 54 44 A20 20 0 0 1 40 10 Z"/>',
    /* sparkle */ '<path d="M32 6 C34 24 40 30 58 32 C40 34 34 40 32 58 C30 40 24 34 6 32 C24 30 30 24 32 6 Z"/>',
    /* mosque */ '<path d="M6 56 H58"/><path d="M10 56 V24 H16 V56 M13 24 V16 M48 56 V24 H54 V56 M51 24 V16"/><path d="M20 56 V40 H44 V56 M20 40 C20 30 27 26 32 20 C37 26 44 30 44 40 M32 20 V15"/><path d="M29 56 V50 A3 3 0 0 1 35 50 V56"/>',
    /* arched window */ '<path d="M16 58 V28 C16 18 23 11 32 8 C41 11 48 18 48 28 V58 Z"/><path d="M32 8 V58 M16 34 H48 M16 46 H48"/><path d="M24 34 L32 26 L40 34"/>',
    /* open book */ '<path d="M32 18 C26 13 17 12 8 14 V50 C17 48 26 49 32 54 C38 49 47 48 56 50 V14 C47 12 38 13 32 18 Z"/><path d="M32 18 V54"/><path d="M14 24 C19 23 24 23.5 27 26 M14 32 C19 31 24 31.5 27 34 M50 24 C45 23 40 23.5 37 26 M50 32 C45 31 40 31.5 37 34"/>',
    /* hanging star */ '<path d="M32 2 V22"/><path d="M32 22 L36 30 L45 30 L38 36 L41 45 L32 39.5 L23 45 L26 36 L19 30 L28 30 Z"/>',
    /* dome of the rock */ '<path d="M8 56 H56"/><path d="M12 56 V40 H52 V56"/><path d="M12 40 L18 34 H46 L52 40"/><path d="M20 34 V28 H44 V34"/><path d="M20 28 C20 18 26 13 32 12 C38 13 44 18 44 28"/><path d="M32 12 V5"/><path d="M18 45 V51 M25 45 V51 M32 45 V51 M39 45 V51 M46 45 V51"/>',
    /* green dome */ '<path d="M6 56 H58"/><path d="M12 56 V36 H42 V56"/><path d="M14 36 C14 24 21 18 27 16 C33 18 40 24 40 36"/><path d="M27 16 V10"/><path d="M21 36 C21 28 24 21 27 16 C30 21 33 28 33 36"/><path d="M48 56 V22 H54 V56 M51 22 V13 M47 30 H55"/>',
    /* old arched door */ '<path d="M10 58 H54"/><path d="M14 58 V30 C14 18 22 10 32 8 C42 10 50 18 50 30 V58"/><path d="M20 58 V32 C20 23 25 17 32 15 C39 17 44 23 44 32 V58"/><path d="M32 15 V58"/><circle cx="28" cy="40" r="1.6"/><circle cx="36" cy="40" r="1.6"/>',
    /* incense burner */ '<path d="M22 56 H42 L38 48 H26 Z"/><path d="M27 48 V42 H37 V48"/><path d="M18 42 H46 C46 32 40 27 32 23 C24 27 18 32 18 42 Z"/><path d="M32 23 V17"/><path d="M28 13 C26 10 30 8 28 4 M36 13 C34 10 38 8 36 4"/>',
    /* dallah */ '<path d="M20 57 H44"/><path d="M24 57 C21 49 22 40 26 34 H38 C42 40 43 49 40 57"/><path d="M26 34 L28 26 H36 L38 34"/><path d="M29 26 C29 20 35 20 35 26"/><path d="M32 19 V15"/><path d="M24 39 C17 35 13 28 8 22"/><path d="M40 38 C48 38 50 47 43 51"/>',
    /* hourglass */ '<path d="M18 8 H46 M18 56 H46"/><path d="M22 8 C22 22 30 26 30 32 C30 38 22 42 22 56"/><path d="M42 8 C42 22 34 26 34 32 C34 38 42 42 42 56"/><path d="M26 51 C28 46 36 46 38 51"/><path d="M28 18 H36"/>',
    /* scroll */ '<path d="M14 12 C10 12 10 20 14 20 H50 C54 20 54 12 50 12 Z"/><path d="M14 44 C10 44 10 52 14 52 H50 C54 52 54 44 50 44 Z"/><path d="M16 20 V44 M48 20 V44"/><path d="M22 28 H42 M22 34 H42 M22 40 H35"/>',
    /* inkwell + quill */ '<path d="M16 57 H44 V43 C44 37 38 35 36 31 H24 C22 35 16 37 16 43 Z"/><path d="M24 31 V25 H36 V31"/><path d="M33 26 L52 6"/><path d="M52 6 C55 12 52 18 45 19 L40 21"/>',
    /* arabesque tile */ '<path d="M10 10 H54 V54 H10 Z"/><path d="M32 14 C40 14 42 22 50 32 C42 42 40 50 32 50 C24 50 22 42 14 32 C22 22 24 14 32 14 Z"/><circle cx="32" cy="32" r="6"/><path d="M10 10 L19 19 M54 10 L45 19 M10 54 L19 45 M54 54 L45 45"/>',
    /* multifoil arch */ '<path d="M8 58 H56"/><path d="M12 58 V30 C12 26 16 24 18 26 C18 20 22 18 25 20 C26 14 30 12 32 10 C34 12 38 14 39 20 C42 18 46 20 46 26 C48 24 52 26 52 30 V58"/><path d="M20 58 V36 M44 58 V36"/>',
    /* 12-point star */ '<path d="M32.0 6.0 L36.9 13.6 L45.0 9.5 L45.4 18.6 L54.5 19.0 L50.4 27.1 L58.0 32.0 L50.4 36.9 L54.5 45.0 L45.4 45.4 L45.0 54.5 L36.9 50.4 L32.0 58.0 L27.1 50.4 L19.0 54.5 L18.6 45.4 L9.5 45.0 L13.6 36.9 L6.0 32.0 L13.6 27.1 L9.5 19.0 L18.6 18.6 L19.0 9.5 L27.1 13.6 Z"/><circle cx="32" cy="32" r="9"/>',
    /* round seal */ '<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="18"/><path d="M32 8 V14 M32 50 V56 M8 32 H14 M50 32 H56"/><path d="M24 33 C24 27 28 24 32 24 C36 24 40 28 40 32 C40 38 34 40 30 38"/>',
    /* moon + cloud */ '<path d="M40 8 A16 16 0 1 0 56 30 A12 12 0 1 1 40 8 Z"/><path d="M12 52 C6 52 6 44 12 43 C12 36 22 34 25 40 C28 36 36 38 35 44 C40 44 42 52 36 52 Z"/>',
    /* little stars */ '<path d="M22.0 11.0 L24.5 21.5 L35.0 24.0 L24.5 26.5 L22.0 37.0 L19.5 26.5 L9.0 24.0 L19.5 21.5 Z"/><path d="M46.0 8.0 L47.6 14.4 L54.0 16.0 L47.6 17.6 L46.0 24.0 L44.4 17.6 L38.0 16.0 L44.4 14.4 Z"/><path d="M44.0 36.0 L46.0 44.0 L54.0 46.0 L46.0 48.0 L44.0 56.0 L42.0 48.0 L34.0 46.0 L42.0 44.0 Z"/>',
    /* camel */ '<path d="M7 17 C9 13 14 13 15 16 L17 32"/><path d="M7 17 L6 21 H11"/><path d="M16 32 C21 32 23 22 29 22 C33 22 34 29 38 29 C42 29 42 21 47 21 C53 21 56 30 55 38 C54 42 52 44 49 44 H25 C20 44 16 40 16 32"/><path d="M24 44 V58 M30 44 V58 M44 44 V58 M50 44 V58"/>',
    /* tent */ '<path d="M6 54 H58"/><path d="M10 54 L32 14 L54 54"/><path d="M32 14 V7 L38 10 L32 12"/><path d="M26 54 L32 38 L38 54"/><path d="M18 40 C24 38 40 38 46 40"/>',
    /* ramadan fanous */ '<path d="M32 3 V9"/><path d="M26 9 H38 L42 17 H22 Z"/><path d="M22 17 L18 26 L22 44 H42 L46 26 L42 17"/><path d="M18 26 H46"/><path d="M32 17 V44 M25 26 L27 44 M39 26 L37 44"/><path d="M22 44 L26 52 H38 L42 44"/><path d="M32 52 V59"/>'
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* Each icon becomes ONE path, so the pen draws its parts one after
     another and the browser animates one line per symbol instead of 4–6
     (that many separate animations made the page slow). */
  function circleToPath(cx, cy, r) {
    return 'M' + (cx - r) + ' ' + cy + ' a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0 a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0';
  }
  var MERGED = ICONS.map(function (markup) {
    var parts = [];
    markup.replace(/<(path|circle)\b([^>]*)\/?>/g, function (_, tag, attrs) {
      var a = {};
      attrs.replace(/([a-z]+)="([^"]*)"/g, function (__, k, v) { a[k] = v; });
      parts.push(tag === 'path' ? a.d : circleToPath(+a.cx, +a.cy, +a.r));
    });
    return parts.join(' ');
  });

  function fill(layer) {
    var w = layer.clientWidth, h = layer.clientHeight;
    if (!w || !h) return;
    var small = w < 700;
    var density = parseFloat(layer.dataset.density || '1');      /* <1 = fewer symbols */
    var cell = (small ? 66 : 92) / Math.sqrt(density);           /* one symbol per cell, jittered */
    var cols = Math.max(2, Math.round(w / cell));
    var rows = Math.max(2, Math.round(h / cell));
    var minS = small ? 18 : 22, maxS = small ? 32 : 42;
    var html = '';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (Math.random() < 0.22) continue;     /* gaps keep it from looking like a grid */
        var dur = rand(21, 32);                  /* ~40% drawing, ~20% resting, ~40% erasing */
        var size = Math.round(rand(minS, maxS));
        var x = ((c + rand(0.08, 0.88)) / cols) * 100;
        var y = ((r + rand(0.08, 0.88)) / rows) * 100;
        var d = MERGED[Math.floor(Math.random() * MERGED.length)];
        html +=
          '<span class="symbol" style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%"' +
          ' data-dur="' + dur.toFixed(1) + '" data-off="' + rand(0, dur).toFixed(1) + '"' +
          ' data-ddur="' + rand(12, 22).toFixed(1) + '" data-doff="' + rand(0, 20).toFixed(1) + '">' +
          '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" style="transform:rotate(' + Math.round(rand(-20, 20)) + 'deg)">' +
          '<path pathLength="1" d="' + d + '"/>' +
          '</svg></span>';
      }
    }
    layer.innerHTML = html;
    layer._ld = layer.closest('.loader');
    layer._symbols = Array.prototype.map.call(layer.querySelectorAll('.symbol'), function (el) {
      var d = el.dataset;
      return { el: el, path: el.firstChild.firstChild, dur: +d.dur, off: +d.off, ddur: +d.ddur, doff: +d.doff, o: -1, p: -1, tx: '' };
    });
  }

  /* ---------- the pen, driven from one light loop ----------
     The motion is slow (20–30 s per symbol), so 15 updates a second look
     the same as 60 and cost a quarter. Only values that changed are
     written, and off-screen layers / hidden tabs are skipped entirely. */
  var FPS = 15, STEP = 1000 / FPS;
  var active = [];            /* layers currently on screen */
  var last = 0, running = false;

  function easeInOut(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }

  /* phase 0..1 → [dashoffset, opacity] following: draw 0–40%, rest 40–60%, erase 60–100% */
  function pen(ph) {
    var off, op = 1;
    if (ph < 0.4) off = 1 - easeInOut(ph / 0.4);
    else if (ph < 0.6) off = 0;
    else off = -easeInOut((ph - 0.6) / 0.4);
    if (ph < 0.02) op = ph / 0.02;
    else if (ph > 0.98) op = (1 - ph) / 0.02;
    return [off, op];
  }

  function tick(now) {
    if (!active.length || document.hidden) { running = false; return; }
    requestAnimationFrame(tick);
    if (now - last < STEP) return;
    last = now;
    var t = now / 1000;
    for (var i = 0; i < active.length; i++) {
      var ld = active[i]._ld;                      /* the loader's layer: only while the loader is up */
      if (ld && !(ld.classList.contains('is-in') || document.documentElement.classList.contains('is-entering'))) continue;
      var list = active[i]._symbols || [];
      for (var j = 0; j < list.length; j++) {
        var s = list[j];
        var v = pen(((t + s.off) % s.dur) / s.dur);
        var p = Math.round(v[0] * 500) / 500, o = Math.round(v[1] * 50) / 50;
        if (p !== s.p) { s.path.style.strokeDashoffset = p; s.p = p; }
        if (o !== s.o) { s.path.style.opacity = o; s.o = o; }
        var e = 0.5 - 0.5 * Math.cos(2 * Math.PI * ((t + s.doff) % s.ddur) / s.ddur);   /* drift 0 → 1 → 0 */
        var tx = 'translate(' + (8 * e).toFixed(1) + 'px,' + (-16 * e).toFixed(1) + 'px)';
        if (tx !== s.tx) { s.el.style.transform = tx; s.tx = tx; }
      }
    }
  }
  function start() { if (!running && active.length) { running = true; requestAnimationFrame(tick); } }

  var watcher = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var i = active.indexOf(e.target);
      e.target.classList.toggle('is-off', !e.isIntersecting);
      if (e.isIntersecting && i === -1) active.push(e.target);
      if (!e.isIntersecting && i !== -1) active.splice(i, 1);
    });
    start();
  }, { rootMargin: '120px 0px' }) : null;
  document.addEventListener('visibilitychange', start);

  function init() {
    var layers = document.querySelectorAll('[data-symbols]');
    layers.forEach(fill);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (watcher) layers.forEach(function (l) { watcher.observe(l); });
    else { active = Array.prototype.slice.call(layers); start(); }
    var lastW = window.innerWidth, t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (Math.abs(window.innerWidth - lastW) < 80) return;   /* ignore mobile URL-bar resizes */
        lastW = window.innerWidth;
        layers.forEach(fill);
      }, 300);
    });
  }

  M.Symbols = { init: init, fill: fill };
})(window.Manasa);
