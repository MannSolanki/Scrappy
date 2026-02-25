const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ScrapRequest = require('./models/ScrapRequest');

const resetDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scrappydb';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    // Clear existing collections
    await User.deleteMany({});
    await ScrapRequest.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      rewardPoints: 0,
    });
    await adminUser.save();
    console.log('✓ Created admin user: admin@test.com / admin123');

    // Create regular user
    const regularUser = new User({
      name: 'Test User',
      email: 'test@gmail.com',
      password: 'test123',
      role: 'user',
      rewardPoints: 100,
    });
    await regularUser.save();
    console.log('✓ Created regular user: test@gmail.com / test123');

    // Create some sample scrap requests
    const request1 = new ScrapRequest({
      user: adminUser._id,
      scrapType: 'plastic',
      estimatedWeightKg: 5,
      address: '123 Main St, City',
      preferredPickupDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      ratePerKg: 10,
      estimatedPrice: 50,
      rewardPoints: 50,
      status: 'pending',
    });
    await request1.save();

    const request2 = new ScrapRequest({
      user: regularUser._id,
      scrapType: 'metal',
      estimatedWeightKg: 10,
      address: '456 Oak Ave, Town',
      preferredPickupDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      ratePerKg: 25,
      estimatedPrice: 250,
      rewardPoints: 100,
      status: 'approved',
    });
    await request2.save();

    const request3 = new ScrapRequest({
      user: regularUser._id,
      scrapType: 'paper',
      estimatedWeightKg: 2,
      address: '789 Pine Rd, Village',
      preferredPickupDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      ratePerKg: 8,
      estimatedPrice: 16,
      rewardPoints: 20,
      status: 'completed',
    });
    await request3.save();

    console.log('✓ Created sample scrap requests');
    console.log('\nDatabase reset complete!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting database:', error.message);
    process.exit(1);
  }
};

resetDatabase();
