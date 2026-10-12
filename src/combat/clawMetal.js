// BAL6-GAUNTLETS (bible/05-Combat/Balance-Arc.md section 12; the owner, 2026-10-12: "based on your equipped gauntlets it
// would affect your attacks as a wereboar/werewolf. Like scaling without being overpowered"; asked, "Metal's damage
// bonus"): A DEPARTURE - THE BEAST'S CLAWS TAKE THE METAL ON ITS HANDS.
//
// DFU's claws are the bare hand: CalculateHandToHandAttackDamage rolls the skill's span and adds the swing and Strength -
// no item - and BAL6-CLAWS left them so, ungated. MorphSelf empties both hands and the pack is refused to the beast
// (systems/lycanthropy.js), but what it wore stays on, its gauntlets with them. Plate gauntlets now add their metal's
// damage to every claw hit: DaggerfallUnityItem.GetWeaponMaterialModifier of that metal, the same points a blade of it
// adds (Elven +1 ... Daedric +6), never below the bare claws (Iron's -1 is not taken). Its damage alone: no to-hit, no
// material gate, no silver's double; leather and chain have no metal. Both cores' hand-to-hand blows read it
// (combat/pcaao.js pcaaoHandToHandAttackDamage, combat/formulas.js handToHandAttackDamage), and the stats card shows it
// (combat/combatStats.js) - one law, three readers.
import { equipTableOf, EQUIP_SLOTS } from '../systems/equip.js';
import { plateMetal } from '../systems/armorMaterials.js';
import { weaponMaterialModifier } from '../characters/weapons.js';

/** The damage a transformed lycanthrope's claws take from the gauntlets it wears: their plate metal's material
 *  modifier, never below 0. 0 out of beast form, bare-handed, or in leather or chain. */
export function clawMetalDamage(entity) {
  if (!entity?.isInBeastForm) return 0;
  const metal = plateMetal(equipTableOf(entity)[EQUIP_SLOTS.Gloves]?.material);
  return metal === null ? 0 : Math.max(0, weaponMaterialModifier(metal));
}
