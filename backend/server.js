const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// ✅ Import routes (MAKE SURE FILE NAMES ARE CORRECT)
const authRoutes = require("./routes/auth");
const scrapRequestRoutes = require("./routes/scrapRequests");
const adminRoutes = require("./routes/adminRoutes");
const pickupPartnerRoutes = require("./routes/pickupPartnerRoutes");
const pricingRoutes = require("./routes/pricing");
const agentRoutes = require("./routes/agentRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(express.json());

// ✅ Simple CORS (safe & easy)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ✅ Routes (IMPORTANT: these must export router)
app.use("/api/auth", authRoutes);
app.use("/api/scrap-requests", scrapRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pickup-partners", pickupPartnerRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/chat", chatRoutes);


// ✅ Error handler (VERY IMPORTANT)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ✅ Start server AFTER DB connection
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};

startServer();