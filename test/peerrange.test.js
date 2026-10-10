// PEER-RANGE (2026-10-10, the owner: "So for online performance, I believe the rendering of players far out is
// contributing to poor performance"): THE OTHERS, DRAWN AS FAR AS THEY CAN BE SEEN. A world cell hands the screen every
// player within the relay's three map pixels (nearly 2,500 m), and every one was drawn. Past the distance on the Other
// players card a player now stands nowhere on this screen - GATE-CROWD's cut, by distance (net/peerRange.js; the online
// frame's drawn list): the party and the one I duel always, nobody cut under the travel view, a drawn player held a
// little past the edge. Design: bible/07-Rendering/Performance-Priority.md PEER-RANGE.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { rangeDrawn, createPeerRange, peerRangeOf, PEER_RANGE_TIERS, PEER_RANGE_DEFAULT, PEER_RANGE_HOLD } from '../src/net/peerRange.js';
import { PREF_DEFAULTS } from '../src/systems/uiPrefs.js';
import { MISSILE_SPEED, MISSILE_LIFESPAN_S } from '../src/systems/spellcast.js';
import { BLOW } from '../src/ai/blowShapes.js';
import { RemotePlayers } from '../src/net/remotePlayers.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const WORLD = read('src/scenes/world.js');
const lift = (re, what) => { const m = re.exec(WORLD); assert.ok(m, `lifted from scenes/world.js: ${what}`); return m; };

/** A peer as the online frame holds one - its id, and its pose `shown` in the scene's own frame here. */
const peer = (id, x, z = 0, y = 0) => ({ id, shown: { x, y, z } });
const at = (p) => [p.shown.x, p.shown.y, p.shown.z];
const ids = (set) => [...set].sort();
const ME = [0, 0, 0];

// ── the law ─────────────────────────────────────────────────────────────────────────────────────────────────────────

test('PEER-RANGE the choices: 150, 300, 600 m or everyone, 300 by default; held to a tenth past; a stored value that is no choice reads as the default; the shelf\'s default is the law\'s (mutants: another default; the tiers reordered; no hold; a stray value kept; the shelf\'s own literal)', () => {
  assert.deepEqual(PEER_RANGE_TIERS, [150, 300, 600, 0], 'outward, then everyone - the card steps through them in order');
  assert.equal(PEER_RANGE_DEFAULT, 300);
  assert.equal(PEER_RANGE_HOLD, 1.1);
  assert.equal(PREF_DEFAULTS.peerRange, PEER_RANGE_DEFAULT, 'the prefs shelf carries the law\'s own default');
  for (const v of PEER_RANGE_TIERS) assert.equal(peerRangeOf(v), v, `${v} is a choice`);
  for (const v of [undefined, null, 7, -300, '300', 301, true, Infinity, NaN]) assert.equal(peerRangeOf(v), PEER_RANGE_DEFAULT, `${String(v)} is no choice`);
});

test('PEER-RANGE the default is past a shot\'s reach: a missile or an arrow, aimed, flies 25 m/s x 8 s x 1.3 = 260 m, and nobody inside that is cut at the default - the near tier can, and its row says so (mutants: a default inside the reach)', () => {
  const reach = MISSILE_SPEED * MISSILE_LIFESPAN_S * BLOW.aimed.speed;
  assert.equal(reach, 260);
  assert.ok(PEER_RANGE_DEFAULT >= reach, `the default ${PEER_RANGE_DEFAULT} m reaches past a shot's ${reach} m`);
  assert.ok(PEER_RANGE_TIERS[0] < reach, 'the near tier is inside it');
  assert.match(read('src/ui/enhancedMenu.js'), /choiceRow\('peerRange', 'Draw distance',\n\s*'[^']*150 m can hide an archer\.'/, 'and the row says so');
});

test('PEER-RANGE the drawn: within the range on the ground drawn, past it not, at it drawn; height is not distance; a party mate anywhere; no range or no place of mine draws everyone; a peer with no place is not drawn; `out` refilled (mutants: the range unread; strictly inside; height counted; the mate unasked; no range cutting; a placeless peer drawn)', () => {
  const crowd = [peer('a', 10), peer('b', 299, 0), peer('c', 0, -300), peer('d', 301), peer('e', 0, 2400), peer('f', 212, 212)];
  assert.deepEqual(ids(rangeDrawn(crowd, ME, { at, range: 300 })), ['a', 'b', 'c', 'f'], 'within 300 m, the edge included');
  assert.deepEqual(ids(rangeDrawn(crowd, ME, { at, range: 150 })), ['a'], 'within 150 m');
  assert.deepEqual(ids(rangeDrawn(crowd, ME, { at, range: 600 })), ['a', 'b', 'c', 'd', 'f']);
  assert.deepEqual(ids(rangeDrawn(crowd, ME, { at })), ['a', 'b', 'c', 'f'], 'by default, 300 m');
  assert.equal(rangeDrawn(crowd, ME, { at, range: 0 }).size, crowd.length, 'no range: everyone');
  assert.equal(rangeDrawn(crowd, null, { at, range: 300 }).size, crowd.length, 'no place of mine: everyone');
  // the ground's distance - a player high on a ridge above me is as near as their feet across the ground
  assert.ok(rangeDrawn([peer('up', 50, 0, 900)], ME, { at, range: 150 }).has('up'), 'height is not distance on the ground');
  // measured from me, wherever I stand
  assert.deepEqual(ids(rangeDrawn(crowd, [0, 0, 2300], { at, range: 150 })), ['e']);
  // a party mate across the map is drawn
  assert.ok(rangeDrawn(crowd, ME, { at, range: 150, mate: (id) => id === 'e' }).has('e'), 'my party mate 2.4 km off');
  // a peer with no place in this scene is not drawn
  assert.equal(rangeDrawn([{ id: 'x', shown: null }], ME, { at: () => null, range: 300 }).size, 0);
  const out = new Set(['stale']);
  assert.equal(rangeDrawn(crowd, ME, { at, range: 300 }, out), out);
  assert.ok(!out.has('stale') && out.size === 4);
});

test('PEER-RANGE held at the edge: one drawn last frame stays until a tenth past the range, one not drawn needs the range itself (mutants: no hold; the hold given to the newcomer; the hold\'s sign turned)', () => {
  const walker = peer('w', 320), stranger = peer('s', 320);
  const was = new Set(['w']);
  assert.deepEqual(ids(rangeDrawn([walker, stranger], ME, { at, range: 300, was })), ['w'], 'drawn last frame, kept at 320 m');
  assert.equal(rangeDrawn([peer('w', 329)], ME, { at, range: 300, was }).size, 1, 'and at 329 m');
  assert.equal(rangeDrawn([peer('w', 331)], ME, { at, range: 300, was }).size, 0, 'and let go at 331 m');
  assert.equal(rangeDrawn([walker], ME, { at, range: 300, was, hold: 1 }).size, 0, 'no hold, no keeping');
  assert.equal(rangeDrawn([peer('w', 640)], ME, { at, range: 600, was }).size, 1, 'the hold scales with the range: 640 m kept at 600');
});

test('PEER-RANGE the host\'s range: the same list when every one is drawn, else the drawn in order; `shows` false only for one it cut - a player it never saw is not its to answer for; off (the travel view), with no range or no place of mine, every one and the held set forgotten (mutants: the hold forgotten frame to frame; shows true for the cut; shows false for the unseen; off still cutting; off keeping the held)', () => {
  const pr = createPeerRange();
  const near = [peer('a', 10), peer('b', 200)];
  assert.equal(pr.cut(near, { me: ME, at, range: 300 }), near, 'everyone within: the same list');
  assert.ok(pr.live);
  const crowd = [peer('a', 10), peer('far', 900), peer('b', 200), peer('edge', 310)];
  assert.deepEqual(pr.cut(crowd, { me: ME, at, range: 300 }).map((p) => p.id), ['a', 'b'], 'the drawn, in the room\'s order');
  assert.equal(pr.shows('far'), false, 'cut: not there to press or hear');
  assert.equal(pr.shows('edge'), false);
  assert.equal(pr.shows('a'), true);
  assert.equal(pr.shows('below-deck'), true, 'never handed to the cut: not the cut\'s to hide');
  // the held set carries frame to frame: 'b' walks out to 320 m and is kept; 'edge' walks in to 320 m and is not
  const next = [peer('a', 10), peer('b', 320), peer('edge', 320)];
  assert.deepEqual(pr.cut(next, { me: ME, at, range: 300 }).map((p) => p.id), ['a', 'b'], 'kept walking out, not taken walking in');
  // off - the travel view: every one, and the held set gone with it
  assert.equal(pr.cut(crowd, { on: false, me: ME, at, range: 300 }), crowd, 'off: every one');
  assert.ok(!pr.live);
  assert.equal(pr.shows('far'), true, 'off: nobody cut');
  assert.equal(pr.held().size, 0, 'and the held set forgotten');
  assert.deepEqual(pr.cut(next, { me: ME, at, range: 300 }).map((p) => p.id), ['a'], 'on again: chosen afresh - 320 m is outside');
  assert.equal(pr.cut(crowd, { me: ME, at, range: 0 }), crowd, 'everyone on the card');
  assert.equal(pr.cut(crowd, { me: null, at, range: 300 }), crowd, 'no place of mine');
});

test('PEER-RANGE the layers let a cut player go: a class sprite walking out past the hold has its batch destroyed and its next frame draws nothing; walking back inside the range builds it again - the real RemotePlayers on the cut\'s list (mutants: the cut unread by the host is the host pin\'s; here, the hold and the range)', async () => {
  const made = [], gone = [];
  const textures = new Map();
  const renderer = {
    textures,
    createBillboardBatch: (archive, record) => { const b = { archive, record, origin: [0, 0, 0] }; made.push(b); return b; },
    destroyBillboardBatch: (b) => gone.push(b),
  };
  const tex = { archive: 4321, getFrameCount: () => 5, getSize: () => ({ width: 64, height: 128 }), getScale: () => ({ width: 0, height: 0 }) };
  const deps = { fetchBytes: null, palette: null, getTexture: async () => tex, uploadRecordFrame: (a, r, f) => textures.set(`${a}_${r}#${f}`, {}), audio: null };
  const rp = new RemotePlayers({ renderer, deps, compose: async () => null });
  const pr = createPeerRange();
  const look = { class: 'Warrior', gender: 'male' };
  const frame = async (x) => {
    const peers = [{ id: 'near', look, shown: { x: 5, y: 0, z: 0, yaw: 0, mv: 0 } }, { id: 'w', look, shown: { x, y: 0, z: 0, yaw: 0, mv: 0 } }];
    rp.sync(pr.cut(peers, { me: ME, at, range: 300 }), (p) => [p.x, p.y, p.z], { dt: 1 / 60, eye: ME });
    await new Promise((r) => setTimeout(r, 0));
    rp.sync(pr.cut(peers, { me: ME, at, range: 300 }), (p) => [p.x, p.y, p.z], { dt: 1 / 60, eye: ME });
    return rp.batches().length;
  };
  assert.equal(await frame(250), 2, 'both drawn inside the range');
  const walkerBatch = rp.batchOf('w');
  assert.ok(walkerBatch);
  assert.equal(await frame(325), 2, 'walking out: held at 325 m');
  assert.equal(await frame(340), 1, 'past the hold: one sprite');
  assert.ok(gone.includes(walkerBatch), 'and its batch destroyed');
  assert.equal(rp.batchOf('w'), null);
  assert.equal(await frame(320), 1, 'coming back: not drawn until inside the range');
  assert.equal(await frame(290), 2, 'inside: drawn again');
  rp.destroy();
});

// ── the host: the range's cut in the online frame ───────────────────────────────────────────────────────────────────

test('PEER-RANGE the online frame: the drawn list cut by distance after the map\'s poses are kept and before the court\'s crowd, a cast, a light or a body - at the card\'s distance, my party and my duel always, nothing cut under the travel view; the doors that answer a player on this screen ask the cut too (mutants: the travel view cutting; the card unread; the party unasked; the duel unasked; the pick, the gift and the spark uncut)', () => {
  const m = lift(/\n\s*for \(const d of drawable\) if \(d\?\.shown\) _peerMapPoses\.set\(d\.id, d\.shown\);\n(?:\s*if \(hccOn\(\)\) hcc\.driverGlue\(drawable, \{ toWire: campToWire \}\);[^\n]*\n)?\s*const ranged = peerRange\.cut\(cabin \? drawable : drawable\.filter\(\(d\) => !csaPeers\.isBelowDeck\(d\.id\)\), (\{ on: [^\n]*?\})\);[^\n]*\n\s*const visiblePeers = gateCrowd\.cut\(ranged, \{/, 'the range\'s cut, before the crowd\'s');
  assert.match(WORLD, /const peerRange = createPeerRange\(\);/);
  // the cut's question, evaluated as the frame asks it
  const ask = new Function('d', `const { travelView, player, onlineToScene, peerRangeOf, getPref, social, duelMgr } = d; return ${m[1]};`);
  const prefs = { peerRange: 300 };
  const mates = new Set(['mate']);
  const host = ({ tv = false, duel = null } = {}) => ({
    travelView: tv ? { active: true } : { active: false }, player: { pos: [0, 0, 0] }, onlineToScene: (p) => [p.x, p.y, p.z], peerRangeOf,
    getPref: (k) => prefs[k], social: { isPartyPeer: (id) => mates.has(id) }, duelMgr: { fighting: duel != null, opponent: duel },
  });
  const crowd = [peer('near', 40), peer('mate', 1800), peer('foe', 700), peer('far', 2400)];
  const cutIds = (o) => createPeerRange().cut(crowd, ask(o)).map((p) => p.id);
  assert.deepEqual(cutIds(host()), ['near', 'mate'], 'on the street: within 300 m, and my party mate across the map');
  assert.deepEqual(cutIds(host({ duel: 'foe' })), ['near', 'mate', 'foe'], 'and the one I duel, wherever they stand');
  assert.deepEqual(cutIds(host({ tv: true })), crowd.map((p) => p.id), 'under the travel view: nobody cut (OW-PEERS)');
  prefs.peerRange = 600;
  assert.deepEqual(cutIds(host()), ['near', 'mate'], 'the card at 600 m');
  prefs.peerRange = 0;
  assert.deepEqual(cutIds(host()), crowd.map((p) => p.id), 'the card at everyone');
  prefs.peerRange = 'junk';
  assert.deepEqual(cutIds(host()), ['near', 'mate'], 'a stray value reads as the default');
  prefs.peerRange = 150;
  assert.deepEqual(createPeerRange().cut([peer('archer', 200)], ask(host())).length, 0, 'the near tier');
  // the readers of the drawn list are the cut's (GATE-CROWD's pin holds the casts, the seen and the sprites to it); the
  // doors that answer a player on this screen ask it as they ask the crowd's - the pick and the plaque, a gift's aim and
  // its burst (both through crowdDrawnHere), a blow's spark and a cry
  assert.match(WORLD, /const crowdDrawnHere = \(p\) => gateCrowd\.shows\(p\.id\) && peerRange\.shows\(p\.id\);/);
  assert.match(WORLD, /for \(const p of online\.peers\.values\(\)\) \{\n\s*if \(!p\?\.shown \|\| !online\.visible\(p\) \|\| !gateCrowd\.shows\(p\.id\) \|\| !peerRange\.shows\(p\.id\)\) \{ peerFxPlayer\.forget\(p\?\.id\); continue; \}/, 'a blow\'s spark and a cry');
});

test('PEER-RANGE the Other players card: the distance beside the court\'s crowd, its tiers the law\'s, Everyone for 0 (mutants: the row gone; its key another; the tiers written twice)', () => {
  const menu = read('src/ui/enhancedMenu.js');
  assert.match(menu, /import \{ PEER_RANGE_TIERS \} from '\.\.\/net\/peerRange\.js';/);
  const card = menu.slice(menu.indexOf('function peerSpritesCard() {'), menu.indexOf('\n}\n', menu.indexOf('function peerSpritesCard() {')));
  assert.match(card, /c\.append\(choiceRow\('peerRange', 'Draw distance',\n[^\n]*\n\s*PEER_RANGE_TIERS\.map\(\(m\) => \[m, m \? `\$\{m\} m` : 'Everyone'\]\), \{ home: true \}\)\);/);
  assert.ok(card.indexOf("choiceRow('peerRange'") < card.indexOf("choiceRow('gateCrowd'"), 'the street\'s distance before the court\'s crowd');
});
