const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "scrappy-dev-secret";
const ADMIN_KEY = process.env.ADMIN_KEY || "ecoscrap-admin";

const normalizeRole = (requestedRole, adminKey) => {
  if (requestedRole === "admin" && adminKey === ADMIN_KEY) {
    return "admin";
  }
  if (requestedRole === "pickup_partner") {
    return "pickup_partner";
  }
  return "user";
};

const normalizeStoredRole = (roleValue) => {
  const normalized = String(roleValue || "user").trim().toLowerCase();
  if (normalized === "admin") {
    return "admin";
  }
  if (normalized === "pickup_partner") {
    return "pickup_partner";
  }
  return "user";
};

const buildAuthToken = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: normalizeStoredRole(user.role),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

const handleSignup = async (req, res) => {
  try {
    const { email, password, role, adminKey } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const derivedName = normalizedEmail.split("@")[0] || "User";
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    const normalizedRole = normalizeRole(role, adminKey);

    const user = new User({
      name: formattedName,
      email: normalizedEmail,
      password,
      role: normalizedRole,
    });
    await user.save();

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Keep auth behavior simple so existing working flow does not break.
router.post("/signup", handleSignup);
router.post("/register", handleSignup);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userRole = normalizeStoredRole(user.role);
    user.role = userRole;

    const token = buildAuthToken(user);
    user.authToken = token;

    if (!user.name) {
      const nameFromEmail = normalizedEmail.split("@")[0] || "User";
      user.name = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    }
    await user.save();

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        rewardPoints: user.rewardPoints,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
