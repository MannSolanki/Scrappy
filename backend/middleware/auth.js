const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "scrappy-dev-secret";

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
sss
    const normalizedEmail = email.toLowerCase().trim();

    console.log("Checking email:", normalizedEmail);

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    console.log("Existing user:", existingUser);

    if (existingUser !== null) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    return res.status(201).json({
      message: "Signup successful",
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Wrong role selected" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.authToken = token;
    await user.save();

    return res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;