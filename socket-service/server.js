const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room: user_${userId}`);
    }
  });

  socket.on("disconnect", () => {
    // console.log("Client disconnected:", socket.id);
  });
});

app.post("/publish", (req, res) => {
  const { user_id, user_ids, notification, notifications, event, data } = req.body;

  console.log("Received publish request:", req.body);

  if (event) {
    io.emit(event, data);
    console.log(`Broadcasted event: ${event}`);
    return res.status(200).json({ success: true });
  }

  if (notifications && Array.isArray(notifications)) {
    notifications.forEach((item) => {
      if (item.user_id && item.notification) {
        io.to(`user_${item.user_id}`).emit("notification", item.notification);
        console.log(`Emitted notification to user_${item.user_id}`);
      }
    });
  } else if (user_ids && Array.isArray(user_ids) && notification) {
    user_ids.forEach((id) => {
      io.to(`user_${id}`).emit("notification", notification);
      console.log(`Emitted notification to user_${id}`);
    });
  } else if (user_id && notification) {
    io.to(`user_${user_id}`).emit("notification", notification);
    console.log(`Emitted notification to user_${user_id}`);
  } else {
    return res.status(400).json({ error: "Invalid payload parameters." });
  }

  return res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.IO service running on port ${PORT}`);
});
