const users = [];

const addUser = ({ id, username, room }) => {
  //* Cleaning data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //* Validating data
  if (!username || !room) {
    return {
      error: "Username and room must be provided",
    };
  }

  //* Check for existing users
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  //* Validate username
  if (existingUser) {
    return {
      error: "Username already exists",
    };
  }

  //* Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};


//* Removing user.
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//* Get user
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//* Getting users from room
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
