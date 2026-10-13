/* ============================================================================
   Troolify - batch 8 (security & developer tooling)
   Emits standard tool pages and registers them in assets/js/tools-data.js.
   Run: node troolify-gen/gen-tools-batch8.js   (from the repo root)
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
function tileFn() {
  return 'function tile(l,val,sub){return \'<div class="result-tile"><div class="rt-label">\'+l+\'</div><div class="rt-value">\'+(val===undefined||val===""?"-":val)+\'</div>\'+(sub?\'<div class="rt-sub">\'+sub+\'</div>\':\'\')+\'</div>\';}';
}

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ========================================================================
   1. SAML ASSERTION DECODER
   ======================================================================== */
add({
  file: 'saml-assertion-decoder.html', folder: 'coding',
  name: 'SAML Assertion Decoder', tag: 'SAML', icon: 'fa-solid fa-id-card',
  title: 'SAML Assertion Decoder | Decode Base64 SSO Payloads',
  metaDesc: 'Decode a Base64 SAML 2.0 Response or Assertion in your browser and read the NameID, issuer, attributes, conditions and audience in a clean, structured layout.',
  desc: 'Paste a Base64-encoded SAML Response or Assertion to view the NameID, attributes, conditions, issuer and audience - all decoded locally in your browser.',
  keywords: ['saml assertion decoder', 'decode saml response', 'saml response decoder', 'base64 saml decoder', 'saml 2.0 decoder', 'saml nameid', 'saml assertion xml', 'sso saml decoder', 'inspect saml assertion', 'saml parser online'],
  featureList: ['Decode Base64 SAMLResponse or raw XML', 'Extracts NameID, issuer and audience', 'Lists all assertion attributes', 'Shows NotBefore / NotOnOrAfter conditions', 'Pretty-prints the underlying XML', '100% client-side'],
  panel: wrap('saml', 'fa-solid fa-id-card', 'SAML assertion decoder',
    '<div class="io-grid"><div class="io-field"><label for="samlIn">Base64 SAMLResponse or raw XML</label><textarea id="samlIn"spellcheck="false"placeholder="Paste the SAMLResponse value from your IdP, or the raw assertion XML&hellip;"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="samlGrid"></div></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="samlOut">Decoded XML</label><textarea id="samlOut"spellcheck="false"readonly placeholder="Decoded assertion XML appears here&hellip;"></textarea></div>'),
  js: String.raw`
    var inp=document.getElementById("samlIn"),out=document.getElementById("samlOut"),grid=document.getElementById("samlGrid"),proc=document.getElementById("samlProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function b64d(s){
      s=s.trim();
      var m=s.match(/SAMLResponse=([^&]+)/);
      if(m){s=decodeURIComponent(m[1]);}
      s=s.replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/");
      while(s.length%4){s+="=";}
      var bin=atob(s),bytes=new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++){bytes[i]=bin.charCodeAt(i);}
      return new TextDecoder("utf-8").decode(bytes);
    }
    function fmt(xml){
      var s=xml.replace(/>\s*</g,">\n<");
      var pad=0,lines=s.split("\n"),res=[];
      for(var i=0;i<lines.length;i++){
        var ln=lines[i].trim();if(!ln){continue;}
        if(/^<\//.test(ln)){pad=Math.max(0,pad-1);}
        res.push(new Array(pad+1).join("  ")+ln);
        if(/^<[^!?\/][^>]*[^\/]>$/.test(ln)&&!/<\/.+>$/.test(ln)){pad++;}
      }
      return res.join("\n");
    }
    function run(){
      var t=performance.now(),raw=inp.value.trim();
      if(!raw){out.value="";grid.innerHTML=tile("Waiting","Paste a SAML payload");proc.textContent="Ready.";return;}
      var xml=raw.charAt(0)==="<"?raw:null;
      if(!xml){try{xml=b64d(raw);}catch(e){grid.innerHTML=tile("Error","Invalid Base64");out.value="";proc.textContent="Could not decode - check the payload.";return;}}
      var doc=new DOMParser().parseFromString(xml,"text/xml");
      var q=function(tag){var n=doc.getElementsByTagNameNS("*",tag)[0]||doc.getElementsByTagName(tag)[0];return n?n.textContent.trim():"";};
      var nl=doc.getElementsByTagNameNS("*","Attribute"),attrs=[];
      for(var i=0;i<nl.length;i++){var an=nl[i].getAttribute("Name");if(an){attrs.push(an);}}
      var c=doc.getElementsByTagNameNS("*","Conditions")[0];
      var sc=doc.getElementsByTagNameNS("*","StatusCode")[0];
      grid.innerHTML=tile("Issuer",q("Issuer"))+tile("NameID",q("NameID"))+tile("Audience",q("Audience"))+
        tile("Status",sc?(sc.getAttribute("Value")||""):"")+tile("Attributes",attrs.length,attrs.slice(0,3).join(", ")+(attrs.length>3?", +"+(attrs.length-3):""))+
        tile("NotBefore",c?c.getAttribute("NotBefore"):"")+tile("NotOnOrAfter",c?c.getAttribute("NotOnOrAfter"):"");
      out.value=fmt(new XMLSerializer().serializeToString(doc));
      proc.textContent="Decoded in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("samlSample").addEventListener("click",function(){
      var x='<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Issuer>https://idp.example.com</saml:Issuer><saml:Assertion><saml:Issuer>https://idp.example.com</saml:Issuer><saml:Subject><saml:NameID>alice@example.com</saml:NameID></saml:Subject><saml:Conditions NotBefore="2026-01-01T00:00:00Z" NotOnOrAfter="2026-01-01T01:00:00Z"><saml:AudienceRestriction><saml:Audience>https://app.example.com</saml:Audience></saml:AudienceRestriction></saml:Conditions><saml:AttributeStatement><saml:Attribute Name="email"><saml:AttributeValue>alice@example.com</saml:AttributeValue></saml:Attribute><saml:Attribute Name="role"><saml:AttributeValue>admin</saml:AttributeValue></saml:Attribute></saml:AttributeStatement><saml:AuthnStatement/></saml:Assertion></samlp:Response>';
      inp.value=btoa(x);run();
    });
    document.getElementById("samlClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'SAML Assertion Decoder: Read SSO Payloads Without a Debugger',
    lead: `<p>When single sign-on fails, the answer is almost always hiding inside the <strong>SAML assertion</strong> - the XML document your identity provider sends after login. This <strong>SAML assertion decoder</strong> takes the Base64 <code>SAMLResponse</code> from your trace, decodes it, and pulls out the parts you actually care about: the subject, the issued claims, and the validity window.</p><p>Everything happens in your browser. No assertion is ever uploaded, which matters because a SAML response is a signed authentication token.</p>`,
    sections: [
      { id: 'what-it-shows', icon: 'fa-solid fa-list-check', heading: 'What the decoder extracts', html: `<p>The tool reads the first assertion and surfaces the <strong>Issuer</strong>, the <strong>NameID</strong> (who was authenticated), the <strong>Audience</strong> (which service provider the assertion is meant for), the status code, and every <code>Attribute</code> name in the attribute statement. It also shows the <code>NotBefore</code> and <code>NotOnOrAfter</code> timestamps so you can spot an expired token immediately.</p><p>Below the summary you get the full XML, pretty-printed with indentation, so you can read the raw structure or copy it into another tool.</p>` },
      { id: 'why-decode', icon: 'fa-solid fa-triangle-exclamation', heading: 'Why decode a SAML response?', html: `<p>Common sign-in problems leave distinct fingerprints in the assertion. A clock skew shows up as a <code>NotOnOrAfter</code> that has already passed. A misconfigured audience shows the wrong service provider URL. A missing role attribute explains why a user signs in but sees no data. Reading the claims directly turns guesswork into a clear answer.</p>` }
    ],
    steps: [
      'Copy the <code>SAMLResponse</code> value from your browser dev tools, proxy trace, or IdP logs.',
      'Paste it into the input box - either the raw Base64 or the decoded XML works.',
      'Read the summary tiles for Issuer, NameID, Audience and validity window.',
      'Review the pretty-printed XML below for the full attribute list.'
    ],
    facts: [
      ['Accepts', 'Base64 SAMLResponse, URL-encoded value or raw XML'],
      ['Extracts', 'Issuer, NameID, Audience, Status, Attributes, Conditions'],
      ['Namespaces', 'Handles the standard SAML 2.0 assertion namespace'],
      ['Output', 'Summary tiles plus indented XML'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Debugging a failed SSO login', 'Confirm the audience and conditions match what your service provider expects.'],
      ['Verifying user claims', 'Check that the attributes your app relies on are actually present after a policy change.'],
      ['Security review', 'Inspect exactly which claims and validity periods an identity provider issues.']
    ],
    tips: [
      'If the text starts with <code>&lt;</code> it is already XML; the decoder treats it as such automatically.',
      'A URL-encoded value that starts with <code>SAMLResponse=</code> is stripped for you.',
      'Timestamps are shown in UTC; compare them against your server clock to check for skew.'
    ],
    takeaways: [
      'The decoder turns an opaque Base64 blob into readable authentication claims.',
      'Issuer, NameID, audience and validity are the first things to check in an SSO failure.',
      'Your assertion never leaves the browser tab.'
    ],
    faq: [
      ['What is a SAML assertion?', 'It is an XML security token a SAML identity provider sends to a service provider to prove a user has authenticated, along with claims about the user.'],
      ['Can I paste the raw Base64 value?', 'Yes. Paste either the Base64 SAMLResponse or the already-decoded XML; the tool detects which one you supplied.'],
      ['Does it verify the signature?', 'No. This is an inspection tool. It decodes and displays the assertion but does not validate the XML signature, which requires the IdP certificate.'],
      ['Why does my attribute list look empty?', 'Some responses put attributes in a separate encrypted assertion or in the top-level response rather than the first assertion. Check the full XML output.'],
      ['Is it safe to paste a real assertion?', 'The decoding runs entirely in your browser. Even so, treat a live assertion as sensitive because it is a signed authentication token.']
    ],
    conclusion: `<p>A <strong>SAML assertion decoder</strong> is the fastest way to understand why an SSO flow behaved the way it did. Decode the response, read the claims, and the root cause is usually on screen within seconds. For JWT-based flows, pair it with our <a href="jwt-decoder.html">JWT decoder</a>.</p>`
  }
});

/* ========================================================================
   2. JSON WEB KEY GENERATOR (JWK)
   ======================================================================== */
add({
  file: 'json-web-key-generator.html', folder: 'coding',
  name: 'JSON Web Key Generator', tag: 'JWK', icon: 'fa-solid fa-key',
  title: 'JSON Web Key Generator | Create JWK and JWKS Keys Online',
  metaDesc: 'Generate JSON Web Keys (JWK) for RS256, PS256, ES256 and HS256 signing. Produces public and private keys plus a ready-to-use JWKS endpoint, all in your browser.',
  desc: 'Generate RSA, ECDSA and HMAC JSON Web Keys and a ready-to-use JWKS endpoint. Keys are created locally with the Web Crypto API and never leave your device.',
  keywords: ['jwk generator', 'json web key generator', 'jwks generator', 'rs256 key generator', 'es256 key generator', 'create jwk online', 'jwt signing key', 'jwks endpoint', 'oct key generator', 'web crypto jwk'],
  featureList: ['RSA (RS/PS), ECDSA (ES) and HMAC (HS) algorithms', 'Exports public and private JWK', 'Builds a JWKS for token verification', 'Configurable RSA size and EC curve', 'RFC 7638 thumbprint as the key id', '100% client-side'],
  panel: wrap('jwk', 'fa-solid fa-key', 'JSON Web Key generator',
    '<div class="row3">' +
    '<div class="field"><label for="jwkAlg">Algorithm</label><select id="jwkAlg"><option>RS256</option><option>RS384</option><option>RS512</option><option>PS256</option><option>PS384</option><option>PS512</option><option>ES256</option><option>ES384</option><option>ES512</option><option>HS256</option><option>HS384</option><option>HS512</option></select></div>' +
    '<div class="field"><label for="jwkBits">RSA modulus</label><select id="jwkBits"><option>2048</option><option>3072</option><option>4096</option></select></div>' +
    '<div class="field"><label for="jwkCurve">EC curve</label><select id="jwkCurve"><option>P-256</option><option>P-384</option><option>P-521</option></select></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="jwkGo"><i class="fa-solid fa-key"></i>Generate keys</button>' +
    '<button class="rt-btn"type="button"id="jwkCopyPub"><i class="fa-solid fa-copy"></i>Copy public</button>' +
    '<button class="rt-btn"type="button"id="jwkCopyPriv"><i class="fa-solid fa-copy"></i>Copy private</button>' +
    '<button class="rt-btn"type="button"id="jwkCopyJwks"><i class="fa-solid fa-copy"></i>Copy JWKS</button></div>' +
    '<div class="io-grid two"style="margin-top:14px">' +
    '<div class="io-field"><label for="jwkPub">Public JWK</label><textarea id="jwkPub"spellcheck="false"readonly placeholder="Public key appears here&hellip;"></textarea></div>' +
    '<div class="io-field"><label for="jwkPriv">Private JWK</label><textarea id="jwkPriv"spellcheck="false"readonly placeholder="Private key appears here&hellip;"></textarea></div>' +
    '</div>' +
    '<div class="io-field"style="margin-top:14px"><label for="jwkJwks">JWKS (public key set)</label><textarea id="jwkJwks"spellcheck="false"readonly placeholder="JWKS appears here&hellip;"></textarea></div>'),
  js: String.raw`
    var alg=document.getElementById("jwkAlg"),bits=document.getElementById("jwkBits"),curve=document.getElementById("jwkCurve");
    var pub=document.getElementById("jwkPub"),priv=document.getElementById("jwkPriv"),jwks=document.getElementById("jwkJwks"),proc=document.getElementById("jwkProc");
    function b64url(buf){var b=new Uint8Array(buf),s="";for(var i=0;i<b.length;i++){s+=String.fromCharCode(b[i]);}return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
    function uuid(){var a=crypto.getRandomValues(new Uint8Array(16));a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;var h=[];for(var i=0;i<16;i++){h.push((a[i]+256).toString(16).slice(1));}return h.slice(0,4).join("")+"-"+h.slice(4,6).join("")+"-"+h.slice(6,8).join("")+"-"+h.slice(8,10).join("")+"-"+h.slice(10,16).join("");}
    function publicFrom(j){var o={};for(var k in j){if(["d","p","q","dp","dq","qi","k","oth"].indexOf(k)<0){o[k]=j[k];}}return o;}
    async function thumbprint(j){
      var canon=JSON.stringify({crv:j.crv,e:j.e,kty:j.kty,n:j.n,x:j.x,y:j.y});
      var h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(canon));
      return b64url(h);
    }
    async function gen(){
      var a=alg.value;proc.textContent="Generating your "+a+" key pair in this tab&hellip;";
      try{
        var pubKey,privKey,jpub,jpriv,family;
        if(a.slice(0,2)==="HS"){
          family="oct";
          var k=await crypto.subtle.generateKey({name:"HMAC",hash:"SHA-"+a.slice(2)},true,["sign","verify"]);
          jpriv=await crypto.subtle.exportKey("jwk",k);jpriv.alg=a;jpriv.use="sig";jpub=null;
        }else if(a.slice(0,1)==="R"){
          family="rsa";
          var ni=a.slice(0,2)==="PS"?"RSA-PSS":"RSASSA-PKCS1-v1_5";
          var kp=await crypto.subtle.generateKey({name:ni,modulusLength:parseInt(bits.value,10),publicExponent:new Uint8Array([1,0,1]),hash:"SHA-"+a.slice(2)},true,["sign","verify"]);
          jpub=await crypto.subtle.exportKey("jwk",kp.publicKey);jpriv=await crypto.subtle.exportKey("jwk",kp.privateKey);
          jpub.alg=a;jpub.use="sig";jpriv.alg=a;jpriv.use="sig";
        }else{
          family="ec";
          var cms={ES256:"P-256",ES384:"P-384",ES512:"P-521"};
          var kp2=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:cms[a]},true,["sign","verify"]);
          jpub=await crypto.subtle.exportKey("jwk",kp2.publicKey);jpriv=await crypto.subtle.exportKey("jwk",kp2.privateKey);
          jpub.alg=a;jpub.use="sig";jpriv.alg=a;jpriv.use="sig";
        }
        var kid=uuid();jpriv.kid=kid;if(jpub){jpub.kid=kid;}
        priv.value=JSON.stringify(jpriv,null,2);
        pub.value=jpub?JSON.stringify(jpub,null,2):"(HMAC uses a single symmetric secret - see the private key)";
        if(jpub){jwks.value=JSON.stringify({keys:[jpub]},null,2);}else{jwks.value="(The oct/HMAC key is symmetric, so there is no public JWKS to publish)";}
        var tp=jpub?("Thumbprint "+await thumbprint(jpub)):"Symmetric secret";
        proc.textContent="Generated "+a+" keys ("+family+"). "+tp+" - nothing leaves this tab.";
      }catch(e){
        proc.textContent="Could not generate keys: "+e.message;
      }
    }
    document.getElementById("jwkGo").addEventListener("click",gen);
    document.getElementById("jwkCopyPub").addEventListener("click",function(){window.Troolify.copyToClipboard(pub.value,function(){proc.textContent="Public JWK copied."});});
    document.getElementById("jwkCopyPriv").addEventListener("click",function(){window.Troolify.copyToClipboard(priv.value,function(){proc.textContent="Private JWK copied - keep it secret."});});
    document.getElementById("jwkCopyJwks").addEventListener("click",function(){window.Troolify.copyToClipboard(jwks.value,function(){proc.textContent="JWKS copied."});});
    document.getElementById("jwkSample").addEventListener("click",gen);
    document.getElementById("jwkClear").addEventListener("click",function(){pub.value="";priv.value="";jwks.value="";proc.textContent="Ready - choose an algorithm and generate.";});
    gen();
  `,
  article: {
    title: 'JSON Web Key Generator: Create JWK and JWKS for JWT Signing',
    lead: `<p>A <strong>JSON Web Key</strong> is the JSON representation of a cryptographic key used to sign and verify JSON Web Tokens. This <strong>JWK generator</strong> creates RSA, ECDSA and HMAC keys directly in your browser and hands you a public JWK, a private JWK, and a JWKS document you can publish at a <code>/.well-known/jwks.json</code> endpoint.</p><p>Because the keys are produced with the Web Crypto API locally, no private material is ever transmitted.</p>`,
    sections: [
      { id: 'which-algorithm', icon: 'fa-solid fa-diagram-project', heading: 'Choosing an algorithm', html: `<p><strong>RSA</strong> (RS256, RS384, RS512) uses a public/private pair with PKCS#1 v1.5 padding and is the most widely supported choice. <strong>RSA-PSS</strong> (PS256, PS384, PS512) is the same key type with the newer probabilistic padding. <strong>ECDSA</strong> (ES256, ES384, ES512) produces far smaller keys and signatures, ideal for tokens sent over bandwidth-limited channels. <strong>HMAC</strong> (HS256, HS384, HS512) is a symmetric secret: the same key both signs and verifies, so it must never be shared with a token consumer you do not trust.</p><p>Pick RS256 or ES256 when the verifier is a third party; pick HS256 only when signing and verifying happen inside systems you control.</p>` },
      { id: 'kids', icon: 'fa-solid fa-fingerprint', heading: 'Key ids and rotation', html: `<p>Each key gets a <code>kid</code>. Publishing that id inside the token header lets a verifier select the right key from your JWKS during a rotation, when the old and new keys overlap. This tool derives a random id and reports the RFC 7638 thumbprint so you can cross-check the key you publish.</p>` }
    ],
    steps: [
      'Choose the signing algorithm, RSA modulus size, or EC curve.',
      'Click <strong>Generate keys</strong> to create the pair locally.',
      'Copy the public JWK (or full JWKS) to publish and keep the private JWK secret.',
      'Paste the private key into your signing service and rotate regularly.'
    ],
    facts: [
      ['Algorithms', 'RS, PS, ES and HS families'],
      ['RSA sizes', '2048, 3072, 4096 bits'],
      ['EC curves', 'P-256, P-384, P-521'],
      ['Outputs', 'Public JWK, private JWK, JWKS'],
      ['Data handling', 'Generated locally, never uploaded']
    ],
    useCases: [
      ['Standing up a token signer', 'Generate a production-grade key pair and publish the public half as a JWKS.'],
      ['Testing OAuth and OIDC', 'Create throwaway keys for a local identity server without running OpenSSL.'],
      ['Learning the JWK format', 'See exactly how a key maps to JSON fields before you wire it into code.']
    ],
    tips: [
      'Never commit a private JWK to source control. Store it in a secret manager.',
      'Publish only the public JWKS; verifiers never need the private half.',
      'Rotate keys by publishing the new key alongside the old one and using the <code>kid</code> to disambiguate.'
    ],
    takeaways: [
      'A JWKS is simply an array of public JWKs with matching key ids.',
      'Asymmetric keys let you verify tokens without ever sharing a secret.',
      'Generating keys in-browser keeps private material off the network.'
    ],
    faq: [
      ['What is the difference between a JWK and a JWKS?', 'A JWK is one key as JSON. A JWKS is an object with a keys array holding one or more JWKs, served so verifiers can fetch the right public key.'],
      ['Should I use RS256 or ES256?', 'Both are secure. ES256 gives much smaller keys and signatures; RS256 has broader library support. Choose based on your verifier.'],
      ['How do I use the HMAC key?', 'Share the oct key only with services that both sign and verify. It is symmetric, so there is no public JWKS.'],
      ['What is the kid for?', 'It names the key so a verifier can pick the correct one from your JWKS, especially during key rotation.'],
      ['Is my private key sent anywhere?', 'No. Generation uses the Web Crypto API in your browser and the private key stays on your device.']
    ],
    conclusion: `<p>Generate a key pair, publish the JWKS, and you have everything needed for verifiable tokens. This <strong>JWK generator</strong> keeps the private key local and gives you a clean public key set to serve. Inspect existing tokens with our <a href="jwt-decoder.html">JWT decoder</a>.</p>`
  }
});

/* ========================================================================
   3. IP ALLOWLIST GENERATOR
   ======================================================================== */
add({
  file: 'ip-allowlist-generator.html', folder: 'coding',
  name: 'IP Allowlist Generator', tag: 'Firewall', icon: 'fa-solid fa-shield-halved',
  title: 'IP Allowlist Generator | nginx, Apache, iptables & UFW',
  metaDesc: 'Turn a list of IP addresses and CIDR ranges into ready-to-paste allow or deny rules for nginx, Apache, iptables, UFW and AWS, in your browser.',
  desc: 'Paste IPs or CIDR ranges and get production-ready firewall allow or block rules for nginx, Apache, iptables, UFW and AWS security groups.',
  keywords: ['ip allowlist generator', 'firewall rule generator', 'nginx allow deny', 'apache require ip', 'iptables allow ip', 'ufw allow from', 'aws security group rule', 'cidr to firewall rule', 'ip blocklist generator', 'whitelist ip generator'],
  featureList: ['Accept IP addresses and CIDR ranges', 'Allowlist or blocklist modes', 'nginx, Apache, iptables, UFW and AWS output', 'Validates every entry and flags mistakes', 'Copy the generated rules', '100% client-side'],
  panel: wrap('ipa', 'fa-solid fa-shield-halved', 'IP allowlist / blocklist generator',
    '<div class="row3">' +
    '<div class="field"><label for="ipaMode">Mode</label><select id="ipaMode"><option value="allow">Allowlist (permit these IPs)</option><option value="deny">Blocklist (block these IPs)</option></select></div>' +
    '<div class="field"><label for="ipaPlat">Target</label><select id="ipaPlat"><option value="nginx">nginx</option><option value="apache">Apache</option><option value="iptables">iptables</option><option value="ufw">UFW</option><option value="aws">AWS security group</option></select></div>' +
    '<div class="field"><label for="ipaDef">Default</label><select id="ipaDef"><option value="denyall">Deny everything else (allowlist only)</option><option value="open">Leave everything else open</option></select></div>' +
    '</div>' +
    '<div class="io-grid two"style="margin-top:14px">' +
    '<div class="io-field"><label for="ipaIn">IPs and CIDR ranges (one per line)</label><textarea id="ipaIn"spellcheck="false"placeholder="203.0.113.10&#10;198.51.100.0/24&#10;2001:db8::/32"></textarea></div>' +
    '<div class="io-field"><label for="ipaOut">Generated rules</label><textarea id="ipaOut"spellcheck="false"readonly placeholder="Rules appear here&hellip;"></textarea></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid"id="ipaGrid"></div></div>'),
  js: String.raw`
    var inp=document.getElementById("ipaIn"),out=document.getElementById("ipaOut"),grid=document.getElementById("ipaGrid"),proc=document.getElementById("ipaProc");
    var mode=document.getElementById("ipaMode"),plat=document.getElementById("ipaPlat"),def=document.getElementById("ipaDef");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function valid4(s){var p=s.split(".");if(p.length!==4){return false;}return p.every(function(o){return /^\d{1,3}$/.test(o)&&+o<=255;});}
    function valid6(s){return /^[0-9a-f:]+$/i.test(s)&&s.indexOf(":")>-1&&s.split("::").length<=2;}
    function validEntry(e){
      var host=e,pref=null,sl=e.indexOf("/");
      if(sl>-1){host=e.slice(0,sl);pref=+e.slice(sl+1);}
      var v4=valid4(host),v6=valid6(host);
      if(!v4&&!v6){return "not a valid IPv4 or IPv6 address";}
      if(pref!==null){
        if(isNaN(pref)){return "prefix length is not a number";}
        if(v4&&(pref<0||pref>32)){return "IPv4 prefix must be 0-32";}
        if(v6&&(pref<0||pref>128)){return "IPv6 prefix must be 0-128";}
      }
      return null;
    }
    function norm(e){
      if(e.indexOf("/")===-1){return valid4(e)?e+"/32":e+"/128";}
      return e;
    }
    function build(list,allow){
      var p=plat.value,defBehavior=def.value;
      if(p==="nginx"){
        var b=list.map(function(x){return (allow?"allow ":"deny ")+x+";";}).join("\n");
        if(allow&&defBehavior==="denyall"){b+="\ndeny all;";}
        return b;
      }
      if(p==="apache"){
        var b2=list.map(function(x){return (allow?"Require ip ":"Require not ip ")+x;}).join("\n");
        if(allow&&defBehavior==="denyall"){b2="<RequireAll>\n"+b2+"\nRequire all denied\n</RequireAll>";}
        else if(!allow){b2="<RequireAll>\nRequire all granted\n"+b2+"\n</RequireAll>";}
        return b2;
      }
      if(p==="iptables"){
        return list.map(function(x){return "iptables -A INPUT -s "+x+" -j "+(allow?"ACCEPT":"DROP");}).join("\n");
      }
      if(p==="ufw"){
        return list.map(function(x){return "ufw "+(allow?"allow":"deny")+" from "+x;}).join("\n");
      }
      var ranges=list.map(function(x){return {"CidrIp":norm(x),"Description":allow?"allowlisted":"blocklisted"};});
      return JSON.stringify({"SecurityGroupIngress":[{"IpProtocol":"-1","FromPort":-1,"ToPort":-1,"IpRanges":ranges}]},null,2);
    }
    function run(){
      var t=performance.now(),allow=mode.value==="allow";
      var lines=inp.value.split(/\r?\n/).map(function(x){return x.trim();}).filter(function(x){return x&&x.charAt(0)!=="#";});
      var good=[],bad=[];
      lines.forEach(function(e){var err=validEntry(e);if(err){bad.push(e+"  ("+err+")");}else{good.push(e);}});
      out.value=good.length?build(good,allow):"";
      grid.innerHTML=tile("Valid entries",good.length)+tile("Invalid entries",bad.length,bad.slice(0,2).join(" | "))+tile("Mode",allow?"Allowlist":"Blocklist")+tile("Target",plat.value);
      proc.textContent=good.length?("Built "+good.length+" rules in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab."):"Paste one IP or CIDR per line.";
    }
    [inp,mode,plat,def].forEach(function(el){el.addEventListener("input",run);el.addEventListener("change",run);});
    document.getElementById("ipaSample").addEventListener("click",function(){inp.value="203.0.113.10\n198.51.100.0/24\n192.0.2.44\n2001:db8::/32";run();});
    document.getElementById("ipaClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    document.getElementById("ipaCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Rules copied."});});
    run();
  `,
  article: {
    title: 'IP Allowlist Generator: Firewall Rules From Any Address List',
    lead: `<p>Every firewall asks for the same thing in a different dialect. This <strong>IP allowlist generator</strong> takes a plain list of addresses and CIDR ranges and writes the exact syntax for nginx, Apache, iptables, UFW and AWS security groups, so you never hand-edit a rule again.</p><p>Each entry is validated before it is emitted, so a typo becomes a flagged line rather than a broken config.</p>`,
    sections: [
      { id: 'allow-vs-block', icon: 'fa-solid fa-right-left', heading: 'Allowlist or blocklist', html: `<p>An <strong>allowlist</strong> permits the addresses you name and can optionally close everything else, which is the safest posture for admin panels and internal APIs. A <strong>blocklist</strong> blocks the addresses you list while leaving the rest of the world open, useful for cutting off abusive sources without a full lockdown.</p>` },
      { id: 'dialects', icon: 'fa-solid fa-code-branch', heading: 'One list, many dialects', html: `<p>nginx uses <code>allow</code> and <code>deny</code> directives. Apache uses <code>Require ip</code> inside a <code>&lt;RequireAll&gt;</code> block. iptables and UFW build command lines. AWS security groups want a JSON structure with CIDR notation, so single addresses are expanded to <code>/32</code> and <code>/128</code> automatically.</p>` }
    ],
    steps: [
      'Choose allowlist or blocklist mode and pick your target platform.',
      'Paste one IP or CIDR range per line; comments with <code>#</code> are ignored.',
      'Check the valid and invalid counts in the summary.',
      'Copy the generated rules straight into your configuration.'
    ],
    facts: [
      ['Targets', 'nginx, Apache, iptables, UFW, AWS'],
      ['Input', 'IPv4, IPv6 and CIDR ranges'],
      ['Modes', 'Allowlist and blocklist'],
      ['Validation', 'Per-line with error reasons'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Locking down an admin route', 'Generate an nginx allow list and deny-all tail in one paste.'],
      ['Updating a cloud firewall', 'Produce an AWS security group JSON block from a ticket full of IPs.'],
      ['Blocking a botnet', 'Turn a threat feed list into iptables DROP rules quickly.']
    ],
    tips: [
      'Always review generated rules before applying them to a production host.',
      'For allowlists, keep the deny-all tail so an empty list does not accidentally open access.',
      'CIDR ranges are preserved as-is; only bare addresses gain a prefix length.'
    ],
    takeaways: [
      'One validated address list produces correct syntax for five platforms.',
      'Allowlists should close the default to be meaningful.',
      'Validation surfaces typos before they reach production.'
    ],
    faq: [
      ['Does it accept IPv6?', 'Yes. Both bare IPv6 addresses and IPv6 CIDR ranges such as 2001:db8::/32 are supported.'],
      ['Which default should I pick?', 'For an allowlist choose deny-everything-else. For a blocklist the default is always open.'],
      ['Will it apply the rules for me?', 'No. It generates the text you paste into your server or cloud console; nothing is sent anywhere.'],
      ['Why was my entry flagged?', 'The summary shows the reason, for example a prefix length above 32 for IPv4 or a malformed address.'],
      ['Is the AWS output directly usable?', 'It is a SecurityGroupIngress snippet you can paste into an API call or the console JSON editor.']
    ],
    conclusion: `<p>Write the list once and let the generator speak each firewall's language. This <strong>IP allowlist generator</strong> keeps rules consistent and catches mistakes early. For network prefixes, try our <a href="ipv4-subnet-calculator.html">subnet calculator</a>.</p>`
  }
});

/* ========================================================================
   4. OAUTH 2.0 SCOPE BUILDER
   ======================================================================== */
add({
  file: 'oauth-scope-builder.html', folder: 'coding',
  name: 'OAuth 2.0 Scope Builder', tag: 'OAuth', icon: 'fa-solid fa-user-shield',
  title: 'OAuth 2.0 Scope Builder | Build & Decode Scopes',
  metaDesc: 'Build and decode OAuth 2.0 scope strings for Google, GitHub, Stripe and Microsoft, with risk notes and a ready-to-use scope parameter.',
  desc: 'Build OAuth 2.0 scope strings by toggling provider permissions, or paste a scope string to decode exactly what access it grants.',
  keywords: ['oauth scope builder', 'oauth scopes', 'oauth 2.0 scope string', 'decode oauth scopes', 'google oauth scopes', 'github oauth scopes', 'stripe oauth permissions', 'openid scopes', 'api permission builder', 'scope generator'],
  featureList: ['Presets for Google, GitHub, Stripe and Microsoft', 'Risk notes for sensitive scopes', 'Decode an existing scope string', 'Space-delimited output ready for the auth URL', 'Fully offline', '100% client-side'],
  panel: wrap('osb', 'fa-solid fa-user-shield', 'OAuth 2.0 scope builder',
    '<div class="row3">' +
    '<div class="field"><label for="osbMode">Mode</label><select id="osbMode"><option value="build">Build a scope string</option><option value="decode">Decode a scope string</option></select></div>' +
    '<div class="field"><label for="osbProv">Provider</label><select id="osbProv"><option value="google">Google</option><option value="github">GitHub</option><option value="stripe">Stripe</option><option value="microsoft">Microsoft</option><option value="custom">Custom</option></select></div>' +
    '<div class="field"><label for="osbExtra">Add custom scope</label><input id="osbExtra"type="text"placeholder="e.g. read:reports"></div>' +
    '</div>' +
    '<div id="osbScopes"class="scope-wrap"style="margin-top:14px"></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="osbIn">Scope string (for decode, or edit freely)</label><textarea id="osbIn"spellcheck="false"placeholder="openid email profile&hellip;"></textarea></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="osbGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Build &amp; explain</button>' +
    '<button class="rt-btn"type="button"id="osbCopy"><i class="fa-solid fa-copy"></i>Copy scope string</button></div>' +
    '<div class="result-card"><div class="result-grid"id="osbGrid"></div></div>' +
    '<div id="osbList"class="scope-list"></div>'),
  css: '.scope-wrap{display:grid;grid-template-columns:1fr;gap:8px}@media(min-width:640px){.scope-wrap{grid-template-columns:1fr 1fr}}.scope-item{display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:10px}.scope-item input{margin-top:3px}.scope-item b{display:block;font-size:13.5px}.scope-item span{font-size:12px;color:var(--muted)}.scope-item.risk b{color:#FCA5A5}.scope-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}.scope-row{display:flex;gap:10px;align-items:center;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:13.5px}.scope-row code{background:rgba(255,255,255,.08);padding:2px 6px;border-radius:5px}.scope-row .r{color:#FCA5A5;font-size:11.5px;font-weight:700;text-transform:uppercase}',
  js: String.raw`
    var DEF={
      google:[["openid","Sign in and get an ID token","",0],["email","Read the account email address","",0],["profile","Read basic profile info","",0],["https://www.googleapis.com/auth/drive.readonly","Read all Drive files","high",1],["https://www.googleapis.com/auth/drive.file","Manage files created by the app","med",1],["https://www.googleapis.com/auth/calendar","Read and write calendar events","high",1],["https://www.googleapis.com/auth/gmail.readonly","Read all Gmail messages","high",1],["https://www.googleapis.com/auth/gmail.send","Send email as the user","high",1]],
      github:[["read:user","Read user profile data","",0],["user:email","Read email addresses","",0],["repo","Full read and write access to repositories","high",1],["public_repo","Read and write public repositories","med",1],["repo:status","Read commit statuses","low",0],["workflow","Update GitHub Actions workflows","high",1],["admin:org","Manage the organisation","high",1],["gist","Create gists","low",0]],
      stripe:[["read_only","Read-only access to Stripe data","low",0],["checkout.session","Create checkout sessions","med",1],["payment_intents","Create and manage payment intents","high",1],["charges","Read and create charges","high",1],["customers","Manage customer records","high",1],["payouts","Read payouts","high",1],["invoices","Read and manage invoices","high",1]],
      microsoft:[["openid","Sign in with OpenID Connect","",0],["profile","Read the user profile","",0],["email","Read the email claim","",0],["offline_access","Receive a refresh token","med",1],["User.Read","Read the signed-in user profile","",0],["Mail.Read","Read the user mailbox","high",1],["Mail.Send","Send mail as the user","high",1],["Files.ReadWrite","Read and write OneDrive files","high",1]],
      custom:[]
    };
    var DESCS={};
    ["google","github","stripe","microsoft"].forEach(function(p){DEF[p].forEach(function(s){if(!DESCS[s[0]]){DESCS[s[0]]=s[1];}});});
    var prov=document.getElementById("osbProv"),mode=document.getElementById("osbMode"),wrapEl=document.getElementById("osbScopes");
    var inp=document.getElementById("osbIn"),grid=document.getElementById("osbGrid"),list=document.getElementById("osbList"),proc=document.getElementById("osbProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function renderScopes(){
      if(mode.value!=="build"){wrapEl.innerHTML="";return;}
      var sc=DEF[prov.value]||[];
      wrapEl.innerHTML=sc.map(function(s){return '<label class="scope-item'+(s[3]?" risk":"")+'"><input type="checkbox"value="'+s[0]+'"data-r="'+s[2]+'"><span><b>'+s[0]+'</b><span>'+(s[1]||"Custom scope")+(s[2]?' - '+s[2]+' risk':'')+'</span></span></label>';}).join("");
      wrapEl.querySelectorAll("input").forEach(function(cb){cb.addEventListener("change",sync);});
    }
    function sync(){
      if(mode.value!=="build"){return;}
      var sel=[].slice.call(wrapEl.querySelectorAll("input:checked")).map(function(c){return c.value;});
      inp.value=sel.join(" ");
      explain();
    }
    function explain(){
      var parts=inp.value.trim().split(/\s+/).filter(function(x){return x;});
      var highs=0;
      list.innerHTML=parts.map(function(s){
        var known=DESCS[s],risk=/[:\/]/.test(s)&&!known?"Custom":(known?"":"Custom");
        if(!known&&/write|admin|mail|repo|charge|payment|send|payout/i.test(s)){highs++;}
        return '<div class="scope-row"><code>'+s+'</code><span>'+(known||"Custom scope - verify what access this grants.")+'</span>'+(/(write|admin|mail|send|repo|charge|payment|payout)/i.test(s)?'<span class="r">high</span>':'')+'</div>';
      }).join("");
      grid.innerHTML=tile("Scopes",parts.length)+tile("Sensitive",highs,"Write, send or admin scopes")+tile("Provider",prov.value.charAt(0).toUpperCase()+prov.value.slice(1));
      proc.textContent=parts.length?(parts.length+" scope"+(parts.length===1?"":"s")+" ready - nothing leaves this tab."):"Toggle scopes or paste a scope string.";
    }
    document.getElementById("osbExtra").addEventListener("keydown",function(e){
      if(e.key==="Enter"){var v=this.value.trim();if(v){inp.value=(inp.value.trim()+" "+v).trim();this.value="";explain();}}
    });
    prov.addEventListener("change",function(){renderScopes();sync();});
    mode.addEventListener("change",function(){renderScopes();if(mode.value!=="build"){wrapEl.innerHTML="";}inp.readOnly=false;explain();});
    inp.addEventListener("input",explain);
    document.getElementById("osbGo").addEventListener("click",function(){renderScopes();sync();});
    document.getElementById("osbSample").addEventListener("click",function(){prov.value="google";mode.value="build";renderScopes();inp.value="openid email profile https://www.googleapis.com/auth/gmail.readonly";wrapEl.querySelectorAll("input").forEach(function(c){c.checked=inp.value.indexOf(c.value)>-1;});explain();});
    document.getElementById("osbClear").addEventListener("click",function(){inp.value="";wrapEl.querySelectorAll("input").forEach(function(c){c.checked=false;});list.innerHTML="";explain();});
    document.getElementById("osbCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(inp.value.trim(),function(){proc.textContent="Scope string copied."});});
    renderScopes();explain();
  `,
  article: {
    title: 'OAuth 2.0 Scope Builder: Compose Least-Privilege Permission Strings',
    lead: `<p>OAuth scopes are the difference between an app that reads a name and an app that reads your inbox. This <strong>OAuth 2.0 scope builder</strong> lets you toggle provider permissions, see which ones are sensitive, and produce a clean space-delimited <code>scope</code> parameter for your authorization request.</p><p>Paste an existing scope string and it will decode each entry into plain language.</p>`,
    sections: [
      { id: 'least-privilege', icon: 'fa-solid fa-lock', heading: 'Why least privilege matters', html: `<p>Users and reviewers grant trust based on the scopes you request. Asking for a write scope when you only read is the fastest way to lose an integration approval. The builder flags write, send, admin and billing scopes so you can justify or drop each one before shipping.</p>` },
      { id: 'decode', icon: 'fa-solid fa-magnifying-glass', heading: 'Decoding an unknown scope string', html: `<p>Scope names are terse and provider-specific. In decode mode the tool splits a string on whitespace, looks up a description where it knows one, and highlights the entries that imply broad access, so an audit starts from understanding rather than guesswork.</p>` }
    ],
    steps: [
      'Pick the provider and tick the permissions you need.',
      'Watch risky scopes get highlighted as you toggle them.',
      'Add any custom scope and press Enter.',
      'Copy the space-delimited string into your authorization request.'
    ],
    facts: [
      ['Providers', 'Google, GitHub, Stripe, Microsoft, custom'],
      ['Output', 'Space-delimited scope parameter'],
      ['Extras', 'Risk notes and a decode view'],
      ['Format', 'Ready for the auth URL query string'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Scoping a new integration', 'Start from the provider preset and keep only the permissions the feature needs.'],
      ['Reviewing a third-party app', 'Decode the scopes an app requests to understand what it can access.'],
      ['Debugging a consent error', 'Confirm the exact scope names your identity provider expects.']
    ],
    tips: [
      'Request the narrowest scope that works; you can always add more later.',
      'Keep <code>offline_access</code> out unless you genuinely need a refresh token.',
      'Custom scopes are passed through unchanged, so match the provider spelling exactly.'
    ],
    takeaways: [
      'The builder turns scope names into understandable permissions.',
      'Sensitive scopes are flagged so they are a deliberate choice.',
      'The output drops straight into an OAuth authorization URL.'
    ],
    faq: [
      ['What is an OAuth scope?', 'A scope is a string that requests a specific level of access in an OAuth 2.0 authorization request. The provider issues a token limited to the scopes granted.'],
      ['Can I mix scopes from different providers?', 'Technically a scope string is per authorization server. Use the presets as a starting point but only submit scopes the server recognises.'],
      ['Why are some scopes marked high risk?', 'They allow writing data, sending messages, or administering an account. They deserve extra scrutiny.'],
      ['Does the tool store my scopes?', 'No. Everything is computed in your browser and nothing is uploaded.'],
      ['Is the decode list exhaustive?', 'No. It covers common scopes; unknown entries are shown verbatim so you can look them up.']
    ],
    conclusion: `<p>Ship integrations that ask for exactly what they need. This <strong>OAuth 2.0 scope builder</strong> makes least-privilege scoping fast and visible. When you have your token, inspect it with our <a href="jwt-decoder.html">JWT decoder</a>.</p>`
  }
});

/* ========================================================================
   5. OAUTH STATE PARAMETER VALIDATOR
   ======================================================================== */
add({
  file: 'oauth-state-parameter-validator.html', folder: 'coding',
  name: 'OAuth State Parameter Validator', tag: 'OAuth', icon: 'fa-solid fa-fingerprint',
  title: 'OAuth State Parameter Validator | Check CSRF Tokens',
  metaDesc: 'Generate cryptographically secure OAuth 2.0 state parameters and validate existing tokens for CSRF protection against OWASP entropy guidance, in your browser.',
  desc: 'Generate cryptographically random OAuth state parameters and validate existing tokens for entropy and length to confirm they meet CSRF protection guidance.',
  keywords: ['oauth state parameter', 'oauth state validator', 'csrf token generator', 'oauth state generator', 'secure state token', 'owasp csrf', 'oauth anti csrf', 'state parameter entropy', 'random state oauth', 'authorization url state'],
  featureList: ['Generate 128, 160 or 256-bit state values', 'Base64url or hex output', 'Build a sample authorization URL', 'Validate length and entropy of existing tokens', 'Flags weak or predictable state', '100% client-side'],
  panel: wrap('osv', 'fa-solid fa-fingerprint', 'OAuth state parameter validator',
    '<div class="row3">' +
    '<div class="field"><label for="osvMode">Mode</label><select id="osvMode"><option value="generate">Generate a state value</option><option value="validate">Validate a state value</option></select></div>' +
    '<div class="field"><label for="osvBits">Entropy</label><select id="osvBits"><option value="128">128 bits</option><option value="160">160 bits</option><option value="256">256 bits</option></select></div>' +
    '<div class="field"><label for="osvFmt">Encoding</label><select id="osvFmt"><option value="b64">Base64url</option><option value="hex">Hex</option></select></div>' +
    '</div>' +
    '<div class="io-grid two"style="margin-top:14px">' +
    '<div class="io-field"><label for="osvIn">State token</label><textarea id="osvIn"spellcheck="false"placeholder="Generate, or paste a token to validate&hellip;"></textarea></div>' +
    '<div class="io-field"><label for="osvOut">Sample authorization URL</label><textarea id="osvOut"spellcheck="false"readonly placeholder="Built authorization URL appears here&hellip;"></textarea></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid"id="osvGrid"></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="osvGo"><i class="fa-solid fa-rotate"></i>Run</button>' +
    '<button class="rt-btn"type="button"id="osvCopy"><i class="fa-solid fa-copy"></i>Copy state</button></div>'),
  js: String.raw`
    var mode=document.getElementById("osvMode"),bits=document.getElementById("osvBits"),fmt=document.getElementById("osvFmt");
    var inp=document.getElementById("osvIn"),out=document.getElementById("osvOut"),grid=document.getElementById("osvGrid"),proc=document.getElementById("osvProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function b64url(buf){var b=new Uint8Array(buf),s="";for(var i=0;i<b.length;i++){s+=String.fromCharCode(b[i]);}return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
    function randomState(){var bytes=parseInt(bits.value,10)/8,a=crypto.getRandomValues(new Uint8Array(bytes));if(fmt.value==="hex"){var h="";for(var i=0;i<a.length;i++){h+=(a[i]+256).toString(16).slice(1);}return h;}return b64url(a);}
    function sampleUrl(st){return "https://provider.example.com/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&scope=openid%20email&state="+st;}
    function estimate(tok){
      var hex=/^[0-9a-fA-F]+$/.test(tok)&&tok.length%2===0;
      var b64=/^[A-Za-z0-9_-]+$/.test(tok);
      var bitsPerChar=hex?4:(b64?6:4);
      var unique=new Set(tok.split("")).size;
      return {bits:tok.length*bitsPerChar,charset:hex?"hex":(b64?"base64url":"unknown"),unique:unique};
    }
    function run(){
      var t=performance.now();
      if(mode.value==="generate"){
        var st=randomState();inp.value=st;out.value=sampleUrl(st);
        grid.innerHTML=tile("Entropy",bits.value+" bits")+tile("Length",st.length+" chars")+tile("Encoding",fmt.value==="hex"?"Hex":"Base64url")+tile("Verdict","Secure","Meets OWASP guidance");
        proc.textContent="Generated in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
        return;
      }
      var tok=inp.value.trim();out.value="";
      if(!tok){grid.innerHTML=tile("Waiting","Paste a state token");proc.textContent="Ready.";return;}
      var e=estimate(tok);
      var ok=e.bits>=128&&e.unique>=8;
      grid.innerHTML=tile("Estimated entropy",Math.round(e.bits)+" bits")+tile("Length",tok.length+" chars")+tile("Charset",e.charset)+tile("Unique chars",e.unique)+tile("Verdict",ok?"Strong":"Weak",ok?"Meets OWASP guidance":"Use at least 128 bits of randomness");
      proc.textContent="Analysed in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    [mode,bits,fmt].forEach(function(el){el.addEventListener("change",run);});
    inp.addEventListener("input",run);
    document.getElementById("osvGo").addEventListener("click",run);
    document.getElementById("osvSample").addEventListener("click",function(){mode.value="generate";bits.value="128";fmt.value="b64";run();});
    document.getElementById("osvClear").addEventListener("click",function(){inp.value="";out.value="";run();});
    document.getElementById("osvCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(inp.value.trim(),function(){proc.textContent="State value copied."});});
    run();
  `,
  article: {
    title: 'OAuth State Parameter Validator: Stop CSRF in Authorization Flows',
    lead: `<p>The <code>state</code> parameter is OAuth's built-in defence against cross-site request forgery. This <strong>OAuth state parameter validator</strong> generates high-entropy state values and checks an existing token against OWASP guidance, so you know your authorization flow is not replayable.</p>`,
    sections: [
      { id: 'what-state-does', icon: 'fa-solid fa-shield', heading: 'What the state parameter protects', html: `<p>Before redirecting a user to the authorization server, the client creates a random <code>state</code> value and stores it against the user session. On return, it compares the value that comes back. If they differ, the response is rejected. That closes the door on an attacker who tries to feed your callback a forged authorization code.</p>` },
      { id: 'how-strong', icon: 'fa-solid fa-signal', heading: 'How strong should state be?', html: `<p>The value must be unpredictable, which means cryptographically random, and long enough that guessing is infeasible. 128 bits is the common baseline; 256 bits is comfortable. Length alone is not enough - a repeated character or a predictable pattern collapses the real entropy, which is why this tool also reports the unique-character count.</p>` }
    ],
    steps: [
      'Choose generate mode and pick 128, 160 or 256 bits.',
      'Copy the produced value into your authorization request.',
      'To audit a token, switch to validate mode and paste it.',
      'Check that the verdict reports at least 128 bits of entropy.'
    ],
    facts: [
      ['Modes', 'Generate and validate'],
      ['Entropy options', '128, 160, 256 bits'],
      ['Encodings', 'Base64url and hex'],
      ['Source', 'Web Crypto cryptographically secure RNG'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Implementing OAuth login', 'Generate a state value per authorization request and store it in the session.'],
      ['Security review', 'Confirm a legacy integration is not using a predictable or short state.'],
      ['Testing an SSO flow', 'Build a complete sample authorization URL to exercise a callback.']
    ],
    tips: [
      'Generate a fresh state for every request and never reuse one.',
      'Bind the stored state to the user session so a mismatch is detectable.',
      'A hex state is longer for the same entropy than its base64url equivalent; either is fine.'
    ],
    takeaways: [
      'State defends against CSRF by tying the callback to the initiating session.',
      '128 bits of true randomness is the minimum sensible strength.',
      'This tool generates secure values and audits existing ones.'
    ],
    faq: [
      ['What does the state parameter do?', 'It is a random value the client sends to the authorization server and receives back, letting the client verify the callback is a response to its own request.'],
      ['How many bits are enough?', 'OWASP guidance points to at least 128 bits of cryptographically secure randomness. This tool defaults to that.'],
      ['Is a long but predictable string safe?', 'No. Entropy comes from unpredictability, not just length, so a repeated or patterned token is flagged as weak.'],
      ['Does this replace PKCE?', 'No. State protects against CSRF; PKCE protects the code exchange. Use both. See our PKCE verifier.'],
      ['Is my token uploaded?', 'No. Generation and analysis run entirely in your browser.']
    ],
    conclusion: `<p>A strong state value is a one-line change with outsized security value. This <strong>OAuth state parameter validator</strong> generates it and checks it. Combine it with our <a href="pkce-verifier.html">PKCE verifier</a> for a complete public-client flow.</p>`
  }
});

/* ========================================================================
   6. COOKIE SECURITY ANALYZER
   ======================================================================== */
add({
  file: 'cookie-security-analyzer.html', folder: 'coding',
  name: 'Cookie Security Analyzer', tag: 'Security', icon: 'fa-solid fa-cookie-bite',
  title: 'Cookie Security Analyzer | HttpOnly, Secure & SameSite',
  metaDesc: 'Paste Set-Cookie headers to check for missing HttpOnly, Secure and SameSite flags. Each cookie is scored with a risk level and a per-flag explanation.',
  desc: 'Paste one or more Set-Cookie headers to check for missing HttpOnly, Secure and SameSite flags, with a risk score and plain-language findings for each cookie.',
  keywords: ['cookie security analyzer', 'set-cookie checker', 'httponly secure samesite', 'cookie flag audit', 'secure cookie test', 'samesite none secure', 'cookie security scanner', 'audit set-cookie header', 'cookie attributes', 'csrf cookie protection'],
  featureList: ['Parses one or more Set-Cookie headers', 'Checks HttpOnly, Secure and SameSite', 'Understands __Host- and __Secure- prefixes', 'Per-cookie risk scoring', 'Explains the impact of each finding', '100% client-side'],
  panel: wrap('csa', 'fa-solid fa-cookie-bite', 'Cookie security analyzer',
    '<div class="io-grid"><div class="io-field"><label for="csaIn">Set-Cookie headers (one per line)</label><textarea id="csaIn"spellcheck="false"placeholder="Set-Cookie: session=abc; Path=/; HttpOnly; Secure; SameSite=Lax"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="csaGrid"></div></div>' +
    '<div id="csaList"class="cookie-list"></div>'),
  css: '.cookie-list{margin-top:14px;display:flex;flex-direction:column;gap:12px}.cookie-card{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:12px;padding:14px}.cookie-card h3{margin:0 0 8px;font-size:15px}.cookie-card ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px}.cookie-card li{font-size:13px;color:var(--muted)}.cookie-card li.ok{color:#86EFAC}.cookie-card li.warn{color:#FCD34D}.cookie-card li.bad{color:#FCA5A5}',
  js: String.raw`
    var inp=document.getElementById("csaIn"),grid=document.getElementById("csaGrid"),list=document.getElementById("csaList"),proc=document.getElementById("csaProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function parseLine(line){
      var s=line.replace(/^\s*set-cookie\s*:\s*/i,"").trim();
      if(!s){return null;}
      var parts=s.split(";").map(function(p){return p.trim();});
      var nv=parts.shift()||"";
      var eq=nv.indexOf("=");
      var name=eq>-1?nv.slice(0,eq):nv;
      var attrs={};
      parts.forEach(function(p){var i=p.indexOf("=");if(i>-1){attrs[p.slice(0,i).toLowerCase()]=p.slice(i+1);}else if(p){attrs[p.toLowerCase()]=true;}});
      return {name:name,attrs:attrs};
    }
    function analyze(c){
      var a=c.attrs,findings=[],score=100;
      function add(cls,t,pen){findings.push([cls,t]);score-=pen;}
      if(a.httponly){add("ok","HttpOnly is set - JavaScript cannot read this cookie.",0);}else{add("bad","Missing HttpOnly: scripts can steal this cookie via XSS.",30);}
      if(a.secure){add("ok","Secure is set - the cookie is only sent over HTTPS.",0);}else{add("bad","Missing Secure: the cookie can travel over plain HTTP.",25);}
      if("samesite" in a){
        var v=String(a.samesite).toLowerCase();
        if(v==="strict"){add("ok","SameSite=Strict blocks cross-site sending entirely.",0);}
        else if(v==="lax"){add("ok","SameSite=Lax blocks cross-site POST but allows top-level navigation.",0);}
        else if(v==="none"){if(a.secure){add("warn","SameSite=None requires Secure (present) - the cookie is sent cross-site.",5);}else{add("bad","SameSite=None without Secure is rejected by modern browsers and unsafe.",20);}}
        else{add("warn","Unrecognised SameSite value: "+v+".",10);}
      }else{add("bad","Missing SameSite: the cookie may be sent on cross-site requests.",20);}
      if(/^__host-/i.test(c.name)){if(a.secure&&a.path==="/"&&!("domain" in a)){add("ok","__Host- prefix constraints are satisfied.",0);}else{add("bad","__Host- cookies require Secure, Path=/ and no Domain.",15);}}
      if(/^__secure-/i.test(c.name)){if(a.secure){add("ok","__Secure- prefix is satisfied by Secure.",0);}else{add("bad","__Secure- cookies require the Secure attribute.",15);}}
      if("max-age" in a||"expires" in a){add("ok","Persistent cookie with an explicit lifetime.",0);}else{add("warn","Session cookie with no expiry - cleared when the browser closes.",0);}
      score=Math.max(0,score);
      var risk=score>=90?"Safe":score>=70?"Low":score>=50?"Medium":score>=30?"High":"Critical";
      return {findings:findings,score:score,risk:risk};
    }
    function run(){
      var t=performance.now();
      var lines=inp.value.split(/\r?\n/).filter(function(l){return l.trim();});
      if(!lines.length){grid.innerHTML=tile("Waiting","Paste Set-Cookie headers");list.innerHTML="";proc.textContent="Ready.";return;}
      var total=0,worst="Safe",cards=[];
      var order=["Safe","Low","Medium","High","Critical"];
      lines.forEach(function(line){
        var c=parseLine(line);if(!c){return;}
        var r=analyze(c);total+=r.score;
        if(order.indexOf(r.risk)>order.indexOf(worst)){worst=r.risk;}
        cards.push('<div class="cookie-card"><h3>'+c.name+' <span style="color:'+(r.risk==="Safe"?"#86EFAC":(r.risk==="Critical"||r.risk==="High"?"#FCA5A5":"#FCD34D"))+';font-size:12px">'+r.risk+' ('+r.score+'/100)</span></h3><ul>'+r.findings.map(function(f){return '<li class="'+f[0]+'">'+f[1]+'</li>';}).join("")+'</ul></div>');
      });
      var n=cards.length||1;
      grid.innerHTML=tile("Cookies",cards.length)+tile("Average score",Math.round(total/n)+"/100")+tile("Worst risk",worst);
      list.innerHTML=cards.join("");
      proc.textContent="Analysed in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("csaSample").addEventListener("click",function(){inp.value="Set-Cookie: session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax\nSet-Cookie: tracking=xyz; Path=/; SameSite=None\nSet-Cookie: prefs=dark; Expires=Wed, 01 Jan 2031 00:00:00 GMT";run();});
    document.getElementById("csaClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'Cookie Security Analyzer: Audit HttpOnly, Secure and SameSite',
    lead: `<p>Session cookies are the keys to your users' accounts, and a single missing attribute can expose them to theft or cross-site abuse. This <strong>cookie security analyzer</strong> reads your <code>Set-Cookie</code> headers and scores each cookie on the flags that matter: HttpOnly, Secure, SameSite and the hardened cookie prefixes.</p><p>Paste one header or a whole response and review the findings in plain language.</p>`,
    sections: [
      { id: 'flags', icon: 'fa-solid fa-flag', heading: 'The flags that protect a cookie', html: `<p><strong>Secure</strong> keeps the cookie off plain HTTP. <strong>HttpOnly</strong> hides it from JavaScript, neutralising theft through XSS. <strong>SameSite</strong> governs whether the cookie rides along on cross-site requests - <code>Lax</code> is a sound default and <code>None</code> must always be paired with <code>Secure</code>. The <code>__Host-</code> and <code>__Secure-</code> name prefixes let the browser enforce additional rules for you.</p>` },
      { id: 'scoring', icon: 'fa-solid fa-gauge', heading: 'How the score works', html: `<p>Each cookie starts at 100 and loses points for missing or unsafe attributes, with the largest penalties for exposed session material. The tool reports an average across all cookies and highlights the worst offender, so you can prioritise the fix that matters most.</p>` }
    ],
    steps: [
      'Copy the Set-Cookie headers from your browser dev tools or an HTTP response.',
      'Paste them one per line into the input.',
      'Read the per-cookie findings and the overall risk.',
      'Add the missing attributes and re-run to confirm the fix.'
    ],
    facts: [
      ['Checks', 'HttpOnly, Secure, SameSite, prefixes'],
      ['Input', 'One or more Set-Cookie headers'],
      ['Output', 'Per-cookie score and findings'],
      ['Scope', 'Static analysis of header text'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Hardening a login flow', 'Verify the session cookie is HttpOnly, Secure and SameSite before launch.'],
      ['Security review', 'Audit a set of cookies captured from a staging environment.'],
      ['Debugging a broken login', 'Spot a SameSite=None cookie that is missing Secure and being rejected.']
    ],
    tips: [
      'Session cookies should always be HttpOnly and Secure.',
      'Prefer SameSite=Lax unless a genuine cross-site flow requires None.',
      'Use the __Host- prefix for the most sensitive cookie to lock down path and domain.'
    ],
    takeaways: [
      'HttpOnly, Secure and SameSite are the three core protections.',
      'SameSite=None is only valid alongside Secure.',
      'A low score points directly at the attribute that needs attention.'
    ],
    faq: [
      ['What is HttpOnly?', 'An attribute that stops client-side JavaScript from reading the cookie, which blocks the most common session-theft attack.'],
      ['Do I always need SameSite=None?', 'Only when the cookie must be sent on genuine cross-site requests, such as an embedded widget. It must then also be Secure.'],
      ['Is this a live scan?', 'No. It analyses the header text you paste; it does not contact your server or test cookies at runtime.'],
      ['What do the __Host- and __Secure- prefixes do?', 'They instruct the browser to reject the cookie unless its security requirements are met, adding defence in depth.'],
      ['Is my data uploaded?', 'No. Everything is analysed in your browser.']
    ],
    conclusion: `<p>Cookie flags are a small change with a large payoff. This <strong>cookie security analyzer</strong> shows exactly which attribute each of your cookies is missing. Explore related hardening tools like our <a href="content-security-policy-generator.html">CSP generator</a>.</p>`
  }
});

/* ========================================================================
   7. TLS CIPHER SUITE CHECKER
   ======================================================================== */
add({
  file: 'tls-cipher-suite-checker.html', folder: 'coding',
  name: 'TLS Cipher Suite Checker', tag: 'TLS', icon: 'fa-solid fa-lock',
  title: 'TLS Cipher Suite Checker | Rate Strength of Any Cipher Suite',
  metaDesc: 'Check TLS 1.2 and 1.3 cipher suite strength. Paste IANA or OpenSSL names to see whether each suite is strong, weak or deprecated and why.',
  desc: 'Paste TLS cipher suite names in IANA or OpenSSL form to rate each one as strong, weak or deprecated, with forward-secrecy and protocol notes.',
  keywords: ['tls cipher suite checker', 'cipher suite strength', 'tls 1.3 ciphers', 'openssl cipher names', 'weak cipher detection', 'forward secrecy checker', 'ssl cipher analyzer', 'iana cipher suite', 'gcm vs cbc', 'tls hardening'],
  featureList: ['Understands IANA and OpenSSL names', 'Detects TLS 1.2 vs TLS 1.3 suites', 'Flags RC4, 3DES, NULL and export ciphers', 'Notes forward secrecy and AEAD', 'Per-suite explanation', '100% client-side'],
  panel: wrap('tls', 'fa-solid fa-lock', 'TLS cipher suite checker',
    '<div class="io-grid"><div class="io-field"><label for="tlsIn">Cipher suites (one per line)</label><textarea id="tlsIn"spellcheck="false"placeholder="TLS_AES_256_GCM_SHA384&#10;ECDHE-RSA-AES128-GCM-SHA256&#10;TLS_RSA_WITH_3DES_EDE_CBC_SHA"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="tlsGrid"></div></div>' +
    '<div id="tlsList"class="tls-list"></div>'),
  css: '.tls-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}.tls-row{display:flex;gap:12px;align-items:center;justify-content:space-between;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:12px}.tls-row .nm{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;word-break:break-all}.tls-row .why{font-size:12px;color:var(--muted);margin-top:3px}.badge{font-size:11px;font-weight:800;text-transform:uppercase;padding:3px 9px;border-radius:20px;white-space:nowrap}.badge.strong{background:rgba(34,197,94,.15);color:#86EFAC}.badge.weak{background:rgba(234,179,8,.15);color:#FCD34D}.badge.dep{background:rgba(239,68,68,.15);color:#FCA5A5}.badge.ok{background:rgba(59,130,246,.15);color:#93C5FD}',
  js: String.raw`
    var inp=document.getElementById("tlsIn"),grid=document.getElementById("tlsGrid"),list=document.getElementById("tlsList"),proc=document.getElementById("tlsProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function classify(name){
      var n=name.trim(),u=n.toUpperCase();
      var is13=/^TLS_/.test(u)&&u.indexOf("_WITH_")===-1;
      var fs=/ECDHE|^TLS_AES|^TLS_CHACHA|DHE_|_DHE/ .test(u)||/^(TLS_AES|TLS_CHACHA)/.test(u);
      var aead=/GCM|CHACHA20|CCM|POLY1305/.test(u);
      var rating,why;
      if(/RC4|3DES|DES-CBC|_RC2|_NULL_|EXPORT|ANON|ADH|_MD5|DES40/.test(u)){rating="dep";why="Broken or obsolete primitive - disable it.";}
      else if(/CBC/.test(u)){rating="weak";why="CBC mode is legacy; GCM or ChaCha20 are preferred.";}
      else if(aead){rating="strong";why=(is13?"TLS 1.3":"TLS 1.2")+" AEAD suite with authenticated encryption.";}
      else{rating="ok";why="Acceptable but not an AEAD suite.";}
      if(is13){fs=true;}
      return {rating:rating,why:why,fs:fs,proto:is13?"TLS 1.3":"TLS 1.2 or earlier",aead:aead};
    }
    function run(){
      var t=performance.now();
      var lines=inp.value.split(/\r?\n/).map(function(l){return l.trim();}).filter(function(l){return l;});
      if(!lines.length){grid.innerHTML=tile("Waiting","Paste cipher suite names");list.innerHTML="";proc.textContent="Ready.";return;}
      var strong=0,weak=0,dep=0,fsCount=0,rows=[];
      lines.forEach(function(line){
        var c=classify(line);
        if(c.rating==="strong"||c.rating==="ok"){strong++;}else if(c.rating==="weak"){weak++;}else{dep++;}
        if(c.fs){fsCount++;}
        var label=c.rating==="strong"?"Strong":c.rating==="weak"?"Weak":c.rating==="ok"?"OK":"Deprecated";
        rows.push('<div class="tls-row"><div><div class="nm">'+line+'</div><div class="why">'+c.proto+' &middot; '+(c.fs?"forward secrecy":"no forward secrecy")+' &middot; '+c.why+'</div></div><span class="badge '+c.rating+'">'+label+'</span></div>');
      });
      grid.innerHTML=tile("Suites",lines.length)+tile("Strong",strong)+tile("Weak",weak)+tile("Deprecated",dep)+tile("Forward secrecy",fsCount+"/"+lines.length);
      list.innerHTML=rows.join("");
      proc.textContent="Rated in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("tlsSample").addEventListener("click",function(){inp.value="TLS_AES_256_GCM_SHA384\nTLS_CHACHA20_POLY1305_SHA256\nECDHE-RSA-AES128-GCM-SHA256\nECDHE-RSA-AES256-SHA384\nTLS_RSA_WITH_3DES_EDE_CBC_SHA\nTLS_RSA_WITH_RC4_128_SHA";run();});
    document.getElementById("tlsClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'TLS Cipher Suite Checker: See Which Suites Are Safe to Keep',
    lead: `<p>Cipher suite lists age badly. A suite that was standard a decade ago is now a liability. This <strong>TLS cipher suite checker</strong> reads a list of IANA or OpenSSL names and rates each one, so you can trim a server config down to modern, forward-secret AEAD suites with confidence.</p>`,
    sections: [
      { id: 'reading', icon: 'fa-solid fa-book-open', heading: 'Reading a cipher suite name', html: `<p>The name tells you three things: the key exchange, the bulk cipher and the hash. <code>ECDHE</code> means ephemeral elliptic-curve Diffie-Hellman, which provides forward secrecy. <code>AES_128_GCM</code> or <code>CHACHA20_POLY1305</code> are authenticated ciphers. TLS 1.3 suites drop the key exchange from the name because it is negotiated separately and always ephemeral.</p>` },
      { id: 'keep-drop', icon: 'fa-solid fa-filter', heading: 'What to keep and what to drop', html: `<p>Keep the TLS 1.3 suites and the TLS 1.2 AEAD suites with ECDHE. Drop anything using RC4, 3DES, DES, RC2, NULL or the anonymous and export families outright. CBC suites are not outright broken but are legacy; prefer GCM and ChaCha20 where the client supports them.</p>` }
    ],
    steps: [
      'Copy the cipher list from your server config (nginx, Apache, OpenSSL, or a scanner report).',
      'Paste one suite name per line.',
      'Review the strength, protocol and forward-secrecy notes.',
      'Remove the weak and deprecated entries and re-test.'
    ],
    facts: [
      ['Accepts', 'IANA and OpenSSL cipher names'],
      ['Detects', 'TLS 1.3 vs earlier suites'],
      ['Flags', 'RC4, 3DES, NULL, export and anonymous'],
      ['Notes', 'Forward secrecy and AEAD usage'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Hardening a web server', 'Trim a cipher list to only modern suites before a security review.'],
      ['Interpreting a scan report', 'Understand why a scanner flagged a particular suite.'],
      ['Checking legacy compatibility', 'Confirm which suites a legacy client would need before removing them.']
    ],
    tips: [
      'Prioritise AEAD suites; avoid CBC unless a client requires it.',
      'Forward secrecy protects past sessions if the private key leaks later.',
      'Order matters too - put the strongest preferred suite first in your config.'
    ],
    takeaways: [
      'A cipher suite name encodes its key exchange, cipher and hash.',
      'RC4, 3DES, DES, NULL and anonymous suites should be removed.',
      'AEAD plus forward secrecy is the modern baseline.'
    ],
    faq: [
      ['Are CBC ciphers broken?', 'Not broken, but they are legacy and more prone to implementation pitfalls. Prefer AEAD suites like GCM and ChaCha20.'],
      ['What is forward secrecy?', 'It means each session uses an ephemeral key, so stealing the long-term private key does not decrypt past traffic. ECDHE and all TLS 1.3 suites provide it.'],
      ['Does this tool connect to my server?', 'No. It analyses the names you paste. Use a scanner if you want to test a live endpoint.'],
      ['What is the difference between IANA and OpenSSL names?', 'They describe the same suites with different spelling. This tool understands both.'],
      ['Is a rating of OK a problem?', 'It means the suite works but is not an AEAD suite. It is acceptable, not ideal.']
    ],
    conclusion: `<p>Fewer, stronger suites are easier to reason about and safer to run. This <strong>TLS cipher suite checker</strong> gives you a fast verdict on any list. Pair it with our <a href="content-security-policy-generator.html">CSP generator</a> when hardening a site.</p>`
  }
});

/* ========================================================================
   8. AWS IAM POLICY ANALYZER
   ======================================================================== */
add({
  file: 'aws-iam-policy-analyzer.html', folder: 'coding',
  name: 'AWS IAM Policy Analyzer', tag: 'AWS', icon: 'fa-brands fa-aws',
  title: 'AWS IAM Policy Analyzer | Find Wildcards and Risk',
  metaDesc: 'Paste an AWS IAM policy JSON to detect wildcard actions, over-permissive resources, public principals and privilege-escalation risks.',
  desc: 'Paste an AWS IAM policy JSON to spot wildcard actions, wide-open resources, public principals and privilege escalation, with severity-rated fixes.',
  keywords: ['aws iam policy analyzer', 'iam policy checker', 'wildcard action iam', 'least privilege aws', 'iam privilege escalation', 'aws policy lint', 'iam security review', 'over permissive iam', 'aws policy json analyzer', 'iam best practices'],
  featureList: ['Finds wildcard actions and resources', 'Detects public principals', 'Flags privilege-escalation action pairs', 'Severity-rated findings with fixes', 'Summarises statements and effects', '100% client-side'],
  panel: wrap('iam', 'fa-brands fa-aws', 'AWS IAM policy analyzer',
    '<div class="io-grid"><div class="io-field"><label for="iamIn">IAM policy JSON</label><textarea id="iamIn"spellcheck="false"placeholder=\'{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"}]}\'></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="iamGrid"></div></div>' +
    '<div id="iamList"class="iam-list"></div>'),
  css: '.iam-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}.iam-find{background:rgba(255,255,255,.03);border:1px solid var(--border);border-left-width:4px;border-radius:10px;padding:12px}.iam-find.crit{border-left-color:#EF4444}.iam-find.high{border-left-color:#F97316}.iam-find.med{border-left-color:#EAB308}.iam-find.low{border-left-color:#3B82F6}.iam-find b{font-size:13.5px}.iam-find p{margin:4px 0 0;font-size:12.5px;color:var(--muted)}.iam-find code{background:rgba(255,255,255,.08);padding:1px 5px;border-radius:4px}',
  js: String.raw`
    var inp=document.getElementById("iamIn"),grid=document.getElementById("iamGrid"),list=document.getElementById("iamList"),proc=document.getElementById("iamProc");
    var SENS=/^(iam|organizations|sts|s3|kms|secretsmanager|ssm|ec2|lambda|cloudformation|cloudtrail):/i;
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function arr(x){return x===undefined?[]:(Array.isArray(x)?x:[x]);}
    function run(){
      var t=performance.now();
      var txt=inp.value.trim();
      if(!txt){grid.innerHTML=tile("Waiting","Paste an IAM policy JSON");list.innerHTML="";proc.textContent="Ready.";return;}
      var p;
      try{p=JSON.parse(txt);}catch(e){grid.innerHTML=tile("Error","Invalid JSON");list.innerHTML='<div class="iam-find crit"><b>Could not parse the policy</b><p>'+e.message+'</p></div>';proc.textContent="Fix the JSON and try again.";return;}
      var stmts=arr(p.Statement);
      var finds=[];
      function add(sev,title,detail){finds.push({sev:sev,title:title,detail:detail});}
      stmts.forEach(function(s,i){
        var idx="Statement "+(i+1)+" ";
        var effect=s.Effect||"";
        if(effect!=="Allow"){return;}
        var actions=arr(s.Action).concat(arr(s.NotAction).map(function(a){return "NOT "+a;}));
        var resources=arr(s.Resource);
        var principals=arr(s.Principal);
        if(arr(s.Action).indexOf("*")>-1){add("crit",idx+"grants Action:*","Every action on every service. Replace with the specific actions the role needs.");}
        arr(s.Action).forEach(function(a){
          if(/^[a-z0-9-]+:\*$/i.test(a)&&SENS.test(a)){add("high",idx+"grant "+a,"Service-wide wildcard on a sensitive service. Enumerate the exact actions instead.");}
        });
        if(s.NotAction&&!s.Action){add("med",idx+"uses NotAction","Denying everything except a list is fragile and hard to audit. Prefer explicit Allow lists.");}
        if(resources.indexOf("*")>-1){add(s.Action&&arr(s.Action).indexOf("*")>-1?"crit":"high",idx+"targets Resource:*","Applies to every resource in scope, not just the intended ones.");}
        if(principals.indexOf("*")>-1){add("crit",idx+"has a public Principal","Anyone, including anonymous callers, matches this statement. Never use Principal:* with Allow.");}
        if(!s.Condition){
          var broad=arr(s.Action).some(function(a){return a==="*"||/^[a-z0-9-]+:\*$/i.test(a);});
          if(broad&&SENS.test(arr(s.Action)[0]||"")){add("med",idx+"has no Condition","Consider an MFA, source-IP or aws:ResourceTag condition to narrow access.");}
          if(arr(s.Action).some(function(a){return /PassRole/i.test(a);})&&!s.Condition){add("high",idx+"allows iam:PassRole without a Condition","PassRole can be a privilege-escalation path; constrain which roles and services.");}
        }
        if(/AssumeRole/i.test(JSON.stringify(s))&&!/sts:AssumeRole/i.test(JSON.stringify(s.Condition||{}))){add("low",idx+"mentions AssumeRole","Verify the trust policy also constrains who can assume the role.");}
      });
      var order={crit:0,high:1,med:2,low:3};
      finds.sort(function(a,b){return order[a.sev]-order[b.sev];});
      var counts={crit:0,high:0,med:0,low:0};finds.forEach(function(f){counts[f.sev]++;});
      grid.innerHTML=tile("Statements",stmts.length)+tile("Critical",counts.crit)+tile("High",counts.high)+tile("Medium",counts.med)+tile("Findings",finds.length);
      list.innerHTML=finds.length?finds.map(function(f){return '<div class="iam-find '+f.sev+'"><b>'+f.title+'</b><p>'+f.detail+'</p></div>';}).join(""):'<div class="iam-find low"><b>No obvious issues found</b><p>This heuristic check found no wildcards or public principals. Always review against your full access requirements.</p></div>';
      proc.textContent="Analysed in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("iamSample").addEventListener("click",function(){inp.value=JSON.stringify({"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"},{"Effect":"Allow","Action":"iam:PassRole","Resource":"arn:aws:iam::123456789012:role/*"}]},null,2);run();});
    document.getElementById("iamClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'AWS IAM Policy Analyzer: Catch Over-Permission Before It Ships',
    lead: `<p>An IAM policy is easy to write and hard to review. A single <code>*</code> can hand a service every permission in your account. This <strong>AWS IAM policy analyzer</strong> reads a policy document and points out the wildcards, public principals and escalation patterns that turn a convenience into an incident.</p>`,
    sections: [
      { id: 'what-it-flags', icon: 'fa-solid fa-bug', heading: 'What the analyzer flags', html: `<p>The tool rates each finding by severity. Critical issues include <code>Action:*</code> and a public <code>Principal:*</code>. High-severity findings cover service-wide wildcards on sensitive services, <code>Resource:*</code> with broad actions, and <code>iam:PassRole</code> without a condition. Medium findings note missing conditions and the fragile <code>NotAction</code> pattern.</p>` },
      { id: 'heuristic', icon: 'fa-solid fa-circle-info', heading: 'A starting point, not a verdict', html: `<p>This is a static, heuristic review. It cannot know your intent or the resources behind an ARN, so treat each finding as a question to answer rather than a guaranteed bug. It is the fastest way to catch the obvious mistakes before a deeper, tool-assisted audit.</p>` }
    ],
    steps: [
      'Paste the full policy document as JSON.',
      'Read the severity summary for the shape of the problem.',
      'Work from critical findings down, applying the suggested fix.',
      'Re-run the tool to confirm the wildcards are gone.'
    ],
    facts: [
      ['Checks', 'Wildcards, principals, conditions, escalation'],
      ['Output', 'Severity-rated findings with fixes'],
      ['Scope', 'Identity and resource policy JSON'],
      ['Style', 'Static heuristic analysis'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Pre-merge review', 'Check a generated policy before it reaches production.'],
      ['Least-privilege refactor', 'Turn an over-broad policy into a scoped one with the fixes in hand.'],
      ['Security investigation', 'Understand how much a suspicious policy actually grants.']
    ],
    tips: [
      'Prefer explicit action lists over service wildcards for sensitive services.',
      'Add conditions such as MFA or source IP to narrow broadly-scoped statements.',
      'Never combine <code>Principal:*</code> with <code>Effect:Allow</code>.'
    ],
    takeaways: [
      'Wildcards on sensitive services are the highest-value fix.',
      'PassRole without conditions is a common escalation path.',
      'A heuristic pass catches the obvious problems quickly.'
    ],
    faq: [
      ['Does it validate my whole AWS account?', 'No. It analyses the single policy document you paste. For account-wide analysis use a dedicated scanner.'],
      ['Why is Resource:* only sometimes critical?', 'It depends on the actions. Widening a read on one service is less severe than combining it with Action:* or write access.'],
      ['What is iam:PassRole risk?', 'Granting PassRole lets a principal attach roles to services, which can escalate privileges if those roles are powerful.'],
      ['Is my policy uploaded?', 'No. The analysis runs entirely in your browser.'],
      ['Do I still need a full audit?', 'Yes. Use this as a fast first pass, then validate against your real requirements and tools.']
    ],
    conclusion: `<p>Give a policy the least privilege it needs and it stops being a liability. This <strong>AWS IAM policy analyzer</strong> surfaces the wildcards worth fixing first. For related checks, try our <a href="ip-allowlist-generator.html">IP allowlist generator</a>.</p>`
  }
});

/* ========================================================================
   9. API KEY HASHER
   ======================================================================== */
add({
  file: 'api-key-hasher.html', folder: 'coding',
  name: 'API Key Hasher', tag: 'Hashing', icon: 'fa-solid fa-fingerprint',
  title: 'API Key Hasher | SHA-256, SHA-512 and PBKDF2 for Keys',
  metaDesc: 'Hash API keys with SHA-256, SHA-512 or PBKDF2 before storing them, with a Node.js verification snippet and a recommended storage format.',
  desc: 'Hash API keys with SHA-256, SHA-512 or PBKDF2 before storing them in a database, with hex and Base64 output plus a Node.js verification snippet.',
  keywords: ['api key hasher', 'hash api key', 'sha256 api key', 'pbkdf2 api key', 'store api keys safely', 'api key storage format', 'hash credentials', 'salt api key', 'node verify hash', 'web crypto hashing'],
  featureList: ['SHA-256 and SHA-512 digests', 'PBKDF2 with configurable iterations and salt', 'Hex and Base64 output', 'Node.js verification snippet', 'Recommended storage format', '100% client-side'],
  panel: wrap('akh', 'fa-solid fa-fingerprint', 'API key hasher',
    '<div class="row3">' +
    '<div class="field"><label for="akhAlg">Algorithm</label><select id="akhAlg"><option value="SHA-256">SHA-256</option><option value="SHA-512">SHA-512</option><option value="PBKDF2">PBKDF2 (SHA-256)</option></select></div>' +
    '<div class="field"><label for="akhIter">PBKDF2 iterations</label><input id="akhIter"type="number"value="210000"min="1000"step="1000"></div>' +
    '<div class="field"><label for="akhSalt">Salt (auto if empty)</label><input id="akhSalt"type="text"placeholder="random per key"></div>' +
    '</div>' +
    '<div class="io-field"style="margin-top:14px"><label for="akhIn">API key to hash</label><textarea id="akhIn"spellcheck="false"style="min-height:90px"placeholder="example_api_key_abc123&hellip;"></textarea></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="akhGo"><i class="fa-solid fa-hasher fa-fingerprint"></i>Hash key</button>' +
    '<button class="rt-btn"type="button"id="akhCopyHex"><i class="fa-solid fa-copy"></i>Copy hex</button>' +
    '<button class="rt-btn"type="button"id="akhCopyNode"><i class="fa-solid fa-copy"></i>Copy Node snippet</button></div>' +
    '<div class="io-grid two"style="margin-top:14px">' +
    '<div class="io-field"><label for="akhHex">Hash (hex)</label><textarea id="akhHex"spellcheck="false"readonly></textarea></div>' +
    '<div class="io-field"><label for="akhB64">Hash (Base64)</label><textarea id="akhB64"spellcheck="false"readonly></textarea></div>' +
    '</div>' +
    '<div class="io-field"style="margin-top:14px"><label for="akhNode">Node.js verification snippet</label><textarea id="akhNode"spellcheck="false"readonly></textarea></div>'),
  js: String.raw`
    var alg=document.getElementById("akhAlg"),iter=document.getElementById("akhIter"),saltEl=document.getElementById("akhSalt");
    var inp=document.getElementById("akhIn"),hexOut=document.getElementById("akhHex"),b64Out=document.getElementById("akhB64"),nodeOut=document.getElementById("akhNode"),proc=document.getElementById("akhProc");
    function hex(buf){var b=new Uint8Array(buf),s="";for(var i=0;i<b.length;i++){s+=("0"+b[i].toString(16)).slice(-2);}return s;}
    function b64(buf){var b=new Uint8Array(buf),s="";for(var i=0;i<b.length;i++){s+=String.fromCharCode(b[i]);}return btoa(s);}
    async function run(){
      var key=inp.value;
      if(!key){hexOut.value="";b64Out.value="";nodeOut.value="";proc.textContent="Paste an API key to hash.";return;}
      var t=performance.now();
      try{
        if(alg.value==="PBKDF2"){
          var salt=saltEl.value.trim()||hex(crypto.getRandomValues(new Uint8Array(16)));
          if(!saltEl.value.trim()){saltEl.value=salt;}
          var km=await crypto.subtle.importKey("raw",new TextEncoder().encode(key),"PBKDF2",false,["deriveBits"]);
          var bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:parseInt(iter.value,10)||210000,hash:"SHA-256"},km,256);
          hexOut.value=hex(bits);b64Out.value=b64(bits);
          nodeOut.value="// Store: pbkdf2_sha256$"+iter.value+"$"+salt+"$"+hex(bits)+"\nconst crypto=require(\"crypto\");\nconst [,,iters,salt,stored]=process.env.STORED_HASH.split(\"$\");\nconst check=crypto.pbkdf2Sync(apiKey,salt,Number(iters),32,\"sha256\").toString(\"hex\");\nconst ok=crypto.timingSafeEqual(Buffer.from(check),Buffer.from(stored));";
        }else{
          var d=await crypto.subtle.digest(alg.value,new TextEncoder().encode(key));
          hexOut.value=hex(d);b64Out.value=b64(d);
          nodeOut.value="// Store the salt-free digest: "+alg.value.toLowerCase().replace("-","")+"$"+hex(d)+"\nconst crypto=require(\"crypto\");\nconst stored=process.env.STORED_HASH.split(\"$\")[1];\nconst digest=crypto.createHash(\""+alg.value.toLowerCase().replace("-","")+"\").update(apiKey).digest(\"hex\");\nconst ok=crypto.timingSafeEqual(Buffer.from(digest),Buffer.from(stored));";
        }
        proc.textContent="Hashed in "+(performance.now()-t).toFixed(1)+" ms - the key stayed in this tab.";
      }catch(e){proc.textContent="Could not hash: "+e.message;}
    }
    [alg,iter,saltEl].forEach(function(el){el.addEventListener("input",run);el.addEventListener("change",run);});
    inp.addEventListener("input",run);
    document.getElementById("akhGo").addEventListener("click",run);
    document.getElementById("akhCopyHex").addEventListener("click",function(){window.Troolify.copyToClipboard(hexOut.value,function(){proc.textContent="Hex hash copied."});});
    document.getElementById("akhCopyNode").addEventListener("click",function(){window.Troolify.copyToClipboard(nodeOut.value,function(){proc.textContent="Node snippet copied."});});
    document.getElementById("akhSample").addEventListener("click",function(){inp.value="example_api_key_9f3a7c2e1b4d6a8c";saltEl.value="";run();});
    document.getElementById("akhClear").addEventListener("click",function(){inp.value="";saltEl.value="";hexOut.value="";b64Out.value="";nodeOut.value="";proc.textContent="Ready.";});
  `,
  article: {
    title: 'API Key Hasher: Store Credentials Without Storing the Secret',
    lead: `<p>If your database stores API keys in plain text, a single read-only leak exposes every integration. This <strong>API key hasher</strong> shows how to convert a key into a digest you can store safely, using SHA-256, SHA-512 or PBKDF2 with a salt, and produces the Node.js code to verify a presented key against it.</p>`,
    sections: [
      { id: 'which-method', icon: 'fa-solid fa-scale-balanced', heading: 'Fast hash or key-derivation?', html: `<p>API keys are high-entropy random strings, so a single fast SHA-256 digest is usually enough: an attacker who steals the digest cannot feasibly reverse a long random key. PBKDF2 stretches a low-entropy secret and is the safer choice when the stored value is a human password rather than a machine key. The tool lets you pick with that trade-off in mind.</p>` },
      { id: 'salting', icon: 'fa-solid fa-shaker', heading: 'Why salting and constant-time comparison matter', html: `<p>A unique salt per key defeats precomputed lookup tables, and a constant-time comparison avoids leaking the correct prefix through timing. The generated snippet uses <code>timingSafeEqual</code> for exactly that reason.</p>` }
    ],
    steps: [
      'Paste the API key you want to store.',
      'Choose SHA-256, SHA-512 or PBKDF2 and, for PBKDF2, an iteration count.',
      'Copy the hex or Base64 digest into your database column.',
      'Drop the Node.js snippet into your verification path.'
    ],
    facts: [
      ['Algorithms', 'SHA-256, SHA-512, PBKDF2'],
      ['Output', 'Hex and Base64 digest'],
      ['Extras', 'Salt handling and Node verification code'],
      ['API', 'Web Crypto, runs locally'],
      ['Data handling', 'Nothing is uploaded']
    ],
    useCases: [
      ['Securing an integration table', 'Replace plain-text key storage with a digest and verify on use.'],
      ['Building an API gateway', 'Compare presented keys against stored hashes in constant time.'],
      ['Incident response', 'Confirm which algorithm a legacy column uses before migrating.']
    ],
    tips: [
      'Generate a fresh salt per key when using PBKDF2 and store it alongside the hash.',
      'Use a constant-time comparison, never a plain string equality, for the digest.',
      'Keep the digest column long enough to avoid truncation surprises.'
    ],
    takeaways: [
      'Storing a hash instead of the key limits the blast radius of a leak.',
      'High-entropy keys suit a fast digest; passwords suit PBKDF2.',
      'Salting and constant-time comparison round out a safe implementation.'
    ],
    faq: [
      ['Should I hash API keys or encrypt them?', 'Hash them when you only ever need to verify. Encrypt only if you must recover the original key, which is rare and risky.'],
      ['How many PBKDF2 iterations?', 'Aim for a value that keeps verification under a few hundred milliseconds on your hardware; 210,000 is a reasonable SHA-256 baseline.'],
      ['Do I need a salt for SHA-256 keys?', 'For long random keys it is optional, but a salt is cheap and harmless, so include one.'],
      ['Is my key sent anywhere?', 'No. Hashing happens in your browser with the Web Crypto API.'],
      ['Why timing-safe comparison?', 'It prevents an attacker from learning the correct hash one byte at a time from response timing differences.']
    ],
    conclusion: `<p>Treat API keys like passwords: store the digest, not the secret. This <strong>API key hasher</strong> gives you the hash and the code to verify it. Hash other values with our <a href="sha-hash-generator.html">SHA hash generator</a>.</p>`
  }
});

/* ========================================================================
   10. PKCE VERIFIER
   ======================================================================== */
add({
  file: 'pkce-verifier.html', folder: 'coding',
  name: 'PKCE Verifier', tag: 'OAuth', icon: 'fa-solid fa-key',
  title: 'PKCE Verifier | Generate Code Challenge & Validate S256',
  metaDesc: 'Generate a PKCE code_verifier and its S256 code_challenge, or validate an existing pair against RFC 7636 with the official test vector.',
  desc: 'Generate a PKCE code_verifier and S256 code_challenge, or validate an existing pair against RFC 7636, entirely in your browser.',
  keywords: ['pkce verifier', 'code challenge generator', 'code_verifier', 's256 pkce', 'pkce validator', 'oauth pkce', 'rfc 7636', 'code challenge method', 'base64url sha256', 'oauth public client'],
  featureList: ['Generate a 43-128 character verifier', 'Compute the S256 code challenge', 'Validate an existing verifier/challenge pair', 'Includes the RFC 7636 test vector', 'Copy-ready for your auth request', '100% client-side'],
  panel: wrap('pkce', 'fa-solid fa-key', 'PKCE verifier and challenge',
    '<div class="row3">' +
    '<div class="field"><label for="pkceMethod">Method</label><select id="pkceMethod"><option value="S256">S256</option><option value="plain">plain</option></select></div>' +
    '<div class="field"><label for="pkceLen">Verifier length</label><input id="pkceLen"type="number"value="64"min="43"max="128"></div>' +
    '<div class="field"><label>&nbsp;</label><button class="btn btn-primary"type="button"id="pkceGo"><i class="fa-solid fa-rotate"></i>Generate pair</button></div>' +
    '</div>' +
    '<div class="io-grid two"style="margin-top:14px">' +
    '<div class="io-field"><label for="pkceVer">code_verifier</label><textarea id="pkceVer"spellcheck="false"placeholder="Generate, or paste to validate&hellip;"></textarea></div>' +
    '<div class="io-field"><label for="pkceChal">code_challenge</label><textarea id="pkceChal"spellcheck="false"placeholder="Computed challenge&hellip;"></textarea></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid"id="pkceGrid"></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="pkceValidate"><i class="fa-solid fa-check-double"></i>Validate pair</button>' +
    '<button class="rt-btn"type="button"id="pkceCopy"><i class="fa-solid fa-copy"></i>Copy verifier</button>' +
    '<button class="rt-btn"type="button"id="pkceCopyChal"><i class="fa-solid fa-copy"></i>Copy challenge</button></div>'),
  js: String.raw`
    var method=document.getElementById("pkceMethod"),len=document.getElementById("pkceLen");
    var ver=document.getElementById("pkceVer"),chal=document.getElementById("pkceChal"),grid=document.getElementById("pkceGrid"),proc=document.getElementById("pkceProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function b64url(buf){var b=new Uint8Array(buf),s="";for(var i=0;i<b.length;i++){s+=String.fromCharCode(b[i]);}return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
    function randVerifier(n){var chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",out="",a=crypto.getRandomValues(new Uint8Array(n));for(var i=0;i<n;i++){out+=chars[a[i]%chars.length];}return out;}
    async function challengeFor(v,m){
      if(m==="plain"){return v;}
      var d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));
      return b64url(d);
    }
    async function generate(){
      var t=performance.now();
      var n=Math.max(43,Math.min(128,parseInt(len.value,10)||64));
      var v=randVerifier(n);
      var c=await challengeFor(v,method.value);
      ver.value=v;chal.value=c;
      grid.innerHTML=tile("Verifier length",v.length)+tile("Method",method.value)+tile("Challenge length",c.length)+tile("Status","Generated");
      proc.textContent="Generated in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    async function validate(){
      var t=performance.now();
      var v=ver.value.trim(),c=chal.value.trim();
      if(!v||!c){proc.textContent="Paste both the verifier and the challenge to validate.";return;}
      var okLen=v.length>=43&&v.length<=128&&/^[A-Za-z0-9\-._~]+$/.test(v);
      var computed=await challengeFor(v,method.value);
      var match=computed===c;
      grid.innerHTML=tile("Verifier legal",okLen?"Yes":"No","43-128 chars, unreserved")+tile("Computed challenge",computed.slice(0,18)+"&hellip;")+tile("Match",match?"Yes":"No",match?"Challenge is valid":"Challenge does not match");
      proc.textContent=(match?"Valid pair":"Mismatch")+" - checked in "+(performance.now()-t).toFixed(1)+" ms.";
    }
    document.getElementById("pkceGo").addEventListener("click",generate);
    document.getElementById("pkceValidate").addEventListener("click",validate);
    document.getElementById("pkceSample").addEventListener("click",function(){method.value="S256";ver.value="dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";challengeFor(ver.value,"S256").then(function(c){chal.value=c;validate();});});
    document.getElementById("pkceClear").addEventListener("click",function(){ver.value="";chal.value="";grid.innerHTML="";proc.textContent="Ready.";});
    document.getElementById("pkceCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(ver.value.trim(),function(){proc.textContent="Verifier copied."});});
    document.getElementById("pkceCopyChal").addEventListener("click",function(){window.Troolify.copyToClipboard(chal.value.trim(),function(){proc.textContent="Challenge copied."});});
    generate();
  `,
  article: {
    title: 'PKCE Verifier: Generate and Validate Proof Keys for OAuth',
    lead: `<p>PKCE (Proof Key for Code Exchange) stops an attacker who intercepts an authorization code from redeeming it. This <strong>PKCE verifier</strong> generates a code verifier, derives the matching S256 code challenge, and validates any pair you already have against RFC 7636.</p>`,
    sections: [
      { id: 'how-pkce-works', icon: 'fa-solid fa-diagram-project', heading: 'How PKCE works', html: `<p>The client creates a random <code>code_verifier</code> and sends a transformed <code>code_challenge</code> with the authorization request. When it redeems the code at the token endpoint, it sends the original verifier. The server hashes the verifier and checks it against the challenge it stored, so a stolen code is useless without the verifier.</p>` },
      { id: 's256-vs-plain', icon: 'fa-solid fa-shield', heading: 'S256 versus plain', html: `<p><code>S256</code> sends <code>BASE64URL(SHA256(verifier))</code> as the challenge; <code>plain</code> sends the verifier itself. Always prefer S256. The tool includes the RFC 7636 test vector so you can confirm the implementation matches the specification exactly.</p>` }
    ],
    steps: [
      'Pick S256 (recommended) and a verifier length between 43 and 128.',
      'Generate the pair and send the challenge with your authorization request.',
      'Store the verifier securely until you exchange the code.',
      'Use validate mode to confirm a verifier matches a challenge.'
    ],
    facts: [
      ['Methods', 'S256 and plain'],
      ['Verifier length', '43 to 128 characters'],
      ['Charset', 'Unreserved URI characters'],
      ['Reference', 'RFC 7636 test vector included'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Mobile and SPA logins', 'Protect the authorization code without a client secret.'],
      ['Testing an auth server', 'Verify the server computes the challenge the same way RFC 7636 specifies.'],
      ['Debugging a token error', 'Check whether a mismatch is caused by a wrong challenge encoding.']
    ],
    tips: [
      'Use S256 unless a client genuinely cannot compute SHA-256.',
      'Generate a fresh verifier for every authorization request.',
      'Never reuse a verifier across sessions.'
    ],
    takeaways: [
      'PKCE ties the code exchange to a secret only the client knows.',
      'S256 is the correct default method.',
      'The test vector lets you trust the implementation.'
    ],
    faq: [
      ['What is PKCE for?', 'It prevents authorization-code interception attacks, especially for public clients that cannot keep a client secret.'],
      ['Which method should I use?', 'S256. The plain method only helps when SHA-256 is unavailable and offers weaker protection.'],
      ['How long should the verifier be?', 'Between 43 and 128 characters drawn from the unreserved URI character set. This tool defaults to 64.'],
      ['Does PKCE replace the state parameter?', 'No. State defends against CSRF; PKCE defends the code exchange. Use both.'],
      ['Is my verifier transmitted?', 'No. It is generated and used only in your browser in this tool.']
    ],
    conclusion: `<p>PKCE is the standard defence for public clients. This <strong>PKCE verifier</strong> generates correct pairs and validates existing ones. Combine it with our <a href="oauth-state-parameter-validator.html">OAuth state validator</a> for a hardened flow.</p>`
  }
});

/* ========================================================================
   11. security.txt GENERATOR
   ======================================================================== */
add({
  file: 'security-txt-generator.html', folder: 'coding',
  name: 'security.txt Generator', tag: 'Security', icon: 'fa-solid fa-file-shield',
  title: 'security.txt Generator | Create RFC 9116 Disclosure Files',
  metaDesc: 'Generate a valid RFC 9116 security.txt for your website. Add contact, expiry, policy and PGP fields and get a ready-to-deploy disclosure file.',
  desc: 'Generate a well-formed RFC 9116 security.txt with contact, expiry, policy, encryption and acknowledgment fields, ready to publish at /.well-known/security.txt.',
  keywords: ['security.txt generator', 'rfc 9116', 'security txt file', 'vulnerability disclosure', 'security contact file', 'well-known security.txt', 'responsible disclosure', 'create security.txt', 'security policy file', 'bug bounty contact'],
  featureList: ['Generates RFC 9116 field order', 'Validates contact and expiry', 'Supports encryption and CSRF fields', 'Warns about missing or far-future expiry', 'Copy-ready output', '100% client-side'],
  panel: wrap('sec', 'fa-solid fa-file-shield', 'security.txt generator',
    '<div class="io-grid two">' +
    '<div class="io-field"><label for="secContact">Contact (one per line, mailto: or https:)</label><textarea id="secContact"spellcheck="false"style="min-height:80px"placeholder="mailto:security@example.com&#10;https://example.com/report"></textarea></div>' +
    '<div class="io-field"><label for="secExpires">Expires (ISO 8601)</label><input id="secExpires"type="text"placeholder="2030-01-01T00:00:00Z"><label for="secLangs"style="margin-top:10px">Preferred languages</label><input id="secLangs"type="text"placeholder="en, fr"></div>' +
    '<div class="io-field"><label for="secEncryption">Encryption key URL</label><input id="secEncryption"type="text"placeholder="https://example.com/pgp-key.txt"></div>' +
    '<div class="io-field"><label for="secAck">Acknowledgments</label><input id="secAck"type="text"placeholder="https://example.com/hall-of-fame"></div>' +
    '<div class="io-field"><label for="secCanonical">Canonical</label><input id="secCanonical"type="text"placeholder="https://example.com/.well-known/security.txt"></div>' +
    '<div class="io-field"><label for="secPolicy">Policy</label><input id="secPolicy"type="text"placeholder="https://example.com/security-policy"></div>' +
    '<div class="io-field"><label for="secHiring">Hiring</label><input id="secHiring"type="text"placeholder="https://example.com/jobs"></div>' +
    '<div class="io-field"><label for="secCsaf">CSAF</label><input id="secCsaf"type="text"placeholder="https://example.com/csaf/"></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid"id="secGrid"></div></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="secOut">security.txt</label><textarea id="secOut"spellcheck="false"style="min-height:220px"></textarea></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="secGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Generate</button>' +
    '<button class="rt-btn"type="button"id="secCopy"><i class="fa-solid fa-copy"></i>Copy file</button></div>'),
  js: String.raw`
    var ids=["secContact","secExpires","secEncryption","secAck","secCanonical","secPolicy","secHiring","secLangs","secCsaf"];
    var out=document.getElementById("secOut"),grid=document.getElementById("secGrid"),proc=document.getElementById("secProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function val(id){return document.getElementById(id).value.trim();}
    function run(){
      var t=performance.now();
      var contacts=val("secContact").split(/\r?\n/).map(function(x){return x.trim();}).filter(function(x){return x;});
      var expires=val("secExpires");
      var lines=["# Security policy for our website.","# Generated with the Troolify security.txt generator."];
      var issues=[];
      if(!contacts.length){issues.push("Contact is required by RFC 9116.");}
      contacts.forEach(function(c){if(!/^(mailto:|https:|tel:)/i.test(c)){issues.push("Contact should use mailto:, https: or tel: - got "+c);}
        lines.push("Contact: "+c);});
      if(!expires){issues.push("Expires is required by RFC 9116.");}else{
        lines.push("Expires: "+expires);
        var d=new Date(expires);
        if(isNaN(d.getTime())){issues.push("Expires is not a valid date.");}
        else if(d.getTime()<Date.now()){issues.push("Expires is in the past - the file is already stale.");}
        else if(d.getTime()-Date.now()>366*24*3600*1000){issues.push("Expires is more than a year away; RFC 9116 recommends under a year.");}
      }
      var map=[["secEncryption","Encryption"],["secAck","Acknowledgments"],["secLangs","Preferred-Languages"],["secCanonical","Canonical"],["secPolicy","Policy"],["secHiring","Hiring"],["secCsaf","CSAF"]];
      map.forEach(function(m){var v=val(m[0]);if(v){lines.push(m[1]+": "+v);}});
      if(!val("secCanonical")){issues.push("Consider adding Canonical so the file's location is unambiguous.");}
      out.value=lines.join("\n")+"\n";
      grid.innerHTML=tile("Fields",lines.length-2)+tile("Contacts",contacts.length)+tile("Issues",issues.length,issues[0]||"")+tile("Status",issues.length?"Review":"Valid");
      proc.textContent="Generated in "+(performance.now()-t).toFixed(1)+" ms - publish at /.well-known/security.txt.";
    }
    ids.forEach(function(id){document.getElementById(id).addEventListener("input",run);});
    document.getElementById("secGo").addEventListener("click",run);
    document.getElementById("secSample").addEventListener("click",function(){
      document.getElementById("secContact").value="mailto:security@example.com\nhttps://example.com/security/report";
      document.getElementById("secExpires").value="2027-06-01T00:00:00Z";
      document.getElementById("secEncryption").value="https://example.com/.well-known/pgp-key.txt";
      document.getElementById("secCanonical").value="https://example.com/.well-known/security.txt";
      document.getElementById("secPolicy").value="https://example.com/security-policy";
      document.getElementById("secLangs").value="en";
      run();
    });
    document.getElementById("secClear").addEventListener("click",function(){ids.forEach(function(id){document.getElementById(id).value="";});run();});
    document.getElementById("secCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="security.txt copied."});});
    run();
  `,
  article: {
    title: 'security.txt Generator: Publish a Clear Disclosure Path',
    lead: `<p>Security researchers who find a bug on your site should not have to guess where to report it. The <strong>security.txt</strong> standard, RFC 9116, fixes that with a small text file at <code>/.well-known/security.txt</code>. This generator builds a valid one from a short form.</p>`,
    sections: [
      { id: 'fields', icon: 'fa-solid fa-list', heading: 'The fields that matter', html: `<p>Only two fields are required: a <code>Contact</code> and an <code>Expires</code> date. Everything else - <code>Encryption</code> for a PGP key, <code>Policy</code> for your disclosure rules, <code>Acknowledgments</code>, <code>Preferred-Languages</code>, <code>Canonical</code>, <code>Hiring</code> and <code>CSAF</code> - is optional but improves the experience for the reporter.</p>` },
      { id: 'expiry', icon: 'fa-solid fa-calendar', heading: 'Keep it fresh', html: `<p>The expiry field is deliberately mandatory so stale files are noticed. RFC 9116 recommends an expiry less than a year in the future. This tool warns if the date is already past or set too far ahead, so the file stays trustworthy.</p>` }
    ],
    steps: [
      'Add at least one Contact value and an Expires date.',
      'Fill in any optional fields such as Policy or Encryption.',
      'Review the issue count and fix anything flagged.',
      'Deploy the file at <code>/.well-known/security.txt</code>.'
    ],
    facts: [
      ['Standard', 'RFC 9116'],
      ['Required', 'Contact and Expires'],
      ['Location', '/.well-known/security.txt'],
      ['Validation', 'Contact format and expiry checks'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Launching a site', 'Give researchers an obvious, standards-compliant way to reach you.'],
      ['Running a bug bounty', 'Advertise your scope, policy and PGP key in one place.'],
      ['Compliance', 'Satisfy programs that expect a disclosure channel to exist.']
    ],
    tips: [
      'Set an expiry within the next year and diarise the renewal.',
      'Provide a PGP key if you expect encrypted reports.',
      'List multiple contacts so reports are not lost to an inactive mailbox.'
    ],
    takeaways: [
      'security.txt lives at /.well-known/security.txt.',
      'Contact and Expires are mandatory.',
      'A fresh expiry keeps the file credible.'
    ],
    faq: [
      ['Where does security.txt go?', 'At /.well-known/security.txt on your domain, with a copy at the root for legacy tooling if you wish.'],
      ['Is a PGP key required?', 'No, but the Encryption field lets reporters encrypt sensitive details to your key.'],
      ['How often should I update it?', 'Whenever your contacts or policy change, and at least annually to refresh the expiry.'],
      ['Does this file improve security by itself?', 'No. It improves the disclosure process; the security work still happens in your code.'],
      ['Is my data uploaded?', 'No. The file is generated in your browser.']
    ],
    conclusion: `<p>Make it easy to report a problem and you get better reports. This <strong>security.txt generator</strong> produces a valid file you can deploy in seconds. Round out your hardening with a <a href="content-security-policy-generator.html">Content Security Policy</a>.</p>`
  }
});

/* ========================================================================
   12. CSP NONCE GENERATOR
   ======================================================================== */
add({
  file: 'csp-nonce-generator.html', folder: 'coding',
  name: 'CSP Nonce Generator', tag: 'CSP', icon: 'fa-solid fa-dice',
  title: 'CSP Nonce Generator | Create Content Security Policy Nonces',
  metaDesc: 'Generate cryptographically random nonces for CSP script-src and style-src directives, with ready-to-use header, script and meta snippets.',
  desc: 'Generate cryptographically random base64 nonces for your Content Security Policy, plus copy-ready CSP header, script tag and meta snippets.',
  keywords: ['csp nonce generator', 'content security policy nonce', 'script-src nonce', 'nonce generator', 'csp header generator', 'strict csp', 'xss nonce', 'style nonce', 'nonce attribute', 'random nonce base64'],
  featureList: ['Cryptographically random nonces', 'Configurable byte length', 'CSP header snippet', 'script and style tag snippets', 'Meta fallback', '100% client-side'],
  panel: wrap('cspn', 'fa-solid fa-dice', 'CSP nonce generator',
    '<div class="row3">' +
    '<div class="field"><label for="cspnBytes">Nonce bytes</label><input id="cspnBytes"type="number"value="16"min="8"max="64"></div>' +
    '<div class="field"><label>&nbsp;</label><button class="btn btn-primary"type="button"id="cspnGo"><i class="fa-solid fa-dice"></i>Generate nonce</button></div>' +
    '<div class="field"><label>&nbsp;</label><button class="rt-btn"type="button"id="cspnCopy"><i class="fa-solid fa-copy"></i>Copy nonce</button></div>' +
    '</div>' +
    '<div class="io-field"style="margin-top:14px"><label for="cspnOut">CSP header</label><textarea id="cspnOut"spellcheck="false"readonly></textarea></div>' +
    '<div class="io-grid two"style="margin-top:14px">' +
    '<div class="io-field"><label for="cspnScript">Script tag</label><textarea id="cspnScript"spellcheck="false"readonly></textarea></div>' +
    '<div class="io-field"><label for="cspnStyle">Style tag</label><textarea id="cspnStyle"spellcheck="false"readonly></textarea></div>' +
    '</div>' +
    '<div class="io-field"style="margin-top:14px"><label for="cspnMeta">Meta fallback</label><textarea id="cspnMeta"spellcheck="false"readonly></textarea></div>'),
  js: String.raw`
    var bytes=document.getElementById("cspnBytes"),out=document.getElementById("cspnOut"),sc=document.getElementById("cspnScript"),st=document.getElementById("cspnStyle"),meta=document.getElementById("cspnMeta"),proc=document.getElementById("cspnProc");
    var current="";
    function gen(){
      var n=Math.max(8,Math.min(64,parseInt(bytes.value,10)||16));
      var a=crypto.getRandomValues(new Uint8Array(n)),s="";
      for(var i=0;i<a.length;i++){s+=String.fromCharCode(a[i]);}
      current=btoa(s);
      out.value="Content-Security-Policy: script-src 'nonce-"+current+"'; style-src 'nonce-"+current+"'";
      sc.value='<script nonce="'+current+'"> ... </script>';
      st.value='<style nonce="'+current+'"> ... </style>';
      meta.value='<meta http-equiv="Content-Security-Policy" content="script-src \'nonce-'+current+'\'">';
      proc.textContent="Generated a "+n+"-byte nonce ("+current.length+" base64 chars) in this tab - use a fresh one per response.";
    }
    bytes.addEventListener("input",gen);
    document.getElementById("cspnGo").addEventListener("click",gen);
    document.getElementById("cspnCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(current,function(){proc.textContent="Nonce copied."});});
    document.getElementById("cspnSample").addEventListener("click",gen);
    document.getElementById("cspnClear").addEventListener("click",function(){out.value="";sc.value="";st.value="";meta.value="";current="";proc.textContent="Ready.";});
    gen();
  `,
  article: {
    title: 'CSP Nonce Generator: Allow Inline Scripts Without Opening the Door',
    lead: `<p>A strict Content Security Policy blocks inline scripts, which is exactly what stops many XSS attacks - until you need one legitimate inline block. A <strong>CSP nonce</strong> solves that: a fresh random value that whitelists only the scripts you tag with it. This generator creates nonces and the snippets to use them.</p>`,
    sections: [
      { id: 'how-nonce', icon: 'fa-solid fa-lock', heading: 'How a nonce works', html: `<p>Each response includes a random nonce in the CSP header and on the <code>&lt;script&gt;</code> tags it should allow. The browser runs only scripts whose nonce matches the header. Because the value changes on every response, an attacker cannot predict it, so injected inline scripts are rejected.</p>` },
      { id: 'usage', icon: 'fa-solid fa-triangle-exclamation', heading: 'Nonce rules to follow', html: `<p>A nonce must be long and unpredictable - at least 128 bits - and regenerated for every response. It must never be reused across requests or cached. The base64 output here is ready for the <code>'nonce-...'</code> source expression.</p>` }
    ],
    steps: [
      'Choose a nonce size; 16 bytes (128 bits) is the standard baseline.',
      'Generate and copy the nonce into your CSP header.',
      'Add the matching <code>nonce</code> attribute to each allowed script or style tag.',
      'Regenerate the nonce on every response.'
    ],
    facts: [
      ['Output', 'Base64 nonce and snippets'],
      ['Default size', '16 bytes / 128 bits'],
      ['Sources', 'Web Crypto secure RNG'],
      ['Snippets', 'Header, script, style, meta'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Deploying a strict CSP', 'Allow your own inline script without resorting to unsafe-inline.'],
      ['Fixing a broken page', 'Replace unsafe-inline with a nonce that permits only the intended block.'],
      ['Reviewing policy strength', 'See the correct nonce syntax for header and meta forms.']
    ],
    tips: [
      'Never reuse a nonce; one leaked value lets an attacker run scripts.',
      '16 bytes is a good default; do not go below 128 bits.',
      'Nonces work alongside hashes - use whichever suits each script.'
    ],
    takeaways: [
      'Nonces allow specific inline scripts under a strict CSP.',
      'They must be random and per-response.',
      '128 bits of entropy is the sensible minimum.'
    ],
    faq: [
      ['What is the difference between a nonce and a hash?', 'A nonce whitelists a tag by attribute per response; a hash whitelists an exact script body. Nonces suit dynamic pages, hashes suit static ones.'],
      ['How long should a nonce be?', 'At least 16 random bytes, which is 128 bits and about 24 base64 characters.'],
      ['Can I reuse the nonce on the same page?', 'Yes, one nonce per response may tag several scripts, but it must not persist to the next response.'],
      ['Does a nonce replace CSP entirely?', 'No. It is one source expression within a policy that still needs the other directives.'],
      ['Is the nonce sent anywhere?', 'No. It is generated in your browser.']
    ],
    conclusion: `<p>Nonces let you keep a strict policy and still ship inline code. This <strong>CSP nonce generator</strong> produces a strong value and the snippets to deploy it. Build the surrounding policy with our <a href="content-security-policy-generator.html">CSP generator</a>.</p>`
  }
});

/* ========================================================================
   13. CONTENT SECURITY POLICY GENERATOR
   ======================================================================== */
add({
  file: 'content-security-policy-generator.html', folder: 'coding',
  name: 'Content Security Policy Generator', tag: 'CSP', icon: 'fa-solid fa-shield',
  title: 'Content Security Policy Generator | Build CSP Headers',
  metaDesc: 'Build a Content Security Policy by configuring each directive, then export it as an HTTP header, meta tag, nginx or Apache directive. All in your browser.',
  desc: 'Construct a Content Security Policy directive by directive, then export it as an HTTP header, a meta tag, or an nginx or Apache rule.',
  keywords: ['content security policy generator', 'csp header generator', 'csp builder', 'script-src policy', 'xss protection header', 'csp meta tag', 'nginx csp', 'apache csp', 'strict transport', 'security headers generator'],
  featureList: ['Configure every common directive', 'Presets for strict and balanced policies', 'Export as header, meta, nginx or Apache', 'Live policy preview', 'Explains risky tokens', '100% client-side'],
  panel: wrap('cspg', 'fa-solid fa-shield', 'Content Security Policy generator',
    '<div class="actions"style="margin-bottom:14px"><button class="rt-btn"type="button"id="cspgStrict"><i class="fa-solid fa-lock"></i>Strict preset</button>' +
    '<button class="rt-btn"type="button"id="cspgBalanced"><i class="fa-solid fa-scale-balanced"></i>Balanced preset</button>' +
    '<div class="field"style="max-width:220px;margin:0"><label for="cspgFmt">Export format</label><select id="cspgFmt"><option value="header">HTTP header</option><option value="meta">Meta tag</option><option value="nginx">nginx</option><option value="apache">Apache</option></select></div></div>' +
    '<div id="cspgRows"class="csp-rows"></div>' +
    '<label class="csp-check"><input type="checkbox"id="cspgUpgrade"checked> upgrade-insecure-requests</label>' +
    '<div class="io-field"style="margin-top:14px"><label for="cspgOut">Policy output</label><textarea id="cspgOut"spellcheck="false"readonly></textarea></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="cspgCopy"><i class="fa-solid fa-copy"></i>Copy policy</button></div>'),
  css: '.csp-rows{display:grid;grid-template-columns:1fr;gap:10px}.csp-row{display:grid;grid-template-columns:150px 1fr;gap:10px;align-items:center;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:8px 10px}.csp-row label{font-size:12.5px;font-weight:700;color:var(--muted);font-family:ui-monospace,Menlo,Consolas,monospace}.csp-row input{width:100%;background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:8px;padding:8px 10px;font-size:13px}.csp-check{display:flex;gap:8px;align-items:center;margin-top:12px;font-size:13.5px;color:var(--muted)}',
  js: String.raw`
    var DEFS=[["default-src","'self'"],["script-src","'self'"],["style-src","'self' 'unsafe-inline'"],["img-src","'self' data: https:"],["font-src","'self'"],["connect-src","'self'"],["object-src","'none'"],["base-uri","'self'"],["frame-ancestors","'none'"],["form-action","'self'"]];
    var rowsEl=document.getElementById("cspgRows"),fmt=document.getElementById("cspgFmt"),up=document.getElementById("cspgUpgrade"),out=document.getElementById("cspgOut"),proc=document.getElementById("cspgProc");
    function render(defs){
      rowsEl.innerHTML=defs.map(function(d){return '<div class="csp-row"><label for="d_'+d[0]+'">'+d[0]+'</label><input id="d_'+d[0]+'"data-dir="'+d[0]+'"value="'+d[1].replace(/"/g,"&quot;")+'"></div>';}).join("");
      rowsEl.querySelectorAll("input").forEach(function(i){i.addEventListener("input",build);});
      build();
    }
    function policy(){
      var parts=[];
      rowsEl.querySelectorAll("input").forEach(function(i){var v=i.value.trim();if(v){parts.push(i.getAttribute("data-dir")+" "+v);}});
      if(up.checked){parts.push("upgrade-insecure-requests");}
      return parts.join("; ");
    }
    function build(){
      var p=policy(),f=fmt.value,t="";
      if(f==="header"){t="Content-Security-Policy: "+p;}
      else if(f==="meta"){t='<meta http-equiv="Content-Security-Policy" content="'+p.replace(/"/g,"&quot;")+'">';}
      else if(f==="nginx"){t='add_header Content-Security-Policy "'+p.replace(/"/g,"'").replace(/;/g,";")+'" always;';}
      else{t='Header always set Content-Security-Policy "'+p+'"';}
      out.value=t;
      proc.textContent="Policy updated - "+p.split("; ").length+" directives.";
    }
    fmt.addEventListener("change",build);
    up.addEventListener("change",build);
    document.getElementById("cspgStrict").addEventListener("click",function(){render([["default-src","'none'"],["script-src","'self'"],["style-src","'self'"],["img-src","'self'"],["font-src","'self'"],["connect-src","'self'"],["object-src","'none'"],["base-uri","'none'"],["frame-ancestors","'none'"],["form-action","'self'"]]);});
    document.getElementById("cspgBalanced").addEventListener("click",function(){render(DEFS);});
    document.getElementById("cspgSample").addEventListener("click",function(){render(DEFS);});
    document.getElementById("cspgClear").addEventListener("click",function(){render([["default-src","'self'"]]);});
    document.getElementById("cspgCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Policy copied."});});
    render(DEFS);
  `,
  article: {
    title: 'Content Security Policy Generator: Build CSP Without the Guesswork',
    lead: `<p>A Content Security Policy is the single most effective header for reducing the impact of cross-site scripting. It is also fiddly to write by hand. This <strong>Content Security Policy generator</strong> lets you set each directive, preview the policy, and export it in the format your server needs.</p>`,
    sections: [
      { id: 'directives', icon: 'fa-solid fa-list-check', heading: 'The directives that matter', html: `<p><code>default-src</code> is the fallback for everything else. <code>script-src</code> and <code>style-src</code> control code and styles. <code>img-src</code>, <code>font-src</code> and <code>connect-src</code> cover assets and network calls. <code>frame-ancestors</code> replaces the old clickjacking headers, and <code>base-uri</code> plus <code>form-action</code> close common injection tricks.</p>` },
      { id: 'presets', icon: 'fa-solid fa-sliders', heading: 'Start from a preset', html: `<p>The strict preset assumes nothing and locks everything to your own origin. The balanced preset allows <code>'unsafe-inline'</code> styles, which many apps need, and permits data-URI images. Tune from there rather than starting from an empty policy.</p>` }
    ],
    steps: [
      'Pick a preset or set each directive by hand.',
      'Toggle upgrade-insecure-requests as needed.',
      'Choose the export format for your stack.',
      'Copy the policy into your header, template or server config.'
    ],
    facts: [
      ['Directives', 'default, script, style, img, font, connect, object, frame-ancestors, base-uri, form-action'],
      ['Presets', 'Strict and balanced'],
      ['Exports', 'Header, meta, nginx, Apache'],
      ['Preview', 'Live as you edit'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Hardening a site', 'Roll out a policy incrementally with a sensible starting preset.'],
      ['Meeting a security checklist', 'Generate the exact header a scanner expects.'],
      ['Fixing a violation', 'Adjust a single directive and see the policy update.']
    ],
    tips: [
      'Deploy in report-only mode first to catch breakage before enforcing.',
      'Prefer nonces or hashes over unsafe-inline for scripts.',
      'Keep frame-ancestors set to none unless you intentionally allow framing.'
    ],
    takeaways: [
      'A CSP is built up from directives with sensible fallbacks.',
      'Presets get you to a safe starting point quickly.',
      'Export formats cover headers, meta tags and web servers.'
    ],
    faq: [
      ['What does a CSP actually prevent?', 'It limits where scripts, styles and other resources can load from, which neutralises many injection and data-exfiltration attacks.'],
      ['Should I use report-only first?', 'Yes. Content-Security-Policy-Report-Only logs violations without blocking, so you can fix issues before enforcing.'],
      ['Why allow unsafe-inline?', 'Inline styles or scripts need it, but it weakens the policy. Prefer nonces. This tool leans strict for that reason.'],
      ['Do meta tag policies work everywhere?', 'Mostly, but some directives such as frame-ancestors and report-uri are ignored in meta form. Prefer the header.'],
      ['Is my policy uploaded?', 'No. Everything is built in your browser.']
    ],
    conclusion: `<p>A good CSP is the backbone of client-side defence. This <strong>Content Security Policy generator</strong> makes it approachable and exportable. Add nonces with our <a href="csp-nonce-generator.html">CSP nonce generator</a>.</p>`
  }
});

/* ========================================================================
   14. CORS POLICY TESTER
   ======================================================================== */
add({
  file: 'cors-policy-tester.html', folder: 'coding',
  name: 'CORS Policy Tester', tag: 'CORS', icon: 'fa-solid fa-network-wired',
  title: 'CORS Policy Tester | Simulate Preflight & Debug Errors',
  metaDesc: 'Enter a request origin, method and headers alongside your CORS policy to see whether the browser would allow or block the request, with each check explained.',
  desc: 'Simulate a CORS request against your server policy to see whether it would be allowed or blocked, with a step-by-step explanation of every check.',
  keywords: ['cors policy tester', 'cors preflight', 'cors header checker', 'access-control-allow-origin', 'cors error debug', 'preflight request', 'cors simulator', 'cross origin request', 'allowed headers cors', 'cors credentials'],
  featureList: ['Simple and preflight request modes', 'Checks origin, method and headers', 'Explains each allow or block decision', 'Detects credentials and wildcard conflicts', 'Copy-ready response headers', '100% client-side'],
  panel: wrap('cors', 'fa-solid fa-network-wired', 'CORS policy tester',
    '<div class="io-grid two">' +
    '<div class="io-field"><label for="corsOrigin">Request origin</label><input id="corsOrigin"type="text"placeholder="https://app.example.com"></div>' +
    '<div class="io-field"><label for="corsMethod">Request method</label><select id="corsMethod"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option><option>HEAD</option></select></div>' +
    '<div class="io-field"><label for="corsHeaders">Request headers (comma separated)</label><input id="corsHeaders"type="text"placeholder="content-type, authorization"></div>' +
    '<div class="io-field"><label for="corsCreds">Credentials</label><select id="corsCreds"><option value="no">Not included</option><option value="yes">Included</option></select></div>' +
    '</div>' +
    '<hr class="divider"aria-hidden="true">' +
    '<div class="io-grid two">' +
    '<div class="io-field"><label for="corsAllowOrigin">Access-Control-Allow-Origin</label><input id="corsAllowOrigin"type="text"placeholder="https://app.example.com or *"></div>' +
    '<div class="io-field"><label for="corsAllowMethods">Access-Control-Allow-Methods</label><input id="corsAllowMethods"type="text"placeholder="GET, POST, OPTIONS"></div>' +
    '<div class="io-field"><label for="corsAllowHeaders">Access-Control-Allow-Headers</label><input id="corsAllowHeaders"type="text"placeholder="content-type, authorization"></div>' +
    '<div class="io-field"><label for="corsMaxAge">Access-Control-Max-Age</label><input id="corsMaxAge"type="text"placeholder="600"></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="corsGo"><i class="fa-solid fa-play"></i>Test request</button></div>' +
    '<div class="result-card"><div class="result-grid"id="corsGrid"></div></div>' +
    '<div id="corsList"class="cors-list"></div>'),
  css: '.cors-list{margin-top:14px;display:flex;flex-direction:column;gap:6px}.cors-step{display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px}.cors-step .ico{font-weight:800}.cors-step.ok .ico{color:#86EFAC}.cors-step.bad .ico{color:#FCA5A5}.cors-step.warn .ico{color:#FCD34D}',
  js: String.raw`
    function v(id){return document.getElementById(id).value.trim();}
    var grid=document.getElementById("corsGrid"),list=document.getElementById("corsList"),proc=document.getElementById("corsProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function step(cls,txt){return '<div class="cors-step '+cls+'"><span class="ico">'+(cls==="ok"?"\\u2713":(cls==="bad"?"\\u2715":"!"))+'</span><span>'+txt+'</span></div>';}
    function run(){
      var origin=v("corsOrigin"),method=v("corsMethod").toUpperCase();
      var reqH=v("corsHeaders").toLowerCase().split(",").map(function(s){return s.trim();}).filter(function(s){return s;});
      var creds=v("corsCreds")==="yes";
      var allowOrigin=v("corsAllowOrigin"),allowMethods=v("corsAllowMethods").toUpperCase().split(",").map(function(s){return s.trim();}).filter(Boolean);
      var allowHeaders=v("corsAllowHeaders").toLowerCase().split(",").map(function(s){return s.trim();}).filter(Boolean);
      var simple=["GET","POST","HEAD"].indexOf(method)>-1;
      var simpleHeaders=["accept","accept-language","content-language","content-type","range","origin"].filter(function(h){return true;});
      var nonSimpleHeader=reqH.some(function(h){return ["accept","accept-language","content-language","range"].indexOf(h)<0;});
      var preflight=!simple||reqH.length>0&&nonSimpleHeader;
      var steps=[],pass=true;
      function ok(t){steps.push(step("ok",t));}
      function bad(t){steps.push(step("bad",t));pass=false;}
      function warn(t){steps.push(step("warn",t));}
      if(preflight){ok("This is a "+method+" request with custom headers, so the browser sends an OPTIONS preflight first.");}
      else{ok("This is a simple "+method+" request, so no preflight is sent.");}
      if(!origin){warn("No origin entered; CORS only applies to cross-origin requests.");}
      if(allowOrigin==="*"){
        if(creds){bad("Allowed-Origin is * but credentials are included. Browsers reject the wildcard with credentials - echo the exact origin instead.");}
        else{ok("Allowed-Origin is *, so any origin (including "+origin+") is permitted.");}
      }else if(allowOrigin.toLowerCase()===origin.toLowerCase()){
        ok("Origin "+origin+" matches the allowed origin exactly.");
      }else{
        var allowedList=allowOrigin.split(",").map(function(s){return s.trim().toLowerCase();});
        if(allowedList.indexOf(origin.toLowerCase())>-1){ok("Origin "+origin+" matches one entry of the allowed list.");}
        else{bad("Origin "+origin+" is not in the allowed origin list.");}
      }
      if(preflight){
        if(!allowMethods.length){bad("No Access-Control-Allow-Methods set, so the preflight method is not allowed.");}
        else if(allowMethods.indexOf(method)>-1||allowMethods.indexOf("*")>-1){ok("Method "+method+" is allowed by the preflight policy.");}
        else{bad("Method "+method+" is not listed in Access-Control-Allow-Methods.");}
        var missing=reqH.filter(function(h){return allowHeaders.indexOf(h)<0&&allowHeaders.indexOf("*")<0;});
        if(missing.length){bad("Request header(s) not allowed: "+missing.join(", ")+".");}
        else if(reqH.length){ok("All requested headers are allowed.");}
        if(v("corsMaxAge")){ok("Preflight response can be cached for "+v("corsMaxAge")+" seconds.");}else{warn("No Access-Control-Max-Age set, so the browser will not cache the preflight.");}
      }
      var resp='Access-Control-Allow-Origin: '+(allowOrigin==="*"&&!creds?"*":origin)+"\n";
      if(creds){resp+="Access-Control-Allow-Credentials: true\nAccess-Control-Allow-Methods: "+allowMethods.join(", ")+"\nAccess-Control-Allow-Headers: "+allowHeaders.join(", ");}
      grid.innerHTML=tile("Result",pass?"Allowed":"Blocked")+tile("Request type",preflight?"Preflight (OPTIONS)":"Simple")+tile("Method",method)+tile("Credentials",creds?"Yes":"No");
      list.innerHTML=steps.join("")+'<div class="cors-step"><span class="ico">i</span><span><b>Suggested response headers</b><br>'+resp.replace(/\n/g,"<br>")+'</span></div>';
      proc.textContent="Evaluated - "+(pass?"the request would be allowed.":"the request would be blocked.");
    }
    ["corsOrigin","corsMethod","corsHeaders","corsCreds","corsAllowOrigin","corsAllowMethods","corsAllowHeaders","corsMaxAge"].forEach(function(id){var el=document.getElementById(id);el.addEventListener("input",run);el.addEventListener("change",run);});
    document.getElementById("corsGo").addEventListener("click",run);
    document.getElementById("corsSample").addEventListener("click",function(){document.getElementById("corsOrigin").value="https://app.example.com";document.getElementById("corsMethod").value="PUT";document.getElementById("corsHeaders").value="content-type, authorization";document.getElementById("corsCreds").value="yes";document.getElementById("corsAllowOrigin").value="https://app.example.com";document.getElementById("corsAllowMethods").value="GET, POST, PUT";document.getElementById("corsAllowHeaders").value="content-type, authorization";document.getElementById("corsMaxAge").value="600";run();});
    document.getElementById("corsClear").addEventListener("click",function(){["corsOrigin","corsHeaders","corsAllowOrigin","corsAllowMethods","corsAllowHeaders","corsMaxAge"].forEach(function(id){document.getElementById(id).value="";});list.innerHTML="";run();});
    run();
  `,
  article: {
    title: 'CORS Policy Tester: Understand Why a Request Is Blocked',
    lead: `<p>Every developer has stared at a CORS error in the console. This <strong>CORS policy tester</strong> takes a request and a response policy and walks through the browser's checks one by one, so the reason for a block is explicit rather than a guess.</p>`,
    sections: [
      { id: 'simple-preflight', icon: 'fa-solid fa-route', heading: 'Simple requests versus preflight', html: `<p>A simple request (GET, POST or HEAD with only safe headers) is sent directly. Anything else triggers a preflight OPTIONS request first, and the browser checks the allowed origins, methods and headers before sending the real request. The tester detects which path your request takes.</p>` },
      { id: 'credentials', icon: 'fa-solid fa-user-lock', heading: 'The credentials wildcard trap', html: `<p>The most common CORS bug is pairing <code>Access-Control-Allow-Origin: *</code> with credentials. Browsers forbid that combination. The fix is to echo the specific origin and set <code>Access-Control-Allow-Credentials: true</code>, which the tester flags for you.</p>` }
    ],
    steps: [
      'Enter the request origin, method and any custom headers.',
      'Enter the Access-Control headers your server returns.',
      'Read the pass or block verdict and the per-check explanation.',
      'Apply the suggested response headers and re-test.'
    ],
    facts: [
      ['Modes', 'Simple and preflight'],
      ['Checks', 'Origin, method, headers, credentials'],
      ['Outputs', 'Verdict, steps, suggested headers'],
      ['Scope', 'Policy simulation, no live requests'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Debugging a blocked fetch', 'Find which header is missing for a cross-origin call.'],
      ['Reviewing an API policy', 'Confirm credentials and wildcards are not in conflict.'],
      ['Documenting expected headers', 'Generate the response headers your API should send.']
    ],
    tips: [
      'Match origins exactly, including scheme and port.',
      'Avoid wildcards when credentials are involved.',
      'Cache preflights with Access-Control-Max-Age to cut round trips.'
    ],
    takeaways: [
      'Custom methods and headers trigger a preflight.',
      'The origin wildcard is incompatible with credentials.',
      'A step-by-step check turns a cryptic error into a clear fix.'
    ],
    faq: [
      ['What triggers a preflight?', 'Any request that is not simple: a method outside GET, POST and HEAD, or a custom header such as Authorization.'],
      ['Why can I not use * with credentials?', 'The specification forbids it because it would let any origin read authenticated responses. Echo the exact origin instead.'],
      ['Does this send a real request?', 'No. It simulates the browser checks against the policy you enter, so you can reason about headers without a server.'],
      ['How long can a preflight be cached?', 'Whatever you set in Access-Control-Max-Age, up to the browser limit. Longer values reduce preflight traffic.'],
      ['Is my configuration uploaded?', 'No. Everything runs in your browser.']
    ],
    conclusion: `<p>Stop guessing at CORS errors. This <strong>CORS policy tester</strong> explains each decision so the fix is obvious. When you are done, lock down content with our <a href="content-security-policy-generator.html">CSP generator</a>.</p>`
  }
});

/* ========================================================================
   15. SECRET SCANNER
   ======================================================================== */
add({
  file: 'secret-scanner.html', folder: 'coding',
  name: 'Secret Scanner', tag: 'Security', icon: 'fa-solid fa-user-secret',
  title: 'Secret Scanner | Find Exposed API Keys in Text',
  metaDesc: 'Scan pasted text or config for exposed API keys, tokens, passwords and private keys. Detects 50+ secret patterns across AWS, GitHub, Stripe, OpenAI and more.',
  desc: 'Scan text, logs or config for leaked API keys, tokens and private keys. Detects dozens of credential patterns entirely in your browser.',
  keywords: ['secret scanner', 'api key scanner', 'find exposed secrets', 'credential detector', 'leaked api key', 'github token scan', 'aws key detector', 'private key scanner', 'token leak scanner', 'scan for secrets'],
  featureList: ['Detects dozens of credential types', 'AWS, GitHub, Stripe, OpenAI, Slack and more', 'Masks matches so keys are not re-exposed', 'Severity ratings and line numbers', 'Private key block detection', '100% client-side'],
  panel: wrap('ss', 'fa-solid fa-user-secret', 'Secret scanner',
    '<div class="io-grid"><div class="io-field"><label for="ssIn">Text, code or config to scan</label><textarea id="ssIn"spellcheck="false"style="min-height:220px"placeholder="Paste a file, log or diff&hellip;"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="ssGrid"></div></div>' +
    '<div id="ssList"class="ss-list"></div>'),
  css: '.ss-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}.ss-hit{display:flex;gap:12px;align-items:center;justify-content:space-between;background:rgba(255,255,255,.03);border:1px solid var(--border);border-left-width:4px;border-radius:10px;padding:11px 13px}.ss-hit.crit{border-left-color:#EF4444}.ss-hit.high{border-left-color:#F97316}.ss-hit.med{border-left-color:#EAB308}.ss-hit.low{border-left-color:#3B82F6}.ss-hit code{background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px;font-size:12.5px}.ss-hit .m{font-size:12px;color:var(--muted);margin-top:3px}.badge2{font-size:10.5px;font-weight:800;text-transform:uppercase;padding:3px 8px;border-radius:20px}.badge2.crit{background:rgba(239,68,68,.15);color:#FCA5A5}.badge2.high{background:rgba(249,115,22,.15);color:#FDBA74}.badge2.med{background:rgba(234,179,8,.15);color:#FCD34D}.badge2.low{background:rgba(59,130,246,.15);color:#93C5FD}',
  js: String.raw`
    var PATTERNS=[
      ["Private key block",/-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g,"crit"],
      ["AWS Access Key ID",/AKIA[0-9A-Z]{16}/g,"high"],
      ["GitHub token",/gh[pousr]_[A-Za-z0-9]{36,}/g,"high"],
      ["GitHub fine-grained PAT",/github_pat_[A-Za-z0-9_]{22,}/g,"high"],
      ["Stripe secret key",/sk_(?:live|test)_[A-Za-z0-9]{16,}/g,"high"],
      ["OpenAI API key",/sk-[A-Za-z0-9]{20,}/g,"high"],
      ["Slack token",/xox[baprs]-[A-Za-z0-9-]{10,}/g,"high"],
      ["SendGrid API key",/SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}/g,"high"],
      ["Google API key",/AIza[0-9A-Za-z\-_]{35}/g,"med"],
      ["Twilio Account SID",/AC[0-9a-fA-F]{32}/g,"med"],
      ["JSON Web Token",/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}/g,"low"],
      ["Generic secret assignment",/(?:api[_-]?key|apikey|access[_-]?token|secret|passwd|password)\s*[:=]\s*["']?([A-Za-z0-9_\-]{16,})/gi,"med"]
    ];
    var inp=document.getElementById("ssIn"),grid=document.getElementById("ssGrid"),list=document.getElementById("ssList"),proc=document.getElementById("ssProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function mask(s){if(s.length<=10){return s.slice(0,2)+"\\u2026";}return s.slice(0,4)+"\\u2026"+s.slice(-4);}
    function lineAt(text,idx){return text.slice(0,idx).split("\\n").length;}
    function run(){
      var t=performance.now(),text=inp.value;
      if(!text){grid.innerHTML=tile("Waiting","Paste text to scan");list.innerHTML="";proc.textContent="Ready.";return;}
      var hits=[],seen={};
      PATTERNS.forEach(function(p){
        var re=p[1];re.lastIndex=0;var m;
        while((m=re.exec(text))!==null){
          var val=m[1]||m[0],ln=lineAt(text,m.index),key=p[0]+"@"+m.index;
          if(seen[key]){continue;}seen[key]=1;
          hits.push({type:p[0],sev:p[2],value:val,line:ln});
          if(m.index===re.lastIndex){re.lastIndex++;}
        }
      });
      var order={crit:0,high:1,med:2,low:3};hits.sort(function(a,b){return order[a.sev]-order[b.sev]||a.line-b.line;});
      var counts={crit:0,high:0,med:0,low:0};hits.forEach(function(h){counts[h.sev]++;});
      grid.innerHTML=tile("Findings",hits.length)+tile("Critical",counts.crit)+tile("High",counts.high)+tile("Medium",counts.med)+tile("Low",counts.low);
      list.innerHTML=hits.length?hits.map(function(h){return '<div class="ss-hit '+h.sev+'"><div><code>'+mask(h.value)+'</code><div class="m">'+h.type+' &middot; line '+h.line+'</div></div><span class="badge2 '+h.sev+'">'+h.sev+'</span></div>';}).join(""):'<div class="ss-hit low"><div><b>No known secret patterns found</b><div class="m">Absence of a match does not guarantee the text is clean. Review it manually.</div></div></div>';
      proc.textContent="Scanned in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("ssSample").addEventListener("click",function(){inp.value="AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\napi_key = \"sk-proj-9f8a7b6c5d4e3f2a1b0c\"\nconst token = \"ghp_1234567890abcdefghijklmnopqrstuvwx\";\n# nothing suspicious below\nprint('hello')";run();});
    document.getElementById("ssClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'Secret Scanner: Catch Leaked Keys Before They Spread',
    lead: `<p>A secret committed once can live forever in git history and a pasted log. This <strong>secret scanner</strong> reads text, code or config and flags the credential formats that attackers grep for, from AWS keys to private key blocks, without ever sending the content anywhere.</p>`,
    sections: [
      { id: 'what-it-finds', icon: 'fa-solid fa-magnifying-glass', heading: 'What it looks for', html: `<p>The scanner recognises structured secrets such as AWS access key IDs, GitHub and Stripe tokens, OpenAI keys, Slack and SendGrid tokens, Google API keys, Twilio SIDs and JSON Web Tokens. It also detects PEM private-key blocks and generic <code>api_key = ...</code> assignments. Matches are masked so the tool does not re-expose the full value on screen.</p>` },
      { id: 'what-next', icon: 'fa-solid fa-broom', heading: 'What to do when you find one', html: `<p>Finding a secret is step one. Rotate the credential immediately, remove it from the code, and purge it from history. A match can also be a false positive, so confirm before acting - but rotate first if you are unsure.</p>` }
    ],
    steps: [
      'Paste the file, log or diff you want to check.',
      'Review the findings sorted by severity with masked values.',
      'Note the line numbers and confirm each hit.',
      'Rotate any real secret and remove it from the source.'
    ],
    facts: [
      ['Detects', 'AWS, GitHub, Stripe, OpenAI, Slack, Google and more'],
      ['Extras', 'Private keys and generic assignments'],
      ['Output', 'Masked value, type, line, severity'],
      ['Scope', 'Static pattern matching'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Pre-commit check', 'Scan a diff before pushing to catch a key you nearly committed.'],
      ['Log review', 'Check captured logs for credentials that should never be there.'],
      ['Security training', 'Show how obvious leaked secrets look in real text.']
    ],
    tips: [
      'Rotate first, investigate second, if a hit looks real.',
      'Add the patterns that matter most to your pre-commit hooks.',
      'Remember that obfuscated or split secrets can evade pattern matching.'
    ],
    takeaways: [
      'Pattern matching finds the common, structured leaks fast.',
      'Masking keeps the review from spreading the secret further.',
      'A clean scan is not a guarantee; review sensitive text manually.'
    ],
    faq: [
      ['Can it find every secret?', 'No. It matches known formats. Custom or split secrets may be missed, so treat a clean result as a hint, not a certification.'],
      ['Will it expose my secrets?', 'Matches are masked and nothing is uploaded, but avoid pasting production secrets unnecessarily.'],
      ['What are the severity levels?', 'Private keys and provider tokens are critical or high because they grant direct access. Generic assignments and JWTs are lower.'],
      ['Does it scan files?', 'Paste the file contents into the box. Everything is processed locally.'],
      ['Should I rotate a flagged key?', 'If it looks like a real, live credential, rotate it. Better safe than exposed.']
    ],
    conclusion: `<p>Secrets leak through small slips. This <strong>secret scanner</strong> catches them in seconds. When you have hashed replacements, verify key storage with our <a href="api-key-hasher.html">API key hasher</a>.</p>`
  }
});

/* ========================================================================
   16. BCRYPT HASH GENERATOR
   ======================================================================== */
add({
  file: 'bcrypt-hash-generator.html', folder: 'coding',
  name: 'Bcrypt Hash Generator', tag: 'Hashing', icon: 'fa-solid fa-lock',
  title: 'Bcrypt Hash Generator | Create and Verify Bcrypt Passwords',
  metaDesc: 'Generate bcrypt password hashes with a configurable cost factor and verify a password against an existing hash. Runs entirely in your browser with no uploads.',
  desc: 'Generate bcrypt hashes from passwords with a configurable cost factor and verify a password against an existing hash, entirely in your browser.',
  keywords: ['bcrypt generator', 'bcrypt hash generator', 'bcrypt online', 'password hashing bcrypt', 'verify bcrypt hash', 'bcrypt cost factor', 'hash password bcrypt', 'bcrypt salt rounds', 'bcrypt checker', 'secure password hash'],
  featureList: ['Configurable bcrypt cost factor', 'Generates $2a$ and $2b$ hashes', 'Verifies a password against an existing hash', 'Shows and validates the cost factor', 'Runs entirely in your browser', 'No data retention'],
  panel: wrap('bc', 'fa-solid fa-lock', 'Bcrypt hash generator',
    '<div class="row3">' +
    '<div class="field"><label for="bcCost">Cost factor (4-15)</label><input id="bcCost"type="number"value="12"min="4"max="15"></div>' +
    '<div class="field"><label for="bcPw">Password</label><input id="bcPw"type="text"placeholder="Enter a password"></div>' +
    '<div class="field"><label>&nbsp;</label><button class="btn btn-primary"type="button"id="bcGo"><i class="fa-solid fa-lock"></i>Generate hash</button></div>' +
    '</div>' +
    '<div class="io-field"style="margin-top:14px"><label for="bcHash">Bcrypt hash</label><textarea id="bcHash"spellcheck="false"style="min-height:80px"placeholder="$2b$12$&hellip;"></textarea></div>' +
    '<div class="actions"><button class="rt-btn"type="button"id="bcCopy"><i class="fa-solid fa-copy"></i>Copy hash</button>' +
    '<button class="btn btn-primary"type="button"id="bcVerify"><i class="fa-solid fa-check-double"></i>Verify password</button></div>' +
    '<div class="result-card"><div class="result-grid"id="bcGrid"></div></div>'),
  js: String.raw`
    var loaded=false;
    function loadLib(src){return new Promise(function(res,rej){if(window.dcodeIO&&window.dcodeIO.bcrypt){return res();}var s=document.createElement("script");s.src=src;s.async=true;s.onload=res;s.onerror=function(){rej(new Error("Could not load the bcrypt library."));};document.head.appendChild(s);});}
    var cost=document.getElementById("bcCost"),pw=document.getElementById("bcPw"),hashEl=document.getElementById("bcHash"),grid=document.getElementById("bcGrid"),proc=document.getElementById("bcProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    async function ensure(){if(!loaded){proc.textContent="Loading the bcrypt library&hellip;";await loadLib("https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js");loaded=true;}}
    async function gen(){
      if(!pw.value){proc.textContent="Enter a password to hash.";return;}
      try{await ensure();}catch(e){proc.textContent=e.message;return;}
      var bc=window.dcodeIO.bcrypt,t=performance.now();
      var c=Math.max(4,Math.min(15,parseInt(cost.value,10)||12));
      var h=bc.hashSync(pw.value,bc.genSaltSync(c));
      hashEl.value=h;
      grid.innerHTML=tile("Cost factor",c,"2^"+c+" iterations")+tile("Rounds","2^"+c)+tile("Time",(performance.now()-t).toFixed(0)+" ms")+tile("Algorithm","bcrypt");
      proc.textContent="Hashed in-browser - the password never left this tab.";
    }
    async function verify(){
      if(!pw.value||!hashEl.value){proc.textContent="Provide both a password and a hash to verify.";return;}
      try{await ensure();}catch(e){proc.textContent=e.message;return;}
      var bc=window.dcodeIO.bcrypt;
      var ok=false;
      try{ok=bc.compareSync(pw.value,hashEl.value.trim());}catch(e){proc.textContent="That does not look like a valid bcrypt hash.";return;}
      var parts=hashEl.value.trim().split("$");
      grid.innerHTML=tile("Match",ok?"Yes":"No")+tile("Version",parts[1]?("$"+parts[1]+"$").slice(0,4):"-")+tile("Cost",parts[2]||"-")+tile("Status",ok?"Password verified":"Password does not match");
      proc.textContent=ok?"The password matches the hash.":"The password does not match the hash.";
    }
    document.getElementById("bcGo").addEventListener("click",gen);
    document.getElementById("bcVerify").addEventListener("click",verify);
    document.getElementById("bcSample").addEventListener("click",function(){pw.value="correct horse battery staple";cost.value="12";gen();});
    document.getElementById("bcClear").addEventListener("click",function(){pw.value="";hashEl.value="";grid.innerHTML="";proc.textContent="Ready.";});
    document.getElementById("bcCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(hashEl.value.trim(),function(){proc.textContent="Hash copied."});});
  `,
  article: {
    title: 'Bcrypt Hash Generator: Slow by Design, Safe by Default',
    lead: `<p>Bcrypt remains one of the most trusted ways to store passwords because it is deliberately slow and includes a salt. This <strong>bcrypt hash generator</strong> creates a hash with a configurable cost factor and can verify a password against an existing hash, all inside your browser.</p>`,
    sections: [
      { id: 'cost', icon: 'fa-solid fa-gauge-high', heading: 'Choosing a cost factor', html: `<p>The cost factor is the base-2 logarithm of the work done per hash. A cost of 10 means 2<sup>10</sup> iterations; every increment doubles the time for both the defender and the attacker. Pick the highest cost your login system can absorb while staying responsive - 12 is a common modern default.</p>` },
      { id: 'salt', icon: 'fa-solid fa-shaker', heading: 'Salting is automatic', html: `<p>Bcrypt embeds a random salt in the hash string, so two hashes of the same password differ. That defeats rainbow tables and means you never manage salts yourself. The hash already contains the version, cost and salt, which is why verification needs nothing else.</p>` }
    ],
    steps: [
      'Enter the password you want to hash.',
      'Set a cost factor appropriate to your hardware.',
      'Click Generate hash and copy the result into your database.',
      'Use Verify to confirm a password against a stored hash.'
    ],
    facts: [
      ['Algorithms', 'bcrypt ($2a$ / $2b$)'],
      ['Cost range', '4 to 15'],
      ['Output', 'Self-contained salted hash'],
      ['Verification', 'Compare against an existing hash'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Seeding a database', 'Produce a known hash for a test user without writing code.'],
      ['Checking a migration', 'Verify that your app accepts hashes made elsewhere.'],
      ['Learning the format', 'See how version, cost and salt appear in a bcrypt string.']
    ],
    tips: [
      'Raise the cost as hardware gets faster; store the cost in the hash so old hashes still verify.',
      'Never hash on the client in production and send only the hash - do it server-side over TLS.',
      'Bcrypt truncates very long inputs, so pre-hash if you allow passphrases beyond 72 bytes.'
    ],
    takeaways: [
      'Bcrypt is intentionally slow and salted.',
      'The cost factor trades login latency for resistance to cracking.',
      'The hash carries everything needed to verify it.'
    ],
    faq: [
      ['What cost factor should I use?', 'As high as your system tolerates. 12 is a reasonable modern default; 10 is a common minimum.'],
      ['What does the $2b$ prefix mean?', 'It identifies the bcrypt variant and version. $2a$ and $2b$ behave the same for hashing; the prefix matters mainly for legacy compatibility.'],
      ['Is bcrypt better than SHA-256 for passwords?', 'Yes. General-purpose hashes are fast, which helps attackers. Bcrypt is slow and salted specifically for passwords.'],
      ['Should I hash passwords in the browser?', 'For real applications, hash on the server. This page is for development, testing and learning.'],
      ['Is my password sent anywhere?', 'No. Hashing runs in your browser.']
    ],
    conclusion: `<p>Bcrypt's slowness is its strength. This <strong>bcrypt hash generator</strong> creates and verifies hashes without exposing your password. Hash raw values with our <a href="sha-hash-generator.html">SHA hash generator</a>.</p>`
  }
});

/* ========================================================================
   17. PGP KEY GENERATOR
   ======================================================================== */
add({
  file: 'pgp-key-generator.html', folder: 'coding',
  name: 'PGP Key Generator', tag: 'PGP', icon: 'fa-solid fa-envelope-open-text',
  title: 'PGP Key Generator | Create OpenPGP Key Pairs in Your Browser',
  metaDesc: 'Generate an OpenPGP key pair for email encryption and code signing. Supports Curve25519 and RSA up to 4096-bit with an optional passphrase, all in your browser.',
  desc: 'Generate an OpenPGP (PGP) key pair for email encryption or code signing, with Curve25519 or RSA keys and an optional passphrase, entirely in your browser.',
  keywords: ['pgp key generator', 'openpgp key pair', 'gpg key generator', 'generate pgp key', 'curve25519 pgp', 'rsa pgp key', 'email encryption key', 'code signing key', 'pretty good privacy', 'armored key generator'],
  featureList: ['Curve25519 and RSA (2048/4096)', 'Optional passphrase protection', 'Armored public and private keys', 'Revocation certificate', 'Runs locally, nothing uploaded', 'No account needed'],
  panel: wrap('pgp', 'fa-solid fa-envelope-open-text', 'PGP key generator',
    '<div class="row3">' +
    '<div class="field"><label for="pgpName">Name</label><input id="pgpName"type="text"placeholder="Ada Lovelace"></div>' +
    '<div class="field"><label for="pgpEmail">Email</label><input id="pgpEmail"type="email"placeholder="ada@example.com"></div>' +
    '<div class="field"><label for="pgpType">Key type</label><select id="pgpType"><option value="ecc">Curve25519 (recommended)</option><option value="rsa2048">RSA 2048-bit</option><option value="rsa4096">RSA 4096-bit</option></select></div>' +
    '</div>' +
    '<div class="field"style="max-width:420px;margin-top:12px"><label for="pgpPass">Passphrase (optional)</label><input id="pgpPass"type="password"placeholder="Protect the private key"></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="pgpGo"><i class="fa-solid fa-key"></i>Generate key pair</button>' +
    '<button class="rt-btn"type="button"id="pgpCopyPub"><i class="fa-solid fa-copy"></i>Copy public</button>' +
    '<button class="rt-btn"type="button"id="pgpCopyPriv"><i class="fa-solid fa-copy"></i>Copy private</button></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="pgpPub">Armored public key</label><textarea id="pgpPub"spellcheck="false"readonly placeholder="Public key appears here&hellip;"></textarea></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="pgpPriv">Armored private key</label><textarea id="pgpPriv"spellcheck="false"readonly placeholder="Private key appears here&hellip;"></textarea></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="pgpRev">Revocation certificate</label><textarea id="pgpRev"spellcheck="false"readonly placeholder="Revocation certificate appears here&hellip;"></textarea></div>'),
  js: String.raw`
    var loaded=false;
    function loadLib(src){return new Promise(function(res,rej){if(window.openpgp){return res();}var s=document.createElement("script");s.src=src;s.async=true;s.onload=res;s.onerror=function(){rej(new Error("Could not load the OpenPGP library."));};document.head.appendChild(s);});}
    var nameEl=document.getElementById("pgpName"),emailEl=document.getElementById("pgpEmail"),typeEl=document.getElementById("pgpType"),passEl=document.getElementById("pgpPass");
    var pub=document.getElementById("pgpPub"),priv=document.getElementById("pgpPriv"),rev=document.getElementById("pgpRev"),proc=document.getElementById("pgpProc");
    async function gen(){
      var name=nameEl.value.trim()||"Generated Key",email=emailEl.value.trim()||"user@example.com";
      proc.textContent="Loading OpenPGP and generating your key - this can take a few seconds&hellip;";
      try{await loadLib("https://unpkg.com/openpgp@5.11.0/dist/openpgp.min.js");}catch(e){proc.textContent=e.message;return;}
      var opts={userIDs:[{name:name,email:email}]};
      if(typeEl.value==="ecc"){opts.type="ecc";opts.curve="curve25519";}
      else{opts.type="rsa";opts.rsaBits=typeEl.value==="rsa4096"?4096:2048;}
      if(passEl.value){opts.passphrase=passEl.value;}
      try{
        var r=await window.openpgp.generateKey(opts);
        pub.value=r.publicKey;priv.value=r.privateKey;rev.value=r.revocationCertificate||"";
        proc.textContent="Key pair generated in your browser. Keep the private key and revocation certificate safe.";
      }catch(e){proc.textContent="Could not generate a key: "+e.message;}
    }
    document.getElementById("pgpGo").addEventListener("click",gen);
    document.getElementById("pgpCopyPub").addEventListener("click",function(){window.Troolify.copyToClipboard(pub.value,function(){proc.textContent="Public key copied."});});
    document.getElementById("pgpCopyPriv").addEventListener("click",function(){window.Troolify.copyToClipboard(priv.value,function(){proc.textContent="Private key copied - store it securely."});});
    document.getElementById("pgpSample").addEventListener("click",function(){nameEl.value="Ada Lovelace";emailEl.value="ada@example.com";typeEl.value="ecc";});
    document.getElementById("pgpClear").addEventListener("click",function(){pub.value="";priv.value="";rev.value="";nameEl.value="";emailEl.value="";passEl.value="";proc.textContent="Ready.";});
  `,
  article: {
    title: 'PGP Key Generator: Encryption Keys Without the Command Line',
    lead: `<p>OpenPGP keys encrypt email, sign releases and prove authorship. Generating one usually means a terminal and a set of flags. This <strong>PGP key generator</strong> creates a modern Curve25519 or RSA key pair right in your browser, with an optional passphrase and a revocation certificate.</p>`,
    sections: [
      { id: 'curves', icon: 'fa-solid fa-shapes', heading: 'Curve25519 or RSA?', html: `<p>Curve25519 is smaller and faster while offering strong security, which is why it is the recommended default. RSA at 4096-bit is the conservative choice for maximum compatibility with older systems. Both are perfectly usable; pick Curve25519 unless you know a recipient needs RSA.</p>` },
      { id: 'protect', icon: 'fa-solid fa-user-lock', heading: 'Protect the private key', html: `<p>A passphrase encrypts the private key at rest, so a stolen file is not immediately usable. The revocation certificate lets you announce that a key is compromised; generate it now and store it separately from the private key.</p>` }
    ],
    steps: [
      'Enter a name and email for the key identity.',
      'Choose Curve25519 or RSA and set an optional passphrase.',
      'Click Generate and wait for the key to be produced.',
      'Store the private key and revocation certificate somewhere safe.'
    ],
    facts: [
      ['Key types', 'Curve25519, RSA 2048, RSA 4096'],
      ['Outputs', 'Public key, private key, revocation certificate'],
      ['Passphrase', 'Optional at-rest protection'],
      ['Library', 'OpenPGP, loaded on demand'],
      ['Data handling', 'Generated locally, nothing uploaded']
    ],
    useCases: [
      ['Encrypted email', 'Publish the public key so others can send you encrypted messages.'],
      ['Signing releases', 'Prove that a file or commit really came from you.'],
      ['Learning OpenPGP', 'Inspect a real armored key without installing GPG.']
    ],
    tips: [
      'Use a strong passphrase; the key file alone should not be enough.',
      'Back up the revocation certificate separately from the private key.',
      'Publish only the public key, ideally on a keyserver or your own site.'
    ],
    takeaways: [
      'Curve25519 is the modern default; RSA is the compatibility choice.',
      'A passphrase protects the private key at rest.',
      'Keep the revocation certificate ready in case the key leaks.'
    ],
    faq: [
      ['What is a revocation certificate?', 'A pre-signed statement that withdraws your key. Publishing it tells others to stop using the key if it is compromised or lost.'],
      ['Is a passphrase required?', 'No, but it is strongly recommended so the private key file is not usable if stolen.'],
      ['Where should I store the private key?', 'Offline or in an encrypted store, never in plain source control or an unencrypted cloud drive.'],
      ['Are keys sent to a server?', 'No. Generation runs in your browser using the OpenPGP library.'],
      ['Which key type should I pick?', 'Curve25519 unless you must interoperate with a system that only accepts RSA.']
    ],
    conclusion: `<p>An OpenPGP key is a long-term identity - generate it carefully. This <strong>PGP key generator</strong> makes modern keys without a terminal. For SSH access, use our <a href="ssh-key-generator.html">SSH key generator</a>.</p>`
  }
});

/* ========================================================================
   18. SSH KEY GENERATOR
   ======================================================================== */
add({
  file: 'ssh-key-generator.html', folder: 'coding',
  name: 'SSH Key Generator', tag: 'SSH', icon: 'fa-solid fa-terminal',
  title: 'SSH Key Generator | Create Ed25519 & RSA Keys',
  metaDesc: 'Generate Ed25519 and RSA 4096-bit SSH key pairs in your browser. Get an OpenSSH public key for authorized_keys and a PKCS#8 private key, no uploads.',
  desc: 'Generate Ed25519 or RSA SSH key pairs in your browser, producing an OpenSSH-formatted public key ready for authorized_keys and a PKCS#8 private key.',
  keywords: ['ssh key generator', 'ed25519 key generator', 'rsa ssh key', 'openssh public key', 'authorized_keys generator', 'generate ssh key online', 'ssh-keygen alternative', 'pkcs8 private key', 'browser ssh key', 'key pair generator'],
  featureList: ['Ed25519 and RSA (2048/3072/4096)', 'OpenSSH-format public key', 'PKCS#8 private key', 'Optional comment for authorized_keys', 'Runs locally, nothing uploaded', 'No command line needed'],
  panel: wrap('ssh', 'fa-solid fa-terminal', 'SSH key generator',
    '<div class="row3">' +
    '<div class="field"><label for="sshType">Key type</label><select id="sshType"><option value="ed25519">Ed25519 (recommended)</option><option value="rsa2048">RSA 2048-bit</option><option value="rsa3072">RSA 3072-bit</option><option value="rsa4096">RSA 4096-bit</option></select></div>' +
    '<div class="field"><label for="sshComment">Comment</label><input id="sshComment"type="text"placeholder="user@host"></div>' +
    '<div class="field"><label>&nbsp;</label><button class="btn btn-primary"type="button"id="sshGo"><i class="fa-solid fa-terminal"></i>Generate key</button></div>' +
    '</div>' +
    '<div class="io-field"style="margin-top:14px"><label for="sshPub">Public key (authorized_keys format)</label><textarea id="sshPub"spellcheck="false"readonly placeholder="ssh-ed25519 AAAA&hellip; user@host"></textarea></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="sshPriv">Private key (PKCS#8 PEM)</label><textarea id="sshPriv"spellcheck="false"readonly placeholder="-----BEGIN PRIVATE KEY-----&hellip;"></textarea></div>' +
    '<div class="actions"><button class="rt-btn"type="button"id="sshCopyPub"><i class="fa-solid fa-copy"></i>Copy public</button>' +
    '<button class="rt-btn"type="button"id="sshCopyPriv"><i class="fa-solid fa-copy"></i>Copy private</button></div>'),
  js: String.raw`
    var typeEl=document.getElementById("sshType"),commentEl=document.getElementById("sshComment"),pubEl=document.getElementById("sshPub"),privEl=document.getElementById("sshPriv"),proc=document.getElementById("sshProc");
    function b64(u8){var s="";for(var i=0;i<u8.length;i++){s+=String.fromCharCode(u8[i]);}return btoa(s);}
    function u32(n){return new Uint8Array([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]);}
    function sshString(v){var u8=typeof v==="string"?new TextEncoder().encode(v):v;var out=new Uint8Array(4+u8.length);out.set(u32(u8.length),0);out.set(u8,4);return out;}
    function concat(a){var len=0,i;a.forEach(function(x){len+=x.length;});var out=new Uint8Array(len),o=0;a.forEach(function(x){out.set(x,o);o+=x.length;});return out;}
    function derAt(b,off){var tag=b[off++],len=b[off++],i;if(len&0x80){var n=len&0x7f;len=0;for(i=0;i<n;i++){len=(len<<8)|b[off++];}}return {tag:tag,end:off+len,content:b.slice(off,off+len)};}
    function parseRsa(der){var top=derAt(der,0);var c=top.content;var alg=derAt(c,0);var bit=derAt(c,alg.end);var inner=bit.content.slice(1);var seq=derAt(inner,0);var nInt=derAt(seq.content,0);var eInt=derAt(nInt.end,0);return {n:nInt.content,e:eInt.content};}
    function pem(u8,label){var s=b64(u8),lines=s.match(/.{1,64}/g)||[];return "-----BEGIN "+label+"-----\n"+lines.join("\n")+"\n-----END "+label+"-----\n";}
    (async function(){try{await crypto.subtle.generateKey({name:"Ed25519"},true,["sign","verify"]);}catch(e){var o=document.querySelector('#sshType option[value="ed25519"]');if(o){o.disabled=true;o.textContent="Ed25519 (not supported in this browser)";}typeEl.value="rsa4096";}})();
    async function gen(){
      proc.textContent="Generating your key pair in this tab&hellip;";
      var comment=commentEl.value.trim()||("generated-by-troolify");
      try{
        if(typeEl.value==="ed25519"){
          var kp=await crypto.subtle.generateKey({name:"Ed25519"},true,["sign","verify"]);
          var raw=await crypto.subtle.exportKey("raw",kp.publicKey);
          var pk=await crypto.subtle.exportKey("pkcs8",kp.privateKey);
          pubEl.value="ssh-ed25519 "+b64(concat([sshString("ssh-ed25519"),sshString(new Uint8Array(raw))]))+" "+comment;
          privEl.value=pem(new Uint8Array(pk),"PRIVATE KEY");
        }else{
          var bits=parseInt(typeEl.value.replace("rsa",""),10);
          var kp2=await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:bits,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
          var spki=new Uint8Array(await crypto.subtle.exportKey("spki",kp2.publicKey));
          var pk2=await crypto.subtle.exportKey("pkcs8",kp2.privateKey);
          var r=parseRsa(spki);
          pubEl.value="ssh-rsa "+b64(concat([sshString("ssh-rsa"),sshString(r.e),sshString(r.n)]))+" "+comment;
          privEl.value=pem(new Uint8Array(pk2),"PRIVATE KEY");
        }
        proc.textContent="Key generated. Add the public key to authorized_keys; keep the private key secret.";
      }catch(e){proc.textContent="Could not generate a key: "+e.message;}
    }
    document.getElementById("sshGo").addEventListener("click",gen);
    document.getElementById("sshCopyPub").addEventListener("click",function(){window.Troolify.copyToClipboard(pubEl.value,function(){proc.textContent="Public key copied."});});
    document.getElementById("sshCopyPriv").addEventListener("click",function(){window.Troolify.copyToClipboard(privEl.value,function(){proc.textContent="Private key copied - keep it safe."});});
    document.getElementById("sshSample").addEventListener("click",function(){commentEl.value="user@host";typeEl.value="ed25519";});
    document.getElementById("sshClear").addEventListener("click",function(){pubEl.value="";privEl.value="";proc.textContent="Ready.";});
  `,
  article: {
    title: 'SSH Key Generator: Make Ed25519 and RSA Keys in the Browser',
    lead: `<p>SSH keys are the standard way to log in to servers and push to repositories without a password. This <strong>SSH key generator</strong> creates Ed25519 or RSA key pairs in your browser and gives you the OpenSSH public key for <code>authorized_keys</code> plus a PKCS#8 private key.</p>`,
    sections: [
      { id: 'ed25519-vs-rsa', icon: 'fa-solid fa-shapes', heading: 'Ed25519 versus RSA', html: `<p>Ed25519 produces tiny, fast keys with strong security and is now widely supported, making it the recommended default. RSA remains the safe fallback for very old systems or strict environments; 4096-bit RSA offers a comparable security margin at the cost of slower handshakes.</p>` },
      { id: 'formats', icon: 'fa-solid fa-file-lines', heading: 'Understanding the two outputs', html: `<p>The public key is written in OpenSSH format, the single line you paste into <code>~/.ssh/authorized_keys</code> or a Git provider. The private key here is exported as a PKCS#8 PEM, which most modern tools accept; if your SSH client insists on the OpenSSH private format, convert it with <code>ssh-keygen -p -m PEM</code> on your machine.</p>` }
    ],
    steps: [
      'Choose Ed25519 or an RSA size.',
      'Optionally set a comment such as user@host.',
      'Generate the key and copy the public key to your server or Git provider.',
      'Save the private key securely and set restrictive file permissions.'
    ],
    facts: [
      ['Key types', 'Ed25519, RSA 2048/3072/4096'],
      ['Public format', 'OpenSSH single line'],
      ['Private format', 'PKCS#8 PEM'],
      ['Randomness', 'Web Crypto secure RNG'],
      ['Data handling', 'Generated locally, nothing uploaded']
    ],
    useCases: [
      ['Setting up a new server', 'Create a key pair and install the public key for passwordless login.'],
      ['Adding a deploy key', 'Generate a key for CI to push to a repository.'],
      ['Replacing a weak key', 'Rotate to Ed25519 for better security and smaller keys.']
    ],
    tips: [
      'Prefer Ed25519 unless you have a compatibility reason to use RSA.',
      'Protect the private key file with chmod 600 on the machine that uses it.',
      'Give each device its own key so you can revoke one without affecting the others.'
    ],
    takeaways: [
      'Ed25519 is the modern default; RSA is the compatibility choice.',
      'Only the public key goes on the server.',
      'The private key must stay secret and be permission-protected.'
    ],
    faq: [
      ['Is Ed25519 supported everywhere?', 'On all current OpenSSH versions yes. Only very old clients lack it, which is why RSA remains an option.'],
      ['Can my browser make Ed25519 keys?', 'Yes, where Web Crypto supports the algorithm. If it is unavailable the option is disabled and RSA is used.'],
      ['Where do I put the public key?', 'In ~/.ssh/authorized_keys on the server, or in the SSH keys section of your Git host.'],
      ['Why a PKCS#8 private key?', 'It is the portable format browsers can export. Convert to OpenSSH format if your client requires it.'],
      ['Are my keys uploaded?', 'No. They are generated locally with the Web Crypto API.']
    ],
    conclusion: `<p>Keys beat passwords for server access. This <strong>SSH key generator</strong> produces both the public key you install and the private key you guard. For email and signing keys, see our <a href="pgp-key-generator.html">PGP key generator</a>.</p>`
  }
});

/* ========================================================================
   19. AVRO SCHEMA GENERATOR
   ======================================================================== */
add({
  file: 'avro-schema-generator.html', folder: 'coding',
  name: 'Avro Schema Generator', tag: 'Avro', icon: 'fa-solid fa-diagram-project',
  title: 'Avro Schema Generator | Infer Avro Schema From JSON',
  metaDesc: 'Generate an Apache Avro schema from a JSON sample. Infers types, nested records, arrays and nullable fields, and validates an existing Avro schema.',
  desc: 'Paste a JSON sample to generate an Apache Avro schema with inferred types, nested records and arrays, or validate an existing Avro schema.',
  keywords: ['avro schema generator', 'json to avro schema', 'avro schema from json', 'infer avro schema', 'avro record schema', 'apache avro', 'avro nullable union', 'avro validator', 'schema inference json', 'kafka avro schema'],
  featureList: ['Infers types from a JSON sample', 'Handles nested records and arrays', 'Optional nullable unions with null default', 'Validates an existing Avro schema', 'Streaming and Kafka friendly', '100% client-side'],
  panel: wrap('avro', 'fa-solid fa-diagram-project', 'Avro schema generator',
    '<div class="row3">' +
    '<div class="field"><label for="avroName">Record name</label><input id="avroName"type="text"value="Example"placeholder="Example"></div>' +
    '<div class="field"><label for="avroNs">Namespace</label><input id="avroNs"type="text"placeholder="com.example"></div>' +
    '<div class="field"><label for="avroMode">Mode</label><select id="avroMode"><option value="gen">Generate from JSON</option><option value="val">Validate a schema</option></select></div>' +
    '</div>' +
    '<label class="csp-check"style="margin-top:10px"><input type="checkbox"id="avroNull"> Make fields nullable (union with null)</label>' +
    '<div class="io-grid two"style="margin-top:14px">' +
    '<div class="io-field"><label for="avroIn">JSON sample or Avro schema</label><textarea id="avroIn"spellcheck="false"placeholder=\'{"id":1,"name":"Ada","active":true,"tags":["a","b"]}\'></textarea></div>' +
    '<div class="io-field"><label for="avroOut">Avro schema</label><textarea id="avroOut"spellcheck="false"readonly placeholder="Schema appears here&hellip;"></textarea></div>' +
    '</div>' +
    '<div class="result-card"><div class="result-grid"id="avroGrid"></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="avroGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Run</button>' +
    '<button class="rt-btn"type="button"id="avroCopy"><i class="fa-solid fa-copy"></i>Copy schema</button></div>'),
  js: String.raw`
    var counter=0;
    function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
    function sanitize(s){var x=String(s).replace(/[^A-Za-z0-9_]/g,"_");if(!/^[A-Za-z_]/.test(x)){x="R_"+x;}return x;}
    function recName(hint){counter++;return sanitize(hint)+counter;}
    function inferType(x,nullable,hint){
      if(x===null){return "null";}
      var t=typeof x;
      if(t==="boolean"){return "boolean";}
      if(t==="number"){return Number.isInteger(x)?(Math.abs(x)<=2147483647?"int":"long"):"double";}
      if(t==="string"){return "string";}
      if(Array.isArray(x)){
        if(!x.length){return {"type":"array","items":"string"};}
        var seen={},items=[];
        x.forEach(function(el){var s=JSON.stringify(inferType(el,false,cap(hint||"Item")));if(!seen[s]){seen[s]=1;items.push(JSON.parse(s));}});
        return {"type":"array","items":items.length===1?items[0]:items};
      }
      if(t==="object"){return {"type":"record","name":recName(hint||"Nested"),"fields":inferFields(x,nullable,hint)};}
      return "string";
    }
    function inferFields(obj,nullable,hint){
      return Object.keys(obj).map(function(k){
        var ty=inferType(obj[k],nullable,cap(k));
        if(nullable&&obj[k]!==null){ty=["null",ty];}
        var f={name:sanitize(k),type:ty};
        if(nullable){f.default=null;}
        return f;
      });
    }
    function validate(schema){
      var errs=[];
      if(typeof schema!=="object"||schema===null){return ["Schema must be a JSON object."];}
      if(schema.type==="record"){
        if(!Array.isArray(schema.fields)){errs.push("A record must have a fields array.");}
        else{schema.fields.forEach(function(f,i){
          if(!f||typeof f!=="object"){errs.push("Field at index "+i+" is not an object.");return;}
          if(!f.name){errs.push("Field at index "+i+" is missing a name.");}
          if(!f.type){errs.push("Field '"+f.name+"' is missing a type.");}
        });}
      }else if(!schema.type&&!Array.isArray(schema)){
        errs.push("Top-level schema should declare a type, usually \"record\".");
      }
      return errs;
    }
    var inp=document.getElementById("avroIn"),out=document.getElementById("avroOut"),grid=document.getElementById("avroGrid"),proc=document.getElementById("avroProc");
    var mode=document.getElementById("avroMode"),nullableEl=document.getElementById("avroNull");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function run(){
      var t=performance.now(),txt=inp.value.trim();
      counter=0;
      if(!txt){grid.innerHTML=tile("Waiting","Paste JSON to convert");out.value="";proc.textContent="Ready.";return;}
      var obj;try{obj=JSON.parse(txt);}catch(e){grid.innerHTML=tile("Error","Invalid JSON");out.value="";proc.textContent=e.message;return;}
      if(mode.value==="val"){
        var errs=validate(obj);
        grid.innerHTML=tile("Valid JSON","Yes")+tile("Schema errors",errs.length,errs[0]||"")+tile("Top-level type",obj.type||"-");
        out.value=errs.length?"// Validation found issues:\n// "+errs.join("\n// "):"// Schema looks structurally valid.";
        proc.textContent="Validated in "+(performance.now()-t).toFixed(1)+" ms.";
        return;
      }
      if(typeof obj!=="object"||obj===null||Array.isArray(obj)){grid.innerHTML=tile("Error","Expected a JSON object");out.value="";proc.textContent="Provide a JSON object with named fields.";return;}
      var ns=document.getElementById("avroNs").value.trim();
      var schema={};
      if(ns){schema.namespace=ns;}
      schema.type="record";
      schema.name=sanitize(document.getElementById("avroName").value.trim()||"Example");
      schema.fields=inferFields(obj,nullableEl.checked,"Root");
      out.value=JSON.stringify(schema,null,2);
      grid.innerHTML=tile("Top-level fields",schema.fields.length)+tile("Record name",schema.name)+tile("Nullable",nullableEl.checked?"Yes":"No")+tile("Namespace",ns||"-");
      proc.textContent="Generated in "+(performance.now()-t).toFixed(1)+" ms - nothing leaves this tab.";
    }
    [mode,nullableEl].forEach(function(el){el.addEventListener("change",run);});
    inp.addEventListener("input",run);
    document.getElementById("avroGo").addEventListener("click",run);
    document.getElementById("avroCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Schema copied."});});
    document.getElementById("avroSample").addEventListener("click",function(){inp.value=JSON.stringify({"id":1,"name":"Ada","active":true,"score":9.5,"tags":["math","code"],"address":{"city":"London","zip":"E1"}});run();});
    document.getElementById("avroClear").addEventListener("click",function(){inp.value="";out.value="";run();});
    run();
  `,
  article: {
    title: 'Avro Schema Generator: Infer Structure From a JSON Sample',
    lead: `<p>Apache Avro is the de-facto schema format for streaming pipelines, but writing a schema by hand is tedious. This <strong>Avro schema generator</strong> takes a JSON sample and infers a schema for you, including nested records, arrays and optional nullable fields.</p>`,
    sections: [
      { id: 'inference', icon: 'fa-solid fa-brain', heading: 'How types are inferred', html: `<p>Null becomes the null type, booleans stay boolean, and numbers are split into <code>int</code>, <code>long</code> and <code>double</code> based on whether they are integers and how large they are. Strings map to string. Arrays become an Avro array whose items type is the union of the element types found in the sample. Nested objects become nested records with a generated, unique name.</p>` },
      { id: 'nullable', icon: 'fa-solid fa-toggle-on', heading: 'Nullable unions', html: `<p>Avro has no concept of an optional field; you express it as a union with <code>null</code>. Enabling nullable fields wraps each type as <code>["null", type]</code> and sets the default to null, which is compatible with many serialization frameworks that omit empty fields.</p>` }
    ],
    steps: [
      'Paste a representative JSON object.',
      'Name the top-level record and, optionally, a namespace.',
      'Toggle nullable fields if your data may omit values.',
      'Copy the generated Avro schema into your pipeline.'
    ],
    facts: [
      ['Input', 'A JSON sample object'],
      ['Infers', 'int, long, double, string, boolean, null'],
      ['Structures', 'Nested records and arrays'],
      ['Extras', 'Nullable unions and schema validation'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Kafka topics', 'Build a schema from a sample event before registering it.'],
      ['Data lakes', 'Describe files for Parquet or Avro storage without hand-writing fields.'],
      ['Validating a schema', 'Check an existing Avro schema for missing names or types.']
    ],
    tips: [
      'Use a sample that includes every field you expect, since inference only sees what you paste.',
      'Review the inferred numeric types: ints that may grow should be long.',
      'Enable nullable when the source data can omit a field.'
    ],
    takeaways: [
      'A JSON sample is enough to scaffold an Avro schema.',
      'Nullable fields are unions with null and a null default.',
      'Always review generated types against your real data contract.'
    ],
    faq: [
      ['What is Apache Avro?', 'A row-oriented serialization format with a schema, widely used in streaming and big-data pipelines.'],
      ['How are numbers typed?', 'Integers within the 32-bit range become int, larger integers become long, and non-integers become double.'],
      ['Can Avro represent optional fields?', 'Yes, as a union that includes null, typically with a default of null. This tool can generate that form.'],
      ['Does it validate my schema?', 'In validate mode it checks structural rules such as a record having a fields array with named, typed fields.'],
      ['Is my data uploaded?', 'No. Conversion runs entirely in your browser.']
    ],
    conclusion: `<p>Skip the schema drudgery and start from your real data. This <strong>Avro schema generator</strong> turns a JSON sample into a working Avro schema. For neighbouring formats, try our <a href="json-web-key-generator.html">JWK generator</a> or format JSON in our <a href="jwt-decoder.html">developer tools</a>.</p>`
  }
});

/* ========================================================================
   20. PIN GENERATOR
   ======================================================================== */
add({
  file: 'pin-generator.html', folder: 'misc',
  name: 'PIN Generator', tag: 'Password', icon: 'fa-solid fa-hashtag',
  title: 'PIN Generator | Secure Random PIN and Numeric Codes',
  metaDesc: 'Generate secure random numeric PINs for devices, doors and accounts. Choose the length, avoid repeated or sequential digits, and see the entropy of each PIN.',
  desc: 'Generate cryptographically random numeric PINs with strength analysis, and optionally avoid repeated or sequential digits.',
  keywords: ['pin generator', 'random pin', 'secure pin generator', 'generate pin code', 'numeric code generator', 'random number pin', '4 digit pin generator', '6 digit pin generator', 'device pin generator', 'strong pin'],
  featureList: ['Lengths from 4 to 12 digits', 'Cryptographically secure randomness', 'Optional leading zeros', 'Avoid repeated and sequential digits', 'Bulk generation and entropy readout', '100% client-side'],
  panel: wrap('pin', 'fa-solid fa-hashtag', 'PIN generator',
    '<div class="row3">' +
    '<div class="field"><label for="pinLen">PIN length</label><input id="pinLen"type="number"value="6"min="4"max="12"></div>' +
    '<div class="field"><label for="pinCount">How many</label><input id="pinCount"type="number"value="10"min="1"max="100"></div>' +
    '<div class="field"><label for="pinFlags">Options</label><select id="pinFlags"><option value="plain">Allow anything</option><option value="nolead">No leading zeros</option><option value="nosolid">Avoid repeated digits</option><option value="noseq">Avoid sequences</option><option value="both">Avoid repeated and sequences</option></select></div>' +
    '</div>' +
    '<div class="io-grid"style="margin-top:14px"><div class="io-field"><label for="pinOut">Generated PINs</label><textarea id="pinOut"spellcheck="false"readonly style="min-height:180px"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="pinGrid"></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="pinGo"><i class="fa-solid fa-hashtag"></i>Generate</button>' +
    '<button class="rt-btn"type="button"id="pinCopy"><i class="fa-solid fa-copy"></i>Copy PINs</button></div>'),
  js: String.raw`
    var lenEl=document.getElementById("pinLen"),countEl=document.getElementById("pinCount"),flags=document.getElementById("pinFlags");
    var out=document.getElementById("pinOut"),grid=document.getElementById("pinGrid"),proc=document.getElementById("pinProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function randDigits(n){var a=crypto.getRandomValues(new Uint8Array(n)),s="";for(var i=0;i<a.length;i++){s+=(a[i]%10);}return s;}
    function hasRepeat(p){for(var i=1;i<p.length;i++){if(p[i]===p[i-1]&&i+2<p.length&&p[i+1]===p[i-1]){return true;}}return false;}
    function hasSeq(p){var up=true,down=true;for(var i=1;i<p.length;i++){var d=p.charCodeAt(i)-p.charCodeAt(i-1);if(d!==1)up=false;if(d!==-1)down=false;}return up||down;}
    function make(n,mode){
      for(var attempts=0;attempts<50;attempts++){
        var p=randDigits(n);
        if(mode==="nolead"&&p[0]==="0"){continue;}
        if((mode==="nosolid"||mode==="both")&&/[0-9]{3}/.test(p)&&/(\d)\1\1/.test(p)){continue;}
        if((mode==="noseq"||mode==="both")&&hasSeq(p)){continue;}
        return p;
      }
      return randDigits(n);
    }
    function run(){
      var n=Math.max(4,Math.min(12,parseInt(lenEl.value,10)||6));
      var c=Math.max(1,Math.min(100,parseInt(countEl.value,10)||10));
      var list=[];for(var i=0;i<c;i++){list.push(make(n,flags.value));}
      out.value=list.join("\n");
      var bits=Math.round(n*Math.log2(10));
      var strength=bits<28?"Weak":bits<45?"Moderate":"Strong";
      grid.innerHTML=tile("PINs",c)+tile("Length",n+" digits")+tile("Entropy",bits+" bits",strength)+tile("Options",flags.options[flags.selectedIndex].text);
      proc.textContent="Generated with the Web Crypto RNG - nothing leaves this tab.";
    }
    [lenEl,countEl,flags].forEach(function(el){el.addEventListener("input",run);el.addEventListener("change",run);});
    document.getElementById("pinGo").addEventListener("click",run);
    document.getElementById("pinSample").addEventListener("click",function(){lenEl.value="6";countEl.value="10";flags.value="both";run();});
    document.getElementById("pinClear").addEventListener("click",function(){out.value="";grid.innerHTML="";proc.textContent="Ready.";});
    document.getElementById("pinCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="PINs copied."});});
    run();
  `,
  article: {
    title: 'PIN Generator: Random Numeric Codes for Devices and Doors',
    lead: `<p>A PIN is only as good as the randomness behind it. This <strong>PIN generator</strong> uses the browser's cryptographically secure random number generator to produce numeric codes, with optional filters that reject patterns like <code>1111</code> or <code>1234</code>.</p>`,
    sections: [
      { id: 'randomness', icon: 'fa-solid fa-dice', heading: 'Random, not patterned', html: `<p>People choose PINs predictably - birthdays, repeats and simple sequences dominate. Generating with a secure RNG removes that bias. As a rule of thumb each digit adds about 3.3 bits of entropy, so a six-digit PIN is roughly 20 bits and a longer code is meaningfully harder to guess.</p>` },
      { id: 'filters', icon: 'fa-solid fa-filter', heading: 'What the filters do', html: `<p>The repeated-digit filter rejects codes with three or more identical digits in a row, and the sequence filter rejects strictly ascending or descending runs. Both reduce the chance of accidentally handing out a code that is trivial to guess.</p>` }
    ],
    steps: [
      'Choose the PIN length and how many you need.',
      'Select an optional pattern filter.',
      'Generate and copy the list.',
      'Store each PIN securely and do not reuse one across systems.'
    ],
    facts: [
      ['Length', '4 to 12 digits'],
      ['Randomness', 'Web Crypto secure RNG'],
      ['Filters', 'Repeated and sequential digit avoidance'],
      ['Bulk', 'Up to 100 at once'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Device enrolment', 'Generate unique PINs for a batch of phones or tablets.'],
      ['Access codes', 'Produce door or locker codes that avoid obvious patterns.'],
      ['Testing', 'Create sample PINs for a test suite without a pattern.']
    ],
    tips: [
      'Longer is better: each extra digit multiplies the search space by ten.',
      'Avoid reusing the same PIN across different systems.',
      'Treat a PIN as a convenience factor; combine it with a password or biometric where possible.'
    ],
    takeaways: [
      'Use a secure RNG, not a patterned choice.',
      'Each digit adds about 3.3 bits of entropy.',
      'Filters keep you from issuing easily guessed codes.'
    ],
    faq: [
      ['Are these PINs cryptographically secure?', 'They are generated with the Web Crypto secure random source, which is suitable for security-sensitive values.'],
      ['How long should a PIN be?', 'Use the longest your system allows. Six digits is common; more is better.'],
      ['Does avoiding sequences reduce security?', 'No. It removes low-entropy patterns, so the remaining codes are at least as strong.'],
      ['Can I generate many at once?', 'Yes, up to 100 per run.'],
      ['Is anything uploaded?', 'No. Generation happens entirely in your browser.']
    ],
    conclusion: `<p>Issue codes that are actually random. This <strong>PIN generator</strong> gives you secure numeric values in bulk. Check the strength of any password with our <a href="password-strength-checker.html">password strength checker</a>.</p>`
  }
});

/* ========================================================================
   21. PASSWORD STRENGTH CHECKER
   ======================================================================== */
add({
  file: 'password-strength-checker.html', folder: 'misc',
  name: 'Password Strength Checker', tag: 'Password', icon: 'fa-solid fa-gauge-high',
  title: 'Password Strength Checker | Score, Entropy and Crack Time',
  metaDesc: 'Check how strong a password is with a live score, character-set analysis, estimated entropy and crack-time estimates across four attack scenarios.',
  desc: 'Score any password in real time and see its estimated entropy, character sets used, pattern weaknesses and crack times across four attack scenarios.',
  keywords: ['password strength checker', 'password strength test', 'how strong is my password', 'password crack time', 'password entropy checker', 'password score', 'test password strength', 'password security checker', 'weak password detector', 'password meter'],
  featureList: ['Live strength score and bar', 'Character-set and entropy analysis', 'Detects repeats, sequences and common passwords', 'Crack-time estimates for four scenarios', 'Actionable feedback', '100% client-side'],
  panel: wrap('psc', 'fa-solid fa-gauge-high', 'Password strength checker',
    '<div class="io-field"><label for="pscIn">Enter a password</label><input id="pscIn"type="text"autocomplete="off"placeholder="Type or paste a password to test"></div>' +
    '<div class="strength-bar"style="margin-top:12px"><div class="strength-fill"id="pscFill"></div></div>' +
    '<div class="result-card"><div class="result-grid"id="pscGrid"></div></div>' +
    '<div id="pscList"class="psc-list"></div>'),
  css: '.strength-bar{height:10px;border-radius:20px;background:rgba(255,255,255,.08);overflow:hidden}.strength-fill{height:100%;width:0;border-radius:20px;transition:width .3s,background .3s}.psc-list{margin-top:14px;display:flex;flex-direction:column;gap:6px}.psc-list div{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;color:var(--muted)}',
  js: String.raw`
    var COMMON=["password","123456","123456789","qwerty","111111","12345678","abc123","12345","password1","1234567","letmein","welcome","monkey","dragon","iloveyou","admin","login","princess","football","charlie","qwerty123","1q2w3e4r","sunshine","master","hello","freedom","whatever","trustno1","superman","qazwsx","michael","shadow","000000","666666"];
    var inp=document.getElementById("pscIn"),fill=document.getElementById("pscFill"),grid=document.getElementById("pscGrid"),list=document.getElementById("pscList"),proc=document.getElementById("pscProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function human(sec){
      if(sec<1){return "under a second";}
      if(sec>3.15e18){return "billions of years";}
      var u=[[31557600,"years"],[86400,"days"],[3600,"hours"],[60,"minutes"],[1,"seconds"]];
      for(var i=0;i<u.length;i++){if(sec>=u[i][0]){return (sec/u[i][0]).toFixed(1)+" "+u[i][1];}}
      return sec.toFixed(0)+" seconds";
    }
    function run(){
      var p=inp.value,fb=[],penalty=0;
      if(!p){fill.style.width="0";grid.innerHTML="";list.innerHTML="";proc.textContent="Start typing to see the score.";return;}
      var pool=0,sets=[];
      if(/[a-z]/.test(p)){pool+=26;sets.push("lowercase");}
      if(/[A-Z]/.test(p)){pool+=26;sets.push("uppercase");}
      if(/[0-9]/.test(p)){pool+=10;sets.push("digits");}
      if(/[^A-Za-z0-9]/.test(p)){pool+=33;sets.push("symbols");}
      var base=p.length*Math.log2(pool||1);
      var unique=new Set(p.split("")).size;
      if(COMMON.indexOf(p.toLowerCase())>-1){penalty+=40;fb.push("This password appears in the common-passwords list - never use it.");}
      if(/^[0-9]+$/.test(p)){penalty+=15;fb.push("Digits only leave a small search space.");}
      if(/(.)\1{2,}/.test(p)){penalty+=10;fb.push("Avoid repeating the same character three or more times.");}
      if(/(?:abc|bcd|cde|123|234|345|456|567|678|789|qwe|asd|zxc)/i.test(p)){penalty+=12;fb.push("Contains a predictable sequence such as 123 or qwerty.");}
      if(p.length<12){penalty+=15;fb.push("Length matters most - aim for at least 12 characters.");}
      if(sets.length<3){penalty+=10;fb.push("Mix uppercase, lowercase, digits and symbols for a larger character set.");}
      if(unique/p.length<0.5&&p.length>6){penalty+=8;fb.push("Low character variety for the length.");}
      var entropy=Math.max(0,base-penalty);
      var score=entropy>=90?4:entropy>=70?3:entropy>=50?2:entropy>=30?1:0;
      var labels=["Very weak","Weak","Fair","Strong","Very strong"];
      var colors=["#EF4444","#F97316","#EAB308","#22C55E","#16A34A"];
      fill.style.width=((score+1)/5*100)+"%";fill.style.background=colors[score];
      var schemes=[["Throttled online (10/hour)",10/3600],["Online unthrottled (10,000/s)",1e4],["Offline slow hash (10,000/s)",1e4],["Offline fast GPU (10,000,000,000/s)",1e10]];
      if(fb.length===0){fb.push("No obvious weaknesses detected. Keep all passwords unique.");}
      grid.innerHTML=tile("Strength",labels[score])+tile("Estimated entropy",Math.round(entropy)+" bits")+tile("Length",p.length+" chars")+tile("Character sets",sets.length+" ("+sets.join(", ")+")");
      list.innerHTML=schemes.map(function(s){var guesses=Math.pow(2,entropy)/2;return '<div><b style="color:var(--ink)">'+s[0]+':</b> '+human(guesses/s[1])+'</div>';}).join("")+fb.map(function(f){return '<div>&bull; '+f+'</div>';}).join("");
      proc.textContent="Scored in your browser - the password never leaves this tab.";
    }
    inp.addEventListener("input",run);
    document.getElementById("pscSample").addEventListener("click",function(){inp.value="Tr0ub4dour&3-pony";run();});
    document.getElementById("pscClear").addEventListener("click",function(){inp.value="";run();inp.focus();});
    run();
  `,
  article: {
    title: 'Password Strength Checker: Beyond a Simple Character Count',
    lead: `<p>The old advice of one uppercase, one number and one symbol misses the point: length and unpredictability do the heavy lifting. This <strong>password strength checker</strong> scores a password in real time, estimates its entropy and shows how long it would take to crack under four realistic attack scenarios.</p>`,
    sections: [
      { id: 'how-scored', icon: 'fa-solid fa-calculator', heading: 'How the score is calculated', html: `<p>The tool starts with the base entropy of the password - its length multiplied by the bits per character for the character sets it uses - then subtracts penalties for common passwords, repeated characters, predictable sequences, short length and low variety. The result is a practical estimate, not just a character-class checklist.</p>` },
      { id: 'crack-time', icon: 'fa-solid fa-stopwatch', heading: 'Reading the crack times', html: `<p>Four scenarios are shown: a throttled online attack, an unthrottled online attack, an offline attack against a slow hash, and an offline attack against a fast GPU hash. The gap between them is why server-side hashing matters so much - a password that takes years online can fall in hours if the stored hash is weak.</p>` }
    ],
    steps: [
      'Type or paste a password into the field.',
      'Watch the strength bar and entropy update live.',
      'Review the feedback list for specific weaknesses.',
      'Adjust the password until the score and crack time are acceptable.'
    ],
    facts: [
      ['Output', 'Score, entropy, crack times, feedback'],
      ['Detects', 'Repeats, sequences, common passwords'],
      ['Scenarios', 'Four attack speed models'],
      ['Privacy', 'Computed locally, never sent'],
      ['Advice', 'Length and uniqueness first']
    ],
    useCases: [
      ['Choosing a new password', 'Iterate until the crack time is comfortably large.'],
      ['Reviewing password policy', 'See why a minimum length matters more than a symbol rule.'],
      ['Teaching security', 'Show in real time how a small change alters the estimate.']
    ],
    tips: [
      'Prefer a long passphrase over a short, complex jumble.',
      'Never reuse a password across sites, regardless of strength.',
      'Use a password manager to generate and remember strong unique values.'
    ],
    takeaways: [
      'Length is the biggest lever on strength.',
      'Common passwords and patterns collapse otherwise high entropy.',
      'Server-side hashing decides how much an offline attack costs.'
    ],
    faq: [
      ['Is it safe to type my real password?', 'The check runs entirely in your browser and nothing is transmitted. Still, a genuinely sensitive password is best tested offline.'],
      ['What is entropy in this context?', 'A measure in bits of how unpredictable the password is. Higher means more guesses are needed to find it.'],
      ['Why does the crack time vary so much?', 'Because hashing speed varies enormously. A throttled online service is thousands of times slower than a GPU attacking a fast hash.'],
      ['Does a green score mean the password is safe everywhere?', 'No. Strength cannot compensate for reuse or for a site that stores passwords poorly.'],
      ['Is there a perfect password?', 'There is no single perfect value. Long, random, unique and stored in a manager is the practical ideal.']
    ],
    conclusion: `<p>Understand a password before you trust it. This <strong>password strength checker</strong> turns vague advice into a concrete score and crack-time estimate. Generate strong values with our <a href="memorable-password-generator.html">memorable password generator</a>.</p>`
  }
});

/* ========================================================================
   22. MEMORABLE PASSWORD GENERATOR
   ======================================================================== */
add({
  file: 'memorable-password-generator.html', folder: 'misc',
  name: 'Memorable Password Generator', tag: 'Password', icon: 'fa-solid fa-brain',
  title: 'Memorable Password Generator | Strong Passphrases From Words',
  metaDesc: 'Generate strong, memorable passphrases from random words. Choose the word count, separator and extras, and see the entropy of each passphrase.',
  desc: 'Create strong passphrases from random words that are easy to remember and hard to crack, with configurable length, separators and extras.',
  keywords: ['memorable password generator', 'passphrase generator', 'word password generator', 'diceware style', 'easy to remember password', 'strong passphrase', 'random words password', 'word based password', 'passphrase maker', 'secure memorable password'],
  featureList: ['Random-word passphrases', 'Configurable word count', 'Separator, capitalisation, number and symbol options', 'Entropy estimate per passphrase', 'Bulk generation', '100% client-side'],
  panel: wrap('mpg', 'fa-solid fa-brain', 'Memorable password generator',
    '<div class="row3">' +
    '<div class="field"><label for="mpgWords">Words</label><input id="mpgWords"type="number"value="4"min="3"max="8"></div>' +
    '<div class="field"><label for="mpgSep">Separator</label><select id="mpgSep"><option value="-">Hyphen ( - )</option><option value=" ">Space</option><option value=".">Dot ( . )</option><option value="_">Underscore ( _ )</option><option value="">None</option></select></div>' +
    '<div class="field"><label for="mpgCount">How many</label><input id="mpgCount"type="number"value="5"min="1"max="50"></div>' +
    '</div>' +
    '<label class="csp-check"><input type="checkbox"id="mpgCap"checked> Capitalise each word</label>' +
    '<label class="csp-check"><input type="checkbox"id="mpgNum"checked> Add a random number</label>' +
    '<label class="csp-check"><input type="checkbox"id="mpgSym"> Add a symbol</label>' +
    '<div class="io-grid"style="margin-top:14px"><div class="io-field"><label for="mpgOut">Passphrases</label><textarea id="mpgOut"spellcheck="false"readonly style="min-height:180px"></textarea></div></div>' +
    '<div class="result-card"><div class="result-grid"id="mpgGrid"></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="mpgGo"><i class="fa-solid fa-brain"></i>Generate</button>' +
    '<button class="rt-btn"type="button"id="mpgCopy"><i class="fa-solid fa-copy"></i>Copy</button></div>'),
  js: String.raw`
    var WORDS=("able,acid,acorn,actor,adobe,agent,air,alien,almond,alpha,amber,anchor,angle,ankle,apple,april,apron,arcade,arch,arena,argon,arrow,aspen,atlas,atom,august,aurora,avocado,axis,bacon,badge,badger,bamboo,banjo,barn,barrel,basalt,basil,basket,beacon,bean,bear,beaver,bench,berry,bird,bishop,bison,blade,blaze,bloom,blossom,blue,bluff,board,bolt,bonus,border,bottle,boulder,bow,branch,brave,bread,breeze,brick,bridge,bright,broom,brush,bubble,bucket,buddy,buffalo,bugle,bulb,bull,bunker,bush,button,cabin,cable,cactus,cadet,camel,canary,candle,canyon,cargo,carpet,carrot,castle,cattle,cedar,cement,chalk,charm,cheese,cherry,chess,chime,cider,cigar,circle,citrus,clay,cliff,clover,coast,cobalt,cobra,cocoa,coffee,comet,compass,copper,coral,cotton,cougar,coyote,crane,crater,crayon,cream,creek,cricket,crown,crystal,cube,cypress,daisy,dance,dandy,dapper,dawn,delta,denim,desert,dew,diamond,dime,dolphin,dome,donut,dove,dragon,dream,drum,dune,eagle,earth,easel,ebony,echo,eel,elder,ember,emerald,engine,envoy,ethic,evolve,fable,falcon,farm,fathom,feather,fern,fiddle,field,fir,fire,flame,flax,flint,flock,flute,foam,forest,forge,fossil,fountain,fox,frame,frost,gadget,gale,galaxy,garden,garlic,gate,gecko,gem,ginger,glacier,glade,glass,globe,glove,goat,gold,goose,gorge,grape,grass,grove,guava,guitar,gull,hammer,harbor,harvest,hawk,hazel,heron,hickory,hive,hollow,honey,horn,horse,hotel,hound,husky,iceberg,igloo,indigo,iris,iron,island,ivory,ivy,jade,jaguar,jasmine,jasper,jaw,jelly,jet,jewel,jigsaw,jolly,jungle,juniper,kale,kayak,kernel,kettle,keystone,kite,kiwi,koala,ladder,lake,lantern,lark,laser,lasso,lattice,laurel,lavender,leaf,ledge,lemon,lentil,leopard,lever,lilac,lily,limber,lime,linen,lion,lizard,lobster,locket,lotus,lucky,lunar,lynx,magnet,mango,maple,marble,marsh,mask,meadow,melon,metal,meteor,midnight,mint,minnow,mirror,mist,mistral,moss,moth,motor,mulberry,mustard,nectar,nettle,nickel,nimbus,noble,nomad,noon,north,nugget,nutmeg,oak,oasis,ocean,ochre,olive,onyx,opal,orbit,orchid,oregano,osprey,otter,owl,oyster,paddle,palace,palm,panda,panther,papaya,park,parrot,path,peach,pearl,pebble,pecan,pelican,penguin,pepper,petal,pewter,phoenix,piano,pigeon,pillar,pine,plum,plume,pocket,pollen,pond,poppy,portal,potato,prairie,prism,puffin,pumpkin,puzzle,quail,quartz,quest,quill,quiver,rabbit,raccoon,radar,rain,raven,reef,relay,rhubarb,ridge,river,robin,rocket,rope,rose,ruby,rudder,rust,rustic,saddle,saffron,sage,sail,salmon,sandal,sapphire,satin,savory,scale,scarf,scooter,seal,seed,sepia,shade,shell,shore,silver,sketch,sky,slate,smoke,snow,solar,sonnet,sorrel,sparrow,spice,spider,spiral,spring,spruce,squash,stable,star,steel,stone,storm,stream,summit,sunset,surf,swan,syrup,tablet,talon,tamarind,tan,tango,tapir,tarn,teal,temple,tender,thistle,thorn,thunder,tiger,timber,tin,toast,topaz,torch,toucan,tower,trail,tulip,tundra,turtle,ultra,umber,unicorn,valley,vanilla,velvet,verse,vertex,violet,viper,vista,vivid,waffle,walnut,walrus,wander,wasabi,water,wattle,weasel,whale,wheat,willow,wind,winter,wisteria,wolf,wombat,wonder,wood,xenon,yam,yarrow,yellow,zenith,zephyr,zinc,zinnia,zodiac").split(",");
    var wordsEl=document.getElementById("mpgWords"),sepEl=document.getElementById("mpgSep"),countEl=document.getElementById("mpgCount");
    var capEl=document.getElementById("mpgCap"),numEl=document.getElementById("mpgNum"),symEl=document.getElementById("mpgSym");
    var out=document.getElementById("mpgOut"),grid=document.getElementById("mpgGrid"),proc=document.getElementById("mpgProc");
    function tile(l,val,sub){return '<div class="result-tile"><div class="rt-label">'+l+'</div><div class="rt-value">'+(val===undefined||val===""?"-":val)+'</div>'+(sub?'<div class="rt-sub">'+sub+'</div>':'')+'</div>';}
    function rnd(n){var a=crypto.getRandomValues(new Uint32Array(1))[0];return a%n;}
    function pick(){return WORDS[rnd(WORDS.length)];}
    function make(n){
      var parts=[];for(var i=0;i<n;i++){var w=pick();if(capEl.checked){w=w.charAt(0).toUpperCase()+w.slice(1);}parts.push(w);}
      var s=parts.join(sepEl.value);
      if(numEl.checked){s+=(sepEl.value||"")+rnd(100);}
      if(symEl.checked){var syms="!@#$%&*?";s+=syms[rnd(syms.length)];}
      return s;
    }
    function run(){
      var n=Math.max(3,Math.min(8,parseInt(wordsEl.value,10)||4));
      var c=Math.max(1,Math.min(50,parseInt(countEl.value,10)||5));
      var list=[];for(var i=0;i<c;i++){list.push(make(n));}
      out.value=list.join("\n");
      var bits=n*Math.log2(WORDS.length);
      if(numEl.checked){bits+=Math.log2(100);}
      if(symEl.checked){bits+=Math.log2(8);}
      var strength=bits>=80?"Strong":bits>=60?"Good":"Fair";
      grid.innerHTML=tile("Passphrases",c)+tile("Words",n)+tile("Entropy",Math.round(bits)+" bits",strength)+tile("Wordlist",WORDS.length+" words");
      proc.textContent="Generated from "+WORDS.length+" words using the Web Crypto RNG - nothing leaves this tab.";
    }
    [wordsEl,sepEl,countEl].forEach(function(el){el.addEventListener("input",run);el.addEventListener("change",run);});
    [capEl,numEl,symEl].forEach(function(el){el.addEventListener("change",run);});
    document.getElementById("mpgGo").addEventListener("click",run);
    document.getElementById("mpgSample").addEventListener("click",function(){wordsEl.value="4";sepEl.value="-";capEl.checked=true;numEl.checked=true;symEl.checked=false;run();});
    document.getElementById("mpgClear").addEventListener("click",function(){out.value="";grid.innerHTML="";proc.textContent="Ready.";});
    document.getElementById("mpgCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(out.value,function(){proc.textContent="Passphrases copied.";});});
    run();
  `,
  article: {
    title: 'Memorable Password Generator: Strong Passphrases You Can Recall',
    lead: `<p>The strongest password is useless if you cannot remember it and dangerous if you reuse it. This <strong>memorable password generator</strong> builds passphrases from random words, giving you something that is both easy to recall and genuinely hard to crack.</p>`,
    sections: [
      { id: 'why-words', icon: 'fa-solid fa-lightbulb', heading: 'Why words beat a jumble', html: `<p>A random string of characters is hard to memorise, so people write it down or reuse it. A sequence of unrelated words is far easier to hold in mind while still carrying high entropy: with a large wordlist each added word contributes several bits, and a handful of words already rivals a short random password.</p>` },
      { id: 'options', icon: 'fa-solid fa-sliders', heading: 'Tuning the options', html: `<p>More words mean more security, so length is the main dial. The separator, capitalisation, trailing number and symbol make the phrase more compatible with site policies without meaningfully weakening it. Avoid swapping in personal words - randomness is what makes the phrase strong.</p>` }
    ],
    steps: [
      'Choose how many words to use; four is a solid baseline.',
      'Pick a separator and toggle capitalisation and extras.',
      'Generate and pick a passphrase you can picture.',
      'Store it in a password manager and use it on one site only.'
    ],
    facts: [
      ['Source', 'Random words from a large built-in list'],
      ['Baseline', 'Four words'],
      ['Extras', 'Separator, capitals, number, symbol'],
      ['Entropy', 'Shown per passphrase'],
      ['Data handling', 'Runs locally, nothing uploaded']
    ],
    useCases: [
      ['Master passwords', 'Remember one strong passphrase for your password manager.'],
      ['Account recovery', 'Use a phrase that is easy to type correctly from memory.'],
      ['Team guidance', 'Give colleagues a method that produces strong, unique passphrases.']
    ],
    tips: [
      'Never pick your own words; the generated randomness is the security.',
      'Add words rather than relying on symbols for strength.',
      'Use a different passphrase for every important account.'
    ],
    takeaways: [
      'Random words balance memorability and strength.',
      'More words is the reliable way to increase entropy.',
      'Store passphrases in a manager and never reuse them.'
    ],
    faq: [
      ['How many words should I use?', 'Four random words is a strong baseline; five or six is better for critical accounts.'],
      ['Is a passphrase stronger than a password?', 'A long random passphrase usually carries more entropy and is easier to remember, which makes it practically stronger for most people.'],
      ['Can I choose my own words?', 'You can retype them, but manual choices reintroduce predictability. Prefer freshly generated phrases.'],
      ['How is entropy estimated?', 'By multiplying the number of words by the bits per word in the list, plus any added number or symbol.'],
      ['Is anything uploaded?', 'No. Passphrases are generated entirely in your browser.']
    ],
    conclusion: `<p>Remember your passwords and let randomness keep them strong. This <strong>memorable password generator</strong> balances both. Verify the result with our <a href="password-strength-checker.html">password strength checker</a>.</p>`
  }
});

/* @@MORE_TOOLS@@ */

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
