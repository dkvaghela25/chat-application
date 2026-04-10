import express from "express";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);

export default router;