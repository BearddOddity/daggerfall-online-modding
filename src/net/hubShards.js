// @ts-check
// SCALE5c (2026-10-10, Mac: "lets now tackle the bigger work ... really future proof our archetecture while also
// increasing performance", then "I wanna do every single slice"; bible/11-Multiplayer/Scale-Arc.md SCALE5c): THE HUB,
// SIXTEEN WAYS. Every player online held one socket in ONE object, the hub (`chat:world`): 2,048 sockets at most, and
// every hello, leave and world line walked all of them. A player's hub link now lands on one of HUB_SHARDS shards -
// `chat:world.<k>`, k from the verified account (hubOfSubject) - which holds the sockets, their roster and their own
// joins and leaves. `chat:world` stays what it was for everything else: the world's bus. It keeps every account's
// record, the parties, the receipts and the world's state, and runs every law over them as it always did, over a
// VIRTUAL socket for each shard's (server/src/index.js ShardSocket): a shard hands it each hello, frame and close
// (HUB_INTERNAL_UP), and it hands each shard what it says to that shard's sockets (HUB_INTERNAL_DOWN), batched both
// ways. So nothing is migrated - the records are where they were - and a tab from before this build still joins
// `chat:world`, as a hub of its own, beside the shards.
//
// The law both ends run: the shards' keys, which an account lands on, the doors between the objects, and the frames a
// client reads.

/** How many shards the hub is split into. A shard holds about 1/HUB_SHARDS of everyone online - 625 at 10,000. */
export const HUB_SHARDS = 16;
const HUB_BUS = 'chat:world';
const SHARD_RE = /^chat:world\.(\d{1,2})$/;
/** The shard `k`'s key, or null for an index the hub does not have. */
export const chatHubRoom = (k) => (Number.isInteger(k) && k >= 0 && k < HUB_SHARDS ? `${HUB_BUS}.${k}` : null);
/** Every shard's key, in order. */
export const HUB_SHARD_ROOMS = Object.freeze(Array.from({ length: HUB_SHARDS }, (_, k) => /** @type {string} */ (chatHubRoom(k))));
/** Is `key` one of the hub's shards (never the bus itself)? */
export const isHubShard = (key) => { const m = SHARD_RE.exec(String(key ?? '')); return !!m && Number(m[1]) < HUB_SHARDS && String(Number(m[1])) === m[1]; };

/** The shard hash: FNV-1a, 32 bits, over a string's UTF-16 code units - the same number at both ends and on every device. */
export function shardHash(s) {
  let h = 0x811c9dc5;
  const t = String(s ?? '');
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
/** The shard an account's hub link lands on - by its VERIFIED subject (the token's `s`), so every tab of one account is
 *  on one shard and ONE-SEAT, its record's tabs and its receipts' newest socket stay one object's to judge. Null for no
 *  subject. */
export const hubOfSubject = (sub) => (typeof sub === 'string' && sub ? chatHubRoom(shardHash(sub) % HUB_SHARDS) : null);

/** A shard's hello, frames and closes, to the bus. */
export const HUB_INTERNAL_UP = '/internal/hub/up';
/** The bus's frames and closes for a shard's sockets, to the shard. */
export const HUB_INTERNAL_DOWN = '/internal/hub/down';
/** How long a shard gathers what it hands the bus, and the bus what it hands a shard, before the batch goes - a world
 *  line crosses two of them. */
export const HUB_BATCH_MS = 25;
/** How often a shard tells the bus every socket it holds, so a hello or a close lost between them heals. */
export const HUB_SYNC_MS = 60_000;
/** How often at most a shard tells its sockets the hub's count when it moved (`{t:'n'}`). */
export const HUB_COUNT_MS = 1000;
/** The most events one batch carries either way; past it, the rest wait for the next. */
export const HUB_BATCH_MAX = 512;
/** The largest frame a shard hands the bus - the largest the hub takes (a shared quest, wire.js QUEST_FRAME_MAX). */
export const HUB_FRAME_MAX = 64 * 1024;
/** The frames a second a shard hands up for one socket, and the burst - a hub link says a few a second (its party's
 *  pose, a line, a social act); past it a frame is a junk strike, as the hub's own gates strike. */
export const HUB_UP_HZ_MAX = 16;
export const HUB_UP_BURST = 32;
/** The frames a shard keeps for itself - a socket's hello, its ping, its pose - read off the frame's start, as the
 *  client writes it (`t` first); any other shape is the bus's to parse and refuse. */
export const shardKeeps = (s) => s.startsWith('{"t":"hello"') || s.startsWith('{"t":"ping"') || s.startsWith('{"t":"pose"');
/** The close a shard gives a socket that came to the wrong one (its `hub` frame names the right one). */
export const CLOSE_HUB = 4001;
/** The first relay with the shards (RELAY_VERSION's number). */
export const HUB_SHARDS_RELAY_MIN = 192;
/** Does the relay at version `v` keep the hub's shards? */
export const hubShardsSupported = (v) => Number(/^world(\d+)$/.exec(String(v ?? ''))?.[1]) >= HUB_SHARDS_RELAY_MIN;

/**
 * The hub's word on where a hub link belongs: `{ t: 'hub', key }`, a shard's key or the bus's. Null for anything else.
 * @param {any} m
 * @returns {string|null}
 */
export const hubHopOf = (m) => (m && typeof m === 'object' && m.t === 'hub' && (isHubShard(m.key) || m.key === HUB_BUS) ? m.key : null);

/** SCALE5c (Mac's decision 2): the most names a search of everyone online answers. */
export const HUB_FIND_MAX = 32;
/** The longest search a client may send. */
export const HUB_FIND_Q_MAX = 24;
/** A name as a search folds it: lower case, apostrophes and spaces dropped. */
export const foldFind = (s) => String(s ?? '').toLowerCase().replace(/['’\s-]/g, '');
/** The searches the whole hub answers a second, whoever asks - a search walks everyone online (each socket's own
 *  bucket is a search a second besides). A search past it is answered `busy`. */
export const HUB_FIND_ROOM_HZ_MAX = 10;
/** How often at most a session asks the hub who of its guild is online (the Guild tab's list, every shard's). */
export const HUB_GUILD_WHO_MS = 30_000;
/** SCALE5c (Mac's decision 2, the list while the hub is small): how often at most a hub link on a shard asks the bus for
 *  everyone online - while the hub holds no more than a roster says (CHAT_ROSTER_MAX), so its World tab lists everyone
 *  as one hub's did; past that, its own shard's, its friends and its guild, and the search. */
export const HUB_WHO_MS = 15_000;
/** How long the bus keeps its answer - every ask inside it is the one frame, which each shard's batch carries once. */
export const HUB_WHO_KEEP_MS = 1000;
/** The most of a guild that answer says (a guild holds GUILD_MEMBERS_MAX - net/guildLaw.js - so this is headroom). */
export const HUB_GUILD_WHO_MAX = 64;
