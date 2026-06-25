const USER_ROOM_PREFIX = 'user';
const CHAT_ROOM_PREFIX = 'chat';

function getUserRoom(userId) {
    return `${USER_ROOM_PREFIX}:${userId}`;
}

function getChatRoom(roomId) {
    return `${CHAT_ROOM_PREFIX}:${roomId}`;
}

function joinUserRoom(socket, userId) {
    const room = getUserRoom(userId);
    socket.join(room);
    return room;
}

function joinChatRoom(socket, roomId) {
    const room = getChatRoom(roomId);
    socket.join(room);
    return room;
}

export { getUserRoom, getChatRoom, joinUserRoom, joinChatRoom };