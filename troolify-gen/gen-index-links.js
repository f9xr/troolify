/* ============================================================================
   Troolify - static internal-link index generator
   ----------------------------------------------------------------------------
   The hub + category pages render their tool/category grids client-side, so the
   served HTML links only the noscript nav + breadcrumbs. To make the
   home <-> hub <-> category <-> tool hierarchy crawlable (and bidirectional),
   this injects two visible, static link sections:

     tools/index.html          -> "Browse all categories" (hub -> 27 categories)
     tools/<slug>/index.html   -> "All <Category>" tool index (category -> tools)

   Reads assets/js/tools-data.js (window.TOOLS / window.CATEGORIES - the source
   of truth). Idempotent: each block is keyed by its section id and replaced on
   re-run. Run:  node troolify-gen/gen-index-links.js
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadData() {
  const raw = fs.readFileSync(path.join(ROOT, "assets", "js", "tools-data.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(raw, sandbox, { filename: "tools-data.js" });
  const tools = sandbox.window.TOOLS;
  const categories = sandbox.window.CATEGORIES;
  if (!Array.isArray(tools) || !Array.isArray(categories)) {
    throw new Error("tools-data.js did not define window.TOOLS / window.CATEGORIES");
  }
  return { tools, categories };
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function slug(folder) { return String(folder).toLowerCase(); }

const BLOCK_RE = /<section class="index-links"[^>]*id="(?:categoryIndex|toolIndex)"[\s\S]*?<\/section>/;

function inject(file, block) {
  if (!fs.existsSync(file)) { console.log("MISSING  " + path.relative(ROOT, file)); return; }
  let html = fs.readFileSync(file, "utf8");
  const had = BLOCK_RE.test(html);
  html = html.replace(BLOCK_RE, "");
  if (html.indexOf("</main>") === -1) {
    console.log("NO MAIN  " + path.relative(ROOT, file));
    return;
  }
  html = html.replace(/<\/main>/, block + "</main>");
  fs.writeFileSync(file, html, "utf8");
  console.log((had ? "updated  " : "added    ") + path.relative(ROOT, file));
}

function countIn(tools, folder) {
  return tools.filter(function (t) { return t.category === folder; }).length;
}

function catBlock(categories, tools) {
  const cards = categories.map(function (c) {
    return '<a class="index-cat"href="' + slug(c.folder) + '/index.html">' +
      '<i class="' + c.icon + '"aria-hidden="true"></i>' +
      '<span class="index-cat-name">' + esc(c.name) + '</span>' +
      '<span class="index-cat-count">' + countIn(tools, c.folder) + ' tools</span></a>';
  }).join("");
  return '<section class="index-links"id="categoryIndex"><div class="container">' +
    '<h2>Browse all categories</h2>' +
    '<p class="index-note">Jump straight to any of the ' + categories.length +
    ' Troolify categories. Every tool runs 100% in your browser &mdash; nothing is uploaded or stored.</p>' +
    '<div class="index-cats">' + cards + '</div></div></section>';
}

function toolBlock(cat, list) {
  const items = list.map(function (t) {
    const file = String(t.href).split("/").pop();
    return '<li><a href="' + esc(file) + '"><i class="' + t.icon + '"aria-hidden="true"></i>' +
      esc(t.name) + '</a></li>';
  }).join("");
  return '<section class="index-links"id="toolIndex"><div class="container">' +
    '<h2>All ' + esc(cat.name) + '</h2>' +
    '<p class="index-note">' + esc(cat.desc || "") +
    ' <a href="../index.html">Browse the full catalog</a>.</p>' +
    '<ul class="index-tools">' + items + '</ul></div></section>';
}

function run() {
  const { tools, categories } = loadData();

  // hub: tools/index.html -> every category page
  inject(path.join(ROOT, "tools", "index.html"), catBlock(categories, tools));

  // each category page -> every tool in that category
  let pages = 0;
  for (const c of categories) {
    const list = tools.filter(function (t) { return t.category === c.folder; });
    const file = path.join(ROOT, "tools", slug(c.folder), "index.html");
    if (!fs.existsSync(file)) { console.log("MISSING  tools/" + slug(c.folder) + "/index.html"); continue; }
    inject(file, toolBlock(c, list));
    pages++;
  }
  console.log("categories: " + categories.length + "  category pages updated: " + pages +
    "  tool links emitted: " + tools.length);
}

if (require.main === module) run();
