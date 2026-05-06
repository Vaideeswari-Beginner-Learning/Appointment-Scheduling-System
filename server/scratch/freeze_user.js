const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const freezeUser = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment-system';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const email = 'pooja@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            // Create user if not exists for testing purposes? 
            // The user provided credentials so they probably exist.
            process.exit(0);
        }

        user.isBlocked = true;
        await user.save();

        console.log(`Successfully frozen account: ${email}`);
        console.log(`User ID: ${user._id}`);
        console.log(`isBlocked: ${user.isBlocked}`);

        process.exit(0);
    } catch (error) {
        console.error('Error freezing user:', error);
        process.exit(1);
    }
};

freezeUser();
