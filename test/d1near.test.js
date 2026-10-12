// D1-NEAR (2026-10-12, from play: "I notice a lot of UI elements that utilize the server (like searching players, the
// guild menu, etc) take an insane amount of time to load") - THE ACCOUNT WORKER RUNS BESIDE ITS DATABASE'S PRIMARY, BY
// NAME. SCALE1 left it to Smart Placement, which ran it in Sydney while the primary stands in California: every
// statement of every route crossed the Pacific, ~150-180 ms each, fifteen of them for a look at the Guild tab. And the
// deploy says where the Worker answers from, so the place is measured, never taken on its word again.
// bible/11-Multiplayer/Scale-Arc.md D1-NEAR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const src = (p) => readFileSync(join(ROOT, p), 'utf8');

/** A TOML table's keys and their string values, its comments and blank lines dropped, up to the next table. */
function tomlTable(toml, name) {
  const lines = toml.split('\n');
  const at = lines.findIndex((l) => l.trim() === `[${name}]`);
  assert.ok(at >= 0, `no [${name}] table`);
  const out = {};
  for (const l of lines.slice(at + 1)) {
    const t = l.trim();
    if (t.startsWith('[')) break;
    if (!t || t.startsWith('#')) continue;
    const kv = /^([A-Za-z_][\w-]*)\s*=\s*"([^"]*)"\s*(?:#.*)?$/.exec(t);
    assert.ok(kv, `[${name}] holds a line this pin cannot read: ${t}`);
    out[kv[1]] = kv[2];
  }
  return out;
}

/** Every .md under a directory, by path. */
const markdownUnder = (dir) => readdirSync(join(ROOT, dir), { recursive: true }).map(String).filter((f) => f.endsWith('.md')).map((f) => join(dir, f));

/** The sentence SCALE1 wrote and nothing measured: Smart Placement running the Worker near, or beside, its database. */
const SMART_NEAR = /Smart Placement runs the (?:account )?Worker (?:near|beside)|Under Smart Placement,? the (?:account )?Worker runs (?:near|beside)|runs under Smart Placement,? (?:near|beside)/i;

test('D1-NEAR the placement: the account Worker\'s one [placement] table names its region alone - beside the primary, the region the record names - never `mode = "smart"`, and no page of the bible says Smart Placement runs it beside its database (mutants: SCALE1\'s smart placement back; the Worker placed in Sydney; the table dropped; SCALE1\'s sentence back on the record\'s page)', () => {
  const toml = src('server-account/wrangler.toml');
  assert.equal(toml.match(/^\[placement\]$/gm)?.length ?? 0, 1, 'one [placement] table');
  const placement = tomlTable(toml, 'placement');
  // `region` alone: `mode`, `host` and `hostname` are Cloudflare's other kinds of placement, and each is mutually
  // exclusive with it - Smart Placement is the one that ran the Worker in Sydney
  assert.deepEqual(placement, { region: 'aws:us-west-1' });
  for (const l of toml.split('\n')) if (!l.trim().startsWith('#')) assert.doesNotMatch(l, /^\s*mode\s*=\s*"smart"/, 'no live line asks for Smart Placement');

  // THE RECORD NAMES THE SAME REGION, and why: the measurement it was chosen by
  const arc = src('bible/11-Multiplayer/Scale-Arc.md');
  const at = arc.indexOf('\n## D1-NEAR: built');
  assert.ok(at >= 0, 'Scale-Arc.md carries the D1-NEAR record');
  const record = arc.slice(at, arc.indexOf('\n## ', at + 1));
  assert.ok(record.includes(`[placement] region = "${placement.region}"`), 'the record names the region the toml holds');
  assert.match(record, /remote-SYD/, 'the record carries the placement it measured');
  assert.match(record, /\| `\/v1\/seats\/sieges\/live` - one statement, on the primary \|/, 'and the statement it measured it with');

  // NO PAGE SAYS IT ANY MORE - the claim three records leaned on, retired where it stood
  const said = markdownUnder('bible').filter((f) => SMART_NEAR.test(src(f)));
  assert.deepEqual(said, [], 'a page of the bible still says Smart Placement runs the account Worker beside its database');
  assert.doesNotMatch(toml, SMART_NEAR, 'nor does the config it describes');
  assert.ok(SMART_NEAR.test('Smart Placement runs the Worker near its database.'), 'the pin reads SCALE1\'s own sentence');
});

/** A step's `run:` block, as the runner sees it (its indentation shed). */
function stepRun(yml, stepName) {
  const at = yml.indexOf(`- name: ${stepName}\n`);
  assert.ok(at >= 0, `no step named "${stepName}"`);
  const from = yml.indexOf('run: |\n', at) + 'run: |\n'.length;
  const lines = [];
  for (const l of yml.slice(from).split('\n')) {
    if (l.trim() && !l.startsWith('          ')) break;
    lines.push(l.slice(10));
  }
  return lines.join('\n');
}

test('D1-NEAR the deploy says where the Worker answers from and what a statement costs it there: after the health check, five answers\' `cf-placement` into the run\'s summary - an HTTP/2 header in lower case and an HTTP/1.1 one capitalised alike, an answer without it `none` - and one statement\'s cost, the median one-statement read on the primary less the median health, the deploy\'s own base asked; a REPORT, never a gate: a curl that reaches nothing ends the step green, its cost unmeasured (mutants: the summary unwritten; the header read case-sensitively; an answer without the header unsaid; the cost not less the health; the slowest answer taken for the middle)', () => {
  const WF = '.github/workflows/account-deploy.yml';
  const wf = src(WF);
  const name = 'Report where the account Worker runs';
  assert.ok(wf.indexOf('- name: Verify /v1/health names this deploy') < wf.indexOf(`- name: ${name}`), 'reported once the deploy is known to have taken');
  const step = stepRun(wf, name);
  assert.match(step, /worker="\$\{\{ steps\.deploy\.outputs\.base \}\}"/, 'the host the deploy step said, never typed');
  assert.doesNotMatch(step, /exit [1-9]|::error::/, 'a report never fails the deploy');
  // the job's own shell (`defaults: run: shell: bash`) - GitHub runs it `bash --noprofile --norc -eo pipefail`
  assert.match(wf, /\n {4}defaults:\n {6}run:\n {8}shell: bash\n/);

  // RUN AS THE RUNNER RUNS IT, over a curl that answers as the deployed Worker's edge does: its headers for `-D -`, and
  // its `-w` with the time each answer took - the health's and the one-statement read's, an outlier in each
  const dir = mkdtempSync(join(tmpdir(), 'd1near-'));
  writeFileSync(join(dir, 'curl'), `#!/usr/bin/env bash
url=""; dump=""; fmt=""
while [ $# -gt 0 ]; do case "$1" in -o|--max-time) shift 2;; -D) dump="$2"; shift 2;; -w) fmt="$2"; shift 2;; -*) shift;; *) url="$1"; shift;; esac; done
echo "$url|$dump" >> "$FAKE_DIR/asked"
case "$url" in */v1/health) kind=health;; *) kind=read;; esac
n=$(( $(cat "$FAKE_DIR/$kind" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$FAKE_DIR/$kind"
took() { printf "$(printf '%s' "$fmt" | sed "s/%{time_total}/$1/")"; }
if [ "$FAKE_MODE" = down ]; then echo "curl: (7) Failed to connect" >&2; took 0.000123; exit 7; fi
if [ "$kind" = read ]; then took "$(echo 0.086 0.900 0.085 0.087 0.084 | cut -d' ' -f"$n")"; exit 0; fi
case "$n" in
  1|2|3) printf 'HTTP/2 200 \\r\\ncontent-type: application/json; charset=utf-8\\r\\ncf-placement: remote-SJC\\r\\n\\r\\n';;
  4) printf 'HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nCF-Placement: local-SJC\\r\\n\\r\\n';;
  *) printf 'HTTP/2 200 \\r\\ncontent-type: application/json\\r\\n\\r\\n';;
esac
took "$(echo 0.081 0.079 0.300 0.080 0.082 | cut -d' ' -f"$n")"
`);
  chmodSync(join(dir, 'curl'), 0o755);
  const run = (mode) => {
    const fake = mkdtempSync(join(dir, `${mode}-`));
    const summary = join(fake, 'summary.md');
    writeFileSync(summary, '');
    const script = step.replaceAll('${{ steps.deploy.outputs.base }}', 'https://accounts.example');
    const r = spawnSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', script], {
      cwd: ROOT, encoding: 'utf8', env: { PATH: `${dir}:${process.env.PATH}`, FAKE_DIR: fake, FAKE_MODE: mode, GITHUB_STEP_SUMMARY: summary },
    });
    return { ...r, summary: readFileSync(summary, 'utf8'), asked: existsSync(join(fake, 'asked')) ? readFileSync(join(fake, 'asked'), 'utf8').trim().split('\n') : [] };
  };
  const ASKED = Array.from({ length: 5 }, () => ['https://accounts.example/v1/health|-', 'https://accounts.example/v1/seats/sieges/live|']).flat();

  const up = run('up');
  assert.equal(up.status, 0, up.stderr);
  assert.deepEqual(up.asked, ASKED, 'five of each from the deployed Worker: the health with its headers, the one-statement read');
  // the middle of 0.079 0.080 0.081 0.082 0.300 is 81 ms, of 0.084 0.085 0.086 0.087 0.900 is 86: the statement 5 ms
  const said = 'one statement on the primary costs it ~5 ms (medians of five: /v1/seats/sieges/live 86 ms, /v1/health 81 ms)';
  assert.ok(up.stdout.includes(`cf-placement over five answers: remote-SJC remote-SJC remote-SJC local-SJC none; ${said}\n`), up.stdout);
  assert.match(up.summary, /^### Where the account Worker runs\n/m);
  assert.ok(up.summary.includes('`cf-placement` over five answers to /v1/health: remote-SJC remote-SJC remote-SJC local-SJC none (wrangler.toml'), up.summary);
  assert.ok(up.summary.includes(`From there, ${said} - a few ms beside the primary, 150 and more across an ocean.`), up.summary);

  const down = run('down');
  assert.equal(down.status, 0, `a curl that reaches nothing still ends the step green: ${down.stderr}`);
  assert.deepEqual(down.asked, ASKED);
  assert.ok(down.summary.includes('over five answers to /v1/health: none none none none none ('), down.summary);
  assert.ok(down.summary.includes('From there, one statement\'s cost unmeasured - the reads did not answer'), down.summary);
});
