import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        name: {
            type: String,
        },

        isGroup: {
            type: Boolean,
            default: false,
        },

        members: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },

    },
    { timestamps: true }
);

roomSchema.index({ members: 1 });

export default mongoose.model("Room", roomSchema);