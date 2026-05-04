const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const User = require('../models/User');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const { auth, authorize, tenantGuard } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { autoAssignStaff } = require('../services/autoAssign');


// Setup Multer for Resume Upload
const storage = multer.diskStorage({
    destination: './uploads/resumes/',
    filename: (req, file, cb) => {
        const userId = req.user ? req.user.id : 'guest';
        cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

const { createMeetEvent } = require('../services/googleCalendarService');

// --- AI MOCK ANALYSIS ---
const simulateAIAnalysis = (role) => {
    const scores = [88, 92, 75, 95, 82];
    const summaries = [
        `Excellent match for ${role}. Candidates background shows strong domain expertise.`,
        `High potential profile. The AI scan identifies core skills critical for ${role}.`,
        `Good fit. AI recommends proceeding to initial technical screening.`,
        "Strong cultural alignment and technical foundation detected.",
        "Candidate shows great analytical aptitude for this specific role."
    ];
    return {
        score: scores[Math.floor(Math.random() * scores.length)],
        summary: summaries[Math.floor(Math.random() * summaries.length)],
        status: 'analyzed'
    };
};

// Helper to validate ObjectId (Prevents CastError/500)
const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id) && id !== 'null' && id !== 'undefined';

// @route   POST api/appointments/apply
// @desc    Apply with resume and AI analysis
// @access  Private (Tenant isolated)
router.post('/apply', [auth, tenantGuard, upload.single('resume')], async (req, res) => {
    try {
        const { role, hrId, purpose } = req.body;

        if (!isValidId(hrId)) return res.status(400).json({ message: 'Invalid HR ID provided' });

        const hrUser = await User.findOne({ _id: hrId, clientId: req.user.clientId });
        if (!hrUser) return res.status(404).json({ message: 'Selected HR/Company not found in your tenant' });

        const aiResult = simulateAIAnalysis(role);
        const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : '';

        const newAppointment = new Appointment({
            userId: req.user.id,
            adminId: hrUser._id,
            hrId: hrUser._id,
            purposeType: 'interview',
            type: 'interview',
            purpose: purpose || `Application for ${role}`,
            role,
            resumeUrl,
            aiAnalysis: aiResult,
            status: 'pending',
            clientId: req.user.clientId
        });

        await newAppointment.save();

        const notification = new Notification({
            userId: hrUser._id,
            message: `New Interview Application from ${req.user.name} for ${role}`
        });
        await notification.save();

        res.json({ success: true, appointment: newAppointment, aiResult });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Application server error' });
    }
});

// @route   GET api/appointments/by-phone/:phone
// @desc    Get appointments by phone number (Public Tracking)
// @access  Public
router.get('/by-phone/:phone', async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientPhone: req.params.phone })
            .populate('hrId', 'name specialty department')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
});

// @route   POST api/appointments/book
// @desc    Book Appointment (Supports guest and authenticated users)
// @access  Public (Guest) / Private (HR/Admin/User)
router.post('/book', upload.single('resume'), async (req, res) => {
    try {
        const { 
            slotId, type, purposeType: rawPurposeType, extra, notes, purpose, 
            booking_type, patientName, patientPhone, patientEmail,
            manualTime, manualDate, clientId: bodyClientId, hrId: bodyHrId,
            serviceId, formData: rawFormData, city, address
        } = req.body;
        
        console.log('📋 BOOK REQUEST fields:', { slotId, bodyClientId, serviceId, patientPhone });

        // Gentle Authentication: Check for token manually since this route is public (allows guests)
        const token = req.header('x-auth-token');
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded.user || decoded;
            } catch (e) {
                console.warn('⚠️ Booking Auth Error:', e.message);
            }
        }

        // Multi-tenant check: 
        // For standard USERS (customers), we MUST use the clientId from the booking page/service.
        // For STAFF (HR/Admin), we use their own clientId if they are creating an offline booking.
        let clientId = bodyClientId;
        if (!clientId && req.user && req.user.role !== 'user') {
            clientId = req.user.clientId;
        }

        // If still no clientId, try fetching it from the service
        if (!clientId && serviceId && isValidId(serviceId)) {
            const service = await Service.findById(serviceId);
            if (service) clientId = service.clientId;
        }
        
        // Detailed validation
        if (!clientId || !isValidId(clientId)) {
            console.warn('⚠️ Booking rejected: Missing or invalid clientId:', clientId);
            return res.status(400).json({ message: 'A valid Client ID is required. Please use the specific organization booking link.' });
        }

        if (serviceId && !isValidId(serviceId)) {
            return res.status(400).json({ message: 'Invalid Service ID provided' });
        }
        // Normalize purposeType & type
        const purposeTypeMap = { hospital: 'doctor' };
        const typeMap = { hospital: 'medical' };
        const purposeType = purposeTypeMap[rawPurposeType] || rawPurposeType;
        const normalizedType = typeMap[type] || type;
        
        let parsedExtra = extra;
        if (typeof extra === 'string') {
            try { parsedExtra = JSON.parse(extra); } catch (e) { parsedExtra = {}; }
        }

        // Handle Slot logic
        let slot = null;
        if (slotId && isValidId(slotId)) {
            slot = await Slot.findById(slotId);
            if (!slot || slot.isBooked) return res.status(400).json({ message: 'Slot not available' });
        }

        // Professional Assignment
        let assignedHR = null;
        let drName = "";
        const selectedProfId = bodyHrId || parsedExtra?.doctorId || req.body.doctorId;

        if (selectedProfId && isValidId(selectedProfId)) {
            const dr = await User.findById(selectedProfId);
            if (dr) {
                assignedHR = dr._id;
                drName = dr.name;
            }
        }

        // Fallback: Smart Auto-Assignment if no staff selected
        if (!assignedHR && clientId) {
            const autoStaff = await autoAssignStaff(clientId, city);
            if (autoStaff) {
                assignedHR = autoStaff._id;
                console.log(`🤖 Auto-assigned to: ${autoStaff.name}`);
            } else {
                const genericHR = await User.findOne({ clientId, role: 'hr' });
                assignedHR = genericHR ? genericHR._id : null;
            }
        }

        // --- OPTION 2: FIND OR CREATE USER ---
        let bookingUserId = req.user ? req.user.id : null;
        if (!bookingUserId && (patientPhone || patientEmail)) {
            let existingUser = null;
            
            // 1. Try finding by phone
            if (patientPhone) {
                existingUser = await User.findOne({ phone: patientPhone, role: 'user' });
            }
            
            // 2. If not found, try finding by email (since email is unique)
            if (!existingUser && patientEmail) {
                existingUser = await User.findOne({ email: patientEmail.toLowerCase(), role: 'user' });
            }

            if (!existingUser) {
                try {
                    existingUser = new User({
                        name: patientName || 'Guest',
                        phone: patientPhone || '',
                        email: patientEmail ? patientEmail.toLowerCase() : undefined,
                        role: 'user',
                        isApproved: true,
                        clientId: clientId
                    });
                    await existingUser.save();
                } catch (saveErr) {
                    // Fallback in case of race condition or other unique constraint
                    console.warn('⚠️ User save fallback:', saveErr.message);
                    existingUser = await User.findOne({ 
                        $or: [
                            ...(patientPhone ? [{ phone: patientPhone }] : []),
                            ...(patientEmail ? [{ email: patientEmail.toLowerCase() }] : [])
                        ],
                        role: 'user' 
                    });
                }
            }
            
            if (existingUser) bookingUserId = existingUser._id;
        }

        let parsedFormData = rawFormData;
        if (typeof rawFormData === 'string') {
            try { parsedFormData = JSON.parse(rawFormData); } catch (e) { parsedFormData = {}; }
        }

        const appointment = new Appointment({
            userId: bookingUserId,
            patientName: patientName || (req.user && req.user.role === 'user' ? req.user.name : 'Guest'),
            patientPhone: patientPhone || '',
            patientEmail: patientEmail || '',
            adminId: assignedHR || null,
            hrId: assignedHR || null,
            slotId: slotId || null,
            serviceId: serviceId || null,
            formData: parsedFormData || {},
            manualTime: manualTime || (slot ? slot.startTime : ''),
            manualDate: manualDate || (slot ? slot.date : ''),
            type: normalizedType || 'general',
            purposeType: purposeType || 'service',
            purpose: purpose || notes || 'Appointment',
            extra: parsedExtra,
            notes,
            status: 'pending',
            clientId,
            city: city || '',
            address: address || '',
            booking_type: booking_type || 'online',
            resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : ''
        });

        await appointment.save();

        if (slot) {
            slot.isBooked = true;
            await slot.save();
        }

        // Notify HR
        if (assignedHR) {
            const newNotification = new Notification({
                userId: assignedHR,
                message: `New booking from ${patientName || 'Guest'} received for ${manualDate || 'TBD'} at ${manualTime || 'TBD'}.`
            });
            await newNotification.save();
        }

        res.status(201).json(appointment);
    } catch (err) {
        console.error('❌ BOOKING ERROR:', err);
        res.status(500).json({ message: 'Booking server error', error: err.message });
    }
});

// Get User Appointments (Refined for Roles & Tenants)
router.get('/my-appointments', [auth, tenantGuard], async (req, res) => {
    try {
        let query = { ...req.tenantFilter };
        const role = req.user.role.toLowerCase();
        if (role === 'user') {
            // Standard customer only sees their own bookings
            query.userId = req.user.id;
        } else if (role === 'client' || role === 'admin' || role === 'super-admin') {
            // Owners/Admins see all appointments in their tenant
            // req.tenantFilter already handles { clientId: ... }
        } else {
            // HR, Employee, Doctor, Professional roles
            // Show them anything directly assigned to them OR matching their department
            let conditions = [
                { hrId: req.user.id }, 
                { adminId: req.user.id }
            ];
            
            if (req.user.department && req.user.department !== 'all') {
                const dept = req.user.department;
                if (dept === 'hospital' || dept === 'medical') {
                    conditions.push({ type: 'hospital' }, { type: 'medical' }, { purposeType: 'doctor' });
                } else {
                    conditions.push({ purposeType: dept }, { type: dept });
                }
            }
            query.$or = conditions;
            // Also ensure we match the tenant even with the OR condition
            // In Mongo { a:1, $or: [...] } means a:1 AND (OR condition)
        }

        const appointments = await Appointment.find(query)
            .populate('userId', 'name email phone')
            .populate('adminId', 'name email phone')
            .populate('hrId', 'name email phone')
            .populate('slotId')
            .populate('clientId', 'organizationName sector')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Assign HR to Appointment (Admin Only)
router.patch('/:id/assign', auth, authorize('admin'), async (req, res) => {
    try {
        const { hrId } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { hrId, status: 'approved' }, 
            { new: true }
        ).populate('hrId', 'name email');
        
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.userId) {
            const newNotification = new Notification({
                userId: appointment.userId,
                message: `Your appointment has been approved and HR has been assigned.`
            });
            await newNotification.save();
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update Status (HR or Admin)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, feedback, rating } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        
        // Authorization: Admin, HR, Client (owner), or the Assigned Professional
        const isStaff = ['admin', 'hr', 'super-admin', 'doctor', 'interviewer', 'service', 'employee'].includes(req.user.role);
        const isOwnerClient = req.user.role === 'client' && appointment.clientId?.toString() === req.user.clientId?.toString();

        if (!isStaff && !isOwnerClient) {
            // User can only cancel their own appointment
            if (req.user.role === 'user' && appointment.userId?.toString() === req.user.id && status === 'cancelled') {
                // Allow user to cancel
            } else {
                return res.status(403).json({ message: 'Unauthorized status update' });
            }
        }

        const oldStatus = appointment.status;
        appointment.status = status;
        if (feedback) appointment.feedback = feedback;
        if (rating) appointment.rating = rating;
        
        await appointment.save();

        if (status !== oldStatus && appointment.userId) {
            let msg = `Your appointment status has been updated to ${status}.`;
            if (status === 'confirmed') msg = `Your appointment has been CONFIRMED by the provider.`;
            if (status === 'ongoing') msg = `Your session is now LIVE. Please join the meeting!`;
            if (status === 'completed') msg = `Your session has been marked as COMPLETED. Thank you for your visit!`;

            const newNotification = new Notification({
                userId: appointment.userId,
                message: msg
            });
            await newNotification.save();
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Manual Meeting Link Override (Admin, HR, Client & User)
router.patch('/:id/link', auth, authorize(['admin', 'hr', 'user', 'client']), async (req, res) => {
    try {
        const { meetingLink, meetingType, status } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // If not admin/hr, user must be the owner
        if (req.user.role !== 'admin' && req.user.role !== 'hr') {
            if (appointment.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Forbidden: You can only update your own appointment link' });
            }
        }

        if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
        if (meetingType !== undefined) appointment.meetingType = meetingType;
        if (status !== undefined) appointment.status = status; // Optionally let them set status to accepted

        await appointment.save();

        if (appointment.userId) {
            const newNotification = new Notification({
                userId: appointment.userId,
                message: `Meeting link updated: Join via ${meetingType?.toUpperCase() || 'Meeting link'}.`
            });
            await newNotification.save();
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Advanced Analytics Stats (Admin Only)
router.get('/stats/analytics', auth, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        
        // 1. Status Breakdown
        const statusBreakdown = await Appointment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 2. Department Breakdown
        const deptBreakdown = await Appointment.aggregate([
            { $group: { _id: "$purposeType", count: { $sum: 1 } } }
        ]);

        // 3. User Role Distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // 4. Historical Trends (Last 7 Days)
        const historicalTrends = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = await Appointment.countDocuments({
                createdAt: { 
                    $gte: new Date(dateStr + "T00:00:00.000Z"),
                    $lte: new Date(dateStr + "T23:59:59.999Z")
                }
            });
            historicalTrends.push({ date: dateStr, count });
        }

        // Keep mock peak times for UI bar chart compatibility
        const peakTimes = [
            { hour: '10 AM', count: 12 },
            { hour: '11 AM', count: 18 },
            { hour: '02 PM', count: 15 },
            { hour: '04 PM', count: 9 }
        ];

        res.json({ 
            totalUsers, 
            totalAppointments, 
            statusBreakdown, 
            deptBreakdown, 
            roleDistribution, 
            historicalTrends,
            peakTimes 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Accept Appointment (Admin or HR)
router.patch('/:id/accept', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'hr') return res.status(403).json({ message: 'Forbidden' });
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).populate('userId', 'name email');
        if (!appointment) return res.status(404).json({ message: 'Not found' });
        if (appointment.userId) {
            await Notification.create({ userId: appointment.userId, message: `✅ Your appointment has been approved!` });
        }
        res.json(appointment);
    } catch (err) { 
        console.error('Accept Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message }); 
    }
});

// Reject Appointment (Admin or HR)
router.patch('/:id/reject', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'hr') return res.status(403).json({ message: 'Forbidden' });
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).populate('userId', 'name email');
        if (!appointment) return res.status(404).json({ message: 'Not found' });
        if (appointment.userId) {
            await Notification.create({ userId: appointment.userId, message: `❌ Your appointment has been rejected. Please book a new slot.` });
        }
        res.json(appointment);
    } catch (err) { 
        console.error('Reject Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message }); 
    }
});

// Professional/Hospital Specific Update (Doctor, Interviewer, Service, Employee or Admin)
router.patch('/:id/hospital-update', auth, authorize(['admin', 'hr', 'doctor', 'interviewer', 'service', 'employee']), async (req, res) => {
    try {
        const { consultationType, location, meetingLink, status, hrId } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (consultationType) {
            appointment.extra = { ...appointment.extra, consultationType };
        }
        if (location) {
            appointment.extra = { ...appointment.extra, location };
        }
        if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
        if (hrId) appointment.hrId = hrId; // Used as Doctor ID
        if (status) appointment.status = status;

        await appointment.save();

        if (appointment.userId) {
            const newNotification = new Notification({
                userId: appointment.userId,
                message: `Your appointment details have been updated by the hospital staff.`
            });
            await newNotification.save();
        }

        res.json(appointment);
    } catch (err) {
        console.error('Hospital Update Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get Patient History (Tenant isolated)
router.get('/patient/:userId', [auth, tenantGuard], authorize(['admin', 'hr', 'doctor', 'interviewer', 'service']), async (req, res) => {
    try {
        if (!isValidId(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }
        const appointments = await Appointment.find({ ...req.tenantFilter, userId: req.params.userId })
            .populate('hrId', 'name email phone')
            .populate('clientId', 'organizationName sector')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE api/appointments/:id
// @desc    Delete appointment (Tenant isolated)
// @access  Private (Admin/HR/Client)
router.delete('/:id', [auth, tenantGuard], async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID format' });
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Ensure tenant isolation
        if (appointment.clientId?.toString() !== req.user.clientId?.toString()) {
            return res.status(403).json({ message: 'Unauthorized removal' });
        }

        await appointment.deleteOne();
        res.json({ message: 'Appointment record successfully removed' });
    } catch (err) {
        console.error('❌ DELETE APPOINTMENT ERROR:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/appointments/:id/rate
// @desc    User submits a star rating + feedback after service completed
// @access  Private (User only)
router.post('/:id/rate', auth, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Only the appointment owner can rate
        if (appointment.userId?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the booking user can submit a rating' });
        }
        if (appointment.status !== 'completed') {
            return res.status(400).json({ message: 'You can only rate completed appointments' });
        }

        appointment.rating = rating;
        appointment.feedback = feedback || '';
        await appointment.save();

        // Update staff's average rating and completedJobs
        const staffId = appointment.adminId || appointment.hrId;
        if (staffId) {
            const allRatings = await Appointment.find({ 
                $or: [{ adminId: staffId }, { hrId: staffId }],
                rating: { $gt: 0 }
            }).select('rating');
            const avg = allRatings.reduce((sum, a) => sum + a.rating, 0) / allRatings.length;
            await User.findByIdAndUpdate(staffId, { 
                averageRating: Math.round(avg * 10) / 10,
                completedJobs: await Appointment.countDocuments({ 
                    $or: [{ adminId: staffId }, { hrId: staffId }], 
                    status: 'completed' 
                })
            });
        }

        res.json({ success: true, message: 'Thank you for your feedback!', appointment });
    } catch (err) {
        console.error('Rate error:', err);
        res.status(500).json({ message: 'Server error submitting rating' });
    }
});

module.exports = router;
