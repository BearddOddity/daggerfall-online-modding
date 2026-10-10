// HALO-THIN (2026-10-10, the owner: "For you when you are near a player ... Theres 10 position updates every time.
// Multiply it by the times the player is near you and its an insane bottleneck"): A HALO HEARS WHERE I AM, NOT EVERY
// STEP. Every pose went down my cell's socket AND every halo's, and a listener holding the same rooms heard each pose
// once per room - two copies astride an edge, four at a corner. Everyone in range of me holds my own cell (wire.js
// cellHaloFor's symmetry), so its fan alone reaches them; a halo hears a pose when it is due (net/online.js
// haloPoseDue) - its first, a new map pixel, HALO_STEP_M moved, a stop, a fall, the heartbeat - and every pose while my
// own cell's socket takes none or a referee may stand in a halo (the host's `haloWhole`). Design:
// bible/11-Multiplayer/Scale-Arc.md HALO-THIN.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { OnlineSession, haloPoseDue, HALO_STEP_M, HALO_STEP_UNITS, HEARTBEAT_MS, POSE_HZ } from '../src/net/online.js';
import { PIXEL_UNITS, WORLD_CELL, cellHaloFor } from '../src/net/wire.js';
import { fakeSocketClass } from './fakeSocket.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const UNITS_PER_M = PIXEL_UNITS / 819.2;
const CELL = WORLD_CELL * PIXEL_UNITS;
const quiet = (fn) => { const w = console.log; console.log = () => {}; try { return fn(); } finally { console.log = w; } };

// ── the law ─────────────────────────────────────────────────────────────────────────────────────────────────────────

test('HALO-THIN the step: eight metres in the pose\'s own units - a cell\'s poses are MapsFile\'s frame, 40 to the metre (mutants: another step; the units dropped)', () => {
  assert.equal(HALO_STEP_M, 8);
  assert.equal(HALO_STEP_UNITS, 8 * 40);
  assert.equal(UNITS_PER_M, 40);
});

test('HALO-THIN due: a halo that heard nothing yet, the heartbeat, a fall, a stop, a new map pixel either way and eight metres on the ground are due - a step, a turn, a run on and a height are not (mutants: the first unheard; no heartbeat; no fall; no stop; a start counted as a stop; the pixel unread on x or z; the step strict; height counted)', () => {
  const at = 5000, x = 10 * PIXEL_UNITS + 1000, z = 20 * PIXEL_UNITS + 1000;
  const last = { x, z, mv: 1, at };
  assert.equal(haloPoseDue(null, { x, z, mv: 1 }, at), true, 'its first since its welcome');
  assert.equal(haloPoseDue(undefined, { x, z, mv: 1 }, at), true);
  assert.equal(haloPoseDue(last, { x: x + 40, z, mv: 1 }, at + 100), false, 'a metre on: not due');
  assert.equal(haloPoseDue(last, { x, z, mv: 1, yaw: 3 }, at + 100), false, 'a turn: not due');
  assert.equal(haloPoseDue(last, { x, z, y: 9999, mv: 1 }, at + 100), false, 'a height: not due - the ground\'s distance');
  assert.equal(haloPoseDue(last, { x, z, mv: 1 }, at + HEARTBEAT_MS - 1), false);
  assert.equal(haloPoseDue(last, { x, z, mv: 1 }, at + HEARTBEAT_MS), true, 'the heartbeat');
  assert.equal(haloPoseDue(last, { x, z, mv: 1, dd: 1 }, at + 100), true, 'a fall');
  assert.equal(haloPoseDue(last, { x, z, mv: 0 }, at + 100), true, 'a stop: where I stand');
  assert.equal(haloPoseDue({ ...last, mv: 0 }, { x, z, mv: 0 }, at + 100), false, 'standing still is no stop');
  assert.equal(haloPoseDue({ ...last, mv: 0 }, { x, z, mv: 1 }, at + 100), false, 'a start is not due');
  assert.equal(haloPoseDue({ ...last, mv: 1 }, { x, z, mv: 2 }, at + 100), false, 'a run on from a walk is not');
  // the pixel - the range's own grain and a raid's word - even a unit across
  const edgeX = { x: 11 * PIXEL_UNITS - 1, z, mv: 1, at };
  assert.equal(haloPoseDue(edgeX, { x: 11 * PIXEL_UNITS, z, mv: 1 }, at + 100), true, 'a new pixel east');
  const edgeZ = { x, z: 21 * PIXEL_UNITS - 1, mv: 1, at };
  assert.equal(haloPoseDue(edgeZ, { x, z: 21 * PIXEL_UNITS, mv: 1 }, at + 100), true, 'a new pixel north');
  // eight metres on the ground, the edge included
  assert.equal(haloPoseDue(last, { x: x + HALO_STEP_UNITS, z, mv: 1 }, at + 100), true, 'eight metres east');
  assert.equal(haloPoseDue(last, { x, z: z - HALO_STEP_UNITS, mv: 1 }, at + 100), true, 'eight metres south');
  assert.equal(haloPoseDue(last, { x: x + HALO_STEP_UNITS - 1, z, mv: 1 }, at + 100), false, 'not quite');
  const d = HALO_STEP_UNITS / Math.SQRT2 + 1;
  assert.equal(haloPoseDue(last, { x: x + d, z: z + d, mv: 1 }, at + 100), true, 'eight metres on the diagonal');
});

// ── the session ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** A real session at the corner of four cells - in (1,1) and holding the three round the corner, every socket open and
 *  welcomed - and a clock. */
function cornerSession() {
  const { FakeWS, sockets } = fakeSocketClass();
  const clock = { t: 1_000_000 };
  const s = new OnlineSession({ url: 'wss://relay.test', name: 'Mac', id: 'mac-0001', secret: 'shh-shh-shh-0001', WebSocketImpl: FakeWS, now: () => clock.t });
  const start = { x: CELL + 100 * UNITS_PER_M, y: 0, z: CELL + 100 * UNITS_PER_M, yaw: 0, pitch: 0, mv: 1 };
  const halos = cellHaloFor(Math.floor(start.x / PIXEL_UNITS), Math.floor(start.z / PIXEL_UNITS));
  quiet(() => {
    s.join('world:1,1', start);
    sockets[0].open(); sockets[0].receive({ t: 'welcome', id: 'mac-0001', peers: [] });
    s.setHalo(halos);
    for (let i = 1; i < sockets.length; i++) { sockets[i].open(); sockets[i].receive({ t: 'welcome', id: 'mac-0001', peers: [] }); }
  });
  for (const ws of sockets) ws.sent.length = 0;
  const poses = (ws) => ws.sent.filter((t) => t.startsWith('{"t":"pose"')).map((t) => JSON.parse(t).p);
  return { s, sockets, clock, start, halos, poses };
}

test('HALO-THIN the session: my own cell hears every pose; each halo its first, each eight metres, the stop and the heartbeat - one copy where four went (mutants: halos every pose; the primary thinned; a halo\'s last not kept; the step unread)', () => {
  const { s, sockets, clock, start, halos, poses } = cornerSession();
  assert.equal(halos.length, 3, 'a corner holds three halos');
  assert.equal(sockets.length, 4);
  const pose = { ...start };
  // walking north at 4 m/s for ten seconds, a frame every 100 ms (the pose rate)
  for (let f = 0; f < 100; f++) { clock.t += 1000 / POSE_HZ; pose.z += 4 * UNITS_PER_M / POSE_HZ; s.sendPose({ ...pose }); }
  const mine = poses(sockets[0]);
  assert.equal(mine.length, 100, 'my own cell: every pose');
  for (const ws of sockets.slice(1)) {
    const heard = poses(ws);
    assert.equal(heard.length, 5, 'a halo: its first (0.4 m on), then one each eight metres - 8.4, 16.4, 24.4 and 32.4 of the forty walked (4 m/s for 10 s)');
    for (let i = 1; i < heard.length; i++) assert.ok(heard[i].z - heard[i - 1].z >= HALO_STEP_UNITS, 'each eight metres on from the last it heard');
    assert.deepEqual(heard[0], mine[0], 'the same pose, its send time with it');
  }
  assert.equal(s.stats.haloThinned, 3 * 95, 'and the rest counted as not due');
  // a stop is heard by every halo at once
  clock.t += 1000 / POSE_HZ;
  s.sendPose({ ...pose, mv: 0 });
  for (const ws of sockets.slice(1)) { const h = poses(ws); assert.equal(h.length, 6); assert.equal(h[5].mv, 0, 'where I stopped'); }
  // standing: the heartbeat, through every socket
  clock.t += HEARTBEAT_MS;
  s.sendPose({ ...pose, mv: 0 });
  for (const ws of sockets) assert.equal(poses(ws).at(-1).ts, poses(sockets[0]).at(-1).ts, 'the heartbeat, everywhere');
  assert.equal(poses(sockets[1]).length, 7);
});

test('HALO-THIN whole: while the host says a referee may stand in a halo, and while my own cell\'s socket takes nothing, every pose goes to every halo (mutants: haloWhole unread; the primary\'s refusal unread)', () => {
  const { s, sockets, clock, start, poses } = cornerSession();
  const pose = { ...start };
  s.haloWhole = true;
  for (let f = 0; f < 20; f++) { clock.t += 1000 / POSE_HZ; pose.z += UNITS_PER_M; s.sendPose({ ...pose }); }
  for (const ws of sockets) assert.equal(poses(ws).length, 20, 'a duel, the open zone, a serpent\'s fight: whole');
  s.haloWhole = false;
  for (const ws of sockets) ws.sent.length = 0;
  // my own cell's socket drops (its reconnect pending): the halos carry me whole (AUDIT WORLD6b-iii(b) A5)
  s.status = 'connecting';
  for (let f = 0; f < 20; f++) { clock.t += 1000 / POSE_HZ; pose.z += UNITS_PER_M; s.sendPose({ ...pose }); }
  assert.equal(poses(sockets[0]).length, 0, 'my own cell took none');
  for (const ws of sockets.slice(1)) assert.equal(poses(ws).length, 20, 'every halo, every pose');
});

test('HALO-THIN a new socket has heard nothing: a halo\'s reconnect - a new socket welcomed - hears the next pose whatever the step; a fall goes everywhere (mutants: the last kept per room, not per socket; the fall thinned)', () => {
  const { s, sockets, clock, start, halos, poses } = cornerSession();
  const pose = { ...start };
  clock.t += 100; s.sendPose({ ...pose });
  clock.t += 100; pose.z += UNITS_PER_M; s.sendPose({ ...pose });
  assert.equal(poses(sockets[1]).length, 1, 'a metre on: not due');
  // the halo's socket replaced (a reconnect), and welcomed
  const h = s._halo.get(halos[0]);
  const old = h.ws;
  const { FakeWS } = fakeSocketClass();
  const fresh = new FakeWS(old.url);
  h.ws = fresh; h.status = 'open';
  quiet(() => { s._bind(fresh); fresh.open(); fresh.receive({ t: 'welcome', id: 'mac-0001', peers: [] }); });
  fresh.sent.length = 0;
  clock.t += 100; pose.z += UNITS_PER_M; s.sendPose({ ...pose });
  assert.equal(poses(fresh).length, 1, 'the new socket hears the next pose');
  // a fall: every socket, as it always was (sendDeath)
  for (const ws of sockets) ws.sent.length = 0; fresh.sent.length = 0;
  assert.ok(s.sendDeath());
  assert.equal(poses(sockets[0]).length, 1);
  for (const ws of [fresh, ...sockets.slice(2)]) assert.equal(poses(ws).length, 1, 'the fall in every halo');
});

// ── the host ────────────────────────────────────────────────────────────────────────────────────────────────────────

test('HALO-THIN the host: the halos whole while a duel stands (it is refereed in the room my opponent is heard through), in the open zone and in a serpent\'s fight - said before the frame\'s pose leaves; the serpent\'s fight is this frame\'s (mutants: the duel unasked; the zone unasked; the serpent unasked; the word after the pose; the fight never put down)', () => {
  const w = read('src/scenes/world.js');
  const line = /\n\s*online\.haloWhole = !!duelMgr\.duel \|\| wildHere\(\) \|\| _serpentFight;[^\n]*\n\s*if \(!key\) \{ if \(online\.room\) online\.leave\(\); \}/;
  assert.match(w, line, 'the word, just before the frame\'s join or pose');
  assert.ok(w.indexOf('online.haloWhole = ') < w.indexOf('    else online.sendPose({ ...pose, ...arm, ...poseFx() });'));
  assert.match(w, /\n\s*_serpentFight = false;\n\s*if \(!serpentHost\) return;/, 'put down each frame first');
  assert.match(w, /try \{ fight = street && serpentHost\.frame\(\); \} catch \(e\) \{[^\n]*\}\n\s*_serpentFight = !!fight;/, 'then this frame\'s fight');
  // the serpent's frame runs inside the online frame, before the pose
  const of = w.indexOf('  const onlineFrame = (now, dt) => {');
  assert.ok(of > 0 && w.indexOf('    serpentFrame();', of) < w.indexOf('online.haloWhole = ', of), 'the fight read before the word');
  // the relay's referees read the pose of the room the bout is in - the reason the word exists
  const relay = read('server/src/index.js');
  assert.match(relay, /if \(posed && this\._duelRef\?\.bouts\.size\) \{ duelPose\(this\._duelRef, a\.sub, m\.p, now\);/);
  assert.match(relay, /if \(posed && this\._wildRef\?\.fighters\.has\(a\.sub\)\) \{ wildPose\(this\._wildRef, a\.sub, m\.p, now\);/);
  assert.match(relay, /if \(posed && this\._trailing\(a\)\) this\._trailPose\(ws, m\.p, now\);/);
  const online = read('src/net/online.js');
  assert.match(online, /: this\._socketFor\(d\.to\);/, 'a duel frame goes down the socket the opponent is heard through');
});
