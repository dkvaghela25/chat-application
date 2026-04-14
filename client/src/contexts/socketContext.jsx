import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const username = localStorage.getItem("username");
    const [roomId, setRoomId] = useState();
    const [activeChat, setActiveChat] = useState(null);

    const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: false,
    }), []);

    useEffect(() => {
        if (!username) return;

        const onRoomJoined = (roomData) => {

            if (typeof roomData === "string") {
                setRoomId(roomData);
                return;
            }

            setRoomId(roomData?.roomId);
            setActiveChat(roomData || null);
        };

        socket.on("roomJoined", onRoomJoined);

        if (!socket.connected) {
            socket.connect();
            socket.emit("join", username);
        }

        return () => {
            socket.off("roomJoined", onRoomJoined);
        };
    }, [socket, username]);

    const value = {
        username,
        socket,
        roomId,
        setRoomId,
        activeChat,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => useContext(SocketContext);
