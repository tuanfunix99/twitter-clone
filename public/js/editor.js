$(document).ready(function () {
  $(".summernote").summernote({ focus: true });
  const socket = io();
  const btnEdit = $("#editButton");
  const btnEditCancel = $("#btn-edit-cancel");
  const btnSaveEdit = $("#btn-save-edit");
  const postContainer = $("#postContainer");

  const spinner = (mess) => {
    return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>${mess}`;
  };

  socket.on("edit", (postData) => {
    btnSaveEdit.remove(".spinner-border");
    btnSaveEdit.text("Save");
    btnSaveEdit.prop("disabled", false);
    btnEditCancel.prop("disabled", false);
    $(".editorContainer").removeClass("show");
    $("body").removeClass("scroll-none");
    const newPost = createPost(postData);
    postContainer.prepend(newPost);
  });

  btnEdit.click(function (e) {
    $(".editorContainer").addClass("show");
    $("body").addClass("scroll-none");
  });

  btnEditCancel.click(function (e) {
    e.preventDefault();
    $(".editorContainer").removeClass("show");
    $("body").removeClass("scroll-none");
  });

  btnSaveEdit.click(function (e) {
    e.preventDefault();
    const content = $(".summernote").summernote("code");
    btnSaveEdit.text("");
    btnSaveEdit.prepend(spinner("Saving..."));
    btnSaveEdit.prop("disabled", true);
    btnEditCancel.prop("disabled", true);
    const data = {
      content: content.toString(),
      edit: true,
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
      <div class='postContentContainer mx-2'>
          <div class="header">
          <div class="userImageContainer">
            <img
              data-image="${"img" + postedBy._id + "png"}"
              class="rounded-circle"
              alt="avatar"
              width="40"
              height="40"
              src="${postedBy.avatar}"
            />
          </div>
          <div class="userInfo">
            <a href="#" class="displayName">${displayName}</a>
            <span class="username">@${postedBy.username}</span> |
            <span class="date">${time}</span>
          </div>
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
