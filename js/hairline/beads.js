/**
 * Beads: a misbaha of thirty-three beads lying in a loop on the ground, the
 * long imam bead standing where the loop closes and its tassel spread out
 * towards the viewer. Counting moves beads along the string: the pointer's
 * place on the loop is the count, the beads up to it slide together on one
 * side, the rest on the other, and a gap opens between them where the thumb
 * is; the bead just counted hops. At rest none is counted: all lie gathered
 * at the far end and the imam bead is bright. The slider is how tightly the
 * beads gather, so how wide the gap opens.
 *
 * The pattern: discrete items along a path. Tweens, a stagger by distance
 * along the string, and a hit test on the loop itself, which never moves.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, unproj, tween, tset, tval, tdone, mk, open, pointer, put, register, disposer, solid } = HL;

const N = 33, A = 64, B = 50, GAP = 15, HOP = 7, STAGGER = 32, SQ = Math.SQRT1_2;
// the loop, in screen-aligned ground axes: h runs to the right, v towards the viewer; a teardrop, its tip near
const curve = (t) => [A * Math.sin(t) * (0.72 + 0.28 * Math.cos(t)), -B * Math.cos(t)];
const ground = (h, v) => [(h + v) * SQ, (v - h) * SQ];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pack = value;

  // Walk the loop finely: arc length s from one side of the tip, round, to the other.
  const pts = [], M = 720;
  for (let k = 0; k <= M; k++) { const [h, v] = curve(Math.PI + (k / M) * 2 * Math.PI); pts.push(ground(h, v).concat(v)); }
  const acc = [0];
  for (let k = 1; k <= M; k++) acc.push(acc[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const L = acc[M], step = (L - 2 * GAP) / (N - 1), R = step * 0.33, H = R * 1.5;
  function at(s) {
    let lo = 1, hi = M;
    while (lo < hi) { const m = (lo + hi) >> 1; if (acc[m] < s) lo = m + 1; else hi = m; }
    const k = lo, f = clamp((s - acc[k - 1]) / (acc[k] - acc[k - 1] || 1), 0, 1);
    return [0, 1, 2].map((j) => pts[k - 1][j] + (pts[k][j] - pts[k - 1][j]) * f);
  }

  /* where bead i lies when `count` beads are counted: counted ones gathered at the start, the others at the end */
  const tight = () => 2 * R + (step - 2 * R) * (1 - pack);
  const place = (i, count) => (i < count ? GAP + i * tight() : L - GAP - (N - 1 - i) * tight());
  const beads = [];
  for (let i = 0; i < N; i++) beads.push({ i, s: tween(place(i, 0)), z: tween(0), drawn: NaN, dz: NaN, v: 0 });
  const tip = curve(Math.PI), [ix, iy] = ground(tip[0], tip[1] + 4), IR = R * 1.05, IH = R * 4.4;

  const C = Cam(45, 0.5, 2.5);
  const ext = [];
  for (let k = 0; k <= M; k += 12) ext.push([pts[k][0] - R, pts[k][1] - R, 0], [pts[k][0] + R, pts[k][1] + R, H + HOP]);
  fit(C, ext.concat([[ix, iy, IH + R * 1.4], ground(0, tip[1] + 30).concat(0)]), 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const string = mk("path", { class: "nf lo" }, g);            // painted first: the beads cover it, it shows between them
  const bg = mk("g", {}, g);
  for (const b of beads) b.el = solid(bg);
  const imam = solid(g), cap = solid(g);
  {
    const [r, n] = rings(ix - IR, iy - IR, ix + IR, iy + IR, IR, 0.8);
    put(imam, prism(P, front, r, n, 0, IH));
    const [r2, n2] = rings(ix - R * 0.7, iy - R * 0.7, ix + R * 0.7, iy + R * 0.7, R * 0.7, 0.5);
    put(cap, prism(P, front, r2, n2, IH, IH + R * 1.2));
  }
  const tassel = mk("path", { class: "nf" }, g);                // lying on the ground in front of the imam bead
  {
    let d = "";
    for (let k = -2; k <= 2; k++) {
      const a = [ground(k * 1.4, tip[1] + 4 + IR), ground(k * 4, tip[1] + 13), ground(k * 6.5, tip[1] + 27)];
      d += open([P(a[0][0], a[0][1], 0.6), P(a[1][0], a[1][1], 0.3), P(a[2][0], a[2][1], 0)]);
    }
    tassel.setAttribute("d", d);
  }

  let order = "";
  function drawAll(now) {
    let moving = false, changed = false;
    for (const b of beads) {
      const s = tval(b.s, now), z = tval(b.z, now);
      if (!tdone(b.s, now) || !tdone(b.z, now)) moving = true;
      if (s === b.drawn && z === b.dz) continue;
      b.drawn = s; b.dz = z; changed = true;
      const [x, y, v] = at(s);
      b.x = x; b.y = y; b.v = v;
      const [r, n] = rings(x - R, y - R, x + R, y + R, R, 0.7);
      put(b.el, prism(P, front, r, n, HOP * z, HOP * z + H));
    }
    if (changed) {
      const ends = P(ix, iy, H / 2);
      string.setAttribute("d", open([ends].concat(beads.map((b) => P(b.x, b.y, HOP * b.dz + H / 2)), [ends])));
      // far to near: beads that slid round the loop may have changed places in depth
      const sorted = beads.slice().sort((a, b) => a.v - b.v), key = sorted.map((b) => b.i).join();
      if (key !== order) { order = key; sorted.forEach((b) => bg.appendChild(b.el.g)); }
    }
    return moving;
  }
  const B2 = register(stage, (_dt, now) => drawAll(now));
  bag.add(B2.unregister);

  // Hit: the pointer on the ground, matched to the nearest point of the loop; its place along the loop is the count.
  function hit(p) {
    const [wx, wy] = unproj(C, p[0], p[1], H / 2);
    let best = -1, bd = step * 1.6;
    for (let k = 0; k <= M; k++) { const d = Math.hypot(wx - pts[k][0], wy - pts[k][1]); if (d < bd) { bd = d; best = k; } }
    return best < 0 ? -1 : clamp(Math.round((acc[best] - GAP) / step), 0, N - 1) + 1;
  }

  let count = -1;
  function setCount(c) {
    if (c === count) return;
    const now = performance.now(), from = c > 0 ? c - 1 : Math.max(0, count - 1);
    count = c;
    const n = Math.max(0, c);
    for (const b of beads) {
      tset(b.s, place(b.i, n), now, Math.abs(b.i - from) * STAGGER);
      tset(b.z, c > 0 && b.i === c - 1 ? 1 : 0, now, 0);
      b.el.sil.classList.toggle("hi", c > 0 && b.i === c - 1);
    }
    imam.sil.classList.toggle("hi", c <= 0);
    read.textContent = c > 0 ? "bead " + c : "rest";
    B2.wake();
  }
  setCount(0);

  bag.add(pointer(stage, { move: (p) => { const c = hit(p); setCount(c < 0 ? 0 : c); }, leave: () => setCount(0) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pack = v; const c = count; count = -2; setCount(c); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "beads",
  means: "A misbaha of thirty-three beads: the pointer counts along the string, and the counted beads slide apart from the rest.",
  rules: [1, 2, 5, 6],
  range: [0.2, 0.55, 0.9],
  tour: [[130, 190], [205, 100], [285, 170], null],
  mount,
});
