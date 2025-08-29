const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const seedRoles = require('./config/db-seeder');
const { createProxyMiddleware,responseInterceptor } =require("http-proxy-middleware");



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


// The external site you want to embed
const TARGET = "https://app.periodicalservices.com";

// Optional: make Express not add its own headers
app.disable("x-powered-by");

// For all routes under /mi-form, make sure we don't send our own CSP/XFO
app.use(
  "/mi-form",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,

    // Strip /mi-form before sending upstream
    pathRewrite: (path) => path.replace(/^\/mi-form/, ""),

    selfHandleResponse: true, // so we can modify HTML

    onProxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
      // Remove blocking headers
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy-report-only"];

      const ct = proxyRes.headers["content-type"] || "";
      if (!ct.includes("text/html")) {
        return buffer; // not HTML, just return raw
      }

      let html = buffer.toString("utf8");

      // Inject <base> so relative links work
      html = html.replace(/<head([^>]*)>/i, `<head$1><base href="/mi-form/">`);

      // Rewrite URLs so assets also proxy through /mi-form
      html = html
        .replace(/https?:\/\/app\.periodicalservices\.com/gi, "/mi-form")
        .replace(/src="\//gi, 'src="/mi-form/')
        .replace(/href="\//gi, 'href="/mi-form/')
        .replace(/url\(\//gi, "url(/mi-form/)")
        .replace(/srcset="\//gi, 'srcset="/mi-form/');

      return html;
    }),

    onError(err, req, res) {
      console.error("Proxy error:", err?.message);
      res.status(502).send("Proxy error");
    },
  })
);


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
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

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
