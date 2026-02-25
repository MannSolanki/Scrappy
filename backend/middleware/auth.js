const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "scrappy-dev-secret";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization || "";
    let token = "";

    // Check Bearer token
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }

    // Check custom header fallback
    if (!token && req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - Token missing"
      });
    }

    let user = null;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded?.id) {
        user = await User.findById(decoded.id);
      }
    } catch {
      // Token may be from old auth flow; fallback to DB token lookup.
    }

    if (!user) {
      user = await User.findOne({ authToken: token });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({
      message: "Authentication failed"
    });
  }
};

module.exports = authMiddleware;
