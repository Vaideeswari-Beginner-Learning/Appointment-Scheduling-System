const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');

// Get Dashboard Stats (Admin/HR/Client)
router.get('/stats', [auth, authorize(['admin', 'hr', 'super-admin', 'client'])], async (req, res) => {
    try {
        console.log('📊 Analytics request from:', req.user.email, 'Role:', req.user.role);
        const clientFilter = req.user.role === 'super-admin' ? {} : { clientId: req.user.clientId || req.user.id };
        console.log('🔍 Client Filter:', clientFilter);

        const todayStart = new Date(); todayStart.setHours(0,0,0,0);
        const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);

        // For aggregations, we MUST cast strings to ObjectIds manually
        const mongoose = require('mongoose');
        const filter = { ...clientFilter };
        if (filter.clientId && mongoose.Types.ObjectId.isValid(filter.clientId)) {
            filter.clientId = new mongoose.Types.ObjectId(filter.clientId);
        }
        console.log('🎯 Aggregation Filter:', filter);

        const [totalBookings, todayBookings, pendingCount, confirmedCount, completedCount, cancelledCount] = await Promise.all([
            Appointment.countDocuments(clientFilter),
            Appointment.countDocuments({ ...clientFilter, createdAt: { $gte: todayStart, $lte: todayEnd } }),
            Appointment.countDocuments({ ...clientFilter, status: 'pending' }),
            Appointment.countDocuments({ ...clientFilter, status: { $in: ['confirmed', 'approved', 'accepted', 'ongoing'] } }),
            Appointment.countDocuments({ ...clientFilter, status: 'completed' }),
            Appointment.countDocuments({ ...clientFilter, status: { $in: ['cancelled', 'rejected'] } })
        ]);

        // Revenue: sum of paid appointment amounts
        const revenueAgg = await Appointment.aggregate([
            { $match: { ...filter, 'payment.status': 'paid' } },
            { $group: { _id: null, total: { $sum: '$payment.amount' } } }
        ]);
        const revenue = revenueAgg[0]?.total || 0;

        // Last 7 days trend
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            const count = await Appointment.countDocuments({
                ...clientFilter,
                createdAt: { $gte: new Date(ds + 'T00:00:00Z'), $lte: new Date(ds + 'T23:59:59Z') }
            });
            last7Days.push({ date: ds, count });
        }

        res.json({ totalBookings, todayBookings, pendingCount, confirmedCount, completedCount, cancelledCount, revenue, last7Days });
    } catch (error) {
        console.error('❌ Analytics Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
    }
});

// Get Analytics for a Specific Doctor (Admin/HR only)
router.get('/doctor/:id', [auth, authorize(['admin', 'hr'])], async (req, res) => {
    try {
        const doctorId = req.params.id;
        const mongoose = require('mongoose');
        
        // 1. Total Unique Patients
        const totalPatients = (await Appointment.distinct('userId', { adminId: doctorId })).length;
        
        // 2. Total Appointments
        const totalAppointments = await Appointment.countDocuments({ adminId: doctorId });
        
        // 3. Status Counts
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'Invalid professional ID format' });
        }

        const statusStats = await Appointment.aggregate([
            { $match: { adminId: new mongoose.Types.ObjectId(doctorId) } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const completed = statusStats.find(s => s._id === 'completed')?.count || 0;
        const cancelled = statusStats.find(s => s._id === 'cancelled')?.count || 0;
        const pending = statusStats.find(s => s._id === 'pending')?.count || 0;
        const approved = statusStats.find(s => s._id === 'approved')?.count || 0;

        // 4. Revenue (Mock: ₹500 per completed appointment)
        const revenue = completed * 500;

        // 5. Appointments over time (Last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
            const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

            const count = await Appointment.countDocuments({
                adminId: doctorId,
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });
            last7Days.push({ date: dateStr, count });
        }

        res.json({
            totalPatients,
            totalAppointments,
            completed,
            cancelled,
            pending,
            approved,
            revenue,
            last7Days
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

