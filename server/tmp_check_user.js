require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'info@forgeindia.com';
        
        // 1. Delete existing user
        await User.deleteOne({ email });
        console.log("Deleted old user.");

        // 2. Create new user
        const user = new User({
            name: 'Super Admin',
            email: email,
            password: 'Forgeindia@09',
            role: 'super-admin'
        });
        await user.save();
        console.log("Created new user.");

        // 3. Verify immediately
        const fetchedUser = await User.findOne({ email });
        const isMatch = fetchedUser.comparePassword('Forgeindia@09');
        console.log("Does 'Forgeindia@09' match?", isMatch);
        console.log("Stored hash:", fetchedUser.password);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
checkAdmin();
