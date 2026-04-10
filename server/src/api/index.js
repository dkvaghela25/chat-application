import express from "express";
import authRouter from "./routes/authRoutes.js"

const router = express.Router();

router.use("/auth", authRouter);

export default router;