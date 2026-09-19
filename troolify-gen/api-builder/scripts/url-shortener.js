var lastShort="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(this.disabled)return;
  var u=$("url").value.trim();
  if(!u){$("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Paste a link first.</div>';proc("Ready.");return;}
  if(!/^https?:\/\//i.test(u)){u="https://"+u;}
  var svc=$("svc").value;var restore=busify(this);lastShort="";
  apiGet("/api/tool/"+svc+"?url="+encodeURIComponent(u),function(d){
    lastShort=(typeof d==="string")?d:(d.link||d.shorturl||d.shortUrl||d.url||String(d));
    $("results").innerHTML=
      '<div class="sh-link">'+
      '<i class="fa-solid fa-link" style="color:#60A5FA"></i>'+
      '<input type="text" id="shortOut" readonly value="'+esc(lastShort)+'" aria-label="Short URL">'+
      '<button class="rt-btn" type="button" onclick="ap.copy(this)"><i class="fa-solid fa-copy"></i>Copy</button>'+
      '<button class="rt-btn" type="button" onclick="ap.open()"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open</button>'+
      "</div>"+
      '<div class="note" style="text-align:center"><b>Service:</b> '+(svc==="tinyurl"?"TinyURL":"Bitly")+" &middot; the short link redirects to your original URL.</div>";restore();},restore);
});
window.ap.copy=function(btn){if(!lastShort){if(btn)btn.innerHTML="Fetch first";return;}copyText(lastShort,btn);};
window.ap.open=function(){if(lastShort)window.open(lastShort,"_blank","noopener");};