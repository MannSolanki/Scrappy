const express = require('express');
const router = express.Router();
const { getPricingData } = require('../controllers/pricingController');
const { protect } = require('../middleware/auth'); 

router.get('/', protect, getPricingData);

module.exports = router;
