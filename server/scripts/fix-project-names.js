const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config({ path: '../.env' });

// Project name mappings
const projectMappings = {
  'Sempris Project': 'SC Project',
  'Radius Project': 'FRP Project', 
    'PSOnline Project': 'MDI Project',
  'SUB Project':'HPP Project'
};

const fixProjectNames = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check current project distributions
    console.log('\n📊 Current project distribution:');
    const projectCounts = await Order.aggregate([
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    projectCounts.forEach(item => {
      console.log(`  ${item._id}: ${item.count} orders`);
    });

    console.log('\n🔄 Starting project name corrections...');

    // Update each incorrect project name
    for (const [oldName, newName] of Object.entries(projectMappings)) {
      console.log(`\n📝 Updating "${oldName}" to "${newName}"`);
      
      // Find orders with the old project name
      const ordersToUpdate = await Order.find({ project: oldName });
      console.log(`  Found ${ordersToUpdate.length} orders with "${oldName}"`);

      if (ordersToUpdate.length > 0) {
        // Update the orders
        const updateResult = await Order.updateMany(
          { project: oldName },
          { $set: { project: newName } }
        );

        console.log(`  ✅ Updated ${updateResult.modifiedCount} orders`);
        
        // Show some sample updated orders
        const sampleUpdated = await Order.find({ project: newName }).limit(3);
        console.log(`  📋 Sample updated orders:`);
        sampleUpdated.forEach(order => {
          console.log(`    - Order ID: ${order._id}, Project: ${order.project}, Customer: ${order.firstName} ${order.lastName}`);
        });
      } else {
        console.log(`  ℹ️ No orders found with "${oldName}"`);
      }
    }

    // Show final project distribution
    console.log('\n📊 Final project distribution:');
    const finalProjectCounts = await Order.aggregate([
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    finalProjectCounts.forEach(item => {
      console.log(`  ${item._id}: ${item.count} orders`);
    });

    // Verify no old project names remain
    console.log('\n🔍 Verification - checking for any remaining old project names:');
    const oldProjectNames = Object.keys(projectMappings);
    
    for (const oldName of oldProjectNames) {
      const remainingCount = await Order.countDocuments({ project: oldName });
      if (remainingCount > 0) {
        console.log(`  ⚠️ WARNING: ${remainingCount} orders still have "${oldName}"`);
      } else {
        console.log(`  ✅ No orders remain with "${oldName}"`);
      }
    }

    console.log('\n🎉 Project name correction completed successfully!');
    console.log('📝 Summary of changes:');
    console.log('  • Sempris Project → SC Project');
    console.log('  • Radius Project → FRP Project');
    console.log('  • PSOnline Project → MDI Project');

  } catch (error) {
    console.error('❌ Error fixing project names:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit();
  }
};

// Run the script
console.log('🚀 Starting Project Name Correction Script');
console.log('=' .repeat(50));
fixProjectNames();
