var lastF="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(this.disabled)return;var restore=busify(this);lastF="";
  apiGet("/api/fun/facts",function(d){
    lastF=String(d);
    $("results").innerHTML=
      '<div class="quote-body"><i class="fa-solid fa-circle-info"></i>'+esc(lastF)+"</div>"+
      '<div class="actions" style="justify-content:center;margin-top:14px">'+
      '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy fact</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Got another</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.copy=function(btn){
  if(!lastF){if(btn)btn.innerHTML="Fetch first";return;}
  copyText(lastF,btn);
};