const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const fixEmails = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-sched');
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        let updatedCount = 0;
        for (const user of users) {
            if (user.email) {
                const lowerEmail = user.email.trim().toLowerCase();
                if (user.email !== lowerEmail) {
                    user.email = lowerEmail;
                    await user.save();
                    updatedCount++;
                }
            }
        }

        console.log(`Done! Updated ${updatedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixEmails();
