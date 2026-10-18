/* =========================================================
   كيف نعمل · متابعة الأسرة · الأسئلة الشائعة · tab-bar spy
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  function reduce() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap; }
  function ar(n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }

  /* ---------- كيف نعمل: the line draws, badges light up ---------- */
  function initHow() {
    var wrap = document.querySelector('[data-steps]');
    if (!wrap) return;
    var line = wrap.querySelector('[data-steps-line]');
    var steps = Array.prototype.slice.call(wrap.querySelectorAll('.step'));
    var vertical = window.matchMedia('(max-width: 860px)');
    function set(p) {
      line.style.transform = (vertical.matches ? 'scaleY(' : 'scaleX(') + p + ')';
      steps.forEach(function (s, i) {
        var on = p >= i / (steps.length - 1) - 0.02;
        if (on !== s.classList.contains('is-on')) {
          s.classList.toggle('is-on', on);
          if (on && i > 0) M.haptic && M.haptic(5);
        }
      });
    }
    if (reduce() || !window.ScrollTrigger) { set(1); return; }
    set(0);
    gsap.from(steps, { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', stagger: 0.12, clearProps: 'transform,opacity',
      scrollTrigger: { trigger: wrap, start: 'top 85%', once: true } });
    ScrollTrigger.create({
      trigger: wrap, start: 'top 72%', end: 'bottom 62%', scrub: 0.5,
      onUpdate: function (self) { set(self.progress); }
    });
  }

  /* ---------- متابعة الأسرة: switch between family members ---------- */
  var FAMILY = {
    yusuf:  { last: 'آخر حلقة · الأحد', status: 'حاضر', st: 'present', note: 'حفظ ممتاز للكافرون، ونبدأ الكوثر في الحلقة القادمة.', used: 8, total: 10, next: 'الثلاثاء ٧:٠٠ م' },
    maryam: { last: 'آخر حلقة · الاثنين', status: 'حاضرة', st: 'present', note: 'راجعت سورة النبأ كاملة بإتقان، وتبدأ النازعات في الحلقة القادمة.', used: 3, total: 8, next: 'الأربعاء ٥:٣٠ م' },
    me:     { last: 'آخر حلقة · السبت', status: 'غياب بعذر', st: 'excused', note: 'تأجّلت الحلقة بعذر قُبل قبل موعدها، وحدّد المعلّم موعدًا بديلًا.', used: 5, total: 12, next: 'الأحد ٩:٠٠ م · موعد بديل' }
  };
  function initFamily() {
    var app = document.querySelector('[data-fam-app]');
    if (!app) return;
    var body = app.querySelector('[data-fam-body]');
    var f = function (k) { return body.querySelector('[data-f="' + k + '"]'); };
    var toast = app.querySelector('[data-fam-toast]'), toastT;

    function render(id) {
      var d = FAMILY[id];
      var left = d.total - d.used;
      f('last').textContent = d.last;
      f('status').textContent = d.status;
      f('status').className = 'pill pill--' + d.st;
      f('note').textContent = d.note;
      f('count').textContent = ar(d.used) + ' من ' + ar(d.total);
      f('next').textContent = d.next;
      f('alert').textContent = left <= 2 ? (left === 2 ? 'متبقي حلقتان في هذه الدفعة' : 'متبقية حلقة واحدة في هذه الدفعة') : '';
      var bars = '';
      for (var i = 0; i < d.total; i++) bars += '<i class="' + (i < d.used ? 'is-used' : '') + '"></i>';
      f('batch').innerHTML = bars;
    }
    function show(id, btn) {
      app.querySelectorAll('[data-fam]').forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
      toast.classList.remove('is-shown');
      if (reduce()) { render(id); return; }
      var cards = body.querySelectorAll('.fam-card');
      gsap.to(cards, { opacity: 0, y: -8, duration: 0.18, stagger: 0.03, onComplete: function () {
        render(id);
        gsap.fromTo(cards, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' });
        gsap.from(f('batch').children, { scaleX: 0, transformOrigin: 'right center', duration: 0.35, stagger: 0.03, ease: 'power2.out' });
      } });
    }
    app.querySelectorAll('[data-fam]').forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.fam, b); M.haptic && M.haptic(); });
    });
    app.querySelector('[data-fam-postpone]').addEventListener('click', function () {
      toast.textContent = 'مثال توضيحي: من حسابك تكتب العذر قبل الحلقة، ويحدد المعلّم موعدًا بديلًا عند القبول.';
      toast.classList.add('is-shown');
      clearTimeout(toastT);
      toastT = setTimeout(function () { toast.classList.remove('is-shown'); }, 4200);
    });
    render('yusuf');
  }

  /* ---------- الأسئلة الشائعة: smooth open / close ---------- */
  function initFaq() {
    document.querySelectorAll('[data-faq] details').forEach(function (d) {
      var sum = d.querySelector('summary'), ans = d.querySelector('.qa-a');
      sum.addEventListener('click', function (e) {
        if (reduce() || !ans.animate) return;
        e.preventDefault();
        if (d.open) {
          var h = ans.offsetHeight;
          ans.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' })
            .onfinish = function () { d.open = false; window.ScrollTrigger && ScrollTrigger.refresh(); };
        } else {
          d.open = true;
          var t = ans.offsetHeight;
          ans.animate([{ height: '0px', opacity: 0 }, { height: t + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' })
            .onfinish = function () { window.ScrollTrigger && ScrollTrigger.refresh(); };
        }
        M.haptic && M.haptic();
      });
    });
  }

  /* ---------- tab bar follows the section you're in ---------- */
  function initTabSpy() {
    if (!window.ScrollTrigger) return;
    var map = [['#top', '[data-hero]'], ['#programs', '#programs'], ['#teachers', '#teachers']];
    map.forEach(function (m) {
      var tab = document.querySelector('.tabbar a.tab[href="' + m[0] + '"]');
      var target = document.querySelector(m[1]);
      if (!tab || !target) return;
      ScrollTrigger.create({
        trigger: target, start: 'top 50%', end: 'bottom 50%',
        onToggle: function (self) {
          if (!self.isActive) { if (tab.getAttribute('aria-current')) tab.removeAttribute('aria-current'); return; }
          document.querySelectorAll('.tabbar a.tab').forEach(function (t) { t.removeAttribute('aria-current'); });
          tab.setAttribute('aria-current', 'page');
        }
      });
    });
  }

  function init() { initHow(); initFamily(); initFaq(); initTabSpy(); }

  M.Sections = { init: init };
})(window.Manasa);
