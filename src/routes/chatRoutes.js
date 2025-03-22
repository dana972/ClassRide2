const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");

// Protected chat page
router.get("/chats", authenticateUser, (req, res) => {
  res.render("chat", {
    user: req.user, // Pass user info to EJS
  });
});

module.exports = router;
