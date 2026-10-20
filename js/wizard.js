/* =========================================================
   Multi-step form engine (student + teacher applications).

   <form data-wizard data-key="draft-key">
     <section data-step data-title="…" [data-when="field:val1,val2"]>…</section>
     …
     <div class="wiz-actions"> [data-prev] [data-next] [data-submit] </div>
   </form>

   - steps slide in the reading direction (RTL: forward comes from the left)
   - the box animates its height between steps
   - each step is validated before moving on (M.Forms.validate)
   - steps with data-when are skipped when they don't apply
   - answers are kept as a draft in this browser and offered back
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  function reduce() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap; }

  function create(form, cfg) {
    cfg = cfg || {};
    var steps = Array.prototype.slice.call(form.querySelectorAll('section[data-step]'));
    var viewport = form.querySelector('.wiz-viewport');
    var prevBtn = form.querySelector('[data-prev]'), nextBtn = form.querySelector('[data-next]'), submitBtn = form.querySelector('[data-submit]');
    var rail = document.querySelector('[data-wiz-rail]');
    var bar = document.querySelector('[data-wiz-bar]'), count = document.querySelector('[data-wiz-count]'), title = document.querySelector('[data-wiz-title]');
    var key = 'manasa:draft:' + (form.dataset.key || 'form');
    var index = 0, busy = false;

    /* ---------- data ---------- */
    function data() {
      var fd = new FormData(form), out = {};
      fd.forEach(function (v, k) {
        if (v instanceof File) { if (v.name) out[k] = v.name; return; }
        if (k in out) { out[k] = [].concat(out[k], v); } else out[k] = v;
      });
      /* checkbox groups always come back as arrays */
      form.querySelectorAll('input[type="checkbox"][name]').forEach(function (c) {
        if (c.dataset.single) return;
        var n = c.name;
        if (!(n in out)) out[n] = [];
        else if (!Array.isArray(out[n])) out[n] = [out[n]];
      });
      return out;
    }
    function val(name) {
      var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]:not([type="radio"]):not([type="checkbox"])');
      return el ? el.value : '';
    }

    function applies(step) {
      var w = step.dataset.when;
      if (!w) return true;
      var parts = w.split(':');
      return parts[1].split(',').indexOf(val(parts[0])) !== -1;
    }
    function active() { return steps.filter(applies); }

    /* ---------- progress, rail, buttons ---------- */
    function paint() {
      var list = active(), pos = list.indexOf(steps[index]);
      if (bar) bar.style.width = ((pos + 1) / list.length * 100) + '%';
      if (count) count.textContent = 'الخطوة ' + M.Forms.ar(pos + 1) + ' من ' + M.Forms.ar(list.length);
      if (title) title.textContent = steps[index].dataset.title;
      if (rail) {
        rail.querySelectorAll('li').forEach(function (li, i) {
          var s = steps[i], p = list.indexOf(s);
          li.classList.toggle('is-skipped', p === -1);
          li.classList.toggle('is-current', i === index);
          li.classList.toggle('is-done', p !== -1 && p < pos);
          var b = li.querySelector('.num b'); if (b && p !== -1) b.textContent = M.Forms.ar(p + 1);
        });
      }
      var last = pos === list.length - 1;
      prevBtn.hidden = pos === 0;
      nextBtn.hidden = last;
      submitBtn.hidden = !last;
    }

    function buildRail() {
      if (!rail) return;
      rail.innerHTML = steps.map(function (s) {
        return '<li><span class="num"><b></b><svg><use href="#i-check"/></svg></span><span>' + s.dataset.title + '</span></li>';
      }).join('');
    }

    /* ---------- moving between steps ---------- */
    function go(to, dir) {
      if (busy || to === index) return;
      var from = steps[index], next = steps[to];
      if (cfg.onEnter) cfg.onEnter(next, data(), api);
      M.Forms.enhance(next);
      index = to;
      paint();
      save();
      scrollTop();
      if (reduce()) {
        from.classList.remove('is-active'); next.classList.add('is-active');
        return;
      }
      busy = true;
      var h0 = viewport.offsetHeight;
      viewport.style.height = h0 + 'px';
      gsap.to(from, {
        x: dir > 0 ? 60 : -60, opacity: 0, duration: .28, ease: 'power2.in',
        onComplete: function () {
          from.classList.remove('is-active');
          gsap.set(from, { clearProps: 'all' });
          next.classList.add('is-active');
          var h1 = next.offsetHeight;
          gsap.to(viewport, { height: h1, duration: .45, ease: 'power3.out', onComplete: function () { viewport.style.height = ''; } });
          gsap.fromTo(next, { x: dir > 0 ? -60 : 60, opacity: 0 }, { x: 0, opacity: 1, duration: .5, ease: 'power3.out', clearProps: 'transform,opacity' });
          gsap.fromTo(next.querySelectorAll('.wiz-in'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out', stagger: .05, delay: .08, clearProps: 'transform,opacity',
            onComplete: function () { busy = false; } });
          if (!next.querySelector('.wiz-in')) busy = false;
          var focusEl = next.querySelector('[autofocus], input:not([type="radio"]):not([type="checkbox"]):not([type="range"])');
          if (focusEl && window.matchMedia('(pointer: fine)').matches) setTimeout(function () { focusEl.focus({ preventScroll: true }); }, 350);
        }
      });
    }
    function scrollTop() {
      var card = form.closest('.auth-card') || form;
      var y = card.getBoundingClientRect().top + window.scrollY - 20;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: reduce() ? 'auto' : 'smooth' });
    }

    function next() {
      if (!M.Forms.validate(steps[index])) return;
      if (cfg.onLeave && cfg.onLeave(steps[index], data(), api) === false) return;
      var list = active(), pos = list.indexOf(steps[index]);
      if (pos < list.length - 1) { go(steps.indexOf(list[pos + 1]), 1); M.haptic && M.haptic(); }
    }
    function prev() {
      var list = active(), pos = list.indexOf(steps[index]);
      if (pos > 0) { go(steps.indexOf(list[pos - 1]), -1); M.haptic && M.haptic(); }
    }
    function goTo(stepEl) { var i = steps.indexOf(stepEl); if (i !== -1) go(i, i > index ? 1 : -1); }

    /* ---------- draft ---------- */
    var saveT;
    function save() {
      clearTimeout(saveT);
      saveT = setTimeout(function () {
        try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), step: index, data: data(), extra: cfg.saveExtra ? cfg.saveExtra() : null })); } catch (e) {}
      }, 250);
    }
    function clearDraft() { try { localStorage.removeItem(key); } catch (e) {} }
    function restore(d) {
      if (cfg.restoreExtra && d.extra) cfg.restoreExtra(d.extra);
      Object.keys(d.data || {}).forEach(function (n) {
        var vals = [].concat(d.data[n]);
        form.querySelectorAll('[name="' + n + '"]').forEach(function (el) {
          if (el.type === 'file') return;
          if (el.type === 'radio' || el.type === 'checkbox') el.checked = vals.indexOf(el.value) !== -1;
          else el.value = vals[0];
        });
      });
      form.querySelectorAll('.pills, .range, .stepper').forEach(function (x) { x._sync && x._sync(); });
    }

    /* ---------- submit ---------- */
    function submit() {
      if (!M.Forms.validate(steps[index])) return;
      submitBtn.classList.add('is-loading'); submitBtn.disabled = true;
      Promise.resolve(cfg.submit ? cfg.submit(data()) : null).then(function (res) {
        clearDraft();
        setTimeout(function () { done(res); }, 900);
      });
    }
    function done(res) {
      var card = form.closest('.auth-card');
      var box = card.querySelector('[data-done]');
      if (cfg.onDone) cfg.onDone(box, res, data());
      var parts = [card.querySelector('.wiz-progress'), card.querySelector('.draft-note'), form].filter(Boolean);
      if (rail) rail.querySelectorAll('li').forEach(function (li) { if (!li.classList.contains('is-skipped')) { li.classList.remove('is-current'); li.classList.add('is-done'); } });
      var show = function () {
        parts.forEach(function (p) { p.hidden = true; });
        box.classList.add('is-shown');
        M.celebrate && M.celebrate(box);
        scrollTop();
      };
      if (reduce()) return show();
      gsap.to(parts, { opacity: 0, y: -16, duration: .3, onComplete: show });
    }

    /* ---------- wire ---------- */
    buildRail();
    steps.forEach(function (s, i) { s.classList.toggle('is-active', i === 0); });
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    submitBtn.addEventListener('click', submit);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); nextBtn.hidden ? submit() : next(); }
    });
    form.addEventListener('input', save);
    form.addEventListener('change', function () { save(); paint(); });

    var api = { data: data, val: val, go: goTo, steps: steps, form: form, save: save };

    /* offer the saved draft back */
    var draft = null;
    try { draft = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    var note = form.closest('.auth-card').querySelector('.draft-note');
    if (draft && draft.data && Object.keys(draft.data).length && note) {
      restore(draft);
      note.hidden = false;
      note.querySelector('button').addEventListener('click', function () {
        clearDraft();
        window.location.reload();
      });
      var target = Math.min(draft.step || 0, steps.length - 1);
      if (cfg.onEnter) cfg.onEnter(steps[target], data(), api);
      if (target && applies(steps[target])) { steps[0].classList.remove('is-active'); steps[target].classList.add('is-active'); index = target; }
    } else if (cfg.onEnter) cfg.onEnter(steps[0], data(), api);
    M.Forms.enhance(form);
    paint();
    return api;
  }

  /* little celebration: the octagram draws, the tick follows, symbols burst */
  M.celebrate = function (box) {
    if (reduce()) return;
    var oct = box.querySelector('.oct'), tick = box.querySelector('.tick');
    [oct, tick].forEach(function (p) {
      if (!p) return;
      var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    });
    var tl = gsap.timeline();
    tl.fromTo(box.querySelector('.done-mark'), { scale: .4, rotate: -40, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .8, ease: 'back.out(1.8)' })
      .to(oct, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, 0.1)
      .to(tick, { strokeDashoffset: 0, duration: .45, ease: 'power2.out' }, 0.75)
      .from(box.querySelectorAll('h2, p, .done-ids, .done-actions'), { y: 20, opacity: 0, duration: .6, ease: 'power3.out', stagger: .08 }, 0.6);
    /* a burst of little stars */
    var mark = box.querySelector('.done-mark');
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('span');
      s.className = 'burst';
      s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>';
      mark.appendChild(s);
      var a = (i / 14) * Math.PI * 2, r = 90 + Math.random() * 60;
      gsap.fromTo(s, { x: 0, y: 0, scale: 0, opacity: 1 }, { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: .6 + Math.random() * .8, rotate: Math.random() * 180, opacity: 0, duration: 1.3 + Math.random() * .5, ease: 'power2.out', delay: .7, onComplete: function () { this.targets()[0].remove(); } });
    }
    M.haptic && M.haptic([10, 60, 20]);
  };

  M.Wizard = { create: create };
})(window.Manasa);
