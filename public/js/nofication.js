$(document).ready(function () {
  const socket = io();  
  socket.on('created-nofication', function ({ nof }){
    const noficationTemplate = getNoficationContent(nof);
    const newNof = createNofication(noficationTemplate); 
    const ul = $(`[data-nofication-list-id='${nof.createdBy._id}']`);
    if(ul){
        ul.prepend(newNof);
    }
    $("#noficationList").load(location.href + " #noficationList");
  });

  $('#noficationList').on('click', '.buttonSeenNofication', function (e) {
    const noficationId = $(this).attr('data-button-seen-nofication');
    const userId = $('#noficationList').attr('data-nofication-list-id');
    $.post('/api/nofication/seen', ({ _id: noficationId, userId: userId }));
  })
});