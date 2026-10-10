/* ============================================================================
   Troolify - it-tools migration, batch 2
   Text helpers + generators + math/time/dev tools.
   Run: node troolify-gen/gen-tools-batch2.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ========================================================================
   1. LIST CONVERTER
   ======================================================================== */
add({
  file: 'list-converter.html', folder: 'text',
  name: 'List Converter', tag: 'Formatter', icon: 'fa-solid fa-list-ul',
  title: 'List Converter | Reformat, Quote & Sort Any List',
  metaDesc: 'Convert a list between one-per-line, comma-separated and quoted formats. Sort, dedupe and add prefixes or suffixes instantly in your browser.',
  desc: 'Reformat any list: swap separators, wrap items in quotes, add prefixes and suffixes, sort and dedupe - all in this tab.',
  keywords: ['list converter', 'list formatter', 'comma separated list', 'one per line', 'quote list items', 'sort list', 'dedupe list', 'prefix suffix', 'cra list converter', 'format list'],
  featureList: ['Swap list separators', 'Wrap items in quotes', 'Add prefix/suffix text', 'Sort A to Z or Z to A', 'Remove empty lines and duplicates', '100% client-side'],
  panel: panel.wrap('lc', 'fa-solid fa-list-ul', 'List formatter',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="lcStyle">Output style</label><select id="lcStyle"><option value="line">One item per line</option><option value="comma">Comma separated</option><option value="semi">Semicolon separated</option><option value="pipe">Pipe separated</option></select></div>' +
    '<div class="field"><label for="lcSort">Sort</label><select id="lcSort"><option value="none">Keep order</option><option value="asc">A to Z</option><option value="desc">Z to A</option></select></div>' +
    '<div class="field"><label for="lcQuote">Wrap item in</label><select id="lcQuote"><option value="">No quotes</option><option value="&quot;">Double quotes</option><option value="&#39;">Single quotes</option></select></div>' +
    '</div>' +
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="lcPrefix">Prefix per item</label><input id="lcPrefix"type="text"placeholder="e.g. - "></div>' +
    '<div class="field"><label for="lcSuffix">Suffix per item</label><input id="lcSuffix"type="text"placeholder="e.g. ;"></div>' +
    '<div class="field"><label for="lcTrim">Cleanup</label><select id="lcTrim"><option value="trim">Trim and drop empty lines</option><option value="keep">Keep as typed</option></select></div>' +
    '</div>' +
    panel.ioTwo('lc', 'Input list', 'Formatted list', 'One item per line or comma separated&hellip;', 'Formatted list appears here&hellip;') +
    '<div class="actions"><button class="rt-btn"type="button"id="lcUnique"><i class="fa-solid fa-copy"></i>Remove duplicates</button>' +
    '<button class="rt-btn"type="button"id="lcCopy"><i class="fa-solid fa-copy"></i>Copy output</button></div>'),
  css: '.lc-panel textarea{min-height:200px}',
  js: `
    var inp=document.getElementById("lcIn"),out=document.getElementById("lcOut"),proc=document.getElementById("lcProc");
    function items(){var v=inp.value;
      if(/\\n/.test(v))return v.split(/\\r?\\n/);
      var sep=v.indexOf(";")>=0?";":v.indexOf("|")>=0?"|":",";
      return v.split(sep);
    }
    function run(){var list=items();
      if(document.getElementById("lcTrim").value==="trim")list=list.map(function(s){return s.trim()}).filter(Boolean);
      var u=document.getElementById("lcUnique").dataset.on==="1";
      if(u){var seen={},out2=[];list.forEach(function(s){if(!seen[s]){seen[s]=1;out2.push(s)}});list=out2;}
      var sort=document.getElementById("lcSort").value;
      if(sort==="asc")list=list.slice().sort(function(a,b){return a.localeCompare(b)});
      if(sort==="desc")list=list.slice().sort(function(a,b){return b.localeCompare(a)});
      var q=document.getElementById("lcQuote").value,p=document.getElementById("lcPrefix").value,sx=document.getElementById("lcSuffix").value;
      list=list.map(function(s){return p+q+s+q+sx});
      var style=document.getElementById("lcStyle").value;
      var sepCn=style==="line"?"\\n":style==="comma"?", ":style==="semi"?"; ":" | ";
      out.value=list.join(sepCn);
      proc.textContent=list.length+" item(s) - processed inside your browser.";}
    inp.addEventListener("input",run);
    ["lcStyle","lcSort","lcQuote","lcTrim","lcPrefix","lcSuffix"].forEach(function(id){document.getElementById(id).addEventListener("input",run);document.getElementById(id).addEventListener("change",run);});
    document.getElementById("lcUnique").addEventListener("click",function(){var b=this;b.dataset.on=b.dataset.on==="1"?"0":"1";b.classList.toggle("active");run();});
    document.getElementById("lcCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("lcSample").addEventListener("click",function(){inp.value="Apple\\nBanana\\napple\\nCherry\\n";run()});
    document.getElementById("lcClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared."});
  `,
  article: {
    title: 'List Converter: Turn Any List Into the Format Your Workflow Needs',
    lead: '<p>Every app has its own favourite way of grouping items. One takes comma separated values, another wants one item per line, and a third insists on quoted and quoted and separated by pipes. This <strong>list converter</strong> reshapes your list in a single paste.</p><p>Wrap items in quotes, add a prefix or suffix to every line, sort the result, and drop empty lines or duplicates along the way.</p>',
    sections: [
      { id: 'what-it-does', icon: 'fa-solid fa-arrows-rotate', heading: 'What the converter can reshape', html: '<p>The input accepts items split by new lines, commas, semicolons, or pipes, and it detects the separator automatically. From there you choose the output shape: one item per line, or items joined by commas, semicolons, or pipes. Every item can be wrapped in single or double quotes and given an optional prefix and suffix, which is handy when you are building <code>INSERT</code> statements, bullet lists, or array literals.</p>' },
      { id: 'cleanup', icon: 'fa-solid fa-broom', heading: 'Built-in cleanup steps', html: '<p>Dirty import lists are the norm rather than the exception. The converter trims stray whitespace, removes blank lines, and can drop duplicates while keeping the first occurrence. Sorting works case-insensitively in both directions, so a messy export becomes a tidy reference list without manual fiddling.</p>' }
    ],
    steps: [
      'Paste your list into the left box. It may use new lines, commas, semicolons, or pipes.',
      'Pick the output style, quoting, sorting, and any prefix or suffix.',
      'Toggle <strong>Remove duplicates</strong> if you want a unique set.',
      'The result updates live on the right. Copy it when it looks right.'
    ],
    facts: [
      ['Separators detected', 'New lines, commas, semicolons, pipes'],
      ['Output styles', 'Line, comma, semicolon, pipe'],
      ['Quoting', 'Single, double, or none'],
      ['Sorting', 'A-Z, Z-A, or keep order'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Pasting into spreadsheets', 'Many spreadsheet apps accept comma or semicolon separated pastes. Converting your list first avoids mangled columns.'],
      ['Building queries and code', 'A quoted, comma separated list drops straight into a SQL IN clause or a JavaScript array literal.'],
      ['Cleaning exports', 'Contact lists and CMS tags often arrive with duplicates and blank lines; dedupe and sort in one pass.']
    ],
    tips: [
      'Leave cleanup on "trim and drop empty lines" for most imports, since blank lines are almost never intentional.',
      'Use single quotes when generating JavaScript or SQL strings, and double quotes for CSV-in-a-string cases.',
      'Sorting is case-insensitive, matching how most spreadsheet sorts behave.'
    ],
    takeaways: [
      'One paste covers line, comma, semicolon, and pipe formats.',
      'Quotes, prefixes, and suffixes automate repetitive wrapping.',
      'Dedupe and sort make messy exports presentable in seconds.'
    ],
    faq: [
      ['Which separators does the converter detect?', 'It checks for new lines first, then semicolons, pipes, and finally commas, so it copes with the common list formats without configuration.'],
      ['Can it add quotes to every item?', 'Yes. Choose single or double quotes and every item is wrapped accordingly. Quotes inside items are left untouched.'],
      ['Does sorting change the original order?', 'Only when you select a sort option. The default keeps your original order.'],
      ['What happens to blank lines and duplicates?', 'With cleanup on, blank lines and surrounding whitespace are removed, and the Remove duplicates toggle keeps only the first occurrence of each item.'],
      ['Is my list uploaded?', 'No. Everything is processed in your browser.']
    ],
    conclusion: '<p>Formatting a list by hand is the kind of work that looks quick until you have done it thirty times. Let this <strong>list converter</strong> handle the wrapping, sorting, and cleaning, and pair it with our <a href="remove-duplicate-lines.html">remove duplicate lines</a> tool when you are dealing with larger text files.</p>'
  }
});

/* ========================================================================
   2. EMAIL NORMALIZER
   ======================================================================== */
add({
  file: 'email-normalizer.html', folder: 'text',
  name: 'Email Normalizer', tag: 'Cleaner', icon: 'fa-solid fa-envelope-circle-check',
  title: 'Email Normalizer | Clean & Normalize Email Addresses',
  metaDesc: 'Normalize email addresses: lowercase, trim whitespace, and resolve Gmail dot and +tag aliases so duplicates become visible.',
  desc: 'Normalize email addresses by trimming whitespace, lowercasing, and resolving Gmail-style dot and plus aliases.',
  keywords: ['email normalizer', 'normalize email', 'clean email list', 'email dedupe', 'gmail alias', 'email lowercase', 'email formatter', 'email address cleaner', 'remove email duplicates', 'email processing'],
  featureList: ['Trim whitespace and lowercase', 'Resolve Gmail dot aliases', 'Strip Gmail +tag sub-addresses', 'Show original vs normalized', 'One-click copy', '100% client-side'],
  panel: panel.wrap('en', 'fa-solid fa-envelope-circle-check', 'Email normalizer',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="enDots">Gmail dots</label><select id="enDots"><option value="strip">Strip dots before @ (Gmail)</option><option value="keep">Keep dots</option></select></div>' +
    '<div class="field"><label for="enTags">Plus tags</label><select id="enTags"><option value="strip">Remove +tag (Gmail aliases)</option><option value="keep">Keep +tag</option></select></div>' +
    '</div>' +
    panel.ioTwo('en', 'Emails (one per line)', 'Normalized emails', 'user@example.com&hellip;', 'Normalized list appears here&hellip;') +
    '<div class="actions"><button class="rt-btn"type="button"id="enDup"><i class="fa-solid fa-shield-halved"></i>Show duplicates only</button>' +
    '<button class="btn btn-primary"type="button"id="enGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Normalize</button>' +
    '<button class="rt-btn"type="button"id="enCopy"><i class="fa-solid fa-copy"></i>Copy output</button></div>'),
  css: '.en-panel textarea{min-height:200px}',
  js: `
    var inp=document.getElementById("enIn"),out=document.getElementById("enOut"),proc=document.getElementById("enProc"),dupOnly=false;
    function norm(e){var s=e.trim().toLowerCase();var at=s.lastIndexOf("@");if(at<0)return s;var local=s.slice(0,at),domain=s.slice(at+1);
      if(domain==="gmail.com"||domain==="googlemail.com"){
        if(document.getElementById("enDots").value==="strip")local=local.replace(/\\./g,"");
        if(document.getElementById("enTags").value==="strip")local=local.split("+")[0];
      }
      return local+"@"+(domain==="googlemail.com"?"gmail.com":domain);
    }
    function run(){var lines=inp.value.split(/\\r?\\n/);var kept=[],seen={};lines.forEach(function(raw){var key=norm(raw);if(!key)return;if(dupOnly){if(seen[key]===1)kept.push(key);else if(seen[key]===undefined)seen[key]=1;}else{if(seen[key]===undefined){seen[key]=1;kept.push(key);}}});out.value=kept.join("\\n");proc.textContent=kept.length+" unique normalized address(es) - inside your browser.";}
    inp.addEventListener("input",run);["enDots","enTags"].forEach(function(id){document.getElementById(id).addEventListener("change",run)});
    document.getElementById("enGo").addEventListener("click",run);
    document.getElementById("enDup").addEventListener("click",function(){dupOnly=!dupOnly;this.classList.toggle("active",dupOnly);run()});
    document.getElementById("enCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("enSample").addEventListener("click",function(){inp.value="  Alice.Example@GMAIL.com\\nalice.example@gmail.com\\nbob+news@gmail.com\\nBob@example.com\\n";run()});
    document.getElementById("enClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared."});
  `,
  article: {
    title: 'Email Normalizer: Make a Messy Address List Match Itself',
    lead: '<p>Two people can type the same inbox in ways that look different in a database. <code>Alice.Example@gmail.com</code>, <code>aliceexample@gmail.com</code> and <code>alice+news@gmail.com</code> all reach the same Gmail account, but a naive count treats them as three users. This <strong>email normalizer</strong> resolves those aliases so duplicates become visible.</p><p>It trims whitespace, lowercases everything, and applies Gmail\'s dot-ignoring and plus-tag rules when you ask it to.</p>',
    sections: [
      { id: 'alias-rules', icon: 'fa-solid fa-code-branch', heading: 'The alias rules that hide duplicates', html: '<p>The standard rules on Gmail are well known: dots in the local part are ignored, and anything after a plus sign is a routing suffix that still delivers to the base address. This converter can apply both, and because it preserves your history, you can turn the rules off and compare. For other providers the safe simplification is lowercase plus trim, which alone fixes a large share of real-world duplicates.</p>' },
      { id: 'why-it-matters', icon: 'fa-solid fa-chart-pie', heading: 'Why the count matters', html: '<p>Email counts drive analytics, newsletter billing, and dedupe jobs. If a single subscriber appears three times, your audience numbers inflate and your reports mislead. Normalizing before counting turns "three entries" into "one address", which is the difference between a clean cohort and a misleading one.</p>' }
    ],
    steps: [
      'Paste your addresses, one per line, into the left box.',
      'Choose whether to strip Gmail dots and plus tags.',
      'The normalized, deduplicated list appears on the right as you type.',
      'Toggle <strong>Show duplicates only</strong> to see just the addresses that had matches.'
    ],
    facts: [
      ['Transforms', 'Trim, lowercase, Gmail alias rules'],
      ['Default dedupe', 'Yes, keeps first occurrence'],
      ['Duplicate view', 'Shows addresses with multiple entries'],
      ['Provider awareness', 'Gmail / googlemail'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Auditing subscriber lists', 'Spot how many sign-ups collapse to the same address and decide how to consolidate them.'],
      ['Cleaning imported contacts', 'CRM exports are full of casing and whitespace noise; normalize before the import or match stage.'],
      ['Preparing test data', 'When testing account uniqueness rules, normalized fixtures make the intended duplicates obvious.']
    ],
    tips: [
      'Start with lowercase and trim alone; many duplicates disappear without touching provider-specific rules.',
      'Remember that dot stripping applies to Gmail and googlemail addresses only, so other providers keep their dots.',
      'Use the duplicates view before deleting anything, so you can confirm the pairs you are collapsing.'
    ],
    takeaways: [
      'Normalization reveals duplicates that look different but resolve to one inbox.',
      'Gmail dots and plus tags explain most of the variance.',
      'The duplicate-only view makes audits quick and safe.'
    ],
    faq: [
      ['What does normalizing an email do?', 'It applies standard transformations, trimming whitespace and making the address lowercase, with optional Gmail-specific rules for dots and plus tags.'],
      ['Why does Gmail ignore dots in addresses?', 'Gmail treats the dot as insignificant in the local part, so alice.example and aliceexample land in the same inbox. The normalizer applies the same rule.'],
      ['What is a plus tag?', 'Anything after a + in the local part, like +news or +shopping, is a delivery alias. It still reaches the base inbox and can be removed to expose the canonical address.'],
      ['Does this affect other email providers?', 'Only casing, whitespace, and trimming are applied to other providers, since they do not share Gmail\'s alias rules.'],
      ['Is my email list sent anywhere?', 'No. All processing happens in your browser tab.']
    ],
    conclusion: '<p>A clean address list makes every downstream step, counting, billing, matching, slightly more trustworthy. Run yours through this <strong>email normalizer</strong> first, and when your data needs other kinds of tidying, our <a href="remove-extra-spaces.html">remove extra spaces</a> tool and <a href="sort-list-alphabetically.html">sort list</a> helper fit the same workflow.</p>'
  }
});

/* ========================================================================
   3. ULID GENERATOR
   ======================================================================== */
add({
  file: 'ulid-generator.html', folder: 'coding',
  name: 'ULID Generator', tag: 'Generator', icon: 'fa-solid fa-fingerprint',
  title: 'ULID Generator | Create Universally Unique Lexicographic IDs',
  metaDesc: 'Generate ULIDs instantly: 26-character, sortable, Crockford base32 identifiers with timestamps and randomness right in your browser.',
  desc: 'Generate ULIDs - 26-character, lexicographically sortable IDs with an embedded timestamp, generated locally.',
  keywords: ['ulid generator', 'ulid', 'generate ulid', 'universally unique lexicographically sortable identifier', 'crockford base32', 'sortable id', 'uuid alternative', 'primary key generator', 'id generator', 'unique id'],
  featureList: ['ULID generation', 'Timestamps embedded', 'Crockford base32 alphabet', 'Batch generation', 'One-click copy', '100% client-side'],
  panel: panel.wrap('ul', 'fa-solid fa-fingerprint', 'ULID generator',
    '<div class="field"style="max-width:260px;margin-bottom:14px"><label for="ulCount">How many to generate</label><input id="ulCount"type="number"min="1"max="100"value="5"></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="ulGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Generate</button>' +
    '<button class="rt-btn"type="button"id="ulCopy"><i class="fa-solid fa-copy"></i>Copy all</button></div>' +
    '<div class="result-card"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">Generated ULIDs</span><textarea id="ulOut"readonly spellcheck="false"style="min-height:140px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;margin-top:6px"aria-label="Generated ULIDs"></textarea></div></div></div>'),
  css: '.ul-panel .rt-value{font-size:13px;line-height:1.7}',
  js: `
    var ALPH="0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    function encNum(n,len){var out="";for(var i=len-1;i>=0;i--){out=ALPH.charAt(n%32)+out;n=Math.floor(n/32);}return out;}
    function ulid(){var t=encNum(Date.now(),10);var bytes=new Uint8Array(10);crypto.getRandomValues(bytes);var out="",acc=0,bits=0;for(var i=0;i<bytes.length;i++){acc=(acc<<8)|bytes[i];bits+=8;while(bits>=5){bits-=5;out+=ALPH.charAt((acc>>>bits)&31);}}if(bits)out+=ALPH.charAt((acc<<(5-bits))&31);return t+out.slice(0,16);}
    function run(){var n=Math.max(1,Math.min(100,parseInt(document.getElementById("ulCount").value||"1",10)));var lines=[];for(var i=0;i<n;i++)lines.push(ulid());document.getElementById("ulOut").value=lines.join("\\n");}
    document.getElementById("ulGo").addEventListener("click",run);document.getElementById("ulCount").addEventListener("change",run);
    document.getElementById("ulCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("ulOut").value,function(){document.querySelector(".ul-panel .proc-line span").textContent="Copied to clipboard."})});
    document.getElementById("ulSample").addEventListener("click",function(){document.getElementById("ulCount").value=3;run()});
    document.getElementById("ulClear").addEventListener("click",function(){document.getElementById("ulOut").value="";});
    run();
  `,
  article: {
    title: 'ULID Generator: Sortable Unique IDs for Modern Databases',
    lead: '<p>A UUID tells you almost nothing except that it is probably unique. A ULID keeps that guarantee and adds something real: the first ten characters encode the current timestamp, so sorted ULIDs are sorted by creation time. This <strong>ULID generator</strong> creates these identifiers locally, as many as you need.</p><p>ULIDs are 26 characters long, use Crockford base32, and are designed to work where monotonic ordering matters.</p>',
    sections: [
      { id: 'ulid-vs-uuid', icon: 'fa-solid fa-scale-balanced', heading: 'What makes a ULID different from a UUID', html: '<p>A ULID is built from a 48-bit millisecond timestamp followed by 80 bits of randomness, all encoded in Crockford base32. Because the timestamp leads the string, sorting ULIDs gives you insertion order, which suits event logs, primary keys, and any table where you want recent rows to sort naturally. UUIDv4, by contrast, is pure randomness, so order conveys nothing.</p><p>The base32 alphabet avoids ambiguous characters such as I, L, O, and U, and first create time and randomness are lawful sources of uniqueness under normal operation.</p>' },
      { id: 'when-to-use', icon: 'fa-solid fa-database', heading: 'When ULIDs earn their place', html: '<p>Choose ULIDs for event sourcing, message queues, and insert-heavy tables where a timestamped key helps you reason about ordering without storing a separate timestamp. They also transfer comfortably over URLs and logs because they are short, sortable, and safe to display. If you need pure randomness instead, a UUID generator is still the right tool.</p>' }
    ],
    steps: [
      'Set how many IDs you need (up to 100 at once).',
      'Press <strong>Generate</strong>. Five IDs are created automatically so you can see the format.',
      'Copy them all in one click, one per line.'
    ],
    facts: [
      ['Length', '26 characters'],
      ['Encoding', 'Crockford base32'],
      ['Timestamp', '48-bit milliseconds (leading 10 chars)'],
      ['Randomness', '80 bits'],
      ['Data handling', 'Runs locally, entropy from the OS']
    ],
    useCases: [
      ['Event and log IDs', 'Events with sortable keys let you replay or inspect streams in order without extra columns.'],
      ['Primary keys', 'Timestamped keys make recent insertion the natural sort, which many ORMs and indexes appreciate.'],
      ['Trace and correlation IDs', 'A sortable ID across services helps you join observations by time even when clocks skew slightly.']
    ],
    tips: [
      'The first ten characters decode to the creation time in ms, which is handy when debugging without a full timestamp column.',
      'Two ULIDs generated in the same millisecond rely on their random tails, so sorting equal-prefix rows falls back to creation within the millisecond.',
      'Generate a batch instead of one at a time when preparing fixtures, so the prefix timestamps stay close together.'
    ],
    takeaways: [
      'ULIDs combine uniqueness with an embedded, sortable timestamp.',
      'The Crockford alphabet keeps them clean and unambiguous.',
      'Generation is fully local and crypto-strength.'
    ],
    faq: [
      ['What does ULID stand for?', 'Universally Unique Lexicographically Sortable Identifier. The name captures its two defining properties: uniqueness and orderable encoding.'],
      ['How is a ULID different from a UUID?', 'A UUIDv4 is entirely random. A ULID leads with a millisecond timestamp, so sorting ULIDs also sorts by creation time, and it is encoded more compactly.'],
      ['Are ULIDs guaranteed unique?', 'Like UUIDs, uniqueness is probabilistic and is extremely likely under normal use. The timestamp shrinks the randomness space only by coordination with time.'],
      ['Can I sort a column of ULIDs?', 'Yes, lexicographic ordering of the string matches chronological ordering, which is the point of the format.'],
      ['Is network access needed?', 'No. Randomness comes from the browser\'s crypto API, completely offline.']
    ],
    conclusion: '<p>When your data needs to be unique and your reports need to be in insertion order, ULIDs are a small upgrade with an outsized payoff. Generate as many as you need with this <strong>ULID generator</strong>, and for classic random keys, our on-page <a href="uuid-generator.html">UUID generator</a> is right behind it.</p>'
  }
});

/* ========================================================================
   4. MAC ADDRESS GENERATOR
   ======================================================================== */
add({
  file: 'mac-address-generator.html', folder: 'coding',
  name: 'MAC Address Generator', tag: 'Generator', icon: 'fa-solid fa-ethernet',
  title: 'MAC Address Generator | Random MAC Addresses in Any Format',
  metaDesc: 'Generate random MAC addresses in colon, dash, dot or plain format. Choose upper/lowercase and unicast or multicast, right in your browser.',
  desc: 'Generate random MAC addresses with your choice of format, case, and unicast or locally-administered flags.',
  keywords: ['mac address generator', 'random mac address', 'generate mac', 'mac generator', 'mac address format', 'unicast multicast', 'locally administered mac', 'oui random', 'mac address tool', 'network tool'],
  featureList: ['Random MAC generation', 'Colon, dash, dot or plain formats', 'Upper or lower case', 'Unicast / multicast flag', 'Locally-administered flag', '100% client-side'],
  panel: panel.wrap('mac', 'fa-solid fa-ethernet', 'MAC generator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="macCount">Count</label><input id="macCount"type="number"min="1"max="50"value="5"></div>' +
    '<div class="field"><label for="macFormat">Format</label><select id="macFormat"><option value="colon">AA:BB:CC:DD:EE:FF</option><option value="dash">AA-BB-CC-DD-EE-FF</option><option value="dot">AABB.CCDD.EEFF</option><option value="plain">AABBCCDDEEFF</option></select></div>' +
    '<div class="field"><label for="macCase">Case</label><select id="macCase"><option value="upper">UPPER</option><option value="lower">lower</option></select></div>' +
    '</div>' +
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="macUcast">Address type</label><select id="macUcast"><option value="unicast">Unicast</option><option value="multicast">Multicast</option></select></div>' +
    '<div class="field"><label for="macLocal">Scope</label><select id="macLocal"><option value="local">Locally administered</option><option value="global">Globally unique (OUI-style)</option></select></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="macGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Generate</button>' +
    '<button class="rt-btn"type="button"id="macCopy"><i class="fa-solid fa-copy"></i>Copy all</button></div>' +
    '<div class="result-card"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">MAC addresses</span><textarea id="macOut"readonly spellcheck="false"style="min-height:120px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;margin-top:6px"aria-label="Generated MAC addresses"></textarea></div></div></div>'),
  css: '',
  js: `
    function rndByte(){var b=new Uint8Array(1);crypto.getRandomValues(b);return b[0];}
    function gen(){var oct=[];for(var i=0;i<6;i++)oct.push(rndByte());
      if(document.getElementById("macUcast").value==="unicast")oct[0]=oct[0]&0xFE;else oct[0]=oct[0]|0x01;
      if(document.getElementById("macLocal").value==="local")oct[0]=oct[0]|0x02;
      var lower=document.getElementById("macCase").value==="lower";
      return oct.map(function(b){var h=b.toString(16);if(h.length<2)h="0"+h;return lower?h:h.toUpperCase()});}
    function fmt(oct){var f=document.getElementById("macFormat").value;
      if(f==="colon")return oct.join(":");
      if(f==="dash")return oct.join("-");
      if(f==="plain")return oct.join("");
      return oct[0]+oct[1]+"."+oct[2]+oct[3]+"."+oct[4]+oct[5];}
    function run(){var n=Math.max(1,Math.min(50,parseInt(document.getElementById("macCount").value||"1",10)));var lines=[];for(var i=0;i<n;i++)lines.push(fmt(gen()));document.getElementById("macOut").value=lines.join("\\n");}
    document.getElementById("macGo").addEventListener("click",run);document.getElementById("macCount").addEventListener("change",run);
    document.getElementById("macCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("macOut").value,function(){document.querySelector(".mac-panel .proc-line span").textContent="Copied to clipboard."})});
    document.getElementById("macSample").addEventListener("click",function(){run()});
    document.getElementById("macClear").addEventListener("click",function(){document.getElementById("macOut").value="";});
    run();
  `,
  article: {
    title: 'MAC Address Generator: Fake Addresses That Follow the Rules',
    lead: '<p>Testing network code, packet parsers, or dashboards often needs MAC addresses, and inventing them by hand is slow and easy to get wrong. This <strong>MAC address generator</strong> creates valid-looking addresses instantly, with the format, case, and flags you pick.</p><p>It uses the browser\'s crypto API rather than a predictable pseudo-random sequence.</p>',
    sections: [
      { id: 'flags', icon: 'fa-solid fa-flag', heading: 'The two bits that change everything', html: '<p>The first octet of a MAC address carries two significant bits. The least significant bit marks the address as multicast (1) rather than unicast (0), which matters for group communication. The next bit marks a locally administered address (1), used when someone assigns a value that is not tied to a manufacturer, rather than a globally unique OUI address. The generator sets these bits for you, so the output is always plausible for its declared type.</p>' },
      { id: 'formats', icon: 'fa-solid fa-pen-ruler', heading: 'Formats for every parser', html: '<p>Different systems spell MACs differently: Cisco styles use dots and lowercase, some tools want dashes, others plain hex. Generating in the target format from the start avoids a parsing step later. All three groups are produced, and you can flip case in one click.</p>' }
    ],
    steps: [
      'Choose the count, format, and case.',
      'Set the address type and scope to match what you are testing.',
      'Press <strong>Generate</strong> and copy the batch when ready.'
    ],
    facts: [
      ['Randomness', 'Crypto-strength (Web Crypto)'],
      ['Formats', 'Colon, dash, dot, plain'],
      ['Flags set', 'Unicast/multicast, local/global'],
      ['Batch size', 'Up to 50 at once'],
      ['Data handling', 'Runs locally']
    ],
    useCases: [
      ['Testing packet parsers', 'Feed a Pcap parser MACs in every format to verify its normalisation handles both case and separators.'],
      ['Mocking device dashboards', 'Network inventory mock-ups look far more convincing with consistent vendor-style prefixes.'],
      ['Lab isolation', 'Locally administered addresses never collide with real vendor prefixes, keeping lab traffic easy to spot.']
    ],
    tips: [
      'For lab networks choose "locally administered"; the second bit clearly separates your traffic from vendor-space addresses.',
      'Cisco-style configuration often expects dotted lowercase, while logs more commonly use colons.',
      'Generate a batch once with your default settings instead of single-clicking repeatedly.'
    ],
    takeaways: [
      'Realistic MACs come from setting the flag bits, not just random bytes.',
      'Format and case follow the consuming system, chosen in advance.',
      'Generation is local and cryptographically random.'
    ],
    faq: [
      ['What is a locally administered MAC address?', 'An address whose second-least-significant bit of the first octet is set, meaning it was assigned locally rather than by a manufacturer OUI. It is used for labs and private networks.'],
      ['Are the generated addresses valid?', 'They are structurally valid: six octets, with the flag bits set to match your selection. They are not assigned to any real device.'],
      ['Which format should I use?', 'Match your consuming tool. Cisco and many switches use dotted or dashed lowercase; logs and scripts usually prefer colons.'],
      ['Can generated addresses collide with real ones?', 'Collisions are astronomically unlikely for random selection, and locally administered mode avoids vendor-prefix space entirely.'],
      ['Do I need an internet connection?', 'No. Randomness comes from the browser crypto API, fully offline.']
    ],
    conclusion: '<p>Valid-looking MACs make demos and tests credible. Next time a simulator needs addresses, let this <strong>MAC address generator</strong> supply the batch, and pair it with our <a href="../text/random-string-generator.html">random string generator</a> for the rest of your fixture data.</p>'
  }
});

/* ========================================================================
   5. RANDOM PORT GENERATOR
   ======================================================================== */
add({
  file: 'random-port-generator.html', folder: 'coding',
  name: 'Random Port Generator', tag: 'Generator', icon: 'fa-solid fa-plug',
  title: 'Random Port Generator | Pick a Free TCP/UDP Port Number',
  metaDesc: 'Generate random available TCP/UDP port numbers in the dynamic or registered range, with a list of common well-known ports for reference.',
  desc: 'Generate random, free port numbers for your services and scripts, drawn from the ranges you choose in your browser.',
  keywords: ['random port generator', 'random port number', 'pick a port', 'tcp port generator', 'udp port generator', 'free port', 'ephemeral port', 'port number generator', 'dynamic port range', 'choose port'],
  featureList: ['Random port from selected range', 'Dynamic/registered options', 'Excludes well-known reserved ports', 'Port facts for reference', 'One-click copy', '100% client-side'],
  panel: panel.wrap('pg', 'fa-solid fa-plug', 'Port generator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="pgRange">Range</label><select id="pgRange"><option value="dyn">Dynamic / private (49152-65535)</option><option value="reg">Registered (1024-49151)</option><option value="any">Any non-reserved (1024-65535)</option></select></div>' +
    '<div class="field"><label for="pgCount">Count</label><input id="pgCount"type="number"min="1"max="50"value="5"></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="pgGo"><i class="fa-solid fa-dice"></i>Generate</button>' +
    '<button class="rt-btn"type="button"id="pgCopy"><i class="fa-solid fa-copy"></i>Copy all</button></div>' +
    '<div class="result-card"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">Ports</span><textarea id="pgOut"readonly spellcheck="false"style="min-height:110px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;margin-top:6px"aria-label="Generated ports"></textarea></div></div></div>'),
  css: '',
  js: `
    function rand(min,max){var b=new Uint32Array(1);crypto.getRandomValues(b);return min+(b[0]%(max-min+1));}
    function run(){var r=document.getElementById("pgRange").value;var lo=r==="dyn"?49152:r==="reg"?1024:1024;var hi=r==="dyn"?65535:r==="reg"?49151:65535;
      var n=Math.max(1,Math.min(50,parseInt(document.getElementById("pgCount").value||"1",10)));var out=[];for(var i=0;i<n;i++)out.push(rand(lo,hi));document.getElementById("pgOut").value=out.join("\\n");}
    document.getElementById("pgGo").addEventListener("click",run);document.getElementById("pgCount").addEventListener("change",run);
    document.getElementById("pgCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("pgOut").value,function(){document.querySelector(".pg-panel .proc-line span").textContent="Copied to clipboard."})});
    document.getElementById("pgSample").addEventListener("click",function(){run()});
    document.getElementById("pgClear").addEventListener("click",function(){document.getElementById("pgOut").value="";});
    run();
  `,
  article: {
    title: 'Random Port Generator: Trouble Free Ports for Your Next Service',
    lead: '<p>Every service you start needs a port, and picking one is usually a coin flip between a number nobody remembers and a number that another process already owns. This <strong>random port generator</strong> draws numbers from ranges that are safe for applications to use, so your config stays collision free.</p><p>It keeps the list of well-known ports in mind and excludes reserved territory by default.</p>',
    sections: [
      { id: 'ranges', icon: 'fa-solid fa-diagram-project', heading: 'The three port ranges that matter', html: '<p>Ports 0-1023 are well-known and reserved for system services such as HTTP, HTTPS, and SSH. Ports 1024-49151 are registered for specific applications, and ports 49152-65535 are the dynamic range that operating systems hand out to connecting clients. For a new service you want to avoid collisions, the dynamic range is the safest bet, which is why it is the default here.</p>' },
      { id: 'collisions', icon: 'fa-solid fa-triangle-exclamation', heading: 'Why collisions keep happening', html: '<p>Developers tend to reuse the same few ports, so those numbers fill up fast across projects. A random pick spreads your services across the space and makes it far less likely that two projects on one machine will fight over the same socket. Even so, check <code>ss -ltn</code> or your firewall before finalising.</p>' }
    ],
    steps: [
      'Choose the range: dynamic, registered, or any non-reserved.',
      'Set how many ports you need.',
      'Generate and copy them into your docker-compose, nginx or Node config.'
    ],
    facts: [
      ['Well-known', '0-1023 (reserved)'],
      ['Registered', '1024-49151'],
      ['Dynamic', '49152-65535'],
      ['Default', 'Dynamic range'],
      ['Data handling', 'Runs locally']
    ],
    useCases: [
      ['Docker compose ports', 'Map a host port for each microservice without stepping on another container\'s binding.'],
      ['Local dev servers', 'Keep several projects running at once, each with its own random high port.'],
      ['Config templates', 'Generate a port once for a template and let every new project reuse a different value.']
    ],
    tips: [
      'Prefer the dynamic range for anything that does not need a fixed, memorable number.',
      'If the port must be memorable, pick one manually and verify it is free with a socket listing command.',
      'For tutorials, keep the port within 1024-65535 so nothing assumes privileged access.'
    ],
    takeaways: [
      'The dynamic range minimises collisions for new services.',
      'Random selection stops the same ports from being reused across all your projects.',
      'All generation is local.'
    ],
    faq: [
      ['What port number should I use for a new service?', 'Use the dynamic range (49152-65535) unless you need a well-known number, and verify the port is not already bound before you rely on it.'],
      ['Why does the tool exclude ports below 1024?', 'These are reserved for system services and usually require special privileges to bind. Restricting picks to higher ranges keeps the results practical.'],
      ['Can I get the same port twice?', 'Within a single batch the generator picks fresh values each time, and duplicates across separate runs are possible but harmless; checking your socket list is the final word.'],
      ['Is this a guarantee my port is free?', 'No. The tool cannot see your machine. Always confirm with a port listing before locking in a configuration.'],
      ['Does it work offline?', 'Yes, entirely.']
    ],
    conclusion: '<p>One less coin flip in your setup: generate a port, paste it in, move on. Keep this <strong>random port generator</strong> near your configs, and when you need hostnames to go with them, our <a href="../text/random-string-generator.html">random string generator</a> handles the names.</p>'
  }
});

/* ========================================================================
   6. MATH EVALUATOR
   ======================================================================== */
add({
  file: 'math-evaluator.html', folder: 'math',
  name: 'Math Evaluator', tag: 'Calculator', icon: 'fa-solid fa-square-root-variable',
  title: 'Math Evaluator | Solve Expressions Online Instantly',
  metaDesc: 'Evaluate math expressions with +, -, *, /, ^, %, parentheses and functions like sqrt, sin and log. Free, safe, fully offline.',
  desc: 'Solve math expressions step by step: arithmetic, powers, percentages and common functions, computed safely in your browser.',
  keywords: ['math evaluator', 'math solver', 'evaluate expression', 'expression calculator', 'algebra calculator', 'equation solver', 'sqrt sin cos log', 'math expression solver', 'online math tool', 'step by step math'],
  featureList: ['Full arithmetic + - * / ^ %', 'Parentheses and nesting', 'Functions: sqrt, sin, cos, log and more', 'Constants pi, e, tau', 'Clear error messages', '100% client-side'],
  panel: '<div class="panel clean me-panel"><div class="panel-inner">' +
    '<div class="toolbar-row"><span class="tool-label"><i class="fa-solid fa-square-root-variable"></i>Expression solver</span>' +
    '<div class="toolbar-actions"><button class="chip-btn"type="button"id="meSample"><i class="fa-solid fa-wand-magic-sparkles"></i><span class="hide-sm">Sample</span></button></div></div>' +
    '<div class="field"style="margin-bottom:14px"><label for="meExpr">Expression</label><input id="meExpr"type="text"spellcheck="false"placeholder="(25 + 40) * 2 - sqrt(81) ^ 2"aria-label="Math expression"></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="meGo"><i class="fa-solid fa-equals"></i>Evaluate</button>' +
    '<button class="rt-btn"type="button"id="meCopy"><i class="fa-solid fa-copy"></i>Copy result</button></div>' +
    '<div class="result-card"><div class="result-grid"style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">' +
    '<div class="result-tile"><span class="rt-label">Result</span><span class="rt-value"id="meRes"style="font-size:20px">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Valid check</span><span class="rt-value"id="meOk"style="font-size:15px;color:#6EE7B7">&ndash;</span></div>' +
    '</div></div><p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="meProc">Ready - parsing happens in this tab.</span></p></div></div>',
  css: '.me-panel input#meExpr{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px}',
  js: `
    var str="",pos=0;
    function skip(){while(pos<str.length&&/\\s/.test(str[pos]))pos++;}
    function peek(){skip();return str[pos];}
    function number(){skip();var st=pos;if(str[pos]===".")pos++;while(/[0-9]/.test(str[pos]||""))pos++;if(str[pos]==="."&&/[0-9]/.test(str[pos+1]||"")){pos++;while(/[0-9]/.test(str[pos]||""))pos++;}
      if(/[eE]/.test(str[pos]||"")){var off=(str[pos+1]=="+"||str[pos+1]=="-")?2:1;if(/[0-9]/.test(str[pos+off]||"")){pos+=off;while(/[0-9]/.test(str[pos]||""))pos++;}}
      var v=parseFloat(str.slice(st,pos));if(isNaN(v))throw new Error("Expected a number at position "+st);return v;}
    function factor(){skip();var ch=str[pos];
      if(ch==="("){pos++;var v=expression();skip();if(str[pos]!==")")throw new Error("Missing closing parenthesis");pos++;return v;}
      if(ch==="-"){pos++;return -factor();}
      if(ch==="+"){pos++;return factor();}
      if(/[0-9.]/.test(ch||""))return number();
      if(/[a-zA-Z]/.test(ch||"")){var st=pos;while(/[a-zA-Z0-9_]/.test(str[pos]||""))pos++;var name=str.slice(st,pos).toLowerCase();
        if(name==="pi")return Math.PI;if(name==="e")return Math.E;if(name==="tau")return Math.PI*2;
        if(name==="sqrt"||name==="sin"||name==="cos"||name==="tan"||name==="asin"||name==="acos"||name==="atan"||name==="abs"||name==="round"||name==="floor"||name==="ceil"||name==="ln"||name==="log"||name==="exp"||name==="min"||name==="max"||name==="pow"||name==="avg"){
          skip();if(str[pos]!=="(")throw new Error("Expected ( after "+name);pos++;
          var args=[expression()];while(peek()===","){pos++;args.push(expression());}skip();if(str[pos]!==")")throw new Error("Missing closing parenthesis");pos++;
          switch(name){case "sqrt":return Math.sqrt(args[0]);case "sin":return Math.sin(args[0]);case "cos":return Math.cos(args[0]);case "tan":return Math.tan(args[0]);case "asin":return Math.asin(args[0]);case "acos":return Math.acos(args[0]);case "atan":return Math.atan(args[0]);case "abs":return Math.abs(args[0]);case "round":return Math.round(args[0]);case "floor":return Math.floor(args[0]);case "ceil":return Math.ceil(args[0]);case "ln":return Math.log(args[0]);case "log":return Math.log10(args[0]);case "exp":return Math.exp(args[0]);case "pow":return Math.pow(args[0],args[1]||1);case "min":return Math.min.apply(Math,args);case "max":return Math.max.apply(Math,args);default:return args.reduce(function(a,b){return a+b},0)/args.length;}
        }
        throw new Error("Unknown function or constant: "+name);
      }
      throw new Error("Unexpected character: "+(ch||"end of input"));
    }
    function power(){var v=factor();if(peek()==="^"){pos++;var r=power();return Math.pow(v,r);}return v;}
    function term(){var v=power();for(;;){var ch=peek();if(ch==="*"){pos++;v*=power();}else if(ch==="/"){pos++;var d=power();if(d===0)throw new Error("Division by zero");v/=d;}else if(ch==="%"){pos++;v%=power();}else return v;}}
    function expression(){var v=term();for(;;){var ch=peek();if(ch==="+"){pos++;v+=term();}else if(ch==="-"){pos++;v-=term();}else return v;}}
    function evaluate(expr){str=expr;pos=0;var v=expression();skip();if(pos<str.length)throw new Error("Unexpected input at position "+pos);return v;}
    function go(){var expr=document.getElementById("meExpr").value.trim();if(!expr){return;}
      try{var v=evaluate(expr);var s=/inf|nan/i.test(v)?"Not a number":String(v);document.getElementById("meRes").textContent=s;document.getElementById("meOk").textContent="Valid expression";document.querySelector("#meProc").textContent="Evaluated in this tab.";}
      catch(e){document.getElementById("meRes").textContent="Error";document.getElementById("meOk").textContent="";document.querySelector("#meProc").textContent=e.message;}}
    document.getElementById("meGo").addEventListener("click",go);
    document.getElementById("meExpr").addEventListener("keydown",function(ev){if(ev.key==="Enter")go();});
    document.getElementById("meCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("meRes").textContent,function(){document.querySelector("#meProc").textContent="Copied."})});
    document.getElementById("meSample").addEventListener("click",function(){document.getElementById("meExpr").value="(25 + 40) * 2 - sqrt(81) ^ 2";go();});
  `,
  article: {
    title: 'Math Evaluator: Solve Expressions Before the Meeting Starts',
    lead: '<p>Punching a formula into a search bar never lands on the right answer, and a spreadsheet is overkill for a single expression. This <strong>math evaluator</strong> parses full arithmetic and common functions, then returns the result in one step, right in the browser.</p><p>No eval, no server: the parser understands the expression and computes it safely.</p>',
    sections: [
      { id: 'supported', icon: 'fa-solid fa-list-check', heading: 'What the expression grammar covers', html: '<p>The parser handles the four basic operations plus powers (<code>^</code>) and modulo (<code>%</code>), with unlimited parentheses. Functions include <code>sqrt</code>, <code>sin</code>, <code>cos</code>, <code>tan</code>, their inverses, <code>abs</code>, <code>round</code>, <code>floor</code>, <code>ceil</code>, <code>log</code> (base 10), <code>ln</code>, <code>exp</code>, <code>pow</code>, <code>min</code>, <code>max</code>, and <code>avg</code>. Constants <code>pi</code>, <code>e</code>, and <code>tau</code> are recognised, and scientific notation such as <code>1.5e3</code> parses normally.</p>' },
      { id: 'safety', icon: 'fa-solid fa-shield-halved', heading: 'Why it does not use eval', html: '<p>Relying on JavaScript\'s eval would let an expression execute arbitrary code. This tool tokenises and parses the input with its own recursive descent engine, so unexpected characters produce a clear error message rather than an execution attempt. Division by zero and unknown names are reported explicitly instead of failing silently.</p>' }
    ],
    steps: [
      'Type an expression such as <code>(25 + 40) * 2 - sqrt(81)^2</code>.',
      'Press <strong>Evaluate</strong> or hit Enter.',
      'Read the result, then copy it if you need the number elsewhere.'
    ],
    facts: [
      ['Operators', '+ - * / ^ %'],
      ['Functions', 'sqrt, trig, log, rounding, min/max, avg'],
      ['Constants', 'pi, e, tau'],
      ['Notation', 'Scientific notation supported'],
      ['Safety', 'Custom parser, no eval']
    ],
    useCases: [
      ['Quick sanity maths', 'Double-check a discount, an average, or a threshold before quoting it over the phone.'],
      ['Teaching precedence', 'Show how parentheses and powers change an answer, then recompute stepwise.'],
      ['Building formulas', 'Prototype a calculation and confirm the values your script should reproduce.']
    ],
    tips: [
      'Use parentheses when in doubt; they remove any ambiguity about evaluation order.',
      'The percent sign is modulo, not percentage. For a percentage, divide by 100 explicitly.',
      'Angles for trig functions are in radians, matching standard math notation.'
    ],
    takeaways: [
      'Full arithmetic, powers, and functions in one box.',
      'The parser is safe and reports errors clearly.',
      'Everything computes locally in your browser.'
    ],
    faq: [
      ['What functions are supported?', 'sqrt, sin, cos, tan, asin, acos, atan, abs, round, floor, ceil, log (base 10), ln, exp, pow, min, max, and avg, plus the constants pi, e, and tau.'],
      ['Does % mean percent or modulo?', 'It means modulo (remainder) in this solver, consistent with programming languages. Use /100 for percentages.'],
      ['Are trig functions in degrees or radians?', 'Radians, which is the standard mathematical convention.'],
      ['Can it handle large or decimal numbers?', 'Yes, including scientific notation such as 2.5e4, and it uses standard double precision.'],
      ['Is eval used anywhere?', 'No. The expression is parsed step by step by a purpose-built parser, so no code execution is involved.']
    ],
    conclusion: '<p>Next time a number needs checking before you commit to it, skip the search results and run it through this <strong>math evaluator</strong>. When percentages and change are the question, our <a href="../finance/percentage-calculator.html">percentage calculator</a> and other math tools cover the rest of the arithmetic.</p>'
  }
});

/* ========================================================================
   7. ETA CALCULATOR
   ======================================================================== */
add({
  file: 'eta-calculator.html', folder: 'time',
  name: 'ETA Calculator', tag: 'Travel', icon: 'fa-solid fa-clock',
  title: 'ETA Calculator | Estimated Time of Arrival & Travel Time',
  metaDesc: 'Calculate arrival time from departure time, distance and average speed. See total travel duration instantly, fully offline.',
  desc: 'Work out an arrival time from your departure time, distance and average speed, with a clear travel-duration breakdown.',
  keywords: ['eta calculator', 'estimated time of arrival', 'arrival time calculator', 'travel time calculator', 'journey duration', 'trip planner', 'drive time', 'eta from distance speed', 'arrival time', 'road trip eta'],
  featureList: ['Arrival time from departure + distance + speed', 'Duration breakdown (hours and minutes)', 'Metric or imperial units', 'Live preview as you type', '100% client-side'],
  panel: panel.wrap('eta', 'fa-solid fa-clock', 'ETA calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="etaDep">Departure date and time</label><input id="etaDep"type="datetime-local"></div>' +
    '<div class="field"><label for="etaDist">Distance</label><input id="etaDist"type="number"min="0"step="any"placeholder="120"></div>' +
    '<div class="field"><label for="etaSpeed">Average speed</label><input id="etaSpeed"type="number"min="0"step="any"placeholder="80"></div>' +
    '</div>' +
    '<div class="field"style="max-width:280px;margin-bottom:14px"><label for="etaUnit">Units</label><select id="etaUnit"><option value="metric">Kilometres / km per hour</option><option value="imperial">Miles / miles per hour</option></select></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="etaGo"><i class="fa-solid fa-truck-fast"></i>Calculate ETA</button></div>' +
    '<div class="result-card"><div class="result-grid">' +
    '<div class="result-tile"><span class="rt-label">Travel time</span><span class="rt-value"id="etaDur">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Arrival</span><span class="rt-value"id="etaArr"style="font-size:15px">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: `
    function fmtDuration(h){var H=Math.floor(h),M=Math.round((h-H)*60);if(M===60){H++;M=0;}return H+" h "+M+" min";}
    function run(){var dep=document.getElementById("etaDep").value,dist=parseFloat(document.getElementById("etaDist").value),spd=parseFloat(document.getElementById("etaSpeed").value);
      var durOrg=document.getElementById("etaDur"),arr=document.getElementById("etaArr");
      if(!dep||isNaN(dist)||isNaN(spd)||dist<=0||spd<=0){durOrg.textContent="Enter all three values";arr.textContent="";return;}
      var start=new Date(dep).getTime();var hours=dist/spd;var arrival=new Date(start+hours*3600000);
      durOrg.textContent=fmtDuration(hours);
      arr.textContent=arrival.toLocaleString(undefined,{dateStyle:"full",timeStyle:"short"});}
    document.getElementById("etaGo").addEventListener("click",run);
    ["etaDep","etaDist","etaSpeed","etaUnit"].forEach(function(id){document.getElementById(id).addEventListener("change",run);document.getElementById(id).addEventListener("input",run);});
    document.getElementById("etaSample").addEventListener("click",function(){var d=new Date();d.setHours(8,0,0,0);var pad=function(n){return String(n).padStart(2,"0")};document.getElementById("etaDep").value=d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());document.getElementById("etaDist").value="180";document.getElementById("etaSpeed").value="90";run();});
    document.getElementById("etaClear").addEventListener("click",function(){document.getElementById("etaDist").value="";document.getElementById("etaSpeed").value="";document.getElementById("etaDur").textContent="&ndash;";document.getElementById("etaArr").textContent="&ndash;";});
  `,
  article: {
    title: 'ETA Calculator: Know Before You Go',
    lead: '<p>"When am I actually getting there?" The answer is simple division, but doing it while packing or while driving is when mistakes happen. This <strong>ETA calculator</strong> combines your departure time, distance, and average speed into one answer: the arrival time.</p><p>It runs entirely offline, so it is just as useful planning a road trip as it is estimating when the courier\'s drop makes sense.</p>',
    sections: [
      { id: 'math', icon: 'fa-solid fa-calculator', heading: 'The simple maths behind an ETA', html: '<p>Travel time is distance divided by speed, and the arrival time is the departure time plus that duration. Subtleties like traffic, stops, and rest breaks are impossible to know in advance, which is why the tool focuses on a clean base estimate. Adjusting the average speed is the fastest way to stress-test a plan: drop it and the arrival moves later, rise and it moves forward, and the duration shows the gap.</p>' },
      { id: 'planning', icon: 'fa-solid fa-map', heading: 'Planning with an honest estimate', html: '<p>An estimate built from your own average speed beats a GPS claim that assumes perfect conditions. Use it to decide when to leave for a fixed appointment, to compare routes with different distances, or to schedule a meeting after a long drive instead of hoping. Because arrival time accounts for your actual clock, it lines up cleanly with calendar slots.</p>' }
    ],
    steps: [
      'Set the departure date and time.',
      'Enter the distance and your average speed.',
      'Press <strong>Calculate ETA</strong>. You get the travel time and the arrival moment, with date and time shown explicitly.'
    ],
    facts: [
      ['Formula', 'Travel time = distance / speed'],
      ['Arrival', 'Departure + travel time'],
      ['Units', 'Metric or imperial'],
      ['Output', 'Duration plus full arrival datetime'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Planning appointments', 'Pick a reasonable speed, add the travel time, and the calculator tells you when to leave so you arrive early rather than late.'],
      ['Comparing routes', 'Two distances, one calculator: the shorter minutes and hours decide which route deserves the fuel.'],
      ['Server and delivery estimates', 'For a delivery window, compute how long a trip takes at typical speeds so expectations match reality.']
    ],
    tips: [
      'Use a conservative average speed; traffic and stops always take time away from a perfect calculation.',
      'To include a rest break, add the minutes to the distance by increasing it slightly, or simply plan a buffer after the result.',
      'The result updates as you change values, so you can tune the speed quickly to see what departure time you really need.'
    ],
    takeaways: [
      'ETA is distance divided by speed added to departure.',
      'Assumptions matter: your chosen speed is the whole forecast.',
      'Works offline, with metric and imperial units.'
    ],
    faq: [
      ['How is the ETA calculated?', 'Travel time equals distance divided by your average speed, and the arrival time is the departure time plus that duration.'],
      ['Does it account for traffic or stops?', 'No, and it cannot. Adjust your average speed (or add a buffer) to reflect conditions, since the tool looks only at the numbers you enter.'],
      ['Can I use miles and mph?', 'Yes. Switch the units and enter distance and speed in the matching system.'],
      ['Why does my arrival include a date?', 'Long trips can cross midnight, so showing the full date and time removes any ambiguity about which day you arrive.'],
      ['Is my departure time sent anywhere?', 'No. Everything is computed in your browser.']
    ],
    conclusion: '<p>Arrival estimates should never be a gut feel on a busy day. Enter the three numbers in this <strong>ETA calculator</strong> and the answer is on screen before you grab your keys. Planning for intervals instead of instants? Our <a href="time-duration-calculator.html">time duration calculator</a> handles elapsed time spans.</p>'
  }
});

/* ========================================================================
   8. CHMOD CALCULATOR
   ======================================================================== */
add({
  file: 'chmod-calculator.html', folder: 'coding',
  name: 'Chmod Calculator', tag: 'Permissions', icon: 'fa-solid fa-key',
  title: 'Chmod Calculator | Convert rwx to Octal Permission Codes',
  metaDesc: 'Convert Unix permissions between rwx, octal and binary. Tick the boxes and instantly read 755, plus setuid, setgid and sticky bits.',
  desc: 'Build Unix permission codes visually: tick rwx boxes and see the octal, symbolic and binary forms instantly, special bits included.',
  keywords: ['chmod calculator', 'chmod converter', 'permission calculator', 'rwx to octal', 'unix permissions', 'chmod 755', 'setuid setgid sticky bit', 'file permissions', 'permission bits', 'linux chmod'],
  featureList: ['Visual rwx checkboxes', 'Octal / symbolic / binary output', 'setuid, setgid and sticky bits', 'Live updates', 'One-click copy', '100% client-side'],
  panel: '<div class="panel clean chm-panel"><div class="panel-inner">' +
    '<div class="toolbar-row"><span class="tool-label"><i class="fa-solid fa-key"></i>Permission builder</span>' +
    '<div class="toolbar-actions"><button class="chip-btn"type="button"id="chmSample"><i class="fa-solid fa-wand-magic-sparkles"></i><span class="hide-sm">Sample</span></button>' +
    '<button class="chip-btn"type="button"id="chmClear"><i class="fa-solid fa-eraser"></i><span class="hide-sm">Reset</span></button></div></div>' +
    '<div class="chm-groups">' +
    '<div class="chm-group"><span class="chm-group-name">Owner (user)</span><label class="chm-bit"><input type="checkbox"id="c-r"data-g="0"data-bit="4"><span>r</span></label><label class="chm-bit"><input type="checkbox"id="c-w"data-g="0"data-bit="2"><span>w</span></label><label class="chm-bit"><input type="checkbox"id="c-x"data-g="0"data-bit="1"><span>x</span></label></div>' +
    '<div class="chm-group"><span class="chm-group-name">Group</span><label class="chm-bit"><input type="checkbox"id="g-r"data-g="1"data-bit="4"><span>r</span></label><label class="chm-bit"><input type="checkbox"id="g-w"data-g="1"data-bit="2"><span>w</span></label><label class="chm-bit"><input type="checkbox"id="g-x"data-g="1"data-bit="1"><span>x</span></label></div>' +
    '<div class="chm-group"><span class="chm-group-name">Others</span><label class="chm-bit"><input type="checkbox"id="o-r"data-g="2"data-bit="4"><span>r</span></label><label class="chm-bit"><input type="checkbox"id="o-w"data-g="2"data-bit="2"><span>w</span></label><label class="chm-bit"><input type="checkbox"id="o-x"data-g="2"data-bit="1"><span>x</span></label></div>' +
    '</div>' +
    '<div class="chm-special"><label class="chm-spec"><input type="checkbox"id="s-setuid"><span>setuid (4)</span></label><label class="chm-spec"><input type="checkbox"id="s-setgid"><span>setgid (2)</span></label><label class="chm-spec"><input type="checkbox"id="s-sticky"><span>sticky (1)</span></label></div>' +
    '<div class="chm-fields">' +
    '<div class="chm-field"><span class="rt-label">Command</span><input id="chmCmd"readonly value="chmod 755 file"spellcheck="false"aria-label="chmod command"></div>' +
    '<div class="chm-field"><span class="rt-label">Octal</span><input id="chmOct"readonly value="755"spellcheck="false"aria-label="Octal permission"></div>' +
    '</div>' +
    '<div class="chm-fields">' +
    '<div class="chm-field"><span class="rt-label">Symbolic</span><input id="chmSym"readonly value="rwxr-xr-x"spellcheck="false"aria-label="Symbolic permission"></div>' +
    '<div class="chm-field"><span class="rt-label">Binary</span><input id="chmBin"readonly value="111 101 101"spellcheck="false"aria-label="Binary permission"></div>' +
    '</div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="chmProc">Ready - permissions are computed in this tab.</span></p></div></div>',
  css: '.chm-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px}' +
    '.chm-group{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:12px;padding:12px}' +
    '.chm-group-name{display:block;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin-bottom:8px}' +
    '.chm-bit{display:inline-flex;align-items:center;gap:4px;margin-right:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;cursor:pointer}' +
    '.chm-bit input{width:16px;height:16px;accent-color:var(--accent)}' +
    '.chm-special{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:16px;font-size:13.5px}' +
    '.chm-spec{display:inline-flex;align-items:center;gap:6px;cursor:pointer}' +
    '.chm-spec input{width:16px;height:16px;accent-color:var(--accent)}' +
    '.chm-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}' +
    '.chm-field span.rt-label{display:block;margin-bottom:4px}' +
    '.chm-field input{width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px}' +
    '@media(max-width:560px){.chm-fields{grid-template-columns:1fr}}',
  js: `
    function bitVal(prefix){var sum=0;["r","w","x"].forEach(function(b,i){var cb=document.getElementById(prefix+"-"+b);if(cb&&cb.checked)sum+=1<<(2-i);});return sum;}
    function cls(i){var b=bitVal(["c","g","o"][i]);return (b&4?"r":"-")+(b&2?"w":"-")+(b&1?"x":"-");}
    function bin(i){var b=bitVal(["c","g","o"][i]);return ((b>>2)&1)+" "+((b>>1)&1)+" "+(b&1);}
    function run(){
      var o=bitVal("c")*64+bitVal("g")*8+bitVal("o");
      var special=(document.getElementById("s-setuid").checked?4:0)+(document.getElementById("s-setgid").checked?2:0)+(document.getElementById("s-sticky").checked?1:0);
      var octBase=o.toString(8).padStart(3,"0");
      var octStr=special?(String(special)+octBase):octBase;
      var sym=cls(0)+cls(1)+cls(2);
      if(special&4)sym=sym.slice(0,2)+(bitVal("c")&1?"s":"S")+sym.slice(3);
      if(special&2)sym=sym.slice(0,5)+(bitVal("g")&1?"s":"S")+sym.slice(6);
      if(special&1)sym=sym.slice(0,8)+(bitVal("o")&1?"t":"T")+sym.slice(9);
      document.getElementById("chmOct").value=octStr;
      document.getElementById("chmSym").value=sym;
      document.getElementById("chmBin").value=bin(0)+" "+bin(1)+" "+bin(2);
      document.getElementById("chmCmd").value="chmod "+octStr+" file";
      document.getElementById("chmProc").textContent="Computed in this tab.";
    }
    ["c-r","c-w","c-x","g-r","g-w","g-x","o-r","o-w","o-x","s-setuid","s-setgid","s-sticky"].forEach(function(id){
      document.getElementById(id).addEventListener("change",run);
    });
    document.getElementById("chmSample").addEventListener("click",function(){
      [["c-r",true],["c-w",true],["c-x",true],["g-r",true],["g-x",true],["o-r",true],["o-x",true]].forEach(function(p){document.getElementById(p[0]).checked=p[1];});
      ["g-w","o-w","s-setuid","s-setgid","s-sticky"].forEach(function(id){document.getElementById(id).checked=false;});
      run();
    });
    document.getElementById("chmClear").addEventListener("click",function(){
      ["c-r","c-w","c-x","g-r","g-w","g-x","o-r","o-w","o-x","s-setuid","s-setgid","s-sticky"].forEach(function(id){document.getElementById(id).checked=false;});
      run();
    });
    run();
  `,
  article: {
    title: 'Chmod Calculator: Read rwx, Write the Octal, Stop Guessing',
    lead: '<p><code>chmod 755</code> rolls off the tongue, but the moment special bits appear, most of us start guessing. This <strong>chmod calculator</strong> shows the permission bits as checkboxes, then reads back the octal, symbolic, and binary forms, all live, with the exact command ready to paste.</p><p>It also handles setuid, setgid, and the sticky bit, the trio that trips everyone up.</p>',
    sections: [
      { id: 'how-bits-work', icon: 'fa-solid fa-diagram-project', heading: 'How permission bits add up', html: '<p>Each class, owner, group, and others, holds three bits: read (4), write (2), and execute (1). The octal number is the sum for each class in order: <code>7</code> is full access, <code>6</code> read and write only, <code>5</code> read and execute, and so on. The symbolic form shows the same information as letters and dashes, while the binary form shows the individual bits, useful for understanding exactly what a number means.</p>' },
      { id: 'special-bits', icon: 'fa-solid fa-star', heading: 'The special bits that change behaviour', html: '<p>setuid makes a program run with the owner\'s privileges; setgid does the same for the group and changes how new files inherit group ownership in a directory. The sticky bit on a directory lets everyone put files in it but only owners remove theirs. These appear as <code>s</code> or <code>t</code> in the symbolic form and as a leading digit (4, 2, or 1) that prepends the octal value, such as <code>4755</code>.</p>' }
    ],
    steps: [
      'Tick the read, write, and execute boxes for owner, group, and others.',
      'Add any special bits you need.',
      'Read the octal, symbolic, and binary results, and copy the ready-to-run <code>chmod</code> command.'
    ],
    facts: [
      ['Octal base', 'r=4, w=2, x=1, summed per class'],
      ['Order', 'Owner, group, others'],
      ['Special bits', 'setuid 4, setgid 2, sticky 1'],
      ['Symbolic form', 'rwxr-xr-x'],
      ['Data handling', 'Runs locally']
    ],
    useCases: [
      ['Writing deploy commands', 'Build the exact chmod for a deploy script or Dockerfile entrypoint and copy the command straight out.'],
      ['Explaining permissions', 'Watch a checkbox toggle change octal and binary simultaneously, which makes the mapping immediately visual.'],
      ['Auditing special bits', 'A quick reset to check what setuid would look like before you actually apply it to a binary.']
    ],
    tips: [
      'Directories usually want x for access and r to list, so rwxr-xr-x on a folder reads as 755.',
      'Special bits only do something when the matching execute bit is set, so test the combination visually here first.',
      'The command output is ready to paste into a terminal; the octal field is what CI configs and Dockerfiles need.'
    ],
    takeaways: [
      'Octal is the per-class sum of 4, 2, 1.',
      'The leading digit encodes setuid, setgid, and sticky.',
      'The visual grid makes the other two representations click.'
    ],
    faq: [
      ['How do I read chmod 644?', 'Split it as 6-4-4: owner can read and write (4+2), while group and others can only read. Directories additionally need execute, which is why 755 is standard for folders.'],
      ['What are setuid, setgid, and sticky?', 'They are special permission bits with a leading digit in octal. setuid lets a program run with the owner\'s rights, setgid affects group inheritance, and sticky protects files from deletion by others inside a shared directory.'],
      ['Why does the symbolic form show s or t?', 'When setuid or setgid is active and the execute bit is set, the letter shows as s; with the sticky bit it shows as t, replacing the x position.'],
      ['Does the calculator set file types or defaults?', 'No, it only computes the permission number. It is purely a converter and visualiser.'],
      ['Is it safe to use the generated command?', 'Yes, but run it on the right files: a wrong chmod can lock files or expose them, so review the octal before executing.']
    ],
    conclusion: '<p>Permissions stop being mysterious the moment you can see the bits move. Use this <strong>chmod calculator</strong> to build the code, then paste it into your terminal and move on, and when your files are full of temporary noise, our <a href="../text/remove-duplicate-lines.html">remove duplicate lines</a> tool keeps the cleanup going.</p>'
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