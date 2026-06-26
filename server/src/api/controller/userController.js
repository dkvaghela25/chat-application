import Room from "../../models/Room.js";
import User from "../../models/User.js";
import { RequestInputError } from "../../helper/errors.js";
import { sendError } from "../../helper/sendError.js";
import { serializeRoom } from "../../helper/serializers.js";

export const me = async (req, res) => {
    try {
        const { userId } = req;
        if (!userId) {
            throw new RequestInputError("User ID is required", 400);
        }
        const user = await User.findById(userId, { name: 1, username: 1, email: 1 }).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            userDetails: user,
        });
    }
    catch (err) {
        sendError(res, err);
    }
};

export const allUsers = async (req, res) => {
    try {
        const users = await User.find({}, { name: 1, username: 1 }).lean();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users,
        });
    } catch (err) {
        sendError(res, err);
    }
};

export const search = async (req, res) => {
    try {
        const { searchInput } = req.query;

        if (!searchInput) {
            throw new RequestInputError("Search input is required", 400);
        }

        const users = await User.find(
            {
                name: { $regex: searchInput, $options: "i" },
            },
            { name: 1, username: 1 }
        ).lean();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users,
        });
    } catch (err) {
        sendError(res, err);
    }
};

export const connectedUsers = async (req, res) => {
    try {
        const { currentUser } = req.query;

        if (!currentUser) {
            throw new RequestInputError("Current user is required", 400);
        }

        const user = await User.findOne({ username: currentUser })
            .select("_id username")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const rooms = await Room.find({ members: user._id })
            .select("members")
            .lean();

        const uniqueUsernames = [
            ...new Set(rooms.flatMap((room) => room.members)),
        ]
            .map((member) => String(member))
            .filter((memberId) => memberId !== String(user._id));

        const users = await User.find(
            { _id: { $in: uniqueUsernames } },
            { name: 1, username: 1, _id: 0 }
        ).lean();

        res.status(200).json({
            success: true,
            message: "Connected users fetched successfully",
            users,
        });
    } catch (err) {
        sendError(res, err);
    }
};

export const userDetails = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            throw new RequestInputError("Username is required", 400);
        }

        const user = await User.findOne(
            { username },
            { name: 1, username: 1, email: 1, createdAt: 1 }
        ).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            userDetails: user,
        });
    } catch (err) {
        sendError(res, err);
    }
};

export const conversationList = async (req, res) => {
    try {
        const { userId } = req;
        if (!userId) return [];

        const rooms = await Room.find({
            $or: [
                // Active member in any room
                { members: userId },

                // Removed member only for group chats
                {
                    roomId: /^group_/,
                    "removedMembers.userId": userId,
                },
            ],
        })
            .sort({ updatedAt: -1 })
            .populate("members", "name username online")
            .lean();

        const directUserIds = [...new Set(
            rooms
                .filter((room) => !room.isGroup)
                .flatMap((room) => room.members)
                .map((member) => String(member._id))
                .filter((memberId) => memberId !== String(userId))
        )];

        const directUsers = await User.find({
            _id: { $in: directUserIds },
        })
            .select("name username online")
            .lean();

        const directUserMap = new Map(
            directUsers.map((user) => [String(user._id), user])
        );

        const finalConversationList = rooms
            .map((room) => {
                const isRemoved =
                    room.roomId.startsWith("group_") &&
                    room.removedMembers?.some(
                        (member) => String(member.userId) === String(userId)
                    );

                if (room.isGroup) {
                    return {
                        ...serializeRoom(room, userId),
                        isRemoved,
                    };
                }

                const otherUserId = room.members
                    .map((member) => String(member._id))
                    .find((memberId) => memberId !== String(userId));

                if (!otherUserId) return null;

                const otherUser = directUserMap.get(otherUserId);

                return {
                    _id: room._id,
                    roomId: room.roomId,
                    isGroup: false,
                    isRemoved: false,
                    name: otherUser?.name || otherUser?.username,
                    userId: otherUserId,
                    username: otherUser?.username || otherUserId,
                    online: Boolean(otherUser?.online),
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            message: "Conversation list fetched successfully",
            conversationList: finalConversationList,
        });

    } catch (err) {
        sendError(res, err);
    }
};