const fs = require('fs');
const files = fs.readdirSync('tools/units').filter(f => f.endsWith('.html') && f !== 'index.html');
let changed = 0;
for (const f of files) {
  const p = 'tools/units/' + f;
  let t = fs.readFileSync(p, 'utf8');
  // Turn the broken double-quoted string into a single-quoted one.
  const before = t;
  t = t.replace(/return "<span class="uc-pill">"\+fmt\(v\)\+" "\+from\.value\+" = <b>"\+fmt\(x\)\+" "\+u\+"<\/b><\/span>"/g,
    "return '<span class=\"uc-pill\">'+fmt(v)+' '+from.value+' = <b>'+fmt(x)+' '+u+'</b></span>'");
  t = t.replace(/return "<span class="uc-pill">"\+fmt\(v\)\+" "\+from\.value\+" = "\+fmt\(r\)\+" "\+to\.value\+";?/g,
    "return '<span class=\"uc-pill\">'+fmt(v)+' '+from.value+' = '+fmt(r)+' '+to.value");
  if (t !== before) { fs.writeFileSync(p, t); changed++; console.log('patched', f); }
}
console.log('patched:', changed);
