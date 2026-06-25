import { getIoInstance } from "../index.js";
import { serializeMessage } from "../../helper/serializers.js";
import Message from "../../models/Message.js";
import Room from "../../models/Room.js";
import { roomHasMember } from "../utils/roomHasMembers.js";

export const sendMessage = async (socket, payload) => {
    try {

        const { roomId, text = "", attachments = [], monaco_editor } = payload;
        if (!roomId) return;

        const senderId = socket.userId;
        if (!senderId) return;

        const room = await Room.findOne({ roomId })
            .select("members")
            .lean();
        if (!room || !roomHasMember(room, senderId)) return;

        const message = await Message.create({
            sender: senderId,
            roomId,
            text,
            attachments,
            monaco_editor,
        });

        await Room.updateOne({ roomId }, { $set: { updatedAt: new Date() } });

        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "name username")
            .lean();

        const io = getIoInstance();
        io.to(roomId).emit("receiveMessage", serializeMessage(populatedMessage));

    } catch (err) {
        console.error("Send Message Error:", err);
    }
};