const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");
const { getStudentDashboard } = require("../controllers/studentDashboardController");

router.get("/dashboard", authenticateUser, getStudentDashboard);

module.exports = router;
