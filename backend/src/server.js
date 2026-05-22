const http = require("node:http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDb = require("./config/db");
const { setSocketServer } = require("./services/realtimeService");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDb();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:user", (userId) => socket.join(`user:${userId}`));
    socket.on("join:admin", () => socket.join("admins"));
  });

  setSocketServer(io);

  server.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
