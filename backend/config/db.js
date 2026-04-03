const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO URI:", process.env.MONGO_URI); // ✅ ADD THIS LINE

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;