function tile(k, v) {
  return '<div class="gh-stat"><b>' + esc(v) + "</b><span>" + esc(k) + "</span></div>";
}
function row(k, v) {
  return '<div class="result-row"><span>' + k + "</span><b>" + esc(v) + "</b></div>";
}
function run() {
  var seed = $("seed").value.trim();
  /* The hub only accepts a seed of 1 to 64 letters, digits, dashes or
     underscores and answers anything else with a raw 422, so it is checked
     here and the visitor gets a message they can act on. */
  if (seed && !validSeed(seed)) {
    $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> A seed can be up to 64 letters, digits, dashes or underscores - no spaces or punctuation.</div>';
    proc("Waiting for a valid seed.");
    return;
  }
  var restore = busify(runBtn);
  proc("Inventing a country via the Tasta Space API...");
  tsGet("/countries/fake" + (seed ? "?seed=" + encodeURIComponent(seed) : ""))
    .then(function (d) {
      window.ap.pl = safeUrl(d.permalink);
      var cur = d.currency || {};
      var hp = d.highest_point || {};
      var flag = d.flag || {};
      var flagImg = mediaUrl(flag.url);
      var flagPng = safeUrl(flag.png);
      var mapPng = safeUrl(d.map && d.map.png);
      var mapImg = mediaUrl(d.map && d.map.url);
      var cardPng = safeUrl(d.card && d.card.url);
      var cardSvg = safeUrl(d.card && d.card.svg);
      var html = "";
      html += '<div class="fc-two">';
      html += flagImg ? '<img class="fc-flag" src="' + esc(flagImg) + '" alt="Flag of ' + esc(d.name) + '" loading="lazy">' : "";
      html += "<div>";
      html += '<div class="fc-name">' + esc(d.name) + "</div>";
      html += '<div class="fc-official">' + esc(d.official_name || "") + " \u00b7 " + esc(d.demonym || "") + " \u00b7 " + esc(d.government || "") + "</div>";
      if (d.motto) html += '<div class="fc-motto">' + esc(d.motto.latin || "") + "<span>" + esc(d.motto.english || "") + "</span></div>";
      html += "</div></div>";
      html += '<div class="gh-grid" style="margin-top:14px">';
      html += tile("Capital", d.capital || "-");
      html += tile("Population", Number(d.population || 0).toLocaleString());
      html += tile("Area (km\u00b2)", Number(d.area_km2 || 0).toLocaleString());
      html += tile("Density (/km\u00b2)", Number(d.density_per_km2 || 0).toLocaleString());
      html += tile("Coastline (km)", Number(d.coastline_km || 0).toLocaleString());
      html += tile("Highest point", hp.name ? hp.name + " (" + Number(hp.elevation_m).toLocaleString() + " m)" : "-");
      html += tile("Founded", d.founded != null ? String(d.founded) : "-");
      html += tile("Driving side", d.driving_side || "-");
      html += tile("Time zone", d.time_zone || "-");
      html += tile("Web / phone", (d.tld || "-") + " / " + (d.calling_code || "-"));
      html += "</div>";
      html += row("Currency", (cur.name || "-") + (cur.code ? " (" + cur.code + ")" : "") + (cur.per_eur != null ? " \u2014 " + cur.per_eur + " per EUR" : ""));
      html += row("National dish", d.national_dish || "-");
      html += row("National animal", d.national_animal || "-");
      html += row("National sport", d.national_sport || "-");
      html += row("Famous for", d.famous_for || "-");
      html += row("Seed", d.seed || "-");
      html += '<div class="actions" style="margin-top:12px">';
      html += '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-link"></i>Copy permalink</button>';
      if (flagPng) html += '<a class="rt-btn" href="' + esc(flagPng) + '" target="_blank" rel="noopener"><i class="fa-solid fa-image"></i>Flag PNG</a>';
      if (mapPng) html += '<a class="rt-btn" href="' + esc(mapPng) + '" target="_blank" rel="noopener"><i class="fa-solid fa-map"></i>Map PNG</a>';
      if (cardPng) html += '<a class="rt-btn" href="' + esc(cardPng) + '" target="_blank" rel="noopener"><i class="fa-solid fa-id-card"></i>Country card PNG</a>';
      html += "</div>";
      if (mapImg) html += '<div class="media-host" style="margin-top:14px"><img class="media-prev" src="' + esc(mapImg) + '" alt="Map silhouette of ' + esc(d.name) + '" loading="lazy"></div>';
      if (cardSvg) html += '<div class="media-host" style="margin-top:14px"><img class="media-prev" src="' + esc(cardSvg) + '" alt="Country card for ' + esc(d.name) + '" loading="lazy"></div>';
      $("results").innerHTML = html;
      proc("Meet " + (d.name || "your country") + " - capital " + (d.capital || "?") + ".");
      restore();
    })
    .catch(function (e) {
      $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> ' + esc(e.message) + "</div>";
      proc("Generation failed.");
      restore();
    });
}
var runBtn = $("runBtn");
runBtn.addEventListener("click", function () {
  if (this.disabled) return;
  run();
});
window.ap.go = function () { runBtn.click(); };
window.ap.copy = function (btn) { copyText(window.ap.pl || "", btn); };
window.ap.clear = function () { window.ap.pl = ""; $("seed").value = ""; };
