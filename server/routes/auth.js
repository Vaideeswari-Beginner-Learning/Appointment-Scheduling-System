const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, userType, clientId, sectorId, sector } = req.body;
        const normalizedEmail = email ? email.trim().toLowerCase() : undefined;

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ message: 'This email is already registered. Please try logging in instead.' });
        }

        // Inherit UserType and Sector from Client if provided
        let finalUserType = userType || 'individual';
        let finalSector = sector || 'General Services';
        let finalSectorId = sectorId || null;

        if (clientId) {
            const clientOrg = await User.findById(clientId);
            if (clientOrg) {
                if (clientOrg.userType) finalUserType = clientOrg.userType;
                if (clientOrg.sector) finalSector = clientOrg.sector;
                if (clientOrg.sectorId) finalSectorId = clientOrg.sectorId;
            }
        }

        // Approval Logic
        // Staff (Doctors/HR) require Admin Approval
        let isApproved = true;
        if (role === 'hr' || role === 'doctor' || finalUserType === 'hospital' || finalUserType === 'interview') {
            isApproved = false;
        }

        user = new User({ 
            name, 
            email: normalizedEmail, 
            password, 
            role: role || 'user', 
            userType: finalUserType,
            isApproved,
            clientId: clientId || null,
            sectorId: finalSectorId,
            sector: finalSector,
            plan: {
                type: 'free',
                status: 'active',
                expiryDate: role === 'client' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null, // 1 Day for clients
                maxHr: 2,
                maxEmployees: 10,
                maxBookings: 50,
                maxServices: 5,
                price: 0
            }
        });
        await user.save();

        if (user.role === 'client' && !user.clientId) {
            user.clientId = user._id;
            await user.save();
        }

        const token = jwt.sign({ 
            id: user._id, 
            name: user.name,
            email: user.email,
            role: user.role,
            clientId: user.clientId 
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                name, 
                email, 
                role: user.role, 
                userType: user.userType,
                clientId: user.clientId,
                sector: user.sector,
                plan: user.plan
            } 
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email ? email.trim().toLowerCase() : '';
        console.log('--- LOGIN ATTEMPT ---');
        console.log('Email:', normalizedEmail);
        
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(400).json({ message: 'User not found. Please register. (Note: HR accounts must be created by Admin)' });
        }

        console.log('User found:', user.email, 'Role:', user.role);
        const isMatch = user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch for', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // --- REMOVED LOGIN-LESS REJECTION ---
        // Users who explicitly register should be allowed to login.
        // Guests move through the phone-based tracking system without passwords.

        if (user.isBlocked) {
            console.log('Login failed: User blocked');
            return res.status(403).json({ message: 'Your account has been blocked by an administrator.' });
        }

        if (!user.isApproved) {
            console.log('Login failed: User not approved');
            return res.status(403).json({ 
                message: 'Your account is pending administrator approval. Please check back later or contact your system admin.' 
            });
        }

        const token = jwt.sign({ 
            id: user._id, 
            name: user.name,
            email: user.email,
            role: user.role,
            clientId: user.clientId 
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                department: user.department || null,
                userType: user.userType || 'client',
                clientId: user.clientId,
                sector: user.sector || 'general',
                plan: user.plan
            } 
        });
    } catch (error) {
        console.error("Login Error Details:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get User
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
