// MINE-PERKS (bible/06-Systems/Professions-Arc.md 43) - the players' feature-feedback thread "Mining perks need buff",
// handed over as screenshots: the Prospector's compass was "only a 50m difference" from everyone's 150 m ("Maybe change
// this to where on the overhead travel it shows all the individual veins in the area?"); the Deep Delver's +50% was "kinda
// meh" when a dungeon's veins "like to spawn halfway in the wall so its hard to see not to mention actually finding one in
// the labyrinths"; the Motherlode Sense's twenty minutes more "doesn't do anything" ("Make it mark the motherlode spots
// with a waypoint on the travel map"); and the Stonebreaker "probably should be something completely different, maybe
// being able to 'self witness' high end nodes so that they spawn with just you around?".
//
// The Prospector's veins on the compass from 500 m and each its own mark on the Overworld; the Deep Delver's x2 and every
// vein of the dungeon on the compass, and every dungeon vein stood at its wall's foot; the day's Motherlodes on a Sense's
// maps; the Stonebreaker made the Surveyor, whose own word witnesses the ground for their own veins.
import './chargenDom.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { standService, T0 } from './accountDb.mjs';
import { createGatherHost, GROUP_REFRESH_MS, NODE_MARK_M, MARK_WALK_M, OW_ONE_MAX, groupLabel } from '../src/scenes/gatherHost.js';
import { mineKind, mineNodeName, MINE_MARKS, PROSPECT_M, DEEP_DELVER_M } from '../src/scenes/mineHost.js';
import { setForagingHost } from '../src/systems/foragingInstall.js';
import { CLIMATES, LOCATION_TYPES } from '../src/formats/mapsFile.js';
import { CLIMATES as C } from '../src/formats/mapsTables.js';
import { vein, veins, veinSlots, boulders, nodeKey, utcDayOfMs, UNCONFIRMED_VEIN_TIER } from '../src/net/nodeLaw.js';
import { HEIGHTMAP_DIMENSION, TERRAIN_SIZE } from '../src/world/terrainSampler.js';
import { nodeMarkCss, MOTHERLODE_MARK_CSS } from '../src/ui/nodeMarks.js';
import { SURVEYOR, specOk, specOf, SPECIALISATIONS, DEEP_DELVER_MULT, minedMaterial, xpForRank } from '../src/net/professionLaw.js';
import { veinYield } from '../src/net/nodeLaw.js';
import { utcDay } from '../src/net/marksLaw.js';
import { oreMapTip } from '../src/ui/oreMapTip.js';
import { lodeMapMarks, localClock, LODE_RING_CSS, LODE_DOT_RGB, LODE_LEGEND_TEXT } from '../src/ui/lodeMapMark.js';
import { readBountyMarks, BOUNTY_RING_R } from '../src/ui/bountyMapMark.js';
import { createMotherlodeBook } from '../src/net/motherlodeBook.js';
import { motherlodeKey } from '../src/net/motherlodeLaw.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const tick = () => new Promise((r) => setImmediate(r));
const NOON_MS = (20500 * 86_400 + 43_200) * 1000;
const DAY = utcDayOfMs(NOON_MS);
const MARCH = 21;   // a March: no signature beside the climate's veins
const WILD = Object.freeze({ inside: false, insideDungeon: false, insideCastle: false, locationType: LOCATION_TYPES.None, inLocationRect: false,
  hour: 12, climate: CLIMATES.Mountain, region: MARCH, enemiesNear: false, carriedWeight: 0, maxEncumbrance: 100, swimming: false, exteriorWater: 'None' });

/** A pixel of `climate` on flat ground: a rock piece by every vein and boulder the law stands. */
function pixelEntry(px, py, climate) {
  const samples = new Float32Array(HEIGHTMAP_DIMENSION * HEIGHTMAP_DIMENSION).fill(0.5);
  const rocks = veins({ x: px, y: py, day: DAY, climate, region: MARCH }).map((v) => [v.u * TERRAIN_SIZE - 2, 0, v.v * TERRAIN_SIZE + 4, v.u * TERRAIN_SIZE + 2, 6, v.v * TERRAIN_SIZE + 8]);
  for (const b of boulders({ x: px, y: py, day: DAY, climate })) rocks.push([b.u * TERRAIN_SIZE - 1.5, -1, b.v * TERRAIN_SIZE + 1, b.u * TERRAIN_SIZE + 1.5, 4, b.v * TERRAIN_SIZE + 4]);
  return { px, py, samples, tilemap: new Uint8Array(128 * 128).fill(2), locationRect: null, batches: [], rocks };
}

/** The real gathering host with the real mine kind over one stood pixel; the track's choices `S.specs`, live. */
async function stage({ climate = CLIMATES.Mountain, px = 405, py = 150 } = {}) {
  const S = { now: NOON_MS, specs: { 50: null, 100: null } };
  const book = {
    state: { open: true, today: {}, caps: { stores: 5000 } },
    stale: () => false, refresh: async () => ({ ok: true }), pixel: () => ({ state: 'none' }), askPixels: async () => [], pump: () => {},
    dungeon: () => null, askDungeon: async () => false, held: () => 0, taken: () => false, counting: () => false,
    track: (prof) => ({ rank: 100, specs: prof === 'mining' ? S.specs : { 50: null, 100: null } }), harvest: () => new Promise(() => {}),   // Mining's choices alone
  };
  const renderer = { createBillboardBatch: () => ({}), destroyBatch: () => {}, moveBillboardBatch: () => true };
  const built = new Map([[`${px},${py}`, pixelEntry(px, py, climate)]]);
  S.host = createGatherHost({
    book, kinds: [mineKind({ book })],
    hud: { setPrompt: () => {}, setMeter: () => {}, toast: () => {}, banner: () => {}, setChip: () => {}, frame: () => {}, dispose: () => {} },
    renderer, getTexture: async () => ({ recordCount: 999 }), uploadRecord: () => {}, billboardSize: () => ({ w: 0.3, h: 0.3 }), flatBatchAabb: () => [0, 0, 0, 0, 0, 0],
    built: () => built, pixelTranslation: (x, y, out) => { out[0] = 0; out[1] = 0; out[2] = 0; return out; },
    pixelInfo: () => ({ climate, region: MARCH }), nowMs: () => S.now,
    eye: () => ({ pos: [0, 1.6, 0], dir: [0, 0, 1] }), view: () => ({ yaw: 0, pitch: 0 }), feet: () => [0, 0, 0], entity: () => ({ items: [] }),
    keyLabel: () => 'E', input: () => ({ held: false, attack: false, choice: false }), active: () => true, activeDungeon: () => false,
  });
  setForagingHost({ world: () => WILD, monthValue: () => 5, entity: () => null, startQuest: () => true, professionsOpen: () => true, keyLabel: () => 'E', professionUse: () => false });
  for (const e of built.values()) S.host.onBuilt(e);
  await tick(); await tick();
  S.veins = () => S.host.nodesOf(px, py).filter((n) => n.what === 'vein');
  S.later = () => { S.now += GROUP_REFRESH_MS + 1; };
  S.done = () => { S.host.dispose(); setForagingHost(null); };
  return S;
}

// ─── THE CHOICES' WORDS ───────────────────────────────────────────────

test('MINE-PERKS the four choices say what they now do; the Surveyor stands on the Stonebreaker\'s id, so a track that chose it keeps it (mutants: the id moved)', () => {
  assert.equal(SURVEYOR, 'stonebreaker', 'the rows that chose the Stonebreaker hold this id');
  assert.deepEqual(SPECIALISATIONS.mining[50].map((s) => s.id), ['prospector', 'deep-delver']);
  assert.deepEqual(SPECIALISATIONS.mining[100].map((s) => [s.id, s.name]), [['motherlode-sense', 'Motherlode Sense'], ['stonebreaker', 'Surveyor']]);
  assert.equal(specOk('mining', 100, SURVEYOR), true);
  assert.match(specOf('mining', 50, 'prospector').text, /within 500 m .* each vein on the Overworld by its ore/);
  assert.match(specOf('mining', 50, 'deep-delver').text, /yield double, and every vein in the dungeon is marked on the compass/);
  assert.match(specOf('mining', 100, 'motherlode-sense').text, /marked on your map from the day's start/);
  assert.match(specOf('mining', 100, SURVEYOR).text, /witnesses the ground.*a region's own ore still waits on witnesses.*Cut Stone directly/);
});

// ─── THE PROSPECTOR ───────────────────────────────────────────────────

test('MINE-PERKS the Prospector: veins on the compass from 500 m (everyone\'s 150), the marks\' walk reaching past it; a dungeon\'s vein is a vein (mutants: the reach 200; the walk short of it)', () => {
  assert.equal(PROSPECT_M, 500);
  assert.equal(NODE_MARK_M, 150);
  assert.ok(MARK_WALK_M >= PROSPECT_M, 'the stood pixels walked for the marks reach the Prospector\'s veins');
  const kind = mineKind({ book: { taken: () => false, counting: () => false } });
  const specs = (s50) => () => ({ 50: s50, 100: null });
  assert.equal(kind.mark({ key: 'v', what: 'vein' }, { specs: specs('prospector') }).reach, PROSPECT_M);
  assert.equal(kind.mark({ key: 'v', what: 'vein' }, { specs: specs(null) }).reach, undefined, 'everyone\'s: NODE_MARK_M');
  assert.equal(kind.mark({ key: 'b', what: 'boulder' }, { specs: specs('prospector') }).reach, undefined, 'a boulder never');
});

test('MINE-PERKS the Prospector on the Overworld: each vein a mark of its own, named by its ore, nearest first - the boulders still Mining\'s group; everyone else sees the group alone (mutants: the singles never asked; asked for anyone; a boulder single; the singles uncapped)', async () => {
  const S = await stage();
  try {
    const vs = S.veins();
    assert.ok(vs.length >= 4, 'the Mountain\'s veins stood');
    const nB = S.host.nodesOf(405, 150).filter((n) => n.what === 'boulder').length;
    let m = S.host.overworldGroups([0, 0, 0]);
    assert.deepEqual(m.map((x) => x.label), [groupLabel('mining', vs.length + nB)], 'everyone: one group, its count');
    S.specs = { 50: 'prospector', 100: null };
    S.later();
    m = S.host.overworldGroups([0, 0, 0]);
    const group = m.filter((x) => !x.key.startsWith('gather:one:'));
    const ones = m.filter((x) => x.key.startsWith('gather:one:'));
    assert.deepEqual(group.map((x) => x.label), nB ? [groupLabel('mining', nB)] : [], 'the boulders ride the group');
    assert.equal(ones.length, Math.min(vs.length, OW_ONE_MAX), 'each vein its own');
    assert.deepEqual(ones.map((x) => x.label).sort(), vs.slice(0, OW_ONE_MAX).map(mineNodeName).sort(), 'named by its ore - "Silver Vein"');
    assert.ok(ones.every((x) => x.kind === 'gather mining' && x.color === nodeMarkCss('mining')), 'Mining\'s glyph and colour, as its group\'s');
    assert.ok(ones.every((x, i) => i === 0 || x.dist >= ones[i - 1].dist), 'nearest first');
    for (const o of ones) {
      const n = vs.find((v) => `gather:one:${v.key}` === o.key);
      assert.ok(n && o.at[0] === n.local[0] && o.at[2] === n.local[2], 'over its own vein');
    }
  } finally { S.done(); }
  assert.equal(OW_ONE_MAX, 24);
  assert.match(read('src/scenes/gatherHost.js'), /groupsKept = \[\.\.\.all\.slice\(0, GROUP_MAX\), \.\.\.ones\.slice\(0, OW_ONE_MAX\)\];/, 'the singles beside the groups, each list its own cap');
});

// ─── THE DEEP DELVER ──────────────────────────────────────────────────

test('MINE-PERKS the Deep Delver: a dungeon vein x2 (x1.5 was "meh"), and on the compass from anywhere in the dungeon - a surface vein not (mutants: x1.5; the reach a vein\'s; every vein given it)', () => {
  assert.equal(DEEP_DELVER_MULT, 2);
  assert.equal(veinYield({ roll: 3, deep: true, deepDelver: true }, 0.9), 6);
  assert.equal(veinYield({ roll: 3, deepDelver: true }, 0.9), 3, 'the surface\'s veins its own');
  assert.ok(DEEP_DELVER_M >= 2000, 'past any dungeon\'s reach');
  const kind = mineKind({ book: { taken: () => false, counting: () => false } });
  const dd = () => ({ 50: 'deep-delver', 100: null });
  assert.equal(kind.mark({ key: 'd', what: 'dvein' }, { specs: dd }).reach, DEEP_DELVER_M);
  assert.equal(kind.mark({ key: 'd', what: 'dvein' }, { specs: dd }).w, MINE_MARKS.dvein.w, 'its glow a dungeon vein\'s');
  assert.equal(kind.mark({ key: 'v', what: 'vein' }, { specs: dd }).reach, undefined, 'a surface vein: everyone\'s reach');
  assert.equal(kind.mark({ key: 'd', what: 'dvein' }, { specs: () => ({ 50: null, 100: null }) }).reach, undefined);
});

test('MINE-PERKS every dungeon vein stands at its wall\'s foot - on the floor, 0.75 m out - never a third of a metre off the face and half a metre up, where its flats went into the wall (mutants: the old offsets)', () => {
  const d = read('src/scenes/dungeonContext.js');
  assert.match(d, /const PROF_VEIN_WALL_M = 12, PROF_VEIN_OFF_M = 0\.75, PROF_VEIN_CHEST_M = 0\.9, PROF_VEIN_UP_M = 0;/);
  assert.match(d, /const d = Math\.max\(0, hit\.dist - PROF_VEIN_OFF_M\);/);
  assert.match(d, /return \[at\[0\], at\[1\] - down \+ PROF_VEIN_UP_M, at\[2\]\];/);
});

// ─── THE SURVEYOR ─────────────────────────────────────────────────────

/** Every material a Mountain's veins stand over many days, as `p` says the ground. */
const stoodOf = (p) => {
  const out = new Set();
  for (let d = 0; d < 120; d++) for (let x = 300; x < 306; x++) for (const v of veins({ x, y: 150, day: 20_300 + d, climate: C.Mountain, region: MARCH, ...p })) out.add(v.material);
  return [...out].sort();
};

test('MINE-PERKS the Surveyor\'s law: their own vein on ground nobody vouched for is the climate\'s whole table - the confirmed draw, slot for slot - and never a signature, which waits on the witnesses (mutants: surveyed unread; a signature slot given)', () => {
  assert.deepEqual(stoodOf({ confirmed: false }), ['metal:iron', 'metal:silver']);
  assert.deepEqual(stoodOf({ confirmed: false, surveyed: true }), stoodOf({ confirmed: true }), 'the Mountain\'s Gold, Platinum and Mithril');
  for (let d = 0; d < 30; d++) {
    const p = { x: 303, y: 150, day: 20_300 + d, climate: C.Mountain, region: MARCH };
    assert.deepEqual(veins({ ...p, confirmed: false, surveyed: true }), veins({ ...p, confirmed: true }), 'the same vein the witnesses would stand');
  }
  const WAYREST = 23;   // Wayrest's Mithril: a signature region
  const sig = { x: 400, y: 150, day: 20_300, climate: C.Mountain, region: WAYREST };
  assert.equal(veinSlots({ ...sig, confirmed: true }), veinSlots({ ...sig, confirmed: false }) + 1, 'confirmed: the signature beside');
  assert.ok(veins({ ...sig, confirmed: false, surveyed: true }).every((v) => !v.signature), 'surveyed: no signature');
  assert.equal(veins({ ...sig, confirmed: false, surveyed: true }).length, veinSlots({ ...sig, confirmed: false }));
  assert.equal(vein({ ...sig, slot: veinSlots({ ...sig, confirmed: false }), confirmed: false, surveyed: true }), null, 'the signature\'s slot is no vein on their word');
  assert.equal(vein({ ...sig, slot: veinSlots({ ...sig, confirmed: false }), confirmed: true }).signature, true, 'on the witnesses\' it is');
});

test('MINE-PERKS the Surveyor\'s stand: the client stands their veins as the service rolls them - and a choice made mid-session stands the pixel again (mutants: the spec unread at the stand; the restand key without Mining\'s)', async () => {
  const S = await stage();
  try {
    const law = (surveyed) => veins({ x: 405, y: 150, day: DAY, climate: CLIMATES.Mountain, region: MARCH, confirmed: false, surveyed }).map((v) => v.material);
    assert.deepEqual(S.veins().map((v) => v.material), law(false).slice(0, S.veins().length));
    const before = S.veins().map((v) => v.material);
    S.host.tick(0.016);   // the frame reads the choices the pixels stand under
    S.specs = { 50: null, 100: SURVEYOR };
    S.host.tick(0.016);
    await tick(); await tick();
    const after = S.veins().map((v) => v.material);
    assert.deepEqual(after, law(true).slice(0, after.length), 'stood again, the whole table');
    assert.notDeepEqual(after, before, 'this pixel\'s day holds a vein over Silver');
    assert.ok(after.some((k) => minedMaterial(k).tier > UNCONFIRMED_VEIN_TIER));
  } finally { S.done(); }
});

test('MINE-PERKS the Surveyor at the service: an unwitnessed Mountain pixel\'s vein is its whole table\'s for a Surveyor - and the gem\'s chance - and the capped one for anyone else; a signature slot is no vein for either (mutants: surveyed never passed; passed for anyone; the gem still refused)', async (t) => {
  const realNow = Date.now;
  const now = utcDay(T0) * 86_400 + 4 * 3600;
  Date.now = () => now * 1000;
  try {
    const s = await standService({ PROFESSIONS_OPEN: 'on', MARKS_OPEN: 'on', DEVELOPER_HANDLES: 'Mac,Sab' });
    const raw = s.env.DB._raw;
    const mac = await s.registered('Mac');
    const sab = await s.registered('Sab');
    const track = raw.prepare(`INSERT INTO prof_tracks (player, char_id, profession, xp, spec50, spec100, updated_at) VALUES (?, ?, 'mining', ?, NULL, ?, ?)`);
    track.run(mac.id, mac.character, xpForRank(100), SURVEYOR, now);
    track.run(sab.id, sab.character, xpForRank(100), null, now);
    const day = utcDay(now);
    let found = null;
    for (let x = 300; x < 900 && !found; x++) {
      const vs = veins({ x, y: 200, day, climate: C.Mountain, region: MARCH, confirmed: false, surveyed: true });
      const v = vs.find((n) => n.tier >= 4);
      if (v) found = { x, ...v, capped: veins({ x, y: 200, day, climate: C.Mountain, region: MARCH, confirmed: false })[v.slot] };
    }
    assert.ok(found, 'a vein over Silver on an unwitnessed Mountain pixel, surveyed');
    const ask = (who, rid, slot = found.slot) => s.call('/v1/prof/harvest', {
      character: who.character, node: nodeKey({ kind: 'vein', x: found.x, y: 200, day, slot }), kind: 'ore',
      climate: C.Mountain, region: MARCH, act: { glints: 3, clean: true }, at: now - 2, rid,
    }, who.secret);
    // the service's dice at their lowest: every strike on the glint finds its gem where a gem may be found
    const real = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
    t.mock.method(globalThis.crypto, 'getRandomValues', (b) => (b.byteLength === 4 ? b.fill(0) : real(b)));
    const r = await ask(mac, 'ore-000001');
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.material, found.material, 'the Surveyor\'s: the whole table\'s');
    assert.ok(r.body.gem, 'a gem, as on witnessed ground');
    const o = await ask(sab, 'ore-000002');
    assert.equal(o.status, 200, JSON.stringify(o.body));
    assert.equal(o.body.material, found.capped.material, 'anyone else\'s: held to Silver');
    assert.ok(minedMaterial(o.body.material).tier <= UNCONFIRMED_VEIN_TIER);
    assert.equal(o.body.gem, undefined, 'and no gem on ground nobody vouched for');
    // a signature slot (Wayrest's) is past an unwitnessed pixel's slots, surveyed or not
    const WAYREST = 23;
    const sigSlot = veinSlots({ climate: C.Mountain, region: WAYREST, confirmed: false });
    const sg = await s.call('/v1/prof/harvest', { character: mac.character, node: nodeKey({ kind: 'vein', x: 600, y: 200, day, slot: sigSlot }), kind: 'ore', climate: C.Mountain, region: WAYREST, act: { glints: 0, clean: false }, at: now - 2, rid: 'ore-000003' }, mac.secret);
    assert.equal(sg.body.error, 'bad-node', 'no signature on the Surveyor\'s word');
  } finally { Date.now = realNow; }
  const svc = read('server-account/src/professions.js');
  assert.match(svc, /const surveyed = n\.kind === 'vein' && !confirmed && specs\[100\] === SURVEYOR;/);
  assert.match(svc, /gem = veinGem\(\{ kind: n\.kind, climate, glints: s\.glints, confirmed: confirmed \|\| surveyed, prospector: specs\[50\] === 'prospector' \}, \(\) => dice\(rand\)\);/);
});

test('MINE-PERKS the Surveyor\'s ore card: no vein waits on witnesses for them - only a region\'s own ore; the world host says who reads it (mutants: the table still held back; the signature given; the host never says)', () => {
  const WAYREST = 23;
  assert.equal(oreMapTip({ climate: C.Mountain, region: MARCH, fact: { state: 'none' }, surveyed: true }).lines.at(-1), 'No vein here waits on witnesses');
  assert.match(oreMapTip({ climate: C.Mountain, region: MARCH, fact: { state: 'none' } }).lines.join('\n'), /Not yet witnessed: no Gold, Platinum or Mithril here yet/, 'anyone else: as it was');
  assert.match(oreMapTip({ climate: C.Mountain, region: WAYREST, fact: { state: 'none' }, surveyed: true }).lines.join('\n'), /Not yet witnessed: no Mithril here yet/, 'the crown\'s own ore still waits');
  const w = read('src/scenes/world.js');
  assert.match(w, /const surveyed = profBook\?\.state\?\.open === true && profBook\.track\('mining'\)\.specs\?\.\[100\] === SURVEYOR;   \/\/ MINE-PERKS/);
});

// ─── THE MOTHERLODE SENSE ─────────────────────────────────────────────

const DAY0 = Math.floor(T0 / 86400);
const lode = (k, over = {}) => ({ k, key: motherlodeKey(DAY0, k), x: 300 + k, y: 120, climate: 226, region: 21, material: 'ore:ebony', opensAt: DAY0 * 86400 + k * 28800 + 3600, closesAt: DAY0 * 86400 + k * 28800 + 3600 + 7200, struck: 0, ...over });
function bookRig({ lodes = [lode(0), lode(1), lode(2)], found = null } = {}) {
  let nowS = DAY0 * 86400 + 60;
  const door = { motherlodes: async () => ({ ok: true, data: { day: Math.floor(nowS / 86400), lodes: lodes.map((l) => ({ ...l })), found } }) };
  const b = createMotherlodeBook({ door, character: () => 'char-1', me: () => 'acct-1', nowS: () => nowS, nowMs: () => 1_000_000, oreName: () => 'Ebony', rand: () => 0 });
  return { b, at: (s) => { nowS = s; } };
}

test('MINE-PERKS a Sense\'s map holds every one of the day\'s Motherlodes from the day\'s start - none spent, none gone, none after the day\'s find (mutants: only the warned; a spent one kept; a gone one kept; a finder shown them)', async () => {
  const r = bookRig({ lodes: [lode(0), lode(1, { struck: 20 }), lode(2)] });
  r.b.tick(); await tick();
  assert.deepEqual(r.b.sensedAll().map((l) => l.k), [0, 2], 'from the day\'s start, hours ahead of any warning - the spent one not');
  assert.deepEqual(r.b.markedAll(), [], 'the compass\'s are the warned (LODE-MARK)');
  const l0 = r.b.state.lodes[0];
  r.at(l0.opensAt + 5); r.b.tick();
  assert.deepEqual(r.b.sensedAll().map((l) => l.k), [0, 2], 'risen');
  r.at(l0.closesAt); r.b.tick();
  assert.deepEqual(r.b.sensedAll().map((l) => l.k), [2], 'gone');
  const out = [];
  assert.equal(r.b.sensedAll(out), out, 'into the caller\'s own list');
  const f = bookRig({ found: 'found-key' });
  f.b.tick(); await tick();
  assert.deepEqual(f.b.sensedAll(), [], 'a finder: none');
});

test('MINE-PERKS the maps\' Motherlode marks: the bounty\'s circle on its pixel, its ore and its hour while it is to rise, in the compass\'s aqua - read by the bounty\'s reader (mutants: the hour once risen; off its pixel)', () => {
  const nowS = 1_000_000;
  const clock = (s) => `@${s}`;
  const m = lodeMapMarks([{ x: 300, y: 120, material: 'ore:ebony', opensAt: nowS + 600 }, { x: 10, y: 20, material: 'ore:adamantium', opensAt: nowS - 5 }, null, { x: 1.5, y: 2 }], nowS, { oreName: (k) => k.slice(4), clock });
  assert.deepEqual(m, [
    { cx: 300.5, cy: 120.5, r: BOUNTY_RING_R, label: `ebony Motherlode, @${nowS + 600}` },
    { cx: 10.5, cy: 20.5, r: BOUNTY_RING_R, label: 'adamantium Motherlode' },
  ]);
  assert.deepEqual(readBountyMarks(() => m, { width: 1000, height: 500 }, LODE_LEGEND_TEXT).map((x) => x.label), m.map((x) => x.label), 'the bounty\'s reader takes them whole');
  assert.equal(LODE_RING_CSS, MOTHERLODE_MARK_CSS, 'the compass\'s colour');
  assert.deepEqual([...LODE_DOT_RGB], [0, 229, 200]);
  assert.match(localClock(0), /^\d\d:\d\d$/);
});

test('MINE-PERKS every map reads them: the held map (its poll, its sheet, its legend), the classic region page (its texels and its repaint), the ink, and the world host\'s dep - a Sense\'s alone (mutants: any unwired; shown without the Sense)', () => {
  const h = read('src/ui/heldMap.js');
  assert.match(h, /const lodes = readBountyMarks\(this\.deps\.lodes, this\._size, LODE_LEGEND_TEXT\);/);
  assert.match(h, /if \(mKey !== this\._lodesKey\) \{ this\._lodesKey = mKey; this\._lodes = lodes; gateMoved = true; this\._dirty = true; \}/);
  assert.match(h, /lodes: this\._lodes,   \/\/ MINE-PERKS/);
  assert.match(h, /if \(this\._lodes\.length\) \{   \/\/ MINE-PERKS: and a Motherlode's aqua circle\n\s*const dot = el\('span', 'hmlegdot'\);\n\s*dot\.style\.background = LODE_RING_CSS;/);
  assert.match(h, /&& !this\._vendor && !this\._lodes\.length\)/);
  const t = read('src/ui/travelMapWindow.js');
  assert.match(t, /const lodes = readBountyMarks\(this\.deps\.lodes, \{ width: MAP_WIDTH, height: MAP_HEIGHT \}, LODE_LEGEND_TEXT\);\n\s*this\._lodesKey = bountyMarksKey\(lodes\);\n\s*if \(lodes\.length\) \{\n\s*const lodePx = packRGBA\(LODE_DOT_RGB\[0\], LODE_DOT_RGB\[1\], LODE_DOT_RGB\[2\], 255\);\n\s*for \(const \[x, y\] of bountyRingTexels\(lodes, originX, originY, width, height\)\) plot\(x, y, lodePx\);/);
  assert.match(t, /&& bountyMarksKey\(readBountyMarks\(this\.deps\.lodes, \{ width: MAP_WIDTH, height: MAP_HEIGHT \}, LODE_LEGEND_TEXT\)\) === \(this\._lodesKey \?\? ''\)/);
  assert.match(read('src/ui/inkMap.js'), /for \(const b of opts\.lodes \?\? \[\]\) if \(visible\(b\.cx, b\.cy, b\.r \+ 2\)\) paintBountyRing\(ctx, view, b, pulse, LODE_INK\);/);
  const w = read('src/scenes/world.js');
  assert.match(w, /lodes: \(\) => lodeMapMarksNow\(\),/);
  assert.match(w, /if \(!motherlodeBook \|\| profBook\?\.state\.open !== true \|\| profBook\.track\('mining'\)\.specs\?\.\[100\] !== 'motherlode-sense'\) return \[\];\n\s*return lodeMapMarks\(motherlodeBook\.sensedAll\(_lodesSensed\),/);
});
