# The Captain's Sea - reasons to sail (CAPT-CREW, CAPT-LOG, CAPT-PAY, CAPT-MARQUE, CAPT-WATERS, SPYGLASS, CAPT-BOARD, CAPT-TRADE, CAPT-CHARTS, 2026-10-11)

The owner, 2026-10-11: *"I want to talk about enhancing the naval experience and polishing it more, making it rewarding
and giving a reason to players to experience it"* - and then: *"I want you to make the decisions and completely make
this as detailed as possible, providing depth without overcomplicating systems. This is your baby ... On top of this,
2 things to add. 1. Removing observable names from ships and instead implementing a spyglass option where you can aim
and view to observe other ships, their allegiance, cargo, etc. 2. A brand new open sea map that allows you to traverse
to the etheric sea."* The Etheric Sea is its own page (`03-World/Etheric-Sea.md`); this one is the Iliac Bay's.

**THE PORT'S OWN.** Daggerfall has no sea fight (`03-World/Naval-Combat.md`), and nothing here is transcribed: no DFU
law stands behind a crew's veterancy, a captain's standing with a crown, a letter of marque or a spyglass. Where the
game has a law it is used - a hold is still the DFU loot tables' roll (only its rarity tier moves), Piracy is still
`Crimes.Piracy` through LowerRepForCrime, gold is still gold pieces - and the departure is Port-Ledger section A's
CAPTAIN'S SEA row.

**THE SHAPE.** Before this, the sea fight was a fight and a hold: a ship sunk was a ship sunk, a boarding beaten off
was nothing, the open water was the coast's twin, a ship's name floated over her at seven hundred metres, and nothing
a captain did added up. Now:

- **HER CREW GROWS WITH HER** (CAPT-CREW): every hand's fights and boardings rank him, and the six posts aboard - a
  Gunner, a Carpenter, a Lookout, a Cook, a Bosun, a First Mate - each do one thing more the longer their holder has
  served.
- **A CAPTAIN HAS A NAME TO MAKE** (CAPT-LOG, CAPT-PAY, CAPT-MARQUE): a log of what she has done and a STANDING with
  each crown, ranked Unsworn to Admiral, the ranks' perks the harbours' to give; a boarding repelled pays; a letter of
  marque makes a rival crown's merchantmen lawful prize.
- **THE DEEP IS WORTH THE RISK** (CAPT-WATERS): far from every port the pirates are more, bolder and bigger, and every
  hold and cask is richer.
- **A SAIL IS A STRANGER TILL SHE IS MADE OUT** (SPYGLASS): no name over an unknown hull; the eye, a Lookout, her own
  guns or the captain's glass tell her - and a pirate may fly false colours.
- **EVERY PORT HAS WORK** (CAPT-BOARD): the harbourmaster's board - bounties on named pirates, hunts, cargoes to carry,
  wrecks to salvage, the Admiralty's survey through the glass - and the letters a rank buys.
- **A HOLD IS WORTH FILLING** (CAPT-TRADE): goods bought cheap where they are made and sold dear where they are wanted,
  and the Etheric Sea's three wanted everywhere.
- **A PIRATE'S PAPERS** (CAPT-CHARTS): a treasure chart, now and then, to a cache sunk off the coast.

## The slices

| slice | what | modules |
|---|---|---|
| CAPT-CREW | A HAND'S SERVICE AND HIS POST'S WORTH: fights and twice the boardings rank a hand Green, Seasoned (4), Veteran (12), an Old Salt (30); each post's best holder aboard does its thing by his rank; seasoned hires | `systems/naval/shipCrew.js` (`serviceOf`, `VETERANCY`, `veteranOf`, `POST_WORTH`, `postsOf`, `crewWorth`, `NO_WORTH`, `postWords`, `sync`'s `service`, `tick`'s `wear`), `scenes/navalHost.js` (`crewStep`'s worth, the seams), `scenes/fleetHost.js`, `ui/fleetPage.js` (`handService`), `scenes/world.js` (the CSA refit's way) |
| CAPT-LOG | THE CAPTAIN'S LOG AND STANDING: leagues sailed, the deepest water, ships sunk, taken and beaten off by trade, prizes and plunder, contracts; a standing with each crown and its rank; the Captain page | `systems/naval/captainLedger.js`, `scenes/navalHost.js` (`chargePlayer`'s deed and regard, `notePlunder`, `sailed`), `ui/captainPage.js`, `ui/enhancedMenu.js` (the Holdings tab), `scenes/world.js` (the ledger, its save) |
| CAPT-PAY | THE DEAD ENDS PAID: a pirate boarding beaten off is the law's to reward (`PIRATE_REWARD.repelled`) and the log's; a raid's flagship repelled is paid by its quest alone | `systems/naval/navalLaw.js`, `scenes/navalHost.js` (`winBoarding`'s repel) |
| CAPT-MARQUE | A LETTER OF MARQUE: a crown's letter makes a rival crown's merchantmen lawful prize for its term - no crime, no witnesses of the signer's navy, standing with the signer for each, standing lost with the rival; striking the signer's own ship tears it up | `systems/naval/captainLedger.js` (`marque`, `setMarque`, `tearMarque`, `MARQUE_STANDING`), `systems/naval/navalShips.js` (`flagOf`), `scenes/navalHost.js` (`chargePlayer`, the witness) |
| CAPT-WATERS | THE DEEP WATERS: DEEP_PX map pixels and more from every port - pirates DEEP_PIRATE_K as likely, the trade DEEP_TRADE_K, classes DEEP_LEVEL levels up, a pirate bold DEEP_BOLD of the time, holds and casks DEEP_TIER tiers richer; the plate says the deep | `systems/naval/navalDirector.js` (`watersOf`, `factionWeights`), `systems/naval/navalAI.js` (`temperOf`'s `bold`), `systems/naval/navalShots.js` (a cask's `deep`), `scenes/navalHost.js`, `ui/navalHud.js`, `scenes/world.js` (`navalPortPx`) |
| CAPT-BOARD | THE HARBOURMASTER'S BOARD: five kinds of contract a port posts a day, held on the captain's clock, their sites stood at sea; the letter of marque and the Admiralty's carrack for sale; a rank's favours at the yard, among the hands and in the relief | `systems/naval/harbourBoard.js`, `scenes/harbourOffice.js`, `systems/naval/captainLedger.js` (the contracts), `scenes/navalHost.js` (THE SITES, the events), `systems/naval/navalYard.js` (`discount`), `systems/naval/navalDirector.js` (`reliefSure`), `ui/navalYardWindow.js` (the Harbourmaster tab), `scenes/world.js` (the office, the ports, a site's point) |
| CAPT-TRADE | THE EXCHANGE: eleven goods, a crown's ports' makes and wants and a port's own twist, a day's drift, the exchange's spread and a day's stock; the goods as items in a hold | `systems/naval/tradeGoods.js`, `scenes/harbourOffice.js` (`exchange`), `ui/navalYardWindow.js` (the Exchange tab), `systems/itemLaw.js` |
| CAPT-CHARTS | TREASURE CHARTS: a chart among a pirate's papers, read and marked, its cache floated and raised | `systems/naval/treasureCharts.js`, `scenes/harbourOffice.js`, `scenes/navalHost.js` (`pickCache`), `scenes/world.js` (the chart's use), `ui/captainPage.js` |
| SPYGLASS | WHAT A CAPTAIN KNOWS OF A SHIP, AND THE GLASS: her hull at any range, her colours and name by the eye, a Lookout, the glass or her guns, the rest through the glass close; no tag on an unknown hull; false colours; the Spyglass action, its lens and its window | `systems/naval/shipKnowledge.js`, `scenes/navalHost.js` (`knowStep`, `glass`, `glassCardOf`, the tags, cards, hails and cries), `ui/spyglassView.js`, `ui/navalHud.js` (the plate's Glass), `player/mwView.js` (`mwViewHoldFirst`), `systems/inputActions.js`, `ui/touchButtons.js`, `ui/plusPadBinds.js`, `ui/plusPad.js`, `scenes/world.js` (`spyglassStep`, `spyglassWheel`, the lens) |

## CAPT-CREW - a hand's service and his post's worth

A hand's SERVICE is his fights and twice his boardings (`shipCrew.js serviceOf` - a boarding is the fight that counts
most); `VETERANCY` ranks it Green, Seasoned at 4, Veteran at 12, an Old Salt at 30, and his line on the crew card and
the Fleet page's crew panel says so from Seasoned up (`crewCard`; `ui/fleetPage.js handService`: rank, deeds, what his
post does).

THE POSTS (`POST_WORTH`): each of the six roles the roster already deals out does one thing, by the BEST holder aboard
(`postsOf` - a hand ashore with a companion's errand works none), a Green holder's `base` and `per` more a rank:

| post | worth | Green -> Old Salt | where it is read |
|---|---|---|---|
| Gunner | the guns' reload, shorter | 4% -> 13% | the gun deck's `reloadScale` (`navalHost.js myBoatState`) |
| Carpenter | the mending and the repairs, faster | 15% -> 45% | `repairStep`, `fieldMend` |
| Lookout | the lookout's reach, further | 10% -> 40% | the hail's range (`hailSails`), SPYGLASS's glass and his own call (`deckEye`) |
| Cook | the sea's wear on spirits, slower | 25% -> 100% | `tick`'s `wear` |
| Bosun | way under sail | 1% -> 4% | Come Sail Away's Rigging read (`world.js` the CSA runtime's `refit` folds `naval.postsWay` into `speed`) - never the helm's own `wayScale`, which a captain reads too |
| First Mate | hands over a boarding's rail | +1 a Veteran, +2 an Old Salt | `myHands` (the boarding's cap moves with him) |

`crewWorth` reads them all once a frame onto the boat's state (`crewStep`); a boat with no crew aboard reads
`NO_WORTH`. A SEASONED HIRE (`sync(roster, { service })`, SEASONED_HIRE fights' worth, capped at an Old Salt's) is a
Commodore's perk (CAPT-LOG below).

## CAPT-LOG - the captain's log and her standing

`systems/naval/captainLedger.js createCaptainLedger` - saved under its own vendor, `Captain` v1
(`registerModSaveData`; SAVE_VERSION is never bumped), and shown on the HOLDINGS window's Captain tab
(`ui/captainPage.js`, after the Fleet's, once there is anything to show).

THE LOG: leagues sailed at a helm (`sailed`, LEAGUE_M a league - a frame's way, never a jump: a step over 100 km is
refused), the deepest waters sailed, ships sunk / taken / beaten off by trade (`LOG_TRADES`: pirate, merchant, navy,
and the Etheric Sea's two), the best prize and every prize's worth, the plunder hauled (`navalTransfer.js
navalLootWorth` - gold pieces at their count, the rest at its value), the contracts done by kind (`LOG_CONTRACTS`).
`logLines` says it in a captain's words.

STANDING: a number with each of the three crowns, CROWN_STANDING_MIN to CROWN_STANDING_MAX. A DEED (`deed(act, cls, { crown,
marque })`) is the law's own act on the Bay's ships - `DEED_STANDING` for a pirate sunk, taken or beaten off, times
her class's cargo size, with the crown whose waters it was in; PIRACY (`PIRACY_STANDING`: firing on, sinking or
boarding a lawful ship) costs it; a LEGEND sunk is LEGEND_STANDING with every crown. `CROWN_RANKS`: Unsworn, Sworn Captain
(15), Privateer (50), Commodore (120), Admiral (250); a rank won or lost is said mid-screen once (`takeRankChanges`).

THE PERKS (`RANK_PERKS`, `perksOf(rank, notoriety)`): the yard's discount, the contracts' pay, the harbour's contract
offers more, a letter of marque to buy, the Admiralty carrack, seasoned hires, and a relief ship sent sooner - and NONE
of them while the crown's notoriety against her stands at PERKS_REFUSED_AT or more: a hunted captain keeps no favours.

## CAPT-PAY - the dead ends paid

A boarding beaten off was nothing: the boarders died and the sea went on. `winBoarding`'s repel now charges the law
(`chargePlayer('repel', ...)` - `navalLaw.js lawOf`'s `repel` act, `PIRATE_REWARD.repelled`: the legal and the
knightly factions' regard, a flagship's reward for a flagship) and the log, the deed's standing with it. A raid's
FLAGSHIP repelled is the quest's to pay (`questPays`): the law and the standing do not pay it twice.

## CAPT-MARQUE - a letter of marque

`captainLedger.js marque(now)` - a crown's letter, `{ crown, until }` on the captain's own clock (`playerTicker
ownMinutes`, never the world's: a session closed is no day of the letter's). While it holds, a merchantman flying a
RIVAL crown's colours (`navalShips.js flagOf`: a merchantman's home port's crown FLAG_HOME_SHARE of the time, else a
crown drawn off her seed) is lawful prize (`chargePlayer`'s `under`): no crime, the signer's navy no witness
(`provoke` spares a navy whose flag is the signer's), MARQUE_STANDING with the signer, the act's standing lost with
the rival. Striking a ship of the signer's own tears the letter up, said mid-screen. The harbourmaster sells it
(CAPT-BOARD below).

## CAPT-WATERS - the deep waters

`navalDirector.js watersOf({ nearPort, portPx })`: COASTAL within a port's reach (SEA-EASE's own), DEEP at DEEP_PX map
pixels and more from every map port (`world.js navalPortPx` - the Chebyshev distance to the nearest of every map
port's pixel, asked once a pixel), OPEN between; a distance nobody measured is no deep. In the deep the director's
weights draw a pirate DEEP_PIRATE_K as likely and the trade DEEP_TRADE_K (`factionWeights`; a port's waters keep their
peace whatever), classes DEEP_LEVEL levels over the captain's own, and its spawns carry `deep`: a deep pirate is bold
DEEP_BOLD of the time on the same draw that makes a coast's bold at BOLD_SHARE (`temperOf`'s `bold`), and her hold, her
casks hauled and her casks stowed are rolled DEEP_TIER rarity tiers up. The helm plate says "X waters, deep".

## SPYGLASS - what a captain knows of a ship, and the glass

**WHAT I KNOW** (`systems/naval/shipKnowledge.js`): each ship in my sea carries `known`, `KNOW.hull` to
`KNOW.studied`, raised by `knowledgeOf` each frame (`navalHost.js knowStep`) and never lowered while she is in the sea:

- **KNOW.hull** - what the eye sees at any range: her kind ("a galleon"), her way, her smoke. Her card (the helm's
  target card) is "Unknown galleon", her faction `unknown` ("Colours unknown"), nothing of her stance or where she is
  bound; she wears NO TAG. The lookout's hail names her kind ("Sail ho! A sloop on the starboard beam!") and the crew
  calls her so (`calledName`).
- **KNOW.colours** - her colours, name and trade: by the naked eye within NAKED_EYE_M (by night a dark ship's within
  NAKED_EYE_DARK_M), a LOOKOUT aboard within LOOKOUT_ID_M times his worth (he calls it: "Lookout: A sloop flying
  Wayrest's merchant colours!", and from the bow), the glass held on her GLASS_STUDY_S within GLASS_FAR_M times the
  Lookout's worth, her GUNS OUT ON ME (run out at my side, or her flashes) at any range, or a crown's relief come to my
  aid. Her tag stands now (SHIP-TAGS' own), her card names her.
- **KNOW.studied** - her guns, hands, hurts and hold, her captain's name, a bounty on her: the glass held
  GLASS_STUDY_NEAR_S within GLASS_NEAR_M - or she strikes, is boarded or is taken.

By night the glass and a Lookout see no farther than `shipWatch.js nightSight` lets a lookout: a lit ship to
NIGHT_LIT_SIGHT, a dark one to NIGHT_DARK_SIGHT. GLASS_FAR_M stands inside `navalDirector.js DESPAWN_BEYOND`: a sail the
glass can find is one the sea still holds. Knowledge is each player's own - never on the wire.

**FALSE COLOURS** (`falseFlagOf`): DECEIT_SHARE of the WARY pirates - never a bold one (she has no need to hide), a
flagship, Warm Ashes' raiders (bold) or a hand-launched foe (`plain`) - fly a crown's merchant colours, the crown drawn
on DECEIT_SALT's stream off her seed, the same on every client. Read from afar she is "A merchantman of Wayrest": her
tag and card a merchantman's, friendly, bound nowhere; a merchantman's pennant at her masthead (`poseShip`'s colours
`false`); no lookout hails her. The glass held close sees through her (`KNOW.studied`: "False colours! The Black Gull
is a pirate." - "Too many gunports for a trader" on the card) and she is a pirate to me from then. Going for her prey
she RUNS UP THE BLACK FLAG (`blackFlag`): said where her flag is seen ("False colours! The merchantman of Wayrest runs
up the black flag!", or "A sloop runs up the black flag!"), the black at her masthead.

**THE GLASS** - the `Spyglass` action (`inputActions.js`: appended; a port row; in Come Sail Away's group and its
`MOD_ACTIONS` - live while the ships are; a DEFAULT SHARE on K beside Travel Options' `FollowPaths`). One press raises
it, the next lowers it (`world.js spyglassStep`), ABOARD only (`naval.aboard` - at a helm, on a deck, mine, another
player's or the sea's: a deck has no road, and `travelFollowPressed` is never read aboard). Down at once ashore, under
a window or a pause, under the travel view, with a broadside laid, on a death's screen. While it is up:

- the view is the HEAD's (`player/mwView.js mwViewHoldFirst`: a third-person body put into the head and handed back as
  it stood; the perspective key refused meanwhile; the travel view's own hold wins);
- the LENS narrows to its magnification (`ui/spyglassView.js glassFov` - the field's tangent over it - at the frame's
  projection, the sky and the far ring alike; eased over GLASS_EASE_S); the spawners keep the wide lens, so nothing
  they place pops into the view the glass comes down from;
- the LOOK is slowed by it (`glassLookScale` - the mouse's, the finger's and the pad's);
- the WHEEL turns it, x2, x4, x8 (`spyglassWheel`, the glass's before the camera's);
- the naval host makes out the ship it HOLDS (`navalHost.js glass`: `glassHolds` - the look within her hull's own
  half-length at her range or the reticle's RETICLE_DEG at the magnification, the nearest to the centre; a ship the
  glass leaves is begun afresh) and the WINDOW (`drawSpyglass`) draws the tube, the reticle and her card under it
  (`shipKnowledge.js glassCard`: her name in her tone, her line, her rows as far as she is made out, the study's bar
  while it fills, and how close the next lesson wants her); its foot says the magnification and the presses.

A finger has the touch corner's Glass (`touchButtons.js`) and, at a helm, the plate's own Glass over the Brace
(`navalHud.js navalTouchGlass`, brass while the glass is up); a pad has a bindings row and a d-pad choice
(`plusPadBinds.js`, `plusPad.js`). Controls.md has the row.

## CAPT-BOARD - the harbourmaster's board

A port's harbourmaster (the shipwright's window's HARBOURMASTER tab, at the helm lying to his quay - the yard's own
door) posts `harbourBoard.js BOARD_OFFERS` contracts a day, and a rank's `offers` more, drawn off the port's key and the
WORLD's day on BOARD_SALT's stream: the same board for every client, a new one at dawn, an offer taken gone from it for
the day (its place never refilled). The kinds, each ending in something the sea already does:

| kind | what | done when | purse |
|---|---|---|---|
| bounty | a named pirate - her class the strongest within two levels of the captain's (`bountyClass`; the flagship from level 12), her name her seed's - last seen SITE_PX map pixels off the port in open water (`siteFor`: every neighbour of her pixel sea, on the square ring, eight ways round) | she is sunk or taken by the captain's hand (`advance`'s `end` with her `bounty` id) | PAY_BASE.bounty times her size, and her waters' distance |
| hunt | CONTRACT_NEED.hunt pirate ships ended in the crown's waters | sunk or taken there, any of them (a boarding beaten off is no end) | PAY_BASE.hunt each |
| delivery | a cargo to another port DELIVERY_PX_MIN or more off, its term DELIVERY_DAYS_BASE and a day a DELIVERY_PX_DAY pixels | the boat that took it on lies to that port's quay; wrecked, it is lost | PAY_BASE.delivery a pixel and its start |
| salvage | a merchantman gone down SITE_PX off the port - CONTRACT_NEED.salvage casks of her cargo | each cask hauled out of the sea where she went down | PAY_BASE.salvage a cask, and the distance |
| survey | the Admiralty's measure of the crown's shipping - CONTRACT_NEED.survey ships studied through the glass in its waters | each ship the glass studies (`KNOW.studied` by the glass, never a ship struck) | PAY_BASE.survey each |

Every purse is times the captain's level (PAY_LEVEL a level) and the rank's `pay`, to the nearest five. A contract runs
on the captain's own clock (CONTRACTS_MAX at once - `captainLedger.js holdContract`); done, it pays and its crown's
regard rises by its `standing`, its kind and its purse in the log; failed (a term out - the world asks every two
seconds - or a cargo lost) STANDING_FAILED; given up from the tab, STANDING_ABANDONED. The HUD says each one come
further ("Clear Wayrest's waters: 2 of 3 pirate ships ended"), the screen's middle each done or failed.

THE SITES (`navalHost.js siteStep`, SITE_CHECK_S apart, aboard): a held bounty's quarry is stood when the captain sails
within SITE_REACH_PX map pixels of her waters - at the world's open water in her pixel (`world.js navalSitePoint`), else
SITE_AHEAD_M toward it - her class, her seed (her name the board's), bold and flying no false colours; stood again if the
sea lets her go before she is ended. A held salvage's casks float there (SITE_CASK_LIFE each, its own lot - `SITE_LOT`),
again if they sank unhauled. A boat of mine lying to a port's quay at her helm is the berth a delivery asks after.

THE LETTERS: a crown's LETTER OF MARQUE (CAPT-MARQUE above) for MARQUE_PRICE, MARQUE_DAYS of the captain's clock, to its
Privateers, one crown's at a time (`marqueOffer`); THE ADMIRALTY'S CARRACK - the one Carrack the Bay sells, Come Sail
Away's shelves never carrying one - at ADMIRALTY_OFF off her price, to its Commodores (`admiraltyOffer`), her title to
the Fleet's book at that port (`systems/fleet.js titleDeed`, a `mintDeed` of hull 4).

A RANK'S FAVOURS AT SEA (`harbourOffice.js perksHere` - the waters' crown's, none while its navy hunts the captain):
the shipwright's prices less the rank's `yard` (`navalYard.js yardOffer`'s `discount`, never past YARD_DISCOUNT_MAX);
hands hired come SEASONED_HIRE fights' worth (`crewStep`'s sync); and an Admiral's crown always sends its relief
(`navalDirector.js reliefSpawn`'s `reliefSure` - the stream's draw taken either way).

## CAPT-TRADE - the exchange

The shipwright's window's EXCHANGE tab (`harbourOffice.js exchange`): `tradeGoods.js GOODS` - eight of the Bay (wine,
grain, wool, iron, spices, silk, silver, ivory) and the Etheric Sea's three (ether-amber, starglass, voidsilk). Each
crown's ports MAKE some and WANT others (`CROWN_TRADE`), every port twisting its crown's trade by one good of its own
off its key (`portTrade`); the Etheric Sea's goods are wanted in every port of the Bay and made only on its isles. A
good's price is its base times MADE_K where made, WANT_K where wanted (EXOTIC_K for the other sea's), drifting within
PRICE_DRIFT a day - the same for every client on the world's day (`priceOf`); the exchange sells SPREAD over it and buys SPREAD
under it, and deals only so much of a good a day (`DAY_STOCK`: plenty of what it makes, little of what it wants - and it is
glutted soon with what it makes itself). The captain's dealing at the last exchange is kept for the day
(`captainLedger.js dealtAt`, `deal`). Bought goods go into the hold of the boat at the quay (Come Sail Away's cargo:
their weight is on her way); sold, out of it; a sale's gold in the log.

The goods are ITEMS of the port's own (DECLARED): custom templates from GOODS_TEMPLATE (1331), stackable, the row's
weight and base - sold at any shop at their base like any item; `systems/itemLaw.js` imports the module, as the
carpenter's stores' - and the chart's - so the account service's Worker bundles them and what they read (the board,
the ships' table, the hash), and its deploy's path filter names each (`.github/workflows/account-deploy.yml`, ACC4's
walk). A port's key hashes on the wire's FNV-1a (net/wire.js `hashKey`, the board's re-export - one home).

## CAPT-CHARTS - treasure charts

A pirate the captain ends - sunk or taken - carries a TREASURE CHART among her papers CHART_CHANCE of the time (more in
the deep waters, a flagship's oftener), by her seed (`treasureCharts.js chartAboard`): given to the boat in play and
said ("Among her captain's papers: a treasure chart!"). The chart is an item of the port's own (CHART_TEMPLATE,
Daggerfall's parchment picture, its seed its `message`). USED (`world.js`'s use handler), it is READ: its cache is a
port of the Bay off its seed and open water CHART_PX off it (`chartSite`), marked on the captain's charts (CHARTS_MAX,
never one twice) and the chart spent. Sailed to, the cache's chest floats up beside the ship (the sites' `cache`); hauled
aboard (`navalHost.js pickCache`) it pays CACHE_LOTS of a strongbox's lots and CACHE_GOLD - and the log's `maps`. The
Captain page lists the charts marked.

## Tests and mutants

`test/captcrew.test.js` (`tools/mutants/captcrew.json`), `test/captlog.test.js` (`tools/mutants/captlog.json`),
`test/captwaters.test.js` (`tools/mutants/captwaters.json`), `test/spyglass.test.js` (`tools/mutants/spyglass.json`),
`test/captboard.test.js` (`tools/mutants/captboard.json`), `test/capttrade.test.js` (`tools/mutants/capttrade.json`) -
every mutant dead. The suites whose pins moved with them say so where they moved (PIN MOVED): the crew card's line,
the Holdings tabs, the tags and the hails now knowing a ship first (`test/navalSea.mjs knowAll`), the action tables,
the lens, the sky's and the far ring's lens narrowed with the world's (`test/climb4.test.js`, `test/hudlarge.test.js`
E5), the wheel's rung for the glass (`test/audit24_wave37.test.js`). The harbour office's day is a reader of the event
clock, named in `test/fixtures/time1_census.json`.
