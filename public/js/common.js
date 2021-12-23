$(document).ready(function () {
  const socket = io();
  const btnpost = $("#postButton");
  const btnfollow = $(".followButton");
  const textarea = $("#postTextarea");
  const postContainer = $("#postContainer");
  const spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Tweet...`;
  let value = "";

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

  btnfollow.click(function (e) {
    e.preventDefault();
    const username = $(this).attr("data-name");
    $.post("/api/follow", { username });
    const text = $(this).text().trim();
    text === "Follow" ? $(this).text("Following") : $(this).text("Follow");
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
  const { postedBy, content, createdAt } = post;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const time = moment(new Date(createdAt)).fromNow();
  return `<div class='post p-2'>
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
