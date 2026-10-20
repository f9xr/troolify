/* ============================================================================
   Troolify - batch 15
   Health calculators migrated from allinonetools.net (client-side feasible).
   Run: node troolify-gen/gen-tools-batch15.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* small helper to make result tiles */
function tiles(pairs) {
  return '<div class="result-card"><div class="result-grid">' +
    pairs.map(p => '<div class="result-tile"><div class="rt-label">' + p[0] + '</div><div class="rt-value"id="' + p[1] + '">-</div></div>').join('') +
    '</div></div>';
}
function num(id, label, val, extra) {
  return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '"type="number"min="0"step="any"value="' + val + '"' + (extra || '') + '></div>';
}
function go(prefix, label) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-calculator"></i>' + (label || 'Calculate') + '</button></div>';
}
const FMT_R = 'function fmt(n){return (Math.round(n*100)/100);}';

/* ========================================================================
   1. eGFR CALCULATOR
   ======================================================================== */
add({
  file: 'egfr-calculator.html', folder: 'health',
  name: 'eGFR Calculator', tag: 'Kidney', icon: 'fa-solid fa-kidney',
  title: 'eGFR Calculator | Estimated Glomerular Filtration Rate',
  metaDesc: 'Estimate kidney function (eGFR) using serum creatinine, age and sex with the CKD-EPI formula. Free, private and in-browser.',
  desc: 'Estimate glomerular filtration rate from serum creatinine, age and sex using the CKD-EPI equation to gauge kidney function.',
  keywords: ['egfr calculator', 'glomerular filtration rate', 'kidney function', 'ckd-epi', 'creatinine', 'renal function'],
  featureList: ['CKD-EPI formula', 'Kidney stage', 'Instant result', '100% client-side'],
  panel: panel.wrap('egfr', 'fa-solid fa-kidney', 'eGFR (CKD-EPI)',
    '<div class="row3"style="margin-bottom:14px">' +
    num('egfrCr', 'Serum creatinine (mg/dL)', '1', 'step="0.01"') +
    num('egfrAge', 'Age (years)', '40') +
    '<div class="field"><label for="egfrSex">Sex</label><select id="egfrSex"><option value="m">Male</option><option value="f">Female</option></select></div>' +
    '</div>' + tiles([['eGFR', 'egfrOut'], ['Stage', 'egfrStage']]) + go('egfr')),
  js: `
    var F=document.getElementById("egfrSex");
    function run(){var cr=+document.getElementById("egfrCr").value,age=+document.getElementById("egfrAge").value,sex=F.value;
      var k=sex==="f"?0.7:0.9,a=sex==="f"?-0.241:-0.302;
      var r=cr/k;var min=Math.min(r,1),max=Math.max(r,1);
      var egfr=142*Math.pow(min,a)*Math.pow(max,-1.2)*Math.pow(0.9938,age)*(sex==="f"?1.012:1);
      document.getElementById("egfrOut").textContent=Math.round(egfr)+" mL/min/1.73m2";
      var st=egfr>=90?"G1 (normal)":egfr>=60?"G2 (mild)":egfr>=45?"G3a":egfr>=30?"G3b":egfr>=15?"G4 (severe)":"G5 (failure)";
      document.getElementById("egfrStage").textContent=st;
      document.getElementById("egfrProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["egfrCr","egfrAge","egfrSex"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("egfrGo").addEventListener("click",run);run();`,
  article: {
    title: 'eGFR Calculator: Estimate Your Kidney Filtration Rate',
    lead: '<p>The estimated glomerular filtration rate (eGFR) is a key measure of kidney function. This <strong>eGFR calculator</strong> uses serum creatinine, age and sex with the CKD-EPI equation, the standard in modern practice.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The CKD-EPI equation', html: '<p>The 2021 CKD-EPI creatinine equation estimates filtration without a race coefficient, using creatinine, age and sex. It is more accurate across the full range of kidney function than older formulas.</p>' },
      { id: 'stages', icon: 'fa-solid fa-layer-group', heading: 'Interpreting the stages', html: '<p>Results are grouped into stages from G1 (normal) to G5 (kidney failure). A single reading is a snapshot; trends over time matter more than one value.</p>' }
    ],
    steps: ['Enter your serum creatinine in mg/dL.', 'Enter your age and sex.', 'Read your eGFR and the corresponding stage.'],
    facts: [['Formula', 'CKD-EPI 2021'], ['Inputs', 'Creatinine, age, sex'], ['Units', 'mL/min/1.73m2'], ['Data handling', 'Runs locally']],
    useCases: [['Kidney monitoring', 'Track function over time.'], ['Chronic disease review', 'Gauge severity in the CKD staging system.'], ['General awareness', 'Understand a lab result in context.']],
    tips: ['Use a creatinine value from a recent test.', 'Compare trends rather than single readings.', 'Confirm results with a clinician.'],
    takeaways: ['eGFR estimates how well the kidneys filter.', 'CKD-EPI needs only creatinine, age and sex.', 'Higher eGFR means better function.'],
    faq: [['What eGFR is normal?', 'Above 90 with no other signs is considered normal.'], ['Does it diagnose kidney disease?', 'No, it is one input among several clinical findings.'], ['Why no race coefficient?', 'The 2021 equation removed it for a more equitable estimate.'], ['Is my data uploaded?', 'No, it runs in your browser.']],
    conclusion: '<p>Understand your kidney numbers, then explore other health metrics with the <a href="creatinine-clearance-calculator.html">creatinine clearance calculator</a>.</p>'
  }
});

/* ========================================================================
   2. CREATININE CLEARANCE (CRCL)
   ======================================================================== */
add({
  file: 'creatinine-clearance-calculator.html', folder: 'health',
  name: 'Creatinine Clearance Calculator', tag: 'Kidney', icon: 'fa-solid fa-flask-vial',
  title: 'Creatinine Clearance Calculator (Cockcroft-Gault)',
  metaDesc: 'Calculate creatinine clearance (CrCl) with the Cockcroft-Gault formula from age, weight, sex and serum creatinine. In-browser and private.',
  desc: 'Calculate creatinine clearance using the Cockcroft-Gault formula, widely used for drug dosing decisions.',
  keywords: ['creatinine clearance calculator', 'crcl', 'cockcroft-gault', 'renal clearance', 'drug dosing', 'kidney function'],
  featureList: ['Cockcroft-Gault formula', 'Adjusts for sex', 'Instant result', '100% client-side'],
  panel: panel.wrap('crcl', 'fa-solid fa-flask-vial', 'Creatinine clearance',
    '<div class="row3"style="margin-bottom:14px">' +
    num('crclAge', 'Age (years)', '40') +
    num('crclWt', 'Weight (kg)', '70', 'step="0.1"') +
    '<div class="field"><label for="crclSex">Sex</label><select id="crclSex"><option value="m">Male</option><option value="f">Female</option></select></div>' +
    '</div>' + num('crclCr', 'Serum creatinine (mg/dL)', '1', 'step="0.01"') +
    tiles([['CrCl', 'crclOut']]) + go('crcl')),
  js: `
    function run(){var age=+document.getElementById("crclAge").value,wt=+document.getElementById("crclWt").value,cr=+document.getElementById("crclCr").value,sex=document.getElementById("crclSex").value;
      if(!(cr>0)){return;}
      var crcl=(140-age)*wt/(72*cr)*(sex==="f"?0.85:1);
      document.getElementById("crclOut").textContent=Math.round(crcl)+" mL/min";
      document.getElementById("crclProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["crclAge","crclWt","crclCr","crclSex"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("crclGo").addEventListener("click",run);run();`,
  article: {
    title: 'Creatinine Clearance Calculator: Cockcroft-Gault Estimate',
    lead: '<p>The Cockcroft-Gault formula estimates creatinine clearance and is still used widely for drug dosing. This <strong>creatinine clearance calculator</strong> applies it to your age, weight, sex and serum creatinine.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The formula', html: '<p>CrCl equals <code>(140 - age) x weight / (72 x creatinine)</code>, multiplied by 0.85 for women. It estimates how much creatinine the kidneys clear per minute.</p>' },
      { id: 'use', icon: 'fa-solid fa-pills', heading: 'Why it is used', html: '<p>Many drug labels specify dose adjustments by creatinine clearance, so this estimate guides safe prescribing even where eGFR is also available.</p>' }
    ],
    steps: ['Enter age, weight and serum creatinine.', 'Select your sex.', 'Read the estimated creatinine clearance.'],
    facts: [['Formula', 'Cockcroft-Gault'], ['Inputs', 'Age, weight, sex, creatinine'], ['Units', 'mL/min'], ['Data handling', 'Runs locally']],
    useCases: [['Medication dosing', 'Support safe dose selection.'], ['Renal assessment', 'Add to your clinical picture.'], ['Comparison', 'Compare with the eGFR estimate.']],
    tips: ['Use actual body weight unless clinically directed otherwise.', 'Ensure creatinine is in mg/dL.', 'Confirm with your clinician for dosing.'],
    takeaways: ['Cockcroft-Gault estimates clearance per minute.', 'It adjusts for sex automatically.', 'It is commonly used for drug dosing.'],
    faq: [['How does it differ from eGFR?', 'It uses the older Cockcroft-Gault formula and includes weight.'], ['Which weight should I use?', 'Usually actual body weight.'], ['Is it a diagnosis?', 'No, it is an estimate for clinical guidance.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Add creatinine clearance to your kidney picture and compare it with the <a href="egfr-calculator.html">eGFR calculator</a>.</p>'
  }
});

/* ========================================================================
   3. BAC CALCULATOR
   ======================================================================== */
add({
  file: 'bac-calculator.html', folder: 'health',
  name: 'BAC Calculator', tag: 'Wellness', icon: 'fa-solid fa-wine-glass',
  title: 'BAC Calculator | Estimate Blood Alcohol Content',
  metaDesc: 'Estimate your blood alcohol content from drinks, body weight, sex and time elapsed using the Widmark formula. Informational, in-browser and private.',
  desc: 'Estimate blood alcohol content from the number of standard drinks, body weight, sex and hours elapsed, using the Widmark formula.',
  keywords: ['bac calculator', 'blood alcohol content', 'widmark formula', 'alcohol calculator', 'drink driving limit', 'standard drinks'],
  featureList: ['Widmark formula', 'Standard drinks', 'Time-based elimination', '100% client-side'],
  panel: panel.wrap('bac', 'fa-solid fa-wine-glass', 'Blood alcohol estimate',
    '<div class="row3"style="margin-bottom:14px">' +
    num('bacDrinks', 'Standard drinks', '2') +
    num('bacWt', 'Body weight (kg)', '70', 'step="0.1"') +
    '<div class="field"><label for="bacSex">Sex</label><select id="bacSex"><option value="m">Male</option><option value="f">Female</option></select></div>' +
    '</div>' + num('bacHours', 'Hours since first drink', '1', 'step="0.25"') +
    tiles([['Estimated BAC', 'bacOut'], ['Status', 'bacStat']]) + go('bac')),
  js: `
    function run(){var d=+document.getElementById("bacDrinks").value,wt=+document.getElementById("bacWt").value,sex=document.getElementById("bacSex").value,h=+document.getElementById("bacHours").value;
      var r=sex==="f"?0.55:0.68;
      var grams=d*14;
      var bac=grams*100/(wt*1000*r);
      var cur=bac-0.015*h;if(cur<0)cur=0;
      document.getElementById("bacOut").textContent=(Math.round(cur*1000)/1000)+"%";
      document.getElementById("bacStat").textContent=cur>=0.08?"Over 0.08%":cur>=0.05?"0.05-0.08%":cur>0?"Under 0.05%":"Sober";
      document.getElementById("bacProc").textContent="Estimate only - never drive after drinking.";}
    ["bacDrinks","bacWt","bacSex","bacHours"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("bacGo").addEventListener("click",run);run();`,
  article: {
    title: 'BAC Calculator: Estimate Blood Alcohol Content',
    lead: '<p>Blood alcohol content depends on how much you drink, your body weight, your sex and how much time has passed. This <strong>BAC calculator</strong> estimates it with the Widmark formula and a standard elimination rate.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The Widmark estimate', html: '<p>Alcohol is distributed through body water. The formula divides the grams of alcohol consumed by body weight and a sex-based distribution factor, then subtracts roughly 0.015% per hour for elimination.</p>' },
      { id: 'caution', icon: 'fa-solid fa-triangle-exclamation', heading: 'An estimate, not a breath test', html: '<p>Individual metabolism, food, medication and hydration all affect real BAC. Never use an estimate to decide whether it is safe to drive.</p>' }
    ],
    steps: ['Enter the number of standard drinks.', 'Enter your body weight and sex.', 'Enter the hours since your first drink.', 'Read the estimated BAC and status band.'],
    facts: [['Formula', 'Widmark'], ['Standard drink', 'About 14 g alcohol'], ['Elimination', 'About 0.015%/hour'], ['Data handling', 'Runs locally']],
    useCases: [['Awareness', 'Understand how drinks add up.'], ['Education', 'See the effect of weight and time.'], ['Planning', 'Learn why time is the only thing that lowers BAC.']],
    tips: ['Count every standard drink accurately.', 'Food slows absorption but does not remove alcohol.', 'Coffee and cold showers do not reduce BAC.'],
    takeaways: ['BAC rises with drinks and falls with time.', 'Body weight and sex change the result.', 'The estimate never replaces a real test.'],
    faq: [['Can I drive below 0.08%?', 'Legal limits vary and impairment starts below them; never rely on an estimate.'], ['What is a standard drink?', 'Roughly 14 grams of pure alcohol.'], ['Does food change BAC?', 'It slows absorption, so timing shifts.'], ['Is this medical advice?', 'No, it is for general information only.']],
    conclusion: '<p>Stay safe by understanding the numbers. Track related wellness data with the <a href="water-intake-calculator.html">water intake calculator</a>.</p>'
  }
});

/* ========================================================================
   4. VO2 MAX CALCULATOR
   ======================================================================== */
add({
  file: 'vo2-max-calculator.html', folder: 'health',
  name: 'VO2 Max Calculator', tag: 'Fitness', icon: 'fa-solid fa-person-running',
  title: 'VO2 Max Calculator | Estimate Cardiovascular Fitness',
  metaDesc: 'Estimate your VO2 max from resting and maximum heart rate or the Cooper test. Gauge aerobic fitness instantly, in your browser.',
  desc: 'Estimate VO2 max, a key measure of aerobic fitness, from your resting and maximum heart rate or a Cooper 12-minute run distance.',
  keywords: ['vo2 max calculator', 'aerobic capacity', 'cardiovascular fitness', 'cooper test', 'resting heart rate', 'maximum heart rate'],
  featureList: ['Heart-rate method', 'Cooper 12-minute test', 'Fitness rating', '100% client-side'],
  panel: panel.wrap('vo2', 'fa-solid fa-person-running', 'VO2 max',
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="vo2Method">Method</label><select id="vo2Method"><option value="hr">Heart rate (resting + max)</option><option value="cooper">Cooper 12-min run</option></select></div>' +
    '<div class="row3"style="margin-bottom:14px">' +
    num('vo2Rest', 'Resting heart rate (bpm)', '60') +
    num('vo2Max', 'Maximum heart rate (bpm)', '185') +
    num('vo2Dist', '12-min distance (m)', '2400') +
    '</div>' + tiles([['VO2 max', 'vo2Out'], ['Rating', 'vo2Rate']]) + go('vo2')),
  js: `
    var M=document.getElementById("vo2Method");
    function run(){var m=M.value,vo2;
      if(m==="hr"){var hrrest=+document.getElementById("vo2Rest").value,hrmax=+document.getElementById("vo2Max").value;vo2=15.3*(hrmax/hrrest);}
      else{var d=+document.getElementById("vo2Dist").value;vo2=(d-504.9)/44.73;}
      document.getElementById("vo2Out").textContent=(Math.round(vo2*10)/10)+" mL/kg/min";
      var r=vo2>=50?"Excellent":vo2>=42?"Good":vo2>=35?"Average":vo2>=28?"Fair":"Below average";
      document.getElementById("vo2Rate").textContent=r;
      document.getElementById("vo2Proc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["vo2Method","vo2Rest","vo2Max","vo2Dist"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("vo2Go").addEventListener("click",run);run();`,
  article: {
    title: 'VO2 Max Calculator: Measure Your Aerobic Capacity',
    lead: '<p>VO2 max is the maximum volume of oxygen your body can use during intense exercise, and it is one of the best single measures of cardiovascular fitness. This <strong>VO2 max calculator</strong> estimates it two ways.</p>',
    sections: [
      { id: 'methods', icon: 'fa-solid fa-heart-pulse', heading: 'Two estimation methods', html: '<p>The heart-rate method uses the ratio of maximum to resting heart rate, known as the Uth-Sorensen-Overgaard-Pedersen estimate. The Cooper method uses the distance covered in a twelve-minute run.</p>' },
      { id: 'meaning', icon: 'fa-solid fa-chart-line', heading: 'What the number means', html: '<p>Higher values indicate better aerobic fitness. Typical ranges differ by age and sex, and training, particularly interval work, can raise VO2 max over time.</p>' }
    ],
    steps: ['Choose the heart-rate or Cooper method.', 'Enter the required values.', 'Read your estimated VO2 max and rating.'],
    facts: [['Methods', 'Heart rate, Cooper run'], ['Units', 'mL/kg/min'], ['Output', 'VO2 max and rating'], ['Data handling', 'Runs locally']],
    useCases: [['Fitness tracking', 'Measure aerobic capacity over a training block.'], ['Training zones', 'Anchor exercise intensity to VO2 max.'], ['Health screening', 'Gauge cardiovascular fitness.']],
    tips: ['Measure resting heart rate on waking.', 'Estimate maximum heart rate as 220 minus age if untested.', 'Keep conditions consistent between tests.'],
    takeaways: ['VO2 max measures aerobic capacity.', 'Two field methods estimate it without a lab.', 'Higher is better; training can improve it.'],
    faq: [['Which method is more accurate?', 'Lab testing is most accurate; both field methods are estimates.'], ['What is a good VO2 max?', 'It varies by age and sex; above 42 is generally strong.'], ['Can I improve it?', 'Yes, with consistent aerobic and interval training.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Track your aerobic fitness, then size your training with the <a href="heart-rate-zones-calculator.html">heart rate zones calculator</a>.</p>'
  }
});

/* ========================================================================
   5. BLOOD PRESSURE CHART
   ======================================================================== */
add({
  file: 'blood-pressure-chart.html', folder: 'health',
  name: 'Blood Pressure Chart', tag: 'Heart', icon: 'fa-solid fa-heart-pulse',
  title: 'Blood Pressure Chart | Classify Your Reading',
  metaDesc: 'Classify a blood pressure reading into categories from normal to hypertensive crisis. See your category instantly, in-browser and private.',
  desc: 'Classify a systolic and diastolic reading into standard blood pressure categories, from normal through to hypertensive crisis.',
  keywords: ['blood pressure chart', 'blood pressure categories', 'hypertension', 'systolic diastolic', 'bp classification', 'blood pressure ranges'],
  featureList: ['AHA categories', 'Systolic and diastolic', 'Instant classification', '100% client-side'],
  panel: panel.wrap('bp', 'fa-solid fa-heart-pulse', 'Blood pressure',
    '<div class="row3"style="margin-bottom:14px">' +
    num('bpSys', 'Systolic (mmHg)', '120') +
    num('bpDia', 'Diastolic (mmHg)', '80') +
    '</div>' + tiles([['Category', 'bpCat'], ['Reading', 'bpRead']]) + go('bp') +
    '<div id="bpTable"style="margin-top:8px"></div>'),
  css: '#bpTable table{width:100%;border-collapse:collapse;font-size:12.5px}#bpTable th,#bpTable td{border:1px solid var(--border);padding:6px 8px;text-align:left}#bpTable th{background:rgba(255,255,255,.04)}',
  js: `
    function run(){var s=+document.getElementById("bpSys").value,d=+document.getElementById("bpDia").value;
      var cat;
      if(s>=180||d>=120)cat="Hypertensive crisis";
      else if(s>=140||d>=90)cat="Stage 2 hypertension";
      else if(s>=130||d>=80)cat="Stage 1 hypertension";
      else if(s>=120)cat="Elevated";
      else cat="Normal";
      document.getElementById("bpCat").textContent=cat;
      document.getElementById("bpRead").textContent=s+"/"+d+" mmHg";
      document.getElementById("bpProc").textContent="Informational only - confirm with a clinician.";}
    ["bpSys","bpDia"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("bpGo").addEventListener("click",run);run();
    document.getElementById("bpTable").innerHTML="<table><thead><tr><th>Category</th><th>Systolic</th><th>Diastolic</th></tr></thead><tbody><tr><td>Normal</td><td>&lt;120</td><td>and &lt;80</td></tr><tr><td>Elevated</td><td>120-129</td><td>and &lt;80</td></tr><tr><td>Stage 1</td><td>130-139</td><td>or 80-89</td></tr><tr><td>Stage 2</td><td>&ge;140</td><td>or &ge;90</td></tr><tr><td>Crisis</td><td>&gt;180</td><td>or &gt;120</td></tr></tbody></table>";`,
  article: {
    title: 'Blood Pressure Chart: Classify Your Reading',
    lead: '<p>Blood pressure is written as systolic over diastolic. This <strong>blood pressure chart</strong> classifies a reading into standard categories so you can see where it falls at a glance.</p>',
    sections: [
      { id: 'numbers', icon: 'fa-solid fa-hashtag', heading: 'What the two numbers mean', html: '<p>Systolic is the pressure when the heart contracts; diastolic is the pressure between beats. Both matter, and the higher category of the two determines your classification.</p>' },
      { id: 'categories', icon: 'fa-solid fa-layer-group', heading: 'The categories', html: '<p>Readings move from normal through elevated, stage 1 and stage 2 hypertension to hypertensive crisis. A single high reading is not a diagnosis; consistent patterns across time are what clinicians assess.</p>' }
    ],
    steps: ['Enter your systolic reading.', 'Enter your diastolic reading.', 'Read your category and compare against the reference table.'],
    facts: [['Measure', 'Systolic / diastolic'], ['Categories', 'Normal to crisis'], ['Output', 'Classification'], ['Data handling', 'Runs locally']],
    useCases: [['Home monitoring', 'Log and classify readings.'], ['Awareness', 'Understand your numbers.'], ['Trends', 'See when to seek advice.']],
    tips: ['Measure while rested and seated.', 'Take two readings and average them.', 'A single reading is a snapshot, not a diagnosis.'],
    takeaways: ['The higher of the two numbers sets the category.', 'Consistent high readings warrant medical advice.', 'Crisis readings need urgent care.'],
    faq: [['What is a normal reading?', 'Below 120 over 80 is considered normal.'], ['Is one high reading serious?', 'Not necessarily; sustained elevations matter more.'], ['Should I stop medication?', 'Never change treatment without your clinician.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Know your numbers and act early. Track other heart metrics with the <a href="heart-rate-zones-calculator.html">heart rate zones calculator</a>.</p>'
  }
});

/* ========================================================================
   6. HEART RATE ZONES
   ======================================================================== */
add({
  file: 'heart-rate-zones-calculator.html', folder: 'health',
  name: 'Heart Rate Zones Calculator', tag: 'Fitness', icon: 'fa-solid fa-heart',
  title: 'Heart Rate Zones Calculator | Training Zones by Age',
  metaDesc: 'Calculate your five training heart-rate zones from age and resting heart rate using the Karvonen method. In-browser and private.',
  desc: 'Work out your five training heart-rate zones from age and resting heart rate using the Karvonen formula.',
  keywords: ['heart rate zones', 'training zones', 'karvonen formula', 'maximum heart rate', 'fat burn zone', 'cardio zones'],
  featureList: ['Five training zones', 'Karvonen method', 'Resting heart rate input', '100% client-side'],
  panel: panel.wrap('hrz', 'fa-solid fa-heart', 'Heart rate zones',
    '<div class="row3"style="margin-bottom:14px">' +
    num('hrzAge', 'Age (years)', '30') +
    num('hrzRest', 'Resting heart rate (bpm)', '60') +
    '</div>' + tiles([['Max heart rate', 'hrzMax']]) + go('hrz') +
    '<div id="hrzTable"style="margin-top:8px"></div>'),
  css: '#hrzTable table{width:100%;border-collapse:collapse;font-size:12.5px}#hrzTable th,#hrzTable td{border:1px solid var(--border);padding:6px 10px;text-align:left}#hrzTable th{background:rgba(255,255,255,.04)}',
  js: `
    function run(){var age=+document.getElementById("hrzAge").value,rest=+document.getElementById("hrzRest").value;
      var max=220-age;document.getElementById("hrzMax").textContent=max+" bpm";
      var res=rest+(max-rest);
      var zones=[[50,60,"Very light"],[60,70,"Light"],[70,80,"Moderate"],[80,90,"Hard"],[90,100,"Maximum"]];
      var rows="<table><thead><tr><th>Zone</th><th>Intensity</th><th>Heart rate</th></tr></thead><tbody>";
      zones.forEach(function(z,i){var lo=Math.round(rest+(max-rest)*z[0]/100),hi=Math.round(rest+(max-rest)*z[1]/100);rows+="<tr><td>Z"+(i+1)+"</td><td>"+z[2]+"</td><td>"+lo+" - "+hi+" bpm</td></tr>";});
      rows+="</tbody></table>";document.getElementById("hrzTable").innerHTML=rows;
      document.getElementById("hrzProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["hrzAge","hrzRest"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("hrzGo").addEventListener("click",run);run();`,
  article: {
    title: 'Heart Rate Zones Calculator: Train at the Right Intensity',
    lead: '<p>Training zones help you target the right intensity for endurance, fat burning or speed. This <strong>heart rate zones calculator</strong> uses your age and resting heart rate with the Karvonen method to define five zones.</p>',
    sections: [
      { id: 'karvonen', icon: 'fa-solid fa-square-root-variable', heading: 'The Karvonen method', html: '<p>Karvonen accounts for resting heart rate by working from heart-rate reserve, the gap between resting and maximum heart rate. Target rate equals resting rate plus a percentage of that reserve.</p>' },
      { id: 'zones', icon: 'fa-solid fa-layer-group', heading: 'Using the zones', html: '<p>Lower zones build aerobic base and aid recovery; higher zones improve speed and power. Most endurance training sits in zones two and three.</p>' }
    ],
    steps: ['Enter your age.', 'Enter your resting heart rate.', 'Read your maximum heart rate and five training zones.'],
    facts: [['Method', 'Karvonen'], ['Zones', 'Five intensity bands'], ['Output', 'BPM ranges'], ['Data handling', 'Runs locally']],
    useCases: [['Endurance training', 'Keep easy runs genuinely easy.'], ['Interval work', 'Target the upper zones.'], ['Recovery', 'Stay in zone one on rest days.']],
    tips: ['Measure resting heart rate on waking.', 'Use a chest strap for accuracy during intervals.', 'Reassess zones as fitness improves.'],
    takeaways: ['Karvonen uses heart-rate reserve.', 'Five zones cover recovery to maximum effort.', 'Most training should be in the lower zones.'],
    faq: [['Is 220 minus age accurate?', 'It is an average; individual maximums vary.'], ['Do I need a heart-rate monitor?', 'A monitor helps you stay in zone.'], ['Which zone burns fat?', 'Lower-intensity zones use more fat as fuel.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Train smarter with the right zones, and estimate fitness with the <a href="vo2-max-calculator.html">VO2 max calculator</a>.</p>'
  }
});

/* ========================================================================
   7. WEIGHT LOSS CALCULATOR
   ======================================================================== */
add({
  file: 'weight-loss-calculator.html', folder: 'health',
  name: 'Weight Loss Calculator', tag: 'Fitness', icon: 'fa-solid fa-weight-scale',
  title: 'Weight Loss Calculator | Time to Reach Your Goal',
  metaDesc: 'Estimate how long it takes to lose a target weight from your daily calorie deficit. See weekly loss and a completion date estimate, in-browser.',
  desc: 'Estimate the time needed to lose a target amount of weight based on a daily calorie deficit.',
  keywords: ['weight loss calculator', 'calorie deficit', 'how long to lose weight', 'weight loss timeline', 'calories per day'],
  featureList: ['Calorie deficit based', 'Weekly loss rate', 'Time to goal', '100% client-side'],
  panel: panel.wrap('wl', 'fa-solid fa-weight-scale', 'Weight loss',
    '<div class="row3"style="margin-bottom:14px">' +
    num('wlCur', 'Current weight (kg)', '80', 'step="0.1"') +
    num('wlGoal', 'Goal weight (kg)', '70', 'step="0.1"') +
    num('wlDef', 'Daily calorie deficit', '500') +
    '</div>' + tiles([['Weight to lose', 'wlDiff'], ['Weekly loss', 'wlWeek'], ['Time to goal', 'wlTime']]) + go('wl')),
  js: `
    function run(){var cur=+document.getElementById("wlCur").value,goal=+document.getElementById("wlGoal").value,def=+document.getElementById("wlDef").value;
      var diff=Math.max(0,cur-goal);
      var weekly=def*7/7700;
      document.getElementById("wlDiff").textContent=(Math.round(diff*10)/10)+" kg";
      document.getElementById("wlWeek").textContent=(Math.round(weekly*100)/100)+" kg/week";
      var weeks=weekly>0?diff/weekly:0;
      document.getElementById("wlTime").textContent=weekly>0?(Math.round(weeks*10)/10)+" weeks":"-";
      document.getElementById("wlProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["wlCur","wlGoal","wlDef"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("wlGo").addEventListener("click",run);run();`,
  article: {
    title: 'Weight Loss Calculator: How Long Will It Take?',
    lead: '<p>Weight loss comes down to a calorie deficit sustained over time. This <strong>weight loss calculator</strong> estimates how long a given daily deficit takes you to reach your goal weight.</p>',
    sections: [
      { id: 'energy', icon: 'fa-solid fa-fire', heading: 'The energy maths', html: '<p>Roughly 7,700 calories make up a kilogram of body weight. A daily deficit of 500 calories, for example, produces about half a kilogram a week.</p>' },
      { id: 'safety', icon: 'fa-solid fa-shield-heart', heading: 'Keeping it healthy', html: '<p>Very large deficits are hard to sustain and can harm health. Aim for steady loss and consult a professional for a plan tailored to you.</p>' }
    ],
    steps: ['Enter your current and goal weight.', 'Enter your planned daily calorie deficit.', 'Read the weight to lose, weekly rate and estimated time.'],
    facts: [['Energy per kg', 'About 7,700 kcal'], ['Output', 'Weekly loss and time'], ['Basis', 'Calorie deficit'], ['Data handling', 'Runs locally']],
    useCases: [['Goal setting', 'Set a realistic timeline.'], ['Diet planning', 'Choose a sustainable deficit.'], ['Progress checks', 'Compare actual against predicted loss.']],
    tips: ['A deficit of 300 to 500 calories is usually sustainable.', 'Recalculate as your weight changes.', 'Combine diet with resistance training to preserve muscle.'],
    takeaways: ['Deficit times time equals weight lost.', 'Half a kilogram a week needs about a 500-calorie deficit.', 'Slow, steady loss is easier to keep off.'],
    faq: [['Is a big deficit better?', 'No, it is harder to sustain and can be unhealthy.'], ['Does metabolism change?', 'Yes, so recalculate as you progress.'], ['Is this medical advice?', 'No, consult a professional for a personal plan.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Set a realistic goal and pace yourself. Plan your intake with the <a href="calorie-calculator.html">calorie calculator</a>.</p>'
  }
});

/* ========================================================================
   8. PERIOD CALCULATOR
   ======================================================================== */
add({
  file: 'period-calculator.html', folder: 'health',
  name: 'Period Calculator', tag: 'Cycle', icon: 'fa-solid fa-calendar-days',
  title: 'Period Calculator | Predict Your Next Periods',
  metaDesc: 'Predict your next several periods and ovulation dates from your last period and average cycle length. Free, private and in-browser.',
  desc: 'Predict the dates of your next several periods and estimated ovulation from your last period date and average cycle length.',
  keywords: ['period calculator', 'menstrual cycle calculator', 'next period', 'ovulation date', 'cycle length', 'period tracker'],
  featureList: ['Next 6 periods', 'Ovulation estimate', 'Cycle length input', '100% client-side'],
  panel: panel.wrap('pd', 'fa-solid fa-calendar-days', 'Period prediction',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="pdLast">First day of last period</label><input id="pdLast"type="date"></div>' +
    num('pdCycle', 'Average cycle length (days)', '28') +
    num('pdLen', 'Period length (days)', '5') +
    '</div>' + go('pd', 'Predict') +
    '<div id="pdOut"style="margin-top:8px"></div>'),
  css: '#pdOut table{width:100%;border-collapse:collapse;font-size:12.5px}#pdOut th,#pdOut td{border:1px solid var(--border);padding:6px 10px;text-align:left}#pdOut th{background:rgba(255,255,255,.04)}',
  js: `
    function run(){var last=document.getElementById("pdLast").value;if(!last){return;}
      var cyc=+document.getElementById("pdCycle").value;
      var start=new Date(last);
      var rows="<table><thead><tr><th>Period</th><th>Starts</th><th>Estimated ovulation</th></tr></thead><tbody>";
      for(var i=0;i<6;i++){var s=new Date(start.getTime()+cyc*i*86400000);var ov=new Date(s.getTime()+(cyc-14)*86400000);
        rows+="<tr><td>"+(i+1)+"</td><td>"+s.toDateString()+"</td><td>"+ov.toDateString()+"</td></tr>";}
      rows+="</tbody></table>";document.getElementById("pdOut").innerHTML=rows;
      document.getElementById("pdProc").textContent="Predictions are estimates - cycles vary.";}
    ["pdLast","pdCycle","pdLen"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("pdGo").addEventListener("click",run);run();`,
  article: {
    title: 'Period Calculator: Predict Your Next Cycle',
    lead: '<p>Knowing roughly when your next period and fertile window fall helps with planning and awareness. This <strong>period calculator</strong> projects your next six cycles from your last period and average cycle length.</p>',
    sections: [
      { id: 'cycle', icon: 'fa-solid fa-arrows-spin', heading: 'How the prediction works', html: '<p>Each cycle is assumed to be the same length. Adding the cycle length repeatedly projects future period start dates, and ovulation is estimated about fourteen days before the next period.</p>' },
      { id: 'variation', icon: 'fa-solid fa-wave-square', heading: 'Cycles vary', html: '<p>Real cycles fluctuate with stress, travel and health. Use the predictions as a guide, not a certainty, and adjust the average as you learn your pattern.</p>' }
    ],
    steps: ['Enter the first day of your last period.', 'Enter your average cycle and period length.', 'Read the predicted dates and ovulation estimates.'],
    facts: [['Prediction', 'Next six periods'], ['Ovulation', 'About 14 days before'], ['Input', 'Cycle length'], ['Data handling', 'Runs locally']],
    useCases: [['Planning', 'Anticipate upcoming periods.'], ['Fertility awareness', 'Note the estimated fertile window.'], ['Tracking', 'Compare predictions with actual dates.']],
    tips: ['Use your typical cycle length, not a single month.', 'Ovulation estimates are rough.', 'Irregular cycles need medical advice.'],
    takeaways: ['Predictions assume a regular cycle.', 'Ovulation is estimated before the next period.', 'Actual cycles can vary.'],
    faq: [['How accurate is it?', 'It is a guide; real cycles vary.'], ['Can I use it for contraception?', 'No, it is not a reliable contraceptive method.'], ['What if my cycle is irregular?', 'Consult a healthcare provider.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Track your cycle with a clearer picture, and estimate related dates with the <a href="ovulation-calculator.html">ovulation calculator</a>.</p>'
  }
});

/* ========================================================================
   9. FERTILITY WINDOW
   ======================================================================== */
add({
  file: 'fertility-window-calculator.html', folder: 'health',
  name: 'Fertility Window Calculator', tag: 'Cycle', icon: 'fa-solid fa-heart-circle-plus',
  title: 'Fertility Window Calculator | Most Fertile Days',
  metaDesc: 'Estimate your fertile window and most fertile days from your cycle length and last period date. Educational, in-browser and private.',
  desc: 'Estimate the fertile window and peak fertile days in your cycle from the last period date and average cycle length.',
  keywords: ['fertility window calculator', 'fertile days', 'ovulation window', 'conception chances', 'cycle fertility', 'trying to conceive'],
  featureList: ['Fertile window', 'Peak fertile days', 'Ovulation estimate', '100% client-side'],
  panel: panel.wrap('fw', 'fa-solid fa-heart-circle-plus', 'Fertility window',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="fwLast">First day of last period</label><input id="fwLast"type="date"></div>' +
    num('fwCycle', 'Average cycle length (days)', '28') +
    '</div>' + go('fw', 'Calculate') +
    '<div id="fwOut"style="margin-top:8px"></div>'),
  css: '#fwOut table{width:100%;border-collapse:collapse;font-size:12.5px}#fwOut th,#fwOut td{border:1px solid var(--border);padding:6px 10px;text-align:left}#fwOut th{background:rgba(255,255,255,.04)}',
  js: `
    function run(){var last=document.getElementById("fwLast").value;if(!last){return;}
      var cyc=+document.getElementById("fwCycle").value;var s=new Date(last);
      var ovDay=cyc-14;
      var winStart=ovDay-5,winEnd=ovDay+1;
      var day=new Date(s.getTime()+(winStart)*86400000);
      var ov=new Date(s.getTime()+(ovDay)*86400000);
      var end=new Date(s.getTime()+(winEnd)*86400000);
      document.getElementById("fwOut").innerHTML="<table><tbody><tr><th>Cycle day</th><td>"+cyc+"</td></tr><tr><th>Estimated ovulation</th><td>"+ov.toDateString()+"</td></tr><tr><th>Fertile window</th><td>"+day.toDateString()+" to "+end.toDateString()+"</td></tr><tr><th>Peak fertile</th><td>2 days before to 1 day after ovulation</td></tr></tbody></table>";
      document.getElementById("fwProc").textContent="Estimates only - not a contraceptive method.";}
    ["fwLast","fwCycle"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("fwGo").addEventListener("click",run);run();`,
  article: {
    title: 'Fertility Window Calculator: Identify Your Most Fertile Days',
    lead: '<p>Conception is most likely in the few days around ovulation. This <strong>fertility window calculator</strong> estimates that window from your cycle length and last period date.</p>',
    sections: [
      { id: 'window', icon: 'fa-solid fa-calendar-check', heading: 'The fertile window', html: '<p>Sperm can survive several days, so the fertile window starts about five days before ovulation and ends about a day after. The days just before ovulation are the most fertile.</p>' },
      { id: 'limits', icon: 'fa-solid fa-circle-info', heading: 'Estimates, not guarantees', html: '<p>Ovulation timing varies between cycles. This tool is educational and should not be used as a contraceptive method.</p>' }
    ],
    steps: ['Enter the first day of your last period.', 'Enter your average cycle length.', 'Read your estimated ovulation and fertile window.'],
    facts: [['Window', 'About 6 days'], ['Ovulation', 'About 14 days before next period'], ['Output', 'Dates and peak days'], ['Data handling', 'Runs locally']],
    useCases: [['Trying to conceive', 'Time intercourse around the window.'], ['Cycle awareness', 'Understand your pattern.'], ['Planning', 'Anticipate fertile periods.']],
    tips: ['Track several cycles to refine your average.', 'Ovulation predictor kits add precision.', 'Seek advice if cycles are irregular.'],
    takeaways: ['The fertile window surrounds ovulation.', 'Peak fertility is just before ovulation.', 'Timing varies, so track consistently.'],
    faq: [['Is this birth control?', 'No, it cannot be relied on to prevent pregnancy.'], ['How long is the window?', 'Roughly six days.'], ['When is ovulation?', 'Usually about fourteen days before your next period.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Improve your chances by understanding timing, and see your cycle with the <a href="ovulation-calculator.html">ovulation calculator</a>.</p>'
  }
});

/* ========================================================================
   10. BABY GROWTH PERCENTILE
   ======================================================================== */
add({
  file: 'baby-growth-calculator.html', folder: 'health',
  name: 'Baby Growth Calculator', tag: 'Pediatrics', icon: 'fa-solid fa-baby',
  title: 'Baby Growth Calculator | Weight & Height Percentile',
  metaDesc: 'Estimate a baby or child weight percentile from age, sex and weight using average growth references. Educational, in-browser and private.',
  desc: 'Estimate a child weight percentile from age, sex and weight using population average growth references.',
  keywords: ['baby growth calculator', 'child weight percentile', 'growth chart', 'baby weight', 'who growth standards', 'pediatric growth'],
  featureList: ['Weight percentile', 'Sex-specific', 'Simple estimate', '100% client-side'],
  panel: panel.wrap('bg', 'fa-solid fa-baby', 'Growth percentile',
    '<div class="row3"style="margin-bottom:14px">' +
    num('bgAge', 'Age (months)', '12') +
    num('bgWt', 'Weight (kg)', '9.5', 'step="0.1"') +
    '<div class="field"><label for="bgSex">Sex</label><select id="bgSex"><option value="m">Boy</option><option value="f">Girl</option></select></div>' +
    '</div>' + tiles([['Reference median', 'bgMed'], ['Approx. percentile', 'bgPct']]) + go('bg')),
  js: `
    function run(){var age=+document.getElementById("bgAge").value,wt=+document.getElementById("bgWt").value,sex=document.getElementById("bgSex").value;
      // simplified reference medians (kg) by month for boys/girls
      var boy=[3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6];
      var girl=[3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9];
      var ref=sex==="m"?boy:girl;
      var idx=Math.min(ref.length-1,Math.max(0,Math.round(age)));
      // interpolate for ages beyond 12 using last slope
      var med;
      if(age<=12){var lo=Math.floor(age),hi=Math.min(12,lo+1);var f=age-lo;med=ref[lo]*(1-f)+ref[hi]*f;}
      else{med=ref[12]+(age-12)*0.25;}
      var z=(wt-med)/ (0.12*med);
      var pct=50+34*z; if(pct<1)pct=1;if(pct>99)pct=99;
      document.getElementById("bgMed").textContent=(Math.round(med*10)/10)+" kg";
      document.getElementById("bgPct").textContent=Math.round(pct)+"th";
      document.getElementById("bgProc").textContent="Simplified estimate - use official growth charts.";}
    ["bgAge","bgWt","bgSex"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("bgGo").addEventListener("click",run);run();`,
  article: {
    title: 'Baby Growth Calculator: Where Does Your Child Sit?',
    lead: '<p>Growth charts track a child against population references. This <strong>baby growth calculator</strong> gives a simplified weight percentile from age, sex and weight.</p>',
    sections: [
      { id: 'percentile', icon: 'fa-solid fa-chart-line', heading: 'What a percentile means', html: '<p>A percentile describes how a measurement compares with other children of the same age and sex. The fiftieth percentile is the median; being above or below it is not by itself a problem.</p>' },
      { id: 'simplified', icon: 'fa-solid fa-circle-info', heading: 'A simplified model', html: '<p>This tool uses average reference medians and a standard-deviation estimate. Official growth charts from health authorities are more precise and should be used for clinical decisions.</p>' }
    ],
    steps: ['Enter the child age in months.', 'Enter the weight in kilograms.', 'Select the sex.', 'Read the reference median and estimated percentile.'],
    facts: [['Basis', 'Average growth references'], ['Output', 'Approx. percentile'], ['Age', 'Months'], ['Data handling', 'Runs locally']],
    useCases: [['Parental awareness', 'See roughly where a child falls.'], ['Trend watching', 'Combine with records over time.'], ['Education', 'Understand percentiles.']],
    tips: ['Use consistent weighing conditions.', 'Trends matter more than single values.', 'Consult a pediatrician for concerns.'],
    takeaways: ['Percentiles compare a child with peers.', 'The median is the fiftieth percentile.', 'Official charts are more precise.'],
    faq: [['Is this a medical diagnosis?', 'No, it is an educational estimate.'], ['What percentile is normal?', 'A wide range is healthy; trends matter more.'], ['Does it work for older children?', 'It is designed for the first years of life.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Follow growth with context, and plan nutrition with the <a href="macro-calculator.html">macro calculator</a>.</p>'
  }
});

/* ========================================================================
   11. STRESS LEVEL TEST
   ======================================================================== */
add({
  file: 'stress-test.html', folder: 'health',
  name: 'Stress Level Test', tag: 'Wellness', icon: 'fa-solid fa-brain',
  title: 'Stress Level Test | Quick Self-Assessment',
  metaDesc: 'Take a short ten-question self-assessment to gauge your current stress level. Private, educational and fully in-browser.',
  desc: 'Answer ten short questions to get an indicative stress score and general guidance, based on a simplified self-assessment.',
  keywords: ['stress test', 'stress level', 'stress assessment', 'mental wellbeing', 'self assessment', 'burnout check'],
  featureList: ['Ten questions', 'Instant score', 'General guidance', '100% client-side'],
  panel: panel.wrap('str', 'fa-solid fa-brain', 'Stress self-check',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13.5px">Rate how often each statement applied over the past two weeks.</p>' +
    '<div id="strQs"></div>' + tiles([['Your score', 'strScore'], ['Band', 'strBand']]) + go('str', 'See result')),
  css: '#strQs .io-field label{text-transform:none;font-size:13.5px;letter-spacing:0;color:var(--ink)}#strQs .io-field{margin-bottom:10px}',
  js: `
    var QS=["Felt unable to control important things","Felt nervous or stressed","Felt confident about handling problems","Felt things were going your way","Felt difficulties piling up","Been upset by unexpected events","Felt on top of things","Been angered by things outside your control","Felt overwhelmed","Felt able to control irritations"];
    var NH=['Never','Almost never','Sometimes','Fairly often','Very often'];
    var cont=document.getElementById("strQs");
    QS.forEach(function(q,i){var d=document.createElement("div");d.className="io-field";
      var lab=document.createElement("label");lab.textContent=(i+1)+". "+q;d.appendChild(lab);
      var sel=document.createElement("select");sel.id="strQ"+i;
      NH.forEach(function(n,j){var o=document.createElement("option");o.value=j;o.textContent=n;sel.appendChild(o);});
      d.appendChild(sel);cont.appendChild(d);});
    function run(){var total=0;QS.forEach(function(q,i){var v=+document.getElementById("strQ"+i).value;if(i===2||i===3||i===6||i===9)v=4-v;total+=v;});
      document.getElementById("strScore").textContent=total+" / 40";
      var band=total<=10?"Low stress":total<=20?"Moderate stress":total<=30?"High stress":"Very high stress";
      document.getElementById("strBand").textContent=band;
      document.getElementById("strProc").textContent="Educational only - not a diagnosis.";}
    QS.forEach(function(q,i){document.getElementById("strQ"+i).addEventListener("change",run);});
    document.getElementById("strGo").addEventListener("click",run);run();`,
  article: {
    title: 'Stress Level Test: A Quick, Private Self-Assessment',
    lead: '<p>This short <strong>stress level test</strong> scores ten statements about how you have felt over the past two weeks, giving an indicative sense of your current stress.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-list-ol', heading: 'How scoring works', html: '<p>Four statements are worded positively and are reverse-scored, so higher totals generally indicate more perceived stress. The bands run from low to very high.</p>' },
      { id: 'action', icon: 'fa-solid fa-hand-holding-heart', heading: 'What to do with the result', html: '<p>A high score is a prompt to consider rest, support and professional advice, not a diagnosis. This tool is educational and runs entirely in your browser.</p>' }
    ],
    steps: ['Answer all ten statements.', 'Press See result.', 'Read your score and band, and consider the guidance.'],
    facts: [['Questions', 'Ten'], ['Scale', 'Zero to four'], ['Output', 'Score and band'], ['Data handling', 'Runs locally']],
    useCases: [['Self-awareness', 'Notice a stressful period.'], ['Check-ins', 'Repeat over time to spot trends.'], ['Conversation starter', 'Bring the result to a professional.']],
    tips: ['Answer quickly and honestly.', 'Repeat monthly to see trends.', 'Seek help if you feel overwhelmed.'],
    takeaways: ['Higher totals suggest more perceived stress.', 'The bands are indicative, not diagnostic.', 'Persistent high stress warrants support.'],
    faq: [['Is this a clinical test?', 'No, it is a simplified educational self-assessment.'], ['Does it store my answers?', 'No, nothing is saved or sent.'], ['What should I do if my score is high?', 'Consider rest and professional support.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Check in on yourself regularly, and support recovery with healthy habits like the <a href="sleep-calculator.html">sleep calculator</a>.</p>'
  }
});

/* ========================================================================
   12. SUGAR INTAKE CALCULATOR
   ======================================================================== */
add({
  file: 'sugar-intake-calculator.html', folder: 'health',
  name: 'Sugar Intake Calculator', tag: 'Nutrition', icon: 'fa-solid fa-cube',
  title: 'Sugar Intake Calculator | Daily Added Sugar Limit',
  metaDesc: 'Find your recommended daily added sugar limit in grams and teaspoons based on calories and current guidelines. Private and in-browser.',
  desc: 'Calculate a recommended daily added sugar limit in grams and teaspoons based on your calorie intake.',
  keywords: ['sugar intake calculator', 'daily sugar limit', 'added sugar', 'sugar grams', 'teaspoons of sugar', 'nutrition'],
  featureList: ['Grams and teaspoons', 'Guideline based', 'Calorie input', '100% client-side'],
  panel: panel.wrap('sug', 'fa-solid fa-cube', 'Sugar limit',
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="sugCal">Daily calories</label><input id="sugCal"type="number"min="0"step="50"value="2000"></div>' +
    tiles([['Recommended max sugar', 'sugG'], ['In teaspoons', 'sugT'], ['Ideal limit', 'sugIdeal']]) + go('sug')),
  js: `
    function run(){var cal=+document.getElementById("sugCal").value;
      var g=cal*0.10/4;var tid=cal*0.05/4;
      document.getElementById("sugG").textContent=(Math.round(g*10)/10)+" g/day";
      document.getElementById("sugT").textContent=(Math.round(g/4.2*10)/10)+" tsp";
      document.getElementById("sugIdeal").textContent=(Math.round(tid*10)/10)+" g/day";
      document.getElementById("sugProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["sugCal"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("sugGo").addEventListener("click",run);run();`,
  article: {
    title: 'Sugar Intake Calculator: Know Your Daily Limit',
    lead: '<p>Added sugars are easy to over-consume. This <strong>sugar intake calculator</strong> translates common guidelines into a daily gram and teaspoon limit based on your calorie intake.</p>',
    sections: [
      { id: 'guideline', icon: 'fa-solid fa-clipboard-check', heading: 'The guideline', html: '<p>Many health bodies recommend keeping added sugar below ten percent of daily calories, with additional benefit below five percent. Sugars in whole fruit and milk are not counted as added sugar.</p>' },
      { id: 'reading', icon: 'fa-solid fa-tag', heading: 'Reading labels', html: '<p>Food labels list total and added sugars, usually in grams. Four grams is about one teaspoon, so the teaspoon figure helps you picture how much a product contains.</p>' }
    ],
    steps: ['Enter your daily calorie intake.', 'Read the recommended maximum in grams and teaspoons, plus the ideal limit.'],
    facts: [['Guideline', 'Under 10% of calories'], ['Ideal', 'Under 5%'], ['Output', 'Grams and teaspoons'], ['Data handling', 'Runs locally']],
    useCases: [['Diet planning', 'Set a daily sugar budget.'], ['Label checks', 'Compare products against the limit.'], ['Awareness', 'See how quickly sugar adds up.']],
    tips: ['Focus on added sugar, not sugar in whole foods.', 'Check drinks, which are a common source.', 'Use the ideal limit if you want a stricter target.'],
    takeaways: ['Added sugar should stay under ten percent of calories.', 'Four grams is about one teaspoon.', 'Drinks are an easy place to cut back.'],
    faq: [['Does this include natural sugars?', 'No, it targets added sugars.'], ['What if I exercise a lot?', 'The percentage guideline still applies to added sugar.'], ['Is this medical advice?', 'No, consult a professional for a personal plan.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Cut back with awareness, and balance your diet using the <a href="protein-intake-calculator.html">protein intake calculator</a>.</p>'
  }
});

/* ========================================================================
   13. PROTEIN & FIBER CALCULATOR
   ======================================================================== */
add({
  file: 'protein-fiber-calculator.html', folder: 'health',
  name: 'Protein & Fiber Calculator', tag: 'Nutrition', icon: 'fa-solid fa-drumstick-bite',
  title: 'Protein & Fiber Calculator | Daily Targets',
  metaDesc: 'Calculate daily protein and fiber targets from your body weight, activity level and calorie intake. Private, in-browser and free.',
  desc: 'Calculate daily protein and fiber targets from your body weight, activity level and calorie intake.',
  keywords: ['protein calculator', 'fiber calculator', 'daily protein', 'daily fiber', 'nutrition targets', 'macronutrients'],
  featureList: ['Protein target', 'Fiber target', 'Weight and activity based', '100% client-side'],
  panel: panel.wrap('pf', 'fa-solid fa-drumstick-bite', 'Protein and fiber',
    '<div class="row3"style="margin-bottom:14px">' +
    num('pfWt', 'Body weight (kg)', '70', 'step="0.1"') +
    '<div class="field"><label for="pfAct">Activity level</label><select id="pfAct"><option value="0.8">Sedentary</option><option value="1.2"selected>Moderately active</option><option value="1.6">Active</option><option value="2">Athlete</option></select></div>' +
    num('pfCal', 'Daily calories', '2000') +
    '</div>' + tiles([['Protein target', 'pfProt'], ['Fiber target', 'pfFib']]) + go('pf')),
  js: `
    function run(){var wt=+document.getElementById("pfWt").value,act=+document.getElementById("pfAct").value,cal=+document.getElementById("pfCal").value;
      var prot=wt*act;
      var fib=cal/1000*14;
      document.getElementById("pfProt").textContent=Math.round(prot)+" g/day";
      document.getElementById("pfFib").textContent=Math.round(fib)+" g/day";
      document.getElementById("pfProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["pfWt","pfAct","pfCal"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("pfGo").addEventListener("click",run);run();`,
  article: {
    title: 'Protein & Fiber Calculator: Set Your Daily Targets',
    lead: '<p>Protein supports muscle and satiety, while fiber aids digestion and heart health. This <strong>protein and fiber calculator</strong> sets daily targets from your weight, activity and calories.</p>',
    sections: [
      { id: 'protein', icon: 'fa-solid fa-dumbbell', heading: 'Protein needs', html: '<p>Protein targets scale with body weight and activity. Sedentary adults need less per kilogram than those training regularly or building muscle.</p>' },
      { id: 'fiber', icon: 'fa-solid fa-wheat-awn', heading: 'Fiber needs', html: '<p>A common guideline is about fourteen grams of fiber per thousand calories. Fiber from whole grains, vegetables and legumes supports gut and heart health.</p>' }
    ],
    steps: ['Enter your body weight.', 'Select your activity level.', 'Enter daily calories.', 'Read your protein and fiber targets.'],
    facts: [['Protein', 'Per kg by activity'], ['Fiber', 'About 14 g per 1000 kcal'], ['Output', 'Daily gram targets'], ['Data handling', 'Runs locally']],
    useCases: [['Muscle building', 'Hit a sufficient protein target.'], ['Healthy eating', 'Meet fiber recommendations.'], ['Meal planning', 'Distribute targets across meals.']],
    tips: ['Spread protein across meals.', 'Increase fiber gradually with fluid.', 'Adjust targets as your weight changes.'],
    takeaways: ['Protein scales with weight and activity.', 'Fiber tracks calorie intake.', 'Both support long-term health.'],
    faq: [['Is more protein always better?', 'No, very high intakes offer little extra benefit for most people.'], ['Can I get fiber from supplements?', 'Whole foods are preferred.'], ['Does this suit vegetarians?', 'Yes, plant proteins count.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Build balanced meals around your targets, and plan intake with the <a href="macro-calculator.html">macro calculator</a>.</p>'
  }
});

/* ========================================================================
   14. CALORIE BURN
   ======================================================================== */
add({
  file: 'calorie-burn-calculator.html', folder: 'health',
  name: 'Calorie Burn Calculator', tag: 'Fitness', icon: 'fa-solid fa-fire-flame-simple',
  title: 'Calorie Burn Calculator | Calories by Activity',
  metaDesc: 'Estimate calories burned during exercise from activity type, duration, weight and intensity using MET values. In-browser and private.',
  desc: 'Estimate the calories burned in an activity from its MET value, your body weight and the duration.',
  keywords: ['calorie burn calculator', 'calories burned', 'exercise calories', 'met value', 'workout calories', 'activity calories'],
  featureList: ['MET based', 'Many activities', 'Weight and duration', '100% client-side'],
  panel: panel.wrap('cb', 'fa-solid fa-fire-flame-simple', 'Calorie burn',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="cbAct">Activity</label><select id="cbAct"><option value="1.3">Walking (slow)</option><option value="3.5">Walking (brisk)</option><option value="7">Running</option><option value="6.8">Cycling (moderate)</option><option value="6">Swimming</option><option value="5">Weight training</option><option value="8">HIIT</option><option value="4">Yoga</option></select></div>' +
    num('cbWt', 'Body weight (kg)', '70', 'step="0.1"') +
    num('cbMin', 'Duration (minutes)', '30') +
    '</div>' + tiles([['Calories burned', 'cbOut']]) + go('cb')),
  js: `
    function run(){var met=+document.getElementById("cbAct").value,wt=+document.getElementById("cbWt").value,min=+document.getElementById("cbMin").value;
      var cals=met*3.5*wt/200*min;
      document.getElementById("cbOut").textContent=Math.round(cals)+" kcal";
      document.getElementById("cbProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["cbAct","cbWt","cbMin"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("cbGo").addEventListener("click",run);run();`,
  article: {
    title: 'Calorie Burn Calculator: Estimate Exercise Energy Use',
    lead: '<p>How many calories a workout burns depends on the activity, its intensity, your weight and how long you go. This <strong>calorie burn calculator</strong> uses MET values to estimate it.</p>',
    sections: [
      { id: 'met', icon: 'fa-solid fa-gauge-high', heading: 'What a MET is', html: '<p>A MET is a multiple of resting energy expenditure. Running at seven METs uses seven times the energy you would expend sitting still, and the formula scales that by weight and time.</p>' },
      { id: 'caveat', icon: 'fa-solid fa-circle-info', heading: 'An estimate', html: '<p>Metabolic rates vary between people, so actual burn can differ. Use the figure as a planning guide rather than an exact measurement.</p>' }
    ],
    steps: ['Choose an activity.', 'Enter your body weight and duration.', 'Read the estimated calories burned.'],
    facts: [['Method', 'MET values'], ['Inputs', 'Activity, weight, time'], ['Output', 'Calories burned'], ['Data handling', 'Runs locally']],
    useCases: [['Workout planning', 'Compare the cost of different activities.'], ['Weight management', 'Account for exercise in your energy balance.'], ['Motivation', 'See the payoff of longer sessions.']],
    tips: ['Pick the intensity that matches your effort.', 'Longer duration matters as much as intensity.', 'Track trends rather than single sessions.'],
    takeaways: ['Higher MET and longer time burn more calories.', 'Body weight scales the result.', 'The estimate guides planning.'],
    faq: [['Why does weight matter?', 'Heavier bodies expend more energy for the same activity.'], ['Does it include afterburn?', 'No, only the activity itself.'], ['How accurate is it?', 'It is a reasonable estimate, not a measurement.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Balance energy in and out, and set intake with the <a href="calorie-calculator.html">calorie calculator</a>.</p>'
  }
});

/* ========================================================================
   15. INTERMITTENT FASTING
   ======================================================================== */
add({
  file: 'fasting-calculator.html', folder: 'health',
  name: 'Intermittent Fasting Calculator', tag: 'Nutrition', icon: 'fa-solid fa-clock',
  title: 'Intermittent Fasting Calculator | Eating Windows',
  metaDesc: 'Plan intermittent fasting by finding your eating and fasting windows from a chosen protocol and start time. Private and in-browser.',
  desc: 'Plan an intermittent fasting schedule by working out eating and fasting windows for a chosen protocol and start time.',
  keywords: ['intermittent fasting calculator', '16 8 fasting', 'fasting window', 'eating window', 'fasting schedule', 'if protocol'],
  featureList: ['Common protocols', 'Eating window times', 'Fasting window times', '100% client-side'],
  panel: panel.wrap('ifst', 'fa-solid fa-clock', 'Fasting schedule',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="ifstProto">Protocol</label><select id="ifstProto"><option value="16">16:8</option><option value="18">18:6</option><option value="20">20:4</option><option value="14">14:10</option></select></div>' +
    '<div class="field"><label for="ifstStart">Eating window starts at</label><input id="ifstStart"type="time"value="12:00"></div>' +
    '</div>' + tiles([['Fasting window', 'ifstFast'], ['Eating window', 'ifstEat']]) + go('ifst')),
  js: `
    function pad(n){return (n<10?"0":"")+n;}
    function run(){var fastH=+document.getElementById("ifstProto").value;var t=document.getElementById("ifstStart").value;if(!t){return;}
      var parts=t.split(":");var sh=+parts[0],sm=+parts[1];
      var eatH=24-fastH;
      var endMin=sh*60+sm+eatH*60;
      var eh=Math.floor(endMin/60)%24,em=endMin%60;
      var start=new Date();start.setHours(fastH,0,0,0);
      document.getElementById("ifstEat").textContent=pad(sh)+":"+pad(sm)+" - "+pad(eh)+":"+pad(em);
      document.getElementById("ifstFast").textContent=pad(eh)+":"+pad(em)+" - "+pad(sh)+":"+pad(sm);
      document.getElementById("ifstProc").textContent="Plan only - consult a professional if unsure.";}
    ["ifstProto","ifstStart"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("ifstGo").addEventListener("click",run);run();`,
  article: {
    title: 'Intermittent Fasting Calculator: Plan Your Windows',
    lead: '<p>Intermittent fasting alternates eating and fasting periods. This <strong>intermittent fasting calculator</strong> turns a protocol such as 16:8 into concrete eating and fasting windows from your chosen start time.</p>',
    sections: [
      { id: 'protocols', icon: 'fa-solid fa-clock', heading: 'Common protocols', html: '<p>In 16:8 you fast sixteen hours and eat within an eight-hour window; 18:6 and 20:4 are stricter. The protocol names describe the fasting-to-eating hour split.</p>' },
      { id: 'fit', icon: 'fa-solid fa-user-check', heading: 'Making it fit', html: '<p>Choose a window that matches your routine so social meals still fit. Hydration and balanced eating during the window matter for how you feel.</p>' }
    ],
    steps: ['Pick a fasting protocol.', 'Set when your eating window should start.', 'Read your eating and fasting windows.'],
    facts: [['Protocols', '14:10 to 20:4'], ['Output', 'Window times'], ['Basis', 'Start time'], ['Data handling', 'Runs locally']],
    useCases: [['Routine planning', 'Align windows with work and meals.'], ['Trying IF', 'Start with a gentler protocol.'], ['Adjusting', 'Shift windows on different days.']],
    tips: ['Start with 14:10 or 16:8.', 'Stay hydrated during the fast.', 'Stop and seek advice if you feel unwell.'],
    takeaways: ['Protocols define the fast-to-eat split.', 'Windows are easy to align with daily life.', 'It is not suitable for everyone.'],
    faq: [['Is fasting safe for everyone?', 'No, it may not suit some medical conditions or life stages; seek advice.'], ['Can I drink water?', 'Yes, water and plain drinks keep you hydrated.'], ['Does timing change metabolism?', 'The main effect is on total intake and routine.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Shape fasting around your life, and plan meals with the <a href="calorie-calculator.html">calorie calculator</a>.</p>'
  }
});

/* ========================================================================
   16. MAP CALCULATOR
   ======================================================================== */
add({
  file: 'map-calculator.html', folder: 'health',
  name: 'MAP Calculator', tag: 'Heart', icon: 'fa-solid fa-heart-circle-bolt',
  title: 'MAP Calculator | Mean Arterial Pressure',
  metaDesc: 'Calculate mean arterial pressure from systolic and diastolic blood pressure. Useful for perfusion assessment, in your browser.',
  desc: 'Calculate mean arterial pressure from a systolic and diastolic reading, a measure of average pressure in the arteries.',
  keywords: ['map calculator', 'mean arterial pressure', 'blood pressure', 'perfusion pressure', 'systolic diastolic'],
  featureList: ['MAP formula', 'Instant result', 'Simple inputs', '100% client-side'],
  panel: panel.wrap('map', 'fa-solid fa-heart-circle-bolt', 'Mean arterial pressure',
    '<div class="row3"style="margin-bottom:14px">' +
    num('mapSys', 'Systolic (mmHg)', '120') +
    num('mapDia', 'Diastolic (mmHg)', '80') +
    '</div>' + tiles([['MAP', 'mapOut']]) + go('map')),
  js: `
    function run(){var s=+document.getElementById("mapSys").value,d=+document.getElementById("mapDia").value;
      var m=(s+2*d)/3;
      document.getElementById("mapOut").textContent=(Math.round(m*10)/10)+" mmHg";
      document.getElementById("mapProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["mapSys","mapDia"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("mapGo").addEventListener("click",run);run();`,
  article: {
    title: 'MAP Calculator: Mean Arterial Pressure',
    lead: '<p>Mean arterial pressure averages the pressure in the arteries over a cardiac cycle. This <strong>MAP calculator</strong> computes it from your systolic and diastolic readings.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The formula', html: '<p>MAP equals <code>(systolic + 2 x diastolic) / 3</code>. Diastolic is weighted more heavily because the heart spends more time in diastole.</p>' },
      { id: 'use', icon: 'fa-solid fa-stethoscope', heading: 'Why it matters', html: '<p>MAP reflects organ perfusion. Values below about sixty-five millimeters of mercury can indicate inadequate perfusion, though clinical interpretation depends on context.</p>' }
    ],
    steps: ['Enter the systolic reading.', 'Enter the diastolic reading.', 'Read the mean arterial pressure.'],
    facts: [['Formula', '(SBP + 2 x DBP) / 3'], ['Units', 'mmHg'], ['Output', 'MAP'], ['Data handling', 'Runs locally']],
    useCases: [['Critical care awareness', 'Understand perfusion metrics.'], ['Education', 'See the relationship between readings.'], ['Monitoring', 'Track MAP alongside blood pressure.']],
    tips: ['Use a rested, seated reading.', 'Interpret alongside clinical context.', 'Trends matter more than single values.'],
    takeaways: ['MAP weights diastolic more heavily.', 'It reflects average arterial pressure.', 'Clinical decisions need full context.'],
    faq: [['What is a normal MAP?', 'Roughly seventy to one hundred mmHg at rest.'], ['Is low MAP dangerous?', 'Very low values can reduce organ perfusion.'], ['Is this medical advice?', 'No, it is informational.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Understand your haemodynamics, and classify readings with the <a href="blood-pressure-chart.html">blood pressure chart</a>.</p>'
  }
});

/* ========================================================================
   17. CHOLESTEROL RATIO
   ======================================================================== */
add({
  file: 'cholesterol-ratio-calculator.html', folder: 'health',
  name: 'Cholesterol Ratio Calculator', tag: 'Heart', icon: 'fa-solid fa-droplet',
  title: 'Cholesterol Ratio Calculator | Total to HDL',
  metaDesc: 'Calculate cholesterol ratios including total-to-HDL, LDL-to-HDL and triglycerides-to-HDL from a lipid panel. In-browser and private.',
  desc: 'Calculate key cholesterol ratios from a lipid panel, including total-to-HDL, LDL-to-HDL and triglycerides-to-HDL.',
  keywords: ['cholesterol ratio calculator', 'total to hdl', 'ldl hdl ratio', 'lipid panel', 'triglyceride ratio', 'heart health'],
  featureList: ['Multiple ratios', 'Lipid panel inputs', 'Instant results', '100% client-side'],
  panel: panel.wrap('chol', 'fa-solid fa-droplet', 'Cholesterol ratios',
    '<div class="row3"style="margin-bottom:14px">' +
    num('cholTotal', 'Total cholesterol (mg/dL)', '180') +
    num('cholHdl', 'HDL (mg/dL)', '50') +
    num('cholLdl', 'LDL (mg/dL)', '100') +
    '</div>' + num('cholTrg', 'Triglycerides (mg/dL)', '120') +
    tiles([['Total/HDL', 'cholRat'], ['LDL/HDL', 'cholLdlR'], ['Trig/HDL', 'cholTrgR']]) + go('chol')),
  js: `
    function run(){var t=+document.getElementById("cholTotal").value,h=+document.getElementById("cholHdl").value,l=+document.getElementById("cholLdl").value,g=+document.getElementById("cholTrg").value;
      if(!(h>0)){return;}
      document.getElementById("cholRat").textContent=(Math.round(t/h*100)/100);
      document.getElementById("cholLdlR").textContent=(Math.round(l/h*100)/100);
      document.getElementById("cholTrgR").textContent=(Math.round(g/h*100)/100);
      document.getElementById("cholProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["cholTotal","cholHdl","cholLdl","cholTrg"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("cholGo").addEventListener("click",run);run();`,
  article: {
    title: 'Cholesterol Ratio Calculator: Read Your Lipid Panel',
    lead: '<p>Cholesterol ratios put your lipid numbers in context. This <strong>cholesterol ratio calculator</strong> computes several common ratios from a standard panel.</p>',
    sections: [
      { id: 'ratios', icon: 'fa-solid fa-divide', heading: 'The key ratios', html: '<p>Total-to-HDL and LDL-to-HDL compare atherogenic cholesterol with protective HDL. Triglycerides-to-HDL is a marker associated with insulin resistance.</p>' },
      { id: 'context', icon: 'fa-solid fa-circle-info', heading: 'Reading them with care', html: '<p>Ratios complement, rather than replace, individual values. Your clinician interprets them alongside your overall risk profile.</p>' }
    ],
    steps: ['Enter total cholesterol, HDL and LDL.', 'Enter triglycerides.', 'Read the three ratios.'],
    facts: [['Ratios', 'Total/HDL, LDL/HDL, Trig/HDL'], ['Units', 'mg/dL'], ['Output', 'Three ratios'], ['Data handling', 'Runs locally']],
    useCases: [['Tracking', 'Follow ratios across panels.'], ['Awareness', 'Understand your lipid profile.'], ['Discussion', 'Bring figures to a consultation.']],
    tips: ['Use a fasting panel where possible.', 'Ratios improve with exercise and diet.', 'Always interpret with a clinician.'],
    takeaways: ['Ratios contextualise lipid values.', 'Higher total-to-HDL generally means higher risk.', 'They support, not replace, clinical judgement.'],
    faq: [['What is a good total-to-HDL ratio?', 'Lower is generally better; discuss targets with your clinician.'], ['Do I need to fast?', 'Fasting improves triglyceride accuracy.'], ['Is this a diagnosis?', 'No, it is informational.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>See your lipid profile in context, and check related heart metrics with the <a href="map-calculator.html">MAP calculator</a>.</p>'
  }
});

/* ========================================================================
   18. A1C TO BLOOD SUGAR
   ======================================================================== */
add({
  file: 'a1c-calculator.html', folder: 'health',
  name: 'A1C to Blood Sugar Calculator', tag: 'Diabetes', icon: 'fa-solid fa-droplet-half',
  title: 'A1C to Blood Sugar Calculator | eAG Converter',
  metaDesc: 'Convert HbA1c to estimated average glucose (eAG) in mg/dL and mmol/L. Free, private and fully in-browser.',
  desc: 'Convert an HbA1c percentage into estimated average glucose in mg/dL and mmol/L using the standard ADAG equation.',
  keywords: ['a1c calculator', 'hba1c to glucose', 'estimated average glucose', 'eag', 'diabetes', 'blood sugar converter'],
  featureList: ['A1C to eAG', 'mg/dL and mmol/L', 'ADAG equation', '100% client-side'],
  panel: panel.wrap('a1c', 'fa-solid fa-droplet-half', 'A1C converter',
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="a1cVal">HbA1c (%)</label><input id="a1cVal"type="number"min="0"step="0.1"value="6.5"></div>' +
    tiles([['eAG (mg/dL)', 'a1cMg'], ['eAG (mmol/L)', 'a1cMm']]) + go('a1c')),
  js: `
    function run(){var a=+document.getElementById("a1cVal").value;
      var mg=28.7*a-46.7;
      document.getElementById("a1cMg").textContent=Math.round(mg);
      document.getElementById("a1cMm").textContent=(Math.round(mg/18.0182*10)/10);
      document.getElementById("a1cProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["a1cVal"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("a1cGo").addEventListener("click",run);run();`,
  article: {
    title: 'A1C to Blood Sugar Calculator: Estimated Average Glucose',
    lead: '<p>HbA1c reflects average blood sugar over the previous two to three months. This <strong>A1C to blood sugar calculator</strong> converts it to estimated average glucose.</p>',
    sections: [
      { id: 'equation', icon: 'fa-solid fa-square-root-variable', heading: 'The ADAG equation', html: '<p>The relationship is <code>eAG (mg/dL) = 28.7 x A1C - 46.7</code>. Dividing by about eighteen converts the result to millimoles per litre.</p>' },
      { id: 'use', icon: 'fa-solid fa-stethoscope', heading: 'Using the figure', html: '<p>Estimated average glucose helps connect a lab A1C with day-to-day readings, though individual variation means meter readings may not match exactly.</p>' }
    ],
    steps: ['Enter your HbA1c percentage.', 'Read the estimated average glucose in both units.'],
    facts: [['Equation', 'ADAG'], ['Output', 'mg/dL and mmol/L'], ['Basis', '2-3 month average'], ['Data handling', 'Runs locally']],
    useCases: [['Diabetes management', 'Translate A1C into everyday numbers.'], ['Self-monitoring', 'Compare meter averages with eAG.'], ['Education', 'Understand the A1C result.']],
    tips: ['Use a recent lab A1C.', 'Expect some variation from meter averages.', 'Discuss targets with your clinician.'],
    takeaways: ['A1C reflects a long-term average.', 'The ADAG equation estimates average glucose.', 'It helps interpret lab results.'],
    faq: [['How accurate is the conversion?', 'It is the accepted population estimate.'], ['Why the difference from my meter?', 'Individual variation and timing affect the match.'], ['Is this a diagnosis?', 'No, it is informational.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Connect your lab result to daily numbers, and plan meals with the <a href="sugar-intake-calculator.html">sugar intake calculator</a>.</p>'
  }
});

/* ========================================================================
   19. BSA CALCULATOR
   ======================================================================== */
add({
  file: 'bsa-calculator.html', folder: 'health',
  name: 'BSA Calculator', tag: 'Clinical', icon: 'fa-solid fa-ruler-combined',
  title: 'BSA Calculator | Body Surface Area',
  metaDesc: 'Calculate body surface area using the Du Bois, Mosteller and Haycock formulas from height and weight. In-browser and private.',
  desc: 'Calculate body surface area from height and weight using several standard formulas, useful for clinical dosing.',
  keywords: ['bsa calculator', 'body surface area', 'du bois', 'mosteller', 'haycock', 'clinical dosing'],
  featureList: ['Three formulas', 'Height and weight', 'Instant results', '100% client-side'],
  panel: panel.wrap('bsa', 'fa-solid fa-ruler-combined', 'Body surface area',
    '<div class="row3"style="margin-bottom:14px">' +
    num('bsaH', 'Height (cm)', '175') +
    num('bsaW', 'Weight (kg)', '70', 'step="0.1"') +
    '</div>' + tiles([['Mosteller', 'bsaM'], ['Du Bois', 'bsaD'], ['Haycock', 'bsaHk']]) + go('bsa')),
  js: `
    function run(){var h=+document.getElementById("bsaH").value,w=+document.getElementById("bsaW").value;
      document.getElementById("bsaM").textContent=(Math.round(Math.sqrt(h*w/3600)*100)/100)+" m2";
      document.getElementById("bsaD").textContent=(Math.round(0.007184*Math.pow(h,0.725)*Math.pow(w,0.425)*100)/100)+" m2";
      document.getElementById("bsaHk").textContent=(Math.round(0.024265*Math.pow(h,0.3964)*Math.pow(w,0.5378)*100)/100)+" m2";
      document.getElementById("bsaProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["bsaH","bsaW"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("bsaGo").addEventListener("click",run);run();`,
  article: {
    title: 'BSA Calculator: Body Surface Area From Height and Weight',
    lead: '<p>Body surface area is used to normalise clinical measurements and drug doses. This <strong>BSA calculator</strong> applies several standard formulas to your height and weight.</p>',
    sections: [
      { id: 'formulas', icon: 'fa-solid fa-square-root-variable', heading: 'Which formula?', html: '<p>Mosteller is simple and popular; Du Bois is a classic; Haycock is often used in pediatrics. Results differ slightly, so consistency matters when tracking.</p>' },
      { id: 'use', icon: 'fa-solid fa-syringe', heading: 'Clinical use', html: '<p>Certain drug doses are expressed per square metre of body surface area, making BSA a routine calculation in oncology and other specialties.</p>' }
    ],
    steps: ['Enter your height in centimetres.', 'Enter your weight in kilograms.', 'Compare the results from the three formulas.'],
    facts: [['Formulas', 'Mosteller, Du Bois, Haycock'], ['Output', 'Square metres'], ['Inputs', 'Height and weight'], ['Data handling', 'Runs locally']],
    useCases: [['Clinical dosing', 'Support per-metre dosing.'], ['Physiology', 'Normalise measurements.'], ['Education', 'Understand BSA estimation.']],
    tips: ['Use the same formula over time.', 'Measure height without shoes.', 'Confirm dosing calculations with a clinician.'],
    takeaways: ['BSA normalises clinical measurements.', 'Different formulas give slightly different values.', 'It is commonly used for dosing.'],
    faq: [['Which formula is best?', 'Mosteller is common and accurate enough for most uses.'], ['Is BSA the same as BMI?', 'No, they measure different things.'], ['Is this medical advice?', 'No, it is informational.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Use BSA where dose normalisation matters, and check weight-related metrics with the <a href="ideal-weight-calculator.html">ideal weight calculator</a>.</p>'
  }
});

/* ========================================================================
   20. IBW CALCULATOR
   ======================================================================== */
add({
  file: 'ibw-calculator.html', folder: 'health',
  name: 'Ideal Body Weight Calculator', tag: 'Fitness', icon: 'fa-solid fa-weight-hanging',
  title: 'Ideal Body Weight Calculator | IBW by Height',
  metaDesc: 'Calculate ideal body weight using the Devine, Robinson, Miller and Hamwi formulas from your height and sex. In-browser and private.',
  desc: 'Estimate ideal body weight from height and sex using four classic formulas.',
  keywords: ['ideal body weight calculator', 'ibw', 'devine formula', 'healthy weight', 'weight for height', 'robinson formula'],
  featureList: ['Four formulas', 'Height and sex', 'Instant results', '100% client-side'],
  panel: panel.wrap('ibw', 'fa-solid fa-weight-hanging', 'Ideal body weight',
    '<div class="row3"style="margin-bottom:14px">' +
    num('ibwH', 'Height (cm)', '175') +
    '<div class="field"><label for="ibwSex">Sex</label><select id="ibwSex"><option value="m">Male</option><option value="f">Female</option></select></div>' +
    '</div>' + tiles([['Devine', 'ibwD'], ['Robinson', 'ibwR'], ['Miller', 'ibwM'], ['Hamwi', 'ibwH2']]) + go('ibw')),
  js: `
    function run(){var cm=+document.getElementById("ibwH").value,sex=document.getElementById("ibwSex").value;
      var inches=cm/2.54;var over=Math.max(0,inches-60);
      var d,r,m,h;
      if(sex==="m"){d=50+2.3*over;r=52+1.9*over;m=56.2+1.41*over;h=48+2.7*over;}
      else{d=45.5+2.3*over;r=49+1.7*over;m=53.1+1.36*over;h=45.5+2.2*over;}
      document.getElementById("ibwD").textContent=(Math.round(d*10)/10)+" kg";
      document.getElementById("ibwR").textContent=(Math.round(r*10)/10)+" kg";
      document.getElementById("ibwM").textContent=(Math.round(m*10)/10)+" kg";
      document.getElementById("ibwH2").textContent=(Math.round(h*10)/10)+" kg";
      document.getElementById("ibwProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["ibwH","ibwSex"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("ibwGo").addEventListener("click",run);run();`,
  article: {
    title: 'Ideal Body Weight Calculator: Classic IBW Formulas',
    lead: '<p>Ideal body weight gives a reference range based on height and sex. This <strong>ideal body weight calculator</strong> applies four well-known formulas so you can compare.</p>',
    sections: [
      { id: 'formulas', icon: 'fa-solid fa-square-root-variable', heading: 'Where the numbers come from', html: '<p>Devine, Robinson, Miller and Hamwi all start from a base weight at five feet and add a per-inch increment. They were developed for clinical dosing and give slightly different results.</p>' },
      { id: 'range', icon: 'fa-solid fa-ruler', heading: 'Use a range, not a target', html: '<p>IBW is a reference, not a goal. A healthy weight range accounts for muscle, frame and individual variation, so treat the figures as guidance.</p>' }
    ],
    steps: ['Enter your height.', 'Select your sex.', 'Compare the four formulas.'],
    facts: [['Formulas', 'Devine, Robinson, Miller, Hamwi'], ['Output', 'Kilograms'], ['Basis', 'Height and sex'], ['Data handling', 'Runs locally']],
    useCases: [['Clinical reference', 'Support dosing formulas.'], ['Awareness', 'See a healthy weight reference.'], ['Comparison', 'Understand how formulas differ.']],
    tips: ['Treat IBW as a range centre, not a hard target.', 'Frame size affects healthy weight.', 'Discuss goals with a professional.'],
    takeaways: ['IBW estimates a height-based reference weight.', 'Different formulas give slightly different values.', 'It is guidance, not a target.'],
    faq: [['Which formula should I use?', 'Devine is widely used clinically; any is a reasonable reference.'], ['Does muscle change IBW?', 'No, IBW does not account for muscle mass.'], ['Is IBW a goal?', 'No, it is a clinical reference.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Use IBW as a reference point, and set nutrition targets with the <a href="protein-intake-calculator.html">protein intake calculator</a>.</p>'
  }
});

/* ========================================================================
   21. WHTR CALCULATOR
   ======================================================================== */
add({
  file: 'whtr-calculator.html', folder: 'health',
  name: 'Waist to Height Ratio Calculator', tag: 'Fitness', icon: 'fa-solid fa-tape',
  title: 'Waist to Height Ratio Calculator (WHTR)',
  metaDesc: 'Calculate waist-to-height ratio and see how it compares with healthy thresholds. A simple central-obesity screening measure, in-browser.',
  desc: 'Calculate your waist-to-height ratio and classify it against commonly used central-obesity thresholds.',
  keywords: ['waist to height ratio', 'whtr calculator', 'central obesity', 'healthy waist', 'body shape', 'risk screening'],
  featureList: ['WHTR value', 'Risk classification', 'Simple inputs', '100% client-side'],
  panel: panel.wrap('whtr', 'fa-solid fa-tape', 'Waist to height ratio',
    '<div class="row3"style="margin-bottom:14px">' +
    num('whtrW', 'Waist (cm)', '85') +
    num('whtrH', 'Height (cm)', '175') +
    '</div>' + tiles([['WHTR', 'whtrOut'], ['Category', 'whtrCat']]) + go('whtr')),
  js: `
    function run(){var w=+document.getElementById("whtrW").value,h=+document.getElementById("whtrH").value;
      if(!(h>0)){return;}
      var r=w/h;
      document.getElementById("whtrOut").textContent=(Math.round(r*100)/100);
      document.getElementById("whtrCat").textContent=r<0.4?"Below healthy":r<0.5?"Healthy":r<0.6?"Increased risk":"High risk";
      document.getElementById("whtrProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["whtrW","whtrH"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("whtrGo").addEventListener("click",run);run();`,
  article: {
    title: 'Waist to Height Ratio Calculator: A Simple Central-Obesity Screen',
    lead: '<p>Waist-to-height ratio is a quick indicator of central fat and risk. This <strong>waist to height ratio calculator</strong> computes it and classifies the result.</p>',
    sections: [
      { id: 'rule', icon: 'fa-solid fa-ruler', heading: 'The half-height rule', html: '<p>Keeping your waist below half your height, a ratio of 0.5, is a widely used guideline. Ratios above 0.6 indicate higher risk.</p>' },
      { id: 'advantage', icon: 'fa-solid fa-star', heading: 'Why it is useful', html: '<p>WHTR needs only a tape measure and grows with age less than body mass index does, making it a practical screening tool.</p>' }
    ],
    steps: ['Measure your waist at the narrowest point.', 'Enter your waist and height.', 'Read your ratio and category.'],
    facts: [['Formula', 'Waist / height'], ['Threshold', 'Around 0.5'], ['Output', 'Ratio and category'], ['Data handling', 'Runs locally']],
    useCases: [['Health screening', 'Assess central fat quickly.'], ['Tracking', 'Follow changes over time.'], ['Awareness', 'Complement BMI.']],
    tips: ['Measure at the narrowest point after exhaling.', 'Use consistent measurement technique.', 'Discuss results with a professional.'],
    takeaways: ['Waist below half your height is a useful target.', 'Higher ratios indicate more central fat.', 'It needs only a tape measure.'],
    faq: [['Is it better than BMI?', 'It is a useful complement, especially for central fat.'], ['Where do I measure?', 'At the narrowest point of the waist.'], ['What is a healthy ratio?', 'Below about 0.5.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Screen your risk simply, and compare with the <a href="waist-to-hip-ratio-calculator.html">waist to hip ratio calculator</a>.</p>'
  }
});

/* ========================================================================
   22. PREGNANCY TRIMESTER
   ======================================================================== */
add({
  file: 'pregnancy-trimester-calculator.html', folder: 'health',
  name: 'Pregnancy Trimester Calculator', tag: 'Pregnancy', icon: 'fa-solid fa-baby-carriage',
  title: 'Pregnancy Trimester Calculator | Which Trimester Am I In',
  metaDesc: 'Find your current pregnancy trimester and weeks from your last menstrual period or due date. Private and in-browser.',
  desc: 'Work out your current trimester and week of pregnancy from your last menstrual period or due date.',
  keywords: ['pregnancy trimester calculator', 'which trimester', 'weeks pregnant', 'lmp', 'due date', 'pregnancy weeks'],
  featureList: ['Current week', 'Trimester', 'LMP or due date', '100% client-side'],
  panel: panel.wrap('pt', 'fa-solid fa-baby-carriage', 'Pregnancy trimester',
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="ptLmp">First day of last period</label><input id="ptLmp"type="date"></div>' +
    tiles([['Weeks pregnant', 'ptWeeks'], ['Trimester', 'ptTri'], ['Estimated due date', 'ptDue']]) + go('pt')),
  js: `
    function run(){var lmp=document.getElementById("ptLmp").value;if(!lmp){return;}
      var s=new Date(lmp);var now=new Date();
      var days=Math.floor((now-s)/86400000);
      var weeks=Math.floor(days/7);
      var tri=weeks<13?"First":weeks<27?"Second":"Third";
      var due=new Date(s.getTime()+280*86400000);
      document.getElementById("ptWeeks").textContent=weeks+" weeks";
      document.getElementById("ptTri").textContent=tri;
      document.getElementById("ptDue").textContent=due.toDateString();
      document.getElementById("ptProc").textContent="Estimate only - confirm with your clinician.";}
    ["ptLmp"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("ptGo").addEventListener("click",run);run();`,
  article: {
    title: 'Pregnancy Trimester Calculator: Track Your Stage',
    lead: '<p>Pregnancy is divided into three trimesters. This <strong>pregnancy trimester calculator</strong> shows your current week and trimester from your last period date.</p>',
    sections: [
      { id: 'dating', icon: 'fa-solid fa-calendar', heading: 'How dating works', html: '<p>Pregnancy is dated from the first day of your last menstrual period, with an estimated due date about forty weeks later. This simple method edges slightly ahead of true conception dating.</p>' },
      { id: 'stages', icon: 'fa-solid fa-layer-group', heading: 'The three trimesters', html: '<p>The first runs to about week twelve, the second to about week twenty-seven, and the third to birth. Each has its own milestones and care schedule.</p>' }
    ],
    steps: ['Enter the first day of your last period.', 'Read your current week, trimester and estimated due date.'],
    facts: [['Dating', 'From last period'], ['Term', 'About 40 weeks'], ['Output', 'Week and trimester'], ['Data handling', 'Runs locally']],
    useCases: [['Tracking', 'Know which stage you are in.'], ['Planning', 'Anticipate appointments.'], ['Awareness', 'Understand pregnancy dating.']],
    tips: ['An early scan refines dating.', 'Trimesters are approximate boundaries.', 'Confirm all dates with your clinician.'],
    takeaways: ['Dating starts from your last period.', 'Three trimesters span the pregnancy.', 'A scan can adjust the dates.'],
    faq: [['Is this medical advice?', 'No, it is informational; confirm dates with your clinician.'], ['What if I know the conception date?', 'Add about two weeks for dating purposes.'], ['When is the second trimester?', 'Roughly weeks thirteen to twenty-seven.'], ['Is my data uploaded?', 'No, it stays in your browser.']],
    conclusion: '<p>Follow your stage with clarity, and estimate the date with the <a href="pregnancy-due-date-calculator.html">pregnancy due date calculator</a>.</p>'
  }
});

/* ========================================================================
   23. VACCINATION SCHEDULE
   ======================================================================== */
add({
  file: 'vaccination-calculator.html', folder: 'health',
  name: 'Baby Vaccination Schedule Calculator', tag: 'Pediatrics', icon: 'fa-solid fa-syringe',
  title: 'Baby Vaccination Schedule Calculator | Key Dates',
  metaDesc: 'Generate a simple baby vaccination schedule with age-based dates from the birth date. Educational, in-browser and private.',
  desc: 'Generate a simple age-based vaccination schedule with dates calculated from a baby birth date.',
  keywords: ['vaccination schedule calculator', 'baby vaccines', 'immunisation schedule', 'child vaccination dates', 'vaccine timeline'],
  featureList: ['Age-based dates', 'Common milestones', 'Birth date input', '100% client-side'],
  panel: panel.wrap('vac', 'fa-solid fa-syringe', 'Vaccination schedule',
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="vacBirth">Date of birth</label><input id="vacBirth"type="date"></div>' +
    go('vac', 'Generate') + '<div id="vacOut"style="margin-top:8px"></div>'),
  css: '#vacOut table{width:100%;border-collapse:collapse;font-size:12.5px}#vacOut th,#vacOut td{border:1px solid var(--border);padding:6px 10px;text-align:left}#vacOut th{background:rgba(255,255,255,.04)}',
  js: `
    var MILESTONES=[[0,"Birth doses"],[6,"6 weeks"],[10,"10 weeks"],[14,"14 weeks"],[9*30,"9 months"],[12*30,"12 months"],[15*30,"15 months"],[18*30,"18 months"],[24*30,"24 months"]];
    function addDays(d,n){return new Date(d.getTime()+n*86400000);}
    function run(){var b=document.getElementById("vacBirth").value;if(!b){return;}
      var d=new Date(b);var rows="<table><thead><tr><th>Age</th><th>Approx date</th></tr></thead><tbody>";
      MILESTONES.forEach(function(m){rows+="<tr><td>"+m[1]+"</td><td>"+addDays(d,m[0]).toDateString()+"</td></tr>";});
      rows+="</tbody></table>";document.getElementById("vacOut").innerHTML=rows;
      document.getElementById("vacProc").textContent="Generic schedule - follow your local immunisation programme.";}
    ["vacBirth"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("vacGo").addEventListener("click",run);run();`,
  article: {
    title: 'Baby Vaccination Schedule Calculator: Map the Milestones',
    lead: '<p>Immunisation follows an age-based schedule. This <strong>baby vaccination schedule calculator</strong> turns a birth date into approximate dates for common milestones.</p>',
    sections: [
      { id: 'ages', icon: 'fa-solid fa-calendar-check', heading: 'Key ages', html: '<p>Many programmes give initial doses at birth and at six, ten and fourteen weeks, with boosters around nine, twelve and eighteen months. Exact schedules vary by country.</p>' },
      { id: 'local', icon: 'fa-solid fa-location-dot', heading: 'Follow local guidance', html: '<p>This tool shows generic milestone dates. Always follow your national immunisation programme and your pediatrician advice.</p>' }
    ],
    steps: ['Enter the baby date of birth.', 'Review the generated milestone dates.', 'Cross-check against your local immunisation schedule.'],
    facts: [['Basis', 'Age milestones'], ['Output', 'Approximate dates'], ['Scope', 'First two years'], ['Data handling', 'Runs locally']],
    useCases: [['Planning', 'Anticipate appointments.'], ['Reminders', 'Note upcoming milestones.'], ['Awareness', 'Understand the schedule shape.']],
    tips: ['Confirm every date with your clinician.', 'Schedules differ by country.', 'Keep a record of doses given.'],
    takeaways: ['Vaccines follow age-based milestones.', 'Dates are approximate.', 'Local guidance takes precedence.'],
    faq: [['Is this an official schedule?', 'No, it is generic; follow your local programme.'], ['Can dates shift?', 'Yes, catch-up schedules exist.'], ['Does it cover all vaccines?', 'It shows common milestones only.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Stay on top of appointments, and track growth with the <a href="baby-growth-calculator.html">baby growth calculator</a>.</p>'
  }
});

/* ========================================================================
   24. HEALTHY WEIGHT / CALORIE (BMI-adjacent) - skip duplicates.
   25. WATER INTAKE exists. Skip.
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
