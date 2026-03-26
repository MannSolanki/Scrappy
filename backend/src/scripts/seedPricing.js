const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });
const PricingRule = require('../models/PricingRule');
const MarketReason = require('../models/MarketReason');

const rules = [
    // Plastic
    { category: 'Plastic', minWeight: 0, maxWeight: 5, pricePerKg: 8 },
    { category: 'Plastic', minWeight: 5, maxWeight: 20, pricePerKg: 10 },
    { category: 'Plastic', minWeight: 20, maxWeight: Infinity, pricePerKg: 12 },
    // Paper
    { category: 'Paper', minWeight: 0, maxWeight: 10, pricePerKg: 6 },
    { category: 'Paper', minWeight: 10, maxWeight: 50, pricePerKg: 8 },
    { category: 'Paper', minWeight: 50, maxWeight: Infinity, pricePerKg: 9 },
    // Metal
    { category: 'Metal', minWeight: 0, maxWeight: 5, pricePerKg: 20 },
    { category: 'Metal', minWeight: 5, maxWeight: 30, pricePerKg: 25 },
    { category: 'Metal', minWeight: 30, maxWeight: Infinity, pricePerKg: 30 },
    // Glass
    { category: 'Glass', minWeight: 0, maxWeight: 10, pricePerKg: 4 },
    { category: 'Glass', minWeight: 10, maxWeight: Infinity, pricePerKg: 6 },
    // E-Waste
    { category: 'E-Waste', minWeight: 0, maxWeight: 2, pricePerKg: 15 },
    { category: 'E-Waste', minWeight: 2, maxWeight: 10, pricePerKg: 20 },
    { category: 'E-Waste', minWeight: 10, maxWeight: Infinity, pricePerKg: 25 },
];

const reasons = [
    { category: 'Plastic', status: 'High', reasonText: 'High demand for recycled plastic in the market' },
    { category: 'Paper', status: 'Stable', reasonText: 'Normal supply levels from local collectors' },
    { category: 'Metal', status: 'High', reasonText: 'Metal prices increased due to industrial demand' },
    { category: 'Glass', status: 'Low', reasonText: 'Excess waste available, price slightly decreased' },
    { category: 'E-Waste', status: 'High', reasonText: 'Global shortage of precious metals in e-waste' },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scrappy');
        console.log('Connected to MongoDB for seeding...');

        await PricingRule.deleteMany({});
        await MarketReason.deleteMany({});

        await PricingRule.insertMany(rules);
        await MarketReason.insertMany(reasons);

        console.log('✅ Pricing rules and market reasons seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
