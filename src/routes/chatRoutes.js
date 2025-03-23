const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");

// Routes
router.get("/chats/:phone", authenticateUser, chatController.getChatMessages);
router.get("/chats/history", authenticateUser, chatController.getChatHistory);

module.exports = router;
