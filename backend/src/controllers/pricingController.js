const PricingRule = require('../models/PricingRule');
const MarketReason = require('../models/MarketReason');

/**
 * @desc    Get all pricing data including rules and market reasons
 * @route   GET /api/pricing
 * @access  Private
 */
exports.getPricingData = async (req, res, next) => {
    try {
        const [rules, reasons] = await Promise.all([
            PricingRule.find().sort({ category: 1, minWeight: 1 }),
            MarketReason.find().sort({ updatedAt: -1 }),
        ]);

        res.status(200).json({
            success: true,
            count: rules.length,
            data: {
                rules,
                reasons,
            },
        });
    } catch (error) {
        next(error);
    }
};
