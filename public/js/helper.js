getAvatar = (avatar) => {
  if (avatar != "/images/profilePic.jpeg") {
    return `/api/user/user-images/${avatar}`;
  }
  return avatar;
};

getBackground = (background) => {
  if (background != "/images/background_default.png") {
    return `/api/user/user-images/${background}`;
  }
  return background;
};

const spinner = (mess) => {
  return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>${mess}`;
};

function showUserFunction(isUser, postId){
  if(isUser.length > 0 && isUser === 'true'){
    return `
    <div class="userFunction">
    <button class="btnUpdateFunction" title="Update">
      <i class="fas fa-pen-square"></i>
    </button>
    <button class="btnDeleteFunction" 
    title="Delete" data-toggle="modal" 
    data-target="#deleteModal"
    data-delete-id="${postId}">
      <i class="fas fa-trash"></i>
    </button>
  </div>
    `
  }
  else{
    return '';
  }
}

function createPost(post) {
  const isUser = $("body").attr("data-authenticate-user").trim();
  const { postedBy, content, createdAt } = post;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const time = moment(new Date(createdAt)).fromNow();
  const link = `/user-profile/${postedBy.username}`;
  const urlImage = getAvatar(postedBy.avatar);

  return $(`<div class='post p-2' 
  data-post-username=${postedBy.username}
  data-post-id=${post._id}
  >
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
          ${ showUserFunction(isUser, post._id) }
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
</div>`);
}

