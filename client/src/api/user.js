import axiosInstance from "../utils/axiosInstance";

export const searchUser = async (searchInput) => {
    try {
        
        const response = await axiosInstance.get(`/user/search?searchInput=${searchInput}`);
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
