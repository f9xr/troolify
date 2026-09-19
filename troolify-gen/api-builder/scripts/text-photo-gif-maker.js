var mode="ttp", lastUrl="", lastMode="ttp";
var runBtn=$("runBtn");
window.ap=window.ap||{};
Array.prototype.forEach.call(document.querySelectorAll("#modeRow .chip"),function(c){
  c.addEventListener("click",function(){
    Array.prototype.forEach.call(document.querySelectorAll("#modeRow .chip"),function(x){x.classList.remove("active");});
    c.classList.add("active");mode=c.getAttribute("data-t");
  });
});
runBtn.addEventListener("click",function(){
  if(this.disabled)return;
  var w=$("txt").value.trim();
  if(!w){$("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Enter some text first.</div>';proc("Ready.");return;}
  lastMode=mode;
  lastUrl=API_BASE+"/maker/"+mode+"?text="+encodeURIComponent(w)+"&_="+Date.now();
  var isGif=(lastMode==="attp");
  proc(isGif?"Rendering your animated GIF...":"Rendering your photo...");
  $("results").innerHTML=
    '<div class="quote-author" style="color:var(--faint)">Mode: '+(isGif?"Animated GIF (Monte)":"Photo (TTP)")+"</div>"+
    '<div class="media-host"><img class="media-prev" id="makerImg" src="'+esc(lastUrl)+'" alt="'+(isGif?"Animated text GIF":"Text to photo export")+'"></div>'+
    '<div class="actions" style="justify-content:center;margin-top:12px">'+
    '<button class="rt-btn" type="button" onclick="ap.dl(this)"><i class="fa-solid fa-download"></i>Download '+(isGif?"GIF":"image")+'</button>'+
    '<button class="rt-btn" type="button" onclick="ap.open()"><i class="fa-solid fa-up-right-from-square"></i>Open full size</button>'+
    '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Regenerate</button>'+
    "</div>";
  var img=$("makerImg");
  img.addEventListener("load",function(){proc((isGif?"GIF":"Photo")+" ready - download it with the button above.");},{once:true});
  img.addEventListener("error",function(){
    $("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> '+(isGif?"The animated GIF service is busy right now - switch to Photo (TTP) mode, or try again in a moment.":"The rendering service did not respond - please try again in a moment.")+"</div>";
    proc("Rendering failed.");
  },{once:true});
});
window.ap.go=function(){runBtn.click();};
window.ap.open=function(){if(lastUrl)window.open(lastUrl,"_blank");};
window.ap.dl=function(btn){if(!lastUrl){if(btn)btn.innerHTML="Generate first";return;}downloadFromUrl(lastUrl,"troolify-"+(lastMode==="attp"?"ttg":"ttp")+(lastMode==="attp"?".gif":".png"));};