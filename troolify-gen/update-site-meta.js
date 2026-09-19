/* Update sitemap.xml, llms.txt and ai.txt from the merged registry.
   Run: node update-site-meta.js  (from the troolify-gen directory)  */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const BASE = 'https://f9xr.org/troolify';
const NEW = '2026-09-19';

/* ---------- load registry ---------- */
const src = fs.readFileSync(path.join(REPO, 'assets', 'js', 'tools-data.js'), 'utf8');
global.window = {};
eval(src);
const TOOLS = global.window.TOOLS || [];
const CATS = global.window.CATEGORIES || [];

const toolHrefs = new Set(TOOLS.map(t => t.href));
const catName = {};
CATS.forEach(c => { catName[c.folder.toLowerCase()] = c.name; });

/* ---------- 1) sitemap.xml ---------- */
const smPath = path.join(REPO, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const entryRe = /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<changefreq>([^<]+)<\/changefreq>\s*<priority>([^<]+)<\/priority>\s*<\/url>/g;
const existing = {};
let m;
while ((m = entryRe.exec(sm)) !== null) {
  existing[m[1]] = { lastmod: m[2], changefreq: m[3], priority: m[4] };
}

function add(loc, lastmod, changefreq, priority) {
  if (!existing[loc]) existing[loc] = { lastmod, changefreq, priority };
}

TOOLS.forEach(t => {
  add(BASE + '/' + t.href, NEW, 'monthly', '0.9');
});
CATS.forEach(c => {
  add(BASE + '/tools/' + c.folder.toLowerCase() + '/index.html', NEW, 'monthly', '0.8');
});
['pages/developers.html', 'pages/methodology.html'].forEach(p => {
  add(BASE + '/' + p, NEW, 'monthly', '0.5');
});

const locs = Object.keys(existing).sort();
let out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
locs.forEach(loc => {
  const e = existing[loc];
  out += '<url>\n    <loc>' + loc + '</loc>\n    <lastmod>' + e.lastmod + '</lastmod>\n    <changefreq>' + e.changefreq + '</changefreq>\n    <priority>' + e.priority + '</priority>\n  </url>\n';
});
out += '</urlset>\n';
fs.writeFileSync(smPath, out, 'utf8');

const missingTools = TOOLS.filter(t => !existing[BASE + '/' + t.href]);
console.log('sitemap.xml: total entries=' + locs.length + ' tools=' + TOOLS.length + ' cats=' + CATS.length + ' missing after regen=' + missingTools.length);

/* ---------- helpers to build llms.txt tool lines ---------- */
function toolLine(t) {
  return '- [' + t.name + '](' + BASE + '/' + t.href + '): ' + t.desc.replace(/\s+$/, '');
}

const constructionTools = TOOLS.filter(t => t.category === 'Construction').map(toolLine);
const colorTools = TOOLS.filter(t => t.category === 'Color').map(toolLine);
const filesTools = TOOLS.filter(t => t.category === 'Files').map(toolLine);

const curatedHrefs = [
  'tools/text/flip-text-generator.html', 'tools/text/add-text-to-each-line.html',
  'tools/text/reverse-list.html', 'tools/text/list-randomizer.html',
  'tools/text/remove-extra-spaces.html', 'tools/text/spaces-to-tabs.html',
  'tools/text/filter-lines.html', 'tools/text/count-lines.html', 'tools/text/letter-counter.html',
  'tools/coding/text-to-array-converter.html', 'tools/coding/css-inliner.html',
  'tools/coding/css-beautifier.html', 'tools/coding/javascript-beautifier.html',
  'tools/image/flip-image.html', 'tools/image/qr-code-generator.html',
  'tools/image/random-bitmap-generator.html', 'tools/video/screen-recorder.html',
  'tools/math/gaussian-random-number-generator.html'
];
const curatedTools = curatedHrefs
  .map(h => TOOLS.find(t => t.href === h))
  .filter(Boolean)
  .map(toolLine);

/* ---------- 2) llms.txt ---------- */
const llmsPath = path.join(REPO, 'llms.txt');
let llms = fs.readFileSync(llmsPath, 'utf8');

// construction block after the HVAC block (anchor: fume-hood-exhaust-load line)
const constrBlock = '\n' + constructionTools.join('\n') + '\n';
const hvacAnchor = 'tools/hvac/fume-hood-exhaust-load.html)';
const constrUrl = constructionTools[0].split('(')[1].split(')')[0];
if (!llms.includes(constrUrl)) {
  const idx = llms.indexOf(hvacAnchor);
  if (idx !== -1) {
    const end = llms.indexOf('\n', idx) + 1;
    llms = llms.slice(0, end) + constrBlock + llms.slice(end);
  } else {
    console.log('WARN: HVAC anchor not found - construction block skipped');
  }
}

// curated + color + files blocks before ## Categories
const curatedBlock = '\n' + curatedTools.concat(colorTools, filesTools).join('\n') + '\n';
const curatedUrl = curatedBlock.split('(').filter(s => s.includes('/tools/'))[0].split(')')[0];
if (!llms.includes(curatedUrl) && llms.includes('## Categories')) {
  llms = llms.replace('## Categories', curatedBlock + '\n## Categories');
}

// api-powered tool block before ## Categories (after the curated block)
const apiHrefs = [
  'tools/fun/random-quote-generator.html', 'tools/fun/random-facts-generator.html',
  'tools/fun/joke-generator.html', 'tools/fun/roast-generator.html',
  'tools/fun/random-meme-generator.html', 'tools/fun/riddle-generator.html',
  'tools/fun/truth-or-dare-generator.html', 'tools/fun/anime-image-generator.html',
  'tools/image/text-logo-generator.html', 'tools/image/text-photo-gif-maker.html',
  'tools/coding/url-shortener.html', 'tools/coding/github-profile-viewer.html',
  'tools/text/text-to-speech.html'
];
const apiTools = apiHrefs.map(h => TOOLS.find(t => t.href === h)).filter(Boolean).map(toolLine);
const apiBlock = '\n' + apiTools.join('\n') + '\n';
const apiUrl = apiTools[0] ? apiTools[0].match(/\]\(([^)]+)\)/)[1] : '';
if (!llms.includes(apiUrl) && llms.includes('## Categories')) {
  llms = llms.replace('## Categories', apiBlock + '\n## Categories');
  console.log('llms.txt: inserted ' + apiTools.length + ' api-powered tool lines');
}

// category links
const catLine = { 'Color': '- [Color Tools](' + BASE + '/tools/color/index.html): Color mixing, blending, gradients, complementary and analogous scheme utilities.',
  'Construction': '- [Construction Tools](' + BASE + '/tools/construction/index.html): Concrete, gravel, rebar, CMU and construction cost calculators - all client-side.',
  'Files': '- [File Tools](' + BASE + '/tools/files/index.html): Split, join, generate and corrupt test files - entirely in your browser.' };
const audioCatAnchor = '- [Audio Tools](https://f9xr.org/troolify/tools/audio/index.html)';
if (!llms.includes('/tools/color/index.html')) {
  llms = llms.replace(catLine['Construction'].split(':')[0] + '](', 'X'); // no-op guard
  const ai = llms.indexOf(audioCatAnchor);
  if (ai !== -1) {
    const end = llms.indexOf('\n', ai) + 1;
    llms = llms.slice(0, end) + catLine['Color'] + '\n' + catLine['Construction'] + '\n' + llms.slice(end);
  } else console.log('WARN: Audio category anchor not found');
}
if (!llms.includes('/tools/files/index.html')) {
  const fin = llms.indexOf('- [Finance Tools](');
  if (fin !== -1) {
    const end = llms.indexOf('\n', fin) + 1;
    llms = llms.slice(0, end) + catLine['Files'] + '\n' + llms.slice(end);
  } else console.log('WARN: Finance category anchor not found');
}

// new pages in # LLMs section
if (!llms.includes('/pages/developers.html')) {
  const about = llms.indexOf('- [About Us](');
  if (about !== -1) {
    const end = llms.indexOf('\n', about) + 1;
    llms = llms.slice(0, end) +
      '- [Developers](https://f9xr.org/troolify/pages/developers.html): Site architecture, data and integration notes for developers.\n' +
      '- [Methodology](https://f9xr.org/troolify/pages/methodology.html): How tools are researched, built and reviewed.\n' + llms.slice(end);
  } else console.log('WARN: About Us anchor not found');
}

fs.writeFileSync(llmsPath, llms, 'utf8');
console.log('llms.txt: updated');

/* ---------- 3) ai.txt ---------- */
const aiPath = path.join(REPO, 'ai.txt');
let ai = fs.readFileSync(aiPath, 'utf8');
ai = ai.replace('- 220+ tools across 22 categories', '- 290+ tools across 25 categories');
ai = ai.replace('- 290+ tools across 25 categories', '- 300+ tools across 25 categories');
if (!ai.includes('abhi-api.vercel.app')) {
  ai = ai.replace('- 300+ tools across 25 categories',
    '- 300+ tools across 25 categories\n- A few optional tools are powered by a public web API (abhi-api.vercel.app) and always labelled on-page - the rest stay 100% client-side');
}
ai = ai.replace('All tools run 100% client-side in the browser - no data leaves your device.', 'Most tools run 100% client-side in the browser - a few are clearly labelled API-powered tools.');
ai = ai.replace('- Each tool is self-contained with no external dependencies', '- Most tools are self-contained with no external dependencies; the labelled API-powered tools call abhi-api.vercel.app');
ai = ai.replace('- 100% client-side processing, zero data retention', '- Processing is client-side with zero data retention (a few labelled tools call a public API)');
ai = ai.replace('- All processing happens in the browser', '- Nearly all processing happens in the browser (a few labelled tools call a public API)');
if (!ai.includes('Construction Tools')) {
  ai = ai.replace('- **HVAC Tools**:', '- **Construction Tools**: Concrete volume, slab/driveway/patio cost estimators, gravel and rebar calculators, CMU block, quote breakdowns.\n- **HVAC Tools**:');
}
if (!ai.includes('**Color Tools**')) {
  ai = ai.replace('- **Image Tools**:', '- **Color Tools**: Lighten/darken/invert, color mixer, gradient generator, complementary and analogous color schemes.\n- **Image Tools**:');
}
if (!ai.includes('**Files Tools**')) {
  ai = ai.replace('- **Misc Tools**:', '- **Files Tools**: Split/join text files, random file generator, corrupt a file.\n- **Misc Tools**:');
}
if (!ai.includes('/pages/developers.html')) {
  ai = ai.replace('- Visit `/pages/sitemap.html` for complete site map',
    '- Visit `/pages/sitemap.html` for complete site map\n- Read `/pages/developers.html` for site architecture and `/pages/methodology.html` for editorial methodology');
}
fs.writeFileSync(aiPath, ai, 'utf8');
console.log('ai.txt: updated');

console.log('construction tools in llms.txt: ' + constructionTools.length);
console.log('curated+color+files lines in llms.txt: ' + (curatedTools.length + colorTools.length + filesTools.length));