// Posting log + pacing rules for the @yeon.virel news monitor. The log lives in git (state/),
// so every run — on the PC or in the cloud — sees what earlier runs posted.
// Usage:
//   node engine/state.mjs status                                -> posted today, left today, can we post now?
//   node engine/state.mjs record posts/<id> <plannerUrl> <scheduledAtISO> [metricoolId] [uuid]
//   node engine/state.mjs update <id> key=value ...             -> fix a logged row (e.g. scheduledAt after a reschedule)
//   node engine/state.mjs skip "<reason>"                       -> log a check that posted nothing
// record / update / skip commit and push state/ (add --no-push to skip that, e.g. for tests).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, commitAndPush } from './git.mjs';

const STATE = path.join(ROOT, 'state');
const POSTED = path.join(STATE, 'posted.jsonl');
const LOG = path.join(STATE, 'monitor.log');
export const MAX_PER_DAY = 6;
export const MIN_GAP_MIN = 120; // breaking news may ignore the gap, never the daily cap

fs.mkdirSync(STATE, { recursive: true });

const argv = process.argv.slice(2);
const noPush = argv.includes('--no-push');
const [cmd, ...args] = argv.filter((a) => a !== '--no-push');
const now = new Date();
const kstDay = (d) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
const kstNow = () => new Date(now.getTime() + 9 * 3600e3).toISOString().replace(/\.\d+Z$/, '+09:00');

function readPosted() {
  if (!fs.existsSync(POSTED)) return [];
  return fs
    .readFileSync(POSTED, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}
function writePosted(rows) {
  fs.writeFileSync(POSTED, rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''));
}
function sync(message) {
  if (noPush) return;
  try {
    commitAndPush(['state'], message);
  } catch (e) {
    console.error(`WARN state not pushed: ${e.message}`);
    process.exitCode = 3;
  }
}

if (cmd === 'status') {
  const all = readPosted().filter((p) => p.status !== 'cancelled');
  const live = all.filter((p) => p.status !== 'draft');
  const today = live.filter((p) => kstDay(new Date(p.scheduledAt)) === kstDay(now));
  const past = live.filter((p) => new Date(p.scheduledAt) <= now);
  const last = past.length ? past[past.length - 1] : null;
  const upcoming = live.filter((p) => new Date(p.scheduledAt) > now);
  const minsSinceLast = last ? Math.round((now - new Date(last.scheduledAt)) / 60000) : null;
  const gapOk = !upcoming.length && (minsSinceLast === null || minsSinceLast >= MIN_GAP_MIN);
  const recent = all.filter((p) => Math.abs(now - new Date(p.scheduledAt)) < 3 * 86400e3);
  console.log(
    JSON.stringify(
      {
        nowKST: kstNow(),
        postedToday: today.length,
        leftToday: Math.max(0, MAX_PER_DAY - today.length),
        minsSinceLastPost: minsSinceLast,
        upcomingScheduled: upcoming.map((p) => ({ at: p.scheduledAt, headline: p.headline })),
        gapOk,
        canPostNormal: today.length < MAX_PER_DAY && gapOk,
        canPostBreaking: today.length < MAX_PER_DAY,
        recentTopics: recent.map((p) => ({ at: p.scheduledAt, status: p.status || 'scheduled', topic: p.topic, headline: p.headline, keywords: p.keywords })),
      },
      null,
      2
    )
  );
} else if (cmd === 'record') {
  const [dir, plannerUrl, scheduledAt, metricoolId, uuid] = args;
  const postDir = path.resolve(dir);
  const post = JSON.parse(fs.readFileSync(path.join(postDir, 'post.json'), 'utf8'));
  const mediaFile = path.join(postDir, 'media.json');
  const media = fs.existsSync(mediaFile) ? JSON.parse(fs.readFileSync(mediaFile, 'utf8')) : {};
  const row = {
    id: path.basename(postDir),
    topic: post.topic || '',
    keywords: post.keywords || [],
    headline: (post.slides?.[0]?.headline || []).map((l) => l.replace(/^!/, '')).join(' '),
    urgency: post.urgency || 'normal',
    status: 'scheduled',
    scheduledAt: scheduledAt || kstNow(),
    plannerUrl: plannerUrl || '',
    metricoolId: metricoolId || '',
    uuid: uuid || '',
    media: media.urls || [],
  };
  const rows = readPosted().filter((r) => r.id !== row.id);
  rows.push(row);
  writePosted(rows);
  fs.appendFileSync(LOG, `${kstNow()} POSTED ${row.id} @${row.scheduledAt} ${row.headline}\n`);
  sync(`state: scheduled ${row.id}`);
  console.log(JSON.stringify(row));
} else if (cmd === 'update') {
  const [id, ...pairs] = args;
  const rows = readPosted();
  const row = rows.find((r) => r.id === id);
  if (!row) {
    console.error(`no logged post with id ${id}`);
    process.exit(1);
  }
  for (const p of pairs) {
    const i = p.indexOf('=');
    row[p.slice(0, i)] = p.slice(i + 1);
  }
  writePosted(rows);
  fs.appendFileSync(LOG, `${kstNow()} UPDATE ${id} ${pairs.join(' ')}\n`);
  sync(`state: update ${id}`);
  console.log(JSON.stringify(row));
} else if (cmd === 'skip') {
  fs.appendFileSync(LOG, `${kstNow()} SKIP ${args.join(' ')}\n`);
  sync('state: check (no post)');
  console.log('logged');
} else {
  console.error('usage: status | record <dir> <plannerUrl> <scheduledAt> [metricoolId] [uuid] | update <id> k=v ... | skip "<reason>"');
  process.exit(1);
}
