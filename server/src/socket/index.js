import { Server } from "socket.io";
let io;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true
        }
    });

    return io;
}

function getIoInstance() {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }

    return io;
}

export { initializeSocket, getIoInstance };