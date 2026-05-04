const mongoose = require('mongoose');
const Slot = require('./models/Slot');

mongoose.connect('mongodb://127.0.0.1:27017/appointment-system')
    .then(async () => {
        try {
            console.log("Testing base slot...");
            const slot1 = new Slot({ 
                adminId: new mongoose.Types.ObjectId(), 
                date: '2026-03-31', 
                startTime: '10:22', 
                endTime: '11:22', 
                type: 'general' 
            });
            await slot1.validate();
            console.log("Slot 1 VALID!");

            console.log("\nTesting frontend payload slot...");
            const slot2 = new Slot({ 
                date: '2026-03-31', 
                startTime: '10:22', 
                type: 'general' 
            });
            await slot2.validate();
            console.log("Slot 2 VALID!");

        } catch(e) { 
            console.error("VALIDATION ERROR:", e.message); 
        }
        process.exit(0);
    });
