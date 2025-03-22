const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const busOwnerRoutes = require("./src/routes/busOwnerRoutes");
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const studentDashboardRoute = require("./src/routes/studentDashboardRoute");
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

// Make user available to all EJS templates
app.use((req, res, next) => {
  res.locals.user = null;
  next();
});

// Routes
app.get("/", (req, res) => res.render("index"));
app.use("/api", authRoutes);
app.use("/owner", authenticateUser, busOwnerRoutes);
app.use("/student", studentDashboardRoute);
app.use("/", dashboardRoutes); // role-based dashboards

// ✅ Start server (standard Express way)
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
