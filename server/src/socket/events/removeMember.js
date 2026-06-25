import Room from "../../models/Room.js";
import User from "../../models/User.js";

export const removeMember = async (socket, payload) => {
    try {
        const { roomId, memberId } = payload;

        if (!roomId) throw new Error("Room ID is required");
        if (!memberId?.trim()) throw new Error("Member's userId is required");

        const room = await Room.findOne({ roomId })
            .populate("members", "name username online")
            .lean();

        if (!room) return;

        const adminUserId = socket.userId;

        if (String(room.adminId) !== adminUserId) return;


        const memberUser = await User.findOne({ _id: memberId })
            .select("_id username")
            .lean();
        if (!memberUser) return;

        await Room.updateOne(
            { roomId },
            { $pull: { members: memberId } }
        );

        socket.emit("memberRemoved", { roomId, memberId });

    } catch (err) {
        console.error("Remove Member Error:", err.message);
    }
};