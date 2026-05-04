const mongoose = require('mongoose');

const saasRequestSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientName: String,
    clientEmail: String,
    type: {
        type: String,
        enum: ['training', 'full_access', 'extend_trial', 'upgrade_plan'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    message: String,
    sector: String
}, {
    timestamps: true
});

module.exports = mongoose.model('SaaSRequest', saasRequestSchema);
