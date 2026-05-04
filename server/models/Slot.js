const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    startTime: {
        type: String, // Format: HH:MM
        required: true
    },
    endTime: {
        type: String, // Format: HH:MM
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    professionalName: {
        type: String,
        default: ''
    },
    professionalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['general', 'interview', 'medical', 'consultation'],
        default: 'general'
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    bufferTime: {
        type: Number, // In minutes
        default: 15
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Slot', slotSchema);
