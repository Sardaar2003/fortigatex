const mongoose = require('mongoose');
const Order = require('../models/Order');

// Simple project fix script
const quickFixProjects = async () => {
  try {
    console.log('🔄 Quick Project Name Fix');
    
    // Update Sempris Project → SC Project
    const semprisUpdate = await Order.updateMany(
      { project: 'Sempris Project' },
      { $set: { project: 'SC Project' } }
    );
    console.log(`✅ Sempris Project → SC Project: ${semprisUpdate.modifiedCount} orders updated`);

    // Update Radius Project → FRP Project  
    const radiusUpdate = await Order.updateMany(
      { project: 'Radius Project' },
      { $set: { project: 'FRP Project' } }
    );
    console.log(`✅ Radius Project → FRP Project: ${radiusUpdate.modifiedCount} orders updated`);

    // Update PSOnline Project → MDI Project
    const psonlineUpdate = await Order.updateMany(
      { project: 'PSOnline Project' },
      { $set: { project: 'MDI Project' } }
    );
      console.log(`✅ PSOnline Project → MDI Project: ${psonlineUpdate.modifiedCount} orders updated`);
      
      // Update PSOnline Project → MDI Project
    const subUpdate = await Order.updateMany(
      { project: 'SUB Project' },
      { $set: { project: 'HPP Project' } }
    );
    console.log(`✅ SUB Project → HPP Project: ${subUpdate.modifiedCount} orders updated`);

    console.log(`🎉 Total orders updated: ${semprisUpdate.modifiedCount + radiusUpdate.modifiedCount + psonlineUpdate.modifiedCount+subUpdate.modifiedCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

module.exports = { quickFixProjects };
