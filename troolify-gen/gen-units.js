/* ============================================================================
   Troolify - Unit Converters generator
   Creates tools/units/*.html pages + category index, appends TOOLS /
   CATEGORIES registry entries, and updates the shared footer category list.
   Run: node troolify-gen/gen-units.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ---------------- family definitions ---------------- */
const FAMS = [
  {
    slug: 'length', file: 'length-converter.html', name: 'Length Converter',
    tag: 'Length', icon: 'fa-solid fa-ruler',
    desc: 'Convert meters, feet, inches, yards, miles and more in one place with the exact formulas shown.',
    base: 'meter',
    units: [
      ['meter', 1], ['kilometer', 1000], ['centimeter', 0.01], ['millimeter', 0.001],
      ['mile', 1609.344], ['yard', 0.9144], ['foot', 0.3048], ['inch', 0.0254],
    ],
    context: ['area', 'volume'],
    keywords: ['length converter', 'meters to feet', 'inches to cm', 'miles to kilometers', 'yard to meter', 'distance converter'],
  },
  {
    slug: 'weight', file: 'weight-mass-converter.html', name: 'Weight & Mass Converter',
    tag: 'Weight', icon: 'fa-solid fa-weight-hanging',
    desc: 'Convert kilograms, pounds, grams, ounces, stone and tonnes with the underlying formulas.',
    base: 'kilogram',
    units: [
      ['kilogram', 1], ['gram', 0.001], ['milligram', 0.000001], ['pound', 0.45359237],
      ['ounce', 0.028349523125], ['stone', 6.35029318], ['metric tonne', 1000], ['US ton', 907.18474],
    ],
    context: ['volume', 'temperature'],
    keywords: ['weight converter', 'kg to lb', 'pounds to kilograms', 'ounces to grams', 'stone to kg', 'mass converter'],
  },
  {
    slug: 'area', file: 'area-converter.html', name: 'Area Converter',
    tag: 'Area', icon: 'fa-solid fa-vector-square',
    desc: 'Convert square meters, sq ft, acres, hectares and more with clear conversion-factor math.',
    base: 'square meter',
    units: [
      ['square meter', 1], ['square kilometer', 1000000], ['square foot', 0.09290304],
      ['square yard', 0.83612736], ['acre', 4046.8564224], ['hectare', 10000],
    ],
    context: ['length', 'volume'],
    keywords: ['area converter', 'sqft to sqm', 'acre to hectare', 'sqm to sqft', 'square meter calculator'],
  },
  {
    slug: 'volume', file: 'volume-converter.html', name: 'Volume Converter',
    tag: 'Volume', icon: 'fa-solid fa-cube',
    desc: 'Convert liters, gallons, milliliters, cups and cubic meters - exact factors and formulas included.',
    base: 'liter',
    units: [
      ['liter', 1], ['milliliter', 0.001], ['cubic meter', 1000], ['US gallon', 3.785411784],
      ['US quart', 0.946352946], ['US pint', 0.473176473], ['US cup', 0.2365882365],
      ['US fluid ounce', 0.0295735295625], ['tablespoon', 0.01478676478125], ['teaspoon', 0.00492892159375],
    ],
    context: ['area', 'length'],
    keywords: ['volume converter', 'liters to gallons', 'ml to cups', 'gallon to liter', 'cubic meters'],
  },
  {
    slug: 'temperature', file: 'temperature-converter.html', name: 'Temperature Converter',
    tag: 'Temperature', icon: 'fa-solid fa-temperature-half',
    desc: 'Convert Celsius, Fahrenheit and Kelvin - with the exact conversion formulas shown below.',
    base: 'celsius',
    units: [['celsius', 1], ['fahrenheit', 2], ['kelvin', 3]],
    temperature: true,
    context: ['speed', 'time'],
    keywords: ['temperature converter', 'celsius to fahrenheit', 'fahrenheit to kelvin', 'kelvin to celsius'],
  },
  {
    slug: 'speed', file: 'speed-converter.html', name: 'Speed Converter',
    tag: 'Speed', icon: 'fa-solid fa-gauge-high',
    desc: 'Convert km/h, mph, m/s, knots and ft/s using standard exact conversion factors.',
    base: 'meter/second',
    units: [
      ['meter/second', 1], ['kilometer/hour', 1 / 3.6], ['mile/hour', 0.44704],
      ['knot', 0.5144444444], ['foot/second', 0.3048],
    ],
    context: ['time', 'length'],
    keywords: ['speed converter', 'mph to kmh', 'knots to mph', 'ms to kmh', 'velocity converter'],
  },
  {
    slug: 'data', file: 'data-size-converter.html', name: 'Data Size Converter',
    tag: 'Data', icon: 'fa-solid fa-hard-drive',
    desc: 'Convert bytes, kilobytes, megabytes, gigabytes and terabytes with 1024-based binary factors.',
    base: 'byte',
    units: [
      ['byte', 1], ['kilobyte', 1024], ['megabyte', 1024 ** 2], ['gigabyte', 1024 ** 3],
      ['terabyte', 1024 ** 4], ['petabyte', 1024 ** 5],
    ],
    context: ['time', 'speed'],
    keywords: ['data size converter', 'gb to mb', 'mb to kb', 'tb to gb', 'bytes converter'],
  },
  {
    slug: 'time', file: 'time-converter.html', name: 'Time Converter',
    tag: 'Time', icon: 'fa-solid fa-clock',
    desc: 'Convert seconds, minutes, hours, days, weeks, months and years using common time constants.',
    base: 'second',
    units: [
      ['second', 1], ['minute', 60], ['hour', 3600], ['day', 86400],
      ['week', 604800], ['month', 2629746], ['year', 31556952],
    ],
    context: ['speed', 'data'],
    keywords: ['time converter', 'seconds to minutes', 'hours to days', 'days to years', 'minutes to hours'],
  },
];

const BY_SLUG = {};
FAMS.forEach(f => { BY_SLUG[f.slug] = f; });

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

/* ---------------- tool page template ---------------- */
function jsonLd(p) {
  const url = 'https://f9xr.org/troolify/tools/units/' + p.file;
  return '<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[' +
    '{"@type":"ListItem","position":1,"name":"Home","item":"https://f9xr.org/troolify/index.html"},' +
    '{"@type":"ListItem","position":2,"name":"Tools","item":"https://f9xr.org/troolify/tools/index.html"},' +
    '{"@type":"ListItem","position":3,"name":"Unit Converters","item":"https://f9xr.org/troolify/tools/units/index.html"},' +
    '{"@type":"ListItem","position":4,"name":"' + p.name + '","item":"' + url + '"}]}</script>' +
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"' + p.name + '","url":"' + url + '","applicationCategory":"UtilitiesApplication","applicationSubCategory":"Convert","operatingSystem":"Any (web browser)","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"' + p.desc.replace(/"/g, '\\"') + '"}</script>' +
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How is this ' + p.tag.toLowerCase() + ' conversion calculated?","acceptedAnswer":{"@type":"Answer","text":"Every unit converts through a single base unit using its standard factor. See the formula table on the page for exact values."}}]}</script>';
}

function optionTags(units, selected) {
  return units.map(u => '<option value="' + esc(u[0]) + '"' + (u[0] === selected ? ' selected' : '') + '>' + esc(u[0]) + '</option>').join('');
}

function formulaRows(p) {
  if (p.temperature) {
    return '<tr><td>Celsius</td><td>base = &deg;C</td></tr>' +
      '<tr><td>Fahrenheit</td><td>&deg;F = &deg;C &times; 9/5 + 32</td></tr>' +
      '<tr><td>Kelvin</td><td>K = &deg;C + 273.15</td></tr>';
  }
  return p.units.map(u => '<tr><td>' + esc(u[0]) + '</td><td>1 ' + esc(u[0]) + ' = ' + u[1] + ' ' + p.base + '</td></tr>').join('');
}

function buildPage(p) {
  const from = p.units[0][0];
  const to = p.units[1] ? p.units[1][0] : p.units[0][0];
  const switcher = FAMS.filter(f => f !== p)
    .map(f => '<a class="sitemap-link" href="' + f.file + '"><i class="fa-solid ' + f.icon + '" aria-hidden="true"></i>' + f.name + '</a>').join('');
  const contextLinks = p.context
    .map(s => BY_SLUG[s])
    .map(f => '<a class="sitemap-link" href="' + f.file + '"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>' + f.name + '</a>').join('');

  const cfg = p.temperature
    ? '(function(){function toC(v,f){return f==="celsius"?v:f==="fahrenheit"?(v-32)*5/9:v-273.15}function fromC(v,t){return t==="celsius"?v:t==="fahrenheit"?v*9/5+32:v+273.15}function conv(v,f,t){return fromC(toC(v,f),t)}(window.__UC={conv:conv,units:["celsius","fahrenheit","kelvin"]})})();window.__UC.base="celsius";'
    : '(function(){var units=' + JSON.stringify(p.units.map(function (u) { return [u[0], u[1]]; })) + ';function conv(v,f,t){var bf=1,tf=1;for(var i=0;i<units.length;i++){if(units[i][0]===f)bf=units[i][1];if(units[i][0]===t)tf=units[i][1];}return v*bf/tf}(window.__UC={conv:conv,units:' + JSON.stringify(p.units.map(u => u[0])) + '})})();window.__UC.base=' + JSON.stringify(p.base) + ';';

  const unitsJson = JSON.stringify(p.units.map(u => [u[0], u[1]]));

  return '<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><link rel="icon"type="image/webp"href="../../assets/images/favicon.webp"><link rel="icon"type="image/x-icon"href="../../assets/images/favicon.ico"><meta name="viewport"content="width=device-width,initial-scale=1"><title>' + p.name + ' - Free Online Converter | Troolify</title><meta name="description" content="' + p.desc + ' Free ' + p.name.toLowerCase() + ' with exact formulas shown."><meta name="author"content="F9XR Development Team"><meta name="robots"content="index, follow"><link rel="canonical"href="https://f9xr.org/troolify/tools/units/' + p.file + '"><meta property="og:site_name"content="Troolify"><meta property="og:title"content="' + p.name + ' - Troolify"><meta property="og:description" content="' + p.desc + '"><meta property="og:type"content="article"><meta property="og:url" content="https://f9xr.org/troolify/tools/units/' + p.file + '"><meta property="og:image"content="https://f9xr.org/troolify/assets/images/og-image.jpg"><meta name="twitter:card"content="summary_large_image"><link rel="stylesheet"href="../../assets/css/jakarta.min.css"><link rel="stylesheet"href="../../assets/css/icons.min.css"><link rel="stylesheet"href="../../assets/css/tailwind.min.css"><link rel="stylesheet"href="../../assets/css/tool-shared.min.css"><link rel="stylesheet"href="../../assets/css/tool.min.css"><link rel="stylesheet"href="../../assets/css/site-shell.min.css"><link rel="stylesheet"href="../../assets/css/tool-page.min.css"><link rel="stylesheet"href="../../assets/css/seo-article.min.css">' + jsonLd(p) + '<style>.uc-wrap{max-width:720px}' +
    '.uc-row{display:grid;grid-template-columns:1fr;gap:16px}@media(min-width:640px){.uc-row{grid-template-columns:120px 1fr 40px 1fr}}' +
    '.uc-field{display:flex;flex-direction:column;gap:6px}.uc-field label{font-size:12.5px;font-weight:700;color:var(--muted)}' +
    '.uc-field input,.uc-field select{background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:15px;font-weight:600;width:100%;box-sizing:border-box}' +
    '.uc-field input:focus,.uc-field select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.15)}' +
    '.uc-swap{align-self:end;font-size:18px;padding:10px 0;text-align:center;border:1px solid var(--border);border-radius:10px;background:rgba(255,255,255,.04);color:var(--muted);cursor:pointer}' +
    '.uc-result{background:linear-gradient(180deg,rgba(59,130,246,.12),rgba(59,130,246,.03));border:1px solid rgba(96,165,250,.25);border-radius:14px;padding:16px;margin-top:14px}' +
    '.uc-result-main{font-size:22px;font-weight:800;color:#93C5FD}' +
    '.uc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:10px}' +
    '.uc-grid a,.uc-grid .uc-pill{display:inline-flex;align-items:center;gap:.5rem;padding:.6rem .85rem;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);color:#E9ECEF;text-decoration:none;font-size:.9rem;transition:border-color .18s,background .18s}' +
    '.uc-grid a i{color:#6C757D;font-size:.75rem}.uc-grid a:hover{border-color:rgba(59,130,246,.5);background:rgba(59,130,246,.09)}' +
    '.uc-h2{margin:2rem 0 .8rem;font-size:1.15rem;font-weight:800;color:var(--ink)}' +
    '.tbl{width:100%;border-collapse:collapse;margin-top:8px;font-size:14px}.tbl th,.tbl td{border:1px solid rgba(255,255,255,.09);padding:8px 10px;text-align:left}.tbl th{background:rgba(255,255,255,.05)}' +
    '@media(max-width:640px){.uc-result-main{font-size:18px}}</style>' +
    '</head><body data-layout="tool"><noscript><nav aria-label="Primary"style="position:static;display:block;padding:1rem 1.5rem;background:#212529;border-bottom:1px solid #343A40;text-align:center;font-size:0.9rem;"><a href="../../index.html"style="color:#F8F9FA;margin:0 0.75rem;">Home</a> <a href="../../tools/index.html"style="color:#F8F9FA;margin:0 0.75rem;">Tools</a> <a href="../../pages/about.html"style="color:#F8F9FA;margin:0 0.75rem;">About</a> <a href="../../pages/contact.html"style="color:#F8F9FA;margin:0 0.75rem;">Contact</a></nav></noscript>' +
    '<main class="tool-main"><div class="container"><div class="tool-head hero"><nav class="breadcrumbs"aria-label="Breadcrumb"><ol><li><a href="../../index.html"><i class="fa-solid fa-house"></i>Home</a></li><li><a href="../../tools/index.html">Tools</a></li><li><a href="./index.html">Unit Converters</a></li><li class="current"aria-current="page">' + p.name + '</li></ol></nav><div class="hero-main"><span class="tool-badge"><span class="dot"></span>100% client-side &middot; zero data retention</span><h1>' + p.name + '</h1><p>' + p.desc + '</p></div><div class="hero-box hero-cat"><h3 class="hero-box-title"><i class="fa-solid fa-folder-open"></i>Category</h3><div class="tool-meta"><span class="tool-tag"><i class="fa-solid fa-tag"></i>' + p.tag + '</span> <a class="tool-cat"href="./index.html"aria-label="Browse Unit Converters category"><i class="fa-solid fa-folder"></i>Unit Converters</a></div></div><div class="hero-box hero-qa"><h3 class="hero-box-title"><i class="fa-solid fa-bolt"></i>Quick Actions</h3><div class="tool-actions"><button class="rt-btn"type="button"id="btnShare"><i class="fa-solid fa-share-nodes"></i>Share</button> <button class="rt-btn"type="button"id="btnEmbed"><i class="fa-solid fa-code"></i>Embed Tool</button> <a class="rt-btn"href="../../pages/feedback.html"><i class="fa-solid fa-comment"></i>Feedback</a></div></div><div class="hero-box hero-details"><h3 class="hero-box-title"><i class="fa-solid fa-circle-info"></i>Tool Details</h3><div class="tool-details"><div class="detail-row"><span class="detail-label"><i class="fa-solid fa-pen-nib"></i>Published by</span><a class="detail-value"href="https://f9xr.org/"target="_blank"rel="noopener">F9XR Development Team</a></div><div class="detail-row"><span class="detail-label"><i class="fa-solid fa-check-double"></i>Reviewed by</span><a class="detail-value"href="../../press/editorial-policies.html">Review Board</a></div><div class="detail-row"><span class="detail-label"><i class="fa-solid fa-clock-rotate-left"></i>Last updated</span><span class="detail-value">October 2026</span></div></div></div></div>' +
    '<div class="panel clean"><div class="panel-inner"><div class="toolbar-row"><span class="tool-label"><i class="' + p.icon + '"></i>' + p.name + '</span><div class="toolbar-actions"><button class="chip-btn"type="button"id="clearBtn" title="Reset the form"><i class="fa-solid fa-eraser"></i><span class="hide-sm">Clear</span></button></div></div><div class="row3">' +
    '<div class="field"><label for="amount">Amount</label><input id="amount" type="number" value="1" step="any"></div><div class="field"><label for="from">From</label><select id="from">' + optionTags(p.units, from) + '</select></div><div class="field"><label for="to">To</label><select id="to">' + optionTags(p.units, to) + '</select></div></div>' +
    '<div class="actions"style="margin-top:16px"><button class="btn btn-primary" type="button" id="calcBtn"><i class="fa-solid fa-calculator"></i>Convert</button> <button class="btn btn-ghost" type="button" id="swapBtn"><i class="fa-solid fa-arrow-right-arrow-left"></i>Swap units</button></div>' +
    '<p class="note"><b>Tip:</b> Values use standard exact conversion factors; results may be rounded for display.</p>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="procLine">Enter a value, pick two units, and convert.</span></p>' +
    '<div class="result-card"id="results"aria-live="polite"></div></div></div>' +
    '<div class="article-layout"><article class="seo-article"><h2>' + p.name + '</h2><p>' + p.desc + '</p><h2>How to use</h2><ol><li>Enter the amount you want to convert.</li><li>Pick the source and target units from the dropdowns.</li><li>Press Convert to see the summary tiles.</li><li>Switch unit families using the category link above the converter.</li></ol><h2>Formulas &amp; conversion factors</h2><table class="tbl"><thead><tr><th>Unit</th><th>Formula</th></tr></thead><tbody>' + formulaRows(p) + '</tbody></table><h2>Related converters</h2><p>Switch to another unit family via the category switcher below, or jump straight to a paired converter.</p></article></div>' +
    '<h2 class="uc-h2">Category Switcher</h2><p>Jump to another unit-conversion family with the same interface.</p><div class="uc-grid">' + switcher + '</div>' +
    '<h2 class="uc-h2">Smart Context</h2><p>These converters usually go together after a ' + p.tag.toLowerCase() + ' conversion.</p><div class="uc-grid">' + contextLinks + '</div>' +
    '</div></main>' +
    '<section class="keyword-box"aria-label="Keywords"><h2>Keyword &amp; Tags</h2><h3>Keywords</h3><div class="keywords">' + p.keywords.map(k => '<span class="keyword">' + esc(k) + '</span>').join('') + '</div><h3>Tags</h3><div class="tags"><a class="tag"href="./index.html"><i class="fa-solid fa-folder"></i>' + p.tag + '</a></div></section>' +
    '<section class="author-box"aria-label="About the publisher"><div class="author-avatar"aria-hidden="true"><img src="https://f9xr.org/articles/logo.webp"alt="F9XR Development Team logo"loading="lazy"decoding="async"width="1407"height="768"></div><div><span class="author-role">Published by</span><h2>F9XR Development Team</h2><p>Every Troolify tool is built and reviewed by the F9XR Development Team, then checked by our Review Board for correctness, accessibility and clarity. Tools run 100% client-side with zero data retention.</p><div class="author-links"><a href="https://f9xr.org/"target="_blank"rel="noopener"><i class="fa-solid fa-globe"></i>F9XR Team</a> <a href="../../press/editorial-policies.html"><i class="fa-solid fa-scale-balanced"></i>Editorial Policies</a> <a href="https://github.com/f9xr"target="_blank"rel="noopener"><i class="fa-brands fa-github"></i>GitHub</a> <a href="https://linkedin.com/company/f9xrteam"target="_blank"rel="noopener"><i class="fa-brands fa-linkedin"></i>LinkedIn</a></div></div></section>' +
    '<section class="related-tools"aria-label="Related tools"><h2>Related Tools</h2><div class="related-search"><i class="fa-solid fa-magnifying-glass"aria-hidden="true"></i> <input type="search"id="relatedSearch"placeholder="Search all Troolify tools&hellip;"autocomplete="off"aria-label="Search related tools"></div><div class="related-grid"id="relatedGrid"aria-busy="true"><div class="skel skel-related-card"aria-hidden="true"><span class="skel skel-icon"></span><span class="skel skel-line skel-w-70"></span><span class="skel skel-line skel-w-90"></span><span class="skel skel-line skel-w-60"></span></div></div></section>' +
    '<aside class="disclaimer"aria-label="Disclaimer"><i class="fa-solid fa-circle-info"></i><p>All values are computed locally in your browser with standard conversion factors. Rounding may apply. <a href="../../press/disclaimer.html">Full disclaimer</a>.</p></aside>' +
    '<section class="comments"aria-label="Comments"><h2>Comments</h2><div id="comments"><div class="comments-host"data-utteranc data-repo="f9xr/troolify"data-issue-term="pathname"data-theme="github-dark"></div></div></section><div class="section-divider"aria-hidden="true"><span></span><i class="fa-solid fa-layer-group"></i><span></span></div></div>' +
    '</main><script src="../../assets/js/layout.min.js"defer></script><script src="../../assets/js/tool-page.min.js"defer></script><script>' +
    cfg +
    '(function(){var amount=document.getElementById("amount"),from=document.getElementById("from"),to=document.getElementById("to"),results=document.getElementById("results"),proc=document.getElementById("procLine");' +
    'function fmt(n){if(!isFinite(n))return "--";var s=Math.abs(n)>=1e9||n===0?n.toExponential(4):Math.round(n*1e6)/1e6;return (n<0?"-":"")+Math.abs(s).toLocaleString("en-US",{maximumFractionDigits:6})}' +
    'function tile(l,v,s){return "<div class=result-tile><div class=rt-label>"+l+"</div><div class=rt-value>"+v+"</div><div class=rt-sub>"+s+"</div></div>"}' +
    'function calc(){var v=parseFloat(amount.value);if(isNaN(v)){results.innerHTML="";proc.textContent="Enter a value, pick two units, and convert.";return}var out=window.__UC.conv(v,from.value,to.value);var baseVal=window.__UC.base?window.__UC.conv(v,from.value,window.__UC.base):null;var factor=window.__UC.conv(1,from.value,to.value);var html="<div class=result-grid>";html+=tile("Converted",fmt(out)+" "+to.value,fmt(v)+" "+from.value);if(baseVal!==null&&!isNaN(baseVal))html+=tile("Base value",fmt(baseVal)+" "+window.__UC.base,"via base unit");html+=tile("Factor","1 "+from.value+" = "+fmt(factor)+" "+to.value,"exact factor");html+="</div>";results.innerHTML=html;proc.textContent="Converted "+fmt(v)+" "+from.value+" to "+to.value+".";return out}' +
    'function bind(){[amount,from,to].forEach(function(e){e.addEventListener("input",calc);e.addEventListener("change",calc)});var cb=document.getElementById("calcBtn");if(cb)cb.addEventListener("click",calc);var sb=document.getElementById("swapBtn");if(sb)sb.addEventListener("click",function(){var a=from.value;from.value=to.value;to.value=a;calc()});var cl=document.getElementById("clearBtn");if(cl)cl.addEventListener("click",function(){var units=window.__UC.units||[];amount.value=1;from.value=units[0];to.value=units[1]?units[1]:units[0];calc()});calc()}' +
    'bind();window.addEventListener("load",calc)})();</script></body></html>';
}

/* ---------------- generate files ---------------- */
const OUT = path.join(ROOT, 'tools', 'units');
fs.mkdirSync(OUT, { recursive: true });
FAMS.forEach(p => {
  fs.writeFileSync(path.join(OUT, p.file), buildPage(p), 'utf8');
  console.log('wrote', 'tools/units/' + p.file);
});

/* category index from the color index page */
let idx = fs.readFileSync(path.join(ROOT, 'tools', 'color', 'index.html'), 'utf8');
idx = idx
  .replace(/Color Tools/g, 'Unit Converters')
  .replace(/data-category="Color"/g, 'data-category="Units"')
  .replace(/tools\/color\/index\.html/g, 'tools/units/index.html')
  .replace(/Color mixing, lighten, darken, gradient and palette tools - build harmonious color schemes entirely in your browser, nothing uploaded\./g,
           'Convert any value between everyday units - length, weight, area, volume, temperature, speed, data and time - all free and 100% client-side.')
  .replace(/Palette &amp; color theory helpers &middot;/g, 'Length, weight, area, volume &amp; more &middot;')
  .replace(/Color utilities are being added/g, 'Unit Converters are being added')
  .replace(/building Color utilities/g, 'building Unit Converters');
fs.writeFileSync(path.join(OUT, 'index.html'), idx, 'utf8');
console.log('wrote tools/units/index.html');

/* ---------------- registry: tools-data.js ---------------- */
const tdPath = path.join(ROOT, 'assets', 'js', 'tools-data.js');
let td = fs.readFileSync(tdPath, 'utf8');
const marker = '];\n\nwindow.CATEGORIES';
if (td.indexOf('category:"Units"') === -1) {
  const unitsTools = FAMS.map(p =>
    '  { name:"' + p.name + '", desc:"' + p.desc.replace(/"/g, '\\"') + '", icon:"' + p.icon + '", tag:"' + p.tag + '", category:"Units", href:"tools/units/' + p.file + '", keywords:' + JSON.stringify(p.keywords) + ' },'
  ).join('\n');
  const catEntry = '  { folder:"Units", name:"Unit Converters", icon:"fa-solid fa-ruler-combined", desc:"Convert between units of length, weight, area, volume, temperature, speed, data and time - with the formulas shown." },\n';
  td = td.replace(marker, unitsTools + '\n' + marker);
  const catClose = td.lastIndexOf('];');
  td = td.slice(0, catClose) + catEntry + td.slice(catClose);
  fs.writeFileSync(tdPath, td, 'utf8');
  console.log('tools-data.js: added Units category + 8 tools');
}

/* ---------------- footer category list in layout.js ---------------- */
const layoutPath = path.join(ROOT, 'assets', 'js', 'layout.js');
let layout = fs.readFileSync(layoutPath, 'utf8');
if (layout.indexOf('["Units", "Unit Converters"]') === -1) {
  layout = layout.replace('["HVAC", "HVAC Tools"]', '["HVAC", "HVAC Tools"], ["Units", "Unit Converters"]');
  fs.writeFileSync(layoutPath, layout, 'utf8');
  console.log('layout.js footer categories updated');
}
