/* Create tools/prompts/ai-seo-audit-md-report-prompt-generator.html from the
   monthly audit template: head/body text updated, check names renewed,
   format heading "MD report" cues added, fields stable. */
const fs = require('fs');
const src = 'tools/prompts/advanced-monthly-website-audit-prompt-generator.html';
const dst = 'tools/prompts/ai-seo-audit-md-report-prompt-generator.html';
let t = fs.readFileSync(src, 'utf8');

/* file slug refs */
t = t.split(src).join(dst);

/* head meta rename */
t = t.split('Advanced Monthly Website Audit Prompt Generator').join('AI SEO Audit MD Report Prompt Generator');
t = t.replace(/Generate prompts that run the 15 monthly website audits with severity ranked findings and ready to deploy fixes\. Pick your checks and copy the prompt\./,
  'Generate a ready-to-paste prompt that audits a live site for AI search visibility, technical SEO, schema, E-E-A-T, Core Web Vitals and content quality, then returns a structured Markdown audit report.');

/* breadcrumbs current page */
t = t.replace('<li class="current"aria-current="page">Monthly Website Audit Prompt</li>',
              '<li class="current"aria-current="page">AI SEO Audit MD Report Prompt</li>');

/* hero h1 + p */
t = t.replace('<h1>Monthly Website Audit Prompt Generator</h1>', '<h1>AI SEO Audit MD Report Prompt Generator</h1>');
t = t.replace('<p>Describe the business, tick the checks you want, choose a depth, and get a ready to paste prompt that runs the 15 recurring website audits and returns ranked findings with the exact fix attached to each one.</p>',
            '<p>Describe the site, tick the AI SEO audit checks you want, choose a depth and get a paste-ready prompt that bundles MD-report audit instruction across 15 checks.</p>');

/* tool label */
t = t.replace(/<span class="tool-label"><i class="fa-solid fa-list-check"><\/i>Monthly Website Audit Prompt Generator<\/span>/g,
              '<span class="tool-label"><i class="fa-solid fa-list-check"></i>AI SEO Audit MD Report Prompt Generator</span>');

/* checkbox list: change names in HTML and in the script array */
const names = [
  // HTML label text | script time | script tools
  ['AI Overview and AEO visibility', '20 min', 'Perplexity, ChatGPT browsing'],
  ['Entity and knowledge graph', '15 min', 'Google Knowledge Graph search'],
  ['Schema and rich result eligibility', '15 min', 'Google Rich Results Test'],
  ['E-E-A-T and author credibility', '15 min', 'Author bios review'],
  ['Core Web Vitals and UX', '15 min', 'PageSpeed Insights'],
  ['Content freshness and duplication', '20 min', 'Siteliner, Screaming Frog'],
  ['Crawl, robots and canonicals', '10 min', 'robots.txt review, Search Console'],
  ['Sitemaps and indexation', '10 min', 'XML sitemaps, Search Console'],
  ['Mobile responsiveness', '10 min', 'Mobile emulator, Search Console'],
  ['On-page intent and headings', '15 min', 'Manual review'],
  ['Internal linking and AI navigation', '10 min', 'Screaming Frog'],
  ['Security, privacy and consent', '10 min', 'Browser checklist'],
  ['Google Business Profile and local signals', '10 min', 'GBP, manual search'],
  ['Answer-targeting and formatting', '15 min', 'Top-answer review'],
  ['Broken links and assets', '15 min', 'Broken link checker, Screaming Frog'],
];
for (let i = 0; i < names.length; i++) {
  const n = i + 1;
  const nm = names[i][0];
  t = t.replace(new RegExp('(<span class="num">' + n + '\\.</span> )[^<]+(</label>)'), `$1${nm}$2`);
}

/* prompt script array: replace name/time/tools entries */
t = t.replace(/var e=\[[\s\S]*?\]\s*,t=/, 'var e=[' + names.map((n,i) => '{id:' + (i+1) + ',name:"' + n[0] + '",time:"' + n[1] + '",tools:"' + n[2] + '"}').join(',') + '],t=');

/* count label */
t = t.replace('>All 15<', '>All 15<');
t = t.replace('Monthly checks to include', 'AI SEO audit checks to include');
t = t.replace('aria-label="Monthly website audits to include"', 'aria-label="AI SEO audit checks to include"');

/* audit scope string + generics in script */
t = t.split('15 MONTHLY CHECKS').join('15 AUDIT CHECKS');
t = t.split('Tick at least 1 of the 15 monthly checks before generating.').join('Tick at least 1 of the 15 audit checks before generating.');
t = t.split('monthly-website-audit-prompt.txt').join('ai-seo-audit-md-report-prompt.txt');

/* audit role + report pass guidance */
t = t.replace('You are auditing a live website and reporting only what you can defend.',
              'You are auditing a live website and reporting only what you can defend.');

fs.writeFileSync(dst, t, 'utf8');
console.log('written', dst, 'length', t.length);
