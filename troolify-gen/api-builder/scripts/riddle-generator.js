var qTxt="", aTxt="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(this.disabled)return;var restore=busify(this);qTxt="";aTxt="";
  $("results").innerHTML='<div class="res-phase"><i class="fa-solid fa-brain"></i> Loading a riddle...</div>';
  apiGet("/api/game/riddle",function(d){
    qTxt=String(d.question||d.riddle||d.q||"");aTxt=String(d.answer||d.ans||"");
    $("results").innerHTML=
      '<div class="quote-body"><i class="fa-solid fa-puzzle-piece"></i>'+esc(qTxt)+"</div>"+
      '<div class="quote-author" style="color:var(--muted)">Can you guess it?</div>'+
      '<div id="ansCard" style="text-align:center;margin-top:10px"><button class="rt-btn" type="button" onclick="ap.reveal(this)"><i class="fa-solid fa-eye"></i>Show answer</button></div>'+
      '<div class="actions" style="justify-content:center;margin-top:12px">'+
      '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy riddle</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Another riddle</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.reveal=function(btn){
  var c=$("ansCard");if(!c)return;
  c.innerHTML='<div class="quote-body" style="font-size:.92rem;color:#6EE7B7"><i class="fa-solid fa-check"></i>'+esc(aTxt)+"</div>";
};
window.ap.copy=function(btn){
  var s=qTxt+(aTxt?"\nAnswer: "+aTxt:"");
  if(!qTxt){if(btn)btn.innerHTML="Fetch first";return;}
  copyText(s,btn);
};