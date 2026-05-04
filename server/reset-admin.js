require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const resetAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const email = 'info@forgeindia.com';
        const newPassword = 'Forgeindia@09';

        let user = await User.findOne({ email });
        if (user) {
            console.log(`Found user: ${user.email}. Role: ${user.role}. Standardizing password...`);
            user.password = newPassword;
            await user.save();
            console.log('✅ Password successfully reset using model hashing.');
        } else {
            console.log('❌ User not found!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

resetAdmin();
