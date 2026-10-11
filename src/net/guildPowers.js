// @ts-check
// ═══════════════════════════════════════════════════════════════════
// GUILD3c (2026-10-11, the owner: "simplifying the player guild and npc guild system from being too overcomplicated.
// Keeping depth, but making it easier to understand"; bible/11-Multiplayer/Guilds-Made-Plain.md, EVERY RULE BEFORE THE
// PRESS) - WHAT EACH RANK OF A PLAYER'S GUILD MAY DO, IN WORDS.
//
// The powers live in four tables, each beside the law that asks it - guildLaw.js GUILD_POWERS (guildMay), hallLaw.js
// HALL_POWERS (hallMay), writLaw.js WRIT_POWERS (writMay), townSeatLaw.js SEAT_POWERS (seatMay) and SEAT_LEVER_RANKS -
// and the service asks them there, so they stay where they are. No page said any of them: a member learnt what its rank
// could do by the buttons it could not press. This module composes them into one list in words, each line's ranks read
// off its own table AT THE CALL - a table moved moves the page - and test/guild3_plain.test.js sweeps every key of the
// four tables against it, so a power added with no words fails the suite.
//
// Pure: no DOM, no clock, no network.
// ═══════════════════════════════════════════════════════════════════

import { GUILD_POWERS, GUILD_RANK_MASTER, GUILD_RANK_OFFICER, GUILD_RANK_MEMBER, GUILD_RANK_RECRUIT, GUILD_RANK_NAMES } from './guildLaw.js';
import { HALL_POWERS } from './hallLaw.js';
import { WRIT_POWERS } from './writLaw.js';
import { SEAT_POWERS, SEAT_LEVER_RANKS } from './townSeatLaw.js';
import { VAULT_RANK_DEFAULTS } from './guildVaultLaw.js';

/** The four tables by the name a row gives them; `levers` the seat's levers (SEAT_LEVER_RANKS, one list of ranks). */
const TABLES = Object.freeze({ guild: GUILD_POWERS, hall: HALL_POWERS, writ: WRIT_POWERS, seat: SEAT_POWERS });

/** EVERY RANK'S ACTS, in the order a member meets them - `{ table, power, words }`, or `{ any: true, words }` for what
 *  every member may do whatever the tables say (pin a note: guildBoard.js; put materials into the guild Stores and take
 *  one's own back: writLaw.js guildTakeMay), or `{ master: true, words }` for an act the code gives the guildmaster by
 *  rank alone (a Charter given up: ui/seatTab.js, seatHolding.js). */
/** @type {readonly Readonly<{ table?: string, power?: string, any?: boolean, master?: boolean, words: string }>[]} */
export const GUILD_RANK_ACTS = Object.freeze([
  Object.freeze({ table: 'guild', power: 'deposit', words: 'put gold and silver into the treasuries' }),
  Object.freeze({ any: true, words: 'pin notes on the guild\'s board' }),
  Object.freeze({ any: true, words: 'put materials into the guild Stores, and take their own back out' }),
  Object.freeze({ table: 'guild', power: 'invite', words: 'invite new members' }),
  Object.freeze({ table: 'guild', power: 'promote', words: 'promote and demote the ranks below their own' }),
  Object.freeze({ table: 'guild', power: 'remove', words: 'remove a member of a lower rank' }),
  Object.freeze({ table: 'hall', power: 'hallEntry', words: 'choose who may walk into the hall' }),
  Object.freeze({ table: 'hall', power: 'decorate', words: 'decorate the hall, its yard and its outside' }),
  Object.freeze({ table: 'hall', power: 'notes', words: 'take down anyone\'s note on the guild\'s board' }),
  Object.freeze({ table: 'writ', power: 'postWrit', words: 'post guild writs and contracts' }),
  Object.freeze({ table: 'writ', power: 'storesWithdraw', words: 'take any materials out of the guild Stores' }),
  Object.freeze({ table: 'seat', power: 'pledge', words: 'pledge the guild to a seat in the Muster' }),
  Object.freeze({ table: 'levers', power: 'levers', words: 'run a held seat - its Tithe, its Edict, its battle window, its works, its fealty and pacts' }),
  Object.freeze({ table: 'guild', power: 'withdraw', words: 'take gold and silver out of the treasuries, and bid silver for a chapter\'s patronage' }),
  Object.freeze({ table: 'writ', power: 'writBudget', words: 'set how much silver may be spent on guild writs each week' }),
  Object.freeze({ table: 'seat', power: 'tribute', words: 'pay Tribute at the seat the guild pledged' }),
  Object.freeze({ master: true, words: 'give a held Charter up' }),
  Object.freeze({ table: 'hall', power: 'hall', words: 'buy and sell the hall' }),
  Object.freeze({ table: 'hall', power: 'heraldry', words: 'choose the guild\'s arms' }),
  Object.freeze({ table: 'guild', power: 'vaultGrant', words: 'grant or revoke each member\'s use of the vault' }),
  Object.freeze({ table: 'guild', power: 'renameRanks', words: 'rename the ranks' }),
  Object.freeze({ table: 'guild', power: 'rename', words: 'give the guild a new name, for a price' }),
  Object.freeze({ table: 'guild', power: 'handOver', words: 'hand the guild on' }),
  Object.freeze({ table: 'guild', power: 'disband', words: 'disband it' }),
]);

/** The ranks a row's act is a rank's, off its own table at the call. */
export function guildActRanks(/** @type {any} */ row) {
  if (row?.any) return [GUILD_RANK_MASTER, GUILD_RANK_OFFICER, GUILD_RANK_MEMBER, GUILD_RANK_RECRUIT];
  if (row?.master) return [GUILD_RANK_MASTER];
  if (row?.table === 'levers') return [...SEAT_LEVER_RANKS];
  const table = /** @type {Record<string, readonly number[]>} */ (/** @type {any} */ (TABLES)[row?.table] ?? {});
  return Object.hasOwn(table, row?.power) ? [...table[row.power]] : [];
}

/** A rank's place at the vault by default (VAULT_RANK_DEFAULTS), `{ level, limit }`, or null. */
const vaultDefaultOf = (/** @type {number} */ rank) => /** @type {Record<number, { level: string, limit: number }>} */ (VAULT_RANK_DEFAULTS)[rank] ?? null;
/** A rank's place at the vault by default in words - "put pieces into the vault and take them out, 10 a day" or "put
 *  pieces into the vault"; `takes` the taking alone ("take pieces out of the vault, 10 a day"), for a rank said on top of
 *  one that puts in. */
export function guildVaultActOf(/** @type {number} */ rank, takes = false) {
  const d = vaultDefaultOf(rank);
  if (!d) return null;
  const limit = d.limit > 0 ? `, ${d.limit} a day` : ', as many as they like';
  if (d.level === 'withdraw') return takes ? `take pieces out of the vault${limit}` : `put pieces into the vault and take them out${limit}`;
  return d.level === 'deposit' ? 'put pieces into the vault' : null;
}

/** EVERY ACT RANK `rank` MAY DO, in words, in GUILD_RANK_ACTS' order - the vault's default after the treasuries (none
 *  where `vault` is false). */
export function guildRankActsOf(/** @type {number} */ rank, vault = true) {
  const out = [];
  for (const row of GUILD_RANK_ACTS) {
    if (!guildActRanks(row).includes(rank)) continue;
    out.push(row.words);
    if (vault && row.table === 'guild' && row.power === 'deposit') { const v = guildVaultActOf(rank); if (v) out.push(v); }
  }
  return out;
}

/** A rank's acts as one sentence: "Put gold and silver into the treasuries; put pieces into the vault; ...". */
export function guildRankActsText(/** @type {number} */ rank) {
  const acts = guildRankActsOf(rank);
  if (!acts.length) return 'Nothing yet.';
  const said = acts.join('; ');
  return `${said.charAt(0).toUpperCase()}${said.slice(1)}.`;
}

/** A rank's name with its article - "an Officer", "a Member" (the guild's own names, as its guildmaster wrote them). */
const withArticle = (/** @type {string} */ name) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}`;
/**
 * THE MEMBERS PAGE'S LIST: `[{ rank, name, text }]`, the guildmaster first - each rank's acts said ON TOP OF the rank below
 * it where it holds all of that rank's ("Everything an Officer may, and: take gold and silver out ..."), the same rank's
 * where they hold the same ("The same as a Recruit."), its whole list where neither. `names` the guild's rank names
 * (GUILD_RANK_NAMES where it has none).
 * @param {readonly string[]} [names]
 */
export function guildRankLines(names = GUILD_RANK_NAMES) {
  const ranks = [GUILD_RANK_MASTER, GUILD_RANK_OFFICER, GUILD_RANK_MEMBER, GUILD_RANK_RECRUIT];
  const nameOf = (/** @type {number} */ r) => String(names?.[r] ?? GUILD_RANK_NAMES[r]);
  return ranks.map((rank, i) => {
    const below = i + 1 < ranks.length ? ranks[i + 1] : null;
    let text = guildRankActsText(rank);
    if (below !== null) {
      // the vault apart: a rank that takes out holds what one that puts in does, and says the taking alone on top of it
      const mine = guildRankActsOf(rank, false), theirs = guildRankActsOf(below, false);
      const [vm, vb] = [vaultDefaultOf(rank), vaultDefaultOf(below)];
      const vaultHeld = !vb || vb.level !== 'withdraw' || (vm?.level === 'withdraw' && (vm.limit === 0 || (vb.limit !== 0 && vm.limit >= vb.limit)));
      if (vaultHeld && theirs.every((a) => mine.includes(a))) {
        const vaultMore = vm && (vm.level !== vb?.level || vm.limit !== vb?.limit) ? guildVaultActOf(rank, vb?.level === 'deposit' || vb?.level === 'withdraw') : null;
        const more = [...(vaultMore ? [vaultMore] : []), ...mine.filter((a) => !theirs.includes(a))];
        const them = withArticle(nameOf(/** @type {number} */ (below)));
        text = more.length ? `Everything ${them} may, and: ${more.join('; ')}.` : `The same as ${them}.`;
      }
    }
    return { rank, name: nameOf(rank), text };
  });
}

/** What the list closes on: a member's vault place is the guildmaster's to change, member by member. */
export const GUILD_RANK_ACTS_NOTE = 'The guildmaster can grant or take back any member\'s use of the vault, member by member, on this page.';
