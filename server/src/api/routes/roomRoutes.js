import express from "express";
import { addMember, createGroup, removeMember, roomDetails } from "../controller/roomController.js";

const router = express.Router();

router.get("/room_details/:roomId", roomDetails);
router.post("/create_group", createGroup);
router.put("/add_members/:roomId", addMember);
router.delete("/remove_member/:roomId", removeMember);

export default router;