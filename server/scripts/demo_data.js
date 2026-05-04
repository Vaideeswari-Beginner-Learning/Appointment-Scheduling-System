const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Slot = require('../models/Slot');
const Appointment = require('../models/Appointment');

const seedDemoData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { directConnection: true });
        console.log('Connected to MongoDB');

        // Clear existing demo-style data if any
        await Slot.deleteMany({});
        await Appointment.deleteMany({});

        const admin = await User.findOne({ role: 'admin' });
        const hr = await User.findOne({ role: 'hr' });
        const user = await User.findOne({ role: 'user' });

        if (!admin || !hr || !user) {
            console.error('Please run seed.js first to create users!');
            process.exit(1);
        }

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        // 1. Create Slots
        const slots = [
            { adminId: admin._id, date: today, startTime: '10:00 AM', endTime: '11:00 AM', type: 'interview' },
            { adminId: admin._id, date: today, startTime: '02:00 PM', endTime: '03:00 PM', type: 'general' },
            { adminId: admin._id, date: tomorrow, startTime: '09:00 AM', endTime: '10:00 AM', type: 'interview' }
        ];

        const createdSlots = await Slot.insertMany(slots);
        console.log('Slots Created');

        // 2. Create Appointments
        const appointments = [
            {
                userId: user._id,
                adminId: admin._id,
                hrId: hr._id,
                slotId: createdSlots[0]._id,
                status: 'approved',
                type: 'interview',
                notes: 'Senior Frontend Developer Interview',
                meetingLink: 'https://meet.google.com/fit-demo-shs'
            },
            {
                userId: user._id,
                adminId: admin._id,
                slotId: createdSlots[1]._id,
                status: 'pending',
                type: 'general',
                notes: 'Consultation about project scope',
                meetingLink: 'https://meet.google.com/fit-demo-abc'
            }
        ];

        await Appointment.insertMany(appointments);
        
        // Mark first two slots as booked
        createdSlots[0].isBooked = true;
        createdSlots[1].isBooked = true;
        await createdSlots[0].save();
        await createdSlots[1].save();

        console.log('Demo Data Seeded!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDemoData();
