(function () {
  const root = document.getElementById('cic');
  if (!root) return;
  const $ = (id) => root.querySelector('#' + id);
  const out = $('cic-results');
  const proc = document.getElementById('ciProc');

  const DEFAULTS = { principal: 10000, contrib: 200, cfreq: '1', timing: 'end', rate: 7, comp: '12', years: 20, infl: 2.5 };
  const fields = {
    principal: $('cic-principal'), contrib: $('cic-contrib'), cfreq: $('cic-cfreq'), timing: $('cic-timing'),
    rate: $('cic-rate'), comp: $('cic-comp'), years: $('cic-years'), infl: $('cic-infl')
  };
  const currencySel = $('cic-currency');

  const money = (v, dec = 2) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: currencySel.value, minimumFractionDigits: dec, maximumFractionDigits: dec
  }).format(v);
  const pct = (v, d = 4) => (v * 100).toFixed(d).replace(/\.?0+$/, '') + '%';
  const num = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(v);

  function setDefaults() { Object.keys(DEFAULTS).forEach(k => fields[k].value = DEFAULTS[k]); }

  /* ---------- Validation ---------- */
  const rules = {
    principal: { min: 0, max: 1e12, label: 'Initial investment' },
    contrib:   { min: 0, max: 1e12, label: 'Contribution' },
    rate:      { min: 0, max: 100,  label: 'Rate' },
    years:     { min: 1, max: 100,  label: 'Years', integer: true },
    infl:      { min: 0, max: 50,   label: 'Inflation' }
  };
  function validate() {
    let ok = true;
    Object.keys(rules).forEach(k => {
      const r = rules[k], el = fields[k], wrap = el.closest('.cic-field'), err = wrap.querySelector('.cic-error');
      const raw = el.value.trim(); const v = parseFloat(raw);
      let msg = '';
      if (raw === '' || !isFinite(v)) msg = 'Please enter a number.';
      else if (v < r.min || v > r.max) msg = `${r.label} must be between ${r.min} and ${r.max}.`;
      else if (r.integer && !Number.isInteger(v)) msg = 'Please enter a whole number.';
      wrap.classList.toggle('invalid', !!msg);
      err.textContent = msg;
      if (msg) ok = false;
    });
    return ok;
  }

  /* ---------- Calculation ---------- */
  function calculate() {
    const P = parseFloat(fields.principal.value), C = parseFloat(fields.contrib.value);
    const k = parseInt(fields.cfreq.value, 10), n = parseInt(fields.comp.value, 10);
    const r = parseFloat(fields.rate.value) / 100, infl = parseFloat(fields.infl.value) / 100;
    const years = parseInt(fields.years.value, 10), start = fields.timing.value === 'start';

    const i = Math.pow(1 + r / n, n / 12) - 1;       // monthly equivalent rate
    const N = years * 12;
    const rows = [];
    let bal = P, contributed = P;

    for (let m = 1; m <= N; m++) {
      if (start && (m - 1) % k === 0) { bal += C; contributed += C; }
      bal *= 1 + i;
      if (!start && m % k === 0) { bal += C; contributed += C; }
      if (m % 12 === 0) {
        const y = m / 12;
        rows.push({ year: y, balance: bal, contributed, interest: bal - contributed, real: bal / Math.pow(1 + infl, y) });
      }
    }

    // Closed-form pieces for the explanation
    const principalFV = P * Math.pow(1 + i, N);
    const j = Math.pow(1 + i, k) - 1;
    const M = N / k;
    let contribFV = j === 0 ? C * M : C * (Math.pow(1 + j, M) - 1) / j;
    if (start && j !== 0) contribFV *= (1 + j); else if (start) contribFV = C * M;

    const last = rows[rows.length - 1];
    return { P, C, k, n, r, infl, years, start, i, j, M, N, rows, principalFV, contribFV, final: last.balance,
             contributed: last.contributed, interest: last.interest, real: last.real };
  }

  /* ---------- Rendering ---------- */
  let summary = '';

  function render() {
    const t0 = performance.now();
    if (!validate()) {
      out.innerHTML = `<div class="cic-card cic-empty" style="border-color:var(--line)"><i class="fa-solid fa-triangle-exclamation"></i>Please fix the highlighted fields to see your results.</div>`;
      summary = '';
      if (proc) proc.textContent = 'Waiting for valid input - calculations happen in this tab.';
      return;
    }
    const d = calculate();
    const freqName = { 365: 'daily', 12: 'monthly', 4: 'quarterly', 2: 'semi-annual', 1: 'annual' }[d.n];
    const cName = { 1: 'monthly', 3: 'quarterly', 12: 'annual' }[d.k];
    const growthPct = d.contributed > 0 ? d.interest / d.contributed : 0;
    const maxBal = Math.max(...d.rows.map(r => r.balance)) || 1;

    const bars = d.rows.map(r => {
      const hc = (r.contributed / maxBal) * 100, hi = (r.interest / maxBal) * 100;
      return `<div class="cic-bar" title="Year ${r.year}: ${money(r.balance, 0)} (Contributed ${money(r.contributed, 0)} + Interest ${money(r.interest, 0)})">
        <div class="c" style="height:0" data-h="${hc}"></div><div class="i" style="height:0" data-h="${hi}"></div></div>`;
    }).join('');

    const tableRows = d.rows.map(r => `<tr><td>${r.year}</td><td>${money(r.contributed)}</td><td>${money(r.interest)}</td><td>${money(r.balance)}</td><td>${money(r.real)}</td></tr>`).join('');

    out.innerHTML = `
      <div class="cic-card" style="border-color:var(--line)">
        <div class="cic-hero">
          <small>Future value after ${d.years} year${d.years > 1 ? 's' : ''}</small>
          <div class="cic-big">${money(d.final)}</div>
          <div class="cic-sub">You contributed ${money(d.contributed)} and earned ${money(d.interest)} in interest</div>
          <div class="cic-pill"><i class="fa-solid fa-arrow-trend-up"></i> ${pct(growthPct, 1)} total growth</div>
        </div>

        <div class="cic-stats">
          <div class="cic-stat"><span><i class="fa-solid fa-hand-holding-dollar"></i> Total Contributed</span><strong>${money(d.contributed)}</strong></div>
          <div class="cic-stat"><span><i class="fa-solid fa-seedling"></i> Interest Earned</span><strong>${money(d.interest)}</strong></div>
          <div class="cic-stat"><span><i class="fa-solid fa-scale-balanced"></i> Real Value (today's money)</span><strong>${money(d.real)}</strong></div>
          <div class="cic-stat"><span><i class="fa-solid fa-percent"></i> Effective Annual Rate</span><strong>${pct(Math.pow(1 + d.i, 12) - 1, 3)}</strong></div>
        </div>

        <div class="cic-chart-wrap">
          <h3 class="cic-title"><i class="fa-solid fa-chart-column"></i> Growth Over Time</h3>
          <div class="cic-chart">${bars}</div>
          <div class="cic-axis"><span>Year 1</span><span>Year ${d.years}</span></div>
          <div class="cic-legend"><span class="c">Your contributions</span><span class="i">Interest earned</span></div>
        </div>
      </div>

      <div class="cic-card cic-section" style="border-color:var(--line)">
        <h3 class="cic-title"><i class="fa-solid fa-square-root-variable"></i> How your result was calculated</h3>
        <ol class="cic-steps">
          <li>
            <h4>Convert the rate to a monthly equivalent</h4>
            <p>Your ${pct(d.r, 2)} annual rate compounds ${freqName}, so each period earns ${pct(d.r / d.n, 5)}. We convert that to the equivalent monthly rate.</p>
            <code class="cic-math">i = (1 + ${num(d.r)} / ${d.n})^(${d.n} / 12) − 1 = <b>${pct(d.i, 5)}</b> per month</code>
          </li>
          <li>
            <h4>Grow your initial investment</h4>
            <p>Your starting ${money(d.P)} compounds for ${d.N} months.</p>
            <code class="cic-math">${num(d.P)} × (1 + ${d.i.toFixed(7)})^${d.N} = <b>${money(d.principalFV)}</b></code>
          </li>
          <li>
            <h4>Grow your ${cName} contributions</h4>
            <p>You add ${money(d.C)} ${cName}, at the ${d.start ? 'start' : 'end'} of each period, ${d.M} deposits in total. Each deposit earns interest for the time it stays invested.</p>
            <code class="cic-math">j = (1 + i)^${d.k} − 1 = ${d.j.toFixed(7)}
FV = ${num(d.C)} × ((1 + j)^${d.M} − 1) / j${d.start ? ' × (1 + j)' : ''} = <b>${money(d.contribFV)}</b></code>
          </li>
          <li>
            <h4>Add them together</h4>
            <code class="cic-math">${money(d.principalFV)} + ${money(d.contribFV)} = <b>${money(d.principalFV + d.contribFV)}</b></code>
          </li>
          <li>
            <h4>Separate your money from the interest</h4>
            <p>Total you paid in = ${money(d.P)} initial + ${money(d.C * d.M)} contributions.</p>
            <code class="cic-math">Interest = ${money(d.final)} − ${money(d.contributed)} = <b>${money(d.interest)}</b></code>
          </li>
          <li>
            <h4>Adjust for inflation</h4>
            <p>At ${pct(d.infl, 2)} inflation, money loses purchasing power each year.</p>
            <code class="cic-math">${money(d.final)} / (1 + ${num(d.infl)})^${d.years} = <b>${money(d.real)}</b> in today's money</code>
          </li>
        </ol>
      </div>

      <div class="cic-card cic-section" style="border-color:var(--line)">
        <h3 class="cic-title"><i class="fa-solid fa-table"></i> Year-by-Year Breakdown</h3>
        <div class="cic-table-wrap">
          <table class="cic-table">
            <thead><tr><th>Year</th><th>Contributed</th><th>Interest</th><th>Balance</th><th>Real Value</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;

    summary = [
      'Compound interest projection',
      'Initial investment: ' + money(d.P),
      'Contribution: ' + money(d.C) + ' ' + cName + (d.start ? ' (start of period)' : ' (end of period)'),
      'Annual rate: ' + pct(d.r, 2),
      'Compounding: ' + freqName,
      'Years: ' + d.years,
      'Future value: ' + money(d.final),
      'Total contributed: ' + money(d.contributed),
      'Interest earned: ' + money(d.interest),
      'Real value (today\'s money): ' + money(d.real),
      'Effective annual rate: ' + pct(Math.pow(1 + d.i, 12) - 1, 3)
    ].join('\n');

    if (proc) proc.textContent = 'Calculated in ' + (performance.now() - t0).toFixed(1) + ' ms - inside your browser. 0 bytes uploaded.';

    // animate bars
    requestAnimationFrame(() => requestAnimationFrame(() => {
      out.querySelectorAll('.cic-bar > div').forEach(el => el.style.height = el.dataset.h + '%');
    }));
  }

  function showEmpty() {
    out.innerHTML = `<div class="cic-card cic-empty" style="border-color:var(--line)">
      <i class="fa-solid fa-chart-simple"></i>Enter your investment details to see your results, a chart, and a full step-by-step explanation.</div>`;
    summary = '';
    if (proc) proc.textContent = 'Ready - calculations happen in this tab.';
  }

  /* ---------- Events ---------- */
  let timer;
  const live = () => { clearTimeout(timer); timer = setTimeout(render, 150); };
  Object.values(fields).forEach(el => el.addEventListener('input', live));
  currencySel.addEventListener('change', render);
  $('cic-form').addEventListener('submit', e => e.preventDefault());
  $('cic-calc').addEventListener('click', render);

  $('cic-reset').addEventListener('click', () => {
    setDefaults(); currencySel.value = 'USD';
    root.querySelectorAll('.cic-field').forEach(f => { f.classList.remove('invalid'); const e = f.querySelector('.cic-error'); if (e) e.textContent = ''; });
    render();
  });
  $('cic-clear').addEventListener('click', () => {
    ['principal', 'contrib', 'rate', 'years', 'infl'].forEach(k => fields[k].value = '');
    root.querySelectorAll('.cic-field').forEach(f => { f.classList.remove('invalid'); const e = f.querySelector('.cic-error'); if (e) e.textContent = ''; });
    showEmpty();
  });
  $('cic-copy').addEventListener('click', () => {
    if (!summary) { if (proc) proc.textContent = 'Nothing to copy yet - fill the form in first.'; return; }
    const done = () => { if (proc) proc.textContent = 'Copied to clipboard - the bytes never left your device.'; };
    if (window.Troolify && window.Troolify.copyToClipboard) {
      window.Troolify.copyToClipboard(summary, done);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(done, done);
    } else {
      done();
    }
  });

  setDefaults();
  render();
})();
