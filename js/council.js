/* =========================================================
   Council details (teacher): schedule + batch, then three tabs:
   students & progress · halaqa history · postponement requests.
   "سجّل الحلقة" opens the attendance + notes sheet.
   ========================================================= */
window.Manasa = window.Manasa || {};
window.Manasa.Pages = window.Manasa.Pages || {};

(function (M) {
  'use strict';

  M.Pages.council = function () {
    var D = M.Data, F = D.fmt;
    M.T.shell('teacher.html#councils');
    var root = document.querySelector('[data-root]');
    var id = new URLSearchParams(location.search).get('id') || D.COUNCILS[0].id;
    var c = D.council(id) || D.COUNCILS[0];
    document.title = c.name + ' — ' + document.title.split(' — ').pop();

    var left = c.batch.size - c.batch.used;
    /* the halaqa to record: the latest scheduled time that has passed and has no report */
    function lastDue() {
      var now = new Date(), best = null;
      for (var off = 0; off > -8; off--) {
        c.sched.forEach(function (s) {
          var d = D.at(off, s[1], s[2]);
          if (d.getDay() !== s[0] || d > now) return;
          if (!best || d > best) best = d;
        });
      }
      var logged = best && c.history.some(function (h) { return Math.abs(h.at - best) < 6e4; });
      return logged ? null : best;
    }

    function studentCard(sid, i) {
      var s = D.STUDENTS[sid];
      var last = null;
      c.history.some(function (h) { var a = h.att.filter(function (x) { return x.sid === sid && x.note; })[0]; if (a) { last = { note: a.note, at: h.at }; return true; } return false; });
      return '<article class="stu">' +
        '<div class="stu-head">' + M.T.avatar(sid, i) + '<div><b>' + s.name + '</b><small>' + F.ar(s.age) + ' سنة' + (s.guardian ? ' · وليّ الأمر ' + s.guardian : '') + ' · رقم ' + F.ar(s.id) + '</small></div>' +
          M.ring(s.attendance / 100, F.ar(s.attendance) + '٪', 'حضور', s.attendance < 85 ? 'ring--warn' : '') + '</div>' +
        '<div class="stu-mem"><div><span>المحفوظ <b>' + F.num(s.mem, s.mem % 1 ? 1 : 0) + ' جزء</b></span><span class="muted">يحفظ الآن: ' + s.surah + '</span></div>' +
          '<div class="bar"><i style="width:' + Math.max(3, s.mem / 30 * 100) + '%"></i></div></div>' +
        (last ? '<p class="stu-note"><svg><use href="#i-quote"/></svg><span><small class="muted">' + F.date(last.at) + '</small><br>' + M.esc(last.note) + '</span></p>' : '') +
      '</article>';
    }

    function historyHTML() {
      return '<div class="panel" style="display:flex;flex-direction:column;gap:14px">' +
        '<div class="section-label"><h2 style="font-size:1.2rem">الدفعة الحالية</h2><small>' + F.ar(c.batch.used) + ' من ' + F.ar(c.batch.size) + ' حلقة</small></div>' +
        '<div class="bar"><i data-bar style="width:' + (c.batch.used / c.batch.size * 100) + '%"></i></div>' +
        (left <= 2 ? '<p class="notice"><svg><use href="#i-alert"/></svg><span>' + (left === 1 ? 'باقية حلقة واحدة' : 'باقيتان حلقتان') + ' في الدفعة، وقد وصل تنبيه للإدارة لتقرّر الدفعة الجديدة مع وليّ الأمر.</span></p>' : '<p class="form-hint">تصل الإدارة تنبيهًا عندما تتبقى حلقتان في الدفعة.</p>') +
      '</div>' +
      '<div class="panel"><div class="hist" data-hist>' + c.history.map(M.T.historyRow).join('') + '</div></div>';
    }

    var reqCount = D.REQUESTS.filter(function (r) { return r.council === c.id; }).length;
    var due = lastDue();
    root.innerHTML =
      '<a class="crumb" href="teacher.html#councils" data-in><svg><use href="#i-arrow"/></svg>مجالسي</a>' +
      '<section class="c-hero" data-in>' +
        '<div><h1>' + c.name + '</h1>' +
          '<div class="badges"><span class="badge">' + (c.kind === 'group' ? 'مجلس جماعي' : 'حلقة فردية') + '</span><span class="badge">' + c.level + '</span><span class="badge">' + F.ar(c.mins) + ' دقيقة</span>' +
          '<span class="badge">' + F.ar(c.students.length) + (c.students.length === 1 ? ' طالب' : ' طلاب') + '</span></div>' +
          '<div class="sched">' + c.schedText.map(function (t) { return '<span><svg><use href="#i-clock"/></svg>' + t + '</span>'; }).join('') + '</div></div>' +
        M.ring(c.batch.used / c.batch.size, F.ar(left), 'متبقية', left <= 2 ? 'ring--warn ring--lg' : 'ring--lg') +
        '<div class="c-hero-actions">' +
          (due ? '<button type="button" class="btn btn--accent btn--lg" data-record><svg><use href="#i-edit"/></svg>سجّل حلقة ' + F.when(due) + '</button>'
               : '<button type="button" class="btn btn--accent btn--lg" data-record-next><svg><use href="#i-edit"/></svg>سجّل حلقة</button>') +
          '<span class="btn btn--ghost-deep btn--lg" style="pointer-events:none"><svg><use href="#i-calendar"/></svg>القادمة ' + F.when(c.next) + '</span>' +
        '</div>' +
      '</section>' +
      '<div data-in><div class="tabs" role="tablist" style="--n:3" data-tabs-ui><span class="tabs-pill" aria-hidden="true"></span>' +
        '<button type="button" role="tab" aria-selected="true" data-tab="0">الطلاب</button>' +
        '<button type="button" role="tab" aria-selected="false" data-tab="1"><span class="t-long">سجل الحلقات</span><span class="t-short">السجل</span></button>' +
        '<button type="button" role="tab" aria-selected="false" data-tab="2"><span class="t-long">طلبات التأجيل</span><span class="t-short">التأجيل</span>' + (reqCount ? '<span class="count">' + F.ar(reqCount) + '</span>' : '') + '</button>' +
      '</div></div>' +
      '<section class="tab-panel" data-panel="0"><div class="stu-list">' + c.students.map(studentCard).join('') + '</div></section>' +
      '<section class="tab-panel" data-panel="1" hidden style="display:flex;flex-direction:column;gap:16px">' + historyHTML() + '</section>' +
      '<section class="tab-panel panel" data-panel="2" hidden><div data-requests>' + M.T.requestsHTML(c.id) + '</div></section>';

    /* tabs */
    var tabsUi = root.querySelector('[data-tabs-ui]'), cur = 0;
    function show(i) {
      if (i === cur) return;
      tabsUi.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(+b.dataset.tab === i)); });
      tabsUi.style.setProperty('--i', i);
      var from = root.querySelector('[data-panel="' + cur + '"]'), to = root.querySelector('[data-panel="' + i + '"]');
      var dir = i > cur ? -1 : 1; cur = i;
      from.hidden = true; to.hidden = false;
      M.fillRings(to);
      if (!M.reduce()) gsap.fromTo(to.children.length > 1 ? to.children : (to.firstElementChild.children.length ? to.firstElementChild.children : to), { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .5, ease: 'power3.out', stagger: .04, clearProps: 'transform,opacity' });
      M.haptic();
    }
    tabsUi.addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) show(+b.dataset.tab); });
    /* swipe between tabs on phones */
    var x0 = null, y0 = null;
    root.addEventListener('touchstart', function (e) { if (!e.target.closest('.tab-panel')) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(Math.max(0, Math.min(2, cur + (dx > 0 ? 1 : -1))));   /* RTL: swipe right → next */
    });
    if (location.hash === '#requests') show(2);

    M.T.bindRequests(root.querySelector('[data-requests]'), function () {
      var n = D.REQUESTS.filter(function (r) { return r.council === c.id; }).length;
      var badge = tabsUi.querySelector('.count'); if (badge) { n ? (badge.textContent = F.ar(n)) : badge.remove(); }
    });

    function afterSave() {
      root.querySelector('[data-hist]').innerHTML = c.history.map(M.T.historyRow).join('');
      var b = root.querySelector('[data-record]');
      if (b) { b.outerHTML = '<span class="btn btn--accent btn--lg" style="pointer-events:none"><svg><use href="#i-check"/></svg>سُجّلت الحلقة</span>'; }
      show(1);
      if (!M.reduce()) gsap.from(root.querySelector('.hist-row'), { backgroundColor: 'rgba(201,162,74,.25)', duration: 1.6, ease: 'power2.out' });
    }
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-record]')) M.T.recordSheet(c, due, afterSave);
      if (e.target.closest('[data-record-next]')) M.T.recordSheet(c, new Date(), afterSave);
    });
  };
})(window.Manasa);
