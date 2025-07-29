// backend/userRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db'); // Your database connection
const authMiddleware = require('./authMiddleware'); // Your authentication middleware

const router = express.Router();

// --- Get User Profile ---
// This route is protected, so only authenticated users can access their own profile.
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // req.user contains the decoded JWT payload (id, email)
        const userId = req.user.id;

        const result = await db.query(
            'SELECT id, email, first_name, last_name, notification_email_enabled, theme_preference FROM users WHERE id = $1',
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// --- Update User Profile ---
// This route is protected and allows users to update their own profile data.
router.put('/profile', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated token
    const { email, first_name, last_name, notification_email_enabled, theme_preference, current_password, new_password } = req.body;

    try {
        const userQuery = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let hashedPassword = user.password; // Default to current hashed password

        // If new_password is provided, current_password must be validated, and new_password must be hashed
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }

            const isMatch = await bcrypt.compare(current_password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect current password' });
            }

            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(new_password, saltRounds);
        }

        // Construct the update query dynamically based on provided fields
        const updateFields = [];
        const queryParams = [userId];
        let paramIndex = 2; // Start index for parameters after userId

        if (email !== undefined) {
            // Check if new email already exists for another user
            if (email !== req.user.email) { // Only check if email is actually changing
                const existingEmail = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
                if (existingEmail.rows.length > 0) {
                    return res.status(409).json({ message: 'Email already in use by another account' });
                }
            }
            updateFields.push(`email = $${paramIndex++}`);
            queryParams.push(email);
        }
        if (first_name !== undefined) {
            updateFields.push(`first_name = $${paramIndex++}`);
            queryParams.push(first_name);
        }
        if (last_name !== undefined) {
            updateFields.push(`last_name = $${paramIndex++}`);
            queryParams.push(last_name);
        }
        if (notification_email_enabled !== undefined) {
            updateFields.push(`notification_email_enabled = $${paramIndex++}`);
            queryParams.push(notification_email_enabled);
        }
        if (theme_preference !== undefined) {
            updateFields.push(`theme_preference = $${paramIndex++}`);
            queryParams.push(theme_preference);
        }
        // Only update password if a new one was provided and successfully hashed
        if (new_password) {
            updateFields.push(`password = $${paramIndex++}`);
            queryParams.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $1 RETURNING id, email, first_name, last_name, notification_email_enabled, theme_preference`;

        const updatedResult = await db.query(updateQuery, queryParams);
        const updatedUser = updatedResult.rows[0];

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

module.exports = router;