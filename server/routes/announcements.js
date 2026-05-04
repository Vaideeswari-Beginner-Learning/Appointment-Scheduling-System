const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { auth, authorize } = require('../middleware/auth');

// @route   POST /api/announcements
// @desc    Create an announcement (Admin and HR Only)
// @access  Private/Admin/HR
router.post('/', [auth, authorize(['admin', 'hr'])], async (req, res) => {
    try {
        const { title, message, priority, targetRole, targetDepartment } = req.body;
        
        let finalTargetRole = targetRole || 'all';
        let finalTargetDept = targetDepartment || null;

        // HR staff can ONLY target employees in their own department
        if (req.user.role === 'hr') {
            finalTargetRole = 'employee';
            finalTargetDept = req.user.department;
        }

        const announcement = new Announcement({
            title,
            message,
            priority: priority || 'normal',
            createdBy: req.user.id,
            targetRole: finalTargetRole,
            targetDepartment: finalTargetDept
        });
        await announcement.save();
        res.status(201).json(announcement);
    } catch (err) {
        console.error('❌ Announcement Creation Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/announcements
// @desc    Get active announcements for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { role, department, id } = req.user;
        let query = { isActive: true };

        if (role === 'admin') {
            // Admin sees everything
            query = {}; 
        } else if (role === 'hr') {
            // HR sees Admin announcements targeted at HR/All, plus their OWN announcements
            query.$or = [
                { targetRole: 'hr' },
                { targetRole: 'all' },
                { createdBy: id }
            ];
        } else {
            // Employees/Users see Admin announcements targeted at Employees/All, 
            // PLUS their specific HR's announcements (match department)
            query.$or = [
                { targetRole: 'all' },
                { targetRole: 'employee', targetDepartment: department },
                { targetRole: 'employee', targetDepartment: null } // System-wide employee notices
            ];
        }

        const announcements = await Announcement.find(query)
            .sort({ priority: 1, createdAt: -1 })
            .populate('createdBy', 'name role');
            
        res.json(announcements);
    } catch (err) {
        console.error('❌ Announcement Fetch Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement (Admin Only)
// @access  Private/Admin
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement removed' });
    } catch (err) {
        console.error('❌ Announcement Deletion Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/announcements/:id/toggle
// @desc    Toggle announcement active status (Admin Only)
// @access  Private/Admin
router.patch('/:id/toggle', [auth, authorize('admin')], async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        
        announcement.isActive = !announcement.isActive;
        await announcement.save();
        res.json(announcement);
    } catch (err) {
        console.error('❌ Announcement Toggle Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
