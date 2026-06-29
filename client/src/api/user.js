import axiosInstance from "../utils/axiosInstance";


export const fetchMe = async () => {
    try {
        const response = await axiosInstance.get(`/user/me`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404 || error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.reload();
        }
        throw new Error("Failed to fetch user details");
    }
};

export const fetchAllUser = async () => {
    try {

        const response = await axiosInstance.get(`/user/all`);

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

//         if (!response.data.success) {
//             throw new Error(response.data.message || "Search failed");
//         }

//         return response.data;

//     } catch (error) {
//         console.error("Search Error:", error);
//         throw new Error("Search failed");
//     }
// };

export const fetchConversationList = async () => {
    try {
        const response = await axiosInstance.get(`/user/conversation_list`);
        return response.data;
    } catch (error) {
        console.error("Fetch Conversation List Error:", error);
        throw new Error("Failed to fetch conversation list");
    }
};

export const fetchUserDetails = async (username) => {
    try {

        const response = await axiosInstance.get(`/user/user_details/${username}`);

        if (!response.data.success) {
            throw new Error(response.data.message || "Search failed");
        }

        return response.data;

    } catch (error) {
        console.error("Search Error:", error);
        throw new Error("Search failed");
    }
};
