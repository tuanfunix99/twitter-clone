$(document).ready(function () {
  const searchUser = $("#search-user");
  const resultList = $("#resultList");

  const notFound =
    '<li class="not-found">No results for people or keywords</li>';

  const loadResult = ({ _id, avatar, firstName, lastName, username }) => {
    const link = `/user-profile/${username}`;
    const displayName = `${firstName} ${lastName}`;
    return `<li class="resultUser">
      <div class="resultUserContainer">
          <div class='resultUserImage'>
              <img  
              data-avatar="${"img" + _id + "png"}"
              class="rounded-circle"
              alt="avatar"
              width="45"
              height="45" 
              src=${avatar}>
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

  $(".searchFormContainer").click(function () {
    $(".searchResult").toggleClass("visible");
  });

  searchUser.keyup(function (e) {
    $(".searchResult").addClass("visible");
    resultList.children("#not").remove();
    $.post("/api/search-user", { value: e.target.value }, function (results) {
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
      }
    });
  });

  searchUser.keydown(function (e) {
    resultList.children(".resultUser").remove();
    resultList.children(".not-found").remove();
  });
});
