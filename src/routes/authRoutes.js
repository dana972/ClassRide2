const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Signup Route
router.post("/signup", authController.signup);

// Login Route
router.post("/login", authController.login);

// Protected Route Example
router.get("/protected", authController.verifyToken, authController.protectedRoute);

module.exports = router;
