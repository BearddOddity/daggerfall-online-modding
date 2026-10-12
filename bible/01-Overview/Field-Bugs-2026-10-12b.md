# FIELD BUGS 2026-10-12b - the family tree's clone, where an heir is born, and the union's children

One thread from the Discord's bug-reports (2026-10-12, "Odd family tree behavior"), in two parts. Read on the code as it
stands at main's `a7e7ea64`. Two parts are fixed here; the third is the recorded law, and a plan for the owner.

> "A marriage between two Enduring bloodline characters resulted in some strange things happening with the family tree.
> Only one of us could actually see the heirs while the other didn't have any. The two heirs originally had two different
> names and classes, but once the mantle was passed on they suddenly both had the same name and class, although different
> birthdays. There was originally a nightblade and a battlemage, yet after choosing to play as the battlemage there is now
> essentially a clone of it with a different birthday. The nightblade is gone entirely."
>
> "the house (admittedly a tiny hovel on a farm) purchased and made the seat of the house by the parent character was not
> where the heir ended up spawning ... the game spat them out near Privateer's Hold instead of starting them at the
> family's seat."

| | Report | What it was | Done |
|---|---|---|---|
| 1 | the two heirs one name and class, two birthdays; the nightblade gone | online the page bearing the heir offered the waiting Succession again over the newborn; a press made the other child current, and the birth's first save wrote the newborn over them | fixed (HEIR-CLONE) |
| 2 | "Only one of us could actually see the heirs" | each house raises its own children of a two-player union - Legacy-Arc section 9's recorded departure (two records, two clocks, no shared child) | not changed - the owner's call; the plan below (UNION-CHILDREN) |
| 3 | the heir born "near Privateer's Hold", not at the farm's hovel made the seat | a seat moved only to a town, so a home on a farm was the line's home and never its seat, and heirs were born in the town first noted; and the Online page's birth booted the classic start, Privateer's Hold | fixed (SEAT-HOME, BIRTH-START) |

## HEIR-CLONE: the page bearing an heir offers no Succession, and a save writes only the one in the world (1)

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

## BIRTH-START: the Online page's birth starts in its seat (3)

`src/main.js` the front door's classic start; `src/systems/legacy/waitingHouses.js` takeUpLine; `src/scenes/world.js` the
start.

FOUND. HOUSE-WAITS (`Field-Bugs-2026-10-09f.md`) answers a waiting Succession from the Online page and boots the birth
with `legacyborn`, `region` and `loc` - the line's seat (`waitingHouses.js:"const place = family.seat?.region"`). The front door then set `classic` as for
every menu door (`main.js:"else params.set('classic', '1')"`), and the world host reads the classic start's cell before the place a boot names
(`world.js:"if (params.has('classic'))"`): the heir stood in Privateer's Hold, inside it with StartInDungeon. The world's own Succession was never
touched - its address drops `classic` (places.js birthSearch).

FIXED. A boot bearing a member leaves the classic start off (`main.js:"if (legacyBirth) params.delete"`), so it stands in the place its birth names.
Every other door begins where Daggerfall begins. Pinned off main.js's and world.js's own text.

## SEAT-HOME: the seat moves to a home of the house's own (3)

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

## UNION-CHILDREN: the children of two players' union, on both trees (2) - NOT CHANGED, a plan

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

## THE FOUR HOSTS

The Legacy host is the world host's (`scenes/world.js` builds it; its slow tick runs in every mode, indoors and
underground). `scenes/worldModes.js` and `scenes/dungeonContext.js` carry no host of their own - they run under the
world host's. `scenes/exterior.js`, the fixed city, keeps DFU's death and has no Legacy host (Legacy-Arc section 3's
flag). The front door (`main.js`) boots only the world host.

## Pins

- `test/fb1012b_familytree.test.js` (5): the report end to end through the producers (two players wed, two children on
  the elder's clock, the mantle passed, the second chosen online; the born page offers no Succession; a press all the
  same leaves the first child whole, one person carries the heir's character, the realm's boot plays the heir and every
  save after); a save never writes a fallen into an heir or a switch's target, and still writes the one played; the
  Online page's birth booted without the classic start and stood at its seat, run off main.js's front door and
  world.js's start; the seat moved to a farm's hovel the house holds, never to a farm it holds nothing on nor a dungeon
  under it, and a member never played born there; a member met at the hovel born there and their first day naming it.
- `tools/mutants/fb1012b_familytree.json` (9, all dead).
