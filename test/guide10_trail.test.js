// GUIDE10 (2026-10-13, a player: a trail "that fits the game", for new players finding their way out of dungeons and for
// players who need help keeping track of where they are going) - THE GUIDE TRAIL (systems/guideTrail.js,
// scenes/guideTrailFx.js, bible/06-Systems/Quest-Guide-Arc.md GUIDE10): a stream of warm gold embers along the way to
// where the player is going. Its laws:
//
//   THE TIERS - off, quest, exit, waypoint; one key cycles them; the enhanced skin only.
//   THE STRETCH AHEAD - from where the player stands on the path, a window long, truncated or ending at the goal;
//     nothing left at the goal.
//   A FUNCTION OF THE CLOCK - the same path and time write the same embers; the stream moves toward the goal, an ember
//     keeping its identity as it is carried; nothing is allocated per frame.
//   THE FADES - nothing in the player's face, a window that fades at its far end, a stream that thins on arrival.
//   THE WAY OUT AS A PATH - the field walked cell by cell from the player, ending at a teleporter's jump.
//   THE HOSTS - the shared magic engine draws it beside the spell effects; the dungeon hands it three paths.
import './modsOff.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setPref, _resetForTests } from '../src/systems/uiPrefs.js';
import { setUiSkin } from '../src/systems/uiSkin.js';
import {
  GUIDE_TRAIL_PREF, GUIDE_TRAIL_TIERS, GUIDE_TRAIL_ACTION, GUIDE_AHEAD_M, GUIDE_NEAR_M, GUIDE_SPACING_M, GUIDE_MAX_EMBERS,
  GUIDE_ARRIVE_M, GUIDE_SIZE_M, GUIDE_POOL_M, GUIDE_POOL_LIFT_M, GUIDE_POOL_ALPHA, guideTrailTier, nextGuideTrailTier, cycleGuideTrail, polylineLength, nearestOnPath, trimAhead, groundPath,
  smoothPath, createEmberField,
} from '../src/systems/guideTrail.js';
import { trailCells, wayField, wayPath } from '../src/systems/wayOut.js';
import { createGuideTrailFx, glowMip, packEmbers, EMBER_BLEND, GLOW_TEXELS } from '../src/scenes/guideTrailFx.js';
import { PARTICLE_FLOATS } from '../src/formats/mwParticles.js';
import { FEATURES } from '../src/systems/features.js';
import { CATEGORIES } from '../src/ui/settingsMap.js';
import { ACTIONS, PORT_ACTIONS, ACTION_GROUPS, DEFAULT_BINDINGS } from '../src/systems/inputActions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const line = (len, y = 0) => [[0, y, 0], [len, y, 0]];

test('GUIDE10: THE TIERS - off, quest, exit, waypoint; the key cycles them round; the enhanced skin only', () => {
  assert.deepEqual([...GUIDE_TRAIL_TIERS], ['off', 'quest', 'exit', 'waypoint']);
  assert.deepEqual(GUIDE_TRAIL_TIERS.map(nextGuideTrailTier), ['quest', 'exit', 'waypoint', 'off']);
  assert.equal(nextGuideTrailTier('nonsense'), 'quest', 'an unknown tier is off, so the next is quest');
  _resetForTests();
  setUiSkin('enhanced');
  assert.equal(guideTrailTier(), 'off', 'off by default');
  assert.deepEqual([cycleGuideTrail(), cycleGuideTrail(), cycleGuideTrail(), cycleGuideTrail()], ['quest', 'exit', 'waypoint', 'off']);
  setPref(GUIDE_TRAIL_PREF, 'exit');
  assert.equal(guideTrailTier(), 'exit');
  setUiSkin('classic');
  assert.equal(guideTrailTier(), 'off', 'the classic HUD has no compass to follow');
  setUiSkin('enhanced');
  setPref(GUIDE_TRAIL_PREF, 'junk');
  assert.equal(guideTrailTier(), 'off', 'a junk record is off');
  setPref(GUIDE_TRAIL_PREF, 'off');
  _resetForTests();
});

test('GUIDE10: THE STRETCH AHEAD - from the projection of the player, a window long; the goal ends it; at the goal, nothing', () => {
  const p = [[0, 0, 0], [10, 0, 0], [10, 0, 10], [40, 0, 10]];
  const n = nearestOnPath(p, [5, 0, 3]);
  assert.deepEqual([n.at, n.s, n.d, n.seg], [[5, 0, 0], 5, 3, 0]);
  assert.equal(nearestOnPath([], [0, 0, 0]), null);
  const ahead = trimAhead(p, [5, 0, 3], 12);
  assert.deepEqual(ahead.pts[0], [5, 0, 0], 'it starts where the player stands on the path');
  assert.ok(Math.abs(polylineLength(ahead.pts) - 12) < 1e-9, 'a window long');
  assert.equal(ahead.truncated, true);
  assert.deepEqual(ahead.pts.at(-1), [10, 0, 7], 'cut mid-segment, not at a corner');
  const rest = trimAhead(p, [5, 0, 3], GUIDE_AHEAD_M * 10);
  assert.equal(rest.truncated, false, 'the goal inside the window');
  assert.deepEqual(rest.pts.at(-1), [40, 0, 10]);
  assert.equal(trimAhead(p, [40, 0, 10]), null, 'standing at the goal: nothing ahead');
  assert.equal(trimAhead([[0, 0, 0]], [0, 0, 0]), null, 'a path of one point leads nowhere');
});

test('GUIDE10: OVER OPEN GROUND - a point every few metres, each on the ground, a missing height keeping the line\'s own', () => {
  const g = groundPath([0, 5, 0], [0, 9, 10], (x, z) => (z === 5 ? null : z * 0.5), 5);
  assert.deepEqual(g.map((q) => q.map((v) => +v.toFixed(3))), [[0, 0, 0], [0, 7, 5], [0, 5, 10]]);
  assert.equal(groundPath([1, 1, 1], [1, 1, 1], () => 0).length, 2, 'no distance is still a path');
});

test('GUIDE10: A SMOOTHED ZIGZAG - the walked trail\'s cells are averaged, the ends stay', () => {
  const z = [[0, 0, 0], [1, 0, 1], [2, 0, 0], [3, 0, 1], [4, 0, 0]];
  const s = smoothPath(z);
  assert.deepEqual([s[0], s.at(-1)], [z[0], z.at(-1)]);
  const swing = (pts) => Math.max(...pts.map((q) => q[2])) - Math.min(...pts.map((q) => q[2]));
  assert.ok(swing(s) < swing(z) * 0.6, 'the swing is well under what it was');
  assert.deepEqual(smoothPath([[0, 0, 0], [1, 0, 0]]), [[0, 0, 0], [1, 0, 0]], 'two points are left alone');
});

test('GUIDE10: A FUNCTION OF THE CLOCK - the same path and time write the same embers, into the same pool', () => {
  const f = createEmberField();
  const path = line(30);
  const n1 = f.fill(path, 12.3, { truncated: true });
  const a = JSON.stringify(f.embers.slice(0, n1));
  const pool = f.embers.slice();
  const n2 = f.fill(path, 12.3, { truncated: true });
  assert.equal(n2, n1);
  assert.equal(JSON.stringify(f.embers.slice(0, n2)), a);
  assert.ok(f.embers.every((e, i) => e === pool[i]), 'the pool is the same objects - nothing allocated');
  assert.ok(n1 > 10 && n1 <= GUIDE_MAX_EMBERS, `${n1} embers in a thirty-metre stretch`);
  assert.equal(f.fill(null, 1), 0);
  assert.equal(f.fill(line(GUIDE_NEAR_M), 1), 0, 'a stretch no longer than the near fade shows nothing');
});

test('GUIDE10: THE EMBERS ARE ON THE PATH - along it, lifted off the floor, within a body\'s width of it, gold and never dark', () => {
  const f = createEmberField();
  const n = f.fill(line(30, 2), 3.1, { truncated: true });
  for (let i = 0; i < n; i++) {
    const e = f.embers[i];
    assert.ok(e.pos[0] > 0 && e.pos[0] < 30, `ember ${i} along the path`);
    assert.ok(e.pos[1] >= 2 + GUIDE_POOL_LIFT_M - 1e-9 && e.pos[1] < 2 + 0.14 + 0.55 + 1e-9, `quad ${i} off the floor and no higher than an ember's rise`);
    assert.ok(Math.abs(e.pos[2]) < 0.6, `ember ${i} within a body's width`);
    assert.ok(e.alpha >= 0 && e.alpha <= 1);
    assert.ok(e.color[0] >= 0.99 && e.color[1] >= 0.5 && e.color[2] >= 0.17 && e.color[2] <= 0.4, `ember ${i} gold`);
    assert.ok(e.size === GUIDE_POOL_M || (e.size >= GUIDE_SIZE_M[0] && e.size <= GUIDE_SIZE_M[1]), 'a spark, or the floor\'s glow');
  }
});

test('GUIDE10: THE FADES - nothing in the face, thin at the window\'s far end, thin on arrival; the goal\'s end is shorter than the window\'s', () => {
  const f = createEmberField();
  const bright = (path, t, o) => { const n = f.fill(path, t, o); return Array.from({ length: n }, (_, i) => ({ x: f.embers[i].pos[0], a: f.embers[i].alpha })); };
  // an ember's glow also swells and dies through its own life, so the law is read as the strongest ember in a stretch
  const peak = (rows, a, b) => Math.max(0, ...rows.filter((r) => r.x >= a && r.x < b).map((r) => r.a));
  let nearPeak = 0, midPeak = 0, farPeak = 0, arrivePeak = 0, mid2Peak = 0, goalNear = 0, winNear = 0;
  for (let t = 0; t < 8; t += 0.37) {
    const win = bright(line(GUIDE_AHEAD_M), t, { truncated: true });
    nearPeak = Math.max(nearPeak, peak(win, 0, 0.5)); midPeak = Math.max(midPeak, peak(win, 9, 18)); farPeak = Math.max(farPeak, peak(win, GUIDE_AHEAD_M - 1, GUIDE_AHEAD_M));
    const goal = bright(line(GUIDE_AHEAD_M), t, { truncated: false });
    mid2Peak = Math.max(mid2Peak, peak(goal, 9, 18)); arrivePeak = Math.max(arrivePeak, peak(goal, GUIDE_AHEAD_M - GUIDE_ARRIVE_M / 4, GUIDE_AHEAD_M));
    goalNear = Math.max(goalNear, peak(goal, GUIDE_AHEAD_M - 2, GUIDE_AHEAD_M - 1)); winNear = Math.max(winNear, peak(win, GUIDE_AHEAD_M - 2, GUIDE_AHEAD_M - 1));
  }
  assert.ok(nearPeak < 0.05, 'nothing at the player\'s feet');
  assert.ok(midPeak > 0.5, 'bright in the middle of the window');
  assert.ok(farPeak < 0.1, 'the window\'s far end fades');
  assert.ok(mid2Peak > 0.5 && arrivePeak < 0.1, 'the stream thins as it reaches the goal');
  assert.ok(goalNear > 0.5 && winNear < 0.25, 'a goal\'s stream is bright to within two metres of it, where a cut window has long since faded');
  assert.ok(f.fill(line(GUIDE_AHEAD_M), 2, { brightness: 0.3 }) > 0 && Math.max(...f.embers.slice(0, 20).map((e) => e.alpha)) <= 0.3 + 1e-9, 'brightness scales the glow');
});

test('GUIDE10: THE STREAM FLOWS TOWARD THE GOAL - an ember is carried along, keeping what it is, and the wrap is seamless', () => {
  const f = createEmberField();
  const path = line(30);
  const at = (t) => { const n = f.fill(path, t); return f.embers.slice(0, n).map((e) => ({ x: e.pos[0], size: e.size, c: e.color[1] })); };
  const a = at(5.0), b = at(5.0 + 0.1);
  const step = 0.1 * 1.4;
  let matched = 0;
  for (const e of a) {
    const m = b.find((q) => q.size === e.size && q.c === e.c && Math.abs(q.x - e.x - step) < 1e-6);
    if (m) matched++;
  }
  assert.ok(matched > a.length * 0.8, `${matched} of ${a.length} embers were carried ${step.toFixed(2)} m toward the goal, as themselves`);
  // across the wrap of the slot (one spacing's worth of travel) the same ember is still the same ember
  const t0 = (GUIDE_SPACING_M / 1.4) * 7 - 0.001, w0 = at(t0), w1 = at(t0 + 0.002);
  const lost = w0.filter((e) => !w1.some((q) => q.size === e.size && q.c === e.c && Math.abs(q.x - e.x) < 0.01)).length;
  assert.ok(lost <= 2, `${lost} embers changed across the wrap (only the two ends of the stream may)`);
});

test('GUIDE10: THE WAY OUT AS A PATH - the field walked from the player, a teleporter\'s jump ending it, a cell with no way out none', () => {
  const trail = new Set(['0,0,0', '1,0,0', '2,0,0', '3,0,0', '4,0,0', '9,0,9']);
  const cells = trailCells(trail);
  const field = wayField(cells, 0, []);
  const from = cells.pts.findIndex((p) => p[0] > 4);
  const path = wayPath(cells, field, from, 64);
  assert.deepEqual(path.map((p) => p[0]), [4.5, 3.5, 2.5, 1.5, 0.5], 'walked back to the way in, a cell a metre');
  assert.deepEqual(wayPath(cells, field, from, 2).map((p) => p[0]), [4.5, 3.5, 2.5], 'a window of cells');
  assert.equal(wayPath(cells, field, cells.pts.length - 1, 64), null, 'a cell the field does not reach');
  const jumpy = wayField(cells, 0, []);
  jumpy.jump[from] = 1;
  assert.deepEqual(wayPath(cells, jumpy, from, 64).length, 1, 'it ends on a teleporter\'s entrance');
});

test('GUIDE10: ITS ROW AND ITS KEY - a Features row with the four tiers, off by default, in Accessibility > Wayfinding; an action of the port\'s own, unbound', () => {
  const row = FEATURES.find((f) => f.id === 'guide-trail');
  assert.ok(row, 'the Features row');
  assert.deepEqual([row.control.store, row.control.key, row.control.initial], ['prefs', GUIDE_TRAIL_PREF, 'off']);
  assert.deepEqual(row.control.tiers.map(([v]) => v), [...GUIDE_TRAIL_TIERS]);
  const acc = CATEGORIES.find((c) => c.id === 'accessibility');
  assert.ok(acc.sections.find((s) => s.id === 'wayfinding')?.items.includes('feat:guide-trail'));
  assert.ok(ACTIONS.includes(GUIDE_TRAIL_ACTION) && PORT_ACTIONS.includes(GUIDE_TRAIL_ACTION));
  assert.ok(JSON.stringify(ACTION_GROUPS).includes(`"${GUIDE_TRAIL_ACTION}"`), 'drawn in the controls pane');
  assert.ok(!DEFAULT_BINDINGS.some(([, a]) => a === GUIDE_TRAIL_ACTION), 'ships unbound');
});

test('GUIDE10: ONE ENGINE, ITS HOSTS - the shared magic engine draws the trail in drawFx, and the dungeon hands it its paths', () => {
  const magic = read('src/scenes/hostMagic.js');
  assert.match(magic, /guideTrail\.draw\(/);
  const dungeon = read('src/scenes/dungeonContext.js');
  assert.match(dungeon, /guideTrailPath:/);
  assert.match(dungeon, /wayOut\.path\(/);
});

/** A renderer that records what the trail asks of it (the particle path's four doors and the texture's two). */
function fakeRenderer() {
  const log = [];
  const r = {
    gl: {}, _proj: [1], _view: [1], log,
    createCharacterTexture: (mips) => { log.push(['tex', mips.length]); return { tex: 1 }; },
    createParticleEffect: (cap, state) => { log.push(['create', cap, state]); return { capacity: cap, state, hidden: false, count: 0, tex: null }; },
    updateParticleEffect: (e, buf, count) => { e.count = count; log.push(['update', count, buf.length]); },
    drawWorldParticleEffects: (list) => { log.push(['draw', list.length, list[0].hidden, list[0].count]); },
    releaseParticleEffect: (e) => { log.push(['release', e.tex]); },
    releaseCharacterTexture: () => { log.push(['freetex']); },
  };
  return r;
}

test('GUIDE10: THE GLOW - a small soft-edged picture, white so the ember\'s gold is the vertex colour, bright at the middle and nothing at the rim', () => {
  const g = glowMip();
  assert.deepEqual([g.width, g.height, g.rgba.length], [GLOW_TEXELS, GLOW_TEXELS, GLOW_TEXELS * GLOW_TEXELS * 4]);
  const a = (x, y) => g.rgba[(y * g.width + x) * 4 + 3];
  assert.ok(a(7, 7) > 200 && a(8, 8) > 200, 'a bright core');
  assert.equal(a(0, 0), 0, 'a corner is empty');
  assert.ok(a(7, 7) > a(7, 3) && a(7, 3) > a(7, 0), 'falling off toward the rim');
  assert.ok(g.rgba.every((v, i) => i % 4 === 3 || v === 255), 'white');
});

test('GUIDE10: THE EMBERS IN THE WORLD PASS - one additive effect made on the first draw, six vertices an ember, the world pass asked, nothing live without a path, everything freed on dispose', () => {
  assert.deepEqual({ ...EMBER_BLEND }, { blend: true, srcBlend: 6, dstBlend: 0, depthTest: true, depthWrite: false }, 'SRC_ALPHA, ONE; tested against the world, never written');
  const r = fakeRenderer();
  const fx = createGuideTrailFx({ renderer: r, clock: () => 7.3 });
  const path = line(60);
  assert.equal(fx.draw(null, [0, 0, 0]), false);
  assert.equal(fx.draw(path, null), false);
  assert.equal(r.log.length, 0, 'no path, no effect made');
  assert.equal(fx.draw(path, [1, 0, 0]), true);
  const [make, update, draw] = [r.log.find((l) => l[0] === 'create'), r.log.find((l) => l[0] === 'update'), r.log.find((l) => l[0] === 'draw')];
  assert.deepEqual([r.log.filter((l) => l[0] === 'tex').length, make[1]], [1, GUIDE_MAX_EMBERS], 'one glow, an effect sized for a full stream');
  assert.ok(update[1] > 0 && update[1] % 6 === 0, 'six vertices an ember');
  assert.equal(update[2], GUIDE_MAX_EMBERS * 6 * PARTICLE_FLOATS, 'into the one buffer');
  assert.deepEqual([draw[1], draw[2]], [1, false], 'the world pass drawn with the one effect');
  fx.draw(path, [2, 0, 0]);
  assert.equal(r.log.filter((l) => l[0] === 'create').length, 1, 'made once');
  assert.equal(fx.draw(path, [60, 0, 0]), false, 'at the goal there is nothing to draw');
  assert.equal(fx.live, false);
  fx.draw(path, [1, 0, 0]);
  assert.equal(fx.live, true);
  fx.dispose();
  assert.deepEqual(r.log.slice(-2).map((l) => l[0]), ['release', 'freetex']);
  assert.equal(r.log.at(-2)[1], null, 'the effect lets go of the texture first: this module frees it itself');
  assert.equal(createGuideTrailFx({ renderer: { gl: null } }).draw(path, [0, 0, 0]), false, 'a renderer with no context draws nothing');
});

test('GUIDE10: A PACKED EMBER - centre, corner, picture, colour with the ember\'s alpha, and its size, six times, in the particle stream\'s layout', () => {
  const buf = new Float32Array(2 * 6 * PARTICLE_FLOATS);
  const e = { pos: [1, 2, 3], size: 0.07, color: [1, 0.8, 0.3], alpha: 0.5 };
  assert.equal(packEmbers(buf, [e, e], 1), 6);
  const v = [...buf.slice(0, PARTICLE_FLOATS)].map((x) => +x.toFixed(3));
  assert.deepEqual([v.slice(0, 3), v.slice(7, 11), v[11]], [[1, 2, 3], [1, 0.8, 0.3, 0.5], 0.07]);
  assert.ok(buf.slice(6 * PARTICLE_FLOATS).every((x) => x === 0), 'only the live embers are written');
});

test('GUIDE10: THE FLOOR\'S GLOW - under every spark a soft pool on the path itself, faint and never brighter than its alpha, so the stream reads as one warm path', () => {
  const f = createEmberField();
  const n = f.fill(line(GUIDE_AHEAD_M, 1), 5.3, { truncated: true });
  const pools = f.embers.slice(0, n).filter((e) => e.size === GUIDE_POOL_M);
  const sparks = f.embers.slice(0, n).filter((e) => e.size !== GUIDE_POOL_M);
  assert.equal(pools.length, sparks.length, 'a pool to every spark');
  assert.ok(pools.length > 20, `${pools.length} pools across a thirty-metre stretch`);
  for (const p of pools) {
    assert.equal(p.pos[2], 0, 'on the path, not swayed off it');
    assert.ok(Math.abs(p.pos[1] - (1 + GUIDE_POOL_LIFT_M)) < 1e-9, 'lying on the floor');
    assert.ok(p.alpha <= GUIDE_POOL_ALPHA + 1e-9, 'faint');
  }
  assert.ok(Math.max(...pools.map((p) => p.alpha)) > GUIDE_POOL_ALPHA * 0.6, 'but there');
});