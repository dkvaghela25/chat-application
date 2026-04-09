import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
	autoConnect: false,
});

export const connectAndJoin = (username) => {
	if (!username) return;

	if (!socket.connected) {
		socket.connect();
	}

	socket.emit("join", username);
};