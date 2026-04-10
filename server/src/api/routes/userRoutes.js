import express from "express";
import { connectedUsers, search } from "../controller/userController.js";

const router = express.Router();

router.get("/search", search);
router.get("/connected_users", connectedUsers);

export default router;