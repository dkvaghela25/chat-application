import { emitToUser } from "../services/emitService.js";
import { getImpactedUsersRoomId } from "./getImpactedUsersRoomId.js";

export const emitUserStatusToUsers = async ({
    userId,
    online,
}) => {

    const impactedUsersRooms = await getImpactedUsersRoomId(userId);

    impactedUsersRooms
        .forEach(({ roomId, members }) => {
            members
                .filter((memberId) => String(memberId) !== String(userId))
                .forEach((memberId) => {
                    emitToUser(memberId, "userStatusChanged", { roomId, online });
                });
        });
};
