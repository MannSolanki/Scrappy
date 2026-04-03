const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =====================
// ✅ TEST ROUTE
// =====================
router.get("/", (req, res) => {
  res.send("Auth working ✅");
});


// =====================
// ✅ REGISTER (SIGNUP)
// =====================
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Validate
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = new User({
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    // 5. Response
    res.status(201).json({
      message: "Signup successful ✅",
      user: {
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =====================
// ✅ LOGIN
// =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // 5. Response
    res.json({
      message: "Login successful ✅",
      token,
      user: {
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;