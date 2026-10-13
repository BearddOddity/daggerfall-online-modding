// CARDS-PLUS (2026-10-13, bible/11-Multiplayer/Tavern-Cards.md section 38; the owner: "Lets improve the illiac bay
// minigame visuals and ensure the general card UI uses enhanced plus and our fonts. Currently it doesnt"): THE CARD UI IN
// THE STONE-AND-BRASS KIT AND THE GAME'S FACE, AND ILIAC HAND'S TABLE MADE TO READ AS A GAME.
//
// The roles (ui/enhancedFrame.js FRAME_ROLES) name the two table panels and the Collections page's controls; the panels'
// own sheets write the pixel face on their roots and no serif; on the classic skin a panel lays the kit cut to the panels
// and asks for the face; every class word either panel paints - read off the REAL painters over every phase - is styled
// by no rule from outside them in any sheet the game injects (test/sheetRules.mjs, HUD-CLASS's own reader); Iliac Hand's
// model says who holds each holding, the room left each side, the end and the line's tone; its painted panel draws the
// track, the gems, the backs, the plates, the empty places, the hand at its tile size, the verdict, the fold and a log a
// line a sentence; the binder's face copy; the Collections sheets leave the paint to the kit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FRAME_ROLES, FRAME_CSS, frameCss } from '../src/ui/enhancedFrame.js';
import { PLUS_CSS, STONE_DIM, STONE_WORD } from '../src/ui/enhancedPlusStyle.js';
import { PIXEL_FONT_CSS, PIXELIFY_FIVE_FACE } from '../src/ui/pixelifyFive.js';
import { cardPanelChromeCss, cardKitCss, dressCardPanel, isCardPanelSelector, CARD_KIT_STYLE_ID } from '../src/ui/cardPanelKit.js';
import { createCardTableHud, cardHudModel, CARD_TABLE_CSS } from '../src/ui/cardTableHud.js';
import { createIliacTableHud, iliacHudModel, holdingLead, iliacOutcome, VERDICT_WORDS, stagedRefusal, ILIAC_TABLE_CSS, ILIAC_HAND_CARD_H, ILIAC_LANE_CARD_H, ILIAC_PLACE_CARD_H } from '../src/ui/iliacTableHud.js';
import { cardCanvas, cardCanvasCopy, _clearCardFacesForTests, CARD_BINDER_CSS } from '../src/ui/cardBinderPage.js';
import { COLLECTION_PAGE_CSS } from '../src/ui/collectionsPage.js';
import { ILIAC_TILE_MAX_H } from '../src/render/iliacCardFaces.js';
import { STARTER_DECK, cardById } from '../src/net/iliacCards.js';
import { newGame, commit, reveal, iliacView, legalPlays, ILIAC_HAND_MAX, ILIAC_MAGICKA_MAX } from '../src/net/iliacHand.js';
import { IliacTableSession } from '../src/systems/iliacTableSession.js';
import { patronDeck, patronPlays, seededUnit } from '../src/systems/iliacPatrons.js';
import { CardTableSession } from '../src/systems/cardTableSession.js';
import { setPref, _resetForTests as resetPrefs } from '../src/systems/uiPrefs.js';
import { uiSheetRules, collisions } from './sheetRules.mjs';
import { fakeDoc, all, text } from './decorFakes.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const src32 = (seed) => { const u = seededUnit(seed); return () => Math.floor(u() * 4294967296); };
const every = (n, out = []) => { out.push(n); for (const c of n.children ?? []) every(c, out); return out; };
const classesIn = (n) => new Set(every(n).flatMap((x) => String(x.className ?? '').split(/\s+/).filter(Boolean)));
/** A sheet as rules: each rule's selectors and its body, comments out. */
const rules = (css) => [...css.replace(/\/\*[^]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sels: m[1].split(',').map((s) => s.trim()), body: m[2] }));

/** A page whose canvases paint: each canvas a recording 2D context (its scale, what it is drawn from). */
function paintingDoc() {
  const doc = fakeDoc();
  const make = doc.createElement;
  doc.createElement = (tag) => {
    const n = make(tag);
    if (tag === 'canvas') {
      n.ownerDocument = doc;   // the binder's cache keys its faces by their page
      n.log = { scale: [], drawn: [] };
      n.getContext = () => new Proxy({}, {
        get(_, k) {
          if (k === 'measureText') return (t) => ({ width: String(t).length * 5 });
          if (k === 'scale') return (x, y) => n.log.scale.push([x, y]);
          if (k === 'drawImage') return (src) => n.log.drawn.push(src);
          return () => {};
        },
        set() { return true; },
      });
    }
    return n;
  };
  return doc;
}

/** A real Iliac turn: the session's view, a play staged and another picked (magicka to spare, so both are lawful). */
function iliacTurn(seed = 31) {
  const s = new IliacTableSession({ player: { id: 'you', name: 'Ves', deck: STARTER_DECK.slice() }, patron: { id: 'regular:2', name: 'Ana', temper: 'tight', grade: 1, deck: patronDeck(3, 'tight', 1) }, rand32: src32(seed), now: 0 });
  s.state.players[0].magicka = 10;
  const v = s.view();
  const plays = legalPlays(s.state, 0);
  const staged = plays.slice(0, 1);
  const pick = plays.find((p) => p.card !== staged[0].card && stagedRefusal(v, [...staged, p]) === null)?.card ?? null;
  return { s, v, staged, pick };
}

/** A whole game played out between two tempers (`turns` turns committed and revealed). */
function played(turns, seed = 7) {
  const st = newGame({ decks: [STARTER_DECK.slice(), STARTER_DECK.slice()], rand32: src32(seed) });
  const unit = seededUnit(seed + 1);
  for (let t = 1; t <= turns; t++) { for (const pl of [0, 1]) commit(st, pl, patronPlays(st, pl, pl ? 'loose' : 'tight', 1, unit)); reveal(st); }
  return st;
}

test('CARDS-PLUS the kit names the card UI: both table panels a carved window, a seat and a holding its panels, their presses the kit\'s buttons (the deal, the check and the call, the commit and the next game in brass; Iliac Hand\'s concession edged in blood), the setup\'s choices tiles, the board, the hand and the season\'s board wells, the pot and a holding\'s power chips, their header bands, their logs under a rule - each with a leading body (their sheets land after the kit) - and the Collections page\'s switch, filters, chips, codex rows, decks and deck name; the Plus sheet and the classic cut carry each (mutants: a role dropped)', () => {
  const want = {
    window: ['body .dfcards', 'body .dfiliac'],
    panel: ['body .dfcards .seat', 'body .dfiliac .hold', '.px-sys .binder-deck'],
    button: ['body .dfcards button', 'body .dfcards .fold', 'body .dfiliac button', 'body .dfiliac .fold'],
    primary: ['body .dfcards button[data-kind="primary"]', 'body .dfiliac button[data-kind="primary"]'],
    warn: ['body .dfiliac button[data-kind="warn"]'],
    tile: ['body .dfiliac .opt', '.px-sys .coll-part', '.px-sys .binder-filter', '.px-sys .binder-chip'],
    chip: ['body .dfcards .pot', 'body .dfiliac .pw'],
    well: ['body .dfcards .board', 'body .dfiliac .tray', 'body .dfiliac .season', '.px-sys .binder-edit input'],
    input: ['.px-sys .binder-edit input'],
    header: ['body .dfcards .tablehead', 'body .dfiliac .tablehead'],
    ruleTop: ['body .dfcards .log', 'body .dfiliac .log'],
    listRow: ['.px-sys .codex-line'],
  };
  for (const [role, sels] of Object.entries(want)) for (const s of sels) assert.ok(FRAME_ROLES[role].includes(s), `${role}: ${s}`);
  const panelSels = Object.values(FRAME_ROLES).flat().filter(isCardPanelSelector);
  assert.ok(panelSels.length >= 20 && panelSels.every((s) => s.startsWith('body ')), 'every panel selector outweighs the panels\' own later sheets');
  assert.ok(PLUS_CSS.includes(FRAME_CSS), 'the kit rides the Plus sheet');
  const kit = rules(FRAME_CSS);
  const ruleOf = (sel, prop) => kit.find((r) => r.sels.includes(sel) && r.body.includes(prop));
  assert.ok(ruleOf('body .dfiliac', 'border-image:') && ruleOf('body .dfcards', 'border-image:'), 'the carved frame');
  assert.ok(ruleOf('body .dfiliac button[data-kind="warn"]', 'border-color: #e0584a'), 'the concession in blood');
  assert.ok(ruleOf('body .dfiliac .opt[aria-pressed="true"]', 'border-color: #f3cf86'), 'a chosen tile in brass');
  assert.ok(ruleOf('.px-sys .codex-line.on', 'box-shadow'), 'an opened codex row marked as the list marks one');
  assert.ok(kit.some((r) => r.sels.includes(':root[data-plus-theme="stone"] body .dfiliac .hold') && /background-color/.test(r.body)), 'each Plus colour grounds them too');
});

test('CARDS-PLUS the face: both panels\' sheets set the game\'s pixel face - the trio, its five - on their roots, and every press, slider and field takes it; no serif of their own anywhere in either module; the chrome is one home, its dim words lifted on Stone\'s light ground (mutants: Georgia back on the root; a press left in the browser\'s face; the Stone words unset)', () => {
  for (const [name, css, root] of [['Hold\'em', CARD_TABLE_CSS, '.dfcards'], ['Iliac Hand', ILIAC_TABLE_CSS, '.dfiliac']]) {
    assert.ok(css.startsWith(`\n${PIXELIFY_FIVE_FACE}`), `${name}: the five first`);
    const chrome = cardPanelChromeCss(root);
    assert.ok(css.includes(chrome), `${name}: the shared chrome, as built`);
    const r = rules(chrome);
    const rootRule = r.find((x) => x.sels.length === 1 && x.sels[0] === root);
    assert.ok(rootRule && rootRule.body.includes(PIXEL_FONT_CSS), `${name}: the face's trio on the root`);
    assert.ok(r.some((x) => x.sels.includes(`${root} button`) && /(^|;)\s*font: inherit;/.test(x.body)), `${name}: a press takes the face (a control keeps the browser's own unless told)`);
    assert.ok(r.some((x) => x.sels.includes(`:root[data-plus-theme="stone"] ${root}`) && x.body.includes(`--cp-dim: ${STONE_DIM};`) && x.body.includes(`--cp-word: ${STONE_WORD};`)), `${name}: Stone's dim words`);
    assert.doesNotMatch(css, /Georgia|serif/, `${name}: no serif of its own`);
  }
  for (const f of ['src/ui/cardTableHud.js', 'src/ui/iliacTableHud.js', 'src/ui/cardPanelKit.js']) assert.doesNotMatch(read(f).replace(/^\s*\/\/.*$/gm, ''), /Georgia/, f);
});

test('CARDS-PLUS the classic skin: a panel lays the kit cut to the two panels (once, whichever panel comes first) and asks for the game\'s face; on Enhanced Plus it lays no cut - the Plus sheet carries the kit (mutants: the cut never laid; the cut laid whole; the face never asked for)', () => {
  const cut = cardKitCss();
  const sels = rules(cut).flatMap((r) => r.sels).filter((s) => s && !/^(from|to|\d+%)$/.test(s));
  assert.ok(cut.length < frameCss().length && rules(cut).length * 3 < rules(frameCss()).length, 'a cut, not the kit');
  assert.ok(sels.length > 40 && sels.every(isCardPanelSelector), 'only the panels\' rules');
  assert.match(cut, /body \.dfcards,\nbody \.dfiliac \{\n {2}border-image:/, 'the carved frame');
  assert.match(cut, /body \.dfiliac button\[data-kind="warn"\] \{ border-color: #e0584a/, 'the blood edge');
  resetPrefs();
  try {
    setPref('skin', 'classic');
    const doc = fakeDoc();
    createCardTableHud({ onPress: () => {}, doc });
    createIliacTableHud({ onPress: () => {}, doc });
    const kits = doc.head.children.filter((c) => c.id === CARD_KIT_STYLE_ID);
    assert.equal(kits.length, 1, 'the cut, once');
    assert.equal(kits[0].textContent, cut);
    assert.equal(doc.head.children.filter((c) => c.id === 'dagger-enhanced-fonts' && c.tag === 'link').length, 1, 'the face asked for');
    setPref('skin', 'enhanced');
    const plus = fakeDoc();
    assert.equal(dressCardPanel(plus), false);
    createIliacTableHud({ onPress: () => {}, doc: plus });
    assert.equal(plus.head.children.filter((c) => c.id === CARD_KIT_STYLE_ID).length, 0, 'Plus: the kit is the Plus sheet\'s');
    assert.equal(plus.head.children.filter((c) => c.id === 'dagger-enhanced-fonts').length, 1, 'the face on every skin');
  } finally { resetPrefs(); }
});

test('CARDS-PLUS the words are their own: every class either panel paints - read off the real painters over every phase (Iliac Hand\'s setup with every choice and box, a turn with a card staged and one picked, its end; Hold\'em\'s buy-in, a hand under way, the fold) - is styled by no rule from outside the panels in any sheet the game injects; given the enhanced sheet\'s bare .card, .row, .note and .side back, the law finds them (mutants: the little card .card again; the duel\'s .side; a lane .row)', async () => {
  const words = new Set();
  const take = (root) => { for (const w of classesIn(root)) words.add(w); };
  for (const doc of [fakeDoc(), paintingDoc()]) {
    const ih = createIliacTableHud({ onPress: () => {}, doc });
    ih.render(iliacHudModel({ phase: 'setup', packPrice: 30, online: { rankedOn: true, rankedOk: false, rankedWhy: 'A guest has no realm character.', board: { season: { n: 1, day: 2 }, rows: [] } }, setup: { decks: [{ name: 'A' }, { name: 'B', word: 'x' }], foes: [], deck: 0, foe: null } }));
    take(ih.root);
    ih.render(iliacHudModel({ phase: 'setup', setup: { decks: [{ name: 'A' }], foes: [{ name: 'Ana', temper: 'tight' }, { name: 'Bors', temper: 'loose', paid: true }], deck: 0, foe: 1, forKeeps: true, keepsOk: true }, why: 'No.' }));
    take(ih.root);
    for (const w of ['tablehead', 'tabletitle', 'tableacts', 'fold', 'msg']) assert.equal(all(ih.root, w).length, 1, `Iliac Hand's own ${w}`);
    const { v, staged, pick } = iliacTurn();
    ih.render(iliacHudModel({ phase: 'playing', view: v, staged, pick, log: ['Turn 1.'] }));
    take(ih.root);
    const end = played(6);
    for (const viewer of [0, 1]) { ih.render(iliacHudModel({ phase: 'over', view: { ...iliacView(end, viewer), names: ['A', 'B'] }, end: null, log: ['x'] })); take(ih.root); }
    ih.render(iliacHudModel({ phase: 'over', view: null, end: 'void' })); take(ih.root);
    all(ih.root, 'fold')[0].fire('click'); take(ih.root);
    const ch = createCardTableHud({ onPress: () => {}, doc });
    ch.render(cardHudModel({ phase: 'buyin', buyIn: { min: 100, max: 500 }, stakes: { sb: 5, bb: 10 }, refused: 'No.', iliac: true, packPrice: 30, gold: true }));
    take(ch.root);
    for (const w of ['tablehead', 'tabletitle', 'tablenote', 'tableacts', 'fold', 'msg']) assert.equal(all(ch.root, w).length, 1, `Hold'em's own ${w}`);
    const s = new CardTableSession({ player: { id: 'you', name: 'You', stack: 500 }, patrons: [{ id: 'p0', name: 'Ana', temper: 'tight', stack: 500 }, { id: 'p1', name: 'Bors', temper: 'loose', stack: 500 }], stakes: { sb: 5, bb: 10 }, rand32: src32(4), now: 0 });
    s.tick(0);
    ch.render(cardHudModel({ phase: 'playing', view: s.view(), legal: s.legal(), stakes: { sb: 5, bb: 10 }, log: ['You sit down.'] }));
    take(ch.root);
    all(ch.root, 'fold')[0].fire('click'); take(ch.root);
  }
  for (const w of ['dfcards', 'dfiliac', 'tablehead', 'tabletitle', 'tableacts', 'msg', 'log', 'fold', 'card-face', 'painted', 'seat', 'board', 'pot', 'opt', 'optname', 'opttemper', 'optword', 'season', 'box', 'ilbar', 'track', 'pip', 'gem', 'foe', 'mb', 'hold', 'holdhead', 'holdart', 'holdname', 'holdrule', 'lane', 'slot', 'duel', 'duelside', 'pw', 'tray', 'ic', 'p', 'verdict', 'collapsed']) assert.ok(words.has(w), `the painters wrote ${w} (the sweep reads what they paint)`);
  for (const w of ['card', 'row', 'note', 'head', 'side', 'acts']) assert.equal(words.has(w), false, `the bare '${w}' - the enhanced sheet's component`);
  const { rules: all_ } = await uiSheetRules();
  const own = new Set(['dfcards', 'dfiliac']);
  assert.deepEqual(collisions(all_, words, own), [], 'a rule from outside the panels styles a class they write');
  const back = collisions(all_, new Set([...words, 'card', 'row', 'note', 'side']), own);
  for (const w of ['card', 'row', 'note', 'side']) assert.ok(back.some((c) => c.includes(`ENHANCED_CSS .${w} {`)), `the law bites on the bare .${w}: ${back.join(' | ').slice(0, 300)}`);
});

test('CARDS-PLUS Iliac Hand\'s model: who holds each holding as the board stands - the greater power, a tie nobody, the result\'s own word once decided, read from either seat; the room each side has left (a staged unit takes a place, a staged spell none); the end as its player\'s (won, lost, drawn, no contest - none for a watcher); the line\'s tone; the presses\' kinds (mutants: a tie held; the result unread; a staged spell taking a place; a watcher\'s end; the tone of a committed turn; the concession quiet)', () => {
  const view = (viewer, power, result = null) => ({ viewer, holdings: [{ power }], result });
  assert.deepEqual([view(0, [5, 8]), view(1, [5, 8]), view(0, [4, 4]), view(-1, [3, 1])].map((x) => holdingLead(x, 0)), ['theirs', 'mine', null, 'mine']);
  assert.equal(holdingLead(view(0, [9, 1], { held: [1] }), 0), 'theirs', 'decided: the result\'s word, not the view\'s power');
  assert.equal(holdingLead(view(1, [9, 1], { held: [1] }), 0), 'mine');
  assert.equal(holdingLead(view(0, [9, 1], { held: [null] }), 0), null, 'a tie at the end is nobody\'s');
  const r = (winner) => ({ result: { winner }, viewer: 0 });
  assert.deepEqual([iliacOutcome(r(0)), iliacOutcome(r(1)), iliacOutcome(r(null)), iliacOutcome({ ...r(0), viewer: -1 }), iliacOutcome(null, 'left'), iliacOutcome(null, 'won-left'), iliacOutcome(null, 'void'), iliacOutcome({ viewer: 0 })],
    ['won', 'lost', 'drawn', null, 'lost', 'won', 'void', null]);
  assert.deepEqual(VERDICT_WORDS, { won: 'Victory', lost: 'Defeat', drawn: 'A draw', void: 'No contest' });
  // the room: a unit staged takes its place, a spell none
  const { s, v } = iliacTurn();
  const hand = v.players[0].hand;
  const lawful = (kind) => legalPlays(s.state, 0).find((p) => cardById(hand[p.card].id).kind === kind && stagedRefusal(v, [p]) === null);
  const unit = lawful('unit');
  assert.ok(unit, 'a unit to stage');
  const m = iliacHudModel({ phase: 'playing', view: v, staged: [unit] });
  m.holdings.forEach((hd, h) => {
    const mineAt = v.holdings[h].sides[0].length, theirsAt = v.holdings[h].sides[1].length;
    assert.deepEqual(hd.open, [v.holdings[h].room - mineAt - (h === unit.holding ? 1 : 0), v.holdings[h].room - theirsAt], `holding ${h}'s room`);
    assert.equal(hd.lead, holdingLead(v, h));
  });
  const spell = lawful('spell');
  if (spell) assert.deepEqual(iliacHudModel({ phase: 'playing', view: v, staged: [spell] }).holdings[spell.holding].open[0], v.holdings[spell.holding].room - v.holdings[spell.holding].sides[0].length, 'a staged spell takes no place');
  else {
    // the starter deck dealt this seed no spell to the hand: stage one by hand, the rules' own shape
    const sp = STARTER_DECK.find((id) => cardById(id).kind === 'spell');
    const vv = { ...v, players: v.players.map((p, i) => (i ? p : { ...p, hand: [{ uid: 900, id: sp }, ...p.hand] })) };
    assert.equal(iliacHudModel({ phase: 'playing', view: vv, staged: [{ card: 0, holding: 0 }] }).holdings[0].open[0], vv.holdings[0].room - vv.holdings[0].sides[0].length, 'a staged spell takes no place');
  }
  // the tone and the presses' kinds
  assert.equal(m.tone, 'turn');
  assert.deepEqual(m.actions.map((a) => [a.id, a.kind ?? null]), [['commit', 'primary'], ['clear', null], ['stand', 'quiet']]);
  const keeps = iliacHudModel({ phase: 'playing', view: { ...v, forKeeps: true }, staged: [] });
  assert.equal(keeps.actions.at(-1).label, 'Concede and stand');
  assert.equal(keeps.actions.at(-1).kind, 'warn', 'a concession costs the card staked');
  const committed = { ...v, players: v.players.map((p, i) => (i ? p : { ...p, committed: true })) };
  assert.equal(iliacHudModel({ phase: 'playing', view: committed }).tone, 'wait');
  assert.equal(iliacHudModel({ phase: 'playing', view: v, why: 'No.' }).tone, 'warn');
  assert.equal(iliacHudModel({ phase: 'playing', view: v, online: { watching: true } }).tone, 'wait');
  const end = played(6);
  const over = iliacHudModel({ phase: 'over', view: iliacView(end, 0) });
  assert.equal(over.outcome, iliacOutcome(iliacView(end, 0)));
  assert.equal(over.tone, over.outcome === 'won' || over.outcome === 'lost' ? over.outcome : null);
  assert.deepEqual(over.actions.map((a) => [a.id, a.kind ?? null]), [['again', 'primary'], ['holdem', null], ['stand', 'quiet']]);
  const setup = iliacHudModel({ phase: 'setup', setup: { decks: [{ name: 'A' }], foes: [{ name: 'Ana', temper: 'tight' }], deck: 0, foe: 0 } });
  assert.deepEqual([setup.tone, setup.actions[0].kind, setup.actions.at(-1).kind], [null, 'primary', 'quiet']);
  assert.equal(iliacHudModel({ phase: 'setup', setup: { decks: [{ name: 'B', word: 'x' }], foes: [], deck: 0 } }).tone, 'warn', 'no deck to play');
  assert.equal(iliacHudModel({ phase: 'setup', online: { busy: true }, setup: { decks: [{ name: 'A' }], foes: [], deck: 0 } }).tone, 'wait', 'the realm vouching');
  assert.equal(iliacHudModel({ phase: 'playing', view: null, online: { watching: true } }).spectator, true);
  assert.equal(m.spectator, false);
});

test('CARDS-PLUS Iliac Hand\'s painted panel: the turn a track of six and the magicka its gems (the staged spend dimmed), the other\'s backs - neither past the rules\' own ceilings, a garbled count said and never drawn - each holding under its own painted location card with its lanes\' empty places and the duel\'s holder lit, the hand in its tray painted by the binder\'s own canvas at its CSS size - the painter\'s tile face, never twice it - a fresh copy for each place, the verdict at the end, the fold kept across repaints, the log a line a sentence (mutants: the hand painted twice its size; the empty places gone; the log one run; the fold forgotten; the verdict unsaid; the copy left blank; the gems past the magicka\'s ceiling; the gems or the backs uncapped)', () => {
  _clearCardFacesForTests();
  const doc = paintingDoc();
  const hud = createIliacTableHud({ onPress: () => {}, doc });
  const { v, staged, pick } = iliacTurn();
  const m = iliacHudModel({ phase: 'playing', view: v, staged, pick, log: ['The holdings: a, b, c.', 'Turn 1.', 'Ana commits.'] });
  hud.render(m);
  const pips = all(hud.root, 'pip');
  assert.equal(pips.length, m.turns);
  assert.deepEqual(pips.map((p) => p.className), ['pip now', 'pip', 'pip', 'pip', 'pip', 'pip'], 'turn one of six');
  const gems = all(hud.root, 'gem');
  assert.equal(gems.length, m.me.magicka);
  assert.equal(gems.filter((g) => g.className === 'gem lit').length, m.me.magicka - m.me.spend);
  assert.ok(m.me.spend > 0 && gems.filter((g) => g.className === 'gem spent').length === m.me.spend, 'the staged spend dimmed');
  assert.equal(all(hud.root, 'mb').length, m.them.hand, 'the other\'s hand as its backs');
  const holds = all(hud.root, 'hold');
  assert.equal(holds.length, 3);
  holds.forEach((box, h) => {
    const hd = m.holdings[h];
    const art = all(box, 'holdart')[0].children[0];
    assert.equal(art.height, ILIAC_PLACE_CARD_H, 'its own location card, at its size');
    assert.ok(art.log.drawn.length === 1, 'painted from the binder\'s face');
    const [theirs, mine] = all(box, 'lane');
    assert.equal(all(theirs, 'slot').length, hd.open[1], 'the other side\'s empty places');
    assert.equal(all(mine, 'slot').length, hd.open[0], 'yours');
    assert.equal(all(mine, 'staged').length, hd.staged.length);
    const pw = all(box, 'pw');
    assert.deepEqual(pw.map((p) => p.className.includes('ahead')), [hd.lead === 'mine', hd.lead === 'theirs'], 'the holder lit');
    assert.equal(box.className.includes(`lead-${hd.lead}`), !!hd.lead);
  });
  const tray = all(hud.root, 'tray')[0];
  const cards = all(tray, 'ic');
  assert.equal(cards.length, v.players[0].hand.length);
  for (const c of cards) {
    const cv = c.children[0];
    assert.equal(cv.height, ILIAC_HAND_CARD_H, 'painted at its CSS size (the pixel ratio 1 here)');
    assert.ok(cv.height <= ILIAC_TILE_MAX_H, 'the painter\'s tile face');
    assert.equal(cv.log.drawn.length, 1, 'a fresh copy of the one painting');
  }
  assert.equal(new Set(cards.map((c) => c.children[0])).size, cards.length, 'each place its own node');
  assert.ok(ILIAC_LANE_CARD_H <= ILIAC_TILE_MAX_H && ILIAC_PLACE_CARD_H <= ILIAC_TILE_MAX_H);
  assert.equal(all(tray, 'picked').length, pick == null ? 0 : 1);
  const log = all(hud.root, 'log')[0];
  assert.deepEqual(log.children.map((n) => n.textContent), ['The holdings: a, b, c.', 'Turn 1.', 'Ana commits.'], 'a line a sentence, the newest last');
  // a count past the rules' ceilings (a garbled relay's) is said in the count and never grows the row
  hud.render({ ...m, me: { ...m.me, magicka: 99, spend: 0 }, them: { ...m.them, hand: 99 } });
  assert.equal(all(hud.root, 'gem').length, ILIAC_MAGICKA_MAX, 'the gems the magicka\'s ceiling at most');
  assert.equal(all(hud.root, 'mb').length, ILIAC_HAND_MAX, 'the backs a hand\'s most at most');
  assert.ok(text(hud.root).includes('99/99') && text(hud.root).includes('99 in hand'), 'the number itself said');
  hud.render(m);
  // the fold: the game's words away, the line and the presses kept, and kept across a repaint
  const fold = all(hud.root, 'fold')[0];
  assert.equal(fold.getAttribute('aria-expanded'), 'true');
  fold.fire('click');
  assert.equal(hud.root.className, 'dfiliac collapsed');
  hud.render({ ...m, message: 'x', log: ['y'] });
  assert.equal(hud.root.className, 'dfiliac collapsed', 'kept across a repaint');
  assert.equal(all(hud.root, 'fold')[0].getAttribute('aria-expanded'), 'false');
  assert.equal(all(hud.root, 'fold')[0].getAttribute('data-focus'), 'fold', 'the keyboard\'s, as every control of the panel');
  assert.match(ILIAC_TABLE_CSS, /\.dfiliac\.collapsed \.ilbody\{display:none\}/);
  all(hud.root, 'fold')[0].fire('keydown', { key: 'Enter' });
  assert.equal(hud.root.className, 'dfiliac');
  // the end: its verdict, the line's tone
  const end = played(6);
  const over = iliacHudModel({ phase: 'over', view: iliacView(end, 0) });
  hud.render(over);
  const verdict = all(hud.root, 'verdict')[0];
  assert.ok(over.outcome && verdict, 'a decided game says so');
  assert.equal(verdict.textContent, VERDICT_WORDS[over.outcome]);
  assert.equal(verdict.className, `verdict ${over.outcome}`);
  assert.equal(all(hud.root, 'msg')[0].className, over.tone ? `msg ${over.tone}` : 'msg');
  assert.deepEqual(all(hud.root, 'pip').map((p) => p.className), Array(6).fill('pip past'), 'every turn played');
  hud.destroy();
});

test('CARDS-PLUS the binder\'s face, copied: a fresh canvas holding the cached painting, at the same device size - one card in two places, two nodes (mutants: the copy left blank)', () => {
  _clearCardFacesForTests();
  const doc = paintingDoc();
  const rat = cardById('rat');
  const src = cardCanvas(doc, rat, 46);
  const a = cardCanvasCopy(doc, rat, 46), b = cardCanvasCopy(doc, rat, 46);
  assert.notEqual(a, b);
  for (const c of [a, b]) {
    assert.deepEqual([c.width, c.height], [src.width, src.height]);
    assert.equal(c.log.drawn.length, 1, 'the painting drawn into it');
  }
  assert.deepEqual(src.log.scale[0], [1, 1], 'painted at the screen\'s ratio (1 here)');
  for (const c of [a, b]) assert.equal(c.log.drawn[0], src, 'from the one cached painting');
});

test('CARDS-PLUS the Collections page leaves the paint to the kit: its switch, the binder\'s filters, chips, decks and the deck\'s name give the roles a 2px edge and no colour or ground of their own over it, the codex row a line - the sentence "dressed by the kit\'s roles" true at last (mutants: the switch\'s own ground back; a chip\'s own border colour; a filter on a 1px line)', () => {
  const css = rules(`${COLLECTION_PAGE_CSS}\n${CARD_BINDER_CSS}`);
  const body = (sel) => css.filter((r) => r.sels.includes(sel)).map((r) => r.body).join(';');
  for (const sel of ['.px-sys .coll-part', '.px-sys .binder-filter', '.px-sys .binder-chip', '.px-sys .binder-deck']) {
    const b = body(sel);
    assert.match(b, /border-width: 2px; border-style: solid;/, `${sel}: the kit's edge`);
    assert.doesNotMatch(b, /background|border-color|border: \d/, `${sel}: no paint over the kit's`);
  }
  assert.match(body('.px-sys .codex-line'), /border-width: 0 0 1px; border-style: solid;/, 'a line');
  assert.doesNotMatch(body('.px-sys .codex-line'), /background/);
  assert.match(body('.px-sys .binder-edit input'), /border-width: 2px; border-style: solid;/);
  assert.match(body('.px-sys .binder-chip.short'), /border-color: #d0604f/, 'a card the binder is short of keeps its red edge over the kit');
});
