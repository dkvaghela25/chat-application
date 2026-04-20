import { toast } from "react-toastify";
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

        const MAX_SIZE = 2 * 1024 * 1024;

        const formData = new FormData();
        files.forEach(file => {
            if(file.size > MAX_SIZE) throw new Error(`File ${file.name} exceeded file size of 2 MB.`)
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
        toast.error(error.message);
        throw new Error("Upload failed");
    }
};