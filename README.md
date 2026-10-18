# manasa-frontend

Frontend for the Quran memorization academy (رتّل / أُنس). Plain HTML + CSS + JS, served directly by Apache.

## Run

Put the folder at `/var/www/html/manasa-frontend` and open `http://localhost/manasa-frontend/`.

## Structure

```
index.html
css/
  tokens.css     colors, fonts, spacing; the 3 palettes (navy default, green, emerald)
  base.css       reset, typography, buttons, wordmarks, touch ripple
  symbols.css    «النقش المتحرك»: background Islamic line icons (draw → rest → erase)
  header.css     desktop header, mobile tab bar + "المزيد" menu
  hero.css       first screen
  switcher.css   name/palette picker (popover on desktop, bottom sheet on mobile)
  slogan.css     slogan under the hero logo + the slogan band
  sections.css   shared section layout (grounds, headings, chips)
  programs.css   البرامج
  how.css        كيف نعمل
  family.css     متابعة الأسرة
  types.css      فردية أم مجلس
  teach.css      انضم كمعلّم
  faq.css        الأسئلة الشائعة
  cta.css        الدعوة الأخيرة + الفوتر
js/
  vendor/        gsap 3.12.5, ScrollTrigger, lenis 1.1.13 (local copies)
  brand.js       name + palette state, saved in localStorage
  logo-waves.js  animated frequency bars on the logo
  symbols.js     scatters background symbols at random
  header.js      header scroll behavior, mobile menu, tabs
  hero.js        hero intro, 3D tilt, parallax
  slogan.js      slogan band: ornaments draw + words rise on scroll
  reveal.js      scroll reveals; pauses off-screen sections
  programs.js    البرامج tabs / swipe / journey / week
  sections.js    كيف نعمل steps, family preview, FAQ, tab-bar spy
  main.js        smooth scroll, anchors, ripples, init order
images/
  logo/          academy / adults / kids logos per palette; academy-*-nowave = bars removed
  brand/         أُنس wordmark, favicon
```

## Decisions so far

- Default palette: كحلي وذهبي. Also available: أخضر وبرتقالي، ذهبي وزمردي.
- Names: رتّل (default) and أُنس (Kufi with star).
- Fonts: Reem Kufi (headings), IBM Plex Sans Arabic (text), Amiri Quran (ayat), Baloo Bhaijaan 2 (kids).
- Logo bars: erased from the image and redrawn as moving SVG bars.
- Mobile: bottom tab bar + "المزيد" full menu; name/palette in a bottom sheet and inside the menu.
- Slogan: رتّل «اقرأ، وارتقِ، ورتّل» / أُنس «في صُحبة القرآن… أُنس». Shown under the header logo (replaces the tagline), under the big hero logo, in a large band after the hero (css/slogan.css, js/slogan.js) — and in the footer once it's built.
- English version: postponed.
- Homepage sections: Hero → slogan band → البرامج → كيف نعمل → متابعة الأسرة → فردية أم مجلس → انضم كمعلّم → الأسئلة الشائعة → الدعوة الأخيرة → الفوتر.
- Kids program: ages 5–12.
- Phone/tablet hero: big logo with the adults/kids emblems → slogan → ayah, title, buttons → the two cards (js/hero.js moves them below 960px). Desktop: cards float around the logo.
- البرامج: kids journey = «السور تنط» (surahs pop in, path draws itself); phones = tabs + swipe.
- Placeholders still to fill: payment methods (FAQ), WhatsApp number and email (footer).
- Built page by page, section by section.
- «النقش المتحرك» = the background line symbols (css/symbols.css + js/symbols.js): 38 Islamic line icons scattered at random; each line draws slowly, rests, then erases slowly (21–32s per cycle).

## Cache busting

Every local css/js link in index.html carries `?v=<timestamp>`. Bump it on each deploy so browsers (and phones) load the new files:

```bash
sed -i -E "s#\?v=[0-9]+#?v=$(date +%Y%m%d%H%M)#g" index.html
```
