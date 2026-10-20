/* =========================================================
   Student / guardian application (5 steps).
   ① for whom  ② account owner  ③ learners  ④ preferences  ⑤ review
   Step ③ and ④ are built from the answer in ①:
   "self" → one card about you, "child" → one card per child,
   "both" → you + the children.
   ========================================================= */
window.Manasa = window.Manasa || {};
window.Manasa.Pages = window.Manasa.Pages || {};

(function (M) {
  'use strict';

  var DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  var TIMES = [['morning', 'صباحًا', '٦–١٢ص'], ['noon', 'ظهرًا', '١٢–٣م'], ['afternoon', 'عصرًا', '٣–٦م'], ['evening', 'مساءً', '٦–٩م'], ['night', 'ليلًا', '٩–١٢م']];
  var GOALS = ['حفظ جديد', 'تثبيت المحفوظ', 'تصحيح التلاوة'];
  var AGES = [['u18', 'أقل من ١٨'], ['18-30', '١٨–٣٠'], ['30-50', '٣٠–٥٠'], ['50+', 'فوق ٥٠']];

  function reduce() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ar = function (n) { return M.Forms.ar(n); };
  var ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];

  function pills(name, opts, msg) {
    return '<div class="field" data-required-group data-msg="' + msg + '"><div class="pills" role="radiogroup">' +
      opts.map(function (o) { return '<label><input type="radio" name="' + name + '" value="' + o[0] + '"><span>' + o[1] + '</span></label>'; }).join('') +
      '</div></div>';
  }
  function chips(name, opts, msg, label) {
    return '<div class="field" data-required-group data-min-checked="1" data-msg="' + msg + '">' +
      (label ? '<span class="form-q">' + label + '</span>' : '') +
      '<div class="chips-pick">' + opts.map(function (o) {
        return '<label class="chip"><input type="checkbox" name="' + name + '" value="' + o[0] + '"><span>' + o[1] + (o[2] ? ' <small class="muted">' + o[2] + '</small>' : '') + '</span></label>';
      }).join('') + '</div></div>';
  }
  function memRange(name, label) {
    return '<div class="field"><div class="range" data-format="{n} جزء" data-zero="لم يبدأ بعد">' +
      '<div class="range-top"><span class="form-q">' + label + '</span><output class="range-value"></output></div>' +
      '<input type="range" name="' + name + '" min="0" max="30" step="1" value="0" aria-label="' + label + '">' +
      '<div class="range-scale"><span>٠</span><span>١٠</span><span>٢٠</span><span>٣٠ جزءًا</span></div></div></div>';
  }

  M.Pages.applyStudent = function () {
    var form = document.querySelector('[data-wizard]');
    if (!form) return;
    var kidsBox = form.querySelector('[data-kids]'), addKid = form.querySelector('[data-add-kid]');
    var selfBox = form.querySelector('[data-self-card]'), prefsBox = form.querySelector('[data-prefs]');
    var review = form.querySelector('[data-review]');
    var kids = [], nextId = 1, api;
    M.Lists && M.Lists.link(form);

    function who() { var r = form.querySelector('[name="for"]:checked'); return r ? r.value : ''; }
    function hasSelf(w) { return w === 'self' || w === 'both'; }
    function hasKids(w) { return w === 'child' || w === 'both'; }

    /* ---------- WhatsApp: same number or another ---------- */
    var waSame = form.querySelector('[name="g_wa_same"]'), waBox = form.querySelector('[data-wa]'), waInput = form.querySelector('[name="g_wa"]');
    function syncWa(animate) {
      var show = !waSame.checked;
      waInput.required = show;
      if (!animate || reduce()) { waBox.hidden = !show; return; }
      if (show) { waBox.hidden = false; gsap.fromTo(waBox, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .4, ease: 'power3.out', clearProps: 'height' }); }
      else gsap.to(waBox, { height: 0, opacity: 0, duration: .25, onComplete: function () { waBox.hidden = true; waBox.style.cssText = ''; } });
    }
    waSame.addEventListener('change', function () { syncWa(true); });

    /* ---------- learners ---------- */
    function kidCard(id, n) {
      var p = 'k' + id + '_';
      return '<div class="repeat-card" data-kid="' + id + '">' +
        '<div class="repeat-head"><b><span class="av">' + ar(n) + '</span><span data-kid-label>الطفل ' + (ORD[n - 1] || ar(n)) + '</span></b>' +
          '<button type="button" class="icon-btn" data-remove-kid aria-label="حذف هذا الطفل"><svg><use href="#i-trash"/></svg></button></div>' +
        '<div class="form-stack">' +
          '<div class="field"><label for="' + p + 'name">اسم الطفل</label><div class="control"><svg><use href="#i-child"/></svg>' +
            '<input id="' + p + 'name" name="' + p + 'name" required minlength="2" data-msg="اكتب اسم الطفل" data-kid-name></div></div>' +
          '<div class="form-row">' +
            '<div class="field"><span class="form-q">السن</span><div class="stepper" data-format="{n} سنوات">' +
              '<button type="button" data-step="-1" aria-label="أقل">−</button><output></output><button type="button" data-step="1" aria-label="أكثر">+</button>' +
              '<input type="hidden" name="' + p + 'age" value="7" min="4" max="17"></div></div>' +
            '<div><span class="form-q">النوع</span>' + pills(p + 'gender', [['boy', 'ولد'], ['girl', 'بنت']], 'اختر النوع') + '</div>' +
          '</div>' +
          memRange(p + 'mem', 'المحفوظ حاليًا') +
        '</div></div>';
    }
    function renumber() {
      kidsBox.querySelectorAll('[data-kid]').forEach(function (c, i) {
        c.querySelector('.av').textContent = ar(i + 1);
        c.querySelector('[data-kid-label]').textContent = 'الطفل ' + (ORD[i] || ar(i + 1));
        c.querySelector('[data-remove-kid]').hidden = kidsBox.children.length === 1;
      });
    }
    function addKidCard(id, animate) {
      if (id >= nextId) nextId = id + 1;
      kids.push(id);
      kidsBox.insertAdjacentHTML('beforeend', kidCard(id, kids.length));
      var card = kidsBox.lastElementChild;
      M.Forms.enhance(card);
      renumber();
      if (animate && !reduce()) {
        gsap.fromTo(card, { height: 0, opacity: 0, y: -10 }, { height: 'auto', opacity: 1, y: 0, duration: .5, ease: 'power3.out', clearProps: 'height,transform' });
        setTimeout(function () { var i = card.querySelector('input'); i && i.focus({ preventScroll: true }); }, 350);
      }
      return card;
    }
    addKid.addEventListener('click', function () { if (kids.length < 8) { addKidCard(nextId, true); api.save(); M.haptic && M.haptic(); } });
    kidsBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove-kid]'); if (!b) return;
      var card = b.closest('[data-kid]'), id = +card.dataset.kid;
      var gone = function () { card.remove(); kids = kids.filter(function (k) { return k !== id; }); renumber(); api.save(); };
      if (reduce()) gone(); else gsap.to(card, { height: 0, opacity: 0, x: 40, paddingTop: 0, paddingBottom: 0, duration: .35, ease: 'power2.in', onComplete: gone });
      M.haptic && M.haptic([8, 30, 8]);
    });

    function selfCard() {
      return '<div class="learner"><div class="learner-head"><span class="av">أ</span><span>عنك<br><small>لنختار لك المجلس المناسب</small></span></div>' +
        '<div class="form-row"><div><span class="form-q">النوع</span>' + pills('s_gender', [['male', 'رجل'], ['female', 'امرأة']], 'اختر النوع') + '</div>' +
        '<div><span class="form-q">العمر</span>' + pills('s_age', AGES.slice(1), 'اختر الفئة العمرية') + '</div></div>' +
        memRange('s_mem', 'محفوظك حاليًا') +
        chips('s_goal', GOALS.map(function (g) { return [g, g]; }), 'اختر هدفًا واحدًا على الأقل', 'هدفك') +
        '</div>';
    }
    function buildSelf() {
      if (selfBox.innerHTML) return;
      selfBox.innerHTML = selfCard();
      M.Forms.enhance(selfBox);
    }
    function showLearners(w) {
      selfBox.hidden = !hasSelf(w);
      if (hasSelf(w)) buildSelf();
      kidsBox.hidden = addKid.hidden = !hasKids(w);
      if (hasKids(w) && !kids.length) addKidCard(nextId, false);
      var t = form.querySelector('[data-learn-title]');
      t.textContent = w === 'self' ? 'عنك' : w === 'child' ? 'بيانات الأطفال' : 'عنك وعن أطفالك';
    }

    /* ---------- preferences: one block per learner ---------- */
    function learners() {
      var w = who(), list = [];
      if (hasSelf(w)) list.push({ key: 's', label: 'أنت', kid: false });
      if (hasKids(w)) kids.forEach(function (id, i) {
        var n = (form.querySelector('[name="k' + id + '_name"]') || {}).value;
        list.push({ key: 'k' + id, label: n || ('الطفل ' + (ORD[i] || ar(i + 1))), kid: true });
      });
      return list;
    }
    function buildPrefs(keepData) {
      var d = keepData || api.data();
      var list = learners();
      prefsBox.innerHTML = list.map(function (l) {
        var p = 'p_' + l.key + '_';
        return '<div class="learner">' +
          '<div class="learner-head"><span class="av">' + esc(l.label.charAt(0)) + '</span><span>' + esc(l.label) + '</span></div>' +
          '<div><span class="form-q">نوع الحلقة</span>' + pills(p + 'type', [['single', 'فردية'], ['group', 'مجلس جماعي'], ['any', 'لا فرق']], 'اختر نوع الحلقة') + '</div>' +
          '<div><span class="form-q">' + (l.kid ? 'يدرّسه' : 'يدرّسك') + '</span>' + pills(p + 'tg', [['m', 'معلّم'], ['f', 'معلّمة'], ['any', 'لا فرق']], 'اختر') + '</div>' +
          chips(p + 'days', DAYS.map(function (x) { return [x, x]; }), 'اختر يومًا واحدًا على الأقل', 'الأيام المناسبة') +
          chips(p + 'times', TIMES, 'اختر وقتًا واحدًا على الأقل', 'الأوقات المناسبة') +
        '</div>';
      }).join('');
      /* put back what was already picked */
      Object.keys(d).forEach(function (n) {
        if (n.indexOf('p_') !== 0) return;
        var vals = [].concat(d[n]);
        prefsBox.querySelectorAll('[name="' + n + '"]').forEach(function (el) { el.checked = vals.indexOf(el.value) !== -1; });
      });
      M.Forms.enhance(prefsBox);
      prefsBox.querySelectorAll('.pills').forEach(function (g) { g._sync && g._sync(); });
    }

    /* ---------- review ---------- */
    function label(name, value) {
      var el = form.querySelector('[name="' + name + '"][value="' + value + '"]');
      var span = el && el.parentElement.querySelector('span');
      return span ? span.childNodes[0].textContent.trim() : value;
    }
    function list(v) { return [].concat(v || []).join('، ') || '—'; }
    function block(title, step, rows) {
      return '<div class="review-block"><div class="review-head"><b>' + title + '</b>' +
        '<button type="button" data-goto="' + step + '"><svg><use href="#i-edit"/></svg>تعديل</button></div><dl>' +
        rows.map(function (r) { return r[0] === 'sub' ? '<dd class="sub">' + esc(r[1]) + '</dd>' : '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl></div>';
    }
    function buildReview(d) {
      var w = d['for'], html = '';
      var forLbl = { child: 'لطفلي أو أطفالي', self: 'لنفسي', both: 'لي ولأطفالي' }[w];
      var phone = (d.g_code || '') + ' ' + (d.g_phone || '');
      html += block('الحساب', 1, [['التسجيل', forLbl], ['الاسم', d.g_name], ['الهاتف', phone], ['واتساب', d.g_wa_same && d.g_wa_same.length ? 'الرقم نفسه' : d.g_wa], ['الدولة', d.g_country], ['الإيميل', d.g_email || '—']]);
      var rows = [];
      if (hasSelf(w)) rows.push(['sub', 'أنت'], ['النوع', label('s_gender', d.s_gender)], ['العمر', label('s_age', d.s_age)], ['المحفوظ', +d.s_mem ? ar(d.s_mem) + ' جزء' : 'لم يبدأ بعد'], ['الهدف', list(d.s_goal)]);
      if (hasKids(w)) kids.forEach(function (id) {
        var p = 'k' + id + '_';
        rows.push(['sub', d[p + 'name']], ['السن', ar(d[p + 'age']) + ' سنوات'], ['النوع', label(p + 'gender', d[p + 'gender'])], ['المحفوظ', +d[p + 'mem'] ? ar(d[p + 'mem']) + ' جزء' : 'لم يبدأ بعد']);
      });
      html += block('الطلاب', 2, rows);
      var pr = [];
      learners().forEach(function (l) {
        var p = 'p_' + l.key + '_';
        pr.push(['sub', l.label], ['الحلقة', label(p + 'type', d[p + 'type'])], ['المعلّم', label(p + 'tg', d[p + 'tg'])], ['الأيام', list(d[p + 'days'])],
          ['الأوقات', [].concat(d[p + 'times'] || []).map(function (t) { return label(p + 'times', t); }).join('، ')]);
      });
      html += block('التفضيلات', 3, pr);
      review.innerHTML = html;
    }
    review.addEventListener('click', function (e) {
      var b = e.target.closest('[data-goto]'); if (b) api.go(api.steps[+b.dataset.goto]);
    });

    /* ---------- wizard ---------- */
    api = M.Wizard.create(form, {
      onEnter: function (step, d) {
        var i = api ? api.steps.indexOf(step) : Array.prototype.indexOf.call(form.querySelectorAll('section[data-step]'), step);
        var w = d['for'];
        if (i === 1) form.querySelector('[data-acc-title]').textContent = w === 'self' ? 'بياناتك' : 'بيانات وليّ الأمر';
        if (i === 2) showLearners(w);
        if (i === 3) buildPrefs(d);
        if (i === 4) buildReview(d);
      },
      saveExtra: function () { return { kids: kids.slice(), for: who() }; },
      restoreExtra: function (x) {
        (x.kids || []).forEach(function (id) { addKidCard(id, false); });
        if (x['for']) {
          var r = form.querySelector('[name="for"][value="' + x['for'] + '"]'); if (r) r.checked = true;
          showLearners(x['for']);
          buildPrefs({});
        }
      },
      submit: function () {
        /* no backend yet: a request number stands in for the API's answer */
        return { ref: 'S-' + String(Math.floor(10000 + Math.random() * 89999)) };
      },
      onDone: function (box, res, d) {
        var n = (hasSelf(d['for']) ? 1 : 0) + (hasKids(d['for']) ? kids.length : 0);
        box.querySelector('[data-done-ids]').innerHTML =
          '<div class="done-id"><span>رقم الطلب</span><b>' + res.ref + '</b></div>' +
          '<div class="done-id"><span>عدد الطلاب</span><b>' + ar(n) + '</b></div>';
      }
    });
    syncWa(false);

    /* arriving from «سجّل طفلك» / «ابدأ رحلتك» on the homepage pre-picks the answer */
    var pre = new URLSearchParams(window.location.search).get('for');
    if (pre && !who()) {
      var r = form.querySelector('[name="for"][value="' + pre + '"]');
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    }
  };
})(window.Manasa);
