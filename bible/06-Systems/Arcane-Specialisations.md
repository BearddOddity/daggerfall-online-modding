# Arcane Specialisations - a mage is the schools they master (SCHOOLS)

> Design page and record (2026-10-13). The arc shipped whole, in one pull request, by the owner's choice; its five slices
> are the five parts of this page. Where the page and the code disagree, the code's own header (`src/systems/
> arcanePaths.js`, `src/systems/arcanePowers.js`) and the pins are what runs.

## 1. What was asked

A player on the Patreon chat (DoubleDutchess, 2026-10-13), through the owner:

> *"One thing I've found with making mage characters recently, is that they all kind of end up the same. I'd love
> changes that gave mages more of an identity, based on the school of magic they are specialised in. Unfortunately,
> this is undermined by how easy it is to become a master in all schools. One thing that might be worth exploring is
> specialisation based on the two master skills you pick. That way there's 21 possible combinations of master magic
> school per character. If some advanced spells or specialisations could be tied to those combinations, it would allow
> for some interesting character diversity. Restoration and Mysticism could be the requirements for a Necromancer
> sub-class for instance, giving access to some spicy new spells."*

Measured first (section 2), then four questions put to the owner, and the owner chose:

- **The pair:** *chosen once* - once two schools are mastered, the player picks one pair of their mastered schools, and
  the choice is permanent, like a mastery.
- **What it grants:** *signature spells, a passive, and the school perks* - each of the fifteen pairs a signature
  spell sold only to it and a passive of its own; and every mastered school pays past 100 in its own way, not in price
  alone (BAL9's open "other schools" call). Fifteen pairs and six schools: the post's twenty-one.
- **Below 100:** *as it is* - identity comes from what is mastered and specialised; reaching 100 everywhere stays.
- **Scope:** *everything at once* - all fifteen and all six in one pull request.

Six schools make fifteen pairs (6 choose 2), not twenty-one; with the six schools' own perks past 100 the count is the
post's twenty-one, and that is how this page reads it.

## 2. What was measured - why every mage ended up the same

Three facts, each in the code before this arc:

1. **Every school reaches 100, on any mage.** Below 100 skills rise as DFU's (`systems/advancement.js`), and online
   Master Skills lifts DFU's 95 lock (`masterSkills.js` SOFTCAP3), so nothing stops a mage at 95 in the schools they did
   not master. The Mages Guild trains all six to 50 (`guildServices.js` trainingMax). Reaching 100 in all six is a
   matter of casting.
2. **A mastered school bought one thing: its price.** Five masteries (2 primary, 2 major, 1 minor - SOFTCAP4) let a
   school climb past 100, and past 100 the climb priced the school's spells cheaper (SPELL-COST-PAST) and raised the
   foes (`skillSoftcap.js` combatEdge). Only Destruction's climb did anything else (BAL9b, its damage). Balance-Arc
   section 15 says it outright: *"a school's read in nothing but its price"*, and left the other five as a call of
   their own.
3. **No spell belonged to anyone.** The Mages Guild's shelf sells every SPELLS.STD record to every customer
   (`worldModes.js` BuySpells), and the spell maker makes any three effects for anyone. No spell, power or title read a
   player's schools.

So the one permanent, scarce choice a mage makes - which schools to master - changed a price and nothing a player
could see or play. That is where the identity goes.

## 3. SCHOOLS1 - the path (the law)

`src/systems/arcanePaths.js` - a leaf the price, the judge and the powers all read.

- **Who.** A player with Master Skills in force (online always; offline the switch - SOFTCAP3) and at least two of
  the six schools mastered. A school can only be mastered as a career skill, so a class whose schools are all
  miscellaneous never meets a path - the masteries' own law.
- **The choice.** Any pair of the player's mastered schools names one path (section 5); with three or more mastered,
  the player picks among their pairs. `entity.arcanePath` holds the path's id. **PERMANENT** - nothing undoes it, as
  nothing undoes a mastery. Asked ONCE on the first quiet pass after the second school is mastered (the mastery box's
  own door, `scenes/shared.js` raisePlayerSkills - after the mastery choices, never over them), and any time after on
  the skill screen (classic: the M row on the sheet's front page; enhanced: the Master Skills page's Specialisation
  card).
- **Awake.** The path acts only while it is AWAKE (`pathAwake`): my own player entity (never a peer's stand-in), Master
  Skills in force, both its schools mastered, not mentoring (SOFTCAP2 reads no climb either) - and its powers add no
  refereed fight in progress (`arcanePowers.js` awakePathId reads `sigil.js` sigilDueling, the one word every loot power
  and set power sleeps on; the law cannot import it - sigil.js's graph reaches back into `spellcost.js`, which reads the
  law). Offline with the switch
  off, the path sleeps and its signature spell casts as the plain bundle it is - nothing is lost, as Master Skills
  keeps a skill past 100 while off.
- **Never at a player.** A rider or passive that strikes reaches foes only (`ownSpellAt`, BAL9's gate); a signature
  spell cast at a duel opponent or given to a party mate lands as its plain classic bundle.

## 4. SCHOOLS2 - the schools past 100

BAL9b's law, *the school past 100 is its potency*, for every school: online, each effective point of a school's CLIMB
past 100 (`skillSoftcap.js` climbedSkill - the climb the foes' edge reads, so the climb that raises them is the climb
that pays) is 1% more of what that school does, to x1.4 at 200 (effective 140). `spellPower.js` schoolPotency, now
per school. Each school pays in its own dimension:

| school | past 100, x1.4 at 200 | where it lands |
| --- | --- | --- |
| Destruction | the damage of Damage Health and Continuous Damage Health at a foe | BAL9b, unchanged (`effects.js` casterDamageScaled) |
| Restoration | the healing of Heal Health and Regenerate on myself | the heal arm, and a Regenerate's every round |
| Alteration | the strength of a Shield on myself | the Shield arm's pool |
| Illusion | the duration of Invisibility, Chameleon and Shadow on myself | the concealment arm's rounds |
| Mysticism | the chance of Silence, Dispel Undead/Daedra and Soul Trap at a foe | each chance, at most 100 |
| Thaumaturgy | the chance of Spell Reflection and Spell Resistance on myself | the chance the buff holds, at most 100 |

Online alone, as BAL9b: offline, DFU's price term already pays a school past 100 (to nothing at 110), and the offline
game is Daggerfall's (Field-Bugs-2026-10-12c's For Mac stands). None while mentoring; none in a refereed fight; a heal,
shield, concealment or ward only on MY OWN entity (a party mate's gift lands on their client, and an ally's bundle never
merges with mine - ALLY-CAST C2); a chance only at a foe I cast at. A spell's school is the effect's own, except a
signature spell's (section 6).

## 5. SCHOOLS3/4 - the fifteen paths

Each path: a PASSIVE while awake, and a SIGNATURE SPELL with a RIDER - what the spell does past its classic bundle, only
when its own path's holder casts it awake. A round is a magic round (a classic minute, five real seconds online).

| path | schools | passive | signature spell | rider |
| --- | --- | --- | --- | --- |
| Battlemage | Alteration + Destruction | **Spellsteel**: while my Shield holds, my damage spells strike 15% harder | **Aegis Bolt** - Damage Health 10-18 + 2-3 a level, shock, at range | a Shield on me of twice what it landed (at most a fifth of my health), 8 rounds |
| Trickster | Alteration + Illusion | **Slip Away**: a hurt that leaves me under a third of my health turns me Invisible for 5 rounds; ready again after 2 minutes | **Fleeting Hold** - Paralyze, 2 + 1 a 4 levels rounds, chance 35 + 2 a 2 levels, at range | when it takes hold, I fade: Chameleon, 6 rounds |
| Riftwalker | Alteration + Mysticism | **Between Moments**: my casting hands move 20% faster | **Rift Lance** - Damage Health 8-16 + 2-3 a level, magic, at range | every other foe within 4 m of the one struck takes a third of what it landed |
| Warden | Alteration + Restoration | **Steadfast**: while my Shield holds, 1% of my health back each round | **Living Aegis** - Shield 10-20 + 2-3 a level for 8 + 1 a 2 levels rounds, and Heal Health 8-14 + 1-2 a level, on myself | for 30 seconds, foes' blows land 20% lighter on me |
| Wardwright | Alteration + Thaumaturgy | **Attuned Wards**: my Alteration and Thaumaturgy spells cost 20% less magicka | **Prismatic Ward** - Resist Fire, Frost and Shock, 10 + 2 a 2 levels rounds, chance 25 + 2 a 2 levels, on myself | for 30 seconds, a Destruction spell that strikes me is absorbed 40% of the time |
| Shadowcaster | Destruction + Illusion | **Unseen Strike**: while I am invisible, chameleon or shaded, my damage spells strike 25% harder | **Shadow Bolt** - Damage Health 8-16 + 2-3 a level, magic, at range | when it lands, shadow wraps me: Shadow, 3 rounds |
| Spellbreaker | Destruction + Mysticism | **Sunder**: my damage spells meet saving throws 10 lower | **Unravel** - Damage Health 8-14 + 2-3 a level and Silence 3 + 1 a 4 levels rounds (chance 30 + 2 a 2 levels), magic, at range | when it lands, a third of its magicka comes back |
| Bloodmage | Destruction + Restoration | **Sanguine Tide**: my damage spells strike 1% harder for every 2% of my health missing, at most 25% | **Blood Boil** - Damage Health 10-18 + 2-3 a level, fire, at range | a foe it leaves under 30% of its health boils again for as much |
| Elementalist | Destruction + Thaumaturgy | **Conflux**: each damage spell of mine that lands on a foe builds a stack for 10 seconds, 3% more spell damage a stack, at most 5 | **Chain Lightning** - Damage Health 10-18 + 2-3 a level, shock, at range | arcs to the two nearest other foes within 8 m for half of what it landed |
| Seer | Illusion + Mysticism | **Foresight**: one foe blow in eight is foreseen and lands nothing | **Psychic Lance** - Damage Health 8-14 + 2-3 a level, magic, at range | the foe it strikes is laid open: for 12 seconds my damage spells at it meet its saving throw 20 lower |
| Lightbringer | Illusion + Restoration | **Dawn's Ward**: my damage spells strike undead and daedra 20% harder | **Dawnbolt** - Damage Health 8-16 + 2-3 a level, magic, at range | a fifth of what it lands heals me, and undead and daedra burn again for half |
| Enchanter | Illusion + Thaumaturgy | **Glamour**: +10 Personality, +15 Etiquette and +15 Streetwise | **Beguile** - Pacify Humanoid and Charm, chance 30 + 2 a 2 levels, at range | a foe it calms gives its magicka back whole |
| Necromancer | Mysticism + Restoration | **Death's Due**: each foe I kill returns 5% of my health and 5% of my magicka | **Siphon Life** - Damage Health 8-16 + 2-3 a level, magic, at range | half of what it lands heals me |
| Soulbinder | Mysticism + Thaumaturgy | **Soul Well**: each foe I kill returns 10% of my magicka, 20% if my Soul Trap held it | **Soul Lance** - Soul Trap 6 + 1 a 2 levels rounds (chance 40 + 2 a 2 levels) and Damage Health 6-12 + 2-3 a level, magic, at range | a quarter of what it lands comes back as magicka |
| Hierophant | Restoration + Thaumaturgy | **Absolution**: a hurt that leaves me under 30% of my health heals a quarter of my health; ready again after 3 minutes | **Sanctify** - Heal Health 12-20 + 2-4 a level, Cure Poison and Cure Disease, on myself | a ward: Spell Resistance 30%, 6 rounds |

The numbers sit inside the ladders the loot keeps: every percent onto a damage spell adds to the loot's own
(`spellPower.js` spellPowerMult sums every registered modifier), the loot's capped at `SPELL_POWER_MOST` 50 on its own
and a path's at most 25; no heal or magicka a path gives ever passes its maximum (`playerHeal.js` healMine, manaMine);
a rider's blow on another foe goes through the host's own door (`playerDoor.js` hurtFoe - its pool, a kill mine), and
the Bloodmage's and Lightbringer's second burn is a blow of mine, never one paid back (`paidBack` is for a foe's own
blow turned on it).

## 6. The signature spells

- **Records.** Each is a ready-made spell record (`arcanePaths.js` signatureSpell), the classic SPELLS.STD shape with
  three effect slots, carrying `path: <id>` and an index of its own (-46101 to -46115). Ready-made, never craftable:
  the spell maker does not offer its rider, and a record without its path's holder is the plain bundle. Saved whole,
  as every made spell is (`save.js` - `custom`).
- **The shelf.** The Mages Guild's (and a temple's) Buy Spells offers its own path's signature spell to a holder whose
  path is awake - offline and online, at the shelf's own price. Nobody else is offered it.
- **Cast in the path's schools.** A signature spell is priced and taught by its path's two schools (`spellcost.js`
  castSchool, read by calculateCastCost and `scenes/hostMagic.js` tallyCastSkills): an effect of one of the pair stays
  its own school's; any other effect (Siphon Life's Damage Health is Destruction's) prices and teaches as the stronger
  of the pair - so a Necromancer's Siphon Life is cheap at Restoration 150, and casting it trains the Necromancer's
  schools, not a Destruction they never chose. Its school past 100 (section 4) reads the same school. Asleep, every
  effect is its own school's again.
- **On the wire.** Every signature effect is a classic key (0..44), three slots at most, so a cast frame and a duel
  frame carry it as they carry any spell (`net/wire.js` castSpellOf) - and land it without its rider.

## 7. SCHOOLS5 - the judge

`server-account/src/judge.js` characterFindings, a new code `path`: a save's `arcanePath`, when it carries one, must be
a path whose two schools are both in its `masteredSkills` (a mastery is only made at 100, and is never undone - the
judge reads no skill's value, which can fall after its mastery); and every signature spell in its spellbook must be its
own path's. An honest save can never break it (nothing writes the field but the
choice, and the choice refuses what this refuses), so it costs no honest player a frozen trade. The masteries
themselves are not judged here: a save from before SOFTCAP4 can hold a skill past 100 with no mastery listed, and the
judge's verdict freezes trade - judging that is a call of its own (section 9). `arcanePaths.js` joins the account
Worker's deploy filter; the service's version moves to `acct127`.

## 8. The seams, and the four hosts

- `systems/arcanePaths.js` - the law: the fifteen, every number they name (`PATH_NUMBERS`), their words, the choice,
  awake, castSchool's pair, the judge's finding. A leaf (`masterSkills.js`, `skills.js` and `textManager.js` alone), so
  the price and the judge read it with no cycle. `systems/signatureSpells.js` builds the records with the spell maker's
  own builder.
- `systems/arcanePowers.js` - what the paths DO, registered at import through the seams the sets and the loot opened:
  `spellPower.js` (power, pierce, and a new LANDED listener - `registerSpellLandedListener`, told by the cast engine
  when MY spell lands), `spellcost.js` (cost), `castSpeed.js`, `entityMods.js` (the fold), `playerEntity.js` (damage
  modifier, hurt listener), `playerKills.js`, `worldTick.js` (the round), `absorption.js`.
- `systems/effects.js` - the schools past 100 (section 4), each through `spellPower.js` schoolPotency.
- `scenes/hostMagic.js` - THE ONE CAST ENGINE every host casts through, so all four hosts are wired by it:
  `scenes/exterior.js`, `scenes/world.js`, `scenes/worldModes.js` (interiors) and `scenes/dungeonContext.js`
  (dungeons). It tells the landed listeners (`applySpellToFoe` for my spell at a foe, `applySpellToPlayer` for my own
  cast on me) and tallies by castSchool. `arcanePowers.js` is imported by both page hosts (`scenes/world.js`, whose
  page runs the interiors and the dungeons, and `scenes/exterior.js`), as the set powers are.
- `scenes/worldModes.js` - the shelf (section 6).
- `scenes/shared.js` - the ask; `ui/charsheet.js` and `ui/enhancedCharSheet.js` / `ui/enhancedMenu.js` - the choice.
- `systems/save.js` - `arcanePath` and `pathPrompted`.

## 9. Departures, and what is recorded rather than built

- **Port-only, all of it.** Daggerfall has no specialisation, signature spells or school perks; Port-Ledger A records
  the arc.
- **The masteries are not judged online** (section 7) - recorded, the owner's call: holding a pre-SOFTCAP4 save's
  skills past 100 against a mastery list it never had would freeze honest players' trade.
- **No respecialisation.** Permanent, as a mastery is (Mac, SOFTCAP4: "this decision can not be undone"). A paid
  change, as a profession's specialisation has (Professions-Arc 3.3), is the owner's call if players ask for one.
- **Offline the schools past 100 stay Daggerfall's** (section 4) - the paths themselves work offline with the switch on.
- **The numbers are a first cut.** Every one is a constant in `arcanePaths.js` (`PATHS`) or `arcanePowers.js`, named
  and pinned, so a balance pass moves one number and one pin.

## 10. Pinned

`test/schools_arcane.test.js` (11) - by execution through the real producers: the law (the fifteen pairs whole and
distinct, the choice and its refusals, permanence, awake and asleep), the save's round trip, the shelf, the price and
the tally by the path's schools, the six schools past 100 through the real `applySpell`, every rider through the real
cast engine's landing doors, every passive through its own seam, and the judge's finding. `tools/mutants/schools.json`
(65, all dead). PIN MOVED: `dropsaudit`'s damage-over-time round (it reads the school its rounds are cast in), and
by content `bal9.json`'s two and `dropsaudit.json`'s two records the same lines moved; the account service's version
pins to acct127 in the nineteen suites and their records.

Every word a player reads goes through the text core (`t()`, 99 keys under `schools.` and `pause.master.spec.`),
drafted into the thirteen whole languages (`tools/l10nInSession.mjs`, each glossary given the new terms); a
signature spell's name is minted into its record in the buyer's language, as a made spell's name is the maker's.
