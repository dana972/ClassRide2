const express = require('express');
const router = express.Router();

const { getDashboard, deleteBus, deleteDestination, deleteDriver } = require('../controllers/busOwnerController');

router.get('/dashboard', getDashboard);
router.delete('/buses/:id', deleteBus);
router.delete('/destinations/:id', deleteDestination);
router.delete('/drivers/:id', deleteDriver);


module.exports = router;