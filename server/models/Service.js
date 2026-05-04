const mongoose = require('mongoose');

/**
 * Universal Service Model
 * 
 * The system does NOT know if this is a hospital, school, or shop.
 * It only knows it is a "Service" with configurable fields.
 * The client defines what fields their users must fill via customFields[].
 */

const customFieldSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
        // e.g. "Patient Name", "Course Interested", "Bike Model"
    },
    fieldKey: {
        type: String,
        required: true,
        trim: true
        // e.g. "patientName", "courseInterested", "bikeModel"
        // Used as the key when storing form responses
    },
    fieldType: {
        type: String,
        enum: ['text', 'number', 'email', 'phone', 'textarea', 'file', 'dropdown', 'date'],
        default: 'text'
    },
    options: {
        type: [String],
        default: []
        // Only relevant when fieldType === 'dropdown'
        // e.g. ["General", "Specialist", "Emergency"]
    },
    required: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: ''
    }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true
        // e.g. "Doctor Appointment", "Interview Round 1", "Bike Service"
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 30
        // Duration in minutes — used for slot allocation
    },
    category: {
        type: String,
        default: 'General'
        // Free-text category set by client: "Medical", "HR", "Automotive", "Education", etc.
    },

    // 🔥 THE CORE — Dynamic Form Fields
    // Clients define what their users must fill when booking this service
    customFields: {
        type: [customFieldSchema],
        default: []
    },

    // Tenant isolation
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // The HR/Admin who created this service
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
