$(document).ready(function () {
  const socket = io();

  socket.on('created-nofication', function ({ nof }){
    console.log('recive');
    const noficationTemplate = getNoficationContent(nof);
    console.log(noficationTemplate)
    const newNof = createNofication(noficationTemplate); 
    console.log(newNof)
    console.log(nof.reciver);
    const ul = $(`[data-nofication-list-id='${nof.reciver}']`);
    if(ul){
        ul.prepend(newNof);
    }
  });


  $('#noficationList').on('click', '.buttonSeenNofication', function (e) {
    const noficationId = $(this).attr('data-button-seen-nofication');
    const userId = $('#noficationList').attr('data-nofication-list-id');
    $.post('/api/nofication/seen', ({ _id: noficationId, userId: userId }));
  })
});