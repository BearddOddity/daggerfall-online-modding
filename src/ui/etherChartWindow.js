// @ts-check
// ETHER-CHART (2026-10-11, the owner: "A brand new open sea map that allows you to traverse to the etheric sea";
// bible/03-World/Etheric-Sea.md ETHER-CHART) - THE CHART OF THE ETHERIC SEA: the map a captain keeps past the Veil, the
// travel map's door's answer there (scenes/world.js toggleTravelMap) - the Bay's travel map has no sea past the Veil to
// show, and no road to travel by. Drawn on a canvas in the naval windows' sheet (ui/navalPlunderWindow.js's style, the
// door's slot - ui/navalPlunderDoor.js), off the world's word (scenes/etherHost.js chart): the ISLES CHARTED - a port's
// gold, a ruin's red, a wild isle's green, a rock's grey, each named as the zoom allows - the SHIP and her heading, THE
// VEIL down the chart's east edge and the way home through it, the BANDS' bounds and names (each on its own deeper side,
// the Shallows by the Veil), and the HAUNTS of the legends heard of, the square each is (dim while she lies sunk). Pan by
// dragging (a finger, the mouse's first button) or the arrows; zoom by the wheel (about the pointer, a notch a step),
// a pinch (about the fingers), + and - or the window's own buttons (about the chart's middle); C or Ship back to the
// ship; a pointer on an isle - or a tap - says what it is and how far, and which way, from the ship. The key that opened
// it (the travel map's or the map's, by binding) closes it. Nothing on it is pressed: the Etheric Sea is sailed. AUDIT
// CAPTAIN'S SEA X6/X7/X8/X12/X13/X14/X17/X18.
//
// ETHER-CHART2 (2026-10-12, the owner: "I want to improve the [Etheric] sea map, its icons, the highlight areas, etc and
// improve readability") - THE CHART READ AT A GLANCE. Its words are the enhanced face (FONT1's law - every enhanced
// surface in the pixel face; the chart named "Cormorant Garamond", which no request loads, so every name on it was
// Georgia), drawn LAST under a hard halo (an isle's mark painted after a name crossed it out), each on its isle's east
// side or its west, whichever is clear. Every isle's MARK is a shape as well as a colour (a port round, a ruin a
// diamond, a wild isle a peak, a rock a cross - a ruin's red and a wild isle's green are the pair a red-green eye cannot
// tell apart), over its land at the chart's own scale once the land outgrows the mark; Veilhaven ringed. The DEPTHS are
// areas, each band its own water, under a grid a scale bar long; the world's edge hatched. A HAUNT is a washed square,
// a sunk legend's hatched and dashed, her name in the first clear corner of the square's part in view. The SHIP is a
// bone arrowhead in a brass ring and, off the canvas, a pointer at the edge saying how far. The isle named is ringed, a bearing drawn to it
// from the ship and its card beside it. A key under the chart says what each mark is.
//
// deps = { word() -> etherHost.js chart's, onExit(reason) }. Pure beside the mount: the view's sums (`toScreen`,
// `toChart`, `chartZoomAt`), the chart's model (`chartModel`), the scale (`scaleBar`), a name's two sides
// (`labelBoxes`) and the edge's pointer (`edgePointer`); `paintChart` the one function that draws, handed its context.
import { closeOnOutsideTap } from './enhancedOverlays.js';
import { overlayAction, bindings } from './input.js';
import { actionsForCode } from '../systems/inputActions.js';
import { injectEnhancedStyle, injectEnhancedFonts } from './enhancedStyle.js';
import { injectNavalKit } from './navalHud.js';
import { injectNavalWindowStyle } from './navalPlunderWindow.js';
import { PIXEL_STACK } from './pixelifyFive.js';
import { isleByKey, BANDS, VEIL_X, LEAGUE_PX, KIND_WORDS, ETHER_BOX, compassPoint, veilhaven } from '../world/ethericSea.js';
import { hauntOf, legendById, HAUNT_PX } from '../systems/naval/etherShips.js';

/** The zooms: screen pixels a map pixel (819.2 m). */
export const CHART_ZOOMS = Object.freeze([1, 2, 4, 8, 16]);
export const CHART_ZOOM_DEFAULT = 2;
/** A name is lettered at this zoom and over (a port's at any). */
export const LABEL_ZOOM = 8;
/** An arrow's pan, in screen pixels. */
export const PAN_STEP = 80;
/** The kinds' colours on the chart (ETHER-CHART2: lifted to read on the depths' water). */
export const KIND_COLOURS = Object.freeze({ port: '#f0c06a', ruin: '#e0664c', wild: '#6cc48a', rock: '#a9afba' });
/** ETHER-CHART2: the faces the chart letters in - the enhanced skin's pixel stack at FONT3's reading weight (FONT1:
 *  every enhanced surface in the enhanced face) - and the reading pair's half pixel of tracking. */
export const CHART_FONT = Object.freeze({ name: `500 12px ${PIXEL_STACK}`, small: `500 11px ${PIXEL_STACK}` });
export const CHART_TRACKING = '0.5px';
/** AUDIT CAPTAIN'S SEA X14: a name's box on the chart, as the model reckons it - no two names lettered over each other,
 *  ports first. ETHER-CHART2: the window measures each name in its face; where no canvas does (node), a letter is
 *  this - the mean of 755 isles' names in CHART_FONT.name, measured in Chromium. */
export const LABEL_CHAR_PX = 6.7;
export const LABEL_H = 14;
/** ETHER-CHART2: the band names' row (its top), and how far below it a haunt's name stands. */
export const BAND_TOP = 8;
export const BAND_ROW = BAND_TOP + LABEL_H + 8;
/** ETHER-CHART2: an isle's mark's half side at each zoom (a port's one more). */
export const ICON_PX = Object.freeze([2.5, 3, 4, 5, 6]);
/** ETHER-CHART2: the scale bar's lengths (leagues) and its longest (px) - the grid's squares the bar's length. */
export const SCALE_LEAGUES = Object.freeze([1, 2, 5, 10, 20, 50, 100]);
export const SCALE_MAX_PX = 120;
/** ETHER-CHART2: the Veil's name, down its edge. */
export const VEIL_WORDS = 'THE VEIL - to the Iliac Bay';
/** ETHER-CHART2: the ship's pointer stands this far in from the canvas's edge. */
export const EDGE_INSET = 26;
/** ETHER-CHART2: the depths' waters, the Shallows' lightest by the Veil; past the box the world's edge. */
export const DEPTH_TONES = Object.freeze({ shallows: '#173a55', reaches: '#112b42', deep: '#0b1d31', abyss: '#06101d' });
export const VOID_TONE = '#030508';
/** ETHER-CHART2: the key under the chart - each mark, and what it is. */
export const CHART_KEY = Object.freeze([['port', 'Port'], ['ruin', 'Ruin'], ['wild', 'Wild isle'], ['rock', 'Bare rock'], ['ship', 'Your ship'], ['haunt', 'A legend\'s haunt'], ['sunk', 'A legend sunk']]);
/** AUDIT CAPTAIN'S SEA X18: the wheel's travel a zoom step takes (a trackpad's light brush was a step an event). */
export const CHART_WHEEL_STEP = 100;
/** AUDIT CAPTAIN'S SEA X6: a press that moves less than this (px) is a tap; two fingers' spread by this share a step. */
export const CHART_TAP_PX = 8;
export const CHART_PINCH_STEP = 1.6;
/** A name opening a line, its first letter raised ("the Sepulchre of Aelorrel" leads a sentence as "The Sepulchre..."). */
export const capFirst = (t) => String(t ?? '').replace(/^./, (c) => c.toUpperCase());

/** @typedef {{ cx: number, cy: number, zoom: number }} ChartView */
/** A chart point (map pixels) on the canvas (`w` x `h`): the view's centre the canvas's. */
export const toScreen = (v, px, py, w, h) => [w / 2 + (px - v.cx) * CHART_ZOOMS[v.zoom], h / 2 + (py - v.cy) * CHART_ZOOMS[v.zoom]];
/** ...and back. */
export const toChart = (v, sx, sy, w, h) => [v.cx + (sx - w / 2) / CHART_ZOOMS[v.zoom], v.cy + (sy - h / 2) / CHART_ZOOMS[v.zoom]];
/** The view zoomed `dir` steps (+ in) about a canvas point, which stays over the same chart point. */
export function chartZoomAt(v, dir, sx, sy, w, h) {
  const zoom = Math.max(0, Math.min(CHART_ZOOMS.length - 1, v.zoom + Math.sign(dir)));
  if (zoom === v.zoom) return v;
  const [px, py] = toChart(v, sx, sy, w, h);
  const k = CHART_ZOOMS[zoom];
  return clampChartView({ cx: px - (sx - w / 2) / k, cy: py - (sy - h / 2) / k, zoom });
}
/** The view kept over the sea's box - its centre (the chart's edges may show past the box at its corners). */
export const clampChartView = (v) => ({ zoom: v.zoom, cx: Math.max(ETHER_BOX.x0, Math.min(ETHER_BOX.x1, v.cx)), cy: Math.max(ETHER_BOX.y0, Math.min(ETHER_BOX.y1, v.cy)) });

/** Which way, and how far, a point lies from another: "12 leagues west-north-west" (map y runs south). */
export function wayWords(from, to) {
  const dx = to.px - from.px, dy = to.py - from.py;
  const leagues = Math.hypot(dx, dy) / LEAGUE_PX;
  if (leagues < 0.5) return 'here';
  const n = Math.max(1, Math.round(leagues));
  return `${n} ${n === 1 ? 'league' : 'leagues'} ${compassPoint(dx, dy)}`;
}
/** An isle in a line: "Port Pelleveth - a port - 12 leagues west-north-west" - its name's first letter raised (X17). */
export const isleWords = (isle, ship) => `${capFirst(isle.name)} - ${KIND_WORDS[isle.kind] ?? 'an isle'} - ${wayWords(ship, isle)}`;

/** ETHER-CHART2: THE SCALE at a zoom - the longest of SCALE_LEAGUES whose bar is no longer than SCALE_MAX_PX - and its
 *  words; the grid's squares are its length. */
export function scaleBar(zoom) {
  const per = LEAGUE_PX * CHART_ZOOMS[zoom];
  let leagues = SCALE_LEAGUES[0];
  for (const n of SCALE_LEAGUES) if (n * per <= SCALE_MAX_PX) leagues = n;
  return { leagues, px: leagues * per, words: `${leagues} ${leagues === 1 ? 'league' : 'leagues'}` };
}
/** ETHER-CHART2: A NAME'S TWO SIDES - its isle's east, then its west - for a name `tw` wide (the model's boxes are
 *  `[x0, y0, x1, y1]`, the name centred on its isle's row). */
export const labelBoxes = (i, tw) => [
  [i.x + i.r + 4, i.y - LABEL_H / 2, i.x + i.r + 4 + tw, i.y + LABEL_H / 2],
  [i.x - i.r - 4 - tw, i.y - LABEL_H / 2, i.x - i.r - 4, i.y + LABEL_H / 2],
];
/** Do two boxes overlap? */
const overlaps = (p, q) => p[0] < q[2] && q[0] < p[2] && p[1] < q[3] && q[1] < p[3];
/** ETHER-CHART2: THE SHIP'S POINTER off the canvas - where the line from the canvas's middle to her crosses a rectangle
 *  EDGE_INSET in from its edge, and the way it points. */
export function edgePointer(x, y, w, h) {
  const cx = w / 2, cy = h / 2, dx = x - cx, dy = y - cy;
  const t = Math.max(0, Math.min(dx ? (cx - EDGE_INSET) / Math.abs(dx) : Infinity, dy ? (cy - EDGE_INSET) / Math.abs(dy) : Infinity));
  return { x: cx + dx * t, y: cy + dy * t, a: Math.atan2(dy, dx) };
}
/** The marks in multiples of `step` from `a` to `b` (either way round). */
const ticks = (a, b, step) => {
  const out = [];
  for (let t = Math.ceil(Math.min(a, b) / step) * step; t <= Math.max(a, b); t += step) out.push(t);
  return out;
};

/**
 * THE CHART'S MODEL for a canvas of `w` x `h` over the view: the charted isles on it (`{ key, name, kind, x, y, r, land,
 * icon, home, label, box }` - `land` the isle's own radius at the zoom, `icon` its mark's half side, `r` the larger;
 * lettered by the zoom, ports first, on the first of its sides clear of every name lettered (`box`)), the bands' bounds
 * on it (`{ x, box, name, line }` - each name lettered on its own deeper side, the Shallows by the Veil with no line of
 * its own; `box` null where it gave way), the depths' waters (`{ id, x0, x1 }`), the sea's box (`edge`), the grid, the
 * scale, the Veil's x (null off it) and its name (`veilLabel`, null where it gave way), the ship (`{ x, y, yaw, on, edge,
 * way }` - off the canvas, her pointer and her way from its middle), the haunts heard of on it (`{ x, y, r, name, sails,
 * sub, inside, at, box }` - `r` a haunt's half side: a haunt is the square legendAt reads; `inside` her name on a plate
 * in her square, else alone over it; `at` and `box` null where it gave way), the isle named (`pick`), and the header's
 * two lines.
 * @param {any} word - etherHost.js chart's @param {ChartView} v @param {number} w @param {number} h
 * @param {{ measure?: ((text: string, font: string) => number) | null, pick?: string | null }} [opts] - a name's width
 *   in a face (the window's canvas; the mean letter, LABEL_CHAR_PX, without one) and the isle named
 */
export function chartModel(word, v, w, h, { measure = null, pick = null } = {}) {
  const k = CHART_ZOOMS[v.zoom];
  const on = (x, y, pad = 0) => x >= -pad && y >= -pad && x <= w + pad && y <= h + pad;
  /** @param {string} t @param {string} [font] */
  const width = (t, font = CHART_FONT.name) => (measure ? measure(t, font) : t.length * LABEL_CHAR_PX);
  const home = veilhaven().key;
  const isles = [];
  for (const key of word.charted ?? []) {
    const i = isleByKey(key);
    if (!i) continue;
    const [x, y] = toScreen(v, i.px + 0.5, i.py + 0.5, w, h);
    const land = i.r * k, icon = ICON_PX[v.zoom] + (i.kind === 'port' ? 1 : 0);
    const r = Math.max(icon + 1, land);
    if (!on(x, y, r + 80)) continue;
    isles.push({ key, name: i.name, kind: i.kind, x, y, r, land, icon, home: key === home, box: null, label: i.kind === 'port' || v.zoom >= CHART_ZOOMS.indexOf(LABEL_ZOOM) });
  }
  // ETHER-CHART2: the sea's box on the canvas, each band's water across it (the Abyss's to the box's west edge), and the
  // grid - a line each scale bar's length of depth west of the Veil, and of rows north and south of Veilhaven's
  const [bx0, by0] = toScreen(v, ETHER_BOX.x0, ETHER_BOX.y0, w, h), [bx1, by1] = toScreen(v, ETHER_BOX.x1, ETHER_BOX.y1, w, h);
  const boundX = (n) => (n < BANDS.length ? toScreen(v, VEIL_X - BANDS[n].from * LEAGUE_PX, 0, w, h)[0] : bx0);
  const depths = [];
  BANDS.forEach((b, n) => {
    const x0 = Math.max(0, bx0, boundX(n + 1)), x1 = Math.min(w, boundX(n));
    if (x1 > x0) depths.push({ id: b.id, x0, x1 });
  });
  const bands = [];
  BANDS.forEach((b, n) => {
    const x = boundX(n);
    // AUDIT CAPTAIN'S SEA X12: on its own side of its line - west of it, the deeper - right-aligned to it. ETHER-CHART2:
    // and inside its own water - a name wider than its band in view goes unlettered (at x1 the Shallows' ran over the
    // Reaches' own); its box the model's, the plate under it the painter's
    const right = Math.min(w - 8, x - 8), tw = width(b.name.toUpperCase(), CHART_FONT.small);
    const box = right - tw >= Math.max(0, boundX(n + 1)) + 8 ? [right - tw, BAND_TOP, right, BAND_TOP + LABEL_H] : null;
    if (x >= 0 && x <= w + 80) bands.push({ x, box, name: b.name, line: b.from > 0 });   // AUDIT CAPTAIN'S SEA X12: the Shallows named by the Veil
  });
  const scale = scaleBar(v.zoom);
  const depthAt = (sx) => (VEIL_X - toChart(v, sx, 0, w, h)[0]) / LEAGUE_PX;
  const rowY = veilhaven().py + 0.5, rowAt = (sy) => (toChart(v, 0, sy, w, h)[1] - rowY) / LEAGUE_PX;
  const grid = {
    xs: ticks(depthAt(0), depthAt(w), scale.leagues).filter((d) => d > 0).map((d) => toScreen(v, VEIL_X - d * LEAGUE_PX, 0, w, h)[0]).filter((x) => x >= bx0),
    ys: ticks(rowAt(0), rowAt(h), scale.leagues).map((n) => toScreen(v, 0, rowY + n * LEAGUE_PX, w, h)[1]).filter((y) => y >= by0 && y <= by1),
  };
  const shipAt = { px: word.px + 0.5, py: word.py + 0.5 };
  const [sx, sy] = toScreen(v, shipAt.px, shipAt.py, w, h);
  const shipOn = on(sx, sy);
  const ship = { x: sx, y: sy, yaw: word.yaw ?? 0, on: shipOn, edge: shipOn ? null : edgePointer(sx, sy, w, h), way: shipOn ? '' : wayWords({ px: v.cx, py: v.cy }, shipAt) };
  const haunts = [];
  for (const l of word.legends ?? []) {
    const legend = legendById(l.id);
    if (!legend) continue;
    const lair = hauntOf(legend);
    const [x, y] = toScreen(v, lair.px + 0.5, lair.py + 0.5, w, h);
    const r = HAUNT_PX * k;
    if (on(x, y, r)) haunts.push({ x, y, r, name: l.name, sails: !!l.sails, sub: l.sails ? `Her haunt${l.trait === 'night' ? ' - by night' : ''}` : 'Sunk - she will rise again', inside: false, at: /** @type {number[]|null} */ (null), box: /** @type {number[]|null} */ (null) });
  }
  // ETHER-CHART2: the Veil's name down its edge - from the top, else up from the bottom - clear of the canvas's middle
  // (where the ship and Veilhaven lie, and the ports round them)
  const [veil] = toScreen(v, VEIL_X, 0, w, h);
  const vw = width(VEIL_WORDS), vx = Math.min(w - 12, veil + 16);
  const veilAt = (vy) => ({ x: vx, y: vy, box: [vx - LABEL_H / 2, vy - vw / 2, vx + LABEL_H / 2, vy + vw / 2] });
  const veilSpots = veil <= w ? [veilAt(Math.max(BAND_TOP + vw / 2, Math.min(h - vw / 2 - 8, BAND_ROW + vw / 2))), veilAt(Math.max(BAND_ROW + vw / 2, h - 44 - vw / 2))] : [];
  // AUDIT CAPTAIN'S SEA X14: the names placed greedily - ports first, then by the chart's own order - and one that would
  // stand over a name already lettered on both its sides left unlettered (a pointer or a tap still names it).
  // ETHER-CHART2: IN LAYERS - the ports' names; then the chart's own words give way to them (a band's name and the Veil's,
  // which tries the other end of its strip first); then the haunts' names; then the lesser isles'. A lesser isle's name
  // never stands over a band's name, the scale, the Veil's name or a haunt's either. Of the sides left, a name takes the
  // first on the canvas and clear of those, the ship's ring and every other isle's mark - a port of the ports' marks
  // alone, so a lesser isle never moves a port's name (and so never which ports are lettered) - else the first.
  const placed = [];
  const plateOf = (b) => [b.box[0] - 6, b.box[1] - 2, b.box[2] + 6, b.box[3] + 2];
  const scaleBox = [6, h - 36, 22 + Math.max(scale.px, width(scale.words, CHART_FONT.small)), h - 7];
  const chrome = (veilBox) => [...bands.filter((b) => b.box).map(plateOf), scaleBox, ...(veilBox ? [veilBox] : [])];
  let fixed = chrome(veilSpots[0]?.box);
  const ring = shipOn ? [[sx - 16, sy - 16, sx + 16, sy + 16]] : [];
  const mark = (o) => [o.x - o.icon - 1, o.y - o.icon - 1, o.x + o.icon + 1, o.y + o.icon + 1];
  const letter = (i) => {
    if (!i.label) return;
    const port = i.kind === 'port';
    const sides = labelBoxes(i, width(capFirst(i.name)));
    const free = sides.filter((box) => !placed.some((p) => overlaps(box, p)) && (port || !fixed.some((p) => overlaps(box, p))));
    if (!free.length) { i.label = false; return; }
    i.box = free.find((box) => box[0] >= 0 && box[2] <= w && ![...fixed, ...ring].some((p) => overlaps(box, p)) && !isles.some((o) => o !== i && (!port || o.kind === 'port') && overlaps(box, mark(o)))) ?? free[0];
    placed.push(i.box);
  };
  // ...a haunt's name and state on a plate in the first corner of her square's part in view (below the band names' row)
  // clear of every name and plate - or, where that part is smaller than the plate, her name alone over the square, given
  // way where a port's name stands (a plate wider than her haunt hid the isles round it); her square stands either way
  const nameHaunt = (t) => {
    const tw = width(t.name), pw = Math.max(tw, width(t.sub, CHART_FONT.small)) + 12;
    const vx0 = Math.max(t.x - t.r, 0), vy0 = Math.max(t.y - t.r, BAND_ROW), vx1 = Math.min(t.x + t.r, w), vy1 = Math.min(t.y + t.r, h);
    const taken = (b) => [...placed, ...fixed].some((p) => overlaps(b, p));
    if (vx1 - vx0 >= pw + 16 && vy1 - vy0 >= 50) {
      const corners = [[vx0 + 4, vy0 + 4], [vx1 - 4 - pw, vy0 + 4], [vx0 + 4, vy1 - 38], [vx1 - 4 - pw, vy1 - 38]].map(([x0, y0]) => [x0, y0, x0 + pw, y0 + 34]);
      t.box = corners.find((b) => !taken(b)) ?? corners[0];
      t.inside = true; t.at = [t.box[0] + 6, t.box[1] + 4];
    } else {
      const cx = Math.max(tw / 2 + 6, Math.min(w - tw / 2 - 6, t.x)), cy = Math.max(BAND_ROW + 8, t.y - t.r - 10);
      const box = [cx - tw / 2 - 3, cy - LABEL_H / 2, cx + tw / 2 + 3, cy + LABEL_H / 2];
      if (!taken(box)) { t.box = box; t.at = [cx, cy]; }
    }
    if (t.box) placed.push(t.box);
  };
  const ports = isles.filter((i) => i.kind === 'port'), lesser = isles.filter((i) => i.kind !== 'port');
  for (const i of ports) letter(i);
  for (const b of bands) if (b.box && placed.some((p) => overlaps(plateOf(b), p))) b.box = null;
  const veilLabel = veilSpots.find((at) => !placed.some((p) => overlaps(at.box, p))) ?? null;
  fixed = chrome(veilLabel?.box);
  for (const t of haunts) nameHaunt(t);
  for (const i of lesser) letter(i);
  const named = pick ? isles.find((i) => i.key === pick) : null;
  const isle = named ? isleByKey(named.key) : null;
  const st = word.stats ?? {};
  return {
    isles, bands, veil: veil <= w ? veil : null, veilLabel, ship, haunts, depths, edge: [bx0, by0, bx1, by1], grid, scale,
    pick: named && isle ? { key: named.key, x: named.x, y: named.y, r: named.r, title: capFirst(named.name), words: `${capFirst(KIND_WORDS[named.kind] ?? 'an isle')} - ${wayWords(shipAt, isle)}` } : null,
    title: 'A chart of the Etheric Sea',   // the haunts' `r` the square's half side (X13)
    sub: `${st.charted ?? 0} ${st.charted === 1 ? 'isle' : 'isles'} charted - deepest ${st.deepest ?? 0} leagues past the Veil - ${st.crossings ?? 0} ${st.crossings === 1 ? 'crossing' : 'crossings'}${st.legends ? ` - ${st.legends} ${st.legends === 1 ? 'legend' : 'legends'} ended` : ''}`,
  };
}

// ── the painter ──────────────────────────────────────────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;
const INK = '#050608';
/** A colour of the chart's at an alpha. @param {string} hex @param {number} a */
const tint = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
/** FONT3's tracking on a context (Chromium's `letterSpacing`; a context without it letters untracked). */
const track = (g, px) => { /** @type {any} */ (g).letterSpacing = px; };
/** Diagonal lines across a box, clipped to it. */
function hatch(g, x0, y0, x1, y1, colour, gap) {
  g.save();
  g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  g.strokeStyle = colour; g.lineWidth = 1; g.beginPath();
  for (let d = x0 - (y1 - y0); d < x1; d += gap) { g.moveTo(d, y1); g.lineTo(d + (y1 - y0), y0); }
  g.stroke();
  g.restore();
}
/** Words under a hard halo - the HUD's one-step shadow law, never a blur. */
function halo(g, text, x, y, fill, align = 'left') {
  g.textAlign = /** @type {CanvasTextAlign} */ (align);
  g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = 'rgba(5,6,8,0.92)';
  g.strokeText(text, Math.round(x), Math.round(y));
  g.fillStyle = fill; g.fillText(text, Math.round(x), Math.round(y));
}
/** A plate under words: the naval sheet's ground with a hairline edge. */
function plate(g, x0, y0, x1, y1, edge = 'rgba(160,190,225,0.28)') {
  g.fillStyle = 'rgba(5,8,14,0.78)'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.strokeStyle = edge; g.lineWidth = 1; g.strokeRect(Math.round(x0) + 0.5, Math.round(y0) + 0.5, Math.round(x1 - x0) - 1, Math.round(y1 - y0) - 1);
}
/** AN ISLE'S MARK, a shape for each kind: a port round (its harbour's dot in it), a ruin a diamond, a wild isle a peak,
 *  a rock a cross - each in its kind's colour, outlined in ink. `s` its half side. */
export function paintMark(g, kind, x, y, s) {
  g.lineJoin = 'miter';
  if (kind === 'rock') {
    g.lineCap = 'square';
    g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s);
    g.strokeStyle = INK; g.lineWidth = s * 0.8 + 3; g.stroke();
    g.strokeStyle = KIND_COLOURS.rock; g.lineWidth = s * 0.8; g.stroke();
    g.lineCap = 'butt';
    return;
  }
  g.beginPath();
  if (kind === 'port') g.arc(x, y, s, 0, TAU);
  else if (kind === 'ruin') { const d = s * 1.3; g.moveTo(x, y - d); g.lineTo(x + d, y); g.lineTo(x, y + d); g.lineTo(x - d, y); g.closePath(); }
  else { g.moveTo(x, y - s * 1.3); g.lineTo(x + s * 1.25, y + s); g.lineTo(x - s * 1.25, y + s); g.closePath(); }
  g.fillStyle = KIND_COLOURS[kind] ?? KIND_COLOURS.rock; g.fill();
  g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  if (kind === 'port' && s >= 3.5) { g.beginPath(); g.arc(x, y, s * 0.36, 0, TAU); g.fillStyle = INK; g.fill(); }
}
/** THE SHIP: an arrowhead on her heading (bow up at yaw 0) in a brass ring - bone, apart from every isle's colour. */
function paintShip(g, x, y, yaw, k = 1) {
  g.beginPath(); g.arc(x, y, 14 * k, 0, TAU);
  g.fillStyle = 'rgba(5,8,14,0.55)'; g.fill();
  g.lineWidth = 4 * k; g.strokeStyle = 'rgba(5,6,8,0.75)'; g.stroke();
  g.lineWidth = 2 * k; g.strokeStyle = '#f3cf86'; g.stroke();
  g.save(); g.translate(x, y); g.rotate(yaw); g.scale(k, k);
  g.beginPath(); g.moveTo(0, -10); g.lineTo(7, 8); g.lineTo(0, 3.5); g.lineTo(-7, 8); g.closePath();
  g.fillStyle = '#f8f1de'; g.fill(); g.lineWidth = 1.5; g.lineJoin = 'miter'; g.strokeStyle = INK; g.stroke();
  g.restore();
}
/** A haunt's square: washed red while she sails; hatched and dashed grey while she lies sunk. */
function paintHaunt(g, t) {
  g.fillStyle = t.sails ? 'rgba(224,83,63,0.16)' : 'rgba(150,150,175,0.06)';
  g.fillRect(t.x - t.r, t.y - t.r, 2 * t.r, 2 * t.r);
  if (!t.sails) hatch(g, t.x - t.r, t.y - t.r, t.x + t.r, t.y + t.r, 'rgba(170,170,190,0.14)', 8);
  g.setLineDash(t.sails ? [] : [5, 4]); g.lineWidth = 2;
  g.strokeStyle = t.sails ? 'rgba(232,96,74,0.9)' : 'rgba(175,175,195,0.6)';
  g.strokeRect(t.x - t.r, t.y - t.r, 2 * t.r, 2 * t.r);   // AUDIT CAPTAIN'S SEA X13: a haunt is a square
  g.setLineDash([]); g.lineWidth = 1;
}
/** A key's mark, on a canvas of its own, about its middle. */
function paintKey(g, what, x, y) {
  if (what === 'ship') paintShip(g, x, y, Math.PI / 4, 0.55);
  else if (what === 'haunt' || what === 'sunk') paintHaunt(g, { x, y, r: 6, sails: what === 'haunt' });
  else paintMark(g, what, x, y, what === 'port' ? 4.5 : 4);
}

/**
 * THE CHART DRAWN, back to front: the world's edge, the depths and the grid, the Veil and the bands' bounds, the haunts,
 * the isles' lands, the bearing, their marks, the ship, the ring on the isle named - then every word, last, so no mark
 * crosses one: the names, the bands', the haunts', the Veil's, the named isle's card, the ship's pointer, the scale.
 * @param {CanvasRenderingContext2D} g @param {ReturnType<typeof chartModel>} m @param {number} w @param {number} h
 */
export function paintChart(g, m, w, h) {
  const [bx0, by0, , by1] = m.edge;
  const sea = [Math.max(0, bx0), Math.max(0, by0), w, Math.min(h, by1)];   // east of the box the Veil runs on
  if (sea[0] > 0 || sea[1] > 0 || sea[3] < h) { g.fillStyle = VOID_TONE; g.fillRect(0, 0, w, h); hatch(g, 0, 0, w, h, 'rgba(120,140,170,0.12)', 10); }
  g.save();
  g.beginPath(); g.rect(sea[0], sea[1], sea[2] - sea[0], sea[3] - sea[1]); g.clip();
  g.fillStyle = DEPTH_TONES.shallows; g.fillRect(0, 0, w, h);
  for (const d of m.depths) { g.fillStyle = DEPTH_TONES[d.id] ?? DEPTH_TONES.abyss; g.fillRect(d.x0, 0, d.x1 - d.x0, h); }
  g.strokeStyle = 'rgba(160,195,235,0.09)'; g.lineWidth = 1; g.beginPath();
  for (const x of m.grid.xs) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, h); }
  for (const y of m.grid.ys) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(w, Math.round(y) + 0.5); }
  g.stroke();
  if (m.veil != null) {
    const veil = g.createLinearGradient(m.veil, 0, Math.max(w, m.veil + 1), 0);
    veil.addColorStop(0, 'rgba(170,140,255,0.16)'); veil.addColorStop(1, 'rgba(205,185,255,0.42)');
    g.fillStyle = veil; g.fillRect(m.veil, 0, w - m.veil, h);
    g.strokeStyle = 'rgba(215,200,255,0.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(Math.round(m.veil), 0); g.lineTo(Math.round(m.veil), h); g.stroke(); g.lineWidth = 1;
  }
  g.strokeStyle = 'rgba(170,205,240,0.4)'; g.setLineDash([6, 5]);
  for (const b of m.bands) if (b.line) { g.beginPath(); g.moveTo(Math.round(b.x) + 0.5, 0); g.lineTo(Math.round(b.x) + 0.5, h); g.stroke(); }
  g.setLineDash([]);
  g.restore();
  for (const t of m.haunts) paintHaunt(g, t);
  // the isles' lands, once a land outgrows its mark - the isle's own size at the zoom
  for (const i of m.isles) {
    if (i.land < i.icon * 1.6) continue;
    const c = KIND_COLOURS[i.kind] ?? KIND_COLOURS.rock;
    g.beginPath(); g.arc(i.x, i.y, i.land, 0, TAU); g.fillStyle = tint(c, 0.16); g.fill(); g.strokeStyle = tint(c, 0.55); g.lineWidth = 1; g.stroke();
  }
  const s = m.ship, p = m.pick;
  if (p) { g.setLineDash([3, 4]); g.strokeStyle = 'rgba(243,207,134,0.8)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(p.x, p.y); g.stroke(); g.setLineDash([]); g.lineWidth = 1; }
  for (const i of m.isles) {
    paintMark(g, i.kind, i.x, i.y, i.icon);
    if (i.home) { g.beginPath(); g.arc(i.x, i.y, i.icon + 3.5, 0, TAU); g.lineWidth = 1.5; g.strokeStyle = KIND_COLOURS.port; g.stroke(); g.lineWidth = 1; }
  }
  if (s.on) paintShip(g, s.x, s.y, s.yaw);
  if (p) {
    g.beginPath(); g.arc(p.x, p.y, p.r + 5, 0, TAU);
    g.lineWidth = 4; g.strokeStyle = 'rgba(5,6,8,0.8)'; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.stroke(); g.lineWidth = 1;
  }
  // every word, last
  g.textBaseline = 'middle';
  track(g, CHART_TRACKING);
  g.font = CHART_FONT.small;
  for (const b of m.bands) {
    if (!b.box) continue;
    plate(g, b.box[0] - 6, b.box[1] - 2, b.box[2] + 6, b.box[3] + 2);
    g.fillStyle = '#b8cee8'; g.textAlign = 'right'; g.fillText(b.name.toUpperCase(), Math.round(b.box[2]), Math.round((b.box[1] + b.box[3]) / 2));
  }
  for (const t of m.haunts) {
    if (!t.at || !t.box) continue;
    const [x, y] = t.at;
    if (!t.inside) { g.font = CHART_FONT.name; halo(g, t.name, x, y, t.sails ? '#ffab98' : '#c4c4d0', 'center'); continue; }
    plate(g, t.box[0], t.box[1], t.box[2], t.box[3], t.sails ? 'rgba(232,96,74,0.7)' : 'rgba(175,175,195,0.45)');
    g.textAlign = 'left';
    g.font = CHART_FONT.name; g.fillStyle = t.sails ? '#ffab98' : '#c4c4d0'; g.fillText(t.name, Math.round(x), Math.round(y + 6));
    g.font = CHART_FONT.small; g.fillStyle = t.sails ? '#e0a194' : '#9c9cab'; g.fillText(t.sub, Math.round(x), Math.round(y + 20));
  }
  g.font = CHART_FONT.name;
  for (const i of m.isles) if (i.label && i.box) halo(g, capFirst(i.name), i.box[0], (i.box[1] + i.box[3]) / 2, i.kind === 'port' ? '#f6e2b0' : '#e2dccf');
  if (m.veilLabel) {
    g.save(); g.translate(Math.round(m.veilLabel.x), Math.round(m.veilLabel.y)); g.rotate(-Math.PI / 2);
    g.font = CHART_FONT.name; halo(g, VEIL_WORDS, 0, 0, '#ece4ff', 'center'); g.restore();
  }
  if (p) {
    g.font = CHART_FONT.name; const tw = g.measureText(p.title).width;
    g.font = CHART_FONT.small; const sw = g.measureText(p.words).width;
    const cw = Math.max(tw, sw) + 16, ch = 36;
    const x0 = Math.max(4, Math.min(w - cw - 4, p.x + p.r + 10)), y0 = Math.max(BAND_ROW, Math.min(h - ch - 4, p.y - p.r - 10 - ch));
    plate(g, x0, y0, x0 + cw, y0 + ch, 'rgba(243,207,134,0.75)');
    g.textAlign = 'left';
    g.font = CHART_FONT.name; g.fillStyle = '#f6e2b0'; g.fillText(p.title, x0 + 8, y0 + 11);
    g.font = CHART_FONT.small; g.fillStyle = '#d8cfae'; g.fillText(p.words, x0 + 8, y0 + 26);
  }
  if (!s.on && s.edge) {
    const e = s.edge;
    g.save(); g.translate(e.x, e.y); g.rotate(e.a);
    g.beginPath(); g.moveTo(14, 0); g.lineTo(-6, -9); g.lineTo(-2, 0); g.lineTo(-6, 9); g.closePath();
    g.fillStyle = '#f3cf86'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 1;
    g.restore();
    const words = `Your ship - ${s.way}`;
    g.font = CHART_FONT.small; const tw = g.measureText(words).width;
    const lx = Math.max(10, Math.min(w - tw - 10, e.x - Math.cos(e.a) * 26 - tw / 2)), ly = Math.max(BAND_ROW + 4, Math.min(h - 14, e.y - Math.sin(e.a) * 24));
    plate(g, lx - 6, ly - 9, lx + tw + 6, ly + 9, 'rgba(243,207,134,0.75)');
    g.textAlign = 'left'; g.fillStyle = '#f3cf86'; g.fillText(words, Math.round(lx), Math.round(ly));
  }
  const sc = m.scale, sx0 = 14, sy0 = h - 14;
  g.font = CHART_FONT.small; const sw = g.measureText(sc.words).width;
  plate(g, sx0 - 8, sy0 - 22, sx0 + Math.max(sc.px, sw) + 8, sy0 + 7);
  g.strokeStyle = '#d8cfae'; g.lineWidth = 2; g.beginPath();
  g.moveTo(sx0, sy0 - 4); g.lineTo(sx0, sy0); g.lineTo(sx0 + sc.px, sy0); g.lineTo(sx0 + sc.px, sy0 - 4); g.stroke(); g.lineWidth = 1;
  g.textAlign = 'left'; g.fillStyle = '#d8cfae'; g.fillText(sc.words, sx0, sy0 - 12);
  track(g, '0px');
}

/** @param {string} tag @param {string|null} [cls] @param {string|null} [text] */
const el = (tag, cls = null, text = null) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/**
 * THE WINDOW: `{ repaint, unmount }`.
 * @param {HTMLElement} host @param {{ word: () => any, onExit?: (reason?: string) => void }} deps
 */
export function mountEtherChartWindow(host, deps) {
  injectEnhancedStyle();
  injectEnhancedFonts();
  injectNavalWindowStyle();
  injectNavalKit(document);
  const exit = (reason = 'close') => deps.onExit?.(reason);
  const shell = el('div', 'dfnaval-shell');
  shell.setAttribute('role', 'dialog');
  shell.setAttribute('aria-label', 'A chart of the Etheric Sea');
  const win = el('div', 'dfnaval-win');
  win.style.width = 'min(96vw, 1100px)';
  win.style.maxWidth = '96vw';
  shell.append(win);
  const head = el('header', 'dfnaval-winhead');
  const title = el('div', 'dfnaval-wintitle');
  const h2 = el('h2');
  const sub = el('p', 'dfnaval-winsub');
  const noteLine = el('p', 'dfnaval-note');
  noteLine.setAttribute('aria-live', 'polite');
  noteLine.style.cssText = 'line-height:1.25;min-height:1.25em';   // ETHER-CHART2: its line kept - a name said grew the head and slid the chart under the pointer
  title.append(h2, sub, noteLine);
  const close = /** @type {HTMLButtonElement} */ (el('button', 'dfnaval-btn dfnaval-close', 'Close'));
  close.type = 'button';
  close.style.minWidth = '0';
  close.style.flex = '0 0 auto';   // ETHER-CHART2: the sheet's narrow rule grows every button to a row; the title keeps its room
  close.addEventListener('click', () => exit('close'));
  head.append(title, close);
  const canvas = /** @type {HTMLCanvasElement} */ (el('canvas'));
  canvas.style.cssText = `display:block;width:100%;height:min(64vh,640px);border-radius:3px;cursor:grab;touch-action:none;background:${DEPTH_TONES.reaches}`;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'A chart of the Etheric Sea: your ship, the isles you have charted, the depths, the Veil and the legends\' haunts');
  const hint = el('p', 'dfnaval-lede', 'Drag or the arrows to pan - the wheel, a pinch or + and - to zoom - C finds your ship - point at or tap an isle to name it.');
  // AUDIT CAPTAIN'S SEA X6: the window's own presses - a finger and a pad's cursor zoom and find the ship by them
  const tools = el('div', 'dfnaval-chart-tools');
  tools.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;flex:0 0 auto';
  const tool = (label, fn) => { const b = /** @type {HTMLButtonElement} */ (el('button', 'dfnaval-btn', label)); b.type = 'button'; b.style.minWidth = '0'; b.addEventListener('click', () => { fn(); draw(); }); tools.append(b); return b; };
  // ETHER-CHART2: the key - each mark drawn by the chart's own painter beside its word
  const key = el('div', 'dfnaval-chart-key');
  key.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;flex:1 1 320px;font-size:12px;color:#c9bfa4';
  const dpr0 = Math.max(1, Math.min(3, globalThis.devicePixelRatio || 1));
  for (const [what, words] of CHART_KEY) {
    const item = el('span');
    item.style.cssText = 'display:inline-flex;align-items:center;gap:6px;white-space:nowrap';
    const c = /** @type {HTMLCanvasElement} */ (el('canvas'));
    c.width = c.height = Math.round(18 * dpr0);
    c.style.cssText = 'width:18px;height:18px;flex:0 0 auto';
    c.setAttribute('aria-hidden', 'true');
    const kg = c.getContext('2d');
    if (kg) { kg.setTransform(dpr0, 0, 0, dpr0, 0, 0); paintKey(kg, what, 9, 9); }
    item.append(c, el('span', null, words));
    key.append(item);
  }
  const foot = el('div', 'dfnaval-chart-foot');
  foot.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;margin-top:8px';
  foot.append(key, tools);
  const body = el('div', 'dfnaval-winbody');
  body.append(canvas, foot, hint);
  win.append(head, body);
  host.append(shell);

  let alive = true;
  let word = deps.word();
  /** @type {ChartView} */
  let view = clampChartView({ cx: word.px + 0.5, cy: word.py + 0.5, zoom: CHART_ZOOM_DEFAULT });
  let model = null;
  /** ETHER-CHART2: the isle named - by a pointer over it, or a tap - ringed, its bearing and its card drawn. @type {string|null} */
  let pick = null;
  const size = () => { const r = canvas.getBoundingClientRect(); return [Math.max(1, r.width), Math.max(1, r.height)]; };
  const zoomMid = (dir) => { const [w, h] = size(); view = chartZoomAt(view, dir, w / 2, h / 2, w, h); };
  const toShip = () => { view = clampChartView({ ...view, cx: word.px + 0.5, cy: word.py + 0.5 }); };
  tool('-', () => zoomMid(-1)); tool('+', () => zoomMid(1)); tool('Ship', toShip);
  const [zoomOut, zoomIn, shipBtn] = /** @type {HTMLButtonElement[]} */ ([...tools.children]);
  zoomOut.setAttribute('aria-label', 'Zoom out'); zoomIn.setAttribute('aria-label', 'Zoom in'); shipBtn.setAttribute('aria-label', 'Find your ship');
  for (const b of [zoomOut, zoomIn, shipBtn]) { b.style.flex = '0 0 auto'; b.style.minWidth = '44px'; }
  const g = canvas.getContext('2d');
  /** A name's width in a face, the canvas's own measure (FONT3's tracking on). */
  const measure = (t, font) => { if (!g) return t.length * LABEL_CHAR_PX; g.font = font; track(g, CHART_TRACKING); return g.measureText(t).width; };

  function draw() {
    if (!alive) return;
    const [w, h] = size();
    const dpr = Math.max(1, Math.min(3, globalThis.devicePixelRatio || 1));
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    model = chartModel(word, view, w, h, { measure, pick });
    h2.textContent = model.title;
    sub.textContent = model.sub;
    zoomOut.disabled = view.zoom === 0;
    zoomIn.disabled = view.zoom === CHART_ZOOMS.length - 1;
    paintChart(g, model, w, h);
  }
  /** What lies under a canvas point: the nearest isle drawn within its reach and a little. */
  function isleUnder(sx, sy) {
    let best = null, bd = Infinity;
    for (const i of model?.isles ?? []) { const d = Math.hypot(i.x - sx, i.y - sy); if (d <= i.r + 6 && d < bd) { bd = d; best = i; } }
    return best ? isleByKey(best.key) : null;
  }
  const local = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const note = (x, y) => {
    const isle = isleUnder(x, y);
    noteLine.textContent = isle ? isleWords(isle, { px: word.px + 0.5, py: word.py + 0.5 }) : '';
    const named = isle?.key ?? null;
    if (named !== pick) { pick = named; draw(); }
  };
  // AUDIT CAPTAIN'S SEA X6/X7: THE PRESSES BY POINTER - one pans (a finger, a pen, the mouse's first button alone), two
  // pinch the zoom about their middle, a press that never moved is a tap (an isle named); a drag ends however its press
  // ends - let go anywhere, the capture lost, the button no longer held (a right-click's menu ate its release, a pad's
  // cursor let go over another element, and the chart panned on with no button held)
  const downs = new Map();   // pointerId -> [x, y] now
  let drag = null, pinch = null;
  const endDrag = (e) => {
    if (e?.pointerId != null) downs.delete(e.pointerId);
    if (downs.size < 2) pinch = null;
    if (!downs.size) { drag = null; canvas.style.cursor = 'grab'; }
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    downs.set(e.pointerId, local(e));
    canvas.setPointerCapture?.(e.pointerId);
    canvas.style.cursor = 'grabbing';
    if (downs.size === 1) drag = { at: local(e), view, moved: false };
    else if (downs.size === 2) { const [a, b] = [...downs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1 }; drag = null; }
  });
  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = local(e);
    if (drag && e.pointerType === 'mouse' && !(e.buttons & 1)) endDrag(e);
    if (downs.has(e.pointerId)) downs.set(e.pointerId, [x, y]);
    if (pinch && downs.size >= 2) {
      const [a, b] = [...downs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
      const step = d / pinch.d >= CHART_PINCH_STEP ? 1 : pinch.d / d >= CHART_PINCH_STEP ? -1 : 0;
      if (step) { const [w, h] = size(); view = chartZoomAt(view, step, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, w, h); pinch.d = d; draw(); }
      return;
    }
    if (drag) {
      if (Math.hypot(x - drag.at[0], y - drag.at[1]) > CHART_TAP_PX) drag.moved = true;
      if (!drag.moved) return;
      const k = CHART_ZOOMS[view.zoom];
      view = clampChartView({ zoom: drag.view.zoom, cx: drag.view.cx - (x - drag.at[0]) / k, cy: drag.view.cy - (y - drag.at[1]) / k });
      draw();
      return;
    }
    if (e.pointerType === 'mouse') note(x, y);
  });
  canvas.addEventListener('pointerup', (e) => { if (drag && !drag.moved && downs.size === 1) note(...local(e)); endDrag(e); });
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  // ETHER-CHART2: a mouse gone off the chart names nothing (a tap's naming stands until the next tap)
  canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !downs.size && pick) { pick = null; noteLine.textContent = ''; draw(); } });
  // AUDIT CAPTAIN'S SEA X18: the wheel's travel gathered, a step each CHART_WHEEL_STEP of it (a notch is one; a trackpad's brush
  // is many small events)
  let wheelAcc = 0;
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelAcc += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
    if (Math.abs(wheelAcc) < CHART_WHEEL_STEP) return;
    const dir = -Math.sign(wheelAcc);
    wheelAcc = 0;
    const [x, y] = local(e); const [w, h] = size();
    view = chartZoomAt(view, dir, x, y, w, h); draw();
  }, { passive: false });
  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // AUDIT CAPTAIN'S SEA X8: the key that opened it shuts it - the travel map's or the map's, by binding (heldMap.js
    // EM-BUG2's law); V opened it and did nothing, a rebound map key was ignored
    const acts = actionsForCode(bindings(), e.code);
    if (overlayAction(e) === 'back' || acts.includes('TravelMap') || acts.includes('AutoMap')) { e.preventDefault(); e.stopPropagation(); exit('close'); return; }
    const [w, h] = size();
    const k = CHART_ZOOMS[view.zoom];
    const pan = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.code];
    if (pan) { view = clampChartView({ ...view, cx: view.cx + (pan[0] * PAN_STEP) / k, cy: view.cy + (pan[1] * PAN_STEP) / k }); }
    else if (e.code === 'Equal' || e.code === 'NumpadAdd') view = chartZoomAt(view, 1, w / 2, h / 2, w, h);
    else if (e.code === 'Minus' || e.code === 'NumpadSubtract') view = chartZoomAt(view, -1, w / 2, h / 2, w, h);
    else if (e.code === 'KeyC') toShip();
    else return;
    e.preventDefault(); e.stopPropagation();
    draw();
  };
  globalThis.addEventListener('keydown', onKey, { capture: true });
  const offOutside = closeOnOutsideTap(shell, '.dfnaval-win', () => exit('close'));
  const onResize = () => draw();
  globalThis.addEventListener('resize', onResize);
  draw();
  // ETHER-CHART2: the words are lettered in the web face; the first paint may run before it lands, so the chart is
  // painted again when it does (heldMap.js's law for its ink)
  try {
    const fonts = document.fonts;
    const landed = () => draw();
    fonts?.load?.(CHART_FONT.name)?.then?.(landed, () => {});
    fonts?.ready?.then?.(landed);
  } catch { /* no font set */ }
  close.focus?.({ preventScroll: true });
  return {
    repaint: () => { word = deps.word(); draw(); },
    unmount() {
      if (!alive) return;
      alive = false;
      globalThis.removeEventListener('keydown', onKey, { capture: true });
      globalThis.removeEventListener('resize', onResize);
      offOutside();
      shell.remove();
    },
  };
}
