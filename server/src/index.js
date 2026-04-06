import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { initSocket } from "./socket.js";
import { PORT } from "./config.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

const server = http.createServer(app);

// Socket init
initSocket(server); 

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});