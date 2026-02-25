const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scrappydb';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123', // Plain text for testing (should be hashed in production)
      role: 'admin',
      rewardPoints: 0,
    });

    await adminUser.save();
    console.log('✓ Admin user created: admin@test.com / admin123');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
