// ETHER-DEEP (2026-10-12, the owner: "the area below water is very shallow and has no depth"; bible/03-World/
// Eltheric-Ocean.md ETHER-DEEP) - THE ELTHERIC OCEAN CARVED BY ITS OWN BAKE. Iliac Puddle No More's bake was the Bay's
// 1000 x 500: past the Veil nothing was carved and the sea stood a stride deep on the kernel's clamp. The Eltheric's
// box is a bake's own frame now (world/etherWatersBake.js), built by the Bay's own rules from the composed ground: its
// classes the bound's, its flood an isle's cell at a time (every cell's ring is open sea - pinned here over three whole
// rows of the box), its places' rects their templates', its queries the frame's own cells. Its open water is the
// Ocean's plain under the player's Water Depth, and every arm of the promote carves it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { WoodsFile } from '../src/formats/woodsFile.js';
import {
  DeepWatersBake, BAY_FRAME, inFrame, floodSteps, classifyPixel, coarseCandidateBits, pixelWaterSampler, PIXEL_SEA, PIXEL_LAND, PIXEL_MIXED, BAKE_DISTANCE_CAP, BAKE_DISTANCE_SCALE_METERS,
} from '../src/world/deepWatersBake.js';
import {
  EtherWatersBake, DeepWatersBakes, ETHER_FRAME, ETHER_KEEP_MAX, ETHER_KEEP_RADIUS, ETHER_ROW, etherPlaceRects, etherRectAt, worldBakes, waterFrameOf,
} from '../src/world/etherWatersBake.js';
import {
  etherWoods, etherClimateAt, ETHER_BOX, ISLE_CELL_PX, CELLS_W, CELLS_H, VEIL_X, veilhaven, landfall, isleOfCell, etherCellOf,
} from '../src/world/ethericSea.js';
import { etherTemplateOf } from '../src/world/etherPlaces.js';
import { generateSamples } from '../src/world/terrainSampler.js';
import { generateTileData, assignTiles } from '../src/world/terrainTiles.js';
import { convertTilemap } from '../src/world/terrainSurface.js';
import { buildDeepWatersPixel, DW_OCEAN_LOCAL_Y } from '../src/world/deepWatersPixel.js';
import { DeepWaterTileData } from '../src/world/deepWaterTileData.js';
import { sampleMeshLocalY, TILE_WORLD_SIZE } from '../src/world/deepWaterFloor.js';
import { sampleDepthMeters } from '../src/world/deepBathymetry.js';
import { loadDeepWatersBake } from '../src/world/deepWatersClient.js';
import { createDeepWatersHost } from '../src/scenes/deepWatersHost.js';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/** A raw WOODS.WLD whose every byte is a mountain and every detail its highest - so a composed reader that read the raw
 *  file's bytes past the map (the bake's fast path) would stand land all over the Eltheric. */
function rawMountains() {
  const N = 1000 * 500, hdr = 32 + 28 * 4, offs = N * 4, blk = 22 + 25;
  const heightOffset = hdr + offs, dataOffset = heightOffset + N;
  const bytes = new Uint8Array(dataOffset + blk);
  const v = new DataView(bytes.buffer);
  v.setUint32(0, 4, true); v.setUint32(4, 1000, true); v.setUint32(8, 500, true); v.setUint32(28, heightOffset, true);
  for (let i = 0; i < N; i++) v.setUint32(hdr + i * 4, dataOffset, true);
  bytes.fill(200, heightOffset, heightOffset + N);
  bytes.fill(9, dataOffset + 22, dataOffset + blk);
  const w = new WoodsFile();
  assert.ok(w.load(bytes));
  return w;
}
const RAW = rawMountains();
const GROUND = etherWoods(RAW);
const bake = () => new EtherWatersBake({ woods: GROUND });
const cellCorner = (cx, cy) => [ETHER_BOX.x0 + cx * ISLE_CELL_PX, ETHER_BOX.y0 + cy * ISLE_CELL_PX];
/** Cells whose flood keeps a pond out - found by search over the box (each a candidate cell no ring reaches). */
const POND_CELLS = [[547, 1], [418, 4], [361, 22], [436, 22]];

test('ETHER-DEEP: the raw file\'s bytes are the raw file\'s - a composed reader answers the Eltheric through its own door (mutant: the inherited bytes read)', () => {
  assert.equal(classifyPixel(RAW, 10, 10), PIXEL_LAND, 'the raw file itself: its own fast path, its mountains');
  const open = landfall();
  assert.equal(classifyPixel(GROUND, open.px, open.py), PIXEL_SEA, 'the landfall\'s open water, as the sea\'s law has it');
  assert.equal(classifyPixel(GROUND, veilhaven().px, veilhaven().py), PIXEL_MIXED, 'Veilhaven\'s town pixel - its shore\'s bound');
});

test('ETHER-DEEP: every cell\'s ring of pixels is open sea by the bound, over three whole rows of the box - so a cell\'s own flood is the box\'s', () => {
  let rings = 0, isles = 0;
  for (const cy of [1, Math.floor(CELLS_H / 2), CELLS_H - 2]) {
    for (let cx = 0; cx < CELLS_W; cx++) {
      if (isleOfCell(cx, cy)) isles++;
      const [x0, y0] = cellCorner(cx, cy);
      for (let k = 0; k < ISLE_CELL_PX; k++) {
        for (const [x, y] of [[x0 + k, y0], [x0 + k, y0 + ISLE_CELL_PX - 1], [x0, y0 + k], [x0 + ISLE_CELL_PX - 1, y0 + k]]) {
          rings++;
          if (classifyPixel(GROUND, x, y) !== PIXEL_SEA) assert.fail(`cell ${cx},${cy}: its ring pixel ${x},${y} is not open sea`);
        }
      }
    }
  }
  assert.ok(isles > 700 && rings > 3 * CELLS_W * 36, `${isles} isles, ${rings} ring pixels`);
});

test('ETHER-DEEP: a cell\'s flood is the flood of the three cells round it - a pond kept out, the shore\'s water in (mutants: candidates for sea; the flood from the wrong cell)', () => {
  const b = bake();
  const cand = (x, y) => coarseCandidateBits(pixelWaterSampler(GROUND, x, y, null));
  let ponds = 0;
  for (const [cx, cy] of [...POND_CELLS, etherCellOf(veilhaven().px, veilhaven().py)]) {
    const [x0, y0] = cellCorner(cx - 1, cy - 1);
    const steps = floodSteps(3 * ISLE_CELL_PX, 3 * ISLE_CELL_PX, (x, y) => classifyPixel(GROUND, x0 + x, y0 + y), (x, y) => cand(x0 + x, y0 + y));
    let r = steps.next();
    while (!r.done) r = steps.next();
    const { state, partialIndex, partialBits } = r.value;
    for (let j = ISLE_CELL_PX; j < 2 * ISLE_CELL_PX; j++) {
      for (let i = ISLE_CELL_PX; i < 2 * ISLE_CELL_PX; i++) {
        const k = j * 3 * ISLE_CELL_PX + i, s = state[k];
        const want = s === 1 ? new Uint8Array(8).fill(0xff) : s === 2 ? partialBits.slice(partialIndex.indexOf(k) * 8, partialIndex.indexOf(k) * 8 + 8) : new Uint8Array(8);
        assert.deepEqual([...b.seaBits(x0 + i, y0 + j)], [...want], `pixel ${x0 + i},${y0 + j}`);
        if (classifyPixel(GROUND, x0 + i, y0 + j) === PIXEL_MIXED && cand(x0 + i, y0 + j).some((v, q) => v !== want[q])) ponds++;
      }
    }
  }
  assert.ok(ponds >= POND_CELLS.length, `a pond kept out in every pond cell (${ponds})`);
});

test('ETHER-DEEP: the frame - the box\'s own cells, the Bay\'s map untouched; a query routed to the bake whose frame holds its pixel (mutants: the Bay\'s frame for the box; the rows misrouted)', () => {
  assert.deepEqual(ETHER_FRAME, { x0: ETHER_BOX.x0, y0: ETHER_BOX.y0, w: ETHER_BOX.x1 - ETHER_BOX.x0, h: ETHER_BOX.y1 - ETHER_BOX.y0 });
  assert.deepEqual(BAY_FRAME, { x0: 0, y0: 0, w: 1000, h: 500 });
  const lf = landfall();
  assert.deepEqual([waterFrameOf(lf.px, lf.py, true), waterFrameOf(lf.px, lf.py, null), waterFrameOf(500, 250, true), waterFrameOf(-5, 250, true)], [ETHER_FRAME, BAY_FRAME, BAY_FRAME, BAY_FRAME]);
  assert.deepEqual([inFrame(ETHER_FRAME, ETHER_BOX.x0, ETHER_BOX.y0), inFrame(ETHER_FRAME, ETHER_BOX.x1, ETHER_BOX.y0), inFrame(ETHER_FRAME, ETHER_BOX.x0, ETHER_BOX.y1 - 1)], [true, false, true]);
  const b = bake();
  // the open Veil: no isle east of Veilhaven's cell, so its water is the cap's distance from any coast
  const far = { px: VEIL_X + 4, py: veilhaven().py + 40 };
  assert.equal(b.sampleDistanceMeters(far.px, far.py, 0.5, 0.5), BAKE_DISTANCE_CAP * BAKE_DISTANCE_SCALE_METERS, 'the open sea, as far from a coast as the planes see');
  assert.equal(b.isWaterAt(far.px, far.py, 0.5, 0.5), true);
  assert.equal(b.isCarvedWater(far.px, far.py, 0.5, 0.5), true);
  assert.equal(b.mapPixelHasLandCells(far.px, far.py), false);
  const h = veilhaven();
  assert.equal(b.mapPixelHasLandCells(h.px, h.py), true, 'Veilhaven\'s town stands on land');
  assert.deepEqual([b.isCarvedWater(h.px, h.py, 0.5, 0.5), b.isWaterAt(h.px, h.py, 0.5, 0.5)], [false, false], 'its middle neither carved nor sea - its own cells, never the box\'s clamped edge');
  assert.ok(b.sampleDistanceMeters(lf.px, lf.py, 0.5, 0.5) < 4000, 'the landfall lies off Veilhaven\'s shore');
  // routed: a bay bake that answers nothing, the Eltheric's beside it
  const bay = new DeepWatersBake({ woods: GROUND, global: { state: new Uint8Array(500000), classes: new Uint8Array(500000), partialIndex: new Int32Array(0), partialBits: new Uint8Array(0) } });
  const both = worldBakes(bay, { woods: GROUND, ether: true });
  assert.ok(both instanceof DeepWatersBakes);
  assert.equal(worldBakes(bay, { woods: GROUND, ether: null }), bay, 'no Eltheric, the Bay\'s alone');
  assert.equal(both.answers(far.px, far.py) && both.answers(500, 250) && !both.answers(-5, 250), true);
  assert.deepEqual([both.frameOf(far.px, far.py), both.frameOf(500, 250)], [ETHER_FRAME, BAY_FRAME]);
  assert.deepEqual([both.isWaterAt(far.px, far.py, 0.5, 0.5), both.isWaterAt(500, 250, 0.5, 0.5)], [true, false]);
  both.prepare(lf.px, lf.py);
  const rows = both.exportPlanes(lf.px, lf.py);
  assert.equal(rows.length, 9, 'the 3 x 3, each with its sea bits and class');
  assert.ok(rows.every((r) => r.f === ETHER_ROW && r.sea?.length === 8 && [PIXEL_SEA, PIXEL_MIXED, PIXEL_LAND].includes(r.cls)));
  const there = worldBakes(new DeepWatersBake({ woods: GROUND, global: { state: new Uint8Array(500000), classes: new Uint8Array(500000), partialIndex: new Int32Array(0), partialBits: new Uint8Array(0) } }), { woods: GROUND, ether: true });
  there.adoptPlanes(rows);
  assert.equal(there.ether._sea.size, 9, 'the other thread adopts the rows - it floods nothing the worker flooded');
  // a pixel by the box's north-west corner: its rows' slots lie inside the Bay's own range, so only the route keeps them out
  const nw = { px: ETHER_BOX.x0 + 5, py: ETHER_BOX.y0 + 5 };
  both.prepare(nw.px, nw.py);
  const low = both.exportPlanes(nw.px, nw.py);
  assert.ok(low.every((r) => r.i < 500000 && r.dist), 'slots the Bay\'s planes could hold');
  there.adoptPlanes(low);
  assert.deepEqual([there.bay._dist.size, there.bay._edge.size], [0, 0], 'and the Bay\'s planes take none of them');
});

test('ETHER-DEEP: the planes are bounded - past ETHER_KEEP_MAX the far ones let go, the near kept (mutant: kept for ever)', () => {
  const b = bake();
  const h = veilhaven();
  for (let i = 0; i <= ETHER_KEEP_MAX; i++) b._sea.set(i, new Uint8Array(8));   // the box's north-west row: far from Veilhaven
  b.prepare(h.px, h.py);
  assert.ok(![...b._sea.keys()].some((i) => i <= ETHER_KEEP_MAX), 'the far planes let go');
  assert.ok(b._sea.size > 0 && b._sea.size < ETHER_KEEP_MAX, `the near built again (${b._sea.size})`);
  for (const i of b._sea.keys()) {
    const x = (i % ETHER_FRAME.w) + ETHER_FRAME.x0, y = Math.floor(i / ETHER_FRAME.w) + ETHER_FRAME.y0;
    assert.ok(Math.max(Math.abs(x - h.px), Math.abs(y - h.py)) <= ETHER_KEEP_RADIUS + ISLE_CELL_PX, `${x},${y} near`);   // the planes' windows' cells
  }
  assert.ok(b.seaBits(h.px, h.py), 'and what is asked again is built again');
});

test('ETHER-DEEP: a place\'s pixel blends with its template\'s rect - the pick the place\'s own (etherTemplateOf), list for list', () => {
  const t = (n) => ({ n });
  const templates = { towns: [t(1), t(2), t(3)], havens: [t(4), t(5)], ruins: [t(6), t(7), t(8), t(9)] };
  const rects = etherPlaceRects(templates, (x) => ({ xMin: x.n, xMax: x.n + 10, yMin: x.n + 20, yMax: x.n + 30 }));
  const at = etherRectAt(rects);
  const h = veilhaven();
  const n = etherTemplateOf(templates, h).n;
  assert.deepEqual(at(h.px, h.py), { xMin: n, xMax: n + 10, yMin: n + 20, yMax: n + 30 }, 'Veilhaven\'s, its haven template\'s');
  assert.equal(at(h.px + 1, h.py), null, 'an isle\'s other pixels stand no place');
  assert.equal(at(landfall().px, landfall().py), null);
  assert.equal(etherRectAt(null)(h.px, h.py), null, 'no templates, no rects');
});

/** A pixel of the Eltheric as the world streams it: its samples, its tiles, its climates. */
function streamed(px, py) {
  const samples = generateSamples(GROUND, px, py);
  const tilemap = new Uint8Array(128 * 128);
  assignTiles(generateTileData(samples, px, py), tilemap, true);
  const climates = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) climates.push(etherClimateAt(px + dx, py + dy));
  return { px, py, samples, tilemap, tilemapBytes: convertTilemap(tilemap), climates, neighbours: {}, waterDepth: 250, spawnSurfaces: true };
}

test('ETHER-DEEP: the open Eltheric is carved to the Ocean\'s plain - its floor, its swim column and its bathymetry agree, a coast\'s shallower (mutant: the Bay\'s bake alone)', () => {
  const both = worldBakes(new DeepWatersBake({ woods: GROUND, global: { state: new Uint8Array(500000), classes: new Uint8Array(500000), partialIndex: new Int32Array(0), partialBits: new Uint8Array(0) } }), { woods: GROUND, ether: true });
  const open = { px: VEIL_X + 4, py: veilhaven().py + 40 };
  const job = streamed(open.px, open.py);
  const r = buildDeepWatersPixel(job, both);
  assert.equal(r.ocean, true);
  assert.ok(r.floor, 'the open sea carved');
  assert.equal(r.cap.hide, true, 'a pure ocean pixel\'s ground not drawn - the floor is the ground');
  const mid = TILE_WORLD_SIZE / 2;
  const floorY = sampleMeshLocalY(r.floor, mid, mid);
  const tile = new DeepWaterTileData({ mapPixelX: open.px, mapPixelY: open.py, mapData: { samples: job.samples, tilemap: job.tilemap }, climateIndex: job.climates[4], climateAt: (x, y) => etherClimateAt(x, y), bake: both });
  assert.equal(tile.isCarvedWaterLocal(mid, mid), true, 'the swim\'s gate: carved water');
  const [nx, nz] = tile.getNoiseWorldCoords(mid, mid);
  const depth = sampleDepthMeters(nx, nz, tile.getBlendedClimateBaseDepth(mid, mid), tile.getDistanceToEdgeMeters(mid, mid), 250);
  assert.ok(depth > 150 && depth <= 250, `the Ocean's plain, under the Water Depth (${depth.toFixed(1)} m)`);
  assert.ok(Math.abs((DW_OCEAN_LOCAL_Y - floorY) - depth) < 25, `the drawn floor is the bathymetry's (${(DW_OCEAN_LOCAL_Y - floorY).toFixed(1)} against ${depth.toFixed(1)})`);
  // the landfall, off Veilhaven's shore: carved, and nearer the coast than the open sea
  const lf = landfall();
  const near = buildDeepWatersPixel(streamed(lf.px, lf.py), both);
  assert.ok(near.ocean && near.floor, 'the landfall carved');
  assert.ok(both.sampleDistanceMeters(lf.px, lf.py, 0.5, 0.5) < both.sampleDistanceMeters(open.px, open.py, 0.5, 0.5));
  // the tree before: one bake, the Bay's, its frame the Bay's clamped corner
  const bayOnly = new DeepWatersBake({ woods: GROUND, global: { state: new Uint8Array(500000), classes: new Uint8Array(500000), partialIndex: new Int32Array(0), partialBits: new Uint8Array(0) } });
  const old = new DeepWaterTileData({ mapPixelX: open.px, mapPixelY: open.py, mapData: { samples: job.samples, tilemap: job.tilemap }, climateIndex: job.climates[4], climateAt: (x, y) => etherClimateAt(x, y), bake: bayOnly });
  assert.equal(old.isCarvedWaterLocal(mid, mid), false, 'read through the Bay\'s corner, no water to swim in');
});

test('ETHER-DEEP: the client builds the Eltheric\'s bake beside the Bay\'s on this thread, and the worker is told to (mutants: the build message without it; the worker\'s reader not composed)', async () => {
  const flat = new WoodsFile();
  {
    const N = 1000 * 500, hdr = 32 + 28 * 4, offs = N * 4, blk = 22 + 25;
    const heightOffset = hdr + offs, dataOffset = heightOffset + N;
    const bytes = new Uint8Array(dataOffset + blk);
    const v = new DataView(bytes.buffer);
    v.setUint32(0, 4, true); v.setUint32(4, 1000, true); v.setUint32(8, 500, true); v.setUint32(28, heightOffset, true);
    for (let i = 0; i < N; i++) v.setUint32(hdr + i * 4, dataOffset, true);
    bytes.fill(60, heightOffset, heightOffset + N);
    assert.ok(flat.load(bytes));
  }
  const ground = etherWoods(flat);
  const kept = new Map(), store = { get: async (k) => kept.get(k), set: async (k, v) => { kept.set(k, v); } };   // the Bay's record built once
  const b = await loadDeepWatersBake({ woods: ground, rects: [], ether: true, workerFactory: null, store });
  assert.ok(b instanceof DeepWatersBakes, 'the world\'s bakes');
  const open = { px: VEIL_X + 4, py: veilhaven().py + 40 };
  assert.deepEqual([b.isWaterAt(open.px, open.py, 0.5, 0.5), b.isWaterAt(500, 250, 0.5, 0.5)], [true, false], 'the Eltheric\'s sea, the Bay\'s land');
  assert.ok(!(await loadDeepWatersBake({ woods: ground, rects: [], workerFactory: null, store }) instanceof DeepWatersBakes), 'not told, the Bay\'s alone');
  let said = null;
  const listening = () => { const w = { terminate() {}, postMessage(m) { said = m; queueMicrotask(() => w.onmessage({ data: { t: 'error', message: 'stop here' } })); } }; return w; };
  await loadDeepWatersBake({ woods: ground, woodsBytes: new Uint8Array(4), rects: [], ether: { towns: [], havens: [], ruins: [] }, workerFactory: listening, store });
  assert.deepEqual(said.ether, { towns: [], havens: [], ruins: [] }, 'the worker\'s build carries the places\' rects');
  const worker = src('src/world/deepWatersWorker.js');
  assert.match(worker, /bake = worldBakes\(new DeepWatersBake\(\{ woods, global: g, locationRectAt \}\), \{ woods: m\.ether \? etherWoods\(woods\) : woods, ether: m\.ether \?\? null \}\);/, 'the worker composes the sea over its own reader');
});

test('ETHER-DEEP: the host carves the Eltheric by every arm, and holds the continent past the map (PIN MOVED from ETHER-HOLD: the box was held with the rest)', async () => {
  const lf = landfall();
  const pixel = (px, py) => ({ px, py, samples: new Float32Array(4), tilemap: new Uint8Array(4), tilemapBytes: new Uint8Array(4) });
  const ether = pixel(lf.px, lf.py), next = pixel(lf.px + 1, lf.py), west = pixel(-5, 250), bay = pixel(500, 250);
  const built = new Map([ether, next, west, bay].map((p) => [`${p.px},${p.py}`, p]));
  const asked = [];
  let answer;
  const floor = () => ({ positions: new Float32Array(9), indices: new Uint32Array(0), floorGridIndexCount: 0, vertexLocalY: new Float32Array(4225) });
  const client = { ready: new Promise((r) => { answer = r; }), buildPixel: async (job) => { asked.push(`${job.px},${job.py}:${job.climates[0]}`); return { ocean: true, floor: floor() }; } };
  const host = createDeepWatersHost({ built, climateAt: (x, y) => (y < 0 ? 77 : 223), currentPixel: () => ({ x: ether.px, y: ether.py }), client, clock: () => 0, ether: true });
  answer({ mapPixelOrCardinalNeighborHasWaterCells: () => true });
  await host.ready;
  for (let i = 0; i < 8; i++) { host.pump(); for (let k = 0; k < 5; k++) await null; }
  assert.equal(await host.promoteNear(ether) !== null || asked.some((a) => a.startsWith(`${ether.px},${ether.py}:`)), true, 'the landfall asked of the worker');
  assert.ok(asked.some((a) => a.startsWith(`${next.px},${next.py}:`)), 'and its neighbour, by the pump');
  assert.ok(!asked.some((a) => a.startsWith('-5,250')), 'the continent past the map held');
  assert.ok(asked.filter((a) => !a.startsWith('500,')).every((a) => a.endsWith(':77')), 'the climates read in the box\'s own frame - never the Bay\'s clamp to row 0');
  assert.ok(asked.some((a) => a === '500,250:223'), 'the Bay\'s pixel as ever');
  assert.match(src('src/scenes/deepWatersHost.js'), /const dw = client \?\? openDeepWaters\(\{ woods, woodsBytes, rects: deepWatersLocationRects\(woods, locations, maps, blocks\), ether \}\);/, 'the host hands the client the sea');
  const world = src('src/scenes/world.js');
  assert.match(world, /ether: etherSea \? etherPlaceRects\(_etherTemplates, \(t\) => setLocationTiles\(\{ \.\.\.t, regionIndex: ETHER_REGION, locationIndex: -1000 \}, maps, blocks, new Uint8Array\(128 \* 128\)\)\) : null,\n\s+\}\) : null;/, 'the world hands the host its places\' rects with the sea standing');
});
