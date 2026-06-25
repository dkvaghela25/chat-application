import Room from "../../models/Room.js";

export const loadRoom = (roomId) => Room.findOne({ roomId })
    .populate("members", "name username online")
    .populate("adminId", "username")
    .lean();