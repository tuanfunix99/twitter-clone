$(document).ready(function () {
  const searchUser = $("#search-user");
  const resultList = $("#resultList");
  let users = [];

  const notFound =
    '<li class="not-found">No results for people or keywords</li>';

  const loadResult = ({ _id, avatar, firstName, lastName, username }) => {
    const link = `/user-profile/${username}`;
    const displayName = `${firstName} ${lastName}`;
    const urlImage = getAvatar(avatar);
    const urlProfile = `/user-profile/${username}`;
    return `<li class="resultUser">
      <div class="resultUserContainer">
          <div class='resultUserImage'>
             <a href="${urlProfile}">
              <img  
              data-avatar="${"img" + _id + "png"}"
              class="rounded-circle"
              alt="avatar"
              width="45"
              height="45" 
              src=${urlImage}
              title=${username}
              >
              </a>
          </div>
          <div class="resultContent">
              <a href=${link}>${displayName}</a>
              <span class='username'>@${username}</span>
          </div>
      </div>                               
  </li>`;
  };

  if (resultList.children().length === 0) {
    resultList.prepend(
      '<li id="not">Try searching for people or keywords</li>'
    );
  }

  $(".searchFormContainer").click(function (){
    $(".searchResult").addClass("visible");
    if (users.length <= 0) {
      $.post("/api/user/search-user", function (results) {
        users = results;
      });
    }
  });

  $('.mainSectionContainer').click(function () {
    $(".searchResult").removeClass("visible");
  })

  $('.third-col').click(function () {
    $(".searchResult").removeClass("visible");
  })


  searchUser.keyup(function (e) {
    $(".searchResult").addClass("visible");
    resultList.children("#not").remove();
    const value = $(e.target).val().toLowerCase().trim();
    let results = [];
    const userClone = [...users];
    if(value.length > 0){
      results = userClone.filter(
        (user) =>
          user.username.includes(value) ||
          user.firstName.includes(value) ||
          user.lastName.includes(value)
      );
    }
    if (results.length > 0) {
      resultList.children(".resultUser").remove();
      resultList.children(".not-found").remove();
      for (let result of results) {
        const content = loadResult(result);
        resultList.prepend(content);
      }
    } else {
      resultList.children(".resultUser").remove();
      resultList.children(".not-found").remove();
      resultList.prepend(notFound);
    };
  });

  searchUser.keydown(function (e) {
    resultList.children(".resultUser").remove();
    resultList.children(".not-found").remove();
  });
});
