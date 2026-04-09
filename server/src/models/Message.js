import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {

    sender: {
      type: String,
      required: true,
    },

    receiver: {
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
          type: String,
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

    monaco_editor: {
      language: {
        type: String,
      },
      code: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);