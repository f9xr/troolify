var TS = "https://api.tasta.space/v1";
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
function srcCard(f, half) {
  return '<div class="pb-src"><b>' + esc(half) + ":</b> &ldquo;" + esc(f.text) + "&rdquo; &mdash; via <a href=\"" + esc(f.url) + '" target="_blank" rel="noopener">the proverb API</a>' +
    (f.source ? ' and <a href="' + esc(f.source) + '" target="_blank" rel="noopener">the source</a>' : "") + "</div>";
}
function run() {
  var lang = $("lang").value;
  var seed = Math.random().toString(36).slice(2, 10);
  var restore = busify(runBtn);
  proc("Mashing proverbs via the Tasta Space API...");
  tsGet("/proverbs/mashup?lang=" + encodeURIComponent(lang) + "&seed=" + encodeURIComponent(seed))
    .then(function (d) {
      window.ap.cs = d.mashup || "";
      window.ap.pl = d.permalink || "";
      var html = "";
      html += '<div class="quote-body"><i class="fa-solid fa-quote-left"></i>' + esc(d.mashup || "") + "</div>";
      html += '<div class="actions" style="justify-content:center;margin-top:12px">';
      html += '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy mashup</button>';
      html += '<button class="rt-btn" type="button" onclick="ap.copyLink(this)"><i class="fa-solid fa-link"></i>Copy permalink</button>';
      html += "</div>";
      html += '<div class="result-row"><span>Joined on the word</span><b>&ldquo;' + esc(d.join || "") + "&rdquo;</b></div>";
      if (d.from && d.from.length) {
        d.from.forEach(function (f) {
          html += srcCard(f, f.half === "first" ? "First half" : "Second half");
        });
      }
      if (d.card) html += '<div class="media-host" style="margin-top:14px"><img class="media-prev" src="' + esc(d.card) + '" alt="Proverb mashup share card" loading="lazy"></div>';
      $("results").innerHTML = html;
      proc("\u201c" + (d.mashup || "") + "\u201d");
      restore();
    })
    .catch(function (e) {
      $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> ' + esc(e.message) + "</div>";
      proc("Mashup failed.");
      restore();
    });
}
var runBtn = $("runBtn");
runBtn.addEventListener("click", function () {
  if (this.disabled) return;
  run();
});
window.ap.go = function () { runBtn.click(); };
window.ap.copy = function (btn) { copyText(window.ap.cs || "", btn); };
window.ap.copyLink = function (btn) { copyText(window.ap.pl || "", btn); };
window.ap.clear = function () { window.ap.cs = ""; window.ap.pl = ""; };
setTimeout(function () { runBtn.click(); }, 100);
