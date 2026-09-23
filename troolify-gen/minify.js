/* ============================================================================
   Troolify - Build / minify pipeline
   ----------------------------------------------------------------------------
   Run:   npm install   (once)
          node troolify-gen/minify.js

   What it does (idempotent - safe to re-run):
   1. Replaces inline utteranc.es comment <script> tags on every tool page with
      a lazy placeholder (the script is injected only when scrolled into view by
      tool-page.js). Skips pages already converted.
   2. Removes the redundant direct <script src="...tools-data.js"> include on
      tool leaf pages (tool-page.js / layout.js already lazy-load it through a
      shared pending guard). Category indexes, catalog and homepage keep it.
   3. Regenerates the slim registry (tools-data-slim.js) from tools-data.js and
      rewrites the eager tools-data include on hub pages (homepage, catalog,
      category indexes) to the slim file; search / related-tools lazy-load the
      full registry when keyword matching is needed.
   4. Rewrites every reference to a managed asset to its minified sibling:
         assets/js/foo.js        -> assets/js/foo.min.js
         assets/css/foo.css      -> assets/css/foo.min.css
      Applies to HTML pages AND to the dynamic "load on demand" string refs
      inside the JS runtime (layout.js, tool-page.js, dashboard-nav.js, ...).
      Already-minified refs are left untouched.
   5. Compacts every inline JSON-LD block (pure JSON - whitespace removal is
      always safe).
   6. Terser-compresses the inline tool-logic scripts, run to a fixed point so
      the result is idempotent on re-runs. JSON-LD is excluded from this pass.
   7. Ships the below-fold article stylesheet (seo-article.min.css) as
      preload + media="print" onload swap with a noscript twin, keeping it out
      of the render-blocking chain. Idempotent (never re-wraps the noscript link).
   8. Minifies each managed JS (terser) and CSS (clean-css) file in place,
      writing the sibling .min version.
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const CleanCSS = require("clean-css");

const ROOT = path.join(__dirname, "..");

/* --------------------------- helpers ------------------------------------ */

function walk(dir, ext, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, ext, out);
    else if (ent.name.endsWith(ext)) out.push(full);
  }
  return out;
}
function rel(file) { return path.relative(ROOT, file).split(path.sep).join("/"); }

/* --------------------------- asset registry ------------------------------ */

function assetRegistry() {
  const js = walk(path.join(ROOT, "assets", "js"), ".js")
    .filter((f) => !/\.min\.js$/.test(f))
    .map((f) => ({ src: f, name: path.basename(f) }));
  const css = walk(path.join(ROOT, "assets", "css"), ".css")
    .filter((f) => !/\.min\.css$/.test(f))
    .map((f) => ({ src: f, name: path.basename(f) }));
  return { js, css };
}

/* Rewrites "assets/js/foo.js" -> "assets/js/foo.min.js" (same for css).
   Guards: only map names in the registry, skip names already *.min.* */
function buildRenamer(registry) {
  const jsMap = new Map(registry.js.map((a) => [a.name, a.name.replace(/\.js$/, ".min.js")]));
  const cssMap = new Map(registry.css.map((a) => [a.name, a.name.replace(/\.css$/, ".min.css")]));
  return (text) =>
    text.replace(/assets\/(js|css)\/([\w-]+)\.(js|css)/g, (m, kind, name, ext) => {
      const map = kind === "js" ? jsMap : cssMap;
      const target = map.get(name + "." + ext);
      if (!target || name.endsWith(".min")) return m; // not managed / already min
      return "assets/" + kind + "/" + target;
    });
}

/* --------------------------- utteranc lazy transform --------------------- */

const UTTERANC_SCRIPT = /<script\s+src="https:\/\/utteranc\.es\/client\.js"([\s\S]*?)>\s*<\/script>/gi;
const UTTERANC_PLACEHOLDER = '__UTTERANC_PLACEHOLDER__';

function convertUtterancToPlaceholder(html) {
  if (html.indexOf("data-utteranc") !== -1) return html; // already done
  return html.replace(UTTERANC_SCRIPT, (whole, attrs) => {
    const grab = (name) => {
      const m = attrs.match(new RegExp(name + '="([^"]*)"'));
      return m ? m[1] : "";
    };
    const repo = grab("repo") || "f9xr/troolify";
    const issueTerm = grab("issue-term") || "pathname";
    const theme = grab("theme") || "github-dark";
    return (
      '<!-- utteranc.es comments load lazily via tool-page.js -->' +
      '<div class="comments-host" data-utteranc data-repo="' + repo +
      '" data-issue-term="' + issueTerm + '" data-theme="' + theme + '"></div>'
    );
  });
}

/* --------------------------- tools-data include strip -------------------- */

const TOOLS_DATA_SCRIPT = /<script[^>]*src="[^"]*assets\/js\/tools-data\.js"[^>]*>\s*<\/script>\s*/gi;

function stripToolsDataInclude(html) {
  return html.replace(TOOLS_DATA_SCRIPT, "");
}

/* --------------------------- tools-data slim swap ------------------------ */
/* Hub pages (homepage, catalog, category indexes) ship the slim registry for
   instant grid rendering. Keyword search / related-tools lazy-load the FULL
   registry on demand, so the eager <script> tag here points at the slim file.
   Leaf tool pages (already stripped above) load nothing eagerly. */

const TOOLS_DATA_FULL_TAG = /<script[^>]*src="[^"]*assets\/js\/tools-data\.min\.js"[^>]*>\s*<\/script>/gi;

function swapToolsDataToSlim(html, prefix) {
  return html.replace(TOOLS_DATA_FULL_TAG, function () {
    return '<script src="' + prefix + 'assets/js/tools-data-slim.js" defer></script>';
  });
}

/* --------------------------- self-hosted fonts swap ---------------------- */

// Google Fonts: preconnect x2 + css2 stylesheet -> single local jakarta.min.css
const GOOGLE_FONTS = /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^"]*" rel="stylesheet">/gi;

// Font Awesome CDN css link (+ noscript twin) -> local icons.min.css
const FA_CDN = /<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.0\/css\/all\.min\.css"[^>]*>\s*<noscript><link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.0\/css\/all\.min\.css"><\/noscript>/gi;
const FA_CDN_PRECONNECT = /<link rel="preconnect" href="https:\/\/cdnjs\.cloudflare\.com" crossorigin>\s*/gi;

function swapFontLinks(html, prefix) {
  let out = html;
  out = out.replace(
    GOOGLE_FONTS,
    '<link rel="stylesheet" href="' + prefix + 'assets/css/jakarta.min.css">'
  );
  const faSwapped = out.replace(
    FA_CDN,
    '<link rel="stylesheet" href="' + prefix + 'assets/css/icons.min.css">'
  );
  if (faSwapped !== out) {
    out = faSwapped;
    // the cdnjs preconnect is only useful while the FA stylesheet is remote;
    // drop it together with the CDN link (it must not touch tool pages that
    // legitimately preconnect to cdnjs for their own libraries)
    out = out.replace(FA_CDN_PRECONNECT, "");
  }
  return out;
}

function pagePrefix(file) {
  // relative prefix from the HTML's folder up to the repo root, e.g.
  // ROOT/tools/coding/x.html -> "../../" ; ROOT/index.html -> ""
  const from = path.dirname(file);
  const relPath = path.relative(from, ROOT);
  return relPath.replace(/\\/g, "/") + (relPath ? "/" : "");
}

/* --------------------------- inline script terser minify ------------------- */
/* Inline tool-logic <script> blocks ship untransformed (the HTML minifier has
   minifyJS off so it never touches <script> bodies). Compress + mangle them
   with terser. Idempotent: terser output re-parses to the same output. */

const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/[^"]+")[^>]*>[\s\S]*?<\/script>/g;

async function minifyInlineScripts(html) {
  const matches = [];
  let m;
  while ((m = INLINE_SCRIPT_RE.exec(html))) matches.push(m);
  if (!matches.length) return html;

  let out = "", last = 0, hit = false;
  for (const match of matches) {
    out += html.slice(last, match.index);
    const tagEnd = match[0].indexOf(">") + 1;
    const openTag = match[0].slice(0, tagEnd);
    const body = match[0].slice(tagEnd, -"</script>".length);
    let code = body;
    try {
      if (body.trim().length) {
        const res = await minify(body, {
          compress: true, mangle: true,
          format: { comments: false, keep_quoted_props: false },
        });
        code = res.code;
      }
    } catch (e) { code = body; }
    if (code !== body) hit = true;
    out += openTag + code + "</script>";
    last = match.index + match[0].length;
  }
  out += html.slice(last);
  return hit ? out : html;
}

/* --------------------------- below-fold article CSS ------------------------ */
/* seo-article.min.css styles the SEO article that sits below the tool and the
   comments. Loading it async (preload + media="print" swap, noscript twin)
   keeps ~14 KB out of the render-blocking chain on every tool page. */

const SEO_ARTICLE_LINK = /(?<!<noscript>)<link rel="stylesheet"\s*href="([^"]*seo-article\.min\.css)"\s*>/g;

function deferArticleCss(html) {
  return html.replace(SEO_ARTICLE_LINK, function (m, href) {
    return (
      '<link rel="preload"as="style"href="' + href + '">' +
      '<link rel="stylesheet"href="' + href + '"media="print"onload="this.media=&#39;all&#39;">' +
      '<noscript><link rel="stylesheet"href="' + href + '"></noscript>'
    );
  });
}

/* --------------------------- inline JSON-LD minify ------------------------- */
/* Every tool page ships an <script type="application/ld+json"> FAQ/HowTo block.
   The HTML minifier never touches <script> contents, so these ship with
   whitespace/newlines. Compact JSON is safe (JSON parsers ignore whitespace)
   and idempotent. */

const JSONLD_SCRIPT = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;

function minifyInlineJsonLd(html) {
  return html.replace(JSONLD_SCRIPT, function (whole, body) {
    try {
      const compact = JSON.stringify(JSON.parse(body));
      if (!compact) return whole;
      return whole.slice(0, whole.indexOf(">") + 1) + compact + "</script>";
    } catch (e) {
      return whole; // leave invalid/malformed blocks untouched
    }
  });
}

/* --------------------------- cdnjs preconnect ----------------------------- */
/* Tool pages that load library JS from cdnjs.cloudflare.com get a preconnect
   hint so the first third-party request starts earlier. Idempotent: skipped
   once the hint is already present. */

const CDNJS_PRECONNECT = '<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>';

function addCdnjsPreconnect(html) {
  if (html.indexOf("cdnjs.cloudflare.com") === -1 ||
      html.indexOf(CDNJS_PRECONNECT) !== -1) return html;
  return html.replace(/<head>/i, "<head>" + CDNJS_PRECONNECT);
}

function isToolLeafPage(file) {
  // Tool leaf = a real tool page (loads tool-page.js) that is NOT a category
  // index (index.html) and NOT the catalog/homepage.
  if (path.basename(file) === "index.html") return false;
  const raw = fs.readFileSync(file, "utf8");
  return /assets\/js\/tool-page\.js/.test(raw);
}

/* --------------------------- main ----------------------------------------- */

const { generate: generateSlim } = require("./gen-slim");
const { minify: minifyHtml } = require("html-minifier-terser");

const HTML_MINIFY_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  collapseBooleanAttributes: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  useShortDoctype: true,
  removeTagWhitespace: true,
  sortAttributes: false,
  minifyJS: false, // tool pages carry inline logic; leave untouched
  minifyCSS: false,
};

async function run() {
  // 0: keep the slim registry in sync with the full source of truth
  generateSlim();

  const { js, css } = assetRegistry();
  const rename = buildRenamer({ js, css });

  // 1 & 2: HTML passes (utteranc placeholder + tools-data include strip + ref rewrite)
  const htmlFiles = walk(ROOT, ".html").filter(
    (f) => !/\\node_modules\\/.test(f)
  );
  let utt = 0, strip = 0, href = 0, refs = 0, fonts = 0, htmlMin = 0, slim = 0, preconnect = 0, jsonld = 0, inline = 0, articleAsync = 0;
  for (const file of htmlFiles) {
    const before = fs.readFileSync(file, "utf8");
    let out = before;

    const converted = convertUtterancToPlaceholder(out);
    if (converted !== out) { utt++; out = converted; }

    // relative asset prefix for this page's folder depth
    const prefix = pagePrefix(file);

    if (isToolLeafPage(file)) {
      const s = out.replace(TOOLS_DATA_SCRIPT, () => { strip++; return ""; });
      out = s;
    } else {
      // Pages that still include the full registry eagerly (homepage, catalog,
      // category indexes): point the tag at the slim build. Keyword search and
      // related-tools lazy-load the full file on demand.
      const sl = swapToolsDataToSlim(out, prefix);
      if (sl !== out) { slim++; out = sl; }
    }

    // swap remote fonts (Google Fonts / FA CDN) for local self-hosted builds
    const swapped = swapFontLinks(out, prefix);
    if (swapped !== out) { fonts++; out = swapped; }

    // preconnect for tool pages that load cdnjs libraries
    const pc = addCdnjsPreconnect(out);
    if (pc !== out) { preconnect++; out = pc; }

    // compact the inline JSON-LD blocks (safe, idempotent)
    const ld = minifyInlineJsonLd(out);
    if (ld !== out) { jsonld++; out = ld; }

    // terser-compress the inline tool-logic scripts (JSON-LD is untouched).
    // Run to fixed point: terser's sequence-merging can compact its own output
    // one extra time, so a single pass is not idempotent on fresh pages.
    {
      let cur = out;
      for (let it = 0; it < 4; it++) {
        const next = await minifyInlineScripts(cur);
        if (next !== cur) { cur = next; } else break;
      }
      if (cur !== out) { inline++; out = cur; }
    }

    // ship the below-fold article stylesheet asynchronous on tool pages
    const art = deferArticleCss(out);
    if (art !== out) { articleAsync++; out = art; }

    const renamed = rename(out);
    if (renamed !== out) { refs++; out = renamed; }

    if (out !== before) {
      const isHref = /\.min\.(js|css)/.test(out)
        && /\.min\.(js|css)/.test(before);
      if (!isHref) {} // informational
      fs.writeFileSync(file, out, "utf8");
      href++;
    }

    // 3-hole: HTML minify pass (whitespace/comments only to keep tool logic safe).
    // Already-minified pages drop the "data-minimized" marker, so re-runs are no-ops.
    if (out.indexOf("data-minimized") === -1) {
      const beforeMin = out;
      const minOut = await minifyHtml(out, HTML_MINIFY_OPTS);
      // html-minifier removes the marker tag only when actually minified
      out = minOut + '\n<!-- data-minimized -->';
      if (out.trim() !== beforeMin.trim()) {
        fs.writeFileSync(file, out, "utf8");
        htmlMin++;
      }
    }
  }

  // 3: rewrite dynamic asset refs inside managed JS sources themselves
  const allJsAssets = js.map((a) => a.src);
  let jsSrc = 0;
  for (const file of allJsAssets) {
    const raw = fs.readFileSync(file, "utf8");
    const renamed = rename(raw);
    if (renamed !== raw) { fs.writeFileSync(file, renamed, "utf8"); jsSrc++; }
  }

  // 4: minify
  const clean = new CleanCSS({ level: 2, compatibility: "*" });
  let jsBytes = 0, cssBytes = 0;
  for (const a of js) {
    const src = fs.readFileSync(a.src, "utf8");
    const res = await minify(src, { compress: true, mangle: true, format: { comments: false } });
    const minFile = a.src.replace(/\.js$/, ".min.js");
    fs.writeFileSync(minFile, res.code, "utf8");
    jsBytes += src.length - res.code.length;
  }
  for (const a of css) {
    const src = fs.readFileSync(a.src, "utf8");
    const res = clean.minify(src);
    const minFile = a.src.replace(/\.css$/, ".min.css");
    fs.writeFileSync(minFile, res.styles, "utf8");
    cssBytes += src.length - res.styles.length;
  }

  console.log("HTML rewritten:        " + href);
  console.log("  utteranc -> lazy:    " + utt);
  console.log("  tools-data stripped: " + strip);
  console.log("  tools-data -> slim:  " + slim);
  console.log("  remote fonts -> local: " + fonts);
  console.log("  cdnjs preconnect:     " + preconnect);
  console.log("  JSON-LD compacted:    " + jsonld);
  console.log("  inline JS terser'd:   " + inline);
  console.log("  article CSS async:    " + articleAsync);
  console.log("  asset refs bumped:   " + refs);
  console.log("HTML minified:         " + htmlMin);
  console.log("JS sources ref-bumped: " + jsSrc);
  console.log("JS minified:           " + js.length + " files, saved " + (jsBytes / 1024).toFixed(0) + " KB");
  console.log("CSS minified:          " + css.length + " files, saved " + (cssBytes / 1024).toFixed(0) + " KB");
}

run().catch((e) => { console.error(e); process.exit(1); });