const mongoose = require('mongoose');
require('dotenv').config();
const Appointment = require('../models/Appointment');
const User = require('../models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Simulate Sham being logged in
        const shamId = '69cfa8ce031740381d566b8e';
        const clientId = '69cf7f9996df06bc3d7461d3';
        
        let query = { clientId: clientId };
        let conditions = [
            { hrId: shamId }, 
            { adminId: shamId }
        ];
        
        query.$or = conditions;
        
        console.log('Final Query:', JSON.stringify(query, null, 2));
        
        const appointments = await Appointment.find(query);
        console.log(`Found ${appointments.length} appointments for Sham.`);
        
        appointments.forEach(a => {
            console.log(`App: ${a._id} | Status: ${a.status} | Patient: ${a.patientName}`);
        });
        
        // Also check if they can be found WITHOUT clientId in query
        const anyApps = await Appointment.find({ $or: conditions });
        console.log(`\nFound ${anyApps.length} appointments globally for Sham.`);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
