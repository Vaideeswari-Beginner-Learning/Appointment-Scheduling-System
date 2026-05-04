const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
    email: String,
    role: String
});

const User = mongoose.model('User', UserSchema);

async function checkAdminAccount() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/appointment-system');
        console.log('Connected to MongoDB');

        const users = await User.find({ role: /admin/i });
        console.log('Found Admin-like accounts:', JSON.stringify(users, null, 2));

        const allRoles = await User.distinct('role');
        console.log('All unique roles in DB:', allRoles);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAdminAccount();
