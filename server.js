const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Train Booking App is running!');
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);


// Seat routes
const seatRoutes = require('./routes/seatRoutes');
app.use('/seats', seatRoutes);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
