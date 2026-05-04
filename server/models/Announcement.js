const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['normal', 'urgent', 'info'],
        default: 'normal'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetRole: {
        type: String,
        enum: ['hr', 'employee', 'all'],
        default: 'all'
    },
    targetDepartment: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '30d' } // Auto-cleanup after 30 days
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
