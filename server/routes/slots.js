const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const { auth, authorize, tenantGuard, planGuard } = require('../middleware/auth');

// Create Slot (Tenant isolated)
router.post('/', [auth, planGuard, tenantGuard, authorize(['admin', 'hr', 'client', 'employee'])], async (req, res) => {
    try {
        let { date, startTime, endTime, type, bufferTime, serviceId } = req.body;
        
        // Auto-calculate missing endTime (1 hour duration) to satisfy schema
        if (!endTime && startTime) {
            const [hours, minutes] = startTime.split(':');
            let endHour = parseInt(hours, 10) + 1;
            endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
        }

        const slotData = {
            adminId: req.user.id,
            date,
            startTime,
            endTime,
            type,
            bufferTime,
            professionalName: req.body.professionalName || req.user.name,
            professionalId: req.body.professionalId || req.user.id,
            clientId: req.user.clientId
        };
        
        if (serviceId) {
            slotData.serviceId = serviceId;
        }

        const newSlot = new Slot(slotData);
        await newSlot.save();
        res.status(201).json(newSlot);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get All Slots for Tenant (Client/HR/Admin dashboard view)
router.get('/', [auth, tenantGuard, authorize(['admin', 'hr', 'client', 'super-admin'])], async (req, res) => {
    console.log(`🎰 Incoming request to GET /api/slots for user: ${req.user.id}, role: ${req.user.role}`);
    try {
        const query = req.tenantFilter || {};
        const slots = await Slot.find(query)
            .populate('professionalId', 'name email department')
            .populate('serviceId', 'name duration customFields price category')
            .sort({ date: 1, startTime: 1 });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Available Slots (Public/Tenant aware)
router.get('/available', async (req, res) => {
    try {
        const { date, type, adminId, professionalId, doctorId, clientId, serviceId } = req.query;
        let query = { isBooked: false };
        if (date) query.date = date;
        if (type) query.type = type;
        if (clientId) query.clientId = clientId;
        if (serviceId) query.serviceId = serviceId;
        
        // Handle multiple ID aliases for professional slots
        const pId = professionalId || doctorId || adminId;
        const mongoose = require('mongoose');
        
        if (pId && mongoose.Types.ObjectId.isValid(pId)) {
            query.$or = [
                { professionalId: pId },
                { adminId: pId }
            ];
        } else if (pId && (pId === 'undefined' || pId === 'null')) {
            // If it's literally the string "undefined", we skip adding the filter
            // but we don't throw an error.
            console.log(`⚠️  Ignoring invalid pId string: ${pId}`);
        } else if (pId) {
            // If it's a non-null, non-undefined string that's not a valid ObjectId
            // we could return a 400 but for now let's just skip it to be safe 
            // and avoid 500 crashes.
            console.log(`⚠️  Invalid ObjectId format received: ${pId}`);
        }
        
        const slots = await Slot.find(query)
            .populate('adminId', 'name email')
            .populate('professionalId', 'name email');

        // Filter out past slots if the date is today
        const todayStr = new Date().toISOString().split('T')[0];
        if (date === todayStr) {
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();
            
            const filteredSlots = slots.filter(slot => {
                if (!slot.startTime || !slot.startTime.includes(':')) return false;
                const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
                if (isNaN(slotHour) || isNaN(slotMinute)) return false;
                
                if (slotHour > currentHour) return true;
                if (slotHour === currentHour && slotMinute > currentMinute) return true;
                return false;
            });
            return res.json(filteredSlots);
        }

        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a Slot (Admin, HR, Client, Employee)
router.delete('/:id', [auth, planGuard, authorize(['admin', 'hr', 'client', 'employee'])], async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        await Slot.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slot removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
