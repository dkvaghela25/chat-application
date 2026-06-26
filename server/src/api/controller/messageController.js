import Message from "../../models/Message.js";
import { RequestInputError } from "../../helper/errors.js";
import { sendError } from "../../helper/sendError.js";
import { uploadToCloudinary } from "../../helper/uploadToCloudinary.js";
import { serializeMessage } from "../../helper/serializers.js";
import Room from "../../models/Room.js";
import { roomHasMember } from "../../helper/roomHasMembers.js";

export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId) throw new RequestInputError("Room ID is required", 400);

        const userId = req.userId;
        if (!userId) throw new RequestInputError("User not found", 404);

        const room = await Room.findOne({ roomId })
            .select("members removedMembers")
            .lean();
        if (!room || !roomHasMember({ room, userId })) throw new RequestInputError("Room not found or user is not a member", 404);

        let removedAtTime = room?.removedMembers?.find((member) => String(member.userId) === String(userId))?.removedAt || new Date();

        const messages = await Message.find({
            roomId,
            createdAt: {
                $lte: removedAtTime,
            }
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name username")
            .lean();

        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages: messages.map(serializeMessage),
        });

    } catch (err) {
        sendError(res, err);
        console.error("Get Messages Error:", err);
    }
};

export const search = async (req, res) => {
    try {
        const { searchInput, roomId } = req.query;

        if (!searchInput) {
            throw new RequestInputError("Search input is required", 400);
        }

        const messages = await Message.find({
            roomId,
            $or: [
                { text: { $regex: searchInput, $options: "i" } },
                { "monaco_editor.code": { $regex: searchInput, $options: "i" } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("sender", "name username")
            .lean();

        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages: messages.map(serializeMessage),
        });
    } catch (err) {
        sendError(res, err);
    }
};

export const uploadFile = async (req, res) => {
    try {
        const files = req.files;
        const MAX_SIZE = 2 * 1024 * 1024;
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                if (file.size > MAX_SIZE) throw new Error(`File ${file.originalname} exceeded file size of 2 MB.`);
                const result = await uploadToCloudinary(file.buffer);
                return {
                    url: result.secure_url,
                    name: file.originalname,
                    type: result.format || result.resource_type,
                    size: result.bytes,
                };
            })
        );

        res.json({
            success: true,
            files: uploadedFiles,
        });

    } catch (err) {
        console.error("Upload Error:", err);
        sendError(res, err);
    }
};
