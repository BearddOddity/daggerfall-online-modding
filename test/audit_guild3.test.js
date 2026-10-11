// @ts-nocheck
// AUDIT GUILD3 (2026-10-11, the owner: "Do a comprehensive audit and ensure absolute perfection") - THE GUILDS MADE
// PLAIN, AUDITED: six lanes read GUILD3 (bible/11-Multiplayer/Guilds-Made-Plain.md) cold on a frozen snapshot (a55a74c1b)
// - the service, the Chapters' law, the client, the words, the pins, the record - and each finding is pinned here under
// its id. The record: bible/01-Overview/Audit-Guild3.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { guildSilverLineText, GUILD_SILVER_LINE_WORDS, GUILD_SILVER_MEMBER_KINDS, GUILD_KEEPS_WORDS, GUILD_HOLD_CODES } from '../src/ui/socialPanel.js';
import { GUILD_HOLDS_SQL } from '../server-account/src/guilds.js';
import { rankLinesOf } from '../src/net/guildPowers.js';
import { MARKS_MAX } from '../src/net/marksLaw.js';
import {
  meritWeekOf, strengthSeasonEnd, failingWeekAfter, CHAPTER_FAILING_FALL, CHAPTER_FAILING_MEETS, chapterBandEffectsLine, chapterDutiesLine, meritEarnsOf,
  chapterRollLines,
} from '../src/net/npcChapterLaw.js';
import { seatWeekStartMs } from '../src/net/townSeatLaw.js';
import { settleChapterWeek, CHAPTER_TURNING_GRACE_S } from '../server-account/src/npcChapters.js';
import { standService, T0, confirmChapters } from './accountDb.mjs';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/** A service with a guild founded, its silver open. */
async function guildService(extra = {}) {
  const s = await standService({ MARKS_OPEN: 'on', ...extra });
  const raw = s.env.DB._raw;
  const gm = await s.registered('Aldric', { renown: 10 });
  const found = await s.found(gm, { name: 'The Iron Oath', tag: 'IRON' });
  assert.equal(found.status, 200, JSON.stringify(found.body));
  return { ...s, raw, gm, gid: found.body.guild.id };
}
const keepsOf = async (s) => (await s.call('/v1/guilds/mine', { character: s.gm.character }, s.gm.secret)).body.guild.keeps;

test('AUDIT GUILD3 W1: an OPEN writ or contract holds its pay in escrow by right - the list names it "guild-writs"/"guild-contracts" alone, never also a closed one\'s pay waiting on a full treasury; a CLOSED one whose pay has not come home is that (mutants: either escrow read open again)', async () => {
  const s = await guildService();
  const writ = (id, state, returned) => s.raw.prepare(`INSERT INTO guild_writs (id, guild_id, poster, poster_char, officer, week, region, material, units, left_units, pay, escrow, at, expires_at, state, returned, rid, n)
    VALUES (?, ?, NULL, 'c', 0, 1, 21, 'iron', 10, 10, 5, 50, ?, ?, ?, ?, ?, 'n')`).run(id, s.gid, T0, T0 + 86_400, state, returned, `rid-${id}`);
  const contract = (id, state, returned) => s.raw.prepare(`INSERT INTO guild_contracts (id, guild_id, poster, poster_char, officer, week, region, kind, deeds, left_deeds, pay, escrow, at, expires_at, state, returned, rid, n)
    VALUES (?, ?, NULL, 'c', 0, 1, 21, 'raid', 10, 10, 5, 50, ?, ?, ?, ?, ?, 'n')`).run(id, s.gid, T0, T0 + 86_400, state, returned, `rid-${id}`);
  writ('w-open', 'open', 0);
  assert.deepEqual(await keepsOf(s), ['guild-writs'], 'one open writ: its writ, and no treasury said full');
  s.raw.prepare('DELETE FROM guild_writs').run();
  contract('c-open', 'open', 0);
  assert.deepEqual(await keepsOf(s), ['guild-contracts'], 'one open contract the same');
  s.raw.prepare('DELETE FROM guild_contracts').run();
  writ('w-closed', 'expired', 0);
  assert.deepEqual(await keepsOf(s), ['guild-writ-escrow'], 'a closed writ\'s pay not yet home');
  s.raw.prepare('DELETE FROM guild_writs').run();
  contract('c-closed', 'withdrawn', 0);
  assert.deepEqual(await keepsOf(s), ['guild-writ-escrow'], 'a closed contract\'s the same');
  s.raw.prepare("UPDATE guild_contracts SET returned = 1").run();
  assert.deepEqual(await keepsOf(s), [], 'come home: nothing');
});

test('AUDIT GUILD3 W2: a silver line the SERVICE made is the guild\'s - its `who` is a label (\'A Sellsword\', \'The Turning\', \'The registry\', a writ\'s material, an auction\'s id, a work\'s name), never the sentence\'s subject; a member\'s own act (a deposit, a withdrawal, the arms, a deed, a contract put up, a Tribute, a patron\'s bid) says its name (mutants: the member kinds, the subject)', () => {
  assert.deepEqual([...GUILD_SILVER_MEMBER_KINDS].sort(), ['contract-escrow', 'guild-deed', 'guild-deposit', 'guild-withdraw', 'heraldry', 'patron-escrow', 'tribute']);
  const labels = { 'sellsword-escrow': 'A Sellsword', 'seat-claim': 'The Turning', 'seat-strike-refund': 'The registry', 'writ-escrow': 'iron', tithe: 'auction:9f', fort: 'Palisade', 'royal-escrow': 'The Tourney' };
  for (const [raw, who] of Object.entries(labels)) {
    const t = guildSilverLineText({ who, raw, out: raw !== 'tithe' && raw !== 'seat-strike-refund', amount: 100 });
    assert.match(t, /^The guild /, raw);
    assert.ok(!t.includes(who), `${raw}: its label is no one`);
  }
  assert.equal(guildSilverLineText({ who: 'A Sellsword', raw: 'sellsword-escrow', out: true, amount: 1500 }), 'The guild hired a Sellsword for 1,500 silver');
  assert.equal(guildSilverLineText({ who: 'iron', raw: 'writ-escrow', out: true, amount: 50 }), 'The guild set aside a guild writ\'s pay of 50 silver');
  for (const raw of GUILD_SILVER_MEMBER_KINDS) assert.match(guildSilverLineText({ who: 'Bryn', raw, out: true, amount: 1 }), /^Bryn /, raw);
  // every kind not a member's reads as the guild's
  for (const raw of Object.keys(GUILD_SILVER_LINE_WORDS).filter((k) => !GUILD_SILVER_MEMBER_KINDS.includes(k))) {
    assert.match(guildSilverLineText({ who: 'X', raw, out: true, amount: 1 }), /^The guild [a-z]/, raw);
  }
});

// ─── THE SERVICE (lane S) ───────────────────────────────────────────

/** EXPLAIN QUERY PLAN over every migration, each `?n` bound to 0 (test/auditscale.test.js's). */
function planOf(sql) {
  const db = new DatabaseSync(':memory:');
  for (const m of readdirSync(new URL('../server-account/migrations', import.meta.url)).filter((x) => x.endsWith('.sql')).sort()) db.exec(src(`server-account/migrations/${m}`));
  const n = Math.max(0, ...[...sql.matchAll(/\?(\d+)/g)].map((m) => Number(m[1])));
  return db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...Array(n).fill(0)).map((r) => r.detail);
}

test('AUDIT GUILD3 S2: guildHolds, read on every guildmaster\'s view, walks the guild\'s own rows - never the realm\'s unreturned writs or contracts, nor a table scan (mutants: the escrows\' `+returned`)', () => {
  const plan = planOf(GUILD_HOLDS_SQL);
  assert.ok(plan.length > 10, plan.join(' | '));
  for (const step of plan) {
    assert.doesNotMatch(step, /_unreturned/, step);
    assert.doesNotMatch(step, /^SCAN (?!CONSTANT ROW)/, step);
  }
  assert.equal(plan.filter((p) => /idx_guild_writs_guild \(guild_id=\? AND state=\?\)/.test(p)).length, 2, 'both writ reads by the guild and its state');
  assert.equal(plan.filter((p) => /idx_guild_contracts_guild \(guild_id=\? AND state=\?\)/.test(p)).length, 2);
});

test('AUDIT GUILD3 S3: the silver the guildmaster\'s account has no room for is a hold like any - on the view before the press and in a refusal\'s whole list, last; the first code an older client reads unchanged (mutants: the room\'s read, its account, the refusal\'s account)', async () => {
  const s = await guildService();
  s.raw.prepare(`INSERT INTO marks_ledger (src_kind, src_id, dst_kind, dst_id, kind, amount, day, at, actor, who, rid)
    VALUES ('mint', NULL, 'guild', ?, 'guild-deed', 50, 1, ?, ?, 'Aldric', 'seed-guild')`).run(s.gid, T0, s.gid);
  s.seedMarks(s.gm, MARKS_MAX - 10);
  s.raw.prepare("UPDATE guilds SET treasury = 500, moved_by = 'seed', moved_at = ? WHERE id = ?").run(T0, s.gid);
  assert.deepEqual(await keepsOf(s), ['guild-treasury', 'marks-full'], 'said before the press, beside the gold');
  const r = await s.call('/v1/guilds/disband', { character: s.gm.character }, s.gm.secret);
  assert.deepEqual(r.body, { error: 'guild-treasury', keeps: ['guild-treasury', 'marks-full'] }, 'the whole list - the gold first, as ever');
  s.raw.prepare("UPDATE guilds SET treasury = 0, moved_by = 'seed', moved_at = ? WHERE id = ?").run(T0, s.gid);
  assert.deepEqual(await keepsOf(s), ['marks-full']);
  assert.deepEqual((await s.call('/v1/guilds/leave', { character: s.gm.character }, s.gm.secret)).body, { error: 'marks-full', keeps: ['marks-full'] });
  s.raw.prepare("UPDATE marks SET balance = 0 WHERE account = ?").run(s.gm.id);
  assert.deepEqual(await keepsOf(s), [], 'room again: nothing');
  assert.equal((await s.call('/v1/guilds/disband', { character: s.gm.character }, s.gm.secret)).status, 200, 'and it goes');
  // the page says it in the going's own terms
  assert.match(GUILD_KEEPS_WORDS['marks-full'], /comes to you when it goes/);
  assert.ok(GUILD_HOLD_CODES.includes('marks-full'), 'the view\'s word stands for it - a refusal\'s older word not repeated');
});

test('AUDIT GUILD3 S4: a line between two guilds reads by THIS guild - a Conscription received from another guild came in, a fealty share paid to one went out (mutants: the guild\'s own id dropped from `out`)', async () => {
  const s = await guildService();
  s.raw.prepare("INSERT INTO guilds (id, name, name_key, tag, ranks, treasury, founded_at) VALUES ('gother', 'The Other', 'the other', 'OTH', '[]', 0, 1)").run();
  s.raw.prepare("INSERT INTO guild_marks (guild_id, balance) VALUES ('gother', 100)").run();
  const line = (src, dst, kind, amount, rid) => s.raw.prepare(`INSERT INTO marks_ledger (src_kind, src_id, dst_kind, dst_id, kind, amount, day, at, actor, who, rid)
    VALUES ('guild', ?, 'guild', ?, ?, ?, 1, ?, 'seats', 'The Turning', ?)`).run(src, dst, kind, amount, T0, rid);
  line('gother', s.gid, 'conscription', 30, 'r-con');
  line(s.gid, 'gother', 'fealty-tribute', 5, 'r-fea');
  const view = (await s.call('/v1/guilds/mine', { character: s.gm.character }, s.gm.secret)).body.guild;
  const by = Object.fromEntries(view.marksLedger.map((l) => [l.raw, l.out]));
  assert.deepEqual(by, { conscription: false, 'fealty-tribute': true });
  assert.deepEqual(view.marksLedger.map(guildSilverLineText).sort(), ['The guild paid its liege a fealty share of 5 silver', 'The guild received Conscription of 30 silver']);
});

// ─── THE CHAPTERS' LAW (lane L) and THE RECORD'S LAW 1 (R1) ─────────

const DAY = 86_400, ANTICLERE = 21, DAGGERFALL = 17, FIGHTERS = 41, MAGES = 40, THIEVES = 42, DRAGON = 368;
const NOW = T0 + 3 * DAY;
const WEEK = meritWeekOf(NOW);
const ZERO = WEEK - 3;   // Season 0 the four weeks to WEEK, Season 1 the eight after it
const turnOf = (w) => seatWeekStartMs(w + 1) / 1000 + CHAPTER_TURNING_GRACE_S + 1;
/** chap6a's stand: the Chapters on, Anticlere and Daggerfall confirmed, the week before WEEK settled. */
async function chapters() {
  const s = await standService({ CHAPTERS_OPEN: 'on', SEASON_ZERO_WEEK: String(ZERO) });
  const raw = s.env.DB._raw;
  confirmChapters(raw, [ANTICLERE, DAGGERFALL]);
  const put = (f, g, strength, { event = null, season = null, data = {} } = {}) => raw.prepare(`INSERT INTO npc_chapters
    (faction, region, strength, week, merit, at, event, event_season, event_data) VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?)
    ON CONFLICT (faction, region) DO UPDATE SET strength = excluded.strength, event = excluded.event, event_season = excluded.event_season,
      event_data = excluded.event_data`).run(f, g, strength, WEEK - 1, event, season, JSON.stringify(data));
  const row = (f, g) => raw.prepare('SELECT * FROM npc_chapters WHERE faction = ? AND region = ?').get(f, g);
  const history = (kind) => raw.prepare('SELECT faction, region FROM npc_chapter_history WHERE kind = ?').all(kind);
  const settle = (w) => settleChapterWeek(s.env.DB, w, turnOf(w), ZERO, 'on');
  return { ...s, raw, put, row, history, settle };
}

test('AUDIT GUILD3 L1: an event is THIS Season\'s alone - a row still holding last Season\'s Crackdown or Rivalry (a chapter not confirmed at the draw keeps it) shuts no hall, swings no Strength and writes no Chronicle row at this Season\'s end (mutants: the event read whatever its Season)', async () => {
  const s = await chapters();
  const LAST = WEEK + 8;   // Season 1's last week
  s.raw.prepare("INSERT INTO npc_chapter_weeks (week, active, target, chapters, open, at) VALUES (?, 0, 60, 0, 'on', 0)").run(LAST - 1);
  s.put(MAGES, DAGGERFALL, 32, { event: 'crackdown', season: 0 });   // last Season's, under 30 once stepped
  s.put(FIGHTERS, ANTICLERE, 60, { event: 'rivalry', season: 0, data: { rival: THIEVES } });
  s.put(THIEVES, ANTICLERE, 40, { event: 'rivalry', season: 0, data: { rival: FIGHTERS } });
  await s.settle(LAST);
  assert.equal(s.row(MAGES, DAGGERFALL).shut_season, null, 'no hall shut on a Season gone');
  assert.deepEqual([s.row(FIGHTERS, ANTICLERE).strength, s.row(THIEVES, ANTICLERE).strength], [strengthSeasonEnd(57), strengthSeasonEnd(37)], 'no swing: the week\'s step and the halving alone');
  assert.deepEqual(s.history('event'), [], 'and no Chronicle row');
});

test('AUDIT GUILD3 R1: the Decline\'s fall is the Failing band\'s - a chapter that begins its week Failing falls 2 more after the week\'s step unless the week\'s Merit meets twice the target, never under 0; Steady and above never (mutants: the band, the fall, the meet, the floor, the service\'s step)', async () => {
  assert.deepEqual([CHAPTER_FAILING_FALL, CHAPTER_FAILING_MEETS], [2, 2]);
  assert.equal(failingWeekAfter(10, 7, 0, 60), 5, 'idle: 3, and 2 more');
  assert.equal(failingWeekAfter(10, 11, 119, 60), 9, 'Merit short of twice the target: the step and the fall');
  assert.equal(failingWeekAfter(10, 12, 120, 60), 12, 'twice the target met: the step alone');
  assert.equal(failingWeekAfter(1, 0, 0, 60), 0, 'never under 0');
  assert.equal(failingWeekAfter(19, 16, 0, 60), 14, '19 is Failing');
  assert.equal(failingWeekAfter(20, 17, 0, 60), 17, '20 is Steady: no fall, wherever the step lands');
  assert.equal(failingWeekAfter(undefined, 47, 0, 60), 47, 'a chapter with no Strength yet is Steady');
  // the service: the week's Turning
  const s = await chapters();
  s.put(DRAGON, ANTICLERE, 10);
  s.put(MAGES, ANTICLERE, 50);
  await s.settle(WEEK + 1);
  assert.deepEqual([s.row(DRAGON, ANTICLERE).strength, s.row(MAGES, ANTICLERE).strength], [5, 47], 'Failing: 10 - 3 - 2; Steady: 50 - 3');
  // and said where the band is: on the chapter's card
  assert.match(chapterBandEffectsLine(10, DRAGON), /it loses 2 Strength more each week its members' Merit lifts it by less than 2\.$/);
  assert.doesNotMatch(chapterBandEffectsLine(20, DRAGON), /loses/);
});

test('AUDIT GUILD3 L2, L3, W8: the Duties promise Merit only where the reader earns it (AUDIT CHAP3 C8\'s rule, one law for the writ card and the line); shut halls say no band of prices, shelf or writs; the roll names an Ascendant chapter\'s Master its High Master (mutants: the earning, the shut, the roll\'s title)', () => {
  const asks = [{ faction: FIGHTERS, kind: 'gate', member: true, done: false }];
  const line = (m) => chapterDutiesLine(FIGHTERS, asks, m);
  assert.match(line({ merit: 10, max: 600, from: null, elsewhere: false }), /, and Merit\.$/);
  for (const m of [null, { merit: 600, max: 600 }, { merit: 0, max: 600, elsewhere: true }, { merit: 0, max: 600, from: T0 + DAY }]) {
    assert.match(line(m), /more for the day's first of each\.$/, JSON.stringify(m));
  }
  assert.match(chapterDutiesLine(FIGHTERS, []), /, and Merit\.$/, 'to a stranger: what its members earn');
  assert.deepEqual([meritEarnsOf({ merit: 599, max: 600 }), meritEarnsOf({ merit: 600, max: 600 }), meritEarnsOf(undefined)], [true, false, false]);
  assert.match(src('src/ui/noticeWindow.js'), /const earns = meritEarnsOf\(m\);/, 'the writ card asks the same rule');
  // L3: shut halls
  assert.equal(chapterBandEffectsLine(50, MAGES, { shut: true }), null, 'Steady and shut: the season line says it');
  assert.equal(chapterBandEffectsLine(95, MAGES, { shut: true }), 'Whoever holds its Master\'s chair is its High Master.', 'no fifth off a hall that sells nothing');
  assert.equal(chapterBandEffectsLine(10, MAGES, { shut: true }), 'It loses 2 Strength more each week its members\' Merit lifts it by less than 2.');
  // W8: the roll
  const seats = [{ seat: 'master', name: 'Alda' }];
  assert.equal(chapterRollLines(MAGES, { strength: 95, seats })[1], 'High Master of the chapter: Alda.');
  assert.equal(chapterRollLines(MAGES, { strength: 89, seats })[1], 'Master of the chapter: Alda.');
});

// ─── THE CLIENT (lane C) ────────────────────────────────────────────

test('AUDIT GUILD3 C5: the rank list never lies, whatever the tables - each line parsed back into the acts it claims is its rank\'s true set, over 3,000 random tables of acts and vault places (a greater take holding a lesser) (mutants: the except, the cover, the same)', () => {
  let seed = 0x9e3779b9;
  const rand = (n) => { seed = (Math.imul(seed ^ (seed >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; return seed % n; };
  const take = (limit) => ({ key: 'vault-out', words: `take pieces out of the vault, ${limit > 0 ? `${limit} a day` : 'as many as they like'}`, limit });
  const norm = (acts) => {   // a take with a greater limit holds a lesser
    const outs = acts.filter((a) => a.key === 'vault-out');
    const best = outs.reduce((b, a) => (!b || a.limit === 0 || (b.limit !== 0 && a.limit > b.limit) ? a : b), null);
    return [...new Set(acts.filter((a) => a.key !== 'vault-out').map((a) => a.words).concat(best ? [best.words] : []))].sort();
  };
  const NAMES = ['Guildmaster', 'Officer', 'Member', 'Recruit'];
  for (let n = 0; n < 3000; n++) {
    const table = new Map();
    for (const r of [0, 1, 2, 3]) {
      const acts = [];
      for (let k = 0; k < 7; k++) if (rand(3)) acts.push({ key: `a${k}`, words: `act ${k}` });
      const level = rand(3);
      if (level >= 1) acts.splice(rand(acts.length + 1), 0, { key: 'vault-in', words: 'put pieces into the vault' });
      if (level === 2) acts.push(take([0, 5, 10, 20][rand(4)]));
      table.set(r, acts);
    }
    const lines = rankLinesOf((r) => table.get(r));
    const claimed = new Map();
    for (let i = 3; i >= 0; i--) {
      const t = lines[i].text;
      const below = i < 3 ? claimed.get(i + 1) : null;
      let set;
      if (t === 'Nothing yet.') set = [];
      else if (t.startsWith('The same as the ')) { assert.equal(t, `The same as the ${NAMES[i + 1]}.`); set = [...below]; }
      else if (t.startsWith('Everything the ')) {
        const m = /^Everything the (\w+) may(?: except (.+?))?, and: (.+)\.$/.exec(t);
        assert.ok(m, t);
        assert.equal(m[1], NAMES[i + 1]);
        const less = m[2] ? m[2].split(' or ') : [];
        set = below.filter((w) => !less.includes(w)).concat(m[3].split('; '));
      } else set = (t.charAt(0).toLowerCase() + t.slice(1, -1)).split('; ');
      const truth = norm(table.get(i));
      const said = norm(set.map((w) => (w.startsWith('take pieces out of the vault') ? take(/as many/.test(w) ? 0 : Number(/(\d+) a day/.exec(w)[1])) : { key: w, words: w })));
      assert.deepEqual(said, truth, `table ${n}, rank ${i}: "${t}"`);
      claimed.set(i, truth);
    }
  }
});
