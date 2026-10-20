/* =========================================================
   Profiles.
   Teacher: who they are, qualifications, month hours + amount,
            weekly availability, account details.
   Student: (guardian switches between children) progress in the
            30 juz, next halaqa + postponement request, batch,
            attendance and the teacher's notes.
   ========================================================= */
window.Manasa = window.Manasa || {};
window.Manasa.Pages = window.Manasa.Pages || {};

(function (M) {
  'use strict';

  var DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  var SLOTS = [['m', 'صباحًا'], ['n', 'ظهرًا'], ['a', 'عصرًا'], ['e', 'مساءً'], ['l', 'ليلًا']];

  /* ---------------- teacher ---------------- */
  M.Pages.teacherProfile = function () {
    var D = M.Data, F = D.fmt, T = D.TEACHER;
    M.T.shell('teacher-profile.html');
    var root = document.querySelector('[data-root]');
    var month = D.monthStats();
    var students = D.COUNCILS.reduce(function (n, c) { return n + c.students.length; }, 0);
    var months = [['أغسطس', 41], ['سبتمبر', 46.5], ['أكتوبر', month.hours]];
    var maxH = Math.max.apply(null, months.map(function (m) { return m[1]; }));

    var avail = '<div class="avail avail-view"><table><thead><tr><th></th>' + SLOTS.map(function (s) { return '<th scope="col">' + s[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      DAYS.map(function (d, i) {
        return '<tr><th scope="row">' + d + '</th>' + SLOTS.map(function (s) {
          var on = T.avail.indexOf(i + s[0]) !== -1;
          return '<td><label><input type="checkbox" disabled' + (on ? ' checked' : '') + ' aria-label="' + d + ' ' + s[1] + (on ? ' متاح' : '') + '"><span></span></label></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';

    root.innerHTML =
      '<section class="p-hero" data-in>' +
        '<span class="av av--xl" data-c="1">' + T.name.charAt(0) + '</span>' +
        '<div class="who"><small style="color:var(--c-on-deep-muted)">معلّم ' + (T.gender === 'f' ? '' : '') + '· ' + T.joined + '</small><h1>' + T.title + ' ' + T.name + '</h1>' +
          '<div class="meta"><span class="badge">حافظ ' + F.ar(T.memorized) + ' جزءًا</span><span class="badge">إجازة: ' + T.ijaza.join(' و') + '</span>' +
          '<span class="badge">' + F.ar(T.years) + ' سنوات خبرة</span><span class="badge">يدرّس ' + T.teaches.join(' و') + '</span></div></div>' +
      '</section>' +
      '<section class="stat-grid">' +
        '<div class="stat" data-in><span class="ic"><svg><use href="#i-people"/></svg></span><small>الطلاب</small><b data-count="' + students + '">٠</b><span class="foot">في ' + F.ar(D.COUNCILS.length) + ' مجالس</span></div>' +
        '<div class="stat" data-in><span class="ic"><svg><use href="#i-clock"/></svg></span><small>ساعات هذا الشهر</small><b data-count="' + month.hours.toFixed(1) + '" data-dec="1">٠<em>ساعة</em></b><span class="foot">بالساعة المجدولة</span></div>' +
        '<div class="stat stat--deep" data-in><span class="ic"><svg><use href="#i-wallet"/></svg></span><small>المستحق هذا الشهر</small><b data-count="' + Math.round(month.hours * T.rate) + '" data-money="1">٠<em>' + T.currency + '</em></b><span class="foot">تقديري · ' + F.ar(T.rate) + ' ' + T.currency + ' للساعة</span></div>' +
        '<div class="stat" data-in><span class="ic"><svg><use href="#i-award"/></svg></span><small>المشرف</small><b style="font-size:1.25rem">' + T.supervisor + '</b><span class="foot">يراجع تقارير الحلقات</span></div>' +
      '</section>' +
      '<div class="two-col">' +
        '<div class="col">' +
          '<section class="panel" data-in><div class="section-label"><h2>نبذة</h2></div><p style="margin-top:10px;line-height:1.9">' + M.esc(T.bio) + '</p></section>' +
          '<section class="panel" data-in><div class="section-label"><h2>المواعيد المتاحة</h2><small>' + F.ar(T.avail.length) + ' فترات أسبوعيًا</small></div><div style="margin-top:12px">' + avail + '</div>' +
            '<p class="form-hint" style="margin-top:8px">لتغيير مواعيدك تواصل مع المشرف، حتى لا تتعارض مع مجالسك الحالية.</p></section>' +
        '</div>' +
        '<div class="col">' +
          '<section class="panel" data-in><div class="section-label"><h2>الساعات</h2><small>آخر ثلاثة أشهر</small></div>' +
            '<div style="display:flex;flex-direction:column;gap:14px;margin-top:14px">' + months.map(function (m) {
              return '<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;font-size:14px"><span>' + m[0] + '</span><b>' + F.num(m[1], 1) + ' ساعة · ' + F.money(m[1] * T.rate) + ' ' + T.currency + '</b></div>' +
                '<div class="bar"><i data-grow style="width:' + (m[1] / maxH * 100) + '%"></i></div></div>';
            }).join('') + '</div><p class="form-hint" style="margin-top:12px">المبالغ تقديرية، والدفع يتم مع الإدارة خارج المنصة.</p></section>' +
          '<section class="panel" data-in><div class="section-label"><h2>بيانات الحساب</h2></div>' +
            '<dl class="kv" style="margin-top:14px"><dt>رقم المعلّم</dt><dd>' + F.ar(T.id) + '</dd><dt>الهاتف</dt><dd dir="ltr" style="text-align:end">' + T.phone + '</dd><dt>الإيميل</dt><dd dir="ltr" style="text-align:end">' + T.email + '</dd><dt>الدولة</dt><dd>' + T.country + '</dd></dl>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button type="button" class="btn btn--soft" data-edit><svg><use href="#i-edit"/></svg>تعديل البيانات</button>' +
            '<button type="button" class="btn btn--ghost" data-logout><svg><use href="#i-logout"/></svg>تسجيل الخروج</button></div></section>' +
        '</div>' +
      '</div>';

    root.querySelector('[data-edit]').addEventListener('click', function () { M.toast('تعديل البيانات يكون عن طريق الإدارة الآن.', 'i-info'); });
    if (!M.reduce()) gsap.from(root.querySelectorAll('[data-grow]'), { scaleX: 0, transformOrigin: 'right center', duration: 1.1, ease: 'power3.out', stagger: .12, delay: .4 });
  };

  /* ---------------- student ---------------- */
  M.Pages.studentProfile = function () {
    var D = M.Data, F = D.fmt;
    var u = M.user('student');
    var id = new URLSearchParams(location.search).get('id') || u.id;
    var s = D.STUDENTS[id] || D.STUDENTS['10234'];
    var c = D.councilOf(s.id), T = D.TEACHER;
    var left = c.batch.size - c.batch.used;
    document.title = s.name + ' — ' + document.title.split(' — ').pop();

    M.App.shell({
      role: 'student', name: s.name, initial: s.short.charAt(0), color: 2, sub: 'طالب · رقم ' + F.ar(s.id),
      current: 'student.html?id=' + s.id,
      nav: [['student.html?id=' + s.id, 'i-user', 'صفحتي'], ['student.html?id=' + s.id + '#next', 'i-calendar', 'الحلقة القادمة'], ['student.html?id=' + s.id + '#notes', 'i-quote', 'ملاحظات المعلّم'], ['index.html', 'i-home', 'الموقع']],
      tabs: [['student.html?id=' + s.id, 'i-user', 'صفحتي'], ['#next', 'i-calendar', 'القادمة'], ['#notes', 'i-quote', 'الملاحظات'], ['index.html', 'i-home', 'الموقع']]
    });
    var root = document.querySelector('[data-root]');

    /* notes from this student's halaqas */
    var notes = [];
    c.history.forEach(function (h) {
      var a = h.att.filter(function (x) { return x.sid === s.id; })[0];
      if (h.status === 'teacher_absent') notes.push({ at: h.at, kind: 'bad', tag: 'غاب المعلّم · تُعوَّض', text: 'لم تُحسب من الدفعة، وستُحدَّد حلقة بديلة.' });
      else if (h.status === 'postponed') notes.push({ at: h.at, kind: 'warn', tag: 'مؤجّلة', text: 'أُجّلت بعذر وحُدّد لها موعد بديل.' });
      else if (a && a.a === 'present') notes.push({ at: h.at, kind: 'ok', tag: 'حاضر', text: a.note });
      else if (a && a.a === 'excused') notes.push({ at: h.at, kind: 'warn', tag: 'غياب بعذر', text: 'لا يُخصم من الدفعة.' });
      else if (a && a.a === 'absent') notes.push({ at: h.at, kind: 'bad', tag: 'غائب', text: 'تُحسب من الدفعة.' });
    });

    var fam = (s.family || []).length > 1 ? '<nav class="family-switch" aria-label="أفراد الأسرة" data-in>' + s.family.map(function (fid, i) {
      var f = D.STUDENTS[fid];
      return '<a href="student.html?id=' + fid + '"' + (fid === s.id ? ' aria-current="true"' : '') + '><span class="av" data-c="' + (i + 2) + '">' + f.short.charAt(0) + '</span>' + f.short + '</a>';
    }).join('') + '</nav>' : '';

    /* 30 juz, filled up to what's memorized (Juz Amma = 30 is where children start) */
    var juz = '';
    var full = Math.floor(s.mem), part = s.mem - full;
    for (var j = 30; j >= 1; j--) {
      var k = 31 - j;                 /* order of memorizing: 30, 29, 28 … */
      var cls = k <= full ? ' is-done' : (k === full + 1 && part > 0 ? ' is-part' : '');
      juz += '<span class="juz' + cls + '" style="--p:' + (k === full + 1 ? part : 0) + '" title="الجزء ' + F.ar(j) + '">' + F.ar(j) + '</span>';
    }

    var reqSent = false;
    root.innerHTML = fam +
      '<section class="p-hero" data-in>' +
        '<span class="av av--xl" data-c="2">' + s.short.charAt(0) + '</span>' +
        '<div class="who"><small style="color:var(--c-on-deep-muted)">رقم الطالب ' + F.ar(s.id) + '</small><h1>' + s.name + '</h1>' +
          '<div class="meta"><span class="badge">' + c.name + '</span><span class="badge">' + T.title + ' ' + T.name + '</span><span class="badge">' + F.ar(s.age) + ' سنة</span>' +
          '<span class="badge">يحفظ الآن: ' + s.surah + '</span></div></div>' +
        M.ring(s.mem / 30, F.num(s.mem, s.mem % 1 ? 1 : 0), 'من ٣٠ جزءًا', 'ring--lg') +
      '</section>' +

      '<section class="panel next-card" id="next" data-in style="scroll-margin-top:90px">' +
        '<div class="big"><small>الحلقة القادمة · ' + (c.kind === 'group' ? 'مجلس جماعي' : 'حلقة فردية') + '</small><b>' + F.when(c.next) + '</b><small>' + F.ar(c.mins) + ' دقيقة مع ' + T.title + ' ' + T.name + '</small></div>' +
        '<div class="countdown" aria-label="الوقت المتبقي" data-countdown></div>' +
        '<button type="button" class="btn btn--soft" data-postpone><svg><use href="#i-calendar"/></svg>طلب تأجيل</button>' +
      '</section>' +

      '<div class="two-col">' +
        '<div class="col">' +
          '<section class="panel" data-in><div class="section-label"><h2>رحلة الحفظ</h2><small>' + F.num(s.mem, s.mem % 1 ? 1 : 0) + ' من ٣٠ جزءًا</small></div>' +
            '<div class="juz-grid" data-juz>' + juz + '</div><p class="form-hint">يبدأ الحفظ غالبًا من جزء عمّ (٣٠) صعودًا.</p></section>' +
          '<section class="panel" id="notes" data-in style="scroll-margin-top:90px"><div class="section-label"><h2>ملاحظات المعلّم</h2><small>بعد كل حلقة</small></div>' +
            '<div class="notes" style="margin-top:14px" data-in-scroll>' + notes.slice(0, 6).map(function (n) {
              return '<div class="note"><small>' + F.date(n.at) + ' · <span class="badge badge--' + n.kind + '" style="height:22px">' + n.tag + '</span></small>' + M.esc(n.text) + '</div>';
            }).join('') + '</div></section>' +
        '</div>' +
        '<div class="col">' +
          '<section class="panel" data-in><div class="section-label"><h2>الدفعة الحالية</h2><small>' + F.ar(c.batch.used) + ' من ' + F.ar(c.batch.size) + '</small></div>' +
            '<div style="display:flex;align-items:center;gap:16px;margin-top:12px">' + M.ring(c.batch.used / c.batch.size, F.ar(left), 'متبقية', left <= 2 ? 'ring--warn' : '') +
            '<p style="font-size:14px;line-height:1.8">' + (left <= 2 ? 'تقترب الدفعة من نهايتها، وستتواصل معك الإدارة لتجديدها.' : 'تُحسب الحلقة من الدفعة عند الحضور أو الغياب بلا عذر.') + '</p></div></section>' +
          '<section class="panel" data-in><div class="section-label"><h2>الحضور</h2><small>هذه الدفعة</small></div>' +
            '<div style="display:flex;align-items:center;gap:16px;margin-top:12px">' + M.ring(s.attendance / 100, F.ar(s.attendance) + '٪', 'حضور', s.attendance < 85 ? 'ring--warn' : '') +
            '<p style="font-size:14px;line-height:1.8">اطلب التأجيل قبل موعد الحلقة مع ذكر العذر. ' + (c.kind === 'group' ? 'في المجلس الجماعي يُسجَّل غيابًا بعذر ولا يُخصم.' : 'في الحلقة الفردية يحدّد المعلّم موعدًا بديلًا.') + '</p></div></section>' +
          (s.guardian ? '<section class="panel" data-in><div class="section-label"><h2>وليّ الأمر</h2></div><dl class="kv" style="margin-top:12px"><dt>الاسم</dt><dd>' + s.guardian + '</dd>' + (s.phone ? '<dt>الهاتف</dt><dd dir="ltr" style="text-align:end">' + s.phone + '</dd>' : '') + '</dl></section>' : '') +
        '</div>' +
      '</div>';

    /* countdown to the next halaqa */
    var cd = root.querySelector('[data-countdown]');
    function tick() {
      var ms = Math.max(0, c.next - Date.now()), d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      cd.innerHTML = [[d, 'يوم'], [h, 'ساعة'], [m, 'دقيقة']].reverse().map(function (x) { return '<div><b>' + F.ar(String(x[0]).padStart(2, '0')) + '</b><small>' + x[1] + '</small></div>'; }).join('');
    }
    tick(); setInterval(tick, 30000);

    /* juz grid fills in */
    if (!M.reduce()) gsap.from(root.querySelectorAll('.juz.is-done, .juz.is-part'), { scale: .4, opacity: 0, duration: .5, ease: 'back.out(2.5)', stagger: .07, delay: .5 });

    /* postponement request */
    root.querySelector('[data-postpone]').addEventListener('click', function () {
      var btn = this;
      if (reqSent) { M.toast('طلبك مُرسل، بانتظار ردّ المعلّم.', 'i-clock'); return; }
      var sh = M.sheet({
        title: 'طلب تأجيل', sub: c.name + ' · ' + F.when(c.next),
        body: '<div class="form-stack"><div class="field"><label for="pp-reason">العذر</label><div class="control control--area"><textarea id="pp-reason" rows="3" required minlength="5" maxlength="300" data-msg="اكتب العذر" data-msg-short="وضّح العذر أكثر" placeholder="مثلًا: سفر، مرض، امتحان…"></textarea></div></div>' +
          '<p class="notice"><svg><use href="#i-info"/></svg><span>' + (c.kind === 'group'
            ? 'في المجلس الجماعي: إن قبل المعلّم العذر تُسجَّل الحلقة غيابًا بعذر، ولا تُخصم من الدفعة ولا تُعوَّض.'
            : 'في الحلقة الفردية: إن قبل المعلّم يحدّد موعدًا بديلًا. وإن لم يردّ قبل الموعد يُحال الطلب للمشرف.') + '</span></p></div>',
        foot: '<button type="button" class="btn btn--accent" data-send><span class="lbl">أرسل الطلب</span><svg><use href="#i-send"/></svg><span class="spin" aria-hidden="true"></span></button>'
      });
      sh.querySelector('[data-send]').addEventListener('click', function () {
        if (!M.Forms.validate(sh)) return;
        var b = this; b.classList.add('is-loading'); b.disabled = true;
        setTimeout(function () {
          M.closeSheet(); reqSent = true;
          btn.innerHTML = '<svg><use href="#i-clock"/></svg>بانتظار ردّ المعلّم';
          M.toast('أُرسل طلب التأجيل للمعلّم.');
        }, 700);
      });
    });
    if (location.hash) setTimeout(function () { var el = document.querySelector(location.hash); el && el.scrollIntoView({ behavior: 'smooth' }); }, 500);
  };
})(window.Manasa);
