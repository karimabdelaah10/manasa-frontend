/* =========================================================
   Header + mobile navigation
   - header turns solid after a little scroll
   - hides while scrolling down, comes back on scroll up
   - "المزيد" tab opens the full menu with a circle reveal
     that grows from the tab itself
   ========================================================= */
window.Manasa = window.Manasa || {};

(function (M) {
  'use strict';

  function initScroll(header) {
    var lastY = window.scrollY, ticking = false;
    function update() {
      var y = window.scrollY;
      header.classList.toggle('is-solid', y > 24);
      if (y > 220 && y - lastY > 6) header.classList.add('is-hidden');
      else if (lastY - y > 6 || y < 220) header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;
    var items = menu.querySelectorAll('li, .menu-brand, .menu-actions');

    function open() {
      var r = toggle.getBoundingClientRect();
      menu.style.setProperty('--origin-x', (r.left + r.width / 2) + 'px');
      menu.style.setProperty('--origin-y', (r.top + r.height / 2) + 'px');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.querySelector('[data-header]').classList.remove('is-hidden');
      if (M.lenis) M.lenis.stop();
      if (window.gsap) {
        gsap.fromTo(items, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, delay: .2, ease: 'power3.out', overwrite: true });
      }
    }
    function close() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (M.lenis) M.lenis.start();
    }
    M.closeMenu = close;

    toggle.addEventListener('click', function () {
      M.haptic && M.haptic();
      menu.classList.contains('is-open') ? close() : open();
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function initTabs() {
    var tabs = document.querySelectorAll('.tabbar a.tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) { o.removeAttribute('aria-current'); });
        t.setAttribute('aria-current', 'page');
        M.haptic && M.haptic();
      });
    });
    var main = document.querySelector('.tab-main');
    if (main) main.addEventListener('click', function () { M.haptic && M.haptic(12); });
  }

  function init() {
    var header = document.querySelector('[data-header]');
    if (header) initScroll(header);
    initMenu();
    initTabs();
  }

  M.Header = { init: init };
})(window.Manasa);
