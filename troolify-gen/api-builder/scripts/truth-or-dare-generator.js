var mode=$("mode"), lastP="", lastMode="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
function pickMode(){
  if(mode.value==="random"){var r=Math.random();return r<0.5?"truth":"dare";}
  return mode.value;
}
runBtn.addEventListener("click",function(){
  if(this.disabled)return;var restore=busify(this);lastP="";
  var m=pickMode();var tag=(m==="truth")?'<span style="color:#6EE7B7">Truth</span>':'<span style="color:#FCA5A5">Dare</span>';
  apiGet("/api/game/"+m,function(d){
    lastP=String(d);lastMode=m;
    $("results").innerHTML=
      '<div class="quote-author" style="color:var(--faint)">Mode: '+tag+"</div>"+
      '<div class="quote-body"><i class="fa-solid fa-dice-d6"></i>'+esc(lastP)+"</div>"+
      '<div class="actions" style="justify-content:center;margin-top:12px">'+
      '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy prompt</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Next player</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.copy=function(btn){
  var s=(lastMode?lastMode.toUpperCase()+" - ":"")+lastP;
  if(!lastP){if(btn)btn.innerHTML="Fetch first";return;}
  copyText(s,btn);
};