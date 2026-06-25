import axiosInstance from "../utils/axiosInstance";

export const fetchGroupDetails = async (roomId) => {
    try {

        const response = await axiosInstance.get(`/room/room_details/${roomId}`);

        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to fetch group details");
        }

        return response.data;

    } catch (error) {
        console.error("Failed to fetch group details:", error);
        throw new Error("Failed to fetch group details");
    }
};

export const createNewGroup = async (groupName, memberIds) => {
    try {
        const response = await axiosInstance.post("/room/create_group", { groupName, memberIds });
        return response.data;
    } catch (error) {
        console.error("Failed to create group:", error);
        throw new Error("Failed to create group");
    }
};

export const addMembersToExistingGroup = async (roomId, newMemberIds) => {
    try {
        const response = await axiosInstance.put(`/room/add_members/${roomId}`, { newMemberIds });
        return response.data;
    } catch (error) {
        console.error("Failed to add members to group:", error);
        throw new Error("Failed to add members to group");
    }
};

export const removeMemberFromGroup = async (roomId, memberId) => {
    try {
        const response = await axiosInstance.delete(`/room/remove_member/${roomId}`, { data: { memberId } });
        return response.data;
    } catch (error) {
        console.error("Failed to remove member from group:", error);
        throw new Error("Failed to remove member from group");
    }
};

