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

// Store mapping of userId to socket.id
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join-room", (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    console.log(`🔗 User ${userId} joined room`);
  });

  socket.on("send-message", (data) => {
    const { receiverId, senderId, fullName, message, chatId } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", data);
      io.to(receiverSocketId).emit("notification", { senderId, fullName, message, chatId });
    }
  });

  socket.on("typing", ({ to, from, content }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from, content });
    }
  });

  // Call logic
  socket.on("call-user", ({ to, offer, isVideo, from }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", { from, offer, isVideo });
    }
  });

  socket.on("make-answer", ({ to, answer, from }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-answer", { from, answer });
    }
  });

  socket.on("ice-candidate", ({ to, candidate, from }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", { from, candidate });
    }
  });

  socket.on("end-call", ({ to }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended");
    }
  });

  socket.on('disconnect', () => {
    console.log("❌ User disconnected:", socket.id);
    for (let [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
