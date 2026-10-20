/* ============================================================================
   Troolify - batch 16
   Academic calculators migrated from allinonetools.net (client-side feasible).
   Run: node troolify-gen/gen-tools-batch16.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

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
function area(prefix, label, val) {
  return '<div class="io-field"><label for="' + prefix + '">' + label + '</label><textarea id="' + prefix + '"spellcheck="false"placeholder="' + val + '"></textarea></div>';
}

/* ========================================================================
   1. CGPA CALCULATOR
   ======================================================================== */
add({
  file: 'cgpa-calculator.html', folder: 'math',
  name: 'CGPA Calculator', tag: 'Academic', icon: 'fa-solid fa-graduation-cap',
  title: 'CGPA Calculator | Cumulative GPA from Semesters',
  metaDesc: 'Calculate your cumulative GPA (CGPA) by averaging semester GPAs weighted by credits. Free, instant and fully in-browser.',
  desc: 'Combine semester GPAs and credit hours into a single cumulative GPA figure for applications and academic planning.',
  keywords: ['cgpa calculator', 'cumulative gpa', 'gpa average', 'semester gpa', 'credit weighted gpa', 'academic calculator'],
  featureList: ['Credit-weighted average', 'Multiple semesters', 'Percentage estimate', '100% client-side'],
  panel: panel.wrap('cgpa', 'fa-solid fa-graduation-cap', 'CGPA calculator',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">Enter one semester per line: <code>GPA, credits</code></p>' +
    area('cgpaIn', 'Semesters (GPA, credits)', '3.7, 18\n3.9, 20\n3.6, 16') +
    go('cgpa') + tiles([['CGPA', 'cgpaOut'], ['Total credits', 'cgpaCr'], ['Approx. percentage', 'cgpaPct']])),
  js: `
    function run(){var lines=document.getElementById("cgpaIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var pts=0,cr=0;
      lines.forEach(function(l){var p=l.split(/[,\\s]+/).map(Number);if(p.length>=2&&p[1]>0){pts+=p[0]*p[1];cr+=p[1];}});
      var g=cr?pts/cr:0;
      document.getElementById("cgpaOut").textContent=g.toFixed(2);
      document.getElementById("cgpaCr").textContent=cr;
      document.getElementById("cgpaPct").textContent=(g*9.5).toFixed(1)+"%";
      document.getElementById("cgpaProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("cgpaIn").addEventListener("input",run);
    document.getElementById("cgpaGo").addEventListener("click",run);run();`,
  article: {
    title: 'CGPA Calculator: Combine Semester GPAs',
    lead: '<p>CGPA is the credit-weighted average of your semester grade points. This <strong>CGPA calculator</strong> rolls multiple semesters into one cumulative figure.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-calculator', heading: 'How CGPA is computed', html: '<p>Each semester GPA is multiplied by its credit hours, the products are summed, then divided by total credits. Heavier semesters count more than light ones.</p>' },
      { id: 'pct', icon: 'fa-solid fa-percent', heading: 'GPA to percentage', html: '<p>Many Indian universities approximate percentage as GPA x 9.5. The exact conversion varies, so confirm your institution formula.</p>' }
    ],
    steps: ['Enter each semester as GPA and credits.', 'The calculator weights each by credits.', 'Read your cumulative GPA and percentage.'],
    facts: [['Method', 'Credit-weighted average'], ['Input', 'GPA + credits per semester'], ['Output', 'CGPA, credits, %'], ['Data handling', 'Runs locally']],
    useCases: [['Applications', 'Report a single cumulative figure.'], ['Planning', 'See how a semester shifts your average.'], ['Scholarships', 'Check eligibility thresholds.']],
    tips: ['Use the correct credit value for each course block.', 'Ask your school for the official percentage formula.', 'Keep semester GPAs accurate.'],
    takeaways: ['CGPA weights semesters by credits.', 'It summarizes overall performance.', 'Percentage conversion is institution-specific.'],
    faq: [['Is CGPA the same as GPA?', 'CGPA is cumulative across semesters; GPA is usually one term.'], ['Which credits do I enter?', 'The total credit hours for that semester.'], ['Is 9.5 always correct?', 'No, it is a common approximation.'], ['Is my data uploaded?', 'No, it runs locally.']],
    conclusion: '<p>Turn your CGPA into a percentage in context, then refine single-term results with the <a href="gpa-calculator.html">GPA calculator</a>.</p>'
  }
});

/* ========================================================================
   2. GRADE WEIGHT CALCULATOR
   ======================================================================== */
add({
  file: 'grade-weight-calculator.html', folder: 'math',
  name: 'Grade Weight Calculator', tag: 'Academic', icon: 'fa-solid fa-scale-balanced',
  title: 'Grade Weight Calculator | Weighted Course Grade',
  metaDesc: 'Combine assignment, exam and project scores by their weightings into one final course grade. Free and fully in-browser.',
  desc: 'Weight each assessment and see the single final grade that results, so you know where your marks really come from.',
  keywords: ['grade weight calculator', 'weighted grade', 'course grade', 'assessment weighting', 'final grade', 'academic calculator'],
  featureList: ['Weighted averaging', 'Multiple components', 'Instant result', '100% client-side'],
  panel: panel.wrap('gwt', 'fa-solid fa-scale-balanced', 'Grade weight calculator',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">One component per line: <code>score, weight%</code></p>' +
    area('gwtIn', 'Components (score, weight%)', '85, 30\n90, 40\n78, 30') +
    go('gwt') + tiles([['Weighted grade', 'gwtOut'], ['Total weight', 'gwtW']])),
  js: `
    function run(){var lines=document.getElementById("gwtIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var s=0,w=0;
      lines.forEach(function(l){var p=l.split(/[,\\s]+/).map(Number);if(p.length>=2&&p[1]>0){s+=p[0]*p[1];w+=p[1];}});
      document.getElementById("gwtOut").textContent=w?(s/w).toFixed(2):"-";
      document.getElementById("gwtW").textContent=w+"%";
      document.getElementById("gwtProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("gwtIn").addEventListener("input",run);
    document.getElementById("gwtGo").addEventListener("click",run);run();`,
  article: {
    title: 'Grade Weight Calculator: See Your Weighted Score',
    lead: '<p>Not every assessment counts equally. This <strong>grade weight calculator</strong> combines your scores by their weights to reveal the true final grade.</p>',
    sections: [
      { id: 'why', icon: 'fa-solid fa-lightbulb', heading: 'Why weighting matters', html: '<p>A final exam worth 50% moves your grade far more than a quiz worth 5%. Weighting shows the real impact of each component.</p>' },
      { id: 'calc', icon: 'fa-solid fa-calculator', heading: 'The calculation', html: '<p>Multiply each score by its weight, add the products, and divide by total weight. Output is on the same scale as your scores.</p>' }
    ],
    steps: ['List each component with score and weight.', 'Ensure weights reflect the syllabus.', 'Read your weighted grade.'],
    facts: [['Method', 'Weighted average'], ['Input', 'Score + weight %'], ['Output', 'Weighted grade'], ['Data handling', 'Runs locally']],
    useCases: [['Course planning', 'See which components dominate.'], ['Grade tracking', 'Project your outcome.'], ['Appeals', 'Check a recalculated mark.']],
    tips: ['Weights should total 100% where possible.', 'Use the exact syllabus weightings.', 'Update after each result.'],
    takeaways: ['Weights reflect importance.', 'Weighted grades show true performance.', 'Totals should sum near 100%.'],
    faq: [['Do weights need to total 100?', 'Ideally yes; partial totals still work proportionally.'], ['Can scores exceed 100?', 'Use raw scores on a consistent scale.'], ['Does it handle extra credit?', 'Enter it as a component.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Map your weightings precisely and predict the outcome with the <a href="final-grade-calculator.html">final grade calculator</a>.</p>'
  }
});

/* ========================================================================
   3. GRADE SCALE CONVERTER
   ======================================================================== */
add({
  file: 'grade-scale-converter.html', folder: 'math',
  name: 'Grade Scale Converter', tag: 'Academic', icon: 'fa-solid fa-right-left',
  title: 'Grade Scale Converter | Letter, Percentage & GPA',
  metaDesc: 'Convert between percentage, letter grade and GPA on the standard 4.0 scale. Free, instant and fully client-side.',
  desc: 'Translate a percentage mark into a letter grade and a 4.0-scale GPA, or work the other way, in one click.',
  keywords: ['grade scale converter', 'letter grade', 'percentage to gpa', '4.0 scale', 'grade conversion', 'academic calculator'],
  featureList: ['Percentage to letter', 'Letter to GPA', '4.0 scale', '100% client-side'],
  panel: panel.wrap('gsc', 'fa-solid fa-right-left', 'Grade scale converter',
    '<div class="row3"style="margin-bottom:14px">' +
    num('gscPct', 'Percentage (%)', '87', 'step="0.1"') +
    '<div class="field"><label for="gscLetter">Letter grade</label><select id="gscLetter">' +
    ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map(function (x) { return '<option>' + x + '</option>'; }).join('') +
    '</select></div>' +
    '<div class="field"><label for="gscMode">Mode</label><select id="gscMode"><option value="pct">From percentage</option><option value="letter">From letter</option></select></div>' +
    '</div>' + tiles([['Letter', 'gscOutLetter'], ['GPA (4.0)', 'gscOutGpa'], ['Percentage', 'gscOutPct']]) + go('gsc')),
  js: `
    var SCALE={"A+":4.0,"A":4.0,"A-":3.7,"B+":3.3,"B":3.0,"B-":2.7,"C+":2.3,"C":2.0,"C-":1.7,"D":1.0,"F":0};
    var PCT={"A+":97,"A":93,"A-":90,"B+":87,"B":83,"B-":80,"C+":77,"C":73,"C-":70,"D":60,"F":0};
    function fromPct(p){var lg=p>=97?"A+":p>=93?"A":p>=90?"A-":p>=87?"B+":p>=83?"B":p>=80?"B-":p>=77?"C+":p>=73?"C":p>=70?"C-":p>=60?"D":"F";return lg;}
    function run(){var mode=document.getElementById("gscMode").value;
      var letter,gpa,pct;
      if(mode==="letter"){letter=document.getElementById("gscLetter").value;gpa=SCALE[letter];pct=PCT[letter];}
      else{pct=+document.getElementById("gscPct").value;letter=fromPct(pct);gpa=SCALE[letter];}
      document.getElementById("gscOutLetter").textContent=letter;
      document.getElementById("gscOutGpa").textContent=gpa.toFixed(1);
      document.getElementById("gscOutPct").textContent=pct+"%";
      document.getElementById("gscProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["gscPct","gscLetter","gscMode"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("gscGo").addEventListener("click",run);run();`,
  article: {
    title: 'Grade Scale Converter: Percentage, Letter and GPA',
    lead: '<p>Different systems express the same performance in percentages, letters or GPA. This <strong>grade scale converter</strong> moves between them using a standard 4.0-scale mapping.</p>',
    sections: [
      { id: 'scale', icon: 'fa-solid fa-list-ol', heading: 'The 4.0 scale', html: '<p>An A is 4.0, an A- is 3.7, B+ is 3.3, and so on in 0.3 or 0.4 steps. Percent bands vary by school, so treat conversions as guidelines.</p>' },
      { id: 'use', icon: 'fa-solid fa-globe', heading: 'Using conversions', html: '<p>Applications abroad often ask for a 4.0 GPA; matching letter grades lets you convert consistently across institutions.</p>' }
    ],
    steps: ['Choose to convert from percentage or letter.', 'Enter the value.', 'Read the letter, GPA and percentage.'],
    facts: [['Scale', '4.0 standard'], ['Input', 'Percentage or letter'], ['Output', 'Letter, GPA, %'], ['Data handling', 'Runs locally']],
    useCases: [['Applications', 'Report a GPA abroad.'], ['Transcripts', 'Interpret a letter grade.'], ['Comparison', 'Line up different systems.']],
    tips: ['Confirm your school bands.', 'Use one consistent scale throughout.', 'Round GPA to one decimal.'],
    takeaways: ['Conversions map performance across systems.', 'Bands vary by institution.', 'GPA uses a 4.0 scale.'],
    faq: [['Is 90% always an A?', 'No, bands differ by school.'], ['Why is A- not 3.8?', 'Most 4.0 scales use 0.3/0.4 steps.'], ['Can I convert GPA to %?', 'Yes, roughly, via the letter grade.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Confirm your final numbers with the <a href="gpa-calculator.html">GPA calculator</a>.</p>'
  }
});

/* ========================================================================
   4. GRADE POINT CALCULATOR
   ======================================================================== */
add({
  file: 'grade-point-calculator.html', folder: 'math',
  name: 'Grade Point Calculator', tag: 'Academic', icon: 'fa-solid fa-star-half-stroke',
  title: 'Grade Point Calculator | Points from Grades & Credits',
  metaDesc: 'Compute total grade points from letter grades and credit hours using the standard 4.0 scale. Free and fully in-browser.',
  desc: 'Turn letter grades and credit hours into total grade points and a GPA using the standard 4.0 scale.',
  keywords: ['grade point calculator', 'grade points', 'gpa points', 'letter grade credits', '4.0 scale', 'academic calculator'],
  featureList: ['Letter grade points', 'Credit weighting', 'Instant GPA', '100% client-side'],
  panel: panel.wrap('gp', 'fa-solid fa-star-half-stroke', 'Grade point calculator',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">One course per line: <code>grade, credits</code></p>' +
    area('gpIn', 'Courses (grade, credits)', 'A, 3\nB+, 4\nA-, 3') +
    go('gp') + tiles([['Grade points', 'gpPts'], ['GPA', 'gpGpa']])),
  js: `
    var SCALE={"A+":4.0,"A":4.0,"A-":3.7,"B+":3.3,"B":3.0,"B-":2.7,"C+":2.3,"C":2.0,"C-":1.7,"D":1.0,"F":0};
    function run(){var lines=document.getElementById("gpIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var pts=0,cr=0;
      lines.forEach(function(l){var m=l.split(/[,\\s]+/);if(m.length>=2){var g=m[0].toUpperCase();var c=+m[1];if(SCALE[g]!==undefined&&c>0){pts+=SCALE[g]*c;cr+=c;}}});
      document.getElementById("gpPts").textContent=pts.toFixed(1);
      document.getElementById("gpGpa").textContent=cr?(pts/cr).toFixed(2):"-";
      document.getElementById("gpProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("gpIn").addEventListener("input",run);
    document.getElementById("gpGo").addEventListener("click",run);run();`,
  article: {
    title: 'Grade Point Calculator: Points and GPA',
    lead: '<p>Grade points are the raw units behind GPA. This <strong>grade point calculator</strong> multiplies each letter grade value by its credits to total your points.</p>',
    sections: [
      { id: 'points', icon: 'fa-solid fa-star', heading: 'What grade points are', html: '<p>Each letter grade maps to a value (A = 4.0, B = 3.0). Multiply by credit hours to get grade points; sum them and divide by credits for GPA.</p>' },
      { id: 'scale', icon: 'fa-solid fa-list-ol', heading: 'Standard mapping', html: '<p>The 4.0 scale adds plus/minus steps: A- 3.7, B+ 3.3, B- 2.7 and so on. Confirm your institution mapping.</p>' }
    ],
    steps: ['Enter each course as grade and credits.', 'Points are summed automatically.', 'Read total points and GPA.'],
    facts: [['Scale', '4.0 with plus/minus'], ['Input', 'Grades + credits'], ['Output', 'Points and GPA'], ['Data handling', 'Runs locally']],
    useCases: [['Transcripts', 'Compute totals for forms.'], ['Planning', 'See GPA impact of a course.'], ['Scholarships', 'Verify point thresholds.']],
    tips: ['Use official plus/minus grades.', 'Check credit values carefully.', 'Keep the scale consistent.'],
    takeaways: ['Grade points drive GPA.', 'Credits weight each course.', 'The 4.0 scale uses plus/minus steps.'],
    faq: [['What is a grade point?', 'A letter grade value times credit hours.'], ['Does A+ exceed 4.0?', 'Usually capped at 4.0.'], ['Which scale is standard?', 'The 4.0 scale is most common in the US.'], ['Is my data uploaded?', 'No, it runs locally.']],
    conclusion: '<p>Feed the result into the <a href="cgpa-calculator.html">CGPA calculator</a> to track cumulative performance.</p>'
  }
});

/* ========================================================================
   5. GPA IMPROVEMENT CALCULATOR
   ======================================================================== */
add({
  file: 'gpa-improvement-calculator.html', folder: 'math',
  name: 'GPA Improvement Calculator', tag: 'Academic', icon: 'fa-solid fa-arrow-trend-up',
  title: 'GPA Improvement Calculator | Target GPA Planner',
  metaDesc: 'Find the GPA you need in upcoming credits to reach a target cumulative GPA. Free, private and fully in-browser.',
  desc: 'Set a target CGPA and see the average GPA you must earn over your remaining credits to reach it.',
  keywords: ['gpa improvement calculator', 'target gpa', 'required gpa', 'cgpa planner', 'grade planning', 'academic calculator'],
  featureList: ['Target GPA planning', 'Remaining credits', 'Instant result', '100% client-side'],
  panel: panel.wrap('gpi', 'fa-solid fa-arrow-trend-up', 'GPA improvement planner',
    '<div class="row3"style="margin-bottom:14px">' +
    num('gpiCur', 'Current CGPA', '3.2', 'step="0.01"') +
    num('gpiCred', 'Credits completed', '60') +
    num('gpiTarget', 'Target CGPA', '3.5', 'step="0.01"') +
    '</div>' + num('gpiRem', 'Remaining credits', '30') +
    go('gpi') + tiles([['Required GPA', 'gpiOut'], ['Feasibility', 'gpiFeas']])),
  js: `
    function run(){var cur=+document.getElementById("gpiCur").value,c=+document.getElementById("gpiCred").value,t=+document.getElementById("gpiTarget").value,r=+document.getElementById("gpiRem").value;
      if(!(r>0)){document.getElementById("gpiOut").textContent="-";return;}
      var need=(t*(c+r)-cur*c)/r;
      document.getElementById("gpiOut").textContent=need.toFixed(2);
      document.getElementById("gpiFeas").textContent=need>4?"Not possible on 4.0":need<=0?"Already achieved":need<=4?"Achievable":"-";
      document.getElementById("gpiProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["gpiCur","gpiCred","gpiTarget","gpiRem"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("gpiGo").addEventListener("click",run);run();`,
  article: {
    title: 'GPA Improvement Calculator: Hit Your Target',
    lead: '<p>Wondering what it takes to lift your average? This <strong>GPA improvement calculator</strong> shows the remaining average you need to reach a target CGPA.</p>',
    sections: [
      { id: 'math', icon: 'fa-solid fa-calculator', heading: 'The target math', html: '<p>Required GPA equals (target x total credits - current x completed credits) / remaining credits. If it exceeds 4.0, the target is out of reach on a 4.0 scale.</p>' },
      { id: 'realistic', icon: 'fa-solid fa-bullseye', heading: 'Setting realistic targets', html: '<p>The more credits you have already earned, the harder a given CGPA is to move. Early planning has the most leverage.</p>' }
    ],
    steps: ['Enter current CGPA and credits completed.', 'Set a target and remaining credits.', 'Read the GPA you must earn.'],
    facts: [['Method', 'Weighted target solve'], ['Input', 'Current, target, credits'], ['Output', 'Required GPA'], ['Data handling', 'Runs locally']],
    useCases: [['Goal setting', 'Plan a target CGPA.'], ['Course selection', 'Judge needed effort.'], ['Advising', 'Discuss realistic aims.']],
    tips: ['Update as credits accumulate.', 'A target above 4.0 is impossible.', 'Plan early for the most leverage.'],
    takeaways: ['Higher targets need higher remaining averages.', 'Completed credits dilute change.', 'Early terms matter most.'],
    faq: [['Can I always reach my target?', 'No, it may exceed the 4.0 maximum.'], ['Why does credit count matter?', 'It weights the existing average.'], ['Does it assume the 4.0 scale?', 'Yes.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Set the frame with the <a href="cgpa-calculator.html">CGPA calculator</a> first.</p>'
  }
});

/* ========================================================================
   6. COURSE LOAD CALCULATOR
   ======================================================================== */
add({
  file: 'course-load-calculator.html', folder: 'math',
  name: 'Course Load Calculator', tag: 'Academic', icon: 'fa-solid fa-layer-group',
  title: 'Course Load Calculator | Study Hours & Credits',
  metaDesc: 'Estimate weekly study hours from your credit load and see whether your schedule is light, balanced or heavy. In-browser and private.',
  desc: 'Convert your credit hours into estimated weekly study time and gauge whether your course load is sustainable.',
  keywords: ['course load calculator', 'credit hours', 'study hours', 'workload', 'semester planning', 'academic calculator'],
  featureList: ['Credit to hours estimate', 'Load rating', 'Instant result', '100% client-side'],
  panel: panel.wrap('cl', 'fa-solid fa-layer-group', 'Course load calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    num('clCredits', 'Credit hours', '15') +
    num('clWeeks', 'Weeks in term', '16') +
    '<div class="field"><label for="clLevel">Level</label><select id="clLevel"><option value="2">Standard (2x)</option><option value="1.5">Light (1.5x)</option><option value="3">Intensive (3x)</option></select></div>' +
    '</div>' + go('cl') + tiles([['Weekly study hours', 'clOut'], ['Total term hours', 'clTerm'], ['Load', 'clLoad']])),
  js: `
    function run(){var cr=+document.getElementById("clCredits").value,w=+document.getElementById("clWeeks").value,mult=+document.getElementById("clLevel").value;
      var weekly=cr*mult;
      document.getElementById("clOut").textContent=weekly+" hrs/week";
      document.getElementById("clTerm").textContent=Math.round(weekly*w)+" hrs";
      document.getElementById("clLoad").textContent=cr>=18?"Heavy":cr>=12?"Balanced":cr>=6?"Light":"Very light";
      document.getElementById("clProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["clCredits","clWeeks","clLevel"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("clGo").addEventListener("click",run);run();`,
  article: {
    title: 'Course Load Calculator: Plan Study Time',
    lead: '<p>Universities often suggest two to three hours of study per credit hour weekly. This <strong>course load calculator</strong> turns your credits into an expected workload.</p>',
    sections: [
      { id: 'rule', icon: 'fa-solid fa-clock', heading: 'The study-hour rule', html: '<p>A common guideline is two hours of outside study per credit hour per week. Adding your class hours gives total engagement.</p>' },
      { id: 'balance', icon: 'fa-solid fa-scale-balanced', heading: 'Finding balance', html: '<p>A heavy load with a job or activities can crowd out study. The rating here flags when a schedule may be too full.</p>' }
    ],
    steps: ['Enter credit hours and term length.', 'Choose the study multiplier.', 'Read weekly and total hours plus a load rating.'],
    facts: [['Rule of thumb', '2 hrs/week per credit'], ['Input', 'Credits, weeks, multiplier'], ['Output', 'Hours and rating'], ['Data handling', 'Runs locally']],
    useCases: [['Semester planning', 'Balance study and life.'], ['Advising', 'Justify a reduced load.'], ['Time blocking', 'Reserve study slots.']],
    tips: ['Adjust the multiplier to your habits.', 'Include lab hours in credits.', 'Re-rate after drop/add.'],
    takeaways: ['Credits imply study hours.', 'Load ratings flag overload.', 'Balance protects results.'],
    faq: [['Is 2 hours per credit fixed?', 'No, it is a guideline.'], ['What counts as heavy?', 'Often 18+ credits at standard multiplier.'], ['Does it include class time?', 'No, only study estimate.'], ['Is my data uploaded?', 'No, it runs locally.']],
    conclusion: '<p>Once planned, track weekly effort with the <a href="study-time-tracker.html">study time tracker</a>.</p>'
  }
});

/* ========================================================================
   7. COURSE CALCULATOR
   ======================================================================== */
add({
  file: 'course-calculator.html', folder: 'math',
  name: 'Course Calculator', tag: 'Academic', icon: 'fa-solid fa-book-open',
  title: 'Course Calculator | Course Grade from Assignments',
  metaDesc: 'Add up assignments, quizzes and exams with their marks to get a current course grade and percentage. Free and in-browser.',
  desc: 'Sum points earned versus possible across all course components to get your current running course grade.',
  keywords: ['course calculator', 'course grade', 'assignment points', 'running grade', 'points earned', 'academic calculator'],
  featureList: ['Points earned/possible', 'Running percentage', 'Letter estimate', '100% client-side'],
  panel: panel.wrap('cc', 'fa-solid fa-book-open', 'Course grade calculator',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">One item per line: <code>earned, possible</code></p>' +
    area('ccIn', 'Items (earned, possible)', '45, 50\n88, 100\n19, 20') +
    go('cc') + tiles([['Grade', 'ccOut'], ['Points', 'ccPts'], ['Letter', 'ccLetter']])),
  js: `
    function run(){var lines=document.getElementById("ccIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var e=0,p=0;
      lines.forEach(function(l){var m=l.split(/[,\\s]+/).map(Number);if(m.length>=2&&m[1]>0){e+=m[0];p+=m[1];}});
      var pct=p?e/p*100:0;
      document.getElementById("ccOut").textContent=pct.toFixed(1)+"%";
      document.getElementById("ccPts").textContent=e+" / "+p;
      document.getElementById("ccLetter").textContent=pct>=90?"A":pct>=80?"B":pct>=70?"C":pct>=60?"D":"F";
      document.getElementById("ccProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("ccIn").addEventListener("input",run);
    document.getElementById("ccGo").addEventListener("click",run);run();`,
  article: {
    title: 'Course Calculator: Running Grade from Points',
    lead: '<p>Track where you stand mid-semester. This <strong>course calculator</strong> sums points earned against points possible across every graded item.</p>',
    sections: [
      { id: 'method', icon: 'fa-solid fa-calculator', heading: 'Points-based grading', html: '<p>When all work shares one point pool, your grade is earned points divided by possible points. It differs from weighted grading, where components carry different weights.</p>' },
      { id: 'project', icon: 'fa-solid fa-forward', heading: 'Projecting ahead', html: '<p>Knowing your current percentage and the points still available lets you estimate the final outcome and the score still needed.</p>' }
    ],
    steps: ['List each graded item as earned and possible.', 'The tool totals both.', 'Read your running percentage and letter.'],
    facts: [['Method', 'Earned / possible points'], ['Input', 'Earned + possible'], ['Output', 'Percentage and letter'], ['Data handling', 'Runs locally']],
    useCases: [['Mid-term check', 'Know your standing.'], ['Study focus', 'Target weak areas.'], ['Planning', 'Estimate the final grade.']],
    tips: ['Update after each result.', 'Keep raw points, not just percentages.', 'Exclude ungraded items.'],
    takeaways: ['Points-based grades divide earned by possible.', 'It differs from weighted grading.', 'Tracking reveals trends.'],
    faq: [['Is this the same as weighted?', 'No, it assumes a single point pool.'], ['Do ungraded items count?', 'Leave them out until scored.'], ['How is the letter assigned?', 'By standard 10-point bands.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Convert the percentage with the <a href="grade-scale-converter.html">grade scale converter</a>.</p>'
  }
});

/* ========================================================================
   8. MARKS CALCULATOR
   ======================================================================== */
add({
  file: 'marks-calculator.html', folder: 'math',
  name: 'Marks Calculator', tag: 'Academic', icon: 'fa-solid fa-list-check',
  title: 'Marks Calculator | Total, Average & Percentage',
  metaDesc: 'Add subject marks to get the total, average and percentage instantly. Free, private and fully in-browser.',
  desc: 'Total your subject marks and get the average score, overall percentage and highest and lowest subjects.',
  keywords: ['marks calculator', 'total marks', 'average marks', 'percentage marks', 'subject marks', 'academic calculator'],
  featureList: ['Sum and average', 'Percentage', 'High/low subject', '100% client-side'],
  panel: panel.wrap('mk', 'fa-solid fa-list-check', 'Marks calculator',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">One subject per line: <code>obtained, max</code></p>' +
    area('mkIn', 'Subjects (obtained, max)', '78, 100\n85, 100\n92, 100') +
    go('mk') + tiles([['Percentage', 'mkPct'], ['Total', 'mkTotal'], ['Average', 'mkAvg']])),
  js: `
    function run(){var lines=document.getElementById("mkIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var o=0,m=0,n=0,mn=1e9,mx=0;
      lines.forEach(function(l){var p=l.split(/[,\\s]+/).map(Number);if(p.length>=2&&p[1]>0){o+=p[0];m+=p[1];n++;if(p[0]<mn)mn=p[0];if(p[0]>mx)mx=p[0];}});
      var pct=m?o/m*100:0;
      document.getElementById("mkPct").textContent=pct.toFixed(1)+"%";
      document.getElementById("mkTotal").textContent=o+" / "+m;
      document.getElementById("mkAvg").textContent=n?(o/n).toFixed(1):"-";
      document.getElementById("mkProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("mkIn").addEventListener("input",run);
    document.getElementById("mkGo").addEventListener("click",run);run();`,
  article: {
    title: 'Marks Calculator: Total, Average and Percentage',
    lead: '<p>Enter your subject marks once and get the total, average and percentage together. This <strong>marks calculator</strong> handles varying maximums and mixed totals.</p>',
    sections: [
      { id: 'pct', icon: 'fa-solid fa-percent', heading: 'Percentage across subjects', html: '<p>When subjects have different maximum marks, percentage is total obtained divided by total maximum, not the plain average of percentages.</p>' },
      { id: 'avg', icon: 'fa-solid fa-chart-simple', heading: 'Average mark', html: '<p>The simple average divides total marks by the number of subjects. Use it when all subjects share the same maximum.</p>' }
    ],
    steps: ['Enter each subject as obtained and max.', 'Totals update automatically.', 'Read percentage, total and average.'],
    facts: [['Method', 'Sum / max'], ['Input', 'Marks + max'], ['Output', 'Total, avg, %'], ['Data handling', 'Runs locally']],
    useCases: [['Report cards', 'Summarise results.'], ['Admissions', 'Compute a percentage.'], ['Comparison', 'Spot strong and weak subjects.']],
    tips: ['Include maximum marks for accuracy.', 'Double-check totals before submitting.', 'Use consistent subjects.'],
    takeaways: ['Percentage uses total max.', 'Average uses subject count.', 'Mixed maxes need totals.'],
    faq: [['Should I include all subjects?', 'Include those that count toward the result.'], ['How is percentage computed?', 'Total obtained divided by total max.'], ['Can maxes differ?', 'Yes, the tool handles that.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Convert the result with the <a href="mark-percentage-calculator.html">mark percentage calculator</a>.</p>'
  }
});

/* ========================================================================
   9. FINANCIAL AID CALCULATOR
   ======================================================================== */
add({
  file: 'financial-aid-calculator.html', folder: 'finance',
  name: 'Financial Aid Calculator', tag: 'Education', icon: 'fa-solid fa-hand-holding-dollar',
  title: 'Financial Aid Calculator | Estimate Unmet Need',
  metaDesc: 'Estimate your college financial need from cost of attendance, expected family contribution and aid awarded. Free and in-browser.',
  desc: 'Work out the gap between total college costs and your funding sources to see the unmet need you must cover.',
  keywords: ['financial aid calculator', 'student aid', 'unmet need', 'cost of attendance', 'efc', 'education funding'],
  featureList: ['Cost vs aid', 'Unmet need gap', 'Coverage percent', '100% client-side'],
  panel: panel.wrap('fa', 'fa-solid fa-hand-holding-dollar', 'Financial aid estimate',
    '<div class="row3"style="margin-bottom:14px">' +
    num('faCost', 'Cost of attendance', '30000', 'step="1"') +
    num('faEfc', 'Expected family contribution', '8000', 'step="1"') +
    num('faAid', 'Grants & scholarships', '12000', 'step="1"') +
    '</div>' + num('faLoans', 'Loans & work-study', '5000', 'step="1"') +
    go('fa') + tiles([['Unmet need', 'faOut'], ['Coverage', 'faCov']])),
  js: `
    function fmt(n){return "$"+Math.round(n).toLocaleString();}
    function run(){var c=+document.getElementById("faCost").value,efc=+document.getElementById("faEfc").value,g=+document.getElementById("faAid").value,l=+document.getElementById("faLoans").value;
      var need=c-efc;var gap=c-efc-g-l;
      document.getElementById("faOut").textContent=fmt(gap<0?0:gap);
      document.getElementById("faCov").textContent=c?Math.round((efc+g+l)/c*100)+"%":"-";
      document.getElementById("faProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["faCost","faEfc","faAid","faLoans"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("faGo").addEventListener("click",run);run();`,
  article: {
    title: 'Financial Aid Calculator: Estimate Unmet Need',
    lead: '<p>Financial aid rarely covers everything. This <strong>financial aid calculator</strong> subtracts your contribution and awards from the cost of attendance to reveal the gap.</p>',
    sections: [
      { id: 'need', icon: 'fa-solid fa-scale-unbalanced', heading: 'Need versus aid', html: '<p>Need is cost of attendance minus expected family contribution. Aid then reduces that need; whatever remains is unmet and must be funded another way.</p>' },
      { id: 'plan', icon: 'fa-solid fa-clipboard-list', heading: 'Planning the gap', html: '<p>An unmet need can be covered by additional scholarships, work-study, or loans. Knowing the size early guides your applications.</p>' }
    ],
    steps: ['Enter cost of attendance and expected contribution.', 'Add grants and loans.', 'Read the unmet need and coverage.'],
    facts: [['Formula', 'Cost - EFC - aid - loans'], ['Input', 'Cost, EFC, aid'], ['Output', 'Gap and coverage'], ['Data handling', 'Runs locally']],
    useCases: [['College comparison', 'Compare net costs.'], ['Budgeting', 'Plan the funding gap.'], ['Scholarship hunting', 'Size the shortfall.']],
    tips: ['Use the official aid letter figures.', 'Include all grants and loans.', 'Recheck each year.'],
    takeaways: ['Unmet need is cost minus all funding.', 'Coverage shows the funded share.', 'Early planning reduces surprises.'],
    faq: [['What is EFC?', 'Expected family contribution from aid forms.'], ['Do loans count as aid?', 'They fund you but must be repaid.'], ['Is this an official award?', 'No, it is an estimate.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Pair this with the <a href="../finance/loan-calculator.html">loan calculator</a> to model repayment.</p>'
  }
});

/* ========================================================================
   10. ACADEMIC CREDIT PLANNER
   ======================================================================== */
add({
  file: 'academic-credit-planner.html', folder: 'math',
  name: 'Academic Credit Planner', tag: 'Academic', icon: 'fa-solid fa-diagram-project',
  title: 'Academic Credit Planner | Credits to Graduation',
  metaDesc: 'Plan how many credits to take each term to reach your graduation credit total on schedule. Free and fully in-browser.',
  desc: 'Divide the credits remaining to graduation across your terms and see the average per-term load you need.',
  keywords: ['credit planner', 'graduation credits', 'credit load', 'degree planning', 'credits remaining', 'academic calculator'],
  featureList: ['Credits to graduation', 'Per-term average', 'Terms needed', '100% client-side'],
  panel: panel.wrap('acp', 'fa-solid fa-diagram-project', 'Credit planner',
    '<div class="row3"style="margin-bottom:14px">' +
    num('acpTotal', 'Credits required', '120') +
    num('acpDone', 'Credits completed', '75') +
    num('acpPer', 'Credits per term', '15') +
    '</div>' + go('acp') + tiles([['Credits remaining', 'acpRem'], ['Terms needed', 'acpTerms'], ['Recommended/term', 'acpRec']])),
  js: `
    function run(){var t=+document.getElementById("acpTotal").value,d=+document.getElementById("acpDone").value,p=+document.getElementById("acpPer").value;
      var rem=Math.max(0,t-d);
      document.getElementById("acpRem").textContent=rem;
      document.getElementById("acpTerms").textContent=p>0?Math.ceil(rem/p):"-";
      document.getElementById("acpRec").textContent=rem>0&&p>0?rem:0;
      document.getElementById("acpProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["acpTotal","acpDone","acpPer"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("acpGo").addEventListener("click",run);run();`,
  article: {
    title: 'Academic Credit Planner: Graduate On Schedule',
    lead: '<p>Stay on track for graduation. This <strong>academic credit planner</strong> shows the credits remaining and how many terms they take at your chosen pace.</p>',
    sections: [
      { id: 'pace', icon: 'fa-solid fa-gauge-high', heading: 'Choosing a pace', html: '<p>Full-time study is often 12-15 credits per term. A higher per-term number finishes sooner but leaves less room for work or activities.</p>' },
      { id: 'buffer', icon: 'fa-solid fa-shield-halved', heading: 'Leave a buffer', html: '<p>Prerequisite chains, course availability and major requirements can delay progress. Adding a term of slack protects your graduation date.</p>' }
    ],
    steps: ['Enter credits required and completed.', 'Set your planned credits per term.', 'Read remaining credits and terms.'],
    facts: [['Formula', 'Remaining / per-term'], ['Input', 'Required, done, per-term'], ['Output', 'Credits and terms'], ['Data handling', 'Runs locally']],
    useCases: [['Degree planning', 'Map remaining terms.'], ['Advising', 'Justify course counts.'], ['Transfer review', 'Recheck after credits transfer.']],
    tips: ['Confirm the exact graduation total.', 'Account for prerequisite sequences.', 'Keep a buffer term.'],
    takeaways: ['Credits remaining drive terms needed.', 'Pace trades speed for balance.', 'Buffers protect the schedule.'],
    faq: [['How many credits is full-time?', 'Commonly 12 per term.'], ['What if courses are unavailable?', 'Add a buffer term.'], ['Do transfers change totals?', 'Yes, update completed credits.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Balance the pace with the <a href="course-load-calculator.html">course load calculator</a>.</p>'
  }
});

/* ========================================================================
   11. ATTENDANCE CALCULATOR
   ======================================================================== */
add({
  file: 'attendance-calculator.html', folder: 'math',
  name: 'Attendance Calculator', tag: 'Academic', icon: 'fa-solid fa-calendar-check',
  title: 'Attendance Calculator | Percentage & Classes to Miss',
  metaDesc: 'Calculate your attendance percentage and how many classes you can miss while staying above a required threshold. In-browser.',
  desc: 'See your current attendance percentage and the number of classes you can still skip and remain above your required minimum.',
  keywords: ['attendance calculator', 'attendance percentage', 'classes attended', 'minimum attendance', 'college attendance', 'academic calculator'],
  featureList: ['Attendance percentage', 'Classes you can skip', 'Threshold check', '100% client-side'],
  panel: panel.wrap('att', 'fa-solid fa-calendar-check', 'Attendance calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    num('attHeld', 'Classes held', '60') +
    num('attAt', 'Classes attended', '48') +
    num('attReq', 'Required %', '75') +
    '</div>' + go('att') + tiles([['Attendance', 'attOut'], ['Can still skip', 'attSkip'], ['Status', 'attStat']])),
  js: `
    function run(){var held=+document.getElementById("attHeld").value,at=+document.getElementById("attAt").value,req=+document.getElementById("attReq").value;
      var pct=held?at/held*100:0;
      document.getElementById("attOut").textContent=pct.toFixed(1)+"%";
      var canSkip=req<100?Math.floor(at/req*100-held):0;if(canSkip<0)canSkip=0;
      document.getElementById("attSkip").textContent=canSkip;
      document.getElementById("attStat").textContent=pct>=req?"Safe":"Below requirement";
      document.getElementById("attProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["attHeld","attAt","attReq"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("attGo").addEventListener("click",run);run();`,
  article: {
    title: 'Attendance Calculator: Track Your Percentage',
    lead: '<p>Many courses require a minimum attendance. This <strong>attendance calculator</strong> shows your current percentage and how many classes you can miss while staying above the threshold.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-calculator', heading: 'How it is computed', html: '<p>Attendance percentage is classes attended divided by classes held. The "can still skip" figure solves how many more misses keep you at or above the required level.</p>' },
      { id: 'policy', icon: 'fa-solid fa-clipboard-list', heading: 'Policy matters', html: '<p>Rules vary: some count labs separately, some allow medical exemptions. Always check your institution policy, not just the number.</p>' }
    ],
    steps: ['Enter classes held and attended.', 'Set the required percentage.', 'Read your attendance and safe skips.'],
    facts: [['Formula', 'Attended / held'], ['Input', 'Held, attended, required'], ['Output', 'Percentage and skips'], ['Data handling', 'Runs locally']],
    useCases: [['Eligibility', 'Check exam eligibility.'], ['Planning', 'Know your leeway.'], ['Tracking', 'Monitor through the term.']],
    tips: ['Update after each class.', 'Check whether labs count separately.', 'Confirm exemption policies.'],
    takeaways: ['Attendance is a ratio.', 'Required minimums vary.', 'Safe skips show your margin.'],
    faq: [['Is 75% universal?', 'No, requirements differ.'], ['Do medical leaves count?', 'Only per your policy.'], ['What if I am below?', 'You may need to recover attendance.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Plan recovery using the <a href="semester-planner.html">semester planner</a>.</p>'
  }
});

/* ========================================================================
   12. GRADE PREDICTION CALCULATOR
   ======================================================================== */
add({
  file: 'grade-prediction-calculator.html', folder: 'math',
  name: 'Grade Prediction Calculator', tag: 'Academic', icon: 'fa-solid fa-crystal-ball',
  title: 'Grade Prediction Calculator | Future Exam Outcome',
  metaDesc: 'Predict your final grade from your current standing and the score you expect on a remaining exam. Free and in-browser.',
  desc: 'Combine your current grade with expected scores on remaining assessments to predict the final course grade.',
  keywords: ['grade prediction calculator', 'predict grade', 'final grade forecast', 'exam score needed', 'course outcome', 'academic calculator'],
  featureList: ['Current standing', 'Weighted forecast', 'Score needed', '100% client-side'],
  panel: panel.wrap('gpr', 'fa-solid fa-crystal-ball', 'Grade prediction',
    '<div class="row3"style="margin-bottom:14px">' +
    num('gprCur', 'Current grade (%)', '82', 'step="0.1"') +
    num('gprCW', 'Weight completed (%)', '70') +
    num('gprExp', 'Expected exam (%)', '88', 'step="0.1"') +
    '</div>' + num('gprTarget', 'Target grade (%)', '90', 'step="0.1"') +
    go('gpr') + tiles([['Predicted grade', 'gprOut'], ['Score needed for target', 'gprNeed']])),
  js: `
    function run(){var cur=+document.getElementById("gprCur").value,cw=+document.getElementById("gprCW").value,exp=+document.getElementById("gprExp").value,tg=+document.getElementById("gprTarget").value;
      var rem=100-cw;
      var pred=(cur*cw+exp*rem)/100;
      document.getElementById("gprOut").textContent=pred.toFixed(1)+"%";
      var need=rem>0?(tg*100-cur*cw)/rem:cur;
      document.getElementById("gprNeed").textContent=rem>0?(need.toFixed(1)+"%"):"-";
      document.getElementById("gprProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["gprCur","gprCW","gprExp","gprTarget"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("gprGo").addEventListener("click",run);run();`,
  article: {
    title: 'Grade Prediction Calculator: Forecast Your Final',
    lead: '<p>See where a term is heading. This <strong>grade prediction calculator</strong> blends your graded work with an expected exam score to forecast the final grade.</p>',
    sections: [
      { id: 'method', icon: 'fa-solid fa-calculator', heading: 'Weighted forecast', html: '<p>The prediction weights your current average by the completed percentage and your expected exam by what remains. It is a simple, transparent estimate.</p>' },
      { id: 'need', icon: 'fa-solid fa-bullseye', heading: 'The score you need', html: '<p>Solving the same equation for the exam score tells you exactly what to aim for to hit a target grade.</p>' }
    ],
    steps: ['Enter current grade and how much is complete.', 'Add your expected exam score and target.', 'Read the prediction and needed score.'],
    facts: [['Method', 'Weighted blend'], ['Input', 'Current, weights, expected'], ['Output', 'Prediction + need'], ['Data handling', 'Runs locally']],
    useCases: [['Exam planning', 'Set a study target.'], ['Realistic aims', 'Forecast outcomes.'], ['Advising', 'Discuss options.']],
    tips: ['Be realistic about expected scores.', 'Update as new grades arrive.', 'Treat it as an estimate.'],
    takeaways: ['Predictions blend graded and expected work.', 'Needed score solves backward.', 'Realism improves accuracy.'],
    faq: [['How accurate is it?', 'As good as your expected-score input.'], ['What if nothing is graded?', 'Then the prediction is your expected score.'], ['Can I use it mid-course?', 'Yes, anytime.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Set your target using the <a href="gpa-improvement-calculator.html">GPA improvement calculator</a>.</p>'
  }
});

/* ========================================================================
   13. GRADE CALCULATOR
   ======================================================================== */
add({
  file: 'grade-calculator.html', folder: 'math',
  name: 'Grade Calculator', tag: 'Academic', icon: 'fa-solid fa-clipboard-check',
  title: 'Grade Calculator | Weighted Course Grade Quickly',
  metaDesc: 'A simple weighted grade calculator: enter each assessment with its weight and get the overall course grade. Free and in-browser.',
  desc: 'Input assessments and their weights to get an overall course grade on a 100-point scale.',
  keywords: ['grade calculator', 'weighted grade', 'course grade', 'assessment weight', 'overall grade', 'academic calculator'],
  featureList: ['Weighted average', 'Multiple assessments', 'Instant result', '100% client-side'],
  panel: panel.wrap('gc', 'fa-solid fa-clipboard-check', 'Grade calculator',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">One assessment per line: <code>score, weight%</code></p>' +
    area('gcIn', 'Assessments (score, weight%)', '88, 25\n92, 25\n79, 50') +
    go('gc') + tiles([['Overall grade', 'gcOut'], ['Total weight', 'gcW']])),
  js: `
    function run(){var lines=document.getElementById("gcIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var s=0,w=0;
      lines.forEach(function(l){var p=l.split(/[,\\s]+/).map(Number);if(p.length>=2&&p[1]>0){s+=p[0]*p[1];w+=p[1];}});
      document.getElementById("gcOut").textContent=w?(s/w).toFixed(2)+"%":"-";
      document.getElementById("gcW").textContent=w+"%";
      document.getElementById("gcProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("gcIn").addEventListener("input",run);
    document.getElementById("gcGo").addEventListener("click",run);run();`,
  article: {
    title: 'Grade Calculator: Weighted Course Result',
    lead: '<p>Get a clear overall grade in seconds. This <strong>grade calculator</strong> combines your assessments by weight into a single percentage.</p>',
    sections: [
      { id: 'weighted', icon: 'fa-solid fa-scale-balanced', heading: 'Weighted grading', html: '<p>Each assessment carries a weight; the overall grade is the sum of scores times weights divided by the total weight. It reflects how much each piece matters.</p>' },
      { id: 'accuracy', icon: 'fa-solid fa-check-double', heading: 'Accuracy tips', html: '<p>Use the syllabus weights exactly and enter scores on the same 100-point scale. Confirm the weights total 100% for a clean result.</p>' }
    ],
    steps: ['List assessments with score and weight.', 'The tool computes the weighted average.', 'Read your overall grade.'],
    facts: [['Method', 'Weighted average'], ['Input', 'Score + weight'], ['Output', 'Overall grade'], ['Data handling', 'Runs locally']],
    useCases: [['Course tracking', 'Know your grade.'], ['Planning', 'See component impact.'], ['Verification', 'Recalculate a result.']],
    tips: ['Match the syllabus weighting.', 'Keep scores on one scale.', 'Check that weights total 100%.'],
    takeaways: ['Weights change the outcome.', 'The result is a weighted average.', 'Consistency matters.'],
    faq: [['Must weights total 100?', 'Ideally, but partial totals still scale.'], ['Can I use letter grades?', 'Convert them to numbers first.'], ['Does it round?', 'It shows two decimals.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Turn the result into a GPA with the <a href="grade-point-calculator.html">grade point calculator</a>.</p>'
  }
});

/* ========================================================================
   14. MARK PERCENTAGE CALCULATOR
   ======================================================================== */
add({
  file: 'mark-percentage-calculator.html', folder: 'math',
  name: 'Mark Percentage Calculator', tag: 'Academic', icon: 'fa-solid fa-percent',
  title: 'Mark Percentage Calculator | Score to Percentage',
  metaDesc: 'Convert scored marks into a percentage and grade instantly, with total marks support. Free, private and fully in-browser.',
  desc: 'Turn marks obtained out of a maximum into a clean percentage and expected grade.',
  keywords: ['mark percentage calculator', 'marks to percentage', 'score percentage', 'exam percentage', 'grade from marks', 'academic calculator'],
  featureList: ['Obtained / max', 'Percentage and grade', 'Instant result', '100% client-side'],
  panel: panel.wrap('mp', 'fa-solid fa-percent', 'Mark percentage calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    num('mpObt', 'Marks obtained', '378', 'step="0.5"') +
    num('mpMax', 'Total marks', '500', 'step="0.5"') +
    '<div class="field"><label for="mpScale">Grading</label><select id="mpScale"><option value="10">10-point bands</option><option value="5">5-point bands</option></select></div>' +
    '</div>' + go('mp') + tiles([['Percentage', 'mpOut'], ['Grade', 'mpGrade']])),
  js: `
    function run(){var o=+document.getElementById("mpObt").value,m=+document.getElementById("mpMax").value,scale=+document.getElementById("mpScale").value;
      var p=m?o/m*100:0;
      document.getElementById("mpOut").textContent=p.toFixed(2)+"%";
      var g="F";
      if(p>=90)g="A+";else if(p>=80)g="A";else if(p>=70)g="B";else if(p>=60)g="C";else if(p>=50)g="D";else if(p>=40&&scale===5)g="E";
      document.getElementById("mpGrade").textContent=g;
      document.getElementById("mpProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["mpObt","mpMax","mpScale"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("mpGo").addEventListener("click",run);run();`,
  article: {
    title: 'Mark Percentage Calculator: Marks to Percent',
    lead: '<p>Converting exam marks to a percentage is routine but error-prone. This <strong>mark percentage calculator</strong> does it instantly and assigns a grade band.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-calculator', heading: 'The formula', html: '<p>Percentage equals marks obtained divided by total marks, times 100. A 378 out of 500 becomes 75.6%.</p>' },
      { id: 'bands', icon: 'fa-solid fa-list-ol', heading: 'Grade bands', html: '<p>Most systems use 10-point bands (90, 80, 70...) while some use 5-point bands. Confirm which your institution uses.</p>' }
    ],
    steps: ['Enter marks obtained and total marks.', 'Choose the grading band.', 'Read your percentage and grade.'],
    facts: [['Formula', 'Obtained / max x 100'], ['Input', 'Marks and max'], ['Output', 'Percentage + grade'], ['Data handling', 'Runs locally']],
    useCases: [['Applications', 'Report a percentage.'], ['Report cards', 'Convert to percent.'], ['Comparison', 'Standardise across exams.']],
    tips: ['Use the exact total marks.', 'Check whether grades use 10 or 5 bands.', 'Round as your school requires.'],
    takeaways: ['Percentage standardises marks.', 'Bands vary by system.', 'Totals must be correct.'],
    faq: [['How is percentage rounded?', 'It shows two decimals; round as needed.'], ['Which band system is used?', 'Choose yours in the selector.'], ['Can max be zero?', 'No, division needs a positive max.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Summarise multiple subjects with the <a href="marks-calculator.html">marks calculator</a>.</p>'
  }
});

/* ========================================================================
   15. STUDY BREAK TIMER
   ======================================================================== */
add({
  file: 'study-break-timer.html', folder: 'time',
  name: 'Study Break Timer', tag: 'Productivity', icon: 'fa-solid fa-hourglass-half',
  title: 'Study Break Timer | Pomodoro Focus & Rest',
  metaDesc: 'A simple Pomodoro-style study-and-break timer that alternates focused work with rest. Runs entirely in your browser.',
  desc: 'Alternate focused study blocks with short and long breaks, Pomodoro style, right in your browser.',
  keywords: ['study break timer', 'pomodoro timer', 'focus timer', 'productivity timer', 'study timer', 'break timer'],
  featureList: ['Pomodoro cycles', 'Short and long breaks', 'Audio-free', '100% client-side'],
  panel: panel.wrap('sbt', 'fa-solid fa-hourglass-half', 'Study / break timer',
    '<div class="row3"style="margin-bottom:14px">' +
    num('sbtWork', 'Study minutes', '25') +
    num('sbtShort', 'Short break min', '5') +
    num('sbtLong', 'Long break min', '15') +
    '</div>' + '<div class="actions"><button class="btn btn-primary"type="button"id="sbtStart"><i class="fa-solid fa-play"></i>Start</button> ' +
    '<button class="rt-btn"type="button"id="sbtReset"><i class="fa-solid fa-rotate-left"></i>Reset</button></div>' +
    tiles([['Phase', 'sbtPhase'], ['Time left', 'sbtTime'], ['Cycles done', 'sbtCycles']])),
  js: `
    var timer=null,phase="Focus",left=25*60,cycles=0;
    function draw(){var m=Math.floor(left/60),s=left%60;document.getElementById("sbtTime").textContent=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;document.getElementById("sbtPhase").textContent=phase;document.getElementById("sbtCycles").textContent=cycles;}
    function next(){if(phase==="Focus"){cycles++;phase=(cycles%4===0)?"Long break":"Short break";left=(phase==="Long break"?+document.getElementById("sbtLong").value:+document.getElementById("sbtShort").value)*60;}else{phase="Focus";left=+document.getElementById("sbtWork").value*60;}draw();}
    function tick(){if(left>0){left--;draw();}else{next();}}
    document.getElementById("sbtStart").addEventListener("click",function(){if(timer){clearInterval(timer);timer=null;this.innerHTML='<i class="fa-solid fa-play"></i>Start';}else{left=+document.getElementById("sbtWork").value*60;phase="Focus";draw();timer=setInterval(tick,1000);this.innerHTML='<i class="fa-solid fa-pause"></i>Pause';}});
    document.getElementById("sbtReset").addEventListener("click",function(){if(timer){clearInterval(timer);timer=null;}phase="Focus";cycles=0;left=+document.getElementById("sbtWork").value*60;draw();document.getElementById("sbtStart").innerHTML='<i class="fa-solid fa-play"></i>Start';});
    draw();`,
  article: {
    title: 'Study Break Timer: Focus with the Pomodoro Method',
    lead: '<p>Studying in focused bursts keeps attention sharp. This <strong>study break timer</strong> alternates work blocks and rest following the Pomodoro pattern.</p>',
    sections: [
      { id: 'pomodoro', icon: 'fa-solid fa-hourglass-half', heading: 'The Pomodoro method', html: '<p>Work in a focused block (typically 25 minutes), take a short break, and after four cycles take a longer rest. The rhythm limits fatigue and protects concentration.</p>' },
      { id: 'tune', icon: 'fa-solid fa-sliders', heading: 'Tuning the intervals', html: '<p>Some people prefer 50-minute blocks with 10-minute breaks. Adjust the fields to match your attention span.</p>' }
    ],
    steps: ['Set study and break lengths.', 'Press Start to begin the first block.', 'Follow the phases or reset anytime.'],
    facts: [['Method', 'Pomodoro'], ['Default', '25 / 5 / 15'], ['Output', 'Phase and countdown'], ['Data handling', 'Runs locally']],
    useCases: [['Revision', 'Structure study sessions.'], ['Deep work', 'Protect focus blocks.'], ['Breaks', 'Remember to rest.']],
    tips: ['Adjust lengths to your focus span.', 'Take the long break after four cycles.', 'Avoid switching tasks mid-block.'],
    takeaways: ['Focused blocks beat long marathons.', 'Breaks reduce fatigue.', 'Cycles build momentum.'],
    faq: [['Why 25 minutes?', 'It is the classic Pomodoro default.'], ['Does it make sound?', 'No, it is silent.'], ['Can I pause?', 'Yes, press Pause or Reset.'], ['Is my data uploaded?', 'No, it runs locally.']],
    conclusion: '<p>Track the time you invest with the <a href="study-time-tracker.html">study time tracker</a>.</p>'
  }
});

/* ========================================================================
   16. SEMESTER PLANNER
   ======================================================================== */
add({
  file: 'semester-planner.html', folder: 'time',
  name: 'Semester Planner', tag: 'Productivity', icon: 'fa-solid fa-calendar-days',
  title: 'Semester Planner | Weekly Study Time Budget',
  metaDesc: 'Build a weekly study plan by allocating hours across your courses and activities. Free and fully in-browser.',
  desc: 'Distribute your available study hours across subjects and activities to build a balanced weekly plan.',
  keywords: ['semester planner', 'study planner', 'weekly plan', 'study schedule', 'time budget', 'academic planner'],
  featureList: ['Weekly hour budget', 'Subject allocation', 'Balance check', '100% client-side'],
  panel: panel.wrap('sp', 'fa-solid fa-calendar-days', 'Weekly study plan',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">One item per line: <code>subject, hours</code></p>' +
    area('spIn', 'Subjects (subject, hours)', 'Math, 6\nPhysics, 5\nEssay, 4\nRevision, 3') +
    '<div class="row3"style="margin:12px 0">' + num('spAvail', 'Study hours available/week', '20') + '</div>' +
    go('sp') + tiles([['Total planned', 'spTotal'], ['Remaining', 'spRemain'], ['Balance', 'spBal']])),
  js: `
    function run(){var lines=document.getElementById("spIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var t=0;lines.forEach(function(l){var m=l.split(/[,\\s]+/);var h=+m[m.length-1];if(!isNaN(h))t+=h;});
      var avail=+document.getElementById("spAvail").value;
      document.getElementById("spTotal").textContent=t+" hrs";
      document.getElementById("spRemain").textContent=(avail-t)+" hrs";
      document.getElementById("spBal").textContent=t>avail?"Over budget":t<avail?"Spare time":t===avail?"Balanced":"-";
      document.getElementById("spProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    ["spIn","spAvail"].forEach(function(id){document.getElementById(id).addEventListener("input",run)});
    document.getElementById("spGo").addEventListener("click",run);run();`,
  article: {
    title: 'Semester Planner: Balance Your Week',
    lead: '<p>A realistic weekly plan beats an optimistic one. This <strong>semester planner</strong> helps allocate your available hours across subjects and activities.</p>',
    sections: [
      { id: 'budget', icon: 'fa-solid fa-wallet', heading: 'Time budgeting', html: '<p>Start from the hours you actually have, not the hours you wish you had. Allocating within that budget prevents plans that collapse after a week.</p>' },
      { id: 'priority', icon: 'fa-solid fa-list-ol', heading: 'Prioritising', html: '<p>Give more hours to courses with heavy workloads or approaching deadlines. Review the balance weekly and shift allocation as the term progresses.</p>' }
    ],
    steps: ['List subjects with planned hours.', 'Set your weekly study hours available.', 'Read the total, remaining and balance.'],
    facts: [['Type', 'Weekly time budget'], ['Input', 'Subject + hours'], ['Output', 'Total and balance'], ['Data handling', 'Runs locally']],
    useCases: [['Term planning', 'Distribute study hours.'], ['Pressure points', 'Add time to hard courses.'], ['Balance', 'Avoid overcommitment.']],
    tips: ['Be realistic about available hours.', 'Review the plan weekly.', 'Leave slack for the unexpected.'],
    takeaways: ['Plan within real available hours.', 'Prioritise demanding courses.', 'Review and adjust.'],
    faq: [['Should the plan fill all hours?', 'Leaving slack is wise.'], ['Can I change it mid-term?', 'Yes, adjust anytime.'], ['Does it handle deadlines?', 'Weight hours toward urgent work.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Use the <a href="study-break-timer.html">study break timer</a> to execute each block.</p>'
  }
});

/* ========================================================================
   17. STUDY TIME TRACKER
   ======================================================================== */
add({
  file: 'study-time-tracker.html', folder: 'time',
  name: 'Study Time Tracker', tag: 'Productivity', icon: 'fa-solid fa-stopwatch',
  title: 'Study Time Tracker | Log and Total Study Hours',
  metaDesc: 'Log study sessions with subjects and minutes, then see totals per subject and overall. Free, private and in-browser.',
  desc: 'Record each study session by subject and minutes to see running totals and your most-studied topics.',
  keywords: ['study time tracker', 'study log', 'time tracking', 'session total', 'study hours', 'academic planner'],
  featureList: ['Session logging', 'Per-subject totals', 'Overall total', '100% client-side'],
  panel: panel.wrap('stt', 'fa-solid fa-stopwatch', 'Study session log',
    '<p style="margin:0 0 10px;color:var(--muted);font-size:13px">One session per line: <code>subject, minutes</code></p>' +
    area('sttIn', 'Sessions (subject, minutes)', 'Math, 45\nPhysics, 30\nMath, 50\nEssay, 40') +
    go('stt') + tiles([['Total time', 'sttTotal'], ['Sessions', 'sttN'], ['Top subject', 'sttTop']])),
  js: `
    function run(){var lines=document.getElementById("sttIn").value.split(/\\n+/).filter(function(x){return x.trim()});
      var tot=0,n=0,by={};
      lines.forEach(function(l){var m=l.split(/[,\\s]+/);var min=+m[m.length-1];var subj=m.slice(0,m.length-1).join(" ")||"General";if(!isNaN(min)){tot+=min;n++;by[subj]=(by[subj]||0)+min;}});
      document.getElementById("sttTotal").textContent=Math.floor(tot/60)+"h "+(tot%60)+"m";
      document.getElementById("sttN").textContent=n;
      var top="-",tv=0;for(var k in by){if(by[k]>tv){tv=by[k];top=k;}}
      document.getElementById("sttTop").textContent=top+(tv?" ("+tv+"m)":"");
      document.getElementById("sttProc").textContent="Calculated in this tab - 0 bytes uploaded.";}
    document.getElementById("sttIn").addEventListener("input",run);
    document.getElementById("sttGo").addEventListener("click",run);run();`,
  article: {
    title: 'Study Time Tracker: Log Sessions and Totals',
    lead: '<p>What gets measured gets managed. This <strong>study time tracker</strong> logs each session by subject and totals your invested hours.</p>',
    sections: [
      { id: 'log', icon: 'fa-solid fa-pen-to-square', heading: 'Keeping a log', html: '<p>Two values per line, subject and minutes, build a running record. Even rough minutes reveal where your time actually goes.</p>' },
      { id: 'insight', icon: 'fa-solid fa-chart-pie', heading: 'Acting on the totals', html: '<p>Seeing per-subject totals shows whether a difficult course is getting enough attention or a favourite is absorbing too much time.</p>' }
    ],
    steps: ['Log each session as subject and minutes.', 'Totals update automatically.', 'Read total time, session count and top subject.'],
    facts: [['Type', 'Session log'], ['Input', 'Subject + minutes'], ['Output', 'Totals and top subject'], ['Data handling', 'Runs locally']],
    useCases: [['Accountability', 'See real study time.'], ['Balance', 'Spot neglected subjects.'], ['Progress', 'Track hours over weeks.']],
    tips: ['Log sessions the same day.', 'Use consistent subject names.', 'Rough minutes still reveal patterns.'],
    takeaways: ['Tracking reveals real effort.', 'Per-subject totals guide balance.', 'Consistency beats precision.'],
    faq: [['Can I log in hours?', 'Use minutes and total converts to hours.'], ['Do I need exact times?', 'Rough values are fine.'], ['Does it save data?', 'It processes in your browser only.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Pair tracking with planning in the <a href="semester-planner.html">semester planner</a>.</p>'
  }
});

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
