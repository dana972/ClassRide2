const express = require('express');
const router = express.Router();

const { getDashboard, removeBus } = require('../controllers/busOwnerController');

// Route to get the dashboard
router.get('/dashboard', getDashboard);



module.exports = router;
