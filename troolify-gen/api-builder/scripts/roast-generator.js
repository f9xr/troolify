var lastR="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(this.disabled)return;var restore=busify(this);lastR="";
  apiGet("/api/fun/roast",function(d){
    lastR=String(d);
    $("results").innerHTML=
      '<div class="quote-body"><i class="fa-solid fa-fire"></i>'+esc(lastR)+"</div>"+
      '<div class="actions" style="justify-content:center;margin-top:14px">'+
      '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy roast</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Another one</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.copy=function(btn){
  if(!lastR){if(btn)btn.innerHTML="Fetch first";return;}
  copyText(lastR,btn);
};