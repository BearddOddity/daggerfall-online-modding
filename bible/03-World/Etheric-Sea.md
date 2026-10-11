# The Etheric Sea - past the Veil (ETHER-SEA, ETHER-PLACES, ETHER-PORTS, ETHER-SHIPS, ETHER-LEGENDS, ETHER-CROSSING, ETHER-CHART, ETHER-LIGHT, 2026-10-11)

The owner, 2026-10-11: *"A brand new open sea map that allows you to traverse to the etheric sea. Sail far enough and
you are prompted to travel into the open sea. The etheric sea is a infinite procedural oceanscape with procedural
islands with towns, dungeons, exotic resources, deadly legendary ships, and whatever more you can add to give meaning
to the etheric sea. This is all yours."* The Iliac Bay's own sea - its crews, its captain's standing, its spyglass, its
contracts, its exchange - is `03-World/Captains-Sea.md`; this page is the sea past the Veil.

**THE PORT'S OWN.** Nothing in Daggerfall or DFU lies past the Bay's western water, and nothing here is transcribed.
Where the game has a law it is used: the ground is grown by DFU's own terrain kernel from the two bytes a pixel it
always reads (WOODS.WLD's height, CLIMATE.PAK's climate - answered here instead of read), the isles' towns and ruins
are the game's own places cloned (MAPS.BSA's rows, as the spawned dungeons clone theirs), a hold is still the DFU loot
tables' roll, gold is gold. The departure is Port-Ledger section A's ETHERIC SEA row.

**THE SHAPE.** Sail far out on the open Abecean and the game asks whether to sail on into the open sea. Three days on,
the ship comes out off Veilhaven, the first port past the Veil - and from there the sea runs west for more than a
thousand leagues:

- **AN ENDLESS SEA, AND ITS DEPTHS** (ETHER-SEA): a box of the Bay's own pixel grid, 8,064 by 4,992 pixels (6,606 km
  by 4,089 km), far north of the continent; the deeper west of the Veil, the deadlier and the richer - the Shallows,
  the Reaches, the Deep Aether, the Abyss.
- **ISLES** (ETHER-SEA, ETHER-PLACES, ETHER-PORTS): a lattice of isles grown off one hash, each a PORT (a town and a
  freeport's quay), a RUIN (a dungeon), a WILD isle (an Etheric good on its strand) or a bare ROCK, named, in its own
  climate, on every client the same.
- **ITS SHIPS AND ITS LEGENDS** (ETHER-SHIPS, ETHER-LEGENDS): corsairs and the isles' traders under the sea's own names,
  no crown's navy and no crown's law - and six legendary ships, each with her own haunt, her own terror and her own
  purse, who come back from the deep a month after they are sunk.
- **A REASON TO CROSS** (CAPT-TRADE's Etheric goods, the strands, the legends' purses, the charts): ether-amber,
  starglass and voidsilk made on the isles and wanted in every port of the Bay; the Bay's goods wanted on the isles.
- **A CHART OF ITS OWN** (ETHER-CHART): the travel map's door past the Veil opens the captain's chart of the isles
  charted, the depths, the Veil and the legends' haunts heard of.

## The slices

| slice | what | modules |
|---|---|---|
| ETHER-SEA | THE SEA'S LAW: its box, the Veil, the depths and their bands; the isles' lattice, kinds, sizes, climates and names; the ground the kernel grows there, composed over the world's reader (the host's and the worker's), streamed, on the far ring | `world/ethericSea.js`, `world/streamingWorld.js` (`frames`), `world/terrainGenWorker.js`, `world/terrainGenClient.js`, `render/farRing.js` (`climatePast`), `scenes/shared.js` (`etherSeaOn`), `scenes/world.js` (the composition, the region's name) |
| ETHER-PLACES | THE ISLES' PLACES: a port's town and a ruin's dungeon cloned off the game's own rows onto the isle's centre pixel under their own id, name and index; a ruin of the deep elite | `world/etherPlaces.js`, `scenes/world.js` (`_locationToBuild`, `etherPlaceAt`, the templates, the online wake) |
| ETHER-PORTS | A FREEPORT: a port isle is a port to the deeds, the harbour book (its quays), the naval host's waters, the exchange (the Etheric goods made there) and its own harbourmaster's tab - the legends' rumours and a chart of its waters | `scenes/world.js` (`etherPortAt`, `etherPortNear`, `etherPortOf`, the port seams), `scenes/etherHost.js` (`office`, `chartOffer`, `buyChart`), `ui/navalYardWindow.js` (`etherOfficeText`) |
| ETHER-SHIPS | ITS TRAFFIC AND ITS LAW: corsairs and traders by the band, under the sea's names and the Isles' colours; no navy, no relief, no crown's law; corsairs' papers; the strands' casks | `systems/naval/etherShips.js`, `systems/naval/navalDirector.js` (`ctx.ether`), `scenes/navalHost.js` (`launch`, `chargeEther`, `etherCtx`, `pickStrand`), `scenes/etherHost.js` (`sites`, `gather`, `papers`), `systems/naval/shipKnowledge.js` (`coloursWords`) |
| ETHER-LEGENDS | SIX LEGENDARY SHIPS: their classes, haunts, terrors, purses; launched in their haunts, risen again a month after their end; the rumours | `systems/naval/etherShips.js`, `systems/naval/navalShips.js` (the six classes, `LEGEND_LEVEL`), `systems/naval/navalDirector.js` (`legendSpawn`), `scenes/navalHost.js` (`legendMend`, `reachOf`), `scenes/etherHost.js` (`legendHere`, `legendEnded`, `rumours`) |
| ETHER-CROSSING | THE CROSSING: asked at a helm on the open Abecean and in the Veil, once each time the ship comes into those waters; the voyage carries the captain, the ship, her crew and her hold | `systems/naval/etherCrossing.js`, `scenes/world.js` (`etherCrossStep`, `etherCross`, `crossLandPx`) |
| ETHER-CHART | THE CHART OF THE ETHERIC SEA: the travel map's door past the Veil | `ui/etherChartWindow.js`, `ui/navalPlunderDoor.js` (its slot), `scenes/etherHost.js` (`chart`), `scenes/world.js` (`openEtherChart`) |
| ETHER-LIGHT | THE LIGHT PAST THE VEIL: cold and violet on land, sea and hulls | `world/ethericSea.js` (`etherLight`), `scenes/world.js` (the frame's lights) |
| (the ledger) | WHAT A CAPTAIN KEEPS OF IT: the isles charted, the legends ended and heard of, the strands gathered, the way out, the crossings - in the Captain save | `systems/naval/captainLedger.js` (`ether`, `chartIsle`, `endLegend`, `gathered`, `setCrossedFrom`, `crossed`, `hearLegend`), `scenes/etherHost.js` |

## ETHER-SEA - where it lies, and what grows there

**THE BOX** (`ETHER_BOX`): pixels x 64 up to 8,128, y -7,680 up to -2,688, on the Bay's own grid (819.2 m a pixel - one
offset from the Bay, no scale, as Tamriel's frame). Three readings fixed it:

1. **The wire's world.** A pose's x and z travel as world units within `POSE_BOUND` (net/wire.js, 8,192 pixels' worth);
   a pose's z is (499 - y) pixels, so y must stay over -7,693 for a player there to be seen online. The box's
   southernmost row is -2,689 and its northernmost -7,680.
2. **Positive world units.** `worldCoordToMapPixel` truncates (world/streamingWorld.js); x and z are positive across
   the whole box (x from 64 pixels; z, 499 - y, from 3,188).
3. **Clear of the continent.** Tamriel's frame ends at y = -(picture row 76 at x21) = -1,596 at the farthest north any
   fit the probe allows reaches (TAMRIEL3's: row 52 and 24 either way, scales 15 to 21) - a thousand pixels and more
   south of the box. Nothing of the Bay or the continent is in sight of the sea, and nothing of the sea of them.

The law answers its open sea ETHER_MARGIN (4) pixels round the box too, so the kernel's windows at its edge (2 pixels
past a pixel, the ghost rows one more) never read the world's other ground. Past the box nothing streams: the world's
edge, a thousand leagues out.

**THE VEIL AND THE DEPTHS.** The box's eastmost VEIL_PX (16) pixels are THE VEIL (`inVeil`) - the way home. DEPTH is
leagues west of it (`etherDepthAt`; a league LEAGUE_M, 4,828 m, the log's own - captainLedger.js re-exports it from here,
one home), and its BANDS are the sea's law:

| band | from | a cell's isle | ports / wild / ruins / rocks | peaks lifted | the ships' levels up | holds' tiers up | corsairs' weight |
|---|---|---|---|---|---|---|---|
| the Shallows | 0 leagues | 0.50 | 30 / 30 / 14 / 26 | 0 | +1 | +1 | x1 |
| the Reaches | 12 | 0.48 | 18 / 32 / 25 / 25 | +20% | +3 | +2 | x1.6 |
| the Deep Aether | 45 | 0.42 | 11 / 32 / 33 / 24 | +45% | +6 | +3 | x2.4 |
| the Abyss | 140 | 0.36 | 6 / 32 / 40 / 22 | +70% | +9 | +4 | x3.4 |

At the helm's fastest dial (Come Sail Away's x30, a galleon making 6 m/s) the Reaches are two minutes from
Veilhaven, the Deep a quarter of an hour, the Abyss an hour; online, where time at sea keeps the world's pace, the
Reaches are an hour's sail.

**THE ISLES** (`isleOfCell`): the box is a lattice of ISLE_CELL_PX (10) cells, 806 by 499. A cell holds an isle on its
band's chance of its own hash (`etherHash` - FNV-1a, finished, under ETHER_SALT; `etherRng` the mulberry32 step), its
kind drawn by the band's weights, its radius and peak in its kind's ranges (`ISLE_KINDS`):

| kind | radius (pixels) | peak (bytes, 8 m) | fall | climates |
|---|---|---|---|---|
| port | 1.8 - 2.6 | 10 - 15 (never lifted: a town a short climb from the water) | 0.8 | Subtropical, Woodlands, Rainforest |
| ruin | 1.4 - 2.4 | 15 - 34 | 1.5 | Mountain, Haunted Woodlands, Swamp, Desert |
| wild | 1.0 - 2.8 | 10 - 40 | 1.5 | Rainforest, Subtropical, Swamp, Desert2, Mountain Woods |
| rock | 0.6 - 1.1 | 8 - 18 | 1.5 | Mountain, Desert |

Its centre is jittered where its land and the kernel's pixel past it stay inside its cell (`margin` the radius's
ceiling and one), so ONE CELL ANSWERS ANY PIXEL: the ground's read never searches. A wild isle bears one of the
Etheric goods (`ETHER_GOODS`, the exchange's three - pinned equal). No isle stands in the box's edge cells, nor in any
cell east of Veilhaven's: the Veil's still water, the landfall's way clear. **VEILHAVEN** (`veilhaven`, VEILHAVEN_CELL
(800, 249), four cells west of the Veil on the box's middle row) is always a port: radius 2.4, peak 12, Subtropical. The
isles are cached a cell (ISLE_CACHE_MAX 65,536, dropped whole).

**THE NAMES** (`isleName`): a head (40), a middle on half of them (12), a tail (30) - some sixteen thousand roots - and
the kind's forms: a port Port X / X-haven / X Landing / X's Anchorage / X-mouth; a wild isle X / X Isle / the Isle of X /
the Adjective Isle; a ruin always its root (the automap keys on a place's name): the Isle of X / X's Grave / Old X / the
Tomb of X; a rock the Adjective Stack / X Teeth. Ours; no table of the game's.

**THE GROUND.** `etherHeightByte`: 0 at sea; an isle's peak at its centre falling to its rim as (1 - t^2) to its kind's
`fall`, a lattice hash of +-HEIGHT_NOISE (2) on its land. `etherLargeMap`: the large map's 5 x 5 - 0..9 on land, 0..1 at
sea (the kernel lifts an open sea's larger bytes out of the water: a byte of 0 under large-map detail of 6 put 2% of a
tile over the sea level, measured through the kernel; 0..1 none). `etherClimateAt`: the isle's out to CLIMATE_REACH_PX
(1.5) past its rim - the kernel's window carries an isle's land a pixel east and south of its bytes, and that pixel must
wear the isle's textures - the Ocean's else. Through the kernel (measured, `test/ethersea.test.js`): every port and ruin
stands on a dry plateau (a place can stand there), Veilhaven's own pixel is all land, its landfall's pixel
(LANDFALL_OFF_PX 4 east) all water, an empty cell's middle all water.

**THE COMPOSITION** (`etherWoods`, `etherClimateIndex`, `etherPoliticIndex`): a prototype child of the reader it is
handed - TAMRIEL2's `groundWoods` over the Bay's, or the Bay's alone - overriding the two reads WoodsFile builds its range
reads on, so the kernel's every read answers the sea inside the law's box and the reader's own to the byte outside it.
The world host composes it between the boot's repairs and the terrain client (after TAMRIEL2's), and the climate and
the politic beside it; the client tells the worker (`ether` on its init, off the reader's `isEtherGround`) and the
worker composes its own copy - its graph still world/ and formats/ alone (`ethericSea.js` imports formats/ only). The
stream's `frames` (`StreamingWorldState.frames`) carry the box apart from the continent's `frame`, which the picture's
fit resets as it lands; the far ring is handed the composed bytes past the map (with the continent off too) and, new,
`climatePast` - the clamp read the Bay's edge's climate there, and an isle stood in it.

**THE REGION.** Past the map POLITIC.PAK answers -1, which MapsFile clamps to the Alik'r Desert. The sea answers
Betony's politic (ETHER_REGION 19 and 128): its people's names, its prices, its law and the far places its quests send
a captain to are Betony's - the Bay's westernmost isle with places of its own (the Bay's "Islands in the Western Iliac
Bay", region 12, hold none: a quest's far place there would be nowhere). The loading screen and the Overworld's line
say "the Etheric Sea".

**THE SWITCH** (`etherSeaOn`): on the enhanced skin and online; the classic skin keeps DFU's sea. `?ether=off` the kill
door. No Features row: the crossing is the player's own choice each time it is asked.

## ETHER-PLACES - the isles' towns and ruins

A port isle's and a ruin isle's centre pixel stands a PLACE (`synthesizeEtherLocation`): a NON-MUTATING clone of one of
the game's own places (the spawned dungeons' law, `world/spawnedDungeons.js`), with

- **its id**: ETHER_PLACE_SALT (0xE7) in the high 12 bits - apart from the spawns' 1, the zone halls' 7, the Ocean
  Holes' 0x600 and the Abyss Dungeons' 2049 and up - and ETHER_PLACE_BASE (500,000) plus the cell's own number in the
  low 20: past getMapPixelID's ceiling, so no place of the sea shares an id (a discovery, a dungeon's room, a save's
  key) with one of the Bay. The map row's, the exterior's and the dungeon header's ids are all it.
- **its location index**: its own negative (-(1000 + the cell's number)) - the questors' pool keys on it (two places
  sharing a spawn's -1 kept the first one's pool) and the layout pins' location key stays apart from every real one.
- **its name**: the isle's; its region ETHER_REGION's index and politic, its region's name "the Etheric Isles"; its
  climate the isle's (`getWorldClimateSettings`); its longitude and latitude its pixel's (MapsFile's own law round-trips
  any integer pixel).
- a port's exterior answers a harbour (`portTownAndUnknown`); a ruin in the Deep Aether or the Abyss is ELITE
  (ELITE_BANDS - dungeonContext.js's three foes a marker, each twice as hard).
- never `spawned`: no clock, no expiry, no nearby announcement - an isle's place stands for ever.

**THE TEMPLATES** (`etherTemplates`, kept at boot off the classic rows - HUB1's law, the game's own rows as MAPS.BSA
holds them, so a client's town pack never moves what an isle stands; read before the rows are let go): towns -
hamlets and villages of TOWN_BLOCKS.port (2 - 6) blocks; havens (Veilhaven's) - villages and cities of TOWN_BLOCKS.haven
(6 - 16); neither a main-story place nor one with a dungeon under it, never a spawn; ruins - dungeons with blocks and an
exterior, one block where any is. Each list in map-id order; an isle's pick off its own hash (`etherTemplateOf`).

**THE BUILD** (`scenes/world.js`): `_locationToBuild` answers an Etheric pixel from `etherPlaceAt` alone - the place
the isle's centre stands, stood in the location index once (a building's door, a quest's local site and a save's
records read it there), or nothing. The Overworld's far reads never clone a spawn past the Veil (`tvLocationAt` -
spawnedMapId's law is the Bay's and throws there). Saved inside a ruin, offline the load rebuilds the pixel and the
same place stands (its door matched by its header's id); online - where a load never puts a character back inside a
dungeon - the sleeper wakes at the ruin's own door (the region's search would read the Alik'r's past the map).

## ETHER-PORTS - the freeports

A port isle answers as a port everywhere the Bay's ports are asked (`etherPortAt`: the isle's centre pixel;
`etherPortNear`: within a pixel): Come Sail Away's deeds and placing (`csaIsPortTown`), the naval host's waters
(`navalNearPort`, `navalPortHere` - `{ key, name, px, py, region, crown: null, ether: true }`), and the HARBOUR BOOK
(`navalHarbourNear` - its town's rectangle, the harbour sounded off the terrain as any port's, its quays laid by
QUAYS' law). No crown's: the harbour office's crown's tab stands none there, and THE FREEPORT'S HARBOURMASTER
(`etherHost.office`, `ui/navalYardWindow.js etherOfficeText`) is the tab instead - the port's waters, every legend's
rumour as the quay's talk (each legend then on the captain's chart - `hearLegend`), and a chart of its waters for sale:
every isle within CHART_BUY_PX (40) charted, at CHART_BUY_PRICE 150 gold and 75 a band deeper. THE EXCHANGE is
CAPT-TRADE's own: an Etheric port makes the three Etheric goods (cheap, a day's stock of 30) and wants every good of
the Bay at EXOTIC_K - and every port of the Bay wants the Etheric goods at EXOTIC_K. A crown's favours (the yard's
discount, the hands') are none past the Veil (`waters` answers no crown there).

## ETHER-SHIPS - the sea's traffic, and no crown's law

**WHO SAILS** (`navalDirector.js`, `ctx.ether`): corsairs (the pirates' classes) and the isles' traders (the
merchantmen's) by the band's weights (`etherFactionWeights`: 30 times the band's `pirate`, 45; a port's waters
ETHER_PORT_WEIGHTS - traders 30 more, corsairs halved); every class the band's `level` levels over the captain's own; a
pair already at it only a corsair on a trader; no relief, no hunters - no crown's navy sails past the Veil. Every spec
carries `ether` (its band), and a ship launched there - or another's met there - wears the sea's names
(`etherShipNames`: ETHER_PIRATE_NAMES and ETHER_MERCHANT_NAMES on their own stream, her captain the Bay's own law's) and
colours (`etherFlagOf`: a trader the Isles' - "the Isles' merchant colours" through the glass - a corsair the black
flag), and a corsair the band's boldness (30%, 45%, 60%, 80%). Every hold there is the band's `tier` tiers richer
(`etherTier`) and every cask the deep's (CAPT-WATERS' DEEP_TIER).

**NO CROWN'S LAW** (`chargeEther`): a ship of the sea ended - fired on, sunk, taken - is no crime, no notoriety, no
crown's regard; the log keeps her by her trade ('ether'), and a contract's end event says no crown. A corsair's papers
hold a chart of her waters on PAPERS_CHANCE (a quarter) of her seed's own stream: every isle within PAPERS_PX (30)
charted (`etherHost.papers`).

**THE STRANDS** (`etherHost.sites`, `gather`; the naval host's sites): a wild isle within HARVEST_REACH_PX (1) of the
ship is a site of kind `strand` - "Your boat pulls in to the strand and back out with its haul" - and HARVEST_CASKS (3)
casks float out beside her, each STRAND_YIELD of the isle's good by its band (2, 3, 4, 6); hauled (`pickStrand`), into
the hold of the boat that sailed through it. A strand is bare HARVEST_DAYS (7) from the first cask hauled.

## ETHER-LEGENDS - six legendary ships

| legend | captain | class (hull) | band | terror (`trait`) | purse |
|---|---|---|---|---|---|
| Sorrow's Wake | Ysolde the Unmourned | Legendary Brigantine (Small Ship): hull x1.8, 9.4 m/s - the swiftest hull afloat | the Reaches | swift | 2,500 |
| The Drowned Queen | Maraveth, Thrice Drowned | Legendary Carrack: hull x2.4 | the Reaches | mends - LEGEND_MEND_PER_S (0.4%) of her hull a second while no ball has struck her for LEGEND_MEND_QUIET_S (8 s), her fires out first | 3,000 |
| Ninefold Hunger | Ghorvak Ninefold | Legendary War Galley: 120 hands, 45 boarders | the Deep Aether | boarders | 5,000 |
| The Lantern-Eater | the Hooded Pilot | Legendary Brigantine: hull x2, skill 0.9 | the Deep Aether | night - abroad between dusk and dawn alone | 5,500 |
| The Pale Regent | Lord Aumbrel the Pale | Legendary Carrack: hull x3.2, skill 0.95 | the Abyss | gunnery | 9,000 |
| The Starless | no one living | Legendary Carrack: hull x3.6 | the Abyss | veiled - made out at LEGEND_VEIL_K (0.35) of every reach: the eye's, the lookout's, the glass's | 12,000 |

**THEIR CLASSES** are navalShips.js's own, after the nine (`legend: true`, a pirate's faction, never a flagship, no
weight, `minLevel` LEGEND_LEVEL 999): no draw by level ever finds one - `classFor`, the encounters, the board's
bounties, the raiders - and no hull's fighting range (`rangeOfHull`) moves. The wire carries them as any class.

**THEIR HAUNTS** (`hauntOf`, off each legend's own hash): a reach of HAUNT_PX (36) pixels about a centre in her band's
depths (HAUNT_PX inside its bounds; the Abyss's ABYSS_HAUNT_LEAGUES 120 deep), within HAUNT_SPREAD of Veilhaven's row
(60, 160, 320 pixels by band). Sailing her haunt (`legendAt`), while she sails (`legendSails`: never ended, or ended
LEGEND_RISE_DAYS - 30 - ago: the aether raises her) and is abroad (`legendAbroad`), a roll of the sea's traffic launches
her on LEGEND_CHANCE (0.3) of her own LEGEND_SALT stream - before anything else the roll would launch, never while one
of her sails, on the spawn ring with her bow on the captain - bold, said: "The sea goes still. A sail on the horizon:
...". Her glass card's lore is her own.

**HER END** (sunk or taken): every crown hears of it (the ledger's LEGEND_STANDING, 10 with each, the first time she is
ended), her name in the log, her purse paid (`legendEnded`), her day kept (she rises again a month on), and her hold the
richest at sea (her class's cargo 4, the band's tiers).

**THE RUMOURS** (`rumourOf`, a freeport's harbourmaster; the way one of sixteen points, `compassPoint` - the chart's own): "The Drowned Queen has been seen some 40 leagues
west-south-west of here." (the Lantern-Eater "By night."); ended: "...went down 3 days ago; they say the aether will
raise her again."

## ETHER-CROSSING - the way out and the way home

**ASKED** (`etherCrossStep`, every CROSS_CHECK_S - half a second) at a helm in the exterior with no window up: OUT in
the crossing waters (`crossingWaters`: west of CROSS_X - 300 - and CROSS_LAND_PX - 20 - pixels and more from any land,
measured by the map's one water law, `crossLandPx`, asked once a pixel; never in the sea's box; past the Bay's west edge
the Eltheric counts), HOME in the Veil (`crossingWayAt`). A way is asked ONCE each time the ship comes into its waters
(`createCrossingGate`): refused, it is not asked again until she has left them. An enemy near or another player aboard
is said instead ("Not with an enemy at your heels." / "The Veil is no place for passengers...").

**SAILED** (`etherCross`): the way out remembered (the ledger's `setCrossedFrom` - the Bay's pixel she sets sail from);
the screen black; the helm let go - she lies where she is; the jump - a travel (`modEvent: 'travel'`: the seasons'
post-travel step, the Overworld's) of CROSS_DAYS (3) to the landfall (`crossingTarget`: out, open water
LANDFALL_OFF_PX east of Veilhaven, her bow west on it; home, the waters she set sail from, else HOME_WATERS - the open
Abecean off the Bay's mouth, pixel 180, 300) whose arrival brings her round onto the landfall pixel's middle where she
floats (`RepositionBoat` - her crew, her hold and every rank of her hands aboard her) and stands the captain on her
deck; the days on the clock; her helm taken again; the crossing counted; out, Veilhaven charted; home, the gate left
asked (she comes out in crossing waters, and is not asked out again at once). Come Sail Away is held paused while she
is carried across (`_etherCrossing`, as a party's arrival holds it).

## ETHER-CHART - the chart of the Etheric Sea

Past the Veil the travel map's door (`toggleTravelMap`) opens the captain's chart (`ui/etherChartWindow.js`, the naval
windows' door's third slot) - the Bay's travel map has no sea there to show, and nothing on the chart is travelled to.
On a canvas: the sea, darker to the west; the BANDS' bounds and names; THE VEIL down the east edge, "to the Iliac Bay";
the HAUNTS of the legends heard of (a ring each, red while she sails, grey and "(sunk)" while she lies sunk); the ISLES
CHARTED (a port gold, a ruin red, a wild isle green, a rock grey - a port named at any zoom, the rest from x8); the SHIP
and her heading. Zooms x1 - x16 (CHART_ZOOMS), the wheel or + and - about the pointer (`chartZoomAt` keeps the point under
it), a drag or the arrows to pan (`clampChartView` keeps the view over the sea), C back to the ship, M or the back key to
close; a pointer on an isle says it: "Port Pelleveth - a port - 12 leagues west-north-west". The header: isles charted,
the deepest a captain has gone, the crossings, the legends ended.

**CHARTING** (`etherHost.sight`, the world's office tick, every 2 s in the sea's exterior): every isle within SIGHT_PX
(3) of the ship's pixel is charted the first time ("Land ho! Veilhaven - a port. It is on your charts.") and counted in
the log's `islands`; the deepest a captain has gone is the log's `deepest`. A freeport's chart and a corsair's papers
chart more.

## ETHER-LIGHT - the light past the Veil

Both of the frame's lights lean, past the Veil, to a cold violet (`etherLight`: the ambient to ETHER_LIGHT_TINT 0.88,
0.9, 1.14; the sun to ETHER_KEY_TINT 0.95, 0.93, 1.07), outermost of the chain (after the dread's, the sun baby's and
the brass's). The sky's dome is the world's own: a fog or a dome graded apart met the sky a step apart at the skyline
(AUDIT SD III V8's finding), and the lights touch neither. Nothing is made while nothing leans (the light handed in
handed back, sdBrassLight's law).

## The ledger's record

The Captain save (CAPTAIN_SAVE_VENDOR, still v1 - a record without it reads as none) keeps `ether`: the isles charted
(their cell keys, ETHER_CHARTED_MAX 4,096, the first kept), the legends ended (their days), the strands gathered (their
days, the newest ETHER_HARVEST_KEEP 128), the way out, the crossings, the legends heard of. Restored field by field, a
junk entry dropped and the rest kept. The log says "Etheric isles charted", "Deepest Etheric waters - N leagues past
the Veil", "Legends ended"; its trades count 'ether' and 'legend' ships.

## Recorded departures and readings

- **Infinite, read honestly.** The sea is a pure function of its pixel - unbounded in law - and the stream's box is
  6,600 by 4,100 km of it: more than a thousand leagues west of the Veil, days of real time at the helm's top speed.
  Past it nothing streams (the world's edge). The wire's pose bound, not taste, set its north.
- **The region is Betony's** for every system that asks one (quests, law, prices, names); only the place words say
  "the Etheric Sea". A quest given on an isle may send a captain back across the Veil.
- **A place's name may repeat** across the sea (sixteen thousand roots): two places of one name share an automap and a
  building's discovery. At fifty places charted, about one captain in fifty meets it.
- **The light, not the sky.** The dome, the clouds and the fog are the world's own past the Veil; a grade of the sky's
  four passes (as the brass's) is a later slice's.
- **No Deep Waters bathymetry of its own.** The sea's floor is the kernel's water; Deep Waters' promotions are the Bay's
  (held there by TAMRIEL2).
- **Online**, the crossing is each player's own; a party is not carried across together, and a player aboard another's
  ship holds the crossing back.

## Pins

`test/ethersea.test.js` (15): the box (the wire's bounds, positive units, clear of Tamriel's frame at every fit), the
Veil and the bands, the hash, the isles (the chance, the kinds' weights and ranges, every isle's land inside its cell,
the cache), the open edge and strip and Veilhaven, the names, the ground (the fall, the noise, the detail, the climate's
reach, the map's water law), the composition (every arm), through the kernel (dry places, the landfall's water), the
crossing's waters, the goods, the stream's frames, the far ring's `climatePast`, by source (the host's composition and
order, the worker's word, the module's purity), the light. `test/etherplaces.test.js` (7): the id's lane and base, the
index, the templates' filters and order, the pick by kind, the clone field by field, the host's seams, the ports'
seams. `test/ethership.test.js` (10): the six legends kept out of every draw, the names and colours, the weights, the
haunts, the rumours, the director past the Veil (no navy, no relief, the pairs, a legend's chance and her one), at sea
(names, colours, no crime, the log's trade, the purse, the papers, the plate), the mend and the veil, the strands, by
source. `test/ethercross.test.js` (10): the ways and the gate, the voyage's targets and words, the crossing by source
(each step in its order), the ledger's record and its log lines, the host's waters and charting, the strands, the
legends' host (rise, night, purse, the chart's sale, the papers' chance), the chart's sums and model, the doors.
PIN MOVED: `test/nav_c_ships.test.js` (fifteen classes, nine drawn), `test/tougherships.test.js` (the legends'
salvage), `test/terrainworker.test.js` (the worker's imports), `test/tamriel2.test.js` (the ring's bytes past the map),
`test/auditlandforms.test.js` and `test/tv8_party_walk.test.js` (the far read's guard), `test/csa_close.test.js` (the
crossing's pause), `test/seasonsIliacBay.test.js` (the crossing a travel), `test/sd19_presence.test.js` and
`test/event1_live_event.test.js` (the lights leaned once more), `test/fb0929h_deedport.test.js` (the port test past
the Veil - an isle's port is a port for the deed), `test/fb0929h_spawnplate.test.js` (the build past the Veil). Mutants `tools/mutants/ethersea.json`,
`tools/mutants/etherplaces.json`, `tools/mutants/ethership.json`, `tools/mutants/ethercross.json`.

**Not verified here:** the look and feel in a real browser (the isles on the horizon, the chart, the light), a crossing
end to end in a running world (its jump, the ship brought round, the stream past the Veil), a town's buildings and a
ruin's halls entered on an isle, and online play past the Veil.
