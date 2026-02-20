const mongoose = require('mongoose');

const scrapItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Metal', 'E-Waste', 'Plastic', 'Paper', 'Glass', 'Rubber', 'Wood', 'Other'],
        },
        weight: {
            type: Number,
            required: [true, 'Weight is required'],
            min: [0.1, 'Weight must be at least 0.1 kg'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        priceUnit: {
            type: String,
            enum: ['per_kg', 'per_piece', 'total'],
            default: 'per_kg',
        },
        images: [
            {
                type: String,
            },
        ],
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['available', 'sold', 'pending'],
            default: 'available',
        },
        condition: {
            type: String,
            enum: ['New', 'Good', 'Fair', 'Poor'],
            default: 'Fair',
        },
        views: {
            type: Number,
            default: 0,
        },
        contactPreference: {
            type: String,
            enum: ['call', 'email', 'both'],
            default: 'both',
        },
    },
    { timestamps: true }
);

// Index for full-text search
scrapItemSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('ScrapItem', scrapItemSchema);
