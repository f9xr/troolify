/* ============================================================================
   Troolify - batch 7
   Text/statistics/marketing tools. Emits standard tool pages and registers
   them in assets/js/tools-data.js.
   Run: node troolify-gen/gen-tools-batch7.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

/* ---------- reusable panel builders ---------- */
function wrap(prefix, icon, label, inner) {
  return '<div class="panel clean ' + prefix + '-panel"><div class="panel-inner">' +
    '<div class="toolbar-row"><span class="tool-label"><i class="' + icon + '"></i>' + label + '</span>' +
    '<div class="toolbar-actions">' +
    '<button class="chip-btn"type="button"id="' + prefix + 'Sample"><i class="fa-solid fa-wand-magic-sparkles"></i><span class="hide-sm">Sample</span></button> ' +
    '<button class="chip-btn"type="button"id="' + prefix + 'Clear"><i class="fa-solid fa-eraser"></i><span class="hide-sm">Clear</span></button>' +
    '</div></div>' + inner +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="' + prefix + 'Proc">Ready - processing happens in this tab.</span></p></div></div>';
}
function ioTwo(prefix, inLab, outLab, inPh, outPh) {
  return '<div class="io-grid two">' +
    '<div class="io-field"><label for="' + prefix + 'In">' + inLab + '</label><textarea id="' + prefix + 'In"spellcheck="false"placeholder="' + inPh + '"></textarea></div>' +
    '<div class="io-field"><label for="' + prefix + 'Out">' + outLab + '</label><textarea id="' + prefix + 'Out"spellcheck="false"readonly placeholder="' + outPh + '"></textarea></div>' +
    '</div>';
}
function actions(prefix, label, extra) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-arrow-right-arrow-left"></i>' + label + '</button> ' +
    '<button class="rt-btn"type="button"id="' + prefix + 'Copy"><i class="fa-solid fa-copy"></i>Copy output</button>' + (extra || '') + '</div>';
}

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }
const copyBtn = 'document.getElementById("PREFIXCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("PREFIXOut").value,function(){document.getElementById("PREFIXProc").textContent="Copied to clipboard."})});';

/* ========================================================================
   1. PARAGRAPH COUNTER
   ======================================================================== */
add({
  file: 'paragraph-counter.html', folder: 'text',
  name: 'Paragraph Counter', tag: 'Text Analysis', icon: 'fa-solid fa-paragraph',
  title: 'Paragraph Counter | Count Paragraphs, Words and Sentences in Text',
  metaDesc: 'Count paragraphs, words, sentences, lines and characters in any text instantly. Paragraphs are detected by blank-line breaks, all in your browser.',
  desc: 'Paste text and instantly see how many paragraphs, words, sentences, lines and characters it contains - paragraphs are recognised by blank-line breaks.',
  keywords: ['paragraph counter', 'count paragraphs', 'paragraph count', 'paragraph counter online', 'count paragraphs in text', 'number of paragraphs', 'word and paragraph counter', 'text paragraph checker', 'paragraph word count', 'paragraph analyzer'],
  featureList: ['Count paragraphs by blank-line breaks', 'Live word, sentence, line and character counts', 'Average words per paragraph', 'Works with pasted or typed text', 'One-click copy', '100% client-side'],
  panel: wrap('pc', 'fa-solid fa-paragraph', 'Paragraph counter',
    '<div class="io-grid"><div class="io-field"><label for="pcIn">Your text</label><textarea id="pcIn"spellcheck="false"placeholder="Paste or type your text here&hellip;"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="pcGrid"></div></div>'),
  css: '.pc-panel textarea{min-height:240px}',
  js: String.raw`
    var inp=document.getElementById("pcIn"),grid=document.getElementById("pcGrid"),proc=document.getElementById("pcProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+val+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function run(){
      var t=performance.now(),v=inp.value,text=v.replace(/\r\n?/g,"\n").trim();
      var paras=text?text.split(/\n\s*\n/).map(function(p){return p.trim();}).filter(function(p){return p.length>0;}):[];
      var words=text?text.split(/\s+/).filter(function(w){return w.length>0;}).length:0;
      var sentences=text?(text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).filter(function(s){return s.trim().length>0;}).length:0;
      var lines=text?text.split("\n").length:0;
      var avg=paras.length?(words/paras.length):0;
      grid.innerHTML=tile("Paragraphs",paras.length)+tile("Words",words)+tile("Sentences",sentences)+tile("Lines",lines)+tile("Characters",v.length)+tile("Avg words / paragraph",avg.toFixed(1));
      proc.textContent="Counted in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("pcSample").addEventListener("click",function(){inp.value="The first paragraph explains the idea in a couple of sentences. It sets the scene.\n\nThe second paragraph develops the point further. It adds detail and an example.\n\nA closing paragraph wraps things up neatly.";run();});
    document.getElementById("pcClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'Paragraph Counter: Measure Your Writing One Block at a Time',
    lead: `<p>A <strong>paragraph counter</strong> answers a simple question that word processors make surprisingly awkward: how many paragraphs is this, really? Paste any text and this tool counts paragraphs, words, sentences, lines and characters at the same time, then shows the average words per paragraph so you can see how evenly your writing is paced.</p><p>Whether you are editing an essay, trimming a web page, or checking a school assignment against a requirement like "five paragraphs", the numbers update as you type.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-gears', heading: 'How paragraphs are counted', html: `<p>A paragraph is a block of text separated from the next block by at least one blank line. That is the convention used by Markdown, most web publishing systems, and the plain-text files this tool is designed for, so the count matches what a careful reader would call a paragraph.</p><p>If your text only uses single line breaks between paragraphs, the tool still counts the words and sentences correctly, but it treats the whole thing as one paragraph because there is no blank line to mark a break. Switching to a real blank line between blocks fixes that instantly.</p>` },
      { id: 'why-it-matters', icon: 'fa-solid fa-ruler', heading: 'Why paragraph length matters', html: `<p>Paragraph length is one of the quiet signals of readable writing. Very long paragraphs tire a reader and hide your structure; very short ones can feel choppy. Knowing your average words per paragraph gives you a fast sanity check - for most online writing, somewhere between 40 and 80 words per paragraph reads comfortably.</p><p>The companion word and sentence counts let you judge pace as well. A paragraph with one very long sentence reads differently from one with four short ones, even when both have the same word count.</p>` }
    ],
    steps: [
      'Paste or type your text into the box. Counting happens as you type.',
      'Read the tiles for paragraphs, words, sentences, lines and characters.',
      'Check <strong>Avg words / paragraph</strong> to see how balanced the blocks are.',
      'Edit and watch the numbers move until the pacing feels right.'
    ],
    facts: [
      ['Paragraph rule', 'Blank line between blocks'],
      ['Counts shown', 'Paragraphs, words, sentences, lines, characters'],
      ['Extra metric', 'Average words per paragraph'],
      ['Updates', 'Live as you type'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Essay and assignment checks', 'Confirm a piece has the required number of paragraphs before you submit, and spot any paragraph that has ballooned far past the others.'],
      ['Editing web copy', 'Web readers skim. Seeing the paragraph count and average length helps you break a wall of text into scannable blocks.'],
      ['Preparing spoken scripts', 'When writing a script or a talk, consistent paragraphs map to consistent beats, which makes delivery easier to time.']
    ],
    tips: [
      'Use a genuine blank line between paragraphs. A single line break reads as a new line to you but as the same paragraph to a parser.',
      'If your average words per paragraph is above about 120, look for the longest block and consider splitting it.',
      'Characters include spaces, so if you need a character count without spaces, subtract the space count from your word list or use a dedicated character counter.'
    ],
    takeaways: [
      'Paragraphs are best detected by blank lines, which this tool does automatically.',
      'Word, sentence, line and character counts come along for free on every paste.',
      'Average words per paragraph is the fastest signal of whether your pacing is even.'
    ],
    faq: [
      ['How does the tool decide what a paragraph is?', 'It splits your text on blank lines. Each non-empty block between blank lines counts as one paragraph, which matches Markdown and most publishing formats.'],
      ['Why does my text show as one paragraph?', 'That usually means you used single line breaks instead of blank lines. Add an empty line between blocks and the count will update.'],
      ['Does it count empty paragraphs?', 'No. Blocks that are empty or only whitespace are ignored, so stray presses of Enter do not inflate the count.'],
      ['Can I count paragraphs and words at the same time?', 'Yes. Every metric is shown together, so you never have to run two tools.'],
      ['Is my text sent to a server?', 'No. All counting runs in JavaScript inside your browser tab. Nothing is uploaded.']
    ],
    conclusion: `<p>A <strong>paragraph counter</strong> is one of those small tools you reach for every time you edit. Paste a draft, watch the paragraph count and average length settle, and you get a clearer picture of pacing in seconds. Pair it with our <a href="word-counter.html">word counter</a> and <a href="sentences-counter.html">sentence counter</a> when you need the full picture of a piece.</p>`
  }
});

/* ========================================================================
   2. DUPLICATE WORD REMOVER
   ======================================================================== */
add({
  file: 'duplicate-word-remover.html', folder: 'text',
  name: 'Duplicate Word Remover', tag: 'Text Cleanup', icon: 'fa-solid fa-clone',
  title: 'Duplicate Word Remover | Remove Repeated Words From Text',
  metaDesc: 'Remove duplicate words from text while keeping the first occurrence and the original spacing. Case-sensitive or case-insensitive matching, in your browser.',
  desc: 'Strip repeated words from any text, keeping the first time each word appears and preserving your original spacing and punctuation.',
  keywords: ['duplicate word remover', 'remove duplicate words', 'repeated words remover', 'delete duplicate words', 'duplicate word remover online', 'remove repeated words from text', 'dedupe words', 'unique words only', 'word deduplicator', 'clean duplicate words'],
  featureList: ['Keep the first occurrence of each word', 'Case-sensitive or case-insensitive matching', 'Preserves spacing and punctuation', 'Live duplicate count', 'One-click copy', '100% client-side'],
  panel: wrap('dwr', 'fa-solid fa-clone', 'Duplicate word remover',
    '<div class="field"style="max-width:340px;margin-bottom:14px"><label for="dwrMode">Matching</label><select id="dwrMode">' +
    '<option value="i">Case-insensitive (The = the)</option>' +
    '<option value="s">Case-sensitive (The &ne; the)</option>' +
    '</select></div>' +
    ioTwo('dwr', 'Original text', 'Text without duplicate words', 'Paste text here&hellip;', 'Cleaned text appears here&hellip;') +
    actions('dwr', 'Remove duplicates')),
  css: '.dwr-panel textarea{min-height:240px}',
  js: String.raw`
    var inp=document.getElementById("dwrIn"),out=document.getElementById("dwrOut"),mode=document.getElementById("dwrMode"),proc=document.getElementById("dwrProc");
    function run(){
      var v=inp.value;
      if(!v){out.value="";proc.textContent="Ready - processing happens in this tab.";return;}
      var t=performance.now();
      var tokens=v.match(/[\w']+|[^\w']+/g)||[];
      var seen={},removed=0,kept=[];
      for(var i=0;i<tokens.length;i++){
        var tk=tokens[i];
        if(/^[\w']+$/.test(tk)){
          var key=mode.value==="i"?tk.toLowerCase():tk;
          if(seen[key]){removed++;continue;}
          seen[key]=1;
        }
        kept.push(tk);
      }
      out.value=kept.join("");
      proc.textContent="Removed "+removed+" duplicate word"+(removed===1?"":"s")+" in "+(performance.now()-t).toFixed(1)+" ms - inside your browser.";
    }
    inp.addEventListener("input",run);mode.addEventListener("change",run);
    document.getElementById("dwrGo").addEventListener("click",run);
    document.getElementById("dwrSample").addEventListener("click",function(){inp.value="The quick brown fox jumps over the lazy dog. The quick fox jumps again and the dog sleeps.";run();});
    document.getElementById("dwrClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus();});
    document.getElementById("dwrCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    run();
  `,
  article: {
    title: 'Duplicate Word Remover: Tidy Text Without Losing the Order',
    lead: `<p>Repeated words creep into drafts when you revise, merge notes, or concatenate lists. This <strong>duplicate word remover</strong> walks through your text word by word, keeps the first appearance of each one, and drops the repeats - while leaving your spacing, punctuation and capitalisation exactly as they were.</p><p>Switch between case-sensitive and case-insensitive matching depending on whether <em>The</em> and <em>the</em> should count as the same word.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-gears', heading: 'What counts as a duplicate', html: `<p>The tool splits your input into words and the separators between them, such as spaces, commas and newlines. Each word is compared against the set already seen. If it has appeared before, it is removed; if not, it is kept and remembered.</p><p>In case-insensitive mode the comparison is done on the lower-cased form, so <code>The</code> and <code>the</code> are treated as one word and only the first survives. In case-sensitive mode they are distinct. Punctuation is untouched, so the sentence still reads naturally after cleaning.</p>` },
      { id: 'when-to-use', icon: 'fa-solid fa-screwdriver-wrench', heading: 'When a duplicate word remover helps', html: `<p>It is handy when you have combined several paragraphs and want a quick unique-word pass, when a data export repeats category labels, or when you are building a vocabulary list and only want each term once. It is a fast first pass, not a replacement for careful proofreading, because removing a deliberately repeated word can change emphasis.</p>` }
    ],
    steps: [
      'Paste the text you want to clean into the left box.',
      'Choose <strong>case-insensitive</strong> if The and the are the same word to you, or <strong>case-sensitive</strong> if they are not.',
      'Read the cleaned text on the right and the duplicate count in the status line.',
      'Use <strong>Copy output</strong> to grab the result.'
    ],
    facts: [
      ['Keeps', 'First occurrence of each word'],
      ['Removes', 'Later repeats'],
      ['Matching', 'Case-sensitive or insensitive'],
      ['Preserves', 'Spacing and punctuation'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Cleaning merged notes', 'When several people contribute to one document, the same terms repeat. A quick pass removes the noise while keeping the sentences readable.'],
      ['Building word lists', 'Producing a unique vocabulary or keyword list from a long block of text becomes a one-step task.'],
      ['Tidying data exports', 'Repeated labels that came out of a spreadsheet are collapsed to a single instance, making the list easier to scan.']
    ],
    tips: [
      'Run it on a copy if repetition is intentional - sometimes a repeated word is emphasis, not a mistake.',
      'Case-insensitive mode is the safer default because it also catches words repeated with different capitalisation.',
      'Check the duplicate count: a surprisingly high number usually means two paragraphs were pasted twice by accident.'
    ],
    takeaways: [
      'The first occurrence is always the one kept, so sentence order is preserved.',
      'Punctuation and spacing survive the cleanup untouched.',
      'Everything runs in your browser, so private text stays private.'
    ],
    faq: [
      ['Which copy of a repeated word is kept?', 'The first one. Every later occurrence of the same word is removed.'],
      ['Does it remove duplicates across the whole document or per sentence?', 'Across the whole document, so a word used in paragraph one is not repeated later on either.'],
      ['What is the difference between the two matching modes?', 'Case-insensitive treats The and the as the same word; case-sensitive treats them as different.'],
      ['Will it change my punctuation?', 'No. Only whole duplicate words are removed; separators such as spaces, commas and line breaks are left as they are.'],
      ['Is my text uploaded?', 'No. The cleanup happens entirely in your browser.']
    ],
    conclusion: `<p>Duplicate words are easy to miss and easy to fix. Run your text through this <strong>duplicate word remover</strong>, check the count, and move on. If you also need to drop repeated whole lines, our <a href="remove-duplicate-lines.html">remove duplicate lines</a> tool does the line-level job.</p>`
  }
});

/* ========================================================================
   3. SYLLABLE COUNTER
   ======================================================================== */
add({
  file: 'syllable-counter.html', folder: 'text',
  name: 'Syllable Counter', tag: 'Text Analysis', icon: 'fa-solid fa-waveform-lines',
  title: 'Syllable Counter | Count Syllables in Words and Text',
  metaDesc: 'Count syllables in any word or block of text with a fast English heuristic. See total syllables, syllables per word and a per-word breakdown.',
  desc: 'Estimate the number of syllables in any text, with a per-word breakdown and an average syllables-per-word figure, all in your browser.',
  keywords: ['syllable counter', 'count syllables', 'syllable counter online', 'syllables in a word', 'how many syllables', 'syllable counter for text', 'syllable dictionary', 'syllable count checker', 'haiku syllable counter', 'syllable analyzer'],
  featureList: ['Count syllables in words and text', 'Per-word syllable breakdown', 'Average syllables per word', 'Handles silent e and common endings', 'Runs instantly', '100% client-side'],
  panel: wrap('syl', 'fa-solid fa-waveform-lines', 'Syllable counter',
    '<div class="io-grid"><div class="io-field"><label for="sylIn">Your text</label><textarea id="sylIn"spellcheck="false"placeholder="Type or paste a word or text&hellip;"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="sylGrid"></div></div>' +
    '<div class="result-card"><div class="rt-label"style="margin-bottom:8px">Per-word breakdown</div><div class="syl-words"id="sylWords"></div></div>'),
  css: '.syl-panel textarea{min-height:180px}.syl-words{display:flex;flex-wrap:wrap;gap:6px}.syl-chip{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:4px 10px;font-size:12.5px;color:var(--muted)}.syl-chip b{color:#93C5FD}',
  js: String.raw`
    var inp=document.getElementById("sylIn"),grid=document.getElementById("sylGrid"),wordsEl=document.getElementById("sylWords"),proc=document.getElementById("sylProc");
    function syllables(w){
      w=w.toLowerCase().replace(/[^a-z]/g,"");
      if(!w)return 0;
      if(w.length<=3)return 1;
      w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,"");
      w=w.replace(/^y/,"");
      var m=w.match(/[aeiouy]{1,2}/g);
      return m?m.length:1;
    }
    function tile(l,val){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+val+'</div></div>';}
    function run(){
      var t=performance.now(),v=inp.value;
      var words=(v.toLowerCase().match(/[a-z']+/g)||[]).filter(function(w){return /[a-z]/.test(w);});
      var total=0,list=[];
      for(var i=0;i<words.length;i++){var n=syllables(words[i]);total+=n;list.push([words[i],n]);}
      var avg=words.length?(total/words.length):0;
      grid.innerHTML=tile("Total syllables",total)+tile("Words",words.length)+tile("Avg syllables / word",avg.toFixed(2))+"<div class='result-tile'><div class='rt-label'>Reading level hint</div><div class='rt-value'>"+(avg>=1.8?"Complex":"Easy")+"</div></div>";
      var html="";
      for(var j=0;j<list.length&&j<400;j++){html+='<span class="syl-chip">'+list[j][0].replace(/</g,"&lt;")+' <b>'+list[j][1]+'</b></span>';}
      wordsEl.innerHTML=html||'<span class="syl-chip">No words yet</span>';
      proc.textContent="Counted in "+(performance.now()-t).toFixed(1)+" ms - heuristic estimate, in your browser.";
    }
    inp.addEventListener("input",run);
    document.getElementById("sylSample").addEventListener("click",function(){inp.value="Troolify makes beautiful writing tools for everyone.";run();});
    document.getElementById("sylClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'Syllable Counter: Understand Rhythm in Words and Text',
    lead: `<p>Syllables are the beats inside words, and counting them is the first step to writing with rhythm. This <strong>syllable counter</strong> estimates the syllable count for every word you type, totals them, and shows a per-word breakdown so you can check the tricky ones.</p><p>It is the fastest way to audit a haiku, tune a tagline, or check the reading level of a paragraph.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-gears', heading: 'How syllables are estimated', html: `<p>The tool uses a well-known English heuristic: count the groups of vowel sounds, then adjust for common patterns. A silent trailing <em>e</em> is dropped, endings like <em>es</em> and <em>ed</em> that do not add a beat are removed, and an initial <em>y</em> is treated as a consonant.</p><p>No simple rule set is perfect for English, because pronunciation depends on stress and dialect. The estimate is accurate for the great majority of everyday words, and the per-word breakdown lets you eyeball the exceptions rather than trust a single total blindly.</p>` },
      { id: 'why', icon: 'fa-solid fa-ruler', heading: 'What syllable counts are good for', html: `<p>Poets count syllables to keep to a form such as haiku or limerick. Copywriters count them to make a slogan land. Teachers use them to explain why a word is divided the way it is. And readability formulas lean on syllables because longer, multi-syllable words are harder to read.</p>` }
    ],
    steps: [
      'Type or paste a word, a line, or a whole passage.',
      'Read the total syllables and the average per word.',
      'Scan the per-word breakdown to spot any word counted unexpectedly.',
      'Adjust the text and watch the numbers update.'
    ],
    facts: [
      ['Method', 'Vowel-group heuristic with silent-e handling'],
      ['Shows', 'Total, per-word counts, average'],
      ['Good for', 'Poetry, slogans, readability'],
      ['Limit', 'English-oriented; dialects vary'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Writing haiku or poetry', 'Keep each line to the syllable pattern a form requires, checking words individually as you draft.'],
      ['Testing a tagline', 'Short, punchy phrases usually have few syllables per word. The average gives you a quick measure of how light a line feels.'],
      ['Teaching phonics', 'Show students how a word breaks into beats and why spelling does not always match pronunciation.']
    ],
    tips: [
      'Names and technical terms are the usual places the heuristic slips; check them against the breakdown.',
      'A rising average syllables-per-word usually means the text is getting harder to read.',
      'Hyphenated compounds may count as their parts; join or split them if your form needs a specific number.'
    ],
    takeaways: [
      'Syllable counts reveal the rhythm that word counts hide.',
      'The per-word list makes it easy to catch the estimates you want to override.',
      'Everything runs in the browser, so nothing is uploaded.'
    ],
    faq: [
      ['How accurate is the syllable count?', 'It is a heuristic estimate that is right for most common English words. Unusual names and loanwords may be off by one, which is why the per-word breakdown is shown.'],
      ['Does it work for other languages?', 'It is tuned for English. Romance languages often follow similar vowel patterns but results vary.'],
      ['Can I count syllables in a single word?', 'Yes. Paste one word and the total shows its syllable count.'],
      ['Why does a word sometimes show one syllable too many or too few?', 'English pronunciation is irregular. The tool applies standard rules; a word that breaks them may be misjudged.'],
      ['Is my text stored anywhere?', 'No. Counting happens locally in your browser.']
    ],
    conclusion: `<p>Once you start counting syllables, rhythm becomes visible. Use this <strong>syllable counter</strong> when you write poetry, slogans, or anything that needs to sound right as well as read right. For overall length, pair it with our <a href="word-counter.html">word counter</a> and <a href="paragraph-counter.html">paragraph counter</a>.</p>`
  }
});

/* ========================================================================
   4. TEXT SPLITTER
   ======================================================================== */
add({
  file: 'text-splitter.html', folder: 'text',
  name: 'Text Splitter', tag: 'Text Cleanup', icon: 'fa-solid fa-scissors',
  title: 'Text Splitter | Split Text by Comma, Line, Space or Custom Delimiter',
  metaDesc: 'Split text into parts by newline, comma, semicolon, whitespace, tab or any custom delimiter. Trim and drop empty parts, then copy the list.',
  desc: 'Break any text into separate pieces by a delimiter of your choice, with options to trim each part and drop empty ones.',
  keywords: ['text splitter', 'split text', 'split text online', 'split by comma', 'split by delimiter', 'split text into lines', 'text to list', 'delimiter splitter', 'split string', 'separate text'],
  featureList: ['Split by newline, comma, semicolon, space, tab', 'Custom delimiter support', 'Trim each part', 'Remove empty parts', 'Part count', '100% client-side'],
  panel: wrap('ts', 'fa-solid fa-scissors', 'Text splitter',
    '<div class="field"style="max-width:340px;margin-bottom:12px"><label for="tsDelim">Split by</label><select id="tsDelim">' +
    '<option value="nl">New line</option><option value="comma">Comma (,)</option><option value="semi">Semicolon (;)</option>' +
    '<option value="pipe">Pipe (|)</option><option value="space">Whitespace</option><option value="tab">Tab</option>' +
    '<option value="custom">Custom delimiter</option></select></div>' +
    '<div class="field"style="max-width:340px;margin-bottom:12px"id="tsCustomWrap"hidden><label for="tsCustom">Custom delimiter</label><input id="tsCustom"type="text"placeholder="e.g. ||"></div>' +
    '<label class="chk"><input type="checkbox"id="tsTrim"checked> Trim each part</label>' +
    '<label class="chk"><input type="checkbox"id="tsEmpty"checked> Remove empty parts</label>' +
    ioTwo('ts', 'Text to split', 'Split parts (one per line)', 'Paste text here&hellip;', 'Parts appear here&hellip;') +
    actions('ts', 'Split text')),
  css: '.ts-panel textarea{min-height:240px}.chk{display:inline-flex;align-items:center;gap:8px;margin:0 16px 12px 0;font-size:13.5px;color:var(--muted)}.chk input{accent-color:var(--accent)}',
  js: String.raw`
    var inp=document.getElementById("tsIn"),out=document.getElementById("tsOut"),delim=document.getElementById("tsDelim"),custom=document.getElementById("tsCustom"),customWrap=document.getElementById("tsCustomWrap"),trimEl=document.getElementById("tsTrim"),emptyEl=document.getElementById("tsEmpty"),proc=document.getElementById("tsProc");
    function toggle(){customWrap.hidden=delim.value!=="custom";}
    function run(){
      var v=inp.value,parts;
      if(!v){out.value="";proc.textContent="Ready - processing happens in this tab.";return;}
      switch(delim.value){
        case "nl":parts=v.split(/\r\n?|\n/);break;
        case "comma":parts=v.split(",");break;
        case "semi":parts=v.split(";");break;
        case "pipe":parts=v.split("|");break;
        case "space":parts=v.split(/\s+/);break;
        case "tab":parts=v.split("\t");break;
        default:parts=v.split(custom.value||",");break;
      }
      if(trimEl.checked)parts=parts.map(function(p){return p.trim();});
      if(emptyEl.checked)parts=parts.filter(function(p){return p.length>0;});
      out.value=parts.join("\n");
      proc.textContent="Split into "+parts.length+" part"+(parts.length===1?"":"s")+" - inside your browser.";
    }
    inp.addEventListener("input",run);delim.addEventListener("change",function(){toggle();run();});custom.addEventListener("input",run);trimEl.addEventListener("change",run);emptyEl.addEventListener("change",run);
    document.getElementById("tsGo").addEventListener("click",run);
    document.getElementById("tsSample").addEventListener("click",function(){inp.value="apples, bananas, cherries, dates";delim.value="comma";toggle();run();});
    document.getElementById("tsClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus();});
    document.getElementById("tsCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    toggle();run();
  `,
  article: {
    title: 'Text Splitter: Turn Any Delimited Text Into a Clean List',
    lead: `<p>Lists arrive glued together more often than not: a comma-separated row from a spreadsheet, a paragraph of tags, or a block of text where each item sits on its own line. This <strong>text splitter</strong> cuts the text into parts on the delimiter you choose, so you get one item per line ready to paste into anything.</p>`,
    sections: [
      { id: 'delimiters', icon: 'fa-solid fa-list', heading: 'Choosing the right delimiter', html: `<p>A delimiter is simply the character or pattern that separates one item from the next. Commas separate CSV fields, semicolons appear in lists that already contain commas, and a newline separates the lines of a column copied from a document. The tool covers the common ones directly and adds a custom option for anything else, from a pipe to a multi-character marker such as <code>::</code>.</p><p>Whitespace splitting is the flexible option: it treats any run of spaces, tabs or line breaks as one separator, which is ideal for text copied out of a PDF where spacing is inconsistent.</p>` },
      { id: 'cleanup', icon: 'fa-solid fa-broom', heading: 'Trimming and removing empty parts', html: `<p>Real text is messy. Splitting <code>a, b,  c,</code> on the comma leaves stray spaces and a trailing empty item. Turning on <strong>Trim each part</strong> removes the leading and trailing whitespace from each piece, and <strong>Remove empty parts</strong> drops the blanks that a trailing delimiter or a double newline would produce. Together they turn ragged input into a tidy list.</p>` }
    ],
    steps: [
      'Paste the text you want to split.',
      'Pick a delimiter, or choose <strong>Custom delimiter</strong> and type your own.',
      'Leave <strong>Trim</strong> and <strong>Remove empty parts</strong> on for the cleanest result.',
      'Copy the one-per-line output and paste it into your target.'
    ],
    facts: [
      ['Built-in delimiters', 'Newline, comma, semicolon, pipe, whitespace, tab'],
      ['Custom', 'Any string you type'],
      ['Cleanup options', 'Trim and remove empty'],
      ['Output', 'One part per line'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Turning CSV into a list', 'Paste a comma-separated row and split on the comma to get one field per line for a form or a query.'],
      ['Splitting tags', 'A paragraph of space-separated keywords becomes a clean list you can paste into a tag field.'],
      ['Breaking up long lines', 'Split on whitespace to rewrap text or count tokens in a quick and dirty way.']
    ],
    tips: [
      'If a part contains the delimiter you chose, switch to a rarer one such as the pipe.',
      'Keep trim on unless the whitespace itself matters to you.',
      'For very large inputs, split on a newline first to avoid creating a single enormous list.'
    ],
    takeaways: [
      'A delimiter turns one blob into a structured list.',
      'Trim and empty-removal fix the small messes real text always has.',
      'Everything is processed in the browser, so nothing is sent anywhere.'
    ],
    faq: [
      ['What is a delimiter?', 'It is the character or pattern that marks where one part ends and the next begins, such as a comma or a newline.'],
      ['Can I split on more than one character?', 'Yes. Choose Custom delimiter and type any string, including a multi-character marker.'],
      ['Does trimming change my content?', 'It only removes whitespace from the start and end of each part. The words themselves are untouched.'],
      ['How do I split text where each item is on its own line?', 'Choose New line and leave Remove empty parts on so blank lines disappear.'],
      ['Is my text uploaded?', 'No. Splitting happens in your browser.']
    ],
    conclusion: `<p>Whether you are untangling a CSV row or turning a paragraph of keywords into a proper list, this <strong>text splitter</strong> gets you a clean, one-per-line result in a click. If you need to remove repeated entries afterwards, our <a href="remove-duplicate-lines.html">remove duplicate lines</a> tool finishes the job.</p>`
  }
});

/* ========================================================================
   5. RANDOM PARAGRAPH GENERATOR
   ======================================================================== */
add({
  file: 'random-paragraph-generator.html', folder: 'text',
  name: 'Random Paragraph Generator', tag: 'Generator', icon: 'fa-solid fa-file-lines',
  title: 'Random Paragraph Generator | Generate Lorem Ipsum Paragraphs',
  metaDesc: 'Generate random lorem ipsum paragraphs by the number of paragraphs and sentences, with an optional Lorem ipsum opening. Copy or regenerate instantly.',
  desc: 'Create placeholder paragraphs made of the classic lorem ipsum vocabulary, choosing how many paragraphs and sentences you need.',
  keywords: ['random paragraph generator', 'lorem ipsum generator', 'random text generator', 'placeholder text', 'paragraph generator', 'dummy text generator', 'random lorem ipsum', 'generate paragraphs', 'filler text', 'sample text generator'],
  featureList: ['Choose number of paragraphs', 'Choose sentences per paragraph', 'Optional Lorem ipsum opening', 'Regenerate instantly', 'One-click copy', '100% client-side'],
  panel: wrap('rp', 'fa-solid fa-file-lines', 'Random paragraph generator',
    '<div class="row3">' +
    '<div class="field"><label for="rpCount">Paragraphs</label><input id="rpCount"type="number"min="1"max="20"value="3"></div>' +
    '<div class="field"><label for="rpSent">Sentences per paragraph</label><input id="rpSent"type="number"min="1"max="12"value="5"></div>' +
    '<div class="field"><label for="rpClassic">Start with Lorem ipsum</label><select id="rpClassic"><option value="1">Yes</option><option value="0">No</option></select></div>' +
    '</div>' +
    '<div class="io-grid"><div class="io-field"><label for="rpOut">Generated paragraphs</label><textarea id="rpOut"spellcheck="false"readonly placeholder="Click Generate to create placeholder paragraphs&hellip;"></textarea></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="rpGo"><i class="fa-solid fa-rotate"></i>Generate</button> ' +
    '<button class="rt-btn"type="button"id="rpCopy"><i class="fa-solid fa-copy"></i>Copy output</button></div>'),
  css: '.rp-panel textarea{min-height:280px}',
  js: String.raw`
    var WORDS=("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum").split(" ");
    var out=document.getElementById("rpOut"),proc=document.getElementById("rpProc");
    function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
    function sentence(){var n=6+Math.floor(Math.random()*10),w=[];for(var i=0;i<n;i++)w.push(WORDS[Math.floor(Math.random()*WORDS.length)]);return cap(w.join(" "))+".";}
    function gen(){
      var pc=Math.max(1,Math.min(20,parseInt(document.getElementById("rpCount").value,10)||1));
      var sc=Math.max(1,Math.min(12,parseInt(document.getElementById("rpSent").value,10)||1));
      var classic=document.getElementById("rpClassic").value==="1";
      var paras=[];
      for(var p=0;p<pc;p++){
        var ss=[];
        for(var s=0;s<sc;s++)ss.push(sentence());
        if(p===0&&classic){var first="Lorem ipsum dolor sit amet, consectetur adipiscing elit.";if(ss.length>1)ss[1]=ss[1];ss[0]=first;}
        paras.push(ss.join(" "));
      }
      out.value=paras.join("\n\n");
      proc.textContent="Generated "+pc+" paragraph"+(pc===1?"":"s")+" - inside your browser.";
    }
    document.getElementById("rpGo").addEventListener("click",gen);
    document.getElementById("rpSample").addEventListener("click",function(){document.getElementById("rpCount").value=2;document.getElementById("rpSent").value=4;gen();});
    document.getElementById("rpClear").addEventListener("click",function(){out.value="";proc.textContent="Cleared.";});
    document.getElementById("rpCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    gen();
  `,
  article: {
    title: 'Random Paragraph Generator: Instant Placeholder Text',
    lead: `<p>Designers and developers need text that looks real without carrying meaning. This <strong>random paragraph generator</strong> produces lorem ipsum paragraphs on demand, so a layout can be judged on its shapes and rhythm rather than its words.</p><p>Set the number of paragraphs and sentences, decide whether to open with the classic line, and regenerate until the block looks right.</p>`,
    sections: [
      { id: 'why-lorem', icon: 'fa-solid fa-font', heading: 'Why lorem ipsum still works', html: `<p>Lorem ipsum is scrambled Latin with a natural-looking distribution of word lengths. That is exactly what you want when testing typography: the text has the rhythm of real prose, so line lengths, orphans and widows behave the way they will with actual copy, but it is nonsense, so nobody anchors on the content while reviewing the design.</p>` },
      { id: 'tips', icon: 'fa-solid fa-lightbulb', heading: 'Getting the block you need', html: `<p>Vary the sentence count to test short and long paragraph behaviour. Turn the classic opening on when you want the familiar first line; turn it off for a block that blends in seamlessly with the paragraphs around it. Regenerate as many times as you like - the text is generated fresh each time from a fixed vocabulary.</p>` }
    ],
    steps: [
      'Set how many paragraphs you need.',
      'Set how many sentences each paragraph should have.',
      'Choose whether the first paragraph opens with <strong>Lorem ipsum</strong>.',
      'Click <strong>Generate</strong>, then copy the result or regenerate.'
    ],
    facts: [
      ['Vocabulary', 'Standard lorem ipsum word list'],
      ['Controls', 'Paragraphs and sentences per paragraph'],
      ['Classic opening', 'Optional'],
      ['Output', 'Plain text paragraphs'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['UI mockups', 'Fill a card or article template with text that has realistic length and rhythm.'],
      ['Typography tests', 'Compare fonts and line heights using text whose word lengths resemble real English.'],
      ['Content placeholders', 'Reserve space in a CMS layout before the real copy is ready.']
    ],
    tips: [
      'Use the real target word count when testing layout, not just a fixed paragraph count.',
      'Keep the classic opening off when the placeholder sits below a real paragraph and should blend in.',
      'Generate two blocks and compare: randomness varies the feel from one click to the next.'
    ],
    takeaways: [
      'Lorem ipsum keeps reviewers focused on design, not content.',
      'Paragraph and sentence counts give you control over the block size.',
      'Everything is generated in the browser, so nothing is uploaded.'
    ],
    faq: [
      ['Is lorem ipsum real Latin?', 'It resembles Latin and derives from a classical text, but it is deliberately scrambled so it reads as meaningless filler.'],
      ['Can I control the number of sentences?', 'Yes. Set sentences per paragraph and the generator respects it for every paragraph.'],
      ['Will the text be the same each time?', 'No. Words are chosen randomly on every generate, so each block is different.'],
      ['Can I use the output commercially?', 'Yes. Lorem ipsum is a placeholder with no copyright concerns, but it is not a substitute for real content.'],
      ['Is any data sent to a server?', 'No. Generation runs entirely in your browser.']
    ],
    conclusion: `<p>When a layout needs text that behaves like the real thing without saying anything, this <strong>random paragraph generator</strong> delivers it in one click. Need just words, or a single sentence? Our <a href="random-word-generator.html">random word generator</a> and <a href="random-sentence-generator.html">random sentence generator</a> cover those.</p>`
  }
});

/* ========================================================================
   6. CONVERSION RATE CALCULATOR
   ======================================================================== */
add({
  file: 'conversion-rate-calculator.html', folder: 'finance',
  name: 'Conversion Rate Calculator', tag: 'Marketing Math', icon: 'fa-solid fa-percent',
  title: 'Conversion Rate Calculator | Calculate Conversion Rate From Visitors',
  metaDesc: 'Calculate conversion rate from visitors and conversions, see one-in-N, and find how many conversions you need to hit a target rate. Runs in your browser.',
  desc: 'Work out your conversion rate from visitors and conversions, express it as one in N, and find the conversions needed to reach a target.',
  keywords: ['conversion rate calculator', 'conversion rate', 'calculate conversion rate', 'cr calculator', 'conversion percentage', 'marketing conversion rate', 'ecommerce conversion rate', 'conversions per visitor', 'target conversion rate', 'conversion rate formula'],
  featureList: ['Conversion rate from visitors and conversions', 'One-in-N equivalent', 'Conversions per 1,000 visitors', 'Target rate to conversions needed', 'Instant recalculation', '100% client-side'],
  panel: wrap('cr', 'fa-solid fa-percent', 'Conversion rate calculator',
    '<div class="row3">' +
    '<div class="field"><label for="crVisit">Visitors</label><input id="crVisit"type="number"min="0"step="1"placeholder="e.g. 5000"></div>' +
    '<div class="field"><label for="crConv">Conversions</label><input id="crConv"type="number"min="0"step="1"placeholder="e.g. 150"></div>' +
    '<div class="field"><label for="crTarget">Target rate (%)</label><input id="crTarget"type="number"min="0"step="0.01"placeholder="e.g. 4"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid"id="crGrid"></div></div>'),
  css: '',
  js: String.raw`
    var vis=document.getElementById("crVisit"),conv=document.getElementById("crConv"),tgt=document.getElementById("crTarget"),grid=document.getElementById("crGrid"),proc=document.getElementById("crProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+val+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function run(){
      var v=parseFloat(vis.value),c=parseFloat(conv.value),t=parseFloat(tgt.value);
      var rate=(v>0)?(c/v*100):0;
      var oneIn=(c>0)?(v/c):0;
      var per1k=(v>0)?(c/v*1000):0;
      var need=(v>0&&t>0)?Math.ceil(v*t/100):NaN;
      grid.innerHTML=
        tile("Conversion rate",(v>0?rate.toFixed(2)+"%":"-"))+
        tile("One in N",(oneIn>0?("1 in "+oneIn.toFixed(1)):"-"))+
        tile("Conversions per 1,000",(v>0?per1k.toFixed(1):"-"))+
        tile("Needed for target",(isFinite(need)?need:"-"),(isFinite(need)?("at "+t+"%"):"enter a target"));
      proc.textContent="Calculated in this tab - nothing leaves your browser.";
    }
    [vis,conv,tgt].forEach(function(el){el.addEventListener("input",run);});
    document.getElementById("crSample").addEventListener("click",function(){vis.value=5000;conv.value=150;tgt.value=4;run();});
    document.getElementById("crClear").addEventListener("click",function(){vis.value="";conv.value="";tgt.value="";run();vis.focus();});
    run();
  `,
  article: {
    title: 'Conversion Rate Calculator: The Number Behind Every Funnel',
    lead: `<p>Conversion rate is the single figure that tells you how well a page, an email or an ad turns interest into action. This <strong>conversion rate calculator</strong> takes your visitors and conversions and returns the rate, a one-in-N reading, the conversions per thousand visitors, and the number of conversions you would need to hit a target.</p>`,
    sections: [
      { id: 'formula', icon: 'fa-solid fa-square-root-variable', heading: 'The conversion rate formula', html: `<p>The maths is simple: divide conversions by visitors, then multiply by 100 to get a percentage. If 150 people out of 5,000 buy, the rate is <code>150 / 5000 x 100 = 3%</code>. Expressing it as one in N - here one in about 33 - often makes the scale more intuitive, because it tells you roughly how many visitors it takes to win a single conversion.</p><p>The target row flips the formula. If you want a 4% rate and you have 5,000 visitors, you need <code>5000 x 0.04 = 200</code> conversions.</p>` },
      { id: 'reading', icon: 'fa-solid fa-chart-line', heading: 'Reading your result', html: `<p>A rate on its own is neither good nor bad; context is everything. A healthy email click-through, a typical ecommerce checkout rate, and a generous newsletter signup rate all sit at different levels. The useful comparison is against your own past performance and a benchmark for your channel and industry.</p><p>The one-in-N figure is the one to quote in meetings, because "we convert one in every thirty-three visitors" sticks in the mind far better than "3.0%".</p>` }
    ],
    steps: [
      'Enter the number of visitors or sessions.',
      'Enter how many of them converted.',
      'Read the rate and the one-in-N equivalent.',
      'Optionally enter a target rate to see the conversions you would need.'
    ],
    facts: [
      ['Formula', 'Conversions / visitors x 100'],
      ['Also shows', 'One in N, conversions per 1,000'],
      ['Target row', 'Conversions needed at a target rate'],
      ['Units', 'Visitors, sessions or impressions'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Ecommerce', 'Check the rate for a product page before and after a redesign to see whether the change moved the needle.'],
      ['Paid ads', 'Compare conversion rate across campaigns to judge which audience actually buys.'],
      ['Email marketing', 'See how the rate shifts between subject lines and calls to action.']
    ],
    tips: [
      'Use the same definition of conversion consistently, or the comparison is meaningless.',
      'Small samples swing wildly. A handful of conversions can produce a rate that will not hold at scale.',
      'Track the one-in-N figure over time; the trend matters more than any single day.'
    ],
    takeaways: [
      'Conversion rate is conversions divided by visitors, times one hundred.',
      'One in N makes the number easier to communicate.',
      'Add a target to see exactly how many conversions the goal demands.'
    ],
    faq: [
      ['What is a good conversion rate?', 'It depends on the channel and industry. Compare against your own history first, and use an industry benchmark only as a rough guide.'],
      ['What counts as a visitor?', 'Whatever you decide: sessions, unique users or impressions. Just keep the definition consistent across comparisons.'],
      ['Can I use this for clicks or opens?', 'Yes. The maths is identical for any numerator and denominator, such as opens over emails sent.'],
      ['Why is one in N useful?', 'It translates an abstract percentage into a tangible number of visitors per conversion, which is easier to act on.'],
      ['Is my data uploaded?', 'No. The calculation runs entirely in your browser.']
    ],
    conclusion: `<p>Conversion rate is the scoreboard of marketing, and this <strong>conversion rate calculator</strong> keeps the score in plain sight. Run your numbers, read the one-in-N figure, then test a change and run them again. Our <a href="../statistics/ab-test-calculator.html">A/B test calculator</a> tells you whether the difference is real.</p>`
  }
});

/* ========================================================================
   7. A/B TEST CALCULATOR
   ======================================================================== */
add({
  file: 'ab-test-calculator.html', folder: 'statistics',
  name: 'A/B Test Calculator', tag: 'Statistics', icon: 'fa-solid fa-flask-vial',
  title: 'A/B Test Calculator | Test Significance of Two Conversion Rates',
  metaDesc: 'Compare two conversion rates from an A/B test. Get uplift, z-score and p-value, and see whether the difference is statistically significant at 95%.',
  desc: 'Compare the conversion rates of two variants, see the relative uplift, and get a z-score and p-value to judge whether the difference is significant.',
  keywords: ['ab test calculator', 'a/b test significance', 'statistical significance calculator', 'split test calculator', 'conversion test', 'z score calculator', 'p value calculator ab test', 'two proportion test', 'significance testing', 'ab test sample size'],
  featureList: ['Compare two conversion rates', 'Relative uplift', 'Two-proportion z-score', 'Two-tailed p-value', '95% significance verdict', '100% client-side'],
  panel: wrap('ab', 'fa-solid fa-flask-vial', 'A/B test calculator',
    '<div class="row3">' +
    '<div class="field"><label for="abVa">Variant A visitors</label><input id="abVa"type="number"min="0"step="1"placeholder="e.g. 1000"></div>' +
    '<div class="field"><label for="abCa">Variant A conversions</label><input id="abCa"type="number"min="0"step="1"placeholder="e.g. 100"></div>' +
    '</div>' +
    '<div class="row3">' +
    '<div class="field"><label for="abVb">Variant B visitors</label><input id="abVb"type="number"min="0"step="1"placeholder="e.g. 1000"></div>' +
    '<div class="field"><label for="abCb">Variant B conversions</label><input id="abCb"type="number"min="0"step="1"placeholder="e.g. 130"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid"id="abGrid"></div></div>'),
  css: '',
  js: String.raw`
    var va=document.getElementById("abVa"),ca=document.getElementById("abCa"),vb=document.getElementById("abVb"),cb=document.getElementById("abCb"),grid=document.getElementById("abGrid"),proc=document.getElementById("abProc");
    function erf(x){var s=x<0?-1:1;x=Math.abs(x);var a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;var t=1/(1+p*x);var y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);return s*y;}
    function cdf(z){return 0.5*(1+erf(z/Math.SQRT2));}
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+val+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function run(){
      var n1=parseFloat(va.value),x1=parseFloat(ca.value),n2=parseFloat(vb.value),x2=parseFloat(cb.value);
      if(!(n1>0&&n2>0)){grid.innerHTML=tile("Waiting","-","enter visitors for both variants");proc.textContent="Ready - processing happens in this tab.";return;}
      var p1=x1/n1,p2=x2/n2;
      var pool=(x1+x2)/(n1+n2);
      var se=Math.sqrt(pool*(1-pool)*(1/n1+1/n2));
      var z=se>0?((p2-p1)/se):0;
      var pval=2*(1-cdf(Math.abs(z)));
      if(pval>1)pval=1;
      var uplift=p1>0?((p2-p1)/p1*100):0;
      var sig=pval<0.05;
      grid.innerHTML=
        tile("Rate A",(p1*100).toFixed(2)+"%")+
        tile("Rate B",(p2*100).toFixed(2)+"%")+
        tile("Relative uplift",(p1>0?(uplift>=0?"+":"")+uplift.toFixed(2)+"%":"-"))+
        tile("z-score",z.toFixed(3))+
        tile("p-value",pval.toFixed(4))+
        tile("Verdict",sig?"Significant":"Not significant",sig?"95% confidence - B differs from A":"difference could be chance");
      proc.textContent="Calculated in this tab - two-tailed two-proportion z-test.";
    }
    [va,ca,vb,cb].forEach(function(el){el.addEventListener("input",run);});
    document.getElementById("abSample").addEventListener("click",function(){va.value=1000;ca.value=100;vb.value=1000;cb.value=130;run();});
    document.getElementById("abClear").addEventListener("click",function(){va.value="";ca.value="";vb.value="";cb.value="";run();va.focus();});
    run();
  `,
  article: {
    title: 'A/B Test Calculator: Was the Difference Real?',
    lead: `<p>Variant B converted better than variant A - but would it again, or did you just get lucky? This <strong>A/B test calculator</strong> compares two conversion rates with a two-proportion z-test and reports the relative uplift, the z-score, a two-tailed p-value, and a plain verdict at 95% confidence.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-gears', heading: 'How significance is judged', html: `<p>Each variant has a conversion rate: conversions over visitors. The test asks whether the gap between those two rates is larger than the random noise you would expect from sampling. It pools the two rates to estimate a common baseline, computes the standard error of the difference, and divides the observed difference by that error to get a z-score.</p><p>From the z-score the tool derives a two-tailed p-value. When the p-value is below 0.05, the difference is called statistically significant at the 95% level, meaning there is less than a one in twenty chance of seeing a gap this big if the two variants were truly identical.</p>` },
      { id: 'caveats', icon: 'fa-solid fa-triangle-exclamation', heading: 'What significance does not tell you', html: `<p>Significance is not the same as importance. A tiny, real difference can be significant with a huge sample, and a large difference can fail to reach significance with a small one. The test also assumes visitors were split randomly and independently, that each visitor is counted once, and that the conversion measure is the same for both groups.</p><p>Decide in advance how long the test will run and what counts as a conversion, then resist the urge to peek and stop the moment you see a winner - that inflates false positives.</p>` }
    ],
    steps: [
      'Enter the visitors and conversions for variant A.',
      'Enter the visitors and conversions for variant B.',
      'Read the two rates and the relative uplift.',
      'Check the p-value and verdict to judge significance.'
    ],
    facts: [
      ['Test used', 'Two-proportion z-test'],
      ['P-value', 'Two-tailed'],
      ['Threshold', '0.05 for 95% confidence'],
      ['Assumes', 'Random, independent assignment'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Landing page tests', 'Compare two headlines or layouts and check whether the lift is real before rolling the winner out.'],
      ['Email subject lines', 'Judge whether a higher open rate from one subject line is meaningful or noise.'],
      ['Pricing and checkout', 'Test a price or button change and avoid acting on a difference that was just chance.']
    ],
    tips: [
      'Do not stop a test the moment it looks significant; that biases the result.',
      'The bigger the effect you want to detect, the smaller the sample you need.',
      'Keep everything except the change under test identical between variants, or you will not know what caused the shift.'
    ],
    takeaways: [
      'A p-value below 0.05 is the conventional bar for significance at 95%.',
      'Significant does not automatically mean important or profitable.',
      'Random, independent assignment is the assumption that makes the test valid.'
    ],
    faq: [
      ['What does the p-value mean?', 'It is the probability of seeing a difference at least as large as the one you observed if the two variants were actually identical. Smaller means stronger evidence of a real difference.'],
      ['What is the z-score?', 'It measures how many standard errors the observed difference is away from zero. Larger magnitudes point to a more certain difference.'],
      ['Is 95% confidence always the right threshold?', 'It is the common default. For higher-stakes decisions a stricter level such as 99% may be appropriate.'],
      ['Can I use this with small samples?', 'The z-test is approximate and least reliable with small counts. With very few conversions, treat the result as a hint rather than proof.'],
      ['Is my data uploaded?', 'No. All calculation happens locally in your browser.']
    ],
    conclusion: `<p>Before you crown a winner, check whether the gap is real. This <strong>A/B test calculator</strong> turns your two rates into a clear verdict. To work out the rates themselves, pair it with our <a href="../finance/conversion-rate-calculator.html">conversion rate calculator</a>.</p>`
  }
});

/* ========================================================================
   8. MARKDOWN TO SLACK CONVERTER
   ======================================================================== */
add({
  file: 'markdown-to-slack-converter.html', folder: 'converters',
  name: 'Markdown to Slack Converter', tag: 'Converter', icon: 'fa-brands fa-slack',
  title: 'Markdown to Slack Converter | Convert Markdown to Slack mrkdwn',
  metaDesc: 'Convert Markdown into Slack mrkdwn: bold, italic, links, lists, quotes and code. Paste Markdown, get Slack-ready text, entirely in your browser.',
  desc: 'Translate Markdown into Slack mrkdwn so bold, italic, links, lists and code render correctly when you paste into Slack.',
  keywords: ['markdown to slack', 'slack mrkdwn converter', 'markdown slack converter', 'slack formatting', 'convert markdown to slack', 'slack markdown', 'mrkdwn', 'slack message formatter', 'markdown to slack mrkdwn', 'slack text formatting'],
  featureList: ['Bold and italic conversion', 'Links to Slack format', 'Headings become bold lines', 'Lists and blockquotes', 'Code and code blocks kept', '100% client-side'],
  panel: wrap('ms', 'fa-brands fa-slack', 'Markdown &rarr; Slack mrkdwn',
    ioTwo('ms', 'Markdown input', 'Slack mrkdwn output', 'Paste Markdown here&hellip;', 'Slack-ready text appears here&hellip;') +
    actions('ms', 'Convert')),
  css: '.ms-panel textarea{min-height:260px}',
  js: String.raw`
    var inp=document.getElementById("msIn"),out=document.getElementById("msOut"),proc=document.getElementById("msProc");
    function inline(t){
      t=t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,"<$2|$1>");
      t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,"<$2|$1>");
      t=t.replace(/\*\*([^*]+)\*\*/g,"*$1*");
      t=t.replace(/__([^_]+)__/g,"*$1*");
      t=t.replace(/~~([^~]+)~~/g,"~$1~");
      t=t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,"$1_$2_");
      t=t.replace(/(^|[^_])_([^_\n]+)_/g,"$1_$2_");
      return t;
    }
    function convert(src){
      var lines=src.replace(/\r\n?/g,"\n").split("\n"),res=[],inCode=false;
      for(var i=0;i<lines.length;i++){
        var ln=lines[i];
        if(/^\s*\x60\x60\x60/.test(ln)){inCode=!inCode;res.push(ln);continue;}
        if(inCode){res.push(ln);continue;}
        var h=ln.match(/^(#{1,6})\s+(.*)$/);
        if(h){res.push("*"+inline(h[2].replace(/\*/g,""))+"*");continue;}
        var ul=ln.match(/^(\s*)[-*+]\s+(.*)$/);
        if(ul){res.push(ul[1]+"- "+inline(ul[2]));continue;}
        var ol=ln.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if(ol){res.push(ol[1]+ol[2]+". "+inline(ol[3]));continue;}
        var bq=ln.match(/^(\s*)>\s?(.*)$/);
        if(bq){res.push(bq[1]+"> "+inline(bq[2]));continue;}
        res.push(inline(ln));
      }
      return res.join("\n");
    }
    function run(){
      if(!inp.value){out.value="";proc.textContent="Ready - processing happens in this tab.";return;}
      var t=performance.now();
      out.value=convert(inp.value);
      proc.textContent="Converted in "+(performance.now()-t).toFixed(1)+" ms - paste into Slack as-is.";
    }
    inp.addEventListener("input",run);
    document.getElementById("msGo").addEventListener("click",run);
    document.getElementById("msSample").addEventListener("click",function(){inp.value="## Release notes\n\n**Version 2.0** is out! See the [changelog](https://example.com/log).\n\n- Faster *search*\n- New ~~sidebar~~ layout\n\n> Update before Friday.";run();});
    document.getElementById("msClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus();});
    document.getElementById("msCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    run();
  `,
  article: {
    title: 'Markdown to Slack Converter: Make Your Formatting Render Everywhere',
    lead: `<p>Markdown is the lingua franca of docs, README files and notes, but Slack has its own dialect called mrkdwn, and the two do not always line up. A double asterisk that means bold in Markdown means bold in Slack too - but a single asterisk means italic in Markdown and bold in Slack, which is a common surprise. This <strong>markdown to Slack converter</strong> translates between them so your message looks the way you intended.</p>`,
    sections: [
      { id: 'differences', icon: 'fa-solid fa-arrows-left-right', heading: 'Where Markdown and Slack differ', html: `<p>The biggest difference is asterisks. In Markdown, <code>**text**</code> is bold and <code>*text*</code> is italic. In Slack mrkdwn, <code>*text*</code> is bold and <code>_text_</code> is italic - there is no double-asterisk syntax. Links differ too: Markdown writes <code>[label](url)</code>, while Slack expects <code>&lt;url|label&gt;</code>.</p><p>Slack has no heading levels. The usual workaround, which this converter applies, is to render a heading as a bold line with its asterisks stripped, so the structure still reads clearly. Lists and blockquotes survive with light adjustment, and code spans and fenced blocks carry over unchanged.</p>` },
      { id: 'uses', icon: 'fa-solid fa-screwdriver-wrench', heading: 'When conversion is worth it', html: `<p>Anyone who keeps release notes, incident reports or documentation in Markdown and then posts them to a Slack channel will recognise the problem: pasted Markdown shows raw asterisks and broken links. Converting first keeps the formatting clean, so the channel gets a readable summary instead of a wall of markup.</p>` }
    ],
    steps: [
      'Paste your Markdown into the left box.',
      'The Slack mrkdwn version appears on the right as you type.',
      'Review that links became <code>&lt;url|label&gt;</code> and headings became bold lines.',
      'Copy the output and paste it straight into a Slack message.'
    ],
    facts: [
      ['Bold', '**text** becomes *text*'],
      ['Italic', '*text* becomes _text_'],
      ['Links', '[label](url) becomes <url|label>'],
      ['Headings', 'Rendered as bold lines'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Release notes', 'Write and review in Markdown, then post a clean version to your team channel.'],
      ['Incident reports', 'Keep the source in a doc and share a formatted summary without manual fixes.'],
      ['Cross-posting docs', 'Move a section of documentation into Slack without it degrading into raw syntax.']
    ],
    tips: [
      'Slack has no heading styles; the bold-line convention is the widely accepted substitute.',
      'Check links after converting, since the label and URL swap order between the two formats.',
      'Fenced code blocks carry over as-is, which is ideal for sharing snippets.'
    ],
    takeaways: [
      'The asterisk meaning flips between Markdown and Slack, which trips up most people.',
      'This converter handles bold, italic, links, headings, lists and quotes.',
      'The output is ready to paste into Slack with no further edits.'
    ],
    faq: [
      ['Why is my bold text showing as italic in Slack?', 'Because single asterisks mean bold in Slack but italic in Markdown. This converter rewrites them so bold stays bold.'],
      ['How are links converted?', 'A Markdown link [label](url) becomes Slack syntax <url|label>, which Slack renders as a clickable link.'],
      ['Does Slack support headings?', 'Not as styled headings. The converter emits a bold line, the standard workaround, so structure is still visible.'],
      ['Are code blocks preserved?', 'Yes. Fenced code blocks and inline code are passed through unchanged.'],
      ['Is my text uploaded?', 'No. Conversion runs entirely in your browser.']
    ],
    conclusion: `<p>Stop pasting raw asterisks into Slack. Run your Markdown through this <strong>markdown to Slack converter</strong> and post something that actually looks formatted. For other destinations, our <a href="../coding/markdown-to-html.html">Markdown to HTML</a> and <a href="markdown-to-word-converter.html">Markdown to Word</a> tools have you covered.</p>`
  }
});

/* ========================================================================
   9. UTM BUILDER
   ======================================================================== */
add({
  file: 'utm-builder.html', folder: 'seo',
  name: 'UTM Builder', tag: 'Marketing', icon: 'fa-solid fa-link',
  title: 'UTM Builder | Create Trackable Campaign URLs With UTM Parameters',
  metaDesc: 'Build UTM-tagged campaign URLs for Google Analytics. Enter source, medium and campaign, get a clean trackable link with correct URL encoding.',
  desc: 'Build a correctly encoded, UTM-tagged campaign URL by filling in the source, medium, campaign and optional term and content.',
  keywords: ['utm builder', 'utm link builder', 'campaign url builder', 'google analytics utm', 'utm parameters', 'trackable link generator', 'utm generator', 'url builder utm', 'marketing campaign url', 'utm tags'],
  featureList: ['Five standard UTM parameters', 'Automatic URL encoding', 'Preserves existing query strings', 'Live preview of the final URL', 'One-click copy', '100% client-side'],
  panel: wrap('utm', 'fa-solid fa-link', 'UTM campaign URL builder',
    '<div class="row3">' +
    '<div class="field"><label for="utmUrl">Website URL</label><input id="utmUrl"type="url"placeholder="https://example.com/landing"></div>' +
    '<div class="field"><label for="utmSource">Campaign source *</label><input id="utmSource"type="text"placeholder="google, newsletter"></div>' +
    '<div class="field"><label for="utmMedium">Campaign medium *</label><input id="utmMedium"type="text"placeholder="cpc, email"></div>' +
    '</div>' +
    '<div class="row3">' +
    '<div class="field"><label for="utmCampaign">Campaign name *</label><input id="utmCampaign"type="text"placeholder="spring_sale"></div>' +
    '<div class="field"><label for="utmTerm">Campaign term</label><input id="utmTerm"type="text"placeholder="running shoes"></div>' +
    '<div class="field"><label for="utmContent">Campaign content</label><input id="utmContent"type="text"placeholder="banner_a"></div>' +
    '</div>' +
    '<div class="io-grid"><div class="io-field"><label for="utmOut">Generated URL</label><textarea id="utmOut"spellcheck="false"readonly placeholder="Your tagged URL appears here&hellip;"></textarea></div></div>' +
    '<div class="actions"><button class="rt-btn"type="button"id="utmCopy"><i class="fa-solid fa-copy"></i>Copy URL</button></div>'),
  css: '.utm-panel textarea{min-height:120px}',
  js: String.raw`
    var url=document.getElementById("utmUrl"),src=document.getElementById("utmSource"),med=document.getElementById("utmMedium"),cmp=document.getElementById("utmCampaign"),term=document.getElementById("utmTerm"),cont=document.getElementById("utmContent"),out=document.getElementById("utmOut"),proc=document.getElementById("utmProc");
    function run(){
      var u=url.value.trim();
      if(!u){out.value="";proc.textContent="Enter a website URL and campaign details to build your link.";return;}
      var params=[["utm_source",src.value.trim()],["utm_medium",med.value.trim()],["utm_campaign",cmp.value.trim()],["utm_term",term.value.trim()],["utm_content",cont.value.trim()]].filter(function(p){return p[1];});
      if(!params.length){out.value=u;proc.textContent="Add at least a source, medium or campaign to tag the link.";return;}
      var base=u,q="",hash="";
      var hi=base.indexOf("#");
      if(hi>-1){hash=base.slice(hi);base=base.slice(0,hi);}
      var qi=base.indexOf("?");
      if(qi>-1){q=base.slice(qi+1);base=base.slice(0,qi);}
      var parts=q?q.split("&"):[];
      for(var i=0;i<params.length;i++)parts.push(encodeURIComponent(params[i][0])+"="+encodeURIComponent(params[i][1]));
      out.value=base+"?"+parts.join("&")+hash;
      proc.textContent="Built "+params.length+" UTM parameter"+(params.length===1?"":"s")+" - inside your browser.";
    }
    [url,src,med,cmp,term,cont].forEach(function(el){el.addEventListener("input",run);});
    document.getElementById("utmSample").addEventListener("click",function(){url.value="https://example.com/spring-sale";src.value="newsletter";med.value="email";cmp.value="spring_sale";term.value="";cont.value="header_cta";run();});
    document.getElementById("utmClear").addEventListener("click",function(){[url,src,med,cmp,term,cont].forEach(function(el){el.value="";});out.value="";proc.textContent="Cleared.";url.focus();});
    document.getElementById("utmCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="URL copied to clipboard."})});
    run();
  `,
  article: {
    title: 'UTM Builder: Tag Every Campaign Link the Right Way',
    lead: `<p>When ten links point at the same page, only the tagged ones know where their traffic came from. This <strong>UTM builder</strong> assembles a clean campaign URL from the five standard parameters - source, medium, campaign, term and content - and encodes everything correctly so analytics tools read it without complaint.</p>`,
    sections: [
      { id: 'parameters', icon: 'fa-solid fa-tags', heading: 'The five UTM parameters', html: `<p><strong>utm_source</strong> names where the traffic comes from, such as google, facebook or newsletter. <strong>utm_medium</strong> names the channel, such as cpc, email or social. <strong>utm_campaign</strong> names the specific campaign, such as spring_sale. The optional <strong>utm_term</strong> identifies a paid keyword, and <strong>utm_content</strong> distinguishes two links within the same campaign, such as banner_a versus banner_b.</p><p>Source, medium and campaign are the minimum for useful reporting. Without a consistent medium, traffic from the same campaign can scatter across several rows in your analytics.</p>` },
      { id: 'good-hygiene', icon: 'fa-solid fa-broom', heading: 'Parameters are case-sensitive', html: `<p>Analytics treats <code>Facebook</code> and <code>facebook</code> as different sources, and <code>Email</code> and <code>email</code> as different mediums. Pick a convention, usually all lowercase, and stick to it religiously; a single capital letter can split a report in two. The convention of underscores instead of spaces also keeps URLs clean and readable.</p><p>This builder encodes each value, so spaces and special characters survive the trip intact, and it appends your parameters to any that already exist on the URL rather than overwriting them.</p>` }
    ],
    steps: [
      'Paste the destination page URL.',
      'Fill in source, medium and campaign - the three required tags.',
      'Optionally add term and content for finer tracking.',
      'Copy the generated URL and use it in your campaign.'
    ],
    facts: [
      ['Required tags', 'source, medium, campaign'],
      ['Optional tags', 'term, content'],
      ['Case', 'Parameters are case-sensitive'],
      ['Encoding', 'Values URL-encoded automatically'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Email campaigns', 'Tag every link with the newsletter name and the medium email to attribute signups accurately.'],
      ['Paid social', 'Distinguish platforms and creative variations with source, medium and content.'],
      ['Partner links', 'Hand a tagged URL to a partner so their referral traffic appears as its own source.']
    ],
    tips: [
      'Lowercase everything. Mixed case splits the same campaign across multiple report rows.',
      'Use underscores instead of spaces to keep URLs tidy and readable.',
      'Do not tag internal links between your own pages; UTM parameters overwrite the original source and break session attribution.'
    ],
    takeaways: [
      'Source, medium and campaign are the essential tags.',
      'Analytics is case-sensitive, so consistency is everything.',
      'A correctly encoded URL is the difference between clean and unusable reports.'
    ],
    faq: [
      ['Which UTM parameters are required?', 'At minimum source, medium and campaign, so the traffic can be grouped meaningfully.'],
      ['Are UTM parameters case-sensitive?', 'Yes. Treat facebook and Facebook as two different sources unless you normalise case.'],
      ['Can I add UTM parameters to a URL that already has a query string?', 'Yes. This builder appends the parameters rather than replacing what is already there.'],
      ['Should I use UTM tags on internal links?', 'No. They overwrite the original source and can corrupt your attribution data.'],
      ['Is anything sent to a server?', 'No. The URL is assembled locally in your browser.']
    ],
    conclusion: `<p>Tag once, track forever. This <strong>UTM builder</strong> gives you a clean, correctly encoded campaign URL every time, so your analytics stay tidy. Pair it with our <a href="../finance/conversion-rate-calculator.html">conversion rate calculator</a> to measure how well the campaign actually performs.</p>`
  }
});

/* ========================================================================
   10. MARKDOWN EDITOR
   ======================================================================== */
add({
  file: 'markdown-editor.html', folder: 'text',
  name: 'Markdown Editor', tag: 'Editor', icon: 'fa-brands fa-markdown',
  title: 'Markdown Editor | Live Markdown Preview Online',
  metaDesc: 'Write Markdown with a live HTML preview side by side. Supports headings, bold, italic, links, lists, quotes and code blocks, all in your browser.',
  desc: 'Write Markdown on the left and watch a live HTML preview on the right, with headings, lists, links, quotes and code rendered as you type.',
  keywords: ['markdown editor', 'markdown preview', 'online markdown editor', 'live markdown', 'markdown to html preview', 'markdown viewer', 'write markdown online', 'markdown notepad', 'markdown renderer', 'md editor'],
  featureList: ['Live side-by-side preview', 'Headings, bold and italic', 'Links and images', 'Lists and blockquotes', 'Fenced code blocks', '100% client-side'],
  panel: wrap('md', 'fa-brands fa-markdown', 'Markdown editor',
    '<div class="md-editor">' +
    '<div class="io-field"><label for="mdIn">Markdown</label><textarea id="mdIn"spellcheck="false"placeholder="# Start writing Markdown&hellip;"></textarea></div>' +
    '<div class="io-field"><label>Preview</label><div class="md-preview"id="mdOut"></div></div>' +
    '</div>' +
    '<div class="actions"><button class="rt-btn"type="button"id="mdCopy"><i class="fa-solid fa-copy"></i>Copy HTML</button></div>'),
  css: '.md-editor{display:grid;grid-template-columns:1fr;gap:14px}@media(min-width:900px){.md-editor{grid-template-columns:1fr 1fr}}.md-editor textarea{min-height:420px}.md-preview{background:#1B2028;border:1px solid var(--border);border-radius:12px;padding:16px;min-height:420px;max-height:560px;overflow:auto;color:var(--ink);font-size:14.5px;line-height:1.65}.md-preview h1,.md-preview h2,.md-preview h3,.md-preview h4{color:var(--ink);margin:.6em 0 .4em}.md-preview h1{font-size:1.7em;border-bottom:1px solid var(--border);padding-bottom:.2em}.md-preview h2{font-size:1.4em}.md-preview code{background:rgba(255,255,255,.08);padding:2px 5px;border-radius:4px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9em}.md-preview pre{background:#14181E;border:1px solid var(--border);border-radius:8px;padding:12px;overflow:auto}.md-preview pre code{background:none;padding:0}.md-preview blockquote{border-left:3px solid var(--accent);margin:.6em 0;padding:.2em 0 .2em 12px;color:var(--muted)}.md-preview a{color:var(--accent-light)}.md-preview ul,.md-preview ol{margin:.4em 0 .4em 1.2em}.md-preview img{max-width:100%}',
  js: String.raw`
    var inp=document.getElementById("mdIn"),out=document.getElementById("mdOut"),proc=document.getElementById("mdProc");
    function esc(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
    function inline(t){
      t=esc(t);
      t=t.replace(/\x60([^\x60]+)\x60/g,"<code>$1</code>");
      t=t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,'<img alt="$1" src="$2">');
      t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
      t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
      t=t.replace(/__([^_]+)__/g,"<strong>$1</strong>");
      t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>");
      t=t.replace(/(^|[^_])_([^_\n]+)_/g,"$1<em>$2</em>");
      t=t.replace(/~~([^~]+)~~/g,"<del>$1</del>");
      return t;
    }
    function render(src){
      var lines=src.replace(/\r\n?/g,"\n").split("\n"),res=[],inCode=false,code=[],list=null;
      function closeList(){if(list){res.push("</"+list+">");list=null;}}
      for(var i=0;i<lines.length;i++){
        var ln=lines[i];
        if(/^\s*\x60\x60\x60/.test(ln)){if(inCode){res.push("<pre><code>"+esc(code.join("\n"))+"</code></pre>");code=[];inCode=false;}else{closeList();inCode=true;}continue;}
        if(inCode){code.push(ln);continue;}
        if(/^\s*$/.test(ln)){closeList();continue;}
        var h=ln.match(/^(#{1,6})\s+(.*)$/);
        if(h){closeList();var n=h[1].length;res.push("<h"+n+">"+inline(h[2])+"</h"+n+">");continue;}
        if(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(ln)){closeList();res.push("<hr>");continue;}
        if(/^\s*>\s?/.test(ln)){closeList();res.push("<blockquote>"+inline(ln.replace(/^\s*>\s?/,""))+"</blockquote>");continue;}
        var ul=ln.match(/^\s*[-*+]\s+(.*)$/);
        if(ul){if(list!=="ul"){closeList();res.push("<ul>");list="ul";}res.push("<li>"+inline(ul[1])+"</li>");continue;}
        var ol=ln.match(/^\s*\d+\.\s+(.*)$/);
        if(ol){if(list!=="ol"){closeList();res.push("<ol>");list="ol";}res.push("<li>"+inline(ol[1])+"</li>");continue;}
        closeList();
        res.push("<p>"+inline(ln)+"</p>");
      }
      if(inCode)res.push("<pre><code>"+esc(code.join("\n"))+"</code></pre>");
      closeList();
      return res.join("\n");
    }
    function run(){
      var t=performance.now();
      out.innerHTML=render(inp.value);
      proc.textContent="Rendered in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("mdSample").addEventListener("click",function(){inp.value="# Markdown Editor\n\nWrite on the left, **preview** on the right.\n\n## Features\n\n- *Live* rendering\n- [Links](https://example.com) and images\n- \x60inline code\x60\n\n> Blockquotes work too.\n\n\x60\x60\x60\nconst hello = \"world\";\n\x60\x60\x60";run();});
    document.getElementById("mdClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    document.getElementById("mdCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.innerHTML,function(){proc.textContent="HTML copied to clipboard."})});
    run();
  `,
  article: {
    title: 'Markdown Editor: Write and Preview Markdown Side by Side',
    lead: `<p>Markdown is quick to type but hard to read until it renders. This <strong>markdown editor</strong> shows your source on the left and a live HTML preview on the right, so you see exactly how headings, emphasis, links, lists and code blocks will look the moment you type them.</p>`,
    sections: [
      { id: 'supported', icon: 'fa-solid fa-list-check', heading: 'What the editor supports', html: `<p>The preview covers the Markdown you reach for every day: headings from level one to six, bold with double asterisks or underscores, italic with single asterisks or underscores, strikethrough, inline code, fenced code blocks, links, images, unordered and ordered lists, blockquotes, and horizontal rules.</p><p>Parsing happens as you type, which makes it easy to catch a missing bracket or a stray asterisk before you publish. When you are happy with the result, copy the generated HTML with one click.</p>` },
      { id: 'why', icon: 'fa-solid fa-screwdriver-wrench', heading: 'Why a live preview helps', html: `<p>Markdown's syntax overlaps in ways that hide mistakes. A single asterisk is italic and a double asterisk is bold, so one extra character silently changes meaning. A link written with a bracket in the wrong place renders as plain text. Seeing the output beside the source turns those subtle slips into obvious ones instantly.</p>` }
    ],
    steps: [
      'Type or paste Markdown into the left pane.',
      'Watch the HTML preview update on the right as you write.',
      'Fix any formatting that does not render as intended.',
      'Click <strong>Copy HTML</strong> to take the rendered markup with you.'
    ],
    facts: [
      ['Preview', 'Live, as you type'],
      ['Supports', 'Headings, emphasis, links, lists, quotes, code'],
      ['Output', 'Rendered HTML, copyable'],
      ['Layout', 'Two panes side by side'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Drafting README files', 'Check how headings and code blocks will render on a repository page before committing.'],
      ['Writing documentation', 'Compose a page and confirm the structure reads well without leaving the browser.'],
      ['Preparing posts', 'Write in Markdown and copy the HTML into a CMS or email that expects markup.']
    ],
    tips: [
      'Leave a blank line before a list or a blockquote, or it may be treated as plain text.',
      'Use a fenced block for multi-line code; a single backtick pair is for short inline snippets.',
      'Preview is not a full CommonMark implementation, so unusual extensions may render differently elsewhere.'
    ],
    takeaways: [
      'A side-by-side preview catches formatting mistakes as you make them.',
      'The editor renders the everyday Markdown syntax you actually use.',
      'Copy the HTML output straight into any system that wants markup.'
    ],
    faq: [
      ['Does the editor support code blocks?', 'Yes. Triple-backtick fenced blocks render as preformatted code, and inline code uses single backticks.'],
      ['Can I copy the HTML output?', 'Yes. The Copy HTML button places the rendered markup on your clipboard.'],
      ['Is it a complete Markdown implementation?', 'It supports the common syntax. Rare extensions and footnotes may not render as they would in a full parser.'],
      ['Does it save my work?', 'No. Nothing is stored or uploaded; keep your own copy if you need to return to it.'],
      ['Is it free and private?', 'Yes. It runs entirely in your browser with no data sent anywhere.']
    ],
    conclusion: `<p>Write Markdown with confidence when you can see the result as you go. This <strong>markdown editor</strong> keeps source and preview side by side, so what you publish is exactly what you intended. When you need to send the result elsewhere, try our <a href="../coding/markdown-to-html.html">Markdown to HTML</a> or <a href="../converters/markdown-to-slack-converter.html">Markdown to Slack</a> converters.</p>`
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
