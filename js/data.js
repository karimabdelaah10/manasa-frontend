/* =========================================================
   Demo data for the teacher/student pages until the API exists.
   Dates are built relative to today so the pages always look live.
   Rules followed (from the platform's business model):
   - a halaqa report is approved by the admin, or automatically after 48h
   - a batch = a number of halaqas; the admin is alerted when 2 remain
   - group council: an accepted excuse = excused absence, no make-up
   - individual halaqa: accepting a postponement sets a new date
   - teacher absence: counts for no one, gets a make-up
   - teacher is paid per scheduled hour
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var DAY = 864e5;
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function at(dayOffset, h, m) { var d = new Date(today.getTime() + dayOffset * DAY); d.setHours(h, m || 0, 0, 0); return d; }

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
  var WD = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  var MO = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  function time(d) { var h = d.getHours(), m = d.getMinutes(); return ar((h % 12) || 12) + ':' + ar(String(m).padStart(2, '0')) + (h < 12 ? ' ص' : ' م'); }
  function dayName(d) {
    var diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - today) / DAY);
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'غدًا';
    if (diff === -1) return 'أمس';
    return WD[d.getDay()];
  }
  function date(d) { return dayName(d) + ' ' + ar(d.getDate()) + ' ' + MO[d.getMonth()]; }
  function when(d) { return dayName(d) + ' · ' + time(d); }
  function money(n) { return ar(Math.round(n).toLocaleString('en-US')).replace(/,/g, '٬'); }
  function num(n, dec) { var s = dec ? n.toFixed(dec) : String(Math.round(n)); return ar(s).replace('.', '٫'); }

  /* the weekday (0=Sun) of the next occurrence on/after today */
  function next(wd, h, m) { var off = (wd - today.getDay() + 7) % 7; var d = at(off, h, m); if (d < new Date()) d = at(off + 7, h, m); return d; }

  var TEACHER = {
    id: '20117', name: 'محمود عبد الرحمن', title: 'أ.', gender: 'm', phone: '01011112222', email: 'mahmoud@example.com',
    country: 'مصر', memorized: 30, ijaza: ['حفص عن عاصم', 'شعبة عن عاصم'], years: 9, teaches: ['الأطفال', 'الكبار'],
    bio: 'حفظ القرآن صغيرًا في كُتّاب قريته، وقرأ بحفص وشعبة على الشيخ [اسم الشيخ]. يحب العمل مع الصغار ويبدأ بهم من جزء عمّ.',
    rate: 150, currency: 'ج.م',               /* demo rate per hour — the real one comes from the admin */
    supervisor: 'أ. خالد سالم',
    avail: ['0e', '0l', '1e', '2e', '2l', '3e', '4e', '6m', '6e'],
    joined: 'منذ سنتين'
  };

  /* students */
  var S = {
    '10234': { id: '10234', name: 'يوسف أحمد', short: 'يوسف', age: 9, gender: 'boy', guardian: 'أحمد محمود', phone: '01033334444', mem: 1.3, surah: 'الكوثر', attendance: 96, family: ['10234', '10235'] },
    '10235': { id: '10235', name: 'مريم أحمد', short: 'مريم', age: 11, gender: 'girl', guardian: 'أحمد محمود', phone: '01033334444', mem: 2.6, surah: 'النازعات', attendance: 100, family: ['10234', '10235'] },
    '10240': { id: '10240', name: 'عمر خالد', short: 'عمر', age: 10, gender: 'boy', guardian: 'خالد يوسف', mem: 1.8, surah: 'عبس', attendance: 88 },
    '10241': { id: '10241', name: 'سارة محمد', short: 'سارة', age: 9, gender: 'girl', guardian: 'محمد علي', mem: 1.1, surah: 'الشمس', attendance: 92 },
    '10242': { id: '10242', name: 'آدم حسن', short: 'آدم', age: 8, gender: 'boy', guardian: 'حسن إبراهيم', mem: 0.6, surah: 'الهمزة', attendance: 79 },
    '10243': { id: '10243', name: 'ليلى سامي', short: 'ليلى', age: 10, gender: 'girl', guardian: 'سامي فؤاد', mem: 2.1, surah: 'المطففين', attendance: 95 },
    '10230': { id: '10230', name: 'عبد الله مصطفى', short: 'عبد الله', age: 34, gender: 'man', mem: 12, surah: 'الكهف', attendance: 91 },
    '10231': { id: '10231', name: 'خالد عمرو', short: 'خالد', age: 41, gender: 'man', mem: 7, surah: 'يوسف', attendance: 84 },
    '10232': { id: '10232', name: 'ياسر عادل', short: 'ياسر', age: 27, gender: 'man', mem: 20, surah: 'الأحزاب', attendance: 97 },
    '10233': { id: '10233', name: 'سامي نبيل', short: 'سامي', age: 52, gender: 'man', mem: 4, surah: 'الأنعام', attendance: 90 },
    '10250': { id: '10250', name: 'عبد الرحمن طارق', short: 'عبد الرحمن', age: 23, gender: 'man', mem: 3, surah: 'آل عمران', attendance: 100 }
  };

  /* councils: kind single|group, sched = [weekday, hour, minute], mins per halaqa, batch size/used */
  var COUNCILS = [
    { id: 'c101', name: 'حلقة يوسف', kind: 'single', level: 'أطفال', students: ['10234'], sched: [[0, 19, 0], [2, 19, 0]], mins: 45, batch: { size: 10, used: 8 }, color: 1 },
    { id: 'c102', name: 'مجلس النور', kind: 'group', level: 'أطفال', students: ['10235', '10240', '10241', '10242', '10243'], sched: [[6, 17, 30], [1, 17, 30], [3, 17, 30]], mins: 60, batch: { size: 12, used: 5 }, color: 2 },
    { id: 'c103', name: 'مجلس التثبيت', kind: 'group', level: 'كبار', students: ['10230', '10231', '10232', '10233'], sched: [[0, 21, 0], [4, 21, 0]], mins: 60, batch: { size: 8, used: 7 }, color: 3 },
    { id: 'c104', name: 'حلقة عبد الرحمن', kind: 'single', level: 'كبار', students: ['10250'], sched: [[1, 20, 0]], mins: 30, batch: { size: 8, used: 2 }, color: 4 }
  ];
  COUNCILS.forEach(function (c) {
    c.next = c.sched.map(function (s) { return next(s[0], s[1], s[2]); }).sort(function (a, b) { return a - b; })[0];
    c.schedText = c.sched.map(function (s) { var d = new Date(2026, 0, 4 + s[0], s[1], s[2]); return WD[s[0]] + ' ' + time(d); });
  });

  /* past halaqas (newest first). status: done | excused | postponed | teacher_absent
     report: approved | pending (auto-approves 48h after the halaqa) */
  var NOTES = {
    '10234': ['حفظ ممتاز للكافرون، ونبدأ الكوثر في الحلقة القادمة.', 'أتقن الماعون، ويحتاج تثبيت مخارج العين.', 'مراجعة قريش والفيل بلا أخطاء، ما شاء الله.'],
    '10235': ['راجعت النبأ كاملة بإتقان، وتبدأ النازعات.', 'تحسن واضح في المدود.', 'حفظ عشر آيات جديدة من النبأ.'],
    '10240': ['يحتاج مراجعة عبس من البيت قبل الحلقة.', 'حفظ جيد، مع تنبيه على الغنّة.'],
    '10241': ['حفظ الشمس كاملة، أحسنتِ.', 'قراءة هادئة ومتقنة.'],
    '10242': ['غاب بعذر (سفر).', 'يحتاج تكرار الهمزة.'],
    '10243': ['ممتازة في التلاوة والتجويد.', 'حفظت ربع المطففين.'],
    '10230': ['تثبيت الكهف من ١ إلى ٣٠ بدون أخطاء.', 'مراجعة سورة مريم.'],
    '10231': ['يحتاج مراجعة الربع الأخير من يوسف.', 'تحسن في الإدغام.'],
    '10232': ['إتقان ممتاز، ننتقل للأحزاب.', 'مراجعة سبأ.'],
    '10233': ['متابعة الأنعام، القراءة تحتاج تأنيًا.', 'حفظ صفحة جديدة.'],
    '10250': ['تصحيح التلاوة: أحكام النون الساكنة.', 'قراءة الفاتحة بإتقان.']
  };
  function history(c) {
    var list = [], k = 0;
    for (var w = 0; w < 3; w++) {
      c.sched.slice().reverse().forEach(function (s) {
        var d = new Date(c.next.getTime() - (++k) * (7 / c.sched.length) * DAY);
        d.setHours(s[1], s[2], 0, 0);
        var status = 'done';
        if (c.id === 'c102' && k === 2) status = 'teacher_absent';
        if (c.id === 'c101' && k === 3) status = 'postponed';
        var age = (Date.now() - d) / 36e5;
        list.push({
          id: c.id + '-h' + k, at: d, mins: c.mins, status: status,
          report: status === 'done' ? (age < 48 ? 'pending' : 'approved') : null,
          att: c.students.map(function (sid, i) {
            var a = 'present';
            if (c.kind === 'group' && (i + k) % 7 === 3) a = 'excused';
            if (c.kind === 'group' && (i + k) % 11 === 5) a = 'absent';
            return { sid: sid, a: status === 'done' ? a : null, note: status === 'done' && a === 'present' ? NOTES[sid][(k - 1) % NOTES[sid].length] : '' };
          })
        });
      });
    }
    return list;
  }
  COUNCILS.forEach(function (c) { c.history = history(c); });

  /* postponement requests waiting for the teacher */
  var REQUESTS = [
    { id: 'r1', council: 'c101', sid: '10234', for: COUNCILS[0].next, reason: 'سفر عائلي يوم الحلقة، ونرجو تأجيلها ليوم آخر في الأسبوع نفسه.', sent: new Date(Date.now() - 5 * 36e5) },
    { id: 'r2', council: 'c102', sid: '10242', for: COUNCILS[1].next, reason: 'عنده امتحان في المدرسة صباح اليوم التالي.', sent: new Date(Date.now() - 26 * 36e5) },
    { id: 'r3', council: 'c103', sid: '10231', for: COUNCILS[2].next, reason: 'ظرف عمل طارئ.', sent: new Date(Date.now() - 2 * 36e5) }
  ];

  /* this month's hours = finished halaqas (and teacher-absent ones count for no one) */
  function monthStats() {
    var start = new Date(today.getFullYear(), today.getMonth(), 1), mins = 0, n = 0;
    COUNCILS.forEach(function (c) { c.history.forEach(function (h) { if (h.at >= start && h.status === 'done') { mins += h.mins; n++; } }); });
    /* the demo history is short; scale it to a believable month */
    var factor = Math.max(1, today.getDate() / 9);
    return { hours: mins / 60 * factor, halaqas: Math.round(n * factor) };
  }

  M.Data = {
    TEACHER: TEACHER, STUDENTS: S, COUNCILS: COUNCILS, REQUESTS: REQUESTS,
    council: function (id) { return COUNCILS.filter(function (c) { return c.id === id; })[0]; },
    councilOf: function (sid) { return COUNCILS.filter(function (c) { return c.students.indexOf(sid) !== -1; })[0]; },
    monthStats: monthStats,
    today: today, at: at, fmt: { ar: ar, time: time, date: date, when: when, day: dayName, money: money, num: num, WD: WD }
  };
})(window.Manasa);
