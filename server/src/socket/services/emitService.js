import { getIoInstance } from "../index.js";
import { getChatRoom, getUserRoom } from "./roomService.js";

function emitToUser(userId, event, payload) {
    console.log("🚀 ~ emitToUser ~ event:", event)
    console.log("🚀 ~ emitToUser ~ userId:", userId)
    console.log("🚀 ~ emitToUser ~ payload:", payload)
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