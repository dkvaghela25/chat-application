import Room from "../../models/Room.js";
import User from "../../models/User.js";
import { RequestInputError } from "../../helper/errors.js";
import { sendError } from "../../helper/sendError.js";

export const allUsers = async (req, res) => {
    try {
        const users = await User.find({}, { name: 1, username: 1, _id: 0 }).lean();

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
            { name: 1, username: 1, _id: 0 }
        ).limit(20).lean(); // prevent heavy load

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