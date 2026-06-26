import { emitToChat } from "../services/emitService.js";

export const isTyping = async ({ roomId, bool, sender }) => {
    
    if (!roomId) return;

    emitToChat(roomId, "isTyping", {
        roomId,
        sender,
        bool,
    });
};