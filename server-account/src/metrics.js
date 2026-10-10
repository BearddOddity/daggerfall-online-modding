// @ts-check
// ═══════════════════════════════════════════════════════════════════
// SCALE1 (2026-09-30, the scaling audit - Mac: "set the stage for a
// larger player base in the future"): WHAT THE SERVICE DOES, COUNTED.
//
// Until this the service logged one thing - an uncaught error - and
// nobody could see a request rate, a latency, a 429, a 503 or the D1
// calls a route makes. Every request now writes ONE data point to
// Workers Analytics Engine (the METRICS binding, wrangler.toml):
//
//   index1  the route, as a template (no ids, no names: a bounded set)
//   blob1   the route again (Analytics Engine groups by blobs)
//   blob2   the method
//   blob3   the status, as text ("200", "429"...)
//   blob4   a refusal's one word (`rate`, `too-large`...), or ""
//   double1 wall time in ms (Workers' clock moves across I/O, so this
//           is the time the caller waited, not CPU)
//   double2 the status
//   double3 D1 statements the request ran (a batch counts each one)
//   double4 D1 rows written (SCALE4f; a cron point's double4 is the rows
//           its job changed - the same measure)
//   double5 D1 wait in ms: the wall time the request spent awaiting its
//           statements, summed (SCALE4f)
//   double6 D1 rows read (SCALE4f)
//   double7 statements a read replica served (SCALE4f)
//
// SCALE4f (2026-10-10, Mac: "really future proof our archetecture"; bible
// 11-Multiplayer/Scale-Arc.md SCALE4f): HOW BUSY THE ONE PRIMARY IS. The
// statements a request ran said how much it asked of D1, never how long
// D1 made it wait - and a primary going under shows first as that wait,
// a queue nothing else exposes, before the 'overloaded' refusals begin.
// Every statement a request awaits is timed now (first, all, run, raw,
// and a batch whole), and the rows its answers say it read and wrote are
// summed, with how many a READ REPLICA served (the answer's
// `served_by_primary` false): SCALE4d put the mint's reads on a session a
// replica may serve, and this is where it shows whether one does. A
// `first()` answers a row with no meta, so its rows go uncounted; its
// wait does not.
//
// NOTHING IDENTIFIES A PLAYER. The route is a template, the word is one
// of the service's own, and no header, id, handle or body is written.
//
// A METRIC NEVER COSTS A REQUEST. No binding, a write that throws, a
// body that is not JSON: the request is answered exactly as it would
// have been, and the point is skipped.
//
// Querying: the SQL API over the dataset, e.g.
//   SELECT index1 AS route, blob3 AS status, SUM(_sample_interval) AS n,
//          quantileWeighted(0.95)(double1, _sample_interval) AS p95_ms
//   FROM daggerfall_accounts WHERE timestamp > NOW() - INTERVAL '1' HOUR
//   GROUP BY route, status ORDER BY n DESC
// ═══════════════════════════════════════════════════════════════════

import { ROUTES, savePathOf, realmPathOf, DB_ROOT } from './service.js';

/** The route as a TEMPLATE: a served path as it stands, a save slot or a realm character's save by its shape - never
 *  the ids or the names they carry - and anything else one word, so the set of labels is bounded. */
export function routeLabel(/** @type {string} */ path) {
  if (ROUTES.has(path)) return path;
  const slot = savePathOf(path);
  if (slot) return `/v1/saves/:slot${slot.part ? `/${slot.part}` : ''}`;
  if (realmPathOf(path)) return '/v1/realm/:id/data';
  return 'other';
}

/** SCALE4f: a tally's field moved by `v` - a tally a caller made with `n` alone grows the rest as they come. */
const add = (/** @type {any} */ tally, /** @type {string} */ key, /** @type {number} */ v) => { if (Number.isFinite(v)) tally[key] = (tally[key] ?? 0) + v; };

/** SCALE4f: what an answer's meta says D1 did - its rows read and written, and whether a replica served it. */
function noteMeta(/** @type {any} */ result, /** @type {any} */ tally) {
  const m = result?.meta;
  if (!m || typeof m !== 'object') return;
  add(tally, 'rr', m.rows_read);
  add(tally, 'rw', m.rows_written);
  if (m.served_by_primary === false) add(tally, 'replica', 1);
}

/** SCALE4f: the real statement behind a timed one - D1's batch is handed its own. */
const REAL = new WeakMap();

/** SCALE4f: A STATEMENT WHOSE WAIT IS COUNTED. Every member is the statement's own, called on the statement itself
 *  (workerd's are a class with private fields - a method called on a Proxy throws, AUDIT SCALE4d D8); `bind` answers a
 *  timed statement in turn, and each way of running it adds its wall time (and an answer's rows) to the tally. */
function timedStatement(/** @type {any} */ stmt, /** @type {any} */ tally) {
  if (!stmt || typeof stmt !== 'object') return stmt;
  const timed = new Proxy(stmt, {
    get(target, key) {
      const v = Reflect.get(target, key);
      if (typeof v !== 'function') return v;
      if (key === 'bind') return (/** @type {any[]} */ ...args) => timedStatement(v.apply(target, args), tally);
      if (key === 'first' || key === 'all' || key === 'run' || key === 'raw') {
        return async (/** @type {any[]} */ ...args) => {
          const started = Date.now();
          try {
            const r = await v.apply(target, args);
            if (key === 'all' || key === 'run') noteMeta(r, tally);   // a row (`first`) or rows (`raw`) carry no meta
            return r;
          } finally { add(tally, 'ms', Date.now() - started); }
        };
      }
      return v.bind(target);
    },
  });
  REAL.set(timed, stmt);
  return timed;
}

/** D1 with its statements counted: a statement prepared is one, a batch counts each of its own (they were prepared
 *  already, and are not counted twice - `prepare` inside a batch's list is what counts them). Every other member is
 *  the binding's own. STORM-SHED: and DB_ROOT the binding itself, which outlives this request's Proxy. SCALE4d: and a
 *  session opened through it (`withSession`, service.js replicaDb) is counted into the same tally - a mint served by a
 *  replica is still a mint's dozen statements on its metrics point. SCALE4f: and each statement's wait, its rows, and
 *  a replica's serving - `ms`, `rr`, `rw`, `replica` on the same tally (timedStatement). */
export function countedDb(/** @type {any} */ db, /** @type {{ n: number }} */ tally) {
  return new Proxy(db, {
    get(target, key) {
      if (key === DB_ROOT) return Reflect.get(target, DB_ROOT) ?? target;
      if (key === 'prepare') return (/** @type {any[]} */ ...args) => { tally.n += 1; return timedStatement(target.prepare(...args), tally); };
      if (key === 'batch') {
        const batch = Reflect.get(target, key);
        if (typeof batch !== 'function') return batch;
        return async (/** @type {any[]} */ list, /** @type {any[]} */ ...rest) => {
          const started = Date.now();
          try {
            const rs = await batch.call(target, Array.isArray(list) ? list.map((st) => REAL.get(st) ?? st) : list, ...rest);
            if (Array.isArray(rs)) for (const r of rs) noteMeta(r, tally);
            return rs;
          } finally { add(tally, 'ms', Date.now() - started); }
        };
      }
      if (key === 'withSession') {
        const open = Reflect.get(target, key);
        return typeof open === 'function' ? (/** @type {any[]} */ ...args) => countedDb(open.apply(target, args), tally) : open;
      }
      const v = Reflect.get(target, key);
      return typeof v === 'function' ? v.bind(target) : v;
    },
  });
}

/** A refusal's one word, off a JSON answer that is not a 2xx (the service's refusals are `{ error }`) - or "". */
async function refusalOf(/** @type {Response} */ res) {
  if (res.status < 300 || !(res.headers.get('content-type') ?? '').includes('json')) return '';
  try {
    const body = await res.clone().json();
    return typeof body?.error === 'string' ? body.error.slice(0, 64) : '';
  } catch {
    return '';
  }
}

/**
 * THE REQUEST, SERVED AND COUNTED. `serve(request, env)` is the service; with no METRICS binding it is simply called.
 * @param {Request} request @param {any} env
 * @param {(request: Request, env: any) => Promise<Response>} serve
 */
export async function measured(request, env, serve) {
  const sink = env?.METRICS;
  if (!sink || typeof sink.writeDataPoint !== 'function') return serve(request, env);
  const started = Date.now();
  const tally = { n: 0, ms: 0, rr: 0, rw: 0, replica: 0 };
  const counted = env.DB ? { ...env, DB: countedDb(env.DB, tally) } : env;
  const res = await serve(request, counted);
  try {
    const route = routeLabel(new URL(request.url).pathname);
    sink.writeDataPoint({
      indexes: [route],
      blobs: [route, request.method, String(res.status), await refusalOf(res)],
      doubles: [Date.now() - started, res.status, tally.n, tally.rw, tally.ms, tally.rr, tally.replica],   // SCALE4f: rows written, D1's wait, rows read, a replica's statements
    });
  } catch { /* a metric never costs a request */ }
  return res;
}
