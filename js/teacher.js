/* =========================================================
   Teacher dashboard: greeting, this month's hours and amount,
   today's halaqas, postponement requests, and all councils.
   ========================================================= */
window.Manasa = window.Manasa || {};
window.Manasa.Pages = window.Manasa.Pages || {};

(function (M) {
  'use strict';

  M.Pages.teacherHome = function () {
    var D = M.Data, F = D.fmt, T = D.TEACHER;
    M.T.shell('teacher.html');
    var root = document.querySelector('[data-root]');
    var month = D.monthStats();
    var amount = month.hours * T.rate;
    var now = new Date();

    /* today's halaqas from every council's weekly schedule */
    var todays = [];
    D.COUNCILS.forEach(function (c) {
      c.sched.forEach(function (s) {
        if (s[0] !== D.today.getDay()) return;
        var at = D.at(0, s[1], s[2]);
        var logged = c.history.some(function (h) { return Math.abs(h.at - at) < 6e4; });
        todays.push({ c: c, at: at, logged: logged });
      });
    });
    todays.sort(function (a, b) { return a.at - b.at; });
    var nextIdx = todays.findIndex(function (t) { return t.at > now; });

    var pending = 0;
    D.COUNCILS.forEach(function (c) { c.history.forEach(function (h) { if (h.report === 'pending') pending++; }); });

    function slot(t, i) {
      var past = t.at < now, mins = Math.round((t.at - now) / 6e4);
      var right = past
        ? (t.logged ? '<span class="badge badge--ok"><svg><use href="#i-check"/></svg>سُجّلت</span>'
                    : '<button type="button" class="btn btn--accent" data-record="' + i + '" style="min-height:42px;border-radius:14px;padding:0 16px;font-size:14px"><svg><use href="#i-edit"/></svg>سجّل الحلقة</button>')
        : '<span class="badge badge--accent"><svg><use href="#i-clock"/></svg>' + (mins < 60 ? 'بعد ' + F.ar(mins) + ' دقيقة' : 'بعد ' + F.ar(Math.round(mins / 60)) + ' ساعة') + '</span>';
      return '<div class="slot' + (i === nextIdx ? ' is-next' : '') + (past && t.logged ? ' is-past' : '') + '">' +
        '<time>' + F.time(t.at) + '<small>' + F.ar(t.c.mins) + ' دقيقة</small></time>' +
        '<a class="who" href="council.html?id=' + t.c.id + '"><b>' + t.c.name + '</b><small>' + (t.c.kind === 'group' ? F.ar(t.c.students.length) + ' طلاب · مجلس جماعي' : D.STUDENTS[t.c.students[0]].name + ' · فردية') + '</small></a>' +
        right + '</div>';
    }

    function councilCard(c) {
      var left = c.batch.size - c.batch.used, warn = left <= 2;
      var reqs = D.REQUESTS.filter(function (r) { return r.council === c.id; }).length;
      var pend = c.history.filter(function (h) { return h.report === 'pending'; }).length;
      return '<article class="council-card" data-c="' + c.color + '">' +
        '<a class="stretch" href="council.html?id=' + c.id + '" aria-label="' + c.name + '"></a>' +
        '<div class="cc-head"><div><h3>' + c.name + '</h3><div class="badges">' +
          '<span class="badge badge--deep">' + (c.kind === 'group' ? 'مجلس جماعي' : 'حلقة فردية') + '</span><span class="badge">' + c.level + '</span></div></div>' +
          M.ring(c.batch.used / c.batch.size, F.ar(left), 'متبقية', warn ? 'ring--warn' : '') + '</div>' +
        '<div class="cc-next"><svg><use href="#i-calendar"/></svg><span>القادمة: <b>' + F.when(c.next) + '</b></span></div>' +
        '<div class="cc-foot"><div class="av-stack">' + c.students.slice(0, 5).map(function (sid, i) { return M.T.avatar(sid, i); }).join('') + '</div>' +
          '<span>' + F.ar(c.mins) + ' دقيقة · ' + c.schedText.length + ' مرات أسبوعيًا</span></div>' +
        ((warn || reqs || pend) ? '<div class="alerts">' +
          (warn ? '<span class="badge badge--warn"><svg><use href="#i-alert"/></svg>' + (left === 1 ? 'حلقة واحدة باقية في الدفعة' : 'حلقتان باقيتان في الدفعة') + '</span>' : '') +
          (reqs ? '<span class="badge badge--accent"><svg><use href="#i-calendar"/></svg>' + F.ar(reqs) + ' طلب تأجيل</span>' : '') +
          (pend ? '<span class="badge"><svg><use href="#i-clock"/></svg>' + F.ar(pend) + ' بانتظار الاعتماد</span>' : '') + '</div>' : '') +
      '</article>';
    }

    var hour = now.getHours();
    root.innerHTML =
      '<header class="page-head" data-in><div><p>' + F.date(D.today) + ' · المشرف: ' + T.supervisor + '</p>' +
        '<h1>' + (hour < 12 ? 'صباح الخير' : 'مساء الخير') + '، ' + T.title + ' ' + T.name.split(' ')[0] + '</h1></div></header>' +

      '<section class="stat-grid" aria-label="هذا الشهر">' +
        '<div class="stat" data-in><span class="ic"><svg><use href="#i-clock"/></svg></span><small>ساعات هذا الشهر</small><b data-count="' + month.hours.toFixed(1) + '" data-dec="1">٠<em>ساعة</em></b><span class="foot">' + F.ar(month.halaqas) + ' حلقة · بالساعة المجدولة</span></div>' +
        '<div class="stat stat--deep" data-in><span class="ic"><svg><use href="#i-wallet"/></svg></span><small>المستحق هذا الشهر</small><b data-count="' + Math.round(amount) + '" data-money="1">٠<em>' + T.currency + '</em></b><span class="foot">تقديري · ' + F.ar(T.rate) + ' ' + T.currency + ' للساعة</span></div>' +
        '<div class="stat" data-in><span class="ic"><svg><use href="#i-calendar"/></svg></span><small>حلقات اليوم</small><b data-count="' + todays.length + '">٠</b><span class="foot">' + (nextIdx > -1 ? 'القادمة ' + F.time(todays[nextIdx].at) : 'انتهت حلقات اليوم') + '</span></div>' +
        '<div class="stat" data-in><span class="ic"><svg><use href="#i-file"/></svg></span><small>تقارير بانتظار الاعتماد</small><b data-count="' + pending + '">٠</b><span class="foot">تُعتمد تلقائيًا بعد ٤٨ ساعة</span></div>' +
      '</section>' +

      '<div class="two-col">' +
        '<section class="panel" data-in aria-labelledby="today-h"><div class="section-label"><h2 id="today-h">حلقات اليوم</h2><small>' + F.date(D.today) + '</small></div>' +
          '<div class="today" data-today>' + (todays.length ? todays.map(slot).join('') : '<div class="empty"><svg><use href="#i-check-circle"/></svg>لا حلقات اليوم.</div>') + '</div></section>' +
        '<section class="panel" id="requests" data-in aria-labelledby="req-h"><div class="section-label"><h2 id="req-h">طلبات التأجيل</h2><small>ردّ قبل موعد الحلقة</small></div>' +
          '<div data-requests style="margin-top:14px">' + M.T.requestsHTML() + '</div></section>' +
      '</div>' +

      '<section id="councils" aria-labelledby="cc-h" style="display:flex;flex-direction:column;gap:16px;scroll-margin-top:90px">' +
        '<div class="section-label"><h2 id="cc-h">مجالسي</h2><small>' + F.ar(D.COUNCILS.length) + ' مجالس · ' +
          F.ar(D.COUNCILS.reduce(function (n, c) { return n + c.students.length; }, 0)) + ' طالبًا</small></div>' +
        '<div class="council-grid" data-in-scroll>' + D.COUNCILS.map(councilCard).join('') + '</div>' +
      '</section>';

    M.T.bindRequests(root.querySelector('[data-requests]'), function () {
      root.querySelectorAll('.council-card').forEach(function (card, i) { /* refresh request badges */
        var c = D.COUNCILS[i]; card.outerHTML = councilCard(c);
      });
      M.fillRings(root);
    });
    root.querySelector('[data-today]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-record]'); if (!b) return;
      var t = todays[+b.dataset.record];
      M.T.recordSheet(t.c, t.at, function () {
        t.logged = true;
        var el = b.closest('.slot'); var tmp = document.createElement('div'); tmp.innerHTML = slot(t, +b.dataset.record); el.replaceWith(tmp.firstChild);
      });
    });
    /* tab bar: jump to a section smoothly */
    if (location.hash) setTimeout(function () { var el = document.querySelector(location.hash); el && el.scrollIntoView({ behavior: 'smooth' }); }, 500);
  };
})(window.Manasa);
