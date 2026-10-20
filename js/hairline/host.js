/* =========================================================
   Hairline host: puts Hairline figures (github.com/lucasmarkes/hairline)
   into our pages. The kernel (kernel.js) is the package's, unchanged;
   each figure file calls hairline({...}) and this host mounts it into
   every <div data-hl="<name>"> on the page, with:
   - our palette (css/hairline.css maps the five strokes to our tokens)
   - an Arabic read-out under the drawing ([data-hl-read])
   - the figure's tour played once when it first comes into view,
     giving way to a real pointer, so phones see the answer too
   Load order: kernel.js, host.js, then the figure files.
   ========================================================= */
(function () {
  'use strict';

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(s) { return String(s).replace(/\d/g, function (d) { return AR[d]; }); }

  /* figure read-outs → Arabic, one rule per figure name */
  var READ = {
    stairs: function (t) { var m = /juz (\d+)/.exec(t); return m ? 'الجزء ' + ar(m[1]) : null; },
    rahl: function (t) { var m = /page (\d+)/.exec(t); return m ? 'الصفحة ' + ar(m[1]) : null; },
    beads: function (t) { var m = /bead (\d+)/.exec(t); return m ? 'الحبة ' + ar(m[1]) + ' من ٣٣' : null; },
    lanterns: function (t) { var m = /lantern (\d+)/.exec(t); return m ? 'الفانوس ' + ar(m[1]) : null; }
  };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.hairline = function (figure) {
    HL.inject(document);
    document.querySelectorAll('[data-hl="' + figure.name + '"]').forEach(function (host) {
      if (host._hl) return;
      var stage = document.createElement('div');
      stage.setAttribute('data-hairline', figure.name);
      stage.setAttribute('role', 'img');
      stage.setAttribute('aria-label', host.dataset.hlLabel || figure.means);
      host.prepend(stage);
      var svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
      var out = host.querySelector('[data-hl-read]');
      var restText = out ? out.textContent : '';
      var text = null;
      var read = {
        get textContent() { return text; },
        set textContent(v) {
          text = v == null ? '' : String(v);
          if (!out) return;
          var t = text === 'rest' ? restText : (READ[figure.name] && READ[figure.name](text)) || text;
          if (out.textContent !== t) { out.textContent = t; out.classList.toggle('is-live', text !== 'rest'); }
        }
      };
      /* the slider's middle value, as the package's default */
      var handle = figure.mount({ stage: stage, svg: svg, read: read }, figure.range[1]);
      host._hl = handle;

      /* play the lap once when it first shows, unless motion is reduced */
      if (reduce || !figure.tour || !('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        setTimeout(function () {
          var lap = HL.tour(stage, figure.tour, function () {});
          /* the lap ends on its own (the tour's last stop leaves); stop it if a hand arrives */
          stage.addEventListener('pointerdown', function () { lap.stop(); }, { once: true });
        }, 500);
      }, { threshold: 0.5 });
      io.observe(host);
    });
  };
})();
