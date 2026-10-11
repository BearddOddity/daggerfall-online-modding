# PERF-ARENA + PERF-ARENA2 + PERF-ALLOC1/2 — the exterior's frame in the real game (2026-10-10)

*The owner: "Exterior performance is really bad" - "Interior is fine. It's exterior that's the issue" - "If you need
to, pull the freeware online and do it yourself".*

Every slice below leaves the picture as it was: the same triangles in the same order from the same floats, or the same
matrix to the bit. None touches the Enhanced Lighting lane's look, the static shadow cache's law or the air pass's.

## How it was measured

The real game at Knightstale (Wayrest), on the freeware ARENA2 (DFU's `DaggerfallGameFiles.zip`, `tools/fetch-data.sh`),
through `tools/frameProbe.mjs` (`knight` 15:00 and `night` 22:00, 40 frames a window, `INSTR=shadow`) on the merged head
of PERF-CROWD. Milliseconds of this container's CPU a frame, by sample count - relative only. SwiftShader stands the
streaming town at about 0.3 frames a second, so anything on a timer (the music's pump, the HUD's sweep), anything with
a time budget (the snow's blanket build, the stream's slices) and anything with a stall watchdog (the notice panel's
3 s DRAW_STALL_MS rebuilt it every frame) reads as a frame's cost here and is not one at a player's rate - they were
read and set aside.

| | 15:00 | 22:00 |
|---|---|---|
| the world host's frame (its JavaScript) | 22.5 | 25.7 |
| - the shadow pass (`beginFrame` -> `shadowPass.render`) | 5.4 | 5.2 |
| - the billboards (`drawBillboards`) | 2.9 | 2.8 |
| - the pixel walk (`framePixelWalk`) | 1.8 | 1.5 |
| - the air pass's resolve | 1.1 | 1.1 |
| WebGL calls / draws a frame | 5,997 / 1,083 | 6,986 / 1,124 |
| `bindVertexArray` a frame | 942 | 905 |
| WebGL calls' own time a frame (the top sixty) | 3.3 | - |
| allocated a frame (collected objects included) | 1.07 MB | 1.38 MB |

The costliest WebGL call the frame made was `bindVertexArray`: 1.48 us each on the main thread, 1.4 ms a frame by day -
more than the 992 `drawElements` it served (0.36 ms). Nearly one a draw, because every billboard batch was born with a
vertex array of its own.

## Measured after (the real game, the same probe)

Knightstale by night (`frameProbe.mjs night`, 40 frames a window, `INSTR=shadow`), the base the PERF-CROWD head above and
the after this branch's head with PERF-ARENA, its hardening, PERF-ALLOC1 and PERF-ALLOC2 (and main's #749 and #746
merged in between - their own code is in the after's totals). Milliseconds of this container's CPU a frame, by sample
count.

| | before | after |
|---|---|---|
| `bindVertexArray` a frame | 905 | 508 (-44%) |
| WebGL calls a frame (draws: 952 both) | 6,986 | 6,587 |
| `bindVertexArray`'s own time | 1.13 | 0.46 |
| the world host's frame (its JavaScript) | 25.7 | 22.1 |
| - the shadow pass (`shadowPass.render`) | 5.2 | 4.0 |
| - the billboards (`drawBillboards`; `drawOne` 1.69 -> 1.14) | 2.8 | 2.4 |
| allocated a frame | 1.42 MB | 1.17 MB |
| - `lookAt` (the lanterns' faces) | 47 KB | 0 |
| - `_candidateQuads` | 153 KB | 45 KB |

The boot was the same (443 s and 439 s to ready). The base's window also held a major collection (62 ms a frame of
garbage collection against the after's 2.7) - the major collections come with the old space's growth, which the
allocation feeds but does not decide alone, so that gap is not claimed for this branch. The 508 binds left are the
meshes' (every model archetype its own vertex array) and the terrain's (a pixel's own): a mesh arena would be the next
lever, its own slice.

## PERF-ARENA — the still flats share their buffers

`render/renderer.js` createBillboardBatch: a batch built STILL (every town flat, every wood, every lamp; not a gib or a
blood drop, which move every frame and keep buffers of their own) takes a range of an ARENA's quads - one VAO, one vertex
buffer and one index buffer for up to BB_ARENA_QUADS (16,384) quads - and its corners are written where its range
starts (`bufferSubData`). The arena's indices are written once, at its birth: every quad's six, the very six
createBillboardBatch writes for its own (b, b+2, b+1, b, b+3, b+2 from the quad's first corner). A batch's draw names its
range by the index offset (`_ibOff`) - the main pass (`drawOne`), the shadow replay and the air pass's emitters, the
three sites that draw a batch. So the same triangles, in the same order, from the same vertices; and the main pass's
flats bind one VAO where each bound its own.

- `arenaTake` / `arenaGive` keep an arena's free ranges, ascending and never touching (first fit; a range given back
  joins its neighbours). A batch bigger than an arena gets an arena its size; a full arena spills into a new one.
- A batch freed (`destroyBatch`, `destroyBillboardBatch`) gives its range back ONCE and lets its VAO (the arena's) go: a
  second free gives nothing, and every replay already skips a batch with no VAO (EL2's `_dead` law), so no shadow record
  from the last frame reaches a range a later batch takes.
- `moveBillboardBatch` on a still batch (a felled tree, PROF4) rewrites its range in place.
- An arena emptied whole is deleted, all but the first: a long road through dense woods holds no more GPU memory than
  the woods it stands in now.
- The batch is born with its three new fields (`_arena`, `_q0`, `_ibOff`), in `contract.js` - one shape (PERF-EXT10).
- STRAY ARRAY STATE (the arena's own audit): one array for many batches makes two old hazards wide. A flat whose VAO
  the shadow says is bound skips the bind - with a VAO a batch, a stale shadow could only fool the same batch drawn
  twice; with an arena, any flat after a foreign pass that bound its own array behind the shadow's back would draw from
  it. So `drawBillboards` forgets the shadow on entry (one bind a call; the air pass's emitters already did, and the
  shadow pass runs after beginFrame's own reset). And an element buffer bound is the BOUND array's state: the snow's
  shared blanket (`render/snowfallSurface.js` _sharedBlanket) bound its index buffer, and then none, onto whatever array
  the last pass left bound - with an arena that is every still flat's indices cut away. It binds no array first now,
  through the renderer. Every other element-buffer bind in src/ binds an array of its own first (audited, 27 sites).

Pins: `test/perfarena.test.js` (5) - the allocator over 6,000 random takes and gives; THE PICTURE: a GL that keeps what is
written into its buffers resolves every triangle a draw rasterises (each corner's five floats, at the draw's uOrigin and
uSize), and a town of forty batches (woods, single flats, three records and a lamp, scaled flats, five pixels) drawn
through the main pass, the air pass's emitters and the shadow replay resolves to the base's triangles draw for draw,
with ONE VAO bound for the main pass's forty draws (the base: forty); a batch's life (freed once, the range reused, a
move, a gib's own buffers, a batch bigger than an arena); the spill and the let-go; the stray array state, both halves.
Mutants: `tools/mutants/perfarena.json` (15, all dead). Pins moved: `test/hard3_types.test.js` (58 fields), `test/la_cost.test.js`
(a two-flat call 107 -> 30 GL calls, one VAO bind fewer), `test/blood1_decals.test.js` (the move's write), and three
harnesses that named a draw by its VAO alone and now name it by VAO and offset (`test/perfexta.test.js`,
`test/perfextb.test.js`, `test/lpt1_lowpolytrees.test.js`).

## PERF-ARENA2 — the arenas grown, and a record's batches together (2026-10-11)

After PERF-ARENA the main pass still bound a VAO on most of its flats. Read back from the real game through
`window.__renderer` (Knightstale by night, once ready): the stream stood **619,833 quads in 38 arenas** of
BB_ARENA_QUADS (16,384) each, every one full. The pass draws its flats sorted by texture key (`billboardKey.js`
sortByKey - one key's batches in a run, in the order they came, LA-COST2's exact order), and one key's batches lay
scattered over the 38: the pass hopped between arenas on nearly every draw.

- EACH ARENA TWICE THE LAST, to BB_ARENA_MAX_QUADS (262,144 quads: 21 MB of corners, 6 MB of indices) - a town that
  size stands in six arenas, an interior's few hundred flats in the first.
- A RECORD'S BATCHES TOGETHER: `_bbArenaFor` takes the batch's key (`${archive}_${record}`, the run the main pass
  sorts it into) and tries the arena that key's last batch went to first, then the first fit anywhere, then a new
  arena - so a run stays in one arena and the pass binds where the key changes anyway. A deleted arena takes its keys'
  homes with it.

The draws are the same draws in the same order; only where a batch's corners live moved. Pins: `test/perfarena.test.js`
(the spill test's growth and the record's home; the growth's bound, its sixth); mutants PERFARENA2-no-growth,
PERFARENA2-unbounded, PERFARENA2-no-home (dead), PERFARENA-no-spill re-aimed by content.

## PERF-ALLOC1 — the lanterns' face matrices made in place

`render/shadowPass.js` pointFaceMatrices runs for every lantern every frame, and made a projection, six lookAt views and
their twenty-four arrays each time: lookAt alone was 47 KB of the 1.4 MB the night frame allocated. It writes into two
scratches now through `lookAtInto` and `perspectiveInto` - twins of `world/mat4.js` lookAt and perspective that write
into a given array, with mat4.js's arithmetic in its order, so its floats. They live in shadowPass.js and NOT in
mat4.js: mat4.js is in the relay's bundle (`test/relayversion.test.js` RELAY_GRAPH), and a byte of it changed is a
relay deploy that drops every player - the first cut put the twins there and SLAM8 caught it; mat4.js is main's, byte
for byte.

Pins: `test/perfalloc1.test.js` (2 of its 3) - every face of 4,000 random lights against the base's formulas, element
for element (`Object.is`), and lookAt and perspective likewise; twelve lanterns' faces make no typed array. Mutants:
`tools/mutants/perfalloc1.json` (6 of its 8: 5 dead, 1 recorded equivalent - the translation's three-term sum
reordered, which float32 rounding cannot tell from the base's).

## PERF-ALLOC2 — the lantern walk's cube through a typed array

`_candidateQuads` (shadowPass.js) asks `placementsInCube` once a placed batch a lantern a frame, and handed it five
doubles each time - 153 KB of the 1.4 MB the night frame allocated, because a double handed to a call V8 does not
inline is a heap number. It writes the cube into its own Float64Array now and asks `placementsInCubeOf` (bounds.js),
which reads the same doubles back exactly; `placementsInCube` is that with a scratch, for its other callers. Pins:
`test/perfalloc1.test.js` (its third) - the cube test against a brute-force oracle over random woods and cubes, through
both doors, and the walk's call by its source. Mutants: `tools/mutants/perfalloc1.json` (its last 2, dead); three older
records re-aimed by content onto the moved expression (AUDIT637-B2b, PERF-SHADOW1-d, PERF-SHADOW1-f).

## Measured, and left

- **The shadow pass** is the frame's largest part (5.2-5.4 ms): by day the sun's three cascades replay ~200 draws a
  frame; by night twelve lanterns redraw their dynamic faces (~72 face replays, ~208 draws). PERF-FACE already redraws
  only the faces a mover is in; the rest is FLICKER-FIX's trade (Performance-Next.md "For Mac").
- **The snow** (winter, which is where the game starts): the near pixels sorted every frame for the blanket's ring,
  with a stamp string a pixel; small, and its own slice.
- **The meshes' vertex arrays**: 508 binds a frame remain, the models' and the terrain's - a mesh arena (indices offset
  by their base corner at upload; WebGL2 draws no base vertex) is the next lever.
- **The online crowd** (`tools/onlineFrameProbe.mjs`, PEERS=0,20,60, the same head): online with no one there the
  world host's frame was 24.3 ms (the HUD 1.7, the motor 1.3, `onlineFrame` 1.0 of it); at 20 peers the allocation rose
  1.79 -> 4.40 MB a frame and the frame 24.3 -> 34.0. READ AT THE PROBE'S RATE (0.27 frames a second, 3.7 s a frame)
  nearly all of the growth is work on the real clock, not the frame's: the poses arriving (`_receive`/`_arrive`/
  `_arriveTimed`, `validPose`, `cadenceOf`'s sort, `poseAlong` - ~0.5 MB and ~13 ms a second at 20), the footsteps'
  Web Audio nodes (`peerSound`), the HUD's 250 ms layout sweep (`readLayout` -> `getPref` -> the online lane's page
  door), and the play-out walking 3.7 s of path a frame (`_play`). What scales with frames x peers was the peers'
  billboards (keys, the main pass, the shadow record): ~1.5 ms at 20 on this container. The 60-peer window drew 13 of
  its 60 bots (the relay's fan on this machine) and is not a measure. `wire.js` (`validPose`, `isCellRoom`) is in the
  relay's bundle - any slice there is a relay deploy.
- **The page doors**: `isEnhanced`/`uiSkin`/`skinOverride` read `location.search` on every call - ~0.5 ms a frame of
  this container's (0.2 on a desktop). PERF-URL already parses once a search; ending the read itself overturns its "not
  a latch" rule (Performance-Next.md item 4, for Mac) and is left.
