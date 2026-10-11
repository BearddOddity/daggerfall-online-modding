# Elite Gates - the Elite Breach and the Battlespire's torn halls (EG)

> Design page, written 2026-10-11 before the arc's first slice, and revised the same day by AUDIT EG0. That audit was
> five cold lanes on the frozen first draft (177a3acd6), 105 findings, each with its verdict, then a sixth lane on
> the revision itself (28 more), all recorded in `01-Overview/Audit-EG0.md`. The code's comments will cite this page by section number; where the page and a pin
> disagree, the pin is what runs. Each slice adds its record under section 29.

## What Mac asked for

Mac, 2026-10-11: *"I want to talk about expanding the oblivion gates idea into a procedural endless experience, where you
fight bosses, relentless adds, traverse platforming sections and see how far you can delve with one life on the line.
This would be of elite tier, but like how dungeons recieve 3 tiers. Normal, Elite, and Abyss"*. Then, asked five
questions (the tier reading, the party size, what a death costs, run-only powers, how a run is entered):

1. *"Its basically timed like oblivion gates, but its considered a step above as an elite gate, more challenging and a
   different experience"*
2. *"Party of 8"*
3. *"Checkpoints"*
4. *"Your decision"*
5. *"Yes, a key item you can obtain from regular oblivion gates, a super rare drop from dungeons based on dungeon tier"*

And: *"I want you to make any and all decisions and make this the best content that it can be. Utilize all available
resources, be extremely detailed and dont half ass the work"*. Then, of the first draft: *"Do a comprehensive audit and
ensure this is the best and most detailed it can be"*.

So, as decided here (each decision is argued in its section):

- **The gate gets the dungeons' three tiers.** Dagon's Breach (`World-Bosses.md`) is the gate's Regular tier. This arc
  builds the **Elite Breach**, the tier above it. The Abyss tier is named and reserved (section 2).
- **Where it leads.** Canon: the Battlespire was taken by Dagon's legions in 3E 398, then partly destroyed, and the
  Empire sealed its gates with every link to Oblivion broken. **The port's invention**, marked as such: the halls that
  tore away when those links broke fell back along the road the legions came, and the Kyn still hold them as a proving
  ground (section 3).
- **The key: the Weir Key.** In canon, the Imperial Secretary surrendered the Spire's portal keys to the invaders. The
  Kyn carry them still; Dagon's covens hoard them.
  - It is ACCOUNT-HELD: the account service keeps the balance, and the item is its face.
  - The service rolls every drop. It drops from Dagon's Breach, from the Abyss Dungeon's Remnant, and very rarely
    from elite foes in dungeons, by tier (section 5).
- **Timed like a gate.** The arch rises at the opener's feet, sealed for one game hour, then opens for one game hour
  at most. The company answers THE CALL from anywhere outdoors.
  - **The count** starts when the first hall wakes: 30 minutes, +15 for each Redoubt taken, never more than 30 in
    hand.
  - **The last word** ends every breach three hours after the opening (section 6).
- **A company of eight.** The opener's party when the open reaches the hub, frozen, up to `PARTY_MAX` (8). Only the
  opener spends a key (section 6).
- **Endless, procedural, one hall at a time.**
  - A run is HALLS, five to a circle. Each circle ends in a **Court**, whose fall takes a **Redoubt**.
  - Each hall is generated from the breach's seed: a made level like the Burning Court and the Shattered Hour,
    entered under the gate's veil.
  - Halls follow a fixed rhythm: fight, traverse, mixed, fight, Court (sections 7-9).
- **Fragments** (sections 10.1-10.8): modeled areas a course passes through. Oblivion Caverns and their kin stand in
  every band; every platform is a modeled object; a fork offers a High Road over the void and a Low Road through the
  caverns beneath; the Deepway is a hall of fragments; and the lords fight on modeled ground.
- **Six kinds of hall and a Court** (section 8): the Rift-Yard (relentless waves out of Wellhead rifts), the Span
  (generated platforming), the Rampart (a walkway under fire), the Athenaeum (a seeded Orrery under pressure), the
  Proving Walk (span, champion, span) and the Deepway (a hall of fragments). Seeded **twists** turn about one hall in four from circle 3.
- **Four bands deep**, retracing the legions' march of 3E 398 in reverse: the Broken Galleries, the Soul Cairn, the
  Shade Perilous, and the Havoc Wellhead, which never ends (section 7).
- **Relentless adds the relay runs.** Nine kinds, three of them the Legion-Lord's, in one wave runner widened from the
  gate's (section 11).
- **Thirteen lords.**
  - Nine Court lords: three in the Galleries, two in each band below.
  - Four Valkynaz, warrior dukes of Dagon's council, one at every fifth Redoubt.
  - Every one is its own brain on ONE relay boss seam.
  - Every errand scales from one member to eight (section 12).
- **Two floors keep every blow fair**:
  - the wind-up floor (a shape you can always run out of);
  - the union floor (never a trap of several shapes at once).
  - **Nothing gets faster with depth** (Mac, WBX: *"I dont think making mechanics faster is the play"*).
  - Depth adds decrees, kinds, pieces and waves. It never shortens a wind-up, a beat or a crumble (sections 12, 16).
- **Decrees, Vestiges, Redoubts.**
  - **Decrees**: Dagon's decrees on the next circle, one per family, up to four (section 13).
  - **Vestiges**: run-only powers, three offered at every Redoubt and one taken. My decision on question 4. They are
    capped and never stack eightfold, and death saves recover only at a Redoubt (section 14).
  - **Redoubts**: the checkpoints, read through Mac's answer to *what a death costs*: *"Checkpoints"*.
    - One life a member.
    - A fall is recalled ONCE, at the next Redoubt the living take. A second fall is final.
    - The fallen witness the run.
    - **Reliquaries**, sealed at every Redoubt and opened only by walking home, are what a company risks by going on
      (section 15).
- **The wall is the count and the last word, not a multiplier.** A model of the pace says where companies stop
  (section 16).
- **The chance, not the promise.**
  - Spoils and Marks at every Redoubt, paid once a week for each Redoubt; Deadlands Embers at the Valkynaz Redoubts
    and for new depth.
  - THE BATTLEMAGE'S PANOPLY (nine Aetheric pieces, with a pity count).
  - Each lord's tavern card.
  - Titles and auras by depth.
  - Two season boards and an all-time one.
  - No Gilded piece: the Hourlock stays the one (section 17).

Daggerfall has no Elite Breach, no torn halls and no other players, so none of this is a DFU member. Its Ledger A row,
ELITE-GATES, is opened by the first file that cites it, since `test/doctrine.test.js` fails a cite with no row (SD2a's
record). It lists the Spire's departures from DFU: Resurrect refused, Levitate and Slowfall banned, and no
DEATH-PENALTY inside.

## 1. The shape, end to end

```
 a WEIR KEY (account-held) ─► used outdoors, online ─► /v1/eg/open: one staked, an OPEN ORDER signed
   │
   ▼
 the HUB: verifies the order ─► freezes the COMPANY from its party record (≤ 8) ─► EG_INTERNAL_OPEN to `eg:<b>`
   │ the ARCH rises at the opener's feet: sealed 1 game hour (5 real min)
   │ OPEN ≤ 1 game hour: the opener steps through the arch; the company answers THE CALL from anywhere outdoors
   │ each member: /v1/eg/admit ─► an ADMIT ORDER ─► the room spends it ─► through the veil
   ▼
 the first hall WAKES (the count starts) ─► the arch sinks behind the company
   │
   │  each hall: ARRIVAL ─► GATHER 8 s ─► the TRIAL ─► the DOOR ─► the DESCENT (20-45 s) ─► the PULL ─► the stair
   │  the rhythm:  fight · traverse (a Span through fragments, or the Deepway) · mixed · fight · the COURT
   ▼
 the COURT's lord falls ─► a REDOUBT taken
   ├─ an `e1` RECEIPT to every living EARNER: the depth, the week's spoils thrown, Marks, embers for new depth
   ├─ a sealed RELIQUARY to each earner (opened only by the way home)
   ├─ the COUNT +15 min (30 in hand at most); the REST holds the count
   ├─ three VESTIGES offered, one taken; the next circle's DECREES shown
   ├─ the FALLEN recalled (once each)
   └─ the WAY HOME (leave, keeping all, the Reliquaries opened)
   ▼
 ... Hall 25: a VALKYNAZ ─► ... the Havoc Wellhead, without end
   │
   ▼
 the END: every member out (fallen twice, forsaken, gone home), the COUNT spent (the tear), or the LAST WORD
   ─► each entrant's end receipt ─► the room keeps its tombstone
```

## 2. The tiers of the gate - Regular, Elite, Abyss

The dungeons have three tiers and one law that names them: `dungeonTier` in `src/systems/dungeonTier.js`, with the
words *Regular Dungeon*, *Elite Dungeon* and *Abyss Dungeon* (ABYSS-NAME). Mac said *"Normal"*; the player reads
*Regular*, the word the game already shows (`DUNGEON_TIER_TEXT`). The gate gets the same shape: one leaf law,
`systems/gateTier.js` (EG1), with `gateTier(x)`:

| tier | code | the event | what it is | built |
|---|---|---|---|---|
| Regular | `'regular'` | **Dagon's Breach** | the world boss on the shared clock: one a game day, everyone, the Warden | shipped (WB) |
| Elite | `'elite'` | **Elite Breach** | a key's breach for one company: the torn halls, endless, one life and its one recall | this arc |
| Abyss | `'super'` | **Abyss Breach** | reserved; the code keeps `super` for the Abyss tier, as the dungeons do | NOT this arc |

`GATE_TIER_TEXT` holds the words. The Regular tier's word is its own name, because the event already has one. Shown:

- **the arch's plaque** (World Tooltips): *Elite Breach*, sub *The Battlespire*; to anyone outside the company, a
  second sub *<opener>'s company*;
- **the sight line**: *You see an Elite Breach 140 metres to the North!* (the Elite dungeon's line, its law);
- **the Timers row** (`eventTimerRows` in `src/systems/eventTimers.js`, a new kind `'elite'` beside `'gate'` and
  `'super'`, the company's alone): *Elite Breach opens 4:12*, then *Hall 17 - the count 24:10*;
- **the held map**: the arch's mark for the company while it stands (it is not a place in MAPS.BSA);
- **on entering a hall**: one line, *Hall 12 - the Broken Galleries*, and *Hall 15 - the Court* at a Court.

**Why the Abyss tier is not built here.** The Abyss Dungeon's Rift is already the otherworldly door at the top of the
content: one Hollow at a time, for the whole world. An Abyss Breach would be the pinnacle of the gate's own ladder, a
world-scale event and not a company's. It is named so it is not mistaken for missing. The tier law answers `'super'`
for nothing until it is built.

## 3. The lore - canon, and what the port adds

The gate's own lore law (`World-Bosses.md` section 19) is binding. The Covenant of Akatosh bars every Prince from
forcing a door into Tamriel; it never barred a door opened from within, and it fights every breach. The port's shipped
book on the breaches (`src/systems/portBooks.js`) is canon for this game. Three of its lines bind this page:

- *"No Prince walks through such a wound himself. He sends a lord of his house... a Dremora of the rank they call
  valkynaz."*
- *"Should the Warden fall... the breach fails at once. It is his will that holds the door."*
- Of the Battlespire: *"his legions took the Battlespire itself... and held it until a single apprentice drove them
  out."*

**Canon** (UESP: Lore:Battlespire, Lore:Weir Gate, Lore:Kyn, Lore:Soul Cairn, Lore:Shade Perilous, Lore:Havoc Wellhead,
Lore:Imago Storm):

- The Battlespire was the war academy of the Imperial Battlemages and a testing ground for the Imperial Guard: a
  void-castle in a slipstream realm, with a council whose masters bore titles such as Armsmaster and Spellmaster.
- The Impostor, Jagar Tharn, gave it to Mehrunes Dagon. In 3E 398 Dagon's legions, led by Imago Storm of Clan Dremora,
  mustered in the **Havoc Wellhead** (whose arena hosted honourable fights between clans), rampaged through the
  **Shade Perilous** (a pocket realm of Nocturnal's Evergloam) and the **Soul Cairn** (the Ideal Masters' realm of
  the dead), and took the Spire, killing nearly every Battlemage.
- The Imperial Secretary surrendered the Spire's **portal keys**, and the invaders sealed its **Weir Gate** against
  the Legion with Dagon's own sigil.
- An apprentice drove them out. The Spire was partly destroyed; the Empire reclaimed the ruins and sealed its gates,
  every link to Oblivion broken. Imago Storm later turned on his Prince.
- The Dremora, the Kyn, keep eight major ranks: Varlet, Churl, Caitiff, Kynval, Kynreeve (a clan's officer or
  sheriff), Kynmarcher (the officer of a citadel or outpost, the lowest called lord), Markynaz (a grand duke) and
  Valkynaz (a warrior duke of his Prince's council). Valkynaz Ruhn, the Warden, is one.
- Dagon gave the Dark Seducers their bat wings. The Fire and Frost Daedra are clans of their own, and rivals.

**The port's invention** (said so, everywhere it is said):

- **The torn halls.** When the Spire's links to Oblivion broke, the halls that hung on them tore away. They fell back
  along the road the legions came: the Soul Cairn, then the Shade Perilous, then the Havoc Wellhead itself. The
  Imperial ruin stays sealed. The Elite Breach goes to what tore away, and to descend it is to walk the invasion of
  3E 398 backwards (the bands, section 7). They did not fall as stepping stones: whole caverns of the Deadlands,
  collapsed wings of the academy and the vaults of the dead came with them, and a course passes through them (the
  fragments, section 10.1).
- **The Kyn hold them as a proving ground**, as the Wellhead's own arena was one. The Spire was a proving ground for
  the Battlemages too. A Dremora rises in rank by holding a Court there, so the deeper halls are held by higher ranks:
  Kynreeves, then Kynmarchers, then Markynaz, and a Valkynaz at every fifth Redoubt. These are the Kyn who stayed
  Dagon's when Imago Storm did not.
- **The Weir Keys.** The portal keys the Secretary surrendered still open the Weir Gate's road from this side. That
  road no longer reaches the sealed Spire; it reaches its torn halls. The Kyn carry the keys as trophies: Ruhn wears
  one, which is why his fall can drop one. Dagon's covens hoard others in the deep places, which is why the hardest
  dungeons give them up likeliest.
- **The door is the key's, not a lord's.** Dagon's Breach is held by the Warden's will, and fails when he falls. The
  Elite door is held by the key and by the Battlemages' old Redoubts, so felling a lord does not close it. Each Redoubt
  taken makes the door more the Battlemages' own, and the Covenant presses on it less: the count gains time. In the
  first circle no Redoubt is taken yet, and the count's thirty minutes are the key's own strength. When the count is
  spent, the Covenant tears the door shut. The last word is the most any key can hold against it.
- **The Vestiges** are what the Battlemages left in their Redoubts: a lesson that clings to whoever takes one, until
  the breach closes.
- **The raised masters.** Two of the Spire's council, fallen in 3E 398, are the Kyn's captives: the Last Spellmaster
  and the Last Armsmaster.

## 4. The words

Every term the page and the game use, what it means, and what it is NOT. The renames follow AUDIT EG0's word lane:
each new word was checked against `src/` and the player's existing vocabulary.

| word | means | is not | why this word |
|---|---|---|---|
| **Elite Breach** | the event: a key's breach | "Oblivion Gate" (retired by WB12) | the gate tier's word |
| **the gate**, **the arch** | the black-and-gold arch at the opener's feet | - | WB12 kept "the gate" for the arch |
| **the Battlespire**, **the Spire** | where the torn halls came from | the sealed Imperial ruin | canon place, invented fate |
| **Weir Key** | the key item, template 575, account-held | a sigil stone (retired by WB12) | canon's portal keys and the Weir Gate; "weir" is unused |
| **hall**; **Hall 12** | one floor; numbered when named | a guild hall | lowercase in prose |
| **circle** | five halls, the fifth a Court | - | - |
| **Court** | a circle's fifth hall, where its lord stands; capitalised | a court disc (lowercase) | the gate's own word |
| **lord** | a Court's boss | "Kyn" (only Dremora are Kyn) | AUDIT EG0 L5 |
| **Redoubt**; **Redoubt 5** | the checkpoint a Court's fall takes; its beacon is lit | a Ward-Bearer's ward | "Ward" had seven meanings on the first draft; "redoubt" is unused |
| **the count** | the breach's timer | the key balance, BOSS_BODY's census | - |
| **the last word** | the three-hour bound on any breach | - | - |
| **the balance** | how many Weir Keys an account holds | - | - |
| **a stake** | a key held against a breach until it settles | the count | CARDS6's stake orders |
| **decree** | a rule laid on the next circle (the code's *marks*) | a Sigil Set (Dagon's Brand) | "brand" collided three ways |
| **Vestige** | a run-only power | - | - |
| **Stone, Blade, Hunt, Arcana, Fellowship** | the Vestige families | the Sigil Sets' Bulwark, Brand, Shroud, Mantle | the first draft reused set names |
| **Reliquary** | a sealed spoils roll, opened only by the way home | - | - |
| **the descent** | the beat after a hall's door opens | the Town Seats' *Muster* | AUDIT EG0 L16 |
| **witness** | a fallen member who watches the run | - | - |
| **fragment** | a modeled area a course passes through: a **passage**, a **chamber** or a **shaft** (section 10.1) | a shader's fragment (the code says `egFrag`) | the halls fell in fragments |
| **fight floor** | a flat floor where blows may land | traversal ground | - |
| **the High Road**, **the Low Road** | a span's fork: over the void, or through the caverns beneath | - | - |
| **the Deepway** | a hall built of fragments end to end | - | "Underway" is ordinary game text |
| **the legion** | the adds | the Imperial Legion; the Fellowship family | lowercase |

Capitalisation: Court, Redoubt and the band names are capitalised; hall, circle, decree, the count and the legion are
not, except when numbered or named (*Hall 12*, *Redoubt 5*).

## 5. The Weir Key

**The item.** Template **575**, free today (the gate's 570-572 and the Ayleid stones' 573-574 come before it). It is a
row beside `PORTAL_STONE_TEMPLATES` in `src/systems/gateSpoils.js`:

- `{index:575, baseWeight:0.25, hitPoints:1000, basePrice, rarity:20, bound:true, stackable:true}`, in the miscellany
  group (`UselessItems2`), never a gem (PORTAL1's lesson: every Gems piece is a crystal a slot takes);
- its art: a key of black iron and gold, painted in code into the Spire's first pseudo-archive (section 23). EG2 ships
  it with that art, never a borrowed record, because Port-Doctrine allows no placeholder shipped silently;
- named in `BOUND_TEMPLATES` (`src/net/realmTradeLaw.js`), so the realm's trade refuses it as the client does;
- its line: *One of the Spire's portal keys, surrendered to the Kyn in 3E 398. It opens the Weir Gate's road from
  this side.*

**The balance is the account's.** Every dungeon drop is the client's own `Math.random`: the INT ledger measures it
after the fact and does not enforce. A key from a forged drop would open a real relay instance, so the key is a
service-side balance and the item is its face.

- `players.eg_keys` (migration, EG2) is the balance. The service-side precedent is the Broker's purse: `insigniaPurse`
  over `EMBERS_EARNED_SQL`, which is gate and serpent embers less `insignia_spent` (`server-account/src/accounts.js`).
- **No code today restacks a pack to a service count.** `restackStones` is SS1's load-time fold in the save, and on
  an insignia sale the client simply takes the stones from the pack. EG2 builds the restack: every service answer
  that carries the balance (`/v1/eg/keys`, a claim, an open) sets the Weir Key stack on the account's character to
  the balance, single-flight and coalesced (ASYNC NEVER DROPS).
- A key the service does not count does nothing: *The key turns to rust.*, and the stack is restacked.
- It is bound to the account, never traded, and never lost to a death.

**Where they come from.** The service rolls every one with its own `rand`, at a claim it already verifies. This is
the `sdHonoursRoll` way: AUDIT SD III R4 moved the Hour's honours off the receipt seed because the page can read the
seed. `claimGate`'s context gains `rand`, which it lacks today (`claimSd`'s has it).

| source | when the service rolls | odds | what that means |
|---|---|---|---|
| **Dagon's Breach** | `claimGate`, a recorded kill (`earned != 'rite'`) | **1 in 6** | at one or two gates a real day, a key every three to six days |
| **...having broken the rite** | the same, with `r=1` | **1 in 4** (instead) | the rite is the gate's harder half (WB12d) |
| **...the first ever** | the account's first `gate_kills` row with `earned != 'rite'` | **certain** | every gatebreaker sees the Spire once |
| **the Abyss Dungeon's Remnant** | `claimSd`, a recorded Hour | **1 in 3** | the hardest fight the port has, witnessed by the relay |
| **an Abyss Dungeon's elite foe** | `/v1/eg/find`, below | **1 in 60** | six elites a Hollow: about one Hollow in ten |
| **an Elite Dungeon's elite foe** | `/v1/eg/find` | **1 in 150** | three or four a dungeon: about one in forty |
| **a Regular dungeon's elite foe** | `/v1/eg/find` | **1 in 400** | one dungeon in five has one: about one in two thousand |

**The dungeon's find.** No relay witnesses an ordinary dungeon, so the find is asked. When an elite foe (`eliteFoe`)
dies in a dungeon online, the find is asked:

1. **who asks**: the death handler (`registerEnemyDeathHandler`, the seam `dropFoeCard` uses for a foe's card) runs
   on the foe's owner, so the owner names the killing blow's account (`_killedBy`) on the foes stream. The killer's
   client asks `/v1/eg/find` with the dungeon's tier, not the owner's;
2. **the roll**: the service rolls at that tier's odds;
3. **a yes** adds one to the balance and throws the item from the body, as a card is thrown.

A forged client can lie about a kill and a tier, so:

- asks are capped at **6 a tier, per account, per real day** (`EG_FIND_PER_DAY`). At the cap a forger's ceiling is
  6/400 + 6/150 + 6/60 ≈ **0.155 keys a day**, under an honest gate-goer's 0.17-0.5;
- finds pay at most **2 keys a week** (`EG_FIND_KEYS_PER_WEEK`);
- `/v1/eg/find` and `/v1/eg/open` both need a handle and either a non-rite `gate_kills` row or a Redoubt taken, so a
  fresh account cannot farm or open.

The INT budget measures the asks.

**The launch gift.** When EG2 ships, every account with a non-rite `gate_kills` row gets one key. The migration adds
it to `eg_keys` itself, and a server-post letter (`server_post`) only words it, *From the Battlespire*. The send is
HOURS-FIRST's precedent (migration 0094). PORTAL-GIFT is not: it is a client-side gift given at save load.

**Using it.** Use is a registered arm (`registerItemUseHandler` -> `{kind:'openBreach'}`), routed on every reader as
the Portal Stone's is. Its refusals, in order, each a line of `EG_TEXT`:

1. offline, or on the `?exterior` bench: *The key is cold here.*
2. not in the open world (an interior, a dungeon, a made level): *Not here.*
3. the Portal Stone's holds (`portalHold` in `src/systems/portalStone.js`: busy, duel, siege, enemies, journey),
   water, or a boat;
4. inside a location's own footprint (a town's walls, a farm's yard): *Not within <place>.*
5. within 300 m of a standing Dagon's Breach, or 150 m of another Elite arch: *Another breach stands near.*
6. the opener already in a breach, or with a stake unsettled: *You hold a breach already.*
7. the Spire draining for a deploy, or the hub at `EG_LIVE_MAX` live breaches: *The Spire is closed for a while.*
8. no room for the arch: the Portal Stone's `portalPlace` law (ground probe, wall gap) at the arch's clearance,
   `EG_ARCH_CLEAR_M` 8: *There is no room for it here.*

Then the **start window** asks where in the Spire:

- **the choices**: *Hall 1*, and every Redoubt the opener may start at (section 15), deepest first;
- **the classic skin** asks with DFU's DaggerfallListPickerWindow (`src/ui/listPicker.js`, PICK00I0.IMG; the boat
  variant picker is the precedent), so the native-window rule holds: a list of DFU's own, no free-styled geometry;
- **the enhanced skin** asks with `src/ui/enhancedPicker.js`;
- **a warning line**, when one of the opener's quests falls due within three hours: *A quest falls due before the
  breach can close.*

The answer goes to `/v1/eg/open` (section 21), which stakes one key.

## 6. The breach - the arch, the call, the clock, the company

### The arch

The gate's own model, `buildGateModel` in `src/world/gateModel.js` (Mac's Blender bake), drawn at **0.62 scale**:
about 10 m tall and 4.8 m to each side.

- **The skin**: Imperial white marble inlaid with gold, cracked through with the Warden's basalt.
- **The membrane**: the gate's pass (`src/render/gatePass.js`) has the membrane's colours and the arch's heights
  compiled into its shader. EG9 widens it with a tint uniform and a scale uniform; the gate's own draw passes the
  gate's values.
- **The beacon**: gold and 600 m tall, half the gate's `BEACON_HEIGHT_M`, seen from kilometres away. A company's door
  should not outshine Dagon's.
- **Rising and sinking**: it climbs out of the ground over the gate's `GATE_RISE_MS` (20 s) and sinks over
  `GATE_COLLAPSE_MS` (10 s).
- **Its clearing**: `createGateClearSweep` (`src/world/gateClearance.js`) tracks one key today. EG9 widens it to a set
  of keys, the clock's gate and every standing arch, each keyed by its breach id.
- **Where it stands**: at the opener's feet, ahead (the Portal Stone's `portalPlace`, `PORTAL_AHEAD` 2 m), facing the
  opener.
- **How peers see it**: its site travels as a word on the opener's world cell (section 21) while the opener stands
  there.
- **How long it stands**: through the rising and the open window only. When the first hall wakes, the arch sinks
  behind the company. A breach is a door, not a monument, and nothing outside needs to stand for three hours.
- **What the room keeps**: the arch's site in its state, so a cast-out member is landed at it with the arch gone.

### The call

Eight players across the Bay cannot all walk to one arch in ten minutes. So the company **answers the call**:

- **The opener** steps through the arch.
- **Every other member**, standing outdoors in the open world during the open window (the Portal Stone's holds
  apply), may answer. The Portal Stone's vortex (`src/scenes/portalFx.js`) opens at their feet for
  `PORTAL_OPEN_MS` (30 s), and stepping into it is their admission.
- **The word.** The hub tells the company `{t:'eg', k:'call', b, ew, site, riseAt, openAt}` on the party channel. Each
  member's client offers *Answer the call*, which asks `/v1/eg/admit` for the order the vortex is stepped through with.
- **Admission never depends on place**: the room checks orders and the company, never where a member stood.
- **Landing**: each member's answer is stored as their LANDING. A fall, the way home, the tear or the end lands them
  there. The opener lands at the arch's site: `gateLandingFor` (`src/world/gateArena.js`) is widened to take an arch
  record (a site and a yaw), since today it takes only a gate's day.

### The clock - the count

On the shared clock (`sharedClassicMinutes`: a game minute is 5 real seconds, a game day 2 real hours). The breach
counts in game minutes from **the opening**, the moment the room accepts the open order, as the gate counts from its
day:

| phase | game | real | what |
|---|---|---|---|
| **rising, sealed** | 60 min | 5 min | the arch climbs and stands sealed: *The gate opens in 4:12.* The company gathers. (The gate's own rise-to-open is the same hour.) |
| **open** | until the first hall wakes, at most 60 min | at most 5 min | the opener steps through; the company answers the call. Later: *The breach has gone deep.* |
| **the count starts** | when the first hall wakes | - | 360 game min (30 real min): *The count: 30:00.* The arch sinks |
| **a Redoubt taken** | +180 game min | +15 min | `remaining = min(remaining + EG_REDOUBT_HOLD_MIN, EG_COUNT_CAP_MIN, lastWord - elapsed)` |
| **the rest** | 90 s | 90 s | the count HOLDS while a Redoubt's rest runs: *The Redoubt holds the count.* |
| **a respite** | up to 10 min | up to 10 min | at a Valkynaz's Redoubt, if every living member agrees, the count holds; the last word does not |
| **the last word** | 2160 game min from the opening | 3 h | no breach runs past it, however many Redoubts |
| **the tear** | when the count is spent | - | *The Covenant tears the breach shut.* Everyone inside is cast out to their landing |
| **the end** | - | - | the room mints the end receipts and keeps its tombstone |

Constants (`net/egLaw.js`): `EG_RISE_MIN` 60, `EG_ADMIT_MAX_MIN` 60, `EG_COUNT_START_MIN` 360, `EG_REDOUBT_HOLD_MIN`
180, `EG_COUNT_CAP_MIN` 360, `EG_REST_S` 90, `EG_RESPITE_MAX_S` 600, `EG_LAST_WORD_MIN` 2160. `egTimes(rec)` answers
every phase's relay time and `egPhase(rec, ms)` the phase: `'rising' | 'sealed' | 'open' | 'deep' | 'torn' |
'ended'`. These are `gateTimes` and `gatePhase` again, for a record instead of a day.

**The surplus.** Time the cap turns away is not wasted. Every 5 real minutes the cap refuses becomes a **Surplus**
(at most `EG_SURPLUS_MAX` 3). At any Redoubt, a Surplus buys a fourth Vestige card or a reroll of the three. A fast
company is paid for its speed in choices, not in hours.

**Why the count is shaped so.** "Timed like oblivion gates" is a window with an end the company can see coming, and an
endless run needs that end to come from the run:

- a fixed window would cap every company at the same clock;
- a count that only grows would let a perfect company stand in the Spire for ever, and the relay pays for every awake
  second (RELAY-H1);
- with thirty minutes to start, fifteen for each Redoubt and thirty in hand at most, early circles bank time (and
  Surplus), and deep circles drain it.

How deep a company gets is where its pace meets the Spire's (section 16). The tear is not a death: nobody is killed,
no DEATH-PENALTY runs, and what was banked stays banked. The Reliquaries are lost (section 15).

### The company

- **Who.** The opener's party at the moment the HUB accepts the open, from the hub's own `party:` record.
  - The hub is the one room every client always holds, and it already keeps the rosters, so no other room needs to
    ask it anything and its silence cannot freeze the wrong company.
  - The company is FROZEN there, up to `PARTY_MAX` (8). One who joins the party later is not in it; one who leaves the
    party is still in it.
  - A party of one is a company.
- **Admission** (section 21):
  - Each member asks `/v1/eg/admit` and gets an **admit order**. The service checks:
    - a handle (no guests: the Spire's feats are recorded);
    - that the member may start at the breach's start Redoubt (section 15);
    - no other live breach (`eg_live`).
  - The member's hello to `eg:<b>` carries the order. The room spends it once, then checks the member is in the
    company, not fallen twice, not forsaken, not gone home, and the open window.
  - The level claim (`lv`, 1-60) is frozen at the first admission.
- **Outside the company.** Touching the arch: *The breach answers only to <opener>'s company.*
- **One breach at a time** for every account, opener or member, enforced by the service's `eg_live` (section 21).
- **The absent.** A member whose socket is gone keeps their BODY at its last pose (the socket flap rule, section 20).
  They are counted fallen only after **180 s gone in a trial** (`EG_ABSENT_TRIAL_S`). Absence on the stair or at a
  rest never counts. A reload, or a slow machine on the stair, is not a fall. A tab closed before a killing blow is
  not a life saved: the body still stands where it stood and takes the blow.
- **Return.** A member whose page reloaded is offered *Return to the Spire* (section 20), into the current hall.

## 7. A run - halls, circles, bands, the beats

**Halls and circles.** Hall *h* (1, 2, 3...) belongs to circle *c* = ceil(*h*/5). Halls 5*c*-4 to 5*c*-1 are the
circle's four trials. Hall 5*c* is the **Court**, whose fall takes **Redoubt c**. A breach that starts at Redoubt *w*
begins at Hall 5*w*+1, *the first hall* of that breach.

**The rhythm.** Every circle runs the same five beats, so a company can feel its place:

| slot | beat | kinds drawn |
|---|---|---|
| 1 | **fight** | the Rift-Yard or the Rampart |
| 2 | **traverse** | the Span; from circle 3, the Deepway one time in three |
| 3 | **mixed** | the Proving Walk, or the Athenaeum (at most one a circle, never in circle 1) |
| 4 | **fight** | the Rift-Yard or the Rampart, whichever slot 1 was not |
| 5 | **the Court** | the circle's lord (section 12) |

An account's very first circle is fixed: Rift-Yard, Span, Proving Walk, Rampart, Court. Its Court is the Hound or the
Armsmaster, never the Spellmaster, whose Examination is no first lesson.

**One hall at a time, the company together.** The room holds one live hall, and the company moves through its beats as
one:

| beat | what | how long |
|---|---|---|
| **arrival** | each member steps off the stair onto the hall's ARRIVAL PLATE (gold), the hall built from its spec, and says `here` | as they come |
| **gather** | the hall wakes when every living member has said `here`, or `EG_ARRIVE_MAX_S` (30 s) after the pull: *The hall wakes.* The breach's FIRST hall wakes when every company member has said `here`, or when the open window ends (`EG_ADMIT_MAX_MIN`); a member not admitted by then is out | `EG_GATHER_S` 8 s |
| **the trial** | the hall's kind (section 8) | the trial's |
| **the door** | the relay judges the trial done, and a gold door opens at the hall's END PLATE | - |
| **the descent** | each member steps through the door when ready (`down`, accepted only within `EG_DOOR_REACH_M` 3 m of it) | `EG_DESCENT_FIGHT_S` 20 s, or `EG_DESCENT_SPAN_S` 45 s after a span |
| **the pull** | at the descent's end, every living member still in the hall is pulled down | after a span, the toll (section 10) |

No member is targeted or judged before their `here`. A span's door opens when the FIRST living member stands on its end
plate with a fair trail (section 19). The descent then gives the rest 45 s to cross, and the pull carries whoever did
not, at the toll's cost. Skill is paid and nobody is stranded. Nothing waits on the slowest player for ever, and
nothing is skipped for free.

**The stair.** Between halls, the veil (`stepThroughFire`) shows the fall through the void, past the Spire's broken
underside, to the next hall's arrival plate (section 23). Each hall is a fresh made level: a dungeon transition over
`egHallLocation(spec)`, as the Shattered Hour is entered over `sdRealmLocation`. The host cannot swap a level's parts
in place: every layout is fixed when its module loads, and there is no re-stand path. A transition per hall is the
seam the gate and the Hour already prove. Every hall of a breach has one presence room, `{kind:'eg', b}`, so the
stair never switches the presence socket.

**The bands.** Every 25 halls (five Redoubts) the halls have fallen further down the legions' road. Each band adds
kinds; earlier kinds stay.

| band | halls | what it is | look | its legion adds | its lords | its champion |
|---|---|---|---|---|---|---|
| **the Broken Galleries** | 1-25 | the academy's upper halls, still over the Deadlands | white marble and gold, burnt Battlemage blue, the fire-sea below | Harriers, Sappers, Ward-Bearers, Breakers, Casters, Lurkers | the Hound, the Last Spellmaster, the Last Armsmaster; Valkynaz Ilthys at Redoubt 5 | a Kynreeve |
| **the Soul Cairn** | 26-50 | halls fallen into the Ideal Masters' realm of the dead | violet-grey stone, soul-gem light, a sea of mist | Binders, Wraiths | the Cairn-Keeper, the Twin Lords; Valkynaz Morvayn at Redoubt 10 | a Kynmarcher |
| **the Shade Perilous** | 51-75 | halls fallen into Nocturnal's dusk | near-black, moon-silver, light only where braziers burn | Divers | the Mother of Dusk, the Night-Stalker; Valkynaz Seyth at Redoubt 15 | a Markynaz |
| **the Havoc Wellhead** | 76 onward | the muster-ground of 3E 398, the Spire's last fragments in it | basalt and molten iron, eruptions | a Daedra Lord as an elite add, one wave in six | the Bound Colossus, the Wellhead Wyrm; Valkynaz Garoth at Redoubt 20 and every fifth after | a Markynaz |

The bands are the arc's progression: each changes the look, the score, the legion, the lords and the champion. The
Wellhead is the endless floor of the Spire. From Hall 76 its band does not change again, and depth grows by decrees
and the Wellhead's tides (section 16). A decree never draws a kind, a piece or a lord its band has not unlocked.

## 8. The halls

Every hall is laid along +Z, from its arrival plate (z = 0) to its end plate, over the void. Falling below a hall's
floor (y < `SD_VOID_Y`, -30) is never a death. It casts back to the last checkpoint island or plate stood on, at the
Spire's own cost: 10% of max health, never below 25% health (`EG_CAST_BACK_LOSS`, `EG_CAST_BACK_FLOOR`). That is gentler
than the Steps' 15%, because in the Spire it is a long run's attrition, not one course's. The void punishes in time
and health. It does not take the one life.

**Health between halls.** The Spire keeps the court's rule: no natural regeneration (`src/systems/courtRules.js`,
WBX6). Health comes back from:

- a Redoubt's rest;
- the member's own potions and spells;
- Vestiges (Rally, Second Wind);
- the Scriptorium twist.

### 8.1 The Rift-Yard (`yard`) - relentless waves

A court disc of radius 22-28 m (the gate's `COURT_R` is 24), with **Wellhead rifts** on its rim: tears into the Havoc
Wellhead the legions came through, each a standing body.

- **Rifts**: `clamp(2 + ceil(n/3), 3, 5)` for *n* living members.
- **Each rift's health**: 12 s of the company's reference damage, through `hostTeamHpFor` (the gate's, with its
  `HOST_HP_MIN` floor), times the depth `(1 + 0.04(c-1))`. All of the rifts together hold 12 s for each rift.
- **Each rift pours a wave** every `max(9, 20 - 0.5(c-1))` s while it stands: the band's kinds, sized by *n* (section
  11). The waves never wait for the last body to die. That is the relentlessness.
- **The legion's cap**: no more than `clamp(2 + ceil(1.5n) + floor((c-1)/5), 3, 14)` standing. A rift whose wave
  would pass the cap holds it, and the next wave is one body larger.
- **The end**: the last rift closed. Every add still standing crumbles (the host's `adie`), and the door opens.

From circle 2, one Yard in three stands in a chamber (section 10.3), its rifts set in the walls.

Split up and close rifts in parallel, or stand together and be buried. An eight-member company closes five rifts in
three groups; a pair closes three, back to back, against a legion sized for two.

### 8.2 The Span (`span`) - platforming

A generated course (section 10) of 12-28 platforms in two to four sections, with checkpoint islands between them,
from the arrival plate to the end plate.

- **Harriers** hover after the company over it (Imps hover, `HOST_HOVER_M` 0.9).
- **Divers** dive at it from the air, from the Shade: only at its islands and plates, since no platform is 5 m wide.
- **The door** opens on the first living member at the end with a fair trail (section 7).
- **Fragments**: a span may pass through a fragment, or fork into a High Road and a Low Road (section 10.3).
- **THE GOLD RUN**: every living member across before the descent's 15th second adds one real minute to the count.
  Past the cap, it adds Surplus credit instead.

### 8.3 The Rampart (`rampart`) - a walkway under fire

A walkway 90-160 m long and 3-4.5 m wide, over the void.

- **Fire vents** cross it on a cycle: each a lane 3 m wide across the walkway, telegraphed 1.0 s before it erupts
  (20% of max health, fire).
- **The legion marches along it** toward the company. The relay runs them on a line, the walkway's own axis, so it
  needs no navmesh.
- **Casters** stand on pillars beside it, 10-18 m out, throwing discs. Reach them by short side-spans, or answer them
  with arrows and spells.
- **Breakers** charge ACROSS the walkway from the side-spans, never along it. A lane along a 3 m walkway would leave
  no floor to escape to (AUDIT EG0 G4). Their push is 6 m, and a push off the edge is a cast-back, not a death.
- **At its end, a portcullis** held by two Ward-Bearers (the Legion-Lord's, pulsing). When both fall, the door opens.

### 8.4 The Athenaeum (`athenaeum`) - the lock

The Battlemages' library, its heart an **Orrery** drawn by `orreryOf` (`src/net/sdBrain.js`).

- **Today**, `orreryOf(s)` takes a Hollow's slot. It reads its fray from that slot's own Hour marks
  (`sdMarksLaw(sdMarksOf(s)).fray`) and its turns band from the module constants `SD_TRUTH_TURNS_MIN`/`_MAX`, with a
  64-entry cache.
- **EG4 widens it** to `orreryOf(s, {turnsMin, turnsMax, fray})`. The Hour's call and its golden draw are unchanged;
  the cache is keyed on the seed and the band.
- **The Spire's knobs**: the turns band starts at 16-28 and rises by 2 every five Redoubts. The fray is the Hour's
  default unless the circle carries the Hour's The Fraying decree (section 13).
- **The judge**: EG4 extracts the pure judge, `orreryJudge`, out of `_sdTurn` in `server/src/index.js` (reach,
  settle, rights, `orreryStep`). The Hour's room and the Spire's both call it.
- **Pressure**: one Harrier rises every 15 s while the lock stands.
- **Everyone works**: the Orrery's six stones may be turned by six different members (its rights), so the company
  works the lock together.
- **The reward**: solving it inside its lowest turn bound grants every member one free Vestige rank at the next
  Redoubt.

### 8.5 The Proving Walk (`proving`) - span, champion, span

The Battlespire was a proving ground. A short span (6-10 platforms) leads to a **proving court** (r 14), where the
band's **champion** stands: a Kynreeve in the Galleries, a Kynmarcher in the Cairn, a Markynaz below.

- It is one foe the relay runs: `PROVE_HP_S` 40 s of the company's reference damage, times the depth.
- It throws three of the Warden's blows at 0.8 SIZE, each lengthened to the wind-up floor (section 12): Cleave, Slam
  and Charge from `ATTACKS`.
- It brings an escort of two adds from its band.
- Its fall opens a second span, whose end is the door.
- From circle 2, one proving court in three is a chamber: the Fallen Stacks' broken dome (section 10.3).

### 8.6 The Court (`court`) - every fifth hall

A short approach (3-5 platforms of the band's first two pieces) leads to the **Court**: a court disc of radius 26, or
the lord's own ground (section 12). The lord stands there. Its fall raises the **Redoubt's beacon** at the court's
heart, and the Redoubt is taken for every living member at once: *Redoubt 5 is taken.* Touching the beacon is not
needed; the rest begins (section 15).

### 8.7 The twists

From circle 3, about one hall in four (seeded, never the Court, never two running) carries a **twist**:

| twist | what | on |
|---|---|---|
| **Reliquary Vault** | a side span to a cache: an extra Reliquary for each member who reaches it, at the count's cost | a Span or a Proving Walk |
| **Dagon's Bargain** | a shrine on the arrival plate: accept one more decree for the rest of the circle, and each member gains one Reliquary | any trial hall |
| **Kynval Squad** | four Kynval champions, each with one affix (Searing, Shielded, Wrathful, Swift), in place of a wave | a Rift-Yard or a Rampart |
| **The Scriptorium** | a quiet hall: heals 30%, no trial, and the door opens after 30 s (the count runs) | slot 3, in place of its kind |
| **A Battlemage's Shade** | a friendly shade (the relay's host runner, a friendly flag) fights beside the company for the hall | any trial hall |

### 8.8 The Deepway (`deepway`) - a hall of fragments

From circle 3, the traverse slot draws the Deepway one time in three instead of the Span. It is a hall built of
fragments end to end (section 10.1), a crawl through the band's deep places:

1. a passage;
2. a chamber where the legion holds the way: two rifts in its walls, under the Rift-Yard's law at half its count;
3. a shaft down;
4. a second passage;
5. the end plate.

The door opens on the first fair arrival, as a span's does, and the descent's law takes the rest. Each band has its
own: the Oblivion Caverns in the Galleries, the Ossuary and the Mist Stair in the Cairn, the Gloam Thicket in the
Shade, and the Forge Gut in the Wellhead.

## 9. The generator - the hall spec

**One pure law, read by both sides.** `egHallOf(seed, hall)` (`net/egLaw.js`) answers the **hall spec**:

- the kind, the band, the circle, the slot and the twist;
- the hall's geometry: its plates, court discs, rifts, walkway, pillars, side-spans and span course;
- its fragments: each one's kind, class, socket and seed, and so its law half (section 10.4);
- its decrees, as numbers.

The relay reads it to run the hall's brains: where a court's clamp is, where a rift stands, the walkway's line, where
a platform is at time *t*. Every client reads it to build the hall (`buildEgHallModel(spec)`, `egHallColliderTris(spec)`,
the Steps' records for a span). Those builders are ONE construction seam, `egHallParts(spec)`, which builds the
model, the collider buckets and the riders together (THE ONE CONSTRUCTION SEAM). The relay and the clients agree
because they compute the same spec.

**Seeds.** The breach's `seed` is drawn by the relay's CSPRNG when the room accepts the open order, and said in its
state. A hall's own seed is `egSeed(seed, hall)`, the `sdSeed` mix. EG5 exports `sdSeed` from `src/net/sdBrain.js`
(today it is private), and the Spire imports it rather than copying it (ONE DFU MEMBER, ONE EXPORT).

**The law's version.** `EG_SPEC` is the spec law's number, recorded per breach as `egv` at the open (section 20).

**The circle law** (`egCircleOf(seed, c)`) fills the rhythm's slots (section 7) from their kinds, weighted by band:

| | yard | rampart | span or deepway | proving | athenaeum |
|---|---|---|---|---|---|
| the Broken Galleries | 3 | 2 | (slot 2) | 3 | 1 |
| the Soul Cairn | 3 | 3 | (slot 2) | 2 | 1 |
| the Shade Perilous | 2 | 3 | (slot 2) | 3 | 1 |
| the Havoc Wellhead | 3 | 3 | (slot 2) | 3 | 1 |

Slot 2 is always the traverse: the Span, or from circle 3 the Deepway one time in three (section 8.8).

**A hall's budget.** Every piece the generator places carries a cost: a platform kind, a rift, a vent lane, a caster
pillar, a fragment and each of its hazards. A hall's pieces sum to `egBudget(h)`, which grows with the circle and the decrees. The Spire therefore has no
lucky seeds: two companies at Hall 40 face halls of the same weight, drawn differently. The budget is the measured
knob of EG's tuning pass (EG21).

**Where the law lives.** The relay draws halls too, so the span law must not pull client code into the relay bundle:
`egSpan.js`, `sdSteps`, the motor and the parkour constants all joining `RELAY_GRAPH` would make every motor tweak a
relay version. Instead:

- the span law is a leaf, `net/egSpanLaw.js`, and the fragments' law another beside it, `net/egFragLaw.js`
  (section 10.4);
- its motor numbers are copied as `EG_*` constants and held equal to the motor's by a test;
- the solver is part of that law, so the relay and the client draw the same course;
- the CLI `egSpanSolve.mjs` (under tools/, as `tools/sdScoreProbe.mjs` is) only drives it.

**Pins.**

- The spec law is pinned against golden specs for fixed seeds.
- Every spec field the relay reads is pinned against the brain that reads it.
- A change to the draw changes the relay version, as the Orrery's golden draw does (`test/relayversion.test.js`).

## 10. The spans and the fragments - generated platforming, modeled areas

**The course is the Steps' own record.** `src/world/sdSteps.js` lays the Unmoored Steps as a uniform array,
`{i, kind, span, x, y, z, w, d, amp, period, phase, beat}`, plus checkpoints `{x, y, z, r}`: exactly what a generator
emits.

- **Today** it is frozen at import (`layCourse`, `SD_STEPS_COURSE`). Its module-scope readers are `SD_GHOST_STEPS`
  (the pass's uniform count), `SD_WAYSTONES` and `SD_VANE`, `sdFx`'s `SD_REWIND_EDGES`, `sdIslandModel` and
  `abyssLab`. The motes read `SD_COURSE_END` lazily.
- **EG4 turns it into data**:
  - `courseOf(courseSpec)` lays a course;
  - the Hour's course is `courseOf(SD_COURSE_SPEC)`, byte for byte the frozen one, pinned;
  - the readers take a course, and the pass's ghost count becomes a maximum.
- **The generator**: `egSpanOf(seed, hall, budget, band)` emits a course from the pieces below.

**Two builds, each for its reason** (AUDIT EG0 N9):

- **THE SPAN BUILD** is SD7b's: Speed 10, Running 0, Jumping 0, the worst build the game makes. Every span law, the
  solver and the CI sweep use it. A gap is binary, so every build must cross every gap.
- **THE ESCAPE BUILD** is the modest build: Speed 40, Running 20, `runSpeed` 6.975 m/s. The wind-up floor uses it
  (section 12), because escaping is continuous and a slow build has Speed and the Fleetfoot Vestige to answer it.

**The pieces.** NOTHING GETS FASTER: every piece keeps the Steps' timing at every depth. Depth adds pieces, combines
them in one section, spaces the islands further apart, and puts the legion overhead.

| piece | from | what | its numbers, at every depth |
|---|---|---|---|
| **Drift** | the Steps | a platform swinging side to side, `stepAt` | `amp` (half the swing) 1.0-2.0 m, period 4-7 s |
| **Beat** | the Steps | there on the beat only, `beatStands` | cycle `SD_BEAT_CYCLE` 3.6 s, solid `SD_BEAT_SOLID` 2.4 s, blink `SD_BEAT_BLINK` 0.4 s, alternate steps `SD_BEAT_HALF` apart |
| **Riser** | the Steps | a wall `SD_RISER_H` 2.3 m, run up (CLIMB3) or climbed | the engine's band |
| **Crumble** | the Steps | shakes and falls after a foot | delay `SD_CRUMBLE_DELAY` 0.7 s, back `SD_CRUMBLE_BACK` 5 s, platforms 2.6 m deep |
| **Gust** | the Steps (the breath) | a span-wide push, warned 1 s | every `SD_GUST_EVERY` 6 s, `SD_GUST_SPEED` 3 m/s for 1 s |
| **Rail** | new | a platform that travels along the course between two plates, ridden (`carryBy`) | period 6-9 s |
| **Pendulum** | new | a chained weight swinging across a GAP, its lane telegraphed | period 3-5 s; a touch is a fall (cast-back) unless Iron Footing III |
| **Vent** | new | a vent under a platform, erupting on a cycle, ringed 1.0 s before | 20% fire; cycle 4-6 s |
| **Descent** | new | a drop to a wide landing with a parapet | at most 4.5 m, onto a landing at least 5 m deep with a 1.2 m parapet at its far side |

Pieces unlock by band:

- the Broken Galleries: Drift, Beat, Riser, Crumble, Descent;
- the Soul Cairn adds the Gust and the Rail;
- the Shade Perilous adds the Pendulum;
- the Havoc Wellhead adds the Vent, all nine.

**The envelope** (SD7a's law, made the generator's). Every number is a bound, never a target:

- **a gap** is 2.4-3.2 m. SD7b crosses 3.2 m at the span build; the plain running jump at the modest build reaches
  more, so training buys margin, not entry;
- **a riser** is taller than the Jumping-100 apex plus 0.5 m, and no taller than `wallRunHeight(0,0) +
  PARKOUR_REACH_MIN`;
- **a step down** within a run is under 1 m;
- **a Descent's drop** is at most 4.5 m. The motor bills fall damage on distance from the takeoff (`fallStart`), over
  `FALL_DAMAGE_THRESHOLD` (5 m), so 4.5 m bills nothing. The motor has no air control, though, so a run carries the
  body on: stepping off at the modest build lands 4.7 m out, and jumping off at Speed 100 lands 11 m out. The landing
  is therefore 5 m deep and walled by a 1.2 m parapet, which no carry clears;
- **depth never widens a gap or shortens a time.**

**The timed solver** (in `net/egSpanLaw.js`). SD7a checks distance and SD7b runs the real motor; neither checks time.
The generator emits only what the solver proves at the span build:

- **jumps**: for every consecutive pair, a launch window of at least `EG_WINDOW_MIN` 0.5 s in every 12 s of the clock,
  in which the build's running jump lands (the motor's closed form, over the platforms' positions at *t*);
- **Beats**: a Beat pair's window is the solid time less `SD_BEAT_HALF` plus the flight, 1.05 s at the Steps' 2.4 s.
  That is why the Beat never shortens;
- **Crumbles**: the delay covers the crossing. A 2.6 m platform at the span build's run (5.47 m/s) takes 0.48 s, plus
  0.15 s of slack is 0.63 s, inside the 0.7 s delay;
- **Pendulums**: a gap's lane leaves a window of at least 0.8 s to pass;
- **Vents**: a ring leaves a platform's farthest point 1.5 m from its edge, inside the floor (section 12);
- **Rails**: a Rail's ride ends on a plate it reaches, at the speed the carry gives;
- **failure**: a course that fails is drawn again from the next sub-seed, at most 8 times, then laid from the band's
  floor pieces alone.

**The sweep.** CI runs SD7b's harness (the real `PlayerMotor` on the real `Collider` over `stepTris` slabs) across
**500 seeds per band**. Every course is crossed at the span build with the Steps' own timing.

**The toll and the fall** (AUDIT EG0 G10):

- **The pull's toll**: 5% of max health for each checkpoint island not reached, at most 20%. Trying and falling short
  costs less than standing still.
- **A cast-back**: 10%, never below 25% health (section 8).
- **THE FORK** (from circle 2): the High Road over the void and the Low Road through the caverns beneath (section
  10.3).

**The flight bans.** `applyMotorEffectFlags` (`src/scenes/shared.js`) holds Levitate under `levitateWarded()`.

- `registerLevitateWard` keeps ONE function, and registering again replaces it. So the Spire's predicate is OR'd into
  `src/scenes/world.js`'s one registration, beside the siege and the Hour.
- **Slowfall is banned too.** It is not banned in the Hour today: it drifts down at a flat `SLOWFALL_VELOCITY` and
  keeps a run's momentum off an edge, so a Descent would be a glide. EG10 adds the Spire's ban to the same flags write
  (`player.slowFalling`).
- **The Jump spell is allowed.** It is a build, and the Steps accept it (*"a Jump spell is a way up too"*).
- Staff `/fly` is staff's.

**Shared clock, private crumbles.** Platforms move on the anchored clock (`anchoredClock`, `deadlandsSeconds`), so every
member sees the same Step in the same place. A crumble is each member's own, as on the Steps.

**The relay judges the end, not the jumps** (section 19).

### 10.1 Fragments - the halls the course passes through

Mac, 2026-10-11: *"I really want to enhance the experience where sometimes platforms can lead to oblivion caverns, or
different types of modeled areas instead of simple platforms"*.

A course of platforms alone is a path over the void. The torn halls did not fall as stepping stones: they fell in
**fragments** - whole caverns, collapsed rooms, broken stairs - and a course passes through them. A fragment is a
modeled area with a mouth and an exit, its own floors, walls and ceilings, its own hazards, and room for the legion.
There are three classes:

| class | what | where it stands | blows land |
|---|---|---|---|
| **passage** | a tunnel, a collapsed corridor, a toppled colonnade: entered at its mouth and left at its exit, with ledges, gaps and hazards inside | in place of a span section | on its landings only (its fight floors) |
| **chamber** | a room with one or more flat fight floors inside walls: a magma hall, a crypt, a pit | in place of a court disc (a Rift-Yard's, a Proving court, a lord's ground), or inside a Deepway | yes |
| **shaft** | a vertical fragment: down through ledges and drops | the Low Road's way down, and the Deepway's | no |

**Every platform is dressed too.** The law decides each platform's footprint, and the model fills it exactly: a
toppled column drum in the Galleries, a bone raft in the Cairn, a black-glass shard in the Shade, a slag raft or a
chained anvil in the Wellhead. **The top you see is the top you stand on**: the model's walkable face is the
collider's face, and its edge is drawn as an edge (a rim line), so a handsome platform never lies about where it ends.

### 10.2 The library, band by band

| band | fragment | classes | what it is | its own hazard (the place's white light) |
|---|---|---|---|---|
| the Broken Galleries | **Oblivion Caverns** | passage, chamber, shaft | the Deadlands' lava tubes under the torn halls: basalt walls, magma channels cut in the floor, chained bridges over magma, openings onto the burning sky | **magma surges** along a channel (a lane, ringed 1.0 s, 20% fire); **fire falls**, curtains across a passage on a cycle (pass between them); **falling basalt** (a disc, 1.2 s) |
| | **The Fallen Stacks** | passage, chamber | an Athenaeum wing fallen on its side: floors become walls, bookcases become platforms, a broken dome becomes a chamber | **toppling shelves** (a lane across the way, 1.2 s) |
| | **The Broken Colonnade** | passage | a colonnade toppled across the void: drums as steps, arches to run along | none: the gaps are the hazard |
| the Soul Cairn | **The Ossuary** | passage, chamber | the vaults of the dead: ribcage bridges, skull pillars, soul-gem niches | **bone bridges** that crumble (the Crumble's law); **soul-wisps** drifting a fixed path (a touch tethers, the Wraith's drain) |
| | **The Mist Stair** | shaft, passage | stairs wound down a pit of mist | **mist surges**: a rising band that hides the floor below a line for 3 s, while telegraphs keep their light |
| the Shade Perilous | **The Gloam Thicket** | passage, chamber | a wood of black glass, its branches the platforms, moonbeams the only light | **moon-bound branches**, solid only while a moving moonbeam lies on them (the Beat's law, driven by the beam) |
| | **The Eclipse Vault** | chamber | a dark hall crossed by moving shafts of moonlight | **the Eclipse** (a CHECK): every 40 s, everyone outside the moon-shafts takes 30%; stand in the light |
| the Havoc Wellhead | **The Forge Gut** | passage, chamber | Dagon's war-forges: conveyors, molten channels, anvils as platforms | **hammer drops** (a disc, 1.4 s), **conveyors** (Rails), **slag spills** (a lane, 1.2 s) |
| | **The Clan Pit** | chamber | the Wellhead's arena of honourable fights between clans (canon), sunk in basalt | none: the Pit is for fighting |
| | **Oblivion Caverns, deep** | all three | the Wellhead's own magma caverns: wider, brighter, the magma higher | the Caverns' three, more of them at once |

Every hazard keeps the wind-up floor, the union floor and THE WIDTH RULE (sections 12.2 and 10.6). NOTHING GETS
FASTER: depth adds hazards and fragments, never shorter cycles.

### 10.3 Where fragments stand

- **In a Span** (section 8.2). A span's platforms run up to a fragment's mouth (a cavern opening in a floating rock
  mass, a fallen doorway) and on from its exit, to more platforms or the end plate. How many: in circles 1-2, one span
  in three carries one passage; in circles 3-10, one or two; deeper, up to three, as the budget chooses.
- **THE FORK: the High Road and the Low Road.** From circle 2, one span in three forks at a checkpoint island:
  - **the High Road** stays over the void: two pieces harder and faster, with a Reliquary cache at its hardest point;
  - **the Low Road** drops into the deep, by a Descent or a shaft, into an Oblivion Caverns passage (or the band's
    own fragment) beneath the course. It is half as long again, with fewer falls and more foes (Lurkers in alcoves,
    Harriers along its graph), and a **Battlemage's niche** that heals 20%, once each;
  - the two rejoin at the end plate. The door opens on the first fair arrival by either road, and the descent's law
    takes the rest. A company may split: the fast and the safe are the company's choice.
- **The Deepway** (`deepway`, a hall kind, section 8.8): a hall built of fragments end to end.
- **Chambers in other halls**: from circle 2, one Rift-Yard in three stands in a chamber, its rifts set in the walls,
  and one Proving court in three is a chamber (the Fallen Stacks' broken dome). The lords below fight on modeled ground
  (section 12.3): Grath in an Oblivion Caverns magma hall, the Cairn-Keeper in an Ossuary crypt, the Mother of Dusk over
  a Gloam glade open to the sky, the Bound Colossus down the Forge Gut, the Wellhead Wyrm in an open-sky cavern of
  pillars.
- **Never**: a fragment in the Athenaeum (the lock is the hall), or two chambers running.

### 10.4 The fragment record - the law half

Every fragment, built in code or authored in Blender, has a **law half** the relay reads and a **mesh half** only the
client draws. The relay has no ARENA2 and never reads a BSA: none of the relay bundle's files does. So it cannot know a
real Daggerfall block's shape, and every fragment is the port's own geometry. Its law is a small, pure record:

```
{ id, band, class, variant,
  sockets: { in: {x, y, z, yaw, w, h}, out: [{x, y, z, yaw, w, h}, ...] },   // where it joins the course
  floors: [{ y, poly: [[x, z], ...], fight: bool }],                          // walkable regions; edges are walls
  open:  [[a, b], ...],                                                        // floor edges open to the void
  ceil:  [{ y, poly }],                                                        // headroom
  graph: { nodes: [[x, y, z, r], ...], edges: [[a, b], ...] },                 // where the legion walks
  anchors: { rift: [...], caster: [...], lurker: [...], niche: [...], hazard: [...] },
  hazards: [{ kind, shape, at, period, windup, pct }],                         // on the shared clock
  course: [ ... ],                                                             // inner platforms, the Steps' records
  proof: { crossMin, moves },                                                  // the timed solver's answer
  cost, reverb, lights: [[x, y, z, kind], ...] }
```

- **Sockets** join it to the course. A fragment's exit socket faces +Z, so a hall stays laid along +Z (section 8)
  whatever a fragment does inside. A socket may change height: that is how a Low Road goes down.
- **Floors** are polygons, each at one height. Those marked `fight` are where blows may land (section 10.6).
- **The graph** is where the legion walks (section 10.6).
- **The course** is the fragment's own platforms (a chasm crossed on ledges), in the Steps' record shape, proven by
  the timed solver like any span (section 10).
- **The proof** gives `EG_CROSS_MIN` for `spanFair` (section 19).
- It lives in `net/egFragLaw.js`, beside the span law in the relay bundle. A change to a fragment's law is a relay
  version; a change to its mesh is not.

### 10.5 How a fragment is built

Two sources, one record:

1. **Code-built kits** (EG6b first, then each band's). A kit is a generator. `egFragOf(seed, kind, class, budget)`
   emits the law half (pure, and the relay's too), and `buildEgFragModel(law, seed)` the mesh half (the client's).
   An Oblivion Caverns passage, for example:
   - a profile (a flat floor 4-8 m wide, walls and a vault at least 3.5 m clear above it) swept along a seeded path
     that leaves facing +Z;
   - the walls and the vault displaced by noise, never the floor: blows land on flat ground;
   - features placed by the budget: a magma channel cut in the floor, basalt pillars (collider cylinders), fire
     falls, a chasm crossed on ledges, an opening onto the burning sky;
   - its collider a low-poly PROXY of the floors, the wall planes and the vault (at most 3,000 triangles), never the
     visual mesh. This is the `realmColliderTris` pattern: the Hour collides on 386 proxy triangles and draws 7,700.
2. **Authored hero fragments** (EG6c, as Mac authors them), modeled in Blender:
   - **the bake**: through `tools/fbxMesh.mjs`, the general bake that keeps UVs and normals (`tools/shipBake.mjs` drops
     UVs);
   - **the law half**: authored in the same scene as named markers (`floor.*` planes, `floor.fight.*` for fight
     floors, `socket.in`, `socket.out.*`, `node.*`, `anchor.*`, `hazard.*`, `light.*`) and baked to a small JSON
     beside the mesh;
   - **each fragment its own bake script and byte-for-byte test**, as every bake in the port has;
   - **each fragment its own `.fbx`**. The gate's 8.6 MB whole-scene source is the warning.

**One kit of mesh tools.** Today every made level carries its own box, extrude and pack helpers (`packFaces`,
`packRealmFaces`, `quadFacing`, `away`, `facing`). The fragments use one shared kit, `world/meshKit.js`: box, prism,
extrude, lathe, sweep, and the pack into `createMesh`'s shape with Uint32 indices. The court and the Hour may move
onto it later; that is not required.

**One registry of pseudo-archives.** The pseudo-archive numbers are scattered constants today (38001-38221), and they
have already collided once (AUDIT SD IV R6, the large boat's 38151). EG6b adds `world/pseudoArchives.js`, the one place
every made level's archive is registered, with a test that refuses a collision. The Spire's 38231-38279 are registered
there.

**Daggerfall's own fire.** The Oblivion Caverns' fire falls wear Daggerfall's own TEXTURE.356: the Mantellan Crux's fire
walls, emissive in records 0, 2 and 3 (`FIRE_WALLS_ARCHIVE`). They are read from the player's own ARENA2 at runtime
through the data pipeline (`getTexture`), never shipped. Vanilla Enhanced does not repaint 356, so it draws as
Daggerfall drew it. Everything else is painted in code into the band's archives (section 23).

### 10.6 Fighting in a fragment

- **Fight floors.** Blows land only on flat **fight floors** (`floors[].fight`), each a polygon at one height.
  - Today the telegraph pass (`src/render/gateTelegraph.js`) draws ONE plane at one height: `TELEGRAPH_LIFT` over a
    court's `y`. A shape on a higher ledge hides under it; on a lower one it floats.
  - EG6b widens it: a shape is drawn once for each fight floor it touches, clipped to that floor's polygon at that
    floor's height.
  - Stairs, slopes, ledges and inner platforms are traversal. No lord or add aims a blow at a member standing there;
    only the place's own hazards reach them, each drawn by its own pass on its own surface.
- **Walls bound the escape.** `perilAt` and `wayOut` (`src/scenes/gateCourt.js`) search 24 bearings bounded only by a
  court's circle, straight through walls. In a fragment, the union floor (section 12.2) searches over the fight floor's
  polygon, whose edges are walls unless marked open. An escape never runs into rock.
- **The relay's judge is 2D** (`judgeShapes`, section 19). It judges a blow per fight floor, and counts a member only
  while their pose's height lies within that floor's band (±1 m).
- **THE WIDTH RULE.** `deepIn` (`src/net/bossBody.js`) counts a body only when its point and eight probes 1.5 m out lie
  inside the shape, so a shape narrower than 3 m is never counted.
  - Every aimed blow in the Spire is at least 3 m across at its narrowest.
  - Section 11's Charge and Dive and section 12.3's Lunge are widened to 3 m; their floors become 0.72 s.
- **The legion walks the graph.**
  - Ground kinds walk a fragment's graph from node to node (a search over a dozen nodes), as the Rampart's legion
    walks its line.
  - Harriers hover along the graph, never through rock.
  - Lurkers wait at `anchors.lurker`, Casters stand at `anchors.caster`, and rifts open at `anchors.rift`.
  - Divers dive only in fragments open to the sky.

### 10.7 Moving through a fragment

- **Headroom.** Every passage keeps at least **3.5 m** clear over its floors, and every chamber **6 m**. The
  third-person cameras collide:
  - the Morrowind lane's pivot rides 1.77 m up and drops at most 0.14 m under a ceiling (`src/player/mwCamera.js`);
  - Eye of the Beholder's camera rides 0.5 m over the eye and 2 m behind it, and casts twice its offset upward
    (`checkBounds`, `src/player/eotbCamera.js`), so it wants about 2.7 m for its whole offset.
  - 3.5 m gives both their whole offset with room for a ledge's step. No fragment asks for a crouch.
- **The collider** takes the proxy (section 10.5) in one bucket per fragment: `addMesh`, then `removeBucket` at the
  hall's end. The fine grid's query cost follows the triangles in each 2 m cell, so a proxy keeps the walls and the
  vault apart from the floor in plan.
- **The clamp.** The motor's analytic clamp (`player.arena.clamp`, `realmClamp` over floor lists) is OFF inside a
  fragment. Its walls bound it, and its open edges fall to the void.
- **Magma is the void.** Falling into magma, a chasm or the mist is a cast-back (section 8), with the place's fire on
  the magma's.
- **`spanFair`** (section 19) knows fragments: a pose near a floor's height must lie inside that floor's polygon, or on
  an inner platform's footprint at that time.

### 10.8 Light, sound and budgets

- **Light.** A fragment's light markers join the hall's list nearest-first (the Hour's `realmLightsWith` precedent),
  under the renderer's cap (`CLASSIC_MAX_LIGHTS` 16, 48 on the enhanced lane).
  - Magma glows by emission, never by a light, so the cap is spent on gold (the way) and on the band's own colour.
  - Magma is the band's molten orange, darker than Dagon's crimson, so a telegraph is never mistaken for the floor
    (section 23's readability law).
- **Sound.** A fragment carries a reverb preset (`src/systems/reverbPresets.js`): Cave (2.91 s) in caverns, Stoneroom in
  the Stacks and the Ossuary, Quarry in open fragments. The Spire's reverb law owns `audio.setReverb` while a hall
  stands, and tells Better Ambience, which caches its own (`reverbOn`), so the two never fight.
- **Budgets.** None are documented for the port today, so the Spire sets its own:
  - a fragment: at most 15,000 drawn triangles, 3,000 collider triangles and 6 lights;
  - a hall: at most three fragments, 40,000 drawn triangles and 80 mesh draws.
- **The cull.** The dungeon arm reads `d.culled`, and nothing sets it today. EG6b sets it from each fragment's and each
  section's bounds against the frustum, and marks decorative parts `noShadow`. EG21 measures all of it on SwiftShader
  and a phone.

## 11. The legion - relentless adds

**One wave runner, widened from the gate's.** In `src/net/gateBrain.js`, the private `stepHost` runs the
Legion-Lord's three kinds, tied to the gate's phase, court and trial.

- **EG8 lifts their law** into `net/egHost.js`: a runner driven by a hall's geometry (a court's rim, a rift's place, a
  walkway's line, a span's air).
- **EG8 exports the shared pieces** it needs (`rimSpots`, the spacing law) from the gate's brain, beside the already exported `hostTeamHpFor`, and
  imports them. The gate's `stepHost` stays, its frames and pins unchanged. This is SERPENT1's rule again: widen a seam
  whose default is the gate's own bytes.

**The kinds.** Bodies are Daggerfall's own mobiles (`MOBILE_TYPES` in `src/characters/mobileTypes.js`), so every player
can draw them. A Morrowind body (`CREATURE_MATCH` in `src/characters/creatureBodies.js`) re-skins one where the
player's data and the budget allow. Every blow is a shape the telegraph pass draws, and every wind-up keeps the floor
(section 12).

| id | kind | does | bodies (band) | body | move | its blow (wind-up / floor) |
|---|---|---|---|---|---|---|
| 0 | **Harrier** | runs at the living member farthest from its anchor (in a Court, from the lord, as the gate's runs from the Warden; elsewhere, from itself), hovering | Imp (1); Giant Bat (3) in the Shade | r 0.5, h 1.5 | 5.0 m/s | Bite: disc r 2, 12% + 4 (0.9 s / 0.79 s) |
| 1 | **Sapper** | walks to its OBJECTIVE: a Court's lord (heals it, the gate's law), or a Yard's nearest closed rift (opens it again at a third) | the Atronachs (35, 38, 36, 37) | r 0.7, h 2.3 | 1.6 m/s | none: it is the objective |
| 2 | **Ward-Bearer** | stands and pulses, holding a ward on what it guards (a lord, a portcullis) | Fire Daedra (26), Frost Daedra (25); Daedra Seducer (29) in the Shade | r 0.6, h 2.2 | stands | Pulse: disc r 3.5, 18% + 6 of the band's element (1.4 s / 1.00 s) |
| 3 | **Breaker** | winds a charge at a member, runs it, pushes | Daedroth (27) | r 0.8, h 2.4 | 3.0 m/s; the charge 12 m/s | Charge: lane w 3 x 14, 25% + 8, push 6 m (1.1 s / 0.72 s) |
| 4 | **Caster** | stands off 10-18 m and throws at a member every 6-9 s | Fire (26) or Frost (25) Daedra; Lich (32) in the Cairn | r 0.6, h 2.2 | 2.0 m/s | Bolt: disc r 3 at the member's feet, 20% + 6, the element, leaving a pool (`POOLS` hellfire's) (1.6 s / 0.93 s) |
| 5 | **Diver** | flies at 6-10 m, circles, dives a lane at a member; never onto a platform narrower than the lane plus 2 m (5 m) | Harpy (13), Daedra Seducer (29, winged), Dragonling (34) | r 0.6 | 6.0 m/s | Dive: lane w 3 x 10, 18% + 5 (1.0 s / 0.72 s) |
| 6 | **Lurker** | dormant until a member passes within 6 m (an ambush), then slow and heavy | Gargoyle (22); Iron Atronach (36) in the Wellhead | r 0.9, h 2.6 | 2.2 m/s | Smash: disc r 3, 30% + 10 (1.3 s / 0.93 s) |
| 7 | **Binder** | stands back and raises the last fallen add of its wave once, a 6 s cast broken by a blow worth a tenth of its health | Lich (32), Ancient Lich (33) | r 0.6, h 2.2 | 1.2 m/s | none: the raise |
| 8 | **Wraith** | drifts in and tethers the nearest member: 3% of max health a second while within 8 m, broken by putting 10 m between | Wraith (23), Ghost (18) | r 0.5 | 2.5 m/s | Drain: a tether (section 23) |

**The push** is a new blow effect, applied by the struck client as the Steps' gust is (`collider.move`, capped per
frame), and resisted by the Iron Footing Vestige. Near an edge it is a cast-back.

**Health and the waves.**

- **Health**: a kind's health is seconds of reference damage, as the gate's are (the Harrier's `HARRIER_S`, 3 s of the
  hall's mean reference damage). It is shared over a wave where the kind is a team's, through `hostTeamHpFor`, and
  scaled by the depth `x (1 + 0.04(c-1))`.
- **Size**: a wave counts the living company, as the gate's do, clamped by kind.
- **Cadence and cap**: the hall's (section 8), quickening with depth (section 16).

**Unlocks by band**:

- Galleries: kinds 0, 1, 2, 3, 4, 6;
- Cairn: + 7, 8;
- Shade: + 5;
- Wellhead: all of them, with a Daedra Lord (31) as an elite add (5x health, the Warden's Cleave, at least at its floor) one wave
  in six.

**Pure, and the relay's.** The runner's dice are the beat's rng (the relay's CSPRNG), as every brain's are.

- **Frames out**: the Legion-Lord's: `ad` (a wave risen), `amv` (the walks), `aatk` (a blow), `ah` (a health), `adie`
  (gone).
- **Frames in**: blows on adds arrive as `ahit` through `applyHostHit`'s hand and purse.

A hall with no legion draws no dice.

## 12. The lords - the bosses

### 12.1 One seam for every boss

The relay hosts three bosses today, each by hand:

- `_gateTick`, `_gateFrame`, `_gateFall`;
- `_sdFightTick`, `_sdFightFrame`, `_sdFightFall`;
- the serpent's.

A realm holds ONE fight (`this._sdFight`). The Spire needs a different lord every fifth hall, so EG3 builds **one boss
seam** (`net/bossSeam.js`). It is the shape every brain already keeps by convention, made a contract:

```
new(profile, rng)            join(f, sub, name, lv, now, present)      hit(f, sub, d, r, pose, now, seq)
step(f, now, bodies, rng) -> frames[]      stateOf(f)      judge(f, blow, trails) -> [{sub, share}]      earned(f, sub)
```

The gate, the Remnant and the serpent are re-plugged into it with their pins unchanged and their frames byte for
byte. The Spire's lords are written to it. The gate's brain already exports the hand and the purse (`spendBlow`,
`spendPurse`), the share's retirement (`retireShare`/`restoreShare`), the seat (`freeSeat`), the chart (`damageChart`)
and the choice of blow (`chooseAttack`), and the Remnant already imports them.

### 12.2 The law every lord keeps

- **Health**: `ttkRef(c)` seconds of reference damage per fighter (`dpsRef(lv)`, the gate's level claim), added as the
  gate adds its fighters. `ttkRef(c) = 180 x 1.07^(c-1)` to circle 20, then `x 1.03` a circle (`EG_TTK_S`,
  `EG_TTK_GROWTH`, `EG_TTK_GROWTH_DEEP`).
- **A fall retires a share**: the fallen's share is retired at the current fraction (`retireShare`, the Remnant's law),
  and restored on a recall (`restoreShare`). Seven members never face a lord sized for eight.
- **The bucket**: the gate's (`BUCKET_RATE_X` 3, `BUCKET_DEPTH_X` 15, `HIT_CAP_X` 12), each member's times their
  Vestiges' factors, capped as section 14 says (1.25 declared, 1.6 established by the relay).
- **Blows**: shares of the struck member's own maximum health, resolved on the struck member's machine (co-op's law).
  Depth and fury together multiply a share by at most **1.5** (`EG_SHARE_X_MAX`).
- **Phases**: at the gate's `PHASE_AT` (0.66, 0.33) unless the lord says otherwise, each turn shielded `SHIELD_MS`
  (3 s).
- **Targeting**: the gate's. 60% to the top of threat (`THREAT_PICK`) and 40% to a random living member, threat
  forgetting `THREAT_DECAY` a second.
- **FURY**, the endless lord's answer to a slow company. At `EG_FURY_RATIO` (1.25) x `ttkRef(c)` seconds into the
  fight, a lord turns to fury: *Grath rages.* Every 30 s after:
  - it raises one wave of its band's legion;
  - its shares grow by a tenth, within the 1.5 cap;
  - from the second step, its aimed blows chain a second shape, telegraphed when the first lands and landing max(0.6
    s, its floor) later.
  - Fury NEVER shortens a wind-up (Mac, WBX: *"nothing gets faster"*). It makes a slow fight crowded and costly, not
    unreadable.
- **THE WIND-UP FLOOR** holds for every blow of every lord and add, under every phase, decree and fury:
  - `windup >= escapeS(shape) + EG_REACT_S (0.5)`, where `escapeS` is the farthest interior point's distance to the
    shape's edge over the escape build's run (6.975 m/s);
  - a disc's farthest point is its radius away; a lane's is half its width; a ring's, half its band; a cone's, its
    inscribed radius;
  - the floor CLAMPS: it lengthens a wind-up and never refuses a blow;
  - what the gate ships does not all keep it. The Warden's third-phase Slam (disc r 7, 1.6 s x `PHASE3_WINDUP` 0.8 =
    1.28 s) has a floor of 1.50 s at the escape build, and Colossal's (r 8.5) one of 1.72 s; the third-phase Crushing Leap (disc r 6, 1.2 s) has one of 1.36 s. In the Spire, the
    Valkynaz's Slam and Leap are therefore lengthened to their floors;
  - the 0.5 s slack is a human's reaction plus a one-way latency. That is fine where a death is cheap (the gate's
    0.35 would do there), but not in a long one-life run.
- **THE UNION FLOOR**. Each shape being escapable alone is not enough: a Breaker's lane, a Bolt and a Slam together
  can trap a member.
  - Every beat, the relay tests every member against the UNION of the shapes pending on them, over walkable floor:
    is there a reachable point outside them all, in each shape's remaining time less `EG_REACT_S`, at the escape
    build? This is
    `perilAt`'s bearing search (`src/scenes/gateCourt.js`) widened to a union and to the hall's floor.
  - A blow that would break that is held a beat (250 ms), at most four beats, then dropped.
  - Pendulums and vents are tested on the same floor.
- **THE WIDTH RULE** (section 10.6): every aimed blow is at least 3 m across at its narrowest, or the relay's count could
  never see it.
- **THE CHECK CLASS.** A whole-court blow (no edge to run to), a haven blow, or an errand's failure blow is a CHECK:
  - its wind-up and its damage are fixed: no phase, fury, decree or depth shortens or raises them;
  - it carries its own feasibility pin for *n* = 1 to 8 (THE ERRAND FLOOR, below);
  - the gate exempts its own the same way (`isDagons`, `windupOf`).
- **THE ERRAND FLOOR** (pinned beside the wind-up floor):
  - an errand that needs *k* bodies needs `min(k, n)`;
  - its window is at least a lone runner's route at the escape build plus 1.5 s;
  - CI solves every lord's errands for *n* = 1 to 8, as the span solver solves spans;
  - a party of one is a company, and the Alone board is real (section 18).
- **Tells only the engine can give.** What lands is what the ground shows, and EVERY real blow glints with its WIND
  cue. A feint follows Feud-Arc section 7.3 exactly: its mark fills to `FEINT_AT` (0.55), is cut, and fades out dashed
  over 0.15 s, with no glint and no WIND. No tell depends on a shadow, which a billboard and a phone cannot promise.

### 12.3 The roster

`egBossOf(seed, c)` draws a Court's lord:

- **the pool**: the band's own lords at weight 2, plus every earlier band's at weight 1, re-aspected;
- **no repeat**: never one of the last `min(2, pool - 1)` Courts';
- **the Valkynaz**: every fifth Redoubt (Hall 25, 50, 75, 100...) is a Valkynaz, outside the draw;
- **unshipped bands**: a band whose lords have not shipped draws from those that have, so the content ships band by
  band (section 29);
- **an unshipped Valkynaz**: a Valkynaz Redoubt whose Valkynaz has not shipped is held by Ilthys under the band's
  aspect.

Bodies are Daggerfall's, drawn large, as Ruhn is (`BOSS_LOOKS` in `src/world/gateBoss.js`: a mobile and a scale). Each
lord's errand rules are given for *n* = 1, and its numbers keep the floors.

**The Broken Galleries**

1. **Grath, Hound of the Wellhead** (`hound`; Daedroth 27, x3). The Court is an Oblivion Caverns magma hall (section
   10.3): three basalt islands (r 11) joined by narrow bridges over the magma.
   - It bounds from island to island (the Warden's Leap). The island it leaves cracks, warned 3.7 s (escape to a
     bridge, at most 22 m: 3.65 s), and falls for 15 s. A cast-back from a fallen island lands on a standing one.
   - Gore: a lane 3 m wide and 18 m long, 1.3 s (floor 0.72 s), push 6 m.
   - Savage: a cone, 7 m, 110°, 1.2 s (floor 0.95 s).
   - **The Scent**: a mark on one member, who is hunted for 8 s at 6.5 m/s, under the escape build's run. The rest
     punish while it chases. *n* = 1: no Scent; it gores twice as often instead.
   - Phase 2: the bridges burn by turns. Phase 3: two Scents at once (when *n* ≥ 3).
   - *A fight about ground.*
2. **The Last Spellmaster** (`spellmaster`; Ancient Lich 33, x2.5): the Spire's master of spells, raised by the Kyn.
   - **Havens**: two to four gold discs (r 3) at radius 13 of the court; everywhere else takes the Haven Nova, 60%. The
     gate's dodge, turned inside out. Its wind-up follows the havens' escape: 4.5 s for two (26.1 m to the nearest
     haven), 3.5 s for three, 3.0 s for four. A CHECK.
   - **Arcane Lattice**: parallel lanes 3 m wide, swept across the court in sequence (the LANES shape; 1.4 s each,
     floor 0.72 s).
   - **Mirror Images**: three images whose blows are feints under Feud's grammar. A blow shatters an image.
   - **Blink**: across the court.
   - **The Examination** (phase 2): runes light on the rim in an order shown above him, with numerals I-IV and a chime
     each.
     - Each lit rune must be stood on, in the shown order, by a member. With fewer members than runes, one member
       stands several in turn.
     - Runes: `min(4, max(2, n))`. When *n* is under the rune count, the runes stand on a ring of r 8.
     - The window: `10 + 4 x max(0, runes - n)` s, pinned by the errand solver. On the rim the longest route is 52 m:
       7.5 s at the escape build, 9.0 s with THE ERRAND FLOOR's 1.5 s.
     - Failed: 60% to all (a CHECK). Passed: he is stunned 8 s and takes x1.5 (the crystals' law, `STUN_MS`,
       `STUN_HIT_X`).
   - **The Final Examination** (phase 3): he binds a member in a cage for 8 s. The company breaks `clamp(n-1, 1, 3)`
     seals, and the bound member may shoot seals from inside. *n* = 1: no bind; three seals rise within 6 m, 8 s to
     break them. Failed: 70% to the bound (a CHECK; never 999%).
   - *A fight about reading.*
3. **The Last Armsmaster** (`armsmaster`; Skeletal Warrior 15, x2.6): the Spire's master of arms, raised.
   - **The Challenge**: he marks a member, and a ring of fire (r 6) rises around the two. This is the duel's own ring
     law (DUEL1's `_keepInArena`, `clampToRing`).
     - The challenged must last 15 s or deal a tenth of his health inside it.
     - Outside, the company breaks the ring's `clamp(n-1, 1, 3)` braziers (each 4 s of the company's reference
       damage) to open it early, while the legion presses.
     - *n* = 1: no ring; he duels in the open with his whole kit.
   - **Riposte**: a cone (3.5 m, 90°) that answers a blow landed in the 0.6 s after his guard rises, 0.8 s (floor
     0.71 s). The tell: his blade raised, glinting.
   - **Lunge**: a lane 3 m wide and 10 m long, 1.0 s (floor 0.72 s). **Whirl**: a disc of r 4, 1.3 s (floor 1.07 s).
   - Phase 2: two Challenges at once (when *n* ≥ 4).
   - Phase 3: **the Last Lesson**. The court's edge closes 1 m every 6 s, to r 12.
   - *A fight about the duel.*
4. **Valkynaz Ilthys, Lord of the Galleries**: the Valkynaz at Redoubt 5 (section 12.4).

**The Soul Cairn**

5. **The Cairn-Keeper** (`cairnkeeper`; Lich 32, x3), in an Ossuary crypt.
   - **The Soul Tithe**: every 25 s each member takes a soul-mark. It must be laid in one of four soul-gems on the rim
     (stand 1.5 s) within 9 s; the gems are placed so the nearest is never more than 12 m away. Otherwise it bursts:
     30%, and a Wraith rises.
   - Each gem holds *n* souls, so there are four tithes at any *n*. When all four gems are full he is laid bare:
     stunned 8 s, x1.5.
   - Wraiths drain.
   - *A fight about eight people's errands.*
6. **The Twin Lords, Vael of the Fire Clan and Isk of the Frost** (`twins`; Fire Daedra 26 and Frost Daedra 25, x2.6
   each), rivals as Faydra and Moath were. Two courts joined by a walkway.
   - They must fall within 15 s of each other, or the survivor raises the other at half (the Echoes' law,
     `SD_ECHO_PAIR_MS`).
   - **Fire-touched and Frost-touched**: a member struck by Vael is Fire-touched for 12 s. They deal +25% to Isk and
     take +25% from Vael. The reverse holds for Isk.
   - **The Crossing**: every 60 s they cross the walkway (at most 24 m long) and change courts. The walkway is struck
     along its length, 3.0 s; the escape runs along it to either court (floor 12/6.975 + 0.5 = 2.22 s).
   - *n* ≤ 2: they share one court, with a 20 s window.
   - *A fight about splitting the company.*
7. **Valkynaz Morvayn of the Cairn**: Redoubt 10.

**The Shade Perilous**

8. **The Mother of Dusk** (`dusk`; Daedra Seducer 29, x3, winged; the Morrowind `winged twilight`, which flies). Dagon
   gave her kind its wings. She circles over a Gloam glade open to the sky, beyond the court and out of a blade's reach.
   - Dives (lanes; never onto ground narrower than the lane plus 2 m) and Hellfire.
   - **Three anchors** hold her to the rim. They are bodies a blade strikes, each 6 s of the company's reference
     damage. With all three broken she is dragged down and grounded for 30 s, x1.3.
   - **Gutterdark**: the braziers gutter in turn. The floor goes dark; telegraphs keep their full light, and every foe
     keeps a rim light (section 23).
   - *A fight about the air.*
9. **The Night-Stalker** (`stalker`; Vampire Ancient 30, x2.5).
   - He vanishes. Where he stands is drawn as an umbral disc on the floor, the telegraph pass's mark kind.
   - **Blood Tether** on two members, broken by standing 14 m apart for 2 s; it heals him. *n* = 1: it binds a Blood
     Thrall (a Harrier body) 4 m away; kill it or put 14 m between.
   - Bat swarms: Harriers as Giant Bats.
   - *A fight about distance.*
10. **Valkynaz Seyth of the Shade**: Redoubt 15.

**The Havoc Wellhead**

11. **The Bound Colossus** (`colossus`; Iron Atronach 36, x4): the Battlemages' war-engine, Dagon's now.
    - It walks a fixed route down the Forge Gut's long forge hall (55 m), stamping lanes.
    - Its vent-hearts, `3 + floor(n/2)` (3 to 7), are on its back. **Rails rise along its flank every 15 s**
      (`carryBy`) and carry members up to them: the Spire's own platforming, inside the fight.
    - Break them all before its Overload every 75 s (70% to all, a CHECK): stunned 8 s, x1.5.
    - Chain lightning: discs that leap between members within 6 m. Spread.
    - *A fight you climb.*
12. **The Wellhead Wyrm** (`wyrm`; Dragonling 34, x5, flying).
    - In an open-sky cavern, it perches on three pillars, breathing lanes and cones; it takes flight and drops meteors.
    - Each pillar is reached by a side-span and broken from on top. With its perch broken it lands, x1.3, for 25 s,
      until it finds another.
    - *A fight for every build.*
13. **Valkynaz Garoth of the Wellhead**: Redoubt 20, and every fifth after.

### 12.4 The Valkynaz

ONE brain (`net/egLord.js`) with a signature for each Valkynaz. Body: Daedra Lord 31, x3.3, Ruhn's look under another
aspect. The kit:

- Cleave, Slam, Charge, the Crushing Leap and the Meteor (the gate's `ATTACKS`, at the depth's shares, each lengthened
  to the floor);
- three courts and their walkways (WB9b's `COURTS` and `WALKS`), crossed as Ruhn crosses them.

| Valkynaz | Redoubt | aspect (`GATE_ASPECTS`) | signature |
|---|---|---|---|
| **Ilthys, Lord of the Galleries** | 5 | Burning | **the Conquest**: at each court he plants a banner (a Ward-Bearer body) that claims a third of the court. Claimed ground burns (a pool) until its banner is broken, and while two banners stand they hold his ward (25 s at most) |
| **Morvayn of the Cairn** | 10 | Venom-Blooded | **the Chaining**: pairs of members are bound by soul-chains for 20 s. A pair stretched past 8 m both take 30% (a CHECK), and a blow on one is shared with the other. An odd member, or a member alone, is chained to a Wraith; kill it to break the chain |
| **Seyth of the Shade** | 15 | Rime-Wrought | **the Mirrorcourt**: two mirror lords fight beside him and throw real blows at half share. Every blow glints; the true lord alone keeps the band's moon-silver rim light. A mirror shatters after 8 s of the company's reference damage and returns 20 s later |
| **Garoth of the Wellhead** | 20, 25, 30... | each of the four in turn | **the three signatures in turn**, each under the next of the four aspects (Burning, Rime-Wrought, Storm-Crowned, Venom-Blooded), with every decree the circle carries |

A Valkynaz's Redoubt rolls its spoils twice (section 17). The first Valkynaz a company fells is its first true feat in
the Spire.

## 13. Decrees - what deepens a circle

At each Redoubt the next circle's **decrees** are drawn and shown on the beacon: *The next circle bears: Gale-Swept,
Hunting Pack.* The company knows what is coming before it chooses to go on.

- **How many**: circle 1, none. From circle 2, `min(4, 1 + floor((c-2)/2))`.
- **One per family**: never two from one of the five families. The count's formula caps at four, so a company can
  track every one. Dagon's Bargain (section 8.7) may add a fifth for its circle, and the frames carry up to five.
- **Ranks**: past four, one decree a circle ranks up to II instead (the table's last column).
- **Tides**: past circle 20, the Wellhead's **tide** (section 16) joins them.

| family | decree | what | at rank II |
|---|---|---|---|
| **blows** | **Chained Blows** | the legion's blows chain a second shape, telegraphed when the first lands and landing max(0.6 s, its floor) later | a third shape after the second |
| | **Twin Charge** | a Breaker's charge is followed by a second lane, telegraphed as the first lands and landing 1.2 s later | a third lane, 1.2 s after the second |
| | **Pyre-Bound** | a slain add bursts: disc r 2.5, 1.0 s (floor 0.86 s), 10% | disc r 3.5, 1.2 s (floor 1.0 s), 15% |
| **legion** | **Hunting Pack** | Harriers on every hall, a wave every 30 s | a wave every 20 s |
| | **Legion's Tithe** | waves are a quarter larger (`sizeX` 1.25, rounded up) | half larger (`sizeX` 1.5) |
| | **Swarm-Mother** | every wave carries a Binder (from the Cairn) | two Binders |
| | **Kyn's Vigil** | every hall's trial begins with the band's champion on the arrival plate | with its escort doubled |
| | **Rift-Torn** | Rift-Yards have one rift more (cadence still at least 9 s) | two rifts more |
| **ground** | **Ashfall** | fire falls on court discs, a meteor's disc every 12 s | every 8 s |
| | **Gale-Swept** | every span carries a Gust section (from the Cairn) | two Gust sections |
| | **Crumbling Halls** | every span carries a Crumble section, and has one checkpoint island fewer | two Crumble sections, two islands fewer |
| **count** | **Short Count** | the next Redoubt adds 10 minutes, not 15 | 5 minutes |
| | **Thin Rest** | the next Redoubt's rest heals half | a quarter |
| **lord** | **Colossal**, **Unyielding**, **Vengeful**, **Grudge-Bearer** | the gate's boss-general trials, recast as laws (below), on the Court's lord alone | the laws' rank II values (below) |

**The merge.** The gate's trials carry no `.law`, and their keys (`hp`, `dmg`, `hit`, `size`, `slamR`, `groundMs`,
`threatPick`) do not end in `X`. So `sdMarksLaw`'s rule (a key ending in `X` multiplies; any other is overridden by
the last mark that names it) cannot fold them as they stand. EG5 recasts the four boss-general trials as X-keyed laws:

- Colossal: `sizeX` 1.25, `hpX` 1.25, `radiusX` 1.2 (II: 1.4, 1.4, 1.3; the floor lengthens every wind-up it widens);
- Unyielding: `shieldX` 2, `hitX` 0.85 (II: 3, 0.75);
- Vengeful: `dmgX` 1.25 (II: 1.4). Every share multiplier, depth's, fury's and Vengeful's, together is at most 1.5;
- Grudge-Bearer: `threatPick` 0.85, `threatDecay` 0 (II: `threatPick` 0.95).

The trials written against the Warden's own attacks (Scarring, Dagon's Favoured, Echoing, Soul-Hungry) are not drawn,
nor is the ninth, Legion-Lord: the Spire's legion is its own (section 11).
The Hour's **The Fraying** (`SD_OMENS`, fray 36) is drawn only for a circle with an Athenaeum, through `orreryOf`'s
fray parameter. The Spire's own decrees never reuse a trial's or an omen's name.

**The profile.** `egFightProfile(decrees)` folds them as `sdFightProfile` does. Its cache is keyed by the sorted decree
string and bounded (LRU 256): the gate's and the Hour's caches assume a bounded set of 185 or 216, and the Spire's is
not. The Spire's frames carry up to five decrees and the tide under their own validator. The gate's `validGateMods`
(three words) is not touched.

Every decree is relay-side, the shared clock's law, or a word the relay says (a rest's heal). None asks the client to
handicap itself.

## 14. Vestiges - what the Battlemages left

**My decision on question 4: yes.** An endless run without a build that changes inside it plays the same at Hall 60 as
at Hall 6, and eight members choosing what to become is what makes a company more than eight builds.

- At each Redoubt, every living member is offered **three Vestiges**, drawn by the relay's rng from three different
  families, and takes **one** within the rest. Unpicked, the first is taken.
- Taking one already held ranks it, **I -> II -> III**. An offer never shows one held at III.
- **The lean**: at the first Redoubt, one of the three is always drawn from the family of the member's most-used blow
  kind in the circle (the hit's `r`): melee leans to Blade, shaft to Hunt, spell to Arcana. It nudges and never decides;
  the room knows nothing of classes and should not.
- **Surplus** (section 6) buys a fourth card or a reroll. A **bequest** (section 15) adds the fallen's card.
- They last until the breach closes. The room holds each member's, says them to the company (auras need it), and the
  Redoubt's receipt carries them.

**The trust law.** A player owns their body (co-op's law). A Vestige that changes only the holder's body is as honest
as their save. Every Vestige that raises damage on a relay foe does so through the relay:

- a **conditional** one (a condition the relay cannot see) declares its EXPECTED gain as a bucket factor;
- one whose condition the relay itself establishes (a distance between poses, an add's health, an ally's place, an
  ally fallen) is applied by the relay to that blow;
- the product of the client-declared factors on a member is capped at **`EG_BUCKET_X_MAX` 1.25**. A modified
  client's ceiling rises by a quarter at most, and the at-cap column of section 16 carries it;
- the relay-established factors cannot be forged, and are capped on their own: their product at **`EG_RELAY_X_MAX`
  1.6** (Culling Edge III alone reaches it).

| family | Vestige | I / II / III | applied by |
|---|---|---|---|
| **Stone** | **Stoneskin** | +10 / 18 / 25% max health | client |
| | **Iron Footing** | push taken -35 / 65 / 100% (Breakers, Pendulums, Gusts) | client |
| | **Second Wind** | once a hall, falling under 30% heals 15 / 25 / 35% | client |
| | **Bastion** | allies within 6 m take 4 / 8 / 12% less from blows | allies' clients, from the room's word; the relay's body count applies it too |
| | **Challenger's Oath** | your threat x1.5 / 2 / 2.5; lords' blows on you -5 / 10 / 15% | relay (threat), client (blows) |
| **Blade** | **Searing Edge** | melee blows +3 / 6 / 9 fire | client; expected factor 1.04 / 1.07 / 1.10 |
| | **Momentum** | blows on one target +4% each, to 3 / 4 / 5 stacks | client; expected 1.05 / 1.07 / 1.09 |
| | **Sweeping Arc** | melee blows splash 20 / 35 / 50% to adds within 3 m of the target | relay (host hits) |
| | **Bloodied Fury** | under half health +10 / 18 / 25% damage | client; expected 1.03 / 1.05 / 1.07 |
| | **Culling Edge** | +30 / 45 / 60% on adds under a quarter health | relay (it knows the add's health) |
| **Hunt** | **Long Sight** | shafts and spells from beyond 12 m +8 / 14 / 20% | relay (it knows both poses) |
| | **Featherstep** | your crumbles wait +0.2 / 0.35 / 0.5 s; cast-backs cost 8 / 6 / 4% | client (crumbles are private) |
| | **Fade** | after you strike, adds lose you for 1.5 / 2.5 / 3.5 s, once every `EG_FADE_CD_S` 8 s | relay (targeting) |
| | **Hunter's Mark** | your first shaft on a foe marks it 8 s: the company deals +5 / 8 / 12% to it | relay |
| | **Fleetfoot** | run speed +4 / 7 / 10% | client (spans are laid for the span build) |
| **Arcana** | **Battlemage's Focus** | spell cost -10 / 18 / 25% | client |
| | **Overcharge** | spell blows +8 / 14 / 20% | client; expected 1.08 / 1.14 / 1.20 |
| | **Spellbane** | every resistance +10 / 18 / 25 | client (the saving throw) |
| | **Shieldweaver** | your Shield spell soaks +20 / 35 / 50% | client (`hurtPlayer`'s pool) |
| | **Arcane Echo** | a damage spell repeats at half, 10 / 16 / 22% of casts | client; expected 1.05 / 1.08 / 1.11 |
| **Fellowship** | **Rally** | when a hall's door opens, the company heals 8 / 14 / 20% | each client, from the room's word |
| | **Spire's Standard** | allies within 10 m +4 / 7 / 10% damage | relay (a factor while near) |
| | **Watchfire** | blows aimed within 12 m of you are told early to the company (below) | relay |
| | **Fallen's Due** | when an ally falls, the living deal +10 / 15 / 20% for the rest of the hall | relay |
| | **Steadfast Line** | with three allies within 8 m, you take 5 / 10 / 15% less | client, from poses; the relay's body count applies it too |

**Watchfire.** Every lord's brain commits each blow `EG_TELL_LEAD_MS` (400 ms) before its wind-up begins, whether or
not anyone holds Watchfire, so the blow's timing never depends on who does. The holder's company sees the early
outline as a PULSING solid crimson line, with a blue pip on the holder (a dashed line is a feint's). Blue on a danger shape reads as safe (WB13a
T8), so the warning is never blue. Rank sets how much of the lead is shown: 0.15 / 0.25 / 0.35 s.

**Stacking.** Eight holders of one aura are not eight auras:

- the same aura from several holders applies the strongest, plus 2% for each other holder, at most +6% over it;
- every Vestige's damage reduction together is at most 30%;
- the client-declared damage factors together are at most 1.25, and the relay-established ones at most 1.6.

**Resonance.** Three different Vestiges of one family (ranks do not count) grant that family's capstone, for the breach:

- **Stone, Rooted**: immune to push, and your threat doubles;
- **Blade, Bladestorm**: every fifth melee blow strikes every foe within 3 m (relay host hits);
- **Hunt, Deadeye**: a shaft from beyond 12 m pierces the add behind its target;
- **Arcana, Spellweave**: every fourth damage spell costs nothing;
- **Fellowship, Rallying Cry**: Rally's heal and every Second Wind in the company refresh when a hall's door opens.

**Death saves.** Divine Grace and the Ghost-King's Vigil (`src/systems/lootPowers.js`), and The Hour Turns (the Brass
of Numidium's) and Unbroken (Malacath's) (`src/systems/sigilSetPowers.js`), are not timers in the Spire. In an `eg:`
room each recovers at the next Redoubt taken, and its chip reads *Redoubt*. As timers they would make one life one a
minute, and the Brass of Numidium mandatory.

## 15. Redoubts, one life, the fallen, the Reliquaries

**A Redoubt is a checkpoint.** When a Court's lord falls, the Redoubt is taken for every living member at once.
Each **earner** gets an `e1` **receipt** (section 21). An earner, in that circle:

- dealt at least `1/(2n)` of the damage the company dealt in the circle (the relay's chart, lords and legion), *n*
  being the living company at its Court, or
- stood active (not idle `EG_IDLE_MS`, 60 s, in a trial) in at least three of its five halls.

The rule is the seam's `earned(f, sub)`, over the circle. An idle account pulled from hall to hall earns nothing (AUDIT
EG0 A6). A receipt banks:

- **the depth**: the Redoubt joins the member's taken Redoubts, this season and all time;
- **the week's spoils** of that Redoubt, rolled from the receipt's seed and thrown at the beacon like the gate's spew
  (section 17);
- **Marks**, and the embers section 17 pays;
- **a sealed Reliquary** (below);
- **the board's standing** (section 18).

**The rest** (`EG_REST_S` 90 s, the count held):

- health, magicka and fatigue restored (the room's word, each client its own body; half under Thin Rest). The relay's
  body count is restored with it, outside the mend budget;
- the Vestige offer (section 14);
- the next circle's decrees, shown on the beacon;
- **the recall** of the fallen (below);
- **the way home**: a gold arch beside the beacon. Stepping through ends the member's run, keeps everything, and
  OPENS their Reliquaries. It and a fall are the only ways out before the tear;
- **a respite**, at a Valkynaz's Redoubt (section 6);
- then the stair down opens, and the descent's law takes everyone left.

**The Reliquaries** are what a company risks. Each Redoubt taken seals one Reliquary into each earner's satchel: one
more spoils roll at that Redoubt's tier, at twice the Panoply chance.

- It opens only through the way home: the end receipt with `why:'home'` carries the count, rolled from that receipt's
  seed.
- A fall, the tear or a wipe loses every one.
- The HUD shows them: *Reliquaries: 4*.
- Every Redoubt is now the question the Spire was built to ask: walk home with four, or push for a fifth. One member
  walking home weakens the company, and that is the social tension a company of eight should feel.

**One life, one recall.** A death in the Spire (the pose's `dd`), or 180 s gone in a trial, is a FALL:

- the fallen's Reliquaries are lost, and their lord's share is retired;
- they become a **witness** (below);
- **THE RECALL**: the next Redoubt the living take re-admits each fallen member, ONCE a breach. They return at the
  rest with full health. They earn nothing for the circle they were out, and their newest Vestige is lost. A second
  fall is final: *The Spire will not take you back.*;
- **a wipe** (no living member) ends the breach: there is no one to take the Redoubt;
- **solo stays literally one life**: no one living can recall you;
- **no Resurrect** in the Spire (SD-ONELIFE's reason: a body raised in place stands in a fight its death has left).
  **No DEATH-PENALTY** either: that is the port's own (Ledger A, AN ONLINE DEATH COSTS A TENTH OF THE PURSE), and the
  world host's respawn runs it before it reads the realm. EG10 exempts a Spire fall there.

This reads Mac's *"Checkpoints"* as what a death costs, and *"one life on the line"* as the company's: a fall costs the
fallen their spoils at risk and the company a member until the next Redoubt. Losing the whole company still costs the
run. The purist keeps a mark of their own: a company that takes Redoubt 10 with no fall, in a breach begun at Hall 1, holds the
title *the Unfallen* and a flame on its board row (section 18).

**The witness.** The fallen stay in `eg:<b>` as witnesses:

- no body and no blows (the room already refuses them);
- the camera rides a living member's relayed pose over the hall built from the spec;
- a ping every 10 s, a blue mark the living see;
- **a bequest**: at the fall, the fallen names one of their Vestiges. It joins the living's offers at the next
  Redoubt as a fourth card;
- **forsaking**: a witness may forsake the breach. Their end receipt is minted, `eg_live` is cleared, and the recall
  is forfeited. Nobody is held in a run they no longer want.

**Starting deeper.** A breach may start at any Redoubt its opener may start at:

- any Redoubt they have taken this season;
- or, until they take one this season, `floor(best / 2)` of their all-time best.

Every member must be able to start there too, or the admit is refused: *You have not taken Redoubt 12 this season.*
No carries: a member who has not reached the start cannot be brought past it. The ratchet is per season, so a new
season's first breaches start at half depth and the season's boards start level.

## 16. Depth - what grows, and the wall

**Mechanics first, and nothing faster.** Balance-Arc: *"a band-aid is a multiplier on every foe's health"*. Mac at
WBX: *"I dont think making mechanics faster is the play"*. What grows with the circle *c*, in the order a company
feels it:

1. **decrees**: none, then one to four, then ranks (section 13);
2. **new kinds, pieces and lords**, by band (sections 7, 10, 11, 12);
3. **more at once**: a rift's wave every `max(9, 20 - 0.5(c-1))` s; the legion's cap `clamp(2 + ceil(1.5n) +
   floor((c-1)/5), 3, 14)`; spans combining pieces with fewer islands;
4. **the Wellhead's tides**: past circle 20, one tide a circle, from four:
   - **The Wellhead Erupts**: vents in every court;
   - **Clan Feud**: a Court's lord comes with its band's champion beside it (a host body with the Proving champion's
     kit, on the lord's own ground: one seam, one fight);
   - **Kyn Levy**: every hall begins with a Kynval squad;
   - **Hungering Dark**: the rest heals half and Rally a third;
5. **numbers, gently**: lord health `ttkRef(c)` (x1.07 a circle, x1.03 past 20); add health `x (1 + 0.04(c-1))`;
   shares `x (1 + 0.03(c-1))` within the 1.5 cap;
6. **fury**, for a company slow against its lord: waves and chained blows, never speed (section 12).

All of it is bounded by THE WIND-UP FLOOR, THE UNION FLOOR, THE CHECK CLASS and THE ERRAND FLOOR (section 12), and THE
ENVELOPE and THE TIMED SOLVER (section 10). Nothing shortens a wind-up, a beat, a crumble or a period below its value
at Redoubt 0.

**The lords' clock** (`ttkRef`, at the company's reference damage and at the trust law's cap, the gate's `(TTK -
BUCKET_DEPTH_X) / BUCKET_RATE_X`, before and with the Vestiges' 1.25):

| circle | Redoubt | ttkRef | at reference | at the cap | at the cap, Vestiges 1.25 |
|---|---|---|---|---|---|
| 1 | 1 | 180 s | 3:00 | 55 s | 43 s |
| 5 | 5 | 236 s | 3:56 | 1:14 | 58 s |
| 10 | 10 | 331 s | 5:31 | 1:45 | 1:23 |
| 15 | 15 | 464 s | 7:44 | 2:30 | 1:59 |
| 20 | 20 | 651 s | 10:51 | 3:32 | 2:49 |
| 25 | 25 | 755 s | 12:35 | 4:07 | 3:16 |
| 30 | 30 | 875 s | 14:35 | 4:47 | 3:48 |

**The wall is the count and the last word.** The model below is AUDIT EG0's simulation (lane 2), re-run under the
revised rules:

- the count starts when the first hall wakes, and the rest holds it;
- lord health grows x1.03 a circle past 20;
- rifts hold 12 s each;
- at most four decrees;
- the Vestiges' 1.25.

Its assumptions:

- a trial is a fixed part (traversal and errands: 55 s, growing with pieces and decrees) plus a damage part (70 s at
  reference, growing with add health, cadence and decrees, over the company's damage);
- 29 s of gather, descent and stair a hall;
- 26 s of shields and approach a Court;
- a 90 s rest;
- 80% uptime.

Company size drops out, since every health is counted per fighter. EG21 measures it in the field.

| company | last Redoubt in one breach from Hall 1 | stopped by | with the count alone (no last word) |
|---|---|---|---|
| at reference damage | about 5 (Hall 25) | the count, at about 100 min | 5 |
| at twice reference | about 11 (Hall 55) | the last word | 14 |
| at the cap (3x) | about 12 (Hall 60) | the last word | 20 |
| at the cap with Vestiges | about 14 (Hall 70) | the last word | 32 |

So from Hall 1, one breach reaches the Soul Cairn at reference and ten halls into the Shade at the cap. **The
last word, not the count, stops a strong company.** **Starting deeper is how the Wellhead is reached.** A company that
starts at its deepest Redoubt gets a fresh thirty minutes at depth, and the count alone stops a cap company around
Redoubt 20-32. That is where the board's deepest rows will stand. No law sets a ceiling: the trust law sets the cap,
the count sets the pace, and the floors keep every blow readable. How far a company gets is how well it plays.

## 17. Rewards and the economy

**What a Redoubt pays**, to each earner, at the claim of their `e1` receipt. **A Redoubt's number pays once per
account per arena week** (the season's weeks, `arenaSeasonOf`). Taken again in the same week it pays gold alone. This
is also the weekly reason to come back. Without it, a company with keys could farm one Redoubt daily (AUDIT EG0 G6).

| what | how much | its law |
|---|---|---|
| **spoils** | rolled on the receipt's seed and thrown at the beacon: `rollEgSpoils(seed, level, w)` | below |
| **a Reliquary** | sealed; opens at the way home | section 15 |
| **Marks** | 20 | a new faucet, `MARKS_FAUCETS.eg` (`eg` joins `MARKS_COMBAT.kinds`), inside `MARKS_COMBAT.perDay` (150), shared with the gate, the raids and the serpent (`src/net/marksLaw.js`) |
| **a guild's deed** | 25 to the treasury, when three members of one guild, each 7 days in it (`tenureS`), take the same Redoubt | the gate's deed law, at most 4 a guild a day |
| **Deadlands Embers** | at a Valkynaz's Redoubt, `1 + floor(w/10)`; and 1 for each Redoubt taken for the first time this season | the Broker's currency (`BROKER_PRICES`, `src/systems/sigilBroker.js`). The Spire's embers join `EMBERS_EARNED_SQL` (today gate and serpent embers alone), so the insignia and the sink spend them |

Embers are paid where they are earned, not by the hour. A gate pays one or two. The insignia (30 and 50 embers, Mac's
*"expensive and sought after"*) stay a season's work, not a week's.

**The spoils** (`systems/egSpoils.js`, in `rollSdSpoils`' order; every new draw after the last, as SET6's law requires):

- gold;
- one Rare or Legendary piece; the Legendary's chance is 20% at Redoubt 1, +3% a Redoubt, to 65%;
- one to three `magicOrBetter`;
- **a Panoply piece**: 1 in `max(4, 12 - floor(w/2))`, so 1 in 12 at Redoubt 1 and 1 in 4 from Redoubt 16; **1 in 3**
  at a Valkynaz's Redoubt;
- **the lord's card**: `bossCardRoll(bossKey, rolls)`, each lord its own key in `BOSS_CARDS` (`src/systems/bossCards.js`,
  which holds one card per kind today: gate, serpent, abyss), and in `BOSS_CARD_PER_MILLE` at 200, the gate's rate (a key missing there never drops);
- sockets, gems and the technique pass, as the gate's.

A Valkynaz's Redoubt rolls its spoils **twice**, two seeds from the receipt's. At 1 in 3 each, a Panoply piece comes
5 times in 9.

**The pity count.** The service counts each account's Panoply misses (`eg_pity`). After 10 rolls without a piece, the
next roll gives one.

**The sink.** The Sigil Broker sells one Panoply piece of the buyer's choice, once an account a week, for 20 Deadlands
Embers. It is a new law and the service's (`eg_sink`), not her day's stock: SET7's stock is the day's, shared, and
kept by the client.

**THE BATTLEMAGE'S PANOPLY**: the war-gear the Imperial Battlemages wore in the Spire, taken by the Kyn. Nine Aetheric
pieces of Mithril make, light enough for a spellsword. It is a Sigil Set: each piece's sigil names the set, and the
set's stage is its lowest worn piece's (`Sigil-Sets.md` section 2), levelled as a whole (`Sigil-Sets.md` section 5).

| piece | template |
|---|---|
| The Battlemage's Warhelm | Helm |
| The Battlemage's Right Pauldron, The Battlemage's Left Pauldron | Pauldrons |
| The Battlemage's Cuirass | Cuirass |
| The Battlemage's Gauntlets | Gauntlets |
| The Battlemage's Greaves | Greaves |
| The Battlemage's Boots | Boots |
| The Spire-Shield | Kite Shield |
| The Spire-Saber | Saber |

| pieces | ability | Faint -> Ascendant |
|---|---|---|
| 2 | **Battlemage's Bearing**: every resistance, and your magicka | +5 -> +15; +10 -> +30 magicka |
| 4 | **Battlemage's Discipline**: a spell cast arms your next weapon blow with its element; a weapon blow returns some of your last spell's cost | +20% -> +50% of the blow; 5% -> 15% of the cost |
| 6 | **Battlemage's Reprieve**: a blow that takes you under 20% (never a killing blow) raises a shield that soaks part of your max health for 6 s, half of it shared with allies within 8 m; then it must recover | 15% -> 40%; recovers 240 -> 120 s |

**No Gilded piece.** Mac, of the Hourlock: *"The most rare and gilded item in the entire game"*. GILDED1 made it the
one, and the Spire's top drop is the Panoply.

**The honours** (service-recorded: `players.eg_honours` bits, beside the deepest Redoubts). They are added as
`server-account/src/titles.js` adds every honour:

- the id in `TITLES`/`AURAS` (in `src/net/identityToken.js`, which is in the relay bundle, so this takes a relay
  version);
- the branch in `titlesHeld`/`aurasHeld`;
- the words in `src/ui/playerBadge.js`.

| at | title | aura |
|---|---|---|
| Redoubt 2 (Hall 10) | **Spirewalker** | - |
| Redoubt 5 (Hall 25, the first Valkynaz) | **Beacon-Lighter** | - |
| Redoubt 10 (Hall 50) | **Kynbane** | **Beaconlight** (gold-white motes) |
| Redoubt 10 with no fall, in a breach begun at Hall 1 | **the Unfallen** | - |
| Redoubt 15 (Hall 75) | **Battlemage of the Spire** | - |
| Redoubt 20 (Hall 100) | **Wellhead-Walker** | **The Burning Stair** (falling embers) |
| a season's top ten on the Descent, any bracket (section 18) | **Spire Champion**, held through the next season | - |
| the first company ever to take Redoubt 10 | **First of the Spire** | **Firstlight** |

*First of the Spire* is granted as *Hour's First* was: a list in the service's config, and the mailbox. Titles are
earned, never bought. The Broker's insignia stay the gate's.

## 18. The boards and the herald

**The boards** (`/v1/eg/board`, `egBoardOf`). The season is the arena's (`arenaSeasonOf` in `src/net/arenaLaw.js`,
eight weeks). Rows come from `topWithMe`, which EG14 exports from `server-account/src/arena.js` (it is private today),
and names from `boardNamesOf`; `iliacBoardOf` is the precedent.

| board | who | ranked by | the row |
|---|---|---|---|
| **The Descent** | three brackets: Alone (1), the Few (2-4), the Company (5-8) | the deepest hall cleared in one breach BEGUN AT HALL 1, this season; then the fewest seconds from Hall 1's wake to that hall's door | the company's names (up to 8), the band, the Unfallen's flame |
| **The Depths** | every account | the deepest hall cleared this season, from any start | the name, the hall, the start Redoubt |
| **The Deepest Redoubts** | every account, all time | the deepest Redoubt ever taken | the name, the Redoubt, when |

- **The Descent is "how far with one life"**: the same thirty minutes and the same Hall 1 for every company. The
  start-Redoubt ratchet cannot buy a row there (AUDIT EG0 A12). The Depths is the ratchet's board.
- **Clearing**: a hall counts when the relay clears it (sections 7 and 19), whether or not the next Redoubt was taken.
- **Who counts**: a company's size counts its earning entrants. The receipt carries `co` (the company's subs), and a
  company's row takes the deepest `h` of its members.
- **Champions**: each bracket's top ten at a season's end hold *Spire Champion* through the next season
  (`iliacHonoursOf`'s pattern).

**The herald** (`net/egHerald.js`: pure builders, as `src/net/gateHerald.js` is). It uses the gate's webhook and the
gate's role as the fallback the Hour's and the serpent's use, with no ping:

- a company taking Redoubt 10, 20, 30...: *<opener>'s company took Redoubt 10 of the Battlespire (Hall 50) in
  1:42:10.*;
- a new top of the Descent in any bracket;
- *First of the Spire*.

An opening is never heralded: a company's breach is its own.

## 19. Integrity - what the relay judges

The gate's trust law, kept whole, and where it was not enough, widened:

- **Blows on lords and the legion**: `applyHit`'s hand and purse, the bucket by the level claim times the Vestiges'
  capped factor, a melee pose within reach, from the hall's floor. The blow's kind `r` is the client's word (`HIT_KINDS`),
  so a Vestige that reads it must not gain from a lie. Sweeping Arc and Bladestorm read melee, and the relay already
  checks a melee blow's reach. Long Sight, Hunter's Mark and Deadeye read shafts and spells, and also need more than
  12 m between the poses, where a forged kind gains nothing a real one would not. The lean reads it too, and changes no
  damage.
- **The lords' blows on members**: ONE judge for every shape. `src/net/bossRef.js` holds a judge for each boss
  (`judgeGate`, `judgeRemnant`, `judgeSerpent`).
  - Every Spire blow travels with a FULL shape stamp, its kind and every number, which is new. The Remnant's
    `shapeStamp` carries only what its marks changed.
  - So one `judgeShapes` tests any blow, per fight floor (section 10.6), against the pose trails the relay holds (`posAt`/`posAfter`, `deepIn`,
    `BODY_AFTER_MS`) and feeds `src/net/bossBody.js` (`bodyStruck`, `bodyCensus`).
- **A span's end**: `spanFair`.
  - The relay's body trails (`BODY_TRAIL_MS` 2000, `BODY_TRAIL_MAX` 24) are seconds long, and a crossing takes tens of
    seconds. So `spanFair` is an ONLINE accumulator the room keeps per member: the fastest step, air time since the
    last support, the last checkpoint.
  - It is checkpointed. After a wake, it restarts as "fair from the next island".
  - A pose within 0.3 m of a platform's top must lie inside that platform's footprint at that time (`stepAt` and
    `beatStands` on the anchored clock).
  - No airborne stretch may pass `EG_AIR_MAX_S` (2.5 s).
  - The crossing must take at least `EG_CROSS_MIN(spec)`, from the solver.
  - In a fragment, a pose near a floor's height must lie inside that floor's polygon (section 10.7).
  - Poses between a member's `down` and their next `here` are never judged; a pose sent mid-stair belongs to no hall.
  - An unfair trail opens no door, and its measures ride the receipt (`m`).
- **The descent**: `down` is accepted only within 3 m of the door.
- **A hall cleared**: only the relay says so (the legion broken, the lock solved, the champion or the lord fallen, a
  fair end).
- **The board and the Redoubts**: from receipts alone. The service never takes a client's word for a depth.
- **The key**: the service's balance and stake (sections 5 and 21).
- **The body count**: the relay's count applies Bastion, Challenger's Oath and Steadfast Line itself, and the rest
  restores it, so holders do not drain their budgets or skew the measures staff read.

A modified client can still refuse to take damage (a player owns their body). Under `BOSS_BODY` enforcement, the
relay's count fells it as it fells a gate's fighter. The Spire's boards are measured with enforcement on: EG14 turns it
on for `eg:` rooms when the boards open, whatever the gate's setting.

## 20. Failure and recovery

A breach is a three-hour instance on infrastructure that restarts. Every failure has a rule (AUDIT EG0 A5, A10, A17).

**A deploy.** `.github/workflows/relay-deploy.yml` drops every socket and restarts every Durable Object. The client deploys on every
merge; the relay waits out the siege blackout. So:

- **THE DRAIN**: the relay deploy waits on `/v1/eg/live`, as it waits on `/v1/seats/sieges/live`.
  - Once the deploy sets the service's drain flag, opens are refused: *The Spire is closed for a while.*
  - The deploy waits until no breach is live, or the last word of the longest has passed.
  - A `force` deploy voids every live breach. Their stakes are returned, and their Redoubts taken stay taken.
- **A LAW PIN PER BREACH**: the breach records `egv`, the spec law it was opened under.
  - Both sides keep `EG_LAWS` (the current law and the one before) for `egHallOf` and `courseOf`. A client deployed
    ahead of the relay still draws the breach's own halls.
  - Frames are self-describing (a full shape stamp), so a brain's tuning needs no pin.
  - A woken relay that does not know a breach's `egv` ends it with `why:'void'`: the stake is returned, and the
    Redoubts taken stay.

**A restart or an eviction.** A Durable Object can be evicted or restarted at any time.

- **Checkpoints**: the gate's `CHECKPOINT_MS` (2 s), and also a forced checkpoint at the open, every admission, every
  beat change, a fall, a pick and the end, and at a Redoubt BEFORE its receipts go out.
- **Deterministic receipts**: their seeds come from the breach's seed, the member and the Redoubt, and they are kept,
  so a re-woken room sends the same receipt and never a second roll.
- **Storage, not memory**: offers, picks, spent order ids, the fallen, the witnesses, the Reliquaries, the `spanFair`
  accumulators and the Athenaeum's hall all live in storage (hibernation keeps nothing else).
- **Time survives the restart**: a member's absence is counted from `max(lastSeen, wakeAt)`, and any beat gap over
  `EG_GAP_MS` (2 s) is added to the count and to the hall's timers.

**A dropped socket.** A closed socket would drop its body from the census, and returning at the arrival plate would
dodge a 999% blow. So the body stays at its last pose for the absence window, takes what lands there, and resumes
there.

**A reload.** Saves are refused inside (the court's law, WBX W6), so a reloaded page boots outside. `/v1/eg/keys`
answers the account's live breach, and the world host offers *Return to the Spire*: a hello as an entrant (no new
order). During a trial the body resumes at its last pose, where it never stopped standing (the socket flap rule);
between trials, at the current hall's arrival plate.

**Unknown rooms.** An `eg:<16hex>` the hub never opened writes nothing and arms no alarm, except a void (section 21),
which writes its one tombstone.

**The cost.** One Durable Object per breach, awake for up to three hours. So:

- the beat is 250 ms only while a trial runs, 1 s otherwise, and none while the arch rises;
- the hub enforces `EG_LIVE_MAX` (64) live breaches at once;
- every breach ends at the last word.

## 21. The wire

**The room family.** `eg:<16 hex>`, the breach id the service mints with the open order.

- **The key law**: `isEgRoom` (`/^eg:[0-9a-f]{16}$/`) in `net/egLaw.js`.
- **The Worker's prefix gate**: a `startsWith('eg:')` line beside `gate:` and `sd:`, so an unknown key mints no
  object.
- **The tick**: `_egTick`, in the `alarm()` chain before `_alarmRest`.
- **Presence**: the room is each entrant's presence room for the whole breach (`roomIdentity` `{kind:'eg', b}`).

**Opening runs through the hub** (AUDIT EG0 A4). The hub holds every client's socket and every party's roster.

1. The client sends `{t:'eg', k:'open', z, site}` to the hub.
2. The hub verifies the order, freezes the company from its own `party:` record, and checks `EG_LIVE_MAX` and the
   drain.
3. It forwards the order, the company and the arch's site to `eg:<b>` by internal fetch (`EG_INTERNAL_OPEN`), the
   DO-to-DO pattern `_wdunKinOf` uses.
4. It keeps `eglive:<sub>` for each member, and tells the company the call (`k:'call'`) on the party channel.
5. Receipts for a member with no socket in the room are held by the hub as `egrc:<sub>` for their next hello, under
   the gate's receipt law (the `gaterc` sweep, widened by one prefix).

**Orders**, signed by the service with `IDENTITY_PRIVATE_KEY` and checked by the relay with `verifyOrder` against
`IDENTITY_PUBLIC_KEY` (`src/net/identityToken.js`). Every order already carries `i` and `e` (issued and expires, at
most `ORDER_TTL_S` 60 s apart). `egopen` and `egadmit` join the frozen `ORDER_KINDS`, which is a relay-bundle edit and
a version. Their fields are `EG_ORDER_FIELDS`, exclusive as `STAKE_FIELDS` are, so no other kind carries them and they
carry no other kind's. The first draft's `st` is a siege pass field (`SIEGE_PASS_FIELDS`) and would have been refused.

| order | fields | life |
|---|---|---|
| `o:'egopen'` | `s` (the opener's sub), `eb` (the breach id), `ez` (the order id, `[a-z0-9]{16,32}`), `ew` (the start Redoubt), `i`, `e` | 60 s |
| `o:'egadmit'` | `s` (the member's sub), `eb`, `ez`, `ew`, `i`, `e` | 60 s |

The room checks `eb` against its own key, `s` against the hello's subject, `ew` against the breach's, and spends `ez`
once.

**The stake** (AUDIT EG0 A1; CARDS6's void law). The key is never returned by a clock:

- **Open** (`/v1/eg/open`) is idempotent on the client's request id `rq`. A crashed client asking again gets the same
  order back. One conditional `UPDATE ... RETURNING` (the insignia-spend pattern) takes one key, writes the stake
  `eg_stakes(ez, account, b, until, state)` and sets `eg_live`.
- **SPENT**: on the first `w` naming its `ez`, or the first `x` whose `why` is not `'void'`.
- **RETURNED**: on a relay-signed **void** (`e1`, kind `'v'`), or an `x` with `why:'void'`, even after `w` receipts
  (a force deploy, an unknown `egv`: the company keeps its Redoubts and the opener gets the key back). `eg:<b>` mints a
  void for an order it never accepted. It writes the order spent first, as `_holdemVoid` does, so it can never accept
  it after.
- **The clock** spends a stake only after `EG_VOID_MAX_S` (7 days) with no receipt naming it.
- **The opening** is the moment the room accepts the open order, when the arch begins to rise. A stake's `until`, and
  `eg_live`'s, is the opening plus `EG_LAST_WORD_MIN` plus `EG_LIVE_SLACK` (10 min): about 3 h 10 min.
- **The tombstone**: after the end the room keeps `egdone` for `EG_VOID_MAX_S` (7 days) and refuses older voids (the
  `HOLDEM_STAKE_VOID_S` precedent).

**`eg_live`** (AUDIT EG0 A2) is `{b, until}`, `until` being the stake's. `/v1/eg/open` and `/v1/eg/admit` each write
it in one conditional `UPDATE` (`WHERE eg_live IS NULL OR b = ? OR until < now`). An end receipt or a void clears it,
and a lapsed one counts as clear. No lost receipt can lock an account out.

**The arch on the cell.** The opener's client says the arch on its world cell (`{t:'eg', k:'arch', b, x, z, yaw, px,
py, riseAt, openAt, o}`) on full frames while it stands there, as `portalWire` rides a peer's frame. Peers stand the
arch from it until the open window ends. The relay reads none of it, and admission never depends on seeing it.

**Frames** (`{t:'eg', k, ...}`; `EG_KINDS` and `EG_OUT_KINDS` in `src/net/wire.js`, each with its validator):

| frame | way | what |
|---|---|---|
| `{k:'open', z, site}` | opener -> hub | the open order and the arch's site |
| `{k:'call', b, ew, site, riseAt, openAt}` | hub -> the company | the call (section 6) |
| `{k:'in', z, lv}` | member -> room | the admit order and the level claim (frozen at the first admission) |
| `{k:'here', h}` / `{k:'down'}` | member -> room | arrived in hall `h` / stepped through the door |
| `{k:'st', ...}` | room -> all | the breach: seed, `egv`, hall, kind, slot, twist, beat, the count's end, the company (each `m1..`: alive, witness, home, forsaken), each member's Reliquaries, the decrees, the arch's site |
| `{k:'wake', at}` / `{k:'door', at, until}` | room -> all | the trial begins / the door opens and the descent ends |
| `{k:'hit', q, d, r}` / `{k:'ahit', i, q, d, r}` | member -> room | a blow on the lord / on add `i` |
| `ad`, `amv`, `aatk`, `ah`, `adie` | room -> all | the legion (the Legion-Lord's frames) |
| `{k:'atk', i, a, sh, at, f}` | room -> all | a lord's blow: the body, the attack, its full shape, when it lands, a feint flag |
| `{k:'tell', i, a, sh, at}` | room -> a Watchfire holder's company | the blow told early (section 14) |
| `hp`, `ph`, `fury`, `fell` | room -> all | the lord's bar, phase, fury and fall |
| `{k:'pz', ...}` | member -> room | an Athenaeum turn (the Orrery's `SD_PZ_*` bounds) |
| `{k:'redoubt', w}` | room -> all | the Redoubt taken |
| `{k:'rcpt', r}` | room -> one | that member's `e1` |
| `{k:'offer', v:[...]}` / `{k:'pick', v}` | room -> one / one -> room | the Vestiges |
| `{k:'surplus', use}` | member -> room | a Surplus spent (a fourth card, or a reroll) |
| `{k:'respite', y}` | member -> room | a vote for a respite |
| `{k:'ping', x, z}` / `{k:'bequest', v}` / `{k:'forsake'}` | witness -> room | the witness's acts |
| `{k:'home'}` | member -> room | the way home |
| `{k:'void', z}` | client -> room | an order never accepted, asked to be voided |
| `{k:'end', why}` | room -> all | why: `'tear'` (the count spent), `'gone'` (every member out: fallen twice, forsaken or home), `'last'` (the last word) or `'void'` (a force deploy, an unknown `egv`) |

**The receipt** `e1` (`net/egReceipt.js`: `mintEgReceipt`/`verifyEgReceipt`, signed by `GATE_SIGNING_KEY` as every
relay receipt is):

| kind | claims |
|---|---|
| `k:'w'`, a Redoubt taken | `b`, `w` (the Redoubt), `h` (the hall), `s` (the sub), `c` (the seed), `x` (the share dealt), `t` (seconds since the first hall woke), `n` (earning entrants), `st` (the start Redoubt), `vs` (the Vestiges), `m` (the measures), `z` (the order id), `co` (the company's subs) |
| `k:'x'`, the member's end | `b`, `h` (the deepest hall cleared), `s`, `t`, `n`, `st`, `co`, `rl` (Reliquaries opened, with `why:'home'`), `c` (their seed), `why` (`'fall'` (a final fall), `'home'`, `'tear'`, `'last'`, `'forsake'`, `'empty'` (the opener's, when nobody was admitted before the open window ended) or `'void'`), `z`. A first fall, which a recall can undo, mints no `x` |
| `k:'v'`, a void | `b`, `z`, `s` (the opener) |

**The account service** (EG2, EG8, EG14):

| route | does |
|---|---|
| `/v1/eg/keys` | the balance and the live breach, for restacking and *Return to the Spire* |
| `/v1/eg/find` | a dungeon's find: the tier, the roll, the caps |
| `/v1/eg/open` | idempotent on `rq`: stakes one, signs `egopen`, sets `eg_live` |
| `/v1/eg/admit` | checks the handle, the start Redoubt and `eg_live`; signs `egadmit`; sets `eg_live` |
| `/v1/eg/claim` | `claimEg`: verifies `e1`, refuses another's, answers guests `guest`. For `w`: one row in `eg_redoubts (b, account, w)` with its embers, the week's pay, Marks, the deed, the depth, the honours, the pity. For `x`: `eg_runs (b, account)`, the board's row, the Reliquaries, settles the stake, clears `eg_live`. For `v`: returns the stake |
| `/v1/eg/board` | `egBoardOf` |
| `/v1/eg/live` | the drain's question: any breach live, and until when |

**Migrations**: the next free numbers when each slice lands, today 0109 (EG2: `players.eg_keys`, `eg_finds`, the
launch gift) and 0110-0111 (EG8 and EG14: `eg_stakes`, `players.eg_live`, `eg_redoubts`, `eg_runs`, `eg_pity`, the
depths and `eg_honours`).

**Versions.** Each slice that moves the relay bundle bumps `RELAY_VERSION` (`world192` when this page was revised) with its `LAW` row,
and a game that does not know it is told to reload. Each that moves the service bumps `ACCOUNT_VERSION` (`acct112` then).
The new titles and auras join `TITLES` and `AURAS` in `src/net/identityToken.js`.

## 22. The made level's rules

The world host gates the court and the Hour at many separate sites today: 19 for `gateArenaDay` and 38 for
`sdRealmSlot` in `src/scenes/world.js`. A third made level would add a third copy of each, and one would be forgotten
(THE FOUR HOSTS RULE's own failure). EG7 makes them one law:

- `madeLevelOf(loc)` answers `'court'`, `'hour'`, `'spire'` or null;
- a table, `MADE_LEVEL_RULES`, says what each turns off;
- a source-sweep test refuses any new per-level check outside it (THE ONE CONSTRUCTION SEAM).

The court and the Hour are re-plugged with their behaviour unchanged.

| rule | court | hour | spire |
|---|---|---|---|
| saves (the exit autosave included) | refused | refused | refused |
| rest, the travel map's journeys | refused | refused | refused |
| the automap | off | off | off |
| Mark and Recall | refused | refused | refused |
| the Portal Stone | refused | refused | refused |
| companions (GATE-ALONE, SD-ALONE) | kept out | kept out | kept out |
| natural regeneration (`courtRules`) | off | as today | off |
| Levitate | as today | banned | banned |
| Slowfall | as today | as today | banned |
| Resurrect | as today | refused | refused |
| a death | cast out | final for the Hollow | a fall (section 15) |
| DEATH-PENALTY | as today | as today | none |

**The world's clock does not stop.** The shared clock turns during a three-hour breach (a game day and a half). A
quest's deadline can lapse inside, which is why the start window warns of it (section 5).

## 23. The look

SD-LOOK's four rules are kept (`Super-Dungeons-Look.md`): the void is dark, structure does not glow, light appears only
where it means something, and every surface reads as Daggerfall pixel art. Textures are painted in code into the
Spire's pseudo-archives, free today from **38231** (after the merchant yard's 38221):

- 38231-38239: the arch, the key and the beacon;
- 38241-38249: the Galleries;
- 38251-38259: the Cairn;
- 38261-38269: the Shade;
- 38271-38279: the Wellhead.

**Five lights, five meanings, and no others:**

| light | means | where |
|---|---|---|
| **gold** | the way, and safety | arrival and end plates, doors, the Redoubt's beacon, checkpoint islands, havens, the way home |
| **Dagon red** | his blows | every telegraph (the pass's `dagon` style and its elements) |
| **Battlemage blue** | yours | Vestiges, allies' auras, the company's marks over heads, a witness's ping, the Watchfire holder's pip |
| **white** | the place's own timed hazard | vents ringing, pendulums' lanes, a Beat's blink |
| **the band's own** | where you are | soul-gem violet in the Cairn, moon-silver in the Shade, molten orange in the Wellhead; the Galleries keep marble and gold |

**The bands' ramps** (sRGB, at least five steps each, as SD-LOOK's are):

- the Galleries: marble `[150,146,138]`-`[214,210,200]`, gold leaf `[140,98,40]`-`[246,206,120]` (the Hour's brass,
  reused), Battlemage blue `[36,52,96]`-`[92,124,196]`, the Deadlands' red sky;
- the Cairn: slate violet `[34,28,44]`-`[120,108,140]`, soul-light `[120,200,230]`;
- the Shade: `[6,6,10]`-`[60,64,80]`, moon-silver `[160,166,176]`-`[214,220,228]`;
- the Wellhead: basalt (SD-LOOK's) and iron, molten `[255,120,30]`.

**The telegraph pass** (`src/render/gateTelegraph.js`). Three new kinds join `TELEGRAPH_KIND`, each a seam whose default
draws the gate's own:

- **haven**: a gold disc that is safe while everything else fills red;
- **lanes**: parallel lanes, a Lattice;
- **tether**: a line between two bodies.

The pass draws ONE shape a call. It is widened to draw up to 24 shapes a frame, one call each, so a Court's blows and
a legion's can stand at once. `TELEGRAPH_POINTS_MAX` (10) and `TELEGRAPH_SPOKES_MAX` (8) stay per-shape limits.

**Readability.**

- In the Shade's dark, telegraphs keep their full light and every foe keeps a rim light. Darkness takes the floor,
  never the warning or the foe.
- **Accessibility**:
  - havens wear a dark keyline and inward chevrons, so they never rely on gold against red, a deuteranopia pair (white
    is the place's timed hazard, never a haven);
  - danger shapes keep their grain;
  - the Examination's order is told by numerals and a chime per rune as well as light;
  - every blow aimed at you, a lord's or an add's, gives you a personal audio sting.

**Fragments** (section 10): painted in each band's kit. The Caverns' fire falls are Daggerfall's own TEXTURE.356, and
magma is the band's molten orange, darker than Dagon's crimson.

**The arch** (section 6) and **the stair** between halls: the veil plays the fall past the Spire's broken underside,
its marble ribs and hanging chains, to the next hall's gold plate. It lasts 1.2 s, frame-synced, the same every time.

**Phones** (TI2): the HUD sits in the gate's boss-bar row (`src/ui/gateBossBar.js`, whose `bossBarModel` takes a Spire
model), and a Redoubt's rest window is one column.

## 24. The score

Written as notes for the game's own player and FM bank, in `systems/egScore.js`. Each score module writes its own
`makeSong`, as `src/systems/sdScore.js` and `src/systems/gateScore.js` do. The key is E Phrygian, the Kyn's colour
against the Imperial brass: the Battlemages' fanfare, broken, answered by the legion's drums. A pure law,
`spireScoreFor(place)`, chooses the song. The names are 8-character stems, as every made song's are (GATEWAR1,
HOURWAR1):

| song | where | tempo / length |
|---|---|---|
| SPIREGAL | the Galleries' halls | 100 BPM, 32 bars |
| SPIRECRN | the Cairn's halls | 88 BPM, 32 bars |
| SPIRESHD | the Shade's halls | 92 BPM, 32 bars |
| SPIREWEL | the Wellhead's halls | 110 BPM, 32 bars |
| SPIREYRD | a Rift-Yard's or a Rampart's trial (the band's motif in the brass) | 132 BPM, 32 bars |
| SPIRLRD1 / 2 / 3 | a Court, by phase | 138 / 144 / 152 BPM, 32 bars each |
| SPIRVALK | a Valkynaz, all phases, rising | 148 BPM, 48 bars |
| SPIRREDT | a Redoubt taken, and its rest: the Battlemages' hymn | 72 BPM, 16 bars |
| SPIRECNT | the count's last 2 minutes, over anything | 160 BPM, 16 bars |
| SPIREEND | the tear, a fall, the end | 70 BPM, 12 bars |

The songs are measured as the Hour's were, by `egScoreProbe.mjs` (under tools/, `tools/sdScoreProbe.mjs`'s law):
every song sounding, peaks under the ceiling, the war louder by phase, and the end decaying in its time.

## 25. The HUD and the first breach

**The HUD** (the boss-bar row, section 23):

- the count;
- the hall and its band;
- the Reliquaries;
- the decrees (icons, with their words on hover or hold);
- the company's pips (alive, witness, home, forsaken);
- on spans, a *last across* warning and the descent's ring;
- at a Court, the lord's bar with its phase marks, ward and fury.

**The first breach.** An account's first breach opens with a card of four lines: *The count. The Redoubts. One life,
one recall. Reliquaries open only on the way home.* Its first circle is the fixed one (section 7).

**Words.** Lines are short (Mac at WB12: *"less explanatory and less AI"*). Every player-facing line is a constant in
`EG_TEXT`, worded once and pinned.

## 26. The four hosts

- `src/scenes/world.js` - WIRED:
  - the key's arm and its refusals; the start window; the arch pool (`egArchPool`, the gate pool's law); the call's
    vortex;
  - the Timers row, the sight line, the company's map mark;
  - the hub's open and the room link; each hall's transition;
  - the HUD and the rest window; the claim queue (`createEgClaims`); *Return to the Spire*;
  - the score and the Spire's reverb law; the flight bans (OR'd into the one ward registration); no Resurrect; a death
    as a fall;
  - DEATH-PENALTY exempted; the witness's camera.
- `src/scenes/worldModes.js` - WIRED: `enterEgHall(spec)` as `enterSdRealm`; `standEgHall(ctx)` beside `standSdRealm`
  (meshes, collider buckets, lights and the hall's fragments, through `egHallParts`); every hall's step under `stepThroughFire`; the arena clamp
  per hall (`realmClamp` over the spec's floors); `madeLevelOf`.
- `src/scenes/dungeonContext.js` - WIRED: the span's riders (`sdStepsRide`, generalised in EG4); no foes stream in a
  made level (every foe is the relay's).
- `src/scenes/exterior.js` - FLAGGED: the `?exterior` bench is offline. There is no Elite Breach there, and the key says
  so (*The key is cold here.*).

Every slice record below names all four, each wired or flagged.

## 27. How the arc keeps the Process rules

`bible/Home.md`'s Process rules bind every change. Where this arc meets each:

- **THE FOUR HOSTS RULE**: section 26, and every slice record names all four.
- **THE MODAL CONTRACT**: `worldModes.frame()`'s Spire branch returns the same type from every exit, and EG10 pins it in
  a test.
- **ONE DFU MEMBER, ONE EXPORT**:
  - the gate's constants (`BUCKET_*`, `PHASE_AT`, `SHIELD_MS`, `THREAT_*`, `ATTACKS`, `POOLS`) are imported, never
    copied;
  - `sdSeed`, `rimSpots` and `topWithMe` are exported once and imported (`hostTeamHpFor` already is);
  - `EG_ESCAPE_MPS` is computed from `runSpeed` at the escape build, never a literal;
  - the span law's copied motor numbers are held equal by a test;
  - one mesh kit (`world/meshKit.js`) and one registry of pseudo-archives (`world/pseudoArchives.js`).
- **A PIN MUST FAIL**: every slice ships `eg<N>_*.test.js` under test/ and its mutant records, `eg<N>.json` under
  tools/mutants/, every mutant dead; laws are pinned with deepEqual against their tables, never inequalities.
- **TEST THE SHAPE THE PRODUCER MINTS**: receipts, orders, specs and courses are tested as `mintEgReceipt`,
  `identityToken`, `egHallOf` and `courseOf` mint them, never as hand-built literals.
- **THE SLOT IS EMPTIED BEFORE THE OCCUPANT IS TOLD**: the start window, the rest window and the Vestige offer are
  overlays. Each is closed by the room's `st` or `end`, with the slot nulled first and one callback.
- **ASYNC NEVER DROPS**:
  - the open is single-flight on `rq`;
  - claims are coalesced per (breach, Redoubt, kind);
  - the restack coalesces;
  - every refusal is checked again when its async answer lands.
- **EVERY ALLOCATION HAS AN OWNER**:
  - each transition frees the old hall's meshes, colliders and riders, its fragments' with them (the court's and the
    Hour's meshes are built once and never freed today; the Spire's are not);
  - band textures are cached per band and freed at the breach's end;
  - the arch pool owns its arches.
- **RETIRING A FLAG DELETES THE SENTENCE**: any INTERIM this arc opens is retired by deleting its sentence.
- **A SLICE CLOSES ITS LEDGER ROW**: ELITE-GATES (Ledger A) is narrowed slice by slice.
- **A CITE NAMES WHAT IT POINTS AT**: the slices' docs cite by anchor.

## 28. What it does not do, said so

- **No Abyss Breach.** The gate's third tier is named (section 2) and not built.
- **No revive past the recall.** One recall a breach, at a Redoubt; no Vestige, spell or power raises the fallen.
- **No company changes.** One who joins the party after the open is not in the breach.
- **No trading or selling keys.** They are the account's.
- **No Elite Breach offline.** Offline there is no relay to run it.
- **No ordinary dungeon foes inside.** Every foe in the Spire is the relay's, or the one life would be a client's word.
- **No Gilded piece.** The Hourlock stays the one.
- **No Morrowind architecture.** The Morrowind layer has no statics, cell or collision path (it reads `STAT` records
  only for spell effects), so every fragment is the port's own geometry.
- **No real Daggerfall blocks inside.** The relay reads no BSA and could not know their floors.
- **No weekly seed.** The budget (section 9) makes halls of a depth weigh the same, and a shared seed would make the
  boards a race to scout it.
- **Nothing gets faster.** No depth, decree or fury shortens a wind-up, a beat, a crumble or a period.

## 29. Slices and their records

The order the arc ships in. Each slice can ship and be checked without the next, and the content arrives band by band.
Every slice ships its tests (`eg<N>_*.test.js` under test/) and mutant records (`eg<N>.json` under tools/mutants/),
every mutant dead, and its record names the four hosts and the Ledger rows it opened or moved.

| slice | what | moves |
|---|---|---|
| **EG0** | this page, and AUDIT EG0 | the bible |
| **EG1** | THE GATE'S TIERS: `systems/gateTier.js`, `GATE_TIER_TEXT`; the Regular tier's words unchanged | client |
| **EG2** | THE WEIR KEY: template 575 and its art; the balance (migration); the rolls in `claimGate` (which gains `rand`) and `claimSd`; `/v1/eg/find`, the killer's ask and the caps; `/v1/eg/keys`; the restack, new; the launch gift (a send migration) | client, service |
| **EG3** | THE BOSS SEAM: `net/bossSeam.js`; the gate, the Remnant and the serpent re-plugged, frames and pins unchanged | relay (a version) |
| **EG4** | THE COURSE AS DATA: `courseOf`, with the Hour's course byte for byte; `orreryOf` widened and `orreryJudge` extracted, with the Hour's draw and judge unchanged | client, relay (a version) |
| **EG5** | THE HALL LAW: `net/egLaw.js` (the record, the clock, the rhythm, the circle, the bands, the spec, the decrees and the recast trials, the waves) and `net/egSpanLaw.js`; `sdSeed` exported | client, relay bundle |
| **EG6a** | THE SPAN GENERATOR AND THE TIMED SOLVER: `egSpanOf`, the solver in the law, `egSpanSolve.mjs`, the 500-seed sweep at the span build | client |
| **EG6b** | THE FRAGMENTS: `net/egFragLaw.js` and the sockets; the Oblivion Caverns kit (passage, chamber, shaft) and the dressed platforms; THE FORK; `world/meshKit.js`; `world/pseudoArchives.js`; the cull; telegraphs per fight floor; THE WIDTH RULE; the reverb law | client, relay bundle |
| **EG6c** | HERO FRAGMENTS: authored in Blender and baked through `tools/fbxMesh.mjs`, each with its law markers and its byte-for-byte test, as Mac authors them | client |
| **EG7** | THE MADE LEVEL'S RULES: `madeLevelOf`, `MADE_LEVEL_RULES` and the sweep test; the court and the Hour re-plugged unchanged | client |
| **EG8** | THE ROOM: the `eg:` family; the orders (`ORDER_KINDS`, `EG_ORDER_FIELDS`); stakes, voids and `eg_live`; the hub's open (`EG_INTERNAL_OPEN`, `eglive`, `egrc`); the run director (`net/egBrain.js`); the wave runner (`net/egHost.js`); the `spanFair` accumulator; `judgeShapes` and the full shape stamp; the union floor; `e1`; durability, the drain and the law pin | relay (a version), service |
| **EG9** | THE ARCH AND THE CALL: the arm, the refusals, the start window, the arch pool, the pass's tint and scale, the clear sweep's keys, the cell word, the vortex, the landings, the Timers row, the sight line, the map mark | client |
| **EG10** | THE HALLS ON THE PAGE: `world/egHall.js`, `scenes/egHall.js`, `egHallParts`, the transitions, arrival, gather, descent and pull, the HUD, the flight bans, the fall, DEATH-PENALTY exempted, *Return to the Spire*, the modal contract's pin | client |
| **EG11** | THE HALL KINDS, THE TWISTS AND THE LEGION: Rift-Yard, Rampart, Athenaeum, Proving Walk, the Deepway, the chambers; the kinds 3, 4 and 6; the push; haven, lanes and tether | client, relay (a version) |
| **EG12** | THE REDOUBT: receipts, the spoils (`systems/egSpoils.js`), Reliquaries, the rest, the Vestiges (law, offers, effects, the relay's half, the caps, resonance, the death saves), the fallen (recall, witness, bequest, forsaking), the way home, the surplus and the respite | client, relay (a version) |
| **EG13** | THE GALLERIES' LORDS: the Hound (in its magma hall), the Last Spellmaster, the Last Armsmaster, Valkynaz Ilthys (`net/egLord.js`), each with its errand pins for *n* = 1 to 8; the Galleries' other fragments (the Fallen Stacks, the Broken Colonnade) | relay (a version), client |
| **EG14** | THE CLAIM, THE ECONOMY, THE HONOURS, THE BOARDS: `claimEg`, the migrations, the week's pay, the embers, the pity, the Broker's sink, titles and auras, the three boards, the season's champions, `BOSS_BODY` on in `eg:` rooms, the herald | service, relay (a version), client |
| **EG15** | THE PANOPLY AND THE CARDS | client |
| **EG16** | THE LOOK: the bands' art, the arch's skin, the stair, the skies, accessibility | client |
| **EG17** | THE SCORE | client |
| **EG18** | THE SOUL CAIRN: the Cairn-Keeper, the Twin Lords, Valkynaz Morvayn, the Cairn's legion (Binders and Wraiths, kinds 7 and 8), pieces and fragments (the Ossuary, the Mist Stair) | relay (a version), client |
| **EG19** | THE SHADE PERILOUS: the Mother of Dusk, the Night-Stalker, Valkynaz Seyth, the Divers (kind 5), the Pendulum, the fragments (the Gloam Thicket, the Eclipse Vault) | relay (a version), client |
| **EG20** | THE HAVOC WELLHEAD: the Bound Colossus, the Wellhead Wyrm, Valkynaz Garoth, the tides, the fragments (the Forge Gut, the Clan Pit, the deep Caverns) | relay (a version), client |
| **EG21** | AUDIT EG, and the tuning pass: the budget, the count and the pace measured in the field | all |

Each slice's record goes below as it lands: what shipped, its pins and mutant records, the four hosts, the Ledger rows
it opened or moved, and where it departs from this page.

### EG0 - written 2026-10-11 (the page)

The design, whole, before any code. Grounded in the shipped tree at `d9a3ced2`:

- the gate's clock (`src/net/gateLaw.js`);
- the made levels (`src/world/gateArena.js`, `src/world/sdRealm.js`);
- the brains and their shared hand (`src/net/gateBrain.js`, `src/net/sdRemnant.js`);
- the marks (`src/net/gateMods.js`, `src/net/sdMarks.js`);
- the Steps (`src/world/sdSteps.js`) and the engine's envelope (`src/player/motor.js`, `src/player/parkour.js`);
- the party (`PARTY_MAX` 8) and the hub's rosters;
- the receipts and their claims, the boards (`server-account/src/arena.js`) and the Portal Stone.

THE FOUR HOSTS: `src/scenes/world.js`, `src/scenes/worldModes.js`, `src/scenes/dungeonContext.js` and
`src/scenes/exterior.js` are all untouched. A page moves no host.

### AUDIT EG0 - 2026-10-11 (Mac: "Do a comprehensive audit and ensure this is the best and most detailed it can be")

Five cold lanes on the frozen first draft (177a3acd6), no edit made until every lane had returned (17l):

- code truth, about 210 claims checked;
- numbers and consistency, with simulations of the pace, the motor and the drifts;
- architecture, trust and failure;
- game design and the player's experience;
- lore, words and the bible's rules.

There were **105 findings**: 31, 23, 17, 16 and 18. A sixth cold lane then re-read the revision against every
row and found **28** more (3 HIGH), each fixed in place. Each was verified against the tree, the maths or UESP, and each
has its verdict and its place in this revision in `01-Overview/Audit-EG0.md`. The revision moved the page whole:

- **the lore** set right: the Spire's fate, a Valkynaz a warrior duke, the door held by the key and not a lord's will,
  and the torn halls marked as the port's invention;
- **the words** renamed: Weir Key, Redoubt, decree, the Vestige families, lord;
- **the protocol** rebuilt: the hub's open, stakes and voids, `eg_live`'s expiry, orders fit to `identityToken`, the
  drain, the law pin, durability;
- **the floors**: the escape build, the union floor, the CHECK class, the errand floor, and nothing faster;
- **the fallen** given a recall, a witness's seat and a bequest;
- **the risk**: Reliquaries;
- **the economy** rebalanced: weekly pay, embers where earned, a pity count, a sink;
- **the boards** made honest: the Descent from the first hall, by bracket;
- **the pace** re-modelled: the walls now stand where the rules put them.

THE FOUR HOSTS: untouched, as at EG0.

### EG0b - 2026-10-11 (the fragments; Mac: "sometimes platforms can lead to oblivion caverns, or different types of modeled areas instead of simple platforms")

Sections 10.1-10.8 and 8.8 are new. The design behind them:

- **fragments** (passages, chambers and shafts), with a library of ten across the four bands;
- every platform dressed, the top you see being the top you stand on;
- THE FORK (the High Road and the Low Road);
- the Deepway;
- chambers for Yards, proving courts and the lords' grounds;
- the fragment record, a law half the relay reads and a mesh half it never sees;
- code-built kits and authored hero fragments, with one mesh kit and one registry of pseudo-archives;
- fight floors, telegraphs per floor, walls that bound the escape, and THE WIDTH RULE (three blows widened to 3 m);
- headroom for both third-person cameras;
- light, sound, budgets and the cull.

They are grounded in:

- the gate's and the ships' bakes (`tools/bakeGate.mjs`, `tools/shipBake.mjs`, `tools/fbxMesh.mjs`);
- the collider (`src/player/collider.js`);
- the telegraph pass, and how flat it is (`src/render/gateTelegraph.js`);
- `deepIn`'s margin (`src/net/bossBody.js`);
- the cameras (`src/player/mwCamera.js`, `src/player/eotbCamera.js`);
- the light caps;
- the reverb presets;
- TEXTURE.356, the Mantellan Crux's fire walls.

THE FOUR HOSTS: untouched.
