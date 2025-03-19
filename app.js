const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const busOwnerRoutes = require("./src/routes/busOwnerRoutes");
const authRoutes = require("./src/routes/authRoutes");
const authenticateUser = require("./src/middlewares/authMiddleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "frontend")));
app.use(cookieParser());

// Make user available to all EJS templates (if needed)
app.use((req, res, next) => {
  res.locals.user = null; // You can populate this from JWT if needed
  next();
});

// Home Route
app.get("/", (req, res) => {
  res.render("index");
});

// Auth routes (signup, login, logout, check-auth)
app.use("/api", authRoutes);

// Protect owner dashboard routes
app.use("/owner", authenticateUser, busOwnerRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
