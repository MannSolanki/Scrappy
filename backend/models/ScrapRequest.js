const mongoose = require("mongoose");

const scrapRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scrapType: {
      type: String,
      enum: ["plastic", "metal", "paper", "ewaste", "glass", "others"],
      required: true,
    },
    estimatedWeightKg: {
      type: Number,
      required: true,
      min: 0.1,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    preferredPickupDateTime: {
      type: Date,
      required: true,
    },
    ratePerKg: {
      type: Number,
      required: true,
    },
    estimatedPrice: {
      type: Number,
      required: true,
    },
    rewardPoints: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "accepted", "on_the_way", "reached", "rejected", "completed"],
      default: "pending",
    },
    assignedPickupPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    collectedWeightKg: {
      type: Number,
      default: null,
    },
    collectedAmount: {
      type: Number,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    pickupLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    scrapImageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScrapRequest", scrapRequestSchema);
