import Room from "../../models/Room.js";

export const getImpactedUsersRoomId = async (userId) => {
    const rooms = await Room.find({ members: userId, isGroup: false })
        .select("members roomId")
        .lean();

    return rooms;
};
