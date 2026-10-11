# Elite Gates - the Elite Breach and the Battlespire (EG)

> Design page, written 2026-10-11 before the arc's first slice. The code's comments will cite this page by section
> number; where the page and a pin disagree, the pin is what runs. Each slice adds its record under section 24.

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
resources, be extremely detailed and dont half ass the work"*.

So, as decided here (each decision is argued in its section):

- **The gate gets the dungeons' three tiers.** Dagon's Breach (`World-Bosses.md`), as shipped, is the gate's Regular
  tier. This arc builds the **Elite Breach**, the tier above it. The Abyss tier of the gate is named and reserved, the
  way the gate arc named the instanced dungeons it was not building (section 2).
- **Where it leads: the Battlespire.** Canon (UESP, Lore:Battlespire): the Imperial Battlemages' war academy, a
  void-castle between the planes. It was taken by Dagon's legions in 3E 398, barred to the Legion with a Daedric Sigil,
  and destroyed when Dagon was banished. In 3E 417 its broken halls hang over the Deadlands, still garrisoned by the
  Kyn. It fits section 19 of the gate's page: a door opened from within, which the Covenant never barred and always
  fights (section 3).
- **The key: the Spire Sigil**, a shard of the Sigil that barred the Spire. It is ACCOUNT-HELD: the account service
  keeps the count and the item is its face, because every dungeon drop today is the client's own dice. It drops from
  Dagon's Breach, and very rarely from dungeons, by tier. The service rolls every drop (section 4).
- **Timed like a gate.** The arch rises at the opener's feet, sealed for one game hour. It opens for one game hour,
  then the Covenant's count runs, on the shared clock in game minutes like the gate's own (section 5).
- **A company of eight.** The opener's party at the rising, frozen, up to `PARTY_MAX` (8, already the party's size).
  Only the opener spends a Sigil (section 5).
- **Endless, procedural, one floor at a time.** A run is HALLS, five to a WARD, generated from the breach's seed. Each
  hall is a made level, like the Burning Court and the Shattered Hour, entered under the gate's veil (sections 6-9).
- **Five kinds of hall**, plus the Kyn's Court that closes each Ward:
  - the Muster-Yard (relentless waves out of Wellhead rifts)
  - the Span (generated platforming)
  - the Rampart (a walkway under fire)
  - the Athenaeum (a seeded Orrery under pressure)
  - the Proving Walk (span, champion, span) (section 7)
- **Four bands deep**, retracing the legions' march of 3E 398 in reverse: the Broken Galleries, the Soul Cairn, the
  Shade Perilous, and the Havoc Wellhead, which never ends (section 6).
- **Relentless adds the relay runs.** Nine add kinds, three of them the Legion-Lord's, widened from the gate's
  `stepHost` into a wave runner of their own (section 10).
- **Nine bosses and the Valkynaz.** Each a brain of its own on ONE relay boss seam. A Valkynaz, a Prince of the Kyn,
  holds every fifth Ward (section 11).
- **Brands, Vestiges, Wards.**
  - Brands: the run's modifiers, merged by the Hour's own `sdMarksLaw` rule (section 12).
  - Vestiges: three offered at every Ward, one taken, kept for the breach. My decision on question 4: yes, with every
    bonus to damage told to the relay so the trust law still bounds it (section 13).
  - Wards: the checkpoints. One life a breach; a fall or a leave keeps everything banked at the last Ward lit, and the
    TALLY since then is lost. A Ward lit is also a place to start from next time (section 14).
- **Depth grows in mechanics before numbers** (Balance-Arc's law). Brands stack, waves quicken, spans tighten and a
  boss slow to fall turns to fury. Every wind-up keeps a floor a player can always run out of. The count bounds the run
  (section 15).
- **The chance, not the promise.**
  - Embers, Marks and spoils at every Ward.
  - THE BATTLEMAGE'S PANOPLY, nine Aetheric pieces.
  - Each boss's tavern card.
  - Titles and auras by depth.
  - Two season boards.
  - No Gilded piece: the Hourlock stays the one (section 16).

Daggerfall has no Elite Breach, no Battlespire and no other players, so none of this is a DFU member. Its Ledger A row
is ELITE-GATES, written by the first slice that ships code.

## 1. The shape, end to end

```
 a SPIRE SIGIL (account-held) ─► used outdoors, online ─► /v1/eg/open: one spent, an OPEN ORDER signed
   │
   ▼
 the relay room `eg:<b>` spends the order ─► asks the hub for the opener's party ─► the COMPANY, frozen (≤ 8)
   │ the ARCH rises at the opener's feet: sealed 1 game hour (5 real min) ─► OPEN ≤ 1 game hour, or until Hall 1's door
   │ each member: /v1/eg/admit ─► an ADMIT ORDER ─► the room spends it ─► through the veil
   ▼
 HALL 1 ─► HALL 2 ─► HALL 3 ─► HALL 4 ─► HALL 5: the KYN'S COURT ─► the WARD lit
   (yard · span · rampart · athenaeum · proving, drawn by the circle law)      │
   │                                                                           ├─ an `e1` RECEIPT to every living member:
   │   each hall: GATHER 8 s ─► the trial ─► the DOOR ─► MUSTER ─► the stair  │  depth banked, spoils thrown, embers, marks
   │                                                                           ├─ the COUNT held: +3 game hours (15 min)
   │                                                                           ├─ three VESTIGES offered, one taken
   │                                                                           ├─ the next circle's BRANDS shown
   │                                                                           └─ the WAY HOME (leave, keeping all)
   ▼
 ... HALL 6 ─► ... ─► HALL 25: a VALKYNAZ ─► ... the Havoc Wellhead, without end
   │
   ▼
 the END: every member fallen or gone home, or the COUNT spent ("The Covenant tears the breach shut.")
   ─► each entrant's end receipt ─► the arch sinks (10 s)
```

## 2. The tiers of the gate - Regular, Elite, Abyss

The dungeons have three tiers and one law that names them: `dungeonTier` in `src/systems/dungeonTier.js`, with the
words *Regular Dungeon*, *Elite Dungeon* and *Abyss Dungeon* (ABYSS-NAME). The gate gets the same shape: one leaf law,
`systems/gateTier.js` (EG1), with `gateTier(x)`:

| tier | code | the event | what it is | built |
|---|---|---|---|---|
| Regular | `'regular'` | **Dagon's Breach** | the world boss on the shared clock: one a game day, everyone, the Warden | shipped (WB) |
| Elite | `'elite'` | **Elite Breach** | a key's breach for one company: the Battlespire, endless, one life | this arc |
| Abyss | `'super'` | **Abyss Breach** | reserved; the code keeps the word `super` for the Abyss tier, as the dungeons do | NOT this arc |

`GATE_TIER_TEXT` holds the words. The Regular tier's word is its own name, because the event already has one. An Elite
Breach is said as *an Elite Breach*, and its place as *the Battlespire*:

- **the arch's plaque** (World Tooltips): *Elite Breach*, sub *The Battlespire*. To anyone outside the company, a second
  sub: *<opener>'s company*;
- **the sight line**: *You see an Elite Breach 140 metres to the North!* (the Elite dungeon's line, its law);
- **the Timers row** (`eventTimerRows`, a new kind `'elite'` beside `'gate'` and `'super'`): *Elite Breach opens 4:12*,
  *Elite Breach - Hall 17*, *The breach holds 24:10*. The row is the company's only;
- **the held map**: a mark at the arch's pixel for the company (it is not a place in MAPS.BSA);
- **on entering a hall**: one line, *Hall 12 - the Broken Galleries*. A Ward's hall says *Hall 15 - the Kyn's Court*.

**Why the Abyss tier is not built here.** The Abyss Dungeon's Rift already is an otherworldly door at the top of the
content, and its feat is one Hollow at a time for the whole world. An Abyss Breach would be the pinnacle of the gate's
own ladder: a world-scale event, not a company's. It is named so it is not mistaken for missing. The tier law answers
`'super'` for nothing until it is built.

## 3. The Battlespire in 3E 417 - the lore

The gate's own lore law (`World-Bosses.md` section 19) is binding: the Covenant of Akatosh bars every Prince from
forcing a door into Tamriel. It never barred a door opened from within, and it fights every breach. Dagon's legions
taking the Battlespire in the Simulacrum's years is the precedent section 19 cites. This arc goes there.

**What canon gives** (UESP, Lore:Battlespire and Lore:Kyn):

- The Battlespire was the war academy of the Imperial Battlemages and a testing ground for the Imperial Guard, a
  void-castle between the planes.
- The Impostor, Jagar Tharn, gave it to Mehrunes Dagon in 3E 398. Dagon's forces mustered in the **Havoc Wellhead**,
  rampaged through the **Shade Perilous** and the **Soul Cairn**, and took the Spire, killing nearly every Battlemage.
- The Daedra barred the Spire to the Legion with a **Daedric Sigil**. The Spire was destroyed when Dagon was banished.
- The Dremora, the Kyn, keep ranks: Churl, Caitiff, Kynval, Kynreeve (a clan's sheriff), Kynmarcher, Markynaz (a
  grand duke), Valkynaz (a prince). Valkynaz Ruhn, the Warden, is one.

**What this arc adds, and says it adds:**

- **The Spire's halls did not fall whole.** They broke along the road the legions came. The upper halls still hang
  over the Deadlands. The lower ones fell back down the march: through the Soul Cairn, through the Shade Perilous, to
  the Havoc Wellhead itself. To descend the Spire is to walk the invasion of 3E 398 backwards (the bands, section 6).
- **The Kyn kept it as a proving ground.** It was one for the Battlemages too. A Dremora rises in rank by holding one
  of its Wards, so the deeper halls are held by higher ranks: Kynreeves, then Kynmarchers and Markynaz, then a Valkynaz
  at every fifth Ward.
- **The Sigil shattered with the Spire.** Its shards are what a Valkynaz holds a breach open with, which is why the
  Warden's fall can drop one. Dagon's covens hoard them in the deep places, which is why the hardest dungeons give
  them up likeliest. A shard in a mortal hand opens the way from within.
- **The Covenant fights it as it fights every breach.** The door holds only while the Battlemages' old Wards are lit.
  Each Ward-stone, lit again, holds it a little longer. When the count runs out the Covenant tears it shut. That is
  the gate's own fiction of the seal and the Wrath, moved from the clock to the company's pace.
- **The Vestiges are what the Battlemages left in their Wards**: a lesson that clings to whoever lights one, until the
  breach closes.

**The words.** The event is an **Elite Breach** and the arch is *the gate*. The place is **the Battlespire**, or *the
Spire*. A floor is a **Hall** and a checkpoint is a **Ward**, its stone a **Ward-stone**. The key is a **Spire
Sigil**, never a sigil stone (section 19 of the gate's page retired that word for the Crisis it belongs to). Lines
are short (Mac at WB12: *"less explanatory and less AI"*).

## 4. The Spire Sigil - the key

**The item.** Template **575**, the first free index after the gate's 570-574, a row beside `PORTAL_STONE_TEMPLATES`
in `src/systems/gateSpoils.js`:

- `{index:575, baseWeight:0.25, hitPoints:1000, basePrice, rarity:20, bound:true, stackable:true}`, in the miscellany
  group (`UselessItems2`), never a gem (PORTAL1's lesson: every Gems piece is a crystal a slot takes);
- its art: a shard of black-gold stone (the arch's own palette, section 20), until then TEXTURE.254's nearest record;
- named in `BOUND_TEMPLATES` (`src/net/realmTradeLaw.js`), so the realm's trade refuses it as the client does;
- its line: *A shard of the Sigil that barred the Battlespire. It opens the way from within.*

**The count is the account's.** Every dungeon drop is the client's own `Math.random` (the INT ledger measures it after
the fact and does not enforce). A Sigil from a forged drop would open a real relay instance. So the Sigil is the
Broker's ember balance again: the service holds the truth, and the item is its face.

- `players.eg_sigils` (migration, EG2) is the count. The stack on every character of the account shows that count,
  restacked from each service answer that carries it (`restackStones` is the precedent: the Broker's insignia already
  spend a service-side ember balance, `gate_kills.stones - insignia_spent`);
- a Sigil the service does not count does nothing: *The Sigil crumbles.*, and the stack is restacked;
- it is bound to the account, never traded, and lost from no death.

**Where they come from.** The service rolls every one with its own `rand`, at a claim it already verifies. This is the
`sdHonoursRoll` way: AUDIT SD III R4 moved the Hour's honours off the receipt seed because the page can read it.

| source | when the service rolls | odds | why that much |
|---|---|---|---|
| **Dagon's Breach** | `claimGate`, a recorded kill | **1 in 6** | the gate feeds the Elite. At a gate or two a real day, a regular fighter earns one every three to six days |
| **...having broken the rite** | `claimGate`, a recorded kill with `r=1` | **1 in 4** (instead) | the rite is the gate's harder half (WB12d) |
| **...the first ever** | `claimGate`, the account's first `gate_kills` row | **certain** | every gatebreaker sees the Spire once |
| **the Abyss Dungeon's Remnant** | `claimSd`, a recorded Hour | **1 in 3** | the hardest fight the port has, witnessed by the relay |
| **an Abyss Dungeon's elite foe** | `/v1/eg/find`, below | **1 in 60** | six elites a Hollow: about one Hollow in ten |
| **an Elite Dungeon's elite foe** | `/v1/eg/find` | **1 in 150** | three or four a dungeon: about one in forty |
| **a Regular dungeon's elite foe** | `/v1/eg/find` | **1 in 400** | one dungeon in five has one: about one in two thousand |

**The dungeon's find.** No relay witnesses an ordinary dungeon, so the find is asked. A death handler on the elite foe
(`registerEnemyDeathHandler`, the seam `dropFoeCard` uses for a foe's card) asks `/v1/eg/find` with the dungeon's tier
when an elite foe (`eliteFoe`) dies in a dungeon online. The service rolls at that tier's odds. A yes adds one to the
count and throws the item from the body, as a card is thrown. A forged client can lie about a kill, so the asks are
capped: **12 a tier, per account, per real day**. At the cap, forging is worth about 0.31 Sigils a day, less than an
honest gate-goer earns, and every one of them still has to be played. `EG_FIND_PER_DAY` and the odds live in the
service. The INT budget measures the asks.

**The launch gift.** Every account with a `gate_kills` row when EG2 ships finds one Sigil in the server mailbox
(SERVER-POST, `server_post`), worded *From the Battlespire*. PORTAL-GIFT is the precedent.

**Using it.** Use is a registered arm (`registerItemUseHandler` -> `{kind:'openBreach'}`), routed on every reader, as
the Portal Stone's is. Its refusals, in order, each a line of `EG_TEXT`:

1. offline, or on the `?exterior` bench: *The Sigil is cold here.*
2. not in the open world (interior, dungeon, a made level): *Not here.*
3. the Portal Stone's holds (`portalHold`: busy, duel, siege, enemies, journey), and water or a boat;
4. inside a location's own footprint (a town's walls, a farm's yard): *Not within <place>.*
5. within 300 m of a standing Dagon's Breach, or 150 m of another Elite arch: *Another breach stands near.*
6. the opener already in a breach, or with an arch of their own standing: *You hold a breach already.*
7. no room for the arch: the Portal Stone's `portalPlace` law (ground probe, wall gap) at the arch's own clearance,
   `EG_ARCH_CLEAR_M` 8: *There is no room for it here.*

Then the **start window** asks where in the Spire. The choices are **Hall 1** and every Ward the opener has lit,
deepest first (section 14). The classic skin asks with DFU's MessageBox, Hall 1 and the three deepest Wards; the
enhanced skin lists them all. The answer goes to `/v1/eg/open`. The service spends one, HOLDS it against the breach,
and signs the **open order** (section 19). A hold no receipt settles within an hour is returned to the count: the
client crashed before the room heard it, and a Sigil is never lost to a dropped socket.

## 5. The breach - the arch, its clock, the company

### The arch

The gate's own model, `buildGateModel` in `src/world/gateModel.js` (Mac's Blender bake), drawn at **0.62 scale**:
about 10 m tall and 4.8 m to each side. It is re-skinned in the Spire's colours: Imperial white marble inlaid with gold,
cracked through with the Warden's basalt. The membrane turns gold-white while sealed and red-gold when open, through the
gate's own pass (`render/gatePass.js`) with its uniforms. The beacon is gold and **600 m** tall, half the gate's
`BEACON_HEIGHT_M`: a company's door should not outshine Dagon's. It climbs out of the ground over the gate's
`GATE_RISE_MS` (20 s) and sinks over `GATE_COLLAPSE_MS` (10 s). Its clearing is a second key in the rock sweep
(`src/world/gateClearance.js`, keyed by the breach id, never the clock's gate).

It stands at the opener's feet, ahead: the Portal Stone's `portalPlace` (`PORTAL_AHEAD` 2 m), turned to face the
opener. Its site travels as a word on the opener's world cell (section 19), so everyone near sees it. Party members
anywhere see its mark on the party map (the hub's party share, `amap`).

### The clock - the count

On the shared clock (`sharedClassicMinutes`: a game minute is 5 real seconds, a game day 2 real hours), in game
minutes from the moment the room accepts the open order, as the gate counts from its day:

| phase | game | real | what |
|---|---|---|---|
| **rising, sealed** | 60 min | 5 min | the arch climbs and stands sealed. *The gate opens in 4:12.* The company gathers. The gate's own rise-to-open is the same hour |
| **open** | until Hall 1's door, at most 60 min | at most 5 min | the company steps through. A member who comes later: *The breach has gone deep.* |
| **the count** | starts at 360 min | 30 min | from the opening. *The breach holds 24:10.* |
| **a Ward lit** | +180 min | +15 min | added to the count, never more than 360 min (30 min) left after it |
| **the Covenant's last word** | 2160 min from the opening | 3 h | no count runs past it, however many Wards |
| **the tear** | when the count is spent | - | *The Covenant tears the breach shut.* Everyone inside is cast out |
| **collapse** | 10 s | 10 s | the arch sinks. The opener may raise another (a new Sigil) |

Constants (`net/egLaw.js`): `EG_RISE_MIN` 60, `EG_ADMIT_MAX_MIN` 60, `EG_COUNT_START_MIN` 360, `EG_WARD_HOLD_MIN` 180,
`EG_COUNT_AHEAD_MAX_MIN` 360, `EG_LAST_WORD_MIN` 2160. `egTimes(rec)` answers every phase's relay time and
`egPhase(rec, ms)` the phase: `'rising' | 'sealed' | 'open' | 'deep' | 'torn' | 'collapsing' | 'gone'`. These are
`gateTimes` and `gatePhase` again, for a record instead of a day.

**Why the count is shaped so.** "Timed like oblivion gates" is a window with an end the room can see coming, and an
endless run needs that end to come from the run. A fixed window caps every company at the same clock, and the board
then measures only speed. A count that only grows would let a perfect company stand in the Spire for ever, and the
relay pays for every awake second (RELAY-H1). Thirty minutes to start, fifteen more for each Ward, and never more than
thirty in hand:

- early Wards come faster than fifteen minutes, so a good company banks time, up to the cap;
- deep Wards take longer than fifteen, so the count drains;
- the depth a company reaches is where its pace meets the Spire's (section 15).

The three-hour last word bounds the relay instance. The tear is not a death: nobody is killed, no death penalty runs,
and what was banked stays banked. The tally is lost (section 14).

### The company

- **Who.** The opener's party at the moment the room accepts the open order, as the hub knows it: a new internal
  route, `EG_INTERNAL_COMPANY` (`/internal/eg/company`, the `_wdunKinOf` pattern of DO-to-DO `fetch`). It answers the
  strict roster of the opener's party. It is not the kin question, whose ten-minute truce memory (`partyWas`) is too
  loose for a door. The company is FROZEN there, up to `PARTY_MAX` (8): one who joins the party later is not in it,
  and one who leaves it is still in it. A party of one is a company.
- **Admission.** Each member at the open arch asks `/v1/eg/admit`. The service checks that the member:
  - has a handle (no guests: the Spire's feats are recorded);
  - has lit the breach's start Ward (section 14);
  - holds no other live breach (`eg_live`).
  It then signs an **admit order**. The room spends it once and checks the member is in the company, not fallen here,
  and in the open window. Through the veil (`stepThroughFire`), into Hall 1.
- **Outside the company.** Touching the arch: *The breach answers only to <opener>'s company.*
- **One breach at a time** for every account, opener or member.
- **The absent.** A member whose socket is gone for **120 s** (`EG_ABSENT_MS`) is counted fallen. A tab closed before
  a killing blow is not a life saved. A member back within it returns to the hall's arrival plate.

## 6. A run - halls, circles, bands

**Halls and Wards.** Hall *h* (1, 2, 3...) belongs to circle *c* = ceil(*h*/5). Halls 5*c*-4 to 5*c*-1 are the
circle's four trials. Hall 5*c* is the **Kyn's Court**, whose fall lights **Ward c**. A breach that starts at Ward *w*
begins at Hall 5*w*+1.

**One hall at a time, the company together.** The relay's room holds one live hall. The company moves as one through
its beats:

| beat | what | how long |
|---|---|---|
| **arrival** | each member steps out of the stair onto the hall's ARRIVAL PLATE (gold), the hall built from its spec | as they come |
| **gather** | after the last living member arrives (or the muster's end), the hall wakes: *The hall wakes.* | `EG_GATHER_S` 8 s |
| **the trial** | the hall's kind (section 7) | the trial's |
| **the door** | the relay judges the trial done, and a gold door opens at the hall's END PLATE | - |
| **muster** | each member steps through the door when ready | `EG_MUSTER_FIGHT_S` 20 s, or `EG_MUSTER_SPAN_S` 45 s for a hall a span ends |
| **the pull** | at the muster's end, every living member still in the hall is pulled down. After a span, the Spire takes its toll | toll: `EG_PULL_TOLL` 20% of max health, never lethal (`spare`) |

A span's door opens when the FIRST living member stands on its end plate. The muster then gives the rest 45 s to make
the crossing, and the pull carries whoever did not, at the toll's cost. Skill is paid and nobody is stranded. Nothing
waits on the slowest player for ever, and nothing is skipped for free.

**The stair.** Between halls, the veil (`stepThroughFire`) shows the fall through the void, past the Spire's broken
underside, to the next hall's arrival plate (section 20). Each hall is a fresh made level: a dungeon transition over
`egHallLocation(spec)`, as the Shattered Hour is entered over `sdRealmLocation`. The host cannot swap a level's parts in
place (every layout is fixed when its module loads, and there is no re-stand path), and a transition per hall is the
seam the gate and the Hour already prove.

**The bands.** Every 25 halls (five Wards) the Spire has fallen further down the legions' road:

| band | halls | what it is | look | its legion | its Kyn |
|---|---|---|---|---|---|
| **the Broken Galleries** | 1-25 | the academy's upper halls, still over the Deadlands | white marble and gold, burnt Battlemage blue, the fire-sea below | Imps, Fire and Frost Daedra, Daedroth, Gargoyles | Kynreeves; Valkynaz Ilthys at Ward 5 |
| **the Soul Cairn** | 26-50 | halls fallen into the Ideal Masters' plane of the dead | violet-grey stone, soul-gem light, a sea of mist | + Wraiths, Ghosts, Liches | Kynmarchers; Valkynaz Morvayn at Ward 10 |
| **the Shade Perilous** | 51-75 | halls fallen into Nocturnal's dusk | near-black, moon-silver, light only where braziers burn | + Harpies, Daedra Seducers, Vampire Ancients, Giant Bats | Markynaz; Valkynaz Seyth at Ward 15 |
| **the Havoc Wellhead** | 76 onward | the muster-ground of 3E 398, the Spire's last fragments in it | basalt and molten iron, eruptions | + every Atronach, Dragonlings, Daedra Lords as elite adds | Markynaz; a Valkynaz every fifth Ward, without end |

The bands are the arc's progression. Each changes the look, the score, the legion and the Kyn. The Wellhead is the
endless floor of the Spire: from Hall 76 its bands do not change again, and depth is all that grows.

## 7. The halls

Every hall is laid along +Z, from its arrival plate (z = 0) to its end plate, over the void. Falling below a hall's
floor (y < `SD_VOID_Y`, -30) is never a death. It casts back to the last checkpoint island or plate stood on, at the
Steps' own cost, `SD_CAST_BACK_LOSS` (15% of max health, never lethal), exactly as the Unmoored Steps do. The void
punishes in time and health. It does not take the one life.

### 7.1 The Muster-Yard (`yard`) - relentless waves

A court disc of radius 22-28 m (the gate's `COURT_R` is 24), with **Wellhead rifts** on its rim. These are tears into
the Havoc Wellhead the legions came through, each a standing body:

- **rifts**: `clamp(2 + ceil(n/3), 3, 5)` for *n* living members. Each holds 12 s of the company's reference damage
  shared over the rifts (the crystals' law, `crystalHpFor`), at least `HOST_HP_MIN`;
- **each rift pours a wave** every `max(9, 20 - 0.5(c-1))` s while it stands: the band's kinds, sized by *n*
  (section 10). The waves do not wait for the last to die. That is the relentlessness;
- **the legion's cap**: no more than `clamp(4 + n, 6, 14)` standing. A rift whose wave would pass the cap holds it, and
  the next one is larger by one;
- **the end**: the last rift closed. Every add still standing crumbles (the host's `adie`), and the door opens.

Split up and close rifts in parallel, or stand together and be buried. An eight-member company closes five rifts in
three groups. A pair closes three, back to back.

### 7.2 The Span (`span`) - platforming

A generated course (section 9) of 12-28 platforms in two to four sections, with checkpoint islands between them, from
the arrival plate to the end plate. Harriers hover after the company over it (Imps hover, `HOST_HOVER_M` 0.9). From
the Soul Cairn, Divers dive at it from the air. The door opens on the first living member at the end (section 6).

### 7.3 The Rampart (`rampart`) - a walkway under fire

A walkway 90-160 m long and 3-4.5 m wide, over the void:

- **fire vents** cross it on a cycle, each a lane telegraphed 1.0 s before it erupts (20% of max health, fire);
- **the legion marches along it** toward the company. The relay runs them on a line, the walkway's own axis, which
  needs no navmesh;
- **casters** stand on pillars beside it, 8-14 m out, throwing discs. Reach them by short side-spans, or answer them
  with arrows and spells;
- **Breakers** charge along it and push 6 m. A push off the edge is a cast-back, not a death;
- **at its end, a portcullis** held by two Ward-Bearers (the Legion-Lord's, pulsing). When both fall, the door opens.

### 7.4 The Athenaeum (`athenaeum`) - the lock

The Battlemages' library, its heart an **Orrery** drawn by `orreryOf` (`src/net/sdBrain.js`) from the hall's seed. It
is already procedural: any safe seed gives a fresh lock and its riddles. Its knobs harden with depth:

- the turns band, `SD_TRUTH_TURNS_MIN`-`_MAX` 12-24 at Ward 0, rising by 2 every five Wards to 20-32;
- the fray, shortened by the Fraying brand (section 12).

The relay judges each turn as `_sdTurn` judges the Hour's: reach, settle, rights, then `orreryStep`. Meanwhile one
Harrier rises every 15 s while the lock stands. At most one Athenaeum a circle, never in circle 1, never the last hall
before a Court: a breath, not a wall.

### 7.5 The Proving Walk (`proving`) - span, champion, span

The Battlespire was a proving ground. A short span (6-10 platforms) leads to a **proving court** (r 14), where the
hall's **Kynreeve** stands: a champion the relay runs. It is one foe, `PROVE_HP_S` 40 s of the company's reference
damage, with three of the Warden's blows at 0.8 scale (Cleave, Slam, Charge from `ATTACKS`) and its band's escort of
two adds. Its fall opens a second span, and that span's end is the door.

### 7.6 The Kyn's Court (`court`) - every fifth hall

A short approach (3-5 platforms of the band's first two pieces) to the **Kyn's Court**: a court of radius 26, or the
boss's own ground (section 11). The boss stands there. Its fall raises the **Ward-stone** at the court's heart, and the
Ward lights for every living member at once. Touching the stone is not needed: the rest begins (section 14).

## 8. The generator - the hall spec

**One pure law, read by both sides.** `hallOf(seed, hall)` (`net/egLaw.js`) answers the **hall spec**:

- the kind, the band, the circle;
- the hall's geometry: its plates, court discs, rifts, walkway, pillars and span course;
- its brands, as numbers.

The relay reads it to run the hall's brains: where a court's clamp is, where a rift stands, the walkway's line, where
a platform is at time *t*. Every client reads it to build the hall (`buildHallModel(spec)`, `hallColliderTris(spec)`,
the Steps' records for a span). The relay and the clients agree because they compute the same spec. The breach's
`seed` is drawn by the relay's CSPRNG when the room accepts the open order, and said in its state. A hall's own seed is
`egSeed(seed, hall)`, the `sdSeed` mix. `EG_SPEC` is the spec's law number in the state: a client that knows another
is told to reload, as at every brain law.

**The circle law** (`circleOf(seed, c)`) draws halls 1-4 of the circle from the five kinds. Its rules:

- at least one of {span, proving} and one of {yard, rampart};
- no kind twice running, across circles too (a Court counts);
- the Athenaeum at most once, never in circle 1, never the fourth hall.

Weights by band:

| | yard | span | rampart | proving | athenaeum |
|---|---|---|---|---|---|
| the Broken Galleries | 3 | 3 | 2 | 2 | 1 |
| the Soul Cairn | 3 | 2 | 3 | 2 | 1 |
| the Shade Perilous | 2 | 3 | 3 | 3 | 1 |
| the Havoc Wellhead | 3 | 2 | 3 | 3 | 1 |

**A hall's budget.** Every piece the generator places carries a cost: a platform kind, a rift, a vent lane, a caster
pillar. A hall's pieces sum to `budget(h)`, which grows with the circle and the brands. The Spire therefore has no
lucky seeds: two companies at Hall 40 face halls of the same weight, drawn differently. The budget is the measured
knob of EG's tuning pass.

**Pins.** The spec law is pinned against golden specs for fixed seeds, and every spec field the relay reads is pinned
against the brain that reads it. A change to the draw changes the relay version, as the Orrery's golden draw does
(`test/relayversion.test.js`).

## 9. The spans - generated platforming

**The course is the Steps' own record.** `src/world/sdSteps.js` lays the Unmoored Steps as a uniform array:
`{i, kind, span, x, y, z, w, d, amp, period, phase, beat}`, plus checkpoints `{x, y, z, r}`. That is exactly what a
generator emits. It is frozen at import today (`layCourse`, `SD_STEPS_COURSE`), and its readers take its length at
module scope (the pass's uniform count, the waystones, the motes). EG4 turns it into data:

- `courseOf(courseSpec)` lays a course;
- the Hour's course is `courseOf(SD_COURSE_SPEC)`, byte for byte the frozen one, pinned;
- the readers take a course, and the pass's ghost count becomes a maximum.

Then `spanOf(seed, hall, budget, band)` (`world/egSpan.js`) emits a course from a grammar of pieces.

**The pieces.** The Steps' four, and four more:

| piece | from | what | its numbers at Ward 0 -> its floor deepest |
|---|---|---|---|
| **Drift** | the Steps | a platform swinging side to side, `stepAt` | amplitude 2-4 m -> 2-5 m; period 4-7 s -> 3.5-6 s |
| **Beat** | the Steps | there on the beat only, `beatStands` | cycle `SD_BEAT_CYCLE` 3.6 s; solid `SD_BEAT_SOLID` 2.4 s -> 1.8 s; the blink `SD_BEAT_BLINK` 0.4 s always |
| **Riser** | the Steps | a wall `SD_RISER_H` 2.3 m, run up (CLIMB3) or climbed | fixed: the engine's band |
| **Crumble** | the Steps | shakes and falls after a foot | delay `SD_CRUMBLE_DELAY` 0.7 s -> 0.45 s; back `SD_CRUMBLE_BACK` 5 s |
| **Gust** | the Steps (the breath) | a span-wide push, warned 1 s | every `SD_GUST_EVERY` 6 s -> 4 s; `SD_GUST_SPEED` 3 -> 4 m/s |
| **Rail** | new | a platform that travels along the course between two plates, ridden (`carryBy`) | period 6-9 s -> 5-7 s |
| **Pendulum** | new | a chained weight swinging across the path, its lane telegraphed | touch: push 6 m + 15%; period 3-5 s |
| **Vent** | new | a vent under a platform, erupting on a cycle, ringed 1.0 s before | 20% fire; cycle 4-6 s -> 3-4 s |
| **Descent** | new | a drop to a wide landing (at least 3 m deep) | at most 4.5 m, under `FALL_DAMAGE_THRESHOLD` (5 m) |

**Pieces by band.**

- The Broken Galleries: Drift, Beat, Riser, Crumble, Descent.
- The Soul Cairn adds the Gust and the Rail.
- The Shade Perilous adds the Pendulum.
- The Havoc Wellhead adds the Vent: all nine.

**The engine's envelope** (SD7a's law, amended to the generator). Every number is a bound, never a target:

- a gap is at least 2.4 m and at most `PLAIN_LEAP + CAPSULE_RADIUS` (about 3.43 m): the plain running jump at a modest
  build (Speed 40, Running 20: 3.08 m), never a running leap's. Training buys margin, not entry;
- a riser is taller than the Jumping-100 apex plus 0.5 m, and no taller than `wallRunHeight(0,0) + PARKOUR_REACH_MIN`
  (the Steps' own band);
- a step down within a run is under 1 m; a Descent's drop is at most 4.5 m;
- depth NEVER widens a gap. Distance is the engine's, so a span grows harder in time: shorter beats, quicker crumbles,
  stronger gusts, more pieces at once, Divers overhead.

**The timed solver** (`egSpanSolve.mjs`, and its test). SD7a checks distance and SD7b runs the real motor. Neither
checks time: a Drift's gaps are measured when two platforms line up, and a Beat's windows are not measured at all. The
generator emits only what the solver proves:

- for every consecutive pair, a launch window of at least `EG_WINDOW_MIN` 0.5 s in each period in which the plain
  running jump at the modest build lands (the motor's closed form, over the platforms' positions at *t*);
- a Beat's solid time, less the blink, covers the crossing;
- a Crumble's delay is at least the platform's depth over the modest build's run speed, plus 0.15 s;
- a Pendulum's lane leaves a window of at least 0.8 s to pass;
- a course that fails is drawn again from the next sub-seed, at most 8 times, then laid from the band's floor pieces
  alone. The solver is in the law, so the relay and the client draw the same course.

CI runs SD7b's harness (the real `PlayerMotor` on the real `Collider` over `stepTris` slabs) across **500 seeds per
band**. Every course is crossed at Speed 10 and Running 0 with the Steps' own timing.

**The wards on flight.** `applyMotorEffectFlags` (`src/scenes/shared.js`) wards Levitate under `levitateWarded()`. The
Spire's predicate joins the Hour's in `registerLevitateWard`. **Slowfall is warded too**, which it is not in the Hour
today: it drifts down at a flat `SLOWFALL_VELOCITY` and keeps a run's momentum off an edge, so a Descent would be a
glide. The Jump spell is allowed: it is a build, and the Steps accept it (*"a Jump spell is a way up too"*). Staff
`/fly` is staff.

**Shared clock, private crumbles.** Platforms move on the anchored clock (`anchoredClock`, `deadlandsSeconds`), so
every member sees the same Step in the same place. A crumble is each member's own, the Steps' law.

**The relay judges the end, not the jumps.** The Steps are never the relay's. A span's door opens on a living member's
pose on the end plate WITH a fair trail (`spanFair`, section 18).

## 10. The legion - relentless adds

**One wave runner, widened from the gate's.** `stepHost` in `src/net/gateBrain.js` runs the Legion-Lord's three kinds,
tied to the gate's phase, court and trial. EG7 lifts their law into `net/egHost.js`, a runner driven by a hall's
geometry: a court's rim, a rift's place, a walkway's line, a span's air. The gate keeps its own: `stepHost` stays, its
frames and pins unchanged, and calls the shared pieces it can (`rimSpots`, the spacing law). This is the SERPENT1 rule
again: widen a seam whose default is the gate's own bytes.

**The kinds.** Bodies are Daggerfall's own mobiles (`MOBILE_TYPES`), so every player can draw them. A Morrowind body
(`CREATURE_MATCH`) re-skins one where the player's data and the budget allow. Every blow is a shape the telegraph pass
already draws, apart from the three section 20 adds.

| id | kind | does | bodies, by band | body | move | its blow |
|---|---|---|---|---|---|---|
| 0 | **Harrier** | runs at the living member FARTHEST from it, hovering | Imp (1); Giant Bat (3) in the Shade | r 0.5, h 1.5 | 5.0 m/s | Bite: disc r 2, 0.9 s, 12% + 4 (the gate's) |
| 1 | **Sapper** | walks to its OBJECTIVE: a Court's boss (heals it, the gate's law) or a Yard's nearest closed rift (opens it again at a third) | the Atronachs (35, 38, 36, 37) | r 0.7, h 2.3 | 1.6 m/s | none: it is the objective |
| 2 | **Ward-Bearer** | stands, pulses, holds a ward on what it guards (a boss, a portcullis) | Fire Daedra (26), Frost Daedra (25), Daedra Seducer (29), Daedroth (27) | r 0.6, h 2.2 | stands | Pulse: disc r 3.5, 1.4 s, 18% + 6 of the band's element (the gate's) |
| 3 | **Breaker** | winds a charge at a member, runs it, pushes | Daedroth (27); Gargoyle (22) in the Galleries | r 0.8, h 2.4 | 3.0 m/s; the charge 12 m/s | Charge: lane w 2.5 x 14, 1.1 s, 25% + 8, push 6 m |
| 4 | **Caster** | stands off 10-18 m, throws at a member every 6-9 s | Fire (26) or Frost (25) Daedra; Lich (32) in the Cairn | r 0.6, h 2.2 | 2.0 m/s | Bolt: disc r 3 at the member's feet, 1.6 s, 20% + 6, element, leaves a pool (`POOLS` hellfire's) |
| 5 | **Diver** | flies at 6-10 m, circles, dives a lane at a member | Harpy (13), Daedra Seducer (29, winged), Dragonling (34) | r 0.6 | 6.0 m/s | Dive: lane w 2 x 10, 1.0 s, 18% + 5 |
| 6 | **Sentinel** | dormant until a member passes within 6 m (an ambush), then slow and heavy | Gargoyle (22); Iron Atronach (36) in the Wellhead | r 0.9, h 2.6 | 2.2 m/s | Smash: disc r 3, 1.3 s, 30% + 10 |
| 7 | **Binder** | stands back, raises the last fallen add of its wave once: a 6 s cast, broken by a blow worth a tenth of its health | Lich (32), Ancient Lich (33) | r 0.6, h 2.2 | 1.2 m/s | none: the raise |
| 8 | **Wraith** | drifts through, tethers the nearest member: 3% of max health a second while within 8 m, broken by putting 10 m between | Wraith (23), Ghost (18) | r 0.5 | 2.5 m/s | Drain: tether (section 20) |

The **push** is a new blow effect, applied by the struck client as the Steps' gust is (`collider.move`, capped per
frame), and resisted by the Iron Footing Vestige. Near an edge it is a cast-back. On a span it is the Spire's sharpest
tool.

**Health and the waves.** A kind's health is seconds of reference damage, as the gate's are (Harrier `HARRIER_S` 3 s of
the hall's mean reference damage). It is shared over a wave where the kind is a team's, scaled by depth:
`x (1 + 0.04(c-1))`. A wave's size counts the living company as the gate's do, clamped by kind. Its cadence and
standing cap are the hall's (section 7), quickening with depth (section 15). The kinds unlock by band:

- Galleries: 0, 1, 2, 3, 4, 6;
- Cairn: + 7, 8;
- Shade: + 5;
- Wellhead: all, with a Daedra Lord (31) as an elite add (5x health, the Warden's Cleave) one wave in six.

**Pure, and the relay's.** The runner's dice are the beat's rng (the relay's CSPRNG), as every brain's are. Its frames
are the Legion-Lord's: `ad` (a wave risen), `amv` (the walks), `aatk` (a blow), `ah` (a health), `adie` (gone). Blows
on adds arrive as `ahit` through `applyHostHit`'s hand and purse. A hall with no legion draws no dice.

## 11. The Kyn - the bosses

### 11.1 One seam for every boss

The relay hosts three bosses today, each by hand:

- `_gateTick`/`_gateFrame`/`_gateFall`;
- `_sdFightTick`/`_sdFightFrame`/`_sdFightFall`;
- the serpent's.

A realm holds ONE fight (`this._sdFight`). The Spire needs a different boss every fifth hall, so EG3 builds **one boss
seam** (`net/bossSeam.js`). It is the shape every brain already keeps by convention, made a contract:

```
new(profile, rng)            join(f, sub, name, lv, now, present)      hit(f, sub, d, r, pose, now, seq)
step(f, now, bodies, rng) -> frames[]      stateOf(f)      judge(f, blow, trails) -> [{sub, share}]      earned(f, sub)
```

The gate, the Remnant and the serpent are re-plugged into it with their pins unchanged and their frames byte for byte.
The Spire's bosses are written to it. The hand and the purse (`spendBlow`, `spendPurse`), the share's retirement
(`retireShare`/`restoreShare`), the seat (`freeSeat`), the chart (`damageChart`) and the choice of blow
(`chooseAttack`) are already exported from the gate's brain, and the Remnant already imports them.

### 11.2 The law every Kyn keeps

- **Health**: `ttkRef(c)` seconds of reference damage per fighter (`dpsRef(lv)`, the gate's level claim), added as the
  gate adds its fighters. `ttkRef(c) = EG_TTK_S (180) x EG_TTK_GROWTH (1.07)^(c-1)` (section 15).
- **The bucket**: the gate's: `BUCKET_RATE_X` 3, `BUCKET_DEPTH_X` 15, `HIT_CAP_X` 12, each member's times their
  Vestiges' `bucketX` (section 13).
- **Blows**: shares of the struck member's own maximum health, resolved on the struck member's machine (co-op's law),
  scaled with depth: `x min(1.75, 1 + 0.03(c-1))`.
- **Phases** at the gate's `PHASE_AT` (0.66, 0.33) unless the boss says otherwise, each turn shielded `SHIELD_MS`
  (3 s).
- **Targeting**: the gate's: 60% to the top of threat (`THREAT_PICK`), 40% to a random living member, threat forgetting
  `THREAT_DECAY` a second.
- **Fury**, the endless Kyn's Wrath. At `EG_FURY_RATIO` (1.25) x `ttkRef(c)` seconds into the fight, a boss turns to
  fury: *Ozzath rages.* Every 30 s after, its shares grow by a tenth (`EG_FURY_SHARE_X` 1.10) and its wind-ups shorten
  by 3% (`EG_FURY_WINDUP_X` 0.97), never under their floor. Fury is not a wall. A company that cannot outdamage it
  can still outlast it, for as long as it reads every blow. The wall is the count (section 15).
- **THE WIND-UP FLOOR** (pinned, for every blow of every boss and add, under every brand and every fury):
  `windup >= escapeS(shape) = farthest point's distance to the shape's edge / EG_ESCAPE_MPS (7.6) + EG_REACT_S (0.35)`.
  The gate's own promise (*"a player runs 7.6 m/s, and every wind-up is long enough to run out of its shape from its
  middle"*), written as a law with a reaction's slack. 7.6 m/s is the gate's measure, `runSpeed` at the default build.
  Every blow the gate ships keeps it, the tightest being the Warden's Slam in his third phase (disc r 7: floor 1.27 s,
  wind-up 1.6 s x `PHASE3_WINDUP` 0.8 = 1.28 s). A build slower than the default has the Fleet Vestige and its own
  Speed to answer it.

### 11.3 The roster

`bossOf(seed, c)` draws a Court's boss from its band's pool, never one of the two before it. **Every fifth Ward (Hall
25, 50, 75, 100...) is a Valkynaz.** A band whose bosses have not shipped draws from those that have, so the content
ships band by band (section 24). Bodies are Daggerfall's, drawn large, as Ruhn is (`BOSS_LOOKS`: a mobile and a scale).

**The Broken Galleries**

1. **Grath, Hound of the Wellhead** (`hound`; Daedroth 27, x3). The Court is three islands (r 11) joined by narrow
   bridges.
   - It bounds from island to island (the Warden's Leap). The island it leaves cracks and falls for 15 s: a Crumble at
     a court's scale.
   - Gore: a lane, 18 m, pushes 8 m.
   - Savage: a cone, 7 m, 110°.
   - The Scent: a mark on one member; for 10 s it hunts only them, faster. They kite across the bridges while the
     rest punish.
   - Phase 2: the bridges burn by turns. Phase 3: two Scents at once.
   - *A fight about ground.*
2. **The Last Battlemaster** (`battlemaster`; Ancient Lich 33, x2.5): the Spire's own master, raised by the Kyn.
   - Ward-Rings: two to four lit rings (the HAVEN shape, section 20); everywhere else takes the nova. The gate's dodge,
     turned inside out.
   - Arcane Lattice: parallel lanes swept across the court in sequence (the LANES shape).
   - Mirror Images: three images whose wind-ups are feints; only the true one casts a shadow on the floor.
   - Blink: across the court.
   - **The Examination** (phase 2): four runes light on the rim in an order shown above him. Four members must stand
     on them in that order within 8 s. Failed: 60% to all. Passed: he is stunned 8 s and takes x1.5 (the crystals'
     law, `STUN_MS`, `STUN_HIT_X`).
   - **The Final Examination** (phase 3): he binds a member in a ward for 8 s. The company breaks three seals or the
     bound one takes 999%.
   - *A fight about reading.*
3. **Kynreeve Ozzath of the Muster-Yard** (`marshal`; Fire Daedra 26, x3).
   - Shielded while his rifts stand (the Yard's law at a Court's scale, three to five), the waves relentless.
   - Flame Wall: a lane sweeping the court.
   - Hellfire: discs under members, the gate's.
   - The Brand: a mark that erupts 2 s later where the marked member stood. Spread.
   - Phase 2: Sappers march to heal him (the gate's `SAP_HEAL`). Phase 3: his rifts reopen once.
   - *A fight about the legion.*
4. **Valkynaz Ilthys, Prince of the Galleries** (the Valkynaz at Ward 5; section 11.4).

**The Soul Cairn**

5. **The Soul-Warden** (`soulwarden`; Lich 32, x3).
   - The Soul Tithe: every 25 s each member takes a soul-mark. It must be laid in one of four soul-gems on the rim
     (stand 1.5 s) within 9 s, or it bursts: 30%, and a Wraith rises.
   - When all four gems are full (eight souls each) he is laid bare: stunned, x1.5.
   - Wraiths drain.
   - *A fight about eight people's errands.*
6. **The Twin Kyn, Vael and Isk** (`twins`; Fire Daedra 26 and Frost Daedra 25, x2.6 each). Two courts joined by a
   walkway.
   - They must fall within 15 s of each other, or the survivor raises the other at half (the Echoes' law,
     `SD_ECHO_PAIR_MS`).
   - Vael's blows burn pools; Isk's slow.
   - Every 60 s they cross the walkway and change courts, and anyone on it is struck.
   - *A fight about splitting the company.*
7. **Valkynaz Morvayn of the Cairn** (Ward 10).

**The Shade Perilous**

8. **The Mother of Dusk** (`dusk`; Daedra Seducer 29, x3, winged; the Morrowind `winged twilight`, which flies). She
   circles over the void beyond the court, out of a blade's reach.
   - Dives (lanes) and Hellfire.
   - Three chains on the rim: standing at one for 3 s pulls it, while she dives at whoever pulls. With all three
     pulled she is dragged down and grounded for 20 s, x1.3.
   - The court is dark outside its braziers. Telegraphs keep their full light (section 20); the floor does not.
   - Her Eclipse: the braziers gutter in turn.
   - *A fight about the air.*
9. **The Night-Stalker** (`stalker`; Vampire Ancient 30, x2.5).
   - He vanishes; only his shadow walks the floor.
   - Blood Tether on two members, broken by standing 14 m apart for 2 s; he heals from it.
   - Bat swarms: Harriers as Giant Bats.
   - *A fight about distance.*
10. **Valkynaz Seyth of the Shade** (Ward 15).

**The Havoc Wellhead**

11. **The Bound Colossus** (`colossus`; Iron Atronach 36, x4): the Battlemages' war-engine, Dagon's now.
    - It walks a fixed route down a long court (55 m), stamping lanes.
    - Four vent-hearts on its route must break before its Overload every 75 s (the Remnant's Hearts and its Reset,
      `heartCountFor`). Broken in time: stunned 8 s, x1.5. Not: 70% to all.
    - Chain lightning: discs that leap between members within 6 m. Spread.
    - *A damage race.*
12. **The Wellhead Wyrm** (`wyrm`; Dragonling 34, x5, flying).
    - It perches on three spires, breathing lanes and cones; it takes flight and drops meteors.
    - Each spire has health. With its perch broken it lands, x1.3, until it finds another.
    - *A fight for bows and spells.*
13. **The Wellhead's Valkynaz** (Ward 20 and every fifth after).

### 11.4 The Valkynaz

ONE brain (`net/egLord.js`) with a signature per band: the Warden's kit made a prince's. Body: Daedra Lord 31, x3.3,
Ruhn's look in another aspect. The kit:

- Cleave, Slam, Charge, the Crushing Leap and the Meteor (the gate's `ATTACKS`, at the depth's shares);
- three courts and their walkways (WB9b's `COURTS` and `WALKS`), crossed as Ruhn crosses them.

The signatures:

| Valkynaz | Ward | aspect | signature |
|---|---|---|---|
| **Ilthys, Prince of the Galleries** | 5 | Burning | **the Conquest**: at each court he plants a banner (a Ward-Bearer that holds his ward) and the Galleries' gold HAVENS appear. Stand in one through his Conquest nova |
| **Morvayn of the Cairn** | 10 | Venom | **the Harvest**: the Reckoning's crystals (WB9c, `crystalCountFor`) as soul-gems. Break them all before the Harvest lands, or 999% |
| **Seyth of the Shade** | 15 | Rime | **the Shroud**: the court goes dark but for his own glow, and two mirror princes fight beside him. The true one's blows alone land; his shadow tells |
| **the Wellhead's Valkynaz** | 20, 25, 30... | each in turn | **the four signatures in turn**, each Valkynaz under the next aspect, under every brand the circle carries |

A Valkynaz's Ward pays twice (section 16). The first Valkynaz a company fells is their first true feat in the Spire.

## 12. The brands - what deepens a circle

At each Ward the next circle's **brands** are drawn and shown on the Ward-stone: *The next Ward bears: Unmoored,
Hunting Pack.* The company knows what is coming before they choose to go on.

**How many**: circle 1, none. Circle 2 onward: `min(6, 1 + floor((c-2)/2))`, so one in circles 2-3, two in 4-5, up to
six from circle 12.

**From three pools**, merged by the Hour's rule (`sdMarksLaw`: a key ending in `X` multiplies, any other is overridden
by the last mark that names it):

- **the gate's trials** (`GATE_TRIALS`, `src/net/gateMods.js`), on the Court's boss alone: Colossal, Unyielding,
  Grudge-Bearer, Vengeful and the rest. The Legion-Lord's is a Court's adds;
- **the Hour's omens** (`SD_OMENS`, `src/net/sdMarks.js`), where they speak of blows;
- **the Spire's own**, hall-wide:

| brand | what |
|---|---|
| **Unmoored** | every span carries a Gust, its push +1 m/s |
| **Hunting Pack** | Harriers on every hall, a wave every 30 s |
| **Legion's Tithe** | every wave one body larger (`sizeX` 1.25) |
| **Ashfall** | fire falls on courts, a meteor's disc every 12 s |
| **Iron Discipline** | the legion's blows unstoppable, their wind-ups x0.9 (never under the floor) |
| **Pyre-Bound** | a slain add bursts: disc r 2.5, 1.0 s, 10% |
| **Crumbling Halls** | every span carries a Crumble; crumble delays x0.8 (never under the floor) |
| **Kyn's Vigil** | every hall's trial begins with a Kynreeve champion at the arrival plate |
| **Wellspring** | Yards one rift more, each pouring a fifth faster |
| **Echoing** | a Breaker's charge echoes, a second lane 1.2 s after |
| **Swarm-Mother** | every wave carries a Binder |
| **The Fraying** | the Athenaeum's fray shortened (the Hour's 36) |
| **Short Count** | the next Ward holds the breach 10 minutes, not 15 |
| **Thin Wards** | the next Ward's rest heals half |

Two from one family never share a circle (blows, legion, ground, count). Every brand is relay-side, or the shared
clock's law, or a word the relay says (a rest's heal). None asks the client to handicap itself.

**The profile.** `egFightProfile(marks)` folds them as `sdFightProfile` does. Its cache is keyed by the sorted mark
string and bounded (LRU 256): the gate's and the Hour's caches assume a bounded set of 185 or 216, and the Spire's
combinations are not bounded. The Spire's frames carry up to six marks under their own validator. The gate's
`validGateMods` (three words) is not touched.

## 13. Vestiges - what the Battlemages left

**My decision on question 4: yes.** An endless run without a build that changes inside it plays the same at Hall 60
as at Hall 6. Eight members choosing what to become is what makes a company more than eight builds. So:

- at each Ward, every living member is offered **three Vestiges**, drawn by the relay's rng, and takes **one** within
  the Ward's rest (60 s; unpicked, the first is taken);
- taking one held again ranks it, **I -> II -> III**. An offer never shows one held at III;
- they last until the breach closes. The room holds each member's, says them to the company (auras need it), and the
  Ward's receipt carries them.

**The trust law.** A player owns their body (co-op's law). A Vestige that changes only the holder's body (health,
resistance, speed) is as honest as their save. Every Vestige that raises damage on a relay foe does so through the
relay: it declares a `bucketX` the relay applies to that member's bucket, or the relay applies it itself because it
knows the inputs (an add's health, a distance between poses, an ally's place). So a damage Vestige moves the cap
exactly as far as it moves the damage. No Vestige revives. The one life stays the one life.

| family | Vestige | I / II / III | applied by |
|---|---|---|---|
| **Bulwark** | **Stoneskin** | +10 / 18 / 25% max health | client |
| | **Iron Footing** | push taken -35 / 65 / 100% (Breakers, Pendulums, gusts) | client |
| | **Second Wind** | once a hall, falling under 30% heals 15 / 25 / 35% | client |
| | **Bastion** | allies within 6 m take 4 / 8 / 12% less from blows | each ally's client, from the room's word |
| | **Warden's Oath** | your threat x1.5 / 2 / 2.5; bosses' blows on you -5 / 10 / 15% | relay (threat), client (blows) |
| **Brand** | **Searing Edge** | melee blows +3 / 6 / 9 fire | client; `bucketX` 1.05 / 1.10 / 1.15 |
| | **Momentum** | blows on one target +4% each, to 3 / 4 / 5 stacks | client; `bucketX` 1.06 / 1.08 / 1.10 |
| | **Cleaving Arc** | melee blows splash 20 / 35 / 50% to adds within 3 m of the target | relay (host hits) |
| | **Bloodied Fury** | under half health +10 / 18 / 25% damage | client; `bucketX` 1.05 / 1.09 / 1.12 |
| | **Executioner** | +30 / 45 / 60% on adds under a quarter health | relay (it knows the add's health) |
| **Shroud** | **Long Sight** | shafts and spells from beyond 12 m +8 / 14 / 20% | relay (it knows both poses) |
| | **Featherstep** | your crumbles wait +0.2 / 0.35 / 0.5 s; cast-backs cost 10 / 7 / 5% | client (crumbles are private) |
| | **Fade** | after you strike, adds lose you for 1.5 / 2.5 / 3.5 s | relay (targeting) |
| | **Hunter's Mark** | your first shaft on a foe marks it 8 s: the company deals +5 / 8 / 12% to it | relay |
| | **Fleet** | run speed +4 / 7 / 10% | client (spans are laid for the modest build) |
| **Mantle** | **Battlemage's Focus** | spell cost -10 / 18 / 25% | client |
| | **Overcharge** | spell blows +8 / 14 / 20% | client; `bucketX` 1.08 / 1.14 / 1.20 |
| | **Spellward** | every resistance +10 / 18 / 25 | client (the saving throw) |
| | **Wardweaver** | your Shield spell soaks +20 / 35 / 50% | client (`hurtPlayer`'s pool) |
| | **Arcane Echo** | a damage spell repeats at half, 10 / 16 / 22% of casts | client; `bucketX` 1.05 / 1.08 / 1.11 |
| **Legion** | **Rally** | when a hall's door opens, the company heals 8 / 14 / 20% | each client, from the room's word |
| | **Banner of the Spire** | allies within 10 m +4 / 7 / 10% damage | relay (`bucketX` while near) |
| | **Watchfire** | a blow aimed within 12 m of you is told 0.15 / 0.25 / 0.35 s before its wind-up | relay (an early `tell` frame) |
| | **Brotherhood** | when an ally falls, the living deal +10 / 15 / 20% for the rest of the hall | relay |
| | **Steadfast Line** | with three allies within 8 m, you take 5 / 10 / 15% less | client, from poses |

**Offers.** Three from all five families, no two from one family, never one at III. The first Ward's offers lean (2 of
3) toward the family of the member's highest-damage share in the circle (the chart's `x`). That nudges, never decides:
the room knows nothing of classes and should not.

## 14. Wards - checkpoints, one life, what you keep

**One life a breach.** A death in the Spire (the pose's `dd`), or an absence past 120 s, is a FALL:

- the fallen are cast out to the arch's landing, the gate's `gateLandingFor` (10 m before its face, turned away), at
  half health: *The Spire casts you out.*;
- the room keeps its dead (`egdead`, SD-ONELIFE's `_sdMarkFallen` keyed by the breach) and its door refuses them after:
  *The Spire will not take you back.*;
- no Resurrect in the Spire (SD-ONELIFE's reason: a body raised in place stands in a fight its death has left);
- **no DFU death penalty**. The loss is the run. (The court runs `applyDeathPenalty` before its own branch; the Spire's
  fall is exempt, and EG9 checks the court's path while it is there.)

**A Ward is a checkpoint.** When a Court's boss falls, the Ward lights for every living member at once, and each gets
an `e1` **receipt** (section 19). The receipt banks:

- **the depth**: the Ward joins the member's lit Wards (`players.eg_ward_max`), a start for every breach after;
- **the circle's spoils**: rolled from the receipt's seed and thrown at the Ward like the gate's spew (section 16);
- **embers and Marks**: paid at the claim;
- **the board's standing** (section 17).

**The tally.** Between Wards, each hall cleared adds to the company's TALLY, shown on the HUD (*Tally: 3 halls*). The
tally is what the next Ward pays for. Halls cleared count on the board at once (section 17), but their spoils and
embers are paid only when a Ward lights. **A fall, the tear, or a company wiped loses the tally since the last Ward.**
That is the push of the Spire: nobody can bank alone, and the Ward lights only for the living.

**The rest** (`EG_WARD_REST_S` 60 s, the count still running):

- health, magicka and fatigue restored (the room's word, each client its own body; half under Thin Wards);
- the Vestige offer (section 13);
- the next circle's brands shown;
- **the way home**: a gold arch beside the stone. Stepping through ends the member's run and keeps everything. It is
  the only way out but a fall or the tear;
- then the stair down opens, and the muster law takes everyone left.

**Starting deeper.** A breach may start at any Ward its opener has lit (section 4). Its members must each have lit
that Ward to be admitted. The Spire is a ratchet: every Ward lit is a door into it that stays. No carries: a member
who has not reached the start Ward cannot be brought past it.

## 15. Depth - the numbers that grow, and the wall

**Mechanics first** (Balance-Arc: *"a band-aid is a multiplier on every foe's health"*). What grows with the circle
*c*, in the order a company feels it:

1. **brands**: none, then one to six (section 12);
2. **new kinds and pieces** by band (sections 9, 10);
3. **cadence**: a rift's wave every `max(9, 20 - 0.5(c-1))` s; the legion's cap `clamp(4 + n, 6, 14)`; a Harrier's
   retarget shortens;
4. **span timing**: the pieces' numbers walk from their Ward-0 values to their floors (section 9), linearly over
   circles 1-20, then hold;
5. **numbers, gently**: boss health `ttkRef(c)`; add health `x (1 + 0.04(c-1))`; shares `x min(1.75, 1 + 0.03(c-1))`;
6. **fury**, for a company slow against its boss.

Bounded by **THE WIND-UP FLOOR** (section 11.2), **THE SPAN ENVELOPE** and **THE TIMED SOLVER** (section 9). No growth
reaches past them.

**The bosses' clock** (`ttkRef`, at the company's reference damage, and at the trust law's cap, the gate's
`(TTK - BUCKET_DEPTH_X) / BUCKET_RATE_X`):

| circle | Ward | ttkRef | at reference | at the cap |
|---|---|---|---|---|
| 1 | 1 | 180 s | 3:00 | 55 s |
| 5 | 5 | 236 s | 3:56 | 1:14 |
| 10 | 10 | 331 s | 5:31 | 1:45 |
| 15 | 15 | 464 s | 7:44 | 2:30 |
| 20 | 20 | 651 s | 10:51 | 3:32 |
| 25 | 25 | 913 s | 15:13 | 5:00 |
| 30 | 30 | 1280 s | 21:20 | 7:02 |

**The wall is the count.** A circle's time is its four halls, its Court, its rest and its musters. Fifteen minutes
come back with each Ward. A model, to be measured in the field by EG's tuning pass:

- **a company at reference damage**: circle 1 takes about 16 minutes and drains slowly. The count runs out around
  **Ward 7-8 (Hall 35-40)**;
- **a company at twice reference**: banks to the 30-minute cap early and breaks even around circle 15. It reaches
  about **Ward 18-20 (Hall 90-100)**;
- **a company at the cap all fight** (the strongest builds, perfect play, and what a modified client could at most
  deal): about **Ward 25-30**.

So the board's top lies past Hall 100, where the Wellhead never changes again, and no law sets a ceiling. The trust law
sets the cap, the count sets the pace, and the floor keeps every blow readable. How far a company gets is how well it
plays.

## 16. Spoils, the Panoply and the honours

**At every Ward**, to each living member, at the claim of their `e1` receipt:

| what | how much | its law |
|---|---|---|
| **Deadlands Embers** | `1 + floor(w/5)`: Wards 1-4 one, 5-9 two, 10-14 three... | the Broker's currency (`BROKER_PRICES`) |
| **Marks** | 20 | a new faucet `MARKS_FAUCETS.eg`, inside `MARKS_COMBAT.perDay` (150) shared with the gate, the raids and the serpent |
| **a guild's deed** | 25 to the treasury, when three members of one guild light the same Ward | the gate's deed law, at most 4 a guild a day |
| **spoils** | rolled on the receipt's seed, thrown at the Ward: `rollEgSpoils(seed, level, w)` | below |

**The spoils** (`systems/egSpoils.js`, `rollSdSpoils`' order, every new draw after the last one SET6's law allows):

- gold;
- one Rare or Legendary piece. The Legendary's chance is 20% at Ward 1, +4% a Ward, to 80%;
- one to three `magicOrBetter`;
- **a Panoply piece**: 1 in `max(4, 12 - floor(w/2))`, so 1 in 12 at Ward 1 and 1 in 4 from Ward 16; **1 in 3** at a
  Valkynaz's Ward;
- the boss's **card** (`bossCardRoll('spire')`, 200 per mille, the gate's rate). Each of the thirteen Kyn has its own
  card (CARDS9's law: a boss's own card);
- sockets, gems and the technique pass, as the gate's.

A Valkynaz's Ward rolls its spoils **twice** (two seeds from the receipt's).

**THE BATTLEMAGE'S PANOPLY** is the war-gear the Imperial Battlemages wore in the Spire, taken by the Kyn: nine Aetheric
pieces of Mithril make, light enough for a spellsword. It is a Sigil Set: each piece's sigil names the set, and the set
grows by its lowest piece (`Sigil-Sets.md` section 5).

| piece | template |
|---|---|
| The Battlemage's Warhelm | Helm |
| The Battlemage's Right Pauldron, The Battlemage's Left Pauldron | Pauldrons |
| The Battlemage's Cuirass | Cuirass |
| The Battlemage's Gauntlets | Gauntlets |
| The Battlemage's Greaves | Greaves |
| The Battlemage's Boots | Boots |
| The Spire-Ward | Kite Shield |
| The Spire-Saber | Saber |

| pieces | ability | Faint -> Ascendant |
|---|---|---|
| 2 | **Ward of the Spire**: every resistance and your magicka | +5 -> +15; +10 -> +30 magicka |
| 4 | **Battlemage's Discipline**: a spell cast arms your next weapon blow with its element; a weapon blow returns some of your last spell's cost | +20% -> +50% of the blow; 5% -> 15% of the cost |
| 6 | **The Last Ward**: a blow that takes you under 20% (never a killing blow) raises a ward that soaks part of your max health for 6 s, half of it shared with allies within 8 m; then it must recover | 15% -> 40%; recovers 240 -> 120 s |

**No Gilded piece.** Mac, of the Hourlock: *"The most rare and gilded item in the entire game"*. GILDED1 made it the
one. The Spire's top drop is the Panoply.

**The honours** (service-recorded, `players.eg_honours` bits beside `eg_ward_max`; added as `titles.js` adds every
honour: the id in `TITLES`/`AURAS`, the branch in `titlesHeld`/`aurasHeld`, the words in `playerBadge.js`):

| at | title | aura |
|---|---|---|
| Ward 2 (Hall 10) | **Spirewalker** | - |
| Ward 5 (Hall 25, the first Valkynaz) | **Ward-Lighter** | - |
| Ward 10 (Hall 50) | **Kynbane** | **Wardlight** (gold-white motes) |
| Ward 15 (Hall 75) | **Battlemage of the Spire** | - |
| Ward 20 (Hall 100) | **Wellhead-Walker** | **The Burning Stair** (falling embers) |
| a season's top ten (section 17) | **Spire Champion**, held through the next season | - |
| the first company ever to light Ward 10 | **First of the Spire** | a unique Wardlight |

*First of the Spire* is granted as *Hour's First* was: a list in the service's config and the mailbox. Titles are
earned, never bought: the Broker's insignia stay the gate's.

## 17. The boards and the herald

**The boards** (`/v1/eg/board`, `egBoardOf`; the season is the arena's, `arenaSeasonOf`, eight weeks; rows from
`topWithMe` and names from `boardNamesOf`, `iliacBoardOf` being the precedent):

| board | who | ranked by | the row |
|---|---|---|---|
| **The Descent** | companies of 2-8 | the deepest hall cleared in one breach this season, then the fewest seconds from the opening to that hall's door | the company's names (up to 8), the start Ward, the band |
| **Alone** | companies of one | the same | the name, the start Ward |
| **The Hall of Wards** | every account, all time | the deepest Ward ever lit | the name, the Ward, when |

A hall cleared counts when the relay clears it (sections 6 and 18), whether or not the next Ward was lit. The board
measures depth. The Wards pay. A row shows its start Ward, so a Descent that began at Ward 8 says so. The Descent's and
Alone's top ten at a season's end hold **Spire Champion** for the season after (`iliacHonoursOf`'s pattern).

**The herald** (`net/egHerald.js`, pure builders like `src/net/gateHerald.js`; the gate's webhook, its role as the
fallback the Hour's and the serpent's use, no ping):

- a company lighting Ward 10, 20, 30...: *<opener>'s company lit the Tenth Ward of the Battlespire (Hall 50) in
  1:42:10.*;
- a new top of the Descent;
- *First of the Spire*.

An opening is never heralded: a company's breach is its own.

## 18. Integrity - what the relay judges

The gate's trust law, kept whole:

- **blows on the Kyn and the legion**: `applyHit`'s hand and purse, the bucket by the level claim times the Vestiges'
  `bucketX`, a melee pose within reach, from the hall's floor;
- **the Kyn's blows on members**: ONE judge for every shape (`net/bossRef.js` widened). The gate, the Remnant and the
  serpent each have a judge of their own (`judgeGate`, `judgeRemnant`, `judgeSerpent`), but every Spire blow is a
  telegraph shape (`TELEGRAPH_KIND`) stamped on its frame (`shapeStamp`). So `judgeShapes` tests any blow against the
  pose trails the relay holds (`posAt`/`posAfter`, `deepIn`, `BODY_AFTER_MS`) and feeds `bossBody` (`bodyStruck`,
  `bodyCensus`). The Spire runs it from the first slice that has a blow;
- **a span's end**: `spanFair(trail, spec)`. The member's pose trail across the span must hold no step faster than the
  fastest legal move (the run with Fleet III and the Jump spell, x1.25 slack) and no stretch outside the course's
  corridor (the spec's platforms, plus the gusts' and the rails' reach). An unfair trail opens no door, and its
  measures ride the receipt (`m`);
- **a hall cleared**: only the relay says so (the legion broken, the lock solved, the champion or the boss fallen, a
  fair end);
- **the board and the Wards**: from receipts alone. The service never takes a client's word for a depth;
- **the Sigil**: the service's count (section 4).

A modified client can still refuse to take damage (a player owns their body). Under `BOSS_BODY` enforcement the relay's
count fells it as it fells a gate's fighter. The Spire's board is measured with enforcement on: EG13 turns it on for
`eg:` rooms when the board opens, whatever the gate's setting is.

## 19. The wire

**The room family.** `eg:<16 hex>`, the breach id the service mints with the open order. Its law:

- `isEgRoom` (`/^eg:[0-9a-f]{16}$/`) in `net/egLaw.js`;
- the Worker's prefix gate (a `startsWith('eg:')` line beside `gate:` and `sd:`): an unknown key gets no object;
- its tick, `_egTick`, in the `alarm()` chain before `_alarmRest`, stepping every `BRAIN_TICK_MS` (250) while a hall
  lives;
- its state checkpointed every `CHECKPOINT_MS` (2 s), the gate's.

**Orders**, signed by the service with `IDENTITY_PRIVATE_KEY`, checked by the relay with `verifyOrder` against
`IDENTITY_PUBLIC_KEY`, spent once in room storage (CARDS6's stake orders are the precedent):

| order | fields | life |
|---|---|---|
| `o:'egopen'` | `b` (the breach id), `s` (the opener's sub), `st` (the start Ward), `i` (an order id) | 120 s |
| `o:'egadmit'` | `b`, `s` (the member's sub), `i` | 60 s |

**The hub's route.** `EG_INTERNAL_COMPANY` (`/internal/eg/company`): body `{sub}`, answer `{members: [sub...]}`, the
opener's party's strict roster, or the opener alone. Asked once, when the room accepts the open order.

**The arch on the cell.** The opener's client says the arch on its world cell (`{t:'eg', k:'arch', b, x, z, yaw, px,
py, riseAt, openAt, o}`) on full frames while within 600 m (the beacon's reach). Peers stand it from it, as
`portalWire` rides a peer's frame. The relay reads none of it. Admission never depends on seeing it.

**Frames** (`{t:'eg', k, ...}`, `EG_KINDS` / `EG_OUT_KINDS` in `net/wire.js`, each with its validator):

| frame | way | what |
|---|---|---|
| `{k:'open', z}` | opener -> room | the open order |
| `{k:'in', z, lv}` | member -> room | the admit order and the level claim (1-60) |
| `{k:'st', ...}` | room -> all | the breach: seed, `EG_SPEC`, hall, kind, beat (arrival, gather, trial, door, muster, rest), the count's end, the tally, the company (each `m1..`: alive, fallen, home), the brands |
| `{k:'wake', at}` | room -> all | the trial begins |
| `{k:'door', at, until}` | room -> all | the door opens; the muster ends |
| `{k:'down'}` | member -> room | stepped through the door |
| `{k:'hit', q, d, r}` / `{k:'ahit', i, q, d, r}` | member -> room | a blow on the boss / on add `i` |
| `ad`, `amv`, `aatk`, `ah`, `adie` | room -> all | the legion (the Legion-Lord's) |
| `{k:'atk', i, a, sh, at}` | room -> all | a boss blow: the body, the attack, its stamped shape, when it lands |
| `{k:'tell', i, a, sh, at}` | room -> those near a Watchfire holder | the blow told early (section 13) |
| `hp`, `ph`, `fury`, `fell` | room -> all | the boss's bar, phase, fury and fall |
| `{k:'pz', ...}` | member -> room | an Athenaeum turn (the Orrery's `SD_PZ_*` bounds) |
| `{k:'ward', w}` | room -> all | the Ward lit |
| `{k:'rcpt', r}` | room -> one | that member's `e1` receipt |
| `{k:'offer', v:[id,id,id]}` / `{k:'pick', v}` | room -> one / one -> room | the Vestiges |
| `{k:'home'}` | member -> room | the way home |
| `{k:'end', why}` | room -> all | why: `'tear'` (the count spent), `'gone'` (every member out) or `'last'` (the last word) |

**The receipt** `e1` (`net/egReceipt.js`, `mintEgReceipt`/`verifyEgReceipt`, signed by `GATE_SIGNING_KEY` as every
relay receipt is). Two kinds:

| kind | claims |
|---|---|
| `k:'w'`, a Ward lit | `b`, `w` (the Ward), `h` (the hall), `s` (the sub), `c` (the seed), `x` (the share dealt), `t` (seconds since the opening), `n` (the company's size), `st` (the start Ward), `vs` (the Vestiges), `m` (bossRef's measures), `z` (the open order's id) |
| `k:'x'`, the member's end | `b`, `h` (the deepest hall cleared), `s`, `t`, `n`, `st`, `why` (`'fall'`, `'home'`, `'tear'` or `'empty'`), `z` |

The opener gets a `k:'x'` even if nobody entered. It settles the open order's hold, so a raised but empty breach keeps
its Sigil spent.

**The account service** (EG2, EG13):

| route | does |
|---|---|
| `/v1/eg/sigils` | the count, for restacking |
| `/v1/eg/find` | a dungeon's find: the tier, the roll, the cap |
| `/v1/eg/open` | spends one, holds it, signs `egopen`, writes `eg_live` |
| `/v1/eg/admit` | checks the handle, the start Ward and `eg_live`; signs `egadmit` |
| `/v1/eg/claim` | `claimEg`: verifies `e1`, refuses another's, answers guests `guest`. For `w`: `INSERT OR IGNORE eg_wards (b, account, w)`, embers, Marks, the deed, `eg_ward_max`, the honours. For `x`: `eg_runs (b, account)`, the board's row, settles the hold, clears `eg_live` |
| `/v1/eg/board` | `egBoardOf` |

Migrations: the next free numbers when each slice lands, today `0109` (EG2: `players.eg_sigils`, `eg_holds`, `eg_finds`,
`eg_live`) and `0110` (EG13: `eg_wards`, `eg_runs`, `players.eg_ward_max`, `players.eg_honours`).

**Versions.** Each slice that moves the relay bundle bumps `RELAY_VERSION` (`world191` on this tree) with its `LAW` row,
and a game that does not know it is told to reload. Each that moves the service bumps `ACCOUNT_VERSION` (`acct111`). The
new titles and auras join `TITLES`/`AURAS` in `src/net/identityToken.js`, which is in the relay bundle.

## 20. The look

SD-LOOK's four rules are kept (`Super-Dungeons-Look.md`): the void is dark, structure does not glow, light appears only
where it means something, and every surface reads as Daggerfall pixel art. Textures are painted in code into the Spire's
pseudo-archives, **38231** onward (the next free range after the Hour's 382xx: 38231-38239 the arch and the Ward-stone,
38241-38249 the Galleries, 38251-38259 the Cairn, 38261-38269 the Shade, 38271-38279 the Wellhead).

**Five lights, five meanings, and no others:**

| light | means | where |
|---|---|---|
| **gold** | the way, and safety | arrival and end plates, doors, Ward-stones, checkpoint islands, HAVENS, the way home |
| **Dagon red** | his blows | every telegraph (the pass's `dagon` style and its elements) |
| **Battlemage blue** | yours | Vestiges, allies' auras, the company's marks over heads, Watchfire's early outline |
| **white** | the place's own timed hazard | vents ringing, pendulums' lanes, a Beat's blink |
| **the band's own** | where you are | soul-gem violet in the Cairn, moon-silver in the Shade, molten orange in the Wellhead; the Galleries keep marble and gold |

**The bands' ramps** (sRGB, five steps at least, as SD-LOOK's):

- the Galleries: marble `[150,146,138]`-`[214,210,200]`, gold leaf `[140,98,40]`-`[246,206,120]` (the Hour's brass,
  reused), Battlemage blue `[36,52,96]`-`[92,124,196]`, the Deadlands' red sky;
- the Cairn: slate violet `[34,28,44]`-`[120,108,140]`, soul-light `[120,200,230]`;
- the Shade: `[6,6,10]`-`[60,64,80]`, moon-silver `[160,166,176]`-`[214,220,228]`;
- the Wellhead: basalt (SD-LOOK's) and iron, molten `[255,120,30]`.

**The new telegraph kinds** in `TELEGRAPH_KIND` (`src/render/gateTelegraph.js`), each a seam whose default draws the
gate's own:

- **haven**: a gold disc that is safe while everything else fills red;
- **lanes**: parallel lanes, a Lattice;
- **tether**: a line between two bodies.

The pass's shape counts (`TELEGRAPH_POINTS_MAX` 10, `TELEGRAPH_SPOKES_MAX` 8) are raised to carry a Court's blows and
a legion's at once (24 shapes a frame). **Readability law**: in the Shade's dark, telegraphs keep their full light;
darkness takes the floor, never the warning.

**The arch** (section 5) and **the stair** between halls: the veil plays the fall past the Spire's broken underside,
its marble ribs and hanging chains, to the next hall's gold plate: 1.2 s, frame-synced, the same every time.

**Phones** (TI2): the HUD's count, hall and tally sit in the gate's boss-bar row (`src/ui/gateBossBar.js`
`bossBarModel` takes a Spire model). A Ward's rest window is one column on a phone.

## 21. The score

Written as notes for the game's own player and FM bank (`makeSong`, `w.note`, `w.hit`), in `systems/egScore.js`.
E Phrygian, the Kyn's colour against the Imperial brass: the Battlemages' fanfare, broken, answered by the legion's
drums. Chosen by a pure law, `spireScoreFor(place)`:

| song | where | tempo / length |
|---|---|---|
| SPIREGAL | the Galleries' halls | 100 BPM, 32 bars |
| SPIRECRN | the Cairn's halls | 88 BPM, 32 bars |
| SPIRESHD | the Shade's halls | 92 BPM, 32 bars |
| SPIREWEL | the Wellhead's halls | 110 BPM, 32 bars |
| SPIREYRD | a Yard's or a Rampart's trial (the band's motif in the brass) | 132 BPM, 32 bars |
| SPIREKYN1 / 2 / 3 | a Court, by phase | 138 / 144 / 152 BPM, 32 bars each |
| SPIRELORD | a Valkynaz, all phases, rising | 148 BPM, 48 bars |
| SPIREWARD | the Ward lit and its rest: the Battlemages' hymn | 72 BPM, 16 bars |
| SPIRECNT | the count's last 2 minutes, over anything | 160 BPM, 16 bars |
| SPIREEND | the tear, a fall, the end | 70 BPM, 12 bars |

Measured as the Hour's were (`tools/sdScoreProbe.mjs`'s law, `egScoreProbe.mjs`): every song sounding, peaks under
the ceiling, the war louder by phase, the end decaying in its time.

## 22. The four hosts

- `src/scenes/world.js` - WIRED:
  - the Sigil's arm and its refusals; the start window; the arch pool (`egArchPool`, the gate pool's law);
  - the Timers row, the sight line, the company's map mark;
  - the room link and the orders; each hall's transition;
  - the HUD (count, hall, tally) and the rest window; the claim queue (`createEgClaims`);
  - the score; the flight wards; no Resurrect; a death as a fall.
- `src/scenes/worldModes.js` - WIRED: `enterEgHall(spec)` as `enterSdRealm`; every hall's step under `stepThroughFire`;
  the arena clamp per hall (`realmClamp` over the spec's floors).
- `src/scenes/dungeonContext.js` - WIRED: `standEgHall(ctx)` stands the hall (meshes, collider buckets, the span's
  riders, the lights, as `standSdRealm`); the span's ride (`sdStepsRide`, generalised in EG4).
- `src/scenes/exterior.js` - FLAGGED: the `?exterior` bench is offline. There is no Elite Breach there, and the Sigil
  says so (*The Sigil is cold here.*).

Every slice record below names all four, each wired or flagged.

## 23. What it does not do, said so

- **No Abyss Breach.** The gate's third tier is named (section 2) and not built.
- **No revives.** No Vestige, spell or Ward raises the fallen.
- **No spectating.** The fallen are out. The company's progress reaches them on the Timers row and in party chat.
- **No company changes.** One who joins the party after the rising is not in the breach.
- **No trading or selling Sigils.** They are the account's.
- **No Elite Breach offline.** Offline there is no relay to run it.
- **No ordinary dungeon foes inside.** Every foe in the Spire is the relay's, or the one life would be a client's word.
- **No Gilded piece.** The Hourlock stays the one.
- **No weekly seed.** The budget (section 8) makes halls of a depth weigh the same. A shared seed would make the board
  a race to scout it.

## 24. Slices and their records

The order the arc ships in. Each slice can ship and be checked without the next; the content arrives band by band.

| slice | what | moves |
|---|---|---|
| **EG0** | this page | the bible |
| **EG1** | THE GATE'S TIERS: `systems/gateTier.js`, `GATE_TIER_TEXT`; the Regular tier's words unchanged | client |
| **EG2** | THE SIGIL: template 575, the service's count (migration), the rolls in `claimGate` and `claimSd`, `/v1/eg/find` and its death handler, `/v1/eg/sigils`, the restack, the launch gift | client, service |
| **EG3** | THE BOSS SEAM: `net/bossSeam.js`; the gate, the Remnant and the serpent re-plugged, frames and pins unchanged | relay (a version) |
| **EG4** | THE COURSE AS DATA: `courseOf`; the Hour's course byte for byte; the readers take a course | client |
| **EG5** | THE HALL LAW: `net/egLaw.js` (the record, the clock, the circle, the bands, the spec, the brands, the waves), pure, pinned with golden specs | client, relay bundle |
| **EG6** | THE SPAN GENERATOR AND THE TIMED SOLVER: `world/egSpan.js`, `egSpanSolve.mjs`, the 500-seed sweep | client |
| **EG7** | THE ROOM: the `eg:` family, the orders, the hub's company route, the run director (`net/egBrain.js`), the wave runner (`net/egHost.js`), `spanFair`, `judgeShapes`, the `e1` receipt | relay (a version), service |
| **EG8** | THE ARCH: the arm, the refusals, the start window, the arch pool, the cell word, the Timers row, the sight line, the map mark | client |
| **EG9** | THE HALLS ON THE PAGE: `world/egHall.js`, `scenes/egHall.js`, the transitions, gather, muster and pull, the HUD, the flight wards, the fall | client |
| **EG10** | THE YARD, THE RAMPART, THE ATHENAEUM, THE PROVING WALK: the kinds 3-8, the push, haven, lanes and tether | client, relay (a version) |
| **EG11** | THE WARD: lit, receipts, spoils thrown, the rest, the Vestiges (law, offer, effects, the relay's half), the way home | client, relay (a version) |
| **EG12** | THE GALLERIES' KYN: the Hound, the Battlemaster, Ozzath, Valkynaz Ilthys (`net/egLord.js`) | relay (a version), client |
| **EG13** | THE CLAIM, THE HONOURS, THE BOARDS: `claimEg`, the migration, titles and auras, the boards, the season's champions, `BOSS_BODY` on in `eg:` rooms, the herald | service, relay (a version), client |
| **EG14** | THE PANOPLY AND THE CARDS | client |
| **EG15** | THE LOOK: the bands' art, the arch's skin, the stair, the skies | client |
| **EG16** | THE SCORE | client |
| **EG17** | THE SOUL CAIRN: the Soul-Warden, the Twin Kyn, Morvayn, the Cairn's legion and pieces | relay (a version), client |
| **EG18** | THE SHADE PERILOUS: the Mother of Dusk, the Night-Stalker, Seyth | relay (a version), client |
| **EG19** | THE HAVOC WELLHEAD: the Bound Colossus, the Wellhead Wyrm, the Valkynaz in turn | relay (a version), client |
| **EG20** | AUDIT EG, and the tuning pass: the budget and the count measured in the field | all |

Each slice's record goes below as it lands: what shipped, its pins and mutant records, the four hosts, the Ledger rows
it opened or moved, and where it departs from this page.

### EG0 - written 2026-10-11 (the page)

The design, whole, before any code. Grounded in the shipped tree at `d9a3ced2`:

- the gate's clock (`net/gateLaw.js`);
- the made levels (`world/gateArena.js`, `world/sdRealm.js`);
- the brains and their shared hand (`net/gateBrain.js`, `net/sdRemnant.js`);
- the marks (`net/gateMods.js`, `net/sdMarks.js`);
- the Steps (`world/sdSteps.js`) and the engine's envelope (`player/motor.js`, `player/parkour.js`);
- the party (`PARTY_MAX` 8) and the hub's rosters;
- the receipts and their claims, the boards (`server-account/src/arena.js`) and the Portal Stone.

THE FOUR HOSTS: `scenes/world.js`, `scenes/worldModes.js`, `scenes/dungeonContext.js` and `scenes/exterior.js` are all
untouched. A page moves no host.
