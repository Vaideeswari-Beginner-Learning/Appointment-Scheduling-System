const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requirement'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        default: ''
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'rejected', 'hired'],
        default: 'applied'
    },
    skills: [String],
    role: {
        type: String,
        required: true,
        default: 'General Position'
    },
    hrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    aiAnalysis: {
        score: { type: Number, default: 0 },
        summary: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'analyzed'], default: 'pending' }
    },
    source: {
        type: String, // LinkedIn, Walk-in, Referral
        default: 'Online Portal'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
