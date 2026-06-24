import { sendError } from "../../helper/sendError.js";
import { RequestInputError } from "../../helper/errors.js";
import { serializeRoom } from "../../helper/serializers.js";
import Room from "../../models/Room.js";

export const roomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new RequestInputError("Room ID is required", 400);
    }

    const room = await Room.findOne({ roomId })
      .populate("members", "name username online")
      .lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room details fetched successfully",
      roomDetails: serializeRoom(room),
    });

  } catch (err) {
    sendError(res, err);
  }
};