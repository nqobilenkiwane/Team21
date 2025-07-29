// backend/diagnosticTestRoutes.js
const express = require('express');
const db = require('./db'); // Your database connection
const authMiddleware = require('./authMiddleware'); // Your authentication middleware

const router = express.Router();

// --- Create Diagnostic Test (POST /api/diagnostic-tests) ---
router.post('/', authMiddleware, async (req, res) => {
    const { name, result, test_date } = req.body;
    const userId = req.user.id; // Get user ID from authenticated token

    if (!name) {
        return res.status(400).json({ message: 'Test name is required' });
    }

    try {
        const query = `
            INSERT INTO diagnostic_tests (user_id, name, result, test_date)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, name, result, test_date, created_at, updated_at;
        `;
        const values = [userId, name, result, test_date || new Date().toISOString()]; // Use current date if not provided

        const { rows } = await db.query(query, values);
        res.status(201).json({ message: 'Diagnostic test created successfully', test: rows[0] });

    } catch (error) {
        console.error('Error creating diagnostic test:', error);
        res.status(500).json({ message: 'Server error creating diagnostic test' });
    }
});

// --- Get All Diagnostic Tests for the Authenticated User (GET /api/diagnostic-tests) ---
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated token

    try {
        const query = `
            SELECT id, user_id, name, result, test_date, created_at, updated_at
            FROM diagnostic_tests
            WHERE user_id = $1
            ORDER BY test_date DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        res.status(200).json({ tests: rows });

    } catch (error) {
        console.error('Error fetching diagnostic tests:', error);
        res.status(500).json({ message: 'Server error fetching diagnostic tests' });
    }
});

// --- Get Single Diagnostic Test by ID (GET /api/diagnostic-tests/:id) ---
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Get user ID from authenticated token

    try {
        const query = `
            SELECT id, user_id, name, result, test_date, created_at, updated_at
            FROM diagnostic_tests
            WHERE id = $1 AND user_id = $2;
        `;
        const { rows } = await db.query(query, [id, userId]);
        const test = rows[0];

        if (!test) {
            return res.status(404).json({ message: 'Diagnostic test not found or not authorized' });
        }

        res.status(200).json({ test });

    } catch (error) {
        console.error('Error fetching single diagnostic test:', error);
        res.status(500).json({ message: 'Server error fetching diagnostic test' });
    }
});

// --- Update Diagnostic Test (PUT /api/diagnostic-tests/:id) ---
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Get user ID from authenticated token
    const { name, result, test_date } = req.body;

    // Build dynamic update query
    const updateFields = [];
    const queryParams = [id, userId]; // First two params are id and user_id
    let paramIndex = 3; // Start index for dynamic fields

    if (name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        queryParams.push(name);
    }
    if (result !== undefined) {
        updateFields.push(`result = $${paramIndex++}`);
        queryParams.push(result);
    }
    if (test_date !== undefined) {
        updateFields.push(`test_date = $${paramIndex++}`);
        queryParams.push(test_date);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    try {
        const query = `
            UPDATE diagnostic_tests
            SET ${updateFields.join(', ')}
            WHERE id = $1 AND user_id = $2
            RETURNING id, user_id, name, result, test_date, created_at, updated_at;
        `;
        const { rows } = await db.query(query, queryParams);
        const updatedTest = rows[0];

        if (!updatedTest) {
            return res.status(404).json({ message: 'Diagnostic test not found or not authorized to update' });
        }

        res.status(200).json({ message: 'Diagnostic test updated successfully', test: updatedTest });

    } catch (error) {
        console.error('Error updating diagnostic test:', error);
        res.status(500).json({ message: 'Server error updating diagnostic test' });
    }
});

// --- Delete Diagnostic Test (DELETE /api/diagnostic-tests/:id) ---
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Get user ID from authenticated token

    try {
        const query = `
            DELETE FROM diagnostic_tests
            WHERE id = $1 AND user_id = $2
            RETURNING id;
        `;
        const { rows } = await db.query(query, [id, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Diagnostic test not found or not authorized to delete' });
        }

        res.status(200).json({ message: 'Diagnostic test deleted successfully', id: rows[0].id });

    } catch (error) {
        console.error('Error deleting diagnostic test:', error);
        res.status(500).json({ message: 'Server error deleting diagnostic test' });
    }
});

module.exports = router;