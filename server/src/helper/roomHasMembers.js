export const roomHasMember = ({ room, userId, includeRemoved = true }) =>
    Boolean(
        room?.members?.some((member) => String(member?._id ?? member) === String(userId))
        || (includeRemoved && room?.removedMembers?.some((member) => String(member?.userId) === String(userId)))
    );