const Role = require('../models/Role');

/**
 * Seed initial roles data
 */
const seedRoles = async () => {
  try {
    console.log('Checking default roles...');

    // Default roles with permissions
    const defaultRoles = [
      {
        name: 'user',
        permissions: ['read:own', 'create:own', 'update:own', 'delete:own'],
        description: 'Regular user with basic privileges'
      },
      {
        name: 'moderator',
        permissions: ['read:own', 'read:any', 'create:own', 'update:own', 'update:any'],
        description: 'Moderator with elevated privileges'
      },
      {
        name: 'admin',
        permissions: ['read:own', 'read:any', 'create:own', 'create:any', 'update:own', 'update:any', 'delete:own', 'delete:any', 'admin:access'],
        description: 'Administrator with full system access'
      }
    ];

    for (const role of defaultRoles) {
      // Check if role exists
      const existingRole = await Role.findOne({ name: role.name });

      if (!existingRole) {
        // Create role if it doesn't exist
        await Role.create(role);
        console.log(`Created ${role.name} role`);
      } else {
        // Update permissions if role exists
        existingRole.permissions = role.permissions;
        existingRole.description = role.description;
        await existingRole.save();
        console.log(`Updated ${role.name} role`);
      }
    }

    console.log('Default roles have been seeded');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};

module.exports = seedRoles; 