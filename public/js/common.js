let cropper;
let value = "";
let upload = null;
let uploadTitle = "";

$(document).ready(function () {
  const socket = io();
  const btnfollow = $(".followButton");
  const btnupload = $(".uploadButton");
  const btnuploadcancel = $("#btn-upload-cancel");
  const btnsubmitupload = $("#btn-submit-upload");
  const inputUpload = $("#input-upload");
  const editButton = $("#editButton");
  const imagePreview = document.getElementById("imagePreview");
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
    btnsubmitupload.remove(".spinner-border");
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
        ele.src = `/api/user/user-images/${avatar}`;
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
        ele.src = `/api/user/user-images/${background}`;
      }
    }
    uploadSuccess();
  });

  $(window).scroll(function () {
    const top = $(window).scrollTop();
    if (top > 16) {
      $(".titleContainer").css("background", "#ffffffd9");
    } else {
      $(".titleContainer").css("background", "#ffffffff");
    }
  });

  editButton.click(function (e) {
    e.preventDefault();
  })

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
      btnsubmitupload.remove(".spinner-border");
      return;
    }
    const data = new FormData();
    if (uploadTitle === "background") {
      data.append("background", upload);
      $.ajax({
        type: "POST",
        url: "/api/user/upload-background",
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
          url: "/api/user/upload-avatar",
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
    $("#uploadTop").css("top", $(window).scrollTop())
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
    const btnThis = $(this);
    btnfollow.prop("disabled", true);
    postContainer.prepend(card);
    const username = btnThis.attr("data-follow-username");
    const isFollowing = btnThis.attr("data-following");
    isFollowing === "true" ? btnThis.text("Follow") : btnThis.text("Following");
    $.post("/api/user/follow", { username, main: true }, function (result) {
      const { posts, follow } = result;
      if (follow) {
        for (let post of posts) {
          const newPost = createPost(post);
          postContainer.prepend(newPost);
        }
        document
          .getElementById("postContainer")
          .removeChild(document.getElementById("card"));
        btnThis.attr("data-following", true);  
        btnfollow.prop("disabled", false);
      } else {
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
        btnThis.attr("data-following", false);  
        btnfollow.prop("disabled", false);
      }
    });
  });
});
