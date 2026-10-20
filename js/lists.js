/* =========================================================
   Shared option lists: phone codes and countries.
   Fills every <select data-codes> and <select data-countries>.
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  /* [country, phone code] — Egypt first, then the Arab world, then abroad */
  var COUNTRIES = [
    ['مصر', '+20'], ['السعودية', '+966'], ['الإمارات', '+971'], ['الكويت', '+965'], ['قطر', '+974'],
    ['البحرين', '+973'], ['عُمان', '+968'], ['الأردن', '+962'], ['فلسطين', '+970'], ['لبنان', '+961'],
    ['سوريا', '+963'], ['العراق', '+964'], ['اليمن', '+967'], ['السودان', '+249'], ['ليبيا', '+218'],
    ['تونس', '+216'], ['الجزائر', '+213'], ['المغرب', '+212'], ['موريتانيا', '+222'],
    ['تركيا', '+90'], ['ماليزيا', '+60'], ['إندونيسيا', '+62'], ['باكستان', '+92'],
    ['بريطانيا', '+44'], ['ألمانيا', '+49'], ['فرنسا', '+33'], ['هولندا', '+31'], ['بلجيكا', '+32'],
    ['السويد', '+46'], ['إيطاليا', '+39'], ['إسبانيا', '+34'], ['أمريكا', '+1'], ['كندا', '+1'], ['أستراليا', '+61']
  ];

  function fill(root) {
    (root || document).querySelectorAll('select[data-codes]').forEach(function (sel) {
      if (sel.options.length) return;
      var seen = {};
      sel.innerHTML = COUNTRIES.filter(function (c) { if (seen[c[1]]) return false; seen[c[1]] = 1; return true; })
        .map(function (c, i) { return '<option value="' + c[1] + '"' + (i === 0 ? ' selected' : '') + '>' + c[1] + ' ' + c[0] + '</option>'; }).join('');
    });
    (root || document).querySelectorAll('select[data-countries]').forEach(function (sel) {
      if (sel.options.length) return;
      sel.innerHTML = '<option value="" disabled selected>اختر الدولة</option>' +
        COUNTRIES.map(function (c) { return '<option>' + c[0] + '</option>'; }).join('') + '<option>دولة أخرى</option>';
    });
  }

  /* picking a phone code pre-selects the matching country (and back) */
  function link(form) {
    var code = form.querySelector('select[data-codes]'), country = form.querySelector('select[data-countries]');
    if (!code || !country) return;
    code.addEventListener('change', function () {
      if (country.value) return;
      var hit = COUNTRIES.filter(function (c) { return c[1] === code.value; })[0];
      if (hit) { country.value = hit[0]; country.dispatchEvent(new Event('change', { bubbles: true })); }
    });
  }

  fill(document);
  M.Lists = { COUNTRIES: COUNTRIES, fill: fill, link: link };
})(window.Manasa);
