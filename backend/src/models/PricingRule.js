const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Metal', 'E-Waste', 'Plastic', 'Paper', 'Glass', 'Rubber', 'Wood', 'Other'],
            index: true,
        },
        minWeight: {
            type: Number,
            required: true,
            min: 0,
        },
        maxWeight: {
            type: Number,
            required: true,
            default: Infinity,
        },
        pricePerKg: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
