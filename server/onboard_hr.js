const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const onboardHR = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for HR Onboarding');

        const hrAccounts = [
            {
                name: "Kumar (Hospital HR)",
                email: "kumar@hospital.com",
                password: "password123",
                role: "hr",
                department: "doctor" // or 'hospital' based on purposeType
            },
            {
                name: "Ravi (Recruitment HR)",
                email: "ravi@interview.com",
                password: "password123",
                role: "hr",
                department: "interview"
            },
            {
                name: "Priya (Service HR)",
                email: "priya@service.com",
                password: "password123",
                role: "hr",
                department: "service"
            }
        ];

        for (const account of hrAccounts) {
            const existing = await User.findOne({ email: account.email });
            if (existing) {
                console.log(`⚠️ HR ${account.email} already exists. Skipping.`);
                continue;
            }
            const newUser = new User(account);
            await newUser.save();
            console.log(`🚀 HR Created: ${account.name} | Dept: ${account.department}`);
        }

        console.log('\n--- SUCCESS: ALL HR ACCOUNTS ONBOARDED ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error onboarding HR:', err);
        process.exit(1);
    }
};

onboardHR();
