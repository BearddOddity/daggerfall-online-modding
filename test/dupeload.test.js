// DUPE-LOAD (2026-10-11, the exploit audit the owner asked for: "Can we look deep for duping"). F11 loaded the save
// from under ANY window outdoors (FIX-E read every overlay for the death screen's hint), and the load closed only the
// death screen - so the pack, a loot window or a counter stood over the loaded game still holding what it had taken off
// the old one, and its close handed that back: drop the purse on the ground, F11, close the pack - the restored purse
// and a pile of the same gold at your feet, every load. Two halves, each pinned: only the death screen loads from under
// (`loadsUnder`, asked by the world host's arm and routeKey's both), and a load takes every other window down through
// its own close BEFORE the save is read and before its first await (world.js closeWindowsForLoad).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeKey } from '../src/ui/input.js';
import { DeathScreen } from '../src/ui/deathScreen.js';
import { NativeTradeWindow } from '../src/ui/nativeTrade.js';
import { snapshotPlayer, restorePlayer } from '../src/systems/save.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ICONS = { getTexture: async () => ({ recordCount: 0 }), uploadRecord: () => {}, textures: new Map() };
const F11 = () => ({ key: 'F11', code: 'F11', shiftKey: false, target: null, preventDefault() {} });

test('DUPE-LOAD the death screen is the one window F11 loads from under - routeKey (the dungeon and interior hosts) refuses it under any other (mutants: the overlay test dropped; the marker off the death screen)', () => {
  assert.equal(new DeathScreen({ eyeHeight: 1.6, capsuleHeight: 1.8 }).loadsUnder, true, 'the death screen says so itself');
  let loads = 0;
  const ctx = { uiOverlayActive: true, overlayIsNative: false, overlayInput() {}, quickLoad: () => { loads++; } };
  for (const win of [null, {}, { isPack: true }, new NativeTradeWindow({ mode: 'Sell', icons: ICONS, entity: { items: [] }, shelfItems: () => [], packItems: () => [], accepts: () => true, gold: () => 0 })]) {
    ctx.overlayWindow = () => win;
    routeKey(F11(), ctx, null, new Set());
  }
  assert.equal(loads, 0, 'no load from under a pack, a counter or a host that names no window');
  ctx.overlayWindow = () => new DeathScreen({ eyeHeight: 1.6, capsuleHeight: 1.8 });
  assert.equal(routeKey(F11(), ctx, null, new Set()), true);
  assert.equal(loads, 1, 'the death screen\'s F11 still loads');
});

test('DUPE-LOAD the world host: its arm reads the death screen alone, every routeKey host names its window, and the load takes every other window down before the save is read and before its first await (mutants: the arm on any window; the close after the restore; the close behind the awaits)', () => {
  const w = read('src/scenes/world.js');
  assert.match(w, /if \(townTalk\.overlayActive && townTalk\.overlay\?\.loadsUnder === true && !isTextEntryTarget\(e\.target\) && \(modes\?\.mode \?\? 'exterior'\) === 'exterior' && codeMeans\(bindings\(\), e\.code, 'QuickLoad'\)/);
  const fn = w.indexOf('async function worldQuickLoad(');
  const noSnap = w.indexOf("if (!snap) { townTalk.say('No saved game.'); return; }", fn);
  const closed = w.indexOf('closeWindowsForLoad();', fn);
  const firstAwait = w.indexOf('await ', noSnap);
  const restore = w.indexOf('const extras = restorePlayer(playerEntity, snap, spellsByIndex);', fn);
  assert.ok(fn > 0 && noSnap > fn && closed > noSnap, 'the windows come down once a save is in hand');
  assert.ok(closed < firstAwait && closed < restore, 'before the first await and before the restore');
  assert.match(read('src/scenes/worldModes.js'), /overlayWindow: \(\) => interiorOverlay,/, 'the building\'s key context names its window for routeKey');
  assert.match(read('src/scenes/dungeonContext.js'), /overlayWindow: \(\) => activeOverlay,/, 'and the dungeon\'s');
});

test('DUPE-LOAD closeWindowsForLoad: the street\'s slot emptied window by window through each one\'s own close, the death screen left for closeDeathScreen (mutants: one window closed; the death screen closed too)', () => {
  const w = read('src/scenes/world.js');
  const at = w.indexOf('function closeWindowsForLoad() {');
  const body = w.slice(at, w.indexOf('\n  }\n', at) + 4);
  const run = (townTalk) => new Function('townTalk', 'DeathScreen', `${body}; closeWindowsForLoad();`)(townTalk, DeathScreen);
  const closedOrder = [];
  const slot = (stack) => ({
    get overlay() { return stack.at(-1) ?? null; },
    closeOverlay() { const win = stack.pop(); if (!win) return false; closedOrder.push(win.name); win.dispose?.(); return true; },
  });
  const stack = [{ name: 'counter' }, { name: 'box' }, { name: 'pack' }];
  run(slot(stack));
  assert.deepEqual(closedOrder, ['pack', 'box', 'counter'], 'every window down, the top first');
  const death = new DeathScreen({ eyeHeight: 1.6, capsuleHeight: 1.8 });
  const withDeath = [death, { name: 'box' }];
  closedOrder.length = 0;
  run(slot(withDeath));
  assert.deepEqual(closedOrder, ['box'], 'a box over the death screen goes');
  assert.equal(withDeath.at(-1), death, 'the death screen stays for closeDeathScreen');
});

test('DUPE-LOAD the hazard the order closes, on the real counter: goods staged on a Sell counter and the save restored - closed BEFORE the restore the pack is the save\'s, closed after it the goods come back on top (the control: why the close must come first)', () => {
  const dagger = () => ({ group: 'Weapons', templateIndex: 113, name: 'Dagger', stackCount: 1, value: 30 });
  const counter = (entity) => new NativeTradeWindow({ mode: 'Sell', icons: ICONS, entity, shelfItems: () => [], packItems: () => (entity.items ??= []), accepts: () => true, gold: () => entity.goldPieces });
  const fresh = () => ({ name: 'Dup', level: 1, stats: {}, skills: {}, goldPieces: 0, items: [dagger()] });
  // the fix's order: the window down (townTalk.closeOverlay -> dispose -> its own close), then the restore
  const a = fresh();
  const save = JSON.parse(JSON.stringify(snapshotPlayer(a)));
  const wa = counter(a);
  wa._pickLocal(0);
  assert.equal(a.items.length, 0, 'staged: off the pack at the click');
  wa.dispose();
  restorePlayer(a, JSON.parse(JSON.stringify(save)), null);
  assert.deepEqual(a.items.map((i) => i.name), ['Dagger'], 'one dagger - the save\'s');
  // the old order: the restore under the open counter, the close after it
  const b = fresh();
  const wb = counter(b);
  wb._pickLocal(0);
  restorePlayer(b, JSON.parse(JSON.stringify(save)), null);
  wb.dispose();
  assert.deepEqual(b.items.map((i) => i.name), ['Dagger', 'Dagger'], 'the dupe the old order made');
});
