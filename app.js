const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
require("dotenv").config();

// 🧠 Custom modules
const db = require("./src/config/db"); // PostgreSQL setup (pg.Pool instance)
const authenticateUser = require("./src/middlewares/authMiddleware");
const busOwnerRoutes = require("./src/routes/busOwnerRoutes");
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const studentDashboardRoute = require("./src/routes/studentDashboardRoute");
const chatRoutes = require("./src/routes/chatRoutes");

// App setup
const app = express();
const server = http.createServer(app); // For Socket.IO
const io = socketIo(server);

// Port
const PORT = process.env.PORT || 5000;

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));

// Middleware stack
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "frontend")));
app.use(cookieParser());

// ✅ Globally available user in all EJS templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.get("/", (req, res) => res.render("index"));
app.use("/api", authRoutes); // login/register

// Protected routes
app.use("/owner", authenticateUser, busOwnerRoutes);
app.use("/student", authenticateUser, studentDashboardRoute);
app.use("/", authenticateUser, dashboardRoutes);
app.use("/", chatRoutes); // or use "/chats" if you want to prefix all chat routes

// ✅ Socket.IO logic for private 1-on-1 chat
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Join user’s personal room using phone number
  socket.on("join", (phone) => {
    socket.join(phone);
    console.log(`📲 ${phone} joined their chat room`);
  });

  // Handle private messages
  socket.on("privateMessage", async ({ from, to, message }) => {
    console.log(`💬 ${from} ➡️ ${to}: ${message}`);

    try {
      // Save message to database
      await db.query(
        `INSERT INTO messages (sender_phone, receiver_phone, message) VALUES ($1, $2, $3)`,
        [from, to, message]
      );

      // Emit to receiver’s room
      io.to(to).emit("privateMessage", { from, message });
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
