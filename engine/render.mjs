// Render a card-news post folder to PNG slides.
// Usage: node render.mjs <post-folder> [scale]
//   <post-folder>/post.json  -> <post-folder>/slide_N.png + slide_N.jpg (1080x1350; scale 2 -> 2160x2700)
// Exit code 2 = a slide has a font or overflow problem (warnings are printed); fix post.json and re-run.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildSlide } from './templates.mjs';

const postDir = path.resolve(process.argv[2] || '.');
const scale = Number(process.argv[3] || 1);
const post = JSON.parse(fs.readFileSync(path.join(postDir, 'post.json'), 'utf8'));
const htmlDir = path.join(postDir, 'html');
fs.mkdirSync(htmlDir, { recursive: true });

// Use an installed Chrome/Edge (Windows PC) or Playwright's own Chromium (cloud: `npx playwright-core install --with-deps chromium`).
async function launch() {
  for (const opt of [{ channel: 'chrome' }, { channel: 'msedge' }, {}]) {
    try {
      return await chromium.launch({ ...opt, headless: true });
    } catch {}
  }
  throw new Error('no Chromium found - run: npx playwright-core install --with-deps chromium');
}
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: scale });
const page = await ctx.newPage();
const total = post.slides.length;
let problems = 0;

for (let i = 0; i < total; i++) {
  const s = post.slides[i];
  if (s.image && !fs.existsSync(path.resolve(postDir, s.image))) {
    console.warn(`WARN slide ${i + 1}: image missing (${s.image}) - using code visual`);
    delete s.image;
  }
  const file = path.join(htmlDir, `slide_${i + 1}.html`);
  fs.writeFileSync(file, buildSlide(post, s, i, total, postDir));
  await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
  const report = await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((im) => (im.complete ? 1 : new Promise((r) => (im.onload = im.onerror = r))))
    );
    const overflow = window.__fit();
    return { font: document.fonts.check('900 40px Pretendard'), overflow };
  });
  if (!report.font) {
    console.warn(`WARN slide ${i + 1}: Pretendard font did not load`);
    problems++;
  }
  if (report.overflow.length) {
    console.warn(`WARN slide ${i + 1}: text still overflows -> ${report.overflow.join(', ')}`);
    problems++;
  }
  const base = path.join(postDir, scale === 1 ? `slide_${i + 1}` : `slide_${i + 1}@${scale}x`);
  const clip = { x: 0, y: 0, width: 1080, height: 1350 };
  await page.screenshot({ path: `${base}.png`, clip });
  // Instagram's publishing API only accepts JPEG, so this is the file that gets posted.
  await page.screenshot({ path: `${base}.jpg`, clip, type: 'jpeg', quality: 95 });
  console.log(`${base}.png`);
}

await browser.close();
process.exit(problems ? 2 : 0);
