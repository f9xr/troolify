var runBtn=$("runBtn"), nsfw=$("nsfw");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(this.disabled)return;var restore=busify(this);
  apiGet("/api/fun/meme?nsfw="+(nsfw.checked?"true":"false"),function(d){
    var img=d.meme_url||(d.preview_images&&d.preview_images[d.preview_images.length-1])||"";
    var title=d.title||"Untitled meme";
    var sub=d.subreddit||"";
    var uv=(d.up_votes!=null)?d.up_votes:"";
    var post=d.post_link||"";
    $("results").innerHTML=
      '<div class="meme-title">'+esc(title)+"</div>"+
      (img?'<div class="media-host"><img class="media-prev" src="'+esc(img)+'" alt="Random meme from r/'+esc(sub)+'" loading="lazy"></div>':'')+
      '<div class="meme-meta" style="margin-top:10px">'+
      (sub?'<span><i class="fa-brands fa-reddit"></i>r/'+esc(sub)+"</span>":"")+
      (uv!==''?'<span><i class="fa-solid fa-arrow-up"></i>'+esc(uv)+' upvotes</span>':'')+
      (d.author?'<span><i class="fa-solid fa-user"></i>u/'+esc(d.author)+"</span>":"")+
      "</div>"+
      '<div class="actions" style="justify-content:center;margin-top:12px">'+
      (post?'<a class="rt-btn" href="'+esc(post)+'" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open post</a>':'')+
      (img?'<button class="rt-btn" type="button" onclick="ap.dl(this)"><i class="fa-solid fa-download"></i>Download</button>':'')+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Another meme</button>'+
      "</div>";
    restore();},restore);
});
window.ap.go=function(){runBtn.click();};
window.ap.dl=function(btn){
  var img=document.querySelector("#results img.media-prev");
  if(!img){if(btn)btn.innerHTML="Fetch first";return;}
  var ext=/\.(png|jpe?g|gif|webp)(\?|$)/i.test(img.src)?img.src.match(/\.(png|jpe?g|gif|webp)/i)[0]:"png";
  downloadFromUrl(img.src,"troolify-meme"+ext);
};