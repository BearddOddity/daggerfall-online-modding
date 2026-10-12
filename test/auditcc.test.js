import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { SURVIVAL_RULES } from '../src/systems/survival/difficulty.js';
import { newSurvival, survivalMinute, runSurvivalMinutes } from '../src/systems/survival/needs.js';
import { CLIMATE_TEMP, CLIMATE_NAMES, COVERING_CHEST, naturalTemperature, feltTemperature, temperatureBreakdown } from '../src/systems/survival/temperature.js';
import { dateFromClassicMinutes, dateToClassicMinutes } from '../src/systems/gameDate.js';
import { CLIMATES } from '../src/formats/mapsFile.js';
import { RACES } from '../src/systems/races.js';
import { templateByIndex, mintCondition } from '../src/systems/itemTemplates.js';
import { createEquipTable } from '../src/characters/equipTable.js';
import { equipItem } from '../src/systems/equip.js';

// ═══ AUDIT C&C (2026-10-12): THE OWNER'S DECISIONS, MADE, AND THE COMPREHENSIVE AUDIT ═══
//
// The owner: "Make the best decisions. DO a comprehensive audit on everything ensuring perfection". The open questions
// AUDIT SURV-BOONS and AUDIT TEMP-UI left (bible/06-Systems/Climates-Calories.md, AUDIT C&C) decided - E4 the sea at
// nought, E5 a jump felt at its own hours offline - and six cold lenses over the whole arc (the law, the temperature and
// the four hosts, every surface, the save and the wire, the records, everything the arc touches), every finding
// reproduced before it was fixed. The numbers are LITERALS (A PIN MUST FAIL).

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const CASUAL = SURVIVAL_RULES.casual;
const STATS = Object.freeze({ strength: 50, intelligence: 50, willpower: 50, agility: 50, endurance: 50, personality: 50, speed: 50, luck: 50 });
const body = (from) => ({ stats: { ...STATS }, raceId: RACES.Breton, items: [], activeEffects: [], health: 40, maxHealth: 40, fatigue: 6400, survival: newSurvival(from) });
const deps = (extra = {}) => ({ sinks: {}, autoDrink: false, autoEat: false, rules: CASUAL, rolls: () => 0.99, ctx: { raceId: RACES.Breton }, ...extra });
const hourOf = (m) => (((m % 1440) + 1440) % 1440) / 60;
/** The env a host hands at classic minute `m` (world.js survivalEnvNow: the sky's month and fractional hour). */
const skyAt = (base, m) => ({ ...base, hour: hourOf(m), month: dateFromClassicMinutes(m).month });

test('AUDIT C&C E4: THE SEA IS AT NOUGHT - Ocean, every pixel of which the port\'s one water law calls sea, is the season, the hour and the weather alone (the mod\'s +20 beach made a winter crossing comfortable and a summer one hot); the breakdown says Sea', () => {
  assert.equal(CLIMATE_TEMP[CLIMATES.Ocean], 0);
  assert.equal(CLIMATE_NAMES[CLIMATES.Ocean], 'Sea');
  // a winter crossing at noon is Morning Star's -20 alone; a summer one Sun's Height's +20, warm and no hotter
  assert.equal(naturalTemperature({ climateIndex: CLIMATES.Ocean, month: 0, hour: 12, weather: 'sunny' }), -20);
  assert.equal(naturalTemperature({ climateIndex: CLIMATES.Ocean, month: 6, hour: 12, weather: 'sunny' }), 20);
  // a winter night's storm at sea, -20 - 20 - 15 = -55
  assert.equal(naturalTemperature({ climateIndex: CLIMATES.Ocean, month: 0, hour: 2, weather: 'thunder' }), -55);
  // the land's own are untouched
  assert.equal(CLIMATE_TEMP[CLIMATES.Woodlands], -10); assert.equal(CLIMATE_TEMP[CLIMATES.Desert2], 50); assert.equal(CLIMATE_TEMP[CLIMATES.Mountain], -40);
  const env = { climateIndex: CLIMATES.Ocean, month: 0, hour: 12, weather: 'sunny' };
  const rows = temperatureBreakdown(env, feltTemperature(env, null, { raceId: RACES.Breton }));
  assert.deepEqual(rows[0], { key: 'climate', label: 'Sea', value: 0 }, 'the climate row, said even at nought');
});

test('AUDIT C&C E5: A JUMP\'S MINUTES ARE FELT AT THEIR OWN HOUR AND MONTH OFFLINE - the jump is the minutes walked one by one at their own sky; online the sky stands (LIVED1) and the host\'s hour holds; the tick says which (worldTick.js: offline the sky is the clock)', () => {
  // a mountain summer night into the morning: the night and the dawn past 30 degrees (exposure climbs), the day not (it falls)
  const MOUNTAIN = { climateIndex: CLIMATES.Mountain, weather: 'sunny' };
  const from = dateToClassicMinutes({ year: 405, month: 6, day: 10, hour: 0, minute: 0 }), to = from + 9 * 60;
  const walked = (stepped) => {
    const e = body(from);
    for (let m = from + 1; m <= to; m++) survivalMinute(e, m, stepped || m === to ? skyAt(MOUNTAIN, m) : skyAt(MOUNTAIN, to), deps({ replay: m < to, landing: m === to }));
    return e.survival;
  };
  const jump = (skyFollows) => { const e = body(from); runSurvivalMinutes(e, from, to, skyAt(MOUNTAIN, to), deps({ skyFollows })); return e.survival; };
  const off = jump(true), on = jump(false);
  assert.equal(off.exposure, 357, 'offline: 00:01 to 07:59 past 30 (+479), then 08:00 to 09:00 by day (-2 x 61)');
  assert.equal(on.exposure, 0, 'online: the whole jump at the landing\'s day hour - never past 30');
  for (const k of ['exposure', 'thirst', 'wet', 'felt']) {
    assert.equal(off[k], walked(true)[k], `offline the jump is the minutes walked at their own hour (${k})`);
    assert.equal(on[k], walked(false)[k], `online the jump is the minutes walked at the host's hour (${k})`);
  }
  // AND THE MONTH: across a month's end in the subtropics, the old month's last hour is a month cooler (less thirst)
  const SUB = { climateIndex: CLIMATES.Subtropical, weather: 'sunny' };
  const turn = dateToClassicMinutes({ year: 405, month: 6, day: 0, hour: 0, minute: 0 });
  const t = (skyFollows) => { const e = body(turn - 60); runSurvivalMinutes(e, turn - 60, turn + 60, skyAt(SUB, turn + 60), deps({ skyFollows })); return e.survival.thirst; };
  const walkedMonth = () => { const e = body(turn - 60); for (let m = turn - 59; m <= turn + 60; m++) survivalMinute(e, m, skyAt(SUB, m), deps({ replay: m < turn + 60, landing: m === turn + 60 })); return e.survival.thirst; };
  assert.equal(t(true), walkedMonth(), 'offline: each side of the month\'s end at its own month');
  assert.ok(t(true) < t(false), `the old month's hour is cooler: ${t(true)} < ${t(false)}`);
  // the minute landed in is the host's: a jump that lands at 08:00 feels its last minute by day, not at 07:59's dawn
  const edge = from + 8 * 60;
  const landed = () => { const e = body(from); runSurvivalMinutes(e, from, edge, skyAt(MOUNTAIN, edge), deps({ skyFollows: true })); return e.survival.exposure; };
  assert.equal(landed(), 477, 'offline: 00:01 to 07:59 past 30 (+479), and the landing at 08:00 by day (-2)');
  // a one-minute step is that minute: the host's own env, stepped or not
  const one = (skyFollows) => { const e = body(from); runSurvivalMinutes(e, from, from + 1, skyAt(MOUNTAIN, from + 600), deps({ skyFollows })); return e.survival.felt; };
  assert.equal(one(true), one(false), 'one minute is lived in the host\'s env');
  // the tick says it: offline (no shared clock) the sky is the clock
  assert.match(read('src/systems/worldTick.js'), /runSurvivalMinutes\(entity, lastMinutes, nowMinutes, survival\.env \?\? \{\}, \{ [^\n]*skyFollows: !_sharedClock \}\);/);
});

test('AUDIT C&C T1: A GOWN COVERS THE ARMOUR AND A STRAP DOES NOT - COVERING_CHEST is the mod\'s own list (Climates.cs ArmorCovered: the robes and the three long gowns), where SURV1\'s reading of the IL had the Anticlere Surcoat and the Challenger Straps in the gowns\' place', () => {
  assert.deepEqual([...COVERING_CHEST].map((i) => templateByIndex(i)?.name).sort(),
    ['Casual Dress', 'Day Gown', 'Evening Gown', 'Plain Robes', 'Plain Robes', 'Priest Robes', 'Priestess Robes']);
  // through the equip path: a plate cuirass in the deep desert's noon sun, under each chest garment (or none)
  const NOON = { climateIndex: CLIMATES.Desert2, month: 6, hour: 12, weather: 'sunny', inSunlight: true };
  const under = (templateIndex) => {
    const e = { ...body(0), isPlayer: true, career: {}, skills: new Array(35).fill(30), level: 5, equip: createEquipTable() };
    equipItem(e, mintCondition({ group: 'Armor', templateIndex: 102, material: 0x0200, name: 'Cuirass', flags: 0, variant: 0 }));
    if (templateIndex) equipItem(e, mintCondition({ group: templateIndex >= 182 ? 'WomensClothing' : 'MensClothing', templateIndex, name: 'garment', flags: 0, variant: 0 }));
    const t = feltTemperature(NOON, e.equip.slots, { raceId: RACES.Breton });
    return { metal: t.metal, note: temperatureBreakdown(NOON, t).find((r) => r.key === 'armour')?.note ?? null };
  };
  // the cuirass's metal is 4: the deep desert's noon of 70 makes it 14 in the sun
  assert.deepEqual(under(null), { metal: 14, note: 'hot metal' }, 'bare: the sun on the metal');
  for (const [i, name] of [[195, 'Evening Gown'], [196, 'Day Gown'], [197, 'Casual Dress'], [163, 'Plain Robes'], [164, 'Priest Robes'], [200, 'Plain Robes'], [201, 'Priestess Robes']]) {
    assert.deepEqual(under(i), { metal: 0, note: null }, `${name} covers it`);
  }
  for (const [i, name] of [[177, 'Challenger Straps'], [176, 'Anticlere Surcoat'], [157, 'Dwynnen Surcoat'], [181, 'Champion Straps'], [198, 'Strapless Dress']]) {
    assert.deepEqual(under(i), { metal: 14, note: 'hot metal' }, `${name} does not`);
  }
});

test('AUDIT C&C B11: THE ENHANCED MENU\'S ATTRIBUTES PAGE NAMES THE BOONS THAT RAISE THEM - under the meters, from the pack\'s one source (ui/temperatureCard.js boonStatRows: nothing outside the Boons tier), so a raised attribute is explained on every sheet that shows it', () => {
  const src = read('src/ui/enhancedMenu.js');
  assert.match(src, /import \{ boonStatRows \} from '\.\/temperatureCard\.js';/);
  const fn = src.slice(src.indexOf('function statsAttributes('), src.indexOf('\n}\n', src.indexOf('function statsAttributes(')));
  assert.match(fn, /const boons = boonStatRows\(playerEntity\);\n\s*if \(!boons\.length\) return;\n\s*detail\.append\(pxDivider\('Boons'\)\);/, 'the section only when a boon stands, after the eight meters');
  assert.match(fn, /r\.append\(el\('span', 'k', k\), el\('span', 'v', v\)\);/, 'each boon its name and what it gives');
  assert.ok(fn.indexOf('meterRow(') < fn.indexOf('boonStatRows('), 'the meters first');
});
