// dashboardRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { getDashboard } = require("../controllers/dashboardController");

// Protected route for the owner dashboard (now matches /owner/dashboard)
router.get("/dashboard", verifyToken, getDashboard);

module.exports = router;
