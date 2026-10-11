// @ts-check
// SHIPYARDS (2026-10-11): A PORT TOWN'S SHIPYARD AND LIGHTHOUSE, WHERE THEY STAND - the exterior host's pool on the
// yards' shape (scenes/merchantYardsHost.js): each place's timber and stone drawn in the host's world pass and standing
// in its collider, its people on the flats' axis, the eye's boxes and their names, the press - the shipmaster's window
// and the climb - and the lighthouse's lamp: a scene light in the lanterns' hours, and its glow and its sweeping beams as
// added light (render/navalRender.js's particles, the sea fight's own pass).
//
// WHERE: the host says (`sites`: each port place of every town built, its middle in the scene's x, z - world/portSites.js
// placed it, carried by the host's own frame - its turn, its name, its keepers), and the ground there is the host's
// (`groundAt`), read when a place moves (a floating-origin recentre, across or up) and every PORT_GROUND_EVERY frames.
// A place's collider bucket - its model, its people's boxes, the lighthouse's guard over its railing - is stood again when
// it moves, and held back while the player's feet stand on its ground at its foot as it first rises (AUDIT SET W1's law,
// the yards'): never for feet up on the lighthouse's gallery, which it must stand under.
//
// WHO STANDS IN IT: in the shipyard, the SHIPMASTER on his office's porch (his keeper's draw - systems/portPlaces.js
// portKeeper), the CREWMASTER behind the crew hall's table, three SAILORS looking for a berth at its open side and two
// SHIPWRIGHTS at the hull - one up on the scaffold; at the lighthouse, the LIGHTKEEPER by the tower's door. Each a person
// of the town's own race (the walkers' law, characters/mobilePerson.js walkerRace - the host hands it) in its idle
// record, one of the race's four outfits, the sailors' and the shipwrights' drawn off the place's key - every client
// stands the same people - and each offered its Morrowind body (AUDIT MW-NPC II's law for the yards' keepers).
//
// THE PRESS (the plaque's rows; a press with no row lit takes the first):
//  - the shipmaster, his SHIPS board, the hull on the stocks: Ships for sale, Your fleet, Shipwright, Refits - the
//    shipmaster's window on that page (the host's `open`);
//  - the crewmaster, the hall's CREW board, its notice board, a sailor: Sign on hands - the window's Crew Hall;
//  - the lightkeeper and the tower's door: Climb the tower - the keeper lets you up, and the host stands you on the
//    gallery (`climb`); the hatch on the gallery: Climb down;
//  - a shipwright: Info names him at his work; Steal takes nothing anywhere ("never takes an eye off his yard").
//
// THE LIGHT (`lights`, `glows`): in the lanterns' hours (the host's `lit`) the lamp is a scene light, and its glow and two
// beams turning BEAM_PERIOD_S a round are drawn as added light from as far as BEAM_SEEN_M - a light a captain sees from the
// sea - each lighthouse's beams on its own phase (off its key).
//
// NOTHING HERE IS SAVED OR SENT: where a place stands is the town's layout, who keeps it its map id.
//
// THE FOUR HOSTS (bible/Home.md): scenes/world.js - WIRED (each port town's build places them; the pool is made beside
// the yards', framed, drawn - in the street and in the view out of a window - its people on the flats' axis and in
// bodies, its lamp in the lights and its beams in the added pass, taken down at a re-anchor and a load; the Overworld's
// marks, the town map and the talk directory are handed its sites). scenes/worldModes.js - WIRED for the press both
// exterior hosts share (`portTargets` in the street's one ray, the `port:` arm with the too-far refusal and the
// plaque's lit row); its interiors stand no port. scenes/dungeonContext.js - stands no street: nothing here reaches it.
// scenes/exterior.js - FLAGGED: the single-town bench stands no port; the streaming host is where its towns are played.
//
// Not a DFU member. Ledger A (SHIPYARDS).
import { PORT_PLACES } from '../systems/portPlaces.js';
import { SHIPYARD_TEXT } from '../systems/shipyards.js';
import { PORT_FOOT } from '../world/portSites.js';
import { buildShipyardModel, SHIPYARD, shipsSignBox, hullBox, noticesBox, crewSignBox } from '../world/shipyardModel.js';
import { buildLighthouseModel, guardBand, LIGHTHOUSE_POINTS, doorBox, hatchBox, lanternBox, GALLERY_Y } from '../world/lighthouseModel.js';
import { portArt, PORT_ARCHIVE } from '../world/portArt.js';
import { PERSON_TEXTURES, PERSON_IDLE_RECORD, PERSON_IDLE_FPS } from '../characters/mobilePerson.js';
import { mobileBillboardSize } from '../world/rmbFlats.js';
import { folkLookOf } from '../characters/folkBodies.js';
import { personActor } from '../characters/peopleBodies.js';
import { GENDERS } from '../characters/nameHelper.js';
import { textSeed } from '../systems/livingWorld/seed.js';
import { RAY_DISTANCE, STATIC_NPC_ACTIVATION_DISTANCE, presentNpcInfoText } from '../player/activate.js';
import { trs } from '../world/mat4.js';
import { yardToScene, yardBoxToScene, KEEPER_HALF, KEEPER_HEIGHT } from './merchantYardsHost.js';
import { boxTriangles } from './horseCartPool.js';
import { localAabb, transformedAabb } from '../render/frustum.js';
import { DECOR_DRAW, DECOR_SHADOW, DECOR_SKIP, castOnly } from './decorRoom.js';

/** The ground under a place is read again every this many frames. */
export const PORT_GROUND_EVERY = 30;
/** The press reaches the port's people and boards as it reaches a static NPC (StaticNPCActivationDistance, 6.4). */
export const PORT_REACH = STATIC_NPC_ACTIVATION_DISTANCE;
/** How far over each place's ground its Overworld mark stands - over the sheerlegs' head, over the lantern's vane. */
export const PORT_MARK_LIFT = Object.freeze({ shipyard: 8.5, lighthouse: 24.5 });
/** A place's collider held back while the feet stand on its ground below this height over it (m): the shipyard's scaffold
 *  and the lighthouse's foot - never its gallery, which must stand under them. */
export const HOLD_BACK_UP = Object.freeze({ shipyard: 4.5, lighthouse: 2.5 });
/** The lamp: its scene light's reach (m), and the office lantern's. */
export const LAMP_RANGE = 28;
export const OFFICE_LAMP_RANGE = 9;
/** THE BEAMS: a round every BEAM_PERIOD_S, each beam BEAM_LEN_M long in BEAM_PUFFS added puffs (laid closer near the lamp -
 *  quadratically - so they run together), growing from BEAM_SIZE0 to BEAM_SIZE1 across and fading from BEAM_ALPHA; drawn
 *  while the eye is within BEAM_SEEN_M of the lamp. The lamp's own glow: GLOW_NEAR_M across, never under GLOW_ANGLE of its
 *  distance (a few pixels at any range - shipWatch.js lampSize's law). */
export const BEAM_PERIOD_S = 14;
export const BEAM_LEN_M = 150;
export const BEAM_PUFFS = 18;
export const BEAM_SIZE0 = 1.6;
export const BEAM_SIZE1 = 28;
export const BEAM_ALPHA = 0.42;
export const BEAM_DIP = 0.035;
export const BEAM_SEEN_M = 2600;
export const GLOW_NEAR_M = 4;
export const GLOW_ANGLE = 0.012;
/** The lamp's light, in added light and in the scene's. */
export const LIGHTHOUSE_LAMP_COLOR = Object.freeze([1, 0.85, 0.55]);

/** The plaque's rows: the shipmaster's four pages, the crewmaster's one, the climb up and down. */
export const SHIPYARD_ROWS = Object.freeze([
  Object.freeze({ id: 'ships', label: 'Ships for sale' }),
  Object.freeze({ id: 'fleet', label: 'Your fleet' }),
  Object.freeze({ id: 'yard', label: 'Shipwright' }),
  Object.freeze({ id: 'refits', label: 'Refits' }),
]);
export const CREW_ROWS = Object.freeze([Object.freeze({ id: 'crew', label: 'Sign on hands' })]);
export const CLIMB_ROWS = Object.freeze([Object.freeze({ id: 'climb', label: 'Climb the tower' })]);
export const DOWN_ROWS = Object.freeze([Object.freeze({ id: 'down', label: 'Climb down' })]);
/** What the port's places say. */
export const PORT_TEXT = Object.freeze({
  steal: SHIPYARD_TEXT.steal,
  lightSteal: 'The lightkeeper keeps the lamp and its oil under lock.',
  shut: 'The shipmaster\'s window will not open here.',
  noSail: SHIPYARD_TEXT.noSail,
  sailor: 'Looking for a berth - ask the crewmaster to sign hands on.',
  worker: 'At work on the hull on the stocks.',
  lampLit: 'The lamp burns from dusk to dawn - it is lit.',
  lampDark: 'The lamp burns from dusk to dawn.',
  hatch: 'Down the tower\'s stair.',
  stair: 'The stair up to the lamp.',
  shutStair: 'The lightkeeper keeps the stair shut just now.',
  riding: 'No horse climbs a lighthouse stair - go up on foot.',
  foes: 'The lightkeeper bars the door - not with enemies about.',
});

const NONE = Object.freeze([]);
/** A person of a place's own: a sailor or a shipwright drawn off its key - their sex and outfit. Pure. */
export function folkOf(key, role, i) {
  const h = textSeed(`${key}|${role}|${i}`);
  const femaleShare = role === 'recruit' ? 0.35 : 0.15;
  return { sex: ((h >>> 4) & 0xff) / 256 < femaleShare ? 'female' : 'male', variant: (h >>> 13) & 3 };
}
/** Everyone a place stands: `{ role, i, at: [x, y, z] in its frame, sex, variant }`. Pure. */
export function peopleOf(site) {
  if (site?.kind === 'lighthouse') {
    const k = LIGHTHOUSE_POINTS.keeper;
    return [{ role: 'keeper', i: 0, at: [k[0], 0, k[2]], sex: site.keeper?.sex ?? 'male', variant: site.keeper?.variant ?? 0 }];
  }
  const P = SHIPYARD.points;
  return [
    { role: 'keeper', i: 0, at: [P.keeper[0], 0, P.keeper[1]], sex: site?.keeper?.sex ?? 'male', variant: site?.keeper?.variant ?? 0 },
    { role: 'crewmaster', i: 0, at: [P.crewmaster[0], 0, P.crewmaster[1]], sex: site?.crewmaster?.sex ?? 'male', variant: site?.crewmaster?.variant ?? 0 },
    ...P.recruits.map((p, i) => ({ role: 'recruit', i, at: [p[0], 0, p[1]], ...folkOf(site?.key ?? '', 'recruit', i) })),
    ...P.workers.map((p, i) => ({ role: 'worker', i, at: [p[0], p[2] ?? 0, p[1]], ...folkOf(site?.key ?? '', 'worker', i) })),
  ];
}
/** Whether feet `f` (the scene's) stand on a place's ground at its foot - its footprint, below HOLD_BACK_UP over it. Pure. */
export function feetInPort(site, at, f) {
  if (!site || !at || !f) return false;
  const a = (-(site.yaw ?? 0) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const dx = f[0] - at[0], dz = f[2] - at[2];
  const x = dx * c + dz * s, z = -dx * s + dz * c;
  const F = PORT_FOOT[site.kind];
  return !!F && Math.abs(x) <= F.hx && Math.abs(z) <= F.hz && f[1] < at[1] + (HOLD_BACK_UP[site.kind] ?? 2.5) && f[1] + 1.8 > at[1] - 0.5;
}
/** A beam's puffs from `lamp` along the bearing `theta` (radians, scene yaw: forward [sin, 0, cos]) - `{ pos, size,
 *  alpha }` each, nearest first. Pure. */
export function beamPuffs(lamp, theta) {
  const out = [], dx = Math.sin(theta), dz = Math.cos(theta);
  for (let k = 1; k <= BEAM_PUFFS; k++) {
    const t = k / BEAM_PUFFS, d = BEAM_LEN_M * t * t;
    out.push({ pos: [lamp[0] + dx * d, lamp[1] - BEAM_DIP * d, lamp[2] + dz * d], size: BEAM_SIZE0 + (BEAM_SIZE1 - BEAM_SIZE0) * t, alpha: BEAM_ALPHA * (1 - t) ** 1.3 });
  }
  return out;
}

/**
 * @param {{
 *   renderer?: any, getTexture?: ((archive: number) => Promise<any>)|null,
 *   uploadRecordFrame?: ((archive: number, record: number, frame: number) => void)|null,
 *   sites: () => Array<any>, groundAt: (x: number, z: number) => number, collider?: () => any,
 *   eye?: () => (number[]|null), feet?: () => (number[]|null), lit?: () => boolean,
 *   open?: (site: any, page: string) => boolean, climb?: (site: any, way: 'up'|'down', at: { feet: number[], yaw: number }) => (boolean|string),
 *   say?: (text: string) => void, midText?: (text: string) => void, now?: () => number,
 * }} deps  `sites` every port place standing this frame (`{ key, kind, x, z, yaw, comp, mapId, regionIndex, race, name,
 *   keeper, crewmaster?, crewName? }`, the scene's x, z); `lit()` the lanterns' hours; `open(site, page)` the shipmaster's
 *   window on its page; `climb(site, way, at)` the host's placing of the player (`at` the feet and yaw in the scene) -
 *   true, or its refusal's words
 */
export function createPortHost({
  renderer = null, getTexture = null, uploadRecordFrame = null, sites, groundAt, collider = () => null,
  eye = () => null, feet = () => null, lit = () => false, open = () => false, climb = () => false,
  say = () => {}, midText = () => {}, now = () => performance.now(),
}) {
  /** @type {Map<string, any>} */
  const places = new Map();
  /** @type {Map<string, any>} */
  const meshes = new Map();
  /** @type {Map<string, any>} */
  const models = new Map();
  /** @type {Map<string, number[]>} */
  const boxes = new Map();
  let artUp = false;
  const personTex = new Map();
  let frameN = 0;
  const _batches = [], _targets = [];

  const modelOf = (kind) => { let m = models.get(kind); if (!m) { m = kind === 'lighthouse' ? buildLighthouseModel() : buildShipyardModel(); models.set(kind, m); } return m; };
  function meshOf(kind) {
    if (meshes.has(kind)) return meshes.get(kind);
    if (!renderer?.createMesh) return null;
    try {
      if (!artUp) { for (const [rec, art] of portArt()) renderer.uploadTexture?.(PORT_ARCHIVE, rec, art); artUp = true; }
      meshes.set(kind, renderer.createMesh(modelOf(kind)));
    } catch (e) { meshes.set(kind, null); console.warn('[port] a place would not build', e?.message ?? e); }
    return meshes.get(kind);
  }
  function texOf(archive) {
    const had = personTex.get(archive);
    if (had && !(had instanceof Promise)) return had.failed ? null : had.tex;
    if (!had && getTexture) {
      personTex.set(archive, Promise.resolve().then(() => getTexture(archive)).then(
        (tex) => { personTex.set(archive, tex ? { tex } : { failed: true }); },
        (e) => { personTex.set(archive, { failed: true }); console.warn('[port] a person\'s picture', e?.message ?? e); }));
    }
    return null;
  }
  const archiveOf = (site, p) => {
    const T = PERSON_TEXTURES[site.race] ?? PERSON_TEXTURES.Breton;
    const set = T[p.sex === 'female' ? 'female' : 'male'];
    return set[(p.variant ?? 0) % set.length];
  };
  /** A place's box in the scene (the street's view test): its model's, under its matrix. */
  function boxOf(pl) {
    let b = boxes.get(pl.site.kind);
    if (!b) { b = localAabb(modelOf(pl.site.kind).positions); boxes.set(pl.site.kind, b); }
    return transformedAabb(b, pl.matrix);
  }
  /** The collider's geometry: the model, each person's box, the lighthouse's guard - in the place's frame. */
  function colliderGeometry(pl) {
    const parts = [modelOf(pl.site.kind)];
    for (const p of peopleOf(pl.site)) parts.push(boxTriangles([p.at[0] - KEEPER_HALF, p.at[1], p.at[2] - KEEPER_HALF], [p.at[0] + KEEPER_HALF, p.at[1] + KEEPER_HEIGHT, p.at[2] + KEEPER_HALF]));
    if (pl.site.kind === 'lighthouse') parts.push(guardBand());
    const count = parts.reduce((n, p) => n + p.positions.length, 0), icount = parts.reduce((n, p) => n + p.indices.length, 0);
    const positions = new Float32Array(count), indices = new Uint32Array(icount);
    let v = 0, i = 0;
    for (const p of parts) {
      positions.set(p.positions, v);
      for (let j = 0; j < p.indices.length; j++) indices[i + j] = p.indices[j] + v / 3;
      v += p.positions.length; i += p.indices.length;
    }
    return { positions, indices };
  }
  function standCollider(pl) {
    const col = collider();
    if (!col?.addMesh) return;
    if (pl.colAt && pl.colAt[0] === pl.at[0] && pl.colAt[1] === pl.at[1] && pl.colAt[2] === pl.at[2]) return;
    const moved = pl.colAt !== null;
    if (pl.colAt) { col.removeBucket?.(pl.bucket); pl.colAt = null; }
    if (!moved && feetInPort(pl.site, pl.at, feet())) return;   // held back while the feet stand at its foot as it first rises
    const g = colliderGeometry(pl);
    col.addMesh(pl.bucket, g.positions, g.indices, pl.matrix);
    pl.colAt = [pl.at[0], pl.at[1], pl.at[2]];
  }
  function takeDown(key) {
    const pl = places.get(key);
    if (!pl) return;
    if (pl.colAt) collider()?.removeBucket?.(pl.bucket);
    for (const p of pl.people) if (p.batch) renderer?.destroyBillboardBatch?.(p.batch);
    places.delete(key);
  }
  function stand(site) {
    const pl = {
      site, key: site.key, bucket: `port:${site.key}`, at: null, matrix: null, colAt: null, box: null, targets: null,
      groundY: NaN, groundAt: [NaN, NaN, -Infinity, NaN], phase: (textSeed(String(site.key)) % 6283) / 1000,
      people: peopleOf(site).map((p) => ({ ...p, batch: null, origin: [0, 0, 0] })),
    };
    places.set(site.key, pl);
    return pl;
  }
  function posePeople(pl, t) {
    if (!renderer?.createBillboardBatch) return;
    for (const p of pl.people) {
      const archive = archiveOf(pl.site, p), tex = texOf(archive);
      if (!tex) continue;
      const frames = Math.max(1, tex.getFrameCount?.(PERSON_IDLE_RECORD) ?? 1);
      const frame = Math.floor((t / 1000) * PERSON_IDLE_FPS + p.i * 0.37) % frames;
      const rkey = `${PERSON_IDLE_RECORD}#${frame}`;
      if (!renderer.textures?.has?.(`${archive}_${rkey}`)) uploadRecordFrame?.(archive, PERSON_IDLE_RECORD, frame);
      const sz = mobileBillboardSize(tex, PERSON_IDLE_RECORD);
      if (!p.batch) { p.batch = renderer.createBillboardBatch(archive, rkey, { w: sz.w, h: sz.h }, [[0, 0, 0]]); p.batch.origin = p.origin; }
      p.batch.record = rkey; p.batch.size = { w: sz.w, h: sz.h };
      yardToScene(pl.at, pl.site.yaw, p.at[0], p.at[1], p.at[2], p.origin);
    }
  }
  /** The key's place and what of it the key names. */
  function partOf(key) {
    if (typeof key !== 'string' || !key.startsWith('port:')) return null;
    const rest = key.slice(5), cut = rest.lastIndexOf('|');
    if (cut < 0) return null;
    const pl = places.get(rest.slice(0, cut));
    if (!pl?.at) return null;
    const [what, n] = rest.slice(cut + 1).split('.');
    return { pl, what, i: Number(n) || 0 };
  }
  /** A point of a lighthouse's frame in the scene, and the yaw that faces along its frame's `dir` ([x, z]). */
  const sceneYaw = (pl, dir) => {
    const a = (pl.site.yaw * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return Math.atan2(dir[0] * c + dir[1] * s, -dir[0] * s + dir[1] * c);
  };
  const lampOf = (pl) => { const l = LIGHTHOUSE_POINTS.lamp; return yardToScene(pl.at, pl.site.yaw, l[0], l[1], l[2]); };
  const nameOf = (pl) => pl.site.name ?? PORT_PLACES[pl.site.kind]?.title ?? '';

  return {
    /** One frame: each place standing where its town is built, its ground, its collider, its people; the gone taken down. */
    frame() {
      frameN++;
      const list = sites?.() ?? NONE, live = new Set(), t = now();
      for (const site of list) {
        if ((site?.kind !== 'shipyard' && site?.kind !== 'lighthouse') || !site.key) continue;
        live.add(site.key);
        const pl = places.get(site.key) ?? stand(site);
        pl.site = site;
        const comp = site.comp ?? 0, G = pl.groundAt;
        if (site.x !== G[0] || site.z !== G[1] || comp !== G[3] || !Number.isFinite(pl.groundY) || frameN - G[2] >= PORT_GROUND_EVERY) {
          pl.groundY = groundAt(site.x, site.z); G[0] = site.x; G[1] = site.z; G[2] = frameN; G[3] = comp;
        }
        if (!Number.isFinite(pl.groundY)) { if (pl.colAt) { collider()?.removeBucket?.(pl.bucket); pl.colAt = null; } pl.at = null; continue; }
        if (!pl.at || pl.at[0] !== site.x || pl.at[1] !== pl.groundY || pl.at[2] !== site.z) {
          pl.at = [site.x, pl.groundY, site.z];
          pl.matrix = trs(pl.at[0], pl.at[1], pl.at[2], 0, site.yaw, 0);
          pl.targets = null; pl.box = null;
        }
        meshOf(site.kind);
        standCollider(pl);
        posePeople(pl, t);
      }
      for (const key of [...places.keys()]) if (!live.has(key)) takeDown(key);
      return places.size;
    },
    /** Every place's timber and stone in the host's world pass - by the street's view test where it is handed (in view,
     *  drawn; off screen within a shadow's reach, cast alone; else neither). Answers how many it drew. */
    draw(r = renderer, cull = null) {
      if (!r?.drawMesh) return 0;
      let n = 0;
      for (const pl of places.values()) {
        if (!pl.at || !pl.matrix) continue;
        const v = cull ? cull(pl.box ??= boxOf(pl)) : DECOR_DRAW;
        if (v === DECOR_SKIP) continue;
        const mesh = meshes.get(pl.site.kind);
        if (!mesh) continue;
        (v === DECOR_SHADOW ? castOnly(r) : r).drawMesh(mesh, pl.matrix, null);
        if (v === DECOR_DRAW) n++;
      }
      return n;
    },
    /** AUDIT MW-NPC II's law for the yards' keepers: each person offered their Morrowind body, in the outfit their own
     *  picture wears, off the place's key - turned to the eye as a standing person is. */
    offerBodies(offer, eyeAt, dt) {
      for (const pl of places.values()) {
        if (!pl.at) continue;
        for (const p of pl.people) {
          const b = p.batch;
          if (!b) continue;
          const archive = archiveOf(pl.site, p), race = pl.site.race ?? 'Breton', key = `${archive}|${race}`;
          if (p._mwLookKey !== key) {
            p._mwLookKey = key;
            p._mwLook = folkLookOf({ archive, personFaceRecordId: 0, gender: p.sex === 'female' ? GENDERS.Female : GENDERS.Male, guard: false }, race, textSeed(`${pl.key}|${p.role}|${p.i}`));
          }
          offer(personActor(p, p._mwLook, b.origin, eyeAt, dt), b);
        }
      }
    },
    /** The people, for the host's flats. */
    batches() {
      _batches.length = 0;
      for (const pl of places.values()) if (pl.at) for (const p of pl.people) if (p.batch) _batches.push(p.batch);
      return _batches;
    },
    /** The eye's boxes: the shipyard's people, its two boards, its notice board and its hull; the lighthouse's keeper,
     *  its door, its hatch and its lamp - their reach a static NPC's beside the ray's. */
    targets() {
      _targets.length = 0;
      for (const pl of places.values()) {
        if (!pl.at) continue;
        pl.targets ??= (() => {
          const out = [];
          const add = (what, b) => out.push({ key: `port:${pl.key}|${what}`, aabb: yardBoxToScene(pl.at, pl.site.yaw, b), distance: RAY_DISTANCE, reach: PORT_REACH });
          const person = (p) => [p.at[0] - KEEPER_HALF, p.at[1], p.at[2] - KEEPER_HALF, p.at[0] + KEEPER_HALF, p.at[1] + KEEPER_HEIGHT, p.at[2] + KEEPER_HALF];
          for (const p of pl.people) add(p.role === 'keeper' || p.role === 'crewmaster' ? p.role : `${p.role}.${p.i}`, person(p));
          if (pl.site.kind === 'shipyard') { add('sign', shipsSignBox()); add('crewsign', crewSignBox()); add('notices', noticesBox()); add('hull', hullBox()); }
          else { add('door', doorBox()); add('hatch', hatchBox()); add('lamp', lanternBox()); }
          return out;
        })();
        for (const tg of pl.targets) _targets.push(tg);
      }
      return _targets;
    },
    /** WORLD-HOVER: each part by its name and its keeper's, and its rows. */
    hoverName(key) {
      const p = partOf(key);
      if (!p) return null;
      const s = p.pl.site;
      if (s.kind === 'lighthouse') {
        if (p.what === 'hatch') return { title: 'The hatch', subs: [PORT_TEXT.hatch], actions: DOWN_ROWS.map((r) => ({ ...r })) };
        if (p.what === 'lamp') return { title: 'The lamp', subs: [nameOf(p.pl), lit() ? PORT_TEXT.lampLit : PORT_TEXT.lampDark], actions: [] };
        return { title: nameOf(p.pl), subs: [`${PORT_PLACES.lighthouse.keeper}: ${s.keeper?.name ?? ''}`, p.what === 'door' ? PORT_TEXT.stair : (lit() ? PORT_TEXT.lampLit : PORT_TEXT.lampDark)], actions: CLIMB_ROWS.map((r) => ({ ...r })) };
      }
      if (p.what === 'crewmaster' || p.what === 'crewsign' || p.what === 'notices') {
        return { title: s.crewName ?? PORT_PLACES.crewhall.title, subs: [`${PORT_PLACES.crewhall.keeper}: ${s.crewmaster?.name ?? ''}`, PORT_PLACES.crewhall.trade], actions: CREW_ROWS.map((r) => ({ ...r })) };
      }
      if (p.what === 'recruit') return { title: 'Sailor', subs: [PORT_TEXT.sailor], actions: CREW_ROWS.map((r) => ({ ...r })) };
      if (p.what === 'worker') return { title: 'Shipwright', subs: [PORT_TEXT.worker, nameOf(p.pl)], actions: [] };
      return { title: nameOf(p.pl), subs: [`${PORT_PLACES.shipyard.keeper}: ${s.keeper?.name ?? ''}`, PORT_PLACES.shipyard.trade], actions: SHIPYARD_ROWS.map((r) => ({ ...r })) };
    },
    /** A press: the plaque's lit row (`verb`), or a press with none the part's first; Info names who they are; Steal takes
     *  nothing. Answers whether it was the pool's. */
    activate(key, mode = 'grab', verb = null) {
      const p = partOf(key);
      if (!p) return false;
      const s = p.pl.site;
      if (verb == null && mode === 'info') {
        const who = p.what === 'keeper' ? `${s.keeper?.name ?? ''}, the ${PORT_PLACES[s.kind].keeper.toLowerCase()}`
          : p.what === 'crewmaster' ? `${s.crewmaster?.name ?? ''}, the ${PORT_PLACES.crewhall.keeper.toLowerCase()}`
          : p.what === 'recruit' ? 'a sailor looking for a berth' : p.what === 'worker' ? 'a shipwright at work' : nameOf(p.pl);
        say(presentNpcInfoText(who));
        return true;
      }
      if (verb == null && mode === 'steal') { midText(s.kind === 'lighthouse' ? PORT_TEXT.lightSteal : PORT_TEXT.steal); return true; }
      if (s.kind === 'lighthouse') {
        if (p.what === 'lamp') { say(lit() ? PORT_TEXT.lampLit : PORT_TEXT.lampDark); return true; }
        const down = p.what === 'hatch';
        const pt = down ? LIGHTHOUSE_POINTS.foot : LIGHTHOUSE_POINTS.gallery;
        const feetAt = yardToScene(p.pl.at, s.yaw, pt[0], pt[1] + (down ? 0 : 0.05), pt[2]);
        const yaw = sceneYaw(p.pl, down ? [0, 1] : [0, -1]);   // down: facing the town; up: facing the sea
        const r = climb(s, down ? 'down' : 'up', { feet: feetAt, yaw });
        if (r !== true) midText(typeof r === 'string' && r ? r : PORT_TEXT.shutStair);   // the host's refusal in its own words
        return true;
      }
      if (p.what === 'worker') { say(presentNpcInfoText('a shipwright at work')); return true; }
      const crew = p.what === 'crewmaster' || p.what === 'crewsign' || p.what === 'notices' || p.what === 'recruit';
      const page = crew ? 'crew' : (SHIPYARD_ROWS.find((r) => r.id === verb)?.id ?? 'ships');
      if (!open(s, page)) midText(PORT_TEXT.shut);
      return true;
    },
    /** THE LAMP and the office lantern, in the lanterns' hours: scene lights `{ x, y, z, range }`. */
    lights() {
      if (!lit()) return [];
      const out = [];
      for (const pl of places.values()) {
        if (!pl.at) continue;
        if (pl.site.kind === 'lighthouse') { const l = lampOf(pl); out.push({ x: l[0], y: l[1], z: l[2], range: LAMP_RANGE }); }
        else { const l = yardToScene(pl.at, pl.site.yaw, SHIPYARD.office.x0 - 0.45, 1.9, 5.33); out.push({ x: l[0], y: l[1], z: l[2], range: OFFICE_LAMP_RANGE }); }
      }
      return out;
    },
    /** THE LAMP'S GLOW AND ITS BEAMS, in the lanterns' hours, as render/navalRender.js's added particles - `t` seconds
     *  turn the beams. */
    glows(eyeAt, t = now() / 1000) {
      if (!lit() || !eyeAt) return [];
      const out = [];
      for (const pl of places.values()) {
        if (!pl.at || pl.site.kind !== 'lighthouse') continue;
        const l = lampOf(pl), d = Math.hypot(l[0] - eyeAt[0], l[1] - eyeAt[1], l[2] - eyeAt[2]);
        if (d > BEAM_SEEN_M) continue;
        out.push({ pos: l, size: Math.max(GLOW_NEAR_M, d * GLOW_ANGLE), color: [LIGHTHOUSE_LAMP_COLOR[0], LIGHTHOUSE_LAMP_COLOR[1], LIGHTHOUSE_LAMP_COLOR[2], 0.85], rot: 0, blend: 'add', flat: false, solid: false, kind: 'lamp', aspect: 1 });
        const theta = pl.phase + (2 * Math.PI * t) / BEAM_PERIOD_S;
        for (const th of [theta, theta + Math.PI]) {
          for (const b of beamPuffs(l, th)) out.push({ pos: b.pos, size: b.size, color: [LIGHTHOUSE_LAMP_COLOR[0], LIGHTHOUSE_LAMP_COLOR[1], LIGHTHOUSE_LAMP_COLOR[2], b.alpha], rot: 0, blend: 'add', flat: false, solid: false, kind: 'lamp', aspect: 1 });
        }
      }
      return out;
    },
    /** SHIPYARDS-FOUND: each place standing, as an Overworld mark - its name over it, its kind the look's (`yard
     *  shipyard`, `yard lighthouse` - ui/travelViewHud.js yardGlyph: an anchor, a tower) and the Towns switch's. */
    overworldMarks() {
      const out = [];
      for (const pl of places.values()) {
        if (!pl.at) continue;
        out.push({ key: `port:${pl.key}`, at: [pl.at[0], pl.at[1] + (PORT_MARK_LIFT[pl.site.kind] ?? 6), pl.at[2]], label: nameOf(pl), kind: `yard ${pl.site.kind}` });
      }
      return out;
    },
    /** For the tests and the probes. */
    state: () => [...places.values()].map((pl) => ({ key: pl.key, kind: pl.site.kind, at: pl.at, collider: pl.colAt !== null, name: nameOf(pl), people: pl.people.filter((p) => p.batch).length })),
    /** The gallery's floor over a lighthouse's ground (for the probes and the host's climb). */
    galleryY: GALLERY_Y,
    /** A transition takes every place down: they are stood again by the next frame that finds their towns. */
    destroyAll() { for (const key of [...places.keys()]) takeDown(key); },
    /** The scene ends: the meshes freed too (EVERY ALLOCATION HAS AN OWNER). */
    dispose() {
      for (const key of [...places.keys()]) takeDown(key);
      for (const m of meshes.values()) if (m) renderer?.destroyMesh?.(m);
      meshes.clear(); artUp = false;
    },
  };
}
