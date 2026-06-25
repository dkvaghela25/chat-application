import Room from "../../models/Room.js";
import User from "../../models/User.js";
import { randomUUID } from "crypto";
import { loadRoom } from "../utils/loadRoom.js";
import { roomHasMember } from "../utils/roomHasMembers.js";
import { getIoInstance } from "../index.js";

export const joinRoom = async (socket, payload) => {
    try {
        const { receiverId, roomId } = payload;

        const senderId = socket.userId;
        if (!senderId) return;

        const io = getIoInstance();

        let room = null;

        if (receiverId) {

            const receiverUser = await User.findOne({ _id: receiverId })
                .select("name username online socketId")
                .lean();

            if (!receiverUser) return;

            room = await Room.findOne({ isGroup: false, members: { $all: [senderId, receiverUser._id] } });

            if (!room) {
                const directRoomId = `direct_${randomUUID()}`;
                room = await Room.create({
                    roomId: directRoomId,
                    members: [senderId, receiverUser._id],
                    isGroup: false,
                });
                room = await loadRoom(directRoomId);
                const senderNewChatMessage = { ...room.members.find((member) => String(member._id) !== String(senderId)), roomId: room.roomId, isGroup: false, userId: receiverId };
                const receiverNewChatMessage = { ...room.members.find((member) => String(member._id) !== String(receiverId)), roomId: room.roomId, isGroup: false, userId: senderId };
                socket.emit("newChatStarted", senderNewChatMessage);
                io.to(`user:${receiverUser._id}`).emit("newChatStarted", receiverNewChatMessage);
            }
        } else if (roomId) {
            room = await loadRoom(roomId);
        }

        if (!room || !roomHasMember(room, senderId)) return;


        socket.join(room.roomId);

        if (room.isGroup) {
            socket.emit("roomJoined", {
                roomId: room.roomId,
                isGroup: true,
                name: room.name,
                members: room.members,
            });
        } else {
            const otherUser = room.members.find((member) => String(member._id) !== String(senderId)) || null;
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