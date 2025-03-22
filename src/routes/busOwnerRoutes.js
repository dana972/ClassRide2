const express = require('express');
const router = express.Router();

const {
  getDashboard,
  removeBus,
  removeDestination,
  removeDriver,
  removeStudent,
  addBus,
  addDestination,
  createTrip // ✅ add this import
} = require('../controllers/busOwnerController');

// GET dashboard
router.get('/dashboard', getDashboard);

// DELETE routes
router.delete('/dashboard/bus/:id', removeBus);
router.delete('/dashboard/destination/:id', removeDestination);
router.delete('/dashboard/driver/:id', removeDriver);
router.delete('/dashboard/student/:id', removeStudent); // ✅ New route

// POST routes
router.post('/dashboard/bus', addBus);
router.post('/dashboard/destination', addDestination);
router.post('/dashboard/trip', createTrip); // ✅ add this route

module.exports = router;
