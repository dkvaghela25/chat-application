import User from "../../models/User.js";
import { emitUserStatusToUsers } from "../utils/emitUserStatusToUsers.js";
import { joinUserRoom } from "./roomService.js";

export const markUserAsOnline = async (socket) => {
    try {
        console.log("User Connected:", socket.id);

        const user = await User.findByIdAndUpdate(
            socket.userId,
            {
                socketId: socket.id,
                online: true,
            },
            { new: true }
        );

        if (!user) {
            socket.disconnect(true);
            return;
        }

        joinUserRoom(socket, user._id);

        await emitUserStatusToUsers({
            userId: user._id,
            online: true,
        });

    } catch (err) {
        console.error("Connect Error:", err);
    }
};

export const markUserAsOffline = async (socket) => {
    try {
        console.log("User Disconnected:", socket.id);

        // Only update if this socket is still the active socket
        const user = await User.findOneAndUpdate(
            {
                _id: socket.userId,
                socketId: socket.id
            },
            {
                online: false,
                socketId: null
            },
            {
                new: true
            }
        )
        .select("name username online socketId")
        .lean();

        // Another socket already connected, so ignore this disconnect
        if (!user) {
            console.log("Ignoring stale socket disconnect:", socket.id);
            return;
        }

        await emitUserStatusToUsers({
            userId: user._id,
            online: false
        });

    } catch (err) {
        console.error("Disconnect Error:", err);
    }
};
