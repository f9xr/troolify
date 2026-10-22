function srcCard(f, half) {
  var api=safeUrl(f.url),src=safeUrl(f.source);
  var html='<div class="pb-src"><b>'+esc(half)+":</b> &ldquo;"+esc(f.text)+"&rdquo;";
  if(api) html+=' &mdash; via <a href="'+esc(api)+'" target="_blank" rel="noopener">the proverb API</a>';
  if(src) html+=' and <a href="'+esc(src)+'" target="_blank" rel="noopener">the source</a>';
  return html+"</div>";
}
function run() {
  var lang = $("lang").value;
  var typed = $("seed").value.trim();
  /* The hub accepts a seed of 1 to 64 letters, digits, dashes or underscores
     and refuses anything else with a raw 422. */
  if (typed && !validSeed(typed)) {
    $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> A seed can be up to 64 letters, digits, dashes or underscores - no spaces or punctuation.</div>';
    proc("Waiting for a valid seed.");
    return;
  }
  var seed = typed || Math.random().toString(36).slice(2, 10);
  var restore = busify(runBtn);
  proc("Mashing proverbs via the Tasta Space API...");
  tsGet("/proverbs/mashup?lang=" + encodeURIComponent(lang) + "&seed=" + encodeURIComponent(seed))
    .then(function (d) {
      window.ap.cs = d.mashup || "";
      window.ap.pl = d.permalink || "";
      /* The hub echoes the seed it used - a random one when none was given -
         so it is put back in the box and the mashup can be rebuilt later. */
      if (d.seed) $("seed").value = d.seed;
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
      if (d.card) html += '<div class="media-host" style="margin-top:14px"><img class="media-prev" src="' + esc(mediaUrl(d.card)) + '" alt="Proverb mashup share card" loading="lazy"></div>';
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
window.ap.clear = function () { window.ap.cs = ""; window.ap.pl = ""; $("seed").value = ""; };
setTimeout(function () { runBtn.click(); }, 100);
