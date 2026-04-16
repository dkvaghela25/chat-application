import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const localStorageUsername = localStorage.getItem("username");
    
    const [username, setUsername] = useState(localStorageUsername || "");
    const [roomId, setRoomId] = useState();
    const [activeChat, setActiveChat] = useState(null);

    const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: false,
    }), []);

    useEffect(() => {
        localStorage.setItem("username", username);
    }, [username]);

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


        if (!socket.connected) {
            socket.connect();
            socket.emit("join", username);
        }

        socket.on("roomJoined", onRoomJoined);

        return () => {
            socket.off("roomJoined", onRoomJoined);
        };
    }, [socket, username]);

    const value = {
        username,
        setUsername,
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
