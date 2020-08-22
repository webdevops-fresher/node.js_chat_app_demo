const express = require("express");
const path = require("path");
const http = require("http");
const socket = require("socket.io");
const formatMessage = require("./utils/messages");
const {userJoin,getCurrentUser,userLeft,getRoomUsers}=require('./utils/users');
const app = express();
const PORT = 4000 || process.env.PORT;
const bot = "ChatBot";

const server = http.createServer(app);
const io = socket(server);

//serve static files
app.use(express.static(path.join(__dirname, "public")));

//runs whenever client runs
io.on("connection", (socket) => {

  socket.on("joinRoom", ({ username, room }) => {
    const user=userJoin(socket.id,username,room);
    socket.join(user.room);
    socket.emit("message", formatMessage(bot, `welcome to chatroom ${user.room}, ${user.username}`)); //to the single client

    //broadcast when a user joins
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(bot, `${user.username} has joined the chat`)
    );
    io.to(user.room).emit('roomUsers',{room:user.room,users:getRoomUsers(user.room)})
  });

  //listen to chatMessage
  socket.on("chatMessage", function (msg) {
    const currentUser=getCurrentUser(socket.id);
    if(currentUser){
        io.to(currentUser.room).emit("chatMessage", formatMessage(`${currentUser.username}`, msg));
    }
  });

  //disconnect
  socket.on("disconnect", function () {
    const currentUser=userLeft(socket.id);
    if(currentUser){
        io.to(currentUser.room).emit("message", formatMessage(bot, `${currentUser.username} has left the chat`));
        io.to(currentUser.room).emit('roomUsers',{room:currentUser.room,users:getRoomUsers(currentUser.room)})
    }
  });
});

server.listen(PORT, () => console.log(`server running on ${PORT}`));
