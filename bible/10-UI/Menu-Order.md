# MENU ORDER - pictures before words: the decorator, the shop counter and the Stores page's stations (MENU-ORDER, 2026-10-12)

The port's own. Three enhanced surfaces that worked and read as walls of text - the decorator's panel and its placing
bar, the shop counter, and the Stores page with every crafting station on it - each made to show what it is before it
says it: a picture a kind, a picture a press, tiles where columns of lines stood. No law moved: every price, fee,
refusal and act is the one the surface drew before, read off the same producers.

## Asked

The owner (2026-10-12): "I want to really organize and enhance the decoration menu/buttons. Making it for palatable,
readable and easy to understand. I want to do the same for stores, crafting menus, etc."

A first pass grouped and labelled the text (named filter rows, named groups of presses). The owner, of it: "I just feel
like text lists are too much. Why cant you try something else" - so the pass that stands is pictures first, words
where a picture cannot say it (a price, a name).

## 1. What a player met (FACT, at 2617d0ba)

- **The decorator** (`src/ui/decorPanel.js`, DECOR1d onward): one row of unlabelled chips - eighteen kinds, three sizes,
  two "has" chips and three sorts - under a tab row that held the views and a house's rooms alike; a catalogue of text
  lines, a model's picture two letters of its kind ("Be", "Fu"); a placed piece's eight presses in one wrapping row
  (Move, Turn left, Turn right, Light, Holds things, the station's craft, its licence, Remove), Remove dressed as any
  other; the placing bar's keys one run-on sentence over its buttons. On a phone the filters took the card and the list
  was gone.
- **The shop counter** (`src/ui/enhancedTrade.js`): the player's column unnamed under the shop's "On the shelf"; one
  footer span "Cost: 0   Gold: 1840", its spaces collapsed; a price only after a row was clicked; Steal beside Clear;
  a magic-only counter titled "Sell"; the empty strip's hint in #7d745f, under FONT3's dim; four page tabs four rows
  deep on a phone.
- **The Stores page** (`src/ui/profPages.js`): every station drawn one after another whether the player stood at it or
  not - at a smith's forge, eleven Smelt rows (nine of them "(0)") and fifteen Anvil patterns, each a full-width line;
  away from a station, its "is done at..." paragraph, so a player at no bench read nine of them.

## 2. What changed

- **MENU-ORDER a, the pictures** (`src/ui/menuGlyphs.js`, new). A 12x12 pixel glyph each for the catalogue's kinds
  (every `DECOR_KINDS` key), the views, the sizes, the stations and the presses, typed as rows of `#` - the port's own
  art, no ARENA2 pixel (Port-Doctrine, A RENDER OF GAME DATA IS GAME DATA). An element asks for one by `data-dficon`;
  `DFICON_CSS` draws it as the element's `::before` through a CSS mask over `currentColor`, so it takes the word's own
  colour - a chosen chip's brass, a disabled press's grey, every Plus theme.
- **MENU-ORDER b, the decorator.** The catalogue, the room's pieces, the built-in pieces and "Your things" lay as
  **tiles** (`DECOR_GRID_MODES`; a room to rent and a part to paint stay lines): a picture 76px, the name, the price,
  and badges for what a piece does (holds things, gives light, serves a craft); a model's tile its kind's glyph, the two
  letters kept under it for a reader. **Pictures / List** beside the views switches the lay (`DECOR_LAYOUT_WORDS`).
  Every view tab, kind chip, size and has-filter wears its glyph; the views are a tab bar of their own, a house's rooms a
  row of their own ("Room"). The filters stand under their names - Sort beside the search, then Type, Size and Show only
  - and a phone folds all but the search and the sort behind **Filters**, which counts what it hides
  (`decorFiltersText`). A piece's presses are picture tiles in named groups (`DECOR_ACT_GROUPS`: Arrange; Light and
  storage; Crafting station; then Remove alone, in the kit's warn role); a long-worded press lies flat beside its glyph.
  The placing bar is its pictured presses (Place, the turns, Raise and Lower, Smaller and Bigger, Grid, Back) and a
  **Keys** press that unfolds the keys' legend - a name and what presses it, a pair a line (`decorBarKeys`) - folded
  until asked. The caravan's paint row, hidden by an attribute `display: flex` outweighed, hidden in fact.
- **MENU-ORDER c, the shop counter.** Every shelf row carries its price (`rowPrice` - the strip's own quote, so the row
  and the click agree); where the counter buys, repairs or identifies, the player's rows carry theirs. **List /
  Pictures** in the header lays both lists as tiles, a picture the pack grid's box (`SLOT_BOX.grid`) - lines first, the
  player's choice kept. The player's column is named ("Your pack") over its tabs; the footer's two figures stand each
  under its name (`TRADE_COST_WORD`: To pay, or You get; Your gold); Steal is set apart in the warn role; a magic-only
  counter's title says "Sell magic items" (`TRADE_TITLE`); a phone's four pages lie two by two; the empty strip's hint
  in the dim.
- **MENU-ORDER d, the Stores page.** Under the Stores, a row of **station tiles** (`STATION_TILES`): a glyph, a short
  name, and Here (lit) or Away. A station worked here is drawn below as it always was, and its tile takes the player to
  it; one the player is away from keeps its section - every word it says - hidden under the tiles until its tile is
  pressed, and a second press puts it away (`_stores.awayPick`). A section is "worked here" when it draws a press - a
  button, a field, a choice (`stationWorkable`); a station a press asked the page to land on (STATION-DOOR) is shown. A
  station's works (smelt, burn, saw, cure, weave, transmute) and its patterns are **cards** in a grid (`.prof-works`,
  `.prof-recipes`), a dark one still drawn where it stood. The material chips a step larger (12px).
- **MENU-ORDER e, the Notice Board's Market and Vendors, and the Stores' materials** (the owner, of the next surfaces:
  "Continue"). A Market material row, a supplier's row (the Weavers', the Apothecaries'), a pack piece listed for gold, a
  trader's piece and a Stores card each wear the game's own item picture before their name: the item the Stores would
  hand the material out as (systems/profItems.js `mintMaterialItem`), or the piece itself, read off its inventory record
  and fitted to a row's box (`src/ui/menuPicture.js`, new: `materialPicture`, `itemPicture` - the pack's and the shop's
  own door, `requestFittedIcon`). The tabs read no game law, so the host hands the picture over (`picture`,
  `itemPicture` on the board's market, `picture` on its traders, a stall's and the Stores page's provider) and the tab
  draws it (`pictureNode`, `ui/menuGlyphs.js`); with no data there is none and the row is its words. The Market's views
  are pictured chips (`MARKET_VIEW_ICONS`: ore, hammer, gavel, pack, list, coin, chart), never a second row of the
  board's tabs. FOUND on the way: on a phone the views' row scrolled sideways inside the tab's column and took no height
  at all (`overflow-x` makes `min-height: auto` nought) - a phone's Market showed Materials and nothing to switch to;
  it is `flex: none` now.

- **MENU-ORDER f, the rest** (the owner: "Dont report back until everything is finished"). The pause menu's Vendor page
  pictures a trader's pieces (`picture` on its provider); the Market's crafted pieces and auctions their own (the piece
  their record mints, minted once by its provenance - world.js `marketPiecePicture`). The Reforge's pages each wear a
  glyph (`REFORGE_PAGE_ICONS`), and a row with no press of its own gives its name the press's column (SCRY-FIT sized the
  price and the press to their words and kept the press's column on every row, so the Reforge page cut every name to
  "Warrior..."); a name runs to two lines rather than an ellipsis. The shipmaster's pages each wear a glyph
  (`SHIPYARD_TAB_ICONS`), and a ship's card leads with a ship drawn her size - a Rowboat small, a Large Galley great; its
  figures a step larger (12px). The naval yard's three pages (Shipwright, Harbourmaster, Exchange) and a merchant's
  presses (Repair item, Talk, Sell or Banking, Exit - `MERCHANT_ICONS`; a service's own word, none) each wear theirs.

THE FOUR HOSTS (Home.md, 17e): the decorator, the counter and the pages are each one surface every host opens through
its one door (`scenes/decorTool.js`, `ui/tradeDoor.js`, the pause menu's pages). MENU-ORDER e's pictures are handed by
the providers that stand them: `src/scenes/world.js` WIRED - the Stores page's (`setProfessionsPages`), the board's
market and traders (`showNoticeWindow`'s `market`, `vendorBoardHost`), a trader's stall (`openHomeVendorWindow`) and the
Vendor page's (`setVendorPage`), the only places those providers are built; `src/scenes/worldModes.js` (the interiors), `src/scenes/dungeonContext.js` and
`src/scenes/exterior.js` build none of them (the board is the streaming world's, its stall opens through world.js's
door), so there is nothing there to wire.

## 3. The laws

1. **A PICTURE BEFORE A WORD.** A kind, a view and a press show what they are before their words do; the words stay,
   for a reader and a hover.
2. **THE PICTURES ARE OURS.** Every glyph is typed in `menuGlyphs.js`; a piece's own picture is the player's data at
   runtime, never a committed raster.
3. **A PRICE WHERE THE THING IS.** What a piece costs or brings stands on its own row or tile, the same figure a click
   quotes.
4. **WHAT IS NOT HERE WAITS TO BE ASKED.** A station the player is away from, the bar's keys and a phone's filters are
   one press away - kept, never dropped.

## 4. Not done, and why

- **The classic windows** - DFU's trade window (INVE00I0/SHOP00I0), the potion maker (MASK00I0) and the item maker
  (ITEM00I0) - draw DFU's rects (THE NATIVE-WINDOW RULE, Home.md): no picture is added there.
- **The Work tab** is cards already (the writs pinned on the cork), and **the Sigil Broker** pictures its offers in their
  frames already: neither changed.
- **A refused press's reason on a touch screen.** The Reforge's refused presses say why in a word ("Worn", "Cannot")
  and in full only on the hover (`title`), and a disabled press takes no tap - PLAIN-UI's law 5 unmet there. Answering
  it means a press that is not disabled and says its reason when tapped, across every Reforge page and the pins that
  hold `disabled` - OPEN, its own slice.
- **A ship's own picture.** The yard draws a glyph at her size; her hull's model, rendered small, is a renderer's pass -
  OPEN.
- **A model's own picture in a tile.** A model has none until the host turns it in the preview; its tile wears its
  kind's glyph. Rendering every model small for the grid is a renderer's pass - OPEN.
- **A portrait phone's placing bar** keeps its 272px clearance for the touch layer (DECOR1e), so it is narrow there -
  older than this, OPEN with it.

## 5. Proof

- `test/menuorder.test.js` (7): the glyphs (twelve by twelve, a rect a lit pixel, a mask each, every kind and station
  pictured); the decorator's tiles, its kind glyphs and letters, its badges, the Pictures / List switch, the tabs' and
  chips' glyphs, the switch after the tabs; a placed piece's pictured presses, Remove warned, the bar's legend folded
  behind Keys, the legend's pairs, the fold's count; the counter's title, its named column, its two figures, a price on
  every shelf row equal to the strip's quote, Steal apart, the switch; the Stores page's tiles, Here and Away, an away
  station's words hidden until pressed and again, a section with a button read as worked, the works and patterns as
  cards; the board's rows pictured - a Market material row, a supplier's and a trader's piece, none without a picture,
  a Stores card - the Market's views their glyphs, a phone's row of them its height; the rest - the Vendor page's pieces
  and the Market's crafted pieces pictured, the Reforge's, the yard's and a merchant's glyphs, the Reforge's buttonless
  row, the ships' sizes in the yard's order, the host's hand-over in world.js (`test/shipyards1_host.test.js`'s window:
  each page its glyph, a ship on every card). PINS MOVED: the bar's keys read whole (`decor1e`, `decorfigure`), DECOR-FLIP reads the legend's own pair
  (`decorflip`), PLUS-DRESS's warn literals carry the decorator's Remove and the counter's Steal (`plusdress1`), the
  stations' order read in the tiles' list (`prof9_client`, `prof10_client`, `prof11_client`, `prof12_client`).
- `tools/mutants/menuorder.json`: 47 mutants, 47 dead. Re-aimed by content and dead again: `decorfigure.json`'s
  DECOR-FIGURE-buttons-kept, `craft4.json`'s CRAFT4-pages-no-loom, `prof10.json`'s PROF10-pages-no-bench,
  `prof11.json`'s PROF11-pages-bench-undrawn, `prof12.json`'s PROF12-pages-alchemy-undrawn and
  PROF12-pages-enchant-undrawn.
- Photographed in Chromium over the real enhanced sheet, at 1440x900 and a 390px phone: the decorator's catalogue,
  room, pack and bar; the counter's Buy and Sell in both lays; the Stores page at a smith's and away from every bench,
  an away tile pressed; the board's Market and Vendors (`tools/noticeBoardProbe.mjs`, its every tab inside the viewport
  at a desktop and a phone, and a copy handed stand-in pictures); the Reforge, the shipmaster's window and a merchant's
  popup over the real sheet.
