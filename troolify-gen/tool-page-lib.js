/* ============================================================================
   Troolify - shared tool page builder
   Emits a full canonical tool page (head + JSON-LD + hero + panel + SEO
   article + FAQ + keyword box + author box + related tools).
   Used by the gen-tools-batch*.js generators.
   ============================================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://f9xr.org/troolify';

global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'assets', 'js', 'tools-data.js'), 'utf8'));
const CATMAP = {};
(global.window.CATEGORIES || []).forEach(c => { CATMAP[c.folder] = { name: c.name, icon: c.icon, folder: c.folder }; });
/* URL folders are lower-case; alias them so lookups by spec.folder resolve. */
(global.window.CATEGORIES || []).forEach(c => { CATMAP[c.folder.toLowerCase()] = CATMAP[c.folder]; });

const DATE = '2026-10-10';
const DATE_LABEL = '10 October 2026';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function faqLd(faq) {
  return JSON.stringify(faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })));
}

function buildJsonLd(spec, url) {
  const cat = CATMAP[spec.folder] || { name: spec.catName || spec.folder, icon: 'fa-solid fa-cube' };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/index.html' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: BASE + '/tools/index.html' },
      { '@type': 'ListItem', position: 3, name: cat.name, item: BASE + '/tools/' + spec.folder + '/' },
      { '@type': 'ListItem', position: 4, name: spec.name, item: url }
    ]
  };
  const app = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: spec.name, url,
    applicationCategory: 'UtilitiesApplication', applicationSubCategory: spec.subApp || spec.tag,
    operatingSystem: 'Any (web browser)', featureList: spec.featureList || [],
    description: spec.metaDesc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    datePublished: DATE, dateModified: DATE,
    author: { '@type': 'Organization', name: 'F9XR Development Team', url: 'https://f9xr.org/' },
    publisher: { '@type': 'Organization', name: 'Troolify', url: BASE + '/', logo: { '@type': 'ImageObject', url: BASE + '/assets/images/logo_nobg.webp', width: 1407, height: 768 } }
  };
  const article = {
    '@context': 'https://schema.org', '@type': 'Article', headline: spec.article.title,
    description: spec.metaDesc, image: BASE + '/assets/images/og-image.jpg',
    datePublished: DATE, dateModified: DATE, mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'F9XR Development Team', url: 'https://f9xr.org/' },
    publisher: { '@type': 'Organization', name: 'Troolify', url: BASE + '/', logo: { '@type': 'ImageObject', url: BASE + '/assets/images/logo_nobg.webp', width: 1407, height: 768 } }
  };
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: JSON.parse(faqLd(spec.article.faq)) };
  return [breadcrumb, app, article, faq].map(o => '<script type="application/ld+json">' + JSON.stringify(o) + '</script>').join('');
}

/* Default page-specific CSS so every generated page renders cleanly.
   Individual specs can add more via spec.css. */
const BASE_CSS =
  '.io-grid{display:grid;grid-template-columns:1fr;gap:14px}' +
  '@media(min-width:820px){.io-grid.two{grid-template-columns:1fr 1fr}}' +
  '.io-field{display:flex;flex-direction:column;gap:6px}' +
  '.io-field label{font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.03em;text-transform:uppercase}' +
  '.io-field textarea{min-height:220px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:12px;padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13.5px;line-height:1.55;resize:vertical}' +
  '.io-field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.15);outline:none}' +
  '.io-field input,.io-field select{background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;width:100%;box-sizing:border-box}' +
  '.result-card{background:linear-gradient(180deg,rgba(59,130,246,.12),rgba(59,130,246,.03));border:1px solid rgba(96,165,250,.25);border-radius:14px;padding:16px;margin-top:14px}' +
  '.result-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}' +
  '.result-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px}' +
  '.rt-label{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);font-weight:700}' +
  '.rt-value{font-size:18px;font-weight:800;color:#93C5FD;margin-top:2px;word-break:break-word}' +
  '.rt-sub{font-size:12px;color:var(--muted);margin-top:2px}' +
  '.field{display:flex;flex-direction:column;gap:6px}' +
  '.field label{font-size:12.5px;font-weight:700;color:var(--muted)}' +
  '.field input,.field select,.field textarea{background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;width:100%;box-sizing:border-box}' +
  '.row3{display:grid;grid-template-columns:1fr;gap:14px}@media(min-width:640px){.row3{grid-template-columns:1fr 1fr 1fr}}' +
  '.stat b{color:#93C5FD}' +
  '.btn-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-top:14px}';

function tocHtml(items) {
  return '<details class="toc"><summary>On this page</summary><ol>' +
    items.map(i => '<li><a href="#' + i.id + '"><i class="' + i.icon + '"></i>' + i.label + '</a></li>').join('') +
    '</ol></details>';
}

function buildArticle(a) {
  const toc = [];
  const out = [];
  out.push('<h2 id="article-title">' + a.title + '</h2>');
  out.push(a.lead);
  for (const s of (a.sections || [])) {
    toc.push({ id: s.id, icon: s.icon || 'fa-solid fa-circle-info', label: s.toc || s.heading });
    out.push(a.sections[0].badge === undefined ? '' : '');
    out.push('<h2 id="' + s.id + '">' + s.heading + '</h2>' + s.html);
  }
  if (a.steps && a.steps.length) {
    toc.push({ id: 'how-to-use', icon: 'fa-solid fa-list-ol', label: 'How to use ' + a.toolName });
    out.push('<h2 id="how-to-use">How to use ' + a.toolName + '</h2><ol>' + a.steps.map(s => '<li>' + s + '</li>').join('') + '</ol>');
  }
  if (a.facts && a.facts.length) {
    toc.push({ id: 'facts', icon: 'fa-solid fa-table', label: 'Quick facts' });
    out.push('<h2 id="facts">Quick facts</h2><table><thead><tr><th scope="col">Feature</th><th scope="col">Detail</th></tr></thead><tbody>' +
      a.facts.map(([k, v]) => '<tr><td>' + k + '</td><td>' + v + '</td></tr>').join('') + '</tbody></table>');
  }
  if (a.useCases && a.useCases.length) {
    toc.push({ id: 'use-cases', icon: 'fa-solid fa-users', label: 'Use cases' });
    out.push('<h2 id="use-cases">Use cases</h2>' + a.useCases.map(([h, p], i) => '<h3>' + (i + 1) + '. ' + h + '</h3><p>' + p + '</p>').join(''));
  }
  if (a.tips && a.tips.length) {
    toc.push({ id: 'tips', icon: 'fa-solid fa-lightbulb', label: 'Tips' });
    out.push('<h2 id="tips">Tips for getting accurate results</h2><ul>' + a.tips.map(t => '<li>' + t + '</li>').join('') + '</ul>');
  }
  if (a.takeaways && a.takeaways.length) {
    toc.push({ id: 'key-takeaways', icon: 'fa-solid fa-key', label: 'Key takeaways' });
    out.push('<h2 id="key-takeaways">Key takeaways</h2><ul>' + a.takeaways.map(t => '<li>' + t + '</li>').join('') + '</ul>');
  }
  toc.push({ id: 'faq', icon: 'fa-solid fa-circle-question', label: 'Frequently asked questions' });
  out.push('<hr class="divider" aria-hidden="true"><h2 id="faq">Frequently asked questions</h2>' +
    a.faq.map(([q, ans]) => '<details class="faq-item"><summary>' + q + '</summary><div class="faq-a"><p>' + ans + '</p></div></details>').join(''));
  if (a.conclusion) {
    toc.push({ id: 'conclusion', icon: 'fa-solid fa-flag-checkered', label: 'Conclusion' });
    out.push('<h2 id="conclusion">Conclusion</h2>' + a.conclusion);
  }
  return { html: out.join(''), toc };
}

function buildPage(spec) {
  const cat = CATMAP[spec.folder] || { name: spec.catName || spec.folder, icon: 'fa-solid fa-cube' };
  const url = BASE + '/tools/' + spec.folder + '/' + spec.file;
  const related = spec.related || [];
  const article = buildArticle(Object.assign({ toolName: spec.name }, spec.article));

  const head = '<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta name="viewport"content="width=device-width,initial-scale=1">' +
    '<title>' + spec.title + '</title>' +
    '<meta name="description"content="' + spec.metaDesc + '">' +
    '<meta name="author"content="F9XR Development Team">' +
    '<meta name="robots"content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">' +
    '<meta name="theme-color"content="#212529">' +
    '<link rel="canonical"href="' + url + '">' +
    '<meta property="og:site_name"content="Troolify">' +
    '<meta property="og:locale"content="en_US">' +
    '<meta property="og:title"content="' + spec.title + '">' +
    '<meta property="og:description"content="' + spec.metaDesc + '">' +
    '<meta property="og:type"content="article">' +
    '<meta property="og:url"content="' + url + '">' +
    '<meta property="og:image"content="' + BASE + '/assets/images/og-image.jpg">' +
    '<meta property="og:image:width"content="1200"><meta property="og:image:height"content="630">' +
    '<meta property="article:published_time"content="' + DATE + '">' +
    '<meta property="article:modified_time"content="' + DATE + '">' +
    '<meta property="article:section"content="' + cat.name + '">' +
    '<meta property="article:tag"content="' + spec.tag + '">' +
    '<meta property="article:tag"content="' + cat.name + '">' +
    '<meta name="twitter:card"content="summary_large_image">' +
    '<meta name="twitter:title"content="' + spec.title + '">' +
    '<meta name="twitter:description"content="' + spec.metaDesc + '">' +
    '<meta name="twitter:image"content="' + BASE + '/assets/images/og-image.jpg">' +
    buildJsonLd(spec, url) +
    '<link rel="icon"type="image/webp"href="../../assets/images/favicon.webp">' +
    '<link rel="icon"type="image/x-icon"href="../../assets/images/favicon.ico">' +
    '<link rel="stylesheet"href="../../assets/css/jakarta.min.css">' +
    '<link rel="stylesheet"href="../../assets/css/icons.min.css">' +
    '<link rel="stylesheet"href="../../assets/css/tailwind.min.css">' +
    '<link rel="stylesheet"href="../../assets/css/tool-shared.min.css">' +
    '<link rel="stylesheet"href="../../assets/css/tool.min.css">' +
    '<link rel="stylesheet"href="../../assets/css/site-shell.min.css">' +
    '<link rel="stylesheet"href="../../assets/css/tool-page.min.css">' +
    '<link rel="preload"as="style"href="../../assets/css/seo-article.min.css">' +
    '<link rel="stylesheet"href="../../assets/css/seo-article.min.css"media="print"onload="this.media=&#39;all&#39;">' +
    '<noscript><link rel="stylesheet"href="../../assets/css/seo-article.min.css"></noscript>' +
    '<style>' + BASE_CSS + (spec.css || '') + '</style>' +
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-1D3C2DDCHV"></script>' +
    '<script>function gtag(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","G-1D3C2DDCHV");</script></head>';

  const noscript = '<body data-layout="tool"><noscript><nav aria-label="Primary"style="position:static;display:block;padding:1rem 1.5rem;background:#212529;border-bottom:1px solid #343A40;text-align:center;font-size:0.9rem;">' +
    '<a href="../../index.html"style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">Home</a> ' +
    '<a href="../../tools/index.html"style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">Tools</a> ' +
    '<a href="../../pages/about.html"style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">About</a> ' +
    '<a href="../../pages/contact.html"style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">Contact</a></nav></noscript>';

  const hero = '<main class="tool-main"><div class="container"><div class="tool-head hero">' +
    '<nav class="breadcrumbs"aria-label="Breadcrumb"><ol>' +
    '<li><a href="../../index.html"><i class="fa-solid fa-house"></i>Home</a></li>' +
    '<li><a href="../../tools/index.html">Tools</a></li>' +
    '<li><a href="./index.html">' + cat.name + '</a></li>' +
    '<li class="current"aria-current="page">' + spec.name + '</li></ol></nav>' +
    '<div class="hero-main"><span class="tool-badge"><span class="dot"></span>100% client-side &middot; zero data retention</span>' +
    '<h1>' + spec.name + '</h1><p>' + spec.desc + '</p></div>' +
    '<div class="hero-box hero-cat"><h3 class="hero-box-title"><i class="fa-solid fa-folder-open"></i>Category</h3>' +
    '<div class="tool-meta"><span class="tool-tag"><i class="fa-solid fa-tag"></i>' + spec.tag + '</span> ' +
    '<a class="tool-cat"href="./index.html"aria-label="Browse ' + esc(cat.name) + ' category"><i class="fa-solid fa-folder"></i>' + cat.name + '</a></div></div>' +
    '<div class="hero-box hero-qa"><h3 class="hero-box-title"><i class="fa-solid fa-bolt"></i>Quick Actions</h3>' +
    '<div class="tool-actions"><button class="rt-btn"type="button"id="btnShare"><i class="fa-solid fa-share-nodes"></i>Share</button> ' +
    '<button class="rt-btn"type="button"id="btnEmbed"><i class="fa-solid fa-code"></i>Embed Tool</button> ' +
    '<a class="rt-btn"href="../../pages/feedback.html"><i class="fa-solid fa-comment"></i>Feedback</a></div></div>' +
    '<div class="hero-box hero-details"><h3 class="hero-box-title"><i class="fa-solid fa-circle-info"></i>Tool Details</h3>' +
    '<div class="tool-details">' +
    '<div class="detail-row"><span class="detail-label"><i class="fa-solid fa-pen-nib"></i>Published by</span><a class="detail-value"href="https://f9xr.org/"target="_blank"rel="noopener">F9XR Development Team</a></div>' +
    '<div class="detail-row"><span class="detail-label"><i class="fa-solid fa-check-double"></i>Reviewed by</span><a class="detail-value"href="../../press/editorial-policies.html">Review Board</a></div>' +
    '<div class="detail-row"><span class="detail-label"><i class="fa-solid fa-clock-rotate-left"></i>Last updated</span><span class="detail-value">' + DATE_LABEL + '</span></div>' +
    '</div></div></div>';

  const disclaimer = '<aside class="disclaimer"aria-label="Disclaimer"><i class="fa-solid fa-circle-info"></i><p>Disclaimer: Whilst every effort has been made in building our tools, we are not to be held liable for any damages or monetary losses arising out of or in connection with their use. <a href="../../press/disclaimer.html">Full disclaimer</a>.</p></aside>';

  const articleBlock = '<div class="article-layout"><article class="seo-article">' + article.html + '</article></div>';

  const keywordBox = '<section class="keyword-box"aria-label="Keywords and tags"><h2>Keyword &amp; Tags</h2><h3>Keywords</h3><div class="keywords">' +
    spec.keywords.map(k => '<span class="keyword">' + esc(k) + '</span>').join(' ') + '</div>' +
    '<h3>Tags</h3><div class="tags"><a class="tag"href="./index.html"><i class="fa-solid fa-tag"></i>' + spec.tag + '</a> ' +
    '<a class="tag"href="./index.html"><i class="fa-solid fa-folder"></i>' + cat.name + '</a> ' +
    '<a class="tag"href="../../tools/index.html"><i class="fa-solid fa-cube"></i>' + spec.folder.charAt(0).toUpperCase() + spec.folder.slice(1) + '</a></div></section>';

  const authorBox = '<section class="author-box"aria-label="About the publisher"><div class="author-avatar"aria-hidden="true"><img src="https://f9xr.org/articles/logo.webp"alt="F9XR Development Team logo"loading="lazy"decoding="async"width="1407"height="768"></div><div>' +
    '<span class="author-role">Published by</span><h2>F9XR Development Team</h2>' +
    '<p>Every Troolify tool is built and reviewed by the F9XR Development Team, then checked by our Review Board for correctness, accessibility, and clarity before publication. Tools run 100% client-side with zero data retention.</p>' +
    '<div class="author-links"><a href="https://f9xr.org/"target="_blank"rel="noopener"><i class="fa-solid fa-globe"></i>F9XR Team</a> ' +
    '<a href="../../press/editorial-policies.html"><i class="fa-solid fa-scale-balanced"></i>Editorial Policies</a> ' +
    '<a href="https://github.com/f9xr"target="_blank"rel="noopener"aria-label="F9XR on GitHub"><i class="fa-brands fa-github"></i>GitHub</a> ' +
    '<a href="https://linkedin.com/company/f9xrteam"target="_blank"rel="noopener"aria-label="F9XR on LinkedIn"><i class="fa-brands fa-linkedin"></i>LinkedIn</a> ' +
    '<a href="https://instagram.com/f9xrteam"target="_blank"rel="noopener"aria-label="F9XR on Instagram"><i class="fa-brands fa-instagram"></i>Instagram</a> ' +
    '<a href="https://youtube.com/@QuarterlyLIV"target="_blank"rel="noopener"aria-label="F9XR on YouTube"><i class="fa-brands fa-youtube"></i>YouTube</a> ' +
    '<a href="https://f9xr.org/pages/contact.html"target="_blank"rel="noopener"><i class="fa-solid fa-envelope"></i>Contact</a></div></div></section>';

  const relatedTools = '<section class="related-tools"aria-label="Related tools"><h2>Related Tools</h2>' +
    '<div class="related-search"><i class="fa-solid fa-magnifying-glass"aria-hidden="true"></i> <input type="search"id="relatedSearch"placeholder="Search all Troolify tools&hellip;"autocomplete="off"aria-label="Search related tools"></div>' +
    '<div class="related-grid"id="relatedGrid"aria-busy="true">' +
    '<div class="skel skel-related-card"aria-hidden="true"><span class="skel skel-icon"></span><span class="skel skel-line skel-w-70"></span><span class="skel skel-line skel-w-90"></span><span class="skel skel-line skel-w-60"></span><span class="skel skel-line skel-more"></span></div>' +
    '<div class="skel skel-related-card"aria-hidden="true"><span class="skel skel-icon"></span><span class="skel skel-line skel-w-70"></span><span class="skel skel-line skel-w-90"></span><span class="skel skel-line skel-w-60"></span><span class="skel skel-line skel-more"></span></div>' +
    '<div class="skel skel-related-card"aria-hidden="true"><span class="skel skel-icon"></span><span class="skel skel-line skel-w-70"></span><span class="skel skel-line skel-w-90"></span><span class="skel skel-line skel-w-60"></span><span class="skel skel-line skel-more"></span></div>' +
    '</div></section>';

  const comments = '<section class="comments"aria-label="Comments"><h2>Comments</h2><div id="comments"><div class="comments-host"data-utteranc data-repo="f9xr/troolify"data-issue-term="pathname"data-theme="github-dark"></div></div></section>' +
    '<div class="section-divider"aria-hidden="true"><span></span><i class="fa-solid fa-layer-group"></i><span></span></div></div></main>';

  const scripts = '<script src="../../assets/js/layout.min.js"defer></script><script src="../../assets/js/tool-page.min.js"defer></script>' +
    (spec.js ? '<script>!function(){"use strict";' + spec.js + '}();</script>' : '');

  const panel = spec.panel;

  return head + noscript + hero + panel + disclaimer + tocHtml(article.toc) + articleBlock + keywordBox + authorBox + relatedTools + comments + scripts + '</body></html>';
}

module.exports = { buildPage, BASE, DATE, DATE_LABEL, esc, registerTools, CATMAP };

function q(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }

function entryLine(e) {
  return '  { name:' + q(e.name) + ', desc:' + q(e.desc) + ', icon:' + q(e.icon) + ', tag:' + q(e.tag) +
    ', category:' + q(e.category) + ', href:' + q(e.href) + ', keywords:[' + (e.keywords || []).map(q).join(',') + '] },';
}

/* Append entries to window.TOOLS in assets/js/tools-data.js (idempotent by href). */
function registerTools(entries) {
  const file = path.join(ROOT, 'assets', 'js', 'tools-data.js');
  let src = fs.readFileSync(file, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  const catIdx = src.indexOf('window.CATEGORIES');
  const closeIdx = src.lastIndexOf('];', catIdx);
  const existing = new Set(Array.from(src.matchAll(/href:"([^"]+)"/g), m => m[1]));
  const fresh = entries.filter(e => !existing.has(e.href));
  if (!fresh.length) return { added: 0, skipped: entries.length };
  const block = fresh.map(entryLine).join(nl);
  src = src.slice(0, closeIdx) + block + nl + src.slice(closeIdx);
  fs.writeFileSync(file, src);
  return { added: fresh.length, skipped: entries.length - fresh.length };
}
