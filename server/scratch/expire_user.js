const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const expireUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/appointment_system');
        console.log('Connected to MongoDB');

        const email = 'pooja@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(0);
        }

        // Set expiry date to 24 hours ago
        const pastDate = new Date();
        pastDate.setHours(pastDate.getHours() - 24);

        user.plan = {
            ...user.plan,
            expiryDate: pastDate,
            status: 'active' // Even if active, expiryDate will trigger logic
        };

        await user.save();
        console.log(`Successfully expired plan for ${email}. Expiry set to: ${pastDate}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

expireUser();
