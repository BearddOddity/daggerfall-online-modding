// @ts-check
// MINE-PERKS (bible/06-Systems/Professions-Arc.md 43, the players' "Mining perks need buff" thread: "Motherlode sense -
// Make it mark the motherlode spots with a waypoint on the travel map or something, an extra 20 minutes of heads up
// doesn't do anything considering its damn near impossible to find these anyway"): A MOTHERLODE SENSE'S MAP MARKS - the
// day's Motherlodes, each a circle on its pixel from the day's start until it is spent or gone, its ore and its hour
// beside it, on both maps.
//
// The host hands the maps a FUNCTION (`lodes: () => marks[]`, beside BOUNTY1's `bounties` and RVN7c's `revenants`) and
// neither map learns what a Motherlode is: a mark is the bounty's circle in map pixels - `{cx, cy, r, label}` - read by
// the bounty's own reader (ui/bountyMapMark.js readBountyMarks) and painted by its own painter (ui/inkMap.js
// paintBountyRing; the classic page's bountyRingTexels) in the Motherlode's aqua, the compass's own (LODE-MARK).
//
// Not a DFU member. Ledger A (MINE-PERKS).
import { MOTHERLODE_MARK_CSS } from './nodeMarks.js';
import { BOUNTY_RING_R } from './bountyMapMark.js';

/** The circle's ink, the wash under it and the classic page's texel - the compass's own aqua (LODE-MARK). */
export const LODE_RING_CSS = MOTHERLODE_MARK_CSS;
export const LODE_FILL_CSS = 'rgba(0, 229, 200, 0.16)';
export const LODE_DOT_RGB = Object.freeze([0, 229, 200]);
export const LODE_LEGEND_TEXT = 'Motherlode';

/** "07:05" - a time of day as its two-digit hours and minutes. */
const two = (n) => String(n).padStart(2, '0');

/**
 * The marks for the day's Motherlodes - each `{ x, y, material, opensAt }` (net/motherlodeBook.js sensedAll: today's,
 * not gone, not spent, the account's find not made) - as the maps' circles: centred on its pixel, its ore's name, and
 * while it is still to rise the hour it rises (`clock(epochS)` the reader's own words for that moment, null for none).
 * @param {ReadonlyArray<any>} lodes @param {number} nowS the shared clock's seconds
 * @param {{ oreName: (material: string) => string, clock?: (epochS: number) => (string|null) }} words
 * @returns {Array<{cx:number, cy:number, r:number, label:string}>}
 */
export function lodeMapMarks(lodes, nowS, { oreName, clock = localClock }) {
  const out = [];
  for (const l of lodes ?? []) {
    if (!l || !Number.isSafeInteger(l.x) || !Number.isSafeInteger(l.y)) continue;
    const ore = oreName(l.material);
    const at = Number.isFinite(l.opensAt) && nowS < l.opensAt ? clock(l.opensAt) : null;
    out.push({ cx: l.x + 0.5, cy: l.y + 0.5, r: BOUNTY_RING_R, label: at ? `${ore} Motherlode, ${at}` : `${ore} Motherlode` });
  }
  return out;
}
/** The device's own clock face for an epoch second ("14:20"). */
export function localClock(epochS) {
  const d = new Date(epochS * 1000);
  return Number.isFinite(d.getTime()) ? `${two(d.getHours())}:${two(d.getMinutes())}` : null;
}
