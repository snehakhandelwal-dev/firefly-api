require('dotenv').config();
const http = require("http");
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("socketio", io);
app.use(express.json());
app.use(cors());
require('./src/config/db');

const userRoutes = require("./src/routes/routes");
app.use("/", userRoutes);

io.on('connection', (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join-room", (userId) => {
    socket.join(userId);
    console.log(`🔗 User ${userId} joined room`);
  });

  socket.on("send-message", (data) => {
    const { receiverId, senderId, fullName, message, chatId } = data;
    socket.to(receiverId).emit("receive-message", data);
    socket.to(receiverId).emit("notification", { senderId, fullName, message, chatId });
  });

  socket.on("typing", ({ to, from, content }) => {
    socket.to(to).emit("typing", { from, content });
  });

  // Call logic
  socket.on("call-user", ({ to, offer, isVideo, from }) => {
    socket.to(to).emit("incoming-call", { from, offer, isVideo });
  });

  socket.on("make-answer", ({ to, answer, from }) => {
    socket.to(to).emit("call-answer", { from, answer });
  });

  socket.on("ice-candidate", ({ to, candidate, from }) => {
    socket.to(to).emit("ice-candidate", { from, candidate });
  });

  socket.on("end-call", ({ to }) => {
    socket.to(to).emit("call-ended");
  });

  socket.on('disconnect', () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});