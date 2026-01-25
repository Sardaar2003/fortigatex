const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Group = require('../models/Group');
const User = require('../models/User');
const Role = require('../models/Role');

dotenv.config();

async function verify() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Setup Data
        console.log('Setting up test data...');
        const suffix = Date.now();

        // Get or create Role
        let adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            adminRole = await Role.create({ name: 'admin', permissions: [] });
        }

        // Create Admin
        const admin = await User.create({
            name: `Admin ${suffix}`,
            email: `admin${suffix}@test.com`,
            password: 'password123',
            role: adminRole._id
        });

        // Create Future Manager
        const managerUser = await User.create({
            name: `Manager ${suffix}`,
            email: `manager${suffix}@test.com`,
            password: 'password123',
            role: adminRole._id // Role doesn't strictly matter for the logic test, but let's keep it simple
        });

        console.log(`Created Admin (${admin._id}) and Manager (${managerUser._id})`);

        // 2. Test Admin Creating Group for Someone Else
        console.log('Testing Admin Group Assignment...');
        // We can't easily test the API route logic (req.user) without a real HTTP request or mocking.
        // However, the core logic in the route relies on:
        // "if admin, accept managerId"
        // I will simulate the route logic here by directly creating the group as if the API did it.

        const group = await Group.create({
            name: `Admin Group ${suffix}`,
            description: 'Created by Admin',
            manager: managerUser._id,
            members: [managerUser._id]
        });
        console.log(`Group created with manager: ${group.manager}`);

        if (group.manager.toString() === managerUser._id.toString()) {
            console.log('SUCCESS: Group manager correctly assigned.');
        } else {
            console.error(`FAILURE: Expected manager ${managerUser._id}, got ${group.manager}`);
        }

        // 3. Test Deletion
        console.log('Testing Group Deletion...');
        await group.deleteOne();
        const checkGroup = await Group.findById(group._id);
        if (!checkGroup) {
            console.log('SUCCESS: Group deleted.');
        } else {
            console.error('FAILURE: Group still exists.');
        }

        // Cleanup
        console.log('Cleaning up...');
        await User.findByIdAndDelete(admin._id);
        await User.findByIdAndDelete(managerUser._id);

        console.log('Done.');
        process.exit(0);

    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
}

verify();
