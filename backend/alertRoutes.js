// backend/alertRoutes.js
const express = require('express');
const db = require('./db'); // Your database connection
const authMiddleware = require('./authMiddleware'); // Your authentication middleware

const router = express.Router();

// --- Get All Alerts for the Authenticated User (GET /api/alerts) ---
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated token

    try {
        const query = `
            SELECT id, user_id, title, status, timestamp
            FROM alerts
            WHERE user_id = $1
            ORDER BY timestamp DESC; -- Order by newest first
        `;
        const { rows } = await db.query(query, [userId]);
        res.status(200).json({ alerts: rows });

    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ message: 'Server error fetching alerts' });
    }
});

// Optional: Endpoint to create a sample alert (useful for seeding data)
router.post('/', authMiddleware, async (req, res) => {
    const { title, status } = req.body;
    const userId = req.user.id;

    if (!title) {
        return res.status(400).json({ message: 'Alert title is required' });
    }

    try {
        const query = `
            INSERT INTO alerts (user_id, title, status)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, title, status, timestamp;
        `;
        const values = [userId, title, status || 'new']; // Default status to 'new'

        const { rows } = await db.query(query, values);
        res.status(201).json({ message: 'Alert created successfully', alert: rows[0] });

    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ message: 'Server error creating alert' });
    }
});

// Optional: Endpoint to update alert status (e.g., mark as read)
router.put('/:id/status', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const query = `
            UPDATE alerts
            SET status = $1
            WHERE id = $2 AND user_id = $3
            RETURNING id, user_id, title, status, timestamp;
        `;
        const { rows } = await db.query(query, [status, id, userId]);
        const updatedAlert = rows[0];

        if (!updatedAlert) {
            return res.status(404).json({ message: 'Alert not found or not authorized to update' });
        }

        res.status(200).json({ message: 'Alert status updated successfully', alert: updatedAlert });

    } catch (error) {
        console.error('Error updating alert status:', error);
        res.status(500).json({ message: 'Server error updating alert status' });
    }
});


module.exports = router;