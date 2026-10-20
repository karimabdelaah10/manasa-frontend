/* =========================================================
   Form kit behaviour: password eye, sliding pills, ranges,
   steppers, file drop preview, and validation with a shake.
   Works on anything already in the page and anything added
   later (call M.Forms.enhance(root) after inserting markup).
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
  /* Arabic-Indic or Persian digits typed on a phone keyboard → 0-9 */
  function toLatin(s) {
    return String(s || '').replace(/[٠-٩]/g, function (d) { return AR.indexOf(d); })
      .replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); });
  }

  function pills(root) {
    root.querySelectorAll('.pills').forEach(function (g) {
      if (g._ready) return; g._ready = true;
      var inputs = g.querySelectorAll('input');
      g.style.setProperty('--n', inputs.length);
      if (!g.querySelector('.pills-pill')) g.insertAdjacentHTML('afterbegin', '<span class="pills-pill" aria-hidden="true"></span>');
      function sync() {
        var i = Array.prototype.findIndex.call(inputs, function (x) { return x.checked; });
        g.style.setProperty('--i', Math.max(0, i));
        g.querySelector('.pills-pill').style.opacity = i < 0 ? '0' : '1';
      }
      inputs.forEach(function (x) { x.addEventListener('change', function () { sync(); M.haptic && M.haptic(); }); });
      sync();
      g._sync = sync;
    });
  }

  function eyes(root) {
    root.querySelectorAll('.pw-eye').forEach(function (b) {
      if (b._ready) return; b._ready = true;
      b.addEventListener('click', function () {
        var input = b.parentElement.querySelector('input');
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        b.setAttribute('aria-pressed', String(show));
        b.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
      });
    });
  }

  function ranges(root) {
    root.querySelectorAll('.range').forEach(function (r) {
      if (r._ready) return; r._ready = true;
      var input = r.querySelector('input[type="range"]'), out = r.querySelector('.range-value');
      var fmt = r.dataset.format || '{n}';
      function sync() {
        var min = +input.min || 0, max = +input.max || 100, v = +input.value;
        input.style.setProperty('--fill', ((v - min) / (max - min) * 100) + '%');
        if (out) {
          var zero = r.dataset.zero;
          out.textContent = v === min && zero ? zero : fmt.replace('{n}', ar(v));
        }
      }
      input.addEventListener('input', sync);
      sync();
      r._sync = sync;
    });
  }

  function steppers(root) {
    root.querySelectorAll('.stepper').forEach(function (s) {
      if (s._ready) return; s._ready = true;
      var input = s.querySelector('input'), out = s.querySelector('output');
      var fmt = s.dataset.format || '{n}';
      function sync() { out.textContent = fmt.replace('{n}', ar(input.value)); }
      s.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = Math.min(+input.max, Math.max(+input.min, +input.value + (+b.dataset.step)));
          input.value = v; sync();
          input.dispatchEvent(new Event('change', { bubbles: true }));
          M.haptic && M.haptic(5);
          if (window.gsap) gsap.fromTo(out, { scale: 1.25 }, { scale: 1, duration: .35, ease: 'back.out(3)' });
        });
      });
      sync();
      s._sync = sync;
    });
  }

  function files(root) {
    root.querySelectorAll('.file-drop').forEach(function (d) {
      if (d._ready) return; d._ready = true;
      var input = d.querySelector('input'), ic = d.querySelector('.fd-ic'), title = d.querySelector('b'), sub = d.querySelector('small');
      var empty = { ic: ic.innerHTML, title: title.textContent, sub: sub.textContent };
      ['dragenter', 'dragover'].forEach(function (ev) { d.addEventListener(ev, function () { d.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { d.addEventListener(ev, function () { d.classList.remove('is-over'); }); });
      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        if (!f) { ic.innerHTML = empty.ic; title.textContent = empty.title; sub.textContent = empty.sub; return; }
        title.textContent = f.name;
        sub.textContent = (f.size / 1024 / 1024).toFixed(1).replace(/\d/g, function (x) { return AR[x]; }) + ' ميجا · اضغط للتغيير';
        if (/^image\//.test(f.type)) {
          var img = new Image(); img.alt = ''; img.src = URL.createObjectURL(f);
          ic.innerHTML = ''; ic.appendChild(img);
        } else ic.innerHTML = '<svg><use href="#i-file"/></svg>';
        if (window.gsap) gsap.fromTo(ic, { scale: .6 }, { scale: 1, duration: .5, ease: 'back.out(2.5)' });
        M.haptic && M.haptic();
      });
    });
  }

  function enhance(root) {
    root = root || document;
    pills(root); eyes(root); ranges(root); steppers(root); files(root);
    /* typing Arabic digits into number-ish fields */
    root.querySelectorAll('input[inputmode="numeric"], input[inputmode="tel"]').forEach(function (i) {
      if (i._digits) return; i._digits = true;
      i.addEventListener('input', function () { var v = toLatin(i.value); if (v !== i.value) i.value = v; });
    });
    /* chips & choices: a small tap feel */
    root.querySelectorAll('.chip input, .choice input').forEach(function (i) {
      if (i._tap) return; i._tap = true;
      i.addEventListener('change', function () { M.haptic && M.haptic(5); });
    });
  }

  /* ---------- validation ----------
     rules come from the markup: required, minlength, pattern,
     data-match="#otherId", data-min-checked="1" (on a group field) */
  function fieldOf(el) { return el.closest('.field') || el; }
  function setError(field, msg) {
    field.classList.add('has-error');
    var box = field.querySelector('.field-error');
    if (!box) {
      box = document.createElement('p');
      box.className = 'field-error';
      field.appendChild(box);
    }
    box.innerHTML = '<svg><use href="#i-alert"/></svg><span></span>';
    box.querySelector('span').textContent = msg;
  }
  function clearError(field) { field.classList.remove('has-error'); }

  function checkOne(el) {
    var v = (el.value || '').trim();
    if (el.type === 'checkbox' && el.required && !el.checked) return el.dataset.msg || 'مطلوب';
    if (el.required && !v) return el.dataset.msg || 'هذه الخانة مطلوبة';
    if (!v) return '';
    if (el.minLength > 0 && v.length < el.minLength) return el.dataset.msgShort || ('على الأقل ' + ar(el.minLength) + ' حروف');
    if (el.pattern && !new RegExp('^(?:' + el.pattern + ')$').test(toLatin(v))) return el.dataset.msgPattern || 'اكتبها بشكل صحيح';
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'اكتب إيميلًا صحيحًا';
    if (el.dataset.match) {
      var other = document.querySelector(el.dataset.match);
      if (other && other.value !== el.value) return el.dataset.msgMatch || 'لا تطابق ما كتبته بالأعلى';
    }
    if (el.type === 'number' || el.inputMode === 'numeric') {
      if (el.min !== '' && +toLatin(v) < +el.min) return el.dataset.msgRange || ('أقل قيمة ' + ar(el.min));
      if (el.max !== '' && +toLatin(v) > +el.max) return el.dataset.msgRange || ('أكبر قيمة ' + ar(el.max));
    }
    return '';
  }

  /* only what is visible counts (hidden conditional parts are skipped) */
  function visible(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }

  function validate(root) {
    var firstBad = null;
    root.querySelectorAll('.field.has-error').forEach(clearError);
    root.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.disabled || el.type === 'radio' || (el.type === 'checkbox' && !el.required) || el.type === 'file' && !el.required) return;
      var field = fieldOf(el);
      if (!visible(field)) return;
      var msg = checkOne(el);
      if (msg) { setError(field, msg); firstBad = firstBad || field; }
    });
    /* radio groups and "pick at least one" groups */
    root.querySelectorAll('[data-required-group]').forEach(function (field) {
      if (!visible(field)) return;
      var min = +(field.dataset.minChecked || 1);
      var n = field.querySelectorAll('input:checked').length;
      if (n < min) { setError(field, field.dataset.msg || 'اختر من فضلك'); firstBad = firstBad || field; }
    });
    if (firstBad) {
      firstBad.classList.remove('shake'); void firstBad.offsetWidth; firstBad.classList.add('shake');
      var r = firstBad.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight - 100) window.scrollTo({ top: window.scrollY + r.top - 110, behavior: 'smooth' });
      var focusable = firstBad.querySelector('input:not([type="radio"]):not([type="checkbox"]), select, textarea');
      if (focusable) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 260);
      M.haptic && M.haptic([12, 40, 12]);
    }
    return !firstBad;
  }

  /* errors disappear as soon as the person fixes the field */
  document.addEventListener('input', function (e) {
    var f = e.target.closest && e.target.closest('.field.has-error');
    if (f && !checkOne(e.target)) clearError(f);
  });
  document.addEventListener('change', function (e) {
    var f = e.target.closest && e.target.closest('.field.has-error');
    if (!f) return;
    if (f.hasAttribute('data-required-group')) {
      if (f.querySelectorAll('input:checked').length >= +(f.dataset.minChecked || 1)) clearError(f);
    } else if (!checkOne(e.target)) clearError(f);
  });

  M.Forms = { enhance: enhance, validate: validate, setError: setError, clearError: clearError, ar: ar, toLatin: toLatin };
})(window.Manasa);
