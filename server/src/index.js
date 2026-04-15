import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { initSocket } from "./socket.js";
import { connectDB } from "./db.js";
import apiRouter from "./api/index.js";

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

// Socket init
initSocket(server);

app.use('/api', apiRouter);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});