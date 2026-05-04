const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Service = require('../models/Service');
const Slot = require('../models/Slot');
const User = require('../models/User');
const { auth, authorize, tenantGuard, planGuard } = require('../middleware/auth');

/**
 * Universal Service Routes
 * Services are tenant-scoped — each client sees only their own services.
 */

// ─── PUBLIC: Get services for a specific tenant (for public booking pages)
router.get('/public/:clientId', async (req, res) => {
    try {
        console.log(`🔍 Fetching public services for clientId: ${req.params.clientId}`);
        
        const services = await Service.find({
            clientId: req.params.clientId,
            isActive: true
        });

        const todayStr = new Date().toISOString().split('T')[0];

        const servicesWithStaff = await Promise.all(services.map(async (service) => {
            // Find unique staff IDs who have slots for this service
            const slots = await Slot.find({ 
                serviceId: service._id, 
                isBooked: false,
                date: { $gte: todayStr }
            });
            
            const staffIds = slots
                .map(s => s.professionalId || s.adminId)
                .filter(id => id != null)
                .map(id => id.toString());
            
            const uniqueStaffIds = [...new Set(staffIds)].filter(id => mongoose.Types.ObjectId.isValid(id));
            
            // Fetch their details
            const staffDetails = await User.find({ _id: { $in: uniqueStaffIds } }).select('name role bio avatar specialty department');
            
            return {
                ...service.toObject(),
                assignedStaff: staffDetails
            };
        }));

        res.json(servicesWithStaff);
    } catch (err) {
        console.error('❌ Public services fetch error:', err);
        res.status(500).json({ message: 'Internal Server Error. Please check backend logs.' });
    }
});

// ─── AUTHENTICATED: Get MY services (tenant-scoped)
// Used by Client Dashboard and by the booking page after login
router.get('/', auth, tenantGuard, async (req, res) => {
    try {
        // super-admin sees all; client sees only their own (tenantFilter set by tenantGuard)
        const services = await Service.find({ ...req.tenantFilter, isActive: true });
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Alias route for backward compatibility
router.get('/all', auth, tenantGuard, async (req, res) => {
    try {
        const services = await Service.find({ ...req.tenantFilter, isActive: true });
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Get single service (for booking page to render the dynamic form)
router.get('/:id', auth, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── CLIENT/HR: Create a new Service with custom fields
router.post('/', auth, planGuard, authorize(['client', 'hr', 'super-admin']), tenantGuard, async (req, res) => {
    try {
        const { name, description, price, duration, category, customFields } = req.body;

        // Determine which clientId to associate this service with
        const clientId = req.user.role === 'super-admin'
            ? req.body.clientId  // Super admin can specify
            : req.user.clientId; // Client/HR uses their own tenant

        if (!clientId) {
            return res.status(400).json({ message: 'clientId is required to create a service' });
        }

        const service = new Service({
            name,
            description,
            price: price || 0,
            duration: duration || 30,
            category: category || 'General',
            customFields: customFields || [],
            clientId,
            createdBy: req.user.id,
        });

        await service.save();
        res.status(201).json(service);
    } catch (err) {
        console.error('Service create error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── Update service (including updating custom fields)
router.patch('/:id', auth, planGuard, authorize(['client', 'hr', 'super-admin']), async (req, res) => {
    try {
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, clientId: req.user.clientId || req.body.clientId },
            req.body,
            { new: true }
        );
        if (!service) return res.status(404).json({ message: 'Service not found or access denied' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Soft-delete (deactivate) service
router.delete('/:id', auth, planGuard, authorize(['client', 'hr', 'super-admin']), async (req, res) => {
    try {
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, clientId: req.user.clientId },
            { isActive: false },
            { new: true }
        );
        if (!service) return res.status(404).json({ message: 'Service not found or access denied' });
        res.json({ message: 'Service deactivated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
