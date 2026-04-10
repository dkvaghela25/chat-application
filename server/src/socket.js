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
                // Save/update user
                await User.findOneAndUpdate(
                    { username },
                    { socketId: socket.id, online: true },
                    { upsert: true, new: true }
                );

                socket.username = username;

                // Send updated users
                const users = await User.find({ username });
                io.emit("userList", users);

            } catch (err) {
                console.error("Join Error:", err.message);
            }
        });

        socket.on("joinRoom", async ({ receiver }) => {
            try {

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

            } catch (err) {
                console.error("Join Room Error:", err.message);
            }
        });

        socket.on("isTyping", async ({ receiver, bool }) => {
            const user = await User.findOne({ socketId: socket.id });
            if (!user) return;

            const receiverUser = await User.findOne({ username: receiver });
            if (!receiverUser?.socketId) return;

            io.to(receiverUser.socketId).emit("isTyping", {
                username: user.username,
                bool,
            });
        });

        socket.on("sendMessage", async (payload) => {
            try {

                const { roomId, text = "", attachments = [], monaco_editor } = payload
                console.log("payload.........................................", payload)

                if (!roomId) return;

                const room = await Room.findOne({ roomId });
                if (!room) return;

                const sender = socket.username;
                const receiver = roomId === `${sender}_${sender}` ? sender : room.members.find(m => m !== sender);

                console.log("message.....................................", {
                    sender,
                    receiver,
                    text,
                    attachments,
                    monaco_editor
                })

                const message = await Message.create({
                    sender,
                    receiver,
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
                const room = await Room.findOne({ roomId });
                if (!room) return;

                const messages = await Message.find({
                    $or: [
                        { sender: room.members[0], receiver: room.members[1] },
                        { sender: room.members[1], receiver: room.members[0] },
                    ]
                }).sort({ createdAt: 1 });

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