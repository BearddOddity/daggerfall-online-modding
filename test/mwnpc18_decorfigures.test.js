// MWNPC18 (2026-10-11, a player's report via Mac: "Player decorations are not affected" - bible/04-Characters/
// Morrowind-NPCs.md section 26): A FIGURE A PLAYER PLACED STANDS IN A MORROWIND BODY. DECOR-FIGURE lets a home's owner
// set down one of Daggerfall's people (net/decorLaw.js decorIsFigure); every room's own people stood in bodies and the
// placed ones kept their pictures, because no census looked at a decor room. Now each is read for a look off its
// picture - its sex FLATS.CFG's, its role FLATS.CFG's caption's, its race the region's, its seed its piece's id
// (characters/peopleBodies.js figureLook) - and offered on its host's people lane (scenes/decorRoom.js
// offerDecorFigures): the rooms' (worldModes.js) and the yards' (world.js, through homeYards.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { figureLook, figureRole, DAEDRA_PRINCES_ARCHIVE, FIGURE_ROLE_WORDS } from '../src/characters/peopleBodies.js';
import { offerDecorFigures } from '../src/scenes/decorRoom.js';
import { wornByRole, ROLES } from '../src/characters/wardrobe.js';
import { decorIsFigure } from '../src/net/decorLaw.js';

const ROOT = new URL('../', import.meta.url).pathname;
const rd = (p) => readFileSync(join(ROOT, p), 'utf8');
const walk = (dir) => readdirSync(join(ROOT, dir)).flatMap((n) => {
  const p = `${dir}/${n}`;
  return statSync(join(ROOT, p)).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : [];
});
/** FLATS.CFG as formats/flatsFile.js answers it: archive.record -> { gender, caption } */
const flatsOf = (rows) => ({ getFlatData: (a, r) => rows[`${a}.${r}`] ?? null });
const FLATS = flatsOf({
  '182.11': { gender: '2', caption: 'comely maiden' },
  '182.3': { gender: '1', caption: 'old fisherman' },
  '183.4': { gender: '1', caption: 'nobleman' },
  '183.9': { gender: '?2', caption: 'elegantly dressed lady' },
  '181.2': { gender: '1', caption: 'priest of Arkay' },
  '180.6': { gender: '1', caption: 'knight in armor' },
  '177.1': { gender: '2', caption: 'female sorcerer' },
  '334.5': { gender: '0', caption: 'figure of no sex the column names' },
});
const fig = (id, a, r) => ({ piece: { id, flat: [a, r], pos: [0, 0, 0] }, batch: { origin: [1, 2, 3], castOnly: true } });

test('MWNPC18a figureLook: a placed figure\'s sex FLATS.CFG\'s, its role its caption\'s, its race the region\'s, its seed its piece\'s id; a child, the Daedra Princes and a figure no row sexes keep their pictures; FLATS.CFG not read yet is asked again (mutants: the sex off the record; the seed off the picture; the cache of a miss)', () => {
  const maiden = figureLook(fig('a1', 182, 11), { flats: FLATS, race: 'Redguard' });
  assert.equal(maiden.gender, 'female');
  assert.equal(maiden.race, 'Redguard', 'the region\'s, by name');
  assert.ok(wornByRole(maiden, 'commoner'), 'a comely maiden is the street\'s');
  assert.ok(maiden.npc && Number.isInteger(maiden.npc.seed), 'her own picks, head and hair');
  assert.equal(figureLook(fig('a2', 183, 4), { flats: FLATS, race: 3 }).race, 'Nord', 'the region\'s, by its RACES id');
  assert.equal(figureLook(fig('a3', 183, 4), { flats: FLATS, race: 'Imperial' }).race, 'Breton', 'a race no body has: the Bay\'s Breton');
  assert.ok(wornByRole(figureLook(fig('b1', 183, 4), { flats: FLATS }), 'noble'));
  const lady = figureLook(fig('b2', 183, 9), { flats: FLATS });
  assert.equal(lady.gender, 'female', 'a "?2" is a woman (FLATS.CFG\'s censor mark read through)');
  assert.ok(wornByRole(lady, 'noble'));
  assert.ok(wornByRole(figureLook(fig('c1', 181, 2), { flats: FLATS }), 'priest'));
  assert.ok(wornByRole(figureLook(fig('c2', 180, 6), { flats: FLATS }), 'knight'));
  assert.ok(wornByRole(figureLook(fig('c3', 177, 1), { flats: FLATS }), 'mage'));
  // one picture, two pieces: two people; the same piece, the same person on every client
  const one = figureLook(fig('p1', 182, 3), { flats: FLATS }), two = figureLook(fig('p2', 182, 3), { flats: FLATS });
  assert.notDeepEqual(one, two, 'a second copy of a picture is a second person');
  assert.deepEqual(figureLook(fig('p1', 182, 3), { flats: FLATS }), one, 'the same piece, the same person');
  // keep their pictures
  assert.equal(figureLook(fig('k1', 182, 4), { flats: flatsOf({ '182.4': { gender: '1', caption: 'boy' } }) }), null, 'a child (StaticNPC\'s own child pairs)');
  assert.equal(figureLook(fig('k2', DAEDRA_PRINCES_ARCHIVE, 0), { flats: flatsOf({ '175.0': { gender: '2', caption: 'beautiful maiden' } }) }), null, 'Azura is no person in clothes');
  assert.equal(figureLook(fig('k3', 334, 5), { flats: FLATS }), null, 'no sex the column names');
  assert.equal(figureLook(fig('k4', 182, 99), { flats: FLATS }), null, 'no row at all');
  // not read yet: asked again, never cached as a picture
  const early = fig('e1', 182, 11);
  assert.equal(figureLook(early, { flats: null }), null);
  assert.equal(early._mwLook, undefined, 'a miss of the file is no verdict');
  assert.equal(figureLook(early, { flats: FLATS }).gender, 'female', 'read once it is in hand');
  assert.equal(figureLook(early, null), early._mwLook, 'kept on the piece - one build while it stands');
});

test('MWNPC18b figureRole: the caption\'s words to a role, the first that matches - a knight before a noble, the street\'s for words it does not know; every role it names a wardrobe role (mutants: the order turned)', () => {
  assert.equal(figureRole('noble knight'), 'knight');
  assert.equal(figureRole('Priestess of Mara'), 'priest');
  assert.equal(figureRole('witch'), 'mage');
  assert.equal(figureRole('barbarian with axe'), 'fighter');
  assert.equal(figureRole('Countess'), 'noble');
  assert.equal(figureRole('shopkeeper'), 'merchant');
  assert.equal(figureRole('hooded thief'), 'rogue');
  assert.equal(figureRole('old scholar'), 'scholar');
  assert.equal(figureRole('drunk'), 'commoner');
  assert.equal(figureRole(null), 'commoner');
  for (const [role] of FIGURE_ROLE_WORDS) assert.ok(ROLES[role], role);
});

test('MWNPC18c offerDecorFigures: each figure with a look offered on the lane at its picture\'s base, turned to the eye; one without draws its picture (its cast-only cleared); the lane off offers none (mutants: the offer skipped; the castOnly left)', () => {
  const offered = [];
  const lane = { offer: (a, b) => offered.push({ a, b }) };
  const figs = [fig('o1', 182, 11), fig('o2', 182, 4), fig('o3', 183, 4)];
  assert.equal(offerDecorFigures(figs, lane, true, { flats: FLATS, race: 'Breton' }, [1, 2, 10], 1 / 60), 2);
  assert.deepEqual(offered.map((o) => o.b), [figs[0].batch, figs[2].batch], 'the people, with the batches that draw them');
  assert.equal(offered[0].a.feet, figs[0].batch.origin, 'standing where the picture stands');
  assert.ok(Math.abs(offered[0].a.yaw) < 1e-9, 'facing the eye (+z of it)');
  assert.equal(figs[1].batch.castOnly, false, 'the child: its picture drawn');
  offered.length = 0;
  for (const f of figs) f.batch.castOnly = true;
  assert.equal(offerDecorFigures(figs, lane, false, { flats: FLATS }, [0, 0, 0], 0), 0);
  assert.deepEqual(offered, []);
  assert.ok(figs.every((f) => f.batch.castOnly === false), 'the lane off: every picture drawn');
});

test('MWNPC18d EVERY DECOR ROOM\'S FIGURES ARE OFFERED - the rooms\' on the interior host\'s people lane, the yards\' on the street\'s, before the bodies draw; a new host of decor rooms fails here until it does the same (the census never saw a decor room: its people are flats, not mobiles)', () => {
  const hosts = walk('src').filter((p) => /[=(,]\s*createDecorRoom\(/.test(rd(p))).sort();   // a call, not its definition
  assert.deepEqual(hosts, ['src/scenes/homeYards.js', 'src/scenes/worldModes.js'], 'the hosts that stand decor rooms');
  assert.match(rd('src/scenes/decorRoom.js'), /const figures = \(\) => \{ const out = \[\]; for \(const e of standing\.values\(\)\) if \(e\.batch && decorIsFigure\(e\.piece\)\) out\.push\(e\); return out; \};/);
  const modes = rd('src/scenes/worldModes.js');
  const o = modes.indexOf('offerDecorFigures(interiorDecor.figures(), peopleBodies, _peopleOn, figureCtx, mwv.eye, dt);');
  assert.ok(o > 0 && o < modes.indexOf('    peopleBodies.draw(canvas, proj, view, mwv.eye, dt);'), 'a room\'s, before its people draw');
  assert.match(rd('src/scenes/homeYards.js'), /figures: \(\) => \[\.\.\.yards\.values\(\)\]\.flatMap\(\(y\) => y\.pool\.figures\(\)\),/);
  const world = rd('src/scenes/world.js');
  const y = world.indexOf("    if (yards && _mode() === 'exterior') offerDecorFigures(yards.figures(), streetPeople, _peopleOn, yardFigureCtx, mwv.eye,");
  assert.ok(y > 0 && y < world.indexOf('    streetPeople.draw(canvas, proj, view, mwv.eye,'), 'a yard\'s, before the street\'s people draw');
  assert.equal(decorIsFigure({ model: null, flat: [182, 11] }), true, 'a person\'s flat is a figure');
});
