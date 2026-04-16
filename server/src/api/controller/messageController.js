import Message from "../../models/Message.js";
import { RequestInputError } from "../../helper/errors.js";
import { sendError } from "../../helper/sendError.js";

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
        }).limit(20);

        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages,
        });
    } catch (err) {
        sendError(res, err);
    }
};
