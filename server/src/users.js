export const users = {};

export const addUser = (socketId, username) => {
  users[socketId] = username;
};

export const removeUser = (socketId) => {
  delete users[socketId];
};

export const getUser = (socketId) => {
  return users[socketId];
};

export const getAllUsers = () => {
  return users;
};