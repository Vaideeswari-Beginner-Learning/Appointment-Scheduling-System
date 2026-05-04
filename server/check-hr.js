const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');

const checkUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');
        console.log('Connected.');
        const users = await User.find({ role: 'hr' });
        console.log('--- HR USERS ---');
        if (users.length === 0) {
            console.log('No HR users found.');
        } else {
            users.forEach(u => console.log(`${u.name} (${u.email}) - Role: ${u.role}`));
        }
        
        const allUsers = await User.find().select('email role');
        console.log('\n--- ALL USERS (Emails & Roles only) ---');
        allUsers.forEach(u => console.log(`${u.email} - ${u.role}`));
        
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkUsers();
