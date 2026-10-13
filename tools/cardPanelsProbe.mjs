// CARDS-PLUS (2026-10-13, bible/11-Multiplayer/Tavern-Cards.md section 38): THE CARD TABLES' PANELS, SEEN. Opens the card
// table lab (cards.html - the tavern's table, its 3D cloth) headless, mounts the Hold'em panel (ui/cardTableHud.js) and
// Iliac Hand's (ui/iliacTableHud.js) through their REAL painters with their real models - Iliac Hand's setup, a turn
// with a card picked and one staged, a game's end; Hold'em's buy-in and a hand at the flop - on the three looks a
// player can wear (Enhanced Plus, the classic skin, the DFO Grimoire dress) at a desktop and a phone, and reads what a
// fake document cannot:
//   - the FACE: the panel's words, its title and its presses in the game's pixel face (the dress's own under the
//     Grimoire dress) - CARDS4 and CARDS10 wrote Georgia, serif over them;
//   - the KIT: the window's carved frame (the kit's border-image) on Plus and on the classic skin, where the panel lays
//     its own cut of the kit;
//   - the FIT: the panel on the screen, nothing in it wider than it, no holding's lanes past its plate;
//   - NO BORROWED COMPONENT: a lane, a little card, the note carry none of the enhanced sheet's bare .row, .card and
//     .note (a lane took a menu row's 11px 18px padding and its underline);
//   - THE TILE FACE: the hand's cards painted at their CSS size - 80px tall, the painter's tile bound 140 (CARDS10 painted
//     160 and wore the full face's rules box at 4px);
//   - THE LOG scrolled to the newest standing on a whole line; THE FOLD putting the table's words away and back.
//     node tools/cardPanelsProbe.mjs          (writes $PROBE_SHOTS or /tmp/cardpanels-*.png)
// The fonts: the probe's browser has no route to Google Fonts (the game's one request), so it lays the launcher's own
// copy of Pixelify Sans (app/launcher/fonts - the same file, pinned by its hash there) and opens the page with ?nofonts.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= '/opt/pw-browsers';
const shots = process.env.PROBE_SHOTS ?? '/tmp';
const PIX = readFileSync(new URL('../app/launcher/fonts/PixelifySans-latin.woff2', import.meta.url)).toString('base64');
const FONT_CSS = `@font-face { font-family: 'Pixelify Sans'; font-weight: 400 700; font-display: block; src: url(data:font/woff2;base64,${PIX}) format('woff2'); }`;
const server = await createServer({ server: { port: 5243, strictPort: true }, logLevel: 'error' });
await server.listen();
const BASE = 'http://127.0.0.1:5243';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
let failed = 0, checks = 0;
const check = (ok, what) => { checks++; if (!ok) { failed++; console.log(`FAIL ${what}`); } };
const passed = () => checks - failed;

/** Mount one scene's panel on the page, through the real painter and model. */
async function mount(page, scene) {
  await page.evaluate(async (scene) => {
    const { newGame, commit, reveal, iliacView } = await import('/src/net/iliacHand.js');
    const { STARTER_DECK } = await import('/src/net/iliacCards.js');
    const { patronPlays } = await import('/src/systems/iliacPatrons.js');
    const ih = await import('/src/ui/iliacTableHud.js');
    const ch = await import('/src/ui/cardTableHud.js');
    const { CardTableSession } = await import('/src/systems/cardTableSession.js');
    let x = 7, u = 3;
    const rand32 = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; return x >>>= 0; };
    const unit = () => { u = (u * 1664525 + 1013904223) >>> 0; return u / 4294967296; };
    const playTo = (turns) => {
      const st = newGame({ decks: [[...STARTER_DECK], [...STARTER_DECK]], rand32 });
      for (let t = 1; t < turns; t++) { for (const pl of [0, 1]) commit(st, pl, patronPlays(st, pl, pl ? 'loose' : 'tight', 1, unit)); reveal(st); }
      return st;
    };
    const log = ['The holdings: Daggerfall, Evermor, Betony.', 'Turn 2.', 'Adrienne Lacroix commits.', 'Turn 3.', 'Adrienne Lacroix commits.', 'Turn 4.'];
    if (scene.startsWith('iliac')) {
      const hud = ih.createIliacTableHud({ onPress: () => {} });
      window.__panel = hud;
      if (scene === 'iliac-setup') {
        hud.render(ih.iliacHudModel({ phase: 'setup', packPrice: 120, setup: {
          decks: [{ name: 'Starter deck' }, { name: 'Undead of the Bay' }, { name: 'Half built', word: 'A deck holds exactly 30 cards.' }],
          foes: [{ name: 'Adrienne Lacroix', temper: 'tight' }, { name: 'Gorbash gro-Ulfat', temper: 'loose', paid: true }, { name: 'Sela Thrane', temper: 'bluffer' }],
          deck: 0, foe: 0, forKeeps: true, keepsOk: true } }));
        return;
      }
      const st = playTo(scene === 'iliac-over' ? 7 : 4);
      const v = { ...iliacView(st, 0), names: ['You', 'Adrienne Lacroix'] };
      if (scene === 'iliac-over') { hud.render(ih.iliacHudModel({ phase: 'over', view: v, end: v.result?.winner === 0 ? 'won' : 'lost', log, packPrice: 120 })); return; }
      const hand = v.players[0].hand;
      let staged = [];
      for (let i = 0; i < hand.length && !staged.length; i++) for (let h = 0; h < 3 && !staged.length; h++) if (ih.stagedRefusal(v, [{ card: i, holding: h }]) === null) staged = [{ card: i, holding: h }];
      const pick = hand.findIndex((_, i) => !staged.some((s) => s.card === i) && [0, 1, 2].some((h) => ih.stagedRefusal(v, [...staged, { card: i, holding: h }]) === null));
      hud.render(ih.iliacHudModel({ phase: 'playing', view: v, staged, pick: pick >= 0 ? pick : null, log, packPrice: 120 }));
      return;
    }
    const hud = ch.createCardTableHud({ onPress: () => {} });
    window.__panel = hud;
    if (scene === 'holdem-buyin') { hud.render(ch.cardHudModel({ phase: 'buyin', buyIn: { min: 100, max: 1000 }, stakes: { sb: 5, bb: 10 }, iliac: true, packPrice: 120 })); return; }
    let y = 4;
    const r32 = () => { y ^= y << 13; y >>>= 0; y ^= y >>> 17; y ^= y << 5; return y >>>= 0; };
    const names = ['Ana Vell', 'Bors Thane', 'Cael Dunmore'];
    const s = new CardTableSession({ player: { id: 'you', name: 'You', stack: 500 }, patrons: names.map((n, i) => ({ id: `patron:${i}`, name: n, temper: ['loose', 'tight', 'bluffer'][i % 3], stack: 400 + 100 * i })), stakes: { sb: 5, bb: 10 }, rand32: r32, now: 0 });
    const lines = [];
    for (let now = 0, acted = 0; now <= 30000; now += 50) {
      s.tick(now);
      const l = s.legal();
      if (l && s.view().hand?.street === 'flop' && acted++ > 0) break;
      if (l) s.playerAct(l.check ? { type: 'check' } : { type: 'call' }, now);
      for (const e of s.drain()) { const line = ch.eventLine(e, s.seats.map((q) => q.name), s.playerSeat); if (line) lines.push(line); }
    }
    hud.render(ch.cardHudModel({ phase: 'playing', view: s.view(), legal: s.legal(), stakes: { sb: 5, bb: 10 }, log: lines }));
  }, scene);
}

/** What the page shows of the panel - read in the page. */
const measure = (page) => page.evaluate(() => {
  const root = document.querySelector('.dfcards, .dfiliac');
  const cs = (n) => getComputedStyle(n);
  const r = root.getBoundingClientRect();
  const btn = root.querySelector('button');
  const lanes = [...root.querySelectorAll('.lane')], holds = [...root.querySelectorAll('.hold')];
  const log = root.querySelector('.log');
  const dpr = window.devicePixelRatio || 1;
  return {
    face: cs(root).fontFamily, buttonFace: btn ? cs(btn).fontFamily : null, titleFace: cs(root.querySelector('.tabletitle')).fontFamily,
    frame: cs(root).borderImageSource,
    rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom }, view: { w: innerWidth, h: innerHeight },
    overflow: root.scrollWidth - root.clientWidth,
    holdsOver: holds.map((h) => h.scrollWidth - h.clientWidth),
    lanePad: [...new Set(lanes.map((n) => `${cs(n).paddingLeft} ${cs(n).borderBottomWidth}`))],
    cardMargin: [...new Set([...root.querySelectorAll('.card-face')].map((n) => `${cs(n).marginBottom} ${cs(n).borderTopWidth}`))],
    noteMargin: [...root.querySelectorAll('.tablenote')].map((n) => cs(n).marginTop),
    trayH: [...root.querySelectorAll('.tray canvas')].map((c) => c.height / dpr),
    log: log ? { top: log.scrollTop, max: log.scrollHeight - log.clientHeight, lines: log.children.length } : null,
  };
});

for (const [look, q] of [['plus', 'skin=enhanced&dress=none'], ['classic', 'skin=classic&dress=none'], ['grimoire', 'skin=enhanced&dress=grimoire']]) {
  for (const vp of [{ width: 1280, height: 760 }, { width: 390, height: 844 }]) {
    for (const scene of ['iliac-setup', 'iliac-play', 'iliac-over', 'holdem-buyin', 'holdem-play']) {
      const page = await browser.newPage({ viewport: vp });
      page.on('pageerror', (e) => errors.push(`${look} ${scene}: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`${look} ${scene}: ${m.text()}`); });
      await page.goto(`${BASE}/cards.html?t=14&cam=seat&nohud&nofonts&${q}${scene.startsWith('iliac') ? '&game=iliac' : ''}`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__cardsReady === true, null, { timeout: 120000 });
      await page.addStyleTag({ content: FONT_CSS });
      await mount(page, scene);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(120);
      const m = await measure(page);
      const tag = `${look} ${scene} ${vp.width}`;
      const face = look === 'grimoire' ? /DFO Alagard/ : /^"Pixelify Five", "Pixelify Sans"/;
      check(face.test(m.face) && face.test(m.titleFace) && (!m.buttonFace || face.test(m.buttonFace)), `${tag}: the face - ${m.face} / ${m.buttonFace}`);
      check(!/Georgia/.test(m.face) || look === 'grimoire', `${tag}: no serif of its own`);
      if (look !== 'grimoire') check(/svg/.test(m.frame), `${tag}: the kit's carved frame - ${m.frame.slice(0, 40)}`);
      check(m.rect.left >= 0 && m.rect.top >= 0 && m.rect.right <= m.view.w && m.rect.bottom <= m.view.h, `${tag}: on the screen ${JSON.stringify(m.rect)}`);
      check(m.overflow <= 0, `${tag}: nothing wider than the panel (${m.overflow}px)`);
      check(m.holdsOver.every((d) => d <= 0), `${tag}: no lane past its holding ${m.holdsOver}`);
      check(m.lanePad.every((p) => p === '0px 0px'), `${tag}: a lane borrows no menu row ${m.lanePad}`);
      check(m.cardMargin.every((p) => p === '0px 0px'), `${tag}: a little card borrows no settings card ${m.cardMargin}`);
      check(m.noteMargin.every((p) => p === '0px'), `${tag}: the note borrows no .note ${m.noteMargin}`);
      if (scene === 'iliac-play') check(m.trayH.length > 0 && m.trayH.every((h) => h === 80), `${tag}: the hand painted at its 80px - the tile face ${m.trayH}`);
      if (m.log && m.log.max > 0) check(m.log.top === m.log.max && (m.log.top - 4) % 16 === 0, `${tag}: the log at its newest, on a whole line (${m.log.top} of ${m.log.max})`);
      await page.screenshot({ path: `${shots}/cardpanels-${look}-${scene}-${vp.width}.png` });
      // the fold: the table's words away and back, the line and the presses kept
      const folded = await page.evaluate(() => {
        const root = document.querySelector('.dfcards, .dfiliac');
        const h0 = root.getBoundingClientRect().height;
        const words = !!root.querySelector('.seats, .board, .tablenote, .log, .ilbody');   // a buy-in has none to put away
        root.querySelector('.fold').click();
        const h1 = root.getBoundingClientRect().height;
        const kept = !!root.querySelector('.msg') && root.querySelectorAll('button').length > 0;
        root.querySelector('.fold').click();
        return { shrank: words ? h1 < h0 : h1 === h0, back: Math.abs(root.getBoundingClientRect().height - h0) < 1, kept };
      });
      check(folded.shrank && folded.back && folded.kept, `${tag}: the fold ${JSON.stringify(folded)}`);
      console.log(`${tag}: ${m.face.split(',')[0]} frame ${/svg/.test(m.frame) ? 'kit' : m.frame.slice(0, 12)} ${Math.round(m.rect.right - m.rect.left)}x${Math.round(m.rect.bottom - m.rect.top)}${m.log ? ` log ${m.log.top}/${m.log.max}` : ''}`);
      await page.close();
    }
  }
}
console.log(`${passed()} of ${checks} checks; shots in ${shots}/cardpanels-*.png`);
if (errors.length) { failed++; console.log(`FAIL errors:\n${errors.join('\n')}`); }
await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
