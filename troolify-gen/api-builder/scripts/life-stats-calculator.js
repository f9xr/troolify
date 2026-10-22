function tile(k, v) {
  return '<div class="gh-stat"><b>' + esc(v) + "</b><span>" + esc(k) + "</span></div>";
}
function row(k, v) {
  return '<div class="result-row"><span>' + k + "</span><b>" + esc(v) + "</b></div>";
}
function fmtDate(iso) {
  if (!iso) return "-";
  var d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
var PLANETS = [
  ["mercury", "Mercury"], ["venus", "Venus"], ["mars", "Mars"], ["jupiter", "Jupiter"],
  ["saturn", "Saturn"], ["uranus", "Uranus"], ["neptune", "Neptune"], ["pluto", "Pluto"]
];
function run() {
  var born = $("born").value;
  if (!born) { $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Pick your date of birth first.</div>'; proc("Waiting for a date."); return; }
  /* The hub accepts 1900-01-01 to today. A future date is compared against
     the visitor's own calendar day, not UTC, which can be a day ahead east
     of Greenwich and would reject a birthday that has already happened. */
  var today = todayLocal();
  if (born > today) { $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> That date is in the future.</div>'; proc("Waiting for a real date."); return; }
  if (born < "1900-01-01") { $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> The API counts from 1900 onwards - pick a later date.</div>'; proc("Waiting for a date from 1900 on."); return; }
  var restore = busify(runBtn);
  proc("Calculating your life in space time via the Tasta Space API...");
  tsGet("/life?born=" + encodeURIComponent(born))
    .then(function (d) {
      var meta = window.ap.meta || {};
      var html = "";
      html += '<div class="bn-hero">' + esc(String(d.age.years)) + " years, " + esc(String(d.age.months)) + " months, " + esc(String(d.age.days)) + " days</div>";
      html += row("Born on", d.weekday + " \u00b7 " + fmtDate(d.born));
      html += '<div class="gh-grid" style="margin-top:14px">';
      html += tile("Days alive", Number(d.days).toLocaleString());
      html += tile("Seconds lived", Number(d.seconds).toLocaleString());
      html += tile("Full moons seen", Number(d.full_moons_seen).toLocaleString());
      html += tile("Fridays the 13th", Number(d.friday_13ths_survived).toLocaleString());
      html += tile("Leap days lived", Number(d.leap_days_lived).toLocaleString());
      html += tile("Leap seconds lived", Number(d.leap_seconds_lived).toLocaleString());
      html += tile("km around the Sun", Number(d.km_around_the_sun).toLocaleString());
      html += tile("km around the galaxy", Number(d.km_around_the_galaxy).toLocaleString());
      html += tile("Heartbeats (est.)", Number(d.heartbeats_estimate).toLocaleString());
      html += tile("Breaths (est.)", Number(d.breaths_estimate).toLocaleString());
      html += tile("Gigasecond", d.gigasecond.passed ? fmtDate(d.gigasecond.date) : "in " + Number(d.gigasecond.days_until).toLocaleString() + " days");
      html += "</div>";
      html += '<p class="note" style="margin-top:16px"><b>Your ages on the other planets</b></p>';
      PLANETS.forEach(function (p) {
        if (d.age_on[p[0]] != null) html += row("Age on " + p[1], d.age_on[p[0]] + " years");
      });
      if (d.next_milestones && d.next_milestones.length) {
        html += '<p class="note" style="margin-top:16px"><b>Next planetary birthdays</b></p>';
        d.next_milestones.forEach(function (m) {
          var cert = safeUrl(m.certificate);
          html += '<div class="result-row"><span>' + esc(m.name) + " \u00b7 " + esc(fmtDate(m.date)) + " \u00b7 in " + Number(m.days_until).toLocaleString() + ' days</span><b>' + (cert ? '<a href="' + esc(cert) + '" target="_blank" rel="noopener">certificate</a>' : "") + "</b></div>";
        });
      }
      var a = meta.assumptions || null;
      html += '<p class="note" style="margin-top:14px">Estimates assume a steady ' + (a ? a.heart_rate_bpm : 75) + " heartbeats and " + (a ? a.breaths_per_minute : 15) + " breaths per minute for your whole life." + (meta.time_assumed ? " " + esc(meta.time_assumed) + "." : "");
      $("results").innerHTML = html;
      proc(d.age.years + " years old \u00b7 " + Number(d.days).toLocaleString() + " days.");
      restore();
    })
    .catch(function (e) {
      $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> ' + esc(e.message) + "</div>";
      proc("Calculation failed.");
      restore();
    });
}
var runBtn = $("runBtn");
runBtn.addEventListener("click", function () {
  if (this.disabled) return;
  run();
});
window.ap.go = function () { runBtn.click(); };
window.ap.clear = function () { $("born").value = ""; };
/* The hub only counts from 1900 to today, so the picker is bounded to the
   same window and the browser refuses an impossible pick up front. */
$("born").min = "1900-01-01";
$("born").max = todayLocal();
