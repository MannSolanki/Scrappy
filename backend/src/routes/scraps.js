const express = require('express');
const router = express.Router();
const {
    getScraps,
    getScrap,
    getMyScraps,
    createScrap,
    updateScrap,
    deleteScrap,
    getPriceSuggestion,
} = require('../controllers/scrapController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes (specific paths MUST come before /:id wildcard)
router.get('/price-suggest', getPriceSuggestion);
router.get('/', getScraps);

// Protected seller routes (also before /:id)
router.get('/my/listings', protect, authorize('seller'), getMyScraps);
router.post('/', protect, authorize('seller'), upload.array('images', 5), createScrap);

// Wildcard param routes last
router.get('/:id', getScrap);
router.put('/:id', protect, authorize('seller'), upload.array('images', 5), updateScrap);
router.delete('/:id', protect, authorize('seller'), deleteScrap);

module.exports = router;
