import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify"

export const registerUser = async (userData) => {
    try {

        const response = await axiosInstance.post(
            "/auth/register",
            userData
        );
        console.log("API Response:", response.data);

        if (!response.data.success) {
            throw new Error(response.data.message || "Registration failed");
        }

        return response.data;

    } catch (error) {
        console.error("Registration Error:", error);
        throw new Error("Registration failed");
    }
};

export const loginUser = async (userData) => {
    try {

        const response = await axiosInstance.post(
            "/auth/login",
            userData
        );
        console.log("API Response:", response.data);

        if (!response.data.success) {
            toast.error(response.data.message || "Login failed")
            throw new Error(response.data.message || "Login failed");
        }

        return response.data;

    } catch (error) {
        console.error("Login Error:", error);
        throw new Error("Login failed");
    }
};