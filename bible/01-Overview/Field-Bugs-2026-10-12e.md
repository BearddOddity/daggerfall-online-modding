# FIELD BUGS 2026-10-12e - the region that never came back

A player's bug report, "Overworld Persistence (OW6L / AUDIT OW5b D2) Causes Permanent Regional Depletion of Procedural &
Elite Dungeons", relayed by Mac with the Discord thread it came from. Read on the code as it stands at main's
`4f98083f`. Mac, on the three fixes proposed in chat: "Do all 3".

> I exhausted all of Southern Alik'r. ALL.
> What's wild is that it punishes people for walking across the map and just seeing a dungeon.
> If it says, YOU DISCOVERED AN ELITE DUNGEON! That shits on a 14 hour timer now. For EVERYONE

| | Report | What it was | Done |
|---|---|---|---|
| 1 | Walking past a spawned dungeon starts its death clock | `scenes/world.js` spawnedDungeonAt noted every spawn it stood: a pixel streaming in (three pixels either side of the player at the default terrain distance) started TTL1's seven days - fourteen real hours at the shared clock's 12x - entered or not | the long clock starts on entry (SPAWN-REBIRTH) |
| 2 | A dead spawn never comes back; a walked region stays empty for everyone | the roll is a pure hash of the pixel, so AUDIT OW5b D2 kept a dead spawn's row as a tombstone; the cell's ledger (`net/overworldLaw.js`) kept each row sixty real days | a dead spawn stands again 24 real hours after it died (SPAWN-REBIRTH) |
| 3 | A character's save keeps its tombstones forever; a veteran refuses a newer player's spawn | the save carried every row; the ledger's min-merge kept the earlier first sight, so a later life's row never replaced a life gone by | the save drops a life that is over, and the merge gives way to a later life (SPAWN-REBIRTH) |

## SPAWN-REBIRTH (1, 2, 3)

`src/world/spawnedDungeons.js` (`REBIRTH_TTL_DAYS`, `REBIRTH_TTL_MINUTES`, `spawnDeath`, `spawnReborn`, `spawnExpired`,
`createSpawnLedger`), `src/scenes/world.js` (`spawnedDungeonAt`, `_spawnSeen`, `overworldLedgerHeard`),
`src/net/overworldLaw.js` (`OW_GENERAL_TTL_MIN`, `OW_CLEARED_TTL_MIN`, `OW_REBIRTH_MIN`, `owRowUntil`, `owRowFits`,
`owFoldRows`, `owPrune`, `toWelcome`), `src/systems/save.js` (comments).

**Reproduced first.** main's own host run (test/spawneddungeons.test.js, AUDIT OW5b D2: spawnedDungeonAt lifted and run)
asserted the lockout as its law - the first build of a spawn's pixel wrote its ledger row and owed it to the cell, seven
game days on the pixel built empty, and thirty days on it was still empty with the row kept. Run against main's
modules: `owFoldRows` took a row whose first sight was fifty-nine real days old (the cell kept that spawn dead), and a
ledger holding a first sight on day 1 merged one from day 61 and kept day 1 (`merge` answered false). On this build the
relay drops that row and the ledger takes day 61.

**1. The long clock starts on entry.** spawnedDungeonAt stands a spawn and starts nothing. The one door that starts the
seven days is the dungeon's: `onDungeonSpawned` (dungeonContext.js tells the host when it builds a synthesized
dungeon - a walk-in, a Recall, a save loaded inside, a party member following), which was already wired to `_spawnSeen`.
A dungeon nobody went into stands however long the road beside it is walked. The ledger's `seen` is the first ENTRY
now; the wire's row keeps its shape (`[px, py, seen, cleared?]`), only what `seen` means moved.

**2. A dead spawn stands again.** A spawn dies on the earlier of its two clocks (`spawnDeath`: two days from its first
clear, seven from its first entry) and the same dungeon stands again REBIRTH_TTL_DAYS later - twelve game days,
twenty-four real hours on the online clock (`spawnReborn`). Dead means dead and not yet back: `spawnExpired` answers
false once the wait is over, so the build stands it again with no clock running until a player enters it. The same
template and the same elite roll: the roll is still a pure hash of the pixel, so every client and the relay agree on
what stands there without a word, and the map id, the room and the automap keep meaning one dungeon. The cell keeps
a row exactly until then (`owRowUntil`: its death plus OW_REBIRTH_MIN, the three numbers pinned equal to the ledger's
own) - the fold lets a life that is over go BEFORE it folds, so a later life's first entry is taken whole and is never
min-merged into the life before; a heard row whose life is over is dropped, never struck; the prune and the welcome
read the same end. A row is now kept at most nineteen game days (thirty-eight real hours), where it was kept sixty
real days.

**3. No ledger keeps a life that is over.** The client ledger reads a row whose spawn has stood again as no row: `note`
and `clear` start the new life's clocks over it, `has` (new - the first-entry door's "is this already known") asks for
the current life alone, `merge` takes a clock (the host passes `_spawnClock()`) and drops a heard row whose life is
over, and replaces a held one with a later life's - the report's veteran, who held day 1 and refused day 61. `toJSON`
leaves out every row whose life is over by the latest clock the ledger was asked at, so a save carries none; with no
clock ever asked (an offline session never reads these clocks) every row is kept as it was.

`test/spawneddungeons.test.js` (21; four new, the AUDIT OW5b D2 host run rewritten - streamed in, no clock; entered, the
seven days; past them, empty however it is asked; a minute short of the wait, empty; the wait over, the same dungeon,
no row saved; the next entry, the new life's clocks owed to the cell), `test/ow6_ledger.test.js` (19; the pins, the
fits, the prune and the welcome on the new end, one new law test - a later life taken whole, a minute before its end the
same life's - and the host's merge at its clock), `tools/mutants/spawnrebirth.json` (17, 17 dead), and the records of
`tools/mutants/ow6l.json` and `ow6h.json` this moved, re-aimed by content (83 dead across the four lists). PIN MOVED: `test/tv6_dungeons.test.js`'s
AUDIT OW4 D5 host run enters the spawn before its clock can run out.

**RELAY_VERSION world198.** The cell's keep is the relay's law, so this needs the relay's deploy, which drops every
connected player once. Until it lands the live relay keeps rows sixty days; a client of this build reads every row
whose life is over as none, so the spawns stand again for it all the same.

## For Mac

- **Entering still starts fourteen hours.** The report's own first proposal was to drop the long clock entirely (only
  a cleared spawn dies). That changes TTL1, the creator's rule ("after 7 ingame days in general when there is no
  player in it"), so it is not done: a player who walks in to look at the foes and leaves starts the seven days, and
  the spawn stands again a day after it dies. Dropping the long clock is one line in `spawnExpired` and one in
  `owRowUntil` if you want it.
- **Older clients until they reload.** A tab still running the build before this one notes every spawn it streams
  past and says the row to its cell; the cell min-merges it, so those spawns die fourteen hours after such a tab walked
  by, for everyone, until it reloads. They come back a day after, as any other.
- **The re-roll is not done.** In chat the fix was offered as "could give a different template and a different
  elite/normal result". It stands the same dungeon again: a new template per life needs every client and the relay
  to agree on a life counter per pixel, which the keep above lets go of, and the map id, the dungeon's room and the
  automap all key on the one pixel.
