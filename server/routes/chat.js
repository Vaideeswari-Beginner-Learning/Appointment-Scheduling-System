const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

// GET all messages for an appointment
router.get('/:appointmentId', auth, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'Invalid appointment ID format' });
        }
        const messages = await ChatMessage.find({ appointmentId })
            .sort({ createdAt: 1 })
            .limit(100);

        // Mark messages as read for this user
        await ChatMessage.updateMany(
            { appointmentId, senderId: { $ne: req.user.id }, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// POST a new message
router.post('/:appointmentId', auth, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { message } = req.body;
        if (!message || !message.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'Invalid appointment ID format' });
        }

        // Verify user has access to this appointment
        const appt = await Appointment.findById(appointmentId);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        const isUser = appt.userId?.toString() === req.user.id;
        const isStaff = appt.adminId?.toString() === req.user.id || appt.hrId?.toString() === req.user.id;
        const isClientOwner = appt.clientId?.toString() === req.user.clientId?.toString();
        const isAdmin = ['super-admin', 'client', 'admin'].includes(req.user.role);

        if (!isUser && !isStaff && !isClientOwner && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const chatMsg = new ChatMessage({
            appointmentId,
            senderId: req.user.id,
            senderName: req.user.name,
            senderRole: req.user.role,
            message: message.trim()
        });
        await chatMsg.save();
        res.status(201).json(chatMsg);
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// GET unread count for current user across all appointments
router.get('/unread/count', auth, async (req, res) => {
    try {
        const count = await ChatMessage.countDocuments({
            senderId: { $ne: req.user.id },
            read: false
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Error getting unread count' });
    }
});

module.exports = router;
