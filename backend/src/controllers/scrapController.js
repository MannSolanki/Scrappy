const ScrapItem = require('../models/ScrapItem');

// Price suggestion lookup table (category → ₹ per kg)
const PRICE_GUIDE = {
    Metal: { min: 25, max: 60, unit: 'per_kg' },
    'E-Waste': { min: 50, max: 150, unit: 'per_kg' },
    Plastic: { min: 8, max: 25, unit: 'per_kg' },
    Paper: { min: 5, max: 18, unit: 'per_kg' },
    Glass: { min: 2, max: 10, unit: 'per_kg' },
    Rubber: { min: 10, max: 30, unit: 'per_kg' },
    Wood: { min: 3, max: 12, unit: 'per_kg' },
    Other: { min: 5, max: 20, unit: 'per_kg' },
};

// @desc    Get all scrap listings (public, with filters)
// @route   GET /api/scraps
// @access  Public
exports.getScraps = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, location, search, status, sort, page, limit } = req.query;

        const query = {};

        // Filters
        if (category && category !== 'All') query.category = category;
        if (status) query.status = status;
        else query.status = 'available';
        if (location) query.location = { $regex: location, $options: 'i' };
        if (search) query.$text = { $search: search };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const total = await ScrapItem.countDocuments(query);
        const scraps = await ScrapItem.find(query)
            .populate('seller', 'name email location phone')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            count: scraps.length,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: scraps,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single scrap listing
// @route   GET /api/scraps/:id
// @access  Public
exports.getScrap = async (req, res, next) => {
    try {
        const scrap = await ScrapItem.findById(req.params.id).populate(
            'seller',
            'name email location phone bio'
        );
        if (!scrap) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }
        // Increment views
        scrap.views += 1;
        await scrap.save({ validateBeforeSave: false });

        res.status(200).json({ success: true, data: scrap });
    } catch (error) {
        next(error);
    }
};

// @desc    Get seller's own listings
// @route   GET /api/scraps/my
// @access  Protected (seller)
exports.getMyScraps = async (req, res, next) => {
    try {
        const scraps = await ScrapItem.find({ seller: req.user._id }).sort({ createdAt: -1 });
        const stats = {
            total: scraps.length,
            available: scraps.filter((s) => s.status === 'available').length,
            sold: scraps.filter((s) => s.status === 'sold').length,
            totalValue: scraps.reduce((acc, s) => acc + s.price * s.weight, 0),
        };
        res.status(200).json({ success: true, data: scraps, stats });
    } catch (error) {
        next(error);
    }
};

// @desc    Create scrap listing
// @route   POST /api/scraps
// @access  Protected (seller)
exports.createScrap = async (req, res, next) => {
    try {
        req.body.seller = req.user._id;

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(
                (file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
            );
        }

        const scrap = await ScrapItem.create(req.body);
        await scrap.populate('seller', 'name email location');

        res.status(201).json({ success: true, data: scrap });
    } catch (error) {
        next(error);
    }
};

// @desc    Update scrap listing
// @route   PUT /api/scraps/:id
// @access  Protected (seller who owns it)
exports.updateScrap = async (req, res, next) => {
    try {
        let scrap = await ScrapItem.findById(req.params.id);
        if (!scrap) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (scrap.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
        }

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(
                (file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
            );
            req.body.images = [...(scrap.images || []), ...newImages];
        }

        scrap = await ScrapItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('seller', 'name email location');

        res.status(200).json({ success: true, data: scrap });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete scrap listing
// @route   DELETE /api/scraps/:id
// @access  Protected (seller who owns it)
exports.deleteScrap = async (req, res, next) => {
    try {
        const scrap = await ScrapItem.findById(req.params.id);
        if (!scrap) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (scrap.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
        }

        await scrap.deleteOne();
        res.status(200).json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get price suggestion
// @route   GET /api/scraps/price-suggest?category=Metal&weight=10
// @access  Public
exports.getPriceSuggestion = async (req, res) => {
    const { category, weight } = req.query;
    const guide = PRICE_GUIDE[category] || PRICE_GUIDE['Other'];
    const w = parseFloat(weight) || 1;

    const suggestedMin = Math.round(guide.min * w);
    const suggestedMax = Math.round(guide.max * w);
    const suggested = Math.round(((guide.min + guide.max) / 2) * w);

    // Fetch average market price from DB
    const avgData = await ScrapItem.aggregate([
        { $match: { category, status: 'available' } },
        { $group: { _id: null, avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
    ]);

    const marketAvg = avgData.length > 0 ? Math.round(avgData[0].avgPrice) : null;

    res.status(200).json({
        success: true,
        data: {
            category,
            weight: w,
            suggestedMin,
            suggestedMax,
            suggested,
            marketAvg,
            listingsCount: avgData.length > 0 ? avgData[0].count : 0,
            priceGuide: guide,
            tip: `Based on current market rates for ${category} scrap. Price is per kg.`,
        },
    });
};
