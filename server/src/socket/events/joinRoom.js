import Room from "../../models/Room.js";
import User from "../../models/User.js";
import { randomUUID } from "crypto";
import { emitToUser } from "../services/emitService.js";
import { joinChatRoom } from "../services/roomService.js";
import { roomHasMember } from "../../helper/roomHasMembers.js";

export const joinRoom = async (socket, payload) => {
    try {

        const { receiverId, roomId } = payload;

        const userId = socket.userId;
        if (!userId) return;

        let room = null;

        if (receiverId) {

            const receiverUser = await User.findOne({ _id: receiverId })
                .select("name username online socketId")
                .lean();

            if (!receiverUser) return;

            room = await Room.findOne({ isGroup: false, members: { $all: [userId, receiverUser._id] } });

            if (!room) {
                const directRoomId = `direct_${randomUUID()}`;
                room = await Room.create({
                    roomId: directRoomId,
                    members: [userId, receiverUser._id],
                    isGroup: false,
                });
                room = await Room.findOne({ roomId: directRoomId }).populate("members", "name username online").lean();
                const senderNewChatMessage = { ...room.members.find((member) => String(member._id) !== String(userId)), roomId: room.roomId, isGroup: false, userId: receiverId };
                const receiverNewChatMessage = { ...room.members.find((member) => String(member._id) !== String(receiverId)), roomId: room.roomId, isGroup: false, userId: userId };
                socket.emit("newChatStarted", senderNewChatMessage);
                emitToUser(receiverUser._id, "newChatStarted", receiverNewChatMessage);
            }
        } else if (roomId) {
            room = await Room.findOne({ roomId }).lean();
        }

        if (!room || !roomHasMember({ room, userId })) return;

        joinChatRoom(socket, room.roomId);

        if (room.isGroup) {
            socket.emit("roomJoined", {
                roomId: room.roomId,
                isGroup: true,
                name: room.name,
                members: room.members,
            });
        } else {
            const otherUserId = room.members.find((member) => String(member._id) !== String(userId)) || null;
            const otherUser = await User.findOne({ _id: otherUserId }).select("name username online").lean();
            socket.emit("roomJoined", {
                roomId: room.roomId,
                isGroup: false,
                name: otherUser?.name,
                username: otherUser?.username,
                userId: otherUser?._id,
                online: Boolean(otherUser?.online),
            });
        }

    } catch (err) {
        console.error("Join Room Error:", err);
    }
};