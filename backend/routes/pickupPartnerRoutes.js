const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");
const ScrapRequest = require("../models/ScrapRequest");
const PricingRule = require("../src/models/PricingRule");

const router = express.Router();

const normalizeScrapType = (scrapType = "") =>
  String(scrapType)
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, "");

const resolvePricePerKg = async (scrapType, weightKg, fallbackRatePerKg) => {
  const normalizedScrapType = normalizeScrapType(scrapType);
  const safeWeight = Number(weightKg);

  const rules = await PricingRule.find({}).sort({ minWeight: -1 }).lean();
  const matchedRule = rules.find((rule) => {
    const normalizedCategory = normalizeScrapType(rule.category);
    const minWeight = Number(rule.minWeight || 0);
    const rawMaxWeight = Number(rule.maxWeight);
    const maxWeight = Number.isFinite(rawMaxWeight) ? rawMaxWeight : Number.POSITIVE_INFINITY;

    return normalizedCategory === normalizedScrapType && safeWeight >= minWeight && safeWeight < maxWeight;
  });

  if (matchedRule?.pricePerKg) {
    return Number(matchedRule.pricePerKg);
  }

  if (Number.isFinite(Number(fallbackRatePerKg)) && Number(fallbackRatePerKg) > 0) {
    return Number(fallbackRatePerKg);
  }

  throw new Error(`No pricing rule found for scrap type "${normalizedScrapType || "unknown"}"`);
};

const requirePickupPartner = (req, res, next) => {
  const role = String(req.user?.role || "").trim().toLowerCase();
  if (role !== "pickup_partner") {
    return res.status(403).json({ message: "Access denied: Pickup Partner only" });
  }
  return next();
};

const updatePickupStatus = async (req, res, forcedStatus) => {
  try {
    const { status, scrapType, pickupLocation, scrapImageUrl, collectedWeightKg } = req.body;
    const normalizedStatus = String(forcedStatus || status || "").trim().toLowerCase();
    const pickupId = String(req.params.id || "").trim();
    const allowedTransitions = {
      accepted: ["approved", "pending"],
      on_the_way: ["accepted", "approved"],
      reached: ["on_the_way"],
      completed: ["reached", "on_the_way"],
    };

    if (!Object.prototype.hasOwnProperty.call(allowedTransitions, normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(pickupId)) {
      return res.status(400).json({ message: "Invalid pickup request id" });
    }

    const request = await ScrapRequest.findById(pickupId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (
      request.assignedPickupPartner &&
      request.assignedPickupPartner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Request is assigned to another pickup partner" });
    }

    const normalizedCurrentStatus = String(request.status || "").toLowerCase();
    if (!allowedTransitions[normalizedStatus].includes(normalizedCurrentStatus)) {
      return res.status(400).json({
        message: `Pickup cannot move from ${normalizedCurrentStatus || "unknown"} to ${normalizedStatus}`,
      });
    }

    request.assignedPickupPartner = req.user._id;
    request.scrapType = normalizeScrapType(scrapType || request.scrapType);

    if (normalizedStatus === "completed") {
      const weightKg = Number(collectedWeightKg ?? request.collectedWeightKg ?? request.estimatedWeightKg);

      if (!Number.isFinite(weightKg) || weightKg <= 0) {
        return res.status(400).json({ message: "A valid pickup weight is required to complete this request" });
      }

      const pricePerKg = await resolvePricePerKg(request.scrapType, weightKg, request.ratePerKg);
      const totalAmount = Number((weightKg * pricePerKg).toFixed(2));

      request.status = "completed";
      request.collectedWeightKg = weightKg;
      request.collectedAmount = totalAmount;
      request.completedAt = new Date();
      request.ratePerKg = pricePerKg;

      if (pickupLocation && typeof pickupLocation.lat === "number" && typeof pickupLocation.lng === "number") {
        request.pickupLocation = pickupLocation;
      }

      if (scrapImageUrl) {
        request.scrapImageUrl = scrapImageUrl;
      }
    } else {
      request.status = normalizedStatus;

      if (
        pickupLocation &&
        typeof pickupLocation.lat === "number" &&
        typeof pickupLocation.lng === "number"
      ) {
        request.pickupLocation = pickupLocation;
      }
    }

    await request.save();

    const updatedRequest = await ScrapRequest.findById(request._id).populate("user", "name email");

    return res.json({
      message:
        normalizedStatus === "accepted"
          ? "Pickup accepted successfully"
          : normalizedStatus === "on_the_way"
            ? "Pickup marked as on the way"
            : normalizedStatus === "reached"
              ? "Pickup marked as reached"
              : "Pickup completed successfully",
      amount: updatedRequest?.collectedAmount ?? null,
      price_per_kg: updatedRequest?.ratePerKg ?? null,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Pickup Partner Status Update Error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Unable to update pickup request status",
    });
  }
};

router.get("/requests", authMiddleware, requirePickupPartner, async (req, res) => {
  try {
    const requests = await ScrapRequest.find({
      $or: [
        { assignedPickupPartner: req.user._id },
        { status: "approved", assignedPickupPartner: null },
      ],
    })
      .populate("user", "name email")
      .sort({ preferredPickupDateTime: 1, createdAt: -1 });

    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch pickup requests" });
  }
});

router.patch("/requests/:id/status", authMiddleware, requirePickupPartner, async (req, res) =>
  updatePickupStatus(req, res)
);

router.patch("/accept/:id", authMiddleware, requirePickupPartner, async (req, res) =>
  updatePickupStatus(req, res, "accepted")
);

module.exports = router;
