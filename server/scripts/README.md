# Database Migration Scripts

## Project Name Correction Script

This script corrects incorrect project names that were stored in the database.

### Corrections Made:
- `Sempris Project` → `SC Project`
- `Radius Project` → `FRP Project`
- `PSOnline Project` → `MDI Project`

### How to Run:

#### Option 1: Via Admin Panel (Recommended)
1. Log in as an admin user
2. Go to Order Management page
3. Click the "Fix Project Names" button
4. Confirm the operation when prompted

#### Option 2: Manual Script Execution
```bash
# From the server directory
cd auth-system/server

# Run the detailed migration script
node scripts/fix-project-names.js

# Or run the quick fix (if you have the DB connection in your main app)
node -e "
const mongoose = require('mongoose');
const { quickFixProjects } = require('./scripts/quick-fix-projects');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await quickFixProjects();
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
"
```

#### Option 3: MongoDB Direct Query
```javascript
// Connect to your MongoDB and run these queries:

// Update Sempris Project → SC Project
db.orders.updateMany(
  { "project": "Sempris Project" },
  { $set: { "project": "SC Project" } }
)

// Update Radius Project → FRP Project
db.orders.updateMany(
  { "project": "Radius Project" },
  { $set: { "project": "FRP Project" } }
)

// Update PSOnline Project → MDI Project
db.orders.updateMany(
  { "project": "PSOnline Project" },
  { $set: { "project": "MDI Project" } }
)
```

### Verification:
After running the script, you can verify the changes by checking the project distribution:

```javascript
// Check current project distribution
db.orders.aggregate([
  {
    $group: {
      _id: "$project",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

### Safety Notes:
- ✅ The script only updates specific incorrect project names
- ✅ Uses MongoDB's `updateMany` which is atomic
- ✅ Provides detailed logging of what was changed
- ✅ Shows before/after project distributions
- ✅ Includes verification checks

The script is safe to run multiple times - it will only update records that still have the old project names.
