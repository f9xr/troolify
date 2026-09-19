/* Builds the 13 API-powered tool pages and updates assets/js/tools-data.js.
   Run: node troolify-gen/api-builder/build.js
   Idempotent: registry lines are URL-guarded and pages are overwritten.      */
const fs = require("fs");
const path = require("path");
const { build, esc } = require("./lib");
const funCfg = require("./configs-fun");
const otherCfg = require("./configs-other");

const DATA = path.join(__dirname, "../../assets/js/tools-data.js");
const MARK = "/* API-POWERED TOOLS - added 2026-09-19 */";

const all = funCfg.concat(otherCfg);

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

  const missing = [];
  let built = 0;
  all.forEach(function (c) {
    try {
      build(c);
      built++;
    } catch (e) {
      missing.push(c.slug + " -> " + e.message);
    }
  });
  if (missing.length) { console.error("PAGE BUILD FAILURES:\n" + missing.join("\n")); process.exit(1); }
  console.log("Built " + built + " pages.");

  const lines = all.map(registryLine);
  const existing = all.filter(function (c) {
    return raw.indexOf("tools/" + c.folder + "/" + c.slug + ".html") >= 0;
  }).map(function (c) { return c.slug; });

  if (existing.length) {
    console.log("Registry already contains " + existing.length + " of " + all.length + " tools (skipping splice): " + existing.join(", "));
    process.exit(0);
  }

  const block = newline + "  " + MARK + newline + lines.join(newline) + newline;
  const anchor = "];" + newline + newline + "window.CATEGORIES";
  const i = raw.indexOf(anchor);
  if (i < 0) { console.error("Could not find TOOLS close anchor."); process.exit(1); }
  const out = raw.slice(0, i) + block + raw.slice(i);
  fs.writeFileSync(DATA, out, "utf8");
  console.log("Spliced " + all.length + " registry lines into tools-data.js.");
}

main();