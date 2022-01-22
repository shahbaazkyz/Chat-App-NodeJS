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
