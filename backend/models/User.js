const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  rewardPoints: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ["user", "admin", "pickup_partner"],
    default: "user",
  },
  authToken: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User", userSchema);
