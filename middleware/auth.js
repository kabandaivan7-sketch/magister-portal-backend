const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided. Authentication required.' 
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('FATAL: JWT_SECRET environment variable is not set');
            return res.status(500).json({ 
                message: 'Server configuration error' 
            });
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET
        );
        
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ 
                message: 'User not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            message: 'Invalid or expired token' 
        });
    }
};

module.exports = auth;

