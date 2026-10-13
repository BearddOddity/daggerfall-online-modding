# FIELD BUGS 2026-10-13c - one thread from the bug-reports channel

One Discord thread from 2026-10-13, handed over as a screenshot, read on the code as it stands at main's `8b0d093a`.

| | Report | What it was | Done |
|---|---|---|---|
| 1 | "[ANGRY] Died of fatigue in wayrest palace, character aged past limit and remains did not appear" (TheHalfinStream) - "Because of this horrible bug, I have lost: My caravan, horses, and all wagon stored goods; All of my gear and items; My bank account with all of my gold; All my progression. I got to keep: My house and windmill, 3000g" | an Enduring member whose span was spent fell for good in Castle Wayrest - the palace's door is its dungeon's entrance - and the line's Succession passed the mantle. The remains were laid where she fell as a list the record owns, and nothing was ever drawn for them: the list opens by itself within six paces of the very spot underground, and nothing said where the spot was. And the gate that keeps it shut "in a fight" read the street's foe pools, frozen while the castle stood, so a street walker sensed on the way in kept it shut on the spot | fixed (REMAINS-STAND, LIVE-FIGHT); the collapse and the final death are the laws as written (THE DEATH); what passes to the heir answered, the wagon and the bank's balance the owner's call (ESTATE-WIDER, planned) |

## THE DEATH: the collapse, and the span (1) - NOT CHANGED, the laws as written

THE COLLAPSE IS DFU'S. At no fatigue left, `PlayerEntity_OnExhausted` (PlayerEntity.cs:2380-2441) asks
`AreEnemiesNearby` (GameManager.cs:684-732): none, and the player drops to the ground for an hour (TEXT.RSC 1071); a
hostile foe that sees the player or stands inside classic's spawn band, and it is `SetHealth(0)` (1072). The port's is
`systems/rest.js exhaustionOutcome`, and underground `dungeonContext.js onExhausted` takes the one damage door's
SetHealth(0) arm (`hurtPlayer`, `bypassShield`), which the Legacy host hears as any death (`setDeathListener`). Castle
Wayrest's guards stand passive - RDBLayout.AddEnemy's Passive reaction, `isHostile` false - and count for nothing until
the castle is turned on the player: a door bashed inside it (`world/actionSystem.js attemptBash`, DaggerfallActionDoor's
`MakeEnemiesHostile`) or a blow. So a collapse that kills in the castle is one with a hostile foe near. SWIM-SPENT
(`Field-Bugs-2026-09-30b.md`) changed the water's arm of this law and no other.

THE SPAN IS THE ENDURING MODEL'S. Each death took Arkay's toll, years off a span (a Breton's 90, born at 23, five
years a death at the Standard toll); spent, the next death is the last (`systems/legacy/age.js payToll`), and she
died of her years (`cause: 'years'`). It was said: the rise that spent it ("... and Arkay will not grant another"),
the Stats page's sheet ("Your span is spent: your next death is your last."), the elder's line once a load. The
mantle then passed exactly as in a Bloodline (Legacy-Arc section 6).

WHAT PASSES (Legacy-Arc sections 5, 7 and 10c). The estate - a quarter of the gold she CARRIED, at most 9,900, as a
letter of credit (the reporter's 3,000 is that); her houses, deed and all (PERMADEATH-HOUSES: the house and the
windmill); and the remains - the bones (laid to rest, their blessing), the heirloom (always, for an Enduring elder dead
of their years: the best weapon or armour she wore) and a tenth of her purse (at most 2,500). THE REMAINS NEVER
REACHED THE HEIR: that is the bug (REMAINS-STAND). The rest - the wagon with its horses and its hold, the pack, the
bank's balance, the levels and skills - stays in her own save, which the line refuses to play (THE PAST, section 3), as
her house did before PERMADEATH-HOUSES (ESTATE-WIDER).

## REMAINS-STAND: the remains are seen where they lie (1)

`src/scenes/legacyRemainsStand.js` createRemainsStand; `src/scenes/legacyHost.js` readyList, remainsToStand;
`src/scenes/world.js` legacyHere, legacyInDungeonOf, legacyRemainsFeet, the stand, legacyStep;
`src/scenes/droppedLoot.js` lootFinds; `src/scenes/lootLines.js` setLootMarksLive; `src/systems/silverFinds.js`.

FOUND. AUDIT LEGACY H1 (`Audit-Legacy.md`) found the remains' world pile laid again at every visit and every reload,
the heirloom in each, and made the remains a list the RECORD owns, opened as a container where they lie - and the
pile's picture went with the pile: NOTHING WAS EVER DRAWN FOR THEM. The death records where they lie
(`legacyHost.js onDeath` -> `layDeathRemains`; the place is `world.js legacyHere`'s - underground the dungeon by its
location and the fallen's own floor position), and the slow tick opens the list (`remainsStep`) only where
`legacyAtPlace` answers: underground within six paces (`LEGACY_REMAINS_NEAR_DUNGEON`) of that position, in its own
dungeon. The world map rings the dungeon's pixel - for a castle, its city's - and the journal says "deep inside"; in the
castle nothing marks the spot, nothing stands on it, and the heir walks past it. Reproduced through the producers: a
founder of an Enduring house, her span spent, killed in a castle by the collapse's own SetHealth(0) door, the newborn
heir landing through the birth's door - thirty metres from where she fell nothing opened and nothing stood in any pool.

FIXED. THE REMAINS STAND AS A BODY where they lie, in the ground pool of the host the one played stands in - the
street's, or a dungeon's through worldModes' `droppedPool` - their own picture (`REMAINS_FLAT`) on the floor under the
fallen's last position (the dungeon's `floorAt`) underground, and outdoors at the native spot where they fell, at the
height they stood at (`legacyHere` keeps it now: a roof, a bridge; an older row stands on the ground) - a record's
height, so in DFU's frame on the ground it was measured on, as the Recall anchor keeps its own (AUDIT LANDFORMS C1 and
TERRAIN-SCALE1: `groundFrameHeight` in, `restandHeight` with its stamp out) - once its pixel is built and dying with its
pixel. THE BODY'S LIST IS THE RECORD'S: the same array, so a take from it is a take from the record, as the list's own
window always was - claimed by the member who changes it (AUDIT LEGACY II H5), the bones going back into it and into no
other pile (H4: it wears its mark). It is `unsaved`: no save, no scene cache and no room's memory carries it, so nothing
is laid twice (H1 stands) - stood afresh at each visit, and let go when its place is left, its pool goes (a door, a
load, a pixel collected), its list is taken home, laid to rest or replaced (a load's merge: stood again over the new
one), or the switch is off. The plaque names it ("The remains of Ysolde Hlaalu" - the map's ring's own words, one home:
`LEGACY_TEXT.remainsName`, so no new English reaches the L10N4 ratchet), a line of light stands over it with the
loot-rarity row on or off (`REMAINS_MARK`, the open zone's own remains' way, WILD1), and it holds no silver find
(`noFind`: the line's list, stood afresh at every visit, would have paid for coming back). The host hands the world only
the rows it may stand (`remainsToStand`: the slow tick's own guards - never for the past played back, a waiting
Succession or a page not the one played's), each list made ready as its window makes it (`readyList`, one home: its
mark, the load's repairs once, and nobody's list noted as it stands - a change from there is a claim). The world frames
the stand once a second, after the tick (which lays the bones again and lets a claim lapse before a list is made ready).
The lines' liveness is each kind's own word now (`setLootMarksLive(on, by)`): the open zone says its own every frame
online, and one word for every kind would have put the house's line out.

THE LIST'S OWN WINDOW STANDS (Legacy-Arc section 7: within six paces underground, sixty metres outdoors, anywhere on its
town's pixel for a death in a building; once a visit, never in a fight). The body is a second door to the same list,
pressed as any body - in a fight too, where DFU's loot window pauses the world.

A DEATH IN A BUILDING STANDS NO BODY: its law is the street's - the place names no building, and the list opens anywhere
on its town's pixel in the street, the moment the heir walks it.

## LIVE-FIGHT: the fight is the place the one played stands in (1)

`src/scenes/world.js` the Legacy host's `inFight`.

FOUND. The remains' "never in a fight" - and Play as, Pass the mantle and a wedding with it (`switchRefusal`,
`mantleRefusal`, `wedRefusal`) - asked `areEnemiesNearby` over the street's pools (the watch, the street's foes) and the
dungeon's, in every mode. A mounted mode's frame returns before the street's, so the street's foes are not stepped while
a dungeon or a building stands, and their senses stay as they were when the player went in - `wouldBeSpawned` latched
for a hostile walker within classic's exterior band (`CLASSIC_SPAWN_DESPAWN_EXTERIOR`, 102.4 m). DFU walks the ACTIVE
enemies alone (`ActiveGameObjectDatabase.GetActiveEnemyBehaviours`, GameManager.cs:690), and underground the street is
not active. So one hostile walker near the castle's door - a city at night - kept the whole visit "in a fight": the
list stayed shut on the very spot. A building's own foes (IF) were never read at all. Reproduced: the heir two metres
from where she fell, a street foe latched: the list did not open.

FIXED. The street's pools outdoors, the place's own inside (`modes.insideFoes` - the dungeon's, or the building's foes and
its watch), as the host's other fight reads already ask (the giant's notice, the time scale's).

## ESTATE-WIDER: the wagon and the bank's balance (1) - NOT CHANGED, the owner's call

The reporter's list is the design's: what the fallen held that is no estate, house or remains stays in the past's save.
PERMADEATH-HOUSES was the owner's answer for houses alone (2026-10-09: "now all that needs to be looked at is what
happens to houses owned by dead permadeath characters", then "the heir inherits: the deed is the estate's, as the gold
is"). Handing more down is new law. THE PLAN, if taken:

- THE WAGON. The fallen's wagon - its kind's item, its hold (`wagonItems`), its horses (Horse Cart and Cargo's stable) -
  taken up by whoever carries the line, as a deed is (`takeDeeds`' shape: the taker's save's word, so a reload never
  loses it and never gives it twice), read out of the fallen's newest save offline and their tombstone's realm record
  online. One wagon a character: a taker who holds one finds the other WAITING, as a second house in a region does.
- THE BANK. Some share of the fallen's balance into the estate. Online the birth law (`realm.js firstSaveRefusal`: a
  newborn's liquid wealth at most 10,000) holds the first save, so it would be paid into the heir's bank account after
  it, as the deeds are taken up the first tick after the birth.

## THE FOUR HOSTS (1)

`scenes/world.js`: wired - the stand, its pool and its places, and the Legacy host's fight. `scenes/worldModes.js`: wired
through its pool (`droppedPool`: the dungeon's, and the building's - where no body stands, its law the street's) and its
fight (`insideFoes`). `scenes/dungeonContext.js`: wired through its pool, its floor (`floorAt`) and its loot door (a
dropped pile's `takeLoot` opens the body as any pile). `scenes/exterior.js`: FLAGGED (Legacy-Arc section 3) - the fixed
city keeps DFU's death: no house, no remains.

## ASKED OF THE REPORTER

Which heir carried the line on (a newborn, or a living member); whether they went into the castle, and how near the spot
she fell on; whether the castle had been turned on her before the collapse (a door bashed, a blow); and whether they
play online.

## Pins (1)

- `test/fb1013c_remains.test.js` (5): the report end to end through the producers (the Legacy host, its death at the
  collapse's own SetHealth(0) door, the Succession and the birth; a real ground pool; the world host's own `legacyHere`,
  `legacyAtPlace`, `legacyRemainsFeet`, the stand and `inFight` run off its text) - the body stands in the castle's pool
  on the floor under her last position, its list the record's own array, named, marked, on the ray, in no save, never
  laid twice, in no other dungeon and not in the street; a take through it is the heir's claim, the bones go back into it
  and into no other pile, carried home it is let go and laid again it stands again, and it is stood afresh at every
  change of its pool, its pile or its list, never for a waiting Succession, a page not the one played's or with the
  switch off; in the open at the height she stood (written in DFU's frame with its stamp, stood again through them),
  once its pixel is built, dying with its pixel, an older row on the ground and a building's none; the fight read off
  the place (a latched street walker no fight underground, the list opening on the spot; the dungeon's and the
  building's own foes a fight); its line with the rarity row off under the house's own word, no silver find, and the
  hosts by source.
- `tools/mutants/fb1013c_remains.json` (34, all dead). Re-aimed by content: `auditlegacy2.json`
  AUDIT-LEGACY-II-H5-claimed-at-the-open and `itemwalk.json` ITEM-WALK-B-remains-unrepaired (a list's readiness has one
  home now, `readyList`); `loot11.json` LOOT11-pass-off and LOOT11-drop-pool-no-finds (the lines' word, each kind's own;
  a pile's own mark). Each list run whole: `auditlegacy2.json` and `itemwalk.json` 59 dead, `loot11.json` and
  `silverfinds.json` 101 dead. No relay or account file is touched: RELAY_VERSION and ACCOUNT_VERSION stand.
