import axios from 'axios';
import { toast } from "react-toastify"

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

axiosInstance.interceptors.response.use(
    (response) => {
        // if (response.data?.message) {
        //     toast.success(response.data.message);
        // }
        return response;
    },
    (error) => {
        const message =
            error.response?.data?.message || "Something went wrong";

        toast.error(message);

        return Promise.reject(error);
    }
);

export default axiosInstance;