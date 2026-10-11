// D1-LOAD (2026-10-11, from play: the account service stayed slow after SEAT-CAP and SEAT-LEASE; the owner: "do
// whatever is the most detailed. I dont want band aid fixes") - WHAT IS FILLING THE ONE DATABASE, READ BY THE OPERATOR:
// tools/d1Load.mjs builds the Analytics Engine questions over the service's own metrics points (metrics.js) and
// .github/workflows/d1-load.yml asks them by hand, beside D1's query insights, writing nothing.
// bible/01-Overview/Field-Bugs-2026-10-11h.md D1-LOAD.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { DATASET, HOURS_MAX, QUESTIONS, loadHours, loadSql, loadTable } from '../tools/d1Load.mjs';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('D1-LOAD the questions: each over the service\'s own dataset and window, every count and sum weighted by the sample, the D1 wait (double5) in seconds most first, the minute row, the clock\'s jobs, the errors; the window whole hours 1 to a week, anything else refused before it reaches the SQL; an answer drawn as its columns, none said so, a refusal thrown (mutants: the weight; the wait\'s double; the order; the window\'s guard; the empty answer)', () => {
  assert.equal(DATASET, src('server-account/wrangler.toml').match(/\[\[analytics_engine_datasets\]\]\nbinding = "METRICS"\ndataset = "(\w+)"/)[1], 'the dataset the service writes');
  assert.deepEqual(QUESTIONS.map(([n]) => n), ['routes', 'minutes', 'cron', 'errors']);
  for (const [name] of QUESTIONS) {
    const sql = loadSql(name, 3);
    assert.match(sql, new RegExp(`FROM ${DATASET} WHERE timestamp > NOW\\(\\) - INTERVAL '3' HOUR`));
    assert.match(sql, / FORMAT JSON$/);
    for (const [sum] of sql.matchAll(/SUM\(.*? AS \w+/g)) assert.match(sum, /_sample_interval/, `${name}: ${sum} weighted by the sample`);
  }
  const routes = loadSql('routes', 1);
  assert.match(routes, /SUM\(double5 \* _sample_interval\) \/ 1000 AS d1_wait_s/, 'the D1 wait is double5, in seconds');
  assert.match(routes, /SUM\(double3 \* _sample_interval\) AS statements/);
  assert.match(routes, /ORDER BY d1_wait_s DESC/);
  assert.match(loadSql('minutes', 1), /toStartOfInterval\(timestamp, INTERVAL '1' MINUTE\) AS minute/);
  assert.match(loadSql('cron', 1), /AND blob2 = 'CRON'/, 'the clock\'s points (cron.js: `CRON` its method)');
  assert.match(loadSql('errors', 1), /NOT startsWith\(blob3, '2'\)/);
  assert.equal(loadHours(''), 1);
  assert.equal(loadHours(' 24 '), 24);
  assert.equal(loadHours(String(HOURS_MAX)), HOURS_MAX);
  for (const bad of ['0', String(HOURS_MAX + 1), '1.5', '-1', "1' HOUR; --", 'x']) assert.throws(() => loadSql('routes', bad), /not a window/, bad);
  assert.throws(() => loadSql('nope', 1), /no question/);
  const t = loadTable('routes', { data: [{ route: '/v1/heartbeat', method: 'POST', requests: '1200', d1_wait_s: '340.55', statements: 4800, rows_read: 0, rows_written: 2, p95_ms: 812.33 }] });
  assert.match(t, /\| route \| method \| requests \| d1_wait_s \| statements \| rows_read \| rows_written \| p95_ms \|/);
  assert.match(t, /\| \/v1\/heartbeat \| POST \| 1,200 \| 340\.6 \| 4,800 \| 0 \| 2 \| 812\.3 \|/);
  assert.match(loadTable('cron', { data: [] }), /No points in the window\./);
  assert.throws(() => loadTable('routes', { errors: [{ message: 'Authentication error' }] }), /carries no rows/);
});

/** A step's `run:` block, as the runner sees it. */
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

test('D1-LOAD the workflow: run by hand only, its one input read once as environment, its own queue, writing nothing; its metrics step, run here as the runner runs it over the SQL API\'s answers, draws every question into the summary and warns - never fails - on a refusal (mutants: the input spliced into a run line; a refusal drawn as a table)', () => {
  const wf = src('.github/workflows/d1-load.yml');
  const on = /\non:\n([\s\S]*?)\n\S/.exec(wf)?.[1] ?? '';
  assert.match(on, /^ {2}workflow_dispatch:/);
  assert.doesNotMatch(on, /push:|pull_request|schedule:/);
  assert.equal(wf.match(/\$\{\{ inputs\./g)?.length, 1, 'the one input, read once');
  assert.match(wf, /\n {6}HOURS: \$\{\{ inputs\.hours \}\}\n/);
  assert.match(wf, /\nconcurrency:\n {2}group: d1-load\n {2}cancel-in-progress: false\n/);
  assert.match(wf, /\npermissions:\n {2}contents: read\n/);
  assert.doesNotMatch(wf, /d1 create|migrations apply|wrangler deploy|d1 execute/, 'it creates, migrates, deploys and executes nothing');
  assert.match(stepRun(wf, 'Read D1\'s query insights'), /\$WRANGLER d1 insights "\$DB_NAME" --sort-type sum --sort-by time/);

  // THE METRICS STEP, run by bash over a curl that answers as the SQL API does - each question its own answer
  const dir = mkdtempSync(join(tmpdir(), 'd1load-'));
  const fake = join(dir, 'curl');
  writeFileSync(fake, `#!/usr/bin/env bash
out=""; data=""
while [ $# -gt 0 ]; do case "$1" in -o) out="$2"; shift 2;; --data-binary) data="$2"; shift 2;; *) shift;; esac; done
sql=$(cat "\${data#@}")
case "$sql" in *"blob2 = 'CRON'"*) cp "$FAKE_DIR/cron.json" "$out"; echo -n "$FAKE_CODE";; *) echo '{"data":[]}' > "$out"; echo -n 200;; esac
`);
  chmodSync(fake, 0o755);
  const root = new URL('..', import.meta.url).pathname;
  const run = (cronAnswer, code) => {
    writeFileSync(join(dir, 'cron.json'), JSON.stringify(cronAnswer));
    const summary = join(dir, `summary-${code}.md`);
    writeFileSync(summary, '');
    const out = execFileSync('bash', ['-c', `set -euo pipefail\n${stepRun(wf, 'Read the service\'s metrics')}`], {
      cwd: root, encoding: 'utf8',
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, FAKE_DIR: dir, FAKE_CODE: code, HOURS: '2', RUNNER_TEMP: dir, GITHUB_STEP_SUMMARY: summary, CLOUDFLARE_API_TOKEN: 'x' },
    });
    return { out, summary: readFileSync(summary, 'utf8') };
  };
  const ok = run({ data: [{ job: 'cron:seats', firings: 60, failed: 0, d1_wait_s: 1.5, statements: 60, changed: 0, p95_ms: 40 }] }, '200');
  assert.match(ok.summary, /\*\*Window: the last 2 hour\(s\)/);
  for (const [, title] of QUESTIONS) assert.ok(ok.summary.includes(`**${title}**`), title);
  assert.match(ok.summary, /\| cron:seats \| 60 \| 0 \| 1\.5 \| 60 \| 0 \| 40 \|/);
  const refused = run({ success: false, errors: [{ message: 'Authentication error' }] }, '403');
  assert.doesNotMatch(refused.summary, /\*\*The clock's jobs\*\*/, 'a refusal is never drawn as a table');
  assert.match(refused.out, /::warning::the cron question was refused \(HTTP 403\)/);
  assert.match(refused.summary, /\*\*Minute by minute\*\*/, 'the other questions still answer');
});
