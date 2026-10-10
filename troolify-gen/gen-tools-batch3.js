/* ============================================================================
   Troolify - it-tools migration, batch 3
   Auth/security + IP/network tools.
   Run: node troolify-gen/gen-tools-batch3.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ---- small shared output textarea snippet ---- */
function outArea(id, label, hint) {
  return '<div class="result-card"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">' + label + '</span>' +
    '<textarea id="' + id + '"readonly spellcheck="false"style="min-height:110px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;margin-top:6px"aria-label="' + (hint || label) + '"placeholder="Output appears here"></textarea></div></div></div>';
}

/* ========================================================================
   1. BASIC AUTH GENERATOR
   ======================================================================== */
add({
  file: 'basic-auth-generator.html', folder: 'coding',
  name: 'Basic Auth Generator', tag: 'Auth', icon: 'fa-solid fa-shield-halved',
  title: 'Basic Auth Generator | Create an Authorization Header',
  metaDesc: 'Generate a Basic Authorization header instantly from a username and password. RFC 7617 compliant, UTF-8 safe, fully offline.',
  desc: 'Turn a username and password into a ready-to-use HTTP Basic Authorization header value, right in your browser.',
  keywords: ['basic auth generator', 'basic authentication header', 'authorization header', 'base64 basic auth', 'http basic auth', 'basic auth token', 'encoder basic auth', 'curl basic auth', 'api authentication', 'basic auth credentials'],
  featureList: ['Basic auth header generation', 'UTF-8 safe base64', 'RFC 7617 format', 'curl example included', 'One-click copy', '100% client-side'],
  panel: panel.wrap('ba', 'fa-solid fa-shield-halved', 'Basic auth header',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="baUser">Username</label><input id="baUser"type="text"spellcheck="false"autocomplete="off"placeholder="user@example.com"></div>' +
    '<div class="field"><label for="baPass">Password</label><input id="baPass"type="text"spellcheck="false"autocomplete="off"placeholder="hunter2"></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="baGo"><i class="fa-solid fa-key"></i>Generate header</button>' +
    '<button class="rt-btn"type="button"id="baCopy"><i class="fa-solid fa-copy"></i>Copy header</button></div>' +
    '<div class="field"style="margin:12px 0"><label for="baOut">Authorization header value</label><input id="baOut"readonly type="text"spellcheck="false"style="width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px 12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px"></div>' +
    '<div class="field"style="margin:12px 0"><label for="baCurl">curl example</label><input id="baCurl"readonly type="text"spellcheck="false"style="width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px 12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px"></div>'),
  css: '',
  js: `
    var CH="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function toB64(u){var s="";for(var i=0;i<u.length;i+=3){var a=u[i],b=u[i+1],c=u[i+2];s+=CH[a>>2]+CH[((a&3)<<4)|((b==null?0:b)>>4)]+(i+1<u.length?CH[((b&15)<<2)|((c==null?0:c)>>6)]:"=")+(i+2<u.length?CH[c&63]:"=");}return s;}
    function run(){var u=document.getElementById("baUser").value,p=document.getElementById("baPass").value;
      var head="Basic "+toB64(new TextEncoder().encode(u+":"+p));
      document.getElementById("baOut").value=head;
      document.getElementById("baCurl").value="curl -H \\"Authorization: "+head+"\\" https://api.example.com";}
    document.getElementById("baGo").addEventListener("click",run);
    ["baUser","baPass"].forEach(function(id){document.getElementById(id).addEventListener("input",run);document.getElementById(id).addEventListener("change",run);});
    document.getElementById("baCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("baOut").value,function(){document.querySelector(".ba-panel .proc-line span").textContent="Copied to clipboard."})});
    document.getElementById("baSample").addEventListener("click",function(){document.getElementById("baUser").value="demo";document.getElementById("baPass").value="s3cret";run();});
    document.getElementById("baClear").addEventListener("click",function(){document.getElementById("baUser").value="";document.getElementById("baPass").value="";document.getElementById("baOut").value="";document.getElementById("baCurl").value="";});
  `,
  article: {
    title: 'Basic Auth Generator: The Header Value Without the Headache',
    lead: '<p>HTTP Basic authentication looks simple, and then you hit the details: the value must be base64, special characters must not blow it up, and the header expects the word <code>Basic</code> plus a space. This <strong>basic auth generator</strong> produces the exact header value from any username and password.</p><p>It is UTF-8 safe, so accents, spaces, and symbols in passwords survive the encoding step.</p>',
    sections: [
      { id: 'the-format', icon: 'fa-solid fa-code', heading: 'What the header actually is', html: '<p>Per RFC 7617 the header is the literal string <code>Basic </code> followed by the base64 encoding of <code>username:password</code>. Because base64 handles arbitrary bytes, the format itself imposes no restrictions on the characters in either field, as long as the encoding step uses the right byte representation. Several implementations use the platform default encoding and break on non-ASCII input; this tool encodes UTF-8 explicitly so the output is unambiguous.</p>' },
      { id: 'when-to-use', icon: 'fa-solid fa-computer', heading: 'Where Basic auth still shows up', html: '<p>Basic auth is old but not rare. It appears in legacy APIs, reverse proxies, router admin panels, and quick development dashboards. For serious production APIs it is usually replaced by bearer tokens or OAuth, but when you need a header for a test call or a controller, generating it correctly beats hand-encoding.</p>' }
    ],
    steps: [
      'Enter the username and password for the protected resource.',
      'The header value updates as you type.',
      'Copy the header and attach it, or use the matching curl example that ships alongside it.'
    ],
    facts: [['Format', 'Basic + base64(user:pass)'], ['Encoding', 'UTF-8'], ['Spec', 'RFC 7617'], ['curl example', 'Included'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Testing APIs', 'Generate the header for a test environment in seconds instead of remembering how base64 interacts with passwords.'], 
      ['Configuring proxies', 'Reverse proxy and router panels often store a Basic header value; the generated string pastes straight in.'], 
      ['Scripts and cron jobs', 'Embed the fixed header in a script that calls a legacy endpoint without prompting.']],
    tips: [
      'If a password contains a colon, remember it is part of the value that gets encoded; the separator colon is the one you type between the fields.',
      'Reuse the UTF-8 output rather than re-typing it, since manual transcription of base64 invites mistakes.',
      'Use the curl snippet for quick command-line tests against the endpoint.'
    ],
    takeaways: [['format','Basic base64(user:pass)'],['utf8','Explicit UTF-8 encoding'],['offline','Nothing leaves the browser']],
    faq: [
      ['What is Basic auth?','It is an HTTP authentication scheme where the client sends the word Basic followed by a base64-encoded username:password pair.'],
      ['Why use UTF-8 encoding?','Passwords with accented or non-ASCII characters depend on the byte encoding. UTF-8 is the web standard and this generator uses it explicitly.'],
      ['Is Basic auth secure?','Only over HTTPS. The header travels in every request, so without TLS the credentials are effectively public. This tool only builds the header.'],
      ['Can the header be reused?','Yes, the value is deterministic for a given username and password, so the same header works until the credentials change.'],
      ['Is my password sent anywhere?','No. The encoding runs entirely in your browser.']],
    conclusion: '<p>One field for the username, one for the password, and a correct header appears. Keep this <strong>basic auth generator</strong> next to your API notes, and when you need tokens instead, our <a href="jwt-decoder.html">JWT decoder</a> cover the modern equivalent.</p>'
  }
});

/* ========================================================================
   2. HMAC GENERATOR
   ======================================================================== */
add({
  file: 'hmac-generator.html', folder: 'coding',
  name: 'HMAC Generator', tag: 'Crypto', icon: 'fa-solid fa-fingerprint',
  title: 'HMAC Generator | Sign Messages With HMAC-SHA1/256/512',
  metaDesc: 'Compute HMAC signatures for any message and secret key using SHA1, SHA256 or SHA512. Hex or base64 output, fully offline.',
  desc: 'Sign a message with HMAC using SHA-1, SHA-256 or SHA-512, output as hex or base64, right in your browser.',
  keywords: ['hmac generator', 'hmac calculator', 'hmac sha256', 'message authentication code', 'sign message', 'hmac sha512', 'hash keyed', 'api signature', 'webhook signature', 'hmac hex'],
  featureList: ['HMAC with SHA1 / SHA256 / SHA512', 'Secret key support', 'Hex or base64 output', 'Instant results', 'One-click copy', '100% client-side'],
  panel: panel.wrap('hm', 'fa-solid fa-fingerprint', 'HMAC signer',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="hmAlgo">Algorithm</label><select id="hmAlgo"><option value="SHA-256">SHA-256</option><option value="SHA-1">SHA-1</option><option value="SHA-512">SHA-512</option></select></div>' +
    '<div class="field"><label for="hmFmt">Output</label><select id="hmFmt"><option value="hex">Hex</option><option value="b64">Base64</option></select></div>' +
    '</div>' +
    '<div class="field"style="margin-bottom:12px"><label for="hmKey">Secret key</label><input id="hmKey"type="text"spellcheck="false"autocomplete="off"placeholder="your-very-secret-key"></div>' +
    panel.ioTwo('hm', 'Message', 'HMAC signature', 'Message to sign&hellip;', 'Signature appears here&hellip;') +
    panel.actions('hm', 'Sign') ),
  css: '.hm-panel textarea{min-height:170px}',
  js: `
    var B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function enc(u){var s='';for(var i=0;i<u.length;i+=3){var a=u[i],b=u[i+1],c=u[i+2];s+=B64[a>>2]+B64[((a&3)<<4)|((b==null?0:b)>>4)]+(i+1<u.length?B64[((b&15)<<2)|((c==null?0:c)>>6)]:'=')+(i+2<u.length?B64[c&63]:'=');}return s;}
    async function run(){var t=performance.now(),k=document.getElementById("hmKey").value,m=document.getElementById("hmIn").value;
      try{
        var key=await crypto.subtle.importKey("raw",new TextEncoder().encode(k),{name:"HMAC",hash:{name:document.getElementById("hmAlgo").value}},false,["sign"]);
        var sig=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(m)));
        var out=document.getElementById("hmFmt").value==="hex"?Array.prototype.map.call(sig,function(b){return b.toString(16).padStart(2,"0")}).join(""):enc(sig);
        document.getElementById("hmOut").value=out;document.querySelector("#hmProc").textContent="Signed in "+(performance.now()-t).toFixed(1)+" ms - inside your browser.";
      }catch(e){document.getElementById("hmOut").value="";document.querySelector("#hmProc").textContent="Error: "+e.message;}
    }
    document.getElementById("hmGo").addEventListener("click",run);
    ["hmKey","hmIn","hmAlgo","hmFmt"].forEach(function(id){document.getElementById(id).addEventListener("input",run);document.getElementById(id).addEventListener("change",run);});
    document.getElementById("hmCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("hmOut").value,function(){document.querySelector("#hmProc").textContent="Copied to clipboard."})});
    document.getElementById("hmSample").addEventListener("click",function(){document.getElementById("hmKey").value="secret";document.getElementById("hmIn").value="hello world";run();});
    document.getElementById("hmClear").addEventListener("click",function(){document.getElementById("hmKey").value="";document.getElementById("hmIn").value="";document.getElementById("hmOut").value="";});
  `,
  article: {
    title: 'HMAC Generator: Sign Messages the Server Can Verify',
    lead: '<p>Webhook signatures, API request signing, and message integrity all lean on one primitive: a keyed hash. This <strong>HMAC generator</strong> computes an HMAC for your message and secret key, with the algorithm and output format you choose, entirely in the browser.</p><p>It is handy for checking that your signing code matches a provider\'s documented example before you wire it up.</p>',
    sections: [
      { id: 'how-hmac', icon: 'fa-solid fa-diagram-project', heading: 'What an HMAC adds over a plain hash', html: '<p>An HMAC (hash-based message authentication code) is a hash computed with a secret key folded into the process. That makes it a shared secret: anyone can verify the signature with the same key, and nobody can forge it without the key. Where a plain SHA-256 digest proves nothing about who wrote the message, an HMAC proves both integrity and that the signer held the key, which is why webhook deliveries and API requests use it to detect tampering in transit.</p>' },
      { id: 'bytes-not-strings', icon: 'fa-solid fa-gears', heading: 'Why the exact bytes matter', html: '<p>HMAC digests depend on the byte representation of the message. The webhook example in a provider\'s docs only reproduces if you sign exactly the raw request body with the right bytes and the right key. This tool signs your input as UTF-8 text, which matches most documented examples. When a signature still does not match, the usual culprits are stray newlines, a swapped secret, or body encoding, not the HMAC algorithm itself.</p>' }
    ],
    steps: [
      'Pick the algorithm and the output format (hex or base64).',
      'Paste the secret key and the message to sign.',
      'The signature appears instantly and updates as you type. Copy it where you need it.'
    ],
    facts: [['Algorithms', 'SHA-1, SHA-256, SHA-512'], ['Output', 'Hex or base64'], ['Engine', 'Web Crypto API'], ['Use case', 'Webhook and API verification'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Verifying provider examples', 'Reproduce a documented HMAC example to confirm your library configuration matches before integration.'], 
      ['Generating signatures', 'Create a signature for a manual API request or a test script when the calling code is not ready.'], 
      ['Learning and debugging', 'See how the algorithm, key, and bytes combine to produce a digest, which makes later debugging faster.']],
    tips: [
      'Providers usually document the exact algorithm and format; match both, not just the algorithm.',
      'The secret must be byte-identical on both sides, including any trailing newline added by an editor.',
      'For webhook verification always check the timestamp and replay protections the provider describes, in addition to the HMAC.'
    ],
    takeaways: [['keyed','HMAC needs a shared secret'],['matching','Bytes and algorithm must match exactly'],['local','Web Crypto runs in the browser']],
    faq: [
      ['What is an HMAC?','A hash-based message authentication code: a digest computed with a secret key, used to prove a message came from someone holding that key and that it was not altered.'],
      ['Which algorithm should I use?','SHA-256 is a solid default and the most common in APIs today. SHA-1 is still seen for legacy integrations, and SHA-512 where stronger output is preferred.'],
      ['Why does my signature not match the provider example?','Common causes are a different output encoding (hex vs base64), a trailing newline, the wrong key, or signing different bytes than the raw body. Compare one documented example closely.'],
      ['Is the secret safe?','The key is processed in your browser tab and never sent anywhere, but as a shared secret you must still protect it wherever you store it.'],
      ['Does this replace JWT?','No. JWTs are a token format that may use HMAC internally; this tool computes standalone signatures for your own verification code.']],
    conclusion: '<p>Correct signing libraries start with a correct example to compare against. Verify yours with this <strong>HMAC generator</strong>, and when you need random material for keys, our <a href="../text/random-string-generator.html">random string generator</a> provides the source.</p>'
  }
});

/* ========================================================================
   3. ENCRYPTION (AES-GCM text)
   ======================================================================== */
add({
  file: 'encryption-tool.html', folder: 'coding',
  name: 'Encryption Tool', tag: 'Crypto', icon: 'fa-solid fa-lock',
  title: 'Encryption Tool | AES-GCM Encrypt & Decrypt Text Online',
  metaDesc: 'Encrypt text with a password using AES-256-GCM and decrypt it back. Strong authenticated encryption, 100% client-side.',
  desc: 'Encrypt any text with a password using AES-256-GCM, then decrypt it back. Everything stays in your browser.',
  keywords: ['encryption tool', 'encrypt text', 'decrypt text', 'aes gcm encrypt', 'password encryption', 'text encryptor', 'decrypt online', 'secure message', 'aes-256-gcm', 'encrypt message'],
  featureList: ['AES-256-GCM encryption', 'Password derived key (PBKDF2)', 'Authenticated ciphertext', 'Encrypt and decrypt modes', 'One-click copy', '100% client-side'],
  panel: panel.wrap('enc', 'fa-solid fa-lock', 'Encrypt / decrypt',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="encMode">Mode</label><select id="encMode"><option value="enc">Encrypt</option><option value="dec">Decrypt</option></select></div>' +
    '<div class="field"style="grid-column:span 2"><label for="encPass">Password</label><input id="encPass"type="password"autocomplete="off"spellcheck="false"placeholder="A long, private passphrase"></div>' +
    '</div>' +
    panel.ioTwo('enc', 'Input', 'Output', 'Secret text or encrypted payload&hellip;', 'Result appears here&hellip;') +
    panel.actions('enc', 'Run') ),
  css: '.enc-panel textarea{min-height:170px}',
  js: `
    var B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function b64(u){var s='';for(var i=0;i<u.length;i+=3){var a=u[i],b=u[i+1],c=u[i+2];s+=B64[a>>2]+B64[((a&3)<<4)|((b==null?0:b)>>4)]+(i+1<u.length?B64[((b&15)<<2)|((c==null?0:c)>>6)]:'=')+(i+2<u.length?B64[c&63]:'=');}return s;}
    function unb64(s){s=s.replace(/[^A-Za-z0-9+/]/g,'');var u=[];var n=0,b=0;for(var i=0;i<s.length;i++){var v=B64.indexOf(s[i]);if(v<0)continue;b=(b<<6)|v;n+=6;if(n>=8){u.push((b>>(n-8))&255);n-=8;}}return new Uint8Array(u);}
    function encText(s){return Array.from(new TextEncoder().encode(s));}
    async function derive(pass,salt){var km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
    async function run(){var t=performance.now();var pass=document.getElementById('encPass').value;var inp=document.getElementById('encIn').value;
      if(!pass){document.querySelector('#encProc').textContent='Enter a password first.';return;}
      try{
        if(document.getElementById('encMode').value==='enc'){
          var iv=crypto.getRandomValues(new Uint8Array(12));var salt=crypto.getRandomValues(new Uint8Array(16));
          var key=await derive(pass,salt);
          var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,new TextEncoder().encode(inp)));
          document.getElementById('encOut').value='v1.'+b64(salt)+'.'+b64(iv)+'.'+b64(ct);
        }else{
          var parts=inp.split('.');if(parts.length<4||parts[0]!=='v1')throw new Error('Payload format: v1.salt.iv.ciphertext (all base64).');
          var salt2=unb64(parts[1]),iv2=unb64(parts[2]),ct2=unb64(parts[3]);
          var key2=await derive(pass,salt2);
          var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:iv2},key2,ct2);
          document.getElementById('encOut').value=new TextDecoder().decode(pt);
        }
        document.querySelector('#encProc').textContent='Done in '+(performance.now()-t).toFixed(0)+' ms - inside your browser.';
      }catch(e){document.getElementById('encOut').value='';document.querySelector('#encProc').textContent='Failed: '+e.message;}
    }
    document.getElementById('encGo').addEventListener('click',run);
    ['encIn','encPass','encMode'].forEach(function(id){document.getElementById(id).addEventListener('input',run);document.getElementById(id).addEventListener('change',run);});
    document.getElementById('encCopy').addEventListener('click',function(){window.Troolify.copyToClipboard(document.getElementById('encOut').value,function(){document.querySelector('#encProc').textContent='Copied to clipboard.'})});
    var sample='The falcon has landed at dawn.';
    document.getElementById('encSample').addEventListener('click',function(){document.getElementById('encMode').value='enc';document.getElementById('encPass').value='correct horse battery staple';document.getElementById('encIn').value=sample;run();});
    document.getElementById('encClear').addEventListener('click',function(){document.getElementById('encIn').value='';document.getElementById('encOut').value='';});
  `,
  article: {
    title: 'Encryption Tool: AES-GCM Without Leaving the Browser',
    lead: '<p>Sometimes you need to send a secret that email will not respect, and the fastest safe answer is a password-protected ciphertext your recipient can unlock with the same passphrase. This <strong>encryption tool</strong> encrypts text with AES-256-GCM and can decrypt the result, all inside the browser tab.</p><p>The password is stretched with PBKDF2, a fresh random salt and nonce are used for every run, and the ciphertext is authenticated so tampered payloads refuse to decrypt.</p>',
    sections: [
      { id: 'why-gcm', icon: 'fa-solid fa-shield-halved', heading: 'Why AES-GCM is the right choice', html: '<p>GCM is authenticated encryption: it produces a ciphertext plus a tag that proves the data has not been altered. Decryption fails loudly on any modification, which closes the tampering holes that plainer modes allow. The key is derived from your passphrase with PBKDF2 and a random salt, so two runs with the same password produce different ciphertexts and brute-force attempts are slowed by 150,000 rounds of stretching.</p>' },
      { id: 'the-payload', icon: 'fa-solid fa-file-lines', heading: 'One string carries everything', html: '<p>The output is a compact bundle of the version marker, the salt, the nonce, and the ciphertext, joined with dots and base64 encoded. The recipient pastes the whole string back with the same password and the tool recovers the original text. Because the salt and nonce travel with the payload, you never need to exchange them separately.</p>' }
    ],
    steps: [
      'Choose Encrypt (or Decrypt) and enter a strong passphrase.',
      'Paste your text or an existing payload into the input box.',
      'Copy the output and share it through the channel you trust, telling your recipient the password separately.'
    ],
    facts: [['Cipher', 'AES-256-GCM'], ['Key derivation', 'PBKDF2, 150,000 rounds'], ['Salt', '16 random bytes, per run'], ['Nonce', '12 random bytes, per run'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Sharing secrets', 'A password-protected payload survives email, ticketing tools, and chat logs that treat the content as plain text.'], 
      ['Protecting notes', 'Store an encrypted payload in a notebook app; only someone with the passphrase can read it.'], 
      ['Testing integrations', 'Exercise your own encryption pipeline by round-tripping sample messages against this tool.']],
    tips: [
      'Use a long passphrase rather than a short password; strength comes mostly from length and entropy here.',
      'Transfer the passphrase out of band from the payload, such as over a phone call instead of the same channel.',
      'The output format is specific to this tool. Keep the version marker and all three segments intact when copying.'
    ],
    takeaways: [['gcm','Authenticated AES-256 encryption'],['pbkdf2','Password stretched with salt'],['offline','Everything stays in this tab']],
    faq: [
      ['How secure is this tool?','It uses AES-256-GCM with a PBKDF2-derived key, a random salt, and a random nonce, following current best practice for password-based encryption. Your passphrase strength remains the practical limit.'],
      ['What is the output format?','A single string: v1.<salt>.<nonce>.<ciphertext>, all base64. Paste it back with the same password to decrypt.'],
      ['Can someone decrypt it without the password?','No. The secret is derived from your passphrase; without it there is no viable way to recover the plaintext.'],
      ['Why is the ciphertext different each time?','A fresh random salt and nonce are used for every encryption, so identical plaintexts produce different outputs. That is intentional and normal.'],
      ['Is my password sent anywhere?','No. All cryptographic operations run in your browser tab.']],
    conclusion: '<p>Encrypted text is only as good as the passphrase behind it, so choose one long enough to matter. Use this <strong>encryption tool</strong> for the crunch moment, and pair it with our <a href="hmac-generator.html">HMAC generator</a> when you need signatures rather than secrecy.</p>'
  }
});

/* ========================================================================
   4. RSA KEY PAIR GENERATOR
   ======================================================================== */
add({
  file: 'rsa-key-pair-generator.html', folder: 'crypto',
  name: 'RSA Key Pair Generator', tag: 'Crypto', icon: 'fa-solid fa-key',
  title: 'RSA Key Pair Generator | Create RSA Public & Private Keys',
  metaDesc: 'Generate RSA key pairs (2048, 3072, 4096 bit) as PEM in your browser using the Web Crypto API. Public and private keys ready to copy.',
  desc: 'Generate an RSA public/private key pair as PEM files, using the browser\'s Web Crypto API in 2048, 3072 or 4096 bits.',
  keywords: ['rsa key generator', 'rsa key pair', 'generate rsa keys', 'pem key generator', 'private key', 'public key', '2048 bit rsa', 'ssh key rsa', 'openssl rsa alternative', 'web crypto rsa'],
  featureList: ['RSA key pair generation', '2048 / 3072 / 4096 bits', 'PEM output', 'Web Crypto API', 'One-click copy each', '100% client-side'],
  panel: panel.wrap('rsa', 'fa-solid fa-key', 'RSA key pair',
    '<div class="field"style="max-width:260px;margin-bottom:14px"><label for="rsaBits">Key size</label><select id="rsaBits"><option value="2048">2048-bit (default)</option><option value="3072">3072-bit</option><option value="4096">4096-bit</option></select></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="rsaGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Generate pair</button></div>' +
    '<div class="rt-note"style="font-size:13px;color:var(--muted);margin:10px 0 4px">Public key (SPKI / PEM)</div>' +
    outArea('rsaPub','Public key','RSA public key PEM') +
    '<div class="rt-note"style="font-size:13px;color:var(--muted);margin:10px 0 4px">Private key (PKCS#8 / PEM) - keep this secret</div>' +
    '<div class="actions"style="margin-bottom:4px"><button class="rt-btn"type="button"id="rsaCopyPriv"><i class="fa-solid fa-copy"></i>Copy private key</button>' +
    '<button class="rt-btn"type="button"id="rsaCopyPub"><i class="fa-solid fa-copy"></i>Copy public key</button></div>'),
  css: '.rsa-panel textarea{min-height:170px}',
  js: `
    function pem(buf,label){var b64=btoa(String.fromCharCode.apply(null,new Uint8Array(buf)));var lines=b64.match(/.{1,64}/g)||[];return "-----BEGIN "+label+"-----\\n"+lines.join("\\n")+"\\n-----END "+label+"-----\\n";}
    async function run(){var bits=parseInt(document.getElementById("rsaBits").value,10);var b=document.getElementById("rsaPub"),p=document.querySelector(".rsa-panel");
      document.querySelector(".rsa-panel .proc-line span").textContent="Generating "+bits+"-bit pair - can take a few seconds...";
      try{
        var kp=await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:bits,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
        var spki=await crypto.subtle.exportKey("spki",kp.publicKey);
        var pkcs8=await crypto.subtle.exportKey("pkcs8",kp.privateKey);
        document.getElementById("rsaPub").value=pem(spki,"PUBLIC KEY");
        var pv=document.getElementById("rsaPriv");if(!pv){pv=document.createElement("textarea");pv.id="rsaPriv";pv.readOnly=true;pv.spellcheck=false;pv.setAttribute("aria-label","RSA private key PEM");pv.style.cssText="min-height:170px;width:100%;box-sizing:border-box;background:#1B2028;border:1px solid var(--border);color:#D1D5DB;border-radius:10px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;margin-top:6px";var t=document.querySelector(".rsa-panel");t.insertBefore(pv,t.querySelector("textarea").nextSibling);}
        pv.value=pem(pkcs8,"PRIVATE KEY");
        document.querySelector(".rsa-panel .proc-line span").textContent="Pair generated in this browser ("+bits+" bit).";
      }catch(e){document.querySelector(".rsa-panel .proc-line span").textContent="Generation failed: "+e.message;}
    }
    document.getElementById("rsaGo").addEventListener("click",run);
    document.getElementById("rsaSample").addEventListener("click",run);
    document.getElementById("rsaClear").addEventListener("click",function(){document.getElementById("rsaPub").value="";var pv=document.getElementById("rsaPriv");if(pv)pv.value="";});
    document.getElementById("rsaCopyPub").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("rsaPub").value,function(){document.querySelector(".rsa-panel .proc-line span").textContent="Public key copied."})});
    document.getElementById("rsaCopyPriv").addEventListener("click",function(){var pv=document.getElementById("rsaPriv");if(!pv||!pv.value){document.querySelector(".rsa-panel .proc-line span").textContent="Generate a pair first.";return;}window.Troolify.copyToClipboard(pv.value,function(){document.querySelector(".rsa-panel .proc-line span").textContent="Private key copied - keep it confidential."})});
  `,
  article: {
    title: 'RSA Key Pair Generator: Real Keys From Your Browser',
    lead: '<p>Whether you are setting up SSH, signing software, or preparing a certificate request, you need an RSA key pair, and most people reach for openssl. This <strong>RSA key pair generator</strong> produces the same kind of pair, public and private keys as PEM, using the browser\'s built-in Web Crypto API.</p><p>It runs entirely locally: the private key is generated and displayed in your tab and never leaves it.</p>',
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-gears', heading: 'Web Crypto, not a remote server', html: '<p>The generation uses <code>crypto.subtle.generateKey</code> with RSASSA-PKCS1-v1_5 and a 2048, 3072, or 4096-bit modulus. The public key is exported in SPKI form and the private key in PKCS#8, both wrapped in standard PEM headers. The math happens in your browser process, so the undisclosed prime factors behind your private key never cross the network.</p>' },
      { id: 'sizes', icon: 'fa-solid fa-scale-balanced', heading: 'Which key size to choose', html: '<p>2048 bits is the widely accepted minimum and works everywhere today. 3072 bits adds margin comparable to a 128-bit symmetric key, and 4096 bits is the belt-and-braces option that costs more time to generate and use. Unless regulations demand more, 2048 is the sensible default, with 3072 a reasonable upgrade where performance permits.</p>' }
    ],
    steps: [
      'Pick the key size.',
      'Press <strong>Generate pair</strong>; generation for 4096-bit keys can take a few seconds.',
      'Copy the public key to whoever needs it and guard the private key on your own machine.'
    ],
    facts: [['Algorithm', 'RSASSA-PKCS1-v1_5'], ['Modulus', '2048 / 3072 / 4096 bits'], ['Exponent', '65537'], ['Encoding', 'PEM (SPKI / PKCS#8)'], ['Data handling', 'Generated locally']],
    useCases: [
      ['SSH keys', 'An RSA pair works directly with ssh-keygen-compatible tools when the format lines up.'], 
      ['Signing documents and code', 'Keep the private key for signing and distribute the public key for verification.'], 
      ['Testing crypto code', 'Generate throwaway pairs to exercise signing and verification pipelines without openssl.']],
    tips: [
      'Copy the full PEM block including the BEGIN and END lines; most tools fail silently on truncated keys.',
      'Store the private key with restrictive file permissions, e.g. chmod 600, once you save it.',
      'For brand new deployments, consider how your tooling handles the modern Ed25519 algorithm as an alternative.'
    ],
    takeaways: [['local','Keys generated on-device'],['pem','SPKI and PKCS#8 PEM output'],['secret','Private key never leaves the tab']],
    faq: [
      ['Can I use these keys with openssl and ssh?','The PEM formats (SPKI for public, PKCS#8 for private) are standard, and the keys are compatible with tools that expect those formats. SSH specifically needs the public key in its own format, so convert it first.'],
      ['Is it safe to generate keys in a browser?','Web Crypto uses the same underlying cryptographic routines as the platform, and the keys never leave your device. Save the private key somewhere you control.'],
      ['What is the public exponent used?','65537, the standard recommended value.'],
      ['Why is 4096-bit generation slow?','Finding sufficiently large prime factors takes time; that delay is the same math that makes the keys hard to break.'],
      ['Does this tool store my keys?','No. The pair is created in memory and never transmitted or stored anywhere.']],
    conclusion: '<p>From two clicks to a complete PEM pair. Save the private key carefully, hand out the public key freely, and let this <strong>RSA key pair generator</strong> handle the prime hunting next time you need keys. Our <a href="../coding/hmac-generator.html">HMAC generator</a> covers the symmetric side of the same toolbox.</p>'
  }
});

/* ========================================================================
   5. IBAN VALIDATOR AND PARSER
   ======================================================================== */
add({
  file: 'iban-validator-and-parser.html', folder: 'finance',
  name: 'IBAN Validator & Parser', tag: 'Finance', icon: 'fa-solid fa-building-columns',
  title: 'IBAN Validator & Parser | Check & Decode IBAN Numbers',
  metaDesc: 'Validate IBANs with the official MOD-97 check and decode country, check digits, BBAN and structure. Works for 70+ countries, offline.',
  desc: 'Validate an IBAN using the MOD-97 algorithm and parse its country, check digits and BBAN, all in your browser.',
  keywords: ['iban validator', 'iban parser', 'check iban', 'iban mod 97', 'validate iban', 'iban country', 'swift country code', 'bank account validation', 'iban format', 'iban check digits'],
  featureList: ['MOD-97 validation', 'Country and structure decode', 'BBAN extraction', 'Works for 70+ countries', 'Error feedback', '100% client-side'],
  panel: panel.wrap('ib', 'fa-solid fa-building-columns', 'IBAN check',
    '<div class="field"style="margin-bottom:14px"><label for="ibIn">IBAN to validate</label><input id="ibIn"type="text"spellcheck="false"autocapitalize="characters"placeholder="GB29 NWBK 6016 1331 9268 19"></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="ibGo"><i class="fa-solid fa-stethoscope"></i>Validate</button></div>' +
    '<div class="result-card"><div class="result-grid"style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">' +
    '<div class="result-tile"><span class="rt-label">Status</span><span class="rt-value"id="ibStatus"style="font-size:15px">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Country</span><span class="rt-value"id="ibCountry"style="font-size:14px">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Check digits</span><span class="rt-value"id="ibCheck">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">BBAN</span><span class="rt-value"id="ibBban"style="font-size:14px">&ndash;</span></div>' +
    '</div></div>'),
  css: '',
  js: `
    var IBAN_LEN={AL:28,AD:24,AT:20,AZ:28,BH:22,BY:28,BE:16,BA:20,BR:29,BG:22,CR:22,HR:21,CY:28,CZ:24,DK:18,DO:28,TL:23,EE:20,FO:18,FI:18,FR:27,GE:22,DE:22,GI:23,GR:27,GL:18,GT:28,HU:28,IS:26,IQ:23,IE:22,IL:23,IT:27,JO:30,KZ:20,QA:29,KE:26,KV:22,KW:30,LV:21,LB:28,LI:21,LT:20,LU:20,MT:31,MR:27,MU:30,MD:24,MC:27,ME:22,MK:19,NL:18,NO:15,PK:24,PS:29,PL:28,PT:25,RO:24,LC:32,SM:27,ST:25,SA:24,RS:22,SC:31,SK:24,SI:19,ES:24,SE:24,CH:21,TN:24,TR:26,UA:29,AE:23,GB:22,VA:22,VG:24,XK:20};
    var COUNTRY={AL:'Albania',AD:'Andorra',AT:'Austria',AZ:'Azerbaijan',BH:'Bahrain',BY:'Belarus',BE:'Belgium',BA:'Bosnia and Herzegovina',BR:'Brazil',BG:'Bulgaria',CR:'Costa Rica',HR:'Croatia',CY:'Cyprus',CZ:'Czech Republic',DK:'Denmark',DO:'Dominican Republic',TL:'East Timor',EE:'Estonia',FO:'Faroe Islands',FI:'Finland',FR:'France',GE:'Georgia',DE:'Germany',GI:'Gibraltar',GR:'Greece',GL:'Greenland',GT:'Guatemala',HU:'Hungary',IS:'Iceland',IQ:'Iraq',IE:'Ireland',IL:'Israel',IT:'Italy',JO:'Jordan',KZ:'Kazakhstan',QA:'Qatar',KW:'Kuwait',LV:'Latvia',LB:'Lebanon',LI:'Liechtenstein',LT:'Lithuania',LU:'Luxembourg',MT:'Malta',MR:'Mauritania',MU:'Mauritius',MD:'Moldova',MC:'Monaco',ME:'Montenegro',MK:'North Macedonia',NL:'Netherlands',NO:'Norway',PK:'Pakistan',PS:'Palestine',PL:'Poland',PT:'Portugal',RO:'Romania',LC:'Saint Lucia',SM:'San Marino',ST:'Sao Tome and Principe',SA:'Saudi Arabia',RS:'Serbia',SC:'Seychelles',SK:'Slovakia',SI:'Slovenia',ES:'Spain',SE:'Sweden',CH:'Switzerland',TN:'Tunisia',TR:'Turkey',UA:'Ukraine',AE:'United Arab Emirates',GB:'United Kingdom',VA:'Vatican City',VG:'British Virgin Islands',XK:'Kosovo',KE:'Kenya',KV:'Kosovo (old)'};
    function mod97(s){var n='';for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);n+=c>=65?(c-55):s[i];}var rem=0;for(var j=0;j<n.length;j++){rem=(rem*10+parseInt(n[j],10))%97;}return rem;}
    function validLength(iban){var cc=iban.substr(0,2);return IBAN_LEN[cc]===iban.length;}
    function run(){var raw=document.getElementById("ibIn").value;var iban=raw.replace(/[^A-Za-z0-9]/g,"").toUpperCase();
      var st=document.getElementById("ibStatus"),co=document.getElementById("ibCountry"),ck=document.getElementById("ibCheck"),bb=document.getElementById("ibBban");
      if(!iban){st.textContent='Enter an IBAN';co.textContent='';ck.textContent='';bb.textContent='';return;}
      var cc=iban.substr(0,2);
      if(!/^[A-Z]{2}$/.test(cc)){st.textContent='Not an IBAN (needs two-letter country code)';co.textContent='';ck.textContent='';bb.textContent='';return;}
      if(!IBAN_LEN[cc]){st.textContent='Unknown country code '+cc;co.textContent='';ck.textContent='';bb.textContent='';return;}
      co.textContent=COUNTRY[cc]||cc;
      ck.textContent=iban.substr(2,2);
      bb.textContent=(iban.length>4)?iban.substr(4):'-';
      if(!validLength(iban)){st.textContent='Wrong length: '+iban.length+' (expected '+IBAN_LEN[cc]+')';st.style.color='#F87171';return;}
      var rearr=iban.substr(4)+iban.substr(0,4);
      if(mod97(rearr)===1){st.textContent='Valid IBAN';st.style.color='#4ADE80';}else{st.textContent='Check digits failed (MOD-97)';st.style.color='#F87171';}
    }
    document.getElementById("ibGo").addEventListener("click",run);
    document.getElementById("ibIn").addEventListener("input",run);
    document.getElementById("ibIn").addEventListener("change",run);
    document.getElementById("ibIn").addEventListener("keydown",function(e){if(e.key==="Enter")run();});
    document.getElementById("ibSample").addEventListener("click",function(){document.getElementById("ibIn").value="GB29 NWBK 6016 1331 9268 19";run();});
    document.getElementById("ibClear").addEventListener("click",function(){document.getElementById("ibIn").value="";document.getElementById("ibStatus").textContent="&ndash;";document.getElementById("ibCountry").textContent="&ndash;";document.getElementById("ibCheck").textContent="&ndash;";document.getElementById("ibBban").textContent="&ndash;";});
    run();
  `,
  article: {
    title: 'IBAN Validator & Parser: Trust the Number Before You Send Money',
    lead: '<p>An IBAN looks like noise, but it is a carefully structured code with an inbuilt check. This <strong>IBAN validator and parser</strong> runs the official MOD-97 algorithm to confirm the number is valid, then decodes its country, check digits, and BBAN so you can see what the string actually says.</p><p>The whole check happens locally, so no bank details are sent anywhere.</p>',
    sections: [
      { id: 'mod97', icon: 'fa-solid fa-scale-balanced', heading: 'How the MOD-97 check works', html: '<p>The IBAN\'s safety net is a checksum: the check digits encoded at position three and four. Validation rearranges the string by moving the first four characters to the end, converts letters to numbers (A=10 ... Z=35), and computes the remainder mod 97. A valid IBAN always leaves a remainder of 1. That single calculation is what lets systems reject a mistyped account before it reaches a payment network.</p>' },
      { id: 'structure', icon: 'fa-solid fa-diagram-project', heading: 'Reading the structure', html: '<p>Every IBAN opens with a two-letter country code, followed by two check digits, then the BBAN, the national part that different countries shape differently. Lengths are fixed per country, so a wrong-length IBAN fails immediately. The parser shows each component and verifies the country against its expected layout, which is a fast sanity check on top of the arithmetic.</p>' }
    ],
    steps: [
      'Paste the IBAN with or without spaces.',
      'The status, country, check digits, and BBAN fill in below as you type.',
      'A green "Valid IBAN" means the number passes the structural and MOD-97 checks.'
    ],
    facts: [['Check', 'MOD-97 (remainder must be 1)'], ['Countries', '70+ length tables'], ['Components', 'Country + check + BBAN'], ['Spaces', 'Ignored automatically'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Verifying before payment', 'Check recipient details in a draft before submitting a transfer, catching transposition errors early.'], 
      ['Testing integrations', 'Confirm your own IBAN validation implementation agrees with the official algorithm by comparing cases.'], 
      ['Form validation', 'Use the same checks client-side to reject obviously bad numbers before they hit the server.']],
    tips: [
      'Spaces do not matter: the validator strips every non-alphanumeric character before checking.',
      'A country code you recognise is not enough; the length and MOD-97 checks are what catch real errors.',
      'When a number fails, re-read it from the statement rather than guessing which digit changed.'
    ],
    takeaways: [['mod97','The official algorithm defiines validity'],['structure','Country, check digits, BBAN'],['local','No data is uploaded']],
    faq: [
      ['What does IBAN stand for?','International Bank Account Number, a standardised account identifier used mainly across Europe and adopted in many other regions.'],
      ['What is the MOD-97 check?','The standard validation algorithm: move the first four characters to the end, convert letters to numbers, and the remainder after division by 97 must be 1.'],
      ['Does a valid check mean the account exists?','No. It proves the number is well-formed and self-consistent, not that the bank account behind it exists or belongs to anyone.'],
      ['Why are lengths different per country?','Each country defines its own BBAN layout inside the IBAN, and the total length reflects that national structure.'],
      ['Is my account number safe to paste here?','The validation runs entirely in your browser, so the value is not transmitted. Still, treat bank details with normal care.']],
    conclusion: '<p>Thirty seconds of checking beats a refund request later. Run any IBAN through this <strong>IBAN validator and parser</strong> before your workflow trusts it, and keep our <a href="percentage-calculator.html">percentage calculator</a> nearby for the money maths that follows.</p>'
  }
});

/* ========================================================================
   6. IPV4 SUBNET CALCULATOR
   ======================================================================== */
add({
  file: 'ipv4-subnet-calculator.html', folder: 'coding',
  name: 'IPv4 Subnet Calculator', tag: 'Network', icon: 'fa-solid fa-network-wired',
  title: 'IPv4 Subnet Calculator | Network, Broadcast & Host Ranges',
  metaDesc: 'Calculate network, broadcast, host range, mask and wildcard for any IPv4 CIDR. Instant results for subnets and VLSM planning, offline.',
  desc: 'Given an IPv4 address and CIDR prefix, see the network, broadcast, usable hosts, mask and more, instantly in your browser.',
  keywords: ['ipv4 subnet calculator', 'subnet calculator', 'cidr calculator', 'network calculator', 'broadcast address', 'netmask', 'host range', 'subnet mask', 'vlsm calculator', 'ip range'],
  featureList: ['Network and broadcast addresses', 'First/last usable host', 'Subnet mask and wildcard', 'Host counts', 'IPv4 class info', '100% client-side'],
  panel: panel.wrap('sn', 'fa-solid fa-network-wired', 'Subnet calculator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="snIp">IP address</label><input id="snIp"type="text"spellcheck="false"placeholder="192.168.1.37"></div>' +
    '<div class="field"><label for="snPrefix">CIDR prefix</label><input id="snPrefix"type="number"min="0"max="32"value="24"placeholder="24"></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="snGo"><i class="fa-solid fa-calculator"></i>Calculate</button></div>' +
    '<div class="result-card"><div class="result-grid"style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">' +
    '<div class="result-tile"><span class="rt-label">Network</span><span class="rt-value"id="snNet">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Broadcast</span><span class="rt-value"id="snBcast">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">First host</span><span class="rt-value"id="snFirst">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Last host</span><span class="rt-value"id="snLast">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Netmask</span><span class="rt-value"id="snMask">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Wildcard</span><span class="rt-value"id="snWild">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Total hosts</span><span class="rt-value"id="snTotal">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Usable hosts</span><span class="rt-value"id="snHosts">&ndash;</span></div>' +
    '</div></div>'),
  css: '.sn-panel .rt-value{font-size:14px}',
  js: `
    function ipText(n){return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join(".");}
    function parseIp(s){var p=s.trim().split(".");if(p.length!==4)throw new Error("Expected an IPv4 address like 192.168.1.37");var n=0;for(var i=0;i<4;i++){var o=parseInt(p[i],10);if(isNaN(o)||o<0||o>255)throw new Error("Octet \\""+p[i]+"\\" is out of range");n=(n<<8)|o;}return n>>>0;}
    function run(){var st=document.getElementById("snNet");try{
      var ip=parseIp(document.getElementById("snIp").value);
      var pre=parseInt(document.getElementById("snPrefix").value,10);if(isNaN(pre)||pre<0||pre>32)throw new Error("Prefix must be 0-32");
      var mask=pre===0?0:(0xFFFFFFFF<<(32-pre))>>>0;
      var net=(ip&mask)>>>0;
      var bcast=(net|(~mask>>>0))>>>0;
      var total=pre>=31?Math.pow(2,32-pre):Math.pow(2,32-pre);
      var usable=pre>30?0:(total-2);
      document.getElementById("snNet").textContent=ipText(net);
      document.getElementById("snBcast").textContent=pre>=31?ipText(bcast):ipText(bcast);
      document.getElementById("snFirst").textContent=usable?ipText(net+1):"-";
      document.getElementById("snLast").textContent=usable?ipText(bcast-1):"-";
      document.getElementById("snMask").textContent=ipText(mask);
      document.getElementById("snWild").textContent=ipText((~mask>>>0));
      document.getElementById("snTotal").textContent=pre===32?"1":total.toLocaleString();
      document.getElementById("snHosts").textContent=pre>=31?(pre===31?"2":"1"):(total-2).toLocaleString();
    }catch(e){st.textContent="Error: "+e.message;document.getElementById("snBcast").textContent="&ndash;";}}
    document.getElementById("snGo").addEventListener("click",run);
    ["snIp","snPrefix"].forEach(function(id){document.getElementById(id).addEventListener("input",run);document.getElementById(id).addEventListener("change",run);});
    document.getElementById("snSample").addEventListener("click",function(){document.getElementById("snIp").value="192.168.1.37";document.getElementById("snPrefix").value="24";run();});
    document.getElementById("snClear").addEventListener("click",function(){document.getElementById("snIp").value="";document.getElementById("snPrefix").value="24";["snNet","snBcast","snFirst","snLast","snMask","snWild","snTotal","snHosts"].forEach(function(id){document.getElementById(id).textContent="&ndash;";});});
    run();
  `,
  article: {
    title: 'IPv4 Subnet Calculator: The Numbers Behind Your Network',
    lead: '<p>CIDR notation like <code>192.168.1.0/24</code> encodes an entire address plan in three characters, but turning it into usable host ranges is where the mistakes happen. This <strong>IPv4 subnet calculator</strong> takes an address and prefix and reads back the network, broadcast, host range, mask, and wildcard, instantly.</p><p>Whether you are designing a VPN pool or answering a certification question, the arithmetic is done for you.</p>',
    sections: [
      { id: 'cidr', icon: 'fa-solid fa-diagram-project', heading: 'What the prefix actually means', html: '<p>The number after the slash is the count of fixed bits in the address. A /24 keeps the first 24 bits fixed, leaving 8 bits for hosts, so the block holds 256 addresses. The network address is the first address in the block with all host bits zero, and the broadcast address has them all set to one. Everything between, minus those two special addresses, is usable by hosts on the subnet.</p>' },
      { id: 'host-counts', icon: 'fa-solid fa-users', heading: 'Why the host count is usually minus two', html: '<p>In almost every subnet, the first address names the network itself and the last address is the broadcast, so they cannot be assigned to a device. A /24 therefore offers 254 usable addresses. The exception is the very biggest IPv4 prefixes: /31 subnets deliberately use both addresses as host addresses for point-to-point links, and /32 names a single host.</p>' }
    ],
    steps: [
      'Enter an IPv4 address and the CIDR prefix (0-32).',
      'The calculator updates the network, broadcast, host range, mask, wildcard, and counts.',
      'Use the numbers to plan static addresses, firewall rules, or DHCP scopes.'
    ],
    facts: [['Input', 'IPv4 address + prefix'], ['Output', 'Network, broadcast, hosts, mask, wildcard'], ['Host rule', 'Total minus network and broadcast'], ['/31', 'Point-to-point, both addresses usable'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Planning a new subnet', 'Decide the prefix that fits your device count and read off the assignable range immediately.'], 
      ['Writing firewall rules', 'A precise network and wildcard makes host lists and allow rules easier to express.'], 
      ['Certification practice', 'Check your manual subnet maths against the calculator until the pattern is automatic.']],
    tips: [
      'Keep one or two addresses in reserve for gates and infrastructure when you count hosts.',
      'For remote-access pools, add the VPN range as a separate subnet with its own prefix.',
      'A /31 or /32 changes the host maths, so read the tool\'s note before applying the result.'
    ],
    takeaways: [['network','First address, host bits zero'],['broadcast','Last address, host bits one'],['usable','Total minus two (except /31, /32)']],
    faq: [
      ['What is a CIDR prefix?','The number of fixed bits in an IPv4 address, written after a slash. Higher prefixes mean smaller, more specific networks with fewer hosts.'],
      ['Which addresses cannot be used by hosts?','The network address (all host bits zero) and the broadcast address (all host bits one) are reserved, so a /24 offers 254 usable addresses.'],
      ['Why does a /31 behave differently?','Point-to-point links use both addresses for devices, which is the only common case where the minus-two rule does not apply.'],
      ['What is the wildcard?','The bitwise inverse of the netmask, used in some routing and firewall syntax to express the variable part of an address.'],
      ['Is my IP information sent anywhere?','No. Everything is computed in your browser.']],
    conclusion: '<p>Subnet maths stops being a source of surprise once you can see the four key numbers together. Run your ranges through this <strong>IPv4 subnet calculator</strong>, and when you need to generate addresses for tests, the <a href="mac-address-generator.html">MAC address generator</a> covers the Ethernet side.</p>'
  }
});

/* ========================================================================
   7. IPV4 ADDRESS CONVERTER
   ======================================================================== */
add({
  file: 'ipv4-address-converter.html', folder: 'coding',
  name: 'IPv4 Address Converter', tag: 'Converter', icon: 'fa-solid fa-arrow-right-arrow-left',
  title: 'IPv4 Address Converter | Dotted, Decimal, Hex & Binary',
  metaDesc: 'Convert an IPv4 address between dotted decimal, integer, hexadecimal and binary forms. Decode thousands and hex inputs too, online and offline.',
  desc: 'Convert IPv4 addresses between dotted decimal, 32-bit integer, hexadecimal and binary representations, instantly in your browser.',
  keywords: ['ipv4 converter', 'ip to decimal', 'ip to hex', 'ip to binary', 'ipv4 address converter', 'convert ip address', 'integer to ip', 'decimal ip', 'ip hex converter', 'ipv4 format'],
  featureList: ['Dotted decimal output', '32-bit integer conversion', 'Hex and binary forms', 'Class and range info', 'Mixed-radix input support', '100% client-side'],
  panel: panel.wrap('ipc', 'fa-solid fa-compress', 'IPv4 converter',
    '<div class="field"style="margin-bottom:14px"><label for="ipcIn">IPv4 address (any format)</label><input id="ipcIn"type="text"spellcheck="false"placeholder="3232235777 or 192.168.1.1 or 0xC0A80101"></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="ipcGo"><i class="fa-solid fa-right-left"></i>Convert</button></div>' +
    '<div class="result-card"><div class="result-grid"style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">' +
    '<div class="result-tile"><span class="rt-label">Dotted decimal</span><span class="rt-value"id="ipcDot">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Integer</span><span class="rt-value"id="ipcInt"style="font-size:14px">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Hex</span><span class="rt-value"id="ipcHex">&ndash;</span></div>' +
    '<div class="result-tile"><span class="rt-label">Binary</span><span class="rt-value"id="ipcBin"style="font-size:13px">&ndash;</span></div>' +
    '</div></div>'),
  css: '.ipc-panel .rt-value{font-size:14px}',
  js: `
    function ipText(n){return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join(".");}
    function parseAny(s){s=s.trim();
      if(s.indexOf(".")>=0){
        var p=s.split(".");if(p.length!==4)throw new Error("Dotted input needs 4 octets");
        var n=0;for(var i=0;i<4;i++){var o=parseOctet(p[i]);n=(n<<8)|o;}return n>>>0;
      }
      s=s.replace(/_/g,"");
      if(/^0[xX]/.test(s)){var v=parseInt(s,16);if(isNaN(v)||v<0||v>4294967295)throw new Error("Hex value out of range");return v>>>0;}
      if(/^0[0-7]+$/.test(s)){var dv=parseInt(s,8);if(isNaN(dv)||dv>4294967295)throw new Error("Octal value out of range");return dv>>>0;}
      if(/^[01]+$/.test(s)&&s.length>8){var bv=parseInt(s,2);if(bv>4294967295)throw new Error("Binary value out of range");return bv>>>0;}
      var dec=parseInt(s,10);if(isNaN(dec)||dec<0||dec>4294967295)throw new Error("Expected a 32-bit integer 0-4294967295");return dec>>>0;
    }
    function parseOctet(o){o=o.trim();
      if(/^0[xX]/.test(o)){var v=parseInt(o,16);if(isNaN(v)||v<0||v>255)throw new Error("Octet "+o+" invalid");return v;}
      if(/^0[0-7]+$/.test(o)){var dv=parseInt(o,8);if(dv>255)throw new Error("Octet "+o+" invalid");return dv;}
      var d=parseInt(o,10);if(isNaN(d)||d<0||d>255)throw new Error("Octet \\""+o+"\\" out of range");return d;}
    function bin(n){return ("00000000000000000000000000000000"+n.toString(2)).slice(-32);}
    function run(){try{
      var n=parseAny(document.getElementById("ipcIn").value);
      document.getElementById("ipcDot").textContent=ipText(n);
      document.getElementById("ipcInt").textContent=n;
      document.getElementById("ipcHex").textContent="0x"+("00000000"+n.toString(16).toUpperCase()).slice(-8);
      document.getElementById("ipcBin").textContent=bin(n).replace(/(.{8})/g,"$1 ").trim();
    }catch(e){["ipcDot","ipcInt","ipcHex","ipcBin"].forEach(function(id){document.getElementById(id).textContent="&ndash;"});document.getElementById("ipcDot").textContent="Error: "+e.message;}}
    document.getElementById("ipcGo").addEventListener("click",run);
    document.getElementById("ipcIn").addEventListener("input",run);
    document.getElementById("ipcSample").addEventListener("click",function(){document.getElementById("ipcIn").value="3232235777";run();});
    document.getElementById("ipcClear").addEventListener("click",function(){document.getElementById("ipcIn").value="";["ipcDot","ipcInt","ipcHex","ipcBin"].forEach(function(id){document.getElementById(id).textContent="&ndash;"});});
  `,
  article: {
    title: 'IPv4 Address Converter: Every Representation of One Number',
    lead: '<p>An IPv4 address is really a single 32-bit value that we normally write as four decimals. Configs occasionally need it as an integer, hex, or binary, so this <strong>IPv4 address converter</strong> shows all the representations of whatever you type, in any of the common formats.</p><p>Give it a dotted address, a bare integer, a hex value, or binary, and get every other form back, plus the binary layout grouped by octet.</p>',
    sections: [
      { id: 'representations', icon: 'fa-solid fa-table', heading: 'Why the same address has so many forms', html: '<p>Firewall rules, hacking puzzles, and old routing tables each have favourite spellings. As a bitset, the address splits naturally into four octets, so dotted decimal groups those bytes; hex compacts the whole 32 bits into eight characters; the integer form is the unsigned value of all 32 bits; and binary shows the raw bit pattern. All of them describe the same number, and conversion only changes the base it is written in.</p>' },
      { id: 'input-savvy', icon: 'fa-solid fa-keyboard', heading: 'Input that adapts to you', html: '<p>The converter detects what you pasted: if it contains dots it interprets each octet independently, accepting decimal, leading-zero octal, and 0x hex octets; otherwise it treats the input as a single 32-bit integer and checks it against decimal, octal, hex, or long binary spellings. A wrong range is reported instead of silently wrapping.</p>' }
    ],
    steps: [
      'Paste an IPv4 address in any of the supported formats.',
      'Read the dotted, integer, hex, and binary forms below.',
      'Copy whichever representation your configuration needs.'
    ],
    facts: [['Outputs', 'Dotted, integer, hex, binary'], ['Integer range', '0 to 4294967295'], ['Octet parsing', 'Decimal, octal, hex'], ['Binary','Grouped into octets'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Firewall and router configs', 'Some interfaces accept addresses as integers or hex; copy the exact form they want.'], 
      ['CTF and puzzle work', 'Addresses hidden as big numbers are decoded instantly into readable dotted form.'], 
      ['Teaching bit layout', 'Seeing the same value as dots, hex, and bits makes the octet structure obvious.']],
    tips: [
      'For dotted input, 0x1F means the hex octet 31 in that position; the tool parses each octet; no need to convert everything manually.',
      'An integer above 4294967295 or below 0 is not a valid IPv4 value and is rejected rather than truncated.',
      'The binary output keeps its octet grouping, which matches how subnets are described.'
    ],
    takeaways: [['one-number','All forms are the same 32 bits'],['input','Detects dotted, int, hex, octal, binary'],['safe','Out-of-range values are rejected']],
    faq: [
      ['What is the integer form of an IP address?','The unsigned 32-bit value of the address. For example 192.168.1.1 is 3232235777.'],
      ['Why are hex and octets relevant?','Older configs and some tools accept addresses in hex; dotted octets can even be written in octal or hex. Converting keeps everything unambiguous.'],
      ['Can it convert a number back to an address?','Yes. Paste any 32-bit integer, hex such as 0xC0A80101, octal, or long binary and the dotted address appears.'],
      ['What if I type an out-of-range value?','The tool reports an error instead of wrapping around, so a mistyped address cannot silently become a different one.'],
      ['Does anything get uploaded?','No. All conversion happens locally in your browser.']],
    conclusion: '<p>One number, four spellings, and the converter connects them without the mental base conversion. Try this <strong>IPv4 address converter</strong> on your own addresses, and use the <a href="ipv4-subnet-calculator.html">IPv4 subnet calculator</a> when you need the full network picture.</p>'
  }
});

/* ========================================================================
   8. IPV6 ULA GENERATOR
   ======================================================================== */
add({
  file: 'ipv6-ula-generator.html', folder: 'coding',
  name: 'IPv6 ULA Generator', tag: 'Generator', icon: 'fa-solid fa-route',
  title: 'IPv6 ULA Generator | Random Unique Local Addresses',
  metaDesc: 'Generate RFC 4193 IPv6 Unique Local Addresses (fd00::/8) with random global IDs for private networks. Copy-ready prefixes, offline.',
  desc: 'Create RFC 4193 IPv6 Unique Local Addresses (ULA) with a random 40-bit global ID, perfect for private networks.',
  keywords: ['ipv6 ula', 'unique local address', 'ipv6 generator', 'ula ipv6', 'rfc 4193', 'fd00 prefix', 'ipv6 private address', 'local ipv6', 'site local address', 'ipv6 prefix generator'],
  featureList: ['RFC 4193 ULA generation', 'Random 40-bit global ID', 'fd00::/8 prefix space', '/48 prefix ready to use', 'Full address sample', '100% client-side'],
  panel: panel.wrap('ula', 'fa-solid fa-route', 'ULA generator',
    '<div class="actions"><button class="btn btn-primary"type="button"id="ulaGo"><i class="fa-solid fa-dice"></i>Generate ULA</button>' +
    '<button class="rt-btn"type="button"id="ulaCopy"><i class="fa-solid fa-copy"></i>Copy prefix</button></div>' +
    '<div class="result-card"><div class="result-grid"style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">' +
    '<div class="result-tile"style="grid-column:1/-1"><span class="rt-label">ULA prefix (/48)</span><span class="rt-value"id="ulaPrefix"style="font-size:15px;font-family:ui-monospace,Menlo,Consolas,monospace">&ndash;</span></div>' +
    '<div class="result-tile"style="grid-column:1/-1"><span class="rt-label">Sample full address</span><span class="rt-value"id="ulaFull"style="font-size:14px;font-family:ui-monospace,Menlo,Consolas,monospace">&ndash;</span></div>' +
    '</div></div>'),
  css: '.ula-panel .rt-value{word-break:break-all}',
  js: `
    function rndHex(n){var b=new Uint8Array(Math.ceil(n/2));crypto.getRandomValues(b);var s="";for(var i=0;i<b.length;i++)s+=b[i].toString(16).padStart(2,"0");return s.slice(0,n).toUpperCase();}
    function run(){var g=rndHex(10);var p="fd"+g.slice(0,2).toLowerCase()+":"+g.slice(2,6)+":"+g.slice(6,10);
      var sub=rndHex(4);var iface=[rndHex(4),rndHex(4),rndHex(4),rndHex(4)].join(":");
      document.getElementById("ulaPrefix").textContent=p+"::/48";
      document.getElementById("ulaFull").textContent=p+":"+sub+":"+iface;}
    document.getElementById("ulaGo").addEventListener("click",run);
    document.getElementById("ulaCopy").addEventListener("click",function(){window.Troolify.copyToClipboard(document.getElementById("ulaPrefix").textContent,function(){document.querySelector(".ula-panel .proc-line span").textContent="Prefix copied to clipboard."})});
    document.getElementById("ulaSample").addEventListener("click",run);
    document.getElementById("ulaClear").addEventListener("click",function(){document.getElementById("ulaPrefix").textContent="&ndash;";document.getElementById("ulaFull").textContent="&ndash;";});
    run();
  `,
  article: {
    title: 'IPv6 ULA Generator: Private IPv6 That Stays Private',
    lead: '<p>IPv6 has no NAT, so what do you use for a network that must not be reachable from the internet? The answer is Unique Local Addresses, the fd00::/8 space reserved by RFC 4193. This <strong>IPv6 ULA generator</strong> creates a fresh /48 prefix with a random global ID, ready for your lab or internal services.</p><p>The local bit is set and the address is generated with real randomness from your browser.</p>',
    sections: [
      { id: 'why-ula', icon: 'fa-solid fa-shield-halved', heading: 'Why ULA exists in a NAT-free world', html: '<p>RFC 4193 set aside the fd00::/8 block for local communication. The fc00::/7 range holds both the locally assigned fd00::/8 space and a future registry-controlled half, but in practice everyone uses fd and generates their own 40-bit global ID randomly. The first bit of fd makes the local bit 1, and the random ID, plus the requirement to check for uniqueness, gives networks a high probability of being globally distinct without any central registry.</p>' },
      { id: 'the-structure', icon: 'fa-solid fa-diagram-project', heading: 'Anatomy of the generated prefix', html: '<p>A ULA address is built as: the <code>fd</code> prefix, a 40-bit random global ID, a 16-bit subnet ID, and a 64-bit interface ID. This generator hands you the /48 prefix (the fd plus the global ID), which is the allocation unit you configure on routers and firewalls, and separately builds an example full address by filling in a random subnet and interface. You choose the real subnet ID yourself, from 0000 to ffff, for each internal segment.</p>' }
    ],
    steps: [
      'Press <strong>Generate ULA</strong> to create a random /48 prefix.',
      'Copy the prefix and use it on your routers and firewalls.',
      'Assign a subnet ID per internal network and let SLAAC or DHCPv6 fill in the interface side.'
    ],
    facts: [['Space', 'fd00::/8 (RFC 4193)'], ['Global ID', '40 random bits'], ['Prefix', '/48 from this generator'], ['Subnet ID', '16 bits (0000-ffff)'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Lab and test networks', 'Internal environments get stable IPv6 that will never collide with someone else\'s allocation.'], 
      ['Private services', 'Monitoring and internal APIs on ULA addresses stay unreachable from the internet without relying on NAT.'], 
      ['Learning IPv6', 'Create realistic prefixes to practice router and firewall configuration with real-looking addresses.']],
    tips: [
      'Keep the generated /48 as your allocation unit and derive /64 subnets from it by varying the subnet ID.',
      'ULA addresses are intentionally not globally routable; enable explicit forwarding only on your own links.',
      'Random generation gives real isolation; do not hand-pick global IDs, since collisions with other networks would break routing.'
    ],
    takeaways: [['fd00::/8','RFC 4193 private space'],['40-bit id','Random global identifier'],['/48','The allocation unit to configure']],
    faq: [
      ['What is an IPv6 ULA?','A Unique Local Address from the fd00::/8 block, designed for private IPv6 networks that must not be routed on the internet.'],
      ['How is the global ID chosen?','This generator picks 40 random bits, per the RFC requirement, so your prefix is effectively unique without registration.'],
      ['Why not just use link-local?','Link-local addresses (fe80::/10) only work on one link. ULA addresses work across your whole site and even between sites you connect.'],
      ['Are ULA addresses routable?','They can be routed within your own network but must not be forwarded to the public internet; that is the point.'],
      ['Does generation need a server?','No. The random bits come from the browser\'s crypto API, fully offline.']],
    conclusion: '<p>Private IPv6 is just a matter of picking a good prefix once. Let this <strong>IPv6 ULA generator</strong> supply that prefix, and pair it with the <a href="ipv4-subnet-calculator.html">IPv4 subnet calculator</a> if you are bridging both families in the same plan.</p>'
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