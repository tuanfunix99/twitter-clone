const moment = require("moment");

exports.getAmountNofication = (amount) => {
  if (amount > 99) {
    return 99 + "+";
  } else {
    return amount;
  }
};

exports.getNoficationContent = (input) => {
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
