const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const onboardHR = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { directConnection: true });
        console.log('Connected to MongoDB');

        const hrAccounts = [
            { name: 'Vaideeswari HR', email: 'vaideeswarihr@gmail.com', password: 'HR@password123' },
            { name: 'Pooja HR', email: 'poojahr@gmail.com', password: 'HR@password123' }
        ];

        for (const account of hrAccounts) {
            let user = await User.findOne({ email: account.email });
            if (user) {
                console.log(`Found existing user ${account.email}, updating to HR role...`);
                user.role = 'hr';
                user.password = account.password;
                await user.save();
            } else {
                console.log(`Creating new HR account: ${account.email}`);
                user = new User({
                    name: account.name,
                    email: account.email,
                    password: account.password,
                    role: 'hr'
                });
                await user.save();
            }
        }

        console.log('HR Onboarding complete!');
        process.exit();
    } catch (err) {
        console.error('Onboarding failed:', err);
        process.exit(1);
    }
};

onboardHR();
