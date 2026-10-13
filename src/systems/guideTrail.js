// @ts-check
// GUIDE10 (2026-10-13, a player: a Fallout-style trail "that fits the game", for new players finding their way out of
// dungeons and for players who need help keeping track of where they are going): THE GUIDE TRAIL - a stream of warm gold
// embers drifting up off the floor along the way to where you are going.
//
// WHAT IT LEADS TO (the `guideTrail` switch, four tiers, one key cycles them):
//   quest     the quest you track - the very place the compass and the waypoint mark (GUIDE5's place on the street,
//             GUIDE8's building and its Exact tier's person, item or foe indoors and underground)
//   exit      the way out of a dungeon - the walked trail walked back to the way in (systems/wayOut.js, WAYOUT1)
//   waypoint  the nearest waypoint the player has put on the dungeon's map (the automap's notes)
//
// WHAT IT IS. Not a ribbon: the embers are a function of the path and the clock, nothing is simulated - an ember's place
// along the path, its lift off the floor and its glow are each a pure answer for `(path, t)`, so a frame writes the same
// embers the same time gives and nothing is kept between frames but the pool the quads are written into (EVERY
// ALLOCATION HAS AN OWNER: `createEmberField`). The embers stream toward the goal - the way they move is the way to go,
// which is the cue a colour alone cannot give - and thicken and brighten with the stretch just ahead of the player:
// nothing within GUIDE_NEAR_M of the feet (a trail in the player's face is a smear), a window GUIDE_AHEAD_M long, fading
// at its far end unless that end is the goal, where the stream thins as it arrives.
//
// WHERE IT DRAWS. Under the renderer's own camera in each host's world pass (scenes/guideTrailFx.js, drawn by
// scenes/hostMagic.js drawFx beside the spell effects), depth-tested against the world - a corner hides it, as it
// should - and never written, so it blends over everything behind it.
//
// Not a DFU member. Ledger A (GUIDE10).

import { isEnhanced } from './uiSkin.js';
import { getPref, setPref } from './uiPrefs.js';

/** The switch's prefs key (systems/features.js row `guide-trail`). */
export const GUIDE_TRAIL_PREF = 'guideTrail';
/** The action that cycles it (systems/inputActions.js). */
export const GUIDE_TRAIL_ACTION = 'GuideTrail';
/** The tiers, in the order the key cycles them: off, then what the trail may lead to. */
export const GUIDE_TRAIL_TIERS = Object.freeze(['off', 'quest', 'exit', 'waypoint']);

/** The tier in force: enhanced skin only (the compass and the marks it follows are the enhanced HUD's), else 'off'. */
export const guideTrailTier = () => {
  const v = isEnhanced() ? getPref(GUIDE_TRAIL_PREF) : null;
  return GUIDE_TRAIL_TIERS.includes(v) ? v : 'off';
};
/** The tier after `tier` in the cycle (an unknown one is off, so the next is quest). @param {string} tier */
export const nextGuideTrailTier = (tier) => GUIDE_TRAIL_TIERS[(Math.max(0, GUIDE_TRAIL_TIERS.indexOf(tier)) + 1) % GUIDE_TRAIL_TIERS.length];
/** Press the key: the next tier, kept; answers it. */
export function cycleGuideTrail() {
  const next = nextGuideTrailTier(guideTrailTier());
  setPref(GUIDE_TRAIL_PREF, next);
  return next;
}

/** How far ahead of the player the stream shows, along the path (m). */
export const GUIDE_AHEAD_M = 30;
/** Nothing within this of the player along the path - a smear in the face (m). */
export const GUIDE_NEAR_M = 2.5;
/** The gap between embers along the path (m). */
export const GUIDE_SPACING_M = 0.6;
/** How fast the stream moves toward the goal (m/s). */
export const GUIDE_FLOW_MPS = 1.4;
/** How far the stream thins as it reaches the goal, or fades at the window's far end (m). */
export const GUIDE_ARRIVE_M = 2;
export const GUIDE_FADE_M = 8;
/** How many quads one stream can hold: a spark and a floor glow to every slot of the window, and some headroom. */
export const GUIDE_MAX_EMBERS = 2 * Math.ceil(GUIDE_AHEAD_M / GUIDE_SPACING_M) + 8;
/** An ember's life, the rise it makes off the floor (m) and the lift it starts at (m). */
export const GUIDE_RISE_M = 0.55;
export const GUIDE_LIFT_M = 0.14;
/** An ember's half-extent range (m): a quad two to four decimetres across - large enough to read on a dark floor from the far end of\n *  the window, small enough to stay a spark and not a lamp. */
export const GUIDE_SIZE_M = Object.freeze([0.1, 0.2]);
/** THE FLOOR'S GLOW: under every spark a soft pool of the ember's orange lying on the floor, so the stream reads as one warm path\n *  from the far end of the window, and not as a few sparks a dark floor swallows - its half-extent (m), its lift off the floor (m)\n *  and its strongest alpha. */
export const GUIDE_POOL_M = 0.3;
export const GUIDE_POOL_LIFT_M = 0.05;
export const GUIDE_POOL_ALPHA = 0.5;
/** The two golds an ember is drawn between: the quest diamond's own light, and an ember's deeper orange. */
export const GUIDE_GOLD = Object.freeze([1, 0.82, 0.38]);
export const GUIDE_EMBER = Object.freeze([1, 0.55, 0.18]);

const TAU = Math.PI * 2;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const frac = (x) => x - Math.floor(x);
/** A stable hash of an integer to [0, 1) - three independent ones off one id by the multiplier. @param {number} id @param {number} k */
function hash(id, k) {
  let h = Math.imul((id | 0) + 0x9e3779b9, 0x85ebca6b + k * 0x27d4eb2f);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** The length of a polyline (m). @param {number[][]} pts */
export function polylineLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
  return L;
}

/**
 * The point of `pts` nearest `p`, by the projection of `p` on each segment: its place, how far along the path it is
 * from the start (`s`, m) and how far `p` stands off it (`d`, m). Null for an empty path. Pure.
 * @param {number[][]} pts @param {number[]} p
 * @returns {{ at: number[], s: number, d: number, seg: number }|null}
 */
export function nearestOnPath(pts, p) {
  if (!pts?.length || !p) return null;
  if (pts.length === 1) return { at: [...pts[0]], s: 0, d: Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1], p[2] - pts[0][2]), seg: 0 };
  let best = null, run = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2], len2 = vx * vx + vy * vy + vz * vz, len = Math.sqrt(len2);
    const t = len2 > 0 ? Math.min(1, Math.max(0, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy + (p[2] - a[2]) * vz) / len2)) : 0;
    const at = [a[0] + vx * t, a[1] + vy * t, a[2] + vz * t];
    const d = Math.hypot(p[0] - at[0], p[1] - at[1], p[2] - at[2]);
    if (!best || d < best.d) best = { at, s: run + len * t, d, seg: i - 1 };
    run += len;
  }
  return best;
}

/**
 * The stretch of `pts` AHEAD of `from`: from `from`'s projection on the path, on to `ahead` metres - or the path's end,
 * said by `truncated: false`. Null when nothing of it is left ahead (the player stands at the goal). Pure.
 * @param {number[][]} pts @param {number[]} from @param {number} [ahead]
 * @returns {{ pts: number[][], truncated: boolean }|null}
 */
export function trimAhead(pts, from, ahead = GUIDE_AHEAD_M) {
  const n = nearestOnPath(pts, from);
  if (!n || pts.length < 2) return null;
  const out = [n.at];
  let run = 0, truncated = false;
  for (let i = n.seg + 1; i < pts.length; i++) {
    const a = out[out.length - 1], b = pts[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (!(len > 1e-6)) continue;
    if (run + len >= ahead) {
      const t = (ahead - run) / len;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
      truncated = true;
      break;
    }
    out.push([b[0], b[1], b[2]]);
    run += len;
  }
  return out.length >= 2 && polylineLength(out) > 0.25 ? { pts: out, truncated } : null;
}

/**
 * A path over open ground: the straight way from `from` to `to`, a point every `step` metres, each stood on the ground
 * (`heightAt(x, z)`, a number or null where there is none - that point keeps the line's own height). Pure but for
 * `heightAt`.
 * @param {number[]} from @param {number[]} to @param {(x: number, z: number) => number|null} heightAt @param {number} [step]
 * @returns {number[][]}
 */
export function groundPath(from, to, heightAt, step = 3) {
  const dx = to[0] - from[0], dz = to[2] - from[2], len = Math.hypot(dx, dz);
  const n = Math.max(1, Math.ceil(len / step));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = from[0] + dx * t, z = from[2] + dz * t;
    const h = heightAt(x, z);
    out.push([x, Number.isFinite(h) ? /** @type {number} */ (h) : from[1] + (to[1] - from[1]) * t, z]);
  }
  return out;
}

/**
 * A path run through a three-point average: the walked trail's cells zigzag on a one-metre grid, and a stream down a
 * zigzag reads as a drunk's. The ends stay where they are. Pure.
 * @param {number[][]} pts @param {number} [passes]
 */
export function smoothPath(pts, passes = 2) {
  let cur = pts;
  for (let k = 0; k < passes && cur.length > 2; k++) {
    const next = [cur[0]];
    for (let i = 1; i < cur.length - 1; i++) next.push([(cur[i - 1][0] + 2 * cur[i][0] + cur[i + 1][0]) / 4, (cur[i - 1][1] + 2 * cur[i][1] + cur[i + 1][1]) / 4, (cur[i - 1][2] + 2 * cur[i][2] + cur[i + 1][2]) / 4]);
    next.push(cur[cur.length - 1]);
    cur = next;
  }
  return cur;
}

/**
 * @typedef {{ pos: number[], size: number, color: number[], alpha: number }} Ember
 */
/**
 * THE POOL: `GUIDE_MAX_EMBERS` embers made once, rewritten by every `fill`. `fill(path, t, { truncated, brightness })`
 * answers how many are live (the first `n` of `embers`); `path` is the stretch ahead already (trimAhead's). Pure of
 * everything but the pool it writes.
 */
export function createEmberField(max = GUIDE_MAX_EMBERS) {
  /** @type {Ember[]} */
  const embers = Array.from({ length: max }, () => ({ pos: [0, 0, 0], size: 0, color: [1, 1, 1], alpha: 0 }));
  return {
    embers,
    /** @param {number[][]|null} path @param {number} t seconds @param {{ truncated?: boolean, brightness?: number }} [o] */
    fill(path, t, { truncated = true, brightness = 1 } = {}) {
      if (!path || path.length < 2) return 0;
      const L = polylineLength(path);
      if (!(L > GUIDE_NEAR_M)) return 0;
      const flow = t * GUIDE_FLOW_MPS / GUIDE_SPACING_M, cycle = Math.floor(flow), off = (flow - cycle) * GUIDE_SPACING_M;
      let n = 0, seg = 1, segStart = 0;
      let segLen = Math.hypot(path[1][0] - path[0][0], path[1][1] - path[0][1], path[1][2] - path[0][2]);
      for (let k = 0; n + 2 <= max; k++) {
        const a = k * GUIDE_SPACING_M + off;
        if (a >= L) break;
        while (seg < path.length - 1 && a > segStart + segLen) {
          segStart += segLen; seg++;
          segLen = Math.hypot(path[seg][0] - path[seg - 1][0], path[seg][1] - path[seg - 1][1], path[seg][2] - path[seg - 1][2]);
        }
        const id = k - cycle;   // an ember keeps its id as the stream carries it along
        const h1 = hash(id, 1), h2 = hash(id, 2), h3 = hash(id, 3);
        const env = smooth(GUIDE_NEAR_M * 0.4, GUIDE_NEAR_M, a) * smooth(0, truncated ? GUIDE_FADE_M : GUIDE_ARRIVE_M, L - a);
        if (!(env > 0.01)) continue;
        const A = path[seg - 1], B = path[seg];
        const u = segLen > 1e-6 ? (a - segStart) / segLen : 0;
        const dx = B[0] - A[0], dz = B[2] - A[2], dl = Math.hypot(dx, dz);
        const sway = ((h1 - 0.5) * 0.5 + Math.sin(t * 0.9 + h2 * TAU) * 0.08);
        const phase = frac(t * 0.28 + h3);
        const pool = embers[n++];   // the floor's glow under this slot's spark: on the path itself, a slow shimmer
        pool.pos[0] = A[0] + dx * u; pool.pos[1] = A[1] + (B[1] - A[1]) * u + GUIDE_POOL_LIFT_M; pool.pos[2] = A[2] + dz * u;
        pool.alpha = Math.min(1, env * GUIDE_POOL_ALPHA * brightness * (0.8 + 0.2 * Math.sin(t * 2 + h2 * TAU)));
        pool.size = GUIDE_POOL_M;
        for (let c = 0; c < 3; c++) pool.color[c] = (GUIDE_GOLD[c] + GUIDE_EMBER[c]) / 2;   // between the two golds
        const e = embers[n++];
        e.pos[0] = A[0] + dx * u + (dl > 1e-6 ? -dz / dl * sway : 0);
        e.pos[1] = A[1] + (B[1] - A[1]) * u + GUIDE_LIFT_M + phase * GUIDE_RISE_M;
        e.pos[2] = A[2] + dz * u + (dl > 1e-6 ? dx / dl * sway : 0);
        const glow = Math.pow(Math.sin(Math.PI * phase), 0.9) * (0.75 + 0.25 * Math.sin(t * 7 + h2 * 50));
        e.alpha = Math.min(1, env * glow * brightness);
        e.size = GUIDE_SIZE_M[0] + h1 * (GUIDE_SIZE_M[1] - GUIDE_SIZE_M[0]);
        e.color[0] = GUIDE_GOLD[0] + (GUIDE_EMBER[0] - GUIDE_GOLD[0]) * h2;
        e.color[1] = GUIDE_GOLD[1] + (GUIDE_EMBER[1] - GUIDE_GOLD[1]) * h2;
        e.color[2] = GUIDE_GOLD[2] + (GUIDE_EMBER[2] - GUIDE_GOLD[2]) * h2;
      }
      return n;
    },
  };
}

/** How long a path to a goal is kept before it is asked for again (s), and how far off it the player may stand before it
 *  is (m). A goal that cannot be reached is not asked again for the first of them either. */
export const GUIDE_REPLAN_S = 4;
export const GUIDE_RETRY_S = 1.5;
export const GUIDE_OFF_PATH_M = 3;

/**
 * THE PATH TO A GOAL, KEPT: the host's `route(from, to)` (a navigation mesh's query, a clear line) is not asked every
 * frame - a path is kept for GUIDE_REPLAN_S, asked again at once for a new goal or when the player has left it by
 * GUIDE_OFF_PATH_M, and a goal with no route is asked again every GUIDE_RETRY_S. Pure but for `route`.
 * @param {{ route: (from: number[], to: number[]) => (number[][]|null) }} o
 */
export function createGoalPath({ route }) {
  let key = null, at = 0, path = /** @type {number[][]|null} */ (null);
  return {
    /** @param {string} goalKey a name that changes when the goal does @param {number[]} from @param {number[]} to @param {number} nowS
     *  @returns {number[][]|null} */
    get(goalKey, from, to, nowS) {
      const stale = key !== goalKey
        || nowS - at >= (path ? GUIDE_REPLAN_S : GUIDE_RETRY_S)
        || (path !== null && (nearestOnPath(path, from)?.d ?? Infinity) > GUIDE_OFF_PATH_M);
      if (stale) {
        key = goalKey; at = nowS;
        const r = route(from, to);
        path = r && r.length >= 2 ? r : null;
      }
      return path;
    },
    reset() { key = null; at = 0; path = null; },
  };
}

/** The point of `points` ([x, y, z] each) nearest `from`, or null. Pure. @param {ReadonlyArray<number[]>|null|undefined} points @param {number[]} from */
export function nearestPoint(points, from) {
  let best = null, bestD = Infinity;
  for (const p of points ?? []) {
    const d = Math.hypot(p[0] - from[0], p[1] - from[1], p[2] - from[2]);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}