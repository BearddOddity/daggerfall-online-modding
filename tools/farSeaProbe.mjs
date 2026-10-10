// FAR-SEA1 - THE FAR RING'S SEA AND THE WATER'S HAZE, COMPILED AND DRAWN IN A REAL BROWSER.
//
// Node pins the laws on the shader text (test/farsea1.test.js); only a driver can say the programs still link and
// keep the uniforms the host uploads - a dropped uniform reads back null and the upload skips it. So this links the
// far ring on all three of its fragment shaders (classic, the Enhanced Lighting lane, the classic-shadow lane) and the
// water on both, asks for every FAR-SEA1 uniform, and then draws the ring over an open sea from a raised eye with the
// sea inside the hole on and off: on, the pixels the hole left to the clear colour are the sea's.
//
//     npx vite --port 5241 &
//     node tools/farSeaProbe.mjs
import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5241';
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto(`${BASE}/play/?skin=enhanced`, { waitUntil: 'networkidle' });
const r = await page.evaluate(async () => {
  const out = [];
  const fr = await import('/src/render/farRing.js');
  const el = await import('/src/render/enhancedLighting.js');
  const csl = await import('/src/render/classicShadowLane.js');
  const rend = await import('/src/render/renderer.js');
  const mat = await import('/src/world/mat4.js');
  const W = 256, H = 160;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.body.append(cv);
  const gl = cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  const SEA_U = ['uSkyZenith', 'uSkyHorizon', 'uSeaF0', 'uSeaLook', 'uHazeHold', 'uRimStart', 'uRimEnd', 'uFogStart', 'uFogEnd', 'uFogColor'];
  for (const [name, lane] of [['classic', null], ['Enhanced Lighting lane', el.EL_LANE], ['classic-shadow lane', csl.classicShadowLane()]]) {
    const ring = new fr.FarRingRenderer(gl, { lane });
    const linked = gl.getProgramParameter(ring.program, gl.LINK_STATUS) === true;
    const lost = linked ? SEA_U.filter((u) => !gl.getUniformLocation(ring.program, u)) : [];
    out.push([`ring (${name}): links and keeps its sea and haze uniforms`, linked && !lost.length, linked ? (lost.length ? `optimised out: ${lost.join(', ')}` : '') : (gl.getProgramInfoLog(ring.program) || 'did not link')]);
    ring.dispose();
  }
  // the water, on the renderer's own build (classic, then with the lane's shadow block)
  const cv2 = document.createElement('canvas'); cv2.width = 64; cv2.height = 64; document.body.append(cv2);
  const rr = new rend.Renderer(cv2);
  for (const [name, prog] of [['classic', () => rr.waterSurfaceProgram], ['lane', () => { rr.setLightingLane(el.EL_LANE); return rr.waterSurfaceProgramLane; }]]) {
    const p = prog();
    const linked = !!p && rr.gl.getProgramParameter(p, rr.gl.LINK_STATUS) === true;
    out.push([`water (${name}): links and keeps uSeaHaze`, linked && !!rr.gl.getUniformLocation(p, 'uSeaHaze'), linked ? '' : 'did not link (or not built)']);
  }
  // THE DRAW: an open sea, the eye 300 units over it looking out and down, a streamed rect of radius 6 left empty -
  // as the world's 6000-unit far plane leaves its corners. The ring alone leaves the hole the clear colour; the sea
  // inside it paints those pixels.
  const ring = new fr.FarRingRenderer(gl);
  const MW = 400, MH = 400;
  ring.build({ heightBytes: new Uint8Array(MW * MH), mapWidth: MW, mapHeight: MH, climateAt: () => 231, baseX: 200, baseY: 200 }, 200, 200, 6);
  const seaY = fr.ringHeight(0);
  const eye = [0.5 * 819.2, seaY + 300, -0.5 * 819.2 + 819.2];   // the base pixel's centre (z runs north), raised
  const view = mat.lookAt(eye, [eye[0] + 3000, seaY, eye[2] - 3000], [0, 1, 0]);
  const draw = (seaFill) => {
    gl.viewport(0, 0, W, H);
    gl.clearColor(1, 0, 1, 1); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    ring.draw(view, {
      origin: [0, 0, 0], lightDir: new Float32Array([0.3, 0.8, 0.2]), ambient: new Float32Array([0.4, 0.4, 0.45]), sunScale: 0.6, sunColor: new Float32Array([1, 0.95, 0.9]),
      fogColor: new Float32Array([0.6, 0.7, 0.8]), fogStart: 0, fogEnd: 4000, fovY: 1.0, aspect: W / H, seaFill,
      skyZenith: [0.2, 0.35, 0.7], skyHorizon: [0.65, 0.78, 0.92],
    });
    const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let clear = 0; for (let i = 0; i < W * H; i++) if (px[i * 4] === 255 && px[i * 4 + 1] === 0 && px[i * 4 + 2] === 255) clear++;
    return { clear, px };
  };
  const without = draw(false), withFill = draw(true);
  out.push(['the ring alone leaves the streamed rect to the clear colour', without.clear > W * H * 0.05, `${without.clear} clear pixels`]);
  // above the horizon the sky is the clear colour in this probe (no dome), so the fill takes the rect's share alone
  out.push(['the sea inside the hole paints it', withFill.clear < without.clear - W * H * 0.05, `${withFill.clear} clear pixels with the fill, ${without.clear} without`]);
  // and the fill's sea is the ring's sea at the hold: next to the seam, the two read the same
  const at = (p, x, y) => [p[(y * W + x) * 4], p[(y * W + x) * 4 + 1], p[(y * W + x) * 4 + 2]];
  const y0 = Math.floor(H * 0.25);
  const a = at(withFill.px, W >> 1, y0), b = at(withFill.px, W >> 1, y0 + 3);
  out.push(['the sea reads continuous across the hole\'s edge', Math.max(...a.map((v, i) => Math.abs(v - b[i]))) <= 6, `${a} / ${b}`]);
  ring.dispose();
  return out;
});
let bad = 0;
for (const [n, ok, log] of r) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${n}${log ? ` - ${log}` : ''}`);
  if (!ok) bad++;
}
if (errs.length) { console.log('page errors:', errs.slice(0, 3)); bad++; }
await browser.close();
process.exit(bad ? 1 : 0);
