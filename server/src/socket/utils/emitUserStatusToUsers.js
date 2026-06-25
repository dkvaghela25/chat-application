import { getIoInstance } from "../index.js";
import { getImpactedUsersRoomId } from "./getImpactedUsersRoomId.js";

export const emitUserStatusToUsers = async ({
    userId,
    online,
}) => {

    const impactedUsersRooms = await getImpactedUsersRoomId(userId);
    const io = getIoInstance();

    impactedUsersRooms
        .forEach(({ roomId, members }) => {
            members
                .filter((memberId) => String(memberId) !== String(userId))
                .forEach((memberId) => {

                    io.to(`user:${memberId}`).emit("userStatusChanged", { roomId, online });
                });
        });
};
