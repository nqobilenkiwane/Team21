// backend/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    // Get token from header (usually 'Bearer TOKEN')
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Token format is incorrect (e.g., missing Bearer prefix), authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload to the request object
        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid token, authorization denied' }); // Forbidden if token is invalid
    }
};

module.exports = authMiddleware;