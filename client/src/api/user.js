import axiosInstance from "../utils/axiosInstance";


export const fetchAllUser = async () => {
    try {
        
        const response = await axiosInstance.get(`/user/all`);
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

// export const connectedUsers = async (currentUser) => {
//     try {
        
//         const response = await axiosInstance.get(`/user/connected_users?currentUser=${currentUser}`);
//         console.log("API Response:", response.data);

//         if (!response.data.success) {
//             throw new Error(response.data.message || "Search failed");
//         }

//         return response.data;
        
//     } catch (error) {
//         console.error("Search Error:", error);
//         throw new Error("Search failed");
//     }
// };

export const fetchUserDetails = async (username) => {
    try {
        
        const response = await axiosInstance.get(`/user/user_details/${username}`);
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
