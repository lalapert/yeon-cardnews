// Card-news slide templates (1080x1350, Instagram 4:5) for @yeon.virel.
// Every slide is plain HTML/CSS so text is pixel-sharp and numbers are exactly what the post says.
// A slide may carry a photo (`image`), but the default is a code-drawn visual.
//
// Layouts: cover, story, grid, checklist, stats, bars, timeline, quote
// Text fields accept a little inline HTML: <b>bold</b>, <em>accent</em>.
// Headline lines: a leading "!" paints that line in the accent gradient.
// Colors come from THEMES (post.json "theme", default DEFAULT_THEME).
import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Prefer the font files shipped next to this engine (works offline / in the cloud); fall back to the CDN.
function fontLink() {
  const candidates = [path.join(HERE, 'fonts/pretendard.css')];
  for (const c of candidates) if (fs.existsSync(c)) return `<link rel="stylesheet" href="${pathToFileURL(c).href}">`;
  return `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">`;
}

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

// glow = "r,g,b" used for halos; gs = glow strength (1 = full).
export const THEMES = {
  vivid: {
    label: '원래 (쨍함)',
    bg1: '#0B0E15', bg2: '#07090D',
    accent: '#FF5A1F', accentHi: '#FF8A3D', tagInk: '#FFFFFF',
    grad: 'linear-gradient(180deg,#FFD58A 0%,#FF8A2A 45%,#F0431D 100%)',
    gradHl: 'linear-gradient(180deg,#FF9447 0%,#FF5A1F 55%,#E8341C 100%)',
    bar: 'linear-gradient(90deg,#E8341C,#FF5A1F)',
    glow: '255,90,31', gs: 1,
    cellOn: 'linear-gradient(160deg,#FFC46B,#FF5A1F)', cellOld: 'linear-gradient(160deg,#FFF6E6,#FFD39A)', cellAdd: 'linear-gradient(160deg,#FF8B4A,#E2401C)',
    stampTop: '#E8341C', barFill: 'linear-gradient(90deg,#E8341C,#FF8A3D)',
  },
  ember: {
    label: '차분한 주황',
    bg1: '#111318', bg2: '#0B0C10',
    accent: '#C9703F', accentHi: '#E0A27A', tagInk: '#FFF7F0',
    grad: 'linear-gradient(180deg,#F2D9C2 0%,#DD9567 50%,#B9643C 100%)',
    gradHl: 'linear-gradient(180deg,#E9B08A 0%,#D07A4A 60%,#B9643C 100%)',
    bar: 'linear-gradient(90deg,#8F4A2D,#B0603A)',
    glow: '201,112,63', gs: 0.45,
    cellOn: 'linear-gradient(160deg,#E7B58F,#C46F43)', cellOld: 'linear-gradient(160deg,#F5EADF,#E2C7A9)', cellAdd: 'linear-gradient(160deg,#B97452,#8F5134)',
    stampTop: '#B9643C', barFill: 'linear-gradient(90deg,#9C5333,#D08A5E)',
  },
  sand: {
    label: '샌드 골드',
    bg1: '#121314', bg2: '#0C0C0D',
    accent: '#BE9A66', accentHi: '#D9BF93', tagInk: '#14120E',
    grad: 'linear-gradient(180deg,#F3E6CC 0%,#D4B381 52%,#A8844F 100%)',
    gradHl: 'linear-gradient(180deg,#E9D3A8 0%,#C9A46E 60%,#A8844F 100%)',
    bar: 'linear-gradient(90deg,#6F5A3B,#8E7348)',
    glow: '190,154,102', gs: 0.4,
    cellOn: 'linear-gradient(160deg,#E8D2A8,#BE9A66)', cellOld: 'linear-gradient(160deg,#FAF4E8,#E9DCC3)', cellAdd: 'linear-gradient(160deg,#A88B5E,#7D6643)',
    stampTop: '#9C7A47', barFill: 'linear-gradient(90deg,#8E7348,#CDB081)',
  },
  virel: {
    label: 'VIREL 네이비',
    bg1: '#171D31', bg2: '#0F1322',
    accent: '#7C8FDA', accentHi: '#E7D2A8', tagInk: '#FFFFFF',
    grad: 'linear-gradient(180deg,#FAF0DC 0%,#E8D0A4 55%,#C9AA7C 100%)',
    gradHl: 'linear-gradient(180deg,#F3E2C0 0%,#DEC291 60%,#C9AA7C 100%)',
    bar: 'linear-gradient(90deg,#46508A,#5D6AB0)',
    glow: '110,134,216', gs: 0.5,
    cellOn: 'linear-gradient(160deg,#EEDCB8,#CDAE80)', cellOld: 'linear-gradient(160deg,#FFFFFF,#E6EAF8)', cellAdd: 'linear-gradient(160deg,#7C8FDA,#5968B2)',
    stampTop: '#5968B2', barFill: 'linear-gradient(90deg,#5968B2,#8EA0E6)',
  },
};
export const DEFAULT_THEME = 'ember';

function themeVars(name) {
  const t = THEMES[name] || THEMES[DEFAULT_THEME];
  return `:root{--bg1:${t.bg1};--bg2:${t.bg2};--accent:${t.accent};--accent-hi:${t.accentHi};--tag-ink:${t.tagInk};
--grad:${t.grad};--grad-hl:${t.gradHl};--bar:${t.bar};--glow:${t.glow};--gs:${t.gs};
--cell-on:${t.cellOn};--cell-old:${t.cellOld};--cell-add:${t.cellAdd};--stamp-top:${t.stampTop};--bar-fill:${t.barFill};
--muted:#A3ABB8;--line:rgba(255,255,255,.16)}`;
}

// rgba() of the theme glow at alpha a, scaled by the theme's glow strength
const G = (a) => `rgba(var(--glow),calc(${a} * var(--gs)))`;

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden;background:var(--bg2)}
body{font-family:'Pretendard','Malgun Gothic',sans-serif;color:#fff;-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-wrap:break-word}
em{font-style:normal}
.card{position:relative;width:1080px;height:1350px;overflow:hidden;background:var(--bg2)}
.layer{position:absolute;inset:0}
.grain{opacity:.10;background-image:${GRAIN};mix-blend-mode:overlay;pointer-events:none}

/* backgrounds */
.bg-code{background:
  radial-gradient(ellipse 62% 36% at 50% 47%, ${G(0.3)}, rgba(var(--glow),0) 72%),
  radial-gradient(ellipse 90% 45% at 50% 108%, ${G(0.2)}, rgba(0,0,0,0) 70%),
  linear-gradient(180deg,var(--bg1) 0%,var(--bg2) 100%)}
.bg-code.cool{background:
  radial-gradient(ellipse 62% 36% at 50% 47%, ${G(0.16)}, rgba(var(--glow),0) 72%),
  linear-gradient(180deg,var(--bg1) 0%,var(--bg2) 100%)}
.bg-code::after{content:'';position:absolute;inset:0;
  background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);
  background-size:54px 54px;
  -webkit-mask-image:radial-gradient(ellipse 75% 55% at 50% 50%,#000 25%,transparent 80%)}
.bg-photo{background-size:cover;background-position:center}
.shade-top{position:absolute;left:0;right:0;top:0;height:620px;background:linear-gradient(180deg,rgba(5,7,10,.96) 0%,rgba(5,7,10,.78) 42%,rgba(5,7,10,0) 100%)}
.shade-bottom{position:absolute;left:0;right:0;bottom:0;height:640px;background:linear-gradient(0deg,rgba(5,7,10,.98) 0%,rgba(5,7,10,.86) 45%,rgba(5,7,10,0) 100%)}

/* top bar */
.topbar{position:absolute;top:46px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;z-index:5}
.tag{display:flex;align-items:stretch;transform:skewX(-12deg);font-weight:900;font-size:30px;letter-spacing:.01em;line-height:1}
.tag .slash{width:9px;background:var(--accent);margin-right:12px}
.tag .a{padding:7px 10px 7px 0}
.tag .b{background:var(--accent);color:var(--tag-ink);padding:7px 13px}
.tag .c{background:#fff;color:#0A0C10;padding:7px 13px;margin-left:10px}
.meta{font-weight:700;font-size:26px;color:#fff;opacity:.92;text-align:right;line-height:1.25}
.meta small{display:block;font-size:22px;font-weight:600;color:var(--muted)}

/* headline */
.hl{position:absolute;left:56px;right:56px;z-index:5}
.hl .line{display:block;white-space:nowrap;font-weight:900;letter-spacing:-0.055em;line-height:1.08;filter:drop-shadow(0 6px 18px rgba(0,0,0,.7))}
.hl .accent,.hl em{background:var(--grad-hl);-webkit-background-clip:text;background-clip:text;color:transparent}
.kicker{position:absolute;left:56px;z-index:5;display:inline-block;font-weight:800;font-size:30px;color:#0A0C10;background:#fff;padding:8px 18px;border-radius:10px;transform:skewX(-8deg)}
.kicker.hot{background:var(--accent);color:var(--tag-ink)}

/* bottom blocks */
.stack{position:absolute;left:56px;right:56px;display:flex;flex-direction:column;align-items:center;gap:22px;z-index:5}
.pill{max-width:968px;white-space:nowrap;overflow:hidden;border:2px solid rgba(255,255,255,.7);border-radius:999px;padding:14px 36px;font-weight:800;font-size:37px;letter-spacing:-0.03em;background:rgba(8,10,14,.72)}
.bar{max-width:968px;white-space:nowrap;overflow:hidden;background:var(--bar);font-weight:900;font-size:42px;letter-spacing:-0.03em;padding:15px 34px;transform:skewX(-7deg);box-shadow:0 12px 30px ${G(0.35)}}
.bar>span{display:inline-block;transform:skewX(7deg)}
.body{position:absolute;left:56px;right:56px;z-index:5;font-size:39px;font-weight:600;line-height:1.5;letter-spacing:-0.03em;color:#E9ECF1;overflow:hidden}
.body b{color:#fff;font-weight:800}
.body em{color:var(--accent-hi);font-weight:800}

/* footer */
.foot{position:absolute;left:56px;right:56px;bottom:34px;z-index:5;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;border-top:1px solid var(--line);padding-top:16px}
.foot .src{flex:1;min-width:0;white-space:nowrap;overflow:hidden;font-size:21px;font-weight:500;color:#8F98A7;letter-spacing:-0.01em}
.foot .src b{color:#B9C0CC;font-weight:700}
.foot .right{display:flex;align-items:baseline;gap:18px;white-space:nowrap}
.foot .handle{font-size:22px;font-weight:700;color:#C9CFD8}
.foot .cnt{font-size:28px;font-weight:800;color:var(--accent-hi);letter-spacing:.02em}

/* cover hero: stamps */
.sticker{position:absolute;width:330px;height:330px;border-radius:50%;
  background:radial-gradient(circle at 34% 28%,#FBF8F3 0%,#EFE8DD 45%,#D9CDBB 100%);
  box-shadow:0 34px 70px rgba(0,0,0,.6),0 0 0 6px rgba(255,255,255,.05),inset 0 -10px 22px rgba(0,0,0,.14);
  display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1A1C22;z-index:3}
.sticker::before{content:'';position:absolute;inset:17px;border-radius:50%;border:5px dashed var(--accent)}
.sticker::after{content:'';position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 38%)}
.sticker .s1{font-size:33px;font-weight:800;color:var(--stamp-top);letter-spacing:.18em;margin-bottom:2px}
.sticker .s2{font-size:108px;font-weight:900;letter-spacing:-0.06em;word-spacing:.12em;line-height:1;white-space:nowrap}
.sticker .s3{font-size:27px;font-weight:800;color:#5A6170;letter-spacing:.34em;margin-top:8px;padding-left:.34em}

/* cover hero: numbers (sizes in em so data-fitw can shrink the whole row) */
.nums{position:absolute;left:56px;right:56px;display:flex;justify-content:center;align-items:center;gap:.12em;z-index:4;white-space:nowrap;font-size:216px}
.nums .from{font-size:.6em;font-weight:900;letter-spacing:-0.05em;color:#6B7280;position:relative}
.nums .from::after{content:'';position:absolute;left:-.05em;right:-.05em;top:52%;height:.07em;background:var(--accent);transform:rotate(-8deg);border-radius:4px}
.nums .arrow{width:.44em;height:.33em;color:var(--accent-hi)}
.nums .to,.nums .big{font-weight:900;letter-spacing:-0.06em;line-height:.9;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 12px 34px ${G(0.5)})}
.nums .to{font-size:1em}
.nums .big{font-size:1.15em}
.nums .unit{font-size:.2em;font-weight:800;line-height:1.15;letter-spacing:-0.03em}
.nums .unit small{display:block;font-size:.64em;font-weight:600;color:var(--muted)}
.heroLabel{position:absolute;left:56px;right:56px;text-align:center;z-index:4;font-size:38px;font-weight:800;color:#E9ECF1;letter-spacing:-0.03em}
.vs{position:absolute;left:56px;right:56px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:26px;z-index:4}
.vs .side{text-align:center;padding:74px 18px;border-radius:30px;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1)}
.vs .side.hi{background:linear-gradient(160deg,rgba(var(--glow),.2),rgba(var(--glow),.05));border-color:rgba(var(--glow),.5)}
.vs .v{font-size:110px;font-weight:900;letter-spacing:-0.06em;line-height:1;white-space:nowrap}
.vs .side.hi .v{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.vs .l{font-size:32px;font-weight:700;color:#C9CFD8;margin-top:14px}
.vs .mid{font-size:54px;font-weight:900;color:var(--accent-hi);font-style:italic}

/* grid */
.gridwrap{position:absolute;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:26px;z-index:4}
.grid{display:grid;grid-template-columns:repeat(20,32px);gap:6px;padding:26px;border-radius:26px;background:rgba(255,255,255,.035);border:1.5px solid rgba(255,255,255,.08)}
.cell{width:32px;height:32px;border-radius:7px;background:rgba(255,255,255,.055);border:1.5px solid rgba(255,255,255,.11)}
.cell.on{background:var(--cell-on);border-color:transparent;box-shadow:0 0 16px ${G(0.65)}}
.cell.on.old{background:var(--cell-old);box-shadow:0 0 14px rgba(255,240,220,calc(.6 * var(--gs)))}
.cell.add{background:var(--cell-add);border-color:transparent}
.cell.ghost{visibility:hidden}
.legend{display:flex;gap:40px;font-size:29px;font-weight:700;color:#D5DAE2}
.legend i{display:inline-block;width:26px;height:26px;border-radius:6px;vertical-align:-4px;margin-right:12px}

/* checklist */
.checks{position:absolute;left:56px;right:56px;display:flex;flex-direction:column;gap:24px;z-index:5}
.check{display:grid;grid-template-columns:104px 1fr;gap:30px;align-items:center;padding:32px 36px;border-radius:26px;background:linear-gradient(120deg,rgba(255,255,255,.07),rgba(255,255,255,.03));border:1.5px solid rgba(255,255,255,.1);border-left:9px solid var(--accent)}
.check .ic{width:104px;height:104px;border-radius:24px;background:rgba(var(--glow),.13);display:flex;align-items:center;justify-content:center;color:var(--accent-hi)}
.check .t{font-size:41px;font-weight:800;letter-spacing:-0.04em;line-height:1.25}
.check .d{font-size:30px;font-weight:500;color:#B7BECA;line-height:1.42;margin-top:8px;letter-spacing:-0.02em}
.cta{position:absolute;left:56px;right:56px;z-index:5;display:flex;align-items:center;justify-content:center;gap:16px;padding:22px 28px;border-radius:20px;border:2px dashed rgba(var(--glow),.5);font-size:33px;font-weight:700;color:#F1F3F6;letter-spacing:-0.03em}
.cta svg{color:var(--accent-hi)}

/* stats */
.stats{position:absolute;left:56px;right:56px;display:grid;gap:24px;z-index:5}
.stat{padding:38px 36px;border-radius:28px;background:linear-gradient(140deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1.5px solid rgba(255,255,255,.1);overflow:hidden}
.stat.hi{background:linear-gradient(140deg,rgba(var(--glow),.22),rgba(var(--glow),.05));border-color:rgba(var(--glow),.5)}
.stat .v{font-size:104px;font-weight:900;letter-spacing:-0.06em;line-height:1;white-space:nowrap;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.stat .v small{font-size:.42em;letter-spacing:-0.03em}
.stat .l{font-size:35px;font-weight:800;margin-top:16px;letter-spacing:-0.03em}
.stat .d{font-size:27px;font-weight:500;color:#AEB6C2;margin-top:8px;line-height:1.4}

/* bars */
.bars{position:absolute;left:56px;right:56px;display:flex;flex-direction:column;gap:26px;z-index:5;padding:40px 40px;border-radius:28px;background:rgba(255,255,255,.035);border:1.5px solid rgba(255,255,255,.08)}
.brow{display:grid;grid-template-columns:230px 1fr;align-items:center;gap:24px}
.brow .bl{font-size:32px;font-weight:700;color:#D5DAE2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brow .track{position:relative;height:62px;border-radius:14px;background:rgba(255,255,255,.05)}
.brow .fill{position:absolute;left:0;top:0;bottom:0;border-radius:14px;background:linear-gradient(90deg,#3E4350,#5B6170)}
.brow.hi .fill{background:var(--bar-fill);box-shadow:0 0 24px ${G(0.5)}}
.brow .bv{position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:33px;font-weight:900;letter-spacing:-0.03em;white-space:nowrap}
.brow.hi .bl{color:#fff;font-weight:900}

/* timeline */
.tl{position:absolute;left:56px;right:56px;z-index:5;display:flex;flex-direction:column;gap:0}
.step{position:relative;padding:0 0 40px 70px}
.step::before{content:'';position:absolute;left:17px;top:14px;bottom:-14px;width:4px;background:rgba(255,255,255,.14)}
.step:last-child::before{display:none}
.step .dot{position:absolute;left:4px;top:6px;width:30px;height:30px;border-radius:50%;background:#2A2F3A;border:4px solid #6B7280}
.step.hi .dot{background:var(--accent);border-color:var(--accent-hi);box-shadow:0 0 22px ${G(0.8)}}
.step .w{font-size:30px;font-weight:800;color:var(--muted);letter-spacing:-0.01em}
.step.hi .w{color:var(--accent-hi)}
.step .x{font-size:40px;font-weight:800;letter-spacing:-0.04em;line-height:1.3;margin-top:6px}
.step .x small{display:block;font-size:29px;font-weight:500;color:#AEB6C2;margin-top:6px;line-height:1.4}

/* inner slides: visual + body flow inside one box, centered, so nothing can overlap */
.content{position:absolute;left:56px;right:56px;bottom:118px;display:flex;flex-direction:column;justify-content:center;gap:40px;z-index:5}
.content>*{position:relative!important;left:auto!important;right:auto!important;top:auto!important;flex:0 0 auto}
.content>.body{flex:0 1 auto;min-height:0}
.content>.cta{margin-top:-8px}

/* quote */
.quote{position:absolute;left:56px;right:56px;z-index:5;padding:104px 56px 56px;border-radius:30px;background:linear-gradient(140deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1.5px solid rgba(255,255,255,.1);overflow:hidden}
.quote::before{content:'\\201C';position:absolute;left:34px;top:-34px;font-size:220px;font-weight:900;color:var(--accent);opacity:.9;font-family:Georgia,serif}
.quote .q{font-size:52px;font-weight:800;letter-spacing:-0.04em;line-height:1.38}
.quote .q em{color:var(--accent-hi)}
.quote .who{margin-top:30px;font-size:30px;font-weight:700;color:var(--muted)}
`;

// Shrinks text that would overflow its box; returns any element still overflowing.
const FIT = `<script>
window.__fit=function(){
  document.querySelectorAll('[data-fitw]').forEach(function(el){var s=parseFloat(getComputedStyle(el).fontSize),m=+el.dataset.fitw;while(el.scrollWidth>el.clientWidth+1&&s>m){s-=2;el.style.fontSize=s+'px'}});
  document.querySelectorAll('[data-fith]').forEach(function(el){var s=parseFloat(getComputedStyle(el).fontSize),m=+el.dataset.fith;while(el.scrollHeight>el.clientHeight+1&&s>m){s-=1;el.style.fontSize=s+'px'}});
  var bad=[];
  document.querySelectorAll('[data-fitw]').forEach(function(el){if(el.scrollWidth>el.clientWidth+1)bad.push((el.className||el.tagName)+' (too wide)')});
  document.querySelectorAll('[data-fith]').forEach(function(el){if(el.scrollHeight>el.clientHeight+1)bad.push((el.className||el.tagName)+' (too tall)')});
  var card=document.querySelector('.card').getBoundingClientRect(), foot=document.querySelector('.foot');
  var footTop=foot?foot.getBoundingClientRect().top:card.bottom;
  document.querySelectorAll('[data-zone]').forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom>footTop-8)bad.push(el.dataset.zone+' runs into footer')});
  document.querySelectorAll('.content').forEach(function(el){var r=el.getBoundingClientRect(),k=el.children;if(!k.length)return;
    var a=k[0].getBoundingClientRect(),b=k[k.length-1].getBoundingClientRect();
    if(a.top<r.top-1||b.bottom>r.bottom+1)bad.push('content too tall for slide (trim text or items)')});
  var hl=document.querySelector('.hl'),ct=document.querySelector('.content');
  if(hl&&ct&&hl.getBoundingClientRect().bottom>ct.getBoundingClientRect().top+4)bad.push('headline overlaps content (use 2 lines)');
  return bad;
};
</script>`;

const S = (w, inner, extra = '') =>
  `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${extra}>${inner}</svg>`;
const ICONS = {
  search: S(58, '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>', 'stroke-width="2.4" stroke-linecap="round"'),
  box: S(58, '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>', 'stroke-width="2.2" stroke-linejoin="round"'),
  calendar: S(58, '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', 'stroke-width="2.2" stroke-linecap="round"'),
  money: S(58, '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>', 'stroke-width="2.2" stroke-linecap="round"'),
  alert: S(58, '<path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.2"/>', 'stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"'),
  phone: S(58, '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>', 'stroke-width="2.2" stroke-linecap="round"'),
  shield: S(58, '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5" stroke-linecap="round"/>', 'stroke-width="2.2" stroke-linejoin="round"'),
  globe: S(58, '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>', 'stroke-width="2.2"'),
  chart: S(58, '<path d="M3 20h18"/><path d="m4 15 5-5 4 3 7-7"/><path d="M15 6h5v5"/>', 'stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"'),
  bookmark: S(38, '<path d="M6 3h12v18l-6-4.5L6 21z"/>', 'stroke-width="2.4" stroke-linejoin="round"'),
  check: S(58, '<path d="m4.5 12.5 5 5 10-11"/>', 'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"'),
};

const ARROW = `<svg class="arrow" viewBox="0 0 96 70"><path d="M4 35h76M58 10l26 25-26 25" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Legend swatches may name a cell style instead of a raw CSS color.
const SWATCH = { on: 'var(--cell-on)', old: 'var(--cell-old)', add: 'var(--cell-add)', off: 'rgba(255,255,255,.14)' };

function fileUrl(postDir, rel) {
  return pathToFileURL(path.resolve(postDir, rel)).href;
}

function background(post, s, postDir) {
  if (s.image) {
    const pos = s.imagePos || 'center';
    return `<div class="layer bg-photo" style="background-image:url('${fileUrl(postDir, s.image)}');background-position:${pos}"></div>
<div class="shade-top"></div><div class="shade-bottom"></div>`;
  }
  return `<div class="layer bg-code${s.layout === 'cover' ? '' : ' cool'}"></div>`;
}

function topbar(post, s) {
  const right = s.layout === 'cover'
    ? `<div class="meta">${post.handle}</div>`
    : `<div class="meta">${post.category}<small>${post.date}</small></div>`;
  const badge = post.badge ? `<span class="c">${post.badge}</span>` : '';
  return `<div class="topbar"><div class="tag"><span class="slash"></span><span class="a">NEWS</span><span class="b">BRIEF</span>${badge}</div>${right}</div>`;
}

function footer(post, s, i, total) {
  const n = String(i + 1).padStart(2, '0');
  const t = String(total).padStart(2, '0');
  const note = s.image ? post.imageNote : post.codeNote;
  const handle = s.layout === 'cover' ? '' : `<span class="handle">${post.handle}</span>`;
  return `<div class="foot"><div class="src" data-fitw="16"><b>출처</b> ${post.source}${note ? ` &nbsp;|&nbsp; ${note}` : ''}</div><div class="right">${handle}<span class="cnt">${n} / ${t}</span></div></div>`;
}

function headline(lines, top, size) {
  return `<div class="hl" style="top:${top}px">${lines
    .map((l) => {
      const accent = l.startsWith('!');
      const txt = accent ? l.slice(1) : l;
      return `<div class="line${accent ? ' accent' : ''}" data-fitw="56" style="font-size:${size}px">${txt}</div>`;
    })
    .join('')}</div>`;
}

function kicker(s) {
  return s.kicker ? `<div class="kicker${s.hot ? ' hot' : ''}" style="top:132px">${s.kicker}</div>` : '';
}

function body(s, top, height) {
  return s.body ? `<div class="body" data-fith="28" data-zone="body" style="top:${top}px;height:${height}px">${s.body}</div>` : '';
}

// Inner-slide frame: kicker + headline on top, then visual and body in the space left.
function inner(s, visual, align = 'center') {
  const lines = s.headline.length;
  const top = 200 + lines * 102 + 40;
  const b = s.body ? `<div class="body" data-fith="28">${s.body}</div>` : '';
  return `${kicker(s)}
${headline(s.headline, 200, 94)}
<div class="content" style="top:${top}px;justify-content:${align}">${visual}${b}</div>`;
}

function stamps(list, top) {
  const two = [
    { left: 205, rot: -9, dy: 0 },
    { left: 545, rot: 8, dy: 22 },
  ];
  const one = [{ left: 375, rot: -6, dy: 0 }];
  const pos = list.length === 1 ? one : two;
  return list
    .slice(0, 2)
    .map((st, k) => {
      const p = pos[k];
      return `<div class="sticker" style="left:${p.left}px;top:${top + p.dy}px;transform:rotate(${p.rot}deg)"><div class="s1">${st.top || ''}</div><div class="s2">${st.main}</div><div class="s3">${st.bottom || ''}</div></div>`;
    })
    .join('');
}

function numberRow(s, top, base) {
  if (s.change) {
    const c = s.change;
    return `<div class="nums" data-fitw="70" style="top:${top}px;font-size:${base}px"><span class="from">${c.from}</span>${ARROW}<span class="to">${c.to}</span><span class="unit">${c.unit || ''}<small>${c.unitSub || ''}</small></span></div>`;
  }
  if (s.number) {
    const n = s.number;
    return `<div class="nums" data-fitw="70" style="top:${top}px;font-size:${base}px"><span class="big">${n.value}</span>${n.unit ? `<span class="unit">${n.unit}<small>${n.unitSub || ''}</small></span>` : ''}</div>`;
  }
  return '';
}

function grid(total, on, mode) {
  const cols = 20;
  const slots = Math.ceil(total / cols) * cols;
  let html = '';
  for (let k = 0; k < slots; k++) {
    if (k >= total) html += '<div class="cell ghost"></div>';
    else if (k < on) html += mode === 'after' ? '<div class="cell on old"></div>' : '<div class="cell on"></div>';
    else html += mode === 'after' ? '<div class="cell add"></div>' : '<div class="cell"></div>';
  }
  return `<div class="grid">${html}</div>`;
}

const LAYOUTS = {
  // Cover. Hero options (pick what fits the story):
  //   stamps:[{top,main,bottom}] (1-2 round labels) + change/number below
  //   change:{from,to,unit,unitSub} | number:{value,unit,unitSub} | vs:{left:{v,l,hi},right:{v,l,hi},mid}
  //   heroLabel: one line under the number
  cover(post, s) {
    if (s.from && !s.change) s.change = { from: s.from, to: s.to, unit: s.unit, unitSub: s.unitSub };
    if (s.stickers && !s.stamps) s.stamps = s.stickers;
    const lines = s.headline.length;
    const hlSize = lines >= 3 ? 96 : 112;
    let hero = '';
    if (!s.image) {
      if (s.stamps && s.stamps.length) {
        hero = stamps(s.stamps, 430) + numberRow(s, 800, 216);
      } else if (s.vs) {
        const side = (x) => `<div class="side${x.hi ? ' hi' : ''}"><div class="v" data-fitw="48">${x.v}</div><div class="l">${x.l}</div></div>`;
        hero = `<div class="vs" style="top:${lines >= 3 ? 540 : 500}px">${side(s.vs.left)}<div class="mid">${s.vs.mid || 'VS'}</div>${side(s.vs.right)}</div>`;
      } else {
        hero = numberRow(s, lines >= 3 ? 560 : 500, s.number ? 230 : 250);
      }
      if (s.heroLabel) hero += `<div class="heroLabel" style="top:${s.stamps ? 985 : 860}px">${s.heroLabel}</div>`;
    }
    return `${headline(s.headline, 116, hlSize)}
${hero}
<div class="stack" data-zone="cover stack" style="top:1028px">
  ${s.pill ? `<div class="pill" data-fitw="26">${s.pill}</div>` : ''}
  ${s.bar ? `<div class="bar" data-fitw="28"><span>${s.bar}</span></div>` : ''}
</div>`;
  },

  // Text slide: kicker + headline + body. Good for context or the "하지만" turn.
  story(post, s) {
    if (s.image) {
      return `${s.kicker ? `<div class="kicker${s.hot ? ' hot' : ''}" style="top:700px">${s.kicker}</div>` : ''}
${headline(s.headline, 766, 92)}
${body(s, 990, 250)}`;
    }
    return inner(s, '', 'flex-start');
  },

  // Unit grid: total cells (<=240), first `on` lit. mode "before" (rest empty) | "after" (rest added).
  // legend colors: "on" | "old" | "add" | "off" (or any CSS color)
  grid(post, s) {
    return inner(
      s,
      `<div class="gridwrap">
  ${grid(s.total, s.on, s.mode)}
  <div class="legend">${(s.legend || []).map((l) => `<span><i style="background:${SWATCH[l.color] || l.color}"></i>${l.text}</span>`).join('')}</div>
</div>`
    );
  },

  // Up to 3 cards: items:[{icon,title,desc}], optional cta line.
  checklist(post, s) {
    const cards = `<div class="checks">
${s.items
  .slice(0, 3)
  .map(
    (it) => `<div class="check"><div class="ic">${ICONS[it.icon] || ICONS.check}</div><div><div class="t">${it.title}</div><div class="d">${it.desc || ''}</div></div></div>`
  )
  .join('')}
</div>`;
    const cta = s.cta ? `<div class="cta">${ICONS.bookmark}<span>${s.cta}</span></div>` : '';
    return inner(s, cards + cta);
  },

  // 2-4 number tiles: items:[{v,l,d,hi}]. v may include <small>단위</small>.
  stats(post, s) {
    const items = s.items.slice(0, 4);
    const cols = items.length === 3 ? '1fr' : '1fr 1fr';
    const vSize = items.length === 3 ? 96 : 92;
    return inner(
      s,
      `<div class="stats" style="grid-template-columns:${cols}">
${items
  .map(
    (it) => `<div class="stat${it.hi ? ' hi' : ''}"><div class="v" data-fitw="44" style="font-size:${vSize}px">${it.v}</div><div class="l">${it.l}</div>${it.d ? `<div class="d">${it.d}</div>` : ''}</div>`
  )
  .join('')}
</div>`
    );
  },

  // Horizontal bars: items:[{label,value,display,hi}] (3-6 rows). value = number for bar length.
  bars(post, s) {
    const items = s.items.slice(0, 6);
    const max = Math.max(...items.map((x) => Math.abs(Number(x.value)) || 0), 1);
    const h = items.length <= 3 ? 84 : items.length === 4 ? 72 : 60;
    return inner(
      s,
      `<div class="bars">
${items
  .map((it) => {
    const w = Math.max(14, Math.round((Math.abs(Number(it.value)) / max) * 100));
    return `<div class="brow${it.hi ? ' hi' : ''}"><div class="bl">${it.label}</div><div class="track" style="height:${h}px"><div class="fill" style="width:${w}%"></div><span class="bv">${it.display ?? it.value}</span></div></div>`;
  })
  .join('')}
</div>`
    );
  },

  // Vertical timeline: steps:[{when,what,sub,hi}] (3-5 steps).
  timeline(post, s) {
    return inner(
      s,
      `<div class="tl">
${s.steps
  .slice(0, 5)
  .map((st) => `<div class="step${st.hi ? ' hi' : ''}"><span class="dot"></span><div class="w">${st.when}</div><div class="x">${st.what}${st.sub ? `<small>${st.sub}</small>` : ''}</div></div>`)
  .join('')}
</div>`
    );
  },

  // Quote: quote text + who. Use only for words actually said, quoted from a source.
  quote(post, s) {
    return inner(
      s,
      `<div class="quote"><div class="q" data-fith="34" style="max-height:360px">${s.quote}</div><div class="who">— ${s.who}</div></div>`
    );
  },
};

export const LAYOUT_NAMES = Object.keys(LAYOUTS);

export function buildSlide(post, s, i, total, postDir) {
  const layout = LAYOUTS[s.layout];
  if (!layout) throw new Error(`unknown layout: ${s.layout} (use one of ${LAYOUT_NAMES.join(', ')})`);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">${fontLink()}<style>${themeVars(post.theme)}${CSS}</style>${FIT}</head>
<body><div class="card">
${background(post, s, postDir)}
<div class="layer grain"></div>
${topbar(post, s)}
${layout(post, s)}
${footer(post, s, i, total)}
</div></body></html>`;
}
