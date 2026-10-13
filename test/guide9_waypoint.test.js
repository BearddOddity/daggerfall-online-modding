// GUIDE9 (2026-10-13, a player: "a client side Waypoint marker kind of like how other single player games guide the
// player to a location") - THE WAYPOINT (ui/questWaypoint.js, bible/06-Systems/Quest-Guide-Arc.md GUIDE9): the
// compass's quest mark, stood in the view. Its laws:
//
//   THE COMPASS'S BEARING - the same angle the compass's strip places the mark at (ui/hud.js compassMarkerLerp), right
//     positive, so the view and the strip never disagree about which way to turn.
//   THE WORLD'S LENS - across the view by the tangent law through the vertical field of view; behind, or within the
//     edge band, it is the edge arrow on the side to turn toward.
//   NOTHING NEW - no mark on the compass, nothing in the view; how far is the flat distance, in metres or km.
//   THE SWITCH - a Features row, off by default, placed in Accessibility > Wayfinding; an unbound action flips it; the
//     enhanced skin only.
//   ONE CALL - the enhanced HUD draws it beside the compass mark, from the same `opts.quest`, gated by the switch.
import './modsOff.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setPref, getPref, _resetForTests } from '../src/systems/uiPrefs.js';
import { setUiSkin } from '../src/systems/uiSkin.js';
import { compassMarkerLerp } from '../src/ui/hud.js';
import { FEATURES } from '../src/systems/features.js';
import { CATEGORIES } from '../src/ui/settingsMap.js';
import { ACTIONS, PORT_ACTIONS, ACTION_GROUPS, DEFAULT_BINDINGS } from '../src/systems/inputActions.js';
import {
  WAYPOINT_PREF, WAYPOINT_ACTION, WAYPOINT_HEIGHT, WAYPOINT_EDGE_PX, waypointOn, toggleWaypoint, questBearing,
  waypointScreenX, waypointDistanceWords, waypointPlace,
} from '../src/ui/questWaypoint.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const near = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const FOV = (65 * Math.PI) / 180;   // DFU's Video/FieldOfView default

test('GUIDE9: THE COMPASS\'S BEARING - ahead 0, +x to the right at heading 0, behind 180, a quarter turn faces +x', () => {
  assert.ok(near(questBearing([0, 10], [0, 0], 0), 0), 'ahead');
  assert.ok(near(questBearing([10, 0], [0, 0], 0), 90), 'right');
  assert.ok(near(questBearing([-10, 0], [0, 0], 0), -90), 'left');
  assert.ok(near(Math.abs(questBearing([0, -10], [0, 0], 0)), 180), 'behind');
  assert.ok(near(questBearing([10, 0], [0, 0], 0.25), 0), 'turned to face it');
  assert.ok(near(questBearing([5, 5], [5, 5], 0.3), 0), 'standing on it: dead ahead, as the compass says');
});

test('GUIDE9: THE VIEW AND THE STRIP AGREE - for every mark in front, the compass places it at 0.5 + bearing/180', () => {
  for (const heading of [0, 0.13, 0.5, 0.77]) {
    for (let a = 0; a < 360; a += 7) {
      const t = [Math.cos(a) * 30 + 3, Math.sin(a) * 30 - 4], p = [3, -4];
      const b = questBearing(t, p, heading);
      if (Math.abs(b) > 89) continue;   // the strip clamps past a quarter turn
      assert.ok(near(compassMarkerLerp(t, p, heading), 0.5 + b / 180, 1e-9), `heading ${heading}, angle ${a}`);
    }
  }
});

test('GUIDE9: THE WORLD\'S LENS - centre ahead, the tangent law across, null behind and inside the edge band', () => {
  assert.equal(waypointScreenX(0, 1920, 1080, FOV), 960);
  const halfHfov = Math.atan(Math.tan(FOV / 2) * (1920 / 1080)) * 180 / Math.PI;
  assert.ok(near(waypointScreenX(halfHfov / 2, 1920, 1080, FOV, 0), 960 + 540 / Math.tan(FOV / 2) * Math.tan((halfHfov / 2) * Math.PI / 180), 1e-6));
  assert.ok(waypointScreenX(10, 1920, 1080, FOV) > 960 && waypointScreenX(-10, 1920, 1080, FOV) < 960, 'right is right');
  assert.equal(waypointScreenX(halfHfov - 0.1, 1920, 1080, FOV), null, 'inside the edge band: the arrow');
  assert.equal(waypointScreenX(120, 1920, 1080, FOV), null, 'behind');
  assert.equal(waypointScreenX(0, 0, 1080, FOV), null, 'no view, no place');
});

test('GUIDE9: NOTHING NEW - no mark, no waypoint; the diamond over its place; the arrow on the side to turn; how far', () => {
  const view = { width: 1920, height: 1080, fovY: FOV };
  assert.equal(waypointPlace(null, [0, 0], 0, view), null);
  assert.equal(waypointPlace([0, 10], null, 0, view), null);
  assert.deepEqual(waypointPlace([0, 120], [0, 0], 0, view), { x: 960, y: 1080 * WAYPOINT_HEIGHT, side: 0, said: '120 m' });
  assert.deepEqual(waypointPlace([50, -10], [0, 0], 0, view), { x: 1920 - WAYPOINT_EDGE_PX, y: 1080 * WAYPOINT_HEIGHT, side: 1, said: '51 m' });
  assert.equal(waypointPlace([-50, -10], [0, 0], 0, view).side, -1);
  assert.equal(waypointPlace([-50, -10], [0, 0], 0, view).x, WAYPOINT_EDGE_PX);
  assert.deepEqual([waypointDistanceWords(999.4), waypointDistanceWords(1250), waypointDistanceWords(NaN)], ['999 m', '1.3 km', '']);
});

test('GUIDE9: THE SWITCH - off by default, the action flips it, the enhanced skin only', () => {
  _resetForTests();
  setUiSkin('enhanced');
  assert.equal(waypointOn(), false, 'off by default');
  assert.equal(toggleWaypoint(), true);
  assert.equal(getPref(WAYPOINT_PREF), true);
  assert.equal(waypointOn(), true);
  setUiSkin('classic');
  assert.equal(waypointOn(), false, 'the classic HUD has no compass mark to follow');
  setUiSkin('enhanced');
  assert.equal(toggleWaypoint(), false);
  setPref(WAYPOINT_PREF, false);
  _resetForTests();
});

test('GUIDE9: ITS ROW AND ITS KEY - a Features row on the switch\'s key, off by default, in Accessibility > Wayfinding; an action of the port\'s own, in the controls pane, unbound', () => {
  const row = FEATURES.find((f) => f.id === 'quest-waypoint');
  assert.ok(row, 'the Features row');
  assert.deepEqual([row.control.store, row.control.key, row.control.initial], ['prefs', WAYPOINT_PREF, false]);
  const acc = CATEGORIES.find((c) => c.id === 'accessibility');
  assert.deepEqual(acc.sections.find((s) => s.id === 'wayfinding')?.items, ['feat:quest-waypoint']);
  assert.ok(ACTIONS.includes(WAYPOINT_ACTION) && PORT_ACTIONS.includes(WAYPOINT_ACTION));
  assert.ok(JSON.stringify(ACTION_GROUPS).includes(`"${WAYPOINT_ACTION}"`), 'drawn in the controls pane');
  assert.ok(!DEFAULT_BINDINGS.some(([, a]) => a === WAYPOINT_ACTION), 'ships unbound');
});

test('GUIDE9: ONE CALL - the enhanced HUD draws the waypoint from the compass mark\'s own `opts.quest`, behind the switch', () => {
  const src = readFileSync(join(ROOT, 'src/ui/enhancedHud.js'), 'utf8');
  assert.match(src, /drawQuestMark\(opts\.quest \?\? null, opts\.playerXZ \?\? null, heading01\);[^\n]*\n\s*drawQuestWaypoint\(waypointOn\(\) \? opts\.quest \?\? null : null, opts\.playerXZ \?\? null, heading01\)/);
  assert.match(src, /waypointPlace\(quest, playerXZ, heading01, \{ width: parts\.root\.clientWidth, height: parts\.root\.clientHeight, fovY: fieldOfView\(\) \}\)/);
});
