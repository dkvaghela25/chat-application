import { Server } from "socket.io";
import User from "./models/User.js";
import Message from "./models/Message.js";

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

                // Send updated users
                const users = await User.find();
                io.emit("userList", users);

            } catch (err) {
                console.error("Join Error:", err.message);
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
                const sender = await User.findOne({ socketId: socket.id });
                if (!sender) return;

                const {
                    receiver,
                    text = "",
                    attachments = [],
                    monaco_editor = { language: "plaintext", code: "" }
                } = payload;

                if (!receiver) {
                    console.log("❌ No receiver");
                    return;
                }

                // 🔍 Find receiver
                const receiverUser = await User.findOne({ username: receiver });

                if (!receiverUser || !receiverUser.socketId) {
                    console.log("❌ Receiver not online");
                    return;
                }

                // 💾 Save message
                const message = await Message.create({
                    sender: sender.username,
                    receiver,
                    text,
                    attachments,
                    monaco_editor
                });

                // ✅ send to receiver ONLY
                if (receiverUser?.socketId) {
                    io.to(receiverUser.socketId).emit("receiveMessage", message);
                }

                if(receiver !== sender.username ){
                    socket.emit("receiveMessage", message);
                }

            } catch (err) {
                console.error("Send Message Error:", err.message);
            }
        });

        socket.on("getMessages", async ({ senderUserName, receiverUserName }) => {

            const messages = await Message.find({
                $or: [
                    { sender: senderUserName, receiver: receiverUserName },
                    { sender: receiverUserName, receiver: senderUserName },
                ]
            }).sort({ createdAt: 1 });

            socket.emit("chatHistory", messages);
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