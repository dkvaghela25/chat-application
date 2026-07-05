import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { fetchMe } from "../api/user";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [roomId, setRoomId] = useState();
    const [activeChat, setActiveChat] = useState(null);
    const [loadingRoom, setLoadingRoom] = useState(false);

    const [isActiveChatMember, setIsActiveChatMember] = useState(true);
    console.log("🚀 ~ SocketContextProvider ~ isActiveChatMember:", isActiveChatMember)

    useEffect(() => {
        if (!activeChat || !user) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsActiveChatMember(activeChat?.isGroup ? activeChat?.members?.some((memberId) => {
            console.log("🚀 ~ SocketContextProvider ~ user?._id:", user?._id)
            console.log("🚀 ~ SocketContextProvider ~ activeChat?.members:", memberId)
            return String(memberId) === String(user?._id);
        }) : true);
    }, [activeChat, user]);

    const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: false,
    }), []);

    const joinRoom = (data) => {
        if (!socket) return;
        setLoadingRoom(true);
        socket.emit("joinRoom", data);
    };

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
                setLoadingRoom(false);
                return;
            }

            setRoomId(roomData?.roomId);
            setActiveChat(roomData || null);
            setLoadingRoom(false);
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

        const handleMemberRemoved = (data) => {
            if (data.roomId === roomId) {
                setIsActiveChatMember(false);
            }
        }

        const handleDisconnect = () => {
            setLoadingRoom(false);
        }

        socket.on("roomJoined", onRoomJoined);
        socket.on("userStatusChanged", onStatusChange);
        socket.on("removedFromGroup", handleMemberRemoved);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("roomJoined", onRoomJoined);
            socket.off("userStatusChanged", onStatusChange);
            socket.off("removedFromGroup", handleMemberRemoved);
            socket.off("disconnect", handleDisconnect);
        };
    }, [socket, user, isActiveChatMember, roomId]);

    const value = {
        user,
        getUserDetails,
        socket,
        roomId,
        setRoomId,
        activeChat,
        isActiveChatMember,
        loadingRoom,
        joinRoom
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => useContext(SocketContext);
