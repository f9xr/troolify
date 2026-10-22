<div class="cic" id="cic">
  <div class="cic-card">
    <div class="cic-header">
      <div class="cic-logo"><i class="fa-solid fa-chart-line"></i></div>
      <div>
        <h2>Compound Interest Calculator</h2>
        <p>See how your money can grow, and exactly how we worked it out.</p>
      </div>
    </div>

    <div class="cic-grid">
      <!-- INPUTS -->
      <form class="cic-card" id="cic-form" novalidate style="border-color: var(--line)">
        <h3 class="cic-title"><i class="fa-solid fa-sliders"></i> Your Investment</h3>

        <div class="cic-field">
          <label for="cic-currency"><i class="fa-solid fa-coins"></i> Currency</label>
          <select id="cic-currency">
            <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option>
            <option value="AUD">AUD (A$)</option><option value="CAD">CAD (C$)</option>
          </select>
        </div>

        <div class="cic-field">
          <label for="cic-principal"><i class="fa-solid fa-wallet"></i> Initial Investment</label>
          <input type="number" id="cic-principal" inputmode="decimal" min="0" step="any">
          <div class="cic-error"></div>
        </div>

        <div class="cic-row">
          <div class="cic-field">
            <label for="cic-contrib"><i class="fa-solid fa-piggy-bank"></i> Contribution</label>
            <input type="number" id="cic-contrib" inputmode="decimal" min="0" step="any">
            <div class="cic-error"></div>
          </div>
          <div class="cic-field">
            <label for="cic-cfreq"><i class="fa-solid fa-calendar-plus"></i> Added</label>
            <select id="cic-cfreq">
              <option value="1">Monthly</option><option value="3">Quarterly</option><option value="12">Annually</option>
            </select>
          </div>
        </div>

        <div class="cic-field">
          <label for="cic-timing"><i class="fa-solid fa-clock"></i> Contribution Timing</label>
          <select id="cic-timing">
            <option value="end">End of each period</option>
            <option value="start">Start of each period</option>
          </select>
        </div>

        <div class="cic-row">
          <div class="cic-field">
            <label for="cic-rate"><i class="fa-solid fa-percent"></i> Annual Rate (%)</label>
            <input type="number" id="cic-rate" inputmode="decimal" min="0" max="100" step="any">
            <div class="cic-error"></div>
          </div>
          <div class="cic-field">
            <label for="cic-comp"><i class="fa-solid fa-rotate"></i> Compounding</label>
            <select id="cic-comp">
              <option value="365">Daily</option>
              <option value="12">Monthly</option>
              <option value="4">Quarterly</option>
              <option value="2">Semi-annually</option>
              <option value="1">Annually</option>
            </select>
          </div>
        </div>

        <div class="cic-row">
          <div class="cic-field">
            <label for="cic-years"><i class="fa-solid fa-hourglass-half"></i> Years</label>
            <input type="number" id="cic-years" inputmode="numeric" min="1" max="100" step="1">
            <div class="cic-error"></div>
          </div>
          <div class="cic-field">
            <label for="cic-infl"><i class="fa-solid fa-arrow-trend-up"></i> Inflation (%)</label>
            <input type="number" id="cic-infl" inputmode="decimal" min="0" max="50" step="any">
            <div class="cic-error"></div>
          </div>
        </div>

        <div class="cic-actions">
          <button type="button" class="cic-btn primary" id="cic-calc"><i class="fa-solid fa-calculator"></i> Calculate</button>
          <button type="button" class="cic-btn ghost" id="cic-reset"><i class="fa-solid fa-rotate-left"></i> Reset</button>
          <button type="button" class="cic-btn ghost" id="cic-clear"><i class="fa-solid fa-eraser"></i> Clear</button>
          <button type="button" class="cic-btn ghost" id="cic-copy"><i class="fa-solid fa-copy"></i> Copy result</button>
        </div>
      </form>

      <!-- RESULTS -->
      <div id="cic-results" aria-live="polite"></div>
    </div>
  </div>

  <!-- GUIDE -->
  <div class="cic-card cic-section cic-guide">
    <h3 class="cic-title"><i class="fa-solid fa-book-open"></i> User Guide</h3>

    <details open>
      <summary><i class="fa-solid fa-circle-question"></i> What is compound interest?</summary>
      <div>Compound interest is interest earned on your original money <em>and</em> on the interest it has already earned. The longer you stay invested, the faster your balance grows.</div>
    </details>
    <details>
      <summary><i class="fa-solid fa-pen-to-square"></i> How to use this tool</summary>
      <div><ul>
        <li><b>Initial Investment:</b> the amount you start with.</li>
        <li><b>Contribution:</b> money you add regularly, and how often. Choose whether it's added at the start or end of each period.</li>
        <li><b>Annual Rate:</b> the yearly return you expect, before inflation.</li>
        <li><b>Compounding:</b> how often interest is added to your balance.</li>
        <li><b>Years:</b> how long the money stays invested (1–100).</li>
        <li><b>Inflation:</b> used to show what the future amount would be worth in today's money.</li>
        <li>Results update automatically as you type. <b>Reset</b> restores the example values; <b>Clear</b> empties every field; <b>Copy result</b> puts the figures on your clipboard.</li>
      </ul></div>
    </details>
    <details>
      <summary><i class="fa-solid fa-chart-pie"></i> Understanding your results</summary>
      <div><ul>
        <li><b>Future Value:</b> your total balance at the end (the highlighted box).</li>
        <li><b>Total Contributed:</b> everything you put in yourself.</li>
        <li><b>Interest Earned:</b> the growth generated by compounding.</li>
        <li><b>Real Value:</b> the future value adjusted for inflation, which shows its purchasing power in today's money.</li>
        <li>In the chart, blue is your own money and pale blue is interest. Hover over a bar for that year's numbers.</li>
      </ul></div>
    </details>
    <details>
      <summary><i class="fa-solid fa-square-root-variable"></i> The formulas we use</summary>
      <div>
        <ul>
          <li>Monthly equivalent rate: <code>i = (1 + r/n)^(n/12) − 1</code></li>
          <li>Principal growth: <code>P × (1 + i)^(12 × years)</code></li>
          <li>Contributions (end of period): <code>PMT × ((1 + j)^M − 1) / j</code>, where <code>j = (1 + i)^k − 1</code>, <code>k</code> = months between deposits and <code>M</code> = number of deposits. For start-of-period deposits, multiply by <code>(1 + j)</code>.</li>
          <li>Real value: <code>Future Value / (1 + inflation)^years</code></li>
        </ul>
        Converting everything to a monthly rate lets any compounding frequency work with any contribution frequency accurately.
      </div>
    </details>
    <details>
      <summary><i class="fa-solid fa-lightbulb"></i> Tips</summary>
      <div><ul>
        <li>Starting early matters more than starting big.</li>
        <li>Small, regular contributions add up dramatically over decades.</li>
        <li>Compare your result against the inflation-adjusted value for a realistic picture.</li>
        <li>This is an estimate. Real returns vary, and fees and taxes are not included. It is not financial advice.</li>
      </ul></div>
    </details>
  </div>
</div>
