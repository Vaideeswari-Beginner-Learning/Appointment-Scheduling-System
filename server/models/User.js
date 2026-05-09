const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false, // Optional for guest-originated users
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true // Allows multiple null/missing emails in unique index
    },
    password: {
        type: String,
        required: false // Optional for guest-originated users
    },
    role: {
        type: String,
        enum: ['super-admin', 'client', 'hr', 'employee', 'user', 'doctor', 'service', 'interviewer'],
        default: 'user'
    },
    phone: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    calendarToken: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: ''
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    availabilityStatus: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available'
    },
    experience: {
        type: Number, // Years of experience
        default: 0
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    department: {
        type: String,
        default: ''
    },
    specialty: {
        type: String, // e.g. Dentist, Surgeon, General
        default: ''
    },
    userType: {
        type: String,
        enum: ['client', 'interview', 'hospital', 'service', 'user'],
        default: 'user'
    },
    workingHours: {
        type: String, // e.g. "09:00 AM - 05:00 PM"
        default: ''
    },
    sectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sector',
        default: null
    },
    sector: {
        type: String,
        default: 'general'
    },
    subCategory: {
        type: String,
        default: ''
    },
    organizationName: {
        type: String,
        default: ''
    },
    organizationLogo: {
        type: String,
        default: ''
    },
    organizationDescription: {
        type: String,
        default: ''
    },
    organizationWebsite: {
        type: String,
        default: ''
    },
    organizationImages: {
        type: String, // Comma separated URLs
        default: ''
    },
    organizationStory: {
        type: String,
        default: ''
    },
    organizationPurpose: {
        type: String,
        default: ''
    },
    isApproved: {
        type: Boolean,
        default: true // Default to true, we'll set it to false for specific types in auth route
    },
    plan: {
        type: {
            type: String,
            enum: ['free', 'paid'],
            default: 'free'
        },
        maxHr: {
            type: Number,
            default: 2
        },
        maxEmployees: {
            type: Number,
            default: 10
        },
        maxBookings: {
            type: Number,
            default: 50
        },
        maxServices: {
            type: Number,
            default: 5
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active'
        },
        expiryDate: {
            type: Date,
            default: null
        },
        price: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
    if (!this.password || !candidatePassword) return false;
    return bcrypt.compareSync(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
