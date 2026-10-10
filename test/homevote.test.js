// HOME-VOTE (2026-10-10, the owner: "I want to implement a house voting system within vicinity of player houses. If the
// house votes run negative, the exterior decorations/interior decorations should not be shown to other players"). A
// registered account votes a home up or down - one vote a home, changed or taken back at will, never on its own home or a
// hall of its own guild (server-account/src/homeVotes.js, migration 0107; the law net/homeVoteLaw.js) - standing at the
// house: its door's plaque lists the votes, unlit, under whatever else it does, and an Info press asks where no plaque is
// drawn (scenes/worldModes.js). The town's homes carry each one's score and the reader's own vote (homes.js homesInTown),
// and a home whose votes run negative stands for everyone but its insiders as Daggerfall built it: no placed piece and
// nothing taken out inside (worldModes.js loadHomeDecor), no yard (scenes/homeYards.js), the town's own paint
// (scenes/world.js lookOfHome). Each pin failed on the build before it. tools/mutants/homevote.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  HOME_VOTE_UP, HOME_VOTE_DOWN, HOME_VOTES_MAX, homeVoteOk, homeShunned, homeDecorShown, homeScoreText, homeVotesLine, homeVotedLine,
  HOME_SHUNNED_LINE, homeMyVoteOf, homeVoteRefusalLine,
} from '../src/net/homeVoteLaw.js';
import { createOnlineHomes, homeVotable, homeVoteRows, homeVoteOfPress, homeVoteLines, isHomeVoteVerb, HOME_VERB, HOME_VOTE_VERB } from '../src/systems/onlineHomes.js';
import { REFUSALS } from '../src/net/accountClient.js';
import { standService, T0 } from './accountDb.mjs';
import { yardWorld, yardPiece, live, settle } from './decorFakes.mjs';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const visitor = (over = {}) => ({ owner: 'Olga', own: false, mine: false, member: false, hall: null, score: 0, myVote: 0, ...over });

test('HOME-VOTE the law: a vote is -1, +1 or 0 (taken back); a home is shunned below zero, never at it; its decor stands for its insiders (its owner\'s account, a hall\'s members) whatever its score and for everyone else unless shunned (mutants: zero shunned, the owner hidden, a member hidden, a visitor shown)', () => {
  for (const v of [HOME_VOTE_UP, HOME_VOTE_DOWN, 0]) assert.equal(homeVoteOk(v), true, String(v));
  for (const v of [2, -2, 0.5, '1', null, undefined]) assert.equal(homeVoteOk(v), false, String(v));
  assert.equal(homeShunned(-1), true);
  assert.equal(homeShunned(0), false, 'none, or as many up as down: shown');
  assert.equal(homeShunned(3), false);
  assert.equal(homeShunned('x'), false, 'no number: none');
  assert.equal(homeDecorShown(null), true, 'not an online home');
  assert.equal(homeDecorShown(visitor()), true);
  assert.equal(homeDecorShown(visitor({ score: -1 })), false, 'shunned, to a visitor');
  assert.equal(homeDecorShown(visitor({ score: -4, mine: true, own: true })), true, 'the owner always');
  assert.equal(homeDecorShown(visitor({ score: -4, mine: true })), true, 'the owner\'s other characters too');
  assert.equal(homeDecorShown(visitor({ score: -4, hall: { name: 'The Hand' }, member: true })), true, 'a hall\'s members');
  assert.equal(homeMyVoteOf(-1), -1);
  assert.equal(homeMyVoteOf(5), 0);
  assert.equal(homeScoreText(3), '+3');
  assert.equal(homeScoreText(-2), '-2');
  assert.equal(homeVotesLine(-2, HOME_VOTE_DOWN), 'Votes: -2 - you voted down');
  assert.match(homeVotedLine(0, 1), /took your vote back/);
  assert.equal(REFUSALS['vote-own'].length > 0 && REFUSALS['vote-rate'].length > 0 && REFUSALS['bad-vote'].length > 0, true, 'the service\'s words, said');
  assert.match(homeVoteRefusalLine('homes-need-account'), /^Voting on a home needs a username/, 'a guest is not told about owning a home');
  assert.equal(homeVoteRefusalLine('no-home'), 'Nobody owns that home any more.', 'nor that it is not theirs any more');
  assert.equal(homeVoteRefusalLine('vote-own'), null, 'the rest are the service\'s own words');
});

test('HOME-VOTE the door: a visitor reads two vote rows saying what each press does - a row pressed on its own vote takes it back - and the score and its own vote; the owner and a hall\'s member read none, the owner told when its decorations are hidden (mutants: the owner votes, a member votes, the take-back never sent)', () => {
  assert.equal(homeVotable(visitor()), true);
  assert.equal(homeVotable(visitor({ own: true, mine: true })), false);
  assert.equal(homeVotable(visitor({ mine: true })), false, 'the owner\'s other character');
  assert.equal(homeVotable(visitor({ hall: { name: 'The Hand' }, member: true })), false);
  assert.equal(homeVotable(visitor({ hall: { name: 'The Hand' } })), true, 'a stranger\'s hall');
  assert.equal(homeVotable(null), false);
  assert.deepEqual(homeVoteRows(visitor()).map((r) => [r.id, r.label]), [[HOME_VOTE_VERB.up, 'Vote up'], [HOME_VOTE_VERB.down, 'Vote down']]);
  assert.deepEqual(homeVoteRows(visitor({ myVote: 1 })).map((r) => r.label), ['Take back your vote up', 'Vote down']);
  assert.deepEqual(homeVoteRows(visitor({ own: true, mine: true })), []);
  assert.equal(homeVoteOfPress(visitor(), true), 1);
  assert.equal(homeVoteOfPress(visitor({ myVote: 1 }), true), 0, 'up again: taken back');
  assert.equal(homeVoteOfPress(visitor({ myVote: 1 }), false), -1, 'down: changed');
  assert.equal(homeVoteOfPress(visitor({ myVote: -1 }), false), 0);
  assert.equal(isHomeVoteVerb(HOME_VOTE_VERB.down), true);
  assert.equal(isHomeVoteVerb(HOME_VERB.enter), false);
  assert.deepEqual(homeVoteLines(visitor()), [], 'no votes, no line');
  assert.deepEqual(homeVoteLines(visitor({ score: -2, myVote: -1 })), ['Votes: -2 - you voted down', HOME_SHUNNED_LINE]);
  assert.deepEqual(homeVoteLines(visitor({ score: 2 })), ['Votes: +2']);
  assert.deepEqual(homeVoteLines(visitor({ own: true, mine: true, score: 2 })), ['Votes: +2'], 'the owner reads its score');
  assert.match(homeVoteLines(visitor({ own: true, mine: true, score: -1 }))[0], /your home's decorations are hidden from other players/);
  assert.match(homeVoteLines(visitor({ hall: { name: 'H' }, member: true, score: -1 }))[0], /your hall's decorations are hidden/);
});

test('HOME-VOTE the service: a registered account\'s vote lands and the score is its votes summed - one a home (a second changes it), taken back by 0; never on its own home or a hall of its own guild, never a guest\'s, never a home nobody holds, never a word that is no vote; the town\'s homes carry the score and the reader\'s own vote (mutants: two votes an account, the owner votes, a member votes, the score unsaid, the vote unsaid)', async (t) => {
  t.mock.method(Date, 'now', () => T0 * 1000);
  const svc = await standService();
  const owner = await svc.registered('Olga');
  assert.equal((await svc.seatHome(owner, { mapId: 7, buildingKey: 300, region: 17, price: 5000 })).status, 200);
  const bob = await svc.registered('Bob');
  const cid = await svc.registered('Cid');
  const g = await svc.guest();
  const vote = (who, v, bk = 300) => svc.call('/v1/homes/vote', { mapId: 7, buildingKey: bk, vote: v }, who.secret);
  const town = async (who) => (await svc.call('/v1/homes/town', { mapId: 7 }, who.secret)).body.homes.find((h) => h.buildingKey === 300);
  assert.deepEqual((await vote(bob, -1)).body, { ok: true, mapId: 7, buildingKey: 300, vote: -1, score: -1 });
  assert.equal((await vote(bob, -1)).body.score, -1, 'the same vote again: still one');
  assert.equal((await vote(cid, 1)).body.score, 0);
  assert.equal((await vote(bob, 1)).body.score, 2, 'a change of mind');
  assert.equal((await vote(bob, 0)).body.score, 1, 'taken back');
  assert.equal((await vote(bob, 0)).status, 200, 'taking back none: answered');
  assert.deepEqual([(await vote(owner, -1)).status, (await vote(owner, -1)).body.error], [403, 'vote-own']);
  assert.equal((await vote(g, -1)).body.error, 'homes-need-account');
  assert.equal((await vote(bob, -1, 301)).body.error, 'no-home');
  for (const bad of [2, '1', null]) assert.equal((await vote(bob, bad)).body.error, 'bad-vote', String(bad));
  await vote(bob, -1);
  await vote(cid, -1);
  const seen = await town(bob);
  assert.equal(seen.score, -2);
  assert.equal(seen.vote, -1, 'the reader\'s own');
  const mine = await town(owner);
  assert.equal(mine.score, -2, 'the owner reads its score');
  assert.equal('vote' in mine, false);
  await vote(bob, 0); await vote(cid, 0);
  const none = await town(bob);
  assert.equal('score' in none || 'vote' in none, false, 'nothing said where there is nothing');
  // a guild's hall: never voted by its members' accounts
  const raw = svc.env.DB._raw;
  raw.prepare('INSERT INTO guilds (id, name, name_key, tag, ranks, founded_at) VALUES (?, ?, ?, ?, ?, ?)').run('g1', 'The Hand', 'the hand', 'HND', '[]', T0);
  raw.prepare('INSERT INTO guild_members (player, char_id, guild_id, rank, name, joined_at) VALUES (?, ?, ?, ?, ?, ?)').run(cid.id, 'c-cid', 'g1', 3, 'Cid', T0);
  raw.prepare('UPDATE homes SET guild_id = ? WHERE map_id = 7 AND building_key = 300').run('g1');
  assert.equal((await vote(cid, -1)).body.error, 'vote-own', 'a member\'s account');
  assert.equal((await vote(owner, -1)).status, 200, 'the buyer, no member of it');
  assert.equal((await svc.call('/v1/homes/town', { mapId: 7 }, bob.secret)).body.homes[0].score, -1, 'a hall\'s score, said');
});

test('HOME-VOTE the service\'s bounds: an account\'s votes are counted an hour (HOME_VOTES_MAX, then `vote-rate`), and a home\'s votes go with it - a new owner starts from none (mutants: no count, the votes kept)', async (t) => {
  t.mock.method(Date, 'now', () => T0 * 1000);
  const svc = await standService();
  const owner = await svc.registered('Olga');
  await svc.seatHome(owner, { mapId: 7, buildingKey: 300, region: 17, price: 5000 });
  const bob = await svc.registered('Bob');
  const vote = (v) => svc.call('/v1/homes/vote', { mapId: 7, buildingKey: 300, vote: v }, bob.secret);
  for (let i = 0; i < HOME_VOTES_MAX; i++) assert.equal((await vote(i % 2 ? 1 : -1)).status, 200, `vote ${i + 1}`);
  const over = await vote(1);
  assert.deepEqual([over.status, over.body.error], [429, 'vote-rate']);
  const raw = svc.env.DB._raw;
  assert.equal(raw.prepare('SELECT COUNT(*) AS n FROM home_votes').get().n, 1);
  raw.prepare('DELETE FROM homes WHERE map_id = 7 AND building_key = 300').run();
  assert.equal(raw.prepare('SELECT COUNT(*) AS n FROM home_votes').get().n, 0, 'gone with the home');
});

test('HOME-VOTE the registry: a town\'s answer carries each home\'s score and the account\'s own vote; a vote cast is shown at once, read back, and never told as a home of mine changed (LEGACY7\'s listener); a refusal asks the town again (mutants: the score unread, the vote unshown, the listener told)', async () => {
  const told = [];
  let asks = 0;
  const sent = [];
  const api = {
    town: async () => { asks++; return { ok: true, data: { homes: [{ buildingKey: 300, owner: 'Olga', entry: 'private', mine: false, score: -1, vote: -1 }] } }; },
    vote: async (b) => { sent.push(b); return b.buildingKey === 300 ? { ok: true, data: { vote: b.vote, score: b.vote === 1 ? 1 : 0 } } : { ok: false, error: 'vote-own' }; },
  };
  const homes = createOnlineHomes({ api, character: () => 'r1', onWrote: (...a) => told.push(a) });
  await homes.ensure(7);
  const row = homes.homeAt(7, 300);
  assert.equal(row.score, -1);
  assert.equal(row.myVote, -1);
  assert.equal(homeDecorShown(row), false, 'shunned, to this reader');
  const v0 = homes.version();
  const r = await homes.vote(7, 300, 1);
  assert.deepEqual(r, { ok: true, vote: 1, score: 1 });
  assert.deepEqual(sent[0], { mapId: 7, buildingKey: 300, vote: 1 });
  assert.equal(homes.homeAt(7, 300).score, 1, 'shown at once');
  assert.equal(homes.homeAt(7, 300).myVote, 1);
  assert.ok(homes.version() > v0, 'the doors read again');
  assert.deepEqual(told, [], 'no home of mine');
  await settle();
  const before = asks;
  const no = await homes.vote(7, 999, -1);
  assert.deepEqual(no, { ok: false, error: 'vote-own' });
  await settle();
  assert.ok(asks > before, 'the town asked again');
});

test('HOME-VOTE the yard: a home voted below zero stands no yard for a visitor - its pieces taken down - and stands them again once its votes climb; its owner\'s yard stands whatever its score (mutants: the yard unasked)', async () => {
  const home = { score: -1 };
  const w = yardWorld({ pieces: [yardPiece({ flat: [209, 0], scale: 1 })], home });
  await w.run();
  assert.equal(live(w.made).length, 0, 'shunned: nothing stands');
  home.score = 2;
  await w.run(3);
  w.clock.t += 120_000;
  await w.run(3);
  assert.equal(live(w.made).length, 1, 'voted up again: it stands');
  const mine = yardWorld({ pieces: [yardPiece({ flat: [209, 0], scale: 1 })], own: true, home: { score: -3, mine: true } });
  await mine.run();
  assert.equal(live(mine.made).filter((b) => b.a === 209).length, 1, 'its owner sees it');
});

test('HOME-VOTE the hosts: the interior stands a shunned home as Daggerfall furnished it for anyone but its insiders - no placed piece, nothing taken out; the world paints a shunned home in its town\'s own look and keeps it in the merge; the door lists the votes under its rows, unlit where they are all it lists, says "Locked" still, presses them before its lock, and asks in Info where no plaque is drawn (mutants: the room stood, the look painted, the votes pressed after the lock)', () => {
  const m = src('src/scenes/worldModes.js');
  assert.match(m, /const shown = homeDecorShown\(interiorHome\);\n\s*const pieces = shown \? r\.data\.pieces\.map\(decorPieceOf\)\.filter\(Boolean\) : \[\];/);
  assert.match(m, /if \(!shown\) \{ interiorCtx\?\.base\?\.setHidden\(\[\]\); return; \}   \/\/ HOME-VOTE: the room as Daggerfall furnished it\n\s*interiorCtx\?\.base\?\.setHidden\(Array\.isArray\(r\.data\.hidden\)/);
  assert.match(m, /const rows = \[\.\.\.\(homeVisitorRows\(home, homeDoorFor\(bd, home\)\) \?\? \[\]\), \.\.\.homeVoteRows\(home\)\];/);
  assert.match(m, /_doorText = homeVoteDoorText\(_doorText, bd, home, verbs\);[^\n]*\n\s*if \(verbs\) _doorText = \{ \.\.\._doorText, actions: verbs \};/);
  assert.match(m, /const lines = \[\.\.\.\(voteOnly && homeDoorFor\(bd, home\) === 'locked' \? \['Locked'\] : \[\]\), \.\.\.homeVoteLines\(home\)\];/);
  assert.match(m, /return voteOnly \? \{ \.\.\.said, actionsUnlit: true \} : said;/);
  const press = m.indexOf('if (isHomeVoteVerb(verb)) {');
  const lock = m.indexOf("if (door === 'locked') { townTalk?.say?.(homeLockedLine(home)); return true; }");
  assert.ok(press > 0 && lock > press, 'a vote is pressed before the lock answers');
  assert.match(m, /if \(verb == null && getInteractionMode\(\) === 'info' && homeVotable\(home\)\) \{ openHomeVoteMenu\(/);
  const w = src('src/scenes/world.js');
  assert.match(w, /: homeDecorShown\(row\) \? row\?\.look \?\? null : null\);/);
  assert.match(w, /\(\(row\?\.look && homeDecorShown\(row\)\) \|\| row\?\.mine \|\| row\?\.keeper\)\) merged = true;/);
});
