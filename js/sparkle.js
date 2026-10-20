/* =========================================================
   Little stars that fly out of a field when it's done right:
   - a choice is picked (cards, chips, pills, availability cells, agree box)
   - a text field is left filled and valid
   Used on the login and both application pages.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z"/></svg>';
  var DOT = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/></svg>';
  var layer;

  function burst(el, count) {
    if (reduce || !window.gsap || !el) return;
    var r = el.getBoundingClientRect();
    if (!r.width) return;
    if (!layer) { layer = document.createElement('div'); layer.className = 'sparkle-layer'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
    count = count || 12;
    /* stars leave from the element's edge nearest the reading start, spread over its width */
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'sparkle' + (i % 3 === 0 ? ' sparkle--alt' : '');
      s.innerHTML = i % 4 === 3 ? DOT : STAR;
      layer.appendChild(s);
      var x = r.left + r.width * (0.15 + Math.random() * 0.7);
      var y = r.top + r.height * (0.3 + Math.random() * 0.4);
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;       /* mostly upwards */
      var dist = 40 + Math.random() * 70;
      var size = 8 + Math.random() * 12;
      gsap.set(s, { x: x - size / 2, y: y - size / 2, width: size, height: size, scale: 0, rotate: Math.random() * 90 });
      gsap.timeline({ onComplete: (function (n) { return function () { n.remove(); }; })(s) })
        .to(s, { scale: 1, duration: .18, ease: 'back.out(3)' })
        .to(s, { x: '+=' + Math.cos(ang) * dist, y: '+=' + Math.sin(ang) * dist, rotate: '+=' + (Math.random() * 220 - 110), duration: .75 + Math.random() * .4, ease: 'power3.out' }, 0)
        .to(s, { scale: 0, opacity: 0, duration: .35, ease: 'power2.in' }, .5 + Math.random() * .3);
    }
  }

  /* the visible box of a choice input */
  function boxOf(input) {
    var lab = input.closest('label');
    return (lab && (lab.querySelector('.choice-body, span'))) || lab || input;
  }

  function valid(el) {
    var v = (el.value || '').trim();
    if (!v) return false;
    if (el.dataset.match) { var o = document.querySelector(el.dataset.match); if (o && o.value !== el.value) return false; }
    if (el.pattern && !new RegExp('^(?:' + el.pattern + ')$').test(M.Forms ? M.Forms.toLatin(v) : v)) return false;
    return el.checkValidity ? el.checkValidity() : true;
  }

  function init(root) {
    root = root || document;
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (!t.matches || !t.matches('input')) return;
      if (t.type === 'radio' || (t.type === 'checkbox' && t.checked)) {
        var small = t.closest('.avail') ? 5 : t.closest('.pills') ? 8 : 12;
        burst(boxOf(t), small);
      }
    });
    /* text fields: when left filled and valid, once per value */
    root.addEventListener('focusout', function (e) {
      var t = e.target;
      if (!t.matches || !t.matches('input:not([type=radio]):not([type=checkbox]):not([type=range]):not([type=hidden]):not([type=file]), textarea, select')) return;
      if (t._sparkled === t.value || !valid(t)) return;
      t._sparkled = t.value;
      burst(t.closest('.control') || t, 10);
    });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.type === 'file' && t.files && t.files[0]) burst(t.closest('.file-drop'), 14);
      if (t.tagName === 'SELECT' && t.value) { t._sparkled = t.value; burst(t.closest('.control') || t, 8); }
    });
  }

  M.sparkle = burst;
  document.addEventListener('DOMContentLoaded', function () { init(document); });
})(window.Manasa);
