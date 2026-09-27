var style="neon", lastUrl="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
Array.prototype.forEach.call(document.querySelectorAll("#styleRow .chip"),function(c){
  c.addEventListener("click",function(){
    Array.prototype.forEach.call(document.querySelectorAll("#styleRow .chip"),function(x){x.classList.remove("active");});
    c.classList.add("active");style=c.getAttribute("data-t");
  });
});
runBtn.addEventListener("click",function(){
  if(this.disabled)return;
  var w=$("word").value.trim();
  if(!w){$("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Enter a word or brand name first.</div>';proc("Ready.");return;}
  lastUrl=API_BASE+"/api/logo/"+style+"?text="+encodeURIComponent(w)+"&_="+Date.now();
  proc("Rendering your logo...");
  $("results").innerHTML=
    '<div class="quote-author" style="color:var(--faint);text-transform:capitalize">Style: '+esc(style)+"</div>"+
    '<div class="media-host"><img class="media-prev" id="logoImg" src="'+esc(lastUrl)+'" alt="Text logo - '+esc(w)+' ('+esc(style)+' style)"></div>'+
    '<div class="actions" style="justify-content:center;margin-top:12px">'+
    '<button class="rt-btn" type="button" onclick="ap.dl(this)"><i class="fa-solid fa-download"></i>Download PNG</button>'+
    '<button class="rt-btn" type="button" onclick="ap.open()"><i class="fa-solid fa-up-right-from-square"></i>Open image</button>'+
    '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Regenerate</button>'+
    "</div>";
  var img=$("logoImg");
  img.addEventListener("load",function(){proc("Logo ready - use Download PNG to save it.");},{once:true});
  img.addEventListener("error",function(){
    $("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> The logo service did not render that style - please try again or pick another style.</div>';
    proc("Rendering failed.");
  },{once:true});
});
window.ap.go=function(){runBtn.click();};
window.ap.open=function(){if(lastUrl)window.open(lastUrl,"_blank");};
window.ap.dl=function(btn){if(!lastUrl){if(btn)btn.innerHTML="Generate first";return;}downloadFromUrl(lastUrl,"troolify-logo-"+style+".png");};