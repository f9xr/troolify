var lastQ="", lastA="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(!this.disabled){var restore=busify(this);lastQ="";lastA="";
  apiGet("/api/fun/quotes",function(d){
    lastQ=d.quotes||d.quote||d.result||String(d);lastA=d.author||"";
    $("results").innerHTML=
      '<div class="quote-body" id="qBody">&ldquo;'+esc(lastQ)+'&rdquo;</div>'+
      (lastA?'<div class="quote-author">&mdash; '+esc(lastA)+'</div>':'')+
      '<div class="actions" style="justify-content:center;margin-top:14px">'+
      '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy quote</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Get another</button>'+
      "</div>";restore();},restore);
  }
});
window.ap.go=function(){runBtn.click();};
window.ap.copy=function(btn){
  var s=lastQ+(lastA?"\n- "+lastA:"");
  if(!s){
    if(btn)btn.innerHTML='<i class="fa-solid fa-quote-right"></i>Fetch first';return;
  }
  copyText(s,btn);
};