const mongoose = require('mongoose');
const path = require('path');
const User = require('./server/models/User');

const MONGO_URI = 'mongodb://localhost:27017/appointment-system';

async function checkUser() {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'vaidee@gmail.com' });
        if (!user) {
            console.log('User vaidee@gmail.com not found');
        } else {
            console.log('--- USER DATA ---');
            console.log('ID:', user._id);
            console.log('Role:', user.role);
            console.log('UserType:', user.userType);
            console.log('ClientId:', user.clientId);
            
            // Fix if clientId is missing and role is client
            if (user.role === 'client' && !user.clientId) {
                console.log('Updating clientId to self...');
                user.clientId = user._id;
                await user.save();
                console.log('Fixed clientId.');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
