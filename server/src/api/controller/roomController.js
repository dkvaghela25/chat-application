import Room from "../../models/Room.js";
import User from "../../models/User.js";

export const roomDetails = async (req, res) => {
    try {

        const { roomId } = req.params;

        const roomDetails = (await Room.findOne({ roomId })).toObject();
        const userNames = await User.find({ username: { $in: roomDetails.members } }, { name: 1, username: 1, _id: 0 })

        roomDetails["members"] = userNames;

        res.status(200).json({
            success: true,
            message: "Room details fetched successfully",
            roomDetails
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
