const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ScrapItem = require('../models/ScrapItem');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get seller dashboard stats
// @route   GET /api/users/dashboard
// @access  Protected
router.get('/dashboard', protect, async (req, res, next) => {
    try {
        if (req.user.role === 'seller') {
            const scraps = await ScrapItem.find({ seller: req.user._id });
            const stats = {
                totalListings: scraps.length,
                activeListings: scraps.filter((s) => s.status === 'available').length,
                soldListings: scraps.filter((s) => s.status === 'sold').length,
                totalViews: scraps.reduce((acc, s) => acc + s.views, 0),
                totalEarned: scraps
                    .filter((s) => s.status === 'sold')
                    .reduce((acc, s) => acc + s.price * s.weight, 0),
            };
            return res.status(200).json({ success: true, role: 'seller', stats });
        } else {
            // Buyer stats
            const totalListings = await ScrapItem.countDocuments({ status: 'available' });
            const categories = await ScrapItem.distinct('category');
            return res.status(200).json({
                success: true,
                role: 'buyer',
                stats: { totalListings, categories: categories.length },
            });
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Get all users (admin use case, basic)
// @route   GET /api/users/stats
// @access  Public
router.get('/stats', async (req, res, next) => {
    try {
        const [totalUsers, totalSellers, totalBuyers, totalListings, totalSold] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'seller' }),
            User.countDocuments({ role: 'buyer' }),
            ScrapItem.countDocuments(),
            ScrapItem.countDocuments({ status: 'sold' }),
        ]);
        res.status(200).json({
            success: true,
            data: { totalUsers, totalSellers, totalBuyers, totalListings, totalSold },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
