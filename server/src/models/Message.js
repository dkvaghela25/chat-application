import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roomId: {
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
          default: "this_is_temporary_url",
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

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export default mongoose.model("Message", messageSchema);