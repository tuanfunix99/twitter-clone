getAvatar = (avatar) => {
  if (avatar != "/images/profilePic.jpeg") {
    return `/api/user-images/${avatar}`;
  }
  return avatar;
};

getBackground = (background) => {
  if (background != "/images/background_default.png") {
    return `/api/user-images/${background}`;
  }
  return background;
};
