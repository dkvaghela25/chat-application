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
        .populate("admin", "username")
        .lean();

    const getImpactedUsersRoomId = async (userId) => {
        const rooms = await Room.find({ members: userId, isGroup: false })
            .select("members")
            .lean();

        return rooms;
    };

    const emitUserStatusToUsers = async ({
        userId,
        online,
    }) => {

        const impactedUsersRooms = await getImpactedUsersRoomId(userId);

        impactedUsersRooms
            .forEach(({ _id: roomId, members }) => {
                members
                    .filter((memberId) => String(memberId) !== String(userId))
                    .forEach((memberId) => {
                        console.count("Emitting userStatusChanged to");
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

        const currentUser =
            await User.findByIdAndUpdate(
                socket.userId,
                { socketId: socket.id, online: true, },
                { new: true }
            );

        if (!currentUser) {
            socket.disconnect();
            return;
        }

        socket.username = currentUser.username;

        socket.join(`user:${currentUser._id}`);

        await emitUserStatusToUsers({ userId: currentUser._id, online: true });

        socket.on("joinRoom", async ({ receiverId, roomId }) => {
            try {
                const senderId = socket.userId;
                const senderUsername = socket.username;
                if (!senderId || !senderUsername) return;

                let room = null;

                if (receiverId) {

                    const receiverUser = await User.findOne({ _id: receiverId })
                        .select(getUserProjection)
                        .lean();

                    if (!receiverUser) return;

                    const directRoomId = [senderUsername, receiverUser.username].sort().join("_");
                    room = await loadRoom(directRoomId);
                    if (!room) {
                        room = await Room.create({
                            roomId: directRoomId,
                            members: [senderId, receiverUser._id],
                            isGroup: false,
                        });
                        room = await loadRoom(directRoomId);
                        socket.emit("newChatStarted", room.members.find((member) => String(member._id) !== String(senderId)));
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
                        online: Boolean(otherUser?.online),
                    });
                }

            } catch (err) {
                console.error("Join Room Error:", err.message);
            }
        });

        socket.on("createGroup", async ({ groupName, members = [] }) => {
            try {
                const adminId = socket.userId;
                const adminUsername = socket.username;
                if (!adminId || !adminUsername) return;

                const memberIds = [adminId, ...members];
                if (!groupName?.trim() || memberIds.length < 2) return;

                const room = await Room.create({
                    roomId: `group_${randomUUID()}`,
                    isGroup: true,
                    name: groupName.trim(),
                    admin: adminId,
                    members: memberIds,
                });

                const populatedRoom = await loadRoom(room.roomId);

                socket.join(populatedRoom.roomId);

                socket.emit("roomJoined", {
                    admin: adminUsername,
                    roomId: populatedRoom.roomId,
                    isGroup: true,
                    name: populatedRoom.name,
                    members: populatedRoom.members,
                });

                await emitNewGroupCreatedToUsers(memberIds, populatedRoom);

            } catch (err) {
                console.error("Create Group Error:", err.message);
            }
        });

        socket.on("addMember", async ({ roomId, newMembers = [] }) => {
            try {

                const room = await Room.findOne({ roomId })
                    .populate("members", "name username online")
                    .populate("admin", "username")
                    .lean();
                if (!room) return;

                const adminUsername = socket.username;
                if (room.admin !== adminUsername || newMembers.length === 0) return;

                const memberDocs = await resolveUsersByUsernames(newMembers);
                const memberIds = memberDocs.map((member) => String(member._id));
                if (memberIds.length === 0) return;

                await Room.updateOne(
                    { roomId },
                    { $addToSet: { members: { $each: memberIds } } }
                );

                socket.emit("newMemberAdded");

                socket.emit("roomJoined", {
                    roomId,
                    isGroup: true,
                    name: room.name,
                    members: [...room.members, ...memberDocs],
                });

            } catch (err) {
                console.error("Create Group Error:", err.message);
            }
        });

        socket.on("removeMember", async ({ roomId, member }) => {
            try {

                const room = await Room.findOne({ roomId })
                    .populate("members", "name username online")
                    .populate("admin", "username")
                    .lean();
                if (!room) return;

                const adminUsername = socket.username;
                if (room.admin !== adminUsername || !member.trim()) return;

                const memberUser = await User.findOne({ username: member })
                    .select("_id username")
                    .lean();
                if (!memberUser?._id) return;

                await Room.updateOne(
                    { roomId },
                    { $pull: { members: memberUser._id } }
                );

                socket.emit("memberRemoved");

                await emitConversationListToUsers(
                    room.members
                        .map((roomMember) => roomMember._id)
                        .filter((roomMemberId) => String(roomMemberId) !== String(memberUser._id))
                );

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

                await emitConversationListToUsers(room.members);

            } catch (err) {
                console.error("Send Message Error:", err.message);
            }
        });

        socket.on("getMessages", async ({ roomId }) => {
            try {

                if (!roomId) return;

                const requester = socket.userId;
                if (!requester) return;

                const room = await Room.findOne({ roomId })
                    .select("members")
                    .lean();
                if (!room || !roomHasMember(room, requester)) return;

                const messages = await Message.find({ roomId })
                    .sort({ createdAt: 1 })
                    .populate("sender", "name username")
                    .lean();

                socket.emit("chatHistory", messages.map(serializeMessage));

            } catch (err) {
                console.error("Get Messages Error:", err.message);
            }
        });

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
