import { Server } from "socket.io";
import User from "./models/User.js";
import Message from "./models/Message.js";
import Room from "./models/Room.js";

export const initSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        socket.on("join", async (username) => {
            try {

                await User.findOneAndUpdate(
                    { username },
                    { socketId: socket.id, online: true },
                );

                socket.username = username;

                const rooms = await Room.find({ members: username });
                const targetedUsernames = [...new Set([username, ...rooms.flatMap(room => room.members)])];

                const users = await User.find({
                    username: { $in: targetedUsernames }
                });

                io.emit("userList", users);

            } catch (err) {
                console.error("Join Error:", err.message);
            }
        });

        socket.on("joinRoom", async ({ receiver }) => {
            try {

                console.log("Room join event received for:", receiver)

                const sender = socket.username;

                const roomId = [sender, receiver].sort().join("_");

                let room = await Room.findOne({ roomId });

                if (!room) {
                    room = await Room.create({
                        roomId,
                        members: [sender, receiver],
                        isGroup: false,
                    });
                }

                socket.join(roomId);

                socket.emit("roomJoined", roomId);

                const rooms = await Room.find({ members: username });
                const targetedUsernames = [...new Set([username, ...rooms.flatMap(room => room.members)])];

                const users = await User.find({
                    username: { $in: targetedUsernames }
                });

                io.emit("userList", users);

            } catch (err) {
                console.error("Join Room Error:", err.message);
            }
        });

        socket.on("isTyping", async ({ roomId, bool, sender }) => {
            if (!roomId) return;

            io.to(roomId).emit("isTyping", {
                roomId,
                sender,
                bool,
            });
        });

        socket.on("sendMessage", async (payload) => {
            try {

                const { roomId, text = "", attachments = [], monaco_editor } = payload

                if (!roomId) return;

                const room = await Room.findOne({ roomId });
                if (!room) return;

                const sender = socket.username;

                const message = await Message.create({
                    sender,
                    roomId,
                    text,
                    attachments,
                    monaco_editor
                });

                io.to(roomId).emit("receiveMessage", message);

            } catch (err) {
                console.error("Send Message Error:", err.message);
            }
        });

        socket.on("getMessages", async ({ roomId }) => {
            try {

                if (!roomId) return;

                const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

                socket.emit("chatHistory", messages);

            } catch (err) {
                console.error("Get Messages Error:", err.message);
            }
        });

        socket.on("disconnect", async () => {
            try {
                await User.findOneAndUpdate(
                    { socketId: socket.id },
                    { online: false }
                );

                const users = await User.find();
                io.emit("userList", users);

            } catch (err) {
                console.error("Disconnect Error:", err.message);
            }
        });

    });

};