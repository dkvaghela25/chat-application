import { getIoInstance } from "../index.js";

export const isTyping = async ({ roomId, bool, sender }) => {
    if (!roomId) return;
    const io = getIoInstance();

    io.to(roomId).emit("isTyping", {
        roomId,
        sender,
        bool,
    });
};