$(document).ready(function () {
  const socket = io();
  const btnpost = $("#postButton");
  const btnfollow = $(".followButton");
  const btnupload = $("#uploadButton");
  const textarea = $("#postTextarea");
  const postContainer = $("#postContainer");
  const spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Tweet...`;
  let value = "";

  const card = `<div id="card">
  <div class="description">
    <div class="line line-1"></div>
    <div class="line line-2"></div>
    <div class="line line-3"></div>
  </div>
</div>
`;

  socket.on("follow", (posts) => {
    console.log(posts);
    for (let post of posts) {
      const newPost = createPost(post);
      postContainer.prepend(newPost);
    }
    document.getElementById("postContainer").removeChild(document.getElementById('card'));
    btnfollow.prop("disabled", false);
  });

  socket.on("unfollow", (posts) => {
    console.log(posts);
    for (let child of postContainer.children()) {
      if (posts.includes(child.getAttribute("data-postid"))) {
        const ele = document.querySelector([
          `[data-postid='${child.getAttribute("data-postid")}']`,
        ]);
        document.getElementById("postContainer").removeChild(ele);
      }
    }
    document.getElementById("postContainer").removeChild(document.getElementById('card')); 
    btnfollow.prop("disabled", false); 
  });

  socket.on("respone", (postData) => {
    btnpost.remove(".spinner-border");
    btnpost.text("Tweet");
    btnpost.prop("disabled", true);
    textarea.val("");
    const newPost = createPost(postData);
    postContainer.prepend(newPost);
  });

  $(window).scroll(function () {
    const top = $(window).scrollTop();
    if (top > 16) {
      $(".titleContainer").css("background", "#ffffffd9");
    } else {
      $(".titleContainer").css("background", "#ffffffff");
    }
  });

  btnupload.click(function(e) {
    $('.uploadContainer').addClass('show');
    $('body').addClass('scroll-none')
  })

  $('.uploadContainer').click(function (e){
    $('.uploadContainer').removeClass('show');
    $('body').removeClass('scroll-none')
  })

  
  btnfollow.click(function (e) {
    e.preventDefault();
    btnfollow.prop("disabled", true);
    postContainer.prepend(card);
    const username = $(this).attr("data-name");
    $.post("/api/follow", { username });
    const text = $(this).text().trim();
    text === "Follow" ? $(this).text("Following") : $(this).text("Follow");
    text === "Follow"
      ? $(this).prop("title", "Unfollow")
      : $(this).prop("title", "Follow");
  });

  $(textarea).keyup(function (e) {
    value = $(e.target).val();
    if (value.trim().length > 0) {
      btnpost.prop("disabled", false);
      return;
    }
    btnpost.prop("disabled", true);
  });

  btnpost.click(function (e) {
    e.preventDefault();
    socket.emit("mess", "hello");
    btnpost.text("");
    btnpost.append(spinner);
    btnpost.prop("disabled", true);
    const data = {
      content: value,
    };
    $.post("/api/post", data);
  });
});

function createPost(post) {
  const { postedBy, content, createdAt, _id } = post;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const time = moment(new Date(createdAt)).fromNow();
  return `<div class='post p-2' data-postId=${_id}>
  <div class='mainContentContainer'>
      <div class='userImageContainer'>
          <img  class="rounded-circle"
          alt="profile picture"
          width="40"
          height="40" src='${postedBy.avatar}'>
      </div>
      <div class='postContentContainer mx-2'>
          <div class='header'>
              <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
              <span class='username'>@${postedBy.username}</span> | 
              <span class='date'>${time}</span>
          </div>
          <div class='postBody'>
              <span>${content}</span>
          </div>
          <div class='postFooter'>
              <div class='postButtonContainer'>
                  <button>
                      <i class='far fa-comment'></i>
                  </button>
              </div>
              <div class='postButtonContainer'>
                  <button>
                      <i class='fas fa-retweet'></i>
                  </button>
              </div>
              <div class='postButtonContainer'>
                  <button>
                      <i class='far fa-heart'></i>
                  </button>
              </div>
          </div>
      </div>
  </div>
</div>`;
}
