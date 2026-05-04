const mongoose = require('mongoose');
require('dotenv').config();
const Slot = require('./models/Slot');
const User = require('./models/User');

const pad = n => String(n).padStart(2, '0');
const toDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

mongoose.connect(process.env.MONGODB_URI, { directConnection: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) { console.error('No admin found.'); process.exit(1); }

        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

        const slots = [
            { date: toDateStr(today),    startTime: '10:00 AM', endTime: '10:45 AM' },
            { date: toDateStr(today),    startTime: '11:30 AM', endTime: '12:15 PM' },
            { date: toDateStr(today),    startTime: '02:00 PM', endTime: '02:45 PM' },
            { date: toDateStr(today),    startTime: '04:00 PM', endTime: '04:45 PM' },
            { date: toDateStr(tomorrow), startTime: '09:30 AM', endTime: '10:15 AM' },
            { date: toDateStr(tomorrow), startTime: '01:00 PM', endTime: '01:45 PM' },
            { date: toDateStr(tomorrow), startTime: '03:30 PM', endTime: '04:15 PM' },
            { date: toDateStr(dayAfter), startTime: '11:00 AM', endTime: '11:45 AM' },
            { date: toDateStr(dayAfter), startTime: '02:30 PM', endTime: '03:15 PM' },
        ].map(s => ({ ...s, adminId: admin._id, isBooked: false }));

        const result = await Slot.insertMany(slots);
        console.log(`✅ Seeded ${result.length} slots!`);
        console.log('Today:', toDateStr(today));
        process.exit();
    })
    .catch(err => { console.error('Error:', err.message); process.exit(1); });
