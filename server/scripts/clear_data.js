const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Since it's run from server/ dir

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Slot = require('../models/Slot');
const Client = require('../models/Client');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const Requirement = require('../models/Requirement');
const Announcement = require('../models/Announcement');

const clearDatabase = async () => {
    try {
        console.log('Connecting to database...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected.');

        // Delete all users except Super Admin
        const deletedUsers = await User.deleteMany({ role: { $ne: 'super-admin' } });
        console.log(`Deleted ${deletedUsers.deletedCount} non-admin users.`);

        // Empty other collections entirely
        const deletedOps = await Promise.all([
            Appointment.deleteMany({}),
            Service.deleteMany({}),
            Slot.deleteMany({}),
            Client.deleteMany({}),
            Candidate.deleteMany({}),
            Notification.deleteMany({}),
            Requirement.deleteMany({}),
            Announcement.deleteMany({})
        ]);

        console.log('Cleared all appointments, services, slots, clients, notifications, etc.');

        // Create a new fresh super admin if one doesn't exist
        const superAdminExists = await User.findOne({ role: 'super-admin' });
        if (!superAdminExists) {
            console.log('No super-admin found! Creating a default one. admin@forgeindiaconnect.com');
            const admin = new User({
                name: 'Super Admin',
                email: 'admin@forgeindiaconnect.com',
                password: 'password123',
                role: 'super-admin',
                userType: 'super-admin',
                isApproved: true
            });
            await admin.save();
        }

        console.log('Database successfully refreshed! Only the Super Admin remains.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabase();
