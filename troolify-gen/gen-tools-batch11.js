/* ============================================================================
   Troolify - batch 11 (more time & date calculators)
   Eight calculators sharing the compact "panel + run()" scaffold used by the
   older time tools (see gen-tools-batch2.js). Emits standard tool pages into
   tools/time/ and registers them in assets/js/tools-data.js.
   Category: Time & Date (tools/time/)
   Run: node troolify-gen/gen-tools-batch11.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ---------- shared JS prefix (helpers every calculator uses) ---------- */
const JS_PREFIX = `
var $=function(id){return document.getElementById(id);};
function pad2(n){return (n<10?"0":"")+n;}
function set(id,v){var el=$(id);if(el)el.textContent=v;}
function fmtHM(mins){var m=Math.round(mins);var neg=m<0;if(neg)m=-m;var h=Math.floor(m/60);m=m%60;return (neg?"-":"")+h+" h "+pad2(m)+" min";}
function pdate(s){var a=String(s).split("-");return new Date(+a[0],+a[1]-1,+a[2]);}
function isod(d){return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
function longDate(d){return d.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});}
function copyText(t){try{if(window.Troolify&&window.Troolify.copyToClipboard){window.Troolify.copyToClipboard(t);}else if(navigator.clipboard){navigator.clipboard.writeText(t);}}catch(e){}}
`;

/* ========================================================================
   1. BUSINESS DAYS CALCULATOR
   ======================================================================== */
add({
  file: 'business-days-calculator.html', folder: 'time',
  name: 'Business Days Calculator', tag: 'Workdays', icon: 'fa-solid fa-calendar-check',
  title: 'Business Days Calculator | Count Work Days Between Dates',
  metaDesc: 'Count the business days (weekdays) between two dates, excluding weekends and any holidays you list. Free, instant and 100% client-side.',
  desc: 'Count the business days between two dates, skipping weekends and any holidays you enter.',
  keywords: ['business days calculator', 'working days calculator', 'work days between dates', 'count weekdays', 'business day counter', 'exclude weekends', 'working days between two dates', 'office days', 'weekday counter', 'business days'],
  featureList: ['Business days between two dates', 'Weekends excluded automatically', 'Optional holiday list', 'Choose whether to include the end date', 'Weekend and total-day counts', '100% client-side'],
  panel: panel.wrap('bd', 'fa-solid fa-calendar-check', 'Business days calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="bdStart">Start date</label><input id="bdStart"type="date"></div>' +
    '<div class="field"><label for="bdEnd">End date</label><input id="bdEnd"type="date"></div>' +
    '<div class="field"><label for="bdInclude">Include end date</label><select id="bdInclude"><option value="yes">Yes</option><option value="no">No</option></select></div>' +
    '</div>' +
    '<div class="field"style="margin-bottom:14px"><label for="bdHolidays">Holidays to exclude (optional, one YYYY-MM-DD per line)</label><textarea id="bdHolidays"style="min-height:80px"spellcheck="false"placeholder="2026-12-25&#10;2026-12-26"></textarea></div>' +
    panel.actions('bd', 'Count business days') +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Business days</span><span class="rt-value"id="bdBiz">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Weekend days</span><span class="rt-value"id="bdWeekend">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Total days</span><span class="rt-value"id="bdTotal">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: JS_PREFIX + `
    function run(){
      var s=$("bdStart").value,e=$("bdEnd").value;
      if(!s||!e){set("bdBiz","Enter both dates");set("bdWeekend","");set("bdTotal","");return;}
      var inc=$("bdInclude").value==="yes";
      var start=pdate(s),end=pdate(e);
      if(start>end){var t=start;start=end;end=t;}
      var hol={};(($("bdHolidays").value)||"").split(/[\\n,]+/).forEach(function(x){x=x.trim();if(/^\\d{4}-\\d{2}-\\d{2}$/.test(x))hol[x]=1;});
      var d=new Date(start.getTime()),last=inc?end:new Date(end.getTime()-86400000);
      var total=0,weekend=0,biz=0;
      for(;d<=last;d.setDate(d.getDate()+1)){
        total++;
        var dow=d.getDay();
        if(dow===0||dow===6)weekend++;
        else if(!hol[isod(d)])biz++;
      }
      set("bdBiz",biz);
      set("bdWeekend",weekend);
      set("bdTotal",total);
    }
    ["bdStart","bdEnd","bdInclude","bdHolidays"].forEach(function(id){$(id).addEventListener("change",run);$(id).addEventListener("input",run);});
    $("bdGo").addEventListener("click",run);
    $("bdSample").addEventListener("click",function(){var d=new Date();$("bdStart").value=isod(d);var e=new Date();e.setDate(e.getDate()+30);$("bdEnd").value=isod(e);$("bdHolidays").value="";run();});
    $("bdClear").addEventListener("click",function(){$("bdStart").value="";$("bdEnd").value="";$("bdHolidays").value="";set("bdBiz","&ndash;");set("bdWeekend","&ndash;");set("bdTotal","&ndash;");});
    $("bdCopy").addEventListener("click",function(){copyText("Business days: "+$("bdBiz").textContent+" | Weekend days: "+$("bdWeekend").textContent+" | Total days: "+$("bdTotal").textContent);});
    run();
  `,
  workflow: ['tools/time/date-difference-calculator.html', 'tools/time/add-to-date-calculator.html'],
  article: {
    title: 'Business Days Calculator: Count Work Days, Not Calendar Days',
    lead: `<p>A deadline that sounds generous on the calendar often is not once you strip out weekends. This <strong>business days calculator</strong> counts the working days between two dates, excludes Saturdays and Sundays, and lets you remove public holidays so the number you get matches the days people are actually at their desks.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-calculator', heading: 'What counts as a business day', html: `<p>A business day is any Monday to Friday that is not a holiday you have listed. The tool walks from your start date to your end date one day at a time, skipping weekends and any date in your holiday box. You decide whether the end date itself is part of the span - useful when a deadline falls on the closing day. It prints working days, weekend days and the raw total side by side so the difference is obvious.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Where an exact count matters', html: `<p>Contract and legal clauses often promise delivery in a number of business days, not calendar days. Support teams quote response windows the same way. Project managers use the figure to see how much real working time sits between today and a launch, and freelancers use it to set turnaround times they can actually meet once weekends are removed.</p>` }
    ],
    steps: ['Enter a start and an end date.', 'Choose whether to include the end date.', 'Paste any holidays to exclude, one date per line.', 'Press <strong>Count business days</strong>.'],
    facts: [['Weekend', 'Saturday and Sunday excluded'], ['Holidays', 'Any dates you add are removed'], ['End date', 'Optional - include or exclude it'], ['Output', 'Business, weekend and total days'], ['Data', 'Runs locally, nothing uploaded']],
    useCases: [
      ['Contracts and delivery windows', 'Turn a promise of a number of business days into a real calendar date.'],
      ['Project planning', 'See how much hands-on time remains before a deadline once weekends are gone.'],
      ['Support and response times', 'Work out when a quoted response window actually expires.']
    ],
    tips: ['List regional holidays that apply to the people doing the work, not just national ones.', 'If a deadline is inclusive of the final day, set include end date to Yes.', 'For anything crossing a year boundary, add next year holidays too.'],
    takeaways: ['Weekends are removed automatically.', 'Any holiday list you enter is subtracted.', 'You control whether the end date counts.'],
    faq: [
      ['Does it exclude weekends automatically?', 'Yes. Saturdays and Sundays are never counted as business days.'],
      ['Can I remove public holidays?', 'Yes. Enter one date per line in YYYY-MM-DD form and each is excluded from the count.'],
      ['Is the end date included?', 'That is up to you - switch include end date on or off depending on how your deadline is worded.'],
      ['Does it handle dates in reverse order?', 'Yes. If the end is before the start, the two are swapped so the count is still correct.'],
      ['Is my data sent anywhere?', 'No. Everything is calculated in your browser.']
    ],
    conclusion: `<p>Stop guessing how much working time you really have. The <strong>business days calculator</strong> gives the honest number in one click. For elapsed calendar time instead, try the <a href="date-difference-calculator.html">date difference calculator</a>.</p>`
  }
});

/* ========================================================================
   2. WEEK NUMBER CALCULATOR
   ======================================================================== */
add({
  file: 'week-number-calculator.html', folder: 'time',
  name: 'Week Number Calculator', tag: 'Weeks', icon: 'fa-solid fa-calendar-day',
  title: 'Week Number Calculator | ISO Week Number for Any Date',
  metaDesc: 'Find the ISO week number for any date, or the dates for a given year and week. See the week start and end, day of year and quarter. Free and offline.',
  desc: 'Find the ISO week number for any date, or the start and end dates of a given week.',
  keywords: ['week number calculator', 'iso week number', 'what week is it', 'week of the year', 'calendar week', 'week number for date', 'week to date', 'date to week number', 'current week number', 'iso 8601 week'],
  featureList: ['ISO 8601 week number for any date', 'Week start and end dates', 'Year and week to calendar dates', 'Day of year and quarter', 'Live as you type', '100% client-side'],
  panel: panel.wrap('wn', 'fa-solid fa-calendar-day', 'Week number calculator',
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="wnMode">Mode</label><select id="wnMode"><option value="date">Date to week number</option><option value="week">Year and week to dates</option></select></div>' +
    '<div id="wnDateWrap"class="field"style="max-width:320px;margin-bottom:14px"><label for="wnDate">Date</label><input id="wnDate"type="date"></div>' +
    '<div id="wnWeekWrap"class="row3"style="margin-bottom:14px;display:none">' +
    '<div class="field"><label for="wnYear">Year</label><input id="wnYear"type="number"min="1"max="9999"step="1"placeholder="2026"></div>' +
    '<div class="field"><label for="wnWeek">Week</label><input id="wnWeek"type="number"min="1"max="53"step="1"placeholder="42"></div>' +
    '</div>' +
    panel.actions('wn', 'Calculate week') +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Week number</span><span class="rt-value"id="wnNum">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Week year</span><span class="rt-value"id="wnYearOut">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Week starts</span><span class="rt-value"id="wnStart"style="font-size:15px">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Week ends</span><span class="rt-value"id="wnEnd"style="font-size:15px">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: JS_PREFIX + `
    function isoWeek(date){
      var d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
      var dayNum=(d.getUTCDay()+6)%7;
      d.setUTCDate(d.getUTCDate()-dayNum+3);
      var firstThu=new Date(Date.UTC(d.getUTCFullYear(),0,4));
      var fday=(firstThu.getUTCDay()+6)%7;
      firstThu.setUTCDate(firstThu.getUTCDate()-fday+3);
      var week=1+Math.round((d-firstThu)/(7*86400000));
      return {week:week,year:d.getUTCFullYear()};
    }
    function mondayOf(y,w){var d=new Date(Date.UTC(y,0,4));var dayNum=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-dayNum+(w-1)*7);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());}
    function dayOfYear(date){return Math.floor((date-new Date(date.getFullYear(),0,0))/86400000);}
    function quarter(date){return Math.floor(date.getMonth()/3)+1;}
    function showDate(){
      var d=pdate($("wnDate").value);
      if(!isFinite(d.getTime())){set("wnNum","Pick a date");set("wnYearOut","");set("wnStart","");set("wnEnd","");return;}
      var w=isoWeek(d);
      var dow=(d.getDay()+6)%7;
      var mon=new Date(d.getTime());mon.setDate(mon.getDate()-dow);
      var sun=new Date(mon.getTime());sun.setDate(sun.getDate()+6);
      set("wnNum","W"+w.week+" of "+w.year);
      set("wnYearOut","Day "+dayOfYear(d)+" - Q"+quarter(d));
      set("wnStart",longDate(mon));
      set("wnEnd",longDate(sun));
    }
    function showWeek(){
      var y=parseInt($("wnYear").value,10),w=parseInt($("wnWeek").value,10);
      if(isNaN(y)||isNaN(w)||w<1||w>53){set("wnNum","Enter a year and week");set("wnYearOut","");set("wnStart","");set("wnEnd","");return;}
      var mon=mondayOf(y,w),sun=new Date(mon.getTime());sun.setDate(sun.getDate()+6);
      set("wnNum","W"+w+" of "+y);
      set("wnYearOut","Monday "+isod(mon));
      set("wnStart",longDate(mon));
      set("wnEnd",longDate(sun));
    }
    function run(){if($("wnMode").value==="week"){showWeek();}else{showDate();}}
    $("wnMode").addEventListener("change",function(){var wk=$("wnMode").value==="week";$("wnDateWrap").style.display=wk?"none":"flex";$("wnWeekWrap").style.display=wk?"grid":"none";run();});
    ["wnDate","wnYear","wnWeek"].forEach(function(id){$(id).addEventListener("change",run);$(id).addEventListener("input",run);});
    $("wnGo").addEventListener("click",run);
    $("wnSample").addEventListener("click",function(){$("wnMode").value="date";$("wnDateWrap").style.display="flex";$("wnWeekWrap").style.display="none";$("wnDate").value=isod(new Date());run();});
    $("wnClear").addEventListener("click",function(){$("wnDate").value="";$("wnYear").value="";$("wnWeek").value="";set("wnNum","&ndash;");set("wnYearOut","&ndash;");set("wnStart","&ndash;");set("wnEnd","&ndash;");});
    $("wnCopy").addEventListener("click",function(){copyText("Week "+$("wnNum").textContent+" - "+$("wnStart").textContent+" to "+$("wnEnd").textContent);});
    run();
  `,
  workflow: ['tools/time/day-of-week-calculator.html', 'tools/time/days-until-calculator.html'],
  article: {
    title: 'Week Number Calculator: ISO Weeks Without the Spreadsheet',
    lead: `<p>Planners, payroll weeks and project schedules all lean on week numbers, yet working them out by hand is fiddly because ISO weeks do not line up neatly with January 1. This <strong>week number calculator</strong> finds the ISO week for any date and also runs the other way, turning a year and week into exact dates.</p>`,
    sections: [
      { id: 'iso', icon: 'fa-solid fa-calendar-day', heading: 'Why ISO weeks are odd at the edges', html: `<p>Under the ISO 8601 standard a week always begins on Monday, and week 1 is the week that contains the first Thursday of the year. That means the first day or two of January can belong to the last week of the previous year, and the final days of December can fall into week 1 of the next. The tool applies that rule precisely, so early January and late December dates report the week year you would see in a proper planner.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Working with week numbers', html: `<p>Manufacturing and project teams often schedule by week, German and Nordic calendars print week numbers in the margin, and payroll systems may run on weekly periods. Entering a date gives you the week number for planning; entering a year and week gives the Monday to Sunday span, which is what you need to book a slot or set a reminder.</p>` }
    ],
    steps: ['Choose whether to convert a date or a week.', 'Enter the date, or the year and week number.', 'Press <strong>Calculate week</strong> to see the week number and its start and end dates.'],
    facts: [['Standard', 'ISO 8601'], ['Week starts', 'Monday'], ['Week 1', 'The week containing the first Thursday'], ['Also shows', 'Day of year and quarter'], ['Data', 'Computed in your browser']],
    useCases: [
      ['Project schedules', 'Convert a milestone date into the week number a team plans by.'],
      ['Timesheets and payroll', 'Find the start and end of a pay week from its number.'],
      ['Calendar planning', 'See which day of the year and which quarter a date falls in.']
    ],
    tips: ['For dates in early January, double-check the week year - it may be the previous year.', 'Use week to date mode to book something in a specific week.', 'Remember ISO weeks start on Monday, not Sunday.'],
    takeaways: ['Correct ISO 8601 week numbers.', 'Works in both directions.', 'Shows the week span, day of year and quarter.'],
    faq: [
      ['Which week numbering standard is used?', 'ISO 8601, the international standard where weeks start on Monday and week 1 contains the first Thursday.'],
      ['Why is my January date in the previous year week?', 'Under ISO rules the start of January can fall into the last week of the previous year; the week year shown reflects that.'],
      ['Can I find the dates for a week number?', 'Yes. Switch to year and week mode and enter both values to get the Monday to Sunday span.'],
      ['Does it show the current week number?', 'Yes - press Sample to load today, and the week number appears immediately.'],
      ['Is anything stored?', 'No. All calculations happen locally in your browser.']
    ],
    conclusion: `<p>Week numbers stop being a headache once the tool does the ISO arithmetic. Use the <strong>week number calculator</strong> for schedules, payroll and planning. Need the weekday for a date instead? Try the <a href="day-of-week-calculator.html">day of week calculator</a>.</p>`
  }
});

/* ========================================================================
   3. DAY OF WEEK CALCULATOR
   ======================================================================== */
add({
  file: 'day-of-week-calculator.html', folder: 'time',
  name: 'Day of Week Calculator', tag: 'Calendar', icon: 'fa-solid fa-calendar-days',
  title: 'Day of Week Calculator | What Day Was or Will It Be',
  metaDesc: 'Find the day of the week for any date - past, present or future. See the weekday name, its number, the week number and day of the year. Free and offline.',
  desc: 'Find the day of the week for any date, with the weekday number, week number and day of the year.',
  keywords: ['day of week calculator', 'what day was it', 'what day is it', 'weekday calculator', 'day of the week for a date', 'what day will it be', 'calendar day finder', 'find weekday', 'day name for date', 'date to weekday'],
  featureList: ['Weekday name for any date', 'ISO weekday number (1-7)', 'Week number and day of the year', 'Works for past and future dates', 'Live as you type', '100% client-side'],
  panel: panel.wrap('dow', 'fa-solid fa-calendar-days', 'Day of week calculator',
    '<div class="field"style="max-width:320px;margin-bottom:14px"><label for="dowDate">Date</label><input id="dowDate"type="date"></div>' +
    panel.actions('dow', 'Find the day') +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Day of week</span><span class="rt-value"id="dowName">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Weekday number</span><span class="rt-value"id="dowNum">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Week number</span><span class="rt-value"id="dowWeek">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Day of year</span><span class="rt-value"id="dowDoy">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: JS_PREFIX + `
    var NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    function isoWeekNum(date){
      var d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
      var dayNum=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-dayNum+3);
      var firstThu=new Date(Date.UTC(d.getUTCFullYear(),0,4));var fday=(firstThu.getUTCDay()+6)%7;
      firstThu.setUTCDate(firstThu.getUTCDate()-fday+3);
      return 1+Math.round((d-firstThu)/(7*86400000));
    }
    function run(){
      var v=$("dowDate").value;
      if(!v){set("dowName","Pick a date");set("dowNum","");set("dowWeek","");set("dowDoy","");return;}
      var d=pdate(v);
      var name=NAMES[d.getDay()];
      set("dowName",name);
      var iso=((d.getDay()+6)%7)+1;
      set("dowNum","Day "+iso+" of 7");
      set("dowWeek","W"+isoWeekNum(d));
      set("dowDoy","Day "+Math.floor((d-new Date(d.getFullYear(),0,0))/86400000));
    }
    $("dowDate").addEventListener("change",run);$("dowDate").addEventListener("input",run);
    $("dowGo").addEventListener("click",run);
    $("dowSample").addEventListener("click",function(){$("dowDate").value=isod(new Date());run();});
    $("dowClear").addEventListener("click",function(){$("dowDate").value="";set("dowName","&ndash;");set("dowNum","&ndash;");set("dowWeek","&ndash;");set("dowDoy","&ndash;");});
    $("dowCopy").addEventListener("click",function(){copyText($("dowName").textContent+", "+$("dowDate").value);});
    run();
  `,
  workflow: ['tools/time/week-number-calculator.html', 'tools/time/date-difference-calculator.html'],
  article: {
    title: 'Day of Week Calculator: Which Day Was That Date',
    lead: `<p>Whether you are checking the weekday of a historical date, planning a date years ahead or confirming the day a contract was signed, this <strong>day of week calculator</strong> gives the answer instantly, along with the weekday number, ISO week and day of the year.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-calendar-days', heading: 'A question calendars answer slowly', html: `<p>Weekdays repeat on a seven-day cycle, which makes long-range questions surprisingly error-prone to do mentally, especially across leap years. The tool reads the calendar date you enter and reports the day name computed from the proleptic Gregorian calendar, the same system used for standard date arithmetic. The weekday number counts from Monday as one through to Sunday as seven, matching the ISO convention.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'When you need the weekday', html: `<p>People use it to check whether a future deadline lands on a weekend, to settle trivia about what day a famous event happened, to find out the weekday of a birthday or anniversary, and to plan events on a favoured day. Historians and genealogists also use it to confirm dates in old documents.</p>` }
    ],
    steps: ['Enter a date - it can be in the past or the future.', 'Press <strong>Find the day</strong>.', 'Read the weekday name and the supporting numbers.'],
    facts: [['Output', 'Weekday name plus supporting numbers'], ['Weekday number', '1 = Monday to 7 = Sunday'], ['Range', 'Any Gregorian calendar date'], ['Also shows', 'Week number and day of the year'], ['Data', 'Computed in your browser']],
    useCases: [
      ['Event planning', 'Check that a chosen date is not a weekend you want to avoid.'],
      ['Trivia and research', 'Confirm the weekday of a historical or future date.'],
      ['Anniversaries', 'Find which day of the week a yearly date falls on.']
    ],
    tips: ['Weekday number 1 is Monday and 7 is Sunday, following ISO practice.', 'Cross-check the week number if you are planning against a schedule.', 'Remember leap years shift weekdays by two days instead of one.' ],
    takeaways: ['The weekday for any date, past or future.', 'ISO weekday numbering.', 'Week number and day of year as a bonus.'],
    faq: [
      ['Can I check a future date?', 'Yes - the calculator works for any valid Gregorian date, past or future.'],
      ['What does the weekday number mean?', 'It follows ISO numbering, where Monday is 1 and Sunday is 7.'],
      ['Does it account for leap years?', 'Yes. The underlying calendar arithmetic handles leap years correctly.'],
      ['Which calendar system is used?', 'The proleptic Gregorian calendar, the international standard for civil dates.'],
      ['Do you store my date?', 'No. The calculation runs entirely in your browser.']
    ],
    conclusion: `<p>Settle the question in a second. The <strong>day of week calculator</strong> names the weekday for any date. To see the week number instead, use the <a href="week-number-calculator.html">week number calculator</a>.</p>`
  }
});

/* ========================================================================
   4. DAYS UNTIL CALCULATOR
   ======================================================================== */
add({
  file: 'days-until-calculator.html', folder: 'time',
  name: 'Days Until Calculator', tag: 'Countdown', icon: 'fa-solid fa-hourglass-half',
  title: 'Days Until Calculator | Count Down to Any Date',
  metaDesc: 'Count the days until any future date from today or a date you choose. See weeks, hours and a full breakdown. Free, instant and 100% client-side.',
  desc: 'Count the days until a future date, with weeks, hours and a full breakdown.',
  keywords: ['days until calculator', 'how many days until', 'day countdown', 'days till date', 'count days to date', 'days between dates', 'sleeps until', 'days remaining', 'countdown to date', 'days from today'],
  featureList: ['Days until any future date', 'Choose your own start date', 'Breakdown in weeks and days', 'Total hours and sleeps', 'Handles past dates too', '100% client-side'],
  panel: panel.wrap('du', 'fa-solid fa-hourglass-half', 'Days until calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="duTarget">Target date</label><input id="duTarget"type="date"></div>' +
    '<div class="field"><label for="duFrom">From (default today)</label><input id="duFrom"type="date"></div>' +
    '<div class="field"><label for="duInclusive">Count today</label><select id="duInclusive"><option value="no">No</option><option value="yes">Yes</option></select></div>' +
    '</div>' +
    panel.actions('du', 'Count the days') +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Days</span><span class="rt-value"id="duDays">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Weeks + days</span><span class="rt-value"id="duWeeks"style="font-size:15px">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Hours</span><span class="rt-value"id="duHours">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Months (approx)</span><span class="rt-value"id="duMonths">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: JS_PREFIX + `
    function run(){
      var t=$("duTarget").value;
      if(!t){set("duDays","Pick a target date");set("duWeeks","");set("duHours","");set("duMonths","");return;}
      var from=$("duFrom").value?pdate($("duFrom").value):new Date();
      var target=pdate(t);
      var a=new Date(from.getFullYear(),from.getMonth(),from.getDate());
      var b=new Date(target.getFullYear(),target.getMonth(),target.getDate());
      var inc=$("duInclusive").value==="yes";
      var days=Math.round((b-a)/86400000);
      if(inc&&days>=0)days+=1;
      var word=days>=0?"until":"ago";
      var abs=Math.abs(days);
      set("duDays",abs+" day"+(abs===1?"":"s")+" "+word);
      set("duWeeks",Math.floor(abs/7)+" wk "+pad2(abs%7)+" d");
      set("duHours",(abs*24).toLocaleString());
      set("duMonths",(abs/30.44).toFixed(1));
    }
    ["duTarget","duFrom","duInclusive"].forEach(function(id){$(id).addEventListener("change",run);$(id).addEventListener("input",run);});
    $("duGo").addEventListener("click",run);
    $("duSample").addEventListener("click",function(){var d=new Date();d.setDate(d.getDate()+100);$("duTarget").value=isod(d);$("duFrom").value="";run();});
    $("duClear").addEventListener("click",function(){$("duTarget").value="";$("duFrom").value="";set("duDays","&ndash;");set("duWeeks","&ndash;");set("duHours","&ndash;");set("duMonths","&ndash;");});
    $("duCopy").addEventListener("click",function(){copyText($("duDays").textContent+" ("+$("duWeeks").textContent+")");});
    run();
  `,
  workflow: ['tools/time/countdown-timer.html', 'tools/time/date-difference-calculator.html'],
  article: {
    title: 'Days Until Calculator: A Live Countdown to Any Date',
    lead: `<p>Big dates are easier to plan when you can see exactly how much time is left. This <strong>days until calculator</strong> counts the days from today, or from any date you choose, to a target date, and breaks the gap into weeks, hours and a rough month figure.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-hourglass-half', heading: 'Counting whole days', html: `<p>The tool compares two calendar dates and returns the number of whole days between them, ignoring the time of day so the answer stays stable. If you switch on count today, the current day is added to the total, which matches the common phrasing of sleeps until an event. For dates in the past it flips the wording to days ago, so the same tool works as a since counter.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'What people count down to', html: `<p>Holidays, exam dates, product launches, wedding days, retirements and game releases are the usual subjects. Teachers count down to the end of term; project teams count working days to a go-live; and on a lighter note, streaming schedules and fan events are frequently tracked by the day.</p>` }
    ],
    steps: ['Enter the target date.', 'Optionally set a different start date, otherwise today is used.', 'Choose whether to count today.', 'Press <strong>Count the days</strong>.'],
    facts: [['Measures', 'Whole calendar days'], ['Start', 'Today or any date you set'], ['Extras', 'Weeks, hours and approximate months'], ['Past dates', 'Shown as days ago'], ['Data', 'Computed in your browser']],
    useCases: [
      ['Holidays and travel', 'See how many days remain before a trip.'],
      ['Deadlines and launches', 'Track the run-up to a project or release date.'],
      ['Personal milestones', 'Count down to birthdays, anniversaries or results day.']
    ],
    tips: ['Set a start date to count between two fixed dates instead of from today.', 'Turn on count today if you are counting sleeps until an event.', 'Use the hours figure for a finer sense of the time left.'],
    takeaways: ['Whole-day countdowns to any date.', 'Works forward and backward in time.', 'Weeks, hours and months at a glance.'],
    faq: [
      ['Does it include today?', 'Only if you switch count today on; by default the total is the number of whole days between the dates.'],
      ['Can I count from a date other than today?', 'Yes. Set the from field and the count runs between your two chosen dates.'],
      ['What happens with a past date?', 'The result is shown as days ago instead of days until.'],
      ['Why do months show as approximate?', 'Months vary in length, so the month figure is a rough guide based on an average month.'],
      ['Is my data private?', 'Yes. Everything is calculated locally in your browser.']
    ],
    conclusion: `<p>Turn a vague date into a number you can plan around. The <strong>days until calculator</strong> counts down in one click. For a live ticking timer, try the <a href="countdown-timer.html">countdown timer</a>.</p>`
  }
});

/* ========================================================================
   5. HOURS CALCULATOR
   ======================================================================== */
add({
  file: 'hours-calculator.html', folder: 'time',
  name: 'Hours Calculator', tag: 'Duration', icon: 'fa-solid fa-calculator',
  title: 'Hours Calculator | Work Out Hours Between Two Times',
  metaDesc: 'Calculate the hours between two times, minus any break, as decimal hours and hours and minutes. Handles overnight shifts. Free and 100% client-side.',
  desc: 'Calculate the hours between two times, minus a break, as decimal hours and h:m.',
  keywords: ['hours calculator', 'time duration calculator', 'hours between times', 'work hours calculator', 'hours and minutes calculator', 'shift hours', 'decimal hours', 'calculate hours worked', 'time between two times', 'hours worked'],
  featureList: ['Hours between any two times', 'Subtract a break in minutes', 'Decimal hours and hours plus minutes', 'Handles overnight shifts', 'Total minutes too', '100% client-side'],
  panel: panel.wrap('hr', 'fa-solid fa-calculator', 'Hours calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="hrStart">Start time</label><input id="hrStart"type="time"></div>' +
    '<div class="field"><label for="hrEnd">End time</label><input id="hrEnd"type="time"></div>' +
    '<div class="field"><label for="hrBreak">Break (minutes)</label><input id="hrBreak"type="number"min="0"step="1"value="0"></div>' +
    '</div>' +
    panel.actions('hr', 'Calculate hours') +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Hours and minutes</span><span class="rt-value"id="hrHM">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Decimal hours</span><span class="rt-value"id="hrDec">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Total minutes</span><span class="rt-value"id="hrMin">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: JS_PREFIX + `
    function toMins(v){var a=String(v).split(":");return (+a[0])*60+(+a[1]);}
    function run(){
      var s=$("hrStart").value,e=$("hrEnd").value;
      if(!s||!e){set("hrHM","Enter both times");set("hrDec","");set("hrMin","");return;}
      var a=toMins(s),b=toMins(e);
      if(b<a)b+=1440;
      var brk=parseInt($("hrBreak").value,10);if(isNaN(brk)||brk<0)brk=0;
      var mins=b-a-brk;
      if(mins<0)mins=0;
      set("hrHM",fmtHM(mins));
      set("hrDec",(mins/60).toFixed(2)+" h");
      set("hrMin",mins+" min");
    }
    ["hrStart","hrEnd","hrBreak"].forEach(function(id){$(id).addEventListener("change",run);$(id).addEventListener("input",run);});
    $("hrGo").addEventListener("click",run);
    $("hrSample").addEventListener("click",function(){$("hrStart").value="09:00";$("hrEnd").value="17:30";$("hrBreak").value="30";run();});
    $("hrClear").addEventListener("click",function(){$("hrStart").value="";$("hrEnd").value="";$("hrBreak").value="0";set("hrHM","&ndash;");set("hrDec","&ndash;");set("hrMin","&ndash;");});
    $("hrCopy").addEventListener("click",function(){copyText($("hrHM").textContent+" ("+$("hrDec").textContent+")");});
    run();
  `,
  workflow: ['tools/time/timesheet-calculator.html', 'tools/time/time-duration-calculator.html'],
  article: {
    title: 'Hours Calculator: Time Between Two Clock Times',
    lead: `<p>Working out the hours between a start and a finish is easy until a break, an early finish or an overnight shift gets involved. This <strong>hours calculator</strong> does the subtraction, removes any break you enter and shows the result both as hours and minutes and as a decimal figure.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-calculator', heading: 'From clock times to a duration', html: `<p>The tool converts each time into minutes, subtracts the start from the end and then removes your break. If the end time is earlier than the start, it assumes the shift crossed midnight and adds a full day, so a 22:00 to 06:00 shift reads as eight hours rather than a negative number. Decimal hours come from dividing the total minutes by sixty, which is the figure payroll systems usually want.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Everyday uses', html: `<p>Employees check their own daily hours before submitting a timesheet, managers verify a shift, freelancers bill exact time, and anyone comparing two moments - a workout, a study session, a meeting - gets a clean duration. The decimal figure is handy when you multiply by an hourly rate.</p>` }
    ],
    steps: ['Enter the start time.', 'Enter the end time - overnight shifts are handled automatically.', 'Add any unpaid break in minutes.', 'Press <strong>Calculate hours</strong>.'],
    facts: [['Format', 'Hours and minutes, and decimal'], ['Breaks', 'Subtracted in minutes'], ['Overnight', 'End before start assumes next day'], ['Also shows', 'Total minutes'], ['Data', 'Computed in your browser']],
    useCases: [
      ['Timesheets', 'Work out a day hours figure to record or submit.'],
      ['Shift work', 'Calculate an overnight or early-morning shift correctly.'],
      ['Billing', 'Turn time on task into decimal hours for an invoice.']
    ],
    tips: ['Enter breaks in minutes - 30 means half an hour.', 'For an overnight shift, just enter both times; the tool detects the crossover.', 'Decimal hours are the right figure for multiplying by a rate.'],
    takeaways: ['Clean duration between any two times.', 'Break time removed for you.', 'Overnight shifts handled correctly.'],
    faq: [
      ['How do overnight shifts work?', 'If the end time is earlier than the start, the calculator assumes the shift ran past midnight and adds a day to the end.'],
      ['What is decimal hours?', 'The total minutes divided by sixty, so 7 hours 30 minutes is 7.50 - useful for pay calculations.'],
      ['Can I subtract a lunch break?', 'Yes. Enter the break in minutes and it is removed from the total.'],
      ['Does it handle seconds?', 'Times are entered to the minute, which covers most work and scheduling needs.'],
      ['Is my data uploaded?', 'No. Everything is worked out in your browser.']
    ],
    conclusion: `<p>Add up time without the mental arithmetic. The <strong>hours calculator</strong> gives a clean duration and a decimal figure. To total a whole week, use the <a href="timesheet-calculator.html">timesheet calculator</a>.</p>`
  }
});

/* ========================================================================
   6. TIMESHEET CALCULATOR
   ======================================================================== */
function tsRow(i, day) {
  return '<div class="ts-row"><span class="ts-day">' + day + '</span>' +
    '<input type="time"id="tsStart' + i + '"aria-label="' + day + ' start time">' +
    '<input type="time"id="tsEnd' + i + '"aria-label="' + day + ' end time">' +
    '<input type="number"min="0"step="1"id="tsBreak' + i + '"value="0"aria-label="' + day + ' break minutes">' +
    '<span class="rt-value ts-out"id="tsDay' + i + '">&ndash;</span></div>';
}
add({
  file: 'timesheet-calculator.html', folder: 'time',
  name: 'Timesheet Calculator', tag: 'Payroll', icon: 'fa-solid fa-briefcase',
  title: 'Timesheet Calculator | Weekly Hours & Overtime Totals',
  metaDesc: 'Add up a week of working hours from daily start, end and break times. See daily totals, weekly hours and anything over 40. Free and 100% client-side.',
  desc: 'Add up a week of working hours from daily start, end and break times, with overtime.',
  keywords: ['timesheet calculator', 'weekly hours calculator', 'work hours calculator', 'overtime calculator', 'payroll hours', 'timesheet total', 'hours per week', 'add up work hours', 'work time calculator', 'time card calculator'],
  featureList: ['Seven daily rows with breaks', 'Daily hours shown as you type', 'Weekly total in decimal and h:m', 'Overtime over 40 hours highlighted', 'Handles overnight shifts', '100% client-side'],
  panel: panel.wrap('ts', 'fa-solid fa-briefcase', 'Timesheet calculator',
    '<div class="ts-grid"style="margin-bottom:14px">' +
    '<div class="ts-row ts-head"><span class="ts-day">Day</span><span>Start</span><span>End</span><span>Break</span><span class="ts-out">Hours</span></div>' +
    tsRow(1, 'Mon') + tsRow(2, 'Tue') + tsRow(3, 'Wed') + tsRow(4, 'Thu') + tsRow(5, 'Fri') + tsRow(6, 'Sat') + tsRow(7, 'Sun') +
    '</div>' +
    panel.actions('ts', 'Add up the week') +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Weekly hours</span><span class="rt-value"id="tsHM">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Decimal hours</span><span class="rt-value"id="tsDec">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Over 40 h</span><span class="rt-value"id="tsOt">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Days worked</span><span class="rt-value"id="tsDays">&ndash;</span></div>' +
    '</div></div>'),
  css: '.ts-grid{display:flex;flex-direction:column;gap:8px}.ts-row{display:grid;grid-template-columns:46px 1fr 1fr 76px 78px;gap:8px;align-items:center}.ts-row input{background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:9px;padding:8px 9px;font-family:inherit;font-size:13.5px;width:100%;box-sizing:border-box}.ts-head span{font-size:11.5px;text-transform:uppercase;letter-spacing:.03em;color:var(--muted);font-weight:700}.ts-day{font-weight:700;font-size:12.5px;color:var(--muted)}.ts-out{font-size:13.5px;text-align:right}@media(max-width:560px){.ts-row{grid-template-columns:40px 1fr 1fr 62px 66px;gap:6px}}',
  js: JS_PREFIX + `
    function toMins(v){var a=String(v).split(":");return (+a[0])*60+(+a[1]);}
    function dayMins(i){
      var s=$("tsStart"+i).value,e=$("tsEnd"+i).value;
      if(!s||!e)return -1;
      var a=toMins(s),b=toMins(e);if(b<a)b+=1440;
      var brk=parseInt($("tsBreak"+i).value,10);if(isNaN(brk)||brk<0)brk=0;
      var m=b-a-brk;return m<0?0:m;
    }
    function run(){
      var total=0,days=0;
      for(var i=1;i<=7;i++){
        var m=dayMins(i);
        if(m<0){set("tsDay"+i,"&ndash;");continue;}
        days++;
        total+=m;
        set("tsDay"+i,fmtHM(m));
      }
      set("tsHM",fmtHM(total));
      set("tsDec",(total/60).toFixed(2)+" h");
      var ot=total-2400;
      set("tsOt",ot>0?fmtHM(ot):"None");
      set("tsDays",days+" day"+(days===1?"":"s"));
    }
    var ids=[];
    for(var i=1;i<=7;i++){ids.push("tsStart"+i,"tsEnd"+i,"tsBreak"+i);}
    ids.forEach(function(id){$(id).addEventListener("change",run);$(id).addEventListener("input",run);});
    $("tsGo").addEventListener("click",run);
    $("tsSample").addEventListener("click",function(){for(var i=1;i<=5;i++){$("tsStart"+i).value="09:00";$("tsEnd"+i).value="17:30";$("tsBreak"+i).value="30";}for(var j=6;j<=7;j++){$("tsStart"+j).value="";$("tsEnd"+j).value="";$("tsBreak"+j).value="0";}run();});
    $("tsClear").addEventListener("click",function(){for(var i=1;i<=7;i++){$("tsStart"+i).value="";$("tsEnd"+i).value="";$("tsBreak"+i).value="0";}run();});
    $("tsCopy").addEventListener("click",function(){copyText("Weekly hours: "+$("tsHM").textContent+" ("+$("tsDec").textContent+") | Overtime: "+$("tsOt").textContent);});
    run();
  `,
  workflow: ['tools/time/hours-calculator.html', 'tools/time/time-duration-calculator.html'],
  article: {
    title: 'Timesheet Calculator: Total a Week of Hours in Seconds',
    lead: `<p>Adding up a week row by row is exactly the kind of arithmetic that invites mistakes. This <strong>timesheet calculator</strong> takes a daily start, end and break for each day, shows the hours for that day instantly, and rolls them into a weekly total with any overtime highlighted.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-briefcase', heading: 'Daily rows, one running total', html: `<p>Each row behaves like the single hours calculator: it converts the times to minutes, handles an overnight crossover, and removes the break. Days with no times are skipped, so a part-time week works fine. The weekly total is shown both as hours and minutes and as decimal hours, and anything past forty hours is reported separately as overtime, a figure many US payroll rules use as a threshold.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Where it saves time', html: `<p>Employees can pre-check a timesheet before submitting it, managers can verify a claimed week quickly, and freelancers tracking billable days get a clean total to invoice against. It is also useful for logging study hours, training time or the hours spent on a personal project.</p>` }
    ],
    steps: ['Enter a start, end and break for each day you worked.', 'Watch the daily hours appear as you type.', 'Press <strong>Add up the week</strong> for the totals.'],
    facts: [['Rows', 'Seven days, Monday to Sunday'], ['Daily', 'Start, end and break in minutes'], ['Weekly', 'Shown as h:m and decimal'], ['Overtime', 'Everything above 40 hours'], ['Data', 'Computed in your browser']],
    useCases: [
      ['Payroll checks', 'Confirm the hours a timesheet should total before it is submitted.'],
      ['Freelance invoicing', 'Total billable hours for a week and convert to decimal.'],
      ['Tracking any project', 'Log study, training or side-project hours across a week.']
    ],
    tips: ['Leave a day blank if you did not work it - blank rows are ignored.', 'Breaks are entered in minutes, so a 45-minute lunch is 45.', 'The overtime figure uses a 40-hour weekly threshold.'],
    takeaways: ['A whole week added up automatically.', 'Daily and weekly totals side by side.', 'Overtime above 40 hours called out.'],
    faq: [
      ['How is overtime worked out?', 'Any weekly total above forty hours is shown separately as overtime, using a common 40-hour threshold.'],
      ['Can I leave days empty?', 'Yes. Days with no start or end time are simply skipped in the total.'],
      ['Does it handle night shifts?', 'Yes. If an end time is earlier than its start, that day is treated as crossing midnight.'],
      ['Do breaks need to be in minutes?', 'Yes - enter 30 for a half-hour break, or 0 for no break.'],
      ['Is my timesheet saved anywhere?', 'No. All values stay in your browser and are cleared when you leave the page.']
    ],
    conclusion: `<p>Get the week right the first time. The <strong>timesheet calculator</strong> totals your hours and flags overtime automatically. For a single shift, use the <a href="hours-calculator.html">hours calculator</a>.</p>`
  }
});

/* ========================================================================
   7. PACE CALCULATOR
   ======================================================================== */
add({
  file: 'pace-calculator.html', folder: 'time',
  name: 'Pace Calculator', tag: 'Fitness', icon: 'fa-solid fa-gauge-high',
  title: 'Pace Calculator | Calculate Running Pace and Speed',
  metaDesc: 'Work out your running pace per kilometre or mile, and your speed, from a distance and a finish time. Free, instant and 100% client-side.',
  desc: 'Work out your pace per kilometre or mile, and your speed, from a distance and a time.',
  keywords: ['pace calculator', 'running pace calculator', 'pace per km', 'pace per mile', 'running speed calculator', 'marathon pace', 'min per km', 'race pace', 'jogging pace', 'calculate pace'],
  featureList: ['Pace per kilometre or mile', 'Speed in km/h or mph', 'Enter distance and finish time', 'Shows the equivalent pace in the other unit', 'Instant results', '100% client-side'],
  panel: panel.wrap('pc', 'fa-solid fa-gauge-high', 'Pace calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="pcDist">Distance</label><input id="pcDist"type="number"min="0"step="any"placeholder="10"></div>' +
    '<div class="field"><label for="pcUnit">Units</label><select id="pcUnit"><option value="km">Kilometres</option><option value="mi">Miles</option></select></div>' +
    '<div class="field"><label for="pcH">Hours</label><input id="pcH"type="number"min="0"step="1"value="0"></div>' +
    '</div>' +
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="pcM">Minutes</label><input id="pcM"type="number"min="0"max="59"step="1"placeholder="50"></div>' +
    '<div class="field"><label for="pcS">Seconds</label><input id="pcS"type="number"min="0"max="59"step="1"value="0"></div>' +
    '<div class="field"><label for="pcOther">&nbsp;</label><span class="rt-value"id="pcSummary"style="font-size:13px">&ndash;</span></div>' +
    '</div>' +
    panel.actions('pc', 'Calculate pace') +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Pace</span><span class="rt-value"id="pcPace">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Speed</span><span class="rt-value"id="pcSpeed">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Equivalent pace</span><span class="rt-value"id="pcEquiv"style="font-size:15px">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: JS_PREFIX + `
    function run(){
      var dist=parseFloat($("pcDist").value);
      var h=parseInt($("pcH").value,10)||0,m=parseInt($("pcM").value,10)||0,s=parseInt($("pcS").value,10)||0;
      var secs=h*3600+m*60+s;var unit=$("pcUnit").value;
      if(isNaN(dist)||dist<=0||secs<=0){set("pcPace","Enter distance and time");set("pcSpeed","");set("pcEquiv","");set("pcSummary","&ndash;");return;}
      var pace=secs/dist;
      var pm=Math.floor(pace/60),ps=Math.round(pace%60);
      if(ps===60){pm++;ps=0;}
      var label=unit==="km"?"/km":"/mi";
      set("pcPace",pm+":"+pad2(ps)+" "+label);
      var speed=dist/(secs/3600);
      set("pcSpeed",speed.toFixed(2)+(unit==="km"?" km/h":" mph"));
      var other=unit==="km"?pace*1.609344:pace/1.609344;
      var om=Math.floor(other/60),os=Math.round(other%60);
      if(os===60){om++;os=0;}
      set("pcEquiv",om+":"+pad2(os)+(unit==="km"?" /mi":" /km"));
      set("pcSummary",dist+" "+(unit==="km"?"km":"mi")+" in "+h+"h "+m+"m "+s+"s");
    }
    ["pcDist","pcUnit","pcH","pcM","pcS"].forEach(function(id){$(id).addEventListener("change",run);$(id).addEventListener("input",run);});
    $("pcGo").addEventListener("click",run);
    $("pcSample").addEventListener("click",function(){$("pcDist").value="10";$("pcUnit").value="km";$("pcH").value="0";$("pcM").value="50";$("pcS").value="0";run();});
    $("pcClear").addEventListener("click",function(){$("pcDist").value="";$("pcH").value="0";$("pcM").value="";$("pcS").value="0";set("pcPace","&ndash;");set("pcSpeed","&ndash;");set("pcEquiv","&ndash;");set("pcSummary","&ndash;");});
    $("pcCopy").addEventListener("click",function(){copyText("Pace: "+$("pcPace").textContent+" | Speed: "+$("pcSpeed").textContent);});
    run();
  `,
  workflow: ['tools/time/hours-calculator.html', 'tools/time/time-duration-calculator.html'],
  article: {
    title: 'Pace Calculator: Turn a Time Into a Pace and Speed',
    lead: `<p>Runners, cyclists and swimmers talk in paces even when they think in finish times. This <strong>pace calculator</strong> takes a distance and a time and returns your pace per kilometre or mile, your average speed, and the equivalent pace in the other unit.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-gauge-high', heading: 'Pace, speed and the difference', html: `<p>Pace is time per unit of distance - usually minutes per kilometre or per mile - while speed is distance per unit of time. They are reciprocals, so a faster speed means a smaller pace number. The tool divides your total seconds by the distance for pace, and the distance by the time in hours for speed, then converts across kilometres and miles with the standard 1.609344 factor.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Training with a pace', html: `<p>A pace figure is easier to hold than a finish time because you can check it every kilometre. Runners use it to plan even splits and goal times, cyclists and swimmers use the same idea in their own units, and anyone following a programme can see whether a run was on target. Comparing the equivalent pace across units helps when a plan or a watch reports the other system.</p>` }
    ],
    steps: ['Enter the distance and choose kilometres or miles.', 'Enter the time as hours, minutes and seconds.', 'Press <strong>Calculate pace</strong> for your pace and speed.'],
    facts: [['Pace', 'Minutes per km or per mile'], ['Speed', 'km/h or mph'], ['Conversion', '1 mile = 1.609344 km'], ['Also shows', 'Equivalent pace in the other unit'], ['Data', 'Computed in your browser']],
    useCases: [
      ['Race planning', 'Find the pace needed to hit a goal finish time.'],
      ['Everyday training', 'Check that a session matched the intended pace.'],
      ['Unit conversion', 'See what a min/km pace means in min/mile and vice versa.']
    ],
    tips: ['Enter the full finish time, then read the pace - it is easier than guessing a target pace.', 'Even splits come from holding the pace number steady each kilometre or mile.', 'Use the equivalent pace when a plan is written in the other unit.'],
    takeaways: ['Pace and speed from any distance and time.', 'Automatic unit conversion.', 'A simple way to plan even splits.'],
    faq: [
      ['What is the difference between pace and speed?', 'Pace is time per distance (minutes per km or mile); speed is distance per time (km/h or mph).'],
      ['Can I use miles instead of kilometres?', 'Yes. Choose miles and the pace is given per mile and the speed in mph.'],
      ['How is the equivalent pace calculated?', 'It multiplies or divides by 1.609344, the number of kilometres in a mile.'],
      ['Is this only for runners?', 'No. Cyclists, swimmers and walkers can use the same pace and speed maths.'],
      ['Do you save my times?', 'No. All calculations happen in your browser.']
    ],
    conclusion: `<p>Know your pace before the next session. The <strong>pace calculator</strong> turns distance and time into a pace and speed you can train by. For elapsed time alone, try the <a href="time-duration-calculator.html">time duration calculator</a>.</p>`
  }
});

/* ========================================================================
   8. DATE FORMAT CONVERTER
   ======================================================================== */
add({
  file: 'date-format-converter.html', folder: 'time',
  name: 'Date Format Converter', tag: 'Conversion', icon: 'fa-solid fa-table-cells',
  title: 'Date Format Converter | ISO, RFC, US & Unix Dates',
  metaDesc: 'Convert a date into ISO 8601, RFC 2822, US, European, long and Unix formats at once, ready to copy. Free, instant and 100% client-side.',
  desc: 'Convert a date into ISO, RFC, US, European, long and Unix formats at once.',
  keywords: ['date format converter', 'date converter', 'iso 8601 date', 'rfc 2822 date', 'unix timestamp from date', 'convert date format', 'us to eu date', 'date format changer', 'timestamp converter', 'date formats'],
  featureList: ['ISO 8601 date and datetime', 'RFC 2822 format', 'US and European short dates', 'Long written form', 'Unix timestamp in seconds and milliseconds', '100% client-side'],
  panel: panel.wrap('df', 'fa-solid fa-table-cells', 'Date format converter',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="dfDate">Date</label><input id="dfDate"type="date"></div>' +
    '<div class="field"><label for="dfTime">Time (optional)</label><input id="dfTime"type="time"></div>' +
    '<div class="field"><label for="dfOther">&nbsp;</label><span class="rt-value"id="dfNote"style="font-size:13px">&ndash;</span></div>' +
    '</div>' +
    panel.actions('df', 'Convert the date') +
    '<div class="result-card"><div class="result-grid"id="dfOut"></div></div>'),
  css: '',
  js: JS_PREFIX + `
    function fmt(x){return (x<10?"0":"")+x;}
    function run(){
      var v=$("dfDate").value;
      var out=$("dfOut");
      if(!v){out.innerHTML='<div class="result-tile"><span class="rt-label">Result</span><span class="rt-value">Pick a date</span></div>';set("dfNote","&ndash;");return;}
      var d=pdate(v);var tv=$("dfTime").value;
      var hh=0,mm=0;if(tv){var a=tv.split(":");hh=+a[0];mm=+a[1];d.setHours(hh,mm,0,0);}
      set("dfNote",d.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"})+(tv?" "+fmt(hh)+":"+fmt(mm):""));
      var iso=d.getFullYear()+"-"+fmt(d.getMonth()+1)+"-"+fmt(d.getDate());
      var isoDT=iso+"T"+fmt(hh)+":"+fmt(mm)+":00";
      var us=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
      var eu=fmt(d.getDate())+"/"+fmt(d.getMonth()+1)+"/"+d.getFullYear();
      var long=d.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});
      var rfc=d.toUTCString();
      var unix=Math.floor(d.getTime()/1000);
      var unixMs=d.getTime();
      var fname=iso+"_"+fmt(hh)+"-"+fmt(mm)+"-00";
      var rows=[["ISO 8601 date",iso],["ISO 8601 datetime",isoDT],["RFC 2822 / UTC",rfc],["United States",us],["Europe / UK",eu],["Long form",long],["Unix (seconds)",String(unix)],["Unix (milliseconds)",String(unixMs)],["Filename safe",fname]];
      out.innerHTML=rows.map(function(r){return '<div class="result-tile"><span class="rt-label">'+r[0]+'</span><span class="rt-value"style="font-size:15px">'+r[1].replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</span></div>';}).join("");
    }
    ["dfDate","dfTime"].forEach(function(id){$(id).addEventListener("change",run);$(id).addEventListener("input",run);});
    $("dfGo").addEventListener("click",run);
    $("dfSample").addEventListener("click",function(){var d=new Date();$("dfDate").value=isod(d);$("dfTime").value=fmt(d.getHours())+":"+fmt(d.getMinutes());run();});
    $("dfClear").addEventListener("click",function(){$("dfDate").value="";$("dfTime").value="";run();});
    $("dfCopy").addEventListener("click",function(){var lines=[];$("dfOut").querySelectorAll(".result-tile").forEach(function(t){lines.push(t.querySelector(".rt-label").textContent+": "+t.querySelector(".rt-value").textContent);});copyText(lines.join("\\n"));});
    run();
  `,
  workflow: ['tools/time/unix-timestamp-converter.html', 'tools/time/day-of-week-calculator.html'],
  article: {
    title: 'Date Format Converter: One Date, Every Common Format',
    lead: `<p>The same date looks completely different depending on who is reading it. This <strong>date format converter</strong> takes one date and returns it in ISO 8601, RFC 2822, US, European, long written and Unix forms at the same time, all ready to copy.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-table-cells', heading: 'Why the same day looks so different', html: `<p>ISO 8601 puts the year first, which sorts cleanly and avoids any ambiguity. RFC 2822 is the format used in email headers and is always expressed in UTC. American short dates lead with the month while most of Europe and the UK lead with the day, the single most common source of confusion in spreadsheets. Unix timestamps count the seconds since 1 January 1970, and are what computers store internally.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Picking the right one', html: `<p>Use ISO 8601 in databases, filenames and log lines because it sorts correctly. Use RFC 2822 when you are building or debugging email headers. Use the US or European form when writing to a human audience in that region. Unix timestamps are the right choice when calling an API or storing a moment in code, and the long form is best for prose.</p>` }
    ],
    steps: ['Enter a date, and a time if you need one.', 'Press <strong>Convert the date</strong>.', 'Copy whichever format you need.'],
    facts: [['Includes', 'ISO, RFC 2822, US, EU, long, Unix'], ['Time', 'Optional, included where relevant'], ['Unix', 'Seconds and milliseconds'], ['Bonus', 'Filename-safe version'], ['Data', 'Computed in your browser']],
    useCases: [
      ['Databases and logs', 'Get a sortable ISO 8601 date or timestamp for a record.'],
      ['Email and APIs', 'Produce an RFC 2822 date or a Unix timestamp.'],
      ['Human writing', 'Pick the US or European short date, or the long form, for a document.']
    ],
    tips: ['Prefer ISO 8601 where a date must sort correctly as text.', 'Add a time when you need a Unix timestamp or an RFC date.', 'Use the filename-safe form for backups and exports.'],
    takeaways: ['Nine date formats from one entry.', 'ISO, RFC, regional and Unix covered.', 'All ready to copy without reformatting.'],
    faq: [
      ['Which format should I use for a database?', 'ISO 8601 sorts correctly as plain text, which makes it ideal for databases, logs and filenames.'],
      ['What is RFC 2822?', 'A date format used in email headers and some web standards, always shown in UTC here.'],
      ['Is the Unix timestamp in seconds or milliseconds?', 'Both are shown - seconds for most APIs, milliseconds for JavaScript and some systems.'],
      ['Can I add a time?', 'Yes. Enter a time and it is used in the datetime, RFC and Unix outputs.'],
      ['Is anything uploaded?', 'No. The conversion runs entirely in your browser.']
    ],
    conclusion: `<p>Stop reformatting dates by hand. The <strong>date format converter</strong> gives you every common format at once. To go the other way from a timestamp, try the <a href="unix-timestamp-converter.html">Unix timestamp converter</a>.</p>`
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
    category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file,
    keywords: spec.keywords, recent: true, workflow: spec.workflow
  });
  console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');
}
const res = registerTools(entries);
console.log('registry: added', res.added, 'skipped', res.skipped);
