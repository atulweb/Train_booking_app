const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        console.log('No token provided');
        return res.status(403).send('Access denied');
    }

    const bearerToken = token.split(' ')[1];  // Extract token from 'Bearer <token>'
    if (!bearerToken) {
        console.log('No Bearer token');
        return res.status(403).send('Access denied');
    }

    try {
        const decoded = jwt.verify(bearerToken, process.env.SECRET_KEY);
        console.log("Decoded token: ", decoded);  // Log decoded token for debugging
        req.user = decoded;  // Add user info to request object
        next();  // Pass control to the next handler
    } catch (err) {
        console.error("Token verification failed: ", err);
        res.status(401).send('Invalid token');
    }
};
