const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'hr', 'client', 'doctor', 'service'], default: 'user' }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { directConnection: true });
        console.log('Connected to MongoDB');

        const users = [
            { name: 'Admin User', email: 'admin@gmail.com', password: 'admin123', role: 'admin' },
            { name: 'HR Interviewer', email: 'hr@gmail.com', password: 'hr123', role: 'hr' },
            { name: 'Regular User', email: 'user@gmail.com', password: 'user123', role: 'user' }
        ];

        for (let u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const hashedPassword = bcrypt.hashSync(u.password, 10);
                const newUser = new User({ ...u, password: hashedPassword });
                await newUser.save();
                console.log(`Created: ${u.email}`);
            } else {
                console.log(`Exists: ${u.email}`);
            }
        }

        console.log('Seeding complete!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedUsers();
