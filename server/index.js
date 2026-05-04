const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { initCron } = require('./services/cronService');

// Load environment variables IMMEDIATELY
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5002;

// Request logger for diagnostics
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Start sequence
const startApp = async () => {
    try {
        console.log('\n########################################');
        console.log('###    SMART SCHED SYSTEM LOUD V2    ###');
        console.log('########################################');
        
        // 1. Establish connection (with bufferCommands: false in db.js)
        await connectDB();

        // 2. Register Models
        const User = require('./models/User');
        const Slot = require('./models/Slot');
        const Appointment = require('./models/Appointment');
        console.log('✅ Models initialized');

        console.log('✅ Models initialized');

        // 3. Setup modular routes
        app.get('/api/ping', (req, res) => res.json({ status: 'API ALIVE', time: new Date().toLocaleTimeString() }));
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/slots', require('./routes/slots'));
        app.use('/api/appointments', require('./routes/appointments'));
        app.use('/api/users', require('./routes/users'));
        app.use('/api/analytics', require('./routes/analytics'));
        app.use('/api/notifications', require('./routes/notifications'));
        app.use('/api/sectors', require('./routes/sectors'));
        app.use('/api/hiring', require('./routes/hiring'));
        app.use('/api/services', require('./routes/services'));
        app.use('/api/announcements', require('./routes/announcements'));
        app.use('/api/saas', require('./routes/saas'));
        app.use('/api/chat', require('./routes/chat'));
        app.use('/api/payments', require('./routes/payments'));

        // 4. Start listening
        app.listen(PORT, () => {
            console.log(`🚀 SERVER ACTIVE ON PORT ${PORT}`);
            console.log('########################################\n');
            initCron();
        });
        
        // 5. Global Error Handler (Safety Net)
        app.use((err, req, res, next) => {
            const errorLog = `🚨 [${new Date().toISOString()}] ${req.method} ${req.url}\nError: ${err.message}\nStack: ${err.stack}\n\n`;
            console.error(errorLog);
            
            // Write to a file for persistent debugging
            const fs = require('fs');
            fs.appendFileSync(path.join(__dirname, 'server_error.log'), errorLog);

            res.status(500).json({
                success: false,
                message: 'A critical server error occurred. Please contact support.',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });

    } catch (error) {
        console.error('❌ FATAL STARTUP ERROR:', error.message);
        process.exit(1);
    }
};

startApp();
