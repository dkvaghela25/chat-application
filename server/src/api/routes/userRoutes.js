import express from "express";
import { allUsers, connectedUsers, search, userDetails } from "../controller/userController.js";

const router = express.Router();

router.get("/all", allUsers);
router.get("/search", search);
router.get("/connected_users", connectedUsers);
router.get("/user_details/:username", userDetails);

export default router;