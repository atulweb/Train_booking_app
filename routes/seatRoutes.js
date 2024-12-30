const express = require('express');
const pool = require('../models/db');
const authMiddleware = require('../middlewares/authMiddleware'); // Import the auth middleware

const router = express.Router();

// Get all seats
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM seats ORDER BY row_number, seat_number');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Book seats (protected route)
router.post('/book', authMiddleware, async (req, res) => {  // Apply authMiddleware here
    const { seatCount, userId } = req.body;
    try {
        const seats = await pool.query('SELECT * FROM seats WHERE is_available = TRUE ORDER BY row_number, seat_number LIMIT $1', [seatCount]);
        if (seats.rows.length < seatCount) return res.status(400).send('Not enough seats available');

        const seatIds = seats.rows.map((seat) => seat.seat_id);
        await pool.query('UPDATE seats SET is_available = FALSE, user_id = $1 WHERE seat_id = ANY($2::int[])', [userId, seatIds]);
        res.json({ bookedSeats: seatIds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
