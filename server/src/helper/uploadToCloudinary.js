import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (buffer) => {
    return await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "chat-app/messages" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(buffer);
    });
};