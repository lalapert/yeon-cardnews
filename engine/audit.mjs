// Weekly performance audit for @yeon.virel (Instagram / Threads / Facebook), after the ig-audit skill in
// github.com/Jakeschincariol/instagram-agent-skill (MIT): rank by each network's own median, not raw
// views, and look at saves and shares per reach. The numbers come from Metricool; this script does the
// arithmetic so the weekly run never does it in its head.
//
// Usage:
//   node engine/audit.mjs fields
//       -> the Metricool metric ids to request, per network, in the order this script reads them
//   node engine/audit.mjs report state/audit/raw/<date>.json [--notes notes.md] [--no-push]
//       -> writes state/audit/<date>.md (and commits + pushes state/audit unless --no-push)
//
// Raw file format (rows exactly as getAnalyticsDataByMetrics returns them, one array per network):
//   { "fetchedAt": "<ISO>", "from": "<ISO>", "to": "<ISO>", "instagram": [[...]], "threads": [[...]], "facebook": [[...]] }
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, commitAndPush } from './git.mjs';

export const FIELDS = {
  instagram: {
    ids: ['IGPO02', 'IGPO06', 'IGPO03', 'IGPO07', 'IGPO14', 'IGPO28', 'IGPO13', 'IGPO08', 'IGPO15', 'IGPO27', 'IGPO29'],
    names: ['time', 'url', 'text', 'type', 'reach', 'views', 'likes', 'comments', 'saves', 'shares', 'follows'],
  },
  threads: {
    ids: ['THPO02', 'THPO06', 'THPO03', 'THPO08', 'THPO09', 'THPO10', 'THPO11', 'THPO12', 'THPO13'],
    names: ['time', 'url', 'text', 'reach', 'likes', 'comments', 'reposts', 'quotes', 'shares'], // reach = views
  },
  facebook: {
    ids: ['FBPO02', 'FBPO06', 'FBPO03', 'FBPO12', 'FBPO11', 'FBPO13', 'FBPO08', 'FBPO14', 'FBPO23'],
    names: ['time', 'url', 'text', 'reach', 'impressions', 'likes', 'comments', 'shares', 'clicks'], // likes = reactions
  },
};
export const MIN_POSTS = 30; // below this, report numbers but draw no conclusions
export const MIN_MEDIAN_REACH = 30; // below this, per-reach ratios are noise
const MATURE_H = 48; // Metricool lags and posts keep collecting for a day or two

const num = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v) || 0);
const median = (a) => {
  const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const key = (text) => (text || '').normalize('NFC').replace(/[^\p{L}\p{N}]/gu, '').slice(0, 30);
const parseTime = (t) => {
  const m = String(t).match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/); // Metricool sends UTC
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : new Date(t);
};
const kst = (d) => new Date(d.getTime() + 9 * 3600e3);
const fmtKst = (d) => kst(d).toISOString().slice(5, 16).replace('T', ' ');
const pct = (a, b) => (b > 0 ? `${((100 * a) / b).toFixed(1)}%` : '-');
const x1 = (v) => (Number.isFinite(v) ? `${v.toFixed(1)}x` : '-');
const cut = (s, n) => {
  const t = (s || '').split('\n').find((l) => l.trim()) || '';
  return [...t].length > n ? [...t].slice(0, n).join('') + '…' : t;
};

// Our own posts: caption key -> post id and the bits worth grouping by.
function ourPosts() {
  const dir = path.join(ROOT, 'posts');
  const out = new Map();
  for (const id of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const cap = path.join(dir, id, 'caption.txt');
    const pj = path.join(dir, id, 'post.json');
    if (!fs.existsSync(cap) || !fs.existsSync(pj)) continue;
    let post = {};
    try {
      post = JSON.parse(fs.readFileSync(pj, 'utf8'));
    } catch {}
    const cover = post.slides?.[0] || {};
    const coverKind = ['number', 'change', 'vs', 'stamps'].find((k) => cover[k]) || 'text';
    const hashtags = (fs.readFileSync(cap, 'utf8').match(/(?:^|\s)#[\p{L}\p{N}_]+/gu) || []).length;
    out.set(key(fs.readFileSync(cap, 'utf8')), {
      id,
      category: post.category || '-',
      urgency: post.urgency || 'normal',
      slides: post.slides?.length || 0,
      coverKind,
      hashtags,
    });
  }
  return out;
}

export function buildReport(raw, notes = '') {
  const fetched = new Date(raw.fetchedAt || Date.now());
  const ours = ourPosts();
  const posts = new Map(); // caption key -> merged row
  for (const net of ['instagram', 'threads', 'facebook']) {
    const names = FIELDS[net].names;
    for (const r of raw[net] || []) {
      const row = Object.fromEntries(names.map((n, i) => [n, r[i]]));
      const k = key(row.text) || row.url;
      const at = parseTime(row.time);
      const p = posts.get(k) || { key: k, at, text: row.text, meta: ours.get(k) || null };
      if (at < p.at) p.at = at;
      p[net] = {
        url: row.url,
        type: row.type || '',
        reach: num(row.reach),
        likes: num(row.likes),
        comments: num(row.comments),
        saves: num(row.saves),
        shares: num(row.shares) + num(row.reposts) + num(row.quotes),
        follows: num(row.follows),
      };
      posts.set(k, p);
    }
  }
  const all = [...posts.values()].sort((a, b) => b.at - a.at);
  for (const p of all) p.ageH = (fetched - p.at) / 3600e3;
  const mature = all.filter((p) => p.ageH >= MATURE_H);
  const young = all.filter((p) => p.ageH < MATURE_H);

  const med = {};
  for (const net of ['instagram', 'threads', 'facebook']) med[net] = median(mature.filter((p) => p[net]).map((p) => p[net].reach));
  for (const p of mature) {
    p.mult = {};
    for (const net of ['instagram', 'threads', 'facebook'])
      p.mult[net] = p[net] && med[net] > 0 ? p[net].reach / med[net] : NaN;
  }
  const ig = mature.filter((p) => p.instagram);
  const oursMature = mature.filter((p) => p.meta);
  const tooFew = oursMature.length < MIN_POSTS;
  const tooSmall = med.instagram < MIN_MEDIAN_REACH;

  const L = [];
  const date = kst(fetched).toISOString().slice(0, 10);
  L.push(`# 주간 성과 점검 ${date}`, '');
  L.push(`데이터: Metricool, ${raw.from || '?'} ~ ${raw.to || '?'} · 가져온 시각 ${fmtKst(fetched)} KST`);
  const count = (net, rows) => rows.filter((p) => p[net]).length;
  L.push(
    `게시물: 인스타 ${count('instagram', all)} · 쓰레드 ${count('threads', all)} · 페북 ${count('facebook', all)}` +
      ` (48시간 지난 것 인스타 ${count('instagram', mature)}개, 그중 이 저장소 카드뉴스 ${oursMature.length}개)`,
    '',
    '이 저장소 카드뉴스는 세 곳에 같은 캡션이 나가서 한 줄로 묶인다. 이전 방식 게시물은 네트워크마다 캡션이 달라 따로 잡힌다.',
    ''
  );
  L.push('## 판정', '');
  if (tooFew || tooSmall) {
    L.push(`**판단 보류.** ${[
      tooFew ? `이 저장소 카드뉴스가 ${oursMature.length}개뿐이다 (${MIN_POSTS}개 필요)` : '',
      tooSmall ? `인스타 도달 중앙값이 ${med.instagram}명이라 비율 지표가 잡음 수준이다 (${MIN_MEDIAN_REACH}명 이상 필요)` : '',
    ].filter(Boolean).join('. ')}. 아래 숫자는 기록용이며 지침을 바꿀 근거로 쓰지 않는다.`, '');
  } else {
    L.push('표본과 도달이 기준을 넘었다. 아래 표와 관찰을 근거로 볼 수 있다. 지침 변경은 대표 확인 후에만 한다.', '');
  }

  L.push('## 네트워크별 기준값 (48시간 지난 게시물)', '');
  L.push('| 네트워크 | 게시물 | 도달 중앙값 | 도달 합계 | 저장/도달 | 공유/도달 | 팔로우/도달 |', '|---|---|---|---|---|---|---|');
  for (const net of ['instagram', 'threads', 'facebook']) {
    const rows = mature.filter((p) => p[net]);
    const sum = (f) => rows.reduce((s, p) => s + p[net][f], 0);
    const reach = sum('reach');
    L.push(`| ${net} | ${rows.length} | ${med[net]} | ${reach} | ${net === 'instagram' ? pct(sum('saves'), reach) : '-'} | ${pct(sum('shares'), reach)} | ${net === 'instagram' ? pct(sum('follows'), reach) : '-'} |`);
  }
  L.push('', '쓰레드의 "도달"은 조회수(views)다. 배수 = 그 게시물 도달 ÷ 그 네트워크 도달 중앙값.', '');

  const line = (p) =>
    `| ${fmtKst(p.at)} | ${p.meta ? p.meta.id : '(이전 방식)'} | ${cut(p.text, 24).replace(/\|/g, '/')} | ${p.instagram?.reach ?? '-'} | ${x1(p.mult.instagram)} | ${p.instagram?.saves ?? '-'} | ${p.instagram?.shares ?? '-'} | ${p.instagram?.follows ?? '-'} | ${p.threads?.reach ?? '-'} | ${p.facebook?.reach ?? '-'} |`;
  const head = '| 게시(KST) | 게시물 | 첫 줄 | IG 도달 | IG 배수 | 저장 | 공유 | 팔로우 | 쓰레드 조회 | 페북 도달 |\n|---|---|---|---|---|---|---|---|---|---|';
  const ranked = [...ig].sort((a, b) => (b.mult.instagram || 0) - (a.mult.instagram || 0) || b.instagram.saves + b.instagram.shares - (a.instagram.saves + a.instagram.shares));
  L.push('## 인스타 배수 상위 5', '', head, ...ranked.slice(0, 5).map(line), '');
  const bottom = ranked.slice(Math.max(5, ranked.length - 5)).reverse(); // never repeat a top-5 row
  if (bottom.length) L.push('## 인스타 배수 하위 5', '', head, ...bottom.map(line), '');

  const group = (title, fn) => {
    const g = new Map();
    for (const p of ig) {
      const k = fn(p);
      if (k === null) continue;
      g.set(k, [...(g.get(k) || []), p]);
    }
    if (!g.size) return;
    L.push(`### ${title}`, '', '| 구분 | n | IG 배수 평균 | IG 도달 중앙값 | 저장/도달 | 공유/도달 |', '|---|---|---|---|---|---|');
    for (const [k, rows] of [...g.entries()].sort((a, b) => b[1].length - a[1].length)) {
      const reach = rows.reduce((s, p) => s + p.instagram.reach, 0);
      const mean = rows.reduce((s, p) => s + (p.mult.instagram || 0), 0) / rows.length;
      L.push(`| ${k} | ${rows.length} | ${x1(mean)} | ${median(rows.map((p) => p.instagram.reach))} | ${pct(rows.reduce((s, p) => s + p.instagram.saves, 0), reach)} | ${pct(rows.reduce((s, p) => s + p.instagram.shares, 0), reach)} |`);
    }
    L.push('');
  };
  L.push('## 묶어서 보기 (인스타, 48시간 지난 게시물)', '', 'n이 5 미만인 줄은 우연일 가능성이 크다.', '');
  group('만든 방식', (p) => (p.meta ? '이 저장소 카드뉴스' : '이전 방식'));
  group('형식', (p) => (p.instagram.type || '-').replace('FEED_', '').toLowerCase());
  group('분야', (p) => (p.meta ? p.meta.category : null));
  group('표지 종류', (p) => (p.meta ? p.meta.coverKind : null));
  group('게시 시간대(KST)', (p) => {
    const h = kst(p.at).getUTCHours();
    return h < 7 ? '00-07' : h < 11 ? '07-11' : h < 15 ? '11-15' : h < 19 ? '15-19' : '19-24';
  });
  group('요일', (p) => '일월화수목금토'[kst(p.at).getUTCDay()]);

  if (young.length) {
    L.push('## 아직 집계 중 (48시간 안 됨, 순위에서 뺌)', '');
    for (const p of young) L.push(`- ${fmtKst(p.at)} ${p.meta ? p.meta.id : '(이전 방식)'}: IG ${p.instagram?.reach ?? '-'} · 쓰레드 ${p.threads?.reach ?? '-'} · 페북 ${p.facebook?.reach ?? '-'}`);
    L.push('');
  }
  L.push('## 이번 주 관찰', '', notes.trim() || '(없음)', '');
  return { date, markdown: L.join('\n'), summary: { posts: all.length, mature: mature.length, ours: oursMature.length, median: med, verdict: tooFew || tooSmall ? 'hold' : 'ok' } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, rawPath, ...rest] = process.argv.slice(2);
  if (cmd === 'fields') {
    console.log(JSON.stringify(Object.fromEntries(Object.entries(FIELDS).map(([n, f]) => [n, f.ids])), null, 2));
  } else if (cmd === 'report' && rawPath) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(rawPath), 'utf8'));
    const ni = rest.indexOf('--notes');
    const notes = ni >= 0 ? fs.readFileSync(path.resolve(rest[ni + 1]), 'utf8') : '';
    const { date, markdown, summary } = buildReport(raw, notes);
    const outDir = path.join(ROOT, 'state', 'audit');
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, `${date}.md`);
    fs.writeFileSync(out, markdown + '\n');
    if (!rest.includes('--no-push')) {
      try {
        commitAndPush(['state/audit'], `audit: ${date}`);
      } catch (e) {
        console.error(`WARN audit not pushed: ${e.message}`);
        process.exitCode = 3;
      }
    }
    console.log(JSON.stringify({ file: path.relative(ROOT, out), ...summary }));
  } else {
    console.error('usage: fields | report <raw.json> [--notes notes.md] [--no-push]');
    process.exit(1);
  }
}
