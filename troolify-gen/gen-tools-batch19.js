/* ============================================================================
   Troolify - batch 19
   Color + security/crypto utilities migrated from allinonetools.net.
   Run: node troolify-gen/gen-tools-batch19.js   (from the repo root)
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
function inp(id, label, val) {
  return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '"type="text"value="' + val + '"></div>';
}
function ta(id, label, ph, val) {
  return '<div class="io-field"><label for="' + id + '">' + label + '</label><textarea id="' + id + '"spellcheck="false"placeholder="' + ph + '">' + (val || '') + '</textarea></div>';
}
function go(prefix, label) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-calculator"></i>' + (label || 'Calculate') + '</button> ' +
    '<button class="rt-btn"type="button"id="' + prefix + 'Copy"><i class="fa-solid fa-copy"></i>Copy</button></div>';
}

/* ========================================================================
   1. RGB TO CMYK CONVERTER
   ======================================================================== */
add({
  file: 'rgb-to-cmyk-converter.html', folder: 'color',
  name: 'RGB to CMYK Converter', tag: 'Color', icon: 'fa-solid fa-palette',
  title: 'RGB to CMYK Converter | Print Colour Conversion',
  metaDesc: 'Convert RGB colour values to CMYK for print with live preview and hex values. Free, private and fully in-browser.',
  desc: 'Translate screen RGB values into CMYK percentages for print, with a live swatch and hex readout.',
  keywords: ['rgb to cmyk', 'cmyk converter', 'print color', 'rgb color', 'color conversion', 'color tool'],
  featureList: ['Live conversion', 'CMYK percentages', 'Swatch preview', '100% client-side'],
  panel: panel.wrap('rcm', 'fa-solid fa-palette', 'RGB to CMYK',
    '<div class="row3"style="margin-bottom:14px">' + num('rcmR', 'Red (0-255)', '66', 'max="255"') + num('rcmG', 'Green (0-255)', '133', 'max="255"') + num('rcmB', 'Blue (0-255)', '244', 'max="255"') + '</div>' +
    go('rcm') + tiles([['CMYK', 'rcmOut'], ['Hex', 'rcmHex']]) +
    '<div id="rcmSwatch"style="height:60px;border-radius:10px;margin-top:12px;border:1px solid var(--border)"></div>'),
  js: `
    function toHex(n){return ("0"+Math.max(0,Math.min(255,Math.round(n))).toString(16)).slice(-2).toUpperCase();}
    function run(){var r=+document.getElementById("rcmR").value,g=+document.getElementById("rcmG").value,b=+document.getElementById("rcmB").value;
      var rr=r/255,gg=g/255,bb=b/255;var k=1-Math.max(rr,gg,bb);
      var c=k<1?(1-rr-k)/(1-k):0,m=k<1?(1-gg-k)/(1-k):0,y=k<1?(1-bb-k)/(1-k):0;
      document.getElementById("rcmOut").textContent="C"+Math.round(c*100)+"% M"+Math.round(m*100)+"% Y"+Math.round(y*100)+"% K"+Math.round(k*100)+"%";
      document.getElementById("rcmHex").textContent="#"+toHex(r)+toHex(g)+toHex(b);
      document.getElementById("rcmSwatch").style.background="rgb("+r+","+g+","+b+")";
      document.getElementById("rcmProc").textContent="Converted in this tab - 0 bytes uploaded.";}
    ["rcmR","rcmG","rcmB"].forEach(function(id){document.getElementById(id).addEventListener("input",run);});
    document.getElementById("rcmGo").addEventListener("click",run);
    document.getElementById("rcmCopy").addEventListener("click",function(){var t=document.getElementById("rcmOut").textContent;navigator.clipboard&&navigator.clipboard.writeText(t);});run();`,
  article: {
    title: 'RGB to CMYK Converter: Prepare Colours for Print',
    lead: '<p>Screens use RGB; printers use CMYK. This <strong>RGB to CMYK converter</strong> translates between the two so what you design is closer to what gets printed.</p>',
    sections: [
      { id: 'why', icon: 'fa-solid fa-print', heading: 'Why convert', html: '<p>Printers mix cyan, magenta, yellow and black inks, while screens mix light. Colours can shift, so converting early helps predict the printed result.</p>' },
      { id: 'caveat', icon: 'fa-solid fa-triangle-exclamation', heading: 'Not exact', html: '<p>This is a mathematical conversion, not a colour-managed one. Bright RGB colours may sit outside the CMYK gamut; check proofs for critical work.</p>' }
    ],
    steps: ['Enter red, green and blue values.', 'Read the CMYK percentages and hex.', 'Use the swatch to sanity-check.'],
    facts: [['Input', 'RGB 0-255'], ['Output', 'CMYK %'], ['Also', 'Hex'], ['Data handling', 'Runs locally']],
    useCases: [['Print design', 'Prepare colours.'], ['Branding', 'Document CMYK values.'], ['Learning', 'Understand colour models.']],
    tips: ['Bright greens and blues often shift.', 'Always request a proof.', 'Record CMYK values for reuse.'],
    takeaways: ['RGB is additive, CMYK subtractive.', 'Conversion is approximate.', 'Proofs confirm print accuracy.'],
    faq: [['Is the conversion exact?', 'No, it is a maths approximation.'], ['What is the K value?', 'K is black, derived from the darkest channel.'], ['Can CMYK be negative?', 'Values are clamped to 0-100%.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Explore more colour tools in the <a href="../color/complementary-color.html">complementary colour tool</a>.</p>'
  }
});

/* ========================================================================
   2. HEX TO RGB CONVERTER
   ======================================================================== */
add({
  file: 'hex-to-rgb-converter.html', folder: 'color',
  name: 'Hex to RGB Converter', tag: 'Color', icon: 'fa-solid fa-hashtag',
  title: 'Hex to RGB Converter | Colour Code Translation',
  metaDesc: 'Convert hex colour codes to RGB values and back with a live swatch. Free, private and fully in-browser.',
  desc: 'Turn a hex colour code into RGB (and back) with an instant swatch preview.',
  keywords: ['hex to rgb', 'rgb converter', 'hex color', 'color code converter', 'css color', 'color tool'],
  featureList: ['Hex and RGB', 'Live swatch', 'Bidirectional', '100% client-side'],
  panel: panel.wrap('hrgb', 'fa-solid fa-hashtag', 'Hex to RGB',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="hrgbHex">Hex colour</label><input id="hrgbHex"type="text"value="#4285F4"></div>' +
    num('hrgbR', 'Red', '66', 'max="255"') + num('hrgbG', 'Green', '133', 'max="255"') +
    '</div>' + num('hrgbB', 'Blue', '244', 'max="255"') +
    '<div id="hrgbSwatch"style="height:60px;border-radius:10px;margin-top:12px;border:1px solid var(--border)"></div>' +
    tiles([['RGB', 'hrgbRgb'], ['CSS', 'hrgbCss']]) + go('hrgb', 'Update')),
  js: `
    function fromHex(){var h=document.getElementById("hrgbHex").value.replace("#","");
      if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      if(!/^[0-9a-fA-F]{6}$/.test(h))return;
      document.getElementById("hrgbR").value=parseInt(h.substr(0,2),16);
      document.getElementById("hrgbG").value=parseInt(h.substr(2,2),16);
      document.getElementById("hrgbB").value=parseInt(h.substr(4,2),16);show();}
    function fromRgb(){var r=+document.getElementById("hrgbR").value,g=+document.getElementById("hrgbG").value,b=+document.getElementById("hrgbB").value;
      var h=("#"+(1<<24|Math.min(255,r)<<16|Math.min(255,g)<<8|Math.min(255,b)).toString(16).slice(1)).toUpperCase();
      document.getElementById("hrgbHex").value=h;show();}
    function show(){var r=+document.getElementById("hrgbR").value,g=+document.getElementById("hrgbG").value,b=+document.getElementById("hrgbB").value;
      document.getElementById("hrgbRgb").textContent="rgb("+r+", "+g+", "+b+")";
      document.getElementById("hrgbCss").textContent="rgb("+r+" "+g+" "+b+")";
      document.getElementById("hrgbSwatch").style.background="rgb("+r+","+g+","+b+")";
      document.getElementById("hrgbProc").textContent="Converted in this tab - 0 bytes uploaded.";}
    document.getElementById("hrgbHex").addEventListener("input",fromHex);
    ["hrgbR","hrgbG","hrgbB"].forEach(function(id){document.getElementById(id).addEventListener("input",fromRgb);});
    document.getElementById("hrgbGo").addEventListener("click",show);
    document.getElementById("hrgbCopy").addEventListener("click",function(){navigator.clipboard&&navigator.clipboard.writeText(document.getElementById("hrgbRgb").textContent);});show();`,
  article: {
    title: 'Hex to RGB Converter: Translate Colour Codes',
    lead: '<p>Hex codes and RGB describe the same colour differently. This <strong>hex to RGB converter</strong> switches between them and shows the swatch instantly.</p>',
    sections: [
      { id: 'hex', icon: 'fa-solid fa-hashtag', heading: 'How hex works', html: '<p>A hex code is three byte pairs in base 16: red, green and blue. <code>#4285F4</code> is red 66, green 133, blue 244.</p>' },
      { id: 'use', icon: 'fa-solid fa-code', heading: 'Where each is used', html: '<p>Hex is compact for CSS, while RGB suits programmatic colour maths and alpha blending. Convert freely as needed.</p>' }
    ],
    steps: ['Type a hex code or RGB values.', 'The other form updates automatically.', 'Copy the RGB or CSS notation.'],
    facts: [['Input', 'Hex or RGB'], ['Output', 'Both forms'], ['Preview', 'Live swatch'], ['Data handling', 'Runs locally']],
    useCases: [['Web design', 'Convert brand colours.'], ['CSS', 'Switch notations.'], ['Tools', 'Colour maths in RGB.']],
    tips: ['Shorthand hex expands automatically.', 'Use CSS space syntax if preferred.', 'Check contrast for accessibility.'],
    takeaways: ['Hex and RGB are equivalent.', 'Two hex digits per channel.', 'Swatch confirms the colour.'],
    faq: [['Does it support alpha?', 'This handles opaque colours.'], ['Are 3-digit hex codes valid?', 'Yes, they expand to 6 digits.'], ['Can I paste CSS?', 'Enter just the numeric values.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Blend colours next with the <a href="../color/blend-colors.html">blend colours tool</a>.</p>'
  }
});

/* ========================================================================
   3. MD5 HASH GENERATOR
   ======================================================================== */
add({
  file: 'md5-hash-generator.html', folder: 'coding',
  name: 'MD5 Hash Generator', tag: 'Security', icon: 'fa-solid fa-fingerprint',
  title: 'MD5 Hash Generator | Create MD5 Hashes Online',
  metaDesc: 'Generate the MD5 hash of any text instantly using the browser crypto API. Free, private and fully client-side.',
  desc: 'Compute the MD5 hash of text for checksums and legacy comparisons, entirely in your browser.',
  keywords: ['md5 hash generator', 'md5', 'hash text', 'checksum', 'message digest', 'security tool'],
  featureList: ['Instant MD5', 'Uppercase/lowercase', 'Copy output', '100% client-side'],
  panel: panel.wrap('md5', 'fa-solid fa-fingerprint', 'MD5 hash generator',
    ta('md5In', 'Text to hash', 'Type or paste text...', 'Troolify') +
    go('md5', 'Generate MD5') + tiles([['MD5 hash', 'md5Out']])),
  js: `
    function md5(str){
      function rl(n,c){return (n<<c)|(n>>>(32-c));}
      function au(x,y){var l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
      function cmn(q,a,b,x,s,t){return au(rl(au(au(a,q),au(x,t)),s),b);}
      function ff(a,b,c,d,x,s,t){return cmn((b&c)|((~b)&d),a,b,x,s,t);}
      function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&(~d)),a,b,x,s,t);}
      function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
      function ii(a,b,c,d,x,s,t){return cmn(c^(b|(~d)),a,b,x,s,t);}
      function tb(str){var n=str.length,bl=[];for(var i=0;i<n*8;i+=8){bl[i>>5]|=(str.charCodeAt(i/8)&0xFF)<<(i%32);}
        bl[n*8>>5]|=0x80<<((n*8)%32);bl[(((n*8+64)>>>9)<<4)+14]=n*8;return bl;}
      function utf8(s){return unescape(encodeURIComponent(s));}
      var x=tb(utf8(str)),a=1732584193,b=-271733879,c=-1732584194,d=271733878;
      for(var i=0;i<x.length;i+=16){var oa=a,ob=b,oc=c,od=d;
        a=ff(a,b,c,d,x[i],7,-680876936);d=ff(d,a,b,c,x[i+1],12,-389564586);c=ff(c,d,a,b,x[i+2],17,606105819);b=ff(b,c,d,a,x[i+3],22,-1044525330);
        a=ff(a,b,c,d,x[i+4],7,-176418897);d=ff(d,a,b,c,x[i+5],12,1200080426);c=ff(c,d,a,b,x[i+6],17,-1473231341);b=ff(b,c,d,a,x[i+7],22,-45705983);
        a=ff(a,b,c,d,x[i+8],7,1770035416);d=ff(d,a,b,c,x[i+9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,-42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12],7,1804603682);d=ff(d,a,b,c,x[i+13],12,-40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);b=ff(b,c,d,a,x[i+15],22,1236535329);
        a=gg(a,b,c,d,x[i+1],5,-165796510);d=gg(d,a,b,c,x[i+6],9,-1069501632);c=gg(c,d,a,b,x[i+11],14,643717713);b=gg(b,c,d,a,x[i],20,-373897302);
        a=gg(a,b,c,d,x[i+5],5,-701558691);d=gg(d,a,b,c,x[i+10],9,38016083);c=gg(c,d,a,b,x[i+15],14,-660478335);b=gg(b,c,d,a,x[i+4],20,-405537848);
        a=gg(a,b,c,d,x[i+9],5,568446438);d=gg(d,a,b,c,x[i+14],9,-1019803690);c=gg(c,d,a,b,x[i+3],14,-187363961);b=gg(b,c,d,a,x[i+8],20,1163531501);
        a=gg(a,b,c,d,x[i+13],5,-1444681467);d=gg(d,a,b,c,x[i+2],9,-51403784);c=gg(c,d,a,b,x[i+7],14,1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);
        a=hh(a,b,c,d,x[i+5],4,-378558);d=hh(d,a,b,c,x[i+8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16,1839030562);b=hh(b,c,d,a,x[i+14],23,-35309556);
        a=hh(a,b,c,d,x[i+1],4,-1530992060);d=hh(d,a,b,c,x[i+4],11,1272893353);c=hh(c,d,a,b,x[i+7],16,-155497632);b=hh(b,c,d,a,x[i+10],23,-1094730640);
        a=hh(a,b,c,d,x[i+13],4,681279174);d=hh(d,a,b,c,x[i],11,-358537222);c=hh(c,d,a,b,x[i+3],16,-722521979);b=hh(b,c,d,a,x[i+6],23,76029189);
        a=hh(a,b,c,d,x[i+9],4,-640364487);d=hh(d,a,b,c,x[i+12],11,-421815835);c=hh(c,d,a,b,x[i+15],16,530742520);b=hh(b,c,d,a,x[i+2],23,-995338651);
        a=ii(a,b,c,d,x[i],6,-198630844);d=ii(d,a,b,c,x[i+7],10,1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);b=ii(b,c,d,a,x[i+5],21,-57434055);
        a=ii(a,b,c,d,x[i+12],6,1700485571);d=ii(d,a,b,c,x[i+3],10,-1894986606);c=ii(c,d,a,b,x[i+10],15,-1051523);b=ii(b,c,d,a,x[i+1],21,-2054922799);
        a=ii(a,b,c,d,x[i+8],6,1873313359);d=ii(d,a,b,c,x[i+15],10,-30611744);c=ii(c,d,a,b,x[i+6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21,1309151649);
        a=ii(a,b,c,d,x[i+4],6,-145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+2],15,718787259);b=ii(b,c,d,a,x[i+9],21,-343485551);
        a=au(a,oa);b=au(b,ob);c=au(c,oc);d=au(d,od);}
      return hc(a)+hc(b)+hc(c)+hc(d);}
    function hc(n){var s="",j;for(j=0;j<=3;j++)s+=("0"+((n>>(j*8))&0xFF).toString(16)).slice(-2);return s;}
    function run(){var t=document.getElementById("md5In").value;document.getElementById("md5Out").textContent=t?md5(t):"-";document.getElementById("md5Proc").textContent="Hashed in this tab - 0 bytes uploaded.";}
    document.getElementById("md5In").addEventListener("input",run);
    document.getElementById("md5Go").addEventListener("click",run);
    document.getElementById("md5Copy").addEventListener("click",function(){navigator.clipboard&&navigator.clipboard.writeText(document.getElementById("md5Out").textContent);});run();`,
  article: {
    title: 'MD5 Hash Generator: Create a Message Digest',
    lead: '<p>MD5 turns any text into a fixed 128-bit fingerprint. This <strong>MD5 hash generator</strong> computes it instantly in your browser for checksums and comparisons.</p>',
    sections: [
      { id: 'what', icon: 'fa-solid fa-fingerprint', heading: 'What MD5 is', html: '<p>MD5 produces a 32-character hexadecimal digest. The same input always yields the same hash, and tiny changes produce completely different outputs.</p>' },
      { id: 'security', icon: 'fa-solid fa-triangle-exclamation', heading: 'Not for security', html: '<p>MD5 is broken for security purposes because collisions can be crafted. Use it for checksums, never for storing passwords or verifying authenticity.</p>' }
    ],
    steps: ['Enter the text to hash.', 'The MD5 digest updates instantly.', 'Copy the 32-character hash.'],
    facts: [['Output', '128-bit hex'], ['Length', '32 characters'], ['Use', 'Checksums'], ['Data handling', 'Runs locally']],
    useCases: [['Checksums', 'Verify file contents.'], ['Legacy systems', 'Match existing hashes.'], ['Learning', 'Understand digests.']],
    tips: ['Do not use for passwords.', 'Compare hashes, not plaintext.', 'For security use SHA-256.'],
    takeaways: ['MD5 is fast and fixed-length.', 'It is unsuitable for security.', 'The same input gives the same hash.'],
    faq: [['Is MD5 secure?', 'No, collisions are known.'], ['What length is the output?', '32 hex characters.'], ['Is it salted?', 'No, this is plain MD5.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>For stronger hashing see the <a href="sha256-hash-generator.html">SHA-256 generator</a>.</p>'
  }
});

/* ========================================================================
   4. SHA256 HASH GENERATOR
   ======================================================================== */
add({
  file: 'sha256-hash-generator.html', folder: 'coding',
  name: 'SHA256 Hash Generator', tag: 'Security', icon: 'fa-solid fa-lock',
  title: 'SHA-256 Hash Generator | Create Secure SHA-256 Hashes',
  metaDesc: 'Generate SHA-256 hashes of any text instantly using the browser Web Crypto API. Free, private and fully client-side.',
  desc: 'Compute the SHA-256 hash of text using the browser crypto API, the modern standard for integrity checks.',
  keywords: ['sha256 hash generator', 'sha-256', 'secure hash', 'crypto api', 'checksum', 'security tool'],
  featureList: ['Web Crypto API', 'Instant hash', 'Copy output', '100% client-side'],
  panel: panel.wrap('sha', 'fa-solid fa-lock', 'SHA-256 hash generator',
    ta('shaIn', 'Text to hash', 'Type or paste text...', 'Troolify') +
    go('sha', 'Generate SHA-256') + tiles([['SHA-256 hash', 'shaOut']])),
  js: `
    function run(){var t=document.getElementById("shaIn").value;var out=document.getElementById("shaOut");
      if(!t){out.textContent="-";return;}
      if(!window.crypto||!window.crypto.subtle){out.textContent="Crypto API unavailable";return;}
      var data=new TextEncoder().encode(t);
      window.crypto.subtle.digest("SHA-256",data).then(function(buf){var b=Array.from(new Uint8Array(buf));out.textContent=b.map(function(x){return ("0"+x.toString(16)).slice(-2);}).join("");document.getElementById("shaProc").textContent="Hashed in this tab - 0 bytes uploaded.";});
    }
    document.getElementById("shaIn").addEventListener("input",run);
    document.getElementById("shaGo").addEventListener("click",run);
    document.getElementById("shaCopy").addEventListener("click",function(){navigator.clipboard&&navigator.clipboard.writeText(document.getElementById("shaOut").textContent);});run();`,
  article: {
    title: 'SHA-256 Hash Generator: Create a Secure Digest',
    lead: '<p>SHA-256 turns any input into a unique 256-bit fingerprint. This <strong>SHA-256 hash generator</strong> computes it with the browser Web Crypto API for integrity checks.</p>',
    sections: [
      { id: 'what', icon: 'fa-solid fa-lock', heading: 'Why SHA-256', html: '<p>SHA-256 is collision-resistant and widely used for file integrity, digital signatures and blockchain. It outputs 64 hex characters.</p>' },
      { id: 'how', icon: 'fa-solid fa-shield-halved', heading: 'How it is used', html: '<p>Distributors publish a SHA-256 hash with downloads. Recompute it after downloading; a match confirms the file was not altered.</p>' }
    ],
    steps: ['Enter the text to hash.', 'The SHA-256 digest updates instantly.', 'Copy the 64-character hash.'],
    facts: [['Output', '256-bit hex'], ['Length', '64 characters'], ['API', 'Web Crypto'], ['Data handling', 'Runs locally']],
    useCases: [['File integrity', 'Verify downloads.'], ['Signatures', 'Feed signing workflows.'], ['Security', 'Stronger than MD5.']],
    tips: ['Compare full 64 characters.', 'Prefer SHA-256 over MD5.', 'Hash the file, not a description.'],
    takeaways: ['SHA-256 is collision-resistant.', 'It outputs 64 hex characters.', 'It is the modern integrity standard.'],
    faq: [['Is SHA-256 secure?', 'Yes, it is considered secure.'], ['Can I hash files?', 'This tool hashes text.'], ['Is it salted?', 'No, this is a plain hash.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Compare with <a href="md5-hash-generator.html">MD5</a> to see the difference in strength.</p>'
  }
});

/* ========================================================================
   5. USER AGENT FINDER
   ======================================================================== */
add({
  file: 'user-agent-finder.html', folder: 'coding',
  name: 'User Agent Finder', tag: 'Web', icon: 'fa-solid fa-globe',
  title: 'User Agent Finder | See Your Browser User Agent',
  metaDesc: 'Instantly view your browser user agent string and parsed details like OS and engine. Free, private and fully client-side.',
  desc: 'Display your browser user agent string along with parsed platform, browser and engine details.',
  keywords: ['user agent finder', 'my user agent', 'browser user agent', 'user agent string', 'browser info', 'web tool'],
  featureList: ['Raw UA string', 'Parsed details', 'Copy output', '100% client-side'],
  panel: panel.wrap('uaf', 'fa-solid fa-globe', 'Your user agent',
    '<div class="actions"><button class="btn btn-primary"type="button"id="uafGo"><i class="fa-solid fa-globe"></i>Show my user agent</button> ' +
    '<button class="rt-btn"type="button"id="uafCopy"><i class="fa-solid fa-copy"></i>Copy</button></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="uafOut">User agent string</label><textarea id="uafOut"readonly style="min-height:80px"></textarea></div>' +
    tiles([['Platform', 'uafPlat'], ['Language', 'uafLang'], ['Screen', 'uafScreen']])),
  js: `
    function run(){document.getElementById("uafOut").value=navigator.userAgent;
      document.getElementById("uafPlat").textContent=navigator.platform||"Unknown";
      document.getElementById("uafLang").textContent=navigator.language||"Unknown";
      document.getElementById("uafScreen").textContent=screen.width+"x"+screen.height;
      document.getElementById("uafProc").textContent="Read in this tab - 0 bytes uploaded.";}
    document.getElementById("uafGo").addEventListener("click",run);
    document.getElementById("uafCopy").addEventListener("click",function(){document.getElementById("uafOut").select();document.execCommand("copy");});run();`,
  article: {
    title: 'User Agent Finder: See Your Browser Identity',
    lead: '<p>Your user agent tells websites your browser, engine and platform. This <strong>user agent finder</strong> shows the raw string plus useful parsed details.</p>',
    sections: [
      { id: 'what', icon: 'fa-solid fa-globe', heading: 'What a user agent is', html: '<p>Every request carries a user agent string. It helps servers serve the right content and is used for analytics and bot detection.</p>' },
      { id: 'privacy', icon: 'fa-solid fa-user-secret', heading: 'Privacy note', html: '<p>User agents add fingerprinting entropy. Some browsers reduce or freeze them for privacy; yours may differ from your real device.</p>' }
    ],
    steps: ['Press Show my user agent.', 'Review the string and details.', 'Copy it if you need to report it.'],
    facts: [['Shows', 'UA string'], ['Details', 'Platform, language, screen'], ['Source', 'Browser API'], ['Data handling', 'Runs locally']],
    useCases: [['Support', 'Report your browser.'], ['Debugging', 'Check UA detection.'], ['Learning', 'See how UAs look.']],
    tips: ['UA strings are spoofable.', 'Do not paste them publicly with other data.', 'Browsers may freeze values.'],
    takeaways: ['The UA identifies your browser.', 'It is used for compatibility.', 'It is not a reliable identifier.'],
    faq: [['Can websites see this?', 'Yes, it is sent with requests.'], ['Can it be spoofed?', 'Yes, easily.'], ['Is it the same on mobile?', 'No, it reflects the device.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Related reading: the <a href="http-status-code-lookup.html">HTTP status code lookup</a>.</p>'
  }
});

/* ========================================================================
   6. BROWSER FINGERPRINT CHECKER
   ======================================================================== */
add({
  file: 'browser-fingerprint-checker.html', folder: 'coding',
  name: 'Browser Fingerprint Checker', tag: 'Security', icon: 'fa-solid fa-fingerprint',
  title: 'Browser Fingerprint Checker | See Identifying Signals',
  metaDesc: 'See what browser signals a site can read - screen, timezone, languages, hardware and more - combined into a fingerprint hash. In-browser.',
  desc: 'Inspect the browser signals that contribute to a device fingerprint and see a combined hash.',
  keywords: ['browser fingerprint checker', 'device fingerprint', 'fingerprinting', 'privacy check', 'browser signals', 'security tool'],
  featureList: ['Signal breakdown', 'Fingerprint hash', 'Privacy awareness', '100% client-side'],
  panel: panel.wrap('bfp', 'fa-solid fa-fingerprint', 'Browser fingerprint',
    '<div class="actions"><button class="btn btn-primary"type="button"id="bfpGo"><i class="fa-solid fa-fingerprint"></i>Analyse browser</button></div>' +
    '<div id="bfpRows"class="result-card"style="margin-top:14px"><div class="rt-label">Signals</div></div>' +
    tiles([['Fingerprint hash', 'bfpHash']])),
  js: `
    function run(){var s={userAgent:navigator.userAgent,language:navigator.language,languages:(navigator.languages||[]).join(","),platform:navigator.platform,screen:screen.width+"x"+screen.height,depth:screen.colorDepth,timezone:(Intl.DateTimeFormat().resolvedOptions().timeZone||""),cores:navigator.hardwareConcurrency||0,memory:navigator.deviceMemory||0,touch:"ontouchstart"in window};
      var rows="";var str="";Object.keys(s).forEach(function(k){str+=k+"="+s[k]+";";rows+='<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span>'+k+'</span><span style="color:#93C5FD">'+String(s[k]).slice(0,60)+'</span></div>';});
      document.getElementById("bfpRows").innerHTML='<div class="rt-label">Signals</div>'+rows;
      var h=5381;for(var i=0;i<str.length;i++){h=((h<<5)+h)+str.charCodeAt(i);h=h>>>0;}
      document.getElementById("bfpHash").textContent=h.toString(16).toUpperCase();
      document.getElementById("bfpProc").textContent="Analysed in this tab - 0 bytes uploaded.";}
    document.getElementById("bfpGo").addEventListener("click",run);run();`,
  article: {
    title: 'Browser Fingerprint Checker: Understand Tracking',
    lead: '<p>Websites can identify you without cookies using fingerprints - combinations of your screen, language, hardware and more. This <strong>browser fingerprint checker</strong> shows those signals.</p>',
    sections: [
      { id: 'signals', icon: 'fa-solid fa-fingerprint', heading: 'What makes a fingerprint', html: '<p>Screen size, timezone, installed fonts, language list, CPU cores and touch support combine into a surprisingly unique signature.</p>' },
      { id: 'privacy', icon: 'fa-solid fa-user-shield', heading: 'Reducing exposure', html: '<p>Privacy-focused browsers normalise or randomise these signals. Blocking trackers and using a standard browser profile narrows your fingerprint.</p>' }
    ],
    steps: ['Press Analyse browser.', 'Review the signal list.', 'Note the fingerprint hash.'],
    facts: [['Signals', '10+ browser values'], ['Output', 'Hash'], ['Source', 'Browser APIs'], ['Data handling', 'Runs locally']],
    useCases: [['Privacy', 'See what leaks.'], ['Research', 'Understand tracking.'], ['Development', 'Test fingerprint surface.']],
    tips: ['Fingerprints persist without cookies.', 'A standard browser reduces entropy.', 'Values may be rounded for privacy.'],
    takeaways: ['Fingerprints combine many signals.', 'They can track without storage.', 'Normalisation narrows them.'],
    faq: [['Is the hash unique?', 'It approximates uniqueness; it is not a standard ID.'], ['Does it store data?', 'No, it runs in your browser.'], ['Can I hide my fingerprint?', 'Privacy browsers reduce it.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Check your user agent too with the <a href="user-agent-finder.html">user agent finder</a>.</p>'
  }
});

/* ========================================================================
   7. ONLINE PRIVACY CHECKER
   ======================================================================== */
add({
  file: 'online-privacy-checker.html', folder: 'coding',
  name: 'Online Privacy Checker', tag: 'Security', icon: 'fa-solid fa-user-shield',
  title: 'Online Privacy Checker | Quick Browser Privacy Audit',
  metaDesc: 'Get a quick in-browser audit of common privacy signals - cookies, do-not-track, storage and fingerprint surface - with practical tips.',
  desc: 'Review common browser privacy signals and get practical suggestions to reduce tracking exposure.',
  keywords: ['online privacy checker', 'privacy audit', 'do not track', 'cookies', 'browser privacy', 'security tool'],
  featureList: ['Privacy signal audit', 'Actionable tips', 'No tracking', '100% client-side'],
  panel: panel.wrap('opc', 'fa-solid fa-user-shield', 'Privacy checker',
    '<div class="actions"><button class="btn btn-primary"type="button"id="opcGo"><i class="fa-solid fa-user-shield"></i>Run privacy check</button></div>' +
    '<div id="opcRows"class="result-card"style="margin-top:14px"><div class="rt-label">Results</div></div>' +
    tiles([['Checks passed', 'opcScore']])),
  js: `
    function line(ok,label){return '<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span>'+label+'</span><span style="color:'+(ok?"#22c55e":"#f59e0b")+'">'+(ok?"Good":"Review")+'</span></div>';}
    function run(){var rows="";var passed=0;
      var dnt=navigator.doNotTrack==="1"||window.doNotTrack==="1";rows+=line(dnt,"Do Not Track enabled");if(dnt)passed++;
      var cookies=navigator.cookieEnabled;rows+=line(cookies,"Cookie support (required by many sites)");if(cookies)passed++;
      var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;rows+=line(!!tz,"Timezone detectable (fingerprint signal)");
      var touch="ontouchstart"in window;rows+=line(!touch,"No touch sensor (less unique)");if(!touch)passed++;
      var ls=false;try{localStorage.setItem("_opctest","1");localStorage.removeItem("_opctest");ls=true;}catch(e){}rows+=line(!!ls,"Local storage accessible");
      document.getElementById("opcRows").innerHTML='<div class="rt-label">Results</div>'+rows;
      document.getElementById("opcScore").textContent=passed+" / 4";
      document.getElementById("opcProc").textContent="Checked in this tab - 0 bytes uploaded.";}
    document.getElementById("opcGo").addEventListener("click",run);run();`,
  article: {
    title: 'Online Privacy Checker: Quick Browser Audit',
    lead: '<p>Understanding your privacy posture starts with knowing what your browser reveals. This <strong>online privacy checker</strong> reviews common signals and flags areas to review.</p>',
    sections: [
      { id: 'signals', icon: 'fa-solid fa-user-shield', heading: 'What is checked', html: '<p>The tool inspects Do Not Track, cookie availability, timezone exposure, touch capability and local storage access - the building blocks of tracking.</p>' },
      { id: 'improve', icon: 'fa-solid fa-lightbulb', heading: 'Improving privacy', html: '<p>Use a privacy browser, install a reputable tracker blocker, limit installed extensions, and review site permissions regularly.</p>' }
    ],
    steps: ['Press Run privacy check.', 'Review each result.', 'Apply the suggested improvements.'],
    facts: [['Checks', '5 signals'], ['Output', 'Pass/review'], ['Data', 'Never sent'], ['Data handling', 'Runs locally']],
    useCases: [['Awareness', 'See exposure.'], ['Hardening', 'Guide improvements.'], ['Teaching', 'Explain tracking.']],
    tips: ['Do Not Track is often ignored.', 'Block third-party cookies.', 'Review permissions monthly.'],
    takeaways: ['Browsers reveal several signals.', 'DNT is not enforceable.', 'Blockers reduce tracking.'],
    faq: [['Does DNT stop tracking?', 'Most sites ignore it.'], ['Is this a security scan?', 'No, it is an awareness check.'], ['Does it store anything?', 'No, it runs locally.'], ['Is my data uploaded?', 'No, it never leaves your device.']],
    conclusion: '<p>See the fingerprint side with the <a href="browser-fingerprint-checker.html">fingerprint checker</a>.</p>'
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
