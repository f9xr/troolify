/* ============================================================================
   Troolify - tools-data slim generator
   ----------------------------------------------------------------------------
   Reads assets/js/tools-data.js (window.TOOLS + window.CATEGORIES) and emits
   assets/js/tools-data-slim.js:
     - window.TOOLS_SLIM : one object per tool with only the render fields
       (name, desc, icon, tag, category, href) plus the truthy
       popular / recent / featured flags used by the homepage filters.
     - window.CATEGORIES : copied verbatim (shared by all consumers).
   The full tools-data.js stays the source of truth for keyword search and the
   per-tool workflow links; it is lazy-loaded on demand by layout.js / tool-page.js.

   Run:  node troolify-gen/gen-slim.js   (also called by minify.js)
   ============================================================================ */

module.exports = { generate: generateSlim };

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets", "js", "tools-data.js");
const OUT = path.join(ROOT, "assets", "js", "tools-data-slim.js");

const KEEP_FLAGS = ["popular", "recent", "featured"];

function jsonArg(value) {
  return JSON.stringify(value);
}

function generateSlim() {
  const raw = fs.readFileSync(SRC, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(raw, sandbox, { filename: "tools-data.js" });

  const tools = sandbox.window.TOOLS;
  const categories = sandbox.window.CATEGORIES;
  if (!Array.isArray(tools) || !Array.isArray(categories)) {
    throw new Error("tools-data.js did not define window.TOOLS / window.CATEGORIES");
  }

  const slim = tools.map(function (t) {
    const out = {
      name: t.name,
      desc: t.desc,
      icon: t.icon,
      tag: t.tag,
      category: t.category,
      href: t.href,
    };
    KEEP_FLAGS.forEach(function (f) {
      if (t[f]) out[f] = true;
    });
    return out;
  });

  const parts = [];
  parts.push("/* Auto-generated from tools-data.js by troolify-gen/gen-slim.js - do not edit directly. */");
  parts.push("window.TOOLS_SLIM = [");
  slim.forEach(function (t) { parts.push("  " + jsonArg(t) + ","); });
  parts.push("];");
  parts.push("");
  parts.push("window.CATEGORIES = [");
  categories.forEach(function (c) { parts.push("  " + jsonArg(c) + ","); });
  parts.push("];");

  fs.writeFileSync(OUT, parts.join("\n") + "\n", "utf8");
  console.log("tools-data-slim.js written: " + tools.length + " tools, " +
    categories.length + " categories, " + fs.statSync(OUT).size + " bytes");
  return OUT;
}

if (require.main === module) generateSlim();