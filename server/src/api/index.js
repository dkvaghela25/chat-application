import express from "express";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"
import roomRouter from "./routes/roomRoutes.js"
import messageRouter from "./routes/messageRoutes.js"
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", protect, userRouter);
router.use("/room", protect, roomRouter);
router.use("/message", protect, messageRouter);

export default router;