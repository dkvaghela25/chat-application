export const serializeUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    online: Boolean(user.online),
  };
};

export const serializeRoom = (room, currentUserId = null) => {
  if (!room) return null;

  const members = (room.members || [])
    .map(serializeUser)
    .filter(Boolean);

  let directMember = null;

  if (!room.isGroup && currentUserId) {
    directMember = members.find((member) => String(member._id) !== String(currentUserId)) || members[0] || null;
  }

  return {
    ...room,
    members,
    ...(directMember
      ? {
        username: directMember.username,
        online: Boolean(directMember.online),
      }
      : {}),
  };
};

export const serializeMessage = (message) => ({
  ...message,
  sender: typeof message.sender === "object" ? message.sender?.username ?? null : message.sender ?? null,
});
