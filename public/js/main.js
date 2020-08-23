const socket = io();

const chatForm = document.getElementById("chat-form");
const chatMessages=document.querySelector('.chat-messages');
let usersList=document.querySelector('#users');
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});


//join chatroom
socket.emit('joinRoom',{username,room});

chatForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const msgs = event.target.elements.msg.value;

  //emit message to server
  socket.emit("chatMessage", msgs);
  event.target.elements.msg.value = "";
});

socket.on("message", function (data) {
    let span=document.createElement('span');
    span.style.display=`block`;
    span.innerHTML=`${data.username} says:${data.text} @<small>${data.createdAt}</small>`;
    chatMessages.appendChild(span);
});

socket.on('roomUsers',function({room,users}){
    outputRoomName(room);
    outputUsers(users);
})

socket.on('chatMessage',function(data){
    outputMessage(data);
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

function outputMessage(data) {
  let div = document.createElement("div");
  div.setAttribute("class", "message");
  div.innerHTML = `<p class="meta">${data.username}<span>${data.createdAt}</span></p>
    <p class="text">
       ${data.text}
    </p>`;
  chatMessages.appendChild(div);
}


function outputRoomName(room){
    document.getElementById('room-name').textContent=room;
}

function outputUsers(users){
   usersList.innerHTML=`${users.map(activeUser=>`<li>${activeUser.username}</li>`).join('')}`
}
