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

        // JOIN
        socket.on("join", async (username) => {
            try {
                // Save/update user
                await User.findOneAndUpdate(
                    { username },
                    { socketId: socket.id, online: true },
                    { upsert: true, new: true }
                );

                // ✅ SEND OLD MESSAGES
                const messages = await Message.find()
                    .sort({ createdAt: 1 })
                    .limit(50);

                socket.emit("oldMessages", messages);

                // Send updated users
                const users = await User.find();
                io.emit("userList", users);

            } catch (err) {
                console.error("Join Error:", err.message);
            }
        });

        socket.on("isTyping", async (bool) => {

            const user = await User.findOne({ socketId: socket.id });
            if (!user) {
                console.log("❌ User not found");
                return;
            }

            const message = {
                username: user.username,
                bool,
            };

            io.emit("isTyping", message);

        });

        // SEND MESSAGE
        socket.on("sendMessage", async (payload) => {
            try {
                console.log("Incoming payload:", payload);

                const user = await User.findOne({ socketId: socket.id });
                if (!user) {
                    console.log("❌ User not found");
                    return;
                }

                const { text = "", attachments = [], monaco_editor = { language: "plaintext", code: "" } } = payload;

                // validation
                if (!text && attachments.length === 0 && !monaco_editor.code) {
                    console.log("❌ Empty message");
                    return;
                }

                // ✅ SAVE MESSAGE
                const message = await Message.create({
                    username: user.username,
                    text,
                    attachments,
                    monaco_editor
                });

                console.log("✅ Saved message:", message);

                io.emit("receiveMessage", message);

            } catch (err) {
                console.error("🔥 Message Error:", err);
            }
        });

        // DISCONNECT
        socket.on("disconnect", async () => {
            try {
                await User.findOneAndUpdate(
                    { socketId: socket.id },
                    { online: false }
                );

                const users = await User.find({ online: true });
                io.emit("userList", users);

            } catch (err) {
                console.error("Disconnect Error:", err.message);
            }
        });
    });
};