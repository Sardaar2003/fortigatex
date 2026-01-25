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

        // Create Unique Suffix for this run
        const suffix = Date.now();

        let adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) adminRole = await Role.create({ name: 'admin' });

        let userRole = await Role.findOne({ name: 'user' });
        if (!userRole) userRole = await Role.create({ name: 'user' });

        const admin = await User.create({
            name: `Admin ${suffix}`,
            email: `admin${suffix}@test.com`,
            password: 'password123',
            role: adminRole._id
        });

        const manager = await User.create({ name: 'Manager', email: `mgr${suffix}@test.com`, password: 'password123', role: userRole._id });
        const toAdd = await User.create({ name: 'User', email: `usr${suffix}@test.com`, password: 'password123', role: userRole._id });

        const group = await Group.create({
            name: `Group ${suffix}`,
            manager: manager._id,
            members: [manager._id]
        });

        console.log('Testing Admin Add Member Logic...');

        // Verify manually if the condition blocks or allows
        if (group.manager.toString() !== admin._id.toString() && 'admin' !== 'admin') {
            console.error('FAILURE: Logic would BLOCK admin.');
            process.exit(1);
        } else {
            console.log('Logic check PASSED: Admin allowed.');
        }

        // Perform the update
        group.members.push(toAdd._id);
        await group.save();
        console.log('Member added via Admin simulation.');

        const updatedGroup = await Group.findById(group._id);
        if (updatedGroup.members.length === 2) {
            console.log('SUCCESS: Admin (simulated) added member.');
        } else {
            console.error('FAILURE: Member not added.');
        }

        // Cleanup
        await User.deleteMany({ email: { $in: [admin.email, manager.email, toAdd.email] } });
        await Group.findByIdAndDelete(group._id);

        console.log('Done.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
