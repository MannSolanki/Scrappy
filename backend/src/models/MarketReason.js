const mongoose = require('mongoose');

const marketReasonSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Metal', 'E-Waste', 'Plastic', 'Paper', 'Glass', 'Rubber', 'Wood', 'Other'],
            index: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['High', 'Low', 'Stable'],
        },
        reasonText: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('MarketReason', marketReasonSchema);
