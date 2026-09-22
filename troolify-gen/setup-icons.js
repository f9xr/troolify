"use strict";

/* Generates a minimal self-hosted Font Awesome build for Troolify.
   Run:  node troolify-gen/setup-icons.js
   - Scans every .html/.js/.css in the repo for icon usage (class= attributes,
     icon:"..." fields, and bare fa- tokens in JS string templates).
   - Maps each glyph to its codepoint + family from the FA 6.5 CSS.
   - Emits assets/fonts/fa-solid.min.woff2 + fa-brands.min.woff2 (subset via
     fonttools) and assets/css/icons.min.css (only the used rules).
   Requires python3 + fonttools (pip install fonttools brotli).
*/
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const ASSETS = (p) => path.join(ROOT, "assets", p);
const TMP = process.env.TEMP || "/tmp";
const FA_CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
const FA_WOFF = {
  solid: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2",
  brands: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2",
};

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (/\.(html|js|css)$/.test(ent.name)) acc.push(full);
  }
  return acc;
}

const MODIFIERS = new Set([
  "solid", "brands", "regular", "fw", "lg", "xl", "xs", "sm",
  "2x", "3x", "4x", "5x", "spin", "pulse", "fade", "beat",
  "bounce", "flip", "shake", "inverse", "li", "ul", "border",
  "stack", "stack-1x", "stack-2x", "pull-left", "pull-right",
  "rotate-90", "rotate-180", "rotate-270", "flip-horizontal",
  "flip-vertical", "flip-both", "fa", "nav", "bar", "times",
]);

function classifyIcon(token, fam) {
  const name = token.split(/\s+/).find((t) => /^fa-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t) && !MODIFIERS.has(t.slice(3)));
  return name ? [name, fam] : null;
}

function collectGlyphs(files) {
  const glyphs = new Map(); // name -> Set(family)
  // a) class="..." attributes (HTML + JS templates that build class strings)
  const reClass = /class=["'`]([^"'`]*)["'`]/g;
  // b) icon:"fa-solid fa-home" style fields (tools-data.js, dashboards, etc.)
  const reIcon = /(?:icon|ico)\s*[:=]\s*["'`]([^"'`]*)["'`]/g;
  // c) direct class tokens in JS template like `fa-solid fa-x-twitter`
  const reBare = /["'`]([-a-z0-9]+\s+)?fa-(?:solid|brands|regular)\s+fa-[a-z0-9-]+["'`]/g;
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8");
    let m;
    while ((m = reClass.exec(text))) {
      const fam = m[1].includes("fa-brands") ? "fa-brands"
        : m[1].includes("fa-regular") ? "fa-regular"
        : m[1].includes("fa-solid") ? "fa-solid" : "";
      for (const t of m[1].split(/\s+/)) {
        const hit = classifyIcon(t, fam);
        if (hit) {
          if (!glyphs.has(hit[0])) glyphs.set(hit[0], new Set());
          glyphs.get(hit[0]).add(fam || "fa-solid");
        }
      }
    }
    while ((m = reIcon.exec(text))) {
      const fam = m[1].includes("fa-brands") ? "fa-brands"
        : m[1].includes("fa-regular") ? "fa-regular"
        : m[1].includes("fa-solid") ? "fa-solid" : "fa-solid";
      for (const t of m[1].split(/\s+/)) {
        const hit = classifyIcon(t, fam);
        if (hit) {
          if (!glyphs.has(hit[0])) glyphs.set(hit[0], new Set());
          glyphs.get(hit[0]).add(fam);
        }
      }
    }
    while ((m = reBare.exec(text))) {
      const fam = m[1] && m[1].trim() === "fa-brands" ? "fa-brands"
        : m[1] && m[1].trim() === "fa-regular" ? "fa-regular" : "fa-solid";
      const hit = classifyIcon(m[0], fam);
      if (hit) {
        if (!glyphs.has(hit[0])) glyphs.set(hit[0], new Set());
        glyphs.get(hit[0]).add(fam);
      }
    }
  }
  return glyphs;
}

async function main() {
  const files = walk(ROOT);
  const glyphs = collectGlyphs(files);

  // fetch FA css to resolve codepoints + families
  const css = await fetch(FA_CSS_URL).then((r) => r.text());
  fs.writeFileSync(path.join(TMP, "fa-all.min.css"), css, "utf8");

  // parse per-name content: block like
  //   .fa-arrow-up:before,.fa-up-long:before{content:"\f176"}
  //   .fa-bars:before{content:"\f0c9"}
  //   .fa-plus:before{content:"\2b"}
  // Selectors may be comma-combined and escapes vary in length.
  const cpMap = new Map();
  const blockRe = /\.([^{]+)\{[^{]*content\s*:\s*"\\([0-9a-f]+)"/g;
  let blk;
  while ((blk = blockRe.exec(css))) {
    const cps = parseInt(blk[2], 16);
    for (const sel of blk[1].split(",")) {
      const m = sel.trim().match(/(\.?fa-([a-z0-9-]+):before)/);
      if (m) cpMap.set(m[2], cps);
    }
  }

  // classify families
  const solidCps = new Set();
  const brandsCps = new Set();
  const missing = [];
  const names = [...glyphs.keys()].sort();
  for (const name of names) {
    const fams = [...glyphs.get(name)];
    const cps = cpMap.get(name.replace(/^fa-/, ""));
    if (cps === undefined) { missing.push(name); continue; }
    // if icon ever used as fa-solid -> solid; if ever as fa-brands -> brands
    if (fams.includes("fa-solid") || fams.length === 0) solidCps.add(cps);
    if (fams.includes("fa-brands")) brandsCps.add(cps);
    // fa-regular: fall back to solid (regular glyph not in these downloads)
    if (fams.includes("fa-regular")) solidCps.add(cps);
  }
  if (missing.length) {
    console.error("WARN missing codepoints:", missing.join(", "));
  }

  // download woff2 (cache in temp)
  const dl = async (url) => {
    const buf = await (await fetch(url)).arrayBuffer();
    return Buffer.from(buf);
  };
  const subsets = {};
  for (const key of ["solid", "brands"]) {
    const cps = key === "solid" ? solidCps : brandsCps;
    if (!cps.size) continue;
    const src = path.join(TMP, `fa-${key}-900.woff2`);
    if (!fs.existsSync(src)) fs.writeFileSync(src, await dl(FA_WOFF[key]));
    const unis = [...cps].sort((a, b) => a - b).map((c) => "U+" + c.toString(16).toUpperCase()).join(",");
    const out = ASSETS(`fonts/fa-${key}.min.woff2`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFileSync("python", [
      "-m", "fontTools.subset",
      src, "--unicodes=" + unis,
      "--output-file=" + out,
      "--font-number=1",
      "--layout-features=*",
      "--glyph-names",
      "--symbol-cmap",
      "--legacy-cmap",
      "--notdef-glyph",
      "--no-hinting",
      "--desubroutinize",
      "--name-IDs=*",
    ]);
    subsets[key] = out;
    console.log(`subset ${key}: ${cps.size} glyphs -> ${out}`);
  }

  // build minimal CSS: @font-face + only used rules
  const hx = (cps) => cps.toString(16);
  const decl = (name, cps) => `.fa-${name.replace(/^fa-/, "")}:before{content:"\\${hx(cps)}"}`;
  const famCSS = (data, family, file) => {
    const rules = data.map(([name, cp]) => decl(name, cp)).join("\n");
    const cps = data.map(([, cp]) => "U+" + hx(cp).toUpperCase()).join(",");
    return `@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:block;src:url(../fonts/fa-solid.min.woff2) format("woff2");unicode-range:${cps}}\n${rules}\n`;
  };
  const solidData = [], brandsData = [];
  for (const name of names) {
    const cps = cpMap.get(name.replace(/^fa-/, ""));
    if (cps === undefined) continue;
    const fams = [...glyphs.get(name)];
    if (fams.includes("fa-brands")) brandsData.push([name, cps]);
    else solidData.push([name, cps]);
  }
  let cssOut = "/* Auto-generated by troolify-gen/setup-icons.js - do not edit */\n";
  cssOut += "@font-face{font-family:\"Font Awesome 6 Free\";font-style:normal;font-weight:900;font-display:block;src:url(../fonts/fa-solid.min.woff2) format(\"woff2\")}\n";
  cssOut += "@font-face{font-family:\"Font Awesome 6 Brands\";font-style:normal;font-weight:400;font-display:block;src:url(../fonts/fa-brands.min.woff2) format(\"woff2\")}\n";
  cssOut += ".fa,.fa-solid{font-family:\"Font Awesome 6 Free\";font-weight:900}\n";
  cssOut += ".fa-brands{font-family:\"Font Awesome 6 Brands\";font-weight:400}\n";
  cssOut += solidData.map(([n, c]) => decl(n, c)).join("\n") + "\n";
  cssOut += brandsData.map(([n, c]) => decl(n, c)).join("\n") + "\n";
  fs.writeFileSync(ASSETS("css/icons.min.css"), cssOut, "utf8");
  console.log(`icons.min.css written (${solidData.length} solid + ${brandsData.length} brands rules)`);
}

main().catch((e) => { console.error(e); process.exit(1); });