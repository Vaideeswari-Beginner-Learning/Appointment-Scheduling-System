require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'info@forgeindia.com';
        const password = 'Forgeindia@09';
        
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: 'Super Admin',
                email: email,
                password: password, 
                role: 'super-admin'
            });
            await user.save();
            console.log('✅ Admin user created successfully!');
        } else {
            console.log('ℹ️ Admin user already exists. Updating password just in case...');
            user.password = password;
            await user.save();
            console.log('✅ Admin password updated.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
createAdmin();
