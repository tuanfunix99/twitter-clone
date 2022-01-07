const createToast = (input) => {
  const { title, text, type, icon, timeout, link, noficationId } = input;
  VanillaToasts.create({
    title: title,
    text: text,
    type: type,
    icon: getAvatar(icon),
    timeout: timeout,
    positionClass: "bottomRight",
    link: link,
    noficationId: noficationId,
  });
};

const sendNewNofication = (nof) => {
  const { firstName, lastName, username, avatar } = nof.createdBy;
  const displayName = `${firstName} ${lastName}`;
  const linkPost = `/view-post/${nof.nofPost.postedBy.username}/${nof.nofPost._id}`;
  switch (nof.content) {
    case "CREATE_NEW_POST":
      createToast({
        noficationId: nof._id,
        title: `Nofication from ${displayName}`,
        text: `@${username} just upload a new post`,
        type: "info",
        icon: avatar,
        timeout: 8000,
        link: linkPost,
      });
      break;
    case "UPLOAD_NEW_AVATAR":
      createToast({
        noficationId: nof._id,
        title: `Nofication from ${displayName}`,
        text: `@${username} just upload a new avatar`,
        type: "info",
        icon: avatar,
        timeout: 8000,
        link: linkPost,
      });
      break;
    case "UPLOAD_NEW_BACKGROUND":
      createToast({
        noficationId: nof._id,
        title: `Nofication from ${displayName}`,
        text: `@${username} just upload a new background`,
        type: "info",
        icon: avatar,
        timeout: 8000,
        link: linkPost,
      });
      break;
    case "LIKE_POST":
      createToast({
        noficationId: nof._id,
        title: `Nofication from ${displayName}`,
        text: `@${username} liked your post`,
        type: "info",
        icon: avatar,
        timeout: 8000,
        link: linkPost,
      });
      break;
    default:
      return null;
  }
};

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
  const { _id, content, createdBy, nofPost, createdAt, seen } = input;
  const displayName = createdBy.firstName + " " + createdBy.lastName;
  const linkUser = `/user-page/${createdBy.username}`;
  const linkPost = `/view-post/${nofPost.postedBy.username}/${nofPost._id}`;
  const time = moment(new Date(createdAt)).fromNow();
  switch (content) {
    case "CREATE_NEW_POST":
      return {
        _id,
        content: `
        <p>
       ${displayName} uploaded new post.
        </p>
        `,
        displayName,
        linkUser,
        linkPost,
        time,
        createdBy,
        seen,
      };
    case "UPLOAD_NEW_AVATAR":
      return {
        _id,
        content: `
          <p>${displayName} uploaded new avatar.</p>
          `,
        displayName,
        linkUser,
        linkPost,
        time,
        createdBy,
        seen,
      };
    case "UPLOAD_NEW_BACKGROUND":
      return {
        _id,
        content: `
        <p>${displayName} uploaded new background.</p>
        `,
        displayName,
        linkUser,
        linkPost,
        time,
        createdBy,
        seen,
      };
    case "LIKE_POST":
      return {
        _id,
        content: `
          <p>${displayName} liked your post.</p>
          `,
        displayName,
        linkUser,
        linkPost,
        time,
        createdBy,
        seen,
      };
    default:
      return null;
  }
};

const displaySeen = (seen) => {
  if (seen) return `<span class="seen">seen</span>`;
  else return `<span class="not-seen">not seen</span>`;
};

function createNofication(nofication) {
  return $(` <li class="noficationContent" data-nof-id="${nofication._id}"
  data-link-post="${nofication.linkPost}">
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
  const link = `/user-page/${postedBy.username}`;
  const urlImage = getAvatar(postedBy.avatar);

  return $(`<div class='post p-2' 
  data-post-username=${postedBy.username}
  data-post-id=${post._id}
  >
  <div class='mainContentContainer'>
      <div class='postContentContainer mx-2'>
          <div class="header">
          <div class="userImageContainer">
          <a href=${link}>
            <img
              data-avatar="${"img" + postedBy._id + "png"}"
              class="rounded-circle"
              alt="avatar"
              width="40"
              height="40"
              src="${urlImage}"
            />
            </a>
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
          <div class="postFooter">
          <div class="postButtonContainer p-1">
            <div class="commentContainer">
              <button>
                <i class="far fa-comment"></i>
              </button>
            </div>
          </div>
          <div class="postButtonContainer p-1">
            <div class="retweetContainer">
              <button>
                <i class="fas fa-retweet"></i>
              </button>  
            </div>
          </div>
          <div class="postButtonContainer p-1">
            <div class="likeContainer">
              <button>
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
  </div>
</div>`);
}
