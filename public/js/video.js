$(document).ready(function () {
  const videos = $("iframe");
  if(videos && videos.length > 0){
    for(let video of videos){
      if(video.src.includes("youtube")){
        video.src += "?autoplay=1&mute=0";
        video.attr("frameborder", 0);
        video.attr("allowfullscreen");
      }
      else if(video.src.includes("vimeo")){
        video.src += "?autoplay=1&loop=1&autopause=0";
      }
    }
  }
});