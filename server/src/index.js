import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import apiRouter from "./api/index.js";
import { initializeSocket } from "./socket/index.js";
import { socketManager } from "./socket/socketManager.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

const server = http.createServer(app);

const io = initializeSocket(server);
socketManager(io);

app.use('/api', apiRouter);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});