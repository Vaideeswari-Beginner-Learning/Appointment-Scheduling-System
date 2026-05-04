const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // 🔥 Universal SaaS — link booking to a specific service
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        default: null
    },
    // 🔥 Dynamic form data — stores responses to the service's customFields
    // e.g. { patientName: 'John', symptoms: 'Headache', age: 25 }
    formData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for offline walk-ins
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional — assigned later when HR is added
        default: null
    },
    hrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: false // Optional for manual bookings
    },
    manualTime: {
        type: String,
        default: ''
    },
    manualDate: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'approved', 'rejected', 'completed', 'cancelled', 'accepted', 'ongoing'],
        default: 'pending'
    },
    rating: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ''
    },
    purpose: {
        type: String,
        default: ''
    },
    purposeType: {
        type: String,
        enum: ['interview', 'meeting', 'doctor', 'hotel', 'service', 'vehicle', 'hospital'],
        default: 'interview'
    },
    type: {
        type: String,
        enum: ['general', 'interview', 'medical', 'consultation', 'hospitality', 'automotive'],
        default: 'general'
    },
    extra: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    interviewQuestions: [{
        type: String
    }],
    notes: {
        type: String,
        default: ''
    },
    meetingLink: {
        type: String,
        default: ''
    },
    meetingType: {
        type: String,
        enum: ['zoom', 'meet'],
        default: 'meet'
    },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    // Hospital Module Additions
    patientName: { type: String, default: '' },
    patientPhone: { type: String, default: '' },
    patientEmail: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    doctorType: { type: String, default: '' }, // e.g. Dentist, General
    hospitalType: { type: String, default: 'hospital' },
    booking_type: { 
        type: String, 
        enum: ['online', 'offline'], 
        default: 'online' 
    },
    role: {
        type: String,
        default: ''
    },
    aiAnalysis: {
        score: { type: Number, default: 0 },
        summary: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'analyzed'], default: 'pending' }
    },
    payment: {
        status: { type: String, enum: ['unpaid', 'paid', 'refunded', 'failed'], default: 'unpaid' },
        method: { type: String, default: '' }, // 'upi', 'card', 'cash'
        transactionId: { type: String, default: '' },
        amount: { type: Number, default: 0 },
        paidAt: { type: Date, default: null }
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
