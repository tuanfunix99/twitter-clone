$(function () {
  const socket = io();
  const btnFollow = $(".btnFollowProfile");
  
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

  socket.on("upload-new-image", (postData) => {
    updateNewPost(postData);
  });

  socket.on("deleted-post", ({ username }) => {
    const tweets = parseInt($(`p[data-tweets='${username}']`).text().split(" ")[0]);
    $(`p[data-tweets='${username}']`).text(`${tweets - 1} Tweets`);
  });

  btnFollow.on('click', function () {
      e.preventDefault();
      const btnThis = $(this);
      btnFollow.prop("disabled", true);
      const username = btnThis.attr("data-follow-username");
      const isFollowing = btnThis.attr("data-following");
      isFollowing === "true" ? btnFollow.text("Follow") : btnFollow.text("Following");
      $.post("/api/user/follow", { username, main: false }, function (result) {
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

  $(window).on('scroll', function(){
    if($(window).scrollTop() >= 390){
      $('.formUserProfile').addClass('show');
    }
    else{
      $('.formUserProfile').removeClass('show');
    }
  })
});