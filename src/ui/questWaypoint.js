// @ts-check
// GUIDE9 (2026-10-13, a player: "a client side Waypoint marker kind of like how other single player games guide the
// player to a location"): THE WAYPOINT - the compass's quest mark, stood in the view itself.
//
// WHAT IT SHOWS. Nothing new: the very point the enhanced compass's gold diamond already marks (ui/enhancedHud.js
// drawQuestMark - scenes/world.js questCompassMark and townQuestCompassMark on the street, and GUIDE8's Exact tier
// indoors and underground through questCompassPick), drawn as a diamond in the view at that point's bearing, with how
// far it is. So it follows every law the compass mark does: only a tracked quest, only a place the player's map
// holds, the building only at the Town tier, a thing inside only at Exact. Off the compass, off the view.
//
// WHERE ON THE SCREEN. Across: the bearing through the world's own lens (ui/viewSettings.js fieldOfView, DFU's
// Video/FieldOfView, vertical), so a mark ahead stands over its place. Down: a fixed height - the hosts hand the HUD a
// heading and no pitch, and the compass beside it works the same way. A mark off the view stands at the screen's edge
// as an arrow, on the side to turn toward (the compass's own clamp, compassMarkerLerp).
//
// THE SWITCH. A Features row (`quest-waypoint`), off by default - it is one more thing over the view - and the
// `QuestWaypoint` action, unbound by default (every key a player would guess is spent: systems/inputActions.js), which
// flips the same switch from anywhere a key reaches the page.
//
// Not a DFU member. Ledger A (GUIDE9).

import { isEnhanced } from '../systems/uiSkin.js';
import { getPref, setPref } from '../systems/uiPrefs.js';
import { eventMeans } from './input.js';
import { cycleGuideTrail, GUIDE_TRAIL_ACTION } from '../systems/guideTrail.js';   // GUIDE10: the guide trail's key rides the waypoint's one listener
import { hudText } from '../systems/notify.js';   // GUIDE10: and says the tier it cycled to
import { t } from '../systems/textManager.js';

/** The switch's prefs key (systems/features.js row `quest-waypoint`). */
export const WAYPOINT_PREF = 'questWaypoint';
/** The action that flips it (systems/inputActions.js). */
export const WAYPOINT_ACTION = 'QuestWaypoint';
/** How far down the view the diamond stands, as a share of its height: just over the crosshair's line, under the
 *  compass and the quest card. */
export const WAYPOINT_HEIGHT = 0.42;
/** How near the view's edge a mark may stand before it becomes the edge arrow, px. */
export const WAYPOINT_EDGE_PX = 40;

/** Is the waypoint on: asked for, and on the enhanced skin (the compass it reads is the enhanced HUD's). */
export const waypointOn = () => isEnhanced() && getPref(WAYPOINT_PREF) === true;

/** Flip the switch; answers the new state. */
export function toggleWaypoint() {
  const on = getPref(WAYPOINT_PREF) !== true;
  setPref(WAYPOINT_PREF, on);
  return on;
}

/**
 * The target's bearing off the way the player faces, in degrees, + to the right, -180..180. The compass's own law
 * (ui/hud.js compassMarkerLerp: Vector3.SignedAngle about +Y), read as an angle rather than a place on the strip.
 * @param {number[]} targetXZ @param {number[]} playerXZ @param {number} heading01 the compass heading, 0..1
 */
export function questBearing(targetXZ, playerXZ, heading01) {
  const dx = playerXZ[0] - targetXZ[0];
  const dz = playerXZ[1] - targetXZ[1];
  const len = Math.hypot(dx, dz);
  if (!(len > 0)) return 0;   // standing on it: dead ahead, as the compass says
  const tx = dx / len, tz = dz / len;
  const yaw = heading01 * Math.PI * 2;
  const fx = Math.sin(yaw), fz = Math.cos(yaw);
  const signed = Math.atan2(tz * fx - tx * fz, tx * fx + tz * fz) * 180 / Math.PI;
  const turn = (180 - signed) / 360;   // compassMarkerLerp's `angle`: 0 ahead, a quarter to the right
  return turn < 0.5 ? turn * 360 : -(1 - turn) * 360;
}

/**
 * Where a bearing stands across a view `width` x `height` px seen through a vertical field of view `fovY` (radians):
 * the x in px, or null when it is behind or within `edge` of a side (the edge arrow's).
 * @param {number} bearing degrees @param {number} width @param {number} height @param {number} fovY
 * @param {number} [edge]
 * @returns {number|null}
 */
export function waypointScreenX(bearing, width, height, fovY, edge = WAYPOINT_EDGE_PX) {
  if (!(Math.abs(bearing) < 90) || !(width > 0) || !(height > 0) || !(fovY > 0)) return null;
  const focal = (height / 2) / Math.tan(fovY / 2);
  const x = width / 2 + Math.tan(bearing * Math.PI / 180) * focal;
  return x < edge || x > width - edge ? null : x;
}

/** How far, in words: the scene's units are DFU's metres. @param {number} d */
export const waypointDistanceWords = (d) => (!Number.isFinite(d) ? '' : d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d)} m`);

/**
 * THE WAYPOINT'S PLACE on a view `width` x `height` with vertical field of view `fovY`: null when there is nothing to
 * show (no mark, or no player), else `{ x, y, side, said }` - `side` 0 for the diamond over its place, 1 or -1 for the
 * edge arrow on the right or left (then `x` is that edge's), `said` how far. The HUD only writes what this answers.
 * @param {number[]|null} quest the compass mark's [x, z] @param {number[]|null} playerXZ @param {number} heading01
 * @param {{ width: number, height: number, fovY: number }} view
 * @returns {{ x: number, y: number, side: number, said: string }|null}
 */
export function waypointPlace(quest, playerXZ, heading01, { width, height, fovY }) {
  if (!quest || !playerXZ) return null;
  const bearing = questBearing(quest, playerXZ, heading01);
  const at = waypointScreenX(bearing, width, height, fovY);
  const side = at === null ? (bearing > 0 ? 1 : -1) : 0;
  return {
    x: at ?? (side > 0 ? width - WAYPOINT_EDGE_PX : WAYPOINT_EDGE_PX),
    y: height * WAYPOINT_HEIGHT,
    side,
    said: waypointDistanceWords(Math.hypot(quest[0] - playerXZ[0], quest[1] - playerXZ[1])),
  };
}

/** GUIDE10: what the guide trail's key says it did, in the player's language (L10N4) - the tier is nothing to see until the embers show. */
export const GUIDE_TRAIL_SAID = Object.freeze({
  off: () => t('guideTrail.said.off', 'Guide trail off'),
  quest: () => t('guideTrail.said.quest', 'Guide trail: your tracked quest'),
  exit: () => t('guideTrail.said.exit', 'Guide trail: the way out'),
  waypoint: () => t('guideTrail.said.waypoint', 'Guide trail: your nearest waypoint'),
});

let _keyListening = false;
/** The action's key, from anywhere: one capture listener, installed once (the enhanced HUD's first frame). A text field
 *  owns its keys. */
export function listenWaypointKey(win = typeof window === 'undefined' ? null : window) {
  if (_keyListening || !win) return;
  _keyListening = true;
  win.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const waypoint = eventMeans(e, WAYPOINT_ACTION), trail = !waypoint && eventMeans(e, GUIDE_TRAIL_ACTION);
    if (!waypoint && !trail) return;
    const target = /** @type {any} */ (e.target);
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    if (waypoint) { toggleWaypoint(); return; }
    hudText(GUIDE_TRAIL_SAID[cycleGuideTrail()]());   // GUIDE10: the key says what it did - the tier is nothing to see until the embers show
  }, true);
}
