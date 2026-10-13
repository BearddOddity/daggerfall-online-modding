// FIELD BUGS 2026-10-13c (Discord #bug-reports, TheHalfinStream: "[ANGRY] Died of fatigue in wayrest palace, character
// aged past limit and remains did not appear"; `01-Overview/Field-Bugs-2026-10-13c.md`).
//
// REMAINS-STAND. AUDIT LEGACY H1 made the remains a list the record owns, and nothing stood where the fallen fell: the
// list opened by itself within six paces of the very spot underground, with nothing in the world to say where that spot
// was - in Castle Wayrest's halls the heir walked past it. Now the remains stand as a body in the ground pool of the
// host the one played stands in, and the body's list IS the record's (scenes/legacyRemainsStand.js).
// LIVE-FIGHT. The remains' "never in a fight" read the street's foe pools in every mode, frozen while a dungeon or a
// building is mounted: one hostile street walker latched as the heir went in kept the whole visit "in a fight", and the
// list never opened even on the spot. Now the fight is the place the one played stands in.
//
// Fixtures from the producers: the Legacy host (createLegacyHost) over one storage and one tab - its founding, the death
// at the one damage door the exhaustion collapse takes (hurtPlayer's SetHealth(0) arm), the Succession, the birth; a
// real ground pool (createDroppedLoot) and the real transfer laws (planTake, planStore, applyTransfer); the world host's
// own reads (legacyHere, legacyAtPlace, legacyRemainsFeet, the stand's construction, inFight) run off its own text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createLegacyHost, REMAINS_FLAT, LEGACY_TEXT } from '../src/scenes/legacyHost.js';
import { createRemainsStand, REMAINS_MARK, REMAINS_STAND_OWNER } from '../src/scenes/legacyRemainsStand.js';
import { createDroppedLoot } from '../src/scenes/droppedLoot.js';
import { createLootLines, setLootMarksLive } from '../src/scenes/lootLines.js';
import { MODELS, familyRng } from '../src/systems/legacy/family.js';
import { _resetModSaveData } from '../src/systems/modSaveData.js';
import { LOCATION_TYPES, REGION_NAMES } from '../src/formats/mapsFile.js';
import { areEnemiesNearby } from '../src/systems/encounters.js';
import { floorLanding } from '../src/player/enterExit.js';
import { hurtPlayer, setDeathListener } from '../src/characters/playerEntity.js';
import { planTake, planStore, applyTransfer } from '../src/systems/itemTransfer.js';
import { isRemainsItem, isHeirloom } from '../src/systems/legacy/heirloom.js';
import { setItemFields, mintCondition } from '../src/systems/itemTemplates.js';
import { setSilverFinder, silverFindAt, _resetSilverFindsForTests } from '../src/systems/silverFinds.js';
import { setPref, _resetForTests } from '../src/systems/uiPrefs.js';

const rd = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const W = rd('src/scenes/world.js');
const mem = () => { const m = new Map(); return { get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; };

/** world.js's own text from `start` to the close of its statement (`\n  };` or `\n  });`). */
function cut(start, close = '\n  };') {
  const i = W.indexOf(start);
  assert.ok(i >= 0, `world.js moved: ${start}`);
  const j = W.indexOf(close, i);
  return W.slice(i, j + close.length);
}
const HERE = cut('  const legacyHere = () => {');
const IN_DUNGEON = (() => { const m = /\n( {2}const legacyInDungeonOf = [^\n]*;)\n/.exec(W); assert.ok(m, 'world.js\'s dungeon test moved'); return m[1]; })();
const AT_PLACE = cut('  const legacyAtPlace = (place) => {');
const FEET = cut('  const legacyRemainsFeet = (place) => {');
const STAND = cut('  const legacyRemainsStand = createRemainsStand({', '\n  });');
const FIGHT = (() => { const m = /\n {4}inFight: (\(\) => [^\n]*?),\n/.exec(W); assert.ok(m, 'world.js\'s inFight moved'); return m[1]; })();

/** A recording renderer: the pool's batches, made and freed. */
const renderer = () => { const r = { made: 0, freed: 0 }; return Object.assign(r, { createBillboardBatch: () => { r.made++; return {}; }, destroyBillboardBatch: () => { r.freed++; } }); };
const stubTex = { getSize: () => ({ width: 64, height: 40 }), getScale: () => ({ width: 0, height: 0 }), recordCount: 64, getFrameCount: () => 1 };
const groundPool = () => createDroppedLoot({ renderer: renderer(), getTexture: async () => stubTex, uploadRecordFrame: () => {} });

/**
 * THE WORLD HOST'S OWN READS over a world of fakes: where the one played stands (`w.mode`, `w.pos`, the castle they are
 * in), the street's pool and the mode's own, the street's foe pools and the mode's - each read run off world.js's text.
 */
function worldOf(w) {
  const modes = {
    get mode() { return w.mode; },
    dungeonCtx: { abyss: { location: () => w.castle }, floorAt: (x, y, z) => [x, w.floorY, z], foes: [] },
    droppedPool: () => (w.mode === 'dungeon' ? w.dungeonPool : w.mode === 'interior' ? w.roomPool : null),
    insideFoes: () => (w.mode === 'exterior' ? [] : w.insideFoes),
  };
  const state = {
    get compensation() { return w.comp; }, current: { x: 300, y: 200 },
    worldCoords: (p) => ({ x: p[0] * 40 + 1000, z: p[2] * 40 + 2000 }),
    localFromWorld: (x, z) => [(x - 1000) / 40, (z - 2000) / 40],
  };
  const player = { get pos() { return w.pos; } };
  const maps = { getRegionIndexAt: () => 23 };
  const locationIndex = new Map([['300,200', { name: 'Wayrest', mapTableData: { locationType: LOCATION_TYPES.TownCity, mapId: 4242 } }]]);
  const collider = { raycast: (o, d, max) => (o[1] - w.roofY >= 0 && o[1] - w.roofY <= max ? o[1] - w.roofY : Infinity), heightAt: () => w.ground };
  const heightAt = () => (w.built ? w.ground : -Infinity);
  // AUDIT LANDFORMS C1 / TERRAIN-SCALE1: a record's height is DFU's frame - the landforms' lift at its spot off on the way
  // in, back on (and the ground it was measured on read off its stamp) on the way out; a wrong stamp stands it 100 m up
  const groundFrameHeight = (y) => (Number.isFinite(y) ? y - LIFT : y);
  const restandHeight = (y, x, z, was) => (Number.isFinite(y) ? y + LIFT + (was === SCALE ? 0 : 100) : y);
  const scaleOf = (stamp) => (stamp > 0 ? stamp : 1.5);
  const exteriorFoes = { foes: w.streetFoes }, cityGuards = { guards: [] };
  const exteriorFoePool = () => [...cityGuards.guards, ...exteriorFoes.foes];
  const names = ['playerTravelPixel', 'maps', 'locationIndex', 'modes', 'walkMode', 'playerSpawned', 'player', 'cam', 'REGION_NAMES', 'state',
    'heightAt', 'floorLanding', 'collider', 'LEGACY_REMAINS_NEAR_DUNGEON', 'LEGACY_REMAINS_NEAR', 'createRemainsStand', 'droppedLoot', 'REMAINS_FLAT',
    'areEnemiesNearby', 'exteriorFoePool', 'exteriorFoes', 'cityGuards', 'groundFrameHeight', 'restandHeight', 'scaleOf', 'STREAMING_TERRAIN_SCALE', 'LEGACY_TEXT'];
  const vals = [() => ({ x: 300, y: 200 }), maps, locationIndex, modes, true, true, player, { pos: [0, 0, 0] }, REGION_NAMES, state,
    heightAt, floorLanding, collider, 6, 2400, createRemainsStand, w.streetPool, REMAINS_FLAT,
    areEnemiesNearby, exteriorFoePool, exteriorFoes, cityGuards, groundFrameHeight, restandHeight, scaleOf, SCALE, LEGACY_TEXT];
  const body = `${HERE}\n${IN_DUNGEON}\n${AT_PLACE}\n${FEET}\n${STAND}\nconst inFight = ${FIGHT};\nreturn { legacyHere, legacyAtPlace, legacyRemainsFeet, legacyRemainsStand, inFight };`;
  return new Function(...names, body)(...vals);
}

const CASTLE = Object.freeze({ regionIndex: 23, locationIndex: 7 });
/** The landforms' lift at the fallen's spot, and the terrain's scale today (the world host's STREAMING_TERRAIN_SCALE). */
const LIFT = 2, SCALE = 1.25;
/** The fallen's worn sword - the heirloom, as the game mints one. */
const sword = () => ({ ...mintCondition(setItemFields({ group: 'Weapons', templateIndex: 120, material: 4, flags: 0, variant: 0, message: 0, stackCount: 1 })), equipSlot: 1 });

/** An Enduring house whose founder's span is spent, played in Castle Wayrest; the world's reads around it. */
function house() {
  _resetModSaveData();
  const w = {
    mode: 'dungeon', pos: [10, -5, 30], castle: { ...CASTLE }, floorY: -5.4, comp: [0, 0, 0], ground: 0, roofY: -Infinity, built: true,
    streetPool: groundPool(), dungeonPool: groundPool(), roomPool: groundPool(), streetFoes: [], insideFoes: [],
    said: [], opened: [], storage: mem(), tab: mem(),
  };
  const world = worldOf(w);
  const e = {
    name: 'Ysolde Hlaalu', gender: 'female', race: 'Breton', faceIndex: 3, careerIndex: 5, career: { name: 'Nightblade', primarySkills: [28], majorSkills: [], minorSkills: [] },
    level: 20, characterId: 'c-ysolde', chargenDone: true, health: 50, maxHealth: 50, stats: { strength: 60, intelligence: 50, willpower: 50, agility: 50, endurance: 50, personality: 50, speed: 50, luck: 50 },
    skills: Array.from({ length: 35 }, (_, i) => (i === 28 ? 70 : 30)), items: [sword()], wagonItems: [], bagItems: [],
  };
  w.e = e;
  const host = createLegacyHost({
    entity: e, storage: () => w.storage, tab: () => w.tab, on: () => w.on !== false, online: () => false, now: () => 500, own: () => 0,
    here: () => world.legacyHere(), town: () => null, nearestTown: () => ({ region: 'Wayrest', loc: 'Wayrest' }), gold: () => 8000, say: (l) => w.said.push(l),
    boot: () => {}, search: () => '?world', loadCharacter: () => false, saveNow: () => true, inFight: () => world.inFight(), rng: familyRng(3),
    killer: () => null, atPlace: (place) => world.legacyAtPlace(place), openRemains: (r, items) => { w.opened.push(items); return true; },
    carried: () => [...e.items, ...e.wagonItems, ...e.bagItems], atRest: () => false, askRest: () => false,
    takeItem: (it) => { for (const k of ['items', 'wagonItems', 'bagItems']) e[k] = e[k].filter((x) => x !== it); },
  });
  host.found(MODELS.enduring);
  host.current().toll = 200;   // the span spent: Arkay will not grant another
  return { w, world, host, e };
}
/** The collapse kills (enemies near, DFU's OnExhausted - SetHealth(0) through the one damage door), and the line's
 *  Succession raises a newborn heir, who lands through the birth's own door. */
function fallAndHeir(t) {
  setDeathListener('projectLegacy', () => t.host.onDeath());
  try { assert.equal(hurtPlayer(t.e, t.e.health, { bypassShield: true }), true, 'the collapse is a death'); } finally { setDeathListener('projectLegacy', null); }
  const out = t.host.deathOutcome();
  assert.equal(out.kind, 'fall');
  assert.equal(out.fallen.died.cause, 'years', 'dead of her years: the span was spent');
  assert.equal(t.host.succeed({ newborn: true }), true);
  assert.ok(t.host.takeBorn(t.host.current().id));
  Object.assign(t.e, { characterId: 'c-heir', name: 'Heir', items: [], health: 40 });
  t.host.onBorn();
  assert.equal(t.host.family.pending, null);
  return t.host.family.remains[0];
}
const frame = (t) => t.world.legacyRemainsStand.frame(t.host.remainsToStand());
const pileOf = (pool, row) => pool._piles.find((p) => p.items === row.items) ?? null;

test('REMAINS-STAND: the report - an Enduring elder whose span was spent collapses of fatigue in Castle Wayrest; the heir comes back and the remains STAND where she fell, the record\'s own list, seen across the hall - and nowhere else (mutants: no body; the body not the record\'s list; saved; stood in any dungeon; stood for a dungeon row in the street)', () => {
  const t = house();
  const row = fallAndHeir(t);
  assert.equal(row.place.mode, 'dungeon');
  assert.deepEqual(row.place.dungeon, CASTLE, 'laid in her own dungeon');
  assert.deepEqual(row.place.pos, [10, -5, 30], 'at her last position');
  assert.ok(row.items.some(isRemainsItem) && row.items.some(isHeirloom), 'the bones and the heirloom lie there');
  assert.match(t.host.questLogEntries()[0].messages[0][0], /fell at Wayrest, Wayrest, deep inside/);
  // the heir walks the castle's hall, thirty metres from where she fell: the list sleeps there (six paces), the body stands
  t.w.pos = [40, -5, 30];
  t.host.tick();
  assert.equal(t.w.opened.length, 0, 'thirty metres off: not opened');
  assert.equal(frame(t), 1, 'one body stands');
  const pile = pileOf(t.w.dungeonPool, row);
  assert.ok(pile, 'in the dungeon\'s own pool');
  assert.equal(pile.items, row.items, 'its list IS the record\'s - the same array');
  assert.deepEqual(pile.pos, [10, t.w.floorY, 30], 'on the floor under her last position');
  assert.deepEqual([pile.archive, pile.record], [REMAINS_FLAT.archive, REMAINS_FLAT.record], 'the remains\' own picture');
  assert.equal(pile.owner, REMAINS_STAND_OWNER);
  const key = `droppedLoot:${pile.id}`;
  assert.equal(t.w.dungeonPool.labelFor(key), 'The remains of Ysolde Hlaalu', 'the plaque names her');
  assert.equal(t.host.mapMarks()[0].label, t.w.dungeonPool.labelFor(key), 'the map\'s ring and the plaque: one name, one home (LEGACY_TEXT.remainsName)');
  assert.ok(t.w.dungeonPool.lootTargets().some((tg) => tg.key === key), 'the ray can take it - pressed, it opens as any pile');
  assert.equal(t.w.dungeonPool.pileFor(key), pile);
  assert.deepEqual(t.w.dungeonPool.lootFinds().find((f) => f.items === row.items)?.mark, REMAINS_MARK, 'its line of light');
  assert.deepEqual(t.w.dungeonPool.snapshotScene(), [], 'no scene cache carries it');
  assert.deepEqual(t.w.dungeonPool.snapshotWorld(() => ({ x: 0, z: 0 })), [], 'no save carries it');
  assert.equal(t.w.dungeonPool._piles.filter((p) => !p.unsaved).length, 0, 'nor the dungeon\'s own save (its droppedLoot filter)');
  // a second frame keeps the one body
  assert.equal(frame(t), 1);
  assert.equal(t.w.dungeonPool._piles.length, 1, 'never laid twice');
  // another dungeon: nothing; the street: nothing for a dungeon row
  t.w.castle = { regionIndex: 23, locationIndex: 8 };
  assert.equal(frame(t), 0, 'another dungeon stands none');
  assert.equal(t.w.dungeonPool._piles.length, 0, 'and the body let go');
  t.w.castle = { ...CASTLE }; t.w.mode = 'exterior'; t.w.pos = [0, 0, 0];
  assert.equal(frame(t), 0, 'the street stands none for a death underground');
  assert.equal(t.w.streetPool._piles.length, 0);
});

test('REMAINS-STAND: the body IS the record\'s list - a take from it is the heir\'s claim, the bones go back into it and into no other pile, carried home it is let go; stood again at every change of its pool or its list, none for the past or with the switch off (mutants: the frame\'s five lets-go; remainsToStand\'s guards)', () => {
  const t = house();
  const row = fallAndHeir(t);
  t.w.pos = [40, -5, 30];
  frame(t);
  let pile = pileOf(t.w.dungeonPool, row);
  // the window's take, on the body, of the heirloom: the record's list loses it, and the heir claims it
  const heirloom = pile.items.find(isHeirloom);
  const take = planTake(heirloom, { bag: t.e.items, entity: t.e });
  assert.equal(take.ok, true);
  applyTransfer(heirloom, take, pile.items, t.e.items, { entity: t.e, toPlayer: true });
  assert.ok(!row.items.includes(heirloom) && t.e.items.includes(heirloom), 'out of the record\'s list, into the pack');
  t.host.tick();
  assert.equal(row.by, t.host.current().id, 'changed through the body: the heir\'s claim');
  // the bones go back into it (they bear its mark) and into no other pile
  const bones = row.items.find(isRemainsItem);
  applyTransfer(bones, planTake(bones, { bag: t.e.items, entity: t.e }), pile.items, t.e.items, { entity: t.e, toPlayer: true });
  assert.equal(planStore(bones, { remote: pile.items }).ok, true, 'back into its own list');
  const other = t.w.dungeonPool.dropPile([sword()], [0, 0, 0]);
  assert.equal(planStore(bones, { remote: other.items }).ok, false, 'never into another pile');
  t.w.dungeonPool.removePile(other);
  // carried home: let go
  t.host.tick();
  assert.equal(row.state, 'taken');
  assert.equal(frame(t), 0, 'taken home: no body');
  assert.ok(!t.w.dungeonPool._piles.includes(pile), 'let go from its pool');
  // laid again (the heir dropped the bones nowhere they could keep them): the body stands again
  t.e.items = t.e.items.filter((it) => it !== bones);
  t.host.tick();
  assert.equal(row.state, 'lying');
  assert.equal(frame(t), 1);
  pile = pileOf(t.w.dungeonPool, row);
  assert.ok(pile);
  // its pile let go under it (a rebuild), or put away emptied (releaseEmptied): stood again from the record
  t.w.dungeonPool.removePile(pile);
  assert.equal(frame(t), 1);
  const again = pileOf(t.w.dungeonPool, row);
  assert.ok(again && again !== pile, 'stood again');
  again.inactive = true;
  assert.equal(frame(t), 1);
  assert.ok(pileOf(t.w.dungeonPool, row) && !pileOf(t.w.dungeonPool, row).inactive, 'an inactive one stood afresh');
  // another pool (the dungeon built anew): let go from the old, stood in the new
  const old = t.w.dungeonPool;
  t.w.dungeonPool = groundPool();
  assert.equal(frame(t), 1);
  assert.equal(old._piles.length, 0, 'let go from the old pool');
  assert.ok(pileOf(t.w.dungeonPool, row), 'stood in the new');
  // the record's list replaced (a load's merge): stood again over the new list
  const before = pileOf(t.w.dungeonPool, row);
  row.items = row.items.map((it) => ({ ...it }));
  assert.equal(frame(t), 1);
  assert.equal(pileOf(t.w.dungeonPool, row)?.items, row.items, 'the body\'s list is the record\'s new one');
  assert.ok(!t.w.dungeonPool._piles.includes(before), 'the old list\'s body gone');
  // the switch off: none; the past played back: none; a waiting Succession: none
  t.w.on = false;
  assert.deepEqual(t.host.remainsToStand(), []);
  assert.equal(frame(t), 0);
  t.w.on = true;
  assert.equal(frame(t), 1);
  const fam = t.host.family;
  fam.pending = { fallenId: row.of, at: 1, estate: 0, bequest: [] };
  assert.deepEqual(t.host.remainsToStand(), [], 'a waiting Succession stands none');
  fam.pending = null;
  t.host.current().characterId = 'c-someone-else';
  assert.deepEqual(t.host.remainsToStand(), [], 'a page not the one played\'s stands none');
  t.host.current().characterId = 'c-heir';
  t.world.legacyRemainsStand.clear();
  assert.equal(t.world.legacyRemainsStand.count(), 0);
  assert.equal(t.w.dungeonPool._piles.length, 0, 'clear lets every body go');
});

test('REMAINS-STAND: in the open - the body stands at the native spot where she fell, at the height she stood (a roof), once its pixel is built, and dies with its pixel; a row laid before the height was kept stands on the ground; a building\'s death stands none (mutants: the height dropped; the pixel\'s key; a building row stood)', () => {
  const t = house();
  t.w.mode = 'exterior'; t.w.comp = [0, 3, 0]; t.w.pos = [5, 9, 7]; t.w.roofY = 9; t.w.ground = 1;
  const here = t.world.legacyHere();
  assert.deepEqual(here.world, { x: 5 * 40 + 1000, z: 7 * 40 + 2000, y: 9 - 3 - LIFT, terrainScale: SCALE }, 'the native spot and the height she stood at - a record\'s: in DFU\'s frame, on the ground it was measured on');
  const row = fallAndHeir(t);
  assert.equal(row.place.mode, 'exterior');
  // the heir comes back on the pixel: the body stands on the roof she fell from
  t.w.pos = [60, 1, 60];
  assert.equal(frame(t), 1);
  let pile = pileOf(t.w.streetPool, row);
  assert.deepEqual(pile.pos, [5, 9, 7], 'where she fell, on the roof');
  assert.equal(pile.pixelKey, '300,200', 'it dies with its pixel');
  t.w.streetPool.collectPixel('300,200');
  assert.ok(!t.w.streetPool._piles.includes(pile), 'the pixel collected');
  t.w.built = false;
  assert.equal(frame(t), 0, 'its pixel not built: none stands');
  t.w.built = true;
  assert.equal(frame(t), 1, 'built again: stood again');
  pile = pileOf(t.w.streetPool, row);
  // an older row with no height kept: on the ground (a mesh under the ground's half metre would hold it)
  const flat = { ...row.place, world: { x: row.place.world.x, z: row.place.world.z } };
  assert.deepEqual(t.world.legacyRemainsFeet(flat), [5, 1, 7], 'on the ground');
  // a building's death: its law is the town's street (any spot of the pixel opens the list), and no body stands for it
  assert.equal(t.world.legacyRemainsFeet({ ...row.place, mode: 'interior', world: null }), null);
  t.w.mode = 'interior';
  assert.equal(t.world.legacyRemainsFeet(row.place), null, 'indoors no street body stands');
  assert.equal(frame(t), 0);
  assert.equal(t.w.roomPool._piles.length, 0);
});

test('LIVE-FIGHT: the remains\' fight is the place the one played stands in - a street walker latched as the heir went down keeps no visit "in a fight", and the list opens on the spot; the dungeon\'s and the building\'s own foes still hold it (mutants: the street\'s pools read underground; a building\'s pool unread)', () => {
  const t = house();
  const row = fallAndHeir(t);
  const latched = { dead: false, ai: { wouldBeSpawned: true, detected: false, inSight: false, isHostile: true } };   // sensed in the street as the heir went in, frozen since
  t.w.streetFoes.push(latched);
  t.w.pos = [12, -5, 31];
  assert.equal(t.world.legacyAtPlace(row.place), true, 'on the spot');
  assert.equal(t.world.inFight(), false, 'the street is not the castle');
  t.host.tick();
  assert.equal(t.w.opened.length, 1, 'the list opens where she fell');
  assert.equal(t.w.opened[0], row.items);
  // the castle's own hostile guard, seeing her: a fight
  const guard = { dead: false, ai: { wouldBeSpawned: true, detected: true, inSight: true, targetIsLocalPlayer: true, isHostile: true } };
  t.w.insideFoes = [guard];
  assert.equal(t.world.inFight(), true, 'the dungeon\'s own foe is the fight');
  // in the street the street's foes are the fight, and a building's own pool indoors
  t.w.insideFoes = [];
  t.w.mode = 'exterior';
  assert.equal(t.world.inFight(), true, 'outdoors the street walker counts');
  t.w.mode = 'interior';
  assert.equal(t.world.inFight(), false, 'indoors the street does not');
  t.w.insideFoes = [guard];
  assert.equal(t.world.inFight(), true, 'the building\'s own foe does');
});

test('REMAINS-STAND: the line and the find - its own mark stands its line with the rarity row off, the open zone\'s word never puts it out; it holds no silver find; the hosts by source (mutants: the mark dropped from lootFinds; one word for every kind; the find rolled)', () => {
  _resetForTests(); setPref('lootRarity', false);
  const pool = groundPool();
  const items = [{ group: 'UselessItems2', templateIndex: 1810, name: 'The remains of X' }];
  const stand = createRemainsStand({ pool: () => pool, feetOf: () => [1, 0, 1], icon: REMAINS_FLAT, label: () => 'The remains of X' });
  assert.equal(stand.frame([{ id: 'r1', of: 1, state: 'lying', items, place: {} }]), 1);
  const pile = pool._piles[0];
  const finds = pool.lootFinds();
  assert.deepEqual(finds[0].mark, REMAINS_MARK);
  const calls = [];
  const gl = new Proxy({ ARRAY_BUFFER: 1, STATIC_DRAW: 2, FLOAT: 3, TRIANGLES: 4, BLEND: 5, ONE: 6, CULL_FACE: 7 }, {
    get(o, k) { if (k in o) return o[k]; return (...a) => { calls.push([k, ...a]); if (k === 'getShaderParameter' || k === 'getProgramParameter') return true; if (k === 'getUniformLocation') return a[1]; return {}; }; },
  });
  const pass = createLootLines(gl);
  const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  setLootMarksLive(true, 'legacy');
  setLootMarksLive(false);   // the open zone's word, every frame online: none of mine there
  assert.equal(pass.draw(() => pool.lootFinds(), I, I, [0, 1.6, 0], 1), true, 'the house\'s word keeps the pass: its line stands');
  setLootMarksLive(false, 'legacy');
  assert.equal(pass.draw(() => pool.lootFinds(), I, I, [0, 1.6, 0], 1), false, 'no word left: off is DFU exactly');
  // no silver find in the remains
  _resetSilverFindsForTests();
  let asked = 0;
  setSilverFinder(() => { asked++; });
  assert.equal(silverFindAt('pile', pile, () => 0), false, 'the remains hold no find');
  assert.equal(silverFindAt('pile', { items: [] }, () => 0), true, 'another container still rolls');
  assert.equal(asked, 1);
  _resetSilverFindsForTests();
  // the hosts: the world host frames the stand after its tick (before any early answer), under the house's own word
  assert.match(W, /const said = legacyHost\.tick\(\);\n(?:\s*\/\/[^\n]*\n)*\s*setLootMarksLive\(legacyRemainsStand\.frame\(legacyHost\.remainsToStand\(\)\) > 0, 'legacy'\);\n\s*\/\/ AUDIT LEGACY A2/);
  assert.match(STAND, /pool: \(\) => \(\(modes\?\.mode \?\? 'exterior'\) === 'exterior' \? droppedLoot : \(modes\?\.droppedPool\?\.\(\) \?\? null\)\)/, 'the street\'s pool outdoors, the mode\'s own inside');
  assert.match(rd('src/scenes/worldModes.js'), /droppedPool\(\) \{ return mode === 'dungeon' \? \(dungeonCtx\?\.droppedPool\?\.\(\) \?\? null\) : mode === 'interior' \? interiorDropped : null; \}/, 'worldModes hands the dungeon\'s and the building\'s pools');
  const D = rd('src/scenes/dungeonContext.js');
  assert.match(D, /\n {4}floorAt: \(x, y, z\) => floorLanding\(collider, \[x, y \+ 0\.2, z\]\),/, 'the dungeon\'s floor under a point');
  assert.match(D, /droppedPool: \(\) => droppedLoot,/);
  assert.doesNotMatch(rd('src/scenes/exterior.js'), /createLegacyHost|createRemainsStand/, 'the fixed city keeps DFU\'s death: no house, no remains');
  _resetForTests();
});
