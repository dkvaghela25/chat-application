import { sendError } from "../../helper/sendError.js";
import { RequestInputError } from "../../helper/errors.js";
import { serializeRoom } from "../../helper/serializers.js";
import Room from "../../models/Room.js";
import User from "../../models/User.js";
import Message from "../../models/Message.js";
import { randomUUID } from "crypto";
import { emitToUser } from "../../socket/services/emitService.js";

export const roomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new RequestInputError("Room ID is required", 400);
    }

    const room = await Room.findOne({ roomId })
      .populate("members", "name username online")
      .lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room details fetched successfully",
      roomDetails: serializeRoom(room),
    });

  } catch (err) {
    sendError(res, err);
  }
};

export const createGroup = async (req, res) => {
  try {
    const adminId = req.userId;
    const { groupName, memberIds = [] } = req.body;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !groupName?.trim() ||
      !Array.isArray(memberIds) ||
      memberIds.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Group name and at least 2 members are required",
      });
    }

    const members = [...new Set([adminId, ...memberIds])];

    const [room, admin, memberDocs] = await Promise.all([
      Room.create({
        roomId: `group_${randomUUID()}`,
        isGroup: true,
        name: groupName.trim(),
        adminId,
        members,
      }),

      User.findById(adminId).select("name").lean(),

      User.find({
        _id: { $in: memberIds },
      })
        .select("name")
        .lean(),
    ]);

    const populatedRoom = await Room.findById(room._id)
      .populate("members", "name username online")
      .lean();

    const adminName = admin?.name || "Admin";
    const now = Date.now();
    const base = { roomId: room.roomId, sender: adminId, type: "notification", createdAt: new Date(now) };
    const notifications = [
      { ...base, text: `${adminName} created the group "${room.name}"`, },
      ...memberDocs.map(({ name }, index) => ({ ...base, text: `${adminName} added ${name} to the group`, createdAt: new Date(now + index + 1) })),
    ];
    await Message.insertMany(notifications);

    memberIds.forEach((memberId) => {
      emitToUser(memberId, "newGroupCreated", populatedRoom);
    });

    emitToUser(adminId, "roomJoined", {
      adminId,
      roomId: populatedRoom.roomId,
      isGroup: true,
      name: populatedRoom.name,
      members: populatedRoom.members,
    });

    emitToUser(adminId, "newGroupCreated", populatedRoom);

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      roomId: room.roomId,
      room: populatedRoom,
    });
  } catch (error) {
    console.error("Create Group Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create group",
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { newMemberIds = [] } = req.body;
    const adminUserId = req.userId;

    if (!newMemberIds.length) {
      return res.status(400).json({
        success: false,
        message: "No members provided",
      });
    }

    const room = await Room.findOne(
      { roomId },
      { adminId: 1, members: 1, roomId: 1, removedMembers: 1 }
    ).lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (String(room.adminId) !== adminUserId) {
      return res.status(403).json({
        success: false,
        message: "Only admin can add members",
      });
    }

    const uniqueUserIds = [...new Set(newMemberIds.filter(Boolean))];

    const users = await User.find({
      _id: { $in: uniqueUserIds },
    })
      .select("name username online")
      .lean();

    const existingMemberSet = new Set(
      room.members.map(String)
    );

    const filteredNewMembers = users.filter(
      (user) => !existingMemberSet.has(String(user._id))
    );

    if (!filteredNewMembers.length) {
      return res.status(200).json({
        success: true,
        message: "All users are already members",
      });
    }

    const filteredNewMemberIds = filteredNewMembers.map(
      ({ _id }) => _id
    );

    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      {
        $addToSet: {
          members: { $each: filteredNewMemberIds },
        },
        $pull: {
          removedMembers: {
            userId: { $in: filteredNewMemberIds },
          },
        },
      },
      { new: true }
    )
      .populate("members", "name username online")
      .lean();

    for (const memberId of [...room.members, ...filteredNewMemberIds]) {
      emitToUser(String(memberId), "newMembersAdded", {
        roomId,
        newMembers: filteredNewMembers,
      });
    }



    const [adminName] = await User.distinct("name", {
      _id: room.adminId,
    });

    for (const member of filteredNewMembers) {
      await Message.create({
        roomId: room.roomId,
        sender: room.adminId,
        text: `${adminName} added ${member.name} to the group`,
        type: "notification",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Members added successfully",
      newMembers: filteredNewMembers,
    });
  } catch (err) {
    console.error("Add Member Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to add members",
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { memberId } = req.body;

    if (!roomId) throw new Error("Room ID is required");
    if (!memberId?.trim()) throw new Error("Member's userId is required");

    const room = await Room.findOne({ roomId })
      .populate("members", "name username online")
      .lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const adminUserId = req.userId;

    if (String(room.adminId) !== adminUserId) {
      return res.status(403).json({
        success: false,
        message: "Only admin can remove members.",
      });
    }

    const memberExists = room.members.some(
      (member) => String(member._id) === memberId
    );

    if (!memberExists) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this group.",
      });
    }

    const memberUser = await User.findById(memberId)
      .select("_id name username")
      .lean();

    if (!memberUser) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    await Room.updateOne(
      { roomId },
      {
        $pull: {
          members: memberId,
        },
        $push: {
          removedMembers: {
            userId: memberId,
            removedAt: new Date(),
          },
        },
      }
    );

    const [adminName] = await User.distinct("name", {
      _id: adminUserId,
    });

    await Message.create({
      roomId,
      sender: room.adminId,
      text: `${adminName} removed ${memberUser.name} from the group`,
      type: "notification",
    });

    await emitToUser(adminUserId, "memberRemoved", { roomId, memberId });
    await emitToUser(memberId, "removedFromGroup", { roomId, removedAt: new Date() });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully.",
    });
  } catch (err) {
    console.error("Remove Member Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};