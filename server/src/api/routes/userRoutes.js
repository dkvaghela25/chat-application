import express from "express";
import { allUsers, connectedUsers, conversationList, me, search, userDetails } from "../controller/userController.js";

const router = express.Router();

router.get("/me", me);
router.get("/all", allUsers);
router.get("/search", search);
router.get("/connected_users", connectedUsers);
router.get("/user_details/:username", userDetails);
router.get("/conversation_list", conversationList);

export default router;