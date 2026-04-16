import { sendError } from "../../helper/sendError.js";

export const roomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new RequestInputError("Room ID is required", 400);
    }

    const room = await Room.aggregate([
      { $match: { roomId } },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "username",
          as: "members",
          pipeline: [
            {
              $project: { _id: 0, name: 1, username: 1 },
            },
          ],
        },
      },
    ]);

    if (!room.length) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room details fetched successfully",
      roomDetails: room[0],
    });

  } catch (err) {
    sendError(res, err);
  }
};