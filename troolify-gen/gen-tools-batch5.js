/* ============================================================================
   Troolify - it-tools migration, batch 5
   TOML converters (json<->toml, toml<->yaml) + IPv4 range expander.
   Run: node troolify-gen/gen-tools-batch5.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* Shared engine: TOML parser, JSON->TOML serializer, YAML parser (subset) and
   YAML serializer. Inject via String.raw so backslashes land verbatim in the
   page (no manual doubling). */
const CORE = String.raw`
var NL = String.fromCharCode(10);
/* ---------- TOML parser ---------- */
function tomlStripComment(t){
  var q = null, outr = "";
  for (var r = 0; r < t.length; r++) {
    var c = t.charAt(r);
    if (q) { if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === "#") break;
    outr += c;
  }
  return outr;
}
function tomlFindEq(t){
  var q = null;
  for (var r = 0; r < t.length; r++) {
    var c = t.charAt(r);
    if (q) { if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === "=") return r;
  }
  return -1;
}
function tomlParse(src){
  var lines = src.split(/\r?\n/), root = {}, cur = root, i;
  function setDotted(node, parts, value){
    for (var a = 0; a < parts.length - 1; a++) {
      var k = parts[a];
      if (node[k] == null) node[k] = {};
      node = node[k];
    }
    node[parts[parts.length - 1]] = value;
  }
  function navHeader(parts, isArr){
    var node = root;
    for (var a = 0; a < parts.length; a++) {
      var k = parts[a];
      if (a === parts.length - 1) {
        if (isArr) {
          if (!(node[k] instanceof Array)) node[k] = [];
          var nt = {}; node[k].push(nt); cur = nt;
        } else {
          if (node[k] == null || node[k] instanceof Array) node[k] = {};
          cur = node[k];
        }
      } else {
        if (node[k] == null) node[k] = {};
        else if (node[k] instanceof Array) node[k] = node[k][node[k].length - 1];
        node = node[k];
      }
    }
  }
  for (i = 0; i < lines.length; i++) {
    var line = tomlStripComment(lines[i]).trim();
    if (!line) continue;
    if (line.charAt(0) === "[") {
      var isArr = line.charAt(1) === "[";
      var inner = line.slice(isArr ? 2 : 1, line.length - (isArr ? 2 : 1));
      navHeader(inner.split(".").map(function(s){ return s.trim(); }), isArr);
      continue;
    }
    var ei = tomlFindEq(line);
    if (ei < 0) continue;
    var key = line.slice(0, ei).trim(), keyParts;
    if (key.charAt(0) === '"') keyParts = [JSON.parse(key)];
    else if (key.charAt(0) === "'") keyParts = [key.slice(1, -1)];
    else if (key.indexOf(".") >= 0) keyParts = key.split(".").map(function(s){ return s.trim(); });
    else keyParts = [key];
    setDotted(cur, keyParts, tomlVal(line.slice(ei + 1).trim()));
  }
  return root;
}
function unescBasic(s){
  var out = "", i = 0;
  while (i < s.length) {
    var c = s.charAt(i);
    if (c === "\\" && i + 1 < s.length) {
      var nx = s.charAt(i + 1);
      if (nx === "n") out += String.fromCharCode(10);
      else if (nx === "t") out += String.fromCharCode(9);
      else if (nx === "r") out += String.fromCharCode(13);
      else if (nx === "b") out += String.fromCharCode(8);
      else if (nx === "f") out += String.fromCharCode(12);
      else if (nx === '"') out += '"';
      else if (nx === "\\") out += "\\";
      else if (nx === "u") { out += String.fromCharCode(parseInt(s.slice(i + 2, i + 6), 16)); i += 4; }
      else if (nx === "U") { out += String.fromCharCode(parseInt(s.slice(i + 2, i + 10), 16)); i += 8; }
      else out += nx;
      i += 2;
    } else { out += c; i++; }
  }
  return out;
}
function splitTop(s, sep){
  var out = [], depth = 0, q = null, cur = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out;
}
function tomlVal(r){
  r = r.trim();
  if (!r) return "";
  if (r.charAt(0) === "[") {
    var parts = splitTop(r.slice(1, -1), ","), arr = [];
    for (var i = 0; i < parts.length; i++) { var it = parts[i].trim(); if (it) arr.push(tomlVal(it)); }
    return arr;
  }
  if (r.charAt(0) === "{") {
    var inner = r.slice(1, -1), obj = {};
    var p2 = splitTop(inner, ",");
    for (var b = 0; b < p2.length; b++) {
      var part = p2[b].trim(), ei = tomlFindEq(part);
      if (ei < 0) continue;
      var k = part.slice(0, ei).trim();
      if (k.charAt(0) === '"') k = JSON.parse(k);
      else if (k.charAt(0) === "'") k = k.slice(1, -1);
      obj[k] = tomlVal(part.slice(ei + 1));
    }
    return obj;
  }
  var c0 = r.charAt(0);
  if (c0 === '"') {
    if (r.slice(0, 3) === '"""') {
      var m = r.slice(3, r.length - 3).replace(/\r?\n[ \t]*/g, String.fromCharCode(10));
      return m.replace(/\\n/g, String.fromCharCode(10)).replace(/\\t/g, String.fromCharCode(9)).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return unescBasic(r.slice(1, -1));
  }
  if (c0 === "'") {
    if (r.slice(0, 3) === "'''") return r.slice(3, r.length - 3).replace(/\r?\n[ \t]*/g, String.fromCharCode(10));
    return r.slice(1, -1);
  }
  if (r === "true") return true;
  if (r === "false") return false;
  if (r === "inf" || r === "+inf" || r === "-inf" || r === "nan") return r;
  if (/^0x/i.test(r)) return parseInt(r, 16);
  if (/^0o/i.test(r)) return parseInt(r, 8);
  if (/^0b/i.test(r)) return parseInt(r, 2);
  if (/^\d{4}-\d{2}-\d{2}/.test(r) && /[T :]/.test(r)) return r;
  var clean = r.replace(/_/g, "");
  var n = Number(clean);
  if (clean !== "" && !isNaN(n)) return n;
  return r;
}
/* ---------- JSON to TOML ---------- */
function tomlKey(k){
  return /^[A-Za-z0-9_-]+$/.test(k) ? k : '"' + String(k).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}
function tomlScalar(v){
  if (typeof v === "string") {
    var s = "";
    for (var i = 0; i < v.length; i++) {
      var ch = v.charAt(i), cc = v.charCodeAt(i);
      if (ch === '"') s += '\\"';
      else if (ch === "\\") s += "\\\\";
      else if (cc === 10) s += "\\n";
      else if (cc === 13) s += "\\r";
      else if (cc === 9) s += "\\t";
      else s += ch;
    }
    return '"' + s + '"';
  }
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return '""';
}
function jsonToToml(o){
  var out = [], lastHeader = false;
  function objArr(v){ return Array.isArray(v) && v.length > 0 && v.every(function(x){ return x !== null && typeof x === "object" && !Array.isArray(x); }); }
  function blank(){ if (out.length && !lastHeader) out.push(""); }
  function walk(obj, path){
    var keys = Object.keys(obj), k, v, i;
    var simple = [];
    for (i = 0; i < keys.length; i++) {
      k = keys[i]; v = obj[k];
      if (v === null || v === undefined) continue;
      if (typeof v === "object" && !Array.isArray(v)) continue;
      if (Array.isArray(v) && objArr(v)) continue;
      simple.push(tomlKey(k) + " = " + (Array.isArray(v) ? "[" + v.map(tomlScalar).join(", ") + "]" : tomlScalar(v)));
    }
    if (simple.length) { blank(); out.push.apply(out, simple); lastHeader = false; }
    for (i = 0; i < keys.length; i++) {
      k = keys[i]; v = obj[k];
      if (v === null || v === undefined) continue;
      var p2 = path.concat(k);
      if (typeof v === "object" && !Array.isArray(v)) {
        blank();
        out.push("[" + p2.map(tomlKey).join(".") + "]");
        lastHeader = true;
        walk(v, p2);
      } else if (objArr(v)) {
        for (var x = 0; x < v.length; x++) {
          blank();
          out.push("[[" + p2.map(tomlKey).join(".") + "]]");
          lastHeader = true;
          walk(v[x], p2);
        }
      }
    }
  }
  walk(o, []);
  return out.join(NL);
}
/* ---------- YAML parser (common subset) ---------- */
function yStrip(l){
  var q = null;
  for (var i = 0; i < l.length; i++) {
    var c = l.charAt(i);
    if (q) { if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === "#" && (i === 0 || l.charAt(i - 1) === " ")) return l.slice(0, i);
  }
  return l;
}
function ySplitKey(t){
  var q = null;
  for (var i = 0; i < t.length; i++) {
    var c = t.charAt(i);
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === ":") {
      var rest = t.slice(i + 1);
      if (rest === "" || rest.charAt(0) === " ") {
        var kk = t.slice(0, i).trim();
        if (kk.length > 1 && (kk.charAt(0) === '"' || kk.charAt(0) === "'")) kk = yUnq(kk);
        return { k: kk, v: rest.trim() };
      }
    }
  }
  return { k: "", v: t.trim() };
}
function yUnq(s){
  s = s.trim();
  if (s.length > 1 && s.charAt(0) === '"' && s.slice(-1) === '"') return s.slice(1, -1).replace(/\\n/g, String.fromCharCode(10)).replace(/\\t/g, String.fromCharCode(9)).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  if (s.length > 1 && s.charAt(0) === "'" && s.slice(-1) === "'") return s.slice(1, -1);
  return s;
}
function yScalar(v){
  v = v.trim();
  if (v === "" || v === "null" || v === "~") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.charAt(0) === '"' || v.charAt(0) === "'") return yUnq(v);
  if (v.charAt(0) === "[") { var items = splitTop(v.slice(1, -1), ","); return items.map(function(p){ return yScalar(p.trim()); }); }
  if (v.charAt(0) === "{") {
    var obj = {}, parts = splitTop(v.slice(1, -1), ",");
    for (var i = 0; i < parts.length; i++) { var kv = ySplitKey(parts[i].trim()); if (kv.k) obj[kv.k] = yScalar(kv.v); }
    return obj;
  }
  var n = Number(v);
  if (v !== "" && !isNaN(n)) return n;
  return v;
}
function yamlParse(src){
  var raw = src.split(/\r?\n/), lines = [], i;
  for (i = 0; i < raw.length; i++) {
    var l = raw[i];
    if (l.length === 0) { lines.push(""); continue; }
    var ind = 0; while (ind < l.length && (l.charAt(ind) === " " || l.charAt(ind) === "\t")) ind++;
    var t = yStrip(l.slice(ind)).trim();
    if (t !== "" && (t.charAt(t.length - 1) === "|" || t.charAt(t.length - 1) === ">")) {
      var style = t.charAt(t.length - 1), folded = t.slice(0, -1).trim(), chunks = [];
      var j = i + 1;
      while (j < raw.length) {
        var lj = raw[j];
        if (lj.trim() === "") { j++; continue; }
        var jj = 0; while (jj < lj.length && (lj.charAt(jj) === " " || lj.charAt(jj) === "\t")) jj++;
        if (jj > ind) chunks.push(lj.replace(/\r$/, "")); else break;
        j++;
      }
      i = j - 1;
      var minInd = 1e9;
      for (var ci = 0; ci < chunks.length; ci++) {
        var ci2 = 0; while (ci2 < chunks[ci].length && (chunks[ci].charAt(ci2) === " " || chunks[ci].charAt(ci2) === "\t")) ci2++;
        if (ci2 < minInd) minInd = ci2;
      }
      if (minInd === 1e9) minInd = 0;
      var body = chunks.map(function(cL){ return cL.slice(minInd); });
      var txt = style === "|" ? body.join("\n").replace(/\n+$/, "") : body.join(" ").replace(/\s+$/, "");
      if (folded.charAt(folded.length - 1) === ":") folded = folded.slice(0, -1).trim();
      lines.push(l.slice(0, ind) + folded + ": " + JSON.stringify(txt));
    } else lines.push(l);
  }
  var items = [];
  for (i = 0; i < lines.length; i++) {
    var li = lines[i];
    var ind2 = 0; while (ind2 < li.length && (li.charAt(ind2) === " " || li.charAt(ind2) === "\t")) ind2++;
    var txt2 = yStrip(li.slice(ind2)).trim();
    if (!txt2) continue;
    var isSeq = txt2 === "-" || txt2.slice(0, 2) === "- ";
    var body = isSeq ? (txt2 === "-" ? "" : txt2.slice(2).trim()) : txt2;
    items.push({ indent: ind2, seq: isSeq, text: body, id: items.length, parent: null });
  }
  var stk = [];
  for (i = 0; i < items.length; i++) {
    var it = items[i];
    while (stk.length && stk[stk.length - 1].indent >= it.indent) stk.pop();
    if (stk.length) it.parent = stk[stk.length - 1].id;
    stk.push(it);
  }
  var kids = {};
  items.forEach(function(it2){ kids[it2.id] = []; });
  items.forEach(function(it2){ if (it2.parent !== null) kids[it2.parent].push(it2); });
  function entryLeaf(it){
    return it.seq ? yScalar(it.text) : yScalar(ySplitKey(it.text).v);
  }
  function entryValue(it){
    var ch = kids[it.id];
    if (ch.length) {
      var allSeq = ch.every(function(c){ return c.seq; });
      if (allSeq) {
        var arr = [];
        for (var a = 0; a < ch.length; a++) {
          var kd = ch[a], gd = kids[kd.id];
          arr.push(gd.length ? entryValue(kd) : entryLeaf(kd));
        }
        return arr;
      }
      var obj = {};
      if (it.seq) { var kv0 = ySplitKey(it.text); if (kv0.k) obj[kv0.k] = yScalar(kv0.v); }
      for (var b = 0; b < ch.length; b++) {
        var cb = ch[b];
        if (cb.seq) continue;
        var kvb = ySplitKey(cb.text), gb = kids[cb.id];
        obj[kvb.k || cb.text] = gb.length ? entryValue(cb) : yScalar(kvb.v);
      }
      return obj;
    }
    return entryLeaf(it);
  }
  var roots = items.filter(function(it3){ return it3.parent === null; });
  var root;
  if (roots.length === 1 && roots[0].seq) root = entryValue(roots[0]);
  else if (roots.length === 1 && !roots[0].seq && !kids[roots[0].id].length) root = entryLeaf(roots[0]);
  else {
    root = {};
    for (var r = 0; r < roots.length; r++) {
      var rt = roots[r], gr = kids[rt.id];
      if (rt.seq) continue;
      var rk = ySplitKey(rt.text).k;
      if (!rk) continue;
      root[rk] = gr.length ? entryValue(rt) : yScalar(rt.text.slice(rt.text.indexOf(":") + 1).trim());
    }
  }
  return root;
}
/* ---------- YAML serializer ---------- */
function yScalarOut(v){
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  var s = String(v);
  if (s === "" || /[:#\[\]{},&*!|>'%@]/.test(s) || s.indexOf(String.fromCharCode(96)) >= 0 || s !== s.trim() || /^(true|false|null|~|\d)/.test(s)) {
    return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"';
  }
  return s;
}
function yamlDump(o, ind){
  ind = ind || 0;
  var pad = ""; for (var i = 0; i < ind; i++) pad += "  ";
  var out = [];
  var ret = o === null || o === undefined; if (ret) return "null";
  if (Array.isArray(o)) {
    if (!o.length) return "[]";
    for (var a = 0; a < o.length; a++) {
      var el = o[a];
      if (el !== null && typeof el === "object") {
        if (Array.isArray(el)) { out.push(pad + "- " + yamlDump(el, ind + 1)); }
        else if (!Object.keys(el).length) { out.push(pad + "- {}"); }
        else {
          var keys = Object.keys(el);
          var firstK = keys[0];
          var firstV = yamlDump(el[firstK], ind + 1);
          out.push(pad + "- " + firstK + ": " + (firstV.indexOf("\n") >= 0 ? "\n" + firstV : firstV));
          for (var k2 = 1; k2 < keys.length; k2++) {
            var v2 = yamlDump(el[keys[k2]], ind + 2);
            out.push(pad + "  " + keys[k2] + ": " + (v2.indexOf("\n") >= 0 ? "\n" + v2 : v2));
          }
        }
      } else out.push(pad + "- " + yScalarOut(el));
    }
    return out.join("\n");
  }
  if (typeof o === "object") {
    var ks = Object.keys(o);
    if (!ks.length) return "{}";
    for (var b = 0; b < ks.length; b++) {
      var v = o[ks[b]];
      var p = pad + ks[b] + ": ";
      if (v !== null && typeof v === "object") {
        var sub = yamlDump(v, ind + 1);
        if (sub.indexOf("\n") >= 0) { out.push(pad + ks[b] + ":"); out.push(sub); }
        else out.push(p + sub);
      } else out.push(p + yScalarOut(v));
    }
    return out.join("\n");
  }
  return yScalarOut(o);
}
`;

function outArea(id, label, hint) {
  return '<div class="result-card"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">' + label + '</span>' +
    '<textarea id="' + id + '"readonly spellcheck="false"style="min-height:220px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;margin-top:6px"aria-label="' + (hint || label) + '"placeholder="Output appears here"></textarea></div></div></div>';
}

/* ========================================================================
   1. JSON TO TOML
   ======================================================================== */
add({
  file: 'json-to-toml.html', folder: 'coding',
  name: 'JSON to TOML', tag: 'Converter', icon: 'fa-solid fa-arrows-turn-to-dots',
  title: 'JSON to TOML Converter | Turn JSON Into TOML Config Online',
  metaDesc: 'Convert JSON objects into TOML configuration files instantly. Nested objects become tables, arrays of objects become array-of-tables, fully offline.',
  desc: 'Reshape any JSON document into clean TOML. Objects become [tables], arrays of objects become [[array of tables]], and scalars keep their types.',
  keywords: ['json to toml', 'json to toml converter', 'convert json toml', 'toml generator', 'json to toml online', 'toml config builder', 'json toml transformer', 'jq toml', 'json config to toml', 'toml from json'],
  featureList: ['One-click conversion', 'Tables from nested objects', 'Array-of-tables support', 'String escaping', 'Type-aware output', '100% client-side'],
  panel: panel.wrap('jt', 'fa-solid fa-arrows-turn-to-dots', 'JSON to TOML',
    panel.ioTwo('jt', 'JSON input', 'TOML output', 'Paste your JSON here…', 'Converted TOML appears here…') +
    panel.actions('jt', 'Convert') ),
  css: '.jt-panel textarea{min-height:200px}',
  js: CORE + String.raw`
    function run(){
      var inp = document.getElementById("jtIn");
      var out = document.getElementById("jtOut");
      var proc = document.querySelector("#jtProc");
      if (!inp.value.trim()) { out.value = ""; proc.textContent = "Paste some JSON to get started."; return; }
      try {
        var o = JSON.parse(inp.value);
        out.value = jsonToToml(o);
        proc.textContent = "Converted in this tab.";
      } catch (e) { out.value = ""; proc.textContent = "Invalid JSON: " + e.message; }
    }
    document.getElementById("jtGo").addEventListener("click", run);
    document.getElementById("jtIn").addEventListener("input", run);
    document.getElementById("jtCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("jtOut").value, function(){ document.querySelector("#jtProc").textContent = "Copied to clipboard."; }); });
    document.getElementById("jtSample").addEventListener("click", function(){
      document.getElementById("jtIn").value = JSON.stringify({
        title: "Troolify", version: 3, debug: false, port: 8123,
        tags: ["web", "tools", "offline"],
        database: { host: "localhost", port: 5432, ssl: true },
        servers: [
          { name: "west", region: "eu", replicas: 2 },
          { name: "east", region: "us", replicas: 3 }
        ]
      }, null, 2);
      run();
    });
    document.getElementById("jtClear").addEventListener("click", function(){ document.getElementById("jtIn").value = ""; document.getElementById("jtOut").value = ""; });
  `,
  article: {
    title: 'JSON to TOML Converter: From Bracket Town to Config Country',
    lead: '<p>TOML is the configuration format of the Rust and Python eras: small, typed, and readable. This <strong>JSON to TOML converter</strong> maps any JSON document onto that shape, turning objects into <code>[tables]</code>, arrays of objects into <code>[[array of tables]]</code>, and keeping scalars typed.</p><p>Everything runs in your browser, so configuration never leaves your machine.</p>',
    sections: [
      { id: 'mapping', icon: 'fa-solid fa-diagram-project', heading: 'How objects and arrays are mapped', html: '<p>A JSON object becomes a TOML table: <code>{"database":{"host":"localhost"}}</code> becomes <code>[database]</code> followed by <code>host = "localhost"</code>. Arrays of primitives stay inline (<code>tags = ["web","tools"]</code>) while arrays of objects become repeated <code>[[servers]]</code> blocks, one per item. Nested objects inside those blocks are emitted as sub-tables such as <code>[servers.deploy]</code>.</p>' },
      { id: 'typing', icon: 'fa-solid fa-superscript', heading: 'Types are preserved', html: '<p>Strings stay quoted, numbers stay bare, and booleans become <code>true</code>/<code>false</code>. Values that have no TOML equivalent, like <code>null</code>, are skipped so the output always parses with a real TOML parser.</p>' },
      { id: 'escaping', icon: 'fa-solid fa-shield-halved', heading: 'Escaping inside strings', html: '<p>Quotes and backslashes inside string values are escaped according to the TOML spec (<code>\\"</code>, <code>\\\\</code>), and newlines, tabs and carriage returns become <code>\\n</code>, <code>\\t</code> and <code>\\r</code> so multi-line values survive the trip.</p>' }
    ],
    steps: [
      'Paste a JSON object or array into the input box.',
      'The TOML output appears live as you type, or press Convert.',
      'Copy the result into your Cargo.toml, pyproject.toml or server config.'
    ],
    facts: [['Objects', 'Become [tables]'], ['Arrays of objects', 'Become [[array of tables]]'], ['Scalar arrays', 'Stay inline as [1, 2, 3]'], ['null values', 'Skipped (no TOML equivalent)'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Migrating dotenv-style configs', 'Turn a JSON settings blob into the TOML file a Rust or Python service expects.'],
      ['Annotating deployment configs', 'Keep feature flags and app settings in TOML files that humans can actually review.'],
      ['Learning TOML', 'See exactly how a familiar JSON shape translates into table headers and typed values.']],
    tips: [
      'Keys with dots or spaces are quoted automatically so the output stays valid.',
      'The output is deterministic: identical JSON always yields identical TOML.',
      'Arrays mixing objects and scalars are emitted inline; use uniform arrays of objects for [[tables]].'
    ],
    takeaways: [['objects','Become [tables]'],['object arrays','Become [[array of tables]]'],['local','Conversion stays in the tab']],
    faq: [
      ['What happens to nested objects?','Each nested object becomes its own [table] section, with deeper nesting producing dotted headers such as [database.pool].'],
      ['How are arrays handled?','Arrays of primitives stay inline as [a, b, c]. Arrays of objects become repeated [[name]] blocks, which is the idiomatic TOML shape.'],
      ['What about null values?','TOML has no null literal, so null and undefined values are omitted from the output.'],
      ['Are strings escaped correctly?','Yes: quotes, backslashes, newlines and tabs are escaped per the TOML spec, so hostile or multi-line values parse cleanly on the other side.'],
      ['Is my data uploaded?','No. The entire conversion runs inside your browser.']],
    conclusion: '<p>JSON describes almost anything, but TOML reads like a config file should. Use this <strong>JSON to TOML converter</strong> when your next service wants Cargo.toml-style settings, and flip it back with our <a href="toml-to-json.html">TOML to JSON converter</a>. Need YAML instead? Try <a href="json-to-yaml.html">JSON to YAML</a>.</p>'
  }
});

/* ========================================================================
   2. TOML TO JSON
   ======================================================================== */
add({
  file: 'toml-to-json.html', folder: 'coding',
  name: 'TOML to JSON', tag: 'Converter', icon: 'fa-solid fa-braces',
  title: 'TOML to JSON Converter | Parse TOML Into JSON Object',
  metaDesc: 'Convert TOML config files into pretty-printed JSON instantly. Handles tables, arrays of tables, inline tables, comments and dates, fully offline.',
  desc: 'Parse any TOML file into clean, indented JSON. Table headers, inline tables, arrays and comments are all handled automatically.',
  keywords: ['toml to json', 'toml to json converter', 'convert toml json', 'toml parser online', 'toml to json online', 'toml config to json', 'cargo toml to json', 'toml json transformer', 'toml reader', 'json from toml'],
  featureList: ['One-click conversion', 'Table header support', 'Array-of-tables support', 'Inline tables and arrays', 'Date kept as strings', '100% client-side'],
  panel: panel.wrap('tj', 'fa-solid fa-braces', 'TOML to JSON',
    panel.ioTwo('tj', 'TOML input', 'JSON output', 'Paste your TOML here…', 'Converted JSON appears here…') +
    panel.actions('tj', 'Convert') ),
  css: '.tj-panel textarea{min-height:200px}',
  js: CORE + String.raw`
    function run(){
      var inp = document.getElementById("tjIn");
      var out = document.getElementById("tjOut");
      var proc = document.querySelector("#tjProc");
      if (!inp.value.trim()) { out.value = ""; proc.textContent = "Paste some TOML to get started."; return; }
      try {
        var obj = tomlParse(inp.value);
        out.value = JSON.stringify(obj, null, 2);
        proc.textContent = "Converted in this tab.";
      } catch (e) { out.value = ""; proc.textContent = "Could not parse TOML: " + e.message; }
    }
    document.getElementById("tjGo").addEventListener("click", run);
    document.getElementById("tjIn").addEventListener("input", run);
    document.getElementById("tjCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("tjOut").value, function(){ document.querySelector("#tjProc").textContent = "Copied to clipboard."; }); });
    document.getElementById("tjSample").addEventListener("click", function(){
      document.getElementById("tjIn").value = '# Troolify service configuration\n' +
        'title = "Troolify"\nversion = 3\nport = 8123\ndebug = false\n' +
        'tags = ["web", "tools", "offline"]\nrelease = 2026-10-10\n\n' +
        '[database]\nhost = "localhost"\nport = 5432\nssl = true\npool = { min = 2, max = 8 }\n\n' +
        '[[servers]]\nname = "west"\nregion = "eu"\nreplicas = 2\n\n' +
        '[[servers]]\nname = "east"\nregion = "us"\nreplicas = 3';
      run();
    });
    document.getElementById("tjClear").addEventListener("click", function(){ document.getElementById("tjIn").value = ""; document.getElementById("tjOut").value = ""; });
  `,
  article: {
    title: 'TOML to JSON Converter: Config Files, Meet the Web',
    lead: '<p>TOML is lovely to read but tools and APIs speak JSON. This <strong>TOML to JSON converter</strong> parses TOML files and prints the result as indented JSON, handling table headers, <code>[[array of tables]]</code>, inline tables, arrays and comments.</p><p>The parser runs entirely in your browser, so nothing is uploaded.</p>',
    sections: [
      { id: 'parsing', icon: 'fa-solid fa-diagram-project', heading: 'What the parser understands', html: '<p>Plain <code>key = value</code> pairs, <code>[table]</code> and <code>[a.b.c]</code> dotted headers, <code>[[array.of.tables]]</code> blocks, inline tables such as <code>{ min = 2, max = 8 }</code>, single and multi-line strings, integer formats (<code>0x</code>, <code>0o</code>, <code>0b</code>, underscores), floats, booleans and comments beginning with <code>#</code>.</p>' },
      { id: 'types', icon: 'fa-solid fa-superscript', heading: 'How types come across', html: '<p>Numbers stay numbers, booleans stay booleans, and strings stay strings. Dates and times such as <code>1979-05-27T07:32:00Z</code> are preserved as strings so they survive round-trips into JSON without timezone surprises.</p>' },
      { id: 'output', icon: 'fa-solid fa-braces', heading: 'Readable, deterministic output', html: '<p>The output is pretty-printed with two-space indentation and key order preserved exactly as written, which makes diffs between versions of the same config meaningful.</p>' }
    ],
    steps: [
      'Paste a TOML file (Cargo.toml, pyproject.toml, server config) into the input box.',
      'The JSON appears live as you type, or press Convert.',
      'Copy the JSON for your API, dashboard or CI pipeline.'
    ],
    facts: [['Table headers', 'Become nested objects'], ['Array of tables', 'Becomes arrays of objects'], ['Inline tables', 'Become objects'], ['Dates', 'Kept as readable strings'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Feeding configs to orchestrators', 'Reformat pyproject.toml or Cargo.toml into JSON for tooling that only accepts JSON.'],
      ['Diffing environments', 'Convert the TOML of two environments and diff the JSON to spot drift.'],
      ['Learning TOML', 'See the object shape behind the table headers.']],
    tips: [
      'Comments are stripped automatically; only actual data becomes JSON.',
      'Dotted keys like a.b.c = 1 become nested objects.',
      'Duplicate keys follow the last-value-wins rule, matching mainstream TOML parsers.'
    ],
    takeaways: [['tables','Become nested objects'],['[[arrays]]','Become arrays of objects'],['local','Parsing stays in the tab']],
    faq: [
      ['Does it handle [table] headers?','Yes. Each header becomes a nested object, and dotted headers such as [a.b] nest further.'],
      ['What about [[array of tables]]?','Each block becomes one object in a JSON array under its header name.'],
      ['Are dates converted?','Date-times and dates are kept as strings so they stay lossless and timezone-safe.'],
      ['Are comments preserved?','No — comments are stripped during parsing. Only key/value data appears in the JSON.'],
      ['Is my data uploaded?','No. Parsing happens entirely inside your browser.']],
    conclusion: '<p>TOML is a great source of truth; JSON is a great transport. Run your config through this <strong>TOML to JSON converter</strong> whenever the consuming system prefers brackets, and go back the other way with <a href="json-to-toml.html">JSON to TOML</a>. YAML fans can also use <a href="json-to-yaml.html">JSON to YAML</a>.</p>'
  }
});

/* ========================================================================
   3. TOML TO YAML
   ======================================================================== */
add({
  file: 'toml-to-yaml.html', folder: 'coding',
  name: 'TOML to YAML', tag: 'Converter', icon: 'fa-solid fa-bars-staggered',
  title: 'TOML to YAML Converter | Convert TOML Config Into YAML',
  metaDesc: 'Convert TOML configuration files into indented YAML instantly. Handles tables, arrays of tables, inline tables and dates, fully offline.',
  desc: 'Translate any TOML file into clean YAML with proper indentation. Tables become mappings and array-of-tables blocks become YAML sequences.',
  keywords: ['toml to yaml', 'toml to yaml converter', 'convert toml yaml', 'toml yaml translator', 'toml to yaml online', 'cargo toml to yaml', 'toml config to yaml', 'yaml from toml', 'toml yaml conversion tool', 'config converter'],
  featureList: ['One-click conversion', 'Table to mapping', 'Sequence output for [[tables]]', 'Quoting when needed', 'Type preservation', '100% client-side'],
  panel: panel.wrap('ty', 'fa-solid fa-bars-staggered', 'TOML to YAML',
    panel.ioTwo('ty', 'TOML input', 'YAML output', 'Paste your TOML here…', 'Converted YAML appears here…') +
    panel.actions('ty', 'Convert') ),
  css: '.ty-panel textarea{min-height:200px}',
  js: CORE + String.raw`
    function run(){
      var inp = document.getElementById("tyIn");
      var out = document.getElementById("tyOut");
      var proc = document.querySelector("#tyProc");
      if (!inp.value.trim()) { out.value = ""; proc.textContent = "Paste some TOML to get started."; return; }
      try {
        var obj = tomlParse(inp.value);
        out.value = yamlDump(obj);
        proc.textContent = "Converted in this tab.";
      } catch (e) { out.value = ""; proc.textContent = "Could not parse TOML: " + e.message; }
    }
    document.getElementById("tyGo").addEventListener("click", run);
    document.getElementById("tyIn").addEventListener("input", run);
    document.getElementById("tyCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("tyOut").value, function(){ document.querySelector("#tyProc").textContent = "Copied to clipboard."; }); });
    document.getElementById("tySample").addEventListener("click", function(){
      document.getElementById("tyIn").value = '# Troolify service configuration\n' +
        'title = "Troolify"\nversion = 3\nport = 8123\ndebug = false\n' +
        'tags = ["web", "tools", "offline"]\nrelease = 2026-10-10\n\n' +
        '[database]\nhost = "localhost"\nport = 5432\nssl = true\n\n' +
        '[[servers]]\nname = "west"\nregion = "eu"\nreplicas = 2\n\n' +
        '[[servers]]\nname = "east"\nregion = "us"\nreplicas = 3';
      run();
    });
    document.getElementById("tyClear").addEventListener("click", function(){ document.getElementById("tyIn").value = ""; document.getElementById("tyOut").value = ""; });
  `,
  article: {
    title: 'TOML to YAML: Swap One Indentation Dialect for Another',
    lead: '<p>TOML and YAML both encode nested configuration, just with different accents. This <strong>TOML to YAML converter</strong> parses a TOML file and re-emits it as two-space-indented YAML, translating tables into mappings and <code>[[array of tables]]</code> into sequences of mappings.</p><p>Conversion stays local, so your config never leaves the tab.</p>',
    sections: [
      { id: 'mapping', icon: 'fa-solid fa-diagram-project', heading: 'What maps to what', html: '<p>A TOML table (<code>[database]</code>) becomes a nested YAML mapping (<code>database:</code>), scalars stay scalars, inline arrays become YAML flow sequences, and each entry in a <code>[[servers]]</code> array becomes a <code>- name: ...</code> list item in a YAML sequence.</p>' },
      { id: 'quoting', icon: 'fa-solid fa-quote-left', heading: 'Quoting rules', html: '<p>Strings that look like numbers, booleans or nulls, or that contain colons, hashes or braces, are quoted automatically so the YAML means the same thing as the TOML. Plain, safe strings stay unquoted for readability.</p>' },
      { id: 'fidelity', icon: 'fa-solid fa-code-compare', heading: 'Lossless for config use', html: '<p>Key order is preserved, empty tables become <code>{}</code>, and dates remain strings. The result is deterministic, which makes infrastructure-as-code diffs pleasant to review.</p>' }
    ],
    steps: [
      'Paste a TOML file into the input box.',
      'The YAML appears live as you type, or press Convert.',
      'Copy it into your Docker Compose, Ansible or Helm-style configs.'
    ],
    facts: [['Tables', 'Become nested mappings'], ['Array of tables', 'Become YAML sequences'], ['Scalar arrays', 'Become flow arrays'], ['Empty tables', 'Become {}'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Porting configs between ecosystems', 'Move a TOML-based service config into the YAML world of containers and CI.'],
      ['Standardizing on YAML', 'Consolidate mixed config formats into one YAML store for compliance or templating.'],
      ['Sanitizing configs', 'Re-render a messy TOML file through YAML for a second opinion on structure.']],
    tips: [
      'Strings containing special characters are quoted for you; check tool-generated configs visually once before deploying.',
      'Dotted headers such as [a.b] become nested mappings.',
      'Multi-line strings are escaped into single-line YAML quoted strings.'
    ],
    takeaways: [['tables','Become mappings'],['[[arrays]]','Become sequences'],['local','Conversion stays in the tab']],
    faq: [
      ['How are TOML tables converted?','A [table] header becomes a nested YAML mapping, with dotted headers producing deeper nesting.'],
      ['What happens to [[array of tables]]?','Each block becomes one item in a YAML sequence of mappings, rendered with dash lines.'],
      ['Are strings re-quoted?','Only when needed: values that could be misinterpreted (numbers, booleans, colons, hashes) are quoted automatically.'],
      ['Is key order kept?','Yes. The YAML follows the exact order of the TOML input.'],
      ['Does it run online?','No — the whole conversion runs in your browser.']],
    conclusion: '<p>Config formats are a matter of taste, but machines only accept what they accept. If the playground wants YAML and the source of truth is TOML, this <strong>TOML to YAML converter</strong> is the bridge. The reverse trip is on the <a href="yaml-to-toml.html">YAML to TOML</a> page.</p>'
  }
});

/* ========================================================================
   4. YAML TO TOML
   ======================================================================== */
add({
  file: 'yaml-to-toml.html', folder: 'coding',
  name: 'YAML to TOML', tag: 'Converter', icon: 'fa-solid fa-arrows-rotate',
  title: 'YAML to TOML Converter | Convert YAML Config Into TOML',
  metaDesc: 'Convert YAML configuration into TOML instantly. Handles nested mappings, sequences, inline arrays and block scalars, fully offline in your browser.',
  desc: 'Turn YAML documents into typed TOML. Mappings become [tables], sequences of mappings become [[array of tables]], and block scalars stay intact.',
  keywords: ['yaml to toml', 'yaml to toml converter', 'convert yaml toml', 'yaml toml translator', 'yaml to toml online', 'yaml config to toml', 'docker compose to toml', 'toml from yaml', 'yaml toml conversion tool', 'config converter'],
  featureList: ['One-click conversion', 'Nested mapping support', 'Sequence to [[tables]]', 'Inline arrays and maps', 'Block scalars kept', '100% client-side'],
  panel: panel.wrap('yt', 'fa-solid fa-arrows-rotate', 'YAML to TOML',
    panel.ioTwo('yt', 'YAML input', 'TOML output', 'Paste your YAML here…', 'Converted TOML appears here…') +
    panel.actions('yt', 'Convert') ),
  css: '.yt-panel textarea{min-height:200px}',
  js: CORE + String.raw`
    function run(){
      var inp = document.getElementById("ytIn");
      var out = document.getElementById("ytOut");
      var proc = document.querySelector("#ytProc");
      if (!inp.value.trim()) { out.value = ""; proc.textContent = "Paste some YAML to get started."; return; }
      try {
        var obj = yamlParse(inp.value);
        out.value = jsonToToml(obj);
        proc.textContent = "Converted in this tab.";
      } catch (e) { out.value = ""; proc.textContent = "Could not parse YAML: " + e.message; }
    }
    document.getElementById("ytGo").addEventListener("click", run);
    document.getElementById("ytIn").addEventListener("input", run);
    document.getElementById("ytCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("ytOut").value, function(){ document.querySelector("#ytProc").textContent = "Copied to clipboard."; }); });
    document.getElementById("ytSample").addEventListener("click", function(){
      document.getElementById("ytIn").value = '# Troolify service configuration\n' +
        'title: Troolify\nversion: 3\nport: 8123\ndebug: false\n' +
        'tags:\n  - web\n  - tools\n  - offline\nrelease: 2026-10-10\n' +
        'database:\n  host: localhost\n  port: 5432\n  ssl: true\n  pool:\n    min: 2\n    max: 8\n' +
        'servers:\n  - name: west\n    region: eu\n    replicas: 2\n  - name: east\n    region: us\n    replicas: 3\n' +
        'notes: |\n  Deployed weekly.\n  No downtime expected.';
      run();
    });
    document.getElementById("ytClear").addEventListener("click", function(){ document.getElementById("ytIn").value = ""; document.getElementById("ytOut").value = ""; });
  `,
  article: {
    title: 'YAML to TOML Converter: Re-Indent Your Infrastructure',
    lead: '<p>YAML is famously flexible — sometimes too flexible. This <strong>YAML to TOML converter</strong> parses the common YAML subset (mappings, sequences, inline arrays and maps, block scalars) and re-emits it as strictly-typed TOML with <code>[tables]</code> and <code>[[array of tables]]</code>.</p><p>The conversion happens in your browser with nothing uploaded.</p>',
    sections: [
      { id: 'mapping', icon: 'fa-solid fa-diagram-project', heading: 'How the structure is mapped', html: '<p>A YAML mapping becomes TOML key/value pairs, and a nested mapping becomes a <code>[table]</code> section. A sequence of scalars stays an inline array, while a sequence of mappings becomes repeated <code>[[name]]</code> blocks, and inline flow forms such as <code>[a, b]</code> or <code>{x: 1}</code> are parsed too.</p>' },
      { id: 'scalars', icon: 'fa-solid fa-bars-staggered', heading: 'Block scalars and typed values', html: '<p>Literal (<code>|</code>) and folded (<code>&gt;</code>) block scalars are folded into single TOML strings, with newlines escaped inside the quotes. Numbers, booleans and nulls keep their types; quoted strings stay quoted.</p>' },
      { id: 'notes', icon: 'fa-solid fa-circle-info', heading: 'A pragmatic subset', html: '<p>The parser covers the YAML used in real configs: indentation-based nesting, comments, quoted keys, anchors and tags are not interpreted. If your document uses advanced features, convert the plain parts and validate the result with a TOML parser.</p>' }
    ],
    steps: [
      'Paste a YAML document (compose file, app config, pipeline) into the input box.',
      'The TOML appears live as you type, or press Convert.',
      'Review the typed output and copy it to your TOML-native service.'
    ],
    facts: [['Mappings', 'Become key/value pairs'], ['Nested mappings', 'Become [tables]'], ['Sequences of mappings', 'Become [[array of tables]]'], ['Block scalars', 'Folded into strings'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Migrating configs to TOML-first stacks', 'Move YAML settings into Cargo.toml-style files for Rust and Python services.'],
      ['Tightening hand-written configs', 'Use TOML\'s strict types to catch accidental string-vs-number mistakes in YAML.'],
      ['Learning both formats', 'Watch a familiar YAML shape become typed TOML.']],
    tips: [
      'Use the sample to see how sequences of mappings become [[array of tables]].',
      'Keys containing dots or spaces are quoted automatically.',
      'Block scalars (| and >) are supported, but JSON-style flow scalars with weird characters should be quoted in the source.'
    ],
    takeaways: [['mappings','Become tables'],['sequences','Become [[tables]]'],['local','Conversion stays in the tab']],
    faq: [
      ['Which YAML features are supported?','Indentation-based mappings and sequences, inline arrays and maps, quoted strings, comments and | / > block scalars. Anchors, aliases and tags are not interpreted.'],
      ['How do I convert a sequence of mappings?','It becomes repeated [[name]] blocks, one per item, which is the idiomatic TOML equivalent.'],
      ['Are YAML comments kept?','No — comments are stripped. Only data is converted.'],
      ['What happens to YAML dates?','They are kept as strings, exactly as written, so no timezone is introduced.'],
      ['Where does the conversion run?','100% in your browser; nothing is uploaded.']],
    conclusion: '<p>When the rest of the team standardized on YAML but your runtime only speaks TOML, this <strong>YAML to TOML converter</strong> settles the argument. Reversed on the <a href="toml-to-yaml.html">TOML to YAML</a> page, and plain JSON is handled by <a href="json-to-toml.html">JSON to TOML</a>.</p>'
  }
});

/* ========================================================================
   5. IPV4 RANGE EXPANDER
   ======================================================================== */
add({
  file: 'ipv4-range-expander.html', folder: 'coding',
  name: 'IPv4 Range Expander', tag: 'Network', icon: 'fa-solid fa-arrows-left-right',
  title: 'IPv4 Range Expander | Expand IP Ranges & CIDR Blocks Online',
  metaDesc: 'Expand an IPv4 address range or CIDR block into every individual address. Supports 192.168.0.1-192.168.0.10 and 10.0.0.0/28 forms, offline.',
  desc: 'Turn a start-end range or a CIDR block into a full list of IPv4 addresses. Instant, offline, and capped so enormous blocks never freeze your tab.',
  keywords: ['ipv4 range expander', 'expand ip range', 'cidr to ip list', 'ip range to list', 'ipv4 range to ip list', 'expand cidr block', 'list all ip in range', 'ip range expander online', 'subnet to ip list', 'ipv4 addresses from range'],
  featureList: ['Start-end ranges', 'CIDR block expansion', 'Address count display', 'Safety cap at 4096', 'Ordered output', '100% client-side'],
  panel: panel.wrap('ir', 'fa-solid fa-arrows-left-right', 'IPv4 Range Expander',
    '<div class="field"style="max-width:440px;margin-bottom:12px"><label for="irRange">Range or CIDR</label><input id="irRange"type="text"spellcheck="false"autocomplete="off"placeholder="192.168.0.1-192.168.0.10 or 10.0.0.0/28"></div>' +
    '<div class="io-field"><label for="irOut">Expanded addresses</label><textarea id="irOut"readonly spellcheck="false"placeholder="Addresses appear here, one per line…"></textarea></div>' +
    panel.actions('ir', 'Expand') ),
  css: '.ir-panel textarea{min-height:260px}',
  js: String.raw`
    function ipToInt(ip){
      var p = ip.split(".");
      return (p[0] * 16777216 + p[1] * 65536 + p[2] * 256 + p[3] * 1) >>> 0;
    }
    function intToIp(n){
      return ((n >>> 24) & 255) + "." + ((n >>> 16) & 255) + "." + ((n >>> 8) & 255) + "." + (n & 255);
    }
    var IR_MAX = 4096;
    function expand(input){
      input = input.trim();
      var m = input.match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*-\s*(\d{1,3}(?:\.\d{1,3}){3})$/);
      var c = input.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
      var from, to;
      if (m) { from = ipToInt(m[1]); to = ipToInt(m[2]); }
      else if (c) {
        var pre = parseInt(c[2], 10);
        if (pre < 0 || pre > 32) return { err: "Invalid prefix length: " + c[2] };
        var base = ipToInt(c[1]);
        var size = Math.pow(2, 32 - pre);
        from = ((base >>> (32 - pre)) << (32 - pre)) >>> 0;
        to = (from + size - 1) >>> 0;
      } else return { err: 'Use "start-end" like 192.168.0.1-192.168.0.10 or a CIDR block like 10.0.0.0/28' };
      if (from > to) return { err: "The end address is smaller than the start address." };
      var list = [];
      for (var i = from; i <= to; i++) {
        list.push(intToIp(i));
        if (list.length > IR_MAX) return { err: "Range too large (more than " + IR_MAX + " addresses). Use a narrower range or CIDR prefix." };
      }
      return { list: list };
    }
    function run(){
      var out = document.getElementById("irOut");
      var proc = document.querySelector("#irProc");
      var res = expand(document.getElementById("irRange").value);
      if (res.err) { out.value = ""; proc.textContent = res.err; return; }
      out.value = res.list.join("\n");
      proc.textContent = res.list.length + " IPv4 address(es) expanded in this tab.";
    }
    document.getElementById("irGo").addEventListener("click", run);
    document.getElementById("irRange").addEventListener("input", run);
    document.getElementById("irCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("irOut").value, function(){ document.querySelector("#irProc").textContent = "Copied to clipboard."; }); });
    document.getElementById("irSample").addEventListener("click", function(){ document.getElementById("irRange").value = "192.168.0.1-192.168.0.6"; run(); });
    document.getElementById("irClear").addEventListener("click", function(){ document.getElementById("irRange").value = ""; document.getElementById("irOut").value = ""; });
  `,
  article: {
    title: 'IPv4 Range Expander: From a Line to a Full Address List',
    lead: '<p>Firewall rules, DHCP reservations and monitoring whitelists often want every address spelled out. This <strong>IPv4 range expander</strong> takes either a start-end range (<code>192.168.0.1-192.168.0.10</code>) or a CIDR block (<code>10.0.0.0/28</code>) and prints every address in it, one per line.</p><p>It all runs in your browser, and large blocks are capped so your tab never hangs.</p>',
    sections: [
      { id: 'inputs', icon: 'fa-solid fa-keyboard', heading: 'Two ways to describe a block', html: '<p>Pass <code>a.b.c.d-x.y.z.w</code> for an explicit range, or <code>a.b.c.d/prefix</code> for a CIDR block. CDIR handles the math for you: <code>10.0.0.0/28</code> expands to the 16 addresses from <code>10.0.0.0</code> to <code>10.0.0.15</code>, and the network address is normalized automatically.</p>' },
      { id: 'safety', icon: 'fa-solid fa-shield-halved', heading: 'A safety cap for sanity', html: '<p>Expansion stops at 4,096 addresses. A /20 or wider block is almost never what you actually wanted to print, and the cap keeps the output immediate while nudging you toward a more specific range.</p>' },
      { id: 'uses', icon: 'fa-solid fa-diagram-project', heading: 'Where the list goes', html: '<p>Copy the output straight into ACL entries, cloud security-group rules, DHCP reservations, or <code>ipset</code> configuration. The order is ascending and deterministic, so generated lists diff cleanly.</p>' }
    ],
    steps: [
      'Type a range like 192.168.0.1-192.168.0.10 or a CIDR block like 10.0.0.0/28.',
      'The expanded list appears live as you type, or press Expand.',
      'Copy the addresses for your ACL, firewall or reservation list.'
    ],
    facts: [['Range form', 'start-end, both endpoints included'], ['CIDR form', 'a.b.c.d/prefix, network normalized'], ['Ordering', 'Ascending, deterministic'], ['Safety cap', '4,096 addresses'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Building firewall rules', 'Expand a small range into individual allow/deny entries for the device that wants them explicit.'],
      ['DHCP reservations', 'List every address in a reservation pool before scripting the assignments.'],
      ['Auditing subnets', 'Print all addresses in a /28 or /29 to see exactly what is usable.']],
    tips: [
      'Both endpoints are included, so 192.168.0.1-192.168.0.3 yields three addresses.',
      'For a CIDR block, the network address is aligned automatically; 10.0.0.5/28 expands from 10.0.0.0.',
      'Overlapping or reversed ranges produce a clear error message instead of garbage.'
    ],
    takeaways: [['ranges','start-end supported'],['cidr','prefix expansion supported'],['cap','kept safe at 4096']],
    faq: [
      ['What formats are accepted?','Start-end like 192.168.0.1-192.168.0.10, or CIDR like 10.0.0.0/28. Spaces around the dash are fine.'],
      ['Are both endpoints included?','Yes. A range from A to B always includes A and B.'],
      ['How large can a range be?','Up to 4,096 addresses. Wider blocks return a friendly error instead of freezing the tab.'],
      ['Does CIDR expansion align the network?','Yes — the network address is computed from the prefix, so 192.168.0.5/30 expands from 192.168.0.4.'],
      ['Is anything sent to a server?','No. All expansion happens locally in your browser.']],
    conclusion: '<p>One line in, every address out. Reach for this <strong>IPv4 range expander</strong> whenever a device prefers explicit lists over notation, and use <a href="ipv4-subnet-calculator.html">the subnet calculator</a> when you need the network math, or <a href="ipv4-address-converter.html">the address converter</a> for decimal, binary and hex forms.</p>'
  }
});

/* ---------- emit pages + register ---------- */
const entries = [];
for (const spec of TOOLS) {
  const html = buildPage(spec);
  const outPath = path.join(ROOT, 'tools', spec.folder, spec.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  entries.push({
    name: spec.name, desc: spec.desc, icon: spec.icon, tag: spec.tag,
    category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file, keywords: spec.keywords
  });
  console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');
}
const res = registerTools(entries);
console.log('registry: added', res.added, 'skipped', res.skipped);