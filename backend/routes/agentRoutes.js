const express = require("express");
const authMiddleware = require("../middleware/auth");
const ScrapRequest = require("../models/ScrapRequest");
const User = require("../models/User");

const router = express.Router();

const requireAgent = (req, res, next) => {
  const role = String(req.user?.role || "").trim().toLowerCase();
  if (role !== "pickup_agent" && role !== "pickup_partner" && role !== "admin") {
    return res.status(403).json({ message: "Access denied: Pickup Agent only" });
  }
  return next();
};

// 1. GET /agent/pickups
router.get("/pickups", authMiddleware, requireAgent, async (req, res) => {
  try {
    const requests = await ScrapRequest.find({
      $or: [
        { assignedPickupPartner: req.user._id },
        { status: "approved", assignedPickupPartner: null },
        { status: "accepted", assignedPickupPartner: req.user._id }
      ],
    })
      .populate("user", "name email")
      .sort({ preferredPickupDateTime: 1, createdAt: -1 });

    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch pickups" });
  }
});

// 2. POST /agent/accept-pickup
router.post("/accept-pickup", authMiddleware, requireAgent, async (req, res) => {
  try {
    const { pickupId } = req.body;
    const request = await ScrapRequest.findById(pickupId);
    
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    if (request.status !== "approved" && request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer available" });
    }

    request.status = "accepted";
    request.assignedPickupPartner = req.user._id;
    await request.save();

    return res.json({ message: "Pickup accepted magically", request });
  } catch (error) {
    return res.status(500).json({ message: "Unable to accept pickup" });
  }
});

// 3. POST /agent/complete-pickup
router.post("/complete-pickup", authMiddleware, requireAgent, async (req, res) => {
  try {
    const { pickupId, collected_weight, lat, lng } = req.body;
    
    if (!collected_weight || collected_weight <= 0) {
      return res.status(400).json({ message: "Valid collected weight is required" });
    }

    const request = await ScrapRequest.findById(pickupId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.assignedPickupPartner?.toString() !== req.user._id.toString()) {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Assigned to someone else" });
    }

    // Try to get dynamic price, fallback to ratePerKg
    let pricePerKg = request.ratePerKg || 15; 
    
    // We can directly fetch PricingRule if it exists in the other folder
    try {
        const PricingRule = require("../src/models/PricingRule");
        const rule = await PricingRule.findOne({ category: new RegExp(request.scrapType, "i") });
        if (rule && rule.pricePerKg) {
            pricePerKg = rule.pricePerKg;
        }
    } catch(err) {
        // Fallback to ratePerKg if PricingRule is inaccessible
    }

    const totalAmount = collected_weight * pricePerKg;

    request.collectedWeightKg = collected_weight;
    request.collectedAmount = totalAmount;
    request.completedAt = new Date();
    if (lat && lng) {
      request.pickupLocation = { lat, lng };
    }
    request.status = "completed";

    await request.save();

    return res.json({ 
      message: "Pickup completed perfectly", 
      amount: totalAmount, 
      price_per_kg: pricePerKg,
      request 
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete pickup" });
  }
});

module.exports = router;
