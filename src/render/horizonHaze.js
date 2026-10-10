// @ts-check
// ═══════════════════════════════════════════════════════════════════
// FAR-SEA1 (2026-10-10, Mac, from the top of a mountain over the sea: "Anyway we can fix the draw distance for oceans
// without affecting performance?"): THE HORIZON'S HAZE, ONE LAW. The streamed sea faded to the world fog's colour at
// the fog's end (4000 units at the default Land view distance), stood fully fogged out to the streamed grid's square
// edge, and past it the far ring's sea (EV8) came back at its haze hold, 85% - a shade DARKER than the band in front
// of it. A flat sea shows that step whole: dark water, a pale band, a hard square edge, a darker plane to the horizon.
//
// The law is the ring's, as EV8's record words it: the world fog's own ramp, CAPPED at the hold through the middle
// distance - min(ramp, hold), so a surface is fogged exactly as the world is until it reaches the hold - and closed
// to 1 over the ring's rim. Two passes take it, from this one text: the far ring, everywhere (render/farRing.js and
// the lane's twin, render/enhancedLighting.js EL_FAR_RING_FS), and the streamed SEA (render/waterSurface.js - the
// water at the sea's own level under the world's linear fog, on the frames the ring is drawn), so the sea in the
// streamed grid and the sea on the ring meet at the same haze and the ocean runs on to the horizon. No pass is added
// and no geometry grows: the ring was always drawn there, and the water takes one uniform more.
//
// The ring's base term had been hold * ramp, which equals the cap wherever the ring stands past the fog's end (every
// Land view distance from 3 up under DFU's rows) and left the ring LESS fogged than the streamed ground beside it
// wherever it stood inside the ramp (a near grid, or Dynamic Skies' Sunny, 2000 to 3600 - AUDIT 61 F9's seam, half
// closed). Capped, it is the world's fog there exactly.
//
// A leaf with no imports, as fogGlsl.js is: the water's module graph takes this file alone.
// ═══════════════════════════════════════════════════════════════════

/** horizonHaze(d, ...): the mix toward the fog colour at eye distance `d`, 0 clear to 1 all fog - the world fog's
 *  linear ramp over (fogStart, fogEnd) capped at `hold`, and the rest closed over (rimStart, rimEnd).
 *  seaSky(lit, ndv, zenith, horizon, f0): the open sea's own colour at a facing `ndv` (the eye's direction dotted with
 *  the up) - the water surface's own Fresnel over its lit body and the sky it reflects (waterSurface.js, the deep
 *  sea's arm: nothing seen through it), for a sea that has no waves to light: the ring's. */
export const HORIZON_HAZE_GLSL = `
float horizonHaze(float d, float fogStart, float fogEnd, float rimStart, float rimEnd, float hold) {
  float ramp = clamp((d - fogStart) / max(fogEnd - fogStart, 1.0), 0.0, 1.0);
  return min(min(ramp, hold) + (1.0 - hold) * smoothstep(rimStart, rimEnd, d), 1.0);
}
vec3 seaSky(vec3 lit, float ndv, vec3 zenith, vec3 horizon, float f0) {
  float F = f0 + (0.85 - f0) * pow(1.0 - clamp(ndv, 0.0, 1.0), 5.0);
  vec3 skyRefl = mix(horizon, zenith, clamp(0.2 + ndv * 1.4, 0.0, 1.0));
  return lit * (1.0 - F) + skyRefl * F;
}`;

/** The sea's band about its own level (world units): a water fragment within it is the sea and takes the horizon's
 *  haze; any other water (a mountain lake, a river above the coast) fogs as the land round it does. The sheet stands
 *  WATER_LIFT over the clamp, and its swell has faded out long before the haze leaves the world's own ramp. */
export const SEA_HAZE_BAND = 1.0;

/** FAR-SEA1: what both lanes' far-ring fragment shaders read for the ring's sea and the horizon's haze - the vertex
 *  shader's sea weight, its eye-space point and the world's up in eye space (render/farRing.js VS), the sky the water
 *  reflects, the water's Fresnel at normal incidence, and whether there is a sky to reflect at all. */
export const RING_SEA_GLSL = `in float vSea;
in vec3 vView;
in vec3 vUp;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;
uniform float uSeaF0;
uniform float uSeaLook;   // 1 with a sky to reflect, 0 without (the sea lit as ground, as before)
${HORIZON_HAZE_GLSL}
float ringSeaFacing() { return dot(normalize(-vView), normalize(vUp)); }`;
