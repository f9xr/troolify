/* ============================================================================
   Troolify - grade calculators batch
   Tools: easy-grader, final-grade-calculator, section-grade-calculator,
          weighted-grade-calculator, semester-grade-calculator.
   Category: Math (tools/math/)
   Run: node troolify-gen/gen-grade-tools.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* Shared inline helpers injected into every page script. */
const HELP = `
var $=function(id){return document.getElementById(id)};
function tile(l,v,s){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+v+'</div>'+(s?'<div class="rt-sub">'+s+'</div>':'')+'</div>'};
function gradeLetter(p,scale){
  if(scale==='simple'){if(p>=90)return 'A';if(p>=80)return 'B';if(p>=70)return 'C';if(p>=60)return 'D';return 'F';}
  if(p>=97)return 'A+';if(p>=93)return 'A';if(p>=90)return 'A-';
  if(p>=87)return 'B+';if(p>=83)return 'B';if(p>=80)return 'B-';
  if(p>=77)return 'C+';if(p>=73)return 'C';if(p>=70)return 'C-';
  if(p>=67)return 'D+';if(p>=63)return 'D';if(p>=60)return 'D-';return 'F';
}
`;

const CHART_CSS =
  '.eg-chart-wrap{max-height:280px;overflow:auto;margin-top:14px;border:1px solid var(--border);border-radius:12px}' +
  '.eg-chart{width:100%;border-collapse:collapse;font-size:13.5px}' +
  '.eg-chart th,.eg-chart td{padding:8px 12px;text-align:left;border-bottom:1px solid var(--border)}' +
  '.eg-chart thead th{position:sticky;top:0;background:#1B2028;color:var(--muted);font-size:11.5px;text-transform:uppercase;letter-spacing:.04em}' +
  '.eg-chart tr.on td{background:rgba(59,130,246,.15);font-weight:700}';

const ROW_CSS =
  '.gr-head,.gr-row{display:grid;grid-template-columns:1.5fr .9fr .9fr auto;gap:8px;align-items:center}' +
  '.gr-head{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);font-weight:700;margin:10px 0 4px}' +
  '.gr-row{margin-bottom:8px}' +
  '.gr-row input{margin:0}' +
  '.gr-x{padding:9px 11px;flex:none}' +
  '@media(max-width:560px){.gr-head{display:none}.gr-row{grid-template-columns:1fr 1fr;position:relative;padding:10px;border:1px solid var(--border);border-radius:12px}.gr-x{grid-column:2;justify-self:end}}';

/* ========================================================================
   1. EASY GRADER
   ======================================================================== */
add({
  file: 'easy-grader.html', folder: 'math',
  name: 'Easy Grader', tag: 'Grades', icon: 'fa-solid fa-check-double',
  title: 'Easy Grader | Grade a Test by Number of Wrong Answers',
  metaDesc: 'Grade any test instantly. Enter the number of questions and how many were wrong to get the percentage, letter grade and a full wrong-answer grading chart.',
  desc: 'Enter the total questions and how many were wrong to see the score, percentage and letter grade, plus a full grading chart for every possible result.',
  keywords: ['easy grader', 'test grader', 'grading calculator', 'grade a test', 'quiz grader', 'percentage grade calculator', 'wrong answer calculator', 'teacher grading tool', 'grade chart', 'score calculator'],
  featureList: ['Percentage and letter grade', 'Full wrong-answer chart', 'Simple or plus/minus scale', 'Works for any number of questions'],
  css: CHART_CSS,
  panel:
    '<div class="panel clean"><div class="panel-inner">' +
    '<div class="calc-grid">' +
    '<div class="field"><label for="egTotal">Total questions</label><input id="egTotal" type="number" inputmode="numeric" min="1" step="1" value="20"></div>' +
    '<div class="field"><label for="egWrong">Questions wrong</label><input id="egWrong" type="number" inputmode="numeric" min="0" step="1" value="3"></div>' +
    '<div class="field"><label for="egScale">Grading scale</label><select id="egScale"><option value="plusminus" selected>Plus / minus (A+ to F)</option><option value="simple">Simple (A to F, 10-point)</option></select></div>' +
    '</div>' +
    '<div class="result-card" id="egResults" aria-live="polite"></div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="egProc">Ready - calculations happen in this tab.</span></p>' +
    '</div></div>',
  js: HELP + `
function calcEG(){
  var total=parseInt($('egTotal').value,10)||0;
  var wrong=parseInt($('egWrong').value,10);
  if(isNaN(wrong))wrong=0;
  var scale=$('egScale').value;
  var host=$('egResults');
  if(total<=0){host.innerHTML='<p class="rt-sub">Enter the total number of questions to begin.</p>';$('egProc').textContent='Ready - waiting for a valid question count.';return}
  if(wrong<0)wrong=0;if(wrong>total)wrong=total;$('egWrong').value=wrong;
  var correct=total-wrong;var pct=correct/total*100;var g=gradeLetter(pct,scale);
  var html='<div class="result-grid">'+tile('Score',correct+' / '+total)+tile('Percentage',pct.toFixed(1)+'%')+tile('Questions wrong',String(wrong))+tile('Letter grade',g)+'</div>';
  var limit=Math.min(total,60);
  html+='<div class="eg-chart-wrap"><table class="eg-chart"><thead><tr><th>Wrong</th><th>Correct</th><th>Score</th><th>Grade</th></tr></thead><tbody>';
  for(var w=0;w<=limit;w++){var pc=(total-w)/total*100;html+='<tr'+(w===wrong?' class="on"':'')+'><td>'+w+'</td><td>'+(total-w)+'</td><td>'+pc.toFixed(1)+'%</td><td>'+gradeLetter(pc,scale)+'</td></tr>';}
  html+='</tbody></table></div>';
  host.innerHTML=html;
  $('egProc').textContent='Graded '+total+' questions with '+wrong+' wrong ('+pct.toFixed(1)+'%).';
}
['egTotal','egWrong','egScale'].forEach(function(id){var el=$(id);el.addEventListener('input',calcEG);el.addEventListener('change',calcEG)});
calcEG();
`,
  article: {
    title: 'Easy Grader: Turn Wrong Answers Into a Grade in Seconds',
    lead: '<p>Marking a stack of quizzes by hand is slow and easy to get wrong. This <strong>easy grader</strong> does the arithmetic for you: give it the number of questions and how many were missed, and it returns the percentage, the letter grade and a complete grading chart you can glance at for any result.</p>',
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-calculator', heading: 'How the score is worked out', html: '<p>The score is simply the share of questions answered correctly. If a test has <em>N</em> questions and <em>W</em> were wrong, the percentage is <code>(N &minus; W) / N &times; 100</code>. A 20-question quiz with 3 wrong means 17 correct, which is 85%. The calculator applies that formula instantly and then maps the percentage onto the letter-grade bands you selected.</p><p>Switch between a strict plus/minus scale (A+ down to F) and a simple ten-point scale (A, B, C, D, F). Different schools, districts and countries use different cut-offs, so both are provided rather than a single fixed scale.</p>' },
      { id: 'chart', icon: 'fa-solid fa-table', heading: 'Why the grading chart helps', html: '<p>Under the headline result you get a chart listing every possible number of wrong answers with its percentage and letter grade. That is the part teachers reach for most: hand back the paper, say "you can miss up to four and still get an A", and everyone can see exactly where the boundaries fall. The row for the current result is highlighted so it is easy to find at a glance.</p>' },
      { id: 'weighted', icon: 'fa-solid fa-scale-balanced', heading: 'When a test is not worth 100%', html: '<p>This tool grades a single assessment out of full marks. If the test is only part of a course grade, grade it here first and then feed the result into the <a href="section-grade-calculator.html">section grade calculator</a> or the <a href="weighted-grade-calculator.html">weighted grade calculator</a> to combine it with everything else.</p>' }
    ],
    steps: [
      'Type the total number of questions on the test.',
      'Enter how many were answered incorrectly (or use the chart to read any score).',
      'Choose a plus/minus or simple grading scale.',
      'Read the percentage, letter grade and charted standing instantly.'
    ],
    facts: [['Inputs', 'Total questions, wrong answers'], ['Scales', 'Plus/minus or simple 10-point'], ['Output', 'Percentage, letter grade, full chart'], ['Max chart rows', '60 (capped for clarity)'], ['Privacy', 'Runs fully in your browser']],
    useCases: [
      ['Teachers', 'Grade a quick quiz and read the class boundaries from one chart.'],
      ['Students', 'Estimate a score before the paper is handed back.'],
      ['Tutors', 'Show how many more questions must be right to reach the next letter band.'],
      ['Self-assessment', 'Check a practice test the moment you finish it.']],
    tips: [
      'Count unanswered questions as wrong unless your teacher says otherwise.',
      'Override the total after editing wrong answers - the chart recalculates immediately.',
      'Use the simple scale for quick checks and plus/minus for transcripts and applications.'
    ],
    takeaways: [['percentage', '(correct / total) x 100'], ['letter grade', 'mapped from the chosen scale'], ['chart', 'every wrong-answer score at once']],
    faq: [
      ['How do I grade a test with the easy grader?', 'Enter the total number of questions, then the number answered incorrectly. The percentage and letter grade appear instantly along with a chart of every possible score.'],
      ['What scale does it use for letter grades?', 'You can pick a plus/minus scale (A+ through F) or a simple 10-point scale (A, B, C, D, F). Both are shown in the chart.'],
      ['Does a wrong answer count differently for multiple choice with partial marks?', 'This tool treats every question as equally weighted. For partial credit, enter an equivalent wrong-answer count or use the weighted grade calculator.'],
      ['Is my data uploaded anywhere?', 'No. Everything is calculated in your browser and nothing is sent to a server.']
    ],
    conclusion: '<p>For the fastest possible "what did I get?" answer, the <strong>easy grader</strong> turns a wrong-answer count into a percentage, a letter grade and a full chart. To combine several assessments, continue with the <a href="section-grade-calculator.html">section grade calculator</a> or the <a href="weighted-grade-calculator.html">weighted grade calculator</a>.</p>'
  }
});

/* ========================================================================
   2. FINAL GRADE CALCULATOR
   ======================================================================== */
add({
  file: 'final-grade-calculator.html', folder: 'math',
  name: 'Final Grade Calculator', tag: 'Grades', icon: 'fa-solid fa-flag-checkered',
  title: 'Final Grade Calculator | What Do I Need on the Final Exam?',
  metaDesc: 'Work out the score you need on your final exam to reach a target course grade. Enter your current grade, the grade you want and the final exam weight.',
  desc: 'Enter your current grade, the grade you want and how much the final exam is worth to see the exact score you need on the final.',
  keywords: ['final grade calculator', 'what do i need on the final', 'final exam calculator', 'required final score', 'exam grade calculator', 'target grade calculator', 'final exam weight', 'grade needed calculator', 'course grade calculator', 'finals calculator'],
  featureList: ['Required final exam score', 'Target grade planning', 'Handles any exam weighting', 'Feasibility warning'],
  panel:
    '<div class="panel clean"><div class="panel-inner">' +
    '<div class="calc-grid">' +
    '<div class="field"><label for="fcCurrent">Current grade (%)</label><input id="fcCurrent" type="number" inputmode="decimal" step="any" min="0" max="150" value="82"></div>' +
    '<div class="field"><label for="fcDesired">Grade you want (%)</label><input id="fcDesired" type="number" inputmode="decimal" step="any" min="0" max="150" value="90"></div>' +
    '<div class="field"><label for="fcWeight">Final exam is worth (%)</label><input id="fcWeight" type="number" inputmode="decimal" step="any" min="1" max="100" value="25"></div>' +
    '</div>' +
    '<div class="result-card" id="fcResults" aria-live="polite"></div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="fcProc">Ready - calculations happen in this tab.</span></p>' +
    '</div></div>',
  js: HELP + `
function calcFC(){
  var cur=parseFloat($('fcCurrent').value),des=parseFloat($('fcDesired').value),w=parseFloat($('fcWeight').value);
  var host=$('fcResults');
  if(isNaN(cur)||isNaN(des)||isNaN(w)||w<=0||w>100){host.innerHTML='<p class="rt-sub">Enter your current grade, desired grade and a final weight between 1 and 100.</p>';$('fcProc').textContent='Ready - waiting for valid inputs.';return}
  var wf=w/100;
  var need=(des-cur*(1-wf))/wf;
  var html='<div class="result-grid">'+tile('Current grade',cur.toFixed(1)+'%')+tile('Target grade',des.toFixed(1)+'%')+tile('Final weight',w+'%');
  if(need<=0){html+=tile('Required on final','0% or more','Target already secured');}
  else{html+=tile('Required on final',need.toFixed(2)+'%',gradeLetter(need,'plusminus')+' needed');}
  html+='</div>';
  var msg;
  if(need>100){msg='That target needs '+need.toFixed(2)+'% on the final, which is above the maximum. Aim for a slightly lower grade or check whether there is extra credit.';}
  else if(need<=0){msg='You have already locked in the target - even a zero on the final keeps you there.';}
  else{msg='Score at least <strong>'+need.toFixed(2)+'%</strong> on the final exam to finish at '+des.toFixed(1)+'%.';}
  html+='<p class="rt-sub" style="margin-top:12px">'+msg+'</p>';
  host.innerHTML=html;
  $('fcProc').textContent='Weighted result: you need '+need.toFixed(2)+'% on a final worth '+w+'%.';
}
['fcCurrent','fcDesired','fcWeight'].forEach(function(id){var el=$(id);el.addEventListener('input',calcFC)});
calcFC();
`,
  article: {
    title: 'Final Grade Calculator: Know Exactly What You Need on the Exam',
    lead: '<p>The last exam of a course can carry a scary amount of weight, and guessing what you need is stressful. This <strong>final grade calculator</strong> answers the only question that matters: what score on the final gets you to the grade you want?</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The formula behind the answer', html: '<p>Your current work counts for everything except the final exam. If the final is worth <em>w</em> (as a fraction), your coursework counts for <code>1 &minus; w</code>. To reach a target <em>T</em> from a current grade <em>C</em>, rearrange the weighted average:</p><p><code>required = (T &minus; C &times; (1 &minus; w)) / w</code></p><p>With an 82% going in, a 90% target and a final worth 25%, that is <code>(90 &minus; 82 &times; 0.75) / 0.25 = 114%</code>. The tool shows the number and flags when it is out of reach so you can adjust expectations early.</p>' },
      { id: 'planning', icon: 'fa-solid fa-map', heading: 'Planning rather than panicking', html: '<p>Run the numbers with a few different targets before exam season. Finding out in week two that you need 74% rather than 94% changes how you study, and knowing a target is unreachable early lets you focus energy on the courses where effort still moves the needle.</p>' },
      { id: 'combine', icon: 'fa-solid fa-layer-group', heading: 'After the exam', html: '<p>Once the final is scored, combine it with the rest of your work using the <a href="weighted-grade-calculator.html">weighted grade calculator</a> or the <a href="section-grade-calculator.html">section grade calculator</a>, and convert the outcome to grade points with the <a href="gpa-calculator.html">GPA calculator</a>.</p>' }
    ],
    steps: [
      'Enter your current grade as a percentage.',
      'Enter the grade you are aiming for.',
      'Enter how much the final exam is worth.',
      'Read the required final score and feasibility note.'
    ],
    facts: [['Inputs', 'Current grade, target, final weight'], ['Output', 'Required final exam score'], ['Over 100%', 'Flagged as out of reach'], ['Already safe', 'Shows 0% needed'], ['Privacy', 'Runs fully in your browser']],
    useCases: [
      ['Students', 'Decide how much a final exam can change a course grade.'],
      ['Advisors', 'Set realistic target grades with an advisee.'],
      ['Parents', 'Understand what a final exam means for the overall result.'],
      ['Grades appeals', 'Check whether a borderline result was mathematically possible.']],
    tips: [
      'Use your current grade exactly as it stands today, including any recent marks.',
      'If the final is split into components, treat each component with its own weight and add them up.',
      'Remember that many courses round up - a 89.5% can become an A.'
    ],
    takeaways: [['required', '(target - current x (1 - weight)) / weight'], ['above 100%', 'target is mathematically out of reach'], ['at or below 0%', 'target already secured']],
    faq: [
      ['How is the required final score calculated?', 'It rearranges the weighted average formula so the exam score is the only unknown: required = (target - current x (1 - weight)) / weight, where weight is the final exam share.'],
      ['What if the required score is over 100%?', 'Then the target cannot be reached with those numbers. The tool says so and you can lower the target or check for extra credit.'],
      ['Can I use it for a project instead of an exam?', 'Yes. Any single assessment with a known weight works the same way - just enter its weight as the final weight.'],
      ['Does the calculator store my grades?', 'No. All values stay in your browser and are never uploaded.']
    ],
    conclusion: '<p>The <strong>final grade calculator</strong> replaces guesswork with a single number: the score you need on the final. If the target is tight, combine the result with the <a href="section-grade-calculator.html">section grade calculator</a> to see the full picture.</p>'
  }
});

/* ========================================================================
   3. SECTION GRADE CALCULATOR
   ======================================================================== */
add({
  file: 'section-grade-calculator.html', folder: 'math',
  name: 'Section Grade Calculator', tag: 'Grades', icon: 'fa-solid fa-layer-group',
  title: 'Section Grade Calculator | Weighted Category Grade Calculator',
  metaDesc: 'Combine weighted sections such as homework, quizzes and exams into one course grade. Enter each section average and its weight to get the overall percentage.',
  desc: 'Add each weighted section of a course - homework, quizzes, exams - with its weight and average to compute the overall course grade.',
  keywords: ['section grade calculator', 'category grade calculator', 'weighted category grades', 'course grade calculator', 'homework quiz exam weights', 'percent weight grade', 'weighted average grades', 'class grade calculator', 'grading categories', 'overall grade calculator'],
  featureList: ['Unlimited weighted sections', 'Normalises weights automatically', 'Per-row removal', 'Letter grade output'],
  css: ROW_CSS,
  panel:
    '<div class="panel clean"><div class="panel-inner">' +
    '<div class="gr-head"><span>Section</span><span>Weight %</span><span>Grade %</span><span></span></div>' +
    '<div id="sgRows"></div>' +
    '<div class="actions"><button class="btn" type="button" id="sgAdd"><i class="fa-solid fa-plus"></i>Add section</button> <button class="btn" type="button" id="sgReset"><i class="fa-solid fa-rotate-left"></i>Reset example</button></div>' +
    '<div class="result-card" id="sgResults" aria-live="polite"></div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="sgProc">Ready - calculations happen in this tab.</span></p>' +
    '</div></div>',
  js: HELP + `
var sgData=[{n:'Homework',w:20,g:88},{n:'Quizzes',w:30,g:79},{n:'Exams',w:50,g:91}];
var sgHost=$('sgRows');
function sgRender(){
  sgHost.innerHTML=sgData.map(function(r,i){
    return '<div class="gr-row">'+
      '<input class="gr-name" data-i="'+i+'" type="text" value="'+String(r.n).replace(/"/g,'&quot;')+'" aria-label="Section name">'+
      '<input class="gr-w" data-i="'+i+'" type="number" inputmode="decimal" step="any" min="0" value="'+r.w+'" aria-label="Weight percent">'+
      '<input class="gr-g" data-i="'+i+'" type="number" inputmode="decimal" step="any" min="0" max="100" value="'+r.g+'" aria-label="Grade percent">'+
      '<button class="gr-x rt-btn" data-i="'+i+'" type="button" aria-label="Remove section"><i class="fa-solid fa-xmark"></i></button>'+
    '</div>';
  }).join('');
}
function sgCalc(){
  var tw=0,twg=0,valid=0;
  sgData.forEach(function(r){var w=parseFloat(r.w),g=parseFloat(r.g);if(!isNaN(w)&&!isNaN(g)&&w>0){tw+=w;twg+=w*g;valid++;}});
  var host=$('sgResults');
  if(!valid){host.innerHTML='<p class="rt-sub">Enter a weight and grade for at least one section.</p>';$('sgProc').textContent='Ready - waiting for a weight and grade.';return}
  var avg=twg/tw;
  var warn=Math.abs(tw-100)>0.05?'<p class="rt-sub" style="margin-top:12px">Weights add up to '+tw.toFixed(1)+'%, so the grade is normalised to a 100% total.</p>':'';
  host.innerHTML='<div class="result-grid">'+tile('Overall grade',avg.toFixed(2)+'%')+tile('Letter grade',gradeLetter(avg,'plusminus'))+tile('Total weight',tw.toFixed(1)+'%')+tile('Sections counted',String(valid))+'</div>'+warn;
  $('sgProc').textContent='Combined '+valid+' weighted sections into '+avg.toFixed(2)+'%.';
}
sgHost.addEventListener('input',function(e){
  var i=e.target.getAttribute('data-i');if(i===null)return;
  var r=sgData[+i];if(!r)return;
  if(e.target.classList.contains('gr-name'))r.n=e.target.value;
  else if(e.target.classList.contains('gr-w'))r.w=e.target.value;
  else if(e.target.classList.contains('gr-g'))r.g=e.target.value;
  sgCalc();
});
sgHost.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('.gr-x'):null;if(!b)return;
  sgData.splice(+b.getAttribute('data-i'),1);sgRender();sgCalc();
});
$('sgAdd').addEventListener('click',function(){sgData.push({n:'New section',w:0,g:''});sgRender();sgCalc();});
$('sgReset').addEventListener('click',function(){sgData=[{n:'Homework',w:20,g:88},{n:'Quizzes',w:30,g:79},{n:'Exams',w:50,g:91}];sgRender();sgCalc();});
sgRender();sgCalc();
`,
  article: {
    title: 'Section Grade Calculator: Combine Weighted Categories Correctly',
    lead: '<p>Most courses are not one pile of marks - they are categories: homework worth 20%, quizzes 30%, exams 50%. This <strong>section grade calculator</strong> turns each category average and its weight into a single, correctly weighted course grade.</p>',
    sections: [
      { id: 'weighted', icon: 'fa-solid fa-scale-balanced', heading: 'Why weighting matters', html: '<p>A straight average of your category scores is wrong whenever the weights differ. If you have 95% in homework (20%) and 70% in exams (50%), the exams drag the real grade down far more than homework lifts it. The calculator multiplies each category grade by its weight, adds the products, and divides by the total weight - the weighted average.</p>' },
      { id: 'normalise', icon: 'fa-solid fa-wand-magic-sparkles', heading: 'Weights that do not add to 100%', html: '<p>Syllabi sometimes list relative weights or leave a category out until later. Rather than forcing a total of 100%, the tool normalises whatever you enter, so the result stays meaningful even if the weights currently sum to 90% or 110%. A note appears whenever the total is not exactly 100%.</p>' },
      { id: 'related', icon: 'fa-solid fa-link', heading: 'Going further', html: '<p>If your categories are made of individual assignments, use the <a href="weighted-grade-calculator.html">weighted grade calculator</a> first and paste each section average here. To find the exam score you still need, try the <a href="final-grade-calculator.html">final grade calculator</a>, or convert the final result with the <a href="gpa-calculator.html">GPA calculator</a>.</p>' }
    ],
    steps: [
      'Enter a name, weight and current average for each course section.',
      'Add more sections as needed and remove any you do not use.',
      'Watch the overall grade update as you type.',
      'Check the note if your weights do not total 100%.'
    ],
    facts: [['Inputs', 'Section name, weight, average'], ['Method', 'Weighted average, auto-normalised'], ['Sections', 'Unlimited'], ['Output', 'Percentage and letter grade'], ['Privacy', 'Runs fully in your browser']],
    useCases: [
      ['Students', 'See the real course grade from category weights.'],
      ['Teachers', 'Prototype a grading scheme before publishing a syllabus.'],
      ['Tutors', 'Show which category has the most leverage on the final grade.'],
      ['Advisors', 'Model how a strong category can offset a weak one.']],
    tips: [
      'Use the category average, not a single assignment score, for each row.',
      'Keep weights in the same units your syllabus uses.',
      'Use a zero weight to temporarily exclude a section without deleting it.'
    ],
    takeaways: [['method', 'sum(weight x grade) / sum(weight)'], ['normalised', 'works even when weights miss 100%'], ['output', 'course percentage and letter grade']],
    faq: [
      ['How does the section grade calculator weight categories?', 'It computes a weighted average: every section grade is multiplied by its weight, the products are summed, and the total is divided by the sum of the weights.'],
      ['What if my weights add up to more or less than 100%?', 'The tool normalises the result and shows a note. The relative proportion of the weights is what matters, not the absolute total.'],
      ['Can I grade a course with only two categories?', 'Yes. Add as few or as many sections as you need and remove the rest.'],
      ['Is anything saved or uploaded?', 'No. All calculation happens locally in your browser.']
    ],
    conclusion: '<p>When a course is split into weighted categories, the <strong>section grade calculator</strong> gives you the honest overall percentage. Pair it with the <a href="final-grade-calculator.html">final grade calculator</a> to plan the exam, then finish with the <a href="gpa-calculator.html">GPA calculator</a>.</p>'
  }
});

/* ========================================================================
   4. WEIGHTED GRADE CALCULATOR
   ======================================================================== */
add({
  file: 'weighted-grade-calculator.html', folder: 'math',
  name: 'Weighted Grade Calculator', tag: 'Grades', icon: 'fa-solid fa-calculator',
  title: 'Weighted Grade Calculator | Weighted Average of Assignments',
  metaDesc: 'Calculate a weighted average grade from assignments, each with a grade and a weight or points value. Weights need not add up to 100 - the average is normalised.',
  desc: 'Add assignments with a grade and a weight or points value to get the weighted average, total weight and letter grade instantly.',
  keywords: ['weighted grade calculator', 'weighted average grade', 'weighted mean grades', 'assignment grade calculator', 'points weighted grade', 'gradebook calculator', 'weighted score calculator', 'calculate weighted grades', 'grades with weights', 'weighted percentage calculator'],
  featureList: ['Assignment rows with weights', 'Normalises any weight total', 'Add and remove rows', 'Letter grade output'],
  css: ROW_CSS,
  panel:
    '<div class="panel clean"><div class="panel-inner">' +
    '<div class="gr-head"><span>Assignment</span><span>Weight</span><span>Grade %</span><span></span></div>' +
    '<div id="wgRows"></div>' +
    '<div class="actions"><button class="btn" type="button" id="wgAdd"><i class="fa-solid fa-plus"></i>Add assignment</button> <button class="btn" type="button" id="wgReset"><i class="fa-solid fa-rotate-left"></i>Reset example</button></div>' +
    '<div class="result-card" id="wgResults" aria-live="polite"></div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="wgProc">Ready - calculations happen in this tab.</span></p>' +
    '</div></div>',
  js: HELP + `
var wgData=[{n:'Essay',w:2,g:86},{n:'Midterm',w:1,g:74},{n:'Project',w:3,g:93}];
var wgHost=$('wgRows');
function wgRender(){
  wgHost.innerHTML=wgData.map(function(r,i){
    return '<div class="gr-row">'+
      '<input class="gr-name" data-i="'+i+'" type="text" value="'+String(r.n).replace(/"/g,'&quot;')+'" aria-label="Assignment name">'+
      '<input class="gr-w" data-i="'+i+'" type="number" inputmode="decimal" step="any" min="0" value="'+r.w+'" aria-label="Weight or points">'+
      '<input class="gr-g" data-i="'+i+'" type="number" inputmode="decimal" step="any" min="0" max="100" value="'+r.g+'" aria-label="Grade percent">'+
      '<button class="gr-x rt-btn" data-i="'+i+'" type="button" aria-label="Remove assignment"><i class="fa-solid fa-xmark"></i></button>'+
    '</div>';
  }).join('');
}
function wgCalc(){
  var tw=0,twg=0,valid=0;
  wgData.forEach(function(r){var w=parseFloat(r.w),g=parseFloat(r.g);if(!isNaN(w)&&!isNaN(g)&&w>0){tw+=w;twg+=w*g;valid++;}});
  var host=$('wgResults');
  if(!valid){host.innerHTML='<p class="rt-sub">Enter a weight and grade for at least one assignment.</p>';$('wgProc').textContent='Ready - waiting for a weight and grade.';return}
  var avg=twg/tw;
  host.innerHTML='<div class="result-grid">'+tile('Weighted average',avg.toFixed(2)+'%')+tile('Letter grade',gradeLetter(avg,'plusminus'))+tile('Total weight',tw.toFixed(2))+tile('Assignments counted',String(valid))+'</div>'+
    '<p class="rt-sub" style="margin-top:12px">Weights may be credits, points or percentages - only their relative values affect the result, so they do not need to total 100.</p>';
  $('wgProc').textContent='Weighted average of '+valid+' items is '+avg.toFixed(2)+'%.';
}
wgHost.addEventListener('input',function(e){
  var i=e.target.getAttribute('data-i');if(i===null)return;
  var r=wgData[+i];if(!r)return;
  if(e.target.classList.contains('gr-name'))r.n=e.target.value;
  else if(e.target.classList.contains('gr-w'))r.w=e.target.value;
  else if(e.target.classList.contains('gr-g'))r.g=e.target.value;
  wgCalc();
});
wgHost.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('.gr-x'):null;if(!b)return;
  wgData.splice(+b.getAttribute('data-i'),1);wgRender();wgCalc();
});
$('wgAdd').addEventListener('click',function(){wgData.push({n:'New assignment',w:1,g:''});wgRender();wgCalc();});
$('wgReset').addEventListener('click',function(){wgData=[{n:'Essay',w:2,g:86},{n:'Midterm',w:1,g:74},{n:'Project',w:3,g:93}];wgRender();wgCalc();});
wgRender();wgCalc();
`,
  article: {
    title: 'Weighted Grade Calculator: The Honest Average of Weighted Work',
    lead: '<p>When assignments carry different weights - a project worth triple a quiz, an exam worth more than a worksheet - a plain average lies to you. This <strong>weighted grade calculator</strong> gives each item its proper influence and reports a single weighted percentage.</p>',
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'Weighted average in one line', html: '<p>The weighted average is <code>sum(grade &times; weight) / sum(weight)</code>. If a project scores 93 with weight 3 and a midterm scores 74 with weight 1, the weighted average is <code>(93&times;3 + 74&times;1) / 4 = 88.25%</code>. The midterm matters a quarter as much as the project, and the arithmetic reflects that.</p>' },
      { id: 'units', icon: 'fa-solid fa-ruler', heading: 'Credits, points or percentages', html: '<p>Weights can be anything consistent: course credits, assignment points, or percentages from a syllabus. Because the calculator divides by the total weight, only the relative sizes matter. This is what makes it flexible enough for a college transcript (credits), a gradebook (points) or a syllabus (percentages).</p>' },
      { id: 'related', icon: 'fa-solid fa-link', heading: 'Choosing the right calculator', html: '<p>Use this tool for individual assignments. When items group into categories such as homework and exams, the <a href="section-grade-calculator.html">section grade calculator</a> is a better fit. To find a needed exam score, see the <a href="final-grade-calculator.html">final grade calculator</a>, and convert the outcome with the <a href="gpa-calculator.html">GPA calculator</a>.</p>' }
    ],
    steps: [
      'Add an assignment name, its weight and its grade.',
      'Keep adding rows for each piece of weighted work.',
      'Remove any row you do not need with the cross button.',
      'Read the weighted average and letter grade as they update.'
    ],
    facts: [['Inputs', 'Assignment, weight, grade'], ['Method', 'sum(grade x weight) / sum(weight)'], ['Weights', 'Credits, points or percentages'], ['Output', 'Weighted average and letter grade'], ['Privacy', 'Runs fully in your browser']],
    useCases: [
      ['Students', 'Combine unequal assignments into one honest average.'],
      ['Teachers', 'Check a points-based gradebook total quickly.'],
      ['Transfer credit', 'Weight courses by credits when comparing records.'],
      ['Applications', 'Estimate a weighted percentage for a form or interview.']],
    tips: [
      'Enter weights in one consistent unit across all rows.',
      'A weight of zero excludes an item without deleting it.',
      'Double-check that your weight really matches the syllabus - a wrong weight skews everything.'
    ],
    takeaways: [['method', 'sum(grade x weight) / sum(weight)'], ['flexible', 'works with credits, points or percent'], ['output', 'weighted average and letter grade']],
    faq: [
      ['How is a weighted grade different from a normal average?', 'A normal average treats every item equally. A weighted grade multiplies each grade by its weight first, so heavier items count more toward the result.'],
      ['Do the weights need to add up to 100?', 'No. The calculator divides by whatever total weight you enter, so credits or points work just as well as percentages.'],
      ['Can I mix weighted and unweighted items?', 'Yes. Give unweighted items a weight of 1 and weighted ones their real weight, all in the same consistent unit.'],
      ['Is this the same as a GPA calculator?', 'No. This computes a percentage from weighted work. The GPA calculator converts course grades into grade points on a 4.0 scale.']
    ],
    conclusion: '<p>For any mixture of unequal assignments, the <strong>weighted grade calculator</strong> returns the fair average. When the work is grouped into categories, switch to the <a href="section-grade-calculator.html">section grade calculator</a>, and finish with the <a href="gpa-calculator.html">GPA calculator</a>.</p>'
  }
});

/* ========================================================================
   5. SEMESTER GRADE CALCULATOR
   ======================================================================== */
add({
  file: 'semester-grade-calculator.html', folder: 'math',
  name: 'Semester Grade Calculator', tag: 'Grades', icon: 'fa-solid fa-calendar-days',
  title: 'Semester Grade Calculator | Combine Quarters and Final Exam',
  metaDesc: 'Combine two marking periods and a final exam into a semester grade. Set the weights, enter each grade and see the semester average plus the exam score needed for a target.',
  desc: 'Enter your two marking-period grades and the final exam, set the weights, and get the semester grade plus the exam score needed to hit a target.',
  keywords: ['semester grade calculator', 'semester grade', 'quarter grades final exam', 'marking period grade', 'term grade calculator', 'combine quarter grades', 'exam weighted semester', 'semester average calculator', 'school semester grade', 'grades with final exam'],
  featureList: ['Two marking periods plus exam', 'Adjustable weights', 'Target-grade planning', 'Required exam score'],
  panel:
    '<div class="panel clean"><div class="panel-inner">' +
    '<div class="calc-grid">' +
    '<div class="field"><label for="smMp1">Marking period 1 (%)</label><input id="smMp1" type="number" inputmode="decimal" step="any" min="0" max="100" value="86"></div>' +
    '<div class="field"><label for="smMp2">Marking period 2 (%)</label><input id="smMp2" type="number" inputmode="decimal" step="any" min="0" max="100" value="90"></div>' +
    '<div class="field"><label for="smExam">Final exam (%) <span class="rt-sub">optional</span></label><input id="smExam" type="number" inputmode="decimal" step="any" min="0" max="100" value=""></div>' +
    '<div class="field"><label for="smW1">MP1 weight (%)</label><input id="smW1" type="number" inputmode="decimal" step="any" min="0" value="40"></div>' +
    '<div class="field"><label for="smW2">MP2 weight (%)</label><input id="smW2" type="number" inputmode="decimal" step="any" min="0" value="40"></div>' +
    '<div class="field"><label for="smWe">Exam weight (%)</label><input id="smWe" type="number" inputmode="decimal" step="any" min="0" value="20"></div>' +
    '<div class="field"><label for="smTarget">Target semester grade (%)</label><input id="smTarget" type="number" inputmode="decimal" step="any" min="0" max="100" value="90"></div>' +
    '</div>' +
    '<div class="result-card" id="smResults" aria-live="polite"></div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="smProc">Ready - calculations happen in this tab.</span></p>' +
    '</div></div>',
  js: HELP + `
function calcSM(){
  var mp1=parseFloat($('smMp1').value),mp2=parseFloat($('smMp2').value);
  var exam=parseFloat($('smExam').value);var examGiven=$('smExam').value!=='';
  var w1=parseFloat($('smW1').value)||0,w2=parseFloat($('smW2').value)||0,we=parseFloat($('smWe').value)||0;
  var target=parseFloat($('smTarget').value);
  var host=$('smResults');
  var tw=w1+w2+we;
  if(isNaN(mp1)||isNaN(mp2)||tw<=0){host.innerHTML='<p class="rt-sub">Enter both marking-period grades and at least one positive weight.</p>';$('smProc').textContent='Ready - waiting for valid inputs.';return}
  var html='';
  if(examGiven&&!isNaN(exam)){
    var sem=(w1*mp1+w2*mp2+we*exam)/tw;
    html='<div class="result-grid">'+tile('Semester grade',sem.toFixed(2)+'%')+tile('Letter grade',gradeLetter(sem,'plusminus'))+tile('Marking periods',mp1.toFixed(1)+'% / '+mp2.toFixed(1)+'%')+tile('Final exam',exam.toFixed(1)+'%')+'</div>';
    $('smProc').textContent='Semester grade is '+sem.toFixed(2)+'%.';
  }else{
    html='<div class="result-grid">'+tile('Marking periods',mp1.toFixed(1)+'% / '+mp2.toFixed(1)+'%')+tile('Combined so far',((w1*mp1+w2*mp2)/(w1+w2||1)).toFixed(2)+'%')+'</div><p class="rt-sub" style="margin-top:12px">Enter a final exam score to compute the full semester grade.</p>';
    $('smProc').textContent='Waiting for a final exam score.';
  }
  if(!isNaN(target)&&we>0){
    var need=(target*tw-w1*mp1-w2*mp2)/we;
    var note;
    if(need>100)note='The target needs '+need.toFixed(2)+'% on the exam, which is out of reach with these weights.';
    else if(need<=0)note='The target is already secured - any exam score keeps you there.';
    else note='For a '+target.toFixed(1)+'% semester grade you need at least <strong>'+need.toFixed(2)+'%</strong> on the final exam.';
    html+='<p class="rt-sub" style="margin-top:12px">'+note+'</p>';
  }
  host.innerHTML=html;
}
['smMp1','smMp2','smExam','smW1','smW2','smWe','smTarget'].forEach(function(id){var el=$(id);el.addEventListener('input',calcSM)});
calcSM();
`,
  article: {
    title: 'Semester Grade Calculator: Two Quarters Plus a Final',
    lead: '<p>Many schools build a semester grade from two marking periods and a final exam. This <strong>semester grade calculator</strong> combines all three at the weights your school uses, then tells you the exam score needed to reach a target.</p>',
    sections: [
      { id: 'structure', icon: 'fa-solid fa-calendar-days', heading: 'How semester grades are assembled', html: '<p>A typical scheme is two marking periods and a final exam, often weighted 40% / 40% / 20%. The semester grade is the weighted average of the three: <code>sem = w1&times;mp1 + w2&times;mp2 + we&times;exam</code>, with the weights as fractions. Change any weight to match your school and the result updates instantly.</p>' },
      { id: 'target', icon: 'fa-solid fa-bullseye', heading: 'Working backwards to a target', html: '<p>The most useful part is the target planner. With both marking periods locked in, the tool solves the same equation for the exam score. If you are sitting on two strong quarters, it might tell you a 60% final exam is enough - or, if you need a boost, exactly how high the exam has to go.</p>' },
      { id: 'related', icon: 'fa-solid fa-link', heading: 'Related calculators', html: '<p>For a single high-stakes exam rather than a whole semester, use the <a href="final-grade-calculator.html">final grade calculator</a>. For courses built from categories like homework and tests, use the <a href="section-grade-calculator.html">section grade calculator</a>, and convert the semester result with the <a href="gpa-calculator.html">GPA calculator</a>.</p>' }
    ],
    steps: [
      'Enter the grade for each marking period.',
      'Set the weight of each marking period and the final exam.',
      'Optionally enter the exam score to see the full semester grade.',
      'Add a target grade to see the exam score you need.'
    ],
    facts: [['Inputs', 'Two periods, exam, weights, target'], ['Method', 'Weighted average, auto-normalised'], ['Exam optional', 'Works before the exam is scored'], ['Planner', 'Required exam score for a target'], ['Privacy', 'Runs fully in your browser']],
    useCases: [
      ['Students', 'See a semester grade before and after the exam.'],
      ['Parents', 'Understand how much the final exam matters.'],
      ['Teachers', 'Explain a semester weighting scheme to a class.'],
      ['Counsellors', 'Model grading scenarios for course planning.']],
    tips: [
      'Enter the exact weights from your school; they vary widely between districts.',
      'Leave the exam blank until it is scored - the tool still shows the running combined grade.',
      'Use the target planner early so you know how much the exam can shift the result.'
    ],
    takeaways: [['semester', 'w1 x mp1 + w2 x mp2 + we x exam'], ['exam needed', '(target x total - w1 x mp1 - w2 x mp2) / we'], ['flexible', 'set the weights your school uses']],
    faq: [
      ['How do schools combine quarters and a final exam?', 'Usually as a weighted average, for example 40% first quarter, 40% second quarter and 20% final exam. This calculator lets you enter whatever weights apply.'],
      ['Can I use it before the exam is taken?', 'Yes. Leave the exam field blank to see your combined marking-period grade, then add the exam score when you know it.'],
      ['How is the required exam score calculated?', 'It solves the weighted-average equation for the exam: needed = (target x total weight - w1 x mp1 - w2 x mp2) / exam weight.'],
      ['Does it work if the weights change?', 'Absolutely. Set any weights you like; the result is normalised automatically.']
    ],
    conclusion: '<p>From two quarters and a final exam, the <strong>semester grade calculator</strong> shows both where you stand and what the exam must deliver. For a single exam problem use the <a href="final-grade-calculator.html">final grade calculator</a>, and record the result with the <a href="gpa-calculator.html">GPA calculator</a>.</p>'
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
    category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file, keywords: spec.keywords
  });
  console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');
}
const res = registerTools(entries);
console.log('registry: added', res.added, 'skipped', res.skipped);
