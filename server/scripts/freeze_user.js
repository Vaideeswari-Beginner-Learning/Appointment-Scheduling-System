const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const freezeAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-system');
        
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Set to yesterday
        
        const result = await User.findOneAndUpdate(
            { email: 'sathya@gmail.com' },
            { 
                $set: { 
                    'plan.status': 'expired', 
                    'plan.expiryDate': pastDate 
                } 
            },
            { new: true }
        );

        if (result) {
            console.log('✅ Account Frozen Successfully:');
            console.log('Email:', result.email);
            console.log('Plan Status:', result.plan.status);
            console.log('Expiry Date:', result.plan.expiryDate);
        } else {
            console.log('❌ User not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error freezing account:', error);
        process.exit(1);
    }
};

freezeAccount();
