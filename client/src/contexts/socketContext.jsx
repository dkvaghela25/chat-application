import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { fetchUserDetails } from "../api/user";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const username = localStorage.getItem("username");
    const [roomId, setRoomId] = useState();
    const [receiver, setReceiver] = useState({});

    const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: false,
    }), []);

    useEffect(() => {
        if (!username) return;

        const onRoomJoined = (newRoomId) => {   
            setRoomId(newRoomId);
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

    useEffect(() => {
        const getUserDetails = async () => {
            if (!roomId) return;
            const receiverUsername = roomId.split("_").find(u => u !== username);
            try {
                const res = await fetchUserDetails(receiverUsername || username);
                setReceiver(res.userDetails);
            } catch (err) {
                console.error("Error fetching user details:", err);
            }
        };

        getUserDetails();
    }, [roomId, username]);

    const value = {
        username,
        socket,
        roomId,
        setRoomId,
        receiver
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => useContext(SocketContext);
