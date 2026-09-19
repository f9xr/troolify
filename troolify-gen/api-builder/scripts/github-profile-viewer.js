var lastUser="";
var runBtn=$("runBtn");
window.ap=window.ap||{};
runBtn.addEventListener("click",function(){
  if(this.disabled)return;
  var u=$("user").value.trim();
  if(!u){$("results").innerHTML='<div class="res-err"><i class="fa-solid fa-triangle-exclamation"></i> Enter a GitHub username first.</div>';proc("Ready.");return;}
  var restore=busify(this);lastUser=u;
  apiGet("/api/stalk/github?username="+encodeURIComponent(u),function(d){
    var user=d.username||u;
    var name=d.name||user;
    var avatar=d.avatar||"";
    var bio=d.bio||"";
    var followers=(d.followers!=null)?d.followers:0;
    var following=(d.following!=null)?d.following:0;
    var repos=(d.repos!=null)?d.repos:(d.publicRepos||0);
    var gists=(d.gists!=null)?d.gists:0;
    var joined="";
    if(d.created_at){var dt=new Date(d.created_at);if(!isNaN(dt))joined=dt.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});}
    var extras=[];
    if(d.company)extras.push('<i class="fa-solid fa-building"></i> '+esc(d.company));
    if(d.location)extras.push('<i class="fa-solid fa-location-dot"></i> '+esc(d.location));
    if(d.website)extras.push('<i class="fa-solid fa-globe"></i> '+esc(d.website));
    $("results").innerHTML=
      '<div class="gh-head">'+
      (avatar?'<img class="gh-avatar" src="'+esc(avatar)+'" alt="'+esc(user)+' avatar" loading="lazy">':'')+
      '<div><div class="gh-name">'+esc(name)+'</div><div class="gh-login">@'+esc(user)+"</div>"+
      (bio?'<div class="gh-bio">'+esc(bio)+"</div>":"")+"</div></div>"+
      '<div class="gh-grid">'+
      '<div class="gh-stat"><b>'+esc(followers)+'</b><span>Followers</span></div>'+
      '<div class="gh-stat"><b>'+esc(following)+'</b><span>Following</span></div>'+
      '<div class="gh-stat"><b>'+esc(repos)+'</b><span>Public repos</span></div>'+
      '<div class="gh-stat"><b>'+esc(gists)+'</b><span>Gists</span></div>'+
      "</div>"+
      (joined||extras.length?'<div class="meme-meta" style="margin-top:12px">'+(joined?'<span><i class="fa-solid fa-calendar"></i>Joined '+esc(joined)+"</span>":"")+extras.map(function(x){return "<span>"+x+"</span>";}).join("")+"</div>":"")+
      '<div class="actions" style="justify-content:center;margin-top:14px">'+
      '<a class="rt-btn" href="'+esc(d.profile_url||("https://github.com/"+user))+'" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>Visit GitHub</a>'+
      '<button class="rt-btn" type="button" onclick="ap.go()"><i class="fa-solid fa-rotate"></i>Look up again</button>'+
      "</div>";restore();},restore);
});
window.ap.go=function(){runBtn.click();};