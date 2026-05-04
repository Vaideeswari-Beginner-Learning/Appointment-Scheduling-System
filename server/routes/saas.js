const express = require('express');
const router = express.Router();
const SaaSRequest = require('../models/SaaSRequest');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Submit a request (Client only)
router.post('/request', auth, authorize('client'), async (req, res) => {
    try {
        const { type, message } = req.body;
        console.log(`📩 [SAAS_REQUEST] Incoming: type=${type}, clientId=${req.user.id}, sector=${req.body.sector}`);
        
        const existing = await SaaSRequest.findOne({ 
            clientId: req.user.id, 
            type, 
            status: 'pending' 
        });
        
        if (existing) {
            console.warn(`⚠️ [SAAS_REQUEST] Duplicate pending request for clientId=${req.user.id}, type=${type}`);
            return res.status(400).json({ message: 'You already have a pending request of this type.' });
        }

        const request = new SaaSRequest({
            clientId: req.user.id,
            clientName: req.user.name,
            clientEmail: req.user.email || req.body.email || '',
            type,
            message,
            sector: req.body.sector || 'general',
            status: 'approved' // 🤖 SYSTEM AUTO-APPROVE FOR SEAMLESS TESTING
        });

        await request.save();

        // 🚀 INSTANTLY ELEVATE USER TO PAID TIER
        if (type === 'upgrade_plan' || type === 'full_access') {
            const userToUpdate = await User.findById(req.user.id);
            if (userToUpdate) {
                userToUpdate.plan = {
                    type: 'paid',
                    status: 'active',
                    expiryDate: null, 
                    maxHr: 100,
                    maxEmployees: 500
                };
                await userToUpdate.save();
                console.log(`🤖 [AUTO_LEVEL_UP] System automatically upgraded ${userToUpdate.email} to PRO PLAN`);
            }
        }

        console.log(`✅ [SAAS_REQUEST] Auto-Approved: id=${request._id}`);
        res.status(201).json({ 
            message: 'Request approved automatically! Your account has been upgraded to the Premium Tier.', 
            autoApproved: true 
        });
    } catch (err) {
        console.error(`❌ [SAAS_REQUEST] Error:`, err.message);
        res.status(500).json({ message: err.message });
    }
});

// Get all requests (Super Admin only)
router.get('/requests', auth, authorize('super-admin'), async (req, res) => {
    try {
        const requests = await SaaSRequest.find().sort({ createdAt: -1 }).populate('clientId', 'name email organizationName');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update request status (Super Admin only)
router.patch('/requests/:id', auth, authorize('super-admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const request = await SaaSRequest.findById(req.params.id);
        
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // If approved, automatically update the user's plan
        if (status === 'approved' && request.status !== 'approved') {
            const userToUpdate = await User.findById(request.clientId);
            if (userToUpdate) {
                if (request.type === 'upgrade_plan' || request.type === 'full_access') {
                    userToUpdate.plan = {
                        type: 'paid',
                        status: 'active',
                        expiryDate: null, // Pro plans active indefinitely until cancelled
                        maxHr: 100,
                        maxEmployees: 500
                    };
                    console.log(`🚀 [SAAS_APPROVAL] Upgraded ${userToUpdate.email} to PRO PLAN`);
                } else if (request.type === 'extend_trial') {
                    const currentExpiry = userToUpdate.plan?.expiryDate ? new Date(userToUpdate.plan.expiryDate) : new Date();
                    const newExpiry = new Date(Math.max(currentExpiry, new Date())); // Extend from now or current expiry
                    newExpiry.setHours(newExpiry.getHours() + 24);
                    
                    userToUpdate.plan = {
                        ...userToUpdate.plan,
                        expiryDate: newExpiry,
                        status: 'active'
                    };
                    console.log(`⏳ [SAAS_APPROVAL] Extended trial for ${userToUpdate.email} until ${newExpiry}`);
                }
                await userToUpdate.save();
            }
        }

        request.status = status;
        await request.save();
        
        res.json({ message: `Request ${status} successfully`, request });
    } catch (err) {
        console.error('❌ [SAAS_APPROVAL_ERROR]:', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
