// @ts-check
// TUT1 (2026-10-11): THE TUTORIALS' WORDS - every page DFO's tutorial can show, grouped as the menu's Tutorials tab
// lists them. The law that reads them is systems/tutorials.js; the box is ui/tutorialPopup.js; the menu's pane is
// ui/tutorialsPane.js.
//
// THE RULES A PAGE KEEPS (test/tut1_tutorials.test.js holds every page to them):
// - The game is DFO. A page never names the old game it grew from - not the game, not its capital.
// - A key is written `{Action}` (an action of systems/inputActions.js) and filled with the key the player has bound
//   now, never a key's name: a rebound key would make the page lie.
// - A page is short enough to read in a popup: a few short paragraphs and a few points.
// - `trigger` says, in words, when the page pops on its own (the menu shows it under the title); a page with no seam
//   says it is read here. `TUTORIAL_TOUR` pops together as the welcome tour when a new character first stands in the
//   world.
// - Every claim was checked against the system's own bible page and code when the page was written (TUT1). A slice
//   that changes how a system plays changes its page.

/** @typedef {{ id: string, group: string, title: string, trigger: string, body: ReadonlyArray<string>, points?: ReadonlyArray<string> }} Tutorial */

/** The menu's sections, in order. */
export const TUTORIAL_GROUPS = Object.freeze([
  Object.freeze({ id: 'basics', title: 'Getting Started' }),
  Object.freeze({ id: 'combat', title: 'Combat & Magic' }),
  Object.freeze({ id: 'character', title: 'Your Character' }),
  Object.freeze({ id: 'world', title: 'Exploring' }),
  Object.freeze({ id: 'travel', title: 'Travel & Mounts' }),
  Object.freeze({ id: 'towns', title: 'Towns, Trade & Guilds' }),
  Object.freeze({ id: 'quests', title: 'Quests & Bounties' }),
  Object.freeze({ id: 'loot', title: 'Loot & Gear' }),
  Object.freeze({ id: 'livelihood', title: 'Professions & Survival' }),
  Object.freeze({ id: 'sea', title: 'Ships & the Sea' }),
  Object.freeze({ id: 'challenges', title: 'Challenges' }),
  Object.freeze({ id: 'legacy', title: 'Family & Legacy' }),
  Object.freeze({ id: 'online', title: 'Playing Online' }),
]);

/** Said for a page no seam pops: it is read in the menu. */
export const MENU_ONLY = 'Read it here, in the menu, any time.';

/** @param {Tutorial} t */
const page = (t) => Object.freeze({ ...t, body: Object.freeze([...t.body]), points: Object.freeze([...(t.points ?? [])]) });

/** @type {ReadonlyArray<Readonly<Tutorial>>} */
export const TUTORIALS = Object.freeze([
  // ── GETTING STARTED ──────────────────────────────────────────
  page({
    id: 'welcome', group: 'basics', title: 'Welcome to DFO', trigger: 'The welcome tour, when a new character first wakes.',
    body: [
      'Welcome to DFO - a vast, open world of cities, wilderness and dungeons, played alone or alongside others online.',
      'These pages teach the basics. Whenever you reach something new - a window, a mount, a ship, a card table - a short page like this one explains it the first time.',
      'Every page can be read again: press {Escape} and open the Tutorials tab.',
    ],
  }),
  page({
    id: 'movement', group: 'basics', title: 'Moving Around', trigger: 'The welcome tour.',
    body: [
      'Walk with {MoveForwards} {MoveLeft} {MoveBackwards} {MoveRight} and look with the mouse. Hold {Run} to run, press {Jump} to jump and {Crouch} to crouch. {AutoRun} runs forward on its own.',
      'Press {Jump} at a ledge to climb or vault it. Catch a high ledge to hang from it: forward climbs up, left and right move along it, and {Crouch} lets go. Your grip tires - Climbing skill holds it longer.',
    ],
    points: [
      '{FreeMouse} frees the cursor to click on the world and the HUD; press it again to look around.',
      '{TogglePerspective} switches between first and third person.',
      'Every key can be changed in Settings > Controls.',
    ],
  }),
  page({
    id: 'interacting', group: 'basics', title: 'Using Things', trigger: 'The welcome tour.',
    body: [
      'Look at a door, a chest, a lever or a person and press {ActivateCenterObject} or {Interact} to use it. The words under your crosshair say what a press will do.',
      'What a click does depends on your mode - Steal, Grab, Info or Talk. Hold {ModeWheel} for the mode wheel, flick toward one and let go. Info mode names buildings and things from afar.',
    ],
  }),
  page({
    id: 'hud', group: 'basics', title: 'Reading the HUD', trigger: 'The welcome tour.',
    body: [
      'Your health, fatigue and magicka are the three bars. The compass shows your heading, and a followed quest marks its goal on it.',
      'Messages appear at the right of the screen. The hotbar at the bottom holds weapons, potions and spells for a single key press.',
    ],
    points: [
      '{Status} tells you where you are, the date and your condition.',
      '{CharacterSheet} opens your character, {Inventory} your pack, {LogBook} your quests and {AutoMap} your map.',
      'Settings > Interface moves, locks and scales the HUD.',
    ],
  }),
  page({
    id: 'menu', group: 'basics', title: 'The Menu', trigger: 'The welcome tour.',
    body: [
      '{Escape} opens the menu. Its tabs: Quests (your journal), Stats, Holdings (your horse, wagon, ships, companions and collections), Family, Tutorials, and System - save, load, settings and more.',
      'Settings > Features lists every system DFO adds; each one can be switched on or off there. Online, the world goes on while the menu is open.',
    ],
  }),
  page({
    id: 'saving', group: 'basics', title: 'Saving Your Game', trigger: 'The welcome tour.',
    body: [
      'Save often. {QuickSave} quicksaves and {QuickLoad} loads it; Save Game and Load Game are on the menu\'s System tab.',
      'Signed in to an account, your saves can follow you to other devices.',
    ],
  }),
  page({
    id: 'first-steps', group: 'basics', title: 'Your First Steps', trigger: 'The welcome tour.',
    body: [
      'You wake in a small cave of your own - a safe place to learn. Open your pack, put on the best armour you carry and ready a weapon you are skilled with. Then find the way out.',
      'Outside, make for a town. Talk to people, sell what you found, join a guild and ask for work. There is no wrong direction.',
    ],
  }),

  // ── COMBAT & MAGIC ───────────────────────────────────────────
  page({
    id: 'combat', group: 'combat', title: 'Fighting', trigger: 'The first time you draw a weapon.',
    body: [
      '{ReadyWeapon} draws or sheathes your weapon and {SwingWeapon} attacks. Moving the mouse as you attack chooses the stroke; Settings > Controls changes how attacks are made.',
      'Whether a blow lands depends on your skill with the weapon and its material. If you keep missing, use a weapon you are skilled with, or a better metal. Some foes can only be hurt by stronger materials - and running away is always allowed.',
    ],
    points: [
      '{SwitchHand} swaps between your two hands.',
      'A weapon (or gauntlets) of Magic rarity or better may carry a technique - a special move such as a Whirlwind or a Leap Strike. {WeaponTechnique} uses it; it costs fatigue and needs time to recover.',
    ],
  }),
  page({
    id: 'death', group: 'combat', title: 'When You Fall', trigger: 'The first time you die.',
    body: [
      'Online, you wake at the nearest temple, town or graveyard - or a dungeon\'s entrance - with part of your health, and you lose a tenth of the gold you carry. Banked gold and letters of credit are safe.',
      'Offline, it depends on your family: an Enduring family rises the same way and ages a little; in a Bloodline family death is final and an heir takes up the line. With Project Legacy off, death ends the run - load a save.',
    ],
    points: ['Waking ends poisons, but not diseases, vampirism or lycanthropy.'],
  }),
  page({
    id: 'spellbook', group: 'combat', title: 'Casting Spells', trigger: 'The first time you open your spellbook.',
    body: [
      '{CastSpell} opens your spellbook. Pick a spell to cast it; a spell with a target is then aimed and released with {SwingWeapon}.',
      'Spells cost magicka. {RecastSpell} casts your last spell again and {AbortSpell} lets a readied spell go.',
    ],
    points: ['Spells are bought and made at the Mages Guild.', 'A spell can sit on the hotbar for one key press.'],
  }),
  page({
    id: 'spellmaker', group: 'combat', title: 'The Spellmaker', trigger: 'The first time you open the spellmaker.',
    body: [
      'Build your own spell from up to three effects. Set each one\'s duration, chance and magnitude, then choose who it targets and its element.',
      'A stronger spell costs more gold to make and more magicka to cast. Name it, and it joins your spellbook.',
    ],
  }),
  page({
    id: 'magic-items', group: 'combat', title: 'Magic Items', trigger: 'The first time you use a magic item.',
    body: [
      'Rings, amulets, weapons and armour can carry enchantments. Some work while worn; others are used: {UseMagicItem} lists them - pick one to use its power.',
      'Using a power wears the item down. Have it repaired before it breaks.',
    ],
  }),
  page({
    id: 'daedra-summoning', group: 'combat', title: 'Summoning Daedra', trigger: 'The first time you ask to summon a Daedra Prince.',
    body: [
      'Summoners at the Mages Guild, some temples and the witches\' covens can call a Daedra Prince - for a price, and only on the right days.',
      'A Prince who answers offers a task. Finish it and you are rewarded with one of their artifacts.',
    ],
  }),
  page({
    id: 'quickslots', group: 'combat', title: 'The Hotbar', trigger: 'The first time you use a hotbar slot.',
    body: [
      'The hotbar holds what you reach for in a hurry. {QuickUse1} and {QuickUse2} use its consumables, {QuickSpell} its spell and {QuickOffHand} your off hand; {Hotbar5} to {Hotbar10} use the rest.',
      'Put an item on it from your inventory: point at the item and choose a slot. {QuickDial} opens the quick dial.',
    ],
  }),

  // ── YOUR CHARACTER ───────────────────────────────────────────
  page({
    id: 'inventory', group: 'character', title: 'Your Inventory', trigger: 'The first time you open your inventory.',
    body: [
      '{Inventory} opens your gear and your pack. Put an item on your body to equip it: wear armour everywhere you can, and carry the best weapon you are skilled with.',
      'Weight matters - carry too much and you slow down. Sell what you do not need in town.',
    ],
    points: ['Point at an item to read it; right-click for what you can do with it.'],
  }),
  page({
    id: 'wallet', group: 'character', title: 'Your Wallet', trigger: 'The first time you open your wallet.',
    body: [
      'Every character carries a wallet. It counts your gold - and online, your account\'s silver - and holds your letters of credit, Deadlands Embers and Welkynd Shards.',
      'It cannot be stored, traded or set out as decor; it is always with you.',
    ],
  }),
  page({
    id: 'character-sheet', group: 'character', title: 'Your Character', trigger: 'The first time you open your character sheet.',
    body: [
      'Your attributes, skills and standings. Skills rise by use - swing a sword to grow your blade skill, cast to grow your magic.',
      'Your primary and major skills drive your level: when enough of them have risen, you level up.',
    ],
  }),
  page({
    id: 'level-up', group: 'character', title: 'Levelling Up', trigger: 'The first time you level up.',
    body: [
      'You have grown stronger. Open your character sheet and spend the points you are given on your attributes - each shapes what you are good at.',
      'Your health rises with every level. Keep using your skills to reach the next.',
    ],
  }),
  page({
    id: 'rest', group: 'character', title: 'Resting and Waiting', trigger: 'The first time you rest.',
    body: [
      '{Rest} rests until you recover your health, fatigue and magicka, or loiters until a shop opens. You cannot rest with enemies near.',
      'Sleeping in the open is risky; an inn room is safest. Online, you can rest with your party at a campfire or a bed.',
    ],
  }),
  page({
    id: 'reputation', group: 'character', title: 'Reputation and Standing', trigger: MENU_ONLY,
    body: [
      'Every guild, temple, knightly order and region remembers how you treat it. Their quests raise your standing; crimes and failures lower it, and bad standing slowly mends with time.',
      'Higher standing brings better prices, kinder words and higher ranks. Your character sheet shows it; Settings can list every faction, not only your own.',
    ],
  }),
  page({
    id: 'afflictions', group: 'character', title: 'Disease and Curses of the Blood', trigger: 'The first time you fall ill.',
    body: [
      'A creature\'s bite or a filthy place can give you a disease. It worsens with time - temples cure it, and so do potions and spells.',
      'Vampirism and lycanthropy are curses of the blood. A vampire does not burn in the sun here: daylight weakens them and night strengthens them, and a raised hood lets them travel by day.',
    ],
  }),

  // ── EXPLORING ────────────────────────────────────────────────
  page({
    id: 'automap', group: 'world', title: 'The Map', trigger: 'The first time you open the map.',
    body: [
      '{AutoMap} opens the map of where you are: a dungeon\'s halls as you have walked them, or a town\'s streets and buildings.',
      'Drag to pan and scroll to zoom. Right-click to place a waypoint and find your way back.',
    ],
  }),
  page({
    id: 'dungeons', group: 'world', title: 'Dungeons', trigger: 'The first time you enter a dungeon.',
    body: [
      'Dungeons are large and winding. Open your map often, and watch for levers, switches and secret doors that open the way.',
      'The way out is the door you came in by. Quests often hide what you seek in a dungeon\'s deepest rooms.',
    ],
  }),
  page({
    id: 'searchables', group: 'world', title: 'Searching', trigger: 'The first time you search something.',
    body: [
      'Coffins, sarcophagi, shelves, gravestones, chests and crates can be searched. A search turns up treasure - always some gold - or wakes something better left asleep, or finds nothing at all.',
    ],
  }),
  page({
    id: 'torches', group: 'world', title: 'Torches and Lanterns', trigger: 'The first time you light a torch.',
    body: [
      'A light in your off hand pushes back the dark. {TorchToggleLight} lights or puts it out, {TorchDrop} sets it down and {TorchThrow} throws a torch - hold it to throw further.',
      'Drawing a weapon that needs both hands puts the torch out.',
    ],
  }),
  page({
    id: 'crime', group: 'world', title: 'Crime and the Law', trigger: 'The first time you face the law.',
    body: [
      'Theft, trespass and violence against innocents are crimes. Guards who know you stop you: pay the fine, go to court, or refuse and fight.',
      'Murder and treason get you banished from the region for 30 days - or buy a pardon at its temple. Each region keeps its own record of you.',
    ],
  }),

  // ── TRAVEL & MOUNTS ──────────────────────────────────────────
  page({
    id: 'travel-map', group: 'travel', title: 'The Travel Map', trigger: 'The first time you open the travel map.',
    body: [
      '{TravelMap} opens the map of the land. Pick a region, then a place, and travel there - the journey passes days of the world\'s time in a moment of yours.',
      'Choose to travel cautiously or recklessly, on foot, by horse or by ship, and to camp or stay at inns along the way. Find searches for a place by name.',
    ],
    points: ['Online, journeys over land are walked on the roads, not skipped.'],
  }),
  page({
    id: 'travel-view', group: 'travel', title: 'The Overworld', trigger: 'The first time you open the Overworld.',
    body: [
      'The Overworld button at the foot of the map shows the land from above. Click a town to travel the roads to it, or open ground to walk straight there; you can stop anywhere and step back into the world.',
      '{FollowPaths} follows the road ahead on your own.',
    ],
  }),
  page({
    id: 'carriages', group: 'travel', title: 'Carriages', trigger: 'The first time you hire a carriage.',
    body: [
      'Carriage drivers wait outside the gates of walled cities. Talk to one to ride to a city, hamlet or village for a daily fare, plus the inns along the way.',
      'Online, a carriage or a ship\'s passage from a port is the quick way across the land.',
    ],
  }),
  page({
    id: 'horse', group: 'travel', title: 'Horses and Transport', trigger: 'The first time you choose your transport.',
    body: [
      'Every city and town has a stable that sells horses. {Transport} chooses how you travel - on foot, by horse or by cart.',
      '{HorseMount} mounts and dismounts, and {HorseSummon} calls your horse and wagon to you.',
    ],
  }),
  page({
    id: 'wagon', group: 'travel', title: 'Wagons and Carts', trigger: 'The first time you use a wagon.',
    body: [
      'A town\'s wagon yard sells a Small Cart (750 kg), an Open Wagon (1,500 kg, with four seats for players and companions) and a Caravan (2,000 kg, and you can step inside). The bigger two need a team of two horses.',
      'Do not leave a wagon on a town\'s road: after ten minutes the watch drags it outside the town, cargo and all.',
    ],
  }),
  page({
    id: 'portal-stone', group: 'travel', title: 'Portal Stones', trigger: 'The first time you use a portal stone.',
    body: [
      'Use a Portal Stone from your pack and choose any place on the map: a portal stands for 30 seconds, and online anyone nearby may follow you through. Each stone is used up.',
      'Stones cost Welkynd Shards at a shop\'s counter. They will not open indoors, in dungeons, near enemies, or during a duel, a siege or a journey.',
    ],
  }),

  // ── TOWNS, TRADE & GUILDS ────────────────────────────────────
  page({
    id: 'talk', group: 'towns', title: 'Talking to People', trigger: 'The first time you talk to someone.',
    body: [
      'Ask for directions to places and people, for news, and for work. Choose your tone; the person\'s mood and your standing decide what they tell you.',
      'Ask the same person about a building again and they may mark it on your map. Befriend someone and new topics open.',
    ],
  }),
  page({
    id: 'shops', group: 'towns', title: 'Shops and Trade', trigger: 'The first time you trade with a merchant.',
    body: [
      'Shopkeepers buy and sell. Each kind of shop buys certain goods - pawnbrokers almost anything, smiths weapons and armour.',
      'Your Mercantile skill and the shop\'s quality set the price. Most shops close at night: rest until morning if one is shut.',
    ],
    points: ['Smiths repair worn weapons and armour.'],
  }),
  page({
    id: 'bank', group: 'towns', title: 'The Bank', trigger: 'The first time you visit a bank.',
    body: [
      'Banks keep your gold safe and write letters of credit, which weigh nothing. They lend money - repay it on time - and sell houses and ships.',
      'Each region has its own bank and keeps its own accounts.',
    ],
  }),
  page({
    id: 'guilds', group: 'towns', title: 'Guilds and Temples', trigger: 'The first time you visit a guild.',
    body: [
      'Join a guild to earn its services and its work. Rising in rank takes skill in what the guild values and regular quests for it.',
      'You may join one temple and one knightly order, and as many guilds as will have you. Some guilds keep themselves hidden.',
    ],
  }),
  page({
    id: 'tavern', group: 'towns', title: 'Taverns and Inns', trigger: 'The first time you visit a tavern.',
    body: [
      'Taverns sell food, drink and rooms. Rent a room to rest safely, ask the patrons for news and work, and sit at a table for a game of cards.',
    ],
  }),
  page({
    id: 'tavern-cards', group: 'towns', title: 'Tavern Cards', trigger: 'The first time you sit at a card table.',
    body: [
      'Every tavern has card tables: a chips table for anyone and, online, a table for gold. Play Texas Hold\'em or Iliac Hand, a collectible card game, against the regulars or other players.',
      'Your Card Binder keeps the cards you collect; Menu > Holdings > Collections shows them.',
    ],
  }),
  page({
    id: 'holdings', group: 'towns', title: 'Houses', trigger: 'The first time you look at a house to buy or rent.',
    body: [
      'A house is yours to keep: store your belongings, rest safely and furnish it as you please. Offline, buy one at a bank. Online, buy any unowned house at its front door - up to three - and choose who may enter.',
      'Decorating costs gold by the size of the piece. Online, you can rent rooms out to other players.',
    ],
  }),
  page({
    id: 'notice-board', group: 'towns', title: 'Notice Boards', trigger: 'The first time you read a notice board.',
    body: [
      'Online, a town\'s notice board is the meeting place of its players: notices, Work (writs to fill), the Market (an auction house), Vendors (players\' stalls), Guilds and the Seat.',
    ],
  }),

  // ── QUESTS & BOUNTIES ────────────────────────────────────────
  page({
    id: 'quests', group: 'quests', title: 'Quests', trigger: 'The first time you hear quest news or open your quests.',
    body: [
      'A quest has a goal and often a time limit. {LogBook} and the menu\'s Quests tab keep every quest\'s latest word - read it carefully: it names who to find and where.',
      'Quests choose places around you. Many offer to plan your travel straight to their destination. Refusing work costs nothing, unless it is part of the main story.',
    ],
  }),
  page({
    id: 'quest-guide', group: 'quests', title: 'Following a Quest', trigger: 'The first time you follow a quest.',
    body: [
      'Follow a quest and its card stands at the top right, its goal marked on your compass and map. News of your quests appears as it happens.',
      'Settings > Features sets how much the marks give away: Journal (only what your log says), Town, or Exact - which can spoil a search.',
    ],
  }),
  page({
    id: 'bounties', group: 'quests', title: 'Bounty Boards', trigger: 'The first time you read a bounty board.',
    body: [
      'Towns with more than one board keep a bounty board posting four hunts. Take one, kill its targets and return for gold and an item.',
      'Each finished bounty raises your standing with the region.',
    ],
  }),
  page({
    id: 'notebook', group: 'quests', title: 'Your Notebook', trigger: 'The first time you open your notebook.',
    body: [
      '{NoteBook} opens your notebook: your own notes, and the record of every quest you have finished.',
    ],
  }),

  // ── LOOT & GEAR ──────────────────────────────────────────────
  page({
    id: 'loot', group: 'loot', title: 'Loot and Rarity', trigger: 'The first time you loot or find a rare item.',
    body: [
      'Take what you want from a treasure pile or a fallen foe. {QuickLootAll} takes everything; {QuickLootOpen} opens the full window.',
      'Gear comes in rarities, shown by colour: Common, Magic, Rare and Legendary - and, won rather than found, Aetheric, Artifact and Gilded. Rarer pieces carry more and stronger properties.',
    ],
  }),
  page({
    id: 'materials', group: 'loot', title: 'The Materials Bag', trigger: 'The first time you bag a material.',
    body: [
      'Online, a Materials Bag from any General Store holds 300 kg of crafting materials without weighing you down. You can own one. Without it, materials go into your pack.',
    ],
  }),
  page({
    id: 'reforge', group: 'loot', title: 'The Reforge', trigger: 'The first time you visit the Reforge.',
    body: [
      'The Reforge stands at the Mages Guild. It re-rolls one property of a Magic or Rare piece for Welkynd Shards and gold, and can draw a gem out of a socket whole.',
      'Salvage breaks the pieces you do not want into Welkynd Shards.',
    ],
  }),
  page({
    id: 'gem-sockets', group: 'loot', title: 'Gems and Sockets', trigger: 'The first time you set a gem.',
    body: [
      'Weapons hold one to three sockets by size, armour one. Set a gem from your pack into a socket - it is free - and the piece gains the gem\'s power.',
    ],
  }),
  page({
    id: 'sigil-sets', group: 'loot', title: 'Sigil Sets', trigger: 'The first time you read a set piece or meet the Sigil Broker.',
    body: [
      'A sigil names the set a piece belongs to. Wear two, four or six pieces of one set to wake its powers; they grow with your Renown, and the set is only as strong as its weakest piece. Sets work online, never in duels.',
      'The Sigil Broker trades set pieces and weapons for Deadlands Embers - each offer once a day.',
    ],
  }),

  // ── PROFESSIONS & SURVIVAL ───────────────────────────────────
  page({
    id: 'foraging', group: 'livelihood', title: 'Gathering', trigger: 'The first time you gather.',
    body: [
      'Herbs, ore, timber, fish and game can be gathered in the wild with the right tool - a sickle, pick-axe, wood-axe, fishing net, basket or skinning knife.',
      'Look at what you want to gather and pick an action from its list; {ActChoice} steps through the list.',
    ],
  }),
  page({
    id: 'professions', group: 'livelihood', title: 'Professions', trigger: 'The first time you gather.',
    body: [
      'Online, every gather, craft and sale grows a profession. Each grows with practice and opens better work.',
      '{Professions} opens your Professions and your Stores - storage kept for you on the server, also on the menu\'s Holdings tab.',
    ],
  }),
  page({
    id: 'survival', group: 'livelihood', title: 'Hunger, Cold and Weariness', trigger: 'The first time you grow hungry, cold or tired.',
    body: [
      'Your character needs food, drink, warmth and sleep. Eat and drink, dress for the climate and rest when weary. Small icons by your bars show what you feel.',
      'Survival has three settings - Off, Casual (the default: needs only tire you) and Hard (they cost attributes and health, and can make you sick). Change it in Settings > Features.',
    ],
  }),

  // ── SHIPS & THE SEA ──────────────────────────────────────────
  page({
    id: 'ships', group: 'sea', title: 'Sailing', trigger: 'The first time you board a boat.',
    body: [
      'Boats are sold as parts or a deed in General Stores and Pawn Shops: use the parts in the water, or the deed near a port. Your fleet is on the menu\'s Holdings tab.',
      'At the helm, {BoatToggleSail} raises or stows the sails, {BoatSailUp} and {BoatSailDown} give more or less sail, {BoatTrimLeft} and {BoatTrimRight} trim them. {BoatDisembark} leaves the helm, {BoatToggleLight} lights the lanterns and {BoatTimeScaleUp} hurries time.',
    ],
  }),
  page({
    id: 'shipyard', group: 'sea', title: 'Shipwrights', trigger: 'The first time you visit a shipwright.',
    body: [
      'Take your helm in a port town\'s waters to reach its shipwright: repair your hull and outfit your ship.',
    ],
  }),
  page({
    id: 'naval-combat', group: 'sea', title: 'Battles at Sea', trigger: 'The first time you take a prize at sea.',
    body: [
      'Look to one side, hold {SwingWeapon} to aim a broadside and let go to fire. Batter a ship until she strikes her colours, then board her and take her cargo.',
      'Piracy is a crime. And not everything in the deep is a ship.',
    ],
  }),

  // ── CHALLENGES ───────────────────────────────────────────────
  page({
    id: 'arena', group: 'challenges', title: 'The Arena', trigger: 'The first time you visit the arena.',
    body: [
      'The arena stands in the province\'s capital. The Herald at its gate opens its window; the Red and Blue Banner recruiters take you onto a team, and a bookmaker takes bets.',
      'The ladder climbs ten tiers of opponents, with purses up to 10,000 gold for Grand Champion. A loss ends your run, and no potions are allowed on the sand. Online, players fight each other too.',
    ],
  }),
  page({
    id: 'oblivion-gate', group: 'challenges', title: 'Dagon\'s Breach', trigger: 'The first time you step through Dagon\'s Breach.',
    body: [
      'Online, Dagon\'s Breach - a burning door into the Deadlands - opens every two hours. A burning sky and a mark on the map warn you a quarter of an hour before; the gate stands open for ten minutes. Step through to fight what waits beyond, with everyone else who came.',
      'Every fighter\'s spoils are their own: gold, gear, a Deadlands Ember and perhaps a piece of Ruhn\'s Regalia. Break the ritual of Dagon\'s faithful before the gate opens for another Ember - and to free the Sigil Broker.',
    ],
  }),
  page({
    id: 'abyss', group: 'challenges', title: 'The Abyss Dungeon', trigger: 'The first time you enter the Abyss Dungeon.',
    body: [
      'Online, one Abyss Dungeon stands at a time, near a city in the busiest region - find it by its column of light, and by the talk in that city\'s taverns.',
      'At its end, the Rift leads into the Shattered Hour: a puzzle, a climb, and the Brass Remnant. You have one life there.',
    ],
  }),
  page({
    id: 'ocean-holes', group: 'challenges', title: 'Ocean Holes', trigger: 'The first time you dive into an Ocean Hole.',
    body: [
      'Black holes in the seafloor, under a purple mist. Swim down into one to find a flooded dungeon - and mind your breath.',
    ],
  }),

  // ── FAMILY & LEGACY ──────────────────────────────────────────
  page({
    id: 'legacy', group: 'legacy', title: 'Project Legacy', trigger: 'The first time your line passes on.',
    body: [
      'Your character has a family. Befriend someone until they are a Friend, court them in conversation, and marry at their town\'s temple. Children may follow.',
      'An Enduring family rises again after death; in a Bloodline family death is final and an heir takes up the name and its blessings. {LegacyFamily} opens the Family tab: your tree, your house and the Hall of Ancestors.',
    ],
  }),
  page({
    id: 'revenants', group: 'legacy', title: 'Revenants', trigger: 'The first time a revenant rises or kneels.',
    body: [
      'An elite or champion foe that kills you - or flees and gets away - may come back as a revenant: named, stronger, better armed, and remembering you.',
      'Beat it and it kneels. Then choose: kill it, or spare it.',
    ],
  }),
  page({
    id: 'companions', group: 'legacy', title: 'Companions', trigger: 'The first time a revenant kneels to you.',
    body: [
      'A revenant you spare swears to follow you. Up to six may be sworn, and three walk at your side; your ship\'s crew can come ashore too.',
      'Call them, send them away or release them on the menu\'s Holdings tab.',
    ],
  }),

  // ── PLAYING ONLINE ───────────────────────────────────────────
  page({
    id: 'online', group: 'online', title: 'Playing Online', trigger: 'The first time you play online.',
    body: [
      'Online, you share the world with other players: the same hour, the same weather and the same events. The world does not pause while your menu is open.',
      'Your first cave is your own - you meet others once you step outside.',
    ],
  }),
  page({
    id: 'chat', group: 'online', title: 'Chat', trigger: 'The first time you open chat.',
    body: [
      '{ActivateCursor} opens chat. Its tabs choose who hears you: World, Region and Local - and Party and Guild when you belong to one.',
      'Settings > Interface moves, sizes and hides the chat.',
    ],
  }),
  page({
    id: 'party', group: 'online', title: 'Other Players', trigger: 'The first time you reach out to another player.',
    body: [
      'Look at another player and press {SocialInteract}: add them as a friend, invite them to your party (four seats), trade or inspect them. With nobody in front of you, it opens your friends and party.',
      'A party can share bounties, and rest together if each member allows it.',
    ],
  }),
  page({
    id: 'player-trade', group: 'online', title: 'Trading with Players', trigger: 'The first time you trade with another player.',
    body: [
      'Both players lay out what they offer. Nothing changes hands until both accept the same offer.',
    ],
  }),
  page({
    id: 'duel', group: 'online', title: 'Duels', trigger: 'The first time you are challenged to a duel.',
    body: [
      'Challenge a player from their Inspect card. If both agree, the duel is refereed fairly and your real health is never touched - no one dies and no one is charged with a crime.',
    ],
  }),
  page({
    id: 'wild-zone', group: 'online', title: 'The Open Zone', trigger: 'The first time you enter the open zone.',
    body: [
      'The Wrothgarian Mountains are open to fighting between players. Monsters are stronger and loot is better.',
      'Die there and you drop what your bag and cart carry - and the player who killed you may take one item you wore.',
    ],
  }),
  page({
    id: 'player-guilds', group: 'online', title: 'Guilds of Players', trigger: MENU_ONLY,
    body: [
      'Players can found their own guilds, with a shared vault and a guild chat. A guild can hold a palace town as its Seat - and must defend it in sieges.',
    ],
  }),
  page({
    id: 'world-events', group: 'online', title: 'Raids and Caravans', trigger: MENU_ONLY,
    body: [
      'Each day a town somewhere in the Bay is raided; drive the raiders off to raise your standing. Caravans travel the roads - attack them, guard them or trade with them.',
    ],
  }),
]);

/** The welcome tour: the pages a new character reads first, in order, in one box. */
export const TUTORIAL_TOUR = Object.freeze(['welcome', 'movement', 'interacting', 'hud', 'menu', 'saving', 'first-steps']);
