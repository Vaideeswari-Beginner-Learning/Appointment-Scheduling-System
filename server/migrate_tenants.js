require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Slot = require('./models/Slot');
const Announcement = require('./models/Announcement');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Find or create a default client
        let defaultClient = await User.findOne({ email: 'defaultclient@forgeindia.com' });
        if (!defaultClient) {
            defaultClient = new User({
                name: 'Default Client',
                email: 'defaultclient@forgeindia.com',
                password: 'password123', // Just a placeholder
                role: 'client',
                isApproved: true
            });
            await defaultClient.save();
            defaultClient.clientId = defaultClient._id;
            await defaultClient.save();
            console.log("Created Default Client");
        } else {
            if (!defaultClient.clientId) {
                defaultClient.clientId = defaultClient._id;
                await defaultClient.save();
            }
        }

        const clientId = defaultClient._id;

        // Update all users (except super-admin and the default client itself) that have no clientId
        await User.updateMany(
            { clientId: null, role: { $ne: 'super-admin' }, _id: { $ne: clientId } },
            { $set: { clientId: clientId } }
        );
        console.log("Updated Users");

        // Update Appointments
        await Appointment.updateMany(
            { clientId: null },
            { $set: { clientId: clientId } }
        );
        console.log("Updated Appointments");

        // Update Slots
        await Slot.updateMany(
            { clientId: null },
            { $set: { clientId: clientId } }
        );
        console.log("Updated Slots");

        // Update Announcements
        await Announcement.updateMany(
            { clientId: null },
            { $set: { clientId: clientId } }
        );
        console.log("Updated Announcements");

        console.log("Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration Failed", err);
        process.exit(1);
    }
}

migrate();
