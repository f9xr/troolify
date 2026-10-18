/* ============================================================================
   Troolify - strip redundant "index.html" from internal links
   ----------------------------------------------------------------------------
   GitHub Pages serves directory URLs at /<dir>/ (index.html is implicit), so

     https://f9xr.org/troolify/tools/statistics/index.html  ->  .../tools/statistics/
     href="../../index.html"                                ->  href="../../"
     href="tools/statistics/index.html"                     ->  href="tools/statistics/"

   This rewrites visible <a>/<img> hrefs/src, meta-refresh targets, canonical /
   Open Graph / JSON-LD absolute URLs and sitemap <loc> values. Tool *leaf*
   pages keep their .html extension (only index.html is stripped).

   Idempotent: running twice changes nothing.
   Run:  node troolify-gen/strip-index-links.js          (dry-run, prints counts)
         node troolify-gen/strip-index-links.js --apply  (writes files)
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.indexOf("--apply") !== -1;

const EXT = new Set([".html", ".xml", ".txt", ".md"]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".well-known", "troolify-gen", "assets"]);

function dirify(p) {
  if (p === "" || p === ".") return "./";
  if (p.endsWith("/")) return p;
  return p + "/";
}

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, out);
    } else if (EXT.has(path.extname(name).toLowerCase())) {
      out.push(full);
    }
  }
}

function transform(text) {
  let n = 0;

  // href="...index.html" / src="...index.html" (optional # fragment or ?query)
  text = text.replace(/(href|src)="([^"]*?)index\.html([#?][^"]*)?"/g, function (m, attr, pre, suffix) {
    n++;
    return attr + '="' + dirify(pre) + (suffix || "") + '"';
  });

  // meta refresh: content="0; url=tools/index.html"
  text = text.replace(/(content="[^"]*url=)([^"]*?)index\.html"/g, function (m, head, pre) {
    n++;
    return head + dirify(pre) + '"';
  });

  // absolute canonical / og:url / JSON-LD URLs
  text = text.replace(/https:\/\/f9xr\.org\/troolify((?:\/[A-Za-z0-9_.\-]+)*)\/index\.html/g, function (m, dir) {
    n++;
    return "https://f9xr.org/troolify" + dir + "/";
  });

  // plain "tools/index.html" occurrences inside JSON strings not caught above
  // (e.g. JSON-LD "item": ".../tools/index.html") - covered by the absolute rule.
  return { text, n };
}

function run() {
  const files = [];
  walk(ROOT, files);
  // gendocs live outside walk roots; process them explicitly when present.
  let total = 0, changed = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const { text, n } = transform(src);
    if (text !== src) {
      changed++;
      total += n;
      if (APPLY) fs.writeFileSync(f, text, "utf8");
      console.log((APPLY ? "updated " : "would   ") + String(n).padStart(3) + "  " + path.relative(ROOT, f));
    }
  }
  console.log("---");
  console.log("files scanned: " + files.length + "  files changed: " + changed + "  replacements: " + total + (APPLY ? "" : "  (dry-run)"));
}

run();
