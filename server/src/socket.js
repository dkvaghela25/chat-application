import { Server } from "socket.io";
import { addUser, removeUser, getUser, getAllUsers, users } from "./users.js";

export const initSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        // Join event
        socket.on("join", (username) => {
            addUser(socket.id, username);

            console.log(`${username} joined`);

            io.emit("userList", users);
        });

        // Message event
        socket.on("sendMessage", (message) => {
            const username = getUser(socket.id);

            const data = {
                username,
                message,
                time: new Date()
            };

            io.emit("receiveMessage", data);
        });

        // Typing event (optional)
        socket.on("typing", () => {
            const username = getUser(socket.id);
            socket.broadcast.emit("typing", username);
        });

        // Disconnect
        socket.on("disconnect", () => {
            const username = getUser(socket.id);

            console.log("❌ User disconnected:", username);

            removeUser(socket.id);

            io.emit("userList", Object.values(getAllUsers()));
        });
    });
};