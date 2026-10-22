/* ============================================================================
   Troolify - EOQ Calculator (Economic Order Quantity)
   Builds tools/finance/eoq-calculator.html with the shared page shell
   (hero, JSON-LD, SEO article, FAQ, workflow hook) and registers the tool.
   Run: node troolify-gen/gen-eoq-calculator.js   (from the repo root)
   ============================================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');

/* ------------------------------------------------------------------ CSS --- */
const CSS = `
.eoq, .eoq * { box-sizing: border-box; }
.eoq {
  --ink:#F8F9FA; --paper:#1B2028; --muted:#ADB5BD; --line:#495057; --err:#F87171; --accent:#3B82F6;
  font-family: var(--font), system-ui, -apple-system, 'Segoe UI', sans-serif;
  color:var(--ink); max-width:1200px; margin:0 auto; padding:1rem; line-height:1.5;
}
.eoq-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.09); border-radius:16px; padding:1.5rem; }
.eoq-title { margin:0 0 1rem; font-size:1.1rem; display:flex; align-items:center; gap:.6rem; }
.eoq-title i { width:30px; height:30px; border-radius:8px; background:var(--accent); color:#fff; display:grid; place-items:center; font-size:.85rem; }
.eoq-field { margin-bottom:1rem; }
.eoq-field label { display:flex; align-items:center; gap:.4rem; font-weight:600; font-size:.9rem; margin-bottom:.35rem; }
.eoq-field label i { color:var(--muted); width:16px; text-align:center; }
.eoq-field input, .eoq-field select {
  width:100%; padding:.7rem .85rem; font:inherit; color:var(--ink); background:var(--paper);
  border:1.5px solid var(--line); border-radius:10px; transition:border-color .2s, box-shadow .2s;
}
.eoq-field input:focus, .eoq-field select:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(59,130,246,.2); }
.eoq-field.invalid input { border-color:var(--err); }
.eoq-hint { color:var(--muted); font-size:.78rem; margin-top:.25rem; }
.eoq-error { color:var(--err); font-size:.8rem; margin-top:.25rem; }
.eoq-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
@media (max-width:420px){ .eoq-row{ grid-template-columns:1fr; } }
.eoq-actions { display:flex; gap:.6rem; flex-wrap:wrap; margin-top:.5rem; }
.eoq-btn { flex:1; min-width:120px; display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
  padding:.75rem 1rem; font:inherit; font-weight:600; border-radius:10px; cursor:pointer;
  border:1.5px solid var(--line); background:rgba(255,255,255,.04); color:var(--ink); transition:transform .15s, background .2s, border-color .2s; }
.eoq-btn:active { transform:scale(.97); }
.eoq-btn.primary { background:var(--accent); border-color:var(--accent); color:#fff; }
.eoq-btn.primary:hover { background:#2563EB; border-color:#2563EB; }
.eoq-btn.ghost:hover { background:var(--accent); border-color:var(--accent); color:#fff; }
.eoq-hero { background:linear-gradient(135deg, rgba(59,130,246,.22), rgba(16,185,129,.1)); border:1px solid rgba(96,165,250,.28);
  border-radius:14px; padding:1.5rem; text-align:center; animation:eoq-pop .45s ease both; }
.eoq-hero small { text-transform:uppercase; letter-spacing:.12em; opacity:.8; font-size:.75rem; }
.eoq-hero .eoq-big { font-size:clamp(1.9rem,6vw,3rem); font-weight:800; margin:.25rem 0; word-break:break-word; }
.eoq-hero .eoq-sub { color:var(--muted); font-size:.95rem; }
.eoq-pill { display:inline-flex; align-items:center; gap:.4rem; background:var(--accent); color:#fff; border-radius:999px;
  padding:.25rem .8rem; font-weight:700; font-size:.85rem; margin-top:.6rem; }
@keyframes eoq-pop { from{ opacity:0; transform:translateY(12px);} to{ opacity:1; transform:none;} }
.eoq-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:.75rem; margin:1rem 0; }
.eoq-stat { border:1px solid rgba(255,255,255,.09); border-radius:12px; padding:.85rem 1rem; background:rgba(255,255,255,.04); }
.eoq-stat span { display:flex; align-items:center; gap:.4rem; color:var(--muted); font-size:.8rem; }
.eoq-stat strong { display:block; font-size:1.1rem; margin-top:.15rem; word-break:break-word; }
.eoq-chart-wrap { margin-top:1rem; }
.eoq-chart { width:100%; height:auto; display:block; background:rgba(255,255,255,.02); border:1px solid var(--line); border-radius:12px; }
.eoq-legend { display:flex; gap:1rem; font-size:.85rem; margin-top:.6rem; flex-wrap:wrap; color:var(--muted); }
.eoq-legend span::before { content:''; display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:.4rem; vertical-align:-1px; }
.eoq-legend .t::before { background:#3B82F6; }
.eoq-legend .o::before { background:#34D399; }
.eoq-legend .h::before { background:#F59E0B; }
.eoq-steps { counter-reset:step; list-style:none; padding:0; margin:0; }
.eoq-steps li { position:relative; padding:0 0 1.1rem 3rem; }
.eoq-steps li::before { counter-increment:step; content:counter(step); position:absolute; left:0; top:0; width:32px; height:32px;
  border-radius:50%; background:var(--accent); color:#fff; display:grid; place-items:center; font-weight:700; font-size:.9rem; }
.eoq-steps li:not(:last-child)::after { content:''; position:absolute; left:15px; top:36px; bottom:4px; width:2px; background:var(--line); }
.eoq-steps h4 { margin:.2rem 0 .3rem; font-size:1rem; }
.eoq-steps p { margin:0 0 .4rem; color:var(--muted); font-size:.9rem; }
.eoq-math { display:block; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.82rem; background:rgba(255,255,255,.04);
  border-left:3px solid var(--accent); padding:.55rem .75rem; border-radius:6px; overflow-x:auto; white-space:pre-wrap; word-break:break-word; margin-top:.3rem; color:var(--muted); }
.eoq-math b { background:var(--accent); color:#fff; padding:0 .3rem; border-radius:4px; }
.eoq-table-wrap { overflow:auto; max-height:340px; border:1px solid var(--line); border-radius:10px; }
.eoq-table { width:100%; border-collapse:collapse; font-size:.85rem; min-width:520px; }
.eoq-table th, .eoq-table td { padding:.55rem .75rem; text-align:right; border-bottom:1px solid rgba(255,255,255,.08); }
.eoq-table th:first-child, .eoq-table td:first-child { text-align:left; }
.eoq-table th { position:sticky; top:0; background:#212529; }
.eoq-table tr.best td { background:rgba(52,211,153,.12); font-weight:700; }
.eoq-save { border:1px solid rgba(52,211,153,.35); background:rgba(52,211,153,.1); border-radius:14px; padding:1.1rem 1.25rem; margin-top:1rem; }
.eoq-save h3 { margin:0 0 .4rem; font-size:1.05rem; display:flex; align-items:center; gap:.5rem; color:#34D399; }
.eoq-save p { margin:.2rem 0; color:var(--muted); font-size:.92rem; }
.eoq-empty { text-align:center; padding:2.5rem 1rem; color:var(--muted); }
.eoq-empty i { font-size:2.2rem; color:var(--accent); margin-bottom:.75rem; display:block; }
.eoq-note { margin-top:1rem; font-size:.85rem; color:var(--muted); border-left:3px solid var(--line); padding:.6rem .9rem; background:rgba(255,255,255,.03); border-radius:0 8px 8px 0; }
.panel.clean .eoq { padding:0; max-width:none; }
.panel.clean .eoq > .eoq-card:first-child { background:none; border:0; padding:0; }
`;

/* --------------------------------------------------------------- PANEL --- */
const FIELDS = [
  { id: 'eoq-demand', label: 'Annual demand (units)', icon: 'fa-solid fa-cart-shopping', type: 'number', step: '1', value: '12000', hint: 'Units you sell or consume in a full year.' },
  { id: 'eoq-order-cost', label: 'Ordering cost per order', icon: 'fa-solid fa-file-invoice-dollar', type: 'number', step: '0.01', value: '250', hint: 'Admin, freight and set-up cost of raising one purchase order.' },
  { id: 'eoq-holding-cost', label: 'Holding cost per unit / year', icon: 'fa-solid fa-warehouse', type: 'number', step: '0.01', value: '12', hint: 'Storage, insurance, financing and obsolescence per unit per year.' },
  { id: 'eoq-unit-cost', label: 'Purchase price per unit', icon: 'fa-solid fa-tag', type: 'number', step: '0.01', value: '40', hint: 'Used for the annual purchase spend. Optional.' }
];
const PLANNING = [
  { id: 'eoq-lead-time', label: 'Lead time (days)', icon: 'fa-solid fa-truck-fast', type: 'number', step: '0', value: '7', hint: 'Order to delivery.' },
  { id: 'eoq-safety', label: 'Safety stock (units)', icon: 'fa-solid fa-shield-halved', type: 'number', step: '1', value: '200', hint: 'Buffer you hold to cover demand swings.' },
  { id: 'eoq-workdays', label: 'Working days per year', icon: 'fa-solid fa-calendar-days', type: 'number', step: '1', value: '250', hint: 'Days you actually trade or produce.' },
  { id: 'eoq-current-q', label: 'Current order quantity', icon: 'fa-solid fa-scale-balanced', type: 'number', step: '1', value: '', hint: 'Optional - compare your present order size against the EOQ.' }
];

function field(f) {
  return '<div class="eoq-field"><label for="' + f.id + '"><i class="' + f.icon + '"></i>' + f.label + '</label>' +
    '<input id="' + f.id + '" type="' + f.type + '" step="' + f.step + '" inputmode="decimal" value="' + f.value + '"' +
    (f.hint ? ' aria-describedby="' + f.id + 'Hint"' : '') + '>' +
    (f.hint ? '<p class="eoq-hint" id="' + f.id + 'Hint">' + f.hint + '</p>' : '') +
    '<p class="eoq-error" id="' + f.id + 'Err" role="alert"></p></div>';
}

const CURRENCIES = [
  ['USD', 'US Dollar ($)'], ['EUR', 'Euro (EUR)'], ['GBP', 'British Pound (GBP)'],
  ['INR', 'Indian Rupee (INR)'], ['CAD', 'Canadian Dollar (CAD)'], ['AUD', 'Australian Dollar (AUD)'],
  ['JPY', 'Japanese Yen (JPY)'], ['CHF', 'Swiss Franc (CHF)']
];

const PANEL_HTML =
  '<div class="eoq">' +
  '<div class="eoq-card">' +
  '<h3 class="eoq-title"><i class="fa-solid fa-sliders"></i> Inventory inputs</h3>' +
  '<div class="eoq-row">' + FIELDS.slice(0, 2).map(field).join('') + '</div>' +
  '<div class="eoq-row">' + FIELDS.slice(2).map(field).join('') + '</div>' +
  '<div class="eoq-row">' + PLANNING.slice(0, 2).map(field).join('') + '</div>' +
  '<div class="eoq-row">' + PLANNING.slice(2).map(field).join('') + '</div>' +
  '<div class="eoq-field"><label for="eoq-currency"><i class="fa-solid fa-coins"></i>Currency</label>' +
  '<select id="eoq-currency">' + CURRENCIES.map(c => '<option value="' + c[0] + '">' + c[1] + '</option>').join('') + '</select></div>' +
  '<div class="eoq-actions">' +
  '<button class="eoq-btn primary" type="button" id="eoqGo"><i class="fa-solid fa-calculator"></i>Calculate EOQ</button>' +
  '<button class="eoq-btn ghost" type="button" id="eoqCopy"><i class="fa-solid fa-copy"></i>Copy result</button>' +
  '</div>' +
  '</div>' +
  '<div id="eoqResults"></div>' +
  '</div>';

/* ------------------------------------------------------------------ JS --- */
const JS = `
(function () {
  'use strict';
  var root = document.getElementById('eoqResults');
  var proc = document.getElementById('eoqProc');
  var cur = document.getElementById('eoq-currency');
  if (!root) return;

  var F = {
    demand: document.getElementById('eoq-demand'),
    orderCost: document.getElementById('eoq-order-cost'),
    holdingCost: document.getElementById('eoq-holding-cost'),
    unitCost: document.getElementById('eoq-unit-cost'),
    leadTime: document.getElementById('eoq-lead-time'),
    safety: document.getElementById('eoq-safety'),
    workdays: document.getElementById('eoq-workdays'),
    currentQ: document.getElementById('eoq-current-q')
  };

  var DEFAULTS = {
    demand: '12000', orderCost: '250', holdingCost: '12', unitCost: '40',
    leadTime: '7', safety: '200', workdays: '250', currentQ: ''
  };

  var RULES = {
    demand:      { min: 1,     max: 1e9,  label: 'Annual demand', integer: true },
    orderCost:   { min: 0.01,  max: 1e8,  label: 'Ordering cost' },
    holdingCost: { min: 0.01,  max: 1e8,  label: 'Holding cost' },
    unitCost:    { min: 0,     max: 1e8,  label: 'Purchase price' },
    leadTime:    { min: 0,     max: 3650, label: 'Lead time' },
    safety:      { min: 0,     max: 1e9,  label: 'Safety stock' },
    workdays:    { min: 1,     max: 366,  label: 'Working days', integer: true }
  };

  var summary = '';

  function money(v, dec) {
    if (dec === undefined) dec = 2;
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur.value, minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
    } catch (e) {
      return cur.value + ' ' + Number(v).toFixed(dec);
    }
  }
  function num(v, dec) {
    if (dec === undefined) dec = 0;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: dec, minimumFractionDigits: dec }).format(v);
  }
  function compact(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(1).replace(/\\.0$/, '') + 'B';
    if (a >= 1e6) return (v / 1e6).toFixed(1).replace(/\\.0$/, '') + 'M';
    if (a >= 1e3) return (v / 1e3).toFixed(1).replace(/\\.0$/, '') + 'k';
    return String(Math.round(v));
  }

  function validate() {
    var ok = true;
    Object.keys(RULES).forEach(function (k) {
      var r = RULES[k], el = F[k];
      var wrap = el.closest('.eoq-field'), err = document.getElementById(el.id + 'Err');
      var raw = el.value.trim(), v = parseFloat(raw), msg = '';
      if (raw === '' || !isFinite(v)) msg = r.label + ' is required.';
      else if (v < r.min || v > r.max) msg = r.label + ' must be between ' + r.min + ' and ' + r.max + '.';
      else if (r.integer && !Number.isInteger(v)) msg = 'Please enter a whole number of units.';
      wrap.classList.toggle('invalid', !!msg);
      if (err) err.textContent = msg;
      if (msg) ok = false;
    });
    var q = F.currentQ.value.trim();
    var qErr = document.getElementById('eoq-current-qErr');
    var qWrap = F.currentQ.closest('.eoq-field');
    var qMsg = '';
    if (q !== '') {
      var qv = parseFloat(q);
      if (!isFinite(qv) || qv < 0 || qv > 1e9) qMsg = 'Current order quantity must be 0 or more.';
    }
    qWrap.classList.toggle('invalid', !!qMsg);
    if (qErr) qErr.textContent = qMsg;
    if (qMsg) ok = false;
    return ok;
  }

  function calc() {
    var D = parseFloat(F.demand.value);
    var S = parseFloat(F.orderCost.value);
    var H = parseFloat(F.holdingCost.value);
    var C = parseFloat(F.unitCost.value) || 0;
    var lead = parseFloat(F.leadTime.value) || 0;
    var safety = parseFloat(F.safety.value) || 0;
    var days = parseInt(F.workdays.value, 10);
    var eoq = Math.sqrt(2 * D * S / H);
    var orders = D / eoq;
    var cycle = days / orders;
    var daily = D / days;
    var orderCost = orders * S;
    var holdCost = (eoq / 2) * H;
    var total = orderCost + holdCost;
    var purchase = D * C;
    var rop = daily * lead + safety;
    return {
      D: D, S: S, H: H, C: C, lead: lead, safety: safety, days: days,
      eoq: eoq, orders: orders, cycle: cycle, daily: daily,
      orderCost: orderCost, holdCost: holdCost, total: total, purchase: purchase,
      rop: rop, maxLevel: eoq + safety, avgStock: eoq / 2 + safety
    };
  }

  function costChart(d) {
    var W = 640, H = 300, PL = 64, PR = 18, PT = 18, PB = 46;
    var qMin = Math.max(1, d.eoq * 0.12), qMax = d.eoq * 2.5, n = 90, pts = [], maxC = 0;
    for (var i = 0; i < n; i++) {
      var q = qMin + (qMax - qMin) * (i / (n - 1));
      var oc = d.D * d.S / q, hc = q / 2 * d.H, tc = oc + hc;
      pts.push({ q: q, oc: oc, hc: hc, tc: tc });
      if (tc > maxC) maxC = tc;
    }
    var yMax = maxC * 1.08;
    var pw = W - PL - PR, ph = H - PT - PB;
    function X(q) { return PL + (q - qMin) / (qMax - qMin) * pw; }
    function Y(v) { return PT + ph - (v / yMax) * ph; }
    function path(key) {
      return pts.map(function (p, i) {
        return (i ? 'L' : 'M') + X(p.q).toFixed(1) + ' ' + Y(p[key]).toFixed(1);
      }).join(' ');
    }
    var tcPath = path('tc');
    var area = tcPath + ' L' + X(qMax).toFixed(1) + ' ' + (PT + ph).toFixed(1) + ' L' + X(qMin).toFixed(1) + ' ' + (PT + ph).toFixed(1) + ' Z';
    var mx = X(d.eoq), my = Y(d.total);
    var yTicks = '';
    [0, 0.5, 1].forEach(function (f) {
      var v = yMax * f, y = Y(v);
      yTicks += '<line x1="' + PL + '" y1="' + y.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + y.toFixed(1) + '" stroke="#495057" stroke-width="1" stroke-dasharray="3 4"/>' +
        '<text x="' + (PL - 8) + '" y="' + (y + 4).toFixed(1) + '" fill="#ADB5BD" font-size="11" text-anchor="end">' + compact(v) + '</text>';
    });
    var xTicks = '';
    [qMin, d.eoq, qMax].forEach(function (q) {
      xTicks += '<line x1="' + X(q).toFixed(1) + '" y1="' + (PT + ph) + '" x2="' + X(q).toFixed(1) + '" y2="' + (PT + ph + 5) + '" stroke="#ADB5BD" stroke-width="1"/>' +
        '<text x="' + X(q).toFixed(1) + '" y="' + (PT + ph + 19) + '" fill="#ADB5BD" font-size="11" text-anchor="middle">' + compact(q) + '</text>';
    });
    return '<svg class="eoq-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Total inventory cost against order quantity, minimised at the economic order quantity of ' + num(d.eoq, 1) + ' units">' +
      '<defs><linearGradient id="eoqFill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#3B82F6" stop-opacity=".22"/><stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/></linearGradient></defs>' +
      yTicks +
      '<path d="' + area + '" fill="url(#eoqFill)"/>' +
      '<path d="' + path('oc') + '" fill="none" stroke="#34D399" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<path d="' + path('hc') + '" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<path d="' + tcPath + '" fill="none" stroke="#3B82F6" stroke-width="3" stroke-linejoin="round"/>' +
      '<line x1="' + mx.toFixed(1) + '" y1="' + PT + '" x2="' + mx.toFixed(1) + '" y2="' + (PT + ph) + '" stroke="#93C5FD" stroke-width="1.5" stroke-dasharray="4 4"/>' +
      '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="6" fill="#3B82F6" stroke="#F8F9FA" stroke-width="2"/>' +
      '<text x="' + mx.toFixed(1) + '" y="' + (PT + 13) + '" fill="#93C5FD" font-size="12" font-weight="700" text-anchor="middle">EOQ ' + num(d.eoq, 0) + '</text>' +
      xTicks +
      '<line x1="' + PL + '" y1="' + (PT + ph) + '" x2="' + (W - PR) + '" y2="' + (PT + ph) + '" stroke="#ADB5BD" stroke-width="1.5"/>' +
      '<text x="' + (PL + pw / 2).toFixed(1) + '" y="' + (H - 8) + '" fill="#ADB5BD" font-size="11" text-anchor="middle">Order quantity (units)</text>' +
      '<text x="14" y="' + (PT + ph / 2) + '" fill="#ADB5BD" font-size="11" text-anchor="middle" transform="rotate(-90 14 ' + (PT + ph / 2) + ')">Annual cost</text>' +
      '</svg>';
  }

  function render() {
    var t0 = performance.now();
    if (!validate()) {
      root.innerHTML = '<div class="eoq-card eoq-empty"><i class="fa-solid fa-triangle-exclamation"></i>Fix the highlighted fields to see your EOQ.</div>';
      summary = '';
      if (proc) proc.textContent = 'Waiting for valid input - calculations happen in this tab.';
      return;
    }
    var d = calc();
    var eoqUnits = Math.ceil(d.eoq);
    var orderQty = Math.ceil(d.eoq / 10) * 10 > eoqUnits ? Math.ceil(d.eoq / 10) * 10 : eoqUnits;

    var mults = [0.5, 0.75, 1, 1.25, 1.5, 2];
    var rows = mults.map(function (m) {
      var q = d.eoq * m;
      var tc = d.D * d.S / q + q / 2 * d.H;
      return { q: q, tc: tc, diff: tc - d.total, best: m === 1 };
    });
    var tableRows = rows.map(function (r) {
      return '<tr class="' + (r.best ? 'best' : '') + '"><td>' + (r.best ? 'EOQ (optimal)' : num(r.q, 0) + ' units') + '</td><td>' + money(r.tc) + '</td><td>' + (r.best ? '-' : money(r.diff)) + '</td><td>' + (r.best ? '0%' : num((r.diff / d.total) * 100, 1) + '%') + '</td></tr>';
    }).join('');

    var saving = '';
    var qRaw = F.currentQ.value.trim();
    if (qRaw !== '') {
      var q = parseFloat(qRaw);
      if (q > 0) {
        var tcNow = d.D * d.S / q + q / 2 * d.H;
        var diff = tcNow - d.total;
        var pct = tcNow > 0 ? (diff / tcNow) * 100 : 0;
        saving = '<div class="eoq-save"><h3><i class="fa-solid fa-piggy-bank"></i>' +
          (diff > 0 ? 'Moving to the EOQ saves ' + money(diff) + ' a year' : 'You are already at the cost minimum') + '</h3>' +
          '<p>Your current order quantity of <strong>' + num(q, 0) + ' units</strong> costs <strong>' + money(tcNow) + '</strong> a year in ordering and holding.</p>' +
          '<p>Ordering <strong>' + num(d.eoq, 0) + ' units</strong> instead costs <strong>' + money(d.total) + '</strong> a year' +
          (diff > 0 ? ' - a saving of <strong>' + money(diff) + '</strong> (' + num(pct, 1) + '% of the current inventory cost).' : '.') + '</p>' +
          '</div>';
      }
    }

    var unitNote = d.C > 0
      ? 'Annual purchase spend at ' + money(d.C) + ' per unit is <strong>' + money(d.purchase) + '</strong> - the same at any order size, so it does not affect the EOQ.'
      : 'Add a purchase price to see the annual purchase spend on top of the ordering and holding costs.';

    root.innerHTML =
      '<div class="eoq-card">' +
      '<div class="eoq-hero">' +
      '<small>Optimal order quantity</small>' +
      '<div class="eoq-big">' + num(d.eoq, 1) + ' units</div>' +
      '<div class="eoq-sub">Order about <strong>' + num(orderQty, 0) + ' units</strong> each time to minimise ordering plus holding cost</div>' +
      '<div class="eoq-pill"><i class="fa-solid fa-bullseye"></i>' + money(d.total) + ' a year in inventory cost</div>' +
      '</div>' +

      '<div class="eoq-stats">' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-repeat"></i>Orders per year</span><strong>' + num(d.orders, 2) + '</strong></div>' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-clock"></i>Days between orders</span><strong>' + num(d.cycle, 1) + '</strong></div>' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-file-invoice-dollar"></i>Annual ordering cost</span><strong>' + money(d.orderCost) + '</strong></div>' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-warehouse"></i>Annual holding cost</span><strong>' + money(d.holdCost) + '</strong></div>' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-coins"></i>Total annual cost</span><strong>' + money(d.total) + '</strong></div>' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-bell"></i>Reorder point</span><strong>' + num(d.rop, 1) + ' units</strong></div>' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-layer-group"></i>Max stock level</span><strong>' + num(d.maxLevel, 0) + ' units</strong></div>' +
      '<div class="eoq-stat"><span><i class="fa-solid fa-chart-simple"></i>Average stock</span><strong>' + num(d.avgStock, 1) + ' units</strong></div>' +
      '</div>' +

      '<div class="eoq-chart-wrap">' +
      '<h3 class="eoq-title"><i class="fa-solid fa-chart-line"></i> How cost changes with order quantity</h3>' +
      costChart(d) +
      '<div class="eoq-legend"><span class="t">Total inventory cost</span><span class="o">Ordering cost</span><span class="h">Holding cost</span></div>' +
      '</div>' +
      '</div>' +

      saving +

      '<div class="eoq-card" style="margin-top:1.25rem">' +
      '<h3 class="eoq-title"><i class="fa-solid fa-square-root-variable"></i> How your result was calculated</h3>' +
      '<ol class="eoq-steps">' +
      '<li><h4>The EOQ formula</h4>' +
      '<p>EOQ balances the cost of ordering against the cost of holding stock, using annual demand, the cost of one order and the yearly cost of holding one unit.</p>' +
      '<code class="eoq-math">EOQ = &radic;(2DS / H) = &radic;(2 &times; ' + num(d.D, 0) + ' &times; ' + money(d.S) + ' / ' + money(d.H) + ') = <b>' + num(d.eoq, 2) + ' units</b></code></li>' +
      '<li><h4>How many orders you need</h4>' +
      '<p>Annual demand divided by the EOQ gives the number of purchase orders you raise each year.</p>' +
      '<code class="eoq-math">N = D / EOQ = ' + num(d.D, 0) + ' / ' + num(d.eoq, 2) + ' = <b>' + num(d.orders, 2) + ' orders per year</b></code></li>' +
      '<li><h4>How long stock lasts between orders</h4>' +
      '<code class="eoq-math">Cycle length = working days / N = ' + num(d.days, 0) + ' / ' + num(d.orders, 2) + ' = <b>' + num(d.cycle, 1) + ' days</b></code></li>' +
      '<li><h4>Annual ordering cost</h4>' +
      '<code class="eoq-math">Ordering cost = N &times; S = ' + num(d.orders, 2) + ' &times; ' + money(d.S) + ' = <b>' + money(d.orderCost) + '</b></code></li>' +
      '<li><h4>Annual holding cost</h4>' +
      '<p>Stock falls from the full order quantity to zero, so the average on hand is half the EOQ (plus safety stock, which is usually constant and therefore does not change the optimum).</p>' +
      '<code class="eoq-math">Holding cost = (EOQ / 2) &times; H = (' + num(d.eoq, 2) + ' / 2) &times; ' + money(d.H) + ' = <b>' + money(d.holdCost) + '</b></code></li>' +
      '<li><h4>Total annual inventory cost</h4>' +
      '<code class="eoq-math">Total = ' + money(d.orderCost) + ' + ' + money(d.holdCost) + ' = <b>' + money(d.total) + '</b></code></li>' +
      '<li><h4>When to reorder</h4>' +
      '<p>Daily demand is ' + num(d.daily, 2) + ' units. Multiply by the lead time and add the safety stock to get the reorder point.</p>' +
      '<code class="eoq-math">Reorder point = (' + num(d.daily, 2) + ' &times; ' + num(d.lead, 0) + ') + ' + num(d.safety, 0) + ' = <b>' + num(d.rop, 1) + ' units</b></code></li>' +
      '</ol>' +
      '<p class="eoq-note">' + unitNote + '</p>' +
      '</div>' +

      '<div class="eoq-card" style="margin-top:1.25rem">' +
      '<h3 class="eoq-title"><i class="fa-solid fa-table"></i> How much does being "near" the EOQ cost?</h3>' +
      '<p style="color:var(--muted);font-size:.9rem;margin:0 0 .8rem">EOQ is a minimum, not a cliff - small deviations cost very little. Here is the annual inventory cost at different order sizes.</p>' +
      '<div class="eoq-table-wrap"><table class="eoq-table"><thead><tr><th>Order quantity</th><th>Annual cost</th><th>Extra cost vs EOQ</th><th>Overhead</th></tr></thead><tbody>' + tableRows + '</tbody></table></div>' +
      '</div>';

    summary = [
      'EOQ result',
      'Economic order quantity: ' + num(d.eoq, 2) + ' units (order about ' + num(orderQty, 0) + ' units)',
      'Orders per year: ' + num(d.orders, 2),
      'Days between orders: ' + num(d.cycle, 1),
      'Annual ordering cost: ' + money(d.orderCost),
      'Annual holding cost: ' + money(d.holdCost),
      'Total annual inventory cost: ' + money(d.total),
      'Reorder point: ' + num(d.rop, 1) + ' units',
      'Max stock level: ' + num(d.maxLevel, 0) + ' units'
    ].join('\\n');

    if (proc) proc.textContent = 'Calculated in ' + (performance.now() - t0).toFixed(1) + ' ms - inside your browser. 0 bytes uploaded.';
  }

  function showEmpty() {
    root.innerHTML = '<div class="eoq-card eoq-empty"><i class="fa-solid fa-boxes-stacked"></i>Enter your inventory numbers to see the EOQ, the cost curve and a full step-by-step breakdown.</div>';
    summary = '';
    if (proc) proc.textContent = 'Ready - calculations happen in this tab.';
  }

  var timer;
  var live = function () { clearTimeout(timer); timer = setTimeout(render, 160); };
  Object.keys(F).forEach(function (k) { F[k].addEventListener('input', live); });
  cur.addEventListener('change', render);
  document.getElementById('eoqGo').addEventListener('click', render);

  document.getElementById('eoqSample').addEventListener('click', function () {
    Object.keys(DEFAULTS).forEach(function (k) { F[k].value = DEFAULTS[k]; });
    cur.value = 'USD';
    document.querySelectorAll('.eoq-field').forEach(function (f) {
      f.classList.remove('invalid');
      var e = f.querySelector('.eoq-error');
      if (e) e.textContent = '';
    });
    render();
  });
  document.getElementById('eoqClear').addEventListener('click', function () {
    Object.keys(F).forEach(function (k) { F[k].value = ''; });
    document.querySelectorAll('.eoq-field').forEach(function (f) {
      f.classList.remove('invalid');
      var e = f.querySelector('.eoq-error');
      if (e) e.textContent = '';
    });
    showEmpty();
  });
  document.getElementById('eoqCopy').addEventListener('click', function () {
    if (!summary) { if (proc) proc.textContent = 'Nothing to copy yet - fill the form in first.'; return; }
    var done = function () { if (proc) proc.textContent = 'Copied to clipboard - the bytes never left your device.'; };
    if (window.Troolify && window.Troolify.copyToClipboard) window.Troolify.copyToClipboard(summary, done);
    else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(summary).then(done, done);
    else done();
  });

  render();
})();
`;

/* -------------------------------------------------------------- ARTICLE --- */
const ARTICLE = {
  title: 'Economic Order Quantity (EOQ): Theory and Application',
  lead: '<p>The <strong>Economic Order Quantity (EOQ)</strong> model answers one question better than any other in inventory management: <em>how many units should you buy each time you place an order?</em> Order too little and you pay a fortune in purchase-order admin and emergency freight. Order too much and your cash disappears into a warehouse. EOQ finds the single order size where those two costs balance, so your total inventory cost lands at its lowest possible point. This guide explains the theory behind the model, how the formula is derived, and how to apply it to real purchasing decisions.</p>',
  sections: [
    {
      id: 'theory', icon: 'fa-solid fa-book-open', toc: 'EOQ theory and application',
      heading: 'Economic Order Quantity (EOQ): Theory and Application',
      html: '<p>Inventory carries two competing costs. Each time you raise a purchase order you pay a <strong>ordering cost</strong> - the time and money spent raising it, obtaining approval, negotiating, receiving and inspecting. Every unit that sits in your warehouse meanwhile costs you a <strong>holding cost</strong>: the rent and utilities per square foot, insurance, financing the money that is tied up in stock, and the slow erosion of value through spoilage, damage or obsolescence.</p>' +
        '<p>Order in small batches and the ordering cost soars. Order in large batches and the holding cost soars. The Economic Order Quantity model sits precisely at the balance point between the two, and it does so with a single formula:</p>' +
        '<p style="text-align:center;font-size:1.15rem;margin:1.2rem 0"><strong>EOQ = &radic;(2DS / H)</strong></p>' +
        '<p>where <strong>D</strong> is annual demand in units, <strong>S</strong> is the cost of raising one order, and <strong>H</strong> is the cost of holding one unit for one year. Square-root relationships are the signature of EOQ: because demand, ordering cost and holding cost all sit inside a square root, the model is forgiving of imperfect inputs. Doubling your estimated ordering cost changes the EOQ by only about 41%, and halving it changes the EOQ by only about 29%. In practice that robustness is what makes EOQ so widely trusted.</p>' +
        '<h3>Where the formula comes from</h3>' +
        '<p>The derivation is short and worth understanding, because it explains every assumption baked into the result. If you order a quantity <em>Q</em> each time:</p>' +
        '<ul><li>The number of orders you place per year is <strong>D / Q</strong>, so your annual ordering cost is <strong>(D / Q) &times; S</strong>. This falls as <em>Q</em> rises.</li>' +
        '<li>Stock drains from <em>Q</em> down to zero on average, so your average holding is <strong>Q / 2</strong> units and your annual holding cost is <strong>(Q / 2) &times; H</strong>. This rises as <em>Q</em> rises.</li></ul>' +
        '<p>Adding the two gives total annual inventory cost <strong>TC(Q) = (D/Q)S + (Q/2)H</strong>. The EOQ is the point where the derivative of that expression is zero, which gives <strong>Q* = &radic;(2DS / H)</strong>. At that quantity the ordering cost and the holding cost are <em>exactly equal</em> - a useful sanity check you can apply to any EOQ result, and one this calculator displays for you.</p>' +
        '<h3>What EOQ assumes</h3>' +
        '<p>EOQ is a model, and it earns its keep by being simple rather than exhaustive. It assumes demand is steady and known, lead times are constant, and quantity discounts do not apply. It ignores stock-out penalties, production set-up times, and the reality that suppliers quote a minimum order quantity. Where those matter you adjust rather than abandon: order in multiples of the supplier&rsquo;s pack size, add a safety-stock buffer, and treat the output as a strong starting point to be validated against real purchase-order history rather than an instruction to be obeyed blindly.</p>' +
        '<h3>Applying EOQ in practice</h3>' +
        '<p>Estimate <em>D</em> from last year&rsquo;s actual issues or sales, not from a forecast. Estimate <em>S</em> as the full cost of one order - staff time, freight, receiving, inspection - not just the cost of the purchase order itself, because underestimating <em>S</em> is the single most common error and it pushes the EOQ too low. Estimate <em>H</em> as a percentage of unit value (commonly 18-25% of unit cost per year) if you do not have a hard number. Then run the EOQ, round it to something you can actually order, and compare the modelled saving against your current practice. This calculator also reports the reorder point, the maximum stock level and how sensitive the cost is to being near - but not exactly at - the optimum.</p>'
    },
    {
      id: 'how-it-works', icon: 'fa-solid fa-gears', toc: 'How EOQ works',
      heading: 'How Economic Order Quantity (EOQ) Works',
      html: '<p>Once you have an EOQ, four numbers let you run the whole cycle: the order quantity itself, the reorder point, the cycle length and the maximum stock level. Here is the working, step by step.</p>' +
        '<h3>1. Order the EOQ</h3>' +
        '<p>Place each purchase order for the calculated EOQ quantity. Round to the nearest practical figure - a full pallet, a full case, or the supplier&rsquo;s minimum order quantity.</p>' +
        '<h3>2. Find the reorder point</h3>' +
        '<p>You cannot reorder when stock runs out, because you still have to wait out the lead time. The reorder point is the stock level that triggers the next order:</p>' +
        '<p style="text-align:center;margin:1rem 0"><strong>Reorder point = (Daily demand &times; Lead time in days) + Safety stock</strong></p>' +
        '<p>Daily demand is annual demand divided by your working days. Safety stock is the buffer that protects you against demand spikes and late deliveries. With the numbers in this calculator - 12,000 units a year, 250 working days, a 7-day lead time and 200 units of safety stock - you reorder when stock falls to 536 units.</p>' +
        '<h3>3. Work out the cycle length</h3>' +
        '<p>The cycle length is how long one order lasts before you need the next one:</p>' +
        '<p style="text-align:center;margin:1rem 0"><strong>Cycle length (days) = Working days &divide; Orders per year</strong></p>' +
        '<p>With an EOQ of 400 units against 12,000 units of annual demand you raise 30 orders a year, so each order covers roughly 8.3 working days of stock. Set your review calendar to match that cadence.</p>' +
        '<h3>4. Set the maximum stock level</h3>' +
        '<p>The maximum stock level is the highest point in the cycle - it is what you hold immediately after a delivery arrives:</p>' +
        '<p style="text-align:center;margin:1rem 0"><strong>Max stock level = EOQ + Safety stock</strong></p>' +
        '<h3>5. Check the cost</h3>' +
        '<p>Total annual inventory cost is the ordering cost plus the holding cost. At the EOQ these two are equal, so each is half the total - a quick check that your inputs are sane. The curve is flat near the minimum: in the sensitivity table below, ordering 25% more or less than the EOQ changes the annual cost by well under 1%, so an EOQ rounded to a practical number costs you almost nothing.</p>' +
        '<h3>6. Re-run it when the business changes</h3>' +
        '<p>EOQ is a snapshot. Demand that grows, an inflation-driven rise in holding costs, or a supplier move to smaller minimum orders all shift the answer. Re-run the model each planning cycle and compare it with actual purchase orders - if your real ordering cost is higher than you assumed, the EOQ should be lower than you currently order.</p>'
    }
  ],
  steps: [
    'Enter the annual demand in units - use last year&rsquo;s actual sales or issues where you can.',
    'Enter the cost of raising one purchase order (staff time, freight, receiving and inspection).',
    'Enter the yearly holding cost per unit (storage, insurance, financing and obsolescence).',
    'Optionally add the purchase price per unit to see the total annual spend.',
    'Add the supplier lead time, your safety stock and your working days per year.',
    'Compare the EOQ with your current order quantity to see the annual saving, then place orders at the reorder point.'
  ],
  facts: [
    ['Core formula', 'EOQ = &radic;(2DS / H)'],
    ['Optimal order size', 'Where ordering cost = holding cost'],
    ['Reorder point', 'Daily demand &times; lead time + safety stock'],
    ['Cycle length', 'Working days &divide; orders per year'],
    ['Maximum stock', 'EOQ + safety stock'],
    ['Data handling', '100% client-side, nothing uploaded']
  ],
  useCases: [
    ['Procurement teams', 'Size recurring purchase orders for fast-moving consumables so admin cost and warehouse space are both minimised.'],
    ['Warehousing and logistics', 'Set reorder points and cycle cadences that keep service levels high without tying up cash in excess stock.'],
    ['Manufacturing', 'Balance raw material batches against setup and changeover cost when production runs are repeatable.'],
    ['Small business and e-commerce', 'Work out how much to buy per supplier order when cash flow is tight and storage space is limited.']
  ],
  tips: [
    'Include freight, receiving and inspection in the ordering cost - excluding them is the most common cause of an EOQ that is too low.',
    'Estimate holding cost as 18-25% of unit value per year when you have no hard number.',
    'Use real demand history rather than a forecast; EOQ is only as good as D.',
    'Round the EOQ up to a practical order size, then check the sensitivity table - small deviations cost very little.',
    'Re-run the model whenever demand, supplier terms or storage costs change materially.'
  ],
  takeaways: [
    'EOQ balances ordering cost against holding cost by taking the square root of 2DS/H.',
    'At the optimum, ordering cost and holding cost are exactly equal.',
    'The reorder point is where you place the next order - not where stock runs out.',
    'The cost curve is flat near the optimum, so a practical rounded order size costs almost nothing.',
    'EOQ is a strong starting point that still needs validating against real purchase orders.'
  ],
  faq: [
    ['What does EOQ stand for?', 'Economic Order Quantity - the order size that minimises the total annual cost of ordering and holding stock.'],
    ['How do I calculate EOQ?', 'Use EOQ = &radic;(2DS / H): D is annual demand in units, S is the cost of one order, and H is the annual holding cost per unit.'],
    ['What is the difference between EOQ and the reorder point?', 'The EOQ is how many units to buy each time; the reorder point is the stock level that triggers the next order (daily demand &times; lead time + safety stock).'],
    ['Should I order exactly the EOQ?', 'Usually not exactly - round up to a pack, case or supplier minimum. The cost curve is flat near the optimum, so a practical quantity is nearly as good.'],
    ['What if my demand changes through the year?', 'EOQ assumes steady demand. Run it on an average or on seasonal profiles, and re-run it as demand changes.'],
    ['Does EOQ account for quantity discounts?', 'No - the basic model assumes a constant unit price. With discounts, compare the total cost at each price break rather than the EOQ alone.'],
    ['Is my data sent anywhere?', 'No. Every calculation runs in your browser and nothing is uploaded or stored.'],
    ['What is a good holding cost percentage?', 'Most businesses land between 18% and 25% of unit value per year, depending on storage cost, insurance and financing.']
  ],
  conclusion: '<p>EOQ gives you a defensible order size instead of a guess, and it takes two minutes to run. Pair it with the <a href="compound-interest-calculator.html">compound interest calculator</a> to see what releasing the cash trapped in excess stock is worth, or with the <a href="vat-calculator.html">VAT calculator</a> to check the tax position on a purchase order. For the full list of money tools, browse the <a href="./">finance category</a>.</p>'
};

/* ---------------------------------------------------------------- SPEC --- */
const spec = {
  file: 'eoq-calculator.html',
  folder: 'finance',
  name: 'EOQ Calculator',
  title: 'EOQ Calculator - Economic Order Quantity Calculator (Free)',
  tag: 'Inventory',
  icon: 'fa-solid fa-boxes-stacked',
  subApp: 'Business Calculator',
  badge: '100% client-side &middot; zero data retention',
  metaDesc: 'Free EOQ calculator: find the economic order quantity, reorder point, cycle length and annual ordering and holding costs from demand, order cost and holding cost. 100% client-side.',
  desc: 'Find the order size that minimises your total inventory cost. Enter annual demand, the cost of one order and the yearly cost of holding a unit - then get the EOQ, the reorder point, the cycle length and a full cost breakdown.',
  keywords: ['eoq calculator', 'economic order quantity', 'inventory calculator', 'reorder point', 'inventory management', 'ordering cost', 'holding cost', 'stock order quantity'],
  featureList: [
    'Calculate the economic order quantity (EOQ)',
    'Reorder point with safety stock and lead time',
    'Cycle length and orders per year',
    'Annual ordering and holding cost breakdown',
    'Total cost curve chart with the EOQ minimum marked',
    'Cost sensitivity table around the optimum',
    'Compare against your current order quantity',
    'Six working currencies',
    '100% client-side processing'
  ],
  css: CSS,
  panel: '<div class="panel clean eoq-panel"><div class="panel-inner">' +
    '<div class="toolbar-row"><span class="tool-label"><i class="fa-solid fa-boxes-stacked"></i>EOQ inputs</span>' +
    '<div class="toolbar-actions">' +
    '<button class="chip-btn" type="button" id="eoqSample"><i class="fa-solid fa-wand-magic-sparkles"></i><span class="hide-sm">Sample</span></button> ' +
    '<button class="chip-btn" type="button" id="eoqClear"><i class="fa-solid fa-eraser"></i><span class="hide-sm">Clear</span></button>' +
    '</div></div>' + PANEL_HTML +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="eoqProc">Ready - calculations happen in this tab.</span></p>' +
    '</div></div>',
  js: JS,
  article: ARTICLE
};

/* --------------------------------------------------------------- EMIT --- */
const html = buildPage(spec);
const outPath = path.join(ROOT, 'tools', spec.folder, spec.file);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');
console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');

const res = registerTools([{
  name: spec.name,
  desc: 'Find the economic order quantity, reorder point and cycle length that minimise your total ordering and holding cost.',
  icon: spec.icon,
  tag: spec.tag,
  category: (CATMAP[spec.folder] || {}).folder || spec.folder,
  href: 'tools/' + spec.folder + '/' + spec.file,
  keywords: spec.keywords,
  recent: true,
  workflow: ['tools/finance/compound-interest-calculator.html']
}]);
console.log('registry: added', res.added, 'skipped', res.skipped);
