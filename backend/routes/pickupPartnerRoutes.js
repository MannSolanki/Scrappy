const express = require("express");
const authMiddleware = require("../middleware/auth");
const ScrapRequest = require("../models/ScrapRequest");

const router = express.Router();

const requirePickupPartner = (req, res, next) => {
  const role = String(req.user?.role || "").trim().toLowerCase();
  if (role !== "pickup_partner") {
    return res.status(403).json({ message: "Access denied: Pickup Partner only" });
  }
  return next();
};

router.get("/requests", authMiddleware, requirePickupPartner, async (req, res) => {
  try {
    const requests = await ScrapRequest.find({
      $or: [
        { assignedPickupPartner: req.user._id },
        { status: "approved", assignedPickupPartner: null },
        { status: "on_the_way", assignedPickupPartner: null },
      ],
    })
      .populate("user", "name email")
      .sort({ preferredPickupDateTime: 1, createdAt: -1 });

    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch pickup requests" });
  }
});

router.patch("/requests/:id/status", authMiddleware, requirePickupPartner, async (req, res) => {
  try {
    const { status } = req.body;
    const normalizedStatus = String(status || "").trim().toLowerCase();

    if (!["on_the_way", "completed"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const request = await ScrapRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (
      request.assignedPickupPartner &&
      request.assignedPickupPartner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Request is assigned to another pickup partner" });
    }

    if (normalizedStatus === "on_the_way" && request.status !== "approved") {
      return res.status(400).json({ message: "Only approved requests can be marked as on the way" });
    }

    if (
      normalizedStatus === "completed" &&
      !["on_the_way", "approved"].includes(String(request.status || "").toLowerCase())
    ) {
      return res.status(400).json({ message: "Only active pickup requests can be completed" });
    }

    request.status = normalizedStatus;
    request.assignedPickupPartner = req.user._id;
    await request.save();

    const updatedRequest = await ScrapRequest.findById(request._id).populate("user", "name email");
    return res.json({
      message: "Pickup request status updated",
      request: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update pickup request status" });
  }
});

module.exports = router;
