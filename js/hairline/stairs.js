/**
 * Stairs: thirty open treads climbing away from the viewer in a gentle bend,
 * one for each juz: the nearest is the 30th, where memorising starts, the
 * farthest the 1st.
 * The step under the pointer lifts and takes the bright edge; its neighbours
 * lift less, staggered out from it, so the climb seems to answer the hand.
 * At rest the top step is bright: the goal. The slider is the reach, in steps.
 *
 * The pattern: discrete items at different heights. Tweens, a stagger by
 * distance, and a hit test against each step's resting top (rule 01).
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, unproj, tween, tset, tval, tdone,
  mk, pointer, put, register, disposer, solid,
} = HL;

const N = 30, W = 40, D = 6.4, H = 4, T = 2.8, LIFT = 16, PUSH = 20, STAGGER = 38, BEND = 16;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;

  // Step i: 0 is juz 30 (nearest, lowest), N-1 is juz 1 (farthest, highest).
  // Each tread floats at its own height; the flight bends out and back along x.
  const y0 = (i) => (N - 1 - i) * D, top = (i) => (i + 1) * H + 2;
  const xs = (i) => BEND * Math.sin((i / (N - 1)) * Math.PI);
  const C = Cam(45, 0.5, 1.36);
  fit(C, [[0, 0, 0], [W + BEND, N * D, 0], [W, 0, top(N - 1) + LIFT], [0, 0, top(N - 1) + LIFT], [W, N * D, top(0) + LIFT], [W + BEND + PUSH, N * D / 2, top(N >> 1) + LIFT], [W + PUSH, N * D, top(0) + LIFT], [W + PUSH, 0, top(N - 1) + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg), steps = [];
  // A low landing under the first tread, where the climb starts.
  const [pr, pi] = rings(-6, y0(0) - 4, W + 6, y0(0) + D + 10, 5, 1.6);
  put(solid(g), prism(P, front, pr, pi, -3, 0));
  // Far (top) to near (bottom): appending is painting back to front.
  for (let i = N - 1; i >= 0; i--) {
    steps[i] = { i, h: top(i), z: tween(0), el: solid(g), drawn: NaN };
  }

  /* a step answering rises and slides out towards the viewer, by the same share t (0..1) */
  function draw(s, t) {
    if (t === s.drawn) return;
    s.drawn = t;
    const x = xs(s.i) + PUSH * t, lift = LIFT * t;
    const [ring, inner] = rings(x, y0(s.i) + 0.3, x + W, y0(s.i) + D - 0.3, 1.8, 0.8);
    put(s.el, prism(P, front, ring, inner, s.h - T + lift, s.h + lift));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const s of steps) { draw(s, tval(s.z, now)); if (!tdone(s.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // Hit: the pointer on each step's RESTING top; take the step whose middle it lands nearest.
  function hit(p) {
    let best = -1, bd = Infinity;
    for (const s of steps) {
      const [wx, wy] = unproj(C, p[0], p[1], s.h);
      if (wx < xs(s.i) - 4 || wx > xs(s.i) + W + 4) continue;
      const d = Math.abs(wy - (y0(s.i) + D / 2));
      if (d < D * 0.75 && d < bd) { bd = d; best = s.i; }
    }
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : N - 1;
    act = a;
    for (const s of steps) {
      const k = a >= 0 ? Math.abs(s.i - a) : Infinity;
      const t = k === Infinity ? 0 : clamp(1 - k / (reach + 1), 0, 1);
      tset(s.z, t, now, Math.abs(s.i - from) * STAGGER);
      s.el.sil.classList.toggle("hi", a >= 0 ? s.i === a : s.i === N - 1);
    }
    read.textContent = a >= 0 ? "juz " + (N - a) : "rest";
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; const a = act; act = -2; setActive(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "stairs",
  means: "Thirty steps, one for each juz: the one under the pointer lifts, and the climb answers around it.",
  rules: [1, 2, 3, 5],
  range: [2, 4, 8],
  tour: [[150, 236], [200, 170], [250, 104], null],
  mount,
});
