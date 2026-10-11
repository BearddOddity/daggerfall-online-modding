# THE GUILDS MADE PLAIN - one word, one thing, every rule before the press (GUILD3, 2026-10-11)

The port's own. Both guild systems online - a player's guild (GUILD1, GUILD2: `06-Systems/Online-Arc.md`,
`Guild-Overhaul.md`; its seats, `Seats-Arc.md`) and Daggerfall's guilds held online (the Chapters, `Chapters-Arc.md`) -
read whole as a player meets them, and made easier to understand without taking a mechanic away that does its own job.
Offline is DFU 1:1 and untouched (Port-Doctrine; Chapters-Arc law 1).

## Asked

The owner: "I want to talk about simplifying the player guild and npc guild system from being too overcomplicated.
Keeping depth, but making it easier to understand." Then, of the four questions put back (who is getting lost; the
Chapters' cuts; the renames; a design record first): "These are all of your decisions. Be extremely thorough and do
your best work."

## 1. What a player meets today (FACT, 2026-10-11)

Three layers, each with its own room to move:

| Layer | Switch | Room |
|---|---|---|
| DFU's guilds - the four, the eight temples, the ten orders (`systems/guilds.js`, `guildVariants.js`, `guildServices.js`) | always | None: Port-Doctrine's 1:1 list. Nothing here touches them. |
| A player's guild and its seats (GUILD1, GUILD2, SEAT1-SEAT2, CROWN1-2, SEASON1) | `SEATS_OPEN = "on"`, `MARKS_OPEN = "on"` | Words and pages freely; a mechanic's change moves live rows and needs a migration. |
| The Chapters (CHAP1-CHAP7) | `CHAPTERS_OPEN = "dev"`, `CHAPTER_TITLES = "off"` (`server-account/wrangler.toml`) | Free: the developers' rows alone. |

Some seventy nouns stand between a new member and the whole of it - about forty-five of the player's guild and its seats,
twenty-five of the Chapters. The depth is not what makes it hard. Four things are:

1. **One word, several things.** "Seat" is a town's Charter and a chapter's rank 8 or 9. "Officer" is a player guild's
   rank 1 and a chapter's rank 8. "Hall" is a guild's hall, a chapter's hall, a palace's Charter Room and the "hall
   writ" on a board. A chapter's writ, a member's own writ and a receipt's ask are three cards on one board, two of them
   called "Hall writ". "Marks" still stood in three of the sentences that say silver everywhere else
   (`siegeLink.js` `siegeHonourLine`'s "Your Honour: 50 Marks", the registry's struck seat in `townSeatLaw.js`
   `chronicleLine`, the day's reset in `systems/eventTimers.js`).
2. **Two mechanics doing one job.** Two of the Chapters' seven Season events repeat a band: a **Decline** (Strength
   falls 2 more a week) is what **Failing** already says, and an **Ascendancy** (a tenth off, "High" on the Master's
   title) is what **Ascendant** should say - and did not, Ascendant's prices standing exactly at Thriving's (`CHAPTER_BANDS`:
   0.9 both). A player reading "Ascendant" on the board and "the chapter is ascendant this Season" under it was reading
   two systems for one idea.
3. **A rule the screen never says.** A guildmaster pressing Disband is told ONE reason (`whyNotGone`: the first of
   a dozen, in its order), clears it, presses again, and is told the next - the Settings page itself names three. The
   silver treasury's ledger words every line it does not know as a deposit (`GUILD_MARKS_LINE_KIND ?? 'deposit'`): a
   Tribute, an upkeep, a claim fee, a writ's escrow and a patron's bid - each silver LEAVING the treasury - read "Alda put
   in 1,000 silver". What each rank may do is four tables in four modules (`GUILD_POWERS`, `HALL_POWERS`,
   `WRIT_POWERS`, `SEAT_POWERS` and `SEAT_LEVER_RANKS`) and no page says any of them; a Member and a Recruit hold the
   same powers and nothing says so. Only the gold realm characters put in buys a hall or a new name (`realm_gold`), and
   the Treasury page - where the gold is - never says it (the Overview says it only to a guild with no hall).
4. **The board's Work tab is a wall.** Every chapter's Strength, Focus, Season, backing and patron stood as loose lines
   above the cards, every member's Merit line above those, with nothing saying which chapter a line belonged to past
   its own sentence - and nothing at all saying what a band DOES to a hall.

What is already plain, and stays as it is: the board's Seat tab (BOARD-UI, 2026-10-06: panels by name, the week on a
strip, "How the seat war works" folded under its line, the holder's orders shown to the holder's Officers alone) - the
progressive disclosure this arc would have asked for is already there.

## 2. The laws this arc keeps

1. **CUT A DUPLICATE, NEVER DEPTH.** A mechanic goes only where another already does its job; what it said that the
   other did not moves to the other (an Ascendancy's tenth off and its High Master go to the Ascendant band; a Decline's
   line in the town's talk goes to Failing's).
2. **ONE WORD, ONE THING - IN WHAT A PLAYER READS.** The words change; the ids on the wire and in the tables do not
   (`seat`, `chapterofficer`, `npc_chapter_seats` stand). A rename that moved a wire id would be a relay bump for a
   word.
3. **EVERY RULE A REFUSAL ENFORCES IS SAID BEFORE THE PRESS** - and where the client cannot know it, the refusal says
   EVERYTHING that stands, never the first thing.
4. **A LEVER SHOWS WHERE IT CAN BE PULLED.** Already the Seat tab's law (BOARD-UI); the Guild tab's rank table says the
   rest.
5. **OFFLINE IS DFU; LIVE ROWS DO NOT MOVE.** No live table changes shape. The one answer that grows (the silver
   ledger's lines) keeps every field it had, so a client from before reads it as before.

## 3. The four calls, decided (the owner: "These are all of your decisions")

| The question | Decided | Why |
|---|---|---|
| Who is getting lost - a new member, or a guildmaster running it? | **Both, by disclosure.** Nothing a guildmaster uses is cut; what a member does not need is folded or said once, where it is used. | The depth is the guildmasters'; the confusion is everyone's. |
| The Chapters' cuts | **Seven Season events to five** (Calm, Schism, Succession, Crackdown, Rivalry); **three writ cards to two** (a chapter writ and your chapter writ; the receipts' asks become the chapter's Duties line). | Decline and Ascendancy repeat Failing and Ascendant (law 1). NARROWED from the four first put to the owner: Schism and Succession were to merge into one "Contest" - read whole, they are the owner's own "schisms, ... new guildmasters" (Chapters-Arc, his words), share their backing already (`chapterBackOk`), and differ in what they decide (a doctrine; the hall's head) - both stay. |
| The renames | **Silver everywhere a player reads**; a chapter's ranks 8 and 9 are its **Master's chair** and three **council chairs**, its rank 8 a **Councillor**; a chapter's writ a **chapter writ**. | NARROWED from "offices" first put: "an officer's office" reads as nothing, and "officer" stays the player guild's rank 1 alone. "The Roll", first put to go, STAYS - the one place a player reads it is the hall's book naming the chapter's Master and council, which is what a roll is; the service's reputation track was never shown by that name. |
| A design record first | **Yes** - this page, then the slices. | The arcs' own way (Seats-Arc: "Make sure we're documenting everything before building"). |

Considered and NOT done, each with its reason:

- **Merit and seat Influence as one currency.** Both are witnessed work, capped, settled at the Turning - but Merit is a
  character's at a chapter and Influence a guild's at a town, and a member does both at once (a gate is 300 Influence
  and 50 Merit). One currency would make one act pay twice from one pool, or once to one of them. Kept two; each is now
  said where it is earned.
- **Standing and Strength as one "Favour" meter.** Their lines differ (Standing: Unrest under 20, Loved at 80; Strength:
  Failing under 20, Thriving at 70, Ascendant at 90) and Standing is live. One word over two scales would be a third
  thing to learn.
- **The vault and the guild Stores as one store.** Items and materials obey different laws (a slot a piece and a
  grant per member; a count a material and "your own deposit back"), on two live tables. They stay two pages; the
  chests already open the vault with the Stores a page beside it (section 4, GUILD3a).
- **The four power tables merged in code.** Each lives beside the law that asks it (`guildMay`, `hallMay`, `writMay`,
  `seatMay`) and the service reads them there; merging moves four modules' imports for no player's gain. A composed
  view says them instead (GUILD3c), and a sweep fails the suite on a power with no words.
- **A price's reasons in a hall's own window.** The training and spell windows are DFU's native windows (Home.md, THE
  NATIVE-WINDOW RULE): no element without its DFU source. The board's chapter card says what the band does instead
  (GUILD3d).
- **`SEAT_WEEK_ZERO_S` (writLaw) and `SEAT_WEEK0_MS` (townSeatLaw) as one export.** One instant, twice - but already
  pinned equal (`test/audit31_law.test.js`), and importing townSeatLaw into writLaw would carry the seats' graph into
  every writ reader. Left, pinned.

## 4. The words - one word, one thing

| A player reads | It means only | It used to mean too |
|---|---|---|
| **silver** | the online currency (code: `marks`, `MARKS_*`) | "Marks" in three sentences; "Drakes" in older records |
| **seat** | a town's Charter - a palace or a crown (Seats-Arc) | a chapter's rank 8 or 9 |
| **the Master's chair**, **a council chair** | a chapter's rank 9 and rank 8 (code: `seat`, `master`, `officer`) | "the Master's seat", "an officer's seat" |
| **Councillor** | a chapter's rank-8 title ("Councillor of the Fighters Guild, Anticlere"; the token id stays `chapterofficer`) | "Officer of the ...", beside the player guild's Officer |
| **Officer** | a player guild's rank 1 | a chapter's rank 8 |
| **chapter writ** | a chapter's shared delivery writ (code: kind `hall`) | "Hall writ" |
| **your chapter writ** | a member's own writ for its chapter, which earns Merit (kind `member`) | "Your writ" |
| **Duties** | what a chapter asks of its members in its region - a gate held, a raid defended - and what each earns them (code: the receipts' asks and credits) | a "Hall writ" card with no Take; "Honours" stays the sieges' alone (Seats-Arc 6.8) |
| **hall** | a guild's hall - a player guild's (GUILD1d), or one of Daggerfall's guilds' halls | the board's "Hall writ" |

## 5. The slices

### GUILD3a - the words

- The chapter's chairs: every sentence a player reads of a chapter's rank 8 or 9 (`npcChapterLaw.js` `seatLineOf`,
  `bookCappedLine`, `chapterChronicleLine`, `chapterSeasonLine`'s 'season' row, `chapterRollLines`,
  `CHAPTER_TITLE_WORDS`; `ui/playerBadge.js` `TITLE_TEXT`'s two fallbacks).
- The writ cards (`ui/noticeWindow.js` `writNode`): "Chapter writ", "Your chapter writ".
- Silver: the three sentences that still said Marks, through `marksText`.
- The record: Seats-Arc 7.2 and 8.2 said the hall's cupboards and the throne room's chest are the guild Stores; since
  GUILD2b every one opens the guild's VAULT, the Stores a page beside it (`scenes/world.js` `openStores`). Said there.

### GUILD3b - the ledger says which way

- The service's silver lines (`server-account/src/guilds.js` `viewOf`) carry, beside the `kind` they always carried,
  the ledger's own kind (`raw`) and its direction (`out`: the line left the guild's treasury). A client from before
  reads `kind` as it did.
- The tab words a line by its own kind where it has words for it (`GUILD_SILVER_LINE_WORDS`: a Tribute, an upkeep, a
  claim fee, an Edict, a fort's work, a writ's or contract's or bounty's or Sellsword's or Royal Tourney's or patron's
  escrow and its return, a Tithe and a Conscription come in, a patron's bid), and by its direction where it has none
  ("paid", "received") - never "put in" for silver that left. A sweep pins the words against the guild-touching kinds
  of `marksLaw.js` `MARKS_KINDS`.

### GUILD3c - every rule before the press

- **What stands in the way of going.** The service reads everything that holds a guild in ONE statement
  (`guildHolds`: gold, the guild Stores, a standing writ or contract or its pay still on its way home, the hall, the
  vault, a Charter, a battle, a patron's bid - `guildKeepsSql`'s own reads, each on its guild's index), and the
  guildmaster's view carries it (`keeps`), so the Settings page says it under "Before the guild can go" BEFORE any press,
  each in the refusal's own sentence, and Disband - and a lone guildmaster's Leave - wait on it, saying why ("what is
  listed above first"). A refusal names the whole list too (`keeps` beside its `error`, the first as it always was): the
  hand-over a leave needs, the silver the guildmaster's balance has no room for, and every code to a page whose service
  is older than its view's list. A disbanding asks no hand-over (it takes the members with it - the Leave button says
  its own). First built from the refusal alone; the photographs showed a guild whose gold held the button never learned
  the rest without clearing the gold first, so the view carries it now. The refusal's reads went from up to twelve
  statements to two.
- **What each rank may do.** `src/net/guildPowers.js` composes the four power tables and the vault's defaults into one
  list in words (`GUILD_RANK_ACTS`, `guildRankActsText`), each line's ranks read off its own table at the call - a
  table moved moves the page. The Members page folds it under "What each rank may do": each rank's acts, the
  guildmaster's grants of the vault named as what can change a member's. A sweep fails the suite on a power any of the
  four tables holds that the list does not word.
- **The treasury's two golds.** The Treasury page says, at its top, how much of the gold can buy a hall or a new name
  (`guildHallGoldText`, HALL-GOLD's sentence) - where the gold is, not only where a hall is bought.
- **A guild in one look.** With no guild, the tab says in three lines what one is for (a shared treasury of gold and
  silver, a vault, a hall and its arms; the towns of the Iliac Bay to hold) before the invitations and the founding.
  In one, the Overview says where the rest of it is run: seats, sieges and the Chronicle from a seat town's Notice Board
  (its Seat tab); guild writs and contracts from any board's Work tab.

### GUILD3d - the chapter card (the Chapters, 'dev')

- The Work tab draws each chapter of the region as one panel (`notice-chapter-card`), its guild's name and band its
  heading: the band's line and, new, **what the band does** (`chapterBandEffectsLine`: "Training and spells a tenth
  cheaper, a richer shelf, half again the writs."); the reader's Merit there; its Focus; its Season and the sides to
  back; its patron and the guildmaster's bid; and its **Duties** - a gate held and a raid defended, what each earns, and
  the reader's first of each today done or still to come (`chapterDutiesLine`). The receipts' asks leave the grid of
  cards: they had no Take, and a card that cannot be taken is no writ.
- A Merit line for a chapter the board draws no card for (a service from before) stands above them, as before.

### GUILD3e - five events (the Chapters, 'dev')

- `CHAPTER_EVENTS` holds Calm 30, Schism 15, Succession 10, Crackdown 10, Rivalry 15; `CHAPTER_EVENT_EFFECTS` loses the
  Decline's and the Ascendancy's numbers; `declineAfter` goes, and the service's Turning no longer asks it.
- **The Ascendant band is its own** (`CHAPTER_BANDS`): training, a spell bought and a spell made **a fifth off** (0.8 -
  the Ascendancy's further tenth over Thriving's, rounded to a fraction a player can hold), the shelf and the writs as
  Thriving's. Its Master is **High Master** while the chapter stands Ascendant (the service reads the Strength the sheet
  carries, `CHAPTER_ASCENDANT_FROM`, where it read the Season's event), and High Master stays a title only
  `CHAPTER_TITLES` can sign.
- **A patron's members pay the better** of the chapter's band and Thriving's (`chapterHallFactor`): an Ascendant
  chapter's patron is never charged more than a stranger.
- **What was said of them goes to the band.** The town's talk of a Decline joins Failing's lines, of an Ascendancy
  Ascendant's (`systems/livingWorld/lines.js` `CHAPTER_NEWS`).
- **A Season already drawn.** The developers' rows may hold a Decline or an Ascendancy for the Season under way: read
  back, an event the law no longer names is none (`heldEvent`'s `chapterEventOk`), so the chapter's Season is Calm from
  the next read and its Turning moves its Strength by the week alone. The Chronicle keeps its words for both
  ("At the end of the Season of Morning Star, the Fighters Guild stood ascendant.") - a row written is history.

## 6. The threats, and the answers

| Threat | Answer |
|---|---|
| A word changed on the wire breaks an older relay or client | No id moves (law 2): the token's titles, the tables' kinds, the writs' kinds stand; only sentences change |
| A ledger line an older client reads wrong | `kind` stands as it was; `raw` and `out` are new fields an older client never reads |
| A refusal's list read as a law by a client | `keeps` is words for a page; the service's batch still refuses on its own reads (`guildKeepsSql`) |
| The guildmaster's view one read heavier | One statement, the guildmaster's alone, each EXISTS on an index `guildKeepsSql` already reads at every delete |
| A cut that takes depth | Each cut is a duplicate (law 1), and the record names where what it said went |
| A developers' Season under way with a retired event | Read as none, its Strength the week's alone; its Chronicle row, if one was written, keeps its words |
| An Ascendant chapter's patron paying more than a stranger | The better of the two (`chapterHallFactor`) |
| A new power added to a table with no words | The sweep (`test/guild3_plain.test.js`) fails the suite |

## 7. The four hosts (THE FOUR HOSTS RULE)

| Host | GUILD3 |
|---|---|
| `scenes/world.js` | nothing new to wire: the Guild tab (`ui/socialPanel.js`) and the board (`ui/noticeWindow.js`) it already opens carry every slice |
| `scenes/worldModes.js` | nothing new to wire: a hall's prices read `chapterHallFactor` as before (GUILD3e's patron rule inside it) |
| `scenes/exterior.js` | FLAGGED, nothing to wire: the single-location bench has no online guild, board or chapter |
| `scenes/dungeonContext.js` | FLAGGED, nothing to wire: the standalone dungeon has no guild tab and no board; a castle's throne room (CROWN-HALL) is the streaming host's dungeon mode (`worldModes.js` `openCrownPiece`), whose chest opens the vault as every hall's does |

## 8. Pins

`test/guild3_plain.test.js` (the words, the ledger's words and direction, the rank list and its sweep, the disband
list on the service through the real Worker and on the page, the treasury's line, the no-guild primer, the chapter card,
the five events, the Ascendant band and its High Master, the patron's price) and `tools/mutants/guild3.json`.

**The pins GUILD3 moved, each said where it stands** (`PIN MOVED: GUILD3...`): the chairs' and the council's words
(`chap4b`, `chap4c`, `chap4d`, `chap5a`, `chap6a`, `audit_chap4`); silver (`seat2a_siege_play`, `audit_seats_client`,
`audit_seats_service`, `cap_off`); the writ cards (`audit_chap2`, `chap3a`); the chapter card (`chap2b` - the asks are
Duties now, `chap3a`, `chap3b`); the five events (`chap6a` - the weights and the draw's goldens over five, a retired
Decline moving nothing, the Chronicle's reader over a Crackdown; `chap6c`; `chap6d`); the Ascendant band (`chap3b`,
`chap3c`, `chap7b`) and its High Master by the band through the real Worker (`chap6e`); the refusals' whole list
(`guild1`, `guild2_service`, `audit28_marks`, `auditrealm2_service`); the silver lines' site (`auditguild1d`).

**The mutant records**: thirty-three of the older records quoted text GUILD3 moved - thirty-two re-aimed BY CONTENT at
their law's new site (the receipt card's two at the Duties line, the board's at the card), and `AUDIT-CHAP5-D3-OWN`
kept by naming the band line's own read `sold`, so its site stays one; every one of them killed again. Twelve retired
with the law they tested - `CHAP6A-W-ASC-ASC`, `CHAP6A-W-FAILING`, the Decline's five (`CHAP6A-DECLINE-MEETS`,
`-TWICE`, `-FLOOR`, `CHAP6A-SVC-DECLINE`, `-FELL`), `CHAP6C-LINE-DECLINE`, `CHAP6C-LINE-ASCENDANCY`,
`CHAP6D-ASC-PRICE`, `CHAP6D-FACTOR-ASC` and `CHAP5A-LINE-PLURAL` (the council is one word for one or three).
`tools/mutants/guild3.json`: fifty-three records over every slice, every one killed. Their survivors on the way were each a pin the suite lacked or a line the code no longer needed: a refused press whose list the page never kept (pressed now), a battle's hold that no pin read (a Charter, a battle and a patron's bid through the real Worker now), and the buttons' own gold, hall and vault checks once the list held them (the buttons wait on the list alone; `GUILD1b-a-disband-with-gold-in-it` re-aimed at the list's gold line). Eight more older records moved with the code after the first pass - the version pins (`KNIGHT-HOUSE-version-unmoved`, `TECH1-AUDIT-the-service-behind-the-law`, `GATEKEYS-the-empty-var-back`), the two GUILD1b buttons, and the holds' one read (`AUDIT31-svc-escrow-word`, `AUDIT-CHAP5-E4-WORD`, `GUILD1-the-leaving-refusal-misnamed`) - each re-aimed by content and killed.

The service is `acct112`: its law moved (the ledger's lines, the refusal's list, the Turning without a Decline, the High
Master by the band). No migration, no relay change.
