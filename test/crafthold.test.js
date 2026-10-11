// CRAFT-HOLD (2026-10-11, the exploit audit the owner asked for: "Can we look deep for duping"). INT3 holds a realm
// character's trade (copies found, a breach) - and its crafted pieces were listed, auctioned, handed to a commission's
// poster and disenchanted under ANY other character id: realmHoldOf asks the acting character alone and answers null for
// an id that is no realm id, while a crafted piece is the account's (`products.owner`). And a commission filled asked
// no hold at all. The hold now follows the piece (realm.js craftHoldOf: the realm character its maker's record names).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { standService, T0 } from './accountDb.mjs';
import { seatRealm } from './realmSeat.mjs';

let _now = T0;
const realNow = Date.now;
Date.now = () => _now * 1000;
test.after(() => { Date.now = realNow; });
let _rid = 0;
const rid = () => `chold-${String(++_rid).padStart(6, '0')}`;
const DF = 17, HUBS = { [DF]: [207, 212] };
const P = (n) => n.toString(16).padStart(16, '0');

async function stand() {
  const s = await standService({ PROFESSIONS_OPEN: 'on', MARKS_OPEN: 'on', BOARD_OPEN: 'on' });
  const raw = s.env.DB._raw;
  const eve = await s.registered('Eve');
  const E = await seatRealm(s.env, eve.secret, 'Eve', { name: 'Eve', level: 5, items: [], goldPieces: 0 });
  s.seedMarks(eve, 10_000);
  /** A piece Eve's realm character made (its maker's record names it), as the anvil writes one. */
  const piece = (provenance, { recipe = 'longsword:mithril', quality = 2 } = {}) => {
    raw.prepare(`INSERT INTO products (provenance, owner, char_id, maker, recipe, template, material, quality, seed, record, made_at, credited)
      VALUES (?, ?, ?, 'Eve', ?, 120, 5, ?, 4242, 'p1.x', ?, 1)`).run(provenance, eve.id, E.id, recipe, quality, _now);
    raw.prepare(`INSERT INTO prof_crafts (player, rid, char_id, recipe, quality, count, provenance, seed, xp, first, at, n)
      VALUES (?, ?, ?, ?, ?, 1, ?, 4242, 10, 0, ?, 'n')`).run(eve.id, `craft-${provenance}`, E.id, recipe, quality, provenance, _now);
  };
  const hold = (why) => raw.prepare('UPDATE realm_characters SET held = ? WHERE id = ?').run(why, E.id);
  return { s, raw, eve, E, piece, hold };
}

test('CRAFT-HOLD a held realm character\'s crafted piece lists and auctions under no other character\'s name - and lists again once the hold is lifted (mutants: the list route asks the acting character alone; the auction route too)', async () => {
  const { s, eve, E, piece, hold } = await stand();
  piece(P(0xa1));
  piece(P(0xa2), { quality: 4 });
  hold('dupe');
  const list = (character, provenance, currency = 'marks') => s.call('/v1/market/list', { character, region: DF, kind: 'piece', provenance, wear: 1000, price: 500, hubs: HUBS, rid: rid(), currency }, eve.secret);
  const auction = (character, provenance) => s.call('/v1/market/auction', { character, region: DF, provenance, wear: 1000, opening: 500, hubs: HUBS, rid: rid() }, eve.secret);
  for (const r of [await list(E.id, P(0xa1), 'gold'), await list('char-anything', P(0xa1)), await auction('char-anything', P(0xa2))]) {
    assert.equal(r.status, 409);
    assert.equal(r.body.error, 'trade-held', 'held, whatever character the act names');
  }
  hold(null);
  const open = await list('char-anything', P(0xa1));
  assert.equal(open.status, 200, 'the hold lifted, it lists as before');
  assert.equal(open.body.listing.state, 'open');
});

test('CRAFT-HOLD a commission is filled with no held character\'s craft - the route asked no hold at all (mutants: the fill route unheld)', async () => {
  const { s, eve, E, piece, hold } = await stand();
  const tom = await s.registered('Tom');
  s.seedMarks(tom, 10_000);
  piece(P(0xb1));
  const posted = await s.call('/v1/writs/commission', { character: tom.character, region: DF, crafter: 'Eve', recipe: 'longsword:mithril', quality: 2, pay: 900, rid: rid() }, tom.secret);
  assert.equal(posted.status, 200, JSON.stringify(posted.body));
  const id = posted.body.commission.id;
  const fulfil = (character) => s.call('/v1/writs/fulfil', { character, region: DF, commission: id, provenance: P(0xb1), wear: 1000, rid: rid() }, eve.secret);
  hold('dupe');
  for (const character of [E.id, 'char-anything']) {
    const r = await fulfil(character);
    assert.equal(r.status, 409, `${character}: ${JSON.stringify(r.body)}`);
    assert.equal(r.body.error, 'trade-held');
  }
  hold(null);
  assert.equal((await fulfil('char-anything')).status, 200, 'the hold lifted, the commission is filled');
});

test('CRAFT-HOLD a held character\'s craft is disenchanted to the Stores under no other character\'s name (mutants: the disenchant route unheld)', async () => {
  const { s, eve, piece, hold } = await stand();
  piece(P(0xc1));
  hold('dupe');
  const r = await s.call('/v1/prof/disenchant', { character: 'char-anything', provenance: P(0xc1), rid: rid() }, eve.secret);
  assert.equal(r.status, 409, JSON.stringify(r.body));
  assert.equal(r.body.error, 'trade-held');
});
