// MENU-ORDER (2026-10-12; the owner: "I want to really organize and enhance the decoration menu/buttons. Making it for
// palatable, readable and easy to understand. I want to do the same for stores, crafting menus, etc", then "I just feel
// like text lists are too much. Why cant you try something else"): bible/10-UI/Menu-Order.md. Pictures before words -
// the decorator's catalogue and its rooms as tiles, every kind and press its glyph, the bar's keys folded; the shop
// counter's prices on its rows and its lists as pictures on a press; the Stores page's stations as tiles, its works and
// patterns as cards.
import './chargenDom.mjs';   // a document for the tabs that draw after an await (withDom's is the call's alone)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DFICON_ROWS, DFICON_CSS, dficonSvg } from '../src/ui/menuGlyphs.js';
import { DECOR_KINDS } from '../src/systems/decorCatalogue.js';
import { createDecorBar, decorBarKeys, decorFiltersText, DECOR_LAYOUT_WORDS, DECOR_KEYS_WORD, DECOR_CSS } from '../src/ui/decorPanel.js';
import { all, one, text, chipNamed, rows, panelRig } from './decorFakes.mjs';
import { fakeDoc, fakeWin, settle, toolRig } from './decorFakes.mjs';
import { createDecorPanel } from '../src/ui/decorPanel.js';
import { decorThumbCamera, DECOR_THUMB_PX, DECOR_THUMBS_A_FRAME, DECOR_THUMB_WAIT_MS } from '../src/scenes/decorTool.js';
import { withDom } from './invdrag.mjs';
import { mountEnhancedTrade, TRADE_TITLE, TRADE_OWN_HEAD, TRADE_COST_WORD, TRADE_GOLD_WORD, TRADE_VIEW_WORDS, tradeGoldText } from '../src/ui/enhancedTrade.js';
import { stockShopShelf } from '../src/systems/shopStock.js';
import { BUILDING_TYPES } from '../src/world/buildingNames.js';
import { setProfessionsPages, drawStoresPage, stationWorkable, STATION_TILES, STATION_TILE_WORDS } from '../src/ui/profPages.js';
import { xpForRank, trackOf } from '../src/net/professionLaw.js';
import { createMarketTab, MARKET_VIEW_ICONS, MARKET_VIEW_GROUPS } from '../src/ui/marketTab.js';
import { createVendorTab } from '../src/ui/vendorTab.js';
import { PROF_CSS } from '../src/ui/enhancedPlusStyle.js';
import { pictureNode } from '../src/ui/menuGlyphs.js';
import { setVendorPage, drawVendorPage, resetVendorPage } from '../src/ui/vendorPage.js';
import { mountReforgeWindow, REFORGE_PAGES, REFORGE_PAGE_ICONS } from '../src/ui/reforgeWindow.js';
import { SHIPYARD_CSS, SHIPYARD_TAB_ICONS } from '../src/ui/shipyardWindow.js';
import { SHIPYARD_HULLS } from '../src/systems/shipyards.js';
import { mountNavalYardWindow } from '../src/ui/navalYardWindow.js';
import { mountEnhancedMerchantPanel, MERCHANT_ICONS } from '../src/ui/enhancedMerchantPanel.js';
import { REFORGE_CSS } from '../src/ui/enhancedPlusStyle.js';
import { BROKER_CSS } from '../src/ui/enhancedPlusStyle.js';
import { refusePress, brokerSkinCss } from '../src/ui/brokerWindow.js';

const lit = (rows) => rows.join('').split('').filter((c) => c === '#').length;

test('MENU-ORDER the glyphs: every one twelve rows of twelve, drawn a rect a lit pixel, each its own mask in the sheet; every kind the catalogue sorts by and every station tile has one (mutants: a glyph a pixel short; a kind with none; the mask never named)', () => {
  for (const [name, rows] of Object.entries(DFICON_ROWS)) {
    assert.equal(rows.length, 12, `${name}: twelve rows`);
    for (const r of rows) assert.equal(r.length, 12, `${name}: a row of twelve`);
    assert.equal((dficonSvg(rows).match(/<rect /g) ?? []).length, lit(rows), `${name}: a rect a lit pixel`);
    assert.ok(DFICON_CSS.includes(`[data-dficon="${name}"] { --dficon: url("data:image/svg+xml,`), `${name}: its mask`);
  }
  assert.match(DFICON_CSS, /\[data-dficon\]::before \{ content: ''; [^}]*background-color: currentColor; -webkit-mask: var\(--dficon\)/, 'drawn in the word\'s own colour');
  for (const kind of Object.keys(DECOR_KINDS)) assert.ok(DFICON_ROWS[kind], `the kind ${kind} has its picture`);
  for (const [, icon] of Object.values(STATION_TILES)) assert.ok(DFICON_ROWS[icon], `the station glyph ${icon}`);
});

test('MENU-ORDER the decorator as pictures: the catalogue tiles by default, a model\'s tile its kind\'s glyph over the letters it keeps, a flat\'s its picture, what a piece does a badge; List lays it as lines and Pictures back; every tab, kind and has-filter its glyph; the layout\'s two chips after the tabs (mutants: the grid never laid; the model\'s glyph dropped; the badges dropped; the switch dead)', async () => {
  const rig = panelRig();
  rig.panel.open(rig.view());
  const root = rig.panel.root;
  const card = one(root, 'dfdecor-card');
  assert.equal(card.dataset.view, 'grid', 'pictures first');
  const byKey = new Map(rows(root).map((r) => [r.dataset.key, r]));
  const bed = rig.entries.find((e) => e.model != null && e.kind === 'bed');
  const bedThumb = one(byKey.get(bed.key), 'dfdecor-thumb');
  assert.deepEqual([bedThumb.dataset.dficon, bedThumb.textContent], ['bed', 'Be'], 'a model: its kind\'s glyph, the letters kept for a reader');
  const flat = rig.entries.find((e) => e.flat);
  assert.equal(one(byKey.get(flat.key), 'dfdecor-thumb').children[0].tag, 'img', 'a flat: its own picture');
  const chest = rig.entries.find((e) => e.storage);
  assert.deepEqual(all(byKey.get(chest.key), 'dfdecor-badge').map((b) => b.dataset.dficon), ['storage'], 'holds things, as a picture');
  const candle = rig.entries.find((e) => e.light != null);
  assert.ok(all(byKey.get(candle.key), 'dfdecor-badge').some((b) => b.dataset.dficon === 'light'), 'gives light, as a picture');
  chipNamed(root, DECOR_LAYOUT_WORDS.list).fire('click');
  assert.equal(card.dataset.view, 'list', 'List: lines');
  chipNamed(root, DECOR_LAYOUT_WORDS.grid).fire('click');
  assert.equal(card.dataset.view, 'grid', 'Pictures: tiles again');
  const tabs = all(one(root, 'dfdecor-tabs'), 'dfdecor-chip');
  assert.deepEqual(tabs.map((t) => t.dataset.dficon), ['all', 'room', 'own', 'furniture'], 'each view its picture');
  assert.equal(chipNamed(root, DECOR_KINDS.bed).dataset.dficon, 'bed');
  assert.deepEqual(['Holds things', 'Gives light'].map((w) => chipNamed(root, w).dataset.dficon), ['storage', 'light']);
  const chips = all(root, 'dfdecor-chip');
  assert.ok(chips.indexOf(chipNamed(root, DECOR_LAYOUT_WORDS.grid)) > chips.indexOf(tabs.at(-1)), 'the layout after the views');
});

test('MENU-ORDER the decorator\'s presses: a placed piece\'s each its glyph, Remove edged as a warning, the room tiles too; the bar\'s keys folded behind Keys, its presses pictured; the legend\'s pairs and the phone fold\'s count; a portrait phone\'s bar the screen\'s width under the touch layer\'s presses (mutants: Remove not a warning; the legend shown from the first; the fold\'s count; the portrait bar narrow)', () => {
  const rig = panelRig();
  const piece = { id: 'p1', model: 41000, paid: 120, light: 1, storage: false };
  rig.panel.open(rig.view({ placed: [{ piece, name: 'Bed', entry: rig.entries[0], holds: false }] }));
  rig.panel.showRoom('p1');
  const root = rig.panel.root;
  assert.equal(one(root, 'dfdecor-card').dataset.view, 'grid', 'the room\'s pieces tile too');
  assert.deepEqual(all(rows(root)[0], 'dfdecor-badge').map((b) => b.dataset.dficon), ['light']);
  const btn = (re) => all(root, 'dfdecor-btn').find((b) => re.test(b.textContent));
  assert.deepEqual([/^Move$/, /^Turn left$/, /^Turn right$/, /^Light/, /^Holds things/, /^Station:/, /^Remove$/].map((re) => btn(re).dataset.dficon),
    ['move', 'turn-left', 'turn-right', 'light', 'storage', 'list', 'remove']);
  assert.ok(String(btn(/^Remove$/).className).split(/\s+/).includes('warn'), 'Remove, edged as a warning');
  const bar = createDecorBar({ on: {}, doc: fakeDoc() });
  assert.equal(bar.root.dataset.keys, '0', 'the legend folded');
  const keysChip = all(bar.root, 'dfdecor-chip').find((c) => c.textContent === DECOR_KEYS_WORD);
  keysChip.fire('click');
  assert.equal(bar.root.dataset.keys, '1', 'Keys unfolds it');
  keysChip.fire('click');
  assert.equal(bar.root.dataset.keys, '0');
  assert.deepEqual(['Place', 'Raise', 'Lower', 'Grid', 'Back'].map((w) => all(bar.root, w === 'Place' ? 'dfdecor-btn' : 'dfdecor-chip').find((c) => c.textContent === w).dataset.dficon),
    ['place', 'up', 'down', 'grid', 'back']);
  assert.match(text(one(bar.root, 'dfdecor-bar-keys')), /^Fly: walk keys/, 'the legend, a name and what presses it');
  assert.deepEqual(decorBarKeys(false).map(([k]) => k), ['Fly', 'Look', 'Turn', 'Raise/lower', 'Size', 'Grid', 'Place', 'Back']);
  assert.ok(!decorBarKeys(false, false).some(([k]) => k === 'Size'), 'a figure: no Size');
  assert.deepEqual(decorBarKeys(true).map(([k]) => k), ['Fly', 'Look']);
  assert.equal(decorFiltersText({ kinds: new Set(), size: null, storage: null, light: null }), 'Filters');
  assert.equal(decorFiltersText({ kinds: new Set(['bed', 'light']), size: 'small', storage: true, light: null }), 'Filters (4)');
  // a portrait phone's bar: under the touch layer's top-left presses (16px down, 48px tall), the screen's width
  assert.ok(DECOR_CSS.includes('@media (orientation: portrait) { .dfdecor-bar.touch { top: calc(72px + env(safe-area-inset-top, 0px)); max-width: calc(100vw - 24px); } }'),
    'a portrait phone\'s bar the screen\'s width, below the presses');
  assert.ok(DECOR_CSS.includes('.dfdecor-bar.touch { bottom: auto; top: calc(8px + env(safe-area-inset-top, 0px)); max-width: calc(100vw - 272px); }'), 'a landscape one keeps its clearance beside them');
});

/** Every word under a node - the fake's textContent is its own alone. */
const said = (n) => (n.textContent || '') + (n.children ?? []).map(said).join('');
const find = (root, sel, txt = null) => root.querySelectorAll(sel).find((n) => txt == null || n.textContent === txt) ?? null;
const shelf = () => stockShopShelf({ buildingType: BUILDING_TYPES.GeneralStore, quality: 10 }, {}, { rolls: () => 0, torchesFromItems: false });

test('MENU-ORDER the shop counter: the mode whole in its title, the player\'s column named, the footer\'s two figures each under its name, a price on every shelf row (the strip\'s own), Steal set apart; the lists as pictures on a press (mutants: the row\'s price dropped; the figures run together; the switch dead)', () => {
  assert.equal(TRADE_TITLE.SellMagic, 'Sell magic items');
  withDom((dom) => {
    const host = dom.mk('div');
    dom.body.append(host);
    const items = shelf();
    const view = mountEnhancedTrade(host, { mode: 'Buy', shopName: 'The Shop', shelfItems: () => items, packItems: () => [], accepts: () => true,
      enchanted: () => false, priceCtx: () => ({ quality: 10, priceAdjustment: 1000, skills: { mercantile: 50, personality: 50 } }), gold: () => 1840 });
    assert.equal(find(host, '.sb-who').children[0].textContent, 'The Shop — Buy');   // the title (the fake's tag reader stops at a digit)
    assert.equal(find(find(host, '.trade-ownhead'), '.remotewho').children[0].textContent, TRADE_OWN_HEAD);   // the fake reads one compound selector: nested finds
    assert.deepEqual(host.querySelectorAll('.trade-fig').map((f) => f.children.map((n) => [n.tagName, n.textContent])),
      [[['SMALL', TRADE_COST_WORD.Buy], ['B', tradeGoldText(0)]], [['SMALL', TRADE_GOLD_WORD], ['B', '1,840 gold']]], 'each figure under its name');
    const shelfRows = () => find(host, '.packremote').querySelectorAll('.itemrow');
    const row = shelfRows()[0];
    const price = find(row, '.itemprice').textContent;
    row.onclick({ timeStamp: 1 });
    const quote = Number(/^Buy for (\d+) gold$/.exec(find(host, '.trade-quote').textContent)?.[1]);
    assert.ok(quote > 0);
    assert.equal(price, tradeGoldText(quote), 'the row says what the strip quotes');
    assert.equal(shelfRows().filter((r) => !find(r, '.itemprice')).length, 0, 'every shelf row priced');
    assert.ok(find(host, '.trade-steal', 'Steal'), 'Steal, set apart');
    const shell = find(host, '.trade-shell');
    assert.equal(shell.dataset.view, 'list', 'lines first');
    find(find(host, '.trade-view'), '.act', TRADE_VIEW_WORDS.grid).onclick();
    assert.equal(find(host, '.trade-shell').dataset.view, 'grid', 'pictures on a press');
    find(find(host, '.trade-view'), '.act', TRADE_VIEW_WORDS.list).onclick();
    assert.equal(find(host, '.trade-shell').dataset.view, 'list');
    view.unmount();
  });
});

test('MENU-ORDER the Stores page\'s stations as tiles: a tile a station, the ones worked here lit and drawn below, the ones away kept hidden until their tile is pressed (and hidden again on a second press); a section worked here is one with a press in it; the forge\'s works and the anvil\'s patterns are cards (mutants: an away station shown; the press never toggling; a section with a button read as away)', () => {
  withDom((dom) => {
    const held = new Map([['ore:iron', 34], ['ingot:iron', 6], ['wood:charcoal', 20]]);
    const tracks = new Map([['smithing', { profession: 'smithing', xp: xpForRank(10), rank: 10, specs: { 50: null, 100: null } }]]);
    const stores = new Map([...held].map(([k, n]) => [k, { material: k, own: n, bought: 0 }]));
    const book = {
      state: { open: true, day: 1, character: 'c', account: 'a', readAt: Date.now(), stores, tracks, today: {}, caps: null }, stale: () => false, refresh: async () => ({ ok: true }),
      held: (k) => held.get(k) ?? 0, store: (k) => stores.get(k) ?? { material: k, own: 0, bought: 0 },
      track: (p) => tracks.get(trackOf(p)) ?? { profession: trackOf(p), xp: 0, rank: 0, specs: { 50: null, 100: null } }, materials: () => [], pendingWithdrawals: 0, pendingCrafts: 0,
      choose: async () => ({ ok: true }),
    };
    setProfessionsPages({ book, name: (k) => k, withdraw: async () => ({ ok: true, text: '' }), forge: () => ({ kind: 'shop', fee: 50 }), workbench: () => null,
      smelt: async () => ({ ok: true, text: '' }), craft: async () => ({ ok: true, text: '' }), stock: async () => ({ ok: true, text: '' }), heatBand: () => 1, planeBand: () => 1 });
    const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
    const kit = { el, divider: (w) => el('h3', null, w), meter: () => el('div') };
    let root = null;
    const draw = () => { root = el('div'); drawStoresPage(root, draw, kit); };
    draw();
    const tile = (id) => root.querySelectorAll('.prof-stile').find((t) => t.attrs['data-station'] === id);
    assert.deepEqual([tile('forge').className.includes('here'), find(tile('forge'), '.prof-stile-state').textContent], [true, STATION_TILE_WORDS.here], 'the forge, worked here');
    assert.deepEqual([tile('workbench').className.includes('here'), find(tile('workbench'), '.prof-stile-state').textContent], [false, STATION_TILE_WORDS.away]);
    assert.equal(tile('forge').attrs['data-dficon'], STATION_TILES.forge[1]);
    const awayBox = () => find(root, '.prof-awaynotes').querySelectorAll('.prof-station').find((b) => /The Workbench/.test(said(b)));
    assert.equal(awayBox().hidden, true, 'away: its words kept, hidden');
    assert.ok(find(root, '.prof-works'), 'the forge\'s works, cards');
    assert.ok(find(root, '.prof-works').querySelectorAll('button').some((b) => b.textContent === 'Smelt'));
    assert.ok(find(root, '.prof-recipes'), 'the anvil\'s patterns, cards');
    tile('workbench').onclick();
    assert.equal(awayBox().hidden, false, 'pressed: where it is worked');
    assert.ok(tile('workbench').className.includes('on'));
    tile('workbench').onclick();
    assert.equal(awayBox().hidden, true, 'pressed again: put away');
    assert.equal(stationWorkable({ children: [{ tag: 'div', children: [{ tagName: 'BUTTON', children: [] }] }] }), true);
    assert.equal(stationWorkable({ children: [{ tag: 'h3', children: [] }, { tag: 'p', children: [] }] }), false);
    setProfessionsPages(null);
  });
});

test('MENU-ORDER the board\'s rows pictured: a Market material row, a supplier\'s row and a trader\'s piece wear the host\'s picture before their name (and none without one); a Stores card its material\'s; the market\'s views each their glyph, and a phone\'s row of them never squeezed to nothing (mutants: the picture never asked; asked of the wrong key; the views bare; the phone\'s views collapsed)', async () => {
  const PIC = { src: 'data:pic', w: 26, h: 26 };
  const asked = [];
  const picOf = (root) => { const out = []; const walk = (n) => { for (const c of n.children ?? []) { if (c.tagName === 'IMG') out.push(c); walk(c); } }; walk(root); return out; };
  {
    const data = { materials: { rows: [{ id: 'A', kind: 'material', material: 'ore:iron', units: 9, price: 3, region: 17, road: { courier: 0, seconds: 0, road: 0 } }], medians: {} } };
    const book = { state: { open: true, balance: 50, road: [], counts: {} }, pending: 0, cached: () => null, read: async (view) => ({ ok: true, data: data[view] ?? { rows: [] } }), settle: async () => ({ ok: true, settled: 0 }) };
    const m = { book, stores: () => new Map(), region: 17, regionName: 'Daggerfall', regionNameOf: () => 'Wayrest', hubs: {}, name: (k) => k, countName: (k) => k,
      pieces: () => [], take: () => true, putBack: () => {}, mint: () => {}, pieceName: () => 'a piece', weavers: [{ key: 'cloth:linen', marks: 2 }], stock: async () => ({ ok: true }),
      picture: (k) => { asked.push(k); return k === 'ore:iron' || k === 'cloth:linen' ? PIC : null; } };
    let root = null;
    const tab = createMarketTab(m, { busy: () => false, run: async (go) => go(), rerender: () => { root = tab.body(); }, nowS: () => 0, alive: () => true });
    await tab.open();
    root = tab.body();
    const row = find(root, '.market-row');
    const name = row.children[0];
    assert.equal(name.tagName, 'B');
    assert.deepEqual(picOf(name).map((i) => [i.className, i.attrs.src]), [['market-pic', 'data:pic']], 'the material\'s picture before its name');
    assert.ok(asked.includes('ore:iron') && asked.includes('cloth:linen'), 'asked of the row\'s own material and the supplier\'s');
    const counter = find(root, '.market-counterrow');
    assert.equal(picOf(counter).length, 1, 'the supplier\'s row pictured');
    const views = root.querySelectorAll('.market-view');
    assert.deepEqual(views.map((v) => v.attrs['data-dficon']), MARKET_VIEW_GROUPS.flatMap(([, ids]) => ids).map((id) => MARKET_VIEW_ICONS[id]), 'each view its glyph');
    for (const icon of Object.values(MARKET_VIEW_ICONS)) assert.ok(DFICON_ROWS[icon], `a glyph for ${icon}`);
    const bare = createMarketTab({ ...m, picture: undefined }, { busy: () => false, run: async (go) => go(), rerender: () => {}, nowS: () => 0, alive: () => true });
    await bare.open();
    assert.equal(picOf(find(bare.body(), '.market-row')).length, 0, 'no picture: the name alone');
    const vendors = createVendorTab({ mode: 'board', read: async () => ({ ok: true, data: { rows: [{ id: 'v', item: { name: 'Dagger' }, price: 9, owner: 'Eve', map: 1, buildingKey: 2, expiresAt: 99 }] } }),
      nameOf: (i) => i.name, townOf: () => 'Daggerfall', picture: (it) => (it.name === 'Dagger' ? PIC : null) }, { busy: () => false, run: async (go) => go(), rerender: () => {}, nowS: () => 0, alive: () => true });
    await vendors.open?.();
    const vrow = find(vendors.body(), '.market-row');
    assert.deepEqual(picOf(vrow.children[0]).map((i) => i.attrs.src), ['data:pic'], 'a trader\'s piece pictured');
  }
  assert.match(PROF_CSS, /@media \(max-width: [0-9]+px\) \{[^]*?\.market-views \{ flex: none; flex-wrap: nowrap; overflow-x: auto;/, 'a phone\'s views keep their height');
  assert.equal(pictureNode(null, () => null, 'x'), null);
  withDom(() => {
    const held = new Map([['ore:iron', 34]]);
    const stores = new Map([...held].map(([k, n]) => [k, { material: k, own: n, bought: 0 }]));
    const book = { state: { open: true, day: 1, character: 'c', account: 'a', readAt: Date.now(), stores, tracks: new Map(), today: {}, caps: null }, stale: () => false, refresh: async () => ({ ok: true }),
      held: (k) => held.get(k) ?? 0, store: (k) => stores.get(k), track: (pr) => ({ profession: trackOf(pr), xp: 0, rank: 0, specs: { 50: null, 100: null } }), materials: () => [], pendingWithdrawals: 0, pendingCrafts: 0 };
    setProfessionsPages({ book, name: (k) => k, withdraw: async () => ({ ok: true, text: '' }), picture: (k) => (k === 'ore:iron' ? PIC : null) });
    const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
    const root = el('div');
    drawStoresPage(root, () => {}, { el, divider: (w) => el('h3', null, w), meter: () => el('div') });
    const card = find(root, '.prof-mat');
    assert.deepEqual(picOf(card.children[0]).map((i) => [i.className, i.attrs.src]), [['prof-matpic', 'data:pic']], 'a Stores card its material\'s picture');
    setProfessionsPages(null);
  });
});

test('MENU-ORDER the rest: the Vendor page\'s pieces and the Market\'s crafted pieces pictured; the Reforge\'s pages, the shipmaster\'s, the yard\'s and a merchant\'s presses each their glyph; a Reforge row with no press of its own gives its name the room; a ship\'s picture her size (mutants: each dropped)', async () => {
  const PIC = { src: 'data:pic', w: 26, h: 26 };
  const imgs = (root) => { const out = []; const walk = (n) => { for (const c of n.children ?? []) { if (c.tagName === 'IMG') out.push(c); walk(c); } }; walk(root); return out; };
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  // THE VENDOR PAGE: my trader's piece, pictured
  resetVendorPage();
  const piece = { name: 'Dagger' };
  setVendorPage({ shown: () => true, mine: async () => ({ ok: true, data: { traders: [{ map: 1, id: 2 }], stock: [{ id: 's', item: piece, price: 9, vendor: { map: 1, id: 2 }, expiresAt: Date.now() / 1000 + 86400 }], sold: [], gold: 0 } }),
    search: async () => ({ ok: true, data: { rows: [] } }), regionHere: () => 0, regionNames: ['Here'], nameOf: (it) => it.name, townOf: () => 'Town', picture: (it) => (it === piece ? PIC : null) });
  let page = el('div');
  const redraw = () => { page = el('div'); drawVendorPage(page, () => {}, { el, divider: (w) => el('h3', null, w) }); };
  redraw(); await tick(); redraw();
  const vrow = find(page, '.vendor-row');
  assert.deepEqual(imgs(vrow.children[0]).map((i) => [i.className, i.attrs.src]), [['vendor-pic', 'data:pic']], 'the page\'s piece pictured');
  setVendorPage(null);
  // THE MARKET'S CRAFTED PIECES
  const crafted = { crafted: { rows: [{ id: 'P', kind: 'piece', piece: { quality: 1, maker: 'Ann', wear: 0, provenance: 'pv' }, price: 30, region: 17, road: { courier: 0, seconds: 0, road: 0 } }] } };
  const book = { state: { open: true, balance: 50, road: [], counts: {} }, pending: 0, cached: () => null, read: async (view) => ({ ok: true, data: crafted[view] ?? { rows: [] } }), settle: async () => ({ ok: true, settled: 0 }) };
  let root = null;
  const tab = createMarketTab({ book, stores: () => new Map(), region: 17, regionName: 'D', regionNameOf: () => 'W', hubs: {}, name: (k) => k, countName: (k) => k, pieces: () => [],
    take: () => true, putBack: () => {}, mint: () => {}, pieceName: () => 'Steel Longsword', weavers: [], stock: async () => ({ ok: true }), piecePicture: (p) => (p.provenance === 'pv' ? PIC : null) },
  { busy: () => false, run: async (go) => go(), rerender: () => { root = tab.body(); }, nowS: () => 0, alive: () => true });
  await tab.open();
  root = tab.body();
  root.querySelectorAll('.market-view').find((b) => b.attrs['data-dficon'] === MARKET_VIEW_ICONS.crafted).onclick();
  await tick(); await tick();
  root = tab.body();
  assert.deepEqual(imgs(find(root, '.market-row').children[0]).map((i) => i.attrs.src), ['data:pic'], 'a crafted piece pictured');
  // THE REFORGE'S PAGES
  withDom((dom) => {   // the Reforge writes a dataset, which the chargen stand-in has not
    const host = dom.mk('div');
    dom.body.append(host);
    const view = mountReforgeWindow(host, { items: () => [], payer: () => ({ items: [], goldPieces: 0 }), gold: () => 0, picture: () => null, nameOf: () => '', reforge: () => ({ ok: false }), salvage: () => ({ ok: false }) });
    const tabs = host.querySelectorAll('.reforge-tab');
    assert.ok(tabs.length >= 2);
    assert.deepEqual(tabs.map((t) => t.attrs['data-dficon']), tabs.map((t) => REFORGE_PAGE_ICONS[t.dataset.page]), 'each page its glyph');
    view.unmount?.();
  });
  for (const id of Object.keys(REFORGE_PAGES)) assert.ok(DFICON_ROWS[REFORGE_PAGE_ICONS[id]], `a glyph for ${id}`);
  assert.match(REFORGE_CSS, /\.reforge-shell \.broker-offer:not\(\.codex-row\):not\(\.codex-set\):not\(\.codex-gilded\):not\(\.scry-row\):not\(:has\(> button\)\) \{ grid-template-columns: 48px minmax\(0, 1fr\) max-content; \}/);
  // THE SHIPMASTER'S SHIPS, THEIR SIZE
  const sizes = SHIPYARD_HULLS.map((h) => Number(new RegExp(`\\.dfyard-card\\[data-hull="${h}"\\] \\.dfyard-pic::before \\{ width: (\\d+)px`).exec(SHIPYARD_CSS)?.[1]));
  assert.deepEqual(sizes, [...sizes].sort((a, b) => a - b), 'each hull larger than the last the yard sells');
  assert.ok(sizes.every((n) => n > 0) && new Set(sizes).size === sizes.length);
  for (const icon of Object.values(SHIPYARD_TAB_ICONS)) assert.ok(DFICON_ROWS[icon]);
  // THE YARD'S PAGES
  const yard = el('div');
  const proto = Object.getPrototypeOf(yard);
  proto.removeAttribute ??= function removeAttribute(k) { delete this.attrs[k]; };
  mountNavalYardWindow(yard, { model: { name: 'Small Ship', uid: 42, offer: () => ({ rows: [], whole: 0, gold: 100 }), ship: () => ({ hull: 1, maxHull: 1, sail: 1, maxSail: 1, crew: 1, maxCrew: 1, barrels: 0 }) } });
  assert.deepEqual(find(yard, '.dfnaval-tabs').children.map((b) => b.attrs['data-dficon']), ['saw', 'anchor', 'treasure']);
  // A MERCHANT'S PRESSES
  const shop = el('div');
  mountEnhancedMerchantPanel(shop, { title: 'Repair Shop', buttons: ['Repair item', 'Talk', 'Sell', 'Exit', 'Something else'].map((label) => ({ label, onClick() {} })) });
  assert.deepEqual(shop.querySelectorAll('.tavern-act').map((b) => b.attrs['data-dficon'] ?? null), ['anvil', 'talk', 'treasure', 'back', null], 'each known press its glyph, an unknown one its word alone');
  for (const icon of Object.values(MERCHANT_ICONS)) assert.ok(DFICON_ROWS[icon]);
  // THE HOST HANDS THE PICTURES OVER (scenes/world.js): the Stores page's, the board's market and traders, a stall's, the Vendor page's
  const W = readFileSync(new URL('../src/scenes/world.js', import.meta.url), 'utf8');
  assert.match(W, /book: profBook, name: \(k\) => materialLabel\(k\), withdraw: [^\n]*\n\s*picture: \(k, wake\) => materialPicture\(k, \{ onReady: wake \}\),/, 'the Stores page');
  assert.match(W, /hubs: marketHubs, name: \(k\) => materialLabel\(k\), countName: materialCountLabel,\n\s*picture: \(k, wake\) => materialPicture\(k, \{ onReady: wake \}\), itemPicture: \(it, wake\) => itemPicture\(it, \{ onReady: wake \}\), piecePicture: marketPiecePicture,/, 'the market');
  assert.equal((W.match(/picture: \(it, wake\) => itemPicture\(it, \{ onReady: wake \}\),/g) ?? []).length, 3, 'the board\'s traders, a stall and the Vendor page');
  assert.match(W, /const marketPiecePicture = \(piece, wake\) => \{[^]*?return itemPicture\(_pieceItems\.get\(piece\.provenance\), \{ onReady: wake \}\);/, 'a crafted piece, minted once');
});

test('MENU-ORDER a refused press says why when pressed (Plain-Words law 5, A FINGER HAS NO HOVER): never disabled - it reads refused and keeps its title for the pointer, and a press tells its whole reason and does nothing else; every refusal the Reforge draws is one, and the Broker\'s Buy; both skins grey it (mutants: disabled still; no title; the reason untold; the grey on one skin)', () => {
  const attrs = {};
  let acted = 0, told = null, stopped = 0;
  const btn = { setAttribute: (k, v) => { attrs[k] = v; }, onclick: () => { acted++; } };
  refusePress(btn, 'Not enough gold', (r) => { told = r; });
  assert.deepEqual(attrs, { 'aria-disabled': 'true', title: 'Not enough gold' }, 'refused to the eye and a screen reader, never `disabled`');
  btn.onclick({ stopPropagation: () => { stopped++; } });
  assert.deepEqual([acted, told, stopped], [0, 'Not enough gold', 1], 'pressed: its reason told, its act never run, the row under it never picked');
  const reforge = readFileSync('src/ui/reforgeWindow.js', 'utf8');
  assert.equal((reforge.match(/setAttribute\('disabled'/g) ?? []).length, 0, 'no press of the Reforge is disabled');
  assert.equal((reforge.match(/\) refusePress\(\w+, /g) ?? []).length, 9, 'its nine refusals: salvage, reforge, hone, imprint, extract, unset, set, scry, lift');
  const broker = readFileSync('src/ui/brokerWindow.js', 'utf8');
  assert.equal((broker.match(/\) refusePress\(\w+, /g) ?? []).length, 2, 'the Broker\'s Buy and an insignia\'s');
  for (const css of [BROKER_CSS, brokerSkinCss()]) {
    assert.ok(css.includes('.broker-shell .act[aria-disabled="true"], .broker-shell .act[aria-disabled="true"]:hover, .broker-shell .act[aria-disabled="true"]:active {'), 'grey at rest, under the pointer and held - on both skins');
  }
});

const at = (m, [x, y, z]) => [0, 1, 2].map((i) => m[i] * x + m[4 + i] * y + m[8 + i] * z + m[12 + i]);
test('MENU-ORDER a model\'s own picture in its tile: the catalogue\'s, a placed piece\'s and a built-in one\'s each ask the host for it and show it over the kind\'s glyph; the host draws each with the preview\'s own pass, a few a frame, in a square under the card, copies it out and hands it back - the model whole, turned and looked down on - and an ask made in another room\'s textures, or for a model that never came, gives none (mutants: the tile never asks; the pass drawn every ask at once; the square off the card; the copy from the wrong square; the camera level; another room\'s textures drawn)', async () => {
  // the panel: a model's tile asks as a flat's does, and wears what it is handed over its glyph
  const doc = fakeDoc();
  const asked = [];
  const panel = createDecorPanel({ doc, win: fakeWin(), onPlace() {}, thumbOf: async (e) => { asked.push(e.key); return `data:${e.key}`; } });
  const { entries } = panelRig();
  const models = entries.filter((e) => !e.flat && e.model != null);
  const base = [{ key: 'm0:41100', shape: 'm41100', name: 'Table', kind: 'furniture', model: 41100, flat: null, hidden: false, holds: false, dist: 1.4 }];
  const piece = { id: 'p1', model: models[0].model, paid: 120 };
  const view = { where: 'Your house', entries, progress: 1, ready: true, gold: 1000, count: 1, cap: 200, radiusOf: () => 0.5, priceOf: () => 75, placed: [{ piece, name: 'Bed', entry: models[0], holds: false }], own: [], base };
  panel.open(view);
  await settle();
  assert.ok(models.length > 0 && models.every((e) => asked.includes(e.key)), 'every model\'s tile asked for its picture');
  const pic = (r) => all(r, 'dfdecor-modelpic')[0];
  for (const r of rows(panel.root).filter((x) => models.some((e) => e.key === x.dataset.key))) {
    assert.equal(pic(r).getAttribute('src'), `data:${r.dataset.key}`);
    assert.ok(one(r, 'dfdecor-thumb').dataset.dficon, 'its kind\'s glyph under it, for the moment before it lands');
  }
  panel.showRoom('p1');
  await settle();
  assert.equal(pic(rows(panel.root)[0]).getAttribute('src'), `data:${models[0].key}`, 'a placed piece: its entry\'s picture');
  all(panel.root, 'dfdecor-chip').find((c) => String(c.textContent).startsWith('Built in')).fire('click');
  await settle();
  assert.equal(pic(rows(panel.root)[0]).getAttribute('src'), 'data:m41100', 'a built-in piece: its own');
  assert.ok(DECOR_CSS.includes('.dfdecor-thumb img.dfdecor-modelpic { position: relative; z-index: 1;'), 'drawn over the glyph');
  assert.ok(DECOR_CSS.includes('.dfdecor-thumb img.dfdecor-modelpic:not([src]) { display: none; }'));
  // the camera: the box's middle at the middle, looked down on
  const cam = decorThumbCamera([-0.5, -0.1, -0.5, 0.5, 0.9, 0.5]);
  assert.ok(at(cam.model, [0, 0.4, 0]).every((v) => Math.abs(v) < 1e-6), 'the box\'s middle at the origin');
  const near = at(cam.view, at(cam.model, [0, 0.9, 0]))[2], mid = at(cam.view, [0, 0, 0])[2];
  assert.ok(mid < 0 && near > mid + 0.1, 'the top nearer the eye than the middle - looked down on');
  // the host: the preview's pass, a few a frame, in a square under the card, copied out
  const rig = toolRig();
  rig.frame();
  rig.tool.drawPreview('remap');
  rig.tool.openPanel();
  for (let i = 0; i < 6; i++) { rig.frame({ overlayUp: true }); await settle(); }
  const root = rig.doc.body.children.find((c) => c.className === 'dfdecor');
  one(root, 'dfdecor-card').getBoundingClientRect = () => ({ left: 100, top: 50, width: 600, height: 350 });
  const copies = [];
  const make = rig.doc.createElement;
  rig.doc.createElement = (t) => {
    const n = make(t);
    if (t === 'canvas') { n.getContext = () => ({ drawImage: (...a) => copies.push(a) }); n.toDataURL = () => `data:model${copies.length}`; }
    return n;
  };
  const tiles = rows(root).filter((r) => pic(r));
  assert.ok(tiles.length > DECOR_THUMBS_A_FRAME, 'more models than a frame draws');
  assert.ok(tiles.every((r) => !pic(r).getAttribute('src')), 'none before the frame');
  rig.tool.drawPreview('remap');   // the frame asks the models up; they land after it
  await settle();
  assert.ok(tiles.every((r) => !pic(r).getAttribute('src')), 'none before its model has come');
  rig.draws.length = 0;
  rig.tool.drawPreview('remap');
  await settle();
  const passes = rig.draws.filter((d) => d.panel && d.panel.rect.w === DECOR_THUMB_PX);
  assert.equal(passes.length, DECOR_THUMBS_A_FRAME, 'a few a frame');
  assert.deepEqual(passes[0].panel.rect, { x: 736, y: 386, w: DECOR_THUMB_PX, h: DECOR_THUMB_PX }, 'a square of the canvas under the card\'s middle');
  assert.deepEqual(copies[0].slice(1), [736, 386, DECOR_THUMB_PX, DECOR_THUMB_PX, 0, 0, DECOR_THUMB_PX, DECOR_THUMB_PX], 'copied out of that square');
  assert.equal(rig.draws.filter((d) => d.gpu != null && d.remap === 'remap').length >= DECOR_THUMBS_A_FRAME, true, 'in the room\'s textures');
  assert.equal(tiles.filter((r) => String(pic(r).getAttribute('src') ?? '').startsWith('data:model')).length, DECOR_THUMBS_A_FRAME);
  for (let i = 0; i < 40; i++) { rig.tool.drawPreview('remap'); await settle(); }
  const shown = rows(root).filter((r) => pic(r));
  assert.ok(shown.every((r) => String(pic(r).getAttribute('src') ?? '').startsWith('data:model')), 'every tile in the end');
  // another room's textures: what was asked in this one is never drawn in them
  const other = toolRig({ now: () => 0 });
  other.frame();
  other.tool.drawPreview('remap');
  other.tool.openPanel();
  for (let i = 0; i < 6; i++) { other.frame({ overlayUp: true }); await settle(); }
  const oroot = other.doc.body.children.find((c) => c.className === 'dfdecor');
  one(oroot, 'dfdecor-card').getBoundingClientRect = () => ({ left: 100, top: 50, width: 600, height: 350 });
  other.draws.length = 0;
  other.tool.drawPreview('elsewhere');
  await settle();
  other.tool.drawPreview('elsewhere');
  await settle();
  assert.equal(other.draws.filter((d) => d.panel && d.panel.rect.w === DECOR_THUMB_PX).length, 0, 'none drawn in another room\'s textures');
  assert.ok(rows(oroot).filter((r) => pic(r)).every((r) => !pic(r).getAttribute('src')), 'the glyph stands');
  // a picture is its room's textures: the panel opened in another room asks again, and is drawn in those
  rig.tool.close();
  rig.tool.drawPreview('elsewhere');
  rig.tool.openPanel();
  for (let i = 0; i < 6; i++) { rig.frame({ overlayUp: true }); await settle(); }
  assert.ok(rows(root).filter((r) => pic(r)).every((r) => !pic(r).getAttribute('src')), 'none kept from the last room\'s textures');
  rig.draws.length = 0;
  for (let i = 0; i < 3; i++) { rig.tool.drawPreview('elsewhere'); await settle(); }
  assert.ok(rig.draws.some((d) => d.gpu != null && d.remap === 'elsewhere') && rows(root).filter((r) => pic(r)).some((r) => pic(r).getAttribute('src')), 'drawn again in this one\'s');
  // a model that comes too late is given up on - the tile keeps its glyph and nothing is drawn after
  let t = 0;
  const lands = [];
  const slow = toolRig({ now: () => t, getGpuMesh: (id) => new Promise((r) => { lands.push(() => r({ gpu: id })); }) });
  const open = async (r, remap) => {
    r.frame();
    r.tool.drawPreview(remap);
    r.tool.openPanel();
    for (let i = 0; i < 6; i++) { r.frame({ overlayUp: true }); await settle(); }
    one(r.doc.body.children.find((c) => c.className === 'dfdecor'), 'dfdecor-card').getBoundingClientRect = () => ({ left: 100, top: 50, width: 600, height: 350 });
  };
  await open(slow, 'remap');
  slow.tool.drawPreview('remap');
  t = DECOR_THUMB_WAIT_MS + 1;
  slow.tool.drawPreview('remap');   // given up on
  for (const land of lands) land();
  await settle();
  slow.draws.length = 0;
  slow.tool.drawPreview('remap');
  await settle();
  assert.equal(slow.draws.filter((d) => d.panel && d.panel.rect.w === DECOR_THUMB_PX).length, 0, 'nothing drawn of a model given up on');
  // drawn in the host's law only once it answered (AUDIT 05b A5), as the preview is
  const table = new Map();
  let answer = null;
  const law = toolRig({ prepareModel: () => new Promise((r) => { answer = r; }) });
  await open(law, table);
  for (let i = 0; i < 3; i++) { law.tool.drawPreview(table); await settle(); }
  assert.equal(law.draws.filter((d) => d.panel && d.panel.rect.w === DECOR_THUMB_PX).length, 0, 'not before the law answered');
  answer?.();
  await settle();
  for (let i = 0; i < 3; i++) { law.tool.drawPreview(table); await settle(); }
  assert.ok(law.draws.filter((d) => d.panel && d.panel.rect.w === DECOR_THUMB_PX).length > 0, 'drawn once it did');
});
