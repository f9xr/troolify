function fmt(iso) {
  if (!iso) return "-";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) + " \u00b7 " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function row(k, v) {
  return '<div class="result-row"><span>' + k + "</span><b>" + esc(v) + "</b></div>";
}
$("date").value = todayLocal();
function run() {
  var date = $("date").value;
  if (!date) { $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Pick a date first.</div>'; proc("Waiting for a date."); return; }
  var restore = busify(runBtn);
  proc("Asking the Tasta Space API about the Moon...");
  /* The hub dates a day in its own zone (Europe/Bucharest) unless it is told
     otherwise, so the visitor's own zone is sent with the request - the next
     phase times then read as local times instead of Bucharest ones. */
  var tz = visitorTz();
  var qs = "/moon?date=" + encodeURIComponent(date) + "&hemisphere=" + encodeURIComponent($("hemi").value) + (tz ? "&tz=" + encodeURIComponent(tz) : "");
  tsGet(qs)
    .then(function (d) {
      var html = "";
      if (d.image) html += '<div class="media-host"><img class="media-prev" src="' + esc(mediaUrl(d.image)) + '" alt="' + esc(d.phase_name) + ' Moon drawing" loading="lazy" style="max-height:250px"></div>';
      html += '<div class="bn-hero">' + esc(d.emoji || "") + " " + esc(d.phase_name) + "</div>";
      html += row("Illumination", Math.round(d.illumination * 100) + "%");
      html += row("Moon age", Number(d.age_days).toFixed(1) + " days");
      html += row("Cycle position", Math.round(d.cycle * 100) + "%");
      html += row("Distance", Number(d.distance_km).toLocaleString() + " km");
      html += row("Direction", d.waxing ? "Waxing (growing)" : "Waning (shrinking)");
      html += row("Hemisphere", d.hemisphere === "south" ? "Southern" : "Northern");
      html += row("Blue moon", d.blue_moon ? "Yes" : "No");
      html += row("Supermoon", d.supermoon ? "Yes" : "No");
      html += row("Werewolf risk", String(d.werewolf_risk || "-").charAt(0).toUpperCase() + String(d.werewolf_risk || "-").slice(1));
      if (d.full_moon_name) html += row("Full moon name", d.full_moon_name);
      if (d.next) {
        html += row("Next new moon", fmt(d.next["new"]));
        html += row("Next first quarter", fmt(d.next.first_quarter));
        html += row("Next full moon", fmt(d.next.full));
        html += row("Next last quarter", fmt(d.next.last_quarter));
      }
      $("results").innerHTML = html;
      proc(d.phase_name + " \u00b7 " + Math.round(d.illumination * 100) + "% lit.");
      restore();
    })
    .catch(function (e) {
      $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> ' + esc(e.message) + "</div>";
      proc("Request failed.");
      restore();
    });
}
var runBtn = $("runBtn");
runBtn.addEventListener("click", function () {
  if (this.disabled) return;
  run();
});
$("todayBtn").addEventListener("click", function () {
  $("date").value = todayLocal();
  runBtn.click();
});
window.ap.go = function () { runBtn.click(); };
window.ap.clear = function () { $("date").value = todayLocal(); $("hemi").selectedIndex = 0; };
setTimeout(function () { runBtn.click(); }, 100);
