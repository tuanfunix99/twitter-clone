$(document).ready(function () {
  const videos = document.getElementsByClassName("note-video-clip");
  if(videos && videos.length > 0){
    for(let video of videos){
      video.src += "?autoplay=1&mute=1";
    }
  }
});
