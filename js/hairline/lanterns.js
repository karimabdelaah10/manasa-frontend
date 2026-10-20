/**
 * Lanterns: seven Ramadan fanous hanging at different drops from a rope that
 * sags between two posts. Each fanous has its foot, a cone under the glass, the
 * glass body with its ribs, a brim, a pointed roof and the ring it hangs by.
 * The pointer touches a fanous: it lights (a flame stands in its glass and its
 * outline takes the bright stroke) and swings; its neighbours swing less, a
 * moment later, outward from it. At rest the middle one is lit. The slider is
 * how hard the touch pushes, so how far they swing. The lit one's door stands open.
 *
 * The pattern: one of many, with a pendulum: a lightly damped spring per
 * fanous, kicked on a change of choice (rule 08: a pendulum swings, so the
 * damping is below the default on purpose). The hit test reads each fanous's
 * resting centre on screen (rule 01).
 */
const { Cam, clamp, fit, proj, hull, poly, open, seg, spring, stepS, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const GAPH = 30, TOP = 74, SAG = 12, POST = 104, SQ = Math.SQRT1_2, STAGGER = 70;
const world = (h, d, z) => [(h + d) * SQ, (d - h) * SQ, z];      // h runs right on screen, d towards the viewer
// a fanous, its foot at z = 0: [z0, r0, z1, r1] for each part, bottom to top
const PROFILE = [[0, 3.2, 1.6, 3.2], [1.6, 3.6, 6, 7.5], [6, 7.5, 17, 7.5], [17, 8.6, 18.4, 8.6], [18.4, 8, 24.5, 2], [24.5, 1.4, 27, 1.4]];
const HANG = 30.2;                                                  // the ring's centre, above the foot
const DROPS = [9, 17, 12, 22, 13, 18, 8], SIZES = [0.9, 1.05, 0.95, 1.15, 0.95, 1.05, 0.9];
const LOOKS = ['a', 'b', 'c'];   // the site colours each fanous by one of three looks

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let push = value;
  /* on the site the stage may be any shape (the footer's is a wide strip): as many lanterns as fit, the rope across it */
  const vb = svg.viewBox.baseVal, wide = vb.width !== 400 || vb.height !== 320;
  const N = wide ? clamp(Math.round(vb.width / 72), 3, 21) : 7;
  const hs = (i) => (i - (N - 1) / 2) * GAPH;
  const rope = (h) => TOP - SAG * (1 - (h / (GAPH * (N + 0.4) / 2)) ** 2);
  const fans = [];
  for (let i = 0; i < N; i++) {
    const h = hs(i), k = SIZES[i % 7], pz = rope(h) - DROPS[i % 7];
    fans.push({ i, h, k, pz, top: rope(h), sp: spring(0, { c: 3.2, k: 60, eps: 0.0005 }), door: tween(0), kick: null, drawn: NaN });
  }

  const C = Cam(45, 0.5, wide ? Math.min((vb.width * 0.96) / (GAPH * (N + 0.4)), (vb.height * 0.9) / 118) : 1.62);
  const ex = [world(-GAPH * (N + 0.8) / 2, 0, 0), world(GAPH * (N + 0.8) / 2, 0, 0), world(0, 0, POST + 4)];
  for (const f of fans) for (const s of [-1, 1]) ex.push(world(f.h + s * 14, 0, f.pz - HANG * f.k - 18), world(f.h + s * 14, 9, f.pz));
  fit(C, ex, wide ? vb.x + vb.width / 2 : 200, wide ? vb.y + vb.height / 2 : 170);
  const P = proj(C);

  /* local fanous point (x right, y towards the viewer, z up from the foot) → screen, swung by th about its ring */
  const LOWER = 18;                                                // the lit one is let down on its cord to be lit
  const put3 = (f, th, low = 0) => (x, y, z) => {
    x *= f.k; y *= f.k; z = (z - HANG) * f.k;
    const c = Math.cos(th), s = Math.sin(th), X = x * c + z * s, Z = -x * s + z * c;
    const w = world(f.h + X, y, f.pz - LOWER * low + Z);
    return P(w[0], w[1], w[2]);
  };
  const ring = (r, z, n = 28) => { const o = []; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; o.push([r * Math.cos(a), r * Math.sin(a), z]); } return o; };
  const front = (r, z) => { const o = []; for (let k = 0; k <= 16; k++) { const a = (k / 16) * Math.PI; o.push([r * Math.cos(a), r * Math.sin(a), z]); } return o; };

  const g = mk("g", {}, svg);
  // the posts and the rope, behind the lanterns
  const posts = [];
  for (const s of [-1, 1]) {
    const h = s * GAPH * (N + 0.4) / 2, el = solid(g), w0 = world(h, 0, 0);
    const pts = [];
    for (const z of [0, POST]) for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; const w = world(h + 1.6 * Math.cos(a), 1.6 * Math.sin(a), z); pts.push(P(w[0], w[1], w[2])); }
    put(el, { sil: poly(hull(pts)), crease: "" });
    el.g.setAttribute("class", "lt-post");
    const foot = solid(g), fp = [];
    foot.g.setAttribute("class", "lt-post");
    for (const z of [0, 2]) for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; const w = world(h + 6 * Math.cos(a), 6 * Math.sin(a), z); fp.push(P(w[0], w[1], w[2])); }
    put(foot, { sil: poly(hull(fp)), crease: "" });
    posts.push(w0);
  }
  const ropeEl = mk("path", { class: "nf lt-rope" }, g);
  {
    const pts = [];
    for (let k = 0; k <= 60; k++) { const h = -GAPH * (N + 0.4) / 2 + (k / 60) * GAPH * (N + 0.4), w = world(h, 0, rope(h)); pts.push(P(w[0], w[1], w[2])); }
    // the rope runs from post top to post top
    const a = world(-GAPH * (N + 0.4) / 2, 0, POST), b = world(GAPH * (N + 0.4) / 2, 0, POST);
    ropeEl.setAttribute("d", open([P(a[0], a[1], a[2])].concat(pts, [P(b[0], b[1], b[2])])));
  }
  for (const f of fans) {
    f.g = mk("g", { class: "lt lt--" + LOOKS[f.i % 3] }, g);
    f.cord = mk("path", { class: "nf lo lt-cord" }, f.g);
    f.parts = PROFILE.map((_, k) => { const el = solid(f.g); el.g.setAttribute("class", k === 2 ? "lt-glass" : "lt-metal"); return el; });
    f.ribs = mk("path", { class: "nf lo lt-ribs" }, f.g);
    f.flame = mk("path", { class: "nf lt-flame" }, f.g);
    f.doorEl = mk("path", { class: "lt-door" }, f.g);                                  // the glass door, opened to light the candle
    f.hook = mk("path", { class: "nf lt-cord" }, f.g);
  }

  const AH = Math.PI / 2 + 0.39, AF = Math.PI / 2 - 0.39, RB = 7.5;
  function drawFan(f, th, lit, open01) {
    const T = put3(f, th, open01);
    f.parts.forEach((el, k) => {
      const [z0, r0, z1, r1] = PROFILE[k];
      const sil = poly(hull(ring(r0, z0).concat(ring(r1, z1)).map((p) => T(p[0], p[1], p[2]))));
      put(el, { sil, crease: k === 3 ? open(front(r1 - 0.7, z1).map((p) => T(p[0], p[1], p[2]))) : "" });
    });
    let d = "";
    for (const a of [0.55, 1.0, 1.57, 2.14, 2.6]) d += seg(T(7.5 * Math.cos(a), 7.5 * Math.sin(a), 6.6), T(7.5 * Math.cos(a), 7.5 * Math.sin(a), 16.4));
    f.ribs.setAttribute("d", d);
    // the ring it hangs by, and the cord up to the rope
    const hook = [];
    for (let k = 0; k <= 20; k++) { const a = (k / 20) * Math.PI * 2; hook.push(T(1.8 * Math.cos(a), 0, HANG + 1.8 * Math.sin(a))); }
    f.hook.setAttribute("d", open(hook));
    const r = world(f.h, 0, f.top);
    f.cord.setAttribute("d", seg(T(0, 0, HANG + 1.8), P(r[0], r[1], r[2])));
    // a flame standing in the glass of the lit one
    f.flame.setAttribute("d", open01 > 0.05 ? open([[0, 9], [-1.6, 11.2], [-0.6, 13.6], [0, 15], [0.6, 13.6], [1.6, 11.2], [0, 9]].map((p) => T(p[0] * open01, 7.6, 9 + (p[1] - 9) * open01))) : "");
    // the door: hinged on the left edge of the front pane, it swings out towards the viewer
    const hx = RB * Math.cos(AH), hy = RB * Math.sin(AH), dx = RB * Math.cos(AF) - hx, dy = RB * Math.sin(AF) - hy;
    const ps = open01 * 0.95, c = Math.cos(ps), s2 = Math.sin(ps), fx = hx + dx * c - dy * s2, fy = hy + dx * s2 + dy * c;
    f.doorEl.setAttribute("d", poly([T(hx, hy, 6.8), T(hx, hy, 16.6), T(fx, fy, 16.6), T(fx, fy, 6.8)]));
  }

  let act = -2, lit = (N - 1) >> 1;
  const B = register(stage, (dt, now) => {
    let moving = false;
    for (const f of fans) {
      if (f.kick && now >= f.kick.at) { f.sp.v += f.kick.v; f.kick = null; }
      if (f.kick) moving = true;
      if (stepS(f.sp, dt)) moving = true;
      const th = clamp(f.sp.x, -0.5, 0.5), op = tval(f.door, now), key = th + op * 9;
      if (!tdone(f.door, now)) moving = true;
      if (key !== f.drawn) { f.drawn = key; drawFan(f, th, f.i === lit, op); }
    }
    return moving;
  });
  bag.add(B.unregister);

  // Hit: each fanous's resting centre on screen; the nearest in x, if the pointer is level with the lanterns.
  const centre = fans.map((f) => put3(f, 0)(0, 0, 12));
  stage.dataset.autoStops = JSON.stringify(centre.map((c) => [Math.round(c[0]), Math.round(c[1])]));   // for the site's self-playing lap
  function hit(p) {
    let best = -1, bd = 22;
    for (const f of fans) { const c = centre[f.i], d = Math.abs(p[0] - c[0]); if (d < bd && Math.abs(p[1] - c[1]) < 42) { bd = d; best = f.i; } }
    return best;
  }
  let lastX = 200;
  function choose(a, dir) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    if (a >= 0) {
      lit = a;
      for (const f of fans) {
        const k = Math.abs(f.i - a), share = clamp(1 - k / 3.2, 0, 1);
        if (share > 0) f.kick = { at: now + k * STAGGER, v: dir * push * share * (f.i === a ? 1 : 0.6) };
      }
    } else lit = (N - 1) >> 1;
    for (const f of fans) { f.g.classList.toggle("is-lit", f.i === lit); f.parts.forEach((el) => el.sil.classList.toggle("hi", f.i === lit)); tset(f.door, f.i === lit ? 1 : 0, now, 0); f.drawn = NaN; }
    read.textContent = a >= 0 ? "lantern " + (a + 1) : "rest";
    B.wake();
  }
  choose(-1, 0);

  bag.add(pointer(stage, {
    move: (p) => { const dir = p[0] >= lastX ? 1 : -1; lastX = p[0]; choose(hit(p), dir); },
    leave: () => choose(-1, 0),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { push = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "lanterns",
  means: "Seven fanous on a sagging rope: the one under the pointer lights and swings, and its neighbours swing after it.",
  rules: [1, 2, 4, 5],
  range: [1.4, 2.6, 3.8],
  tour: [[120, 190], [200, 205], [285, 190], null],
  /* the site's own: where each fanous hangs, for the footer's lap that plays by itself */
  auto: [[54, 200], [103, 205], [151, 200], [200, 210], [249, 200], [297, 205], [346, 200]],
  mount,
});
