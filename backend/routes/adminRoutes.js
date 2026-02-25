const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const User = require("../models/User");
const ScrapRequest = require("../models/ScrapRequest");

/*
------------------------------------
1️⃣ Admin Dashboard
------------------------------------
*/
router.get("/dashboard", authMiddleware, adminAuth, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Welcome to Admin Dashboard",
      adminEmail: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error loading dashboard"
    });
  }
});

/*
------------------------------------
2️⃣ Get All Users
------------------------------------
*/
router.get("/users", authMiddleware, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
});

/*
------------------------------------
3️⃣ Get All Scrap Requests
------------------------------------
*/
router.get("/scrap-requests", authMiddleware, adminAuth, async (req, res) => {
  try {
    const requests = await ScrapRequest.find().populate("user", "email name");
    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching scrap requests"
    });
  }
});

/*
------------------------------------
4️⃣ Update Scrap Request Status
------------------------------------
*/
router.put("/scrap-requests/:id", authMiddleware, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const updatedRequest = await ScrapRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Scrap request not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      updatedRequest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating status"
    });
  }
});

module.exports = router;