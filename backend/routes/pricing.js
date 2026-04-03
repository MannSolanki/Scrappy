const express = require("express");
const authMiddleware = require("../middleware/auth");
const PricingRule = require("../src/models/PricingRule");
const MarketReason = require("../src/models/MarketReason");

const router = express.Router();

router.get("/", authMiddleware, async (_req, res) => {
  try {
    const [rules, reasons] = await Promise.all([
      PricingRule.find({}).sort({ category: 1, minWeight: 1 }).lean(),
      MarketReason.find({}).sort({ updatedAt: -1 }).lean(),
    ]);

    return res.status(200).json({
      success: true,
      count: rules.length,
      data: {
        rules,
        reasons,
      },
    });
  } catch (error) {
    console.error("Pricing Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch pricing data",
    });
  }
});

module.exports = router;

