# FIELD BUGS 2026-10-12b - six threads from the bug-reports channel

Six reports from 2026-10-12 - five Discord threads handed over as screenshots, and one from the owner - read on the
code as it stands at main's `a7e7ea64`. Four are fixed here (one of them in three parts); one is DFU's own quest
working as written, answered for the player; one part of the family tree is the recorded design, planned for the
owner's call.

| | Report | What it was | Done |
|---|---|---|---|
| 1 | "'The First Printing' quest not progressing" - "I got to the part where you confront the thief, but talking to him won't do anything ... He is not changing locations as he should" | Mordastyr Moorford is the quest's `Person _thief_`, placed at a generated home the first time it is entered and never again (DFU's Person.Tick); no task listens to him. The thief fought is `Foe _thiefFoe_`, placed by the hour at the quest's house, store or inn | not a defect - DFU's quest as written (DECOY-THIEF); answered for the player |
| 2 | "Companion Inventory prioritized over looting, taking helm, and other context options" - "you need to get them to move before you can loot an item since it keeps opening their inventory instead" | a companion at the player's heel is a foe the one ray strikes like any other: nearer than the body, the pile, the boat's helm or the door behind him, he was the hit, and his hit opens his pack | fixed (ALLY-YIELDS) |
| 3 | "magic item with only cast on use effect cannot be salvaged" - "it doesn't show up at all in the reforge menu for salvaging" | the "Blazing Holy Dagger of Fireballs" is DFU's own magic (a MAGIC.DEF row on a Holy Dagger), which LOOT9's law prices at no shards - the guilds sell it every day; the Salvage page dropped it silently | the law stands; the page and the card say why (SALVAGE-CLASSIC) |
| 4 | ETHER-ROW |
| 5 | "Odd family tree behavior" - the two heirs one name and class, two birthdays, the nightblade gone; "Only one of us could actually see the heirs"; the heir born "near Privateer's Hold", not at the farm's hovel made the seat | online the page bearing the heir offered the waiting Succession again, and the birth's first save wrote the newborn over the other child; each house raises its own children of a two-player union (Legacy-Arc section 9); a seat moved only to a town, and the Online page's birth booted the classic start | fixed (HEIR-CLONE, SEAT-HOME, BIRTH-START); the union's children not changed - the owner's call, planned (UNION-CHILDREN) |
| 6 | RACE-ROW |

## DECOY-THIEF: the man in the house is not the thief to fight (1)

`vendor/dfu-quests/Quests/A0C00Y12.txt`; `src/quest/person.js` tick, placeAtHome; `src/scenes/worldModes.js` the quest
stand's click.

FOUND. "The First Printing" is A0C00Y12. "Mordastyr Moorford" is its `Person _thief_ face 97 faction
The_Thieves_Guild local`: no line places him and no task answers a click on him. The Thieves Guild's faction row
(`The_Thieves_Guild, 0, -1, 42`) is no building type, so the person is given a generated home, a random house
(`person.js:"_assignHomeTown(world, scopeString) {"`), and Person.Tick stands him there the first time the player walks
in - once: DFU's Person.cs asks `lastAssignedPlaceSymbol == null && homePlaceSymbol != null && !assignedToHome`, "will
not be called again as assignment is permanent for duration of quest", and the port does the same
(`person.js:"  tick(caller) {"`, `person.js:"placeAtHome() {"`). A click on a quest resource that answers ends the
activation (PlayerActivate.cs:1523-1528; `worldModes.js:"const foundInActiveQuest = s.behaviour?.doClick() ?? false;"`),
so no talk window opens - DFU's own. The confrontation is `Foe _thiefFoe_ is Thief`: `_S.02_`-`_S.04_` are `daily from`
windows, each `pc at _house_ / _inn_ / _store_` placing the foe in that building (00:00-08:00 the house the rumours name,
08:01-16:01 the general store, 16:02-23:59 the tavern); `_S.08_` (`injured _thiefFoe_`) gives him the book and says
1030; `_S.06_` (`toting _book_ and _giver_ clicked`) ends it.

Traced through the real parser, the machine and the foe pool (a scratch trace, not kept): the thief's home stands the
person and nothing else; the store at 10:00 stands the hostile Thief; one wound fires `_S.08_` and the foe carries the
book; the kill counts.

NOT CHANGED - the quest is DFU's, word for word. The answer for the player: Mordastyr is not the one to fight. The
thief is a hostile Thief who stands in the house the rumours name between midnight and eight, in the general store from
eight to four, and in the tavern from four to midnight (asking about him names all three). Wound him and he takes the
book; kill him, take it from his body, and bring it to the one who gave the quest. Recorded, not built: a plaque line on
a quest person no task listens to (a departure in QUEST-FOE-LINE's spirit) - new behaviour, the owner's call.

## ALLY-YIELDS: a companion yields the press to what answers behind him (2)

`src/player/activate.js` isCompanion, answersPress, allyYields, liveFoeTargets `ally`, peacefulFoePass;
`src/player/mobileEnemyActivate.js` tryMobileEnemyActivate `behind`; `src/player/activationRace.js` raceActivation
`door` and `next`, PERSON_KEY, raceWinner; `src/scenes/worldModes.js` exteriorActivationHit; each host's `_enemyArm`.

FOUND. The port has no single raycast, so every host races its families' picks and gives a live foe the press only
when the foe is strictly the nearer (`mobileEnemyActivate.js:"if (!(hit.distance < (deps.nearerThan ?? Infinity))) return false;"`,
AUDIT 65 MC-2's law for DFU's one ray, PlayerActivate.cs:314). A companion is in that pool (crewAshore.js stands him
there: `companion`, a `shipmate`), and his hit opens his pack
(`mobileEnemyActivate.js:"if (mode !== 'steal' && openCompanion && foe.companion != null"`). He keeps HEEL_M (2.5 m)
from the player and walks where the player walks, so he stands between the crosshair and whatever the player has
just walked up to: a body (3.75), a pile (3.2), a boat's helm (Come Sail Away's box, 3.2 - raced in the street's
`raceActivation` as `boat` and pressed below the foe arm), a door, a shelf. TACT3d's door pass, which lets a peaceful
watchman yield to a door, was never his (`mobileEnemyActivate.js:"if (!foe || foe.companion != null || mode === 'steal') return false;"`,
AUDIT TACT C5: his pack is asked of him), and the plaque raced him the same way, so it named him too.

FIXED. A companion YIELDS: the press goes to whatever it would take were he not there - the ladder's own winner
behind him - when that ANSWERS from where the player stands, a firm pick inside its own reach
(`activate.js:"export const answersPress = (p) =>"`). Out of its reach that thing would only refuse, so he keeps the
press, and with nothing behind him he is the hit as ever. Another player's team, which yields itself (PR-WAGON1), is
no answer. Every mode: in Steal he was a silent break (a shipmate is no mark), so the thing behind him is the better
answer there too. "Companion" is the companion layer's body and another player's (`peer:`); a hostile foe, a peaceful
watchman, a quest's NPC keep DFU's one ray.

Not the brief's "only when nothing else is under the crosshair" (PR-WAGON1's `firmFirst` over the whole ray): his pack
is storage the player opens every day, and indoors a shelf, a door or a bed stands on the ray behind him on nearly
every look - he would have been unreachable, and the press would have answered "You are too far away" from a shelf
across the room. Reach is the line DFU already draws (MC-2: past its reach a handler only refuses).

The press asks `allyYields(foe, behind)` before TACT3d's door pass
(`mobileEnemyActivate.js:"if (allyYields(hit.foe, deps.behind)) return false;"`), each host handing its ladder's winner as
`behind`. On the street that winner is the race's `next`: `raceWinner` over every family with the door set and the
townsfolk raced in, the door set's own reach from its own pick (worldModes `exteriorActivationHit`, handed to the race as
`door`, where it was its distance alone), a townsperson at MobileNPCActivationDistance - the plaque's own person pick.
The plaque asks the same `answersPress`: `liveFoeTargets` marks his target `ally`, `peacefulFoePass` (the one seam
every plaque's foe goes through) carries it onto his hit, and `raceWinner` passes him for its other winner when that
answers (`activationRace.js:"if (foe?.ally === true) {"`) - so the plaque names what the press takes.

THE FOUR HOSTS. world.js: wired - the street's press (`behind: _race.next`, the race handed `door:`) and plaque (the
seam). worldModes.js: wired - a building's and the world's dungeon's presses (`behind: _pick`, the ladder's winner, a
boat's box among them) and the building's plaque (the seam); `exteriorActivationHit` is its. dungeonContext.js: wired
through the seam alone - its plaque hands `liveFoeTargets(foes, ...)` through `peacefulFoePass`, and it stands
another player's companions (`peer:`); its press is worldModes.js's (and dungeon.js's). exterior.js: stands no
companion (the layer is world.js's alone, AUDIT WK-P2) and is wired anyway, as world.js is - its race is the same
call. The standalone dungeon.js stands none either and asks the same (`behind: _pick`).

NOT CHANGED, and flagged. A living world's company (LW14: `living`, a shipmate, its door `openLiving`) is not the
companion layer and keeps the press - its door is the company's offer. A building's residents (LW8,
`livingPersonsAct`) are raced below the foe arm against the ladder's pick alone, so a companion in front of one keeps
the press, as any foe there does. A companion on a boat's deck with her hull inside 3.2 behind him yields to the hull,
which answers (its plaque lights her verbs) - except under sail, where a hull press does nothing; a look past the hull
reaches him. The street's person reach is the plaque's 6.4 in every mode (Steal's pickpocket refuses past 3.2).

PINS MOVED. `test/hard2_activationrace.test.js` (HARD2's call shape) and `test/audit66_handheldtorches.test.js` (F7's
source half): both exterior hosts hand the race `door: modes.exteriorActivationHit(cam.pos, useFwd)`, still one pick
of the door set a press. `test/audittact.test.js` C5: the assertion stands (the door pass is still never his); its
words now say his yield is ALLY-YIELDS'. `test/audit63_guilds_court.test.js` (AUDIT 65 HP-2/HP-3) lifts the world
dungeon's arm out of the source and runs it over the names it reads: it hands `_pick` too (none there).

Pinned by `test/fb1012b_allyyields.test.js` (7): the companion stood by the real layer (`createCrewAshore`), the body
laid by the pool's producer (`corpseLootTargets`), through the real picks - a body, a helm, a door, a static NPC and a
townsperson each in and past its reach; a hostile foe and a watchman still the hit; another player's companion
yields, another player's team never takes it; every mode; the plaque swept against the press (every answer the same);
each host's own `_enemyArm` and street race cut out of the shipped source and run; `exteriorActivationHit` run.
`tools/mutants/fb1012b_allyyields.json` (21, all dead). No relay file is touched: RELAY_VERSION stands.

## SALVAGE-CLASSIC: classic magic says why it never breaks (3)

`src/systems/reforge.js` salvageRefusal, salvageShards, SALVAGE_CLASSIC; the Reforge's Salvage page and the pack card's
Salvage button; `bible/06-Systems/Loot-Arc.md` (SALVAGE-CLASSIC, after LOOT9's PORTAL1 note).

FOUND. The "Blazing Holy Dagger of Fireballs" is the MAGIC.DEF row "Blazing %it of Fireballs" (one Cast When Used row,
spell 14, 1,500 uses) on a Holy Dagger, minted by `loot.js:"export function createRegularMagicItem("`, which writes no
`rarity`; its card reads "Magic" because the ladder's `lootRarity.js:"export function rarityOf(item) {"` calls any
enchanted piece Magic. Salvage reads the ladder's own grade (`reforge.js:"export function salvageShards(item) {"`), so
the piece is worth no shards, and the Salvage page's filter (shards over 0) and the card's button dropped it without a
word. That is LOOT9's law, not a slip: DFU's own magic and made pieces are "worth none: shards come from what was found,
never bought" - `shopStock.js:"export function stockGuildMagicItems("` shelves these pieces every day, a pawn shop sells
them, a found one is a bought one's twin, and five shards buy a Portal Stone (online's fast travel). No ladder piece was
dropped. The service has no salvage law (its disenchant takes crafted pieces), so client and service agree.

FIXED - the silence, not the law. `salvageRefusal` answers `'classic'` for a piece whose card reads Magic with no ladder
grade and no `provenance` (DFU's own magic of every enchantment kind, the Item Maker's, a soul-bound piece); a made
piece still answers `'not'` and stays off the page (AUDIT LOOT F2: the Enchanting Station's disenchant is its door). The
Salvage page lists classic pieces after every piece that breaks, its button "Classic magic" and disabled, its price "No
shards", the reason in its title and aria-label; "Salvage every Magic" skips them. The pack card's Salvage on one says
why (SALVAGE_CLASSIC) and breaks nothing. Nothing refused before breaks now.

THE OWNER'S CALL, recorded: whether a FOUND piece of DFU magic should break for a shard. The safe road marks pieces at
the loot doors as found and lets only those break (every piece held today, the reporter's among them, still refused);
marking the shelves' pieces instead would let every unmarked piece held today break, bought ones included - a leak.

PIN MOVED: `test/loot9_reforge.test.js` (the card's source line) and its mutant `LOOT9-card-salvages-the-worn`, re-aimed.
Pinned by `test/fb1012b_salvageclassic.test.js` (4), every fixture the real producer's (the reported dagger from
`createRegularMagicItem` over DFU's MAGIC.DEF rows, a guild shelf, an Item Maker piece, a Superior, ladder pieces);
`tools/mutants/fb1012b_salvageclassic.json` (11, all dead).

ETHER-SECTION

## HEIR-CLONE: the page bearing an heir offers no Succession, and a save writes only the one in the world (5)

`src/scenes/legacyHost.js` tick, writeCurrent; `src/scenes/world.js` legacyRealmBirth, legacyStep.

FOUND. Online the heir's birth waits on the realm with the world running: `legacyRealmBirth` waits for the world to
stand (`world.js:"async function legacyRealmBirth".."for (let i = 0; !playerSpawned && i < 240; i++) await new Promise((r) => { setTimeout(r, 250); });   // the world stands before it is saved"`), then makes the realm's character and its first save. The fall the birth answers is settled
only as the heir lands (`legacyHost.js:"if (family.pending && family.pending.fallenId !== p.id)"`, AUDIT LEGACY II B1), so for those seconds the born page's slow tick
(`world.js:"const said = legacyHost.tick"`) answered `{ fall }` and raised the Succession again OVER THE NEWBORN - the elder's retirement, its
choices every living member but the one being born, its lit button the other child. One press (a click, or Enter or
Space under a loading world) was `succeed`: the other child made the line's current on a page playing the newborn. The
birth's first save then ran `writeCurrent`, whose guard let a person with no character id through - the other child,
never played - and `writePlayer` wrote the newborn over them: name, sex, race, face, career, stats, skills and the
newborn's realm character id. Their own `born` was kept: the reporter's "clone of it with a different birthday", and
the nightblade gone. With two persons carrying one character id, every load after found the first of them (the clone)
and wrote into it. Offline the birth lands in the same turn as the chargen, so no tick falls between. Reproduced
through the producers - two players wed, two children on the elder's clock, the mantle passed, the second chosen, the
born page's tick, the press, the first save - in `test/fb1012b_familytree.test.js`.

FIXED, two laws. A page bearing a member (`born`, until `onBorn` lands them) is the fall's answer and offers the
Succession to nobody (`legacyHost.js:"if (family.pending) return deps.entity?.chargenDone"`). And a save writes only the person who IS the character in the world
(`legacyHost.js:"if (!playedHere(p))"`, `playedHere`): never a member a choice made current while the page still plays its own - after a
Succession's choice, a switch, or on a born page before its birth lands - so the fallen is never written over an heir
either, as a save before the boot goes would have.

The reporter's record keeps two persons carrying one character id, and the nightblade's own name and class are gone
from it. Its last copy before the clone should ride the retired elder's last save (passMantle saves before the
tombstone; the realm's tombstone record is read through `/v1/realm/<id>/data`): the nightblade whole, for staff to put
back - NOT DONE here, the account's data is not in this tree. If the press came before the realm
made the character, the realm character's `person_id` names the nightblade's id - its house badge reads off that person.

## BIRTH-START: the Online page's birth starts in its seat (5)

`src/main.js` the front door's classic start; `src/systems/legacy/waitingHouses.js` takeUpLine; `src/scenes/world.js` the
start.

FOUND. HOUSE-WAITS (`Field-Bugs-2026-10-09f.md`) answers a waiting Succession from the Online page and boots the birth
with `legacyborn`, `region` and `loc` - the line's seat (`waitingHouses.js:"const place = family.seat?.region"`). The front door then set `classic` as for
every menu door (`main.js:"else params.set('classic', '1')"`), and the world host reads the classic start's cell before the place a boot names
(`world.js:"if (params.has('classic'))"`): the heir stood in Privateer's Hold, inside it with StartInDungeon. The world's own Succession was never
touched - its address drops `classic` (places.js birthSearch).

FIXED. A boot bearing a member leaves the classic start off (`main.js:"if (legacyBirth) params.delete"`), so it stands in the place its birth names.
Every other door begins where Daggerfall begins. Pinned off main.js's and world.js's own text.

## SEAT-HOME: the seat moves to a home of the house's own (5)

`src/scenes/legacyHost.js` placeHere, familySeatHere, switchTo, onBorn, LEGACY_TEXT.seatNowhere; `src/ui/familyPages.js`
SEAT_HINT.

FOUND. The seat is the first town the house stands in, or the town the player moved it to (FAMILY-SEAT,
`Field-Bugs-2026-10-07b.md`), and the move asked `deps.town`, a town's map pixel alone (`world.js:"&& h.mode !== 'dungeon' && h.loc &&"`). A home on a
farm stands on no town: bought, it was the line's family home (LEGACY-HOME - the never-played and the retired live in
it), but the House page offered no move there ("Stand in another town ..."), and the heirs were born in the seat noted
at the first town - for a character fresh out of Privateer's Hold, the first town past it. A member met in that hovel
and played for the first time ("born in the town they were met in") was born in the seat too: no town stood where they
were met.

FIXED. The place the one played stands in (`legacyHost.js:"function placeHere"`) is a town, as before, or a place where the house holds
a home of its own - a farm, a manor - by the place's map id against the line's houses: its grounds or the house, never a
dungeon under it, never a farm the house holds nothing on. The House page's move reads it (`legacyHost.js:"const t = placeHere"`), so
"Make Ashfield Farm the family seat" stands there and the heirs are born at the farm; a member met there is born there
(`legacyHost.js:"return { ok: play"`) and their first day names it (`legacyHost.js:"const loc = placeHere"`). The hint says so (`familyPages.js:"export const SEAT_HINT"`, the
host's refusal the same words). Recorded as a law, not a departure: the seat was meant to be a PLACE (section 4's B11
root - a coordinate is no place), and a home of the house's own is one.

## UNION-CHILDREN: the children of two players' union, on both trees (5) - NOT CHANGED, a plan

FOUND. Working as recorded: a child of a two-player union is minted by the house whose member's own clock rolls it
(`marriage.js:"standing in this"`, childStep) and recorded in that house's line alone - LEGACY7 part three's departure, "each house raises
its own children of the union (two records, two clocks - the realm keeps no shared child)" (Legacy-Arc section 9). The
other player's house rolls its own on its own clock, and had none yet. Making them shared retires a recorded departure
and shows one account's line to another, so it is the owner's call. THE PLAN, if taken:

- THE LAW. A child is of the house that bore them - its surname, its blood, played only from that line (the realm's
  one character a person, `realm_characters (lineage_id, person_id)`). The other house SEES them through the marriage:
  a person of a new kind, `'union'` - never played there, never carrying that mantle, never standing in that world -
  hung under the couple on the tree, the card saying "Raised in the house of Hlaalu".
- THE SERVICE (no migration, no client write: derived from what the realm holds). `listUnions` reads, for each union, the
  partner's line (`lineages` by the partner character's `lineage_id`) and answers `children`: its persons whose parents
  are the partner's person (`person_id`) and the spouse person whose `realm.sid` is the union's - each `{ key, given,
  surname, gender, race, face, className, born, died, minor }`, every name through `checkName` as `houseOn` reads a
  house's. An ACCOUNT_VERSION bump (acct121 at the time of writing).
- THE CLIENT. `unionsHeard` records each child not in the record as `kind: 'union'` (`union: { sid, key }`, parents the
  member and the spouse), and updates the name, a death and the coming of age as heard; `readFamily` holds the shape,
  `samePerson` keys it by the sid and the key; `successors`, `waitingHouses`, `homeOf` and the switch already pass over
  anyone not of the blood.

## THE FOUR HOSTS (5)

The Legacy host is the world host's (`scenes/world.js` builds it; its slow tick runs in every mode, indoors and
underground). `scenes/worldModes.js` and `scenes/dungeonContext.js` carry no host of their own - they run under the
world host's. `scenes/exterior.js`, the fixed city, keeps DFU's death and has no Legacy host (Legacy-Arc section 3's
flag). The front door (`main.js`) boots only the world host.

## Pins (5)

- `test/fb1012b_familytree.test.js` (5): the report end to end through the producers (two players wed, two children on
  the elder's clock, the mantle passed, the second chosen online; the born page offers no Succession; a press all the
  same leaves the first child whole, one person carries the heir's character, the realm's boot plays the heir and every
  save after); a save never writes a fallen into an heir or a switch's target, and still writes the one played; the
  Online page's birth booted without the classic start and stood at its seat, run off main.js's front door and
  world.js's start; the seat moved to a farm's hovel the house holds, never to a farm it holds nothing on nor a dungeon
  under it, and a member never played born there; a member met at the hovel born there and their first day naming it.
- `tools/mutants/fb1012b_familytree.json` (9, all dead).

RACE-SECTION
