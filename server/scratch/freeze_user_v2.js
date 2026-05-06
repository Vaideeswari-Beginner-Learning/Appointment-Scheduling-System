const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const freezeUserCorrectly = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment-system';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const email = 'pooja@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(0);
        }

        // Unblock (so they can login)
        user.isBlocked = false;
        
        // Freeze plan (to trigger payment/expired UI)
        if (!user.plan) user.plan = {};
        user.plan.status = 'expired';
        user.plan.expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

        await user.save();

        console.log(`Successfully "frozen" account (Plan Expired): ${email}`);
        console.log(`isBlocked: ${user.isBlocked}`);
        console.log(`Plan Status: ${user.plan.status}`);
        console.log(`Expiry Date: ${user.plan.expiryDate}`);

        process.exit(0);
    } catch (error) {
        console.error('Error freezing user:', error);
        process.exit(1);
    }
};

freezeUserCorrectly();
