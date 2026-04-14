import express from "express";
import { roomDetails } from "../controller/roomController.js";

const router = express.Router();

router.get("/room_details/:roomId", roomDetails);

export default router;