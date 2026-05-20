const express = require('express');
const router = express.Router();
const ProjectConfig = require('../models/ProjectConfig');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all project configs
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let projects = await ProjectConfig.find();
    
    // Seed default projects if none exist, or if we need to migrate to the new schema
    if (projects.length === 0 || !projects[0].id) {
      await ProjectConfig.deleteMany({}); // clear old schema
      const defaultProjects = [
        { id: 'radius', name: 'FRP API', isActive: true },
        { id: 'sempris', name: 'SC API', isActive: true },
        { id: 'psonline', name: 'MDI API', isActive: true },
        { id: 'sublytics', name: 'HPP API', isActive: true },
        { id: 'mi', name: 'MI API', isActive: true },
        { id: 'import-sale', name: 'Import Sale', isActive: true }
      ];
      projects = await ProjectConfig.insertMany(defaultProjects);
    }
    
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Toggle project status
// @route   PUT /api/projects/:id/toggle
// @access  Private/Admin
router.put('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await ProjectConfig.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    project.isActive = !project.isActive;
    await project.save();
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error toggling project:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

module.exports = router;
