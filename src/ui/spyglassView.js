// @ts-check
// SPYGLASS (2026-10-11, the owner: "a spyglass option where you can aim and view to observe other ships, their
// allegiance, cargo, etc." - bible/03-World/Captains-Sea.md) - THE GLASS'S WINDOW. While the glass is up the world is
// seen through it: the view narrowed to its magnification (scenes/world.js glassFov), the edge of the view the dark of
// its tube, a reticle at its heart - and under the reticle, the card of the ship it holds (scenes/navalHost.js glass:
// systems/naval/shipKnowledge.js glassCard), her name toned by what she is to me, her rows as far as she is made out,
// and the study's bar filling while the glass is held on her. A DOM overlay over the world, under every window.

import { PIXEL_FONT_CSS } from './pixelifyFive.js';
import { injectEnhancedFonts } from './enhancedStyle.js';

export const SPYGLASS_STYLE_ID = 'dfglass-style';
/** The glass's own field: the share of the view's shorter side its circle spans. */
export const GLASS_FIELD = 0.92;
/** The tones a card's name wears, by `tone` (glassCard's). */
export const GLASS_TONES = Object.freeze({ hostile: '#e8705e', pirate: '#d9a05a', friendly: '#9fd69a', neutral: '#e6dcb8', unknown: '#b8c2ca' });

const CSS = `
.dfglass { position: fixed; inset: 0; pointer-events: none; z-index: 4; ${PIXEL_FONT_CSS} color: #e6dcb8; --g-scale: 1; }
.dfglass-tube { position: absolute; inset: 0;
  background: radial-gradient(circle closest-side at 50% 50%, rgba(5,6,8,0) 0, rgba(5,6,8,0) ${Math.round(GLASS_FIELD * 100) - 4}%, rgba(5,6,8,0.86) ${Math.round(GLASS_FIELD * 100)}%, #050608 ${Math.round(GLASS_FIELD * 100) + 3}%); }
.dfglass-ring { position: absolute; left: 50%; top: 50%; width: ${GLASS_FIELD * 100}vmin; height: ${GLASS_FIELD * 100}vmin; transform: translate(-50%, -50%);
  border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(201,162,92,0.55), inset 0 0 6vmin rgba(5,6,8,0.55); }
.dfglass-hair { position: absolute; background: rgba(230,220,184,0.7); box-shadow: 0 0 0 1px rgba(5,6,8,0.35); }
.dfglass-hair.h { height: 1px; top: 50%; }
.dfglass-hair.v { width: 1px; left: 50%; }
.dfglass-hair.l { left: calc(50% - 30vmin); width: 27vmin; }
.dfglass-hair.r { left: calc(50% + 3vmin); width: 27vmin; }
.dfglass-hair.t { top: calc(50% - 30vmin); height: 27vmin; }
.dfglass-hair.b { top: calc(50% + 3vmin); height: 27vmin; }
.dfglass-pip { position: absolute; left: 50%; top: 50%; width: 1.6vmin; height: 1.6vmin; transform: translate(-50%, -50%); border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(230,220,184,0.8); }
.dfglass.held .dfglass-pip { box-shadow: 0 0 0 2px rgba(230,220,184,0.95); }
.dfglass-card { position: absolute; left: 50%; top: calc(50% + 8vmin); width: max(260px, 40vmin); transform: translateX(-50%) scale(var(--g-scale)); transform-origin: 50% 0;
  background: rgba(10,12,16,0.72); border: 1px solid rgba(201,162,92,0.55); padding: 8px 10px 9px; text-shadow: 1px 1px 0 #050608; }
.dfglass-title { display: block; font-size: 17px; line-height: 1.15; }
.dfglass-sub { display: block; font-size: 12px; opacity: 0.8; margin-top: 2px; }
.dfglass-study { display: block; height: 3px; margin: 6px 0 4px; background: rgba(230,220,184,0.15); }
.dfglass-study i { display: block; height: 100%; width: 0; background: #c9a25c; }
.dfglass-rows { display: grid; grid-template-columns: auto 1fr; column-gap: 10px; row-gap: 2px; font-size: 12px; margin-top: 4px; }
.dfglass-rows b { font-weight: normal; opacity: 0.7; }
.dfglass-hint { display: block; font-size: 12px; margin-top: 6px; color: #c9a25c; }
.dfglass-foot { position: absolute; left: 50%; bottom: calc(50% - ${GLASS_FIELD * 50}vmin + 2vmin); transform: translateX(-50%) scale(var(--g-scale)); transform-origin: 50% 100%;
  font-size: 12px; text-align: center; white-space: nowrap; text-shadow: 1px 1px 0 #050608; opacity: 0.85; }
`;

/** The glass's lens eases to its magnification (and home) over about this long (s). */
export const GLASS_EASE_S = 0.12;
/** The lens a frame eases to: `lens` toward `want` (1: no glass) over GLASS_EASE_S, snapped home within a hair. */
export function easeLens(lens, want, dt) {
  const next = lens + (want - lens) * (1 - Math.exp(-Math.max(0, dt) / GLASS_EASE_S));
  return Math.abs(want - next) < 0.01 ? want : next;
}
/** The vertical field of view through the glass (radians): the lens's magnification is the tangent's - a glass of x4
 *  shows a quarter of the height the eye does. No glass (`lens` 1), the field as it is. */
export const glassFov = (fov, lens) => (lens > 1 ? 2 * Math.atan(Math.tan(fov / 2) / lens) : fov);
/** The look's speed under the glass: slowed by its magnification, so a ship held at x8 does not fly off the reticle. */
export const glassLookScale = (lens) => 1 / Math.max(1, lens);

/**
 * The words the glass's foot says: its magnification and the presses that turn it and lower it.
 * @param {{ zoom?: number, keys?: { glass?: string|null }, touch?: boolean, pad?: boolean }} [o]
 */
export function glassFootWords({ zoom = 4, keys = {}, touch = false, pad = false } = {}) {
  const lower = touch ? 'Glass: lower it' : keys.glass ? `${keys.glass}: lower the glass` : 'Lower the glass';
  return [`x${Math.round(zoom)}`, touch || pad ? null : 'Wheel: magnify', lower].filter(Boolean).join(' - ');
}

let root = null, parts = null;
const said = new Map();
const set = (key, v, write) => { if (said.get(key) !== v) { said.set(key, v); write(v); } };
function el(doc, tag, cls) { const n = doc.createElement(tag); if (cls) n.className = cls; return n; }
function build(doc) {
  if (doc.head && !doc.getElementById?.(SPYGLASS_STYLE_ID)) {
    const st = el(doc, 'style', null);
    st.id = SPYGLASS_STYLE_ID;
    st.textContent = CSS;
    doc.head.append(st);
    injectEnhancedFonts(doc);
  }
  root = el(doc, 'div', 'dfglass');
  root.setAttribute?.('aria-hidden', 'true');
  const tube = el(doc, 'div', 'dfglass-tube'), ring = el(doc, 'div', 'dfglass-ring'), pip = el(doc, 'div', 'dfglass-pip');
  const hairs = ['h l', 'h r', 'v t', 'v b'].map((k) => el(doc, 'div', `dfglass-hair ${k}`));
  const card = el(doc, 'div', 'dfglass-card'), title = el(doc, 'span', 'dfglass-title'), sub = el(doc, 'span', 'dfglass-sub');
  const study = el(doc, 'span', 'dfglass-study'), fill = el(doc, 'i', null), rows = el(doc, 'div', 'dfglass-rows'), hint = el(doc, 'span', 'dfglass-hint');
  study.append(fill);
  card.append(title, sub, study, rows, hint);
  const foot = el(doc, 'div', 'dfglass-foot');
  root.append(tube, ring, ...hairs, pip, card, foot);
  (doc.body ?? doc.documentElement)?.append(root);
  parts = { card, title, sub, study, fill, rows, hint, foot };
}

/**
 * The glass's window this frame: `model` null (the glass down - the window hidden), else `{ card, zoom }` - the card of
 * the ship the glass holds (null: none) and its magnification. `keys.glass` the press that lowers it, `scale` the HUD's.
 * @param {{ card: any, zoom: number } | null} model
 * @param {{ doc?: any, keys?: { glass?: string }, scale?: number, touch?: boolean, pad?: boolean, covered?: boolean }} [o]
 */
export function drawSpyglass(model, { doc = globalThis.document, keys = {}, scale = 1, touch = false, pad = false, covered = false } = {}) {
  const on = !!model && !covered;
  if (!root) {
    if (!on || !doc?.createElement) return;
    build(doc);
  }
  set('on', on, (v) => { root.style.display = v ? '' : 'none'; });
  if (!on) return;
  set('scale', String(scale), (v) => { root.style.setProperty?.('--g-scale', v); });
  const c = model.card;
  set('held', !!c, (v) => { root.className = v ? 'dfglass held' : 'dfglass'; parts.card.style.display = v ? '' : 'none'; });
  set('foot', glassFootWords({ zoom: model.zoom, keys, touch, pad }), (v) => { parts.foot.textContent = v; });
  if (!c) return;
  set('title', c.title, (v) => { parts.title.textContent = v; });
  set('tone', GLASS_TONES[c.tone] ?? GLASS_TONES.neutral, (v) => { parts.title.style.color = v; });
  set('sub', c.sub ?? '', (v) => { parts.sub.textContent = v; });
  const study = Math.max(0, Math.min(1, Number(c.study) || 0));
  set('studying', study < 1, (v) => { parts.study.style.display = v ? '' : 'none'; });
  set('study', Math.round(study * 100), (v) => { parts.fill.style.width = `${v}%`; });
  set('rows', JSON.stringify(c.rows ?? []), () => {
    parts.rows.textContent = '';
    for (const [label, text] of c.rows ?? []) {
      const b = el(doc, 'b', null), s = el(doc, 'span', null);
      b.textContent = label;
      s.textContent = text;
      parts.rows.append(b, s);
    }
  });
  set('hint', c.hint ?? '', (v) => { parts.hint.textContent = v; parts.hint.style.display = v ? '' : 'none'; });
}
