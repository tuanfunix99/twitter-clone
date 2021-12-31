$(document).ready(function () {
  const socket = io();
  const postContainer = $(`[data-parent-profile='main']`)
    .children()
    .next()
    .last();
  const btnpost = $("#postButton");
  const textarea = $("#postTextarea");
  const text = document.getElementById("postTextarea");
  const deletePostAction = $("#delete-post-action");
  const deletePostCancel = $("#delete-post-cancel");
  const emojiButton = document.getElementById("emojiButton");
  let deleteId = "";

  const picker = new EmojiButton({
    position: "bottom",
  });

  socket.on("post", (postData) => {
    btnpost.remove(".spinner-border");
    btnpost.text("Tweet");
    btnpost.prop("disabled", true);
    textarea.val("");
    const newPost = createPost(postData);
    postContainer.prepend(newPost);
    $(`[data-post-id='${postData._id}']`).load(location.href + " #postContainer");
  });

  socket.on("deleted-post", ({ postId }) => {
    const eles = document.querySelectorAll([`[data-post-id='${postId}']`]);
    if(eles && eles.length > 0) {
      for (let ele of eles) {
        ele.remove();
      }
    }
  });

  if (emojiButton) {
    emojiButton.addEventListener("click", function (e) {
      e.preventDefault();
      picker.togglePicker(emojiButton);
    });
  }

  picker.on("emoji", (emoji) => {
    text.value += emoji;
    btnpost.prop("disabled", false);
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
    btnpost.text("");
    btnpost.append(spinner("Tweet..."));
    btnpost.prop("disabled", true);
    const data = {
      content: text.value,
    };
    $.post("/api/post/post", data);
  });

  $("#postContainer").on("click", ".btnDeleteFunction", function (e) {
    deleteId = $(this).attr("data-delete-id");
  });


  deletePostAction.click(function (e) {
    deletePostAction.text("");
    deletePostAction.append(spinner("Deleting..."));
    deletePostAction.prop("disabled", true);
    deletePostCancel.prop("disabled", true);
    $.post("/api/post/delete", { postId: deleteId }, function (data) {
      if (data.deleted) {
        deletePostAction.remove(".spinner-border");
        deletePostAction.text("Delete");
        deletePostAction.prop("disabled", false);
        deletePostCancel.prop("disabled", false);
        $("#deleteModal").modal("hide");
      }
    });
  });

  deletePostCancel.click(function (e) {
    deleteId = "";
  });
});
