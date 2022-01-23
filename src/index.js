const http = require("http");
const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const {
  generateMessages,
  generateLocationMessage,
} = require("./utils/messages");
const Filter = require("bad-words");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = 3000;

const publicAccess = path.join(__dirname, "../public");

app.use(express.static(publicAccess));

io.on("connection", (socket) => {
  console.log("Welcome to chat app");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    //* Welcome user
    socket.emit(
      "newMessage",
      generateMessages(`Welcome ${user.username}`, "Admin")
    );

    //* Broadcasting when user joins
    socket.broadcast
      .to(user.room)
      .emit(
        "newMessage",
        generateMessages(`${user.username} has joined!`, "Admin")
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  //* listening new messsages
  socket.on("message", (msg, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("profane");
    }
    //* Sharing messages
    io.to(user.room).emit("newMessage", generateMessages(msg, user.username));
    callback();
  });

  //* listening location
  socket.on("location", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "location",
      generateLocationMessage(
        `https://google.com/maps?q=${coords.lat},${coords.lon}`,
        user.username
      )
    );

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "newMessage",
        generateMessages(`${user.username} has left!`, "Admin")
        );
        io.to(user.room).emit("roomData", {
            room: user.room,
            users : getUsersInRoom(user.room)
        })
    }
  });
});

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
