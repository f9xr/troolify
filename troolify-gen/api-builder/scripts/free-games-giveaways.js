var GP = "https://www.gamerpower.com/api";
var PAGE = 12;
var items = [];
var worthData = null;
var shown = PAGE;
window.ap = window.ap || {};
window.ap.links = [];

function qs() {
  var a = [];
  var p = $("plat").value, t = $("gtype").value, s = $("sortby").value;
  if (p) a.push("platform=" + p);
  if (t) a.push("type=" + t);
  if (s) a.push("sort-by=" + s);
  return a.length ? "?" + a.join("&") : "";
}
function wqs() {
  var a = [];
  var p = $("plat").value, t = $("gtype").value;
  if (p) a.push("platform=" + p);
  if (t) a.push("type=" + t);
  return a.length ? "?" + a.join("&") : "";
}
function gp(path) {
  return new Promise(function (res, rej) {
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 15000);
    fetch(GP + path, { signal: ctl.signal })
      .then(function (r) {
        clearTimeout(timer);
        if (r.status === 201) return { __empty: 1 };
        if (r.status === 404) throw new Error("The API could not find that resource (404).");
        if (r.status >= 500) throw new Error("The GamerPower API reported a server error (HTTP " + r.status + ") - please try again in a moment.");
        if (!r.ok) throw new Error("Unexpected response from the GamerPower API (HTTP " + r.status + ").");
        return r.json();
      })
      .then(res, function (e) {
        clearTimeout(timer);
        if (e && e.name === "AbortError") { rej(new Error("The request timed out - the GamerPower API may be down right now.")); return; }
        if (e instanceof Error && e.message && !/failed to fetch|networkerror|load failed/i.test(e.message)) { rej(e); return; }
        rej(new Error("Could not reach the GamerPower API. It may be temporarily unavailable - please try again in a moment."));
      });
  });
}
function fmtDate(s) {
  if (!s || s === "N/A") return "";
  var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  var d = new Date(+m[1], +m[2] - 1, +m[3]);
  if (isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
function linkOf(g) { return g.open_giveaway_url || g.open_giveaway || g.gamerpower_url || ""; }
function filtered() {
  var k = $("kw").value.trim().toLowerCase();
  if (!k) return items;
  return items.filter(function (g) {
    return ((g.title || "") + " " + (g.platforms || "") + " " + (g.type || "") + " " + (g.description || "")).toLowerCase().indexOf(k) >= 0;
  });
}
function summaryHtml() {
  var c = (worthData && worthData.active_giveaways_number != null) ? worthData.active_giveaways_number : items.length;
  var w = worthData ? worthData.worth_estimation_usd : null;
  return '<div class="gw-sum"><div class="gw-count"><b>' + esc(c) + "</b> live giveaways" +
    (w != null ? ' &middot; est. total value <b>$' + esc(w) + "</b>" : "") + "</div>" +
    '<span class="gw-attr">Listings by <a href="https://www.gamerpower.com/" target="_blank" rel="noopener">GamerPower</a> &middot; refreshed on every search</span></div>';
}
function cardHtml(g, i) {
  var thumb = g.thumbnail || g.image || "";
  var title = g.title || g.title_long || "Free giveaway";
  var worth = (g.worth && g.worth !== "N/A") ? g.worth : "Free";
  var chips = '<span class="gw-chip worth"><i class="fa-solid fa-tag"></i> ' + esc(worth) + "</span>";
  if (g.type) chips += '<span class="gw-chip kind">' + esc(g.type) + "</span>";
  if (g.platforms) chips += '<span class="gw-chip">' + esc(g.platforms) + "</span>";
  var sub = [];
  if (typeof g.users === "number") sub.push('<span><i class="fa-solid fa-user-group"></i>' + g.users.toLocaleString() + " claimed</span>");
  var pub = fmtDate(g.published_date);
  if (pub) sub.push('<span><i class="fa-solid fa-calendar-plus"></i>Posted ' + esc(pub) + "</span>");
  var end = fmtDate(g.end_date);
  sub.push(end
    ? '<span><i class="fa-solid fa-hourglass-half"></i>Ends ' + esc(end) + "</span>"
    : '<span><i class="fa-solid fa-infinity"></i>No fixed end date</span>');
  var instr = String(g.instructions || "").replace(/\r/g, "");
  var link = linkOf(g);
  var page = g.gamerpower_url || "";
  return '<div class="gw-card">' +
    (thumb ? '<img class="gw-thumb" src="' + esc(thumb) + '" alt="' + esc(title) + ' thumbnail" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : "") +
    '<div class="gw-body">' +
    '<div class="gw-title">' + esc(title) + "</div>" +
    '<div class="gw-chips">' + chips + "</div>" +
    '<div class="gw-sub">' + sub.join("") + "</div>" +
    (instr ? '<details class="gw-how"><summary>How to claim</summary><p>' + esc(instr).replace(/\n/g, "<br>") + "</p></details>" : "") +
    '<div class="gw-actions">' +
    (link ? '<a class="rt-btn gw-claim" href="' + esc(link) + '" target="_blank" rel="noopener"><i class="fa-solid fa-gift"></i>Claim giveaway</a>' : "") +
    (page && page !== link ? '<a class="rt-btn" href="' + esc(page) + '" target="_blank" rel="noopener"><i class="fa-solid fa-circle-info"></i>Details</a>' : "") +
    (link ? '<button class="rt-btn" type="button" onclick="ap.copy(this,' + i + ')"><i class="fa-solid fa-copy"></i>Copy link</button>' : "") +
    "</div></div></div>";
}
function render() {
  var list = filtered();
  var slice = list.slice(0, shown);
  window.ap.links = slice.map(linkOf);
  var html = "";
  if (items.length) html += summaryHtml();
  if (!items.length) html += '<div class="res-phase"><i class="fa-solid fa-hourglass-start"></i> No active giveaways match these filters right now - try fewer or different filters.</div>';
  else if (!list.length) html += '<div class="res-phase">No giveaway matches that keyword - clear the keyword box to see them all.</div>';
  else slice.forEach(function (g, i) { html += cardHtml(g, i); });
  if (list.length > shown) {
    html += '<div class="actions" style="justify-content:center;margin-top:14px"><button class="rt-btn" type="button" onclick="ap.more()"><i class="fa-solid fa-chevron-down"></i>Show more (' + (list.length - shown) + " left)</button></div>";
  }
  if (items.length) {
    html += '<div class="actions" style="justify-content:center;margin-top:14px"><button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Refresh list</button></div>';
  }
  $("results").innerHTML = html;
}
var runBtn = $("runBtn");
runBtn.addEventListener("click", function () {
  if (this.disabled) return;
  var restore = busify(this);
  proc("Loading live giveaways from GamerPower...");
  Promise.all([gp("/giveaways" + qs()), gp("/worth" + wqs())])
    .then(function (r) {
      var d = r[0];
      items = (d && d.__empty) ? [] : (Object.prototype.toString.call(d) === "[object Array]" ? d : []);
      worthData = (r[1] && !r[1].__empty) ? r[1] : null;
      shown = PAGE;
      render();
      proc(items.length ? "Loaded " + items.length + " active giveaways." : "No active giveaways for these filters.");
      restore();
    })
    .catch(function (e) {
      $("results").innerHTML = '<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> ' + esc(e.message) + "</div>";
      proc("Request failed.");
      restore();
    });
});
$("kw").addEventListener("input", function () { if (items.length) render(); });
window.ap.go = function () { runBtn.click(); };
window.ap.more = function () { shown += PAGE; render(); };
window.ap.copy = function (btn, i) { var u = window.ap.links[i]; if (u) copyText(u, btn); };
window.ap.clear = function () { items = []; worthData = null; shown = PAGE; window.ap.links = []; };
