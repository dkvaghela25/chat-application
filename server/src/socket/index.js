import { registerRoomEvents } from "./handlers/room.handler.js";
import { registerMessageEvents } from "./handlers/message.handler.js";
import { registerGroupEvents } from "./handlers/group.handler.js";

io.on("connection", async (socket) => {
 
    await handleConnection(socket);

    registerMessageEvents(io, socket);
    registerRoomEvents(io, socket);
    registerGroupEvents(io, socket);

    socket.on("disconnect", () => {
        handleDisconnect(io, socket);
    });
});