import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        admin: {
            type: String,
        },

        roomId: {
            type: String,
            required: true,
        },

        name: {
            type: String,
        },

        isGroup: {
            type: Boolean,
            default: false,
        },

        members: {
            type: [String]
        },

    },
    { timestamps: true }
);

export default mongoose.model("Room", roomSchema);