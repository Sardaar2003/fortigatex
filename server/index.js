const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const seedRoles = require('./config/db-seeder');

// Load environment variables
dotenv.config();

// Debug logging for environment variables
console.log('Environment variables loaded:');
console.log('PSONLINE_API_KEY:', process.env.PSONLINE_API_KEY ? 'Present' : 'Missing');
console.log('PSONLINE_MERCHANT_ID:', process.env.PSONLINE_MERCHANT_ID ? 'Present' : 'Missing');
console.log('Current working directory:', process.cwd());
console.log('Environment file path:', path.resolve('.env'));

// Create Express app
const app = express();

// --- CORS CONFIGURATION: MUST BE FIRST MIDDLEWARE ---
const corsOptions = {
  origin: [
    'https://fortigatex-client.onrender.com', // deployed frontend
    'https://fortigatex.onrender.com',        // deployed backend (if needed)
    'http://localhost:3000',                  // local dev frontend
    'http://localhost:5000'                   // local dev backend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));
// --- END CORS CONFIGURATION ---

app.use(express.json());

// CORS test endpoint (for debugging)
app.options('/api/*', cors(corsOptions));
app.get('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS is working!', origin: req.headers.origin });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Seed database with initial roles
    seedRoles();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const orderRoutes = require('./routes/orders');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/orders', orderRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers
  });
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
}); 
