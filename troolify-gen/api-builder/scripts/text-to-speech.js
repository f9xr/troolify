var lastAudio="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(this.disabled)return;
  var t=$("ttsText").value.trim();
  if(!t){$("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Type or paste some text first.</div>';proc("Ready.");return;}
  var restore=busify(this);lastAudio="";
  apiGet("/api/tool/tts?text="+encodeURIComponent(t),function(d){
    lastAudio=(d.tts&&d.tts.url)||d.url||"";
    if(!lastAudio){$("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> The API returned no audio.</div>';return;}
    $("results").innerHTML=
      '<div class="media-host" style="margin-top:6px"><audio id="ttsAudio" controls autoplay style="width:100%;max-width:420px"><source src="'+esc(lastAudio)+'" type="audio/mpeg">Your browser does not support audio playback.</audio></div>'+
      '<div class="actions" style="justify-content:center;margin-top:12px">'+
      '<button class="rt-btn" type="button" onclick="ap.dl(this)"><i class="fa-solid fa-download"></i>Download audio</button>'+
      '<button class="rt-btn" type="button" onclick="ap.open()"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open audio</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Speak again</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.open=function(){if(lastAudio)window.open(lastAudio,"_blank");};
window.ap.dl=function(btn){if(!lastAudio){if(btn)btn.innerHTML="Speak first";return;}downloadFromUrl(lastAudio,"troolify-speech.mp3");};