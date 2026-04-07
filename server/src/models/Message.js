import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    attachments: [
      {
        type: {
          type: String, // "image", "video", "file"
        },
        name: {
          type: String,
        },
        size: {
          type: Number,
        },
        url: {
          type: String,
          default: "",
        }
      }
    ],

    room: {
      type: String,
      default: "global",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);