$(function () {
  $(".summernote").summernote({ focus: true });
  const socket = io();
  const btnEdit = $("#editButton");
  const btnEditCancel = $("#btn-edit-cancel");
  const btnSaveEdit = $("#btn-save-edit");
  const postContainer = $(`[data-parent-profile='main']`)
    .children()
    .next()
    .last();
  let updateId = "";
  let isUpdate = false;

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

  socket.on("update", (postData) => {
    btnSaveEdit.remove(".spinner-border");
    btnSaveEdit.text("Save");
    btnSaveEdit.prop("disabled", false);
    btnEditCancel.prop("disabled", false);
    $(".editorContainer").removeClass("show");
    $("body").removeClass("scroll-none");
    $(".note-editable").children().remove();
    $(".note-editable").text("");
    const span = $(`[data-post-span-id='${postData._id}']`);
    span.text("");
    span.children().remove();
    span.prepend(postData.content);
    isUpdate = false;
    updateId = "";
  });

  btnEdit.on('click', function (e) {
    $(".summernote").summernote({ focus: true });
    $(".editorContainer").addClass("show");
    $("body").addClass("scroll-none");
    $("#editorTop").css("top", $(window).scrollTop());
    $(".note-editable").children().remove();
  });

  $("#postContainer").on("click", ".btnUpdateFunction", function (e) {
    $(".summernote").summernote({ focus: true });
    $(".editorContainer").addClass("show");
    $("body").addClass("scroll-none");
    $("#editorTop").css("top", $(window).scrollTop());
    $(".note-editable").children().remove();
    $(".note-editable").text("");
    updateId = $(this).attr("data-update-id");
    $.post("/api/post/load", { postId: updateId }, function ({ post }) {
        isUpdate = true;
        $(".note-editable").prepend(post.content);
    });
  });

  btnEditCancel.on('click', function (e) {
    e.preventDefault();
    $(".editorContainer").removeClass("show");
    $("body").removeClass("scroll-none");
    $(".note-editable").children().remove();
    $(".note-editable").text("");
    isUpdate = false;
    updateId = "";
  });

  btnSaveEdit.on('click', function (e) {
    e.preventDefault();
    const content = $(".summernote").summernote("code");
    btnSaveEdit.text("");
    btnSaveEdit.prepend(spinner("Saving..."));
    btnSaveEdit.prop("disabled", true);
    btnEditCancel.prop("disabled", true);
    console.log(isUpdate);
    console.log(updateId);
    if (isUpdate) {
      const data = {
        content: content.toString(),
        postId: updateId,
      };
      $.post("/api/post/update", data);
    } else {
      const data = {
        content: content.toString(),
        edit: true,
      };
      $.post("/api/post/post", data);
    }
  });
});
