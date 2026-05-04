const mongoose = require('mongoose');

async function diagnostic() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');
        console.log('Connected successfully!');

        const userSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('UserDiagnostic', userSchema, 'users');

        console.log('Attempting to find one user...');
        const user = await User.findOne();
        console.log('User found:', user ? user.email : 'No user found');

        process.exit(0);
    } catch (err) {
        console.error('Diagnostic failed:', err.message);
        process.exit(1);
    }
}

diagnostic();
