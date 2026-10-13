// @ts-check
// SET2 (2026-09-26, Sigil Sets - bible/11-Multiplayer/Sigil-Sets.md): THE PLAYER'S DOOR TO THE LIVE SCENE.
//
// A set's power sometimes reaches past the one blow the formula resolves: Malacath's Spite strikes the foe that struck
// me, Ruhn's Cleave the next foe beside the one I struck, the Warden's Nova every foe around me, and Nocturnal's
// Eventide wraps ME in a spell. The foes, the player's feet and the doors that land a hurt or a spell belong to the
// host that is running now (scenes/hostMagic.js - one engine per host, each with its own foes and sinks), so that
// engine PUBLISHES itself here every frame it updates, and a power reads whichever host published last - the one the
// player is standing in. A leaf: it imports nothing.
//
// The door: {
//   foes()          the live foes MY harm may reach ([{ entity, ai, dead, puppet? }]; the town's defenders left out)
//   feet()          my feet in that host's frame ([x, y, z])
//   hurtFoe(f, n)   n damage from ME to foe record f, through its own pool's door (a kill is mine, a puppet's goes to
//                   its owner as my hit - the sinks every spell of mine already lands through)
//   castOnPlayer(b) a spell bundle on me, no saving throw and no chance roll (a potion's way)
//   player()        my entity (a kill's word names the foe, not me)
//   clear(a, b)     AUDIT SET M4 (optional): whether nothing solid stands between feet a and feet b, chest high
//   say(line)       RVN3 (optional): a line the scene's HUD speaks
//   sfx(id, at)     RVN3 (optional): a sound where a foe stands
//   lairHere()      RVN7 (optional): where a revenant's deed is done, for its lair - { px, py, dungeons } in the open
//                   world (its map pixel and the named dungeons in reach), { underground } in a dungeon, or null
// }

/** @type {null | { foes: () => any[], feet: () => number[]|null, hurtFoe: (f: any, n: number) => void, castOnPlayer: (b: any) => void, player?: () => any, clear?: (a: number[], b: number[]) => boolean, say?: (line: string) => void, sfx?: (id: number, at: number[]) => void, lairHere?: () => any, isPuppet?: (f: any) => boolean }} */
let _door = null;
/** The running host's word: this is the scene now. `null` takes it down. */
export function setPlayerDoor(door) { _door = door && typeof door === 'object' ? door : null; }
/** The scene the player stands in, or null before a host has run a frame. */
export const playerDoor = () => _door;

/** BAL5 (bible/05-Combat/Balance-Arc.md section 11): what a blow PAID BACK may take from foe record `f` - `n`, but never
 *  its last point. A foe's own blow turned back on it (the loot's thorns, Spite of the Spurned) wounds and never kills:
 *  the kill is the player's to take, so standing still is no way to win a fight. A whole point is left whatever the
 *  host's door divides it by (a shared foe's toughness only lessens it); a record that carries no health is taken at
 *  its word. */
export function paidBack(f, n) {
  if (!(n > 0)) return 0;
  const h = f?.entity?.health;
  if (!Number.isFinite(h)) return n;
  return Math.max(0, Math.min(n, Math.ceil(h) - 1));
}
