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

export const uploadFiles = async (files) => {
    try {

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });

        const response = await axiosInstance.post(
            `/message/upload_file`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        console.log("API Response:", response.data);

        if (!response.data.success) {
            throw new Error(response.data.message || "Upload failed");
        }

        return response.data;

    } catch (error) {
        console.error("Upload Error:", error);
        throw new Error("Upload failed");
    }
};