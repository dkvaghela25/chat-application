import { joinRoom } from "./events/joinRoom.js";
import { socketAuth } from "./middleware/socketAuth.js";
import { markUserAsOffline, markUserAsOnline } from "./services/userService.js";
import { isTyping } from "./events/isTyping.js";
import { sendMessage } from "./events/sendMessage.js";

function socketManager(io) {

    io.use(socketAuth);

    io.on('connection', async (socket) => {
        await markUserAsOnline(socket);
        socket.on("joinRoom", payload => joinRoom(socket, payload));
        socket.on("isTyping", payload => isTyping(payload));
        socket.on("sendMessage", payload => sendMessage(socket, payload));
        socket.on("disconnect", () => markUserAsOffline(socket));
    });

};

export { socketManager };