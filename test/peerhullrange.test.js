// PEER-HULL-RANGE (2026-10-11) - ANOTHER'S SHIP FAR OFF STANDS NO HULL HERE. Every peer in the room says their sea in
// their word, so a client held every player's ships wherever they sailed, and Come Sail Away's pool walked and baked
// each one every frame - 30-40 hulls, most of them 80-700 km off, a third of the main thread (scenes/navalHost.js
// PEER_HULL_NEAR_M). Her record is kept as ever; only her hull waits for the eye to come near. The sea of
// test/navalSea.mjs, on foot at the origin.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sea } from './navalSea.mjs';
import { PEER_HULL_NEAR_M, PEER_HULL_FAR_M } from '../src/scenes/navalHost.js';
import { navalWireRecord } from '../src/systems/naval/navalWire.js';

const said = (n, pos, seed) => navalWireRecord({ ships: [{ n, classId: 'merchantGalleon', variant: 0, pos, yaw: 0, speed: 0, sails: 1, hull: 1, sail: 1, crew: 1, state: 'afloat', heel: 0, seed, fire: false }] }).s[0];
const word = (...ships) => ({ s: ships, v: [], b: [] });
const standAt = (h, x, z) => { h.view.feet = [x, 0, z]; h.view.look = { origin: [x, 5, z], dir: [1, -0.05, 0] }; };

test('PEER-HULL-RANGE another\'s ship within PEER_HULL_NEAR_M of the eye stands her hull, one 100 km off her record alone (none in the pool); the eye come near, her hull is built; gone past PEER_HULL_FAR_M, it goes back to the pool and her record stays; between the two it stays as it is (mutants: no range, no letting go, the far edge the near one)', async () => {
  assert.ok(PEER_HULL_FAR_M > PEER_HULL_NEAR_M, 'a gap between building and letting go');
  const h = await sea({ hull: null });
  standAt(h, 0, 0);
  const far = [90000, 0, -50000];
  h.host.applyWord('z', word(said(1, [PEER_HULL_NEAR_M - 500, 0, 0], 11), said(2, far, 12)), (p) => p);
  h.run(1);
  const near = h.host._sea.get('z:1'), off = h.host._sea.get('z:2');
  assert.ok(near?.boat, 'the near one built');
  assert.ok(off, 'the far one kept');
  assert.equal(off.boat, null, 'her hull waits');
  assert.deepEqual(h.pool.seaBoats, [near.boat], 'the pool walks the near one alone');
  // the eye comes to her
  standAt(h, far[0] - (PEER_HULL_NEAR_M - 200), far[2]);
  h.run(1);
  assert.ok(off.boat, 'built as she comes within reach');
  assert.equal(near.boat, null, 'the first one, now 90 km off, gave hers back');
  assert.deepEqual(h.pool.seaBoats, [off.boat]);
  // between the two edges: as it stands
  standAt(h, far[0] - (PEER_HULL_NEAR_M + PEER_HULL_FAR_M) / 2, far[2]);
  h.run(1);
  assert.ok(off.boat, 'kept between the edges');
  // past the far edge: back to the pool, her record still mine to hold
  standAt(h, far[0] - PEER_HULL_FAR_M - 200, far[2]);
  h.run(1);
  assert.equal(off.boat, null, 'let go past PEER_HULL_FAR_M');
  assert.ok(h.host._sea.get('z:2'), 'her record stays');
  assert.deepEqual(h.pool.seaBoats, []);
});
