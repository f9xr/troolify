const fs = require('fs');

// Load catalog data from tools-data.js
global.window = {};
eval(fs.readFileSync('assets/js/tools-data.js', 'utf8'));
const TOOLS = window.TOOLS || [];
const CATS = window.CATEGORIES || [];

const byFolder = {};
TOOLS.forEach(t => { (byFolder[t.category] = byFolder[t.category] || []).push(t); });

// Main + Information keep current links (static pages)
const mainSection = { title: 'Main', icon: 'fa-house', links: [
  ['../index.html', 'Home'],
  ['../tools/index.html', 'Tools'],
  ['about.html', 'About'],
  ['contact.html', 'Contact'],
  ['feedback.html', 'Feedback & Suggestions'],
  ['sitemap.html', 'Sitemap'],
]};
const infoSection = { title: 'Information', icon: 'fa-circle-info', links: [
  ['../press/disclaimer.html', 'Disclaimer'],
  ['privacy-policy.html', 'Privacy Policy'],
  ['terms.html', 'Terms of Service'],
  ['../press/editorial-policies.html', 'Editorial Policies'],
  ['accessibility-statement.html', 'Accessibility Statement'],
  ['developers.html', 'Developers'],
  ['methodology.html', 'Methodology'],
]};

const sections = [mainSection, infoSection];
CATS.forEach(c => {
  const tools = (byFolder[c.folder] || []).sort((a, b) => a.name.localeCompare(b.name));
  if (!tools.length) return;
  sections.push({ title: c.name, icon: c.icon, links: [['../' + c.indexHref || ('tools/' + c.folder.toLowerCase() + '/index.html'), c.name + ' — Category Index'].slice(0,0), ...Object.entries({})] });
});

// Build sections: one per category with its tools (flat grid), plus category index links section
let sectionsHtml = '';
function linkHtml(href, label) {
  return `<a class="sitemap-link" href="${href}"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>${label}</a>`;
}
function sectionHtml(title, icon, links) {
  return `<section class="sitemap-section"><h2 class="sitemap-h2"><i class="fa-solid ${icon}" aria-hidden="true"></i>${title} <span class="sitemap-n">${links.length}</span></h2><div class="sitemap-grid">${links.map(l => linkHtml(l[0], l[1])).join('')}</div></section>`;
}

sectionsHtml += sectionHtml('Main', 'fa-house', mainSection.links);
sectionsHtml += sectionHtml('Information', 'fa-circle-info', infoSection.links);

// Category sections: index page first, then each tool
CATS.forEach(c => {
  const tools = (byFolder[c.folder] || []).sort((a, b) => a.name.localeCompare(b.name));
  if (!tools.length) return;
  const links = [['../tools/' + c.folder.toLowerCase() + '/index.html', c.name + ' Index']];
  tools.forEach(t => {
    // t.href is like "tools/audio/song-length-calculator.html"
    links.push(['../' + t.href, t.name]);
  });
  sectionsHtml += sectionHtml(c.name, c.icon, links);
});

const main = `<main class="container sitemap-main"><div class="eyebrow">SITEMAP &middot; TROOLIFY</div><h1 class="heading-1">Sitemap</h1><p class="section-description sitemap-sub">Every page on Troolify, organized for easy browsing.</p><div class="sitemap-toolbar"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input id="sitemapSearch" type="search" placeholder="Filter pages and tools&hellip;" aria-label="Filter sitemap links"><span id="sitemapCount" class="sitemap-count"></span></div>${sectionsHtml}</main>`;

let t = fs.readFileSync('pages/sitemap.html', 'utf8');
t = t.replace(/<main[\s\S]*?<\/main>/, main);
fs.writeFileSync('pages/sitemap.html', t);
console.log('categories:', CATS.length, 'tools:', TOOLS.length);
