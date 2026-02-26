const cors = require("cors");
const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const scrapRequestRoutes = require("./routes/scrapRequests");
const adminRoutes = require("./routes/adminRoutes");
const pickupPartnerRoutes = require("./routes/pickupPartnerRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  // allow URL from environment (could be localhost or deployed client)
  process.env.CLIENT_URL,
  // production frontend on Netlify
  "https://ecoscrap-app.netlify.app",
  // common localhost dev ports (Vite default 5173/5174, React 3000 etc.)
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

// ✅ Connect Database
connectDB();

// ✅ Middlewares FIRST
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// enable pre-flight across-the-board
app.options("*", cors());

app.use(express.json());

// ✅ Routes AFTER middlewares
app.use("/api/auth", authRoutes);
app.use("/api/scrap-requests", scrapRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pickup-partner", pickupPartnerRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Test route
app.get("/", (_req, res) => {
  res.send("API Running");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
