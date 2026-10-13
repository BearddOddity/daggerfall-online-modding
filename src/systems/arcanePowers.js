// @ts-check
// ═══════════════════════════════════════════════════════════════════
// SCHOOLS3/4 (2026-10-13) — WHAT THE PATHS DO. bible/06-Systems/Arcane-Specialisations.md section 5.
//
// The law (systems/arcanePaths.js) says which path a mage chose and when it is AWAKE; this file does what each path's
// passive and its signature spell's RIDER say, through the seams the Sigil Sets and the loot opened - registered here at
// import, each a no-op for anyone but MY entity with its path awake and no refereed fight (sigil.js sigilDueling, the
// word every loot and set power sleeps on):
//
//   Spellsteel, Unseen Strike,   the SPELL POWER modifier (spellPower.js - MY damage spell at a foe): a percent onto
//   Sanguine Tide, Conflux,      its landing, beside the loot's own
//   Dawn's Ward
//   Sunder, the Seer's mark      the SPELL PIERCE modifier: points off the foe's saving throw
//   Attuned Wards                the CAST COST modifier (spellcost.js)
//   Between Moments              the CAST SPEED modifier (castSpeed.js)
//   Glamour                      the entity FOLD (entityMods.js): attributes and skills
//   Foresight, the Warden's      the DAMAGE modifier (playerEntity.js - the one door every hurt comes through; a foe's
//   guard                        BLOW alone, the door's own mark: sigilSetPowers.js pendingPlayerBlow)
//   Slip Away, Absolution        the HURT listener (a hurt that crosses its line, with a recovery)
//   Steadfast                    the MAGIC ROUND
//   Death's Due, Soul Well       the KILL listener (playerKills.js)
//   the Wardwright's ward        the ABSORPTION chance (absorption.js - DFU's own two gates)
//   every signature RIDER        the LANDED listener (spellPower.js - the cast engine's word that MY spell landed:
//                                scenes/hostMagic.js applySpellToFoe and applySpellToPlayer), acting through the
//                                host's door (playerDoor.js): a blow on a foe through its own pool's door, a bundle on
//                                me as a potion lands, the heal and the magicka through playerHeal.js
//
// NEVER AT A PLAYER: a rider answers only a signature spell of MY awake path that landed on a FOE (or, a self-cast, on
// me); a duel's opponent and a party mate take the plain bundle. THE CLOCK is real seconds, as the set powers' (a
// recovery a player times with a watch); a reload starts every power ready.
// ═══════════════════════════════════════════════════════════════════

import { SKILLS } from './skills.js';
import { pathAwake, isSignatureSpell, PATH_NUMBERS, PATH_BY_ID } from './arcanePaths.js';
import { sigilDueling } from './sigil.js';
import { registerSpellPowerMod, registerSpellPierceMod, registerSpellLandedListener } from './spellPower.js';
import { registerSpellCostMod, calculateCastCost, effectSchool } from './spellcost.js';
import { registerCastSpeedMod } from './castSpeed.js';
import { registerEntityFold, newMods, EMPTY_MODS } from './entityMods.js';
import { registerPlayerDamageMod, registerPlayerHurtListener, playerEntity } from '../characters/playerEntity.js';
import { registerPlayerKillListener } from './playerKills.js';
import { registerMagicRoundHook } from './worldTick.js';
import { registerAbsorptionChance } from './absorption.js';
import { pendingPlayerBlow } from './sigilSetPowers.js';   // the door's one law of what a foe's blow is
import { healMine, manaMine } from './playerHeal.js';
import { playerDoor } from './playerDoor.js';
import { isMagicallyConcealed } from './effects.js';
import { enemyEntityGroup, ENEMY_GROUPS } from '../combat/formulas.js';
import { KNIGHT_CITY_WATCH } from '../characters/mobileTypes.js';
import { hudText } from './notify.js';
import { t } from './textManager.js';

// ── the numbers: the law's own (arcanePaths.js PATH_NUMBERS - the one home the words print and this file does) ──
const N = PATH_NUMBERS;
/** How far above or below a foe another may stand and still be "near" it (lootPowers.js REACH_RISE_M's sense). */
const NEAR_RISE_M = 3;

// ── the session's memory, its clock, its dice and its voice ─────────
let _now = () => performance.now() / 1000;
let _rand = Math.random;
const fresh = () => ({
  slipReady: 0, absolutionReady: 0,      // Trickster, Hierophant
  conflux: 0, confluxUntil: 0,           // Elementalist
  guardUntil: 0,                         // Warden's Living Aegis
  wardUntil: 0,                          // Wardwright's Prismatic Ward
  marks: new WeakMap(),                  // Seer: foe entity -> laid open until
});
let _s = fresh();
let _say = (line) => { hudText(line); };
/** The host's voice for the passives' lines (scenes/world.js); the HUD's own door by default. */
export function setArcanePowersVoice({ say = null } = {}) { if (typeof say === 'function') _say = say; }
const say = (line) => { try { _say(line); } catch { /* a line is not the power's problem */ } };

/** MY entity's awake path's id, or null - and none in a refereed fight. */
export function awakePathId(entity) {
  if (sigilDueling()) return null;
  return pathAwake(entity)?.id ?? null;
}
const me = () => playerDoor()?.player?.() ?? playerEntity;
const share = (e) => (Number.isFinite(e?.health) && e.maxHealth > 0 ? e.health / e.maxHealth : 1);
const undeadOrDaedra = (t) => {
  if (!t || t.isPlayer) return false;
  const g = enemyEntityGroup(t.careerIndex);
  return g === ENEMY_GROUPS.Undead || g === ENEMY_GROUPS.Daedra;
};
const neverCounts = (e) => e?.mobileType === KNIGHT_CITY_WATCH || e?.team === 'PlayerAlly' || e?.mobileTeam === 'PlayerAlly';
const shieldHolds = (e) => (e?.activeEffects ?? []).some((a) => a.kind === 'shield' && !a.ended && (a.shieldRemaining ?? 0) > 0);

/** A bundle on me, cast as a potion lands (no save, no chance roll) - one round more than it says, as Eventide's, so it
 *  lasts what it says however the round falls. */
const selfBundle = (name, type, subType, rounds, { magnitude = 0, chance = 1 } = {}) => ({
  name, rangeType: 0, element: 4,
  effects: [{
    type, subType, durationBase: Math.max(1, rounds | 0) + 1, durationMod: 0, durationPerLevel: 1,
    chanceBase: chance, chanceMod: 0, chancePerLevel: 1,
    magnitudeBaseLow: magnitude, magnitudeBaseHigh: magnitude, magnitudeLevelBase: 0, magnitudeLevelHigh: 0, magnitudePerLevel: 1,
  }],
});
/** A rider's bundle is named for the signature spell that cast it (the record's own name). */
const spellName = (id) => PATH_BY_ID[id].spell.name;
const castOnMe = (bundle) => { try { playerDoor()?.castOnPlayer?.(bundle); } catch { /* the door is the host's */ } };

/** The other live foes near a foe's feet, nearest first - none of them the struck one. */
function foesNear(struck, metres) {
  const door = playerDoor();
  const at = struck?.ai?.feet;
  if (!door || !Array.isArray(at)) return [];
  const out = [];
  for (const f of door.foes?.() ?? []) {
    if (!f || f === struck || f.dead || f.entity === struck.entity || !Array.isArray(f.ai?.feet)) continue;
    const p = f.ai.feet;
    const flat = Math.hypot(p[0] - at[0], p[2] - at[2]);
    if (flat <= metres && Math.abs((p[1] ?? 0) - (at[1] ?? 0)) <= NEAR_RISE_M) out.push({ f, flat });
  }
  return out.sort((a, b) => a.flat - b.flat).map((x) => x.f);
}
const hurt = (f, n) => { if (f && n >= 1) playerDoor()?.hurtFoe?.(f, n); };

// ── the passives ────────────────────────────────────────────────────

/** Sanguine Tide's whole percent - 1 for every `perMissing` percent of my health missing, in whole numbers (a share's
 *  float would read 20% missing as 19.99...). */
function sanguinePct(e) {
  if (!(e?.maxHealth > 0) || !Number.isFinite(e.health)) return 0;
  return Math.max(0, Math.floor((100 * (e.maxHealth - e.health)) / (e.maxHealth * N.sanguine.perMissing)));
}
/** MY damage spell's power at a foe: Spellsteel, Unseen Strike, Sanguine Tide, Conflux, Dawn's Ward. */
export function pathSpellPower(caster, target) {
  switch (awakePathId(caster)) {
    case 'battlemage': return shieldHolds(caster) ? N.spellsteel.pct : 0;
    case 'shadowcaster': return isMagicallyConcealed(caster) ? N.unseenStrike.pct : 0;
    case 'bloodmage': return Math.min(N.sanguine.most, sanguinePct(caster));
    case 'elementalist': return _now() < _s.confluxUntil ? N.conflux.pct * _s.conflux : 0;
    case 'lightbringer': return undeadOrDaedra(target) ? N.dawnsWard.pct : 0;
    default: return 0;
  }
}
/** The points off a foe's saving throw: Sunder's, and the Seer's mark on the foe Psychic Lance laid open. */
export function pathSpellPierce(caster, target) {
  switch (awakePathId(caster)) {
    case 'spellbreaker': return N.sunder.points;
    case 'seer': return target && _now() < (_s.marks.get(target) ?? 0) ? N.psychicLance.points : 0;
    default: return 0;
  }
}
/** Attuned Wards: a spell all of whose effects are Alteration's or Thaumaturgy's costs less. */
export function pathCastCost(entity, sp, spell = null) {
  if (awakePathId(entity) !== 'wardwright') return sp;
  const fx = (spell?.effects ?? []).filter((e) => e && e.type > -1);
  if (!fx.length || !fx.every((e) => effectSchool(e) === SKILLS.Alteration || effectSchool(e) === SKILLS.Thaumaturgy)) return sp;
  return (sp * (100 - N.attunedWards.pct)) / 100;
}
/** Between Moments: my casting hands' speed. */
export const pathCastSpeed = (entity) => (awakePathId(entity) === 'riftwalker' ? N.betweenMoments.pct : 0);
/** Glamour: the Enchanter's attributes and skills, folded onto my entity. */
export function pathFold(entity) {
  if (awakePathId(entity) !== 'enchanter') return EMPTY_MODS;
  const mods = newMods();
  mods.stats.personality = N.glamour.personality;
  mods.skills[SKILLS.Etiquette] = N.glamour.etiquette;
  mods.skills[SKILLS.Streetwise] = N.glamour.streetwise;
  return mods;
}
/** The damage door: Foresight (a foe's blow, one in eight, to nothing) and the Warden's guard (a foe's blow lighter). */
export function pathDamageMod(entity, dmg) {
  const id = awakePathId(entity);
  if (!id || !pendingPlayerBlow()) return dmg;
  if (id === 'seer' && _rand() < 1 / N.foresight.oneIn) { say(t('schools.say.foresight', 'Foresight: you saw the blow coming.')); return 0; }
  if (id === 'warden' && _now() < _s.guardUntil) return (dmg * (100 - N.livingAegis.lighter)) / 100;
  return dmg;
}
/** The hurt listener: Slip Away and Absolution - a hurt that takes me across the line, while ready.
 *  @param {any} entity @param {{ before?: number, after?: number }} [hurt] */
export function pathHurt(entity, { before = 0, after = 0 } = {}) {
  const id = awakePathId(entity);
  if (!id || !(after > 0) || !(entity.maxHealth > 0)) return;
  const crossed = (line) => after < entity.maxHealth * line && before >= entity.maxHealth * line;
  const now = _now();
  if (id === 'trickster' && crossed(N.slipAway.below) && now >= _s.slipReady) {
    _s.slipReady = now + N.slipAway.recover;
    castOnMe(selfBundle(PATH_BY_ID.trickster.passive.name, 13, 0, N.slipAway.rounds));
    say(t('schools.say.slipAway', 'Slip Away: you fade from sight.'));
  } else if (id === 'hierophant' && crossed(N.absolution.below) && now >= _s.absolutionReady) {
    _s.absolutionReady = now + N.absolution.recover;
    healMine(entity, (entity.maxHealth * N.absolution.heal) / 100);
    say(t('schools.say.absolution', 'Absolution: your wounds close.'));
  }
}
/** The magic round: Steadfast. */
export function pathRound(entity) {
  if (awakePathId(entity) !== 'warden' || !shieldHolds(entity)) return;
  if (entity.health > 0 && entity.health < entity.maxHealth) healMine(entity, (entity.maxHealth * N.steadfast.pct) / 100);
}
/** My kill: Death's Due and Soul Well. */
export function pathKill(foe) {
  if (!foe || neverCounts(foe)) return;
  const m = me();
  const id = awakePathId(m);
  if (id === 'necromancer') {
    healMine(m, (m.maxHealth * N.deathsDue.health) / 100);
    manaMine(m, (m.maxMagicka * N.deathsDue.magicka) / 100);
  } else if (id === 'soulbinder') {
    const trapped = (foe.activeEffects ?? []).some((a) => a.kind === 'soulTrap' && !a.ended && !a.by);   // mine: a peer's trap carries `by`
    manaMine(m, (m.maxMagicka * (trapped ? N.soulWell.trapped : N.soulWell.magicka)) / 100);
  }
}
/** The Wardwright's ward: the chance a Destruction spell that strikes me is absorbed, while Prismatic Ward's holds. */
export const pathAbsorbChance = (target) => (awakePathId(target) === 'wardwright' && _now() < _s.wardUntil ? N.prismaticWard.chance : 0);

// ── the riders ──────────────────────────────────────────────────────

/** MY spell LANDED (spellPower.js tellSpellLanded): Conflux's stack for any damage spell of mine at a foe, and the
 *  signature spell's rider when it is MY awake path's.
 *  @param {{ caster?: any, target?: any, foe?: any, spell?: any, r?: any, self?: boolean, reflected?: boolean }} [landing] */
export function pathLanded({ caster = null, target = null, foe = null, spell = null, r = null, self = false, reflected = false } = {}) {
  const id = awakePathId(caster);
  if (!id || !r || reflected) return;
  const landed = Number.isFinite(r.damage) ? r.damage : 0;
  const now = _now();
  if (id === 'elementalist' && !self && landed > 0 && target && !target.isPlayer) {
    _s.conflux = Math.min(N.conflux.stacks, (now < _s.confluxUntil ? _s.conflux : 0) + 1);
    _s.confluxUntil = now + N.conflux.seconds;
  }
  if (!isSignatureSpell(spell) || spell.path !== id) return;
  if (self) { if (spell.rangeType === 0) selfRider(id, caster, r, now); return; }
  if (!target || target.isPlayer) return;
  switch (id) {
    case 'battlemage':
      if (landed > 0) castOnMe(selfBundle(spellName('battlemage'), 35, 255, N.aegisBolt.rounds, { magnitude: Math.max(1, Math.min(landed * N.aegisBolt.times, Math.round((caster.maxHealth * N.aegisBolt.most) / 100))) }));
      break;
    case 'trickster':
      if (r.paralyzed > 0) castOnMe(selfBundle(spellName('trickster'), 23, 0, N.fleetingHold.rounds));
      break;
    case 'riftwalker':
      if (landed > 0) for (const f of foesNear(foe, N.riftLance.metres)) hurt(f, Math.round(landed * N.riftLance.share));
      break;
    case 'shadowcaster':
      if (landed > 0) castOnMe(selfBundle(spellName('shadowcaster'), 24, 0, N.shadowBolt.rounds));
      break;
    case 'spellbreaker':
      if (landed > 0) manaMine(caster, calculateCastCost(spell, caster).sp * N.unravel.back);
      break;
    case 'bloodmage':
      if (landed > 0 && target.health > 0 && share(target) < N.bloodBoil.below) hurt(foe, landed);
      break;
    case 'elementalist':
      if (landed > 0) for (const f of foesNear(foe, N.chainLightning.metres).slice(0, N.chainLightning.foes)) hurt(f, Math.round(landed * N.chainLightning.share));
      break;
    case 'seer':
      if (landed > 0) _s.marks.set(target, now + N.psychicLance.seconds);
      break;
    case 'lightbringer':
      if (landed > 0) {
        healMine(caster, landed * N.dawnbolt.heal);
        if (undeadOrDaedra(target) && target.health > 0) hurt(foe, Math.round(landed * N.dawnbolt.burn));
      }
      break;
    case 'enchanter':
      if (r.pacify) manaMine(caster, calculateCastCost(spell, caster).sp);
      break;
    case 'necromancer':
      if (landed > 0) healMine(caster, landed * N.siphonLife.share);
      break;
    case 'soulbinder':
      if (landed > 0) manaMine(caster, landed * N.soulLance.share);
      break;
    default: break;
  }
}
/** A signature self-cast's rider: the Warden's guard, the Wardwright's ward, the Hierophant's Spell Resistance. */
function selfRider(id, caster, r, now) {
  if (r.chanceFailed) return;
  if (id === 'warden') _s.guardUntil = now + N.livingAegis.seconds;
  else if (id === 'wardwright') _s.wardUntil = now + N.prismaticWard.seconds;
  else if (id === 'hierophant') castOnMe(selfBundle(spellName('hierophant'), 22, 255, N.sanctify.rounds, { chance: N.sanctify.chance }));
}

// ── registered at import ───────────────────────────────────────────
export const ARCANE_POWERS = 'arcanePowers';
registerSpellPowerMod(ARCANE_POWERS, pathSpellPower);
registerSpellPierceMod(ARCANE_POWERS, pathSpellPierce);
registerSpellCostMod(ARCANE_POWERS, pathCastCost);
registerCastSpeedMod(ARCANE_POWERS, pathCastSpeed);
registerEntityFold(ARCANE_POWERS, pathFold);
registerPlayerDamageMod(ARCANE_POWERS, pathDamageMod);
registerPlayerHurtListener(ARCANE_POWERS, pathHurt);
registerMagicRoundHook(ARCANE_POWERS, pathRound);
registerPlayerKillListener(ARCANE_POWERS, pathKill);
registerAbsorptionChance(ARCANE_POWERS, pathAbsorbChance);
registerSpellLandedListener(ARCANE_POWERS, pathLanded);

/** Tests only: every recovery and window fresh, a clock and dice of their own (seconds; [0, 1)). */
export function _resetArcanePowersForTests() { _s = fresh(); _say = (line) => { hudText(line); }; }
export function _setArcanePowersClockForTests(fn) { _now = typeof fn === 'function' ? fn : () => performance.now() / 1000; }
export function _setArcanePowersRandForTests(fn) { _rand = typeof fn === 'function' ? fn : Math.random; }
