require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function findAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = await User.find({ role: { $in: ['super-admin', 'client'] } }, 'name email role userType');
        console.log('--- ADMIN USERS ---');
        admins.forEach(u => {
            console.log(`[${u.role}] ${u.name} - ${u.email}`);
        });
        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

findAdmins();
