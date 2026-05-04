const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    count: {
        type: Number,
        default: 1
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'filled', 'on-hold', 'cancelled'],
        default: 'open'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Requirement', requirementSchema);
