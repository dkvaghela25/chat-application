import Room from "../../models/Room.js";
import { randomUUID } from "crypto";
import { loadRoom } from "../utils/loadRoom.js";

export const createGroup = async (socket, payload) => {
    try {
        const adminId = socket.userId;
        if (!adminId) return;
        const { groupName, members } = payload;
        const memberIds = [adminId, ...members];
        if (!groupName?.trim() || memberIds.length < 2) return;

        const room = await Room.create({
            roomId: `group_${randomUUID()}`,
            isGroup: true,
            name: groupName.trim(),
            adminId: adminId,
            members: memberIds,
        });

        const populatedRoom = await loadRoom(room.roomId);

        socket.join(populatedRoom.roomId);

        socket.emit("roomJoined", {
            adminId: adminId,
            roomId: populatedRoom.roomId,
            isGroup: true,
            name: populatedRoom.name,
            members: populatedRoom.members,
        });

    } catch (err) {
        console.error("Create Group Error:", err);
    }
};