// Push a rendered post (JPG slides + its source files) to GitHub and print the public image URLs.
// Usage: node engine/publish.mjs posts/<id>
// Writes posts/<id>/media.json = { id, branch, urls: [...] } and prints the same JSON.
// Exit code != 0 means the images are NOT reachable; do not schedule the post.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, REPO, commitAndPush, git } from './git.mjs';
import { checkCaptionFile } from './caption.mjs';

const postDir = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(postDir, 'post.json'))) {
  console.error(`no post.json in ${postDir}`);
  process.exit(1);
}
const rel = path.relative(ROOT, postDir).replace(/\\/g, '/');
if (!rel.startsWith('posts/')) {
  console.error(`post folder must be inside ${ROOT}/posts (got ${postDir})`);
  process.exit(1);
}
const id = path.basename(postDir);
const slides = fs
  .readdirSync(postDir)
  .filter((f) => /^slide_\d+\.jpg$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
if (!slides.length) {
  console.error('no slide_N.jpg files - run render.mjs first');
  process.exit(1);
}

// The same caption goes to Instagram, Threads and Facebook in one Metricool post. Clean it in place
// (invisible characters, em dashes, curly quotes) and stop before pushing if it breaks a rule:
// exit 5 = over Threads' 500, exit 6 = more than 5 hashtags or a link.
const captionFile = path.join(postDir, 'caption.txt');
if (!fs.existsSync(captionFile)) {
  console.error('no caption.txt');
  process.exit(1);
}
const caption = checkCaptionFile(captionFile);
for (const w of caption.report.warnings) console.error(`caption warning: ${w}`);
if (caption.exitCode) {
  console.error(`caption.txt: ${caption.report.errors.join('; ')} - fix it and run again`);
  process.exit(caption.exitCode);
}

const files = [...slides, 'post.json', 'caption.txt', 'sources.txt']
  .filter((f) => fs.existsSync(path.join(postDir, f)))
  .map((f) => `${rel}/${f}`);

let result;
try {
  result = commitAndPush(files, `post ${id}`);
} catch (e) {
  console.error(e.message);
  process.exit(3);
}

// Pin URLs to the commit, not the branch: a re-rendered slide with the same file name then gets a
// new URL, so Metricool never picks up a stale cached copy.
const sha = git('rev-parse', 'HEAD').trim();
const raw = `https://raw.githubusercontent.com/${REPO}/${sha}`;
const urls = slides.map((f) => `${raw}/${rel}/${f}`);

// raw.githubusercontent.com can lag a few seconds behind a push; wait until every image answers.
async function reachable(url) {
  for (let i = 0; i < 18; i++) {
    try {
      const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (r.ok && (r.headers.get('content-type') || '').startsWith('image/')) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 5000));
  }
  return false;
}
const bad = [];
for (const u of urls) if (!(await reachable(u))) bad.push(u);
if (bad.length) {
  console.error(`not reachable: ${bad.join(', ')}`);
  process.exit(4);
}

const out = { id, branch: result.branch, commit: sha, urls, caption: caption.report };
fs.writeFileSync(path.join(postDir, 'media.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out));
