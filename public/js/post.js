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
  const dataUser = $("html").attr("data-user");

  const picker = new EmojiButton({
    position: "bottom",
  });

  socket.on("like", function ({ postId, userId }) {
    if (dataUser != userId) {
      const amountLike = $(`[data-post-id='${postId}']:first`).find(
        ".amountLike"
      );
      const likeContainer = $(`[data-post-id='${postId}']:first`).find(
        ".likeContainer"
      );
      let amount = parseInt(amountLike.text().toString().trim());
      amountLike.remove();
      if (amount) {
        likeContainer.append(`<div class="amountLike">${amount + 1}</div>`);
      } else {
        likeContainer.append(`<div class="amountLike">1</div>`);
      }
    }
  });

  socket.on("unlike", function ({ postId, userId }) {
    if (dataUser != userId) {
      const amountLike = $(`[data-post-id='${postId}']:first`).find(
        ".amountLike"
      );
      const likeContainer = $(`[data-post-id='${postId}']:first`).find(
        ".likeContainer"
      );
      let amount = parseInt(amountLike.text().toString().trim());
      amountLike.remove();
      amount -= 1;
      if (amount !== 0) {
        likeContainer.append(`<div class="amountLike">${amount}</div>`);
      }
    }
  });

  socket.on("post", (postData) => {
    btnpost.remove(".spinner-border");
    btnpost.text("Tweet");
    btnpost.prop("disabled", true);
    textarea.val("");
    const newPost = createPost(postData);
    postContainer.prepend(newPost);
  });

  socket.on("deleted-post", ({ postId }) => {
    const eles = document.querySelectorAll([`[data-post-id='${postId}']`]);
    if (eles && eles.length > 0) {
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

  $("#postContainer").on("click", ".likeContainer", function (e) {
    const liked = $(this).hasClass("liked");
    let amount = parseInt($(this).children(".amountLike").text());
    if (!liked) {
      $(this).addClass("liked");
      $(this).children("button").remove();
      $(this).prepend(`<button><i class="fas fa-heart"></i></button>`);
      if (!amount) {
        $(this).append(`<div class="amountLike">1</div>`);
      } else {
        amount += 1;
        $(this).children(".amountLike").text(amount);
      }
    } else {
      $(this).removeClass("liked");
      $(this).children("button").remove();
      $(this).prepend(`<button><i class="far fa-heart"></i></button>`);
      amount -= 1;
      if (amount === 0) {
        $(this).children(".amountLike").remove();
      } else {
        $(this).children(".amountLike").text(amount);
      }
    }
    const postId = $(this).parents(".post").attr("data-post-id");
    $.post("/api/post/like", { postId });
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
