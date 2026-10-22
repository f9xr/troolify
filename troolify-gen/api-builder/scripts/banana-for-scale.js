var UNITS = null;
var UBY = {};
var FIRST = {};
var DEF_FROM = "";
var DEF_TO = "";
function fillSelects() {
  var dims = [];
  UNITS.forEach(function (u) {
    if (!UBY[u.id]) UBY[u.id] = u;
    if (dims.indexOf(u.dimension) < 0) dims.push(u.dimension);
    if (!FIRST[u.dimension]) FIRST[u.dimension] = u.id;
  });
  if (!UNITS.length) return;
  var html = dims.map(function (d) {
    var opts = UNITS.filter(function (u) { return u.dimension === d; }).map(function (u) {
      return '<option value="' + esc(u.id) + '">' + esc(u.name + " (" + u.symbol + ")") + (u.kind === "silly" ? " \u00b7 silly" : "") + "</option>";
    }).join("");
    return '<optgroup label="' + esc(d) + '">' + opts + "</optgroup>";
  }).join("");
  $("from").innerHTML = html;
  $("to").innerHTML = html;
  /* Remember the defaults instead of hard-coding "m"/"banana": the API decides
     which unit ids exist. */
  DEF_FROM = UBY.m ? "m" : UNITS[0].id;
  var fromUnit = UBY[DEF_FROM];
  DEF_TO = UBY.banana ? "banana" : (fromUnit ? (FIRST[fromUnit.dimension] || DEF_FROM) : UNITS[0].id);
  $("from").value = DEF_FROM;
  $("to").value = DEF_TO;
}
function loadUnits() {
  if (UNITS) return Promise.resolve();
  return tsGet("/scale/units").then(function (d) {
    UNITS = Array.isArray(d) ? d : [];
    if (!UNITS.length) throw new Error("The API returned no unit list - please try again in a moment.");
    fillSelects();
  });
}
function unitNote(u) {
  if (!u || (!u.basis && !u.note)) return "";
  var s = '<div class="bn-note"><b>' + esc(u.name) + ":</b> " + esc(u.basis || u.note || "");
  if (u.basis && u.note && u.basis !== u.note) s += " " + esc(u.note);
  var src = safeUrl(u.source);
  if (src) s += ' <a href="' + esc(src) + '" target="_blank" rel="noopener">source</a>';
  return s + "</div>";
}
function convert() {
  var raw = $("val").value;
  var v = parseFloat(raw);
  if (raw === "" || !isFinite(v)) {
    $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Enter a number to convert.</div>';
    proc("Waiting for a value.");
    return Promise.resolve();
  }
  proc("Converting via the Tasta Space API...");
  return tsGet("/scale/convert?value=" + encodeURIComponent(v) + "&from=" + encodeURIComponent($("from").value) + "&to=" + encodeURIComponent($("to").value))
    .then(function (d) {
      window.ap.cs = d.sentence || d.display || "";
      $("results").innerHTML =
        '<div class="bn-hero">' + esc(d.display) + "</div>" +
        '<div class="bn-sent">' + esc(d.sentence || "") + "</div>" +
        '<div class="actions" style="justify-content:center;margin-top:10px"><button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy sentence</button></div>' +
        unitNote(d.from) + unitNote(d.to) +
        (d.image ? '<div class="media-host"><img class="media-prev" src="' + esc(mediaUrl(d.image)) + '" alt="Conversion ruler drawing" loading="lazy"></div>' : "");
      proc("Done - " + (d.display || "converted") + ".");
    });
}
var runBtn = $("runBtn");
runBtn.addEventListener("click", function () {
  if (this.disabled) return;
  var restore = busify(this);
  loadUnits()
    .then(convert)
    .then(function () { restore(); })
    .catch(function (e) {
      $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> ' + esc(e.message) + "</div>";
      proc("Conversion failed.");
      restore();
    });
});
/* The hub refuses a conversion between two different dimensions
   ("dimension_mismatch"), so both selects are kept inside one dimension.
   Without this on the "to" side a visitor could pick kilograms against
   metres and get a raw API error instead of a usable answer. */
function syncDimension() {
  if (!UNITS || !UNITS.length) return;
  var fu = UBY[$("from").value];
  if (!fu) return;
  var tu = UBY[$("to").value];
  if (tu && tu.dimension === fu.dimension) return;
  var pick = FIRST[fu.dimension];
  if (!pick || !UBY[pick] || UBY[pick].dimension !== fu.dimension) return;
  $("to").value = pick;
}
$("from").addEventListener("change", syncDimension);
$("to").addEventListener("change", syncDimension);
$("swapBtn").addEventListener("click", function () {
  var a = $("from").value;
  var b = $("to").value;
  if (!UNITS || !UBY[a] || !UBY[b] || UBY[a].dimension !== UBY[b].dimension) return;
  $("from").value = b;
  $("to").value = a;
  runBtn.click();
});
window.ap.go = function () { runBtn.click(); };
window.ap.copy = function (btn) { copyText(window.ap.cs || "", btn); };
window.ap.clear = function () { window.ap.cs = ""; $("val").value = "1"; if (UNITS && UNITS.length) { $("from").value = DEF_FROM; $("to").value = DEF_TO; } };
setTimeout(function () { runBtn.click(); }, 100);
