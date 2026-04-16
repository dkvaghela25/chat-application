import axiosInstance from "../utils/axiosInstance";

export const searchMessage = async (searchInput, roomId) => {
    try {
        
        const response = await axiosInstance.get(`/message/search?searchInput=${searchInput}&roomId=${roomId}`);
        console.log("API Response:", response.data);

        if (!response.data.success) {
            throw new Error(response.data.message || "Search failed");
        }

        return response.data;
        
    } catch (error) {
        console.error("Search Error:", error);
        throw new Error("Search failed");
    }
};