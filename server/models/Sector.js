const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subCategories: [{
        type: String,
        trim: true
    }],
    icon: {
        type: String,
        default: '🏢'
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sector', sectorSchema);
