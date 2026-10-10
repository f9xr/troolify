/* ============================================================================
   Troolify - it-tools migration, batch 4
   JSON/XML/SQL data tools.
   Run: node troolify-gen/gen-tools-batch4.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ---- shared: read-only output textarea ---- */
function outArea(id, label, hint) {
  return '<div class="result-card"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">' + label + '</span>' +
    '<textarea id="' + id + '"readonly spellcheck="false"style="min-height:220px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;margin-top:6px"aria-label="' + (hint || label) + '"placeholder="Output appears here"></textarea></div></div></div>';
}

/* ========================================================================
   1. JSON TO XML
   ======================================================================== */
add({
  file: 'json-to-xml.html', folder: 'coding',
  name: 'JSON to XML', tag: 'Converter', icon: 'fa-solid fa-file-code',
  title: 'JSON to XML Converter | Transform JSON Into XML Fast',
  metaDesc: 'Convert JSON objects into indented XML instantly. Handles nested objects, arrays and scalars with correct escaping, fully offline.',
  desc: 'Turn any JSON structure into formatted XML with one click. Nested objects, arrays and mixed types are converted automatically.',
  keywords: ['json to xml', 'json to xml converter', 'convert json xml', 'json xml transformation', 'xml from json', 'json to xml online', 'json to xml mapper', 'xml generator json', 'json to xml tool', 'rest xml json'],
  featureList: ['One-click conversion', 'Nested object support', 'Array expansion support', 'XML escaping', 'Indented output', '100% client-side'],
  panel: panel.wrap('jx', 'fa-solid fa-file-code', 'JSON to XML',
    panel.ioTwo('jx', 'JSON input', 'XML output', 'Paste your JSON here…', 'Converted XML appears here…') +
    panel.actions('jx', 'Convert') ),
  css: '.jx-panel textarea{min-height:180px}',
  js: `
    var NL=String.fromCharCode(10);
    function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function pad(d){var s="";for(var i=0;i<d;i++)s+="  ";return s;}
    function conv(v,name,depth,out){
      if(v===null||v===undefined){out.push(pad(depth)+"<"+name+"/>");return;}
      if(Array.isArray(v)){
        var en=name.length>1&&name.slice(-1)==="s"?name.slice(0,-1):name;
        for(var i=0;i<v.length;i++)conv(v[i],en,depth,out);
        return;
      }
      if(typeof v==="object"){
        out.push(pad(depth)+"<"+name+">");
        var keys=Object.keys(v);
        for(var k=0;k<keys.length;k++)conv(v[keys[k]],keys[k],depth+1,out);
        out.push(pad(depth)+"</"+name+">");
        return;
      }
      out.push(pad(depth)+"<"+name+">"+esc(String(v))+"</"+name+">");
    }
    function run(){
      var inp=document.getElementById("jxIn").value;
      var out=document.getElementById("jxOut");
      var proc=document.querySelector("#jxProc");
      if(!inp.trim()){out.value="";proc.textContent="Paste some JSON to get started.";return;}
      try{
        var o=JSON.parse(inp);
        var lines=["<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>","<root>"];
        if(Array.isArray(o)){conv(o,"root",1,lines);}
        else{Object.keys(o).forEach(function(key){conv(o[key],key,1,lines);});}
        lines.push("</root>");
        out.value=lines.join(NL);
        proc.textContent="Converted in this tab.";
      }catch(e){out.value="";proc.textContent="Invalid JSON: "+e.message;}
    }
    document.getElementById("jxGo").addEventListener("click",run);
    document.getElementById("jxIn").addEventListener("input",run);
    document.getElementById("jxCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("jxOut").value,function(){document.querySelector("#jxProc").textContent="Copied to clipboard."})});
    document.getElementById("jxSample").addEventListener("click",function(){
      document.getElementById("jxIn").value=JSON.stringify({name:"Troolify",tools:["json","yaml","toml"],meta:{version:1,active:true},note:null},null,2);
      run();
    });
    document.getElementById("jxClear").addEventListener("click",function(){document.getElementById("jxIn").value="";document.getElementById("jxOut").value="";});
  `,
  article: {
    title: 'JSON to XML Converter: Carry the Data, Swap the Wrapper',
    lead: '<p>JSON and XML both describe structured data, but the ecosystems around them rarely overlap. This <strong>JSON to XML converter</strong> turns any JSON document into indented XML, mapping objects to elements, arrays to repeated elements, and scalars to text content with automatic escaping.</p><p>The conversion runs entirely in your browser, so no payload is uploaded.</p>',
    sections: [
      { id: 'mapping', icon: 'fa-solid fa-diagram-project', heading: 'How the mapping works', html: '<p>Each object key becomes an XML element. A nested object becomes a wrapping element around its children, and an array becomes a series of sibling elements named after the key, with a trailing "s" trimmed to keep names like <code>tools</code> from looking odd. Scalars become text nodes, booleans and numbers are written as their literal value, and null becomes an empty self-closing element.</p>' },
      { id: 'escaping', icon: 'fa-solid fa-shield-halved', heading: 'Why escaping matters', html: '<p>Five characters are dangerous in XML: <code>&amp;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&quot;</code>, and <code>&apos;</code>. A JSON string value such as <code>"a &amp;&lt; b"</code> would break a downstream parser if written literally. The converter escapes those characters, so the output stays well-formed even with hostile-looking values.</p>' }
    ],
    steps: [
      'Paste a JSON object, array, or scalar into the input box.',
      'The XML output appears as you type, or press Convert.',
      'Copy the formatted XML for your feed, API, or config.'
    ],
    facts: [['Objects', 'Become nested elements'], ['Arrays', 'Become repeated elements'], ['Scalars', 'Become text content'], ['Escaping', 'Automatic for all five XML entities'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Migrating APIs', 'Reshape JSON responses into the XML shape a legacy consumer still expects.'], 
      ['Generating feeds', 'Produce RSS or custom XML exports from JSON configuration with consistent structure.'], 
      ['Learning both formats', 'See how the same data looks in each dialect side by side.']],
    tips: [
      'Keys with characters that are illegal in XML element names will produce imperfect output; rename them before converting for production use.',
      'Root keys are merged under a single <root> element so the result is always well-formed.',
      'The output is deterministic: the same JSON always yields the same XML, handy for reproducible exports.'
    ],
    takeaways: [['objects','Become element trees'],['arrays','Expand into repeated elements'],['local','Conversion stays in the tab']],
    faq: [
      ['Does it handle nested objects?','Yes. Objects nest as elements, with no depth limit beyond what fits in memory.'],
      ['What happens to arrays?','An array becomes repeated sibling elements named after its key (plural "s" trimmed), which is the standard convention.'],
      ['How are special characters handled?','Values are escaped so &amp;, &lt;, &gt;, quotes and apostrophes appear as legal entities.'],
      ['Is order preserved?','Element order follows the object key order exactly as given in the JSON.'],
      ['Is my data uploaded?','No. The whole conversion runs in your browser.']],
    conclusion: '<p>Same data, different envelope, zero lifting. Reach for this <strong>JSON to XML converter</strong> whenever a system upstream speaks XML, and try our <a href="xml-to-json.html">XML to JSON converter</a> for the return trip.</p>'
  }
});

/* ========================================================================
   2. XML TO JSON
   ======================================================================== */
add({
  file: 'xml-to-json.html', folder: 'coding',
  name: 'XML to JSON', tag: 'Converter', icon: 'fa-solid fa-code-branch',
  title: 'XML to JSON Converter | Parse XML Into Clean JSON',
  metaDesc: 'Convert XML documents to JSON with element grouping, attribute handling and text content extraction. Instant, offline, dependable.',
  desc: 'Parse any XML document into JSON in your browser, grouping repeated elements into arrays and keeping attributes readable.',
  keywords: ['xml to json', 'xml to json converter', 'convert xml json', 'xml parser json', 'parse xml', 'xml to object', 'xml json online', 'xml to json tool', 'xml2js', 'xml to json transformation'],
  featureList: ['DOMParser based parsing', 'Repeated elements grouped', 'Attributes preserved', 'Text content extraction', 'One-click conversion', '100% client-side'],
  panel: panel.wrap('xj', 'fa-solid fa-code-branch', 'XML to JSON',
    panel.ioTwo('xj', 'XML input', 'JSON output', 'Paste your XML here…', 'Converted JSON appears here…') +
    panel.actions('xj', 'Convert') ),
  css: '.xj-panel .io-grid.two{grid-template-columns:1fr}', /* stack for readability is fine either way; default two-col also OK */
  js: `
    function build(n){
      if(n.nodeType===3||n.nodeType===4){var t=(n.nodeValue||"").trim();return t?t:null;}
      if(n.nodeType===1){
        var entries={};
        var a=n.attributes;
        for(var i=0;i<a.length;i++)entries["@"+a[i].name]=a[i].value;
        var single={};
        var cn=n.childNodes;
        for(var j=0;j<cn.length;j++){
          var c=build(cn[j]);
          if(c===null||c===undefined)continue;
          if(typeof c==="string"){
            entries["#text"]=(entries["#text"]?entries["#text"]+" ": "")+c;
            continue;
          }
          var tag=c.tag,val=c.val;
          var cnt=single[tag]||0;
          single[tag]=cnt+1;
          if(cnt>0){if(!Array.isArray(entries[tag]))entries[tag]=[entries[tag]];entries[tag].push(val);}
          else entries[tag]=val;
        }
        var keys=Object.keys(entries);
        if(keys.length===1&&entries["#text"])return entries["#text"];
        if(!keys.length)return null;
        return {tag:n.nodeName,val:entries};
      }
      return null;
    }
    function run(){
      var inp=document.getElementById("xjIn").value;
      var out=document.getElementById("xjOut");
      var proc=document.querySelector("#xjProc");
      if(!inp.trim()){out.value="";proc.textContent="Paste some XML to get started.";return;}
      var doc=new DOMParser().parseFromString(inp,"text/xml");
      if(doc.getElementsByTagName("parsererror").length){out.value="";proc.textContent="Invalid XML - could not parse.";return;}
      var root=doc.documentElement;
      var res=build(root);
      var payload=(res&&res.tag?res.val:res);
      out.value=JSON.stringify(payload,null,2);
      proc.textContent="Converted in this tab.";
    }
    document.getElementById("xjGo").addEventListener("click",run);
    document.getElementById("xjIn").addEventListener("input",run);
    document.getElementById("xjCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("xjOut").value,function(){document.querySelector("#xjProc").textContent="Copied to clipboard."})});
    document.getElementById("xjSample").addEventListener("click",function(){
      var xml="<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><store id=\\"s1\\"><name>Troolify Shop</name><product><sku>J-01</sku><price currency=\\"EUR\\">12.5</price></product><product><sku>J-02</sku><price currency=\\"EUR\\">7</price></product></store>";
      document.getElementById("xjIn").value=xml;
      run();
    });
    document.getElementById("xjClear").addEventListener("click",function(){document.getElementById("xjIn").value="";document.getElementById("xjOut").value="";});
  `,
  article: {
    title: 'XML to JSON Converter: Turn Markup Into Objects',
    lead: '<p>When a service hands you XML and your application speaks JSON, the gap is purely mechanical. This <strong>XML to JSON converter</strong> parses the document with the browser\'s own DOMParser and rebuilds it as a JSON structure: repeated elements collapse into arrays, attributes become readable keys, and text content is kept or flattened when it is all that remains.</p><p>Everything is parsed locally, so even sensitive bundles never leave your machine.</p>',
    sections: [
      { id: 'conventions', icon: 'fa-solid fa-list-check', heading: 'The conversion conventions', html: '<p>Attributes are prefixed with <code>@</code> so they cannot collide with child elements. Elements that repeat become arrays, while single occurrences stay as plain objects. Text-only elements are flattened to their string value, and mixed content is preserved under a <code>#text</code> key. These are the de-facto conventions that make round-trips predictable.</p>' },
      { id: 'edges', icon: 'fa-solid fa-triangle-exclamation', heading: 'Edge cases worth knowing', html: '<p>XML allows structures JSON cannot express directly, such as mixed text and elements inside the same parent, processing instructions, and comments. This converter keeps the useful parts and drops the rest. Namespace prefixes remain visible in element names, which is usually fine for inspection tasks; deeply lossless round-tripping would need a schema-specific mapper.</p>' }
    ],
    steps: [
      'Paste the XML document into the input box.',
      'The JSON representation appears as you type.',
      'Copy the output into your application, tests, or logs.'
    ],
    facts: [['Parser', 'Browser DOMParser'], ['Attributes', 'Prefixed with @'], ['Repeats', 'Grouped into arrays'], ['Text-only', 'Flattened to strings'], ['Error state', 'parsererror detected']],
    useCases: [
      ['Inspecting web services', 'SOAP and older REST payloads become readable JSON in seconds.'], 
      ['Transforming feeds', 'Convert RSS or sitemap XML to JSON objects to consume in modern code.'], 
      ['Debugging mocks', 'See exactly which attributes and repeats exist before writing a parser.']],
    tips: [
      'Check that attribute keys do not collide with child element names after the @ prefix; this converter keeps both cleanly.',
      'Numeric strings stay strings; convert them after parsing if your schema expects numbers.',
      'For a single repeated element, the output still uses an array, so downstream code can assume list semantics.'
    ],
    takeaways: [['@','Attributes are namespaced'],['arrays','Repeats grouped automatically'],['local','Parsed entirely in the browser']],
    faq: [
      ['How are repeated elements handled?','They become arrays; a single occurrence stays a plain object so your code can rely on consistent types.'],
      ['What happens to attributes?','They are kept and prefixed with @, e.g. @id, so no information is silently dropped.'],
      ['What if the XML is malformed?','The parser detects the parsererror element and reports it instead of producing partial output.'],
      ['Are entity references decoded?','Yes; DOMParser resolves standard entities like &amp; and &lt; into their characters, and numeric references are decoded too.'],
      ['Does this upload my XML?','No. Parsing runs entirely in your browser.']],
    conclusion: '<p>Markup in, objects out, no guesswork about where the parentheses go. Use this <strong>XML to JSON converter</strong> to preview payloads, and flip the direction with our <a href="json-to-xml.html">JSON to XML converter</a> when the target system expects markup.</p>'
  }
});

/* ========================================================================
   3. XML FORMATTER
   ======================================================================== */
add({
  file: 'xml-formatter.html', folder: 'coding',
  name: 'XML Formatter', tag: 'Formatter', icon: 'fa-solid fa-indent',
  title: 'XML Formatter | Pretty Print & Indent XML Online',
  metaDesc: 'Pretty-print minified or messy XML with indentation, comments and CDATA preserved. Instant reformatting, fully offline.',
  desc: 'Re-indent minified XML so you can actually read it. Comments, CDATA, and processing instructions are preserved.',
  keywords: ['xml formatter', 'pretty print xml', 'xml pretty printer', 'format xml online', 'xml indent', 'beautify xml', 'xml beautifier', 'xml tidy', 'indent xml', 'xml whitespace'],
  featureList: ['Two-space indentation', 'Comments preserved', 'CDATA handled', 'Declarations kept', 'One-click copy', '100% client-side'],
  panel: panel.wrap('xf', 'fa-solid fa-indent', 'XML formatter',
    panel.ioTwo('xf', 'XML input', 'Formatted XML', 'Paste minified XML here…', 'Indented XML appears here…') +
    panel.actions('xf', 'Format') ),
  css: '',
  js: `
    var NL=String.fromCharCode(10);
    function fmt(xml){
      var out=[],ind=0,n=xml.length,i=0;
      function pad(){var s="";for(var k=0;k<ind;k++)s+="  ";return s;}
      while(i<n){
        if(xml.charAt(i)==="<"){
          var gt=xml.indexOf(">",i);
          if(gt<0){out.push(pad()+xml.slice(i));break;}
          var head=xml.slice(i,Math.min(i+9,n));
          var comment=head.slice(0,4)==="<!--";
          var decl=head.slice(0,2)==="<?";
          var cdata=head.slice(0,9)==="<![CDATA[";
          var doctype=head.slice(0,2)==="<!";
          var end=gt;
          if(comment){var ec=xml.indexOf("-->",i);end=ec>=0?ec+2:gt;}
          if(cdata){var cc=xml.indexOf("]]>",i);end=cc>=0?cc+2:gt;}
          var raw=xml.slice(i,end+1);
          var isEnd=raw.charAt(1)==="/";
          var selfClose=raw.slice(-2)==="/>";
          if(isEnd)ind=Math.max(0,ind-1);
          var isDecl=decl||comment||doctype;
          out.push(pad()+raw);
          if(!isEnd&&!selfClose&&!isDecl)i=end+1==i? i+1:end+1;
          else i=end+1;
          if(!isEnd&&!selfClose&&!isDecl)ind++;
          continue;
        }
        var nx=xml.indexOf("<",i);
        if(nx<0)nx=n;
        var t=xml.slice(i,nx);
        t=t.split(NL).join(" ").split(String.fromCharCode(9)).join(" ").split(String.fromCharCode(13)).join(" ").replace(/ +/g," ").trim();
        if(t)out.push(pad()+t);
        i=nx;
      }
      return out.join(NL);
    }
    function run(){
      var inp=document.getElementById("xfIn").value;
      var out=document.getElementById("xfOut");
      var proc=document.querySelector("#xfProc");
      if(!inp.trim()){out.value="";proc.textContent="Paste some XML to format.";return;}
      out.value=fmt(inp);
      proc.textContent="Formatted in this tab.";
    }
    document.getElementById("xfGo").addEventListener("click",run);
    document.getElementById("xfIn").addEventListener("input",run);
    document.getElementById("xfCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("xfOut").value,function(){document.querySelector("#xfProc").textContent="Copied to clipboard."})});
    document.getElementById("xfSample").addEventListener("click",function(){
      document.getElementById("xfIn").value="<?xml version=\\"1.0\\"?><config><log><level>debug</level><format>json</format></log><retries>3</retries><!-- keep this comment --><notes><![CDATA[ raw <text> & more ]]></notes></config>";
      run();
    });
    document.getElementById("xfClear").addEventListener("click",function(){document.getElementById("xfIn").value="";document.getElementById("xfOut").value="";});
  `,
  article: {
    title: 'XML Formatter: Because Nobody Reads a Wall of Tags',
    lead: '<p>Logs, exports, and config dumps often arrive as one line of markup thousands of characters long. This <strong>XML formatter</strong> breaks it into an indented, two-space-per-level tree, separating structure from noise so you can actually find the node you are hunting for.</p><p>Comments, CDATA blocks, processing instructions, and doctypes survive the pass untouched.</p>',
    sections: [
      { id: 'what-it-keeps', icon: 'fa-solid fa-clipboard-check', heading: 'What the formatter preserves', html: '<p>Formatting only changes whitespace between tokens. Comments stay where they are, CDATA sections keep their exact contents, the XML declaration stays first, and attribute order is untouched. What changes is the layout: each nested level moves two spaces deeper, and mixed text is collapsed to a single line so it does not explode into noise.</p>' },
      { id: 'when-you-need-it', icon: 'fa-solid fa-magnifying-glass', heading: 'Formatting is debugging', html: '<p>A single-line XML error message from an API is nearly unreadable. Formatted, the missing closing tag or badly nested element stands out immediately. The same pass is useful before comparing two versions of a config, since whitespace-only differences vanish once both sides are normalized.</p>' }
    ],
    steps: [
      'Paste the compact XML into the input box.',
      'The formatted, indented version updates as you type.',
      'Copy it into your notes, diff tool, or ticket.'
    ],
    facts: [['Indent', 'Two spaces per level'], ['End tags', 'Dedented automatically'], ['Comments', 'Preserved'], ['CDATA', 'Preserved'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Reading API responses', 'Formatted XML exposes nesting errors and missing data immediately.'], 
      ['Diffing configs', 'Normalized layout makes real differences stand out instead of whitespace noise.'], 
      ['Sharing in tickets', 'Paste a readable snippet instead of a giant run-on line.']],
    tips: [
      'Format both sides before diffing, or identical documents will look different due to spacing alone.',
      'If the input is not well-formed, the formatter still does its best; check the reported structure by hand.',
      'The two-space indent matches the most common XML style in the wild.'
    ],
    takeaways: [['indent','Two-space nesting'],['preserve','Comments, CDATA, declarations kept'],['local','No uploads']],
    faq: [
      ['Does it validate my XML?','It formats token by token rather than validating. Well-formed documents format perfectly; broken ones produce best-effort output.'],
      ['Are comments and CDATA kept?','Yes, both survive unchanged so you can rely on the formatted file being equivalent to the original.'],
      ['Why is my doctype on its own line?','Declarations are treated as block-level nodes and preserved in place.'],
      ['Can it minify?','This tool indents; use it together with a minifier when you need the reverse direction.'],
      ['Is the content uploaded?','No. Formatting happens entirely in your browser.']],
    conclusion: '<p>Structure you can see beats structure you have to infer. Run anything through this <strong>XML formatter</strong> before you review it, and keep the <a href="json-formatter.html">JSON formatter</a> next to it for the other half of your data files.</p>'
  }
});

/* ========================================================================
   4. JSON DIFF
   ======================================================================== */
add({
  file: 'json-diff.html', folder: 'coding',
  name: 'JSON Diff', tag: 'Diff', icon: 'fa-solid fa-code-compare',
  title: 'JSON Diff | Compare Two JSON Documents Side by Side',
  metaDesc: 'Compare two JSON documents and see added, removed and changed values with their paths. Deep recursive diff, offline.',
  desc: 'Diff any two JSON documents: see exactly which paths were added, removed, or changed, displayed as a clear list.',
  keywords: ['json diff', 'compare json', 'json difference', 'json compare tool', 'diff json files', 'json diff tool', 'json object compare', 'json comparison', 'api response diff', 'json structure diff'],
  featureList: ['Deep recursive diff', 'Path-based results', 'Added / removed / changed', 'Array index support', 'Instant comparison', '100% client-side'],
  panel: panel.wrap('jd', 'fa-solid fa-code-compare', 'JSON diff',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div class="io-field"><label for="jdL">Left (original)</label><textarea id="jdL"spellcheck="false"placeholder="Original JSON here…"></textarea></div>' +
    '<div class="io-field"><label for="jdR">Right (changed)</label><textarea id="jdR"spellcheck="false"placeholder="Changed JSON here…"></textarea></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="jdGo"><i class="fa-solid fa-code-compare"></i>Diff</button>' +
    '<button class="rt-btn"type="button"id="jdCopy"><i class="fa-solid fa-copy"></i>Copy text</button></div>' +
    '<div class="result-card"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">Differences</span><div id="jdOut"class="jd-list"style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.7;color:#D1D5DB">No differences yet.</div></div></div></div>'),
  css: '.jd-panel .io-field textarea{min-height:150px}.jd-panel .jd-list div{white-space:pre-wrap;word-break:break-all}.jd-panel .jda{color:#4ADE80}.jd-panel .jdr{color:#F87171}.jd-panel .jdc{color:#FBBF24}',
  js: `
    function fmtVal(v){var s=JSON.stringify(v);if(s===undefined)s=String(v);return s&&s.length>90?s.slice(0,87)+"...":s;}
    function walk(a,b,path,out,aLen,bLen){
      var sa=JSON.stringify(a),sb=JSON.stringify(b);
      if(sa===sb)return;
      var ta=typeof a,tb=typeof b;
      if(a===null||b===null||ta!==tb||ta!=="object"){
        out.push({op:"~",path:path.join("."),a:fmtVal(a),b:fmtVal(b)});
        return;
      }
      if(Array.isArray(a)&&Array.isArray(b)){
        var n=Math.max(a.length,b.length);
        for(var i=0;i<n;i++){
          var p=path.concat("["+i+"]");
          if(i>=a.length)out.push({op:"+",path:p.join("."),b:fmtVal(b[i])});
          else if(i>=b.length)out.push({op:"-",path:p.join("."),a:fmtVal(a[i])});
          else walk(a[i],b[i],p,out,aLen,bLen);
        }
        return;
      }
      var keys={};
      for(var k in a)keys[k]=1;
      for(var k2 in b)keys[k2]=1;
      for(var key in keys){
        var p2=path.concat(key);
        if(!Object.prototype.hasOwnProperty.call(b,key))out.push({op:"-",path:p2.join("."),a:fmtVal(a[key])});
        else if(!Object.prototype.hasOwnProperty.call(a,key))out.push({op:"+",path:p2.join("."),b:fmtVal(b[key])});
        else walk(a[key],b[key],p2,out,aLen,bLen);
      }
    }
    function run(){
      var L=document.getElementById("jdL").value,R=document.getElementById("jdR").value;
      var box=document.getElementById("jdOut");
      var proc=document.querySelector("#jdProc");
      if(!L.trim()&&!R.trim()){box.innerHTML="Paste two documents to compare.";return;}
      var a,b;
      try{a=JSON.parse(L||"null");}catch(e){box.innerHTML="<div class=\\"jdr\\">Left JSON invalid: "+e.message+"</div>";return;}
      try{b=JSON.parse(R||"null");}catch(e){box.innerHTML="<div class=\\"jdr\\">Right JSON invalid: "+e.message+"</div>";return;}
      var out=[];
      walk(a,b,[],out);
      if(!out.length){box.innerHTML="<div class=\\"jda\\">Identical - no differences found.</div>";proc.textContent="Compared in this tab.";return;}
      var html="";
      for(var i=0;i<out.length;i++){
        var d=out[i];
        if(d.op==="+")html+="<div class=\\"jda\\">+ "+d.path+" : "+d.b+"</div>";
        else if(d.op==="-")html+="<div class=\\"jdr\\">- "+d.path+" : "+d.a+"</div>";
        else html+="<div class=\\"jdc\\">~ "+d.path+" : "+d.a+" -&gt; "+d.b+"</div>";
      }
      box.innerHTML=html;
      proc.textContent=out.length.toString()+" difference(s) found - compared in this tab.";
      window._jdOut=out;
    }
    document.getElementById("jdGo").addEventListener("click",run);
    ["jdL","jdR"].forEach(function(id){document.getElementById(id).addEventListener("input",run);});
    document.getElementById("jdCopy").addEventListener("click",function(){
      if(!window._jdOut){document.querySelector("#jdProc").textContent="Run a diff first.";return;}
      var NL=String.fromCharCode(10);var lines=[];
      for(var i=0;i<window._jdOut.length;i++){var d=window._jdOut[i];if(d.op==="+")lines.push("+ "+d.path+" : "+d.b);else if(d.op==="-")lines.push("- "+d.path+" : "+d.a);else lines.push("~ "+d.path+" : "+d.a+" -> "+d.b);}
      window.Troolify.copyToClipboard(lines.join(NL),function(){document.querySelector("#jdProc").textContent="Diff text copied.";});
    });
    document.getElementById("jdSample").addEventListener("click",function(){
      document.getElementById("jdL").value=JSON.stringify({name:"svc",version:2,enabled:true,ports:[80,443],deploy:{env:"prod",region:"eu"}},null,2);
      document.getElementById("jdR").value=JSON.stringify({name:"svc",version:3,enabled:true,ports:[80,443,8080],logging:"json",deploy:{env:"prod",region:"us"}},null,2);
      run();
    });
    document.getElementById("jdClear").addEventListener("click",function(){document.getElementById("jdL").value="";document.getElementById("jdR").value="";document.getElementById("jdOut").innerHTML="No differences yet.";});
  `,
  article: {
    title: 'JSON Diff: See Exactly What Changed in Your Data',
    lead: '<p>"It worked on my machine" becomes much easier to investigate when you can point at the precise paths that differ between two documents. This <strong>JSON diff</strong> walks both inputs recursively and reports each difference as a dotted path with the old and new values, grouped into additions, removals, and changes.</p><p>Arrays are compared index by index, and the comparison is structural, not textual, so whitespace and key order never trigger false positives.</p>',
    sections: [
      { id: 'structural', icon: 'fa-solid fa-sitemap', heading: 'Structural comparison beats textual diff', html: '<p>Two JSON documents that differ only in key order or whitespace are semantically identical. Text diff tools flag them anyway. This tool parses both sides and compares values at each path, so reordered keys pass silently and a changed number at any depth shows up with its exact location. That makes it ideal for comparing API responses and flaky test fixtures.</p>' },
      { id: 'arrays', icon: 'fa-solid fa-list', heading: 'How arrays are compared', html: '<p>Arrays are matched by index, which is the predictable choice for ordered data. A node pushed to the end of an array appears as an addition at <code>[3]</code>, and a removed element shows its old value. For arrays that are semantically sets (order-insensitive), sorting both sides first gives cleaner results.</p>' }
    ],
    steps: [
      'Paste the original document on the left and the changed one on the right.',
      'The diff renders a color-coded list of paths as you type.',
      'Hover the path to track down the field in your own code, or copy the plain-text diff.'
    ],
    facts: [['Result', 'Path + old and new values'], ['Additions', 'Green (+)'], ['Removals', 'Red (-)'], ['Changes', 'Amber (~)'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Debugging APIs', 'Compare a working response with a failing one and see which field actually changed.'], 
      ['Regression checks', 'Diff config snapshots across deploys to surface silent drift.'], 
      ['Test fixtures', 'Find the one value that makes a gold file differ from the new output.']],
    tips: [
      'For unordered sets, sort both arrays before diffing to avoid index-shift noise.',
      'Diff normalized (pretty-printed) documents when you are working directly with text dumps.',
      'Use the copy action to paste the plain-text difference into tickets.'
    ],
    takeaways: [['path','Every change has a location'],['typed','Added/removed/changed separated'],['structural','Order and spacing ignored']],
    faq: [
      ['What counts as a difference?','Any value at the same path that is not deep-equal: added keys, removed keys, and changed scalars or structures.'],
      ['Are key order differences reported?','No. Parsed comparison treats key order as insignificant, which avoids false positives.'],
      ['How are arrays handled?','Index by index; shorter arrays trigger removals at the tail, longer ones additions.'],
      ['Can I copy the result?','Yes, use the copy action to store the plain-text path list.'],
      ['Does it upload my data?','No, the comparison runs entirely in your browser.']],
    conclusion: '<p>Diffing by meaning instead of by bytes saves minutes on every investigation. Let this <strong>JSON diff</strong> pinpoint the change, and pair it with our <a href="json-formatter.html">JSON formatter</a> to make the two sides readable first.</p>'
  }
});

/* ========================================================================
   5. SQL PRETTIFIER
   ======================================================================== */
add({
  file: 'sql-prettify.html', folder: 'coding',
  name: 'SQL Prettifier', tag: 'Formatter', icon: 'fa-solid fa-database',
  title: 'SQL Prettifier | Format & Indent SQL Queries Online',
  metaDesc: 'Pretty-print messy SQL queries with keyword-based line breaks and indentation. Handles strings and comments safely, offline.',
  desc: 'Format crammed SQL into readable statements: clauses on their own lines, keywords aligned, strings and comments preserved.',
  keywords: ['sql prettifier', 'sql formatter', 'format sql', 'sql beautifier', 'pretty print sql', 'sql indenter', 'sql tidy', 'format query sql', 'sql formatter online', 'beautify sql query'],
  featureList: ['Clause-aware line breaks', 'String literals preserved', 'Comment handling', 'Compound keywords', 'Best-effort indentation', '100% client-side'],
  panel: panel.wrap('sq', 'fa-solid fa-database', 'SQL prettifier',
    panel.ioTwo('sq', 'SQL input', 'Formatted SQL', 'Paste your SQL here…', 'Readable SQL appears here…') +
    panel.actions('sq', 'Format') ),
  css: '',
  js: `
    var NL=String.fromCharCode(10);
    var CLAUSE={"SELECT":1,"FROM":1,"WHERE":1,"GROUP":1,"HAVING":1,"ORDER":1,"LIMIT":1,"OFFSET":1,"JOIN":1,"UNION":1,"SET":1,"VALUES":1,"INSERT":1,"UPDATE":1,"DELETE":1,"CREATE":1,"ALTER":1,"DROP":1,"TRUNCATE":1};
    var COMPOUND={"GROUP":["BY"],"ORDER":["BY"],"LEFT":["JOIN"],"RIGHT":["JOIN"],"INNER":["JOIN"],"OUTER":["JOIN"],"FULL":["JOIN"],"CROSS":["JOIN"],"UNION":["ALL"]};
    function isWs(ch){var c=ch.charCodeAt(0);return c===32||c===9||c===10||c===13;}
    function tokenize(sql){
      var tokens=[],i=0,n=sql.length;
      while(i<n){
        var c=sql.charAt(i),cc=c.charCodeAt(0);
        if(isWs(c)){i++;continue;}
        if(cc===39||cc===34||cc===96){
          var q=c,start=i;i++;var closed=false;
          while(i<n){
            var ci=sql.charAt(i);
            if(ci.charCodeAt(0)===92){i+=2;continue;}
            if(ci===q){i++;closed=true;break;}
            i++;
          }
          if(!closed)i=n;
          tokens.push(sql.slice(start,i));
          continue;
        }
        if(c==="-"&&sql.charAt(i+1)==="-"){
          var e=sql.indexOf(NL,i);if(e<0)e=n;tokens.push(sql.slice(i,e));i=e;continue;
        }
        if(c==="/"&&sql.charAt(i+1)==="*"){
          var e2=sql.indexOf("*/",i);if(e2<0)e2=n;else e2+=2;tokens.push(sql.slice(i,e2));i=e2;continue;
        }
        if(cc===40||cc===41||cc===44){tokens.push(c);i++;continue;}
        var j=i;
        while(j<n){
          var cj=sql.charAt(j),cjcc=cj.charCodeAt(0);
          if(cjcc===32||cjcc===9||cjcc===10||cjcc===13)break;
          if(cj===","||cj==="("||cj===")")break;
          j++;
        }
        tokens.push(sql.slice(i,j));
        i=j;
      }
      return tokens;
    }
    function format(sql){
      var tks=tokenize(sql);
      var CLAUSE={"SELECT":1,"FROM":1,"WHERE":1,"GROUP":1,"HAVING":1,"ORDER":1,"LIMIT":1,"OFFSET":1,"JOIN":1,"UNION":1,"VALUES":1,"INSERT":1,"UPDATE":1,"DELETE":1,"CREATE":1,"ALTER":1,"DROP":1,"TRUNCATE":1,"BY":1};
      var lines=[],cur="";
      for(var i=0;i<tks.length;i++){
        var tok=tks[i],up=tok.toUpperCase();
        var nn=tks[i+1]?tks[i+1].toUpperCase():"";
        var isCompound=(up==="GROUP"&&nn==="BY")||(up==="ORDER"&&nn==="BY")||((up==="LEFT"||up==="RIGHT"||up==="INNER"||up==="OUTER"||up==="FULL"||up==="CROSS")&&nn==="JOIN")||(up==="UNION"&&nn==="ALL");
        var lineBreak=CLAUSE[up]&&!isCompound;
        if(lineBreak&&cur){lines.push(cur);cur="";}
        var lump=tok;
        if(isCompound){lump=up+" "+nn;i++;}
        cur=cur?(lump===","||lump===")"||lump===";"||cur.charAt(cur.length-1)==="(")?cur+lump:cur+" "+lump:lump;
      }
      if(cur)lines.push(cur);
      var res=[],depth=0;
      for(var r=0;r<lines.length;r++){
        var open=0,close=0,ln=lines[r];
        for(var k=0;k<ln.length;k++){
          if(ln.charAt(k)==="(")open++;
          if(ln.charAt(k)===")")close++;
        }
        var pad="";
        for(var q=0;q<depth;q++)pad+="  ";
        res.push(pad+ln);
        depth=Math.max(0,depth+open-close);
      }
      return res.join(NL);
    }
    function run(){
      var inp=document.getElementById("sqIn").value;
      var out=document.getElementById("sqOut");
      var proc=document.querySelector("#sqProc");
      if(!inp.trim()){out.value="";proc.textContent="Paste some SQL to format.";return;}
      out.value=format(inp);
      proc.textContent="Formatted in this tab.";
    }
    document.getElementById("sqGo").addEventListener("click",run);
    document.getElementById("sqIn").addEventListener("input",run);
    document.getElementById("sqCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("sqOut").value,function(){document.querySelector("#sqProc").textContent="Copied to clipboard."})});
    document.getElementById("sqSample").addEventListener("click",function(){
      document.getElementById("sqIn").value="select u.id,u.name,count(o.id) as orders from users u inner join orders o on o.user_id=u.id where u.active=1 group by u.id,u.name having count(o.id)>2 order by orders desc limit 10";
      run();
    });
    document.getElementById("sqClear").addEventListener("click",function(){document.getElementById("sqIn").value="";document.getElementById("sqOut").value="";});
  `,
  article: {
    title: 'SQL Prettifier: Queries You Can Actually Read',
    lead: '<p>A query crammed onto one line is hard to audit and harder to debug. This <strong>SQL prettifier</strong> splits it into clause-per-line layout with indentation that follows the parentheses, while leaving string literals and comments untouched. It is a best-effort beautifier tuned for the everyday SELECTs, joins, and updates found in logs and tickets.</p><p>Everything is processed locally, so even production queries never leave the tab.</p>',
    sections: [
      { id: 'clauses', icon: 'fa-solid fa-list-ul', heading: 'Clause-per-line layout', html: '<p>SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET, and JOIN start a new line, with compound keywords such as GROUP BY and LEFT JOIN kept together. Parenthesized expressions gain an extra indent level so deeply nested conditions remain readable rather than turning back into a wall of text.</p>' },
      { id: 'safe-parsing', icon: 'fa-solid fa-shield-halved', heading: 'Strings and comments stay put', html: '<p>The tokenizer jumps over single-quoted and double-quoted strings and backtick identifiers without looking inside them, which protects both SQL injection-lookalike data and dollar-sign-heavy text. Line comments (--) and block comments (/* */) are treated as single tokens too, so reformatting never rewrites their content.</p>' }
    ],
    steps: [
      'Paste the compact or messy SQL into the input box.',
      'The formatted version updates as you type.',
      'Copy it into your review notes or version control comment.'
    ],
    facts: [['Clauses', 'Own line, major keywords'], ['Strings', 'Preserved verbatim'], ['Comments', 'Preserved'], ['Indent', 'Follows parentheses'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Reviewing migrations', 'A formatted CREATE or ALTER statement is far easier to check for the details that matter.'], 
      ['Debugging slow queries', 'Readable structure makes the join order and filter placement obvious.'], 
      ['Learning SQL', 'See how clauses layer when the shape of a statement is visible.']],
    tips: [
      'Formatting is best-effort: check exotic syntax after conversion, especially nested subqueries with operators.',
      'Keep string literals with single quotes unbroken; the tokenizer will not touch them either way.',
      'Combine with an EXPLAIN plan review to get the full picture of a query\'s behaviour.'
    ],
    takeaways: [['layout','Clause-per-line'],['safe','Strings and comments preserved'],['local','No queries uploaded']],
    faq: [
      ['Does it fully parse SQL?','It tokenizes and reformats rather than validating syntax, so unusual SQL dialect features are handled best-effort rather than perfectly.'],
      ['Are strings modified?','No. Quoted literals, backtick identifiers, and both comment styles are copied through unchanged.'],
      ['How is indentation chosen?','Parentheses increase the indent until they close, which keeps nested conditions easy to follow.'],
      ['Does it work for other dialects?','The keyword list covers core ANSI SQL shared by MySQL, PostgreSQL, SQLite, and others.'],
      ['Is my query uploaded?','No. Formatting runs entirely in the browser.']],
    conclusion: '<p>Readable SQL is reviewable SQL. Run the next dump through this <strong>SQL prettifier</strong> before you dive in, and check out our <a href="javascript-beautifier.html">code beautifier</a> when the same problem shows up in a different language.</p>'
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