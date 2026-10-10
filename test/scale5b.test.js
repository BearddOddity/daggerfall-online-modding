// SCALE5b (2026-10-10, Mac: "lets now tackle the bigger work ... really future proof our archetecture while also
// increasing performance", then "I wanna do every single slice"; bible/11-Multiplayer/Scale-Arc.md SCALE5b): THE
// RELAY'S HYGIENE AND THE WIRE'S SECOND FORM. Part one, the second wire's poses: a socket whose hello says `w2` hears
// the room's poses batched (wire.js POSE_BATCH_MS) and slim (wire.js slimPose); a socket that says nothing hears every
// pose as it always has, byte for byte. Held here over the real Room on the pins' fake object (test/fakeRoom.mjs) and
// a real session over the pins' fake socket (test/fakeSocket.mjs). tools/mutants/scale5b.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { fakeRoom } from './fakeRoom.mjs';
import { fakeSocketClass } from './fakeSocket.mjs';
import { OnlineSession } from '../src/net/online.js';
import { validPose, slimPose, POSE_DEFAULTS, POSE_BATCH_MS, POSES_BATCH_MAX, PIXEL_UNITS, POSE_HZ_MAX, RELAY_VERSION } from '../src/net/wire.js';
import * as relay from '../server/src/relay.js';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const quiet = async (fn) => { const keep = { info: console.info, warn: console.warn, log: console.log }; console.info = console.warn = console.log = () => {}; try { return await fn(); } finally { Object.assign(console, keep); } };

/** A seeded roll (mulberry32) - every story replays. */
function roll(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const BX = 13 * 16 + 8, BY = 13 * 16 + 8;
const KEY = `world:${Math.floor(BX / 16)},${Math.floor(BY / 16)}`;
/** A lawful pose in the block's middle pixel, every field the wire carries drawn - defaults half the time. */
function drawn(rnd) {
  const pick = (v) => (rnd() < 0.5 ? undefined : v);
  return validPose({
    x: (BX + rnd()) * PIXEL_UNITS, y: (rnd() - 0.5) * 400, z: (499 - BY + rnd()) * PIXEL_UNITS, yaw: (rnd() - 0.5) * 7, pitch: (rnd() - 0.5) * 2,
    mv: pick(rnd() < 0.5 ? 1 : 2), wd: pick(1), an: pick((rnd() * 65535) | 0), as: pick(1), am: pick(1), sr: pick(1), cn: pick((rnd() * 900) | 0),
    cr: pick(1), ce: pick((rnd() * 4) | 0), ar: pick((rnd() * 40) | 0), fk: pick((rnd() * 5) | 0), rd: pick(1), rv: pick(2), lh: pick(1), lt: pick(9),
    ts: (rnd() * 60_000) | 0,
  });
}

/** A world room on a clock of its own, three listeners and a crowd of speakers: `w2` the second wire's, `old` the first's,
 *  `w2b` another of the second's. */
async function cell(fn, { speakers = 3 } = {}) {
  const realNow = Date.now;
  let clock = 1_800_000_000_000;
  Date.now = () => clock;
  try {
    return await quiet(async () => {
      const R = fakeRoom(KEY, { now: () => clock });
      const rnd = roll(5);
      const join = async (id, extra = {}) => { const ws = R.connect(); clock += 200; await R.hello(ws, id, drawn(rnd), extra); assert.equal(ws.closed, null, `${id} taken`); return ws; };
      const w2 = await join('lsn-w2', { w2: 1 });
      const old = await join('lsn-old');
      const w2b = await join('lsn-w2b', { w2: 1 });
      const said = [];
      for (let i = 0; i < speakers; i++) said.push(await join(`spk-${i}`));
      for (const ws of R.state.getWebSockets()) ws.sent.length = 0;
      const speak = async (ws, p) => { clock += Math.ceil(1000 / POSE_HZ_MAX) + 1; await R.pose(ws, p); };
      try { return await fn({ R, w2, old, w2b, said, speak, rnd, tick: (ms) => { clock += ms; } }); } finally { clearTimeout(R.room._poseFlush); R.room._poseFlush = null; }
    });
  } finally { Date.now = realNow; }
}

test('SCALE5b slimPose: a validated pose without its defaults, its place in whole world units and its turn to a ten-thousandth - validPose reads it back as the pose it was, over every field the wire carries (mutants: a default kept; a field dropped that is not at its default; the place unrounded; the turn rounded coarser)', () => {
  assert.equal(relay.slimPose, slimPose, 'one home, both ends');
  assert.equal(relay.POSE_BATCH_MS, POSE_BATCH_MS);
  const rnd = roll(11);
  let full = 0, slim = 0, n = 0, dropped = 0;
  for (let i = 0; i < 4000; i++) {
    const p = drawn(rnd);
    const s = slimPose(p);
    const back = validPose(JSON.parse(JSON.stringify(s)));
    assert.deepEqual(Object.keys(back).sort(), Object.keys(p).sort(), 'the same fields, every one');
    for (const k of Object.keys(p)) {
      if (k === 'x' || k === 'y' || k === 'z') { assert.ok(Math.abs(back[k] - p[k]) <= 0.5, `${k} within half a unit`); assert.ok(Number.isInteger(s[k]), `${k} whole`); }
      else if (k === 'yaw') { let d = Math.abs(back.yaw - p.yaw); if (d > Math.PI) d = 2 * Math.PI - d; assert.ok(d <= 5.0001e-5, `yaw within half a ten-thousandth (${d})`); }
      else if (k === 'pitch') assert.ok(Math.abs(back.pitch - p.pitch) <= 5.0001e-5, 'pitch within half a ten-thousandth');
      else assert.equal(back[k], p[k], k);
    }
    for (const [k, v] of Object.entries(POSE_DEFAULTS)) { if (p[k] === v) { assert.ok(!(k in s), `${k} at its default is left out`); dropped++; } else assert.equal(s[k], p[k], `${k} off its default is said`); }
    full += JSON.stringify(p).length; slim += JSON.stringify(s).length; n++;
  }
  assert.ok(dropped > n * 3, `defaults met often (${dropped})`);
  assert.ok(slim < full * 0.6, `the slim pose under three fifths of the whole (${(slim / n).toFixed(1)} of ${(full / n).toFixed(1)} bytes)`);
  // a player standing: the pose the wire said every keepalive, against the second wire's
  const stand = validPose({ x: 6_869_221.734, y: -1_412.25, z: 9_111_000.5, yaw: 1.234567, pitch: -0.0123456, ts: 4_100 });
  assert.equal(JSON.stringify(slimPose(stand)), '{"x":6869222,"y":-1412,"z":9111001,"yaw":1.2346,"pitch":-0.0123,"ts":4100}');
});

test('SCALE5b the relay: a `w2` listener hears the batch\'s poses as ONE `poses` frame of slim entries in the order they were said; a listener that said no `w2` hears each pose at once, byte for byte the frame it always heard (mutants: the batch skipped; the entry the whole pose; the legacy frame slimmed; the hello\'s `w2` unread; another offer refused; another offer read as this one)', async () => {
  await cell(async ({ R, w2, old, w2b, said, speak, rnd }) => {
    const order = [];
    for (let round = 0; round < 3; round++) {
      for (const [i, ws] of said.entries()) {
        const p = drawn(rnd);
        await speak(ws, p);
        order.push([`spk-${i}`, p]);
      }
    }
    assert.equal(w2.sent.length, 0, 'nothing yet to the second wire');
    assert.equal(w2b.sent.length, 0);
    // the first wire: one frame a pose, as it was before SCALE5b - the relay's own echo of what was said
    assert.deepEqual(old.sent, order.map(([id, p]) => ({ t: 'pose', id, p })));
    assert.equal(R.room._attach(w2).w2, 1, 'the hello\'s `w2` kept on the socket');
    assert.equal(R.room._attach(old).w2, undefined, 'and none on a socket that did not say it');
    const look = { race: 'Nord', gender: 'male', faceIndex: 0, items: [] };
    const offer = (w2) => relay.parseClient(JSON.stringify({ t: 'hello', id: 'lsn-0001', secret: 'secret-of-lsn-0001', name: 'x', look, pose: null, w2 }));
    assert.equal(offer(1).w2, 1, 'the offer read');
    for (const v of [2, true, '1', 0, null, undefined]) { const h = offer(v); assert.equal(h.error, undefined, `an offer of ${JSON.stringify(v)} lets the hello in`); assert.equal(h.w2, undefined, `and is no offer of this wire (${JSON.stringify(v)})`); }
    R.room._flushPoses();
    for (const ws of [w2, w2b]) {
      assert.equal(ws.sent.length, 1, 'one frame for the batch');
      const [f] = ws.sent;
      assert.equal(f.t, 'poses');
      assert.deepEqual(f.l, order.map(([id, p]) => [id, JSON.parse(JSON.stringify(slimPose(p)))]), 'each pose as its slim entry, in order');
    }
    R.room._flushPoses();
    assert.equal(w2.sent.length, 1, 'a flush with nothing owed says nothing');
  });
});

test('SCALE5b the relay: a `w2` socket\'s owed poses go out AHEAD of any other frame the room sends it - a leave never overtakes the pose said before it - and a socket gone is owed nothing (mutants: the flush before a send; the queue kept past the close)', async () => {
  await cell(async ({ R, w2, old, w2b, said, speak, rnd }) => {
    const p = drawn(rnd);
    await speak(said[0], p);
    await R.drop(said[0]);
    const kinds = (ws) => ws.sent.map((f) => f.t);
    assert.deepEqual(kinds(old), ['pose', 'leave']);
    assert.deepEqual(kinds(w2), ['poses', 'leave'], 'the pose first, then its sayer\'s leave');
    assert.deepEqual(w2.sent[0].l, [['spk-0', JSON.parse(JSON.stringify(slimPose(p)))]]);
    // the second listener closes owing a pose: nothing is kept for it, and nothing sent
    await speak(said[1], drawn(rnd));
    assert.equal(R.room._poseQ.has(w2b), true);
    await R.drop(w2b);
    assert.equal(R.room._poseQ.has(w2b), false, 'the queue went with the socket');
    const before = w2b.sent.length;
    R.room._flushPoses();
    assert.equal(w2b.sent.length, before, 'and the batch sent it nothing');
  });
});

test('SCALE5b the relay: the batch goes out on its own every POSE_BATCH_MS, one timer for the room however many listeners are owed, and none while nothing is (mutants: the timer never set; a timer a pose)', async () => {
  await cell(async ({ R, w2, w2b, said, speak, rnd }) => {
    assert.equal(R.room._poseFlush, null, 'no timer while nothing is owed');
    await speak(said[0], drawn(rnd));
    const first = R.room._poseFlush;
    assert.ok(first, 'a timer once a pose is owed');
    await speak(said[1], drawn(rnd));
    assert.equal(R.room._poseFlush, first, 'the same timer for the next');
    await new Promise((r) => setTimeout(r, POSE_BATCH_MS + 40));
    assert.equal(R.room._poseFlush, null);
    for (const ws of [w2, w2b]) { assert.equal(ws.sent.length, 1); assert.equal(ws.sent[0].l.length, 2); }
  });
});

/** A session in the room `KEY`, welcomed, on a clock of its own. */
function welcomed(opts = {}) {
  const { FakeWS, sockets } = fakeSocketClass();
  let t = 1_000_000;
  const s = new OnlineSession({ url: 'wss://relay.test', name: 'Mac', id: 'mac-0001', secret: 'secret-of-mac-0001', WebSocketImpl: FakeWS, now: () => t, rand: () => 0, ...opts });
  s.join(KEY, { x: (BX + 0.5) * PIXEL_UNITS, y: 0, z: (499 - BY + 0.5) * PIXEL_UNITS, yaw: 0, pitch: 0 });
  sockets[0].open();
  sockets[0].receive({ t: 'welcome', id: 'mac-0001', peers: [], n: 1, v: RELAY_VERSION, now: t });
  return { s, ws: sockets[0], hello: JSON.parse(sockets[0].sent.find((x) => x.startsWith('{"t":"hello"'))) };
}
/** What a session holds of its peers - every field but the clock's. */
const held = (s) => JSON.stringify([...s.peers].map(([id, p]) => [id, p.pose, p.name, p.src, [...s._roomSet(KEY)].sort()]));

test('SCALE5b the client: a session asked for the second wire says `w2` in its hello and one not asked says nothing; a `poses` batch is read entry by entry through the door every pose comes in by - the peers it stands are exactly those its poses, said one frame each and whole, stand (mutants: the hello\'s `w2`; the batch unread; an entry skipped; the bound unasked; a malformed entry read)', async () => {
  await quiet(() => {
    assert.equal(welcomed().hello.w2, undefined, 'an older build\'s hello, and a session not asked');
    const { s: batched, ws: wb, hello } = welcomed({ wire2: true });
    assert.equal(hello.w2, 1, 'the second wire offered');
    const { s: single, ws: w1 } = welcomed();
    const rnd = roll(23);
    // poses whose place and turn are already what the slim pose rounds them to - so the whole pose and the slim one are the same pose
    const poses = Array.from({ length: 40 }, (_, i) => {
      const p = drawn(rnd);
      for (const k of ['x', 'y', 'z']) p[k] = Math.round(p[k]);
      for (const k of ['yaw', 'pitch']) p[k] = Math.round(p[k] * 1e4) / 1e4;
      return [`peer-${String(i % 17).padStart(4, '0')}`, validPose(p)];
    });
    for (const [id, p] of poses) w1.receive({ t: 'pose', id, p });
    wb.receive({ t: 'poses', l: poses.map(([id, p]) => [id, slimPose(p)]) });
    assert.equal(batched.peers.size, 17);
    assert.equal(held(batched), held(single), 'the batch stood every peer where its poses, said whole, stand them');
    // the bound, and an entry that is no entry
    const { s: bounded, ws: wbd } = welcomed({ wire2: true });
    const many = Array.from({ length: POSES_BATCH_MAX + 5 }, (_, i) => [`far-${String(i).padStart(4, '0')}`, slimPose(poses[0][1])]);
    wbd.receive({ t: 'poses', l: [null, 7, ['x'], [5, {}], ['bad-0001', null], ...many] });
    assert.equal(bounded.peers.size, POSES_BATCH_MAX - 5, 'POSES_BATCH_MAX entries read at most - the five that were no entry among them, read as nothing');
    assert.equal(bounded.peers.has('far-0000'), true);
    wbd.receive({ t: 'poses', l: 'nope' });
    wbd.receive({ t: 'poses' });
  });
});

test('SCALE5b the world host asks the second wire on every socket the page holds - the presence session (its halo with it) and each chat link (mutants: the presence session\'s; a link\'s)', () => {
  const world = src('src/scenes/world.js');
  const links = world.match(/new OnlineSession\(\{[^\n]*presence: false[^\n]*\}\)/g) ?? [];
  assert.ok(links.length >= 2, 'the chat links and the hall');
  for (const l of links) assert.match(l, /wire2: true/, l.slice(0, 80));
  assert.match(world, /wave: pageWave,[^\n]*\n\s+wire2: true,/, 'the presence session');
});
