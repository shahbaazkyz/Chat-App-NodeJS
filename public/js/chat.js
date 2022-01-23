const socket = io();

//* Elements
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message");
const btn = document.querySelector("#btn");
const locationBtn = document.querySelector("#loc");
const messageContainer = document.querySelector("#message-container");
const sidebarForUsers = document.querySelector("#sidebarForUsers");

//* Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//* Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //* New message element
  const newMessage = messageContainer.lastElementChild;

  //* Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //* Visible Height
  const visibleHeight = messageContainer.offsetHeight;

  //* Height of messages container
  const containerHeight = messageContainer.scrollHeight;

  //* How far have i scrolled?
  const scrollOffSet = messageContainer.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffSet) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
};

//* Welcome to user
socket.on("welcome", (welcome) => {
  console.log(welcome.text);
});

//* Showing users
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebarForUsers.innerHTML = html;
});

//* Receiving new messages
socket.on("newMessage", (msg) => {
  const html = Mustache.render(messageTemplate, {
    message: msg.text,
    user: msg.name,
    createdAt: moment(msg.createdAt).format("h:mm A"),
  });
  messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

//* receiving location
socket.on("location", (url) => {
  const html = Mustache.render(locationTemplate, {
    url: url.text,
    user: url.name,
    createdAt: moment(url.createdAt).format("h:mm A"),
  });
  messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

//* sending messages on form submission
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  btn.setAttribute("disabled", "disabled");
  const message = e.target.elements.message;
  socket.emit("message", message.value, (error) => {
    btn.removeAttribute("disabled");
    messageForm.focus();
    if (error) {
      return console.log("Bad words not allowed!");
    }
    console.log("Message delivered!");
  });
  message.value = "";
});

//* Sharing location
locationBtn.addEventListener("click", () => {
  locationBtn.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not available");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    socket.emit("location", { lat, lon }, (e) => {
      if (e) {
        return console.log(e);
      }
      locationBtn.removeAttribute("disabled");
      console.log("Location shared");
    });
  });
});

socket.emit("join", { username, room }, (e) => {
  if (e) {
    alert(e);
    location.href = "/";
  }
});
