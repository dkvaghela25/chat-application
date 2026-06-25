import Room from "../../models/Room.js";
import User from "../../models/User.js";

export const addMember = async (socket, payload) => {
    try {
        const { roomId, newMembers = [] } = payload;

        const room = await Room.findOne({ roomId })
            .populate("members", "name username online")
            .lean();
        if (!room) return;

        const adminUserId = socket.userId;

        if (String(room.adminId) !== adminUserId || newMembers.length === 0) return;


        const uniqueUserIds = [...new Set(newMembers.filter(Boolean))];
        if (uniqueUserIds.length === 0) return [];

        const memberDocs = await User.find({ _id: { $in: uniqueUserIds } })
            .select("name username online socketId")
            .lean();

        const existingMemberIds = room.members.map((member) => String(member._id));
        const filteredNewMembers = memberDocs.filter((member) => !existingMemberIds.includes(String(member._id)));
        const filteredNewMemberIds = filteredNewMembers.map((member) => String(member._id));

        if (filteredNewMemberIds.length === 0) return;

        await Room.updateOne(
            { roomId },
            { $addToSet: { members: { $each: filteredNewMemberIds } } }
        );

        socket.emit("newMemberAdded", { roomId, newMembers: filteredNewMembers });

        socket.emit("roomJoined", {
            roomId,
            isGroup: true,
            name: room.name,
            members: [...room.members, ...filteredNewMembers],
        });

    } catch (err) {
        console.error("Add Member Error:", err);
    }
};