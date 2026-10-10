// HOME-VOTE (2026-10-10, the owner: "I want to implement a house voting system within vicinity of player houses. If the
// house votes run negative, the exterior decorations/interior decorations should not be shown to other players"). A
// registered account a week old votes a home up or down - one vote a home, changed or taken back at will, never on its
// own home or a hall of its own guild (server-account/src/homeVotes.js, migration 0107; the law net/homeVoteLaw.js) -
// standing at the house: its door's plaque lists the votes, unlit where they are all it lists, and an Info press asks
// where no plaque is drawn (scenes/worldModes.js). The town's homes carry each one's score, kept on its row, and the
// reader's own vote (homes.js homesInTown), and a home whose votes run negative stands for everyone but its insiders as
// Daggerfall built it - no placed piece but its hired trader and nothing taken out inside (worldModes.js loadHomeDecor;
// the service hands out no more, decor.js decorOf), no yard (scenes/homeYards.js), the town's own paint (scenes/world.js
// lookOfHome; homesInTown says no look). AUDIT HOME-VOTE (A1-A6, B1-B7, D1-D14) pinned here too. Each pin failed on the
// build before it. tools/mutants/homevote.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  HOME_VOTE_UP, HOME_VOTE_DOWN, HOME_VOTES_MAX, HOME_VOTE_AGE_S, homeVoteOk, homeShunned, homeDecorShown, homeScoreText, homeVotesLine,
  homeVotedLine, HOME_SHUNNED_LINE, homeMyVoteOf, homeVoteRefusalLine, HOME_VOTE_GONE_LINE, homeShunnedInsiderLine, decorStaysShunned,
} from '../src/net/homeVoteLaw.js';
import { WITNESS } from '../src/net/nodeLaw.js';
import {
  createOnlineHomes, homeVotable, homeVoteRows, homeVoteOfVerb, homeVoteChoices, homeVoteLines, isHomeVoteVerb, HOME_VERB, HOME_VOTE_VERB,
} from '../src/systems/onlineHomes.js';
import { REFUSALS, accountHomes, SESSION_KEY } from '../src/net/accountClient.js';
import { standService, sessionStorageOf, T0 } from './accountDb.mjs';
import { yardWorld, yardPiece, live, settle } from './decorFakes.mjs';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const visitor = (over = {}) => ({ owner: 'Olga', own: false, mine: false, member: false, insider: false, hall: null, score: 0, myVote: 0, ...over });
const WEEK_AGO = T0 - HOME_VOTE_AGE_S - 1;

/** A stood service with Olga's home 300 in town 7, and accounts registered a week before T0 (AUDIT A1: the age bar). */
async function town(t) {
  t.mock.method(Date, 'now', () => T0 * 1000);
  const svc = await standService();
  const raw = svc.env.DB._raw;
  const aged = (who) => { raw.prepare('UPDATE players SET registered_at = ? WHERE id = ?').run(WEEK_AGO, who.id); return who; };
  const owner = aged(await svc.registered('Olga'));
  const home = await svc.seatHome(owner, { mapId: 7, buildingKey: 300, region: 17, price: 5000 });
  assert.equal(home.status, 200, JSON.stringify(home.body));
  const vote = (who, v, bk = 300) => svc.call('/v1/homes/vote', { mapId: 7, buildingKey: bk, vote: v }, who.secret);
  const read = async (who, bk = 300) => (await svc.call('/v1/homes/town', { mapId: 7 }, who.secret)).body.homes.find((h) => h.buildingKey === bk);
  const hall = (memberId, charId = 'c-member') => {
    raw.prepare('INSERT INTO guilds (id, name, name_key, tag, ranks, founded_at) VALUES (?, ?, ?, ?, ?, ?)').run('g1', 'The Hand', 'the hand', 'HND', '[]', T0);
    raw.prepare('INSERT INTO guild_members (player, char_id, guild_id, rank, name, joined_at) VALUES (?, ?, ?, ?, ?, ?)').run(memberId, charId, 'g1', 3, 'Cid', T0);
    raw.prepare('UPDATE homes SET guild_id = ? WHERE map_id = 7 AND building_key = 300').run('g1');
  };
  return { svc, raw, owner, ownerChar: home.character, aged, vote, read, hall };
}

test('HOME-VOTE the law: a vote is -1, +1 or 0 (taken back); a home is shunned below zero, never at it; its decor stands for its insiders (its owner\'s account, a hall\'s guild - the account\'s, AUDIT A5) whatever its score and for everyone else unless shunned; a shunned home\'s hired trader stands (AUDIT B2); the bars are 30 votes an hour and an account a week old (AUDIT A1); the words (mutants: zero shunned, the owner hidden, a member hidden, the kin hidden, a visitor shown, the trader hidden)', () => {
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
  assert.equal(homeDecorShown(visitor({ score: -4, hall: { name: 'The Hand' }, member: true })), true, 'a hall\'s member');
  assert.equal(homeDecorShown(visitor({ score: -4, hall: { name: 'The Hand' }, insider: true })), true, 'AUDIT A5: another character of a member\'s account');
  assert.equal(decorStaysShunned({ station: 'vendor' }), true, 'AUDIT B2: a shop');
  assert.equal(decorStaysShunned({ station: 'alchemy' }), false);
  assert.equal(decorStaysShunned({}), false);
  assert.equal(HOME_VOTES_MAX, 30, 'AUDIT A1');
  assert.equal(HOME_VOTE_AGE_S, WITNESS.ageS, 'AUDIT A1: a witness\'s bar, one home');
  assert.equal(HOME_VOTE_AGE_S, 7 * 86_400);
  assert.equal(homeMyVoteOf(-1), -1);
  assert.equal(homeMyVoteOf(5), 0);
  assert.equal(homeScoreText(3), '+3');
  assert.equal(homeScoreText(-2), '-2');
  assert.equal(homeVotesLine(-2, HOME_VOTE_DOWN), 'Votes: -2 - you voted down');
  assert.match(homeVotedLine(0, 1), /took your vote back/);
  // AUDIT D6: the words themselves
  assert.equal(REFUSALS['vote-own'], 'You cannot vote on your own home, or on the hall of your own guild.');
  assert.equal(REFUSALS['vote-rate'], 'You have voted on a great many homes this hour. Try again later.');
  assert.equal(REFUSALS['vote-young'], 'An account must be a week old to vote on homes.');
  assert.match(REFUSALS['bad-vote'], /could not read that vote/);
  assert.match(homeVoteRefusalLine('homes-need-account'), /^Voting on a home needs a username/, 'a guest is not told about owning a home');
  assert.equal(homeVoteRefusalLine('no-home'), HOME_VOTE_GONE_LINE, 'nor that it is not theirs any more');
  assert.equal(HOME_VOTE_GONE_LINE, 'Nobody owns that home any more.');
  assert.equal(homeVoteRefusalLine('vote-own'), null, 'the rest are the service\'s own words');
  assert.equal(homeShunnedInsiderLine(-2, true), 'Votes: -2 - your hall\'s decorations are hidden from other players.');
});

test('HOME-VOTE the door: a visitor reads two vote rows saying what each press does - the vote standing taken back by a row of its own (AUDIT B3), each row\'s verb the vote it sends; the Info box\'s choices are those rows; the score and one\'s own vote are said once there is either; the owner and a hall\'s guild read no rows, the owner told its score, and when shunned that its decor is hidden (mutants: the owner votes, a member votes, the kin votes, the take-back re-sent, a vote at zero unsaid, the owner told a zero)', () => {
  assert.equal(homeVotable(visitor()), true);
  assert.equal(homeVotable(visitor({ own: true, mine: true })), false);
  assert.equal(homeVotable(visitor({ mine: true })), false, 'the owner\'s other character');
  assert.equal(homeVotable(visitor({ hall: { name: 'The Hand' }, member: true })), false);
  assert.equal(homeVotable(visitor({ hall: { name: 'The Hand' }, insider: true })), false, 'AUDIT A5: the account\'s other character');
  assert.equal(homeVotable(visitor({ hall: { name: 'The Hand' } })), true, 'a stranger\'s hall');
  assert.equal(homeVotable(null), false);
  assert.deepEqual(homeVoteRows(visitor()).map((r) => [r.id, r.label]), [[HOME_VOTE_VERB.up, 'Vote up'], [HOME_VOTE_VERB.down, 'Vote down']]);
  assert.deepEqual(homeVoteRows(visitor({ myVote: 1 })).map((r) => [r.id, r.label]), [[HOME_VOTE_VERB.clear, 'Take back your vote up'], [HOME_VOTE_VERB.down, 'Vote down']]);
  assert.deepEqual(homeVoteRows(visitor({ myVote: -1 })).map((r) => r.id), [HOME_VOTE_VERB.up, HOME_VOTE_VERB.clear]);
  assert.deepEqual(homeVoteRows(visitor({ own: true, mine: true })), []);
  assert.deepEqual([HOME_VOTE_VERB.up, HOME_VOTE_VERB.down, HOME_VOTE_VERB.clear, HOME_VERB.enter].map(homeVoteOfVerb), [1, -1, 0, null], 'AUDIT B3: the row says the vote');
  assert.equal(isHomeVoteVerb(HOME_VOTE_VERB.clear), true);
  assert.equal(isHomeVoteVerb(HOME_VERB.enter), false);
  assert.deepEqual(homeVoteChoices(visitor({ myVote: 1 })), [
    { code: 'KeyU', label: 'U - Take back your vote up', vote: 0 }, { code: 'KeyD', label: 'D - Vote down', vote: -1 }]);
  assert.deepEqual(homeVoteChoices(visitor()).map((c) => c.vote), [1, -1], 'AUDIT D2: U is up');
  assert.deepEqual(homeVoteLines(visitor()), [], 'no votes, no line');
  assert.deepEqual(homeVoteLines(visitor({ score: -2, myVote: -1 })), ['Votes: -2 - you voted down', HOME_SHUNNED_LINE]);
  assert.deepEqual(homeVoteLines(visitor({ score: 0, myVote: 1 })), ['Votes: 0 - you voted up'], 'AUDIT D5: one\'s vote said where the score nets to zero');
  assert.deepEqual(homeVoteLines(visitor({ score: 2 })), ['Votes: +2']);
  assert.deepEqual(homeVoteLines(visitor({ own: true, mine: true, score: 2 })), ['Votes: +2'], 'the owner reads its score');
  assert.deepEqual(homeVoteLines(visitor({ own: true, mine: true })), [], 'AUDIT D5: and nothing where nobody voted');
  assert.equal(homeVoteLines(visitor({ own: true, mine: true, score: -1 }))[0], homeShunnedInsiderLine(-1, false));
  assert.equal(homeVoteLines(visitor({ hall: { name: 'H' }, member: true, score: -1 }))[0], homeShunnedInsiderLine(-1, true));
});

test('HOME-VOTE the service: an account a week old votes and the score is its votes summed, kept on the home\'s row - one a home (a second changes it), taken back by 0; never on its own home, never a guest\'s, never a home nobody holds (404 - AUDIT D7), never a word that is no vote; the town\'s homes carry the score and the reader\'s own vote (mutants: two votes an account, the owner votes, the score unsaid, the vote unsaid, the score unkept)', async (t) => {
  const { svc, raw, owner, aged, vote, read } = await town(t);
  const bob = aged(await svc.registered('Bob'));
  const cid = aged(await svc.registered('Cid'));
  const g = await svc.guest();
  assert.deepEqual((await vote(bob, -1)).body, { ok: true, mapId: 7, buildingKey: 300, vote: -1, score: -1 });
  assert.equal((await vote(bob, -1)).body.score, -1, 'the same vote again: still one');
  assert.equal((await vote(cid, 1)).body.score, 0);
  assert.equal((await vote(bob, 1)).body.score, 2, 'a change of mind');
  assert.equal((await vote(bob, 0)).body.score, 1, 'taken back');
  assert.equal((await vote(bob, 0)).status, 200, 'taking back none: answered');
  assert.deepEqual([(await vote(owner, -1)).status, (await vote(owner, -1)).body.error], [403, 'vote-own']);
  assert.equal((await vote(g, -1)).body.error, 'homes-need-account');
  const gone = await vote(bob, -1, 301);
  assert.deepEqual([gone.status, gone.body.error], [404, 'no-home']);
  for (const bad of [2, '1', null]) assert.equal((await vote(bob, bad)).body.error, 'bad-vote', String(bad));
  await vote(bob, -1);
  await vote(cid, -1);
  assert.equal(raw.prepare('SELECT score FROM homes WHERE map_id = 7 AND building_key = 300').get().score, -2, 'AUDIT A2: kept on its row');
  const seen = await read(bob);
  assert.equal(seen.score, -2);
  assert.equal(seen.vote, -1, 'the reader\'s own');
  const mine = await read(owner);
  assert.equal(mine.score, -2, 'the owner reads its score');
  assert.equal('vote' in mine, false);
  await vote(bob, 0); await vote(cid, 0);
  const none = await read(bob);
  assert.equal('score' in none || 'vote' in none, false, 'nothing said where there is nothing');
  assert.equal(raw.prepare('SELECT score FROM homes WHERE map_id = 7 AND building_key = 300').get().score, 0, 'the row kept in step');
});

test('HOME-VOTE AUDIT the service\'s bars: an account registered less than a week ago votes nothing (`vote-young`, 403) but may take back what it has (A1); a vote cast on a hall before its voter joined the guild is taken back after (A4); a hall\'s insider is the account - any character of it in the guild, said as `insider` on the hall\'s row - its votes refused (A5); 30 votes an hour then `vote-rate`; the votes go with the home (mutants: no age bar, the withdrawal guarded, no count, the votes kept)', async (t) => {
  const { svc, raw, vote, read, hall } = await town(t);
  const young = await svc.registered('Yan');
  const y = await vote(young, -1);
  assert.deepEqual([y.status, y.body.error], [403, 'vote-young']);
  assert.equal((await vote(young, 0)).status, 200, 'taking back is never barred');
  const c = await svc.registered('Cid');
  raw.prepare('UPDATE players SET registered_at = ? WHERE id = ?').run(WEEK_AGO, c.id);
  assert.equal((await vote(c, -1)).body.score, -1, 'an outsider\'s vote');
  hall(c.id);
  assert.equal((await vote(c, 1)).body.error, 'vote-own', 'a member votes nothing on its hall');
  const back = await vote(c, 0);
  assert.deepEqual([back.status, back.body.score], [200, 0], 'A4: but takes back what it cast before');
  const row = await read(c);
  assert.equal(row.insider, true, 'A5: the account has a character in the guild');
  const bob = await svc.registered('Bob');
  raw.prepare('UPDATE players SET registered_at = ? WHERE id = ?').run(WEEK_AGO, bob.id);
  assert.equal('insider' in (await read(bob)), false);
  for (let i = 0; i < HOME_VOTES_MAX; i++) assert.equal((await vote(bob, i % 2 ? 1 : -1)).status, 200, `vote ${i + 1}`);
  const over = await vote(bob, 1);
  assert.deepEqual([over.status, over.body.error], [429, 'vote-rate']);
  assert.equal(raw.prepare('SELECT COUNT(*) AS n FROM home_votes').get().n, 1);
  raw.prepare('DELETE FROM homes WHERE map_id = 7 AND building_key = 300').run();
  assert.equal(raw.prepare('SELECT COUNT(*) AS n FROM home_votes').get().n, 0, 'gone with the home');
});

test('HOME-VOTE AUDIT A3: the service hands a shunned home\'s room to anyone but its insiders as Daggerfall furnished it - no placed piece but its hired trader, nothing taken out - and says no look of it; its owner reads all of it (mutants: the room handed out, the trader withheld, the look said)', async (t) => {
  const { svc, raw, owner, ownerChar, aged, vote, read } = await town(t);
  const place = (id, over = {}) => raw.prepare(`INSERT INTO home_decor (map_id, building_key, id, model, flat_archive, flat_record, place, placed_at, paid, yard)
    VALUES (7, 300, ?, 41000, NULL, NULL, ?, ?, 0, 0)`).run(id, JSON.stringify({ pos: [1, 0, 1], rot: [0, 0, 0], scale: 1, light: null, storage: false, paid: 0, ...over }), T0);
  place('chair');
  place('trader', { station: 'vendor' });
  raw.prepare('INSERT INTO home_hidden (map_id, building_key, keys) VALUES (7, 300, ?)').run(JSON.stringify(['m0:41000']));
  raw.prepare('UPDATE homes SET look = ? WHERE map_id = 7 AND building_key = 300').run(JSON.stringify({ walls: { set: 'manor', climate: 'swamp' } }));
  const bob = aged(await svc.registered('Bob'));
  const room = async (who) => (await svc.call('/v1/homes/decor', { mapId: 7, buildingKey: 300 }, who.secret)).body;
  assert.equal((await room(bob)).pieces.length, 2, 'shown: all of it');
  assert.deepEqual((await read(bob)).look, { walls: { set: 'manor', climate: 'swamp' } }, 'and its paint');
  await vote(bob, -1);
  const bare = await room(bob);
  assert.deepEqual(bare.pieces.map((p) => p.id), ['trader'], 'shunned: its trader alone');
  assert.deepEqual(bare.hidden, [], 'nothing taken out');
  const kept = await room(owner);
  assert.deepEqual(kept.pieces.map((p) => p.id).sort(), ['chair', 'trader']);
  assert.deepEqual(kept.hidden, ['m0:41000']);
  assert.equal('look' in (await read(bob)), false, 'no paint said to a visitor');
  assert.deepEqual((await read(owner)).look, { walls: { set: 'manor', climate: 'swamp' } }, 'the owner\'s own read as ever');
  void ownerChar;
});

test('HOME-VOTE the registry over the real door (AUDIT D3, D8): the town read through accountHomes carries each home\'s score, the account\'s own vote and a hall\'s `insider`; a vote sent through accountHomes is shown at once, read back, and never told as a home of mine changed (LEGACY7\'s listener); a refusal - the account\'s own, or a home gone - asks the town again, and a vote on a home the town never heard of is read back (mutants: the route misnamed, the score unread, the vote unshown, the listener told, `no-home` never re-asked, the unknown home unread)', async (t) => {
  const { svc, raw, aged, read, hall } = await town(t);
  const bob = aged(await svc.registered('Bob'));
  const told = [];
  let asks = 0;
  const door = accountHomes({ fetch: (u, i) => { if (String(u).endsWith('/v1/homes/town')) asks++; return svc.fetch(u, i); }, storage: sessionStorageOf(SESSION_KEY, bob) });
  const homes = createOnlineHomes({ api: door, character: () => 'r-bob', onWrote: (...a) => told.push(a) });
  await homes.ensure(7);
  assert.equal(homes.homeAt(7, 300).score, 0);
  const v0 = homes.version();
  const r = await homes.vote(7, 300, -1);
  assert.deepEqual(r, { ok: true, vote: -1, score: -1 }, 'through the real route');
  assert.equal(homes.homeAt(7, 300).score, -1, 'shown at once');
  assert.equal(homes.homeAt(7, 300).myVote, -1);
  assert.equal(homeDecorShown(homes.homeAt(7, 300)), false, 'shunned, to this reader');
  assert.ok(homes.version() > v0, 'the doors read again');
  assert.deepEqual(told, [], 'no home of mine');
  await settle(); await settle();
  assert.equal((await read(bob)).vote, -1);
  await homes.ensure(7, { force: true });
  assert.deepEqual([homes.homeAt(7, 300).score, homes.homeAt(7, 300).myVote], [-1, -1], 'read back off the town\'s own answer');
  // a refusal re-asks: a home gone, and the account's own
  let before = asks;
  assert.deepEqual(await homes.vote(7, 301, -1), { ok: false, error: 'no-home' });
  await settle(); await settle();
  assert.ok(asks > before, '`no-home`: the town asked again');
  hall(bob.id, 'c-other');   // AUDIT D8: the account's other character is in the hall's guild
  await homes.ensure(7, { force: true });
  await settle();
  assert.equal(homes.homeAt(7, 300).insider, true, 'the hall says so');
  assert.equal(homeVotable(homes.homeAt(7, 300)), false, 'so no rows are offered...');
  assert.equal(homeDecorShown(homes.homeAt(7, 300)), true, '...and its decor stands');
  before = asks;
  assert.deepEqual(await homes.vote(7, 300, 1), { ok: false, error: 'vote-own' });
  await settle(); await settle();
  assert.ok(asks > before, '`vote-own`: asked again');
  // a vote on a home this page never read: the town is asked
  const fresh = createOnlineHomes({ api: door, character: () => 'r-bob' });
  before = asks;
  await fresh.vote(7, 300, 0);
  await settle(); await settle();
  assert.ok(asks > before, 'an unknown home: the town read');
  void raw;
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

test('HOME-VOTE the hosts by source: the interior stands a shunned home bare but its trader, nothing taken out; the world paints a shunned home in its town\'s own look and keeps it in the merge; the door lists the votes unlit where they are all it lists and still says "Locked"; a vote row presses the vote it says, before the lock, and a home gone is said so (AUDIT B3, B5); the Info box asks only where no plaque is drawn (B1), says the lock, and carries the door\'s rows; presses keep their order (mutants: the room stood, the look painted, the rows lit, the vote inverted, the press after the lock, the box over a drawn plaque, the order dropped, the way in dropped)', () => {
  const m = src('src/scenes/worldModes.js');
  assert.match(m, /const shown = homeDecorShown\(interiorHome\);\n\s*const pieces = r\.data\.pieces\.map\(decorPieceOf\)\.filter\(\(p\) => p && \(shown \|\| decorStaysShunned\(p\)\)\);/);
  assert.match(m, /if \(!shown\) \{ interiorCtx\?\.base\?\.setHidden\(\[\]\); return; \}   \/\/ HOME-VOTE: the room as Daggerfall furnished it\n\s*interiorCtx\?\.base\?\.setHidden\(Array\.isArray\(r\.data\.hidden\)/);
  assert.match(m, /const rows = \[\.\.\.\(homeVisitorRows\(home, homeDoorFor\(bd, home\)\) \?\? \[\]\), \.\.\.homeVoteRows\(home\)\];/);
  assert.match(m, /_doorText = homeVoteDoorText\(_doorText, bd, home, verbs\);[^\n]*\n\s*if \(verbs\) _doorText = \{ \.\.\._doorText, actions: verbs \};/);
  assert.match(m, /const voteOnly = isHomeVoteVerb\(verbs\?\.\[0\]\?\.id\);/, 'AUDIT D1: unlit when the first row is a vote\'s');
  assert.match(m, /const lines = \[\.\.\.\(voteOnly && homeDoorFor\(bd, home\) === 'locked' \? \['Locked'\] : \[\]\), \.\.\.homeVoteLines\(home\)\];/);
  assert.match(m, /return voteOnly \? \{ \.\.\.said, actionsUnlit: true \} : said;/);
  assert.match(m, /if \(isHomeVoteVerb\(verb\)\) \{ if \(homeVotable\(home\)\) pressHomeVote\(bd, homeVoteOfVerb\(verb\)\); else if \(!home\) townTalk\?\.say\?\.\(HOME_VOTE_GONE_LINE\); return true; \}/);
  const press = m.indexOf('if (isHomeVoteVerb(verb)) {');
  const lock = m.indexOf("if (door === 'locked') { townTalk?.say?.(homeLockedLine(home)); return true; }");
  assert.ok(press > 0 && lock > press, 'a vote is pressed before the lock answers');
  assert.equal(m.slice(m.lastIndexOf('\n', press - 200), press).includes('if (!isBash && !homeAsked && getInteractionMode() !== \'steal\') {'), true, 'AUDIT B5: whether or not a home stands');
  assert.match(m, /if \(verb == null && getInteractionMode\(\) === 'info' && homeVotable\(home\) && !plaqueListing\(\)\) \{ openHomeVoteMenu\(bd, home, door, door === 'enter' \? homeOnward\(hit, entries\) : null\); return true; \}/);
  assert.match(m, /lines: \[homeDoorTitle\(home\), \.\.\.\(door === 'locked' \? \[homeLockedLine\(home\)\] : \[\]\),/);
  assert.match(m, /\.\.\.homeVoteChoices\(home\)\.map\(\(c\) => \(\{ code: c\.code, label: c\.label, action: \(\) => pressHomeVote\(bd, c\.vote\) \}\)\),/);
  assert.match(m, /_homeVoting = _homeVoting\.then\(async \(\) => \{\n\s*if \(!homeVotable\(homeOf\(bd\)\)\) return;\n\s*const r = await host\.onlineHomes\.vote\(homeTownOf\(bd\), bd\.buildingKey, vote\);/);
  assert.match(m, /townTalk\?\.say\?\.\(r\.ok \? homeVotedLine\(r\.vote, r\.score\) : homeVoteRefusalLine\(r\.error\) \?\? accountRefusalText\(r\.error\)\);/, 'AUDIT D6: the vote\'s own words first');
  assert.match(src('src/systems/quickLoot.js'), /export const plaqueListing = \(\) => !!\(_actionIds && _actionIds\.length && _sel\);/);
  const w = src('src/scenes/world.js');
  assert.match(w, /: homeDecorShown\(row\) \? row\?\.look \?\? null : null\);/);
  assert.match(w, /\(\(row\?\.look && homeDecorShown\(row\)\) \|\| row\?\.mine \|\| row\?\.keeper\)\) merged = true;/);
});
