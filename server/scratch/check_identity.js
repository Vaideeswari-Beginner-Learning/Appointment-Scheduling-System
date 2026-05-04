const mongoose = require('mongoose');
const User = require('../models/User');
const db = require('../config/db');

console.log('Diagnostic Identity Check:');

async function test() {
    console.log('Mongoose version:', mongoose.version);
    
    // Connect
    await db();
    
    console.log('Connection readyState:', mongoose.connection.readyState);
    console.log('User model collection name:', User.collection.name);
    console.log('User model database name:', User.db.name);
    console.log('User model connection readyState:', User.db.readyState);
    
    try {
        console.log('Attempting User.findOne()...');
        const user = await User.findOne();
        console.log('Success! User found:', user ? user.email : 'None');
    } catch (err) {
        console.error('User.findOne() failed:', err.message);
    }
    
    process.exit(0);
}

test();
