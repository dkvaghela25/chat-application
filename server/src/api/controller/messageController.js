import Message from "../../models/Message.js";
import { RequestInputError } from "../../helper/errors.js";
import { sendError } from "../../helper/sendError.js";
import { uploadToCloudinary } from "../../helper/uploadToCloudinary.js";

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


export const uploadFile = async (req, res) => {
    try {
        const files = req.files;

        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer);
                console.log("result...................................", result);
                return {
                    url: result.secure_url,
                    public_id: result.public_id,
                    name: file.originalname,
                    type: result.resource_type,
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
        res.status(500).json({ success: false });
    }
}
