import { roomHasMember } from "../../helper/roomHasMembers.js";
import { serializeMessage } from "../../helper/serializers.js";
import Message from "../../models/Message.js";
import Room from "../../models/Room.js";
import { emitToChat } from "../services/emitService.js";

export const sendMessage = async (socket, payload) => {
    try {

        const { roomId, text = "", attachments = [], monaco_editor } = payload;
        if (!roomId) return;

        const userId = socket.userId;
        if (!userId) return;

        const room = await Room.findOne({ roomId })
            .select("members removedMembers")
            .lean();
        if (!room || !roomHasMember({ room, userId, includeRemoved: false })) return;

        const message = await Message.create({
            sender: userId,
            roomId,
            text,
            attachments,
            monaco_editor,
        });

        await Room.updateOne({ roomId }, { $set: { updatedAt: new Date() } });

        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "name username")
            .lean();

        emitToChat(roomId, "receiveMessage", serializeMessage(populatedMessage));

    } catch (err) {
        console.error("Send Message Error:", err);
    }
};