const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth'); // Assuming you have auth middleware

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private (Manager/Admin)
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, managerId } = req.body;

        const groupExists = await Group.findOne({ name });
        if (groupExists) {
            return res.status(400).json({ success: false, error: 'Group name already exists' });
        }

        // Determine manager: if admin and managerId provided, use that. Else default to self.
        let manager = req.user.id;
        let members = [req.user.id];

        if (req.user.role.name === 'admin' && managerId) {
            const userExists = await User.findById(managerId);
            if (!userExists) {
                return res.status(404).json({ success: false, error: 'Manager user not found' });
            }
            manager = managerId;
            members = [managerId]; // Admin creates it, but Manager is the member
        }

        const group = await Group.create({
            name,
            description,
            manager,
            members
        });

        res.status(201).json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get all groups (Admin) or My Group (Manager)
// @route   GET /api/groups
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role.name !== 'admin') {
            // If not admin, find groups where user is manager or member
            query = {
                $or: [
                    { manager: req.user.id },
                    { members: req.user.id }
                ]
            };
        }

        const groups = await Group.find(query)
            .populate('manager', 'name email')
            .populate('members', 'name email');

        res.status(200).json({ success: true, count: groups.length, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('manager', 'name email')
            .populate('members', 'name email');

        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Optional: Check if user is member or manager or admin
        const isMember = group.members.some(member => member._id.toString() === req.user.id);
        const isAdmin = req.user.role.name === 'admin';
        if (!isMember && group.manager._id.toString() !== req.user.id && !isAdmin) {
            return res.status(401).json({ success: false, error: 'Not authorized to view this group' });
        }

        res.status(200).json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Update Group (Reassign Manager)
// @route   PUT /api/groups/:id
// @access  Private (Admin only for now)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description, managerId } = req.body;

        let group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Only Admin can reassign manager or update details for now
        if (req.user.role.name !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update group' });
        }

        if (name) group.name = name;
        if (description) group.description = description;
        if (managerId) {
            const userExists = await User.findById(managerId);
            if (!userExists) {
                return res.status(404).json({ success: false, error: 'Manager user not found' });
            }
            group.manager = managerId;
            // Ensure new manager is in members logic? 
            // Ideally yes, but let's keep it simple: Manager is ALWAYS a member.
            if (!group.members.includes(managerId)) {
                group.members.push(managerId);
            }
        }

        await group.save();
        res.status(200).json({ success: true, data: group });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Delete Group
// @route   DELETE /api/groups/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        if (req.user.role.name !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete group' });
        }

        await group.deleteOne(); // or Group.deleteOne({ _id: req.params.id }) if model instance method issues

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Add member to group
// @route   PUT /api/groups/:id/members
// @access  Private (Manager only)
router.put('/:id/members', protect, async (req, res) => {
    try {
        const { email } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Check if requester is manager or admin
        if (group.manager.toString() !== req.user.id && req.user.role.name !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to add members' });
        }

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (group.members.includes(userToAdd._id)) {
            return res.status(400).json({ success: false, error: 'User already in group' });
        }

        group.members.push(userToAdd._id);
        await group.save();

        res.status(200).json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get group team report
// @route   GET /api/groups/:id/report
// @access  Private (Manager only)
router.get('/:id/report', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Check if requester is manager
        if (group.manager.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to view report' });
        }

        const { startDate, endDate } = req.query;
        let dateQuery = {};

        // Construct date query for Order filtering
        if (startDate && endDate) {
            // Assuming orderDate is stored as String MM/DD/YYYY based on Order.js definition
            // This is tricky with String dates. Ideally, Order should use Date type for queries.
            // If Order.js uses String 'MM/DD/YYYY', we might need to fetch all and filter in JS 
            // OR rely on 'createdAt' if that's more reliable for "how much team has done".
            // Let's use `createdAt` for reliable date range querying as it is a Date type in schema.
            dateQuery = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Aggregate data for all members
        // Fetch detailed orders for CSV and Frontend Calculation
        const orders = await Order.find({
            user: { $in: group.members },
            ...dateQuery
        }).populate('user', 'name email');

        res.status(200).json({ success: true, count: orders.length, data: orders });



    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
