/* ============================================================================
   Troolify - batch 18
   SEO generators migrated from allinonetools.net (client-side feasible).
   Run: node troolify-gen/gen-tools-batch18.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

function tiles(pairs) {
  return '<div class="result-card"><div class="result-grid">' +
    pairs.map(p => '<div class="result-tile"><div class="rt-label">' + p[0] + '</div><div class="rt-value"id="' + p[1] + '">-</div></div>').join('') +
    '</div></div>';
}
function go(prefix, label) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-wand-magic-sparkles"></i>' + (label || 'Generate') + '</button></div>';
}
function ta(id, label, ph, val) {
  return '<div class="io-field"><label for="' + id + '">' + label + '</label><textarea id="' + id + '"spellcheck="false"placeholder="' + ph + '">' + (val || '') + '</textarea></div>';
}
function inp(id, label, val, type) {
  return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '"type="' + (type || 'text') + '"value="' + val + '"></div>';
}
function outTa(id) {
  return '<div class="io-field"><label for="' + id + '">Output</label><textarea id="' + id + '"readonly style="min-height:220px"></textarea></div>';
}
const COPY_BTN = ' <button class="rt-btn"type="button"id="PREFIXCopy"><i class="fa-solid fa-copy"></i>Copy</button>';
function actions(prefix, label) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-wand-magic-sparkles"></i>' + (label || 'Generate') + '</button>' +
    ' <button class="rt-btn"type="button"id="' + prefix + 'Copy"><i class="fa-solid fa-copy"></i>Copy</button></div>';
}

/* ========================================================================
   1. ROBOTS.TXT GENERATOR
   ======================================================================== */
add({
  file: 'robots-txt-generator.html', folder: 'seo',
  name: 'Robots.txt Generator', tag: 'SEO', icon: 'fa-solid fa-robot',
  title: 'Robots.txt Generator | Create a Robots.txt File',
  metaDesc: 'Generate a valid robots.txt file with allow, disallow, sitemap and crawl-delay rules. Copy ready-to-paste output. Free and in-browser.',
  desc: 'Build a clean robots.txt with user-agent rules, disallowed paths and a sitemap reference, ready to paste.',
  keywords: ['robots.txt generator', 'robots file', 'crawl rules', 'disallow', 'sitemap', 'seo tool'],
  featureList: ['Allow / disallow rules', 'Sitemap reference', 'Crawl delay', '100% client-side'],
  panel: panel.wrap('rob', 'fa-solid fa-robot', 'Robots.txt generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('robAgent', 'User-agent', '*') + inp('robSitemap', 'Sitemap URL', 'https://example.com/sitemap.xml') +
    '<div class="field"style="margin-top:10px"><label for="robDelay">Crawl delay (seconds, optional)</label><input id="robDelay"type="number"min="0"value=""></div></div>' +
    '<div>' + ta('robDisallow', 'Disallow paths (one per line)', '/admin/\n/cart/', '/admin/\n/cart/') + '</div></div>' +
    actions('rob') + outTa('robOut')),
  js: `
    function gen(){var a=document.getElementById("robAgent").value||"*";var d=document.getElementById("robDisallow").value.split(/\\n+/).filter(function(x){return x.trim()});var s=document.getElementById("robSitemap").value.trim();var delay=document.getElementById("robDelay").value;
      var out="User-agent: "+a+"\\n";d.forEach(function(p){out+="Disallow: "+p.trim()+"\\n";});if(!d.length)out+="Disallow:\\n";
      if(delay)out+="Crawl-delay: "+delay+"\\n";out+="\\n";if(s)out+="Sitemap: "+s+"\\n";
      document.getElementById("robOut").value=out;document.getElementById("robProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    ["robAgent","robDisallow","robSitemap","robDelay"].forEach(function(id){document.getElementById(id).addEventListener("input",gen);});
    document.getElementById("robGo").addEventListener("click",gen);
    document.getElementById("robCopy").addEventListener("click",function(){document.getElementById("robOut").select();document.execCommand("copy");});gen();`,
  article: {
    title: 'Robots.txt Generator: Control Crawler Access',
    lead: '<p>Robots.txt tells search engine crawlers which paths to avoid. This <strong>robots.txt generator</strong> builds a valid file with rules, a crawl delay and a sitemap reference.</p>',
    sections: [
      { id: 'rules', icon: 'fa-solid fa-robot', heading: 'How rules work', html: '<p>Each block starts with a <code>User-agent</code> and lists <code>Disallow</code> paths. An empty Disallow allows everything; a Disallow of <code>/</code> blocks the whole site.</p>' },
      { id: 'note', icon: 'fa-solid fa-triangle-exclamation', heading: 'Good to know', html: '<p>Robots.txt is a request, not enforcement, and is not a security measure. Never rely on it to hide private pages - use authentication instead.</p>' }
    ],
    steps: ['Set the user-agent and any disallow paths.', 'Optionally add a sitemap and crawl delay.', 'Copy the file to your site root.'],
    facts: [['Output', 'robots.txt text'], ['Rules', 'Allow / disallow'], ['Placement', 'Site root'], ['Data handling', 'Runs locally']],
    useCases: [['Blocking admin', 'Hide admin paths.'], ['Sitemaps', 'Point crawlers to your map.'], ['Crawl control', 'Limit aggressive bots.']],
    tips: ['Upload to the domain root.', 'Reference your full sitemap URL.', 'Do not use it for security.'],
    takeaways: ['Robots.txt guides crawlers.', 'It is not access control.', 'Keep it at the site root.'],
    faq: [['Does it block all bots?', 'Only compliant crawlers honour it.'], ['Where do I put it?', 'In the site root.'], ['Can I allow and disallow the same bot?', 'Use separate user-agent blocks.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Generate a matching <a href="xml-sitemap-generator.html">XML sitemap</a> too.</p>'
  }
});

/* ========================================================================
   2. XML SITEMAP GENERATOR
   ======================================================================== */
add({
  file: 'xml-sitemap-generator.html', folder: 'seo',
  name: 'XML Sitemap Generator', tag: 'SEO', icon: 'fa-solid fa-sitemap',
  title: 'XML Sitemap Generator | Create a Sitemap.xml',
  metaDesc: 'Generate a valid XML sitemap from a list of URLs with lastmod, changefreq and priority. Copy ready-to-paste output. Free and in-browser.',
  desc: 'Turn a list of page URLs into a standards-compliant XML sitemap with optional metadata.',
  keywords: ['xml sitemap generator', 'sitemap.xml', 'create sitemap', 'url list', 'lastmod', 'seo tool'],
  featureList: ['URL list input', 'lastmod / priority', 'Valid XML', '100% client-side'],
  panel: panel.wrap('xsm', 'fa-solid fa-sitemap', 'XML sitemap generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    ta('xsmUrls', 'Page URLs (one per line)', 'https://example.com/\nhttps://example.com/about/', 'https://example.com/\nhttps://example.com/about/\nhttps://example.com/contact/') +
    '<div>' + inp('xsmLastmod', 'Last modified (YYYY-MM-DD)', '2026-10-19', 'date') +
    '<div class="field"style="margin-top:10px"><label for="xsmFreq">Change frequency</label><select id="xsmFreq"><option>always</option><option>hourly</option><option>daily</option><option selected>weekly</option><option>monthly</option><option>yearly</option><option>never</option></select></div>' +
    '<div class="field"style="margin-top:10px"><label for="xsmPri">Priority</label><input id="xsmPri"type="number"min="0"max="1"step="0.1"value="0.8"></div></div></div>' +
    actions('xsm') + outTa('xsmOut')),
  js: `
    function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
    function gen(){var urls=document.getElementById("xsmUrls").value.split(/\\n+/).filter(function(x){return x.trim()});var lm=document.getElementById("xsmLastmod").value;var fq=document.getElementById("xsmFreq").value;var pr=document.getElementById("xsmPri").value;
      var out='<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';
      urls.forEach(function(u){out+="  <url>\\n    <loc>"+esc(u.trim())+"</loc>\\n"+(lm?"    <lastmod>"+lm+"</lastmod>\\n":"")+"    <changefreq>"+fq+"</changefreq>\\n    <priority>"+pr+"</priority>\\n  </url>\\n";});
      out+="</urlset>";document.getElementById("xsmOut").value=out;document.getElementById("xsmProc").textContent="Generated "+urls.length+" URLs - 0 bytes uploaded.";}
    ["xsmUrls","xsmLastmod","xsmFreq","xsmPri"].forEach(function(id){document.getElementById(id).addEventListener("input",gen);});
    document.getElementById("xsmGo").addEventListener("click",gen);
    document.getElementById("xsmCopy").addEventListener("click",function(){document.getElementById("xsmOut").select();document.execCommand("copy");});gen();`,
  article: {
    title: 'XML Sitemap Generator: List Your Pages',
    lead: '<p>A sitemap helps search engines find every page. This <strong>XML sitemap generator</strong> turns a URL list into valid sitemap.xml markup with optional lastmod, changefreq and priority.</p>',
    sections: [
      { id: 'format', icon: 'fa-solid fa-sitemap', heading: 'The sitemap format', html: '<p>Each page is a <code>url</code> element with a <code>loc</code> and optional metadata. The file must be UTF-8 and well-formed XML.</p>' },
      { id: 'submit', icon: 'fa-solid fa-paper-plane', heading: 'Submitting', html: '<p>Place sitemap.xml at your root and reference it from robots.txt, then submit it in your search console.</p>' }
    ],
    steps: ['Paste one URL per line.', 'Set metadata options.', 'Copy the XML to sitemap.xml.'],
    facts: [['Output', 'sitemap.xml'], ['Fields', 'loc, lastmod, priority'], ['Limit', '50,000 URLs per file'], ['Data handling', 'Runs locally']],
    useCases: [['New sites', 'Speed up discovery.'], ['Large sites', 'Enumerate pages.'], ['Updates', 'Flag changed pages.']],
    tips: ['Use absolute URLs.', 'Keep under 50,000 URLs per file.', 'Reference it in robots.txt.'],
    takeaways: ['Sitemaps enumerate URLs for crawlers.', 'Metadata is optional.', 'Keep files well-formed.'],
    faq: [['Do sitemaps boost rankings?', 'They aid discovery, not ranking directly.'], ['Absolute or relative URLs?', 'Absolute URLs are required.'], ['Max file size?', '50,000 URLs or 50 MB.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Link it from a <a href="robots-txt-generator.html">robots.txt file</a>.</p>'
  }
});

/* ========================================================================
   3. HTML SITEMAP GENERATOR
   ======================================================================== */
add({
  file: 'html-sitemap-generator.html', folder: 'seo',
  name: 'HTML Sitemap Generator', tag: 'SEO', icon: 'fa-solid fa-list-tree',
  title: 'HTML Sitemap Generator | Human-Readable Page List',
  metaDesc: 'Turn a list of pages into a linked HTML sitemap for visitors. Copy ready-to-paste HTML. Free, private and fully in-browser.',
  desc: 'Convert a title and URL list into a clean, linked HTML sitemap for your visitors.',
  keywords: ['html sitemap generator', 'html sitemap', 'page list html', 'site map page', 'anchors list', 'seo tool'],
  featureList: ['Title + URL input', 'Linked HTML', 'Copy ready', '100% client-side'],
  panel: panel.wrap('hsm', 'fa-solid fa-list-tree', 'HTML sitemap generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    ta('hsmIn', 'Pages (title, URL per line)', 'Home, /\nAbout, /about/', 'Home, /\nAbout, /about/\nContact, /contact/') +
    outTa('hsmOut') + '</div>' + actions('hsm')),
  js: `
    function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function gen(){var lines=document.getElementById("hsmIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var out="<nav aria-label=\\"Sitemap\\">\\n  <h2>Sitemap</h2>\\n  <ul>\\n";
      lines.forEach(function(l){var parts=l.split(",");var title=parts[0]?parts[0].trim():"";var url=parts[1]?parts[1].trim():parts[0].trim();
        out+='    <li><a href="'+esc(url)+'">'+esc(title||url)+"</a></li>\\n";});
      out+="  </ul>\\n</nav>";document.getElementById("hsmOut").value=out;document.getElementById("hsmProc").textContent="Generated "+lines.length+" links - 0 bytes uploaded.";}
    ["hsmIn"].forEach(function(id){document.getElementById(id).addEventListener("input",gen);});
    document.getElementById("hsmGo").addEventListener("click",gen);
    document.getElementById("hsmCopy").addEventListener("click",function(){document.getElementById("hsmOut").select();document.execCommand("copy");});gen();`,
  article: {
    title: 'HTML Sitemap Generator: A Page List for Visitors',
    lead: '<p>An HTML sitemap is a linked index of your pages for people, complementing the XML sitemap for crawlers. This <strong>HTML sitemap generator</strong> builds ready-to-paste markup.</p>',
    sections: [
      { id: 'why', icon: 'fa-solid fa-users', heading: 'XML versus HTML sitemaps', html: '<p>The XML sitemap feeds search engines; the HTML sitemap helps visitors navigate, aids orientation and provides internal links.</p>' },
      { id: 'use', icon: 'fa-solid fa-list-tree', heading: 'Where to place it', html: '<p>Link it in the footer or a dedicated sitemap page. Keep titles short and URLs relative for portability.</p>' }
    ],
    steps: ['Enter page titles and URLs.', 'Copy the generated HTML.', 'Paste into your sitemap page.'],
    facts: [['Output', 'HTML nav list'], ['Input', 'Title + URL'], ['Format', 'Semantic nav'], ['Data handling', 'Runs locally']],
    useCases: [['Navigation', 'Human-readable index.'], ['Internal links', 'Spread link equity.'], ['Usability', 'Help visitors orient.']],
    tips: ['Keep titles short and clear.', 'Use relative URLs for portability.', 'Link it from the footer.'],
    takeaways: ['HTML sitemaps serve visitors.', 'They add internal links.', 'Output is clean semantic markup.'],
    faq: [['Does it replace the XML sitemap?', 'No, they serve different audiences.'], ['Should URLs be relative?', 'Relative works well for a sitemap page.'], ['Can I style it?', 'Yes, the markup is plain HTML.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Create the crawler version with the <a href="xml-sitemap-generator.html">XML sitemap generator</a>.</p>'
  }
});

/* ========================================================================
   4. OPEN GRAPH GENERATOR
   ======================================================================== */
add({
  file: 'open-graph-generator.html', folder: 'seo',
  name: 'Open Graph Generator', tag: 'SEO', icon: 'fa-solid fa-share-nodes',
  title: 'Open Graph Generator | Social Share Meta Tags',
  metaDesc: 'Generate Open Graph and Twitter Card meta tags so your pages look great when shared. Copy ready-to-paste HTML. Free and in-browser.',
  desc: 'Produce Open Graph and Twitter Card meta tags for rich link previews on social media.',
  keywords: ['open graph generator', 'og tags', 'twitter card', 'social meta tags', 'link preview', 'seo tool'],
  featureList: ['Open Graph tags', 'Twitter card', 'Copy ready', '100% client-side'],
  panel: panel.wrap('og', 'fa-solid fa-share-nodes', 'Open Graph generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('ogTitle', 'Title', 'My Page Title') + inp('ogDesc', 'Description', 'A short description of the page.') +
    inp('ogUrl', 'URL', 'https://example.com/page') + inp('ogImage', 'Image URL', 'https://example.com/og.jpg') + '</div>' +
    '<div>' + inp('ogSite', 'Site name', 'My Site') + inp('ogType', 'Type', 'website') +
    '<div class="field"style="margin-top:10px"><label for="ogCard">Twitter card</label><select id="ogCard"><option>summary</option><option selected>summary_large_image</option></select></div></div></div>' +
    actions('og') + outTa('ogOut')),
  js: `
    function esc(s){return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
    function gen(){var t=document.getElementById("ogTitle").value,d=document.getElementById("ogDesc").value,u=document.getElementById("ogUrl").value,i=document.getElementById("ogImage").value,s=document.getElementById("ogSite").value,ty=document.getElementById("ogType").value,card=document.getElementById("ogCard").value;
      var out="";
      if(t)out+='<meta property="og:title" content="'+esc(t)+'">\\n';
      if(d)out+='<meta property="og:description" content="'+esc(d)+'">\\n';
      if(u)out+='<meta property="og:url" content="'+esc(u)+'">\\n';
      if(i)out+='<meta property="og:image" content="'+esc(i)+'">\\n';
      if(s)out+='<meta property="og:site_name" content="'+esc(s)+'">\\n';
      if(ty)out+='<meta property="og:type" content="'+esc(ty)+'">\\n';
      out+='<meta name="twitter:card" content="'+card+'">\\n';
      if(t)out+='<meta name="twitter:title" content="'+esc(t)+'">\\n';
      if(d)out+='<meta name="twitter:description" content="'+esc(d)+'">\\n';
      if(i)out+='<meta name="twitter:image" content="'+esc(i)+'">\\n';
      document.getElementById("ogOut").value=out;document.getElementById("ogProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    ["ogTitle","ogDesc","ogUrl","ogImage","ogSite","ogType","ogCard"].forEach(function(id){document.getElementById(id).addEventListener("input",gen);});
    document.getElementById("ogGo").addEventListener("click",gen);
    document.getElementById("ogCopy").addEventListener("click",function(){document.getElementById("ogOut").select();document.execCommand("copy");});gen();`,
  article: {
    title: 'Open Graph Generator: Control Social Previews',
    lead: '<p>When someone shares your link, Open Graph tags decide the title, description and image shown. This <strong>Open Graph generator</strong> builds them along with Twitter Card tags.</p>',
    sections: [
      { id: 'tags', icon: 'fa-solid fa-share-nodes', heading: 'Key tags', html: '<p><code>og:title</code>, <code>og:description</code>, <code>og:image</code> and <code>og:url</code> do most of the work. Twitter cards mirror them for X.</p>' },
      { id: 'image', icon: 'fa-solid fa-image', heading: 'Image guidance', html: '<p>Use a landscape image around 1200x630 pixels with a 1.91:1 ratio. Absolute URLs are essential.</p>' }
    ],
    steps: ['Fill in title, description, URL and image.', 'Choose a Twitter card type.', 'Paste the tags into your head.'],
    facts: [['Tags', 'OG + Twitter'], ['Image', '1200x630 recommended'], ['URLs', 'Absolute'], ['Data handling', 'Runs locally']],
    useCases: [['Blog posts', 'Rich share previews.'], ['Products', 'Attractive cards.'], ['Landing pages', 'Consistent branding.']],
    tips: ['Use absolute URLs.', 'Keep titles under 60 characters.', 'Test with a share debugger.'],
    takeaways: ['OG tags shape link previews.', 'Images should be landscape.', 'Twitter cards mirror OG data.'],
    faq: [['Are OG tags SEO ranking factors?', 'Not directly, but they drive clicks.'], ['What image size?', 'About 1200x630 pixels.'], ['Do I need Twitter tags?', 'Recommended for X previews.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Combine with the <a href="meta-tag-generator.html">meta tag generator</a> for full head tags.</p>'
  }
});

/* ========================================================================
   5. SERP PREVIEW
   ======================================================================== */
add({
  file: 'serp-preview.html', folder: 'seo',
  name: 'SERP Preview Tool', tag: 'SEO', icon: 'fa-solid fa-magnifying-glass',
  title: 'SERP Preview Tool | See Your Google Snippet',
  metaDesc: 'Preview how your page title, URL and description appear in Google search results and check their pixel lengths. Free and in-browser.',
  desc: 'See how your title, URL and description will look in Google results, with length guidance.',
  keywords: ['serp preview', 'google snippet preview', 'search result preview', 'title tag length', 'meta description length', 'seo tool'],
  featureList: ['Live Google preview', 'Pixel width check', 'Truncation warnings', '100% client-side'],
  panel: panel.wrap('serp', 'fa-solid fa-magnifying-glass', 'SERP preview',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('serpTitle', 'Title', 'Troolify - Free Online Tools') + inp('serpUrl', 'URL', 'https://f9xr.org/troolify/') +
    '<div class="field"style="margin-top:10px"><label for="serpDesc">Description</label><textarea id="serpDesc"style="min-height:90px">The ultimate toolbox. Fast, private, browser-based utilities for text, images, PDFs, and more - no uploads required.</textarea></div></div>' +
    '<div class="io-field"><label>Google preview</label>' +
    '<div style="background:#fff;border-radius:10px;padding:14px;font-family:Arial,sans-serif"><div id="serpPVUrl"style="color:#202124;font-size:12px"></div>' +
    '<div id="serpPVTitle"style="color:#1a0dab;font-size:20px;line-height:1.3;margin:2px 0"></div>' +
    '<div id="serpPVDesc"style="color:#4d5156;font-size:14px;line-height:1.5"></div></div></div></div>' +
    tiles([['Title length', 'serpTLen'], ['Description length', 'serpDLen']]) + go('serp', 'Refresh preview')),
  js: `
    function gen(){var t=document.getElementById("serpTitle").value,u=document.getElementById("serpUrl").value,d=document.getElementById("serpDesc").value;
      document.getElementById("serpPVUrl").textContent=u.replace(/^https?:\\/\\//,"").replace(/\\/$/,"");
      document.getElementById("serpPVTitle").textContent=t.length>60?t.slice(0,60)+"...":t;
      document.getElementById("serpPVDesc").textContent=d.length>160?d.slice(0,160)+"...":d;
      document.getElementById("serpTLen").textContent=t.length+(t.length>60?" (over 60)":"");
      document.getElementById("serpDLen").textContent=d.length+(d.length>160?" (over 160)":"");
      document.getElementById("serpProc").textContent="Preview updated - 0 bytes uploaded.";}
    ["serpTitle","serpUrl","serpDesc"].forEach(function(id){document.getElementById(id).addEventListener("input",gen);});
    document.getElementById("serpGo").addEventListener("click",gen);gen();`,
  article: {
    title: 'SERP Preview Tool: Optimise Your Snippet',
    lead: '<p>Your title and description are often the first impression of your page. This <strong>SERP preview tool</strong> shows how they appear in Google search results.</p>',
    sections: [
      { id: 'limits', icon: 'fa-solid fa-ruler', heading: 'Length guidelines', html: '<p>Titles are typically truncated past roughly 580 pixels (about 60 characters) and descriptions past about 920 pixels (about 160 characters).</p>' },
      { id: 'craft', icon: 'fa-solid fa-feather-pointed', heading: 'Writing for clicks', html: '<p>Lead with the value, include the main keyword naturally, and end with a reason to click. Avoid keyword stuffing and duplicated descriptions.</p>' }
    ],
    steps: ['Enter title, URL and description.', 'Watch the preview update.', 'Keep lengths within the limits.'],
    facts: [['Title limit', '~60 characters'], ['Description limit', '~160 characters'], ['Display', 'Google style'], ['Data handling', 'Runs locally']],
    useCases: [['On-page SEO', 'Tune the snippet.'], ['CTR', 'Improve click-through.'], ['Consistency', 'Review a template.']],
    tips: ['Front-load the keyword.', 'Use a clear call to action.', 'Avoid duplicate descriptions.'],
    takeaways: ['Long titles and descriptions get cut.', 'The preview mirrors Google styling.', 'Good snippets improve clicks.'],
    faq: [['Does Google always use my description?', 'No, it may rewrite it.'], ['Is 60 characters exact?', 'It is a pixel guideline.'], ['Can I preview mobile?', 'This shows a desktop-style snippet.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Check the tag lengths too with the <a href="meta-description-checker.html">meta description checker</a>.</p>'
  }
});

/* ========================================================================
   6. KEYWORD DENSITY CHECKER
   ======================================================================== */
add({
  file: 'keyword-density-checker.html', folder: 'seo',
  name: 'Keyword Density Checker', tag: 'SEO', icon: 'fa-solid fa-hashtag',
  title: 'Keyword Density Checker | Analyse Keyword Usage',
  metaDesc: 'Analyse keyword frequency and density in your text to avoid over or under-optimisation. Free, private and fully in-browser.',
  desc: 'Count word frequency and calculate keyword density across your content in real time.',
  keywords: ['keyword density checker', 'keyword frequency', 'word frequency seo', 'content analysis', 'seo density', 'seo tool'],
  featureList: ['Frequency table', 'Density percent', 'Ignore stop words', '100% client-side'],
  panel: panel.wrap('kd', 'fa-solid fa-hashtag', 'Keyword density checker',
    ta('kdIn', 'Paste your content', 'Paste article text here...', 'Search engine optimisation helps pages rank. Good SEO balances keywords and readability. Keyword density measures how often a keyword appears.') +
    '<div class="field"style="margin:12px 0;max-width:320px"><label for="kdStop"><input id="kdStop"type="checkbox"checked style="width:auto;margin-right:8px">Ignore common stop words</label></div>' +
    go('kd', 'Analyse') + tiles([['Total words', 'kdWords'], ['Unique words', 'kdUnique']]) +
    '<div id="kdTable"class="result-card"style="overflow:auto"><div class="rt-label">Top keywords</div><div id="kdRows"></div></div>'),
  js: `
    var STOP={the:1,a:1,an:1,and:1,or:1,but:1,of:1,to:1,in:1,on:1,for:1,with:1,is:1,are:1,was:1,were:1,be:1,been:1,it:1,this:1,that:1,as:1,at:1,by:1,from:1,you:1,your:1,we:1,our:1};
    function run(){var txt=document.getElementById("kdIn").value.toLowerCase().replace(/[^a-z0-9\\s]/g," ");var words=txt.split(/\\s+/).filter(function(w){return w&&!(document.getElementById("kdStop").checked&&STOP[w]);});
      var freq={};words.forEach(function(w){freq[w]=(freq[w]||0)+1;});
      var arr=Object.keys(freq).map(function(k){return [k,freq[k]];}).sort(function(a,b){return b[1]-a[1];}).slice(0,20);
      var rows="";arr.forEach(function(p){var d=words.length?(p[1]/words.length*100).toFixed(2):0;rows+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span>'+p[0]+'</span><span>'+p[1]+' &middot; '+d+'%</span></div>';});
      document.getElementById("kdRows").innerHTML=rows||"<span style=\\"color:var(--muted)\\">No content yet.</span>";
      document.getElementById("kdWords").textContent=words.length;document.getElementById("kdUnique").textContent=Object.keys(freq).length;
      document.getElementById("kdProc").textContent="Analysed in this tab - 0 bytes uploaded.";}
    ["kdIn","kdStop"].forEach(function(id){document.getElementById(id).addEventListener("input",run);});
    document.getElementById("kdGo").addEventListener("click",run);run();`,
  article: {
    title: 'Keyword Density Checker: Balance Your Content',
    lead: '<p>Keyword density is the share of your text made up by a given word. This <strong>keyword density checker</strong> shows your most-used terms and their percentages.</p>',
    sections: [
      { id: 'density', icon: 'fa-solid fa-percent', heading: 'What density means', html: '<p>Density equals occurrences of a keyword divided by total words. There is no universal ideal, but natural writing usually lands in the one to two percent range for a main term.</p>' },
      { id: 'avoid', icon: 'fa-solid fa-triangle-exclamation', heading: 'Avoiding over-optimisation', html: '<p>Repeating a keyword unnaturally hurts readability and can look manipulative. Write for people and check density afterwards.</p>' }
    ],
    steps: ['Paste your content.', 'Optionally ignore stop words.', 'Review the top keywords and densities.'],
    facts: [['Metric', 'Frequency and percent'], ['Top list', '20 terms'], ['Stop words', 'Optional filter'], ['Data handling', 'Runs locally']],
    useCases: [['On-page SEO', 'Check keyword balance.'], ['Editing', 'Spot overuse.'], ['Research', 'See dominant themes.']],
    tips: ['Write naturally first.', 'Use synonyms to vary language.', 'Aim for readability over counts.'],
    takeaways: ['Density is a ratio of occurrences.', 'Natural language beats stuffing.', 'Analysing is quick and private.'],
    faq: [['What density is ideal?', 'There is no fixed number; natural use is best.'], ['Should I remove all stop words?', 'It is optional for cleaner results.'], ['Does it count phrases?', 'It counts single words.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Check readability next with the <a href="readability-checker.html">readability checker</a>.</p>'
  }
});

/* ========================================================================
   7. READABILITY CHECKER
   ======================================================================== */
add({
  file: 'readability-checker.html', folder: 'seo',
  name: 'Readability Checker', tag: 'SEO', icon: 'fa-solid fa-book-open-reader',
  title: 'Readability Checker | Flesch Reading Ease Score',
  metaDesc: 'Score your text with the Flesch Reading Ease and Flesch-Kincaid grade level, plus word and sentence counts. Free and in-browser.',
  desc: 'Measure how easy your text is to read with Flesch Reading Ease and grade-level scores.',
  keywords: ['readability checker', 'flesch reading ease', 'flesch kincaid', 'reading level', 'text analysis', 'seo tool'],
  featureList: ['Flesch scores', 'Grade level', 'Word and sentence counts', '100% client-side'],
  panel: panel.wrap('rdb', 'fa-solid fa-book-open-reader', 'Readability checker',
    ta('rdbIn', 'Paste your text', 'Paste text to score...', 'Readability scores help you match your writing to your audience. Clear, simple sentences score better and are easier to understand.') +
    go('rdb', 'Check readability') + tiles([['Reading ease', 'rdbEase'], ['Grade level', 'rdbGrade'], ['Words / sentences', 'rdbCounts']])),
  js: `
    function syl(w){w=w.toLowerCase();if(w.length<=3)return 1;w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,"").replace(/^y/,"");var m=w.match(/[aeiouy]{1,2}/g);return m?m.length:1;}
    function run(){var t=document.getElementById("rdbIn").value;
      var sentences=(t.match(/[.!?]+/g)||[]).length||(t.trim()?1:0);
      var words=t.trim()?t.trim().split(/\\s+/):[];
      var n=words.length;var syllables=0;words.forEach(function(w){syllables+=syl(w.replace(/[^a-zA-Z]/g,""));});
      var ease=n&&sentences?206.835-1.015*(n/sentences)-84.6*(syllables/n):0;
      var grade=n&&sentences?0.39*(n/sentences)+11.8*(syllables/n)-15.59:0;
      document.getElementById("rdbEase").textContent=ease.toFixed(1)+(ease>=60?" (easy)":ease>=30?" (hard)":" (very hard)");
      document.getElementById("rdbGrade").textContent="Grade "+grade.toFixed(1);
      document.getElementById("rdbCounts").textContent=n+" / "+sentences;
      document.getElementById("rdbProc").textContent="Scored in this tab - 0 bytes uploaded.";}
    document.getElementById("rdbIn").addEventListener("input",run);
    document.getElementById("rdbGo").addEventListener("click",run);run();`,
  article: {
    title: 'Readability Checker: Match Your Audience',
    lead: '<p>Readability scores estimate how hard a text is to read. This <strong>readability checker</strong> calculates Flesch Reading Ease and the Flesch-Kincaid grade level.</p>',
    sections: [
      { id: 'flesch', icon: 'fa-solid fa-book-open-reader', heading: 'Reading the scores', html: '<p>Reading ease runs from 0 to 100; higher is easier. A score of 60 to 70 suits general audiences. The grade level maps roughly to US school years.</p>' },
      { id: 'improve', icon: 'fa-solid fa-feather-pointed', heading: 'Improving readability', html: '<p>Shorten sentences, prefer common words, and break up long paragraphs. Aim for the level your readers expect.</p>' }
    ],
    steps: ['Paste your text.', 'Press Check readability.', 'Read the ease and grade scores.'],
    facts: [['Scores', 'Flesch ease + grade'], ['Range', '0-100 ease'], ['Inputs', 'Words, sentences, syllables'], ['Data handling', 'Runs locally']],
    useCases: [['Content writing', 'Match reading level.'], ['Editing', 'Simplify dense text.'], ['SEO', 'Improve engagement.']],
    tips: ['Aim for 60+ ease for general readers.', 'Shorten long sentences.', 'Use simpler synonyms.'],
    takeaways: ['Higher ease means easier reading.', 'Grade level estimates school years.', 'Simple writing reaches more people.'],
    faq: [['What is a good score?', 'Around 60 to 70 for general audiences.'], ['Does it suit all languages?', 'The formulas are tuned for English.'], ['Can I check very long text?', 'Yes, paste as much as you like.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Check keyword use too with the <a href="keyword-density-checker.html">keyword density checker</a>.</p>'
  }
});

/* ========================================================================
   8. CODE TO TEXT RATIO CHECKER
   ======================================================================== */
add({
  file: 'code-to-text-ratio-checker.html', folder: 'seo',
  name: 'Code to Text Ratio Checker', tag: 'SEO', icon: 'fa-solid fa-percent',
  title: 'Code to Text Ratio Checker | HTML vs Visible Text',
  metaDesc: 'Paste page HTML to measure the ratio of visible text to total code, a classic SEO signal. Free, private and fully in-browser.',
  desc: 'Compare visible text against raw HTML size to see your code-to-text ratio.',
  keywords: ['code to text ratio', 'text to html ratio', 'code ratio seo', 'html size checker', 'visible text ratio', 'seo tool'],
  featureList: ['Code vs text size', 'Ratio percent', 'Tag stripping', '100% client-side'],
  panel: panel.wrap('ctr2', 'fa-solid fa-percent', 'Code to text ratio',
    ta('ctr2In', 'Paste page HTML', 'Paste HTML source here...') +
    go('ctr2', 'Calculate ratio') + tiles([['Code to text ratio', 'ctr2Out'], ['Code bytes', 'ctr2Code'], ['Text bytes', 'ctr2Text']])),
  js: `
    function run(){var html=document.getElementById("ctr2In").value;
      var text=html.replace(/<script[\\s\\S]*?<\\/script>/gi," ").replace(/<style[\\s\\S]*?<\\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\\s+/g," ").trim();
      var codeLen=html.length,textLen=text.length;
      var ratio=codeLen?(textLen/codeLen*100):0;
      document.getElementById("ctr2Out").textContent=ratio.toFixed(1)+"%";
      document.getElementById("ctr2Code").textContent=codeLen;
      document.getElementById("ctr2Text").textContent=textLen;
      document.getElementById("ctr2Proc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("ctr2In").addEventListener("input",run);
    document.getElementById("ctr2Go").addEventListener("click",run);run();`,
  article: {
    title: 'Code to Text Ratio Checker: HTML Efficiency',
    lead: '<p>The code-to-text ratio compares your visible words to your total HTML size. This <strong>code to text ratio checker</strong> strips markup and reports the percentage.</p>',
    sections: [
      { id: 'ratio', icon: 'fa-solid fa-percent', heading: 'Interpreting the ratio', html: '<p>A very low ratio means lots of markup relative to content, which can hint at bloated templates. Search engines care far more about content quality than this metric alone.</p>' },
      { id: 'context', icon: 'fa-solid fa-triangle-exclamation', heading: 'Use with context', html: '<p>Rich layouts, scripts and inline data lower the ratio without harming SEO. Treat it as one signal, not a verdict.</p>' }
    ],
    steps: ['Paste a page HTML source.', 'Press Calculate ratio.', 'Read the ratio and byte counts.'],
    facts: [['Metric', 'Text / total HTML'], ['Strips', 'Tags, script, style'], ['Output', 'Percent and bytes'], ['Data handling', 'Runs locally']],
    useCases: [['Site audits', 'Flag bloated markup.'], ['Templates', 'Compare page efficiency.'], ['Learning', 'Understand the metric.']],
    tips: ['Paste the full source.', 'Compare pages of similar type.', 'Do not over-weight this signal.'],
    takeaways: ['It compares text to code size.', 'Low ratios can indicate bloat.', 'Content quality matters more.'],
    faq: [['Is a high ratio always better?', 'Not necessarily.'], ['Are scripts excluded?', 'Yes, script and style content is stripped.'], ['Does it affect rankings?', 'It is a minor signal at best.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Improve content focus with the <a href="keyword-density-checker.html">keyword density checker</a>.</p>'
  }
});

/* ========================================================================
   9. HTACCESS REDIRECT GENERATOR
   ======================================================================== */
add({
  file: 'htaccess-redirect-generator.html', folder: 'seo',
  name: 'Htaccess Redirect Generator', tag: 'SEO', icon: 'fa-solid fa-right-left',
  title: 'Htaccess Redirect Generator | 301 Redirect Rules',
  metaDesc: 'Generate .htaccess redirect rules from old to new URLs, including 301 and 302 options. Copy ready-to-paste output. Free and in-browser.',
  desc: 'Build Apache .htaccess redirect rules from a list of old and new URLs, choosing the status code.',
  keywords: ['htaccess redirect generator', '301 redirect', '302 redirect', 'apache redirect', 'url redirect', 'seo tool'],
  featureList: ['301 / 302 rules', 'URL mapping list', 'Copy ready', '100% client-side'],
  panel: panel.wrap('htr', 'fa-solid fa-right-left', 'Htaccess redirect generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    ta('htrIn', 'Redirects (old, new per line)', '/old-page, /new-page\n/old-two, /new-two', '/old-page, /new-page\n/old-two, /new-two') +
    outTa('htrOut') + '</div>' +
    '<div class="field"style="max-width:260px;margin-bottom:10px"><label for="htrCode">Status code</label><select id="htrCode"><option value="301">301 Moved permanently</option><option value="302">302 Found</option><option value="307">307 Temporary redirect</option></select></div>' +
    actions('htr')),
  js: `
    function gen(){var lines=document.getElementById("htrIn").value.split(/\\n+/).filter(function(x){return x.trim()});var code=document.getElementById("htrCode").value;
      var out="<IfModule mod_rewrite.c>\\n  RewriteEngine On\\n";
      lines.forEach(function(l){var p=l.split(",");if(p.length>=2){out+="  RewriteRule ^"+p[0].trim().replace(/^\\//,"")+"$ "+p[1].trim()+" ["+code+",L,R="+code+"]\\n";}});
      out+="</IfModule>";document.getElementById("htrOut").value=out;document.getElementById("htrProc").textContent="Generated "+lines.length+" rules - 0 bytes uploaded.";}
    ["htrIn","htrCode"].forEach(function(id){document.getElementById(id).addEventListener("input",gen);});
    document.getElementById("htrGo").addEventListener("click",gen);
    document.getElementById("htrCopy").addEventListener("click",function(){document.getElementById("htrOut").select();document.execCommand("copy");});gen();`,
  article: {
    title: 'Htaccess Redirect Generator: Move URLs Safely',
    lead: '<p>Redirecting old URLs preserves traffic and link equity. This <strong>htaccess redirect generator</strong> builds Apache rewrite rules from your old and new paths.</p>',
    sections: [
      { id: 'codes', icon: 'fa-solid fa-code', heading: 'Choosing a status code', html: '<p>Use 301 for permanent moves so search engines transfer signals. Use 302 or 307 for temporary changes that should not be cached.</p>' },
      { id: 'mod', icon: 'fa-solid fa-server', heading: 'Apache requirement', html: '<p>These rules need mod_rewrite enabled. Place them in the site .htaccess file or the virtual host configuration.</p>' }
    ],
    steps: ['List old and new paths.', 'Pick the status code.', 'Paste the rules into .htaccess.'],
    facts: [['Server', 'Apache'], ['Codes', '301/302/307'], ['Module', 'mod_rewrite'], ['Data handling', 'Runs locally']],
    useCases: [['Site moves', 'Redirect old URLs.'], ['Renames', 'Fix broken links.'], ['Consolidation', 'Merge duplicate pages.']],
    tips: ['Use 301 for permanent moves.', 'Test each redirect after applying.', 'Back up .htaccess first.'],
    takeaways: ['301 transfers signals permanently.', 'mod_rewrite is required.', 'Always test live redirects.'],
    faq: [['301 or 302?', '301 for permanent, 302 for temporary.'], ['Will this work on Nginx?', 'No, Nginx uses a different syntax.'], ['Can I redirect whole folders?', 'Use a rewrite pattern for that.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Keep crawlers informed with an <a href="xml-sitemap-generator.html">XML sitemap</a>.</p>'
  }
});

/* ========================================================================
   10. LLMS.TXT GENERATOR
   ======================================================================== */
add({
  file: 'llms-txt-generator.html', folder: 'seo',
  name: 'LLMs.txt Generator', tag: 'SEO', icon: 'fa-solid fa-file-lines',
  title: 'LLMs.txt Generator | Guide for AI Crawlers',
  metaDesc: 'Generate an llms.txt file that summarises your site for AI language models. Copy ready-to-paste output. Free and fully in-browser.',
  desc: 'Create an llms.txt file describing your site and key pages for AI language models.',
  keywords: ['llms.txt generator', 'ai crawler guide', 'llm text file', 'ai seo', 'site summary', 'seo tool'],
  featureList: ['Site summary', 'Key page links', 'Markdown format', '100% client-side'],
  panel: panel.wrap('llm', 'fa-solid fa-file-lines', 'LLMs.txt generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('llmName', 'Site name', 'My Site') + inp('llmUrl', 'Site URL', 'https://example.com') +
    '<div class="field"style="margin-top:10px"><label for="llmSummary">Summary</label><textarea id="llmSummary"style="min-height:80px">A short description of what this site offers.</textarea></div></div>' +
    ta('llmPages', 'Key pages (title, url per line)', 'Docs, https://example.com/docs\nAbout, https://example.com/about', 'Docs, https://example.com/docs\nAbout, https://example.com/about') + '</div>' +
    actions('llm') + outTa('llmOut')),
  js: `
    function gen(){var name=document.getElementById("llmName").value,url=document.getElementById("llmUrl").value,sum=document.getElementById("llmSummary").value;
      var pages=document.getElementById("llmPages").value.split(/\\n+/).filter(function(x){return x.trim()});
      var out="# "+name+"\\n\\n> "+sum+"\\n\\n";
      if(pages.length){out+="## Key pages\\n\\n";pages.forEach(function(l){var p=l.split(",");var t=p[0]?p[0].trim():"";var u=p[1]?p[1].trim():"";out+="- ["+t+"]("+u+")\\n";});out+="\\n";}
      out+="## Contact\\n\\n"+url+"\\n";
      document.getElementById("llmOut").value=out;document.getElementById("llmProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    ["llmName","llmUrl","llmSummary","llmPages"].forEach(function(id){document.getElementById(id).addEventListener("input",gen);});
    document.getElementById("llmGo").addEventListener("click",gen);
    document.getElementById("llmCopy").addEventListener("click",function(){document.getElementById("llmOut").select();document.execCommand("copy");});gen();`,
  article: {
    title: 'LLMs.txt Generator: Guide AI Crawlers',
    lead: '<p>llms.txt is a growing convention that summarises a site for AI language models. This <strong>llms.txt generator</strong> builds a clean Markdown file with your key pages.</p>',
    sections: [
      { id: 'what', icon: 'fa-solid fa-file-lines', heading: 'What llms.txt is', html: '<p>It is a Markdown file at your site root that names the site, gives a short summary and links important pages, giving AI tools a curated starting point.</p>' },
      { id: 'note', icon: 'fa-solid fa-circle-info', heading: 'Adoption caveat', html: '<p>Support varies between AI providers. Publishing it is low-cost and future-friendly, but do not expect universal recognition yet.</p>' }
    ],
    steps: ['Enter site name, URL and summary.', 'List key pages and links.', 'Copy the file to your site root.'],
    facts: [['Format', 'Markdown'], ['Placement', 'Site root'], ['Purpose', 'AI crawler guide'], ['Data handling', 'Runs locally']],
    useCases: [['AI visibility', 'Describe your site.'], ['Docs sites', 'Curate key pages.'], ['Forward planning', 'Adopt a new convention.']],
    tips: ['Keep the summary concise.', 'Link only the most important pages.', 'Publish at /llms.txt.'],
    takeaways: ['llms.txt summarises your site for AI.', 'It uses simple Markdown.', 'Adoption is still emerging.'],
    faq: [['Do all AI tools read it?', 'No, support varies.'], ['Where do I place it?', 'At the site root.'], ['Is it a ranking factor?', 'It is not a search ranking factor.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Also generate an <a href="ai-robots-txt-generator.html">AI robots.txt</a> for crawler rules.</p>'
  }
});

/* ========================================================================
   11. AI ROBOTS.TXT GENERATOR
   ======================================================================== */
add({
  file: 'ai-robots-txt-generator.html', folder: 'seo',
  name: 'AI Robots.txt Generator', tag: 'SEO', icon: 'fa-solid fa-shield-halved',
  title: 'AI Robots.txt Generator | Control AI Crawlers',
  metaDesc: 'Create robots.txt rules that allow or block popular AI crawlers such as GPTBot, ClaudeBot and CCBot. Copy ready output. Free and in-browser.',
  desc: 'Build robots.txt rules that allow or block specific AI training and browsing crawlers.',
  keywords: ['ai robots.txt', 'block gptbot', 'ai crawler control', 'claudebot', 'ccbot', 'seo tool'],
  featureList: ['Common AI bots', 'Allow / block toggles', 'Copy ready', '100% client-side'],
  panel: panel.wrap('arb', 'fa-solid fa-shield-halved', 'AI robots.txt generator',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">Toggle each crawler, then copy the file.</p>' +
    ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'CCBot', 'PerplexityBot', 'Bytespider', 'Amazonbot'].map(function (b, i) {
      return '<div class="field"style="margin-bottom:8px"><label><input id="arbB' + i + '"type="checkbox"data-bot="' + b + '"style="width:auto;margin-right:8px">' + b + '</label></div>';
    }).join('') +
    '<div class="field"style="margin:10px 0"><label for="arbAction">Action for selected</label><select id="arbAction"><option value="disallow">Disallow (block)</option><option value="allow">Allow</option></select></div>' +
    actions('arb') + outTa('arbOut')),
  js: `
    function gen(){var action=document.getElementById("arbAction").value;var bots=[].slice.call(document.querySelectorAll("#arbGo,.arb-panel input[data-bot]"));
      var checked=[].slice.call(document.querySelectorAll("input[data-bot]:checked"));
      var out="";
      checked.forEach(function(c){out+="User-agent: "+c.getAttribute("data-bot")+"\\n"+(action==="allow"?"Allow: /":"Disallow: /")+"\\n\\n";});
      if(!out)out="# Select at least one crawler above.\\n";
      document.getElementById("arbOut").value=out;document.getElementById("arbProc").textContent="Generated rules for "+checked.length+" crawlers - 0 bytes uploaded.";}
    document.querySelectorAll("input[data-bot]").forEach(function(c){c.addEventListener("change",gen);});
    document.getElementById("arbAction").addEventListener("change",gen);
    document.getElementById("arbGo").addEventListener("click",gen);
    document.getElementById("arbCopy").addEventListener("click",function(){document.getElementById("arbOut").select();document.execCommand("copy");});`,
  article: {
    title: 'AI Robots.txt Generator: Manage AI Crawlers',
    lead: '<p>Many AI companies operate their own crawlers. This <strong>AI robots.txt generator</strong> helps you allow or block common ones such as GPTBot, ClaudeBot and CCBot.</p>',
    sections: [
      { id: 'bots', icon: 'fa-solid fa-robot', heading: 'Common AI user-agents', html: '<p>GPTBot and ChatGPT-User relate to OpenAI, ClaudeBot and anthropic-ai to Anthropic, and CCBot to Common Crawl. Google-Extended controls Gemini training data.</p>' },
      { id: 'limits', icon: 'fa-solid fa-triangle-exclamation', heading: 'Limits of robots.txt', html: '<p>Compliant crawlers honour robots.txt, but it is voluntary. For strict control, combine it with server-level blocks.</p>' }
    ],
    steps: ['Select the crawlers to manage.', 'Choose allow or disallow.', 'Copy the rules into robots.txt.'],
    facts: [['Crawlers', '9 common AI bots'], ['Rules', 'Allow / disallow'], ['Placement', 'Site root'], ['Data handling', 'Runs locally']],
    useCases: [['Content protection', 'Block training crawlers.'], ['Selective access', 'Allow some, block others.'], ['Policy', 'Document your stance.']],
    tips: ['Merge with your main robots.txt.', 'Review AI policies periodically.', 'Declare usage policies in other files if needed.'],
    takeaways: ['AI crawlers use distinct user-agents.', 'robots.txt is voluntary.', 'Combine with server rules for control.'],
    faq: [['Is robots.txt enough to block AI?', 'Compliant bots obey it, but it is not enforced.'], ['Which bot is OpenAI?', 'GPTBot.'], ['Can I allow but not train?', 'Use the relevant agent rules.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Pair this with an <a href="llms-txt-generator.html">llms.txt file</a> to guide AI models.</p>'
  }
});

/* ========================================================================
   12. SLUG / URL GENERATOR (bonus, SEO)
   ======================================================================== */

/* ---------- emit pages + register ---------- */
const entries = [];
for (const spec of TOOLS) {
  const html = buildPage(spec);
  const outPath = path.join(ROOT, 'tools', spec.folder, spec.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  entries.push({
    name: spec.name, desc: spec.desc, icon: spec.icon, tag: spec.tag,
    category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file, keywords: spec.keywords,
    recent: true
  });
  console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');
}
const res = registerTools(entries);
console.log('registry: added', res.added, 'skipped', res.skipped);
