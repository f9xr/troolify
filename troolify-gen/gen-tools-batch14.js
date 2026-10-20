/* ============================================================================
   Troolify - batch 14
   Finance calculators migrated from allinonetools.net (client-side feasible).
   Run: node troolify-gen/gen-tools-batch14.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

function currency(n) {
  return 'Rs ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/* ========================================================================
   1. EMI CALCULATOR
   ======================================================================== */
add({
  file: 'emi-calculator.html', folder: 'finance',
  name: 'EMI Calculator', tag: 'Loans', icon: 'fa-solid fa-building-columns',
  title: 'EMI Calculator | Loan EMI, Interest & Amortisation',
  metaDesc: 'Calculate your monthly loan EMI, total interest and total payment for home, car or personal loans. Includes a full amortisation schedule. 100% client-side.',
  desc: 'Work out the monthly EMI for any loan from principal, interest rate and tenure, plus total interest and a year-by-year amortisation schedule.',
  keywords: ['emi calculator', 'loan emi', 'equated monthly instalment', 'home loan emi', 'car loan emi', 'personal loan emi', 'amortisation schedule', 'loan interest calculator'],
  featureList: ['Monthly EMI', 'Total interest payable', 'Total payment', 'Full amortisation schedule', '100% client-side'],
  panel: panel.wrap('emi', 'fa-solid fa-building-columns', 'EMI calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="emiP">Loan amount</label><input id="emiP"type="number"min="0"step="1000"value="500000"></div>' +
    '<div class="field"><label for="emiR">Annual interest rate (%)</label><input id="emiR"type="number"min="0"step="0.01"value="9"></div>' +
    '<div class="field"><label for="emiN">Tenure (years)</label><input id="emiN"type="number"min="1"step="1"value="5"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Monthly EMI</div><div class="rt-value"id="emiEmi">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total interest</div><div class="rt-value"id="emiInt">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total payment</div><div class="rt-value"id="emiTot">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="emiGo"><i class="fa-solid fa-calculator"></i>Calculate</button>' +
    '<button class="rt-btn"type="button"id="emiCopy"><i class="fa-solid fa-copy"></i>Copy schedule</button></div>' +
    '<div id="emiSched"style="margin-top:10px;max-height:280px;overflow:auto"></div>'),
  css: '#emiSched table{width:100%;border-collapse:collapse;font-size:12.5px}#emiSched th,#emiSched td{border:1px solid var(--border);padding:6px 8px;text-align:right}#emiSched th{background:rgba(255,255,255,.04);text-align:right}',
  js: `
    var P=document.getElementById("emiP"),R=document.getElementById("emiR"),N=document.getElementById("emiN");
    var outEmi=document.getElementById("emiEmi"),outInt=document.getElementById("emiInt"),outTot=document.getElementById("emiTot");
    var sched=document.getElementById("emiSched"),proc=document.getElementById("emiProc");
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var p=+P.value,r=(+R.value)/12/100,n=(+N.value)*12;
      if(!(p>0)||n<=0){return;}
      var emi=r>0?p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):p/n;
      var total=emi*n,interest=total-p;
      outEmi.textContent=fmt(emi);outInt.textContent=fmt(interest);outTot.textContent=fmt(total);
      var bal=p,rows="<table><thead><tr><th>Year</th><th>Principal paid</th><th>Interest paid</th><th>Balance</th></tr></thead><tbody>";
      var years=Math.ceil(n/12),pay=0,iy=0;
      for(var y=1;y<=years;y++){var py=0,iny=0;
        for(var m=0;m<12&&pay<n;m++,pay++){var intp=bal*r,prin=emi-intp;if(prin>bal)prin=bal;bal-=prin;py+=prin;iny+=intp;}
        rows+="<tr><td>"+y+"</td><td>"+fmt(py)+"</td><td>"+fmt(iny)+"</td><td>"+fmt(Math.max(0,bal))+"</td></tr>";}
      rows+="</tbody></table>";sched.innerHTML=rows;
      proc.textContent="Calculated in this tab - 0 bytes uploaded.";}
    [P,R,N].forEach(function(e){e.addEventListener("input",run)});
    document.getElementById("emiGo").addEventListener("click",run);
    var _s="";document.getElementById("emiCopy").addEventListener("click",function(){var t=sched.innerText;if(navigator.clipboard)navigator.clipboard.writeText(t);proc.textContent="Amortisation schedule copied.";});
    run();`,
  cssExtra: '',
  article: {
    title: 'EMI Calculator: Know Your Monthly Loan Payment Before You Borrow',
    lead: '<p>An equated monthly instalment (EMI) is the fixed amount you repay every month on a loan. This <strong>EMI calculator</strong> turns a principal, an annual interest rate and a tenure into your monthly payment, the total interest you will pay, and a year-by-year amortisation schedule.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'How EMI is calculated', html: '<p>For a reducing-balance loan the EMI is <code>P x r x (1+r)^n / ((1+r)^n - 1)</code>, where <code>P</code> is the principal, <code>r</code> is the monthly interest rate (annual rate divided by 12) and <code>n</code> is the number of monthly instalments. Early instalments are mostly interest; later ones are mostly principal, which is why the amortisation schedule is useful for seeing how the balance falls.</p>' },
      { id: 'reading', icon: 'fa-solid fa-chart-line', heading: 'Reading the total interest', html: '<p>Total interest is the EMI multiplied by the number of months, minus the principal. Stretching the tenure lowers the EMI but raises the total interest; shortening it does the opposite. The schedule here groups payments by year so you can compare scenarios at a glance.</p>' }
    ],
    steps: ['Enter the loan amount, annual interest rate and tenure in years.', 'The EMI, total interest and total payment update instantly.', 'Scroll the schedule to see principal and interest split by year.', 'Use Copy schedule to export the table for your records.'],
    facts: [['Formula', 'Reducing-balance EMI'], ['Payment frequency', 'Monthly'], ['Output', 'EMI, interest, total, schedule'], ['Data handling', 'Runs locally, nothing uploaded']],
    useCases: [['Comparing home loans', 'Paste in offers from two banks and see which one costs less over the full term.'], ['Car and personal loans', 'Check that the EMI fits your monthly budget before signing.'], ['Prepayment planning', 'The yearly balance column shows how quickly you could clear a loan.']],
    tips: ['Use the annual rate as quoted, not the monthly rate.', 'Keep the currency consistent across all three inputs.', 'Small rate differences matter more over long tenures than over short ones.'],
    takeaways: ['EMI depends on principal, rate and tenure only.', 'Longer tenure means lower EMI but more interest.', 'The schedule reveals where your money actually goes.'],
    faq: [['Is this reducing-balance or flat-rate EMI?', 'It uses the standard reducing-balance method applied by banks.'], ['Can I use any currency?', 'Yes, the numbers are currency-agnostic; only the display symbol is fixed.'], ['Does it account for prepayments?', 'No, it assumes a fixed EMI for the whole tenure.'], ['Is my data uploaded?', 'No. Everything is calculated in your browser.']],
    conclusion: '<p>Borrow with confidence by knowing the numbers first. Once you have your EMI, check the total with our <a href="simple-interest-calculator.html">simple interest calculator</a> or plan a goal with the <a href="savings-goal-calculator.html">savings goal calculator</a>.</p>'
  }
});

/* ========================================================================
   2. MORTGAGE CALCULATOR
   ======================================================================== */
add({
  file: 'mortgage-calculator.html', folder: 'finance',
  name: 'Mortgage Calculator', tag: 'Loans', icon: 'fa-solid fa-house',
  title: 'Mortgage Calculator | Monthly Home Loan Payment',
  metaDesc: 'Estimate your monthly mortgage payment from loan amount, interest rate, term and down payment. See principal, interest and total cost in your browser.',
  desc: 'Estimate the monthly mortgage payment on a home loan, including down payment, and see the split between principal and interest.',
  keywords: ['mortgage calculator', 'home loan calculator', 'monthly payment', 'down payment', 'amortisation', 'house payment', 'mortgage interest'],
  featureList: ['Monthly payment', 'Down payment handling', 'Total interest', 'Principal vs interest split', '100% client-side'],
  panel: panel.wrap('mtg', 'fa-solid fa-house', 'Mortgage calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="mtgPrice">Home price</label><input id="mtgPrice"type="number"min="0"step="1000"value="3000000"></div>' +
    '<div class="field"><label for="mtgDown">Down payment</label><input id="mtgDown"type="number"min="0"step="1000"value="600000"></div>' +
    '<div class="field"><label for="mtgR">Annual interest rate (%)</label><input id="mtgR"type="number"min="0"step="0.01"value="7.5"></div>' +
    '</div>' +
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="mtgN">Term (years)</label><input id="mtgN"type="number"min="1"step="1"value="20"></div>' +
    '<div class="field"><label for="mtgTax">Annual tax + insurance</label><input id="mtgTax"type="number"min="0"step="100"value="0"></div>' +
    '<div class="field"><label for="mtgHoa">Monthly HOA</label><input id="mtgHoa"type="number"min="0"step="10"value="0"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Loan amount</div><div class="rt-value"id="mtgLoan">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Monthly P&I</div><div class="rt-value"id="mtgPI">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total monthly</div><div class="rt-value"id="mtgTot">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total interest</div><div class="rt-value"id="mtgInt">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="mtgGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    var price=document.getElementById("mtgPrice"),down=document.getElementById("mtgDown"),R=document.getElementById("mtgR"),N=document.getElementById("mtgN"),tax=document.getElementById("mtgTax"),hoa=document.getElementById("mtgHoa");
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var loan=Math.max(0,+price.value-+down.value),r=(+R.value)/12/100,n=(+N.value)*12;
      var pi=r>0?loan*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):loan/n;if(!isFinite(pi))pi=0;
      var monthly=pi+(+tax.value/12)+(+hoa.value);
      document.getElementById("mtgLoan").textContent=fmt(loan);
      document.getElementById("mtgPI").textContent=fmt(pi);
      document.getElementById("mtgTot").textContent=fmt(monthly);
      document.getElementById("mtgInt").textContent=fmt(pi*n-loan);
      document.getElementById("mtgProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["mtgPrice","mtgDown","mtgR","mtgN","mtgTax","mtgHoa"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("mtgGo").addEventListener("click",run);run();`,
  article: {
    title: 'Mortgage Calculator: Estimate Your Monthly Home Payment',
    lead: '<p>Before you commit to a mortgage, you want to know what the monthly payment will be and how taxes, insurance and fees change it. This <strong>mortgage calculator</strong> does the full calculation from home price, down payment, rate and term.</p>',
    sections: [
      { id: 'payment', icon: 'fa-solid fa-receipt', heading: 'What makes up the payment', html: '<p>The principal and interest (P&I) portion follows the standard amortisation formula. On top of that you may pay property tax and insurance, often collected monthly, and any HOA fee. The calculator separates the P&I payment from the total monthly outgoing so you can budget accurately.</p>' },
      { id: 'down', icon: 'fa-solid fa-piggy-bank', heading: 'Why the down payment matters', html: '<p>A larger down payment reduces the loan amount and therefore the interest you pay across the term. It can also lower your rate with some lenders. Change the down payment field and watch the monthly figure move.</p>' }
    ],
    steps: ['Enter the home price and your planned down payment.', 'Set the annual interest rate and the loan term in years.', 'Optionally add annual tax and insurance and any monthly HOA fee.', 'Read the monthly principal and interest, total monthly and lifetime interest.'],
    facts: [['Formula', 'Reducing-balance amortisation'], ['Add-ons', 'Tax, insurance, HOA'], ['Output', 'Monthly and lifetime figures'], ['Data handling', 'Runs locally, nothing uploaded']],
    useCases: [['First-home budgeting', 'See whether a property fits your monthly budget after taxes and insurance.'], ['Offer comparison', 'Compare two homes with different prices and rates side by side.'], ['Down payment planning', 'Test how a bigger deposit lowers the monthly figure.']],
    tips: ['Enter annual tax and insurance as a single yearly amount.', 'Leave HOA at zero if you are not buying in a managed community.', 'Re-run the numbers at a slightly higher rate as a buffer.'],
    takeaways: ['P&I follows the standard amortisation formula.', 'Taxes, insurance and HOA add to the monthly cost.', 'Down payment directly reduces interest over the term.'],
    faq: [['Does it include PMI?', 'No. Add private mortgage insurance into the tax and insurance field if your lender requires it.'], ['Can I model a 15-year term?', 'Yes, change the term field to any number of years.'], ['Is the interest fixed over the term?', 'The calculator assumes a fixed rate throughout.'], ['Are my numbers stored?', 'No, everything stays in your browser.']],
    conclusion: '<p>Get the monthly figure nailed down before you make an offer. Then compare borrowing costs with the <a href="emi-calculator.html">EMI calculator</a>.</p>'
  }
});

/* ========================================================================
   3. LOAN CALCULATOR
   ======================================================================== */
add({
  file: 'loan-calculator.html', folder: 'finance',
  name: 'Loan Calculator', tag: 'Loans', icon: 'fa-solid fa-hand-holding-dollar',
  title: 'Loan Calculator | Payment, Interest & Total Cost',
  metaDesc: 'Calculate payments, total interest and total cost for any fixed-rate loan. Enter amount, rate and term for instant results, all in your browser.',
  desc: 'Compute the periodic payment, total interest and total repayment for any fixed-rate loan, with monthly, quarterly or yearly payment options.',
  keywords: ['loan calculator', 'payment calculator', 'total interest', 'loan cost', 'fixed rate loan', 'repayment calculator'],
  featureList: ['Monthly, quarterly or yearly payments', 'Total interest', 'Total cost', '100% client-side'],
  panel: panel.wrap('ln', 'fa-solid fa-hand-holding-dollar', 'Loan calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="lnP">Loan amount</label><input id="lnP"type="number"min="0"step="1000"value="100000"></div>' +
    '<div class="field"><label for="lnR">Annual interest rate (%)</label><input id="lnR"type="number"min="0"step="0.01"value="10"></div>' +
    '<div class="field"><label for="lnN">Term (years)</label><input id="lnN"type="number"min="1"step="1"value="3"></div>' +
    '</div>' +
    panel.dirSelect('ln', [['12', 'Monthly'], ['4', 'Quarterly'], ['1', 'Yearly']]) +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Payment per period</div><div class="rt-value"id="lnPay">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total interest</div><div class="rt-value"id="lnInt">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total repayment</div><div class="rt-value"id="lnTot">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="lnGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    var P=document.getElementById("lnP"),R=document.getElementById("lnR"),N=document.getElementById("lnN"),D=document.getElementById("lnDir");
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var per=+D.value,n=(+N.value)*per,r=(+R.value)/100/per;
      var p=+P.value;
      var pay=r>0?p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):p/n;if(!isFinite(pay))pay=0;
      document.getElementById("lnPay").textContent=fmt(pay);
      document.getElementById("lnInt").textContent=fmt(pay*n-p);
      document.getElementById("lnTot").textContent=fmt(pay*n);
      document.getElementById("lnProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["lnP","lnR","lnN","lnDir"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("lnGo").addEventListener("click",run);run();`,
  article: {
    title: 'Loan Calculator: The True Cost of Borrowing',
    lead: '<p>Whatever you are financing, the key questions are the same: what is the periodic payment, and how much interest will you pay in total? This <strong>loan calculator</strong> answers both for any fixed-rate loan.</p>',
    sections: [
      { id: 'periods', icon: 'fa-solid fa-calendar', heading: 'Choosing a payment frequency', html: '<p>Switch between monthly, quarterly and yearly payments to match your lender. More frequent payments reduce total interest slightly because you pay down the balance sooner.</p>' },
      { id: 'cost', icon: 'fa-solid fa-coins', heading: 'Total cost at a glance', html: '<p>The total repayment is the periodic payment multiplied by the number of periods. Subtract the principal and you have the interest you will pay for the privilege of borrowing.</p>' }
    ],
    steps: ['Enter the loan amount, annual rate and term in years.', 'Pick the payment frequency.', 'Read the payment per period, total interest and total repayment.'],
    facts: [['Formula', 'Amortising loan payment'], ['Frequencies', 'Monthly, quarterly, yearly'], ['Output', 'Payment, interest, total'], ['Data handling', 'Runs locally']],
    useCases: [['Auto loans', 'Check the monthly hit on your budget.'], ['Business financing', 'See the lifetime cost of equipment loans.'], ['Debt planning', 'Compare a shorter, higher payment against a longer, cheaper one.']],
    tips: ['Keep the rate annual; the tool divides it for you.', 'A shorter term nearly always lowers total interest.', 'Round figures are fine for planning.'],
    takeaways: ['Payment frequency changes total interest slightly.', 'Total repayment minus principal equals interest.', 'The tool handles any fixed-rate loan.'],
    faq: [['Does it support balloon payments?', 'No, payments are assumed equal across the term.'], ['Can I use a variable rate?', 'Enter an average rate for an estimate.'], ['Is the calculation exact?', 'Yes, it uses the standard amortisation formula.'], ['Is my input uploaded?', 'No, it runs in your browser.']],
    conclusion: '<p>Know the cost before you sign. Pair this with the <a href="emi-calculator.html">EMI calculator</a> for a full amortisation view.</p>'
  }
});

/* ========================================================================
   4. PPF CALCULATOR
   ======================================================================== */
add({
  file: 'ppf-calculator.html', folder: 'finance',
  name: 'PPF Calculator', tag: 'Savings', icon: 'fa-solid fa-piggy-bank',
  title: 'PPF Calculator | Public Provident Fund Maturity',
  metaDesc: 'Estimate PPF maturity value from yearly deposits, interest rate and tenure. See total invested, interest earned and maturity amount, calculated in your browser.',
  desc: 'Estimate the maturity value of a Public Provident Fund account from your yearly deposit, the interest rate and the number of years.',
  keywords: ['ppf calculator', 'public provident fund', 'ppf maturity', 'ppf interest', 'savings calculator', 'tax free savings'],
  featureList: ['Maturity value', 'Total invested', 'Interest earned', 'Yearly contribution', '100% client-side'],
  panel: panel.wrap('ppf', 'fa-solid fa-piggy-bank', 'PPF maturity',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="ppfY">Yearly deposit</label><input id="ppfY"type="number"min="0"step="500"value="150000"></div>' +
    '<div class="field"><label for="ppfR">Interest rate (%)</label><input id="ppfR"type="number"min="0"step="0.1"value="7.1"></div>' +
    '<div class="field"><label for="ppfN">Years</label><input id="ppfN"type="number"min="1"step="1"value="15"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Total invested</div><div class="rt-value"id="ppfIn">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Interest earned</div><div class="rt-value"id="ppfInt">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Maturity value</div><div class="rt-value"id="ppfMat">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="ppfGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>' +
    '<div id="ppfSched"style="margin-top:10px;max-height:280px;overflow:auto"></div>'),
  css: '#ppfSched table{width:100%;border-collapse:collapse;font-size:12.5px}#ppfSched th,#ppfSched td{border:1px solid var(--border);padding:6px 8px;text-align:right}#ppfSched th{background:rgba(255,255,255,.04)}',
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var y=+document.getElementById("ppfY").value,r=+document.getElementById("ppfR").value/100,n=+document.getElementById("ppfN").value;
      var bal=0,rows="<table><thead><tr><th>Year</th><th>Deposit</th><th>Interest</th><th>Balance</th></tr></thead><tbody>";
      for(var i=1;i<=n;i++){var int0=bal*((Math.pow(1+r,1)-1));var dep=y;bal=bal+int0+dep;rows+="<tr><td>"+i+"</td><td>"+fmt(dep)+"</td><td>"+fmt(int0)+"</td><td>"+fmt(bal)+"</td></tr>";}
      rows+="</tbody></table>";document.getElementById("ppfSched").innerHTML=rows;
      document.getElementById("ppfIn").textContent=fmt(y*n);
      document.getElementById("ppfInt").textContent=fmt(bal-y*n);
      document.getElementById("ppfMat").textContent=fmt(bal);
      document.getElementById("ppfProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["ppfY","ppfR","ppfN"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("ppfGo").addEventListener("click",run);run();`,
  article: {
    title: 'PPF Calculator: Project Your Public Provident Fund Maturity',
    lead: '<p>The Public Provident Fund is a long-term, tax-advantaged savings scheme. This <strong>PPF calculator</strong> shows the maturity value you can expect from a fixed yearly deposit over the scheme term.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-seedling', heading: 'How PPF interest compounds', html: '<p>Interest is calculated on the balance and credited annually. Each year the deposit is added and interest is compounded on the running balance, which is why the year-by-year table grows faster in later years.</p>' },
      { id: 'deposits', icon: 'fa-solid fa-wallet', heading: 'Deposit limits', html: '<p>The scheme caps the yearly deposit, so use the deposit field to model any annual amount within the allowed range. The calculator treats the deposit as made at the start of each year.</p>' }
    ],
    steps: ['Enter your planned yearly deposit.', 'Set the applicable interest rate and the number of years.', 'Read total invested, interest earned and maturity value, with a yearly schedule.'],
    facts: [['Compounding', 'Annual'], ['Contribution', 'Fixed yearly deposit'], ['Output', 'Maturity, interest, invested'], ['Data handling', 'Runs locally']],
    useCases: [['Retirement planning', 'Project the corpus available at maturity.'], ['Tax planning', 'Compare the tax-free return with other products.'], ['Goal setting', 'Work backwards from a target amount.']],
    tips: ['Use the current notified rate for a realistic estimate.', 'Longer tenures benefit disproportionately from compounding.', 'Keep deposits consistent for the clearest projection.'],
    takeaways: ['Interest compounds annually on the running balance.', 'Later years contribute the most interest.', 'Maturity is invested plus accumulated interest.'],
    faq: [['Is PPF interest tax free?', 'Under current rules the interest and maturity are tax exempt, though rules can change.'], ['Can I vary my deposit each year?', 'This calculator assumes a level yearly deposit.'], ['What if I deposit more?', 'Increase the yearly deposit field and re-run.'], ['Is my data uploaded?', 'No, the calculation is local.']],
    conclusion: '<p>Plan the long term with clarity. Compare against other options with the <a href="compound-interest-calculator.html">compound interest calculator</a>.</p>'
  }
});

/* ========================================================================
   5. FD INTEREST CALCULATOR
   ======================================================================== */
add({
  file: 'fd-interest-calculator.html', folder: 'finance',
  name: 'FD Interest Calculator', tag: 'Savings', icon: 'fa-solid fa-vault',
  title: 'FD Interest Calculator | Fixed Deposit Maturity',
  metaDesc: 'Calculate fixed deposit maturity value and interest for any principal, rate, tenure and compounding frequency. All in your browser, no signup.',
  desc: 'Work out the maturity value and interest for a fixed deposit using any principal, rate, tenure and compounding frequency.',
  keywords: ['fd calculator', 'fixed deposit calculator', 'fd interest', 'fd maturity', 'deposit calculator', 'compound interest'],
  featureList: ['Maturity value', 'Interest earned', 'Quarterly/monthly compounding', '100% client-side'],
  panel: panel.wrap('fd', 'fa-solid fa-vault', 'Fixed deposit',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="fdP">Deposit amount</label><input id="fdP"type="number"min="0"step="1000"value="100000"></div>' +
    '<div class="field"><label for="fdR">Annual interest rate (%)</label><input id="fdR"type="number"min="0"step="0.01"value="7"></div>' +
    '<div class="field"><label for="fdN">Tenure (years)</label><input id="fdN"type="number"min="0.1"step="0.1"value="3"></div>' +
    '</div>' +
    panel.dirSelect('fd', [['4', 'Quarterly compounding'], ['12', 'Monthly compounding'], ['2', 'Half-yearly'], ['1', 'Yearly']]) +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Interest earned</div><div class="rt-value"id="fdInt">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Maturity value</div><div class="rt-value"id="fdMat">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="fdGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var p=+document.getElementById("fdP").value,r=+document.getElementById("fdR").value/100/ +document.getElementById("fdDir").value,n=+document.getElementById("fdN").value;
      var m=+document.getElementById("fdDir").value;var t=n*m;
      var mat=p*Math.pow(1+r,t);
      document.getElementById("fdInt").textContent=fmt(mat-p);
      document.getElementById("fdMat").textContent=fmt(mat);
      document.getElementById("fdProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["fdP","fdR","fdN","fdDir"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("fdGo").addEventListener("click",run);run();`,
  article: {
    title: 'FD Interest Calculator: Know Your Fixed Deposit Return',
    lead: '<p>A fixed deposit locks your money at a known rate for a set period. This <strong>FD interest calculator</strong> shows the interest earned and the maturity value for any principal, rate and tenure.</p>',
    sections: [
      { id: 'compounding', icon: 'fa-solid fa-layer-group', heading: 'Compounding frequency matters', html: '<p>Banks often compound deposits quarterly. The more frequently interest compounds, the higher the effective yield, so switch the frequency to match your bank for an accurate figure.</p>' },
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The maturity formula', html: '<p>Maturity is <code>P x (1 + r/m)^(m x t)</code>, where <code>r</code> is the annual rate, <code>m</code> the compounding periods per year and <code>t</code> the tenure in years.</p>' }
    ],
    steps: ['Enter the deposit amount, annual rate and tenure in years.', 'Select the compounding frequency your bank uses.', 'Read the interest earned and maturity value.'],
    facts: [['Formula', 'Compound interest'], ['Frequencies', 'Monthly to yearly'], ['Output', 'Interest and maturity'], ['Data handling', 'Runs locally']],
    useCases: [['Comparing FD offers', 'See which tenure and rate combination pays more.'], ['Retirement income', 'Estimate maturity for laddered deposits.'], ['Tax planning', 'Project interest before TDS thresholds.']],
    tips: ['Match the compounding frequency to your bank exactly.', 'Fractional-year tenures are supported.', 'Small rate changes compound noticeably over long terms.'],
    takeaways: ['Compounding frequency changes the effective return.', 'Maturity grows exponentially with tenure.', 'The formula is standard compound interest.'],
    faq: [['Does this handle simple interest FDs?', 'Choose yearly compounding and a one-year tenure for a close approximation.'], ['Is TDS applied?', 'No, the figure is gross interest before tax.'], ['Can tenures be under a year?', 'Yes, decimal years are accepted.'], ['Is my data safe?', 'It never leaves your browser.']],
    conclusion: '<p>Compare deposits with confidence. Then investigate the <a href="rd-calculator.html">recurring deposit calculator</a> for monthly saving.</p>'
  }
});

/* ========================================================================
   6. RD CALCULATOR
   ======================================================================== */
add({
  file: 'rd-calculator.html', folder: 'finance',
  name: 'Recurring Deposit Calculator', tag: 'Savings', icon: 'fa-solid fa-calendar-check',
  title: 'Recurring Deposit Calculator | RD Maturity Value',
  metaDesc: 'Calculate recurring deposit maturity from a monthly instalment, interest rate and tenure. See total deposited, interest earned and maturity value in your browser.',
  desc: 'Estimate the maturity value of a recurring deposit from a fixed monthly instalment, the interest rate and the number of months.',
  keywords: ['rd calculator', 'recurring deposit', 'rd maturity', 'monthly deposit', 'rd interest', 'savings calculator'],
  featureList: ['Monthly instalment', 'Maturity value', 'Total deposited', 'Interest earned', '100% client-side'],
  panel: panel.wrap('rd', 'fa-solid fa-calendar-check', 'Recurring deposit',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="rdM">Monthly instalment</label><input id="rdM"type="number"min="0"step="500"value="5000"></div>' +
    '<div class="field"><label for="rdR">Annual interest rate (%)</label><input id="rdR"type="number"min="0"step="0.1"value="7"></div>' +
    '<div class="field"><label for="rdN">Tenure (months)</label><input id="rdN"type="number"min="1"step="1"value="24"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Total deposited</div><div class="rt-value"id="rdDep">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Interest earned</div><div class="rt-value"id="rdInt">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Maturity value</div><div class="rt-value"id="rdMat">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="rdGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var m=+document.getElementById("rdM").value,rr=+document.getElementById("rdR").value/100/4,n=+document.getElementById("rdN").value;
      var mat=0;
      for(var i=1;i<=n;i++){var months=n-i+1;mat+=m*Math.pow(1+rr/3,months/3);}
      var dep=m*n;
      document.getElementById("rdDep").textContent=fmt(dep);
      document.getElementById("rdInt").textContent=fmt(mat-dep);
      document.getElementById("rdMat").textContent=fmt(mat);
      document.getElementById("rdProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["rdM","rdR","rdN"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("rdGo").addEventListener("click",run);run();`,
  article: {
    title: 'Recurring Deposit Calculator: Build a Corpus Month by Month',
    lead: '<p>A recurring deposit turns a small monthly instalment into a lump sum. This <strong>recurring deposit calculator</strong> shows the total you deposit, the interest earned and the maturity value.</p>',
    sections: [
      { id: 'mechanics', icon: 'fa-solid fa-arrows-spin', heading: 'How RD maturity is built up', html: '<p>Each instalment earns interest for the remaining months until maturity. Early instalments therefore earn more interest than late ones, and the calculator compounds quarterly as banks typically do.</p>' },
      { id: 'discipline', icon: 'fa-solid fa-hand-fist', heading: 'The power of a fixed habit', html: '<p>Because you commit the same amount every month, recurring deposits enforce saving discipline while still earning a guaranteed return.</p>' }
    ],
    steps: ['Enter your monthly instalment.', 'Set the annual interest rate and the tenure in months.', 'Read total deposited, interest earned and maturity value.'],
    facts: [['Compounding', 'Quarterly'], ['Instalment', 'Fixed monthly'], ['Output', 'Deposit, interest, maturity'], ['Data handling', 'Runs locally']],
    useCases: [['Saving for a goal', 'See whether a monthly amount reaches your target in time.'], ['Building an emergency fund', 'Project the corpus after a fixed period.'], ['Comparing with FDs', 'Check whether RD or a lump-sum FD suits you better.']],
    tips: ['Quarterly compounding matches most banks.', 'Longer tenures raise both deposits and interest.', 'Keep the instalment realistic and consistent.'],
    takeaways: ['Every instalment earns a different amount of interest.', 'Monthly discipline produces a predictable lump sum.', 'Maturity is deposits plus accumulated interest.'],
    faq: [['Is the compounding quarterly?', 'Yes, the calculator uses quarterly compounding to match typical bank practice.'], ['Can I change the instalment mid-term?', 'This model assumes a fixed instalment.'], ['Is the return guaranteed?', 'The figure reflects the entered rate; actual rates are fixed at account opening.'], ['Is my data uploaded?', 'No, everything runs locally.']],
    conclusion: '<p>Turn small deposits into a bigger goal. Compare against the <a href="fd-interest-calculator.html">FD interest calculator</a>.</p>'
  }
});

/* ========================================================================
   7. SIMPLE INTEREST CALCULATOR (existing) - skip
   8. CAGR CALCULATOR
   ======================================================================== */
add({
  file: 'cagr-calculator.html', folder: 'finance',
  name: 'CAGR Calculator', tag: 'Investing', icon: 'fa-solid fa-chart-line',
  title: 'CAGR Calculator | Compound Annual Growth Rate',
  metaDesc: 'Calculate the compound annual growth rate (CAGR) between a beginning and ending value over any number of years. Free, private, in-browser.',
  desc: 'Find the compound annual growth rate of an investment from its starting value, ending value and the number of years held.',
  keywords: ['cagr calculator', 'compound annual growth rate', 'investment growth', 'annualised return', 'growth rate'],
  featureList: ['CAGR percentage', 'Absolute return', 'Total growth', '100% client-side'],
  panel: panel.wrap('cagr', 'fa-solid fa-chart-line', 'CAGR',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="cagrBeg">Beginning value</label><input id="cagrBeg"type="number"min="0"step="1000"value="100000"></div>' +
    '<div class="field"><label for="cagrEnd">Ending value</label><input id="cagrEnd"type="number"min="0"step="1000"value="200000"></div>' +
    '<div class="field"><label for="cagrN">Years</label><input id="cagrN"type="number"min="0.1"step="0.1"value="5"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">CAGR</div><div class="rt-value"id="cagrR">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Absolute return</div><div class="rt-value"id="cagrAbs">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total growth</div><div class="rt-value"id="cagrG">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="cagrGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function run(){var b=+document.getElementById("cagrBeg").value,e=+document.getElementById("cagrEnd").value,n=+document.getElementById("cagrN").value;
      if(!(b>0)||!(n>0)){return;}
      var cagr=(Math.pow(e/b,1/n)-1)*100;
      document.getElementById("cagrR").textContent=cagr.toFixed(2)+"%";
      document.getElementById("cagrAbs").textContent=((e-b)/b*100).toFixed(2)+"%";
      document.getElementById("cagrG").textContent="Rs "+Math.round(e-b).toLocaleString("en-IN");
      document.getElementById("cagrProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["cagrBeg","cagrEnd","cagrN"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("cagrGo").addEventListener("click",run);run();`,
  article: {
    title: 'CAGR Calculator: The Smoothed Annual Growth of an Investment',
    lead: '<p>CAGR expresses total growth as a single annual rate, smoothing out the ups and downs along the way. This <strong>CAGR calculator</strong> gives you that rate from a start value, an end value and a holding period.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The CAGR formula', html: '<p>CAGR is <code>(End / Begin)^(1/n) - 1</code>, where <code>n</code> is the number of years. It is the constant yearly rate that would take the beginning value to the ending value.</p>' },
      { id: 'caveat', icon: 'fa-solid fa-triangle-exclamation', heading: 'What CAGR hides', html: '<p>Because it smooths volatility, CAGR does not describe the path an investment took. Two investments can share a CAGR yet feel completely different year to year. Use it as a comparison tool, not a risk measure.</p>' }
    ],
    steps: ['Enter the value at the start of the period.', 'Enter the value at the end and the number of years.', 'Read the CAGR, absolute return and total gain.'],
    facts: [['Formula', 'Geometric growth rate'], ['Measures', 'Smoothed annual return'], ['Output', 'CAGR, absolute, gain'], ['Data handling', 'Runs locally']],
    useCases: [['Fund comparison', 'Compare mutual funds with different holding periods on a like-for-like basis.'], ['Business metrics', 'Track revenue growth across years.'], ['Portfolio review', 'Summarise a multi-year holding with one number.']],
    tips: ['Use whole years for the cleanest interpretation.', 'CAGR assumes reinvestment of returns.', 'Never rely on CAGR alone to judge risk.'],
    takeaways: ['CAGR smooths total growth into one yearly rate.', 'It assumes steady compounding.', 'It says nothing about volatility.'],
    faq: [['Can I use months?', 'Yes, but express the period in years (for example 18 months = 1.5 years).'], ['Is negative growth supported?', 'Yes, a falling value gives a negative CAGR.'], ['Does it include dividends?', 'Only if the ending value already includes them.'], ['Is my data uploaded?', 'No, the calculation is local.']],
    conclusion: '<p>Put growth in perspective. Then project forward with the <a href="compound-interest-calculator.html">compound interest calculator</a>.</p>'
  }
});

/* ========================================================================
   9. GRATUITY CALCULATOR
   ======================================================================== */
add({
  file: 'gratuity-calculator.html', folder: 'finance',
  name: 'Gratuity Calculator', tag: 'Salary', icon: 'fa-solid fa-award',
  title: 'Gratuity Calculator | Estimate Your Gratuity Payout',
  metaDesc: 'Estimate gratuity payable on retirement or resignation from your last drawn salary and years of service, using the standard formula. In-browser, private.',
  desc: 'Estimate the gratuity due on retirement or resignation from your last drawn monthly salary and completed years of service.',
  keywords: ['gratuity calculator', 'gratuity formula', 'retirement benefit', 'last drawn salary', 'service years'],
  featureList: ['Standard gratuity formula', 'Covered and non-covered employees', 'Instant result', '100% client-side'],
  panel: panel.wrap('grat', 'fa-solid fa-award', 'Gratuity',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="gratSal">Last drawn monthly salary</label><input id="gratSal"type="number"min="0"step="1000"value="50000"></div>' +
    '<div class="field"><label for="gratY">Years of service</label><input id="gratY"type="number"min="0"step="0.5"value="10"></div>' +
    '<div class="field"><label for="gratType">Employee type</label><select id="gratType"><option value="cover">Covered by Gratuity Act</option><option value="noncover">Not covered</option></select></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Gratuity payable</div><div class="rt-value"id="gratOut">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="gratGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var s=+document.getElementById("gratSal").value,y=+document.getElementById("gratY").value,t=document.getElementById("gratType").value;
      var gy=t==="cover"?Math.round(y):Math.floor(y);
      var g=s*15/26*gy;
      document.getElementById("gratOut").textContent=fmt(g);
      document.getElementById("gratProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["gratSal","gratY","gratType"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("gratGo").addEventListener("click",run);run();`,
  article: {
    title: 'Gratuity Calculator: Estimate Your End-of-Service Benefit',
    lead: '<p>Gratuity is a lump-sum benefit paid by an employer for long service. This <strong>gratuity calculator</strong> estimates the amount using the widely used statutory formula.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The gratuity formula', html: '<p>For employees covered by the Gratuity Act the formula is <code>last drawn salary x 15 / 26 x years of service</code>, where 15/26 represents fifteen days of wages. For employees not covered, it is typically <code>salary x 15 / 30 x years</code>; this calculator applies the covered formula and rounds service as the Act specifies.</p>' },
      { id: 'service', icon: 'fa-solid fa-calendar-days', heading: 'Counting years of service', html: '<p>Under the Act, service beyond six months in a year is rounded up to a full year. The covered option applies that rounding; the non-covered option floors the years.</p>' }
    ],
    steps: ['Enter your last drawn monthly salary.', 'Enter completed years of service.', 'Choose whether you are covered by the Gratuity Act.', 'Read the estimated gratuity.'],
    facts: [['Formula', 'Salary x 15/26 x years'], ['Rounding', 'Per Gratuity Act'], ['Output', 'Estimated payout'], ['Data handling', 'Runs locally']],
    useCases: [['Retirement planning', 'Estimate the lump sum you may receive.'], ['Resignation', 'Know the benefit accrued so far.'], ['Negotiation', 'Understand the value of service years.']],
    tips: ['Use your basic plus dearness allowance as the salary figure.', 'Service beyond six months counts as a full year when covered.', 'The statutory cap may limit very large payouts.'],
    takeaways: ['Gratuity rewards long service.', 'The formula uses last drawn salary and years served.', 'Covered employees get favourable rounding.'],
    faq: [['Is the payout capped?', 'Statutory limits can apply; this tool shows the formula amount before any cap.'], ['Which salary do I enter?', 'Your last drawn basic salary plus DA.'], ['Do part years count?', 'They round up under the covered option, otherwise they are floored.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>See the value of your service years. Plan the rest with the <a href="retirement-calculator.html">retirement calculator</a>.</p>'
  }
});

/* ========================================================================
   10. SALARY CALCULATOR
   ======================================================================== */
add({
  file: 'salary-calculator.html', folder: 'finance',
  name: 'Salary Calculator', tag: 'Salary', icon: 'fa-solid fa-money-check-dollar',
  title: 'Salary Calculator | CTC to In-Hand Salary',
  metaDesc: 'Convert annual CTC into monthly and yearly take-home salary after deductions like PF and tax. Estimate your in-hand pay in the browser, no signup.',
  desc: 'Break down an annual CTC into monthly gross and estimated in-hand salary after standard deductions such as PF and income tax.',
  keywords: ['salary calculator', 'ctc to in hand', 'take home salary', 'in hand salary', 'net salary', 'salary breakdown'],
  featureList: ['CTC to in-hand', 'PF deduction', 'Estimated tax', 'Monthly and yearly view', '100% client-side'],
  panel: panel.wrap('sal', 'fa-solid fa-money-check-dollar', 'Salary breakdown',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="salCtc">Annual CTC</label><input id="salCtc"type="number"min="0"step="10000"value="1200000"></div>' +
    '<div class="field"><label for="salPf">Employee PF (%)</label><input id="salPf"type="number"min="0"step="1"value="12"></div>' +
    '<div class="field"><label for="salTax">Flat tax rate (%)</label><input id="salTax"type="number"min="0"step="1"value="10"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Gross per month</div><div class="rt-value"id="salGross">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">PF per month</div><div class="rt-value"id="salPfm">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">In-hand per month</div><div class="rt-value"id="salNet">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">In-hand per year</div><div class="rt-value"id="salNetY">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="salGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var ctc=+document.getElementById("salCtc").value,pf=+document.getElementById("salPf").value/100,tax=+document.getElementById("salTax").value/100;
      var gross=ctc/12;
      var pfm=gross*pf;
      var taxable=ctc-ctc*pf;
      var taxy=taxable*tax;
      var net=(ctc-ctc*pf-taxy)/12;
      document.getElementById("salGross").textContent=fmt(gross);
      document.getElementById("salPfm").textContent=fmt(pfm);
      document.getElementById("salNet").textContent=fmt(net);
      document.getElementById("salNetY").textContent=fmt(net*12);
      document.getElementById("salProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["salCtc","salPf","salTax"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("salGo").addEventListener("click",run);run();`,
  article: {
    title: 'Salary Calculator: From CTC to In-Hand Pay',
    lead: '<p>Your CTC is not what lands in your bank account. This <strong>salary calculator</strong> converts an annual cost-to-company figure into monthly gross and estimated in-hand pay after PF and tax.</p>',
    sections: [
      { id: 'ctc', icon: 'fa-solid fa-file-invoice-dollar', heading: 'What CTC includes', html: '<p>CTC bundles your gross salary with employer contributions and benefits. Deducting the employee PF share and an estimated tax rate from the taxable portion gives a practical net figure.</p>' },
      { id: 'approx', icon: 'fa-solid fa-circle-info', heading: 'A planning estimate', html: '<p>Actual tax depends on exemptions and slabs, so this tool uses a flat rate you choose. It is designed for quick planning rather than exact payroll.</p>' }
    ],
    steps: ['Enter your annual CTC.', 'Set the employee PF percentage.', 'Enter an estimated effective tax rate.', 'Read monthly gross, PF and in-hand figures.'],
    facts: [['Input', 'Annual CTC'], ['Deductions', 'PF and flat tax'], ['Output', 'Monthly and yearly net'], ['Data handling', 'Runs locally']],
    useCases: [['Job offer comparison', 'See what each offer means per month.'], ['Budgeting', 'Plan expenses around the net figure.'], ['Negotiation', 'Understand the gap between CTC and take-home.']],
    tips: ['Use your real effective tax rate for accuracy.', 'PF is often 12% of basic, not gross; adjust to suit.', 'Employer contributions are already inside CTC.'],
    takeaways: ['CTC is not take-home.', 'PF and tax drive the difference.', 'Use a realistic tax rate for planning.'],
    faq: [['Is this exact?', 'No, it is an estimate using a flat tax rate.'], ['Can I set PF to zero?', 'Yes, set the percentage to zero if not applicable.'], ['Does it include other deductions?', 'Only PF and the tax rate you enter.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Understand your package before you sign. Explore more with the <a href="income-tax-calculator.html">income tax calculator</a>.</p>'
  }
});

/* ========================================================================
   11. GST CALCULATOR
   ======================================================================== */
add({
  file: 'gst-calculator.html', folder: 'finance',
  name: 'GST Calculator', tag: 'Tax', icon: 'fa-solid fa-receipt',
  title: 'GST Calculator | Add or Remove GST Online',
  metaDesc: 'Add GST to a price or extract GST from a tax-inclusive amount at any rate. See CGST, SGST and IGST splits instantly in your browser.',
  desc: 'Add GST to a base price or work out the net price and GST component from a tax-inclusive amount, with CGST/SGST/IGST split.',
  keywords: ['gst calculator', 'add gst', 'remove gst', 'gst inclusive', 'cgst sgst igst', 'tax calculator', 'goods and services tax'],
  featureList: ['Add or remove GST', 'CGST/SGST/IGST split', 'Any rate', '100% client-side'],
  panel: panel.wrap('gst', 'fa-solid fa-receipt', 'GST calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="gstAmt">Amount</label><input id="gstAmt"type="number"min="0"step="1"value="1000"></div>' +
    '<div class="field"><label for="gstRate">GST rate (%)</label><select id="gstRate"><option>0.25</option><option>3</option><option>5</option><option value="12">12</option><option value="18"selected>18</option><option>28</option></select></div>' +
    '<div class="field"><label for="gstMode">Mode</label><select id="gstMode"><option value="add">Add GST (amount is net)</option><option value="rem">Remove GST (amount is gross)</option></select></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Net price</div><div class="rt-value"id="gstNet">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">GST amount</div><div class="rt-value"id="gstTax">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Gross price</div><div class="rt-value"id="gstGross">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">CGST + SGST</div><div class="rt-value"id="gstSplit">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="gstGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+n.toLocaleString("en-IN",{maximumFractionDigits:2});}
    function run(){var a=+document.getElementById("gstAmt").value,r=+document.getElementById("gstRate").value/100,m=document.getElementById("gstMode").value;
      var net,tax,gross;
      if(m==="add"){net=a;tax=a*r;gross=a+tax;}else{gross=a;net=a/(1+r);tax=gross-net;}
      document.getElementById("gstNet").textContent=fmt(net);
      document.getElementById("gstTax").textContent=fmt(tax);
      document.getElementById("gstGross").textContent=fmt(gross);
      document.getElementById("gstSplit").textContent=fmt(tax/2)+" + "+fmt(tax/2);
      document.getElementById("gstProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["gstAmt","gstRate","gstMode"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("gstGo").addEventListener("click",run);run();`,
  article: {
    title: 'GST Calculator: Add or Extract Goods and Services Tax',
    lead: '<p>Whether you are invoicing or checking a receipt, you often need to move between net and gross prices. This <strong>GST calculator</strong> adds GST to a net amount or extracts it from a gross one at any rate.</p>',
    sections: [
      { id: 'addrem', icon: 'fa-solid fa-arrows-rotate', heading: 'Adding versus removing', html: '<p>Adding GST multiplies the net price by the rate. Removing it divides the gross price by one plus the rate, so you recover the original net figure exactly.</p>' },
      { id: 'split', icon: 'fa-solid fa-scale-balanced', heading: 'The CGST and SGST split', html: '<p>For intra-state sales the GST is split equally into CGST and SGST; for inter-state sales it becomes a single IGST. The calculator shows the equal split so you can fill invoice lines correctly.</p>' }
    ],
    steps: ['Enter the amount.', 'Pick or type the GST rate.', 'Choose whether the amount is net or gross.', 'Read the net, GST, gross and the CGST/SGST split.'],
    facts: [['Rates', '0.25% to 28%'], ['Modes', 'Add or remove'], ['Output', 'Net, tax, gross, split'], ['Data handling', 'Runs locally']],
    useCases: [['Invoicing', 'Work out the tax line and totals for a bill.'], ['Expense checks', 'Verify whether a quoted price includes GST.'], ['Reverse calculation', 'Recover the net value from a gross receipt.']],
    tips: ['Use the Add mode when you know the pre-tax price.', 'Use Remove mode for tax-inclusive prices.', 'Intra-state supplies split into CGST and SGST.'],
    takeaways: ['Add multiplies, remove divides.', 'The split depends on the supply type.', 'Any GST rate can be entered.'],
    faq: [['Which rate should I use?', 'Use the rate that applies to your goods or services.'], ['Is IGST shown?', 'The split shown equals CGST plus SGST; IGST is the same total.'], ['Can rates include decimals?', 'Yes, 0.25% is supported.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Get your invoices right every time. Continue with the <a href="vat-calculator.html">VAT calculator</a> for other tax regimes.</p>'
  }
});

/* ========================================================================
   12. INCOME TAX CALCULATOR (simple slab)
   ======================================================================== */
add({
  file: 'income-tax-calculator.html', folder: 'finance',
  name: 'Income Tax Calculator', tag: 'Tax', icon: 'fa-solid fa-file-invoice-dollar',
  title: 'Income Tax Calculator | Estimate Tax on Your Income',
  metaDesc: 'Estimate income tax from your annual income using configurable slab rates and a standard deduction. Simple, private and fully in-browser.',
  desc: 'Estimate income tax on an annual income using a progressive slab structure and an optional standard deduction.',
  keywords: ['income tax calculator', 'tax estimator', 'slab rates', 'tax liability', 'net income after tax'],
  featureList: ['Progressive slabs', 'Standard deduction', 'Effective rate', '100% client-side'],
  panel: panel.wrap('itax', 'fa-solid fa-file-invoice-dollar', 'Income tax',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="itaxInc">Annual income</label><input id="itaxInc"type="number"min="0"step="10000"value="1200000"></div>' +
    '<div class="field"><label for="itaxDed">Standard deduction</label><input id="itaxDed"type="number"min="0"step="1000"value="50000"></div>' +
    '<div class="field"><label for="itaxRegime">Slab set</label><select id="itaxRegime"><option value="new">New regime</option><option value="old">Old regime</option></select></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Taxable income</div><div class="rt-value"id="itaxBase">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Tax</div><div class="rt-value"id="itaxTax">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Effective rate</div><div class="rt-value"id="itaxEff">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Net income</div><div class="rt-value"id="itaxNet">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="itaxGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    var NEW=[[300000,0],[700000,0.05],[1000000,0.10],[1200000,0.15],[1500000,0.20],[Infinity,0.30]];
    var OLD=[[250000,0],[500000,0.05],[1000000,0.20],[Infinity,0.30]];
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function slabTax(tax,slabs){var prev=0,total=0;for(var i=0;i<slabs.length;i++){var cap=slabs[i][0],rate=slabs[i][1];var amt=Math.min(tax,cap)-prev;if(amt>0)total+=amt*rate;prev=cap;if(tax<=cap)break;}return total;}
    function run(){var inc=+document.getElementById("itaxInc").value,ded=+document.getElementById("itaxDed").value,reg=document.getElementById("itaxRegime").value;
      var base=Math.max(0,inc-ded);
      var tax=slabTax(base,reg==="new"?NEW:OLD);
      document.getElementById("itaxBase").textContent=fmt(base);
      document.getElementById("itaxTax").textContent=fmt(tax);
      document.getElementById("itaxEff").textContent=inc>0?(tax/inc*100).toFixed(2)+"%":"0%";
      document.getElementById("itaxNet").textContent=fmt(inc-tax);
      document.getElementById("itaxProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["itaxInc","itaxDed","itaxRegime"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("itaxGo").addEventListener("click",run);run();`,
  article: {
    title: 'Income Tax Calculator: A Quick Estimate of What You Owe',
    lead: '<p>Income tax is charged in slabs, so only the income above each threshold is taxed at the higher rate. This <strong>income tax calculator</strong> applies a progressive slab structure to your income and shows the resulting liability.</p>',
    sections: [
      { id: 'slabs', icon: 'fa-solid fa-layer-group', heading: 'How slab tax works', html: '<p>Each slab applies its rate only to the income falling within that band. Your effective rate is therefore always lower than the top rate you reach, which is why the effective rate figure is useful.</p>' },
      { id: 'regimes', icon: 'fa-solid fa-scale-balanced', heading: 'Choosing a slab set', html: '<p>Different regimes offer different exemptions in exchange for different rates. Switch the slab set to compare, and remember this tool applies the deduction you enter rather than modelling every exemption.</p>' }
    ],
    steps: ['Enter your annual income.', 'Enter a standard deduction if applicable.', 'Choose a slab set.', 'Read taxable income, tax, effective rate and net income.'],
    facts: [['Structure', 'Progressive slabs'], ['Deduction', 'User-entered'], ['Output', 'Tax, effective rate, net'], ['Data handling', 'Runs locally']],
    useCases: [['Tax planning', 'Estimate the liability before filing.'], ['Regime comparison', 'See which slab set suits your income.'], ['Take-home planning', 'Work out income after tax.']],
    tips: ['Enter a realistic total deduction for accuracy.', 'Slab structures change each year, so verify current rates.', 'The effective rate helps you compare years.'],
    takeaways: ['Only income above each threshold is taxed at the higher rate.', 'The effective rate is below the top marginal rate.', 'Deductions reduce the taxable base.'],
    faq: [['Is this the official calculator?', 'No, it is an estimate using simplified slabs; confirm with official sources.'], ['Does it include cess?', 'No, add surcharge and cess separately if needed.'], ['Can I change the deduction?', 'Yes, enter any amount.'], ['Is my data uploaded?', 'No, everything is local.']],
    conclusion: '<p>Plan your tax year with a clear estimate, then check transaction taxes with the <a href="gst-calculator.html">GST calculator</a>.</p>'
  }
});

/* ========================================================================
   13. SWP CALCULATOR
   ======================================================================== */
add({
  file: 'swp-calculator.html', folder: 'finance',
  name: 'SWP Calculator', tag: 'Investing', icon: 'fa-solid fa-money-bill-trend-up',
  title: 'SWP Calculator | Systematic Withdrawal Plan',
  metaDesc: 'Project a systematic withdrawal plan: enter a corpus, expected return and monthly withdrawal to see how long the balance lasts. In-browser and private.',
  desc: 'Project how long an investment corpus lasts under a monthly systematic withdrawal, given an expected return.',
  keywords: ['swp calculator', 'systematic withdrawal plan', 'withdrawal calculator', 'corpus duration', 'retirement income'],
  featureList: ['Corpus duration', 'Total withdrawn', 'Balance over time', '100% client-side'],
  panel: panel.wrap('swp', 'fa-solid fa-money-bill-trend-up', 'SWP projection',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="swpC">Initial corpus</label><input id="swpC"type="number"min="0"step="10000"value="2000000"></div>' +
    '<div class="field"><label for="swpR">Expected return (%)</label><input id="swpR"type="number"min="0"step="0.1"value="8"></div>' +
    '<div class="field"><label for="swpW">Monthly withdrawal</label><input id="swpW"type="number"min="0"step="1000"value="15000"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Lasts for</div><div class="rt-value"id="swpDur">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total withdrawn</div><div class="rt-value"id="swpTot">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Final balance</div><div class="rt-value"id="swpBal">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="swpGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>' +
    '<div id="swpSched"style="margin-top:10px;max-height:280px;overflow:auto"></div>'),
  css: '#swpSched table{width:100%;border-collapse:collapse;font-size:12.5px}#swpSched th,#swpSched td{border:1px solid var(--border);padding:6px 8px;text-align:right}#swpSched th{background:rgba(255,255,255,.04)}',
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var c=+document.getElementById("swpC").value,r=+document.getElementById("swpR").value/12/100,w=+document.getElementById("swpW").value;
      var bal=c,tot=0,m=0,rows="<table><thead><tr><th>Year</th><th>Withdrawn</th><th>Balance</th></tr></thead><tbody>";
      var yw=0,ym=0;
      while(bal>0&&m<1200){bal=bal*(1+r)-w;tot+=w;m++;yw+=w;ym++;if(ym===12){rows+="<tr><td>"+Math.round(m/12)+"</td><td>"+fmt(yw)+"</td><td>"+fmt(Math.max(0,bal))+"</td></tr>";yw=0;ym=0;}}
      if(ym>0)rows+="<tr><td>"+(Math.ceil(m/12))+"</td><td>"+fmt(yw)+"</td><td>"+fmt(Math.max(0,bal))+"</td></tr>";
      rows+="</tbody></table>";document.getElementById("swpSched").innerHTML=rows;
      document.getElementById("swpDur").textContent=Math.floor(m/12)+" yr "+(m%12)+" mo";
      document.getElementById("swpTot").textContent=fmt(tot);
      document.getElementById("swpBal").textContent=fmt(Math.max(0,bal));
      document.getElementById("swpProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["swpC","swpR","swpW"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("swpGo").addEventListener("click",run);run();`,
  article: {
    title: 'SWP Calculator: How Long Will Your Corpus Last?',
    lead: '<p>A systematic withdrawal plan pays you a steady monthly amount from an invested corpus. This <strong>SWP calculator</strong> shows how long the money lasts and how much you withdraw in total.</p>',
    sections: [
      { id: 'mechanics', icon: 'fa-solid fa-arrows-spin', heading: 'Return versus withdrawal', html: '<p>Each month the balance grows by the return and shrinks by the withdrawal. If the withdrawal exceeds the return, the corpus erodes. Balancing the two determines whether your money lasts a decade or a lifetime.</p>' },
      { id: 'scenarios', icon: 'fa-solid fa-sliders', heading: 'Testing scenarios', html: '<p>Adjust the withdrawal or the expected return to see how sensitive the duration is. A small increase in withdrawal can dramatically shorten how long the corpus lasts.</p>' }
    ],
    steps: ['Enter your initial corpus.', 'Set the expected annual return.', 'Enter the monthly withdrawal.', 'See the duration, total withdrawn and yearly balances.'],
    facts: [['Withdrawal', 'Monthly'], ['Return', 'Compounded monthly'], ['Output', 'Duration and balances'], ['Data handling', 'Runs locally']],
    useCases: [['Retirement income', 'Test whether your corpus supports a monthly income.'], ['Downsizing risks', 'See how a bigger withdrawal shortens duration.'], ['Estate planning', 'Estimate what remains for heirs.']],
    tips: ['Use a conservative return for safety.', 'Rising withdrawals over time are not modelled here.', 'Check the duration against your planning horizon.'],
    takeaways: ['Withdrawal above return depletes the corpus.', 'Duration is very sensitive to the withdrawal amount.', 'The yearly table shows the erosion clearly.'],
    faq: [['Does it account for inflation?', 'No, the return should be treated as nominal unless you enter a real return.'], ['What is the maximum duration shown?', 'One hundred years.'], ['Can withdrawals be zero?', 'Yes, the corpus then simply grows.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Make your corpus last by planning the withdrawals. Compare with the <a href="retirement-calculator.html">retirement calculator</a>.</p>'
  }
});

/* ========================================================================
   14. RETIREMENT CALCULATOR
   ======================================================================== */
add({
  file: 'retirement-calculator.html', folder: 'finance',
  name: 'Retirement Calculator', tag: 'Investing', icon: 'fa-solid fa-umbrella-beach',
  title: 'Retirement Calculator | How Much to Save for Retirement',
  metaDesc: 'Estimate the retirement corpus you need and the monthly saving required to reach it, based on current age, target income and expected returns.',
  desc: 'Estimate the corpus needed for retirement and the monthly saving required to reach it, from your current age, expenses and expected returns.',
  keywords: ['retirement calculator', 'retirement corpus', 'pension planning', 'how much to save', 'retirement savings', 'financial independence'],
  featureList: ['Required corpus', 'Monthly saving needed', 'Inflation adjusted', '100% client-side'],
  panel: panel.wrap('ret', 'fa-solid fa-umbrella-beach', 'Retirement planner',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="retAge">Current age</label><input id="retAge"type="number"min="1"step="1"value="30"></div>' +
    '<div class="field"><label for="retRet">Retirement age</label><input id="retRet"type="number"min="1"step="1"value="60"></div>' +
    '<div class="field"><label for="retExp">Current monthly expenses</label><input id="retExp"type="number"min="0"step="1000"value="40000"></div>' +
    '</div>' +
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="retInfl">Inflation (%)</label><input id="retInfl"type="number"min="0"step="0.1"value="6"></div>' +
    '<div class="field"><label for="retRetR">Return after retirement (%)</label><input id="retRetR"type="number"min="0"step="0.1"value="7"></div>' +
    '<div class="field"><label for="retPreR">Return before retirement (%)</label><input id="retPreR"type="number"min="0"step="0.1"value="11"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Corpus needed</div><div class="rt-value"id="retCorp">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Years to save</div><div class="rt-value"id="retYears">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Monthly saving</div><div class="rt-value"id="retSave">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="retGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var age=+document.getElementById("retAge").value,ra=+document.getElementById("retRet").value,exp=+document.getElementById("retExp").value;
      var infl=+document.getElementById("retInfl").value/100,rr=+document.getElementById("retRetR").value/100,pr=+document.getElementById("retPreR").value/100;
      var yrs=Math.max(0,ra-age);
      var retExp=exp*Math.pow(1+infl,yrs);
      var annual=retExp*12;
      var corpus=rr>0?annual*(1-1/Math.pow(1+rr,25))/rr:annual*25;
      var mr=pr/12,n=yrs*12;
      var save=mr>0&&n>0?corpus*mr/(Math.pow(1+mr,n)-1):corpus/n;
      document.getElementById("retCorp").textContent=fmt(corpus);
      document.getElementById("retYears").textContent=yrs+" yr";
      document.getElementById("retSave").textContent=fmt(save);
      document.getElementById("retProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["retAge","retRet","retExp","retInfl","retRetR","retPreR"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("retGo").addEventListener("click",run);run();`,
  article: {
    title: 'Retirement Calculator: Size the Corpus You Need',
    lead: '<p>Retirement planning starts with two numbers: the corpus you need and the monthly saving that gets you there. This <strong>retirement calculator</strong> estimates both, adjusting your expenses for inflation.</p>',
    sections: [
      { id: 'corpus', icon: 'fa-solid fa-coins', heading: 'Building the corpus target', html: '<p>Your current expenses are inflated to the year you retire, then annualised. Dividing by a sustainable withdrawal rate gives the corpus required to fund roughly twenty-five years of retirement at that income.</p>' },
      { id: 'saving', icon: 'fa-solid fa-piggy-bank', heading: 'The monthly saving', html: '<p>Using your pre-retirement return and the years remaining, the calculator works out the monthly contribution that compounds to the corpus target. Start earlier and the requirement drops quickly.</p>' }
    ],
    steps: ['Enter your current age and target retirement age.', 'Enter your current monthly expenses.', 'Set inflation and the expected returns before and after retirement.', 'Read the corpus needed and the monthly saving required.'],
    facts: [['Inflation', 'Adjusts expenses'], ['Withdrawal', 'Roughly 25 years'], ['Output', 'Corpus and monthly saving'], ['Data handling', 'Runs locally']],
    useCases: [['Early planning', 'See how much a head start reduces monthly saving.'], ['Catch-up saving', 'Work out a higher contribution if you started late.'], ['Scenario testing', 'Change returns to test a conservative plan.']],
    tips: ['Use a conservative post-retirement return.', 'Include major lifestyle costs in your expense figure.', 'Revisit the plan every few years.'],
    takeaways: ['Inflation raises the retirement income you need.', 'A sustainable withdrawal rate sets the corpus target.', 'Time in the market reduces the monthly saving.'],
    faq: [['How many retirement years does it assume?', 'The corpus funds about twenty-five years of withdrawals.'], ['Does it include pensions?', 'No, subtract other income from your expenses separately.'], ['Can I model early retirement?', 'Yes, set a lower retirement age.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Start today and let compounding do the work. Reinforce the plan with the <a href="cagr-calculator.html">CAGR calculator</a>.</p>'
  }
});

/* ========================================================================
   15. NPS CALCULATOR
   ======================================================================== */
add({
  file: 'nps-calculator.html', folder: 'finance',
  name: 'NPS Calculator', tag: 'Pension', icon: 'fa-solid fa-building-shield',
  title: 'NPS Calculator | National Pension System Corpus',
  metaDesc: 'Estimate your National Pension System corpus at retirement and the lump sum available after the mandatory annuity portion. Private, in-browser.',
  desc: 'Estimate the retirement corpus under the National Pension System from a monthly contribution, expected return and years to retirement.',
  keywords: ['nps calculator', 'national pension system', 'pension corpus', 'annuity', 'retirement corpus', 'nps maturity'],
  featureList: ['Corpus at retirement', 'Lump sum after annuity', 'Monthly contribution', '100% client-side'],
  panel: panel.wrap('nps', 'fa-solid fa-building-shield', 'NPS projection',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="npsC">Monthly contribution</label><input id="npsC"type="number"min="0"step="1000"value="10000"></div>' +
    '<div class="field"><label for="npsR">Expected return (%)</label><input id="npsR"type="number"min="0"step="0.1"value="10"></div>' +
    '<div class="field"><label for="npsN">Years to retirement</label><input id="npsN"type="number"min="1"step="1"value="30"></div>' +
    '</div>' +
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="npsAnn">Annuity portion (%)</label><input id="npsAnn"type="number"min="0"max="100"step="1"value="40"></div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Total corpus</div><div class="rt-value"id="npsCorp">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Lump sum available</div><div class="rt-value"id="npsLump">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Annuity amount</div><div class="rt-value"id="npsAnnuity">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="npsGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var c=+document.getElementById("npsC").value,r=+document.getElementById("npsR").value/12/100,n=+document.getElementById("npsN").value*12,ann=+document.getElementById("npsAnn").value/100;
      var corp=r>0?c*(Math.pow(1+r,n)-1)/r:c*n;
      document.getElementById("npsCorp").textContent=fmt(corp);
      document.getElementById("npsAnnuity").textContent=fmt(corp*ann);
      document.getElementById("npsLump").textContent=fmt(corp*(1-ann));
      document.getElementById("npsProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["npsC","npsR","npsN","npsAnn"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("npsGo").addEventListener("click",run);run();`,
  article: {
    title: 'NPS Calculator: Project Your National Pension System Corpus',
    lead: '<p>The National Pension System builds a retirement corpus from regular contributions. This <strong>NPS calculator</strong> projects that corpus and splits it into the annuity portion and the lump sum you can withdraw.</p>',
    sections: [
      { id: 'annuity', icon: 'fa-solid fa-hand-holding-heart', heading: 'The annuity rule', html: '<p>Part of the corpus must be used to buy an annuity that pays you a lifelong pension; the remainder can be withdrawn as a lump sum. This calculator lets you set that split.</p>' },
      { id: 'growth', icon: 'fa-solid fa-chart-line', heading: 'Compounding over decades', html: '<p>Because NPS horizons are long, the final corpus is dominated by compounding. Even modest monthly contributions grow substantially over thirty years.</p>' }
    ],
    steps: ['Enter your monthly contribution.', 'Set the expected return and years to retirement.', 'Choose the annuity portion.', 'Read the total corpus, lump sum and annuity amount.'],
    facts: [['Contributions', 'Monthly'], ['Growth', 'Compounded monthly'], ['Split', 'Annuity and lump sum'], ['Data handling', 'Runs locally']],
    useCases: [['Retirement planning', 'See the pension and lump sum you might receive.'], ['Contribution tuning', 'Find the monthly amount that hits your target.'], ['Comparison', 'Weigh NPS against other retirement products.']],
    tips: ['Use a realistic long-term return.', 'The annuity minimum is set by regulation, so check current rules.', 'Small monthly increases early make a big difference.'],
    takeaways: ['A portion must fund a lifelong annuity.', 'Long horizons magnify compounding.', 'The lump sum is the corpus minus the annuity portion.'],
    faq: [['Can I withdraw the whole corpus?', 'No, a minimum portion must buy an annuity under current rules.'], ['Is the return guaranteed?', 'No, it depends on the chosen schemes.'], ['Can I change contributions?', 'This model assumes a level monthly contribution.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Build a secure retirement step by step, and compare with the <a href="ppf-calculator.html">PPF calculator</a>.</p>'
  }
});

/* ========================================================================
   16. EPF CALCULATOR
   ======================================================================== */
add({
  file: 'epf-calculator.html', folder: 'finance',
  name: 'EPF Calculator', tag: 'Pension', icon: 'fa-solid fa-briefcase',
  title: 'EPF Calculator | Employees Provident Fund Corpus',
  metaDesc: 'Estimate your Employees Provident Fund corpus at retirement from monthly contributions, interest rate and years of service. In-browser and private.',
  desc: 'Estimate the Employees Provident Fund balance at retirement from your monthly contribution, the EPF interest rate and years of service.',
  keywords: ['epf calculator', 'employees provident fund', 'pf calculator', 'epf corpus', 'provident fund', 'retirement savings'],
  featureList: ['Corpus at retirement', 'Monthly contributions', 'Interest compounding', '100% client-side'],
  panel: panel.wrap('epf', 'fa-solid fa-briefcase', 'EPF projection',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="epfC">Monthly contribution (you + employer)</label><input id="epfC"type="number"min="0"step="500"value="7200"></div>' +
    '<div class="field"><label for="epfR">EPF interest rate (%)</label><input id="epfR"type="number"min="0"step="0.1"value="8.25"></div>' +
    '<div class="field"><label for="epfN">Years of service</label><input id="epfN"type="number"min="1"step="1"value="30"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Total contributed</div><div class="rt-value"id="epfDep">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Interest earned</div><div class="rt-value"id="epfInt">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Corpus at retirement</div><div class="rt-value"id="epfCorp">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="epfGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var c=+document.getElementById("epfC").value,r=+document.getElementById("epfR").value/12/100,n=+document.getElementById("epfN").value*12;
      var corp=r>0?c*(Math.pow(1+r,n)-1)/r:c*n;
      var dep=c*n;
      document.getElementById("epfDep").textContent=fmt(dep);
      document.getElementById("epfInt").textContent=fmt(corp-dep);
      document.getElementById("epfCorp").textContent=fmt(corp);
      document.getElementById("epfProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["epfC","epfR","epfN"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("epfGo").addEventListener("click",run);run();`,
  article: {
    title: 'EPF Calculator: Project Your Provident Fund Corpus',
    lead: '<p>The Employees Provident Fund is a cornerstone of retirement saving for salaried workers. This <strong>EPF calculator</strong> projects the balance you could accumulate over your working life.</p>',
    sections: [
      { id: 'contributions', icon: 'fa-solid fa-hand-holding-dollar', heading: 'Both sides contribute', html: '<p>Your employer matches your contribution into the fund. Enter the combined monthly amount for the fullest picture, since both shares accrue interest.</p>' },
      { id: 'interest', icon: 'fa-solid fa-percent', heading: 'Interest is credited yearly', html: '<p>The fund earns a declared annual interest rate, credited to the balance. Over a long career this compounds into a substantial corpus.</p>' }
    ],
    steps: ['Enter your combined monthly EPF contribution.', 'Set the current EPF interest rate.', 'Enter your years of service.', 'Read total contributed, interest and the projected corpus.'],
    facts: [['Contributions', 'Employee plus employer'], ['Interest', 'Declared annually'], ['Output', 'Corpus and interest'], ['Data handling', 'Runs locally']],
    useCases: [['Career planning', 'See the retirement balance accrued over decades.'], ['Job changes', 'Estimate the value of transferring your PF.'], ['Comparison', 'Weigh EPF against other savings.']],
    tips: ['Use the most recent declared interest rate.', 'Include the employer share for accuracy.', 'Long tenures are dominated by interest, not contributions.'],
    takeaways: ['Employer contributions boost the corpus.', 'Declared interest compounds over the career.', 'Interest eventually outweighs contributions.'],
    faq: [['Is the contribution rate fixed?', 'Statutory rates apply to the basic salary; enter your actual combined amount.'], ['Does it include EPS?', 'No, this is the provident fund portion only.'], ['Can I model a raise?', 'This model assumes a level contribution.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>See the long-term value of your PF, then round out the picture with the <a href="gratuity-calculator.html">gratuity calculator</a>.</p>'
  }
});

/* ========================================================================
   17. RENT VS BUY CALCULATOR
   ======================================================================== */
add({
  file: 'rent-vs-buy-calculator.html', folder: 'finance',
  name: 'Rent vs Buy Calculator', tag: 'Real Estate', icon: 'fa-solid fa-house-chimney',
  title: 'Rent vs Buy Calculator | Which Is Cheaper Long Term',
  metaDesc: 'Compare the long-term cost of renting against buying a home, factoring in rent inflation, home appreciation and mortgage interest. In-browser.',
  desc: 'Compare the lifetime cost of renting versus buying a home, factoring in rent increases, home appreciation and loan interest.',
  keywords: ['rent vs buy', 'rent or buy calculator', 'home ownership cost', 'renting cost', 'buying a house', 'property calculator'],
  featureList: ['Lifetime rent cost', 'Lifetime buy cost', 'Net worth comparison', '100% client-side'],
  panel: panel.wrap('rvb', 'fa-solid fa-house-chimney', 'Rent vs buy',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="rvbRent">Monthly rent</label><input id="rvbRent"type="number"min="0"step="1000"value="25000"></div>' +
    '<div class="field"><label for="rvbRentR">Annual rent increase (%)</label><input id="rvbRentR"type="number"min="0"step="0.1"value="5"></div>' +
    '<div class="field"><label for="rvbPrice">Home price</label><input id="rvbPrice"type="number"min="0"step="100000"value="6000000"></div>' +
    '</div>' +
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="rvbRate">Loan rate (%)</label><input id="rvbRate"type="number"min="0"step="0.1"value="8"></div>' +
    '<div class="field"><label for="rvbApp">Home appreciation (%)</label><input id="rvbApp"type="number"min="0"step="0.1"value="6"></div>' +
    '<div class="field"><label for="rvbYears">Years</label><input id="rvbYears"type="number"min="1"step="1"value="20"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><div class="rt-label">Total rent paid</div><div class="rt-value"id="rvbRentTot">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Total buy cost</div><div class="rt-value"id="rvbBuyTot">-</div></div>' +
    '<div class="result-tile"><div class="rt-label">Home value later</div><div class="rt-value"id="rvbHome">-</div></div>' +
    '</div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="rvbGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>'),
  js: `
    function fmt(n){return "Rs "+Math.round(n).toLocaleString("en-IN");}
    function run(){var rent=+document.getElementById("rvbRent").value,rr=+document.getElementById("rvbRentR").value/100,price=+document.getElementById("rvbPrice").value;
      var rate=+document.getElementById("rvbRate").value/100,app=+document.getElementById("rvbApp").value/100,yrs=+document.getElementById("rvbYears").value;
      var y=0,rentTot=0,cur=rent;
      for(y=1;y<=yrs;y++){rentTot+=cur*12;cur*=(1+rr);}
      var n=yrs*12,mr=rate/12;
      var emi=mr>0?price*mr*Math.pow(1+mr,n)/(Math.pow(1+mr,n)-1):price/n;
      var buyTot=emi*n;
      var home=price*Math.pow(1+app,yrs);
      document.getElementById("rvbRentTot").textContent=fmt(rentTot);
      document.getElementById("rvbBuyTot").textContent=fmt(buyTot);
      document.getElementById("rvbHome").textContent=fmt(home);
      document.getElementById("rvbProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["rvbRent","rvbRentR","rvbPrice","rvbRate","rvbApp","rvbYears"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("rvbGo").addEventListener("click",run);run();`,
  article: {
    title: 'Rent vs Buy Calculator: The Long-Term Cost of a Home',
    lead: '<p>Renting and buying both cost money; the question is which costs less over your horizon. This <strong>rent vs buy calculator</strong> totals the rent you would pay against the mortgage cost of owning, and shows the future value of the home.</p>',
    sections: [
      { id: 'rent', icon: 'fa-solid fa-key', heading: 'The compounding cost of rent', html: '<p>Rent rises over time, so the total paid over twenty years is far more than the current monthly figure times twelve. The calculator compounds the increase yearly.</p>' },
      { id: 'buy', icon: 'fa-solid fa-house', heading: 'The mortgage and appreciation', html: '<p>Buying means paying loan interest but also owning an appreciating asset. The home value later column shows what the property could be worth, which offsets part of the cost.</p>' }
    ],
    steps: ['Enter the monthly rent and expected annual increase.', 'Enter the home price, loan rate and appreciation.', 'Set the comparison horizon.', 'Compare total rent, total buy cost and future home value.'],
    facts: [['Rent', 'Compounds yearly'], ['Buy', 'Mortgage plus appreciation'], ['Output', 'Lifetime costs'], ['Data handling', 'Runs locally']],
    useCases: [['First-time buyers', 'See whether buying beats renting on your timeline.'], ['Long-term planning', 'Understand how appreciation changes the maths.'], ['Budgeting', 'Compare monthly outgoings in context.']],
    tips: ['Include maintenance and taxes in your buy figures if you want more precision.', 'Shorter horizons often favour renting.', 'Appreciation assumptions strongly affect the outcome.'],
    takeaways: ['Rent compounds, so totals grow fast.', 'Buying builds equity through appreciation.', 'The horizon length decides the winner.'],
    faq: [['Does it include closing costs?', 'No, add those to your own comparison if needed.'], ['What about property tax?', 'Not included; it would raise the buy cost.'], ['Can I use a shorter horizon?', 'Yes, set any number of years.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Make the rent-or-buy decision with numbers, not gut feel. Then size the loan with the <a href="mortgage-calculator.html">mortgage calculator</a>.</p>'
  }
});

/* ========================================================================
   18. CURRENCY CONVERTER (offline simple rates) - skip live
   ======================================================================== */

/* ---------- emit pages + register ---------- */
const entries = [];
for (const spec of TOOLS) {
  const html = buildPage(spec);
  const outPath = path.join(ROOT, 'tools', spec.folder, spec.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  entries.push({
    name: spec.name, desc: spec.desc, icon: spec.icon, tag: spec.tag,
    category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file, keywords: spec.keywords,
    recent: true
  });
  console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');
}
const res = registerTools(entries);
console.log('registry: added', res.added, 'skipped', res.skipped);
