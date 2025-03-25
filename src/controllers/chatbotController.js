// controllers/chatbotController.js

const geocodeAddress = require('../utils/geocode'); // function to convert address to lat/lng
const Bus = require('../models/Bus'); // assuming you have a Bus model
const JoinRequest = require('../models/JoinRequest'); // student-bus join requests
const { calculateDistance } = require('../utils/geoUtils'); // Haversine formula

// Max distance (in km) between student home and bus route to consider a match
const MAX_DISTANCE_KM = 3;

exports.findBuses = async (req, res) => {
  try {
    const { home, university } = req.body;

    // Convert home to coordinates
    const studentCoords = await geocodeAddress(home); // returns { lat, lng }

    // Fetch all buses whose destination includes the selected university
    const buses = await Bus.find({ destinationUniversity: university });

    const matchingBuses = buses.filter(bus => {
      return bus.route.some(point => {
        const distance = calculateDistance(studentCoords, point); // Haversine formula
        return distance <= MAX_DISTANCE_KM;
      });
    });

    // Prepare response
    const results = matchingBuses.map(bus => ({
      id: bus._id,
      ownerName: bus.ownerName,
      route: bus.route.map(p => p.name) // assuming route has { name, lat, lng }
    }));

    res.json({ buses: results });
  } catch (error) {
    console.error('Error finding buses:', error);
    res.status(500).json({ error: 'Failed to find buses' });
  }
};

exports.applyToBus = async (req, res) => {
  try {
    const studentId = req.user.id; // assuming you're using auth middleware
    const { busId } = req.body;

    const existingRequest = await JoinRequest.findOne({ student: studentId, bus: busId });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Already applied to this bus.' });
    }

    const request = new JoinRequest({
      student: studentId,
      bus: busId,
      status: 'pending'
    });

    await request.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error applying to bus:', error);
    res.status(500).json({ success: false, message: 'Error applying to bus' });
  }
};
