# FIELD BUGS 2026-10-12b - threads from the bug-reports channel

Discord threads from 2026-10-12, read on the code as it stands at main's `a7e7ea64`.

| | Report | What it was | Done |
|---|---|---|---|
| 1 | "Companion Inventory prioritized over looting, taking helm, and other context options" - "you need to get them to move before you can loot an item since it keeps opening their inventory instead. It would be fixed if we made them less a priority when clicking/selecting!" | a companion at the player's heel is a foe the one ray strikes like any other: nearer than the body, the pile, the boat's helm or the door behind him, he was the hit, and his hit opens his pack | fixed (ALLY-YIELDS) |

## ALLY-YIELDS: a companion yields the press to what answers behind him (1)

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
