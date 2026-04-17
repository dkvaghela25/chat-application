import express from "express";
import { search, uploadFile } from "../controller/messageController.js";
import multer from "multer";

// memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/search", search);
router.post("/upload_file", upload.array("files"), uploadFile);

export default router;