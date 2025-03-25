// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const isAuthenticated = require('../middlewares/authMiddleware'); // ✅ Fix here

// GET /chatbot – serve chatbot UI
router.get('/', isAuthenticated, (req, res) => {
  res.render('chatbot');
});

// POST endpoints
router.post('/find-buses', isAuthenticated, chatbotController.findBuses);
router.post('/apply-to-bus', isAuthenticated, chatbotController.applyToBus);

module.exports = router;
