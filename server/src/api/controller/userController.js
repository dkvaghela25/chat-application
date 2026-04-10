import User from "../../models/User.js";

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
