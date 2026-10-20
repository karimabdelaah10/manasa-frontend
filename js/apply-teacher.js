/* =========================================================
   Teacher application (5 steps).
   ① personal  ② qualifications (+ ijaza photo when "yes")
   ③ recitation: record in the browser or upload a file
   ④ weekly availability grid  ⑤ review
   ========================================================= */
window.Manasa = window.Manasa || {};
window.Manasa.Pages = window.Manasa.Pages || {};

(function (M) {
  'use strict';

  var DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  var SLOTS = [['m', 'صباحًا', '٦–١٢'], ['n', 'ظهرًا', '١٢–٣'], ['a', 'عصرًا', '٣–٦'], ['e', 'مساءً', '٦–٩'], ['l', 'ليلًا', '٩–١٢']];

  function reduce() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ar = function (n) { return M.Forms.ar(n); };

  function reveal(box, show) {
    if (show === !box.hidden) return;
    if (reduce()) { box.hidden = !show; return; }
    if (show) { box.hidden = false; gsap.fromTo(box, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .45, ease: 'power3.out', clearProps: 'height' }); }
    else gsap.to(box, { height: 0, opacity: 0, duration: .28, onComplete: function () { box.hidden = true; box.style.cssText = ''; } });
  }

  /* ---------- the recorder ---------- */
  function recorder(root, onChange) {
    var btn = root.querySelector('[data-rec-toggle]'), wave = root.querySelector('[data-rec-wave]'), time = root.querySelector('[data-rec-time]');
    var after = root.querySelector('[data-rec-after]'), audio = root.querySelector('[data-rec-audio]'), hint = root.querySelector('[data-rec-hint]');
    var bars = [], N = 28, rec = null, stream = null, chunks = [], t0 = 0, timer = null, raf = null, ctx = null, analyser = null;
    var take = null;
    for (var i = 0; i < N; i++) { var b = document.createElement('i'); b.style.setProperty('--k', i); wave.appendChild(b); bars.push(b); }

    function clock(sec) { return ar(Math.floor(sec / 60)) + ':' + ar(String(Math.floor(sec % 60)).padStart(2, '0')); }
    function meter() {
      var data = new Uint8Array(analyser.frequencyBinCount);
      (function loop() {
        analyser.getByteFrequencyData(data);
        for (var k = 0; k < N; k++) {
          var v = data[Math.floor(k * data.length / N / 2)] / 255;
          bars[k].style.transform = 'scaleY(' + Math.max(.08, v) + ')';
        }
        raf = requestAnimationFrame(loop);
      })();
    }
    function error(msg) { onChange(null, msg); }

    function start() {
      if (!navigator.mediaDevices || !window.MediaRecorder) { error('المتصفح لا يدعم التسجيل. ارفع ملفًا صوتيًا بدلًا من ذلك.'); return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s; chunks = [];
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); analyser = ctx.createAnalyser(); analyser.fftSize = 128; ctx.createMediaStreamSource(s).connect(analyser); meter(); } catch (e) {}
        rec = new MediaRecorder(s);
        rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          take = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
          audio.src = URL.createObjectURL(take);
          root.classList.add('has-take');
          after.hidden = false;
          hint.textContent = 'استمع إلى التسجيل، وأعده إن أردت.';
          if (!reduce()) gsap.from(after, { y: 12, opacity: 0, duration: .45, ease: 'power3.out' });
          onChange(take);
        };
        rec.start();
        t0 = Date.now();
        root.classList.add('is-recording');
        btn.setAttribute('aria-label', 'أوقف التسجيل');
        hint.textContent = 'جارٍ التسجيل… اضغط مرة أخرى للإيقاف.';
        timer = setInterval(function () {
          var sec = (Date.now() - t0) / 1000; time.textContent = clock(sec);
          if (sec >= 300) stop();     /* five minutes is plenty */
        }, 250);
        M.haptic && M.haptic(12);
      }).catch(function () { error('لم نتمكن من الوصول إلى الميكروفون. اسمح بالوصول من إعدادات المتصفح، أو ارفع ملفًا.'); });
    }
    function stop() {
      if (!rec) return;
      clearInterval(timer); cancelAnimationFrame(raf);
      rec.stop(); stream.getTracks().forEach(function (t) { t.stop(); });
      try { ctx && ctx.close(); } catch (e) {}
      rec = null;
      root.classList.remove('is-recording');
      btn.setAttribute('aria-label', 'ابدأ التسجيل');
      bars.forEach(function (b) { b.style.transform = ''; });
      M.haptic && M.haptic([10, 40, 10]);
    }
    btn.addEventListener('click', function () { rec ? stop() : start(); });
    root.querySelector('[data-rec-redo]').addEventListener('click', function () {
      take = null; audio.removeAttribute('src'); after.hidden = true; root.classList.remove('has-take');
      time.textContent = clock(0); hint.textContent = 'اضغط الزر وابدأ القراءة، ثم اضغطه مرة أخرى للإيقاف.';
      onChange(null);
    });
    return { has: function () { return !!take; }, take: function () { return take; } };
  }

  M.Pages.applyTeacher = function () {
    var form = document.querySelector('[data-wizard]');
    if (!form) return;
    var api;
    M.Lists && M.Lists.link(form);

    /* WhatsApp */
    var waSame = form.querySelector('[name="t_wa_same"]'), waBox = form.querySelector('[data-wa]'), wa = form.querySelector('[name="t_wa"]');
    function syncWa(anim) { wa.required = !waSame.checked; anim ? reveal(waBox, !waSame.checked) : (waBox.hidden = waSame.checked); }
    waSame.addEventListener('change', function () { syncWa(true); });

    /* ijaza details appear with "yes" */
    var ijBox = form.querySelector('[data-ijaza]'), ijFile = form.querySelector('[name="t_ijaza_file"]');
    function syncIjaza(anim) {
      var yes = (form.querySelector('[name="t_ijaza"]:checked') || {}).value === 'yes';
      ijFile.required = yes;
      anim ? reveal(ijBox, yes) : (ijBox.hidden = !yes);
    }
    form.querySelectorAll('[name="t_ijaza"]').forEach(function (r) { r.addEventListener('change', function () { syncIjaza(true); }); });

    /* recording: record or upload */
    var recRoot = form.querySelector('[data-recorder]'), upBox = form.querySelector('[data-rec-upload]'), recErr = form.querySelector('[data-rec-error]');
    var recFile = form.querySelector('[name="t_rec_file"]');
    var rec = recorder(recRoot, function (take, msg) {
      if (msg) { recErr.querySelector('span').textContent = msg; reveal(recErr, true); }
      else reveal(recErr, false);
    });
    function mode() { return (form.querySelector('[name="t_rec_mode"]:checked') || {}).value; }
    function syncMode() {
      var up = mode() === 'upload';
      reveal(upBox, up); reveal(recRoot, !up); reveal(recErr, false);
    }
    form.querySelectorAll('[name="t_rec_mode"]').forEach(function (r) { r.addEventListener('change', syncMode); });
    recFile.addEventListener('change', function () { reveal(recErr, false); });

    /* availability grid */
    var avail = form.querySelector('[data-avail]'), availCount = form.querySelector('[data-avail-count]');
    avail.innerHTML = '<table><thead><tr><th></th>' + SLOTS.map(function (s) { return '<th scope="col">' + s[1] + '<br><small>' + s[2] + '</small></th>'; }).join('') + '</tr></thead><tbody>' +
      DAYS.map(function (d, i) {
        return '<tr><th scope="row">' + d + '</th>' + SLOTS.map(function (s) {
          return '<td><label><input type="checkbox" name="t_avail" value="' + i + s[0] + '" aria-label="' + d + ' ' + s[1] + '"><span></span></label></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
    function countAvail() {
      var n = avail.querySelectorAll('input:checked').length;
      availCount.textContent = n ? 'اخترت ' + ar(n) + ' ' + (n === 1 ? 'فترة' : n < 11 ? 'فترات' : 'فترة') + ' في الأسبوع.' : 'لم تختر أي فترة بعد.';
    }
    /* press and drag across the grid to paint several slots at once */
    var painting = null;
    avail.addEventListener('pointerdown', function (e) {
      var lab = e.target.closest('label'); if (!lab) return;
      var box = lab.querySelector('input'); painting = !box.checked;
      e.preventDefault(); box.checked = painting; box.dispatchEvent(new Event('change', { bubbles: true })); M.haptic && M.haptic(4);
    });
    avail.addEventListener('pointerover', function (e) {
      if (painting === null || e.pointerType !== 'mouse') return;
      var lab = e.target.closest('label'); if (!lab) return;
      var box = lab.querySelector('input'); if (box.checked !== painting) { box.checked = painting; box.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    window.addEventListener('pointerup', function () { painting = null; });
    /* pointer taps are handled above; keyboard (Space) still toggles normally */
    avail.addEventListener('click', function (e) { if (e.detail > 0 && e.target.closest('label')) e.preventDefault(); });
    avail.addEventListener('change', countAvail);

    /* review */
    var review = form.querySelector('[data-review]');
    function block(title, step, rows) {
      return '<div class="review-block"><div class="review-head"><b>' + title + '</b>' +
        '<button type="button" data-goto="' + step + '"><svg><use href="#i-edit"/></svg>تعديل</button></div><dl>' +
        rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl></div>';
    }
    function buildReview(d) {
      var teaches = [].concat(d.t_teaches || []).map(function (t) { return t === 'kids' ? 'الأطفال' : 'الكبار'; }).join(' و');
      var slots = [].concat(d.t_avail || []);
      var byDay = DAYS.map(function (day, i) {
        var s = SLOTS.filter(function (x) { return slots.indexOf(i + x[0]) !== -1; }).map(function (x) { return x[1]; });
        return s.length ? day + ': ' + s.join('، ') : '';
      }).filter(Boolean);
      var recLbl = mode() === 'upload' ? ((recFile.files[0] || {}).name || '—') : (rec.has() ? 'تسجيل من المتصفح ✓' : '—');
      review.innerHTML =
        block('البيانات الشخصية', 0, [['الاسم', d.t_name], ['النوع', d.t_gender === 'f' ? 'معلّمة' : 'معلّم'], ['الهاتف', (d.t_code || '') + ' ' + (d.t_phone || '')], ['واتساب', d.t_wa_same ? 'الرقم نفسه' : d.t_wa], ['الدولة', d.t_country], ['الإيميل', d.t_email]]) +
        block('المؤهلات', 1, [['الحفظ', ar(d.t_mem) + ' جزء'], ['الإجازة', d.t_ijaza === 'yes' ? [].concat(d.t_riwaya || []).join('، ') : 'لا توجد'], ['صورة الإجازة', d.t_ijaza === 'yes' ? (d.t_ijaza_file || '—') : '—'], ['الخبرة', ar(d.t_years) + ' سنوات'], ['يدرّس', teaches], ['نبذة', d.t_bio || '—']]) +
        block('التلاوة', 2, [['الملف', recLbl]]) +
        block('المواعيد', 3, [['الساعات', ar(d.t_hours) + ' ساعة أسبوعيًا'], ['الفترات', byDay.join(' · ') || '—']]);
    }
    review.addEventListener('click', function (e) { var b = e.target.closest('[data-goto]'); if (b) api.go(api.steps[+b.dataset.goto]); });

    api = M.Wizard.create(form, {
      onEnter: function (step, d) {
        var i = Array.prototype.indexOf.call(form.querySelectorAll('section[data-step]'), step);
        if (i === 4) buildReview(d);
      },
      onLeave: function (step) {
        var i = Array.prototype.indexOf.call(form.querySelectorAll('section[data-step]'), step);
        if (i !== 2) return true;
        var ok = mode() === 'upload' ? !!(recFile.files && recFile.files[0]) : rec.has();
        if (!ok) {
          recErr.querySelector('span').textContent = mode() === 'upload' ? 'ارفع ملف التلاوة أولًا.' : 'سجّل التلاوة أولًا، أو اختر رفع ملف.';
          reveal(recErr, true);
          recErr.classList.remove('shake'); void recErr.offsetWidth; recErr.classList.add('shake');
          M.haptic && M.haptic([12, 40, 12]);
          return false;
        }
        return true;
      },
      submit: function () { return { ref: 'T-' + String(Math.floor(10000 + Math.random() * 89999)) }; },
      onDone: function (box, res) {
        box.querySelector('[data-done-ids]').innerHTML = '<div class="done-id"><span>رقم الطلب</span><b>' + res.ref + '</b></div>';
      }
    });
    syncWa(false); syncIjaza(false); countAvail();
    upBox.hidden = mode() !== 'upload'; recRoot.hidden = mode() === 'upload';
  };
})(window.Manasa);
