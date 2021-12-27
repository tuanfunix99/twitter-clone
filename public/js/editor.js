$(document).ready(function () {
  $(".summernote").summernote({ focus: true });
  const socket = io();
  const btnEdit = $("#editButton");
  const btnEditCancel = $("#btn-edit-cancel");
  const btnSaveEdit = $("#btn-save-edit");
  const postContainer = $("#postContainer");

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