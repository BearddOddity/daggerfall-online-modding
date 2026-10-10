// FAR-SEA1 (2026-10-10, Mac: "Anyway we can fix the draw distance for oceans without affecting performance?") -
// THE SEA REACHES THE HORIZON. From a mountain over the sea the streamed water faded into the world fog at the fog's
// end, stood fully fogged to the streamed grid's square edge, and past it the far ring's sea came back at its 85%
// haze hold - darker than the band in front of it. Pinned with no GL and no game data: the horizon's one haze law
// (run on the shader's own text by test/glsl.mjs), the ring's sea and its look, the sea inside the hole and its gate,
// the water's sea-level arm and the frame's wiring.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { glslFunctions } from './glsl.mjs';
import { HORIZON_HAZE_GLSL, RING_SEA_GLSL, SEA_HAZE_BAND } from '../src/render/horizonHaze.js';
import {
  buildFarRingGrid, buildFarRingIndices, buildSeaFillIndices, ringHeight, FarRingRenderer,
  RING_HAZE_HOLD, RING_RIM_START, RING_RIM_END, RING_RADIUS, RING_REBUILD_DRIFT,
} from '../src/render/farRing.js';
import { EL_FAR_RING_FS } from '../src/render/enhancedLighting.js';
import { classicShadowLane } from '../src/render/classicShadowLane.js';
import { waterSurfaceFs, WATER_F0, WATER_LIFT, SWELL_GALE } from '../src/render/waterSurface.js';
import { Renderer, WORLD_FRAME } from '../src/render/renderer.js';
import { TERRAIN_SIZE } from '../src/world/terrainSampler.js';
import { CLIMATES } from '../src/formats/mapsFile.js';

const rd = (p) => readFileSync(p, 'utf8');
const close = (a, b, m, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${m}: ${a} !~ ${b}`);
const haze = glslFunctions(HORIZON_HAZE_GLSL);
const hz = (d, start, end) => haze.horizonHaze(d, start, end, RING_RIM_START, RING_RIM_END, RING_HAZE_HOLD);

test('FAR-SEA1: the horizon\'s haze is the world fog\'s own ramp CAPPED at the hold, then closed over the ring\'s rim', () => {
  // nearer than the hold it is the world's linear fog exactly - DFU's sunny row, scaled to Land view 5 (0..4000)
  for (const d of [0, 400, 1000, 2000, 3000, 3400]) close(hz(d, 0, 4000), d / 4000, `d ${d}: the world's ramp`);
  // past it the hold - not the world's solid fog
  for (const d of [3500, 4000, 4500, 6000, 9000, RING_RIM_START]) close(hz(d, 0, 4000), RING_HAZE_HOLD, `d ${d}: the hold`);
  // the rim closes it into the sky
  const mid = (RING_RIM_START + RING_RIM_END) / 2;
  close(hz(mid, 0, 4000), RING_HAZE_HOLD + (1 - RING_HAZE_HOLD) * 0.5, 'half way through the rim, half the rest');
  close(hz(RING_RIM_END, 0, 4000), 1, 'the rim: all sky');
  close(hz(RING_RIM_END * 2, 0, 4000), 1, 'never past one');
  // a fog that starts late (Dynamic Skies' Sunny, 2000 to 3600 - AUDIT 61 F9) ramps from its own start
  close(hz(2000, 2000, 3600), 0, 'clear to the start');
  close(hz(2800, 2000, 3600), 0.5, 'half way');
  close(hz(5000, 2000, 3600), RING_HAZE_HOLD, 'and held');
  // the scaled form it replaced (hold * ramp) left the ring LESS fogged than the ground beside it inside the ramp
  assert.notEqual(Math.abs(hz(1000, 0, 4000) - RING_HAZE_HOLD * 0.25) < 1e-9, true, 'capped, not scaled');
});

test('FAR-SEA1: the constants - the hold is EV8\'s, the rim is the nearest rim a drifted base presents', () => {
  assert.equal(RING_HAZE_HOLD, 0.85);
  close(RING_RIM_END, (RING_RADIUS - RING_REBUILD_DRIFT) * TERRAIN_SIZE * 0.95, 'AUDIT EV F-R3\'s rim', 1e-6);
  close(RING_RIM_START, RING_RIM_END * 0.6, 'the close starts at six tenths of it', 1e-6);
  assert.ok(RING_RIM_START > (6 + 1) * TERRAIN_SIZE * Math.SQRT2, 'the rim opens past every streamed grid\'s farthest corner (Land view 6): the sea in the grid is held, never closed');
});

test('FAR-SEA1: the ring\'s sea under the sky is the water\'s own deep-sea arm - its Fresnel, its reflected sky', () => {
  const fs = waterSurfaceFs('', '');
  // the water's terms, as the surface shader writes them (a flat sea: n is up, so NdV is the facing and R.y is too)
  assert.ok(fs.includes('float F = uF0 + (0.85 - uF0) * pow(1.0 - NdV, 5.0);'), 'the water\'s Fresnel');
  assert.ok(fs.includes('vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, clamp(0.2 + R.y * 1.4, 0.0, 1.0));'), 'the water\'s sky');
  assert.ok(fs.includes('own = lit * (vec3(1.0) - T) * (1.0 - F) + skyRefl * F;'), 'the deep sea: T is nothing, so own is lit * (1 - F) + skyRefl * F');
  const lit = [0.1, 0.2, 0.3], zen = [0.2, 0.35, 0.7], hor = [0.65, 0.78, 0.92];
  for (const ndv of [0, 0.05, 0.2, 0.6, 1]) {
    const F = WATER_F0 + (0.85 - WATER_F0) * (1 - ndv) ** 5;
    const t = Math.min(1, Math.max(0, 0.2 + ndv * 1.4));
    const got = haze.seaSky(lit, ndv, zen, hor, WATER_F0);
    for (let c = 0; c < 3; c++) close(got[c], lit[c] * (1 - F) + (hor[c] + (zen[c] - hor[c]) * t) * F, `ndv ${ndv} channel ${c}`);
  }
  // grazing it is mostly sky, straight down mostly body - so a far ring sea lit as flat ground would read darker
  assert.ok(haze.seaSky(lit, 0.05, zen, hor, WATER_F0)[2] > haze.seaSky(lit, 1, zen, hor, WATER_F0)[2] + 0.3);
});

test('FAR-SEA1: every ring shader - classic, the lane, the classic-shadow lane - fades by the one law and lights its sea', () => {
  const fr = rd('src/render/farRing.js');
  const classicFs = fr.slice(fr.indexOf('const FS = `#version 300 es'), fr.indexOf('}`;', fr.indexOf('const FS = `#version 300 es')));
  const lane = classicShadowLane().farRingFs;
  for (const [name, src] of [['classic', classicFs], ['lane', EL_FAR_RING_FS], ['classic shadows', lane]]) {
    const text = name === 'classic' ? src.replace('${RING_SEA_GLSL}', RING_SEA_GLSL) : src;
    assert.ok(text.includes('horizonHaze(vDist, uFogStart, uFogEnd, uRimStart, uRimEnd, uHazeHold)'), `${name}: the haze is the law's`);
    assert.ok(!/uHazeHold \* clamp\(/.test(text), `${name}: the scaled ramp is gone`);
    const v = name === 'classic' ? 'lit' : 'shown';   // the lane sums the sky in display space, after the tonemap, where the water does
    assert.ok(text.includes(`${v} = mix(${v}, seaSky(${v}, ringSeaFacing(), uSkyZenith, uSkyHorizon, uSeaF0), vSea * uSeaLook);`), `${name}: the sea under its sky, when there is one`);
    assert.ok(text.includes('uniform vec3 uSkyZenith;') && text.includes('in float vSea;'), `${name}: declared where it is read`);
  }
  assert.ok(fr.includes('layout(location=3) in float aSea;') && fr.includes('vSea = aSea;'), 'the vertex shader carries the sea');
  // the facing: the eye's direction dotted with the world's up, both in eye space
  const f = glslFunctions(RING_SEA_GLSL, { vView: [0, -100, -1000], vUp: [0, 1, 0], vSea: 1, uSkyZenith: [0, 0, 0], uSkyHorizon: [0, 0, 0], uSeaF0: 0.02, uSeaLook: 1 });
  close(f.ringSeaFacing(), 100 / Math.hypot(100, 1000), 'a sea 1000 out and 100 below the eye faces it at sin(5.7 deg)');
});

test('FAR-SEA1: the ring\'s sea is a water pixel at the sea\'s own height - not land, not an Ocean-climate pixel standing up', () => {
  const W = 40, H = 40;
  const bytes = new Uint8Array(W * H).fill(0);
  bytes[20 * W + 20] = 60;   // an island
  bytes[20 * W + 21] = 2;    // shallows (a water byte, still at the sea's clamp)
  bytes[21 * W + 20] = 30;   // land under the Ocean climate
  const climateAt = (x, y) => (x === 20 && y === 21 ? CLIMATES.Ocean : 231);
  const g = buildFarRingGrid({ heightBytes: bytes, mapWidth: W, mapHeight: H, climateAt, baseX: 20, baseY: 20, radius: 3 });
  const at = (px, py) => g.sea[(py - 20 + 3) * g.side + (px - 20 + 3)];
  assert.equal(at(19, 19), 255, 'open sea');
  assert.equal(at(21, 20), 255, 'the shallows');
  assert.equal(at(20, 20), 0, 'the island');
  assert.equal(at(20, 21), 0, 'an Ocean-climate pixel above the sea is not the sea');
  assert.equal(g.positions[((20 - 20 + 3) * g.side + (19 - 20 + 3)) * 3 + 1], Math.fround(ringHeight(0)), 'and the sea stands at the clamp (f32 storage)');
});

test('FAR-SEA1: the sea inside the hole - only fully-inside cells, only four sea corners, never a cell the ring keeps', () => {
  const W = 60, H = 60, baseX = 30, baseY = 30, radius = 8, d = 3;
  const bytes = new Uint8Array(W * H).fill(0);
  bytes[30 * W + 31] = 80;   // an island inside the streamed rect
  const g = buildFarRingGrid({ heightBytes: bytes, mapWidth: W, mapHeight: H, climateAt: () => 231, baseX, baseY, radius });
  const hole = { baseX, baseY, radius, holeX: 30, holeY: 30, holeRadius: d };
  const ring = buildFarRingIndices(hole);
  const fill = buildSeaFillIndices({ ...hole, sea: g.sea });
  const side = radius * 2 + 1;
  const cellsOf = (idx) => { const s = new Set(); for (let t = 0; t < idx.length; t += 6) { const i0 = idx[t]; s.add(`${baseX - radius + (i0 % side)},${baseY - radius + Math.floor(i0 / side)}`); } return s; };
  const ringCells = cellsOf(ring), fillCells = cellsOf(fill);
  for (const c of fillCells) assert.ok(!ringCells.has(c), `cell ${c}: drawn once`);
  // the island's pixel is a corner of four cells: (30,29) (31,29) (30,30) (31,30) - every one left out
  for (const c of ['30,29', '31,29', '30,30', '31,30']) assert.ok(!fillCells.has(c), `cell ${c} touches the island`);
  assert.equal(fillCells.size, (2 * d) ** 2 - 4, 'every other fully-inside cell is the sea');
  assert.equal(ringCells.size + fillCells.size, (side - 1) ** 2 - 4, 'with the ring, the whole mesh but the island\'s four');
  // the same winding as the ring's cells
  assert.deepEqual([...fill.subarray(0, 6)].map((i) => i - fill[0]), [0, side, side + 1, 0, side + 1, 1]);
  // an all-land hole fills nothing
  const land = buildFarRingGrid({ heightBytes: new Uint8Array(W * H).fill(90), mapWidth: W, mapHeight: H, climateAt: () => 231, baseX, baseY, radius });
  assert.equal(buildSeaFillIndices({ ...hole, sea: land.sea }).length, 0);
});

/** A GL that hands names for locations and records what it is told. */
function recordingGl() {
  const calls = [];
  let ids = 0;
  const gl = new Proxy({}, {
    get(_, k) {
      if (k === 'getProgramParameter' || k === 'getShaderParameter') return () => true;
      if (k === 'getUniformLocation') return (_p, n) => n;
      if (k === 'getAttribLocation') return () => 0;
      if (typeof k === 'string' && k.startsWith('create')) return () => ({ id: ++ids });
      if (k === 'getParameter') return () => new Float32Array(4);
      if (typeof k === 'string' && /^TEXTURE\d+$/.test(k)) return 1000 + Number(k.slice(7));
      if (typeof k === 'string' && k.toUpperCase() === k) return k;
      return (...args) => { calls.push([k, ...args.map((a) => (ArrayBuffer.isView(a) ? Array.from(a) : a))]); };
    },
  });
  return { gl, calls };
}

test('FAR-SEA1: the pass - the sea\'s attribute, the sea inside the hole drawn as the range\'s tail and only when asked, its sky and Fresnel', () => {
  const { gl, calls } = recordingGl();
  const r = new FarRingRenderer(gl);
  const W = 400, H = 400;
  r.build({ heightBytes: new Uint8Array(W * H).fill(0), mapWidth: W, mapHeight: H, climateAt: () => 231, baseX: 200, baseY: 200 }, 200, 200, 5);
  assert.ok(calls.some((c) => c[0] === 'vertexAttribPointer' && c[1] === 3 && c[2] === 1 && c[3] === 'UNSIGNED_BYTE' && c[4] === true), 'the sea weight on location 3, one normalised byte');
  const side = RING_RADIUS * 2 + 1;
  assert.equal(r.ringCount, ((side - 1) ** 2 - 100) * 6, 'the ring keeps its hole');
  assert.equal(r.indexCount, (side - 1) ** 2 * 6, 'and an open sea fills it');
  const opts = { origin: [0, 0, 0], lightDir: [0, 1, 0], ambient: [0.4, 0.4, 0.4], sunScale: 0.5, sunColor: [1, 1, 1], fogColor: [0.6, 0.7, 0.8], fogEnd: 4000, fovY: 1, aspect: 1.6 };
  const draws = () => calls.filter((c) => c[0] === 'drawElements').map((c) => c[2]);
  calls.length = 0;
  r.draw(new Float32Array(16), opts);
  assert.deepEqual(draws(), [r.indexCount], 'the eye above the sea: the whole range, one draw');
  assert.equal(calls.find((c) => c[0] === 'uniform1f' && c[1] === 'uSeaLook')[2], 0, 'no sky handed (the classic panorama): the sea lit as ground, never a day sky at night');
  assert.equal(calls.find((c) => c[0] === 'uniform1f' && c[1] === 'uSeaF0')[2], WATER_F0, 'the water\'s own Fresnel');
  close(calls.find((c) => c[0] === 'uniform1f' && c[1] === 'uRimEnd')[2], RING_RIM_END, 'the rim the sea closes over', 1e-6);
  calls.length = 0;
  r.draw(new Float32Array(16), { ...opts, seaFill: false, skyZenith: [0.1, 0.2, 0.3], skyHorizon: [0.4, 0.5, 0.6] });
  assert.deepEqual(draws(), [r.ringCount], 'under the sea: the ring alone');
  assert.deepEqual(calls.find((c) => c[0] === 'uniform3fv' && c[1] === 'uSkyZenith')[2], [0.1, 0.2, 0.3], 'the frame\'s sky');
  assert.equal(calls.find((c) => c[0] === 'uniform1f' && c[1] === 'uSeaLook')[2], 1, 'and the sea under it');
  r.dispose();
  assert.equal(r.ringCount, 0);
});

test('FAR-SEA1: the water - the sea\'s level takes the ring\'s haze under linear fog when the host set it, nothing else does', () => {
  const fs = waterSurfaceFs('', '');
  assert.ok(fs.includes('uniform vec4 uSeaHaze;'), 'declared');
  assert.ok(fs.includes(HORIZON_HAZE_GLSL), 'the law\'s own text');
  assert.ok(fs.includes(`if (uSeaHaze.x > 0.0 && uFogMode == 1 && abs(vWorldPos.y - uSeaHaze.w) < ${SEA_HAZE_BAND.toFixed(2)}) {\n    fw = 1.0 - horizonHaze(length(vWorldPos - focusOrigin()), uFogRange.x, uFogRange.y, uSeaHaze.y, uSeaHaze.z, uSeaHaze.x);`),
    'off unless set, linear fog only, the sea\'s band only, from the fog\'s own eye');
  assert.ok(fs.indexOf('fw = 1.0 - horizonHaze(') > fs.indexOf('float fw = fogFactorAt(vWorldPos);')
    && fs.indexOf('fw = 1.0 - horizonHaze(') < fs.indexOf('vec3 fogged = own * fw'), 'between the world\'s factor and its use');
  // the band holds the sheet: its lift and a gale's whole swell, the sum of the trains' amplitudes
  assert.ok(WATER_LIFT + SWELL_GALE < SEA_HAZE_BAND && SEA_HAZE_BAND <= 1, 'the sea\'s sheet inside its band, a lake 2 m above the coast outside it');
  // nearer than the hold the arm is the world's linear factor exactly - fogGlsl's clamp((end - d) / (end - start))
  for (const d of [100, 900, 2600, 3300]) close(1 - hz(d, 0, 4000), Math.min(1, Math.max(0, (4000 - d) / 4000)), `d ${d}`);
});

test('FAR-SEA1: the renderer - setSeaHaze reaches the water\'s frame block, beginFrame clears it, the open sea takes it too', () => {
  const { gl, calls } = recordingGl();
  const r = new Renderer({ getContext: () => gl, clientWidth: 320, clientHeight: 200, width: 320, height: 200 });
  const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  const P = new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1]), N = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), IX = new Uint32Array([0, 2, 1, 1, 2, 3]);
  const sheet = r.createWaterSheet(IX, { terrain: r.createTerrainSurface(P, N, IX) });
  const wu = { time: 0, windDir: [1, 0], windStrength: 0, swell: 0.05, absorb: [0.5, 0.3, 0.2], rain: 0, zenith: [0.2, 0.3, 0.6], horizon: [0.6, 0.7, 0.8], tint: [0.4, 0.5, 0.6], f0: 0.02, shoreSoft: 0.16, lift: 0.08 };
  const seaHaze = () => calls.filter((c) => c[0] === 'uniform4fv' && c[1] === 'uSeaHaze').map((c) => c[2]);
  r.beginFrame(I, I, new Float32Array([0.3, 0.8, 0.2]), WORLD_FRAME);
  r.setSeaHaze(RING_HAZE_HOLD, RING_RIM_START, RING_RIM_END, 42.5);
  calls.length = 0;
  r.drawWaterSurface(sheet, I, { id: 'arr' }, { id: 'map' }, 6.4, wu);
  const set = seaHaze();
  assert.equal(set.length, 1, 'once a call');
  [RING_HAZE_HOLD, RING_RIM_START, RING_RIM_END, 42.5].forEach((v, i) => close(set[0][i], v, `component ${i}`, 1e-3));
  calls.length = 0;
  r.drawSeaSurfaces([{ h: { surface: { vao: { id: 'sea' }, count: 6 } }, model: I }], 0, wu, [1, 1, 1], { id: 'arr' });
  assert.equal(seaHaze()[0][0] > 0.8, true, 'Iliac Puddle No More\'s open sea, the same block');
  r.beginFrame(I, I, new Float32Array([0.3, 0.8, 0.2]), WORLD_FRAME);
  calls.length = 0;
  r.drawWaterSurface(sheet, I, { id: 'arr' }, { id: 'map' }, 6.4, wu);
  assert.equal(seaHaze()[0][0], 0, 'a frame\'s: the next frame is the world\'s fog alone until its host draws the ring');
  r.setSeaHaze(RING_HAZE_HOLD, 1, 2, 3); r.setSeaHaze(null);
  calls.length = 0;
  r.drawWaterSurface(sheet, I, { id: 'arr' }, { id: 'map' }, 6.4, wu);
  assert.equal(seaHaze()[0][0], 0, 'null turns it off');
});

test('FAR-SEA1: the world host - the ring takes the water\'s sky and the gate, and the sea its haze, on a frame the ring is drawn', () => {
  const w = rd('src/scenes/world.js');
  const at = w.indexOf('    const frameRing = () => {   // PERF-V8');
  const ring = w.slice(at, w.indexOf('    frameRing();', at));
  assert.ok(ring.includes("if (farRing && fogNow.mode === 'linear') {"), 'the ring\'s own gate');
  assert.ok(ring.includes('skyZenith: waterSkyNow?.zenith, skyHorizon: waterSkyNow?.horizon, seaFill: renderer._camPos[1] > seaYNow,'), 'the dome\'s sky; the sea inside the hole with the eye above the sea');
  const setAt = ring.indexOf('if (waterSkyNow) renderer.setSeaHaze(RING_HAZE_HOLD, RING_RIM_START, RING_RIM_END, seaYNow);');
  assert.ok(setAt > 0, 'only with a sky to reflect - under the classic panorama the water reflects a fixed day the hold would show at night');
  assert.ok(setAt > ring.indexOf('farRing.draw(view, {'), 'set beside the draw');
  assert.match(ring, /\n      if \(waterSkyNow\) renderer\.setSeaHaze\(RING_HAZE_HOLD, RING_RIM_START, RING_RIM_END, seaYNow\);\n    \}\n    \};\n$/,
    'the gate\'s last statement - never on a frame without the ring (?ring=off, exp fog), where the held sea would meet the bare sky');
  assert.ok(w.indexOf('    const seaYNow = farRing ? tvSeaY() : 0;') < at, 'the sea\'s height read before the ring');
  assert.ok(w.indexOf('    frameRing();') < w.indexOf('    frameWater();'), 'the haze is set before the water draws');
  assert.match(w, /import \{ FarRingRenderer, ringDisabled, ringHeight, RING_HAZE_HOLD, RING_RIM_START, RING_RIM_END \} from '\.\.\/render\/farRing\.js';/);
  // the other water hosts never set it: the fixed city, the dungeon, the lab fog their water as before
  for (const f of ['src/scenes/exterior.js', 'src/scenes/dungeonContext.js', 'src/scenes/worldModes.js', 'src/tools/waterLab.js']) assert.ok(!rd(f).includes('setSeaHaze'), `${f}: the world's fog alone`);
});
