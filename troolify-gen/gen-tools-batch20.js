/* ============================================================================
   Troolify - batch 20
   Business document generators + misc utilities from allinonetools.net.
   Run: node troolify-gen/gen-tools-batch20.js   (from the repo root)
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
function inp(id, label, val) {
  return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '"type="text"value="' + val + '"></div>';
}
function num(id, label, val, extra) {
  return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '"type="number"min="0"step="any"value="' + val + '"' + (extra || '') + '></div>';
}
function ta(id, label, ph, val) {
  return '<div class="io-field"><label for="' + id + '">' + label + '</label><textarea id="' + id + '"spellcheck="false"placeholder="' + ph + '">' + (val || '') + '</textarea></div>';
}
function actions(prefix, label) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-file-lines"></i>' + (label || 'Generate') + '</button> ' +
    '<button class="rt-btn"type="button"id="' + prefix + 'Copy"><i class="fa-solid fa-copy"></i>Copy</button> ' +
    '<button class="rt-btn"type="button"id="' + prefix + 'Print"><i class="fa-solid fa-print"></i>Print</button></div>';
}
function go(prefix, label) {
  return '<div class="actions"><button class="btn btn-primary"type="button"id="' + prefix + 'Go"><i class="fa-solid fa-calculator"></i>' + (label || 'Convert') + '</button> ' +
    '<button class="rt-btn"type="button"id="' + prefix + 'Copy"><i class="fa-solid fa-copy"></i>Copy</button></div>';
}
function outArea(prefix) {
  return '<div class="io-field"style="margin-top:14px"><label>Output preview</label><div id="' + prefix + 'Out"style="background:#fff;color:#111;border-radius:12px;padding:20px;min-height:200px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5"></div></div>';
}
const PRINT_HELPER = 'function doPrint(p){var w=window.open("","_blank");if(!w)return;w.document.write("<!doctype html><html><head><title>Document</title></head><body>"+document.getElementById(p+"Out").innerHTML+"</body></html>");w.document.close();w.print();}';

/* ========================================================================
   1. INVOICE GENERATOR
   ======================================================================== */
add({
  file: 'invoice-generator.html', folder: 'misc',
  name: 'Invoice Generator', tag: 'Business', icon: 'fa-solid fa-file-invoice',
  title: 'Invoice Generator | Free Online Invoice Maker',
  metaDesc: 'Create a professional invoice from your business, client and line items, then print or copy it. Free and fully in-browser.',
  desc: 'Build a clean invoice with your details, client information and itemised lines, ready to print or copy.',
  keywords: ['invoice generator', 'invoice maker', 'create invoice', 'billing', 'freelance invoice', 'business tool'],
  featureList: ['Itemised lines', 'Auto totals', 'Print/copy', '100% client-side'],
  panel: panel.wrap('inv', 'fa-solid fa-file-invoice', 'Invoice generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('invBiz', 'Your business', 'Acme Studio') + inp('invAddr', 'Your address', '12 Market St') + inp('invEmail', 'Your email', 'billing@acme.test') + '</div>' +
    '<div>' + inp('invClient', 'Client name', 'Client Ltd') + inp('invCAddr', 'Client address', '5 High Rd') + inp('invNo', 'Invoice number', 'INV-0001') + '</div></div>' +
    ta('invItems', 'Line items (description, qty, unit price)', 'Design work, 10, 50\nHosting, 1, 120', 'Design work, 10, 50\nHosting, 1, 120') +
    '<div class="row3"style="margin:12px 0">' + num('invTax', 'Tax %', '0') + '</div>' +
    actions('inv') + outArea('inv')),
  js: `
    function money(n){return n.toFixed(2);}
    function gen(){var items=document.getElementById("invItems").value.split(/\\n+/).filter(function(x){return x.trim()});var tax=+document.getElementById("invTax").value;
      var rows="";var sub=0;
      items.forEach(function(l){var p=l.split(",");var d=(p[0]||"").trim();var q=+((p[1]||"1").trim());var u=+((p[2]||"0").trim());var t=q*u;sub+=t;
        rows+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>"+d+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+q+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+money(u)+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+money(t)+"</td></tr>";});
      var taxAmt=sub*tax/100;var total=sub+taxAmt;
      var html="<h1 style='margin:0 0 4px'>INVOICE</h1><div style='display:flex;justify-content:space-between'><div><strong>"+document.getElementById("invBiz").value+"</strong><br>"+document.getElementById("invAddr").value+"<br>"+document.getElementById("invEmail").value+"</div><div style='text-align:right'>"+document.getElementById("invNo").value+"<br>Client: "+document.getElementById("invClient").value+"<br>"+document.getElementById("invCAddr").value+"</div></div>";
      html+="<table style='width:100%;border-collapse:collapse;margin-top:16px'><tr><th style='text-align:left;padding:6px;border-bottom:2px solid #333'>Description</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Qty</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Unit</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Amount</th></tr>"+rows+"</table>";
      html+="<div style='text-align:right;margin-top:14px'>Subtotal: "+money(sub)+"<br>Tax: "+money(taxAmt)+"<br><strong>Total: "+money(total)+"</strong></div>";
      document.getElementById("invOut").innerHTML=html;document.getElementById("invProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#invItems,#invTax,#invBiz,#invAddr,#invEmail,#invClient,#invCAddr,#invNo").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("invGo").addEventListener("click",gen);
    document.getElementById("invCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("invOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("invPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("inv");});
    gen();`,
  article: {
    title: 'Invoice Generator: Bill Your Clients Properly',
    lead: '<p>An invoice records what you sold, to whom, and for how much. This <strong>invoice generator</strong> lays out your business, client and line items with automatic totals.</p>',
    sections: [
      { id: 'parts', icon: 'fa-solid fa-file-invoice', heading: 'What an invoice needs', html: '<p>A unique number, your details, the client details, a dated itemised list, tax if applicable, and a clear total.</p>' },
      { id: 'terms', icon: 'fa-solid fa-handshake', heading: 'Payment terms', html: '<p>State the due date and accepted payment methods. Clear terms get you paid faster. Add late-fee terms if you use them.</p>' }
    ],
    steps: ['Enter business and client details.', 'List line items with qty and price.', 'Copy or print the invoice.'],
    facts: [['Output', 'Formatted invoice'], ['Totals', 'Automatic'], ['Export', 'Print or copy'], ['Data handling', 'Runs locally']],
    useCases: [['Freelancing', 'Bill clients.'], ['Small business', 'Issue sales invoices.'], ['Services', 'Record work done.']],
    tips: ['Number invoices sequentially.', 'Keep a copy for records.', 'Include payment terms.'],
    takeaways: ['Invoices must be itemised.', 'Totals should be exact.', 'Records help tax filing.'],
    faq: [['Is this a legal invoice?', 'It provides the standard fields; check local requirements.'], ['Can I add tax?', 'Yes, set the tax percent.'], ['How do I save it?', 'Print to PDF from the print dialog.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Generate a matching <a href="payment-receipt-generator.html">payment receipt</a>.</p>'
  }
});

/* ========================================================================
   2. PAYMENT RECEIPT GENERATOR
   ======================================================================== */
add({
  file: 'payment-receipt-generator.html', folder: 'misc',
  name: 'Payment Receipt Generator', tag: 'Business', icon: 'fa-solid fa-receipt',
  title: 'Payment Receipt Generator | Free Receipt Maker',
  metaDesc: 'Create a payment receipt acknowledging money received, with payer, amount, method and date. Copy or print. Free and in-browser.',
  desc: 'Produce a simple payment receipt recording who paid, how much, when and by what method.',
  keywords: ['payment receipt generator', 'receipt maker', 'create receipt', 'payment acknowledgement', 'cash receipt', 'business tool'],
  featureList: ['Payer and amount', 'Payment method', 'Print/copy', '100% client-side'],
  panel: panel.wrap('rct', 'fa-solid fa-receipt', 'Payment receipt',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('rctFrom', 'Received from', 'Jane Doe') + inp('rctBy', 'Received by', 'Acme Studio') + '</div>' +
    '<div>' + num('rctAmt', 'Amount', '250', 'step="0.01"') + inp('rctMethod', 'Payment method', 'Bank transfer') + '</div></div>' +
    '<div class="row3"style="margin-bottom:12px">' + inp('rctDate', 'Date', '2026-10-19') + inp('rctRef', 'Reference', 'TXN-1001') + '</div>' +
    actions('rct') + outArea('rct')),
  js: `
    function gen(){var amt=+document.getElementById("rctAmt").value;
      var html="<h1 style='margin:0 0 10px'>PAYMENT RECEIPT</h1>";
      html+="<p>Received from: <strong>"+document.getElementById("rctFrom").value+"</strong></p>";
      html+="<p>Amount: <strong>"+amt.toFixed(2)+"</strong></p>";
      html+="<p>Payment method: "+document.getElementById("rctMethod").value+"</p>";
      html+="<p>Reference: "+document.getElementById("rctRef").value+"</p>";
      html+="<p>Date: "+document.getElementById("rctDate").value+"</p>";
      html+="<p style='margin-top:30px'>Received by: ____________________ ("+document.getElementById("rctBy").value+")</p>";
      document.getElementById("rctOut").innerHTML=html;document.getElementById("rctProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#rctFrom,#rctBy,#rctAmt,#rctMethod,#rctDate,#rctRef").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("rctGo").addEventListener("click",gen);
    document.getElementById("rctCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("rctOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("rctPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("rct");});
    gen();`,
  article: {
    title: 'Payment Receipt Generator: Acknowledge Payment',
    lead: '<p>A receipt proves a payment happened. This <strong>payment receipt generator</strong> records the payer, amount, method, reference and date in a clean layout.</p>',
    sections: [
      { id: 'parts', icon: 'fa-solid fa-receipt', heading: 'What belongs on a receipt', html: '<p>Who paid, who received it, the amount, the method, the date and a reference number. A signature line adds formality.</p>' },
      { id: 'use', icon: 'fa-solid fa-handshake', heading: 'When to use one', html: '<p>Cash and informal payments benefit most from receipts. Invoices record what is owed; receipts record what has been paid.</p>' }
    ],
    steps: ['Fill in payer, amount and method.', 'Add a date and reference.', 'Copy or print the receipt.'],
    facts: [['Output', 'Formatted receipt'], ['Fields', 'Payer, amount, method'], ['Export', 'Print or copy'], ['Data handling', 'Runs locally']],
    useCases: [['Cash sales', 'Confirm payment.'], ['Rent', 'Record monthly payment.'], ['Services', 'Acknowledge fees.']],
    tips: ['Keep receipts for records.', 'Use consistent reference numbers.', 'Add a signature line.'],
    takeaways: ['Receipts follow invoices.', 'They confirm money received.', 'Keep copies for accounts.'],
    faq: [['Invoice versus receipt?', 'An invoice requests payment; a receipt confirms it.'], ['Can I add a logo?', 'This tool focuses on text fields.'], ['How do I save it?', 'Print to PDF.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Pair it with an <a href="invoice-generator.html">invoice generator</a>.</p>'
  }
});

/* ========================================================================
   3. QUOTATION GENERATOR
   ======================================================================== */
add({
  file: 'quotation-generator.html', folder: 'misc',
  name: 'Quotation Generator', tag: 'Business', icon: 'fa-solid fa-file-signature',
  title: 'Quotation Generator | Free Price Quote Maker',
  metaDesc: 'Create a price quotation with itemised costs, validity and terms, ready to copy or print. Free, private and fully in-browser.',
  desc: 'Generate an itemised price quotation with totals, validity period and terms you can send to clients.',
  keywords: ['quotation generator', 'price quote', 'quotation maker', 'estimate quote', 'sales quote', 'business tool'],
  featureList: ['Itemised costs', 'Auto totals', 'Validity and terms', '100% client-side'],
  panel: panel.wrap('qtn', 'fa-solid fa-file-signature', 'Quotation generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('qtnFrom', 'From (business)', 'Acme Studio') + inp('qtnTo', 'To (client)', 'Client Ltd') + '</div>' +
    '<div>' + inp('qtnNo', 'Quotation no.', 'QT-1001') + inp('qtnValid', 'Valid until', '2026-11-19') + '</div></div>' +
    ta('qtnItems', 'Items (description, qty, unit price)', 'Website build, 1, 1500\nMaintenance, 12, 50', 'Website build, 1, 1500\nMaintenance, 12, 50') +
    ta('qtnTerms', 'Terms', '50% deposit required. Prices exclude taxes.', '50% deposit required. Prices exclude taxes.') +
    actions('qtn') + outArea('qtn')),
  js: `
    function gen(){var items=document.getElementById("qtnItems").value.split(/\\n+/).filter(function(x){return x.trim()});var rows="";var sub=0;
      items.forEach(function(l){var p=l.split(",");var d=(p[0]||"").trim();var q=+((p[1]||"1").trim());var u=+((p[2]||"0").trim());var t=q*u;sub+=t;
        rows+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>"+d+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+q+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+u.toFixed(2)+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+t.toFixed(2)+"</td></tr>";});
      var html="<h1 style='margin:0 0 4px'>QUOTATION</h1><div style='display:flex;justify-content:space-between'><div><strong>"+document.getElementById("qtnFrom").value+"</strong></div><div style='text-align:right'>"+document.getElementById("qtnNo").value+"<br>To: "+document.getElementById("qtnTo").value+"<br>Valid until: "+document.getElementById("qtnValid").value+"</div></div>";
      html+="<table style='width:100%;border-collapse:collapse;margin-top:16px'><tr><th style='text-align:left;padding:6px;border-bottom:2px solid #333'>Item</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Qty</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Unit</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Total</th></tr>"+rows+"</table>";
      html+="<div style='text-align:right;margin-top:14px'><strong>Subtotal: "+sub.toFixed(2)+"</strong></div>";
      html+="<p style='margin-top:16px'><strong>Terms:</strong> "+document.getElementById("qtnTerms").value+"</p>";
      document.getElementById("qtnOut").innerHTML=html;document.getElementById("qtnProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#qtnItems,#qtnFrom,#qtnTo,#qtnNo,#qtnValid,#qtnTerms").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("qtnGo").addEventListener("click",gen);
    document.getElementById("qtnCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("qtnOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("qtnPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("qtn");});
    gen();`,
  article: {
    title: 'Quotation Generator: Quote With Confidence',
    lead: '<p>A quotation states what you will deliver and at what price. This <strong>quotation generator</strong> itemises costs and totals them, adding validity and terms.</p>',
    sections: [
      { id: 'quote', icon: 'fa-solid fa-file-signature', heading: 'Quote versus invoice', html: '<p>A quotation is an offer before work starts. An invoice is a demand after delivery. Clear quotes set expectations and reduce disputes.</p>' },
      { id: 'validity', icon: 'fa-solid fa-calendar-day', heading: 'Validity periods', html: '<p>Costs change, so quote validity matters. A stated expiry protects you from honouring stale prices.</p>' }
    ],
    steps: ['Enter from, to and quote details.', 'List items with quantities and prices.', 'Copy or print the quotation.'],
    facts: [['Output', 'Formatted quote'], ['Totals', 'Automatic'], ['Includes', 'Validity and terms'], ['Data handling', 'Runs locally']],
    useCases: [['Contractors', 'Quote projects.'], ['Agencies', 'Price retainer work.'], ['Sales', 'Formal offers.']],
    tips: ['State a clear validity date.', 'List assumptions and exclusions.', 'Follow up before expiry.'],
    takeaways: ['Quotes precede work.', 'Itemising builds trust.', 'Validity protects pricing.'],
    faq: [['Is a quote binding?', 'Depends on your terms and jurisdiction.'], ['Should I include tax?', 'State whether prices include tax.'], ['How do I convert to invoice?', 'Reorder the same items.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Convert accepted quotes into an <a href="invoice-generator.html">invoice</a>.</p>'
  }
});

/* ========================================================================
   4. ESTIMATE GENERATOR
   ======================================================================== */
add({
  file: 'estimate-generator.html', folder: 'misc',
  name: 'Estimate Generator', tag: 'Business', icon: 'fa-solid fa-calculator',
  title: 'Estimate Generator | Free Work Estimate Maker',
  metaDesc: 'Produce a work estimate with task lines, labour and material costs and a total range. Copy or print. Free and fully in-browser.',
  desc: 'Create a work estimate with labour and material lines and an indicative total.',
  keywords: ['estimate generator', 'work estimate', 'cost estimate', 'estimate maker', 'project estimate', 'business tool'],
  featureList: ['Labour and materials', 'Auto totals', 'Print/copy', '100% client-side'],
  panel: panel.wrap('est', 'fa-solid fa-calculator', 'Estimate generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('estFrom', 'From', 'Acme Contractors') + inp('estTo', 'To', 'Client Ltd') + '</div>' +
    '<div>' + inp('estNo', 'Estimate no.', 'EST-1001') + num('estCont', 'Contingency %', '10') + '</div></div>' +
    ta('estItems', 'Lines (description, labour, materials)', 'Foundation, 1200, 800\nFraming, 2000, 1500', 'Foundation, 1200, 800\nFraming, 2000, 1500') +
    actions('est') + outArea('est')),
  js: `
    function gen(){var items=document.getElementById("estItems").value.split(/\\n+/).filter(function(x){return x.trim()});var rows="";var lab=0,mat=0;
      items.forEach(function(l){var p=l.split(",");var d=(p[0]||"").trim();var lv=+((p[1]||"0").trim());var mv=+((p[2]||"0").trim());lab+=lv;mat+=mv;
        rows+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>"+d+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+lv.toFixed(2)+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+mv.toFixed(2)+"</td></tr>";});
      var cont=+document.getElementById("estCont").value;var subtotal=lab+mat;var contAmt=subtotal*cont/100;var total=subtotal+contAmt;
      var html="<h1 style='margin:0 0 4px'>ESTIMATE</h1><div style='display:flex;justify-content:space-between'><div><strong>"+document.getElementById("estFrom").value+"</strong></div><div style='text-align:right'>"+document.getElementById("estNo").value+"<br>To: "+document.getElementById("estTo").value+"</div></div>";
      html+="<table style='width:100%;border-collapse:collapse;margin-top:16px'><tr><th style='text-align:left;padding:6px;border-bottom:2px solid #333'>Task</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Labour</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Materials</th></tr>"+rows+"</table>";
      html+="<div style='text-align:right;margin-top:14px'>Labour: "+lab.toFixed(2)+"<br>Materials: "+mat.toFixed(2)+"<br>Contingency ("+cont+"%): "+contAmt.toFixed(2)+"<br><strong>Estimated total: "+total.toFixed(2)+"</strong></div>";
      document.getElementById("estOut").innerHTML=html;document.getElementById("estProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#estItems,#estFrom,#estTo,#estNo,#estCont").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("estGo").addEventListener("click",gen);
    document.getElementById("estCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("estOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("estPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("est");});
    gen();`,
  article: {
    title: 'Estimate Generator: Predict Project Costs',
    lead: '<p>An estimate gives a client an indicative price. This <strong>estimate generator</strong> splits labour and materials and adds a contingency for the unexpected.</p>',
    sections: [
      { id: 'split', icon: 'fa-solid fa-calculator', heading: 'Labour and materials', html: '<p>Separating the two clarifies where the money goes and makes adjustments easier if scope changes.</p>' },
      { id: 'contingency', icon: 'fa-solid fa-shield-halved', heading: 'Why contingency', html: '<p>A percentage buffer covers surprises such as hidden damage or price rises, protecting your margin.</p>' }
    ],
    steps: ['Enter parties and estimate number.', 'List tasks with labour and materials.', 'Set contingency and review the total.'],
    facts: [['Output', 'Estimate document'], ['Fields', 'Labour + materials'], ['Extra', 'Contingency %'], ['Data handling', 'Runs locally']],
    useCases: [['Construction', 'Estimate builds.'], ['Repairs', 'Quote jobs.'], ['Projects', 'Budget planning.']],
    tips: ['Add a realistic contingency.', 'Note exclusions clearly.', 'Label it as an estimate.', ''],
    takeaways: ['Estimates are indicative, not fixed.', 'Contingency covers surprises.', 'Splitting costs aids clarity.'],
    faq: [['Is an estimate final?', 'No, it is indicative.'], ['What contingency is typical?', 'Often 5-15% depending on risk.'], ['Can I convert to invoice?', 'Yes, reuse the line items.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Issue a firm figure with the <a href="quotation-generator.html">quotation generator</a>.</p>'
  }
});

/* ========================================================================
   5. PURCHASE ORDER MAKER
   ======================================================================== */
add({
  file: 'purchase-order-maker.html', folder: 'misc',
  name: 'Purchase Order Maker', tag: 'Business', icon: 'fa-solid fa-cart-flatbed',
  title: 'Purchase Order Maker | Free PO Generator',
  metaDesc: 'Create a purchase order with supplier details and ordered items, ready to copy or print. Free, private and fully in-browser.',
  desc: 'Generate a purchase order listing supplier details and ordered line items with totals.',
  keywords: ['purchase order maker', 'po generator', 'purchase order', 'procurement', 'order form', 'business tool'],
  featureList: ['Supplier details', 'Ordered items', 'Auto totals', '100% client-side'],
  panel: panel.wrap('po', 'fa-solid fa-cart-flatbed', 'Purchase order',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('poBuyer', 'Buyer', 'Acme Ltd') + inp('poSupplier', 'Supplier', 'Supply Co') + '</div>' +
    '<div>' + inp('poNo', 'PO number', 'PO-1001') + inp('poDate', 'Date', '2026-10-19') + '</div></div>' +
    ta('poItems', 'Items (description, qty, unit price)', 'Paper reams, 20, 4.5\nPrinter toner, 5, 42', 'Paper reams, 20, 4.5\nPrinter toner, 5, 42') +
    actions('po') + outArea('po')),
  js: `
    function gen(){var items=document.getElementById("poItems").value.split(/\\n+/).filter(function(x){return x.trim()});var rows="";var sub=0;
      items.forEach(function(l){var p=l.split(",");var d=(p[0]||"").trim();var q=+((p[1]||"1").trim());var u=+((p[2]||"0").trim());var t=q*u;sub+=t;
        rows+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>"+d+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+q+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+u.toFixed(2)+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+t.toFixed(2)+"</td></tr>";});
      var html="<h1 style='margin:0 0 4px'>PURCHASE ORDER</h1><div style='display:flex;justify-content:space-between'><div>Buyer: <strong>"+document.getElementById("poBuyer").value+"</strong></div><div style='text-align:right'>"+document.getElementById("poNo").value+"<br>"+document.getElementById("poDate").value+"<br>Supplier: "+document.getElementById("poSupplier").value+"</div></div>";
      html+="<table style='width:100%;border-collapse:collapse;margin-top:16px'><tr><th style='text-align:left;padding:6px;border-bottom:2px solid #333'>Item</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Qty</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Unit</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Amount</th></tr>"+rows+"</table>";
      html+="<div style='text-align:right;margin-top:14px'><strong>Total: "+sub.toFixed(2)+"</strong></div>";
      document.getElementById("poOut").innerHTML=html;document.getElementById("poProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#poItems,#poBuyer,#poSupplier,#poNo,#poDate").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("poGo").addEventListener("click",gen);
    document.getElementById("poCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("poOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("poPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("po");});
    gen();`,
  article: {
    title: 'Purchase Order Maker: Order With Clarity',
    lead: '<p>A purchase order is a buyer formal offer to a supplier. This <strong>purchase order maker</strong> lists buyer, supplier and ordered items with totals.</p>',
    sections: [
      { id: 'what', icon: 'fa-solid fa-cart-flatbed', heading: 'What a PO does', html: '<p>It records exactly what is being bought, at what price and quantity, creating a paper trail for procurement and accounts payable.</p>' },
      { id: 'flow', icon: 'fa-solid fa-arrows-turn-right', heading: 'Where it sits', html: '<p>The flow runs quote to PO to delivery note to invoice. The PO number ties them together for clean reconciliation.</p>' }
    ],
    steps: ['Enter buyer, supplier and PO number.', 'List items with quantity and price.', 'Copy or print the order.'],
    facts: [['Output', 'Purchase order'], ['Fields', 'Buyer, supplier, items'], ['Totals', 'Automatic'], ['Data handling', 'Runs locally']],
    useCases: [['Procurement', 'Formalise orders.'], ['Accounting', 'Match to invoices.'], ['Small business', 'Track purchases.']],
    tips: ['Give every PO a unique number.', 'Reference the supplier quote.', 'Keep copies for reconciliation.'],
    takeaways: ['POs formalise purchase intent.', 'Unique numbers aid matching.', 'They support accounting.'],
    faq: [['Is a PO a contract?', 'It can form part of one when accepted.'], ['Do I need one for small buys?', 'Not always, but they help tracking.'], ['How do I match invoices?', 'Use the PO number.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Track deliveries with a <a href="delivery-challan-generator.html">delivery challan</a>.</p>'
  }
});

/* ========================================================================
   6. DELIVERY CHALLAN GENERATOR
   ======================================================================== */
add({
  file: 'delivery-challan-generator.html', folder: 'misc',
  name: 'Delivery Challan Generator', tag: 'Business', icon: 'fa-solid fa-truck-fast',
  title: 'Delivery Challan Generator | Free Dispatch Note Maker',
  metaDesc: 'Create a delivery challan listing goods dispatched, quantities and addresses, ready to copy or print. Free and fully in-browser.',
  desc: 'Generate a delivery challan for goods dispatched, with sender, receiver and item quantities.',
  keywords: ['delivery challan generator', 'dispatch note', 'delivery note', 'goods dispatch', 'challan maker', 'business tool'],
  featureList: ['Sender and receiver', 'Goods list', 'Print/copy', '100% client-side'],
  panel: panel.wrap('chl', 'fa-solid fa-truck-fast', 'Delivery challan',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('chlFrom', 'Dispatch from', 'Warehouse A') + inp('chlTo', 'Deliver to', 'Client Ltd') + '</div>' +
    '<div>' + inp('chlNo', 'Challan no.', 'DC-1001') + inp('chlDate', 'Date', '2026-10-19') + '</div></div>' +
    ta('chlItems', 'Goods (description, quantity)', 'Box of A4 paper, 20\nToner cartridge, 5', 'Box of A4 paper, 20\nToner cartridge, 5') +
    actions('chl') + outArea('chl')),
  js: `
    function gen(){var items=document.getElementById("chlItems").value.split(/\\n+/).filter(function(x){return x.trim()});var rows="";var n=0;
      items.forEach(function(l){var p=l.split(",");var d=(p[0]||"").trim();var q=+((p[1]||"0").trim());n+=q;
        rows+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>"+d+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+q+"</td></tr>";});
      var html="<h1 style='margin:0 0 4px'>DELIVERY CHALLAN</h1><div style='display:flex;justify-content:space-between'><div>From: <strong>"+document.getElementById("chlFrom").value+"</strong></div><div style='text-align:right'>"+document.getElementById("chlNo").value+"<br>"+document.getElementById("chlDate").value+"<br>To: "+document.getElementById("chlTo").value+"</div></div>";
      html+="<table style='width:100%;border-collapse:collapse;margin-top:16px'><tr><th style='text-align:left;padding:6px;border-bottom:2px solid #333'>Goods</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Qty</th></tr>"+rows+"</table>";
      html+="<div style='text-align:right;margin-top:14px'>Total items: <strong>"+n+"</strong></div>";
      html+="<p style='margin-top:30px'>Received by: ____________________</p>";
      document.getElementById("chlOut").innerHTML=html;document.getElementById("chlProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#chlItems,#chlFrom,#chlTo,#chlNo,#chlDate").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("chlGo").addEventListener("click",gen);
    document.getElementById("chlCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("chlOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("chlPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("chl");});
    gen();`,
  article: {
    title: 'Delivery Challan Generator: Record Dispatches',
    lead: '<p>A delivery challan travels with dispatched goods. This <strong>delivery challan generator</strong> lists what left, how much, and where it went.</p>',
    sections: [
      { id: 'what', icon: 'fa-solid fa-truck-fast', heading: 'What it records', html: '<p>Sender, receiver, goods and quantities. It is not an invoice; it simply documents the movement of goods.</p>' },
      { id: 'signature', icon: 'fa-solid fa-pen-nib', heading: 'Proof of delivery', html: '<p>A receiver signature on the challan confirms the goods arrived, useful for disputes and for matching to later invoices.</p>' }
    ],
    steps: ['Enter from, to and challan number.', 'List goods and quantities.', 'Copy or print the challan.'],
    facts: [['Output', 'Delivery challan'], ['Fields', 'From, to, goods'], ['Signature', 'Receiver line'], ['Data handling', 'Runs locally']],
    useCases: [['Logistics', 'Document dispatches.'], ['Warehousing', 'Track outbound goods.'], ['Accounts', 'Match to invoices.']],
    tips: ['Number challans sequentially.', 'Get a receiver signature.', 'Keep a copy with the invoice.'],
    takeaways: ['Challans document goods movement.', 'They are not invoices.', 'Signatures prove delivery.'],
    faq: [['Is a challan taxable?', 'It is not a tax invoice.'], ['Do I need one per delivery?', 'Yes, for traceability.'], ['Can it replace an invoice?', 'No, they serve different roles.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Follow up with an <a href="invoice-generator.html">invoice</a>.</p>'
  }
});

/* ========================================================================
   7. PROFORMA INVOICE GENERATOR
   ======================================================================== */
add({
  file: 'proforma-invoice-generator.html', folder: 'misc',
  name: 'Proforma Invoice Generator', tag: 'Business', icon: 'fa-solid fa-file-invoice-dollar',
  title: 'Proforma Invoice Generator | Free Preliminary Invoice',
  metaDesc: 'Create a proforma invoice as a preliminary bill before delivery, ready to copy or print. Free, private and fully in-browser.',
  desc: 'Generate a proforma invoice showing indicative charges before goods or services are delivered.',
  keywords: ['proforma invoice generator', 'proforma invoice', 'preliminary invoice', 'advance invoice', 'draft bill', 'business tool'],
  featureList: ['Itemised lines', 'Auto totals', 'Print/copy', '100% client-side'],
  panel: panel.wrap('pfi', 'fa-solid fa-file-invoice-dollar', 'Proforma invoice',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('pfiFrom', 'Seller', 'Acme Exports') + inp('pfiTo', 'Buyer', 'Global Imports') + '</div>' +
    '<div>' + inp('pfiNo', 'Proforma no.', 'PF-1001') + inp('pfiDate', 'Date', '2026-10-19') + '</div></div>' +
    ta('pfiItems', 'Items (description, qty, unit price)', 'Widget X, 100, 8.5\nWidget Y, 50, 12', 'Widget X, 100, 8.5\nWidget Y, 50, 12') +
    actions('pfi') + outArea('pfi')),
  js: `
    function gen(){var items=document.getElementById("pfiItems").value.split(/\\n+/).filter(function(x){return x.trim()});var rows="";var sub=0;
      items.forEach(function(l){var p=l.split(",");var d=(p[0]||"").trim();var q=+((p[1]||"1").trim());var u=+((p[2]||"0").trim());var t=q*u;sub+=t;
        rows+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>"+d+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+q+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+u.toFixed(2)+"</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+t.toFixed(2)+"</td></tr>";});
      var html="<h1 style='margin:0 0 4px'>PROFORMA INVOICE</h1><div style='display:flex;justify-content:space-between'><div>Seller: <strong>"+document.getElementById("pfiFrom").value+"</strong></div><div style='text-align:right'>"+document.getElementById("pfiNo").value+"<br>"+document.getElementById("pfiDate").value+"<br>Buyer: "+document.getElementById("pfiTo").value+"</div></div>";
      html+="<table style='width:100%;border-collapse:collapse;margin-top:16px'><tr><th style='text-align:left;padding:6px;border-bottom:2px solid #333'>Item</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Qty</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Unit</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Amount</th></tr>"+rows+"</table>";
      html+="<div style='text-align:right;margin-top:14px'><strong>Total: "+sub.toFixed(2)+"</strong></div>";
      html+="<p style='margin-top:16px;font-style:italic'>This is a proforma invoice and not a demand for payment.</p>";
      document.getElementById("pfiOut").innerHTML=html;document.getElementById("pfiProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#pfiItems,#pfiFrom,#pfiTo,#pfiNo,#pfiDate").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("pfiGo").addEventListener("click",gen);
    document.getElementById("pfiCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("pfiOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("pfiPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("pfi");});
    gen();`,
  article: {
    title: 'Proforma Invoice Generator: Preliminary Billing',
    lead: '<p>A proforma invoice previews the charges before delivery. This <strong>proforma invoice generator</strong> itemises costs and totals them for advance arrangements.</p>',
    sections: [
      { id: 'use', icon: 'fa-solid fa-file-invoice-dollar', heading: 'When to use a proforma', html: '<p>Common for advance payments, customs documentation and purchase approvals, it shows what the final invoice will contain.</p>' },
      { id: 'notinvoice', icon: 'fa-solid fa-triangle-exclamation', heading: 'Not a tax invoice', html: '<p>A proforma is not a demand for payment and usually carries no tax liability. The final invoice does.</p>' }
    ],
    steps: ['Enter seller, buyer and proforma number.', 'List items and prices.', 'Copy or print the proforma.'],
    facts: [['Output', 'Proforma invoice'], ['Purpose', 'Preliminary billing'], ['Totals', 'Automatic'], ['Data handling', 'Runs locally']],
    useCases: [['Advance payment', 'Request a deposit.'], ['Customs', 'Document declared value.'], ['Approvals', 'Support purchase sign-off.']],
    tips: ['Label it clearly as proforma.', 'Match item details to the final invoice.', 'Note that it is not a payment demand.'],
    takeaways: ['Proformas preview charges.', 'They are not tax invoices.', 'They aid advance arrangements.'],
    faq: [['Is a proforma a tax invoice?', 'No.'], ['Can I charge tax on it?', 'Usually tax applies on the final invoice.'], ['Does it need a signature?', 'Not typically.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Issue the final bill with the <a href="invoice-generator.html">invoice generator</a>.</p>'
  }
});

/* ========================================================================
   8. SALARY SLIP GENERATOR
   ======================================================================== */
add({
  file: 'salary-slip-generator.html', folder: 'misc',
  name: 'Salary Slip Generator', tag: 'Business', icon: 'fa-solid fa-money-check-dollar',
  title: 'Salary Slip Generator | Free Payslip Maker',
  metaDesc: 'Create a salary slip with earnings, deductions and net pay for any month. Copy or print. Free, private and fully in-browser.',
  desc: 'Produce a monthly salary slip with earnings, deductions and net pay calculated automatically.',
  keywords: ['salary slip generator', 'payslip maker', 'salary slip', 'pay stub', 'monthly payslip', 'business tool'],
  featureList: ['Earnings and deductions', 'Net pay', 'Print/copy', '100% client-side'],
  panel: panel.wrap('slp', 'fa-solid fa-money-check-dollar', 'Salary slip',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('slpName', 'Employee name', 'Jane Doe') + inp('slpId', 'Employee ID', 'EMP-001') + inp('slpMonth', 'Month', 'October 2026') + '</div>' +
    '<div>' + num('slpBasic', 'Basic salary', '3000', 'step="0.01"') + num('slpAllow', 'Allowances', '500', 'step="0.01"') + num('slpDeduct', 'Deductions', '400', 'step="0.01"') + '</div></div>' +
    actions('slp') + outArea('slp')),
  js: `
    function gen(){var basic=+document.getElementById("slpBasic").value,allow=+document.getElementById("slpAllow").value,ded=+document.getElementById("slpDeduct").value;
      var gross=basic+allow;var net=gross-ded;
      var html="<h1 style='margin:0 0 4px'>SALARY SLIP</h1><div style='display:flex;justify-content:space-between'><div>Employee: <strong>"+document.getElementById("slpName").value+"</strong><br>ID: "+document.getElementById("slpId").value+"</div><div style='text-align:right'>Month: "+document.getElementById("slpMonth").value+"</div></div>";
      html+="<table style='width:100%;border-collapse:collapse;margin-top:16px'><tr><th style='text-align:left;padding:6px;border-bottom:2px solid #333'>Component</th><th style='text-align:right;padding:6px;border-bottom:2px solid #333'>Amount</th></tr>";
      html+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>Basic salary</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+basic.toFixed(2)+"</td></tr>";
      html+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>Allowances</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>"+allow.toFixed(2)+"</td></tr>";
      html+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'><strong>Gross</strong></td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'><strong>"+gross.toFixed(2)+"</strong></td></tr>";
      html+="<tr><td style='padding:6px;border-bottom:1px solid #ddd'>Deductions</td><td style='padding:6px;border-bottom:1px solid #ddd;text-align:right'>-"+ded.toFixed(2)+"</td></tr>";
      html+="<tr><td style='padding:6px'><strong>Net pay</strong></td><td style='padding:6px;text-align:right'><strong>"+net.toFixed(2)+"</strong></td></tr></table>";
      document.getElementById("slpOut").innerHTML=html;document.getElementById("slpProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#slpName,#slpId,#slpMonth,#slpBasic,#slpAllow,#slpDeduct").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("slpGo").addEventListener("click",gen);
    document.getElementById("slpCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("slpOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("slpPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("slp");});
    gen();`,
  article: {
    title: 'Salary Slip Generator: Produce a Payslip',
    lead: '<p>A salary slip breaks down pay for a period. This <strong>salary slip generator</strong> lists earnings, deductions and the resulting net pay.</p>',
    sections: [
      { id: 'parts', icon: 'fa-solid fa-money-check-dollar', heading: 'Components of pay', html: '<p>Basic pay plus allowances form gross pay. Deductions for tax, contributions and advances reduce it to net pay.</p>' },
      { id: 'records', icon: 'fa-solid fa-folder-open', heading: 'Keeping records', html: '<p>Payslips support tax filing, loan applications and dispute resolution. Keep a copy for each period.</p>' }
    ],
    steps: ['Enter employee details.', 'Add salary components and deductions.', 'Copy or print the slip.'],
    facts: [['Output', 'Salary slip'], ['Fields', 'Earnings, deductions'], ['Net pay', 'Automatic'], ['Data handling', 'Runs locally']],
    useCases: [['Employers', 'Issue payslips.'], ['Employees', 'Keep records.'], ['Freelancers', 'Document income.']],
    tips: ['Keep slips consistent month to month.', 'Store copies securely.', 'Check statutory deductions locally.'],
    takeaways: ['Gross minus deductions is net.', 'Payslips aid tax and loans.', 'Consistency matters.'],
    faq: [['Is it a legal payslip?', 'It provides the core fields; check local requirements.'], ['Can I add more deductions?', 'Combine them into the total.'], ['How do I save it?', 'Print to PDF.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Compute net pay details with the <a href="../finance/salary-calculator.html">salary calculator</a>.</p>'
  }
});

/* ========================================================================
   9. APPOINTMENT LETTER GENERATOR
   ======================================================================== */
add({
  file: 'appointment-letter-generator.html', folder: 'misc',
  name: 'Appointment Letter Generator', tag: 'Business', icon: 'fa-solid fa-file-contract',
  title: 'Appointment Letter Generator | Free HR Letter Maker',
  metaDesc: 'Generate an employment appointment letter with role, salary, start date and terms. Copy or print. Free and fully in-browser.',
  desc: 'Draft an employment appointment letter with the role, remuneration, start date and key terms.',
  keywords: ['appointment letter generator', 'employment letter', 'offer letter', 'hr letter', 'job appointment', 'business tool'],
  featureList: ['Role and salary', 'Start date', 'Print/copy', '100% client-side'],
  panel: panel.wrap('apl', 'fa-solid fa-file-contract', 'Appointment letter',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('aplCompany', 'Company', 'Acme Ltd') + inp('aplName', 'Employee', 'Jane Doe') + '</div>' +
    '<div>' + inp('aplRole', 'Job title', 'Software Engineer') + inp('aplStart', 'Start date', '2026-11-01') + '</div></div>' +
    '<div class="row3"style="margin-bottom:12px">' + inp('aplSalary', 'Annual salary', '60000') + '</div>' +
    ta('aplTerms', 'Additional terms', 'Standard working hours are 9am to 5pm, Monday to Friday.', 'Standard working hours are 9am to 5pm, Monday to Friday.') +
    actions('apl') + outArea('apl')),
  js: `
    function gen(){var html="<div style='text-align:right'>"+(new Date().toISOString().slice(0,10))+"</div><h1 style='margin:0 0 4px'>"+document.getElementById("aplCompany").value+"</h1><h2 style='margin:0 0 16px'>Letter of Appointment</h2>";
      html+="<p>Dear "+document.getElementById("aplName").value+",</p>";
      html+="<p>We are pleased to appoint you to the position of <strong>"+document.getElementById("aplRole").value+"</strong>, commencing on <strong>"+document.getElementById("aplStart").value+"</strong>.</p>";
      html+="<p>Your annual remuneration will be <strong>"+document.getElementById("aplSalary").value+"</strong>, payable in accordance with company policy.</p>";
      html+="<p>"+document.getElementById("aplTerms").value+"</p>";
      html+="<p>Please confirm your acceptance by signing and returning a copy of this letter.</p>";
      html+="<p>Yours sincerely,<br>____________________<br>"+document.getElementById("aplCompany").value+"</p>";
      document.getElementById("aplOut").innerHTML=html;document.getElementById("aplProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#aplCompany,#aplName,#aplRole,#aplStart,#aplSalary,#aplTerms").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("aplGo").addEventListener("click",gen);
    document.getElementById("aplCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("aplOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("aplPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("apl");});
    gen();`,
  article: {
    title: 'Appointment Letter Generator: Formalise a Hire',
    lead: '<p>An appointment letter confirms the terms of a new role. This <strong>appointment letter generator</strong> drafts one with the title, salary, start date and terms.</p>',
    sections: [
      { id: 'contents', icon: 'fa-solid fa-file-contract', heading: 'What to include', html: '<p>Job title, start date, remuneration, reporting line and key conditions. Reference the fuller contract where one exists.</p>' },
      { id: 'acceptance', icon: 'fa-solid fa-signature', heading: 'Acceptance', html: '<p>Ask the employee to sign and return a copy, creating a record of agreement to the stated terms.</p>' }
    ],
    steps: ['Enter company and employee details.', 'Add role, salary and start date.', 'Copy or print the letter.'],
    facts: [['Output', 'Appointment letter'], ['Fields', 'Role, salary, date'], ['Signature', 'Acceptance line'], ['Data handling', 'Runs locally']],
    useCases: [['HR', 'Onboard staff.'], ['Startups', 'Formalise offers.'], ['Documentation', 'Record terms.']],
    tips: ['Reference the full contract.', 'Keep the tone professional.', 'Store a signed copy.'],
    takeaways: ['Appointment letters state key terms.', 'They supplement the contract.', 'A signed copy is a record.'],
    faq: [['Is it a contract?', 'It can form part of one.'], ['Should it list all terms?', 'Summarise and reference the contract.'], ['Do I need a signature?', 'Recommended for acceptance.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Also prepare a <a href="salary-slip-generator.html">salary slip</a>.</p>'
  }
});

/* ========================================================================
   10. WORK EXPERIENCE LETTER GENERATOR
   ======================================================================== */
add({
  file: 'work-experience-letter-generator.html', folder: 'misc',
  name: 'Work Experience Letter Generator', tag: 'Business', icon: 'fa-solid fa-briefcase',
  title: 'Work Experience Letter Generator | Free Certificate',
  metaDesc: 'Create a work experience letter confirming an employee role and dates, ready to copy or print. Free and fully in-browser.',
  desc: 'Generate a work experience certificate confirming an employee role, duration and conduct.',
  keywords: ['work experience letter', 'experience certificate', 'employment letter', 'relieving letter', 'hr certificate', 'business tool'],
  featureList: ['Role and dates', 'Conduct statement', 'Print/copy', '100% client-side'],
  panel: panel.wrap('wel', 'fa-solid fa-briefcase', 'Work experience letter',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('welCompany', 'Company', 'Acme Ltd') + inp('welName', 'Employee', 'Jane Doe') + '</div>' +
    '<div>' + inp('welRole', 'Role', 'Software Engineer') + inp('welFrom', 'From', '2023-01-01') + '</div></div>' +
    '<div class="row3"style="margin-bottom:12px">' + inp('welTo', 'To', '2026-10-01') + '</div>' +
    actions('wel') + outArea('wel')),
  js: `
    function gen(){var html="<div style='text-align:right'>"+(new Date().toISOString().slice(0,10))+"</div><h1 style='margin:0 0 4px'>"+document.getElementById("welCompany").value+"</h1><h2 style='margin:0 0 16px'>To Whom It May Concern</h2>";
      html+="<p>This is to certify that <strong>"+document.getElementById("welName").value+"</strong> was employed with us as a <strong>"+document.getElementById("welRole").value+"</strong> from <strong>"+document.getElementById("welFrom").value+"</strong> to <strong>"+document.getElementById("welTo").value+"</strong>.</p>";
      html+="<p>During their tenure they carried out their duties diligently and maintained professional conduct at all times.</p>";
      html+="<p>We wish them continued success in their future endeavours.</p>";
      html+="<p>Yours faithfully,<br>____________________<br>"+document.getElementById("welCompany").value+"</p>";
      document.getElementById("welOut").innerHTML=html;document.getElementById("welProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#welCompany,#welName,#welRole,#welFrom,#welTo").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("welGo").addEventListener("click",gen);
    document.getElementById("welCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("welOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("welPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("wel");});
    gen();`,
  article: {
    title: 'Work Experience Letter Generator: Verify Employment',
    lead: '<p>A work experience letter confirms where and when someone worked and in what role. This <strong>work experience letter generator</strong> drafts one quickly.</p>',
    sections: [
      { id: 'contents', icon: 'fa-solid fa-briefcase', heading: 'What to state', html: '<p>Employer name, employee name, role and the employment dates. A brief conduct statement adds weight.</p>' },
      { id: 'use', icon: 'fa-solid fa-passport', heading: 'Why it matters', html: '<p>Employees need these for visas, further study and new jobs. Prompt, accurate letters help them move on smoothly.</p>' }
    ],
    steps: ['Enter employer and employee details.', 'Add role and dates.', 'Copy or print the letter.'],
    facts: [['Output', 'Experience letter'], ['Fields', 'Role, dates'], ['Statement', 'Conduct line'], ['Data handling', 'Runs locally']],
    useCases: [['Visa', 'Support applications.'], ['New jobs', 'Verify history.'], ['Education', 'Admissions proof.']],
    tips: ['Confirm exact dates.', 'Keep the wording factual.', 'Sign and stamp if company policy requires.'],
    takeaways: ['Experience letters verify employment.', 'Dates and role are essential.', 'They support visa and job applications.'],
    faq: [['Is it the same as a relieving letter?', 'No, relieving letters confirm a clean exit.'], ['Does it need a stamp?', 'Company policy decides.'], ['Can I include salary?', 'Only if policy allows.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Pair it with the <a href="appointment-letter-generator.html">appointment letter generator</a>.</p>'
  }
});

/* ========================================================================
   11. COVER LETTER GENERATOR
   ======================================================================== */
add({
  file: 'cover-letter-generator.html', folder: 'misc',
  name: 'Cover Letter Generator', tag: 'Business', icon: 'fa-solid fa-envelope-open-text',
  title: 'Cover Letter Generator | Free Job Application Letter',
  metaDesc: 'Build a professional cover letter from your details, role and key strengths. Copy or print. Free and fully in-browser.',
  desc: 'Draft a tailored cover letter from your name, the target role, company and key strengths.',
  keywords: ['cover letter generator', 'cover letter maker', 'job application letter', 'application letter', 'cv letter', 'career tool'],
  featureList: ['Structured template', 'Key strengths', 'Print/copy', '100% client-side'],
  panel: panel.wrap('cvl', 'fa-solid fa-envelope-open-text', 'Cover letter',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('cvlName', 'Your name', 'Jane Doe') + inp('cvlRole', 'Target role', 'Product Designer') + inp('cvlCompany', 'Company', 'Acme Ltd') + '</div>' +
    '<div>' + inp('cvlEmail', 'Your email', 'jane@example.com') + inp('cvlPhone', 'Your phone', '+1 555 0100') + '</div></div>' +
    ta('cvlStrengths', 'Key strengths (one per line)', 'Five years of product design\nLed a team of four\nImproved conversion by 20%', 'Five years of product design\nLed a team of four\nImproved conversion by 20%') +
    actions('cvl') + outArea('cvl')),
  js: `
    function gen(){var name=document.getElementById("cvlName").value;var strengths=document.getElementById("cvlStrengths").value.split(/\\n+/).filter(function(x){return x.trim()});
      var html="<div style='text-align:right'>"+(new Date().toISOString().slice(0,10))+"</div><p><strong>"+name+"</strong><br>"+document.getElementById("cvlEmail").value+"<br>"+document.getElementById("cvlPhone").value+"</p>";
      html+="<p>Dear Hiring Manager,</p>";
      html+="<p>I am writing to apply for the <strong>"+document.getElementById("cvlRole").value+"</strong> role at <strong>"+document.getElementById("cvlCompany").value+"</strong>. I believe my experience aligns well with what you are looking for.</p>";
      if(strengths.length){html+="<p>Key highlights of my background include:</p><ul>";strengths.forEach(function(s){html+="<li>"+s+"</li>";});html+="</ul>";}
      html+="<p>I would welcome the opportunity to discuss how I can contribute to your team.</p>";
      html+="<p>Yours sincerely,<br>"+name+"</p>";
      document.getElementById("cvlOut").innerHTML=html;document.getElementById("cvlProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    document.querySelectorAll("#cvlName,#cvlRole,#cvlCompany,#cvlEmail,#cvlPhone,#cvlStrengths").forEach(function(el){el.addEventListener("input",gen);});
    document.getElementById("cvlGo").addEventListener("click",gen);
    document.getElementById("cvlCopy").addEventListener("click",function(){var r=document.createRange();r.selectNode(document.getElementById("cvlOut"));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");});
    document.getElementById("cvlPrint").addEventListener("click",function(){`+PRINT_HELPER+`doPrint("cvl");});
    gen();`,
  article: {
    title: 'Cover Letter Generator: Apply With Impact',
    lead: '<p>A cover letter connects your CV to the role. This <strong>cover letter generator</strong> structures your details, target role and strengths into a professional letter.</p>',
    sections: [
      { id: 'structure', icon: 'fa-solid fa-envelope-open-text', heading: 'Structure', html: '<p>Opening states the role and enthusiasm, the body lists relevant strengths, and the close invites a conversation.</p>' },
      { id: 'tailor', icon: 'fa-solid fa-bullseye', heading: 'Tailor each letter', html: '<p>Generic letters underperform. Adjust the strengths and tone for each application and mirror the job description language.</p>' }
    ],
    steps: ['Enter your details and target role.', 'List your key strengths.', 'Copy or print the letter.'],
    facts: [['Output', 'Cover letter'], ['Fields', 'Role, strengths'], ['Format', 'One page'], ['Data handling', 'Runs locally']],
    useCases: [['Job applications', 'Accompany a CV.'], ['Career changes', 'Explain the pivot.'], ['Graduates', 'Bridge limited experience.']],
    tips: ['Keep it to one page.', 'Match role keywords.', 'Proofread before sending.'],
    takeaways: ['Cover letters add context.', 'Tailoring boosts relevance.', 'Clarity beats length.'],
    faq: [['How long should it be?', 'One page.'], ['Do employers read it?', 'Many do, especially for competitive roles.'], ['Can I reuse it?', 'Tailor each time.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Prepare matching details with the <a href="browser-fingerprint-checker.html">tools hub</a>.</p>'
  }
});

/* ========================================================================
   12. NUMBER TO WORDS CONVERTER
   ======================================================================== */
add({
  file: 'number-to-words-converter.html', folder: 'converters',
  name: 'Number to Words Converter', tag: 'Converter', icon: 'fa-solid fa-spell-check',
  title: 'Number to Words Converter | Convert Numbers to Text',
  metaDesc: 'Convert numbers into English words, including large values, for cheques and documents. Free, private and fully in-browser.',
  desc: 'Spell out any number in English words, useful for cheques, invoices and legal documents.',
  keywords: ['number to words', 'number to text', 'spell number', 'cheque amount words', 'convert number words', 'converter'],
  featureList: ['Large numbers', 'Cheque-ready', 'Copy output', '100% client-side'],
  panel: panel.wrap('n2w', 'fa-solid fa-spell-check', 'Number to words',
    '<div class="row3"style="margin-bottom:14px">' + inp('n2wNum', 'Number', '1234567') + '</div>' +
    go('n2w', 'Convert') + tiles([['In words', 'n2wOut']])),
  js: `
    var ones=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
    var tens=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
    function two(n){if(n<20)return ones[n];var t=Math.floor(n/10),o=n%10;return tens[t]+(o?"-"+ones[o]:"");}
    function three(n){var h=Math.floor(n/100),r=n%100;var s=h?ones[h]+" hundred":"",rest=r?" "+two(r):"";return (s+rest).trim();}
    function toWords(n){if(n===0)return "zero";var groups=["","thousand","million","billion","trillion"];var parts=[];var gi=0;
      while(n>0){var chunk=n%1000;if(chunk)parts.unshift(three(chunk)+" "+groups[gi]);n=Math.floor(n/1000);gi++;}
      return parts.join(", ").replace(/\\s+/g," ").trim();}
    function run(){var raw=document.getElementById("n2wNum").value.replace(/[^0-9.-]/g,"");var neg=raw.indexOf("-")===0;var parts=raw.replace("-","").split(".");var i=parts[0],d=parts[1];
      var out=toWords(parseInt(i||"0",10));
      if(d&&parseInt(d,10)>0){var dv=d.slice(0,2);while(dv.length<2)dv+="0";var cents=parseInt(dv,10);out+=" point "+two(cents);}
      if(neg)out="minus "+out;
      document.getElementById("n2wOut").textContent=out.charAt(0).toUpperCase()+out.slice(1);
      document.getElementById("n2wProc").textContent="Converted in this tab - 0 bytes uploaded.";}
    document.getElementById("n2wNum").addEventListener("input",run);
    document.getElementById("n2wGo").addEventListener("click",run);run();`,
  article: {
    title: 'Number to Words Converter: Spell Out Amounts',
    lead: '<p>Cheques, contracts and invoices often need numbers written in words. This <strong>number to words converter</strong> spells out values up to the trillions.</p>',
    sections: [
      { id: 'why', icon: 'fa-solid fa-spell-check', heading: 'Why write numbers in words', html: '<p>Words are harder to alter than digits, so legal and financial documents use both forms. It also aids accessibility for screen readers.</p>' },
      { id: 'decimals', icon: 'fa-solid fa-circle-half-stroke', heading: 'Decimals', html: '<p>Decimal portions are read digit by digit after the word "point", matching common cheque practice.</p>' }
    ],
    steps: ['Enter a number.', 'Read the words instantly.', 'Copy into your document.'],
    facts: [['Range', 'Up to trillions'], ['Decimals', 'Spoken digit by digit'], ['Output', 'English words'], ['Data handling', 'Runs locally']],
    useCases: [['Cheques', 'Write amounts in words.'], ['Contracts', 'Spell out figures.'], ['Accessibility', 'Provide text forms.']],
    tips: ['Use words for formal documents.', 'Double-check large values.', 'Combine digits and words for clarity.'],
    takeaways: ['Words reduce fraud risk.', 'Large values are supported.', 'Decimals are spoken digit by digit.'],
    faq: [['How large a number?', 'Up to trillions.'], ['How are decimals read?', 'Digit by digit after "point".'], ['Does it use Indian numbering?', 'It uses the short scale (million, billion).'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Convert other values with the <a href="../misc/roman-numeral-converter.html">Roman numeral converter</a>.</p>'
  }
});

/* ========================================================================
   13. AADHAAR MASKING TOOL
   ======================================================================== */
add({
  file: 'aadhaar-masking-tool.html', folder: 'misc',
  name: 'Aadhaar Masking Tool', tag: 'Privacy', icon: 'fa-solid fa-mask',
  title: 'Aadhaar Masking Tool | Mask ID Numbers Safely',
  metaDesc: 'Mask Aadhaar or ID numbers so only the last four digits remain visible, protecting identity in shared documents. In-browser and private.',
  desc: 'Hide the first digits of an ID number, revealing only the last four for safe sharing.',
  keywords: ['aadhaar masking', 'mask id number', 'redact aadhaar', 'hide id digits', 'privacy tool', 'mask number'],
  featureList: ['Show last four', 'Multiple inputs', 'Copy output', '100% client-side'],
  panel: panel.wrap('aad', 'fa-solid fa-mask', 'Aadhaar masking',
    ta('aadIn', 'ID numbers (one per line)', '1234 5678 9012\n987654321098', '1234 5678 9012\n987654321098') +
    go('aad', 'Mask numbers') + '<div class="io-field"style="margin-top:14px"><label>Masked output</label><textarea id="aadOut"readonly style="min-height:120px"></textarea></div>'),
  js: `
    function run(){var lines=document.getElementById("aadIn").value.split(/\\n+/);
      var out=lines.map(function(l){if(!l.trim())return "";
        var digitCount=(l.match(/\\d/g)||[]).length;if(digitCount<=4)return l;
        var keep=4,seen=0;
        return l.replace(/\\d/g,function(d){seen++;return seen<=digitCount-keep?"X":d;});}).join("\\n");
      document.getElementById("aadOut").value=out;document.getElementById("aadProc").textContent="Masked in this tab - 0 bytes uploaded.";}
    document.getElementById("aadIn").addEventListener("input",run);
    document.getElementById("aadGo").addEventListener("click",run);run();`,
  article: {
    title: 'Aadhaar Masking Tool: Share IDs Safely',
    lead: '<p>Sharing a full ID number risks identity theft. This <strong>Aadhaar masking tool</strong> hides all but the last four digits so documents stay usable but safer.</p>',
    sections: [
      { id: 'why', icon: 'fa-solid fa-mask', heading: 'Why masking helps', html: '<p>Many services only need the last four digits to verify identity. Hiding the rest reduces the value of a leaked document.</p>' },
      { id: 'limit', icon: 'fa-solid fa-triangle-exclamation', heading: 'Not a full redaction', html: '<p>Masking here produces text. For images or PDFs, combine with a proper redaction tool so hidden data cannot be recovered.</p>' }
    ],
    steps: ['Paste the ID numbers.', 'Press Mask numbers.', 'Copy the masked output.'],
    facts: [['Reveals', 'Last four digits'], ['Input', 'One per line'], ['Output', 'Masked text'], ['Data handling', 'Runs locally']],
    useCases: [['Forms', 'Share safer copies.'], ['Support tickets', 'Show part of an ID.'], ['Records', 'Mask stored documents.']],
    tips: ['Never share the unmasked original unnecessarily.', 'For files, use true redaction.', 'Verify masking before sending.'],
    takeaways: ['Masking reveals only the last four.', 'It reduces identity-theft risk.', 'Image redaction is stronger for files.'],
    faq: [['Is masked data safe to share?', 'It is safer but not risk-free.'], ['Does it work on any ID?', 'Any numeric ID pattern.'], ['Can I unmask?', 'No, the hidden digits are gone.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Redact PDFs with the <a href="../pdf/unredact-pdf.html">PDF tools</a>.</p>'
  }
});

/* ========================================================================
   14. SIGNATURE GENERATOR
   ======================================================================== */
add({
  file: 'signature-generator.html', folder: 'misc',
  name: 'Signature Generator', tag: 'Utility', icon: 'fa-solid fa-signature',
  title: 'Signature Generator | Create a Cursive Signature',
  metaDesc: 'Create a cursive signature from your name and download it as a PNG. Free, private and fully in-browser.',
  desc: 'Generate a cursive signature by typing your name, with adjustable size and colour, then download a PNG.',
  keywords: ['signature generator', 'signature maker', 'typed signature', 'esignature', 'cursive signature', 'utility'],
  featureList: ['Cursive styling', 'Adjustable size', 'PNG download', '100% client-side'],
  panel: panel.wrap('sig', 'fa-solid fa-signature', 'Signature generator',
    '<div class="io-grid two"style="margin-bottom:14px">' +
    '<div>' + inp('sigText', 'Type your name', 'Jane Doe') +
    '<div class="field"style="margin-top:10px"><label for="sigSize">Font size</label><input id="sigSize"type="number"min="20"max="120"value="56"style="width:100%"></div>' +
    '<div class="field"style="margin-top:10px"><label for="sigColor">Colour</label><input id="sigColor"type="color"value="#111111"style="height:42px"></div></div>' +
    '<div class="io-field"><label>Preview</label><canvas id="sigCv"style="max-width:100%;background:#f3f4f6;border-radius:10px;border:1px solid var(--border)"></canvas></div></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="sigGo"><i class="fa-solid fa-signature"></i>Generate</button> ' +
    '<button class="rt-btn"type="button"id="sigDl"><i class="fa-solid fa-download"></i>Download PNG</button></div>'),
  js: `
    function draw(){var t=document.getElementById("sigText").value||"Signature";var size=+document.getElementById("sigSize").value;var col=document.getElementById("sigColor").value;
      var c=document.getElementById("sigCv");c.width=600;c.height=200;var x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);
      x.font="italic "+size+"px 'Brush Script MT','Segoe Script',cursive";x.fillStyle=col;x.textAlign="center";x.textBaseline="middle";
      x.fillText(t,c.width/2,c.height/2);document.getElementById("sigProc").textContent="Generated in this tab - 0 bytes uploaded.";}
    ["sigText","sigSize","sigColor"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
    document.getElementById("sigGo").addEventListener("click",draw);
    document.getElementById("sigDl").addEventListener("click",function(){document.getElementById("sigCv").toBlob(function(bl){var a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download="signature.png";a.click();URL.revokeObjectURL(a.href);});});draw();`,
  article: {
    title: 'Signature Generator: Create an E-Signature',
    lead: '<p>A digital signature is handy for forms and documents. This <strong>signature generator</strong> renders your name in a cursive style and exports a PNG.</p>',
    sections: [
      { id: 'fonts', icon: 'fa-solid fa-signature', heading: 'Cursive styling', html: '<p>Script fonts mimic handwriting. Adjust size and colour, then export a transparent-ready PNG for documents.</p>' },
      { id: 'legal', icon: 'fa-solid fa-scale-balanced', heading: 'Legal note', html: '<p>A generated image is a visual signature, not a cryptographic one. For binding agreements, follow your jurisdiction e-signature rules.</p>' }
    ],
    steps: ['Type your name.', 'Adjust font size and colour.', 'Download the PNG.'],
    facts: [['Modes', 'Typed (drawn supported by canvas)'], ['Output', 'PNG'], ['Style', 'Cursive'], ['Data handling', 'Runs locally']],
    useCases: [['Forms', 'Add a signature image.'], ['Documents', 'Sign digitally.'], ['Design', 'Personalised marks.']],
    tips: ['Use a readable script font.', 'Export with a transparent look.', 'Check e-signature laws for contracts.'],
    takeaways: ['Generated signatures are visual.', 'Cursive fonts suit the look.', 'Legal validity varies by context.'],
    faq: [['Can I draw instead?', 'This tool types; drawing tools exist elsewhere.'], ['Is it legally binding?', 'Depends on jurisdiction and context.'], ['Is the PNG transparent?', 'The canvas has a light background by default.'], ['Is my data uploaded?', 'No, it stays local.']],
    conclusion: '<p>Add the signature to a <a href="invoice-generator.html">generated invoice</a>.</p>'
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
