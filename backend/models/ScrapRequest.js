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
      enum: ["plastic", "metal", "paper", "e-waste"],
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
      enum: ["pending", "approved", "on_the_way", "rejected", "completed"],
      default: "pending",
    },
    assignedPickupPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScrapRequest", scrapRequestSchema);
