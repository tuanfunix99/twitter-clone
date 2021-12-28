$(document).ready(function () {
  const socket = io();
  const postContainer = $(`[data-parent-profile='main']`)
    .children()
    .next()
    .last();
  const btnpost = $("#postButton");
  const textarea = $("#postTextarea");
  const btnDelete = $(".btnDeleteFunction");
  const deletePostAction = $("#delete-post-action");
  const deletePostCancel = $("#delete-post-cancel");
  let deleteId = "";

  socket.on("post", (postData) => {
    btnpost.remove(".spinner-border");
    btnpost.text("Tweet");
    btnpost.prop("disabled", true);
    textarea.val("");
    const newPost = createPost(postData);
    postContainer.prepend(newPost);
    window.location.reload();
  });

  socket.on("deleted-post", ({ postId }) => {
    const eles = document.querySelectorAll([`[data-post-id='${postId}']`]);
    for (let ele of eles) {
      ele.remove();
    }
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
      content: value,
    };
    $.post("/api/post/post", data);
  });

  btnDelete.click(function (e) {
    deleteId = $(this).attr("data-delete-id");
  });

  deletePostAction.click(function (e) {
    deletePostAction.text("");
    deletePostAction.append(spinner("Deleting..."));
    deletePostAction.prop("disabled", true);
    deletePostCancel.prop("disabled", true);
    $.post("/api/post/delete", { postId: deleteId }, function (data) {
      if (data.deleted) {
        $(".modal.fade").removeClass("show");
        $(".modal.fade").attr("aria-hidden", "true");
        $(".modal.fade").removeAttr("aria-modal");
        $("body").removeClass("modal-open");
        $(".modal-backdrop.fade.show").remove();
        deletePostAction.remove(".spinner-border");
        deletePostAction.text("Delete");
        deletePostAction.prop("disabled", false);
        deletePostCancel.prop("disabled", false);
      }
    });
  });

  deletePostCancel.click(function (e) {
    deleteId = "";
  });
});
