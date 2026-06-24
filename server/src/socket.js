import { Server } from "socket.io";
import { randomUUID } from "crypto";
import User from "./models/User.js";
import Message from "./models/Message.js";
import Room from "./models/Room.js";
import jwt from "jsonwebtoken";
import { serializeMessage } from "./helper/serializers.js";

export const initSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    const getUserProjection = "name username online socketId";

    const roomHasMember = (room, userId) => Boolean(room?.members?.some((member) => String(member?._id ?? member) === String(userId)));

    const loadRoom = (roomId) => Room.findOne({ roomId })
        .populate("members", "name username online")
        .populate("adminId", "username")
        .lean();

    const getImpactedUsersRoomId = async (userId) => {
        const rooms = await Room.find({ members: userId, isGroup: false })
            .select("members roomId")
            .lean();

        return rooms;
    };

    const emitUserStatusToUsers = async ({
        userId,
        online,
    }) => {

        const impactedUsersRooms = await getImpactedUsersRoomId(userId);

        impactedUsersRooms
            .forEach(({ roomId, members }) => {
                members
                    .filter((memberId) => String(memberId) !== String(userId))
                    .forEach((memberId) => {
                        io.to(`user:${memberId}`).emit("userStatusChanged", { roomId, online });
                    });
            });
    };

    const emitNewGroupCreatedToUsers = async (userIds = [], room) => {
        userIds
            .forEach((userId) => {
                io.to(`user:${userId}`).emit("newGroupCreated", {
                    roomId: room.roomId,
                    isGroup: true,
                    name: room.name,
                    members: room.members,
                });
            });
    }

    const resolveUsersByUserIds = async (userIds = []) => {
        const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
        if (uniqueUserIds.length === 0) return [];

        return User.find({ _id: { $in: uniqueUserIds } })
            .select(getUserProjection)
            .lean();
    };

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.userId = decoded.userId;

            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", async (socket) => {
        console.log("✅ User connected:", socket.id);

        const currentUser = await User.findByIdAndUpdate(
            socket.userId,
            { socketId: socket.id, online: true, },
            { new: true }
        );

        if (!currentUser) {
            socket.disconnect();
            return;
        }

        socket.join(`user:${currentUser._id}`);

        await emitUserStatusToUsers({ userId: currentUser._id, online: true });

        socket.on("joinRoom", async ({ receiverId, roomId }) => {
            try {

                const senderId = socket.userId;
                if (!senderId) return;

                let room = null;

                if (receiverId) {

                    const receiverUser = await User.findOne({ _id: receiverId })
                        .select(getUserProjection)
                        .lean();

                    if (!receiverUser) return;

                    room = await Room.findOne({ isGroup: false, members: { $all: [senderId, receiverUser._id] } });

                    if (!room) {
                        const directRoomId = `direct_${randomUUID()}`;
                        room = await Room.create({
                            roomId: directRoomId,
                            members: [senderId, receiverUser._id],
                            isGroup: false,
                        });
                        room = await loadRoom(directRoomId);
                        const senderNewChatMessage = { ...room.members.find((member) => String(member._id) !== String(senderId)), roomId: room.roomId, isGroup: false, userId: receiverId };
                        const receiverNewChatMessage = { ...room.members.find((member) => String(member._id) !== String(receiverId)), roomId: room.roomId, isGroup: false, userId: senderId };
                        socket.emit("newChatStarted", senderNewChatMessage);
                        io.to(`user:${receiverUser._id}`).emit("newChatStarted", receiverNewChatMessage);
                    }
                } else if (roomId) {
                    room = await loadRoom(roomId);
                }

                if (!room || !roomHasMember(room, senderId)) return;


                socket.join(room.roomId);

                if (room.isGroup) {
                    socket.emit("roomJoined", {
                        roomId: room.roomId,
                        isGroup: true,
                        name: room.name,
                        members: room.members,
                    });
                } else {
                    const otherUser = room.members.find((member) => String(member._id) !== String(senderId)) || null;
                    socket.emit("roomJoined", {
                        roomId: room.roomId,
                        isGroup: false,
                        name: otherUser?.name || senderUsername,
                        username: otherUser?.username || senderUsername,
                        userId: otherUser?._id,
                        online: Boolean(otherUser?.online),
                    });
                }

            } catch (err) {
                console.error("Join Room Error:", err);
            }
        });

        socket.on("createGroup", async ({ groupName, members = [] }) => {
            try {
                const adminId = socket.userId;
                if (!adminId) return;

                const memberIds = [adminId, ...members];
                if (!groupName?.trim() || memberIds.length < 2) return;

                const room = await Room.create({
                    roomId: `group_${randomUUID()}`,
                    isGroup: true,
                    name: groupName.trim(),
                    adminId: adminId,
                    members: memberIds,
                });

                const populatedRoom = await loadRoom(room.roomId);

                socket.join(populatedRoom.roomId);

                socket.emit("roomJoined", {
                    adminId: adminId,
                    roomId: populatedRoom.roomId,
                    isGroup: true,
                    name: populatedRoom.name,
                    members: populatedRoom.members,
                });
                await emitNewGroupCreatedToUsers(memberIds, populatedRoom);

            } catch (err) {
                console.error("Create Group Error:", err);
            }
        });

        socket.on("addMember", async ({ roomId, newMembers = [] }) => {
            try {

                const room = await Room.findOne({ roomId })
                    .populate("members", "name username online")
                    .lean();
                if (!room) return;

                const adminUserId = socket.userId;

                if (String(room.adminId) !== adminUserId || newMembers.length === 0) return;

                const memberDocs = await resolveUsersByUserIds(newMembers);
                const existingMemberIds = room.members.map((member) => String(member._id));
                const filteredNewMembers = memberDocs.filter((member) => !existingMemberIds.includes(String(member._id)));
                const filteredNewMemberIds = filteredNewMembers.map((member) => String(member._id));

                if (filteredNewMemberIds.length === 0) return;

                await Room.updateOne(
                    { roomId },
                    { $addToSet: { members: { $each: filteredNewMemberIds } } }
                );

                socket.emit("newMemberAdded", { roomId, newMembers: filteredNewMembers });

                socket.emit("roomJoined", {
                    roomId,
                    isGroup: true,
                    name: room.name,
                    members: [...room.members, ...filteredNewMembers],
                });

            } catch (err) {
                console.error("Create Group Error:", err);
            }
        });

        socket.on("removeMember", async ({ roomId, memberId }) => {
            try {

                if (!roomId) throw new Error("Room ID is required");
                if (!memberId?.trim()) throw new Error("Member's userId is required");

                const room = await Room.findOne({ roomId })
                    .populate("members", "name username online")
                    .lean();

                if (!room) return;

                const adminUserId = socket.userId;

                if (String(room.adminId) !== adminUserId) return;


                const memberUser = await User.findOne({ _id: memberId })
                    .select("_id username")
                    .lean();
                if (!memberUser) return;

                await Room.updateOne(
                    { roomId },
                    { $pull: { members: memberId } }
                );

                socket.emit("memberRemoved", { roomId, memberId });

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

                const senderId = socket.userId;
                if (!senderId) return;

                const room = await Room.findOne({ roomId })
                    .select("members")
                    .lean();
                if (!room || !roomHasMember(room, senderId)) return;

                const message = await Message.create({
                    sender: senderId,
                    roomId,
                    text,
                    attachments,
                    monaco_editor,
                });

                await Room.updateOne({ roomId }, { $set: { updatedAt: new Date() } });

                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "name username")
                    .lean();

                io.to(roomId).emit("receiveMessage", serializeMessage(populatedMessage));

            } catch (err) {
                console.error("Send Message Error:", err);
            }
        });

        // socket.on("getMessages", async ({ roomId }) => {
        //     try {

        //         if (!roomId) return;

        //         const requester = socket.userId;
        //         if (!requester) return;

        //         const room = await Room.findOne({ roomId })
        //             .select("members")
        //             .lean();
        //         if (!room || !roomHasMember(room, requester)) return;

        //         const messages = await Message.find({ roomId })
        //             .sort({ createdAt: 1 })
        //             .populate("sender", "name username")
        //             .lean();

        //         socket.emit("chatHistory", messages.map(serializeMessage));

        //     } catch (err) {
        //         console.error("Get Messages Error:", err.message);
        //     }
        // });

        socket.on("disconnect", async () => {
            try {
                const disconnectedUser = await User.findOneAndUpdate(
                    { _id: socket.userId },
                    { online: false },
                    { new: true }
                )
                    .select(getUserProjection)
                    .lean();

                if (!disconnectedUser?._id) return;

                const rooms = await Room.find({ members: disconnectedUser._id })
                    .select("members")
                    .lean();
                const impactedUsers = [
                    disconnectedUser._id,
                    ...rooms.flatMap((room) => room.members.map((member) => String(member))),
                ];

                await emitUserStatusToUsers({ userId: currentUser._id, online: false });

            } catch (err) {
                console.error("Disconnect Error:", err.message);
            }
        });

    });

};
