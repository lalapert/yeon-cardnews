// Caption checks shared by publish.mjs, adapted for Korean from the caption linter and humanizer in
// github.com/Jakeschincariol/instagram-agent-skill (MIT): the same caption.txt goes to Instagram,
// Threads and Facebook, so it has to fit all three.
// Usage: node engine/caption.mjs posts/<id>   -> cleans caption.txt in place, prints the report,
//                                               exit 5 = too long for Threads, 6 = breaks a caption rule
import fs from 'node:fs';
import path from 'node:path';

export const THREADS_MAX = 500; // Threads text limit; emoji count as their UTF-8 bytes
export const HASHTAG_MAX = 5; // Instagram cap since December 2025

// Threads counts emoji by UTF-8 bytes. Count symbols/emoji that way and everything else as 1.
export function threadsLength(text) {
  let n = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const plain = cp < 0x2000 || (cp >= 0x3000 && cp <= 0xd7ff) || (cp >= 0xff00 && cp <= 0xffef);
    n += plain ? 1 : Buffer.byteLength(ch, 'utf8');
  }
  return n;
}

// Invisible characters a keyboard does not type. ZWJ (U+200D) and VS16 (U+FE0F) are kept because
// emoji such as ✔️ need them.
const INVISIBLE = /[​‌⁠﻿­᠎⁡-⁤⁪-⁯]/g;
const ODD_SPACE = /[     ]/g;
// Typography that reads as machine-written in Korean text. The Korean middle dot (·) and arrows stay.
const TYPO = [
  [/\s*[—―]\s*/g, ', ', 'em dash -> comma'],
  [/–/g, '-', 'en dash -> hyphen'],
  [/[“”„]/g, '"', 'curly double quote -> "'],
  [/[‘’]/g, "'", "curly single quote -> '"],
  [/…/g, '...', 'ellipsis -> ...'],
];

export function cleanCaption(raw) {
  const changes = [];
  let t = raw.replace(/\r\n?/g, '\n');
  const inv = t.match(INVISIBLE);
  if (inv) changes.push(`${inv.length} invisible character(s) removed`);
  t = t.replace(INVISIBLE, '');
  const sp = t.match(ODD_SPACE);
  if (sp) changes.push(`${sp.length} non-breaking/thin space(s) -> space`);
  t = t.replace(ODD_SPACE, ' ');
  for (const [re, to, label] of TYPO) {
    const m = t.match(re);
    if (m) changes.push(`${m.length}x ${label}`);
    t = t.replace(re, to);
  }
  t = t
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: t, changes };
}

export function lintCaption(text) {
  const errors = [];
  const warnings = [];
  const hashtags = [...text.matchAll(/(?:^|\s)#([\p{L}\p{N}_]+)/gu)].map((m) => '#' + m[1]);
  const length = threadsLength(text);
  if (length > THREADS_MAX) errors.push({ code: 5, msg: `${length} characters (Threads count) > ${THREADS_MAX}` });
  if (hashtags.length > HASHTAG_MAX)
    errors.push({ code: 6, msg: `${hashtags.length} hashtags > ${HASHTAG_MAX} (Instagram cap): ${hashtags.join(' ')}` });
  if (/https?:\/\/|www\./i.test(text)) errors.push({ code: 6, msg: 'link in the caption (not clickable on Instagram)' });
  const first = text.split('\n')[0] || '';
  if (/^[#\p{Extended_Pictographic}]/u.test(first)) warnings.push('first line starts with a hashtag or emoji');
  if ([...first].length > 70) warnings.push(`first line is ${[...first].length} characters; the feed cuts it off`);
  if (!/\d/.test(first)) warnings.push('no number in the first line');
  return { length, hashtags, errors, warnings };
}

// Clean caption.txt in place and lint it. Returns { exitCode, report }.
export function checkCaptionFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { text, changes } = cleanCaption(raw);
  if (text + '\n' !== raw) fs.writeFileSync(file, text + '\n');
  const lint = lintCaption(text);
  const exitCode = lint.errors.length ? Math.min(...lint.errors.map((e) => e.code)) : 0;
  return { exitCode, report: { length: lint.length, max: THREADS_MAX, hashtags: lint.hashtags.length, cleaned: changes, errors: lint.errors.map((e) => e.msg), warnings: lint.warnings } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = path.resolve(process.argv[2] || '');
  const file = fs.existsSync(path.join(dir, 'caption.txt')) ? path.join(dir, 'caption.txt') : dir;
  if (!fs.existsSync(file)) {
    console.error(`no caption.txt in ${dir}`);
    process.exit(1);
  }
  const { exitCode, report } = checkCaptionFile(file);
  console.log(JSON.stringify(report, null, 2));
  process.exit(exitCode);
}
