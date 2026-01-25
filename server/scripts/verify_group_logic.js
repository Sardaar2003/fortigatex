const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Group = require('../models/Group');
const User = require('../models/User');
const Order = require('../models/Order');
const Role = require('../models/Role');

dotenv.config();

async function verify() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Setup Data
        console.log('Setting up test data...');
        // Create random suffix to avoid collisions
        const suffix = Date.now();

        // Get or create Role
        let role = await Role.findOne();
        if (!role) {
            role = await Role.create({ name: `test_role_${suffix}` });
        }

        const manager = await User.create({
            name: `Manager ${suffix}`,
            email: `manager${suffix}@test.com`,
            password: 'password123',
            role: role._id
        });

        const member = await User.create({
            name: `Member ${suffix}`,
            email: `member${suffix}@test.com`,
            password: 'password123',
            role: role._id
        });

        console.log(`Created Manager (${manager._id}) and Member (${member._id})`);

        // 2. Test Group Creation (Model)
        console.log('Testing Group Creation...');
        const group = await Group.create({
            name: `Test Group ${suffix}`,
            manager: manager._id,
            members: [manager._id, member._id]
        });
        console.log(`Group created: ${group.name}`);

        // 3. Test Order Aggregation Logic
        console.log('Creating Orders for aggregation test...');
        await Order.create([
            {
                project: 'SC Project',
                status: 'completed',
                user: member._id,
                // fill required fields
                orderDate: '01/01/2025',
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 St',
                city: 'City',
                state: 'NY',
                zipCode: '10001',
                phoneNumber: '1234567890',
                sku: '123',
                sourceCode: '123',
                sessionId: '123',
                creditCardCVV: '123',
                creditCardExpiration: '1225', // MMYY
                productName: 'Test Product',
                creditCardNumber: '1234567890123456', // Required for SC Project
                cardIssuer: 'visa',
                vendorId: '1234'
            },
            {
                project: 'SC Project',
                status: 'pending', // Validation should ignore this
                user: member._id,
                // fill required fields
                orderDate: '01/02/2025',
                firstName: 'Jane',
                lastName: 'Doe',
                address1: '123 St',
                city: 'City',
                state: 'NY',
                zipCode: '10001',
                phoneNumber: '1234567890',
                sku: '123',
                sourceCode: '123',
                sessionId: '124',
                creditCardCVV: '123',
                creditCardExpiration: '1225', // MMYY
                productName: 'Test Product',
                creditCardNumber: '1234567890123456', // Required for SC Project
                cardIssuer: 'visa',
                vendorId: '1234'
            }
        ]);

        console.log('Running Aggregation...');
        const report = await Order.aggregate([
            {
                $match: {
                    user: { $in: group.members }
                }
            },
            {
                $group: {
                    _id: "$user",
                    totalOrders: { $sum: 1 },
                    completedOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        console.log('Report Result:', JSON.stringify(report, null, 2));

        // Verify
        const memberReport = report.find(r => r._id.toString() === member._id.toString());
        if (memberReport && memberReport.totalOrders === 2 && memberReport.completedOrders === 1) {
            console.log('SUCCESS: Aggregation logic verified.');
        } else {
            console.error('FAILURE: Aggregation logic mismatch.');
            console.log('Expected: total 2, completed 1');
            process.exit(1);
        }

        // Cleanup
        console.log('Cleaning up...');
        await Group.findByIdAndDelete(group._id);
        await User.findByIdAndDelete(manager._id);
        await User.findByIdAndDelete(member._id);
        await Order.deleteMany({ user: member._id });

        console.log('Done.');
        process.exit(0);

    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
}

verify();
