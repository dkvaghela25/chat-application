import { Server } from "socket.io";
import { randomUUID } from "crypto";
import User from "./models/User.js";
import Message from "./models/Message.js";
import Room from "./models/Room.js";
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

    const resolveUsersByUsernames = async (usernames = []) => {
        const uniqueUsernames = [...new Set(usernames.filter(Boolean))];
        if (uniqueUsernames.length === 0) return [];

        return User.find({ username: { $in: uniqueUsernames } })
            .select(getUserProjection)
            .lean();
    };

    const loadRoom = (roomId) => Room.findOne({ roomId })
        .populate("members", "name username online")
        .populate("admin", "username")
        .lean();

    const buildConversationList = async (currentUser) => {
        if (!currentUser?._id) return [];

        const rooms = await Room.find({ members: currentUser._id })
            .sort({ updatedAt: -1 })
            .populate("members", "name username online")
            .populate("admin", "username")
            .lean();

        const directUserIds = [...new Set(
            rooms
                .filter((room) => !room.isGroup)
                .flatMap((room) => room.members)
                .map((member) => String(member._id))
                .filter((memberId) => {
                    return memberId !== String(currentUser._id);
                })
        )];

        const directUsers = await User.find({ _id: { $in: directUserIds } })
            .select("name username online")
            .lean();
        const directUserMap = new Map(directUsers.map((user) => [String(user._id), user]));

        const finalConversationList = rooms
            .map((room) => {
                if (room.isGroup) {
                    return serializeRoom(room, currentUser._id);
                }

                const otherUserId = room.members
                    .map((member) => String(member._id))
                    .find((memberId) => memberId !== String(currentUser._id));

                if (!otherUserId) return null;

                const otherUser = directUserMap.get(otherUserId);
                return {
                    _id: room._id,
                    roomId: room.roomId,
                    isGroup: false,
                    name: otherUser?.name || otherUser?.username || otherUserId,
                    username: otherUser?.username || otherUserId,
                    online: Boolean(otherUser?.online),
                };
            })
            .filter(Boolean)

        return finalConversationList;
    };

    const emitConversationListToUser = async (user) => {
        if (!user?.socketId) return;

        const conversationList = await buildConversationList(user);
        io.to(user.socketId).emit("conversationList", conversationList);
    };

    const emitConversationListToUsers = async (userIds = []) => {
        const uniqueUserIds = [...new Set(userIds.map((userId) => String(userId)).filter(Boolean))];
        if (uniqueUserIds.length === 0) return;

        const users = await User.find({ _id: { $in: uniqueUserIds } })
            .select(getUserProjection)
            .lean();

        await Promise.all(users.map((user) => emitConversationListToUser(user)));
    };

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        socket.on("join", async (username) => {
            try {
                const currentUser = await User.findOneAndUpdate(
                    { username },
                    { socketId: socket.id, online: true },
                    { new: true }
                )
                    .select(getUserProjection)
                    .lean();

                if (!currentUser?._id) return;

                socket.username = currentUser.username;
                socket.userId = currentUser._id;

                const rooms = await Room.find({ members: currentUser._id })
                    .select("members")
                    .lean();

                const impactedUsers = [...new Set(rooms.flatMap((room) => room.members.map((member) => String(member))))];
                await emitConversationListToUsers(impactedUsers);

            } catch (err) {
                console.error("Join Error:", err.message);
            }
        });

        socket.on("joinRoom", async ({ receiver, roomId }) => {
            try {
                const senderId = socket.userId;
                const senderUsername = socket.username;
                if (!senderId || !senderUsername) return;

                let room = null;

                if (receiver) {
                    const receiverUser = await User.findOne({ username: receiver })
                        .select(getUserProjection)
                        .lean();

                    if (!receiverUser?._id) return;

                    const directRoomId = senderUsername === receiver ? senderUsername : [senderUsername, receiver].sort().join("_");
                    room = await loadRoom(directRoomId);
                    if (!room) {
                        room = await Room.create({
                            roomId: directRoomId,
                            members: senderUsername === receiver ? [senderId] : [senderId, receiverUser._id],
                            isGroup: false,
                        });
                        room = await loadRoom(directRoomId);
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

                await emitConversationListToUsers(room.members.map((member) => member._id ?? member));

            } catch (err) {
                console.error("Join Room Error:", err.message);
            }
        });

        socket.on("createGroup", async ({ groupName, members = [] }) => {
            try {
                const adminId = socket.userId;
                const adminUsername = socket.username;
                if (!adminId || !adminUsername) return;

                const memberDocs = await resolveUsersByUsernames([adminUsername, ...members]);
                const memberIds = [...new Set(memberDocs.map((member) => String(member._id)))];
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

                await emitConversationListToUsers(memberIds);

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

                await emitConversationListToUsers([...room.members.map((member) => member._id), ...memberIds]);

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

                console.log("🚀 ~ initSocket ~ serializeMessage(populatedMessage):", serializeMessage(populatedMessage))
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
                    { socketId: socket.id },
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

                await emitConversationListToUsers(impactedUsers);

            } catch (err) {
                console.error("Disconnect Error:", err.message);
            }
        });

    });

};