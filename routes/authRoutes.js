const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../models/db'); // Ensure this path is correct
const router = express.Router();

console.log("Auth routes initialized");

router.post('/signup', async (req, res) => {
    console.log("Signup endpoint hit");
    const { name, email, password } = req.body;
    console.log("Signup payload:", req.body);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        );
        res.status(201).send('User registered successfully!');
    } catch (err) {
        console.error("Error during signup:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    console.log("Login endpoint hit");
    const { email, password } = req.body;
    console.log("Login payload:", req.body);

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!user.rows.length) {
            console.log("User not found for email:", email);
            return res.status(404).send('User not found');
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            console.log("Invalid credentials for email:", email);
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user.rows[0].user_id },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );
        console.log("Token generated:", token);

        res.json({ token });
    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
