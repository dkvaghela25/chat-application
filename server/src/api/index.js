import express from "express";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"
import roomRouter from "./routes/roomRoutes.js"
import messageRouter from "./routes/messageRoutes.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/room", roomRouter);
router.use("/message", messageRouter);

export default router;