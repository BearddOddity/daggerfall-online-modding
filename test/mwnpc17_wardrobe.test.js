// MWNPC17 (2026-10-11, Mac: "We also need to hone in on what NPCs get what type of clothing/armor. General NPCs should
// have a procedural system where barely any 2 NPCs look alike" - bible/04-Characters/Morrowind-NPCs.md section 25): THE
// WARDROBE. A person is dressed from a ROLE off their own seed (characters/wardrobe.js dressPerson): the cut, the
// garments, the dyes, the cloak, the armour and its metal, the rung of Morrowind's clothing ladder; and the look's `npc`
// hint has the build pick each garment's record among the dye's nearest of that rung (mwItemMap.js mwClothingRecord) and
// walk the head and the hair each on its own (mwFirstPerson.js playerBodyRows). A player's look carries no hint and
// resolves as it always did.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  dressPerson, ROLES, ROLE_NAMES, ARMOR_KITS, armorKit, npcHint, npcHintOf, npcKeyOf, npcGarmentPick, withNpcPicks, npcFaceOf,
  wornByRole, weighted, MENS, WOMENS,
} from '../src/characters/wardrobe.js';
import { mwClothingRecord, clothingTierOf, CLOTH_PICK_NEAREST, CLOTHING_NAME, MW_CLOTHING_TYPE, dfWornEquipment, composeWornArmor, ARMO_PART } from '../src/formats/mwItemMap.js';
import { playerBodyRows } from '../src/formats/mwFirstPerson.js';
import { peerBuildOpts, peerBodyKey } from '../src/net/peerBodies.js';
import { peerStubEntity } from '../src/net/remotePlayers.js';
import { EQUIP_SLOTS } from '../src/systems/equip.js';
import { ARMOR_ENUM } from '../src/combat/enemyEquipment.js';
import { ARMOR_MATERIAL } from '../src/systems/armorMaterials.js';

const rd = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const seeds = (n, salt = 0) => Array.from({ length: n }, (_, i) => ((i + 1) * 2654435761 + salt) >>> 0);
const slotOf = (look, slot) => look.items.filter((it) => it.equipSlot === slot);

test('MWNPC17a dressPerson: one seed one person, every role dressed by its own table - its cut, its garments and dyes, a cloak at its odds; the cut a sprite shows honoured; robes cover the legs; armour\'s boots are the feet (mutants: the cut ignored; legs under a robe; shoes beside boots)', () => {
  for (const role of ROLE_NAMES) {
    for (const gender of ['male', 'female']) {
      for (const s of seeds(60, role.length)) {
        const d = dressPerson({ role, gender, seed: s });
        assert.deepEqual(dressPerson({ role, gender, seed: s }), d, 'pure: the same seed, the same person');
        assert.equal(d.role, role);
        assert.ok(wornByRole({ gender, items: d.items }, role), `${role} ${gender}: its own garments and dyes`);
        const legs = slotOf(d, EQUIP_SLOTS.LegsClothes), chest = slotOf(d, EQUIP_SLOTS.ChestClothes), feet = slotOf(d, EQUIP_SLOTS.Feet);
        assert.equal(chest.length, 1, 'one top or one robe');
        assert.equal(legs.length, d.cut === 'robe' ? 0 : 1, 'a robe hides the legs - nothing under it');
        assert.equal(feet.length, 1, 'one pair on the feet - the kit\'s boots or the cut\'s shoes, never both');
        assert.ok(d.tier >= 0 && d.tier <= 3 && ROLES[role].tiers[d.tier] > 0, 'a rung the role climbs to');
        assert.deepEqual(d.npc, npcHint(s, d.tier));
      }
    }
  }
  // the cut a sprite already shows is the cut worn, where the role has it - and the nearest where it has not
  for (const s of seeds(40)) {
    assert.equal(dressPerson({ role: 'scholar', gender: 'male', seed: s, cut: 'robe' }).cut, 'robe');
    assert.equal(dressPerson({ role: 'commoner', gender: 'female', seed: s, cut: 'skirt' }).cut, 'skirt');
    assert.equal(dressPerson({ role: 'tradesman', gender: 'male', seed: s, cut: 'robe' }).cut, 'pants', 'a tradesman has no robe: his breeches');
  }
  assert.equal(dressPerson({ role: 'nonsense', seed: 1 }).role, 'commoner', 'an unknown role: the street\'s');
  // the cloak: a role's odds, roughly
  const cloaks = (role) => seeds(400).filter((s) => dressPerson({ role, seed: s }).items.some((it) => it.equipSlot === EQUIP_SLOTS.Cloak1)).length / 400;
  assert.ok(cloaks('traveller') > 0.45 && cloaks('commoner') < 0.2, `a traveller's cloak (${cloaks('traveller')}) and the street's rare one (${cloaks('commoner')})`);
});

test('MWNPC17b who wears what: a noble never on the common rung and a commoner hardly ever past expensive; a priest in robes, a scholar mostly; a knight\'s whole plate of one metal by his rank, a fighter\'s pieces mismatched and no chain Morrowind cannot draw, a rogue in leather alone; the street and the court never armoured (mutants: one metal for a fighter; a chain helm; a noble in common clothes)', () => {
  const many = (role, gender = 'male', n = 300) => seeds(n, role.charCodeAt(0)).map((s) => dressPerson({ role, gender, seed: s }));
  assert.ok(many('noble').every((d) => d.tier >= 1), 'a noble: expensive and up');
  assert.ok(many('commoner').every((d) => d.tier <= 1), 'a commoner: common, now and then expensive');
  assert.ok(many('priest').filter((d) => d.cut === 'robe').length > 220, 'a priest in robes most of all');
  for (const role of ['commoner', 'tradesman', 'traveller', 'scholar', 'merchant', 'noble', 'priest', 'mage']) assert.ok(many(role).every((d) => !d.items.some((it) => it.group === 'Armor')), `${role}: no armour`);
  for (const d of many('knight')) {
    const plate = d.items.filter((it) => it.group === 'Armor');
    for (const t of [ARMOR_ENUM.Cuirass, ARMOR_ENUM.Greaves, ARMOR_ENUM.Boots, ARMOR_ENUM.Left_Pauldron, ARMOR_ENUM.Right_Pauldron]) assert.ok(plate.some((it) => it.templateIndex === t), 'the whole plate');
    assert.equal(new Set(plate.map((it) => it.material)).size, 1, 'one metal');
    assert.ok(ARMOR_KITS.knight.metals[d.tier].some(([m]) => m === plate[0].material), 'his rank\'s');
  }
  const knightMetals = new Set(many('knight').map((d) => d.items.find((it) => it.group === 'Armor').material));
  assert.ok(knightMetals.size >= 4, `an order of knights is not one smith's (${[...knightMetals]})`);
  const fighters = many('fighter');
  assert.ok(fighters.filter((d) => new Set(d.items.filter((it) => it.group === 'Armor').map((it) => it.material)).size > 1).length > 60, 'a fighter\'s pieces come from more than one smith');
  for (const d of fighters) for (const it of d.items) if (it.material === ARMOR_MATERIAL.Chain) assert.ok([ARMOR_ENUM.Cuirass, ARMOR_ENUM.Greaves].includes(it.templateIndex), 'chain only where Morrowind draws it');
  for (const d of fighters) {
    const l = d.items.find((it) => it.templateIndex === ARMOR_ENUM.Left_Pauldron), r = d.items.find((it) => it.templateIndex === ARMOR_ENUM.Right_Pauldron);
    assert.equal(!!l, !!r, 'the pauldrons a pair');
  }
  assert.ok(many('rogue').every((d) => d.items.filter((it) => it.group === 'Armor').every((it) => it.material === ARMOR_MATERIAL.Leather)), 'a rogue\'s leathers');
  assert.deepEqual(armorKit('nonsense', 1, 5), []);
  assert.equal(weighted([0, 0, 0], 7), 0);
  assert.equal(weighted([0, 5, 0], 123), 1);
});

/** A retail-shaped CLOT set: each type's records on every rung (Morrowind's common_/expensive_/extravagant_/exquisite_
 *  ids), each measured a colour of its own. */
function clothes() {
  const out = [];
  const rungs = [['common', 7], ['expensive', 3], ['extravagant', 2], ['exquisite', 1]];
  for (const [type, name] of [[MW_CLOTHING_TYPE.Shirt, 'shirt'], [MW_CLOTHING_TYPE.Pants, 'pants'], [MW_CLOTHING_TYPE.Shoes, 'shoes'], [MW_CLOTHING_TYPE.Robe, 'robe'], [MW_CLOTHING_TYPE.Skirt, 'skirt']]) {
    for (const [rung, n] of rungs) for (let i = 1; i <= n; i++) for (const v of ['', '_a', '_b']) out.push({ id: `${rung}_${name}_0${i}${v}`, type, model: `c/${rung}_${name}_${i}${v}.nif` });
  }
  return out;
}
const colourOf = (c) => { let h = 0; for (const ch of c.id) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0; return [h & 255, (h >>> 8) & 255, (h >>> 16) & 255]; };

test('MWNPC17c the item map: a person\'s rung narrows the pool (the nearest rung that has records, the lower first; a mod\'s ids kept whole), a pick chooses among the dye\'s nearest few or the pool; no pick and no rung, the resolution it always was (mutants: the rung ignored; the pick over the whole pool by colour; the lower rung not first)', () => {
  const C = clothes();
  assert.deepEqual(['common_shirt_01', 'Expensive_robe_02', 'extravagant_pants_01_a', 'exquisite_shoes_01', 'tm_robe_01', 'gondolier_shirt'].map(clothingTierOf), [0, 1, 2, 3, -1, -1]);
  const before = mwClothingRecord(C, 'Short Shirt', { dye: 2, colourOf });
  assert.equal(mwClothingRecord(C, 'Short Shirt', { dye: 2, colourOf, pick: null, tier: null }).record, before.record, 'a player\'s garment: unchanged');
  assert.equal(mwClothingRecord(C, 'Short Shirt').record.id, 'common_shirt_01', 'no dye, no pick: the id-sorted first');
  for (let t = 0; t < 4; t++) for (let p = 0; p < 12; p++) {
    const r = mwClothingRecord(C, 'Long Shirt', { dye: 4, colourOf, tier: t, pick: p }).record;
    assert.equal(clothingTierOf(r.id), t, 'the person\'s rung');
  }
  // the dye's nearest few: every pick lands among them, and the picks reach all of them
  const rung = C.filter((c) => c.type === MW_CLOTHING_TYPE.Pants && clothingTierOf(c.id) === 0);
  const got = new Set();
  for (let p = 0; p < 30; p++) got.add(mwClothingRecord(C, 'Casual Pants', { dye: 3, colourOf, tier: 0, pick: p }).record.id);
  assert.equal(got.size, CLOTH_PICK_NEAREST, `the ${CLOTH_PICK_NEAREST} nearest the dye, each reached`);
  const best = mwClothingRecord(rung, 'Casual Pants', { dye: 3, colourOf }).record.id;
  assert.ok(got.has(best), 'the nearest among them');
  // no colours to measure: the pick over the rung
  const blind = new Set();
  for (let p = 0; p < 60; p++) blind.add(mwClothingRecord(C, 'Shoes', { dye: 3, tier: 1, pick: p }).record.id);
  assert.equal(blind.size, 9, 'every expensive pair reached');
  // a rung the data lacks: the nearest one that has records, the lower first
  const noExq = C.filter((c) => clothingTierOf(c.id) !== 3);
  assert.equal(clothingTierOf(mwClothingRecord(noExq, 'Plain Robes', { tier: 3, pick: 1 }).record.id), 2, 'exquisite wanted, extravagant worn');
  const onlyRich = C.filter((c) => clothingTierOf(c.id) >= 2);
  assert.equal(clothingTierOf(mwClothingRecord(onlyRich, 'Plain Robes', { tier: 0, pick: 1 }).record.id), 2, 'common wanted, the nearest there is');
  const midGap = C.filter((c) => clothingTierOf(c.id) !== 1);
  assert.equal(clothingTierOf(mwClothingRecord(midGap, 'Plain Robes', { tier: 1, pick: 1 }).record.id), 0, 'one down before one up');
  const modded = [{ id: 'tm_shirt_a', type: MW_CLOTHING_TYPE.Shirt, model: 'x' }, { id: 'tm_shirt_b', type: MW_CLOTHING_TYPE.Shirt, model: 'y' }];
  assert.equal(mwClothingRecord(modded, 'Short Shirt', { tier: 2, pick: 1 }).record.id, 'tm_shirt_b', 'ids with no rung: the pool whole');
  assert.ok(CLOTHING_NAME[MENS.priestRobes] === 'Priest Robes' && CLOTHING_NAME[WOMENS.eveningGown] === 'Evening Gown', 'the wardrobe names Daggerfall\'s own templates');
  // and the composer hands a garment's rung and pick to the resolver - the worn body's own path
  const chest = ARMO_PART.findIndex((r) => r.name === 'cuirass');   // a shirt's part is the cuirass slot's (PRT_Cuirass)
  const worn = C.filter((c) => c.type === MW_CLOTHING_TYPE.Shirt).map((c) => ({ ...c, parts: [{ part: chest, male: `b_${c.id}` }] }));
  const bodyPool = worn.map((c) => ({ id: `b_${c.id}`, model: `${c.id}.nif` }));
  const put = (extra) => composeWornArmor({ pieces: [{ kind: 'clothing', templateIndex: MENS.shortShirts[0], name: 'Short Shirt', dye: 2, ...extra }], armors: [], clothes: worn, bodyPool, female: false, colourOf }).adds[0].recordId;
  for (let t = 0; t < 4; t++) assert.equal(clothingTierOf(put({ tier: t, pick: 1 }).slice(2)), t, `composed: the person's rung (${t})`);
  assert.equal(put({}), `b_${mwClothingRecord(worn, 'Short Shirt', { dye: 2, colourOf }).record.id}`, 'composed with neither: as it always was');
});

test('MWNPC17d the build reads the hint: each garment its rung and pick, the head and the hair walked each on its own; a player\'s look and a wolf\'s take none; two people in one outfit are two bodies (mutants: the picks dropped; the face walked off one hash; the key without the hint)', () => {
  const d = dressPerson({ role: 'merchant', gender: 'male', seed: 0xbeef });
  const look = { race: 'Breton', gender: 'male', faceIndex: 3, items: d.items, npc: d.npc };
  const o = peerBuildOpts(look);
  const garments = o.armor.filter((p) => p.kind === 'clothing');
  assert.ok(garments.length >= 3);
  for (const g of garments) {
    assert.deepEqual({ pick: g.pick, tier: g.tier }, npcGarmentPick(d.npc, g));
    assert.ok(Math.abs(g.tier - d.npc.tier) <= 1, 'a rung either side of the person\'s at most');
  }
  assert.deepEqual(o.npcFace, npcFaceOf(d.npc));
  const player = { race: 'Breton', gender: 'male', faceIndex: 3, items: d.items };
  const p = peerBuildOpts(player);
  assert.equal(p.npcFace, undefined, 'a player\'s look: no walk');
  assert.deepEqual(p.armor, dfWornEquipment(peerStubEntity(player).equip.slots, EQUIP_SLOTS, ARMOR_ENUM), 'and its garments as they always were');
  assert.equal(peerBuildOpts(look, { wb: 1 }).npcFace, undefined, 'a wolf has no face to walk');
  assert.notEqual(peerBodyKey(look), peerBodyKey({ ...look, npc: npcHint(0xbeef + 1, d.npc.tier) }), 'two people in one outfit: two bodies');
  assert.equal(peerBodyKey(player), peerBodyKey({ ...player }), 'a player\'s key as it was');
  assert.equal(npcKeyOf(player), '');
  for (const bad of [{ seed: -1, tier: 0 }, { seed: 1.5, tier: 0 }, { seed: 1, tier: 4 }, { seed: 2 ** 32, tier: 0 }, 'x', null]) assert.equal(npcHintOf({ npc: bad }), null, `a hint read as data: ${JSON.stringify(bad)}`);
  // the walk: each slot its own step, over the race's pools
  const parts = [];
  for (let i = 0; i < 8; i++) parts.push({ id: `b_n_breton_m_head_0${i}`, race: 'breton', slot: 'head', skin: true, playable: true, firstPerson: false, female: false });
  for (let i = 0; i < 6; i++) parts.push({ id: `b_n_breton_m_hair_0${i}`, race: 'breton', slot: 'hair', skin: true, playable: true, firstPerson: false, female: false });
  const face = (walk) => { const rows = playerBodyRows(parts, 'breton', false, { faceIndex: 0, walk }); return ['head', 'hair'].map((s) => rows.find((r) => r.slot === s).record.id); };
  assert.deepEqual(face({ head: 3, hair: 4 }), ['b_n_breton_m_head_03', 'b_n_breton_m_hair_04']);
  assert.deepEqual(face({ head: 11, hair: 13 }), ['b_n_breton_m_head_03', 'b_n_breton_m_hair_01'], 'each modulo its own pool');
  assert.deepEqual(face(null), ['b_n_breton_m_head_00', 'b_n_breton_m_hair_00'], 'no walk: the face index\'s, as before');
  const pairs = new Set(seeds(400).map((s) => face(npcFaceOf(npcHint(s, 0))).join()));
  assert.ok(pairs.size >= 44, `a race's heads times its hairs reached (${pairs.size} of 48)`);
  assert.match(rd('src/combat/fpArm.js'), /\} else if \(npcFace\) \{\n {6}faceMatch = \{ head: null, hair: null, reasons: \['an NPC: its head and hair walked off its seed'\] \};/, 'an NPC is no portrait: nothing measured');
});

test('MWNPC17e BARELY ANY TWO ALIKE: two hundred of one street - one race, one sex, one sprite - resolved as the build resolves them, garment records, head and hair; and the classic tables kept the face index\'s ten (mutants: the pick off; the walk off)', () => {
  const C = clothes();
  const parts = [];
  for (let i = 0; i < 8; i++) parts.push({ id: `h${i}`, race: 'breton', slot: 'head', skin: true, playable: true, firstPerson: false, female: false });
  for (let i = 0; i < 6; i++) parts.push({ id: `r${i}`, race: 'breton', slot: 'hair', skin: true, playable: true, firstPerson: false, female: false });
  const seen = (look) => {
    const o = peerBuildOpts(look);
    const worn = o.armor.filter((p) => p.kind === 'clothing').map((p) => mwClothingRecord(C, p.name, { dye: p.dye, colourOf, tier: p.tier ?? null, pick: p.pick ?? null }).record?.id ?? '-');
    const rows = playerBodyRows(parts, 'breton', false, { faceIndex: look.faceIndex, walk: o.npcFace ?? null });
    return [...worn.sort(), rows.find((r) => r.slot === 'head').record.id, rows.find((r) => r.slot === 'hair').record.id].join('|');
  };
  const people = seeds(200, 77).map((s) => { const d = dressPerson({ role: 'commoner', gender: 'male', seed: s, cut: 'pants' }); return { race: 'Breton', gender: 'male', faceIndex: s % 10, items: d.items, npc: d.npc }; });
  const distinct = new Set(people.map(seen));
  assert.ok(distinct.size >= 196, `two hundred commoners, ${distinct.size} distinct to the eye`);
  // the same two hundred without the hint - the resolution before this slice: far fewer
  const plain = new Set(people.map((l) => seen({ ...l, npc: undefined })));
  assert.ok(plain.size < distinct.size, `without it: ${plain.size}`);
});
