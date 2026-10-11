# The Shipyards, the Crew Halls and the Lighthouses (SHIPYARDS)

THE PORT'S OWN (2026-10-11). Mac: *"I want to give ports the same treatment we did wagons and horses. A new highly
detailed shipmaster vendor and crew recruitment station within it. All detailed functions including ship upgrading
should be present here, along with ship buying, etc. This should also come with a detailed overhaul to piers and
introduce the new lighthouse building. Everything should show on the map/overworld and be able to be asked by NPCs."*
Asked four things, Mac chose:

- **Where** - "Town's seaward edge": both on the town's own open ground at the edge nearest the sea, placed off the
  town's layout like the Stables (`03-World/Merchant-Yards.md`).
- **Ship sales** - "Shipyard only": the shipyard sells every hull and buys them back; Come Sail Away's random shelf
  deeds and parts are retired.
- **Crew hiring** - "Pick named recruits": a daily roster of named sailors - class, trade, grade, a signing fee - and
  the player chooses who joins which ship and at what post.
- **The lighthouse** - "Climbable, with keeper": a stone tower and the keeper's cottage, its lamp lit from dusk with a
  sweeping beam, and the keeper lets the player climb to the gallery.

Daggerfall has no ships and no lighthouses, and Come Sail Away sells a hull off a shop's shelf. Like the yards, a port's
places are not buildings: no building record, no deed, no quest place, and the blocks' own automap bytes untouched. The
whole of it is a departure, Ledger A (SHIPYARDS, SHIPYARDS-FOUND, THE PIER'S DRESS).

## Where they stand

**Which towns** (`systems/portPlaces.js` `isPortTown`). A city, a town or a village (`PORT_TOWN_TYPES`) that is a port
by its own data: Travel Options' hand-written harbours (`systems/travelPorts.js` `hasPort`) or Daggerfall's
PortTownAndUnknown byte - the host's `portByData`. A seat's members' harbour (`hasPortFor`) is one guild's word, so it
stands no shipyard: every client stands the same one.

**The ground** is the yards' (`world/merchantYardSites.js` `townGroundOf`): the town's navgrid on the enhanced lane's
water table, its buildings `BUILDING_CLEAR_M` off, its props, flats, palace blocks and the monument - with the Stable and
the Wagon Yard already closed on it, `YARD_GAP_M` round each. The yards are placed by their own two steps, as they
always were (`townGroundOf`, then `yardSitesOn`), and the port's places go on what they left (`scenes/world.js`
`townPlacesFor`, one memo a town, keyed by its measures and whether it is a port).

**The sea** (`world/portSites.js`). Where the town's own blocks hold the sea - open water cells (no automap byte, a
ground tile of the water family on the enhanced table) in a body that reaches the block grid's edge with
`SEA_CELLS_MIN` (48) cells at least, never a pond or a fountain (`townSeaOf`) - each cell's distance to it is walked
four-way (`seaField`, kind `water`). Where they hold none, the sea's bearing off the map pixels round the town's
(`seaBearing`: every pixel of sea within `SEA_RING` (2) - the port's one water law, `isWaterPixel` over CLIMATE.PAK and
WOODS.WLD - two near, one far; the map's y runs south, the frame's z north), and a cell's distance is how far it stands
in from the town's seaward edge, and `LATERAL_K` of its distance off that edge's middle (kind `bearing`). No sea either
way: the town's middle, as the yards' (kind `middle`).

**The place** (`portSite`). A rectangle (`PORT_FOOT`: the shipyard 22 m by 16, the lighthouse 13 by 13; its front - its
gate's side - along +z), turned to one of the four axes; its ground open and off every road, a ring of `YARD_PAD_M` open
round it. Each BACKS ONTO THE SEA: a place whose front stands no farther from the sea than its back by its own depth
costs `FACE_K` (2) cells for every cell it falls short - more than a front onto no road - so a shipyard backs onto the
water first and opens onto a street where it can. The shipyard's score is that and the sea's distance at the middle of
its back edge (`backMiddle` - its slipway's end), a front facing no road costing `NO_ROAD_COST` more; the lighthouse's is
that and the sea's distance at its middle, less `LIGHT_APART_K` of a cell for every cell it stands from the shipyard (to
`LIGHT_APART_CAP`): the town's light at its harbour's end, not beside its yard. Ties to the lower row, then column, then
turn; every distance an exact sum or a `Math.sqrt` of one - the same on every engine. The people's navgrid is closed
over both (`carveYards`). A town with no room stands none of it, said once in the console (`[port] <town>: no room for
its ...`).

## What stands

The port's own geometry in the port's own art, made at boot under the pseudo-archive 38231 (`world/portArt.js`
`PORT_ARCHIVE`): the yards' timber, planks, shingles, straw, earth, gravel, water and iron at the yards' own records, and
stone, whitewash, a red band, slate, glass, a lit window, rope, canvas, tar, copper, sawdust, a hull's planking,
cobbles, a door, notices and brass besides, and the two boards. Nothing of Daggerfall's is read for either.

**The shipyard** (`world/shipyardModel.js` `buildShipyardModel`, `SHIPYARD` its layout). A board fence round the yard; a
gate arch at its front, two tall posts and a beam with the SHIPS board hung from it on iron rods - an anchor and the word
in painted capitals; a hull on the stocks along its slipway, her stern to the sea - keel, stem and sternpost, frames,
her planking laid from the keel up to `PLANKED_TO` of her side and her upper frames bare, on blocks and shores, a
scaffold along her with a shipwright up on it; the sheerlegs over the slipway's end with their tackle, and a capstan; a
timber yard - logs on bearers, sawn planks stacked with stickers, a steam box on trestles over its firebox; the
shipmaster's OFFICE - plank walls, a slate roof, a porch where he stands, a lantern by its door; the CREW HALL - an open
shed of a lean-to, its table where the crewmaster sits, a CREW board (a coil of rope and the word), a notice board of
ships wanting hands; a sea wall along its back, either side of the slipway's end; coils of rope, a capstan's drum, an
anchor leant on the fence.

**The lighthouse** (`world/lighthouseModel.js`). A round stone plinth, a whitewashed tower narrowing up to its gallery
(`towerR`), two red bands; its door to the town under a lintel, slit windows up its faces; the gallery at `GALLERY_Y`
(17.6 m) round the lantern room, an iron railing; the lantern room's glass between its mullions, its lamp, a copper dome
and vane; the keeper's cottage beside it. A ring over the railing (`guardBand`) is the collider's alone: nobody falls
from the gallery.

**The people** (`scenes/portHost.js` `peopleOf`). In the shipyard the SHIPMASTER on his office's porch, the CREWMASTER
behind the crew hall's table, three SAILORS looking for a berth at its open side and two SHIPWRIGHTS at the hull, one up
on the scaffold; at the lighthouse the LIGHTKEEPER by the tower's door. Each a person of the town's own people
(`walkerRace`, the yards' law) in the walkers' idle record and one of the race's four outfits - the sailors' and the
shipwrights' drawn off the place's key (`folkOf`), so every client stands the same people - and each offered its
Morrowind body. The shipmaster, the crewmaster and the lightkeeper are named on the region's bank off a seed of the
town's map id and the place's own salt (`portKeeper` - the yards' one draw, `systems/merchantYards.js` `townKeeper`), and
the shipyard and the crew hall are named for them ("Voss's Shipyard", "Wayrest's Crew Hall"); the lighthouse and the
docks for the town ("The Sentinel Light", "Sentinel Docks" - `portPlaceName`).

## The shipmaster's window

On the shipmaster, the SHIPS board or the hull on the stocks: the plaque names the shipyard, its shipmaster and its
trade, with four rows - **Ships for sale**, **Your fleet**, **Shipwright**, **Refits** - each opening the shipmaster's
window (`ui/shipyardWindow.js`, through the sea fight's door: `ui/navalPlunderDoor.js`'s third slot) on that page; a
press with no row lit opens Ships for sale. On the crewmaster, the CREW board, the notice board or a sailor: **Sign on
hands** - the window's Crew Hall. Info names who they are; Steal takes nothing ("The shipmaster never takes an eye off
his yard"); a shipwright says his work. Too far speaks the street's refusal; the reach is a static NPC's (6.4 m). Its
host half is `scenes/shipyardHost.js` (`model(site, view)` a page, `act(site, verb, ...)` a deed).

**Ships for sale** (`systems/shipyards.js`). Every hull Come Sail Away builds, cheapest first (`SHIPYARD_HULLS`): the
Rowboat, the Large Boat (Mac's Tiny Ship), the Small Ship (Mac's galleon), the Carrack and the Large Galley, at the
mod's own prices (`HULL_PRICES`). Each card gives her length and beam, her crew and the named hands her deck stands
(`playerCrewCount` - none, none, four, five, eight), her guns, her ram, her hull and canvas, and the shipmaster's line on
her; the galley's says no quay takes her. The Rowboat is sold as her PARTS, into the pack (the shelf's own form for her:
she is launched wherever there is water); every other as her DEED, entered in the Fleet's book with this port the one
she waits at (`fleet.js` `titleDeed`). Each is minted as the shelf minted it (`mintDeed`, `mintParts`), its number the
host's Come Sail Away UID. A yard never sells out. With Come Sail Away off, nothing is sold.

**The price.** The shipyard's counter is a yard's (`YARD_QUALITY`, `YARD_PRICE_INDEX` - the same in every town), haggled
by the counter's one law: `calculateCost`, then `getTradePrice` with the buyer's live Mercantile and Personality, a
ship one piece. A concluded deal - a ship bought, a ship sold - tallies Mercantile as a counter's does (DFU OnTrade).
Online a sale is capped at half the least ask, as at every counter (REALM P0.4, MERC-RISE, MERC-SLOPE), so buying a ship
and selling her back never pays; offline, Daggerfall's haggle stands, as at every counter.

**Your fleet.** Every ship of the player's (the Fleet's own sweep - `scenes/fleetHost.js` `model`), where she lies, her
worth and the shipmaster's offer for her; Bring her here (a summons - the window makes way and hands the water to the
host, the Holdings page's hand-off, and comes back on this page where the placing would not start), Lay her up, and
her name. **Selling** asks a second press. Her WORTH (`shipWorth`) is what she was bought for (a claimed prize her
papers' value), half what her refits cost in gold (`REFIT_RESALE`), by her hull's state - a wreck `SALE_FLOOR` (0.6) of
it. The shipmaster buys a ship of the player's that is HERE - at this port, laid up, or packed - and never one at her
helm, afar, fighting, with another player aboard, with her hands ashore at the player's side, with cargo in her hold,
or with anything in her cabin's chests (`saleRefusal`, and the host's `cabinHolds`). Sold, a boat standing in the world
is laid up first by the mod's own law (`LayUpBoat`) - she leaves the water as a ship sent away does; her parts leave the
pack; her cabin is let go as a sold house's room is (`scenes/worldModes.js` `cabinSold`); her title and record leave the
ledger (`forgetShip`), her hurts and crew the sea fight's state (`scenes/navalHost.js` `forgetBoat`), her empty hold's
entry Come Sail Away's (`forgetHold`); the offer is credited.

**Shipwright** and **Refits.** The shipwright's own work on a ship at hand - at this port, at the helm here, or laid up
(`AT_HAND`) - his model the sea fight's (`scenes/navalHost.js` `yardModelOf`: her hull, her canvas, her hands by the
head, her powder and provisions), and her four refit lines (`scenes/fleetHost.js` `offer`, `systems/fleet.js`). A ship
chosen on one page is chosen on the others.

## The crew hall

**The roster** (`systems/crewHall.js` `recruitsOf`). `RECRUITS_A_DAY` (6) sailors at a town's hall each day of the
world's clock, drawn off a seed of the town's map id and the day - every client meets the same hall the same day: each
a NAME on the region's bank, a CLASS of the crews' own (`PLAYER_CREW`), a GRADE - Green, Able, Seasoned, Veteran - with
the fights and boardings he has stood, and a TRADE: the post he signs on for (`CREW_ROLES`; a Bard keeps his calling). A
First Mate is Seasoned at the least, a Bosun Able. His SIGNING FEE is his grade's (180, 260, 420, 700) times his
trade's premium (a First Mate 1.6, a Bosun 1.3, a Gunner and a Carpenter 1.2, a Bard 1.1), to ten gold, never under a
shipwright's hand (`HAND_PRICE`: `REPAIR_PRICE.crew` a man's share of her crew), so no recruit is the cheaper way to
fill her. A sailor already serving a ship of the player's is not on the roster.

**Signing on** (`enlistPlan`, `scenes/navalHost.js` `enlistHand`). A crewed ship at hand is chosen; a recruit takes a
place on her deck - her crew raised to the share that stands one more named hand (`playerCrewCount`), never past her
whole; a deck already standing every man her crew can has none ("Fill her crew with deckhands at the shipwright's"). He
joins at his trade's post - a First Mate stands the one she had down to Deckhand - with his record, at her roster's end,
and a seasoned man lifts her spirits (`lift`). His fee is paid.

**Paid off** (`releasePlan`, `releaseHand`): a named hand leaves her - never one ashore at the player's side - wherever
he stood in her roster, her crew down by a man's share (`navalDamage.js` `discharge`: no blow, no fire, no state). No fee
comes back. A hand's post is changed from the same page (the Fleet's `role`).

## The lighthouse

**The lamp** (`scenes/portHost.js` `lights`, `glows`). In the lanterns' hours (the town's: `lightsOnAt`) the lamp is a
scene light at its glass (`LAMP_RANGE`, 28 m) and the shipyard's office lantern another (`OFFICE_LAMP_RANGE`); its glow
and two beams turning one round every `BEAM_PERIOD_S` (14 s), each `BEAM_PUFFS` added puffs out to `BEAM_LEN_M`, wider
and fainter as they go, are drawn as added light in the sea fight's particle pass (`render/navalRender.js`) from as far
as `BEAM_SEEN_M` (2.6 km) - a light a captain sees from the sea, each lighthouse's beams on their own phase. By day,
nothing.

**The stair.** On the lightkeeper or the tower's door: **Climb the tower** - the keeper lets the player up, and the host
stands them on the gallery's sea side facing the sea (`climbLighthouse`, as a boarding places a body). On the hatch on
the gallery: **Climb down** - at the tower's foot, facing the town. Up on foot alone, never at a helm, never with a foe
about (each refusal the host's own words); down always, so a gallery is never a trap - onto the drawn ground at the door
where it stands higher than the tower's middle. The pool holds a place's collider back while the player's feet stand on
its ground at its foot as it first rises, never feet up on the gallery, and a load stands the pool again at once, after
the loaded player stands and before the frame's first step: a save made on the gallery loads onto its floor.

## The piers

THE PIER'S DRESS (`systems/naval/quays.js` `pierDress`, `world/quayModel.js`) overhauls every harbour's quays -
`03-World/Holdings.md` section 7.

## Found as the yards are (SHIPYARDS-FOUND)

- **The talk directory** (`systems/portPlaces.js` `portDirectoryRows`, `scenes/townTalk.js` rebuildDirectory): the
  shipyard, the crew hall (at the crewmaster's table), the lighthouse and the DOCKS (the first berth's quay of the
  harbour the book has sounded off the town's shore, `scenes/world.js` `portPlacesOf`) are rows under keys no building
  holds (`foundBuildingKey`: `YARD_KEY_BASE` and its place in `FOUND_KIND_ORDER`, after the yards' two, so the Stable and
  the Wagon Yard keep theirs). The Where-is page stands a group each - "Shipyards", "Crew halls", "Lighthouses",
  "Docks" (`FOUND_TALK_GROUPS`) - after the yards'; each is asked as a building is (the compass, the knowledge roll, the
  map's mark). The docks' row joins once the harbour is sounded: the frame hands the town's places again then, once
  (`townTalk.setPorts`).
- **The town maps** (`world/merchantYardMap.js` `yardTownBlocks`, `ui/townMapDoor.js`): the shipyard's ground in a
  shop's byte, the lighthouse's in a house's (`PORT_MAP_TYPE`), each lettered by its own name. The docks lie out on the
  water past the town's blocks, which is all a town map draws.
- **The Overworld** (`scenes/portHost.js` and `scenes/quayPool.js` `overworldMarks`, `ui/travelViewHud.js`
  `portGlyph`): the shipyard (an anchor), the lighthouse (a tower under its light) and the docks (a bollard on its quay),
  each named, with the Towns switch and never counted a town.

## The shelves

The General Store and the Pawn Shop no longer shelve Come Sail Away's two items, and no counter buys them
(`systems/comeSailAwayItems.js`, `systems/shopStock.js` `shopBuysItem`) - as MERCHANT-YARDS took the horse and the cart
off the General Store. AssignVariantsToShopItems stands, ported: a shelf a save stocked before is still rewritten
(`03-World/Come-Sail-Away.md`, the shelves).

## The four hosts

- `scenes/world.js` - WIRED: each port town's build places the shipyard and the lighthouse on what its yards left and
  carves the people's navgrid round them; the pool (`scenes/portHost.js`) is made beside the yards', framed, drawn - in
  the street and in the view out of a window - its people on the flats' axis and in bodies, its lamps in the lights and
  its beams in the added pass, taken down at a re-anchor and a load (the shipmaster's window shut with it); the hover
  names it; the press is handed to it; the shipmaster's window (`openShipyard`, `scenes/shipyardHost.js` over the
  Fleet's host) and the stair (`climbLighthouse`); the town map, the talk directory and the Overworld's marks are
  handed its sites, and the docks' mark is the quay pool's. Its per-frame work is the host's own functions (`portFrame`,
  `portLightsInto`, `portBodies`, `portBatchesInto`, `portGlows`), never inline in `frame`: PERF-V8's budget
  (`test/perfv8.test.js` - an inline loop, try or spread put the frame's registers past r123, where every operand goes
  wide; the frame stands at main's register count).
- `scenes/worldModes.js` - WIRED: the street's one ray reaches them (`portTargets`), the `port:` arm (the too-far
  refusal, the plaque's lit row); a sold ship's cabin (`cabinHolds`, `cabinSold`). Its interiors stand no port.
- `scenes/exterior.js` - FLAGGED: the single-town bench stands no port; the streaming host is where its towns are played.
- `scenes/dungeonContext.js` - stands no street: nothing here reaches it.

Nothing is saved or sent: where a place stands is the town's layout, who keeps it its map id, the day's roster the
day's; a ship bought or sold, a hand signed on or paid off, are the Fleet's, the sea fight's and Come Sail Away's own
save data, as they were.

## Not seen

This container holds no ARENA2, so no real port was laid out here: the places are proven on synthetic grounds and
seas (`test/shipyards1_place.test.js`) and the models in a software render of their own geometry - the shipyard, the
lighthouse and the overhauled quay - never in a Daggerfall town. Where a port's places fall is for the owner's eyes; a
port that finds no room logs it.

## Tests

`test/shipyards1.test.js` - the places, the towns, the keys, the keepers and names, the rows, the stock, the price, no
loop online, what the shipyard takes back, the shelves, the hall's roster, the fees, signing on and paying off.
`test/shipyards1_host.test.js` - the host's pages, buying, the fleet page and selling, the Fleet's acts, the crew hall,
the window's words, the window mounted, the door. `test/shipyards1_place.test.js` - the footprints, backing onto the
sea, the bearing, the town's own sea, no room, the models, the art, the pool, the hold-back, the press, the stair, the
plaques, the lamp, the Overworld's marks. `test/shipyards1_found.test.js` - the Where-is page, the answer, the town map,
the docks on the Overworld, the glyphs, the four hosts, the lamp reaching the renderer (`test/yardLightRig.mjs`, the host's
own light composition). `test/piers1.test.js` - the pier's dress. Mutants: `tools/mutants/shipyards1.json` (72, every one
dead).
