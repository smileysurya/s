const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbFallback = require('../utils/dbFallback');

const fallbackUsers = dbFallback('users');

// Helper to safely get the User model (only works when Mongo is connected)
function getUserModel() {
    try { return require('../models/User'); } catch(e) { return null; }
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        const User = getUserModel();
        let user;
        if (req.isMongoConnected && User) {
            user = await User.findOne({ email });
        } else {
            user = await fallbackUsers.findOne({ email });
        }

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        if (req.isMongoConnected && User) {
            user = new User(userData);
            await user.save();
        } else {
            user = await fallbackUsers.save(userData);
        }

        const userId = user._id || user.id;

        const payload = {
            user: {
                id: userId
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '100h' });
        res.json({ token, user: { id: userId, name: user.name, email: user.email } });
    } catch (err) {
        console.error('REGISTER ERROR:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const User = getUserModel();
        let user;
        if (req.isMongoConnected && User) {
            user = await User.findOne({ email });
        } else {
            user = await fallbackUsers.findOne({ email });
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const userId = user._id || user.id;

        const payload = {
            user: {
                id: userId
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '100h' });
        res.json({ token, user: { id: userId, name: user.name, email: user.email } });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

        const User = getUserModel();
        let user;
        if (req.isMongoConnected && User) {
            user = await User.findById(decoded.user.id).select('-password');
        } else {
            user = await fallbackUsers.findOne({ _id: decoded.user.id });
            if (user) {
                const { password, ...safeUser } = user;
                user = safeUser;
            }
        }

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('PROFILE ERROR:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
});

// Update Profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

        const { name, phone, address } = req.body;

        const User = getUserModel();
        let user;
        if (req.isMongoConnected && User) {
            user = await User.findById(decoded.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (name) user.name = name;
            if (phone) user.phone = phone;
            if (address) user.address = address;
            await user.save();
        } else {
            user = await fallbackUsers.findOne({ _id: decoded.user.id });
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (name) user.name = name;
            if (phone) user.phone = phone;
            if (address) user.address = address;
            user = await fallbackUsers.updateOne({ _id: decoded.user.id }, {
                name: user.name,
                phone: user.phone,
                address: user.address
            });
        }

        res.json(user);
    } catch (err) {
        console.error('PROFILE UPDATE ERROR:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
