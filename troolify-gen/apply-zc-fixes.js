/* ============================================================================
   Troolify - zero-click structural pass
   Applies three additive, idempotent fixes to every tool page:

   1. HowTo JSON-LD  - built from the visible "How to use" <ol> step list.
   2. Article JSON-LD - added only on pages that are missing it.
   3. Quick answer   - a compact callout placed just below the tool panel,
                       sourced from the first sentence(s) of the article lead.

   Run: node troolify-gen/apply-zc-fixes.js   (from the repo root)
   Safe to re-run: each fix is skipped when already present.
   ============================================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://f9xr.org/troolify';

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html') && e.name !== 'index.html') out.push(p);
  }
}
const files = [];
walk(path.join(ROOT, 'tools'), files);

function ldTypes(h) {
  const t = [];
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { const o = JSON.parse(m[1]); (Array.isArray(o) ? o : [o]).forEach(x => t.push(x['@type'])); } catch (e) {}
  }
  return t;
}
function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&middot;/g, '.')
    .replace(/&times;/g, 'x').replace(/&hellip;/g, '...').replace(/\s+/g, ' ').trim();
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* first substantial paragraph of the article (the lead), trimmed to whole sentences <= 300 chars */
function extractAnswer(h) {
  const ai = h.indexOf('<article class="seo-article">');
  if (ai < 0) return '';
  const seg = h.slice(ai, ai + 2200);
  const ps = [...seg.matchAll(/<p>([\s\S]*?)<\/p>/gi)].map(x => stripTags(x[1])).filter(Boolean);
  const text = ps.find(t => t.length >= 80) || ps[0] || '';
  if (!text) return '';
  const parts = text.split(/(?<=[.!?])\s+/);
  let out = '';
  for (const p of parts) {
    if (out && (out.length + p.length + 1) > 300) break;
    out = out ? out + ' ' + p : p;
    if (out.length >= 160) break;
  }
  return out || text.slice(0, 300);
}

/* visible "How to use ..." ordered step list, in the exact or older heading shapes */
function extractSteps(h) {
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = re.exec(h))) {
    if (!/how to use/i.test(stripTags(m[1]))) continue;
    const tail = h.slice(m.index + m[0].length);
    if (!/<ol[^>]*>/i.test(tail.slice(0, 320))) continue;
    const ol = tail.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (!ol) continue;
    const steps = [...ol[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(x => stripTags(x[1])).filter(Boolean);
    if (steps.length >= 2) return { heading: stripTags(m[1]), steps };
  }
  return null;
}

const QUICK_START = '<section class="quick-answer"aria-label="Quick answer"style="margin:18px 0 0;padding:14px 16px;border:1px solid rgba(96,165,250,.28);border-radius:14px;background:linear-gradient(180deg,rgba(59,130,246,.12),rgba(59,130,246,.03))"><p style="margin:0;font-size:15px;line-height:1.6;color:var(--ink)"><strong style="color:#93C5FD">Quick answer:</strong> ';

let howTo = 0, article = 0, quick = 0, skipped = { howTo: 0, article: 0, quick: 0 };
const touched = [];

for (const file of files) {
  let h = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const before = h;
  const types = ldTypes(h);

  /* --- 1. HowTo ------------------------------------------------------------ */
  const stepInfo = extractSteps(h);
  if (stepInfo && !types.includes('HowTo')) {
    const howToLd = {
      '@context': 'https://schema.org', '@type': 'HowTo',
      name: stepInfo.heading, description: (h.match(/<meta name="description"[^>]*?content="([^"]*)"/) || [, ''])[1],
      step: stepInfo.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s }))
    };
    const tag = '<script type="application/ld+json">' + JSON.stringify(howToLd) + '</script>';
    h = h.replace('</head>', tag + '</head>');
    howTo++;
  } else if (types.includes('HowTo')) skipped.howTo++;

  /* --- 2. Article ---------------------------------------------------------- */
  if (!types.includes('Article')) {
    const title = (h.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].replace(/\s+/g, ' ').trim();
    const artTitle = (h.match(/<h2 id="article-title">([\s\S]*?)<\/h2>/) || [, title])[1];
    const desc = (h.match(/<meta name="description"[^>]*?content="([^"]*)"/) || [, ''])[1];
    const url = (h.match(/<link rel="canonical"[^>]*?href="([^"]*)"/) || [, ''])[1];
    const pub = (h.match(/property="article:published_time"content="([^"]*)"/) || [, '2026-08-14'])[1];
    const mod = (h.match(/property="article:modified_time"content="([^"]*)"/) || [, pub])[1];
    const articleLd = {
      '@context': 'https://schema.org', '@type': 'Article', headline: stripTags(artTitle),
      description: desc, image: BASE + '/assets/images/og-image.jpg',
      datePublished: pub, dateModified: mod, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'F9XR Development Team', url: 'https://f9xr.org/' },
      publisher: { '@type': 'Organization', name: 'Troolify', url: BASE + '/', logo: { '@type': 'ImageObject', url: BASE + '/assets/images/logo_nobg.webp', width: 1407, height: 768 } }
    };
    const tag = '<script type="application/ld+json">' + JSON.stringify(articleLd) + '</script>';
    h = h.replace('</head>', tag + '</head>');
    article++;
  } else skipped.article++;

  /* --- 3. Quick answer ----------------------------------------------------- */
  if (!/class="quick-answer"/.test(h)) {
    const ans = extractAnswer(h);
    if (ans) {
      const block = QUICK_START + esc(ans) + '</p></section>';
      if (h.includes('<aside class="disclaimer"')) h = h.replace('<aside class="disclaimer"', block + '<aside class="disclaimer"');
      else if (h.includes('<div class="article-layout">')) h = h.replace('<div class="article-layout">', block + '<div class="article-layout">');
      quick++;
    }
  } else skipped.quick++;

  if (h !== before) { fs.writeFileSync(file, h, 'utf8'); touched.push(rel); }
}

console.log('files scanned : ' + files.length);
console.log('HowTo added   : ' + howTo + '  (already present: ' + skipped.howTo + ')');
console.log('Article added : ' + article + '  (already present: ' + skipped.article + ')');
console.log('Quick answer  : ' + quick + '  (already present: ' + skipped.quick + ')');
console.log('files changed : ' + touched.length);
