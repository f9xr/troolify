/* ============================================================================
   Troolify - it-tools migration, batch 1
   Text encoders + JSON data converters. Emits standard tool pages and
   registers them in assets/js/tools-data.js.
   Run: node troolify-gen/gen-tools-batch1.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const cat = f => (CATMAP[f] || {}).name || f;
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
function dirSelect(prefix, opts) {
  return '<div class="field"style="max-width:300px;margin-bottom:14px"><label for="' + prefix + 'Dir">Direction</label><select id="' + prefix + 'Dir">' +
    opts.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join('') + '</select></div>';
}
function actions(prefix, label, extra) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-arrow-right-arrow-left"></i>' + label + '</button> ' +
    '<button class="rt-btn"type="button"id="' + prefix + 'Copy"><i class="fa-solid fa-copy"></i>Copy output</button>' + (extra || '') + '</div>';
}

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ========================================================================
   1. TEXT TO BINARY
   ======================================================================== */
add({
  file: 'text-to-binary.html', folder: 'text',
  name: 'Text to Binary Converter', tag: 'Encoder', icon: 'fa-solid fa-1',
  title: 'Text to Binary Converter | Convert Text to 8-Bit Binary',
  metaDesc: 'Convert text to 8-bit binary and binary back to text instantly. UTF-8 aware, works with emoji, and everything runs in your browser.',
  desc: 'Turn any text into 8-bit binary and decode binary back into readable text - UTF-8 aware and processed entirely in this tab.',
  keywords: ['text to binary', 'binary converter', 'text to binary converter', 'binary to text', '8-bit binary', 'utf-8 binary', 'binary encoder', 'binary decoder', 'ascii to binary', 'convert text to binary'],
  featureList: ['Convert text to 8-bit binary', 'Decode binary back to text', 'UTF-8 aware (emoji and accents)', 'Handles binary with or without spaces', 'One-click copy', '100% client-side'],
  panel: wrap('t2b', 'fa-solid fa-1', 'Binary converter',
    dirSelect('t2b', [['enc', 'Text &rarr; Binary'], ['dec', 'Binary &rarr; Text']]) +
    ioTwo('t2b', 'Text', 'Binary', 'Type or paste text here&hellip;', 'Binary output appears here&hellip;') +
    actions('t2b', 'Convert') ),
  css: '.t2b-panel textarea{min-height:220px}',
  js: `
    var dir=document.getElementById("t2bDir"),inp=document.getElementById("t2bIn"),out=document.getElementById("t2bOut"),proc=document.getElementById("t2bProc");
    function run(){var t=performance.now(),v=inp.value,r="";try{
      if(dir.value==="enc"){r=Array.prototype.map.call(new TextEncoder().encode(v),function(b){return b.toString(2).padStart(8,"0")}).join(" ");}
      else{var clean=v.replace(/[^01]/g,"");if(clean.length%8!==0)throw new Error("Binary length must be a multiple of 8 bits.");var bytes=new Uint8Array(clean.length/8);for(var i=0;i<bytes.length;i++)bytes[i]=parseInt(clean.substr(i*8,8),2);r=new TextDecoder().decode(bytes);}
      out.value=r;
    }catch(e){out.value="";proc.textContent=e.message;}if(out.value){proc.textContent="Done in "+(performance.now()-t).toFixed(1)+" ms - inside your browser.";}}
    function go(){dir.value="enc";if(inp.value.trim().replace(/[^01\\s]/g,"").length===inp.value.trim().replace(/\\s/g,"").length&&/[01]/.test(inp.value))dir.value="dec";run();}
    inp.addEventListener("input",run);dir.addEventListener("change",run);
    document.getElementById("t2bGo").addEventListener("click",go);
    document.getElementById("t2bCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("t2bSample").addEventListener("click",function(){dir.value="enc";inp.value="Troolify";run()});
    document.getElementById("t2bClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus()});
  `,
  article: {
    title: 'Text to Binary Converter: Read and Write Binary Without the Headache',
    lead: '<p>Binary is the language computers actually speak, and looking at a screen of ones and zeros can feel impenetrable. This <strong>text to binary converter</strong> moves in both directions: paste readable text and get clean 8-bit binary, or paste a stream of bits and get the text back.</p><p>It is useful for teaching how computers encode characters, for debugging a protocol, or for building puzzles and escape-room clues where the payoff is hidden in plain sight.</p>',
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-gears', heading: 'How text becomes binary', html: '<p>A computer stores characters as numbers, and binary is simply those numbers written in base 2. Under UTF-8, the encoding used across the modern web, the letter <code>A</code> is byte value 65, which is <code>01000001</code> in binary. The space character is 32, or <code>00100000</code>. Our converter reads your text as UTF-8, so accented letters, currency symbols, and emoji all encode correctly rather than collapsing into question marks.</p><p>Each byte is always eight bits, which is why the output groups digits in blocks of eight. If you paste binary back in, the tool checks that the total number of digits is a multiple of eight before decoding, and warns you if it is not.</p>' },
      { id: 'where-it-is-used', icon: 'fa-solid fa-screwdriver-wrench', heading: 'Where binary conversion is handy', html: '<p>Binary shows up far beyond computer science lectures. Network engineers read packet dumps. Puzzle designers hide messages in strings of bits. Teachers demonstrate why a byte holds 256 possible values. Developers verifying a bitmask want to see which flags are on. In every case, the round trip between text and binary needs to be exact, and that is what this tool guarantees.</p>' }
    ],
    steps: [
      'Choose the direction. Leave it on <strong>Text &rarr; Binary</strong> or switch to <strong>Binary &rarr; Text</strong> (the tool also auto-detects binary input).',
      'Type or paste your content into the left box. The output updates as you type.',
      'For binary decoding, spaces are optional: the tool strips anything that is not a 0 or 1 first.',
      'Use <strong>Copy output</strong> to send the result to your clipboard, then paste it wherever you need it.'
    ],
    facts: [
      ['Bits per character', '8 bits per UTF-8 byte'],
      ['Encoding used', 'UTF-8 (handles emoji and accents)'],
      ['Input tolerance', 'Binary with or without spaces'],
      ['Typical use', 'Teaching, debugging, puzzles'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Classroom demonstrations', 'Show students how a word becomes a row of bits, and how changing one digit changes the character. The reverse mode lets them check their own hand-written binary.'],
      ['Puzzle and game building', 'Encode a clue as binary so it reads as noise until someone runs it through the converter. Because the tool accepts binary with or without spaces, the puzzle can hide the bit groups however it likes.'],
      ['Verifying bit patterns', 'When you are checking flags in a bitmask or a protocol field, converting the surrounding text helps you confirm you have the right bytes before trusting a manual read.']
    ],
    tips: [
      'Binary is always a multiple of 8 digits when you are working byte by byte; if the length looks off, you probably dropped a digit while copy-pasting.',
      'Leading zeros matter. <code>01000001</code> is not the same as <code>1000001</code> to a strict decoder even though the value is equal, so keep the eight-bit blocks intact.',
      'For a quick sanity check, the uppercase letters run <code>01000001</code> (A) through <code>01011010</code> (Z) and lowercase continues from there.'
    ],
    takeaways: [
      'Text and binary conversion is a two-way, lossless operation when the encoding is fixed.',
      'This tool uses UTF-8, so it copes with modern text rather than only plain ASCII.',
      'Everything happens in your browser, so confidential strings stay on your device.'
    ],
    faq: [
      ['What is text to binary conversion?', 'It is the process of turning each character, and the bytes that make it up, into the base-2 digits a computer uses internally. Going the other way, binary to text, reassembles those bytes into readable characters.'],
      ['Does the converter support emoji and non-English characters?', 'Yes. It reads your input as UTF-8 and encodes the underlying bytes, so emoji, accented letters, and non-Latin scripts convert correctly.'],
      ['Can I convert binary back to text?', 'Yes. Switch the direction to Binary to Text, or paste binary into the input and the tool detects it. It ignores spaces and checks that the digit count is a multiple of eight.'],
      ['Why is binary grouped in eights?', 'A byte is eight bits, and a single UTF-8 byte represents one unit of data. Grouping by eight keeps character boundaries visible and makes the output easy to scan.'],
      ['Is my text uploaded anywhere?', 'No. The conversion is performed by JavaScript running in your browser tab. Your text never leaves your device.']
    ],
    conclusion: '<p>Binary does not have to be intimidating. Give this <strong>text to binary converter</strong> a word or two, watch it turn into tidy eight-bit blocks, then flip the direction and bring it back. It is the fastest way to build intuition, and it is useful the moment you need an exact round trip. If you are working with other encodings next, our <a href="../coding/base64-encoder-decoder.html">Base64 encoder and decoder</a> and <a href="../coding/ascii-to-hex-converter.html">ASCII to hex converter</a> pair nicely with this page.</p>'
  }
});

/* ========================================================================
   2. TEXT TO UNICODE
   ======================================================================== */
add({
  file: 'text-to-unicode.html', folder: 'text',
  name: 'Text to Unicode Converter', tag: 'Encoder', icon: 'fa-solid fa-code',
  title: 'Text to Unicode Converter | Escape Text to \\u Codes',
  metaDesc: 'Convert text to \\u Unicode escape sequences and turn escape codes back into characters. Handles emoji with surrogate pairs, all in your browser.',
  desc: 'Escape any text into \\uXXXX Unicode code points and decode escapes back to characters, with correct surrogate pairs for emoji.',
  keywords: ['text to unicode', 'unicode converter', 'text to unicode converter', 'unicode escape', 'u escape codes', 'decode unicode', 'unicode encoder', 'unicode decoder', 'javascript unicode', 'codepoint converter'],
  featureList: ['Text to \\uXXXX escapes', 'Decode escapes to characters', 'Correct surrogate pairs for emoji', 'Brace and non-brace escapes', 'One-click copy', '100% client-side'],
  panel: wrap('t2u', 'fa-solid fa-code', 'Unicode escaper',
    dirSelect('t2u', [['enc', 'Text &rarr; Unicode escapes'], ['dec', 'Unicode escapes &rarr; Text']]) +
    ioTwo('t2u', 'Text', 'Unicode escapes', 'Type or paste text here&hellip;', 'Escaped output appears here&hellip;') +
    actions('t2u', 'Convert') ),
  css: '.t2u-panel textarea{min-height:220px}',
  js: `
    var dir=document.getElementById("t2uDir"),inp=document.getElementById("t2uIn"),out=document.getElementById("t2uOut"),proc=document.getElementById("t2uProc");
    function hex(n,w){return n.toString(16).toUpperCase().padStart(w,"0");}
    function run(){var t=performance.now(),v=inp.value,r="";try{
      if(dir.value==="enc"){r=Array.from(v).map(function(ch){var cp=ch.codePointAt(0);if(cp>0xFFFF){cp-=0x10000;return "\\\\u"+hex(0xD800+(cp>>10),4)+"\\\\u"+hex(0xDC00+(cp&0x3FF),4);}return "\\\\u"+hex(cp,4);}).join("");}
      else{r=v.replace(/\\\\u\\{?([0-9a-fA-F]{1,6})\\}?/g,function(_,h){return String.fromCodePoint(parseInt(h,16));});}
      out.value=r;
    }catch(e){out.value="";proc.textContent="Could not decode: "+e.message;}if(out.value){proc.textContent="Done in "+(performance.now()-t).toFixed(1)+" ms - inside your browser.";}}
    inp.addEventListener("input",run);dir.addEventListener("change",run);
    document.getElementById("t2uGo").addEventListener("click",run);
    document.getElementById("t2uCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("t2uSample").addEventListener("click",function(){dir.value="enc";inp.value="Caf\\u00e9 \\u2603";run()});
    document.getElementById("t2uClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus()});
  `,
  article: {
    title: 'Text to Unicode Converter: See Exactly Which Code Points Your Text Uses',
    lead: '<p>Two characters can look identical on screen and still be different code points underneath, which is exactly the kind of detail that breaks a parser. This <strong>text to Unicode converter</strong> shows every character as its <code>\\uXXXX</code> escape so you can see what is really there, and it reverses the process to turn escapes back into text.</p><p>It understands code points above the basic multilingual plane too, so emoji come out as the correct surrogate pair rather than a broken glyph.</p>',
    sections: [
      { id: 'why-escapes', icon: 'fa-solid fa-eye', heading: 'Why Unicode escapes matter', html: '<p>Unicode assigns a number, called a code point, to every character. The escape notation <code>\\uXXXX</code> writes that number as hexadecimal, which makes invisible differences visible. A non-breaking space looks like a normal space but escapes as <code>\\u00A0</code>. A curly apostrophe and a straight one are distinct code points. When text mysteriously fails validation or a database rejects a string, the escaped view usually explains why.</p><p>For anything beyond Latin-1, escapes are still unambiguous. Emoji and rare scripts live above code point <code>FFFF</code> and are written as a surrogate pair, two escapes that together name one character.</p>' },
      { id: 'when-to-use', icon: 'fa-solid fa-screwdriver-wrench', heading: 'When to reach for it', html: '<p>You will want escapes when writing source code that must not contain raw non-ASCII characters, when comparing two strings that look the same, or when documenting exactly which code point a specification requires. Decoding works in the other direction, turning a block of escapes copied from a config file or a log back into readable text.</p>' }
    ],
    steps: [
      'Pick <strong>Text &rarr; Unicode escapes</strong> or <strong>Unicode escapes &rarr; Text</strong>.',
      'Paste your content into the left box. The escaped or decoded result appears on the right as you type.',
      'Escapes may use the plain <code>\\uXXXX</code> form or the braced <code>\\u{XXXXX}</code> form; both are accepted when decoding.',
      'Copy the output with one click when you are done.'
    ],
    facts: [
      ['Escape format', '\\uXXXX hexadecimal'],
      ['Astral characters', 'Surrogate pairs (two escapes)'],
      ['Also decodes', '\\u{XXXXX} braced escapes'],
      ['Input', 'Any UTF-8 text or escape sequence'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Spotting lookalike characters', 'Two strings that render the same may contain different code points. Escaping both and comparing the output catches the difference before it reaches production.'],
      ['Preparing safe source code', 'Some build pipelines and configuration files dislike raw non-ASCII characters. Converting to escapes keeps the file plain ASCII while preserving the intended characters.'],
      ['Documenting specifications', 'When a spec must name an exact character, publishing its code point removes all ambiguity about which space, dash, or quote is meant.']
    ],
    tips: [
      'Most invisible troublemakers live in the <code>2000</code> to <code>206F</code> range, so a non-breaking space or a zero-width character jumps out immediately once escaped.',
      'If you see two consecutive escapes beginning with <code>D8</code> to <code>DB</code>, you are looking at a surrogate pair, which represents a single emoji or rare character.',
      'To confirm a round trip, escape your text, switch the direction, paste the escapes back, and check that you get the original string.'
    ],
    takeaways: [
      'Escapes reveal the true code points behind text that looks identical on screen.',
      'Surrogate pairs handle emoji and characters above the basic multilingual plane.',
      'The tool decodes braced escapes as well as the classic four-digit form.'
    ],
    faq: [
      ['What is a Unicode escape?', 'It is a way of writing a character by its code point number in hexadecimal, using the prefix \\u. It lets a string carry any character while staying within an ASCII-only file.'],
      ['How are emoji represented?', 'Characters above code point FFFF need two escapes, known as a surrogate pair. This converter outputs and reads those pairs correctly so emoji survive the round trip.'],
      ['Does it decode the braces style like \\u{1F600}?', 'Yes. Both the four-digit \\uXXXX form and the variable-length braced form are recognised when you switch to decode mode.'],
      ['Can I use the output inside JavaScript or JSON?', 'Yes. \\uXXXX escapes are valid in JavaScript strings and JSON string values, which is a common reason to generate them in the first place.'],
      ['Is anything sent to a server?', 'No. The conversion runs in your browser, so your text stays on your device.']
    ],
    conclusion: '<p>The next time two strings refuse to match or a file rejects a character you cannot see, escape it here and the answer is usually obvious within seconds. Bookmark this <strong>text to Unicode converter</strong> for code reviews and config debugging, and pair it with our <a href="text-to-binary.html">text to binary converter</a> when you need to go all the way down to bits.</p>'
  }
});

/* ========================================================================
   3. NATO ALPHABET
   ======================================================================== */
add({
  file: 'text-to-nato-alphabet.html', folder: 'text',
  name: 'NATO Alphabet Translator', tag: 'Encoder', icon: 'fa-solid fa-tower-broadcast',
  title: 'NATO Alphabet Translator | Convert Text to Phonetic Alphabet',
  metaDesc: 'Translate text into the NATO phonetic alphabet (Alfa, Bravo, Charlie) and decode it back. Perfect for spelling names clearly over the phone.',
  desc: 'Spell any text letter by letter using the NATO phonetic alphabet and turn phonetic words back into plain text.',
  keywords: ['nato alphabet', 'nato phonetic alphabet', 'phonetic alphabet translator', 'spelling alphabet', 'alfa bravo charlie', 'military alphabet', 'radio alphabet', 'text to nato', 'phone spelling', 'spell names'],
  featureList: ['Text to NATO phonetic words', 'Decode phonetic words to text', 'Letters and digits covered', 'One-click copy', 'Runs in your browser'],
  panel: wrap('nat', 'fa-solid fa-tower-broadcast', 'Phonetic translator',
    dirSelect('nat', [['enc', 'Text &rarr; NATO alphabet'], ['dec', 'NATO alphabet &rarr; Text']]) +
    ioTwo('nat', 'Text', 'NATO phonetic', 'Type a word, name or code&hellip;', 'Phonetic output appears here&hellip;') +
    actions('nat', 'Translate') ),
  css: '.nat-panel textarea{min-height:200px}',
  js: `
    var NATO={A:"Alfa",B:"Bravo",C:"Charlie",D:"Delta",E:"Echo",F:"Foxtrot",G:"Golf",H:"Hotel",I:"India",J:"Juliett",K:"Kilo",L:"Lima",M:"Mike",N:"November",O:"Oscar",P:"Papa",Q:"Quebec",R:"Romeo",S:"Sierra",T:"Tango",U:"Uniform",V:"Victor",W:"Whiskey",X:"Xray",Y:"Yankee",Z:"Zulu","0":"Zero","1":"One","2":"Two","3":"Three","4":"Four","5":"Five","6":"Six","7":"Seven","8":"Eight","9":"Nine"};
    var REV={};Object.keys(NATO).forEach(function(k){REV[NATO[k].toUpperCase()]=k});
    var dir=document.getElementById("natDir"),inp=document.getElementById("natIn"),out=document.getElementById("natOut"),proc=document.getElementById("natProc");
    function run(){var t=performance.now(),v=inp.value,r="";
      if(dir.value==="enc"){r=v.toUpperCase().split("").map(function(c){return NATO[c]||c}).join(" ");}
      else{r=v.trim().split(/[^A-Za-z0-9]+/).filter(Boolean).map(function(w){return REV[w.toUpperCase()]||w}).join("");}
      out.value=r;proc.textContent="Done in "+(performance.now()-t).toFixed(1)+" ms - inside your browser.";}
    inp.addEventListener("input",run);dir.addEventListener("change",run);
    document.getElementById("natGo").addEventListener("click",run);
    document.getElementById("natCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("natSample").addEventListener("click",function(){dir.value="enc";inp.value="F9XR";run()});
    document.getElementById("natClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus()});
  `,
  article: {
    title: 'NATO Alphabet Translator: Never Have a Letter Misheard Again',
    lead: '<p>"Was that a B or a D?" is the most predictable failure in any phone call about a booking reference, a password, or a postcode. The <strong>NATO phonetic alphabet</strong> fixes it by giving every letter a distinctive word, and this translator converts your text into those words instantly.</p><p>It also works in reverse, so a phonetic string that someone spelled out to you can be decoded back into the original letters and digits.</p>',
    sections: [
      { id: 'official-alphabet', icon: 'fa-solid fa-tower-broadcast', heading: 'The letters that survive a bad line', html: '<p>The alphabet used by aviation, the military, and emergency services around the world assigns a word to each letter: Alfa, Bravo, Charlie, Delta, and so on. The words were chosen so that each one sounds clearly different from the others even through static or a poor connection. A few spellings look unusual on purpose. Alfa is written with an f, and Juliett is written with a double t, so that neither can be mispronounced by someone reading the list aloud in another language.</p><p>This tool uses that standard set, including digit words such as Zero and Nine for the numbers.</p>' },
      { id: 'everyday-uses', icon: 'fa-solid fa-phone', heading: 'Not just for pilots', html: '<p>Anyone who reads a reference number to a stranger benefits from a shared spelling convention. Call centres, couriers, IT support desks, and emergency operators all rely on it. It is equally useful in person, for spelling a surname at a hotel desk or a Wi-Fi password to a colleague, where a single misheard letter means starting over.</p>' }
    ],
    steps: [
      'Choose <strong>Text &rarr; NATO alphabet</strong> to spell something out, or the reverse to decode it.',
      'Type the word, code, or name into the left box. Each character is replaced with its phonetic word as you type.',
      'Digits are converted too, using Zero through Nine.',
      'Copy the result and read it aloud, or send it to whoever needs to spell the value back.</p>'
    ],
    facts: [
      ['Standard', 'NATO / ICAO phonetic alphabet'],
      ['Letters covered', 'A through Z'],
      ['Digits covered', 'Zero through Nine'],
      ['Notable spellings', 'Alfa and Juliett'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Reading out a booking reference', 'A confirmation code like BK7Q becomes Bravo Kilo Seven Quebec, which is far harder to mis-copy than the raw string.'],
      ['Spelling a name over the phone', 'Surnames with tricky letters stop being a guessing game once each letter is a whole word. The listener only has to recognise the word, not differentiate similar-sounding letters.'],
      ['Radio and hobby use', 'Amateur radio operators and aviation enthusiasts use the same words, so converting a call sign here keeps your delivery consistent with standard practice.']
    ],
    tips: [
      'Speak each word once and clearly rather than rushing; the point is clarity, and speed undermines it.',
      'For a value with mixed letters and digits, the translated form removes any doubt about whether a character is a letter or a number.',
      'When decoding, the translator treats any run of non-alphanumeric characters as a separator, so punctuation will not disrupt the result.'
    ],
    takeaways: [
      'The NATO alphabet replaces ambiguous letters with unmistakable words.',
      'Digits have their own words, so mixed codes convert cleanly.',
      'Decoding is just as easy, which helps when someone spells a value to you.'
    ],
    faq: [
      ['What is the NATO phonetic alphabet?', 'It is a standard list of words, one per letter, used to spell words aloud clearly over radio, telephone, or in noisy places. It is maintained for international aviation and military communication.'],
      ['Why is Alfa spelled with an f?', 'The f avoids ambiguity when the list is read by speakers of languages where ph can be pronounced differently, and it keeps a one-to-one mapping with the spoken word.'],
      ['Does it include numbers?', 'Yes. The digits zero through nine each have a word, so strings that mix letters and numbers translate completely.'],
      ['Can I decode phonetic text back to plain letters?', 'Yes. Switch the direction and paste the words; the translator maps each word back to its letter or digit.'],
      ['Is my text stored anywhere?', 'No. Everything is processed in your browser and never uploaded.']
    ],
    conclusion: '<p>Whether you are a support agent reading a case number or a traveller spelling a surname at a front desk, the phonetic alphabet is the simplest way to be understood the first time. Translate your text here with this <strong>NATO alphabet translator</strong>, and if your code contains characters that confuse people visually, our <a href="text-to-unicode.html">text to Unicode converter</a> helps you check exactly what you typed.</p>'
  }
});

/* ========================================================================
   4. STRING OBFUSCATOR
   ======================================================================== */
add({
  file: 'string-obfuscator.html', folder: 'text',
  name: 'String Obfuscator', tag: 'Encoder', icon: 'fa-solid fa-user-secret',
  title: 'String Obfuscator | Hide Text With Invisible Characters',
  metaDesc: 'Obfuscate text with invisible Unicode characters and strip them back out. See how hidden characters change a string without changing how it looks.',
  desc: 'Insert invisible Unicode characters between the letters of a string, then strip them back out, all in your browser.',
  keywords: ['string obfuscator', 'invisible characters', 'hide text', 'zero width space', 'obfuscate text', 'unicode invisible', 'invisible text generator', 'text obfuscator', 'hidden characters', 'strip invisible characters'],
  featureList: ['Hide text with invisible characters', 'Multiple invisible character types', 'Strip invisible characters', 'Reveal hidden code points', 'One-click copy', '100% client-side'],
  panel: wrap('obs', 'fa-solid fa-user-secret', 'Obfuscator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="obsDir">Mode</label><select id="obsDir"><option value="enc">Obfuscate (hide)</option><option value="dec">Deobfuscate (strip)</option></select></div>' +
    '<div class="field"><label for="obsChar">Invisible character</label><select id="obsChar"><option value="200B">Zero-width space (U+200B)</option><option value="200C">Zero-width non-joiner (U+200C)</option><option value="200D">Zero-width joiner (U+200D)</option><option value="2060">Word joiner (U+2060)</option><option value="FEFF">Zero-width no-break space (U+FEFF)</option></select></div>' +
    '</div>' +
    ioTwo('obs', 'Input', 'Output', 'Type text to obfuscate or paste obfuscated text&hellip;', 'Result appears here&hellip;') +
    actions('obs', 'Obfuscate') ),
  css: '.obs-panel textarea{min-height:200px}',
  js: `
    var ALL=/[\\u200B-\\u200D\\u2060\\uFEFF\\u180E]/g;
    var dir=document.getElementById("obsDir"),sel=document.getElementById("obsChar"),inp=document.getElementById("obsIn"),out=document.getElementById("obsOut"),proc=document.getElementById("obsProc");
    function run(){var v=inp.value,r;
      if(dir.value==="enc"){var inv=String.fromCharCode(parseInt(sel.value,16));r=Array.from(v).join(inv);}
      else{r=v.replace(ALL,"");}
      out.value=r;proc.textContent="Done - inside your browser. Characters: "+Array.from(r).length;}
    inp.addEventListener("input",run);dir.addEventListener("change",run);sel.addEventListener("change",run);
    document.getElementById("obsGo").addEventListener("click",run);
    document.getElementById("obsCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("obsSample").addEventListener("click",function(){dir.value="enc";inp.value="troolify";run()});
    document.getElementById("obsClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus()});
  `,
  article: {
    title: 'String Obfuscator: Add Invisible Characters and Strip Them Back Out',
    lead: '<p>Some text looks perfectly normal but carries hidden characters that a computer notices and a human never will. This <strong>string obfuscator</strong> inserts those invisible code points between your letters, and it removes them just as easily.</p><p>Use it to demonstrate how invisible characters work, to watermark a string subtly, or to clean up text that picked up stray zero-width characters somewhere along the way.</p>',
    sections: [
      { id: 'invisible-chars', icon: 'fa-solid fa-ghost', heading: 'Meet the characters you cannot see', html: '<p>Unicode includes several characters designed to be invisible. The zero-width space marks a possible line break without showing a gap. The zero-width joiner and non-joiner influence how scripts that join letters are rendered. The word joiner prevents a break, and the byte-order-mark character is often left behind by misconfigured editors. None of them draw anything on screen.</p><p>Because they are invisible, they are easy to introduce by accident. Copying text from a web page, a PDF, or a chat app frequently carries a few along. That is why "the string looks identical but the comparison fails" is such a common bug, and why stripping these characters is a genuinely useful maintenance task.</p>' },
      { id: 'detect-and-clean', icon: 'fa-solid fa-broom', heading: 'Detect, then clean', html: '<p>If a value refuses to match, the deobfuscate mode gives you a fast test: paste both strings, strip the invisible characters, and compare again. If they now match, a hidden character was the culprit. The same mode is a tidy way to sanitise data before it reaches a database or an exact-match search.</p>' }
    ],
    steps: [
      'Pick an invisible character from the list, for example the zero-width space.',
      'Leave the mode on <strong>Obfuscate</strong> and type or paste your text. The output shows the text with invisible characters inserted between each letter.',
      'To clean text, switch the mode to <strong>Deobfuscate</strong> and paste the suspicious string. Every known invisible character is removed.',
      'Copy the result with one click.'
    ],
    facts: [
      ['Obfuscation', 'Inserts an invisible character between letters'],
      ['Character choices', 'Zero-width space, joiners, word joiner, BOM'],
      ['Deobfuscation', 'Strips common invisible code points'],
      ['Typical use', 'Debugging exact-match bugs, demos'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Debugging exact-match failures', 'When two visually identical strings compare as different, stripping invisible characters from both is the quickest way to confirm the cause.'],
      ['Soft watermarking', 'A string marked with a chosen zero-width character carries a subtle signature that survives copying and is invisible to readers.'],
      ['Sanitising pasted data', 'Text pulled from PDFs and web pages often carries stray joiners. Cleaning it before import avoids odd search and validation behaviour later.']
    ],
    tips: [
      'The zero-width space is the most commonly encountered invisible character, so it is a good default when you are testing.',
      'Obfuscation changes the byte content of a string even though it looks the same, which is exactly why it can break comparisons and field length limits.',
      'Deobfuscate strips several invisible characters at once, not just the one selected in the list.'
    ],
    takeaways: [
      'Invisible Unicode characters can change a string without changing its appearance.',
      'Obfuscating inserts them; deobfuscating strips them back out.',
      'Stripping is a practical first step when debugging string mismatch bugs.'
    ],
    faq: [
      ['What does a string obfuscator do?', 'It inserts invisible Unicode characters between the visible ones in a string, producing text that looks unchanged but contains extra code points. It can also remove those characters.'],
      ['Will the obfuscated text still look the same?', 'Yes. The characters used are invisible, so the text renders identically while its underlying bytes differ.'],
      ['Which invisible character should I use?', 'The zero-width space is the safest general choice. The joiners and word joiner affect how some scripts render, so pick a joiner only when you specifically want that behaviour.'],
      ['How do I remove hidden characters from text?', 'Switch to the deobfuscate mode and paste the text. The tool strips known invisible characters and returns clean output.'],
      ['Is my text sent anywhere?', 'No. Everything runs in your browser tab.']
    ],
    conclusion: '<p>Invisible characters are one of those details that seem trivial until they cost you an afternoon. Keep this <strong>string obfuscator</strong> handy for both directions: adding hidden marks for demonstrations, and stripping them when a stubborn string will not match. When you are cleaning up text, our <a href="remove-line-breaks.html">remove line breaks</a> tool and <a href="text-to-unicode.html">text to Unicode converter</a> round out a useful debugging set.</p>'
  }
});

/* ========================================================================
   5. JSON TO YAML
   ======================================================================== */
const JSON_YAML_JS = `
    function scalar(v){
      if(v===null)return "null";
      if(typeof v==="boolean")return v?"true":"false";
      if(typeof v==="number")return isFinite(v)?String(v):"null";
      var s=String(v);
      if(s==="")return "''";
      if(/^\\s|\\s$/.test(s)||/[:#\\-?\\[\\]{},&*!|>'"%@\`]/.test(s)||/^(true|false|null|yes|no|on|off|~)$/i.test(s)||/^-?[\\d.]+$/.test(s))return JSON.stringify(s);
      return s;
    }
    function y(v,ind){
      var pad="  ".repeat(ind),out=[];
      if(Array.isArray(v)){
        if(!v.length)return pad+"[]";
        v.forEach(function(it){
          if(it&&typeof it==="object"){
            var sub=y(it,ind+1).split("\\n");
            sub[0]=pad+"- "+sub[0].slice((ind+1)*2);
            out.push(sub.join("\\n"));
          }else out.push(pad+"- "+scalar(it));
        });
        return out.join("\\n");
      }
      if(v&&typeof v==="object"){
        var ks=Object.keys(v);
        if(!ks.length)return pad+"{}";
        ks.forEach(function(k){
          var val=v[k];
          if(val&&typeof val==="object"){out.push(pad+k+":");out.push(y(val,ind+1));}
          else out.push(pad+k+": "+scalar(val));
        });
        return out.join("\\n");
      }
      return pad+scalar(v);
    }
    var inp=document.getElementById("j2yIn"),out=document.getElementById("j2yOut"),proc=document.getElementById("j2yProc");
    function run(){var t=performance.now();try{var data=JSON.parse(inp.value);out.value=y(data,0);proc.textContent="Converted in "+(performance.now()-t).toFixed(1)+" ms - inside your browser.";}catch(e){out.value="";proc.textContent="Invalid JSON: "+e.message;}}
    inp.addEventListener("input",run);
    document.getElementById("j2yCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("j2ySample").addEventListener("click",function(){inp.value=JSON.stringify({name:"Troolify",version:2,tools:["word counter","json formatter"],active:true,limits:{free:true,requests:null}},null,2);run()});
    document.getElementById("j2yClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus()});
`;
add({
  file: 'json-to-yaml.html', folder: 'coding',
  name: 'JSON to YAML Converter', tag: 'Converter', icon: 'fa-solid fa-file-code',
  title: 'JSON to YAML Converter | Convert JSON to YAML Online',
  metaDesc: 'Convert JSON to clean, nicely indented YAML instantly in your browser. Handles nested objects, arrays, booleans, nulls and quoted strings.',
  desc: 'Turn JSON into readable YAML with correct indentation for nested objects, arrays, booleans and nulls, right in your browser.',
  keywords: ['json to yaml', 'json to yaml converter', 'convert json to yaml', 'json yaml', 'yaml converter', 'json to yaml online', 'json translator', 'devops config', 'kubernetes config', 'yaml generator'],
  featureList: ['Convert JSON to YAML', 'Nested objects and arrays', 'Quotes strings when required', 'Handles booleans and null', 'One-click copy', '100% client-side'],
  panel: wrap('j2y', 'fa-solid fa-file-code', 'JSON to YAML',
    ioTwo('j2y', 'JSON input', 'YAML output', 'Paste JSON here&hellip;', 'YAML appears here&hellip;') +
    actions('j2y', 'Convert') ),
  css: '.j2y-panel textarea{min-height:260px}',
  js: JSON_YAML_JS,
  article: {
    title: 'JSON to YAML Converter: Tidy Configuration in One Step',
    lead: '<p>JSON and YAML describe the same kind of structured data, but they read very differently. JSON is strict and every bracket counts. YAML trades brackets for indentation and is far easier for a human to scan. This <strong>JSON to YAML converter</strong> turns one into the other without leaving your browser.</p><p>It handles nested objects, arrays of objects, numbers, booleans, and nulls, and it adds quotes only where YAML would otherwise misinterpret a value.</p>',
    sections: [
      { id: 'why-convert', icon: 'fa-solid fa-shuffle', heading: 'Why convert between the two', html: '<p>The two formats dominate different corners of software. APIs and browser tools almost always speak JSON, while deployment manifests for Kubernetes, CI pipelines, and application configuration files usually favour YAML. A value that starts life as an API response often needs to become a YAML snippet before it can be pasted into a config file.</p><p>Doing that by hand invites indentation mistakes, and YAML is unforgiving about indentation. Converting programmatically removes the guesswork and keeps nesting levels consistent.</p>' },
      { id: 'quoting-rules', icon: 'fa-solid fa-quote-right', heading: 'The quoting rules that trip people up', html: '<p>In YAML, a bare value like <code>true</code>, <code>null</code>, or a number is interpreted as a boolean, a null, or a number rather than a string. A value containing a colon, a hash, or leading whitespace needs quotes too. This converter inspects each string and adds quotes when required, so a value that looks like a number stays a string, exactly as it was in the JSON.</p>' }
    ],
    steps: [
      'Paste valid JSON into the left box.',
      'The YAML output appears on the right and updates as you type.',
      'If the JSON is malformed, the status line reports the parser error so you can fix it.',
      'Use <strong>Copy output</strong> to paste the YAML into your config file or editor.'
    ],
    facts: [
      ['Input', 'Valid JSON'],
      ['Output', 'YAML with two-space indentation'],
      ['Handles', 'Objects, arrays, strings, numbers, booleans, null'],
      ['Smart quoting', 'Yes, when a value needs it'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Building config files', 'Convert an API response or a JSON sample into a YAML block you can paste into a manifest without re-indenting everything by hand.'],
      ['Sharing readable examples', 'YAML is easier to read in documentation and issue reports, so converting a JSON example first can make an explanation much clearer.'],
      ['Reviewing data quickly', 'When a deeply nested JSON document is hard to follow, a YAML rendering exposes the structure at a glance.']
    ],
    tips: [
      'YAML is whitespace sensitive. Copy the output as-is rather than letting an editor reformat it with tabs.',
      'A string that looks like a number or a boolean is quoted automatically, so round-trip values keep their original type.',
      'If the conversion fails, the JSON is invalid somewhere; check the error message and look for a trailing comma or a missing bracket.'
    ],
    takeaways: [
      'The converter preserves nesting and value types between formats.',
      'Smart quoting keeps strings that resemble numbers or booleans intact.',
      'Everything happens client-side, so sensitive configuration stays private.'
    ],
    faq: [
      ['Does this tool validate JSON as well as convert it?', 'Yes. It parses the JSON first, so if there is a syntax error the conversion stops and the status line tells you what went wrong.'],
      ['Will strings that look like numbers stay strings?', 'Yes. The converter quotes any value that YAML might otherwise read as a number, boolean, or null, so the type is preserved.'],
      ['Is YAML infallible for any JSON?', 'For standard data structures, yes. JSON and YAML both model objects, arrays, strings, numbers, booleans, and null, and those map cleanly.'],
      ['Can I convert YAML back to JSON?', 'Use our YAML to JSON converter for the opposite direction.'],
      ['Is my data uploaded?', 'No. The conversion is done with JavaScript in your browser tab.']
    ],
    conclusion: '<p>Converting JSON to YAML is one of those small chores that slows you down every time you do it by hand. This <strong>JSON to YAML converter</strong> makes it a single paste. When you need the reverse, our <a href="json-formatter.html">JSON formatter</a> and the other data converters in the developer tools keep the whole workflow in one place.</p>'
  }
});

/* ========================================================================
   6. JSON TO CSV
   ======================================================================== */
const JSON_CSV_JS = `
    function esc(v){if(v===null||v===undefined)return "";if(typeof v==="object")v=JSON.stringify(v);v=String(v);return /[",\\n\\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
    var inp=document.getElementById("j2cIn"),out=document.getElementById("j2cOut"),proc=document.getElementById("j2cProc"),delim=document.getElementById("j2cDelim");
    function run(){var t=performance.now();try{
      var data=JSON.parse(inp.value);var rows=Array.isArray(data)?data:[data];var keys=[];
      rows.forEach(function(r){if(r&&typeof r==="object"&&!Array.isArray(r))Object.keys(r).forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});});
      if(!keys.length)throw new Error("Expected a JSON array of objects, or a single object.");
      var d=delim.value==="tab"?"\\t":delim.value;var lines=[keys.map(esc).join(d)];
      rows.forEach(function(r){lines.push(keys.map(function(k){return esc(r?r[k]:"");}).join(d));});
      out.value=lines.join("\\r\\n");proc.textContent="Converted "+rows.length+" row(s) in "+(performance.now()-t).toFixed(1)+" ms - inside your browser.";
    }catch(e){out.value="";proc.textContent="Could not convert: "+e.message;}}
    inp.addEventListener("input",run);delim.addEventListener("change",run);
    document.getElementById("j2cCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Copied to clipboard."})});
    document.getElementById("j2cSample").addEventListener("click",function(){inp.value=JSON.stringify([{id:1,name:"Ada",role:"Engineer"},{id:2,name:"Linus",role:"Maintainer"}],null,2);run()});
    document.getElementById("j2cClear").addEventListener("click",function(){inp.value="";out.value="";proc.textContent="Cleared.";inp.focus()});
`;
add({
  file: 'json-to-csv.html', folder: 'coding',
  name: 'JSON to CSV Converter', tag: 'Converter', icon: 'fa-solid fa-table',
  title: 'JSON to CSV Converter | Convert JSON Arrays to CSV',
  metaDesc: 'Convert a JSON array of objects into clean CSV or TSV instantly. Correct quoting for commas, quotes and line breaks, all in your browser.',
  desc: 'Turn a JSON array of objects into properly quoted CSV or tab-separated values you can open in a spreadsheet.',
  keywords: ['json to csv', 'json to csv converter', 'convert json to csv', 'json array to csv', 'json to spreadsheet', 'csv converter', 'tsv converter', 'json export', 'data conversion', 'excel import'],
  featureList: ['JSON array to CSV', 'Comma or tab delimiter', 'RFC-style quoting', 'Nested values serialised', 'One-click copy', '100% client-side'],
  panel: wrap('j2c', 'fa-solid fa-table', 'JSON to CSV',
    '<div class="field"style="max-width:240px;margin-bottom:14px"><label for="j2cDelim">Delimiter</label><select id="j2cDelim"><option value=",">Comma (,)</option><option value="tab">Tab (TSV)</option></select></div>' +
    ioTwo('j2c', 'JSON array input', 'CSV output', 'Paste a JSON array of objects&hellip;', 'CSV appears here&hellip;') +
    actions('j2c', 'Convert') ),
  css: '.j2c-panel textarea{min-height:240px}',
  js: JSON_CSV_JS,
  article: {
    title: 'JSON to CSV Converter: From API Response to Spreadsheet Row',
    lead: '<p>JSON is built for programs, and CSV is built for people. The moment you want to inspect a list of records in a spreadsheet, sort it, or hand it to someone who does not read curly braces, you need a conversion. This <strong>JSON to CSV converter</strong> turns an array of objects into clean CSV or TSV in one paste.</p><p>It quotes fields correctly, so values that contain commas, quotes, or line breaks will not corrupt your columns.</p>',
    sections: [
      { id: 'shape-of-data', icon: 'fa-solid fa-table-cells', heading: 'The data shape that converts cleanly', html: '<p>CSV is a flat grid of rows and columns, so the conversion works when your JSON is an array of objects that share the same fields. Each object becomes a row, and each property becomes a column. If one object is missing a field, that cell is simply left empty. If a field holds a nested object or an array, the tool serialises it back to compact JSON so nothing is silently dropped.</p><p>When the objects have different keys, the converter takes the union of all keys and fills the gaps, which keeps every column available even when the records are uneven.</p>' },
      { id: 'quoting', icon: 'fa-solid fa-quote-right', heading: 'Why quoting makes or breaks a CSV', html: '<p>A CSV field that contains a comma breaks the grid unless it is wrapped in quotes, and a literal quote inside a quoted field must be doubled. Miss those rules and a single address line can shift every column in the file. This converter applies the standard escaping automatically, which is the difference between a file that opens cleanly in Excel or Google Sheets and one that scatters data across the wrong columns.</p>' }
    ],
    steps: [
      'Paste a JSON array of objects into the left box.',
      'Choose a comma or tab delimiter depending on where you will open the file.',
      'The CSV preview appears on the right and updates as you type.',
      'Copy the output and paste it into a spreadsheet or save it as a .csv file.'
    ],
    facts: [
      ['Input', 'JSON array of objects'],
      ['Output', 'CSV or TSV'],
      ['Quoting', 'Standard CSV escaping'],
      ['Missing fields', 'Left as empty cells'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Spreadsheet reporting', 'Paste an API response and hand the result to a colleague who lives in Excel. Sorting and filtering work immediately.'],
      ['Data cleanup', 'A flat CSV is easy to scan for duplicate or missing values before you decide what to do next.'],
      ['Importing into a database', 'Many database import tools accept CSV, so converting a JSON export first is the quickest path to a bulk load.']
    ],
    tips: [
      'Columns are the union of all keys, so inconsistent records still produce a complete header row.',
      'Nested objects and arrays are written as JSON text inside the cell rather than being dropped.',
      'Choose the tab delimiter when your values frequently contain commas but you still want a plain-text format.'
    ],
    takeaways: [
      'An array of objects maps naturally onto rows and columns.',
      'Correct quoting is what keeps a CSV intact when values contain commas or quotes.',
      'Nested data is preserved as JSON text in the cell.'
    ],
    faq: [
      ['What JSON shape does this converter expect?', 'An array of objects, where each object represents a row. A single object also works and produces one data row.'],
      ['What happens to nested objects?', 'They are converted back into compact JSON and placed in the cell, so no data is lost even though CSV itself cannot nest.'],
      ['Does it handle commas inside values?', 'Yes. Fields containing commas, quotes, or newlines are wrapped in quotes, and internal quotes are doubled, following standard CSV rules.'],
      ['Should I use CSV or TSV?', 'Use comma-separated values by default. Choose tab-separated values when your data contains many commas, which keeps the plain-text output easier to read.'],
      ['Is my data private?', 'Yes. The conversion runs entirely in your browser, so the data is never uploaded.']
    ],
    conclusion: '<p>Once your JSON is a clean CSV, the rest of the work, sorting, charting, sharing, gets far easier. Keep this <strong>JSON to CSV converter</strong> bookmarked for report building, and pair it with our <a href="../coding/csv-to-json-converter.html">CSV to JSON converter</a> and <a href="../coding/json-formatter.html">JSON formatter</a> for the full round trip.</p>'
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
