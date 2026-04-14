import { Server } from "socket.io";
import { randomUUID } from "crypto";
import User from "./models/User.js";
import Message from "./models/Message.js";
import Room from "./models/Room.js";

export const initSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    const buildConversationList = async (currentUsername) => {
        const rooms = await Room.find({ members: currentUsername }).sort({ updatedAt: -1 });

        const directUsernames = [...new Set(
            rooms
                .filter((room) => !room.isGroup)
                .flatMap((room) => room.members)
        )];

        const directUsers = await User.find({ username: { $in: directUsernames } });
        const directUserMap = new Map(directUsers.map((user) => [user.username, user]));

        return rooms
            .map((room) => {
                if (room.isGroup) {
                    return {
                        _id: room._id,
                        roomId: room.roomId,
                        isGroup: true,
                        name: room.name,
                        members: room.members,
                    };
                }

                const otherUsername = room.members.find(m => m !== currentUsername) ?? currentUsername;
                if (!otherUsername) return null;

                const otherUser = directUserMap.get(otherUsername);
                return {
                    _id: room._id,
                    roomId: room.roomId,
                    isGroup: false,
                    name: otherUser?.name || otherUsername,
                    username: otherUsername,
                    online: Boolean(otherUser?.online),
                };
            })
            .filter(Boolean);
    };

    const emitConversationListToUser = async (username) => {
        const user = await User.findOne({ username });
        if (!user?.socketId) return;

        const conversationList = await buildConversationList(username);
        io.to(user.socketId).emit("conversationList", conversationList);
    };

    const emitConversationListToUsers = async (usernames) => {
        const uniqueUsernames = [...new Set(usernames || [])];
        await Promise.all(uniqueUsernames.map((username) => emitConversationListToUser(username)));
    };

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        socket.on("join", async (username) => {
            try {

                await User.findOneAndUpdate(
                    { username },
                    { socketId: socket.id, online: true },
                );

                socket.username = username;

                const rooms = await Room.find({ members: username });
                const impactedUsers = [...rooms.flatMap((room) => room.members)];
                await emitConversationListToUsers(impactedUsers);

            } catch (err) {
                console.error("Join Error:", err.message);
            }
        });

        socket.on("joinRoom", async ({ receiver, roomId }) => {
            try {
                const sender = socket.username;
                if (!sender) return;

                let room = null;

                if (receiver) {
                    const roomId = sender === receiver ? sender : [sender, receiver].sort().join("_");
                    room = await Room.findOne({ roomId });
                    if (!room) {
                        room = await Room.create({
                            roomId,
                            members: sender === receiver ? [sender] : [sender, receiver],
                            isGroup: false,
                        });
                    }
                } else if (roomId) {
                    room = await Room.findOne({ roomId });
                }

                if (!room || !room.members.includes(sender)) return;

                socket.join(room.roomId);

                if (room.isGroup) {
                    socket.emit("roomJoined", {
                        roomId: room.roomId,
                        isGroup: true,
                        name: room.name,
                        members: room.members,
                    });
                } else {
                    const otherUsername = room.members.find(m => m !== sender) ?? sender;
                    const otherUser = await User.findOne({ username: otherUsername });

                    socket.emit("roomJoined", {
                        roomId: room.roomId,
                        isGroup: false,
                        name: otherUser?.name || otherUsername,
                        username: otherUsername,
                        online: Boolean(otherUser?.online),
                    });
                }

                await emitConversationListToUsers(room.members);

            } catch (err) {
                console.error("Join Room Error:", err.message);
            }
        });

        socket.on("createGroup", async ({ groupName, members = [] }) => {
            try {
                const admin = socket.username;
                if (!admin) return;

                const normalizedMembers = [...new Set([admin, ...members])].filter(Boolean);
                if (!groupName?.trim() || normalizedMembers.length < 2) return;

                const room = await Room.create({
                    roomId: `group_${randomUUID()}`,
                    isGroup: true,
                    name: groupName.trim(),
                    admin,
                    members: normalizedMembers,
                });

                socket.join(room.roomId);

                socket.emit("roomJoined", {
                    admin,
                    roomId: room.roomId,
                    isGroup: true,
                    name: room.name,
                    members: room.members,
                });

                await emitConversationListToUsers(normalizedMembers);

            } catch (err) {
                console.error("Create Group Error:", err.message);
            }
        });

        socket.on("addMember", async ({ roomId, newMembers = [] }) => {
            try {

                
                const room = await Room.findOne({ roomId });
                if (!room) return;
                
                const admin = socket.username;
                if (room.admin !== admin || newMembers.length === 0) return;
                
                room.members = [...room.members, ...newMembers];
                await room.save();

                socket.emit("newMemberAdded");

                await emitConversationListToUsers(room.members);

            } catch (err) {
                console.error("Create Group Error:", err.message);
            }
        });
        
        socket.on("removeMember", async ({ roomId, member }) => {
            try {

                const room = await Room.findOne({ roomId });
                if (!room) return;
                
                const admin = socket.username;
                if (room.admin !== admin || !member.trim()) return;
                
                room.members = room.members.filter(m => m !== member);
                await room.save();

                socket.emit("memberRemoved");

                await emitConversationListToUsers(room.members);

            } catch (err) {
                console.error("Create Group Error:", err.message);
            }
        });

        socket.on("isTyping", async ({ roomId, bool, sender }) => {
            if (!roomId) return;

            io.to(roomId).emit("isTyping", {
                roomId,
                sender,
                bool,
            });
        });

        socket.on("sendMessage", async (payload) => {
            try {

                const { roomId, text = "", attachments = [], monaco_editor } = payload;
                if (!roomId) return;

                const sender = socket.username;
                if (!sender) return;

                const room = await Room.findOne({ roomId });
                if (!room || !room.members.includes(sender)) return;

                const message = await Message.create({
                    sender,
                    roomId,
                    text,
                    attachments,
                    monaco_editor,
                });

                await Room.updateOne({ roomId }, { $set: { updatedAt: new Date() } });

                io.to(roomId).emit("receiveMessage", message);

                await emitConversationListToUsers(room.members);

            } catch (err) {
                console.error("Send Message Error:", err.message);
            }
        });

        socket.on("getMessages", async ({ roomId }) => {
            try {

                if (!roomId) return;

                const requester = socket.username;
                if (!requester) return;

                const room = await Room.findOne({ roomId });
                if (!room || !room.members.includes(requester)) return;

                const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

                socket.emit("chatHistory", messages);

            } catch (err) {
                console.error("Get Messages Error:", err.message);
            }
        });

        socket.on("disconnect", async () => {
            try {
                const disconnectedUser = await User.findOneAndUpdate(
                    { socketId: socket.id },
                    { online: false }
                );

                if (!disconnectedUser?.username) return;

                const rooms = await Room.find({ members: disconnectedUser.username });
                const impactedUsers = [
                    disconnectedUser.username,
                    ...rooms.flatMap((room) => room.members),
                ];

                await emitConversationListToUsers(impactedUsers);

            } catch (err) {
                console.error("Disconnect Error:", err.message);
            }
        });

    });

};