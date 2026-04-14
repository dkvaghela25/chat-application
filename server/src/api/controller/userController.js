import Room from "../../models/Room.js";
import User from "../../models/User.js";

export const allUsers = async (req, res) => {
    try {

        const users = await User.find();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const search = async (req, res) => {
    try {

        const { searchInput } = req.query;

        console.log("searchInput", searchInput)

        const users = await User.find({ name: { $regex: searchInput, $options: 'i' } });

        console.log("users", users)

        res.status(201).json({
            success: true,
            message: "Users fetched successfully",
            users
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const connectedUsers = async (req, res) => {
    try {

        const { currentUser } = req.query;

        const rooms = await Room.find({ members: currentUser });

        const users = await User.find({
            username: {
                $in: [... new Set(rooms.flatMap(room => room.members))]
            }
        });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users
        });


    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const userDetails = async (req, res) => {
    try {

        const { username } = req.params;

        const userDetails = await User.findOne({ username });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            userDetails
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
