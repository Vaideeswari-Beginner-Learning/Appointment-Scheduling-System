const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { directConnection: true });
        console.log('Connected to MongoDB');

        const email = 'info@forgeindia.com';
        const password = 'Forgeindia@09';
        const salt = await bcrypt.genSalt(10);
        const hashedHeader = await bcrypt.hash(password, salt);

        // Find existing or create new
        let admin = await User.findOne({ role: { $in: ['admin', 'super-admin'] } });
        
        if (admin) {
            console.log('Found existing admin, updating email, password, and ensuring super-admin role...');
            admin.email = email;
            admin.password = password; // The pre-save hook in User.js will hash this
            admin.role = 'super-admin';
            await admin.save();
        } else {
            console.log('No admin found, creating new...');
            admin = new User({
                name: 'Forge Super Admin',
                email: email,
                password: password,
                role: 'super-admin'
            });
            await admin.save();
        }

        console.log('Admin credentials updated successfully!');
        process.exit();
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
};

updateAdmin();
