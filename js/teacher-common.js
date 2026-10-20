/* =========================================================
   Teacher pieces shared by the dashboard and the council page:
   - teacher shell (sidebar / tabs)
   - postponement requests: accept (individual → pick a new date,
     group → excused absence, not deducted) or reject
   - "record a halaqa" sheet: held / teacher absent, attendance +
     a note for every student (also in group councils)
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var D = M.Data, F = D.fmt;
  function stu(id) { return D.STUDENTS[id]; }
  function avatar(id, i) { var s = stu(id); return '<span class="av" data-c="' + ((i % 6) + 1) + '">' + s.short.charAt(0) + '</span>'; }
  function since(d) {
    var h = Math.round((Date.now() - d) / 36e5);
    return h < 1 ? 'الآن' : h < 24 ? 'منذ ' + F.ar(h) + (h <= 10 ? ' ساعات' : ' ساعة') : 'منذ ' + F.ar(Math.round(h / 24)) + ' يوم';
  }

  function shell(current) {
    var T = D.TEACHER, n = D.REQUESTS.length;
    M.App.shell({
      role: 'teacher', name: T.title + ' ' + T.name, initial: T.name.charAt(0), color: 1, sub: 'معلّم · ' + F.ar(D.COUNCILS.length) + ' مجالس',
      current: current, bell: 'teacher.html#requests',
      nav: [['teacher.html', 'i-grid', 'لوحتي'], ['teacher.html#councils', 'i-people', 'مجالسي'], ['teacher.html#requests', 'i-calendar', 'طلبات التأجيل', n],
            ['teacher-profile.html', 'i-user', 'صفحتي'], ['index.html', 'i-home', 'الموقع']],
      tabs: [['teacher.html', 'i-grid', 'لوحتي'], ['teacher.html#councils', 'i-people', 'مجالسي'], ['teacher.html#requests', 'i-calendar', 'الطلبات'], ['teacher-profile.html', 'i-user', 'صفحتي']]
    });
  }

  /* ---------- postponement requests ---------- */
  function requestCard(r, i) {
    var c = D.council(r.council), s = stu(r.sid);
    return '<article class="req" data-req="' + r.id + '">' +
      '<div class="req-head">' + avatar(r.sid, i) + '<div><b>' + s.name + '</b><small>' + c.name + ' · ' + (c.kind === 'group' ? 'مجلس جماعي' : 'حلقة فردية') + ' · ' + since(r.sent) + '</small></div></div>' +
      '<div class="cc-next"><svg><use href="#i-calendar"/></svg><span>تأجيل حلقة <b>' + F.when(r.for) + '</b></span></div>' +
      '<p>«' + M.esc(r.reason) + '»</p>' +
      '<div class="req-actions">' +
        '<button type="button" class="btn btn--ok" data-accept><svg><use href="#i-check"/></svg>' + (c.kind === 'group' ? 'قبول (غياب بعذر)' : 'قبول وتحديد موعد') + '</button>' +
        '<button type="button" class="btn btn--ghost" data-reject>رفض</button>' +
      '</div>' +
      '<small class="muted">' + (c.kind === 'group'
        ? 'في المجلس الجماعي: الغياب بعذر لا يُخصم من الدفعة ولا يُعوَّض.'
        : 'عند القبول تحدّد موعدًا بديلًا. إن لم تردّ قبل موعد الحلقة يُحال الطلب للمشرف.') + '</small>' +
    '</article>';
  }
  function requestsHTML(councilId) {
    var list = D.REQUESTS.filter(function (r) { return !councilId || r.council === councilId; });
    if (!list.length) return '<div class="empty"><svg><use href="#i-check-circle"/></svg>لا توجد طلبات تأجيل الآن.</div>';
    return list.map(requestCard).join('');
  }
  function removeReq(card, msg, onChange) {
    var id = card.dataset.req;
    D.REQUESTS = D.REQUESTS.filter(function (r) { return r.id !== id; });
    var done = function () {
      var box = card.parentElement; card.remove();
      if (box && !box.querySelector('.req')) box.innerHTML = requestsHTML('__none__');
      onChange && onChange();
    };
    if (M.reduce()) done(); else gsap.to(card, { height: 0, opacity: 0, x: -40, marginTop: 0, paddingTop: 0, paddingBottom: 0, duration: .45, ease: 'power3.in', onComplete: done });
    M.toast(msg);
    document.querySelectorAll('.app-nav .count').forEach(function (b) { var n = D.REQUESTS.length; n ? (b.textContent = F.ar(n)) : b.remove(); });
  }
  function bindRequests(box, onChange) {
    box.addEventListener('click', function (e) {
      var card = e.target.closest('[data-req]'); if (!card) return;
      var r = D.REQUESTS.filter(function (x) { return x.id === card.dataset.req; })[0]; if (!r) return;
      var c = D.council(r.council);
      if (e.target.closest('[data-reject]')) {
        var b = e.target.closest('[data-reject]');
        if (!b.classList.contains('is-confirm')) {         /* first tap asks, second tap rejects */
          b.classList.add('is-confirm'); b.textContent = 'اضغط مرة أخرى للرفض'; M.haptic([8, 30, 8]);
          setTimeout(function () { if (b.isConnected) { b.classList.remove('is-confirm'); b.textContent = 'رفض'; } }, 3000);
          return;
        }
        removeReq(card, 'رُفض الطلب، وتبقى الحلقة في موعدها.', onChange);
        return;
      }
      if (!e.target.closest('[data-accept]')) return;
      if (c.kind === 'group') { removeReq(card, 'قُبل العذر: غياب بعذر لا يُخصم من الدفعة.', onChange); return; }
      /* individual: pick the make-up date */
      var minDay = new Date(); var iso = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
      var sug = new Date(r.for.getTime() + 2 * 864e5);
      var sh = M.sheet({
        title: 'موعد بديل', sub: stu(r.sid).name + ' · بدل ' + F.when(r.for),
        body: '<div class="form-stack">' +
          '<div class="form-row"><div class="field"><label for="mk-day">اليوم</label><div class="control"><svg><use href="#i-calendar"/></svg><input id="mk-day" type="date" required min="' + iso(minDay) + '" value="' + iso(sug) + '" data-msg="اختر اليوم"></div></div>' +
          '<div class="field"><label for="mk-time">الساعة</label><div class="control"><svg><use href="#i-clock"/></svg><input id="mk-time" type="time" required value="' + String(r.for.getHours()).padStart(2, '0') + ':' + String(r.for.getMinutes()).padStart(2, '0') + '" data-msg="اختر الساعة"></div></div></div>' +
          '<p class="notice"><svg><use href="#i-info"/></svg><span>سيصل وليّ الأمر إشعار بالموعد الجديد، وتُحسب الحلقة من الدفعة كالمعتاد.</span></p></div>',
        foot: '<button type="button" class="btn btn--accent" data-ok><svg><use href="#i-check"/></svg>تأكيد الموعد</button>'
      });
      sh.querySelector('[data-ok]').addEventListener('click', function () {
        if (!M.Forms.validate(sh)) return;
        M.closeSheet();
        removeReq(card, 'تم القبول، والموعد البديل ' + F.ar(sh.querySelector('#mk-day').value.split('-').reverse().slice(0, 2).join('/')) + '.', onChange);
      });
    });
  }

  /* ---------- record a halaqa ---------- */
  function recordSheet(c, when, onSaved) {
    var rows = c.students.map(function (sid, i) {
      var s = stu(sid), p = 'a_' + sid;
      return '<div class="att-row" data-sid="' + sid + '">' +
        '<div class="att-top">' + avatar(sid, i) + '<b>' + s.name + '</b><small class="muted">' + s.surah + '</small></div>' +
        '<div class="field" data-required-group data-msg="اختر الحضور"><div class="pills" role="radiogroup" aria-label="حضور ' + s.short + '">' +
          '<label><input type="radio" name="' + p + '" value="present"><span>حاضر</span></label>' +
          '<label><input type="radio" name="' + p + '" value="absent"><span>غائب</span></label>' +
          '<label><input type="radio" name="' + p + '" value="excused"><span>بعذر</span></label></div></div>' +
        '<div class="field att-note"><div class="control control--area"><textarea name="n_' + sid + '" rows="2" maxlength="300" placeholder="ملاحظة لـ' + s.short + ': ماذا حفظ، وما الذي يراجعه"></textarea></div></div>' +
      '</div>';
    }).join('');
    var sh = M.sheet({
      title: 'تسجيل الحلقة', sub: c.name + ' · ' + F.when(when),
      body: '<div class="form-stack">' +
        '<div><span class="form-q">هل تمّت الحلقة؟</span><div class="field"><div class="pills" role="radiogroup">' +
          '<label><input type="radio" name="held" value="yes" checked><span>تمّت</span></label>' +
          '<label><input type="radio" name="held" value="teacher_absent"><span>لم أحضر (تُعوَّض)</span></label></div></div></div>' +
        '<div data-att>' + rows + '</div>' +
        '<p class="notice" data-absent-note hidden><svg><use href="#i-info"/></svg><span>غياب المعلّم لا يُحسب على أحد، وتُعوَّض الحلقة بموعد آخر.</span></p>' +
        '<p class="form-hint">بعد الإرسال يراجعها المشرف، وتُعتمد تلقائيًا بعد ٤٨ ساعة.</p></div>',
      foot: '<button type="button" class="btn btn--accent" data-save><span class="lbl">حفظ التقرير</span><svg><use href="#i-send"/></svg><span class="spin" aria-hidden="true"></span></button>'
    });
    var att = sh.querySelector('[data-att]'), absentNote = sh.querySelector('[data-absent-note]');
    sh.addEventListener('change', function (e) {
      if (e.target.name === 'held') {
        var off = e.target.value !== 'yes';
        att.hidden = off; absentNote.hidden = !off;
      }
      var row = e.target.closest('.att-row');
      if (row && e.target.type === 'radio') {
        row.classList.toggle('is-off', e.target.value !== 'present');
        M.haptic(5);
      }
    });
    sh.querySelector('[data-save]').addEventListener('click', function () {
      var held = sh.querySelector('[name="held"]:checked').value;
      if (held === 'yes' && !M.Forms.validate(att)) return;
      var btn = this; btn.classList.add('is-loading'); btn.disabled = true;
      setTimeout(function () {
        var entry = {
          id: c.id + '-new' + Date.now(), at: when, mins: c.mins, status: held === 'yes' ? 'done' : 'teacher_absent', report: held === 'yes' ? 'pending' : null,
          att: c.students.map(function (sid) {
            var a = (sh.querySelector('[name="a_' + sid + '"]:checked') || {}).value || null;
            return { sid: sid, a: held === 'yes' ? a : null, note: (sh.querySelector('[name="n_' + sid + '"]') || {}).value || '' };
          })
        };
        c.history.unshift(entry);
        M.closeSheet();
        M.toast(held === 'yes' ? 'حُفظ التقرير، ويُعتمد تلقائيًا بعد ٤٨ ساعة.' : 'سُجّل غيابك، وستُعوَّض الحلقة بموعد آخر.');
        onSaved && onSaved(entry);
      }, 700);
    });
    return sh;
  }

  /* ---------- history rows ---------- */
  var STATUS = { done: ['تمّت', 'badge--ok'], excused: ['بعذر', 'badge--warn'], postponed: ['مؤجّلة', 'badge--warn'], teacher_absent: ['غاب المعلّم · تُعوَّض', 'badge--bad'] };
  function historyRow(h) {
    var st = STATUS[h.status];
    var rep = h.report === 'pending' ? '<span class="badge badge--accent"><svg><use href="#i-clock"/></svg>بانتظار الاعتماد</span>' : h.report === 'approved' ? '<span class="badge"><svg><use href="#i-check"/></svg>معتمد</span>' : '';
    var marks = h.status === 'done' ? '<div class="marks">' + h.att.map(function (a) {
      var s = stu(a.sid), cls = a.a === 'absent' ? 'is-absent' : a.a === 'excused' ? 'is-excused' : '';
      return '<span class="mark ' + cls + '" title="' + M.esc(a.note) + '"><i>' + (a.a === 'present' ? '✓' : a.a === 'absent' ? '✕' : '!') + '</i>' + s.short + '</span>';
    }).join('') + '</div>' : '';
    return '<div class="hist-row"><div><b>' + F.date(h.at) + '</b><small>' + F.time(h.at) + ' · ' + F.ar(h.mins) + ' دقيقة</small></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><span class="badge ' + st[1] + '">' + st[0] + '</span>' + rep + '</div>' + marks + '</div>';
  }

  M.T = { shell: shell, requestsHTML: requestsHTML, bindRequests: bindRequests, recordSheet: recordSheet, historyRow: historyRow, avatar: avatar };
})(window.Manasa);
