import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { fetchMe } from "../api/user";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [roomId, setRoomId] = useState();
    const [activeChat, setActiveChat] = useState(null);

    const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: false,
    }), []);

    const getUserDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                return;
            }
            const res = await fetchMe();
            setUser(res.userDetails);
        } catch (error) {
            console.error("Error fetching user details:", error);
            setUser(null);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getUserDetails();
    }, []);

    useEffect(() => {

        if (!user) return;

        const onRoomJoined = (roomData) => {

            if (typeof roomData === "string") {
                setRoomId(roomData);
                return;
            }

            setRoomId(roomData?.roomId);
            setActiveChat(roomData || null);
        };

        const onStatusChange = (statusData) => {
            setActiveChat(prev => {
                if (!prev) return prev;
                if (prev.roomId !== statusData.roomId) return prev;
                const updatedActiveChat = { ...prev, online: statusData.online };
                return updatedActiveChat;
            });
        };


        if (!socket.connected) {
            // eslint-disable-next-line react-hooks/immutability
            socket.auth = {
                token: localStorage.getItem("token")
            };
            socket.connect();
        }

        socket.on("roomJoined", onRoomJoined);
        socket.on("userStatusChanged", onStatusChange);

        return () => {
            socket.off("roomJoined", onRoomJoined);
            socket.off("userStatusChanged", onStatusChange);
        };
    }, [socket, user]);

    const value = {
        user,
        getUserDetails,
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
