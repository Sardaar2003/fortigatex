const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Fix project names in database
// @route   POST /api/admin/fix-project-names
// @access  Private/Admin
const fixProjectNames = async (req, res) => {
  try {
    console.log('🔄 Starting project name fix...');
    
    // Check current state
    const currentProjects = await Order.aggregate([
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Current project distribution:', currentProjects);

    // Project mappings
    const updates = [];
    
    // Update Sempris Project → SC Project
    const semprisResult = await Order.updateMany(
      { project: 'Sempris Project' },
      { $set: { project: 'SC Project' } }
    );
    updates.push({
      from: 'Sempris Project',
      to: 'SC Project', 
      count: semprisResult.modifiedCount
    });

    // Update Radius Project → FRP Project
    const radiusResult = await Order.updateMany(
      { project: 'Radius Project' },
      { $set: { project: 'FRP Project' } }
    );
    updates.push({
      from: 'Radius Project',
      to: 'FRP Project',
      count: radiusResult.modifiedCount
    });

    // Update PSOnline Project → MDI Project
    const psonlineResult = await Order.updateMany(
      { project: 'PSOnline Project' },
      { $set: { project: 'MDI Project' } }
    );
    updates.push({
      from: 'PSOnline Project', 
      to: 'MDI Project',
      count: psonlineResult.modifiedCount
    });
      
      const subResult = await Order.updateMany(
      { project: 'SUB Project' },
      { $set: { project: 'HPP Project' } }
    );
    updates.push({
      from: 'SUB Project', 
      to: 'HPP Project',
      count: subResult.modifiedCount
    });

    // Get final state
    const finalProjects = await Order.aggregate([
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUpdated = updates.reduce((sum, update) => sum + update.count, 0);

    console.log('✅ Project name fix completed');
    
    res.status(200).json({
      success: true,
      message: 'Project names updated successfully',
      data: {
        updates,
        totalUpdated,
        beforeDistribution: currentProjects,
        afterDistribution: finalProjects
      }
    });

  } catch (error) {
    console.error('❌ Error fixing project names:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix project names',
      error: error.message
    });
  }
};

router.post('/fix-project-names', protect, authorize('admin'), fixProjectNames);

module.exports = router;
