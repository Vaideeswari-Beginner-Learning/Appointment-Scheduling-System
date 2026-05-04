const mongoose = require('mongoose');
require('dotenv').config();
const Appointment = require('../models/Appointment');
const User = require('../models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const apps = await Appointment.find({}).sort({createdAt: -1}).limit(20);
        console.log(`Checking ${apps.length} recent appointments...`);
        
        for (let a of apps) {
            let ownerName = 'MISSING';
            let ownerRole = 'N/A';
            
            if (a.clientId) {
                const owner = await User.findById(a.clientId);
                if (owner) {
                    ownerName = owner.name;
                    ownerRole = owner.role;
                }
                console.log(`App: ${a._id} | ClientId: ${a.clientId} | Owner: ${ownerName} (${ownerRole}) | Status: ${a.status} | Patient: ${a.patientName}`);
            } else {
                console.log(`App: ${a._id} | ClientId: NULL | Patient: ${a.patientName}`);
            }
        }
        
        // Also check some HR users
        console.log('\nChecking some HR/Professional users...');
        const hrUsers = await User.find({ role: { $in: ['hr', 'doctor', 'employee', 'client'] } }).limit(10);
        for (let u of hrUsers) {
            console.log(`User: ${u._id} | Name: ${u.name} | Role: ${u.role} | Dept: ${u.department || 'NONE'} | ClientId: ${u.clientId}`);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
