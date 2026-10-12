import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { SURVIVAL_RULES, SURVIVAL_TIER_IDS, SURVIVAL_STORED, SURVIVAL_DEFAULT, rulesForTier, tierOfStored, isStoredTier } from '../src/systems/survival/difficulty.js';
import { SURVIVAL_PREF, survivalTier, survivalOn, survivalRules } from '../src/systems/survival/switch.js';
import {
  NEED, BOON, BOON_IDS, HEARTH_FATIGUE, WELL_RESTED_PER_SLEEP_MINUTE, WELL_RESTED_MAX_MINUTES, SURVIVAL_TEXT,
  newSurvival, survivalMinute, runSurvivalMinutes, survivalBoons, survivalStatMods, paySleep,
} from '../src/systems/survival/needs.js';
import { HUD_BOON_WORDS, STATUS_TEXT, survivalHudChips, survivalStatusLines } from '../src/systems/survival/status.js';
import { restCost } from '../src/systems/survival/rest.js';
import { survivalFeed, survivalGateOn } from '../src/systems/survival/env.js';
import { TEMPLATE, eatLaw } from '../src/systems/survival/food.js';
import { createSurvivalItem } from '../src/systems/survival/items.js';
import { tavernOrder, TAVERN_MENU_TEXT } from '../src/systems/survival/tavernMenu.js';
import { sleepShortRest, NIGHT_MINUTES } from '../src/systems/restAct.js';
import { statusTiles, needGlyph, STATUS_GLYPHS } from '../src/ui/hudStatus.js';
import { liveStat, maxFatigue } from '../src/systems/statMods.js';
import { FEATURES } from '../src/systems/features.js';
import { onlineForcedPref } from '../src/systems/onlineLane.js';
import { setPref, _resetForTests } from '../src/systems/uiPrefs.js';
import { CLIMATES } from '../src/formats/mapsFile.js';
import { RACES } from '../src/systems/races.js';

// ═══ SURV-BOONS (2026-10-12): THE FOURTH TIER ═════════════════════════
//
// The owner: "I want to force a new version of Climates and Calories, but a
// completely different version. Instead of punishing players for not
// tending, we instead provides boons to those who unkeep. Much like
// [Valheim]. Players would still be able to switch between CAC versions."
//
// Boons is a tier on the one key (survival/difficulty.js), between Off and
// Casual. These pins hold its four rules: the same world; NOTHING IS EVER
// TAKEN (no stamina, attribute, health, condition, disease, refusal or
// roll against the player); A BODY KEPT EARNS (Well fed, Quenched, Well
// rested - banked only by a bed or a fire - Thriving for all three, and
// the hearth's stamina); and NO RED on the strip, because nothing costs.

const BOONS = SURVIVAL_RULES.boons;
const CASUAL = SURVIVAL_RULES.casual;
const HARD = SURVIVAL_RULES.hard;
const STATS = Object.freeze({ strength: 50, intelligence: 50, willpower: 50, agility: 50, endurance: 50, personality: 50, speed: 50, luck: 50 });
/** A player whose pool is (50 + 50) x 64 = 6400 fatigue units. */
const body = (extra = {}) => ({ stats: { ...STATS }, raceId: RACES.Breton, items: [], activeEffects: [], health: 40, maxHealth: 40, fatigue: 6400, ...extra });
const sinksFor = (e, log = []) => ({
  drainFatigue: (n) => { log.push(['fatigue', n]); e.fatigue = Math.max(0, e.fatigue - n); },
  restoreFatigue: (n) => { log.push(['restore', n]); e.fatigue = Math.min(maxFatigue(e), e.fatigue + n); },
  hurt: (n) => { log.push(['hurt', n]); e.health = Math.max(0, e.health - n); },
  say: (t) => log.push(['say', t]),
});
const deps = (e, log, rules, extra = {}) => ({ sinks: sinksFor(e, log), autoDrink: false, autoEat: false, rules, rolls: () => 0.01, ctx: { raceId: RACES.Breton }, ...extra });
/** Indoors in the woods in midsummer: a naked Breton feels a comfortable 5. */
const INDOORS = Object.freeze({ climateIndex: CLIMATES.Woodlands, month: 6, hour: 12, weather: 'sunny', insideBuilding: true });
const BLIZZARD = Object.freeze({ climateIndex: CLIMATES.Mountain, month: 0, hour: 2, weather: 'snow' });
const entry = (e) => e.activeEffects.find((a) => a?.kind === 'survival')?.statMods ?? {};
const said = (log) => log.filter((l) => l[0] === 'say').map((l) => l[1]);
const run = (e, from, to, env, rules, log = []) => { for (let m = from; m <= to; m++) survivalMinute(e, m, env, deps(e, log, rules)); return log; };
/** A night in a bed, then breakfast and a drink: the sleeper wakes fed, watered and well rested at minute 480. */
const restedBody = (extra = {}) => {
  const e = body({ survival: newSurvival(0), ...extra });
  run(e, 1, 480, { ...INDOORS, resting: true, sleeping: 'bed' }, BOONS);
  e.survival.lastAte = 480; e.survival.thirst = 0;
  return e;
};
const plate = () => ({ templateIndex: 104, group: 'Armor', material: 0x0200, maxCondition: 100, currentCondition: 100, name: 'Plate Cuirass' });

afterEach(() => { _resetForTests(); });

test('SURV-BOONS: the fourth tier - on the one key, stored by name between Off and Casual; the switch reads it, the shelf keeps it, the feed hands its rules, the gate stays down, and it is the player\'s online; Casual stays the default', () => {
  assert.deepEqual([...SURVIVAL_TIER_IDS], ['off', 'boons', 'casual', 'hard']);
  assert.equal(SURVIVAL_STORED.boons, 'boons');
  assert.equal(isStoredTier('boons'), true); assert.equal(tierOfStored('boons'), 'boons'); assert.equal(rulesForTier('boons'), BOONS);
  assert.equal(SURVIVAL_DEFAULT, 'casual', 'a new tier is a choice, not the new default');
  const row = FEATURES.find((f) => f.id === 'mod-climates-calories');
  assert.deepEqual(row.control.tiers[1], ['boons', 'Boons'], 'the bar\'s second segment');
  assert.match(row.note, /On Boons nothing is taken and a body kept fed, watered and rested earns bonuses/);
  setPref(SURVIVAL_PREF, 'boons');
  assert.equal(survivalTier(), 'boons'); assert.equal(survivalOn(), true); assert.equal(survivalRules(), BOONS);
  assert.equal(survivalFeed(body(), INDOORS).deps.rules, BOONS, 'the feed hands the minute law the Boons rules');
  assert.equal(survivalGateOn(), false, 'nothing refuses a Boons sleep');
  assert.equal(onlineForcedPref(SURVIVAL_PREF, '?online=1'), undefined, 'the room forces no tier');
  // the table: only Boons rewards
  assert.equal(BOONS.boons, true); assert.equal(CASUAL.boons, false); assert.equal(HARD.boons, false);
});

test('SURV-BOONS: NOTHING IS EVER TAKEN - the worst day (starving, dehydrated, exhausted, soaked, half naked, barefoot in a blizzard in wet plate) takes no stamina, no health, no attribute and no condition; and every red reading the law can meet, over every climate, month, hour and weather, takes nothing', () => {
  const armour = plate();
  const worn = []; worn[18] = armour;
  const e = body({ survival: { ...newSurvival(0), lastAte: -5000, thirst: 140, sleepDebt: 20, wet: 250 } });
  const log = run(e, 1, 600, BLIZZARD, BOONS, []);
  for (let m = 601; m <= 1200; m++) survivalMinute(e, m, BLIZZARD, deps(e, log, BOONS, { worn }));
  assert.deepEqual(log.filter((l) => l[0] === 'fatigue' || l[0] === 'hurt'), [], 'no drain and no wound');
  assert.equal(e.fatigue, 6400); assert.equal(e.health, 40);
  assert.equal(armour.currentCondition, 100, 'no rust, on a 1% roll a minute');
  assert.ok(Object.values(entry(e)).every((n) => n >= 0), 'no attribute taken');
  assert.deepEqual(e.survival.boons, [], 'and nothing earned: every need is unmet');
  assert.equal('borrowed' in e.survival, false, 'nothing lent');
  // the sweep: each climate, a month and hour at each end, each weather, from a body with every need red
  let minutes = 0;
  for (const climateIndex of Object.values(CLIMATES)) for (const month of [0, 6]) for (const hour of [2, 14]) for (const weather of ['sunny', 'rain', 'snow', 'storm']) {
    const b = body({ fatigue: 6400, survival: { ...newSurvival(0), lastAte: -5000, thirst: 140, sleepDebt: 20, wet: 250 } });
    const l = run(b, 1, 30, { climateIndex, month, hour, weather }, BOONS, []);
    minutes += 30;
    assert.deepEqual(l.filter((x) => x[0] === 'fatigue' || x[0] === 'hurt'), [], `${climateIndex}/${month}/${hour}/${weather}`);
  }
  assert.ok(minutes > 1000);
  // and the costs that live outside the minute law: the rough rest, the gate's table, the meal, the house
  assert.deepEqual(restCost('rough', BOONS), { recovery: 1, encounters: 1, stiffHours: 0 }, 'the rest window is DFU\'s whole hour, one ask, no morning');
  assert.equal(BOONS.restGate, false);
  const raw = createSurvivalItem(TEMPLATE.RawFish);
  assert.equal(eatLaw(raw, { lastAte: 0, now: 5000, luck: 10, rolls: () => 0.99, rules: BOONS }).sick, null, 'no sickness roll');
  assert.deepEqual(tavernOrder({ ...newSurvival(0), drunk: 45 }, 0, { kind: 'drink', strength: 35, price: 1 }, { endurance: 50, rules: BOONS }), { ok: false, text: TAVERN_MENU_TEXT.cutOff }, 'the barkeep stops pouring before a blackout');
});

test('SURV-BOONS: Well fed and Quenched - earned while the hunger and the thirst stand at their first stage, the entry carrying BOON\'s points, and lapsing the minute Peckish and Thirsty arrive; a better meal is a longer Well fed', () => {
  const e = body({ survival: newSurvival(0) });
  survivalMinute(e, 1, INDOORS, deps(e, [], BOONS));
  assert.deepEqual(e.survival.boons, ['fed', 'quenched']);
  assert.deepEqual(entry(e), { ...BOON.fed, ...BOON.quenched });
  assert.equal(liveStat(e, 'strength'), 55); assert.equal(liveStat(e, 'speed'), 55);
  assert.equal(maxFatigue(e), (55 + 55) * 64, 'Well fed\'s strength and endurance are a bigger pool - Valheim\'s food');
  // Peckish: the hunger at its second stage
  e.survival.lastAte = 2 - NEED.PECKISH_AT;
  survivalMinute(e, 2, INDOORS, deps(e, [], BOONS));
  assert.deepEqual(e.survival.boons, ['quenched'], 'Peckish ends Well fed');
  e.survival.lastAte = 3 - NEED.PECKISH_AT + 1;
  survivalMinute(e, 3, INDOORS, deps(e, [], BOONS));
  assert.ok(e.survival.boons.includes('fed'), 'a minute short of Peckish is still fed');
  e.survival.lastAte = 4; e.survival.thirst = NEED.THIRSTY;
  survivalMinute(e, 4, INDOORS, deps(e, [], BOONS));
  assert.deepEqual(e.survival.boons, ['fed'], 'Thirsty ends Quenched');
  assert.deepEqual(entry(e), { ...BOON.fed });
  // a better meal is a longer boon: the worth banked against the hunger (food.js eatLaw)
  const fed = (t) => eatLaw(createSurvivalItem(t), { lastAte: 0, now: 1000, rules: BOONS }).lastAte;
  assert.ok(fed(TEMPLATE.CookedFish) > fed(TEMPLATE.RawFish), 'cooked fish keeps the boon longer than raw');
});

test('SURV-BOONS: Well rested - banked only by sleep in a bed or by a fire (the minute law\'s night and REST-SLEEP1\'s short rest alike), never by the rest window, capped at twelve hours, spent a waking minute at a time and gone when spent', () => {
  for (const kind of ['bed', 'camp']) {
    const s = newSurvival(0);
    paySleep(s, kind, 60, 60, BOONS);
    assert.equal(s.wellRested, 60 * WELL_RESTED_PER_SLEEP_MINUTE, `${kind}: an hour asleep banks an hour and a half`);
    paySleep(s, kind, 24 * 60, 2000, BOONS);
    assert.equal(s.wellRested, WELL_RESTED_MAX_MINUTES, `${kind}: the bank's ceiling`);
  }
  const rough = newSurvival(0); paySleep(rough, 'rough', 480, 480, BOONS);
  assert.equal('wellRested' in rough, false, 'the rest window banks nothing');
  for (const rules of [CASUAL, HARD]) { const s = newSurvival(0); paySleep(s, 'bed', 480, 480, rules); assert.equal('wellRested' in s, false, `${rules.id} banks nothing`); }
  // the short rest (online's night) pays through the same door
  const sr = body({ survival: newSurvival(0) });
  assert.equal(sleepShortRest(sr, 'camp', BOONS, 9000), true);
  assert.equal(sr.survival.wellRested, Math.min(WELL_RESTED_MAX_MINUTES, NIGHT_MINUTES * WELL_RESTED_PER_SLEEP_MINUTE));
  // the minute law: a night in a bed, then the day
  const e = body({ survival: newSurvival(0) });
  run(e, 1, 480, { ...INDOORS, resting: true, sleeping: 'bed' }, BOONS);
  assert.equal(e.survival.wellRested, WELL_RESTED_MAX_MINUTES, 'eight hours in a bed: the full twelve');
  assert.ok(e.survival.boons.includes('rested'));
  assert.equal(entry(e).intelligence, BOON.rested.intelligence); assert.equal(entry(e).willpower, BOON.rested.willpower);
  run(e, 481, 490, INDOORS, BOONS);
  assert.equal(e.survival.wellRested, WELL_RESTED_MAX_MINUTES - 10, 'spent a waking minute at a time');
  e.survival.wellRested = 1;
  run(e, 491, 491, INDOORS, BOONS);
  assert.equal('wellRested' in e.survival, false, 'spent, and gone from the record');
  assert.equal(e.survival.boons.includes('rested'), false);
});

test('SURV-BOONS: Thriving - fed, quenched and rested at once earn luck too, and any one lapsing takes it', () => {
  const e = restedBody();
  run(e, 481, 481, INDOORS, BOONS);
  assert.deepEqual(e.survival.boons, ['fed', 'quenched', 'rested', 'thriving']);
  assert.deepEqual(entry(e), { ...BOON.fed, ...BOON.quenched, ...BOON.rested, ...BOON.thriving });
  assert.equal(liveStat(e, 'luck'), 50 + BOON.thriving.luck);
  e.survival.thirst = NEED.THIRSTY;
  run(e, 482, 482, INDOORS, BOONS);
  assert.deepEqual(e.survival.boons, ['fed', 'rested']);
  assert.equal(liveStat(e, 'luck'), 50, 'the luck goes with the third');
  assert.deepEqual(survivalBoons({ ...newSurvival(0), wellRested: 5 }, 0), ['fed', 'quenched', 'rested', 'thriving'], 'the pure read agrees');
});

test('SURV-BOONS: the hearth - a waking minute beside a lit fire gives a point of stamina back, up to the pool, and says so once; a rest by the fire (the camp\'s own whole rest) and a minute away from it give nothing', () => {
  const e = body({ fatigue: 1000, survival: newSurvival(0) });
  const log = run(e, 1, 10, { ...INDOORS, byFire: true }, BOONS, []);
  assert.equal(e.fatigue, 1000 + 10 * HEARTH_FATIGUE);
  assert.ok(e.survival.boons.includes('hearth'));
  assert.equal(said(log).filter((t) => t === SURVIVAL_TEXT.boon.hearth).length, 1, 'said once while it lasts');
  const full = body({ survival: { ...newSurvival(0), lastAte: -NEED.PECKISH_AT, thirst: NEED.THIRSTY } });   // no attribute boon to grow the pool under it
  full.fatigue = maxFatigue(full) - 10;
  const l2 = run(full, 1, 3, { ...INDOORS, byFire: true }, BOONS, []);
  assert.deepEqual(l2.filter((x) => x[0] === 'restore'), [['restore', 10]], 'never past the pool');
  assert.equal(full.fatigue, maxFatigue(full));
  const resting = body({ fatigue: 1000, survival: newSurvival(0) });
  const l3 = run(resting, 1, 10, { ...INDOORS, byFire: true, resting: true, sleeping: 'camp' }, BOONS, []);
  assert.deepEqual(l3.filter((x) => x[0] === 'restore'), [], 'the rest pays its own hour');
  assert.equal(resting.survival.boons.includes('hearth'), false);
  const away = body({ fatigue: 1000, survival: newSurvival(0) });
  run(away, 1, 10, INDOORS, BOONS);
  assert.equal(away.fatigue, 1000);
  for (const rules of [CASUAL, HARD]) {
    const c = body({ fatigue: 1000, survival: newSurvival(0) });
    const lc = run(c, 1, 10, { ...INDOORS, byFire: true }, rules, []);
    assert.deepEqual(lc.filter((x) => x[0] === 'restore'), [], `${rules.id}: no hearth`);
  }
});

test('SURV-BOONS: a vampire has no need for food, drink or sleep, so earns none of their boons - the hearth is anyone\'s', () => {
  const e = body({ survival: newSurvival(0) });
  survivalMinute(e, 1, { ...INDOORS, byFire: true }, deps(e, [], BOONS, { ctx: { raceId: RACES.Breton, vampire: true } }));
  assert.deepEqual(e.survival.boons, ['hearth']);
  assert.deepEqual(entry(e), {});
  assert.deepEqual(survivalBoons({ ...newSurvival(0), wellRested: 100 }, 0, { vampire: true }), []);
});

test('SURV-BOONS: only Boons rewards - Casual and Hard earn nothing and keep no bank; turning from Boons takes the bank, the boons and their points at the next minute, and a return says each boon again as it is earned', () => {
  for (const rules of [CASUAL, HARD]) {
    const e = body({ survival: newSurvival(0) });
    run(e, 1, 480, { ...INDOORS, resting: true, sleeping: 'bed' }, rules);
    run(e, 481, 482, INDOORS, rules);
    assert.equal('boons' in e.survival, false, `${rules.id}: no boons on the record`);
    assert.equal('wellRested' in e.survival, false, `${rules.id}: no bank`);
    assert.ok(Object.values(entry(e)).every((n) => n <= 0), `${rules.id}: no points earned (Hard's own costs aside)`);
    assert.deepEqual(survivalStatMods({ ...newSurvival(0), boons: ['fed', 'thriving'] }, null, 0, { rules }), {}, `${rules.id}: a stale grant is no grant`);
  }
  const log = [];
  const e = restedBody();
  run(e, 481, 481, INDOORS, BOONS, log);
  assert.ok(e.survival.boons.length && e.survival.wellRested > 0 && Object.keys(entry(e)).length);
  run(e, 482, 482, INDOORS, CASUAL);
  assert.equal('boons' in e.survival, false); assert.equal('wellRested' in e.survival, false);
  assert.deepEqual(entry(e), {}, 'the points go with the tier');
  const back = run(e, 483, 483, INDOORS, BOONS, []);
  assert.deepEqual(said(back), [SURVIVAL_TEXT.boon.fed, SURVIVAL_TEXT.boon.quenched], 'earned again, said again - and no Thriving: Well rested\'s bank went with the tier');
  run(e, 484, 490, INDOORS, BOONS, back);
  assert.equal(said(back).filter((t) => t === SURVIVAL_TEXT.boon.fed).length, 1, 'a boon is said once while it lasts');
});

test('SURV-BOONS: a jump says each boon once, as it lands - a night\'s replayed minutes speak at the minute the player stands in', () => {
  const e = body({ survival: newSurvival(0) });
  const log = [];
  runSurvivalMinutes(e, 0, 480, { ...INDOORS, resting: true, sleeping: 'bed' }, deps(e, log, BOONS));
  for (const id of ['fed', 'quenched', 'rested', 'thriving']) assert.equal(said(log).filter((t) => t === SURVIVAL_TEXT.boon[id]).length, 1, id);
});

test('SURV-BOONS: the strip and the page - the boons are green tiles on their needs\' glyphs (the campfire for the hearth, a sparkle for Thriving), Well rested\'s hours at its foot; no need is red in Boons, while the drink stays red in every tier; the page says what each gives, read off BOON', () => {
  const e = restedBody();
  run(e, 481, 481, { ...INDOORS, byFire: true }, BOONS);
  const chips = survivalHudChips(e, 481);
  const boons = chips.filter((c) => c.level === 'boon');
  assert.deepEqual(boons.map((c) => c.key), ['boon:fed', 'boon:quenched', 'boon:rested', 'boon:thriving', 'boon:hearth']);
  assert.deepEqual(boons.map((c) => c.text), ['Well fed', 'Quenched', 'Well rested', 'Thriving', 'Hearth']);
  assert.deepEqual(boons.map((c) => needGlyph(c)), ['hunger', 'thirst', 'sleep', 'thriving', 'rested']);
  for (const c of boons) assert.ok(Object.hasOwn(STATUS_GLYPHS, c.glyph), `${c.text} draws`);
  assert.equal(boons[2].foot, `${Math.ceil((WELL_RESTED_MAX_MINUTES - 1) / 60)}h`, 'the bank\'s hours left');
  const tiles = statusTiles({ needs: chips });
  assert.ok(tiles.filter((t) => t.key.startsWith('need:boon:')).every((t) => t.kind === 'buff'), 'a boon is a buff tile');
  assert.equal(tiles.find((t) => t.key === 'need:boon:rested').foot, boons[2].foot);
  assert.deepEqual(Object.keys(HUD_BOON_WORDS), [...BOON_IDS]);
  // NO RED: every need red in Boons reads amber; the drink keeps its red
  const worst = body({ survival: { ...newSurvival(0), lastAte: -5000, thirst: 140, sleepDebt: 20, wet: 250, drunk: 60 } });
  survivalMinute(worst, 1, BLIZZARD, deps(worst, [], BOONS));
  const red = survivalHudChips(worst, 1).filter((c) => c.level === 'danger').map((c) => c.key);
  assert.deepEqual(red, ['drunk'], 'only the drink, chosen at a bar, is red');
  const hard = body({ survival: { ...newSurvival(0), lastAte: -5000, thirst: 140, sleepDebt: 20, wet: 250, drunk: 60 } });
  survivalMinute(hard, 1, BLIZZARD, deps(hard, [], HARD));
  assert.deepEqual(survivalHudChips(hard, 1).filter((c) => c.level === 'danger').map((c) => c.key), ['hunger', 'thirst', 'sleep', 'wet', 'temp', 'drunk'], 'Hard keeps its red');
  assert.equal(survivalHudChips(hard, 1).some((c) => c.level === 'boon'), false);
  // the page
  const lines = survivalStatusLines(e, 481);
  assert.ok(lines.includes('Well fed: +5 strength, +5 endurance.'));
  assert.ok(lines.includes('Quenched: +5 agility, +5 speed.'));
  assert.ok(lines.includes(`Well rested (${Math.ceil((WELL_RESTED_MAX_MINUTES - 1) / 60)} hours left): +5 intelligence, +5 willpower.`));
  assert.ok(lines.includes('Thriving: +5 luck.'));
  assert.ok(lines.includes(STATUS_TEXT.boon('hearth')));
  assert.equal(survivalStatusLines(hard, 1).some((l) => /^(Well|Quenched|Thriving)/.test(l)), false);
});
