import User from "../../models/User.js";
import { emitUserStatusToUsers } from "../utils/emitUserStatusToUsers.js";
import { joinUserRoom } from "./roomService.js";

export const markUserAsOnline = async (socket) => {
    try {

        console.log('User Connected : ', socket.id);

        const user = await User.findByIdAndUpdate(
            socket.userId,
            { socketId: socket.id, online: true, },
            { new: true }
        );

        if (!user) {
            socket.disconnect();
            return;
        }

        joinUserRoom(socket, user._id);

        await emitUserStatusToUsers({ userId: user._id, online: true });
    } catch (err) {
        console.error("Connect Error:", err.message);
    }
};

export const markUserAsOffline = async (socket) => {
    try {

        console.log('User Disconnected : ', socket.id);

        const user = await User.findOneAndUpdate(
            { _id: socket.userId },
            { online: false },
            { new: true }
        )
            .select("name username online socketId")
            .lean();

        if (!user?._id) return;

        await emitUserStatusToUsers({ userId: user._id, online: false });

    } catch (err) {
        console.error("Disconnect Error:", err.message);
    }
};