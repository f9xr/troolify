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
function row(k, v) {
  return '<div class="result-row"><span>' + k + "</span><b>" + esc(v) + "</b></div>";
}
function placeCard(title, p) {
  var sub = [];
  if (p.lat != null && p.lon != null) sub.push(p.lat + ", " + p.lon);
  if (p.surface) sub.push(p.surface + (p.water_type ? " (" + p.water_type + ")" : ""));
  if (p.island) sub.push("on " + p.island);
  return '<div class="dg-card"><h4>' + esc(title) + '</h4><div class="dg-place">' + esc(p.place || p.country || "Open ocean") + "</div>" +
    '<div class="dg-sub">' + (p.country && p.place ? esc(p.country) + " \u00b7 " : "") + esc(sub.join(" \u00b7 ")) + "</div></div>";
}
function run() {
  var lat = parseFloat($("lat").value);
  var lon = parseFloat($("lon").value);
  if ($("lat").value === "" || $("lon").value === "" || !isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Enter a latitude between -90 and 90 and a longitude between -180 and 180.</div>';
    proc("Waiting for valid coordinates.");
    return;
  }
  var restore = busify(runBtn);
  proc("Digging through the planet via the Tasta Space API...");
  tsGet("/dig?lat=" + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lon))
    .then(function (d) {
      var html = "";
      html += '<div class="dg-two">' + placeCard("You dig from", d.from || {}) + placeCard("You come out at", d.to || {}) + "</div>";
      html += '<div class="dg-verdict">' + esc(d.verdict || "") + "</div>";
      html += row("Tunnel length", Number(d.tunnel_km || 0).toLocaleString() + " km");
      if (d.fall_minutes) {
        html += row("Fall time (uniform Earth)", (d.fall_minutes.uniform_earth != null ? Number(d.fall_minutes.uniform_earth).toFixed(1) + " minutes" : "-"));
        html += row("Fall time (real Earth)", (d.fall_minutes.real_earth != null ? Number(d.fall_minutes.real_earth).toFixed(1) + " minutes" : "-"));
      }
      html += row("Top speed at the centre", Number(d.top_speed_kmh || 0).toLocaleString() + " km/h");
      if (!d.land && d.nearest_land) {
        html += row("Nearest land", d.nearest_land.name + (d.nearest_land.country ? " (" + d.nearest_land.country + ")" : "") + " \u2014 " + Number(d.nearest_land.km || 0).toLocaleString() + " km away");
      }
      if (d.depth_record) {
        html += row("Deepest hole ever dug", d.depth_record.name + " \u2014 " + Number(d.depth_record.depth_m || 0).toLocaleString() + " m (" + (d.depth_record.year || "?") + ")");
      }
      if (d.image) html += '<div class="media-host" style="margin-top:14px"><img class="media-prev" src="' + esc(d.image) + '" alt="Tunnel through the Earth diagram" loading="lazy"></div>';
      $("results").innerHTML = html;
      proc((d.land ? "Land landing." : "Water landing.") + " Tunnel: " + Number(d.tunnel_km || 0).toLocaleString() + " km.");
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
$("presetRow").addEventListener("click", function (e) {
  var b = e.target.closest ? e.target.closest(".chip") : null;
  if (!b) return;
  var all = this.querySelectorAll(".chip");
  for (var i = 0; i < all.length; i++) all[i].classList.remove("active");
  b.classList.add("active");
  $("lat").value = b.getAttribute("data-lat");
  $("lon").value = b.getAttribute("data-lon");
  run();
});
$("locBtn").addEventListener("click", function () {
  if (!navigator.geolocation) { proc("This browser cannot share your location - type coordinates instead."); return; }
  proc("Asking your browser for your location...");
  navigator.geolocation.getCurrentPosition(function (pos) {
    $("lat").value = pos.coords.latitude.toFixed(4);
    $("lon").value = pos.coords.longitude.toFixed(4);
    run();
  }, function () {
    proc("Location permission denied - type coordinates or tap a preset city instead.");
  }, { timeout: 10000 });
});
window.ap.go = function () { runBtn.click(); };
window.ap.clear = function () { $("lat").value = ""; $("lon").value = ""; var c = document.querySelectorAll("#presetRow .chip"); for (var i = 0; i < c.length; i++) c[i].classList.remove("active"); };
