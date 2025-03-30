const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');

// Load environment variables
dotenv.config();

const migrateOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all orders that don't have a project field
    const result = await Order.updateMany(
      { project: { $exists: false } },
      { $set: { project: 'Radius Project' } }
    );

    console.log(`Migration completed. Updated ${result.modifiedCount} orders.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateOrders(); 