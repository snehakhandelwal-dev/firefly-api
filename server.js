const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // You can replace with your frontend URL
    methods: ['GET', 'POST']
  }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // When user joins with userId
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`${userId} joined with socket ID: ${socket.id}`);
  });

  // Chat message handling
  socket.on('send-message', ({ senderId, receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive-message', {
        senderId,
        message
      });
    }
  });

  // Call initiation
  socket.on('call-user', ({ from, to, offer }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', { from, offer });
    }
  });

  // Answer call
  socket.on('answer-call', ({ from, to, answer }) => {
    const callerSocketId = onlineUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-answered', { from, answer });
    }
  });

  // ICE candidate exchange
  socket.on('ice-candidate', ({ to, candidate }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('ice-candidate', { candidate });
    }
  });

  // End call
  socket.on('end-call', ({ to }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-ended');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`${userId} disconnected`);
        break;
      }
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
