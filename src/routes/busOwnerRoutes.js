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
  createTrip,
  getStudentsByDestination,
  getAllTrips,           // ✅ NEW
  getTripDetails ,        // ✅ NEW
  assignStudentToTrip,
  unassignStudentFromTrip
} = require('../controllers/busOwnerController');

// GET routes
router.get('/dashboard', getDashboard);
router.get('/dashboard/students-by-destination', getStudentsByDestination);
router.get('/dashboard/trips', getAllTrips);               // ✅ NEW route
router.get('/dashboard/trip/:id', getTripDetails);         // ✅ NEW route

// DELETE routes
router.delete('/dashboard/bus/:id', removeBus);
router.delete('/dashboard/destination/:id', removeDestination);
router.delete('/dashboard/driver/:id', removeDriver);
router.delete('/dashboard/student/:id', removeStudent);

// POST routes
router.post('/dashboard/bus', addBus);
router.post('/dashboard/destination', addDestination);
router.post('/dashboard/trip', createTrip);
router.post('/dashboard/assign-student', assignStudentToTrip);
router.post('/dashboard/unassign-student', unassignStudentFromTrip);

module.exports = router;
