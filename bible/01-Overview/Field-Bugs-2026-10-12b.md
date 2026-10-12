# FIELD BUGS 2026-10-12b

Read on the code as it stands at main's `a7e7ea64`.

| | Report | What it was | Done |
|---|---|---|---|
| ALLY-RACE | "companions when morrowind attached switches character race" | a companion's Morrowind body drew its race, face, head, hair and clothes off the STAND - its species, its pool number and where it stood - and the companion layer stands a new body at every door, dungeon, fast travel, load and sweep; a revenant drew its own afresh at every return, so the one that knelt rose from its portal another race | fixed (ALLY-RACE) |

## ALLY-RACE: a companion is one person (the owner, 2026-10-12)

`src/characters/foeBodies.js` ownPerson, foeSeed; `src/scenes/crewAshore.js` companionPerson, the stand's
`rec.person`; `src/systems/revenant.js` revenantPerson, revenantStamp, revenantDeed's new record, sanitize;
`src/systems/revenantCompanions.js` memberOf.

FOUND. Every body of a person the foe lanes stand - a foe, the watch, a companion - takes its look from
`foeLook`, whose race and face are `bayPerson(foeSeed(f))` and whose head, hair and under-clothes are walked off the same
seed (MWNPC5b, MWNPC17). `foeSeed` is the STAND's: the species and the layout marker, else the pool's number and the feet
where the body first stood (AUDIT MW-NPC II K3/K4). That is right for a foe of the place - one man for its life, the same
on every machine - and wrong for a companion. Neither party record carries a race (the crew's `{ boat, name, role, mobile,
gender }`, a sworn revenant's record), and the companion layer (`crewAshore.js`) stands a fresh body in every place
(`place.spawn` - the street's pool, a building's, a dungeon's loose stand): a new number and new feet, so a new person of
the Bay's. Reproduced through the real producers (a real party, the real layer, real `createExteriorFoes` pools, each
door a new pool): a female Warrior hand stood through eight doors was drawn Nord, Breton, Breton, Breton, Breton, Wood
Elf, Breton, Breton, her face five different ones, and again after a load. A revenant was the same twice over: each
return (`revenantSpawnOptions` through `applyRevenant`) was a new stand, so it came back Wood Elf, Argonian, Breton,
Nord; and the sworn one is stood by the same layer, so the revenant that knelt (one race) rose from its portal beside
its own kneeling body as another. Sex was never affected: every stand passes the record's (`gender: c.gender`,
MobileUnit.resolveGender keeps a given one), pinned below.

FIXED. A person whose person is their own is drawn as it, wherever a body stands for them. `foeSeed` asks `ownPerson`
first (after the owner's wire seed, which a copy keeps): the layer's stamp on the record (`person`), else a revenant's on
its entity's stamp. The companion layer is the one seam that stands every companion body, and it stamps it as it names
it (`rec.person = companionPerson(c)`): a member's own where the party keeps one, else a hash of the party key - his boat
and his name, his for life. A revenant's record carries `person`, minted ONCE at its birth off the body that did the
deed (`foeSeed(rec)` - the man the player saw, so nothing changes before the player's eyes as a felling foe becomes a
revenant), kept through the save (`sanitize`; an older record's is its id's, the same at every load), on every stand's
stamp (`revenantStamp` - its returns, a lair stand, a betrayal) and on the sworn member (`memberOf`), so the one that
fled or felled is the one that kneels and the one that follows. The seed is what rides the wire as `ls`, so every
machine in the room draws the same person (the street's frame, the dungeon's `r.ls = foeSeed(f)`).

THE FOUR HOSTS (rule 17e). scenes/world.js WIRED: its `companionPlace` stands the street's companions through the layer
into its pool, and the street's revenants take their stamp through the pool's `applyRevenant`. scenes/worldModes.js
WIRED: a building's companions are the layer's too (its `interiorPool`, the one factory, handed to world.js's place),
and its revenants the pool's. scenes/dungeonContext.js WIRED: the layer's dungeon arm stands a companion through
`spawnLooseFoe`, both builds stamp a revenant (`applyRevenant`), and its stream carries `foeSeed`. scenes/exterior.js
FLAGGED by name: the bench stands no companion (no layer), and its revenant returns take their stamp through its pool as
the others'. Every host's foe lane reads the person through `foeActor`; nothing is host-side.

NOT HERE. A hand on his ship's deck is the deck lane's draw (MWNPC10b: her seed and his roster place, so her owner and
every reader stand one crew - `navalCrew.js` drawBodies), not his own person: a hand taken ashore is drawn as himself
from then on, and the deck does not know his name. The boarding's men over the rail are the ship's, not companions.

PROVEN. test/fb1012b_allyrace.test.js (3): the crew's hand through eight doors and a load one person - race, sex, face,
head and clothes - where the stand's own law drew her as more than one race on the same stands, two hands two people,
and a second pool fed my frame draws her as I do; a revenant born off a real pool's body keeps that body's person, its
three returns and a dungeon-shaped record are it, sworn and stood by the layer through four doors it is the one that
knelt, the save keeps it and an older record's is its id's at every load; the one seam (the layer the only writer of a
person, by a sweep of the hosts) and the four hosts by source. `tools/mutants/fb1012b_allyrace.json`: 12 mutants, 12
dead. One RVN5 record re-aimed by content (RVN5-stand-unstamped: the stamp's line carries the person now); no pin moved.
