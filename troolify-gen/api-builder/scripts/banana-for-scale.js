var TS = "https://api.tasta.space/v1";
var UNITS = null;
var UBY = {};
var FIRST = {};
function tsGet(p) {
  return new Promise(function (res, rej) {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, 15000);
    fetch(TS + p, { signal: ctl.signal }).then(function (r) {
      clearTimeout(t);
      return r.json().catch(function () { return null; }).then(function (j) {
        if (j && j.error) { var e = new Error(j.error.message || "The API returned an error."); e.api = 1; throw e; }
        if (!r.ok) throw new Error("The Tasta Space API responded with HTTP " + r.status + ".");
        res(j && j.data != null ? j.data : j);
      });
    }).catch(function (e) {
      clearTimeout(t);
      if (e && e.name === "AbortError") { rej(new Error("The request timed out - the Tasta Space API may be busy. Try again in a moment.")); return; }
      if (e && e.api) { rej(e); return; }
      rej(new Error("Could not reach the Tasta Space API. It may be temporarily unavailable - please try again in a moment."));
    });
  });
}
function fillSelects() {
  var dims = [];
  UNITS.forEach(function (u) {
    if (!UBY[u.id]) UBY[u.id] = u;
    if (dims.indexOf(u.dimension) < 0) dims.push(u.dimension);
    if (!FIRST[u.dimension]) FIRST[u.dimension] = u.id;
  });
  var html = dims.map(function (d) {
    var opts = UNITS.filter(function (u) { return u.dimension === d; }).map(function (u) {
      return '<option value="' + esc(u.id) + '">' + esc(u.name + " (" + u.symbol + ")") + (u.kind === "silly" ? " \u00b7 silly" : "") + "</option>";
    }).join("");
    return '<optgroup label="' + esc(d) + '">' + opts + "</optgroup>";
  }).join("");
  $("from").innerHTML = html;
  $("to").innerHTML = html;
  $("from").value = UBY.m ? "m" : UNITS[0].id;
  $("to").value = UBY.banana ? "banana" : FIRST[UBY[$("from").value].dimension];
}
function loadUnits() {
  if (UNITS) return Promise.resolve();
  return tsGet("/scale/units").then(function (d) {
    UNITS = d;
    fillSelects();
  });
}
function unitNote(u) {
  if (!u || (!u.basis && !u.note)) return "";
  var s = '<div class="bn-note"><b>' + esc(u.name) + ":</b> " + esc(u.basis || u.note || "");
  if (u.source) s += ' <a href="' + esc(u.source) + '" target="_blank" rel="noopener">source</a>';
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
        (d.image ? '<div class="media-host"><img class="media-prev" src="' + esc(d.image) + '" alt="Conversion ruler drawing" loading="lazy"></div>' : "");
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
$("from").addEventListener("change", function () {
  if (!UNITS) return;
  var fu = UBY[$("from").value];
  var tu = UBY[$("to").value];
  if (fu && tu && fu.dimension !== tu.dimension) $("to").value = FIRST[fu.dimension];
});
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
window.ap.clear = function () { window.ap.cs = ""; $("val").value = "1"; if (UNITS) { $("from").value = "m"; $("to").value = "banana"; } };
setTimeout(function () { runBtn.click(); }, 100);
