# FIELD BUGS 2026-10-13c - ten threads from the bug-reports channel

Ten Discord threads from 2026-10-12 and 2026-10-13, handed over as screenshots, read on the code as it stands at main's
`3f66ff06`. Each was traced on the real modules first, most with a reproduction; the fixes are built and pinned one to a
tag. Where the fix departs from Daggerfall Unity it rides the owner's standing word on such departures - "I dont care
about DFU. We're our own thing now." (FIELD BUGS 2026-09-30b) and "I dont care about DFU parity wtf" (2026-10-11b) - and
is a Ledger A row.

| | Report | What it was | Done |
|---|---|---|---|
| 1 | "New affixes on crafted items" - "Added potency and cast speed, cast cost affixes are not rolling on crafted jewelry" (Boar) | the crafting mint takes the loot ladder's rarity roll and never its last pass, the one door the proc lines (focus, cast speed, potency, wellspring) come through | in progress (CRAFT-PROCS) |
| 2 | "Cant turn in writs" - "Have the materials literally on hand. They don't accept them" (Uncon...) | law 3: a writ spends only what the service counted (gathered, or bought with silver); looted, shop-bought, traded and gold-bought Iron is held and never counted - and the card said "0 held" and "Not enough" with 100 in the pack | in progress (WRIT-WALL) |
| 3 | "Shared Guild quest doesn't give me map location after friend talked to the quest npc" (Starempire42) | a `reveal` marks the clicker's own map, and a shared quest's copy carried it complete without running it | fixed (SHARE-REVEAL) |
| 4 | "The current situation where doors lock at shops and inns in Daggerfall Capital" - "Once you get stuck, there's no way out" (Nes) | one player's Lock spell, at the caster's level, reached every visitor through the building's act and its thirty-day memory | fixed (SPELL-LOCK) |
| 5 | "Some locations have floating houses" - "Temple of Kynareth has floating houses due to terrain modifications" (SylviaBun) | the pack hills' stand-ins seat a plateau's houses at their origin and fall away under their edges | fixed (HILL-SEAT) |
| 6 | "Cant complete quest 'the lost child'" - "accidentally said 'no' ... now i cant interact with it at all" (Ant1-Chr1st) | DFU's own soft-lock: K0C00Y05's No leads nowhere and its clicked-npc task never listens again | in progress (NO-ASKS-AGAIN) |
| 7 | "Performance issues with boss AoE attacks circles and player sprites" (HellRay) | being measured | in progress (AOE-PERF) |
| 8 | "Molag bal mace do nothing" - "It's effect is not working and it's extremely fragile" (Boar) | the strength arm raises a stat the port caps at 100 - DFU raises the cap with it | in progress (MACE-MAX) |
| 9 | "Tavern in Issaqumbaa marked as a player house" (SylviaBun) | the door's plaque named the first building box holding the ray's point - a neighbour house's - while the click entered the tavern | fixed (DOOR-NAME) |
| 10 | "Delayed death after combat despite full health" (sxxlxxr, Knightshead) | DFU's exhaustion collapse: fatigue spent with a foe in the spawn band is death whatever the health, and the box saying so was replaced by the death screen before it drew | in progress (SPENT-ASHORE) |

## SPELL-LOCK: a Lock spell's lock is its caster's, and no peer's word locks a door past its own data (4)

`src/world/actionSystem.js` lockCeiling, lockLands, restoreSaveData's `remote` and `level`, applyRemote;
`src/world/interiorShared.js` applyInteriorShared; `src/scenes/dungeonContext.js` applyWorld; `src/scenes/worldModes.js`
the building's cached copy.

FOUND. Nothing in the port locks a building's inner door: interiorContext adds its doors with no starting lock, as
DaggerfallInterior.AddActionDoors sets none, and no closing-hour or night law touches an interior door. A lock of 40 or
41 has one source - the Lock spell, which locks at its CASTER'S level (`mysticism.js` triggerLock, Lock.cs:116); a
building's own lock tops out near quality/2 and the dungeon table has no 40 or 41. Online a building's doors are shared
(WORLD3's act, WORLD6a's room memory, kept by the relay for WORLD_TTL_MS, thirty days), and the record carries the lock:
one player's Lock reached every visitor, and every visitor who walked in for a month restored it. At 20 and over a lock
is magically held (MAGIC_LOCK_THRESHOLD: no pick, no bash) and Open yields only at the caster's level or above
(Open.cs:117), so a level-21 player behind a level-41 lock had no way through - and the Lock swings an open door shut,
so a player in an inn's room, or a shop's back room, was shut in. The screenshots' players stand at level 21 and 19.
Daggerfall has one player, who can always Open what they locked. Reproduced through the real ActionSystem and the real
building memory: a level-41 Lock on A's copy landed 41 on B's by the act and on C's by the memory, and B's pick, five
best-roll bashes and a level-8 Open left it at 41. `actionSystem.js`'s ACTION_LOCK_MAX said "DFU's own values run
0..20" - RDBLayout's LOCK_VALUES run to 255 (the sentence is mended).

FIXED:

- A PEER LOCKS NO DOOR PAST ITS OWN DATA. `lockCeiling(o)`: the door's starting lock, or LockDoor's 16 where the door's
  own action can lock it. A peer's word - an act (applyRemote), a building's memory (applyInteriorShared), a dungeon's
  (applyWorld's `wire`) - lands a lock only up to it: a pick, a bash, an Open and a re-lock to the door's own value are
  shared as WORLD3 shares them; a Lock spell's lock stays its caster's, and the door keeps the lock it has. The swing
  still lands (the door shuts for everyone; a press opens it). A placed door not hung yet keeps a peer's swing and no
  lock (HOME-DOORS' early records). A memory already on the relay is read the same way, so the thirty days poisoned
  before this lands nothing.
- THE TRAPPED PLAYER'S OWN COPY IS MENDED. A building's cached copy and a dungeon's save took the peer's lock before
  this: their restore drops a lock past both the door's ceiling and the player's level - no Lock of theirs could have
  cast it (a level never drops). Their own Lock, at or under their level, stays theirs.

`test/fb1013c_spelllock.test.js` (4); `tools/mutants/fb1013c_spelllock.json` (14, all dead).

## DOOR-NAME: a door's plaque names its own building (9)

`src/scenes/worldModes.js` doorBuilding, exteriorHoverName's building arm.

FOUND. "To Residence ... Buy it" is HOME-PLAQUE's word for a building with no name that passes `homeCandidate` (House1-6
or HouseForSale): the plaque had resolved a HOUSE for the tavern's door. It resolved it by the ray's point -
`buildingUnderRay`, the first StaticBuilding box of every loaded block's that held it - while the click enters, prices
and buys the door's own record (`activateStaticDoor`'s `buildingDataForDoor(hit)`). A box is the axis-aligned box of a
rotated building (DaggerfallStaticBuildings.cs:73-86), wider than its walls, and World Tooltips box-tests only the HIT
block's buildings (GetBuildings(hit.transform), Modded_HUDTooltipWindow.cs:701-702); the port tested every block's. So a neighbour
house's box over the tavern's doorstep named the tavern's door, while the click walked into the tavern - and the town's
map, drawn off the blocks' own bytes, showed a tavern. Reproduced through the real mode machine on a tavern beside a
turned House3: the plaque named the house and discovered it.

FIXED. A door's plaque names the building the door belongs to - its own record, the one its click enters (`doorBuilding`,
the same `buildingDataForDoor` on the same entry) - and the mod's discovery maps that building. A departure from the
mod's box test (Ledger A). The press keeps the box for ActivateBuilding's discovery, as DFU's does.

NOT SEEN. Issaqumbaa's own blocks (no ARENA2 here): which house's box covers the tavern's step. Asked of the reporter:
whether "Buy it" walks into the tavern - if it does, this was it.

`test/fb1013c_doorname.test.js` (1); `tools/mutants/fb1013c_doorname.json` (2, both dead).

## SHARE-REVEAL: a shared quest's `reveal` marks the receiver's map too (3)

`src/systems/quest/machine.js` REPLAYABLE_ONE_TIME_ACTIONS.

FOUND. The quest reads as the Mages Guild's N0B00Y17 ("Azimuthal Vectors"): `_S.05_ clicked npc _scholar_`, and `_S.12_`
runs `reveal _itemdung_` with the log entry that names the dungeon. RevealLocation writes the CLICKER'S map
(PlayerGPS.DiscoverLocation, RevealLocation.cs:59) - a player's own discovery, not quest state. A shared quest travels as
its save state and restores every action as it stands; QUEST1 re-arms on the receiver the one-time actions whose effect
lands in the holder's own world, and `reveal` was not among them. So the friend's map had The Nest of Aneloth and the
reporter's journal said "Not on your map yet". Nobody could tell them: a quest's people take the click
(QuestResourceBehaviour, PlayerActivate.cs:1525-1528) and its `clicked npc` fires once, as in DFU, and DFU's "Where is"
names only the current town's quest buildings. Reproduced on the real quest through the real share.

FIXED. RevealLocation joins the re-armed set: it is self-contained (this quest's own Place, the holder's own map, and
discoverLocation is idempotent). A fresh receive marks every place the partner's copy has revealed, and a resync marks
each new one, once. A `readmap` reveal files its note once on the receiver.

FOR THE REPORTER, NOW: a copy that took the reveal complete before this keeps it complete; Settings, Repair active
quests (QREPAIR) files every reveal that has run again, and marks the dungeon.

`test/fb1013c_sharereveal.test.js` (2); `tools/mutants/fb1013c_sharereveal.json` (1, dead); `disc28.json`'s
DISC28-I-getitem-not-replayed re-aimed by content (the set's text grew), dead.

## HILL-SEAT: a hill holds what the author stood on it (5)

`world/townStandIns.js` (blockHillPatch, HILL_SEAT_TOLERANCE, HILL_PATCH_SINK; blockHillSeat's `lay` and its 2 m cell
index; the hill's UV rule shared with hillMesh), `scenes/world.js`, `scenes/exterior.js`.

FOUND. No terrain layer moves the ground under a location's buildings: blendLocationTerrain levels the rect and the
buildings stand at the same height (measured 0.000 m on synthetic temple pixels, coastal and inland, Landforms on and
off, with roads, rivers and the water bed). The grass in the screenshot is a HILL: Beautiful Villages stands its Kynareth
temples as 1x1 blocks, and TEMPASH3 (Ipsham's, about a fifth of them) stands houses 127, 129 and 201 and temple 402 on
the RMB Resource Pack's hill 52758, its plateau 4.13-4.22 m up. HILL-SHAPES (FIELD BUGS 2026-10-05) draws each pack hill
as a stand-in - each cell the median of the pack's surface - and seated these houses at their ORIGIN; the median falls
away toward the plateau's edge: 0.23-0.33 m under a house 5 m out, 0.74-1.24 m 7 m out, up to 2.23 m under a 14 m
house's corners - the lit gap under the screenshot's wall. `fb1005_hills` sampled only the middle half of a footprint.
In DFU with the pack, the author's own mesh holds the plateau.

FIXED. A model whose lowest vertex stands over the block's plane (by 0.5 m), over a drawn hill, within a metre of its
top (so not one the author hung there), and that hangs more than 0.05 m anywhere over the hull of its own drawn
vertices, gets a pad: a flat top 0.05 m under its base over its whole footprint and 0.25 m past it, then a 45-degree
bank down until it is 0.25 m under the hill or the plane, wearing the hill's picture in the hill's frame, every face up.
Read exactly: the footprint's corners, the hill's vertices inside it and every crossing of a hill edge with the
footprint's edge, and a 1 m grid. No model moves and nothing rises over a base. The pads are laid into the block's seat,
so TREES-SEATED's trees stand on them. Every point of the four TEMPASH3 footprints is within 0.05 m now (0.15 m is the
law, HILL-SHAPES' bar for the origin taken to the whole footprint); the four pads come to 837 triangles.

NOT SEEN, with no ARENA2 and no GPU here: the real house meshes' footprints and bases, and which other classic models
across both packs take a pad (the gated sweep is written and has not run); whether a bank buries a neighbour's door, a
HILL-HOUSE placement or a quest marker; how the seam between bank and hill looks, at distance and under the climates'
textures and the shadows; walking the bank; a real pixel's build cost (15-40 ms a block here, on a loaded machine).

`test/fb1013c_hillseat.test.js` (8, one on ARENA2_PATH); `tools/mutants/fb1013c_hillseat.json` (18, all dead). No pin
moved.

## THE FOUR HOSTS

- SPELL-LOCK: the law is the ActionSystem's, every host's door graph. worldModes.js (a building: its act through
  applyRemote, its memory through applyInteriorShared, its cached copy with the player's level) and dungeonContext.js
  (its act through applyRemote, its room memory as a peer's word and its save with the player's level) are wired;
  world.js and exterior.js stand no action doors in the street.
- DOOR-NAME: the plaque is worldModes.js's exteriorHoverName, the one namer both street hosts (world.js, exterior.js)
  call; a building's and a dungeon's doors name no building (worldModes.js's rooms, dungeonContext.js).
- SHARE-REVEAL: the quest machine's, run wherever a quest ticks; no host seam.
- HILL-SEAT: the street hosts stand the town blocks and both are wired through one function - world.js merges a
  block's pads into the pixel's static batch and its collider bucket (freed with the pixel, and on a failed build);
  exterior.js draws and collides them for the fixed city's life, as it does every model of its one location.
  worldModes.js's rooms and dungeonContext.js stand no hill.

## Pins

`test/fb1013c_spelllock.test.js` (4), `test/fb1013c_doorname.test.js` (1), `test/fb1013c_sharereveal.test.js` (2).
`tools/mutants/fb1013c_spelllock.json` 14, `fb1013c_doorname.json` 2, `fb1013c_sharereveal.json` 1: all dead. Re-aimed
by content, dead: `disc28.json`'s DISC28-I-getitem-not-replayed (the re-armed set grew) and `housing.json`'s
HOME-DOORS-the-early-record-dropped (the early record now drops a peer's lock). `test/citedrift.test.js`'s vendor table
carries the mod's `.cs:701-702` that DOOR-NAME's comment cites.
`test/fb1013c_hillseat.test.js` (8, one on ARENA2_PATH); `tools/mutants/fb1013c_hillseat.json` 18, all dead.
