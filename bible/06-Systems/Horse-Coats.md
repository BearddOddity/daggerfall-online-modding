# The horse's look (COATS1, 2026-10-11)

A player's ask: "can we take the current horse sprite thats used for
placement, riding and even the character riding the horse and give the
sprite different color types and colors. Like a variation of horse sprites".
Then: "What about also different patterns? The goal is for every person's
horse to be unique". Asked, they chose every horse **born unique and
re-dyable**, with **pinto, appaloosa, dapples, socks and roan**.

Every horse the port drew was the one bay horse. There are three sets of it:

- Daggerfall's riding sprite, `MRED00I0.CFA` (the player's own ARENA2 -
  `systems/riding.js`), the horse's head and neck under the first-person view;
- Horse Cart and Cargo's standing views and walk frames
  (`vendor/horse-cart-and-cargo/Textures`, `scenes/horseCartPool.js`) - the
  horse that stands, follows, waits and pulls the wagon;
- Eye Of The Beholder's five riders (`vendor/eye-of-the-beholder`, archives
  112382-112386), horse and rider in ONE picture - the third-person body in
  the saddle, and every other player's.

Not a DFU member: Daggerfall has one horse. Ledger A (COATS1).

## The law (`src/systems/horseCoats.js`)

A horse's LOOK is four things, and it is its own, so it rides the horse ITEM
(DFU's Transportation Horse, template 94):

| Field | List | Absent |
|---|---|---|
| `horseCoat` | **Bay**, Chestnut, Black, Grey, Dun, Buckskin, Palomino | the bay |
| `horsePattern` | **Solid**, Pinto, Appaloosa, Dapples, Roan | solid |
| `horseLegs` | **Plain**, Socks, Stockings | plain |
| `horseSeed` | 1..65535 - the horse itself | not yet born |

The SEED is what makes a horse its own: where its pinto patches, appaloosa
spots, dapples and roan flecks fall, the ragged top of its socks, and a shade
of its coat a touch off any other's (`shadeOf`: up to `SHADE_HUE`, 4 degrees,
and `SHADE_VALUE`, 7.5 % of its light, either way). Two horses of one coat,
pattern and legs are still two horses.

`systems/itemFields.js` declares the four; `systems/itemLaw.js` finds `horse`
on any other item that carries one. The look worn is the RIDDEN horse's, the
first horse in the pack (`riddenHorseLook`), as `inventorySession.js`
hasHorse finds it; a team of two wears it too. A save carries the fields as it
carries any item field, and a sold horse takes its look with it.

### Born unique

A horse with no seed is BORN (`birthHorses`): its coat, pattern and legs
rolled on `BIRTH_WEIGHTS` (coats 5 bay, 4 chestnut, 2 black, 2 grey, 1 each of
the rest; patterns 6 solid, 2 pinto, 1 appaloosa, 2 dapples, 1 roan; legs 5
plain, 3 socks, 2 stockings) and a seed of its own - in place, so the item keeps
its place and an open window's hold on it. Every way a horse comes - bought at
a Stable, found, a Test Room ride, carried in from an older save - is the same
horse without a seed, so the birth is not at any of them but where every horse
is next looked at: both exterior hosts' `hccTick` (`scenes/world.js`,
`scenes/exterior.js`), first thing each frame, and the Stable card before it
reads the horse (`ui/holdingsPages.js` stableProviderFor).

### Re-dyable

The owner may change the coat, the pattern and the legs on the Stable card
(`restyleRiddenHorse`), free and any time - the wagon's paint's law
(`06-Systems/Wagons.md` WAGONS2), for the horse. Never the seed: the markings
stay where they fell.

## The dye (`recolorHorse`)

A look is not new art. It is the same pictures dyed as they upload, so nothing
derived from the player's data is written anywhere but the renderer
(Port-Doctrine: A RENDER OF GAME DATA IS GAME DATA), and a set the port gains
later takes every look for free. Code 0 - the bay, solid, plain, no seed - is
no pass at all.

The art is a bay - a warm brown hide, a black mane, tail and hooves, a brown
leather saddle, and on Eye Of The Beholder's sets a rider of any colour
astride. The dye moves the HIDE alone:

1. a hide pixel is warm (hue 345-50 degrees) with colour in it (saturation
   0.2 or more): the mane, the tail, the hooves, steel and cloth are not;
2. but not the TACK: the saddle's and the bridle's leather are yellower,
   duller and darker than the flank (hue 28-48, saturation 0.36-0.58, value
   0.24-0.5 - measured off `horse3.png`'s saddle against its flank);
3. and only where the warm pixels are the HORSE's. A rider's face, hands and
   leathers are warm too, so the warm pixels are gathered into 8-connected
   regions and a region is dyed when it is at least `COAT_REGION_SHARE` (3 %)
   of the largest - the body; a leg the shading cut off it is still a few
   percent, a face is under one - or when it is a scrap of shadow beside one
   (mean value under `COAT_SHADOW_VALUE`, 0.3, within `COAT_SHADOW_REACH`, 2
   pixels, of a dyed region): the belly's and the far legs' dark specks the
   outline cut off. Measured on all five riders, a rider's skin is lit (a mean
   value of 0.4 and more).

A dyed pixel takes the coat's hue (the bay keeps the art's own), a saturation
off its own (so the art's shading is still its shading) and a value
`lift + scale * v` (`COAT_DYES`), times the seed's shade. Then:

- the PATTERN lays its marks (`markingAt`), placed in the hide's own frame -
  from its left, down from its top, in `PATTERN_SCALE_PX` (100 pixels, the side
  view's width, or the hide's width if wider) so a spot is one size from every
  side though a front view is a third as wide:
  - **Pinto** (tobiano): three octaves of the seed's value noise over a
    domain the noise itself pushes about (`warp`), white past a threshold the
    seed moves - broad patches with wandering, ragged edges;
  - **Appaloosa**: a jittered lattice of spots over a warped domain, each spot
    measured in its own stretched and turned frame (`nearest2`) with a ragged
    edge - an oval blot of its own size and bearing, never a circle; half the
    seeds are leopards (white, the coat in spots), half snowflakes (the coat,
    white in spots);
  - **Dapples**: soft lighter blots on the same warped, stretched lattice, the
    coat a shade darker between them and the whole fading in and out across
    the hide - no ring and no line is drawn (a first cut drew the cells' edges
    darker and read as cracks; another drew rings and read as circles, both
    turned back by the player);
  - **Roan**: white hairs - a quarter to a half of the hide's pixels, thicker in
    patches, by the seed's hash of each - mixed in, never a pure white pixel;
- the LEGS whiten the hide from the hooves up - socks a tenth of its height,
  stockings a fifth, the top ragged by the seed. `bottomFirst` says which end
  of the rows is the hooves (the world's billboards hold the picture's bottom
  row first, `formats/color32Order.js`); `legs: false` lays none where no hoof
  is drawn (the riding sprite's lower edge is the neck); `tack: false` spares no
  leather where no saddle is drawn (the riding sprite's neck: its shadow along
  the mane falls in the leather band's colours).

Every white is the hide's own light in white (`0.4 + 0.85 v`), so a patch in
shadow is a shadowed white. The mane stays the art's on every look: the dye
cannot tell a dark mane from a rider's dark steel, so it is not asked to.

A sprite is one picture a side, so a flank's patches and the chest's are not
one body's - each view is its own, and a walk frame carries its marks with the
body (the frame is the hide's, not the picture's). A mirrored view is the
other flank.

## Where it is worn

- **The riding sprite** (`systems/riding.js` loadRidingArt, `player/mountRig.js`):
  the horse's four frames dyed under `ride:<file>:<frame>~<code>`, loaded
  again when a look is chosen in the saddle - asked once a mount and look, so
  a failed load is not asked every frame; a load overtaken by a newer one is
  never drawn, and a look left behind is let go. The CART's sprite
  (`MRED01I0.CFA`) is never dyed (`ridingLook`): its boards are the hide's
  brown. Seen on the freeware ARENA2's `MRED00I0.CFA` (all four frames,
  rendered through the port's own CfaFile, palette and dye - locally, never
  committed); pinned on drawn pictures, the riding sprite being the player's
  own data, which the tree does not carry.
- **The pool's horses** (`scenes/horseCartPool.js`): the bay's decoded views
  and walk frames are kept, and each look's are dyed off them once
  (`horseArt.ensureLook`) under `h<view>~<code>` and `w<view>#<frame>~<code>`,
  one set a frame (`_dyeBudget` - the walk set is some 20 ms of CPU, and a road
  can show six looks at once); an owner's team is posed in its owner's look
  (`lookOfOwner`) - the bay's until the look's are up. Past `HORSE_LOOKS_KEPT`
  (16) looks, the one longest undrawn is let go (`trimLooks`). Both hosts hand
  the pool the look through the one seam, `world/wagonModels.js` wagonPoolDeps.
- **Eye Of The Beholder's rider** (`player/eotbSprite.js` spriteFor,
  `lookedPixels`): a mounted table's sprite in a look is its own record
  (`<record>-<frame>~<code>`), dyed before the mirror. The body reads the look
  off the weapon rig's record (`combat/weaponRig.js` eotbState `horseLook`,
  shared by all four hosts), fetches its mounted tables whole when it
  changes, as a set chosen is, and lets the last look's pictures go. Another
  player's rider is dyed by their pose's `rc` (`net/peerRiders.js`); past
  `RIDER_LOOKS_KEPT` (12) riders' looks, the one longest undrawn is let go.
- **The town watch's throw** (`scenes/wagonWardenShow.js`): the carried team
  in its owner's look, off the pool's `teamSnapshot`.
- **The road's strangers** (`world/roadTeams.js`): a horse nobody owns wears
  `strangerHorseLook(key)` - born by `BIRTH_WEIGHTS` on its trip's key, on one of
  `STRANGER_SEEDS` (16) seeds, so the road shares a few dyed sets between many
  horses and every client sees the same horse in the same look.

The merchant yards' horses for sale stay bays: a horse bought is born when it
reaches its owner, so a yard horse drawn in a look would sell a horse it is
not.

## The wire

A look is one number, `horseLookCode` - `coat + 7 (pattern + 5 (legs + 3
seed))`, at most `HORSE_LOOK_CODE_MAX` (6,881,279); 0 the bay as drawn.

- **The pool's word** (`systems/horseCartWire.js`, the foes frame's `hv`): `hc`,
  the look, at the record's top beside `n`, for the standing horse and the
  team in the shafts alike; absent for the bay. A look past the law's is a bay,
  never a dropped word. The relay forwards it unread.
- **The parked word** (`net/wire.js` validParkData): the cell keeps `hc` (1 to
  `HORSE_LOOK_MAX`), so a team whose owner is away still wears it.
- **The pose** (`net/wire.js` rideOf): `rc`, the look under a mounted player,
  omitted on foot and for the bay - every pose before it keeps the bytes it
  had. A look past the law's is a bay, never clamped: a code is a horse, and the
  highest is no nearer one than another. A look chosen in the saddle goes out
  at once (`poseChanged`).

The last two are relay law: RELAY_VERSION `world195` (world194 on its branch, renumbered past SLIM-FRAME's world194 at the merge of main). An older client draws
every horse a bay.

## The 3D horse (COATS3D, 2026-10-11)

The owner, sending a rigged horse - walk.fbx, idle.fbx, idle-1.fbx, gallop.fbx, trot.fbx - and two pictures: "The
first image is for the horse itself and the second is for the tail. These are to be applied to horses for people
using morrowind with the character properly rigged when riding. These also need to recieve the same texture treatment
we gave the sprites with parity between each". Asked, every horse of the Morrowind lane - the ridden one, other
riders', the standing and following horses and the wagon teams - with third person unlocked in the saddle and first
person on the 3D horse.

Not a DFU member: Daggerfall's horse is a sprite. Ledger A (COATS3D).

### The bake (`tools/bakeHorse.mjs`)

The five files are one rig, the Courser, saved five times: the same two meshes and 33 skin clusters, each a different
slice of eight animation stacks; idle.fbx carries all eight (idle-1.fbx is the same bytes), so it is the one committed,
`src/assets/horse/source/courser.fbx`, beside the two pictures (`body.png`, `hair.png`). `node tools/bakeHorse.mjs`
makes `src/assets/horse/courser.json` out of it, byte for byte the committed one (pinned):

- the armature's own frame - Z up, +Y forward, metres, Morrowind's basis - the FBX's Y-up centimetre wrapper taken off;
- the 33 bones parent first, each with the clusters' bind and inverse bind (the two agree to 5e-7);
- the body (1,185 vertices, 1,888 triangles) and the mane and tail's nine alpha cards (120, 90), triangulated as
  Blender draws them, welded, four influences a vertex - NORMALISED: the body's were exported summing to anything
  from 0.07 to 2.0, which Blender divides out, so the bake does;
- the four gaits - idle (8 s, at 15 frames a second), walk (1.33 s), trot (0.87 s) and gallop (0.53 s), at the file's
  30 - each bone's rotation a frame and its translation where the gait moves it, and each gait's SPEED, the ground it
  covers a second: walk 0.668 and trot 1.932 m/s off their RootMotion twins, the gallop 10.31 m/s off its planted
  hooves - Daggerfall's own ride (about 10.8 m/s at Speed 50) is a gallop at its own rate.

EACH FLANK ITS OWN TEXELS. The unwrap is mirrored: the barrel's and the head's islands lay the left half over the
right, so a texel is painted on both flanks at once - a pinto's patches came out the same on both sides, a mirror
horse. The painting carries each island's mirror image beside it, unused (measured: a texel and its reflection a mean
6.6 and 3.7 levels apart), so the bake moves each left triangle onto it, its corners' u reflected about the island's
midline edge (u 0.419 and 0.620). The bay draws as it did.

### The horse (`world/horseModel.js`, `world/horseRig.js`)

One stream a renderer, uploaded once as the character pass's GPU skin reads it (`formats/mwGpuSkin.js`'s corner, one
influence pair, the post the identity), and every horse a view of it with its own palette (`renderer.js`
createSkinPalette - a picture in a sprite batch is drawn at the flush, so each horse keeps the pose it was queued
in). Each frame a horse's GAIT is stepped (`stepHorseGait`): idle, walk from 0.2 m/s, trot from 1.3, gallop from 5,
a gait held 15 % past its edge; it plays at the rate its stride covers the ground (`gaitRate`, clamped - past it the
hooves slide rather than the legs blur), a new gait comes in at the old one's phase and fades in over a quarter
second. The rig has no canter, so between a quick trot and Daggerfall's ride the gallop plays slow.

A horse alone is drawn as the Morrowind body is - a picture through the sprite pass at the arm's dial
(`characterSprite.js` drawRigSpriteBox, MW_ARM_PIXEL). A horse under a rider is in the RIDER's picture: `also`, more
meshes in the one picture under one depth (`renderer.js` _renderCharacterSprite and the batch's tiles; each its own
quad would cut the horse's neck by the rider's plane), the window the union of the two boxes (`fpArm.js` unionBox),
the anchor the horse's middle.

### The look on the 3D horse

The same law as the sprites', through the one dye (`dyeInto`): a solid coat's texel is exactly the colour a sprite's
pixel of that colour takes (pinned, every coat, every shade). What differs is where the markings fall, because the
3D horse's hide is a surface: `horseTexelMap` lays the body's triangles out on its picture by their UVs and gives each
texel its place on the horse, and `texelPlanes` lays each texel in the frame of the side it FACES - its flank as the
side view lays it, its back and belly from above and below, its chest, face and rump from the front and behind - each
of the six faces its own place on the pattern, a texel facing between two taking both by |n|^4, so the back's patches
hand over to a flank's with no seam. One unit is the hide's length nose to rump, the sprites' measure (the side view's
width). The pinto's field is blended before it is cut, so its edges stay crisp.

- The horn below the hooves' CROWN keeps the art's: the crown read off the skeleton, halfway between each hoof bone's
  joint and the fetlock's (8.75 cm - the painting's own step).
- The legs' white climbs from the crown by the sprites' LEG_BANDS share of the hide's height: socks to the fetlock
  and over, stockings to under the knee.
- WHITE_FLOOR_3D: the 3D horse is lit by the world, and its painting's darkest hide is pigment - the bay's black points
  are painted at a value of 0.1-0.22 - so a white laid by the art's own light came out mid grey. Its light is floored
  at 0.4; a sprite's white stays its art's light (a sprite is lit by its painting alone).
- The mane and tail's cards keep their picture, as the sprites keep the mane.

A look's picture is dyed DYE_ROWS (32) rows a frame (`dyeHorseTexelRows` - a whole picture is 50-120 ms) and uploaded
with its mips once whole; a horse wears the bay's until its look is up; past HORSE_LOOKS_KEPT (12) the one longest
undrawn is let go. The appaloosa's spots were made rounder for both sets at this slice (stretched up to 1.45 a side,
not 1.9): at the 3D horse's detail the old ovals read as brush strokes.

### Astride (`player/seatPose.js` saddleRigInput)

Morrowind has no riding animation, so the saddle is posed as CARDS2b's chair is: a world request the climb rig solves
on the skeleton's own bones (`combat/climbRig.js`) - the hips on the horse's SEAT (`horseRig.js` HORSE_SEAT, 1.68 m
over the ground, 0.1 m forward, carried by the Spine bone so the rider rises and falls with the back's stride), each
foot in a stirrup 0.32 m out (the horse's width - its barrel is 0.30 either side) and 0.8 m under the hips (the
rider's leg) with the knee forward and out round the barrel, each hand on the reins over the withers, the spine
leaning into the gallop. Solved on retail's biped the hands and feet land to the millimetre. The body plays no stride
under it (`seatedCamera`), and its cloak hangs behind the saddle as behind a chair.

### Where it is ridden

- **The player's own** (`player/mwView.js`): the hosts hand the view `horse` - the ridden horse's look, on a horse and
  never the cart - and it keeps the player's horse, stepped at the ground the body covers, under the body's feet with
  its seat over them, its seat handed to the body as `saddle` (the hosts' camera()). RIDE-POV holds the head only off
  a 3D horse (the cart's seat, a rig not up yet): astride one, the wheel and the toggle take the view out as on foot,
  and the third-person camera turns about the rider's head. In first person the horse is drawn where Daggerfall's
  riding sprite was (`player/mountRig.js` - after the world, under the hands), taken with the world's own camera
  from the eye on its back; the sprite stands down.
- **Other riders** (`net/peerBodies.js`): a peer on a horse whose Morrowind body stands here sits a 3D horse of its
  own, in the look their pose names (`rc`), stepped at the body's pace; the rider layer yields them
  (`net/peerRiders.js` sync's `yields`, `scenes/world.js` peerRidesIn3d) - a beast stays the layer's.
- **The pool's horses** (`scenes/horseCartPool.js`): on the Morrowind lane (`mwView.js` mwViewHorseRig, handed to the
  pool through `world/wagonModels.js` wagonPoolDeps) every horse the pool stands - alone, following, parked in harness,
  pulling - is a 3D horse in its owner's look, drawn in the body pass (draw3d) in place of its billboard.
- **The road's teams** (`world/roadTeams.js`): likewise, each stranger's horse in its own look.

FLAGGED: the town watch's carried team (`scenes/wagonWardenShow.js`) is still the billboards' - a throw of a few
seconds, its own batches.

`tools/horse3dProbe.mjs` draws the horse through the real renderer in a page - its looks, both flanks, every gait.

## The Stable card

`ui/holdingsPages.js`: the horse's card says its look in words ("Dapple grey
with socks"), then a row each for its coat, its pattern and its legs, a button
a choice, the one worn pressed (`choiceRow`, the paint row's own, shared).
Pressing one restyles the ridden horse in the pack and tells the host, as a
paint does - Horse Cart and Cargo on or off.

Pinned: `test/coats1_horsecoats.test.js`; COATS3D, `test/coats3d_horse3d.test.js`.
