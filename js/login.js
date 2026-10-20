/* =========================================================
   Login: student/guardian or teacher, by phone + password.
   A phone shared by several students (a family) asks for the
   student number before signing in.

   There is no backend yet: ACCOUNTS below stands in for it.
   ========================================================= */
window.Manasa = window.Manasa || {};
window.Manasa.Pages = window.Manasa.Pages || {};

(function (M) {
  'use strict';

  /* demo data until the API exists (password for all: 123456) */
  var ACCOUNTS = [
    { id: '20117', role: 'teacher', phone: '01011112222', name: 'أ. محمود عبد الرحمن' },
    { id: '10230', role: 'student', phone: '01055556666', name: 'عبد الله' },
    { id: '10234', role: 'student', phone: '01033334444', name: 'يوسف', kid: true },
    { id: '10235', role: 'student', phone: '01033334444', name: 'مريم', kid: true }
  ];
  var PASSWORD = '123456';

  function reduce() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap; }

  function reveal(box, show) {
    if (show === !box.hidden) return;
    if (reduce()) { box.hidden = !show; return; }
    if (show) {
      box.hidden = false;
      gsap.fromTo(box, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .45, ease: 'power3.out', clearProps: 'height' });
    } else {
      gsap.to(box, { height: 0, opacity: 0, duration: .3, ease: 'power2.in', onComplete: function () { box.hidden = true; box.style.height = ''; box.style.opacity = ''; } });
    }
  }

  M.Pages.login = function () {
    var form = document.querySelector('[data-login]');
    if (!form) return;
    var F = M.Forms;
    var phone = form.querySelector('[name="phone"]');
    var shared = form.querySelector('[data-shared]'), sharedInput = form.querySelector('[name="shared_account"]');
    var err = form.querySelector('[data-login-error]'), ok = form.querySelector('[data-login-ok]');
    var btn = form.querySelector('[data-login-submit]');

    function role() { return form.querySelector('[name="role"]:checked').value; }
    function showError(msg) {
      err.querySelector('span').textContent = msg;
      reveal(err, true);
      err.classList.remove('shake'); void err.offsetWidth; err.classList.add('shake');
      M.haptic && M.haptic([12, 40, 12]);
    }

    form.querySelector('[data-forgot]').addEventListener('click', function () {
      var box = form.querySelector('[data-forgot-box]'); reveal(box, box.hidden);
    });

    /* changing role or phone resets the "shared phone" question */
    form.querySelectorAll('[name="role"]').forEach(function (r) {
      r.addEventListener('change', function () { reveal(shared, false); sharedInput.required = false; reveal(err, false); });
    });
    phone.addEventListener('input', function () { if (!shared.hidden) { reveal(shared, false); sharedInput.required = false; } reveal(err, false); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      reveal(err, false);
      if (!F.validate(form)) return;

      /* find the account */
      var r = role(), found;
      var num = F.toLatin(phone.value).replace(/\D/g, '');
      var matches = ACCOUNTS.filter(function (a) { return a.phone === num && a.role === r; });
      if (matches.length > 1) {
        if (shared.hidden) {
          sharedInput.required = true;
          reveal(shared, true);
          setTimeout(function () { sharedInput.focus(); }, 350);
          M.haptic && M.haptic([8, 30, 8]);
          return;
        }
        found = matches.filter(function (a) { return a.id === F.toLatin(sharedInput.value.trim()); });
        if (!found.length) { showError('رقم الطالب هذا ليس من الطلاب المرتبطين بالرقم. راجعه مرة أخرى.'); return; }
      } else found = matches;

      btn.classList.add('is-loading'); btn.disabled = true;
      setTimeout(function () {
        btn.classList.remove('is-loading'); btn.disabled = false;
        if (!found.length) {
          var other = ACCOUNTS.some(function (a) { return a.phone === num && a.role !== r; });
          showError(other
            ? (r === 'teacher' ? 'هذا الرقم مسجّل كطالب لا كمعلّم. غيّر نوع الحساب من الأعلى.' : 'هذا الرقم مسجّل كمعلّم. اختر «معلّم» من الأعلى.')
            : 'هذا الرقم غير مسجّل لدينا. إن كنت جديدًا فسجّل أولًا.');
          return;
        }
        if (form.querySelector('[name="password"]').value !== PASSWORD) { showError('كلمة المرور غير صحيحة.'); return; }

        var a = found[0];
        /* the loader's logo from now on: the child for a young student, the young man otherwise */
        var look = a.role === 'student' && a.kid ? 'kids' : 'adults';
        document.documentElement.dataset.loader = look;
        try { sessionStorage.setItem('manasa:user', JSON.stringify(a)); sessionStorage.setItem('manasa:look', look); } catch (x) {}
        ok.querySelector('span').textContent = 'أهلًا ' + a.name + '، جارٍ فتح ' + (a.role === 'teacher' ? 'لوحة المعلّم…' : 'صفحتك…');
        reveal(ok, true);
        btn.querySelector('.lbl').textContent = 'تم الدخول';
        M.haptic && M.haptic([10, 50, 20]);
        if (!reduce()) gsap.fromTo(btn, { scale: .96 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
        var dest = a.role === 'teacher' ? 'teacher.html' : 'student.html?id=' + a.id;
        setTimeout(function () { M.leave ? M.leave(dest) : (window.location.href = dest); }, 900);
      }, 700);
    });
  };
})(window.Manasa);
