// @ts-check
// ═══════════════════════════════════════════════════════════════════
// HOME-VOTE (2026-10-10) - A TOWN'S WORD ON A PLAYER'S HOUSE, KEPT.
//
// The owner: "I want to implement a house voting system within vicinity
// of player houses. If the house votes run negative, the exterior
// decorations/interior decorations should not be shown to other players".
// What a vote is, and what a negative score hides, is src/net/homeVoteLaw.js,
// which the client reads too; the votes live here (migration 0107), one row
// an account a home, read out with the town's homes (homes.js homesInTown:
// each home's `score`, and the caller's own `vote`).
//
// ═══ A REGISTERED ACCOUNT, ONE VOTE, NEVER ITS OWN ═════════════════
//
// A guest is a device - minted by a cleared browser, so a guest's vote is a
// vote anyone can cast a hundred times; votes are an account's, as owning a
// home is. An account votes once a home (the primary key - a second vote is
// a change of mind, written over the first), and never on a home it is
// inside of: its own (any of its characters') or a guild's hall it has a
// member in. ONE STATEMENT DECIDES: the write lands only while the home
// stands and the account is no insider of it, so a home sold or a guild
// joined between the read and the write takes no vote.
// ═══════════════════════════════════════════════════════════════════
import { accountKind, overRate } from './accounts.js';
import { homeMapIdOk, homeBuildingKeyOk } from '../../src/net/homeLaw.js';
import { homeVoteOk, HOME_VOTES_MAX, HOME_VOTES_WINDOW_S } from '../../src/net/homeVoteLaw.js';

/** HOME-VOTE: the home at (map, key) stands, and the account is none of its insiders - binds (map, key, player, player). */
const VOTABLE = `EXISTS (SELECT 1 FROM homes h WHERE h.map_id = ? AND h.building_key = ?
  AND NOT ((h.guild_id IS NULL AND h.player = ?)
    OR (h.guild_id IS NOT NULL AND EXISTS (SELECT 1 FROM guild_members g WHERE g.guild_id = h.guild_id AND g.player = ?))))`;

/** A home's score - its votes summed (0 for none). */
export async function homeScore(db, mapId, buildingKey) {
  const r = await db.prepare('SELECT COALESCE(SUM(vote), 0) AS score FROM home_votes WHERE map_id = ? AND building_key = ?').bind(mapId, buildingKey).first();
  return Number(r?.score ?? 0);
}

/**
 * VOTE ON A HOME: `vote` +1 (up), -1 (down) or 0 (the account's vote taken back). Answers `{ ok, mapId, buildingKey,
 * vote, score }` - the home's score after it - or `{ error }`: `homes-need-account` (a guest), `bad-vote`, `vote-rate`,
 * `no-home` (no home stands there), `vote-own` (the account's own home, or a hall of a guild it is in).
 * @param {{db: any, nowS: number}} ctx
 * @param {any} player  the session's player row
 * @param {{mapId?: unknown, buildingKey?: unknown, vote?: unknown}} body
 */
export async function voteHome({ db, nowS }, player, { mapId, buildingKey, vote } = {}) {
  if (accountKind(player) !== 'linked') return { error: 'homes-need-account' };
  if (!homeMapIdOk(mapId) || !homeBuildingKeyOk(buildingKey) || !homeVoteOk(vote)) return { error: 'bad-vote' };
  if (await overRate({ db, nowS }, `vote:${player.id}`, HOME_VOTES_MAX, HOME_VOTES_WINDOW_S)) return { error: 'vote-rate' };
  const write = vote === 0
    ? db.prepare(`DELETE FROM home_votes WHERE map_id = ? AND building_key = ? AND player = ? AND ${VOTABLE}`)
      .bind(mapId, buildingKey, player.id, mapId, buildingKey, player.id, player.id)
    : db.prepare(`INSERT INTO home_votes (map_id, building_key, player, vote, voted_at) SELECT ?, ?, ?, ?, ? WHERE ${VOTABLE}
      ON CONFLICT (map_id, building_key, player) DO UPDATE SET vote = excluded.vote, voted_at = excluded.voted_at`)
      .bind(mapId, buildingKey, player.id, vote, nowS, mapId, buildingKey, player.id, player.id);
  const r = await write.run();
  if (!r?.meta?.changes) {
    // nothing written: a withdrawal of no vote is still answered as one, where the account may vote at all
    const ok = await db.prepare(`SELECT ${VOTABLE} AS ok`).bind(mapId, buildingKey, player.id, player.id).first();
    if (!ok?.ok) {
      const stands = await db.prepare('SELECT 1 AS one FROM homes WHERE map_id = ? AND building_key = ?').bind(mapId, buildingKey).first();
      return { error: stands ? 'vote-own' : 'no-home' };
    }
  }
  return { ok: true, mapId, buildingKey, vote, score: await homeScore(db, mapId, buildingKey) };
}
