import { getIoInstance } from "../index.js";
import { getChatRoom, getUserRoom } from "./roomService.js";

function emitToUser(userId, event, payload) {
    const io = getIoInstance();
    io.to(getUserRoom(userId))
        .emit(event, payload);
}

function emitToChat(roomId, event, payload) {
    const io = getIoInstance();
    io.to(getChatRoom(roomId))
        .emit(event, payload);
}

export { emitToUser, emitToChat };