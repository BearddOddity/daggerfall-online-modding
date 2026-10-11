// @ts-check
// SHIPYARDS (2026-10-11): THE SHIPMASTER'S WINDOW'S HOST HALF. The window (ui/shipyardWindow.js) reads a model and asks
// acts; this builds the one and carries out the other over the world host's runtimes - the Fleet's host half
// (scenes/fleetHost.js: the ledger, where each ship lies, her summoning and laying up, her refits and her name), the sea
// fight's state of each (scenes/navalHost.js: the shipwright's model, her named hands, the recruits signed on and paid
// off), Come Sail Away's runtime (laying a sold ship up, her hold let go) and the purse - and the laws:
// systems/shipyards.js (the ships for sale, their price and their sale), systems/crewHall.js (the day's recruits).
// Built by scenes/world.js, the one host that stands Come Sail Away and the ports.
//
// THE PAGES, one model each (`model(site, view)` - `view` the window's own: its page and the ship it has chosen):
//   ships  - every hull for sale: her figures (shipSpec), what the shipmaster asks of this buyer (the counter's haggle,
//            shipBuyPrice), and why not (the purse short, Come Sail Away off);
//   fleet  - every ship of the player's: where she lies (fleetHost's whereIs), her worth and the shipmaster's offer for
//            her (shipWorth, shipSalePrice), why he will not buy her here (saleRefusal), her summoning, her laying up
//            and her name;
//   yard   - the shipwright's work on a ship at hand (scenes/navalHost.js yardModelOf - the yard's own window's model);
//   refits - her four lines (scenes/fleetHost.js offer);
//   crew   - the town's hall today (recruitsOf: none already serving a ship of the player's) against the crewed ships at
//            hand, each with her named hands and her place for another (crewHall.js enlistPlan).
// A ship AT HAND is one lying at this port, at the player's helm here, or laid up (a laid-up ship is brought round to
// any port: the Fleet's own law).
//
//   deps = {
//     fleet() -> scenes/fleetHost.js's | null     naval() -> scenes/navalHost.js's | null     csa() -> Come Sail Away's | null
//     pack() -> the pack (live)    addToPack(item)    gold() -> the purse    pay(n)    credit(n)
//     skills() -> { mercantile, personality } (live)    traded() -> a concluded deal's Mercantile tally (DFU OnTrade)
//     mintUid() -> a new Come Sail Away UID    day() -> the world's day
//     changed() -> the boats' word owed    cabinHolds(uid) / cabinSold(uid, region) -> scenes/worldModes.js's
//     passengersAboard(boat) -> other players standing on her
//   }
//
// Not a DFU member. Ledger A (SHIPYARDS).
import { fleetShip, titleDeed, forgetShip, shipLabel } from '../systems/fleet.js';
import {
  SHIPYARD_HULLS, shipSpec, shipyardItem, shipBuyPrice, shipSalePrice, shipWorth, saleRefusal, SHIPYARD_TEXT, BOAT_DEED_TEMPLATE, BOAT_PARTS_TEMPLATE,
} from '../systems/shipyards.js';
import { recruitsOf, enlistPlan, recruitFee, CREW_HALL_TEXT } from '../systems/crewHall.js';
import { DOCK_REFUSED } from '../systems/naval/quays.js';
import { CREWED_HULLS } from './fleetHost.js';

/** The window's pages, in its tabs' order. */
export const SHIPYARD_PAGES = Object.freeze(['ships', 'fleet', 'yard', 'refits', 'crew']);
/** Where a ship lies that the shipmaster can work on her: at this port, at the helm here, or laid up. */
export const AT_HAND = Object.freeze(['here', 'sailing', 'laidup']);
const said = (ok, text, extra = {}) => ({ ok, text, ...extra });

/** @param {any} deps */
export function createShipyardHost(deps) {
  const fleet = () => deps.fleet?.() ?? null;
  const naval = () => deps.naval?.() ?? null;
  const csa = () => deps.csa?.() ?? null;
  const gold = () => Math.max(0, Math.floor(Number(deps.gold?.() ?? 0) || 0));
  const skills = () => deps.skills?.() ?? { mercantile: 0, personality: 50 };

  /** Every ship of the player's as the Fleet reads her (its own sweep first), with her boat or stand-in. */
  function ships() {
    const f = fleet();
    if (!f) return [];
    const rows = f.model().ships;
    return rows.map((row) => ({ row, rec: fleetShip(row.uid), at: f.whereIs(fleetShip(row.uid)) }));
  }
  /** A ship's cargo as the shipmaster weighs it: her own hold afloat, her laid-up or packed hold by her number. */
  function holdOf(s) {
    if (s.at.where === 'here' || s.at.where === 'sailing') return s.at.boat?.Cargo?.Items?.length ?? 0;
    const held = csa()?.state?.PackedCargoes?.get?.(String(s.row.uid));
    return held?.length ?? 0;
  }
  /** The hands of hers ashore at the player's side. */
  const ashoreOf = (s) => (s.at.boat ? naval()?.awayOf?.(s.at.boat)?.size ?? 0 : 0);
  /** The names serving every crewed ship of the player's - none of them is on a hall's roster. */
  function serving(list) {
    const out = new Set();
    for (const s of list) if (CREWED_HULLS.includes(s.row.hull) && s.at.boat) for (const h of naval()?.crewHands?.(s.at.boat) ?? []) out.add(h.name);
    return out;
  }

  /** WHY THE SHIPMASTER WILL NOT BUY HER HERE, or null (systems/shipyards.js saleRefusal, and her cabin's chests). */
  function saleWhy(s) {
    const why = saleRefusal({
      where: s.at.where, hold: holdOf(s), ashore: ashoreOf(s), fighting: !!s.row.status?.inFight,
      aboard: s.at.boat && s.at.where === 'here' ? deps.passengersAboard?.(s.at.boat) ?? 0 : 0, atPort: true,
    });
    if (why) return why;
    if ((deps.cabinHolds?.(s.row.uid) ?? 0) > 0) return 'Clear her cabin\'s chests first - what they hold would go with her.';
    return null;
  }
  /** Her worth sold back, and what the shipmaster offers this seller for it. */
  function saleOf(s) {
    const st = s.row.status;
    const share = st && st.maxHull > 0 ? st.hull / st.maxHull : 1;
    const worth = shipWorth(s.rec, share);
    return { worth, offer: shipSalePrice(worth, skills()) };
  }

  /**
   * THE WINDOW'S MODEL for `site` (the shipyard pressed - its name, keepers and town) on `view.page`, `view.uid` the ship
   * it chose for the shipwright, the refits or the crew hall.
   * @param {any} site @param {{ page?: string, uid?: number|null }} [view]
   */
  function model(site, view = {}) {
    const page = SHIPYARD_PAGES.includes(/** @type {any} */ (view.page)) ? view.page : 'ships';
    const purse = gold(), sk = skills();
    const list = ships();
    const base = {
      page, title: site?.name ?? 'The Shipyard', keeper: site?.keeper?.name ?? '', crewName: site?.crewName ?? 'The Crew Hall',
      crewmaster: site?.crewmaster?.name ?? '', town: site?.townName ?? '', gold: purse, sailing: !!csa(), sea: !!naval(),
    };
    const atHand = list.filter((s) => AT_HAND.includes(s.at.where));
    const pick = (cands) => cands.find((s) => s.row.uid === view.uid) ?? cands[0] ?? null;
    const choice = (cands) => cands.map((s) => ({ uid: s.row.uid, label: s.row.label, hullName: s.row.hullName }));
    if (page === 'ships') {
      return {
        ...base,
        ships: SHIPYARD_HULLS.map((hull) => {
          const spec = shipSpec(hull), price = shipBuyPrice(spec.price, sk);
          return { ...spec, asked: price, docks: !DOCK_REFUSED.includes(hull), why: !csa() ? SHIPYARD_TEXT.noSail : purse < price ? SHIPYARD_TEXT.short(price) : null };
        }),
      };
    }
    if (page === 'fleet') {
      return {
        ...base,
        fleet: list.map((s) => {
          const { worth, offer } = saleOf(s);
          return { ...s.row, worth, offer, sell: saleWhy(s) };
        }),
      };
    }
    if (page === 'yard') {
      const cands = atHand.filter((s) => s.row.can?.yard == null);
      const s = pick(cands);
      return { ...base, choices: choice(cands), uid: s?.row.uid ?? null, ship: s?.row ?? null, yard: s && s.at.boat ? naval()?.yardModelOf?.(s.at.boat) ?? null : null,
        why: !naval() ? 'The shipwrights work for the sea fight\'s ships - turn on Naval Combat.' : cands.length ? null : 'No ship of yours lies at this port or laid up.' };
    }
    if (page === 'refits') {
      const cands = atHand.filter((s) => s.row.can?.refit == null || s.row.loan);
      const s = pick(cands);
      return { ...base, choices: choice(cands), uid: s?.row.uid ?? null, ship: s?.row ?? null, refit: s ? fleet()?.offer?.(s.row.uid) ?? null : null,
        why: cands.length ? null : 'No ship of yours lies at this port or laid up.' };
    }
    // the crew hall
    const crewed = atHand.filter((s) => CREWED_HULLS.includes(s.row.hull) && s.at.boat);
    const s = pick(crewed);
    const recruits = recruitsOf({ mapId: site?.mapId ?? 0, day: deps.day?.() ?? 0, regionIndex: site?.regionIndex ?? -1, serving: serving(list) });
    let room = null, hands = [];
    if (s && naval()) {
      hands = naval().crewHands(s.at.boat).map((h) => ({ name: h.name, role: h.role, fights: h.fights | 0, boardings: h.boardings | 0, mobile: h.mobile, ashore: !!naval().awayOf?.(s.at.boat)?.has?.(h.name) }));
      const st = s.row.status;
      room = st ? enlistPlan({ hull: s.row.hull, crew: st.crew, maxCrew: st.maxCrew, hands: hands.length }) : null;
    }
    return {
      ...base, choices: choice(crewed), uid: s?.row.uid ?? null, ship: s?.row ?? null, hands, room,
      recruits: recruits.map((r) => ({ ...r, why: !naval() ? CREW_HALL_TEXT.noSea : !s ? CREW_HALL_TEXT.noShip : room && !room.ok ? room.why : purse < r.fee ? CREW_HALL_TEXT.short(r.fee) : null })),
      why: !naval() ? CREW_HALL_TEXT.noSea : crewed.length ? null : CREW_HALL_TEXT.noShip,
    };
  }

  /**
   * THE ACTS - each `{ ok, text }`, a summons that wants the water clicked carrying its `door`:
   *   buy(hull) · sell(uid) · summon(uid) · away(uid) · rename(uid, name) · refit(uid, line) · hire(uid, recruitId) ·
   *   payoff(uid, name) · role(uid, { name, role })
   * @param {any} site @param {string} verb @param {any} [a] @param {any} [b]
   */
  function act(site, verb, a, b) {
    const f = fleet();
    if (verb === 'buy') {
      const hull = Number(a);
      if (!SHIPYARD_HULLS.includes(hull)) return said(false, 'The shipmaster builds no such ship.');
      if (!csa()) return said(false, SHIPYARD_TEXT.noSail);
      const price = shipBuyPrice(shipSpec(hull).price, skills());
      if (gold() < price) return said(false, SHIPYARD_TEXT.short(price));
      const it = shipyardItem(hull, deps.mintUid());
      deps.pay?.(price);
      if (it.templateIndex === BOAT_DEED_TEMPLATE) {
        const rec = titleDeed(it, { port: site?.townName ? { name: site.townName } : null });
        deps.traded?.();
        deps.changed?.();
        return said(true, SHIPYARD_TEXT.bought(shipLabel(rec), site?.townName), { uid: it.UID });
      }
      deps.addToPack?.(it);
      deps.traded?.();
      return said(true, SHIPYARD_TEXT.boughtParts(it.name), { uid: it.UID });
    }
    const uid = Number(a);
    const rec = fleetShip(uid);
    if (!f || !rec) return said(false, 'No such ship of yours.');
    const s = ships().find((x) => x.row.uid === uid);
    if (!s) return said(false, 'No such ship of yours here.');
    const name = shipLabel(rec);
    if (verb === 'sell') {
      const why = saleWhy(s);
      if (why) return said(false, why);
      const { offer } = saleOf(s);
      if (s.at.where === 'here' && !csa()?.LayUpBoat?.(s.at.boat)) return said(false, 'She could not be brought in to be sold.');
      if (s.at.where === 'packed') {
        const pack = deps.pack?.() ?? [];
        const i = pack.findIndex((it) => it?.templateIndex === BOAT_PARTS_TEMPLATE && it.UID === uid);
        if (i >= 0) pack.splice(i, 1);
      }
      deps.cabinSold?.(uid, site?.regionIndex ?? 0);
      forgetShip(uid);
      naval()?.forgetBoat?.(uid);
      csa()?.forgetHold?.(uid);
      deps.credit?.(offer);
      deps.traded?.();
      deps.changed?.();
      return said(true, SHIPYARD_TEXT.sold(name, offer), { gold: offer });
    }
    if (verb === 'summon' || verb === 'away' || verb === 'rename' || verb === 'refit' || verb === 'role') {
      return f.act(uid, verb === 'refit' ? 'refit' : verb, b);
    }
    if (verb === 'hire' || verb === 'payoff') {
      const n = naval();
      if (!n) return said(false, CREW_HALL_TEXT.noSea);
      if (!CREWED_HULLS.includes(rec.hull) || !s.at.boat || !AT_HAND.includes(s.at.where)) return said(false, CREW_HALL_TEXT.noShip);
      if (verb === 'payoff') {
        const r = n.releaseHand(s.at.boat, String(b ?? ''));
        return r.ok ? said(true, CREW_HALL_TEXT.paidOff(r.hand.name, name)) : said(false, r.text);
      }
      const all = recruitsOf({ mapId: site?.mapId ?? 0, day: deps.day?.() ?? 0, regionIndex: site?.regionIndex ?? -1, serving: serving(ships()) });
      const recruit = all.find((r) => r.id === b);
      if (!recruit) return said(false, CREW_HALL_TEXT.gone);
      const fee = recruitFee(recruit.grade, recruit.trade);
      if (gold() < fee) return said(false, CREW_HALL_TEXT.short(fee));
      const r = n.enlistHand(s.at.boat, recruit);
      if (!r.ok) return said(false, r.text);
      deps.pay?.(fee);
      return said(true, CREW_HALL_TEXT.signed(recruit.name, r.hand.role, name));
    }
    return said(false, 'Not here.');
  }

  return { model, act };
}
