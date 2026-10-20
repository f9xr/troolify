/* Builds the 14 API-powered tool pages and updates assets/js/tools-data.js.
   Run: node troolify-gen/api-builder/build.js [slug ...]
   Pass one or more slugs to rebuild only those pages (other pages may carry
   post-builder enhancements - gtag/AdSense/HowTo - that a rebuild would drop).
   Idempotent: registry lines are URL-guarded and pages are overwritten.      */
const fs = require("fs");
const path = require("path");
const { build, esc } = require("./lib");
const funCfg = require("./configs-fun");
const otherCfg = require("./configs-other");

const DATA = path.join(__dirname, "../../assets/js/tools-data.js");
const MARK = "/* API-POWERED TOOLS - added 2026-09-19 */";

const all = funCfg.concat(otherCfg);
const only = process.argv.slice(2);
const targets = only.length ? all.filter((c) => only.indexOf(c.slug) >= 0) : all;

function registryLine(c) {
  const icon = c.icon;
  const tag = c.catFolder;
  const cat = c.catFolder;
  const href = "tools/" + c.folder + "/" + c.slug + ".html";
  const kw = c.keywords.map(function (k) { return '"' + k.replace(/"/g, "'") + '"'; }).join(",");
  return '  { name:"' + c.name.replace(/"/g, "'") + '", desc:"' + c.desc.replace(/"/g, "'") + '", icon:"' + icon + '", tag:"' + tag + '", category:"' + cat + '", href:"' + href + '", keywords:[' + kw + "] },";
}

function main() {
  const raw = fs.readFileSync(DATA, "utf8");
  const newline = raw.indexOf("\r\n") >= 0 ? "\r\n" : "\n";

  const failures = [];
  let built = 0;
  targets.forEach(function (c) {
    try {
      build(c);
      built++;
    } catch (e) {
      failures.push(c.slug + " -> " + e.message);
    }
  });
  if (failures.length) { console.error("PAGE BUILD FAILURES:\n" + failures.join("\n")); process.exit(1); }
  console.log("Built " + built + " pages.");

  const missing = all.filter(function (c) {
    return raw.indexOf("tools/" + c.folder + "/" + c.slug + ".html") < 0;
  }).map(registryLine);

  if (!missing.length) {
    console.log("Registry already contains all " + all.length + " API-powered tools (skipping splice).");
    process.exit(0);
  }

  const firstSplice = raw.indexOf(MARK) < 0;
  const block = newline + (firstSplice ? "  " + MARK + newline : "") + missing.join(newline) + newline;
  const anchor = "];" + newline + newline + "window.CATEGORIES";
  const i = raw.indexOf(anchor);
  if (i < 0) { console.error("Could not find TOOLS close anchor."); process.exit(1); }
  const out = raw.slice(0, i) + block + raw.slice(i);
  fs.writeFileSync(DATA, out, "utf8");
  console.log("Spliced " + missing.length + " registry line(s) into tools-data.js.");
}

main();