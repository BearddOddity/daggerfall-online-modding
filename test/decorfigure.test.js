// DECOR-FIGURE (2026-10-10, the owner: "remove the scaling option for npc sprites with house decoration
// interior/exterior"). One of Daggerfall's people placed as decor - a flat in a person's archive (RDBLayout.NPCFlatArchives,
// now in the leaf world/npcFlatArchives.js; the catalogue's Vendors), never one's own item - stands at its own size: the
// placer takes no size step for it (systems/decorPlacer.js decorEntrySized), the bar hides Smaller and Bigger and says no
// Size key (ui/decorPanel.js createDecorBar `sized`), the room and the yard draw one grown before at its own size
// (net/decorLaw.js decorDrawnScale - scenes/decorRoom.js), and the service refuses a figure written at another
// (decorScaleOk - server-account/src/decor.js placeDecor, moveDecor), a turn of one grown before kept. Each pin failed on
// the build before it. tools/mutants/decorfigure.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { decorIsFigure, decorDrawnScale, decorScaleOk } from '../src/net/decorLaw.js';
import { NPC_FLAT_ARCHIVES, isNpcFlat } from '../src/world/rdbLayout.js';
import * as leaf from '../src/world/npcFlatArchives.js';
import { createDecorPlacer, decorEntrySized } from '../src/systems/decorPlacer.js';
import { createDecorBar } from '../src/ui/decorPanel.js';
import { standService, T0 } from './accountDb.mjs';
import { fakeDoc, all, settle, toolRig, placeFrom, yardWorld, live, sized } from './decorFakes.mjs';

const figure = (over = {}) => ({ id: 'fig1', model: null, flat: [184, 17], pos: [1, 0, 1], rot: [0, 0, 0], scale: 1, light: null, storage: false, paid: 40, ...over });

test('DECOR-FIGURE the law: a figure is a flat of a person\'s archive, never a model, one\'s own item or another flat; it is drawn at its own size whatever its record says, and the service writes it at 1 alone; RDBLayout.NPCFlatArchives has one home, a leaf, re-exported (mutants: no figure, drawn at its record, the scale unasked)', () => {
  assert.equal(decorIsFigure(figure()), true);
  for (const a of NPC_FLAT_ARCHIVES) assert.equal(decorIsFigure(figure({ flat: [a, 0] })), true, String(a));
  assert.equal(decorIsFigure(figure({ flat: [210, 3] })), false, 'a candle');
  assert.equal(decorIsFigure({ ...figure(), model: 41000, flat: null }), false, 'a model');
  assert.equal(decorIsFigure(figure({ item: { t: 1 } })), false, 'one\'s own item');
  assert.equal(decorIsFigure(null), false);
  assert.equal(decorDrawnScale(figure({ scale: 2.5 })), 1, 'a figure grown before: its own size');
  assert.equal(decorDrawnScale(figure({ flat: [209, 0], scale: 2.5 })), 2.5, 'a book: its record\'s');
  assert.equal(decorDrawnScale({ model: 41000, flat: null, scale: 0.5 }), 0.5);
  assert.equal(decorScaleOk(figure()), true);
  assert.equal(decorScaleOk(figure({ scale: 1.1 })), false);
  assert.equal(decorScaleOk(figure({ flat: [209, 0], scale: 3 })), true, 'any other piece: the law\'s range');
  assert.equal(NPC_FLAT_ARCHIVES, leaf.NPC_FLAT_ARCHIVES, 'one list, re-exported');
  assert.equal(isNpcFlat, leaf.isNpcFlat);
});

test('DECOR-FIGURE the placer: a Vendors entry (or a person\'s flat moved before the catalogue is read) takes no size step and starts at 1 - a figure grown before brought back to its own size - while any other piece steps as before (mutants: the step taken, the old size kept, the kind unread)', () => {
  const vendor = { key: 'f184.17', model: null, flat: [184, 17], kind: 'people', name: 'Vendor' };
  assert.equal(decorEntrySized(vendor), false);
  assert.equal(decorEntrySized({ ...vendor, kind: 'decor' }), false, 'its flat alone says it');
  assert.equal(decorEntrySized({ key: 'f200.1', model: null, flat: [200, 1], kind: 'people' }), false, 'its kind alone says it - a person Daggerfall stands in a room, whatever archive its picture is in');
  assert.equal(decorEntrySized({ key: 'f209.0', model: null, flat: [209, 0], kind: 'books' }), true);
  const p = createDecorPlacer(vendor, { radius: 0.4 });
  assert.equal(p.sized, false);
  p.rescale(true); p.rescale(true); p.rescale(false);
  assert.equal(p.state().scale, 1, 'no step');
  assert.equal(p.pieceAt([2, 0, 2], [0, 0, 0], 'v1').scale, 1);
  const moved = createDecorPlacer(vendor, { radius: 0.4, from: figure({ scale: 2.2, rot: [30, 0, 0] }) });
  assert.equal(moved.state().scale, 1, 'grown before: its own size again');
  assert.equal(moved.state().yaw, 30, 'its turn kept');
  const book = createDecorPlacer({ key: 'f209.0', model: null, flat: [209, 0], kind: 'books' }, { radius: 0.4, from: figure({ flat: [209, 0], scale: 2 }) });
  assert.equal(book.sized, true);
  assert.equal(book.state().scale, 2, 'any other piece keeps its size');
  book.rescale(true);
  assert.equal(book.state().scale, 2.2);
});

test('DECOR-FIGURE the bar: `sized` false hides Smaller and Bigger and drops the Size key from the keys line; true shows them again (mutant: the buttons kept)', () => {
  const doc = fakeDoc();
  const bar = createDecorBar({ on: {}, doc });
  const chip = (label) => all(bar.root, 'dfdecor-chip').find((c) => c.textContent === label);
  const keys = () => all(bar.root, 'dfdecor-bar-keys')[0].textContent;
  bar.show({ name: 'Bed', price: 100 });
  assert.equal(!!chip('Smaller').hidden, false);
  assert.match(keys(), /Size: - and =/);
  bar.show({ name: 'Vendor', price: 40, sized: false });
  assert.equal(chip('Smaller').hidden, true);
  assert.equal(chip('Bigger').hidden, true);
  assert.doesNotMatch(keys(), /Size:/);
  bar.show({ name: 'Bed', price: 100, sized: true });
  assert.equal(chip('Bigger').hidden, false);
  assert.match(keys(), /Size: - and =/);
});

test('DECOR-FIGURE the decorator: a Vendor flown shows no Smaller or Bigger, a Bigger pressed (or = held) moves nothing, and it stands at 1; a book flown keeps both (mutant: the tool never tells the bar)', async () => {
  const rig = toolRig({ extraPeople: [[184, 17]] });
  await placeFrom(rig, 'f184.17');
  const bar = rig.doc.body.children.find((c) => String(c.className).startsWith('dfdecor-bar'));
  const chip = (label) => all(bar, 'dfdecor-chip').find((c) => c.textContent === label);
  rig.frame();
  assert.equal(chip('Bigger').hidden, true, 'no Bigger for a figure');
  chip('Bigger').fire('click');
  rig.win.fire?.('keydown', { code: 'Equal' });
  rig.frame();
  assert.equal(await rig.tool.commit(), true);
  const stood = rig.standing.at(-1);
  assert.deepEqual(stood.flat, [184, 17]);
  assert.equal(stood.scale, 1);
  const other = toolRig({ extraPeople: [[184, 17]] });
  await placeFrom(other, 'f209.0');
  other.frame();
  const bar2 = other.doc.body.children.find((c) => String(c.className).startsWith('dfdecor-bar'));
  const bigger = all(bar2, 'dfdecor-chip').find((c) => c.textContent === 'Bigger');
  assert.equal(!!bigger.hidden, false, 'a book: Bigger');
  bigger.fire('click');
  other.frame();
  assert.equal(await other.tool.commit(), true);
  assert.equal(other.standing.at(-1).scale, 1.1, 'and a step taken');
});

test('DECOR-FIGURE the room: a figure whose record says 2 stands at its own size; a book at 2 stands twice its size (mutant: the record\'s scale drawn)', async () => {
  const w = yardWorld({ pieces: [{ id: 'f', model: null, flat: [184, 17], pos: [8, 0, 2], rot: [0, 0, 0], scale: 2, light: null, storage: false, paid: 40 },
    { id: 'b', model: null, flat: [209, 0], pos: [9, 0, 3], rot: [0, 0, 0], scale: 2, light: null, storage: false, paid: 40 }] });
  await w.run();
  await settle();
  const fig = live(w.made).find((b) => b.a === 184);
  const book = live(w.made).find((b) => b.a === 209);
  assert.deepEqual(fig.size, sized(16, 32), 'its own size');
  assert.deepEqual(book.size, sized(16, 32, 2), 'twice its own');
});

test('DECOR-FIGURE the service: a figure placed at any size but its own is refused (`bad-decor`) and at 1 it stands; moved to another size it is refused; one grown before keeps its record on a turn, and is brought to its own size by a move (mutants: the place unguarded, the move unguarded, a turn of the old refused)', async (t) => {
  t.mock.method(Date, 'now', () => T0 * 1000);
  const svc = await standService();
  const owner = await svc.registered('Olga');
  const o = await svc.seatHome(owner, { mapId: 7, buildingKey: 300, region: 17, price: 5000 });
  const at = () => ({ id: o.character, ...svc.env.DB._raw.prepare('SELECT lease, seq FROM realm_characters WHERE id = ?').get(o.character) });
  const place = (piece) => svc.call('/v1/homes/decor/place', { mapId: 7, buildingKey: 300, character: o.character, realm: at(), piece }, owner.secret);
  const move = (id, pl) => svc.call('/v1/homes/decor/move', { mapId: 7, buildingKey: 300, character: o.character, id, place: pl }, owner.secret);
  const placeOf = (p) => ({ pos: p.pos, rot: p.rot, scale: p.scale, light: p.light, storage: p.storage, paid: p.paid });
  assert.equal((await place(figure({ scale: 2 }))).body.error, 'bad-decor', 'grown: refused');
  assert.equal((await place(figure({ id: 'book', flat: [209, 0], scale: 2 }))).status, 200, 'a book grown: stands');
  assert.equal((await place(figure())).status, 200, 'at its own size: stands');
  assert.equal((await move('fig1', placeOf(figure({ scale: 1.5 })))).body.error, 'bad-decor', 'moved to another size: refused');
  // one grown before DECOR-FIGURE, as its row stands
  svc.env.DB._raw.prepare('UPDATE home_decor SET place = ? WHERE id = ?').run(JSON.stringify(placeOf(figure({ scale: 2 }))), 'fig1');
  const turned = await move('fig1', placeOf(figure({ scale: 2, rot: [45, 0, 0] })));
  assert.equal(turned.status, 200, `a turn of the old: kept (${JSON.stringify(turned.body)})`);
  assert.equal((await move('fig1', placeOf(figure({ scale: 3 })))).body.error, 'bad-decor', 'grown further: refused');
  assert.equal((await move('fig1', placeOf(figure()))).status, 200, 'brought to its own size');
  assert.equal(JSON.parse(svc.env.DB._raw.prepare('SELECT place FROM home_decor WHERE id = ?').get('fig1').place).scale, 1);
});
