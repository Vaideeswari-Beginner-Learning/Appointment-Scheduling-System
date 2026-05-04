const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

// POST - Initiate a payment (simulated)
router.post('/create-order', auth, async (req, res) => {
    try {
        const { appointmentId, amount, method } = req.body;
        if (!appointmentId || !amount) return res.status(400).json({ message: 'appointmentId and amount are required' });

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'Invalid appointment ID format' });
        }

        const appt = await Appointment.findById(appointmentId);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        // Simulate a payment order (replace with Razorpay in production)
        const orderId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        res.json({
            success: true,
            orderId,
            amount,
            currency: 'INR',
            method: method || 'upi',
            appointmentId
        });
    } catch (err) {
        res.status(500).json({ message: 'Payment initiation failed', error: err.message });
    }
});

// POST - Verify & confirm payment
router.post('/verify', auth, async (req, res) => {
    try {
        const { appointmentId, orderId, amount, method } = req.body;
        const mongoose = require('mongoose');
        if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'Valid appointmentId is required' });
        }

        const appt = await Appointment.findById(appointmentId);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        // Simulate payment verification (always succeeds in simulation)
        appt.payment = {
            status: 'paid',
            method: method || 'upi',
            transactionId: orderId,
            amount: amount,
            paidAt: new Date()
        };
        appt.status = 'confirmed';
        await appt.save();

        res.json({ success: true, message: 'Payment verified and appointment confirmed!', appointment: appt });
    } catch (err) {
        res.status(500).json({ message: 'Payment verification failed', error: err.message });
    }
});

// GET - Payment status for an appointment
router.get('/status/:appointmentId', auth, async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.appointmentId).select('payment status');
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });
        res.json({ payment: appt.payment, status: appt.status });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching payment status' });
    }
});

module.exports = router;
