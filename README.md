# yeon-cardnews

News card-news generator and publisher for **@yeon.virel** — one Metricool post goes to Instagram, Threads and Facebook together.

- `GUIDE.md` — editorial rules and the step-by-step flow the hourly monitor follows
- `engine/` — `render.mjs` (post.json → 1080×1350 PNG/JPG via headless Chromium), `templates.mjs` (layouts, color themes),
  `publish.mjs` (push slides, print public image URLs), `state.mjs` (posting log + pacing)
- `posts/<id>/` — one carousel each: `post.json`, `caption.txt`, `sources.txt`, `slide_N.jpg`
- `state/` — `posted.jsonl` (what was scheduled) and `monitor.log` (every check)

Setup: `npm run setup` (installs playwright-core and Chromium). Fonts: Pretendard (SIL OFL 1.1, `engine/fonts/LICENSE.txt`).
