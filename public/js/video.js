$(document).ready(function () {
  const videos = document.querySelectorAll("iframe");
  if(videos && videos.length > 0){
    for(let video of videos){
      if(video.src.includes("youtube")){
        video.src += "?autoplay=1&mute=1";
      }
      else if(video.src.includes("vimeo")){
        video.src += "?autoplay=1&loop=1&autopause=0";
      }
    }
  }
});