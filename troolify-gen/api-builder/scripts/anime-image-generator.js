var theme="waifu", lastUrl="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
Array.prototype.forEach.call(document.querySelectorAll("#themeRow .chip"),function(c){
  c.addEventListener("click",function(){
    Array.prototype.forEach.call(document.querySelectorAll("#themeRow .chip"),function(x){x.classList.remove("active");});
    c.classList.add("active");theme=c.getAttribute("data-t");
  });
});
runBtn.addEventListener("click",function(){
  if(this.disabled)return;var restore=busify(this);lastUrl="";
  if(theme==="couplepp"){
    apiGet("/api/anime/couplepp",function(d){
      var m=d.male,f=d.female;
      $("results").innerHTML=
        '<div class="row2">'+
        '<div class="media-host"><img class="media-prev" style="max-height:300px" src="'+esc(m)+'" alt="Couple avatar - male" loading="lazy"><div class="quote-author">He</div></div>'+
        '<div class="media-host"><img class="media-prev" style="max-height:300px" src="'+esc(f)+'" alt="Couple avatar - female" loading="lazy"><div class="quote-author">She</div></div>'+
        "</div>"+
        '<div class="actions" style="justify-content:center;margin-top:12px">'+
        '<button class="rt-btn" type="button" onclick="ap.open(\''+esc(m)+'\')"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open male</button>'+
        '<button class="rt-btn" type="button" onclick="ap.open(\''+esc(f)+'\')"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open female</button>'+
        '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Another</button>'+
        "</div>";restore();},restore);
    return;
  }
  apiGet("/api/anime/"+theme,function(d){
    lastUrl=String(d);
    var isVideo=(theme==="astatus");
    var inner=isVideo
      ?'<video class="media-prev" controls autoplay loop muted src="'+esc(lastUrl)+'" alt="Anime clip - Astatus"></video>'
      :'<img class="media-prev" src="'+esc(lastUrl)+'" alt="Random anime image - '+esc(theme)+'" loading="lazy">';
    $("results").innerHTML=
      '<div class="quote-author" style="color:var(--faint);text-transform:capitalize">Theme: '+esc(theme)+"</div>"+
      '<div class="media-host">'+inner+"</div>"+
      '<div class="actions" style="justify-content:center;margin-top:12px">'+
      '<button class="rt-btn" type="button" onclick="ap.open()"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open full size</button>'+
      '<button class="rt-btn" type="button" onclick="ap.dl(this)"><i class="fa-solid fa-download"></i>Download</button>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Another</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.open=function(u){window.open(u||lastUrl,"_blank");};
window.ap.dl=function(btn){if(!lastUrl){if(btn)btn.innerHTML="Fetch first";return;}downloadFromUrl(lastUrl,"troolify-anime"+((theme==="astatus")?".mp4":".jpg"));};