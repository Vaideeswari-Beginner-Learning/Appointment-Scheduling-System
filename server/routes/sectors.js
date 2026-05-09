const express = require('express');
const router = express.Router();
const Sector = require('../models/Sector');
const { auth, authorize } = require('../middleware/auth');

// Get all sectors
router.get('/', async (req, res) => {
    try {
        const sectors = await Sector.find().sort({ createdAt: -1 });
        res.json(sectors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create sector (Super Admin only)
router.post('/', auth, authorize('super-admin'), async (req, res) => {
    try {
        const { name, description, category, icon } = req.body;
        if (!name) return res.status(400).json({ message: 'Sector name is required' });
        if (!category) return res.status(400).json({ message: 'Category is required' });

        const exists = await Sector.findOne({ name });
        if (exists) return res.status(400).json({ message: 'Sector already exists' });

        const sector = new Sector({ name, description, category, icon });
        await sector.save();
        res.status(201).json(sector);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update sector (Name/Desc/Status)
router.patch('/:id', auth, authorize('super-admin'), async (req, res) => {
    try {
        const { name, description, isActive, category, icon } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (icon !== undefined) updateData.icon = icon;
        if (isActive !== undefined) updateData.isActive = isActive;

        const sector = await Sector.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!sector) return res.status(404).json({ message: 'Sector not found' });
        
        res.json(sector);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete sector (Super Admin only)
router.delete('/:id', auth, authorize('super-admin'), async (req, res) => {
    try {
        const sector = await Sector.findByIdAndDelete(req.params.id);
        if (!sector) return res.status(404).json({ message: 'Sector not found' });
        res.json({ message: 'Sector deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
