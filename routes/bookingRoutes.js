const express = require('express');
const pool = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// User Signup
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);
        res.status(201).send('User registered successfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!user.rows.length) return res.status(400).send('User not found');
        
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).send('Invalid credentials');
        
        const token = jwt.sign({ userId: user.rows[0].user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch Seats
router.get('/seats', async (req, res) => {
    try {
        const seats = await pool.query('SELECT * FROM seats ORDER BY row_number, seat_id');
        res.json(seats.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Book Seats
router.post('/book', authMiddleware, async (req, res) => {
    const { userId } = req.user;
    const { seatCount } = req.body;

    try {
        const availableSeats = await pool.query('SELECT * FROM seats WHERE is_available = TRUE ORDER BY row_number, seat_id LIMIT $1', [seatCount]);
        if (availableSeats.rows.length < seatCount) return res.status(400).send('Not enough seats available');
        
        const seatIds = availableSeats.rows.map(seat => seat.seat_id);
        await pool.query('UPDATE seats SET is_available = FALSE, reserved_by = $1 WHERE seat_id = ANY($2::int[])', [userId, seatIds]);

        res.json({ bookedSeats: seatIds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel Booking
router.delete('/cancel/:bookingId', authMiddleware, async (req, res) => {
    const { userId } = req.user;
    const { bookingId } = req.params;

    try {
        const booking = await pool.query('SELECT * FROM bookings WHERE booking_id = $1 AND user_id = $2', [bookingId, userId]);
        if (!booking.rows.length) return res.status(400).send('Booking not found');

        const seatIds = booking.rows[0].seats_reserved;
        await pool.query('UPDATE seats SET is_available = TRUE, reserved_by = NULL WHERE seat_id = ANY($1::int[])', [seatIds]);
        await pool.query('DELETE FROM bookings WHERE booking_id = $1', [bookingId]);

        res.send('Booking canceled successfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
