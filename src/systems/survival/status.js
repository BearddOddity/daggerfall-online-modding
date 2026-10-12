// SURV5 - WHAT THE PLAYER IS TOLD: the HUD's needs strip and the
// status page's survival lines, PURE - both read the record
// (survival/needs.js) and say it in words. The mod's AdviceText
// (read off the DLL: "You could do with a decent meal.", "You are
// invigorated from your last meal.", "You are drunk." / "You are very
// drunk.", "You have no need for food or sleep." for a vampire) was a
// third message box chained after DFU's two status boxes; the port
// chains the same way (healthStatus.js's ActionTextBox.addNext) and
// keeps the words its own, plus a HUD strip the mod never had - one
// chip a need, shown only while the need is felt.
import { survivalOf, hungerStage, thirstStage, sleepStage, wetStage, hungerMinutes, NEED, BOON } from './needs.js';
import { STAT_KEYS_ORDER } from '../statMods.js';   // AUDIT SURV-BOONS C11: the attributes, named as the sheet names them
import { temperatureWord, signedDegrees } from './temperature.js';
import { isStiff } from './rest.js';

/** The chip's severity: 'warn' is felt, 'danger' is costing you (SURV-TIERS: in Casual, a red NEED's stamina, lent - difficulty.js; Drenched is red as a warning and costs through the felt temperature, and the drink's swing starts at its amber Drunk). */
export const HUD_NEED_WORDS = Object.freeze({
  hunger: Object.freeze({ peckish: ['Peckish', 'warn'], hungry: ['Hungry', 'warn'], starving: ['Starving', 'danger'] }),
  thirst: Object.freeze({ thirsty: ['Thirsty', 'warn'], parched: ['Parched', 'danger'], dehydrated: ['Dehydrated', 'danger'] }),
  sleep: Object.freeze({ tired: ['Tired', 'warn'], drowsy: ['Drowsy', 'warn'], exhausted: ['Exhausted', 'danger'] }),
  wet: Object.freeze({ damp: ['Damp', 'warn'], wet: ['Wet', 'warn'], soaked: ['Soaked', 'warn'], drenched: ['Drenched', 'danger'] }),
  // AUDIT SURV-TIERS (the third pass): and Warm, the Cold's twin - Hard charges from twenty either way, and a warm day
  // drained six a minute under an empty strip while the same band's cold said Cold
  temp: Object.freeze({ warm: ['Warm', 'warn'], hot: ['Hot', 'warn'], scorching: ['Scorching', 'danger'], cold: ['Cold', 'warn'], freezing: ['Freezing', 'danger'], 'deadly cold': ['Deadly cold', 'danger'] }),
});
/** AUDIT SURV-TIERS (the third pass): the cold a lit fire answers (a tier whose `fireWarms` says so - Casual; the
 *  minute law's `s.warmed`) is felt, not paid, so its chip is the amber of a felt need - the same word, RED MEANS
 *  IT COSTS kept - and the page says what the fire does. Beside the fire the strip had said Deadly cold in red while
 *  nothing was charged and the pool refilled. */
/**
 * SURV-BOONS (2026-10-12): A BOON'S CHIP - its word and the glyph it stands on (ui/hudStatus.js STATUS_GLYPHS): the need's
 * own for the need it rewards, the campfire for the hearth, a sparkle for Thriving. The strip reads them off the
 * record's `boons` (needs.js survivalBoons, written by the minute law), so it shows what the body has; and a record that
 * carries `boons` is a rewarding tier's, where nothing costs - so no need's chip there is red (RED MEANS IT COSTS). The
 * drink is the exception it is in every tier: its swing is the drink's.
 */
export const HUD_BOON_WORDS = Object.freeze({
  fed: Object.freeze(['Well fed', 'hunger']), quenched: Object.freeze(['Quenched', 'thirst']), rested: Object.freeze(['Well rested', 'sleep']),
  thriving: Object.freeze(['Thriving', 'thriving']), hearth: Object.freeze(['Hearth', 'hearth']),   // AUDIT SURV-BOONS C7: its own flame - REST1's Rested is the campfire, and the two stood side by side
});
/** Whether a record is a rewarding tier's (it carries the minute law's `boons`). AUDIT SURV-BOONS C14: a reader that
 *  knows the LIVE tier hands it in (`opt`), so a turn of the tier shows at once and not a game minute later. */
const rewarding = (s, opt = undefined) => (typeof opt === 'boolean' ? opt : Array.isArray(s.boons));
const warmedBy = (s, word) => !!s.warmed && (word === 'cold' || word === 'freezing' || word === 'deadly cold');

/** NEED-TIER (2026-10-02, Mac: "the debuffs you get from Climates and Calories no longer show the severity (how much
 *  hunger your character has etc)"): a felt need's stage on its own ladder - read off the chips' table, mildest first;
 *  the temperature's two ways each a ladder of their own - so the tile's foot can say "2/3" where its word has no room. */
const COLD_WORDS = Object.freeze(['cold', 'freezing', 'deadly cold']);   // AUDIT NEED-TIER: the cold way named, not the table's second half by place
const NEED_LADDERS = Object.freeze({
  hunger: Object.keys(HUD_NEED_WORDS.hunger), thirst: Object.keys(HUD_NEED_WORDS.thirst), sleep: Object.keys(HUD_NEED_WORDS.sleep), wet: Object.keys(HUD_NEED_WORDS.wet),
  warm: Object.keys(HUD_NEED_WORDS.temp).filter((w) => !COLD_WORDS.includes(w)), cold: COLD_WORDS,
});
const needLadder = (key, stage) => (key === 'temp' ? (NEED_LADDERS.cold.includes(stage) ? NEED_LADDERS.cold : NEED_LADDERS.warm) : NEED_LADDERS[key]);

/** The strip's chips: [{ key, text, level, tier?, of? }] - empty when every need is met; `tier` of `of` is how bad
 *  (NEED-TIER), absent on a need with one stage (Stiff). */
export function survivalHudChips(entity, now, { vampire = false, endurance = 50, rewarding: rewardingTier = undefined } = {}) {
  if (!entity?.survival) return [];
  const s = survivalOf(entity, now);
  const out = [];
  const push = (key, table, stage) => {
    const w = table[stage];
    if (!w) return;
    const ladder = needLadder(key, stage);
    out.push({ key, text: w[0], level: w[1], tier: ladder.indexOf(stage) + 1, of: ladder.length });
  };
  if (!vampire) push('hunger', HUD_NEED_WORDS.hunger, hungerStage(hungerMinutes(s, now)));   // AUDIT SURV C: no need for food or sleep
  if (!vampire) push('thirst', HUD_NEED_WORDS.thirst, thirstStage(s.thirst));   // AUDIT SURV-TIERS (the third pass): nor drink - the law freezes it, and its red chip never cost
  if (!vampire) push('sleep', HUD_NEED_WORDS.sleep, sleepStage(s.sleepDebt));
  push('wet', HUD_NEED_WORDS.wet, wetStage(s.wet));
  if (Number.isFinite(s.felt)) {
    const word = temperatureWord(s.felt);
    push('temp', HUD_NEED_WORDS.temp, word);
    if (warmedBy(s, word) && out.at(-1)?.key === 'temp') out.at(-1).level = 'warn';
  }
  if (isStiff(s, now)) out.push({ key: 'stiff', text: 'Stiff', level: 'warn' });
  // AUDIT SURV C/D: the page's own bands (the mod's LiveEndurance / 2 and - 10), not a hard forty
  // AUDIT SURV-BOONS C6: before the boons, so the one red Boons keeps is never the first tile a full band folds away
  const drunk = s.drunk > endurance / 2 ? { key: 'drunk', text: s.drunk > endurance - 10 ? 'Very drunk' : 'Drunk', level: s.drunk > endurance - 10 ? 'danger' : 'warn', tier: s.drunk > endurance - 10 ? 2 : 1, of: 2 } : null;
  // SURV-BOONS: in a rewarding tier no need costs, so none is red (the drink's swing is the drink's, and stays); the
  // boons follow, green (level 'boon')
  if (rewarding(s, rewardingTier)) {
    for (const c of out) if (c.level === 'danger') c.level = 'warn';
    if (drunk) out.push(drunk);
    for (const id of Array.isArray(s.boons) ? s.boons : []) {
      const w = HUD_BOON_WORDS[id];
      if (!w) continue;
      const chip = { key: `boon:${id}`, text: w[0], level: 'boon', glyph: w[1] };
      if (id === 'rested' && s.wellRested > 0) chip.foot = `${Math.ceil(s.wellRested / 60)}h`;   // the bank's hours left
      out.push(chip);
    }
  } else if (drunk) out.push(drunk);
  return out;
}

/**
 * TEMP-UI (2026-10-12, the owner: "add a temperature widget to the UI"): THE HUD'S TEMPERATURE PLATE, as data - the
 * record's last felt reading (the minute law's `s.felt`, what the next minute charges against), its word, and the SAME
 * level the strip's temperature chip wears (RED MEANS IT COSTS: a lit fire's warmed cold amber in Casual, nothing red
 * in Boons, the comfortable band 'ok'), the way it runs ('cold', 'hot', or 'mild' for comfortable) and where it stands
 * on the plate's scale (`at`, 0..1 over TEMP_SCALE, clamped - the deadly cold and the scorching are past its ends).
 * Null with no reading yet. Pure: the HUD draws it, test/tempui.test.js holds it to the chip. `felt` is another
 * reading of the same body - the pack's live one (ui/temperatureCard.js) - read with the record's tier and fire.
 */
export const TEMP_SCALE = Object.freeze({ min: -60, max: 60 });
export function temperatureReadout(entity, felt = entity?.survival?.felt, { rewarding: rewardingTier = undefined } = {}) {
  if (!Number.isFinite(felt)) return null;
  const s = entity?.survival && typeof entity.survival === 'object' ? entity.survival : {};   // TEMP-UI: the pack's live reading (`felt`) wears the record's tier and fire
  const word = temperatureWord(felt);
  const chip = HUD_NEED_WORDS.temp[word] ?? null;
  const warmed = warmedBy(s, word);
  const level = !chip ? 'ok' : chip[1] === 'danger' && (warmed || rewarding(s, rewardingTier)) ? 'warn' : chip[1];
  const at = Math.min(1, Math.max(0, (felt - TEMP_SCALE.min) / (TEMP_SCALE.max - TEMP_SCALE.min)));
  return { felt, text: signedDegrees(felt), word, label: chip ? chip[0] : 'Comfortable', level, side: COLD_WORDS.includes(word) ? 'cold' : chip ? 'hot' : 'mild', warmed, at };
}

/** AUDIT SURV-BOONS C13: what a boon gives, in words - the page's line and the Stats side's row say it through this one
 *  helper: the attributes as the sheet names them, in its order (C11), or the hearth's stamina. */
export function boonEffect(id) {
  if (id === 'hearth') return 'stamina back beside a lit fire';
  return BOON[id] ? STAT_KEYS_ORDER.filter((k) => BOON[id][k]).map((k) => `+${BOON[id][k]} ${k[0].toUpperCase()}${k.slice(1)}`).join(', ') : '';
}
/** The hours a Well rested bank has left, whole, said singular at one (C10): "12 hours", "1 hour" - '' with none. */
export function restedLeft(s) {
  const h = Math.ceil(Math.max(0, s?.wellRested ?? 0) / 60);
  return h > 0 ? `${h} ${h === 1 ? 'hour' : 'hours'}` : '';
}

export const STATUS_TEXT = Object.freeze({
  hunger: Object.freeze({
    fed: 'You are well fed.', peckish: 'You could eat.', hungry: 'You could do with a decent meal.', starving: 'You are starving.',
  }),
  thirst: Object.freeze({ fine: 'You are not thirsty.', thirsty: 'You are thirsty.', parched: 'You are parched.', dehydrated: 'You are dehydrated.' }),
  sleep: Object.freeze({ rested: 'You are well rested.', tired: 'You are tired.', drowsy: 'You are drowsy.', exhausted: 'You are exhausted.' }),
  notTired: 'You are not tired.',   // AUDIT SURV-BOONS C5/D12: Boons' 'rested' stage with no bank - "well rested" is the boon's word there, and the page said it beside a strip with no Well rested
  wet: Object.freeze({ dry: null, damp: 'Your clothes are damp.', wet: 'Your clothes are wet.', soaked: 'You are soaked through.', drenched: 'You are drenched.' }),
  temp: (word) => (word === 'comfortable' ? 'You are comfortable.' : `You feel ${word}.`),
  // TEMP-UI: the number under the word - in plain characters, which every font the box is drawn in carries (no degree
  // sign: the classic's own faces have none), with the comfortable band it is read against
  felt: (felt) => `Felt temperature: ${signedDegrees(felt).replace('\u00b0', '')} (comfortable from -10 to +10).`,
  warmedByFire: 'The fire keeps the cold at bay.',
  stiff: 'You are stiff and sore from a hard night.',   // AUDIT SURV-TIERS (the third pass): the ground's or the tavern floor's (a Hard blackout)
  drunk: 'You are drunk.', veryDrunk: 'You are very drunk.',
  vampire: 'You have no need for food or sleep.',
  invigorated: 'You are invigorated from your last meal.',
  // SURV-BOONS: a boon's line - its word and what it gives, read off needs.js BOON (never restated), the attributes named
  // as the sheet names them (AUDIT SURV-BOONS C11) in the sheet's order, the hours whole and singular at one (C10); the
  // hearth's own. Plain characters: the classic's faces draw this box (TEMP-UI's felt line says why).
  boon: (id, s = null) => {
    if (id === 'hearth') return 'The fire\'s warmth restores your stamina.';
    const w = HUD_BOON_WORDS[id]?.[0];
    if (!w || !BOON[id]) return null;
    const left = id === 'rested' && restedLeft(s) ? ` (${restedLeft(s)} left)` : '';
    return `${w}${left}: ${boonEffect(id)}.`;
  },
});

/**
 * The status page's third box: one line a need (the vampire's one line
 * in the needs' place - AUDIT SURV-BOONS C12: and then the body's
 * wet, temperature, drink and hearth, as the strip shows them). `endurance` is the live stat for the drunk words (the
 * mod's LiveEndurance / 2 and - 10 bands).
 */
export function survivalStatusLines(entity, now, { vampire = false, endurance = 50, rewarding: rewardingTier = undefined } = {}) {
  const s = survivalOf(entity, now);
  const kept = rewarding(s, rewardingTier);
  const boons = kept && Array.isArray(s.boons) ? s.boons : [];
  const lines = [];
  if (vampire) lines.push(STATUS_TEXT.vampire);
  else {
    const hunger = hungerStage(hungerMinutes(s, now));
    lines.push(hunger === 'fed' && hungerMinutes(s, now) < NEED.PECKISH_AT / 2 ? STATUS_TEXT.invigorated : STATUS_TEXT.hunger[hunger]);
    lines.push(STATUS_TEXT.thirst[thirstStage(s.thirst)]);
    const sleep = sleepStage(s.sleepDebt);
    lines.push(sleep === 'rested' && kept && !boons.includes('rested') ? STATUS_TEXT.notTired : STATUS_TEXT.sleep[sleep]);   // AUDIT SURV-BOONS C5/D12
  }
  // AUDIT SURV-BOONS C12: and a vampire's body is still wet or dry, warm or cold, drunk or sober, and by a fire - the
  // strip said so while the page said only that it needs no food or sleep
  const wet = STATUS_TEXT.wet[wetStage(s.wet)];
  if (wet) lines.push(wet);
  if (Number.isFinite(s.felt)) { const word = temperatureWord(s.felt); lines.push(warmedBy(s, word) ? STATUS_TEXT.warmedByFire : STATUS_TEXT.temp(word), STATUS_TEXT.felt(s.felt)); }   // TEMP-UI: and its number
  if (isStiff(s, now)) lines.push(STATUS_TEXT.stiff);
  if (s.drunk > endurance / 2) lines.push(s.drunk > endurance - 10 ? STATUS_TEXT.veryDrunk : STATUS_TEXT.drunk);
  for (const id of boons) lines.push(STATUS_TEXT.boon(id, s));   // SURV-BOONS: what the body has earned
  return lines.filter(Boolean);
}
/** The box's rows, in the hosts' `{ text, center }` shape. */
export const survivalStatusRows = (entity, now, opts) => survivalStatusLines(entity, now, opts).map((text) => ({ text, center: true }));
