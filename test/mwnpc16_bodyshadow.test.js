// MWNPC16 (2026-10-11, a player's screenshot via Mac: "With morrowind assets attached. Old sprite shadows still show" -
// bible/04-Characters/Morrowind-NPCs.md section 24): A MORROWIND BODY CASTS ITS OWN SHAPE. MWNPC1 turned a GPU-skinned
// body away at the shadow pass's door and MWNPC5b kept each NPC's classic billboard in the pass to cast for it
// (`castOnly`) - so a man in Morrowind's steel threw a Daggerfall sprite's silhouette on the wall. The body now replays
// through the world's own skinned vertex shader off its palette, a run of its ranges in one depth draw, and the flat
// under it casts nothing; the lane asks it of an NPC's body alone, in the view and out of it (SHADOW-REACH's law).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ShadowPass, DEPTH_FS, DEPTH_BB_FS } from '../src/render/shadowPass.js';
import { SKIN_PALETTE_UNIT } from '../src/render/skinPalette.js';
import { ortho, perspective, lookAt, multiply } from '../src/world/mat4.js';
import { PeerBodies } from '../src/net/peerBodies.js';
import { createNpcBodies } from '../src/characters/npcBodies.js';
import { createFpArm } from '../src/combat/fpArm.js';
import { fixtureBodyDeps, countingRenderer } from './fixtures/mw/bodyRig.mjs';

const rd = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flush = () => new Promise((r) => setTimeout(r, 0));
const settle = async (n = 8) => { for (let i = 0; i < n; i++) await flush(); };

/** A GL that records every call, and a pass whose programs say which shaders built them. */
function pass() {
  const calls = [];
  const gl = new Proxy({}, { get: (_, k) => {
    if (k === 'getProgramParameter' || k === 'getShaderParameter') return () => true;
    if (k === 'getUniformLocation') return (p, nm) => `${p.name}.${nm}`;
    if (typeof k === 'string' && k.startsWith('create')) return () => ({ id: Math.random() });
    if (k === 'getParameter') return () => new Float32Array(4);
    if (typeof k === 'string' && k.toUpperCase() === k) return k === 'TEXTURE0' ? 33984 : 1;
    return (...a) => { calls.push([k, ...a]); };
  } });
  const names = { mesh: 'MESH', bb: 'BB', terrain: 'TERRAIN', char: 'CHAR', charSkin: 'SKIN' };
  const build = (vs, fs) => ({ name: `${vs}/${fs === DEPTH_FS ? 'depth' : fs === DEPTH_BB_FS ? 'cut' : 'other'}` });
  const sp = new ShadowPass(gl, { build, vs: names });
  const held = [];
  const f = { bindVao: (v) => calls.push(['bindVao', v]), textures: new Map(), isSpectral: () => false, holdSkin: (t) => held.push(t) };
  return { sp, gl, calls, f, held };
}
const VP = multiply(ortho(50, 50, -100, 100), lookAt([0, 50, 0], [0, 0, 0], [0, 0, -1]));   // a sun looking straight down on a 100 m square
const IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const draws = (calls) => calls.filter((c) => c[0] === 'drawArrays').map((c) => [c[2], c[3]]);
const usedProgram = (calls) => calls.filter((c) => c[0] === 'useProgram').map((c) => c[1].name);

/** A body's mesh as createSkinnedCharacterMesh makes it, ranges laid end to end as packSkinStream lays them. */
function skinnedBody(ranges, { pairs = 2, tex = { palette: 1 } } = {}) {
  return { vao: { body: 1 }, count: 150, skin: { tex, pairs, width: 3, height: 1 }, ranges };
}
const five = () => [
  { first: 0, count: 30 },
  { first: 30, count: 30, hidden: true },                          // a sheathed blade
  { first: 60, count: 30 },
  { first: 90, count: 30, alphaCut: 0.5, tex: { hair: 1 } },       // hair, a cut-out picture
  { first: 120, count: 30 },
];

test('MWNPC16a the shadow pass replays a skinned body through the skinned depth program off its own palette - a run of ranges one draw, a hidden range a break, a cut-out range its own draw through its picture\'s cut; the programs built in the pass\'s own time, the first frame a body casts (mutants: the skin turned away; the runs drawn one by one; the cut range in the run)', () => {
  const { sp, calls, f, held } = pass();
  assert.equal(sp.programs.body, undefined, 'nothing built before a body casts');
  const mesh = skinnedBody(five());
  sp.recordCharacter(mesh, IDENTITY, [0, 1, 0, 1.2]);
  assert.equal(sp.count, 1, 'a skinned body is recorded - the door no longer turns it away');
  assert.equal(sp.records[0].bounded, true);
  assert.deepEqual([...sp.records[0].sphere], [0, 1, 0, Math.fround(1.2)], 'under the sphere it was handed (its posed box)');
  assert.equal(sp.records[0].dynamic, true, 'a body is never still');
  sp._ensureBodyPrograms();
  assert.equal(sp.programs.body.p.name, 'SKIN/depth', 'the world\'s skinned VS over the plain depth');
  assert.equal(sp.programs.bodyCut.p.name, 'SKIN/cut', 'and over the flats\' half-alpha cut');
  assert.equal(sp.programs.charCut.p.name, 'CHAR/cut');
  const samplers = calls.filter((c) => c[0] === 'uniform1i').map((c) => [c[1], c[2]]);
  assert.ok(samplers.some(([l, v]) => l === 'SKIN/depth.uSkinPalette' && v === SKIN_PALETTE_UNIT), 'the palette read on the lit draw\'s unit');
  assert.ok(samplers.some(([l, v]) => l === 'SKIN/cut.uTex' && v === 0), 'the cut\'s picture on 0');
  calls.length = 0;
  const n = sp.replay(f, VP, null);
  assert.deepEqual(draws(calls), [[0, 30], [60, 30], [90, 30], [120, 30]], 'the first piece, the run after the blade, the hair alone, the last');
  assert.equal(n, 4);
  assert.deepEqual(usedProgram(calls), ['SKIN/depth', 'SKIN/cut', 'SKIN/depth'], 'the hair through the cut, the body back for the rest');
  assert.deepEqual(held, [mesh.skin.tex], 'its palette, through the renderer\'s door');
  assert.ok(calls.some((c) => c[0] === 'uniform1f' && c[1] === 'SKIN/depth.uSkin' && c[2] === 2), 'uSkin its pairs');
  assert.ok(calls.some((c) => c[0] === 'uniform1f' && c[1] === 'SKIN/cut.uSkin' && c[2] === 2), 'the cut skinned as well');
  assert.ok(calls.some((c) => c[0] === 'bindTexture' && c[2]?.hair === 1), 'the hair\'s own picture for its cut');
  // nothing hidden and nothing cut: the whole body in one draw
  const one = pass();
  one.sp.recordCharacter(skinnedBody([{ first: 0, count: 50 }, { first: 50, count: 40 }, { first: 90, count: 60 }]), IDENTITY, [0, 1, 0, 1.2]);
  one.sp._ensureBodyPrograms();
  one.calls.length = 0;
  one.sp.replay(one.f, VP, null);
  assert.deepEqual(draws(one.calls), [[0, 150]], 'three pieces end to end: one depth draw');
});

test('MWNPC16b a body let go casts nothing - its palette deleted or its mesh dead since the record; a body out of the replay\'s frustum is culled by its sphere; an unskinned rig keeps CHAR_VS (mutants: the palette test gone; the sphere ignored)', () => {
  const { sp, calls, f } = pass();
  sp.recordCharacter(skinnedBody(five(), { tex: null }), IDENTITY, [0, 1, 0, 1.2]);
  const dead = skinnedBody(five()); dead._dead = true;
  sp.recordCharacter(dead, IDENTITY, [0, 1, 0, 1.2]);
  sp.recordCharacter(skinnedBody(five()), IDENTITY, [500, 1, 0, 1.2]);   // 450 m off the square
  sp._ensureBodyPrograms();
  calls.length = 0;
  assert.equal(sp.replay(f, VP, null), 0, 'none of the three draws');
  assert.equal(sp.stats.culled, 1, 'the far one by its sphere');
  const rig = pass();
  rig.sp.recordCharacter({ vao: { rig: 1 }, count: 36, bounds: null }, IDENTITY, [0, 1, 0, 1]);
  rig.calls.length = 0;
  rig.sp.replay(rig.f, VP, null);
  assert.deepEqual(usedProgram(rig.calls), ['CHAR/depth'], 'a packed rig (the CPU skin\'s) through CHAR_VS, as EL7 cast it');
  assert.deepEqual(draws(rig.calls), [[0, 36]]);
  assert.deepEqual(rig.held, [], 'no palette asked for');
  assert.equal(rig.sp.programs.body, undefined, 'and no skinned program built for it');
});

test('MWNPC16c a cast-only flat casts nothing - not drawn into a map, never a mover that redraws a lantern, never in a cache\'s signature - while its neighbour casts as ever (mutants: castOnly dropped from the replay; from the movers)', () => {
  const { sp, calls, f } = pass();
  const tex = { pic: 1 };
  const flat = (castOnly) => ({ vao: { flat: 1 }, archive: 182, record: 1, size: { w: 1, h: 1.8 }, origin: [0, 0, 0], bounds: null, indexCount: 6, castOnly, _dyn: true });   // a walker: built dynamic
  const body = flat(true), plain = flat(false);
  sp.recordBillboards([body, plain], new Float32Array(4), new Float32Array([1, 0, 0]), new Float32Array([0, 1, 0]));
  assert.equal(sp.records[0].dynamic, true);
  const keyed = f.textures;
  f.textures = { get: () => tex };   // whatever the key, the picture is in hand
  calls.length = 0;
  sp.replay(f, VP, null);
  assert.equal(calls.filter((c) => c[0] === 'drawElements').length, 1, 'the plain flat alone');
  f.textures = keyed;
  assert.equal(sp._dynamicNear([0, 1, 0], 20, () => false), 2, 'the plain flat moves by the lantern');
  plain.castOnly = true;
  assert.equal(sp._dynamicNear([0, 1, 0], 20, () => false), 0, 'a cast-only one is no reason to redraw it');
  const src = rd('src/render/shadowPass.js');
  assert.equal((src.match(/b\.noShadow \|\| b\.castOnly/g) || []).length, 4, 'every door a noShadow flat is turned away at - the replay, the movers and both signatures');
});

test('MWNPC16d the rig: drawThird records its body for the maps where it is asked - its mesh, its model, a sphere about its posed box - and never a veiled body\'s; castThird records the body out of the view at the same place, where its sphere reaches a map (mutants: the cast unasked; the veil cast; castThird past the reach)', async () => {
  const cast = [];
  let reach = true;
  const r = countingRenderer();
  const quads = [];
  const renderer = { ...r, drawCharacterSpriteQuad: (_t, at, halfW, halfH) => quads.push({ at: [...at], halfW, halfH }), recordShadowBody: (mesh, model, sphere) => cast.push({ mesh, model: [...model], sphere: [...sphere] }), shadowReachSphere: () => reach };
  const arm = createFpArm();
  arm.attach(renderer, () => ({ pos: [0, 0, 0], yaw: 0, pitch: 0, move: { forward: 0, speed: 0, grounded: true } }));
  assert.equal((await arm.build({ race: 'fprace', deps: fixtureBodyDeps() })).ok, true);
  arm.setViewMode('third');
  arm.update(1 / 60, { pose: true });
  const proj = perspective(1, 1, 0.1, 100), view = lookAt([0, 1.6, 4], [0, 1, 0], [0, 1, 0]);
  const at = { proj, view, eye: [0, 1.6, 4], feet: [2, 0, -1], yaw: 0.7 };
  assert.equal(arm.drawThird({}, at), true);
  assert.equal(cast.length, 0, 'not asked: nothing recorded (the player\'s own, a peer\'s)');
  assert.equal(arm.drawThird({}, { ...at, cast: true }), true);
  assert.equal(cast.length, 1, 'asked: its body');
  const [c] = cast;
  assert.ok(c.mesh && c.mesh.vao, 'the third body\'s own mesh');
  assert.ok(Math.abs(c.model[12] - 2) < 1e-6 && Math.abs(c.model[13]) < 1e-6 && Math.abs(c.model[14] + 1) < 1e-6, 'its model stands it on its feet');
  const q = quads.at(-1);   // the picture it was drawn as (the fixture's body is a few centimetres tall)
  assert.ok(Math.hypot(q.at[0] - c.sphere[0], q.at[1] - c.sphere[1], q.at[2] - c.sphere[2]) < c.sphere[3], 'the picture\'s middle inside the sphere');
  assert.ok(c.sphere[3] >= q.halfH * 0.9 && c.sphere[3] < 4 * Math.hypot(q.halfW, q.halfH), `a sphere of the body's own size (${c.sphere[3]} against ${q.halfW} x ${q.halfH})`);
  assert.ok(Math.hypot(c.sphere[0] - 2, c.sphere[2] + 1) < 2 * c.sphere[3] && c.sphere[1] > 0, 'about its feet, above the ground');
  assert.equal(arm.drawThird({}, { ...at, cast: true, conceal: { mode: 1, alpha: 0.3, t: 0, phase: 0 } }), true);
  assert.equal(cast.length, 1, 'a veiled body casts nothing');
  assert.equal(arm.castThird({ feet: [2, 0, -1], yaw: 0.7 }), true);
  assert.equal(cast.length, 2);
  assert.deepEqual(cast[1].model, c.model, 'out of the view: the same place, the same model');
  assert.deepEqual(cast[1].sphere, c.sphere, 'and the same sphere');
  reach = false;
  assert.equal(arm.castThird({ feet: [2, 0, -1], yaw: 0.7 }), false, 'past every map\'s reach: not recorded');
  assert.equal(cast.length, 2);
  arm.setViewMode('first');
  assert.equal(arm.castThird({ feet: [2, 0, -1], yaw: 0.7 }), false, 'no third body standing: nothing');
});

/** a rig that records how it was drawn and cast */
const recording = (rigs) => () => {
  const r = { mode: 'first', draws: [], casts: [], skinned: false,
    attach() {}, async build() { await flush(); return { ok: true }; },
    canThirdPerson: () => true, raceHeightScale: () => 1, setViewMode(m) { r.mode = m; return true; },
    thirdActive: () => r.mode === 'third' && r.skinned,
    update(dt, opts) { if (opts?.pose !== false) r.skinned = true; },
    drawThird(_c, o) { r.draws.push(o.cast); return r.thirdActive(); },
    castThird(o) { r.casts.push(o); return true; },
    unload() {}, setSheathed() {}, revive() {},
  };
  rigs.push(r);
  return r;
};
const toScene = (p) => [p.x, p.y, p.z];
const peer = (id, z) => ({ id, name: '', told: true, look: { race: 'Breton', gender: 'male', faceIndex: 0, items: [] }, shown: { x: 0, y: 0, z, yaw: 0, pitch: 0, mv: 0, wd: 0, an: 0, as: 0, cn: 0 } });
const PROJ = perspective(1.2, 1.5, 0.1, 200), VIEW = lookAt([0, 1.6, 0], [0, 1.6, -1], [0, 1, 0]);   // looking down -z

test('MWNPC16e PeerBodies asks the cast of a lane that casts: a seen body drawn casting, an unseen one cast where it stands, a veiled one neither, a body the travel view grows neither; the peers\' lane none at all; every NPC lane casts (mutants: casts on for the peers; the unseen not cast; the grow ignored)', async () => {
  const run = async (casts, grow = null) => {
    const rigs = [];
    const pb = new PeerBodies({ renderer: {}, createRig: recording(rigs), buildOpts: () => ({}), now: () => 1000, casts });
    for (let i = 0; i < 4; i++) { pb.sync([peer('front', -5), peer('back', 5)], toScene, 1 / 60, [0, 0, 0]); await settle(); pb.draw({}, { proj: PROJ, view: VIEW, eye: [0, 1.6, 0], grow }); }
    return rigs;
  };
  const [front, back] = await run(true);
  assert.ok(front.draws.length > 0 && front.draws.every((c) => c === true), 'seen: drawn casting');
  assert.equal(front.casts.length, 0, 'and not cast a second time');
  assert.equal(back.draws.length, 0, 'behind the eye: not drawn');
  assert.ok(back.casts.length > 0, 'but cast where it stands');
  assert.deepEqual(back.casts.at(-1), { feet: [0, 0, 5], yaw: 0, grow: 1 });
  const peers = await run(false);
  assert.ok(peers[0].draws.every((c) => c === false), 'a peer\'s body: no cast asked');
  assert.equal(peers[1].casts.length, 0, 'nor out of the view');
  const grown = await run(true, () => 6);
  assert.ok(grown[0].draws.length > 0 && grown[0].draws.every((c) => c === false), 'the travel view\'s grown body casts no giant\'s shadow');
  assert.equal(grown[1].casts.length, 0);
  // the veiled: drawn in the late pass, never cast
  const rigs = [];
  const pb = new PeerBodies({ renderer: {}, createRig: recording(rigs), buildOpts: () => ({}), now: () => 1000, casts: true });
  const veil = { mode: 1, alpha: 0.3, t: 0, phase: 0 };
  for (let i = 0; i < 4; i++) { pb.sync([peer('ghost', -5), peer('shade', 5)], toScene, 1 / 60, [0, 0, 0], { conceal: () => veil }); await settle(); pb.draw({}, { proj: PROJ, view: VIEW, eye: [0, 1.6, 0] }); pb.drawVeiled(); }
  assert.ok(rigs[0].draws.length > 0 && rigs[0].draws.every((c) => c === false), 'a veiled body is drawn, casting nothing');
  assert.equal(rigs[1].casts.length, 0, 'nor out of the view');
  // every NPC lane is a casting one
  const laneRigs = [];
  const lane = createNpcBodies({ renderer: {}, createRig: recording(laneRigs), now: () => 1000 });
  for (let i = 0; i < 4; i++) {
    lane.begin(); lane.stand('folk', { id: 1, look: { race: 'Breton', gender: 'male', faceIndex: 0, items: [] }, feet: [0, 0, -4] });
    lane.end(1 / 60, [0, 0, 0]); await settle(); lane.draw({}, { proj: PROJ, view: VIEW, eye: [0, 1.6, 0] });
  }
  assert.ok(laneRigs[0].draws.length > 0 && laneRigs[0].draws.every((c) => c === true), 'an NPC\'s body casts its own shadow');
  lane.destroy();
});

test('MWNPC16f the wiring, by source: the renderer hands the pass the skinned VS and its palette door, records a body for the maps alone, and keeps the unit\'s word; the rig marks a released mesh dead', () => {
  const r = rd('src/render/renderer.js');
  assert.match(r, /recordShadowBody\(mesh, modelMatrix, sphere\) \{ if \(this\._casting && mesh\?\.vao\) this\._shadows\.recordCharacter\(mesh, modelMatrix, sphere\); \}/);
  assert.match(r, /holdSkin: this\._holdSkinFn,/, 'the palette door in the frame the pass is handed');
  const hold = r.slice(r.indexOf('  _holdSkin(tex) {'), r.indexOf('  _holdSkin(tex) {') + 500);
  assert.match(hold, /this\._activeUnit = null;\n    this\._activeTexture\(gl\.TEXTURE0 \+ SKIN_PALETTE_UNIT\);/, 'the selector forgotten first - the pass selects its units raw');
  assert.match(hold, /this\._skinUnitHolds = want;/, 'the unit\'s word kept, so a palette let go is never left on it');
  assert.match(r, /shadowReachSphere\(x, y, z, r\) \{ return this\._casting && this\._shadows\.reachesSphere\(x, y, z, r\); \}/);
  const arm = rd('src/combat/fpArm.js');
  assert.match(arm, /if \(m\.skin\) renderer\.releaseCharacterSkin\(m\);[^\n]*\n {6}m\._dead = true;/, 'a released mesh casts nothing from a record made before it went');
  assert.match(rd('src/characters/npcBodies.js'), /gate: BODY_BUILD_GATE, casts: true,/);
});
