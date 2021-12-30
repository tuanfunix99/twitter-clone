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
});