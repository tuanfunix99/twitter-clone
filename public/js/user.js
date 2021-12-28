$(document).ready(function () {
  const socket = io();
  const btnFollow = $(".btnFollowProfile");

  $(".backButtonContainer a").attr("href", document.referrer);

  const updateNewPost = function(post) {
    const postContainer = $(`[data-parent-profile='${post.postedBy.username}']`)
    .children().next().last();
    const tweets = parseInt($(`p[data-tweets='${post.postedBy.username}']`).text().split(" ")[0]);
    $(`p[data-tweets='${post.postedBy.username}']`).text(`${tweets + 1} Tweets`);
    const newPost = createPost(post); 
    postContainer.prepend(newPost);
  }

  socket.on("edit", (postData) => {
    updateNewPost(postData);
  });

  socket.on("post", (postData) => {
    updateNewPost(postData);
  });

  btnFollow.click(function (e) {
      e.preventDefault();
      const btnThis = $(this);
      btnFollow.prop("disabled", true);
      const username = btnThis.attr("data-follow-username");
      const isFollowing = btnThis.attr("data-following");
      isFollowing === "true" ? btnFollow.text("Follow") : btnFollow.text("Following");
      $.post("/api/follow", { username, main: false }, function (result) {
        const { follow } = result;
        if (follow) {
          btnFollow.attr("data-following", true);
          btnFollow.prop("disabled", false);
        } else {
          btnFollow.attr("data-following", false);
          btnFollow.prop("disabled", false);
        }
      });
  })

  $(window).scroll(function(){
    if($(window).scrollTop() >= 390){
      $('.formUserProfile').addClass('show');
    }
    else{
      $('.formUserProfile').removeClass('show');
    }
  })
});