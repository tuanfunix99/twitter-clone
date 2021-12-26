let cropper;
let value = "";
let upload = null;
let uploadTitle = "";

$(document).ready(function () {
  const socket = io();
  const btnpost = $("#postButton");
  const btnfollow = $(".followButton");
  const btnupload = $(".uploadButton");
  const btnuploadcancel = $("#btn-upload-cancel");
  const btnsubmitupload = $("#btn-submit-upload");
  const inputUpload = $("#input-upload");
  const imagePreview = document.getElementById("imagePreview");
  const textarea = $("#postTextarea");
  const postContainer = $("#postContainer");

  const card = `<div id="card">
  <div class="description">
  <div class="line line-1"></div>
  <div class="line line-2"></div>
  <div class="line line-3"></div>
  </div>
  </div>
  `;

  const spinner = (mess) => {
    return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>${mess}`;
  };

  $(".postBody p").children("br").remove();

  const uploadSuccess = function(){
    btnsubmitupload.prop("disabled", false);
    btnuploadcancel.prop("disabled", false);
    btnsubmitupload.text("Upload");
    btnpost.remove(".spinner-border");
    inputUpload.val("");
    $(".imagePreviewContainer").css("display", "none");
    $(".uploadContainer").removeClass("show");
    $("body").removeClass("scroll-none");
  }

  socket.on("upload-avatar", (respone) => {
    const { _id, avatar } = respone;
    const eles = document.querySelectorAll([
      `[data-avatar='img${_id.toString().trim()}png']`,
    ]);
    if (eles && eles.length > 0) {
      for (let ele of eles) {
        ele.src = `/api/user-images/${avatar}`;
      }
    }
    uploadSuccess();
  });

  socket.on("upload-background", (respone) => {
    const { _id, background } = respone;
    const eles = document.querySelectorAll([
      `[data-background='img${_id.toString().trim()}png']`,
    ]);
    if (eles && eles.length > 0) {
      for (let ele of eles) {
        ele.src = `/api/user-images/${background}`;
      }
    }
    uploadSuccess();
  });

  socket.on("post", (postData) => {
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

  btnsubmitupload.click(function (e) {
    e.preventDefault();
    btnsubmitupload.prop("disabled", true);
    btnuploadcancel.prop("disabled", true);
    btnsubmitupload.text("");
    btnsubmitupload.append(spinner("Uploading..."));
    if (!upload) {
      alert("Image empty");
      btnsubmitupload.prop("disabled", false);
      btnuploadcancel.prop("disabled", false);
      btnsubmitupload.text("Upload");
      btnpost.remove(".spinner-border");
      return;
    }
    const data = new FormData();
    if (uploadTitle === "background") {
      data.append("background", upload);
      $.ajax({
        type: "POST",
        url: "/api/upload-background",
        data: data,
        contentType: false,
        processData: false,
      });
    } else if (uploadTitle === "avatar") {
      let canvas = cropper.getCroppedCanvas();
      if (!canvas) {
        alert("Could not upload image.");
        return;
      }
      canvas.toBlob((blob) => {
        data.append("avatar", blob);
        $.ajax({
          type: "POST",
          url: "/api/upload-avatar",
          data: data,
          contentType: false,
          processData: false,
        });
      });
    }
  });

  btnupload.click(function (e) {
    uploadTitle = $(this).val();
    $(".uploadContainer").addClass("show");
    $("body").addClass("scroll-none");
  });

  btnuploadcancel.click(function (e) {
    e.preventDefault();
    $(".uploadContainer").removeClass("show");
    $("body").removeClass("scroll-none");
    inputUpload.val("");
    $(".imagePreviewContainer").css("display", "none");
  });

  inputUpload.change(function (e) {
    const types = ["image/jpeg", "image/jpg", "image/png"];
    upload = e.target.files[0];
    if (!types.includes(upload.type)) {
      alert("File not image");
      inputUpload.val("");
      $(".imagePreviewContainer").css("display", "none");
      return;
    } else if (upload.size > 2000000) {
      alert("File too large, file small 2MB");
      inputUpload.val("");
      $(".imagePreviewContainer").css("display", "none");
      return;
    }
    let reader = new FileReader();
    reader.onload = (e) => {
      $(".imagePreviewContainer").css("display", "block");
      imagePreview.src = e.target.result;
      if (uploadTitle === "avatar") {
        if (cropper !== undefined) {
          cropper.destroy();
        }
        cropper = new Cropper(imagePreview, {
          aspectRatio: 1 / 1,
          background: false,
        });
      }
    };
    reader.readAsDataURL(upload);
  });

  btnfollow.click(function (e) {
    e.preventDefault();
    btnfollow.prop("disabled", true);
    postContainer.prepend(card);
    const username = $(this).attr("data-follow-username");
    const btnThis = $(this);
    $.post("/api/follow", { username }, function (result) {
      const { posts, follow } = result;
      if (follow) {
        btnThis.text("Following");
        for (let post of posts) {
          const newPost = createPost(post);
          postContainer.prepend(newPost);
        }
        document
          .getElementById("postContainer")
          .removeChild(document.getElementById("card"));
        btnfollow.prop("disabled", false);
      } else {
        btnThis.text("Follow")
        const eles = document.querySelectorAll([
          `[data-post-username='${username}']`,
        ]);
        if(eles && eles.length > 0){
          for(let ele of eles){
            ele.remove();
          }
        }
        document
          .getElementById("postContainer")
          .removeChild(document.getElementById("card"));
        btnfollow.prop("disabled", false);
      }
    });
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
    $.post("/api/post", data);
  });
});

function createPost(post) {
  const { postedBy, content, createdAt } = post;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const time = moment(new Date(createdAt)).fromNow();
  const link = `/user-profile/${postedBy.username}`;
  const urlImage = `/api/user-images/${postedBy.avatar}`
  return `<div class='post p-2' data-post-username=${postedBy.username}>
  <div class='mainContentContainer'>
      <div class='postContentContainer mx-2'>
          <div class="header">
          <div class="userImageContainer">
            <img
              data-avatar="${"img" + postedBy._id + "png"}"
              class="rounded-circle"
              alt="avatar"
              width="40"
              height="40"
              src="${urlImage}"
            />
          </div>
          <div class="userInfo">
            <a href=${link} class="displayName">${displayName}</a>
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
