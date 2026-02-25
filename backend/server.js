const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const scrapRequestRoutes = require("./routes/scrapRequests");
const adminRoutes = require("./routes/adminRoutes");
const pickupPartnerRoutes = require("./routes/pickupPartnerRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect Database
connectDB();

// ✅ Middlewares FIRST
app.use(cors());
app.use(express.json());

// ✅ Routes AFTER middlewares
app.use("/api/auth", authRoutes);
app.use("/api/scrap-requests", scrapRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pickup-partner", pickupPartnerRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Test route
app.get("/", (_req, res) => {
  res.send("Scrappy backend is running");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
