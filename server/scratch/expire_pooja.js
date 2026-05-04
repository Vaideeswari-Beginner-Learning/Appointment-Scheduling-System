const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false
        });
        console.log('Connected');

        const email = 'pooja@gmail.com';
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found. Creating a test account for you...`);
            user = new User({
                name: 'Pooja Test',
                email: email,
                password: 'password123',
                role: 'client',
                userType: 'client'
            });
            await user.save();
            user.clientId = user._id;
            await user.save();
        }

        const expiredDate = new Date();
        expiredDate.setHours(expiredDate.getHours() - 25); // 1 day and 1 hour ago

        user.plan = {
            type: 'free',
            status: 'active',
            expiryDate: expiredDate,
            maxHr: 2,
            maxEmployees: 10
        };

        await user.save();
        console.log(`POOJA_EXPIRED_SUCCESS: ${email} is now expired.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
