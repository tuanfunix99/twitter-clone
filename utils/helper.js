const moment = require("moment");

exports.getAmountNofication = (amount) => {
  if (amount > 99) {
    return 99 + "+";
  } else {
    return amount;
  }
};

exports.getNoficationContent = (input) => {
  const { _id, content, createdBy, nofPost, seen, createdAt } = input;
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
