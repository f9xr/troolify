/* Shared page template for Troolify API-powered tools.
   Builds a complete tool page (matching the site's existing generated pages)
   from a tool config plus a plain JS file (scripts/<slug>.js) containing the
   tool's unique logic. The unique script runs inside a shared helper scope:
   {
     $        -> getElementById
     proc(m)  -> set the #procLine text
     esc(s)   -> HTML-escape text
     copyText(txt,btn) -> copy + "Copied!" feedback
     downloadFromUrl(url,name) -> fetch->blob download, opens in a new tab on CORS failure
     busify(btn) -> disable while working, returns a restore function
     apiGet('../api/path', cb) -> GET JSON from API_BASE, 15s timeout, renders errors into #results
     API_BASE  -> "https://abhi-api.vercel.app/api"
   }                                     */
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "../..");
const DATE = "2026-09-19";
const BASE = "https://f9xr.org/troolify";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CSS = `<style>
.field{display:flex;flex-direction:column;gap:6px}
.field label{font-size:12.5px;font-weight:700;color:var(--muted)}
.field input,.field select,.field textarea{background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:15px;font-weight:600;outline:none;width:100%;box-sizing:border-box}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.15)}
.field textarea{resize:vertical;min-height:96px;line-height:1.5}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.row4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px}
@media(max-width:640px){.row2,.row3,.row4{grid-template-columns:1fr}}
.result-card{background:linear-gradient(180deg,rgba(59,130,246,.12),rgba(59,130,246,.03));border:1px solid rgba(96,165,250,.25);border-radius:14px;padding:18px;margin-top:18px}
.result-row{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;font-size:14px}
.result-row+.result-row{border-top:1px dashed rgba(255,255,255,.08)}
.result-row b{color:#93C5FD;font-weight:800;text-align:right}
.result-row.hero-row b{color:#6EE7B7}
.actions{display:flex;gap:8px;flex-wrap:wrap}
.rt-btn{background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:8px;padding:6px 12px;font-size:12.5px;font-weight:700;cursor:pointer;transition:.15s;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.rt-btn:hover{border-color:var(--accent);color:#fff}
.opt-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.opt-chk{display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;user-select:none}
.opt-chk input{display:none}
.opt-ui{width:38px;height:21px;border-radius:999px;background:var(--border);position:relative;transition:background .2s ease;flex-shrink:0}
.opt-ui::after{content:"";position:absolute;top:2.5px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .22s cubic-bezier(.16,1,.3,1);box-shadow:0 1px 3px rgba(0,0,0,.35)}
.opt-chk input:checked+.opt-ui{background:var(--accent)}
.opt-chk input:checked+.opt-ui::after{transform:translateX(16px)}
.proc-line{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--faint);font-weight:600;margin-top:14px}
.note{font-size:12.5px;color:var(--faint);line-height:1.5;margin-top:10px}
.note b{color:var(--muted)}
.netnote{border:1px dashed rgba(96,165,250,.45);background:rgba(59,130,246,.07);border-radius:12px;padding:12px 14px;font-size:12.5px;line-height:1.55;color:var(--muted);margin:16px 0 6px}
.netnote b{color:#93C5FD}
.res-phase{text-align:center;padding:22px 10px;color:var(--faint);font-weight:600;font-size:13.5px}
.res-err{border:1px solid rgba(248,113,113,.35);background:rgba(248,113,113,.08);color:#FCA5A5;border-radius:12px;padding:14px;font-size:13.5px;line-height:1.5;text-align:center;font-weight:600}
.media-host{text-align:center;margin-top:14px}
.media-prev{max-width:100%;max-height:430px;border-radius:14px;border:1px solid var(--border);display:inline-block}
.chip-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.chip{border:1px solid var(--border);background:#1B2028;color:var(--muted);border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:.15s}
.chip:hover{border-color:rgba(59,130,246,.5);color:var(--ink)}
.chip.active{background:rgba(59,130,246,.16);border-color:rgba(59,130,246,.65);color:#93C5FD}
.quote-body{font-size:1.12rem;font-weight:700;color:var(--ink);line-height:1.55;font-style:normal;text-align:center;padding:10px 6px 4px}
.quote-body i{color:#60A5FA;margin-right:6px}
.quote-author{text-align:center;color:var(--muted);font-weight:800;font-size:13.5px;margin:8px 0 4px}
.gh-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(min-width:720px){.gh-grid{grid-template-columns:repeat(4,1fr)}}
.gh-stat{border:1px solid var(--border);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.02)}
.gh-stat b{font-size:18px;font-weight:800;color:#93C5FD;display:block}
.gh-stat span{font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.05em}
.gh-head{display:flex;gap:14px;align-items:center;justify-content:center;text-align:left;margin-bottom:14px}
.gh-avatar{width:64px;height:64px;border-radius:50%;border:2px solid rgba(59,130,246,.6);object-fit:cover}
.gh-name{font-size:19px;font-weight:800;color:var(--ink)}
.gh-login{font-size:13px;color:var(--faint);font-weight:600}
.gh-bio{font-size:12.5px;color:var(--muted);margin-top:4px;max-width:340px}
.sh-link{display:flex;gap:8px;align-items:center;background:#1B2028;border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-top:12px}
.sh-link input{flex:1;background:transparent;border:none;color:var(--ink);font-size:14px;font-weight:700;outline:none;min-width:0}
.meme-title{font-size:15px;font-weight:800;color:var(--ink);text-align:center;margin:12px 4px 4px}
.meme-meta{display:flex;justify-content:center;gap:14px;font-size:12px;color:var(--faint);font-weight:700;flex-wrap:wrap}
.meme-meta i{color:#60A5FA;margin-right:4px}
</style>`;

const HELPERS = `
"use strict";
var $=function(id){return document.getElementById(id);};
var API_BASE="https://abhi-api.vercel.app/api";
function proc(m){var p=$("procLine");if(p)p.textContent=m;}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function copyText(txt,btn){
  function ok(){if(btn){var o=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i>Copied!';setTimeout(function(){btn.innerHTML=o;},1500);}}
  if(window.Troolify&&window.Troolify.copyToClipboard){window.Troolify.copyToClipboard(txt,ok);}
  else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(ok,ok);}
  else{var ta=document.createElement("textarea");ta.value=txt;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.top="-9999px";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");}catch(e){}document.body.removeChild(ta);ok();}
}
function downloadFromUrl(url,name){
  fetch(url).then(function(r){if(!r.ok)throw 0;return r.blob();}).then(function(b){
    var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name||"troolify-download";
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href);},5000);proc("Download started.");
  }).catch(function(){window.open(url,"_blank");proc("Opened in a new tab (the host blocked direct download).");});
}
function busify(btn){
  var o=btn.innerHTML;btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i> Working...';
  return function(){btn.disabled=false;btn.innerHTML=o;};
}
function apiGet(p,cb,end){
  var ctl=new AbortController();var t=setTimeout(function(){ctl.abort();},15000);
  proc("Contacting the web API...");
  fetch(API_BASE+p,{signal:ctl.signal}).then(function(r){return r.json();}).then(function(d){
    clearTimeout(t);
    if(!d||d.status===false){throw new Error((d&&d.result)||"The API returned an error.");}
    if(cb)cb(d.result);if(end)end();
  }).catch(function(e){
    clearTimeout(t);
    var msg=(e&&e.name==="AbortError")?"The request timed out - the API may be down right now.":"Could not reach the web API. It may be temporarily unavailable - please try again in a moment.";
    $("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> '+esc(msg)+'</div>';
    proc("Request failed.");if(end)end();
  });
}
`;

const HELPERS_TAIL = `
function hookClear(){
  var clr=$("clearBtn");if(!clr)return;
  clr.addEventListener("click",function(){
    var panel=document.querySelector(".panel");
    panel.querySelectorAll("input[type=text],input[type=url],input[type=search]").forEach(function(i){i.value="";});
    panel.querySelectorAll("textarea").forEach(function(i){i.value="";});
    panel.querySelectorAll("select").forEach(function(s){s.selectedIndex=0;try{s.dispatchEvent(new Event("change"));}catch(e){}});
    panel.querySelectorAll(".chip-row .chip").forEach(function(c,i){c.classList.toggle("active",i===0);});
    panel.querySelectorAll("input[type=checkbox]").forEach(function(c){c.checked=false;});
    var r=$("results");if(r)r.innerHTML="";
    var p=$("procLine");if(p)p.textContent="Ready.";
    if(window.ap&&window.ap.clear)window.ap.clear();
  });
}
function pageNiceNote(){
  document.addEventListener("DOMContentLoaded",function(){
    var n=document.querySelector("#embedModal .modal-note");
    if(n)n.textContent="Note: this tool calls a public web API - the text you enter is sent to the API provider to generate the result.";
  });
}
hookClear();
pageNiceNote();
` + "\n";

function jsonLd(blocks) {
  return blocks.map(function (b) { return '<script type="application/ld+json">' + JSON.stringify(b.data) + "</" + "script>"; }).join("\n");
}

function page(cfg, scriptSrc) {
  var canonical = BASE + "/" + cfg.folder + "/" + cfg.slug + ".html";
  var catIndex = BASE + "/tools/" + cfg.folder + "/index.html";
  var cleanDesc = cfg.desc.replace(/\.+$/, "");
  var faqJ = cfg.faq.map(function (f) {
    return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
  });
  var ld = jsonLd([
    { data: {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE + "/index.html" },
        { "@type": "ListItem", position: 2, name: "Tools", item: BASE + "/tools/index.html" },
        { "@type": "ListItem", position: 3, name: cfg.catLabel, item: catIndex },
        { "@type": "ListItem", position: 4, name: cfg.name, item: canonical }
      ] } },
    { data: {
      "@context": "https://schema.org", "@type": "SoftwareApplication", name: cfg.name,
      url: canonical, applicationCategory: "UtilitiesApplication", applicationSubCategory: cfg.catFolder,
      operatingSystem: "Any (web browser)", featureList: (cfg.features || []).concat(["Powered by a public web API"]),
      description: cfg.desc,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      datePublished: DATE, dateModified: DATE,
      author: { "@type": "Organization", name: "F9XR Development Team", url: "https://f9xr.github.io/" },
      publisher: { "@type": "Organization", name: "Troolify", url: BASE + "/", logo: { "@type": "ImageObject", url: BASE + "/assets/images/logo_nobg.webp", width: 1407, height: 768 } } } },
    { data: {
      "@context": "https://schema.org", "@type": "Article", headline: cfg.name, description: cfg.desc,
      image: BASE + "/assets/images/og-image.jpg", datePublished: DATE, dateModified: DATE,
      mainEntityOfPage: canonical,
      author: { "@type": "Organization", name: "F9XR Development Team", url: "https://f9xr.github.io/" },
      publisher: { "@type": "Organization", name: "Troolify", url: BASE + "/", logo: { "@type": "ImageObject", url: BASE + "/assets/images/logo_nobg.webp", width: 1407, height: 768 } } } },
    { data: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqJ } }
  ]);

  var articleFaq = cfg.faq.map(function (f) {
    return '<details class="faq-item"><summary>' + esc(f.q) + '</summary><div class="faq-a"><p>' + f.a + '</p></div></details>';
  }).join("\n");

  var html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n" +
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    "<title>" + esc(cfg.toolTitle) + "</title>\n" +
    '<meta name="description" content="' + esc(cfg.desc) + '">\n' +
    '<meta name="author" content="F9XR Development Team">\n' +
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">\n' +
    '<meta name="theme-color" content="#212529">\n' +
    '<link rel="canonical" href="' + canonical + '">\n' +
    '<meta property="og:site_name" content="Troolify">\n<meta property="og:locale" content="en_US">\n' +
    '<meta property="og:title" content="' + esc(cfg.toolTitle) + '">\n' +
    '<meta property="og:description" content="' + esc(cfg.desc) + '">\n' +
    '<meta property="og:type" content="article">\n' +
    '<meta property="og:url" content="' + canonical + '">\n' +
    '<meta property="og:image" content="' + BASE + '/assets/images/og-image.jpg">\n' +
    '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' +
    '<meta property="article:published_time" content="' + DATE + '">\n' +
    '<meta property="article:modified_time" content="' + DATE + '">\n' +
    '<meta property="article:section" content="' + esc(cfg.catLabel) + '">\n' +
    '<meta property="article:tag" content="' + esc(cfg.name) + '">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<meta name="twitter:title" content="' + esc(cfg.toolTitle) + '">\n' +
    '<meta name="twitter:description" content="' + esc(cfg.desc) + '">\n' +
    '<meta name="twitter:image" content="' + BASE + '/assets/images/og-image.jpg">\n' +
    ld + "\n" +
    '<link rel="icon" type="image/webp" href="../../assets/images/favicon.webp"><link rel="icon" type="image/x-icon" href="../../assets/images/favicon.ico">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" media="print" onload="this.media=\'all\'">\n' +
    '<noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></noscript>\n' +
    '<link rel="stylesheet" href="../../assets/css/tailwind.css">\n' +
    '<link rel="stylesheet" href="../../assets/css/tool.css">\n' +
    '<link rel="stylesheet" href="../../assets/css/site-shell.css">\n' +
    '<link rel="stylesheet" href="../../assets/css/tool-page.css">\n' +
    '<link rel="stylesheet" href="../../assets/css/seo-article.css">\n' +
    CSS + "\n</head>\n" +
    '<body data-layout="tool">\n' +
    '<noscript>\n    <nav aria-label="Primary" style="position:static;display:block;padding:1rem 1.5rem;background:#212529;border-bottom:1px solid #343A40;text-align:center;font-size:0.9rem;">\n' +
    '        <a href="../../index.html" style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">Home</a>\n' +
    '        <a href="../../tools/index.html" style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">Tools</a>\n' +
    '        <a href="../../pages/about.html" style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">About</a>\n' +
    '        <a href="../../pages/contact.html" style="color:#F8F9FA;margin:0 0.75rem;text-decoration:none;">Contact</a>\n' +
    '    </nav>\n</noscript>\n' +
    '<main class="tool-main">\n  <div class="container">\n' +
    '    <div class="tool-head hero">\n' +
    '      <nav class="breadcrumbs" aria-label="Breadcrumb"><ol>\n' +
    '        <li><a href="../../index.html"><i class="fa-solid fa-house"></i>Home</a></li>\n' +
    '        <li><a href="../../tools/index.html">Tools</a></li>\n' +
    '        <li><a href="../index.html">' + esc(cfg.catLabel) + "</a></li>\n" +
    '        <li class="current" aria-current="page">' + esc(cfg.name) + "</li>\n</ol></nav>\n" +
    '      <div class="hero-main">\n' +
    '        <span class="tool-badge"><span class="dot"></span>Powered by a public web API &middot; see privacy note</span>\n' +
    "        <h1>" + esc(cfg.name) + "</h1>\n" +
    "        <p>" + esc(cfg.desc) + "</p>\n      </div>\n" +
    '      <div class="hero-box hero-cat"><h3 class="hero-box-title"><i class="fa-solid fa-folder-open"></i>Category</h3>\n' +
    '        <div class="tool-meta">\n' +
    '          <span class="tool-tag"><i class="fa-solid fa-tags"></i>' + esc(cfg.catFolder) + "</span>\n" +
    '          <a class="tool-cat" href="../index.html" aria-label="Browse ' + esc(cfg.catLabel) + '"><i class="fa-solid fa-folder"></i>' + esc(cfg.catLabel) + "</a>\n        </div>\n      </div>\n" +
    '      <div class="hero-box hero-qa"><h3 class="hero-box-title"><i class="fa-solid fa-bolt"></i>Quick Actions</h3>\n' +
    '        <div class="tool-actions">\n' +
    '          <button class="rt-btn" type="button" id="btnShare"><i class="fa-solid fa-share-nodes"></i>Share</button>\n' +
    '          <button class="rt-btn" type="button" id="btnEmbed"><i class="fa-solid fa-code"></i>Embed Tool</button>\n' +
    '          <a class="rt-btn" href="../../pages/feedback.html"><i class="fa-solid fa-comment"></i>Feedback</a>\n' +
    "        </div>\n      </div>\n" +
    '      <div class="hero-box hero-details"><h3 class="hero-box-title"><i class="fa-solid fa-circle-info"></i>Tool Details</h3>\n' +
    '        <div class="tool-details">\n' +
    '          <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-pen-nib"></i>Published by</span><a class="detail-value" href="https://f9xr.github.io/" target="_blank" rel="noopener">F9XR Development Team</a></div>\n' +
    '          <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-check-double"></i>Reviewed by</span><a class="detail-value" href="../../press/editorial-policies.html">Review Board</a></div>\n' +
    '          <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-clock-rotate-left"></i>Last updated</span><span class="detail-value">19 September 2026</span></div>\n' +
    "        </div>\n      </div>\n    </div>\n\n" +
    '    <div class="panel clean">\n      <div class="panel-inner">\n' +
    '        <div class="toolbar-row">\n' +
    '          <span class="tool-label"><i class="fa-solid ' + esc(cfg.icon) + '"></i>' + esc(cfg.name) + "</span>\n" +
    '          <div class="toolbar-actions"><button class="chip-btn" type="button" id="clearBtn" title="Reset the form"><i class="fa-solid fa-eraser"></i><span class="hide-sm">Clear</span></button></div>\n' +
    "        </div>\n\n" +
    "    " + cfg.fields + "\n" +
    "    " + cfg.actions + "\n" +
    '    <p class="note"><b>Privacy note:</b> this tool is powered by a public web API. The text you enter is sent to the API provider (abhi-api.vercel.app) to generate the result' + cfg.extraProviders + " - Troolify itself stores nothing, but data does leave your device.\n" +
    '    <p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="procLine">' + esc(cfg.startHint) + "</span></p>\n" +
    '        <div class="result-card" id="results" aria-live="polite"></div>\n' +
    "      </div>\n    </div>\n" +
    '    <aside class="disclaimer" aria-label="Disclaimer"><i class="fa-solid fa-circle-info"></i><p>Disclaimer: Whilst every effort has been made in building our tool, we are not to be held liable for any damages or monetary losses arising out of or in connection with their use. <a href="../../press/disclaimer.html">Full disclaimer</a>.</p></aside>\n\n' +
    '    <div class="article-layout"><article class="seo-article">\n\n' +
    cfg.article + "\n" +
    '      <h2 id="faq-title">Frequently Asked Questions</h2>\n' +
    articleFaq + "\n" +
    "      <h2>Conclusion</h2>\n      <p>" + esc(cfg.conclusion || "") + "</p>\n    </article></div>\n\n" +
    '    <section class="keyword-box" aria-label="Keywords"><h2>Keyword &amp; Tags</h2>\n' +
    "      <h3>Keywords</h3>\n      <div class=\"keywords\">\n" +
    cfg.keywords.map(function (k) { return '<span class="keyword">' + esc(k) + "</span>"; }).join("") + "\n      </div>\n" +
    "      <h3>Tags</h3>\n      <div class=\"tags\">\n" +
    '<a class="tag" href="../index.html"><i class="fa-solid fa-tags"></i>' + esc(cfg.catFolder) + "</a>\n" +
    '<a class="tag" href="../index.html"><i class="fa-solid fa-folder"></i>' + esc(cfg.catLabel) + "</a>\n      </div>\n    </section>\n\n" +
    '    <section class="author-box" aria-label="About the publisher">\n' +
    '      <div class="author-avatar" aria-hidden="true"><img src="../../assets/images/logo_nobg.webp" alt="F9XR logo" loading="lazy" decoding="async" width="1407" height="768"></div>\n' +
    "      <div>\n        <span class=\"author-role\">Published by</span>\n        <h2>F9XR Development Team</h2>\n" +
    "        <p>" + (cfg.authorNote || "") + "</p>\n" +
    '        <div class="author-links">\n' +
    '          <a href="https://f9xr.github.io/" target="_blank" rel="noopener"><i class="fa-solid fa-globe"></i>F9XR Team</a>\n' +
    '          <a href="../../press/editorial-policies.html"><i class="fa-solid fa-scale-balanced"></i>Editorial Policies</a>\n' +
    '          <a href="https://github.com/f9xr" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>GitHub</a>\n' +
    '          <a href="https://linkedin.com/company/f9xrteam" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin"></i>LinkedIn</a>\n' +
    "        </div>\n      </div>\n    </section>\n\n" +
    '    <section class="related-tools" aria-label="Related tools">\n      <h2>Related Tools</h2>\n' +
    '      <div class="related-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>\n' +
    '        <input type="search" id="relatedSearch" placeholder="Search all Troolify tools&hellip;" autocomplete="off" aria-label="Search related tools">\n      </div>\n' +
    '      <div class="related-grid" id="relatedGrid" aria-busy="true">\n' +
    '        <div class="skel skel-related-card" aria-hidden="true"><span class="skel skel-icon"></span><span class="skel skel-line skel-w-70"></span><span class="skel skel-line skel-w-90"></span><span class="skel skel-line skel-w-60"></span></div>\n      </div>\n    </section>\n\n' +
    '    <section class="comments" aria-label="Comments"><h2>Comments</h2>\n      <div id="comments"><script src="https://utteranc.es/client.js" repo="f9xr/troolify" issue-term="pathname" theme="github-dark" crossorigin="anonymous" async></div>\n    </section>\n' +
    '    <div class="section-divider" aria-hidden="true"><span></span><i class="fa-solid fa-layer-group"></i><span></span></div>\n  </div>\n</main>\n' +
    '<script src="../../assets/js/layout.js" defer></script>\n' +
    '<script src="../../assets/js/tools-data.js" defer></script>\n' +
    '<script src="../../assets/js/tool-page.js" defer></script>\n\n' +
    "<script>\n(function(){\n" + HELPERS + "\n" + scriptSrc + "\n" + HELPERS_TAIL + "\n})();\n</script>\n" +
    "</body>\n</html>\n";
  return html;
}

function build(cfg) {
  const scriptPath = path.join(__dirname, "scripts", cfg.slug + ".js");
  const scriptSrc = fs.readFileSync(scriptPath, "utf8");
  const html = page(cfg, scriptSrc);
  const dir = path.join(REPO, "tools", cfg.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, cfg.slug + ".html"), html, "utf8");
}

module.exports = { build, esc, BASE, REPO };