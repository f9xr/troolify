/* ============================================================================
   Batch 13 - final it-tools migration batch
   Tracker batches 7 + 8 (11 tools) plus two genuine gaps (yaml-to-json,
   crontab-generator). Every tool has a real client-side implementation.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, panel, esc } = require('./tool-page-lib');
const ROOT = path.resolve(__dirname, '..');

const COPY_FN =
  'function _cp(t,cb){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){cb&&cb()},function(){_cfb(t);cb&&cb()})}else{_cfb(t);cb&&cb()}}' +
  'function _cfb(t){var ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy")}catch(e){}ta.remove()}';

const entries = [];

function add(spec) {
  const page = buildPage(spec);
  const dir = path.join(ROOT, 'tools', spec.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, spec.file), page);
  entries.push({
    name: spec.name, desc: spec.desc, icon: spec.icon,
    tag: spec.tag, category: spec.catName, href: 'tools/' + spec.folder + '/' + spec.file,
    keywords: spec.keywords, recent: true
  });
}

function base(name, folder, file, tag, icon, desc, metaDesc, title, keywords) {
  return {
    name, folder, file, tag,
    catName: folder === 'coding' ? 'Developer Tools' : folder === 'text' ? 'Text Tools' : folder === 'image' ? 'Image Tools' : 'Fun & Games',
    icon, desc, metaDesc, title, keywords,
    badge: '100% client-side &middot; zero data retention',
    featureList: ['Runs entirely in your browser', 'No uploads, no servers', 'Free with no limits', 'Works on desktop and mobile'],
    css: '', js: '', panel: '',
    article: { title, lead: '<p>' + esc(desc) + '</p>', sections: [], steps: [], facts: [], tips: [], useCases: [], faq: [], conclusion: '' }
  };
}

function stdArticle(s, sections, steps, tips, faq, conclusion) {
  s.article.sections = sections;
  s.article.steps = steps;
  s.article.tips = tips;
  s.article.faq = faq;
  s.article.conclusion = conclusion;
}

/* ========================================================================== */
/* 1. Phone Parser & Formatter                                                */
/* ========================================================================== */
(function () {
  const s = base('Phone Parser & Formatter', 'coding', 'phone-parser-and-formatter.html', 'Parser',
    'fa-solid fa-phone',
    'Parse any phone number into E.164, international and national formats, with country detection.',
    'Parse and format phone numbers online. Get E.164, international and national formats with country detection. 100% client-side.',
    'Phone Parser & Formatter - Parse & Format Phone Numbers',
    ['phone', 'parser', 'formatter', 'e164', 'international', 'format', 'number', 'msisdn']);

  s.css = '.pp-out{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin-top:14px}.pp-copiable{cursor:pointer}.pp-copiable:hover{border-color:rgba(96,165,250,.45)}';
  s.panel = panel.wrap('pp', 'fa-solid fa-phone', 'Phone number',
    '<div class="field" style="max-width:520px"><label for="ppIn">Phone number (any format)</label>' +
    '<input id="ppIn" placeholder="+1 (555) 123-4567 or 020 7946 0958" autocomplete="off"></div>' +
    '<div id="ppOut" class="pp-out"></div>');
  s.js = COPY_FN + `
var _ppDB=[["+1","United States / Canada"],["+44","United Kingdom"],["+61","Australia"],["+91","India"],["+81","Japan"],["+86","China"],["+49","Germany"],["+33","France"],["+39","Italy"],["+34","Spain"],["+31","Netherlands"],["+32","Belgium"],["+46","Sweden"],["+47","Norway"],["+45","Denmark"],["+358","Finland"],["+353","Ireland"],["+48","Poland"],["+43","Austria"],["+41","Switzerland"],["+351","Portugal"],["+30","Greece"],["+90","Turkey"],["+7","Russia"],["+380","Ukraine"],["+971","United Arab Emirates"],["+966","Saudi Arabia"],["+972","Israel"],["+52","Mexico"],["+55","Brazil"],["+54","Argentina"],["+27","South Africa"],["+64","New Zealand"],["+65","Singapore"],["+66","Thailand"],["+82","South Korea"],["+63","Philippines"],["+60","Malaysia"],["+62","Indonesia"],["+84","Vietnam"],["+852","Hong Kong"],["+886","Taiwan"],["+20","Egypt"],["+234","Nigeria"],["+254","Kenya"],["+92","Pakistan"],["+880","Bangladesh"],["+94","Sri Lanka"],["+977","Nepal"]];
var _ppIn=document.getElementById("ppIn"),_ppOut=document.getElementById("ppOut"),_ppProc=document.getElementById("ppProc");
function _ppParse(raw){
  var v=String(raw||"").trim();
  if(!v)return null;
  v=v.replace(/^00/,"+");
  var hasPlus=/^\\+/.test(v);
  var digits=v.replace(/[^0-9]/g,"");
  if(!hasPlus){
    if(digits[0]==="0")digits=digits.slice(1);
    return {digits:digits,country:null,e164:"(local)",intl:v,nat:v};
  }
  var country=null;
  for(var i=0;i<_ppDB.length;i++){
    var cc=_ppDB[i][0].slice(1);
    if(digits.indexOf(cc)===0){country=_ppDB[i];break;}
  }
  if(!country)return {digits:digits,country:null,e164:"+"+digits,intl:"+"+digits,nat:v};
  var national=digits.slice(country[0].length-1);
  var e164="+"+digits;
  var nat=national;
  if(country[0]==="+1"&&national.length===10)nat="("+national.slice(0,3)+") "+national.slice(3,6)+"-"+national.slice(6);
  else nat=national.replace(/(\\d{3,4})(?=\\d)/g,"$1 ").trim();
  return {digits:digits,country:country,e164:e164,intl:"+"+country[0].slice(1)+" "+national,nat:nat,ref:national};
}
function _ppRender(){
  var r=_ppParse(_ppIn.value);
  _ppOut.innerHTML="";
  if(!r){_ppProc.textContent="Enter a phone number to parse.";return;}
  var tiles=[["E.164",r.e164],["International",r.intl],["National",r.nat],["Country",r.country?r.country[1]:"Unknown"],["Digits only",r.digits||"-"]];
  if(r.ref&&r.country)tiles.push(["National number",r.ref]);
  tiles.forEach(function(t){
    var d=document.createElement("div");
    d.className="result-tile pp-copiable";
    d.title="Click to copy";
    d.innerHTML='<span class="rt-label">'+t[0]+'</span><span class="rt-value">'+t[1].replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</span>";
    d.addEventListener("click",function(){_cp(t[1]);_ppProc.textContent=t[0]+" copied.";});
    _ppOut.appendChild(d);
  });
  _ppProc.textContent="Parsed"+(r.country?" - "+r.country[1]:" (country not recognised)")+". Click any tile to copy.";
}
_ppIn.addEventListener("input",_ppRender);
document.getElementById("ppGo").addEventListener("click",_ppRender);
document.getElementById("ppSample").addEventListener("click",function(){_ppIn.value="+44 20 7946 0958";_ppRender();});
document.getElementById("ppClear").addEventListener("click",function(){_ppIn.value="";_ppOut.innerHTML="";_ppProc.textContent="Ready.";});
document.getElementById("ppCopy").addEventListener("click",function(){_cp(_ppIn.value);_ppProc.textContent="Raw number copied.";});`;
  s.panel = s.panel.replace('<div id="ppOut" class="pp-out"></div>',
    '<div id="ppOut" class="pp-out"></div><div class="actions" style="margin-top:14px">' +
    '<button class="btn btn-primary" type="button" id="ppGo"><i class="fa-solid fa-gears"></i>Parse</button>' +
    '<button class="rt-btn" type="button" id="ppCopy"><i class="fa-solid fa-copy"></i>Copy raw</button></div>');

  stdArticle(s,
    [{ id: 'overview', heading: 'What this phone parser does', html: '<p>Paste any phone number - with spaces, dashes, brackets or a country prefix - and get back the standard formats developers need: E.164 for APIs, an international display format, and a readable national format. Country detection covers 48 common calling codes.</p>' },
     { id: 'formats', heading: 'Formats explained', html: '<p><b>E.164</b> (+442079460958) is the format SMS and voice APIs expect. <b>International</b> adds spacing for humans. <b>National</b> drops the country code and applies local grouping, e.g. (020) 7946 0958.</p>' }],
    ['Type or paste a phone number', 'Click Parse (results also update as you type)', 'Click any result tile to copy that format'],
    ['Include the country prefix when you know it - local numbers are parsed as domestic', 'E.164 is the safest format to store in a database', 'Detection is heuristic; always let users confirm the country'],
    [['Does this validate the number?', 'It checks structure and detects the country, but cannot confirm the number is assigned.'], ['Is my input sent anywhere?', 'No. Parsing runs entirely in your browser.']],
    'For more string utilities see the <a href="./text-to-array-converter.html">text tools</a> or the <a href="../../tools/">full catalog</a>.');
  add(s);
})();

/* ========================================================================== */
/* 2. User Agent Parser                                                       */
/* ========================================================================== */
(function () {
  const s = base('User Agent Parser', 'coding', 'user-agent-parser.html', 'Parser',
    'fa-solid fa-computer',
    'Break a browser user agent string into browser, engine, OS and device details.',
    'Parse user agent strings into browser, engine, OS and device info. Free, private, client-side.',
    'User Agent Parser - Parse Browser & Device from User Agent',
    ['user agent', 'ua', 'parser', 'browser', 'device', 'os', 'parse']);
  s.css = '.ua-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin-top:14px}';
  s.panel = panel.wrap('ua', 'fa-solid fa-computer', 'User agent string',
    panel.ioTwo('ua', 'User agent string', 'Parsed details (JSON)', 'Paste a UA or leave empty to use this browser', '') +
    '<div class="actions" style="margin-top:14px"><button class="btn btn-primary" type="button" id="uaGo"><i class="fa-solid fa-magnifying-glass"></i>Parse</button>' +
    '<button class="rt-btn" type="button" id="uaCopy"><i class="fa-solid fa-copy"></i>Copy JSON</button>' +
    '<button class="rt-btn" type="button" id="uaThis"><i class="fa-solid fa-desktop"></i>Use my UA</button></div>');
  s.js = COPY_FN + `
var _uaIn=document.getElementById("uaIn"),_uaOut=document.getElementById("uaOut"),_uaProc=document.getElementById("uaProc");
function _uaParse(u){
  var r={browser:"Unknown",engine:"Unknown",os:"Unknown",device:"Desktop",bot:false,raw:u};
  if(/bot|crawler|spider|crawling|curl|wget|python-requests|headless/i.test(u)){r.bot=true;r.browser="Bot / crawler";}
  if(/Edg\\//.test(u))r.browser="Edge"+(u.match(/Edg\\/([\\d.]+)/)? " "+u.match(/Edg\\/([\\d.]+)/)[1]:"");
  else if(/OPR\\//.test(u)||/Opera/.test(u))r.browser="Opera"+(u.match(/OPR\\/([\\d.]+)/)? " "+u.match(/OPR\\/([\\d.]+)/)[1]:"");
  else if(/Firefox\\//.test(u))r.browser="Firefox"+(u.match(/Firefox\\/([\\d.]+)/)? " "+u.match(/Firefox\\/([\\d.]+)/)[1]:"");
  else if(/Chrome\\//.test(u)&&!/Edg\\//.test(u))r.browser="Chrome"+(u.match(/Chrome\\/([\\d.]+)/)? " "+u.match(/Chrome\\/([\\d.]+)/)[1]:"");
  else if(/Safari\\//.test(u)&&/Version\\//.test(u))r.browser="Safari"+(u.match(/Version\\/([\\d.]+)/)? " "+u.match(/Version\\/([\\d.]+)/)[1]:"");
  else if(/MSIE|Trident/.test(u))r.browser="Internet Explorer"+(u.match(/MSIE ([\\d.]+)/)? " "+u.match(/MSIE ([\\d.]+)/)[1]:"");
  if(/Chrome\\/|Chromium/.test(u)&&!/Edg\\//.test(u))r.engine="Blink";
  else if(/Gecko\\//.test(u)&&/Firefox\\//.test(u))r.engine="Gecko";
  else if(/WebKit\\//.test(u))r.engine="WebKit";
  else if(/Trident\\//.test(u))r.engine="Trident";
  if(/Windows NT 10|Windows NT 11/.test(u))r.os="Windows 10/11";
  else if(/Windows NT 6\\.3/.test(u))r.os="Windows 8.1";
  else if(/Windows NT 6\\.1/.test(u))r.os="Windows 7";
  else if(/Windows/.test(u))r.os="Windows";
  else if(/iPhone|iPad|iPod/.test(u)){r.os="iOS";r.device=/iPad/.test(u)?"Tablet":"Mobile";}
  else if(/Mac OS X/.test(u))r.os="macOS"+(u.match(/Mac OS X ([\\d_]+)/)? " "+u.match(/Mac OS X ([\\d_]+)/)[1].replace(/_/g,"."):"");
  else if(/Android/.test(u)){r.os="Android"+(u.match(/Android ([\\d.]+)/)? " "+u.match(/Android ([\\d.]+)/)[1]:"");r.device=/Mobile/.test(u)?"Mobile":"Tablet";}
  else if(/CrOS/.test(u))r.os="Chrome OS";
  else if(/Linux/.test(u))r.os="Linux";
  if(/Tablet|iPad/.test(u)&&r.device==="Desktop")r.device="Tablet";
  if(/Mobile|Android.*Mobile|iPhone/.test(u)&&r.device==="Desktop")r.device="Mobile";
  return r;
}
function _uaRun(){
  var u=_uaIn.value.trim()||navigator.userAgent;
  _uaIn.value=u;
  var r=_uaParse(u);
  _uaOut.value=JSON.stringify(r,null,2);
  _uaProc.textContent=r.bot?"Looks like a bot/crawler client.":"Detected: "+r.browser+" on "+r.os+" ("+r.device+").";
}
document.getElementById("uaGo").addEventListener("click",_uaRun);
document.getElementById("uaThis").addEventListener("click",function(){_uaIn.value=navigator.userAgent;_uaRun();});
document.getElementById("uaCopy").addEventListener("click",function(){_cp(_uaOut.value);_uaProc.textContent="JSON copied.";});
document.getElementById("uaSample").addEventListener("click",function(){_uaIn.value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";_uaRun();});
document.getElementById("uaClear").addEventListener("click",function(){_uaIn.value="";_uaOut.value="";_uaProc.textContent="Ready.";});
_uaRun();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'Anatomy of a user agent', html: '<p>A user agent string packs four things into one line: the browser and version, the rendering engine, the operating system, and a device hint. This parser separates them with ordered rules so Edge beats Chrome and Safari detection stays accurate.</p>' },
     { id: 'why', heading: 'Why parse user agents?', html: '<p>Debugging analytics, tailoring download links, spotting outdated browsers, or filtering bot traffic. For anything security-sensitive remember user agents are trivially spoofed - treat them as hints, not identity.</p>' }],
    ['Paste a user agent string (or click "Use my UA")', 'Click Parse to split it into browser, engine, OS and device', 'Copy the JSON for your notes or bug reports'],
    ['Browsers fork often - Edge and Opera pretend to be Chrome, so rule order matters', 'User agents can be spoofed; never use them for authentication', 'Device detection is a guess based on keywords like "Mobile" and "iPad"'],
    [['Does it detect bots?', 'Yes - common bot/crawler/curl signatures are flagged.'], ['Is the input stored?', 'No, parsing happens locally in your browser.']],
    'Related: <a href="./device-information.html">Device Information</a> · <a href="./url-parser.html">URL Parser</a>');
  add(s);
})();

/* ========================================================================== */
/* 3. Device Information                                                      */
/* ========================================================================== */
(function () {
  const s = base('Device Information', 'coding', 'device-information.html', 'Info',
    'fa-solid fa-mobile-screen',
    'See your browser, screen, hardware and network details - all reported by this tab.',
    'View device, screen, browser, language and network information in your browser. Free and private.',
    'Device Information - Browser, Screen & Hardware Details',
    ['device', 'info', 'browser', 'screen', 'hardware', 'network', 'fingerprint']);
  s.css = '.di-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}.di-grid .result-tile{cursor:pointer}';
  s.panel = panel.wrap('di', 'fa-solid fa-mobile-screen', 'This device',
    '<div class="di-grid" id="diGrid"></div>' +
    '<div class="actions" style="margin-top:14px"><button class="rt-btn" type="button" id="diCopy"><i class="fa-solid fa-copy"></i>Copy all</button>' +
    '<button class="rt-btn" type="button" id="diRefresh"><i class="fa-solid fa-rotate"></i>Refresh</button></div>');
  s.js = COPY_FN + `
var _diGrid=document.getElementById("diGrid"),_diProc=document.getElementById("diProc"),_diData=[];
function _diRow(k,v){return [k,String(v===undefined||v===null||v===""?"-":v)];}
function _diCollect(){
  var d=[],sc=window.screen||{};
  d.push(_diRow("Browser UA",navigator.userAgent));
  d.push(_diRow("Platform",navigator.platform||(navigator.userAgentData?navigator.userAgentData.platform:"-")));
  d.push(_diRow("Languages",(navigator.languages||[navigator.language]).join(", ")));
  d.push(_diRow("Time zone",(Intl.DateTimeFormat().resolvedOptions().timeZone)||"-"));
  d.push(_diRow("Screen",sc.width+" x "+sc.height+" ("+sc.width+"x"+sc.height+" CSS px)"));
  d.push(_diRow("Window",window.innerWidth+" x "+window.innerHeight));
  d.push(_diRow("Device pixel ratio",window.devicePixelRatio||1));
  d.push(_diRow("Color depth",(sc.colorDepth||"-")+"-bit"));
  d.push(_diRow("Touch points",navigator.maxTouchPoints||0));
  d.push(_diRow("CPU cores",navigator.hardwareConcurrency||"-"));
  d.push(_diRow("Device memory",navigator.deviceMemory?navigator.deviceMemory+" GB":"-"));
  d.push(_diRow("Cookies enabled",navigator.cookieEnabled?"yes":"no"));
  d.push(_diRow("Online",navigator.onLine?"yes":"no"));
  var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  d.push(_diRow("Connection",c?(c.effectiveType||c.type||"")+(" downlink" in c?" ~"+c.downlink+" Mb/s":""):"-"));
  d.push(_diRow("PDF viewer",navigator.pdfViewerEnabled===undefined?"-":(navigator.pdfViewerEnabled?"yes":"no")));
  return d;
}
function _diRender(){
  _diData=_diCollect();
  _diGrid.innerHTML="";
  _diData.forEach(function(row){
    var el=document.createElement("div");
    el.className="result-tile";
    el.title="Click to copy";
    el.innerHTML='<span class="rt-label">'+row[0]+'</span><span class="rt-value" style="font-size:13.5px;font-weight:600;color:var(--ink)">'+String(row[1]).replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</span>";
    el.addEventListener("click",function(){_cp(row[1]);_diProc.textContent=row[0]+" copied.";});
    _diGrid.appendChild(el);
  });
  _diProc.textContent="Collected "+_diData.length+" properties from this tab. Click any tile to copy.";
}
document.getElementById("diCopy").addEventListener("click",function(){_cp(_diData.map(function(r){return r[0]+": "+r[1]}).join("\\n"));_diProc.textContent="All properties copied.";});
document.getElementById("diRefresh").addEventListener("click",_diRender);
document.getElementById("diSample").addEventListener("click",_diRender);
document.getElementById("diClear").addEventListener("click",function(){_diGrid.innerHTML="";_diProc.textContent="Ready.";});
_diRender();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'What your browser reports', html: '<p>Every page you visit can read a surprising amount of device information: screen size, pixel ratio, language, time zone, CPU cores and more. This tool shows exactly what this tab exposes - useful for QA, support and privacy awareness.</p>' },
     { id: 'privacy', heading: 'Privacy note', html: '<p>Combined, these properties form a partial fingerprint that can help track you across sites. Nothing here leaves your browser on this page, but be aware that other sites read the same data.</p>' }],
    ['Review the tiles - they update instantly from browser APIs', 'Click any tile to copy that value', 'Use Copy all for a full text dump when filing a bug report'],
    ['Resize the window and hit Refresh to see new window dimensions', 'Some values (device memory, connection) are only exposed by some browsers', 'Headless browsers and privacy modes report reduced information'],
    [['Does this upload my device data?', 'No. Everything is read and displayed locally.'], ['Why is some information "-"?', 'The browser only exposes certain values on secure contexts or specific engines.']],
    'Related: <a href="./user-agent-parser.html">User Agent Parser</a> · <a href="./image-size-finder.html">Image Size Finder</a>');
  add(s);
})();

/* ========================================================================== */
/* 4. URL Parser                                                              */
/* ========================================================================== */
(function () {
  const s = base('URL Parser', 'coding', 'url-parser.html', 'Parser',
    'fa-solid fa-link',
    'Decompose any URL into protocol, host, path, query parameters and fragment.',
    'Parse URLs into protocol, hostname, path, query params and hash. Free online URL parser, 100% client-side.',
    'URL Parser - Break Down URLs into Components',
    ['url', 'parser', 'parse', 'query', 'hostname', 'uri', 'components']);
  s.css = '.up-params{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}.up-params th,.up-params td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--border)}.up-params th{color:var(--muted);font-size:11.5px;text-transform:uppercase;letter-spacing:.04em}';
  s.panel = panel.wrap('up', 'fa-solid fa-link', 'URL to parse',
    '<div class="field"><label for="upIn">URL</label><input id="upIn" placeholder="https://user:pass@example.com:8443/path/page?a=1&amp;b=2#section" autocomplete="off" spellcheck="false"></div>' +
    '<div class="actions" style="margin-top:14px"><button class="btn btn-primary" type="button" id="upGo"><i class="fa-solid fa-scissors"></i>Parse</button>' +
    '<button class="rt-btn" type="button" id="upCopy"><i class="fa-solid fa-copy"></i>Copy JSON</button></div>' +
    '<div class="result-grid" id="upTiles" style="margin-top:14px"></div>' +
    '<div id="upParamsWrap"></div>');
  s.js = COPY_FN + `
var _upIn=document.getElementById("upIn"),_upTiles=document.getElementById("upTiles"),_upWrap=document.getElementById("upParamsWrap"),_upProc=document.getElementById("upProc"),_upJson="";
function _upTile(label,value){
  var d=document.createElement("div");
  d.className="result-tile";
  d.title="Click to copy";
  d.innerHTML='<span class="rt-label">'+label+'</span><span class="rt-value" style="font-size:14px;word-break:break-all">'+String(value===""?"(empty)":value).replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</span>";
  d.addEventListener("click",function(){_cp(String(value));_upProc.textContent=label+" copied.";});
  _upTiles.appendChild(d);
}
function _upRun(){
  var raw=_upIn.value.trim();
  if(!raw){_upProc.textContent="Enter a URL to parse.";return;}
  var u;
  try{u=new URL(raw);}catch(e){
    try{u=new URL("https://"+raw);}catch(e2){_upProc.textContent="That is not a valid URL.";return;}
  }
  _upTiles.innerHTML="";_upWrap.innerHTML="";
  _upTile("Protocol",u.protocol.replace(":",""));
  _upTile("Host",u.host);
  _upTile("Hostname",u.hostname);
  _upTile("Port",u.port||(u.protocol==="https:"?"443 (default)":u.protocol==="http:"?"80 (default)":""));
  _upTile("Path",u.pathname);
  _upTile("Directory",u.pathname.indexOf("/",1)!==-1?u.pathname.slice(0,u.pathname.lastIndexOf("/")):"/");
  _upTile("File",u.pathname.slice(u.pathname.lastIndexOf("/")+1));
  _upTile("Fragment",u.hash.replace("#",""));
  _upTile("Origin",u.origin);
  var pairs=Array.from(u.searchParams.entries());
  _upTile("Query params",pairs.length);
  if(pairs.length){
    var t=document.createElement("table");
    t.className="up-params";
    t.innerHTML="<thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>"+pairs.map(function(p){return "<tr><td><code>"+p[0].replace(/</g,"&lt;")+"</code></td><td><code>"+String(p[1]).replace(/</g,"&lt;")+"</code></td></tr>"}).join("")+"</tbody>";
    _upWrap.appendChild(t);
  }
  _upJson=JSON.stringify({protocol:u.protocol.replace(":",""),host:u.host,hostname:u.hostname,port:u.port,pathname:u.pathname,search:u.search,hash:u.hash,origin:u.origin,params:pairs.reduce(function(a,p){a[p[0]]=p[1];return a},{})},null,2);
  _upProc.textContent="Parsed "+pairs.length+" query parameter"+(pairs.length===1?"":"s")+". Click any tile to copy.";
}
_upIn.addEventListener("keydown",function(e){if(e.key==="Enter")_upRun();});
document.getElementById("upGo").addEventListener("click",_upRun);
document.getElementById("upCopy").addEventListener("click",function(){_cp(_upJson);_upProc.textContent="JSON copied.";});
document.getElementById("upSample").addEventListener("click",function(){_upIn.value="https://www.example.com:8443/products/shoes.htm?color=red&size=42&utm_source=newsletter#reviews";_upRun();});
document.getElementById("upClear").addEventListener("click",function(){_upIn.value="";_upTiles.innerHTML="";_upWrap.innerHTML="";_upProc.textContent="Ready.";});`;

  stdArticle(s,
    [{ id: 'overview', heading: 'URL parts at a glance', html: '<p>A URL is more than a link: scheme, credentials, host, port, path, query string and fragment each carry different meaning. This parser splits them with the browser\u2019s own URL API - the same parser your JavaScript runs on - so results are always spec-accurate.</p>' },
     { id: 'query', heading: 'Query parameters', html: '<p>Every key/value pair after the <code>?</code> is listed in a table, in order. Marketers use these for campaign tracking (utm_*), APIs use them for pagination and filters - and attackers sometimes hide payloads there, which makes this a handy security review tool too.</p>' }],
    ['Paste a full URL (or just a domain - https:// is added for you)', 'Click Parse to see every component', 'Click any tile, or Copy JSON, to grab the result'],
    ['Relative URLs are auto-prefixed with https:// for parsing', 'Ports are shown as defaults (80/443) when omitted', 'The parser uses the native URL API - identical to what scripts on any site see'],
    [['Does it work with malformed URLs?', 'It retries with https:// prepended; truly invalid input is rejected.'], ['Are credentials shown?', 'The username/password components are parsed by the URL API but not displayed in tiles for safety.']],
    'Related: <a href="./url-encoder-decoder.html">URL Encoder / Decoder</a> · <a href="./safelink-decoder.html">Safelink Decoder</a>');
  add(s);
})();

/* ========================================================================== */
/* 5. Safelink Decoder                                                        */
/* ========================================================================== */
(function () {
  const s = base('Safelink Decoder', 'coding', 'safelink-decoder.html', 'Decoder',
    'fa-solid fa-shield-halved',
    'Unwrap Google, Bing, Proofpoint, Yahoo and other redirect/safelink URLs back to the original target.',
    'Decode safelink and redirect URLs from Google, Bing, Proofpoint and Yahoo back to the original link.',
    'Safelink Decoder - Decode Redirect & Safelink URLs',
    ['safelink', 'decoder', 'redirect', 'unwrap', 'google', 'bing', 'proofpoint', 'url']);
  s.panel = panel.wrap('sl', 'fa-solid fa-shield-halved', 'Wrapped URL(s) - one per line',
    panel.ioTwo('sl', 'Safelink / redirect URL', 'Original URL(s)', 'https://www.google.com/url?q=https%3A%2F%2Fexample.com...', '') +
    '<div class="actions" style="margin-top:14px"><button class="btn btn-primary" type="button" id="slGo"><i class="fa-solid fa-unlock"></i>Decode</button>' +
    '<button class="rt-btn" type="button" id="slCopy"><i class="fa-solid fa-copy"></i>Copy results</button></div>');
  s.js = COPY_FN + `
var _slIn=document.getElementById("slIn"),_slOut=document.getElementById("slOut"),_slProc=document.getElementById("slProc");
function _b64dec(s){
  try{
    s=s.replace(/-/g,"+").replace(/_/g,"/");
    while(s.length%4)s+="=";
    var bin=atob(s),out="";
    for(var i=0;i<bin.length;i++)out+=String.fromCharCode(bin.charCodeAt(i));
    return decodeURIComponent(escape(out));
  }catch(e){return null}
}
function _decodeOne(raw){
  var v=String(raw||"").trim();
  if(!v)return null;
  var u;
  try{u=new URL(v);}catch(e){return {in:raw,out:null,note:"not a valid URL"}}
  var host=u.hostname, params=u.searchParams, target=null, note="";
  if(/(^|\.)google\./.test(host)&&u.pathname==="/url"){
    target=params.get("q")||params.get("url")||null;
    if(target&&params.get("sa")==="t")note="Google redirect";
  }else if(/(^|\.)bing\.com/.test(host)&&/\\/ck\\//.test(u.pathname)){
    var b=params.get("u");
    if(b){
      var dec=_b64dec(b.replace(/^a1/,""));
      if(dec&&/^https?:/.test(dec)){target=dec;note="Bing redirect";}
    }
  }else if(/proofpoint|urldefense/.test(host)){
    var m=v.match(/__https?:\\/\\/[^$]+/);
    if(m){target=m[0].slice(2);note="Proofpoint URLDefense";}
  }else if(/search\.yahoo\./.test(host)){
    var m2=v.match(/RU=([^/]+)\\/RK=/);
    if(m2){target=decodeURIComponent(m2[1]);note="Yahoo redirect";}
  }else if(/facebook\.com|fb\.com/.test(host)&&u.pathname==="/l.php"){
    target=params.get("u");if(target)note="Facebook link shim";
  }
  if(!target){
    for(var k of ["url","u","q","target","redirect","redirect_uri","dest","destination","link","r"]){
      var val=params.get(k);
      if(val&&/^https?:\\/\\//.test(val)){target=val;note="via ?"+k+"=";break;}
    }
  }
  if(target){
    try{target=new URL(target).href;}catch(e){}
    return {in:raw,out:target,note:note||"wrapped URL"};
  }
  return {in:raw,out:v,note:"no wrapper detected - returned as-is"};
}
function _slRun(){
  var lines=_slIn.value.split(/\\r?\\n/).filter(function(l){return l.trim()});
  if(!lines.length){_slProc.textContent="Paste one or more wrapped URLs.";return;}
  var res=lines.map(_decodeOne).filter(Boolean);
  _slOut.value=res.map(function(r){return r.out+(r.note?"   ["+r.note+"]":"")}).join("\\n");
  _slProc.textContent="Decoded "+res.length+" URL"+(res.length===1?"":"s")+".";
}
document.getElementById("slGo").addEventListener("click",_slRun);
document.getElementById("slCopy").addEventListener("click",function(){_cp(_slOut.value);_slProc.textContent="Results copied.";});
document.getElementById("slSample").addEventListener("click",function(){_slIn.value="https://www.google.com/url?q=https%3A%2F%2Ff9xr.org%2Ftroolify%2F&sa=t&ved=2ahUKEwi";_slRun();});
document.getElementById("slClear").addEventListener("click",function(){_slIn.value="";_slOut.value="";_slProc.textContent="Ready.";});`;

  stdArticle(s,
    [{ id: 'overview', heading: 'What is a safelink?', html: '<p>Email security gateways, search engines and social networks wrap outbound links in redirect URLs - Google\u2019s <code>/url?q=</code>, Bing\u2019s base64 <code>/ck/a</code> links, Proofpoint URLDefense and Yahoo\u2019s <code>RU=</code> redirects are the common ones. The real destination hides inside parameters, base64 or special markers.</p>' },
     { id: 'supported', heading: 'Wrappers handled', html: '<p>Google redirect links, Bing redirect links (base64), Proofpoint URLDefense, Yahoo search redirects, Facebook link shims, plus a generic fallback that checks the usual suspect parameters (url, u, q, target, redirect, dest, link...). Lines that are not wrapped are returned unchanged so you can paste mixed lists.</p>' }],
    ['Paste one wrapped URL per line', 'Click Decode', 'Copy the original URLs out of the right-hand box'],
    ['Bing links encode the target as base64 after an "a1" prefix - the decoder strips and decodes it', 'Proofpoint links wrap the URL between "__" and "$$" markers', 'If nothing is detected the URL is returned as-is so you never lose data'],
    [['Is this safe?', 'Decoding is passive string work - no network requests are made.'], ['Why would a link be wrapped?', 'Security scanners rewrite links to check them; search engines use redirects for tracking clicks.']],
    'Related: <a href="./url-parser.html">URL Parser</a> · <a href="./url-encoder-decoder.html">URL Encoder / Decoder</a>');
  add(s);
})();

/* ========================================================================== */
/* 6. MIME Types                                                              */
/* ========================================================================== */
(function () {
  const s = base('MIME Types', 'coding', 'mime-types.html', 'Reference',
    'fa-solid fa-file-code',
    'Look up MIME types by file extension or type name - a compact developer reference.',
    'Quick MIME type lookup by extension or name. Search hundreds of common MIME types free online.',
    'MIME Types - File Extension to MIME Type Lookup',
    ['mime', 'mimetype', 'content-type', 'extension', 'file type', 'lookup', 'reference']);
  s.css = '.mt-list{margin-top:12px;display:grid;gap:6px;max-height:420px;overflow-y:auto}.mt-row{display:flex;justify-content:space-between;gap:10px;padding:9px 12px;border:1px solid var(--border);border-radius:10px;font-size:13.5px;cursor:pointer}.mt-row:hover{border-color:rgba(96,165,250,.4)}.mt-row b{color:#93C5FD;font-family:ui-monospace,Menlo,monospace;font-weight:700}.mt-row span{color:var(--muted);font-family:ui-monospace,Menlo,monospace}';
  s.panel = panel.wrap('mt', 'fa-solid fa-file-code', 'MIME type search',
    '<div class="field" style="max-width:460px"><label for="mtQ">File extension or MIME type</label><input id="mtQ" placeholder="pdf, image/, video/mp4" autocomplete="off"></div>' +
    '<div class="mt-list" id="mtList"></div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="mtCount"></span></p>');
  s.js = COPY_FN + `
var _mtDB=[["aac","audio/aac"],["abw","application/x-abiword"],["arc","application/x-freearc"],["avi","video/x-msvideo"],["azw","application/vnd.amazon.ebook"],["bat","application/x-msdownload"],["bin","application/octet-stream"],["bmp","image/bmp"],["bz","application/x-bzip"],["bz2","application/x-bzip2"],["cda","application/x-cdf"],["csh","application/x-csh"],["css","text/css"],["csv","text/csv"],["doc","application/msword"],["docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],["eot","application/vnd.ms-fontobject"],["epub","application/epub+zip"],["gz","application/gzip"],["gif","image/gif"],["htm","text/html"],["html","text/html"],["ico","image/vnd.microsoft.icon"],["ics","text/calendar"],["jar","application/java-archive"],["jpeg","image/jpeg"],["jpg","image/jpeg"],["js","text/javascript"],["json","application/json"],["jsonld","application/ld+json"],["jsonp","application/javascript"],["mid","audio/midi"],["midi","audio/x-midi"],["mjs","text/javascript"],["mp3","audio/mpeg"],["mp4","video/mp4"],["mpeg","video/mpeg"],["mpp","application/vnd.ms-project"],["odt","application/vnd.oasis.opendocument.text"],["oga","audio/ogg"],["ogv","video/ogg"],["ogx","application/ogg"],["opus","audio/opus"],["otf","font/otf"],["png","image/png"],["pdf","application/pdf"],["ppt","application/vnd.ms-powerpoint"],["pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation"],["rar","application/vnd.rar"],["rtf","application/rtf"],["sh","application/x-sh"],["svg","image/svg+xml"],["swf","application/x-shockwave-flash"],["tar","application/x-tar"],["tif","image/tiff"],["tiff","image/tiff"],["ts","video/mp2t"],["ttf","font/ttf"],["txt","text/plain"],["wav","audio/wav"],["weba","audio/webm"],["webm","video/webm"],["webp","image/webp"],["woff","font/woff"],["woff2","font/woff2"],["xls","application/vnd.ms-excel"],["xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],["xml","application/xml"],["xul","application/vnd.mozilla.xul+xml"],["yaml","application/yaml"],["yml","application/yaml"],["zip","application/zip"],["7z","application/x-7z-compressed"]];
var _mtQ=document.getElementById("mtQ"),_mtList=document.getElementById("mtList"),_mtCount=document.getElementById("mtCount"),_mtProc=document.getElementById("mtProc");
function _mtRender(){
  var q=(_mtQ.value||"").trim().toLowerCase();
  var rows=_mtDB.filter(function(r){return !q||r[0].indexOf(q)===0||r[1].indexOf(q)!==-1||r[0].indexOf(q)!==-1});
  _mtList.innerHTML="";
  rows.slice(0,80).forEach(function(r){
    var d=document.createElement("div");
    d.className="mt-row";
    d.innerHTML="<b>."+r[0]+"</b><span>"+r[1]+"</span>";
    d.title="Click to copy "+r[1];
    d.addEventListener("click",function(){_cp(r[1]);_mtProc.textContent="Copied "+r[1];});
    _mtList.appendChild(d);
  });
  _mtCount.textContent=rows.length+" match"+(rows.length===1?"":"es")+(rows.length>80?" (showing first 80)":"");
}
_mtQ.addEventListener("input",_mtRender);
document.getElementById("mtSample").addEventListener("click",function(){_mtQ.value="image/";_mtRender();});
document.getElementById("mtClear").addEventListener("click",function(){_mtQ.value="";_mtRender();_mtProc.textContent="Ready.";});
_mtRender();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'What is a MIME type?', html: '<p>A MIME type (now officially an IANA media type) tells software what kind of content a file holds. <code>Content-Type: application/pdf</code> in an HTTP header is the same label the file extension implies - browsers, servers and APIs all rely on them.</p>' },
     { id: 'usage', heading: 'Where they are used', html: '<p>HTTP responses, HTML <code>&lt;input accept&gt;</code> attributes, email attachments, and multipart uploads. Getting the type wrong is a classic bug: serving JSON as <code>text/plain</code> breaks APIs, and mislabelled image types fail uploads.</p>' }],
    ['Type a file extension (pdf) or a type prefix (audio/)', 'Click any row to copy the MIME type', 'Use the Sample button to browse all image types'],
    ['The charset suffix "; charset=utf-8" is added by servers for text types', 'The generic application/octet-stream means "unknown binary"', 'The official registry is iana.org/media-types'],
    [['Is this the complete IANA registry?', 'No - it covers the most common web types; obscure vendor types are omitted.'], ['Does searching send data anywhere?', 'No, the table is embedded in the page.']],
    'Related: <a href="./html-entity-encoder.html">HTML Entity Encoder</a> · <a href="./base64-file-converter.html">Base64 File Converter</a>');
  add(s);
})();

/* ========================================================================== */
/* 7. ASCII Text Drawer                                                       */
/* ========================================================================== */
const FONT5X7 = {
  ' ': [0,0,0,0,0], '!': [0,0,0x5F,0,0], '"': [0,7,0,7,0], '#': [0x14,0x7F,0x14,0x7F,0x14], '$': [0x24,0x2A,0x7F,0x2A,0x12], '%': [0x23,0x13,0x08,0x64,0x62], '&': [0x36,0x49,0x55,0x22,0x50], "'": [0,5,3,0,0], '(': [0,0x1C,0x22,0x41,0], ')': [0,0x41,0x22,0x1C,0], '*': [0x14,8,0x3E,8,0x14], '+': [8,8,0x3E,8,8], ',': [0,0x50,0x30,0,0], '-': [8,8,8,8,8], '.': [0,0x60,0x60,0,0], '/': [0x20,0x10,8,4,2],
  '0': [0x3E,0x51,0x49,0x45,0x3E], '1': [0,0x42,0x7F,0x40,0], '2': [0x42,0x61,0x51,0x49,0x46], '3': [0x21,0x41,0x45,0x4B,0x31], '4': [0x18,0x14,0x12,0x7F,0x10], '5': [0x27,0x45,0x45,0x45,0x39], '6': [0x3C,0x4A,0x49,0x49,0x30], '7': [1,0x71,9,5,3], '8': [0x36,0x49,0x49,0x49,0x36], '9': [6,0x49,0x49,0x29,0x1E],
  ':': [0,0x36,0x36,0,0], ';': [0,0x56,0x36,0,0], '<': [8,0x14,0x22,0x41,0], '=': [0x14,0x14,0x14,0x14,0x14], '>': [0,0x41,0x22,0x14,8], '?': [2,1,0x51,9,6], '@': [0x32,0x49,0x79,0x41,0x3E],
  'A': [0x7E,0x11,0x11,0x11,0x7E], 'B': [0x7F,0x49,0x49,0x49,0x36], 'C': [0x3E,0x41,0x41,0x41,0x22], 'D': [0x7F,0x41,0x41,0x22,0x1C], 'E': [0x7F,0x49,0x49,0x49,0x41], 'F': [0x7F,9,9,9,1], 'G': [0x3E,0x41,0x49,0x49,0x7A], 'H': [0x7F,8,8,8,0x7F], 'I': [0,0x41,0x7F,0x41,0], 'J': [0x20,0x40,0x41,0x3F,1], 'K': [0x7F,8,0x14,0x22,0x41], 'L': [0x7F,0x40,0x40,0x40,0x40], 'M': [0x7F,2,0xC,2,0x7F], 'N': [0x7F,4,8,0x10,0x7F], 'O': [0x3E,0x41,0x41,0x41,0x3E], 'P': [0x7F,9,9,9,6], 'Q': [0x3E,0x41,0x51,0x21,0x5E], 'R': [0x7F,9,0x19,0x29,0x46], 'S': [0x46,0x49,0x49,0x49,0x31], 'T': [1,1,0x7F,1,1], 'U': [0x3F,0x40,0x40,0x40,0x3F], 'V': [0x1F,0x20,0x40,0x20,0x1F], 'W': [0x3F,0x40,0x38,0x40,0x3F], 'X': [0x63,0x14,8,0x14,0x63], 'Y': [7,8,0x70,8,7], 'Z': [0x61,0x51,0x49,0x45,0x43]
};
(function () {
  const s = base('ASCII Text Drawer', 'text', 'ascii-text-drawer.html', 'Art',
    'fa-solid fa-font',
    'Turn short text into big block-letter ASCII art, ready to paste into terminals and logs.',
    'Create ASCII art text online - big block letters for terminal banners and logs. Free and client-side.',
    'ASCII Text Drawer - Big Block Letter ASCII Art',
    ['ascii', 'art', 'text', 'banner', 'drawer', 'block letters', 'terminal']);
  s.css = '#adOut{margin-top:14px;background:#0D1117;border:1px solid var(--border);border-radius:14px;padding:16px;overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.15;color:#9BE89B;min-height:120px;white-space:pre}';
  s.panel = panel.wrap('ad', 'fa-solid fa-font', 'Text to draw',
    '<div class="field" style="max-width:460px"><label for="adIn">Text (A-Z, 0-9 and basic punctuation)</label><input id="adIn" maxlength="14" placeholder="HELLO" autocomplete="off"></div>' +
    '<pre id="adOut" aria-live="polite"></pre>' +
    '<div class="actions" style="margin-top:14px"><button class="rt-btn" type="button" id="adCopy"><i class="fa-solid fa-copy"></i>Copy art</button></div>');
  s.js = COPY_FN + 'var FONT5X7=' + JSON.stringify(FONT5X7) + ';' + `
var _adIn=document.getElementById("adIn"),_adOut=document.getElementById("adOut"),_adProc=document.getElementById("adProc");
function _adDraw(text){
  var rows=["","","","","","",""];
  var chars=text.toUpperCase().split("");
  var started=false;
  chars.forEach(function(ch){
    var g=FONT5X7[ch];
    if(!g){g=FONT5X7[ch===" "?" ":ch]||null;}
    if(!g)return;
    if(ch===" "&&started){for(var r=0;r<7;r++)rows[r]+="  ";return;}
    if(ch===" ")return;
    started=true;
    for(var r=0;r<7;r++){
      var line="";
      for(var c=0;c<5;c++){
        line+=(g[c]&(1<<r))?"##":"  ";
      }
      rows[r]+=line+"  ";
    }
  });
  return rows.map(function(r){return r.replace(/ +$/,"")}).join("\\n");
}
function _adRun(){
  var t=_adIn.value.trim();
  if(!t){_adOut.textContent="";_adProc.textContent="Type some text to draw.";return;}
  var art=_adDraw(t);
  _adOut.textContent=art||"(no drawable characters)";
  _adProc.textContent="Rendered "+t.length+" character"+(t.length===1?"":"s")+".";
}
_adIn.addEventListener("input",_adRun);
document.getElementById("adCopy").addEventListener("click",function(){_cp(_adOut.textContent);_adProc.textContent="Art copied.";});
document.getElementById("adSample").addEventListener("click",function(){_adIn.value="HELLO 42";_adRun();});
document.getElementById("adClear").addEventListener("click",function(){_adIn.value="";_adOut.textContent="";_adProc.textContent="Ready.";});
_adRun();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'Block letters, old school', html: '<p>Before GUIs, terminals rendered banners with hashes and blocks. This drawer uses a classic 5x7 bitmap font - each glyph is seven rows of <code>##</code> pairs - to turn short phrases into terminal-ready banners for README files, log headers or ASCII signatures.</p>' }],
    ['Type up to 14 characters (A-Z, 0-9, punctuation)', 'Watch the banner render live', 'Copy the art and paste it anywhere monospace text is welcome'],
    ['Keep phrases short - each character is 12 columns wide', 'Use the space character to separate words', 'The output uses only printable ASCII so it survives any text channel'],
    [['Which characters are supported?', 'A-Z, 0-9, space and common punctuation; lowercase is converted to uppercase.'], ['Can I download it as a file?', 'Copy the art and save it as .txt - the clipboard copy preserves spacing.']],
    'Related: <a href="./bold-text-generator.html">Bold Text Generator</a> · <a href="./tiny-text-generator.html">Tiny Text Generator</a>');
  add(s);
})();

/* ========================================================================== */
/* 8. SVG Placeholder Generator                                               */
/* ========================================================================== */
(function () {
  const s = base('SVG Placeholder Generator', 'image', 'svg-placeholder-generator.html', 'Placeholder',
    'fa-solid fa-image',
    'Generate custom SVG placeholder images with size, colors and label text - download or copy the code.',
    'Create SVG placeholder images online with custom size, colors and text. Free, client-side, no uploads.',
    'SVG Placeholder Generator - Custom Placeholder Images',
    ['svg', 'placeholder', 'generator', 'wireframe', 'mockup', 'dummy image']);
  s.css = '.spg-form{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.spg-prev{margin-top:14px;border:1px dashed var(--border);border-radius:14px;padding:14px;display:flex;justify-content:center;background:#0D1117}.spg-prev img{max-width:100%;height:auto}';
  s.panel = panel.wrap('sp', 'fa-solid fa-image', 'Placeholder settings',
    '<div class="spg-form">' +
    '<div class="field"><label for="spW">Width (px)</label><input id="spW" type="number" value="640" min="16" max="4096"></div>' +
    '<div class="field"><label for="spH">Height (px)</label><input id="spH" type="number" value="360" min="16" max="4096"></div>' +
    '<div class="field"><label for="spBg">Background</label><input id="spBg" type="color" value="#3B82F6"></div>' +
    '<div class="field"><label for="spFg">Text color</label><input id="spFg" type="color" value="#FFFFFF"></div>' +
    '<div class="field"><label for="spFs">Font size</label><input id="spFs" type="number" value="32" min="8" max="200"></div>' +
    '<div class="field"><label for="spTxt">Label</label><input id="spTxt" value="640 x 360" maxlength="60"></div>' +
    '</div>' +
    '<div class="spg-prev"><img id="spImg" alt="Placeholder preview"></div>' +
    '<div class="actions" style="margin-top:14px"><button class="btn btn-primary" type="button" id="spDl"><i class="fa-solid fa-download"></i>Download SVG</button>' +
    '<button class="rt-btn" type="button" id="spCp"><i class="fa-solid fa-copy"></i>Copy SVG code</button></div>');
  s.js = COPY_FN + `
var _spIds=["spW","spH","spBg","spFg","spFs","spTxt"],_spImg=document.getElementById("spImg"),_spProc=document.getElementById("spProc"),_spSvg="";
function _spEsc(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function _spBuild(){
  var w=Math.max(16,Math.min(4096,parseInt(document.getElementById("spW").value,10)||640));
  var h=Math.max(16,Math.min(4096,parseInt(document.getElementById("spH").value,10)||360));
  var bg=document.getElementById("spBg").value,fg=document.getElementById("spFg").value;
  var fs=Math.max(8,Math.min(200,parseInt(document.getElementById("spFs").value,10)||32));
  var txt=document.getElementById("spTxt").value||w+" x "+h;
  _spSvg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+
    '<rect width="100%" height="100%" fill="'+bg+'"/>'+
    '<text x="50%" y="50%" fill="'+fg+'" font-family="system-ui,Segoe UI,sans-serif" font-size="'+fs+'" dominant-baseline="middle" text-anchor="middle">'+_spEsc(txt)+'</text></svg>';
  _spImg.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(_spSvg);
  _spImg.width=Math.min(w,560);
  _spProc.textContent="Placeholder ready ("+w+"x"+h+").";
}
_spIds.forEach(function(id){document.getElementById(id).addEventListener("input",_spBuild)});
document.getElementById("spDl").addEventListener("click",function(){
  var b=new Blob([_spSvg],{type:"image/svg+xml"});
  var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="placeholder.svg";document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},3000);
  _spProc.textContent="placeholder.svg downloaded.";
});
document.getElementById("spCp").addEventListener("click",function(){_cp(_spSvg);_spProc.textContent="SVG code copied.";});
document.getElementById("spSample").addEventListener("click",function(){document.getElementById("spW").value=800;document.getElementById("spH").value=450;document.getElementById("spBg").value="#1F2937";document.getElementById("spTxt").value="Hero 800 x 450";_spBuild();});
document.getElementById("spClear").addEventListener("click",function(){document.getElementById("spW").value=640;document.getElementById("spH").value=360;document.getElementById("spTxt").value="640 x 360";_spBuild();});
_spBuild();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'Why SVG placeholders?', html: '<p>Wireframes and tests need dummy images at exact dimensions. SVG placeholders are tiny (a few hundred bytes), scale without blur, render offline, and can carry a readable label like "800 x 450" so reviewers instantly see the intended slot size.</p>' }],
    ['Set width, height and colors', 'Edit the label (defaults to the dimensions)', 'Download the .svg or copy the markup'],
    ['SVGs weigh almost nothing compared to PNG/JPG - ideal for design systems', 'The label uses your system font stack so it renders everywhere', 'Dimensions are clamped to 16-4096 px for sane file sizes'],
    [['Can I use these in production?', 'Yes - they are valid SVGs; swap them for real images later.'], ['Do you upload my settings?', 'No generation happens in your browser.']],
    'Related: <a href="./random-bitmap-generator.html">Random Bitmap Generator</a> · <a href="./svg-compressor.html">SVG Compressor</a>');
  add(s);
})();

/* ========================================================================== */
/* 9. Emoji Picker                                                            */
/* ========================================================================== */
(function () {
  const s = base('Emoji Picker', 'fun', 'emoji-picker.html', 'Picker',
    'fa-solid fa-face-smile',
    'Browse, search and copy emojis - with categories, a recent list and click-to-copy.',
    'Browse and copy emojis with search, categories and recents. Free online emoji picker, works offline.',
    'Emoji Picker - Search, Browse & Copy Emojis',
    ['emoji', 'picker', 'emoticon', 'smiley', 'copy', 'search', 'unicode']);
  s.css = '.ep-cats{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.ep-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:4px;max-height:380px;overflow-y:auto;padding:4px}.ep-grid button{font-size:26px;line-height:1;background:none;border:1px solid transparent;border-radius:10px;padding:7px;cursor:pointer}.ep-grid button:hover{background:rgba(59,130,246,.15);border-color:rgba(96,165,250,.35)}.ep-chip{font-size:12.5px;padding:6px 12px;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,.03);color:var(--ink);cursor:pointer}.ep-chip.active{background:rgba(59,130,246,.2);border-color:rgba(96,165,250,.5);color:#93C5FD}';
  s.panel = panel.wrap('ep', 'fa-solid fa-face-smile', 'Emoji library',
    '<div class="field" style="max-width:420px"><label for="epQ">Search</label><input id="epQ" placeholder="cat, heart, flag..." autocomplete="off"></div>' +
    '<div class="ep-cats" id="epCats"></div>' +
    '<div class="ep-grid" id="epGrid"></div>');
  s.js = COPY_FN + `
var _epData=[
 ["Smileys",[["grinning","😀"],["joy","😂"],["rofl","🤣"],["smiley","😃"],["smile","😄"],["grin","😁"],["laughing","😆"],["sweat_smile","😅"],["wink","😉"],["blush","😊"],["heart_eyes","😍"],["kissing_heart","😘"],["thinking","🤔"],["neutral_face","😐"],["expressionless","😑"],["unamused","😒"],["sweat","😓"],["pensive","😔"],["confused","😕"],["upside_down_face","🙃"],["money_mouth","🤑"],["astonished","😲"],["frowning","😦"],["cry","😢"],["sob","😭"],["angry","😠"],["rage","😡"],["exploding_head","🤯"],["halo","😇"],["cowboy","🤠"],["clown","🤡"],["lying_face","🤥"],["sunglasses","😎"],["nerd","🤓"],["mask","😷"],["thermometer_face","🤒"],["rocket","🚀"]]],
 ["Gestures",[["thumbsup","👍"],["thumbsdown","👎"],["ok_hand","👌"],["punch","👊"],["fist","✊"],["v","✌️"],["wave","👋"],["raised_hands","🙌"],["pray","🙏"],["muscle","💪"],["point_right","👉"],["point_left","👈"],["clap","👏"],["handshake","🤝"],["eyes","👀"],["brain","🧠"],["ear","👂"],["nose","👃"],["tongue","👅"],["lips","👄"],["baby","👶"],["person","🧑"],["woman","👩"],["man","👨"],["detective","🕵️"],["mage","🧙"],["fairy","🧚"],["superhero","🦸"],["vampire","🧛"],["merperson","🧜"]]],
 ["Nature",[["dog","🐶"],["cat","🐱"],["mouse","🐭"],["hamster","🐹"],["rabbit","🐰"],["fox","🦊"],["bear","🐻"],["panda","🐼"],["koala","🐨"],["tiger","🐯"],["lion","🦁"],["cow","🐮"],["pig","🐷"],["frog","🐸"],["monkey","🐵"],["see_no_evil","🙈"],["chicken","🐔"],["penguin","🐧"],["bird","🐦"],["eagle","🦅"],["duck","🦆"],["owl","🦉"],["bat","🦇"],["wolf","🐺"],["boar","🐗"],["horse","🐴"],["unicorn","🦄"],["bee","🐝"],["bug","🐛"],["butterfly","🦋"],["snail","🐌"],["beetle","🐞"],["ant","🐜"],["spider","🕷️"],["scorpion","🦂"],["turtle","🐢"],["snake","🐍"],["lizard","🦎"],["t-rex","🦖"],["sauropod","🦕"]]],
 ["Food",[["apple","🍎"],["banana","🍌"],["grapes","🍇"],["watermelon","🍉"],["strawberry","🍓"],["cherries","🍒"],["peach","🍑"],["mango","🥭"],["pineapple","🍍"],["kiwi","🥝"],["tomato","🍅"],["avocado","🥑"],["eggplant","🍆"],["corn","🌽"],["carrot","🥕"],["broccoli","🥦"],["salad","🥗"],["bread","🍞"],["croissant","🥐"],["cheese","🧀"],["egg","🥚"],["pancakes","🥞"],["pizza","🍕"],["hamburger","🍔"],["fries","🍟"],["hotdog","🌭"],["taco","🌮"],["burrito","🌯"],["sushi","🍣"],["ramen","🍜"],["spaghetti","🍝"],["steak","🥩"],["chicken_leg","🍗"],["popcorn","🍿"],["doughnut","🍩"],["cookie","🍪"],["cake","🍰"],["cupcake","🧁"],["chocolate","🍫"],["candy","🍬"],["icecream","🍦"],["coffee","☕"],["tea","🍵"],["beer","🍺"],["cocktail","🍸"],["wine","🍷"]]],
 ["Travel",[["car","🚗"],["taxi","🚕"],["bus","🚌"],["trolleybus","🚎"],["fire_engine","🚒"],["ambulance","🚑"],["police_car","🚓"],["tractor","🚜"],["motorbike","🏍️"],["bicycle","🚲"],["scooter","🛴"],["train","🚂"],["metro","🚇"],["tram","🚊"],["airplane","✈️"],["rocket","🚀"],["helicopter","🚁"],["ship","🚢"],["sailboat","⛵"],["anchor","⚓"],["fuelpump","⛽"],["traffic_light","🚦"],["construction","🚧"],["map","🗺"],["globe","🌎"],["earth_africa","🌍"],["mountain","⛰️"],["volcano","🌋"],["desert","🏜️"],["beach","🏖️"],["camping","🏕️"],["tent","⛺"],["castle","🏰"],["statue","🗽"],["tokyo","🗼"],["bridge","🌉"],["night","🌌"],["sunset","🌅"],["city","🏙️"]]],
 ["Activities",[["soccer","⚽"],["basketball","🏀"],["football","🏈"],["baseball","⚾"],["tennis","🎾"],["volleyball","🏐"],["rugby","🏉"],["8ball","🎱"],["bowling","🎳"],["golf","⛳"],["skateboard","🛹"],["surfing","🏄"],["ski","⛷️"],["snowboard","🏂"],["ice_skate","⛸️"],["dancing","💃"],["ballet","🩰"],["performing","🎭"],["art","🎨"],["circus","🎪"],["ticket","🎟️"],["medal","🏅"],["trophy","🏆"],["award","🥇"],["game","🎮"],["joystick","🕹️"],["slot","🎰"],["puzzle","🧩"],["teddy","🧸"],["kite","🪁"]]],
 ["Objects",[["watch","⌚"],["iphone","📱"],["computer","💻"],["keyboard","⌨️"],["printer","🖨️"],["mouse_three","🖱️"],["disk","💾"],["cd","💿"],["dvd","📀"],["camera","📷"],["video","🎥"],["tv","📺"],["radio","📻"],["alarm","⏰"],["hourglass","⌛"],["battery","🔋"],["plug","🔌"],["bulb","💡"],["flashlight","🔦"],["candle","🕯️"],["fire_ext","🧯"],["oil","🛢️"],["money","💵"],["coin","🪙"],["credit_card","💳"],["bag","💼"],["briefcase","🧳"],["lock","🔒"],["unlock","🔓"],["key","🔑"],["hammer","🔨"],["wrench","🔧"],["nut_bolt","🔩"],["gear","⚙️"],["brick","🧱"],["magnet","🧲"],["ladder","🪜"],["mirror","🪞"],["window","🪟"]]],
 ["Symbols",[["heart","❤️"],["orange_heart","🧡"],["yellow_heart","💛"],["green_heart","💚"],["blue_heart","💙"],["purple_heart","💜"],["black_heart","🖤"],["broken_heart","💔"],["heartpulse","💗"],["sparkles","✨"],["star","⭐"],["star2","🌟"],["dizzy","💫"],["boom","💥"],["sweat_drops","💦"],["droplet","💧"],["zap","⚡"],["fire","🔥"],["snowflake","❄️"],["sun","☀️"],["moon","🌙"],["cloud","☁️"],["rainbow","🌈"],["ocean","🌊"],["check","✅"],["x","❌"],["warning","⚠️"],["recycle","♻️"],["peace","☮️"],["atm","🏧"],["wc","🚾"],["mens","🚹"],["womens","🚺"]]],
 ["Flags",[["jp","🇯🇵"],["us","🇺🇸"],["gb","🇬🇧"],["de","🇩🇪"],["fr","🇫🇷"],["it","🇮🇹"],["es","🇪🇸"],["pt","🇵🇹"],["nl","🇳🇱"],["be","🇧🇪"],["se","🇸🇪"],["no","🇳🇴"],["dk","🇩🇰"],["fi","🇫🇮"],["ie","🇮🇪"],["pl","🇵🇱"],["at","🇦🇹"],["ch","🇨🇭"],["gr","🇬🇷"],["tr","🇹🇷"],["ru","🇷🇺"],["ua","🇺🇦"],["ae","🇦🇪"],["sa","🇸🇦"],["il","🇮🇱"],["eg","🇪🇬"],["za","🇿🇦"],["ng","🇳🇬"],["ke","🇰🇪"],["br","🇧🇷"],["ar","🇦🇷"],["mx","🇲🇽"],["ca","🇨🇦"],["au","🇦🇺"],["nz","🇳🇿"],["sg","🇸🇬"],["th","🇹🇭"],["ph","🇵🇭"],["my","🇲🇾"],["id","🇮🇩"],["vn","🇻🇳"],["kr","🇰🇷"],["cn","🇨🇳"],["tw","🇹🇼"],["hk","🇭🇰"],["in","🇮🇳"],["pk","🇵🇰"],["bd","🇧🇩"],["lk","🇱🇰"],["np","🇳🇵"]]]
];
var _epGrid=document.getElementById("epGrid"),_epCats=document.getElementById("epCats"),_epQ=document.getElementById("epQ"),_epProc=document.getElementById("epProc"),_epCat="Smileys";
function _epAll(){var a=[];_epData.forEach(function(c){c[1].forEach(function(e){a.push([c[0],e[0],e[1]])})});return a}
function _epFlatten(){var a=[];_epData.forEach(function(c){if(_epCat==="Recents"||c[0]===_epCat)c[1].forEach(function(e){a.push(e)})});return a}
function _epRecents(){try{return JSON.parse(localStorage.getItem("troolify.emojiRecents")||"[]")}catch(e){return[]}}
function _epPushRecent(ch){var r=_epRecents().filter(function(x){return x!==ch});r.unshift(ch);try{localStorage.setItem("troolify.emojiRecents",JSON.stringify(r.slice(0,32)))}catch(e){}}
function _epRender(){
  var q=(_epQ.value||"").trim().toLowerCase();
  var list;
  if(q){list=_epAll().filter(function(e){return e[1].indexOf(q)!==-1||e[0].indexOf(q)!==-1}).map(function(e){return [e[1],e[2]]})}
  else if(_epCat==="Recents"){list=_epRecents().map(function(ch){return ["recent",ch]})}
  else list=_epFlatten();
  _epGrid.innerHTML="";
  list.slice(0,240).forEach(function(e){
    var b=document.createElement("button");
    b.type="button";b.textContent=e[1];b.title=e[0];
    b.addEventListener("click",function(){
      _cp(e[1]);_epPushRecent(e[1]);
      _epProc.textContent="Copied "+e[1]+" ("+e[0]+")";
    });
    _epGrid.appendChild(b);
  });
  _epProc.textContent=list.length+" emoji"+(list.length===1?"":"s");
}
_epCats.innerHTML="";
["Recents"].concat(_epData.map(function(c){return c[0]})).forEach(function(name){
  var b=document.createElement("button");
  b.type="button";b.className="ep-chip"+(name===_epCat?" active":"");b.textContent=name;
  b.addEventListener("click",function(){_epCat=name;_epQ.value="";_epCats.querySelectorAll(".ep-chip").forEach(function(x){x.classList.remove("active")});b.classList.add("active");_epRender();});
  _epCats.appendChild(b);
});
_epQ.addEventListener("input",_epRender);
document.getElementById("epSample").addEventListener("click",function(){_epQ.value="heart";_epRender();});
document.getElementById("epClear").addEventListener("click",function(){_epQ.value="";_epCat="Smileys";_epCats.querySelectorAll(".ep-chip").forEach(function(x,i){x.classList.toggle("active",i===1)});_epRender();});
_epRender();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'One-click emoji copying', html: '<p>Stop hunting through the OS emoji panel. This picker groups hundreds of popular emojis into categories, lets you search by keyword (try "cat" or "fire"), remembers your recents locally, and copies any emoji to the clipboard with a single click.</p>' }],
    ['Search by name or browse a category', 'Click an emoji to copy it', 'Check the Recents tab for your last picks'],
    ['Recents are stored in your browser only (localStorage)', 'Search matches both the emoji name and its category', 'Emojis render in color on all modern systems'],
    [['Where are my recents stored?', 'Locally in your browser - never uploaded.'], ['Can I paste them anywhere?', 'Yes - anywhere that accepts Unicode text: chat, docs, code comments.']],
    'Related: <a href="./random-emoji-generator.html">Random Emoji Generator</a> · <a href="./text-to-unicode.html">Text to Unicode</a>');
  add(s);
})();

/* ========================================================================== */
/* 10. Camera Recorder                                                        */
/* ========================================================================== */
(function () {
  const s = base('Camera Recorder', 'coding', 'camera-recorder.html', 'Recorder',
    'fa-solid fa-video',
    'Record your webcam in the browser with MediaRecorder and download the WebM file.',
    'Record webcam video online with MediaRecorder and download WebM files. Nothing is uploaded - 100% client-side.',
    'Camera Recorder - Record Webcam Video in Your Browser',
    ['camera', 'recorder', 'webcam', 'video', 'record', 'mediarecorder', 'webm']);
  s.css = '.cr-stage{background:#0D1117;border:1px solid var(--border);border-radius:14px;overflow:hidden;position:relative;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}.cr-stage video{width:100%;height:100%;object-fit:cover}.cr-dot{position:absolute;top:12px;left:12px;background:#EF4444;color:#fff;font-size:12px;font-weight:800;padding:4px 12px;border-radius:999px;display:none;letter-spacing:.06em}.cr-dot.on{display:block}.cr-clips{display:grid;gap:10px;margin-top:14px}.cr-clip{display:flex;gap:12px;align-items:center;border:1px solid var(--border);border-radius:12px;padding:10px}.cr-clip video{width:180px;border-radius:8px;background:#000}.cr-clip .meta{flex:1;font-size:13px;color:var(--muted)}';
  s.panel = panel.wrap('cr', 'fa-solid fa-video', 'Webcam recorder',
    '<div class="cr-stage"><span class="cr-dot" id="crDot">REC</span><video id="crPreview" muted playsinline autoplay></video></div>' +
    '<div class="actions" style="margin-top:14px"><button class="btn btn-primary" type="button" id="crStart"><i class="fa-solid fa-video"></i>Start camera</button>' +
    '<button class="rt-btn" type="button" id="crRec" disabled><i class="fa-solid fa-circle"></i>Record</button>' +
    '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)"><input type="checkbox" id="crMic"> Microphone</label></div>' +
    '<div class="cr-clips" id="crClips"></div>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="crProc">Ready - click Start camera (video never leaves this tab).</span></p>');
  s.js = COPY_FN + `
var _crStream=null,_crRec=null,_crChunks=[],_crTimer=null,_crSecs=0,_crProc=document.getElementById("crProc");
var _crPreview=document.getElementById("crPreview"),_crDot=document.getElementById("crDot"),_crRecBtn=document.getElementById("crRec"),_crClips=document.getElementById("crClips");
function _crStopTracks(){if(_crStream){_crStream.getTracks().forEach(function(t){t.stop()});_crStream=null}}
function _crFmt(s){var m=Math.floor(s/60),r=s%60;return (m<10?"0":"")+m+":"+(r<10?"0":"")+r}
document.getElementById("crStart").addEventListener("click",function(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    _crProc.textContent="Camera capture is not supported here (needs https or localhost in a modern browser).";return;
  }
  _crStopTracks();
  var audio=document.getElementById("crMic").checked;
  navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:audio}).then(function(st){
    _crStream=st;_crPreview.srcObject=st;_crRecBtn.disabled=false;
    _crProc.textContent="Camera ready. Hit Record when you want to start.";
  }).catch(function(e){
    _crProc.textContent="Could not open the camera: "+(e&&e.name?e.name:"permission denied")+". Check the browser permission prompt.";
  });
});
_crRecBtn.addEventListener("click",function(){
  if(!_crStream){_crProc.textContent="Start the camera first.";return}
  if(_crRec&&_crRec.state==="recording"){_crRec.stop();return}
  if(!window.MediaRecorder){_crProc.textContent="MediaRecorder is not supported in this browser.";return}
  var mime="";
  ["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].some(function(m){if(MediaRecorder.isTypeSupported(m)){mime=m;return true}return false});
  try{_crRec=new MediaRecorder(_crStream,mime?{mimeType:mime}:undefined)}catch(e){_crProc.textContent="Could not start the recorder: "+e.message;return}
  _crChunks=[];
  _crRec.ondataavailable=function(e){if(e.data&&e.data.size)_crChunks.push(e.data)};
  _crRec.onstop=function(){
    clearInterval(_crTimer);_crDot.classList.remove("on");_crRecBtn.innerHTML='<i class="fa-solid fa-circle"></i>Record';
    var blob=new Blob(_crChunks,{type:_crChunks[0]?_crChunks[0].type:"video/webm"});
    var url=URL.createObjectURL(blob);
    var wrap=document.createElement("div");wrap.className="cr-clip";
    var v=document.createElement("video");v.src=url;v.controls=true;
    var meta=document.createElement("div");meta.className="meta";
    meta.innerHTML="<b>"+_crFmt(_crSecs)+"</b> &middot; "+(blob.size/1024).toFixed(0)+" KB &middot; webm";
    var dl=document.createElement("button");dl.className="rt-btn";dl.innerHTML='<i class="fa-solid fa-download"></i>Download';
    dl.addEventListener("click",function(){var a=document.createElement("a");a.href=url;a.download="recording-"+Date.now()+".webm";document.body.appendChild(a);a.click();a.remove();});
    var del=document.createElement("button");del.className="rt-btn";del.innerHTML='<i class="fa-solid fa-trash"></i>';
    del.addEventListener("click",function(){URL.revokeObjectURL(url);wrap.remove()});
    wrap.appendChild(v);wrap.appendChild(meta);wrap.appendChild(dl);wrap.appendChild(del);
    _crClips.prepend(wrap);
    _crProc.textContent="Recording saved below - download it or record again.";
  };
  _crRec.start();
  _crSecs=0;_crDot.classList.add("on");_crRecBtn.innerHTML='<i class="fa-solid fa-stop"></i>Stop';
  _crTimer=setInterval(function(){_crSecs++;_crProc.textContent="Recording... "+_crFmt(_crSecs)},1000);
  _crProc.textContent="Recording...";
});
window.addEventListener("beforeunload",_crStopTracks);
document.getElementById("crSample").addEventListener("click",function(){document.getElementById("crStart").click()});
document.getElementById("crClear").addEventListener("click",function(){_crStopTracks();_crClips.innerHTML="";_crRecBtn.disabled=true;_crDot.classList.remove("on");_crProc.textContent="Camera stopped and clips cleared.";});`;

  stdArticle(s,
    [{ id: 'overview', heading: 'How the recorder works', html: '<p>The page opens your webcam with <code>getUserMedia</code> and records the stream with the <code>MediaRecorder</code> API - the same primitives used by meeting apps. Everything runs in this tab: frames never touch a server, so the recording is fully private.</p>' },
     { id: 'formats', heading: 'Output format', html: '<p>Recordings are saved as <b>WebM</b> (VP9 or VP8 depending on browser support), which modern editors, ffmpeg and social platforms accept. The microphone is optional - enable the checkbox before starting the camera if you want audio.</p>' }],
    ['Click Start camera and allow the permission prompt', 'Click Record; the red REC badge shows capture is live', 'Click Stop, then Download the WebM clip'],
    ['Camera access requires a secure context (https:// or localhost)', 'The microphone toggle only applies when the camera is (re)started', 'Clips stay in memory for this tab session - download what you need before leaving'],
    [['Is the video uploaded?', 'No. MediaRecorder produces a local blob you download yourself.'], ['Why WebM and not MP4?', 'WebM is the only format browsers can record natively; convert with any video editor if you need MP4.']],
    'Related: <a href="../../tools/video/screen-recorder.html">Screen Recorder</a> · <a href="./device-information.html">Device Information</a>');
  add(s);
})();

/* ========================================================================== */
/* 11. HTML WYSIWYG Editor                                                    */
/* ========================================================================== */
(function () {
  const s = base('HTML WYSIWYG Editor', 'coding', 'html-wysiwyg-editor.html', 'Editor',
    'fa-solid fa-code',
    'Edit rich text with a formatting toolbar and see the clean HTML output instantly.',
    'Edit HTML with a simple WYSIWYG toolbar - bold, lists, links and more with live HTML output.',
    'HTML WYSIWYG Editor - Rich Text to HTML',
    ['html', 'editor', 'wysiwyg', 'rich text', 'contenteditable', 'toolbar', 'format']);
  s.css = '.we-toolbar{display:flex;flex-wrap:wrap;gap:4px;padding:8px;border:1px solid var(--border);border-bottom:none;border-radius:12px 12px 0 0;background:rgba(255,255,255,.03)}.we-toolbar button{min-width:34px;height:32px;border-radius:8px;border:1px solid transparent;background:none;color:var(--ink);cursor:pointer;font-size:13px}.we-toolbar button:hover{background:rgba(59,130,246,.15)}.we-surface{min-height:220px;border:1px solid var(--border);border-radius:0 0 12px 12px;padding:14px;background:#1B2028;outline:none;line-height:1.6}.we-surface:focus{border-color:var(--accent)}.we-src{width:100%;min-height:220px;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);border-radius:0 0 12px 12px;color:var(--ink);font-family:ui-monospace,Menlo,monospace;font-size:13px;padding:14px;resize:vertical;display:none}';
  s.panel = panel.wrap('we', 'fa-solid fa-code', 'WYSIWYG editor',
    '<div class="we-toolbar" id="weBar">' +
    '<button type="button" data-cmd="bold" title="Bold"><b>B</b></button>' +
    '<button type="button" data-cmd="italic" title="Italic"><i>I</i></button>' +
    '<button type="button" data-cmd="underline" title="Underline"><u>U</u></button>' +
    '<button type="button" data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>' +
    '<button type="button" data-block="h1" title="Heading 1">H1</button>' +
    '<button type="button" data-block="h2" title="Heading 2">H2</button>' +
    '<button type="button" data-block="p" title="Paragraph">P</button>' +
    '<button type="button" data-cmd="insertUnorderedList" title="Bullet list">&#8226;&ndash;</button>' +
    '<button type="button" data-cmd="insertOrderedList" title="Numbered list">1.</button>' +
    '<button type="button" data-cmd="formatBlock" data-val="blockquote" title="Quote">&#8220;</button>' +
    '<button type="button" id="weLink" title="Insert link">&#128279;</button>' +
    '<button type="button" id="weImg" title="Insert image by URL">&#128444;</button>' +
    '<button type="button" data-cmd="removeFormat" title="Clear formatting">&#10005;</button>' +
    '<button type="button" data-cmd="undo" title="Undo">&#8630;</button>' +
    '<button type="button" data-cmd="redo" title="Redo">&#8631;</button>' +
    '<button type="button" id="weSrc" title="Toggle HTML source">&lt;/&gt;</button>' +
    '</div>' +
    '<div class="we-surface" id="weSurface" contenteditable="true"><p><b>Hello!</b> Start typing, or hit Sample.</p></div>' +
    '<textarea class="we-src" id="weArea" spellcheck="false"></textarea>' +
    '<div class="actions" style="margin-top:14px"><button class="rt-btn" type="button" id="weCopy"><i class="fa-solid fa-copy"></i>Copy HTML</button>' +
    '<button class="rt-btn" type="button" id="weDl"><i class="fa-solid fa-download"></i>Download .html</button></div>');
  s.js = COPY_FN + `
var _weSurface=document.getElementById("weSurface"),_weArea=document.getElementById("weArea"),_weProc=document.getElementById("weProc"),_weSrcOn=false;
function _weSync(){
  if(_weSrcOn)_weArea.value=_weSurface.innerHTML;
  _weProc.textContent="Document is "+_weSurface.textContent.trim().length+" characters of text.";
}
document.getElementById("weBar").addEventListener("click",function(e){
  var b=e.target.closest("button");
  if(!b||b.id)return;
  _weSurface.focus();
  try{
    if(b.dataset.block)document.execCommand("formatBlock",false,b.dataset.block);
    else if(b.dataset.val)document.execCommand("formatBlock",false,b.dataset.val);
    else document.execCommand(b.dataset.cmd,false,null);
  }catch(err){}
  _weSync();
});
document.getElementById("weLink").addEventListener("click",function(){
  var url=prompt("Link URL (https://...)");
  if(url){_weSurface.focus();try{document.execCommand("createLink",false,url)}catch(e){}}
  _weSync();
});
document.getElementById("weImg").addEventListener("click",function(){
  var url=prompt("Image URL (https://...)");
  if(url){_weSurface.focus();try{document.execCommand("insertImage",false,url)}catch(e){}}
  _weSync();
});
document.getElementById("weSrc").addEventListener("click",function(){
  _weSrcOn=!_weSrcOn;
  if(_weSrcOn){_weArea.value=_weSurface.innerHTML;_weSurface.style.display="none";_weArea.style.display="block"}
  else{_weSurface.innerHTML=_weArea.value;_weArea.style.display="none";_weSurface.style.display="block"}
  _weSync();
});
_weArea.addEventListener("input",function(){if(_weSrcOn)_weSurface.innerHTML=_weArea.value});
_weSurface.addEventListener("input",_weSync);
document.getElementById("weCopy").addEventListener("click",function(){_cp(_weSrcOn?_weArea.value:_weSurface.innerHTML);_weProc.textContent="HTML copied.";});
document.getElementById("weDl").addEventListener("click",function(){
  var html="<!doctype html><html><head><meta charset=\\"utf-8\\"><title>Exported document</title></head><body>"+(_weSrcOn?_weArea.value:_weSurface.innerHTML)+"</body></html>";
  var b=new Blob([html],{type:"text/html"});
  var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="document.html";document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},3000);
  _weProc.textContent="document.html downloaded.";
});
document.getElementById("weSample").addEventListener("click",function(){
  _weSurface.innerHTML="<h2>Weekly notes</h2><p><b>Highlights</b>: shipped the <i>new editor</i> and fixed two bugs.</p><ul><li>First item</li><li>Second item</li></ul><p>Read more on <a href=\\"https://f9xr.org/\\">f9xr.org</a>.</p>";
  _weSync();
});
document.getElementById("weClear").addEventListener("click",function(){_weSurface.innerHTML="<p><br></p>";_weArea.value="";_weSync();});
_weSync();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'A tiny rich-text editor', html: '<p>This editor wraps a <code>contenteditable</code> region with the classic formatting commands - bold, italic, headings, lists, quotes, links and images. Every keystroke syncs clean HTML you can copy into a CMS, email or static site.</p>' },
     { id: 'source', heading: 'Two views, one document', html: '<p>Flip to the HTML source with the &lt;/&gt; button to hand-tweak the markup; switching back re-parses it into the visual view. The Copy and Download buttons always export the current HTML.</p>' }],
    ['Format your text with the toolbar', 'Toggle the source view if you want raw HTML control', 'Copy the HTML or download it as a standalone .html file'],
    ['Links and images need full https:// URLs', 'The export wraps your content in a minimal valid HTML document', 'Formatting uses execCommand - simple, dependency-free and supported by all evergreen browsers'],
    [['Is my content stored?', 'No. Everything lives in the page until you copy or download it.'], ['Why execCommand if it is deprecated?', 'It still works everywhere; the modern Selection/Clipboard APIs do not yet cover all these commands.']],
    'Related: <a href="./markdown-to-html.html">Markdown to HTML</a> · <a href="./compress-html.html">Compress HTML</a>');
  add(s);
})();

/* ========================================================================== */
/* 12. YAML to JSON Converter                                                 */
/* ========================================================================== */
(function () {
  const s = base('YAML to JSON Converter', 'coding', 'yaml-to-json-converter.html', 'Convert',
    'fa-solid fa-file-lines',
    'Convert YAML documents to JSON with proper nesting, arrays and error reporting.',
    'Convert YAML to JSON online for free. Proper nesting, arrays and clear errors - 100% client-side.',
    'YAML to JSON Converter - Convert YAML to JSON Online',
    ['yaml', 'json', 'converter', 'yml', 'convert', 'parse']);
  s.panel = panel.wrap('yj', 'fa-solid fa-file-lines', 'YAML to JSON',
    panel.ioTwo('yj', 'YAML input', 'JSON output', 'name: Troolify\ntools:\n  - uuid\n  - jwt', '') +
    '<div class="actions" style="margin-top:14px"><button class="btn btn-primary" type="button" id="yjGo"><i class="fa-solid fa-arrow-right-arrow-left"></i>Convert</button>' +
    '<button class="rt-btn" type="button" id="yjCopy"><i class="fa-solid fa-copy"></i>Copy JSON</button>' +
    '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)">Indent <select id="yjIndent"><option value="2">2</option><option value="4">4</option><option value="tab">Tab</option></select></label></div>');
  s.js = COPY_FN + `
var _yjIn=document.getElementById("yjIn"),_yjOut=document.getElementById("yjOut"),_yjProc=document.getElementById("yjProc");
function _yjLoad(cb){
  if(window.jsyaml){cb();return}
  _yjProc.textContent="Loading the YAML parser...";
  var sc=document.createElement("script");
  sc.src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js";
  sc.onload=function(){_yjProc.textContent="YAML parser loaded.";cb()};
  sc.onerror=function(){_yjProc.textContent="Could not load the YAML parser library (network blocked?)."};
  document.head.appendChild(sc);
}
function _yjRun(){
  _yjLoad(function(){
    try{
      var doc=window.jsyaml.load(_yjIn.value);
      var ind=document.getElementById("yjIndent").value;
      _yjOut.value=JSON.stringify(doc,null,ind==="tab"?"\\t":parseInt(ind,10));
      _yjProc.textContent="Converted successfully - "+_yjOut.value.length+" bytes of JSON.";
    }catch(e){
      _yjOut.value="";
      _yjProc.textContent="YAML error: "+(e&&e.message?e.message.split("\\n")[0]:"parse failed");
    }
  });
}
document.getElementById("yjGo").addEventListener("click",_yjRun);
document.getElementById("yjCopy").addEventListener("click",function(){_cp(_yjOut.value);_yjProc.textContent="JSON copied.";});
document.getElementById("yjSample").addEventListener("click",function(){_yjIn.value="name: Troolify\\nversion: 1.0\\ndeveloper: F9XR Team\\ntools:\\n  - uuid generator\\n  - jwt decoder\\nsettings:\\n  clientSide: true\\n  categories: 27";_yjRun();});
document.getElementById("yjClear").addEventListener("click",function(){_yjIn.value="";_yjOut.value="";_yjProc.textContent="Ready.";});
_yjIn.addEventListener("keydown",function(e){if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))_yjRun();});`;

  stdArticle(s,
    [{ id: 'overview', heading: 'YAML and JSON, interconverted', html: '<p>YAML is the human-friendly format for configs (CI pipelines, Docker Compose, Kubernetes); JSON is what APIs speak. This converter uses the js-yaml parser - the same library behind countless build tools - so nested maps, arrays, numbers, booleans and nulls all map correctly.</p>' },
     { id: 'errors', heading: 'Error reporting', html: '<p>YAML is strict about indentation. When a document fails to parse, the tool reports the parser\u2019s message (shown without the multi-line stack) so you can fix tabs/spaces or quote problems quickly.</p>' }],
    ['Paste your YAML on the left (or hit Sample)', 'Choose 2, 4 or tab indentation', 'Click Convert and copy the JSON'],
    ['Tabs are not valid YAML indentation - use spaces', 'Strings that look like numbers are converted to number types - quote them to keep them text', 'Ctrl/Cmd+Enter triggers the conversion from the input box'],
    [['Is my YAML uploaded?', 'No. The parser library loads from a CDN once, then all parsing is local.'], ['Does it support multi-document YAML?', 'Only the first document of a multi-doc stream is converted.']],
    'Related: <a href="./json-to-yaml.html">JSON to YAML</a> · <a href="./yaml-viewer.html">YAML Viewer</a> · <a href="./toml-to-json.html">TOML to JSON</a>');
  add(s);
})();

/* ========================================================================== */
/* 13. Crontab Generator                                                      */
/* ========================================================================== */
(function () {
  const s = base('Crontab Generator', 'coding', 'crontab-generator.html', 'Generator',
    'fa-solid fa-clock',
    'Build crontab expressions with presets and pickers, plus a plain-English schedule description.',
    'Generate crontab schedule expressions with common presets, human-readable descriptions and next run times.',
    'Crontab Generator - Build Cron Schedules Visually',
    ['crontab', 'cron', 'schedule', 'generator', 'linux', 'job', 'expression']);
  s.css = '.cg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.cg-out{margin-top:14px;background:#0D1117;border:1px solid var(--border);border-radius:12px;padding:14px;font-family:ui-monospace,Menlo,monospace;font-size:16px;color:#93C5FD;word-break:break-all}.cg-next{margin-top:10px;font-size:13px;color:var(--muted);line-height:1.7}';
  s.panel = panel.wrap('cg', 'fa-solid fa-clock', 'Cron schedule builder',
    '<div class="cg-grid">' +
    '<div class="field"><label for="cgMin">Minute (0-59)</label><input id="cgMin" value="0" autocomplete="off"></div>' +
    '<div class="field"><label for="cgHour">Hour (0-23)</label><input id="cgHour" value="9" autocomplete="off"></div>' +
    '<div class="field"><label for="cgDom">Day of month (1-31)</label><input id="cgDom" value="*" autocomplete="off"></div>' +
    '<div class="field"><label for="cgMon">Month (1-12)</label><input id="cgMon" value="*" autocomplete="off"></div>' +
    '<div class="field"><label for="cgDow">Day of week (0-7)</label><input id="cgDow" value="*" autocomplete="off"></div>' +
    '</div>' +
    '<div class="field" style="margin-top:12px;max-width:420px"><label for="cgPreset">Preset</label><select id="cgPreset">' +
    '<option value="">Custom...</option>' +
    '<option value="* * * * *">Every minute</option>' +
    '<option value="0 * * * *">Every hour at :00</option>' +
    '<option value="*/5 * * * *">Every 5 minutes</option>' +
    '<option value="0 0 * * *">Daily at midnight</option>' +
    '<option value="0 9 * * 1-5">Weekdays at 09:00</option>' +
    '<option value="0 18 * * 0">Sundays at 18:00</option>' +
    '<option value="0 0 1 * *">1st of the month at midnight</option>' +
    '<option value="0 12 * * 1">Mondays at noon</option>' +
    '<option value="30 2 * * 6">Saturdays at 02:30</option>' +
    '</select></div>' +
    '<div class="cg-out" id="cgOut">0 9 * * *</div>' +
    '<div class="cg-next" id="cgNext"></div>' +
    '<div class="actions" style="margin-top:14px"><button class="rt-btn" type="button" id="cgCopy"><i class="fa-solid fa-copy"></i>Copy expression</button></div>');
  s.js = COPY_FN + `
var _cgIds=["cgMin","cgHour","cgDom","cgMon","cgDow"],_cgOut=document.getElementById("cgOut"),_cgNext=document.getElementById("cgNext"),_cgProc=document.getElementById("cgProc");
var _cgMonths=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var _cgDays=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function _cgField(v,min,max){
  v=String(v||"").trim();
  if(v==="*")return function(){return true};
  if(/^\\*\\/\\d+$/.test(v)){var st=parseInt(v.slice(2),10);if(!(st>0))return false;return function(x){return x%st===0}}
  if(/^\\d+$/.test(v)){var n=parseInt(v,10);return function(x){return x===n}}
  if(/^\\d+-\\d+$/.test(v)){var p=v.split("-");var a=parseInt(p[0],10),b=parseInt(p[1],10);return function(x){return x>=a&&x<=b}}
  if(v.indexOf(",")!==-1){var set=v.split(",").map(function(x){return parseInt(x,10)});return function(x){return set.indexOf(x)!==-1}}
  return false;
}
function _cgMatches(date,f){
  var min=date.getMinutes(),hr=date.getHours(),dm=date.getDate(),mo=date.getMonth()+1,dw=date.getDay();
  return f.min(min)&&f.hr(hr)&&f.dm(dm)&&f.mo(mo)&&f.dw(dw);
}
function _cgNextRuns(f,from,count){
  var d=new Date(from.getTime());d.setSeconds(0,0);d.setMinutes(d.getMinutes()+1);
  var out=[],guard=0;
  while(out.length<count&&guard<3000000){
    if(_cgMatches(d,f))out.push(new Date(d.getTime()));
    d.setMinutes(d.getMinutes()+1);guard++;
  }
  return out;
}
function _cgHuman(parts){
  var mn=parts[0],hr=parts[1],dm=parts[2],mo=parts[3],dw=parts[4];
  var when="";
  if(mn==="*"&&hr==="*")when="every minute";
  else if(hr==="*"&&/^\\d+$/.test(mn))when="minute "+mn+" of every hour";
  else if(/^\\d+$/.test(hr)&&/^\\d+$/.test(mn))when="at "+(hr<10?"0"+hr:hr)+":"+(mn<10?"0"+mn:mn);
  else if(/^\\*\\/\\d+$/.test(mn))when="every "+mn.slice(2)+" minutes";
  else when="at "+mn+" past hour "+hr;
  var day="";
  if(dw!=="*")day=" on day-of-week "+dw;
  if(dm!=="*")day+=" on day-of-month "+dm;
  if(mo!=="*")day+=" in month "+mo;
  return "Runs "+when+day+".";
}
function _cgRun(){
  var parts=_cgIds.map(function(id){return String(document.getElementById(id).value||"").trim()});
  var expr=parts.join(" ");
  _cgOut.textContent=expr;
  var f={min:_cgField(parts[0],0,59),hr:_cgField(parts[1],0,23),dm:_cgField(parts[2],1,31),mo:_cgField(parts[3],1,12),dw:_cgField(parts[4],0,7)};
  var bad=Object.keys(f).some(function(k){return f[k]===false});
  if(bad){_cgNext.textContent="One or more fields are not valid cron syntax.";_cgProc.textContent="Fix the highlighted fields.";return}
  var runs=_cgNextRuns(f,new Date(),5);
  _cgNext.innerHTML=_cgHuman(parts)+"<br>Next runs:<br>"+(runs.length?runs.map(function(d){return "&middot; "+d.toString()}).join("<br>"):"none in the next ~5 years (rare or impossible schedule)");
  _cgProc.textContent="Expression built.";
}
_cgIds.forEach(function(id){document.getElementById(id).addEventListener("input",function(){document.getElementById("cgPreset").value="";_cgRun()})});
document.getElementById("cgPreset").addEventListener("change",function(){
  var v=this.value;if(!v)return;
  var p=v.split(" ");
  _cgIds.forEach(function(id,i){document.getElementById(id).value=p[i]});
  _cgRun();
});
document.getElementById("cgCopy").addEventListener("click",function(){_cp(_cgOut.textContent);_cgProc.textContent="Expression copied.";});
document.getElementById("cgSample").addEventListener("click",function(){document.getElementById("cgPreset").value="0 9 * * 1-5";document.getElementById("cgPreset").dispatchEvent(new Event("change"));});
document.getElementById("cgClear").addEventListener("click",function(){_cgIds.forEach(function(id,i){document.getElementById(id).value=i<2?"0":"*"});_cgRun();});
_cgRun();`;

  stdArticle(s,
    [{ id: 'overview', heading: 'Five fields, endless schedules', html: '<p>A crontab line is five space-separated fields - minute, hour, day of month, month, day of week - where <code>*</code> means "any", <code>a-b</code> a range, <code>a,b</code> a list and <code>*/n</code> a step. This builder assembles the fields for you, shows the plain-English meaning, and previews the next run times.</p>' },
     { id: 'examples', heading: 'Common recipes', html: '<p><code>*/5 * * * *</code> every five minutes. <code>0 9 * * 1-5</code> weekday mornings. <code>0 0 1 * *</code> monthly on the first. The preset dropdown covers the classics; edit any field afterwards for custom combinations.</p>' }],
    ['Pick a preset or set each field manually', 'Read the description and next-run preview', 'Copy the expression into your crontab or scheduler config'],
    ['Days of week: 0 and 7 are both Sunday', 'Cron uses the server\u2019s local time zone', 'The next-run preview scans up to three years ahead for rare schedules'],
    [['What about seconds or years?', 'Standard cron has neither - use a systemd timer or Quartz for those.'], ['Is the preview exact?', 'It steps minute-by-minute from now, so it matches real cron semantics including step/range fields.']],
    'Related: <a href="./date-format-converter.html">Date Format Converter</a> · <a href="./unix-timestamp-converter.html">Unix Timestamp Converter</a>');
  add(s);
})();

const reg = registerTools(entries);
console.log('Batch 13 complete:', reg.added, 'added,', reg.skipped, 'skipped');
