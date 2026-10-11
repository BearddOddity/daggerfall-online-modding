// PERF-VOL (2026-10-11, Mac: "Lets do the biggest remaining lever"): THE PLACED BATCHES' VOLUME ANSWERS, KEPT. The
// shadow pass asks every swaying placed batch of a lantern's reach whether any of its quads stands in each face
// (bounds.js placementsInVolume) - and under Steady shadows every face is redrawn every frame. Captured in the real game
// (Knightstale by night, the freeware ARENA2): 542 asks a frame, every one the frame before's to the bit. The planes are
// named by their bits (volumeName) and the answer kept on the batch's grid against every number the test reads
// (placementsInVolumeOf). These pins hold the kept answer to the asked one and to a walk of every placement - over
// random woods, lantern faces and cascades, frame after frame, each number moved alone - and the replay's draws to the
// replay's with nothing kept (SHADOW_TUNING.volumeMemo), and hold the saving by count. Never on a clock.
// PERF-ORDER, the same day and the same capture: two loops asked their dearest skip of every flat before their cheapest -
// the pixel walk the box and the shadow's reach before the far-flat rule (655 of 1,361 batches a frame then dropped), the
// air pass the sphere before the emission map (3 of 636 have one). Each test only skips, so the order is free; the last
// pin holds the air pass's emitters to the oracle and its sphere to the lit flats. The record is
// `bible/07-Rendering/Performance-Arena.md` (PERF-VOL, PERF-ORDER).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Renderer, WORLD_FRAME } from '../src/render/renderer.js';
import { EL_LANE } from '../src/render/enhancedLighting.js';
import { SHADOW_TUNING, pointFaceMatrices } from '../src/render/shadowPass.js';
import * as bounds from '../src/render/bounds.js';
import { ortho, lookAt, multiply } from '../src/world/mat4.js';

const { placementGrid, placementsInVolume, placementsInVolumeOf, volumeName, spherePlanes, sphereInPlanes, batchLift, VOLUME_MEMO_MAX, VOLUME_TABLE_MAX } = bounds;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** The oracle: every placement of the batch, in its frame, the lift folded in, against the planes - no grid, no cell. */
function anyQuad(b, rad, planes) {
  const p = b._place.pts, o = b.origin || bounds.ZERO_ORIGIN, ox = o[0], oy = o[1] + batchLift(b), oz = o[2];
  for (let i = 0; i < p.length; i += 3) if (sphereInPlanes(planes, p[i] + ox, p[i + 1] + oy, p[i + 2] + oz, rad)) return true;
  return false;
}
/** A lantern's six faces and a sun's cascade, as the pass makes them (pointFaceMatrices; an ortho box down a sun). */
function volumes(rand, n) {
  const out = [];
  while (out.length < n) {
    if (rand() < 0.75) {
      const faces = Array.from({ length: 6 }, () => new Float32Array(16));
      pointFaceMatrices([(rand() * 2 - 1) * 60, rand() * 6, (rand() * 2 - 1) * 60], 6 + rand() * 22, faces);
      for (const f of faces) out.push(spherePlanes(f, new Float32Array(24)));
    } else {
      const c = [(rand() * 2 - 1) * 40, 0, (rand() * 2 - 1) * 40], d = [0.4 + rand(), 0.6 + rand(), 0.3 + rand()];
      const half = 10 + rand() * 60;
      const vp = multiply(ortho(half, half, 0.1, 400), lookAt([c[0] + d[0] * 200, c[1] + d[1] * 200, c[2] + d[2] * 200], c, [0, 1, 0]), new Float32Array(16));
      out.push(spherePlanes(vp, new Float32Array(24)));
    }
  }
  return out.slice(0, n);
}
function wood(rand) {
  const n = 2 + Math.floor(rand() * 120), half = 10 + rand() * 90;
  const centers = Array.from({ length: n }, () => [(rand() * 2 - 1) * half, rand() * 3 - 1.5, (rand() * 2 - 1) * half]);
  return { _place: placementGrid(centers), centers, origin: [(rand() * 2 - 1) * 40, rand() * 2 - 1, (rand() * 2 - 1) * 40], size: { w: 1 + rand() * 3, h: (rand() < 0.1 ? -1 : 1) * (0.5 + rand() * 8) } };
}
/** A walk counter on a grid: a kept answer reads no placement. */
function counted(b) {
  const q = b._place, n = { walks: 0 };
  b._place = new Proxy(q, { get(t, k) { if (k === 'pts') n.walks++; return t[k]; }, set(t, k, v) { t[k] = v; return true; } });
  return n;
}

test('PERF-VOL: the kept answer is the asked answer - over random woods (one cell and sixteen, an upside-down flame\'s negative height), lantern faces and cascades, frame after frame through the replay\'s one reused Float32Array, with the radius, each origin axis (the array written in place, as a pixel\'s is), the height and a lantern\'s place each moved alone, a grid re-minted by a move, a NaN and a signed zero: every answer equals placementsInVolume\'s and a walk of every placement, each moved number flipped answers, and a still frame reads no placement (mutants: PERFVOL-no-rad, PERFVOL-no-ox, PERFVOL-no-oy, PERFVOL-no-oz, PERFVOL-no-h, PERFVOL-stale-answer, PERFVOL-one-memo)', () => {
  const rand = rng(7);
  const woods = Array.from({ length: 14 }, () => wood(rand));
  const vols = volumes(rand, 40);
  const rads = woods.map(() => 0.5 + rand() * 4);
  const live = new Float32Array(24);   // the replay's this._planes: one array, its content set per replay
  const flips = { rad: 0, ox: 0, oy: 0, oz: 0, h: 0, light: 0, move: 0 };
  let asks = 0, hits = 0, quietWalks = 0, quietAsks = 0;
  const kept = new Map();   // the answer each (wood, volume) gave the frame before
  const frame = (moved, quiet = false) => {
    const counts = woods.map((b) => (quiet ? counted(b) : null));
    for (let v = 0; v < vols.length; v++) {
      live.set(vols[v]);
      const name = volumeName(live);
      for (let w = 0; w < woods.length; w++) {
        const b = woods[w];
        const before = quiet ? counts[w].walks : 0;
        const got = placementsInVolumeOf(b, rads[w], live, name);
        if (quiet) quietWalks += counts[w].walks - before;
        const want = placementsInVolume(b, rads[w], live);
        assert.equal(got, want, `wood ${w}, volume ${v}: the kept answer is the asked one`);
        assert.equal(want, anyQuad(b, rads[w], live), `wood ${w}, volume ${v}: and the walk of every placement`);
        asks++; if (want) hits++;
        const k = `${w}|${v}`;
        if (moved && kept.has(k) && kept.get(k) !== want) flips[moved]++;
        kept.set(k, want);
        if (quiet) quietAsks++;
      }
    }
  };
  frame(null); frame(null);   // the first sight names nothing; the second names every volume and keeps its answers
  frame(null, true);          // a still frame: every answer kept
  for (let round = 0; round < 6; round++) {
    const w = Math.floor(rand() * woods.length), b = woods[w];
    // each number moved alone, then held for two frames (the frame after a move keeps the move's answer)
    rads[w] = rads[w] * (0.3 + rand() * 2.5); frame('rad'); frame(null);
    b.origin[0] += (rand() * 2 - 1) * 30; frame('ox'); frame(null);
    b.origin[1] += (rand() * 2 - 1) * 12; frame('oy'); frame(null);
    b.origin[2] += (rand() * 2 - 1) * 30; frame('oz'); frame(null);
    b.size.h = (rand() < 0.2 ? -1 : 1) * (0.5 + rand() * 14); frame('h'); frame(null);
    const v = Math.floor(rand() * vols.length);   // a lantern swung on its hook: its planes are new numbers
    const faces = Array.from({ length: 6 }, () => new Float32Array(16));
    pointFaceMatrices([(rand() * 2 - 1) * 60, rand() * 6, (rand() * 2 - 1) * 60], 6 + rand() * 22, faces);
    vols[v] = spherePlanes(faces[Math.floor(rand() * 6)], new Float32Array(24));
    frame('light'); frame(null); frame(null);
    // a move re-mints the grid (renderer.js moveBillboardBatch): the same centres shifted, a new object
    const dx = (rand() * 2 - 1) * 25;
    b.centers = b.centers.map((c) => [c[0] + dx, c[1], c[2]]); b._place = placementGrid(b.centers);
    frame('move'); frame(null);
  }
  for (const [k, n] of Object.entries(flips)) assert.ok(n > 0, `moving the ${k} alone flipped answers (${n})`);
  assert.ok(hits > asks / 10 && hits < asks * 0.9, `the asks fell both in and out (${hits} of ${asks})`);
  assert.equal(quietWalks, 0, `a still frame walked no placement (${quietWalks} walks over ${quietAsks} asks)`);
  // a NaN radius equals nothing kept: asked afresh, every time
  const b = woods[0], n = counted(b);
  live.set(vols[0]); const name = volumeName(live);
  for (let i = 0; i < 3; i++) assert.equal(placementsInVolumeOf(b, NaN, live, name), placementsInVolume(b, NaN, live), 'a NaN radius: the asked answer');
  assert.equal(n.walks, 6, `and asked afresh each time - its own walk and the check's (${n.walks})`);
  // a signed zero is the same number to the test: +0 kept, -0 asked, the answer one
  const z = { _place: placementGrid([[0, 0, 0], [0.5, 0, 0]]), origin: [0, 0, 0], size: { w: 1, h: 1 } };
  assert.equal(placementsInVolumeOf(z, 0, live, name), placementsInVolume(z, 0, live));
  z.origin[0] = -0;
  assert.equal(placementsInVolumeOf(z, -0, live, name), placementsInVolume(z, -0, live), 'a signed zero: the same answer');
});

test('PERF-VOL: volumeName - 0 at a set\'s first sight and for anything but a Float32Array(24) (a carried lantern\'s faces, a walking camera\'s cascades never repeat, and are never kept); a name from the second sight, the same name for the same bits in another array (a subarray of a larger buffer too), another for one word changed, another for two sets whose hash is the same (the words are compared, not the hash); and a name is never reused - past VOLUME_TABLE_MAX sets the table starts over, a set seen before it is first seen again, and the names go on counting (mutants: PERFVOL-named-at-first-sight, PERFVOL-hash-alone, PERFVOL-names-reused, PERFVOL-table-never-forgets, PERFVOL-renamed-every-sight)', () => {
  const rand = rng(21);
  const set = () => { const p = new Float32Array(24); for (let i = 0; i < 24; i++) p[i] = rand() * 2 - 1; return p; };
  const a = set();
  assert.equal(volumeName(a), 0, 'first sight: no name');
  const na = volumeName(a);
  assert.ok(na > 0, 'second sight: a name');
  assert.equal(volumeName(a), na, 'and the same name after');
  const buf = new Float32Array(40); buf.set(a, 7);
  assert.equal(volumeName(buf.subarray(7, 31)), na, 'the same bits in a view of another buffer: the same name');
  const b = Float32Array.from(a); b[23] = Math.fround(b[23] + 0.001);
  assert.equal(volumeName(b), 0); const nb = volumeName(b);
  assert.ok(nb > 0 && nb !== na, 'one word changed: another name');
  assert.equal(volumeName(Array.from(a)), 0, 'an Array: no name'); assert.equal(volumeName(Array.from(a)), 0, 'ever');
  assert.equal(volumeName(Float64Array.from(a)), 0, 'a Float64Array: no name'); assert.equal(volumeName(Float64Array.from(a)), 0, 'ever');
  assert.equal(volumeName(new Float32Array(23)), 0, 'a short array: no name'); assert.equal(volumeName(new Float32Array(23)), 0, 'ever');
  // two sets with one hash: FNV-1a's first two steps are undone by the second word - w1' = w1 ^ A(w0) ^ A(w0')
  const c = set(), cu = new Uint32Array(c.buffer);
  const A = (w) => Math.imul(2166136261 ^ w, 16777619) >>> 0;
  const d = Float32Array.from(c), du = new Uint32Array(d.buffer);
  for (let tries = 0; ; tries++) {
    du[0] = (cu[0] & 0xff800000) | ((cu[0] + 1 + tries) & 0x7fffff);
    du[1] = (cu[1] ^ A(cu[0]) ^ A(du[0])) >>> 0;
    if (((du[1] >>> 23) & 0xff) !== 0xff) break;   // a finite float, as a plane's is
  }
  const hash = (u) => { let h = 2166136261; for (let i = 0; i < 24; i++) h = Math.imul(h ^ u[i], 16777619); return h; };
  assert.equal(hash(cu), hash(du), 'the two sets hash alike');
  assert.notDeepEqual([...cu], [...du], 'and are not the same numbers');
  volumeName(c); const nc = volumeName(c);
  assert.equal(volumeName(d), 0, 'the second of one hash: first sight'); const nd = volumeName(d);
  assert.ok(nc > 0 && nd > 0 && nc !== nd, `one hash, two sets: two names (${nc}, ${nd})`);
  assert.equal(volumeName(c), nc, 'and each keeps its own');
  // the woods' answers by those two names stay apart
  const w = { _place: placementGrid(Array.from({ length: 30 }, () => [(rand() * 2 - 1) * 5, 0, (rand() * 2 - 1) * 5])), origin: [0, 0, 0], size: { w: 1, h: 1 } };
  for (const [p, n] of [[c, nc], [d, nd], [c, nc], [d, nd]]) assert.equal(placementsInVolumeOf(w, 1, p, n), placementsInVolume(w, 1, p));
  // never reused: fill the table past its bound, then the old set is first seen again, and the new name is new
  const names = new Set([na, nb, nc, nd]);
  const old = set(); volumeName(old); const nOld = volumeName(old); names.add(nOld);
  for (let i = 0; i < VOLUME_TABLE_MAX + 1; i++) { const s = set(); volumeName(s); }
  assert.equal(volumeName(old), 0, 'past the bound the table started over: the old set is first seen again');
  const nNew = volumeName(old);
  assert.ok(nNew > 0 && !names.has(nNew), `and named anew - no name given twice (${nNew}; before: ${[...names]})`);
  assert.ok(nNew > Math.max(...names), `the names go on counting past the start-over (${nNew} after ${Math.max(...names)}): a grid's answer under an old name can never be read for a new set`);
});

test('PERF-VOL: a grid keeps VOLUME_MEMO_MAX answers at most - asked by more names than that it starts over, and every answer is still the asked one (mutant: PERFVOL-memo-unbounded)', () => {
  const rand = rng(33);
  const b = wood(rand);
  const live = new Float32Array(24);
  const vols = volumes(rand, VOLUME_MEMO_MAX + 30);
  for (let pass = 0; pass < 3; pass++) {
    for (const v of vols) {
      live.set(v);
      const name = volumeName(live);
      assert.equal(placementsInVolumeOf(b, 2, live, name), placementsInVolume(b, 2, live));
      assert.ok((b._place.vol?.size ?? 0) <= VOLUME_MEMO_MAX, `the grid keeps at most ${VOLUME_MEMO_MAX} (${b._place.vol?.size})`);
    }
  }
  assert.ok(b._place.vol.size > 0, 'and it kept some');
});

// ─── the replay ───────────────────────────────────────────────────────────────────────────────────────────────────

const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const RIGHT = new Float32Array([1, 0, 0]), UP = new Float32Array([0, 1, 0]);
const LIGHT_DIR = new Float32Array([0.45, 0.8, 0.35]);
/** perfshadow1.test.js's recording GL: every draw with the program, VAO and framebuffer it was made in. */
function recordingGl() {
  const draws = [];
  let ids = 0, prog = null, vao = null, fb = null;
  const consts = { TEXTURE0: 1000, DEPTH_BUFFER_BIT: 256, COLOR_BUFFER_BIT: 16384, READ_FRAMEBUFFER: 36008, DRAW_FRAMEBUFFER: 36009, FRAMEBUFFER: 36160 };
  const gl = new Proxy({}, {
    get(_, k) {
      if (k in consts) return consts[k];
      if (k === 'getProgramParameter' || k === 'getShaderParameter') return () => true;
      if (k === 'getUniformLocation') return (_p, n) => n;
      if (k === 'getAttribLocation') return () => 0;
      if (k === 'createShader' || k === 'createProgram' || k === 'createBuffer' || k === 'createVertexArray'
        || k === 'createTexture' || k === 'createFramebuffer' || k === 'createRenderbuffer') return () => ({ id: ++ids });
      if (k === 'getParameter') return () => new Float32Array(4);
      if (typeof k === 'string' && k.toUpperCase() === k) return 1;
      return (...args) => {
        if (k === 'useProgram') prog = args[0];
        else if (k === 'bindVertexArray') vao = args[0];
        else if (k === 'bindFramebuffer' && (args[0] === 36160 || args[0] === 36009)) fb = args[1];
        else if (k === 'drawElements' || k === 'drawArrays') draws.push([k, prog?.id, vao?.id, fb?.id, args[1], args[2], args[3]]);
      };
    },
  });
  return { draws, canvas: { getContext: () => gl, clientWidth: 320, clientHeight: 200, width: 320, height: 200 } };
}
/** A night town under Steady shadows: swaying woods and a still one, a walker by each lantern, lanterns that hold
 *  still - and a script of frames that each move one thing. `memo` is SHADOW_TUNING.volumeMemo. */
function town(seed, memo) {
  const rand = rng(seed);
  const g = recordingGl();
  const r = new Renderer(g.canvas);
  r.setLightingLane(EL_LANE);
  for (const k of ['504_1', '504_2', '504_3']) r.textures.set(k, { id: `tex-${k}` });
  r.setLighting(new Float32Array([0.1, 0.1, 0.1]), 0);
  const woods = [];
  for (let k = 0; k < 10; k++) {
    const b = r.createBillboardBatch(504, 1 + (k % 2), { w: 1 + rand() * 3, h: 2 + rand() * 7 }, Array.from({ length: 20 + Math.floor(rand() * 80) }, () => [(rand() * 2 - 1) * 40, rand() - 0.5, (rand() * 2 - 1) * 40]));
    b.sway = k < 8 ? 0.4 + rand() : 0;
    b.origin = [(rand() * 2 - 1) * 30, 0, (rand() * 2 - 1) * 30];
    woods.push(b);
  }
  const nL = 6, lights = new Float32Array(nL * 4);
  for (let i = 0; i < nL; i++) lights.set([(rand() * 2 - 1) * 40, 2 + rand() * 3, (rand() * 2 - 1) * 40, 8 + rand() * 14], i * 4);
  const walkers = Array.from({ length: nL }, (_, i) => { const b = r.createBillboardBatch(504, 3, { w: 1, h: 1.8 }, [[0, 0, 0]]); b.origin = [lights[i * 4] + 1, 0, lights[i * 4 + 2] + 1]; return b; });
  // the walks of the REPLAYS alone - a lantern's cube query (_candidateQuads, _dynamicNear) walks placements too, outside them
  let inReplay = false;
  const n = woods.map((b) => { const q = b._place, c = { walks: 0 }; b._place = new Proxy(q, { get(t, k) { if (inReplay && k === 'pts') c.walks++; return t[k]; }, set(t, k, v) { t[k] = v; return true; } }); return c; });
  const sp = r.shadows, replay = sp.replay.bind(sp);
  sp.replay = (...a) => { inReplay = true; try { return replay(...a); } finally { inReplay = false; } };
  const wind = [6, 2, 3.7, 1];
  let t = 0;
  const frame = (move) => {
    const was = [SHADOW_TUNING.override, SHADOW_TUNING.volumeMemo];
    SHADOW_TUNING.override = true; SHADOW_TUNING.volumeMemo = memo;
    try {
      t++;
      walkers.forEach((b, i) => { b.origin = [lights[i * 4] + Math.sin(t + i) * 2, 0, lights[i * 4 + 2] + Math.cos(t) * 2]; });   // a mover by each lantern: its dynamic faces redraw
      if (move === 'light') lights[0] += 0.75;
      if (move === 'wind') wind[0] += 3;
      if (move === 'origin') woods[0].origin[0] += 4;   // in place, as a pixel's translation array is written
      if (move === 'height') woods[1].size.h += 3;
      r.setPointLights(lights, new Float32Array(nL * 3).fill(1));
      g.draws.length = 0;
      const w0 = n.reduce((s, c) => s + c.walks, 0);
      r.beginFrame(I, I, LIGHT_DIR, WORLD_FRAME);
      const shadow = g.draws.slice();
      const walks = n.reduce((s, c) => s + c.walks, 0) - w0;
      r.setFlatWind(wind);
      r.drawBillboards([...woods, ...walkers], RIGHT, UP);
      r.drawScreenQuad({ id: 'ui' }, { x: 0, y: 0, w: 10, h: 10 });
      return { shadow, walks, faces: r.shadows.stats.dynFaces ?? 0 };
    } finally { [SHADOW_TUNING.override, SHADOW_TUNING.volumeMemo] = was; }
  };
  return { frame };
}

test('PERF-VOL: the replay draws exactly what it drew - every draw of every frame of a night town under Steady shadows (program, VAO, framebuffer, count, offset, in order), against the same pass keeping nothing (SHADOW_TUNING.volumeMemo false), through frames that each move one thing: a lantern swung, the wind risen (the quads\' lean, their radius), a wood\'s origin written in place, a wood\'s height; and the saving by count - the pass that keeps nothing walks the woods\' placements every frame, the one that keeps them walks none on a still frame and only again on a frame that moved something (mutants: PERFVOL-replay-unnamed, PERFVOL-off-arm-ignored, PERFVOL-renamed-every-sight, PERFVOL-key-not-refreshed)', () => {
  const script = [null, null, null, null, 'light', null, null, 'wind', null, null, 'origin', null, null, 'height', null, null];
  // a frame's pass replays the records the frame before drew (frame 0 has none): the first replay names nothing, the
  // second names and keeps; a move is replayed on its own frame or, a record's own number (the wind), on the next
  let compared = 0;
  for (const seed of [3, 4, 5]) {
    const kept = town(seed, true), asked = town(seed, false);
    const walks = [];
    for (let f = 0; f < script.length; f++) {
      const x = kept.frame(script[f]), y = asked.frame(script[f]);
      assert.deepEqual(x.shadow, y.shadow, `seed ${seed}, frame ${f} (${script[f] ?? 'still'}): the same draws in the same order`);
      if (f > 0) assert.ok(y.walks > 0, `seed ${seed}, frame ${f}: keeping nothing, the faces walk the woods (${y.walks})`);
      walks.push(x.walks);
      compared += x.shadow.length;
    }
    assert.ok(walks[1] > 0 && walks[2] > 0, `seed ${seed}: the first replay walks, and the second, which keeps (${walks})`);
    for (let f = 3; f < script.length; f++) {
      if (script[f] != null) assert.ok(walks[f] + walks[f + 1] > 0, `seed ${seed}, frame ${f}: the ${script[f]} moved, and its asks are asked again (${walks})`);
      else if (script[f - 1] == null) assert.equal(walks[f], 0, `seed ${seed}, frame ${f}: a still frame walks no placement (${walks})`);
    }
  }
  assert.ok(compared > 2000, `the comparison drew something (${compared})`);
});

test('PERF-VOL: the replay asks through the name, once a replay, and only with a placed batch to ask', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../src/render/shadowPass.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('  replay(f, vp, lightPos,'), src.indexOf('\n  }\n', src.indexOf('  replay(f, vp, lightPos,')));
  assert.match(body, /let vname = -1;/, 'the name is asked lazily');
  assert.match(body, /placementsInVolumeOf\(b, quadRadius\(r, wl, law, b\), planes, vname < 0 \? \(vname = SHADOW_TUNING\.volumeMemo === false \? 0 : volumeName\(planes\)\) : vname\)/, 'at the first placed batch, by the off arm');
  assert.doesNotMatch(body, /placementsInVolume\(/, 'and no ask goes round the kept answers');
});

// ─── PERF-ORDER: the cheapest skip first ──────────────────────────────────────────────────────────────────────────

test('PERF-ORDER: the air pass\'s emitters are the flats with an emission map, in view, with a picture - over random flats in front of the eye and behind it, lit and plain, one lit with no picture: the draws counted are the oracle\'s, and the sphere is asked of the lit flats alone (Knightstale by night: 3 of the 636 a frame) (mutants: PERFORDER-blind-drawn, PERFORDER-unseen-drawn, PERFORDER-sphere-first; EL3\'s emit-flat-without-map, re-aimed)', async () => {
  const { perspective, mirrorProjectionX } = await import('../src/world/mat4.js');
  const calls = [];
  let ids = 0;
  const consts = { TEXTURE_CUBE_MAP_POSITIVE_X: 100, TEXTURE0: 1000, DEPTH_BUFFER_BIT: 256, COLOR_BUFFER_BIT: 16384, FRAMEBUFFER: 7, TRIANGLE_STRIP: 5, drawingBufferWidth: 320, drawingBufferHeight: 200, ONE: 1, SRC_ALPHA: 770, ONE_MINUS_SRC_ALPHA: 771 };
  const gl = new Proxy({}, {
    get(_, k) {
      if (k in consts) return consts[k];
      if (k === 'getProgramParameter' || k === 'getShaderParameter') return () => true;
      if (k === 'getUniformLocation') return (_p, n) => n;
      if (k === 'getAttribLocation') return () => 0;
      if (k === 'createShader' || k === 'createProgram' || k === 'createBuffer' || k === 'createVertexArray'
        || k === 'createTexture' || k === 'createFramebuffer' || k === 'createRenderbuffer') return () => ({ id: ++ids });
      if (k === 'getParameter') return () => new Float32Array(4);
      if (typeof k === 'string' && k.toUpperCase() === k) return 1;
      return (...args) => { calls.push(k); };
    },
  });
  const r = new Renderer({ getContext: () => gl, clientWidth: 320, clientHeight: 200, width: 320, height: 200 });
  r.setLightingLane(EL_LANE);
  r.setAir(true);
  r.setLighting(new Float32Array([0.1, 0.1, 0.1]), 0);
  const P = mirrorProjectionX(perspective(1, 1.6, 0.5, 6000));
  const sun = new Float32Array([0.3, 0.8, -0.2]);
  const rand = rng(41);
  const flats = [];
  for (let k = 0; k < 120; k++) {
    const lit = k % 4 === 0, blind = k === 8;   // a quarter lit; one of them with no picture
    const rec = lit ? (blind ? 9 : 1) : 2 + (k % 3);
    const b = r.createBillboardBatch(210, rec, { w: 0.5 + rand() * 2, h: 0.5 + rand() * 3 }, [[0, 0, 0]]);
    b.origin = blind ? [0, 1, -12] : [(rand() * 2 - 1) * 60, rand() * 4, (rand() * 2 - 1) * 60];   // z < 0 in front of the identity eye, z > 0 behind; the blind one in view
    flats.push({ b, lit, blind });
  }
  for (const k of ['210_1', '210_2', '210_3', '210_4']) r.textures.set(k, { id: `t${k}` });
  r.emissionTextures.set('210_1', { id: 'e1' }); r.emissionTextures.set('210_9', { id: 'e9' });
  const planes = spherePlanes(multiply(P, I, new Float32Array(16)), new Float32Array(24));
  const want = flats.filter((f) => f.lit && !f.blind && bounds.batchVisible(planes, f.b)).length;
  const offLit = flats.filter((f) => f.lit && !f.blind && !bounds.batchVisible(planes, f.b)).length;
  assert.ok(want > 3 && offLit > 3, `lit flats both in view (${want}) and out of it (${offLit})`);
  assert.ok(flats.some((f) => !f.lit && bounds.batchVisible(planes, f.b)), 'and plain ones in view');
  assert.ok(bounds.batchVisible(planes, flats[8].b), 'and the lit one with no picture');
  // the sphere's asks at the resolve, by flat
  let resolving = false;
  const asked = new Map();
  for (const f of flats) {
    let s = f.b.bounds;
    Object.defineProperty(f.b, 'bounds', { get() { if (resolving) asked.set(f, (asked.get(f) ?? 0) + 1); return s; }, set(v) { s = v; }, configurable: true });
  }
  const frame = () => {
    r.beginFrame(P, I, sun, WORLD_FRAME);
    r.drawBillboards(flats.map((f) => f.b), RIGHT, UP);
    resolving = true;
    try { r.drawScreenQuad({ id: 'ui' }, { x: 0, y: 0, w: 10, h: 10 }); } finally { resolving = false; }
  };
  frame(); asked.clear(); frame();
  assert.equal(r.air.stats.emitDraws, want, 'the emitters drawn are the lit flats in view with a picture');
  const plainAsked = flats.filter((f) => !f.lit && asked.get(f)).length;
  assert.equal(plainAsked, 0, `no plain flat's sphere asked at the resolve (${plainAsked} were)`);
  assert.ok(flats.filter((f) => f.lit && asked.get(f)).length >= want, 'the lit flats\' were');
});
