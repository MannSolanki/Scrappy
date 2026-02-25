const express = require("express");
const ScrapRequest = require("../models/ScrapRequest");
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

const RATE_CARD = {
  plastic: 10,
  metal: 25,
  paper: 8,
  "e-waste": 15,
};

const POINTS_PER_KG = 10;

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { scrapType, estimatedWeightKg, address, preferredPickupDateTime } = req.body;
    const weight = Number(estimatedWeightKg);
    const ratePerKg = RATE_CARD[scrapType];

    if (!ratePerKg) {
      return res.status(400).json({ message: "Invalid scrap type" });
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      return res.status(400).json({ message: "Estimated weight must be greater than 0" });
    }
    if (!address || !String(address).trim()) {
      return res.status(400).json({ message: "Address is required" });
    }
    if (!preferredPickupDateTime) {
      return res.status(400).json({ message: "Preferred pickup date/time is required" });
    }

    const estimatedPrice = Number((weight * ratePerKg).toFixed(2));
    const rewardPoints = Math.round(weight * POINTS_PER_KG);

    const request = await ScrapRequest.create({
      user: req.user._id,
      scrapType,
      estimatedWeightKg: weight,
      address: String(address).trim(),
      preferredPickupDateTime,
      ratePerKg,
      estimatedPrice,
      rewardPoints,
      status: "pending",
    });

    req.user.rewardPoints += rewardPoints;
    await req.user.save();

    return res.status(201).json({
      message: "Pickup request submitted successfully",
      request,
      totalRewards: req.user.rewardPoints,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not create pickup request" });
  }
});

router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const requests = await ScrapRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      requests,
      totalRewards: req.user.rewardPoints,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch pickup requests" });
  }
});

router.patch("/:id/status", authMiddleware, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "approved", "on_the_way", "rejected", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedRequest = await ScrapRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.json({
      message: "Request status updated",
      request: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update request status" });
  }
});

module.exports = router;
