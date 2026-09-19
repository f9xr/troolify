var styleJ="jdev", setupTxt="", punchTxt="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
$("jtype").addEventListener("change",function(){styleJ=this.value;});
runBtn.addEventListener("click",function(){
  if(this.disabled)return;var restore=busify(this);setupTxt="";punchTxt="";
  apiGet("/api/fun/"+styleJ,function(d){
    setupTxt=String(d.setup!=null?d.setup:d);punchTxt=String(d.punchline||"");
    $("results").innerHTML=
      '<div class="quote-body" id="setupCard">'+esc(setupTxt)+"</div>"+
      '<div class="quote-body" id="punchCard" style="font-size:.82rem;min-height:22px"><button class="rt-btn" type="button" onclick="ap.reveal(this)"><i class="fa-solid fa-eye"></i>Show punchline</button></div>'+
      '<div class="actions" style="justify-content:center;margin-top:10px">'+
      '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy joke</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Get another</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.reveal=function(btn){
  var card=$("punchCard");
  if(punchTxt){card.innerHTML="&ldquo;";card.insertAdjacentText("beforeend",punchTxt);card.insertAdjacentHTML("beforeend","&rdquo;");if(btn)btn.remove();}
};
window.ap.copy=function(btn){
  var s=setupTxt+(punchTxt?"\n"+punchTxt:"");
  if(!s){if(btn)btn.innerHTML="Fetch first";return;}
  copyText(s,btn);
};