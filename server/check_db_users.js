require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- USER LIST ---');
        const users = await User.find({}, 'name email role userType isApproved isBlocked').limit(20);
        users.forEach(u => {
            console.log(`[${u.role}] Name: ${u.name}, Email: ${u.email || 'N/A'}, Type: ${u.userType}, Approved: ${u.isApproved}, Blocked: ${u.isBlocked}`);
        });
        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

checkUsers();
