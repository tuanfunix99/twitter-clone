$(document).ready(function () {
  const socket = io();
  const postContainer = $(`[data-parent-profile='main']`)
    .children()
    .next()
    .last();
  const btnpost = $("#postButton");
  const textarea = $("#postTextarea");
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
    $("#postContainer").load(window.location.href + " #postContainer");
  });

  socket.on("deleted-post", ({ postId }) => {
    const eles = document.querySelectorAll([`[data-post-id='${postId}']`]);
    for (let ele of eles) {
      ele.remove();
    }
    $("#postContainer").load(location.href + " #postContainer");
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

  $("#postContainer").on("click", '.btnDeleteFunction', function (e){
    console.log($(this));
    deleteId = $(this).attr("data-delete-id");
  })

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
        $('#deleteModal').modal('hide');
      }
    });
  });

  deletePostCancel.click(function (e) {
    deleteId = "";
  });
});
