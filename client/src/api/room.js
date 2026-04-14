import axiosInstance from "../utils/axiosInstance";

export const fetchGroupDetails = async (roomId) => {
    try {

        const response = await axiosInstance.get(`/room/room_details/${roomId}`);
        console.log("API Response:", response.data);

        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to fetch group details");
        }

        return response.data;

    } catch (error) {
        console.error("Failed to fetch group details:", error);
        throw new Error("Failed to fetch group details");
    }
};
