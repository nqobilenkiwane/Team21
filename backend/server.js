// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const diagnosticTestRoutes = require('./diagnosticTestRoutes');
const alertRoutes = require('./alertRoutes'); // <-- Import new alert routes
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Public Routes ---
app.get("/api/health", async (req, res) => {
  try {
    await db.query('SELECT 1 + 1 AS solution');
    res.json({ status: "Server is running!", database: "Connected to PostgreSQL" });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ status: "Server is running, but database connection failed!", error: error.message });
  }
});

// Authentication routes (registration and login) - these are public
app.use('/api/auth', authRoutes);


// --- Protected Routes ---
// Apply authMiddleware to all routes under /api/user
app.use('/api/user', authMiddleware, userRoutes);

// Apply authMiddleware to all routes under /api/diagnostic-tests
app.use('/api/diagnostic-tests', authMiddleware, diagnosticTestRoutes);

// New: Apply authMiddleware to all routes under /api/alerts
app.use('/api/alerts', authMiddleware, alertRoutes); // <-- New: Protected alert routes


// Example of a protected route (can keep or remove)
app.get('/api/protected-route', authMiddleware, (req, res) => {
    res.json({ message: `Welcome ${req.user.email}! You accessed a protected route.`, user: req.user });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});