$(function () {
  const socket = io();

  socket.on('created-nofication', function ({ nof }){
    const noficationTemplate = getNoficationContent(nof);
    const newNof = createNofication(noficationTemplate); 
    const ul = $(`[data-nofication-list-id='${nof.reciver}']`);
    if(ul){
        ul.prepend(newNof);
    }
  });

  $('#noficationList').on('click', '.noficationContent', function (){
    const noficationId = $(this).attr('data-nof-id');
    const linkPost = $(this).attr('data-link-post');
    window.location.href = linkPost;
    $.post('/api/nofication/seen', ({ _id: noficationId }));
  })
});