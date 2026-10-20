/* ============================================================================
   Troolify - batch 17
   Image tools migrated from allinonetools.net (client-side feasible, canvas).
   Run: node troolify-gen/gen-tools-batch17.js   (from the repo root)
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
function sel(id, label, opts) {
  return '<div class="field"><label for="' + id + '">' + label + '</label><select id="' + id + '">' +
    opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></div>';
}
function go(prefix, label) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-image"></i>' + (label || 'Process') + '</button> ' +
    '<button class="rt-btn"type="button"id="' + prefix + 'Dl"><i class="fa-solid fa-download"></i>Download PNG</button></div>';
}
const IMG_IO =
  '<div class="io-grid two"style="margin-bottom:14px">' +
  '<div class="io-field"><label for="FILEIN">Choose image</label><input id="FILEIN"type="file"accept="image/*"style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px"></div>' +
  '<div class="io-field"><label>Preview</label><canvas id="PREVIEW"style="max-width:100%;border:1px solid var(--border);border-radius:10px;background:#0e1116"></canvas></div>' +
  '</div>';
const IMG_JS = `
  var img=new Image(),haveImg=false;
  function loadImg(cb){var f=document.getElementById("FILEIN").files[0];if(!f)return;
    var r=new FileReader();r.onload=function(e){img.onload=function(){haveImg=true;draw();if(cb)cb();};img.src=e.target.result;};r.readAsDataURL(f);}
  function blank(w,h){var c=document.getElementById("PREVIEW");c.width=w;c.height=h;return c.getContext("2d");}
  function out(c){var b=document.getElementById("PREVIEW");b.toBlob(function(bl){var a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download="troolify.png";a.click();URL.revokeObjectURL(a.href);});}
  document.getElementById("FILEIN").addEventListener("change",function(){loadImg();});`;

/* ========================================================================
   1. INVERT IMAGE COLORS
   ======================================================================== */
add({
  file: 'image-invert-color.html', folder: 'image',
  name: 'Invert Image Colors', tag: 'Photo Editing', icon: 'fa-solid fa-circle-half-stroke',
  title: 'Invert Image Colors | Negative Photo Effect',
  metaDesc: 'Invert the colors of any image to create a negative effect, then download the result as PNG. Free and fully in-browser.',
  desc: 'Flip every pixel to its opposite color for a negative effect, processed on a canvas in your browser.',
  keywords: ['invert image colors', 'negative image', 'color inversion', 'photo negative', 'invert photo', 'image tool'],
  featureList: ['Per-pixel inversion', 'Canvas rendering', 'PNG download', '100% client-side'],
  panel: panel.wrap('inv', 'fa-solid fa-circle-half-stroke', 'Invert image colors', IMG_IO + go('inv')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;
    var x=c.getContext("2d");x.drawImage(img,0,0);var d=x.getImageData(0,0,c.width,c.height),p=d.data;
    for(var i=0;i<p.length;i+=4){p[i]=255-p[i];p[i+1]=255-p[i+1];p[i+2]=255-p[i+2];}
    x.putImageData(d,0,0);document.getElementById("invProc").textContent="Inverted in this tab - 0 bytes uploaded.";}
  document.getElementById("invGo").addEventListener("click",draw);
  document.getElementById("invDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Invert Image Colors: Create a Photo Negative',
    lead: '<p>Inverting an image swaps light for dark and each color for its opposite. This <strong>image color inverter</strong> applies a negative effect in your browser.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-circle-half-stroke', heading: 'What inversion does', html: '<p>Each channel value is replaced by 255 minus itself. Red becomes cyan, blue becomes yellow, and bright areas become dark.</p>' },
      { id: 'use', icon: 'fa-solid fa-wand-magic-sparkles', heading: 'Creative uses', html: '<p>Negatives suit artistic edits, X-ray looks and quick contrast checks. Invert twice to confirm no data is lost.</p>' }
    ],
    steps: ['Choose an image file.', 'Press Process to invert.', 'Download the PNG result.'],
    facts: [['Effect', 'Channel inversion'], ['Output', 'PNG'], ['Input', 'Any image'], ['Data handling', 'Runs locally']],
    useCases: [['Artistic edits', 'Add a negative look.'], ['Contrast checks', 'Reveal hidden detail.'], ['Fun', 'Try quick transformations.']],
    tips: ['Use high-resolution sources.', 'Download saves full resolution.', 'Works best on photos with range.'],
    takeaways: ['Inversion is per-channel 255 minus value.', 'Colours become their complements.', 'The file never leaves your device.'],
    faq: [['Is the original file changed?', 'No, only the copy in the browser.'], ['What format is output?', 'PNG.'], ['Can I revert?', 'Invert again to restore.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Try the <a href="image-grayscale.html">grayscale tool</a> for another classic effect.</p>'
  }
});

/* ========================================================================
   2. IMAGE FILTER TOOL
   ======================================================================== */
add({
  file: 'image-filter-tool.html', folder: 'image',
  name: 'Image Filter Tool', tag: 'Photo Editing', icon: 'fa-solid fa-sliders',
  title: 'Image Filter Tool | Online Photo Filters',
  metaDesc: 'Apply classic photo filters - warm, cool, sepia, vintage and more - to any image and download the result. In-browser and private.',
  desc: 'Apply preset photo filters with a single control and download the processed image as PNG.',
  keywords: ['image filter tool', 'photo filters', 'online filters', 'sepia filter', 'vintage filter', 'image editor'],
  featureList: ['Multiple presets', 'Live preview', 'PNG download', '100% client-side'],
  panel: panel.wrap('fil', 'fa-solid fa-sliders', 'Image filters', IMG_IO +
    '<div style="margin-bottom:14px">' + sel('filPreset', 'Filter', [['none', 'None'], ['grayscale', 'Grayscale'], ['sepia', 'Sepia'], ['warm', 'Warm'], ['cool', 'Cool'], ['vintage', 'Vintage'], ['highcontrast', 'High contrast']]) + '</div>' + go('fil')),
  js: IMG_JS + `
  function apply(){var c=document.getElementById("PREVIEW");if(!haveImg)return;c.width=img.naturalWidth;c.height=img.naturalHeight;
    var x=c.getContext("2d");x.drawImage(img,0,0);var preset=document.getElementById("filPreset").value;
    if(preset==="grayscale"){var d=x.getImageData(0,0,c.width,c.height),p=d.data;for(var i=0;i<p.length;i+=4){var g=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2];p[i]=p[i+1]=p[i+2]=g;}x.putImageData(d,0,0);}
    else if(preset==="sepia"){var d2=x.getImageData(0,0,c.width,c.height),q=d2.data;for(var j=0;j<q.length;j+=4){var r=q[j],gg=q[j+1],b=q[j+2];q[j]=r*0.393+gg*0.769+b*0.189;q[j+1]=r*0.349+gg*0.686+b*0.168;q[j+2]=r*0.272+gg*0.534+b*0.131;}x.putImageData(d2,0,0);}
    else if(preset==="warm"||preset==="cool"||preset==="vintage"||preset==="highcontrast"){var d3=x.getImageData(0,0,c.width,c.height),s=d3.data;for(var k=0;k<s.length;k+=4){if(preset==="warm"){s[k]=Math.min(255,s[k]+20);s[k+2]=Math.max(0,s[k+2]-15);}else if(preset==="cool"){s[k]=Math.max(0,s[k]-15);s[k+2]=Math.min(255,s[k+2]+20);}else if(preset==="vintage"){s[k]=s[k]*0.9+30;s[k+1]=s[k+1]*0.9+10;s[k+2]=s[k+2]*0.8;}else if(preset==="highcontrast"){s[k]=((s[k]-128)*1.6+128);s[k+1]=((s[k+1]-128)*1.6+128);s[k+2]=((s[k+2]-128)*1.6+128);}}x.putImageData(d3,0,0);}
    document.getElementById("filProc").textContent="Filtered in this tab - 0 bytes uploaded.";}
  document.getElementById("filPreset").addEventListener("change",apply);
  document.getElementById("filGo").addEventListener("click",apply);
  document.getElementById("filDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Image Filter Tool: Apply Photo Filters Online',
    lead: '<p>Give a photo a mood with one click. This <strong>image filter tool</strong> applies grayscale, sepia, warm, cool, vintage and high-contrast looks entirely in your browser.</p>',
    sections: [
      { id: 'filters', icon: 'fa-solid fa-palette', heading: 'What each filter does', html: '<p>Grayscale removes colour, sepia adds an amber tint, warm and cool shift the white balance, vintage softens tones, and high contrast deepens shadows.</p>' },
      { id: 'tip', icon: 'fa-solid fa-lightbulb', heading: 'Getting the best result', html: '<p>Start from a well-lit photo, try a few filters, and remember the output is always a fresh PNG so your original is untouched.</p>' }
    ],
    steps: ['Choose an image.', 'Pick a filter preset.', 'Download the PNG.'],
    facts: [['Presets', '7 filters'], ['Output', 'PNG'], ['Preview', 'Live'], ['Data handling', 'Runs locally']],
    useCases: [['Social posts', 'Quick mood edits.'], ['Websites', 'Match a colour scheme.'], ['Prints', 'Try vintage looks.']],
    tips: ['Compare presets before downloading.', 'Use the original for further edits.', 'Keep resolution high.'],
    takeaways: ['Presets apply per-pixel transforms.', 'Original files stay unchanged.', 'Everything runs locally.'],
    faq: [['Can I stack filters?', 'Choose one preset at a time.'], ['Does it reduce quality?', 'No, output is full resolution PNG.'], ['Can I undo?', 'Reload the image.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Fine-tune brightness with the <a href="image-brightness-adjuster.html">brightness adjuster</a>.</p>'
  }
});

/* ========================================================================
   3. IMAGE BORDER ADDER
   ======================================================================== */
add({
  file: 'image-border-adder.html', folder: 'image',
  name: 'Image Border Adder', tag: 'Photo Editing', icon: 'fa-solid fa-square',
  title: 'Image Border Adder | Add a Frame to Photos',
  metaDesc: 'Add a solid colour border or frame around any image with a custom width, then download the result. Free and in-browser.',
  desc: 'Add a custom-width, custom-colour border around an image and download the framed PNG.',
  keywords: ['image border adder', 'add border to image', 'photo frame', 'picture border', 'image outline', 'photo editor'],
  featureList: ['Custom width', 'Custom colour', 'PNG download', '100% client-side'],
  panel: panel.wrap('bdr', 'fa-solid fa-square', 'Image border', IMG_IO +
    '<div class="row3"style="margin-bottom:14px">' +
    num('bdrW', 'Border width (px)', '20') +
    '<div class="field"><label for="bdrColor">Border colour</label><input id="bdrColor"type="color"value="#3b82f6"style="height:42px"></div>' +
    sel('bdrStyle', 'Position', [['outer', 'Around image'], ['inner', 'Inside image']]) +
    '</div>' + go('bdr')),
  js: IMG_JS + `
  function hex2rgb(h){h=h.replace("#","");return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16),255];}
  function draw(){if(!haveImg)return;var w=+document.getElementById("bdrW").value,col=hex2rgb(document.getElementById("bdrColor").value),style=document.getElementById("bdrStyle").value;
    var c=document.getElementById("PREVIEW");
    if(style==="outer"){c.width=img.naturalWidth+w*2;c.height=img.naturalHeight+w*2;var x=c.getContext("2d");x.fillStyle="rgba("+col.join(",")+")";x.fillRect(0,0,c.width,c.height);x.drawImage(img,w,w);}
    else{c.width=img.naturalWidth;c.height=img.naturalHeight;var x2=c.getContext("2d");x2.drawImage(img,0,0);x2.fillStyle="rgba("+col.join(",")+")";
      x2.fillRect(0,0,c.width,w);x2.fillRect(0,c.height-w,c.width,w);x2.fillRect(0,0,w,c.height);x2.fillRect(c.width-w,0,w,c.height);}
    document.getElementById("bdrProc").textContent="Border added in this tab - 0 bytes uploaded.";}
  ["bdrW","bdrColor","bdrStyle"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
  document.getElementById("bdrGo").addEventListener("click",draw);
  document.getElementById("bdrDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Image Border Adder: Frame Your Photos',
    lead: '<p>A clean border makes an image stand out. This <strong>image border adder</strong> wraps your photo in a solid colour frame of any width, inside or outside the picture.</p>',
    sections: [
      { id: 'outer', icon: 'fa-solid fa-expand', heading: 'Around or inside', html: '<p>An outer border grows the canvas, preserving the full image. An inner border overlays the frame, slightly covering the edges.</p>' },
      { id: 'colour', icon: 'fa-solid fa-palette', heading: 'Choosing a colour', html: '<p>Neutral borders work for everything, white suits product photos, and a brand colour ties images to a website. Pick with the colour wheel.</p>' }
    ],
    steps: ['Choose an image.', 'Set width, colour and position.', 'Download the framed PNG.'],
    facts: [['Inputs', 'Width, colour, position'], ['Output', 'PNG'], ['Preview', 'Live'], ['Data handling', 'Runs locally']],
    useCases: [['Product photos', 'Add a clean frame.'], ['Social media', 'Uniform borders.'], ['Prints', 'A classic white mat.']],
    tips: ['Use even widths for a tidy look.', 'Match a site palette.', 'Outer borders keep the whole photo.'],
    takeaways: ['Borders can be inside or outside.', 'Width and colour are fully custom.', 'Processing is local.'],
    faq: [['Will it cut my image?', 'Only with an inner border.'], ['What format is output?', 'PNG.'], ['Can I use a transparent border?', 'Use the colour picker; transparency is not supported.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Add a watermark too with the <a href="watermark-image.html">watermark tool</a>.</p>'
  }
});

/* ========================================================================
   4. IMAGE BRIGHTNESS ADJUSTER
   ======================================================================== */
add({
  file: 'image-brightness-adjuster.html', folder: 'image',
  name: 'Image Brightness Adjuster', tag: 'Photo Editing', icon: 'fa-solid fa-sun',
  title: 'Image Brightness Adjuster | Brighten or Darken Photos',
  metaDesc: 'Brighten or darken any image with a simple slider and download the adjusted PNG. Free, instant and fully in-browser.',
  desc: 'Raise or lower the brightness of a photo with a single slider and download the result.',
  keywords: ['image brightness adjuster', 'brighten image', 'darken image', 'photo brightness', 'exposure fix', 'image editor'],
  featureList: ['Brightness slider', 'Live preview', 'PNG download', '100% client-side'],
  panel: panel.wrap('brt', 'fa-solid fa-sun', 'Brightness', IMG_IO +
    '<div class="field"style="margin-bottom:14px"><label for="brtVal">Brightness (-100 to 100)</label><input id="brtVal"type="range"min="-100"max="100"value="25"style="width:100%"></div>' + go('brt')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var v=+document.getElementById("brtVal").value;
    var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;var x=c.getContext("2d");x.drawImage(img,0,0);
    var d=x.getImageData(0,0,c.width,c.height),p=d.data;
    for(var i=0;i<p.length;i+=4){p[i]=Math.max(0,Math.min(255,p[i]+v));p[i+1]=Math.max(0,Math.min(255,p[i+1]+v));p[i+2]=Math.max(0,Math.min(255,p[i+2]+v));}
    x.putImageData(d,0,0);document.getElementById("brtProc").textContent="Adjusted in this tab - 0 bytes uploaded.";}
  document.getElementById("brtVal").addEventListener("input",draw);
  document.getElementById("brtGo").addEventListener("click",draw);
  document.getElementById("brtDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Image Brightness Adjuster: Brighten or Darken',
    lead: '<p>Underexposed or washed-out photos just need a brightness nudge. This <strong>brightness adjuster</strong> adds or removes light with a live preview.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-sun', heading: 'How brightness works', html: '<p>The slider adds a fixed value to every colour channel. Positive values brighten, negative values darken, and clipping is limited so colours stay clean.</p>' },
      { id: 'when', icon: 'fa-solid fa-camera', heading: 'When to use it', html: '<p>Use brightness for overall exposure, then contrast to add punch. Together they recover flat photos without heavy editing software.</p>' }
    ],
    steps: ['Choose an image.', 'Drag the brightness slider.', 'Download the PNG.'],
    facts: [['Range', '-100 to 100'], ['Output', 'PNG'], ['Preview', 'Live'], ['Data handling', 'Runs locally']],
    useCases: [['Fixing exposure', 'Rescue dark photos.'], ['Consistency', 'Match a set of images.'], ['Web use', 'Brighten thumbnails.']],
    tips: ['Nudge in small steps.', 'Pair with contrast.', 'Avoid extreme values.'],
    takeaways: ['Brightness shifts all channels equally.', 'The preview updates live.', 'Output is a fresh PNG.'],
    faq: [['Does it clip highlights?', 'Values are clamped to a valid range.'], ['Can I darken?', 'Yes, use negative values.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Add punch with the <a href="image-contrast-adjuster.html">contrast adjuster</a>.</p>'
  }
});

/* ========================================================================
   5. IMAGE CONTRAST ADJUSTER
   ======================================================================== */
add({
  file: 'image-contrast-adjuster.html', folder: 'image',
  name: 'Image Contrast Adjuster', tag: 'Photo Editing', icon: 'fa-solid fa-circle-half-stroke',
  title: 'Image Contrast Adjuster | Boost or Soften Contrast',
  metaDesc: 'Increase or reduce the contrast of any image with a slider and download the result as PNG. Free and fully in-browser.',
  desc: 'Stretch or soften tonal range with a contrast slider, previewed live on a canvas.',
  keywords: ['image contrast adjuster', 'increase contrast', 'reduce contrast', 'photo contrast', 'punchy photo', 'image editor'],
  featureList: ['Contrast slider', 'Live preview', 'PNG download', '100% client-side'],
  panel: panel.wrap('ctr', 'fa-solid fa-circle-half-stroke', 'Contrast', IMG_IO +
    '<div class="field"style="margin-bottom:14px"><label for="ctrVal">Contrast (-100 to 100)</label><input id="ctrVal"type="range"min="-100"max="100"value="30"style="width:100%"></div>' + go('ctr')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var v=+document.getElementById("ctrVal").value,f=(259*(v+255))/(255*(259-v));
    var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;var x=c.getContext("2d");x.drawImage(img,0,0);
    var d=x.getImageData(0,0,c.width,c.height),p=d.data;
    for(var i=0;i<p.length;i+=4){p[i]=Math.max(0,Math.min(255,f*(p[i]-128)+128));p[i+1]=Math.max(0,Math.min(255,f*(p[i+1]-128)+128));p[i+2]=Math.max(0,Math.min(255,f*(p[i+2]-128)+128));}
    x.putImageData(d,0,0);document.getElementById("ctrProc").textContent="Adjusted in this tab - 0 bytes uploaded.";}
  document.getElementById("ctrVal").addEventListener("input",draw);
  document.getElementById("ctrGo").addEventListener("click",draw);
  document.getElementById("ctrDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Image Contrast Adjuster: Punch Up Your Photos',
    lead: '<p>Flat photos come alive with more contrast. This <strong>contrast adjuster</strong> stretches or softens the tonal range, previewed live before you download.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-circle-half-stroke', heading: 'How contrast works', html: '<p>A contrast factor pushes values away from mid-grey (128). Increasing it deepens shadows and brightens highlights; decreasing it flattens the image.</p>' },
      { id: 'balance', icon: 'fa-solid fa-scale-balanced', heading: 'Finding the balance', html: '<p>Too much contrast loses detail in shadows and highlights. Increase in moderation and check the preview before exporting.</p>' }
    ],
    steps: ['Choose an image.', 'Move the contrast slider.', 'Download the PNG.'],
    facts: [['Range', '-100 to 100'], ['Output', 'PNG'], ['Preview', 'Live'], ['Data handling', 'Runs locally']],
    useCases: [['Punchy photos', 'Add vibrancy.'], ['Scans', 'Improve faded documents.'], ['Websites', 'Sharpen thumbnails.']],
    tips: ['Watch for clipped detail.', 'Combine with brightness.', 'Use gentle values for portraits.'],
    takeaways: ['Contrast pivots around mid-grey.', 'Higher values add punch.', 'The preview guides the right amount.'],
    faq: [['Will it blow out highlights?', 'Extreme values can; check the preview.'], ['Can I flatten?', 'Yes, use negative values.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Balance the result with the <a href="image-brightness-adjuster.html">brightness adjuster</a>.</p>'
  }
});

/* ========================================================================
   6. IMAGE BLUR TOOL
   ======================================================================== */
add({
  file: 'image-blur-tool.html', folder: 'image',
  name: 'Image Blur Tool', tag: 'Photo Editing', icon: 'fa-solid fa-droplet',
  title: 'Image Blur Tool | Blur or Soften Photos Online',
  metaDesc: 'Apply a Gaussian-style blur to any image with an adjustable radius and download the softened result. Free and in-browser.',
  desc: 'Soften a photo with an adjustable blur radius, ideal for backgrounds or privacy masking.',
  keywords: ['image blur tool', 'blur photo', 'soften image', 'gaussian blur', 'privacy blur', 'image editor'],
  featureList: ['Adjustable radius', 'Live preview', 'PNG download', '100% client-side'],
  panel: panel.wrap('blr', 'fa-solid fa-droplet', 'Blur', IMG_IO +
    '<div class="field"style="margin-bottom:14px"><label for="blrVal">Blur radius (0-30)</label><input id="blrVal"type="range"min="0"max="30"value="8"style="width:100%"></div>' + go('blr')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var v=+document.getElementById("blrVal").value;
    var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;
    var x=c.getContext("2d");x.filter="blur("+v+"px)";x.drawImage(img,0,0);x.filter="none";
    document.getElementById("blrProc").textContent="Blurred in this tab - 0 bytes uploaded.";}
  document.getElementById("blrVal").addEventListener("input",draw);
  document.getElementById("blrGo").addEventListener("click",draw);
  document.getElementById("blrDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Image Blur Tool: Soften or Mask Photos',
    lead: '<p>Blur draws attention or hides detail. This <strong>image blur tool</strong> applies an adjustable softness to the whole image using the browser canvas filter.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-droplet', heading: 'How blur works', html: '<p>A blur averages each pixel with its neighbours over the chosen radius. Larger radii spread detail further, creating a soft, defocused look.</p>' },
      { id: 'privacy', icon: 'fa-solid fa-shield-halved', heading: 'Blur for privacy', html: '<p>Whole-image blur hides identifying detail, such as faces or plates. For targeted masking, combine with a crop after blurring.</p>' }
    ],
    steps: ['Choose an image.', 'Set the blur radius.', 'Download the PNG.'],
    facts: [['Type', 'Canvas blur filter'], ['Range', '0-30 px'], ['Output', 'PNG'], ['Data handling', 'Runs locally']],
    useCases: [['Privacy', 'Obscure sensitive detail.'], ['Backgrounds', 'Soften distractions.'], ['Creative', 'Soft dreamy looks.']],
    tips: ['Higher radii fully obscure detail.', 'Blur before cropping.', 'Keep a copy of the original.'],
    takeaways: ['Blur averages neighbouring pixels.', 'The radius controls softness.', 'Processing stays on your device.'],
    faq: [['Can I blur part of an image?', 'This blurs the whole image; crop afterwards.'], ['Is it reversible?', 'Keep your original copy.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Mask sensitive areas further with the <a href="image-pixelate-tool.html">pixelate tool</a>.</p>'
  }
});

/* ========================================================================
   7. IMAGE PIXELATE TOOL
   ======================================================================== */
add({
  file: 'image-pixelate-tool.html', folder: 'image',
  name: 'Image Pixelate Tool', tag: 'Photo Editing', icon: 'fa-solid fa-border-all',
  title: 'Image Pixelate Tool | Mosaic & Pixel Effects',
  metaDesc: 'Pixelate any image into a mosaic for a retro look or to mask detail, then download the result. Free and fully in-browser.',
  desc: 'Create a mosaic pixel effect by averaging blocks of the image, useful for retro art or masking.',
  keywords: ['image pixelate tool', 'pixelate photo', 'mosaic effect', 'pixelate to hide', 'retro image', 'image editor'],
  featureList: ['Adjustable block size', 'Live preview', 'PNG download', '100% client-side'],
  panel: panel.wrap('pxl', 'fa-solid fa-border-all', 'Pixelate', IMG_IO +
    '<div class="field"style="margin-bottom:14px"><label for="pxlSize">Pixel block size (2-40)</label><input id="pxlSize"type="range"min="2"max="40"value="12"style="width:100%"></div>' + go('pxl')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var bs=+document.getElementById("pxlSize").value;
    var tmp=document.createElement("canvas");tmp.width=Math.max(1,Math.floor(img.naturalWidth/bs));tmp.height=Math.max(1,Math.floor(img.naturalHeight/bs));
    var tx=tmp.getContext("2d");tx.drawImage(img,0,0,tmp.width,tmp.height);
    var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;
    var x=c.getContext("2d");x.imageSmoothingEnabled=false;x.drawImage(tmp,0,0,c.width,c.height);
    document.getElementById("pxlProc").textContent="Pixelated in this tab - 0 bytes uploaded.";}
  document.getElementById("pxlSize").addEventListener("input",draw);
  document.getElementById("pxlGo").addEventListener("click",draw);
  document.getElementById("pxlDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Image Pixelate Tool: Mosaic and Retro Effects',
    lead: '<p>Pixelation turns an image into blocks. This <strong>image pixelate tool</strong> downscales then upscales your photo for a mosaic effect you control.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-border-all', heading: 'How pixelation works', html: '<p>The image is drawn to a smaller canvas, averaging blocks of colour, then stretched back with smoothing off. Larger blocks mean a chunkier mosaic.</p>' },
      { id: 'use', icon: 'fa-solid fa-shield-halved', heading: 'Retro and privacy uses', html: '<p>Pixelation gives a deliberate retro or censor-bar look. For privacy it must be coarse enough that detail cannot be recovered.</p>' }
    ],
    steps: ['Choose an image.', 'Adjust the block size.', 'Download the PNG.'],
    facts: [['Effect', 'Mosaic blocks'], ['Range', '2-40 px'], ['Output', 'PNG'], ['Data handling', 'Runs locally']],
    useCases: [['Retro art', 'Pixel aesthetics.'], ['Masking', 'Hide sensitive content.'], ['Games', 'Pixel-style assets.']],
    tips: ['Bigger blocks hide more detail.', 'Small values keep recognisable shapes.', 'Combine with crop for targeted masking.'],
    takeaways: ['Pixelation averages colour blocks.', 'Block size controls the effect.', 'It runs locally and privately.'],
    faq: [['Is pixelation reversible?', 'Coarse pixelation cannot be undone.'], ['What block size hides faces?', 'Generally 12 px and above.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Compare with full <a href="image-blur-tool.html">blur</a> for softer masking.</p>'
  }
});

/* ========================================================================
   8. IMAGE GRAYSCALE TOOL
   ======================================================================== */
add({
  file: 'image-grayscale.html', folder: 'image',
  name: 'Image Grayscale Tool', tag: 'Photo Editing', icon: 'fa-solid fa-palette',
  title: 'Image Grayscale Tool | Convert Photo to Black & White',
  metaDesc: 'Convert any photo to black and white with proper luminance weighting and download the result. Free and fully in-browser.',
  desc: 'Turn a colour photo into a natural black-and-white image using luminance-weighted conversion.',
  keywords: ['image grayscale tool', 'black and white photo', 'convert to grayscale', 'bw converter', 'monochrome', 'image editor'],
  featureList: ['Luminance weighting', 'Live preview', 'PNG download', '100% client-side'],
  panel: panel.wrap('gry', 'fa-solid fa-palette', 'Grayscale', IMG_IO + go('gry')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;
    var x=c.getContext("2d");x.drawImage(img,0,0);var d=x.getImageData(0,0,c.width,c.height),p=d.data;
    for(var i=0;i<p.length;i+=4){var g=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2];p[i]=p[i+1]=p[i+2]=g;}
    x.putImageData(d,0,0);document.getElementById("gryProc").textContent="Converted in this tab - 0 bytes uploaded.";}
  document.getElementById("gryGo").addEventListener("click",draw);
  document.getElementById("gryDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Image Grayscale Tool: Convert to Black and White',
    lead: '<p>Black and white can make a photo timeless. This <strong>grayscale tool</strong> converts your image using luminance weighting, which matches how the eye perceives brightness.</p>',
    sections: [
      { id: 'luminance', icon: 'fa-solid fa-eye', heading: 'Why luminance weighting', html: '<p>A plain average of red, green and blue looks dull. Weighting green most heavily (0.587) and blue least (0.114) produces natural, balanced monochrome.</p>' },
      { id: 'use', icon: 'fa-solid fa-camera-retro', heading: 'When to go monochrome', html: '<p>Black and white suits high-contrast scenes, texture, and studies of light and shadow. It can also unify a set of mismatched photos.</p>' }
    ],
    steps: ['Choose an image.', 'Press Process to convert.', 'Download the PNG.'],
    facts: [['Method', 'Luminance weighting'], ['Output', 'PNG'], ['Preview', 'Live'], ['Data handling', 'Runs locally']],
    useCases: [['Artistic', 'Timeless black and white.'], ['Prints', 'Strong tonal images.'], ['Consistency', 'Unify a photo set.']],
    tips: ['Works best on contrasty photos.', 'Try a filter afterwards for tone.', 'Keep the original colour file.'],
    takeaways: ['Luminance weighting looks natural.', 'The original stays untouched.', 'Output is a full-resolution PNG.'],
    faq: [['Is it true black and white?', 'Yes, all channels are equalised.'], ['Can I add a tint?', 'Apply a sepia filter after.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Add warm tone with the <a href="image-filter-tool.html">image filter tool</a>.</p>'
  }
});

/* ========================================================================
   9. IMAGE SPLITTER
   ======================================================================== */
add({
  file: 'image-splitter.html', folder: 'image',
  name: 'Image Splitter', tag: 'Photo Editing', icon: 'fa-solid fa-table-cells',
  title: 'Image Splitter | Cut into a Grid of Tiles',
  metaDesc: 'Split any image into a grid of equal tiles and download each piece for puzzles, grids or social media. Free and in-browser.',
  desc: 'Divide an image into a chosen grid of tiles and download each tile as a separate PNG.',
  keywords: ['image splitter', 'split image', 'grid splitter', 'image tiles', 'cut image into grid', 'photo splitter'],
  featureList: ['Custom grid', 'Download all tiles', 'Works on any image', '100% client-side'],
  panel: panel.wrap('spl', 'fa-solid fa-table-cells', 'Image splitter', IMG_IO +
    '<div class="row3"style="margin-bottom:14px">' + num('splCols', 'Columns', '3') + num('splRows', 'Rows', '3') + '</div>' + go('spl', 'Split image') +
    '<div id="splOut"class="result-grid"style="margin-top:14px"></div>'),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var cols=+document.getElementById("splCols").value,rows=+document.getElementById("splRows").value;
    var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext("2d").drawImage(img,0,0);
    var out=document.getElementById("splOut");out.innerHTML="";
    var tw=Math.floor(img.naturalWidth/cols),th=Math.floor(img.naturalHeight/rows);
    for(var r=0;r<rows;r++){for(var q=0;q<cols;q++){var tc=document.createElement("canvas");tc.width=tw;tc.height=th;
      tc.getContext("2d").drawImage(img,q*tw,r*th,tw,th,0,0,tw,th);
      var a=document.createElement("a");a.href=tc.toDataURL("image/png");a.download="tile-"+(r+1)+"-"+(q+1)+".png";a.textContent="Tile "+(r+1)+"-"+(q+1);a.className="rt-btn";a.style.margin="4px";out.appendChild(a);}}
    document.getElementById("splProc").textContent="Split into "+(cols*rows)+" tiles - 0 bytes uploaded.";}
  ["splCols","splRows"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
  document.getElementById("splGo").addEventListener("click",draw);`,
  article: {
    title: 'Image Splitter: Cut Photos into a Grid',
    lead: '<p>Splitting an image into tiles is handy for puzzle crafts, Instagram grids and print layouts. This <strong>image splitter</strong> divides your photo into equal pieces you download individually.</p>',
    sections: [
      { id: 'grid', icon: 'fa-solid fa-table-cells', heading: 'How the grid works', html: '<p>The image is divided into the columns and rows you choose. Each resulting tile is a separate PNG, ready to reassemble elsewhere.</p>' },
      { id: 'uses', icon: 'fa-solid fa-puzzle-piece', heading: 'Popular uses', html: '<p>Make a paper puzzle, produce a multi-post social grid, or export a single illustration as separate panels.</p>' }
    ],
    steps: ['Choose an image.', 'Set columns and rows.', 'Download the tiles you need.'],
    facts: [['Grid', 'Custom rows/columns'], ['Output', 'PNG tiles'], ['Input', 'Any image'], ['Data handling', 'Runs locally']],
    useCases: [['Puzzles', 'Make a photo jigsaw.'], ['Social grids', 'Plan multi-post layouts.'], ['Print', 'Panels for assembly.']],
    tips: ['Use dimensions divisible by the grid.', 'Download tiles individually.', 'Keep tiles in order.'],
    takeaways: ['Split into any grid size.', 'Each tile is a standalone PNG.', 'Everything runs locally.'],
    faq: [['Will tiles be equal?', 'Yes, based on integer division.'], ['Can I merge them back?', 'Use a collage or grid layout tool.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Reassemble or arrange with the <a href="image-collage-maker.html">collage maker</a>.</p>'
  }
});

/* ========================================================================
   10. CIRCLE CROP TOOL
   ======================================================================== */
add({
  file: 'circle-crop-tool.html', folder: 'image',
  name: 'Circle Crop Tool', tag: 'Photo Editing', icon: 'fa-solid fa-circle',
  title: 'Circle Crop Tool | Round Profile Pictures',
  metaDesc: 'Crop any image into a perfect circle with a transparent background, ideal for avatars and profiles. Free and in-browser.',
  desc: 'Crop an image into a circle with a transparent background, perfect for avatars and profile pictures.',
  keywords: ['circle crop tool', 'round image crop', 'circular avatar', 'crop to circle', 'profile picture crop', 'image editor'],
  featureList: ['Perfect circle crop', 'Transparent background', 'PNG output', '100% client-side'],
  panel: panel.wrap('cir', 'fa-solid fa-circle', 'Circle crop', IMG_IO + go('cir', 'Crop to circle')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var s=Math.min(img.naturalWidth,img.naturalHeight);
    var c=document.getElementById("PREVIEW");c.width=s;c.height=s;var x=c.getContext("2d");
    x.clearRect(0,0,s,s);x.save();x.beginPath();x.arc(s/2,s/2,s/2,0,Math.PI*2);x.closePath();x.clip();
    x.drawImage(img,(img.naturalWidth-s)/2,(img.naturalHeight-s)/2,s,s,0,0,s,s);x.restore();
    document.getElementById("cirProc").textContent="Cropped to circle - 0 bytes uploaded.";}
  document.getElementById("cirGo").addEventListener("click",draw);
  document.getElementById("cirDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Circle Crop Tool: Round Profile Pictures',
    lead: '<p>Round avatars look clean and modern. This <strong>circle crop tool</strong> cuts your image into a perfect circle with a transparent background, ready for any profile.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-crop', heading: 'How the crop works', html: '<p>A centred square is clipped to a circle, so a wide or tall image is cropped from its middle. The area outside the circle stays transparent.</p>' },
      { id: 'fix', icon: 'fa-solid fa-user', heading: 'Framing faces', html: '<p>Crop your source so the face is centred before uploading. That keeps the important part inside the circle.</p>' }
    ],
    steps: ['Choose a square-ish image.', 'Press Crop to circle.', 'Download the transparent PNG.'],
    facts: [['Shape', 'Circle'], ['Background', 'Transparent'], ['Output', 'PNG'], ['Data handling', 'Runs locally']],
    useCases: [['Avatars', 'Profile pictures.'], ['Logos', 'Round brand marks.'], ['Stickers', 'Circular cut-outs.']],
    tips: ['Pre-crop to a square for best framing.', 'PNG keeps transparency.', 'Centre the subject first.'],
    takeaways: ['The crop centres on the image.', 'Transparency needs PNG.', 'Source framing controls the result.'],
    faq: [['Does it support transparency?', 'Yes, output is a transparent PNG.'], ['Will it distort my image?', 'No, it crops rather than stretches.'], ['Can I crop off-centre?', 'Pre-crop your source first.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Add a ring using the <a href="image-border-adder.html">border adder</a>.</p>'
  }
});

/* ========================================================================
   11. IMAGE TO HTML CONVERTER
   ======================================================================== */
add({
  file: 'image-to-html.html', folder: 'image',
  name: 'Image to HTML Converter', tag: 'Web Tools', icon: 'fa-solid fa-code',
  title: 'Image to HTML Converter | Photo to Base64 HTML',
  metaDesc: 'Convert an image into an HTML snippet with an embedded base64 data URI. Copy ready-to-paste markup. Free and in-browser.',
  desc: 'Generate an HTML img tag with an embedded base64 data URI so the image travels inside your HTML file.',
  keywords: ['image to html', 'base64 image html', 'embed image html', 'data uri image', 'html img tag', 'web tool'],
  featureList: ['Base64 embed', 'Copy-ready markup', 'Adjustable sizing', '100% client-side'],
  panel: panel.wrap('i2h', 'fa-solid fa-code', 'Image to HTML',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div class="io-field"><label for="FILEIN">Choose image</label><input id="FILEIN"type="file"accept="image/*"style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px"></div>' +
    '<div class="io-field"><label for="i2hOut">HTML output</label><textarea id="i2hOut"readonly style="min-height:220px"></textarea></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="i2hGo"><i class="fa-solid fa-code"></i>Generate HTML</button> ' +
    '<button class="rt-btn"type="button"id="i2hCopy"><i class="fa-solid fa-copy"></i>Copy</button></div>'),
  js: `
    var dataUri="";
    document.getElementById("FILEIN").addEventListener("change",function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(e){dataUri=e.target.result;gen();};r.readAsDataURL(f);});
    function gen(){if(!dataUri)return;document.getElementById("i2hOut").value='<img src="'+dataUri+'" alt="Embedded image" />';document.getElementById("i2hProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.getElementById("i2hGo").addEventListener("click",gen);
    document.getElementById("i2hCopy").addEventListener("click",function(){document.getElementById("i2hOut").select();document.execCommand("copy");});`,
  article: {
    title: 'Image to HTML Converter: Embed Images as Base64',
    lead: '<p>Embedding an image directly in HTML removes an external file request. This <strong>image to HTML converter</strong> builds an <code>img</code> tag with a base64 data URI.</p>',
    sections: [
      { id: 'base64', icon: 'fa-solid fa-database', heading: 'How base64 embedding works', html: '<p>The image bytes are encoded as text and placed in the src attribute as a data URI. The browser renders it without a separate image file.</p>' },
      { id: 'tradeoffs', icon: 'fa-solid fa-scale-balanced', heading: 'When to embed', html: '<p>Embedding suits small icons and single-file exports. For large photos it inflates HTML size, so external files are usually better.</p>' }
    ],
    steps: ['Choose an image.', 'Press Generate HTML.', 'Copy the image tag into your page.'],
    facts: [['Output', 'HTML img tag'], ['Encoding', 'Base64 data URI'], ['Copy', 'One click'], ['Data handling', 'Runs locally']],
    useCases: [['Email templates', 'Self-contained images.'], ['Single-file pages', 'No extra assets.'], ['Quick embeds', 'Paste anywhere.']],
    tips: ['Keep embedded images small.', 'Add meaningful alt text.', 'Test size before shipping.'],
    takeaways: ['Data URIs embed images as text.', 'Great for small icons.', 'Large images bloat HTML.'],
    faq: [['Is base64 larger?', 'Yes, roughly a third bigger than the binary.'], ['Does it work in email?', 'Many clients support data URIs.'], ['Can I resize?', 'Resize first with the image resizer.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Start from a resized image with the <a href="image-resizer.html">image resizer</a>.</p>'
  }
});

/* ========================================================================
   12. FAVICON GENERATOR
   ======================================================================== */
add({
  file: 'favicon-generator.html', folder: 'image',
  name: 'Favicon Generator', tag: 'Web Tools', icon: 'fa-solid fa-star',
  title: 'Favicon Generator | PNG and ICO from Image or Text',
  metaDesc: 'Generate a square favicon from an image (PNG at multiple sizes) right in your browser. Free, private and instant.',
  desc: 'Produce square favicon PNGs at common sizes from any image, with a preview of each size.',
  keywords: ['favicon generator', 'favicon from image', 'website icon', 'png favicon', 'site icon', 'web tool'],
  featureList: ['PNG at 16/32/48/64', 'Text or image', 'Instant preview', '100% client-side'],
  panel: panel.wrap('fav', 'fa-solid fa-star', 'Favicon generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div class="io-field"><label for="FILEIN">Choose image</label><input id="FILEIN"type="file"accept="image/*"style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px"></div>' +
    '<div class="io-field"><label>Preview (32px)</label><canvas id="PREVIEW"width="32"height="32"style="border:1px solid var(--border);border-radius:8px;background:#0e1116;image-rendering:pixelated"></canvas></div></div>' +
    go('fav', 'Generate favicons') + '<div id="favOut"class="result-grid"style="margin-top:14px"></div>'),
  js: `
    var img=new Image(),haveImg=false;
    document.getElementById("FILEIN").addEventListener("change",function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(e){img.onload=function(){haveImg=true;run();};img.src=e.target.result;};r.readAsDataURL(f);});
    function run(){if(!haveImg)return;var sizes=[16,32,48,64];var out=document.getElementById("favOut");out.innerHTML="";
      var preview=document.getElementById("PREVIEW").getContext("2d");preview.clearRect(0,0,32,32);preview.drawImage(img,0,0,32,32);
      sizes.forEach(function(s){var c=document.createElement("canvas");c.width=s;c.height=s;c.getContext("2d").drawImage(img,0,0,s,s);
        var a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="favicon-"+s+".png";a.textContent=s+"x"+s+" PNG";a.className="rt-btn";a.style.margin="4px";out.appendChild(a);});
      document.getElementById("favProc").textContent="Generated 4 sizes - 0 bytes uploaded.";}
    document.getElementById("favGo").addEventListener("click",run);`,
  article: {
    title: 'Favicon Generator: Create Website Icons',
    lead: '<p>A favicon is the small icon beside your page title. This <strong>favicon generator</strong> turns any image into square PNG favicons at the common sizes.</p>',
    sections: [
      { id: 'sizes', icon: 'fa-solid fa-ruler-combined', heading: 'Which sizes to use', html: '<p>16 and 32 pixels cover browser tabs, 48 suits desktop shortcuts and 64 gives headroom for high-density screens. Modern browsers accept PNG favicons directly.</p>' },
      { id: 'source', icon: 'fa-solid fa-image', heading: 'Choosing a source', html: '<p>Simple, bold graphics survive shrinking best. Avoid fine detail that disappears at 16 pixels.</p>' }
    ],
    steps: ['Choose an image.', 'Press Generate favicons.', 'Download the sizes you need.'],
    facts: [['Sizes', '16/32/48/64'], ['Format', 'PNG'], ['Input', 'Any image'], ['Data handling', 'Runs locally']],
    useCases: [['Websites', 'Add a site icon.'], ['Web apps', 'Install icons.'], ['Bookmarks', 'Recognisable tabs.']],
    tips: ['Use a bold, simple graphic.', 'Test at 16 px.', 'Keep a square master image.'],
    takeaways: ['Favicons should be square and simple.', 'PNG works in modern browsers.', 'Multiple sizes cover more contexts.'],
    faq: [['Can I make an .ico?', 'This tool outputs PNG, which browsers accept.'], ['Which size is essential?', '16 and 32 pixels.'], ['Will it crop?', 'It scales the image to a square.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Prepare the source with the <a href="circle-crop-tool.html">circle crop tool</a>.</p>'
  }
});

/* ========================================================================
   13. PHOTO TO SKETCH
   ======================================================================== */
add({
  file: 'photo-to-sketch.html', folder: 'image',
  name: 'Photo to Sketch Converter', tag: 'Photo Editing', icon: 'fa-solid fa-pen-fancy',
  title: 'Photo to Sketch Converter | Pencil Drawing Effect',
  metaDesc: 'Turn a photo into a pencil sketch effect using an edge-detection technique, then download the result. Free and in-browser.',
  desc: 'Apply a pencil-sketch effect to a photo with edge detection, previewed live before download.',
  keywords: ['photo to sketch', 'pencil sketch effect', 'photo to drawing', 'sketch converter', 'line art', 'image editor'],
  featureList: ['Edge-detection sketch', 'Live preview', 'PNG download', '100% client-side'],
  panel: panel.wrap('skh', 'fa-solid fa-pen-fancy', 'Photo to sketch', IMG_IO + go('skh', 'Create sketch')),
  js: IMG_JS + `
  function draw(){if(!haveImg)return;var w=img.naturalWidth,h=img.naturalHeight;
    var c=document.getElementById("PREVIEW");c.width=w;c.height=h;var x=c.getContext("2d");x.drawImage(img,0,0);
    var d=x.getImageData(0,0,w,h),p=d.data;
    var g=new Uint8ClampedArray(w*h);
    for(var i=0;i<p.length;i+=4){g[i/4]=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2];}
    for(var y=0;y<h;y++){for(var xx=0;xx<w;xx++){var idx=y*w+xx;
      var x1=(xx<w-1)?g[idx+1]:g[idx],y1=(y<h-1)?g[idx+w]:g[idx];
      var dx=g[idx]-x1,dy=g[idx]-y1;var mag=Math.min(255,Math.sqrt(dx*dx+dy*dy));
      var v=255-mag;var o=idx*4;p[o]=p[o+1]=p[o+2]=v;p[o+3]=255;}}
    x.putImageData(d,0,0);document.getElementById("skhProc").textContent="Sketch created in this tab - 0 bytes uploaded.";}
  document.getElementById("skhGo").addEventListener("click",draw);
  document.getElementById("skhDl").addEventListener("click",function(){if(haveImg)out();});`,
  article: {
    title: 'Photo to Sketch Converter: Pencil Effect',
    lead: '<p>A pencil sketch highlights the structure of a photo. This <strong>photo to sketch converter</strong> detects edges and renders them as dark lines on white.</p>',
    sections: [
      { id: 'edge', icon: 'fa-solid fa-pen-fancy', heading: 'Edge detection', html: '<p>Each pixel is compared with its neighbours; where brightness changes sharply, an edge exists. Inverting that edge strength produces dark lines on a light background.</p>' },
      { id: 'result', icon: 'fa-solid fa-lightbulb', heading: 'Best results', html: '<p>Photos with clear subjects and moderate contrast sketch best. Very flat or very noisy images produce sparse or scratchy lines.</p>' }
    ],
    steps: ['Choose a photo.', 'Press Create sketch.', 'Download the PNG.'],
    facts: [['Method', 'Edge detection'], ['Output', 'PNG'], ['Preview', 'Live'], ['Data handling', 'Runs locally']],
    useCases: [['Art', 'Drawing references.'], ['Cards', 'Sketch-style keepsakes.'], ['Design', 'Line-art bases.']],
    tips: ['Use a clear, contrasty subject.', 'Larger images keep fine edges.', 'Combine with contrast for punch.'],
    takeaways: ['Edges become pencil-like lines.', 'Contrast improves the effect.', 'Output is a full-resolution PNG.'],
    faq: [['Does it look like a real drawing?', 'It is an automatic sketch effect.'], ['Can I control strength?', 'Contrast first, then sketch.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Boost edges first with the <a href="image-contrast-adjuster.html">contrast adjuster</a>.</p>'
  }
});

/* ========================================================================
   14. MEME GENERATOR
   ======================================================================== */
add({
  file: 'meme-generator.html', folder: 'fun',
  name: 'Meme Generator', tag: 'Fun', icon: 'fa-solid fa-face-laugh-squint',
  title: 'Meme Generator | Add Top and Bottom Text to Images',
  metaDesc: 'Create a meme by adding top and bottom text to any image with the classic Impact style. Download the result. Free and in-browser.',
  desc: 'Add bold top and bottom captions to an image in the classic meme style and download the PNG.',
  keywords: ['meme generator', 'meme maker', 'add text to image', 'caption image', 'funny meme', 'image caption'],
  featureList: ['Top and bottom text', 'Classic Impact font', 'PNG download', '100% client-side'],
  panel: panel.wrap('mem', 'fa-solid fa-face-laugh-squint', 'Meme generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div class="io-field"><label for="FILEIN">Choose image</label><input id="FILEIN"type="file"accept="image/*"style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px">' +
    '<label style="margin-top:10px">Top text</label><input id="memTop"type="text"value="TOP TEXT"style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px">' +
    '<label style="margin-top:10px">Bottom text</label><input id="memBot"type="text"value="BOTTOM TEXT"style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px"></div>' +
    '<div class="io-field"><label>Preview</label><canvas id="PREVIEW"style="max-width:100%;border:1px solid var(--border);border-radius:10px;background:#0e1116"></canvas></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="memGo"><i class="fa-solid fa-wand-magic-sparkles"></i>Render meme</button> ' +
    '<button class="rt-btn"type="button"id="memDl"><i class="fa-solid fa-download"></i>Download PNG</button></div>'),
  js: `
    var img=new Image(),haveImg=false;
    document.getElementById("FILEIN").addEventListener("change",function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(e){img.onload=function(){haveImg=true;run();};img.src=e.target.result;};r.readAsDataURL(f);});
    function cap(x,txt,w,h,top){if(!txt)return;var size=Math.max(16,Math.floor(w/12));x.font="bold "+size+"px Impact,Arial,sans-serif";x.textAlign="center";x.lineWidth=Math.max(2,size/8);x.strokeStyle="#000";x.fillStyle="#fff";
      var lines=[];var words=txt.split(" "),line="";for(var i=0;i<words.length;i++){var test=line?line+" "+words[i]:words[i];if(x.measureText(test).width>w*0.9&&line){lines.push(line);line=words[i];}else line=test;}if(line)lines.push(line);
      lines.forEach(function(l,li){var yy=(top?size+li*size*1.1:h-size-((lines.length-1-li)*size*1.1));x.strokeText(l,w/2,yy);x.fillText(l,w/2,yy);});}
    function run(){if(!haveImg)return;var c=document.getElementById("PREVIEW");c.width=img.naturalWidth;c.height=img.naturalHeight;var x=c.getContext("2d");x.drawImage(img,0,0);
      cap(x,document.getElementById("memTop").value,c.width,c.height,true);cap(x,document.getElementById("memBot").value,c.width,c.height,false);
      document.getElementById("memProc").textContent="Meme rendered in this tab - 0 bytes uploaded.";}
    ["memTop","memBot"].forEach(function(id){document.getElementById(id).addEventListener("input",run);});
    document.getElementById("memGo").addEventListener("click",run);
    document.getElementById("memDl").addEventListener("click",function(){if(!haveImg)return;document.getElementById("PREVIEW").toBlob(function(bl){var a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download="meme.png";a.click();URL.revokeObjectURL(a.href);});});`,
  article: {
    title: 'Meme Generator: Caption Any Image',
    lead: '<p>Make a meme in seconds. This <strong>meme generator</strong> adds bold top and bottom captions in the classic Impact style, wrapped automatically.</p>',
    sections: [
      { id: 'classic', icon: 'fa-solid fa-face-laugh-squint', heading: 'The classic style', html: '<p>Meme text uses white Impact letters with a black outline so it reads over any photo. The generator wraps long lines to keep them on screen.</p>' },
      { id: 'tips', icon: 'fa-solid fa-lightbulb', heading: 'Making it land', html: '<p>Keep captions short and let the image carry the joke. The top line sets up, the bottom line delivers.</p>' }
    ],
    steps: ['Choose a background image.', 'Type top and bottom text.', 'Download the PNG.'],
    facts: [['Font', 'Impact style'], ['Text', 'Top and bottom'], ['Output', 'PNG'], ['Data handling', 'Runs locally']],
    useCases: [['Social media', 'Shareable laughs.'], ['Group chats', 'Custom reactions.'], ['Fun', 'Caption friends photos.']],
    tips: ['Keep text short.', 'Wrap happens automatically.', 'Use clear, high-contrast images.'],
    takeaways: ['Classic meme styling is automatic.', 'Long lines wrap to fit.', 'Output is a fresh PNG.'],
    faq: [['Can I move the text?', 'Text is fixed at top and bottom.'], ['What font is used?', 'An Impact-style bold font.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Resize the result with the <a href="image-resizer.html">image resizer</a>.</p>'
  }
});

/* ========================================================================
   15. COLLAGE MAKER
   ======================================================================== */
add({
  file: 'image-collage-maker.html', folder: 'image',
  name: 'Image Collage Maker', tag: 'Photo Editing', icon: 'fa-solid fa-images',
  title: 'Image Collage Maker | Combine Photos into One',
  metaDesc: 'Combine several images into a single grid collage, processed entirely in your browser. Free, private and instant.',
  desc: 'Arrange multiple images into an even grid collage and download the combined PNG.',
  keywords: ['image collage maker', 'photo collage', 'combine photos', 'grid collage', 'photo grid', 'image editor'],
  featureList: ['Multi-image grid', 'Even layout', 'PNG download', '100% client-side'],
  panel: panel.wrap('col', 'fa-solid fa-images', 'Collage maker',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div class="io-field"><label for="colFiles">Choose images (2-9)</label><input id="colFiles"type="file"accept="image/*"multiple style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px"></div>' +
    '<div class="io-field"><label>Preview</label><canvas id="PREVIEW"style="max-width:100%;border:1px solid var(--border);border-radius:10px;background:#0e1116"></canvas></div></div>' +
    '<div class="row3"style="margin-bottom:14px">' + num('colCols', 'Columns', '3') + num('colGap', 'Gap (px)', '8') + num('colCell', 'Cell size (px)', '300') + '</div>' +
    go('col', 'Build collage')),
  js: `
    var imgs=[];
    document.getElementById("colFiles").addEventListener("change",function(){var fs=[].slice.call(this.files).slice(0,9);imgs=[];var n=0;
      fs.forEach(function(f,idx){var r=new FileReader();r.onload=function(e){var im=new Image();im.onload=function(){imgs[idx]=im;n++;if(n===fs.length)draw();};im.src=e.target.result;};r.readAsDataURL(f);});});
    function draw(){var cols=+document.getElementById("colCols").value,gap=+document.getElementById("colGap").value,cell=+document.getElementById("colCell").value;
      var list=imgs.filter(Boolean);if(!list.length)return;var rows=Math.ceil(list.length/cols);
      var c=document.getElementById("PREVIEW");c.width=cols*cell+(cols+1)*gap;c.height=rows*cell+(rows+1)*gap;var x=c.getContext("2d");
      x.fillStyle="#111";x.fillRect(0,0,c.width,c.height);
      list.forEach(function(im,i){var r=Math.floor(i/cols),q=i%cols,ox=gap+q*(cell+gap),oy=gap+r*(cell+gap);
        var s=Math.max(cell/im.width,cell/im.height),dw=im.width*s,dh=im.height*s;
        x.save();x.beginPath();x.rect(ox,oy,cell,cell);x.clip();x.drawImage(im,ox+(cell-dw)/2,oy+(cell-dh)/2,dw,dh);x.restore();});
      document.getElementById("colProc").textContent="Collage built in this tab - 0 bytes uploaded.";}
    ["colCols","colGap","colCell"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
    document.getElementById("colGo").addEventListener("click",draw);
    document.getElementById("colDl").addEventListener("click",function(){if(imgs.filter(Boolean).length)out();});`,
  article: {
    title: 'Image Collage Maker: Combine Photos',
    lead: '<p>Bring several photos together into one image. This <strong>collage maker</strong> lays your pictures out in an even grid with adjustable gaps and cell size.</p>',
    sections: [
      { id: 'grid', icon: 'fa-solid fa-table-cells', heading: 'Grid layout', html: '<p>Choose columns and a cell size; rows are added automatically as needed. Each image is centre-cropped to fill its cell, keeping the grid tidy.</p>' },
      { id: 'tips', icon: 'fa-solid fa-lightbulb', heading: 'Design tips', html: '<p>Similar aspect ratios look best. A small gap frames each photo; a larger cell size gives more detail.</p>' }
    ],
    steps: ['Select 2 to 9 images.', 'Set columns, gap and cell size.', 'Download the collage PNG.'],
    facts: [['Layout', 'Even grid'], ['Images', '2-9'], ['Output', 'PNG'], ['Data handling', 'Runs locally']],
    useCases: [['Travel', 'Trip highlights.'], ['Products', 'Showcase a range.'], ['Social', 'Weekly round-ups.']],
    tips: ['Use similar-sized images.', 'Adjust gap for framing.', 'Increase cell size for clarity.'],
    takeaways: ['Images are centre-cropped into cells.', 'Rows auto-expand with the count.', 'Processing is local.'],
    faq: [['How many images?', 'Up to nine.'], ['Does it crop?', 'Yes, to fill each square cell.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Crop individual images first with the <a href="circle-crop-tool.html">circle crop tool</a>.</p>'
  }
});

/* ========================================================================
   16. IMAGE CAROUSEL MAKER
   ======================================================================== */
add({
  file: 'image-carousel-maker.html', folder: 'image',
  name: 'Image Carousel Maker', tag: 'Photo Editing', icon: 'fa-solid fa-clapperboard',
  title: 'Image Carousel Maker | Preview Sliding Images',
  metaDesc: 'Build a simple sliding image carousel from your pictures with next/previous controls, all in the browser. Free and private.',
  desc: 'Assemble a lightweight sliding image carousel with navigation controls, generated entirely in the browser.',
  keywords: ['image carousel maker', 'photo slider', 'slideshow maker', 'image slideshow', 'carousel preview', 'image editor'],
  featureList: ['Multiple images', 'Prev/next controls', 'Auto height', '100% client-side'],
  panel: panel.wrap('car', 'fa-solid fa-clapperboard', 'Carousel maker',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div class="io-field"><label for="carFiles">Choose images</label><input id="carFiles"type="file"accept="image/*"multiple style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px"></div>' +
    '<div class="io-field"><label>Carousel</label><img id="carView"alt="carousel preview"style="max-width:100%;border:1px solid var(--border);border-radius:10px;background:#0e1116;min-height:120px"></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="carPrev"><i class="fa-solid fa-chevron-left"></i>Previous</button> ' +
    '<button class="btn btn-primary"type="button"id="carNext"><i class="fa-solid fa-chevron-right"></i>Next</button>' +
    '<span id="carInfo"style="margin-left:10px;color:var(--muted)"></span></div>'),
  js: `
    var urls=[],idx=0;
    document.getElementById("carFiles").addEventListener("change",function(){var fs=[].slice.call(this.files);urls=[];
      fs.forEach(function(f){var r=new FileReader();r.onload=function(e){urls.push(e.target.result);show();};r.readAsDataURL(f);});});
    function show(){if(!urls.length)return;var v=document.getElementById("carView");v.src=urls[idx];document.getElementById("carInfo").textContent=(idx+1)+" / "+urls.length;document.getElementById("carProc").textContent="Carousel ready - 0 bytes uploaded.";}
    document.getElementById("carPrev").addEventListener("click",function(){if(!urls.length)return;idx=(idx-1+urls.length)%urls.length;show();});
    document.getElementById("carNext").addEventListener("click",function(){if(!urls.length)return;idx=(idx+1)%urls.length;show();});`,
  article: {
    title: 'Image Carousel Maker: Build a Photo Slider',
    lead: '<p>Preview a set of images as a slider. This <strong>image carousel maker</strong> loads your pictures and lets you step through them with previous and next controls.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-clapperboard', heading: 'How it works', html: '<p>Each chosen image is loaded into the browser and shown one at a time. Navigation cycles through the list, wrapping at the ends.</p>' },
      { id: 'use', icon: 'fa-solid fa-lightbulb', heading: 'Where it helps', html: '<p>Check the sequence and rhythm of a set before building a website slider, or present photos quickly without gallery software.</p>' }
    ],
    steps: ['Select several images.', 'Use Previous and Next to browse.', 'Note the order for your build.'],
    facts: [['Type', 'Sliding viewer'], ['Controls', 'Prev/next'], ['Input', 'Multiple images'], ['Data handling', 'Runs locally']],
    useCases: [['Previewing', 'Check a photo set.'], ['Presenting', 'Quick slideshow.'], ['Planning', 'Decide image order.']],
    tips: ['Choose images of similar size.', 'Order matters for impact.', 'Everything stays on your device.'],
    takeaways: ['The carousel cycles through your images.', 'Controls wrap at the ends.', 'No files are uploaded.'],
    faq: [['Does it auto-play?', 'No, advance manually.'], ['How many images?', 'Any number you select.'], ['Can I export it?', 'It is a preview tool.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Combine stills into one frame with the <a href="image-collage-maker.html">collage maker</a>.</p>'
  }
});

/* ========================================================================
   17. BARCODE GENERATOR
   ======================================================================== */
add({
  file: 'barcode-generator.html', folder: 'image',
  name: 'Barcode Generator', tag: 'Utility', icon: 'fa-solid fa-barcode',
  title: 'Barcode Generator | Code 128 & EAN Barcodes',
  metaDesc: 'Generate Code 128 and EAN-13 barcodes from your data and download them as PNG. Free, private and fully in-browser.',
  desc: 'Create Code 128 or EAN-13 barcodes from text or numbers and download them as PNG images.',
  keywords: ['barcode generator', 'code 128', 'ean-13 barcode', 'create barcode', 'barcode png', 'barcode maker'],
  featureList: ['Code 128 & EAN-13', 'PNG download', 'Input validation', '100% client-side'],
  panel: panel.wrap('bar', 'fa-solid fa-barcode', 'Barcode generator',
    '<div class="row3"style="margin-bottom:14px">' +
    '<div class="field"><label for="barType">Type</label><select id="barType"><option value="code128">Code 128</option><option value="ean13">EAN-13</option></select></div>' +
    '<div class="field"><label for="barData">Data</label><input id="barData"type="text"value="TROOLIFY-2026"></div>' +
    '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="barGo"><i class="fa-solid fa-barcode"></i>Generate</button> ' +
    '<button class="rt-btn"type="button"id="barDl"><i class="fa-solid fa-download"></i>Download PNG</button></div>' +
    '<div style="margin-top:14px"><canvas id="barCv"style="max-width:100%;background:#fff;border-radius:8px"></canvas></div>'),
  js: `
    var C128=[11011001100,11001101100,11001100110,10010011000,10010001100,10001001100,10011001000,10011000100,10001100100,11001001000,11001000100,11000100100,10110011100,10011011100,10011001110,10111001100,10011101100,10011100110,11001110010,11001011100,11001001110,11011100100,11001110100,11101101110,11101001100,11100101100,11100100110,11101100100,11100110100,11100110010,11011011000,11011000110,11000110110,10100011000,10001011000,10001000110,10110001000,10001101000,10001100010,11010001000,11000101000,11000100010,10110111000,10110001110,10001101110,10111011000,10111000110,10001110110,11101110110,11010001110,11000101110,11011101000,11011100010,11011101110,11101011000,11101000110,11100010110,11101101000,11101100010,11100011010,11101111010,11001000010,11110001010,10100110000,10100001100,10010110000,10010000110,10000101100,10000100110,10110010000,10110000100,10011010000,10011000010,10000110100,10000110010,11000010010,11001010000,11110111010,11000010100,10001111010,10100111100,10010111100,10010011110,10111100100,10011110100,10011110010,11110100100,11110010100,11110010010,11011011110,11011110110,11110110110,10101111000,10100011110,10001011110,10111101000,10111100010,11110101000,11110100010,10111011110,10111101110,11101011110,11110101110,11010000100,11010010000,11010011100,1100011101011];
    function render128(s){var start=104,checksum=start;var patterns=[];patterns.push(C128[start]);
      for(var i=0;i<s.length;i++){var v=s.charCodeAt(i);if(v<32||v>126)v=32;var idx=v-32;patterns.push(C128[idx]);checksum+=idx*(i+1);}
      checksum=checksum%103;patterns.push(C128[checksum]);patterns.push(C128[106]);
      return patterns.join("");}
    var EAN13L=["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];
    var EAN13R=["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"];
    function renderEAN13(s){s=s.replace(/\\D/g,"");if(s.length<12)s=s.padEnd(12,"0");if(s.length>13)s=s.slice(0,13);
      var first=s[0],digits=s.slice(0,12).split("").map(Number);
      var sum=0;for(var i=0;i<12;i++)sum+=digits[i]*(i%2===0?1:3);var check=(10-sum%10)%10;
      var bits="101";for(var j=1;j<7;j++){bits+=EAN13L[digits[j]];}bits+="01010";for(var k=7;k<12;k++){bits+=EAN13R[digits[k]];}bits+=EAN13R[check];bits+="101";
      return bits;}
    var lastBits="";
    function draw(){var type=document.getElementById("barType").value,val=document.getElementById("barData").value;
      var bits=type==="ean13"?renderEAN13(val):render128(val);lastBits=bits;
      var module=2,h=120,quiet=10;var w=bits.length*module+quiet*2;
      var c=document.getElementById("barCv");c.width=w;c.height=h+24;var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.fillStyle="#000";
      for(var i=0;i<bits.length;i++){if(bits[i]==="1"){x.fillRect(quiet+i*module,10,module,h);}}
      x.fillStyle="#000";x.font="14px monospace";x.textAlign="center";x.fillText(val,c.width/2,h+18);
      document.getElementById("barProc").textContent="Barcode generated in this tab - 0 bytes uploaded.";}
    ["barType","barData"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
    document.getElementById("barGo").addEventListener("click",draw);
    document.getElementById("barDl").addEventListener("click",function(){var c=document.getElementById("barCv");c.toBlob(function(bl){var a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download="barcode.png";a.click();URL.revokeObjectURL(a.href);});});
    draw();`,
  article: {
    title: 'Barcode Generator: Code 128 and EAN-13',
    lead: '<p>Create scannable barcodes in seconds. This <strong>barcode generator</strong> produces Code 128 for general text and EAN-13 for retail-style numbers, downloadable as PNG.</p>',
    sections: [
      { id: 'types', icon: 'fa-solid fa-barcode', heading: 'Which symbology to use', html: '<p>Code 128 encodes full alphanumeric text compactly. EAN-13 is the fixed 13-digit standard used on retail products, with a built-in check digit.</p>' },
      { id: 'scan', icon: 'fa-solid fa-mobile-screen', heading: 'Getting a clean scan', html: '<p>Print at sufficient size and keep the white quiet zones clear. High-contrast black on white scans most reliably.</p>' }
    ],
    steps: ['Pick Code 128 or EAN-13.', 'Enter the data.', 'Download the barcode PNG.'],
    facts: [['Symbologies', 'Code 128, EAN-13'], ['Output', 'PNG'], ['Check digit', 'EAN-13 automatic'], ['Data handling', 'Runs locally']],
    useCases: [['Inventory', 'Label products.'], ['Retail', 'Make EAN-13 codes.'], ['Assets', 'Tag equipment.']],
    tips: ['Print large enough to scan.', 'Keep quiet zones white.', 'Test scan before mass printing.'],
    takeaways: ['Code 128 suits free text.', 'EAN-13 is the retail standard.', 'Printing size affects scanability.'],
    faq: [['Does EAN-13 validate the check digit?', 'It computes the check digit for you.'], ['Can I use lower-case?', 'Code 128 supports it; EAN-13 is digits only.'], ['What format is output?', 'PNG.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Create matching <a href="qr-code-generator.html">QR codes</a> for the same data.</p>'
  }
});

/* ========================================================================
   18. CHART & GRAPH MAKER
   ======================================================================== */
add({
  file: 'chart-maker.html', folder: 'image',
  name: 'Chart & Graph Maker', tag: 'Utility', icon: 'fa-solid fa-chart-column',
  title: 'Chart & Graph Maker | Bar, Line & Pie Charts',
  metaDesc: 'Create bar, line or pie charts from your own data and download them as PNG. Free, private and fully in-browser.',
  desc: 'Turn simple data into bar, line or pie charts, rendered on a canvas and downloadable as PNG.',
  keywords: ['chart maker', 'graph maker', 'bar chart', 'line chart', 'pie chart', 'data visualization'],
  featureList: ['Bar, line, pie', 'Custom data', 'PNG download', '100% client-side'],
  panel: panel.wrap('cht', 'fa-solid fa-chart-column', 'Chart maker',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div class="io-field"><label for="chtIn">Data (label, value per line)</label><textarea id="chtIn"style="min-height:160px">Q1, 45\nQ2, 78\nQ3, 60\nQ4, 92</textarea></div>' +
    '<div class="io-field"><label>Preview</label><canvas id="chtCv"style="max-width:100%;background:#0e1116;border:1px solid var(--border);border-radius:10px"></canvas></div></div>' +
    '<div class="row3"style="margin-bottom:14px">' + sel('chtType', 'Chart type', [['bar', 'Bar'], ['line', 'Line'], ['pie', 'Pie']]) + '</div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="chtGo"><i class="fa-solid fa-chart-column"></i>Render chart</button> ' +
    '<button class="rt-btn"type="button"id="chtDl"><i class="fa-solid fa-download"></i>Download PNG</button></div>'),
  js: `
    var COLORS=["#3b82f6","#60a5fa","#93c5fd","#22c55e","#eab308","#ef4444","#a855f7","#14b8a6","#f97316","#ec4899"];
    function parse(){return document.getElementById("chtIn").value.split(/\\n+/).filter(function(x){return x.trim()}).map(function(l){var p=l.split(/[,\\s]+/);return {label:p[0]||"",value:+p[p.length-1]||0};});}
    function draw(){var data=parse();if(!data.length)return;var type=document.getElementById("chtType").value;
      var c=document.getElementById("chtCv");c.width=640;c.height=400;var x=c.getContext("2d");x.clearRect(0,0,640,400);
      var max=Math.max.apply(null,data.map(function(d){return d.value;}));if(max<=0)max=1;
      if(type==="pie"){var total=data.reduce(function(a,d){return a+d.value;},0)||1;var start=-Math.PI/2;
        data.forEach(function(d,i){var ang=d.value/total*Math.PI*2;x.beginPath();x.moveTo(320,200);x.arc(320,200,150,start,start+ang);x.closePath();x.fillStyle=COLORS[i%COLORS.length];x.fill();start+=ang;});
        x.font="13px sans-serif";x.fillStyle="#cbd5e1";data.forEach(function(d,i){x.fillRect(20,20+i*22,12,12);x.fillStyle="#cbd5e1";x.fillText(d.label+" ("+d.value+")",38,31+i*22);});}
      else{var pad=50,base=360,h=base-pad,w=600;
        x.strokeStyle="#334155";x.beginPath();x.moveTo(pad,pad);x.lineTo(pad,base);x.lineTo(pad+w,base);x.stroke();
        if(type==="bar"){var bw=w/data.length*0.6;data.forEach(function(d,i){var bx=pad+i*(w/data.length)+(w/data.length-bw)/2;var bh=(d.value/max)*h;x.fillStyle=COLORS[i%COLORS.length];x.fillRect(bx,base-bh,bw,bh);x.fillStyle="#cbd5e1";x.font="12px sans-serif";x.textAlign="center";x.fillText(d.label,bx+bw/2,base+16);x.textAlign="left";});}
        else{x.strokeStyle="#60a5fa";x.lineWidth=2;x.beginPath();data.forEach(function(d,i){var px=pad+i*(w/(data.length-1||1));var py=base-(d.value/max)*h;if(i===0)x.moveTo(px,py);else x.lineTo(px,py);});x.stroke();
          data.forEach(function(d,i){var px=pad+i*(w/(data.length-1||1));var py=base-(d.value/max)*h;x.fillStyle="#60a5fa";x.beginPath();x.arc(px,py,4,0,7);x.fill();x.fillStyle="#cbd5e1";x.font="12px sans-serif";x.fillText(d.label,px-8,base+16);});}}
      document.getElementById("chtProc").textContent="Chart rendered in this tab - 0 bytes uploaded.";}
    document.getElementById("chtIn").addEventListener("input",draw);
    document.getElementById("chtType").addEventListener("change",draw);
    document.getElementById("chtGo").addEventListener("click",draw);
    document.getElementById("chtDl").addEventListener("click",function(){var c=document.getElementById("chtCv");c.toBlob(function(bl){var a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download="chart.png";a.click();URL.revokeObjectURL(a.href);});});
    draw();`,
  article: {
    title: 'Chart & Graph Maker: Visualise Your Data',
    lead: '<p>Numbers speak louder as pictures. This <strong>chart maker</strong> turns labelled values into bar, line or pie charts you can download as PNG.</p>',
    sections: [
      { id: 'types', icon: 'fa-solid fa-chart-column', heading: 'Choosing a chart type', html: '<p>Bar charts compare categories, line charts show trends over a sequence, and pie charts show parts of a whole. Pick the one that matches your message.</p>' },
      { id: 'data', icon: 'fa-solid fa-keyboard', heading: 'Formatting your data', html: '<p>Enter one item per line as label and value. The chart scales automatically to your data range.</p>' }
    ],
    steps: ['Enter data lines of label and value.', 'Pick a chart type.', 'Download the PNG.'],
    facts: [['Types', 'Bar, line, pie'], ['Input', 'Label + value'], ['Output', 'PNG'], ['Data handling', 'Runs locally']],
    useCases: [['Reports', 'Add quick charts.'], ['Presentations', 'Simple visuals.'], ['Study', 'Plot experiment data.']],
    tips: ['Keep categories few and clear.', 'Match the chart to the story.', 'Label values sensibly.'],
    takeaways: ['Different charts suit different data.', 'Data scales automatically.', 'Output is a PNG image.'],
    faq: [['Can I export as SVG?', 'No, output is PNG.'], ['How many data points?', 'Any reasonable number.'], ['Are colours adjustable?', 'Colours cycle automatically.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Pair charts with the <a href="image-collage-maker.html">collage maker</a> for reports.</p>'
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
