// backend/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Your database connection
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// --- User Registration Route ---
router.post('/register', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const saltRounds = 10; // The cost factor for hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the database
        const result = await db.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
            [email, hashedPassword, first_name, last_name]
        );

        const newUser = result.rows[0];
        // Don't send the hashed password back
        delete newUser.password;

        res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// --- User Login Route ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Retrieve user from database
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' }); // User not found
        }

        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Passwords don't match
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload for the token
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send token and basic user info (without password)
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });

    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;