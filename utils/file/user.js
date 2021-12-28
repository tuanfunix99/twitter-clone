exports.getAvatar = (avatar) => {
  if (avatar != "/images/profilePic.jpeg") {
    return `/api/user/user-images/${avatar}`;
  }
  return avatar;
};

exports.getBackground = (background) => {
  if (background != "/images/background_default.png") {
    return `/api/user/user-images/${background}`;
  }
  return background;
};
