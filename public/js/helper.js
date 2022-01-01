const getAvatar = (avatar) => {
  if (avatar != "/images/profilePic.jpeg") {
    return `/api/user/user-images/${avatar}`;
  }
  return avatar;
};

const getBackground = (background) => {
  if (background != "/images/background_default.png") {
    return `/api/user/user-images/${background}`;
  }
  return background;
};

const getAmountNofication = (amount) => {
  if (amount > 99) {
    return 99 + "+";
  } else {
    return amount;
  }
};

const spinner = (mess) => {
  return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>${mess}`;
};

$(".backButtonContainer").click(function (e) {
  window.history.go(-1);
});

const showUpdateFunction = (isUpload, postId) => {
  if (!isUpload) {
    return `<button class="btnUpdateFunction" title="Update" data-update-id=${postId}>
      <i class="fas fa-pen-square"></i>
    </button>`;
  } else {
    return ``;
  }
};

function showUserFunction(isUser, postId, isUpload) {
  if (isUser && isUser === "true") {
    return `
    <div class="userFunction">
    ${showUpdateFunction(isUpload, postId)}
    <button class="btnDeleteFunction" 
    title="Delete" data-toggle="modal" 
    data-target="#deleteModal"
    data-delete-id="${postId}">
      <i class="fas fa-trash"></i>
    </button>
  </div>
    `;
  } else {
    return "";
  }
}

const getNoficationContent = (input) => {
  const { content, createdBy, postId, createdAt } = input;
  const displayName = createdBy.firstName + " " + createdBy.lastName;
  const linkUser = `/user-profile/${createdBy.username}`;
  const linkPost = `/view-post/${createdBy.username}/${postId}`;
  const time = moment(new Date(createdAt)).fromNow();
  switch (content) {
    case "CREATE_NEW_POST":
      return {
        content: `
        <p><a href=${linkUser}>${displayName}</a> just upload new post.Let's <a href=${linkPost}>visit it</a></p>
        `,
        displayName,
        linkUser,
        linkPost,
        time,
        createdBy,
      };
    case "UPLOAD_NEW_AVATAR":
      return {
        content: `
          <p><a href=${linkUser}>${displayName}</a> just upload new avatar.Let's <a href=${linkPost}>visit it</a></p>
          `,
        displayName,
        linkUser,
        linkPost,
        time,
        createdBy,
      };
    case "UPLOAD_NEW_BACKGROUND":
      return {
        content: `
        <p><a href=${linkUser}>${displayName}</a> just upload new background.Let's <a href=${linkPost}>visit it</a></p>
        `,
        displayName,
        linkUser,
        linkPost,
        time,
        createdBy,
      };
    default:
      return null;
  }
};

const displaySeen = (seen) => {
  if (seen) return `<span>seen</span>`;
  else return `<span>not seen</span>`;
};

function createNofication(nofication) {
  return $(` <li class="noficationContent">
  <div class="noficationContentHeader">
    <div class="noficationContentHeaderContainer">
      <div class="userImageContainer">
        <a href="${nofication.linkUser}">
          <img
            data-avatar="${"img" + nofication.createdBy._id + "png"}"
            class="rounded-circle"
            alt="avatar"
            width="40"
            height="40"
            src="${getAvatar(nofication.createdBy.avatar)}"
            title="${nofication.createdBy.username}"
          />
        </a>
      </div>
      <div class="userInfo">
        <a href="${nofication.linkUser}" class="displayName"
          >${nofication.displayName}</a
        >
        <span class="username"
          >@${nofication.createdBy.username}</span
        >
        |
        <span class="date">${nofication.time} </span>
        ${displaySeen(nofication.seen)}
      </div>
    </div>
    <button class="btnDeleteFunction" title="Delete">
      <i class="fas fa-trash"></i>
    </button>
  </div>
  <div class="content">${nofication.content}</div>
</li>`);
}

function createPost(post) {
  const isUser = $("body").attr("data-authenticate-user");
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
            <span class="view"><a
            href="${`/view-post/${postedBy.username}/${post._id}`}">View Post</a></span> |
            <span class="date">${time}</span>
          </div>
          ${showUserFunction(isUser, post._id, post.isUpload)}
        </div>
          <div class='postBody'>
              <span data-post-span-id=${post._id}>${content}</span>
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
